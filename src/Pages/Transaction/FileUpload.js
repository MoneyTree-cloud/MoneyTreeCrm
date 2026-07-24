import { useEffect, useState, useRef } from "react";
import { Container } from "reactstrap";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useLocation, useNavigate } from "react-router-dom";
import { usePost } from "../../Hooks/useApi";
import { toast } from "react-toastify";
import { DELETE_UPLOADED_FILE, SHOW_UPLOADED_FILE, UPLOAD_FILE_AGAINST_SALE } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { MdDelete } from "react-icons/md";
import { FaFilePdf, FaArrowLeft, FaSave } from "react-icons/fa";
import ImageModal from "../../components/Common/ImageModal";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import PageContent from "../../components/Common/PageContent";
import AppTable from "../../components/Common/Table";
import { formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import Select from "react-select";

// ── Styles ─────────────────────────────────────────────────────────────────────
if (document.getElementById("fu-s")) document.getElementById("fu-s").remove()
const _s = document.createElement("style")
_s.id = "fu-s"
_s.textContent = `
    .fu-card { background:#fff; border:1px solid #D1D5DB; border-radius:14px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.06); margin-bottom:16px; }
    .fu-card-hdr { background:linear-gradient(135deg,#005B52,#007A6E); padding:13px 20px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .fu-card-hdr-title { font-size:14px; font-weight:800; color:#fff; }
    .fu-card-hdr-sub   { font-size:11px; color:rgba(255,255,255,.65); margin-top:1px; }
    .fu-card-body { padding:18px 20px; }

    .fu-row { display:grid; grid-template-columns:1fr 1fr 1fr auto; gap:12px 16px; align-items:end; }
    @media(max-width:900px){ .fu-row { grid-template-columns:1fr 1fr; } }
    @media(max-width:560px){ .fu-row { grid-template-columns:1fr; } }

    .fu-label { font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:.4px; margin-bottom:4px; display:block; }
    .fu-input { width:100%; height:38px; padding:0 11px; border:1.5px solid #374151; border-radius:8px; font-size:13px; color:#0F172A; outline:none; background:#fff; transition:border-color .15s; }
    .fu-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }
    .fu-input.readonly { background:#F1F5F9; color:#64748B; border-color:#CBD5E1; cursor:default; }
    .fu-file { width:100%; height:38px; padding:6px 10px; border:1.5px solid #374151; border-radius:8px; font-size:12px; cursor:pointer; }
    .fu-note { font-size:10px; color:${defaultTheme.redColor}; margin-top:4px; font-weight:600; }

    .fu-sel .react-select__control { min-height:38px !important; border:1.5px solid #374151 !important; border-radius:8px !important; font-size:13px !important; }
    .fu-sel .react-select__control--is-focused { border-color:#005B52 !important; box-shadow:0 0 0 3px rgba(0,91,82,.08) !important; }

    .fu-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 18px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; border:none; transition:all .15s; white-space:nowrap; }
    .fu-btn-primary   { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; }
    .fu-btn-primary:hover { opacity:.88; }
    .fu-btn-secondary { background:#F1F5F9; color:#374151; border:1.5px solid #D1D5DB; }
    .fu-btn-secondary:hover { background:#E2E8F0; }
    .fu-btn-group { display:flex; gap:8px; }
`
document.head.appendChild(_s)

const SEL_STYLES = {
  control: (b, st) => ({ ...b, minHeight: 38, fontSize: 13, border: `1.5px solid ${st.isFocused ? "#005B52" : "#374151"}`, borderRadius: 8, boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.08)" : "none" }),
  option: (b, st) => ({ ...b, fontSize: 13, background: st.isSelected ? "#005B52" : st.isFocused ? "#f0fdf9" : "#fff", color: st.isSelected ? "#fff" : "#0F172A" }),
  menuPortal: b => ({ ...b, zIndex: 9999 }),
}

const fileTypeOptions = [
  { value: 'Acknowledgement', label: 'Acknowledgement' },
  { value: 'Approval', label: 'Approval' },
  { value: 'BBA', label: 'BBA' },
  { value: 'Booking Form', label: 'Booking Form' },
  { value: 'Receiving', label: 'Receiving' },
  { value: 'Others', label: 'Others' },
]

const isRestricted = (code) => ['1357', '1431', '1240', '1585', '2099', '20019'].includes(code)

export default function FileUpload() {
  const navigation = useNavigate()
  const loc = useLocation()
  const fileInputRef = useRef(null)
  const { empCode } = useUserStore(s => s.user)

  const { saleId, formState: formState_, page, searchByGroupSelect, searchTerm, builder, project } = loc.state || {}

  const [fileList, setFileList] = useState([])
  const [currentImage, setCurrentImage] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [formState, setFormState] = useState({ mtrsNo: "", saleUpload: null, fileType: null })

  const toggleModal = () => setModalOpen(p => !p)

  const { isPending: getLoading, mutate: mutateGet } = usePost(SHOW_UPLOADED_FILE + saleId, {
    onSuccess: res => { if (res?.data.status === 1) setFileList(res?.data?.data); else toast.error(res.data.message) },
    onError: err => toast.error(err.message),
  })

  useEffect(() => {
    mutateGet()
    if (saleId) setFormState(p => ({ ...p, mtrsNo: saleId || "" }))
  }, [saleId, mutateGet])

  const { isPending: addLoading, mutate: uploadFileData } = usePost(UPLOAD_FILE_AGAINST_SALE, {
    onSuccess: res => {
      if (res?.data.status === 1) {
        toast.success(res.data.message); mutateGet()
        if (fileInputRef.current) fileInputRef.current.value = ""
        setFormState(p => ({ ...p, saleUpload: null, fileType: null }))
      } else toast.error(res.data.message)
    },
    onError: err => toast.error(err.message),
  })

  const handleSave = () => {
    if (!formState.mtrsNo) { toast.error("Unique ID Is Required."); return }
    if (!formState.fileType) { toast.error("Please Select File Type."); return }
    if (!formState.saleUpload) { toast.error("Please Upload A File."); return }
    const fd = new FormData()
    fd.append("saleId", formState.mtrsNo)
    fd.append("fileType", formState.fileType.value)
    fd.append("Attachment", formState.saleUpload)
    uploadFileData(fd)
  }

  const handleCancel = () => navigation("/sales-entry-new", {
    state: { formState_, page_: page, searchByGroupSelect_: searchByGroupSelect, searchTerm_: searchTerm, builder, project }
  })

  const handleViewFile = (fileName) => {
    const ext = fileName?.split(".").pop().toLowerCase()
    const url = imageBaseUrl + fileName
    if (ext === "pdf") window.open(url, "_blank")
    else if (ext === "heic" || ext === "msg") {
      const a = Object.assign(document.createElement("a"), { href: url, download: fileName })
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
    } else { setCurrentImage(url); toggleModal() }
  }

  const handleDeleteClick = id => {
    if (!window.confirm("Delete this file?")) return
    ApiClient.post(DELETE_UPLOADED_FILE + saleId + '&fileId=' + id)
      .then(res => { setIsPending(false); if (res?.data?.status === 1) { toast.success(res.data.message); mutateGet() } else toast.error(res.data.message) })
      .catch(err => { setIsPending(false); toast.error(err.message) })
  }

  const columns = [
    { name: <span className="font-weight-bold fs-13">SL No.</span>, selector: (_, i) => i + 1, width: "8%" },
    {
      name: <span className="font-weight-bold fs-13">File</span>,
      cell: row => <FaFilePdf size={18} onClick={() => handleViewFile(row.fileName)} style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }} />
    },
    {
      name: <span className="font-weight-bold fs-13">Uploaded Date & Time</span>, selector: row => formatDateTime(row.createdDate), sortable: true,
      cell: row => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">File Type</span>, selector: row => row.fileType, sortable: true,
      cell: row => <WordWrapCell>{row.fileType}</WordWrapCell>
    },
    ...(!isRestricted(empCode) ? [{
      name: <span className="font-weight-bold fs-13">Action</span>,
      cell: row => <MdDelete title="Delete File" onClick={() => handleDeleteClick(row.fileId)} style={{ cursor: "pointer", color: "#EF4444" }} size={20} />,
    }] : []),
  ]

  return (
    <PageContent>
      <Container fluid>
        <Breadcrumbs title="Sale Entry" breadcrumbItem="File Upload" />
        {(addLoading || getLoading || isPending) && <ScreenLoader />}

        <div className="fu-card">
          {/* Header */}
          <div className="fu-card-hdr">
            <div>
              <div className="fu-card-hdr-title">📎 File Upload</div>
              {saleId && <div className="fu-card-hdr-sub">Unique ID: {saleId}</div>}
            </div>
            <button type="button" className="fu-btn fu-btn-secondary"
              style={{ border: "1.5px solid rgba(255,255,255,.35)", background: "rgba(255,255,255,.12)", color: "#fff" }}
              onClick={handleCancel}>
              <FaArrowLeft size={11} /> Back
            </button>
          </div>
          {empCode !== '20019'
            &&
            <div className="fu-card-body">
              <form>
                <div className="fu-row">
                  {/* Unique ID (read-only) */}
                  <div>
                    <label className="fu-label">Unique ID</label>
                    <input className="fu-input readonly" readOnly type="text"
                      value={formState.mtrsNo} placeholder="Unique ID" />
                  </div>

                  {/* File Type */}
                  <div>
                    <label className="fu-label">File Type <RequiredStar /></label>
                    <div className="fu-sel">
                      <Select value={formState.fileType} isClearable
                        onChange={val => setFormState(p => ({ ...p, fileType: val }))}
                        options={fileTypeOptions} styles={SEL_STYLES} menuPortalTarget={document.body} />
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="fu-label">File <RequiredStar /></label>
                    <input type="file" className="fu-file" accept=".pdf,image/*" ref={fileInputRef}
                      onChange={e => setFormState(p => ({ ...p, saleUpload: e.target.files[0] }))} />
                    <div className="fu-note">Max size: 25 MB</div>
                  </div>

                  {/* Actions */}
                  <div className="fu-btn-group" style={{ paddingBottom: 22 }}>
                    {empCode !== '1585' && (
                      <button type="button" className="fu-btn fu-btn-primary" onClick={handleSave}>
                        <FaSave size={11} /> Save
                      </button>
                    )}
                    <button type="button" className="fu-btn fu-btn-secondary" onClick={handleCancel}>
                      <FaArrowLeft size={11} /> Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          }
        </div>

        <AppTable
          progressPending={getLoading}
          columns={columns}
          data={fileList}
          pagination
        />
      </Container>

      <ImageModal isOpen={modalOpen} toggle={toggleModal} imageSrc={currentImage} />
    </PageContent>
  )
}