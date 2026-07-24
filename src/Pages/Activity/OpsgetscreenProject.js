/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import ScreenLoader from "../../constants/ScreenLoader";
import ApiClient from "../../helpers/api_helper";
import { imageBaseUrl } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { FaFilePdf, FaVideo, FaImage, FaFile, FaExternalLinkAlt, FaTimes, FaSearch } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import { GET_PROJECT_REGISTRATION_DATA, GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_ } from "../../helpers/url_helper";
import { formatDateTime } from "../../helpers/function_helper";
import Select from "react-select";
import { useGet } from "../../Hooks/useApi";

const DEPT = "OPS"

if (document.getElementById("og-s")) document.getElementById("og-s").remove()
const _s = document.createElement("style")
_s.id = "og-s"
_s.textContent = `
    .og-hdr { background:linear-gradient(135deg,#005B52 0%,#007A6E 55%,#00897B 100%); border-radius:14px; padding:18px 22px; margin-bottom:14px; display:flex; align-items:center; justify-content:space-between; position:relative; overflow:hidden; }
    .og-hdr::before { content:''; position:absolute; top:-40px; right:-40px; width:160px; height:160px; border-radius:50%; background:rgba(255,255,255,.05); pointer-events:none; }
    .og-hdr-title { font-size:18px; font-weight:800; color:#fff; position:relative; }
    .og-hdr-sub   { font-size:12px; color:rgba(255,255,255,.65); margin-top:2px; position:relative; }
    .og-hdr-badge { background:rgba(201,168,76,.25); color:#f5d060; border:1px solid rgba(201,168,76,.4); border-radius:20px; padding:4px 14px; font-size:12px; font-weight:700; position:relative; }

    /* ── Filter bar ── */
    .og-filter-bar { background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:16px 20px; margin-bottom:16px; box-shadow:0 1px 4px rgba(0,0,0,.04); }
    .og-filter-grid { display:grid; grid-template-columns:1fr 1fr auto auto; gap:12px; align-items:end; }
    @media(max-width:768px){ .og-filter-grid { grid-template-columns:1fr 1fr; } }
    @media(max-width:500px){ .og-filter-grid { grid-template-columns:1fr; } }
    .og-filter-label { font-size:10px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; display:block; }
    .og-show-btn { height:38px; padding:0 20px; background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; border:none; border-radius:9px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; white-space:nowrap; transition:opacity .15s; }
    .og-show-btn:hover { opacity:.88; }
    .og-clear-btn { height:38px; padding:0 16px; background:#F1F5F9; color:#475569; border:1.5px solid #E2E8F0; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:5px; white-space:nowrap; transition:all .15s; }
    .og-clear-btn:hover { background:#E2E8F0; }

    /* ── Results bar ── */
    .og-results-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; flex-wrap:wrap; gap:8px; }
    .og-count-chip { font-size:11px; font-weight:700; color:#64748B; background:#F1F5F9; border-radius:20px; padding:3px 12px; border:1px solid #E2E8F0; }

    .og-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
    @media(max-width:1100px) { .og-grid { grid-template-columns:repeat(2,1fr); } }
    @media(max-width:640px)  { .og-grid { grid-template-columns:1fr; } }

    .og-card {
        background:#fff; border:1px solid #E2E8F0; border-radius:14px;
        padding:14px 16px; cursor:pointer; transition:all .18s;
        display:flex; flex-direction:column; gap:8px;
        box-shadow:0 1px 4px rgba(0,0,0,.04); position:relative; overflow:hidden;
    }
    .og-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#7C3AED,#F5F3FF); }
    .og-card:hover { border-color:#7C3AED60; box-shadow:0 6px 20px rgba(0,0,0,.1); transform:translateY(-2px); }
    .og-card-name { font-size:14px; font-weight:800; color:#0F172A; }
    .og-card-dev  { font-size:12px; color:#64748B; margin-bottom:2px; }
    .og-kv-list { display:flex; flex-direction:column; gap:4px; }
    .og-kv { display:flex; align-items:baseline; gap:6px; }
    .og-kv-k { font-size:10px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.4px; white-space:nowrap; min-width:72px; flex-shrink:0; }
    .og-kv-right { display:flex; align-items:center; gap:5px; flex:1; min-width:0; }
    .og-kv-v { font-size:12px; font-weight:500; color:#334155; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1; }
    .og-cert-link { display:inline-flex; align-items:center; gap:2px; padding:1px 6px; border-radius:4px; background:#F5F3FF; border:1px solid #DDD6FE; font-size:10px; font-weight:700; color:#5B21B6; text-decoration:none; white-space:nowrap; flex-shrink:0; }
    .og-cert-link:hover { opacity:.75; }
    .og-card-footer { display:flex; align-items:center; justify-content:space-between; padding-top:8px; border-top:1px solid #F1F5F9; margin-top:2px; }
    .og-doc-badge { background:#F5F3FF; color:#5B21B6; border:1px solid #DDD6FE; border-radius:20px; padding:2px 9px; font-size:11px; font-weight:700; }
    .og-view-btn { display:flex; align-items:center; gap:4px; padding:5px 12px; background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; border:none; border-radius:7px; font-size:11px; font-weight:700; cursor:pointer; }
    .og-view-btn:hover { opacity:.88; }

    /* ── Empty ── */
    .og-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; background:#fff; border:1px solid #E8ECF2; border-radius:14px; text-align:center; }
    .og-empty-icon { font-size:48px; margin-bottom:12px; opacity:.5; }
    .og-empty-title { font-size:15px; font-weight:700; color:#374151; margin-bottom:4px; }
    .og-empty-sub { font-size:12px; color:#9CA3AF; }

    /* ── Modal ── */
    .og-overlay { position:fixed; inset:0; background:rgba(15,23,42,.5); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px; overflow-y:auto; animation:oiog .2s ease; }
    @keyframes oiog { from{opacity:0} to{opacity:1} }
    .og-modal { background:#fff; border-radius:18px; width:100%; max-width:640px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 24px 60px rgba(0,0,0,.25); margin:auto; flex-shrink:0; animation:miog .22s cubic-bezier(.16,1,.3,1); }
    @keyframes miog { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:none} }
    .og-modal-hdr { background:linear-gradient(135deg,#005B52,#007A6E); padding:14px 20px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
    .og-modal-title { font-size:15px; font-weight:800; color:#fff; }
    .og-modal-sub   { font-size:11px; color:rgba(255,255,255,.65); margin-top:1px; }
    .og-modal-close { border-radius:50%; border:1.5px solid rgba(255,255,255,.4); background:rgba(255,255,255,.12); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s; }
    .og-modal-close:hover { background:rgba(255,255,255,.25); }
    .og-modal-tabs { display:flex; background:#fff; border-bottom:1px solid #E8ECF2; padding:0 20px; flex-shrink:0; }
    .og-modal-tab { padding:10px 16px; font-size:12px; font-weight:700; color:#94A3B8; border:none; background:transparent; cursor:pointer; border-bottom:2px solid transparent; transition:all .15s; }
    .og-modal-tab.on { color:#005B52; border-bottom-color:#005B52; }
    .og-modal-body { padding:18px 20px; background:#F8FAFC; overflow-y:auto; max-height:60vh; }
    .og-modal-body::-webkit-scrollbar { width:4px; }
    .og-modal-body::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:99px; }
    .og-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    @media(max-width:500px) { .og-detail-grid { grid-template-columns:1fr; } }
    .og-detail-kv { display:flex; flex-direction:column; gap:3px; padding:10px 12px; background:#fff; border:1px solid #E8ECF2; border-radius:10px; transition:border-color .15s; }
    .og-detail-kv:hover { border-color:#7C3AED40; }
    .og-detail-k { font-size:10px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.5px; }
    .og-detail-v-row { display:flex; align-items:center; gap:6px; margin-top:1px; }
    .og-detail-v { font-size:13px; font-weight:600; color:#0F172A; word-break:break-all; flex:1; line-height:1.4; }
    .og-detail-sec { grid-column:1/-1; display:flex; align-items:center; gap:8px; font-size:10px; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:.7px; margin-top:6px; }
    .og-detail-sec:first-child { margin-top:0; }
    .og-detail-sec-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
    .og-detail-sec-line { flex:1; height:1px; background:#E2E8F0; }
    .og-modal-doc-row { display:flex; align-items:center; gap:10px; padding:10px 12px; background:#fff; border:1px solid #E2E8F0; border-radius:10px; margin-bottom:4px; text-decoration:none; transition:all .12s; }
    .og-modal-doc-row:hover { border-color:#7C3AED60; background:#F5F3FF; }
    .og-modal-doc-icon { width:34px; height:34px; border-radius:8px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
    .og-modal-doc-name { flex:1; font-size:13px; font-weight:600; color:#0F172A; }
    .og-modal-doc-date { font-size:11px; color:#94A3B8; flex-shrink:0; }
    .og-modal-open { display:flex; align-items:center; gap:3px; font-size:11px; font-weight:600; color:#5B21B6; background:#F5F3FF; border:1px solid #DDD6FE; padding:4px 10px; border-radius:6px; flex-shrink:0; white-space:nowrap; }
    .og-modal-empty { padding:28px 16px; text-align:center; color:#94A3B8; font-size:13px; }
    .og-doc-remarks { font-size:11px; color:#64748B; padding:2px 14px 8px 14px; font-style:italic; background:#FAFAFA; border-bottom:1px solid #F1F5F9; margin-top:-2px; border-radius:0 0 8px 8px; margin-bottom:4px; }
`
document.head.appendChild(_s)

