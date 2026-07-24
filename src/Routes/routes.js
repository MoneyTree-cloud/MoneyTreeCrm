import { lazy } from "react";
import { Navigate } from "react-router-dom";
import PasswordChange from "../Pages/Password/PasswordChange";
import ViewComplaint from "../Pages/Support/ViewComplaint";
import MeetingDashboardAdmin from "../Pages/AdminAssociateSetion/MeetingDashboardAdmin";
import RevenueReportAdmin from "../Pages/AdminAssociateSetion/RevenueReportAdmin";
import ManageRevenueSale from "../Pages/Transaction/ManageRevenueSale";
import LeadFeedbackReport from "../Pages/AdminAssociateSetion/LeadFeedbackReport";
import AttendanceScreen from "../Pages/Attendance/AttendanceScreen";
import AssociateRevenueAssociate from "../Pages/AssociateSection/AssociateRevenueAssociate";
import JobsScreen from "../Pages/HrModule/JobsScreen";
import RevenueFormAssociate from "../Pages/AssociateSection/RevenueFormAssociate";
import ReceivePayFile from "../Pages/Transaction/ReceivePayFile";
import ProjectUnitHistory from "../Pages/Master/ProjectUnitHistory";
import AttendanceRegularizeHistory from "../Pages/AssociateAttendancePart.js/AttendanceRegularizeHistory";
import ODHistory from "../Pages/AssociateAttendancePart.js/ODHistory";
import ApplyAttendanceRegular from "../Pages/AssociateAttendancePart.js/ApplyAttendanceRegular";
import ApplyOD from "../Pages/AssociateAttendancePart.js/ApplyOD";
import VisitorHistory from "../Pages/Visitors/VisitorHistory";
import VisitorEntryScreen from "../Pages/Visitors/VisitorEntryScreen";
import CreateEvent from "../Pages/Events/CreateEvent";
import EventEntryScreen from "../Pages/Events/EventEntryScreen";
import EnquiryHistory from "../Pages/Enquiry/EnquiryHistory";
import EnquiryReplyScreen from "../Pages/Enquiry/EnquiryReplyScreen";
import PopupScreen from "../Pages/PopUp/PopupScreen";
import TurnoverReport from "../Pages/Reports/TurnoverReport";
import BuilderWiseReport from "../Pages/Reports/BuilderWiseReport";
import OldOtpDetails from "../Pages/OTP/OldOtpDetails";
import DefaulterReport from "../Pages/Reports/DefaulterReport";
import SubTeamWiseProspectsReport from "../Pages/Reports/SubTeamWiseProspectsReport";
import ProspectMeetingDetails from "../Pages/Reports/ProspectMeetingDetails";
import FreshBooking from "../Pages/Transaction/FreshBooking";
import FreshBookingEntry from "../Pages/Transaction/FreshBookingEntry";
import MonthlyTeamAttendance from "../Pages/AssociateAttendancePart.js/MonthlyTeamAttendance";
import DailyTeamAttendance from "../Pages/AssociateAttendancePart.js/DailyTeamAttendance";
import KycTeamScreen from "../Pages/KYC/KycTeamScreen";
import UpdateKycTeamScreen from "../Pages/KYC/UpdateKycTeamScreen";
import SaleMasterReport from "../Pages/Reports/SaleMasterReport";
import PaymentPlanMasterReport from "../Pages/Reports/PaymentPlanMasterReport";
import VisitorManagementReport from "../Pages/Reports/VisitorManagementReport";
import ProjectWiseReport from "../Pages/Reports/ProjectWiseReport";
// import VerificationScreen from "../Pages/Verification/VerificationScreen";
import AppImage from "../Pages/AppIcons/AppImage";
import AppIcons from "../Pages/AppIcons/AppIcons";
import MOMScreen from "../Pages/MOM/MOMScreen";
import MOMAddScreen from "../Pages/MOM/MOMAddScreen";
import CustomerCareScreen from "../Pages/CustomerCare/CustomerCareScreen";
import CustomerCareAddScreen from "../Pages/CustomerCare/CustomerCareAddScreen";
import EventHistory from "../Pages/Events/EventHistory";
import ConnectEnrollment from "../Pages/MTConnect/ConnectEnrollment";
import ConnectPlanList from "../Pages/MTConnect/ConnectPlanList";
import ConnectPlanAddUpdate from "../Pages/MTConnect/ConnectPlanAddUpdate";
import ConnectTicker from "../Pages/MTConnect/ConnectTicker";
import ConnectPopUp from "../Pages/MTConnect/ConnectPopUp";
import ConnectNotification from "../Pages/MTConnect/ConnectNotification";
import ConnectAssociateInfo from "../Pages/MTConnect/ConnectAssociateInfo";
import ConnectAssociateLeadInfo from "../Pages/MTConnect/ConnectAssociateLeadInfo";
import ConnectAllEnrollmentLeads from "../Pages/MTConnect/ConnectAllEnrollmentLeads";
import ConnectRmChange from "../Pages/MTConnect/ConnectRmChange";
import AddEnquiry from "../Pages/Enquiry/AddEnquiry";
import ConnectOtpList from "../Pages/MTConnect/ConnectOtpList";
import ConnectSupportData from "../Pages/MTConnect/ConnectSupportData";
import ConnectViewComplaint from "../Pages/MTConnect/ConnectViewComplaint";
import DemandFormReport from "../Pages/Reports/DemandFormReport";
import BookingStatusReport from "../Pages/Reports/BookingStatusReport";
import ConnectTestimonial from "../Pages/MTConnect/ConnectTestimonial";
import ConnectInvoice from "../Pages/MTConnect/ConnectInvoice";
import ConnectEvents from "../Pages/MTConnect/ConnectEvents";
import ConnectProjectGuide from "../Pages/MTConnect/ConnectProjectGuide";
import ConnectKyc from "../Pages/MTConnect/ConnectKyc";
import BmProspectScreen from "../Pages/BMMenu/BmProspectScreen";
import BmSuspectScreen from "../Pages/BMMenu/BmSuspectScreen";
import BmMeetingScreen from "../Pages/BMMenu/BmMeetingScreen";
import BmAttendanceScreen from "../Pages/BMMenu/BmAttendanceScreen";
import ConnectLocationMaster from "../Pages/MTConnect/ConnectLocationMaster";
import MTRSCalling from "../Pages/KYC/MTRSCalling";
import ConnectPayout from "../Pages/MTConnect/ConnectPayout";
import TransferSuspects from "../Pages/AssociateSection/TransferSuspects";
import ProspectListCount from "../Pages/AssociateSection/ProspectListCount";
import SuspectListCount from "../Pages/AssociateSection/SuspectListCount";
import HoldProjectUnitDetails from "../Pages/AssociateSection/HoldProjectUnitDetails";
import MyAttendance from "../Pages/AssociateAttendancePart.js/MyAttendance";
import AttendanceLocationMaster from "../Pages/Master/AttendanceLocationMaster";
import UploadNoc from "../Pages/MTRS/UploadNoc";
import UploadBBA from "../Pages/MTRS/UploadBBA";
import MtrsStatus from "../Pages/MTRS/MtrsStatus";
import UploadLeadData from "../Pages/UploadData/UploadLeadData";
import MtrsFiles from "../Pages/MTRS/MtrsFiles";
import AllAdsScreen from "../Pages/Meta/AllAdsScreen";
import InsightsScreen from "../Pages/Meta/InsightsScreen";
import AdDetailsScreen from "../Pages/Meta/AdDetailsScreen";
import LeadFormScreen from "../Pages/Meta/LeadFormScreen";
import AllLeadsResponse from "../Pages/Meta/AllLeadsResponse";
import MainTeamWiseProspectsReport from "../Pages/Reports/MainTeamWiseProspectsReport";
import MainTeamWiseMeetingReport from "../Pages/Reports/MainTeamWiseMeetingReport";
import SubTeamWiseMeetingReport from "../Pages/Reports/SubTeamWiseMeetingReport";
import AssociateProspectReport from "../Pages/Reports/AssociateProspectReport";
import AssociateMeetingReport from "../Pages/Reports/AssociateMeetingReport";
import MeetingTargetReport from "../Pages/Reports/MeetingTargetReport";
import MeetingTargetEntry from "../Pages/Reports/MeetingTargetEntry";
import CreateProjectUnitMasterNew from "../Pages/Master/CreateProjectUnitMasterNew";
import ConnectOccupationMaster from "../Pages/MTConnect/ConnectOccupationMaster";
import KycReport from "../Pages/Reports/KycReport";
import BirthdayPopUp from "../Pages/PopUp/BirthdayPopUp";
import MetaAdminAdsScreen from "../Pages/Meta/MetaAdminAdsScreen";
import MetaAssociateLeadScreen from "../Pages/Meta/MetaAssociateLeadScreen";
import ViewLeadsDetails from "../Pages/Meta/ViewLeadsDetails";
import FinanceSaleUpdate from "../Pages/ReportsFinance/FinanceSaleUpdate";
import BuilderWiseTurnover from "../Pages/ReportsFinance/BuilderWiseTurnover";
import BuilderWiseBooking from "../Pages/ReportsFinance/BuilderWiseBooking";
import TeamWiseBooking from "../Pages/ReportsFinance/TeamWiseBooking";
import TempBookingReport from "../Pages/ReportsOps/TempBookingReport";
import ViewAssignedAssociate from "../Pages/Meta/ViewAssignedAssociate";
import ConnectListDetails from "../Pages/Dashboard/ConnectListDetails";
import MainTeamWiseData from "../Pages/ReportsOps/MainTeamWiseData";
import BuilderWiseOpsReport from "../Pages/ReportsOps/BuilderWiseOpsReport";
import ProjectWiseOpsReport from "../Pages/ReportsOps/ProjectWiseOpsReport";
import DailyBookingOpsReport from "../Pages/ReportsOps/DailyBookingOpsReport";
import DailyDispatchOpsReport from "../Pages/ReportsOps/DailyDispatchOpsReport";
import DailyTempOpsReport from "../Pages/ReportsOps/DailyTempOpsReport";
import GoogleLeads from "../Pages/GoogleMenu/GoogleLeads";
import GoogleAssignedLeads from "../Pages/GoogleMenu/GoogleAssignedLeads";
import AllGoogleLeads from "../Pages/GoogleMenu/AllGoogleLeads";
import HrRecruiterForm from "../Pages/HrModule/HrRecruiterForm";
import CandidateInfoForm from "../Pages/HrModule/CandidateInfoForm";
import Level from "../Pages/Master/Level";
import Designation from "../Pages/Master/Designation";
import GoogleProjectsList from "../Pages/GoogleMenu/GoogleProjectsList";
import TradingWindowData from "../Pages/Reports/TradingWindowData";
import TuesdayReport from "../Pages/Reports/TuesdayReport";
import LeaveHistory from "../Pages/Reports/LeaveHistory";
import CreateProjectUnitMasterUpdated from "../Pages/Master/CreateProjectUnitMasterUpdated";
import CalenderMaster from "../Pages/Master/CalenderMaster";
import DNDHistory from "../Pages/AdminAssociateSetion/DNDHistory";
import HrRecruiterHistory from "../Pages/HrModule/HrRecruiterHistory";
import HrCandidateHistory from "../Pages/HrModule/HrCandidateHistory";
import MainTeamAttendance from "../Pages/AssociateAttendancePart.js/MainTeamAttendance";
import HandoverCandidateHistory from "../Pages/HrModule/HandoverCandidateHistory";
import CandidateDocuments from "../Pages/HrModule/CandidateDocuments";
import AllCandidateHistory from "../Pages/HrModule/AllCandidateHistory";
import CandidateDocs from "../Pages/HrModule/CandidateDocs";
import CandidateDocsDetails from "../Pages/HrModule/CandidateDocsDetails";
import BranchWiseAttendance from "../Pages/AssociateAttendancePart.js/BranchWiseAttendance";
import LocationMaster from "../Pages/HrModule/LocationMaster";
import EventMeetingDetails from "../Pages/Events/EventMeetingDetails";
import DemandAmountForm from "../Pages/ReportsFinance/DemandAmountForm";
import DemandDateForm from "../Pages/ReportsFinance/DemandDateForm";
import ClientInside from "../Pages/Visitors/ClientInside";
import MainTLDemandScreen from "../Pages/AssociateSection/MainTLDemandScreen";
import BranchWiseMeeting from "../Pages/Reports/BranchWiseMeeting";
import VisitorHrDetails from "../Pages/HrModule/VisitorHrDetails";
import HrCallReport from "../Pages/HrModule/HrCallReport";
import HrInterviewDetailsReport from "../Pages/HrModule/HrInterviewDetailsReport";
import HrMainTeamReport from "../Pages/HrModule/HrMainTeamReport";
import OnlineLeadAdminScreen from "../Pages/Meta/OnlineLeadAdminScreen";
import AESDemo from "../components/Common/CryptoDemo";
import NewEnquiry from "../Pages/Enquiry/NewEnquiry";
import NewEnquiryHistory from "../Pages/Enquiry/NewEnquiryHistory";
import JoiningResignedReport from "../Pages/HrModule/JoiningResignedReport";
import MobileAttendance from "../Pages/AssociateAttendancePart.js/MobileAttendance";
import MeetingDetails from "../Pages/AssociateSection/MeetingDetails";
import ProspectListMenu from "../Pages/AssociateSection/ProspectListMenu";
import AddProspectList from "../Pages/AssociateSection/AddProspectList";
import TransferProspects from "../Pages/AssociateSection/TransferProspects";
import BranchStrength from "../Pages/HrModule/BranchStrength";
import LeadReport from "../Pages/AdminAssociateSetion/LeadReport";
import IvrAgentList from "../Pages/IvrMenu/IvrAgentList";
import AddUpdateAgent from "../Pages/IvrMenu/AddUpdateAgent";
import LocationTrack from "../Pages/AdminAssociateSetion/LocationTrack";
import SalesTargetLocation from "../Pages/Master/SalesTargetLocation";
import IvrRecording from "../Pages/IvrMenu/IvrRecording";
import SalesTarget from "../Pages/Reports/SalesTarget";
import SalesTargetDetails from "../Pages/Reports/SalesTargetDetails";
import EntrySalesTarget from "../Pages/Reports/EntrySalesTarget";
import PullBackSuspect from "../Pages/AdminAssociateSetion/PullBackSuspect";
import BmMeetingsNotEnded from "../Pages/BMMenu/BmMeetingsNotEnded";
import BDAmount from "../Pages/Transaction/BDAmount";
import HrJoiningList from "../Pages/HrModule/HrJoiningList";
import HrDataTransfer from "../Pages/HrModule/HrDataTransfer";
import AllUsersPerformanceReport from "../Pages/AdminAssociateSetion/AllUsersPerformanceReport";
import LeadUploadFeedback from "../Pages/UploadData/LeadUploadFeedback";
import MyTasks from "../Pages/MyTasks/MyTasks";
import UpdateProsMobile from "../Pages/AdminAssociateSetion/UpdateProsMobile";
import MarkDNDAdmin from "../Pages/AdminAssociateSetion/MarkDNDAdmin";
import PolicyCreation from "../Pages/Policy/PolicyCreation";
import ShowPolicy from "../Pages/Policy/ShowPolicy";
import Puzzle from "../Pages/Games/Puzzle";
import TicTacToe from "../Pages/Games/TicTacToe";
import FocusProjectMaster from "../Pages/FocusProject/FocusProjectMaster";
import FocusProjectView from "../Pages/FocusProject/FocusProjectView";
import GalleryScreen from "../Pages/Activity/GalleryScreen";
import MarketingScreen from "../Pages/Activity/MarketingScreen";
import WhatsAppMessages from "../Pages/Activity/WhatsAppMessages";
import BBAValueManage from "../Pages/Transaction/BBAValueManage";
import EmployeeMaster from "../Pages/UserManagement/EmployeeMaster";
import CreatePayment from "../Pages/Transaction/CreatePayment";
import UpdatePayment from "../Pages/Transaction/UpdatePayment";
import MainSupport from "../Pages/Support/MainSupport";
import HandoverCandidate from "../Pages/HrModule/HandoverCandidate";
import PostProperty from "../Pages/Activity/PostProperty";
import AwardMaster from "../Pages/Activity/AwardMaster";
import HRScreen from "../Pages/FNF/HRScreen";
import ITScreen from "../Pages/FNF/ITScreen";
import AdminScreen from "../Pages/FNF/AdminScreen";
import AccountsScreen from "../Pages/FNF/AccountsScreen";
import OpsScreen from "../Pages/FNF/OpsScreen";
import HODScreen from "../Pages/FNF/HODScreen";
import FnFListScreen from "../Pages/FNF/FnFListScreen";
import KYTScreen from "../Pages/AssociateSection/KYTScreen";
import UploadCVScreen from "../Pages/HrModule/UploadCVScreen";
import GetSocialMediaResume from "../Pages/HrModule/GetSocialMediaResume";
import LetterHeadAdminScreen from "../Pages/Activity/LetterHeadAdminScreen";
import LetterHeadScreen from "../Pages/Activity/LetterHeadScreen";
import RewardPointsScreen from "../Pages/Activity/RewardPointsScreen";
import FinanceHrDocs from "../Pages/HrModule/FinanceHrDocs";
import SalesDuePaymentReport from "../Pages/ReportsFinance/SalesDuePaymentReport";
import ProjectLaunchMaster from "../Pages/Activity/ProjectLaunchMaster";
import ProjectLaunchScreen from "../Pages/Activity/ProjectLaunchScreen";
import AcknowledgementScreen from "../Pages/Transaction/AcknowledgementScreen";
import DomainsMaster from "../Pages/Master/DomainsMaster";
import MOUMaster from "../Pages/Master/MOUMaster";
import MOUScreen from "../Pages/Master/MOUScreen";
import AdminAssetManagement from "../Pages/UserManagement/AdminAssetManagement";
import QuestionAnswerMaster from "../Pages/AdminAssociateSetion/QuestionAnswerMaster";
import MeetingFeedbackScreen from "../Pages/KYC/MeetingFeedbackScreen";
import MapsMaster from "../Pages/Master/MapsMaster";
import PersonalBirthdayDetails from "../Pages/AdminAssociateSetion/PersonalBirthdayDetails";
import HrDetailsReport from "../Pages/HrModule/HrDetailsReport";
import ProjectRegistrationData from "../Pages/Activity/ProjectRegistrationData";
import BuilderRMDetailsData from "../Pages/Activity/BuilderRMDetailsData";
import SocialMediaData from "../Pages/Activity/SocialMediaData";
import DIYCalculator from "../Pages/Activity/DIYCalculator";
import FreshBookingLevel1 from "../Pages/Transaction/FreshBookingLevel1";
import FreshBookingLevel2 from "../Pages/Transaction/FreshBookingLevel2";
import FreshBookingLevel3 from "../Pages/Transaction/FreshBookingLevel3";
import FreshBookingEntryLevel2 from "../Pages/Transaction/FreshBookingEntryLevel2";
import FreshBookingEntryLevel3 from "../Pages/Transaction/FreshBookingEntryLevel3";
import FreshBookingEntryLevel1 from "../Pages/Transaction/FreshBookingEntryLevel1";
import MediagetscreenProject from "../Pages/Activity/MediagetscreenProject";
import OpsgetscreenProject from "../Pages/Activity/OpsgetscreenProject";
import FinancegetscreenProject from "../Pages/Activity/FinancegetscreenProject";
import SalesgetscreenProject from "../Pages/Activity/SalesgetscreenProject";
import BDTarget from "../Pages/Activity/BDTarget";
import ThinkIt from "../Pages/Activity/ThinkIt";
import ThinkItSales from "../Pages/Activity/ThinkItSales";
import InsuranceNomineeDetails from "../Pages/Activity/InsuranceNomineeDetails";
import PPCLeads from "../Pages/Activity/PPCLeads";
import AddPPCLeads from "../Pages/Activity/AddPPCLeads";
import InsuranceCardScreen from "../Pages/Activity/InsuranceCardScreen";
import MTAIScreen from "../Pages/Activity/MTAIScreen";
import SchemeMaster from "../Pages/Master/SchemeMaster";
import ChatGroup from "../Pages/Activity/ChatGroup";
import BranchMaster from "../Pages/Master/BranchMaster";
import VBAbReport from "../Pages/ReportsFinance/VBAbReport";
import VbAbReportBD from "../Pages/ReportsFinance/VbAbReportBD";
import BranchOverview from "../Pages/Activity/BranchOverview";
import GoogleSheetLeads from "../Pages/AssociateSection/GoogleSheetLeads";
import RecruitmentFeedback from "../Pages/HrModule/RecruitmentFeedback";
import ChangeRequestUser from "../Pages/ChangeRequest/Changerequestuser";
import ChangeRequestIT from "../Pages/ChangeRequest/Changerequestit";
import ChangeRequestRM from "../Pages/ChangeRequest/Changerequestrm";
import FreshBookingInactive from "../Pages/Transaction/FreshBookingInactive";
import P100File from "../Pages/AssociateSection/P100File";
import P100TeamLeadsViewer from "../Pages/AssociateSection/P100TeamLeadsViewer";
import P100Report from "../Pages/AssociateSection/P100report";
import TransferP100Leads from "../Pages/AssociateSection/Transferp100leads";
import FavouriteProspects from "../Pages/AssociateSection/FavouriteProspects";
import MTPayScheme from "../Pages/Activity/MTPayScheme";
import UploadSaleMaster from "../Pages/UploadData/UploadSaleMaster";
import MTPaySchemeBooking from "../Pages/Activity/MTPaySchemeBooking";
import MTPAYSalesScreen from "../Pages/Activity/MTPAYSalesScreen";
import FloatingChatWidgetRights from "../Pages/Activity/FloatingChatWidgetRights";
import CandidateHistory from "../Pages/HrModule/CandidateHistory";
import BookingDocuments from "../Pages/Transaction/BookingDocuments";
import UploadBookingDocs from "../Pages/Transaction/Uploadbookingdocs";

