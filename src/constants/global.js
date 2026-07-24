import { FaClock, FaFileAlt, FaFileImage, FaFilePdf, FaFilePowerpoint, FaFileVideo, FaFileWord } from "react-icons/fa";
import { PiCheckCircleBold, PiPauseCircleBold, PiXCircleBold } from "react-icons/pi";
import { formatDateTime } from "../helpers/function_helper";

export const USER_TYPE = {
  ADMIN: "ADMIN",
  ASSOCIATE: "ASSOCIATE",
  OTHER: "OTHER"
};

export const indianStates = [
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
  { value: 'Assam', label: 'Assam' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Manipur', label: 'Manipur' },
  { value: 'Meghalaya', label: 'Meghalaya' },
  { value: 'Mizoram', label: 'Mizoram' },
  { value: 'Nagaland', label: 'Nagaland' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Sikkim', label: 'Sikkim' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Tripura', label: 'Tripura' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'Uttarakhand', label: 'Uttarakhand' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands' },
  { value: 'Chandigarh', label: 'Chandigarh' },
  { value: 'Dadra and Nagar Haveli and Daman and Diu', label: 'Dadra and Nagar Haveli and Daman and Diu' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
  { value: 'Ladakh', label: 'Ladakh' },
  { value: 'Lakshadweep', label: 'Lakshadweep' },
  { value: 'Puducherry', label: 'Puducherry' }
];

export const formStageOptions = [
  { value: 18, label: "Accepted By Builder" },
  { value: 20, label: "Cancelled" },
  { value: 14, label: "Cancel NOC Generate" },
  { value: 13, label: "Login" },
  { value: 58, label: "Ready To Dispatch" },
  { value: 19, label: "Rejected" },
  { value: 17, label: "Submit To Builder" }
];

export const bloodGroupOptions = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
]

export const weekDaysOptions = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Sunday', label: 'Sunday' }
]

export const stageOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'EOI', label: 'EOI' },
]

