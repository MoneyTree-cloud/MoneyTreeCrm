/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Col, Container, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import { ALL_DEPARTMENT_DROPDOWN, CANDIDATE_HISTORY, CANDIDATE_INTERVIEW_RESCHEDULED, CANDIDATE_SEND_MAIL, GET_MESSAGE_COUNT, HR_LOCATION_DROPDOWN } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import ApiClient from "../../helpers/api_helper";
import { FaArrowAltCircleRight, FaCheck, FaTimes, FaFilter, FaPlus, FaCalendarAlt } from "react-icons/fa";
import PageContent from "../../components/Common/PageContent";
import { formatActionType, formatDate, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { BiCalendarEdit, BiSend } from "react-icons/bi";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import CountdownTimer from "./CountdownTimer";
import { decryptData } from "../../components/Common/CryptoUtils";
import PermissionMissing from "../Utility/PermissonMissing";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { useGet } from "../../Hooks/useApi";
import Select from 'react-select';
import { sourceOptions } from "../../constants/global";
import ChatModal from "../../constants/ChatModal";
import { MdChat } from "react-icons/md";

// ── Shared styles (same pattern as AllCandidateHistory) ──────────────────────
if (document.getElementById("hrh-s")) document.getElementById("hrh-s").remove()
const _s = document.createElement("style")
_s.id = "hrh-s"
_s.textContent = `
@keyframes hrh-pulse {
    0%, 100% { box-shadow: inset 0 0 0 0 rgba(217, 119, 6, 0); }
    50%      { box-shadow: inset 0 0 12px 0 rgba(217, 119, 6, 0.25); }
}
    .hrh-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:14px; background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:12px 16px; box-shadow:0 1px 4px rgba(0,0,0,.04); }
    .hrh-status-tabs { display:flex; gap:6px; flex-wrap:wrap; }
    .hrh-status-tab { display:flex; align-items:center; gap:6px; padding:7px 16px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; border:1.5px solid #E2E8F0; background:#fff; color:#64748B; transition:all .15s; white-space:nowrap; }
    .hrh-status-tab:hover { border-color:#005B52; color:#005B52; background:#F0FDF4; }
    .hrh-status-tab.active { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; border-color:#005B52; box-shadow:0 3px 10px rgba(0,91,82,.22); }
    .hrh-status-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

    .hrh-type-tabs { display:flex; gap:6px; margin-bottom:14px; }
    .hrh-type-tab { padding:7px 20px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; border:1.5px solid #E2E8F0;  }
    .hrh-type-tab.active { background:linear-gradient(135deg,#C9A84C,#D4A017); color:#fff; border-color:#C9A84C; box-shadow:0 3px 10px rgba(201,168,76,.28); }

    .hrh-filter-panel { background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:18px 20px; margin-bottom:14px; box-shadow:0 1px 4px rgba(0,0,0,.04); }
    .hrh-filter-title { font-size:11px; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:.8px; margin-bottom:14px; display:flex; align-items:center; gap:7px; }
    .hrh-filter-label { font-size:11px; font-weight:600; color:#475569; margin-bottom:5px; display:block; }
    .hrh-filter-input { width:100%; height:38px; padding:0 11px; border:1.5px solid #080808; border-radius:8px; font-size:13px; color:#0F172A; outline:none; transition:border-color .15s; background:#fff; }
    .hrh-filter-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }

    .hrh-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 18px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; border:none; transition:all .15s; white-space:nowrap; }
    .hrh-btn-primary  { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; }
    .hrh-btn-primary:hover { opacity:.88; }
    .hrh-btn-secondary { background:#F1F5F9; color:#475569; border:1.5px solid #E2E8F0; }
    .hrh-btn-secondary:hover { background:#E2E8F0; }
    .hrh-btn-filter {  border:1.5px solid #005B52; }
    .hrh-btn-filter.open { background:#005B52; color:#fff; }
    .hrh-btn-add { background:#FFFBEB; color:#92400E; border:1.5px solid #FDE68A; }
    .hrh-btn-add:hover { background:#FEF3C7; }

    .hrh-legend { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
    .hrh-legend-item { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:#64748B; }
    .hrh-legend-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
    .hrh-note { font-size:11px; font-weight:600; color:#475569; background:#FFFBEB; border:1px solid #FDE68A; border-radius:8px; padding:6px 12px; display:inline-flex; align-items:center; gap:6px; margin-bottom:12px; }
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
    control: (b, st) => ({ ...b, minHeight: 38, fontSize: 13, border: `1.5px solid ${st.isFocused ? "#005B52" : "#0b0b0b"}`, borderRadius: 8, boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.08)" : "none" }),
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

export default function HrRecruiterHistory() {
    const navigation = useNavigate()
    const location = useLocation()
    const userId = useUserStore(s => s.user.userId)
    const LIMIT = 100
    const [page, setPage] = useState(1)
    const [isPending, setIsPending] = useState(false)
    const [data, setData] = useState([])
    const [selectedRow, setSelectedRow] = useState(null)
    const [flag, setFlag] = useState(false)
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
    const [finalStatus, setFinalStatus] = useState("")
    const [accessGranted, setAccessGranted] = useState(null)
    const [formErrors, setFormErrors] = useState({})
    const [candidateStatus, setCandidateStatus] = useState('self')
    const [showFilters, setShowFilters] = useState(false)
    const [highlightRowId, setHighlightRowId] = useState(null);
    const [formData, setFormData] = useState({ date: '', startTime: '', endTime: '' })
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [messageCounts, setMessageCounts] = useState({});


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

    const handleOpenChat = (row) => {
        setSelectedCandidate(row);
        setIsChatOpen(true);
    };

    const { data: branchList } = useGet(HR_LOCATION_DROPDOWN, { enabled: !!accessGranted })
    const { data: departmentList } = useGet(ALL_DEPARTMENT_DROPDOWN, { enabled: !!accessGranted })
    const locationOptions = branchList?.data?.data?.map(l => ({ value: l.key, label: l.value })) || []

    const [filters, setFilters] = useState({
        name: '', email: '', phone: '', location: null, status: null,
        dateOfInterview: '', fromDate: '', toDate: '', department: null, source: null, doj: ''
    })

    const setF = (field, value) => setFilters(p => ({ ...p, [field]: value }))

    const handleFilterInputChange = (field, value) => {
        if (field === 'phone') setF(field, value.replace(/\D/g, ''))
        else setF(field, value)
    }

    useEffect(() => {
        if (location.state?.filters) setFilters(p => ({ ...p, ...location.state.filters }))
        if (location.state?.page) setPage(location.state.page)
        if (location.state?.candidateStatus) setCandidateStatus(location.state.candidateStatus)
        if (location.state?.showFilters) setShowFilters(location.state.showFilters)
        if (location.state?.final_Status) setFinalStatus(location.state.final_Status)
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
        if (!accessGranted || !flag) return
        handleGetData()
    }, [page, flag, accessGranted, candidateStatus])

    const handleGetData = (e, key, fs) => {
        if (e) e.preventDefault()
        setIsPending(true)
        const q = []
        if (key !== 'restart') {
            if (filters.name) q.push(`name=${encodeURIComponent(filters.name)}`)
            if (filters.email) q.push(`email=${encodeURIComponent(filters.email)}`)
            if (filters.phone) q.push(`phone=${encodeURIComponent(filters.phone)}`)
            if (filters.location?.value) q.push(`interviewLocation=${encodeURIComponent(filters.location.value)}`)
            if (filters.status?.value) q.push(`status=${encodeURIComponent(filters.status.value)}`)
            if (filters.dateOfInterview) q.push(`dateOfInterview=${encodeURIComponent(filters.dateOfInterview)}`)
            if (filters.fromDate) q.push(`fromDate=${encodeURIComponent(filters.fromDate)}`)
            if (filters.toDate) q.push(`toDate=${encodeURIComponent(filters.toDate)}`)
            if (filters.department?.value) q.push(`department=${encodeURIComponent(filters.department.value)}`)
            if (filters.source?.value) q.push(`source=${encodeURIComponent(filters.source.value)}`)
            if (filters.doj) q.push(`doj=${encodeURIComponent(filters.doj)}`)
        }
        const statusToUse = fs !== undefined ? fs : finalStatus;

        if (statusToUse) {
            q.push(
                `handoverStatus=${encodeURIComponent(statusToUse)}`
            );
        }
        q.push(`transferredStatus=${candidateStatus === 'self' ? 'NO' : 'YES'}`)
        const qs = q.length ? `&${q.join('&')}` : ''
        ApiClient.get(`${CANDIDATE_HISTORY}userId=${userId}&offset=${key === 'page' ? 0 : page - 1}&limit=${LIMIT}${qs}`)
            .then(res => {
                setIsPending(false)
                if (res?.data?.status === 1) {
                    decryptData(res.data.data).then(d => setData(d)).catch(() => setData([]))
                } else if (res.data.message !== 'No record found.' && res.data.message !== 'No value present') {
                    toast.error(res.data.message); setData([])
                } else setData([])
            })
            .catch(err => { setData([]); setIsPending(false); toast.error(err.message) })
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
                    setSelectedRow(null); handleGetData()
                    setFormData({ date: '', startTime: '', endTime: '' }); setFormErrors({})
                } else toast.error(res.data.message)
            })
            .catch(err => { setIsPending(false); toast.error(err.message) })
    }

    const handleInputChange = (field, value) => {
        setFormData(p => ({ ...p, [field]: value }))
        if (value) setFormErrors(p => { const n = { ...p }; delete n[field]; return n })
    }

    const handleClearFilters = () => {
        const hasAny = Object.values(filters).some(Boolean) || finalStatus
        setFinalStatus(""); setShowFilters(false); setPage(1)
        if (hasAny) {
            setFilters({ name: '', email: '', phone: '', location: null, status: null, dateOfInterview: '', fromDate: '', toDate: '', department: null, source: null, doj: '' })
            handleGetData(null, 'restart')
            navigation(location.pathname, { replace: true, state: {} })
        }
    }

    const isDisabled = row => row.status === 'HIRED' || row.status === 'REJECTED'

    const columns = [
        { name: <span className="font-weight-bold fs-13">SL No.</span>, width: "4%", cell: (_, i) => <WordWrapCell>{(page - 1) * LIMIT + i + 1}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Manage</span>, width: "5%",
            cell: row => <i className="ri-pencil-fill align-bottom me-2"
                title={isDisabled(row) ? formatActionType(row.status) : 'Manage Candidate'}
                onClick={() => { if (!isDisabled(row)) navigation("/recruiter-history/hr-recruiter-form", { state: { rowData: row, filters, page, candidateStatus, showFilters, final_Status: finalStatus, highlightRowId: row.id, } }) }}
                style={{ cursor: isDisabled(row) ? 'not-allowed' : 'pointer', opacity: isDisabled(row) ? 0.5 : 1, color: defaultTheme.goldColorLogo }} />
        },
        {
            name: <span className="font-weight-bold fs-13">Show More</span>, width: "5%",
            cell: row => <FaArrowAltCircleRight title="Show Details" onClick={() => navigation("/recruiter-history/candidate-history", { state: { rowData: row, status: 'Init', filters, page, candidateStatus, showFilters, final_Status: finalStatus, } })} cursor="pointer" color={defaultTheme.primary} size={16} />
        },
        {
            name: <span className="font-weight-bold fs-13">Chat With MT/ST</span>,
            cell: r =>
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
                            }}
                        >
                            {messageCounts[r.id]}
                        </span>
                    )}
                </div>
        },
        { name: <span className="font-weight-bold fs-13">Candidate ID</span>, sortable: true, selector: r => r.id, cell: r => <WordWrapCell>{r.id}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Candidate Name</span>, sortable: true, selector: r => r.firstName, cell: r => <WordWrapCell>{r.firstName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Source</span>, sortable: true, selector: r => r.sources?.[0]?.sourceName, cell: r => <WordWrapCell>{r.sources?.[0]?.sourceName}</WordWrapCell> },
        ...(candidateStatus === 'self' ? [
            { name: <span className="font-weight-bold fs-13">Created At</span>, sortable: true, selector: r => r.createdAt, cell: r => <WordWrapCell>{formatDateTime(r.createdAt)}</WordWrapCell> },
            {
                name: <span className="font-weight-bold fs-13">Handover Status</span>,
                cell: row => { const s = row.handovers?.[row.handovers.length - 1]?.handoverStatus; const c = STATUS_CONFIG[s]?.color || STATUS_CONFIG.OTHER.color; return <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} /></div> }
            },
            { name: <span className="font-weight-bold fs-13">Interview Date</span>, sortable: true, selector: r => r?.interviews[0]?.scheduledAtDate, cell: r => <WordWrapCell>{formatDate(r?.interviews[0]?.scheduledAtDate) || '-'}</WordWrapCell> },
            { name: <span className="font-weight-bold fs-13">DOJ</span>, sortable: true, selector: r => r?.handovers[r.handovers.length - 1]?.doj, cell: r => <WordWrapCell>{formatDate(r?.handovers[r.handovers.length - 1]?.doj) || '-'}</WordWrapCell> },
            { name: <span className="font-weight-bold fs-13">Emp Code</span>, sortable: true, selector: r => r?.empCode, cell: r => <div className="phone-container"><WordWrapCell>{r?.empCode || '-'}</WordWrapCell></div> },
            { name: <span className="font-weight-bold fs-13">Created By</span>, sortable: true, selector: r => r.createdByName, cell: r => <WordWrapCell>{formatActionType(r.createdByName + ' (' + r.createdByCode + ')')}</WordWrapCell> },
            {
                name: <span className="font-weight-bold fs-13">Status</span>, sortable: true, selector: r => r.status,
                cell: r => <div style={{ wordWrap: "break-word", whiteSpace: "normal", fontWeight: r.status === 'DO_NOT_CALL' ? 'bold' : null, color: r.transferAt && r.status === 'HIRED' ? defaultTheme.goldColorLogo : r.status === 'DO_NOT_CALL' ? 'red' : null }}>{formatActionType(r.status)}</div>
            },
            {
                name: <span className="font-weight-bold fs-13">Handover Expiry</span>,
                cell: r => { const h = r.handovers?.[r.handovers.length - 1]; const show = h?.handoverStatus === 'ON_HOLD' && h?.handoverDate; return <WordWrapCell>{show ? <span style={{ color: 'yellowgreen', fontWeight: 'bold' }} title={formatDateTime(h.handoverDate)}><CountdownTimer targetDate={h.handoverDate} /></span> : '-'}</WordWrapCell> }
            },
            { name: <span className="font-weight-bold fs-13">Form Filled</span>, selector: r => r.formFilled, cell: r => <WordWrapCell>{r.formFilled ? <FaCheck color="green" size={12} title="YES" /> : <FaTimes color="red" size={12} title="NO" />}</WordWrapCell> },
            { name: <span className="font-weight-bold fs-13">Docs Uploaded</span>, selector: r => r.documentUploaded, cell: r => <WordWrapCell>{r.documentUploaded ? <FaCheck color="green" size={12} title="YES" /> : <FaTimes color="red" size={12} title="NO" />}</WordWrapCell> },
            { name: <span className="font-weight-bold fs-13">Send Mail</span>, cell: row => <BiSend style={{ cursor: isDisabled(row) ? 'not-allowed' : 'pointer', opacity: isDisabled(row) ? 0.5 : 1 }} size={20} title={isDisabled(row) ? formatActionType(row.status) : 'Send Mail'} className="text-secondary" onClick={() => { if (!isDisabled(row)) handleSendMail(row) }} /> },
            { name: <span className="font-weight-bold fs-13">Reschedule</span>, cell: row => <BiCalendarEdit style={{ cursor: isDisabled(row) ? 'not-allowed' : 'pointer', opacity: isDisabled(row) ? 0.5 : 1 }} size={20} title={isDisabled(row) ? formatActionType(row.status) : 'Reschedule Interview'} className="text-secondary" onClick={() => { if (!isDisabled(row)) { setSelectedRow(row); setFormData({ date: '', startTime: '', endTime: '' }); setFormErrors({}); setRescheduleModalOpen(true) } }} /> },
        ] : []),
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
    useEffect(() => { CheckUserAccess(userId, 'recruiter-history').then(setAccessGranted) }, [userId])

    if (accessGranted === null) return <ScreenLoader />
    if (!accessGranted) return <PermissionMissing />

    return (
        <PageContent>
            <Breadcrumbs title="HR Module" breadcrumbItem="Candidate History" />
            {isPending && <ScreenLoader />}
            <Container fluid>

                {/* ── Toolbar ── */}
                <div className="hrh-toolbar">
                    {/* Status tabs */}
                    <div className="hrh-status-tabs">
                        {["ASSIGNED", "SELECTED", "ON_HOLD", "NOT_SELECTED"].map(s => (
                            <button key={s} className={`hrh-status-tab${finalStatus === s ? " active" : ""}`}
                                onClick={() => {
                                    setFinalStatus(s);
                                    handleGetData(null, "", s)
                                }}>
                                <span className="hrh-status-dot" style={{ background: finalStatus === s ? "rgba(255,255,255,.7)" : STATUS_CONFIG[s]?.color || "#94A3B8" }} />
                                {STATUS_CONFIG[s]?.label || s}
                            </button>
                        ))}
                        {finalStatus && (
                            <button className="hrh-status-tab" style={{ color: "#EF4444", borderColor: "#FECACA" }}
                                onClick={() => { setFinalStatus(""); handleGetData(null, "", "") }}>
                                <FaTimes size={11} /> Clear
                            </button>
                        )}
                    </div>

                    {/* Right actions */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <div className="hrh-legend">
                            {Object.entries(STATUS_CONFIG).map(([k, { color, label }]) => (
                                <div key={k} className="hrh-legend-item">
                                    <span className="hrh-legend-dot" style={{ background: color }} />{label}
                                </div>
                            ))}
                        </div>
                        <div style={{ width: 1, height: 22, background: "#E2E8F0" }} />
                        <button className="hrh-btn hrh-btn-add" onClick={() => navigation('/recruiter-history/hr-recruiter-form')}>
                            <FaPlus size={11} /> Add Candidate
                        </button>
                        <button className={`hrh-btn hrh-btn-filter${showFilters ? " open" : ""}`}
                            onClick={() => setShowFilters(p => !p)}>
                            <FaFilter size={11} /> {showFilters ? "Hide" : "Filters"}
                        </button>
                    </div>
                </div>

                {/* ── Candidate type tabs (Self / Transferred) ── */}
                <div className="hrh-type-tabs">
                    {["self", "transferred"].map(type => (
                        <button key={type} className={`hrh-type-tab${candidateStatus === type ? " active" : ""}`}
                            onClick={() => setCandidateStatus(type)}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                {/* ── Filter panel ── */}
                {showFilters && (
                    <div className="hrh-filter-panel">
                        <div className="hrh-filter-title">
                            <FaFilter size={10} /> Search Filters
                        </div>
                        <form onSubmit={e => handleGetData(e, "page", finalStatus)}>
                            <Row className="g-3">
                                {[
                                    { id: "name", label: "Name", ph: "Search by name", type: "text" },
                                    { id: "email", label: "Email", ph: "Search by email", type: "text" },
                                    { id: "phone", label: "Phone", ph: "Search by phone", type: "text" },
                                    { id: "dateOfInterview", label: "Interview Date", type: "date" },
                                    { id: "fromDate", label: "Start Date", type: "date" },
                                    { id: "toDate", label: "End Date", type: "date" },
                                    { id: "doj", label: "Date of Joining", type: "date" },
                                ].map(({ id, label, ph, type }) => (
                                    <Col key={id} sm={12} md={3}>
                                        <label className="hrh-filter-label">{label}</label>
                                        <input type={type || "text"} className="hrh-filter-input"
                                            placeholder={ph} value={filters[id]}
                                            onChange={e => handleFilterInputChange(id, e.target.value)} />
                                    </Col>
                                ))}
                                {[
                                    { id: "location", label: "Location", opts: locationOptions },
                                    { id: "status", label: "Status", opts: statusOptions },
                                    { id: "department", label: "Department", opts: departmentList?.data?.data || [] },
                                    { id: "source", label: "Source", opts: sourceOptions || [] },
                                ].map(({ id, label, opts }) => (
                                    <Col key={id} sm={12} md={3}>
                                        <label className="hrh-filter-label">{label}</label>
                                        <Select options={opts} value={filters[id]} isClearable
                                            onChange={val => setF(id, val)}
                                            menuPortalTarget={document.body} styles={SELECT_STYLES} />
                                    </Col>
                                ))}
                                <Col sm={12} md={3} className="d-flex align-items-end gap-2">
                                    <button type="submit" className="hrh-btn hrh-btn-primary">
                                        <FaFilter size={11} /> Search
                                    </button>
                                    <button type="button" className="hrh-btn hrh-btn-secondary" onClick={handleClearFilters}>
                                        <FaTimes size={11} /> Clear
                                    </button>
                                </Col>
                            </Row>
                        </form>
                    </div>
                )}

                {/* ── Note ── */}
                {candidateStatus === 'self' && (
                    <div className="hrh-note">
                        <span style={{ color: defaultTheme.btnEnable, fontWeight: 800 }}>●</span>
                        Candidates in blue are transferred candidates
                    </div>
                )}

                <AppTable
                    progressPending={isPending}
                    columns={columns}
                    data={data?.content}
                    pagination paginationServer
                    paginationTotalRows={data?.totalElements}
                    onChangePage={setPage}
                    paginationDefaultPage={page}
                    key={`hr-recruiter-${page}`}
                    rowAttributes={(row) => ({ 'data-row-id': row.id })}
                    conditionalRowStyles={[
                        { when: r => r.status === 'REJECTED' || r.finalStatusEnum === 'Reject', style: { color: defaultTheme.redColor } },
                        { when: r => r.status === 'HIRED', style: { color: defaultTheme.goldColorLogo } },
                        { when: r => r.transferAt && candidateStatus === 'self', style: { color: defaultTheme.btnEnable } },
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
                                    onChange={e => handleInputChange(id, e.target.value)} invalid={!!formErrors[id]} />
                                {formErrors[id] && <FormFeedback>{formErrors[id]}</FormFeedback>}
                            </FormGroup>
                        ))}
                    </ModalBody>
                    <ModalFooter>
                        <button className="hrh-btn hrh-btn-primary" onClick={handleReschedule}>Reschedule</button>
                        <button className="hrh-btn hrh-btn-secondary" onClick={() => setRescheduleModalOpen(false)} style={{ backgroundColor: defaultTheme.goldColorLogo }}>Cancel</button>
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