/* eslint-disable react-hooks/exhaustive-deps */
import { useReducer, useEffect, useMemo, useCallback, useState } from "react";
import { Container, TabContent, TabPane } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost, usePut } from "../../Hooks/useApi";
import { ALL_DEPARTMENT_DROPDOWN, ALL_DESIGNATION_DROPDOWN, ALL_HR_DROPDOWN, ALL_LOCATION_DROPDOWN, CHECK_USER_EXIST, CREATE_USER, FIND_USER_BY_ID, GET_ALL_MAIN_TEAM_DROPDOWN, GET_ALL_POSITION_DROPDOWN, GET_ALL_SUB_TEAM_DROPDOWN, GET_ALL_USERS_DROPDOWN, GROUP_DROPDOWN_MULTISELECT, UPDATE_USER } from "../../helpers/url_helper";
import { RegexFile } from "../../helpers/RegexFile";
import { RequiredStar } from "../../helpers/function_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { useLocation, useNavigate } from "react-router-dom";
import PageContent from "../../components/Common/PageContent";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import ImageModal from "../../components/Common/ImageModal";
import { useUserStore } from "../../store/useUserStore";
import { decryptData } from "../../components/Common/CryptoUtils";
import { bloodGroupOptions, indianStates, weekDaysOptions } from "../../constants/global";
import { FaArrowLeft, FaCheck, FaUser } from "react-icons/fa";

