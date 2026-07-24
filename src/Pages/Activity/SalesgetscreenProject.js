/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PageContent from "../../components/Common/PageContent";
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

const DEPT = "Sales"

if (document.getElementById("sg-s")) document.getElementById("sg-s").remove()
const _s = document.createElement("style")
_s.id = "sg-s"
_s.textContent = `
    .sg-hdr { background:linear-gradient(135deg,#005B52 0%,#007A6E 55%,#00897B 100%); border-radius:14px; padding:18px 22px; margin-bottom:14px; display:flex; align-items:center; justify-content:space-between; position:relative; overflow:hidden; }
    .sg-hdr::before { content:''; position:absolute; top:-40px; right:-40px; width:160px; height:160px; border-radius:50%; background:rgba(255,255,255,.05); pointer-events:none; }
    .sg-hdr-title { font-size:18px; font-weight:800; color:#fff; position:relative; }
    .sg-hdr-sub   { font-size:12px; color:rgba(255,255,255,.65); position:relative; margin-top:2px; }
    .sg-hdr-badge { background:rgba(201,168,76,.25); color:#f5d060; border:1px solid rgba(201,168,76,.4); border-radius:20px; padding:4px 14px; font-size:12px; font-weight:700; position:relative; }

    /* ── Filter bar ── */
    .sg-filter-bar { background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:16px 20px; margin-bottom:16px; box-shadow:0 1px 4px rgba(0,0,0,.04); }
    .sg-filter-grid { display:grid; grid-template-columns:1fr 1fr auto auto; gap:12px; align-items:end; }
    @media(max-width:768px){ .sg-filter-grid { grid-template-columns:1fr 1fr; } }
    @media(max-width:500px){ .sg-filter-grid { grid-template-columns:1fr; } }
    .sg-filter-label { font-size:10px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; display:block; }
    .sg-show-btn { height:38px; padding:0 20px; background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; border:none; border-radius:9px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; white-space:nowrap; transition:opacity .15s; }
    .sg-show-btn:hover { opacity:.88; }
    .sg-show-btn:disabled { opacity:.5; cursor:not-allowed; }
    .sg-clear-btn { height:38px; padding:0 16px; background:#F1F5F9; color:#475569; border:1.5px solid #E2E8F0; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:5px; white-space:nowrap; transition:all .15s; }
    .sg-clear-btn:hover { background:#E2E8F0; }

    /* ── Empty / initial state ── */
    .sg-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; background:#fff; border:1px solid #E8ECF2; border-radius:14px; text-align:center; }
    .sg-empty-icon { font-size:48px; margin-bottom:12px; opacity:.5; }
    .sg-empty-title { font-size:15px; font-weight:700; color:#374151; margin-bottom:4px; }
    .sg-empty-sub { font-size:12px; color:#9CA3AF; }

    /* ── Results info ── */
    .sg-results-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; flex-wrap:wrap; gap:8px; }
    .sg-count-chip { font-size:11px; font-weight:700; color:#64748B; background:#F1F5F9; border-radius:20px; padding:3px 12px; border:1px solid #E2E8F0; }

    .sg-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
    @media(max-width:1100px) { .sg-grid { grid-template-columns:repeat(2,1fr); } }
    @media(max-width:640px)  { .sg-grid { grid-template-columns:1fr; } }

    .sg-card {
        background:#fff; border:1px solid #E2E8F0; border-radius:14px;
        padding:14px 16px; cursor:pointer; transition:all .18s;
        display:flex; flex-direction:column; gap:8px;
        box-shadow:0 1px 4px rgba(0,0,0,.04); position:relative; overflow:hidden;
    }
    .sg-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#005B52,#F0FDF4); }
    .sg-card:hover { border-color:#005B5260; box-shadow:0 6px 20px rgba(0,0,0,.1); transform:translateY(-2px); }
    .sg-card-name { font-size:14px; font-weight:800; color:#0F172A; }
    .sg-card-dev  { font-size:12px; color:#64748B; margin-bottom:2px; }
    .sg-kv-list { display:flex; flex-direction:column; gap:4px; }
    .sg-kv { display:flex; align-items:baseline; gap:6px; }
    .sg-kv-k { font-size:10px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.4px; white-space:nowrap; min-width:72px; flex-shrink:0; }
    .sg-kv-right { display:flex; align-items:center; gap:5px; flex:1; min-width:0; }
    .sg-kv-v { font-size:12px; font-weight:500; color:#334155; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1; }
    .sg-card-footer { display:flex; align-items:center; justify-content:space-between; padding-top:8px; border-top:1px solid #F1F5F9; margin-top:2px; }
    .sg-doc-badge { background:#F0FDF4; color:#166534; border:1px solid #BBF7D0; border-radius:20px; padding:2px 9px; font-size:11px; font-weight:700; }
    .sg-view-btn { display:flex; align-items:center; gap:4px; padding:5px 12px; background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; border:none; border-radius:7px; font-size:11px; font-weight:700; cursor:pointer; }
    .sg-view-btn:hover { opacity:.88; }

    /* ── Modal ── */
    .sg-overlay { position:fixed; inset:0; background:rgba(15,23,42,.5); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px; overflow-y:auto; animation:oisg .2s ease; }
    @keyframes oisg { from{opacity:0} to{opacity:1} }
    .sg-modal { background:#fff; border-radius:18px; width:100%; max-width:640px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 24px 60px rgba(0,0,0,.25); margin:auto; flex-shrink:0; animation:misg .22s cubic-bezier(.16,1,.3,1); }
    @keyframes misg { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:none} }
    .sg-modal-hdr { background:linear-gradient(135deg,#005B52,#007A6E); padding:14px 20px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
    .sg-modal-title { font-size:15px; font-weight:800; color:#fff; }
    .sg-modal-sub   { font-size:11px; color:rgba(255,255,255,.65); margin-top:1px; }
    .sg-modal-close { border-radius:50%; border:1.5px solid rgba(255,255,255,.4); background:rgba(255,255,255,.12); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s; }
    .sg-modal-close:hover { background:rgba(255,255,255,.25); }
    .sg-modal-body { padding:18px 20px; background:#F8FAFC; overflow-y:auto; max-height:60vh; }
    .sg-modal-body::-webkit-scrollbar { width:4px; }
    .sg-modal-body::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:99px; }
    .sg-modal-doc-row { display:flex; align-items:center; gap:10px; padding:10px 12px; background:#fff; border:1px solid #E2E8F0; border-radius:10px; margin-bottom:4px; text-decoration:none; transition:all .12s; }
    .sg-modal-doc-row:hover { border-color:#005B5260; background:#F0FDF4; }
    .sg-modal-doc-icon { width:34px; height:34px; border-radius:8px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
    .sg-modal-doc-name { flex:1; font-size:13px; font-weight:600; color:#0F172A; }
    .sg-modal-doc-date { font-size:11px; color:#94A3B8; flex-shrink:0; }
    .sg-modal-open { display:flex; align-items:center; gap:3px; font-size:11px; font-weight:600; color:#166534; background:#F0FDF4; border:1px solid #BBF7D0; padding:4px 10px; border-radius:6px; flex-shrink:0; white-space:nowrap; }
    .sg-modal-empty { padding:28px 16px; text-align:center; color:#94A3B8; font-size:13px; }
    .sg-doc-remarks { font-size:11px; color:#64748B; padding:2px 14px 8px 14px; font-style:italic; background:#FAFAFA; border-bottom:1px solid #F1F5F9; margin-top:-2px; border-radius:0 0 8px 8px; margin-bottom:4px; }
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

function ProjectModal({ project: p, onClose }) {
    if (!p) return null
    const docs = (p.projectRegistrationAttachments || []).filter(d => d.forSales === "YES")
    return (
        <div className="sg-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="sg-modal">
                <div className="sg-modal-hdr">
                    <div>
                        <div className="sg-modal-title">{p.sapProject || "—"}</div>
                        <div className="sg-modal-sub">{p.sapBuilder}</div>
                    </div>
                    <button className="sg-modal-close" onClick={onClose}><FaTimes size={12} /></button>
                </div>
                <div className="sg-modal-body">
                    {docs.length === 0 ? (
                        <div className="sg-modal-empty">No documents available for Sales department.</div>
                    ) : docs.map((doc, i) => {
                        const url = doc.attachmentPath || ""
                        const full = url.startsWith("http") ? url : `${imageBaseUrl}${url}`
                        const { icon, bg, border } = getFileIcon(url, doc.docName)
                        return (
                            <div key={i}>
                                <a href={full} target="_blank" rel="noopener noreferrer" className="sg-modal-doc-row">
                                    <div className="sg-modal-doc-icon" style={{ background: bg, border: `1.5px solid ${border}` }}>{icon}</div>
                                    <div className="sg-modal-doc-name">{doc.docName || url}</div>
                                    <span className="sg-modal-doc-date">{formatDateTime(doc.createdDate || "")}</span>
                                    <span className="sg-modal-open"><FaExternalLinkAlt size={8} /> Open</span>
                                </a>
                                {doc.remarks && (
                                    <div className="sg-doc-remarks">💬 {doc.remarks}</div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

function ProjectCard({ project: p, onOpen }) {
    const docs = (p.projectRegistrationAttachments || []).filter(d => d.forSales === "YES")
    return (
        <div className="sg-card" onClick={() => onOpen(p)}>
            <div className="sg-card-footer">
                <span className="sg-doc-badge">{docs.length} doc{docs.length !== 1 ? "s" : ""}</span>
                <button className="sg-view-btn" onClick={e => { e.stopPropagation(); onOpen(p) }}>
                    <FaExternalLinkAlt size={9} /> View Details
                </button>
            </div>
        </div>
    )
}

export default function SalesGetScreen() {
    const [allData, setAllData] = useState([])   // full API response — never changes
    const [data, setData] = useState([])   // filtered results shown
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState(null)
    const [hasSearched, setHasSearched] = useState(false)

    // Filter state
    const [builder, setBuilder] = useState(null)
    const [project, setProject] = useState(null)

    // API-based dropdowns
    const { data: builderRaw } = useGet(GET_DROPDOWN_BUILDER_)
    const { data: projectRaw } = useGet(
        `${GET_PROJECT_BY_BUILDER_}${builder?.value}`,
        { enabled: Boolean(builder?.value) }
    )
    const builderList = builderRaw?.data?.data || []
    const projectList = projectRaw?.data?.data || []

    // Fetch ALL data once on mount
    const fetchAllData = async () => {
        setLoading(true)
        try {
            const res = await ApiClient.get(`${GET_PROJECT_REGISTRATION_DATA}${DEPT}`)
            if (res?.data?.status === 1) setAllData(res.data.data || [])
            else toast.error(res.data.message || "Failed to load")
        } catch (e) { toast.error(e.message) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchAllData() }, [])

    // Apply frontend filter using sapBuilder / sapProject from response
    const fetchData = () => {
        if (!builder) { toast.error("Please select a builder"); return }
        const filtered = allData.filter(p => {
            const matchBuilder = p.sapBuilder?.toLowerCase() === builder.label?.toLowerCase()
            const matchProject = !project || p.sapProject?.toLowerCase() === project.label?.toLowerCase()
            return matchBuilder && matchProject
        })
        setData(filtered)
        setHasSearched(true)
    }

    const handleClear = () => {
        setBuilder(null); setProject(null)
        setData([]); setHasSearched(false)
    }

    const totalDocs = data.reduce((sum, p) => sum + (p.projectRegistrationAttachments || []).filter(d => d.forSales === "YES").length, 0)

    return (
        <PageContent>
            <div className="sg">
                {loading && <ScreenLoader />}
                <Container fluid>
                    <Breadcrumbs title="Project Data" breadcrumbItem="Sales Documents" />

                    {/* Header */}
                    <div className="sg-hdr">
                        <div>
                            <div className="sg-hdr-title">📂 Sales Documents</div>
                            {hasSearched && (
                                <div className="sg-hdr-sub">{data.length} project{data.length !== 1 ? "s" : ""} · {totalDocs} document{totalDocs !== 1 ? "s" : ""}</div>
                            )}
                        </div>
                        <span className="sg-hdr-badge">Sales Dept</span>
                    </div>

                    {/* Filter bar */}
                    <div className="sg-filter-bar">
                        <div className="sg-filter-grid">
                            <div>
                                <label className="sg-filter-label">Builder</label>
                                <Select
                                    value={builder}
                                    onChange={opt => { setBuilder(opt); setProject(null) }}
                                    options={builderList}
                                    isClearable
                                    menuPortalTarget={document.body}
                                    styles={SEL}
                                    placeholder="Select builder…"
                                />
                            </div>
                            <div>
                                <label className="sg-filter-label">Project</label>
                                <Select
                                    value={project}
                                    onChange={setProject}
                                    options={projectList}
                                    isClearable
                                    isDisabled={!builder}
                                    menuPortalTarget={document.body}
                                    styles={SEL}
                                    placeholder={builder ? "Select project…" : "Select builder first…"}
                                />
                            </div>
                            <button className="sg-show-btn" onClick={fetchData} disabled={!builder}>
                                <FaSearch size={12} /> Show
                            </button>
                            <button className="sg-clear-btn" onClick={handleClear}>
                                <FaTimes size={12} /> Clear
                            </button>
                        </div>
                    </div>

                    {/* Initial state — not searched yet */}
                    {!hasSearched && !loading && (
                        <div className="sg-empty">
                            <div className="sg-empty-icon">🔍</div>
                            <div className="sg-empty-title">Select a builder to get started</div>
                            <div className="sg-empty-sub">Choose a builder and optionally a project, then click Show</div>
                        </div>
                    )}

                    {/* No results after search */}
                    {hasSearched && !loading && data.length === 0 && (
                        <div className="sg-empty">
                            <div className="sg-empty-icon">📂</div>
                            <div className="sg-empty-title">No documents found</div>
                            <div className="sg-empty-sub">No Sales documents available for the selected filters</div>
                        </div>
                    )}

                    {/* Results */}
                    {hasSearched && data.length > 0 && (
                        <>
                            <div className="sg-results-bar">
                                <span className="sg-count-chip">
                                    <MdFilterList size={12} style={{ verticalAlign: "middle", marginRight: 2 }} />
                                    {data.length} project{data.length !== 1 ? "s" : ""}
                                </span>
                            </div>
                            <div className="sg-grid">
                                {data.map((p, i) => <ProjectCard key={i} project={p} onOpen={setModal} />)}
                            </div>
                        </>
                    )}
                </Container>
                {modal && <ProjectModal project={modal} onClose={() => setModal(null)} />}
            </div>
        </PageContent>
    )
}