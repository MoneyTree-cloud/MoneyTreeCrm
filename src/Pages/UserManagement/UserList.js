/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useEffect } from "react";
import { Container } from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { defaultTheme } from "../../helpers/defaultTheme";
import { usePut } from "../../Hooks/useApi";
import { CHANGE_USER_STATUS, GET_ALL_USER, RESET_PASSWORD, USER_LIST_EXCEL } from "../../helpers/url_helper";
import { formatDate, generateTimestamp, WordWrapCell } from "../../helpers/function_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { FaRedo, FaUserEdit, FaSearch, FaTimes, FaPlus, FaFileExcel } from "react-icons/fa";
import Switch from "react-switch";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import ImageModal from "../../components/Common/ImageModal";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from '../Utility/PermissonMissing';
import { decryptData } from '../../components/Common/CryptoUtils';

// ── Styles ─────────────────────────────────────────────────────────────────────
if (document.getElementById("ul-s")) document.getElementById("ul-s").remove()
const _s = document.createElement("style")
_s.id = "ul-s"
_s.textContent = `
    /* Toolbar */
    .ul-toolbar { display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:space-between; background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:10px 16px; margin-bottom:14px; box-shadow:0 1px 4px rgba(0,0,0,.04); }
    .ul-search-wrap { display:flex; align-items:center; gap:8px; flex:1; min-width:220px; }
    .ul-search-input { height:38px; padding:0 12px; border:1.5px solid #070707; border-radius:8px; font-size:13px; color:#0F172A; outline:none; flex:1; transition:border-color .15s; background:#fff; }
    .ul-search-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }

    /* Buttons */
    .ul-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; border:none; transition:all .15s; white-space:nowrap; }
    .ul-btn-primary   { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; }
    .ul-btn-primary:hover { opacity:.88; }
    .ul-btn-secondary { background:#F1F5F9; color:#475569; border:1.5px solid #E2E8F0; }
    .ul-btn-secondary:hover { background:#E2E8F0; }
    .ul-btn-add   { background:#FFFBEB; color:#92400E; border:1.5px solid #FDE68A; }
    .ul-btn-add:hover { background:#FEF3C7; }
    .ul-btn-excel { background:#F0FDF4; color:#166534; border:1.5px solid #BBF7D0; }
    .ul-btn-excel:hover { background:#DCFCE7; }

    .ul-right { display:flex; gap:8px; align-items:center; }
    .ul-divider { width:1px; height:22px; background:#E2E8F0; }

    /* Profile img */
    .ul-avatar { width:34px; height:34px; object-fit:cover; cursor:pointer; border-radius:50%; border:2px solid ${defaultTheme.goldColorLogo}; padding:2px; }

    /* ── Responsive ── */

    /* Tablet landscape (≤1024px) */
    @media(max-width:1024px){
        .ul-toolbar { gap:8px; padding:10px 14px; }
        .ul-btn { padding:7px 14px; font-size:12px; }
    }

    /* Tablet portrait (≤768px) — wrap right actions below search */
    @media(max-width:768px){
        .ul-toolbar { flex-direction:column; align-items:stretch; gap:8px; padding:10px 12px; }
        .ul-search-wrap { width:100%; min-width:unset; }
        .ul-search-input { flex:1; }
        .ul-right { justify-content:flex-end; }
        .ul-divider { display:none; }
    }

    /* Mobile (≤540px) */
    @media(max-width:540px){
        .ul-toolbar { padding:10px; gap:8px; border-radius:10px; }
        .ul-search-wrap { flex-wrap:wrap; gap:6px; }
        .ul-search-input { width:100%; flex:unset; }
        .ul-btn { padding:7px 12px; font-size:11px; gap:5px; }
        .ul-btn-primary, .ul-btn-secondary { flex:1; justify-content:center; }
        .ul-right { gap:6px; }
        .ul-btn-add, .ul-btn-excel { flex:1; justify-content:center; }
    }

    /* Very small (≤380px) */
    @media(max-width:380px){
        .ul-btn { font-size:10px; padding:6px 10px; }
        .ul-toolbar { border-radius:8px; }
    }
`
document.head.appendChild(_s)