export const sourceOptions = [
  { value: 'Apna', label: 'Apna' },
  { value: 'Campus', label: 'Campus' },
  { value: 'Co. Number', label: 'Co. Number' },
  { value: 'Co. Website', label: 'Co. Website' },
  { value: 'Freshersworld', label: 'Freshersworld' },
  { value: 'Indeed', label: 'Indeed' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'SocialMedia', label: 'Social Media' },
  { value: 'Naukri', label: 'Naukri' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Shine.com', label: 'Shine.com' },
  { value: 'Work India', label: 'Work India' },
  { value: 'Job Hai App', label: 'Job Hai App' },
  { value: "Team ASGZ", label: "Team ASGZ" },
  { value: "Team AJ", label: "Team AJ" },
  { value: "Team SP", label: "Team SP" },
  { value: "Team PK", label: "Team PK" },
  { value: "Team YM", label: "Team YM" },
  { value: "Team VT", label: "Team VT" },
  { value: "Team Soorma", label: "Team Soorma" },
  { value: "Team Sahani", label: "Team Sahani" },
  { value: "Team RS", label: "Team RS" },
  { value: "Team RH", label: "Team RH" },
  { value: "Team AM", label: "Team AM" },
  { value: "Team AR", label: "Team AR" },
  { value: "Team AS", label: "Team AS" },
  { value: "Team ASS", label: "Team ASS" },
  { value: "Team CK", label: "Team CK" },
  { value: "Team DK", label: "Team DK" },
  { value: "Team JR", label: "Team JR" },
  { value: "Team KK", label: "Team KK" }
];

export const monthOptions = [
  { value: "January", label: "January" },
  { value: "February", label: "February" },
  { value: "March", label: "March" },
  { value: "April", label: "April" },
  { value: "May", label: "May" },
  { value: "June", label: "June" },
  { value: "July", label: "July" },
  { value: "August", label: "August" },
  { value: "September", label: "September" },
  { value: "October", label: "October" },
  { value: "November", label: "November" },
  { value: "December", label: "December" }
];

export const yearOptions = (() => {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 20;

  return Array.from(
    { length: maxYear - currentYear + 1 },
    (_, i) => {
      const year = currentYear + i;
      return {
        value: year,
        label: year.toString()
      };
    }
  );
})();

export const getFileIcon = (fileName) => {
  const ext = fileName?.split(".").pop().toLowerCase();

  switch (ext) {
    case "pdf":
      return <FaFilePdf color="#E74C3C" size={20} />;
    case "doc":
    case "docx":
      return <FaFileWord color="#2E86C1" size={20} />;
    case "ppt":
    case "pptx":
      return <FaFilePowerpoint color="#D35400" size={20} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return <FaFileImage color="#27AE60" size={20} />;
    case "mp4":
    case "mov":
    case "avi":
    case "mkv":
      return <FaFileVideo color="#8E44AD" size={20} />;
    default:
      return <FaFileAlt color="#7F8C8D" size={20} />;
  }
};

export const getStatusBadge = (leadStatus) => {
  const commonStyleOne = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "6px 10px",
    gap: 2,
  }
  // ✅ Case 1: Not Assigned
  if (!leadStatus) {
    return (
      <span
        className="imd-chip"
        style={{
          ...commonStyleOne,
          background: "#EFF6FF",
          color: "#2563EB",
          border: "1px solid #BFDBFE"
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontWeight: 700
          }}
        >
          <FaClock size={15} />
        </span>
      </span>
    )
  }

  // ✅ API object
  const status = leadStatus?.status || "Pending"
  const updatedAt = leadStatus?.updatedAt || "NA"

  const normalizedStatus = status?.toString()?.toLowerCase()

  const commonStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "6px 10px",
    gap: 2,
    minWidth: 120
  }

  switch (normalizedStatus) {

    case "prospect":
      return (
        <span
          className="imd-chip imd-chip-green"
          style={commonStyle}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontWeight: 700
            }}
          >
            <PiCheckCircleBold size={15} />
          </span>

          <span style={{ fontSize: 10 }}>
            {updatedAt === "NA"
              ? "-"
              : formatDateTime(updatedAt)}
          </span>
        </span>
      )

    case "reject":
      return (
        <span
          className="imd-chip"
          style={{
            ...commonStyle,
            background: "#FEF2F2",
            color: "#DC2626",
            border: "1px solid #FECACA"
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontWeight: 700
            }}
          >
            <PiXCircleBold size={15} />
          </span>

          <span style={{ fontSize: 10 }}>
            {updatedAt === "NA"
              ? "-"
              : formatDateTime(updatedAt)}
          </span>
        </span>
      )

    case "hold":
      return (
        <span
          className="imd-chip"
          style={{
            ...commonStyle,
            background: "#FFF7ED",
            color: "#EA580C",
            border: "1px solid #FED7AA"
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontWeight: 700
            }}
          >
            <PiPauseCircleBold size={15} />
          </span>

          <span style={{ fontSize: 10 }}>
            {updatedAt === "NA"
              ? "-"
              : formatDateTime(updatedAt)}
          </span>
        </span>
      )

    case "pending":
      return (
        <span
          className="imd-chip"
          style={{
            ...commonStyle,
            background: "#EFF6FF",
            color: "#2563EB",
            border: "1px solid #BFDBFE"
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontWeight: 700
            }}
          >
            <FaClock size={15} />
          </span>

          <span style={{ fontSize: 10 }}>
            {updatedAt === "NA"
              ? "-"
              : formatDateTime(updatedAt)}
          </span>
        </span>
      )

    default:
      return (
        <span
          className="imd-chip"
          style={{
            ...commonStyle,
            background: "#EFF6FF",
            color: "#2563EB",
            border: "1px solid #BFDBFE"
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontWeight: 700
            }}
          >
            <FaClock size={15} />
            {status}
          </span>

          <span style={{ fontSize: 10 }}>
            {updatedAt === "NA"
              ? "-"
              : formatDateTime(updatedAt)}
          </span>
        </span>
      )
  }
}

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}