/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { Container, Form } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";
import { defaultTheme } from "../../helpers/defaultTheme";
import { usePost } from "../../Hooks/useApi";
import { UPDATE_PAYMENT_SALE } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import PageContent from "../../components/Common/PageContent";
import { FaFilePdf, FaArrowLeft, FaCheck } from "react-icons/fa";
import { imageBaseUrl } from "../../helpers/api_helper";
import ImageModal from "../../components/Common/ImageModal";
import { RequiredStar } from "../../helpers/function_helper";

// ── Styles ─────────────────────────────────────────────────────────────────────
if (document.getElementById("up-s")) document.getElementById("up-s").remove()
const _s = document.createElement("style")
_s.id = "up-s"
_s.textContent = `
    .up-card { background:#fff; border:1px solid #D1D5DB; border-radius:14px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.06); margin-bottom:16px; }
    .up-card-hdr { background:linear-gradient(135deg,#005B52,#007A6E); padding:14px 22px; display:flex; align-items:center; gap:10px; }
    .up-card-hdr-title { font-size:14px; font-weight:800; color:#fff; }
    .up-card-hdr-sub   { font-size:11px; color:rgba(255,255,255,.65); margin-top:1px; }
    .up-card-body { padding:20px 22px; }

    .up-sec { display:flex; align-items:center; gap:8px; margin:18px 0 12px; }
    .up-sec:first-child { margin-top:0; }
    .up-sec-dot   { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
    .up-sec-label { font-size:9px; font-weight:800; color:#374151; text-transform:uppercase; letter-spacing:.8px; }
    .up-sec-line  { flex:1; height:1px; background:#E5E7EB; }

    .up-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px 16px; }
    @media(max-width:900px){ .up-grid { grid-template-columns:repeat(2,1fr); } }
    @media(max-width:560px){ .up-grid { grid-template-columns:1fr; } }
    .up-span2 { grid-column:span 2; }
    .up-span1 { grid-column:span 1; }

    .up-label { font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:.4px; margin-bottom:4px; display:block; }
    .up-input { width:100%; height:38px; padding:0 11px; border:1.5px solid #374151; border-radius:8px; font-size:13px; color:#0F172A; outline:none; transition:border-color .15s; background:#fff; }
    .up-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }
    .up-input.readonly { background:#F1F5F9; color:#64748B; cursor:default; border-color:#CBD5E1; }
    .up-input.is-invalid { border-color:#EF4444 !important; }
    textarea.up-input { height:auto; padding:8px 11px; resize:vertical; }
    .up-err { font-size:11px; color:#EF4444; margin-top:3px; }

    .up-select .react-select__control { min-height:38px !important; border:1.5px solid #374151 !important; border-radius:8px !important; font-size:13px !important; }
    .up-select .react-select__control--is-focused { border-color:#005B52 !important; box-shadow:0 0 0 3px rgba(0,91,82,.08) !important; }

    .up-file-wrap { display:flex; align-items:center; gap:8px; }
    .up-file-input { flex:1; height:38px; padding:6px 10px; border:1.5px solid #374151; border-radius:8px; font-size:12px; cursor:pointer; }

    .up-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 22px; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; border:none; transition:all .15s; }
    .up-btn-primary   { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; box-shadow:0 3px 10px rgba(0,91,82,.22); }
    .up-btn-primary:hover { opacity:.88; }
    .up-btn-secondary { background:#F1F5F9; color:#374151; border:1.5px solid #D1D5DB; }
    .up-btn-secondary:hover { background:#E2E8F0; }

    .up-info-badge { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; background:#F0FDF4; color:#166534; border:1px solid #BBF7D0; }
`
document.head.appendChild(_s)

