import {
  FaUsers,
  FaClipboardList,
  FaUpload,
  FaChartLine,
  FaUserTie,
  FaBuilding,
  FaMoneyCheckAlt,
  FaDollarSign,
  FaExchangeAlt,
  FaBullhorn,
  FaBriefcase,
  FaFolder,
  FaCalendarCheck,
  FaClipboardCheck,
  FaBox,
  FaCogs,
  FaShieldAlt,
  FaSignInAlt,
  FaCheckCircle,
  FaCalendarAlt,
  FaHardHat,
  FaFileAlt,
  FaUserAlt,
  FaRegClock,
  FaUserCheck,
  FaWallet,
  FaCommentAlt,
  FaRegFileAlt,
  FaHistory,
  FaRegCalendarAlt,
  FaShoppingCart,
  FaCreditCard,
  FaBullseye,
  FaTools,
  FaProjectDiagram,
  FaExclamationTriangle,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaUsersCog,
  FaIdCard,
  FaKey,
  FaRegWindowMaximize,
  FaBookOpen,
  FaRegMoneyBillAlt,
  FaUserPlus,
  FaRegClipboard,
  FaCog,
  FaFacebook,
  FaChartBar,
  FaHourglassHalf,
  FaGoogle,
  FaIdBadge,
  FaTradeFederation,
  FaUserFriends,
  FaMobile,
  FaUser,
  FaLocationArrow,
  FaUndo,
  FaEdit,
  FaFileContract,
  FaHome,
  FaBoxes,
  FaLaptopCode,
  FaWhatsapp,
  FaList,
  FaSteam,
  FaRupeeSign,
  FaDatabase,
  FaRocket,
  FaMouse,
  FaMap,
  FaShareAlt,
  FaCalculator,
  FaCodeBranch,
  FaUserSlash,
  FaRegHeart,
  FaCoins,
} from "react-icons/fa"; // Font Awesome
import {
  MdAccountCircle,
  MdAssignment,
  MdAttachFile,
  MdAttachMoney,
  MdBusiness,
  MdDashboard,
  MdDescription,
  MdFileUpload,
  MdMeetingRoom,
  MdNotifications,
  MdPayment,
  MdPeople,
  MdPhotoLibrary,
  MdSecurity,
  MdStickyNote2,
  MdSupervisorAccount,
  MdSupport,
  MdTransferWithinAStation,
  MdWork,
  MdEvent,
  MdAccessTime,
  MdOutlineInfo,
  MdCampaign,
  MdSupportAgent,
  MdLocationOn,
  MdFormatQuote,
  MdOpenInNew,
  MdUpdate,
  MdEventNote,
  MdOutlineAssignment,
  MdReportOff,
  MdWorkOff,
  MdDoNotDisturb,
  MdInsertDriveFile,
  MdDateRange,
  MdMoney,
  MdHistory,
  MdCall,
  MdAssignmentInd,
  MdInsights,
  MdOutlinePeopleAlt,
  MdReport,
  MdFeedback,
  MdTask,
  MdTaskAlt,
  MdTrackChanges,
  MdWhatsapp,
  MdDomain,
  MdInventory,
  MdQuiz,
  MdOutlineMeetingRoom,
  MdPersonAddAlt,
  MdDetails,
  MdLooksOne,
  MdLooksTwo,
  MdLooks3,
  MdVideoLibrary,
  MdSettingsSuggest,
  MdAccountBalance,
  MdPointOfSale,
  MdHealthAndSafety,
  MdAdd,
  MdAccountTree,
  MdOutlineDeveloperBoard,
  MdOutlineSupervisorAccount,
  MdOutlinePerson,
  MdOutlineSettingsSuggest,
  MdLeaderboard,
  MdSchedule,
  MdBookOnline,
  MdAnimation,
  MdDocumentScanner,
  MdAssignmentAdd,
  MdCandlestickChart,
  MdOutlineMp,
} from "react-icons/md"; // Material Design
import { MdGroup, MdPersonAdd } from "react-icons/md";
import { FaFolderOpen, FaUserShield } from "react-icons/fa";
import {
  AiFillCreditCard,
  AiOutlineCalendar,
  AiOutlineCustomerService,
  AiOutlineFileSearch,
  AiOutlineFlag,
  AiOutlineForm,
  AiOutlineUser,
} from "react-icons/ai";
import { GiPadlock, GiPartyPopper } from "react-icons/gi";
import { FiActivity, FiArchive, FiBarChart, FiFileText, FiInfo, FiLayers, FiMenu, FiUploadCloud, FiUserCheck, FiUsers } from "react-icons/fi";
import { IoIosChatbubbles, IoMdDocument, IoMdGitBranch } from "react-icons/io";
import { BiCloudUpload, BiSearchAlt } from "react-icons/bi";
import { RiAwardLine, RiFilePaper2Line, RiGoogleLine, RiMenuFoldLine, RiOrganizationChart } from "react-icons/ri";
import { defaultTheme } from "../../helpers/defaultTheme";
import { IoCheckmarkDoneCircle, IoPeople, IoRecording } from "react-icons/io5";

