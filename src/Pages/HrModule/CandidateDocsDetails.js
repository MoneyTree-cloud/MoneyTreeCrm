/* eslint-disable react-hooks/rules-of-hooks */
import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { Container, Input } from 'reactstrap';
import { formatActionType, formatDate, formatDateTime, getNameOnly, numberToWordsIndian } from '../../helpers/function_helper';
import { FaUserTie, FaUpload, FaSave, FaFilePdf, FaArrowLeft, FaChevronDown, FaChevronUp, FaPaperPlane } from "react-icons/fa";
import { defaultTheme } from '../../helpers/defaultTheme';
import ApiClient, { hrImageBaseUrl } from '../../helpers/api_helper';
import { CANDIDATE_DOCUMENT_UPDATE, CANDIDATE_HISTORY_BY_ID, HR_DOCUMENT_UPDATE, HR_LOCATION_GET_ALL, SEND_OFFER_LETTER_MAIL, TRIAL_PERIOD_CREATE, TRIAL_PERIOD_UPDATE } from '../../helpers/url_helper';
import { useGet, usePost } from '../../Hooks/useApi';
import { toast } from 'react-toastify';
import ScreenLoader from '../../constants/ScreenLoader';
import { useUserStore } from '../../store/useUserStore';
import { MdBloodtype, MdCake, MdCalendarToday, MdChurch, MdDateRange, MdDescription, MdEdit, MdEmail, MdEmergency, MdFamilyRestroom, MdLocationOn, MdMoney, MdPerson, MdPersonOutline, MdPhone } from 'react-icons/md';
import Select from 'react-select';
import OfferLetterPDF from './OfferLetterPDF';