// ── Styles ─────────────────────────────────────────────────────────────────────
if (document.getElementById("cuf-s")) document.getElementById("cuf-s").remove()
const _s = document.createElement("style")
_s.id = "cuf-s"
_s.textContent = `
    /* ── Card ── */
    .cuf-card { background:#fff; border:1px solid #D1D5DB; border-radius:14px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.06); margin-bottom:16px; }

    /* ── Profile header ── */
    .cuf-hdr { background:linear-gradient(135deg,#005B52,#007A6E); padding:16px 22px; display:flex; align-items:center; gap:14px; }
    .cuf-hdr-avatar { width:52px; height:52px; object-fit:cover; border-radius:12px; border:2px solid rgba(255,255,255,.4); padding:2px; cursor:pointer; flex-shrink:0; }
    .cuf-hdr-avatar-placeholder { width:52px; height:52px; border-radius:12px; background:rgba(255,255,255,.15); border:2px dashed rgba(255,255,255,.3); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .cuf-hdr-title { font-size:15px; font-weight:800; color:#fff; }
    .cuf-hdr-sub   { font-size:11px; color:rgba(255,255,255,.65); margin-top:2px; }

    /* ── Tab bar ── */
    .cuf-tabs { display:flex; background:#F1F5F9; padding:8px 16px 0; gap:6px; border-bottom:2px solid #E2E8F0; }
    .cuf-tab {
        display:flex; align-items:center; gap:8px;
        padding:10px 22px; font-size:12px; font-weight:700;
        color:#94A3B8; cursor:pointer;
        border:1.5px solid transparent;
        border-bottom:none;
        border-radius:10px 10px 0 0;
        margin-bottom:-2px;
        background:transparent;
        transition:all .18s; user-select:none;
        position:relative;
    }
    .cuf-tab:hover:not(.active) { color:#475569; background:rgba(255,255,255,.6); border-color:#E2E8F0; }
    .cuf-tab.active {
        color:#005B52; background:#fff;
        border-color:#E2E8F0; border-bottom-color:#fff;
        box-shadow:0 -2px 8px rgba(0,91,82,.08);
    }
    .cuf-tab.active::after {
        content:""; position:absolute; bottom:-2px; left:0; right:0;
        height:2px; background:#fff;
    }
    .cuf-tab-num {
        width:22px; height:22px; border-radius:50%;
        background:#E2E8F0; color:#94A3B8;
        font-size:10px; font-weight:800;
        display:flex; align-items:center; justify-content:center; flex-shrink:0;
        transition:all .18s;
    }
    .cuf-tab.active .cuf-tab-num { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; box-shadow:0 2px 6px rgba(0,91,82,.3); }
    .cuf-tab-inactive-line { position:absolute; bottom:0; left:0; right:0; height:2px; background:#E2E8F0; }

    /* ── Progress bar ── */
    .cuf-progress-wrap { padding:0 22px; background:#fff; border-bottom:1px solid #F1F5F9; }
    .cuf-progress { height:3px; background:#E2E8F0; border-radius:2px; }
    .cuf-progress-bar { height:100%; background:linear-gradient(90deg,#005B52,#007A6E); border-radius:2px; transition:width .3s ease; }

    /* ── Form body ── */
    .cuf-body { padding:20px 22px; }

    /* ── Section separator ── */
    .cuf-sec { display:flex; align-items:center; gap:8px; margin:18px 0 12px; }
    .cuf-sec:first-child { margin-top:0; }
    .cuf-sec-dot   { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
    .cuf-sec-label { font-size:9px; font-weight:800; color:#374151; text-transform:uppercase; letter-spacing:.8px; }
    .cuf-sec-line  { flex:1; height:1px; background:#E5E7EB; }

    /* ── Field grid ── */
    .cuf-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px 16px; }
    @media(max-width:1100px){ .cuf-grid { grid-template-columns:repeat(3,1fr); } }
    @media(max-width:800px) { .cuf-grid { grid-template-columns:repeat(2,1fr); } }
    @media(max-width:540px) { .cuf-grid { grid-template-columns:1fr; } }
    .cuf-span2 { grid-column:span 2; }

    /* ── Input ── */
    .cuf-label { font-size:10px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:.4px; margin-bottom:4px; display:block; }
    .cuf-input { width:100%; height:38px; padding:0 11px; border:1.5px solid #374151; border-radius:8px; font-size:13px; color:#0F172A; outline:none; transition:border-color .15s; background:#fff; }
    .cuf-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }
    .cuf-input.disabled { background:#F1F5F9; color:#64748B; border-color:#CBD5E1; cursor:default; }
    .cuf-input.is-invalid { border-color:#EF4444 !important; }
    .cuf-err { font-size:10px; color:#EF4444; margin-top:3px; }

    /* ── Select ── */
    .cuf-sel .react-select__control { min-height:38px !important; border:1.5px solid #374151 !important; border-radius:8px !important; font-size:13px !important; }
    .cuf-sel .react-select__control--is-focused { border-color:#005B52 !important; box-shadow:0 0 0 3px rgba(0,91,82,.08) !important; }
    .cuf-sel.is-invalid .react-select__control { border-color:#EF4444 !important; }

    /* ── Buttons ── */
    .cuf-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 22px; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; border:none; transition:all .15s; }
    .cuf-btn-primary   { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; box-shadow:0 3px 10px rgba(0,91,82,.22); }
    .cuf-btn-primary:hover { opacity:.88; }
    .cuf-btn-secondary { background:#F1F5F9; color:#374151; border:1.5px solid #D1D5DB; }
    .cuf-btn-secondary:hover { background:#E2E8F0; }
    .cuf-btn-tab { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; padding:8px 18px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; border:none; }
    .cuf-btn-tab-sec { background:#F1F5F9; color:#374151; border:1.5px solid #D1D5DB; padding:8px 18px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; }

    /* ── Actions bar ── */
    .cuf-actions { display:flex; justify-content:space-between; align-items:center; padding:14px 22px; border-top:1px solid #E5E7EB; background:#F8FAFC; flex-wrap:wrap; gap:8px; }
    .cuf-actions-right { display:flex; gap:8px; }

    /* ── Responsive ── */

    /* Tablet landscape (≤1024px) */
    @media(max-width:1024px){
        .cuf-grid { grid-template-columns:repeat(3,1fr); }
    }

    /* Tablet portrait (≤768px) */
    @media(max-width:768px){
        .cuf-grid { grid-template-columns:repeat(2,1fr); }
        .cuf-hdr { padding:14px 16px; gap:10px; flex-wrap:wrap; }
        .cuf-hdr-title { font-size:14px; }
        .cuf-body { padding:16px 14px; }
        .cuf-tabs { padding:6px 10px 0; gap:4px; overflow-x:auto; }
        .cuf-tab { padding:9px 14px; font-size:11px; white-space:nowrap; }
        .cuf-progress-wrap { padding:0 14px; }
        .cuf-actions { padding:12px 14px; }
        .cuf-btn { padding:8px 16px; font-size:12px; }
        .cuf-btn-tab     { padding:8px 14px; font-size:11px; }
        .cuf-btn-tab-sec { padding:8px 14px; font-size:11px; }
    }

    /* Mobile (≤540px) */
    @media(max-width:540px){
        .cuf-grid { grid-template-columns:1fr; }
        .cuf-span2 { grid-column:span 1; }
        .cuf-hdr { flex-direction:row; padding:12px 14px; }
        .cuf-hdr-avatar { width:42px; height:42px; }
        .cuf-hdr-avatar-placeholder { width:42px; height:42px; }
        .cuf-hdr-title { font-size:13px; }
        .cuf-hdr-sub { font-size:10px; }
        .cuf-tabs { padding:4px 8px 0; gap:2px; }
        .cuf-tab { padding:8px 10px; font-size:11px; gap:5px; }
        .cuf-tab-num { width:18px; height:18px; font-size:9px; }
        .cuf-body { padding:14px 12px; }
        .cuf-sec { margin:14px 0 10px; }
        .cuf-sec-label { font-size:8px; }
        .cuf-label { font-size:9px; }
        .cuf-input { height:36px; font-size:12px; }
        .cuf-actions { padding:10px 12px; }
        .cuf-actions-right { flex:1; justify-content:flex-end; }
        .cuf-btn { padding:7px 14px; font-size:11px; }
        .cuf-btn-tab     { padding:7px 12px; font-size:11px; width:100%; justify-content:center; }
        .cuf-btn-tab-sec { padding:7px 12px; font-size:11px; }
    }

    /* Very small (≤380px) */
    @media(max-width:380px){
        .cuf-hdr { padding:10px 12px; }
        .cuf-hdr-avatar { width:36px; height:36px; border-radius:8px; }
        .cuf-hdr-avatar-placeholder { width:36px; height:36px; border-radius:8px; }
        .cuf-hdr-title { font-size:12px; }
        .cuf-tab { padding:7px 8px; font-size:10px; }
        .cuf-body { padding:12px 10px; }
        .cuf-btn { padding:7px 12px; font-size:11px; }
    }
`
document.head.appendChild(_s)

