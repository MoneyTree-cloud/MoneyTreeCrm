import { useState } from 'react';
import { Container, Row, Col, Label, Card, CardBody } from 'reactstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from '../../components/Common/AppSelect';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaArrowLeft } from 'react-icons/fa';
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
import { isNfaEditable } from './NFAMaster';

const inputStyle = { borderRadius: 8, fontSize: 13 };

const selectStyles = {
    control: (base) => ({ ...base, borderRadius: 8, fontSize: 13 }),
    option: (base) => ({ ...base, fontSize: 13 }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const toOption = (label, value) => (value != null && value !== '' ? { label, value } : null);
const toInput = (value) => (value != null ? String(value) : '');
const toNumber = (value) => (value === '' ? 0 : Number(value));

const buildInitialForm = (rowData) => ({
    builder: toOption(rowData?.builderName, rowData?.builderId),
    project: toOption(rowData?.projectName, rowData?.projectId),
    slab: toOption(rowData?.slabName, rowData?.slabId),
    masterPlan: rowData?.masterPlan ?? '',
    totalSlabAgreement: toInput(rowData?.totalSlabAgreement),
    smsCat1: toInput(rowData?.smsCat1),
    mtSlab: toInput(rowData?.mtSlab),
    marketing: toInput(rowData?.marketing),
    teamIncentiveMt: toInput(rowData?.teamIncentiveMt),
    incentiveStatusMt: rowData?.incentiveStatusMt ?? '',
    incentiveBd: toInput(rowData?.incentiveBd),
    incentiveStatus: rowData?.incentiveStatus ?? '',
    remarks: rowData?.remarks ?? '',
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
    const { rowData } = location.state || {};
    const isEdit = Boolean(rowData?.id);
    const editExpired = isEdit && !isNfaEditable(rowData);

    const [form, setForm] = useState(buildInitialForm(rowData));
    const [saving, setSaving] = useState(false);

    const { data: builderList, isLoading: buildersLoading } = useGet(GET_DROPDOWN_BUILDER_);
    const { data: projectList, isLoading: projectsLoading } = useGet(
        `${GET_PROJECT_BY_BUILDER_}${form.builder?.value}`,
        { enabled: Boolean(form.builder?.value) }
    );
    const { data: slabList, isLoading: slabsLoading } = useGet(
        `${GET_SLAB_BY_PROJECT}${form.project?.value}`,
        { enabled: Boolean(form.project?.value) }
    );

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

    const buildPayload = () => ({
        builderId: form.builder?.value,
        builderName: form.builder?.label,
        projectId: form.project?.value,
        projectName: form.project?.label,
        slabId: form.slab?.value,
        slabName: form.slab?.label,
        masterPlan: form.masterPlan.trim(),
        totalSlabAgreement: toNumber(form.totalSlabAgreement),
        smsCat1: toNumber(form.smsCat1),
        mtSlab: toNumber(form.mtSlab),
        marketing: toNumber(form.marketing),
        teamIncentiveMt: toNumber(form.teamIncentiveMt),
        incentiveStatusMt: form.incentiveStatusMt.trim(),
        incentiveBd: toNumber(form.incentiveBd),
        incentiveStatus: form.incentiveStatus.trim(),
        remarks: form.remarks.trim(),
    });

    const validateForm = () => {
        if (!form.builder) return 'Please select Builder';
        if (!form.project) return 'Please select Project';
        if (!form.slab) return 'Please select Slab';
        if (!form.masterPlan.trim()) return 'Please enter Master Plan';
        if (form.totalSlabAgreement === '') return 'Please enter Total Slab (Agreement %)';
        if (Number(form.totalSlabAgreement) > 100) return 'Total Slab (Agreement %) cannot exceed 100';
        if (form.smsCat1 === '') return 'Please enter SMS (CAT 1)';
        if (form.mtSlab === '') return 'Please enter MT Slab';
        if (form.marketing === '') return 'Please enter Marketing';
        if (form.teamIncentiveMt === '') return 'Please enter Team Incentive MT';
        if (!form.incentiveStatusMt.trim()) return 'Please enter Incentive Status MT';
        if (form.incentiveBd === '') return 'Please enter Incentive BD';
        if (!form.incentiveStatus.trim()) return 'Please enter Incentive Status';
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
            : ApiClient.post(CREATE_NFA_MASTER, payload);

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

    const numberInput = (field, placeholder) => (
        <input type="number" className="form-control" style={inputStyle}
            value={form[field]} onChange={handleFieldChange(field)}
            placeholder={placeholder} min={0} step="any" disabled={editExpired} />
    );

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
                                                : 'Select builder, project and slab, then fill in the slab details'}
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

                            {/* ── Builder / Project / Slab ────────────────────────── */}
                            <SectionTitle>Slab Selection</SectionTitle>
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
                                        menuPortalTarget={document.body}
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
                                        menuPortalTarget={document.body}
                                        styles={selectStyles}
                                    />
                                </Field>
                                <Field label="Slab" required>
                                    <Select
                                        options={slabList?.data?.data || []}
                                        value={form.slab}
                                        onChange={(opt) => setForm((prev) => ({ ...prev, slab: opt }))}
                                        isLoading={Boolean(form.project) && slabsLoading}
                                        isDisabled={!form.project || editExpired}
                                        isClearable
                                        placeholder={form.project ? 'Select Slab' : 'Select Project first'}
                                        menuPortalTarget={document.body}
                                        styles={selectStyles}
                                    />
                                </Field>
                            </Row>

                            {/* ── Slab Details ────────────────────────────────────── */}
                            {form.slab && (
                                <>
                                    <SectionTitle>Slab Details</SectionTitle>
                                    <Row className="g-3">
                                        <Field label="Master Plan" required>
                                            {textInput('masterPlan', 'Master Plan')}
                                        </Field>
                                        <Field label="Total Slab (Agreement %)" required>
                                            {numberInput('totalSlabAgreement', 'Total Slab %')}
                                        </Field>
                                        <Field label="SMS (CAT 1)" required>
                                            {numberInput('smsCat1', 'SMS (CAT 1)')}
                                        </Field>
                                        <Field label="MT Slab" required>
                                            {numberInput('mtSlab', 'MT Slab')}
                                        </Field>
                                        <Field label="Marketing" required>
                                            {numberInput('marketing', 'Marketing')}
                                        </Field>
                                    </Row>

                                    <SectionTitle>Incentives</SectionTitle>
                                    <Row className="g-3">
                                        <Field label="Team Incentive MT" required md={3}>
                                            {numberInput('teamIncentiveMt', 'Team Incentive MT')}
                                        </Field>
                                        <Field label="Incentive Status MT" required md={3}>
                                            {textInput('incentiveStatusMt', 'Incentive Status MT')}
                                        </Field>
                                        <Field label="Incentive BD" required md={3}>
                                            {numberInput('incentiveBd', 'Incentive BD')}
                                        </Field>
                                        <Field label="Incentive Status" required md={3}>
                                            {textInput('incentiveStatus', 'Incentive Status')}
                                        </Field>
                                        <Field label="Remarks" md={12}>
                                            <textarea className="form-control" style={inputStyle} rows={3}
                                                value={form.remarks} onChange={handleFieldChange('remarks')}
                                                placeholder="Remarks" disabled={editExpired} />
                                        </Field>
                                    </Row>
                                </>
                            )}

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
