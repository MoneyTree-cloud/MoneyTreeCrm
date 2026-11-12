/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Container, Row, Col, Label, Card, CardBody } from 'reactstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from '../../components/Common/AppSelect';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaArrowLeft, FaEye, FaTimes } from 'react-icons/fa';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient from '../../helpers/api_helper';
import { useGet } from '../../Hooks/useApi';
import { defaultTheme } from '../../helpers/defaultTheme';
import { RequiredStar } from '../../helpers/function_helper';
import {
    CREATE_NFA_MASTER,
    GET_DROPDOWN_BUILDER_,
    GET_PROJECT_BY_BUILDER_,
    GET_SLAB_BY_PROJECT,
    UPDATE_NFA_MASTER,
} from '../../helpers/url_helper';
import { useUserStore } from '../../store/useUserStore';
import { imageBaseUrl } from '../../helpers/api_helper';
import { getFileIcon } from '../../constants/global';
import { getNfaFile, isNfaEditable } from './NFAMaster';

const inputStyle = { borderRadius: 8, fontSize: 13 };
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const FILE_ACCEPT = '.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx';

const selectStyles = {
    control: (base) => ({ ...base, borderRadius: 8, fontSize: 13 }),
    option: (base) => ({ ...base, fontSize: 13 }),
};

// API keeps every NFA value as text
const TEXT_FIELDS = [
    'masterPlan', 'totalSlab', 'sms', 'mtSlab', 'marketing',
    'teamIncentive', 'incentiveStatus', 'incentiveBd', 'remarks',
];

const toOption = (label, value) => (value != null && value !== '' ? { label: label ?? String(value), value } : null);

// slab dropdown rows -> { label, value }, whatever key names the API uses
const toSlabOption = (o) => {
    const value = o?.value ?? o?.slabId ?? o?.id;
    return { label: o?.label ?? o?.slabName ?? o?.name ?? String(value), value };
};

// builder / project come nested in the list response ("bulderName" is the API's spelling)
const buildInitialForm = (rowData) => ({
    builder: toOption(rowData?.builderMaster?.bulderName, rowData?.builderMaster?.builderId),
    project: toOption(rowData?.projectMaster?.projectName, rowData?.projectMaster?.mappingId),
    // the selected slab is saved as the NFA ID
    slab: toOption(rowData?.nfaId, rowData?.nfaId),
    ...Object.fromEntries(TEXT_FIELDS.map((f) => [f, rowData?.[f] != null ? String(rowData[f]) : ''])),
});

// ── Section heading ─────────────────────────────────────────────────────────
function SectionTitle({ children }) {
    return (
        <div style={{
            fontSize: 12, fontWeight: 800, color: defaultTheme.primary,
            textTransform: 'uppercase', letterSpacing: '.04em',
            marginBottom: 10, marginTop: 6,
            display: 'flex', alignItems: 'center', gap: 8,
        }}>
            <span style={{ width: 4, height: 14, background: defaultTheme.primary, borderRadius: 2 }} />
            {children}
        </div>
    );
}

// file name + icon, opens the file in a new tab
function FileChip({ name, href, tag, onRemove }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
            border: '1px solid #E2E8F0', borderRadius: 8, background: '#F8FAFC',
        }}>
            {getFileIcon(name)}
            <a href={href} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: defaultTheme.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                title={`Preview ${name}`}>
                {name.split('/').pop()}
            </a>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', background: '#E2E8F0', padding: '1px 8px', borderRadius: 20 }}>
                {tag}
            </span>
            <a href={href} target="_blank" rel="noopener noreferrer" title="Preview" style={{ color: defaultTheme.primary, display: 'flex' }}>
                <FaEye size={15} />
            </a>
            {onRemove && (
                <FaTimes size={13} style={{ cursor: 'pointer', color: defaultTheme.redColor }} onClick={onRemove} title="Remove" />
            )}
        </div>
    );
}

function Field({ label, required, md = 4, children }) {
    return (
        <Col md={md}>
            <Label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {label} {required && <RequiredStar />}
            </Label>
            {children}
        </Col>
    );
}

