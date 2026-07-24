import { useEffect, useState, useCallback, useMemo } from "react";
import { Container, Modal, ModalBody, ModalHeader } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useGet } from "../../Hooks/useApi";
import {
    GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_,
    ADD_BUILDER, MAP_PROJECT_WITH_BUILDER,
    GET_ALL_PROJECT_REGISTRATION_DATA, PUBLISH_PROJECT_REGISTRATION, UPDATE_PROJECT_REGISTRATION,
} from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { htmlBaseURL, imageBaseUrl } from "../../helpers/api_helper";
import ApiClient from "../../helpers/api_helper";
import {
    FaCheck, FaFilePdf, FaTimes, FaEdit, FaArrowAltCircleRight,
    FaBuilding, FaProjectDiagram,
} from "react-icons/fa";
import { defaultTheme } from "../../helpers/defaultTheme";
import { MdEmail, MdMobileFriendly, MdCloudUpload, MdAdd, MdRemove } from "react-icons/md";
import { toast } from "react-toastify";
import Select from "react-select";
import { indianStates } from "../../constants/global";
import { FiPlus } from "react-icons/fi";

// ── Constants ─────────────────────────────────────────────────────────────────
const DEPT_OPTIONS = [
    { value: "Sales", label: "Sales" },
    { value: "Media", label: "Media" },
    { value: "Finance", label: "Finance" },
    { value: "OPS", label: "OPS" },
];
const DOC_TYPE_OPTIONS = [
    { value: "Builder Presentation", label: "Builder Presentation" },
    { value: "Project Video", label: "Project Video" },
    { value: "Payment Policy", label: "Payment Policy" },
    { value: "Bank Proof", label: "Bank Proof" },
    { value: "Project Presentation", label: "Project Presentation" },
];
const DC = {
    Sales: { bg: "#EEF2FF", bd: "#A5B4FC", cl: "#4338CA" },
    Media: { bg: "#FFFBEB", bd: "#FCD34D", cl: "#92400E" },
    Finance: { bg: "#F0FDF4", bd: "#86EFAC", cl: "#166534" },
    OPS: { bg: "#FDF4FF", bd: "#D8B4FE", cl: "#7E22CE" },
};

// BD options matching Builder.jsx
const BD_OPTIONS = [
    { label: "Gaurav Gautam (1247)", value: 1247 },
    { label: "Sandeep Chamyal (2065)", value: 100319 },
];

// Shared react-select styles for modal selects
const RS_STYLES = {
    control: (b, st) => ({
        ...b, borderRadius: 9, minHeight: 40, fontSize: 13,
        border: `1.5px solid ${st.isFocused ? "#005B52" : "#E2E8F0"}`,
        boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.1)" : "none",
        background: "#fff",
    }),
    option: (b, st) => ({
        ...b, fontSize: 13,
        background: st.isSelected ? "#005B52" : st.isFocused ? "#f0fdf9" : "#fff",
        color: st.isSelected ? "#fff" : "#0F172A",
    }),
    placeholder: (b) => ({ ...b, color: "#94A3B8", fontSize: 13 }),
    singleValue: (b) => ({ ...b, fontSize: 13, color: "#0F172A", fontWeight: 500 }),
    menuPortal: (b) => ({ ...b, zIndex: 9999 }),
};