// ── Styles ─────────────────────────────────────────────────────────────────────
if (document.getElementById("cdd-s")) document.getElementById("cdd-s").remove()
const _s = document.createElement("style")
_s.id = "cdd-s"
_s.textContent = `
    /* ── Profile header ── */
    .cdd-hdr { background:linear-gradient(135deg,#005B52,#007A6E); border-radius:14px; padding:18px 22px; margin-bottom:14px; display:flex; align-items:center; gap:14px; position:relative; overflow:hidden; }
    .cdd-hdr::before { content:''; position:absolute; top:-40px; right:-40px; width:160px; height:160px; border-radius:50%; background:rgba(255,255,255,.05); pointer-events:none; }
    .cdd-hdr-avatar { width:48px; height:48px; border-radius:12px; background:rgba(255,255,255,.18); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; border:2px solid rgba(255,255,255,.3); }
    .cdd-hdr-name { font-size:17px; font-weight:800; color:#fff; }
    .cdd-hdr-sub  { font-size:11px; color:rgba(255,255,255,.65); margin-top:2px; }
    .cdd-hdr-badges { display:flex; gap:6px; flex-wrap:wrap; margin-top:7px; }
    .cdd-badge { padding:2px 9px; border-radius:20px; font-size:10px; font-weight:700; }
    .cdd-badge-green { background:rgba(34,197,94,.2); color:#bbf7d0; border:1px solid rgba(34,197,94,.3); }
    .cdd-badge-gold  { background:rgba(201,168,76,.2); color:#fde68a; border:1px solid rgba(201,168,76,.3); }
    .cdd-badge-blue  { background:rgba(59,130,246,.2); color:#bfdbfe; border:1px solid rgba(59,130,246,.3); }

    /* ── Section card ── */
    .cdd-sec { background:#fff; border:1px solid #E2E8F0; border-radius:12px; margin-bottom:12px; overflow:hidden; }
    .cdd-sec-hdr { display:flex; align-items:center; gap:9px; padding:11px 16px; border-bottom:1px solid #F1F5F9; cursor:pointer; user-select:none; }
    .cdd-sec-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
    .cdd-sec-label { font-size:11px; font-weight:800; color:#0F172A; flex:1; text-transform:uppercase; letter-spacing:.5px; }
    .cdd-sec-body  { padding:14px 16px; }

    /* ── KV grid ── */
    .cdd-kv-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px 16px; }
    @media(max-width:900px) { .cdd-kv-grid { grid-template-columns:repeat(2,1fr); } }
    @media(max-width:560px) { .cdd-kv-grid { grid-template-columns:1fr; } }
    .cdd-kv { display:flex; flex-direction:column; gap:3px; padding:9px 11px; background:#F8FAFC; border-radius:8px; border:1px solid #F1F5F9; }
    .cdd-kv-k { font-size:9px; font-weight:800; color:#94A3B8; text-transform:uppercase; letter-spacing:.5px; display:flex; align-items:center; gap:3px; }
    .cdd-kv-v { font-size:12px; font-weight:600; color:#0F172A; word-break:break-word; }

    /* ── Documents table ── */
    .cdd-table { width:100%; border-collapse:collapse; font-size:12px; }
    .cdd-table th { background:#F1F5F9; color:#374151; font-weight:700; padding:8px 12px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:.4px; border-bottom:2px solid #E2E8F0; }
    .cdd-table td { padding:8px 12px; border-bottom:1px solid #F1F5F9; color:#374151; vertical-align:middle; }
    .cdd-table tr:last-child td { border-bottom:none; }
    .cdd-table tr:hover td { background:#FAFAFA; }

    /* ── Upload cell ── */
    .cdd-upload-cell { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .cdd-upload-btn { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:7px; font-size:11px; font-weight:700; cursor:pointer; border:1.5px solid #E2E8F0; background:#F8FAFC; color:#374151; transition:all .14s; }
    .cdd-upload-btn:hover { border-color:#005B52; color:#005B52; background:#F0FDF4; }
    .cdd-save-btn { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:7px; font-size:11px; font-weight:700; cursor:pointer; border:none; background:linear-gradient(135deg,#16A34A,#22C55E); color:#fff; transition:opacity .14s; }
    .cdd-save-btn:hover { opacity:.88; }
    .cdd-filename { font-size:11px; color:#64748B; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    /* ── Add doc section ── */
    .cdd-add-doc { background:#F8FAFC; border:1.5px dashed #CBD5E1; border-radius:10px; padding:14px 16px; margin-top:12px; }
    .cdd-add-doc-title { font-size:10px; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:.6px; margin-bottom:10px; }
    .cdd-add-input { width:100%; height:36px; padding:0 11px; border:1.5px solid #D1D5DB; border-radius:8px; font-size:12px; outline:none; transition:border-color .15s; }
    .cdd-add-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }

    /* ── Trial period ── */
    .cdd-trial-form { display:grid; grid-template-columns:1fr 1fr auto auto; gap:12px; align-items:end; }
    @media(max-width:700px) { .cdd-trial-form { grid-template-columns:1fr 1fr; } }

    /* ── Action buttons ── */
    .btn-group {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}
    .cdd-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 18px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; border:none; transition:all .15s; }
    .cdd-btn-primary   { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff;align-self: flex-start;  }
    .cdd-btn-primary:hover { opacity:.88; }
    .cdd-btn-secondary { background:#F1F5F9; color:#374151; border:1.5px solid #E2E8F0; }
    .cdd-btn-secondary:hover { background:#E2E8F0; }
    .cdd-btn-success   { background:linear-gradient(135deg,#16A34A,#22C55E); color:#fff; }
    .cdd-btn-success:hover { opacity:.88; }
    .cdd-btn-disabled  { background:#D1D5DB; color:#9CA3AF; cursor:not-allowed; }

    .cdd-flabel { font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:.4px; margin-bottom:4px; display:block; }

    /* Select */
    .cdd-sec-body .react-select__control { min-height:36px; border:1.5px solid #D1D5DB; border-radius:8px; font-size:12px; }
    .cdd-sec-body .react-select__control--is-focused { border-color:#005B52 !important; box-shadow:0 0 0 3px rgba(0,91,82,.08) !important; }

    /* ── Responsive ── */

    /* Tablet landscape (≤1024px) */
    @media(max-width:1024px){
        .cdd-kv-grid { grid-template-columns:repeat(3,1fr); }
        .cdd-hdr { padding:16px 18px; gap:12px; }
        .cdd-hdr-name { font-size:15px; }
    }

    /* Tablet portrait (≤768px) */
    @media(max-width:768px){
        .cdd-kv-grid { grid-template-columns:repeat(2,1fr); }
        .cdd-hdr { flex-wrap:wrap; padding:14px 16px; gap:10px; }
        .cdd-hdr-avatar { width:42px; height:42px; font-size:18px; border-radius:10px; }
        .cdd-hdr-name { font-size:14px; }
        .cdd-hdr-sub  { font-size:10px; }
        .cdd-sec-hdr  { padding:10px 14px; }
        .cdd-sec-body { padding:12px 14px; }
        .cdd-btn { padding:7px 14px; font-size:11px; }
        .cdd-table th, .cdd-table td { padding:6px 10px; font-size:11px; }
        /* Add doc grid */
        .cdd-add-doc > div[style*="grid"] { grid-template-columns:1fr 1fr !important; }
        .cdd-add-doc > div[style*="grid"] > button { grid-column:span 2; justify-content:center; }
        /* Trial period grid */
        .cdd-trial-form { grid-template-columns:1fr 1fr !important; }
    }

    /* Mobile (≤560px) */
    @media(max-width:560px){
        .cdd-kv-grid { grid-template-columns:1fr; }
        .cdd-kv-grid .cdd-kv[style*="span 2"] { grid-column:span 1 !important; }
        .cdd-hdr { padding:12px 14px; border-radius:12px; }
        .cdd-hdr-avatar { width:38px; height:38px; font-size:16px; border-radius:8px; }
        .cdd-hdr-name { font-size:13px; }
        .cdd-badge { font-size:9px; padding:2px 7px; }
        .cdd-sec-hdr { padding:9px 12px; }
        .cdd-sec-label { font-size:10px; }
        .cdd-sec-body { padding:10px 12px; }
        .cdd-kv { padding:7px 9px; }
        .cdd-kv-v { font-size:11px; }
        .cdd-btn { padding:6px 12px; font-size:11px; }
        .cdd-btn-primary { margin-right:6px; }
        .cdd-table th  { font-size:9px; padding:5px 8px; }
        .cdd-table td  { font-size:11px; padding:5px 8px; }
        .cdd-upload-cell { flex-wrap:wrap; gap:6px; }
        /* Add doc — single column */
        .cdd-add-doc > div[style*="grid"] { grid-template-columns:1fr !important; }
        .cdd-add-doc > div[style*="grid"] > button { grid-column:span 1; }
        .cdd-add-doc { padding:12px; }
        /* Trial period — single column */
        div[style*="1fr 1fr 1fr auto auto"] { grid-template-columns:1fr 1fr !important; }
    }

    /* Very small (≤380px) */
    @media(max-width:380px){
        .cdd-hdr { padding:10px 12px; border-radius:10px; }
        .cdd-hdr-avatar { width:34px; height:34px; font-size:14px; }
        .cdd-hdr-name { font-size:12px; }
        .cdd-sec-body { padding:9px 10px; }
        .cdd-kv { padding:6px 8px; }
        .cdd-kv-v { font-size:10px; }
        .cdd-btn { padding:6px 10px; font-size:10px; }
        .cdd-table th { font-size:8px; padding:4px 6px; }
        .cdd-table td { font-size:10px; padding:4px 6px; }
        div[style*="1fr 1fr 1fr auto auto"] { grid-template-columns:1fr !important; }
    }
`
document.head.appendChild(_s)

