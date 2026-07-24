/* eslint-disable no-self-compare */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import { useEffect, useMemo, useState } from "react";
import { Container } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePut } from "../../Hooks/useApi";
import {
    GET_ALL_PROSPECT_DETAILS_BY_PROS_ID, GET_ALL_USERS_DROPDOWN,
    GET_ALL_USERS_DROPDOWN_LIST, GET_COSTING_BY_PROJECT_UNITID,
    GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_,
    GET_UNIT_BY_BUILDER_PROJECT, PAYMENT_PLAN_DROPDOWN,
    PROSPECT_DROPDOWN, UPDATE_FRESH_BOOKING_LEVEL,
} from "../../helpers/url_helper";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { formatDate, getDaysAgo } from "../../helpers/function_helper";
import { MdArrowBack, MdArrowForward, MdCheckCircle, MdCancel, MdPerson, MdAttachMoney, MdSettings } from "react-icons/md";
import ApiClient from "../../helpers/api_helper";
import { decryptData } from "../../components/Common/CryptoUtils";

// ── Styles ────────────────────────────────────────────────────────────────────
if (document.getElementById("fbe2-s")) document.getElementById("fbe2-s").remove()
const _s = document.createElement("style")
_s.id = "fbe2-s"
_s.textContent = `
    .fbe2-hdr { background: linear-gradient(135deg,#005B52 0%,#007A6E 60%,#00897B 100%); border-radius:16px; padding:22px 26px; margin-bottom:14px; position:relative; overflow:hidden; }
    .fbe2-hdr::before { content:''; position:absolute; top:-40px; right:-40px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,.05); }
    .fbe2-hdr::after  { content:''; position:absolute; bottom:-60px; right:80px; width:140px; height:140px; border-radius:50%; background:rgba(255,255,255,.04); }
    .fbe2-hdr-row { display:flex; flex-wrap:wrap; gap:14px 28px; margin-bottom:14px; position:relative; }
    .fbe2-hdr-item { display:flex; flex-direction:column; gap:2px; }
    .fbe2-hdr-k { font-size:9px; font-weight:800; color:rgba(255, 255, 255, 0.5); text-transform:uppercase; letter-spacing:.8px; }
    .fbe2-hdr-v { font-size:13px; font-weight:700; color:#fff; }
    .fbe2-hdr-v.lg { font-size:16px; font-weight:800; }
    .fbe2-progress-bar { height:6px; background:rgba(255,255,255,.2); border-radius:99px; overflow:hidden; width:160px; }
    .fbe2-progress-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#C9A84C,#f5d060); transition:width .5s; }
    .fbe2-badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
    .fbe2-badge-gold { background:rgba(201,168,76,.25); color:#f5d060; border:1px solid rgba(201,168,76,.4); }
    .fbe2-badge-blue { background:rgba(59,130,246,.2); color:#93C5FD; border:1px solid rgba(59,130,246,.3); }
    .fbe2-card { background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:20px 22px; box-shadow:0 1px 3px rgba(0,0,0,.04); margin-bottom:12px; }
    .fbe2-tabs { display:flex; gap:3px; padding:4px; background:#F1F5F9; border-radius:12px; margin-bottom:20px; }
    .fbe2-tab { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:8px 14px; font-size:12px; font-weight:600; color:#64748B; border:none; background:transparent; border-radius:9px; cursor:pointer; transition:all .15s; white-space:nowrap; }
    .fbe2-tab:hover:not(.active) { background:rgba(255,255,255,.6); color:#334155; }
    .fbe2-tab.active { background:#fff; color:#005B52; font-weight:700; box-shadow:0 1px 4px rgba(0,0,0,.1); }
    .fbe2-sec { display:flex; align-items:center; gap:8px; font-size:10px; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:.8px; margin:18px 0 12px; }
    .fbe2-sec:first-child { margin-top:0; }
    .fbe2-sec-line { flex:1; height:1px; background:#F1F5F9; }
    .fbe2-sec-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .fbe2-table { width:100%; border-collapse:collapse; }
    .fbe2-table tr { border-bottom:1px solid #F8FAFC; }
    .fbe2-table tr:last-child { border-bottom:none; }
    .fbe2-table td { padding:8px 10px; vertical-align:top; }
    .fbe2-table td.k { font-size:11px; font-weight:700; color:#171818; white-space:nowrap; width:38%; text-transform:uppercase; letter-spacing:.4px; padding-right:12px; }
    .fbe2-table td.v { font-size:13px; font-weight:600; color:#0F172A; }
    .fbe2-table td.v.em { color:#CBD5E1; font-style:italic; font-weight:400; font-size:12px; }
    .fbe2-table td.v.hi { color:#005B52; font-weight:700; }
    .fbe2-table td.v.warn { color:#92400E; }
    .fbe2-2col { display:grid; grid-template-columns:1fr 1fr; gap:0 20px; }
    @media(max-width:900px) { .fbe2-2col { grid-template-columns:1fr; } }
    .fbe2-total-cards { display:flex; gap:10px; flex-wrap:wrap; margin-top:10px; }
    .fbe2-total-card { flex:1; min-width:160px; padding:14px 16px; border-radius:12px; }
    .fbe2-total-card.green { background:linear-gradient(135deg,#f0fdf9,#e8f4f2); border:1.5px solid #005B5225; }
    .fbe2-total-card.gold  { background:linear-gradient(135deg,#fffbeb,#fef3c7); border:1.5px solid #C9A84C30; }
    .fbe2-total-card .tc-k { font-size:10px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
    .fbe2-total-card.green .tc-v { font-size:18px; font-weight:800; color:#005B52; }
    .fbe2-total-card.gold  .tc-v { font-size:18px; font-weight:800; color:#92400E; }
    .fbe2-textarea { width:100%; padding:10px 13px; border:1.5px solid #E2E8F0; border-radius:9px; font-size:13px; color:#0F172A; outline:none; resize:vertical; min-height:80px; transition:border-color .15s; }
    .fbe2-textarea:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.07); }
    .fbe2-textarea.err { border-color:#EF4444; }
    .fbe2-reject-box { background:#FEF2F2; border:1.5px solid #FECACA; border-radius:12px; padding:16px 18px; margin-bottom:12px; }
    .fbe2-actions { display:flex; align-items:center; gap:10px; padding:14px 20px; background:#fff; border:1px solid #E8ECF2; border-radius:12px; flex-wrap:wrap; }
    .fbe2-btn { display:flex; align-items:center; gap:6px; padding:9px 20px; border-radius:9px; font-size:13px; font-weight:700; cursor:pointer; border:none; transition:all .15s; white-space:nowrap;  }
    .fbe2-btn-primary { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; }
    .fbe2-btn-primary:hover { opacity:.88; }
    .fbe2-btn-primary:disabled { opacity:.5; cursor:not-allowed; }
    .fbe2-btn-danger { background:#FEF2F2; color:#DC2626; border:1.5px solid #FECACA; }
    .fbe2-btn-danger:hover { background:#FEE2E2; }
    .fbe2-btn-secondary { background:#F1F5F9; color:#475569; }
    .fbe2-btn-secondary:hover { background:#E2E8F0; }
    .fbe2-nav { display:flex; justify-content:flex-end; gap:8px; margin-top:16px; padding-top:14px; border-top:1px solid #F1F5F9; }
    .fbe2-nav-btn { display:flex; align-items:center; gap:5px; padding:7px 16px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; border:1.5px solid #E2E8F0; background:#fff; color:#64748B; transition:all .15s; }
    .fbe2-nav-btn:hover:not(:disabled) { border-color:#005B52; color:#005B52; background:#f0fdf9; }
    .fbe2-nav-btn:disabled { opacity:.4; cursor:not-allowed; }
    .fbe2-nav-btn.p { background:#005B52; border-color:#005B52; color:#fff; }

    
        /* ── Responsive ── */

        /* Tablet landscape (≤1024px) */
        @media(max-width:1024px){
            .fbl1-filter-card { padding:16px 18px 14px; }
            .fbl1-filter-grid { grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:10px; }
            .fbl1-toolbar { flex-wrap:wrap; gap:10px; padding:10px 14px; }
            .fbl1-tabs { flex-wrap:wrap; gap:6px; }
        }

        /* Tablet portrait (≤768px) */
        @media(max-width:768px){
            .fbl1-filter-card { padding:14px 16px 12px; border-radius:12px; }
            .fbl1-filter-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
            .fbl1-filter-title { font-size:10px; margin-bottom:10px; }
            .fbl1-field-label { font-size:10px; }
            .fbl1-date-input { height:36px; font-size:12px; }
            .fbl1-toolbar { flex-direction:column; align-items:stretch; gap:10px; border-radius:12px; }
            .fbl1-tabs { justify-content:flex-start; }
            .fbl1-tab { padding:6px 14px; font-size:12px; }
            .fbl1-show-btn { height:34px; font-size:12px; padding:0 16px; }
            .fbl1-clear-btn { height:34px; font-size:12px; padding:0 12px; }
        }

        /* Mobile (≤560px) */
        @media(max-width:560px){
            .fbl1-filter-card { padding:12px 14px 10px; border-radius:10px; margin-bottom:12px; }
            .fbl1-filter-grid { grid-template-columns:1fr; gap:8px; }
            .fbl1-filter-grid > div:last-child { display:flex; gap:8px; }
            .fbl1-filter-grid > div:last-child .fbl1-show-btn { flex:1; }
            .fbl1-filter-grid > div:last-child .fbl1-clear-btn { flex:1; justify-content:center; }
            .fbl1-toolbar { padding:10px 12px; border-radius:10px; gap:8px; }
            .fbl1-tabs { gap:4px; }
            .fbl1-tab { padding:6px 10px; font-size:11px; gap:4px; }
            .fbl1-tab-dot { width:6px; height:6px; }
            .fbl1-tool-btn { width:34px; height:34px; }
            .fbl1-date-input { height:36px; font-size:12px; border-radius:8px; }
        }

        /* Very small (≤380px) */
        @media(max-width:380px){
            .fbl1-filter-card { padding:10px 12px 8px; }
            .fbl1-tab { padding:5px 8px; font-size:10px; }
            .fbl1-show-btn { height:32px; font-size:11px; }
            .fbl1-clear-btn { height:32px; font-size:11px; }
            .fbl1-field-label { font-size:9px; }
        }
`
document.head.appendChild(_s)