// ── Inject CSS ────────────────────────────────────────────────────────────────
if (document.getElementById("proj-reg-styles")) document.getElementById("proj-reg-styles").remove();
const _s = document.createElement("style");
_s.id = "proj-reg-styles";
_s.textContent = `
    @keyframes prIn { from{opacity:0;transform:translateY(18px) scale(.98)} to{opacity:1;transform:none} }
    .pr-modal-body { animation: prIn .25s ease forwards; }

    /* ── Header action buttons ── */
    .pr-action-btn {
        display:flex; align-items:center; gap:7px;
        padding:8px 16px; border-radius:9px;
        font-size:12.5px; font-weight:700;
        cursor:pointer; transition:all .15s;
        border:none; white-space:nowrap;
    }
    .pr-action-btn.primary {
        background:linear-gradient(135deg,#005B52,#007A6E);
        color:#fff;
        box-shadow:0 2px 6px rgba(0,91,82,.25);
    }
    .pr-action-btn.primary:hover { opacity:.92; transform:translateY(-1px); }
    .pr-action-btn.secondary {
        background:linear-gradient(135deg,#B8862B,#C9A84C);
        color:#fff;
        box-shadow:0 2px 6px rgba(184,134,43,.25);
    }
    .pr-action-btn.secondary:hover { opacity:.92; transform:translateY(-1px); }

    /* ── Publish tabs ── */
    .pr-pub-tabs { display:flex; gap:4px; padding:4px; background:#F1F5F9; border-radius:12px; }
    .pr-pub-tab {
        flex:1; display:flex; align-items:center; justify-content:center; gap:7px;
        padding:8px 18px; border-radius:9px; font-size:13px; font-weight:700;
        cursor:pointer; border:none; background:transparent; color:#64748B;
        transition:all .18s; white-space:nowrap;
    }
    .pr-pub-tab:hover:not(.active) { background:rgba(255,255,255,.7); color:#334155; }
    .pr-pub-tab.active.unpublished { background:#fff; color:#1E40AF; box-shadow:0 1px 4px rgba(0,0,0,.1); }
    .pr-pub-tab.active.published   { background:#fff; color:#166534; box-shadow:0 1px 4px rgba(0,0,0,.1); }
    .pr-pub-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .pr-pub-count { padding:2px 8px; border-radius:20px; font-size:11px; font-weight:800; }
    .pr-pub-count.unpublished { background:#DBEAFE; color:#1E40AF; }
    .pr-pub-count.published   { background:#DCFCE7; color:#166534; }

    .pr-tab { padding:7px 16px; border-radius:8px; border:1.5px solid #E2E8F0; background:#fff; color:#64748B; font-size:12px; font-weight:700; cursor:pointer; transition:all .15s; white-space:nowrap; }
    .pr-tab.active { background:#005B52; border-color:#005B52; color:#fff; }
    .pr-field-group { margin-bottom:16px; }
    .pr-field-label { font-size:11px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.6px; margin-bottom:5px; display:block; }
    .pr-field-input { width:100%; padding:9px 12px; border:1.5px solid #E2E8F0; border-radius:9px; font-size:13px; color:#0F172A; outline:none; transition:border-color .15s; font-family:inherit; box-sizing:border-box; }
    .pr-field-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.1); }
    .pr-field-input.is-error { border-color:#EF4444; }
    .pr-field-error { font-size:11px; color:#EF4444; margin-top:4px; }
    .pr-section-title { font-size:13px; font-weight:800; color:#0F172A; margin:18px 0 10px; padding-bottom:7px; border-bottom:2px solid #F1F5F9; display:flex; align-items:center; gap:8px; }
    .pr-save-btn { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; border:none; border-radius:9px; padding:10px 24px; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:7px; }
    .pr-save-btn:hover { opacity:.88; }
    .pr-save-btn:disabled { opacity:.5; cursor:not-allowed; }
    .pr-doc-card { background:#fff; border:1.5px solid #E2E8F0; border-radius:12px; padding:14px 16px; margin-bottom:10px; transition:border-color .15s; }
    .pr-doc-card:hover { border-color:#C9A84C30; }
    .pr-doc-card.is-main { border-left:3px solid #005B52; }
    .pr-upload-zone { display:flex; align-items:center; gap:8px; padding:9px 12px; background:#F8FAFC; border:1.5px dashed #CBD5E1; border-radius:9px; cursor:pointer; transition:all .15s; }
    .pr-upload-zone:hover { border-color:#005B52; background:#f0fdf9; }
    .pr-dept-pill { display:inline-flex; align-items:center; gap:4px; padding:4px 11px; border-radius:20px; font-size:11px; font-weight:700; cursor:pointer; user-select:none; transition:all .15s; white-space:nowrap; border:1.5px solid #E2E8F0; background:#fff; color:#94A3B8; }
    .pr-dept-pill:hover { background:#F8FAFC; }
    .pr-add-doc-btn { width:100%; padding:10px; border:1.5px dashed #005B52; border-radius:10px; background:transparent; color:#005B52; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; transition:all .15s; }
    .pr-add-doc-btn:hover { background:#f0fdf9; }
    .pr-icon-btn { border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; outline:none; transition:all .15s; flex-shrink:0; }

    /* ── Publish action button in table ── */
    .pr-publish-btn {
        display:flex; align-items:center; gap:5px;
        padding:5px 10px; border-radius:7px; font-size:11px; font-weight:700;
        border:1.5px solid #BBF7D0; background:#F0FDF4; color:#166534;
        cursor:pointer; transition:all .15s; white-space:nowrap;
    }
    .pr-publish-btn:hover { background:#DCFCE7; border-color:#86EFAC; }

    /* ── Published badge in table ── */
    .pr-live-badge {
        display:inline-flex; align-items:center; gap:4px;
        padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700;
        background:#DCFCE7; color:#166534; border:1px solid #BBF7D0;
    }
    .custom-modal-header .btn-close { filter: invert(1); opacity: 1; }
    .project-edit-modal .modal-dialog { max-width: 1100px; width: 95%; }
    .project-edit-modal .modal-content { overflow: hidden; border-radius: 14px; }
    .project-edit-modal .modal-body { overflow-x: hidden; }
    .pr-modal-body { width: 100%; overflow-x: hidden; }
    .file-upload-wrapper { width: 100%; min-width: 0; }
    .file-upload-wrapper .file-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px; display: inline-block; vertical-align: middle; }
    .modal-backdrop.show { backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); background: rgba(15,23,42,.55); opacity:1 !important; }
`;
document.head.appendChild(_s);

// ── DocCard ───────────────────────────────────────────────────────────────────
function DocCard({ entry, index, onChange, onRemove }) {
    const inputId = `doc-file-${index}`;
    const depts = entry.departments || [];
    const isMain = entry.isMain;

    const handleFile = (file) => { if (file) onChange(index, { ...entry, newFile: file, fileName: file.name }); };
    const toggleDept = (dept) => onChange(index, { ...entry, departments: depts.includes(dept) ? depts.filter(d => d !== dept) : [...depts, dept] });
    const setDocType = (opt) => onChange(index, { ...entry, docName: opt?.value || "" });

    return (
        <div className={`pr-doc-card${isMain ? " is-main" : ""}`}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                    <Select options={DOC_TYPE_OPTIONS}
                        value={DOC_TYPE_OPTIONS.find(o => o.value === entry.docName) || null}
                        onChange={setDocType} placeholder="Select document type…"
                        isClearable menuPortalTarget={document.body}
                        styles={RS_STYLES}
                    />
                </div>
                {!isMain ? (
                    <button type="button" className="pr-icon-btn"
                        style={{ border: "1.5px solid #FECACA", background: "#FEF2F2", color: "#EF4444", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", flexShrink: 0 }}
                        onClick={() => onRemove(index)}
                        onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.borderColor = "#FCA5A5"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.borderColor = "#FECACA"; }}>
                        <MdRemove size={18} />
                    </button>
                ) : <div style={{ width: 32 }} />}
            </div>
            <label htmlFor={inputId} className="pr-upload-zone" style={{ marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, border: "1.5px dashed #CBD5E1", borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MdCloudUpload size={17} color="#94A3B8" />
                </div>
                {entry.newFile ? (
                    <span style={{ fontSize: 12, color: "#166534", fontWeight: 600, display: "flex", alignItems: "center", gap: 5, flex: 1, minWidth: 0 }}>
                        <FaFilePdf size={13} color="#16a34a" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.fileName}</span>
                    </span>
                ) : entry.existingUrl ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                        <FaFilePdf size={13} color="#EF4444" style={{ flexShrink: 0 }} />
                        <a href={`${imageBaseUrl}${entry.existingUrl}`} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 12, color: "#6366F1", fontWeight: 600, textDecoration: "none" }}
                            onClick={e => e.stopPropagation()}>View current file</a>
                        <span style={{ fontSize: 11, color: "#94A3B8" }}>· Click to replace</span>
                    </span>
                ) : (
                    <span style={{ fontSize: 12, color: "#94A3B8" }}>Click to upload file</span>
                )}
            </label>
            <input id={inputId} type="file" accept=".pdf,.jpg,.jpeg,.png,.mp4" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: ".5px", flexShrink: 0 }}>Access:</span>
                {DEPT_OPTIONS.map(opt => {
                    const on = depts.includes(opt.value);
                    const d = DC[opt.value];
                    return (
                        <span key={opt.value} className="pr-dept-pill"
                            style={{ border: `1.5px solid ${on ? d.bd : "#E2E8F0"}`, background: on ? d.bg : "#fff", color: on ? d.cl : "#94A3B8" }}
                            onClick={() => toggleDept(opt.value)}>
                            {on && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />}
                            {opt.label}
                        </span>
                    );
                })}
            </div>

            <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4, display: "block" }}>
                    Remarks
                </label>
                <textarea className="pr-field-input" rows={2}
                    placeholder="Add remarks for this document…"
                    value={entry.remarks || ""}
                    onChange={e => onChange(index, { ...entry, remarks: e.target.value })}
                    style={{ resize: "vertical", minHeight: 60, fontSize: 12 }}
                />
            </div>
        </div>
    );
}