// Lazy loading componentsfAss
const Dashboard = lazy(() => import("../Pages/Dashboard"));

// Authentication pages
const Login = lazy(() => import("../Pages/Authentication/Login"));
const ForgetPasswordPage = lazy(() =>
  import("../Pages/Authentication/ForgetPassword")
);
const UserProfile = lazy(() => import("../Pages/Authentication/user-profile"));

// Utility Pages
const StarterPage = lazy(() => import("../Pages/Utility/Starter-Page"));
const Maintenance = lazy(() => import("../Pages/Utility/Maintenance-Page"));
const ComingSoon = lazy(() => import("../Pages/Utility/ComingSoon-Page"));
const FAQs = lazy(() => import("../Pages/Utility/FAQs-Page"));
const Pricing = lazy(() => import("../Pages/Utility/Pricing-Page"));
const Error404 = lazy(() => import("../Pages/Utility/Error404-Page"));
const Error500 = lazy(() => import("../Pages/Utility/Error500-Page"));

const UserRights = lazy(() => import("../Pages/UserManagement/UserRights"));
const UserList = lazy(() => import("../Pages/UserManagement/UserList"));
const AddEditUser = lazy(() => import("../Pages/UserManagement/AddEditUser"));
const ChangePassword = lazy(() => import("../Pages/UserManagement/ChangePassword"));

