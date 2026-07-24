/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useEffect } from "react";
import { Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { defaultTheme } from "../../helpers/defaultTheme";
import { GET_ALL_USER, USER_LIST_EXCEL } from "../../helpers/url_helper";
import { formatDate, generateTimestamp, WordWrapCell } from "../../helpers/function_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import ImageModal from "../../components/Common/ImageModal";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from '../Utility/PermissonMissing';
import { decryptData } from '../../components/Common/CryptoUtils';
import { MdEmail, MdLocationOn, MdMobileFriendly } from "react-icons/md";
import { FaSearch, FaTimes, FaFileExcel } from "react-icons/fa";

// ── Styles ─────────────────────────────────────────────────────────────────────
if (document.getElementById("em-s")) document.getElementById("em-s").remove()
const _s = document.createElement("style")
_s.id = "em-s"
_s.textContent = `
    .em-toolbar { display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:space-between; background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:10px 16px; margin-bottom:14px; box-shadow:0 1px 4px rgba(0,0,0,.04); }
    .em-search-wrap { display:flex; align-items:center; gap:8px; flex:1; min-width:220px; }
    .em-search-input { height:38px; padding:0 12px; border:1.5px solid #0d0e0e; border-radius:8px; font-size:13px; color:#0F172A; outline:none; flex:1; transition:border-color .15s; background:#fff; }
    .em-search-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }

    .em-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; border:none; transition:all .15s; white-space:nowrap; }
    .em-btn-primary   { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; }
    .em-btn-primary:hover { opacity:.88; }
    .em-btn-secondary { background:#F1F5F9; color:#475569; border:1.5px solid #E2E8F0; }
    .em-btn-secondary:hover { background:#E2E8F0; }
    .em-btn-excel { background:#F0FDF4; color:#166534; border:1.5px solid #BBF7D0; }
    .em-btn-excel:hover { background:#DCFCE7; }

    .em-divider { width:1px; height:22px; background:#E2E8F0; }
    .em-avatar { width:34px; height:34px; object-fit:cover; cursor:pointer; border-radius:50%; border:2px solid ${defaultTheme.goldColorLogo}; padding:2px; }

    /* ── Responsive ── */

    /* Tablet landscape (≤1024px) */
    @media(max-width:1024px){
        .em-toolbar { gap:8px; padding:10px 14px; }
        .em-btn { padding:7px 14px; font-size:12px; }
    }

    /* Tablet portrait (≤768px) — stack vertically */
    @media(max-width:768px){
        .em-toolbar { flex-direction:column; align-items:stretch; gap:8px; padding:10px 12px; }
        .em-search-wrap { width:100%; min-width:unset; }
        .em-search-input { flex:1; }
        .em-divider { display:none; }
    }

    /* Mobile (≤540px) */
    @media(max-width:540px){
        .em-toolbar { padding:10px; border-radius:10px; }
        .em-search-wrap { flex-wrap:wrap; gap:6px; }
        .em-search-input { width:100%; flex:unset; }
        .em-btn { padding:7px 12px; font-size:11px; gap:5px; }
        .em-btn-primary, .em-btn-secondary { flex:1; justify-content:center; }
        .em-btn-excel { width:100%; justify-content:center; }
    }

    /* Very small (≤380px) */
    @media(max-width:380px){
        .em-btn { font-size:10px; padding:6px 10px; }
        .em-toolbar { border-radius:8px; }
    }
`
document.head.appendChild(_s)

export default function EmployeeMaster() {
    const navigate = useNavigate()
    const { userId } = useUserStore(s => s.user)
    const LIMIT = 100

    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [fileModalOpen, setFileModalOpen] = useState(false)
    const [currentImage, setCurrentImage] = useState("")
    const [pending, setPending] = useState(false)
    const [userData, setUserData] = useState([])
    const [accessGranted, setAccessGranted] = useState(null)

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'user-master')
            setAccessGranted(hasAccess)
            if (hasAccess) getUsersDetails(searchTerm, hasAccess)
        }
        checkAccess()
    }, [userId])

    useEffect(() => {
        if (page > 1) getUsersDetails(searchTerm || "", true)
        else getUsersDetails(searchTerm || "")
    }, [page, searchTerm])

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

    const handleShowData = useCallback(e => {
        e.preventDefault()
        if (!searchTerm) { toast.error("Please Enter Value To Search"); return }
        getUsersDetails(searchTerm, true); setPage(1)
    }, [searchTerm])

    const handleClearData = useCallback(() => {
        setSearchTerm(""); setPage(1); getUsersDetails("", true)
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
                    download: `employee_master_${generateTimestamp()}.xlsx`
                })
                document.body.appendChild(a); a.click(); document.body.removeChild(a)
            })
            .catch(err => { setPending(false); toast.error(err.message) })
    }, [])

    const columns = [
        { name: <span className="font-weight-bold fs-13">SL No.</span>, width: "4%", cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Emp Code</span>, sortable: true, selector: r => r.employeeCode, cell: r => <WordWrapCell>{r.employeeCode}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Profile</span>,
            cell: row => row.fileDetails ? <img src={imageBaseUrl + row.fileDetails} alt="Profile" className="em-avatar" onClick={() => handleViewFile(row.fileDetails)} /> : <span>—</span>
        },
        { name: <span className="font-weight-bold fs-13">Name</span>, sortable: true, selector: r => r.name, cell: r => <WordWrapCell>{r.name}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">User Type</span>, sortable: true, selector: r => r.isAdmin,
            cell: r => <WordWrapCell>{r.isAdmin === "NO" ? "Sales" : r.isAdmin === "OTHER" ? "Other" : "Non Sales"}</WordWrapCell>
        },
        { name: <span className="font-weight-bold fs-13">MT/ST</span>, sortable: true, selector: r => r.mainTeam, cell: r => <WordWrapCell>{r.mainTeam + '/' + r.sTeam}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Designation</span>, sortable: true, selector: r => r.positionMaster?.position,
            cell: r => <WordWrapCell>{r?.positionMaster?.position + ' (' + r.designationName + ')'}</WordWrapCell>
        },
        { name: <span className="font-weight-bold fs-13">Department</span>, sortable: true, selector: r => r.departmentName, cell: r => <WordWrapCell>{r.departmentName}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">RM Details</span>, sortable: true, selector: r => r.reportingManagerName,
            cell: r => <WordWrapCell>{r.reportingManagerName + ' (' + r.parentId + ')'}</WordWrapCell>
        },
        {
            name: "Address",
            cell: row => <div className="phone-container"><MdLocationOn className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{row.address1 + ',' + row.city + ',' + row.state + ',' + row.pincode}</span></div>
        },
        {
            name: "Personal No.", width: "7%",
            cell: row => <div className="phone-container"><MdMobileFriendly className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{row.phone}</span></div>
        },
        {
            name: "Emergency No.", width: "8%",
            cell: row => <div className="phone-container"><MdMobileFriendly className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{row.emergencyPhone}</span></div>
        },
        {
            name: "Email ID",
            cell: row => <div className="phone-container"><MdEmail className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{row.officialEmail}</span></div>
        },
        { name: <span className="font-weight-bold fs-13">Location</span>, sortable: true, selector: r => r.locationName, cell: r => <WordWrapCell>{r.locationName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">DOJ</span>, sortable: true, selector: r => r.doj, cell: r => <WordWrapCell>{formatDate(r.doj)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Actual DOB</span>, sortable: true, selector: r => r.dateOfBirth, cell: r => <WordWrapCell>{formatDate(r.dateOfBirth)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Marriage Anniversary</span>, sortable: true, selector: r => r.marriageAnniversary, cell: r => <WordWrapCell>{formatDate(r.marriageAnniversary)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">DOR</span>, sortable: true, selector: r => r.dol, cell: r => <WordWrapCell>{formatDate(r.dol)}</WordWrapCell> },
    ]

    if (accessGranted === null) return <ScreenLoader />
    if (!accessGranted) return <PermissionMissing />

    return (
        <PageContent>
            <Breadcrumbs title="User Management" breadcrumbItem="Employee Master" />
            {pending && <ScreenLoader />}
            <Container fluid>

                {/* ── Toolbar ── */}
                <form onSubmit={handleShowData}>
                    <div className="em-toolbar">
                        <div className="em-search-wrap">
                            <input className="em-search-input" type="text"
                                placeholder="Search by name, emp code…"
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            <button type="submit" className="em-btn em-btn-primary">
                                <FaSearch size={11} /> Search
                            </button>
                            <button type="button" className="em-btn em-btn-secondary" onClick={handleClearData}>
                                <FaTimes size={11} /> Clear
                            </button>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <div className="em-divider" />
                            <button type="button" className="em-btn em-btn-excel" onClick={downloadUserExcel}>
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