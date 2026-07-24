/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost, usePut } from "../../Hooks/useApi";
import {
    DROPDOWN_MT_PAY_SCHEME_DATA,
    GET_ALL_PROSPECT_DETAILS_BY_PROS_ID, GET_ALL_SCHEME_MASTER, GET_ALL_USERS_DROPDOWN,
    GET_ALL_USERS_DROPDOWN_LIST, GET_COSTING_BY_PROJECT_UNITID,
    GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_,
    GET_UNIT_BY_BUILDER_PROJECT, PAYMENT_PLAN_DROPDOWN,
    PROSPECT_DROPDOWN, SAVE_FRESH_BOOKING_FORM, UPDATE_FRESH_BOOKING_FORM, UPDATE_FRESH_BOOKING_LEVEL
} from "../../helpers/url_helper";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import { RegexFile } from "../../helpers/RegexFile";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { formatDate, getDaysAgo, RequiredStar, roundToTwoDecimals } from "../../helpers/function_helper";
import { MdArrowBack, MdArrowForward, MdSave, MdPerson, MdAttachMoney, MdSettings, MdCheckCircle } from "react-icons/md";
import ApiClient from "../../helpers/api_helper";
import { decryptData } from "../../components/Common/CryptoUtils";

// ── CSS ───────────────────────────────────────────────────────────────────────
if (document.getElementById("fbe-s")) document.getElementById("fbe-s").remove()
const _s = document.createElement("style")
_s.id = "fbe-s"
_s.textContent = `

    /* ── Header card ── */
    .fbe-hdr { background: linear-gradient(135deg,#005B52 0%,#007A6E 60%,#00897B 100%); border-radius:16px; padding:20px 24px; margin-bottom:14px; position:relative; overflow:hidden; }
    .fbe-hdr::before { content:''; position:absolute; top:-40px; right:-40px; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,.05); pointer-events:none; }
    .fbe-hdr::after  { content:''; position:absolute; bottom:-50px; right:60px; width:120px; height:120px; border-radius:50%; background:rgba(255,255,255,.04); pointer-events:none; }
    .fbe-hdr-top { display:flex; align-items:center; justify-content:space-between; position:relative; }
    .fbe-fresh-id { font-size:10px; font-weight:800; color:rgba(255,255,255,.5); text-transform:uppercase; letter-spacing:.8px; }
    .fbe-hdr-title { font-size:18px; font-weight:800; color:#fff; margin-top:2px; }

    /* ── Progress bar ── */
    .fbe-progress-wrap { display:flex; align-items:center; gap:10px; }
    .fbe-progress-label { font-size:11px; color:rgba(255,255,255,.7); white-space:nowrap; }
    .fbe-progress-bar { width:140px; height:6px; background:rgba(255,255,255,.2); border-radius:99px; overflow:hidden; }
    .fbe-progress-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#C9A84C,#f5d060); transition:width .4s; }

    /* ── Card ── */
    .fbe-card { background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:20px 22px; box-shadow:0 1px 3px rgba(0,0,0,.04); margin-bottom:12px; }

    /* ── Field label + input ── */
    .fbe-lbl { font-size:11px; font-weight:700; color:#64748B; margin-bottom:5px; display:block; letter-spacing:.2px; }
    .fbe-input {
        width:100%; height:38px; padding:0 12px;
        border:1.5px solid #0b0b0b; border-radius:9px;
        font-size:13px; color:#0F172A; outline:none;
        transition:border-color .15s, box-shadow .15s; background:#fff;
    }
    .fbe-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }
    .fbe-input:disabled { background:#F8FAFC; color:#94A3B8; cursor:not-allowed; }
    .fbe-input.is-invalid { border-color:#EF4444; }
    .fbe-textarea {
        width:100%; padding:10px 12px; min-height:90px;
        border:1.5px solid #0b0b0b; border-radius:9px;
        font-size:13px; color:#0F172A; outline:none; resize:vertical;
        transition:border-color .15s;
    }
    .fbe-textarea:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }
    .fbe-textarea.is-invalid { border-color:#EF4444; }

    /* ── Costing display (readonly) ── */
    .fbe-cost-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(175px,1fr)); gap:0; }
    .fbe-cost-row { padding:9px 12px 9px 0; border-bottom:1px solid #F8FAFC; }
    .fbe-cost-row:nth-child(odd) { padding-right:20px; }
    .fbe-cost-k { font-size:10px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.4px; margin-bottom:3px; }
    .fbe-cost-v { font-size:13px; font-weight:600; color:#0F172A; }
    .fbe-cost-v.hi { color:#005B52; font-weight:700; }
    .fbe-cost-v.em { color:#CBD5E1; font-style:italic; font-weight:400; font-size:12px; }
    .fbe-total-cards { display:flex; gap:10px; flex-wrap:wrap; margin-top:14px; }
    .fbe-total-card { flex:1; min-width:150px; padding:14px 16px; border-radius:12px; }
    .fbe-total-card.green { background:linear-gradient(135deg,#f0fdf9,#e8f4f2); border:1.5px solid #005B5225; }
    .fbe-total-card.gold  { background:linear-gradient(135deg,#fffbeb,#fef3c7); border:1.5px solid #C9A84C30; }
    .fbe-total-card.blue  { background:linear-gradient(135deg,#EFF6FF,#DBEAFE); border:1.5px solid #BFDBFE; }
    .fbe-total-card .tc-k { font-size:10px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
    .fbe-total-card.green .tc-v { font-size:17px; font-weight:800; color:#005B52; }
    .fbe-total-card.gold  .tc-v { font-size:17px; font-weight:800; color:#92400E; }
    .fbe-total-card.blue  .tc-v { font-size:17px; font-weight:800; color:#1E40AF; }

    /* ── Section heading ── */
    .fbe-sec { display:flex; align-items:center; gap:8px; font-size:10px; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:.8px; margin:18px 0 12px; }
    .fbe-sec:first-child { margin-top:0; }
    .fbe-sec-line { flex:1; height:1px; background:#F1F5F9; }
    .fbe-sec-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

    /* ── Tabs ── */
    .fbe-tabs { display:flex; gap:3px; padding:4px; background:#F1F5F9; border-radius:12px; margin-bottom:20px; }
    .fbe-tab { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:9px 14px; font-size:12px; font-weight:600; color:#64748B; border:none; background:transparent; border-radius:9px; cursor:pointer; transition:all .15s; white-space:nowrap; }
    .fbe-tab:hover:not(.active) { background:rgba(255,255,255,.6); color:#334155; }
    .fbe-tab.active { background:#fff; color:#005B52; font-weight:700; box-shadow:0 1px 4px rgba(0,0,0,.1); }

    /* ── Field grid ── */
    .fbe-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
    .fbe-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
    .fbe-grid-2 { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
    @media(max-width:1100px){ .fbe-grid{ grid-template-columns:repeat(2,1fr); } }
    @media(max-width:700px){ .fbe-grid,.fbe-grid-3,.fbe-grid-2{ grid-template-columns:1fr; } }

    /* ── Radio pills ── */
    .fbe-radio-group { display:flex; gap:8px; }
    .fbe-radio-pill { display:flex; align-items:center; gap:6px; padding:7px 14px; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; border:1.5px solid #E2E8F0; background:#F8FAFC; color:#64748B; transition:all .15s; user-select:none; }
    .fbe-radio-pill input { display:none; }
    .fbe-radio-pill.active { border-color:#005B52; background:#f0fdf9; color:#005B52; }
    .fbe-radio-pill.active::before { content:''; display:inline-block; width:8px; height:8px; border-radius:50%; background:#005B52; }

    /* ── Actions ── */
    .fbe-actions { display:flex; align-items:center; gap:10px; padding:14px 20px; background:#fff; border:1px solid #E8ECF2; border-radius:12px; flex-wrap:wrap; margin-top:4px; }
    .fbe-btn { display:flex; align-items:center; gap:6px; padding:9px 20px; border-radius:9px; font-size:13px; font-weight:700; cursor:pointer; border:none; transition:all .15s; white-space:nowrap; }
    .fbe-btn-primary { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; }
    .fbe-btn-primary:hover { opacity:.88; }
    .fbe-btn-primary:disabled { opacity:.5; cursor:not-allowed; }
    .fbe-btn-secondary { background:#F1F5F9; color:#475569; }
    .fbe-btn-secondary:hover { background:#E2E8F0; }
    .fbe-nav { display:flex; justify-content:flex-end; gap:8px; margin-top:16px; padding-top:14px; border-top:1px solid #F1F5F9; }
    .fbe-nav-btn { display:flex; align-items:center; gap:5px; padding:7px 16px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; border:1.5px solid #E2E8F0; background:#fff; color:#64748B; transition:all .15s; }
    .fbe-nav-btn:hover:not(:disabled) { border-color:#005B52; color:#005B52; background:#f0fdf9; }
    .fbe-nav-btn:disabled { opacity:.4; cursor:not-allowed; }
    .fbe-nav-btn.p { background:#005B52; border-color:#005B52; color:#fff; }

    /* Reject box */
    .fbe-reject-box { background:#FEF2F2; border:1.5px solid #FECACA; border-radius:12px; padding:16px 18px; margin-bottom:12px; }
    .fbe-btn-danger { background:#FEF2F2; color:#DC2626; border:1.5px solid #FECACA; }
    .fbe-btn-danger:hover { background:#FEE2E2; }

    /* react-select override */
    .fbe .select__control { border-radius:9px!important; min-height:38px!important; font-size:13px!important; border:1.5px solid #070707!important; }
    .fbe .select__control--is-focused { border-color:#005B52!important; box-shadow:0 0 0 3px rgba(0,91,82,.08)!important; }
`
document.head.appendChild(_s)

