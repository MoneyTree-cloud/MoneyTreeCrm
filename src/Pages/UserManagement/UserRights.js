import { useEffect, useState } from "react";
import { Container } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import { GET_ALL_USERS_DROPDOWN, GET_MAPPED_TO_USER, GET_MY_TEAM, MAP_MENU_TO_USER } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { toast } from "react-toastify";
import { withAdminAccess } from "../../Routes/AuthProtected";
import { useUserStore } from "../../store/useUserStore";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { FaCheck, FaSave, FaListAlt, FaShieldAlt } from "react-icons/fa";
import { MdSelectAll } from "react-icons/md";

// ── Styles ─────────────────────────────────────────────────────────────────────
if (document.getElementById("ur-s")) document.getElementById("ur-s").remove()
const _s = document.createElement("style")
_s.id = "ur-s"
_s.textContent = `
    /* ── Main card ── */
    .ur-card { background:#fff; border:1px solid #D1D5DB; border-radius:14px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.06); margin-bottom:16px; }
    .ur-card-hdr { background:linear-gradient(135deg,#005B52,#007A6E); padding:14px 22px; display:flex; align-items:center; gap:12px; }
    .ur-card-hdr-icon { width:40px; height:40px; border-radius:10px; background:rgba(255,255,255,.18); display:flex; align-items:center; justify-content:center; border:1.5px solid rgba(255,255,255,.3); flex-shrink:0; }
    .ur-card-hdr-title { font-size:14px; font-weight:800; color:#fff; }
    .ur-card-hdr-sub   { font-size:11px; color:rgba(255,255,255,.65); margin-top:1px; }
    .ur-card-body { padding:20px 22px; }

    /* ── Filter row ── */
    .ur-filter-row { display:grid; grid-template-columns:1fr 1fr auto; gap:12px 16px; align-items:end; margin-bottom:20px; }
    @media(max-width:700px){ .ur-filter-row { grid-template-columns:1fr; } }
    .ur-label { font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:.4px; margin-bottom:4px; display:block; }

    /* Select override */
    .ur-sel .react-select__control { min-height:38px !important; border:1.5px solid #374151 !important; border-radius:8px !important; font-size:13px !important; }
    .ur-sel .react-select__control--is-focused { border-color:#005B52 !important; box-shadow:0 0 0 3px rgba(0,91,82,.08) !important; }

    /* ── Buttons ── */
    .ur-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 20px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; border:none; transition:all .15s; white-space:nowrap; }
    .ur-btn-primary   { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; }
    .ur-btn-primary:hover { opacity:.88; }
    .ur-btn-success   { background:linear-gradient(135deg,#16A34A,#22C55E); color:#fff; }
    .ur-btn-success:hover { opacity:.88; }
    .ur-btn-group { display:flex; gap:8px; }

    /* ── Divider ── */
    .ur-divider { height:1px; background:#E5E7EB; margin:0 0 18px; }

    /* ── Select-all strip ── */
    .ur-select-all { display:flex; align-items:center; gap:10px; padding:11px 16px; background:linear-gradient(135deg,rgba(0,91,82,.06),rgba(0,91,82,.02)); border:1.5px solid rgba(0,91,82,.2); border-radius:10px; cursor:pointer; margin-bottom:16px; user-select:none; transition:all .15s; }
    .ur-select-all.checked { background:linear-gradient(135deg,rgba(0,91,82,.12),rgba(0,91,82,.06)); border-color:#005B52; }
    .ur-select-all-label { font-size:13px; font-weight:700; color:#005B52; flex:1; }
    .ur-select-all-count { font-size:11px; font-weight:600; color:#64748B; background:#F1F5F9; border-radius:20px; padding:2px 10px; }

    /* ── Custom checkbox ── */
    .ur-cb-wrap { display:flex; align-items:center; gap:9px; padding:9px 12px; border-radius:9px; border:1.5px solid #E2E8F0; background:#fff; cursor:pointer; transition:all .14s; user-select:none; }
    .ur-cb-wrap:hover { border-color:#005B52; background:#F0FDF4; }
    .ur-cb-wrap.checked { border-color:#005B52; background:#F0FDF9; }
    .ur-checkbox-box { width:18px; height:18px; border-radius:5px; border:1.5px solid #CBD5E1; background:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .14s; }
    .ur-checkbox-box.checked { background:#005B52; border-color:#005B52; }
    .ur-cb-wrap.checked .ur-checkbox-box { background:#005B52; border-color:#005B52; }
    .ur-cb-label { font-size:12px; font-weight:600; color:#374151; }
    .ur-cb-wrap.checked .ur-cb-label { color:#005B52; }

    /* ── Checkbox grid ── */
    .ur-cb-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
    @media(max-width:1000px){ .ur-cb-grid { grid-template-columns:repeat(3,1fr); } }
    @media(max-width:700px) { .ur-cb-grid { grid-template-columns:repeat(2,1fr); } }
    @media(max-width:480px) { .ur-cb-grid { grid-template-columns:1fr; } }

    /* ── Empty state ── */
    .ur-empty { text-align:center; padding:40px 20px; color:#94A3B8; }
    .ur-empty-icon { font-size:40px; margin-bottom:8px; opacity:.4; }
    .ur-empty-text { font-size:13px; font-weight:600; }
    .ur-empty-sub { font-size:11px; margin-top:4px; }

    /* ── Stats strip ── */
    .ur-stats { display:flex; gap:16px; margin-bottom:16px; flex-wrap:wrap; }
    .ur-stat { display:flex; flex-direction:column; padding:10px 16px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; min-width:100px; }
    .ur-stat-val { font-size:20px; font-weight:800; color:#005B52; line-height:1; }
    .ur-stat-label { font-size:10px; font-weight:600; color:#94A3B8; text-transform:uppercase; letter-spacing:.4px; margin-top:3px; }
`
document.head.appendChild(_s)