const SEL_STYLES = {
    control: (b, st) => ({ ...b, minHeight: 38, fontSize: 13, border: `1.5px solid ${st.isFocused ? "#005B52" : "#374151"}`, borderRadius: 8, boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.08)" : "none" }),
    option: (b, st) => ({ ...b, fontSize: 13, background: st.isSelected ? "#005B52" : st.isFocused ? "#f0fdf9" : "#fff", color: st.isSelected ? "#fff" : "#0F172A" }),
    placeholder: b => ({ ...b, color: "#9CA3AF", fontSize: 13 }),
    menuPortal: b => ({ ...b, zIndex: 9999 }),
}

// ── Reducer ───────────────────────────────────────────────────────────────────
const initialState = {
    form: {
        userId: 0, employeeCode: "", userName: "", userTypeGroupSelect: null, TLGroupSelect: null,
        doj: "", departmentGroupSelect: null, designationGroupSelect: null, positionGroupSelect: null,
        locationGroupSelect: null, personalNo: "", officialNo: "", emergencyNo: "", officialEmail: "",
        personalEmail: "", panNo: "", mainTeam: null, sTeam: null, address1: "", pin: "", state: "",
        city: "", relievingDt: "", dob: "", doa: "", marriageAnniversary: "", wifeBirthday: "",
        showRevenueLinkSelect: null, relievingReasonSelect: null, isActive: true,
        groupNameGroupSelect: [], employmentTypeSelect: null, genderSelect: null, religionSelect: null,
        instaId: "", recruiterName: null, maritalStatus: null, bloodGroup: null,
        documentDateOfBirth: "", weeklyOffDay: null, shiftTiming: ""
    },
    errors: {},
}

const reducer = (state, action) => {
    switch (action.type) {
        case "UPDATE_FORM": return { ...state, form: { ...state.form, ...action.payload } }
        case "SET_ERRORS": return { ...state, errors: action.payload }
        case "CLEAR_ERROR": return { ...state, errors: { ...state.errors, [action.payload]: "" } }
        case "RESET_FORM": return { ...state, form: initialState.form }
        default: return state
    }
}

// ── Field components ──────────────────────────────────────────────────────────
const Field = ({ label, required, error, children, span2 }) => (
    <div style={span2 ? { gridColumn: "span 2" } : {}}>
        <label className="cuf-label">{label}{required && <RequiredStar />}</label>
        {children}
        {error && <div className="cuf-err">{error}</div>}
    </div>
)

const FInput = ({ label, id, type, value, onChange, error, placeholder, disabled, readOnly, maxLength, required, span2, onBlur }) => (
    <Field label={label} required={required} error={error} span2={span2}>
        <input id={id} type={type || "text"} value={value} onChange={onChange} onBlur={onBlur}
            placeholder={placeholder} disabled={disabled} readOnly={readOnly} maxLength={maxLength}
            className={`cuf-input${disabled || readOnly ? " disabled" : ""}${error ? " is-invalid" : ""}`} />
    </Field>
)

const FSelect = ({ label, value, options, onChange, error, isMulti, isClearable = true, isDisabled, required, span2 }) => (
    <Field label={label} required={required} error={error} span2={span2}>
        <div className={`cuf-sel${error ? " is-invalid" : ""}`}>
            <Select value={value} options={Array.isArray(options) ? options : []} onChange={onChange}
                isClearable={isClearable} isMulti={isMulti} isDisabled={isDisabled}
                closeMenuOnSelect={!isMulti} styles={SEL_STYLES} menuPortalTarget={document.body} />
        </div>
    </Field>
)

// ── Section separator ─────────────────────────────────────────────────────────
const Sec = ({ dot = "#005B52", label }) => (
    <div className="cuf-sec">
        <span className="cuf-sec-dot" style={{ background: dot }} />
        <span className="cuf-sec-label">{label}</span>
        <span className="cuf-sec-line" />
    </div>
)

const CreateUserForm = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { userId, searchTerm } = location.state || {}
    const user_Id = useUserStore(s => s.user.userId)
    const { empCode, userName } = useUserStore(s => s.user)

    const [state, dispatch] = useReducer(reducer, initialState)
    const [fileModalOpen, setFileModal] = useState(false)
    const [currentImage, setCurrentImg] = useState("")
    const [activeTab, setActiveTab] = useState(1)
    const [updateUserData, setUpdateUser] = useState({})

    const { data: tlList } = useGet(GET_ALL_USERS_DROPDOWN)
    const { data: departmentList } = useGet(ALL_DEPARTMENT_DROPDOWN)
    const { data: hrList } = useGet(ALL_HR_DROPDOWN)
    const { data: designationList } = useGet(ALL_DESIGNATION_DROPDOWN)
    const { data: positionList } = useGet(GET_ALL_POSITION_DROPDOWN)
    const { data: locationList } = useGet(ALL_LOCATION_DROPDOWN)
    const { data: allGroupListMultiSelect } = useGet(GROUP_DROPDOWN_MULTISELECT)
    const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN + '?active=false')
    const { data: subTeams } = useGet(`${GET_ALL_SUB_TEAM_DROPDOWN}${state?.form?.mainTeam?.value}`, { enabled: Boolean(state?.form?.mainTeam) })
    const { data, isLoading } = useGet(`${FIND_USER_BY_ID}${userId}`, { enabled: Boolean(userId) })

    useEffect(() => {
        if (data?.data?.status === 1) decryptData(data?.data?.data).then(d => setUpdateUser(d || {}))
    }, [data])

    const userTypeGroup = useMemo(() => [{ label: "Sales", value: "Associate" }, { label: "Other", value: "OTHER" }], [])
    const showRevenueGroup = useMemo(() => [{ label: "Hide Revenue Link", value: "Hide Revenue Link" }, { label: "Show Revenue Link", value: "Show Revenue Link" }], [])
    const relievingReasonGroup = useMemo(() => [{ label: "Absconding", value: "Absconding" }, { label: "Resigned", value: "Resigned" }, { label: "Separation", value: "Separation" }, { label: "Join & Left", value: "Join & Left" }, { label: "Termination", value: "Termination" }, { label: "Serving Notice", value: "Serving Notice" }], [])
    const employeementTypeGroup = useMemo(() => [{ label: "Contractual", value: "Contractual" }, { label: "Permanent", value: "Permanent" }, { label: "Trainee", value: "Trainee" }], [])
    const genderGroup = useMemo(() => [{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }], [])
    const maritalStatusGroup = useMemo(() => [{ label: "Married", value: "Married" }, { label: "Un-Married", value: "Un-Married" }], [])
    const religionGroup = useMemo(() => [{ label: "Hindu", value: "Hindu" }, { label: "Muslim", value: "Muslim" }, { label: "Christian", value: "Christian" }, { label: "Sikh", value: "Sikh" }, { label: "Buddhist", value: "Buddhist" }, { label: "Jain", value: "Jain" }], [])

    useEffect(() => {
        if (!updateUserData?.user) return
        const u = updateUserData.user
        const shiftTimingValue = `${u?.inTime}to${u?.outTime}`
        const selectedShiftTiming = shiftTimingOptions?.find(
            item => item?.value === shiftTimingValue
        )
        const g = updateUserData.group
        dispatch({
            type: "UPDATE_FORM", payload: {
                userId: u.userId || 0, employeeCode: u.employeeCode || "", userName: u.name || "",
                relievingDt: u.dol ? u.dol.split("T")[0] : "", personalNo: u.phone || "", officialNo: u.officialPhone || "",
                emergencyNo: u.emergencyPhone || "", officialEmail: u.officialEmail || "", personalEmail: u.emailId || "",
                dob: u.dateOfBirth || "", doa: u.dateOfAnniversary || "", marriageAnniversary: u.marriageAnniversary || "",
                wifeBirthday: u.wifeBirthday || "", panNo: u.panNo || "", address1: u.address1 || "", pin: u.pincode || "",
                city: u.city || "", state: indianStates?.find(i => i.value === u.state) || null,
                isActive: u.isActive === "YES", doj: u.doj || "", instaId: u.instagramId || "",
                userTypeGroupSelect: userTypeGroup.find(i => u.isAdmin === "YES" ? i.value === "Admin" : u.isAdmin === "OTHER" ? i.value === "OTHER" : i.value === "Associate") || null,
                showRevenueLinkSelect: showRevenueGroup.find(i => u.showRevenueForm === "YES" ? i.value === "Show Revenue Link" : i.value === "Hide Revenue Link") || null,
                TLGroupSelect: tlList?.data?.data?.find(i => i.value === u.parentId) || null,
                recruiterName: hrList?.data?.data?.find(i => i.value === u.recruiterCode) || null,
                mainTeam: mainTeams?.data?.data?.find(i => i.value === u.mainTeam) || null,
                departmentGroupSelect: departmentList?.data?.data?.find(i => i.value === u.departmentName) || null,
                designationGroupSelect: designationList?.data?.data?.find(i => i.value === u.designationName) || null,
                positionGroupSelect: positionList?.data?.data?.find(i => String(i.value) === String(u.positionMaster?.id)) || null,
                locationGroupSelect: locationList?.data?.data?.find(i => i.value === u.locationName) || null,
                relievingReasonSelect: relievingReasonGroup.find(i => i.value === u.releavingReason) || null,
                groupNameGroupSelect: allGroupListMultiSelect?.data?.data?.filter(i => g?.includes(Number(i.value))) || [],
                genderSelect: genderGroup?.find(i => i.value === u.gender) || null,
                employmentTypeSelect: employeementTypeGroup?.find(i => i.value === u.employmentType) || null,
                religionSelect: religionGroup?.find(i => i.value === u.religion) || null,
                maritalStatus: maritalStatusGroup?.find(i => i.value === u.maritalStatus) || null,
                bloodGroup: bloodGroupOptions?.find(i => i.value === u.bloodGroup) || null,
                documentDateOfBirth: u.documentDateOfBirth,
                weeklyOffDay: weekDaysOptions?.find(i => i.value === u.weeklyOffDay) || null,
                shiftTiming: selectedShiftTiming
            }
        })
    }, [updateUserData, userTypeGroup, showRevenueGroup, relievingReasonGroup, tlList?.data?.data, mainTeams?.data?.data, departmentList?.data?.data, designationList?.data?.data, positionList?.data?.data, locationList?.data?.data, allGroupListMultiSelect?.data?.data, genderGroup, employeementTypeGroup, religionGroup, hrList?.data?.data, maritalStatusGroup])

    useEffect(() => {
        if (updateUserData?.user && subTeams?.data?.data) {
            dispatch({ type: "UPDATE_FORM", payload: { sTeam: subTeams.data.data.find(i => i.value === updateUserData.user.sTeam) || null } })
        }
    }, [updateUserData, subTeams?.data?.data])

    const handleChange = useCallback(e => {
        const { id, value } = e.target
        dispatch({ type: "CLEAR_ERROR", payload: id })
        if (["personalNo", "officialNo", "emergencyNo"].includes(id)) { if (/^\d{0,10}$/.test(value)) dispatch({ type: "UPDATE_FORM", payload: { [id]: value } }); return }
        if (id === "pin") { if (/^\d{0,6}$/.test(value)) dispatch({ type: "UPDATE_FORM", payload: { [id]: value } }); return }
        if (id === "panNo") { dispatch({ type: "UPDATE_FORM", payload: { [id]: value.toUpperCase() } }); return }
        dispatch({ type: "UPDATE_FORM", payload: { [id]: value } })
    }, [])

    const handleSelectChange = useCallback(field => opt => {
        dispatch({ type: "UPDATE_FORM", payload: { [field]: opt } })
        dispatch({ type: "CLEAR_ERROR", payload: field })
    }, [])

    const handleMultiSelectChange = useCallback(opts => {
        dispatch({ type: "UPDATE_FORM", payload: { groupNameGroupSelect: opts || [] } })
        dispatch({ type: "CLEAR_ERROR", payload: "groupNameGroupSelect" })
    }, [])

    const validateForm = useCallback(() => {
        const errors = {}
        const req = [
            { key: "employeeCode", message: "Employee code is required." },
            { key: "userName", message: "User Name is required." },
            { key: "userTypeGroupSelect", message: "User Type is required." },
            { key: "TLGroupSelect", message: "Reporting manager is required." },
            { key: "doj", message: "Date of Joining is required." },
            { key: "departmentGroupSelect", message: "Department is required." },
            { key: "designationGroupSelect", message: "Level is required." },
            { key: "positionGroupSelect", message: "Designation is required." },
            { key: "locationGroupSelect", message: "Location is required." },
            { key: "personalNo", message: "Personal No is required.", regex: RegexFile.mobileNo, regexMessage: "Must be 10-digit number." },
            { key: "officialNo", message: "Official No is required.", regex: RegexFile.mobileNo, regexMessage: "Must be 10-digit number." },
            { key: "dob", message: "Date of Birth is required." },
            { key: "doa", message: "Work Anniversary is required." },
            { key: "personalEmail", message: "Personal Email is required.", regex: RegexFile.email, regexMessage: "Invalid email." },
            { key: "officialEmail", message: "Official Email is required.", regex: RegexFile.email, regexMessage: "Invalid email." },
            { key: "panNo", message: "PAN No is required.", regex: RegexFile.panNo, regexMessage: "Invalid PAN format." },
            { key: "address1", message: "Address is required." },
            { key: "pin", message: "PIN is required." },
            { key: "genderSelect", message: "Gender is required." },
            { key: "religionSelect", message: "Religion is required." },
            { key: "employmentTypeSelect", message: "Employment Type is required." },
            { key: "instaId", message: "Instagram ID is required." },
            { key: "recruiterName", message: "Recruiter Name is required." },
            { key: "city", message: "City is required." },
            { key: "state", message: "State is required." },
            { key: "maritalStatus", message: "Marital Status is required." },
            { key: "bloodGroup", message: "Blood Group is required." },

            { key: "documentDateOfBirth", message: "Document DOB is required." },
            { key: "weeklyOffDay", message: "Weekly off day is required." },
            { key: "shiftTiming", message: "Shift Timing is required." }
        ]
        req.forEach(({ key, message, regex, regexMessage }) => {
            if (!state.form[key]) errors[key] = message
            else if (regex && !regex.test(state.form[key])) errors[key] = regexMessage
        })
        if (!state.form.groupNameGroupSelect.length) errors.groupNameGroupSelect = "Group Name is required."
        if (state.form.userTypeGroupSelect?.value === "Associate") {
            if (!state.form.mainTeam) errors.mainTeam = "Main Team is required."
            if (!state.form.sTeam) errors.sTeam = "Sub Team is required."
            if (!state.form.showRevenueLinkSelect) errors.showRevenueLinkSelect = "Show Revenue Link is required."
        }
        return errors
    }, [state.form])

    const handleSubmit = useCallback(e => {
        e.preventDefault()
        const errs = validateForm()
        if (Object.keys(errs).length > 0) { dispatch({ type: "SET_ERRORS", payload: errs }); toast.error("Some mandatory fields are not filled."); return }
        if (state.form.relievingDt && new Date(state.form.relievingDt) < new Date(state.form.doj)) { toast.error("Relieving Date must be after DOJ."); return }
        if (state.form.relievingDt && !state.form.relievingReasonSelect) { toast.error("Relieving Reason required with Relieving Date."); return }
        if (state.form.relievingReasonSelect && !state.form.relievingDt) { toast.error("Relieving Date required with Relieving Reason."); return }

        const params = {
            userId: state.form.userId || 0, employeeCode: state.form.employeeCode,
            pUserId: state.form.TLGroupSelect?.value, name: state.form.userName,
            isAdmin: state.form.userTypeGroupSelect?.value === "Admin" ? "YES" : state.form.userTypeGroupSelect?.value === "OTHER" ? "OTHER" : "NO",
            doj: state.form.doj, dol: state.form.relievingDt || "", rollType: "ONROLL",
            emailId: state.form.personalEmail, officialEmail: state.form.officialEmail,
            dateOfBirth: state.form.dob, dateOfAnniversary: state.form.doa,
            wifeBirthday: state.form.maritalStatus?.value === 'Married' ? state.form.wifeBirthday : "",
            marriageAnniversary: state.form.maritalStatus?.value === 'Married' ? state.form.marriageAnniversary : "",
            phone: state.form.personalNo, officialPhone: state.form.officialNo, emergencyPhone: state.form.emergencyNo,
            address1: state.form.address1, address2: state.form.address1, pincode: state.form.pin,
            city: state.form.city, state: state.form.state?.value, panNo: state.form.panNo.toUpperCase(),
            password: "string",
            mainTeam: state.form.userTypeGroupSelect?.value === "Associate" ? state.form.mainTeam?.value : "SA",
            sTeam: state.form.userTypeGroupSelect?.value === "Associate" ? state.form.sTeam?.value : "SA",
            isActive: state.form.isActive ? "YES" : "NO", tlSharing: 0, imagePath: "string",
            department: state.form.departmentGroupSelect?.value, designation: state.form.designationGroupSelect?.value,
            location: state.form.locationGroupSelect?.value, releavingReason: state.form.relievingReasonSelect?.value || "",
            groupId: state.form.groupNameGroupSelect.map(i => i.value) || [], dataGroupName: "SA",
            inactiveFromProspect: "YES", positionId: state.form.positionGroupSelect?.value,
            showRevenueForm: state.form.userTypeGroupSelect?.value === "Associate" && state.form.showRevenueLinkSelect ? (state.form.showRevenueLinkSelect.value === "Hide Revenue Link" ? "NO" : "YES") : "NO",
            gender: state.form.genderSelect?.value, employmentType: state.form.employmentTypeSelect?.value,
            religion: state.form.religionSelect?.value, instagramId: state.form.instaId || "",
            recruiterCode: state.form.recruiterName?.value || "", createdBy: user_Id,
            maritalStatus: state.form.maritalStatus?.value, bloodGroup: state.form.bloodGroup?.value,
            documentDate: state.form.documentDateOfBirth,
            weeklyOffDay: state.form.weeklyOffDay?.value,
            inTime: state.form.shiftTiming?.value?.split('to')[0],
            outTime: state.form.shiftTiming?.value?.split('to')[1],

        }
        userId ? updateUser(params) : addUser(params)
    }, [state.form, userId, validateForm, user_Id])

    const handleUserIdCheck = useCallback(() => {
        if (state.form.employeeCode) {
            ApiClient.get(`${CHECK_USER_EXIST}${state.form.employeeCode}`)
                .then(res => { if (res.data.status === 0) toast.error(res.data.message) })
                .catch(err => toast.error(err.message))
        }
    }, [state.form.employeeCode])

    const { isPending, mutate: addUser } = usePost(CREATE_USER, { onSuccess: res => { if (res?.data?.status === 1) { toast.success(res.data.message); navigate("/users-list", { state: { searchTerm_: searchTerm } }) } else toast.error(res.data.message) }, onError: err => toast.error(err.message) })
    const { isPending: isPendingPut, mutate: updateUser } = usePut(`${UPDATE_USER}?updatedBy=${userName + ' (' + empCode + ')'}`, { onSuccess: res => { if (res?.data?.status === 1) { toast.success(res.data.message); navigate("/users-list", { state: { searchTerm_: searchTerm } }) } else toast.error(res.data.message) }, onError: err => toast.error(err.message) })

    const handleCancel = () => navigate("/users-list", { state: { searchTerm_: searchTerm } })
    const f = state.form
    const isAssociate = f.userTypeGroupSelect?.value === "Associate"
    const isMarried = f.maritalStatus?.value === "Married"

    const shiftTimingOptions = [
        { label: '09:30am to 06:30pm', value: '09:30to18:30' },
        { label: '09:35am to 06:35pm', value: '09:35to18:35' },
        { label: '10:00am to 07:00pm', value: '10:00to19:00' },
        { label: '10:30am to 07:00pm', value: '10:30to19:00' },
    ]

    if (isPending || isPendingPut || isLoading) return <ScreenLoader />

    return (
        <PageContent>
            <Breadcrumbs title="User Management" breadcrumbItem={userId ? "Update User" : "Create User"} />
            <Container fluid>
                <form onSubmit={handleSubmit}>
                    <div className="cuf-card">

                        {/* ── Header ── */}
                        <div className="cuf-hdr">
                            {updateUserData?.user?.fileDetails ? (
                                <img src={imageBaseUrl + updateUserData.user.fileDetails} alt="Profile"
                                    className="cuf-hdr-avatar"
                                    onClick={() => { setCurrentImg(imageBaseUrl + updateUserData.user.fileDetails); setFileModal(true) }} />
                            ) : (
                                <div className="cuf-hdr-avatar-placeholder"><FaUser size={22} color="rgba(255,255,255,.5)" /></div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="cuf-hdr-title">{userId ? "✏️ Update User" : "➕ Create New User"}</div>
                                <div className="cuf-hdr-sub">{userId && updateUserData?.user?.name ? `Editing: ${updateUserData.user.name} (${updateUserData.user.employeeCode})` : "Fill all details to register a new user"}</div>
                            </div>
                            <button type="button" className="cuf-btn cuf-btn-secondary"
                                style={{ border: "1.5px solid rgba(255,255,255,.35)", background: "rgba(255,255,255,.12)", color: "#fff", flexShrink: 0 }}
                                onClick={handleCancel}>
                                <FaArrowLeft size={11} /> Back
                            </button>
                        </div>

                        {/* ── Tab bar ── */}
                        <div className="cuf-tabs">
                            {[{ n: 1, label: "Personal Information" }, { n: 2, label: "Employment Details" }].map(({ n, label }) => (
                                <div key={n} className={`cuf-tab${activeTab === n ? " active" : ""}`} onClick={() => setActiveTab(n)}>
                                    <span className="cuf-tab-num">{String(n).padStart(2, '0')}</span>
                                    {label}
                                </div>
                            ))}
                        </div>

                        {/* ── Progress ── */}
                        <div className="cuf-progress-wrap">
                            <div className="cuf-progress">
                                <div className="cuf-progress-bar" style={{ width: `${50 * activeTab}%` }} />
                            </div>
                        </div>

                        {/* ── Tab content ── */}
                        <div className="cuf-body">
                            <TabContent activeTab={activeTab}>

                                {/* ── Tab 1: Personal ── */}
                                <TabPane tabId={1}>
                                    <Sec dot="#005B52" label="Identity" />
                                    <div className="cuf-grid">
                                        <FInput label="Employee Code" id="employeeCode" type="number" value={f.employeeCode} onChange={handleChange} error={state.errors.employeeCode} placeholder="Employee code…" disabled={!!userId} required onBlur={handleUserIdCheck} />
                                        <FInput label="User Name" id="userName" type="text" value={f.userName} onChange={handleChange} error={state.errors.userName} placeholder="Full name…" required />
                                        <FSelect label="User Type" value={f.userTypeGroupSelect} options={userTypeGroup} onChange={handleSelectChange("userTypeGroupSelect")} error={state.errors.userTypeGroupSelect} required />
                                        <FInput label="Instagram ID" id="instaId" type="text" value={f.instaId} onChange={handleChange} error={state.errors.instaId} placeholder="@handle…" required />
                                    </div>

                                    <Sec dot="#C9A84C" label="Personal Details" />
                                    <div className="cuf-grid">
                                        <FInput label="Actual DOB" id="dob" type="date" value={f.dob} onChange={handleChange} error={state.errors.dob} required />
                                        <FInput label="Document DOB" id="documentDateOfBirth" type="date" value={f.documentDateOfBirth} onChange={handleChange} error={state.errors.documentDateOfBirth} required />
                                        <FSelect label="Gender" value={f.genderSelect} options={genderGroup} onChange={handleSelectChange("genderSelect")} error={state.errors.genderSelect} required />
                                        <FSelect label="Religion" value={f.religionSelect} options={religionGroup} onChange={handleSelectChange("religionSelect")} error={state.errors.religionSelect} required />
                                        <FSelect label="Marital Status" value={f.maritalStatus} options={maritalStatusGroup} onChange={handleSelectChange("maritalStatus")} error={state.errors.maritalStatus} required />
                                        <FSelect label="Blood Group" value={f.bloodGroup} options={bloodGroupOptions} onChange={handleSelectChange("bloodGroup")} error={state.errors.bloodGroup} required />
                                        {isMarried && <FInput label="Marriage Anniversary" id="marriageAnniversary" type="date" value={f.marriageAnniversary} onChange={handleChange} />}
                                        {isMarried && <FInput label="Spouse's Birthday" id="wifeBirthday" type="date" value={f.wifeBirthday} onChange={handleChange} />}
                                    </div>

                                    <Sec dot="#3B82F6" label="Contact Information" />
                                    <div className="cuf-grid">
                                        <FInput label="Personal No" id="personalNo" type="text" value={f.personalNo} onChange={handleChange} error={state.errors.personalNo} placeholder="10-digit mobile…" required />
                                        <FInput label="Official No" id="officialNo" type="text" value={f.officialNo} onChange={handleChange} error={state.errors.officialNo} placeholder="10-digit mobile…" required />
                                        <FInput label="Emergency No" id="emergencyNo" type="text" value={f.emergencyNo} onChange={handleChange} error={state.errors.emergencyNo} placeholder="Emergency contact…" required />
                                        <FInput label="Personal Email" id="personalEmail" type="email" value={f.personalEmail} onChange={handleChange} error={state.errors.personalEmail} placeholder="personal@email.com" required />
                                        <FInput label="Official Email" id="officialEmail" type="email" value={f.officialEmail} onChange={handleChange} error={state.errors.officialEmail} placeholder="official@company.com" required />
                                        <FInput label="PAN No" id="panNo" type="text" value={f.panNo} onChange={handleChange} error={state.errors.panNo} placeholder="ABCDE1234F" maxLength={10} required />
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                                        <button type="button" className="cuf-btn-tab" onClick={() => setActiveTab(2)}>
                                            Next: Employment Details →
                                        </button>
                                    </div>
                                </TabPane>

                                {/* ── Tab 2: Employment ── */}
                                <TabPane tabId={2}>
                                    <Sec dot="#005B52" label="Work Details" />
                                    <div className="cuf-grid">
                                        <FInput label="Date of Joining" id="doj" type="date" value={f.doj} onChange={handleChange} error={state.errors.doj} required />
                                        <FInput label="Work Anniversary" id="doa" type="date" value={f.doa} onChange={handleChange} error={state.errors.doa} required />
                                        <FSelect label="Recruiter" value={f.recruiterName} options={hrList?.data?.data || []} onChange={handleSelectChange("recruiterName")} error={state.errors.recruiterName} required />
                                        <FSelect label="Reporting Manager (TL)" value={f.TLGroupSelect} options={tlList?.data?.data || []} onChange={handleSelectChange("TLGroupSelect")} error={state.errors.TLGroupSelect} required />
                                        <FSelect label="Department" value={f.departmentGroupSelect} options={departmentList?.data?.data || []} onChange={handleSelectChange("departmentGroupSelect")} error={state.errors.departmentGroupSelect} required />
                                        <FSelect label="Level" value={f.designationGroupSelect} options={designationList?.data?.data || []} onChange={handleSelectChange("designationGroupSelect")} error={state.errors.designationGroupSelect} required />
                                        <FSelect label="Designation" value={f.positionGroupSelect} options={positionList?.data?.data || []} onChange={handleSelectChange("positionGroupSelect")} error={state.errors.positionGroupSelect} required />
                                        <FSelect label="Location" value={f.locationGroupSelect} options={locationList?.data?.data || []} onChange={handleSelectChange("locationGroupSelect")} error={state.errors.locationGroupSelect} required />
                                        <FSelect label="Employment Type" value={f.employmentTypeSelect} options={employeementTypeGroup || []} onChange={handleSelectChange("employmentTypeSelect")} error={state.errors.employmentTypeSelect} required />
                                        <FSelect label="Group Name" value={f.groupNameGroupSelect} options={allGroupListMultiSelect?.data?.data} onChange={handleMultiSelectChange} error={state.errors.groupNameGroupSelect} isMulti required span2 />


                                        <FSelect label="Weekly Off Day" value={f.weeklyOffDay} options={weekDaysOptions} onChange={handleSelectChange("weeklyOffDay")} error={state.errors.weeklyOffDay} required />
                                        <FSelect label="Shift Timing" value={f.shiftTiming} options={shiftTimingOptions} onChange={handleSelectChange("shiftTiming")} error={state.errors.shiftTiming} required />

                                        {/* <FInput label="In Time" id="inTime" type="time" value={f.inTime} onChange={handleChange} error={state.errors.inTime} required />
                                        <FInput label="Out Time" id="outTime" type="time" value={f.outTime} onChange={handleChange} error={state.errors.outTime} required /> */}


                                    </div>

                                    {isAssociate && (
                                        <>
                                            <Sec dot="#7C3AED" label="Team Assignment" />
                                            <div className="cuf-grid">
                                                <FSelect label="Main Team" value={f.mainTeam} options={mainTeams?.data?.data || []} onChange={handleSelectChange("mainTeam")} error={state.errors.mainTeam} required />
                                                <FSelect label="Sub Team" value={f.sTeam} options={subTeams?.data?.data || []} onChange={handleSelectChange("sTeam")} error={state.errors.sTeam} isDisabled={!f.mainTeam} required />
                                                <FSelect label="Show Revenue Link" value={f.showRevenueLinkSelect} options={showRevenueGroup || []} onChange={handleSelectChange("showRevenueLinkSelect")} error={state.errors.showRevenueLinkSelect} required />
                                            </div>
                                        </>
                                    )}

                                    <Sec dot="#C9A84C" label="Address" />
                                    <div className="cuf-grid">
                                        <FInput label="Address" id="address1" type="text" value={f.address1} onChange={handleChange} error={state.errors.address1} placeholder="Full address…" required span2 />
                                        <FInput label="PIN Code" id="pin" type="number" value={f.pin} onChange={handleChange} error={state.errors.pin} placeholder="6-digit PIN…" required />
                                        <FInput label="City" id="city" type="text" value={f.city} onChange={handleChange} error={state.errors.city} placeholder="City…" required />
                                        <FSelect label="State" value={f.state} options={indianStates || []} onChange={handleSelectChange("state")} error={state.errors.state} required />
                                    </div>

                                    <Sec dot="#EF4444" label="Relieving (if applicable)" />
                                    <div className="cuf-grid">
                                        <FInput label="Relieving Date" id="relievingDt" type="date" value={f.relievingDt} onChange={handleChange} error={state.errors.relievingDt} />
                                        {f.relievingDt && <FSelect label="Relieving Reason" value={f.relievingReasonSelect} options={relievingReasonGroup} onChange={handleSelectChange("relievingReasonSelect")} error={state.errors.relievingReasonSelect} />}
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                                        <button type="button" className="cuf-btn-tab-sec" onClick={() => setActiveTab(1)}>
                                            ← Back to Personal
                                        </button>
                                    </div>
                                </TabPane>
                            </TabContent>
                        </div>

                        {/* ── Actions ── */}
                        {empCode !== '2099' && (
                            <div className="cuf-actions">
                                <div style={{ fontSize: 11, color: "#64748B" }}>
                                    {activeTab === 1 ? "Step 1 of 2 — Personal Information" : "Step 2 of 2 — Employment Details"}
                                </div>
                                <div className="cuf-actions-right">
                                    <button type="button" className="cuf-btn cuf-btn-secondary" onClick={handleCancel}>
                                        <FaArrowLeft size={11} /> Cancel
                                    </button>
                                    <button type={userId ? "button" : "submit"} className="cuf-btn cuf-btn-primary"
                                        onClick={userId ? handleSubmit : undefined}>
                                        <FaCheck size={11} /> {userId ? "Update" : "Save"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                <ImageModal isOpen={fileModalOpen} toggle={() => setFileModal(p => !p)} imageSrc={currentImage} />
            </Container>
        </PageContent>
    )
}

export default CreateUserForm