import { useState, useEffect, useCallback } from 'react'
import PageContent from '../../components/Common/PageContent'
import Breadcrumbs from '../../components/Common/Breadcrumb'
import { Container } from 'reactstrap'
import AppTable from '../../components/Common/Table'
import { formatActionType, formatDate, formatDateTime, getDuration, WordWrapCell } from '../../helpers/function_helper'
import ApiClient from '../../helpers/api_helper'
import { toast } from 'react-toastify'
import ScreenLoader from '../../constants/ScreenLoader'
import { MdLocationOn, MdPhone, MdEmail, MdClose, MdMobileFriendly, MdLink, MdSource, MdDelete } from 'react-icons/md'
import { FaUserCircle, FaUserCheck, FaUserAlt, FaClock } from 'react-icons/fa'
import { GET_ALL_PPC_LEADS, GET_PROSPECT_MEETING_DETAILS, GET_GROUP_MEMBERS, UPDATE_PPC_LEADS, CREATE_SUSPECT, GET_STATUS_LEADS, DELETE_PPC_LEAD } from '../../helpers/url_helper'
import { defaultTheme } from '../../helpers/defaultTheme'
import CheckUserAccess from '../../components/Common/CheckUserAccess'
import { useUserStore } from '../../store/useUserStore'
import PermissionMissing from '../Utility/PermissonMissing'
import Select from 'react-select'
import { useGet } from '../../Hooks/useApi'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap'
import { decryptData } from '../../components/Common/CryptoUtils'
import "../CSS/styles.css";
import { getStatusBadge } from '../../constants/global'

// ── Styles ─────────────────────────────────────────────────────────────────────
if (document.getElementById("imd-s")) document.getElementById("imd-s").remove()
const _s = document.createElement("style")
_s.id = "imd-s"
_s.textContent = `
    .imd-hdr { background:linear-gradient(135deg,#005B52 0%,#007A6E 60%,#00897B 100%); border-radius:16px; padding:20px 26px; margin-bottom:16px; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
    .imd-hdr::before { content:''; position:absolute; top:-40px; right:-40px; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,.05); pointer-events:none; }
    .imd-hdr::after  { content:''; position:absolute; bottom:-50px; left:60px; width:140px; height:140px; border-radius:50%; background:rgba(255,255,255,.04); pointer-events:none; }
    .imd-hdr-title { font-size:20px; font-weight:800; color:#fff; display:flex; align-items:center; gap:10px; position:relative; }
    .imd-hdr-sub { font-size:12px; color:rgba(255,255,255,.65); margin-top:3px; position:relative; }
    .imd-hdr-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.25); border-radius:20px; font-size:12px; font-weight:700; color:#fff; position:relative; }

    .imd-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:10px 16px; margin-bottom:14px; box-shadow:0 1px 4px rgba(0,0,0,.04); }
    .imd-search-wrap { display:flex; align-items:center; gap:8px; flex:1; min-width:200px; position:relative; }
    .imd-search-input { height:38px; padding:0 12px 0 34px; border:1.5px solid #080808; border-radius:8px; font-size:13px; color:#0F172A; outline:none; flex:1; transition:border-color .15s; background:#fff; }
    .imd-search-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }
    .imd-search-icon { position:absolute; left:10px; right:10px; color:#94A3B8; pointer-events:none; }
    .imd-clear-btn { display:inline-flex; align-items:center; gap:5px; padding:7px 14px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; border:1.5px solid #E2E8F0; background:#F8FAFC; color:#64748B; transition:all .15s; }
    .imd-clear-btn:hover { background:#E2E8F0; }

    .imd-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:14px; margin-bottom:16px; }
    @media(max-width:700px){ .imd-grid { grid-template-columns:1fr; } }

    .imd-card { background:#fff; border:1px solid #E2E8F0; border-radius:14px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.04); transition:all .2s; }
    .imd-card:hover { border-color:#007A6E; box-shadow:0 4px 16px rgba(0,91,82,.1); transform:translateY(-2px); }
    .imd-card-hdr { background:linear-gradient(135deg,#F0FDF9,#E6FAF5); padding:14px 16px; display:flex; align-items:center; gap:12px; border-bottom:1px solid #E2E8F0; }
    .imd-card-avatar { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#005B52,#007A6E); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .imd-card-name { font-size:14px; font-weight:800; color:#0F172A; }
    .imd-card-body { padding:14px 16px; display:flex; flex-direction:column; gap:8px; }
    .imd-card-row { display:flex; align-items:center; gap:8px; font-size:12px; color:#374151; }
    .imd-card-row-icon { color:#005B52; flex-shrink:0; }
    .imd-card-row-label { color:#94A3B8; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.4px; min-width:70px; }
    .imd-card-row-val { font-size:12px; font-weight:600; color:#0F172A; word-break:break-word; }
    .imd-card-footer { padding:10px 16px; border-top:1px solid #F1F5F9; display:flex; gap:8px; flex-wrap:wrap; }
    .imd-chip { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; }
    .imd-chip-green  { background:#F0FDF4; color:#166534; border:1px solid #BBF7D0; }
    .imd-chip-blue   { background:#EFF6FF; color:#1E40AF; border:1px solid #BFDBFE; }
    .imd-chip-gold   { background:#FFFBEB; color:#92400E; border:1px solid #FDE68A; }
    .imd-chip-purple { background:#F5F3FF; color:#5B21B6; border:1px solid #DDD6FE; }

    .imd-view-toggle { display:flex; gap:4px; }
    .imd-view-btn { width:34px; height:34px; border-radius:8px; border:1.5px solid #E2E8F0; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; }
    .imd-view-btn.active { background:#005B52; border-color:#005B52; color:#fff; }

    .imd-empty { text-align:center; padding:50px 20px; color:#94A3B8; }
    .imd-empty-icon { font-size:48px; margin-bottom:12px; opacity:.5; }

    @media(max-width:600px){
        .imd-hdr { padding:14px 16px; }
        .imd-hdr-title { font-size:17px; }
        .imd-toolbar { flex-direction:column; align-items:stretch; }
    }
`
document.head.appendChild(_s)

