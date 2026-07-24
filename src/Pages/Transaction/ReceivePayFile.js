import { useRef, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useGet, usePost } from "../../Hooks/useApi";
import { SHOW_UPLOADED_FILE_RECEIVE_PAY, UPLOADED_FILE_RECEIVE_PAY } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { FaFilePdf, FaArrowLeft, FaSave, FaEye } from "react-icons/fa";
import ImageModal from "../../components/Common/ImageModal";
import { imageBaseUrl } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import { formatDateTime } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";

// ── Styles ────────────────────────────────────────────────────────────────────
if (document.getElementById("rpf-s")) document.getElementById("rpf-s").remove()
const _s = document.createElement("style")
_s.id = "rpf-s"
_s.textContent = `
    .rpf * { box-sizing:border-box; }

    .rpf-card { background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:22px 24px; box-shadow:0 1px 4px rgba(0,0,0,.04); margin-bottom:16px; }
    .rpf-lbl  { font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; display:block; }
    .rpf-input {
        width:100%; height:40px; padding:0 12px; border:1.5px solid #E2E8F0;
        border-radius:9px; font-size:13px; color:#0F172A; outline:none;
        transition:border-color .15s;
        background:#fff;
    }
    .rpf-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }
    .rpf-input:read-only { background:#F8FAFC; color:#94A3B8; cursor:not-allowed; }
    .rpf-input[type="file"] { padding-top:7px; }

    .rpf-hint { font-size:10px; color:#EF4444; font-weight:500; margin-top:4px; }

    .rpf-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 20px; border-radius:9px; font-size:13px; font-weight:700; cursor:pointer; border:none; transition:all .15s; }
    .rpf-btn-primary  { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; }
    .rpf-btn-primary:hover  { opacity:.88; }
    .rpf-btn-secondary { background:#F1F5F9; color:#475569; }
    .rpf-btn-secondary:hover { background:#E2E8F0; }

    /* uploaded file card */
    .rpf-file-card { background:linear-gradient(135deg,#F0FDF4,#fff); border:1.5px solid #BBF7D0; border-radius:14px; padding:18px 20px; }
    .rpf-file-row  { display:flex; align-items:center; gap:14px; }
    .rpf-file-icon { width:44px; height:44px; border-radius:10px; background:#DCFCE7; border:1.5px solid #BBF7D0; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .rpf-file-info { flex:1; min-width:0; }
    .rpf-file-name { font-size:13px; font-weight:700; color:#0F172A; }
    .rpf-file-date { font-size:11px; color:#64748B; margin-top:2px; }
    .rpf-view-btn  { display:flex; align-items:center; gap:5px; padding:7px 14px; border-radius:8px; background:#005B52; color:#fff; border:none; font-size:12px; font-weight:700; cursor:pointer; transition:opacity .15s; }
    .rpf-view-btn:hover { opacity:.88; }
`
document.head.appendChild(_s)

export default function ReceivePayFile() {
    const navigate   = useNavigate()
    const fileInputRef = useRef(null)
    const empCode    = useUserStore(s => s.user.empCode)
    const { state }  = useLocation()
    const { transactionId, formState: formState_, page, uniqueId } = state || {}

    const [file,      setFile]      = useState(null)
    const [imgSrc,    setImgSrc]    = useState("")
    const [modalOpen, setModalOpen] = useState(false)

    const { data: fileData, isLoading: getLoading, refetch } = useGet(SHOW_UPLOADED_FILE_RECEIVE_PAY + transactionId)

    const { isPending: addLoading, mutate } = usePost(UPLOADED_FILE_RECEIVE_PAY, {
        onSuccess: (res) => {
            if (res?.data?.status === 1) {
                toast.success(res.data.message)
                refetch()
                setFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ""
            } else {
                toast.error(res.data.message)
            }
        },
        onError: (err) => toast.error(err.message),
    })

    const uploaded = fileData?.data?.data
    const hasFile  = uploaded && uploaded.paymentAttachmentPath

    const handleViewFile = () => {
        const name = uploaded?.paymentAttachmentPath || ""
        const ext  = name.split(".").pop().toLowerCase()
        const url  = imageBaseUrl + name
        if (ext === "pdf") { window.open(url, "_blank"); return }
        if (ext === "heic") {
            const a = Object.assign(document.createElement("a"), { href: url, download: name })
            document.body.appendChild(a); a.click(); document.body.removeChild(a)
            return
        }
        setImgSrc(url); setModalOpen(true)
    }

    const handleSave = () => {
        if (!file) { toast.error("Please upload a file."); return }
        const fd = new FormData()
        fd.append("transactionId", transactionId)
        fd.append("file", file)
        mutate(fd)
    }

    const handleBack = () =>
        navigate("/receive-pay-details", { state: { formState_, page_: page } })

    const canSave = empCode !== "2099" && empCode !== "20006"

    return (
        <PageContent>
            <div className="rpf">
                {(getLoading || addLoading) && <ScreenLoader />}
                <Container fluid>
                    <Breadcrumbs title="Receive Pay" breadcrumbItem="File Upload" />

                    {/* ── Form card ── */}
                    <div className="rpf-card">
                        {/* Row 1: fields */}
                        <Row className="g-3 mb-3">
                            <Col md={3}>
                                <label className="rpf-lbl">Unique ID</label>
                                <input className="rpf-input" type="text" value={uniqueId || ""} readOnly />
                            </Col>
                            <Col md={9}>
                                <label className="rpf-lbl">File Upload</label>
                                <input
                                    type="file"
                                    className="rpf-input"
                                    accept=".pdf,image/*"
                                    ref={fileInputRef}
                                    onChange={e => setFile(e.target.files[0] || null)}
                                />
                                <div className="rpf-hint">Max size: 25 MB</div>
                            </Col>
                        </Row>
                        {/* Row 2: buttons right-aligned */}
                        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:10, borderTop:"1px solid #F1F5F9" }}>
                            <button type="button" className="rpf-btn rpf-btn-secondary" onClick={handleBack}>
                                <FaArrowLeft size={13} /> Back
                            </button>
                            {canSave && (
                                <button type="button" className="rpf-btn rpf-btn-primary" onClick={handleSave}>
                                    <FaSave size={13} /> Save
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Uploaded file card ── */}
                    {hasFile && (
                        <div className="rpf-file-card">
                            <div style={{ fontSize:10, fontWeight:800, color:"#166534", textTransform:"uppercase", letterSpacing:".8px", marginBottom:12 }}>
                                ✅ Uploaded File
                            </div>
                            <div className="rpf-file-row">
                                <div className="rpf-file-icon">
                                    <FaFilePdf size={20} color="#16A34A" />
                                </div>
                                <div className="rpf-file-info">
                                    <div className="rpf-file-name">Unique ID: {uploaded.uniqueId}</div>
                                    <div className="rpf-file-date">{formatDateTime(uploaded.fileUploadDate)}</div>
                                </div>
                                <button className="rpf-view-btn" onClick={handleViewFile}>
                                    <FaEye size={13} /> View File
                                </button>
                            </div>
                        </div>
                    )}
                </Container>
            </div>

            <ImageModal isOpen={modalOpen} toggle={() => setModalOpen(p => !p)} imageSrc={imgSrc} />
        </PageContent>
    )
}