const Department = lazy(() => import("../Pages/Master/Department"));
const Builder = lazy(() => import("../Pages/Master/Builder"));
const BuilderProject = lazy(() => import("../Pages/Master/BuilderProject"));
const PaymentPlanMaster = lazy(() =>
  import("../Pages/Master/PaymentPlanMaster")
);
const ProjectUnitMaster = lazy(() =>
  import("../Pages/Master/ProjectUnitMaster")
);
const ProjectTypeMaster = lazy(() =>
  import("../Pages/Master/ProjectTypeMaster")
);
const ProspectList = lazy(() => import("../Pages/Dashboard/ProspectsList"));
const SalesEntryNew = lazy(() => import("../Pages/Transaction/SalesEntryNew"));
const CreateEditSalesEntry = lazy(() =>
  import("../Pages/Transaction/CreateEditSalesEntry")
);
const FileUpload = lazy(() => import("../Pages/Transaction/FileUpload"));
const UserLoginLog = lazy(() => import("../Pages/UserManagement/UserLoginLog"));
const OtpDetails = lazy(() => import("../Pages/OTP/OtpDetails"));
const NotificationScreen = lazy(() =>
  import("../Pages/Notifications/NotificationScreen")
);
const NotificationViewScreen = lazy(() =>
  import("../Pages/Notifications/NotificationViewScreen")
);