// ── Helpers ───────────────────────────────────────────────────────────────────
const Sec = ({ label, color = "#005B52" }) => (
    <div className="fbe-sec">
        <span className="fbe-sec-dot" style={{ background: color }} />
        {label}
        <span className="fbe-sec-line" />
    </div>
)

const CostVal = ({ label, value, hi }) => {
    const empty = value === null || value === undefined || value === ""
    return (
        <div className="fbe-cost-row">
            <div className="fbe-cost-k">{label}</div>
            <div className={`fbe-cost-v${hi ? " hi" : ""}${empty ? " em" : ""}`}>{empty ? "—" : value}</div>
        </div>
    )
}

const selectStyles = {
    control: (b, st) => ({
        ...b, borderRadius: 9, minHeight: 38, fontSize: 13,
        border: `1.5px solid ${st.isFocused ? "#005B52" : "#E2E8F0"}`,
        boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.08)" : "none",
    }),
    option: (b, st) => ({
        ...b, fontSize: 13,
        background: st.isSelected ? "#005B52" : st.isFocused ? "#f0fdf9" : "#fff",
        color: st.isSelected ? "#fff" : "#0F172A",
    }),
    menuPortal: b => ({ ...b, zIndex: 9999 }),
    placeholder: b => ({ ...b, color: "#94A3B8", fontSize: 13 }),
    singleValue: b => ({ ...b, fontSize: 13 }),
}

