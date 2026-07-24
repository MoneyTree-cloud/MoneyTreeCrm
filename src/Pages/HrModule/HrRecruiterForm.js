/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import Select from 'react-select';
import { Container, Form, FormGroup, Row, Col } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { FaEye, FaFilePdf, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { defaultTheme } from '../../helpers/defaultTheme';
import { useUserStore } from "../../store/useUserStore";
import { useGet, usePost } from '../../Hooks/useApi';
import { ALL_DEPARTMENT_DROPDOWN, HR_LOCATION_DROPDOWN, CREATE_CANDIDATE_FORM, GET_ALL_USERS_DROPDOWN, JOB_TITLE_DROPDOWN, UPDATE_CANDIDATE_FORM, CHECK_MOBILE_EXISTS, CHECK_EMAIL_EXISTS } from '../../helpers/url_helper';
import { toast } from 'react-toastify';
import ScreenLoader from '../../constants/ScreenLoader';
import { useLocation, useNavigate } from 'react-router-dom';
import ApiClient, { hrImageBaseUrl } from '../../helpers/api_helper';
import { RequiredStar } from '../../helpers/function_helper';
import { sourceOptions } from '../../constants/global';

// ── Styles ────────────────────────────────────────────────────────────────────
if (document.getElementById("hrf-s")) document.getElementById("hrf-s").remove()
const _s = document.createElement("style")
_s.id = "hrf-s"
_s.textContent = `
    /* ── Card ── */
    .hrf-card { background:#fff; border:1px solid #D1D5DB; border-radius:14px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.06); }
    .hrf-card-hdr { background:linear-gradient(135deg,#005B52,#007A6E); padding:16px 24px; display:flex; align-items:center; gap:10px; }
    .hrf-card-hdr-title { font-size:15px; font-weight:800; color:#fff; }
    .hrf-card-hdr-sub { font-size:11px; color:rgba(255,255,255,.65); margin-top:2px; }
    .hrf-card-body { padding:16px 20px; }

    /* ── Section header ── */
    .hrf-sec { display:flex; align-items:center; gap:8px; margin:14px 0 10px; }
    .hrf-sec:first-child { margin-top:0; }
    .hrf-sec-label { font-size:9px; font-weight:800; color:#374151; text-transform:uppercase; letter-spacing:.8px; }
    .hrf-sec-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .hrf-sec-line { flex:1; height:1px; background:#E5E7EB; }

    /* ── Field label ── */
    .hrf-label { font-size:10px; font-weight:700; color:#374151; margin-bottom:3px; display:block; text-transform:uppercase; letter-spacing:.4px; }

    /* ── Text / date / time inputs ── */
    .hrf-input {
        width:100%; height:36px; padding:0 10px;
        border:1.5px solid #374151;   /* dark border — visible */
        border-radius:9px; font-size:13px; color:#111827;
        outline:none; transition:border-color .15s, box-shadow .15s;
        background:#fff;
    }
    .hrf-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.1); }
    .hrf-input.is-invalid { border-color:#EF4444 !important; }
    .hrf-input::placeholder { color:#9CA3AF; }
    textarea.hrf-input { height:auto; padding:8px 10px; resize:vertical; }

    /* ── Select override ── */
    .hrf-select-wrap .react-select__control {
        min-height:36px !important;
        border:1.5px solid #374151 !important;
        border-radius:9px !important;
        font-size:13px !important;
        box-shadow:none !important;
    }
    .hrf-select-wrap .react-select__control--is-focused {
        border-color:#005B52 !important;
        box-shadow:0 0 0 3px rgba(0,91,82,.1) !important;
    }
    .hrf-select-wrap.is-invalid .react-select__control { border-color:#EF4444 !important; }

    /* ── Radio pill group ── */
    .hrf-radio-group { display:flex; gap:8px; flex-wrap:wrap; }
    .hrf-radio-pill {
        display:flex; align-items:center; gap:5px;
        padding:5px 11px; border-radius:7px; border:1.5px solid #374151;
        background:#fff; font-size:12px; font-weight:600; color:#374151;
        cursor:pointer; user-select:none; transition:all .14s;
    }
    .hrf-radio-pill input { display:none; }
    .hrf-radio-pill:hover { border-color:#005B52; color:#005B52; background:#F0FDF4; }
    .hrf-radio-pill.checked { border-color:#005B52; background:#005B52; color:#fff; }
    .hrf-radio-pill.checked-gold { border-color:#C9A84C; background:#C9A84C; color:#fff; }
    .hrf-radio-pill.checked-red { border-color:#EF4444; background:#FEF2F2; color:#EF4444; }

    /* ── CV upload zone ── */
    .hrf-cv-wrap { display:flex; align-items:center; gap:8px; }
    .hrf-cv-input { flex:1; height:40px; padding:7px 12px; border:1.5px solid #374151; border-radius:9px; font-size:12px; color:#374151; cursor:pointer; }
    .hrf-cv-input.is-invalid { border-color:#EF4444; }

    /* ── Error text ── */
    .hrf-err { font-size:11px; color:#EF4444; margin-top:4px; font-weight:500; }

    /* ── Action buttons ── */
    .hrf-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 20px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; border:none; transition:all .15s; }
    .hrf-btn-primary { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; box-shadow:0 3px 10px rgba(0,91,82,.22); }
    .hrf-btn-primary:hover { opacity:.88; }
    .hrf-btn-primary:disabled { opacity:.5; cursor:not-allowed; }
    .hrf-btn-secondary { background:#F3F4F6; color:#374151; border:1.5px solid #D1D5DB; }
    .hrf-btn-secondary:hover { background:#E5E7EB; }
`
document.head.appendChild(_s)

const SELECT_STYLES = {
    control: (b, st) => ({ ...b, minHeight: 40, fontSize: 13, border: `1.5px solid ${st.isFocused ? "#005B52" : "#374151"}`, borderRadius: 9, boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.1)" : "none" }),
    option: (b, st) => ({ ...b, fontSize: 13, background: st.isSelected ? "#005B52" : st.isFocused ? "#f0fdf9" : "#fff", color: st.isSelected ? "#fff" : "#111827" }),
    placeholder: b => ({ ...b, color: "#9CA3AF", fontSize: 13 }),
    menuPortal: b => ({ ...b, zIndex: 9999 }),
}

// Radio pill helper
const RadioPill = ({ name, value, checked, onChange, label, variant }) => {
    const cls = checked ? (variant === 'gold' ? 'hrf-radio-pill checked-gold' : variant === 'red' ? 'hrf-radio-pill checked-red' : 'hrf-radio-pill checked') : 'hrf-radio-pill'
    return (
        <label className={cls}>
            <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
            {checked && <FaCheck size={9} />} {label}
        </label>
    )
}

// Field wrapper
const Field = ({ label, required, error, children }) => (
    <FormGroup style={{ marginBottom: 10 }}>
        <label className="hrf-label">{label}{required && <RequiredStar />}</label>
        {children}
        {error && <div className="hrf-err">{error}</div>}
    </FormGroup>
)

export default function HrRecruiterForm() {
    const navigate = useNavigate()
    const location = useLocation()
    const { rowData, filters, page, candidateStatus, showFilters, final_Status } = location.state || {}
    const { empCode, userName, userId } = useUserStore(s => s.user)

    const { data: branchList } = useGet(HR_LOCATION_DROPDOWN)
    const { data: departmentList } = useGet(ALL_DEPARTMENT_DROPDOWN)
    const { data: usersList } = useGet(GET_ALL_USERS_DROPDOWN)
    const { data: jobTitleList } = useGet(JOB_TITLE_DROPDOWN)

    const [fileSelected, setFileSelected] = useState(false)
    const [cvFile, setCvFile] = useState(null)
    const [errors, setErrors] = useState({})
    const [disabled, setDisabled] = useState(false)
    const [remainingTime, setRemainingTime] = useState(0)

    const locationOptions = branchList?.data?.data?.map(l => ({ value: l.key, label: l.value })) || []
    const filteredDepartments = departmentList?.data?.data?.filter(d => d?.value !== "Sales")

    const [formData, setFormData] = useState({
        recruiterName: userName, recruiterEmpCode: empCode,
        source: null, applicantName: '', mobile: '', email: '',
        division: 'Sales', branch: null, interviewForLocation: null,
        jobTitle: null, referral: null, experience: '', working: false,
        interested: '', interviewDate: '', interviewTimeFrom: '', interviewTimeTo: '', remarks: ''
    })

    useEffect(() => {
        if (!rowData || !jobTitleList?.data?.data || !usersList?.data?.data || !locationOptions.length) return
        const matchedJobTitle = jobTitleList.data.data.find(j => j.label === rowData.jobTitle)
        const matchedSource = sourceOptions.find(s => s.value === rowData.sources?.[0]?.sourceName)
        const matchedIvwForLoc = locationOptions.find(l => l.label === rowData.preferredLocationName)
        const matchedBranch = locationOptions.find(l => l.label === rowData.interviewLocationBranch)
        const matchedReferral = matchedSource?.value === 'Referral' ? usersList.data.data.find(u => u.label === rowData.sources?.[0]?.sourceDetails) : null
        const matchedDept = rowData.department ? filteredDepartments?.find(d => d.label === rowData.department) : null
        const resumeDoc = rowData.documents?.find(d => d.documentType === 'RESUME')
        if (resumeDoc) setCvFile({ name: resumeDoc.filePath, url: `${process.env.REACT_APP_BASE_URL}/uploads/${resumeDoc.filePath}`, isServerFile: true })

        setFormData(p => ({
            ...p,
            applicantName: rowData.firstName || '', mobile: rowData.phone || '', email: rowData.email || '',
            source: matchedSource || null, referral: matchedReferral || null,
            jobTitle: matchedJobTitle || null, branch: matchedBranch || null,
            interviewForLocation: matchedIvwForLoc || null,
            division: rowData.department === 'Sales' ? 'Sales' : 'Non-Sales',
            department: matchedDept || null,
            experience: rowData.fresher === false ? 'Yes' : 'No',
            working: rowData.working === true ? 'Yes' : 'No',
            interested: rowData.status === 'NOT_INTERESTED' ? 'No' : rowData.status === 'CALLBACK' ? 'CALLBACK' : rowData.status === 'DO_NOT_CALL' ? 'DO_NOT_CALL' : 'Yes',
            interviewDate: rowData?.interviews[0]?.scheduledAtDate || '',
            interviewTimeFrom: rowData?.interviews[0]?.scheduledAtTime || '',
            interviewTimeTo: rowData?.interviews[0]?.scheduledToTime || '',
            remarks: rowData?.createRemarks || '',
        }))
    }, [rowData, jobTitleList?.data?.data, usersList?.data?.data, locationOptions.length, filteredDepartments?.length])

    useEffect(() => {
        const until = localStorage.getItem("disableUntil")
        if (!until) return
        const remaining = until - Date.now()
        if (remaining > 0) {
            setDisabled(true); setRemainingTime(Math.ceil(remaining / 1000))
            const t = setInterval(() => {
                const r = until - Date.now()
                if (r <= 0) { setDisabled(false); localStorage.removeItem("disableUntil"); setRemainingTime(0); clearInterval(t) }
                else setRemainingTime(Math.ceil(r / 1000))
            }, 1000)
            return () => clearInterval(t)
        } else { setDisabled(false); localStorage.removeItem("disableUntil") }
    }, [])

    useEffect(() => {
        if (formData.mobile.length !== 10 || formData.mobile === rowData?.phone) return
        ApiClient.post(CHECK_MOBILE_EXISTS + formData.mobile)
            .then(res => setErrors(p => ({ ...p, mobile: res.data.status === 0 ? res.data.message : "" })))
            .catch(() => { })
    }, [formData.mobile])

    const handleEmailBlur = async () => {
        if (!formData.email || formData.email === rowData?.email) return
        try {
            const res = await ApiClient.post(CHECK_EMAIL_EXISTS + formData.email)
            setErrors(p => ({ ...p, email: res.data.status === 0 ? res.data.message : "" }))
        } catch { }
    }

    const handleChange = (field, value) => {
        let upd = { ...formData, [field]: value }
        if (field === 'division' && value === 'Sales') upd.department = null
        if (field === 'interested' && value === 'No') upd = { ...upd, interviewDate: '', interviewTimeFrom: '', interviewTimeTo: '' }
        setFormData(upd)
        setErrors(p => {
            const n = { ...p }; delete n[field]
            if (field === 'interested' && value === 'No') { delete n.interviewDate; delete n.interviewTimeFrom; delete n.interviewTimeTo }
            if (field === 'division') { delete n.mainTeam; delete n.department }
            return n
        })
    }

    const handleMobileChange = e => { let v = e.target.value.replace(/\D/g, ''); if (v.length > 10) v = v.slice(0, 10); handleChange('mobile', v) }

    const validate = () => {
        const e = {}
        if (!formData.source) e.source = 'Source is required'
        if (formData.source?.value === 'Referral' && !formData.referral) e.referral = 'Referral is required'
        if (!formData.applicantName.trim()) e.applicantName = 'Applicant name is required'
        if (!formData.mobile.trim()) e.mobile = 'Mobile is required'
        else if (!/^\d{10}$/.test(formData.mobile.trim())) e.mobile = 'Must be 10 digits'
        if (!formData.email.trim()) e.email = 'Email is required'
        else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())) e.email = 'Invalid email'
        if (!formData.jobTitle) e.jobTitle = 'Position is required'
        if (!formData.branch) e.branch = 'Interview At location is required'
        if (!formData.interviewForLocation) e.interviewForLocation = 'Interview For location is required'
        if (!cvFile && !rowData?.documents?.some(d => d.documentType === 'RESUME')) e.cv = 'CV is required'
        if (formData.division === 'Non-Sales' && !formData.department) e.department = 'Department is required'
        if (formData.interested === 'Yes') {
            if (!formData.interviewDate) e.interviewDate = 'Interview date is required'
            if (!formData.interviewTimeFrom) e.interviewTimeFrom = 'Start time is required'
            if (!formData.interviewTimeTo) e.interviewTimeTo = 'End time is required'
            if (formData.interviewTimeFrom && formData.interviewTimeTo && formData.interviewTimeFrom >= formData.interviewTimeTo) {
                e.interviewTimeFrom = 'Start must be before end'; e.interviewTimeTo = 'End must be after start'
            }
        }
        setErrors(e); return Object.keys(e).length === 0
    }

    const handleSubmit = e => {
        e.preventDefault()
        if (!validate()) return
        if (!formData.experience) { toast.error('Experience is required'); return }
        if (formData.experience === 'Yes' && !formData.working) { toast.error('Working or Not is required'); return }
        if (!formData.interested) { toast.error('Interested / Not or Hold is required'); return }
        const statusMap = { Yes: 'INTERESTED', No: 'NOT_INTERESTED', CALLBACK: 'CALLBACK', DO_NOT_CALL: 'DO_NOT_CALL', CALL_NOT_PICKED: 'CALL_NOT_PICKED' }
        const updStatus = statusMap[formData.interested]
        const finalSt = !rowData?.id ? updStatus : updStatus === rowData.status ? rowData.status : updStatus
        const fd = new FormData()
        fd.append("firstName", formData.applicantName)
        fd.append("email", formData.email)
        fd.append("phone", formData.mobile)
        fd.append("sourceType", formData.source?.value === 'Referral' ? 'REFERRAL' : 'JOB_PORTAL')
        fd.append("sourceName", formData.source?.value)
        fd.append("candidateStatus", finalSt)
        fd.append("hrId", userId)
        fd.append("interviewDate", formData.interviewDate)
        fd.append("startTime", rowData?.id ? formData.interviewTimeFrom?.slice(0, 5) : formData.interviewTimeFrom)
        fd.append("endTime", rowData?.id ? formData.interviewTimeTo?.slice(0, 5) : formData.interviewTimeTo)
        fd.append("department", formData.division === 'Sales' ? 'Sales' : formData.department?.value)
        fd.append("location", formData.interviewForLocation?.value)
        if (cvFile && !cvFile?.isServerFile) fd.append("resume", cvFile)
        fd.append("isFresher", formData.experience === 'Yes' ? false : true)
        fd.append("isWorking", formData.working === 'Yes' ? true : false)
        fd.append("jobTitle", formData?.jobTitle?.label)
        fd.append("jobDescription", formData?.jobTitle?.value)
        fd.append("sourceDetails", formData.source?.value === 'Referral' ? formData?.referral?.label : null)
        fd.append("interviewLocation", formData?.branch?.value)
        fd.append("remarks", formData?.remarks)
        if (rowData?.id) { fd.append("candidateId", rowData.id); updateCandidateForm(fd) }
        else createCandidateForm(fd)
    }

    const onSuccess = res => {
        if (res?.data.status === 1) {
            toast.success(res.data.message)
            const until = Date.now() + 40000; localStorage.setItem("disableUntil", until)
            setDisabled(true); handleBack()
        } else toast.error(res.data.message)
    }

    const { isPending: addLoading, mutate: createCandidateForm } = usePost(CREATE_CANDIDATE_FORM, { onSuccess, onError: err => toast.error(err.message) })
    const { isPending: updateLoading, mutate: updateCandidateForm } = usePost(UPDATE_CANDIDATE_FORM, { onSuccess, onError: err => toast.error(err.message) })

    const handleBack = () => navigate("/recruiter-history", { state: { filters, page, candidateStatus, showFilters, final_Status, highlightRowId: rowData?.id || location.state?.highlightRowId } })

    const resumeDoc = rowData?.documents?.find(d => d.documentType === 'RESUME')

    return (
        <PageContent>
            <Breadcrumbs title="HR Module" breadcrumbItem={rowData?.id ? "Update Candidate" : "Add Candidate"} />
            {(addLoading || updateLoading) && <ScreenLoader />}
            <Container>
                <div className="hrf-card">

                    {/* Header */}
                    <div className="hrf-card-hdr">
                        <div>
                            <div className="hrf-card-hdr-title">{rowData?.id ? "✏️ Update Candidate" : "➕ Add New Candidate"}</div>
                            <div className="hrf-card-hdr-sub">{rowData?.id ? `Editing: ${rowData.firstName}` : "Fill in the details below to register a new candidate"}</div>
                        </div>
                    </div>

                    <div className="hrf-card-body">
                        <Form onSubmit={handleSubmit}>

                            {/* ── Section 1: Personal Info ── */}
                            <div className="hrf-sec">
                                <span className="hrf-sec-dot" style={{ background: "#005B52" }} />
                                <span className="hrf-sec-label">Personal Information</span>
                                <span className="hrf-sec-line" />
                            </div>
                            <Row className="g-2">
                                <Col md={3}>
                                    <Field label="Applicant Name" required error={errors.applicantName}>
                                        <input className={`hrf-input${errors.applicantName ? " is-invalid" : ""}`}
                                            placeholder="First name" value={formData.applicantName}
                                            onChange={e => handleChange('applicantName', e.target.value)} />
                                    </Field>
                                </Col>
                                <Col md={3}>
                                    <Field label="Mobile Number" required error={errors.mobile}>
                                        <input className={`hrf-input${errors.mobile ? " is-invalid" : ""}`}
                                            placeholder="10-digit number" value={formData.mobile}
                                            onChange={handleMobileChange} maxLength={10} />
                                    </Field>
                                </Col>
                                <Col md={3}>
                                    <Field label="Email" required error={errors.email}>
                                        <input type="email" className={`hrf-input${errors.email ? " is-invalid" : ""}`}
                                            placeholder="name@example.com" value={formData.email}
                                            onChange={e => handleChange('email', e.target.value)}
                                            onBlur={handleEmailBlur} />
                                    </Field>
                                </Col>
                                <Col md={3}>
                                    <Field label="Source of CV" required error={errors.source}>
                                        <div className={`hrf-select-wrap${errors.source ? " is-invalid" : ""}`}>
                                            <Select options={sourceOptions} value={formData.source} isClearable
                                                onChange={val => handleChange('source', val)}
                                                styles={SELECT_STYLES} menuPortalTarget={document.body} />
                                        </div>
                                    </Field>
                                </Col>
                                {formData.source?.value === 'Referral' && (
                                    <Col md={3}>
                                        <Field label="Select Referral" required error={errors.referral}>
                                            <div className={`hrf-select-wrap${errors.referral ? " is-invalid" : ""}`}>
                                                <Select options={usersList?.data?.data || []} value={formData.referral} isClearable
                                                    onChange={val => handleChange('referral', val)}
                                                    styles={SELECT_STYLES} menuPortalTarget={document.body} />
                                            </div>
                                        </Field>
                                    </Col>
                                )}
                                <Col md={3}>
                                    <Field label="CV Attachment" required error={errors.cv}>
                                        <div className="hrf-cv-wrap">
                                            <input type="file" className={`hrf-cv-input${errors.cv ? " is-invalid" : ""}`}
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                onChange={e => { setCvFile(e.target.files[0]); setFileSelected(true); if (errors.cv) setErrors(p => { const n = { ...p }; delete n.cv; return n }) }}
                                                style={{ height: 36, fontSize: 12 }} />
                                            {fileSelected ? (
                                                <FaEye size={16} color={defaultTheme.primary} style={{ cursor: "pointer", flexShrink: 0 }}
                                                    onClick={() => window.open(URL.createObjectURL(cvFile), '_blank')} title="View" />
                                            ) : resumeDoc ? (
                                                <a href={`${hrImageBaseUrl}${resumeDoc.filePath}`} target="_blank" rel="noopener noreferrer" title="Open Resume">
                                                    <FaFilePdf size={16} color={defaultTheme.redColor} style={{ flexShrink: 0 }} />
                                                </a>
                                            ) : null}
                                        </div>
                                    </Field>
                                </Col>
                            </Row>

                            {/* ── Section 2: Position & Location ── */}
                            <div className="hrf-sec">
                                <span className="hrf-sec-dot" style={{ background: "#C9A84C" }} />
                                <span className="hrf-sec-label">Position & Location</span>
                                <span className="hrf-sec-line" />
                            </div>
                            <Row className="g-2">
                                <Col md={3}>
                                    <Field label="Position" required error={errors.jobTitle}>
                                        <div className={`hrf-select-wrap${errors.jobTitle ? " is-invalid" : ""}`}>
                                            <Select options={jobTitleList?.data?.data || []} value={formData.jobTitle} isClearable
                                                onChange={val => handleChange('jobTitle', val)}
                                                styles={SELECT_STYLES} menuPortalTarget={document.body} />
                                        </div>
                                    </Field>
                                </Col>
                                <Col md={3}>
                                    <Field label="Interview At Location" required error={errors.branch}>
                                        <div className={`hrf-select-wrap${errors.branch ? " is-invalid" : ""}`}>
                                            <Select options={locationOptions} value={formData.branch} isClearable
                                                onChange={val => handleChange('branch', val)}
                                                styles={SELECT_STYLES} menuPortalTarget={document.body} />
                                        </div>
                                    </Field>
                                </Col>
                                <Col md={3}>
                                    <Field label="Interview For Location" required error={errors.interviewForLocation}>
                                        <div className={`hrf-select-wrap${errors.interviewForLocation ? " is-invalid" : ""}`}>
                                            <Select options={locationOptions} value={formData.interviewForLocation} isClearable
                                                onChange={val => handleChange('interviewForLocation', val)}
                                                styles={SELECT_STYLES} menuPortalTarget={document.body} />
                                        </div>
                                    </Field>
                                </Col>
                                <Col md={3}>
                                    <Field label="Division" required>
                                        <div className="hrf-radio-group">
                                            {["Sales", "Non-Sales"].map(v => (
                                                <RadioPill key={v} name="division" value={v} checked={formData.division === v}
                                                    onChange={() => handleChange('division', v)} label={v} />
                                            ))}
                                        </div>
                                    </Field>
                                </Col>
                                {formData.division === 'Non-Sales' && (
                                    <Col md={3}>
                                        <Field label="Department" required error={errors.department}>
                                            <div className={`hrf-select-wrap${errors.department ? " is-invalid" : ""}`}>
                                                <Select options={filteredDepartments || []} value={formData.department} isClearable menuPlacement="auto"
                                                    onChange={val => handleChange('department', val)} placeholder="Select department"
                                                    styles={SELECT_STYLES} menuPortalTarget={document.body} />
                                            </div>
                                        </Field>
                                    </Col>
                                )}
                            </Row>

                            {/* ── Section 3: Candidate Status ── */}
                            <div className="hrf-sec">
                                <span className="hrf-sec-dot" style={{ background: "#7C3AED" }} />
                                <span className="hrf-sec-label">Candidate Status</span>
                                <span className="hrf-sec-line" />
                            </div>

                            <Row className="g-2">
                                <Col md={3}>
                                    <Field label="Experience" required>
                                        <div className="hrf-radio-group">
                                            {["Yes", "No"].map(v => (
                                                <RadioPill key={v} name="experience" value={v} checked={formData.experience === v}
                                                    onChange={() => handleChange('experience', v)} label={v} />
                                            ))}
                                        </div>
                                    </Field>
                                </Col>
                                {formData.experience === 'Yes' && (
                                    <Col md={3}>
                                        <Field label="Currently Working" required>
                                            <div className="hrf-radio-group">
                                                {["Yes", "No"].map(v => (
                                                    <RadioPill key={v} name="working" value={v} checked={formData.working === v}
                                                        onChange={() => handleChange('working', v)} label={v} />
                                                ))}
                                            </div>
                                        </Field>
                                    </Col>
                                )}
                                <Col md={6}>
                                    <Field label="Interested" required>
                                        <div className="hrf-radio-group">
                                            {[
                                                { v: "Yes", l: "Yes", variant: "" },
                                                { v: "No", l: "No", variant: "red" },
                                                { v: "CALLBACK", l: "Call Back", variant: "gold" },
                                                { v: "DO_NOT_CALL", l: "Do Not Call", variant: "red" },
                                                { v: "CALL_NOT_PICKED", l: "Call Not Picked", variant: "red" },
                                            ].map(({ v, l, variant }) => (
                                                <RadioPill key={v} name="interested" value={v} checked={formData.interested === v}
                                                    onChange={() => handleChange('interested', v)} label={l} variant={variant} />
                                            ))}
                                        </div>
                                    </Field>
                                </Col>
                            </Row>

                            {/* ── Section 4: Interview Schedule (conditional) ── */}
                            {formData.interested === 'Yes' && (
                                <>
                                    <div className="hrf-sec">
                                        <span className="hrf-sec-dot" style={{ background: "#0284C7" }} />
                                        <span className="hrf-sec-label">Interview Schedule</span>
                                        <span className="hrf-sec-line" />
                                    </div>
                                    <Row className="g-2">
                                        <Col md={3}>
                                            <Field label="Interview Date" required error={errors.interviewDate}>
                                                <input type="date" className={`hrf-input${errors.interviewDate ? " is-invalid" : ""}`}
                                                    value={formData.interviewDate}
                                                    min={new Date().toISOString().split("T")[0]}
                                                    onChange={e => handleChange('interviewDate', e.target.value)} />
                                            </Field>
                                        </Col>
                                        <Col md={3}>
                                            <Field label="Time From" required error={errors.interviewTimeFrom}>
                                                <input type="time" className={`hrf-input${errors.interviewTimeFrom ? " is-invalid" : ""}`}
                                                    value={formData.interviewTimeFrom}
                                                    onChange={e => handleChange('interviewTimeFrom', e.target.value)} />
                                            </Field>
                                        </Col>
                                        <Col md={3}>
                                            <Field label="Time To" required error={errors.interviewTimeTo}>
                                                <input type="time" className={`hrf-input${errors.interviewTimeTo ? " is-invalid" : ""}`}
                                                    value={formData.interviewTimeTo}
                                                    onChange={e => handleChange('interviewTimeTo', e.target.value)} />
                                            </Field>
                                        </Col>
                                    </Row>
                                </>
                            )}

                            {/* ── Remarks ── */}
                            <Row className="g-2">
                                <Col md={6}>
                                    <Field label="Remarks">
                                        <textarea className="hrf-input" rows={2} placeholder="Enter remarks…"
                                            value={formData.remarks}
                                            onChange={e => handleChange('remarks', e.target.value)} />
                                    </Field>
                                </Col>
                            </Row>

                            {/* ── Actions ── */}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 12, borderTop: "1px solid #E5E7EB", marginTop: 4 }}>
                                <button type="button" className="hrf-btn hrf-btn-secondary" onClick={handleBack}>
                                    <FaArrowLeft size={12} /> Back
                                </button>
                                <button type="submit" className="hrf-btn hrf-btn-primary" disabled={disabled}>
                                    {disabled ? `⏳ Wait ${remainingTime}s…` : rowData?.id ? "✓ Update" : "✓ Submit"}
                                </button>
                            </div>

                        </Form>
                    </div>
                </div>
            </Container>
        </PageContent>
    )
}