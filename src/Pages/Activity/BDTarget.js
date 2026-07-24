/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo, useEffect } from "react";
import PageContent from "../../components/Common/PageContent";
import { Container } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import Select from "react-select";
import { useGet } from "../../Hooks/useApi";
import { formatDate, WordWrapCell } from "../../helpers/function_helper";
import {
    ALL_LOCATION_DROPDOWN,
    GET_DROPDOWN_BUILDER_,
    GET_PROJECT_BY_BUILDER_,
    CREATE_BD_TARGET, UPDATE_BD_TARGET, GET_ALL_BD_TARGET,
    GET_BD_TARGET_BY_ID
} from "../../helpers/url_helper";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { MdAdd, MdEdit, MdTrendingUp, MdApartment, MdClose, MdCalendarToday, MdLocationOn, MdBusiness } from "react-icons/md";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import ScreenLoader from "../../constants/ScreenLoader";
import PermissionMissing from "../Utility/PermissonMissing";

// ── Styles ─────────────────────────────────────────────────────────────────────
if (document.getElementById("bdt-s")) document.getElementById("bdt-s").remove()
const _s = document.createElement("style")
_s.id = "bdt-s"
_s.textContent = `
   
    .bdt-hdr { background:linear-gradient(135deg,#005B52 0%,#007A6E 60%,#00897B 100%); border-radius:16px; padding:20px 26px; margin-bottom:16px; position:relative; overflow:hidden; }
    .bdt-hdr::before { content:''; position:absolute; top:-40px; right:-40px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,.05); pointer-events:none; }
    .bdt-hdr::after  { content:''; position:absolute; bottom:-50px; left:60px; width:140px; height:140px; border-radius:50%; background:rgba(255,255,255,.04); pointer-events:none; }
    .bdt-hdr-title { font-size:22px; font-weight:800; color:#fff; position:relative; display:flex; align-items:center; gap:10px; }
    .bdt-hdr-sub   { font-size:12px; color:rgba(255,255,255,.6); margin-top:4px; position:relative; }

    .bdt-table-card { background:#fff; border:1px solid #E8ECF2; border-radius:14px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.04); }
    .bdt-table-toolbar { display:flex; align-items:center; justify-content:space-between; padding:12px 18px; border-bottom:1px solid #F1F5F9; }
    .bdt-record-badge { font-size:12px; font-weight:700; color:#64748B; background:#F1F5F9; border-radius:20px; padding:4px 14px; border:1px solid #E2E8F0; }

    .bdt-add-btn { display:flex; align-items:center; gap:6px; padding:8px 18px; background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; border:none; border-radius:9px; font-size:13px; font-weight:700; cursor:pointer; transition:opacity .15s; font-family:'Plus Jakarta Sans',sans-serif; }
    .bdt-add-btn:hover { opacity:.88; }

    .bdt-fab { position:fixed; bottom:32px; right:32px; width:54px; height:54px; border-radius:50%; background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; border:none; box-shadow:0 4px 20px rgba(0,91,82,.4); cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:300; transition:transform .18s,box-shadow .18s; }
    .bdt-fab:hover { transform:scale(1.1); box-shadow:0 8px 28px rgba(0,91,82,.5); }
    .bdt-fab:active { transform:scale(.96); }

    .bdt-edit-btn { width:30px; height:30px; border-radius:7px; border:1.5px solid #E2E8F0; background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; padding:0; }
    .bdt-edit-btn:hover { border-color:#005B52; background:#f0fdf9; }

    .bdt-type-pill { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; }
    .bdt-type-pill.Turnover { background:#f0fdf9; color:#005B52; border:1px solid #005B5230; }
    .bdt-type-pill.Unit     { background:#F5F3FF; color:#5B21B6; border:1px solid #7C3AED30; }

    /* ── Blurred overlay + slide-in drawer ── */
    .bdt-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15,23,42,.5); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); z-index:9999; display:flex; align-items:flex-start; justify-content:center; padding:24px 16px; overflow-y:auto; animation:overlayIn .2s ease; }
    @keyframes overlayIn { from{opacity:0} to{opacity:1} }

    .bdt-drawer { background:#fff; border-radius:20px; width:100%; max-width:600px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 24px 60px rgba(0,0,0,.3); animation:drawerIn .25s cubic-bezier(.16,1,.3,1); margin:auto; flex-shrink:0; }
    @keyframes drawerIn { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:none} }

    .bdt-drawer-hdr { background:linear-gradient(135deg,#005B52,#007A6E); padding:18px 24px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
    .bdt-drawer-title { font-size:16px; font-weight:800; color:#fff; display:flex; align-items:center; gap:8px; }
    .bdt-drawer-close {  border-radius:50%; border:2px solid #fff; background:#fff; color:#005B52; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; flex-shrink:0; box-shadow:0 2px 8px rgba(0,0,0,.2); }
    .bdt-drawer-close:hover { background:#f0fdf9; transform:scale(1.08); }

    .bdt-drawer-body { overflow-y:visible; overflow-x:hidden; padding:24px; background:#F8FAFC; }
    .bdt-drawer-body::-webkit-scrollbar { width:5px; }
    .bdt-drawer-body::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:99px; }

    .bdt-drawer-footer { padding:14px 24px; border-top:1px solid #E8ECF2; background:#fff; display:flex; justify-content:flex-end; gap:10px; flex-shrink:0; }

    .bdt-sec { display:flex; align-items:center; gap:8px; font-size:10px; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:.8px; margin:20px 0 12px; }
    .bdt-sec:first-child { margin-top:0; }
    .bdt-sec-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .bdt-sec-line { flex:1; height:1px; background:#E2E8F0; }

    .bdt-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    @media(max-width:560px){ .bdt-form-grid { grid-template-columns:1fr; } }
    .bdt-lbl { font-size:11px; font-weight:700; color:#64748B; margin-bottom:5px; display:block; letter-spacing:.3px; text-transform:uppercase; }
    .bdt-input { width:100%; height:40px; padding:0 12px; border:1.5px solid #E2E8F0; border-radius:10px; font-size:13px; color:#0F172A; outline:none; font-family:'Plus Jakarta Sans',sans-serif; transition:border-color .15s,box-shadow .15s; background:#fff; }
    .bdt-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }

    .bdt-radio-group { display:flex; gap:8px; }
    .bdt-radio-pill { display:flex; align-items:center; gap:7px; padding:9px 18px; border-radius:22px; cursor:pointer; font-size:13px; font-weight:600; border:1.5px solid #E2E8F0; background:#F8FAFC; color:#64748B; transition:all .15s; user-select:none; }
    .bdt-radio-pill input { display:none; }
    .bdt-radio-pill.t.on  { border-color:#005B52; background:#f0fdf9; color:#005B52; }
    .bdt-radio-pill.u.on  { border-color:#7C3AED; background:#F5F3FF; color:#5B21B6; }
    .bdt-radio-dot { width:8px; height:8px; border-radius:50%; background:currentColor; opacity:0; transition:opacity .15s; flex-shrink:0; }
    .bdt-radio-pill.on .bdt-radio-dot { opacity:1; }

    .bdt-target-box { border-radius:12px; padding:14px 16px; margin-top:12px; }
    .bdt-target-box.t { border:1.5px solid #005B5228; background:linear-gradient(135deg,#f0fdf9,#e6f7f5); }
    .bdt-target-box.u { border:1.5px solid #7C3AED28; background:linear-gradient(135deg,#F5F3FF,#EDE9FE); }
    .bdt-target-box-lbl { font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; display:flex; align-items:center; gap:6px; }

    .bdt-save-btn { display:flex; align-items:center; gap:6px; padding:10px 24px; background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:opacity .15s; }
    .bdt-save-btn:disabled { opacity:.5; cursor:not-allowed; }
    .bdt-cancel-btn { padding:10px 20px; background:#F1F5F9; color:#475569; border:none; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; }
    .bdt-cancel-btn:hover { background:#E2E8F0; }

    @keyframes spin { to { transform:rotate(360deg); } }

     /* ── Responsive ── */
 
    /* Tablet landscape (≤1024px) */
    @media(max-width:1024px){
        .bdt-hdr { padding:16px 20px; border-radius:14px; }
        .bdt-hdr-title { font-size:20px; }
        .bdt-table-toolbar { padding:10px 16px; }
        .bdt-drawer { max-width:520px; }
    }
 
    /* Tablet portrait (≤768px) */
    @media(max-width:768px){
        .bdt-hdr { padding:14px 16px; border-radius:12px; margin-bottom:12px; }
        .bdt-hdr-title { font-size:18px; gap:8px; }
        .bdt-hdr-sub { font-size:11px; }
        .bdt-table-card { border-radius:12px; }
        .bdt-table-toolbar { flex-wrap:wrap; gap:8px; padding:10px 14px; }
        .bdt-add-btn { padding:7px 14px; font-size:12px; }
        .bdt-drawer { max-width:100%; border-radius:16px; }
        .bdt-drawer-hdr { padding:14px 18px; }
        .bdt-drawer-title { font-size:14px; }
        .bdt-drawer-body { padding:18px; }
        .bdt-drawer-footer { padding:12px 18px; }
        .bdt-fab { bottom:20px; right:20px; width:48px; height:48px; }
    }
 
    /* Mobile (≤560px) */
    @media(max-width:560px){
        .bdt-hdr { padding:12px 14px; border-radius:10px; }
        .bdt-hdr-title { font-size:16px; }
        .bdt-hdr-sub { font-size:10px; }
        .bdt-table-toolbar { padding:8px 12px; }
        .bdt-record-badge { font-size:11px; padding:3px 10px; }
        .bdt-add-btn { padding:7px 12px; font-size:11px; }
        .bdt-drawer { border-radius:14px; }
        .bdt-drawer-hdr { padding:12px 16px; }
        .bdt-drawer-title { font-size:13px; gap:6px; }
        .bdt-drawer-close { width:28px; height:28px; }
        .bdt-drawer-body { padding:14px; }
        .bdt-form-grid { grid-template-columns:1fr; gap:10px; }
        .bdt-drawer-footer { padding:10px 14px; gap:8px; }
        .bdt-save-btn { padding:9px 18px; font-size:12px; flex:1; justify-content:center; }
        .bdt-cancel-btn { padding:9px 14px; font-size:12px; flex:1; text-align:center; }
        .bdt-sec { font-size:9px; margin:14px 0 10px; }
        .bdt-lbl { font-size:10px; }
        .bdt-input { height:38px; font-size:12px; border-radius:8px; }
        .bdt-radio-group { flex-direction:column; gap:6px; }
        .bdt-radio-pill { padding:8px 14px; font-size:12px; }
        .bdt-target-box { padding:12px 14px; margin-top:10px; }
        .bdt-fab { bottom:16px; right:16px; width:44px; height:44px; }
        .bdt-overlay { padding:16px 12px; }
    }
 
    /* Very small (≤380px) */
    @media(max-width:380px){
        .bdt-hdr { padding:10px 12px; }
        .bdt-hdr-title { font-size:14px; }
        .bdt-drawer-body { padding:12px; }
        .bdt-input { height:36px; font-size:11px; }
        .bdt-save-btn { font-size:11px; padding:8px 14px; }
        .bdt-cancel-btn { font-size:11px; padding:8px 12px; }
        .bdt-fab { bottom:12px; right:12px; width:40px; height:40px; }
        .bdt-overlay { padding:12px 8px; }
    }
`
document.head.appendChild(_s)

