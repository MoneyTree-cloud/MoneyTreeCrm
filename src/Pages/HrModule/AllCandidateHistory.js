/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Button, Col, Container, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import { ALL_CANDIDATE_HISTORY, CANDIDATE_INTERVIEW_RESCHEDULED, CANDIDATE_SEND_MAIL, HR_LOCATION_DROPDOWN, ALL_HR_DROPDOWN, ALL_DEPARTMENT_DROPDOWN, ALL_CANDIDADTE_EXCEL_DOWNLOAD, GET_MESSAGE_COUNT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import ApiClient from "../../helpers/api_helper";
import { FaArrowAltCircleRight, FaCheck, FaTimes, FaFilter, FaFileExcel, FaCalendarAlt, FaHistory } from "react-icons/fa";
import PageContent from "../../components/Common/PageContent";
import { formatActionType, formatDate, formatDateForInput, formatDateTime, generateTimestamp, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import { BiCalendarEdit, BiSend } from "react-icons/bi";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";
import CountdownTimer from "./CountdownTimer";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import { useGet } from "../../Hooks/useApi";
import Select from 'react-select';
import { sourceOptions } from "../../constants/global";
import ChatModal from "../../constants/ChatModal";
import { MdChat } from "react-icons/md";

// ── Inject styles ─────────────────────────────────────────────────────────────
if (document.getElementById("ach-s")) document.getElementById("ach-s").remove()
const _s = document.createElement("style")
_s.id = "ach-s"
_s.textContent = `
    /* ── Status tabs ── */
    .ach-status-tabs { display:flex; gap:6px; flex-wrap:wrap; }
    .ach-status-tab {
        display:flex; align-items:center; gap:6px;
        padding:7px 16px; border-radius:9px; font-size:12px; font-weight:700;
        cursor:pointer; border:1.5px solid #E2E8F0; background:#fff;
        color:#64748B; transition:all .15s; white-space:nowrap;
    }
    .ach-status-tab:hover { border-color:#005B52; color:#005B52; background:#F0FDF4; }
    .ach-status-tab.active { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; border-color:#005B52; box-shadow:0 3px 10px rgba(0,91,82,.22); }
    .ach-status-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

    /* ── Top toolbar ── */
    .ach-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:14px; background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:12px 16px; box-shadow:0 1px 4px rgba(0,0,0,.04); }

    /* ── Filter panel ── */
    .ach-filter-panel { background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:18px 20px; margin-bottom:14px; box-shadow:0 1px 4px rgba(0,0,0,.04); }
    .ach-filter-title { font-size:11px; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:.8px; margin-bottom:14px; display:flex; align-items:center; gap:7px; }
    .ach-filter-label { font-size:11px; font-weight:600; color:#475569; margin-bottom:5px; display:block; }
    .ach-filter-input { width:100%; height:38px; padding:0 11px; border:1.5px solid #0d0d0e; border-radius:8px; font-size:13px; color:#0F172A; outline:none; transition:border-color .15s; background:#fff; }
    .ach-filter-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }

    /* ── Filter action buttons ── */
    .ach-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 18px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; border:none; transition:all .15s; white-space:nowrap; }
    .ach-btn-primary { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; }
    .ach-btn-primary:hover { opacity:.88; }
    .ach-btn-secondary { background:#F1F5F9; color:#475569; border:1.5px solid #E2E8F0; }
    .ach-btn-secondary:hover { background:#E2E8F0; }
    .ach-btn-filter {  border:1.5px solid #005B52; }
    .ach-btn-filter.open { background:#005B52; color:#fff; }
    .ach-btn-excel { background:#F0FDF4; color:#166534; border:1.5px solid #BBF7D0; }
    .ach-btn-excel:hover { background:#DCFCE7; }

    /* ── Legend pills ── */
    .ach-legend { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
    .ach-legend-item { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:#64748B; }
    .ach-legend-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }

    /* ── Note strip ── */
    .ach-note { font-size:11px; font-weight:600; color:#475569; background:#FFFBEB; border:1px solid #FDE68A; border-radius:8px; padding:6px 12px; display:inline-flex; align-items:center; gap:6px; }

    /* ── Select override ── */
    .ach-filter-panel .react-select__control { min-height:38px !important; border:1.5px solid #E2E8F0 !important; border-radius:8px !important; font-size:13px !important; }
    .ach-filter-panel .react-select__control--is-focused { border-color:#005B52 !important; box-shadow:0 0 0 3px rgba(0,91,82,.08) !important; }
`
document.head.appendChild(_s)

const STATUS_CONFIG = {
    ASSIGNED: { color: "#3B82F6", label: "Assigned" },
    SELECTED: { color: "#22C55E", label: "Selected" },
    NOT_SELECTED: { color: "#EF4444", label: "Not Selected" },
    ON_HOLD: { color: "#84CC16", label: "On Hold" },
    OTHER: { color: "#94A3B8", label: "Other" },
}

const SELECT_STYLES = {
    control: (b, st) => ({ ...b, minHeight: 38, fontSize: 13, border: `1.5px solid ${st.isFocused ? "#005B52" : "#090909"}`, borderRadius: 8, boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.08)" : "none" }),
    option: (b, st) => ({ ...b, fontSize: 13, background: st.isSelected ? "#005B52" : st.isFocused ? "#f0fdf9" : "#fff", color: st.isSelected ? "#fff" : "#0F172A" }),
    menuPortal: b => ({ ...b, zIndex: 9999 }),
}

const statusOptions = [
    { value: 'INTERESTED', label: 'Interested' },
    { value: 'NOT_INTERESTED', label: 'Not Interested' },
    { value: 'CALLBACK', label: 'Call Back' },
    { value: 'CALL_NOT_PICKED', label: 'Call Not Picked' },
    { value: 'DETAILS_SUBMITTED', label: 'Details Submitted' },
    { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
    { value: 'INTERVIEW_RESCHEDULED', label: 'Interview Rescheduled' },
    { value: 'HIRED', label: 'Hired' },
    { value: 'REJECTED', label: 'Rejected' },
]

const trialStatusOptions = [
    { value: 'Started', label: 'Started' },
    { value: 'On_Boarded', label: 'On Boarded' },
    { value: 'Terminated', label: 'Terminated' },
    { value: 'Absconded', label: 'Absconded' },
]

const finalStatusOptions = [
    { value: 'Accept', label: 'Accept' },
    { value: 'Reject', label: 'Reject' },
    { value: 'OnHold', label: 'On Hold' },
    { value: 'LateJoining', label: 'Late Joining' },
    { value: 'OfferDeclined', label: 'Offer Declined' },
]

export default function AllCandidateHistory() {
    const navigation = useNavigate()
    const location = useLocation()
    const LIMIT = 100
    const [page, setPage] = useState(1)
    const { userId, empCode } = useUserStore(s => s.user)
    const [accessGranted, setAccessGranted] = useState(null)
    const [isPending, setIsPending] = useState(false)
    const [data, setData] = useState([])
    const [selectedRow, setSelectedRow] = useState(null)
    const [flag, setFlag] = useState(false)
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
    const [finalStatus, setFinalStatus] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [isLoad, setIsLoad] = useState(false)
    const [formErrors, setFormErrors] = useState({})
    const [highlightRowId, setHighlightRowId] = useState(null);
    const [formData, setFormData] = useState({ date: '', startTime: '', endTime: '' })
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [messageCounts, setMessageCounts] = useState({});
    const handleOpenChat = (row) => {
        setSelectedCandidate(row);
        setIsChatOpen(true);
    };

    const { data: branchList } = useGet(HR_LOCATION_DROPDOWN, { enabled: !!accessGranted })
    const { data: hrList } = useGet(ALL_HR_DROPDOWN, { enabled: !!accessGranted })
    const { data: departmentList } = useGet(ALL_DEPARTMENT_DROPDOWN, { enabled: !!accessGranted })

    const locationOptions = branchList?.data?.data?.map(l => ({ value: l.key, label: l.value })) || []

    const [filters, setFilters] = useState({
        name: '', email: '', phone: '', interviewDate: '', teamName: '',
        location: null, status: null, recruiterName: null, trialStatus: null,
        fromDate: '', toDate: '', department: null, source: null, doj: '', finalStatus: null
    })

    useEffect(() => {
        if (!data?.content?.length) return;

        const fetchCounts = async () => {
            const counts = {};

            await Promise.all(
                data.content.map(async (candidate) => {
                    try {
                        const res = await ApiClient.get(
                            `${GET_MESSAGE_COUNT}?candidateId=${candidate.id}&receiverId=${userId}`
                        );

                        counts[candidate.id] =
                            res?.data?.status === 1
                                ? Number(res.data.data)
                                : 0;
                    } catch (err) {
                        counts[candidate.id] = 0;
                    }
                })
            );

            setMessageCounts(counts);
        };

        fetchCounts();
    }, [data?.content]);

    const setF = (field, value) => setFilters(p => ({ ...p, [field]: value }))

    const handleFilterInputChange = (field, value) => {
        if (field === 'phone') setF(field, value.replace(/\D/g, ''))
        else setF(field, value)
    }

    useEffect(() => {
        if (location.state?.filters) setFilters(p => ({ ...p, ...location.state.filters }))
        if (location.state?.final_Status) setFinalStatus(location.state.final_Status)
        if (location.state?.page) setPage(location.state.page)
        if (location.state?.showFilters) { setShowFilters(true); setIsLoad(true) }
        if (location.state?.highlightRowId) setHighlightRowId(location.state.highlightRowId)
        setFlag(true)
    }, [])

    // Separate effect to auto-clear the highlight after 4 seconds
    useEffect(() => {
        if (!highlightRowId) return
        const t = setTimeout(() => setHighlightRowId(null), 4000)
        return () => clearTimeout(t)
    }, [highlightRowId])

    useEffect(() => {
        if (!highlightRowId || !data?.content?.length || isPending) return
        const idx = data.content.findIndex(r => r.id === highlightRowId)
        if (idx < 0) return
        // Wait two frames so the table has fully painted
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const rows = document.querySelectorAll('.rdt_TableRow')
                rows[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            })
        })
    }, [highlightRowId, data, isPending])

    useEffect(() => {
        if (!flag) return
        if (!location.state?.filters?.fromDate && !location.state?.filters?.toDate && !isLoad) {
            const today = new Date()
            const fd = formatDateForInput(today)
            setFilters(p => ({ ...p, fromDate: fd, toDate: fd }))
            handleGetData(null, null, finalStatus, fd, fd)
        } else {
            handleGetData(null, null, finalStatus, location.state?.filters?.fromDate || filters?.fromDate, location.state?.filters?.toDate || filters?.toDate)
        }
    }, [page, flag, accessGranted])

    const handleGetData = (e, key, fs, startDate, endDate) => {
        if (e) e.preventDefault()
        if (!accessGranted) return
        setIsPending(true)
        const q = []
        if (startDate) q.push(`fromDate=${encodeURIComponent(startDate)}`)
        if (endDate) q.push(`toDate=${encodeURIComponent(endDate)}`)
        if (key !== 'restart') {
            if (filters.name) q.push(`name=${encodeURIComponent(filters.name)}`)
            if (filters.email) q.push(`email=${encodeURIComponent(filters.email)}`)
            if (filters.phone) q.push(`phone=${encodeURIComponent(filters.phone)}`)
            if (filters.interviewDate) q.push(`interviewDate=${encodeURIComponent(filters.interviewDate)}`)
            if (filters.teamName) q.push(`teamName=${encodeURIComponent(filters.teamName)}`)
            if (filters.trialStatus) q.push(`trialStatus=${encodeURIComponent(filters.trialStatus)}`)
            if (filters.location?.value) q.push(`interviewLocation=${encodeURIComponent(filters.location.value)}`)
            if (filters.status?.value) q.push(`status=${encodeURIComponent(filters.status.value)}`)
            if (filters.recruiterName) q.push(`hrId=${encodeURIComponent(filters.recruiterName.value)}`)
            if (filters.department?.value) q.push(`department=${encodeURIComponent(filters.department.value)}`)
            if (filters.source?.value) q.push(`source=${encodeURIComponent(filters.source.value)}`)
            if (filters.doj) q.push(`doj=${encodeURIComponent(filters.doj)}`)
            if (filters.finalStatus) q.push(`finalStatusEnum=${encodeURIComponent(filters.finalStatus.value)}`)
        }
        const statusToUse = fs !== undefined ? fs : finalStatus;

        if (statusToUse) {
            q.push(
                `handoverStatus=${encodeURIComponent(statusToUse)}`
            );
        }

        const qs = q.length ? `&${q.join('&')}` : ''
        ApiClient.get(`${ALL_CANDIDATE_HISTORY}offset=${key === 'page' ? 0 : page - 1}&limit=${LIMIT}${qs}`)
            .then(res => {
                setIsPending(false)
                if (res?.data?.status === 1) {
                    decryptData(res.data.data).then(d => setData(d)).catch(() => setData([]))
                } else if (res?.data?.message !== 'No record found.') {
                    toast.error(res.data.message); setData([])
                } else setData([])
            })
            .catch(err => { setIsPending(false); setData([]); toast.error(err.message) })
    }

    const handleClearFilters = () => {
        const hasAny = Object.values(filters).some(Boolean) || finalStatus
        setFinalStatus(""); setShowFilters(false); setPage(1)
        if (hasAny) {
            const today = new Date(); const fd = formatDateForInput(today)
            setFilters({ name: '', email: '', phone: '', interviewDate: '', teamName: '', location: null, status: null, recruiterName: null, trialStatus: null, department: null, source: null, doj: '', finalStatus: null, fromDate: fd, toDate: fd })
            handleGetData(null, 'restart', null, fd, fd)
            navigation(location.pathname, { replace: true, state: {} })
        }
    }

    const handleSendMail = row => {
        if (!window.confirm("Send mail to this candidate?")) return
        setIsPending(true)
        ApiClient.post(`${CANDIDATE_SEND_MAIL}candidateId=${row.id}&userId=${userId}`)
            .then(res => { setIsPending(false); res?.data?.status === 1 ? toast.success(res.data.message) : toast.error(res.data.message) })
            .catch(err => { setIsPending(false); toast.error(err.message) })
    }

    const handleReschedule = () => {
        const errors = {}
        if (!formData.date) errors.date = "Date is required"
        if (!formData.startTime) errors.startTime = "Start time is required"
        if (!formData.endTime) errors.endTime = "End time is required"
        if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime)
            errors.endTime = "End time must be after start time"
        setFormErrors(errors)
        if (Object.keys(errors).length) return
        setIsPending(true)
        ApiClient.post(`${CANDIDATE_INTERVIEW_RESCHEDULED}candidateId=${selectedRow.id}&userId=${userId}&interviewTime=${formData.date}&startTime=${formData.startTime}&endTime=${formData.endTime}`)
            .then(res => {
                setIsPending(false)
                if (res?.data?.status === 1) {
                    toast.success(res.data.message); setRescheduleModalOpen(false)
                    handleGetData(); setSelectedRow(null); setFormData({ date: '', startTime: '', endTime: '' }); setFormErrors({})
                } else toast.error(res.data.message)
            })
            .catch(err => { setIsPending(false); toast.error(err.message) })
    }

    const handleInputChange = (field, value) => {
        setFormData(p => ({ ...p, [field]: value }))
        if (value) setFormErrors(p => { const n = { ...p }; delete n[field]; return n })
    }

    const downloadDataExcel = () => {
        setIsPending(true)
        ApiClient.get(`${ALL_CANDIDADTE_EXCEL_DOWNLOAD}?fromDate=${filters.fromDate}&toDate=${filters.toDate}`, { responseType: "arraybuffer" })
            .then(res => {
                setIsPending(false)
                const ct = res.headers["content-type"]
                if (ct !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                    try { toast.error(JSON.parse(new TextDecoder().decode(new Uint8Array(res.data))).message || "Failed") }
                    catch { toast.error("Unexpected error") }
                    return
                }
                const link = Object.assign(document.createElement("a"), {
                    href: window.URL.createObjectURL(new Blob([res.data], { type: ct })),
                    download: `allCandidatesData_${generateTimestamp()}.xlsx`
                })
                document.body.appendChild(link); link.click(); document.body.removeChild(link)
            })
            .catch(err => { setIsPending(false); toast.error(err.message) })
    }

    useEffect(() => {
        CheckUserAccess(userId, 'all-candidate-history').then(setAccessGranted)
    }, [userId])

    const columns = [
        { name: <span className="font-weight-bold fs-13">SL No.</span>, width: "4%", cell: (_, i) => <WordWrapCell>{(page - 1) * LIMIT + i + 1}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Candidate ID</span>, sortable: true, selector: r => r.id, cell: r => <WordWrapCell>{r.id}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Show More</span>, width: "5%",
            cell: row => <FaArrowAltCircleRight title="Show Details" onClick={() => navigation("/all-candidate-history/candidate-history", { state: { rowData: row, status: 'Final', filters, page, final_Status: finalStatus, showFilters, highlightRowId: row.id, } })} cursor="pointer" color={defaultTheme.primary} size={16} />
        },
        ...((empCode === "1" || empCode === '1670')
            ? [
                {
                    name: <span className="font-weight-bold fs-13">History</span>,
                    cell: (r) => (
                        <button
                            onClick={() => navigation('/all-candidate-history/candidate-logs', {
                                state: {
                                    candidateId: r.id,
                                    candidateName: r.firstName
                                }
                            })}
                            title="View change history"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `${defaultTheme.goldColorLogo}1A`,
                                color: defaultTheme.goldColorLogo,
                                border: `1px solid ${defaultTheme.goldColorLogo}40`,
                                borderRadius: 8,
                                cursor: 'pointer',
                                transition: 'background .15s, transform .1s',
                            }}
                        >
                            <FaHistory size={13} />
                        </button>
                    ),
                },
            ]
            : []),
        {
            name: <span className="font-weight-bold fs-13">Chat With MT/ST</span>,
            cell: (r) =>
                r.handovers?.length > 0 ? (
                    <div
                        style={{
                            position: "relative",
                            display: "inline-flex",
                        }}
                    >
                        <button
                            onClick={() => handleOpenChat(r)}
                            title="Chat With MT/ST"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: `${defaultTheme.primary}1A`,
                                color: defaultTheme.primary,
                                border: `1px solid ${defaultTheme.primary}40`,
                                borderRadius: 8,
                                cursor: "pointer",
                                padding: "6px 8px",
                            }}
                        >
                            <MdChat size={13} />
                        </button>

                        {messageCounts[r.id] > 0 && (
                            <span
                                style={{
                                    position: "absolute",
                                    top: -6,
                                    right: -6,
                                    minWidth: 18,
                                    height: 18,
                                    borderRadius: "50%",
                                    background: "red",
                                    color: "#fff",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "0 4px",
                                    zIndex: 1,
                                }}
                            >
                                {messageCounts[r.id] > 99 ? "99+" : messageCounts[r.id]}
                            </span>
                        )}
                    </div>
                ) : (
                    <span className="text-muted">Not Allowed</span>
                ),
        },
        {
            name: <span className="font-weight-bold fs-13">TP Status</span>, sortable: true, selector: r => r?.candidateTrial?.trialStatus,
            cell: r => <div className="phone-container"><WordWrapCell>{formatActionType(r?.candidateTrial?.trialStatus) || '-'}<span className="phone-number">{r?.candidateTrial?.trialStatus ? formatDate(r?.candidateTrial?.startDate) + ' To ' + formatDate(r?.candidateTrial?.endDate) : '-'}</span></WordWrapCell></div>
        },
        { name: <span className="font-weight-bold fs-13">Created At</span>, sortable: true, selector: r => r.createdAt, cell: r => <WordWrapCell>{formatDateTime(r.createdAt)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Source</span>, sortable: true, selector: r => r.sources?.[0]?.sourceName, cell: r => <WordWrapCell>{r.sources?.[0]?.sourceName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Department</span>, sortable: true, selector: r => r.department, cell: r => <WordWrapCell>{r.department}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Handover Status</span>, sortable: false,
            cell: row => { const s = row.handovers?.[row.handovers.length - 1]?.handoverStatus; const c = STATUS_CONFIG[s]?.color || STATUS_CONFIG.OTHER.color; return <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} /></div> }
        },
        { name: <span className="font-weight-bold fs-13">Candidate Name</span>, sortable: true, selector: r => r.firstName, cell: r => <WordWrapCell>{r.firstName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Interview Date</span>, sortable: true, selector: r => r?.interviews[0]?.scheduledAtDate, cell: r => <WordWrapCell>{formatDate(r?.interviews[0]?.scheduledAtDate) || '-'}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">DOJ</span>, sortable: true, selector: r => r?.handovers[r.handovers.length - 1]?.doj, cell: r => <WordWrapCell>{formatDate(r?.handovers[r.handovers.length - 1]?.doj) || '-'}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Created By</span>, sortable: true, selector: r => r.createdByName, cell: r => <WordWrapCell>{formatActionType(r.createdByName + ' (' + r.createdByCode + ')')}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Status</span>, sortable: true, selector: r => r.status,
            cell: r => <div style={{ wordWrap: "break-word", whiteSpace: "normal", color: r.transferAt && r.status === 'HIRED' ? defaultTheme.goldColorLogo : null }}>{formatActionType(r.status)}</div>
        },
        {
            name: <span className="font-weight-bold fs-13">Team</span>, sortable: true, selector: r => r.handovers?.[r.handovers.length - 1]?.mainTeam,
            cell: r => { const h = r.handovers?.[r.handovers.length - 1]; return <WordWrapCell>{h?.mainTeam && h?.subTeam ? `${h.mainTeam}/${h.subTeam}` : "-"}</WordWrapCell> }
        },
        { name: <span className="font-weight-bold fs-13">Emp Code</span>, sortable: true, selector: r => r?.empCode, cell: r => <div className="phone-container"><WordWrapCell>{r?.empCode || '-'}</WordWrapCell></div> },
        {
            name: <span className="font-weight-bold fs-13">Handover Expiry</span>,
            cell: r => { const h = r.handovers?.[r.handovers.length - 1]; const show = h?.handoverStatus === 'ON_HOLD' && h?.handoverDate; return <WordWrapCell>{show ? <span style={{ color: 'yellowgreen', fontWeight: 'bold' }} title={formatDateTime(h.handoverDate)}><CountdownTimer targetDate={h.handoverDate} /></span> : '-'}</WordWrapCell> }
        },
        { name: <span className="font-weight-bold fs-13">Form Filled</span>, selector: r => r.formFilled, cell: r => <WordWrapCell>{r.formFilled ? <FaCheck color="green" size={12} title="YES" /> : <FaTimes color="red" size={12} title="NO" />}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Docs Uploaded</span>, selector: r => r.documentUploaded, cell: r => <WordWrapCell>{r.documentUploaded ? <FaCheck color="green" size={12} title="YES" /> : <FaTimes color="red" size={12} title="NO" />}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Send Mail</span>, cell: row => <BiSend style={{ cursor: row.status === 'HIRED' || row.status === 'REJECTED' ? 'not-allowed' : 'pointer', opacity: row.status === 'HIRED' || row.status === 'REJECTED' ? 0.5 : 1 }} size={20} title={row.status === 'HIRED' || row.status === 'REJECTED' ? formatActionType(row.status) : 'Send Mail'} className="text-secondary" onClick={() => { if (row.status !== 'HIRED' && row.status !== 'REJECTED') handleSendMail(row) }} /> },
        { name: <span className="font-weight-bold fs-13">Reschedule</span>, cell: row => <BiCalendarEdit style={{ cursor: row.status === 'HIRED' || row.status === 'REJECTED' ? 'not-allowed' : 'pointer', opacity: row.status === 'HIRED' || row.status === 'REJECTED' ? 0.5 : 1 }} size={20} title={row.status === 'HIRED' || row.status === 'REJECTED' ? formatActionType(row.status) : 'Reschedule Interview'} className="text-secondary" onClick={() => { if (row.status !== 'HIRED' && row.status !== 'REJECTED') { setSelectedRow(row); setFormData({ date: '', startTime: '', endTime: '' }); setFormErrors({}); setRescheduleModalOpen(true) } }} /> },
        { name: <span className="font-weight-bold fs-13">Remarks</span>, sortable: true, selector: r => r.createRemarks, cell: r => <WordWrapCell>{r.createRemarks}</WordWrapCell> },
    ]

    const handleCloseChat = () => {
        setIsChatOpen(false);

        if (selectedCandidate) {
            fetchMessageCount(selectedCandidate.id, userId);
        }
    };

    const fetchMessageCount = async (candidateId, receiverId) => {
        try {
            const response = await ApiClient.get(
                `${GET_MESSAGE_COUNT}?candidateId=${candidateId}&receiverId=${receiverId}`
            );

            if (response?.data?.status === 1) {
                setMessageCounts(prev => ({
                    ...prev,
                    [candidateId]: response.data.data || 0,
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (accessGranted === null) return <ScreenLoader />
    if (!accessGranted) return <PermissionMissing />

    return (
        <PageContent>
            <Breadcrumbs title="HR Module" breadcrumbItem="All Candidate History" />
            {isPending && <ScreenLoader />}
            <Container fluid>

                {/* ── Toolbar ── */}
                <div className="ach-toolbar">
                    {/* Status tabs */}
                    <div className="ach-status-tabs">
                        {["ASSIGNED", "SELECTED", "ON_HOLD", "NOT_SELECTED"].map(s => (
                            <button key={s} className={`ach-status-tab${finalStatus === s ? " active" : ""}`}
                                onClick={() => { setFinalStatus(s); handleGetData(null, "", s, filters.fromDate, filters.toDate) }}>
                                <span className="ach-status-dot" style={{ background: finalStatus === s ? "rgba(255,255,255,.7)" : STATUS_CONFIG[s]?.color || "#94A3B8" }} />
                                {STATUS_CONFIG[s]?.label || s}
                            </button>
                        ))}
                        {finalStatus && (
                            <button className="ach-status-tab" style={{ color: "#EF4444", borderColor: "#FECACA" }}
                                onClick={() => { setFinalStatus(""); handleGetData(null, "", "", filters.fromDate, filters.toDate) }}>
                                <FaTimes size={11} /> Clear
                            </button>
                        )}
                    </div>

                    {/* Right actions */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        {/* Legend */}
                        <div className="ach-legend">
                            {Object.entries(STATUS_CONFIG).map(([k, { color, label }]) => (
                                <div key={k} className="ach-legend-item">
                                    <span className="ach-legend-dot" style={{ background: color }} />
                                    {label}
                                </div>
                            ))}
                        </div>
                        <div style={{ width: 1, height: 22, background: "#E2E8F0" }} />
                        <button className={`ach-btn ach-btn-filter${showFilters ? " open" : ""}`}
                            onClick={() => setShowFilters(p => !p)}>
                            <FaFilter size={11} /> {showFilters ? "Hide" : "Filters"}
                        </button>
                        <button className="ach-btn ach-btn-excel" onClick={downloadDataExcel}>
                            <FaFileExcel size={12} /> Excel
                        </button>
                    </div>
                </div>

                {/* ── Filter panel ── */}
                {showFilters && (
                    <div className="ach-filter-panel">
                        <div className="ach-filter-title">
                            <FaFilter size={10} /> Search Filters
                        </div>
                        <form onSubmit={e => { handleGetData(e, "page", finalStatus, filters.fromDate, filters.toDate); setIsLoad(true) }}>
                            <Row className="g-3">
                                {/* Date range */}
                                {[
                                    { id: "fromDate", label: "Start Date", type: "date" },
                                    { id: "toDate", label: "End Date", type: "date" },
                                ].map(({ id, label, type }) => (
                                    <Col key={id} sm={12} md={2}>
                                        <label className="ach-filter-label">{label} <RequiredStar /></label>
                                        <input type={type} className="ach-filter-input" value={filters[id]}
                                            onChange={e => handleFilterInputChange(id, e.target.value)} />
                                    </Col>
                                ))}
                                {/* Text inputs */}
                                {[
                                    { id: "name", label: "Name", ph: "Search by name" },
                                    { id: "email", label: "Email", ph: "Search by email" },
                                    { id: "phone", label: "Phone", ph: "Search by phone" },
                                    { id: "teamName", label: "Team Name", ph: "Team name…" },
                                    { id: "interviewDate", label: "Interview Date", type: "date" },
                                    { id: "doj", label: "Date of Joining", type: "date" },
                                ].map(({ id, label, ph, type }) => (
                                    <Col key={id} sm={12} md={2}>
                                        <label className="ach-filter-label">{label}</label>
                                        <input type={type || "text"} className="ach-filter-input"
                                            placeholder={ph} value={filters[id]}
                                            onChange={e => handleFilterInputChange(id, e.target.value)} />
                                    </Col>
                                ))}
                                {/* Select dropdowns */}
                                {[
                                    { id: "department", label: "Department", opts: departmentList?.data?.data || [] },
                                    { id: "location", label: "Location", opts: locationOptions },
                                    { id: "status", label: "Status", opts: statusOptions },
                                    { id: "recruiterName", label: "Recruiter", opts: hrList?.data?.data || [] },
                                    { id: "source", label: "Source", opts: sourceOptions || [] },
                                    { id: "finalStatus", label: "Final Status", opts: finalStatusOptions },
                                ].map(({ id, label, opts }) => (
                                    <Col key={id} sm={12} md={2}>
                                        <label className="ach-filter-label">{label}</label>
                                        <Select options={opts} value={filters[id]} isClearable
                                            onChange={val => setF(id, val)}
                                            menuPortalTarget={document.body} styles={SELECT_STYLES} />
                                    </Col>
                                ))}
                                {/* Trial status (string value) */}
                                <Col sm={12} md={2}>
                                    <label className="ach-filter-label">Trial Status</label>
                                    <Select options={trialStatusOptions} isClearable menuPortalTarget={document.body}
                                        styles={SELECT_STYLES}
                                        value={trialStatusOptions.find(o => o.value === filters.trialStatus) || null}
                                        onChange={opt => handleFilterInputChange('trialStatus', opt?.value || '')} />
                                </Col>
                                {/* Buttons */}
                                <Col sm={12} md={2} className="d-flex align-items-end gap-2">
                                    <button type="submit" className="ach-btn ach-btn-primary">
                                        <FaFilter size={11} /> Search
                                    </button>
                                    <button type="button" className="ach-btn ach-btn-secondary" onClick={handleClearFilters}>
                                        <FaTimes size={11} /> Clear
                                    </button>
                                </Col>
                            </Row>
                        </form>
                    </div>
                )}

                {/* ── Note ── */}
                <div style={{ marginBottom: 12 }}>
                    <span className="ach-note">
                        <span style={{ color: defaultTheme.btnEnable, fontWeight: 800 }}>●</span>
                        Candidates in blue are transferred candidates
                    </span>
                </div>

                <AppTable
                    progressPending={isPending}
                    columns={columns}
                    data={data?.content || []}
                    pagination paginationServer
                    paginationTotalRows={data?.totalElements}
                    onChangePage={setPage}
                    paginationDefaultPage={page}
                    key={`all-candidates-page-${page}`}
                    conditionalRowStyles={[
                        { when: r => r.status === 'REJECTED' || r.finalStatusEnum === 'Reject' || ['Terminated', 'Absconded', 'Join & Left'].includes(r?.candidateTrial?.trialStatus), style: { color: defaultTheme.redColor } },
                        { when: r => r.status === 'HIRED', style: { color: defaultTheme.goldColorLogo } },
                        { when: r => Boolean(r.transferAt), style: { color: defaultTheme.btnEnable } },
                        {
                            when: r => r.id === highlightRowId,
                            style: {
                                backgroundColor: '#FEF3C7',           // soft amber background
                                borderLeft: `4px solid ${defaultTheme.goldColorLogo}`,
                                animation: 'hrh-pulse 1.2s ease-in-out 2',
                                transition: 'background-color 0.4s ease',
                                fontWeight: 600,
                            },
                        },

                    ]}
                />

                {/* ── Reschedule Modal ── */}
                <Modal isOpen={rescheduleModalOpen} toggle={() => setRescheduleModalOpen(p => !p)}>
                    <ModalHeader toggle={() => setRescheduleModalOpen(false)}
                        style={{ background: "linear-gradient(135deg,#005B52,#007A6E)", color: "#fff", borderRadius: "8px 8px 0 0" }}>
                        <span style={{ color: "#fff", fontWeight: 700 }}>
                            <FaCalendarAlt style={{ marginRight: 8 }} />
                            Reschedule — {selectedRow?.firstName} {selectedRow?.middleName} {selectedRow?.lastName}
                        </span>
                    </ModalHeader>
                    <ModalBody>
                        {[
                            { id: "date", label: "Date", type: "date", min: new Date().toISOString().split("T")[0] },
                            { id: "startTime", label: "Start Time", type: "time" },
                            { id: "endTime", label: "End Time", type: "time" },
                        ].map(({ id, label, type, min }) => (
                            <FormGroup key={id}>
                                <Label for={id}>{label}</Label>
                                <Input type={type} id={id} min={min} value={formData[id]}
                                    onChange={e => handleInputChange(id, e.target.value)}
                                    invalid={!!formErrors[id]} />
                                {formErrors[id] && <FormFeedback>{formErrors[id]}</FormFeedback>}
                            </FormGroup>
                        ))}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={handleReschedule} style={{ background: "linear-gradient(135deg,#005B52,#007A6E)", border: "none", fontWeight: 700 }}>
                            Reschedule
                        </Button>
                        <Button color="secondary" onClick={() => setRescheduleModalOpen(false)} style={{ backgroundColor: defaultTheme.goldColorLogo }}>Cancel</Button>
                    </ModalFooter>
                </Modal>

                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => handleCloseChat()}
                    candidateDetail={selectedCandidate}
                />

            </Container>
        </PageContent>
    )
}