// ── KV Row ────────────────────────────────────────────────────────────────────
const KV = ({ k, v, hi, warn }) => {
    const empty = v === null || v === undefined || v === "" || v !== v
    return (
        <tr>
            <td className="k">{k}</td>
            <td className={`v${empty ? " em" : ""}${hi ? " hi" : ""}${warn ? " warn" : ""}`}>
                {empty ? "—" : v}
            </td>
        </tr>
    )
}

// ── Section heading ───────────────────────────────────────────────────────────
const Sec = ({ label, color = "#005B52" }) => (
    <div className="fbe2-sec">
        <span className="fbe2-sec-dot" style={{ background: color }} />
        {label}
        <span className="fbe2-sec-line" />
    </div>
)

// ── Two-column table ──────────────────────────────────────────────────────────
const Table2 = ({ rows }) => (
    <div className="fbe2-2col">
        {[0, 1].map(col => (
            <table key={col} className="fbe2-table">
                <tbody>
                    {rows.filter((_, i) => i % 2 === col).map((r, i) => (
                        <KV key={i} k={r[0]} v={r[1]} hi={r[2]} warn={r[3]} />
                    ))}
                </tbody>
            </table>
        ))}
    </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
export default function FreshBookingEntryLevel2() {
    const location = useLocation()
    const { rowData, formState, page, searchByGroupSelect, searchTerm, activeTabName } = location.state || {}
    const { empCode, userName } = useUserStore((state) => state.user);
    const nav = useNavigate()
    const [isPending, setIsPending] = useState(false)

    const [activeTab, setActiveTab] = useState(1)
    const [unitData, setUnitData] = useState([])
    const [rejectRemarks, setRejectRemarks] = useState("")
    const [rejectRemarksErr, setRejectRemarksErr] = useState(false)
    const [showRejectBox, setShowRejectBox] = useState(false)
    const [prospectData, setProspectData] = useState({})

    // Pre-extract unit id from rowData so costingData API fires on first render
    const unitId = rowData?.projectUnitId || null

    const [fd, setFd] = useState(() => ({
        associate: null, builder: null, project: null,
        unit: unitId ? { label: rowData?.projectUnitName, value: unitId } : null,
        revenue: null, prospect: null, bookingType: null,
        tempUnit: rowData?.tempUnit || "",
        tempArea: rowData?.tempArea || "",
        tempTurnOver: rowData?.tempTurnOver || "",
        freshBookingType: rowData?.freshBookingType || "Pending",
        rewardPoints: rowData?.rewardPoint || 0,
    }))

    const [t1, setT1] = useState({
        applicantName: "", applicantAddress: "", contactNum1: "", contactNum2: "",
        emailId: "", dob: "", aadhar: "", pan: "",
        coApplicantName: "", coApplicantDob: "", coApplicantAddress: "",
        coApplicantContactNum1: "", coApplicantContactNum2: "",
        coApplicantEmailId: "", coApplicantAadhar: "", coApplicantPan: "",
    })
    const [t2, setT2] = useState({ unitStatus: null, paymentPlan: null, raPercent: 0, rcPercent: 0 })
    const [t3, setT3] = useState({
        bookingStatus: null, location: "", bookingDate: "", propType: null,
        saleStatus: null, schemeIncentive: null, incentiveId: null, formStage: null,
        loanSelfFunding: null, kycStatus: null, kycCompletionDate: "",
        soReceiveDate: "", soDispatchDate: "", acceptanceDateByBuilder: "",
        clientBBAStatus: "", remarks: "", connectBookingStatus: null,
        connectSuspectName: null, bookingRange: null,
        rejectRemarks: "",
        builderSchemeRemark: "", mtScheme: null,mtPayScheme: null
    })

    const bkTypeGrp = useMemo(() => [{ label: "Fresh", value: "Fresh" }, { label: "Resale", value: "Resale" }], [])
    const unitStatusOpts = [{ label: "Admin Pre Sold", value: "adminPreSold" }, { label: "Hold", value: "hold" }, { label: "Open", value: "open" }, { label: "Pre Sold", value: "preSold" }, { label: "Sold", value: "sold" }]
    const propTypeOpts = [{ value: 22, label: "Commercial" }, { value: 25, label: "Plot" }, { value: 24, label: "Residential" }, { value: 23, label: "Retail" }]
    const schemeOpts = [{ value: 12, label: "No" }, { value: 11, label: "Yes" }]
    const incentiveOpts = [{ value: "BUILDER", label: "Builder" }, { value: "MTRS", label: "MTRS" }, { value: "NA", label: "Not Applicable" }]
    const loanOpts = [{ value: 1, label: "Loan" }, { value: 2, label: "Self" }]
    const cbsGrp = [{ value: "MT", label: "MT" }, { value: "MTC", label: "MTC" }]
    const rangeList = [{ label: "0-50 Lakh", value: "0-50 Lakh" }, { label: "50 Lakh - 1 Cr.", value: "50 Lakh - 1 Cr." }, { label: "1 Cr. - 1.5 Cr.", value: "1 Cr. - 1.5 Cr." }, { label: "1.5 Cr. - 2 Cr.", value: "1.5 Cr. - 2 Cr." }, { label: "Greator than 2 Cr.", value: "Greator than 2 Cr." }]

    // ── API hooks ─────────────────────────────────────────────────────────────
    const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_)
    const { data: paymentPlanList } = useGet(PAYMENT_PLAN_DROPDOWN)
    const { data: associateList } = useGet(Object.keys(rowData || {}).length === 0 ? GET_ALL_USERS_DROPDOWN : GET_ALL_USERS_DROPDOWN_LIST)
    const { data: prospectList } = useGet(PROSPECT_DROPDOWN + fd?.associate?.value, { enabled: Boolean(fd?.associate?.value) })
    const { data: projectData } = useGet(`${GET_PROJECT_BY_BUILDER_}${fd?.builder?.value}`, { enabled: !!fd.builder?.value })
    const { data: prospectDet } = useGet(GET_ALL_PROSPECT_DETAILS_BY_PROS_ID + fd?.prospect?.value, { enabled: Boolean(fd?.prospect?.value) })

    useEffect(() => {
        if (prospectDet?.data) {
            decryptData(prospectDet?.data).then((decryptedData) => {
                if (decryptedData) {
                    setProspectData(decryptedData);
                } else {
                    setProspectData({})
                }
            });
        }
    }, [prospectDet]);
    // Costing — costingId uses raw rowData unit id so it fires on render 1
    const costingId = fd?.unit?.value || unitId
    const { data: costingData } = useGet(
        `${GET_COSTING_BY_PROJECT_UNITID}=${costingId}`,
        { enabled: Boolean(costingId) }
    )
    const c = costingData?.data?.data  // shorthand for costing fields

    const { isPending: unitLoading, mutate: mutateUnit } = usePut(
        `${GET_UNIT_BY_BUILDER_PROJECT}${fd?.builder?.value}&projectName=${fd?.project?.value}`,
        {
            onSuccess: res => {
                if (res?.data?.status === 1) {
                    setUnitData(Object.keys(rowData || {}).length === 0
                        ? res?.data?.data
                        : [{ label: rowData.projectUnitName, value: rowData.projectUnitId }, ...res?.data?.data])
                } else if (res.data.message === "No record found !") {
                    setUnitData([{ label: rowData?.projectUnitName, value: rowData?.projectUnitId }])
                }
            },
            onError: err => toast.error(err.message),
        }
    )

    useEffect(() => { if (fd?.project?.value && fd?.builder?.value) mutateUnit() }, [fd?.builder, fd?.project])

    const days = prospectData?.createdDate ? getDaysAgo(prospectData.createdDate) : null

    // ── callLevelApi — shared for approve + reject ────────────────────────────
    // isApproved = 'YES' → Move to Next Level
    // isApproved = 'NO'  → Reject (rejectReason appended only when rejecting)
    const callLevelApi = (isApproved, rejectReason) => {
        const params = new URLSearchParams({
            freshSaleId: rowData?.id,
            freshFormLevel: "LEVEL2",
            isApproved,
            loginId: userName + '  (' + empCode + ')',
        })
        if (rejectReason) params.append("rejectReason", rejectReason)
        if (!window.confirm(isApproved === "YES" ? "Are you sure you want to move this booking to next level?" : "Are you sure you want to reject this booking?")) return;

        // window.confirm(isApproved === "YES" ? "Are you sure you want to move this booking to next level?" : "Are you sure you want to reject this booking?") &&
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

    const handleMoveToNext = () => callLevelApi("YES", null)

    const handleReject = () => {
        if (!showRejectBox) { setShowRejectBox(true); return }
        if (!rejectRemarks?.trim()) { setRejectRemarksErr(true); toast.error("Rejection Reason Required..."); return }
        setRejectRemarksErr(false)
        callLevelApi("NO", rejectRemarks.trim())
    }

    const handleCancel = () => nav("/second-level-fresh-booking", { state: { formState, page, searchByGroupSelect, searchTerm, activeTabName } })

    // ── Populate from rowData ─────────────────────────────────────────────────
    useEffect(() => {
        if (!rowData || Object.keys(rowData).length === 0) return
        setT1(p => ({
            ...p,
            applicantName: rowData?.clientName, applicantAddress: rowData?.clientAddress,
            contactNum1: rowData?.clientPhone, contactNum2: rowData?.clientPhone2,
            emailId: rowData?.clientEmail, dob: formatDate(rowData?.clientDob),
            aadhar: rowData?.clientAddharCard, pan: rowData?.clientPan,
            coApplicantName: rowData?.coApplicantName, coApplicantDob: formatDate(rowData?.coApplicantDob),
            coApplicantAddress: rowData?.coApplicantAddress,
            coApplicantContactNum1: rowData?.coApplicantPhone,
            coApplicantContactNum2: rowData?.coApplicantPhone2,
            coApplicantEmailId: rowData?.coApplicantEmail,
            coApplicantAadhar: rowData?.coApplicantAddharCard,
            coApplicantPan: rowData?.coApplicantPan,
        }))
        setT2(p => ({ ...p, raPercent: rowData.ra_percent, rcPercent: rowData.rc_percent }))
        setT3(p => ({
            ...p,
            location: rowData?.locationName || "",
            bookingDate: rowData?.bookingDate ? formatDate(rowData?.bookingDate) : "",
            propType: propTypeOpts.find(r => r.value == rowData.propTypeId) || null,
            schemeIncentive: schemeOpts.find(r => r.value == rowData.schemaIncentiveId) || null,
            incentiveId: incentiveOpts.find(r => r.value == rowData.incentiveId) || null,
            loanSelfFunding: loanOpts.find(r => r.value == rowData.loanSelfFundingId) || null,
            connectBookingStatus: cbsGrp.find(r => r.value == rowData.connectBookingStatus) || null,
            bookingRange: rangeList.find(r => r.value == rowData.bookingRange) || null,
            soReceiveDate: rowData?.soReceiveDate ? formatDate(rowData?.soReceiveDate) : "",
            remarks: rowData?.remarks,
            rejectRemarks: rowData?.rejectReason,
            mtScheme: rowData?.mtrsScheme,
            mtPayScheme: rowData?.mtPayScheme,
            builderSchemeRemark: rowData?.builderSchemeRemark
        }))
    }, [rowData])

    useEffect(() => {
        if (c?.unitStatus && rowData && Object.keys(rowData).length > 0) {
            const opt = unitStatusOpts.find(o => o.value === c.unitStatus)
            if (opt) setT2(p => ({ ...p, unitStatus: opt }))
        }
    }, [c])

    useEffect(() => {
        if (Object.keys(rowData || {}).length === 0) {
            const d = prospectData
            setT1(p => ({ ...p, applicantName: d?.clientName, applicantAddress: d?.clientAddress, contactNum1: d?.phoneNo }))
        } else {
            setT1(p => ({ ...p, contactNum1: prospectData?.phoneNo }))
        }
    }, [prospectData])

    useEffect(() => {
        if (rowData?.associateId) {
            const a = Array.isArray(associateList?.data?.data) ? associateList?.data?.data?.find(i => i.value === rowData.associateId) : null
            if (a) setFd(p => ({ ...p, associate: a }))
        }
    }, [associateList?.data?.data, rowData?.associateId])

    useEffect(() => {
        if (rowData?.bookingType) {
            const b = bkTypeGrp.find(i => i.label === rowData.bookingType)
            if (b) setFd(p => ({ ...p, bookingType: b }))
        }
    }, [associateList?.data?.data])

    useEffect(() => {
        if (rowData?.paymentPlan) {
            const p = Array.isArray(paymentPlanList?.data?.data) ? paymentPlanList?.data?.data?.find(i => i.value == rowData.paymentPlan) : null
            if (p) setT2(prev => ({ ...prev, paymentPlan: p }))
        }
    }, [paymentPlanList?.data?.data])

    useEffect(() => {
        if (rowData?.projectUnitId) {
            const u = Array.isArray(unitData) ? unitData?.find(i => i.value === rowData?.projectUnitId) : null
            if (u) setFd(p => ({ ...p, unit: u }))
        }
    }, [unitData])

    useEffect(() => {
        if (rowData?.projectName) {
            const p = Array.isArray(projectData?.data?.data) ? projectData?.data?.data?.find(i => i.label === rowData.projectName) : null
            if (p) setFd(prev => ({ ...prev, project: p }))
        }
    }, [projectData?.data?.data])

    useEffect(() => {
        if (rowData?.builderName) {
            const b = Array.isArray(builderList?.data?.data) ? builderList?.data?.data?.find(i => i.label === rowData.builderName) : null
            if (b) setFd(p => ({ ...p, builder: b }))
        }
    }, [builderList?.data?.data])

    useEffect(() => {
        if (rowData?.prospectId) {
            const p = Array.isArray(prospectList?.data?.data) ? prospectList?.data?.data?.find(i => i.value === rowData.prospectId) : null
            if (p) setFd(prev => ({ ...prev, prospect: p }))
        }
    }, [prospectList?.data?.data])

    const isUpdate = rowData && Object.keys(rowData).length > 0
    const loading = isPending || unitLoading

    const TABS = [
        { id: 1, label: "Client Info", icon: <MdPerson size={13} /> },
        { id: 2, label: "Costing", icon: <MdAttachMoney size={13} /> },
        { id: 3, label: "Other Details", icon: <MdSettings size={13} /> },
    ]

    return (
        <PageContent>
            <div className="fbe2">
                {loading && <ScreenLoader />}
                <Container fluid>
                    <Breadcrumbs title="Transaction" breadcrumbItem={isUpdate ? "Review Booking" : "Fresh Booking Entry"} />

                    {/* ── HEADER ── */}
                    <div className="fbe2-hdr">
                        {rowData?.id && (
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)", fontWeight: 800, letterSpacing: ".8px", textTransform: "uppercase", marginBottom: 10 }}>
                                Fresh ID #{rowData.id}
                            </div>
                        )}
                        <div className="fbe2-hdr-row">
                            <div className="fbe2-hdr-item">
                                <span className="fbe2-hdr-k">Project</span>
                                <span className="fbe2-hdr-v lg">{fd?.project?.label || rowData?.projectName || "—"}</span>
                            </div>
                            <div className="fbe2-hdr-item">
                                <span className="fbe2-hdr-k">Builder</span>
                                <span className="fbe2-hdr-v">{fd?.builder?.label || rowData?.builderName || "—"}</span>
                            </div>
                            <div className="fbe2-hdr-item">
                                <span className="fbe2-hdr-k">Location</span>
                                <span className="fbe2-hdr-v">{rowData?.locationName || "—"}</span>
                            </div>
                            <div className="fbe2-hdr-item">
                                <span className="fbe2-hdr-k">Associate</span>
                                <span className="fbe2-hdr-v">{fd?.associate?.label || rowData?.associateName || "—"}</span>
                            </div>
                            <div className="fbe2-hdr-item">
                                <span className="fbe2-hdr-k">Unit</span>
                                <span className="fbe2-hdr-v">{fd?.unit?.label || rowData?.projectUnitName || "—"}</span>
                            </div>
                            <div className="fbe2-hdr-item">
                                <span className="fbe2-hdr-k">Prospect</span>
                                <span className="fbe2-hdr-v" style={{ fontSize: 12 }}>{fd?.prospect?.label || rowData?.prospectName || "—"}</span>
                            </div>
                            <div className="fbe2-hdr-item">
                                <span className="fbe2-hdr-k">Token Money</span>
                                <span className="fbe2-hdr-v" style={{ fontSize: 12 }}>{rowData?.tokenMoney || "—"}</span>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", position: "relative" }}>
                            {fd?.bookingType?.label && <span className="fbe2-badge fbe2-badge-gold">{fd.bookingType.label}</span>}
                            {fd?.freshBookingType && <span className="fbe2-badge fbe2-badge-blue">{fd.freshBookingType}</span>}
                            {days !== null && (
                                <span
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        padding: "3px 10px",
                                        borderRadius: 20,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        whiteSpace: "nowrap",
                                        color: days < 15 ? "#FCA5A5" : "#6EE7B7",
                                        background: days < 15
                                            ? "rgba(239,68,68,.15)"
                                            : "rgba(16,185,129,.15)",
                                        border: `1px solid ${days < 15
                                            ? "rgba(239,68,68,.3)"
                                            : "rgba(16,185,129,.3)"
                                            }`,
                                    }}
                                >
                                    {days} days since prospect created

                                    {prospectData?.transferred === 1 && (
                                        <span style={{ fontWeight: 800 }}>
                                            - Transferred
                                        </span>
                                    )}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ── TABBED CARD ── */}
                    <div className="fbe2-card">
                        <div className="fbe2-tabs">
                            {TABS.map(t => (
                                <button key={t.id} className={`fbe2-tab${activeTab === t.id ? " active" : ""}`} onClick={() => setActiveTab(t.id)}>
                                    {t.icon} {t.label}
                                </button>
                            ))}
                        </div>

                        {/* CLIENT INFO */}
                        {activeTab === 1 && (
                            <>
                                <Sec label="Applicant" color="#005B52" />
                                <Table2 rows={[
                                    ["Name", t1.applicantName, true],
                                    ["Contact 1", t1.contactNum1],
                                    ["Contact 2", t1.contactNum2],
                                    ["Email", t1.emailId],
                                    ["Date of Birth", t1.dob],
                                    ["Aadhar", t1.aadhar],
                                    ["PAN", t1.pan],
                                    ["Address", t1.applicantAddress],
                                ]} />
                                <Sec label="Co-Applicant" color="#C9A84C" />
                                <Table2 rows={[
                                    ["Name", t1.coApplicantName],
                                    ["Contact 1", t1.coApplicantContactNum1],
                                    ["Contact 2", t1.coApplicantContactNum2],
                                    ["Email", t1.coApplicantEmailId],
                                    ["DOB", t1.coApplicantDob],
                                    ["Aadhar", t1.coApplicantAadhar],
                                    ["PAN", t1.coApplicantPan],
                                    ["Address", t1.coApplicantAddress],
                                ]} />
                            </>
                        )}

                        {/* COSTING */}
                        {activeTab === 2 && (
                            <>
                                <Sec label="Unit Details" color="#3B82F6" />
                                <Table2 rows={[
                                    ["Unit No", c?.unitNo, true],
                                    ["Tower/Block", c?.towerBlock],
                                    ["Floor", c?.floor],
                                    ["Area", c?.area],
                                ]} />
                                <Sec label="Pricing" color="#22C55E" />
                                <Table2 rows={[
                                    ["BSP", c?.bsp?.toFixed(2), true],
                                    ["Inaugural Discount", c?.inauguralDiscount],
                                    ["NPV", c?.npv],
                                    ["Other Discount", c?.othDicountBuilder],
                                    ["Net BSP", c?.netBsp?.toFixed(2), true],
                                    ["Net BSP Area", c?.netBspArea?.toFixed(2)],
                                    ["GST %", c?.gstPercent],
                                    ["GST Amount", c?.gstAmount?.toFixed(2)],
                                    ["Net Unit Cost", c?.netCost?.toFixed(2)],
                                ]} />
                                <Sec label="Additional Charges" color="#8B5CF6" />
                                <Table2 rows={[
                                    ["Floor PLC", c?.floorPlc],
                                    ["Facing PLC", c?.facingPlc], ["Other View PLC", c?.otherViewPlc],
                                    ["Parking", c?.carParking], ["Club Membership", c?.clubMembership],
                                    ["Power Backup", c?.powerBackupCharges], ["IFMS", c?.ifmsAfterDiscount],
                                    ["Lease Rent", c?.leaseRentAfterDiscount], ["ESSC", c?.esscPer],
                                    ["CRF", c?.crfPer], ["EDC/IDC", c?.edcIdc],
                                    ["EEC/FFC", c?.eecFfc], ["Terrace/Garden", c?.terrageGarden],
                                    ["Development", c?.development], ["Facilities", c?.facilities],
                                    ["Maintenance", c?.maintenance], ["Meter", c?.meter],
                                    ["Other Charges", c?.otherCharges], ["Possession Charges", c?.possessionCharges], ["Total Other", c?.totalOtherCharge?.toFixed(2)],
                                    ["Other Charges GST %", c?.otherChargeGstRate], ["Other Charges GST Amount", c?.otherChargeGstAmt?.toFixed(2)],

                                ]} />
                                <Sec label="Totals" color="#EF4444" />
                                <div className="fbe2-total-cards">

                                    <div className="fbe2-total-card gold">
                                        <div className="tc-k">Total Unit Cost (Without GST)+OC+PC</div>
                                        <div className="tc-v">{(c?.netBspArea + c?.totalOtherCharge + c?.possessionCharges)?.toFixed(2) || "—"}</div>
                                    </div>
                                    <div className="fbe2-total-card gold">
                                        <div className="tc-k">Total Unit Cost (Without GST)-Possession Charges</div>
                                        <div className="tc-v">{(c?.netBspArea + c?.totalOtherCharge)?.toFixed(2) || "—"}</div>
                                    </div>
                                    <div className="fbe2-total-card green" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
                                        <div className="tc-k">Total GST Amount</div>
                                        <div className="tc-v" style={{ color: "#1E40AF" }}>{c?.totalGstAmount?.toFixed(2) || "—"}</div>
                                    </div>
                                    <div className="fbe2-total-card green">
                                        <div className="tc-k">Total Unit Cost (With GST)</div>
                                        <div className="tc-v">{c?.netCostWithGst?.toFixed(2) || "—"}</div>
                                    </div>
                                    {/* <div className="fbe2-total-card gold">
                                        <div className="tc-k">Total With GST (Other Charges)</div>
                                        <div className="tc-v">{c?.totalOtherchargeWithGst?.toFixed(2) || "—"}</div>
                                    </div> */}

                                </div>
                                <Sec label="Payment" color="#005B52" />
                                <Table2 rows={[
                                    ["Payment Plan", t2?.paymentPlan?.label],
                                    ["Assured Business %", t2?.raPercent],
                                    ["Verified Biz %", t2?.rcPercent],
                                ]} />
                            </>
                        )}

                        {/* OTHER DETAILS */}
                        {activeTab === 3 && (
                            <>
                                <Sec label="Booking Info" color="#005B52" />
                                <Table2 rows={[
                                    ["SO Received Date", t3.soReceiveDate, true],
                                    ["Property Type", t3.propType?.label],
                                    ["Scheme", t3.schemeIncentive?.label],
                                    ["Incentive", t3.incentiveId?.label],
                                    ["Loan / Self", t3.loanSelfFunding?.label],
                                    ["BD Scheme", t3.builderSchemeRemark],
                                    ["MT Scheme", t3.mtScheme],
                                    ["mtPay Scheme", t3.mtPayScheme],
                                    // ["Connect Status", t3.connectBookingStatus?.label],
                                    // ["Booking Range", t3.bookingRange?.label],
                                    // ["Booking Type", fd?.freshBookingType],
                                ]} />
                                {t3.remarks && (
                                    <>
                                        <Sec label="Remarks" color="#C9A84C" />
                                        <div style={{ padding: "10px 14px", background: "#FFFBEB", border: "1px solid #FCD34D30", borderRadius: 9, fontSize: 13, color: "#92400E", lineHeight: 1.6 }}>
                                            {t3.remarks}
                                        </div>
                                    </>
                                )}
                                {t3.rejectReason && (
                                    <>
                                        <Sec label="Reject Reason" color="#C9A84C" />
                                        <div style={{ padding: "10px 14px", background: "#FFFBEB", border: "1px solid #FCD34D30", borderRadius: 9, fontSize: 13, color: "#92400E", lineHeight: 1.6 }}>
                                            {t3.rejectReason}
                                        </div>
                                    </>
                                )}

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
                        <div className="fbe2-nav">
                            <button className="fbe2-nav-btn" onClick={() => setActiveTab(t => Math.max(1, t - 1))} disabled={activeTab === 1}>
                                <MdArrowBack size={13} /> Prev
                            </button>
                            <button className={`fbe2-nav-btn${activeTab < 3 ? " p" : ""}`} onClick={() => setActiveTab(t => Math.min(3, t + 1))} disabled={activeTab === 3}>
                                Next <MdArrowForward size={13} />
                            </button>
                        </div>
                    </div>

                    {/* ── REJECT BOX ── */}
                    {showRejectBox && (
                        <div className="fbe2-reject-box">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: "#DC2626", textTransform: "uppercase", letterSpacing: ".5px" }}>
                                    🔴 Rejection Reason <span style={{ color: "#EF4444" }}>*</span>
                                </span>
                                <button type="button"
                                    style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", fontSize: 16 }}
                                    onClick={() => { setShowRejectBox(false); setRejectRemarks(""); setRejectRemarksErr(false) }}>
                                    ✕
                                </button>
                            </div>
                            <textarea
                                className={`fbe2-textarea${rejectRemarksErr ? " err" : ""}`}
                                style={{ background: "#fff", borderColor: rejectRemarksErr ? "#EF4444" : "#FECACA" }}
                                placeholder="State reason for rejection…"
                                value={rejectRemarks}
                                autoFocus
                                rows={3}
                                onChange={e => { setRejectRemarks(e.target.value); if (e.target.value.trim()) setRejectRemarksErr(false) }}
                            />
                            {rejectRemarksErr && <div style={{ color: "#EF4444", fontSize: 11, fontWeight: 600, marginTop: 4 }}>⚠ Required</div>}
                        </div>
                    )}

                    {/* ── ACTIONS ── */}
                    <div className="fbe2-actions">
                        <button className="fbe2-btn fbe2-btn-secondary" onClick={handleCancel}>
                            <MdArrowBack size={14} /> Back
                        </button>
                        <div style={{ flex: 1 }} />
                        {activeTabName !== 'YES' && (
                            <button className="fbe2-btn fbe2-btn-danger" onClick={handleReject}>
                                <MdCancel size={14} /> {showRejectBox ? "Confirm Reject" : "Reject"}
                            </button>
                        )}
                        {activeTabName !== 'YES' && (
                            <button className="fbe2-btn fbe2-btn-primary" onClick={handleMoveToNext} disabled={loading || showRejectBox}>
                                <MdCheckCircle size={14} />
                                {isUpdate ? "Move to Next Level" : "Save & Submit"}
                                <MdArrowForward size={14} />
                            </button>
                        )}
                    </div>

                </Container>
            </div>
        </PageContent>
    )
}