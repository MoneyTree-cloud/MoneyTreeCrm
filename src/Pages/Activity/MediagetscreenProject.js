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
import { FaFilePdf, FaVideo, FaImage, FaFile, FaExternalLinkAlt, FaTimes } from "react-icons/fa";
import { MdSearch, MdFilterList } from "react-icons/md";
import { GET_PROJECT_REGISTRATION_DATA } from "../../helpers/url_helper";
import { formatDateTime } from "../../helpers/function_helper";

const DEPT = "Media"

if (document.getElementById("mg-s")) document.getElementById("mg-s").remove()
const _s = document.createElement("style")
_s.id = "mg-s"
_s.textContent = `
    .mg-hdr { background:linear-gradient(135deg,#005B52 0%,#007A6E 55%,#00897B 100%); border-radius:14px; padding:18px 22px; margin-bottom:14px; display:flex; align-items:center; justify-content:space-between; position:relative; overflow:hidden; }
    .mg-hdr::before { content:''; position:absolute; top:-40px; right:-40px; width:160px; height:160px; border-radius:50%; background:rgba(255,255,255,.05); pointer-events:none; }
    .mg-hdr-title { font-size:18px; font-weight:800; color:#fff; position:relative; }
    .mg-hdr-sub   { font-size:12px; color:rgba(255,255,255,.65); margin-top:2px; position:relative; }
    .mg-hdr-badge { background:rgba(201,168,76,.25); color:#f5d060; border:1px solid rgba(201,168,76,.4); border-radius:20px; padding:4px 14px; font-size:12px; font-weight:700; position:relative; }

    .mg-search { background:#fff; border:1px solid #E8ECF2; border-radius:10px; padding:8px 14px; margin-bottom:14px; display:flex; align-items:center; gap:8px; box-shadow:0 1px 3px rgba(0,0,0,.04); }
    .mg-search-input { flex:1; border:none; outline:none; font-size:13px; color:#0F172A; background:transparent; }
    .mg-search-input::placeholder { color:#94A3B8; }
    .mg-count-chip { font-size:11px; font-weight:700; color:#64748B; background:#F1F5F9; border-radius:20px; padding:2px 10px; border:1px solid #E2E8F0; white-space:nowrap; flex-shrink:0; }

    .mg-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
    @media(max-width:1100px) { .mg-grid { grid-template-columns:repeat(2,1fr); } }
    @media(max-width:640px)  { .mg-grid { grid-template-columns:1fr; } }

    .mg-card {
        background:#fff; border:1px solid #E2E8F0; border-radius:14px;
        padding:16px; cursor:pointer; transition:all .18s;
        display:flex; flex-direction:column; gap:10px;
        box-shadow:0 1px 4px rgba(0,0,0,.04); position:relative; overflow:hidden;
    }
    .mg-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#C9A84C,#FFFBEB); }
    .mg-card:hover { border-color:#C9A84C60; box-shadow:0 6px 20px rgba(0,0,0,.1); transform:translateY(-2px); }

    .mg-card-top { display:flex; align-items:flex-start; gap:10px; }
    .mg-card-emoji { width:38px; height:38px; border-radius:10px; background:#FFFBEB; border:1.5px solid #FDE68A; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
    .mg-card-name { font-size:13px; font-weight:800; color:#0F172A; line-height:1.3; }
    .mg-card-dev  { font-size:11px; color:#64748B; margin-top:2px; }

    /* KV rows */
    .mg-kv-list { display:flex; flex-direction:column; gap:5px; }
    .mg-kv { display:flex; align-items:flex-start; gap:6px; }
    .mg-kv-k { font-size:10px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.4px; white-space:nowrap; min-width:78px; padding-top:1px; flex-shrink:0; }
    .mg-kv-right { display:flex; align-items:center; gap:6px; flex:1; min-width:0; }
    .mg-kv-v { font-size:12px; font-weight:600; color:#334155; word-break:break-all; flex:1; }
    .mg-cert-link {
        display:inline-flex; align-items:center; gap:3px; padding:2px 7px;
        border-radius:5px; background:#FFFBEB; border:1px solid #FDE68A;
        font-size:10px; font-weight:700; color:#92400E; text-decoration:none;
        white-space:nowrap; flex-shrink:0; transition:opacity .12s;
    }
    .mg-cert-link:hover { opacity:.75; }

    .mg-card-footer { display:flex; align-items:center; justify-content:space-between; padding-top:10px; border-top:1px solid #F1F5F9; }
    .mg-doc-badge { background:#FFFBEB; color:#92400E; border:1px solid #FDE68A; border-radius:20px; padding:3px 10px; font-size:11px; font-weight:700; }
    .mg-view-btn {
        display:flex; align-items:center; gap:5px; padding:6px 14px;
        background:linear-gradient(135deg,#005B52,#007A6E); color:#fff;
        border:none; border-radius:8px; font-size:12px; font-weight:700;
        cursor:pointer;
    }
    .mg-view-btn:hover { opacity:.88; }

    /* Modal */
    .mg-overlay {
        position:fixed; inset:0; background:rgba(15,23,42,.5);
        backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
        z-index:9999; display:flex; align-items:center; justify-content:center;
        padding:20px; overflow-y:auto; animation:oimg .2s ease;
    }
    @keyframes oimg { from{opacity:0} to{opacity:1} }
    .mg-modal {
        background:#fff; border-radius:18px; width:100%; max-width:680px;
        overflow:hidden; display:flex; flex-direction:column;
        box-shadow:0 24px 60px rgba(0,0,0,.25); margin:auto; flex-shrink:0;
        animation:mimg .22s cubic-bezier(.16,1,.3,1);
    }
    @keyframes mimg { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:none} }

    .mg-modal-hdr {
        background:linear-gradient(135deg,#005B52,#007A6E);
        padding:16px 20px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
    }
    .mg-modal-title { font-size:15px; font-weight:800; color:#fff; display:flex; flex-direction:column; gap:2px; }
    .mg-modal-sub { font-size:11px; color:rgba(255,255,255,.65); font-weight:400; }
    .mg-modal-close {
        border-radius:50%; border:1.5px solid rgba(255,255,255,.5);
        background:rgba(255,255,255,.15); color:#fff; cursor:pointer;
        display:flex; align-items:center; justify-content:center; transition:background .15s;
    }
    .mg-modal-close:hover { background:rgba(255,255,255,.3); }

    .mg-modal-body { padding:20px; background:#F8FAFC; overflow-y:auto; max-height:65vh; }
    .mg-modal-body::-webkit-scrollbar { width:5px; }
    .mg-modal-body::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:99px; }

    .mg-modal-sec {
        font-size:10px; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:.7px;
        display:flex; align-items:center; gap:6px; margin:16px 0 10px;
    }
    .mg-modal-sec:first-child { margin-top:0; }
    .mg-modal-sec-dot { width:7px; height:7px; border-radius:50%; background:#C9A84C; flex-shrink:0; }
    .mg-modal-sec-line { flex:1; height:1px; background:#E2E8F0; }

    .mg-modal-doc-row {
        display:flex; align-items:center; gap:10px; padding:10px 12px;
        background:#fff; border:1px solid #E2E8F0; border-radius:10px;
        margin-bottom:8px; text-decoration:none; transition:all .12s;
    }
    .mg-modal-doc-row:last-child { margin-bottom:0; }
    .mg-modal-doc-row:hover { border-color:#C9A84C60; background:#FFFBEB; }
    .mg-modal-doc-icon { width:34px; height:34px; border-radius:8px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
    .mg-modal-doc-name { flex:1; font-size:13px; font-weight:600; color:#0F172A; }
    .mg-modal-doc-date { font-size:11px; color:#94A3B8; flex-shrink:0; }
    .mg-modal-open {
        display:flex; align-items:center; gap:3px; font-size:11px; font-weight:600;
        color:#92400E; background:#FFFBEB; border:1px solid #FDE68A;
        padding:4px 10px; border-radius:6px; flex-shrink:0; white-space:nowrap;
    }
    .mg-modal-empty { padding:32px 20px; text-align:center; color:#94A3B8; font-size:13px; }
    .mg-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 20px; background:#fff; border:1px solid #E8ECF2; border-radius:12px; text-align:center; }
`
document.head.appendChild(_s)

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