const SEL_STYLES = {
    control: (b, st) => ({ ...b, minHeight: 38, fontSize: 13, border: `1.5px solid ${st.isFocused ? "#005B52" : "#374151"}`, borderRadius: 8, boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.08)" : "none" }),
    option: (b, st) => ({ ...b, fontSize: 13, background: st.isSelected ? "#005B52" : st.isFocused ? "#f0fdf9" : "#fff", color: st.isSelected ? "#fff" : "#0F172A" }),
    placeholder: b => ({ ...b, color: "#9CA3AF", fontSize: 13 }),
    menuPortal: b => ({ ...b, zIndex: 9999 }),
}

export default function PPCLeads() {
    const [data, setData] = useState([])
    const [pending, setPending] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [view, setView] = useState("grid")
    const { userId } = useUserStore(s => s.user)
    const [accessGranted, setAccessGranted] = useState(null)
    const [selectedUsers, setSelectedUsers] = useState({})
    const [selectedRow, setSelectedRow] = useState(null)
    const [verifyModal, setVerifyModal] = useState(false)
    const [reportType, setReportType] = useState("Prospects")
    const [prospectData, setProspectData] = useState([])
    const [meetingData, setMeetingData] = useState([])
    const [suspectData, setSuspectData] = useState([])
    const [leadStatuses, setLeadStatuses] = useState({})

    const toggleVerifyModal = () => {
        setVerifyModal(!verifyModal)
        if (selectedRow) setSelectedRow(null)
    }

    const { data: usersList } = useGet(GET_GROUP_MEMBERS + '18')

    const fetchLeadStatus = async (mobile, empCode) => {
        try {
            const res = await ApiClient.get(
                `${GET_STATUS_LEADS}?mobile=${mobile}&empCode=${empCode}&projectCategory=Website`
            )

            if (res?.data?.status === 1) {
                return res.data.data
            }

            return null
        } catch (err) {
            console.error(err)
            return null
        }
    }

    useEffect(() => {
        const loadStatuses = async () => {
            if (!data?.length) return

            const statusMap = {}

            await Promise.all(
                data?.map(async (item) => {
                    if (item.mobileNumber && item.assignedToCode) {
                        const status = await fetchLeadStatus(
                            item.mobileNumber,
                            item.assignedToCode
                        )

                        statusMap[item.id] = status
                    }
                })
            )

            setLeadStatuses(statusMap)
        }

        loadStatuses()
    }, [data])

    const userOptions = (usersList?.data?.data || []).map(item => ({
        label: `${item.memberName}`,
        value: item.empCode,
        userId: item.userId
    }))

    const fetchData = useCallback(() => {
        setPending(true)
        ApiClient.get(GET_ALL_PPC_LEADS)
            .then(res => {
                setPending(false)
                if (res?.data?.status === 1) {
                    const raw = res.data.data
                    setData(raw)
                } else {
                    toast.error(res.data.message)
                }
            })
            .catch(err => { setPending(false); toast.error(err.message) })
    }, [])

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'ppc-leads')
            setAccessGranted(hasAccess)
            if (hasAccess) fetchData()
        }
        checkAccess()
    }, [fetchData, userId])

    const handleVerifyClick = (row) => {
        setSelectedRow(row)
        setVerifyModal(true)
    }

    const handleUserChange = (rowId, selectedOption) => {
        setSelectedUsers(prev => ({ ...prev, [rowId]: selectedOption }))
    }

    // ── Updated handleAssign — uses new field names + new URL structure ──
    const handleAssign = async (row) => {
        const selected = selectedUsers[row.id]
        if (!selected) { toast.error("Please select a user"); return }
        const confirm = window.confirm("Are you sure you want to assign this user?")
        if (!confirm) return

        setPending(true)

        const params = new URLSearchParams({
            name: row.name || '',
            email: row.email || '',
            mobileNumber: row.mobileNumber || '',
            websiteUrl: row.websiteUrl || '',
            location: row.location || '',
            source: row.source || '',
            assignedToName: selected.label,
            assignedToCode: selected.value,
        }).toString()

        const urlWithParams = `${UPDATE_PPC_LEADS}/${row.id}?${params}`

        ApiClient.put(urlWithParams)
            .then(res => {
                if (res?.data?.status === 1) {
                    const request = {
                        leadName: row.name,
                        leadMobile: row.mobileNumber,
                        remark: "N/A",
                        project: row.websiteUrl || "N/A",
                        projectCategory: "Website",
                    }
                    ApiClient.post(`${CREATE_SUSPECT}${selected.userId}`, request)
                        .then(response => {
                            setPending(false)
                            if (response?.data?.status === 1) {
                                toast.success('Assigned Successfully')
                                fetchData()
                                setSelectedUsers(prev => ({ ...prev, [row.id]: null }))
                            } else {
                                toast.error(response.data.message)
                            }
                        })
                        .catch(err => { setPending(false); toast.error(err.message) })
                } else {
                    toast.error(res.data.message)
                    setPending(false)
                }
            })
            .catch(err => { setPending(false); toast.error(err.message) })
    }

    const fetchVerifyData = async (row, typeValue) => {
        if (!row) return
        setPending(true)
        const type = typeValue === "Prospects" ? "0" : typeValue === "Suspects" ? "2" : "1"
        try {
            const res = await ApiClient.post(
                `${GET_PROSPECT_MEETING_DETAILS}${row.mobileNumber}&type=${type}`
            )
            if (res?.data?.status === 1) {
                const decrypted = await decryptData(res.data.data)
                if (typeValue === "Prospects") setProspectData(decrypted)
                else if (typeValue === "Meeting") setMeetingData(decrypted)
                else setSuspectData(decrypted)
            } else {
                setProspectData([]); setMeetingData([]); setSuspectData([])
                toast.error("No Data Found With this number...")
            }
        } catch (err) {
            setProspectData([]); setMeetingData([]); setSuspectData([])
            toast.error(err.message)
        } finally {
            setPending(false)
        }
    }

    useEffect(() => {
        if (verifyModal && selectedRow) fetchVerifyData(selectedRow, reportType)
    }, [reportType, verifyModal, selectedRow])

    // ── Filter — updated field names ──
    const filtered = data?.filter(r => {
        const matchesSearch =
            !searchTerm ||
            r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.mobileNumber?.includes(searchTerm) ||
            r.websiteUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.source?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
    })

    const handleDeleteClick = (row) => {
        if (!window.confirm("Are you sure you want to delete this?")) return;
        setPending(true);
        ApiClient.post(`${DELETE_PPC_LEAD}${row.id}`)
            .then(function (response) {
                setPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    fetchData();
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setPending(false);
                toast.error(error.message);
            });
    };

    // ── Table columns — updated field names ──
    const columns = [
        { name: <span className="font-weight-bold fs-13">#</span>, width: "4%", cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Verify</span>,
            cell: r => (
                <button
                    onClick={() => handleVerifyClick(r)}
                    style={{ padding: "6px 12px", background: "#0d6efd", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                    Verify
                </button>
            )
        },
        {
            name: <span className="font-weight-bold fs-13">Lead Status</span>,
            width: '10%',
            cell: row => <WordWrapCell> {getStatusBadge(leadStatuses[row.id])}</WordWrapCell>,
            sortable: true
        },
        { name: <span className="font-weight-bold fs-13">Customer</span>, selector: r => r.name, sortable: true, cell: r => <WordWrapCell>{r.name}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Mobile No.</span>, cell: r => <div className="phone-container"><MdMobileFriendly className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{r.mobileNumber}</span></div> },
        { name: <span className="font-weight-bold fs-13">Email</span>, cell: r => <div className="phone-container"><MdEmail className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{r.email}</span></div> },
        { name: <span className="font-weight-bold fs-13">Location</span>, selector: r => r.location, sortable: true, cell: r => <WordWrapCell>{r.location || '—'}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Source</span>, selector: r => r.source, sortable: true, cell: r => <WordWrapCell>{r.source || '—'}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Website URL</span>, selector: r => r.websiteUrl, sortable: true, cell: r => <WordWrapCell><a href={r.websiteUrl} target="_blank" rel="noreferrer" style={{ color: "#005B52", fontSize: 12 }}>{r.websiteUrl || '—'}</a></WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Created At</span>, selector: r => r.createdDate, sortable: true, cell: r => <WordWrapCell>{formatDateTime(r.createdDate)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Assigned At</span>, selector: r => r.assignedDate, sortable: true, cell: r => <WordWrapCell>{formatDateTime(r.assignedDate)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Assign Duration</span>, cell: r => <WordWrapCell>{getDuration(r.createdDate, r.assignedDate)}</WordWrapCell> },

        { name: <span className="font-weight-bold fs-13">Assigned To</span>, selector: r => r.assignedToName, sortable: true, cell: r => <WordWrapCell>{r.assignedToCode ? `${r.assignedToName} (${r.assignedToCode})` : '—'}</WordWrapCell> },
        {
            name: "Assign User",
            width: "280px",
            cell: row => (
                <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                    <div style={{ flex: 1 }}>
                        <Select
                            options={userOptions || []}
                            value={selectedUsers[row.id] || null}
                            onChange={opt => handleUserChange(row.id, opt)}
                            placeholder="Select user"
                            isClearable
                            styles={SEL_STYLES}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>
                    <button
                        disabled={!selectedUsers[row.id]}
                        onClick={() => handleAssign(row)}
                        title="Assign"
                        style={{
                            height: 40, width: 40, display: "flex", alignItems: "center", justifyContent: "center",
                            background: selectedUsers[row.id] ? "#005B52" : "#CBD5E1",
                            color: "#fff", border: "none", borderRadius: 8,
                            cursor: selectedUsers[row.id] ? "pointer" : "not-allowed", transition: "all 0.2s ease"
                        }}
                    >
                        <FaUserCheck size={20} />
                    </button>
                </div>
            )
        },
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            cell: (row) => (
                <MdDelete
                    title="Delete Record"
                    onClick={() => handleDeleteClick(row)}
                    style={{ cursor: "pointer", color: "red" }}
                    size={20}
                />
            ),
        },
    ]

    // ── Verify modal columns (unchanged) ──
    const columnsProspect = [
        { name: <span className="font-weight-bold fs-13">#</span>, selector: (_, i) => i + 1, width: "8%" },
        { name: <span className="font-weight-bold fs-13">Associate</span>, selector: r => r.associateName, sortable: true, cell: r => <WordWrapCell>{r.associateName + " (" + r.associateId + ")"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">MT/ST</span>, selector: r => r.mainTeam, sortable: true, cell: r => <WordWrapCell>{r.mainTeam + '/' + r.subTeam}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Client Name</span>, selector: r => r.clientName, sortable: true, cell: r => <WordWrapCell>{r.clientName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Created Date</span>, selector: r => r.createdDate, sortable: true, cell: r => <WordWrapCell>{formatDate(r.createdDate)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Type</span>, selector: r => r.typeName, sortable: true, cell: r => <WordWrapCell>{r.typeName}</WordWrapCell> },
    ]

    const columnsMeet = [
        { name: <span className="font-weight-bold fs-13">#</span>, selector: (_, i) => i + 1, width: "6%" },
        { name: <span className="font-weight-bold fs-13">Associate</span>, selector: r => r.associateId, sortable: true, cell: r => <WordWrapCell>{r.loginUserName + " (" + r.associateId + ")"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">MT/ST</span>, selector: r => r.mainTeam, sortable: true, cell: r => <WordWrapCell>{r.mainTeam + '/' + r.subTeam}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Client Name</span>, selector: r => r.clientName, sortable: true, cell: r => <WordWrapCell>{r.clientName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Meeting Start Date</span>, selector: r => r.meetingStartAt, sortable: true, cell: r => <WordWrapCell>{formatDateTime(r.meetingStartAt)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Meeting End Date</span>, selector: r => r.meetingEndAt, sortable: true, cell: r => <WordWrapCell>{formatDateTime(r.meetingEndAt)}</WordWrapCell> },
    ]

    const columnsSuspect = [
        { name: <span className="font-weight-bold fs-13">#</span>, selector: (_, i) => i + 1, width: "6%" },
        { name: <span className="font-weight-bold fs-13">Associate Details</span>, selector: r => r.associateId, sortable: true, cell: r => <WordWrapCell>{r.associateName + " (" + r.associateId + ")"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Created At</span>, selector: r => r.createdDate, sortable: true, cell: r => <WordWrapCell>{formatDateTime(r.createdDate)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">MT/ST</span>, selector: r => r.mainTeam, sortable: true, cell: r => <WordWrapCell>{r.mainTeam + '/' + r.subTeam}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Client Name</span>, selector: r => r.clientName, sortable: true, cell: r => <WordWrapCell>{r.clientName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Status</span>, selector: r => r.status, sortable: true, cell: r => <WordWrapCell>{formatActionType(r.status)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Suspect Type</span>, selector: r => r.suspectType, sortable: true, cell: r => <WordWrapCell>{formatActionType(r.suspectType)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Status Update Date</span>, selector: r => r.statusUpdateDate, sortable: true, cell: r => <WordWrapCell>{formatDateTime(r.statusUpdateDate)}</WordWrapCell> },
    ]

    const handleRadioChange = (e) => setReportType(e.target.value)

    if (accessGranted === null) return <ScreenLoader />
    if (!accessGranted) return <PermissionMissing />

    // ── AssignFooter — shared between grid card + table ──
    const AssignFooter = ({ row }) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderTop: "1px solid #eee" }}>
            <div style={{ flex: 1 }}>
                <Select
                    options={userOptions || []}
                    value={selectedUsers[row.id] || null}
                    onChange={opt => handleUserChange(row.id, opt)}
                    placeholder="Select user..."
                    isClearable
                    styles={SEL_STYLES}
                    menuPortalTarget={document.body}
                />
            </div>
            <button
                onClick={() => handleAssign(row)}
                disabled={!selectedUsers[row.id]}
                title="Assign"
                style={{
                    height: 38, width: 38, display: "flex", alignItems: "center", justifyContent: "center",
                    background: selectedUsers[row.id] ? "#005B52" : "#CBD5E1",
                    color: "#fff", border: "none", borderRadius: 8,
                    cursor: selectedUsers[row.id] ? "pointer" : "not-allowed", transition: "0.2s"
                }}
            >
                <FaUserCheck size={14} />
            </button>
            <div className="imd-card-row">
                <span className="imd-card-row-val">
                    {getStatusBadge(leadStatuses[row.id])}
                </span>
            </div>
        </div>
    )

    return (
        <PageContent>
            {pending && <ScreenLoader />}
            <Container fluid>
                <Breadcrumbs title="Leads" breadcrumbItem="PPC Leads" />

                {/* ── Toolbar ── */}
                <div className="imd-toolbar">
                    <div className="imd-search-wrap">
                        <input
                            className="imd-search-input form-control"
                            type="text"
                            placeholder="Search by name, mobile, location, source…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {searchTerm && (
                            <button className="imd-clear-btn" onClick={() => setSearchTerm("")}>
                                <MdClose size={13} /> Clear
                            </button>
                        )}
                        <div className="imd-view-toggle">
                            <button className={`imd-view-btn${view === "grid" ? " active" : ""}`} title="Grid view" onClick={() => setView("grid")}>⊞</button>
                            <button className={`imd-view-btn${view === "table" ? " active" : ""}`} title="Table view" onClick={() => setView("table")}>☰</button>
                        </div>
                    </div>
                </div>

                {/* ── Grid View ── */}
                {view === "grid" && (
                    filtered.length === 0 ? (
                        <div className="imd-empty">
                            <div className="imd-empty-icon">📋</div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>No leads found</div>
                            <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your search</div>
                        </div>
                    ) : (
                        <div className="imd-grid">
                            {filtered.map(row => (
                                <div key={row.id} className="imd-card">
                                    {/* Card Header */}
                                    <div className="imd-card-hdr" style={{ justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div className="imd-card-avatar">
                                                <FaUserCircle size={22} color="#fff" />
                                            </div>
                                            <div>
                                                <div className="imd-card-name">{row.name}</div>
                                                <span style={{ fontSize: 10 }}>Created At: {formatDateTime(row.createdDate)}</span><br />
                                                <span style={{ fontSize: 10 }}>Assigned At: {formatDateTime(row.assignedDate)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleVerifyClick(row)}
                                            style={{ padding: "6px 12px", background: "#0d6efd", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                                        >
                                            Verify
                                        </button>
                                    </div>

                                    {/* Card Body */}
                                    <div className="imd-card-body">
                                        <div className="imd-card-row">
                                            <MdPhone size={13} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Mobile</span>
                                            <span className="imd-card-row-val">
                                                <div className="phone-container">
                                                    <MdPhone className="phone-icon" color={defaultTheme.goldColorLogo} />
                                                    <span className="phone-number">{row.mobileNumber}</span>
                                                </div>
                                            </span>
                                        </div>
                                        <div className="imd-card-row">
                                            <MdEmail size={13} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Email</span>
                                            <span className="imd-card-row-val">
                                                <div className="phone-container">
                                                    <MdEmail className="phone-icon" color={defaultTheme.goldColorLogo} />
                                                    <span className="phone-number">{row.email}</span>
                                                </div>
                                            </span>
                                        </div>
                                        <div className="imd-card-row">
                                            <MdLocationOn size={13} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Location</span>
                                            <span className="imd-card-row-val">{row.location || '—'}</span>
                                        </div>
                                        <div className="imd-card-row">
                                            <MdSource size={13} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Source</span>
                                            <span className="imd-card-row-val">{row.source || '—'}</span>
                                        </div>
                                        <div className="imd-card-row">
                                            <MdLink size={13} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Website</span>
                                            <span className="imd-card-row-val">
                                                <a href={row.websiteUrl} target="_blank" rel="noreferrer" style={{ color: "#005B52", fontSize: 12, wordBreak: "break-all" }}>
                                                    {row.websiteUrl || '—'}
                                                </a>
                                            </span>
                                        </div>
                                        <div className="imd-card-row">
                                            <FaUserAlt size={11} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Assigned To</span>
                                            <span className="imd-card-row-val">
                                                {row.assignedToCode ? `${row.assignedToName} (${row.assignedToCode})` : '—'}
                                            </span>
                                        </div>
                                        <div className="imd-card-row">
                                            <FaClock size={11} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Assigned Duration</span>
                                            <span className="imd-card-row-val">{getDuration(row.createdDate, row.assignedDate)}</span>
                                        </div>

                                    </div>

                                    {/* Card Footer chips */}
                                    <div className="imd-card-footer">
                                        {row.location && (
                                            <span className="imd-chip imd-chip-gold">
                                                <MdLocationOn size={10} /> {row.location}
                                            </span>
                                        )}
                                        {row.source && (
                                            <span className="imd-chip imd-chip-purple">
                                                📡 {row.source}
                                            </span>
                                        )}
                                    </div>

                                    {/* Assign footer */}
                                    <AssignFooter row={row} />

                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* ── Table View ── */}
                {view === "table" && (
                    <AppTable
                        columns={columns}
                        data={filtered}
                        pagination
                        progressPending={pending}
                    />
                )}

                {/* ── Verify Modal (unchanged) ── */}
                <Modal isOpen={verifyModal} toggle={toggleVerifyModal} centered size="lg" backdropClassName="modal-backdrop-blur" contentClassName="custom-modal-content">
                    <ModalHeader toggle={toggleVerifyModal} className="border-bottom-0 pb-0">
                        <span className="fw-bold h4">Verify</span>
                    </ModalHeader>
                    <ModalBody>
                        <div className="report-toggle-wrapper mb-4">
                            <div className="segmented-control">
                                {["Prospects", "Suspects", "Meeting"].map(type => (
                                    <label key={type} className={`segmented-item ${reportType === type ? "active" : ""}`}>
                                        <input type="radio" value={type} checked={reportType === type} onChange={handleRadioChange} className="d-none" />
                                        <span>{type === "Meeting" ? "Meetings" : type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        {pending ? (
                            <div className="d-flex flex-column align-items-center justify-content-center py-5">
                                <div className="spinner-border text-primary mb-2" role="status"></div>
                                <div className="text-muted">Fetching {reportType}...</div>
                            </div>
                        ) : (
                            <div className="table-responsive fade-in">
                                <AppTable
                                    progressProspects={setPending}
                                    columns={reportType === "Prospects" ? columnsProspect : reportType === "Meeting" ? columnsMeet : columnsSuspect}
                                    data={reportType === "Prospects" ? prospectData : reportType === "Meeting" ? meetingData : suspectData}
                                    paginationServer
                                    pagination
                                />
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter className="border-top-0">
                        <Button className="px-4 me-2" onClick={toggleVerifyModal} style={{ backgroundColor: defaultTheme.goldColorLogo }}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>

            </Container>
        </PageContent>
    )
}