const SEL_STYLES = {
    control: (b, st) => ({ ...b, minHeight: 38, fontSize: 13, border: `1.5px solid ${st.isFocused ? "#005B52" : "#374151"}`, borderRadius: 8, boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.08)" : "none" }),
    option: (b, st) => ({ ...b, fontSize: 13, background: st.isSelected ? "#005B52" : st.isFocused ? "#f0fdf9" : "#fff", color: st.isSelected ? "#fff" : "#0F172A" }),
    menuPortal: b => ({ ...b, zIndex: 9999 }),
}

const Field = ({ label, required, error, children }) => (
    <div>
        <label className="up-label">{label}{required && <RequiredStar />}</label>
        {children}
        {error && <div className="up-err">{error}</div>}
    </div>
)

const typeGroup = [
    { label: "Payment", value: "Payment" },
    { label: "Receive", value: "Receive" },
]
const paymentModeGroup = [
    { label: "Cheque", value: "CHEQUE" }, { label: "IMPS", value: "IMPS" },
    { label: "NEFT", value: "NEFT" }, { label: "RTGS", value: "RTGS" },
    { label: "Other", value: "OTHERS" }, { label: "UPI", value: "UPI" },
]
const clearanceStatusGroup = [
    { label: "Pending", value: "Pending" },
    { label: "Received", value: "Received" },
    { label: "Cancel/Bounce", value: "CancelOrBounce" }
]

const UpdatePayment = () => {
    const navigation = useNavigate()
    const empCode = useUserStore(s => s.user.empCode)
    const userId = useUserStore(s => s.user.userId)
    const location = useLocation()
    const { row, formState: formState_, page } = location.state || {}
    const fileInputRef1 = useRef(null)

    const [formData, setFormData] = useState({
        paymentType: null, paymentMode: null, checqueNum: "", chequeDate: "", amount: "",
        clearanceStatus: null, clearenceAmount: "", clearanceDate: "",
        clientName: "", unitNum: "", MRN_Id: "", projectName: "", remarks: "", file1: "", file2: "", bankName: ""
    })
    const [errors, setErrors] = useState({})
    const [currentImage, setCurrentImage] = useState("")
    const [modalOpen, setModalOpen] = useState(false)
    const toggleModal = () => setModalOpen(p => !p)

    useEffect(() => {
        setFormData(p => ({
            ...p,
            paymentType: typeGroup.find(i => i.value === row.type) || null,
            paymentMode: paymentModeGroup.find(i => i.value === row.modeOfPayment) || null,
            checqueNum: row.chequeNo,
            chequeDate: row.chequeDate,
            amount: row.creditAmount,
            clearanceStatus: clearanceStatusGroup.find(i => i.value === row.clearanceStatus) || null,
            clearenceAmount: row.clearanceAmount,
            clearanceDate: row.clearanceDate,
            remarks: row.remarks,
            clientName: row.clientName || "",
            unitNum: row.unitName || "",
            MRN_Id: row.uniqueId || "",
            projectName: row.projectName || "",
            bankName: row?.bankName || ""
        }))
    }, [row])

    const handleChange = e => {
        const { name, value } = e.target
        setErrors(p => ({ ...p, [name]: undefined }))
        setFormData(p => ({ ...p, [name]: value }))
    }

    const validate = () => {
        const newErrors = {}
        Object.keys(formData).forEach(key => {
            if (!["clientName", "unitNum", "MRN_Id", "projectName", "clearanceDate", "file1", "file2"].includes(key)) {
                if (!formData[key]) newErrors[key] = "This field is required."
            }
        })
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const { isPending: updateLoading, mutate: mutateUpdate } = usePost(`${UPDATE_PAYMENT_SALE}`, {
        onSuccess: res => { if (res?.data.status === 1) { handleReset(); toast.success(res.data.message) } else toast.error(res.data.message) },
        onError: err => toast.error(err.message),
    })

    const handleFileChange1 = e => {
        setFormData(p => ({ ...p, file1: e.target.files[0] }))
        setErrors(p => ({ ...p, file1: null }))
    }

    const handleSelectChange = field => opt => {
        setErrors(p => ({ ...p, [field]: undefined }))
        setFormData(p => ({ ...p, [field]: opt }))
    }

    const handleSubmit = e => {
        e.preventDefault()
        if (!validate()) { toast.error("Some mandatory fields are not filled."); return }
        const fd = new FormData()
        fd.append("login", userId)
        fd.append("type", formData?.paymentType?.value)
        fd.append("modeOfPayment", formData?.paymentMode?.value)
        fd.append("chequeNo", formData.checqueNum)
        fd.append("chequeDate", formData.chequeDate)
        fd.append("creditAmount", formData.amount)
        fd.append("clearanceStatus", formData?.clearanceStatus?.value)
        fd.append("clearanceAmount", formData.clearenceAmount)
        fd.append("clearanceDate", formData.clearanceDate)
        fd.append("saleId", formData.MRN_Id)
        fd.append("remark", formData.remarks)
        fd.append("Attachment1", formData.file1)
        fd.append("transactionId", row?.transactionId ? row.transactionId : 0)
        fd.append("bankName", formData.bankName)
        mutateUpdate(fd)
        setErrors({})
    }

    const handleReset = () => navigation("/receive-pay-details", { state: { formState_, page_: page } })

    const handleViewFile = () => {
        const ext = row?.attachement1?.split(".")?.pop()?.toLowerCase()
        const url = imageBaseUrl + row?.attachement1
        if (ext === "pdf") window.open(url, "_blank")
        else { setCurrentImage(url); toggleModal() }
    }

    const isRestricted = ["2099"].includes(empCode)

    return (
        <PageContent>
            {updateLoading && <ScreenLoader />}
            <Container fluid>
                <Breadcrumbs title="Transaction" breadcrumbItem="Update Payment" />

                <div className="up-card">
                    {/* Header */}
                    <div className="up-card-hdr">
                        <div>
                            <div className="up-card-hdr-title">💳 Update Payment</div>
                            <div className="up-card-hdr-sub">
                                {row?.clientName && <span>Client: {row.clientName}</span>}
                                {row?.projectName && <span style={{ marginLeft: 12 }}>Project: {row.projectName}</span>}
                                {row?.uniqueId && <span style={{ marginLeft: 12 }}>Unique ID: {row.uniqueId}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="up-card-body">
                        <Form onSubmit={handleSubmit}>

                            {/* ── Section 1: Payment Info ── */}
                            <div className="up-sec">
                                <span className="up-sec-dot" style={{ background: "#005B52" }} />
                                <span className="up-sec-label">Payment Information</span>
                                <span className="up-sec-line" />
                            </div>
                            <div className="up-grid">
                                <Field label="Type" required error={errors.paymentType}>
                                    <div className="up-select">
                                        <Select options={typeGroup} value={formData.paymentType} isClearable
                                            onChange={handleSelectChange("paymentType")}
                                            styles={SEL_STYLES} menuPortalTarget={document.body} />
                                    </div>
                                </Field>
                                <Field label="Payment Mode" required error={errors.paymentMode}>
                                    <div className="up-select">
                                        <Select options={paymentModeGroup} value={formData.paymentMode} isClearable
                                            onChange={handleSelectChange("paymentMode")}
                                            styles={SEL_STYLES} menuPortalTarget={document.body} />
                                    </div>
                                </Field>
                                <Field label="Bank Name" required error={errors.bankName}>
                                    <input name="bankName" className="cp-input" placeholder="Bank Name"
                                        value={formData.bankName} onChange={handleChange} />
                                </Field>
                                <Field label="Cheque / Instrument No" required error={errors.checqueNum}>
                                    <input name="checqueNum" className="up-input" placeholder="Cheque number"
                                        value={formData.checqueNum} onChange={handleChange} />
                                </Field>
                                <Field label="Cheque Date" required error={errors.chequeDate}>
                                    <input name="chequeDate" type="date" className="up-input"
                                        value={formData.chequeDate} onChange={handleChange} />
                                </Field>
                                <Field label="Amount" required error={errors.amount}>
                                    <input name="amount" type="text" className="up-input" placeholder="Amount"
                                        value={formData.amount} onChange={handleChange} />
                                </Field>
                                <Field label="Clearance Status" required error={errors.clearanceStatus}>
                                    <div className="up-select">
                                        <Select options={clearanceStatusGroup} value={formData.clearanceStatus} isClearable
                                            onChange={handleSelectChange("clearanceStatus")}
                                            styles={SEL_STYLES} menuPortalTarget={document.body} />
                                    </div>
                                </Field>
                                <Field label="Clearance Amount" required error={errors.clearenceAmount}>
                                    <input name="clearenceAmount" type="text" className={`up-input${errors.clearenceAmount ? " is-invalid" : ""}`}
                                        placeholder="Clearance amount" value={formData.clearenceAmount} onChange={handleChange} />
                                </Field>
                                <Field label="Clearance Date">
                                    <input name="clearanceDate" type="date" className="up-input"
                                        value={formData.clearanceDate} onChange={handleChange} />
                                </Field>
                            </div>

                            {/* ── Section 2: Reference Info (read-only) ── */}
                            <div className="up-sec">
                                <span className="up-sec-dot" style={{ background: "#C9A84C" }} />
                                <span className="up-sec-label">Reference Details</span>
                                <span className="up-sec-line" />
                            </div>
                            <div className="up-grid">
                                <Field label="Client Name">
                                    <input className="up-input readonly" readOnly value={formData.clientName} placeholder="Client Name" />
                                </Field>
                                <Field label="Unit Name">
                                    <input className="up-input readonly" readOnly value={formData.unitNum} placeholder="Unit Number" />
                                </Field>
                                <Field label="Unique ID">
                                    <input className="up-input readonly" readOnly value={formData.MRN_Id} placeholder="Unique ID" />
                                </Field>
                                <Field label="Project Name">
                                    <input className="up-input readonly" readOnly value={formData.projectName} placeholder="Project Name" />
                                </Field>
                            </div>

                            {/* ── Section 3: Document & Remarks ── */}
                            <div className="up-sec">
                                <span className="up-sec-dot" style={{ background: "#3B82F6" }} />
                                <span className="up-sec-label">Documents & Remarks</span>
                                <span className="up-sec-line" />
                            </div>
                            <div className="up-grid">
                                <Field label="Document Upload">
                                    <div className="up-file-wrap">
                                        <input type="file" className="up-file-input" ref={fileInputRef1}
                                            accept=".pdf,image/*" onChange={handleFileChange1} />
                                        {row?.attachement1 && (
                                            <FaFilePdf size={22} onClick={handleViewFile}
                                                style={{ cursor: "pointer", color: defaultTheme.goldColorLogo, flexShrink: 0 }}
                                                title="View current file" />
                                        )}
                                    </div>
                                </Field>
                                <div className="up-span2">
                                    <Field label="Remarks" required error={errors.remarks}>
                                        <textarea name="remarks" className="up-input" rows={3}
                                            placeholder="Type remarks here…" value={formData.remarks} onChange={handleChange} />
                                    </Field>
                                </div>
                            </div>

                            {/* ── Actions ── */}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #E5E7EB", marginTop: 8 }}>
                                <button type="button" className="up-btn up-btn-secondary" onClick={handleReset}>
                                    <FaArrowLeft size={12} /> Back
                                </button>
                                {!isRestricted && (
                                    <button type="submit" className="up-btn up-btn-primary" onClick={handleSubmit}>
                                        <FaCheck size={12} /> Submit
                                    </button>
                                )}
                            </div>
                        </Form>
                    </div>
                </div>

                <ImageModal isOpen={modalOpen} toggle={toggleModal} imageSrc={currentImage} />
            </Container>
        </PageContent>
    )
}

export default UpdatePayment