// KV row — certUrl shows a small "View" link badge inline on right
const KV = ({ k, v, certUrl }) => (
    <div className="mg-kv">
        <span className="mg-kv-k">{k}</span>
        <div className="mg-kv-right">
            <span className="mg-kv-v">{v || "—"}</span>
            {certUrl && (
                <a href={certUrl} target="_blank" rel="noopener noreferrer"
                    className="mg-cert-link"
                    onClick={e => e.stopPropagation()}>
                    <FaExternalLinkAlt size={8} /> View
                </a>
            )}
        </div>
    </div>
)

function DocsModal({ project: p, onClose }) {
    if (!p) return null
    const docs = (p.projectRegistrationAttachments || []).filter(d => d.forMedia === "YES")
    return (
        <div className="mg-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="mg-modal">
                <div className="mg-modal-hdr">
                    <div className="mg-modal-title">
                        {p.projectName || "—"}
                        <span className="mg-modal-sub">{p.developerName} </span>
                    </div>
                    <button className="mg-modal-close" onClick={onClose}><FaTimes size={13} /></button>
                </div>
                <div className="mg-modal-body">
                    <div className="mg-modal-sec">
                        <span className="mg-modal-sec-dot" />
                        Uploaded Documents
                        <span className="mg-modal-sec-line" />
                    </div>
                    {docs.length === 0 && !p.reraCertificate && !p.gstCertificate ? (
                        <div className="mg-modal-empty">No documents available for Media department.</div>
                    ) : (
                        <>
                            {docs.map((doc, i) => {
                                const url = doc.attachmentPath || ""
                                const full = url.startsWith("http") ? url : `${imageBaseUrl}${url}`
                                const { icon, bg, border } = getFileIcon(url, doc.docName)
                                return (
                                    <div key={i}>
                                        <a href={full} target="_blank" rel="noopener noreferrer" className="sg-modal-doc-row">
                                            <div className="sg-modal-doc-icon" style={{ background: bg, border: `1.5px solid ${border}` }}>{icon}</div>
                                            <div className="sg-modal-doc-name">{doc.docName || url}</div>
                                            <span className="sg-modal-doc-date">{formatDateTime(doc.createdDate || "")}</span>
                                            <span className="sg-modal-doc-date">{doc.uploadedBy || ""}</span>
                                            <span className="sg-modal-open"><FaExternalLinkAlt size={8} /> Open</span>
                                        </a>
                                        {doc.remarks && (
                                            <div style={{
                                                fontSize: 11,
                                                color: "#64748B",
                                                padding: "2px 14px 8px 14px",
                                                fontStyle: "italic",
                                                background: "#FAFAFA",
                                                borderBottom: "1px solid #F1F5F9",
                                                marginTop: -4,
                                            }}>
                                                💬 {doc.remarks}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

function ProjectCard({ project: p, onViewDocs }) {
    const docs = (p.projectRegistrationAttachments || []).filter(d => d.forMedia === "YES")
    return (
        <div className="mg-card" onClick={() => onViewDocs(p)}>
            <div className="mg-card-top">
                {/* <div className="mg-card-emoji">📹</div> */}
                <div>
                    <div className="mg-card-name">{p.projectName || "—"}</div>
                    <div className="mg-card-dev">{p.developerName || "—"}</div>
                </div>
            </div>
            <div className="mg-kv-list">
                <KV k="Builder" v={p.developerName || "—"} />
                <KV k="Project" v={p.projectName || "—"} />
                <KV k="Address" v={p.projectAddress || "—"} />
                <KV k="RERA No." v={p.reraNo || "—"} certUrl={p.reraCertificate ? `${imageBaseUrl}${p.reraCertificate}` : null} />
                <KV k="GST No." v={p.gstNo || "—"} certUrl={p.gstCertificate ? `${imageBaseUrl}${p.gstCertificate}` : null} />
            </div>
            <div className="mg-card-footer">
                <span className="mg-doc-badge">{docs.length} doc{docs.length !== 1 ? "s" : ""}</span>
                <button className="mg-view-btn" onClick={e => { e.stopPropagation(); onViewDocs(p) }}>
                    <FaExternalLinkAlt size={10} /> View Docs
                </button>
            </div>
        </div>
    )
}

export default function MediaGetScreen() {
    const { userId } = useUserStore(s => s.user)
    const [accessGranted, setAccessGranted] = useState(null)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [modalProject, setModalProject] = useState(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await ApiClient.get(`${GET_PROJECT_REGISTRATION_DATA}${DEPT}`)
            if (res?.data?.status === 1) setData(res.data.data || [])
            else toast.error(res.data.message || "Failed to load")
        } catch (e) { toast.error(e.message) }
        finally { setLoading(false) }
    }

    useEffect(() => {
        const check = async () => {
            const ok = await CheckUserAccess(userId, "media-project-documents")
            setAccessGranted(ok)
            if (ok) fetchData()
        }
        check()
    }, [userId])

    const filtered = data.filter(p =>
        !search ||
        (p.projectName || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.developerName || "").toLowerCase().includes(search.toLowerCase())
    )
    
    const totalDocs = filtered.reduce((sum, p) =>
        sum + (p.projectRegistrationAttachments || []).filter(d => d.forMedia === "YES").length, 0)

    if (accessGranted === null) return <ScreenLoader />
    if (!accessGranted) return <PermissionMissing />

    return (
        <PageContent>
            <div className="mg">
                {loading && <ScreenLoader />}
                <Container fluid>
                    <Breadcrumbs title="Project Data" breadcrumbItem="Media Documents" />

                    <div className="mg-hdr">
                        <div>
                            {/* <div className="mg-hdr-title">📹 Media Documents</div> */}
                            <div className="mg-hdr-sub">{filtered.length} project{filtered.length !== 1 ? "s" : ""} · {totalDocs} document{totalDocs !== 1 ? "s" : ""}</div>
                        </div>
                        <span className="mg-hdr-badge">Media Dept</span>
                    </div>

                    <div className="mg-search">
                        <MdSearch size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                        <input className="mg-search-input" placeholder="Search project or builder…"
                            value={search} onChange={e => setSearch(e.target.value)} />
                        {search && (
                            <button onClick={() => setSearch("")}
                                style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", fontSize: 14, lineHeight: 1 }}>✕</button>
                        )}
                        <span className="mg-count-chip">
                            <MdFilterList size={12} style={{ verticalAlign: "middle", marginRight: 2 }} />
                            {filtered.length}/{data.length}
                        </span>
                    </div>

                    {!loading && filtered.length === 0 ? (
                        <div className="mg-empty">
                            <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 4 }}>
                                {search ? "No results found" : "No Media Documents"}
                            </div>
                            <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                                {search ? `No projects match "${search}"` : "No documents available for Media department yet."}
                            </div>
                        </div>
                    ) : (
                        <div className="mg-grid">
                            {filtered.map((p, i) => (
                                <ProjectCard key={i} project={p} onViewDocs={setModalProject} />
                            ))}
                        </div>
                    )}
                </Container>

                {modalProject && (
                    <DocsModal project={modalProject} onClose={() => setModalProject(null)} />
                )}
            </div>
        </PageContent>
    )
}