import { useState, useEffect, useCallback } from 'react'
import PageContent from '../../components/Common/PageContent'
import Breadcrumbs from '../../components/Common/Breadcrumb'
import { Container } from 'reactstrap'
import AppTable from '../../components/Common/Table'
import { formatActionType, formatDate, formatDateTime, getDuration, WordWrapCell } from '../../helpers/function_helper'
import ApiClient, { assetImageBaseUrl } from '../../helpers/api_helper'
import { toast } from 'react-toastify'
import ScreenLoader from '../../constants/ScreenLoader'
import { MdCalendarToday, MdLocationOn, MdPhone, MdEmail, MdApartment, MdClose, MdMobileFriendly, MdDelete } from 'react-icons/md'
import { FaUserCircle, FaClock, FaBuilding, FaUserCheck, FaUser, FaUserAlt, FaRegBookmark } from 'react-icons/fa'
import { GET_ALL_INSTANT_MEETINGS_DATA, GET_PROSPECT_MEETING_DETAILS, GET_GROUP_MEMBERS, UPDATE_INSTANT_MEETING, CREATE_SUSPECT, GET_STATUS_LEADS, DELETE_INSTANT_MEETING } from '../../helpers/url_helper'
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
    /* ── Header card ── */
    .imd-hdr { background:linear-gradient(135deg,#005B52 0%,#007A6E 60%,#00897B 100%); border-radius:16px; padding:20px 26px; margin-bottom:16px; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
    .imd-hdr::before { content:''; position:absolute; top:-40px; right:-40px; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,.05); pointer-events:none; }
    .imd-hdr::after  { content:''; position:absolute; bottom:-50px; left:60px; width:140px; height:140px; border-radius:50%; background:rgba(255,255,255,.04); pointer-events:none; }
    .imd-hdr-title { font-size:20px; font-weight:800; color:#fff; display:flex; align-items:center; gap:10px; position:relative; }
    .imd-hdr-sub { font-size:12px; color:rgba(255,255,255,.65); margin-top:3px; position:relative; }
    .imd-hdr-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.25); border-radius:20px; font-size:12px; font-weight:700; color:#fff; position:relative; }

    /* ── Toolbar ── */
    .imd-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:10px 16px; margin-bottom:14px; box-shadow:0 1px 4px rgba(0,0,0,.04); }
    .imd-search-wrap { display:flex; align-items:center; gap:8px; flex:1; min-width:200px; position:relative; }
    .imd-search-input { height:38px; padding:0 12px 0 34px; border:1.5px solid #080808; border-radius:8px; font-size:13px; color:#0F172A; outline:none; flex:1; transition:border-color .15s; background:#fff; }
    .imd-search-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }
    .imd-search-icon { position:absolute; left:10px; right:10px; color:#94A3B8; pointer-events:none; }
    .imd-clear-btn { display:inline-flex; align-items:center; gap:5px; padding:7px 14px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; border:1.5px solid #E2E8F0; background:#F8FAFC; color:#64748B; transition:all .15s; }
    .imd-clear-btn:hover { background:#E2E8F0; }

    /* ── Meeting card (grid view) ── */
    .imd-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:14px; margin-bottom:16px; }
    @media(max-width:700px){ .imd-grid { grid-template-columns:1fr; } }

    .imd-card { background:#fff; border:1px solid #E2E8F0; border-radius:14px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.04); transition:all .2s; }
    .imd-card:hover { border-color:#007A6E; box-shadow:0 4px 16px rgba(0,91,82,.1); transform:translateY(-2px); }

    .imd-card-hdr { background:linear-gradient(135deg,#F0FDF9,#E6FAF5); padding:14px 16px; display:flex; align-items:center; gap:12px; border-bottom:1px solid #E2E8F0; }
    .imd-card-avatar { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#005B52,#007A6E); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .imd-card-name { font-size:14px; font-weight:800; color:#0F172A; }
    .imd-card-id   { font-size:10px; color:#94A3B8; font-weight:600; margin-top:1px; }

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

    /* ── View toggle ── */
    .imd-view-toggle { display:flex; gap:4px; }
    .imd-view-btn { width:34px; height:34px; border-radius:8px; border:1.5px solid #E2E8F0; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; }
    .imd-view-btn.active { background:#005B52; border-color:#005B52; color:#fff; }

    /* ── Empty state ── */
    .imd-empty { text-align:center; padding:50px 20px; color:#94A3B8; }
    .imd-empty-icon { font-size:48px; margin-bottom:12px; opacity:.5; }

    /* ── Responsive ── */
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

const formatTime = (t) => {
    if (!t) return '—'
    const [h, m] = t.split(':')
    const hr = parseInt(h)
    return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

export default function ThinkIt() {
    const [data, setData] = useState([])
    const [pending, setPending] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [view, setView] = useState("grid") // "grid" | "table"
    const { userId } = useUserStore(s => s.user)
    const [accessGranted, setAccessGranted] = useState(null)
    const [selectedUsers, setSelectedUsers] = useState({})
    const [selectedRow, setSelectedRow] = useState(null)
    const [verifyModal, setVerifyModal] = useState(false)
    const [reportType, setReportType] = useState("Prospects");
    const [prospectData, setProspectData] = useState([]);
    const [meetingData, setMeetingData] = useState([]);
    const [suspectData, setSuspectData] = useState([]);
    const statusTabs = ["Pending", "Rescheduled", "Cancel", "Done"];
    const [filterStatus, setFilterStatus] = useState("Pending")
    const [leadStatuses, setLeadStatuses] = useState({})

    const toggleVerifyModal = () => {
        setVerifyModal(!verifyModal)
        if (selectedRow) setSelectedRow(null)
    }

    const { data: usersList } = useGet(GET_GROUP_MEMBERS + '18')

    const fetchLeadStatus = async (mobile, empCode) => {
        try {
            const res = await ApiClient.get(
                `${GET_STATUS_LEADS}?mobile=${mobile}&empCode=${empCode}&projectCategory=Thinkit`
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
                    if (item?.mobile && item?.empCode) {
                        const status = await fetchLeadStatus(
                            item.mobile,
                            item.empCode
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
        ApiClient.get(GET_ALL_INSTANT_MEETINGS_DATA)
            .then(res => {
                setPending(false)
                if (res?.data?.status === 1) {
                    decryptData(res.data.data).then(d => setData(d)).catch(() => setData([]))
                }
                else toast.error(res.data.message)
            })
            .catch(err => { setPending(false); toast.error(err.message) })
    }, [])

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'instant-meeting-screen')
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
        setSelectedUsers(prev => ({
            ...prev,
            [rowId]: selectedOption
        }))
    }

    const handleAssign = async (row) => {
        const selected = selectedUsers[row.id]

        if (!selected) {
            toast.error("Please select a user")
            return
        }
        const confirm = window.confirm("Are you sure you want to assign this user?")
        if (!confirm) return

        setPending(true);
        const payload = {
            empName: selectedUsers[row.id].label,
            empCode: selectedUsers[row.id].value,
            id: row.id,
            customerName: row.customerName,
            address: row.address,
            meetingDate: row.meetingDate,
            meetingTime: row.meetingTime,
            meetingAddress: row.meetingAddress,
            project: row.project,
            propertyType: row.propertyType,
            preferredLocation: row.preferredLocation,
            mobile: row.mobile,
            email: row.email
        }
        // 1. Convert your payload object to a query string
        const queryString = new URLSearchParams(payload).toString();

        // 2. Append to your URL
        const urlWithParams = `${UPDATE_INSTANT_MEETING}?${queryString}`;

        ApiClient.post(urlWithParams)
            .then(res => {
                if (res?.data?.status === 1) {
                    const request = {
                        leadName: row.customerName,
                        leadMobile: row.mobile,
                        remark: "N/A",
                        project: row.project,
                        projectCategory: "Thinkit",
                    };

                    ApiClient.post(`${CREATE_SUSPECT}${selectedUsers[row.id]?.userId}`, request,)
                        .then(function (response) {
                            setPending(false);
                            if (response?.data?.status === 1) {
                                toast.success('Assigned Successfully');
                                fetchData();
                                setSelectedUsers(prev => ({ ...prev, [row.id]: null }));
                            } else {
                                toast.error(response.data.message);
                            }
                        })
                        .catch(function (error) {
                            setPending(false);
                            toast.error(error.message);
                        });

                } else {
                    toast.error(res.data.message);
                    setPending(false)
                }
            })
            .catch(err => {
                setPending(false);
                toast.error(err.message);
            });
    }

    const fetchVerifyData = async (row, typeValue) => {
        if (!row) return

        setPending(true)

        const type =
            typeValue === "Prospects" ? "0" :
                typeValue === "Suspects" ? "2" : "1"

        try {
            const res = await ApiClient.post(
                `${GET_PROSPECT_MEETING_DETAILS}${row.mobile}&type=${type}`
            )

            if (res?.data?.status === 1) {
                const encryptedContent = res?.data?.data
                const decrypted = await decryptData(encryptedContent)

                if (typeValue === "Prospects") {
                    setProspectData(decrypted)
                } else if (typeValue === "Meeting") {
                    setMeetingData(decrypted)
                } else {
                    setSuspectData(decrypted)
                }

            } else {
                setProspectData([])
                setMeetingData([])
                setSuspectData([])
                toast.error("No Data Found With this number...")
            }

        } catch (err) {
            setProspectData([])
            setMeetingData([])
            setSuspectData([])
            toast.error(err.message)
        } finally {
            setPending(false)
        }
    }

    useEffect(() => {
        if (verifyModal && selectedRow) {
            fetchVerifyData(selectedRow, reportType)
        }
    }, [reportType, verifyModal, selectedRow])

    const filtered = data?.filter(r => {
        const matchesSearch =
            !searchTerm ||
            r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.mobile?.includes(searchTerm) ||
            r.project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.preferredLocation?.toLowerCase().includes(searchTerm.toLowerCase())

        // ✅ Handle null as Pending
        const statusValue = r.thinkitEnum ?? "Pending"

        const matchesStatus = filterStatus === "Pending"
            ? (r.thinkitEnum === null || r.thinkitEnum === "Pending")
            : statusValue === filterStatus

        return matchesSearch && matchesStatus
    })

    const handleDeleteClick = (row) => {
        if (!window.confirm("Are you sure you want to delete this?")) return;
        setPending(true);
        ApiClient.post(`${DELETE_INSTANT_MEETING}${row.id}`)
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

    const columns = [
        { name: <span className="font-weight-bold fs-13">#</span>, width: "4%", cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Verify</span>, cell: r =>
                <button
                    onClick={() => handleVerifyClick(r)}
                    style={{
                        padding: "6px 12px",
                        background: "#0d6efd",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer"
                    }}
                >
                    Verify
                </button>
        },
        {
            name: <span className="font-weight-bold fs-13">Lead Status</span>,
            width: '10%',
            cell: row => <WordWrapCell> {getStatusBadge(leadStatuses[row.id])}</WordWrapCell>,
            sortable: true
        },
        { name: <span className="font-weight-bold fs-13">Customer</span>, selector: r => r.customerName, sortable: true, cell: r => <WordWrapCell>{r.customerName}</WordWrapCell> },
        {
            name: "Mobile No.",
            cell: r => <div className="phone-container"><MdMobileFriendly className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{r.mobile}</span></div>
        },
        { name: <span className="font-weight-bold fs-13">Meeting Date</span>, selector: r => r.meetingDate, sortable: true, cell: r => <WordWrapCell>{formatDate(r.meetingDate)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Time</span>, cell: r => <WordWrapCell>{formatTime(r.meetingTime)}</WordWrapCell> },
        {
            name: "Address",
            cell: r => <div className="phone-container"><MdLocationOn className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{r.address}</span></div>
        },
        { name: <span className="font-weight-bold fs-13">Meeting At</span>, selector: r => r.meetingAddress, cell: r => <WordWrapCell>{r.meetingAddress}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Project</span>, selector: r => r.project, cell: r => <WordWrapCell>{r.project}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Property Type</span>, selector: r => r.propertyType, cell: r => <WordWrapCell>{r.propertyType}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Preferred Location</span>, selector: r => r.preferredLocation, cell: r => <WordWrapCell>{r.preferredLocation}</WordWrapCell> },
        {
            name: "Email",
            cell: r => <div className="phone-container"><MdEmail className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{r.email}</span></div>
        },
        { name: <span className="font-weight-bold fs-13">Created At</span>, selector: r => r.createdDate, sortable: true, cell: r => <WordWrapCell>{formatDateTime(r.createdDate)}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Assigned To</span>, selector: r => r.empName, sortable: true, cell: r => <WordWrapCell>{r.empCode
                ? `${r.empName} (${r.empCode})`
                : `-`
            }</WordWrapCell>
        },

        { name: <span className="font-weight-bold fs-13">Employee</span>, selector: r => r.empCodeName, sortable: true, cell: r => <WordWrapCell>{r.empCodeName || '-'}</WordWrapCell> },


        { name: <span className="font-weight-bold fs-13">Remarks</span>, selector: r => r.remark, sortable: true, cell: r => <WordWrapCell>{r.remark || '-'}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Assigned At</span>, selector: r => r.upDatedtime, sortable: true, cell: r => <WordWrapCell>{formatDateTime(r.upDatedtime)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Assign Duration</span>, cell: r => <WordWrapCell>{getDuration(r.createdDate, r.upDatedtime)}</WordWrapCell> },
        {
            name: "Assign User",
            width: "280px",
            cell: row => (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%"
                    }}
                >
                    {/* Dropdown */}
                    <div style={{ flex: 1 }}>
                        <Select
                            options={userOptions || []}
                            value={selectedUsers[row.id] || null}
                            onChange={(opt) => handleUserChange(row.id, opt)}
                            placeholder="Select user"
                            isClearable
                            styles={SEL_STYLES}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>

                    {/* Bigger Icon Button */}
                    <button
                        disabled={!selectedUsers[row.id]}
                        onClick={() => handleAssign(row)}
                        title="Assign"
                        style={{
                            height: 40,
                            width: 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: selectedUsers[row.id] ? "#005B52" : "#CBD5E1",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            cursor: selectedUsers[row.id] ? "pointer" : "not-allowed",
                            transition: "all 0.2s ease"
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

    const columnsProspect = [
        {
            name: <span className="font-weight-bold fs-13">#</span>,
            selector: (_, index) => index + 1,
            width: "8%",
        },
        {
            name: <span className="font-weight-bold fs-13">Associate</span>,
            selector: (row) => row.associateName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.associateName + " (" + row.associateId + ")"}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">MT/ST</span>,
            selector: (row) => row.mainTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.mainTeam + '/' + row.subTeam}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row.clientName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Created Date</span>,
            selector: (row) => row.totalTeamSize,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.createdDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Type</span>,
            selector: (row) => row.typeName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.typeName}</WordWrapCell>,
        },
    ];

    const columnsMeet = [
        {
            name: <span className="font-weight-bold fs-13">#</span>,
            selector: (_, index) => index + 1,
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">Associate</span>,
            selector: (row) => row.associateId,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.loginUserName + " (" + row.associateId + ")"}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">MT/ST</span>,
            selector: (row) => row.mainTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.mainTeam + '/' + row.subTeam}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row.clientName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Meeting Start Date</span>,
            selector: (row) => row.meetingStartAt,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.meetingStartAt)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Meeting End Date</span>,
            selector: (row) => row.meetingEndAt,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.meetingEndAt)}</WordWrapCell>,
        },
    ];

    const columnsSuspect = [
        {
            name: <span className="font-weight-bold fs-13">#</span>,
            selector: (_, index) => index + 1,
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            selector: (row) => row.associateId,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.associateName + " (" + row.associateId + ")"}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Created At</span>,
            selector: (row) => row.createdDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">MT/ST</span>,
            selector: (row) => row.mainTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.mainTeam + '/' + row.subTeam}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row.clientName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Status</span>,
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatActionType(row.status)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Suspect Type</span>,
            selector: (row) => row.suspectType,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatActionType(row.suspectType)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Status Update Date</span>,
            selector: (row) => row.statusUpdateDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.statusUpdateDate)}</WordWrapCell>,
        }
    ];

    const handleRadioChange = (event) => {
        setReportType(event.target.value);

    };

    if (accessGranted === null) return <ScreenLoader />
    if (!accessGranted) return <PermissionMissing />


    return (
        <PageContent>
            {pending && <ScreenLoader />}
            <Container fluid>
                <Breadcrumbs title="Meetings" breadcrumbItem="Think IT" />

                <div className="imd-hdr" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

                    {/* Left section */}
                    <div style={{ position: "relative" }}>
                        <div className="imd-hdr-title">📅 Think IT</div>
                        <div className="imd-hdr-sub">All scheduled instant meeting requests</div>
                    </div>

                    {/* Center image */}
                    <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                        <img
                            src={assetImageBaseUrl + 'GEnie.png'}
                            alt="Genie"
                            style={{ height: "80px", objectFit: "contain" }}
                        />
                    </div>

                    {/* Right badge */}
                    <div className="imd-hdr-badge">
                        {filtered.length} {filtered.length === 1 ? "meeting" : "meetings"}
                    </div>

                </div>

                {/* ── Status Tabs ── */}
                <div className="d-flex mb-3 bg-white p-1 rounded-3 border" style={{ width: 'fit-content' }}>
                    {statusTabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilterStatus(tab)}
                            className={`btn btn-sm px-4 py-2 ${filterStatus === tab ? 'text-white' : 'text-muted'}`}
                            style={{
                                backgroundColor: filterStatus === tab ? defaultTheme.goldColorLogo : 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                transition: '0.3s'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                {/* ── Toolbar ── */}
                <div className="imd-toolbar">
                    <div className="imd-search-wrap">
                        <input className="imd-search-input form-control" type="text"
                            placeholder="Search by name, mobile, project, location…"
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
                            <div className="imd-empty-icon">📅</div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>No meetings found</div>
                            <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your search</div>
                        </div>
                    ) : (
                        <div className="imd-grid">
                            {filtered.map(row => (
                                <div key={row.id} className="imd-card">

                                    <div className="imd-card-hdr" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                                        {/* Left side */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div className="imd-card-avatar">
                                                <FaUserCircle size={22} color="#fff" />
                                            </div>
                                            <div>
                                                <div className="imd-card-name">{row.customerName}</div>
                                                <span style={{ fontSize: 10 }}>Created At : {formatDateTime(row.createdDate)}</span><br />
                                                <span style={{ fontSize: 10 }}>Assigned At : {formatDateTime(row.upDatedtime)}</span>
                                            </div>
                                        </div>

                                        {/* Right side Verify Button */}
                                        <button
                                            onClick={() => handleVerifyClick(row)}
                                            style={{
                                                padding: "6px 12px",
                                                background: "#0d6efd",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: 6,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: "pointer"
                                            }}
                                        >
                                            Verify
                                        </button>
                                    </div>

                                    {/* Card Body */}
                                    <div className="imd-card-body">
                                        <div className="imd-card-row">
                                            <MdPhone size={13} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Mobile</span>
                                            {/* <span className="imd-card-row-val">{row.mobile}</span> */}
                                            <span className="imd-card-row-val"><div className="phone-container"><MdPhone className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{row.mobile}</span></div></span>
                                        </div>
                                        <div className="imd-card-row">
                                            <MdEmail size={13} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Email</span>
                                            <span className="imd-card-row-val"><div className="phone-container"><MdEmail className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{row.email}</span></div></span>
                                        </div>
                                        <div className="imd-card-row">
                                            <MdCalendarToday size={13} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Meeting</span>
                                            <span className="imd-card-row-val">
                                                {formatDate(row.meetingDate)} &nbsp;·&nbsp; {formatTime(row.meetingTime)}
                                            </span>
                                        </div>
                                        <div className="imd-card-row">
                                            <MdLocationOn size={13} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Address</span>
                                            <span className="imd-card-row-val">{row.address}</span>
                                            {/* <span className="imd-card-row-val"><div className="phone-container"><MdLocationOn className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{row.address}</span></div></span> */}
                                        </div>
                                        <div className="imd-card-row">
                                            <FaBuilding size={11} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Meet At</span>
                                            <span className="imd-card-row-val">{row.meetingAddress}</span>
                                        </div>
                                        <div className="imd-card-row">
                                            <FaUserAlt size={11} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Assigned To</span>
                                            <span className="imd-card-row-val">{row.empCode
                                                ? `${row.empName} (${row.empCode})`
                                                : `-`
                                            }</span>
                                        </div>

                                        <div className="imd-card-row">
                                            <FaRegBookmark size={11} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Remarks</span>
                                            <span className="imd-card-row-val">{row.remark || '-'}</span>
                                        </div>
                                        <div className="imd-card-row">
                                            <FaClock size={11} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Assigned Duration</span>
                                            <span className="imd-card-row-val">{getDuration(row.createdDate, row.upDatedtime)}</span>
                                        </div>

                                        <div className="imd-card-row">
                                            <FaUser size={11} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Employee</span>
                                            <span className="imd-card-row-val">{row?.empCodeName || '-'}</span>
                                        </div>

                                    </div>

                                    {/* Card Footer */}
                                    <div className="imd-card-footer">
                                        {row.project && (
                                            <span className="imd-chip imd-chip-green">
                                                🏗 {row.project}
                                            </span>
                                        )}
                                        {row.propertyType && (
                                            <span className="imd-chip imd-chip-blue">
                                                <MdApartment size={10} /> {row.propertyType}
                                            </span>
                                        )}
                                        {row.preferredLocation && (
                                            <span className="imd-chip imd-chip-gold">
                                                <MdLocationOn size={10} /> {row.preferredLocation}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        padding: "10px 16px",
                                        borderTop: "1px solid #eee"
                                    }}>
                                        {/* Dropdown */}
                                        <div style={{ flex: 1 }}>
                                            <Select
                                                options={userOptions || []}
                                                value={selectedUsers[row.id] || null}
                                                onChange={(opt) => handleUserChange(row.id, opt)}
                                                placeholder="Select user..."
                                                isClearable
                                                styles={SEL_STYLES}
                                                menuPortalTarget={document.body}
                                            />
                                        </div>

                                        {/* Assign Icon Button */}
                                        <button
                                            onClick={() => handleAssign(row)}
                                            disabled={!selectedUsers[row.id]}
                                            title="Assign"
                                            style={{
                                                height: 38,
                                                width: 38,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                background: selectedUsers[row.id] ? "#005B52" : "#CBD5E1",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: 8,
                                                cursor: selectedUsers[row.id] ? "pointer" : "not-allowed",
                                                transition: "0.2s"
                                            }}
                                        >
                                            <FaUserCheck size={14} />
                                        </button>
                                        <div className="imd-card-row">
                                            {/* <FaUserTie size={11} className="imd-card-row-icon" /> */}
                                            {/* <span className="imd-card-row-label">Lead Status</span> */}
                                            <span className="imd-card-row-val">
                                                {getStatusBadge(leadStatuses[row?.id])}
                                            </span>
                                        </div>
                                    </div>
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

                <Modal
                    isOpen={verifyModal}
                    toggle={toggleVerifyModal}
                    centered
                    size="lg" // Increased size for better table display
                    backdropClassName="modal-backdrop-blur" // Custom class for blur
                    contentClassName="custom-modal-content"
                >
                    <ModalHeader toggle={toggleVerifyModal} className="border-bottom-0 pb-0">
                        <span className="fw-bold h4">Verify</span>
                    </ModalHeader>

                    <ModalBody>
                        {/* Enhanced Segmented Control UI */}
                        <div className="report-toggle-wrapper mb-4">
                            <div className="segmented-control">
                                {["Prospects", "Suspects", "Meeting"].map((type) => (
                                    <label
                                        key={type}
                                        className={`segmented-item ${reportType === type ? "active" : ""}`}
                                    >
                                        <input
                                            type="radio"
                                            value={type}
                                            checked={reportType === type}
                                            onChange={handleRadioChange}
                                            className="d-none"
                                        />
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
                                    columns={
                                        reportType === "Prospects"
                                            ? columnsProspect
                                            : reportType === "Meeting"
                                                ? columnsMeet
                                                : columnsSuspect
                                    }
                                    data={
                                        reportType === "Prospects"
                                            ? prospectData
                                            : reportType === "Meeting"
                                                ? meetingData
                                                : suspectData
                                    }
                                    paginationServer
                                    pagination
                                />
                            </div>
                        )}
                    </ModalBody>

                    <ModalFooter className="border-top-0">
                        <Button
                            className="px-4 me-2"
                            onClick={toggleVerifyModal}
                            style={{ backgroundColor: defaultTheme.goldColorLogo }}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>

            </Container>
        </PageContent>
    )
}