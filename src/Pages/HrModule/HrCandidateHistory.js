import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { Container, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup } from 'reactstrap';
import { formatActionType, formatDate, formatDateTime, formatTimeTo12Hour, RequiredStar } from '../../helpers/function_helper';
import { MdEmail, MdPhone, MdCalendarToday, MdPerson, MdMoney, MdEmergency, MdCake, MdChurch, MdBloodtype, MdFamilyRestroom, MdDateRange, MdPersonOutline, MdEdit, MdDescription, MdLocationOn } from "react-icons/md";
import { FaCar, FaIdCard, FaUser, FaUserTie, FaFilePdf, FaArrowLeft, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { defaultTheme } from '../../helpers/defaultTheme';
import ApiClient, { hrImageBaseUrl } from '../../helpers/api_helper';
import { toast } from 'react-toastify';
import { useGet, usePost } from '../../Hooks/useApi';
import { FINAL_SUBMIT, GET_ALL_MAIN_TEAM_SUB_TEAM_DROPDOWN, GET_ALL_POSITION_DROPDOWN, HR_HANDOVER_TO_MAINTEAM, HR_LOCATION_DROPDOWN, HR_REJECT_CANDIDATE, SEND_MAIL_CANDIDATE_DOCUMENT_SUBMIT, TRIAL_PERIOD_CREATE, TRIAL_PERIOD_UPDATE } from '../../helpers/url_helper';
import Select from "react-select";
import ScreenLoader from '../../constants/ScreenLoader';
import { useUserStore } from '../../store/useUserStore';

// ── Styles ────────────────────────────────────────────────────────────────────
if (document.getElementById("hch-s")) document.getElementById("hch-s").remove()
const _s = document.createElement("style")
_s.id = "hch-s"
_s.textContent = `
    /* ── Profile header ── */
    .hch-prof-hdr { background:linear-gradient(135deg,#005B52,#007A6E); border-radius:14px; padding:20px 24px; margin-bottom:16px; display:flex; align-items:center; gap:16px; position:relative; overflow:hidden; }
    .hch-prof-hdr::before { content:''; position:absolute; top:-40px; right:-40px; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,.05); pointer-events:none; }
    .hch-prof-avatar { width:52px; height:52px; border-radius:14px; background:rgba(255,255,255,.18); display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; border:2px solid rgba(255,255,255,.3); }
    .hch-prof-name { font-size:18px; font-weight:800; color:#fff; }
    .hch-prof-sub { font-size:12px; color:rgba(255,255,255,.65); margin-top:2px; }
    .hch-prof-badges { display:flex; gap:6px; flex-wrap:wrap; margin-top:8px; }
    .hch-badge { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
    .hch-badge-green { background:rgba(34,197,94,.2); color:#bbf7d0; border:1px solid rgba(34,197,94,.3); }
    .hch-badge-gold  { background:rgba(201,168,76,.2); color:#fde68a; border:1px solid rgba(201,168,76,.3); }
    .hch-badge-red   { background:rgba(239,68,68,.2);  color:#fecaca; border:1px solid rgba(239,68,68,.3); }
    .hch-badge-blue  { background:rgba(59,130,246,.2); color:#bfdbfe; border:1px solid rgba(59,130,246,.3); }

    /* ── Section card ── */
    .hch-sec { background:#fff; border:1px solid #E2E8F0; border-radius:12px; margin-bottom:12px; overflow:hidden; }
    .hch-sec-hdr { display:flex; align-items:center; gap:10px; padding:12px 18px; border-bottom:1px solid #F1F5F9; cursor:pointer; user-select:none; }
    .hch-sec-hdr-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .hch-sec-hdr-label { font-size:12px; font-weight:800; color:#0F172A; flex:1; text-transform:uppercase; letter-spacing:.5px; }
    .hch-sec-hdr-badge { font-size:10px; font-weight:700; color:#64748B; background:#F1F5F9; border-radius:20px; padding:2px 9px; }
    .hch-sec-body { padding:16px 18px; }

    /* ── Info grid KV ── */
    .hch-kv-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px 20px; }
    @media(max-width:900px) { .hch-kv-grid { grid-template-columns:repeat(2,1fr); } }
    @media(max-width:560px) { .hch-kv-grid { grid-template-columns:1fr; } }
    .hch-kv { display:flex; flex-direction:column; gap:3px; padding:10px 12px; background:#F8FAFC; border-radius:9px; border:1px solid #F1F5F9; }
    .hch-kv-k { font-size:9px; font-weight:800; color:#94A3B8; text-transform:uppercase; letter-spacing:.6px; display:flex; align-items:center; gap:4px; }
    .hch-kv-v { font-size:13px; font-weight:600; color:#0F172A; word-break:break-word; }
    .hch-kv-v.muted { color:#64748B; font-weight:500; }

    /* ── Table ── */
    .hch-table { width:100%; border-collapse:collapse; font-size:12px; }
    .hch-table th { background:#F1F5F9; color:#374151; font-weight:700; padding:8px 12px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:.4px; border-bottom:2px solid #E2E8F0; }
    .hch-table td { padding:8px 12px; border-bottom:1px solid #F1F5F9; color:#374151; vertical-align:middle; }
    .hch-table tr:last-child td { border-bottom:none; }
    .hch-table tr:hover td { background:#FAFAFA; }

    /* ── Action section ── */
    .hch-action-card { background:linear-gradient(135deg,#F0FDF4,#fff); border:1.5px solid #BBF7D0; border-radius:12px; padding:18px 20px; margin-bottom:12px; }
    .hch-action-title { font-size:13px; font-weight:800; color:#005B52; margin-bottom:14px; display:flex; align-items:center; gap:8px; }

    /* ── Select styles override ── */
    .hch-action-card .react-select__control { min-height:38px; border:1.5px solid #D1D5DB; border-radius:8px; font-size:13px; }
    .hch-action-card .react-select__control--is-focused { border-color:#005B52 !important; box-shadow:0 0 0 3px rgba(0,91,82,.08) !important; }

    /* ── Buttons ── */
    .hch-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 18px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; border:none; transition:all .15s; }
    .hch-btn-primary  { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; }
    .hch-btn-primary:hover { opacity:.88; }
    .hch-btn-danger   { background:linear-gradient(135deg,#DC2626,#EF4444); color:#fff; }
    .hch-btn-danger:hover { opacity:.88; }
    .hch-btn-success  { background:linear-gradient(135deg,#16A34A,#22C55E); color:#fff; }
    .hch-btn-success:hover { opacity:.88; }
    .hch-btn-secondary{ background:#F1F5F9; color:#374151; border:1.5px solid #E2E8F0; }
    .hch-btn-secondary:hover { background:#E2E8F0; }
    .hch-btn-back { background:#fff; color:#005B52; border:1.5px solid #005B52; }
    .hch-btn-back:hover { background:#F0FDF4; }

    /* ── Field label in forms ── */
    .hch-flabel { font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:.4px; margin-bottom:4px; display:block; }
    .hch-finput { width:100%; height:38px; padding:0 11px; border:1.5px solid #D1D5DB; border-radius:8px; font-size:13px; outline:none; transition:border-color .15s; }
    .hch-finput:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }
    textarea.hch-finput { height:auto; padding:8px 11px; resize:vertical; }

    /* ── Radio pill ── */
    .hch-radio-grp { display:flex; gap:8px; flex-wrap:wrap; }
    .hch-rpill { padding:6px 14px; border-radius:8px; border:1.5px solid #D1D5DB; background:#fff; font-size:12px; font-weight:600; color:#374151; cursor:pointer; transition:all .14s; user-select:none; }
    .hch-rpill.on { background:#005B52; color:#fff; border-color:#005B52; }
    .hch-rpill.on-gold { background:#C9A84C; color:#fff; border-color:#C9A84C; }
    .hch-rpill.on-red { background:#EF4444; color:#fff; border-color:#EF4444; }

    /* ── Empty state ── */
    .hch-empty { font-size:12px; color:#94A3B8; font-style:italic; padding:8px 0; }

    /* ── Responsive ── */

    /* Tablet landscape (≤1024px) */
    @media(max-width:1024px){
        .hch-kv-grid { grid-template-columns:repeat(3,1fr); }
        .hch-prof-hdr { padding:16px 18px; gap:12px; }
        .hch-prof-name { font-size:16px; }
    }

    /* Tablet portrait (≤768px) */
    @media(max-width:768px){
        .hch-kv-grid { grid-template-columns:repeat(2,1fr); }
        .hch-prof-hdr { flex-wrap:wrap; padding:14px 16px; gap:10px; }
        .hch-prof-avatar { width:44px; height:44px; font-size:18px; border-radius:10px; }
        .hch-prof-name { font-size:15px; }
        .hch-prof-sub  { font-size:11px; }
        .hch-sec-hdr { padding:10px 14px; }
        .hch-sec-body { padding:14px; }
        .hch-action-card { padding:14px 16px; }
        .hch-action-card > div[style*="grid"] { grid-template-columns:repeat(2,1fr) !important; }
        .hch-btn { padding:7px 14px; font-size:12px; }
        .hch-table { font-size:11px; }
        .hch-table th, .hch-table td { padding:6px 10px; }
    }

    /* Mobile (≤560px) */
    @media(max-width:560px){
        .hch-kv-grid { grid-template-columns:1fr; }
        .hch-prof-hdr { padding:12px 14px; border-radius:12px; }
        .hch-prof-avatar { width:40px; height:40px; font-size:16px; }
        .hch-prof-name { font-size:14px; }
        .hch-prof-badges { gap:4px; }
        .hch-badge { font-size:10px; padding:2px 8px; }
        .hch-sec-hdr { padding:9px 12px; }
        .hch-sec-hdr-label { font-size:11px; }
        .hch-sec-body { padding:12px; }
        .hch-kv { padding:8px 10px; }
        .hch-kv-v { font-size:12px; }
        .hch-action-card { padding:12px 14px; border-radius:10px; }
        .hch-action-card > div[style*="grid"] { grid-template-columns:1fr !important; }
        .hch-btn { padding:7px 12px; font-size:11px; gap:5px; }
        .hch-btn-back { padding:6px 12px; font-size:11px; }
        .hch-flabel { font-size:10px; }
        .hch-finput { height:36px; font-size:12px; }
        .hch-radio-grp { gap:6px; }
        .hch-rpill { font-size:11px; padding:5px 12px; }
        .hch-table { font-size:10px; }
        .hch-table th { font-size:9px; padding:5px 8px; letter-spacing:.2px; }
        .hch-table td { padding:5px 8px; }
        /* Trial period grid on mobile */
        div[style*="repeat(3,1fr) auto"] { grid-template-columns:1fr 1fr !important; }
    }

    /* Very small (≤380px) */
    @media(max-width:380px){
        .hch-prof-hdr { padding:10px 12px; border-radius:10px; }
        .hch-prof-avatar { width:36px; height:36px; font-size:14px; border-radius:8px; }
        .hch-prof-name { font-size:13px; }
        .hch-sec-body { padding:10px; }
        .hch-kv { padding:7px 9px; }
        .hch-kv-v { font-size:11px; }
        .hch-btn { padding:6px 10px; font-size:10px; }
        .hch-table th { font-size:8px; padding:4px 6px; }
        .hch-table td { padding:4px 6px; font-size:10px; }
        div[style*="repeat(3,1fr) auto"] { grid-template-columns:1fr !important; }
    }
`
document.head.appendChild(_s)

const SEL_STYLES = {
    control: (b, st) => ({ ...b, minHeight: 38, fontSize: 13, border: `1.5px solid ${st.isFocused ? "#005B52" : "#D1D5DB"}`, borderRadius: 8, boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.08)" : "none" }),
    option: (b, st) => ({ ...b, fontSize: 13, background: st.isSelected ? "#005B52" : st.isFocused ? "#f0fdf9" : "#fff", color: st.isSelected ? "#fff" : "#0F172A" }),
    menuPortal: b => ({ ...b, zIndex: 9999 }),
}

// ── KV pair ──────────────────────────────────────────────────────────────────
const KV = ({ label, value, icon, span2 }) => (
    <div className="hch-kv" style={span2 ? { gridColumn: "span 2" } : {}}>
        <div className="hch-kv-k">{icon && <span style={{ fontSize: 12 }}>{icon}</span>}{label}</div>
        <div className="hch-kv-v">{value || <span className="muted">—</span>}</div>
    </div>
)

// ── Collapsible section ───────────────────────────────────────────────────────
const Sec = ({ dot = "#005B52", label, badge, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="hch-sec">
            <div className="hch-sec-hdr" onClick={() => setOpen(p => !p)}>
                <span className="hch-sec-hdr-dot" style={{ background: dot }} />
                <span className="hch-sec-hdr-label">{label}</span>
                {badge && <span className="hch-sec-hdr-badge">{badge}</span>}
                {open ? <FaChevronUp size={11} color="#94A3B8" /> : <FaChevronDown size={11} color="#94A3B8" />}
            </div>
            {open && <div className="hch-sec-body">{children}</div>}
        </div>
    )
}

export default function HrCandidateHistory() {
    const location = useLocation()
    const navigate = useNavigate()
    const { userId, empCode } = useUserStore(s => s.user)
    const { rowData, status, filters, page, candidateStatus, showFilters, final_Status } = location.state || {}

    console.log("rowData ", rowData)

    const { data: mainTeamSubTeam } = useGet(GET_ALL_MAIN_TEAM_SUB_TEAM_DROPDOWN)
    const { data: designationList } = useGet(GET_ALL_POSITION_DROPDOWN)
    const { data: locationOptions } = useGet(HR_LOCATION_DROPDOWN)

    const locationList = locationOptions?.data?.data?.map(l => ({ value: l.key, label: l.value })) || []
    const mainTeamSubTeamOptions = mainTeamSubTeam?.data?.data?.map(e => ({
        label: `${e.name} (${e.empCode}) (${e.isMainTeam ? e.mainTeam : e.subTeam})`,
        value: e.empCode, mainTeam: e.mainTeam, subTeam: e.subTeam
    }))

    const [mainTeam, setMainTeam] = useState(null)
    const [forwardCase, setForwardCase] = useState(false)
    const [hrForwardReason, setHrForwardReason] = useState(null)
    const [finalSalaryModal, setFinalSalaryModal] = useState(false)
    const [finalStatus, setFinalStatus] = useState("")
    const [finalSalary, setFinalSalary] = useState("")
    const [designation, setDesignation] = useState(null)
    const [designationError, setDesignationError] = useState("")
    const [finalLocation, setFinalLocation] = useState(null)
    const [finalLocationError, setFinalLocationError] = useState(null)
    const [finalSalaryError, setFinalSalaryError] = useState("")
    const [doj, setDoj] = useState('')
    const [dojError, setDojError] = useState('')
    const [remarksError, setRemarksError] = useState('')
    const [finalRemarks, setFinalRemarks] = useState('')
    const [tpStartDate, setTpStartDate] = useState('')
    const [tpEndDate, setTpEndDate] = useState('')
    const [decision, setDecision] = useState(null)
    const [isEditingTrial, setIsEditingTrial] = useState(false)
    const [trialStatus, setTrialStatus] = useState(null)
    const [lateStatus, setLateStatus] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [remarks, setRemarks] = useState("")
    const [rating, setRating] = useState(null)
    const [payType, setPayType] = useState(null)
    const [payTypeError, setPayTypeError] = useState("")

    const nonSalesOptions = [
        { label: 'Anmol Bhatia (1237)', value: '1237' },
        { label: 'Deendayal Arya (1005)', value: '1005' },
        { label: 'Gaurv Gautam (1247)', value: '1247' }, { label: 'Paras Jain (1469)', value: '1469' },
        { label: 'Somesh Singh (1586)', value: '1586' }, { label: 'Vishal Kaushik (1246)', value: '1246' },
    ]
    const ratingOptions = [
        { value: 'Unsatisfied', label: 'Unsatisfied' }, { value: 'Satisfactory', label: 'Satisfactory' },
        { value: 'Average', label: 'Average' }, { value: 'AboveAverage', label: 'Above Average' }, { value: 'ExtraOrdinary', label: 'Extraordinary' },
    ]
    const decisionOptions = [{ value: 'Accept', label: 'Accept' }, { value: 'Reject', label: 'Reject' }]
    const payOptions = [{ label: "Contractual", value: "Contractual" }, { label: "Permanent", value: "Permanent" }, { label: "Trainee", value: "Trainee" }]

    const handleSendMail = () => {
        if (!window.confirm(`Send mail to ${rowData?.email}?`)) return
        setIsPending(true)
        ApiClient.post(`${SEND_MAIL_CANDIDATE_DOCUMENT_SUBMIT}candidateId=${rowData.id}&userId=${userId}`)
            .then(res => { setIsPending(false); res?.data?.status === 1 ? toast.success(res.data.message) : toast.error(res.data.message) })
            .catch(err => { setIsPending(false); toast.error(err.message) })
    }

    const toggleFinalSalaryModal = () => {
        setFinalSalaryModal(p => !p); setFinalSalary(""); setDoj(""); setDojError(""); setFinalRemarks(""); setRemarksError("")
        setFinalSalaryError(""); setFinalLocation(null); setFinalLocationError(""); setDesignationError(""); setLateStatus(false); setFinalStatus(null); setDesignation('')
    }

    const toggleFinalConfirmationModal = () => {
        let err = false
        setFinalSalaryError(""); setDojError(""); setRemarksError(""); setDesignationError(""); setFinalLocationError(""); setPayTypeError("")
        if (!finalStatus) { alert("Please select a status."); return }
        const salaryVal = parseFloat(finalSalary)
        const ivwDate = new Date(rowData?.interviews?.[0]?.scheduledAtDate)
        const dojDate = doj ? new Date(doj) : null
        if (finalStatus === "Accept") {
            if (!finalLocation) { setFinalLocationError("Location is required."); err = true }
            if (!finalSalary) { setFinalSalaryError("Final salary is required."); err = true }
            else if (isNaN(salaryVal) || salaryVal <= 0) { setFinalSalaryError("Enter a valid positive number."); err = true }
            else { const lr = rowData?.handovers?.[rowData.handovers.length - 1]?.salary; if (lr) { const [min, max] = lr.split('-').map(v => parseFloat(v.trim())); if (salaryVal < min || salaryVal > max) { setFinalSalaryError(`Salary must be between ${min} and ${max}.`); err = true } } }
            if (!designation?.value) { setDesignationError("Designation is required."); err = true }
            if (!doj) { setDojError("DOJ is required."); err = true } else if (ivwDate && dojDate < ivwDate) { setDojError("DOJ cannot be before interview date."); err = true }
            if (!payType) { setPayTypeError("Pay type is required."); err = true }
            if (!finalRemarks) { setRemarksError("Remarks are required."); err = true }
        } else if (finalStatus === "OnHold" || finalStatus === "Reject") {
            if (!finalRemarks) { setRemarksError("Remarks are required."); err = true }
        } else if (finalStatus === "LateJoining" || finalStatus === "LateJoining 2") {
            if (!doj) { setDojError("DOJ is required."); err = true } else if (ivwDate && dojDate < ivwDate) { setDojError("DOJ cannot be before interview date."); err = true }
            if (!finalRemarks) { setRemarksError("Remarks are required."); err = true }
        }
        if (err) return
        setFinalSalaryModal(false)
        if (!window.confirm("Submit final status for this candidate?")) return
        handleFinalSubmit()
    }

    const handleFinalSubmit = () => {
        let q = `candidateId=${rowData?.id}&finalStatus=${finalStatus === 'LateJoining 2' ? "LateJoining" : finalStatus}&userId=${userId}`
        if (finalStatus === "Accept") {
            q += `&finalRemarks=${encodeURIComponent(finalRemarks)}&finalLocation=${encodeURIComponent(finalLocation?.label)}&salary=${finalSalary}&dateOfJoining=${doj}&designation=${encodeURIComponent(designation?.label)}&payType=${encodeURIComponent(payType?.value)}&remarkNumber=1&remarks=${encodeURIComponent(finalRemarks)}`
        } else if (finalStatus === "OfferDeclined") {
            q += `&finalRemarks=${encodeURIComponent(finalRemarks)}`
        }

        else if (finalStatus === 'LateJoining 2') {
            q += `&remarks=${encodeURIComponent(finalRemarks)}`
            if (finalStatus === "LateJoining 2") q += `&dateOfJoining=${doj}&remarkNumber=3`
        }
        else {
            q += `&remarks=${encodeURIComponent(finalRemarks)}`
            if (finalStatus === "LateJoining") q += `&dateOfJoining=${doj}&remarkNumber=2`
        }
        ApiClient.post(`${FINAL_SUBMIT}?${q}`)
            .then(res => { if (res?.data?.status === 1) { setFinalSalary(""); toast.success(res.data.message); resetForm() } else toast.error(res.data.message || 'Failed.') })
            .catch(err => toast.error(err.message || 'Failed.'))
    }

    const handleInitiateHandover = async () => {
        if (decision?.value === 'Accept') {
            if (!mainTeam) { toast.error("Please select a team."); return }
            const payload = {
                candidateId: rowData.id, mainTeam: rowData?.department === 'Sales' ? mainTeam?.mainTeam : 'SA',
                subTeam: rowData?.department === 'Sales' ? mainTeam.subTeam : 'SA',
                reportingManagerName: rowData?.department === 'Sales' ? mainTeam.label.replace(/\s\([^()]*\)$/, '') : mainTeam.label.split('(')[0].trim(),
                reportingManagerCode: mainTeam?.value, offeredPosition: "", salary: "",
                rating: rating.value, remarksRating: remarks, userId, doj: "",
                handoverRemark: forwardCase ? hrForwardReason : ""
            }
            if (!window.confirm("Initiate handover for this candidate?")) return
            handoverToMainTeam(payload)
        } else if (decision?.value === 'Reject') {
            const payload = { candidateId: rowData.id, mainTeam: "", subTeam: "", reportingManagerName: "", reportingManagerCode: "", offeredPosition: "", salary: "", rating: rating.value, remarksRating: remarks, userId, doj: "", handoverRemark: "" }
            if (!window.confirm("Reject this candidate?")) return
            rejectCandidate(payload)
        }
    }

    const resetForm = () => {
        setMainTeam(null); setRemarks(''); setRating(null)
        if (status === 'Final') navigate("/all-candidate-history", { state: { filters, page, final_Status, showFilters, highlightRowId: rowData?.id || location.state?.highlightRowId } })
        else navigate("/recruiter-history", { state: { filters, page, candidateStatus, showFilters, final_Status, highlightRowId: rowData?.id || location.state?.highlightRowId } })
    }

    const submitTrialPeriod = () => {
        if (!tpStartDate) { toast.error('Select TP Start Date'); return }
        if (!tpEndDate) { toast.error('Select TP End Date'); return }
        if (new Date(tpStartDate) >= new Date(tpEndDate)) { toast.error('End date must be after start date'); return }
        isEditingTrial ? updateTrialPeriod() : createTrialPeriod()
    }

    const { isPending: addLoading, mutate: handoverToMainTeam } = usePost(HR_HANDOVER_TO_MAINTEAM, { onSuccess: res => { res?.data.status === 1 ? toast.success(res.data.message) && resetForm() : toast.error(res.data.message) }, onError: err => toast.error(err.message) })
    const { isPending: rejectLoading, mutate: rejectCandidate } = usePost(HR_REJECT_CANDIDATE, { onSuccess: res => { res?.data.status === 1 ? toast.success(res.data.message) && resetForm() : toast.error(res.data.message) }, onError: err => toast.error(err.message) })
    const { isPending: addTPLoading, mutate: createTrialPeriod } = usePost(`${TRIAL_PERIOD_CREATE}candidateId=${rowData?.id}&userId=${userId}&startDate=${tpStartDate}&endDate=${tpEndDate}&trialStatus=Started`, { onSuccess: res => { res?.data.status === 1 ? toast.success(res.data.message) && resetForm() : toast.error(res.data.message) }, onError: err => toast.error(err.message) })
    const { isPending: updateTPLoading, mutate: updateTrialPeriod } = usePost(`${TRIAL_PERIOD_UPDATE}candidateId=${rowData?.id}&userId=${userId}&startDate=${tpStartDate}&endDate=${tpEndDate}&trialId=${rowData?.candidateTrial?.id}&trialStatus=${trialStatus?.value || 'Started'}`, { onSuccess: res => { res?.data.status === 1 ? toast.success(res.data.message) && resetForm() : toast.error(res.data.message) }, onError: err => toast.error(err.message) })

    if (!rowData) return <PageContent><Breadcrumbs title="HR Module" breadcrumbItem="Candidate History" /><Container><p className="text-danger mt-3">No candidate data available.</p></Container></PageContent>

    const shouldHideSalary = rowData.department !== 'Sales' && rowData.salary
    const lastHandover = rowData.handovers?.[rowData.handovers.length - 1]
    const resumeDoc = rowData.documents?.find(d => d.documentType === 'RESUME')

    const goBack = () => {
        if (status === 'Final') navigate("/all-candidate-history", { state: { filters, page, final_Status, showFilters, highlightRowId: rowData?.id || location.state?.highlightRowId } })
        else navigate("/recruiter-history", { state: { filters, page, candidateStatus, showFilters, final_Status, highlightRowId: rowData?.id || location.state?.highlightRowId } })
    }

    return (
        <PageContent>
            <Breadcrumbs title="HR Module" breadcrumbItem="Candidate Information" />
            {(addLoading || isPending || addTPLoading || rejectLoading || updateTPLoading) && <ScreenLoader />}
            <Container fluid>

                {/* ── Profile header ── */}
                <div className="hch-prof-hdr">
                    <div className="hch-prof-avatar">👤</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="hch-prof-name">{rowData.firstName}</div>
                        <div className="hch-prof-sub">{rowData.jobTitle} · {rowData.department}</div>
                        <div className="hch-prof-badges">
                            <span className="hch-badge hch-badge-green">{formatActionType(rowData.status)}</span>
                            {rowData.finalStatusEnum && <span className="hch-badge hch-badge-gold">{rowData.finalStatusEnum}</span>}
                            {lastHandover?.handoverStatus && <span className="hch-badge hch-badge-blue">{formatActionType(lastHandover.handoverStatus)}</span>}
                            {rowData.department && <span className="hch-badge hch-badge-red">{rowData.department}</span>}
                        </div>
                    </div>
                    <button className="hch-btn hch-btn-back" onClick={goBack} style={{ flexShrink: 0 }}>
                        <FaArrowLeft size={12} /> Back
                    </button>
                </div>

                {/* ── Part 1: Basic Info ── */}
                <Sec dot="#005B52" label="Basic Information">
                    <div className="hch-kv-grid">
                        <KV label="Name" value={rowData.firstName} icon={<MdPerson />} />
                        <KV label="Email" value={rowData.email} icon={<MdEmail />} />
                        <KV label="Phone" value={rowData.phone} icon={<MdPhone />} />
                        <KV label="Position" value={rowData.jobTitle} icon={<FaUserTie />} />
                        <KV label="Date of Birth" value={formatDate(rowData.dateOfBirth)} icon={<MdCalendarToday />} />
                        <KV label="Interview At" value={rowData.interviewLocationBranch} icon={<MdLocationOn />} />
                        <KV label="Interview For" value={rowData.preferredLocationName} icon={<MdLocationOn />} />
                        <KV label="Department" value={rowData.department} icon={<FaUserTie />} />
                        <KV label="Created By" value={rowData.createdByName ? `${rowData.createdByName} (${rowData.createdByCode})` : '—'} icon={<FaUser />} />
                        <KV label="Resume" value={resumeDoc ?
                            <a href={`${hrImageBaseUrl}${resumeDoc.filePath}`} target="_blank" rel="noopener noreferrer">
                                <FaFilePdf size={18} color={defaultTheme.redColor} />
                            </a> : '—'} />
                    </div>
                </Sec>

                {/* ── Part 2: Professional ── */}
                <Sec dot="#C9A84C" label="Professional Details">
                    <div className="hch-kv-grid">
                        <KV label="Current CTC/Month" value={`₹${shouldHideSalary ? "******" : rowData.currentCtc || '—'}`} icon={<MdMoney />} />
                        <KV label="Expected Salary" value={`₹${shouldHideSalary ? "******" : rowData.expectedSalary || '—'}`} icon={<MdMoney />} />
                        <KV label="Notice Period" value={rowData.noticePeriod ? `${rowData.noticePeriod} days` : '—'} />
                        <KV label="Total Experience" value={rowData.totalYearsOfExperience ? (rowData.totalYearsOfExperience === "Less than 1 Year" ? "Less than 1 Year" : rowData.totalYearsOfExperience + " Years") : '—'} />
                        <KV label="Current Status" value={rowData.currentStatus} />
                        <KV label="Working" value={rowData.working ? 'Yes' : 'No'} />
                        <KV label="Form Filled" value={rowData.formFilled ? 'Yes' : 'No'} />
                        <KV label="Has Vehicle" value={rowData.vehicleDetails == null ? '—' : rowData.vehicleDetails.hasVehicle ? 'Yes' : 'No'} icon={<FaCar />} />
                        <KV label="Vehicle Type" value={rowData.vehicleDetails?.vehicleType} icon={<FaCar />} />
                        <KV label="Driving License" value={rowData.vehicleDetails == null ? '—' : rowData.vehicleDetails.hasDrivingLicense ? 'Yes' : 'No'} icon={<FaIdCard />} />
                    </div>
                </Sec>

                {/* ── Interviews ── */}
                {rowData.interviews?.length > 0 && (
                    <Sec dot="#3B82F6" label="Interviews" badge={rowData.interviews.length}>
                        <table className="hch-table">
                            <thead><tr><th>Date</th><th>Time</th></tr></thead>
                            <tbody>{rowData.interviews.map((iv, i) => (
                                <tr key={i}>
                                    <td>{formatDate(iv.scheduledAtDate) || '—'}</td>
                                    <td>{iv.scheduledAtTime && iv.scheduledToTime ? `${formatTimeTo12Hour(iv.scheduledAtTime)} - ${formatTimeTo12Hour(iv.scheduledToTime)}` : '—'}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </Sec>
                )}

                {/* ── Sources ── */}
                {rowData.sources?.length > 0 && (
                    <Sec dot="#8B5CF6" label="Sources" badge={rowData.sources.length}>
                        <table className="hch-table">
                            <thead><tr><th>Type</th><th>Name</th><th>Details</th><th>Created At</th></tr></thead>
                            <tbody>{rowData.sources.map((s, i) => (
                                <tr key={i}>
                                    <td>{formatActionType(s.sourceType) || '—'}</td>
                                    <td>{s.sourceName || '—'}</td>
                                    <td>{s.sourceDetails !== 'null' ? s.sourceDetails : '—'}</td>
                                    <td>{formatDateTime(s.createdAt) || '—'}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </Sec>
                )}

                {/* ── Experience ── */}
                {rowData.experiences?.length > 0 && (
                    <Sec dot="#0284C7" label={rowData.fresher ? 'Internship Details' : 'Job Experience'} badge={rowData.experiences.length} defaultOpen={false}>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="hch-table">
                                <thead>
                                    <tr>
                                        <th>Company</th><th>Location</th>
                                        {!rowData.fresher && <th>Title</th>}
                                        {!rowData.fresher && <th>Department</th>}
                                        <th>Start</th><th>End</th><th>CTC/Month</th>
                                        {!rowData.fresher && <th>Notice</th>}
                                        <th>Current</th><th>Industry</th>
                                    </tr>
                                </thead>
                                <tbody>{rowData.experiences.map((e, i) => (
                                    <tr key={i}>
                                        <td>{e.companyName || '—'}</td><td>{e.companyLocation || '—'}</td>
                                        {!rowData.fresher && <td>{e.jobTitle || '—'}</td>}
                                        {!rowData.fresher && <td>{e.department || '—'}</td>}
                                        <td>{formatDate(e.startDate) || '—'}</td><td>{formatDate(e.endDate) || '—'}</td>
                                        <td>{e.currentCTC || '—'}</td>
                                        {!rowData.fresher && <td>{e.noticePeriod || '—'}</td>}
                                        <td>{e.current ? 'Yes' : 'No'}</td><td>{e.industryName}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    </Sec>
                )}

                {/* ── Education ── */}
                {rowData.educations?.length > 0 && (
                    <Sec dot="#16A34A" label="Education" badge={rowData.educations.length} defaultOpen={false}>
                        <table className="hch-table">
                            <thead><tr><th>Degree</th><th>Institute</th><th>Start</th><th>End</th><th>Pursuing</th></tr></thead>
                            <tbody>{rowData.educations.map((e, i) => (
                                <tr key={i}><td>{formatActionType(e.degree) || '—'}</td><td>{e.instituteName || '—'}</td><td>{e.startYear || '—'}</td><td>{e.endYear || '—'}</td><td>{e.pursuing ? 'Yes' : 'No'}</td></tr>
                            ))}</tbody>
                        </table>
                    </Sec>
                )}

                {/* ── Handovers ── */}
                {(rowData.department === 'Sales' || !rowData?.salary) && rowData.handovers?.length > 0 && (
                    <Sec dot="#DC2626" label="Handovers" badge={rowData?.handovers.length} defaultOpen={false}>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="hch-table">
                                <thead><tr><th>Main Team</th><th>Sub Team</th><th>Manager</th><th>Rating</th><th>Salary Range</th><th>Remarks</th><th>By</th><th>At</th><th>Status</th><th>DOJ</th><th>Forward Remarks</th><th>Pay Type</th></tr></thead>
                                <tbody>{rowData.handovers.map((h, i) => (
                                    <tr key={h.id || i}>
                                        <td>{h.mainTeam || '—'}</td><td>{h.subTeam || '—'}</td>
                                        <td>{h.reportingManagerName || '—'}</td><td>{h.rating || '—'}</td>
                                        <td>{h.salary || '—'}</td><td>{h.remarksRating || '—'}</td>
                                        <td>{h?.handoverBy?.name ? `${h.handoverBy.name} (${h.handoverBy.employeeCode})` : '—'}</td>
                                        <td>{h?.handoverDate ? formatDateTime(h?.handoverDate) : '—'}</td>
                                        <td>{formatActionType(h.handoverStatus) || '—'}</td>
                                        <td>{formatDate(h.doj) || '—'}</td><td>{h.handoverRemark || '—'}</td>
                                        <td>{h.payrollType || '—'}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    </Sec>
                )}
                {/* ── Documents ── */}
                {rowData.documents?.length > 0 && (
                    <Sec dot="#F59E0B" label="Documents" badge={rowData.documents.length} defaultOpen={false}>
                        <table className="hch-table">
                            <thead><tr><th>Type</th><th>Uploaded At</th><th>File</th></tr></thead>
                            <tbody>{rowData.documents.map((d, i) => {
                                const type = d.documentType === 'RELIVING_LETTER' ? 'Reliving Letter/Resignation' : d.documentType === 'SALARY_SLIP' ? 'Salary Slip/Bank Statement' : d.documentType === 'DRIVING_LICENCE' ? 'DL/Learning' : d.documentType === 'PAN' ? 'PAN/Applied' : formatActionType(d.documentType)
                                return (<tr key={d.id || i}>
                                    <td>{type || '—'}</td><td>{formatDateTime(d.uploadedAt) || '—'}</td>
                                    <td>{d.filePath ? <a href={`${hrImageBaseUrl}${d.filePath}`} target="_blank" rel="noopener noreferrer"><FaFilePdf size={16} color={defaultTheme.redColor} /></a> : '—'}</td>
                                </tr>)
                            })}</tbody>
                        </table>
                    </Sec>
                )}

                {/* ── Part 3: Final Overview ── */}
                <Sec dot="#7C3AED" label="Final Overview">
                    <div className="hch-kv-grid">
                        <KV label="Final Salary" value={rowData?.department === 'HR' ? (empCode === '1005') ? `₹${rowData?.salary ?? '—'}` : '******' : `₹${rowData?.salary ?? '—'}`} icon={<MdMoney />} />
                        <KV label="Final Status" value={rowData?.finalStatusEnum} icon={<MdDescription />} />
                        <KV label="Other Remarks" value={rowData?.finalStatusEnum !== 'Accept' ? rowData.remarks : '—'} icon={<MdDescription />} />
                        <KV label="Final Designation" value={rowData?.designation} icon={<FaUserTie />} />
                        <KV label="Final Location" value={rowData.finalLocation} icon={<MdLocationOn />} />
                        <KV label="Final Pay Type" value={rowData?.payrollType} icon={<MdDescription />} />
                        <KV label="Final Remarks" value={rowData.finalRemarks} icon={<MdDescription />} span2 />
                    </div>
                </Sec>

                {/* ── Part 4: Personal ── */}
                <Sec dot="#64748B" label="Personal Details" defaultOpen={false}>
                    <div className="hch-kv-grid">
                        <KV label="Current Address" value={rowData.candidateDetails?.currentAddress} icon={<MdPerson />} />
                        <KV label="Permanent Address" value={rowData.candidateDetails?.permanentAddress} icon={<MdPerson />} />
                        <KV label="Gender" value={rowData.candidateDetails?.gender} icon={<MdPerson />} />
                        <KV label="Blood Group" value={rowData.candidateDetails?.bloodGroup} icon={<MdBloodtype />} />
                        <KV label="Religion" value={rowData.candidateDetails?.religion} icon={<MdChurch />} />
                        <KV label="DOB (Document)" value={formatDate(rowData.candidateDetails?.dateOfBirth)} icon={<MdCake />} />
                        <KV label="Actual DOB" value={formatDate(rowData.candidateDetails?.actualDateOfBirth)} icon={<MdCake />} />
                        <KV label="Marital Status" value={rowData.candidateDetails?.maritalStatus} icon={<MdFamilyRestroom />} />
                        <KV label="Anniversary" value={rowData.candidateDetails?.anniversary === 'NA' ? '—' : formatDate(rowData.candidateDetails?.anniversary)} icon={<MdCalendarToday />} />
                        <KV label="Father's Name" value={rowData.candidateDetails?.fatherName} icon={<MdPerson />} />
                        <KV label="Father's Number" value={rowData.candidateDetails?.fatherNumber} icon={<MdPhone />} />
                        <KV label="Mother's Number" value={rowData.candidateDetails?.motherNumber} icon={<MdPhone />} />
                        <KV label="Emergency Name" value={rowData.candidateDetails?.emergencyPersonName} icon={<MdEmergency />} />
                        <KV label="Emergency Number" value={rowData.candidateDetails?.emergencyPersonNumber} icon={<MdEmergency />} />
                        <KV label="Emergency Relation" value={rowData.candidateDetails?.emergencyPersonRelation} icon={<MdEmergency />} />

                        <KV label="Nominee Name" value={rowData.candidateDetails?.nomineeName} icon={<MdPerson />} />
                        <KV label="Nominee DOB" value={formatDate(rowData.candidateDetails?.nomineeDateOfBirth)} icon={<MdCalendarToday />} />
                        <KV label="Nominee Relation" value={rowData.candidateDetails?.nomineeRelation} icon={<MdFamilyRestroom />} />

                        <KV label="Created At" value={formatDateTime(rowData.candidateDetails?.createdAt)} icon={<MdCalendarToday />} />
                    </div>
                </Sec>

                {/* ── Handover Form ── */}
                {(status !== 'Init' && rowData.status !== 'HIRED' && rowData.status !== 'REJECTED' && rowData.formFilled && rowData.finalStatusEnum !== 'Reject' && rowData.finalStatusEnum !== 'LateJoining' && !['ASSIGNED'].includes(lastHandover?.handoverStatus)) && (
                    <div className="hch-action-card">
                        <div className="hch-action-title">
                            🤝 Handover Form {rowData?.sources[0]?.sourceName === 'Referral' ? ` — Referral${rowData?.sources[0]?.sourceDetails ? ` (${rowData?.sources[0].sourceDetails})` : ''}` : ''}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px 16px' }}>
                            <div>
                                <label className="hch-flabel">Decision <RequiredStar /></label>
                                <Select menuPlacement="auto" options={decisionOptions} value={decision} isClearable onChange={v => { setDecision(v); if (v?.value === 'Reject') setMainTeam(null) }} styles={SEL_STYLES} menuPortalTarget={document.body} />
                            </div>
                            {decision?.value !== 'Reject' && (
                                <div>
                                    <label className="hch-flabel">{rowData?.department === 'Sales' ? 'Select Team' : 'Department Head'} <RequiredStar /></label>
                                    <Select menuPlacement="auto" options={rowData?.department === 'Sales' ? mainTeamSubTeamOptions || [] : nonSalesOptions || []} value={mainTeam} isClearable onChange={setMainTeam} styles={SEL_STYLES} menuPortalTarget={document.body} />
                                </div>
                            )}
                            <div>
                                <label className="hch-flabel">Rating <RequiredStar /></label>
                                <Select menuPlacement="auto" options={ratingOptions} value={rating} isClearable onChange={setRating} styles={SEL_STYLES} menuPortalTarget={document.body} />
                            </div>
                        </div>
                        {decision?.value === 'Accept' && (
                            <div style={{ marginTop: 12 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: '#374151' }}>
                                    <input type="checkbox" checked={forwardCase} onChange={e => setForwardCase(e.target.checked)} /> Forward Case
                                </label>
                                {forwardCase && (
                                    <div style={{ marginTop: 8 }}>
                                        <label className="hch-flabel">Forward Reason <RequiredStar /></label>
                                        <textarea className="hch-finput" rows={3} value={hrForwardReason} onChange={e => setHrForwardReason(e.target.value)} placeholder="Enter reason…" />
                                    </div>
                                )}
                            </div>
                        )}
                        {decision && (
                            <div style={{ marginTop: 12 }}>
                                <label className="hch-flabel">Remarks <RequiredStar /></label>
                                <textarea className="hch-finput" rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Enter remarks…" />
                                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className={`hch-btn ${decision?.value === 'Reject' ? 'hch-btn-danger' : 'hch-btn-primary'}`} onClick={handleInitiateHandover}>
                                        {decision?.value === 'Reject' ? '✕ Reject Candidate' : '→ Initiate Handover'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {(status !== 'Init' && rowData?.finalStatusEnum !== 'Accept' && rowData?.finalStatusEnum !== 'Reject' && lastHandover?.handoverStatus === 'SELECTED' && rowData.status !== 'HIRED') && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                        <button className="hch-btn hch-btn-success" onClick={() => { toggleFinalSalaryModal(); setLateStatus(false) }}>
                            ✓ Final Submit
                        </button>
                    </div>
                )}

                {(status !== 'Init' && rowData?.handovers?.[rowData.handovers.length - 1]?.doj1) && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                        <button className="hch-btn hch-btn-primary" onClick={() => { toggleFinalSalaryModal(); setLateStatus(true); setFinalStatus('LateJoining') }}>
                            📋 Candidate Response
                        </button>
                    </div>
                )}
                {/* ── Trial Period ── */}
                {(status !== 'Init' && rowData.status === 'HIRED') && (
                    <Sec dot="#16A34A" label="Trial Period">
                        {!rowData?.candidateTrial || isEditingTrial ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr) auto', gap: '12px 16px', alignItems: 'end' }}>
                                <div>
                                    <label className="hch-flabel">Start Date</label>
                                    <input type="date" className="hch-finput form-control" value={tpStartDate} min={new Date().toISOString().split("T")[0]} onChange={e => setTpStartDate(e.target.value)} />
                                </div>
                                <div>
                                    <label className="hch-flabel">End Date</label>
                                    <input type="date" className="hch-finput form-control" value={tpEndDate} min={new Date().toISOString().split("T")[0]} onChange={e => setTpEndDate(e.target.value)} />
                                </div>
                                {isEditingTrial && (
                                    <div>
                                        <label className="hch-flabel">Status</label>
                                        <Select menuPlacement="auto" value={trialStatus} onChange={setTrialStatus} isClearable placeholder="Select Status"
                                            options={[{ value: 'On_Boarded', label: 'On Boarded' }, { value: 'Terminated', label: 'Terminated' }, { value: 'Absconded', label: 'Absconded' }]}
                                            styles={SEL_STYLES} menuPortalTarget={document.body} />
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="hch-btn hch-btn-primary" onClick={submitTrialPeriod}>Submit</button>
                                    <button className="hch-btn hch-btn-secondary" onClick={() => { setTpStartDate(''); setTpEndDate(''); setIsEditingTrial(false) }}>Clear</button>
                                </div>
                            </div>
                        ) : (
                            <div className="hch-kv-grid">
                                <KV label="Start Date" value={formatDate(rowData.candidateTrial?.startDate)} icon={<MdDateRange />} />
                                <KV label="End Date" value={formatDate(rowData.candidateTrial?.endDate)} icon={<MdDateRange />} />
                                <KV label="Trial Status" value={formatActionType(rowData.candidateTrial?.trialStatus)} icon={<MdDateRange />} />
                                <KV label="Created By" value={rowData.candidateTrial?.createdBy ? `${rowData.candidateTrial.createdBy.name} (${rowData.candidateTrial.createdBy.employeeCode})` : '—'} icon={<MdPersonOutline />} />
                                <div className="hch-kv">
                                    <div className="hch-kv-k"><MdDateRange size={12} /> Created At
                                        <MdEdit color={defaultTheme.goldColorLogo} style={{ cursor: 'pointer', marginLeft: 6 }} title="Edit" onClick={() => { setTpStartDate(rowData.candidateTrial?.startDate?.split("T")[0] || ''); setTpEndDate(rowData.candidateTrial?.endDate?.split("T")[0] || ''); setIsEditingTrial(true) }} />
                                    </div>
                                    <div className="hch-kv-v">{formatDateTime(rowData.candidateTrial?.createdAt) || '—'}</div>
                                </div>
                            </div>
                        )}
                    </Sec>
                )}

                {/* ── Send Docs Mail ── */}
                {(status !== 'Init' && rowData.status === 'HIRED' && !rowData?.documentUploaded) && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                        <button className="hch-btn hch-btn-success" onClick={handleSendMail}>📧 Send Docs Mail</button>
                    </div>
                )}

                {/* ── Final Salary Modal ── */}
                <Modal isOpen={finalSalaryModal} toggle={toggleFinalSalaryModal}>
                    <ModalHeader toggle={toggleFinalSalaryModal} style={{ background: "linear-gradient(135deg,#005B52,#007A6E)", color: "#fff", borderRadius: "8px 8px 0 0" }}>
                        <span style={{ color: "#fff", fontWeight: 700 }}>📋 Final Submission</span>
                    </ModalHeader>
                    <ModalBody>
                        <div style={{ marginBottom: 16 }}>
                            <label className="hch-flabel">Status <RequiredStar /></label>
                            <div className="hch-radio-grp">
                                {(lateStatus ? ["LateJoining", "LateJoining 2", "OfferDeclined"] : ["Accept", "OnHold", "Reject"]).map(s => (
                                    <label key={s} className={`hch-rpill${finalStatus === s ? (s === 'Reject' ? ' on-red' : ' on') : ''}`}>
                                        <input type="radio" name="finalStatus" value={s} checked={finalStatus === s} onChange={e => setFinalStatus(e.target.value)} style={{ display: 'none' }} />
                                        {s === 'LateJoining' ? 'Late Joining' : s === 'OfferDeclined' ? 'Offer Declined' : s}
                                    </label>
                                ))}
                            </div>
                        </div>
                        {finalStatus === "Accept" && (<>
                            <FormGroup>
                                <label className="hch-flabel">Final Salary <RequiredStar /></label>
                                <input type="number" className="hch-finput" value={finalSalary} onChange={e => setFinalSalary(e.target.value)} placeholder="e.g. 50000" />
                                {finalSalaryError && <div className="text-danger mt-1" style={{ fontSize: 11 }}>{finalSalaryError}</div>}
                            </FormGroup>
                            <FormGroup>
                                <label className="hch-flabel">Designation <RequiredStar /></label>
                                <Select menuPlacement="auto" options={designationList?.data?.data || []} value={designation} isClearable onChange={setDesignation} styles={SEL_STYLES} menuPortalTarget={document.body} />
                                {designationError && <div className="text-danger mt-1" style={{ fontSize: 11 }}>{designationError}</div>}
                            </FormGroup>
                            <FormGroup>
                                <label className="hch-flabel">Location <RequiredStar /></label>
                                <Select menuPlacement="auto" options={locationList || []} value={finalLocation} isClearable onChange={setFinalLocation} styles={SEL_STYLES} menuPortalTarget={document.body} />
                                {finalLocationError && <div className="text-danger mt-1" style={{ fontSize: 11 }}>{finalLocationError}</div>}
                            </FormGroup>
                            <FormGroup>
                                <label className="hch-flabel">Expected DOJ <RequiredStar /></label>
                                <input type="date" className="hch-finput" value={doj} min={new Date().toISOString().split("T")[0]} onChange={e => setDoj(e.target.value)} />
                                {dojError && <div className="text-danger mt-1" style={{ fontSize: 11 }}>{dojError}</div>}
                            </FormGroup>
                            <FormGroup>
                                <label className="hch-flabel">Pay Type <RequiredStar /></label>
                                <Select menuPlacement="auto" options={payOptions} value={payType} isClearable onChange={setPayType} styles={SEL_STYLES} menuPortalTarget={document.body} />
                                {payTypeError && <div className="text-danger mt-1" style={{ fontSize: 11 }}>{payTypeError}</div>}
                            </FormGroup>
                        </>)}
                        {finalStatus === "LateJoining" && (
                            <FormGroup>
                                <label className="hch-flabel">Expected DOJ <RequiredStar /></label>
                                <input type="date" className="hch-finput"
                                    disabled={rowData?.handovers?.[rowData.handovers.length - 1]?.doj2} value={rowData?.handovers?.[rowData.handovers.length - 1]?.doj2 ? rowData?.handovers?.[rowData.handovers.length - 1]?.doj2?.split('T')[0] : doj}
                                    min={new Date().toISOString().split("T")[0]} onChange={e => setDoj(e.target.value)} />
                                {dojError && <div className="text-danger mt-1" style={{ fontSize: 11 }}>{dojError}</div>}
                            </FormGroup>
                        )}
                        {finalStatus === "LateJoining 2" && (
                            <FormGroup>
                                <label className="hch-flabel">Expected DOJ <RequiredStar /></label>
                                <input type="date" className="hch-finput"
                                    disabled={rowData?.handovers?.[rowData.handovers.length - 1]?.doj3}
                                    value={rowData?.handovers?.[rowData.handovers.length - 1]?.doj3 ? rowData?.handovers?.[rowData.handovers.length - 1]?.doj3?.split('T')[0] : doj}
                                    min={new Date().toISOString().split("T")[0]} onChange={e => setDoj(e.target.value)} />
                                {dojError && <div className="text-danger mt-1" style={{ fontSize: 11 }}>{dojError}</div>}
                            </FormGroup>
                        )}
                        {/* {["Accept", "OnHold", "Reject", "LateJoining", "LateJoining 2", "OfferDeclined"].includes(finalStatus) && (
                            <FormGroup>
                                <label className="hch-flabel">Remarks <RequiredStar /></label>
                                <textarea className="hch-finput" rows={3} 
                                disabled={finalStatus==='LateJoining'||finalStatus==='LateJoining 2'}
                                value={finalRemarks}
                                 onChange={e => setFinalRemarks(e.target.value)} placeholder="Remarks…" />
                                {remarksError && <div className="text-danger mt-1" style={{ fontSize: 11 }}>{remarksError}</div>}
                            </FormGroup>
                        )} */}

                        {["Accept", "OnHold", "Reject", "LateJoining", "LateJoining 2", "OfferDeclined"].includes(finalStatus) && (
                            <FormGroup>
                                <label className="hch-flabel">
                                    Remarks <RequiredStar />
                                </label>

                                <textarea
                                    className="hch-finput"
                                    rows={3}
                                    disabled={
                                        (finalStatus === "LateJoining" &&
                                            !!rowData?.handovers?.[rowData.handovers.length - 1]?.dojRemark2) ||
                                        (finalStatus === "LateJoining 2" &&
                                            !!rowData?.handovers?.[rowData.handovers.length - 1]?.dojRemark3)
                                    }
                                    value={
                                        finalStatus === "LateJoining" &&
                                            rowData?.handovers?.[rowData.handovers.length - 1]?.dojRemark2
                                            ? rowData.handovers[rowData.handovers.length - 1].dojRemark2
                                            : finalStatus === "LateJoining 2" &&
                                                rowData?.handovers?.[rowData.handovers.length - 1]?.dojRemark3
                                                ? rowData.handovers[rowData.handovers.length - 1].dojRemark3
                                                : finalRemarks
                                    }
                                    onChange={(e) => setFinalRemarks(e.target.value)}
                                    placeholder="Remarks…"
                                />

                                {remarksError && (
                                    <div className="text-danger mt-1" style={{ fontSize: 11 }}>
                                        {remarksError}
                                    </div>
                                )}
                            </FormGroup>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <button className="hch-btn hch-btn-primary" onClick={toggleFinalConfirmationModal} disabled={!finalStatus}>Submit</button>
                        <button className="hch-btn hch-btn-secondary" style={{ backgroundColor: defaultTheme.goldColorLogo }} onClick={toggleFinalSalaryModal}>Cancel</button>
                    </ModalFooter>
                </Modal>

            </Container>
        </PageContent>
    )
}