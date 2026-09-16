import { useState } from 'react';
import { Container, Row, Col, Label, Card, CardBody } from 'reactstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaArrowLeft } from 'react-icons/fa';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient from '../../helpers/api_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { RequiredStar } from '../../helpers/function_helper';
import { CREATE_BOOKING_ANNEXURE, UPDATE_BOOKING_ANNEXURE } from '../../helpers/url_helper';

const inputStyle = { borderRadius: 8, fontSize: 13 };

const buildInitialForm = (rowData) => ({
    // srNo: rowData?.srNo ?? '',
    mtrsId: rowData?.mtrsId != null ? String(rowData.mtrsId) : '',
    mtl: rowData?.mtl ?? '',
    stl: rowData?.stl ?? '',
    associateId: rowData?.associateId ?? '',
    associateName: rowData?.associateName ?? '',
    dateOfBooking: rowData?.dateOfBooking ? rowData.dateOfBooking.slice(0, 10) : '',
    builderName: rowData?.builderName ?? '',
    projectName: rowData?.projectName ?? '',
    typeOfProperty: rowData?.typeOfProperty ?? '',
    clientName: rowData?.clientName ?? '',
    unitNo: rowData?.unitNo ?? '',
    unitDetails: rowData?.unitDetails ?? '',
    bsp: rowData?.bsp ?? '',
    area: rowData?.area ?? '',
    bbaValue: rowData?.bbaValue ?? '',
    location: rowData?.location ?? '',
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

// ── Field wrapper (adds locked badge when disabled) ─────────────────────────
function Field({ label, required, locked, md = 4, children }) {
    return (
        <Col md={md}>
            <Label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {label} {required && <RequiredStar />}
                {/* {locked && (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 9.5, fontWeight: 700, color: '#94A3B8',
                        background: '#F1F5F9', padding: '1px 7px', borderRadius: 20,
                        textTransform: 'uppercase', letterSpacing: '.02em',
                    }}>
                        <FaLock size={8} /> Locked
                    </span>
                )} */}
            </Label>
            {children}
        </Col>
    );
}

export default function BookingDetailsForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { rowData } = location.state || {};
    const isEdit = Boolean(rowData?.id);

    const [form, setForm] = useState(buildInitialForm(rowData));
    const [saving, setSaving] = useState(false);

    const handleFieldChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const buildPayload = () => ({
        // srNo: form.srNo === '' ? 0 : Number(form.srNo),
        mtrsId: form.mtrsId === '' ? 0 : Number(form.mtrsId),
        mtl: form.mtl.trim(),
        stl: form.stl.trim(),
        associateId: form.associateId.trim(),
        associateName: form.associateName.trim(),
        dateOfBooking: form.dateOfBooking,
        builderName: form.builderName.trim(),
        projectName: form.projectName.trim(),
        typeOfProperty: form.typeOfProperty.trim(),
        clientName: form.clientName.trim(),
        unitNo: form.unitNo.trim(),
        unitDetails: form.unitDetails.trim(),
        bsp: form.bsp === '' ? 0 : Number(form.bsp),
        area: form.area === '' ? 0 : Number(form.area),
        bbaValue: form.bbaValue === '' ? 0 : Number(form.bbaValue),
        location: form.location.trim(),
    });
    console.log(form.mtrsId)

    const validateForm = () => {
        if (!form?.mtrsId.trim()) return 'Please enter MTRS ID';
        if (!form?.mtl.trim()) return 'Please enter Main Team';
        if (!form?.stl.trim()) return 'Please enter Sub Team';
        if (!form?.associateId.trim()) return 'Please enter Associate ID';
        if (!form?.associateName.trim()) return 'Please enter Associate Name';
        if (!form?.dateOfBooking) return 'Please select Date of Booking';
        if (!form?.builderName.trim()) return 'Please enter Builder Name';
        if (!form?.projectName.trim()) return 'Please enter Project Name';
        if (!form?.typeOfProperty.trim()) return 'Please enter Type of Property';
        if (!form?.clientName.trim()) return 'Please enter Client Name';
        if (!form?.unitNo.trim()) return 'Please enter Unit No';
        if (!form?.unitDetails.trim()) return 'Please enter Unit Details';
        if (!form?.bsp.toString().trim()) return 'Please enter BSP';
        if (!form?.area.toString().trim()) return 'Please enter Area';
        if (!form?.bbaValue.toString().trim()) return 'Please enter BBA Value';
        if (!form?.location.trim()) return 'Please enter Location';
        return null;
    };

    const goBack = () => navigate('/booking-details');

    const handleSubmit = (e) => {
        e?.preventDefault();
        const error = validateForm();
        if (error) return toast.error(error);

        const payload = buildPayload();
        setSaving(true);

        const request = isEdit
            ? ApiClient.put(`${UPDATE_BOOKING_ANNEXURE}${rowData.id}`, payload)
            : ApiClient.post(CREATE_BOOKING_ANNEXURE, payload);

        request
            .then((response) => {
                setSaving(false);
                if (response?.data?.status === 0) {
                    toast.error(response.data.message || 'Save failed');
                    return;
                }
                toast.success(
                    response?.data?.message ||
                    (isEdit ? 'Booking Details updated successfully' : 'Booking Details created successfully')
                );
                goBack();
            })
            .catch((error) => {
                setSaving(false);
                toast.error(error.message || 'Network error');
            });
    };

    return (
        <PageContent>
            <Breadcrumbs title="Transaction" breadcrumbItem={isEdit ? 'Update Booking Details' : 'Create Booking Details'} />
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
                                        background: `linear-gradient(135deg, ${defaultTheme.primary}, #007A6E)`,
                                        color: '#fff', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: 16,
                                    }}>
                                        {isEdit ? <FaEdit /> : <FaPlus />}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                                            {isEdit ? 'Update Booking Details' : 'Create Booking Details'}
                                        </div>
                                        <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                                            {isEdit
                                                ? 'Sr No. and MTRS ID are locked once a record exists'
                                                : 'Fill in the booking annexure details below'}
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

                            {/* ── Identifiers ─────────────────────────────────────── */}
                            <SectionTitle>Identifiers</SectionTitle>
                            <Row className="g-3">
                                {/* <Field label="Sr No." md={3} locked={isEdit}>
                                    <input type="number" className="form-control" style={inputStyle}
                                        value={form.srNo} onChange={handleFieldChange('srNo')}
                                        placeholder="Sr No" disabled={isEdit} min={0} />
                                </Field> */}
                                <Field label="MTRS ID" md={3} required>
                                    <input type="number" className="form-control" style={inputStyle}
                                        value={form.mtrsId} onChange={handleFieldChange('mtrsId')}
                                        placeholder="MTRS ID" min={0} />
                                </Field>
                                  <Field label="Associate ID"  required>
                                    <input type="text" className="form-control" style={inputStyle}
                                        value={form.associateId} onChange={handleFieldChange('associateId')} placeholder="Associate ID" />
                                </Field>
                                <Field label="Associate Name" required>
                                    <input type="text" className="form-control" style={inputStyle}
                                        value={form.associateName} onChange={handleFieldChange('associateName')} placeholder="Associate Name" />
                                </Field>
                                <Field label="Main Team" md={3} required>
                                    <input type="text" className="form-control" style={inputStyle}
                                        value={form.mtl} onChange={handleFieldChange('mtl')} placeholder="MTL" />
                                </Field>
                                <Field label="Sub Team" md={3} required>
                                    <input type="text" className="form-control" style={inputStyle}
                                        value={form.stl} onChange={handleFieldChange('stl')} placeholder="STL" />
                                </Field>
                            </Row>

                            {/* ── Associate & Booking ─────────────────────────────── */}
                            <SectionTitle>Booking</SectionTitle>
                            <Row className="g-3">
                              
                                <Field label="Date of Booking" required>
                                    <input type="date" className="form-control" style={inputStyle}
                                        value={form.dateOfBooking} onChange={handleFieldChange('dateOfBooking')} />
                                </Field>
                                 <Field label="Builder Name" required>
                                    <input type="text" className="form-control" style={inputStyle}
                                        value={form.builderName} onChange={handleFieldChange('builderName')} placeholder="Builder Name" />
                                </Field>
                                <Field label="Project Name" required>
                                    <input type="text" className="form-control" style={inputStyle}
                                        value={form.projectName} onChange={handleFieldChange('projectName')} placeholder="Project Name" />
                                </Field>
                                <Field label="Type of Property" required>
                                    <input type="text" className="form-control" style={inputStyle}
                                        value={form.typeOfProperty} onChange={handleFieldChange('typeOfProperty')} placeholder="Type of Property" />
                                </Field>

                                <Field label="Client Name" required>
                                    <input type="text" className="form-control" style={inputStyle}
                                        value={form.clientName} onChange={handleFieldChange('clientName')} placeholder="Client Name" />
                                </Field>
                                <Field label="Unit No." required>
                                    <input type="text" className="form-control" style={inputStyle}
                                        value={form.unitNo} onChange={handleFieldChange('unitNo')} placeholder="Unit No" />
                                </Field>
                                <Field label="Unit Details" required>
                                    <input type="text" className="form-control" style={inputStyle}
                                        value={form.unitDetails} onChange={handleFieldChange('unitDetails')} placeholder="Unit Details" />
                                </Field>
                            </Row>


                            {/* ── Pricing & Location ──────────────────────────────── */}
                            <SectionTitle>Pricing &amp; Location</SectionTitle>
                            <Row className="g-3">
                                <Field label="BSP" required>
                                    <input type="number" className="form-control" style={inputStyle}
                                        value={form.bsp} onChange={handleFieldChange('bsp')} placeholder="BSP" min={0} />
                                </Field>
                                <Field label="Area" required>
                                    <input type="number" className="form-control" style={inputStyle}
                                        value={form.area} onChange={handleFieldChange('area')} placeholder="Area" min={0} />
                                </Field>
                                <Field label="BBA Value" required>
                                    <input type="number" className="form-control" style={inputStyle}
                                        value={form.bbaValue} onChange={handleFieldChange('bbaValue')} placeholder="BBA Value" min={0} />
                                </Field>
                                <Field label="Location" required>
                                    <input type="text" className="form-control" style={inputStyle}
                                        value={form.location} onChange={handleFieldChange('location')} placeholder="Location" />
                                </Field>
                            </Row>

                            {/* ── Actions ──────────────────────────────────────────── */}
                            <div style={{
                                display: 'flex', gap: 10, marginTop: 24, paddingTop: 16,
                                borderTop: '1px dashed #E2E8F0',
                            }}>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 7,
                                        padding: '10px 20px',
                                        background: `linear-gradient(135deg, ${defaultTheme.primary}, #007A6E)`,
                                        color: '#fff', border: 'none', borderRadius: 8,
                                        fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                                        opacity: saving ? 0.7 : 1,
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