export const AdminSidebarData = [
  //Security
  {
    label: "User Management",
    icon: <GiPadlock color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Create User",
        link: "/users-list",
        icon: <MdPersonAdd color={defaultTheme.btnEnable} size={16} />
      },
      {
        sublabel: "Employee Master",
        link: "/user-master",
        icon: <IoPeople color={defaultTheme.btnEnable} size={16} />
      },
      {
        sublabel: "User Rights",
        link: "/user-menu-map",
        icon: <FaShieldAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Visitor Details",
        link: "/customer-visit-data",
        icon: <MdAccountCircle color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "User Login Log",
        link: "/user-login-log",
        icon: <FaSignInAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Asset Management",
        link: "/asset-management",
        icon: <MdInventory color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },
  // Master
  {
    label: "Masters",
    icon: <MdBusiness color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Department",
        link: "/department",
        icon: <FaUserTie color={defaultTheme.btnEnable} size={16} />
      },
      {
        sublabel: "Level",
        link: "/level",
        icon: <MdAssignment color={defaultTheme.btnEnable} size={16} />
      },
      {
        sublabel: "Designation",
        link: "/designation",
        icon: <FaIdBadge color={defaultTheme.btnEnable} size={16} />
      },
      {
        sublabel: "Branch Master",
        link: "/branch-master",
        icon: <FaCodeBranch color={defaultTheme.btnEnable} size={16} />
      },
      {
        sublabel: "Builder",
        link: "/builder",
        icon: <FaBuilding color={defaultTheme.btnEnable} size={16} />
      },
      {
        sublabel: "Builder Project",
        link: "/project-builder",
        icon: <FaCogs color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Project Unit Master",
        link: "/project-unit-master",
        icon: <FaBox color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Payment Plan Master",
        link: "/payment-plan-master",
        icon: <FaMoneyCheckAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Project Type Master",
        link: "/project-type-master",
        icon: <FaFolder color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Attendance Location",
        link: "/attendance-location-master",
        icon: <FaMapMarkerAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "MoneyTree Calender",
        link: "/calender-master",
        icon: <FaCalendarAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Sales Target Location",
        link: "/sales-target-location",
        icon: <FaLocationArrow color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Domains Master",
        link: "/domains-master",
        icon: <MdDomain color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "MOU Master",
        link: "/mou-master",
        icon: <FaMouse color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "MOU Screen",
        link: "/mou-screen",
        icon: <FaMouse color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Maps Master",
        link: "/maps-master",
        icon: <FaMap color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Social Media Data",
        link: "/social-media-data",
        icon: <FaShareAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Scheme Master",
        link: "/scheme-master",
        icon: <MdAccountTree color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },
  // Transaction
  {
    label: "Transactions",
    icon: <AiFillCreditCard color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Fresh Booking",
        link: "/fresh-booking",
        icon: <FaCalendarCheck color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "L1 Fresh Booking",
        link: "/first-level-fresh-booking",
        icon: <MdLooksOne color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "L2 Fresh Booking",
        link: "/second-level-fresh-booking",
        icon: <MdLooksTwo color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "L3 Fresh Booking",
        link: "/third-level-fresh-booking",
        icon: <MdLooks3 color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Inactive Fresh Booking",
        link: "/inactive-fresh-booking",
        icon: <FaUserSlash color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Sales Entry New",
        link: "/sales-entry-new",
        icon: <FaDollarSign color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Upload Booking Docs",
        link: "/upload-booking-docs",
        icon: <MdFileUpload color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Booking Documents",
        link: "/booking-docs",
        icon: <MdDocumentScanner color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Booking Details",
        link: "/booking-details",
        icon: <FaClipboardList color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Upload Booking Details",
        link: "/booking-annexure-upload",
        icon: <MdFileUpload color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Receive Pay Details",
        link: "/receive-pay-details",
        icon: <MdPayment color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Finance Sale Update",
        link: "/finance-sale-update",
        icon: <MdUpdate color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Demand Amount Form",
        link: "/demand-form",
        icon: <MdMoney color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Demand Date Form",
        link: "/demand-date-form",
        icon: <MdDateRange color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "BD Amount",
        link: "/bd-amount",
        icon: <FaMoneyCheckAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Sale Status",
        link: "/bba-value-manage",
        icon: <FaFileContract color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Acknowledgement Menu",
        link: "/acknowledgement-screen",
        icon: <IoCheckmarkDoneCircle color={defaultTheme.btnEnable} size={16} />,
      },
      // {
      //   sublabel: "Cancel Sales",
      //   link: "/cancel-sales",
      //   icon: <MdCancel color={defaultTheme.btnEnable} size={16}/>
      // },
    ],
  },
  // KYC
  {
    label: "KYC",
    icon: <FaUserCheck color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      // {
      //   sublabel: "Back Office KYC",
      //   link: "/back-office-kyc",
      //   icon: <AiOutlineIdcard color={defaultTheme.btnEnable} size={16} />,
      // },
      // {
      //   sublabel: "Ops KYC",
      //   link: "/ops-kyc",
      //   icon: <AiOutlineCheckCircle color={defaultTheme.btnEnable} size={16} />,
      // },
      // {
      //   sublabel: "Finance KYC",
      //   link: "/accounts-kyc",
      //   icon: <FaWallet color={defaultTheme.btnEnable} size={16} />,
      // },
      {
        sublabel: "KYC Team",
        link: "/kyc-team",
        icon: <FaUsers color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "MTRS Calling",
        link: "/mtrs-calling",
        icon: <FaPhoneAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Meeting Feedback",
        link: "/meeting-feedback",
        icon: <MdOutlineMeetingRoom color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },
  //MTRS Docs
  {
    label: "MTRS Docs",
    icon: <FaFileAlt color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Upload BBA",
        link: "/upload-bba",
        icon: <FiUploadCloud color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Upload NOC",
        link: "/upload-noc",
        icon: <BiCloudUpload color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "MTRS Status",
        link: "/mtrs-status",
        icon: <MdOutlineInfo color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "MTRS Files",
        link: "/mtrs-files",
        icon: <FiFileText color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },
  //Project Data
  {
    label: "Project Data",
    icon: <FaFolderOpen color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Project Documentation",
        link: "/project-documentation",
        icon: <MdDescription color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },
  //IVR Menu
  {
    label: "IVR Menu",
    icon: <FaPhoneAlt color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "IVR Agent List",
        link: "/ivr-agent-list",
        icon: <FaUser color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "IVR Recording",
        link: "/ivr-recording",
        icon: <IoRecording color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },

  //Admin Associate Section
  {
    label: "Admin Associate",
    icon: <FaUserShield color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Associate Meeting",
        link: "/associate-meeting",
        icon: <MdGroup color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Prospects",
        link: "/prospect-list-menu",
        icon: <FiBarChart color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Lead Feedback",
        link: "/lead-feedback-list",
        icon: <FaCommentAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Mark DND",
        link: "/mark-dnd-admin",
        icon: <MdDoNotDisturb color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "DND History",
        link: "/dnd-history",
        icon: <MdDoNotDisturb color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Lead Report",
        link: "/lead-report",
        icon: <MdReport color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Track Location",
        link: "/track-location",
        icon: <FaMapMarkerAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Pull Back Suspect",
        link: "/pull-back-suspect",
        icon: <FaUndo color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Update Name/Meetings",
        link: "/update-pros-mobile",
        icon: <FaEdit color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Q&A Master",
        link: "/Q&A-master",
        icon: <MdQuiz color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Personal Details",
        link: "/personal-birthday-details",
        icon: <MdPersonAddAlt color={defaultTheme.btnEnable} size={16} />,
      }
    ],
  },

  //Team
  {
    label: "Team",
    icon: <FaUsers color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Main Team",
        link: "/main-team",
        icon: <MdSupervisorAccount color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Sub Team",
        link: "/sub-team",
        icon: <FiLayers color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },

  //BM Menu
  {
    label: "BH Menu",
    icon: <MdBusiness color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Attendance",
        link: "/bm-attendance-screen",
        icon: <FaCalendarCheck color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Suspects",
        link: "/bm-suspect-screen",
        icon: <FaChartLine color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Prospects",
        link: "/bm-prospect-screen",
        icon: <FiBarChart color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Meetings",
        link: "/bm-meeting-screen",
        icon: <MdAccessTime color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Meetings Not Ended",
        link: "/bm-meeting-not-ended",
        icon: <MdMeetingRoom color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "BM Assigned Candidate",
        link: "/bm-assigned-candidate",
        icon: <MdAssignmentAdd color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "BM Booking",
        link: "/bm-sales-entry-new",
        icon: <MdBookOnline color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "BM Temp Booking",
        link: "/bm-fresh-booking",
        icon: <MdOutlineMp color={defaultTheme.btnEnable} size={16} />,
      }
    ]
  },

  // OTP
  {
    label: "OTP",
    icon: <FaShieldAlt color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "OTP Details",
        link: "/otp-details",
        icon: <FiInfo color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "OTP Details (16-Dec-24)",
        link: "/old-otp-details",
        icon: <FiArchive color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },
  //Upload Data
  {
    label: "Upload Data",
    icon: <FaUpload color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Upload SBI Files",
        link: "/upload-sbi-files",
        icon: <MdAttachFile color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Transfer Prospects",
        link: "/trasfer-prospect-data",
        icon: <MdTransferWithinAStation color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Upload Leads",
        link: "/upload-lead-data",
        icon: <MdFileUpload color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Upload Lead Feedback",
        link: "/lead-upload-feedback",
        icon: <MdFeedback color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Transfer Suspects",
        link: "/lead-transfer",
        icon: <FaExchangeAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Upload Unit Master",
        link: "/upload-unit-master",
        icon: <FaUpload color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Transfer P100 Leads",
        link: "/transfer-p-100-leads",
        icon: <MdTransferWithinAStation color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Upload Sale Master",
        link: "/upload-sale-master",
        icon: <FaUpload color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },
  //Verification
  {
    label: "Verification",
    icon: <FaCheckCircle color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Verification",
        link: "/verification",
        icon: <FaSignInAlt color={defaultTheme.btnEnable} size={16} />,
      },
    ]
  },
  //MOM
  {
    label: "M.O.M.",
    icon: <FaRegFileAlt color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "M.O.M. Menu",
        link: "/mom-screen",
        icon: <MdDescription color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },
  //Customer Care
  {
    label: "Customer Care",
    icon: <FiMenu color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Customer Care Menu",
        link: "/customer-care-screen",
        icon: <AiOutlineCustomerService color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },
  // //Banner
  // {
  //   label: "App-Menu",
  //   icon: <MdAnnouncement color={defaultTheme.btnEnable} size={16}/>,
  //   subItem: [
  //     {
  //       sublabel: "App Banner",
  //       link: "/app-banner",
  //       icon: <FaBullhorn color={defaultTheme.btnEnable} size={16}/>,
  //     },
  //     {
  //       sublabel: "App Icons",
  //       link: "/app-icons",
  //       icon: <FaAppStore color={defaultTheme.btnEnable} size={16}/>,
  //     },
  //   ]
  // },
  //Visitors
  {
    label: "Visitors",
    icon: <AiOutlineUser color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Visitor Entry",
        link: "/visitor-entry",
        icon: <FaSignInAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Visitor History",
        link: "/visitor-history",
        icon: <FaUserAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Client Inside History",
        link: "/client-inside-history",
        icon: <FaHistory color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },
  //Tasks
  {
    label: "Tasks",
    icon: <MdTask color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "My Tasks",
        link: "/my-tasks",
        icon: <MdTaskAlt color={defaultTheme.btnEnable} size={16} />,
      }
    ],
  },
  //Meta
  {
    label: "Meta Menu",
    icon: <FaFacebook color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "All Leads",
        link: "/all-ads-screen",
        icon: <MdCampaign color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "All Campaigns",
        link: "/meta-admin-ads",
        icon: <AiOutlineFlag color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },
  // Google
  {
    label: "Google Menu",
    icon: <FaGoogle color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Google Leads",
        link: "/all-google-projects",
        icon: <RiGoogleLine color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Online Leads Details",
        link: "/online-lead-screen",
        icon: <RiGoogleLine color={defaultTheme.btnEnable} size={16} />,
      }
    ],
  },


  //Activity
  {
    label: "Activity",
    icon: <FiActivity color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Policy Documents",
        link: "/policy-creation",
        icon: <RiFilePaper2Line color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Post Property",
        link: "/post-property",
        icon: <FaHome color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Focus Project Master",
        link: "/focus-project-master",
        icon: <FaClipboardList color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Ticker",
        link: "/ticker",
        icon: <MdStickyNote2 color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Gallery",
        link: "/gallery",
        icon: <MdPhotoLibrary color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Award Master",
        link: "/reward-master",
        icon: <RiAwardLine color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Marketing",
        link: "/marketing",
        icon: <FaBullhorn color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Chat Group",
        link: "/chat-group",
        icon: <IoIosChatbubbles color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Notifications",
        link: "/notification",
        icon: <MdNotifications color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "WhatsApp Messages",
        link: "/whatsapp-messages",
        icon: <MdWhatsapp color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Letter Head Master",
        link: "/letter-head-admin-screen",
        icon: <RiFilePaper2Line color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Letter Head User",
        link: "/letter-head-user-screen",
        icon: <RiFilePaper2Line color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Project Reward Points",
        link: "/reward-points-all",
        icon: <RiAwardLine color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "New Project Launch",
        link: "/project-launch-master",
        icon: <FaRocket color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "New Projects",
        link: "/project-launch-screen",
        icon: <FaDatabase color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Key Person's Registration",
        link: "/rm-details-data",
        icon: <FaBuilding color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Project Registration",
        link: "/project-registration-data",
        icon: <FaProjectDiagram color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Media Project Docs",
        link: "/media-project-documents",
        icon: <MdVideoLibrary color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Ops Project Docs",
        link: "/ops-project-documents",
        icon: <MdSettingsSuggest color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Finance Project Docs",
        link: "/finance-project-documents",
        icon: <MdAccountBalance color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "D.I.Y. Calculator",
        link: "/diy-calculator-menu",
        icon: <FaCalculator color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "BD Target",
        link: "/bd-target-screen",
        icon: <MdTrackChanges color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Think IT",
        link: "/instant-meeting-screen",
        icon: <FaLaptopCode color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Insurant Nomination Details",
        link: "/insurance-nominee-details",
        icon: <MdHealthAndSafety color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Add PPC Leads",
        link: "/add-ppc-leads",
        icon: <MdAdd color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "PPC Leads",
        link: "/ppc-leads",
        icon: <MdCampaign color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Branch Overview",
        link: "/branch-overview",
        icon: <IoMdGitBranch color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Report P100 Leads",
        link: "/p-100-report",
        icon: <MdReport color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "MTpay Scheme",
        link: "/mt-pay-scheme",
        icon: <MdSchedule color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Booking MTpay Scheme",
        link: "/booking-mt-pay-scheme",
        icon: <MdBookOnline color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "AI BOT Rights",
        link: "/floating-chat-widget-rights",
        icon: <MdAnimation color={defaultTheme.btnEnable} size={16} />,
      },
    ]
  },

  //Events
  {
    label: "Events",
    icon: <MdMeetingRoom color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Create Event",
        link: "/create-event",
        icon: <MdMeetingRoom color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Event Entry",
        link: "/event-entry",
        icon: <AiOutlineCalendar color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Event History",
        link: "/event-history",
        icon: <FaHistory color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Event Meeting Details",
        link: "/event-meeting-details",
        icon: <MdMeetingRoom color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },
  //Connect Menu
  {
    label: "Connect Menu",
    icon: <FaWallet color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Connect Enrollment",
        link: "/connect-enrollment",
        icon: <MdPersonAdd color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Plan List",
        link: "/connect-plan-list",
        icon: <FaRegMoneyBillAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Ticker",
        link: "/connect-ticker",
        icon: <FaBullhorn color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Project Guide",
        link: "/connect-project-guide",
        icon: <FaBookOpen color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Pop-Up",
        link: "/connect-pop-up",
        icon: <FaRegWindowMaximize color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Notifications",
        link: "/connect-notifications",
        icon: <MdNotifications color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Events",
        link: "/connect-events",
        icon: <MdEvent color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Testimonial",
        link: "/connect-testimonial",
        icon: <MdFormatQuote color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "RM Change",
        link: "/connect-rm-change",
        icon: <FaExchangeAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "OTP List",
        link: "/connect-otp-list",
        icon: <FaKey color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Support",
        link: "/connect-support",
        icon: <MdSupportAgent color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Invoice",
        link: "/connect-invoice",
        icon: <FaCreditCard color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "KYC",
        link: "/connect-kyc",
        icon: <FaIdCard color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Location Master",
        link: "/connect-location-master",
        icon: <MdLocationOn color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Occupation Master",
        link: "/connect-occupation-master",
        icon: <MdWork color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Payout",
        link: "/connect-payout",
        icon: <MdAttachMoney color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "All Leads",
        link: "/all-connect-enrollment-leads",
        icon: <FaUserPlus color={defaultTheme.btnEnable} size={16} />,
      }
    ],
  },
  //HR Menu
  {
    label: "HR Menu",
    icon: <FaUsersCog color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Create Candidate",
        link: "/recruiter-history",
        icon: <FaIdBadge color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "All Candidate Details",
        link: "/all-candidate-history",
        icon: <FaUserFriends color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Candidate Docs",
        link: "/candidate-docs",
        icon: <MdInsertDriveFile color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Assigned Candidate",
        link: "/assigned-candidate-data",
        icon: <MdAssignmentInd color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Interviewer History",
        link: "/interview-hr-history",
        icon: <MdHistory color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Call Report",
        link: "/call-report",
        icon: <MdCall color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Interview Report Details",
        link: "/view-interview-report-details",
        icon: <MdInsertDriveFile color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Joining/Resigned Report",
        link: "/view-employee-details",
        icon: <MdOutlinePeopleAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Main Team Report",
        link: "/hr-main-team-report",
        icon: <MdInsights color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Branch Strength",
        link: "/branch-strength-report",
        icon: <IoMdGitBranch color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Location Master",
        link: "/location-master",
        icon: <MdLocationOn color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Upcoming Joining List",
        link: "/hr-joining-list",
        icon: <FaUserPlus color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "HR Data Transfer",
        link: "/hr-data-transfer",
        icon: <MdTransferWithinAStation color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Jobs",
        link: "/jobs",
        icon: <FaBriefcase color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Upload Social Media CV",
        link: "/upload-social-media-cv",
        icon: <FaUpload color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "GET Social Media CV",
        link: "/get-social-media-cv",
        icon: <FaList color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Finance HR Docs",
        link: "/finance-hr-docs",
        icon: <IoMdDocument color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "HR Details Report",
        link: "/details-report",
        icon: <MdDetails color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Recruitment Feedback",
        link: "/recruitment-feedback",
        icon: <MdFeedback color={defaultTheme.btnEnable} size={16} />,
      },
    ]
  },

  //Change Request 
  {
    label: "SAP Modification",
    icon: (
      <MdOutlineSettingsSuggest
        color={defaultTheme.btnEnable}
        size={18}
      />
    ),
    subItem: [
      {
        sublabel: "User Change Request",
        link: "/user-change-request",
        icon: (
          <MdOutlinePerson
            color={defaultTheme.btnEnable}
            size={16}
          />
        ),
      },
      {
        sublabel: "RM Change Request",
        link: "/rm-change-request",
        icon: (
          <MdOutlineSupervisorAccount
            color={defaultTheme.btnEnable}
            size={16}
          />
        ),
      },
      {
        sublabel: "IT Change Request",
        link: "/it-change-request",
        icon: (
          <MdOutlineDeveloperBoard
            color={defaultTheme.btnEnable}
            size={16}
          />
        ),
      },
    ],
  },
  //FNF Menu
  {
    label: "FNF Menu",
    icon: <FiMenu color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "HR FNF List",
        link: "/hr-fnf-list",
        icon: <FiUsers color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "HOD FNF List",
        link: "/hods-fnf-list",
        icon: <FaUserTie color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Finance FNF List",
        link: "/finance-fnf-list",
        icon: <FaMoneyCheckAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Admin FNF List",
        link: "/admin-fnf-list",
        icon: <FaBoxes color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "IT FNF List",
        link: "/it-fnf-list",
        icon: <FaLaptopCode color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "OPS FNF List",
        link: "/ops-fnf-list",
        icon: <FaWhatsapp color={defaultTheme.btnEnable} size={16} />,
      },
    ]
  },

  //Reports
  {
    label: "Reports",
    icon: <FaFileAlt color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "BD VB AB Report",
        link: "/bd-vb-ab-report",
        icon: <IoMdDocument color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Temp Booking Report",
        link: "/temp-booking-report",
        icon: <AiOutlineCalendar color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Defaulter",
        link: "/defaulter-report",
        icon: <FaExclamationTriangle color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Main Team Wise Pros",
        link: "/pros-report-mainteam",
        icon: <FaChartLine color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Sub Team Wise Pros",
        link: "/pros-report-subteam",
        icon: <FaUsersCog color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Main Team Wise Meeting",
        link: "/meet-report-mainteam",
        icon: <FaRegCalendarAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Sub Team Wise Meeting",
        link: "/meet-report-subteam",
        icon: <FaUsersCog color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Associate Pros Details",
        link: "/pros-report-associate",
        icon: <FaUserAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Associate Meet Details",
        link: "/meet-report-associate",
        icon: <FaUsers color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Branch Wise Meeting",
        link: "/meet-report-branch-wise",
        icon: <MdMeetingRoom color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Pros/Suspect/Meet",
        link: "/prospect-meeting-details-report",
        icon: <MdEvent color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Sale Master",
        link: "/report-sale-master",
        icon: <FaShoppingCart color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Sales Performance",
        link: "/user-performance-report",
        icon: <FaChartLine color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Payment Master",
        link: "/report-payment-plan-master",
        icon: <FaCreditCard color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Visitor Management",
        link: "/report-visitor-management",
        icon: <FaUsers color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Sales Target",
        link: "/sales-target-report",
        icon: <FaBullseye color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Event Target",
        link: "/meeting-target-report",
        icon: <FaRegCalendarAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Builder Wise",
        link: "/report-builder-wise",
        icon: <FaTools color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Project Wise",
        link: "/report-project-wise",
        icon: <FaProjectDiagram color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Booking Status",
        link: "/booking-status-report",
        icon: <FaClipboardList color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Demand Form",
        link: "/demand-form-report",
        icon: <AiOutlineForm color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "KYC Report",
        link: "/kyc-report",
        icon: <FaFileAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Trading Window",
        link: "/trading-window-report",
        icon: <FaTradeFederation color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Tuesday Report",
        link: "/tuesday-report",
        icon: <MdReportOff color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Leave History",
        link: "/leave-history-report",
        icon: <MdWorkOff color={defaultTheme.btnEnable} size={16} />,
      }
    ],
  },
  //  Finance Reports
  {
    label: "Finance Reports",
    icon: <FaChartLine color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Builder Wise Turnover",
        link: "/turnover-builder-wise",
        icon: <FaHardHat color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Builder Wise Booking",
        link: "/booking-builder-wise",
        icon: <FaRegClipboard color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Team Wise Booking",
        link: "/booking-team-wise",
        icon: <MdEventNote color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "VB AB Report",
        link: "/vb-ab-report",
        icon: <AiOutlineFileSearch color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },
  //  BO Reports
  {
    label: "BO Reports",
    icon: <FaCog color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      // {
      //   sublabel: "Temp Booking",
      //   link: "/temp-booking-report",
      //   icon: <AiOutlineCalendar color={defaultTheme.btnEnable} size={16} />,
      // },
      {
        sublabel: "Main Team Wise",
        link: "/data-main-team-wise",
        icon: <FaChartBar color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Builder Wise",
        link: "/ops-report-builder-wise",
        icon: <FaBuilding color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Project Wise",
        link: "/ops-report-project-wise",
        icon: <MdOutlineAssignment color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Daily Booking",
        link: "/ops-report-daily-booking",
        icon: <FaRegCalendarAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Daily Dispatch",
        link: "/ops-report-daily-dispatch",
        icon: <FaBox color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Daily Temp",
        link: "/ops-report-daily-temp-booking",
        icon: <FaHourglassHalf color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },
  {
    label: "Enquiry Menu",
    icon: <RiMenuFoldLine color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Add Enquiry",
        link: "/add-enquiry",
        icon: <FaEnvelope color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Enquiry History",
        link: "/enquiry-history",
        icon: <FaHistory color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Add New Enquiry",
        link: "/new-enquiry",
        icon: <FaEnvelope color={defaultTheme.btnEnable} size={16} />,
      },
    ]
  },
  {
    label: "Pop Up Menu",
    icon: <FiMenu color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Popup",
        link: "/popup-list",
        icon: <MdOpenInNew color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Birthday Popup",
        link: "/birthday-popup",
        icon: <GiPartyPopper color={defaultTheme.btnEnable} size={16} />,
      },
    ]
  },
  //
  {
    label: "Support",
    url: "/support",
    issubMenubadge: true,
    icon: <MdSupport color={defaultTheme.btnEnable} size={16} />,
  },
  {
    label: "Open Project Units",
    url: "/open-project-unit-details",
    issubMenubadge: true,
    icon: <MdSecurity color={defaultTheme.btnEnable} size={16} />,
  },
  {
    label: "Hold Project Units",
    url: "/hold-project-unit-details",
    issubMenubadge: true,
    icon: <MdSecurity color={defaultTheme.btnEnable} size={16} />,
  },
  {
    label: "All Attendance",
    url: "/attendance",
    issubMenubadge: true,
    icon: <FaCalendarCheck color={defaultTheme.btnEnable} size={16} />,
  },
  {
    label: "Attendance",
    icon: <FaCalendarCheck color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "OD History",
        link: "/od-history",
        icon: <FaHardHat color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Regularize Attendance History",
        link: "/regularization-history",
        icon: <FaCalendarAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Monthly Team Attendance",
        link: "/monthly-team-attendance",
        icon: <FaCalendarAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Main Team Attendance",
        link: "/view-team-attendance",
        icon: <FaCalendarAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Branch Wise Attendance",
        link: "/branch-wise-attendance",
        icon: <RiOrganizationChart color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Mobile Attendance",
        link: "/mobile-attendance",
        icon: <FaMobile color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },
];

