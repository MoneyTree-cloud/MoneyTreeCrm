/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, FormFeedback, Card, CardBody } from 'reactstrap';
import Select from 'react-select';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { toast } from 'react-toastify';
import { CANDIDATE_DOCUMENT_SUBMIT, CANDIDATE_HISTORY_BY_ID, CANDIDATE_SINGLE_DOCUMENT_SUBMIT } from '../../helpers/url_helper';
import ScreenLoader from '../../constants/ScreenLoader';
import { useLocation } from 'react-router-dom';
import ApiClient, { hrImageBaseUrl } from '../../helpers/api_helper';
import SuccessCard from './SuccessCard';
import NoData from './NoData';
import { bloodGroupOptions } from '../../constants/global';
import { RequiredStar } from '../../helpers/function_helper';
import {
    FaIdCard, FaAddressCard, FaCamera, FaUniversity, FaGraduationCap,
    FaMoneyCheckAlt, FaFileSignature, FaCar,
    FaCheckCircle, FaTimesCircle, FaEye, FaRedo, FaTrash,
    FaCloudUploadAlt, FaUserFriends,
} from 'react-icons/fa';
import { defaultTheme } from '../../helpers/defaultTheme';
import ImageModal from '../../components/Common/ImageModal';

// ── Document types config (key = backend enum) ──────────────────────────────
const DOCUMENT_TYPES = [
    { key: 'PHOTO', label: 'Passport Photo', icon: FaCamera },
    { key: 'ADDRESS_PROOF', label: 'Aadhaar Front', icon: FaIdCard },
    { key: 'ADDRESS_PROOF_BACK', label: 'Aadhaar Back', icon: FaIdCard },
    { key: 'PAN', label: 'PAN Card', icon: FaAddressCard },
    { key: 'DRIVING_LICENCE', label: 'Driving License', icon: FaCar },
    { key: 'TENTH_MARK_SHEET', label: '10th Certificate', icon: FaGraduationCap },
    { key: 'HIGHEST_MARK_SHEET', label: 'Highest Qualification', icon: FaGraduationCap },
    { key: 'BANK_DETAILS', label: 'Bank Details/Cancelled Cheque', icon: FaUniversity },
];

// Non-fresher extra docs
const EXPERIENCED_DOCS = [
    { key: 'RELIVING_LETTER', label: 'Relieving Letter', icon: FaFileSignature },
    { key: 'SALARY_SLIP', label: 'Salary Slip (Last 3 Months)', icon: FaMoneyCheckAlt },
];

// ── Preview helpers ─────────────────────────────────────────────────────────
const getPreviewUrl = (state) => {
    if (state?.file) return URL.createObjectURL(state.file);
    if (state?.filename) return hrImageBaseUrl + state.filename;
    return null;
};
const isPdfFile = (fn) => fn && /\.pdf$/i.test(fn);