export default function UserList() {
    const navigate = useNavigate()
    const location = useLocation()
    const { userId, userName, empCode } = useUserStore(s => s.user)
    const { searchTerm_: initialSearchTerm } = location.state || {}
    const LIMIT = 100

    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "")
    const [rowStatus, setRowStatus] = useState("")
    const [rowId, setRowId] = useState("")
    const [fileModalOpen, setFileModalOpen] = useState(false)
    const [currentImage, setCurrentImage] = useState("")
    const [pending, setPending] = useState(false)
    const [userData, setUserData] = useState([])
    const [accessGranted, setAccessGranted] = useState(null)

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'users-list')
            setAccessGranted(hasAccess)
            getUsersDetails(initialSearchTerm || "", hasAccess)
        }
        checkAccess()
    }, [userId])

    useEffect(() => {
        if (page > 1) getUsersDetails(initialSearchTerm || "", true)
        else getUsersDetails(initialSearchTerm || "")
    }, [page])

    const getUsersDetails = (term, hasAccess) => {
        if (!hasAccess) return
        setPending(true)
        let url = `${GET_ALL_USER}offset=${page - 1}&limit=${LIMIT}`
        if (term) url += `&searchValue=${term}`
        ApiClient.get(url)
            .then(res => {
                setPending(false)
                if (res?.data?.status === 1) {
                    decryptData(res.data.data).then(d => setUserData(d)).catch(() => setUserData([]))
                } else { setUserData([]); toast.error(res.data.message) }
            })
            .catch(err => { setPending(false); setUserData([]); toast.error(err.message) })
    }

    const { isPending: isPendingStatus, mutate: changeUserStatus } = usePut(
        CHANGE_USER_STATUS + `empId=${rowId}&status=${rowStatus}&updatedBy=${userName + ' (' + empCode + ')'}  `,
        {
            onSuccess: res => { setRowId(""); setRowStatus(""); if (res?.data?.status === 1) { getUsersDetails(searchTerm, true); toast.success(res.data.message) } else toast.error(res.data.message) },
            onError: err => { setRowId(""); setRowStatus(""); toast.error(err.message) },
        }
    )

    useEffect(() => { if (rowStatus && rowId) changeUserStatus() }, [rowStatus, rowId, changeUserStatus])

    const handleManageUser = useCallback((row = null) => {
        navigate("/users-list/add-edit-user", { state: { userId: row?.userId, searchTerm } })
    }, [navigate, searchTerm])

    const handleResetPassword = (row => {
        if (!window.confirm("Reset password for this user?")) return
        setPending(true)
        ApiClient.put(`${RESET_PASSWORD + row?.employeeCode + "&email=" + row?.emailId}`)
            .then(res => { setPending(false); if (res?.data?.status === 1) { toast.success(res.data.message); getUsersDetails(searchTerm, true) } else toast.error(res.data.message) })
            .catch(err => { setPending(false); toast.error(err.message) })
    })

    const handleSwitchChange = useCallback(row => {
        setRowStatus(row.isActive === "YES" ? "NO" : "YES"); setRowId(row.userId)
    }, [])

    const handleShowData = useCallback(e => {
        e.preventDefault()
        if (!searchTerm) { toast.error("Please enter a value to search"); return }
        getUsersDetails(searchTerm, true); setPage(1)
    }, [searchTerm])

    const handleClearData = useCallback(() => {
        navigate("/users-list", { replace: true }); setSearchTerm(""); setPage(1); getUsersDetails("", true)
    }, [navigate])

    const handleViewFile = fileName => {
        const ext = fileName?.split(".").pop().toLowerCase()
        const url = imageBaseUrl + fileName
        if (ext === "heic" || ext === "msg") {
            const a = Object.assign(document.createElement("a"), { href: url, download: fileName })
            document.body.appendChild(a); a.click(); document.body.removeChild(a)
        } else { setCurrentImage(url); setFileModalOpen(true) }
    }

    const downloadUserExcel = useCallback(() => {
        setPending(true)
        ApiClient.get(USER_LIST_EXCEL, { responseType: "arraybuffer" })
            .then(res => {
                setPending(false)
                const ct = res.headers["content-type"]
                if (ct !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                    try { toast.error(JSON.parse(new TextDecoder().decode(new Uint8Array(res.data))).message || "Failed") }
                    catch { toast.error("Unexpected error.") }
                    return
                }
                const a = Object.assign(document.createElement("a"), {
                    href: window.URL.createObjectURL(new Blob([res.data], { type: ct })),
                    download: `users_data_${generateTimestamp()}.xlsx`
                })
                document.body.appendChild(a); a.click(); document.body.removeChild(a)
            })
            .catch(err => { setPending(false); toast.error(err.message) })
    }, [])

    const columns = [
        { name: <span className="font-weight-bold fs-13">SL No.</span>, width: "5%", cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Emp Code</span>, sortable: true, selector: r => r.employeeCode, cell: r => <WordWrapCell>{r.employeeCode}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Profile</span>,
            cell: row => row.fileDetails ? <img src={imageBaseUrl + row.fileDetails} alt="Profile" className="ul-avatar" onClick={() => handleViewFile(row.fileDetails)} /> : <span>—</span>
        },
        { name: <span className="font-weight-bold fs-13">Name</span>, sortable: true, selector: r => r.name, cell: r => <WordWrapCell>{r.name}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">User Type</span>, sortable: true, selector: r => r.isAdmin,
            cell: r => <WordWrapCell>{r.isAdmin === "NO" ? "Sales" : r.isAdmin === "OTHER" ? "Other" : "Non Sales"}</WordWrapCell>
        },
        { name: <span className="font-weight-bold fs-13">MT/ST</span>, sortable: true, selector: r => r.mainTeam, cell: r => <WordWrapCell>{r.mainTeam + '/' + r.sTeam}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Department</span>, sortable: true, selector: r => r.departmentName, cell: r => <WordWrapCell>{r.departmentName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Location</span>, sortable: true, selector: r => r.locationName, cell: r => <WordWrapCell>{r.locationName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">DOJ</span>, sortable: true, selector: r => r.doj, cell: r => <WordWrapCell>{formatDate(r.doj)}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Manage</span>,
            cell: row => <FaUserEdit size={20} title="Manage User" onClick={() => handleManageUser(row)} style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }} />
        },
        {
            name: <span className="font-weight-bold fs-13">Reset Password</span>,
            cell: row => (
                <FaRedo
                    title={row.isActive === "NO" ? "User is inactive" : "Reset Password"}
                    onClick={() => row.isActive !== "NO" && handleResetPassword(row)}
                    style={{
                        cursor: row.isActive === "NO" ? "not-allowed" : "pointer",
                        color: row.isActive === "NO" ? "#ccc" : defaultTheme.goldColorLogo,
                        fontSize: "1.1em",
                        opacity: row.isActive === "NO" ? 0.5 : 1,
                    }}
                />
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Status</span>,
            cell: row => <Switch checked={row.isActive === "YES"} offColor={defaultTheme.goldColorLogo} onColor={defaultTheme.primary} height={20} width={40} onChange={() => handleSwitchChange(row)} />
        },
        { name: <span className="font-weight-bold fs-13">DOR</span>, sortable: true, selector: r => r.dol, cell: r => <WordWrapCell>{formatDate(r.dol)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Relieving Reason</span>, sortable: true, selector: r => r.releavingReason, cell: r => <WordWrapCell>{r.releavingReason}</WordWrapCell> },
    ]

    if (accessGranted === null) return <ScreenLoader />
    if (!accessGranted) return <PermissionMissing />

    return (
        <PageContent>
            <Breadcrumbs title="User Management" breadcrumbItem="User List" />
            {(isPendingStatus || pending) && <ScreenLoader />}
            <Container fluid>

                {/* ── Toolbar ── */}
                <form onSubmit={handleShowData}>
                    <div className="ul-toolbar">
                        {/* Search */}
                        <div className="ul-search-wrap">
                            <input className="ul-search-input" type="text"
                                placeholder="Search by name, emp code…"
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            <button type="submit" className="ul-btn ul-btn-primary">
                                <FaSearch size={11} /> Search
                            </button>
                            <button type="button" className="ul-btn ul-btn-secondary" onClick={handleClearData}>
                                <FaTimes size={11} /> Clear
                            </button>
                        </div>

                        {/* Right actions */}
                        <div className="ul-right">
                            <div className="ul-divider" />
                            <button type="button" className="ul-btn ul-btn-add" onClick={() => handleManageUser()}>
                                <FaPlus size={11} /> Add User
                            </button>
                            <button type="button" className="ul-btn ul-btn-excel" onClick={downloadUserExcel}>
                                <FaFileExcel size={12} /> Excel
                            </button>
                        </div>
                    </div>
                </form>

                <AppTable
                    columns={columns}
                    data={userData?.content || []}
                    pagination paginationServer
                    paginationTotalRows={userData?.totalElements || 0}
                    onChangePage={newPage => setPage(newPage)}
                    progressPending={pending}
                    conditionalRowStyles={[{
                        when: r => r.isActive === "NO",
                        style: { color: defaultTheme.redColor }
                    }]}
                />
            </Container>

            <ImageModal isOpen={fileModalOpen} toggle={() => setFileModalOpen(p => !p)} imageSrc={currentImage} />
        </PageContent>
    )
}