// ── Component ─────────────────────────────────────────────────────────────────
const FreshBookingEntryLevel1 = () => {
    const location = useLocation()
    const mtSchemeInitialized = useRef(false);
    const mtPaySchemeInitialized = useRef(false);
    const { rowData, formState, page, searchByGroupSelect, searchTerm, activeTabName } = location.state || {}
    const userId = useUserStore(s => s.user.userId)
    const [activeTab, setActiveTab] = useState(1)
    const [unitData, setUnitData] = useState([])
    const navigation = useNavigate()
    const { empCode, userName } = useUserStore((state) => state.user);
    const [isPending, setIsPending] = useState(false)
    const [prospectData, setProspectData] = useState({})
    const { data: mtPayList } = useGet(DROPDOWN_MT_PAY_SCHEME_DATA);

    const [formData, setFormData] = useState({
        associate: null, builder: null, project: null, unit: null,
        revenue: null, prospect: null, bookingType: null,
        tempUnit: "", tempArea: "", tempTurnOver: "",
        freshBookingType: "Pending", rewardPoints: 0, tokenMoney: '', applicationFormStatus: null
    })

    const [formStateTab1, setFormStateTab1] = useState({
        applicantName: "", applicantAddress: "", contactNum1: "", contactNum2: "",
        emailId: "", dob: "", aadhar: "", pan: "",
        coApplicantName: "", coApplicantDob: "", coApplicantAddress: "",
        coApplicantContactNum1: "", coApplicantContactNum2: "",
        coApplicantEmailId: "", coApplicantAadhar: "", coApplicantPan: "",
    })
    const [formStateTab2, setFormStateTab2] = useState({ unitStatus: null, paymentPlan: null, raPercent: 0, rcPercent: 0 })
    const [formStateTab3, setFormStateTab3] = useState({
        bookingStatus: null, location: null, bookingDate: "", propType: null,
        saleStatus: null, schemeIncentive: null, incentiveId: null, formStage: null,
        loanSelfFunding: null, kycStatus: null, kycCompletionDate: "",
        soReceiveDate: "", soDispatchDate: "", acceptanceDateByBuilder: "",
        clientBBAStatus: "", remarks: "", connectBookingStatus: null,
        connectSuspectName: null, bookingRange: null, mtScheme: null, builderSchemeRemark: "", mtPayScheme: null
    })
    const [errors, setErrors] = useState({})

    const bookingTypeGrp = useMemo(() => [{ label: "Fresh", value: "Fresh" }, { label: "Resale", value: "Resale" }], [])
    const unitStatusOptions = [{ label: "Admin Pre Sold", value: "adminPreSold" }, { label: "Hold", value: "hold" }, { label: "Open", value: "open" }, { label: "Pre Sold", value: "preSold" }, { label: "Sold", value: "sold" }]
    const propTypeOptions = [{ value: 22, label: "Commercial" }, { value: 25, label: "Plot" }, { value: 24, label: "Residential" }, { value: 23, label: "Retail" }]
    const schemeOptions = [{ value: 12, label: "No" }, { value: 11, label: "Yes" }]
    const incentiveOptions = [{ value: "BUILDER", label: "Builder" }, { value: "MTRS", label: "MTRS" }, { value: "NA", label: "Not Applicable" }]
    const loanSelfFundingOptions = [{ value: 1, label: "Loan" }, { value: 2, label: "Self" }]
    const connectBookingStatusGroup = [{ value: "MT", label: "MT" }, { value: "MTC", label: "MTC" }]
    const planRangeList = [
        { label: "0-50 Lakh", value: "0-50 Lakh" }, { label: "50 Lakh - 1 Cr.", value: "50 Lakh - 1 Cr." },
        { label: "1 Cr. - 1.5 Cr.", value: "1 Cr. - 1.5 Cr." }, { label: "1.5 Cr. - 2 Cr.", value: "1.5 Cr. - 2 Cr." },
        { label: "Greator than 2 Cr.", value: "Greator than 2 Cr." }
    ]

    const { data: schemeList, } = useGet(`${GET_ALL_SCHEME_MASTER}`);
    const mtSchemeOptions =
        schemeList?.data?.data
            ?.filter(item => item.active)
            ?.map(l => ({
                value: l.id,
                label: l.scheme
            })) || [];

    // ── Handlers (all original logic preserved) ────────────────────────────────
    const handleChangeTab1 = (e) => {
        const { name, value } = e.target
        let newErrors = { ...errors }
        const numericFields = ["contactNum1", "contactNum2", "coApplicantContactNum1", "coApplicantContactNum2"]
        if (name === "pan" || name === "coApplicantPan") {
            const upperCaseValue = value.toUpperCase()
            const isValidPan = RegexFile.panNo.test(upperCaseValue)
            if (!upperCaseValue) newErrors[name] = `${name === "pan" ? "PAN Number" : "Co-Applicant PAN Number"} is required`
            else if (!isValidPan) newErrors[name] = `${name === "pan" ? "PAN Number" : "Co-Applicant PAN Number"} must be in the format AAAAA1234A.`
            else newErrors[name] = ""
            setFormStateTab1({ ...formStateTab1, [name]: upperCaseValue })
        } else if (name === "emailId") {
            const isValidEmail = RegexFile.email.test(value)
            if (!value) newErrors.emailId = "Email ID is required"
            else if (!isValidEmail) newErrors.emailId = "Invalid email format."
            else newErrors.emailId = ""
            setFormStateTab1({ ...formStateTab1, [name]: value })
        } else if (name === "dob") {
            if (!value) newErrors.dob = "Date of Birth is required"
            else newErrors.dob = ""
            setFormStateTab1({ ...formStateTab1, [name]: value })
        } else if (name === "aadhar" || name === "coApplicantAadhar") {
            const numericValue = value.replace(/[^0-9]/g, "").slice(0, 12)
            if (!numericValue) newErrors[name] = `${name === "aadhar" ? "Aadhar Number" : "Co-Applicant Aadhar Number"} is required`
            else if (numericValue.length !== 12) newErrors[name] = `${name === "aadhar" ? "Aadhar Number" : "Co-Applicant Aadhar Number"} must be 12 digits.`
            else newErrors[name] = ""
            setFormStateTab1({ ...formStateTab1, [name]: numericValue })
        } else if (numericFields.includes(name)) {
            setFormStateTab1({ ...formStateTab1, [name]: value.replace(/[^0-9]/g, "").slice(0, 10) })
        } else {
            setFormStateTab1({ ...formStateTab1, [name]: value })
        }
        setErrors(prev => ({ ...prev, [name]: "" }))
    }

    const handleChangeTab2 = (e) => {
        const { name, value } = e.target
        setFormStateTab2({ ...formStateTab2, [name]: value })
        setErrors(prev => ({ ...prev, [name]: "" }))
    }

    const handleChangeTab3 = (e) => {
        const { name, value } = e.target
        setFormStateTab3({ ...formStateTab3, [name]: value })
        setErrors(prev => ({ ...prev, [name]: "" }))
    }

    const handlePaymentPlanChange = (selectedOption) => setFormStateTab2({ ...formStateTab2, paymentPlan: selectedOption })

    const handleChangeSelect = (selectedOption, fieldName) => {
        setFormData(prev => ({ ...prev, [fieldName]: selectedOption }))
        setErrors(prev => ({ ...prev, [fieldName]: "" }))
        if (fieldName === "project") mutateUnitData()
    }

    const handleChangeSelectTab3 = (selectedOption, fieldName) => setFormStateTab3(prev => ({ ...prev, [fieldName]: selectedOption }))

    const handleBookingTypeChange = (event) => setFormData(prev => ({ ...prev, freshBookingType: event.target.value }))

    const handleApplicationFormStatusChange = (event) => setFormData(prev => ({ ...prev, applicationFormStatus: event.target.value }))

    // ── API hooks ──────────────────────────────────────────────────────────────
    const { isPending: addLoadingUnit, mutate: mutateUnitData } = usePut(
        `${GET_UNIT_BY_BUILDER_PROJECT}${formData?.builder?.value}&projectName=${formData?.project?.value}`,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    if (Object.keys(rowData).length === 0) setUnitData(response?.data?.data)
                    else setUnitData([{ label: rowData.projectUnitName, value: rowData.projectUnitId }, ...response?.data?.data])
                } else if (response.data.message === "No record found !") {
                    setUnitData([{ label: rowData?.projectUnitName, value: rowData?.projectUnitId }])
                }
            },
            onError: (err) => toast.error(err.message),
        }
    )

    useEffect(() => { if (formData?.project?.value && formData?.builder?.value) mutateUnitData() }, [formData?.builder, formData?.project, mutateUnitData])

    const { data: prospectDetails } = useGet(GET_ALL_PROSPECT_DETAILS_BY_PROS_ID + formData?.prospect?.value, { enabled: Boolean(formData?.prospect?.value) })

    useEffect(() => {
        if (prospectDetails?.data) {
            decryptData(prospectDetails?.data).then((decryptedData) => {
                if (decryptedData) {
                    setProspectData(decryptedData);
                } else {
                    setProspectData({})
                }
            });
        }
    }, [prospectDetails]);
    const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_)
    const { data: paymentPlanList } = useGet(PAYMENT_PLAN_DROPDOWN)
    const { data: associateList, isLoading: loadingAssociate } = useGet(Object.keys(rowData).length === 0 ? GET_ALL_USERS_DROPDOWN : GET_ALL_USERS_DROPDOWN_LIST)
    const { data: prospectList, isLoading: loadingProsList } = useGet(PROSPECT_DROPDOWN + formData?.associate?.value, { enabled: Boolean(formData?.associate?.value) })
    const { data: projectData } = useGet(`${GET_PROJECT_BY_BUILDER_}${formData?.builder?.value}`, { enabled: !!formData.builder?.value })
    const { data: costingData } = useGet(`${GET_COSTING_BY_PROJECT_UNITID}=${formData?.unit?.value}`, { enabled: Boolean(formData?.unit) })

    const tab2CostingData = costingData?.data?.data

    const { isPending: addFreshBookingLoading, mutate: addFreshBooking } = usePost(`${SAVE_FRESH_BOOKING_FORM}${userId}`, {
        onSuccess: (response) => { if (response?.data.status === 1) { toast.success(response.data.message); handleCancel() } else toast.error(response.data.message) },
        onError: (err) => toast.error(err.message),
    })
    const { isPending: updateFreshBookingLoading, mutate: updateFreshBooking } = usePut(`${UPDATE_FRESH_BOOKING_FORM}${userId}`, {
        onSuccess: (response) => { if (response?.data.status === 1) { toast.success(response.data.message); handleCancel() } else toast.error(response.data.message) },
        onError: (err) => toast.error(err.message),
    })

    const callLevelApi = (isApproved) => {
        const params = new URLSearchParams({
            freshSaleId: rowData?.id,
            freshFormLevel: "LEVEL1",
            isApproved,
            loginId: userName + '  (' + empCode + ')',
        })
        if (!window.confirm("Are you sure you want to move this booking to next level?")) return;
        setIsPending(true)
        ApiClient.post(
            `${UPDATE_FRESH_BOOKING_LEVEL}?${params.toString()}`,
        )
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    handleCancel()
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    }
    const handleMoveToNext = () => callLevelApi('YES', null)

    const calculateFilledPercentage = () => {
        const fieldsToCheck = [
            formData.associate, formData.builder, formData.project, formData.unit, formData.prospect, formData.bookingType,
            formStateTab1.applicantName, formStateTab1.applicantAddress, formStateTab1.contactNum1,
            formStateTab1.dob, formStateTab1.aadhar, formStateTab1.pan,
            formStateTab2.paymentPlan, formStateTab2.raPercent, formStateTab2.rcPercent,
            formStateTab3.soReceiveDate, formStateTab3.propType, formStateTab3.schemeIncentive,
            formStateTab3.incentiveId, formStateTab3.loanSelfFunding, formStateTab3.remarks, formStateTab3.mtScheme, formStateTab3.builderSchemeRemark, formData.applicationFormStatus
        ]
        const filledFields = fieldsToCheck.filter(v => v !== null && v !== undefined && v !== "").length
        return Math.round((filledFields / fieldsToCheck.length) * 100)
    }

    const handleSave = () => {
        if (!formData?.associate) { toast.error("Select Associate is Required"); return }
        if (!formData?.unit && (formData?.tempUnit === "" || formData?.tempArea === "" || formData?.tempTurnOver === "")) { toast.error("Temp Fields are Required"); return }
        if (!formStateTab3?.soReceiveDate) { toast.error("SO Received date is Required"); return }
        if (formStateTab3.mtScheme?.label === "MTpay" && !formStateTab3.mtPayScheme) { toast.error("MTpay Scheme is Required"); return }
        const percentage = calculateFilledPercentage()
        let params = {
            id: rowData.id || 0,
            builderName: formData?.builder?.label || "", projectName: formData?.project?.label || "",
            projectId: formData?.project?.value || 0, builderId: formData?.builder?.value || 0,
            associateId: formData?.associate?.value || 0, associateName: formData?.associate?.label || "",
            projectunitId: formData?.unit?.value || 0, projectUnitName: formData?.unit?.label || "",
            clientName: formStateTab1?.applicantName || "", clientAddress: formStateTab1?.applicantAddress || "",
            clientPhone: formStateTab1?.contactNum1 || "", clientPhone2: formStateTab1?.contactNum2 || "",
            clientEmail: formStateTab1?.emailId || "", clientDob: formStateTab1?.dob || "",
            clientAddharCard: formStateTab1?.aadhar || "", clientPan: formStateTab1?.pan || "",
            coApplicantName: formStateTab1?.coApplicantName || "", coApplicantAddress: formStateTab1?.coApplicantAddress || "",
            coApplicantPhone: formStateTab1?.coApplicantContactNum1 || "", coApplicantPhone2: formStateTab1?.coApplicantContactNum2 || "",
            coApplicantEmail: formStateTab1?.coApplicantEmailId || "", coApplicantDob: formStateTab1?.coApplicantDob || "",
            coApplicantAddharCard: formStateTab1?.coApplicantAadhar || "", coApplicantPan: formStateTab1?.coApplicantPan || "",
            bookingStatusId: formStateTab3?.bookingStatus?.value || 0, locationId: rowData?.locationId || 0,
            bookingDate: formStateTab3?.bookingDate || "", propTypeId: formStateTab3?.propType?.value || 0,
            saleStatusId: formStateTab3?.saleStatus?.value || 0, schemaIncentiveId: formStateTab3?.schemeIncentive?.value || 0,
            incentiveId: formStateTab3?.incentiveId?.value || null, formStageId: formStateTab3?.formStage?.value || 0,
            loanSelfFundingId: formStateTab3?.loanSelfFunding?.value || 0, kycStatusId: formStateTab3?.kycStatus?.value || 0,
            kycDate: formStateTab3?.kycCompletionDate || "", remarks: formStateTab3?.remarks || "",
            soReceiveDate: formStateTab3?.soReceiveDate || "", soDispatchDate: formStateTab3?.soDispatchDate || "",
            acceptanceDateByBuilder: formStateTab3?.acceptanceDateByBuilder || "",
            clientBbaStatus: formStateTab3?.clientBBAStatus || "",
            ra_percent: formStateTab2?.raPercent || 0, rc_percent: formStateTab2?.rcPercent || 0,
            unitStatus: formData?.unit?.value && "sold", paymentPlan: formStateTab2?.paymentPlan?.value || "",
            prospectId: formData?.prospect?.value || "", prospectName: formData?.prospect?.label || "",
            bookingType: formData?.bookingType?.value || "", bookingCompletePercentage: percentage || "",
            connectBookingStatus: formStateTab3?.connectBookingStatus?.value || null,
            connectSuspectName: formStateTab3?.connectBookingStatus?.value === "MTC" ? formStateTab3.connectSuspectName?.label : "" || "",
            connectSuspectId: formStateTab3?.connectBookingStatus?.value === "MTC" ? formStateTab3.connectSuspectName?.value : 0 || 0,
            bookingRange: formStateTab3?.connectBookingStatus?.value === "MTC" ? formStateTab3?.bookingRange?.value : "" || "",
            tempUnit: formData?.tempUnit || "", tempArea: formData?.tempArea || "", tempTurnOver: formData?.tempTurnOver || "",
            freshBookingType: formData?.freshBookingType, rewardPoint: formData?.rewardPoints,
            mtrsScheme: formStateTab3?.mtScheme?.label || null,
            builderSchemeRemark: formStateTab3?.builderSchemeRemark || "",
            tokenMoney: formData?.tokenMoney || "",
            mtPayScheme: formStateTab3?.mtPayScheme?.label || null,
            firstPayout: formStateTab3?.mtPayScheme?.value || 0,
            applicationFormStatus: formData?.applicationFormStatus || null
        }
        if (Object.keys(rowData).length === 0) addFreshBooking(params)
        else updateFreshBooking(params)
    }

    const handleCancel = () => navigation("/first-level-fresh-booking", { state: { formState, page, searchByGroupSelect, searchTerm, activeTabName } })

    useEffect(() => {
        if (Object.keys(rowData).length > 0) {
            setFormData(prev => ({
                ...prev,
                tempUnit: rowData?.tempUnit,
                tempArea: rowData?.tempArea,
                tempTurnOver: rowData?.tempTurnOver,
                freshBookingType: rowData?.freshBookingType,
                rewardPoints: rowData?.rewardPoint || 0,
                tokenMoney: rowData?.tokenMoney || "",
                applicationFormStatus:rowData?.applicationFormStatus||null
            }));

            setFormStateTab1(prev => ({
                ...prev,
                applicantName: rowData?.clientName,
                applicantAddress: rowData?.clientAddress,
                contactNum1: rowData?.clientPhone,
                contactNum2: rowData?.clientPhone2,
                emailId: rowData?.clientEmail,
                dob: rowData?.clientDob,
                aadhar: rowData?.clientAddharCard,
                pan: rowData?.clientPan,
                coApplicantName: rowData?.coApplicantName,
                coApplicantDob: rowData?.coApplicantDob,
                coApplicantAddress: rowData?.coApplicantAddress,
                coApplicantContactNum1: rowData?.coApplicantPhone,
                coApplicantContactNum2: rowData?.coApplicantPhone2,
                coApplicantEmailId: rowData?.coApplicantEmail,
                coApplicantAadhar: rowData?.coApplicantAddharCard,
                coApplicantPan: rowData?.coApplicantPan
            }));

            setFormStateTab2(prev => ({
                ...prev,
                raPercent: rowData?.ra_percent,
                rcPercent: rowData?.rc_percent
            }));

            setFormStateTab3(prev => ({
                ...prev,
                location: rowData?.locationName || "",
                builderSchemeRemark: rowData?.builderSchemeRemark || "",
                bookingDate: rowData?.bookingDate
                    ? rowData.bookingDate.split(" ")[0]
                    : "",
                soReceiveDate: rowData?.soReceiveDate
                    ? rowData.soReceiveDate.split(" ")[0]
                    : "",
                remarks: rowData?.remarks
            }));
        }
    }, []);

    useEffect(() => {
        if (mtSchemeInitialized.current) return;
        if (!rowData?.mtrsScheme) return;
        if (!mtSchemeOptions.length) return;

        const selected = mtSchemeOptions.find(
            r => r.label === rowData.mtrsScheme
        );

        if (selected) {
            setFormStateTab3(prev => ({
                ...prev,
                mtScheme: selected,
            }));

            mtSchemeInitialized.current = true;
        }
    }, [mtSchemeOptions, rowData?.mtrsScheme]);

    useEffect(() => {
        if (!rowData?.propTypeId) return;

        setFormStateTab3(prev => ({
            ...prev,
            propType:
                propTypeOptions.find(
                    r => r.value == rowData.propTypeId
                ) || null
        }));
    }, []);
    useEffect(() => {
        if (!rowData?.schemaIncentiveId) return;

        setFormStateTab3(prev => ({
            ...prev,
            schemeIncentive:
                schemeOptions.find(
                    r => r.value == rowData.schemaIncentiveId
                ) || null
        }));
    }, []);
    useEffect(() => {
        if (!rowData?.incentiveId) return;

        setFormStateTab3(prev => ({
            ...prev,
            incentiveId:
                incentiveOptions.find(
                    r => r.value == rowData.incentiveId
                ) || null
        }));
    }, []);
    useEffect(() => {
        if (!rowData?.loanSelfFundingId) return;

        setFormStateTab3(prev => ({
            ...prev,
            loanSelfFunding:
                loanSelfFundingOptions.find(
                    r => r.value == rowData.loanSelfFundingId
                ) || null
        }));
    }, []);
    useEffect(() => {
        if (!rowData?.connectBookingStatus) return;

        setFormStateTab3(prev => ({
            ...prev,
            connectBookingStatus:
                connectBookingStatusGroup.find(
                    r => r.value == rowData.connectBookingStatus
                ) || null
        }));
    }, []);
    useEffect(() => {
        if (!rowData?.bookingRange) return;

        setFormStateTab3(prev => ({
            ...prev,
            bookingRange:
                planRangeList.find(
                    r => r.value == rowData.bookingRange
                ) || null
        }));
    }, []);

    useEffect(() => {
        if (mtPaySchemeInitialized.current) return;
        if (!rowData?.mtPayScheme) return;
        if (!mtPayList?.data?.data?.length) return;

        const selected = mtPayList?.data?.data?.find(
            r => r.label === rowData.mtPayScheme
        );

        if (selected) {
            setFormStateTab3(prev => ({
                ...prev,
                mtPayScheme: selected,
            }));

            mtPaySchemeInitialized.current = true;
        }
    }, [mtPayList?.data?.data, rowData?.mtPayScheme]);

    useEffect(() => {
        if (tab2CostingData?.unitStatus && Object.keys(rowData).length > 0) {
            const opt = unitStatusOptions.find(o => o.value === tab2CostingData.unitStatus)
            if (opt) setFormStateTab2(prev => ({ ...prev, unitStatus: opt }))
        }
    }, [tab2CostingData])

    useEffect(() => {
        if (Object.keys(rowData).length === 0) {
            const d = prospectData
            setFormStateTab1(prev => ({ ...prev, applicantName: d?.clientName, applicantAddress: d?.clientAddress, contactNum1: d?.phoneNo }))
        } else {
            setFormStateTab1(prev => ({ ...prev, contactNum1: prospectData?.phoneNo }))
        }
    }, [prospectData, rowData])

    useEffect(() => { if (rowData?.associateId) { const a = Array.isArray(associateList?.data?.data) ? associateList?.data?.data?.find(i => i.value === rowData.associateId) : null; if (a) setFormData(prev => ({ ...prev, associate: a })) } }, [associateList?.data?.data, rowData?.associateId])
    useEffect(() => { if (rowData?.bookingType) { const b = bookingTypeGrp.find(i => i.label === rowData.bookingType); if (b) setFormData(prev => ({ ...prev, bookingType: b })) } }, [associateList?.data?.data, rowData?.associateId])
    useEffect(() => { if (rowData?.paymentPlan) { const p = Array.isArray(paymentPlanList?.data?.data) ? paymentPlanList?.data?.data?.find(i => i.value == rowData.paymentPlan) : null; if (p) setFormStateTab2(prev => ({ ...prev, paymentPlan: p })) } }, [paymentPlanList?.data?.data, rowData?.paymentPlan])
    useEffect(() => { if (rowData?.projectUnitId) { const u = Array.isArray(unitData) ? unitData?.find(i => i.value === rowData?.projectUnitId) : null; if (u) setFormData(prev => ({ ...prev, unit: u })) } }, [rowData?.projectUnitId, unitData])
    useEffect(() => { if (rowData?.projectName) { const p = Array.isArray(projectData?.data?.data) ? projectData?.data?.data?.find(i => i.label === rowData.projectName) : null; if (p) setFormData(prev => ({ ...prev, project: p })) } }, [projectData?.data?.data, rowData?.projectName])
    useEffect(() => { if (rowData?.builderName) { const b = Array.isArray(builderList?.data?.data) ? builderList?.data?.data?.find(i => i.label === rowData.builderName) : null; if (b) setFormData(prev => ({ ...prev, builder: b })) } }, [builderList?.data?.data, rowData?.builderName])
    useEffect(() => { if (rowData?.prospectId) { const p = Array.isArray(prospectList?.data?.data) ? prospectList?.data?.data?.find(i => i.value === rowData.prospectId) : null; if (p) setFormData(prev => ({ ...prev, prospect: p })) } }, [prospectList?.data?.data, rowData?.prospectId])

    const days = prospectData?.createdDate ? getDaysAgo(prospectData.createdDate) : null
    const isNew = Object.keys(rowData).length === 0

    const TABS = [
        { id: 1, label: "Basic Info", icon: <MdPerson size={13} /> },
        { id: 2, label: "Costing", icon: <MdAttachMoney size={13} /> },
        { id: 3, label: "Other Details", icon: <MdSettings size={13} /> },
    ]

    return (
        <PageContent>
            <div className="fbe">
                {(addFreshBookingLoading || updateFreshBookingLoading || addLoadingUnit || loadingAssociate || loadingProsList || isPending) && <ScreenLoader />}
                <Container fluid>
                    <Breadcrumbs title="Transaction" breadcrumbItem={isNew ? "Fresh Booking Entry" : "Update Fresh Booking"} />

                    {/* ── HEADER ── */}
                    <div className="fbe-hdr">
                        <div className="fbe-hdr-top">
                            <div>
                                {rowData?.id && <div className="fbe-fresh-id">Fresh ID #{rowData.id}</div>}
                                <div className="fbe-hdr-title">{isNew ? "New Fresh Booking" : "Update Booking"}</div>
                                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                                    {rowData?.locationName && (
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.2)" }}>
                                            📍 {rowData.locationName}
                                        </span>
                                    )}
                                    {formData?.bookingType?.label && (
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(201,168,76,.25)", color: "#f5d060", border: "1px solid rgba(201,168,76,.4)" }}>
                                            {formData.bookingType.label}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="fbe-progress-wrap">
                                <span className="fbe-progress-label">{rowData?.bookingCompletePercentage}% complete</span>
                                <div className="fbe-progress-bar">
                                    <div className="fbe-progress-fill" style={{ width: `${rowData?.bookingCompletePercentage}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── TOP FIELDS CARD ── */}
                    <div className="fbe-card">
                        <Sec label="Booking Info" color="#005B52" />
                        <div className="fbe-grid">
                            {/* Associate */}
                            <div>
                                <label className="fbe-lbl">Associate <RequiredStar /></label>
                                <Select classNamePrefix="select" value={formData.associate} isClearable
                                    onChange={opt => handleChangeSelect(opt, "associate")}
                                    options={Array.isArray(associateList?.data?.data) ? associateList?.data?.data : []}
                                    styles={selectStyles} menuPortalTarget={document.body}
                                    className={errors.associate ? "is-invalid" : ""} />
                            </div>
                            {/* Branch Location */}
                            <div>
                                <label className="fbe-lbl">Branch Location</label>
                                <input className="fbe-input form-control" placeholder="Branch Location" value={rowData?.locationName || ""} disabled />
                            </div>
                            {/* Builder */}
                            <div>
                                <label className="fbe-lbl">Builder <RequiredStar /></label>
                                <Select classNamePrefix="select" value={formData.builder} isClearable
                                    onChange={opt => handleChangeSelect(opt, "builder")}
                                    options={Array.isArray(builderList?.data?.data) ? builderList?.data?.data : []}
                                    styles={selectStyles} menuPortalTarget={document.body}
                                    className={errors.builder ? "is-invalid" : ""} />
                            </div>
                            {/* Project */}
                            <div>
                                <label className="fbe-lbl">Project <RequiredStar /></label>
                                <Select classNamePrefix="select" value={formData.project} isClearable isDisabled={!formData.builder}
                                    onChange={opt => handleChangeSelect(opt, "project")}
                                    options={Array.isArray(projectData?.data?.data) ? projectData?.data?.data : []}
                                    styles={selectStyles} menuPortalTarget={document.body}
                                    className={errors.project ? "is-invalid" : ""} />
                            </div>
                            {/* Unit */}
                            <div>
                                <label className="fbe-lbl">Unit <RequiredStar /></label>
                                <Select classNamePrefix="select" value={formData.unit} isClearable isDisabled={!formData.project}
                                    onChange={opt => handleChangeSelect(opt, "unit")}
                                    options={Array.isArray(unitData) ? unitData : []}
                                    styles={selectStyles} menuPortalTarget={document.body}
                                    className={errors.unit ? "is-invalid" : ""} />
                            </div>
                            {/* Prospect */}
                            <div>
                                <label className="fbe-lbl">Prospect <RequiredStar /></label>
                                <Select classNamePrefix="select" value={formData.prospect} isClearable isDisabled={!formData.associate}
                                    onChange={opt => handleChangeSelect(opt, "prospect")}
                                    options={Array.isArray(prospectList?.data?.data) ? prospectList?.data?.data : []}
                                    styles={selectStyles} menuPortalTarget={document.body}
                                    className={errors.prospect ? "is-invalid" : ""} />
                            </div>
                            {/* Prospect ID */}
                            <div>
                                <label className="fbe-lbl">Prospect ID</label>
                                <input className="fbe-input form-control" placeholder="Select Prospect First" value={prospectData?.prospectId || ""} disabled />
                            </div>
                            {/* Prospect Date */}
                            <div>
                                <label className="fbe-lbl">
                                    Prospect Created
                                    {days !== null && (
                                        <span
                                            style={{
                                                marginLeft: 6,
                                                fontSize: 10,
                                                fontWeight: 700,
                                                padding: "1px 8px",
                                                borderRadius: 20,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                whiteSpace: "nowrap",
                                                color: days < 15 ? "#DC2626" : "#166534",
                                                background: days < 15 ? "#FEF2F2" : "#F0FDF4",
                                            }}
                                        >
                                            {days}d ago
                                            {prospectData?.transferred === 1 && (
                                                <span style={{ marginLeft: 6 }}>
                                                    - Transferred
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </label>
                                <input className="fbe-input form-control" placeholder="Select Prospect First" value={formatDate(prospectData?.createdDate) || ""} disabled />
                            </div>
                            {/* Booking Type */}
                            <div>
                                <label className="fbe-lbl">Booking Type <RequiredStar /></label>
                                <Select classNamePrefix="select" value={formData.bookingType} isClearable
                                    onChange={opt => handleChangeSelect(opt, "bookingType")}
                                    options={bookingTypeGrp} styles={selectStyles} menuPortalTarget={document.body}
                                    className={errors.bookingType ? "is-invalid" : ""} />
                            </div>
                            {/* Temp Unit */}
                            <div>
                                <label className="fbe-lbl">Temp Unit</label>
                                <input className="fbe-input form-control" placeholder="Temp Unit" value={formData.tempUnit}
                                    onChange={e => setFormData({ ...formData, tempUnit: e.target.value })} />
                            </div>
                            {/* Temp Area */}
                            <div>
                                <label className="fbe-lbl">Temp Area</label>
                                <input className="fbe-input form-control" placeholder="Temp Area" value={formData.tempArea || ""}
                                    onChange={e => setFormData({ ...formData, tempArea: e.target.value })} />
                            </div>
                            {/* Temp Turnover */}
                            <div>
                                <label className="fbe-lbl">Temp Turnover</label>
                                <input className="fbe-input form-control" placeholder="Temp Turnover" value={formData.tempTurnOver || ""}
                                    onChange={e => setFormData({ ...formData, tempTurnOver: e.target.value })} />
                            </div>
                            {/* Fresh Booking Type radio */}
                            <div>
                                <label className="fbe-lbl">Stage <RequiredStar /></label>
                                <div className="fbe-radio-group">
                                    {["Pending", "EOI"].map(val => (
                                        <label key={val} className={`fbe-radio-pill${formData.freshBookingType === val ? " active" : ""}`}>
                                            <input type="radio" value={val} checked={formData.freshBookingType === val} onChange={handleBookingTypeChange} />
                                            {val}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {/* Reward Points */}
                            <div>
                                <label className="fbe-lbl">Reward Points</label>
                                <input className="fbe-input form-control" type="text" placeholder="Reward Points" value={formData.rewardPoints}
                                    onChange={e => setFormData(prev => ({ ...prev, rewardPoints: e.target.value }))} />
                            </div>
                            <div>
                                <label className="fbe-lbl">Token Money</label>
                                <input className="fbe-input form-control" type="number" placeholder="Token Money" value={formData.tokenMoney}
                                    onChange={e => setFormData(prev => ({ ...prev, tokenMoney: e.target.value }))} />
                            </div>

                            <div>
                                <label className="fbe-lbl">Application Form Status <RequiredStar /></label>
                                <div className="fbe-radio-group">
                                    {["Received", "Not Received"].map(val => (
                                        <label key={val} className={`fbe-radio-pill${formData.applicationFormStatus === val ? " active" : ""}`}>
                                            <input type="radio" value={val} checked={formData.applicationFormStatus === val} onChange={handleApplicationFormStatusChange} />
                                            {val}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── TABBED CARD ── */}
                    <div className="fbe-card">
                        <div className="fbe-tabs">
                            {TABS.map(t => (
                                <button key={t.id} className={`fbe-tab${activeTab === t.id ? " active" : ""}`} onClick={() => setActiveTab(t.id)}>
                                    {t.icon} {t.label}
                                </button>
                            ))}
                        </div>

                        {/* ── TAB 1: Basic Info ── */}
                        {activeTab === 1 && (
                            <>
                                <Sec label="Applicant" color="#005B52" />
                                <div className="fbe-grid">
                                    <div><label className="fbe-lbl">Name <RequiredStar /></label><input className={`fbe-input form-control${errors.applicantName ? " is-invalid" : ""}`} type="text" name="applicantName" value={formStateTab1.applicantName} onChange={handleChangeTab1} placeholder="Applicant name" /></div>
                                    <div><label className="fbe-lbl">Contact 1 <RequiredStar /></label><input className={`fbe-input form-control${errors.contactNum1 ? " is-invalid" : ""}`} type="text" name="contactNum1" value={formStateTab1.contactNum1} onChange={handleChangeTab1} placeholder="Contact 1" /></div>
                                    <div><label className="fbe-lbl">Contact 2</label><input className="fbe-input form-control" type="text" name="contactNum2" value={formStateTab1.contactNum2} onChange={handleChangeTab1} placeholder="Contact 2" /></div>
                                    <div><label className="fbe-lbl">Email</label><input className={`fbe-input form-control${errors.emailId ? " is-invalid" : ""}`} type="email" name="emailId" value={formStateTab1.emailId} onChange={handleChangeTab1} placeholder="Email" /></div>
                                    <div><label className="fbe-lbl">Date of Birth <RequiredStar /></label><input className={`fbe-input form-control${errors.dob ? " is-invalid" : ""}`} type="date" name="dob" value={formStateTab1.dob} onChange={handleChangeTab1} /></div>
                                    <div><label className="fbe-lbl">Aadhar <RequiredStar /></label><input className={`fbe-input form-control${errors.aadhar ? " is-invalid" : ""}`} type="text" name="aadhar" maxLength={12} value={formStateTab1.aadhar} onChange={handleChangeTab1} placeholder="12-digit Aadhar" /></div>
                                    <div><label className="fbe-lbl">PAN <RequiredStar /></label><input className={`fbe-input form-control${errors.pan ? " is-invalid" : ""}`} type="text" name="pan" maxLength={10} value={formStateTab1.pan} onChange={handleChangeTab1} placeholder="AAAAA1234A" /></div>
                                    <div><label className="fbe-lbl">Address <RequiredStar /></label><input className={`fbe-input form-control${errors.applicantAddress ? " is-invalid" : ""}`} type="text" name="applicantAddress" value={formStateTab1.applicantAddress} onChange={handleChangeTab1} placeholder="Address" /></div>
                                </div>

                                <Sec label="Co-Applicant" color="#C9A84C" />
                                <div className="fbe-grid">
                                    <div><label className="fbe-lbl">Name</label><input className="fbe-input" type="text" name="coApplicantName" value={formStateTab1.coApplicantName} onChange={handleChangeTab1} placeholder="Co-applicant name" /></div>
                                    <div><label className="fbe-lbl">Contact 1</label><input className="fbe-input" type="text" name="coApplicantContactNum1" value={formStateTab1.coApplicantContactNum1} onChange={handleChangeTab1} placeholder="Contact 1" /></div>
                                    <div><label className="fbe-lbl">Contact 2</label><input className="fbe-input" type="text" name="coApplicantContactNum2" value={formStateTab1.coApplicantContactNum2} onChange={handleChangeTab1} placeholder="Contact 2" /></div>
                                    <div><label className="fbe-lbl">Email</label><input className="fbe-input" type="email" name="coApplicantEmailId" value={formStateTab1.coApplicantEmailId} onChange={handleChangeTab1} placeholder="Email" /></div>
                                    <div><label className="fbe-lbl">DOB</label><input className="fbe-input" type="date" name="coApplicantDob" value={formStateTab1.coApplicantDob} onChange={handleChangeTab1} /></div>
                                    <div><label className="fbe-lbl">Aadhar</label><input className="fbe-input" type="text" name="coApplicantAadhar" value={formStateTab1.coApplicantAadhar} onChange={handleChangeTab1} placeholder="12-digit Aadhar" /></div>
                                    <div><label className="fbe-lbl">PAN</label><input className="fbe-input" type="text" name="coApplicantPan" maxLength={10} value={formStateTab1.coApplicantPan} onChange={handleChangeTab1} placeholder="AAAAA1234A" /></div>
                                    <div><label className="fbe-lbl">Address</label><input className="fbe-input" type="text" name="coApplicantAddress" value={formStateTab1.coApplicantAddress} onChange={handleChangeTab1} placeholder="Address" /></div>
                                </div>
                            </>
                        )}

                        {/* ── TAB 2: Costing ── */}
                        {activeTab === 2 && (
                            <>
                                <Sec label="Unit Details" color="#3B82F6" />
                                <div className="fbe-cost-grid">
                                    <CostVal label="Unit No" value={tab2CostingData?.unitNo} hi />
                                    <CostVal label="Tower/Block" value={tab2CostingData?.towerBlock} />
                                    <CostVal label="Floor" value={tab2CostingData?.floor} />
                                    <CostVal label="Area" value={tab2CostingData?.area} />
                                </div>

                                <Sec label="Pricing" color="#22C55E" />
                                <div className="fbe-cost-grid">
                                    <CostVal label="BSP" value={tab2CostingData?.bsp} hi />
                                    <CostVal label="Inaugural Discount" value={tab2CostingData?.inauguralDiscount} />
                                    <CostVal label="NPV" value={tab2CostingData?.npv} />
                                    <CostVal label="Other Discount" value={tab2CostingData?.othDicountBuilder} />
                                    <CostVal label="Net BSP" value={tab2CostingData?.netBsp} hi />
                                    <CostVal label="Net BSP Area" value={roundToTwoDecimals(tab2CostingData?.netBspArea)} />
                                    <CostVal label="GST %" value={tab2CostingData?.gstPercent} />
                                    <CostVal label="GST Amount" value={tab2CostingData?.gstAmount} />
                                    <CostVal label="Net Unit Cost" value={tab2CostingData?.netCost} />
                                </div>

                                <Sec label="Additional Charges" color="#8B5CF6" />
                                <div className="fbe-cost-grid">
                                    <CostVal label="Floor PLC" value={tab2CostingData?.floorPlc} />
                                    <CostVal label="Facing PLC" value={tab2CostingData?.facingPlc} />
                                    <CostVal label="Other View PLC" value={tab2CostingData?.otherViewPlc} />
                                    <CostVal label="Parking" value={tab2CostingData?.carParking} />
                                    <CostVal label="Club Membership" value={tab2CostingData?.clubMembership} />
                                    <CostVal label="Power Backup" value={tab2CostingData?.powerBackupCharges} />
                                    <CostVal label="IFMS" value={tab2CostingData?.ifmsAfterDiscount} />
                                    <CostVal label="Lease Rent" value={tab2CostingData?.leaseRentAfterDiscount} />
                                    <CostVal label="ESSC" value={tab2CostingData?.esscPer} />
                                    <CostVal label="CRF" value={tab2CostingData?.crfPer} />
                                    <CostVal label="EDC/IDC" value={tab2CostingData?.edcIdc} />
                                    <CostVal label="EEC/FFC" value={tab2CostingData?.eecFfc} />
                                    <CostVal label="Terrace/Garden" value={tab2CostingData?.terrageGarden} />
                                    <CostVal label="Development" value={tab2CostingData?.development} />
                                    <CostVal label="Facilities" value={tab2CostingData?.facilities} />
                                    <CostVal label="Maintenance" value={tab2CostingData?.maintenance} />
                                    <CostVal label="Meter" value={tab2CostingData?.meter} />
                                    <CostVal label="Other Charges" value={tab2CostingData?.otherCharges} />
                                    <CostVal label="Possession Charges" value={tab2CostingData?.possessionCharges} />
                                    <CostVal label="Total Other" value={tab2CostingData?.totalOtherCharge} />

                                    <CostVal label="Other Charges GST %" value={tab2CostingData?.otherChargeGstRate} />
                                    <CostVal label="Other Charges GST Amount" value={tab2CostingData?.otherChargeGstAmt?.toFixed(2)} />
                                </div>

                                <Sec label="Totals" color="#EF4444" />
                                <div className="fbe-total-cards">
                                    {/* <div className="fbe-total-card green"><div className="tc-k">Total Unit Cost (With GST)</div><div className="tc-v">{tab2CostingData?.netCostWithGst || "—"}</div></div>
                                    <div className="fbe-total-card gold"><div className="tc-k">Total with GST (Other Charges)</div><div className="tc-v">{tab2CostingData?.totalOtherchargeWithGst || "—"}</div></div>
                                    <div className="fbe-total-card blue"><div className="tc-k">Total GST Amount </div><div className="tc-v">{tab2CostingData?.totalGstAmount || "—"}</div></div> */}
                                    <div className="fbe-total-card gold"><div className="tc-k">Total Unit Cost (Without GST)+OC+PC</div><div className="tc-v">{(tab2CostingData?.netBspArea + tab2CostingData?.totalOtherCharge + tab2CostingData?.possessionCharges) || "—"}</div></div>

                                    <div className="fbe-total-card gold"><div className="tc-k">Total Unit Cost (Without GST)-Possession Charges</div><div className="tc-v">{(tab2CostingData?.netBspArea + tab2CostingData?.totalOtherCharge) || "—"}</div></div>



                                    <div className="fbe-total-card blue"><div className="tc-k">Total GST Amount </div><div className="tc-v">{tab2CostingData?.totalGstAmount || "—"}</div></div>
                                    <div className="fbe-total-card green"><div className="tc-k">Total Unit Cost (With GST)</div><div className="tc-v">{tab2CostingData?.netCostWithGst || "—"}</div></div>
                                </div>

                                <Sec label="Payment Info" color="#005B52" />
                                <div className="fbe-grid-3">
                                    <div>
                                        <label className="fbe-lbl">Payment Plan <RequiredStar /></label>
                                        <Select classNamePrefix="select" isClearable menuPlacement="auto"
                                            options={Array.isArray(paymentPlanList?.data?.data) ? paymentPlanList?.data?.data : []}
                                            value={formStateTab2?.paymentPlan} onChange={handlePaymentPlanChange}
                                            styles={selectStyles} menuPortalTarget={document.body}
                                            className={errors.paymentPlan ? "is-invalid" : ""} />
                                    </div>
                                    <div>
                                        <label className="fbe-lbl">Assured Business % <RequiredStar /></label>
                                        <input className={`fbe-input${errors.raPercent ? " is-invalid" : ""}`} type="text" name="raPercent" placeholder="Assured Business %" value={formStateTab2?.raPercent} onChange={handleChangeTab2} />
                                    </div>
                                    <div>
                                        <label className="fbe-lbl">Verified Business % <RequiredStar /></label>
                                        <input className={`fbe-input${errors.rcPercent ? " is-invalid" : ""}`} type="text" name="rcPercent" placeholder="Verified Business %" value={formStateTab2?.rcPercent} onChange={handleChangeTab2} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── TAB 3: Other Details ── */}
                        {activeTab === 3 && (
                            <>
                                <Sec label="Booking Details" color="#005B52" />
                                <div className="fbe-grid">
                                    <div>
                                        <label className="fbe-lbl">SO Received Date <RequiredStar /></label>
                                        <input className="fbe-input" type="date" name="soReceiveDate" value={formStateTab3.soReceiveDate} onChange={handleChangeTab3} />
                                    </div>
                                    <div>
                                        <label className="fbe-lbl">Property Type <RequiredStar /></label>
                                        <Select classNamePrefix="select" isClearable value={formStateTab3.propType}
                                            onChange={opt => handleChangeSelectTab3(opt, "propType")}
                                            options={propTypeOptions} styles={selectStyles} menuPortalTarget={document.body}
                                            className={errors.propType ? "is-invalid" : ""} />
                                    </div>
                                    <div>
                                        <label className="fbe-lbl">Scheme <RequiredStar /></label>
                                        <Select classNamePrefix="select" isClearable value={formStateTab3.schemeIncentive}
                                            onChange={opt => handleChangeSelectTab3(opt, "schemeIncentive")}
                                            options={schemeOptions} styles={selectStyles} menuPortalTarget={document.body}
                                            className={errors.schemeIncentive ? "is-invalid" : ""} />
                                    </div>
                                    <div>
                                        <label className="fbe-lbl">Incentive <RequiredStar /></label>
                                        <Select classNamePrefix="select" isClearable value={formStateTab3.incentiveId}
                                            onChange={opt => handleChangeSelectTab3(opt, "incentiveId")}
                                            options={incentiveOptions} styles={selectStyles} menuPortalTarget={document.body}
                                            className={errors.incentiveId ? "is-invalid" : ""} />
                                    </div>
                                    <div>
                                        <label className="fbe-lbl">Loan / Self Funding <RequiredStar /></label>
                                        <Select classNamePrefix="select" isClearable value={formStateTab3.loanSelfFunding}
                                            onChange={opt => handleChangeSelectTab3(opt, "loanSelfFunding")}
                                            options={loanSelfFundingOptions} styles={selectStyles} menuPortalTarget={document.body}
                                            className={errors.loanSelfFunding ? "is-invalid" : ""} />
                                    </div>
                                    <div>
                                        <label className="fbe-lbl">BD Scheme <RequiredStar /></label>
                                        <input className="fbe-input" type="text" name="builderSchemeRemark" value={formStateTab3.builderSchemeRemark} onChange={handleChangeTab3} placeholder="BD Scheme" />
                                    </div>
                                    <div>
                                        <label className="fbe-lbl">MT Scheme <RequiredStar /></label>
                                        <Select classNamePrefix="select" isClearable value={formStateTab3.mtScheme}
                                            onChange={opt => handleChangeSelectTab3(opt, "mtScheme")}
                                            options={mtSchemeOptions} styles={selectStyles} menuPortalTarget={document.body}
                                            className={errors.mtScheme ? "is-invalid" : ""} />
                                    </div>
                                    {formStateTab3.mtScheme?.label === "MTpay" &&
                                        <div>
                                            <label className="fbe-lbl">MTpay Scheme <RequiredStar /></label>
                                            <Select classNamePrefix="select" isClearable value={formStateTab3.mtPayScheme}
                                                onChange={opt => handleChangeSelectTab3(opt, "mtPayScheme")}
                                                options={Array.isArray(mtPayList?.data?.data) ? mtPayList?.data?.data : []} styles={selectStyles} menuPortalTarget={document.body}
                                                className={errors.mtPayScheme ? "is-invalid" : ""} />
                                        </div>
                                    }
                                </div>
                                <div style={{ marginTop: 14 }}>
                                    <label className="fbe-lbl">Remarks <RequiredStar /></label>
                                    <textarea className={`fbe-textarea${errors.remarks ? " is-invalid" : ""}`}
                                        name="remarks" value={formStateTab3.remarks} onChange={handleChangeTab3}
                                        rows={4} placeholder="Enter remarks" />
                                </div>
                                {rowData?.levelRejectRemark && (
                                    <>
                                        <Sec label="Reject Reason" color="#e32222" />
                                        <div style={{ padding: "10px 14px", background: "#FFFBEB", border: "1px solid #FCD34D30", borderRadius: 9, fontSize: 13, color: "#cf1515", lineHeight: 1.6 }}>
                                            {rowData.levelRejectRemark}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* Tab nav */}
                        <div className="fbe-nav">
                            <button className="fbe-nav-btn" onClick={() => setActiveTab(t => Math.max(1, t - 1))} disabled={activeTab === 1}>
                                <MdArrowBack size={13} /> Prev
                            </button>
                            <button className={`fbe-nav-btn${activeTab < 3 ? " p" : ""}`} onClick={() => setActiveTab(t => Math.min(3, t + 1))} disabled={activeTab === 3}>
                                Next <MdArrowForward size={13} />
                            </button>
                        </div>
                    </div>

                    {/* ── ACTIONS ── */}
                    <div className="fbe-actions">
                        <button className="fbe-btn fbe-btn-secondary" onClick={handleCancel}>
                            <MdArrowBack size={14} /> Back
                        </button>
                        <div style={{ flex: 1 }} />
                        {activeTabName !== 'YES' && (
                            <button className="fbe-btn fbe-btn-primary" onClick={handleSave}
                                disabled={addFreshBookingLoading || updateFreshBookingLoading}>
                                <MdSave size={14} />
                                {isNew ? "Save Booking" : "Update Booking"}
                            </button>
                        )}
                        {(activeTabName !== 'YES' && rowData?.bookingCompletePercentage === 100) && (
                            !isNew && (
                                <>
                                    <button className="fbe-btn fbe-btn-primary" onClick={handleMoveToNext}
                                        disabled={isPending}
                                        style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <MdCheckCircle size={14} /> Move to Next Level <MdArrowForward size={14} />
                                    </button>
                                </>
                            )
                        )}
                    </div>

                </Container>
            </div >
        </PageContent >
    )
}

export default FreshBookingEntryLevel1