export default function NFAMasterForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId, userName, empCode } = useUserStore((state) => state.user);
    const { rowData } = location.state || {};
    const isEdit = Boolean(rowData?.id);
    const editExpired = isEdit && !isNfaEditable(rowData);

    const [form, setForm] = useState(buildInitialForm(rowData));
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const existingFile = getNfaFile(rowData);

    // local preview link for the newly picked file
    const pickedFileUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
    useEffect(() => () => { if (pickedFileUrl) URL.revokeObjectURL(pickedFileUrl); }, [pickedFileUrl]);

    const { data: builderList, isLoading: buildersLoading } = useGet(GET_DROPDOWN_BUILDER_);
    const { data: projectList, isLoading: projectsLoading } = useGet(
        `${GET_PROJECT_BY_BUILDER_}${form.builder?.value}`,
        { enabled: Boolean(form.builder?.value) }
    );
    const { data: slabList, isLoading: slabsLoading } = useGet(
        `${GET_SLAB_BY_PROJECT}${form.project?.value}`,
        { enabled: Boolean(form.project?.value) }
    );
    const slabOptions = (Array.isArray(slabList?.data?.data) ? slabList.data.data : []).map(toSlabOption);

    // Edit: the list may only send ids — show the dropdown labels once options load
    useEffect(() => {
        const match = builderList?.data?.data?.find((o) => o.value === form.builder?.value);
        if (match && match.label !== form.builder?.label) setForm((prev) => ({ ...prev, builder: match }));
    }, [builderList]);

    useEffect(() => {
        const match = projectList?.data?.data?.find((o) => o.value === form.project?.value);
        if (match && match.label !== form.project?.label) setForm((prev) => ({ ...prev, project: match }));
    }, [projectList]);

    useEffect(() => {
        const match = slabOptions.find((o) => String(o.value) === String(form.slab?.value));
        if (match && match.label !== form.slab?.label) setForm((prev) => ({ ...prev, slab: match }));
    }, [slabList]);

    const handleFieldChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    // Changing a parent dropdown clears its dependents
    const handleBuilderChange = (opt) => {
        setForm((prev) => ({ ...prev, builder: opt, project: null, slab: null }));
    };

    const handleProjectChange = (opt) => {
        setForm((prev) => ({ ...prev, project: opt, slab: null }));
    };

    // multipart: every field as its own part, the attachment under "file"
    const buildPayload = () => {
        const fields = {
            id: isEdit ? rowData.id : 0,
            builderId: form.builder?.value,
            projectId: form.project?.value,
            nfaId: String(form.slab?.value ?? ''),
            ...Object.fromEntries(TEXT_FIELDS.map((f) => [f, form[f].trim()])),
            status: rowData?.status || 'YES',
            createdBy: isEdit && rowData?.createdBy ? rowData.createdBy : `${userName} (${empCode})`,
        };
        const payload = new FormData();
        Object.entries(fields).forEach(([key, value]) => payload.append(key, value ?? ''));
        // on update the current file is kept unless a new one is picked
        if (file) payload.append('file', file);
        return payload;
    };

    const handleFileChange = (e) => {
        const picked = e.target.files?.[0];
        if (!picked) return;
        if (picked.size > MAX_FILE_SIZE) {
            toast.error('File size should be less than 10 MB');
            e.target.value = '';
            return;
        }
        setFile(picked);
    };

    const removePickedFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const validateForm = () => {
        if (!form.builder) return 'Please select Builder';
        if (!form.project) return 'Please select Project';
        if (!form.slab) return 'Please select Slab';
        if (!form.masterPlan.trim()) return 'Please enter Master Plan';
        if (!form.totalSlab.trim()) return 'Please enter Total Slab (Agreement %)';
        if (!form.sms.trim()) return 'Please enter SMS (CAT 1)';
        if (!form.mtSlab.trim()) return 'Please enter MT Slab';
        if (!form.marketing.trim()) return 'Please enter Marketing';
        if (!form.teamIncentive.trim()) return 'Please enter Team Incentive MT';
        if (!form.incentiveStatus.trim()) return 'Please enter Incentive Status';
        if (!form.incentiveBd.trim()) return 'Please enter Incentive BD';
        return null;
    };

    const goBack = () => navigate('/nfa-master');

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (editExpired) return toast.error('Editing is allowed only within 72 hours of creation');
        const error = validateForm();
        if (error) return toast.error(error);

        const payload = buildPayload();
        setSaving(true);

        const request = isEdit
            ? ApiClient.put(`${UPDATE_NFA_MASTER}${rowData.id}`, payload)
            : ApiClient.post(`${CREATE_NFA_MASTER}${userId}`, payload);

        request
            .then((response) => {
                setSaving(false);
                if (response?.data?.status === 0) {
                    toast.error(response.data.message || 'Save failed');
                    return;
                }
                toast.success(
                    response?.data?.message ||
                    (isEdit ? 'NFA updated successfully' : 'NFA created successfully')
                );
                goBack();
            })
            .catch((error) => {
                setSaving(false);
                toast.error(error.message || 'Network error');
            });
    };

    const textInput = (field, placeholder) => (
        <input type="text" className="form-control" style={inputStyle}
            value={form[field]} onChange={handleFieldChange(field)}
            placeholder={placeholder} disabled={editExpired} />
    );

    return (
        <PageContent>
            <Breadcrumbs title="Transaction" breadcrumbItem={isEdit ? 'Update NFA' : 'Create NFA'} />
            {saving && <ScreenLoader />}

            <Container fluid>
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardBody>
                            {/* ── Header ───────────────────────────────────────── */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                flexWrap: 'wrap', gap: 10, marginBottom: 20, paddingBottom: 14,
                                borderBottom: '1px dashed #E2E8F0',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10,
                                        background: `linear-gradient(135deg, ${defaultTheme.primary}, var(--mt-primary-light))`,
                                        color: '#fff', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: 16,
                                    }}>
                                        {isEdit ? <FaEdit /> : <FaPlus />}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                                            {isEdit ? 'Update NFA' : 'Create NFA'}
                                        </div>
                                        <div style={{ fontSize: 11.5, color: editExpired ? '#DC2626' : '#64748B', marginTop: 2 }}>
                                            {editExpired
                                                ? 'This record is older than 72 hours and can no longer be edited'
                                                : 'Select builder, project and slab, then fill in the NFA details'}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={goBack}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 7,
                                        padding: '9px 14px', background: '#F1F5F9', color: '#475569',
                                        border: '1px solid #E2E8F0', borderRadius: 8,
                                        fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                                    }}
                                >
                                    <FaArrowLeft size={12} /> Back to List
                                </button>
                            </div>

                            {/* ── Builder / Project ───────────────────────────────── */}
                            <SectionTitle>Project</SectionTitle>
                            <Row className="g-3">
                                <Field label="Builder" required>
                                    <Select
                                        options={builderList?.data?.data || []}
                                        value={form.builder}
                                        onChange={handleBuilderChange}
                                        isLoading={buildersLoading}
                                        isDisabled={editExpired}
                                        isClearable
                                        placeholder="Select Builder"
                                        styles={selectStyles}
                                    />
                                </Field>
                                <Field label="Project" required>
                                    <Select
                                        options={projectList?.data?.data || []}
                                        value={form.project}
                                        onChange={handleProjectChange}
                                        isLoading={Boolean(form.builder) && projectsLoading}
                                        isDisabled={!form.builder || editExpired}
                                        isClearable
                                        placeholder={form.builder ? 'Select Project' : 'Select Builder first'}
                                        styles={selectStyles}
                                    />
                                </Field>
                                <Field label="Slab" required>
                                    <Select
                                        options={slabOptions}
                                        value={form.slab}
                                        onChange={(opt) => setForm((prev) => ({ ...prev, slab: opt }))}
                                        isLoading={Boolean(form.project) && slabsLoading}
                                        isDisabled={!form.project || editExpired}
                                        isClearable
                                        placeholder={form.project ? 'Select Slab' : 'Select Project first'}
                                        styles={selectStyles}
                                    />
                                </Field>
                            </Row>

                            {/* ── Slab Details ────────────────────────────────────── */}
                            <SectionTitle>Slab Details</SectionTitle>
                            <Row className="g-3">
                                <Field label="Master Plan" required>
                                    {textInput('masterPlan', 'Master Plan')}
                                </Field>
                                <Field label="Total Slab (Agreement %)" required>
                                    {textInput('totalSlab', 'Total Slab %')}
                                </Field>
                                <Field label="SMS (CAT 1)" required>
                                    {textInput('sms', 'SMS (CAT 1)')}
                                </Field>
                                <Field label="MT Slab" required>
                                    {textInput('mtSlab', 'MT Slab')}
                                </Field>
                                <Field label="Marketing" required>
                                    {textInput('marketing', 'Marketing')}
                                </Field>
                            </Row>

                            <SectionTitle>Incentives</SectionTitle>
                            <Row className="g-3">
                                <Field label="Team Incentive MT" required>
                                    {textInput('teamIncentive', 'Team Incentive MT')}
                                </Field>
                                <Field label="Incentive Status" required>
                                    {textInput('incentiveStatus', 'Incentive Status')}
                                </Field>
                                <Field label="Incentive BD" required>
                                    {textInput('incentiveBd', 'Incentive BD')}
                                </Field>
                                <Field label="Remarks" md={12}>
                                    <textarea className="form-control" style={inputStyle} rows={3}
                                        value={form.remarks} onChange={handleFieldChange('remarks')}
                                        placeholder="Remarks" disabled={editExpired} />
                                </Field>
                            </Row>

                            {/* ── Attachment ──────────────────────────────────────── */}
                            <SectionTitle>Attachment</SectionTitle>
                            <Row className="g-3">
                                <Field label={existingFile ? 'Change File' : 'Upload File'} md={6}>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="form-control"
                                        style={inputStyle}
                                        accept={FILE_ACCEPT}
                                        onChange={handleFileChange}
                                        disabled={editExpired}
                                    />
                                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                                        PDF, image, Word or Excel · max 10 MB
                                        {existingFile && ' · picking a new file replaces the current one'}
                                    </div>
                                </Field>
                                <Field label="Preview" md={6}>
                                    {file ? (
                                        <FileChip
                                            name={file.name}
                                            href={pickedFileUrl}
                                            tag="New"
                                            onRemove={editExpired ? null : removePickedFile}
                                        />
                                    ) : existingFile ? (
                                        <FileChip name={existingFile} href={`${imageBaseUrl}${existingFile}`} tag="Current" />
                                    ) : (
                                        <div style={{ fontSize: 12.5, color: '#94A3B8', paddingTop: 8 }}>No file selected</div>
                                    )}
                                </Field>
                            </Row>

                            {/* ── Actions ──────────────────────────────────────────── */}
                            <div style={{
                                display: 'flex', gap: 10, marginTop: 24, paddingTop: 16,
                                borderTop: '1px dashed #E2E8F0',
                            }}>
                                <button
                                    type="submit"
                                    disabled={saving || editExpired}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 7,
                                        padding: '10px 20px',
                                        background: `linear-gradient(135deg, ${defaultTheme.primary}, var(--mt-primary-light))`,
                                        color: '#fff', border: 'none', borderRadius: 8,
                                        fontSize: 13, fontWeight: 700,
                                        cursor: saving || editExpired ? 'not-allowed' : 'pointer',
                                        opacity: saving || editExpired ? 0.7 : 1,
                                    }}
                                >
                                    {saving ? 'Saving…' : isEdit ? 'Update' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    onClick={goBack}
                                    disabled={saving}
                                    style={{
                                        padding: '10px 20px', background: defaultTheme.goldColorLogo,
                                        color: '#fff', border: 'none', borderRadius: 8,
                                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </CardBody>
                    </Card>
                </form>
            </Container>
        </PageContent>
    );
}