const SEL_STYLES = {
    control: (b, st) => ({ ...b, minHeight: 36, fontSize: 12, border: `1.5px solid ${st.isFocused ? "#005B52" : "#D1D5DB"}`, borderRadius: 8, boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.08)" : "none" }),
    option: (b, st) => ({ ...b, fontSize: 12, background: st.isSelected ? "#005B52" : st.isFocused ? "#f0fdf9" : "#fff", color: st.isSelected ? "#fff" : "#0F172A" }),
    menuPortal: b => ({ ...b, zIndex: 9999 }),
}

// KV pair
const KV = ({ label, value, icon, span2 }) => (
    <div className="cdd-kv" style={span2 ? { gridColumn: "span 2" } : {}}>
        <div className="cdd-kv-k">{icon && <span style={{ fontSize: 11 }}>{icon}</span>}{label}</div>
        <div className="cdd-kv-v">{value || <span style={{ color: "#94A3B8", fontWeight: 400 }}>—</span>}</div>
    </div>
)

// Collapsible section
const Sec = ({ dot = "#005B52", label, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="cdd-sec">
            <div className="cdd-sec-hdr" onClick={() => setOpen(p => !p)}>
                <span className="cdd-sec-dot" style={{ background: dot }} />
                <span className="cdd-sec-label">{label}</span>
                {open ? <FaChevronUp size={10} color="#94A3B8" /> : <FaChevronDown size={10} color="#94A3B8" />}
            </div>
            {open && <div className="cdd-sec-body">{children}</div>}
        </div>
    )
}

const docTypeLabel = t => {
    const m = { RELIVING_LETTER: 'Reliving Letter/Resignation Email', SALARY_SLIP: 'Salary Slip / Certificate / Bank Statement', DRIVING_LICENCE: 'DL / Learning', PAN: 'PAN / Applied For', ADDRESS_PROOF: 'Address Proof (Aadhar Front)', ADDRESS_PROOF_BACK: 'Address Proof (Aadhar Back)' }
    return m[t] || formatActionType(t) || '—'
}

export default function CandidateDocsDetails() {
    const location = useLocation()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const userid = useUserStore(s => s.user.userId)
    const { rowData, filters, page, showFilters } = location.state || {}

    const { data: candidateData, refetch: getCandidateData } = useGet(CANDIDATE_HISTORY_BY_ID + rowData?.id)
    const { data: locationList } = useGet(HR_LOCATION_GET_ALL)

    const [tpStartDate, setTpStartDate] = useState('')
    const [tpEndDate, setTpEndDate] = useState('')
    const [isEditingTrial, setIsEditingTrial] = useState(false)
    const [trialStatus, setTrialStatus] = useState(null)
    const [fileInputs, setFileInputs] = useState({})
    const [isPending, setIsPending] = useState(false)

    const locations = locationList?.data?.data || []
    const selectedLoc = locations.find(l => l?.name?.toLowerCase() === rowData?.finalLocation?.toLowerCase())
    const locationAddress = selectedLoc?.address || rowData?.finalLocation
    const lastHandover = rowData?.handovers?.[rowData?.handovers?.length - 1]
    const candidate = candidateData?.data?.data

    const handleFileChange = (e, docId) => setFileInputs(p => ({ ...p, [docId]: e.target.files[0] }))

    const handleUpload = (doc, file) => {
        if (!file) { toast.error("Please select a file."); return }
        const fd = new FormData()
        fd.append('candidateId', rowData.id); fd.append('documentType', doc.documentType)
        fd.append('document', file); fd.append('documentId', doc.id); fd.append('userId', userid)
        candidateDocumentsUpdate(fd)
    }

    const { isPending: addLoading, mutate: candidateDocumentsUpdate } = usePost(CANDIDATE_DOCUMENT_UPDATE, {
        onSuccess: res => { if (res?.data.status === 1) { toast.success(res.data.message); window.location.reload() } else toast.error(res.data.message) },
        onError: err => toast.error(err.message),
    })

    const handleNewDocUpload = () => {
        const { newDocType, newFile } = fileInputs
        if (!newDocType || !newFile) { toast.error("Select document type and file."); return }
        const fd = new FormData()
        fd.append('candidateId', rowData.id); fd.append('documentType', newDocType.value)
        fd.append('document', newFile); fd.append('userId', userid)
        hrDocumentsUpdate(fd)
    }

    const { isPending: addOtherLoading, mutate: hrDocumentsUpdate } = usePost(HR_DOCUMENT_UPDATE, {
        onSuccess: res => { if (res?.data.status === 1) { toast.success(res.data.message); setFileInputs(p => ({ ...p, newDocType: null, newFile: null })); if (fileInputRef.current) fileInputRef.current.value = ''; getCandidateData() } else toast.error(res.data.message) },
        onError: err => toast.error(err.message),
    })

    const submitTrialPeriod = () => {
        if (!tpStartDate) { toast.error('Select TP Start Date'); return }
        if (!tpEndDate) { toast.error('Select TP End Date'); return }
        if (new Date(tpStartDate) >= new Date(tpEndDate)) { toast.error('End date must be after start date'); return }
        isEditingTrial ? updateTrialPeriod() : createTrialPeriod()
    }

    const handleClear = () => { setTpStartDate(''); setTpEndDate(''); setIsEditingTrial(false) }
    const handleEditTrialPeriod = () => { setTpStartDate(rowData.candidateTrial?.startDate?.split("T")[0] || ''); setTpEndDate(rowData.candidateTrial?.endDate?.split("T")[0] || ''); setIsEditingTrial(true) }

    const { isPending: addTPLoading, mutate: createTrialPeriod } = usePost(`${TRIAL_PERIOD_CREATE}candidateId=${rowData?.id}&userId=${userid}&startDate=${tpStartDate}&endDate=${tpEndDate}&trialStatus=Started`, { onSuccess: res => { if (res?.data.status === 1) { toast.success(res.data.message); getCandidateData(); setIsEditingTrial(false); setTpStartDate(''); setTpEndDate('') } else toast.error(res.data.message) }, onError: err => toast.error(err.message) })
    const { isPending: updateTPLoading, mutate: updateTrialPeriod } = usePost(`${TRIAL_PERIOD_UPDATE}candidateId=${rowData?.id}&userId=${userid}&startDate=${tpStartDate}&endDate=${tpEndDate}&trialId=${rowData?.candidateTrial?.id}&trialStatus=${trialStatus?.value || 'Started'}`, { onSuccess: res => { if (res?.data.status === 1) { toast.success(res.data.message); getCandidateData(); setIsEditingTrial(false); setTpStartDate(''); setTpEndDate('') } else toast.error(res.data.message) }, onError: err => toast.error(err.message) })

    const handleSendOfferLetter = () => {
        if (!window.confirm("Send offer letter to this candidate?")) return
        const params = {
            candidateId: rowData.id, userId: Number(userid),
            candidateName: rowData?.firstName || "N/A", designation: rowData?.designation || "N/A",
            location: locationAddress || "N/A", joiningDate: formatDate(lastHandover?.doj) || "N/A",
            reportingManager: rowData?.handovers?.length ? getNameOnly(lastHandover?.reportingManagerName) : "N/A",
            salary: rowData.salary * 12 + ' (' + numberToWordsIndian(rowData.salary * 12) + ')' || "N/A",
            department: rowData.department || "N/A", payrollType: rowData.payrollType || "N/A",
        }
        setIsPending(true)
        ApiClient.post(`${SEND_OFFER_LETTER_MAIL}`, params)
            .then(res => { setIsPending(false); if (res?.data?.status === 1) { toast.success(res.data.message); navigate("/candidate-docs", { state: { filters, page, showFilters, highlightRowId: rowData?.id || location.state?.highlightRowId } }) } else toast.error(res.data.message) })
            .catch(err => { setIsPending(false); toast.error(err.message) })
    }

    if (!rowData) return <PageContent><Breadcrumbs title="HR Module" breadcrumbItem="Candidate Docs" /><Container><p className="text-danger mt-3">No candidate data available.</p></Container></PageContent>

    const docs = candidate?.documents || []

    return (
        <PageContent>
            <Breadcrumbs title="HR Module" breadcrumbItem="Candidate Docs Details" />
            {(addLoading || addTPLoading || updateTPLoading || addOtherLoading || isPending) && <ScreenLoader />}
            <Container fluid>

                {/* ── Profile header ── */}
                <div className="cdd-hdr">
                    <div className="cdd-hdr-avatar">👤</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="cdd-hdr-name">{rowData.firstName}</div>
                        <div className="cdd-hdr-sub">{rowData.designation} · {rowData.department}</div>
                        <div className="cdd-hdr-badges">
                            {rowData.finalStatusEnum && <span className="cdd-badge cdd-badge-gold">{rowData.finalStatusEnum}</span>}
                            {rowData.payrollType && <span className="cdd-badge cdd-badge-blue">{rowData.payrollType}</span>}
                            {rowData.empCode && <span className="cdd-badge cdd-badge-green">EMP: {rowData.empCode}</span>}
                        </div>
                    </div>
                    <button className="cdd-btn cdd-btn-secondary" style={{ border: "1.5px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.12)", color: "#fff", flexShrink: 0 }}
                        onClick={() => navigate("/candidate-docs", { state: { filters, page, showFilters, highlightRowId: rowData?.id || location.state?.highlightRowId } })}>
                        <FaArrowLeft size={11} /> Back
                    </button>
                </div>

                {/* ── Section 1: Profile ── */}
                <Sec dot="#005B52" label="Candidate Profile">
                    <div className="cdd-kv-grid">
                        <KV label="Name" value={rowData.firstName} icon={<MdPerson />} />
                        <KV label="Designation" value={rowData.designation} icon={<FaUserTie />} />
                        <KV label="Department" value={rowData.department} icon={<FaUserTie />} />
                        <KV label="DOJ" value={formatDate(lastHandover?.doj)} icon={<MdDateRange />} />
                        <KV label="Main Team" value={lastHandover?.mainTeam} />
                        <KV label="Sub Team" value={lastHandover?.subTeam} />
                        <KV label="Reporting Manager" value={lastHandover?.reportingManagerName} />
                        <KV label="Location" value={rowData.finalLocation} icon={<MdLocationOn />} />
                        <KV label="Phone" value={rowData.phone} icon={<MdPhone />} />
                        <KV label="Email" value={rowData.email} icon={<MdEmail />} />
                        <KV label="Emp Code" value={rowData.empCode} icon={<MdPerson />} />
                        <KV label="Referral" value={rowData.sources[0].sourceName === 'Referral' ? rowData.sources[0].sourceDetails : 'N/A'} />
                        <KV label="Father's Name" value={rowData.candidateDetails?.fatherName} icon={<MdPerson />} />
                        <KV label="Actual DOB" value={formatDate(rowData.candidateDetails?.actualDateOfBirth)} icon={<MdCake />} />
                        <KV label="DOB (Document)" value={formatDate(rowData.candidateDetails?.dateOfBirth)} icon={<MdCake />} />
                        <KV label="Gender" value={rowData.candidateDetails?.gender} icon={<MdPerson />} />
                        <KV label="Blood Group" value={rowData.candidateDetails?.bloodGroup} icon={<MdBloodtype />} />
                        <KV label="Religion" value={rowData.candidateDetails?.religion} icon={<MdChurch />} />
                        <KV label="Marital Status" value={rowData.candidateDetails?.maritalStatus} icon={<MdFamilyRestroom />} />
                        <KV label="Anniversary" value={formatDate(rowData.candidateDetails?.anniversary)} icon={<MdFamilyRestroom />} />
                        <KV label="Current Address" value={rowData.candidateDetails?.currentAddress} icon={<MdPerson />} span2 />
                        <KV label="Permanent Address" value={rowData.candidateDetails?.permanentAddress} icon={<MdPerson />} span2 />
                        <KV label="Emergency Name" value={rowData.candidateDetails?.emergencyPersonName} icon={<MdEmergency />} />
                        <KV label="Emergency Number" value={rowData.candidateDetails?.emergencyPersonNumber} icon={<MdEmergency />} />
                        <KV label="Emergency Relation" value={rowData.candidateDetails?.emergencyPersonRelation} icon={<MdEmergency />} />
                        <KV label="Nominee Name" value={rowData.candidateDetails?.nomineeName} icon={<MdPerson />} />
                        <KV label="Nominee DOB" value={formatDate(rowData.candidateDetails?.nomineeDateOfBirth)} icon={<MdCalendarToday />} />
                        <KV label="Nominee Relation" value={rowData.candidateDetails?.nomineeRelation} icon={<MdFamilyRestroom />} />

                    </div>
                </Sec>

                {/* ── Section 2: Final Overview ── */}
                <Sec dot="#C9A84C" label="Final Overview">
                    <div className="cdd-kv-grid">
                        <KV label="Final Salary / Contractual" value={rowData.salary || rowData.salaryAmount ? `₹${rowData.salary}/${rowData.salaryAmount || '—'}` : '—'} icon={<MdMoney />} />
                        <KV label="Final Status" value={rowData.finalStatusEnum} icon={<MdDescription />} />
                        <KV label="Other Remarks" value={rowData.finalStatusEnum !== 'Accept' ? rowData.remarks : '—'} icon={<MdDescription />} />
                        <KV label="Final Designation" value={rowData.designation} icon={<FaUserTie />} />
                        <KV label="Final Location" value={rowData.finalLocation} icon={<MdLocationOn />} />
                        <KV label="Pay Type" value={rowData.payrollType} icon={<MdDescription />} />
                        <KV label="Final Accept Remarks" value={rowData.finalRemarks} icon={<MdDescription />} span2 />
                    </div>
                </Sec>

                {/* ── Section 3: Documents ── */}
                <Sec dot="#3B82F6" label={`Documents (${docs.length})`}>
                    {docs.length > 0 ? (
                        <>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="cdd-table">
                                    <thead>
                                        <tr><th>Document Type</th><th>Uploaded At</th><th>Current File</th><th>Upload New</th></tr>
                                    </thead>
                                    <tbody>
                                        {docs.map((doc, i) => {
                                            const sel = fileInputs[doc.id]
                                            return (
                                                <tr key={doc.id || i}>
                                                    <td style={{ fontSize: 12 }}>{docTypeLabel(doc.documentType)}</td>
                                                    <td>{formatDateTime(doc.uploadedAt) || '—'}</td>
                                                    <td>{doc.filePath ? <a href={`${hrImageBaseUrl}${doc.filePath}`} target="_blank" rel="noopener noreferrer" title={`View ${formatActionType(doc.documentType)}`}><FaFilePdf size={16} color={defaultTheme.redColor} /></a> : '—'}</td>
                                                    <td>
                                                        <div className="cdd-upload-cell">
                                                            <label className="cdd-upload-btn">
                                                                <FaUpload size={10} /> Choose
                                                                <input type="file" style={{ display: 'none' }} onChange={e => handleFileChange(e, doc.id)} />
                                                            </label>
                                                            {sel && <>
                                                                <span className="cdd-filename">{sel.name}</span>
                                                                <button className="cdd-save-btn" onClick={() => handleUpload(doc, sel)}>
                                                                    <FaSave size={10} /> Save
                                                                </button>
                                                            </>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Add new document ── */}
                            <div className="cdd-add-doc">
                                <div className="cdd-add-doc-title">➕ Add New Document</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                                    <div>
                                        <label className="cdd-flabel">Document Type</label>
                                        <Select
                                            value={fileInputs.newDocType || null}
                                            onChange={v => setFileInputs(p => ({ ...p, newDocType: v }))}
                                            options={[
                                                { value: 'UNDERTAKING', label: 'Undertaking' },
                                                { value: 'AGREEMENT', label: 'Agreement' },
                                                { value: 'CODE_OF_CONDUCT', label: 'Code of Conduct' },
                                                { value: 'MT_BANK_PROOF', label: 'MT Bank Proof' },
                                                { value: 'OTHER', label: 'Other' },
                                            ]}
                                            placeholder="Select type…" isClearable
                                            styles={SEL_STYLES} menuPortalTarget={document.body}
                                        />
                                    </div>
                                    <div>
                                        <label className="cdd-flabel">Upload File</label>
                                        <Input type="file" innerRef={fileInputRef} className="cdd-add-input"
                                            style={{ height: 36, padding: '6px 10px', fontSize: 12 }}
                                            onChange={e => setFileInputs(p => ({ ...p, newFile: e.target.files[0] }))} />
                                    </div>
                                    <button className="cdd-btn cdd-btn-success" onClick={handleNewDocUpload}>
                                        <FaSave size={11} /> Save
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ color: '#94A3B8', fontSize: 13, fontStyle: 'italic', padding: '8px 0' }}>No documents available.</div>
                    )}
                </Sec>

                {/* ── Section 4: Trial Period ── */}
                {rowData.status === 'HIRED' && (
                    <Sec dot="#16A34A" label="Trial Period">
                        {!candidate?.candidateTrial || isEditingTrial ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: '12px', alignItems: 'end' }}>
                                <div>
                                    <label className="cdd-flabel">Start Date</label>
                                    <input type="date" className="cdd-add-input form-control" value={tpStartDate} min={new Date().toISOString().split("T")[0]} onChange={e => setTpStartDate(e.target.value)} />
                                </div>
                                <div>
                                    <label className="cdd-flabel">End Date</label>
                                    <input type="date" className="cdd-add-input form-control" value={tpEndDate} min={new Date().toISOString().split("T")[0]} onChange={e => setTpEndDate(e.target.value)} />
                                </div>
                                {isEditingTrial && (
                                    <div>
                                        <label className="cdd-flabel">Status</label>
                                        <Select value={trialStatus} onChange={setTrialStatus} menuPlacement="auto" isClearable placeholder="Select…"
                                            options={[{ value: 'On_Boarded', label: 'On Boarded' }, { value: 'Terminated', label: 'Terminated' }, { value: 'Absconded', label: 'Absconded' }]}
                                            styles={SEL_STYLES} menuPortalTarget={document.body} />
                                    </div>
                                )}
                                {/* <button className="cdd-btn cdd-btn-primary"   onClick={submitTrialPeriod}>Submit</button>
                                <button className="cdd-btn cdd-btn-secondary" onClick={handleClear}>Clear</button> */}

                                <div className="btn-group">
                                    <button className="cdd-btn cdd-btn-primary" onClick={submitTrialPeriod}>
                                        Submit
                                    </button>
                                    <button className="cdd-btn cdd-btn-secondary" onClick={handleClear}>
                                        Clear
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="cdd-kv-grid">
                                <KV label="Start Date" value={formatDate(candidate?.candidateTrial?.startDate)} icon={<MdDateRange />} />
                                <KV label="End Date" value={formatDate(candidate?.candidateTrial?.endDate)} icon={<MdDateRange />} />
                                <KV label="Trial Status" value={formatActionType(candidate?.candidateTrial?.trialStatus)} icon={<MdDateRange />} />
                                <KV label="Created By" value={candidate?.candidateTrial?.createdBy ? `${candidate.candidateTrial.createdBy.name} (${candidate.candidateTrial.createdBy.employeeCode})` : '—'} icon={<MdPersonOutline />} />
                                <div className="cdd-kv">
                                    <div className="cdd-kv-k"><MdDateRange size={11} /> Created At
                                        <MdEdit color={defaultTheme.goldColorLogo} style={{ cursor: 'pointer', marginLeft: 6, fontSize: 14 }} title="Edit" onClick={handleEditTrialPeriod} />
                                    </div>
                                    <div className="cdd-kv-v">{formatDateTime(rowData.candidateTrial?.createdAt) || '—'}</div>
                                </div>
                            </div>
                        )}
                    </Sec>
                )}

                {/* ── Bottom actions ── */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <button
                        onClick={handleSendOfferLetter}
                        disabled={rowData.offerLetterSent === true}
                        className={`cdd-btn ${rowData.offerLetterSent ? 'cdd-btn-disabled' : 'cdd-btn-success'}`}
                        style={{ cursor: rowData.offerLetterSent ? 'not-allowed' : 'pointer' }}>
                        <FaPaperPlane size={11} />
                        {rowData.offerLetterSent ? 'Offer Letter Sent' : 'Send Offer Letter'}
                    </button>
                    {rowData?.payrollType?.toLowerCase() === 'salaried' && (
                        <OfferLetterPDF data={{
                            candidateName: rowData.firstName || "N/A", designation: rowData.designation || "N/A",
                            location: locationAddress || "N/A", joiningDate: formatDate(lastHandover?.doj) || "N/A",
                            reportingManager: rowData?.handovers?.length ? getNameOnly(lastHandover?.reportingManagerName) : "N/A",
                            salary: rowData.salary * 12 || "N/A", department: rowData.department || "N/A", payrollType: rowData.payrollType || "N/A",
                        }} />
                    )}
                </div>

            </Container>
        </PageContent>
    )
}