const AddTickerData = lazy(() => import("../Pages/Activity/AddTickerData"));
const ReceivePayDetails = lazy(() =>
  import("../Pages/Transaction/ReceivePayDetails")
);
const RevenueForSale = lazy(() =>
  import("../Pages/Transaction/RevenueForSale")
);
const ProjectDocumentation = lazy(() =>
  import("../Pages/Project Documentation/ProjectDocumentation")
);
const UploadProspectsData = lazy(() =>
  import("../Pages/UploadData/UploadProspectsData")
);
const UploadMeetingData = lazy(() =>
  import("../Pages/UploadData/UploadMeetingData")
);
const UploadUserData = lazy(() => import("../Pages/UploadData/UploadUserData"));
const UploadSbiFiles = lazy(() => import("../Pages/UploadData/UploadSbiFiles"));
const UploadUnitMaster = lazy(() =>
  import("../Pages/UploadData/UploadUnitMaster")
);
const MeetingReports = lazy(() => import("../Pages/OldReports/MeetingReports"));
const SalesReports = lazy(() => import("../Pages/OldReports/SalesReports"));
const MeetingDashboard = lazy(() =>
  import("../Pages/OldReports/MeetingDashboard")
);
const ReceiveReport = lazy(() => import("../Pages/OldReports/ReceiveReport"));
const AddReceiveReport = lazy(() =>
  import("../Pages/OldReports/AddReceiveReport")
);
const SaleRegisterData = lazy(() =>
  import("../Pages/OldReports/SalesRegisterData")
);
const LedgerReport = lazy(() => import("../Pages/OldReports/LedgerReport"));
const EndMeetingOTPScreen = lazy(() =>
  import("../Pages/AssociateSection/EndMeetingOTPScreen")
);
const AssociateMeeting = lazy(() =>
  import("../Pages/AssociateSection/AssociateMeeting")
);
const MeetingListCount = lazy(() =>
  import("../Pages/AssociateSection/MeetingListCount")
);
const ProspectBulkUpdate = lazy(() =>
  import("../Pages/AssociateSection/ProspectBulkUpdate")
);
const UploadSbiProof = lazy(() =>
  import("../Pages/AssociateSection/UploadSbiProof")
);
const OpenProjectUnitDetails = lazy(() =>
  import("../Pages/AssociateSection/OpenProjectUnitDetails")
);
const CancelMeeting = lazy(() => import("../Pages/AssociateSection/CancelMeeting"));
const ProspectsForMeeting = lazy(() =>
  import("../Pages/Dashboard/ProspectsForMeeting")
);
const EndCancelMeeting = lazy(() =>
  import("../Pages/AssociateSection/EndCancelMeeting")
);
const SuspectData = lazy(() => import("../Pages/AssociateSection/SuspectData"));
const AssociateDashboard = lazy(() =>
  import("../Pages/AssociateSection/AssociateDashboard")
);
const SuppportData = lazy(() => import("../Pages/Support/SupportData"));
const CreateProjectUnitMaster = lazy(() =>
  import("../Pages/Master/CreateProjectUnitMaster")
);
const AssociateRevenue = lazy(() =>
  import("../Pages/AdminAssociateSetion/AssociateRevenue")
);
const MainTeam = lazy(() => import("../Pages/Team/MainTeam"));
const SubTeam = lazy(() => import("../Pages/Team/SubTeam"));
const RevenueForm = lazy(() =>
  import("../Pages/AdminAssociateSetion/RevenueForm")
);

