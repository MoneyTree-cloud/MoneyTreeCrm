/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Col, Container, FormGroup, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import { ALL_CANDIDATE_HISTORY, GET_MESSAGE_COUNT, HR_LINK_SAP, SEND_MAIL_CANDIDATE_DOCUMENT_SUBMIT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import ApiClient from "../../helpers/api_helper";
import { FaArrowAltCircleRight, FaCheck, FaLink, FaTimes, FaFilter } from "react-icons/fa";
import PageContent from "../../components/Common/PageContent";
import { formatActionType, formatDate, WordWrapCell } from "../../helpers/function_helper";
import { BiSend } from "react-icons/bi";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";
import Select from 'react-select';
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import ChatModal from "../../constants/ChatModal";
import { MdChat } from "react-icons/md";

// ── Styles ─────────────────────────────────────────────────────────────────────
if (document.getElementById("cd-s")) document.getElementById("cd-s").remove()
const _s = document.createElement("style")
_s.id = "cd-s"
_s.textContent = `
    .cd-toolbar { display:flex; align-items:center; justify-content:flex-end; gap:8px; margin-bottom:14px; background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:10px 16px; box-shadow:0 1px 4px rgba(0,0,0,.04); }

    .cd-filter-panel { background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:16px 20px; margin-bottom:14px; box-shadow:0 1px 4px rgba(0,0,0,.04); }
    .cd-filter-title { font-size:10px; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:.8px; margin-bottom:12px; display:flex; align-items:center; gap:6px; }
    .cd-filter-label { font-size:11px; font-weight:600; color:#475569; margin-bottom:4px; display:block; }
    .cd-filter-input { width:100%; height:38px; padding:0 11px; border:1.5px solid #080808; border-radius:8px; font-size:13px; color:#0F172A; outline:none; transition:border-color .15s; background:#fff; }
    .cd-filter-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }

    .cd-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 18px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; border:none; transition:all .15s; white-space:nowrap; }
    .cd-btn-primary  { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; }
    .cd-btn-primary:hover { opacity:.88; }
    .cd-btn-secondary { background:#F1F5F9; color:#475569; border:1.5px solid #E2E8F0; }
    .cd-btn-secondary:hover { background:#E2E8F0; }
    .cd-btn-filter { border:1.5px solid #005B52; }
    .cd-btn-filter.open { background:#005B52; color:#fff; }

    /* modal input */
    .cd-minput { width:100%; height:40px; padding:0 12px; border:1.5px solid #374151; border-radius:9px; font-size:13px; outline:none; transition:border-color .15s; }
    .cd-minput:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }
    .cd-mlabel { font-size:11px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:.4px; margin-bottom:5px; display:block; }
`
document.head.appendChild(_s)

const SELECT_STYLES = {
    control: (b, st) => ({ ...b, minHeight: 38, fontSize: 13, border: `1.5px solid ${st.isFocused ? "#005B52" : "#0b0b0b"}`, borderRadius: 8, boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.08)" : "none" }),
    option: (b, st) => ({ ...b, fontSize: 13, background: st.isSelected ? "#005B52" : st.isFocused ? "#090909" : "#fff", color: st.isSelected ? "#fff" : "#0F172A" }),
    menuPortal: b => ({ ...b, zIndex: 9999 }),
}

const trialStatusOptions = [
    { value: 'Started', label: 'Started' },
    { value: 'On_Boarded', label: 'On Boarded' },
    { value: 'Terminated', label: 'Terminated' },
    { value: 'Absconded', label: 'Absconded' },
]

export default function CandidateDocs() {
    const navigation = useNavigate()
    const location = useLocation()
    const LIMIT = 100
    const [page, setPage] = useState(1)
    const [isPending, setIsPending] = useState(false)
    const [data, setData] = useState([])
    const [selectedRow, setSelectedRow] = useState(null)
    const [flag, setFlag] = useState(false)
    const [confirmMLinkModalOpen, setConfirmMLinkodalOpen] = useState(false)
    const [linkEmpCode, setLinkEmpCode] = useState('')
    const [linkSalaryAmount, setLinkSalaryAmount] = useState('')
    const [accessGranted, setAccessGranted] = useState(null)
    const [showFilters, setShowFilters] = useState(false)
    const { userId } = useUserStore(s => s.user)
    const [highlightRowId, setHighlightRowId] = useState(null);

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

    const [filters, setFilters] = useState({ name: '', teamName: '', trialStatus: null, empCode: '', doj: '' })
    const setF = (field, value) => setFilters(p => ({ ...p, [field]: value }))

    useEffect(() => {
        if (location.state?.filters) setFilters(p => ({ ...p, ...location.state.filters }))
        if (location.state?.page) setPage(location.state.page)
        if (location.state?.showFilters) setShowFilters(location.state.showFilters)
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

    useEffect(() => { if (!flag) return; handleGetData() }, [page, flag])

    const handleGetData = (e, key) => {
        if (e) e.preventDefault()
        setIsPending(true)
        const q = []
        if (key !== 'restart') {
            if (filters.name) q.push(`name=${encodeURIComponent(filters.name)}`)
            if (filters.teamName) q.push(`teamName=${encodeURIComponent(filters.teamName)}`)
            if (filters.trialStatus) q.push(`trialStatus=${encodeURIComponent(filters.trialStatus)}`)
            if (filters.empCode) q.push(`empCode=${encodeURIComponent(filters.empCode)}`)
            if (filters.doj) q.push(`doj=${encodeURIComponent(filters.doj)}`)
        }
        const qs = q.length ? `&${q.join('&')}` : ''
        ApiClient.get(`${ALL_CANDIDATE_HISTORY}offset=${key === 'page' ? 0 : page - 1}&limit=${LIMIT}&status=HIRED${qs}`)
            .then(res => {
                setIsPending(false)
                if (res?.data?.status === 1) {
                    decryptData(res.data.data).then(d => setData(d)).catch(() => setData([]))
                } else if (res?.data?.message !== 'No record found.') {
                    toast.error(res.data.message); setData([])
                } else setData([])
            })
            .catch(err => { setIsPending(false); toast.error(err.message); setData([]) })
    }

    const handleClearFilters = () => {
        const hasAny = Object.values(filters).some(Boolean)
        if (hasAny) { setFilters({ name: '', teamName: '', trialStatus: null, empCode: '', doj: '' }); handleGetData(null, 'restart'); setPage(1) }
    }

    const handleSendMail = row => {
        if (!window.confirm("Send docs mail to this candidate?")) return
        setIsPending(true)
        ApiClient.post(`${SEND_MAIL_CANDIDATE_DOCUMENT_SUBMIT}candidateId=${row.id}&userId=${userId}`)
            .then(res => { setIsPending(false); res?.data?.status === 1 ? toast.success(res.data.message) : toast.error(res.data.message) })
            .catch(err => { setIsPending(false); toast.error(err.message) })
    }

    const handleEmpCodeSubmit = () => {
        if (!/^\d{4}$/.test(linkEmpCode)) { toast.error('Enter a valid 4-digit employee code'); return }
        if (!linkSalaryAmount) { toast.error('Enter final salary/contractual amount'); return }
        if (!window.confirm(`Link ${selectedRow.firstName} to SAP with emp code ${linkEmpCode} and amount ${linkSalaryAmount}?`)) return
        setIsPending(true)
        ApiClient.post(`${HR_LINK_SAP}candidateId=${selectedRow.id}&userId=${userId}&empCode=${linkEmpCode}&salary=${linkSalaryAmount}`)
            .then(res => {
                setIsPending(false)
                if (res?.data?.status === 1) { toast.success(res.data.message); setConfirmMLinkodalOpen(false); setLinkEmpCode(''); setLinkSalaryAmount(''); handleGetData(null) }
                else toast.error(res.data.message)
            })
            .catch(err => { setIsPending(false); toast.error(err.message) })
    }

    useEffect(() => { CheckUserAccess(userId, 'candidate-docs').then(setAccessGranted) }, [userId])

    const columns = [
        { name: <span className="font-weight-bold fs-13">SL No.</span>, width: "4%", cell: (_, i) => <WordWrapCell>{(page - 1) * LIMIT + i + 1}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Candidate ID</span>, sortable: true, selector: r => r.id, cell: r => <WordWrapCell>{r.id}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Show More</span>, width: "8%",
            cell: row => <FaArrowAltCircleRight title="Show Details" onClick={() => navigation("/candidate-docs/candidate-docs-details", { state: { rowData: row, filters, page, showFilters, highlightRowId: row.id, } })} cursor="pointer" color={defaultTheme.primary} size={16} />
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
        { name: <span className="font-weight-bold fs-13">Created By</span>, sortable: true, selector: r => r.status, cell: r => <WordWrapCell>{formatActionType(r.createdByName + ' (' + r.createdByCode + ')')}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">DOJ</span>, sortable: true, selector: r => r?.handovers[r?.handovers?.length - 1]?.doj, cell: r => <WordWrapCell>{formatDate(r?.handovers[r?.handovers?.length - 1]?.doj)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Candidate Name</span>, sortable: true, selector: r => r.firstName, cell: r => <WordWrapCell>{r.firstName}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Team</span>, sortable: true, selector: r => r.status,
            cell: r => { const h = r.handovers?.[r.handovers.length - 1]; return <WordWrapCell>{h?.mainTeam && h?.subTeam ? `${h.mainTeam}/${h.subTeam}` : '—'}</WordWrapCell> }
        },
        { name: <span className="font-weight-bold fs-13">Location</span>, sortable: true, selector: r => r.finalLocation, cell: r => <WordWrapCell>{r.finalLocation || '—'}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">TP Status</span>, sortable: true, selector: r => r?.candidateTrial?.trialStatus,
            cell: r => <div className="phone-container"><WordWrapCell>{formatActionType(r?.candidateTrial?.trialStatus) || '—'}<span className="phone-number">{r?.candidateTrial?.trialStatus ? formatDate(r?.candidateTrial?.startDate) + ' To ' + formatDate(r?.candidateTrial?.endDate) : '—'}</span></WordWrapCell></div>
        },
        { name: <span className="font-weight-bold fs-13">Docs Uploaded</span>, selector: r => r.documentUploaded, cell: r => <WordWrapCell>{r.documentUploaded ? <FaCheck color="green" size={12} title="YES" /> : <FaTimes color="red" size={12} title="NO" />}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Offer Letter Sent</span>, selector: r => r.offerLetterSent, cell: r => <WordWrapCell>{r.offerLetterSent ? <FaCheck color="green" size={12} title="YES" /> : <FaTimes color="red" size={12} title="NO" />}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Send Docs Mail</span>,
            cell: row => <BiSend style={{ cursor: row.documentUploaded ? 'not-allowed' : 'pointer', opacity: row.documentUploaded ? 0.5 : 1 }} size={20} title={row.documentUploaded ? 'Docs Uploaded' : 'Send Docs Mail'} className="text-secondary" onClick={() => { if (!row.documentUploaded) handleSendMail(row) }} />
        },
        {
            name: <span className="font-weight-bold fs-13">Link Candidate</span>,
            cell: row => row.empCode ? <WordWrapCell>{row.empCode}</WordWrapCell> : <FaLink cursor="pointer" size={18} title="Link Candidate" className="text-secondary" onClick={() => { setSelectedRow(row); setLinkEmpCode(''); setConfirmMLinkodalOpen(true) }} />
        },
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
            <Breadcrumbs title="HR Module" breadcrumbItem="Candidate Docs" />
            {isPending && <ScreenLoader />}
            <Container fluid>

                {/* ── Toolbar ── */}
                <div className="cd-toolbar">
                    <button className={`cd-btn cd-btn-filter${showFilters ? " open" : ""}`}
                        onClick={() => setShowFilters(p => !p)}>
                        <FaFilter size={11} /> {showFilters ? "Hide Filters" : "Filters"}
                    </button>
                </div>

                {/* ── Filter panel ── */}
                {showFilters && (
                    <div className="cd-filter-panel">
                        <div className="cd-filter-title"><FaFilter size={9} /> Search Filters</div>
                        <form onSubmit={e => handleGetData(e, 'page')}>
                            <Row className="g-2">
                                {[
                                    { id: "name", label: "Name", ph: "Search by name" },
                                    { id: "teamName", label: "Team Name", ph: "Team name…" },
                                    { id: "empCode", label: "Emp Code", ph: "Emp code…" },
                                ].map(({ id, label, ph }) => (
                                    <Col key={id} sm={12} md={2}>
                                        <label className="cd-filter-label">{label}</label>
                                        <input className="cd-filter-input" type="text" placeholder={ph}
                                            value={filters[id]} onChange={e => setF(id, e.target.value)} />
                                    </Col>
                                ))}
                                <Col sm={12} md={2}>
                                    <label className="cd-filter-label">DOJ</label>
                                    <input className="cd-filter-input" type="date" value={filters.doj}
                                        onChange={e => setF('doj', e.target.value)} />
                                </Col>
                                <Col sm={12} md={2}>
                                    <label className="cd-filter-label">Trial Status</label>
                                    <Select options={trialStatusOptions} isClearable menuPortalTarget={document.body}
                                        styles={SELECT_STYLES}
                                        value={trialStatusOptions.find(o => o.value === filters.trialStatus) || null}
                                        onChange={opt => setF('trialStatus', opt?.value || '')} />
                                </Col>
                                <Col sm={12} md={2} className="d-flex align-items-end gap-2">
                                    <button type="submit" className="cd-btn cd-btn-primary">
                                        <FaFilter size={11} /> Search
                                    </button>
                                    <button type="button" className="cd-btn cd-btn-secondary" onClick={handleClearFilters}>
                                        <FaTimes size={11} /> Clear
                                    </button>
                                </Col>
                            </Row>
                        </form>
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
                    key={`candidate=docs-${page}`}
                    conditionalRowStyles={[{
                        when: r => ['Absconded', 'Terminated'].includes(r?.candidateTrial?.trialStatus),
                        style: { color: defaultTheme.redColor },
                    },
                    {
                        when: r => r.id === highlightRowId,
                        style: {
                            backgroundColor: '#FEF3C7',           // soft amber background
                            borderLeft: `4px solid ${defaultTheme.goldColorLogo}`,
                            animation: 'hrh-pulse 1.2s ease-in-out 2',
                            transition: 'background-color 0.4s ease',
                            fontWeight: 600,
                        },
                    },]}
                />

                {/* ── Link SAP Modal ── */}
                <Modal isOpen={confirmMLinkModalOpen} toggle={() => setConfirmMLinkodalOpen(p => !p)}>
                    <ModalHeader toggle={() => setConfirmMLinkodalOpen(false)}
                        style={{ background: "linear-gradient(135deg,#005B52,#007A6E)", borderRadius: "8px 8px 0 0" }}>
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>🔗 Link Candidate to SAP</span>
                    </ModalHeader>
                    <ModalBody style={{ padding: "20px 24px" }}>
                        <FormGroup>
                            <label className="cd-mlabel">Employee Code</label>
                            <input className="cd-minput" type="text" value={linkEmpCode} placeholder="e.g. 1234"
                                onChange={e => { const v = e.target.value; if (v === '' || /^[0-9]{0,4}$/.test(v)) setLinkEmpCode(v) }} />
                        </FormGroup>
                        <FormGroup style={{ marginBottom: 0 }}>
                            <label className="cd-mlabel">Final Salary / Contractual Amount</label>
                            <input className="cd-minput" type="text" value={linkSalaryAmount} placeholder="Enter amount"
                                onChange={e => { const v = e.target.value; if (v === '' || /^[0-9]*$/.test(v)) setLinkSalaryAmount(v) }} />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter style={{ borderTop: "1px solid #F1F5F9" }}>
                        <button className="cd-btn cd-btn-primary" onClick={handleEmpCodeSubmit}>Submit</button>
                        <button className="cd-btn cd-btn-secondary" onClick={() => setConfirmMLinkodalOpen(false)} style={{ backgroundColor: defaultTheme.goldColorLogo }}>Cancel</button>
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