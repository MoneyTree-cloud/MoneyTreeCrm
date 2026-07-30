/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import { useEffect, useMemo, useRef, useState } from "react";
import { Container, Row, Col, Card, CardBody, Button, Input, Label } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import { GET_ALL_CUSTOMER_VISIT_DATA_BY_ID, GET_ALL_USERS_DROPDOWN, GET_VISITOR_DATA_BY_MOBILE, SAVE_VISITOR_DATA, SEND_OTP, VERIFY_TEXT_OTP, MARK_VISITOR_OUT, GET_USER_BY_TOKEN, STATUS_CHANGE_TOKEN } from "../../helpers/url_helper";
import { RegexFile } from "../../helpers/RegexFile";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import "../CSS/styles.css";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { formatDate, formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import AppTable from "../../components/Common/Table";
import { decryptData } from "../../components/Common/CryptoUtils";
import { MdCancel, MdCheckCircle, MdMobileFriendly, MdSchedule } from "react-icons/md";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import ImageModal from "../../components/Common/ImageModal";
import { FaCalendar, FaCheck, FaCheckCircle, FaMobileAlt, FaTeamspeak, FaTimes, FaUser, FaUserTie } from "react-icons/fa";

/* ─── theme constants ────────────────────────────────────── */
const PRIMARY = defaultTheme.primary;
const GOLD = defaultTheme.goldColorLogo;
const RED = defaultTheme.redColor;

/* ─── styles ─────────────────────────────────────────────── */
const S = {
  label: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#4a5568",
    marginBottom: 6,
    display: "flex",
    alignItems: "center",
    gap: 3,
  },
  card: {
    border: "0.5px solid rgba(0,0,0,0.09)",
    borderRadius: 12,
    boxShadow: "none",
    marginBottom: 0,
  },
  sectionHead: {
    background: "#f7f8fa",
    borderBottom: "0.5px solid rgba(0,0,0,0.09)",
    padding: "12px 18px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderRadius: "12px 12px 0 0",
    flexWrap: "wrap",
    rowGap: 8,
  },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: "#1a2e2c", margin: 0 },
  sectionDot: {
    width: 8, height: 8, borderRadius: "50%",
    background: PRIMARY, flexShrink: 0,
  },
  /* 2px solid black on all inputs */
  input: (hasErr) => ({
    height: 40,
    fontSize: 13,
    borderRadius: 8,
    border: `2px solid ${hasErr ? RED : "#000"}`,
    padding: "0 12px",
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
    background: hasErr ? "#fff8f8" : "#fff",
    color: "#1a2e2c",
    transition: "border-color .15s",
  }),
  textarea: {
    fontSize: 13,
    borderRadius: 8,
    border: "2px solid #000",
    padding: "8px 12px",
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
    color: "#1a2e2c",
    resize: "vertical",
    minHeight: 80,
  },
  errMsg: { fontSize: 11, color: RED, marginTop: 3 },
  fab: {
    display: "flex", alignItems: "center", gap: 7,
    height: 40, padding: "0 18px",
    background: PRIMARY, color: "#fff", border: "none",
    borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.02em",
  },
  otpBox: {
    width: 44, height: 44, textAlign: "center",
    fontSize: 18, fontWeight: 600, borderRadius: 8,
    border: `2px solid ${GOLD}`,
    outline: "none", color: "#1a2e2c", background: "#fff",
  },
  verifiedStrip: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "7px 11px", background: "#EAF3DE",
    borderRadius: 8, fontSize: 12, color: "#27500a",
    fontWeight: 500, marginTop: 4,
  },
  photoBox: (hasFile) => ({
    border: `2px dashed ${hasFile ? PRIMARY : "#000"}`,
    borderRadius: 8, padding: "16px 12px",
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 6, cursor: "pointer",
    background: hasFile ? "#e8f4f2" : "#fafafa",
    transition: "all .15s",
  }),
  photoText: { fontSize: 12, color: "#4a6b67", textAlign: "center" },
  markOutBtn: (isOut) => ({
    fontSize: 11, fontWeight: 600,
    padding: "4px 10px", borderRadius: 6,
    border: `1.5px solid ${isOut ? "#bbb" : RED}`,
    background: isOut ? "#f5f5f5" : "#fff5f5",
    color: isOut ? "#999" : RED,
    cursor: isOut ? "not-allowed" : "pointer",
    whiteSpace: "nowrap", fontFamily: "inherit",
    opacity: isOut ? 0.65 : 1,
    transition: "all .15s",
  }),
  filterInput: {
    height: 34,
    fontSize: 12,
    borderRadius: 7,
    border: "2px solid black",
    padding: "0 10px", outline: "none",
    // fontFamily: "inherit", color: "#1a2e2c",
    // background: "#fff", width: 155,
  },
  clearBtn: {
    height: 34, padding: "0 12px", borderRadius: 7,
    border: "1.5px solid rgba(0,0,0,0.15)",
    background: "#fff", fontSize: 12,
    cursor: "pointer", color: "#666", fontFamily: "inherit",
  },
};

