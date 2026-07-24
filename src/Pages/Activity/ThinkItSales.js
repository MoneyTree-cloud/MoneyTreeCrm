import { useState, useEffect, useCallback } from 'react'
import PageContent from '../../components/Common/PageContent'
import Breadcrumbs from '../../components/Common/Breadcrumb'
import { Button, Container, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import AppTable from '../../components/Common/Table'
import { formatDate, formatDateTime, RequiredStar, WordWrapCell } from '../../helpers/function_helper'
import ApiClient, { assetImageBaseUrl } from '../../helpers/api_helper'
import { toast } from 'react-toastify'
import ScreenLoader from '../../constants/ScreenLoader'
import { MdCalendarToday, MdLocationOn, MdPhone, MdEmail, MdApartment, MdClose, MdMobileFriendly } from 'react-icons/md'
import { FaUserCircle, FaClock, FaBuilding } from 'react-icons/fa'
import { GET_ALL_INSTANT_MEETINGS_DATA, UPDATE_INSTANT_MEETING } from '../../helpers/url_helper'
import { defaultTheme } from '../../helpers/defaultTheme'
import "../CSS/styles.css";
import { useUserStore } from '../../store/useUserStore'
import { decryptData } from '../../components/Common/CryptoUtils'

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

const formatTime = (t) => {
    if (!t) return '—'
    const [h, m] = t.split(':')
    const hr = parseInt(h)
    return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

export default function ThinkItSales() {
    const [data, setData] = useState([])
    const [pending, setPending] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [view, setView] = useState("grid") // "grid" | "table"
    const { empCode } = useUserStore(s => s.user)

    // Add these to your existing states
    const [filterStatus, setFilterStatus] = useState("Pending");
    const [updateModal, setUpdateModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [newStatus, setNewStatus] = useState("");

    const statusTabs = ["Pending", "Rescheduled", "Cancel", "Done"];

    // Toggle Modal Function
    const toggleUpdateModal = (row = null) => {
        setSelectedRow(row);
        setNewStatus(row?.thinkitEnum || "Pending");
        setRemarks(row?.remarks || "");
        setUpdateModal(!updateModal);
    };

    const fetchData = useCallback(() => {
        setPending(true)
        ApiClient.get(GET_ALL_INSTANT_MEETINGS_DATA)
            .then(res => {
                setPending(false)
                if (res?.data?.status === 1) {
                    const allData = res.data.data || [];

                    decryptData(allData)
                        .then(d => {
                            const filteredData = d.filter(item => item.empCode === empCode);
                            setData(filteredData);
                        })
                        .catch(() => setData([]));
                }
                else toast.error(res.data.message)
            })
            .catch(err => { setPending(false); toast.error(err.message) })
    }, [empCode])

    useEffect(() => {
        fetchData()
    }, [fetchData])

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

    const columns = [
        { name: <span className="font-weight-bold fs-13">#</span>, width: "5%", cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Customer</span>, selector: r => r.customerName, sortable: true, cell: r => <WordWrapCell>{r.customerName}</WordWrapCell> },
        {
            name: "Mobile No.",
            cell: r => <div className="phone-container"><MdMobileFriendly className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{r.mobile}</span></div>
        },
        { name: <span className="font-weight-bold fs-13">Meeting Date</span>, selector: r => r.meetingDate, sortable: true, cell: r => <WordWrapCell>{formatDate(r.meetingDate)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Time</span>, cell: r => <WordWrapCell>{formatTime(r.meetingTime)}</WordWrapCell> },
        // { name: <span className="font-weight-bold fs-13">Address</span>, selector: r => r.address, cell: r => <WordWrapCell>{r.address}</WordWrapCell> },
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
        { name: <span className="font-weight-bold fs-13">Status</span>, selector: r => r.thinkitEnum, sortable: true, cell: r => <WordWrapCell>{r.thinkitEnum}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Remarks</span>, selector: r => r.remark, sortable: true, cell: r => <WordWrapCell>{r.remark}</WordWrapCell> },

        {
            name: "Action",
            cell: r => (
                <button
                    className="btn btn-sm text-white"
                    style={{ backgroundColor: defaultTheme.goldColorLogo }}
                    onClick={() => toggleUpdateModal(r)}
                >
                    Update
                </button>
            )
        }
    ]

    const handleUpdateSubmit = () => {
        if (!remarks) return toast.warning("Please enter remarks");

        setPending(true);
        const payload = {
            empName: selectedRow?.empName,
            empCode: selectedRow?.empCode,
            id: selectedRow?.id,
            customerName: selectedRow?.customerName,
            address: selectedRow?.address,
            meetingDate: selectedRow?.meetingDate,
            meetingTime: selectedRow?.meetingTime,
            meetingAddress: selectedRow?.meetingAddress,
            project: selectedRow?.project,
            propertyType: selectedRow?.propertyType,
            preferredLocation: selectedRow?.preferredLocation,
            mobile: selectedRow?.mobile,
            email: selectedRow?.email,
            remark: remarks,
            thinkitEnum: newStatus
        }
        const queryString = new URLSearchParams(payload).toString();

        // 2. Append to your URL
        const urlWithParams = `${UPDATE_INSTANT_MEETING}?${queryString}`;

        ApiClient.post(urlWithParams)
            .then(res => {
                setPending(false);
                if (res.data.status === 1) {
                    toast.success("Updated successfully");
                    toggleUpdateModal();
                    fetchData(); // Refresh list
                } else {
                    toast.error(res.data.message);
                }
            })
            .catch(err => {
                setPending(false);
                toast.error(err.message);
            });
    };

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

                {/* ── Toolbar ── */}
                <div className="imd-toolbar">
                    <div className="imd-search-wrap">
                        {/* <MdSearch size={15} className="imd-search-icon" /> */}
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
                                                <span style={{ fontSize: 10 }}>Created At : {formatDateTime(row.createdDate)}</span>

                                            </div>
                                        </div>


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
                                            <FaClock size={11} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Status</span>
                                            <span className="imd-card-row-val">{row.thinkitEnum || '-'}</span>
                                        </div>
                                        <div className="imd-card-row">
                                            <FaClock size={11} className="imd-card-row-icon" />
                                            <span className="imd-card-row-label">Remarks</span>
                                            <span className="imd-card-row-val">{row.remark || '-'}</span>
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
                                    {filterStatus !== 'Done' &&

                                        <div className="imd-card-footer justify-content-between align-items-center">
                                            <div>{/* Your existing Chips here */}</div>
                                            <button
                                                className="btn btn-sm text-white"
                                                style={{ backgroundColor: defaultTheme.goldColorLogo, borderRadius: '6px' }}
                                                onClick={() => toggleUpdateModal(row)}
                                            >
                                                Update
                                            </button>
                                        </div>
                                    }
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

            </Container>

            {/* ── Update Modal ── */}
            <Modal isOpen={updateModal} toggle={() => toggleUpdateModal()} centered backdropClassName="modal-backdrop-blur">
                <ModalHeader toggle={() => toggleUpdateModal()}>Update Status</ModalHeader>
                <ModalBody>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Status <RequiredStar /></label>
                        <select
                            className="form-select"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            {statusTabs.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Remarks <RequiredStar /></label>
                        <textarea
                            className="form-control"
                            rows="4"
                            placeholder="Enter remarks here..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="light" onClick={() => toggleUpdateModal()} style={{ backgroundColor: defaultTheme.goldColorLogo, border: 'none' }}>Cancel</Button>
                    <Button
                        style={{ backgroundColor: defaultTheme.primary, border: 'none' }}
                        onClick={handleUpdateSubmit}
                    >
                        Update Meeting
                    </Button>
                </ModalFooter>
            </Modal>
        </PageContent>
    )
}