// ── Field ─────────────────────────────────────────────────────────────────────
const Field = ({ label, fieldKey, type, half, form, setField }) => (
    <div className="pr-field-group" style={{ gridColumn: half ? "span 1" : "span 2" }}>
        <label className="pr-field-label">{label}</label>
        <input type={type || "text"} className="pr-field-input"
            value={form[fieldKey] || ""}
            onChange={e => setField(fieldKey, e.target.value)} />
    </div>
);

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ ADD BUILDER MODAL                                                        ║
// ║ Same fields/payload as Builder.jsx                                       ║
// ╚══════════════════════════════════════════════════════════════════════════╝
function AddBuilderModal({ onClose, onSaved, createdBy }) {
    const [form, setForm] = useState({
        builderName: "",
        builderNameAsPerPan: ""
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const setField = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
    };

    const validate = () => {
        const e = {};
        if (!form.builderName) e.builderName = "Builder name is required.";
        if (!form.builderNameAsPerPan) e.builderNameAsPerPan = "Builder Name As Per PAN is required.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setSaving(true);
        try {
            const params = {
                builderId: 0,
                bulderName: form.builderName,
                bulderNameAsPerPan: form.builderNameAsPerPan,
                city: "CITY",
                assignedNameBD: form.bd?.label || "",
                assignedNameCode: form.bd?.value || "",
                pin: "PIN",
                address: "ADDRESS",
                isActive: "YES",
                createdBy,
            };
            const res = await ApiClient.post(ADD_BUILDER, params);
            if (res?.data?.status === 1) {
                toast.success(res.data.message || "Builder added successfully");
                onSaved?.();
                onClose();
            } else {
                toast.error(res?.data?.message || "Failed to add builder");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to add builder");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen toggle={onClose} centered backdrop="static" keyboard={false}>
            <ModalHeader toggle={onClose} className="custom-modal-header"
                style={{
                    background: "linear-gradient(135deg,#005B52,#007A6E)",
                    borderRadius: "12px 12px 0 0", padding: "16px 24px", color: "white",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <FaBuilding size={15} color="#fff" />
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Add New Builder</span>
                </div>
            </ModalHeader>
            <ModalBody style={{ background: "#F8FAFC" }}>
                <div className="pr-modal-body">
                    <div className="pr-field-group">
                        <label className="pr-field-label">
                            Builder's Brand Name <RequiredStar />
                        </label>
                        <input type="text"
                            className={`pr-field-input ${errors.builderName ? "is-error" : ""}`}
                            placeholder="Builder's Brand Name"
                            value={form.builderName}
                            onChange={e => setField("builderName", e.target.value)} />
                        {errors.builderName && <div className="pr-field-error">{errors.builderName}</div>}
                    </div>

                    <div className="pr-field-group">
                        <label className="pr-field-label">
                            Builder's Company Name As Per PAN <RequiredStar />
                        </label>
                        <input type="text"
                            className={`pr-field-input ${errors.builderNameAsPerPan ? "is-error" : ""}`}
                            placeholder="Builder's Company Name"
                            value={form.builderNameAsPerPan}
                            onChange={e => setField("builderNameAsPerPan", e.target.value)} />
                        {errors.builderNameAsPerPan && <div className="pr-field-error">{errors.builderNameAsPerPan}</div>}
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                        <button
                            style={{ background: defaultTheme.goldColorLogo, color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button className="pr-save-btn" onClick={handleSave} disabled={saving}>
                            {saving
                                ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} />Saving…</>
                                : <><FaCheck size={12} /> Save Builder</>}
                        </button>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    );
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ ADD PROJECT MODAL                                                        ║
// ║ Same fields/payload as BuilderProject.jsx                                ║
// ╚══════════════════════════════════════════════════════════════════════════╝
function AddProjectModal({ onClose, onSaved, userId, createdBy }) {
    const [form, setForm] = useState({
        builder: null,
        projectName: "",
        projectLocation: "",
        raDueDays: "",
        raInformation: "",
        bd: null
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const { data: builderRaw, isLoading: loadingBuilders } = useGet(GET_DROPDOWN_BUILDER_);
    const builderList = useMemo(() => builderRaw?.data?.data || [], [builderRaw]);

    const setField = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
    };

    const validate = () => {
        const e = {};
        if (!form.builder) e.builder = "Builder is required.";
        if (!form.projectName) e.projectName = "Project name is required.";
        if (!form.projectLocation) e.projectLocation = "Project location is required.";
        if (!form.raInformation) e.raInformation = "AB % Information is required.";
        if (!form.bd) e.bd = "BD is required.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append("userId", userId);
            fd.append("createdBy", createdBy);
            fd.append("builderName", form.builder?.label);
            fd.append("builderId", form.builder?.value);
            fd.append("projectName", form.projectName);
            fd.append("projectLocation", form.projectLocation);
            fd.append("gstNumber", "GST");
            fd.append("netCost", 1);
            fd.append("city", "CITY");
            fd.append("state", "STATE");
            fd.append("pin", "PIN");
            fd.append("address", "ADDRESS");
            fd.append("active", "YES");
            fd.append("remark", form.raInformation || "");
            fd.append("projectTypeName", "TYPE NAME");
            fd.append("raDueDays", form.raDueDays || "");
            fd.append("assignedNameBD", form.bd?.label || "");
            fd.append("assignedNameCode", form.bd?.value || "");

            const res = await ApiClient.post(MAP_PROJECT_WITH_BUILDER, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res?.data?.status === 1) {
                toast.success(res.data.message || "Project added successfully");
                onSaved?.();
                onClose();
            } else {
                toast.error(res?.data?.message || "Failed to add project");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to add project");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen toggle={onClose} centered backdrop="static" keyboard={false}>
            <ModalHeader toggle={onClose} className="custom-modal-header"
                style={{
                    background: "linear-gradient(135deg,#005B52,#007A6E)",
                    borderRadius: "12px 12px 0 0", padding: "16px 24px", color: "white",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <FaProjectDiagram size={15} color="#fff" />
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Add New Project</span>
                </div>
            </ModalHeader>
            <ModalBody style={{ background: "#F8FAFC" }}>
                <div className="pr-modal-body">
                    <div className="pr-field-group">
                        <label className="pr-field-label">
                            Select Builder <RequiredStar />
                        </label>
                        <Select
                            isClearable
                            menuPortalTarget={document.body}
                            value={form.builder}
                            onChange={(opt) => setField("builder", opt)}
                            options={Array.isArray(builderList) ? builderList : []}
                            placeholder={loadingBuilders ? "Loading builders…" : "Select builder…"}
                            isLoading={loadingBuilders}
                            styles={RS_STYLES}
                        />
                        {errors.builder && <div className="pr-field-error">{errors.builder}</div>}
                    </div>

                    <div className="pr-field-group">
                        <label className="pr-field-label">
                            Project Name <RequiredStar />
                        </label>
                        <input type="text"
                            className={`pr-field-input ${errors.projectName ? "is-error" : ""}`}
                            placeholder="Enter project name…"
                            value={form.projectName}
                            onChange={e => setField("projectName", e.target.value)} />
                        {errors.projectName && <div className="pr-field-error">{errors.projectName}</div>}
                    </div>

                    <div className="pr-field-group">
                        <label className="pr-field-label">
                            BD <RequiredStar />
                        </label>
                        <Select
                            isClearable
                            menuPortalTarget={document.body}
                            value={form.bd}
                            onChange={(opt) => setField("bd", opt)}
                            options={BD_OPTIONS}
                            placeholder="Select BD…"
                            styles={RS_STYLES}
                        />
                        {errors.bd && <div className="pr-field-error">{errors.bd}</div>}
                    </div>

                    <div className="pr-field-group">
                        <label className="pr-field-label">
                            Project Location (Sector, City Location etc.)<RequiredStar />
                        </label>
                        <input type="text"
                            className={`pr-field-input ${errors.projectLocation ? "is-error" : ""}`}
                            placeholder="Enter project location…"
                            value={form.projectLocation}
                            onChange={e => setField("projectLocation", e.target.value)} />
                        {errors.projectLocation && <div className="pr-field-error">{errors.projectLocation}</div>}
                    </div>

                    <div className="pr-field-group">
                        <label className="pr-field-label">AB Due Days</label>
                        <input type="text" maxLength={3}
                            className="pr-field-input"
                            placeholder="Enter AB due days…"
                            value={form.raDueDays}
                            onChange={e => {
                                if (/^\d{0,3}$/.test(e.target.value)) {
                                    setField("raDueDays", e.target.value);
                                }
                            }} />
                    </div>
                    <div className="pr-field-group">
                        <label className="pr-field-label">
                            AB % Information <RequiredStar />
                        </label>
                        <textarea
                            className={`pr-field-input ${errors.raInformation ? "is-error" : ""}`}
                            placeholder="Enter AB % information…"
                            value={form.raInformation}
                            onChange={e => setField("raInformation", e.target.value)} />
                        {errors.raInformation && <div className="pr-field-error">{errors.raInformation}</div>}
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                        <button
                            style={{ background: defaultTheme.goldColorLogo, color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button className="pr-save-btn" onClick={handleSave} disabled={saving}>
                            {saving
                                ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} />Saving…</>
                                : <><FaCheck size={12} /> Save Project</>}
                        </button>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    );
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ EDIT MODAL — unchanged from your version                                 ║
// ╚══════════════════════════════════════════════════════════════════════════╝
function EditModal({ row, onClose, onSaved, updatedBy }) {
    const [tab, setTab] = useState("basic");
    const [saving, setSaving] = useState(false);

    const [form, setFormState] = useState({
        developerName: row?.developerName || "", projectName: row?.projectName || "",
        projectAddress: row?.projectAddress || "", bankDetails: row?.bankDetails || "",
        bankHolderName: row?.bankHolderName || "", accountNo: row?.accountNo || "",
        ifscCode: row?.ifscCode || "", gstNo: row?.gstNo || "", reraNo: row?.reraNo || "",
        managerName: row?.managerName || "", managerMobileNo: row?.managerMobileNo || "",
        managerEmail: row?.managerEmail || "", billingPersonName: row?.billingPersonName || "",
        billingPersonMobileNo: row?.billingPersonMobileNo || "", billingPersonEmail: row?.billingPersonEmail || "",
        opsPersonName: row?.opsPersonName || "", opsPersonMobileno: row?.opsPersonMobileno || "",
        opsPersonEmail: row?.opsPersonEmail || "",
        remarks: row?.remarks || "",
        projectCity: row?.projectCity || "", pinCode: String(row?.pinCode || ""),
    });

    const [reraRegistered, setReraRegistered] = useState(row?.reraNo ? "YES" : "NO");
    const [reraCertificateFile, setReraCertificateFile] = useState(null);
    const [reraCertificateExistingUrl] = useState(imageBaseUrl + (row?.reraCertificate || ""));

    const [gstCertificateFile, setGstCertificateFile] = useState(null);
    const [gstCertificateExistingUrl] = useState(imageBaseUrl + (row?.gstCertificate || ""));

    const [sapBuilder, setSapBuilder] = useState(
        row?.sapBuilderId ? { value: row.sapBuilderId, label: row.sapBuilder || row.sapBuilderId } : null
    );
    const [sapProject, setSapProject] = useState(
        row?.sapProjectId ? { value: row.sapProjectId, label: row.sapProject || row.sapProjectId } : null
    );
    const [state, setState] = useState(
        row?.state ? { value: row.state, label: row.state } : null
    );

    const { data: builderRaw } = useGet(GET_DROPDOWN_BUILDER_);
    const { data: projectRaw } = useGet(
        `${GET_PROJECT_BY_BUILDER_}${sapBuilder?.value}`,
        { enabled: Boolean(sapBuilder?.value) }
    );
    const builderList = useMemo(() => builderRaw?.data?.data || [], [builderRaw]);
    const projectList = useMemo(() => projectRaw?.data?.data || [], [projectRaw]);

    const [brochures, setBrochures] = useState(() => {
        const rows = [];
        if (row?.projectBrochure) {
            rows.push({ id: null, existingUrl: row.projectBrochure, newFile: null, fileName: "", docName: "", departments: [], isMain: true });
        }
        (row?.projectRegistrationAttachments || []).forEach(att => {
            rows.push({
                id: att.id ?? null, existingUrl: att.attachmentPath || "",
                newFile: null, fileName: "", docName: att.docName || "", isMain: false,
                remarks: att.remarks || "",
                departments: [
                    att.forSales === "YES" ? "Sales" : null,
                    att.forMedia === "YES" ? "Media" : null,
                    att.forFinance === "YES" ? "Finance" : null,
                    att.forOps === "YES" ? "OPS" : null,
                ].filter(Boolean),
            });
        });
        if (rows.length === 0) rows.push({ id: null, existingUrl: "", newFile: null, fileName: "", docName: "", departments: [], isMain: true });
        return rows;
    });

    const setField = useCallback((k, v) => setFormState(f => ({ ...f, [k]: v })), []);
    const addDoc = () => setBrochures(b => [...b, { id: null, existingUrl: "", newFile: null, fileName: "", docName: "", departments: [], remarks: "", isMain: false }]);
    const updateBrochure = (idx, val) => setBrochures(b => b.map((x, i) => i === idx ? val : x));
    const removeBrochure = (idx) => setBrochures(b => b.filter((_, i) => i !== idx));

    const handleSave = async () => {
        if (reraRegistered === "YES" && !form.reraNo?.trim()) {
            toast.error("Please enter RERA Certificate Number");
            return;
        }

        setSaving(true);
        try {
            const fd = new FormData();
            fd.append("id", row?.id);
            fd.append("updatedBy", updatedBy);
            fd.append("state", state?.value || "");

            if (sapBuilder?.value) {
                fd.append("sapBuilderId", sapBuilder.value);
                fd.append("sapBuilder", sapBuilder?.label);
            }
            if (sapProject?.value) {
                fd.append("sapProjectId", sapProject.value);
                fd.append("sapProject", sapProject?.label);
            }

            const formToSend = { ...form };
            if (reraRegistered === "NO") formToSend.reraNo = "";
            Object.entries(formToSend).forEach(([k, v]) => {
                if (v) fd.append(k, v);
            });

            if (reraRegistered === "YES") {
                fd.append("reraRegistered", "true");
                if (reraCertificateFile) fd.append("reraCertificate", reraCertificateFile);
            } else {
                fd.append("reraRegistered", "false");
            }

            if (gstCertificateFile) fd.append("gstCertificate", gstCertificateFile);

            const mainBrochure = brochures.find(b => b.isMain);
            if (mainBrochure?.newFile) fd.append("files", mainBrochure.newFile);

            fd.append("projectBrochure", "");
            fd.append("reraAttachment", "");

            brochures.filter(b => !b.isMain && b.newFile).forEach(b => fd.append("files", b.newFile));
            const deptOf = (b) => ({
                docName: b.docName || "",
                remarks: b.remarks || "",
                forSales: (b.departments || []).includes("Sales") ? "YES" : "NO",
                forMedia: (b.departments || []).includes("Media") ? "YES" : "NO",
                forFinance: (b.departments || []).includes("Finance") ? "YES" : "NO",
                forOps: (b.departments || []).includes("OPS") ? "YES" : "NO",
            });
            const attachment = brochures
                .filter(b => !b.isMain)
                .map(b => ({ id: b.newFile ? 0 : (b.id ?? 0), ...deptOf(b) }));
            fd.append("attachment", JSON.stringify(attachment));

            const res = await ApiClient.post(UPDATE_PROJECT_REGISTRATION, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res?.data?.status === 0) {
                toast.error(res.data.message || "Update failed");
                return;
            }
            toast.success(res?.data?.message || "Project updated successfully");
            onSaved();
            onClose();
        } catch (e) {
            toast.error(e?.response?.data?.message || e?.message || "Failed to update");
        } finally {
            setSaving(false);
        }
    };

    const TABS = [
        { id: "basic", label: "Basic Info" },
        { id: "contacts", label: "Contacts" },
        { id: "docs", label: "Documents" },
    ];
    const nonMain = brochures.filter(b => !b.isMain);

    const FileUploader = ({ label, optional, selectedFile, existingUrl, onPick, accept = ".pdf,image/*" }) => (
        <div>
            <label className="pr-field-label" style={{ color: "#475569" }}>
                {label}{" "}
                {optional && <span style={{ color: "#94A3B8", fontWeight: 500 }}>(Optional)</span>}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px dashed #CBD5E1", borderRadius: 9, padding: "8px 12px", background: "#fff" }}>
                <span style={{ flex: 1, fontSize: 13, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedFile?.name || (existingUrl ? "Current file uploaded" : "Choose file…")}
                </span>
                {existingUrl && !selectedFile && (
                    <a href={existingUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: "#2563EB", fontWeight: 600 }}>
                        View
                    </a>
                )}
                <label style={{ background: "#F0FDF9", color: "#005B52", border: "1px solid #005B52", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    Browse
                    <input type="file" hidden accept={accept}
                        onChange={(e) => onPick(e.target.files?.[0] || null)} />
                </label>
            </div>
        </div>
    );

    return (
        <Modal isOpen toggle={onClose} size="xl" centered scrollable
            backdrop="static" className="project-edit-modal">
            <ModalHeader toggle={onClose} className="custom-modal-header"
                style={{ background: "linear-gradient(135deg,#005B52,#007A6E)", borderRadius: "12px 12px 0 0", padding: "16px 24px", color: "white" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <FaEdit size={15} color="#fff" />
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>
                        Edit Project — {row?.projectName}
                    </span>
                </div>
            </ModalHeader>

            <ModalBody style={{ padding: 0, background: "#F8FAFC", overflowX: "hidden" }}>
                <div className="pr-modal-body" style={{ width: "100%", overflowX: "hidden" }}>
                    <div style={{ display: "flex", gap: 8, padding: "14px 24px 0", background: "#fff", borderBottom: "1px solid #E2E8F0" }}>
                        {TABS.map(t => (
                            <button key={t.id}
                                className={`pr-tab ${tab === t.id ? "active" : ""}`}
                                onClick={() => setTab(t.id)}>
                                {t.label}
                                {t.id === "docs" && (
                                    <span style={{ marginLeft: 6, background: tab === "docs" ? "rgba(255,255,255,.25)" : "#EEF2FF", color: tab === "docs" ? "#fff" : "#4338CA", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 800 }}>
                                        {brochures.length - 1}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: "20px 24px" }}>
                        {tab === "basic" && (
                            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "14px 16px" }}>
                                <Field label="BD Builder" fieldKey="developerName" half form={form} setField={setField} />
                                <Field label="BD Project" fieldKey="projectName" half form={form} setField={setField} />

                                <div>
                                    <label className="pr-field-label" style={{ color: "#475569" }}>SAP Builder</label>
                                    <Select options={Array.isArray(builderList) ? builderList : []}
                                        value={sapBuilder}
                                        onChange={opt => { setSapBuilder(opt); setSapProject(null); }}
                                        isClearable menuPortalTarget={document.body}
                                        placeholder="Select SAP builder…"
                                        styles={RS_STYLES} />
                                </div>
                                <div>
                                    <label className="pr-field-label" style={{ color: "#475569" }}>SAP Project</label>
                                    <Select options={Array.isArray(projectList) ? projectList : []}
                                        value={sapProject} onChange={setSapProject}
                                        isClearable isDisabled={!sapBuilder}
                                        menuPortalTarget={document.body}
                                        placeholder={sapBuilder ? "Select SAP project…" : "— select builder first —"}
                                        styles={{
                                            ...RS_STYLES,
                                            control: (b, st) => ({
                                                ...RS_STYLES.control(b, st),
                                                background: sapBuilder ? "#fff" : "#F8FAFC",
                                                opacity: sapBuilder ? 1 : .65,
                                            }),
                                        }} />
                                </div>

                                <Field label="Project Address" fieldKey="projectAddress" form={form} setField={setField} />
                                <Field label="City" fieldKey="projectCity" half form={form} setField={setField} />
                                <Field label="PIN code" fieldKey="pinCode" half form={form} setField={setField} />

                                <div>
                                    <label className="pr-field-label" style={{ color: "#475569" }}>State</label>
                                    <Select options={indianStates}
                                        value={state} onChange={setState}
                                        isClearable menuPortalTarget={document.body}
                                        placeholder="Select State..."
                                        styles={RS_STYLES} />
                                </div>

                                <Field label="GST No." fieldKey="gstNo" half form={form} setField={setField} />

                                <FileUploader label="Upload GST Certificate" optional
                                    selectedFile={gstCertificateFile}
                                    existingUrl={gstCertificateExistingUrl}
                                    onPick={setGstCertificateFile} />

                                <div>
                                    <label className="pr-field-label" style={{ color: "#475569" }}>
                                        RERA Registered? <span style={{ color: "#DC2626" }}>*</span>
                                    </label>
                                    <div style={{ display: "inline-flex", background: "#F1F5F9", borderRadius: 999, padding: 3, border: "1px solid #E2E8F0" }}>
                                        {["YES", "NO"].map((opt) => (
                                            <button key={opt} type="button"
                                                onClick={() => {
                                                    setReraRegistered(opt);
                                                    if (opt === "NO") {
                                                        setField("reraNo", "");
                                                        setReraCertificateFile(null);
                                                    }
                                                }}
                                                style={{
                                                    border: "none",
                                                    background: reraRegistered === opt ? "#005B52" : "transparent",
                                                    color: reraRegistered === opt ? "#fff" : "#475569",
                                                    borderRadius: 999, padding: "7px 22px",
                                                    fontSize: 13, fontWeight: 700,
                                                    cursor: "pointer", transition: "all .15s",
                                                }}>
                                                {opt === "YES" ? "Yes" : "No"}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {reraRegistered === "YES" && (
                                    <>
                                        <div>
                                            <Field label="RERA Certificate Number" fieldKey="reraNo" half form={form} setField={setField} />
                                        </div>
                                        <FileUploader label="Upload RERA Certificate" optional
                                            selectedFile={reraCertificateFile}
                                            existingUrl={reraCertificateExistingUrl}
                                            onPick={setReraCertificateFile} />
                                    </>
                                )}
                            </div>
                        )}

                        {tab === "contacts" && (
                            <>
                                <div className="pr-section-title"><span style={{ fontSize: 16 }}>👤</span> Manager</div>
                                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "0 16px" }}>
                                    <Field label="Name" fieldKey="managerName" half form={form} setField={setField} />
                                    <Field label="Mobile" fieldKey="managerMobileNo" half form={form} setField={setField} />
                                    <Field label="Email" fieldKey="managerEmail" half form={form} setField={setField} />
                                </div>
                                <div className="pr-section-title"><span style={{ fontSize: 16 }}>💳</span> Billing Person</div>
                                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "0 16px" }}>
                                    <Field label="Name" fieldKey="billingPersonName" half form={form} setField={setField} />
                                    <Field label="Mobile" fieldKey="billingPersonMobileNo" half form={form} setField={setField} />
                                    <Field label="Email" fieldKey="billingPersonEmail" half form={form} setField={setField} />
                                </div>
                                <div className="pr-section-title"><span style={{ fontSize: 16 }}>⚙️</span> OPS Person</div>
                                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "0 16px" }}>
                                    <Field label="Name" fieldKey="opsPersonName" half form={form} setField={setField} />
                                    <Field label="Mobile" fieldKey="opsPersonMobileno" half form={form} setField={setField} />
                                    <Field label="Email" fieldKey="opsPersonEmail" half form={form} setField={setField} />
                                </div>
                            </>
                        )}

                        {tab === "docs" && (
                            <div>
                                {nonMain.length > 0 && (
                                    <div style={{ marginTop: 16 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#C9A84C", display: "inline-block" }} />
                                            Additional Documents ({nonMain.length})
                                        </div>
                                        {brochures.map((b, i) => b.isMain ? null : (
                                            <DocCard key={i} entry={b} index={i} onChange={updateBrochure} onRemove={removeBrochure} />
                                        ))}
                                    </div>
                                )}
                                <button className="pr-add-doc-btn" onClick={addDoc} style={{ marginTop: nonMain.length > 0 ? 4 : 16 }}>
                                    <MdAdd size={18} /> Add Document
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 24px", borderTop: "1px solid #E2E8F0", background: "#fff" }}>
                        <button style={{ background: defaultTheme.goldColorLogo, color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                            onClick={onClose}>Cancel</button>
                        <button className="pr-save-btn" onClick={handleSave} disabled={saving}>
                            {saving
                                ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} />Saving…</>
                                : <><FaCheck size={12} /> Save Changes</>}
                        </button>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    );
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║ MAIN COMPONENT                                                           ║
// ╚══════════════════════════════════════════════════════════════════════════╝
const ProjectRegistrationData = () => {
    const { userId, empCode, userName } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);
    const [editRow, setEditRow] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [pubTab, setPubTab] = useState("unpublished");

    // Modal visibility
    const [showAddBuilder, setShowAddBuilder] = useState(false);
    const [showAddProject, setShowAddProject] = useState(false);

    const { data: projectData, isLoading } = useGet(
        `${GET_ALL_PROJECT_REGISTRATION_DATA}?v=${refreshKey}`,
        { enabled: !!accessGranted }
    );

    const allRows = useMemo(() => (Array.isArray(projectData?.data?.data) ? projectData.data.data : []), [projectData]);
    const unpublishedRows = useMemo(() => allRows.filter(r => !r.isPublished), [allRows]);
    const publishedRows = useMemo(() => allRows.filter(r => r.isPublished), [allRows]);
    const tableData = pubTab === "published" ? publishedRows : unpublishedRows;

    const handleEdit = useCallback((row) => setEditRow(row), []);
    const handleSaved = useCallback(() => setRefreshKey(k => k + 1), []);

    const handlePublish = useCallback(async (id) => {
        try {
            const res = await ApiClient.post(`${PUBLISH_PROJECT_REGISTRATION}?projectId=${id}`);
            if (res?.data?.status === 0) { toast.error(res.data.message || "Publish failed"); return; }
            toast.success(res?.data?.message || "Project published successfully");
            setRefreshKey(k => k + 1);
        } catch (e) {
            toast.error(e?.response?.data?.message || e?.message || "Failed to publish");
        }
    }, []);

    const columns = useMemo(() => [
        { name: <span className="font-weight-bold fs-13">SL No.</span>, width: "3%", selector: (_, i) => i + 1, cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell> },
        {
            name: <span className="font-weight-bold fs-13">Manage</span>, width: "5%",
            cell: (row) => (
                <button onClick={() => handleEdit(row)} title="Edit Project"
                    style={{ border: "none", borderRadius: 8, padding: "5px 7px", background: `${defaultTheme.primary || "#005B52"}15`, color: defaultTheme.primary || "#005B52", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = defaultTheme.primary || "#005B52"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${defaultTheme.primary || "#005B52"}15`; e.currentTarget.style.color = defaultTheme.primary || "#005B52"; }}>
                    <FaEdit size={13} />
                </button>
            ),
        },
        ...(pubTab === "unpublished" ? [{
            name: <span className="font-weight-bold fs-13">Action</span>, width: "110px",
            cell: (row) => (
                <button className="pr-publish-btn" title="Publish project"
                    onClick={() => {
                        if (!row.sapBuilderId || !row.sapProjectId) {
                            toast.error("Please assign SAP builder and project before publishing");
                            return;
                        }
                        else if (!window.confirm("Are you sure you want to publish this project?")) return;
                        handlePublish(row.id);
                    }}>
                    <FaArrowAltCircleRight size={12} />
                    Publish
                </button>
            ),
        }] : [{
            name: <span className="font-weight-bold fs-13">Status</span>, width: "110px",
            cell: () => (
                <span className="pr-live-badge">
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#166534", flexShrink: 0 }} />
                    Live
                </span>
            ),
        }]),
        { name: <span className="font-weight-bold fs-13">BD Builder</span>, selector: r => r?.developerName, sortable: true, cell: r => <WordWrapCell>{r?.developerName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">BD Project</span>, selector: r => r?.projectName, sortable: true, cell: r => <WordWrapCell>{r?.projectName}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">SAP Builder</span>, selector: r => r?.sapBuilder, sortable: true, cell: r => <WordWrapCell>{r?.sapBuilder || "-"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">SAP Project</span>, selector: r => r?.sapProject, sortable: true, cell: r => <WordWrapCell>{r?.sapProject || "-"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Project Address</span>, selector: r => r?.projectAddress, sortable: true, cell: r => <WordWrapCell>{r?.projectAddress}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Brochure</span>, cell: r => r?.projectBrochure ? <a href={`${imageBaseUrl}${r.projectBrochure}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 17 }}><FaFilePdf color={defaultTheme.redColor || "#EF4444"} /></a> : <span style={{ color: "#999", fontSize: 12 }}>No File</span> },
        { name: <span className="font-weight-bold fs-13">Has RERA</span>, cell: r => r?.reraNo ? <FaCheck style={{ color: "green" }} size={13} /> : <FaTimes style={{ color: "red" }} size={13} /> },
        { name: <span className="font-weight-bold fs-13">RERA No.</span>, selector: r => r?.reraNo, sortable: true, cell: r => <WordWrapCell>{r?.reraNo || "-"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">RERA Cert.</span>, cell: r => r?.reraCertificate ? <a href={`${imageBaseUrl}${r.reraCertificate}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 17 }}><FaFilePdf color={defaultTheme.redColor || "#EF4444"} /></a> : <span style={{ color: "#999", fontSize: 12 }}>No File</span> },
        { name: <span className="font-weight-bold fs-13">GST No.</span>, selector: r => r?.gstNo, sortable: true, cell: r => <WordWrapCell>{r?.gstNo || "-"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">GST Cert.</span>, cell: r => r?.gstCertificate ? <a href={`${imageBaseUrl}${r.gstCertificate}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 17 }}><FaFilePdf color={defaultTheme.redColor || "#EF4444"} /></a> : <span style={{ color: "#999", fontSize: 12 }}>No File</span> },
        { name: <span className="font-weight-bold fs-13">Manager</span>, selector: r => r?.managerName, sortable: true, cell: r => <WordWrapCell>{r?.managerName || "-"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Manager Mobile</span>, cell: r => r?.managerMobileNo ? <div className="phone-container"><MdMobileFriendly className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{r.managerMobileNo}</span></div> : "-" },
        { name: <span className="font-weight-bold fs-13">Manager Email</span>, cell: r => r?.managerEmail ? <div className="phone-container"><MdEmail className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{r.managerEmail}</span></div> : "-" },
        { name: <span className="font-weight-bold fs-13">Billing Person</span>, selector: r => r?.billingPersonName, sortable: true, cell: r => <WordWrapCell>{r?.billingPersonName || "-"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Billing Mobile</span>, cell: r => r?.billingPersonMobileNo ? <div className="phone-container"><MdMobileFriendly className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{r.billingPersonMobileNo}</span></div> : "-" },
        { name: <span className="font-weight-bold fs-13">Billing Email</span>, cell: r => r?.billingPersonEmail ? <div className="phone-container"><MdEmail className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{r.billingPersonEmail}</span></div> : "-" },
        { name: <span className="font-weight-bold fs-13">OPS Person</span>, selector: r => r?.opsPersonName, sortable: true, cell: r => <WordWrapCell>{r?.opsPersonName || "-"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">OPS Mobile</span>, cell: r => r?.opsPersonMobileno ? <div className="phone-container"><MdMobileFriendly className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{r.opsPersonMobileno}</span></div> : "-" },
        { name: <span className="font-weight-bold fs-13">OPS Email</span>, cell: r => r?.opsPersonEmail ? <div className="phone-container"><MdEmail className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{r.opsPersonEmail}</span></div> : "-" },
        { name: <span className="font-weight-bold fs-13">Created At</span>, selector: r => r?.createdDate, sortable: true, cell: r => <WordWrapCell>{formatDateTime(r?.createdDate)}</WordWrapCell> },
    ], [pubTab, handleEdit, handlePublish]);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, "project-registration-data");
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    if (accessGranted === null) return <ScreenLoader />;
    if (!accessGranted) return <PermissionMissing />;

    const createdBy = `${userName} (${empCode})`;

    return (
        <PageContent>
            <Container fluid>
                {isLoading && <ScreenLoader />}
                <Breadcrumbs title="Project" breadcrumbItem="Project Registration Data" />

                {/* ── Header strip: tabs + action buttons ── */}
                <div
                    style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        marginBottom: 16, background: "#fff",
                        border: "1px solid #E8ECF2", borderRadius: 14,
                        padding: "10px 16px", boxShadow: "0 1px 4px rgba(0,0,0,.04)",
                        flexWrap: "wrap", gap: 12,
                    }}
                >
                    {/* Left: publish tabs */}
                    <div className="pr-pub-tabs">
                        <button
                            className={`pr-pub-tab${pubTab === "unpublished" ? " active unpublished" : ""}`}
                            onClick={() => setPubTab("unpublished")}
                        >
                            <span className="pr-pub-dot" style={{ background: pubTab === "unpublished" ? "#3B82F6" : "#CBD5E1" }} />
                            Un-Published
                            <span className="pr-pub-count unpublished">{unpublishedRows.length}</span>
                        </button>

                        <button
                            className={`pr-pub-tab${pubTab === "published" ? " active published" : ""}`}
                            onClick={() => setPubTab("published")}
                        >
                            <span className="pr-pub-dot" style={{ background: pubTab === "published" ? "#22C55E" : "#CBD5E1" }} />
                            Published
                            <span className="pr-pub-count published">{publishedRows.length}</span>
                        </button>
                    </div>

                    {/* Right: action buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                            className="pr-action-btn secondary"
                            onClick={() => setShowAddBuilder(true)}
                            title="Add a new builder"
                        >
                            <FaBuilding size={13} /> Add Builder
                        </button>
                        <button
                            className="pr-action-btn primary"
                            onClick={() => setShowAddProject(true)}
                            title="Add a new project"
                        >
                            <FaProjectDiagram size={13} /> Add Project
                        </button>
                        {/* Add Button */}
                        <button
                            onClick={() => window.open(`${htmlBaseURL}/builder_project-registration.html`, "_blank")}
                            style={{
                                borderRadius: "50%",
                                border: "none",
                                background: "#3B82F6",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 2px 6px rgba(59,130,246,.3)",
                            }}
                        >
                            <FiPlus size={18} title="Add Data" />
                        </button>

                    </div>
                </div>

                <AppTable
                    columns={columns}
                    progressPending={isLoading}
                    data={tableData}
                    pagination
                />

                {editRow && (
                    <EditModal
                        row={editRow}
                        onClose={() => setEditRow(null)}
                        onSaved={handleSaved}
                        updatedBy={createdBy}
                    />
                )}

                {showAddBuilder && (
                    <AddBuilderModal
                        onClose={() => setShowAddBuilder(false)}
                        createdBy={createdBy}
                    />
                )}

                {showAddProject && (
                    <AddProjectModal
                        onClose={() => setShowAddProject(false)}
                        userId={userId}
                        createdBy={createdBy}
                    />
                )}
            </Container>
        </PageContent>
    );
};

export default ProjectRegistrationData;