/* select styles — 2px black border */
const selectStyles = (hasErr) => ({
  control: (p, s) => ({
    ...p,
    borderColor: hasErr ? RED : "#000",
    borderWidth: 2,
    borderRadius: 8,
    minHeight: 40,
    fontSize: 13,
    boxShadow: s.isFocused ? `0 0 0 1px ${PRIMARY}` : "none",
    background: hasErr ? "#fff8f8" : "#fff",
    "&:hover": { borderColor: hasErr ? RED : "#000" },
  }),
  option: (p, s) => ({
    ...p, fontSize: 13,
    background: s.isSelected ? PRIMARY : s.isFocused ? "#e8f4f2" : "#fff",
  }),
  menu: (p) => ({ ...p, fontSize: 13, zIndex: 9999 }),
  singleValue: (p) => ({ ...p, fontSize: 13, color: "#1a2e2c" }),
});

/* badge helper */
const TYPE_STYLE = {
  Client: { bg: "#E1F5EE", color: "#085041" },
  Visitor: { bg: "#E6F1FB", color: "#0C447C" },
  Vendor: { bg: "#FAEEDA", color: "#633806" },
  Interview: { bg: "#EEEDFE", color: "#3C3489" },
  "1st Day Of Joining": { bg: "#E1F5EE", color: "#085041" },
};

// ── OTP-style 6-digit token input ───────────────────────────────────────────
function TokenInput({ value, onChange, disabled, isVerified }) {
  const inputRefs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  const handleChange = (index, val) => {
    const digit = val.replace(/\D/g, "").slice(-1);

    const arr = value.split("");

    while (arr.length < 6) arr.push("");

    arr[index] = digit;

    onChange(arr.join(""));

    if (digit && index < 5) {
      requestAnimationFrame(() => {
        inputRefs.current[index + 1]?.focus();
      });
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      const arr = value.split("");

      while (arr.length < 6) arr.push("");

      if (arr[index]) {
        // Clear current box
        arr[index] = "";
        onChange(arr.join(""));
      } else if (index > 0) {
        // Clear previous box and move focus
        arr[index - 1] = "";
        onChange(arr.join(""));
        requestAnimationFrame(() => {
          inputRefs.current[index - 1]?.focus();
        });
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) onChange(pasted);
  };

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          style={{
            width: 48,
            height: 56,
            textAlign: 'center',
            fontSize: 22,
            fontWeight: 800,
            color: isVerified ? '#16A34A' : '#0F172A',
            border: `2px solid ${isVerified ? '#16A34A' : (digits[i].trim() ? defaultTheme.primary : '#CBD5E1')}`,
            borderRadius: 10,
            background: isVerified ? '#F0FDF4' : (digits[i].trim() ? '#F0FDF9' : '#fff'),
            outline: 'none',
            transition: 'all .15s',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = defaultTheme.primary}
          onBlur={(e) => e.currentTarget.style.borderColor =
            isVerified ? '#16A34A' : (digits[i].trim() ? defaultTheme.primary : '#CBD5E1')}
        />
      ))}
    </div>
  );
}