// ── Small action button ─────────────────────────────────────────────────────
const iconBtn = (color) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 22, height: 22,
    background: 'transparent', color,
    border: `1px solid ${color}40`, borderRadius: 5,
    cursor: 'pointer', padding: 0,
});

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ Compact Document Upload Card — reused for all documents                    ║
// ╚════════════════════════════════════════════════════════════════════════════╝
function DocUploadCard({ label, Icon, isMandatory, state, onStateChange, onPreview }) {
    const inputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error(`${label}: file too large (max 10 MB)`);
            return;
        }

        onStateChange({ file, filename: null, uploading: true, error: null });

        const fd = new FormData();
        fd.append('file', file);

        try {
            const response = await ApiClient.post(CANDIDATE_SINGLE_DOCUMENT_SUBMIT, fd);
            if (response?.data?.status === 1) {
                onStateChange({ file, filename: response.data.data, uploading: false, error: null });
            } else {
                onStateChange({ file: null, filename: null, uploading: false, error: response?.data?.message || 'Upload failed' });
                toast.error(`${label}: ${response?.data?.message || 'Upload failed'}`);
            }
        } catch (err) {
            onStateChange({ file: null, filename: null, uploading: false, error: err.message || 'Network error' });
            toast.error(`${label}: ${err.message}`);
        } finally {
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        if (!window.confirm(`Remove ${label}?`)) return;
        onStateChange({ file: null, filename: null, uploading: false, error: null });
    };

    const uploaded = !!state?.filename;
    const isError = !!state?.error;
    const uploading = !!state?.uploading;

    let borderColor = '#CBD5E1';
    let bg = '#fff';
    let iconBg = '#F1F5F9';
    let iconColor = '#94A3B8';
    if (isError) { borderColor = '#DC2626'; bg = '#FEF2F2'; iconBg = '#FEE2E2'; iconColor = '#DC2626'; }
    else if (uploaded) { borderColor = '#16A34A'; bg = '#F0FDF4'; iconBg = '#DCFCE7'; iconColor = '#16A34A'; }
    else if (uploading) { borderColor = defaultTheme.primary; bg = '#F0FDF9'; iconBg = `${defaultTheme.primary}15`; iconColor = defaultTheme.primary; }

    const filename = state?.file?.name || state?.filename;

    return (
        <div
            style={{
                border: `1.5px ${uploaded ? 'solid' : 'dashed'} ${borderColor}`,
                borderRadius: 8,
                padding: '8px 10px',
                background: bg,
                transition: 'all .15s',
                cursor: uploading ? 'wait' : (uploaded ? 'default' : 'pointer'),
                minHeight: 78,
                display: 'flex', flexDirection: 'column', gap: 5,
            }}
            onClick={() => { if (!uploading && !uploaded) inputRef.current?.click(); }}
        >
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{
                    width: 26, height: 26, borderRadius: 6,
                    background: iconBg, color: iconColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, flexShrink: 0,
                }}>
                    <Icon />
                </div>
                <div style={{ flex: 1, minWidth: 0, fontSize: 11, fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                    {label} {isMandatory && <span style={{ color: '#DC2626' }}>*</span>}
                </div>
                {uploaded && <FaCheckCircle size={13} color="#16A34A" />}
                {isError && <FaTimesCircle size={13} color="#DC2626" />}
            </div>

            {/* State */}
            {uploading && (
                <div style={{
                    fontSize: 10.5, color: defaultTheme.primary, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 5, marginTop: 'auto',
                }}>
                    <div style={{
                        width: 10, height: 10,
                        border: `2px solid ${defaultTheme.primary}`,
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'doc-spin 0.8s linear infinite',
                    }} />
                    Uploading…
                </div>
            )}

            {uploaded && (
                <>
                    <div style={{
                        fontSize: 10, color: '#166534',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontWeight: 600,
                    }} title={filename}>
                        {filename}
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 'auto' }}>
                        <button type="button" onClick={(e) => { e.stopPropagation(); onPreview(); }}
                            title="Preview" style={iconBtn('#1E40AF')}>
                            <FaEye size={8} />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                            title="Replace" style={iconBtn('#D97706')}>
                            <FaRedo size={8} />
                        </button>
                        <button type="button" onClick={handleRemove}
                            title="Remove" style={iconBtn('#DC2626')}>
                            <FaTrash size={8} />
                        </button>
                    </div>
                </>
            )}

            {isError && (
                <div style={{ marginTop: 'auto', fontSize: 10, color: '#DC2626', fontWeight: 600 }}>
                    Click to retry
                </div>
            )}

            {!uploading && !uploaded && !isError && (
                <div style={{
                    marginTop: 'auto', fontSize: 10.5, color: '#64748B', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 5,
                }}>
                    <FaCloudUploadAlt size={11} color={defaultTheme.primary} />
                    Click to upload
                </div>
            )}

            <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleFileSelect} />
        </div>
    );
}


// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ Main Component                                                             ║
// ╚════════════════════════════════════════════════════════════════════════════╝
export default function CandidateDocuments() {
    const location = useLocation();
    const [candidateId, setCandidateId] = useState(null);
    const [candidateData, setCandidateData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Non-file form fields
    const initialFormData = {
        currentAddress: '',
        permanentAddress: '',
        gender: '',
        bloodGroup: null,
        religion: null,
        dobDocument: '',
        dobActual: '',
        maritalStatus: '',
        anniversary: '',
        fatherName: '',
        fatherNumber: '',
        motherNumber: '',
        emergencyContact: { name: '', number: '', relation: null },
    };
    const [formData, setFormData] = useState(initialFormData);

    // All document upload state
    const [docs, setDocs] = useState({});

    // Nominee state
    const [nominee, setNominee] = useState({ name: '', dob: '', relation: null });

    // Preview modal
    const [preview, setPreview] = useState({ open: false, docKey: null });

    const [errors, setErrors] = useState({});

    // ── Fetch candidate data ────────────────────────────────────────────────
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const id = (params.get('candidateId') || params.get('candidateld'));
        if (id && !isNaN(id)) {
            setCandidateId(parseInt(id));
            ApiClient.get(`${CANDIDATE_HISTORY_BY_ID}${id}`)
                .then((response) => {
                    setIsLoading(false);
                    if (response?.data?.status === 1) setCandidateData(response.data.data);
                })
                .catch((error) => {
                    setIsLoading(false);
                    toast.error(error.message);
                });
        } else {
            setIsLoading(false);
        }
    }, [candidateId, location.search]);

    const isFresher = candidateData?.fresher;

    // Full document type list (base + experienced if applicable)
    const allDocumentTypes = useMemo(() => {
        return isFresher ? DOCUMENT_TYPES : [...DOCUMENT_TYPES, ...EXPERIENCED_DOCS];
    }, [isFresher]);

    // Initialize doc state for each type
    useEffect(() => {
        setDocs((prev) => {
            const next = { ...prev };
            allDocumentTypes.forEach((d) => {
                if (!next[d.key]) {
                    next[d.key] = { file: null, filename: null, uploading: false, error: null };
                }
            });
            return next;
        });
    }, [allDocumentTypes]);

    const religionOptions = [
        { label: "Hindu", value: "Hindu" },
        { label: "Muslim", value: "Muslim" },
        { label: "Christian", value: "Christian" },
        { label: "Sikh", value: "Sikh" },
        { label: "Buddhist", value: "Buddhist" },
        { label: "Jain", value: "Jain" },
    ];

    const relationOptions = [
        { value: 'Spouse', label: 'Spouse' },
        { value: 'Friend', label: 'Friend' },
    ];

    const nomineeRelationOptions = [
        { value: 'Father', label: 'Father' },
        { value: 'Mother', label: 'Mother' },
        { value: 'Spouse', label: 'Spouse' },
        { value: 'Son', label: 'Son' },
        { value: 'Daughter', label: 'Daughter' },
        { value: 'Brother', label: 'Brother' },
        { value: 'Sister', label: 'Sister' },
        { value: 'Other', label: 'Other' },
    ];

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleInputChange = (e, field, subField = null) => {
        const value = e && e.target ? e.target.value : e;
        if (subField) {
            setFormData(prev => ({ ...prev, [field]: { ...prev[field], [subField]: value } }));
            setErrors(prev => ({ ...prev, [`${field}.${subField}`]: '' }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleDocChange = (key, state) => {
        setDocs((prev) => ({ ...prev, [key]: state }));
        setErrors(prev => ({ ...prev, [`doc.${key}`]: '' }));
    };

    const handleNomineeChange = (key, val) => {
        setNominee(prev => ({ ...prev, [key]: val }));
        setErrors(prev => ({ ...prev, [`nominee.${key}`]: '' }));
    };

    // ── Validation ──────────────────────────────────────────────────────────
    const validateForm = () => {
        const newErrors = {};

        // Personal
        if (!formData.currentAddress.trim()) newErrors.currentAddress = 'Current address is required.';
        if (!formData.permanentAddress.trim()) newErrors.permanentAddress = 'Permanent address is required.';
        if (!formData.gender) newErrors.gender = 'Gender is required.';
        if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required.';
        if (!formData.religion) newErrors.religion = 'Religion is required.';
        if (!formData.dobDocument) newErrors.dobDocument = 'DOB as per document is required.';
        if (!formData.dobActual) newErrors.dobActual = 'Actual DOB is required.';
        if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required.';
        if (formData.maritalStatus === 'Married' && !formData.anniversary)
            newErrors.anniversary = 'Anniversary date is required for married candidates.';
        if (!formData.fatherName.trim()) newErrors.fatherName = 'Father name is required.';

        // Emergency contact
        if (!formData.emergencyContact.name.trim())
            newErrors['emergencyContact.name'] = 'Emergency contact name is required.';
        if (!formData.emergencyContact.number.trim())
            newErrors['emergencyContact.number'] = 'Emergency contact number is required.';
        else if (!/^\d{10}$/.test(formData.emergencyContact.number))
            newErrors['emergencyContact.number'] = 'Enter a valid 10-digit phone number.';
        if (!formData.emergencyContact.relation)
            newErrors['emergencyContact.relation'] = 'Emergency contact relation is required.';

        // Documents — all mandatory except DRIVING_LICENCE (only mandatory for Male)
        allDocumentTypes.forEach((d) => {
            if (d.key === 'DRIVING_LICENCE' && formData.gender !== 'Male') return;
            if (d.key === 'SALARY_SLIP') return; // optional in original
            if (!docs[d.key]?.filename) {
                newErrors[`doc.${d.key}`] = `${d.label} is required.`;
            }
        });

        // Nominee
        if (!nominee.name.trim()) newErrors['nominee.name'] = 'Nominee name is required.';
        if (!nominee.dob) newErrors['nominee.dob'] = 'Nominee date of birth is required.';
        if (!nominee.relation) newErrors['nominee.relation'] = 'Nominee relation is required.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── Submit — JSON body ──────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fill all required fields correctly.');
            return;
        }

        // Build parallel arrays — documentTypes[i] pairs with documents[i]
        const documentTypes = [];
        const documents = [];
        allDocumentTypes.forEach((d) => {
            if (docs[d.key]?.filename) {
                documentTypes.push(d.key);
                documents.push(docs[d.key].filename);
            }
        });

        // Build JSON payload
        const payload = {
            candidateId,
            currentAddress: formData.currentAddress.trim(),
            permanentAddress: formData.permanentAddress.trim(),
            gender: formData.gender,
            bloodGroup: formData.bloodGroup?.value || '',
            religion: formData.religion?.value || '',
            dateOfBirth: formData.dobDocument,
            actualDateOfBirth: formData.dobActual,
            maritalStatus: formData.maritalStatus,
            anniversary: formData.anniversary || '',
            fatherName: formData.fatherName.trim(),
            emergencyPersonName: formData.emergencyContact.name.trim(),
            emergencyPersonNumber: formData.emergencyContact.number,
            emergencyPersonRelation: formData.emergencyContact.relation?.value || '',
            fatherNumber: formData.fatherNumber || '',
            motherNumber: formData.motherNumber || '',

            // Nominee
            nomineeName: nominee.name.trim(),
            nomineeDateOfBirth: nominee.dob,
            nomineeRelation: nominee.relation?.value || '',

            // Documents as parallel arrays
            documentTypes,
            documents,
        };

        setSubmitting(true);
        try {
            const response = await ApiClient.post(CANDIDATE_DOCUMENT_SUBMIT, payload);
            setSubmitting(false);
            if (response?.data?.status === 1) {
                toast.success(response.data.message || 'Submitted successfully');
                window.location.reload();
            } else {
                toast.error(response?.data?.message || 'Failed to submit');
            }
        } catch (err) {
            setSubmitting(false);
            toast.error(err.message || 'Network error');
        }
    };

    // Any doc still uploading?
    const anyUploading = useMemo(
        () => Object.values(docs).some((d) => d?.uploading),
        [docs]
    );

    const handlePreview = (docKey) => {
        const state = docs[docKey];
        if (!state) return;

        const url = getPreviewUrl(state);
        const filename = state.file?.name || state.filename;

        if (isPdfFile(filename)) {
            window.open(url, "_blank", "noopener,noreferrer");
            return;
        }

        setPreview({
            open: true,
            docKey,
        });
    };

    // Preview data
    const previewState = preview.docKey ? docs[preview.docKey] : null;

    return (
        <div className='p-3'>
            {(submitting || isLoading) && <ScreenLoader />}
            <style>{`@keyframes doc-spin { to { transform: rotate(360deg); } }`}</style>
            <Container fluid>
                {!candidateData ? (
                    <NoData />
                ) : candidateData?.documentUploaded ? (
                    <SuccessCard candidateData={candidateData} title={'Document Uploaded'}
                        message="Your documents have been successfully uploaded. Our team will verify them and reach out if anything else is required."
                    />
                ) : (
                    <Card className="shadow">
                        <CardBody>
                            <Breadcrumbs title="Documents" breadcrumbItem="Upload" />

                            <Form onSubmit={handleSubmit}>
                                {/* ══ Personal Details ══════════════════════════════ */}
                                <Row>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12' for="currentAddress">Current Address <RequiredStar /></Label>
                                            <Input type="textarea" id="currentAddress" rows={3}
                                                value={formData.currentAddress}
                                                onChange={(e) => handleInputChange(e, 'currentAddress')}
                                                placeholder="Enter current address"
                                                invalid={!!errors.currentAddress} />
                                            <FormFeedback>{errors.currentAddress}</FormFeedback>
                                        </FormGroup>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12' for="permanentAddress">Permanent Address <RequiredStar /></Label>
                                            <Input type="textarea" id="permanentAddress" rows={3}
                                                value={formData.permanentAddress}
                                                onChange={(e) => handleInputChange(e, 'permanentAddress')}
                                                placeholder="Enter permanent address"
                                                invalid={!!errors.permanentAddress} />
                                            <FormFeedback>{errors.permanentAddress}</FormFeedback>
                                        </FormGroup>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12'>Gender <RequiredStar /></Label>
                                            <div>
                                                {['Male', 'Female', 'Other'].map(g => (
                                                    <FormGroup check inline key={g}>
                                                        <Input type="radio" name="gender" value={g}
                                                            checked={formData.gender === g}
                                                            onChange={(e) => handleInputChange(e, 'gender')} />
                                                        <Label className='font-size-12' check>{g}</Label>
                                                    </FormGroup>
                                                ))}
                                            </div>
                                            {errors.gender && <div className="text-danger" style={{ fontSize: 11 }}>{errors.gender}</div>}
                                        </FormGroup>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12'>Marital Status <RequiredStar /></Label>
                                            <div>
                                                {['Unmarried', 'Married', 'Other'].map(status => (
                                                    <FormGroup check inline key={status}>
                                                        <Input type="radio" name="maritalStatus" value={status}
                                                            checked={formData.maritalStatus === status}
                                                            onChange={(e) => handleInputChange(e, 'maritalStatus')} />
                                                        <Label className='font-size-12' check>{status}</Label>
                                                    </FormGroup>
                                                ))}
                                            </div>
                                            {errors.maritalStatus && <div className="text-danger" style={{ fontSize: 11 }}>{errors.maritalStatus}</div>}
                                        </FormGroup>
                                    </Col>

                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12' for="bloodGroup">Blood Group <RequiredStar /></Label>
                                            <Select id="bloodGroup" options={bloodGroupOptions}
                                                value={formData.bloodGroup}
                                                onChange={(option) => handleInputChange(option, 'bloodGroup')}
                                                placeholder="Select Blood Group" isClearable
                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                menuPortalTarget={document.body} />
                                            {errors.bloodGroup && <div className="text-danger" style={{ fontSize: 11 }}>{errors.bloodGroup}</div>}
                                        </FormGroup>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12' for="religion">Religion <RequiredStar /></Label>
                                            <Select id="religion" options={religionOptions}
                                                value={formData.religion}
                                                onChange={(option) => handleInputChange(option, 'religion')}
                                                placeholder="Select Religion" isClearable
                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                menuPortalTarget={document.body} />
                                            {errors.religion && <div className="text-danger" style={{ fontSize: 11 }}>{errors.religion}</div>}
                                        </FormGroup>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12' for="dobDocument">DOB as per Document <RequiredStar /></Label>
                                            <Input type="date" id="dobDocument"
                                                value={formData.dobDocument}
                                                onChange={(e) => handleInputChange(e, 'dobDocument')}
                                                invalid={!!errors.dobDocument} />
                                            <FormFeedback>{errors.dobDocument}</FormFeedback>
                                        </FormGroup>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12' for="dobActual">Actual DOB <RequiredStar /></Label>
                                            <Input type="date" id="dobActual"
                                                value={formData.dobActual}
                                                onChange={(e) => handleInputChange(e, 'dobActual')}
                                                invalid={!!errors.dobActual} />
                                            <FormFeedback>{errors.dobActual}</FormFeedback>
                                        </FormGroup>
                                    </Col>

                                    {formData.maritalStatus === 'Married' && (
                                        <Col md={3}>
                                            <FormGroup>
                                                <Label className='font-size-12' for="anniversary">Anniversary <RequiredStar /></Label>
                                                <Input type="date" id="anniversary"
                                                    value={formData.anniversary}
                                                    onChange={(e) => handleInputChange(e, 'anniversary')}
                                                    invalid={!!errors.anniversary} />
                                                <FormFeedback>{errors.anniversary}</FormFeedback>
                                            </FormGroup>
                                        </Col>
                                    )}

                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12' for="fatherName">Father Name <RequiredStar /></Label>
                                            <Input type="text" id="fatherName"
                                                value={formData.fatherName}
                                                onChange={(e) => handleInputChange(e, 'fatherName')}
                                                placeholder="Enter father name"
                                                invalid={!!errors.fatherName} />
                                            <FormFeedback>{errors.fatherName}</FormFeedback>
                                        </FormGroup>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12' for="fatherNumber">Father's Number</Label>
                                            <Input type="text" id="fatherNumber"
                                                value={formData.fatherNumber}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    if (/^\d{0,10}$/.test(v)) handleInputChange(e, 'fatherNumber');
                                                }}
                                                placeholder="Enter Father's Mobile" />
                                        </FormGroup>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12' for="motherNumber">Mother's Number</Label>
                                            <Input type="text" id="motherNumber"
                                                value={formData.motherNumber}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    if (/^\d{0,10}$/.test(v)) handleInputChange(e, 'motherNumber');
                                                }}
                                                maxLength={10}
                                                placeholder="Enter Mother's Mobile" />
                                        </FormGroup>
                                    </Col>
                                </Row>

                                {/* ══ Document Uploads ══════════════════════════════ */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    marginTop: 20, marginBottom: 10,
                                }}>
                                    <FaCloudUploadAlt size={16} color={defaultTheme.primary} />
                                    <h6 className="m-0 text-primary" style={{ fontWeight: 800 }}>
                                        Document Uploads
                                    </h6>
                                    <span style={{ fontSize: 11, color: '#94A3B8' }}>
                                        Files upload immediately when selected
                                    </span>
                                </div>
                                <Row className="g-2">
                                    {allDocumentTypes.map((d) => {
                                        // DRIVING_LICENCE mandatory only for Male
                                        const isMandatory = d.key === 'DRIVING_LICENCE'
                                            ? (formData.gender === 'Male')
                                            : d.key !== 'SALARY_SLIP';
                                        return (
                                            <Col md={4} lg={3} key={d.key}>
                                                <DocUploadCard
                                                    label={d.label}
                                                    Icon={d.icon}
                                                    isMandatory={isMandatory}
                                                    state={docs[d.key] || { file: null, filename: null, uploading: false, error: null }}
                                                    onStateChange={(s) => handleDocChange(d.key, s)}
                                                    onPreview={() => handlePreview(d.key)}
                                                />
                                                {errors[`doc.${d.key}`] && (
                                                    <div className="text-danger" style={{ fontSize: 10.5, marginTop: 2 }}>
                                                        {errors[`doc.${d.key}`]}
                                                    </div>
                                                )}
                                            </Col>
                                        );
                                    })}
                                </Row>

                                {/* ══ Emergency Contact ═════════════════════════════ */}
                                <h6 className="mt-4 mb-3 text-primary" style={{ fontWeight: 800 }}>
                                    Emergency Contact <RequiredStar />
                                </h6>
                                <Row>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12' for="emergencyName">Name <RequiredStar /></Label>
                                            <Input type="text" id="emergencyName"
                                                value={formData.emergencyContact.name}
                                                onChange={(e) => handleInputChange(e, 'emergencyContact', 'name')}
                                                placeholder="Enter contact name"
                                                invalid={!!errors['emergencyContact.name']} />
                                            <FormFeedback>{errors['emergencyContact.name']}</FormFeedback>
                                        </FormGroup>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12' for="emergencyNumber">Number <RequiredStar /></Label>
                                            <Input type="text" id="emergencyNumber"
                                                value={formData.emergencyContact.number}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    if (/^\d{0,10}$/.test(v)) handleInputChange(e, 'emergencyContact', 'number');
                                                }}
                                                maxLength={10}
                                                placeholder="10-digit phone number"
                                                invalid={!!errors['emergencyContact.number']} />
                                            <FormFeedback>{errors['emergencyContact.number']}</FormFeedback>
                                        </FormGroup>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12' for="emergencyRelation">Relation <RequiredStar /></Label>
                                            <Select id="emergencyRelation" options={relationOptions}
                                                value={formData.emergencyContact.relation}
                                                onChange={(option) => handleInputChange(option, 'emergencyContact', 'relation')}
                                                placeholder="Select Relation" isClearable
                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                menuPortalTarget={document.body} />
                                            {errors['emergencyContact.relation'] && <div className="text-danger" style={{ fontSize: 11 }}>{errors['emergencyContact.relation']}</div>}
                                        </FormGroup>
                                    </Col>
                                </Row>

                                {/* ══ Nominee Details ═══════════════════════════════ */}
                                <h6 className="mt-4 mb-3 text-primary d-flex align-items-center gap-2" style={{ fontWeight: 800 }}>
                                    <FaUserFriends /> Nominee Details <RequiredStar />
                                </h6>
                                <Row>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12' for="nomineeName">Nominee Name <RequiredStar /></Label>
                                            <Input type="text" id="nomineeName"
                                                value={nominee.name}
                                                onChange={(e) => handleNomineeChange('name', e.target.value)}
                                                placeholder="Enter nominee name"
                                                invalid={!!errors['nominee.name']} />
                                            <FormFeedback>{errors['nominee.name']}</FormFeedback>
                                        </FormGroup>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12' for="nomineeDob">Date of Birth <RequiredStar /></Label>
                                            <Input type="date" id="nomineeDob"
                                                value={nominee.dob}
                                                onChange={(e) => handleNomineeChange('dob', e.target.value)}
                                                invalid={!!errors['nominee.dob']} />
                                            <FormFeedback>{errors['nominee.dob']}</FormFeedback>
                                        </FormGroup>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className='font-size-12' for="nomineeRelation">Relation with Nominee <RequiredStar /></Label>
                                            <Select id="nomineeRelation" options={nomineeRelationOptions}
                                                value={nominee.relation}
                                                onChange={(option) => handleNomineeChange('relation', option)}
                                                placeholder="Select Relation" isClearable
                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                menuPortalTarget={document.body} />
                                            {errors['nominee.relation'] && <div className="text-danger" style={{ fontSize: 11 }}>{errors['nominee.relation']}</div>}
                                        </FormGroup>
                                    </Col>
                                </Row>

                                {/* Submit */}
                                <div className="mt-4">
                                    <Button color="primary" type="submit"
                                        disabled={submitting || anyUploading}>
                                        {submitting ? 'Submitting...' : (anyUploading ? 'Uploading…' : 'Submit Form')}
                                    </Button>
                                    {anyUploading && (
                                        <span className="ms-3" style={{ fontSize: 12, color: '#94A3B8' }}>
                                            Please wait for uploads to finish
                                        </span>
                                    )}
                                </div>
                            </Form>
                        </CardBody>
                    </Card>
                )}
            </Container>

            <ImageModal
                isOpen={preview.open}
                toggle={() => setPreview({ open: false, docKey: null })}
                imageSrc={previewState ? getPreviewUrl(previewState) : null}
            />
        </div>
    );
}