const authProtectedRoutes = [
  //dashboard
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/prospect-list", component: <ProspectList /> },

  //Encrypt Decrypt
  { path: "/encrypt-test", component: <AESDemo /> },

  //Associate Section
  { path: "/associate-dashboard", component: <AssociateDashboard /> },
  { path: "/end-meeting-otp", component: <EndMeetingOTPScreen /> },
  { path: "/prospect-for-meeting", component: <ProspectsForMeeting /> },
  { path: "/end-cancel-meeting", component: <EndCancelMeeting /> },
  { path: "/associate-meeting-details", component: <AssociateMeeting /> },
  { path: "/meeting-list-count", component: <MeetingListCount />, },
  { path: "/connect-list-details", component: <ConnectListDetails />, },
  { path: "/prospect-bulk-update", component: <ProspectBulkUpdate /> },
  { path: "/upload-sbi-proof", component: <UploadSbiProof /> },
  { path: "/open-project-unit-details", component: <OpenProjectUnitDetails /> },
  { path: "/hold-project-unit-details", component: <HoldProjectUnitDetails /> },
  { path: "/prospect-list-count", component: <ProspectListCount /> },
  { path: "/suspect-list-count", component: <SuspectListCount /> },
  { path: "/meeting-details", component: <MeetingDetails /> },
  { path: "/cancel-meeting", component: <CancelMeeting /> },
  { path: "/suspect-data", component: <SuspectData /> },
  { path: "/prospect-list-menu", component: <ProspectListMenu /> },
  { path: "/prospect-list-menu/add-prospect-list", component: <AddProspectList />, },
  { path: "/associate-revenue-associate", component: <AssociateRevenueAssociate />, },
  { path: "/associate-revenue-associate/add-revenue-associate", component: <RevenueFormAssociate />, },
  { path: "/live-support", component: <MainSupport />, },
  { path: "/view-demand-data", component: <MainTLDemandScreen />, },
  { path: "/my-favourite", component: <FavouriteProspects />, },

  //Enquiry
  { path: "/enquiry-history", component: <EnquiryHistory /> },
  { path: "/add-enquiry", component: <AddEnquiry /> },
  { path: "/enquiry-reply", component: <EnquiryReplyScreen />, },
  { path: "/new-enquiry", component: <NewEnquiry /> },
  { path: "/history-new-enquiry", component: <NewEnquiryHistory /> },

  //Attendance Part
  { path: "/my-attendance", component: <MyAttendance /> },
  { path: "/monthly-team-attendance", component: <MonthlyTeamAttendance /> },
  { path: "/daily-team-attendance", component: <DailyTeamAttendance /> },
  { path: "/apply-attendance-regularization", component: <ApplyAttendanceRegular />, },
  { path: "/apply-od", component: <ApplyOD />, },
  { path: "/regularization-history", component: <AttendanceRegularizeHistory />, },
  { path: "/od-history", component: <ODHistory /> },
  { path: "/view-team-attendance", component: <MainTeamAttendance /> },
  { path: "/branch-wise-attendance", component: <BranchWiseAttendance /> },

  //User Management
  { path: "/user-menu-map", component: <UserRights /> },
  { path: "/users-list", component: <UserList /> },
  { path: "/user-master", component: <EmployeeMaster /> },
  { path: "/users-list/add-edit-user", component: <AddEditUser /> },
  { path: "/change-password", component: <ChangePassword /> },
  { path: "/password-change", component: <PasswordChange /> },
  { path: "/user-login-log", component: <UserLoginLog /> },
  { path: "/asset-management", component: <AdminAssetManagement /> },

  //OTP
  { path: "/otp-details", component: <OtpDetails /> },
  { path: "/old-otp-details", component: <OldOtpDetails /> },

  // Master
  { path: "/department", component: <Department /> },
  { path: "/level", component: <Level /> },
  { path: "/scheme-master", component: <SchemeMaster /> },
  { path: "/designation", component: <Designation /> },
  { path: "/branch-master", component: <BranchMaster /> },
  { path: "/builder", component: <Builder /> },
  { path: "/project-builder", component: <BuilderProject /> },
  { path: "/payment-plan-master", component: <PaymentPlanMaster /> },
  { path: "/project-unit-master", component: <ProjectUnitMaster /> },
  { path: "/attendance-location-master", component: <AttendanceLocationMaster /> },
  { path: "/project-unit-master/add-project-unit-master", component: <CreateProjectUnitMaster />, },
  { path: "/project-unit-master/add-project-unit-master-new", component: <CreateProjectUnitMasterNew />, },
  { path: "/project-unit-master/add-project-unit-master-updated", component: <CreateProjectUnitMasterUpdated />, },
  { path: "/project-unit-master/project-unit-history", component: <ProjectUnitHistory />, },
  { path: "/project-type-master", component: <ProjectTypeMaster /> },
  { path: "/calender-master", component: <CalenderMaster /> },
  { path: "/sales-target-location", component: <SalesTargetLocation /> },
  { path: "/domains-master", component: <DomainsMaster /> },
  { path: "/mou-master", component: <MOUMaster /> },
  { path: "/mou-screen", component: <MOUScreen /> },

  //Vistors
  { path: "/visitor-history", component: <VisitorHistory /> },
  { path: "/visitor-entry", component: <VisitorEntryScreen /> },
  { path: "/client-inside-history", component: <ClientInside /> },

  //Events
  { path: "/create-event", component: <CreateEvent /> },
  { path: "/event-entry", component: <EventEntryScreen /> },
  { path: "/event-history", component: <EventHistory /> },
  { path: "/event-meeting-details", component: <EventMeetingDetails /> },

  //Branch Overview
  { path: "/branch-overview", component: <BranchOverview /> },

  //Transaction
  { path: "/sales-entry-new", component: <SalesEntryNew /> },
  { path: "/sales-entry-new/create-edit-sales-entry", component: <CreateEditSalesEntry />, },
  { path: "/fresh-booking", component: <FreshBooking /> },
  { path: "/fresh-booking/fresh-booking-entry", component: <FreshBookingEntry />, },
  { path: "/sales-entry-new/file-upload", component: <FileUpload /> },
  { path: "/receive-pay-details/receive-pay-file", component: <ReceivePayFile />, },
  { path: "/receive-pay-details/receive-pay", component: <UpdatePayment /> },
  { path: "/sales-entry-new/receive-pay-sale", component: <CreatePayment /> },
  { path: "/receive-pay-details", component: <ReceivePayDetails /> },
  { path: "/revenue-for-sales", component: <RevenueForSale /> },
  { path: "/revenue-for-sales/manage-revenue-for-sales", component: <ManageRevenueSale />, },
  // { path: "/cancel-sales", component: <CancelSales /> },
  { path: "/bd-amount", component: <BDAmount /> },
  { path: "/bba-value-manage", component: <BBAValueManage /> },
  { path: "/acknowledgement-screen", component: <AcknowledgementScreen /> },

  { path: "/first-level-fresh-booking", component: <FreshBookingLevel1 /> },
  { path: "/first-level-fresh-booking/first-level-entry", component: <FreshBookingEntryLevel1 /> },
  { path: "/second-level-fresh-booking", component: <FreshBookingLevel2 /> },
  { path: "/second-level-fresh-booking/second-level-entry", component: <FreshBookingEntryLevel2 /> },
  { path: "/third-level-fresh-booking", component: <FreshBookingLevel3 /> },
  { path: "/third-level-fresh-booking/third-level-entry", component: <FreshBookingEntryLevel3 /> },
  { path: "/inactive-fresh-booking", component: <FreshBookingInactive /> },

  //Booking Docs
  { path: "/booking-docs", component: <BookingDocuments /> },
  { path: "/upload-booking-docs", component: <UploadBookingDocs /> },

  //KYC
  { path: "/kyc-team", component: <KycTeamScreen /> },
  { path: "/kyc-team/update-kyc-team", component: <UpdateKycTeamScreen />, },
  // { path: "/ops-kyc", component: <OpsKycScreen /> },
  // { path: "/ops-kyc/update-ops-kyc", component: <UpdateOpsKycScreen />, },
  // { path: "/accounts-kyc", component: <FinanceKycScreen /> },
  // { path: "/back-office-kyc", component: <BackOfficeKycScreen /> },
  // { path: "/accounts-kyc/update-accounts-kyc", component: <UpdateFinanceKycScreen /> },
  { path: "/mtrs-calling", component: <MTRSCalling /> },
  { path: "/meeting-feedback", component: <MeetingFeedbackScreen /> },

  //P100
  { path: "/p-100-leads", component: <P100File /> },
  { path: "/report-p-100", component: <P100TeamLeadsViewer /> },
  { path: "/p-100-report", component: <P100Report /> },
  { path: "/transfer-p-100-leads", component: <TransferP100Leads /> },

  //MTRS Docs
  { path: "/upload-noc", component: <UploadNoc /> },
  { path: "/upload-bba", component: <UploadBBA /> },
  { path: "/mtrs-status", component: <MtrsStatus /> },
  { path: "/mtrs-files", component: <MtrsFiles /> },

  // App Icons
  { path: "/app-banner", component: <AppImage /> },
  { path: "/app-icons", component: <AppIcons /> },

  //MOM
  { path: "/mom-screen", component: <MOMScreen /> },
  { path: "/mom-screen/mom-add-screen", component: <MOMAddScreen /> },

  //Customer Care
  { path: "/customer-care-screen", component: <CustomerCareScreen /> },
  { path: "/customer-care-screen/customer-care-add-screen", component: <CustomerCareAddScreen /> },

  //DIY Calculator
  { path: "/diy-calculator-menu", component: <DIYCalculator /> },

  //Upload Data
  { path: "/upload-prospects-data", component: <UploadProspectsData /> },
  { path: "/upload-meeting-data", component: <UploadMeetingData /> },
  { path: "/upload-user-data", component: <UploadUserData /> },
  { path: "/upload-sbi-files", component: <UploadSbiFiles /> },
  { path: "/trasfer-prospect-data", component: <TransferProspects /> },
  { path: "/upload-lead-data", component: <UploadLeadData /> },
  { path: "/lead-transfer", component: <TransferSuspects /> },
  { path: "/upload-unit-master", component: <UploadUnitMaster /> },
  { path: "/lead-upload-feedback", component: <LeadUploadFeedback /> },

  { path: "/upload-sale-master", component: <UploadSaleMaster /> },

  //Wedenesday Scheme
  { path: "/mt-pay-scheme", component: <MTPayScheme /> },
  { path: "/booking-mt-pay-scheme", component: <MTPaySchemeBooking /> },
  { path: "/sales-mt-pay-scheme", component: <MTPAYSalesScreen /> },

  //VerificationScreen
  // { path: "/verification", component: <VerificationScreen /> },

  // FloatingChatWidgetRights
  { path: "/floating-chat-widget-rights", component: <FloatingChatWidgetRights /> },


  // Reports
  { path: "/meeting-reports", component: <MeetingReports /> },
  { path: "/sales-reports", component: <SalesReports /> },
  { path: "/ledger-reports", component: <LedgerReport /> },
  { path: "/meeting-dashboard", component: <MeetingDashboard /> },
  { path: "/receive-report", component: <ReceiveReport /> },
  { path: "/add-receive-report", component: <AddReceiveReport /> },
  { path: "/sale-register-data", component: <SaleRegisterData /> },
  { path: "/turnover-report", component: <TurnoverReport /> },
  { path: "/report-builder-wise", component: <BuilderWiseReport /> },
  { path: "/report-project-wise", component: <ProjectWiseReport /> },
  { path: "/defaulter-report", component: <DefaulterReport /> },
  { path: "/report-sale-master", component: <SaleMasterReport /> },
  { path: "/report-payment-plan-master", component: <PaymentPlanMasterReport />, },
  { path: "/report-visitor-management", component: <VisitorManagementReport />, },
  { path: "/sales-target-report/sales-target-entry", component: <EntrySalesTarget /> },
  { path: "/sales-target-report/sales-target-report-new-details", component: <SalesTargetDetails /> },
  { path: "/sales-target-report", component: <SalesTarget /> },
  { path: "/meeting-target-report", component: <MeetingTargetReport /> },
  { path: "/meeting-target-report/meeting-target-entry", component: <MeetingTargetEntry /> },
  { path: "/prospect-meeting-details-report", component: <ProspectMeetingDetails />, },
  { path: "/demand-form-report", component: <DemandFormReport /> },
  { path: "/booking-status-report", component: <BookingStatusReport /> },
  { path: "/pros-report-mainteam", component: <MainTeamWiseProspectsReport /> },
  { path: "/pros-report-subteam", component: <SubTeamWiseProspectsReport /> },
  { path: "/meet-report-mainteam", component: <MainTeamWiseMeetingReport /> },
  { path: "/meet-report-subteam", component: <SubTeamWiseMeetingReport /> },
  { path: "/pros-report-associate", component: <AssociateProspectReport /> },
  { path: "/meet-report-associate", component: <AssociateMeetingReport /> },
  { path: "/meet-report-branch-wise", component: <BranchWiseMeeting /> },

  { path: "/kyc-report", component: <KycReport /> },
  { path: "/trading-window-report", component: <TradingWindowData /> },
  { path: "/tuesday-report", component: <TuesdayReport /> },
  { path: "/leave-history-report", component: <LeaveHistory /> },

  // FinanceReports
  { path: "/finance-sale-update", component: <FinanceSaleUpdate /> },
  { path: "/turnover-builder-wise", component: <BuilderWiseTurnover /> },
  { path: "/booking-builder-wise", component: <BuilderWiseBooking /> },
  { path: "/booking-team-wise", component: <TeamWiseBooking /> },
  { path: "/demand-form", component: <DemandAmountForm /> },
  { path: "/demand-date-form", component: <DemandDateForm /> },
  { path: "/vb-ab-report", component: <VBAbReport /> },
  { path: "/due-payment-report", component: <SalesDuePaymentReport /> },
  { path: "/bd-vb-ab-report", component: <VbAbReportBD /> },

  //OpsReports
  { path: "/temp-booking-report", component: <TempBookingReport /> },
  { path: "/data-main-team-wise", component: <MainTeamWiseData /> },
  { path: "/ops-report-builder-wise", component: <BuilderWiseOpsReport /> },
  { path: "/ops-report-project-wise", component: <ProjectWiseOpsReport /> },
  { path: "/ops-report-daily-booking", component: <DailyBookingOpsReport /> },
  { path: "/ops-report-daily-dispatch", component: <DailyDispatchOpsReport /> },
  { path: "/ops-report-daily-temp-booking", component: <DailyTempOpsReport /> },

  // Project Documentation
  { path: "/project-documentation", component: <ProjectDocumentation /> },

  // Admin Association Section
  { path: "/associate-revenue", component: <AssociateRevenue /> },
  { path: "/associate-revenue/add-revenue", component: <RevenueForm /> },
  { path: "/associate-meeting", component: <MeetingDashboardAdmin /> },
  { path: "/revenue-report-admin", component: <RevenueReportAdmin /> },
  { path: "/lead-feedback-list", component: <LeadFeedbackReport /> },
  { path: "/dnd-history", component: <DNDHistory /> },
  { path: "/mark-dnd-admin", component: <MarkDNDAdmin /> },
  { path: "/lead-report", component: <LeadReport /> },
  { path: "/track-location", component: <LocationTrack /> },
  { path: "/pull-back-suspect", component: <PullBackSuspect /> },
  { path: "/user-performance-report", component: <AllUsersPerformanceReport /> },
  { path: "/update-pros-mobile", component: <UpdateProsMobile /> },
  { path: "/Q&A-master", component: <QuestionAnswerMaster /> },
  { path: "/maps-master", component: <MapsMaster /> },
  { path: "/personal-birthday-details", component: <PersonalBirthdayDetails /> },

  //My Tasks
  { path: "/my-tasks", component: <MyTasks /> },

  //Policy Creation
  { path: "/policy-creation", component: <PolicyCreation /> },
  { path: "/view-policies", component: <ShowPolicy /> },

  //Focus Project
  { path: "/focus-project-master", component: <FocusProjectMaster /> },
  { path: "/view-focus-project", component: <FocusProjectView /> },

  //Games
  { path: "/slide-puzzle", component: <Puzzle /> },
  { path: "/tic-tac-toe", component: <TicTacToe /> },

  //Notification
  { path: "/notification", component: <NotificationScreen /> },
  { path: "/view-notification", component: <NotificationViewScreen /> },
  { path: "/ticker", component: <AddTickerData /> },

  //Support
  { path: "/support", component: <SuppportData /> },
  { path: "/support/view-complaint", component: <ViewComplaint /> },
  { path: "/chat-group", component: <ChatGroup /> },

  // Activity
  { path: "/gallery", component: <GalleryScreen /> },
  { path: "/upload-social-media-cv", component: <UploadCVScreen /> },
  { path: "/get-social-media-cv", component: <GetSocialMediaResume /> },
  { path: "/reward-master", component: <AwardMaster /> },
  { path: "/whatsapp-messages", component: <WhatsAppMessages /> },
  { path: "/attendance", component: <AttendanceScreen /> },
  { path: "/mobile-attendance", component: <MobileAttendance /> },
  { path: "/marketing", component: <MarketingScreen /> },
  { path: "/jobs", component: <JobsScreen /> },
  { path: "/post-property", component: <PostProperty /> },
  { path: "/project-launch-master", component: <ProjectLaunchMaster /> },
  { path: "/project-launch-screen", component: <ProjectLaunchScreen /> },
  { path: "/bd-target-screen", component: <BDTarget /> },
  { path: "/instant-meeting-screen", component: <ThinkIt /> },
  { path: "/think-it-data", component: <ThinkItSales /> },
  { path: "/insurance-card", component: <InsuranceCardScreen /> },
  { path: "/insurance-nominee-details", component: <InsuranceNomineeDetails /> },
  { path: "/ppc-leads", component: <PPCLeads /> },
  { path: "/add-ppc-leads", component: <AddPPCLeads /> },

  //Change Request
  { path: "/user-change-request", component: <ChangeRequestUser /> },
  { path: "/it-change-request", component: <ChangeRequestIT /> },
  { path: "/rm-change-request", component: <ChangeRequestRM /> },


  //Popup
  { path: "/popup-list", component: <PopupScreen /> },
  { path: "/birthday-popup", component: <BirthdayPopUp /> },

  // Team
  { path: "/main-team", component: <MainTeam /> },
  { path: "/sub-team", component: <SubTeam /> },

  // Profile
  { path: "/user-profile", component: <UserProfile /> },

  // Utility Pages
  { path: "/pages-starter", component: <StarterPage /> },
  { path: "/pages-faqs", component: <FAQs /> },
  { path: "/pages-pricing", component: <Pricing /> },
  { path: "/", exact: true, component: <Navigate to="/dashboard" />, },

  //MT Connect 
  { path: "/connect-enrollment", component: <ConnectEnrollment /> },
  { path: "/connect-plan-list", component: <ConnectPlanList /> },
  { path: "/connect-plan-list/connect-plan-add-update", component: <ConnectPlanAddUpdate /> },
  { path: "/connect-ticker", component: <ConnectTicker /> },
  { path: "/connect-pop-up", component: <ConnectPopUp /> },
  { path: "/connect-notifications", component: <ConnectNotification /> },
  { path: "/connect-events", component: <ConnectEvents /> },
  { path: "/connect-testimonial", component: <ConnectTestimonial /> },
  { path: "/connect-project-guide", component: <ConnectProjectGuide /> },
  { path: "/all-connect-enrollment-leads", component: <ConnectAllEnrollmentLeads /> },
  { path: "/connect-associate-info", component: <ConnectAssociateInfo /> },
  { path: "/connect-associate-info/connect-associate-lead-info", component: <ConnectAssociateLeadInfo /> },
  { path: "/connect-rm-change", component: <ConnectRmChange /> },
  { path: "/connect-otp-list", component: <ConnectOtpList /> },
  { path: "/connect-support", component: <ConnectSupportData /> },
  { path: "/connect-support/connect-view-complaint", component: <ConnectViewComplaint /> },
  { path: "/connect-invoice", component: <ConnectInvoice /> },
  { path: "/connect-kyc", component: <ConnectKyc /> },
  { path: "/connect-location-master", component: <ConnectLocationMaster /> },
  { path: "/connect-occupation-master", component: <ConnectOccupationMaster /> },
  { path: "/connect-payout", component: <ConnectPayout /> },

  //BM Screens
  { path: "/bm-prospect-screen", component: <BmProspectScreen /> },
  { path: "/bm-suspect-screen", component: <BmSuspectScreen /> },
  { path: "/bm-meeting-screen", component: <BmMeetingScreen /> },
  { path: "/bm-attendance-screen", component: <BmAttendanceScreen /> },
  { path: "/bm-meeting-not-ended", component: <BmMeetingsNotEnded /> },

  //Meta Screens
  { path: "/all-ads-screen", component: <AllAdsScreen /> },
  { path: "/all-ads-screen/insights/:adId", component: <InsightsScreen /> },
  { path: "/all-ads-screen/ad-details/:adId", component: <AdDetailsScreen /> },
  { path: "/all-ads-screen/lead-form/:pageId", component: <LeadFormScreen /> },
  { path: "/all-ads-screen/lead-form/:pageId/all-leads/:formId", component: <AllLeadsResponse /> },
  { path: "/meta-admin-ads", component: <MetaAdminAdsScreen /> },
  { path: "/meta-associate-leads", component: <MetaAssociateLeadScreen /> },
  { path: "/meta-admin-ads/leads-details/:formId", component: <ViewLeadsDetails /> },
  { path: "/meta-associate-leads/leads-details/:formId", component: <ViewLeadsDetails /> },
  { path: "/view-assigned-associate", component: <ViewAssignedAssociate /> },
  { path: "/online-lead-screen", component: <OnlineLeadAdminScreen /> },

  //Google Menu
  { path: "/all-google-projects/view-google-leads/:projectId", component: <GoogleLeads /> },
  { path: "/view-assigned-google-leads", component: <GoogleAssignedLeads /> },
  { path: "/all-google-projects/view-all-google-leads/:projectId", component: <AllGoogleLeads /> },
  { path: "/all-google-projects", component: <GoogleProjectsList /> },

  //HR Module
  { path: "/all-candidate-history", component: <AllCandidateHistory /> },
  { path: "/all-candidate-history/hr-recruiter-form", component: <HrRecruiterForm /> },
  { path: "/all-candidate-history/candidate-history", component: <HrCandidateHistory /> },
  { path: "/recruiter-history", component: <HrRecruiterHistory /> },
  { path: "/recruiter-history/hr-recruiter-form", component: <HrRecruiterForm /> },
  { path: "/recruiter-history/candidate-history", component: <HrCandidateHistory /> },
  { path: "/assigned-candidate-data", component: <HandoverCandidate /> },
  { path: "/assigned-candidate-data/handover-candidate-history", component: <HandoverCandidateHistory /> },
  { path: "/candidate-docs", component: <CandidateDocs /> },
  { path: "/candidate-docs/candidate-docs-details", component: <CandidateDocsDetails /> },
  { path: "/finance-hr-docs", component: <FinanceHrDocs /> },
  { path: "/location-master", component: <LocationMaster /> },
  { path: "/interview-hr-history", component: <VisitorHrDetails /> },
  { path: "/call-report", component: <HrCallReport /> },
  { path: "/details-report", component: <HrDetailsReport /> },
  { path: "/view-interview-report-details", component: <HrInterviewDetailsReport /> },
  { path: "/view-employee-details", component: <JoiningResignedReport /> },
  { path: "/hr-main-team-report", component: <HrMainTeamReport /> },
  { path: "/branch-strength-report", component: <BranchStrength /> },
  { path: "/hr-joining-list", component: <HrJoiningList /> },
  { path: "/hr-data-transfer", component: <HrDataTransfer /> },
  { path: "/recruitment-feedback", component: <RecruitmentFeedback /> },
  { path: "/all-candidate-history/candidate-logs", component: <CandidateHistory /> },

  //IVR Menu
  { path: "/ivr-agent-list", component: <IvrAgentList /> },
  { path: "/ivr-agent-list/add-update-agent", component: <AddUpdateAgent /> },
  { path: "/ivr-recording", component: <IvrRecording /> },

  //FNF Screens
  { path: "/hr-fnf-list/hr-fnf-screen", component: <HRScreen /> },
  { path: "/it-fnf-list/it-fnf-screen", component: <ITScreen /> },
  { path: "/admin-fnf-list/admin-fnf-screen", component: <AdminScreen /> },
  { path: "/finance-fnf-list/accounts-fnf-screen", component: <AccountsScreen /> },
  { path: "/ops-fnf-list/ops-fnf-screen", component: <OpsScreen /> },
  { path: "/hods-fnf-list/hods-fnf-screen", component: <HODScreen /> },
  { path: "/list-fnf-screen", component: <FnFListScreen /> },
  { path: "/hr-fnf-list", component: <FnFListScreen /> },
  { path: "/hods-fnf-list", component: <FnFListScreen /> },
  { path: "/finance-fnf-list", component: <FnFListScreen /> },
  { path: "/admin-fnf-list", component: <FnFListScreen /> },
  { path: "/it-fnf-list", component: <FnFListScreen /> },
  { path: "/ops-fnf-list", component: <FnFListScreen /> },

  //KYT
  { path: "/kyt-screen", component: <KYTScreen /> },

  //GoogleSheetLeads
  { path: "/google-sheet-leads", component: <GoogleSheetLeads /> },

  //MT-AI Screen
  { path: "/mt-ai-screen", component: <MTAIScreen /> },

  //Money Tree Implementation Details
  { path: "/social-media-data", component: <SocialMediaData /> },

  //LetterHeadAdminScreen
  { path: "/letter-head-admin-screen", component: <LetterHeadAdminScreen /> },
  { path: "/letter-head-user-screen", component: <LetterHeadScreen /> },

  //Project Routes Points
  { path: "/reward-points-all", component: <RewardPointsScreen /> },

  //HTML FORM DATA(Project registration.Builder RM Details)
  { path: "/project-registration-data", component: <ProjectRegistrationData /> },
  { path: "/media-project-documents", component: <MediagetscreenProject /> },
  { path: "/ops-project-documents", component: <OpsgetscreenProject /> },
  { path: "/finance-project-documents", component: <FinancegetscreenProject /> },
  { path: "/sales-project-documents", component: <SalesgetscreenProject /> },
  { path: "/rm-details-data", component: <BuilderRMDetailsData /> },
];

const publicRoutes = [
  // Authentication Page
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPasswordPage /> },

  // Utility Pages
  { path: "/pages-404", component: <Error404 /> },
  { path: "/pages-500", component: <Error500 /> },
  { path: "/pages-maintenance", component: <Maintenance /> },
  { path: "/pages-comingsoon", component: <ComingSoon /> },
  { path: "/candidate-info-form", component: <CandidateInfoForm /> },
  { path: "/candidate-documents", component: <CandidateDocuments /> }
];

export { authProtectedRoutes, publicRoutes };