const SEL = {
    control: (b, st) => ({ ...b, borderRadius: 9, minHeight: 38, fontSize: 13, border: `1.5px solid ${st.isFocused ? "#005B52" : "#E2E8F0"}`, boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.08)" : "none" }),
    option: (b, st) => ({ ...b, fontSize: 13, background: st.isSelected ? "#005B52" : st.isFocused ? "#f0fdf9" : "#fff", color: st.isSelected ? "#fff" : "#0F172A" }),
    placeholder: b => ({ ...b, color: "#94A3B8", fontSize: 13 }),
    menuPortal: b => ({ ...b, zIndex: 9999 }),
}

const getFileIcon = (url = "", docName = "") => {
    const ext = (url.split(".").pop() || "").toLowerCase()
    if (["mp4", "mov", "avi", "webm"].includes(ext) || docName?.toLowerCase().includes("video"))
        return { icon: <FaVideo size={15} color="#7C3AED" />, bg: "#F5F3FF", border: "#DDD6FE" }
    if (ext === "pdf")
        return { icon: <FaFilePdf size={15} color="#DC2626" />, bg: "#FEF2F2", border: "#FECACA" }
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
        return { icon: <FaImage size={15} color="#0284C7" />, bg: "#F0F9FF", border: "#BAE6FD" }
    return { icon: <FaFile size={15} color="#64748B" />, bg: "#F8FAFC", border: "#E2E8F0" }
}

const KV = ({ k, v }) => (
    <div className="og-kv">
        <span className="og-kv-k">{k}</span>
        <div className="og-kv-right"><span className="og-kv-v">{v || "—"}</span></div>
    </div>
)

const DKV = ({ k, v, certUrl }) => (
    <div className="og-detail-kv">
        <span className="og-detail-k">{k}</span>
        <div className="og-detail-v-row">
            <span className="og-detail-v">{v || "—"}</span>
            {certUrl && (
                <a href={certUrl} target="_blank" rel="noopener noreferrer" className="og-cert-link">
                    <FaExternalLinkAlt size={8} /> View
                </a>
            )}
        </div>
    </div>
)

function ProjectModal({ project: p, onClose }) {
    const [tab, setTab] = useState("details")
    if (!p) return null
    const docs = (p.projectRegistrationAttachments || []).filter(d => d.forOps === "YES")
    return (
        <div className="og-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="og-modal">
                <div className="og-modal-hdr">
                    <div>
                        <div className="og-modal-title">{p.sapProject || "—"}</div>
                        <div className="og-modal-sub">{p.sapBuilder || "—"}</div>
                    </div>
                    <button className="og-modal-close" onClick={onClose}><FaTimes size={12} /></button>
                </div>
                <div className="og-modal-tabs">
                    <button className={`og-modal-tab${tab === "details" ? " on" : ""}`} onClick={() => setTab("details")}>Details</button>
                    <button className={`og-modal-tab${tab === "docs" ? " on" : ""}`} onClick={() => setTab("docs")}>Documents ({docs.length})</button>
                </div>
                <div className="og-modal-body">
                    {tab === "docs" && (
                        docs.length === 0 ? (
                            <div className="og-modal-empty">No documents available for OPS department.</div>
                        ) : docs.map((doc, i) => {
                            const url = doc.attachmentPath || ""
                            const full = url.startsWith("http") ? url : `${imageBaseUrl}${url}`
                            const { icon, bg, border } = getFileIcon(url, doc.docName)
                            return (
                                <div key={i}>
                                    <a href={full} target="_blank" rel="noopener noreferrer" className="og-modal-doc-row">
                                        <div className="og-modal-doc-icon" style={{ background: bg, border: `1.5px solid ${border}` }}>{icon}</div>
                                        <div className="og-modal-doc-name">{doc.docName || url}</div>
                                        <span className="og-modal-doc-date">{formatDateTime(doc.createdDate || "")}</span>
                                        <span className="og-modal-open"><FaExternalLinkAlt size={8} /> Open</span>
                                    </a>
                                    {doc.remarks && <div className="og-doc-remarks">💬 {doc.remarks}</div>}
                                </div>
                            )
                        })
                    )}
                    {tab === "details" && (
                        <div className="og-detail-grid">
                            <div className="og-detail-sec"><span className="og-detail-sec-dot" style={{ background: "#005B52" }} />Project Info<span className="og-detail-sec-line" /></div>
                            <DKV k="BD Builder" v={p.developerName} />
                            <DKV k="BD Project" v={p.projectName} />
                            <DKV k="Address" v={p.projectAddress} />
                            <div className="og-detail-sec"><span className="og-detail-sec-dot" style={{ background: "#C9A84C" }} />Bank Details<span className="og-detail-sec-line" /></div>
                            <DKV k="Bank Name" v={p.bankDetails} />
                            <DKV k="Acct Holder" v={p.bankHolderName} />
                            <DKV k="Account No." v={p.accountNo} />
                            <DKV k="IFSC Code" v={p.ifscCode} />
                            <div className="og-detail-sec"><span className="og-detail-sec-dot" style={{ background: "#7C3AED" }} />Legal & Compliance<span className="og-detail-sec-line" /></div>
                            <DKV k="RERA No." v={p.reraNo} certUrl={p.reraCertificate ? `${imageBaseUrl}${p.reraCertificate}` : null} />
                            <DKV k="GST No." v={p.gstNo} certUrl={p.gstCertificate ? `${imageBaseUrl}${p.gstCertificate}` : null} />
                            <div className="og-detail-sec"><span className="og-detail-sec-dot" style={{ background: "#8B5CF6" }} />OPS Contact<span className="og-detail-sec-line" /></div>
                            <DKV k="Name" v={p.opsPersonName} />
                            <DKV k="Mobile" v={p.opsPersonMobileno} />
                            <DKV k="Email" v={p.opsPersonEmail} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function ProjectCard({ project: p, onOpen }) {
    const docs = (p.projectRegistrationAttachments || []).filter(d => d.forOps === "YES")
    return (
        <div className="og-card" onClick={() => onOpen(p)}>
            <div>
                <div className="og-card-name">{p.sapProject || "—"}</div>
                <div className="og-card-dev">{p.sapBuilder || "—"}</div>
            </div>
            <div className="og-kv-list">
                <KV k="SAP Builder" v={p.sapBuilder || "—"} />
                <KV k="SAP Project" v={p.sapProject || "—"} />
                <KV k="Address" v={p.projectAddress || "—"} />
            </div>
            <div className="og-card-footer">
                <span className="og-doc-badge">{docs.length} doc{docs.length !== 1 ? "s" : ""}</span>
                <button className="og-view-btn" onClick={e => { e.stopPropagation(); onOpen(p) }}>
                    <FaExternalLinkAlt size={9} /> View Details
                </button>
            </div>
        </div>
    )
}

export default function OpsGetScreen() {
    const { userId } = useUserStore(s => s.user)
    const [accessGranted, setAccessGranted] = useState(null)
    const [allData, setAllData] = useState([])   // full response
    const [data, setData] = useState([])   // shown
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState(null)

    // Filter state
    const [builder, setBuilder] = useState(null)
    const [project, setProject] = useState(null)

    // API-based dropdowns
    const { data: builderRaw } = useGet(GET_DROPDOWN_BUILDER_, { enabled: Boolean(accessGranted) })
    const { data: projectRaw } = useGet(
        `${GET_PROJECT_BY_BUILDER_}${builder?.value}`,
        { enabled: Boolean(builder?.value) }
    )
    const builderList = builderRaw?.data?.data || []
    const projectList = projectRaw?.data?.data || []

    const fetchAllData = async () => {
        setLoading(true)
        try {
            const res = await ApiClient.get(`${GET_PROJECT_REGISTRATION_DATA}${DEPT}`)
            if (res?.data?.status === 1) {
                const d = res.data.data || []
                setAllData(d)
                setData(d)   // show all on load
            } else toast.error(res.data.message || "Failed to load")
        } catch (e) { toast.error(e.message) }
        finally { setLoading(false) }
    }

    useEffect(() => {
        const check = async () => {
            const ok = await CheckUserAccess(userId, "ops-project-documents")
            setAccessGranted(ok)
            if (ok) fetchAllData()
        }
        check()
    }, [userId])

    // Frontend filter — case-insensitive on sapBuilder / sapProject
    const handleFilter = () => {
        const filtered = allData.filter(p => {
            const matchBuilder = !builder ||
                p.sapBuilder?.toLowerCase() === builder.label?.toLowerCase()
            const matchProject = !project ||
                p.sapProject?.toLowerCase() === project.label?.toLowerCase()
            return matchBuilder && matchProject
        })
        setData(filtered)
    }

    const handleClear = () => {
        setBuilder(null); setProject(null)
        setData(allData)
    }

    const totalDocs = data.reduce((sum, p) =>
        sum + (p.projectRegistrationAttachments || []).filter(d => d.forOps === "YES").length, 0)

    if (accessGranted === null) return <ScreenLoader />
    if (!accessGranted) return <PermissionMissing />

    return (
        <PageContent>
            <div className="og">
                {loading && <ScreenLoader />}
                <Container fluid>
                    <Breadcrumbs title="Project Data" breadcrumbItem="OPS Documents" />

                    {/* Header */}
                    <div className="og-hdr">
                        <div>
                            <div className="og-hdr-title">⚙️ OPS Documents</div>
                            <div className="og-hdr-sub">
                                {data.length} project{data.length !== 1 ? "s" : ""} · {totalDocs} document{totalDocs !== 1 ? "s" : ""}
                            </div>
                        </div>
                        <span className="og-hdr-badge">OPS Dept</span>
                    </div>

                    {/* Filter bar */}
                    <div className="og-filter-bar">
                        <div className="og-filter-grid">
                            <div>
                                <label className="og-filter-label">Builder</label>
                                <Select
                                    value={builder}
                                    onChange={opt => { setBuilder(opt); setProject(null) }}
                                    options={builderList}
                                    isClearable
                                    menuPortalTarget={document.body}
                                    styles={SEL}
                                    placeholder="All builders…"
                                />
                            </div>
                            <div>
                                <label className="og-filter-label">Project</label>
                                <Select
                                    value={project}
                                    onChange={setProject}
                                    options={projectList}
                                    isClearable
                                    isDisabled={!builder}
                                    menuPortalTarget={document.body}
                                    styles={SEL}
                                    placeholder={builder ? "All projects…" : "Select builder first…"}
                                />
                            </div>
                            <button className="og-show-btn" onClick={handleFilter}>
                                <FaSearch size={12} /> Filter
                            </button>
                            <button className="og-clear-btn" onClick={handleClear}>
                                <FaTimes size={12} /> Clear
                            </button>
                        </div>
                    </div>

                    {/* Results count */}
                    {!loading && (
                        <div className="og-results-bar">
                            <span className="og-count-chip">
                                <MdFilterList size={12} style={{ verticalAlign: "middle", marginRight: 2 }} />
                                {data.length}/{allData.length} project{data.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    )}

                    {/* No results */}
                    {!loading && data.length === 0 && (
                        <div className="og-empty">
                            <div className="og-empty-icon">📂</div>
                            <div className="og-empty-title">No documents found</div>
                            <div className="og-empty-sub">No OPS documents match the selected filters</div>
                        </div>
                    )}

                    {/* Grid */}
                    {data.length > 0 && (
                        <div className="og-grid">
                            {data.map((p, i) => <ProjectCard key={i} project={p} onOpen={setModal} />)}
                        </div>
                    )}
                </Container>
                {modal && <ProjectModal project={modal} onClose={() => setModal(null)} />}
            </div>
        </PageContent>
    )
}