const sel = {
    control: (b, st) => ({
        ...b, borderRadius: 10, minHeight: 40, fontSize: 13,
        border: `1.5px solid ${st.isFocused ? "#005B52" : "#E2E8F0"}`,
        boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.08)" : "none",
        background: "#fff",
    }),
    option: (b, st) => ({
        ...b, fontSize: 13,
        background: st.isSelected ? "#005B52" : st.isFocused ? "#f0fdf9" : "#fff",
        color: st.isSelected ? "#fff" : "#0F172A",
    }),
    menuPortal: b => ({ ...b, zIndex: 9999 }),
    placeholder: b => ({ ...b, color: "#94A3B8", fontSize: 13 }),
}

const Sec = ({ label, color = "#005B52" }) => (
    <div className="bdt-sec">
        <span className="bdt-sec-dot" style={{ background: color }} />
        {label}
        <span className="bdt-sec-line" />
    </div>
)

const emptyForm = () => ({
    branch: null, builder: null, project: null,
    fromDate: "", toDate: "",
    targetType: "Turnover",
    targetInCr: "", targetInUnit: "",
})

// ── Modal ─────────────────────────────────────────────────────────────────────
function TargetModal({ isOpen, onClose, onSaved, editRow, createdBy, userId }) {
    const [form, setForm] = useState(emptyForm())
    const [saving, setSaving] = useState(false)

    const { data: locationRaw } = useGet(ALL_LOCATION_DROPDOWN)
    const { data: builderRaw } = useGet(GET_DROPDOWN_BUILDER_)
    const { data: projectRaw } = useGet(
        `${GET_PROJECT_BY_BUILDER_}${form.builder?.value}`,
        { enabled: Boolean(form.builder?.value) }
    )

    const locationList = useMemo(() => locationRaw?.data?.data || [], [locationRaw])
    const builderList = useMemo(() => builderRaw?.data?.data || [], [builderRaw])
    const projectList = useMemo(() => projectRaw?.data?.data || [], [projectRaw])

    useEffect(() => {
        if (!isOpen) return
        if (editRow) {
            setForm({
                branch: locationList.find(l => l.label === editRow.branch) || { label: editRow.branch, value: editRow.branch },
                builder: builderList.find(b => b.label === editRow.builderName) || (editRow.builderName ? { label: editRow.builderName, value: editRow.builderId } : null),
                project: null,
                fromDate: editRow.fromDate || "",
                toDate: editRow.toDate || "",
                targetType: editRow.targetType || "Turnover",
                targetInCr: editRow.targetInCr ?? "",
                targetInUnit: editRow.targetInUnit ?? "",
            })
        } else {
            setForm(emptyForm())
        }
    }, [editRow, isOpen])

    useEffect(() => {
        if (editRow?.projectName && projectList.length > 0) {
            // API returns projectName but no projectId — match by label
            const p = projectList.find(x => x.label === editRow.projectName)
            if (p) setForm(prev => ({ ...prev, project: p }))
        }
    }, [projectList, editRow?.projectName, isOpen])

    const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
    const isEdit = !!editRow

    const handleSubmit = async () => {
        if (!form.branch) { toast.error("Branch is required"); return }
        if (!form.fromDate) { toast.error("From Date is required"); return }
        if (!form.toDate) { toast.error("To Date is required"); return }
        if (form.targetType === "Turnover" && !form.targetInCr) { toast.error("Target in Cr is required"); return }
        if (form.targetType === "Unit" && !form.targetInUnit) { toast.error("Target in Units is required"); return }

        const params = new URLSearchParams({
            branch: form.branch?.label || "",
            fromDate: form.fromDate,
            toDate: form.toDate,
            targetType: form.targetType,
            userId,
            ...(form.builder?.value && { builderId: form.builder.value, builderName: form.builder.label }),
            ...(form.project?.value && { projectId: form.project.value, projectName: form.project.label }),
            ...(form.targetType === "Turnover" && { targetInCr: form.targetInCr }),
            ...(form.targetType === "Unit" && { targetInUnit: form.targetInUnit }),
            ...(!isEdit && { createdBy }),
        })

        const url = isEdit
            ? `${UPDATE_BD_TARGET}/${editRow.id}?${params.toString()}`
            : `${CREATE_BD_TARGET}?${params.toString()}`

        setSaving(true)
        try {
            const res = isEdit ? await ApiClient.put(url) : await ApiClient.post(url)
            if (res?.data?.status === 1) {
                toast.success(res.data.message || (isEdit ? "Updated!" : "Created!"))
                onSaved();
                onClose()
            } else {
                toast.error(res.data.message || "Operation failed")
            }
        } catch (e) { toast.error(e.message) }
        finally { setSaving(false) }
    }

    if (!isOpen) return null

    return (
        <div className="bdt-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bdt-drawer">

                {/* Header */}
                <div className="bdt-drawer-hdr">
                    <div className="bdt-drawer-title">
                        {isEdit ? <MdEdit size={18} /> : <MdAdd size={18} />}
                        {isEdit ? `Update Target` : "New BD Target"}
                    </div>
                    <button className="bdt-drawer-close" onClick={onClose}><MdClose size={18} /></button>
                </div>

                {/* Body */}
                <div className="bdt-drawer-body">

                    {/* Location & Dates */}
                    <Sec label="Location & Dates" color="#005B52" />
                    <div className="bdt-form-grid">
                        <div>
                            <label className="bdt-lbl"><MdLocationOn size={11} style={{ verticalAlign: "middle", marginRight: 3 }} />Branch <span style={{ color: "#EF4444" }}>*</span></label>
                            <Select value={form.branch} onChange={opt => setF("branch", opt)}
                                options={locationList} isClearable menuPortalTarget={document.body}
                                styles={sel} placeholder="Select branch…" />
                        </div>
                        <div />
                        <div>
                            <label className="bdt-lbl"><MdCalendarToday size={11} style={{ verticalAlign: "middle", marginRight: 3 }} />From Date <span style={{ color: "#EF4444" }}>*</span></label>
                            <input type="date" className="bdt-input" value={form.fromDate}
                                onChange={e => setF("fromDate", e.target.value)} />
                        </div>
                        <div>
                            <label className="bdt-lbl"><MdCalendarToday size={11} style={{ verticalAlign: "middle", marginRight: 3 }} />To Date <span style={{ color: "#EF4444" }}>*</span></label>
                            <input type="date" className="bdt-input" value={form.toDate}
                                onChange={e => setF("toDate", e.target.value)} min={form.fromDate} />
                        </div>
                    </div>

                    {/* Builder & Project */}
                    <Sec label="Builder & Project" color="#C9A84C" />
                    <div className="bdt-form-grid">
                        <div>
                            <label className="bdt-lbl"><MdBusiness size={11} style={{ verticalAlign: "middle", marginRight: 3 }} />Builder</label>
                            <Select value={form.builder}
                                onChange={opt => { setF("builder", opt); setF("project", null) }}
                                options={builderList} isClearable menuPortalTarget={document.body}
                                styles={sel} placeholder="Select builder…" />
                        </div>
                        <div>
                            <label className="bdt-lbl">Project</label>
                            <Select value={form.project} onChange={opt => setF("project", opt)}
                                options={projectList} isClearable menuPortalTarget={document.body}
                                styles={sel} isDisabled={!form.builder}
                                placeholder={form.builder ? "Select project…" : "Select builder first…"} />
                        </div>
                    </div>

                    {/* Target */}
                    <Sec label="Target" color="#7C3AED" />
                    <div>
                        <label className="bdt-lbl">Target Type <span style={{ color: "#EF4444" }}>*</span></label>
                        <div className="bdt-radio-group">
                            <label className={`bdt-radio-pill t${form.targetType === "Turnover" ? " on" : ""}`}>
                                <input type="radio" checked={form.targetType === "Turnover"}
                                    onChange={() => { setF("targetType", "Turnover"); setF("targetInUnit", "") }} />
                                <span className="bdt-radio-dot" />
                                <MdTrendingUp size={15} /> Turnover
                            </label>
                            <label className={`bdt-radio-pill u${form.targetType === "Unit" ? " on" : ""}`}>
                                <input type="radio" checked={form.targetType === "Unit"}
                                    onChange={() => { setF("targetType", "Unit"); setF("targetInCr", "") }} />
                                <span className="bdt-radio-dot" />
                                <MdApartment size={15} /> Unit
                            </label>
                        </div>

                        <div className={`bdt-target-box ${form.targetType === "Turnover" ? "t" : "u"}`}>
                            {form.targetType === "Turnover" ? (
                                <>
                                    <div className="bdt-target-box-lbl">
                                        <MdTrendingUp size={13} color="#005B52" />
                                        Target in Crore (₹ Cr) <span style={{ color: "#EF4444" }}>*</span>
                                    </div>
                                    {/* <input type="number" className="bdt-input" placeholder="e.g. 10.5"
                                        value={form.targetInCr} min="0" step="0.01"
                                        onChange={e => setF("targetInCr", e.target.value)} /> */}
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className="bdt-input"
                                        value={form.targetInCr}
                                        onChange={e => {
                                            const value = e.target.value;

                                            // allow digits + optional single decimal point
                                            if (/^\d*\.?\d*$/.test(value)) {
                                                setF("targetInCr", value);
                                            }
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    <div className="bdt-target-box-lbl">
                                        <MdApartment size={13} color="#5B21B6" />
                                        Target in Units <span style={{ color: "#EF4444" }}>*</span>
                                    </div>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className="bdt-input"
                                        value={form.targetInUnit}
                                        onChange={e => {
                                            const value = e.target.value;
                                            if (/^\d*$/.test(value)) {
                                                setF("targetInUnit", value);
                                            }
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bdt-drawer-footer">
                    <button className="bdt-cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="bdt-save-btn" onClick={handleSubmit} disabled={saving}>
                        {saving
                            ? <><span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} /> Saving…</>
                            : <>{isEdit ? <MdEdit size={13} /> : <MdAdd size={13} />} {isEdit ? "Update Target" : "Create Target"}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BDTarget() {
    const { userName, empCode, userId } = useUserStore(s => s.user)
    const createdBy = `${userName} (${empCode})`

    const [modalOpen, setModalOpen] = useState(false)
    const [editRow, setEditRow] = useState(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const [accessGranted, setAccessGranted] = useState(null)

    const endpoint =
        empCode === '1' || empCode === '1670'
            ? `${GET_ALL_BD_TARGET}?v=${refreshKey}`
            : `${GET_BD_TARGET_BY_ID}${userId}&v=${refreshKey}`
    // ── Fetch all targets via useGet ──────────────────────────────────────────
    const { data: bdTargetRaw, isLoading } = useGet(endpoint, { enabled: Boolean(accessGranted) })
    const tableData = useMemo(() => bdTargetRaw?.data?.data || [], [bdTargetRaw])

    const openCreate = () => { setEditRow(null); setModalOpen(true) }
    const openEdit = (row) => { setEditRow(row); setModalOpen(true) }
    const onSaved = () => setRefreshKey(k => k + 1)

    const columns = useMemo(() => [
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            width: "60px",
            cell: (row) => (
                <button className="bdt-edit-btn" onClick={() => openEdit(row)} title="Edit">
                    <MdEdit size={15} color="#005B52" />
                </button>
            ),
        },
        { name: <span className="font-weight-bold fs-13">#</span>, width: "55px", cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Branch</span>, selector: r => r.branch, sortable: true, cell: r => <WordWrapCell>{r.branch || "—"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Builder</span>, selector: r => r.builderName, sortable: true, cell: r => <WordWrapCell>{r.builderName || "—"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Project</span>, selector: r => r.projectName, sortable: true, cell: r => <WordWrapCell>{r.projectName || "—"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">From Date</span>, selector: r => r.fromDate, sortable: true, cell: r => <WordWrapCell>{formatDate(r.fromDate) || "—"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">To Date</span>, selector: r => r.toDate, sortable: true, cell: r => <WordWrapCell>{formatDate(r.toDate) || "—"}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Target Type</span>,
            selector: r => r.targetType, sortable: true,
            cell: r => (
                <span className={`bdt-type-pill ${r.targetType || ""}`}>
                    {r.targetType === "Turnover"
                        ? <MdTrendingUp size={11} style={{ verticalAlign: "middle" }} />
                        : <MdApartment size={11} style={{ verticalAlign: "middle" }} />}
                    {" "}{r.targetType || "—"}
                </span>
            )
        },
        { name: <span className="font-weight-bold fs-13">Target (Cr)</span>, selector: r => r.targetInCr, sortable: true, cell: r => <WordWrapCell>{r.targetInCr != null ? r.targetInCr : "—"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Target (Units)</span>, selector: r => r.targetInUnit, sortable: true, cell: r => <WordWrapCell>{r.targetInUnit != null ? r.targetInUnit : "—"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Created By</span>, selector: r => r.createdBy, sortable: true, cell: r => <WordWrapCell>{r.createdBy || "—"}</WordWrapCell> },
    ], [])

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, "bd-target-screen")
            setAccessGranted(hasAccess)
        }
        checkAccess()
    }, [userId])

    if (accessGranted === null) return <ScreenLoader />
    if (!accessGranted) return <PermissionMissing />


    return (
        <PageContent>
            <div className="bdt">
                <Container fluid>
                    <Breadcrumbs title="BD" breadcrumbItem="BD Target" />

                    <div className="bdt-table-card">
                        <div className="bdt-table-toolbar">
                            <span className="bdt-record-badge">
                                {tableData.length} record{tableData.length !== 1 ? "s" : ""}
                            </span>
                            <button className="bdt-add-btn" onClick={openCreate}>
                                <MdAdd size={16} /> Add Target
                            </button>
                        </div>
                        <AppTable
                            columns={columns}
                            progressPending={isLoading}
                            data={tableData}
                            pagination
                        />
                    </div>
                </Container>

                {/* Modal */}
                <TargetModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSaved={onSaved}
                    editRow={editRow}
                    createdBy={createdBy}
                    userId={userId}
                />
            </div>
        </PageContent>
    )
}