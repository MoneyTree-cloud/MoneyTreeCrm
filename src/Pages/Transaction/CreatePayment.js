import { useEffect, useRef, useState } from "react";
import { Container, Form } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";
import { usePost } from "../../Hooks/useApi";
import { CREATE_PAYMENT_SALE } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import PageContent from "../../components/Common/PageContent";
import { RequiredStar } from "../../helpers/function_helper";
import { FaArrowLeft, FaCheck } from "react-icons/fa";

// ── Inject shared styles (same tokens as UpdatePayment) ───────────────────────
if (document.getElementById("cp-s")) document.getElementById("cp-s").remove()
const _s = document.createElement("style")
_s.id = "cp-s"
_s.textContent = `
    .cp-card { background:#fff; border:1px solid #D1D5DB; border-radius:14px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.06); margin-bottom:16px; }
    .cp-card-hdr { background:linear-gradient(135deg,#005B52,#007A6E); padding:14px 22px; }
    .cp-card-hdr-title { font-size:14px; font-weight:800; color:#fff; }
    .cp-card-hdr-sub   { font-size:11px; color:rgba(255,255,255,.65); margin-top:2px; }
    .cp-card-body { padding:20px 22px; }

    /* Section separator */
    .cp-sec { display:flex; align-items:center; gap:8px; margin:18px 0 12px; }
    .cp-sec:first-child { margin-top:0; }
    .cp-sec-dot   { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
    .cp-sec-label { font-size:9px; font-weight:800; color:#374151; text-transform:uppercase; letter-spacing:.8px; }
    .cp-sec-line  { flex:1; height:1px; background:#E5E7EB; }

    /* Grid */
    .cp-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px 16px; }
    @media(max-width:900px){ .cp-grid { grid-template-columns:repeat(2,1fr); } }
    @media(max-width:560px){ .cp-grid { grid-template-columns:1fr; } }
    .cp-span2 { grid-column:span 2; }

    /* Field */
    .cp-label { font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:.4px; margin-bottom:4px; display:block; }
    .cp-input { width:100%; height:38px; padding:0 11px; border:1.5px solid #374151; border-radius:8px; font-size:13px; color:#0F172A; outline:none; transition:border-color .15s; background:#fff; }
    .cp-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }
    .cp-input.readonly { background:#F1F5F9; color:#64748B; cursor:default; border-color:#CBD5E1; }
    textarea.cp-input  { height:auto; padding:8px 11px; resize:vertical; }
    .cp-err { font-size:11px; color:#EF4444; margin-top:3px; }

    /* Select */
    .cp-sel .react-select__control { min-height:38px !important; border:1.5px solid #374151 !important; border-radius:8px !important; font-size:13px !important; }
    .cp-sel .react-select__control--is-focused { border-color:#005B52 !important; box-shadow:0 0 0 3px rgba(0,91,82,.08) !important; }

    /* File */
    .cp-file { width:100%; height:38px; padding:6px 10px; border:1.5px solid #374151; border-radius:8px; font-size:12px; cursor:pointer; }

    /* Buttons */
    .cp-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 22px; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; border:none; transition:all .15s; }
    .cp-btn-primary   { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; box-shadow:0 3px 10px rgba(0,91,82,.22); }
    .cp-btn-primary:hover { opacity:.88; }
    .cp-btn-secondary { background:#F1F5F9; color:#374151; border:1.5px solid #D1D5DB; }
    .cp-btn-secondary:hover { background:#E2E8F0; }
`
document.head.appendChild(_s)