export const AssociateSidebarData = [
  {
    label: "Associate Section",
    icon: <MdWork color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "KYT",
        link: "/kyt-screen",
        icon: <FaSteam color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "D.I.Y. Calculator",
        link: "/diy-calculator-menu",
        icon: <FaCalculator color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "MTpay",
        link: "/sales-mt-pay-scheme",
        icon: <FaCoins color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Focus Project",
        link: "/view-focus-project",
        icon: <MdTrackChanges color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Associate Meeting",
        link: "/associate-meeting-details",
        icon: <MdPeople color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Meeting Dashboard",
        link: "/meeting-list-count",
        icon: <MdDashboard color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Meeting Details",
        link: "/meeting-details",
        icon: <MdMeetingRoom color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Prospects",
        link: "/prospect-list-menu",
        icon: <FaClipboardList color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "My Favourite",
        link: "/my-favourite",
        icon: <FaRegHeart color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Prospects Bulk Update",
        link: "/prospect-bulk-update",
        icon: <IoMdDocument color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Upload SBI Proof",
        link: "/upload-sbi-proof",
        icon: <FaUpload color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Open Project Units",
        link: "/open-project-unit-details",
        icon: <MdSecurity color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Hold Project Units",
        link: "/hold-project-unit-details",
        icon: <MdSecurity color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Suspect Data",
        link: "/suspect-data",
        icon: <FaChartLine color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Transfer Prospects",
        link: "/trasfer-prospect-data",
        icon: <FaExchangeAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Transfer Suspects",
        link: "/lead-transfer",
        icon: <MdTransferWithinAStation color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "IVR Recording",
        link: "/ivr-recording",
        icon: <IoRecording color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Project Documentation",
        link: "/project-documentation",
        icon: <MdDescription color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Upload Leads",
        link: "/upload-lead-data",
        icon: <MdFileUpload color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Due Payment",
        link: "/due-payment-report",
        icon: <FaRupeeSign color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Sales Project Docs",
        link: "/sales-project-documents",
        icon: <MdPointOfSale color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Add P100 Leads",
        link: "/p-100-leads",
        icon: <MdLeaderboard color={defaultTheme.btnEnable} size={16} />,
      },
      // {
      //   sublabel: "P100 Leads Report",
      //   link: "/report-p-100",
      //   icon: <MdReport color={defaultTheme.btnEnable} size={16} />,
      // },
      {
        sublabel: "Report P100 Leads",
        link: "/p-100-report",
        icon: <MdReport color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Transfer P100 Leads",
        link: "/transfer-p-100-leads",
        icon: <MdTransferWithinAStation color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Upload Booking Docs",
        link: "/upload-booking-docs",
        icon: <MdFileUpload color={defaultTheme.btnEnable} size={16} />,
      },
      // {
      //   sublabel: "Demand Data",
      //   link: "/view-demand-data",
      //   icon: <MdFileUpload color={defaultTheme.btnEnable} size={16} />,
      // },
    ],
  },
  {
    label: "BM Menu",
    icon: <MdBusiness color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Attendance",
        link: "/bm-attendance-screen",
        icon: <FaCalendarCheck color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Suspects",
        link: "/bm-suspect-screen",
        icon: <FaChartLine color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Prospects",
        link: "/bm-prospect-screen",
        icon: <FiBarChart color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Meetings",
        link: "/bm-meeting-screen",
        icon: <MdAccessTime color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Meetings Not Ended",
        link: "/bm-meeting-not-ended",
        icon: <MdMeetingRoom color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Admin FNF List",
        link: "/admin-fnf-list",
        icon: <FaBoxes color={defaultTheme.btnEnable} size={16} />,
      },
      // {
      //   sublabel: "BM Assigned Candidate",
      //   link: "/bm-assigned-candidate",
      //   icon: <MdAssignmentAdd color={defaultTheme.btnEnable} size={16} />,
      // }
    ]
  },
  {
    label: "Attendance",
    icon: <FaCalendarCheck color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "My Attendance",
        link: "/my-attendance",
        icon: <FaCheckCircle color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Monthly Team Attendance",
        link: "/monthly-team-attendance",
        icon: <FaCalendarAlt color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Daily Team Attendance",
        link: "/daily-team-attendance",
        icon: <FaRegClock color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Apply OD",
        link: "/apply-od",
        icon: <FaClipboardCheck color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "OD History",
        link: "/od-history",
        icon: <FaHardHat color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Regularize Attendance",
        link: "/apply-attendance-regularization",
        icon: <FaClipboardCheck color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Regularize Attendance History",
        link: "/regularization-history",
        icon: <FaCalendarAlt color={defaultTheme.btnEnable} size={16} />,
      },
    ],
  },
  //  Meta
  {
    label: "Online Leads",
    icon: <FiUserCheck color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Meta Campaigns",
        link: "/meta-associate-leads",
        icon: <FaFacebook color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "New Meta Leads",
        link: "/google-sheet-leads",
        icon: <FaFacebook color={defaultTheme.btnEnable} size={16} />,
      },
      // {
      //   sublabel: "Assigned Meta Leads",
      //   link: "/view-assigned-associate",
      //   icon: <FaFacebookF color={defaultTheme.btnEnable} size={16} />,
      // },
      // {
      //   sublabel: "Google Leads",
      //   link: "/view-google-leads",
      //   icon: <RiGoogleLine color={defaultTheme.btnEnable} size={16} />,
      // },
      {
        sublabel: "Google Projects",
        link: "/all-google-projects",
        icon: <RiGoogleLine color={defaultTheme.btnEnable} size={16} />,
      },
      // {
      //   sublabel: "Assigned Google Leads",
      //   link: "/view-assigned-google-leads",
      //   icon: <FaGoogle color={defaultTheme.btnEnable} size={16} />,
      // },
    ],
  },
  {
    label: "HR Menu",
    icon: <FaUsersCog color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "Assigned Candidate",
        link: "/assigned-candidate-data",
        icon: <MdAssignmentInd color={defaultTheme.btnEnable} size={16} />,
      },
      {
        sublabel: "Referral Candidate Status",
        link: "/referral-candidate-status",
        icon: <MdCandlestickChart color={defaultTheme.btnEnable} size={16} />,
      }
    ]
  },

  //Connect
  // {
  //   label: "Connect Menu",
  //   icon: <MdBusiness color={defaultTheme.btnEnable} size={16} />,
  //   subItem: [
  //     {
  //       sublabel: "Connect Info",
  //       link: "/connect-associate-info",
  //       icon: <FaInfoCircle color={defaultTheme.btnEnable} size={16} />,
  //     },
  //     {
  //       sublabel: "RM Change",
  //       link: "/connect-rm-change",
  //       icon: <MdSwapHoriz color={defaultTheme.btnEnable} size={16} />,
  //     }
  //   ]
  // },

  // FNF Menu
  {
    label: "FNF Menu",
    icon: <FiMenu color={defaultTheme.btnEnable} size={16} />,
    subItem: [
      {
        sublabel: "HOD FNF List",
        link: "/hods-fnf-list",
        icon: <FaUserTie color={defaultTheme.btnEnable} size={16} />,
      }
    ]
  },
  {
    label: "Enquiry",
    url: "/enquiry-reply",
    issubMenubadge: true,
    icon: <BiSearchAlt color={defaultTheme.btnEnable} size={16} />,
  },
];