/* ─── component ─────────────────────────────────────────── */
export default function VisitorEntryScreen() {
  const { userName, userId, empCode } = useUserStore((state) => state.user);
  const [accessGranted, setAccessGranted] = useState(null);
  const [otpShow, setOtpShow] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [customerData, setCustomerData] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterCardNo, setFilterCardNo] = useState("");
  const [filterMobile, setFilterMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const photoRef = useRef(null);

  const initialFormState = {
    userName: "", mobileNo: "", toWhom: null,
    address: "", purpose: "", visitorType: null, cardNumber: "", remarks: "",
  };
  const [formState, setFormState] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const { data: adminList } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: !!accessGranted });

  const today = new Date().toISOString().split("T")[0];
  const { data: dataList, refetch: refetchList } = useGet(
    `${GET_ALL_CUSTOMER_VISIT_DATA_BY_ID}${userId}&fromDate=${today}&toDate=${today}`,
    { enabled: !!accessGranted }
  );

  useEffect(() => {
    if (dataList?.data?.status === 1) {
      decryptData(dataList?.data?.data).then((d) => setCustomerData(d || []));
    }
  }, [dataList]);

  /* ── filtered rows ── */
  const filteredData = useMemo(() => {
    const rows = customerData?.content || [];
    return rows.filter((r) => {
      const nameOk = filterName ? (r.name || "").toLowerCase().includes(filterName.toLowerCase()) : true;
      const mobileOk = filterMobile ? (r.mobileNo || "").includes(filterMobile) : true;
      const cardOk = filterCardNo ? (r.visitorCardNumber || "").toLowerCase().includes(filterCardNo.toLowerCase()) : true;
      return nameOk && mobileOk && cardOk;
    });
  }, [customerData, filterName, filterMobile, filterCardNo]);

  const [visitorData, setVisitorData] = useState(null);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const [otpId, setOtpId] = useState("");
  const [token, setToken] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);      // { name, mobile, associateId, associateName }
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [isPendingNew, setIsPendingNew] = useState(false)

  const isTokenOnlyUser = empCode === "20026";
  const canVerifyToken = ["20026", "20001"].includes(empCode);


  // ── Fetch token info when 6 digits are entered ──────────────────────────
  useEffect(() => {
    if (token.length !== 6 || !/^\d{6}$/.test(token)) {
      // Clear info if user is editing
      if (tokenInfo) setTokenInfo(null);
      setTokenError('');
      return;
    }

    setTokenLoading(true);
    setTokenError('');
    ApiClient.get(`${GET_USER_BY_TOKEN}?token=${token}`)
      .then((response) => {
        setTokenLoading(false);
        if (response?.data?.status === 1 && response.data.data) {
          setTokenInfo(response.data.data);
        } else {
          setTokenInfo(null);
          setTokenError(response?.data?.message || 'Invalid token');
        }
      })
      .catch((error) => {
        setTokenLoading(false);
        setTokenInfo(null);
        setTokenError(error.message || 'Failed to verify token');
      });
  }, [token]);

  /* ── OTP handlers ── */
  const handleChangeOtp = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;
    const u = [...otp]; u[index] = value; setOtp(u);
    if (value && index < 3) inputRefs.current[index + 1].focus();
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0)
      inputRefs.current[index - 1].focus();
  };
  const handleFocus = (index) => inputRefs.current[index].focus();

  const visitorTypeGroup = useMemo(() => [
    { label: "Client", value: "Client" },
    { label: "Visitor", value: "Visitor" },
    { label: "Interview", value: "Interview" },
    { label: "1st Day Of Joining", value: "1st Day Of Joining" },
    { label: "Vendor", value: "Vendor" },
  ], []);

  /* ── field change ── */
  const handleChange = (e) => {
    const { id, value } = e.target;
    if (errors[id]) setErrors((p) => ({ ...p, [id]: "" }));
    if (id === "mobileNo") {
      if (/^\d{0,10}$/.test(value)) setFormState((p) => ({ ...p, [id]: value }));
      return;
    }
    setFormState((p) => ({ ...p, [id]: value }));
  };

  const handleSelectChange = (field) => (opt) => {
    setFormState((p) => ({ ...p, [field]: opt }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) setPhotoFile(e.target.files[0]);
  };

  /* ── validation ── */
  const validateForm = () => {
    const e = {};
    if (!formState.userName) e.userName = "Visitor Name is required.";
    if (!formState.mobileNo) e.mobileNo = "Mobile No. is required.";
    else if (!RegexFile.mobileNo.test(formState.mobileNo))
      e.mobileNo = "Must be a 10-digit number.";
    if (!formState.toWhom) e.toWhom = "Select Meeting With";
    if (!formState.address) e.address = "Address is required.";
    if (!formState.purpose) e.purpose = "Purpose is required.";
    if (!formState.visitorType) e.visitorType = "Visitor Type is required.";
    if (!formState.cardNumber) e.cardNumber = "Card Number is required.";
    return e;
  };

  /* ── save visitor ── */
  const { isPending, mutate } = usePost(SAVE_VISITOR_DATA, {
    onSuccess: (res) => {
      if (res?.data?.status === 1) {
        toast.success(res.data.message);
        setFormState(initialFormState);
        setVisitorData({});
        setOtp(["", "", "", ""]); setOtpId("");
        setOtpVerified(false); setOtpShow(false);
        setPhotoFile(null); setFormOpen(false);
        refetchList();
        setToken('');
        setTokenInfo(null);
        setTokenError('');
      } else {
        toast.error(res.data.message);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const handleMarkOut = (row) => {
    if (row.visitorOutTime) return;
    if (!window.confirm("Are you sure you want to mark this visitor as OUT?")) return;
    setIsLoading(true);
    ApiClient.post(
      `${MARK_VISITOR_OUT}${row.visitId}`
    )
      .then(function (response) {
        setIsLoading(false);
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          refetchList();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsLoading(false);
        toast.error(error.message);
      });
  };

  /* ── sync visitorData → formState ── */
  useEffect(() => {
    if (visitorData !== null) {
      setFormState({
        userName: visitorData.name || "",
        mobileNo: visitorData.mobileNo || "",
        address: visitorData.address || "",
        purpose: visitorData.purpose || "",
        visitorType: null, toWhom: null, remarks: "",
      });
    } else {
      setFormState((p) => ({
        ...p, userName: "", address: "",
        purpose: "", toWhom: null, visitorType: null,
      }));
    }
  }, [visitorData]);

  useEffect(() => {
    if (visitorData?.toWhom) {
      const match = adminList?.data?.data?.find((i) => i.value == visitorData?.toWhom);
      if (match) setFormState((p) => ({ ...p, toWhom: match }));
    }
  }, [adminList?.data?.data, visitorData?.toWhom]);

  /* ── mobile check ── */
  const { isPending: isPendingMobileCheck, mutate: mutateMobileCheck } = usePost(GET_VISITOR_DATA_BY_MOBILE + formState.mobileNo, {
    onSuccess: (res) => {
      if (res?.data?.status === 1 && res?.data?.data !== null) {
        setVisitorData(res.data.data);
      } else if (res?.data?.status === 1 && res?.data?.data === null) {
        mutateOtpSend(); setVisitorData(null);
      } else {
        setVisitorData(null);
      }
    },
    onError: (err) => { toast.error(err.message); setVisitorData(null); },
  }
  );

  /* ── send OTP ── */
  const { isPending: isPendingOtpSend, mutate: mutateOtpSend } = usePost(
    SEND_OTP + formState.mobileNo + "&userId=" + userId,
    {
      onSuccess: (res) => {
        if (res?.data?.status === 1) {
          setOtpShow(true); setOtpId(res.data.data.optId);
          toast.success(res.data.message);
        } else {
          setOtpShow(false); setOtpId("");
          toast.error(res.data.message);
        }
      },
      onError: (err) => { toast.error(err.message); setVisitorData(null); },
    }
  );

  /* ── verify OTP ── */
  const { isPending: isVerifyOtpSend, mutate: mutateOtpVerify } = usePost(
    VERIFY_TEXT_OTP + otp.join("") + "&userId=" + userId + "&otpId=" + otpId,
    {
      onSuccess: (res) => {
        if (res?.data?.status === 1) {
          setOtpVerified(true); setOtpShow(false);
          setOtp(["", "", "", ""]);
          toast.success(res.data.message);
        } else {
          toast.error(res.data.message);
        }
      },
      onError: (err) => { toast.error(err.message); setVisitorData(null); },
    }
  );

  useEffect(() => {
    if (formState?.mobileNo?.length === 10) mutateMobileCheck();
    else setVisitorData(null);
  }, [formState?.mobileNo?.length, mutateMobileCheck]);

  useEffect(() => {
    if (otp.join("").length === 4 && otpId) mutateOtpVerify();
  }, [mutateOtpVerify, otp, otpId]);

  /* ── submit ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    const ve = validateForm();
    if (Object.keys(ve).length > 0) {
      setErrors(ve);
      toast.error("Some Mandatory Fields Are Still Not Filled");
      return;
    }
    if (!visitorData && !otpVerified) {
      toast.error("Please Verify Mobile Number Before Submit.");
      return;
    }
    const finalRemarks =
      tokenInfo?.mobile &&
        formState.mobileNo &&
        tokenInfo.mobile !== formState.mobileNo
        ? `Shared mobile number is different as per our record.\n${formState.remarks || ""}`
        : (formState.remarks || "");

    const fd = new FormData();
    fd.append("name", formState.userName);
    fd.append("mobileNo", formState.mobileNo);
    fd.append("address", formState.address);
    fd.append("city", "");
    fd.append("toWhomId", formState.toWhom?.value);
    fd.append("visitorType", formState.visitorType?.value);
    fd.append("purpose", formState.purpose);
    fd.append("remarks", finalRemarks);
    fd.append("createdBy", `${userName}(${empCode})`);
    fd.append("loginId", userId);
    fd.append("visitorCardNumber", formState.cardNumber);
    fd.append("token", token);
    fd.append("tokenStatus", tokenInfo?.tokenStatus);
    if (photoFile) fd.append("visitorPhoto", photoFile);
    mutate(fd);
  };

  const handleCancelClick = () => {
    setFormState(initialFormState);
    setVisitorData({});
    setPhotoFile(null);
    setOtpShow(false);
    setOtpVerified(false);
    setOtp(["", "", "", ""]);
    setFormOpen(false);
  };

  /* ── access check ── */
  useEffect(() => {
    const check = async () => {
      const ok = await CheckUserAccess(userId, "visitor-entry");
      setAccessGranted(ok);
    };
    check();
  }, [userId]);

  const profileStyle = {
    width: "35px",
    height: "35px",
    objectFit: "cover",
    cursor: "pointer",
    borderRadius: "50%",
    border: `2px solid ${defaultTheme.goldColorLogo}`,
    padding: "2px",
  };

  const handleViewFile = (fileName) => {
    const fileExtension = fileName?.split(".").pop().toLowerCase();
    const fileUrl = imageBaseUrl + fileName;

    if ((fileExtension === "heic" || fileExtension === 'msg')) {
      // Trigger download for HEIC and msg files
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName; // Specify the filename for the download
      document.body.appendChild(link); // Append the link to the DOM
      link.click(); // Simulate a click to start the download
      document.body.removeChild(link); // Clean up by removing the link
    }
    else {
      // Set the image source and open modal for images
      setCurrentImage(fileUrl);
      setFileModalOpen(true)
    }
  };

  const handleStatusChange = (status) => {
    const isConfirmed = window.confirm("Are you sure you want to change status?");
    if (!isConfirmed) return;
    setIsPendingNew(true);
    ApiClient.post(`${STATUS_CHANGE_TOKEN}?token=${token}&status=${status}`)
      .then(function (response) {
        setIsPendingNew(false);
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          setToken('');
          setTokenInfo(null);
          setTokenError('');
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPendingNew(false);
        toast.error(error.message);
      });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Approved":
        return {
          color: "#16A34A",
          icon: <MdCheckCircle size={18} color="#16A34A" />,
        };

      case "Rejected":
        return {
          color: "#DC2626",
          icon: <MdCancel size={18} color="#DC2626" />,
        };

      case "Pending":
        return {
          color: "#F59E0B",
          icon: <MdSchedule size={18} color="#F59E0B" />, // watch/clock icon
        };

      default:
        return {
          color: "#64748B",
          icon: <MdSchedule size={18} color="#64748B" />,
        };
    }
  };

  const statusConfig = getStatusConfig(tokenInfo?.tokenStatus);


  if (accessGranted === null) return <ScreenLoader />;
  if (!accessGranted) return <PermissionMissing />;

  /* ── table columns ── */
  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, i) => i + 1,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Photo</span>,
      selector: (r) => r?.visitorPhoto,
      cell: (r) =>
        r?.visitorPhoto ? (
          <img
            src={imageBaseUrl + r.visitorPhoto}
            alt="Profile"
            style={profileStyle}
            onClick={() => handleViewFile(r.visitorPhoto)}
          />
        ) : (
          <span style={{ color: "#999", fontSize: 12 }}>No file</span>
        ),
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      selector: (r) => r.associateCode,
      sortable: true,
      width: "12%",
      cell: (r) => <WordWrapCell>{`${r.associateName} (${r.associateCode})`}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Name</span>,
      selector: (r) => r.name,
      sortable: true,
      cell: (r) => <WordWrapCell>{r.name}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Mobile No.</span>,
      selector: (r) => r.mobileNo,
      cell: (r) => (
        <div className="phone-container">
          <MdMobileFriendly className="phone-icon" color={GOLD} />
          <span className="phone-number">{r.mobileNo}</span>
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Address</span>,
      selector: (r) => r.address,
      sortable: true,
      cell: (r) => <WordWrapCell>{r.address}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Type</span>,
      selector: (r) => r.visitorType,
      width: "12%",
      sortable: true,
      cell: (r) => {
        const ts = TYPE_STYLE[r.visitorType] || { bg: "#f1efea", color: "#444" };
        return (
          <span style={{
            display: "inline-block", fontSize: 10, fontWeight: 600,
            padding: "2px 9px", borderRadius: 20, whiteSpace: "nowrap",
            background: ts.bg, color: ts.color,
          }}>
            {r.visitorType}
          </span>
        );
      },
    },
    {
      name: <span className="font-weight-bold fs-13">Purpose</span>,
      selector: (r) => r.purpose,
      sortable: true,
      cell: (r) => <WordWrapCell>{r.purpose}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Card No.</span>,
      selector: (r) => r.visitorCardNumber,
      sortable: true,
      cell: (r) => <WordWrapCell>{r.visitorCardNumber}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Token</span>,
      selector: (r) => r.token,
      sortable: true,
      cell: (r) => <WordWrapCell>{r.token || '-'}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">In Time</span>,
      selector: (r) => formatDateTime(r.createDate),
      sortable: true,
      width: "12%",
      cell: (r) => <WordWrapCell>{formatDateTime(r.createDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Mark Out</span>,
      width: "20%",
      cell: (r) => (
        <button
          style={S.markOutBtn(!!r.visitorOutTime)}
          disabled={!!r.visitorOutTime}
          onClick={() => handleMarkOut(r)}
        >
          {r.visitorOutTime
            ? `Out ${formatDateTime(r.visitorOutTime)}`
            : "Mark Out"}
        </button>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      selector: (r) => r.remarks,
      width: "12%",
      sortable: true,
      cell: (r) => <WordWrapCell>{r.remarks || '-'}</WordWrapCell>,
    }
  ];

  /* ── render ─────────────────────────────────────────────── */
  return (
    <PageContent>
      <Breadcrumbs title="Visitor" breadcrumbItem="Entry" />
      {(isPending || isPendingMobileCheck || isPendingOtpSend || isVerifyOtpSend || isLoading || isPendingNew) && (<ScreenLoader />)}

      <Container fluid>

        {/* ── FAB ── */}
        {!isTokenOnlyUser && (
          <div className="d-flex justify-content-end mb-3">
            <button style={S.fab} onClick={() => setFormOpen((o) => !o)}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {formOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </>
                )}
              </svg>
              {formOpen ? "Close form" : "New visitor"}
            </button>
          </div>
        )}

        {/* ── FORM ── */}
        {(isTokenOnlyUser || formOpen) && (
          <Card style={{ ...S.card }}>
            <div style={S.sectionHead}>
              <div style={S.sectionDot} />
              <p style={S.sectionTitle}>Visitor entry form</p>
            </div>
            <CardBody style={{ padding: "18px 20px" }}>
              {/* Token input */}
              <Row className="g-2 align-items-start mb-3">
                {empCode === '20026'}

                <Col md="6">
                  <Label className="form-label">
                    Token Number <RequiredStar />
                  </Label>
                  <TokenInput
                    value={token}
                    onChange={setToken}
                    disabled={tokenLoading}
                    isVerified={!!tokenInfo}
                  />
                  {tokenLoading && (
                    <div style={{
                      fontSize: 12, color: defaultTheme.primary,
                      marginTop: 8, fontWeight: 600,
                    }}>
                      Verifying token…
                    </div>
                  )}
                  {tokenError && (
                    <div style={{
                      fontSize: 12, color: '#DC2626',
                      marginTop: 8, fontWeight: 600,
                    }}>
                      ✗ {tokenError}
                    </div>
                  )}
                  {tokenInfo && (
                    <div style={{
                      fontSize: 12, color: '#16A34A',
                      marginTop: 8, fontWeight: 700,
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                      <FaCheckCircle size={11} /> Token verified
                    </div>
                  )}
                </Col>

                {tokenInfo && (
                  <Col md="6">
                    <div
                      style={{
                        background: "#F0FDF9",
                        border: `1.5px solid ${defaultTheme.primary}40`,
                        borderRadius: 12,
                        padding: "14px 16px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10.5,
                          color: defaultTheme.primary,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: ".4px",
                          marginBottom: 8,
                        }}
                      >
                        Visitor Information
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                          <FaUser color={defaultTheme.primary} size={11} />
                          <span style={{ color: "#64748B", fontWeight: 600 }}>Name:</span>
                          <strong>{tokenInfo.name}</strong>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                          <FaUserTie color={defaultTheme.primary} size={11} />
                          <span style={{ color: "#64748B", fontWeight: 600 }}>Associate:</span>
                          <strong>
                            {tokenInfo.associateName} ({tokenInfo.associateId})
                          </strong>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                          <FaTeamspeak color={defaultTheme.primary} size={11} />
                          <span style={{ color: "#64748B", fontWeight: 600 }}>Team:</span>
                          <strong>
                            {tokenInfo.mainTeam}/{tokenInfo.subTeam}
                          </strong>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                          <FaCalendar color={defaultTheme.primary} size={11} />
                          <span style={{ color: "#64748B", fontWeight: 600 }}>Valid Till:</span>
                          <strong>{formatDate(tokenInfo.tokenDate)}</strong>
                        </div>
                        {canVerifyToken && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontSize: 12.5,
                            }}
                          >
                            <span style={{ color: "#64748B", fontWeight: 600 }}>
                              Status:
                            </span>

                            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {statusConfig.icon}
                              {/* <strong style={{ color: statusConfig.color }}>
                                {tokenInfo?.tokenStatus}
                              </strong> */}
                            </span>
                          </div>
                        )}

                        {isTokenOnlyUser &&
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                            <FaMobileAlt color={defaultTheme.primary} size={11} />
                            <span style={{ color: "#64748B", fontWeight: 600 }}>Call Admin:</span>
                            <strong>9534444144</strong>
                          </div>
                        }
                      </div>

                      {canVerifyToken && tokenInfo?.tokenStatus === "Pending" && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 10,
                            marginTop: 18,
                          }}
                        >
                          <Button
                            color="success"
                            size="sm"
                            onClick={() => handleStatusChange("Approved")}
                            style={{ display: "flex", alignItems: "center", gap: 6 }}
                          >
                            <FaCheck size={12} />
                            Allow
                          </Button>

                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => handleStatusChange("Rejected")}
                            style={{ display: "flex", alignItems: "center", gap: 6 }}
                          >
                            <FaTimes size={12} />
                            Not-Allow
                          </Button>
                        </div>
                      )}

                    </div>

                  </Col>
                )}

              </Row>
              {!isTokenOnlyUser && (
                <form onSubmit={handleSubmit}>
                  <Row className="g-3">

                    {/* Mobile No — 1 field per row */}
                    <Col xs={12}>
                      <div style={S.label}>Mobile no. <RequiredStar /></div>
                      <Input
                        id="mobileNo"
                        name="mobileNo"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        maxLength={10}
                        value={formState.mobileNo}
                        onChange={handleChange}
                        placeholder="Enter Mobile No..."
                        className={errors.mobileNo ? "is-invalid" : ""}
                        style={S.input(!!errors.mobileNo)}
                      />
                      {errors.mobileNo && <div style={S.errMsg}>{errors.mobileNo}</div>}
                      {visitorData && Object.keys(visitorData).length > 0 && (
                        <div style={S.verifiedStrip}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Visitor found — details auto-filled
                        </div>
                      )}
                    </Col>

                    {/* OTP boxes */}
                    {otpShow && (
                      <Col xs={12}>
                        <div style={S.label}>Happy code <RequiredStar /></div>
                        <div className="d-flex gap-2">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              type="tel"
                              value={digit}
                              maxLength="1"
                              onChange={(e) => handleChangeOtp(e, index)}
                              onFocus={() => handleFocus(index)}
                              onKeyDown={(e) => handleKeyDown(e, index)}
                              ref={(el) => (inputRefs.current[index] = el)}
                              style={S.otpBox}
                            />
                          ))}
                        </div>
                      </Col>
                    )}

                    {/* Verified strip */}
                    {otpVerified && !otpShow && (
                      <Col xs={12}>
                        <div style={S.label}>Mobile verified</div>
                        <div style={S.verifiedStrip}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Mobile number verified successfully
                        </div>
                      </Col>
                    )}

                    {/* Visitor Name */}
                    <Col xs={12}>
                      <div style={S.label}>Visitor name <RequiredStar /></div>
                      <input
                        id="userName"
                        style={S.input(!!errors.userName)}
                        type="text"
                        value={formState.userName}
                        onChange={handleChange}
                        placeholder="Enter visitor full name"
                      />
                      {errors.userName && <div style={S.errMsg}>{errors.userName}</div>}
                    </Col>

                    {/* Visitor Type */}
                    <Col xs={12}>
                      <div style={S.label}>Visitor type <RequiredStar /></div>
                      <Select
                        menuPortalTarget={document.body}
                        isClearable
                        value={formState.visitorType}
                        onChange={handleSelectChange("visitorType")}
                        styles={selectStyles(!!errors.visitorType)}
                        options={visitorTypeGroup}
                        placeholder="Select type…"
                      />
                      {errors.visitorType && <div style={S.errMsg}>{errors.visitorType}</div>}
                    </Col>

                    {/* Meeting With */}
                    <Col xs={12}>
                      <div style={S.label}>Meeting with <RequiredStar /></div>
                      <Select
                        menuPortalTarget={document.body}
                        isClearable
                        value={formState.toWhom}
                        onChange={handleSelectChange("toWhom")}
                        options={Array.isArray(adminList?.data?.data) ? adminList.data.data : []}
                        styles={selectStyles(!!errors.toWhom)}
                        placeholder="Select person…"
                      />
                      {errors.toWhom && <div style={S.errMsg}>{errors.toWhom}</div>}
                    </Col>

                    {/* Purpose */}
                    <Col xs={12}>
                      <div style={S.label}>Purpose <RequiredStar /></div>
                      <input
                        id="purpose"
                        style={S.input(!!errors.purpose)}
                        type="text"
                        value={formState.purpose}
                        placeholder="Reason for visit"
                        onChange={handleChange}
                      />
                      {errors.purpose && <div style={S.errMsg}>{errors.purpose}</div>}
                    </Col>

                    {/* Address */}
                    <Col xs={12}>
                      <div style={S.label}>Address <RequiredStar /></div>
                      <input
                        id="address"
                        style={S.input(!!errors.address)}
                        type="text"
                        value={formState.address}
                        placeholder="City / full address"
                        onChange={handleChange}
                      />
                      {errors.address && <div style={S.errMsg}>{errors.address}</div>}
                    </Col>
                    {/* Card Number */}
                    <Col xs={12}>
                      <div style={S.label}>Card number <RequiredStar /></div>
                      <input
                        id="cardNumber"
                        style={S.input(!!errors.cardNumber)}
                        type="number"
                        value={formState.cardNumber}
                        onChange={handleChange}
                        placeholder="Enter card number"
                      />
                      {errors.cardNumber && <div style={S.errMsg}>{errors.cardNumber}</div>}
                    </Col>
                    {/* Visitor Photo */}
                    <Col xs={12}>
                      <div style={S.label}>Visitor photo</div>
                      <div
                        style={S.photoBox(!!photoFile)}
                        onClick={() => photoRef.current.click()}
                      >
                        {photoFile ? (
                          <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                              stroke={PRIMARY} strokeWidth="1.8"
                              strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span style={{ ...S.photoText, color: PRIMARY, fontWeight: 500 }}>
                              {photoFile.name}
                            </span>
                            <span style={{ ...S.photoText, fontSize: 11 }}>Click to change</span>
                          </>
                        ) : (
                          <>
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#888"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2-2h6l2 2h4a2 2 0 0 1 2 2z" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                            <span style={S.photoText}>Click to capture photo</span>
                            <span style={{ ...S.photoText, fontSize: 11 }}>JPG, PNG supported</span>
                          </>
                        )}
                      </div>
                      <input
                        ref={photoRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        style={{ display: "none" }}
                        onChange={handlePhotoChange}
                      />
                    </Col>

                    {/* Remarks */}
                    <Col xs={12}>
                      <div style={S.label}>Remarks</div>
                      <textarea
                        id="remarks"
                        style={S.textarea}
                        rows={3}
                        placeholder="Optional notes…"
                        value={formState.remarks}
                        onChange={handleChange}
                      />
                    </Col>

                    {/* Actions */}
                    <Col xs={12} className="d-flex align-items-center gap-2">
                      <Button
                        type="submit"
                        color="primary"
                      >
                        Save entry
                      </Button>
                      <Button
                        type="button"
                        color="secondary"
                        outline
                        onClick={handleCancelClick}
                      >
                        Cancel
                      </Button>
                    </Col>

                  </Row>
                </form>
              )}
            </CardBody>
          </Card>
        )}
        {!isTokenOnlyUser &&
          <Card style={S.card}>
            <div style={S.sectionHead}>
              <div style={S.sectionDot} />
              <p style={S.sectionTitle}>Visitor log</p>

              {/* inline filters */}
              <div className="d-flex gap-2 ms-auto flex-wrap align-items-center">
                <input
                  style={S.filterInput}
                  placeholder="Filter by name…"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                />
                <input
                  style={S.filterInput}
                  placeholder="Filter by Card No...."
                  value={filterCardNo}
                  type="number"
                  onChange={(e) => setFilterCardNo(e.target.value)}
                />
                <input
                  style={S.filterInput}
                  placeholder="Filter by mobile…"
                  value={filterMobile}
                  type="tel"
                  maxLength={10}
                  onChange={(e) => setFilterMobile(e.target.value.replace(/\D/g, ""))}
                />
                {(filterName || filterMobile) && (
                  <button
                    style={S.clearBtn}
                    color="secondary"
                    outline
                    onClick={() => { setFilterName(""); setFilterMobile(""); }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </Card>
        }
        <ImageModal
          isOpen={fileModalOpen}
          toggle={() => setFileModalOpen(!fileModalOpen)}
          imageSrc={currentImage}
        />
        {!isTokenOnlyUser &&
          <AppTable
            progressPending={isLoading}
            columns={columns}
            data={filteredData}
            pagination
          />
        }

      </Container>
    </PageContent>
  );
}