const SEL_STYLES = {
    control: (b, st) => ({ ...b, minHeight: 38, fontSize: 13, border: `1.5px solid ${st.isFocused ? "#005B52" : "#374151"}`, borderRadius: 8, boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.08)" : "none" }),
    option: (b, st) => ({ ...b, fontSize: 13, background: st.isSelected ? "#005B52" : st.isFocused ? "#f0fdf9" : "#fff", color: st.isSelected ? "#fff" : "#0F172A" }),
    placeholder: b => ({ ...b, color: "#9CA3AF" }),
    menuPortal: b => ({ ...b, zIndex: 9999 }),
}

const mainMenuGroup = [
    { label: "Activity", value: "activity-master" },
    { label: "Admin Associate", value: "admin associate" },
    { label: "App Menu", value: "app-menu" },
    { label: "Attendance", value: "attendance" },
    { label: "BH Menu", value: "bm-menu" },
    { label: "Customer Care", value: "customer-care" },
    { label: "Connect Menu", value: "connect-menu" },
    { label: "Enquiry Menu", value: "enquiry-menu" },
    { label: "Event", value: "event" },
    { label: "FNF Menu", value: "fnf-menu" },
    { label: "Google Menu", value: "google-menu" },
    { label: "HR Menu", value: "hr-menu" },
    { label: "IVR Menu", value: "ivr-menu" },
    { label: "KYC", value: "kyc" },
    { label: "Masters", value: "masters" },
    { label: "Meta Leads", value: "meta-leads" },
    { label: "MOM", value: "mom" },
    { label: "MTRS Docs", value: "mtrs-docs" },
    { label: "Tasks", value: "tasks" },
    { label: "OTP", value: "otp" },
    { label: "Pop-Up", value: "popup" },
    { label: "Reports", value: "reports" },
    { label: "BO Reports", value: "bo-report" },
    { label: "Finance Reports", value: "finance-report" },
    { label: "Team", value: "team" },
    { label: "Transactions", value: "transactions" },
    { label: "User Management", value: "user management" },
    { label: "Upload Data", value: "upload data" },
    { label: "Visitor", value: "visitor" },
    { label: "SAP Modification", value: "sap-modification-menu" },
]

function UserRights() {
    const [userGroupSelect, setUserGroupSelect] = useState(null)
    const [mainMenuGroupSelect, setMainMenuGroupSelect] = useState(null)
    const [checkboxes, setCheckboxes] = useState([])
    const [selectAll, setSelectAll] = useState(false)
    const [loadingMenu, setLoadingMenu] = useState(false)
    const [accessGranted, setAccessGranted] = useState(null)
    const { userId, empCode } = useUserStore(s => s.user)

    const { data: adminList, isLoading } = useGet(
        empCode === "1" || empCode === "1670" ? GET_ALL_USERS_DROPDOWN : GET_MY_TEAM + userId,
        { enabled: Boolean(accessGranted) }
    )

    useEffect(() => {
        CheckUserAccess(userId, "user-menu-map").then(setAccessGranted)
    }, [userId])

    useEffect(() => {
        if (checkboxes.length > 0) setSelectAll(checkboxes.every(c => c.status))
    }, [checkboxes])

    const getMenuList = () => {
        setLoadingMenu(true)
        ApiClient.get(`${GET_MAPPED_TO_USER}${userGroupSelect?.value}${mainMenuGroupSelect?.value ? `&menuId=${mainMenuGroupSelect.value}` : ""}`)
            .then(res => {
                if (res?.data?.status === 1) setCheckboxes(res.data.data)
                else { setCheckboxes([]); toast.error(res.data.message) }
            })
            .catch(err => { setCheckboxes([]); toast.error(err.message) })
            .finally(() => setLoadingMenu(false))
    }

    const { isPending: isLoadingPost, mutate } = usePost(MAP_MENU_TO_USER + userGroupSelect?.value, {
        onSuccess: res => {
            if (res?.data?.status === 1) { toast.success(res?.data.message); setUserGroupSelect(null); setMainMenuGroupSelect(null); setCheckboxes([]) }
            else toast.error(res?.data.message)
        },
        onError: err => toast.error(err.message),
    })

    const handlePopulateBtn = e => {
        e.preventDefault()
        if (!userGroupSelect) { toast.error("Please Select User"); return }
        getMenuList()
    }

    const handleSave = () => {
        if (!userGroupSelect) { toast.error("Please Select User"); return }
        if (!checkboxes.length) { toast.error("Please Select A Menu"); return }
        mutate(checkboxes)
    }

    const handleCheckboxChange = menuId => {
        setCheckboxes(p => p.map(c => c.menuId === menuId ? { ...c, status: !c.status } : c))
    }

    const handleSelectAllChange = () => {
        const next = !selectAll; setSelectAll(next)
        setCheckboxes(p => p.map(c => ({ ...c, status: next })))
    }

    const checkedCount = checkboxes.filter(c => c.status).length
    const totalCount = checkboxes.length

    if (accessGranted === null) return <ScreenLoader />
    if (!accessGranted) return <PermissionMissing />

    return (
        <PageContent>
            {(isLoadingPost || loadingMenu || isLoading) && <ScreenLoader />}
            <Breadcrumbs title="User Management" breadcrumbItem="User Rights" />
            <Container fluid>

                <div className="ur-card">
                    {/* Header */}
                    <div className="ur-card-hdr">
                        <div className="ur-card-hdr-icon">
                            <FaShieldAlt size={18} color="rgba(255,255,255,.9)" />
                        </div>
                        <div>
                            <div className="ur-card-hdr-title">User Rights Management</div>
                            <div className="ur-card-hdr-sub">Assign menu access permissions to users</div>
                        </div>
                    </div>

                    <div className="ur-card-body">
                        <form onSubmit={handlePopulateBtn}>
                            {/* Filter row */}
                            <div className="ur-filter-row">
                                <div>
                                    <label className="ur-label">Select User</label>
                                    <div className="ur-sel">
                                        <Select value={userGroupSelect} onChange={setUserGroupSelect} isClearable
                                            options={adminList?.data?.data || []} styles={SEL_STYLES} menuPortalTarget={document.body}
                                            placeholder="Choose a user…" />
                                    </div>
                                </div>
                                <div>
                                    <label className="ur-label">Filter by Menu</label>
                                    <div className="ur-sel">
                                        <Select value={mainMenuGroupSelect} onChange={setMainMenuGroupSelect} isClearable
                                            options={mainMenuGroup} styles={SEL_STYLES} menuPortalTarget={document.body}
                                            placeholder="All menus…" />
                                    </div>
                                </div>
                                <div className="ur-btn-group">
                                    <button type="submit" className="ur-btn ur-btn-primary" onClick={handlePopulateBtn}>
                                        <FaListAlt size={11} /> Populate
                                    </button>
                                    <button type="button" className="ur-btn ur-btn-success" onClick={handleSave}>
                                        <FaSave size={11} /> Save
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Stats + checkbox grid */}
                        {checkboxes.length > 0 ? (
                            <>
                                <div className="ur-divider" />

                                {/* Stats strip */}
                                <div className="ur-stats">
                                    <div className="ur-stat">
                                        <span className="ur-stat-val">{totalCount}</span>
                                        <span className="ur-stat-label">Total Menus</span>
                                    </div>
                                    <div className="ur-stat">
                                        <span className="ur-stat-val" style={{ color: "#22C55E" }}>{checkedCount}</span>
                                        <span className="ur-stat-label">Granted</span>
                                    </div>
                                    <div className="ur-stat">
                                        <span className="ur-stat-val" style={{ color: "#EF4444" }}>{totalCount - checkedCount}</span>
                                        <span className="ur-stat-label">Restricted</span>
                                    </div>
                                </div>

                                {/* Select all */}
                                <div className={`ur-select-all${selectAll ? " checked" : ""}`} onClick={handleSelectAllChange}>
                                    <div className={`ur-checkbox-box${selectAll ? " checked" : ""}`} style={{ width: 20, height: 20, borderRadius: 6 }}>
                                        {selectAll && <FaCheck size={11} color="#fff" />}
                                    </div>
                                    <span className="ur-select-all-label">
                                        <MdSelectAll size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                                        Select All Menus
                                    </span>
                                    <span className="ur-select-all-count">{checkedCount} / {totalCount} selected</span>
                                </div>

                                {/* Checkbox grid */}
                                <div className="ur-cb-grid">
                                    {checkboxes.map((cb, i) => (
                                        <div key={i} className={`ur-cb-wrap${cb.status ? " checked" : ""}`}
                                            onClick={() => handleCheckboxChange(cb.menuId)}>
                                            <div className="ur-checkbox-box">
                                                {cb.status && <FaCheck size={9} color="#fff" />}
                                            </div>
                                            <span className="ur-cb-label">{cb.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Bottom save */}
                                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid #E5E7EB", marginTop: 16 }}>
                                    <button type="button" className="ur-btn ur-btn-success" onClick={handleSave}>
                                        <FaSave size={11} /> Save Permissions
                                    </button>
                                </div>
                            </>
                        ) : (
                            !loadingMenu && (
                                <div className="ur-empty">
                                    <div className="ur-empty-icon">🔐</div>
                                    <div className="ur-empty-text">No menus loaded yet</div>
                                    <div className="ur-empty-sub">Select a user and click Populate to view menu permissions</div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </Container>
        </PageContent>
    )
}

export default withAdminAccess(UserRights)