const SEL_STYLES = {
    control: (b, st) => ({ ...b, minHeight: 38, fontSize: 13, border: `1.5px solid ${st.isFocused ? "#005B52" : "#374151"}`, borderRadius: 8, boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.08)" : "none" }),
    option: (b, st) => ({ ...b, fontSize: 13, background: st.isSelected ? "#005B52" : st.isFocused ? "#f0fdf9" : "#fff", color: st.isSelected ? "#fff" : "#0F172A" }),
    menuPortal: b => ({ ...b, zIndex: 9999 }),
}

const Field = ({ label, required, error, children, span2 }) => (
    <div style={span2 ? { gridColumn: "span 2" } : {}}>
        <label className="cp-label">{label}{required && <RequiredStar />}</label>
        {children}
        {error && <div className="cp-err">{error}</div>}
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
]

const CreatePayment = () => {
    const navigation = useNavigate()
    const location = useLocation()
    const { rowData, formState, page, searchByGroupSelect, searchTerm, builder, project } = location.state || {}
    const fileInputRef1 = useRef(null)
    const userId = useUserStore(s => s.user.userId)

    const [formData, setFormData] = useState({
        paymentType: null, paymentMode: null, checqueNum: "", chequeDate: "", amount: "",
        clearanceStatus: null, clearenceAmount: "", clearanceDate: "",
        clientName: "", unitNum: "", MRN_Id: "", projectName: "",
        remarks: "", file1: "", file2: "", bankName: ""
    })
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (rowData) {
            setFormData(p => ({
                ...p,
                clientName: rowData.clientName || "",
                unitNum: rowData.unitName || "",
                MRN_Id: rowData.uniqueId || "",
                projectName: rowData.projectName || "",
            }))
        }
    }, [rowData])

    const handleChange = e => {
        const { name, value } = e.target
        setErrors(p => ({ ...p, [name]: undefined }))
        setFormData(p => ({ ...p, [name]: value }))
    }

    const validate = () => {
        const skip = ["clientName", "unitNum", "MRN_Id", "projectName", "clearanceDate", "file1", "file2", "clearenceAmount", "receivePaymentType"]
        const newErrors = {}
        Object.keys(formData).forEach(k => { if (!skip.includes(k) && !formData[k]) newErrors[k] = "This field is required." })
        if (formData.clearanceStatus?.value === 'Received') {
            if (!formData.clearanceDate) newErrors.clearanceDate = "This field is required."
            if (!formData.clearenceAmount) newErrors.clearenceAmount = "This field is required."
            if (!formData.file1) newErrors.file1 = "This field is required."
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const { isPending: addLoading, mutate: createPayment } = usePost(`${CREATE_PAYMENT_SALE}`, {
        onSuccess: res => {
            if (res?.data.status === 1) {
                handleClearForm(); toast.success(res.data.message)
                if (fileInputRef1.current) fileInputRef1.current.value = ""
            } else toast.error(res.data.message)
        },
        onError: err => toast.error(err.message),
    })

    const handleFileChange1 = e => {
        setFormData(p => ({ ...p, file1: e.target.files[0] }))
        setErrors(p => ({ ...p, file1: null }))
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
        fd.append("Attachment2", formData.file2)
        fd.append("transactionId", rowData?.transactionId ? rowData.transactionId : 0)
        fd.append("bankName", formData.bankName)
        createPayment(fd)
        setErrors({})
    }

    const handleSelectChange = field => opt => {
        setErrors(p => ({ ...p, [field]: undefined }))
        setFormData(p => ({ ...p, [field]: opt }))
    }

    const handleReset = () => navigation("/sales-entry-new", {
        state: { formState_: formState, page_: page, searchByGroupSelect_: searchByGroupSelect, searchTerm_: searchTerm, builder, project }
    })

    const handleClearForm = () => {
        if (rowData) {
            setFormData(p => ({
                ...p,
                paymentType: null, paymentMode: null, checqueNum: "", chequeDate: "", amount: "",
                clearanceStatus: null, clearenceAmount: "", clearanceDate: "", remarks: "", file1: "", file2: "",
                clientName: rowData.clientName || "",
                unitNum: rowData.unitName ? rowData.unitName : rowData.unitNo || "",
                MRN_Id: rowData.uniqueId || "",
                projectName: rowData.projectName || "",
                bankName: ""
            }))
        }
    }

    const isReceived = formData.clearanceStatus?.value === 'Received'

    return (
        <PageContent>
            {addLoading && <ScreenLoader />}
            <Container fluid>
                <Breadcrumbs title="Transaction" breadcrumbItem="Create Payment" />

                <div className="cp-card">
                    {/* Header */}
                    <div className="cp-card-hdr">
                        <div className="cp-card-hdr-title">💳 Create Payment</div>
                        <div className="cp-card-hdr-sub">
                            {rowData?.clientName && <span>Client: {rowData.clientName}</span>}
                            {rowData?.projectName && <span style={{ marginLeft: 12 }}>Project: {rowData.projectName}</span>}
                            {rowData?.uniqueId && <span style={{ marginLeft: 12 }}>Unique ID: {rowData.uniqueId}</span>}
                        </div>
                    </div>

                    <div className="cp-card-body">
                        <Form onSubmit={handleSubmit}>

                            {/* ── Section 1: Payment Info ── */}
                            <div className="cp-sec">
                                <span className="cp-sec-dot" style={{ background: "#005B52" }} />
                                <span className="cp-sec-label">Payment Information</span>
                                <span className="cp-sec-line" />
                            </div>
                            <div className="cp-grid">
                                <Field label="Type" required error={errors.paymentType}>
                                    <div className="cp-sel">
                                        <Select options={typeGroup} value={formData.paymentType} isClearable
                                            onChange={handleSelectChange("paymentType")}
                                            styles={SEL_STYLES} menuPortalTarget={document.body} />
                                    </div>
                                </Field>
                                <Field label="Payment Mode" required error={errors.paymentMode}>
                                    <div className="cp-sel">
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
                                    <input name="checqueNum" className="cp-input" placeholder="Cheque number"
                                        value={formData.checqueNum} onChange={handleChange} />
                                </Field>
                                <Field label="Cheque Date" required error={errors.chequeDate}>
                                    <input name="chequeDate" type="date" className="cp-input"
                                        value={formData.chequeDate} onChange={handleChange} />
                                </Field>
                                <Field label="Amount" required error={errors.amount}>
                                    <input name="amount" type="text" className="cp-input" placeholder="Amount"
                                        value={formData.amount} onChange={handleChange} />
                                </Field>
                                <Field label="Clearance Status" required error={errors.clearanceStatus}>
                                    <div className="cp-sel">
                                        <Select options={clearanceStatusGroup} value={formData.clearanceStatus} isClearable
                                            onChange={handleSelectChange("clearanceStatus")}
                                            styles={SEL_STYLES} menuPortalTarget={document.body} />
                                    </div>
                                </Field>
                                <Field label="Clearance Amount" required={isReceived} error={errors.clearenceAmount}>
                                    <input name="clearenceAmount" type="text" className="cp-input" placeholder="Clearance amount"
                                        value={formData.clearenceAmount} onChange={handleChange} />
                                </Field>
                                <Field label="Clearance Date" required={isReceived} error={errors.clearanceDate}>
                                    <input name="clearanceDate" type="date" className="cp-input"
                                        value={formData.clearanceDate} onChange={handleChange} />
                                </Field>
                            </div>

                            {/* ── Section 2: Reference (read-only) ── */}
                            <div className="cp-sec">
                                <span className="cp-sec-dot" style={{ background: "#C9A84C" }} />
                                <span className="cp-sec-label">Reference Details</span>
                                <span className="cp-sec-line" />
                            </div>
                            <div className="cp-grid">
                                <Field label="Client Name">
                                    <input className="cp-input readonly" readOnly value={formData.clientName} placeholder="Client Name" />
                                </Field>
                                <Field label="Unit Name">
                                    <input className="cp-input readonly" readOnly value={formData.unitNum} placeholder="Unit Number" />
                                </Field>
                                <Field label="Unique ID">
                                    <input className="cp-input readonly" readOnly value={formData.MRN_Id} placeholder="Unique ID" />
                                </Field>
                                <Field label="Project Name">
                                    <input className="cp-input readonly" readOnly value={formData.projectName} placeholder="Project Name" />
                                </Field>
                            </div>

                            {/* ── Section 3: Documents & Remarks ── */}
                            <div className="cp-sec">
                                <span className="cp-sec-dot" style={{ background: "#3B82F6" }} />
                                <span className="cp-sec-label">Documents & Remarks</span>
                                <span className="cp-sec-line" />
                            </div>
                            <div className="cp-grid">
                                <Field label="Document Upload" required={isReceived} error={errors.file1}>
                                    <input type="file" className="cp-file" ref={fileInputRef1}
                                        accept=".pdf,image/*" onChange={handleFileChange1} />
                                </Field>
                                <Field label="Remarks" required error={errors.remarks} span2>
                                    <textarea name="remarks" className="cp-input" rows={3}
                                        placeholder="Type remarks here…" value={formData.remarks} onChange={handleChange} />
                                </Field>
                            </div>

                            {/* ── Actions ── */}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #E5E7EB", marginTop: 8 }}>
                                <button type="button" className="cp-btn cp-btn-secondary" onClick={handleReset}>
                                    <FaArrowLeft size={12} /> Back
                                </button>
                                <button type="submit" className="cp-btn cp-btn-primary" onClick={handleSubmit}>
                                    <FaCheck size={12} /> Submit
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
            </Container>
        </PageContent>
    )
}

export default CreatePayment