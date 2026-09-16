//JAVA APIs
// export const POST_LOGIN = "user/management/authenticate";
export const POST_LOGIN = "auth/authenticate";
export const GET_EMAIL_BY_EMP_CODE = "user/management/get/user/email?empCode=";
export const CREATE_USER = "user/management/admin/createUser";
export const CHECK_USER_EXIST = "user/management/admin/username/available?userName=";
export const UPDATE_USER = "user/management/admin/updateUser";
export const CHANGE_USER_STATUS = "user/management/admin/changeUserStatus?";
export const ALL_DESIGNATION_DROPDOWN = "user/management/admin/allDesignationdropdown";
export const ALL_DEPARTMENT_DROPDOWN = "user/management/admin/allDepartmentdropdown";
export const ALL_HR_DROPDOWN = "user/management/get/hr/dropdown";
export const ALL_DEPARTMENT_DROPDOWN_ID = "user/management/admin/allDepartment/dropdown";

export const GET_DEPARTMENT_BY_ID = "user/management/get/department/dropdown";

export const ALL_DATA_GROUP = "user/management/admin/getAllDataGroup";
export const ALL_GROUP_DROPDOWN = "user/management/admin/allGroupdropdown";
export const EDIT_GROUP = "user/management/update/group";
export const GROUP_DROPDOWN_MULTISELECT = "user/management/getAll/group/dropdown";
export const ALL_DATA_GROUP_DROPDOWN = "user/management/admin/allDataGroupDropDown";
export const ALL_LOCATION_DROPDOWN = "user/management/admin/allLocationdropdown";
export const ALL_LOCATION_DROPDOWN_ID = "user/management/admin/allLocationDropdown";
export const GET_MENU_BY_ID = "user/management/admin/getMenusByUserId?userId=";
export const USER_LIST = "user/management/getAllUsers?";
export const GET_ALL_PROSPECTS_MASTER = "lead/user/getAllProspectMeetingMaster";
export const PROSPECT_DASHBOARD_DATA = "lead/user/getProspectdata?associateId=";
export const DASHBOARD_ASSOCIATE_MEETING = "lead/user/getAssociatemeeting?associateId=";
export const DASHBOARD_START_MEETING = "lead/user/startAssociatemeeting";
export const DASHBOARD_CHECK_SAME_DAY_MEETING = "lead/user/check/sameDayProspect?leadId=";
export const DASHBOARD_ONGOING_MEETING = "lead/user/getAllStatedProspectMeeting?id=";
export const CANCEL_ASSOCIATE_MEETING = "lead/user/cancelAssociatemeeting";
export const END_ASSOCIATE_MEETING = "lead/user/endAssociatemeeting";
export const GENERATE_OTP = "lead/user/notifications?ClientMobileNumber=";
export const VERIFY_OTP = "lead/user/otpVerification?meetingId=";
export const GET_PROSPECT_DATA = "lead/user/getDataForFirstBlock?assoId=";
export const GET_MEETING_DATA = "lead/user/getDataForSecondBlock?assoId=";
export const GET_SUSPECT_DATA = "lead/user/getDataForThirdBlock?assoId=";
export const GET_MEETING_DETAILS_BY_ID = "lead/user/getMeetingDetailsByMeetingId?meetingId=";
export const GET_MEETING_DETAILS_DATA = "lead/report/meeting/associate?date=";
export const GET_ALL_USER = "user/management/admin/getAllUsers?sortField=createdDate&sortType=DESC&";
export const GET_ALL_USER_BY_SEARCH = "user/management/admin/fetch?";
export const GET_ALL_DESIGNATION = "user/management/admin/getAllDesignation";
export const ADD_DESIGNATION = "user/management/admin/addDesignation?designationName=";
export const GET_ALL_DEPARTMENT = "user/management/admin/getAllDepartment";
export const ADD_DEPARTMENT = "user/management/admin/addDepartment?departmentName=";
export const GET_ALL_BUILDER_PROJECT = "user/management/admin/getAllProject";
export const ADD_BUILDER_PROJECT = "user/management/admin/addDepartment?departmentName=";
export const GET_ALL_BUILDER = "user/management/admin/getAllBuilder";
export const ADD_BUILDER = "user/management/admin/addBuilder";
export const GET_DROPDOWN_BUILDER = "user/management/admin/allBuilderdropdown";
export const GET_DROPDOWN_BUILDER_ = "user/management/project/type/getBuilder";
export const GET_PROJECT_BY_BUILDER = "user/management/admin/getAllProjectByBuilder?builderName=";
export const GET_PROJECT_BY_BUILDER_ = "user/management/project/type/getProject?builderId=";
export const GET_BUILDER_BY_PROJECT_MAPPING = "user/management/admin/getAllBuilderProjectMapping";
export const CHANGE_FILE_STATUS = "user/management/admin/changeFileStatus?fileId=";
export const MAP_PROJECT_WITH_BUILDER = "user/management/admin/mapProjectwithBuilder";
export const GET_MAPPED_TO_USER = "user/management/admin/getMenuMappedtoUser?empId=";
export const GET_ALL_ADMIN = "user/management/admin/getAllAdmin";
export const GET_USERNAME_BY_ID = "user/getUsernameByUserId?userId=";
export const MAP_MENU_TO_USER = "user/management/admin/mapMenuToUser?empId=";
export const GET_ALL_BUILDER_PROJECT_MAPPING = "user/management/admin/getAllBuilderProjectMapping";
export const CHANGE_DEPARTMENT_STATUS = "user/management/admin/change_department_status?isactive=";
export const CHANGE_DESIGNATION_STATUS = "user/management/admin/change_designation_status?isactive=";
export const CHANGE_BUILDER_STATUS = "user/management/admin/change_builder_status?isactive=";
export const CHANGE_BUILDER_PROJECT_STATUS = "user/management/admin/change_builder_project_status?isactive=";
export const CREATE_ATTENDANCE_LOCATION_MASTER = "user/management/create/attendance/location?latitude=";
export const CHANGE_ATTENDANCE_LOCATION_MASTER_STATUS = "user/management/changeStatus/attendance/location?id=";
export const GET_ALL_ATTENDANCE_LOCATION_MASTER = "user/management/getAll/attendance/location";
export const CREATE_POSITION = "user/management/position/create?position=";
export const CHANGE_POSITION_STATUS = "user/management/position/disable?id=";
export const GET_ALL_POSITION = "user/management/position/getAll";
export const GET_ALL_POSITION_DROPDOWN = "user/management/position/get/dropdown";
export const CHANGE_PASSWORD = "user/management/user/changePassword";
export const CREATE_PROSPECT = "lead/user/createProspect?loginId=";
export const UPDATE_PROSPECT = "lead/user/updateProspect?associateId=";
export const MARK_DND = "lead/dnd/create";
export const UPDATE_DND = "lead/dnd/update?";
export const GET_ALL_DND = "lead/dnd/getAll?";
export const MARK_DND_ADMIN = "lead/dnd/mark";
export const GET_PULLBACK_SUSPECT = "lead/get/pullback/suspect?fromDate=";
export const TRACK_LOCATION = "user/management/track/user/location?fromDate=";
export const GET_SUSPECT_DATA_BY_ASSOCIATE_ID = "lead/user/getSuspectDataPegination?assoId=";
export const GET_SUSPECT_DATA_BY_ASSOCIATE_ID_NEW = "lead/user/new/getSuspectDataPagination?assoId=";
export const UPDATE_SUSPECT_DATA = "lead/user/updateSuspectStatus?SuspactId=";
export const GET_ALL_PROJECT_DROPDOWN = "lead/admin/allProjectNamesdropdown";
export const GET_ALL_PROSPECTS_BY_ASSOCIATE_ID = "lead/user/getProspectsByAssociateId?associateId=";
export const GET_ALL_PROSPECTS_BY_ASSOCIATE_ID_ADMIN = "lead/user/getProspectsByAssociateId?";
export const GET_TEAMS_PROSPECTS_BY_ASSOCIATE_ID = "lead/get/allprospect/by/associateid?associateId=";
export const GET_ALL_DASHBOARD_DATA = "user/management/admin/get_admin_dshboard_data";
export const PROSPECTS_COUNT_PER_ASSOCIATE = "lead/admin/prospectsCountPerAssociate";
export const FIND_USER_BY_ID = "user/management/user/findByUserId?empId=";
export const POLICY_DETAILS_BY_USER_BY_ID = "user/management/user/get/policy?userId=";

//Branch Wise Complete Data
export const BRANCH_WISE_DATA = "user/management/get/branch/report";
export const BRANCH_WISE_GRAPH_DATA = "user/management/get/stats/monthly";

//Branch Master APIs
export const ADD_BRANCH = "user/management/admin/addLocation";
export const GET_ALL_BRANCH = "user/management/admin/get/location";
export const UPDATE_BRANCH = "user/management/admin/updateLocation";

//Scheme Master
export const CREATE_SCHEME_MASTER = "user/management/mtrs-scheme/create";
export const UPDATE_SCHEME_MASTER = "user/management/mtrs-scheme/update";
export const GET_ALL_SCHEME_MASTER = "user/management/mtrs-scheme/get/all";
export const STATUS_CHANGE_SCHEME_MASTER = "user/management/mtrs-scheme/delete";

export const GET_ALL_PROJECT_UNITS = "user/management/admin/getAllProjectUnits?sortField=createdDate&sortType=desc";
export const GET_PROJECT_UNIT_HISTORY = "user/management/get/history/projectUnit?projectUnitId=";
export const GET_PROJECT_TYPE_DROPDOWN = "user/management/admin/getProjectTypeAsBuilderAndProject?builderName=";
export const CALCULATE_PROJECT_UNIT = "user/management/admin/calculateProjectUnit";
export const SAVE_CALCULATE_PROJECT_UNIT = "user/management/admin/saveProjectUnitCalculation";
export const UPDATE_CALCULATE_PROJECT_UNIT = "user/management/admin/updateProjectUnit?loginId=";
export const GET_ALL_USERS_DROPDOWN = "user/management/admin/getAllUsersDropDown";
export const GET_ALL_USERS_DROPDOWN_ALL = "user/management/admin/getAll/user/dropDown";
export const GET_ALL_USERS_DROPDOWN_LIST = "user/management/admin/getAll/usersDropDown";
export const GET_ALL_USERS_DROPDOWN_TEAM = "user/management/admin/getAllUsersDropDownTeam?mainteam=";
export const GET_ALL_MAIN_TEAM_DROPDOWN = "user/management/admin/getAllMainTeamDropDown";
export const GET_ALL_MAIN_TEAM_DROPDOWN_ID = "user/management/admin/getAllMainTeamDropDownId";
export const GET_ALL_MAIN_TEAM_DROPDOWN_EMP_CODE = "user/management/admin/getAll/mainTeam/code";
export const GET_ALL_SUB_TEAM_DROPDOWN = "user/management/admin/getAllSubteamByMainTeam?mainTeam=";
export const SAVE_SUB_TEAM_DATA = "user/management/admin/addSubTeam";
export const SAVE_MAIN_TEAM_DATA = "user/management/admin/addMainTeam";
export const GET_ALL_MAIN_TEAM_SUB_TEAM_DROPDOWN = "user/management/admin/getAll/team/code";
export const CREATE_MONEYTREE_CALENDER = "user/management/calendar/create?";
export const UPDATE_MONEYTREE_CALENDER = "user/management/calendar/update?";
export const GET_MONEYTREE_CALENDER = "user/management/calendar/getAll";
export const ADD_TICKER_DATA = "user/management/admin/createTicker?loginId=";
export const GET_ALL_TICKER_DATA = "user/management/admin/getAllTickers";
export const CALCULATE_ASSOCIATE_REVENUE = "user/management/admin/calculateAssoRevanue";
export const CHANGE_TICKER_STATUS = "user/management/admin/statusUpdateTicker";
export const GET_MAIN_TEAM_TABLE = "user/management/admin/getAllMainTeam";
export const GET_SUB_TEAM_TABLE = "user/management/admin/getAllSubTeam";
export const CHANGE_MAIN_TEAM_STATUS = "user/management/admin/updateMainTeam?status=";
export const CHANGE_SUB_TEAM_STATUS = "user/management/admin/updateSubTeam?status=";
export const GET_DATA_FROM_PIN_CODE = "user/management/api/pincode/";
export const GET_ALL_UNITS_DROPDOWN = "user/management/admin/allProjectUnitsDropDown";
export const SAVE_ASSOCIATE_REVENUE = "user/management/admin/saveCalculateAssoRevanue?loginId=";
export const UPDATE_ASSOCIATE_REVENUE = "user/management/admin/updateAssoRevanue?loginId=";
export const GET_ALL_ASSOCIATE_REVEUE = "user/management/admin/getAllAssoRevanue?";
export const CHANGE_REVENUE_STATUS = "user/management/admin/changeAppStatusRevanue?revnId=";
export const SAVE_SALE_ENTRY = "user/management/admin/save_sale_form_data?loginId=";
export const UPDATE_SALE_ENTRY = "user/management/admin/updateSaleData?login=";
export const GET_DATA_BY_MTRS_ID = "user/management/get/sale/data?saleId=";
export const UPDATE_REVENUE_SALE = "user/management/admin/updateRevanueforSale?login=";
export const GET_PROSPECT_DATA_BY_ASSOCIATE_ID = "lead/user/getProspectsByAssociateId?";
export const GET_PROSPECT_DATA_BY_ASSOCIATE_ID_NEW = "lead/user/new/getProspectsByAssociateId?";
export const MARK_PROSPECT_FAVOURITE = "lead/user/mark/favourite";

//Token
export const GENERATE_TOKEN = "lead/user/generate/token";
export const GET_USER_BY_TOKEN = "lead/user/get/token";
export const STATUS_CHANGE_TOKEN = "lead/user/token/status";

export const PROSPECT_BULK_UPDATE = "lead/prospect/bulk/update";
export const GET_UNIT_BY_BUILDER_PROJECT = "user/management/admin/getProjectUnitByBuilderNameAndProjectName?builderName=";
export const GET_ALL_UNIT_BY_BUILDER_PROJECT = "user/management/admin/getAllProjectUnitByBuilderNameAndProjectName?builderName=";
export const GET_UNIT_BY_BUILDER_PROJECT_SALES = "user/management/admin/get/unitById?unitId=";
export const GET_REVENUE_BY_ASSOCIATE_ID = "user/management/admin/getAssoRevanueByAssoIdAndUnitId?assoId=";
export const GET_SALE_REVENUE_BY_ASSOCIATE_ID = "user/management/admin/getAssoRevanueByAssoIdAndBuilderAndProjectName?assoId=";
export const GET_COSTING_BY_PROJECT_UNITID = "user/management/admin/get_costing_by_projectUnitId?projectUnitid";
export const CREATE_SALES_TARGET_GROUP = "user/management/sale/group/create";
export const UPDATE_SALES_TARGET_GROUP = "user/management/sale/group/update";
export const GET_ALL_SALES_TARGET_GROUP = "user/management/sale/group/get/all";
export const GET_SALES_TARGET_GROUP = "user/management/sale/group/get/groupName";
export const GET_MEMBERS_BY_ID = "user/management/sale/group/get";
export const SALES_TARGET_CREATE = "user/management/create/sales/target/group";
export const USER_PERFORMANCE_REPORT = "user/management/download/all-user/performance/report?fromDate=";
export const USER_PERFORMANCE_STATUS = "user/management/get/status/";
//Domain master
export const SAVE_DOMAIN_MASTER = "user/management/domain-info/save";
export const UPDATE_DOMAIN_MASTER = "user/management/domain-info/update";
export const GET_ALL_DOMAIN_MASTER = "user/management/domain-info/get/all";
//MOU Master
export const SAVE_MOU_MASTER = "user/management/builder-project-agreements/create";
export const UPDATE_MOU_MASTER = "user/management/builder-project-agreements/update";
export const GET_ALL_MOU_MASTER = "user/management/builder-project-agreements/get/all";

//Project Reward Points
export const PROJECT_REWARD_POINTS_GET_ALL = "user/management/reward-points/all";
export const PROJECT_REWARD_POINTS_POPUP = "user/management/reward-points/user?associateId=";

export const DOWNLOAD_ENQUIRY_REPORT = "user/management/report/enquiry/lead/status/download";
export const DOWNLOAD_GOOGLE_LEAD_REPORT = "lead/report/google/lead/status/download";
export const DOWNLOAD_META_LEAD_REPORT = "lead/report/meta/lead/status/download";

export const SAVE_SALE_FORM = "user/management/admin/fill_Sale_Form?loginId=";
export const GET_ALL_SALE_DATA = "user/management/admin/find_all_sale_data";
export const DOWNLOAD_SALE_MASTER = "user/management/download/bo/saleMaster?fromDate=";
export const SAVE_PROJECT_DOCUMENTATION_DATA = "user/management/admin/map_builder_project_docs_data";
export const GET_ALL_PROJECT_DOCUMENTATION_DATA = "user/management/admin/getAllBuilderProjectDocsMapping?sortField=createdDate&sortType=desc&";
export const CHANGE_PROJECT_DOCUMENTATION_STATUS = "user/management/admin/update_builder_project_doc_status?isactive=";
export const GET_ACKNOWLEDGEMENT_LIST = "user/management/get/acknowledgement?fromDate=";

//Booking Docs
export const GET_SALE_ATTACHMENT_BY_STATUS = "user/management/sale-attachment/get/status/";
export const UPDATE_SALE_ATTACHMENT_STATUS = "user/management/sale-attachment/update-status/";
export const CREATE_SALE_ATTACHMENT = "user/management/sale-attachment/create";
export const GET_SALE_ATTACHMENT_BY_EMPLOYEE = "user/management/sale-attachment/get/employee/";

//Booking Annexure
export const CREATE_BOOKING_ANNEXURE = "user/management/booking-annexure/create";
export const UPDATE_BOOKING_ANNEXURE = "user/management/booking-annexure/update/";
export const GET_ALL_BOOKING_ANNEXURE = "user/management/booking-annexure/get/list";
export const UPLOAD_BOOKING_ANNEXURE = "user/management/booking-annexure/upload";

//Maps Master
export const CREATE_MAPS_MASTER = "user/management/mapp/create";
export const UPDATE_MAPS_MASTER = "user/management/mapp/update";
export const GET_ALL_MAPS_MASTER = "user/management/mapp/get/all";

//Personal Birthday
export const CREATE_PERSONAL_BIRTHDAY = "user/management/birthday-personal/create";
export const UPDATE_PERSONAL_BIRTHDAY = "user/management/birthday-personal/update";
export const GET_ALL_PERSONAL_BIRTHDAY = "user/management/birthday-personal/get/all";
export const DELETE_PERSONAL_BIRTHDAY = "user/management/birthday-personal/delete";

//INSURANCE_NOMINEE_DETAILS
export const INSURANCE_NOMINEE_DETAILS = "user/management/insurance-details/get/all";

//KYC
export const GET_BO_BOOKING = "user/management/get/bo/sales?fromDate=";
export const GET_OPS_BOOKING = "user/management/get/ops/sales?fromDate=";
export const UPDATE_OPS_BOOKING = "user/management/update/ops/sale?saleId=";
export const UPDATE_BO_BOOKING = "user/management/update/bo/sale?saleId=";
export const GET_FINANCE_BOOKING = "user/management/get/finance/sales?fromDate=";
export const UPDATE_FINANCE_BOOKING = "user/management/update/finance/sale?saleId=";
export const GET_KYC_TEAM_BOOKING = "user/management/get/kyc/sales?fromDate=";
export const CALL_FOR_BOOKING = "user/management/kyc/getCall?userId=";
export const RECORDING_BOOKING = "user/management/kyc/getKycCallLog?";
export const UPDATE_BOOKING = "user/management/kyc/updateStatus?status=";
export const UPDATE_KYC_BOOKING = "user/management/update/kyc/sale";
export const GET_SALE_DETAILS = "user/management/kyc/getSaleById?saleId=";
export const GET_ALL_SALE_DETAILS = "user/management/kyc/getAllSale";
export const SAVE_SALE_DETAILS = "user/management/kyc/save";

//Meeting Feedback
export const MEETING_FEEDBACK_DATA = "lead/user/get/kyc/meeting";
export const UPDATE_MEETING_FEEDBACK_DATA = "lead/user/kyc/meeting";

//MTRS
export const UPLOAD_NOC = "user/management/upload/sale/noc";
export const GET_ALL_NOC = "user/management/get/sale/noc";
export const UPLOAD_BBA = "user/management/upload/sale/bba";
export const GET_ALL_BBA = "user/management/get/sale/bba";
export const GET_MTRS_STATUS = "user/management/get/sale/details?saleId=";
export const UPDATE_BBA_VALUE = "user/management/update/sale/bba-value";

//My Tasks
export const CREATE_TASK = "user/management/task/create";
export const UPDATE_TASK = "user/management/task/update";
export const GET_ALL_TASKS = "user/management/task/get/all/assigned";
export const GET_TASK_MEMBERS = "user/management/get/group/members?groupId=15";
export const SEND_TASK_REMINDER = "user/management/task/send/reminder";
export const TASK_REPLY_URL = "user/management/task/reply";

//Fresh Booking
export const SAVE_FRESH_BOOKING_FORM = "user/management/admin/fresh_fill_Sale_Form?loginId=";
export const UPDATE_FRESH_BOOKING_FORM = "user/management/admin/freshUpdateSaleData?login=";
export const GET_ALL_FRESH_BOOKING = "user/management/admin/find_all_fresh_sale_data";
export const CHANGE_STATUS_TO_LIVE = "user/management/admin/movetolive?freshSaleId=";
export const DELETE_FRESH_BOOKING = "user/management/freshForm/changeStatus?freshId=";
export const DELETE_SALE_BOOKING = "user/management/delete/sale?userId=";

//Fresh Booking Level 1
export const GET_ALL_FRESH_BOOKING_LEVEL = "user/management/get/fresh/sale/status";
// export const GET_ALL_FRESH_BOOKING_LEVEL = "user/management/get/fresh/sale/status";
export const GET_ALL_FRESH_BOOKING_LEVEL_COUNT = "user/management/get/fresh/sale/count?freshFormLevel=";
export const UPDATE_FRESH_BOOKING_LEVEL = "user/management/update/fresh/sale/status";
export const UPDATE_FRESH_BOOKING_ATTACHMENT = "user/management/fresh/attach-form";

//Visitor
export const GET_ALL_CUSTOMER_VISIT_DATA = "user/management/admin/get_all_customer_visit_from_to_date?sortField=create_date&sortType=ASC&fromdate=";
export const GET_ALL_CUSTOMER_VISIT_DATA_BY_ID = "user/management/user/get/customer-visit?offset=0&limit=1000&sortField=create_date&sortType=desc&userId=";
export const UPDATE_VISITOR = "user/management/admin/updateCustomerVisitData";


export const MARK_VISITOR_OUT = "user/management/user/update/out-time?visitId=";
export const SEND_REQUEST_TO_MAIN_TL = "user/management/send/entry/popup?entryId=";
export const CREATE_EVENT_MASTER = "user/management/eventMaster/create";
export const UPDATE_EVENT_MASTER = "user/management/eventMaster/update";
export const GET_ALL_EVENT_MASTER = "user/management/eventMaster/getAll";
export const GET_ASSIGNED_EVENT = "user/management/eventForm/get/events?userId=";
export const CHANGE_STATUS_EVENT_MASTER = "user/management/eventMaster/changeStatus";
export const GET_EVENT_MASTER_DROPDOWN = "user/management/eventMaster/getAll/dropDown";
export const CREATE_EVENT_FORM = "user/management/eventForm/create";
export const GET_ALL_EVENT_FORM = "user/management/eventForm/getAll";
export const GET_ALL_EVENT_FORM_BY_ID = "user/management/eventForm/get/byUser";
export const EXCEL_DOWNLOAD_EVENT = "user/management/download/eventForm/excel";
export const EXCEL_DOWNLOAD_LEAD_FEEDBACK = "lead/get/download/suspectExcel?fromDate=";
export const EXCEL_DOWNLOAD_EVENT_MEETING_DETAILS = "user/management/download/event/prospect?fromDate=";

// UPLOAD DATA END PONINTS
export const UPLOAD_LEAD_DATA = "lead/admin/uploadLeadData";
export const UPLOAD_LEAD_DATA_NEW = "lead/upload/lead/data";
export const UPLOAD_LEAD_DATA_LATEST = "lead/api/excel/upload?transferBy=";
export const UPLOAD_LEAD_DATA_LATEST_STATUS = "lead/api/excel/status?taskId=";
export const UPLOAD_LEAD_DATA_LATEST_STATUS_NEW = "lead/api/excel/get/count/status?taskId=";
export const UPLOAD_LEAD_DATA_LATEST_EXCEL_DOWNLOAD = "lead/api/excel/error?taskId=";
export const UPLOAD_LEAD_DATA_NEW_STATUS = "lead/upload/lead/status?statusId=";
export const SAVE_LEAD_DATA = "lead/admin/saveLeadData?loginId=";
export const UPLOAD_PROJECT_UNIT_MASTER = "/user/management/admin/uploadProjectUnitMaster";
export const SAVE_PROJECT_UNIT_MASTER = "user/management/admin/saveProjectUnitMasterData";
export const UPLOAD_PROSPECT_DATA = "lead/admin/uploadProspectData?associateId=";
export const SAVE_PROSPECT_DATA = "lead/admin/saveProspectData?login=";
export const LEAD_FEEDBACK_DATA_ALL = "lead/admin/getAll/suspect?fromDate=";
export const TRANSFER_PROSPECT_DATA = "lead/admin/transfer_prospect?associateId=";
export const TRANSFER_PROSPECT_DATA_NEW = "lead/transfer/prospect?associateId=";
export const TRANSFER_PROSPECT_DATA_NEW_STATUS = "lead/transfer/prospect/status?taskId=";
export const GET_ALL_LEAD_DATA = "lead/admin/getAllLeadData";
export const TRANSFER_LEAD_DATA = "lead/admin/transferLead?associateId=";

//Wedenesday Scheme
export const UPLOAD_MT_PAY_SCHEME_DATA = "user/management/wednesday-scheme/upload";
export const GET_ALL_MT_PAY_SCHEME_DATA = "user/management/wednesday-scheme/get/all";
export const DROPDOWN_MT_PAY_SCHEME_DATA = "user/management/wednesday-scheme/dropdown";
export const GET_ALL_MT_PAY_SCHEME_BOOKING_DATA = "user/management/wednesday-scheme/get/booking/v2";
export const MARK_PAYOUT_MT_PAY_SCHEME_BOOKING_DATA = "user/management/wednesday-scheme/update/payout";
export const CREATE_MT_PAY_SCHEME_BOOKING = "user/management/wednesday-scheme/create";

//Sale Master Excel Upload
export const UPLOAD_SALE_MASTER_EXCEL = "user/management/sale/upload";

//Letter Head Apis
export const UPLOAD_LETTER_HEAD = "user/management/letterhead/upload?userId=";
export const GET_ALL_LETTER_HEAD = "user/management/letterhead/get/all";
export const UPDATE_LETTER_HEAD_STATUS = "user/management/letterhead/update/status";
export const GET_LETTER_HEAD_BY_ID = "user/management/letterhead/get/user";

export const LEAD_UPLOAD_FEEDBACK = "lead/api/excel/get/upload/excel/history?uploadedById=";
export const LEAD_UPLOAD_FEEDBACK_STATUS = "lead/api/excel/get/upload/excel/history/status?taskId=";
export const CANCEL_LEAD_UPLOAD_FEEDBACK_STATUS = "lead/api/excel/cancel/upload/excel/history?taskId=";

export const UPLOAD_FILE_AGAINST_SALE = "user/management/admin/uploadFileAgaistSale";
export const CREATE_PAYMENT_SALE = "user/management/admin/createPayment";
export const UPDATE_PAYMENT_SALE = "user/management/admin/updatePayment";
export const GET_ALL_RECEIVE_PAYMENT = "/user/management/admin/find_all_transc_data?sortField=createdOn&sortType=desc";
export const GET_ALL_BD_AMOUNT = "/user/management/get/all/bd?fromDate=";
export const FILL_BD_AMOUNT = "/user/management/update/bd?";
export const UPDATE_BD_AMOUNT_EXCEL = "/user/management/upload/sale/bd";

export const CHANGE_PASSWORD_SELF = "auth/changePassword";
export const PROFILE_UPDATE = "user/management/user/updateUserPicture";
export const PROFILE_DETAILS_UPDATE = "user/management/update/user/profile";
export const GET_OLD_OTP_DETAILS = "lead/admin/getOptDetails";
export const GET_NEW_OTP_DETAILS = "user/management/getAll/otp/log";
export const GET_OTP_STATUS_DETAILS = "user/management/admin/message/status";

export const PROSPECT_DROPDOWN = "lead/user/prospectsDropDownByAssociateId?loginId=";
export const ADMIN_ALL_MEETING = "lead/admin/all__meeting_byteam?sortField=meeting_date&sortType=DESC&";
export const ADMIN_REVENUE_REPORT = "user/management/admin/revanueReport?sortField=entry_Date&sortType=asc&";
export const CREATE_SUSPECT = "lead/admin/saveSuspectData?loginId=";
export const RESET_PASSWORD = "user/management/admin/resetPassword?empId=";
export const CANCEL_SALES_LIST = "user/management/admin/getSalesSummary?sortField=createdDate&sortType=desc&";
export const CANCEL_SALE = "user/management/admin/cancelSales?saleId=";

export const ADD_PAYMENT_PLAN = "user/management/admin/addPaymentPlan?isActive=YES&paymentPlan=";
export const CHANGE_PLAN_STATUS = "/user/management/admin/change_payment_status?isactive=";
export const PAYMENT_PLAN_DROPDOWN = "user/management/admin/getAllPaymentPlan/dropDown";
export const LEAD_FEEDBACK_DATA = "lead/admin/rejectSuspectDataPegination?sortField=leadName&sortType=desc&";

export const GET_PROJECT_UNIT_ASSOCIATE = "user/management/admin/getProjectUnitTableDataByBuilderNameAndProjectName?sortField=createdDate&sortType=desc&";
export const CHANGE_PROJECT_UNIT_ASSOCIATE_STATUS = "user/management/admin/unitHold?unitId=";
export const GET_PROSPECT_DETAILS_BY_PROS_ID = "lead/user/getProspectDeatilsByProsId?prospectId=";
export const GET_ALL_PROSPECT_DETAILS_BY_PROS_ID = "lead/get/prospect?prospectId=";
export const SAVE_VISITOR_DATA = "user/management/admin/saveCustomerVisitData";
export const GET_VISITOR_DATA_BY_MOBILE = "user/management/admin/getCustomerVisitData/mobileNumber?mobileNumber=";
export const CANCEL_START_MEETING = "lead/user/cancelStartedemeeting";
export const GET_ALL_PAYMENT_PLAN = "user/management/admin/getAllPaymentPlan";

// GALLERY APIS
export const CREATE_FOLDER = "lead/create/folder?folder_name=";
export const GET_ALL_FOLDER = "lead/getall/folder";
export const GET_ALL_IMAGES = "lead/getall/images";
export const DELETE_IMAGE = "lead/delete/images?file_id=";
export const UPLOAD_IMAGE = "lead/upload/image";
export const UPLOAD_MULTIPLE_IMAGE = "lead/upload/multiple/image";
export const GET_POST_PROPERTY = "user/management/property-post/get/all?offset=0&limit=10000";
export const POST_MARK_SOLD = "user/management/property-post/sold";
export const POST_MARK_HOLD_RELEASE = "user/management/property-post/hold";

//WhatsApp Messages
export const SEND_WHATSAPP_MESSAGES = "user/management/whatsapp/media/send";

//HTML FORM DATA(Project registration.Builder RM Details)
export const GET_ALL_PROJECT_REGISTRATION_DATA = "user/management/projectRegistration/getAll";
export const GET_ALL_BUILDER_RM_DETAILS = "user/management/builderRmDetails/getAll";
export const UPDATE_PROJECT_REGISTRATION = "user/management/projectRegistration/update";
export const PUBLISH_PROJECT_REGISTRATION = "user/management/projectRegistration/publish";
export const GET_PROJECT_REGISTRATION_DATA = "user/management/projectRegistration/getAttachments?department=";

//BD Target API's
export const GET_ALL_BD_TARGET = "user/management/bd-target/get/all";
export const GET_BD_TARGET_BY_ID = "user/management/bd-target/get/by-user?userId=";
export const UPDATE_BD_TARGET = "user/management/bd-target/update";
export const CREATE_BD_TARGET = "user/management/bd-target/create";


//Reward Api's
export const UPLOAD_REWARD_FILE = "user/management/reward/upload";
export const GET_ALL_REWARDS_DATA = "user/management/reward/get/all";
export const STATUS_CHANGE_REWARDS_DATA = "user/management/reward/disable";

//PopUp
export const ADD_POPUP_DATA = "user/management/admin/popup/add";
export const ADD_BIRTHDAY_POPUP_DATA = "user/management/admin/birthday/add";
export const POPUP_LIST = "user/management/admin/popup/getAll";
export const BIRTHDAY_POPUP_LIST = "user/management/get/birthday/anniversary/report?offset=0&limit=500&type=birthday";
export const DELETE_POPUP_FROM_LIST = "user/management/admin/popup/changeStatus?popupId=";

// MEDIA
export const UPLOAD_VIDEO = "lead/upload/video";
export const GET_ALL_VIDEOS = "lead/getall/video";

//JOBS
export const CREATE_JOB = "user/management/admin/job/create";
export const UPDTATE_JOB = "user/management/admin/job/update";
export const GET_ALL_JOBS = "user/management/admin/job/getall";
export const STATUS_CHANGE_JOB = "user/management/admin/job/delete?job_id=";

export const GET_ALL_ASSOCIATE_MEETING_DETAILS = "lead/user/getProspectsMeetingByAssociateId?";
export const GET_TEAM_BY_PARENT_ID = "user/management/user/findAssoByParentUser?parentId=";

export const GET_SBI_SALES_ASSOCIATE = "user/management/sbi/getAllSales?sortBy=createdDate&";
export const UPLOAD_SBI_FILES = "user/management/sales_transaction_upload";
export const UPLOAD_SBI_FILES_NON_SALES = "user/management/sbi/getAllNonSalesTrasaction?sortType=createdDate&";
export const CHANGE_SBI_STATUS = "user/management/sbi/approve_reject?status=";

export const SHOW_UPLOADED_FILE = "user/management/sales/file/view?saleId=";
export const UPLOADED_FILE_RECEIVE_PAY = "user/management/admin/sales_transaction_upload";
export const SHOW_UPLOADED_FILE_RECEIVE_PAY = "user/management/get/receive/payFiles?transactionId=";
export const DELETE_UPLOADED_FILE = "user/management/delete/file/sales?saleId=";
export const GET_MY_TEAM = "user/management/getTeamById?associateId=";
export const GET_MY_TEAM_BY_EMP_CODE = "user/management/getTeamByEmpCode?empCode=";
export const GET_MY_TEAM_ID = "user/management/getTeamByCode?associateId=";
export const GET_MY_ALL_TEAM = "user/management/getAllTeamById?associateId=";
export const GET_MY_TEAM_DATA = "user/management/getAssociate/details?associateId=";
export const USER_LOGIN_LOG = "/auth/get/user/loginlog?fromDate=";
export const CREATE_PROJECT_TYPE_MASTER = "user/management/project/type/create";
export const GET_ALL_PROJECT_TYPE_MASTER = "user/management/project/type/getAll";
export const STATUS_CHANGE_PROJECT_TYPE_MASTER = "user/management/project/type/change/status";
export const PROJECT_ID_NAME_DROPDOWN = "user/management/admin/allProjectNameWithIdDropdown";

export const SEND_ACKNOWLEDGEMENT_MAIL = "user/management/send/acknowledgement";


//Excel Download
export const DOWNLOAD_PROSPECT_EXCEL = "user/management/download/prospect/excel";
export const DOWNLOAD_LEAD_EXCEL = "user/management/download/lead/excel";
export const DOWNLOAD_UNIT_MASTER_EXCEL = "user/management/download/unitmaster/excel";
export const USER_LIST_EXCEL = "user/management/download/user/excel";
export const USER_LOGIN_LOG_EXCEL = "user/management/download/userlog/excel?fromDate=";
export const CUSTOMER_VISIT_EXCEL = "user/management/download/customervisit/excel";
export const PROSPECT_EXCEL = "user/management/download/prospect/excel";
export const REVENUE_REPORT_EXCEL = "user/management/download/mainteam/excel";
export const ASSCOIATE_MEETING__EXCEL = "user/management/download/meetingstatus/excel";
export const MEETING_REPORT = "user/management/admin/downloadMeetingReportExcel?loginId=";
export const SALE_ENTRY_NEW_EXCEL = "user/management/download/saleEntryNew/excel?flag=1";
export const REVENUE_FOR_SALE_EXCEL = "user/management/download/saleEntryNew/excel?flag=0";
export const ASSOCIATE_REVENUE_EXCEL = "user/management/download/associateRevenue/excel";

// CHAT GROUP APIS
export const CREATE_GROUP = "user/management/create/group";
export const GET_ALL_GROUP = "user/management/getAll/groups";
export const GET_GROUP_MEMBERS = "user/management/get/group/members?groupId=";
export const ADD_GROUP_MEMBERS = "user/management/add/member?groupId=";
export const DELETE_GROUP_MEMBERS = "user/management/remove/member?groupId=";
export const GROUP_MEMBERS_BY_ID = "user/management/get/group/members/dropdown?groupId=";
export const VERIFY_GROUP_MEMBER = "user/management/verify/user?empCode=";
export const CREATE_REMOVE_ADMIN = "user/management/create/admin";

//Policy Document
export const UPLOAD_POLICY_DOCUMENT = "user/management/policy/upload";
export const GET_ALL_POLICY_DOCUMENT = "user/management/policy/get/all";
export const STATUS_CHANGE_POLICY_DOCUMENT = "user/management/policy/disable/document?documentId=";
export const DOWNLOAD_POLICY_DOCUMENT = "user/management/policy/download/document?documentId=";
export const GET_ACTIVE_POLICY_DOCUMENT = "user/management/policy/get/all/active?userId=";

//Focus Prjects
export const CREATE_FOCUS_PROJECT = "user/management/focus-projects/create";
export const UPDATE_FOCUS_PROJECT = "user/management/focus-projects/update";
export const GET_ALL_FOCUS_PROJECT = "user/management/focus-projects/all";
export const STATUS_CHANGE_FOCUS_PROJECT = "user/management/focus-projects/delete?id=";
export const GET_ACTIVE_FOCUS_PROJECT = "user/management/focus-projects/user?userId=";

//Enquiry
export const GET_ALL_ENQUIRY = "user/management/getAll/enquiry";
export const GET_ALL_NEW_ENQUIRY = "user/management/get/all/other/enquiry";
export const ASSIGN_ENQUIRY = "user/management/assign/enquiry?assignTo=";
export const CREATE_NEW_ENQUIRY = "user/management/create/other/enquiry";
export const CREATE_ENQUIRY = "user/management/create/enquiry";
export const GET_ENQUIRY_BY_ID = "user/management/get/enquiry/id?loginId=";
export const DOWNLOAD_ENQUIRY_EXCEL = "user/management/get/enquiry/excel?loginId=";
export const GET_NEW_ENQUIRY_BY_ID = "user/management/get/other/enquiry?loginId=";
export const DELETE_ENQUIRY_BY_ID = "user/management/delete/enquiry?enquiryId=";
export const GET_ASSIGN_ENQUIRY_BY_ID = "user/management/get/assignBy/enquiry?assignTo=";
export const ASSIGN_ENQUIRY_REPLY = "user/management/assignTo/remark/enquiry?assignTo=";

// HR Module
export const APPLY_ATTENDANCE = "attendance/mark";
export const GET_ATTENDANCE_STATUS = "attendance/getStatus";
export const GET_ATTENDANCE = "attendance/getAllAttendanceRecords?";
export const GET_MOBILE_ATTENDANCE = "user/management/admin/getSelfie/attendance?";
export const GET_ASSOCIATE_ATTENDANCE = "attendance/get?";
export const UPDATE_OD_DATA = "attendance/create/update/attendance";
export const GET_OD_DATA = "attendance/get/attendance/employee";
export const DELETE_OD_DATA = "attendance/delete/attendance";
export const GET_OD_DATA_BY_ID = "attendance/admin/getAll/request?tlEmpCode=";
export const CHANGE_OD_STATUS = "attendance/approve/reject/attendance";
export const GET_DEFAULTER_REPORT = "attendance/get/attendance/defaulters?date=";
export const GET_ATTENDANCE_LOCATION_STATUS = "user/management/check/project/location?latitude=";
export const GET_MAIN_TEAM_ATTENDANCE = "user/management/download/mainTeam/attendance?";
export const GET_BRANCH_WISE_ATTENDANCE = "user/management/download/location/attendance?";

//MT AI API's
export const MT_AI_CHAT = "ai/api/chat"
export const MT_AI_HISTORY = "ai/api/history"
export const MT_AI_HISTORY_BY_ID = "ai/api/history/"
export const GET_HISTORY = "ai/api/history"

export const GET_ALL_USER_AI_TABLE = "ai/api/admin/user-table-access"
export const CREATE_USER_AI_TABLE = "ai/api/admin/user-table-access"
export const UPDATE_USER_AI_TABLE = "ai/api/admin/user-table-access"
export const DELETE_USER_AI_TABLE_BY_ID = "ai/api/admin/user-table-access/"
export const DELETE_USER_AI_TABLE_ALL = "ai/api/history/"
export const GET_ALL_TABLES = "ai/api/admin/user-table-access/tables"

//MT HR Module
export const CREATE_CANDIDATE_FORM = "hr/candidate/create";
export const UPDATE_CANDIDATE_FORM = "hr/candidate/update";
export const CHECK_EMAIL_EXISTS = "hr/candidate/check/email?email=";
export const CHECK_MOBILE_EXISTS = "hr/candidate/check/phone?phone=";
export const CANDIDATE_HISTORY = "hr/candidate/get/all?";
export const ALL_CANDIDATE_HISTORY = "hr/candidate/admin/get/all?";
export const CANDIDATE_HISTORY_FOR_TRANSFER = "hr/transfer/get?";
export const CANDIDATE_SEND_MAIL = "hr/mail/send/form?";
export const CANDIDATE_INTERVIEW_RESCHEDULED = "hr/mail/send/rescheduled?";
export const CANDIDATE_FILL_MAIL_FORM = "hr/mail/fill/form";
export const HR_LOCATION_DROPDOWN = "hr/location/get/dropDown";
export const HR_HANDOVER_TO_MAINTEAM = "hr/interview/handover";
export const HANDOVER_MAINTEAM_DETAILS = "hr/interview/handover/get?";
export const MAINTEAM_HANDOVER_TO_HR = "hr/interview/handover/update";
export const FINAL_SUBMIT = "hr/interview/final";
export const CANDIDATE_DOCUMENT_SUBMIT = "hr/mail/fill/document/v2";
export const CANDIDATE_SINGLE_DOCUMENT_SUBMIT = "hr/mail/upload/attachment";
export const CANDIDATE_DOCUMENT_UPDATE = "hr/mail/update/document";
export const HR_DOCUMENT_UPDATE = "hr/candidate/upload/document";
export const SEND_MAIL_CANDIDATE_DOCUMENT_SUBMIT = "hr/mail/send/document?";
export const CANDIDATE_HISTORY_BY_ID = "hr/candidate/get/by/id?id=";
export const JOB_TITLE_DROPDOWN = "user/management/admin/job/getAll/title";
export const TRIAL_PERIOD_CREATE = "hr/trial/create?";
export const TRIAL_PERIOD_UPDATE = "hr/trial/update?";
export const HR_REJECT_CANDIDATE = "hr/interview/reject";
export const HR_CREATE_LOCATION = "hr/location/create?";
export const HR_UPDATE_LOCATION = "hr/location/update?";
export const HR_LOCATION_GET_ALL = "hr/location/getAll";
export const HR_LOCATION_STATUS_CHANGE = "hr/location/status/";
export const HR_CALL_REPORT = "hr/report/call?fromDate=";
export const HR_INTERVIEW_REPORT = "hr/report/interview?fromDate=";
export const HR_INTERVIEW_REPORT_DETAILS = "hr/report/candidate/interview?fromDate=";
export const HR_EMPLOYEE_REPORT_DETAILS = "user/management/get/hr/resigned/report?fromDate=";
export const HR_LINK_SAP = "hr/candidate/update/code?";
export const HR_MAIN_TEAM_REPORT = "hr/report/mainTl/count?fromDate=";
export const GET_ALL_HR_VISITOR_DATA = "user/management/admin/get/all/candidate?fromdate=";
export const HR_BRANCH_STRENGTH_REPORT = "user/management/get/locationWise/count?fromDate=";
export const HR_JOINING_DETAILS = "hr/follow-up/get?fromDate=";
export const HR_UPDATE_JOINING_DETAILS_REMARKS = "hr/follow-up/update?candidateId=";
export const HR_DATA_TRANSFER = "hr/follow-up/update?candidateId=";
export const HR_TRANSFER_DATA = "hr/transfer/to";
export const SEND_OFFER_LETTER_MAIL = "hr/mail/send/offer-letter";
export const ALL_CANDIDADTE_EXCEL_DOWNLOAD = "hr/candidate/download/candidate/excel";
export const HR_DETAILS_REPORT = "hr/report/recruiter/hiring?fromDate=";
export const GET_CANDIDATE_AUDIT_LOG = "/hr/audit/get/log";
export const GET_CANDIDATE_CHAT = "hr/candidate-chat-details/get";
export const SEND_CANDIDATE_CHAT = "hr/candidate-chat-details/send";
export const INTERVIEW_HANDOVER_ASSIGN = "hr/interview/handover/assign";
export const GET_MESSAGE_COUNT = "hr/candidate-chat-details/get/count";
export const GET_BRANCH_WISE_ASSIGNED_CANDIDATE = "hr/report/branch/candidates";
export const SUBMIT_CANDIDATE_REMARKS = "hr/candidate/branch-head/remarks";
export const GET_REFERRAL_DATA_STATUS = "hr/candidate/team/referral";

//Recruitment Feedback
export const GET_RECRUITMENT_FEEDBACK_LIST = "user/management/feedback/get/doj";
export const UPDATE_RECRUITMENT_FEEDBACK1 = "user/management/feedback/create";
export const UPDATE_RECRUITMENT_FEEDBACK2 = "user/management/feedback/update/remark2";
export const UPDATE_RECRUITMENT_FEEDBACK3 = "user/management/feedback/update/remark3";
export const GET_RECRUITMENT_FEEDBACK = "user/management/feedback/get";

//Upload CV
export const UPLOAD_CV_FILE = "hr/candidate/upload/bulk/resume";
export const GET_ALL_CV_FILE = "hr/candidate/get/all/bulk/resume";
export const GET_CV_FILE_BY_ID = "hr/candidate/get/bulk/resume";

//P100
export const CREATE_P100_LEAD = "lead/personal-leads/create";
export const GET_P100_LEADS = "lead/personal-leads/get?limit=1000&offset=0";
export const GET_P100_LEADS_DOJ = "lead/personal-leads/get/doj";
export const TRANSFER_P100_LEADS = "lead/admin/transferPersonalLead";


//Notifications
export const SEND_TO_INDIVIDUAL_NOTIFICATIONS = "user/management/admin/notification/sendToUser";
export const SEND_TO_CHAT_GROUPS = "user/management/notification/group";
export const SEND_TO_ALL_NOTIFICATIONS = "user/management/admin/notification/sendToAll";
export const GET_ALL_NOTIFICATIONS = "user/management/admin/notification/getAll";
export const GET_ALL_TODAYS_NOTIFICATIONS = "user/management/admin/notification/get";
export const GET_NOTIFICATIONS_BY_ID = "user/management/admin/notification/getByUser?userId=";
export const CHANGE_NOTIFICATIONS_STATUS = "user/management/admin/notification/inActive?notificationId=";
export const CLEAR_NOTIFICATIONS_COUNT = "user/management/user/notification/clear?userId=";

// MOM
export const CREATE_MOM = "user/management/create/mom";
export const GET_ALL_MOM = "user/management/getAll/mom";
export const UPDATE_MOM = "user/management/update/mom";
export const DELETE_MOM = "user/management/delete/mom?id=";

// CUSTOMER CARE
export const CREATE_CC = "user/management/create/complaint";
export const GET_ALL_CC = "user/management/getAll/complaint";
export const UPDATE_CC = "user/management/update/complaint";
export const RESOLVE_CC = "user/management/resolve/complaint?id=";

//App Banner
export const CREATE_APP_BANNER = "user/management/admin/create/banner";
export const GET_ALL_APP_BANNER = "user/management/admin/getAll/banner?loginId=";
export const CHANGE_STATUS_APP_BANNER = "user/management/admin/banner/deactivate?id=";
export const CREATE_APP_ICON = "user/management/create/icon/name?name=";
export const ICONS_DROPDOWN = "user/management/get/icon/name"
export const STATUS_CHANGE_SCREEN = "user/management/disable/icon/name?id="
export const GET_ALL_SCREENS = "user/management/get/all/icon/name"

//Reports Section
export const SHOW_SALE_DATA_REPORTS = "user/management/saleRegister/Excel?flag=0&inputType=0&fromDate=";
export const EXCEL_SALE_DATA_REPORTS = "user/management/saleRegister/Excel?flag=1&inputType=0&fromDate=";
export const SHOW_SALE_REPORTS = "user/management/saleReport/Excel?flag=0&inputType=1&fromDate=";
export const EXCEL_SALE_REPORTS = "user/management/saleReport/Excel?flag=1&inputType=1&fromDate=";
export const SHOW_MEETING_DASHBOARD_REPORT = "user/management/meetingDashboard/Excel?flag=0&fromDate=";
export const EXCEL_MEETING_DASHBOARD_REPORT = "user/management/meetingDashboard/Excel?flag=1&fromDate=";
export const SHOW_MEETING_REPORT = "user/management/meetingReport/Excel?flag=0&fromDate=";
export const TURNOVER_REPORT = "user/management/getReport/by/dropdown?";
export const TARGET_ENTRY_REPORT = "user/management/create/sales/target?userId=";
export const SALES_TARGET_ENTRY_REPORT_NEW = "user/management/create/sales/target/new";
export const UPDATE_SALES_TARGET_ENTRY_REPORT_NEW = "user/management/update/sales/target/new";
export const UPDATE_TARGET_ENTRY_REPORT = "user/management/update/sales/target";
export const GET_SALES_TARGET_POPUP_SALES = "user/management/get/sale/target/popup";
export const UPDATE_SALES_TARGET_POPUP_SALES = "user/management/update/sale/target/popup";
export const GET_ALL_TARGET = "user/management/getall/sales/target";
export const GET_ALL_SALES_TARGET_NEW = "user/management/getAll/sales/target/new";
export const MEETING_TARGET_ENTRY_REPORT = "user/management/create/meeting/target?userId=";
export const MEETING_TARGET_UPDATE_REPORT = "user/management/update/meeting/target";
export const GET_ALL_MEETING_TARGET = "user/management/getall/meeting/target";
export const GET_PROSPECT_MEETING_DETAILS = "lead/get/prospect/by/number?number=";
export const SALE_MASTER_REPORT = "user/management/download/saleMaster/report?fromDate=";
export const SALE_MASTER_REPORT_VIEW = "user/management/get/saleMaster/report?fromDate=";
export const PAYMENT_MASTER_REPORT = "user/management/download/paymentMaster/report?fromDate=";
export const PAYMENT_PLAN_MASTER_REPORT_VIEW = "user/management/get/paymentMaster/report?fromDate=";
export const VISITOR_MANAGEMENT_REPORT = "user/management/visitor/location/report?fromDate=";
export const BUIDER_WISE_REPORT = "user/management/get/builderTurnover/report?fromDate=";

//UpdateMeetProspect
export const GET_PROSPECT_BY_NUMBER = "lead/admin/get/prospect?mobile=";
export const GET_MEETING_BY_NUMBER = "lead/admin/get/meeting?mobile=";
export const UPDATE_PROSPECT_BY_NUMBER = "lead/admin/update/prospect?prospectId=";
export const UPDATE_MEETING_BY_NUMBER = "lead/admin/update/meeting?meetingId=";


// export const PROJECT_WISE_REPORT = "user/management/get/projectTurnover/report?fromDate=";
export const PROJECT_WISE_REPORT = "user/management/get/builder/project/turnover?fromDate=";
export const BOOKING_STATUS_REPORT = "user/management/download/bookingStatus/report?fromDate=";
export const DEMAND_FORM_REPORT = "user/management/download/demandForm/report?fromDate=";
export const GET_DAILY_PROSPECT_REPORT = "lead/get/prospects/teamwise/report?startDate=";
export const GET_MAIN_TEAM_WISE_PROSPECT_REPORT = "lead/get/prospects/mainteam/report?startDate=";
export const GET_MAIN_TEAM_WISE_MEET_REPORT = "lead/report/meeting/mainTeam?fromDate=";
export const GET_SUB_TEAM_WISE_MEET_REPORT = "lead/report/meeting/subTeam?fromDate=";
export const GET_ASSOCIATE_MEET_REPORT = "lead/get/subTeam/meeting/associate/report?startDate=";
export const GET_ASSOCIATE_PROS_REPORT = "lead/get/subTeam/prospects/associate/report?startDate=";
export const GET_BRANCH_WISE_MEET_REPORT = "lead/report/meeting/branch?fromDate=";
export const GET_KYC_REPORT = "user/management/get/kyc/report?fromDate=";
export const GET_TRADING_WINDOW = "user/management/getAll/trade";
export const GET_TUESDAY_REPORT = "user/management/tuesday/getAll/activity?";
export const DOWNLOAD_TUESDAY_REPORT_EXCEL = "user/management/tuesday/download/activity";
export const GET_LEAVE_HISTORY = "user/management/leave/all?";
export const DOWNLOAD_LEAVE_EXCEL = "user/management/leave/download/excel?";

export const GET_ALL_INSTANT_MEETINGS_DATA = "user/management/instantMeeting/getAll";
export const UPDATE_INSTANT_MEETING = "user/management/instantMeeting/update";
export const GET_STATUS_LEADS = "lead/get/lead/status";
export const DELETE_INSTANT_MEETING = "user/management/instantMeeting/delete?id=";

//Google Sheet APIs
export const GET_GOOGLE_SHEET_LEADS = "lead/campaign-lead/get/all";
export const UPDATE_GOOGLE_SHEET_LEADS = "lead/campaign-lead/update";
// export const ADD_GOOGLE_SHEET_LEADS = "lead/google-sheet-leads/create";

export const GET_ALL_PPC_LEADS = "lead/ppc-lead/get/all";
export const UPDATE_PPC_LEADS = "lead/ppc-lead/update";
export const ADD_PPC_LEADS = "lead/ppc-lead/create";
export const DELETE_PPC_LEAD = "lead/ppc-lead/delete?id=";

//Project Launch
export const ADD_LAUNCH_PROJECT = "user/management/web/project/create";
export const UPDATE_LAUNCH_PROJECT = "user/management/web/project/update";
export const GET_ALL_LAUNCH_PROJECT = "user/management/web/project/get/all";

//DIY API's
export const GET_DIY_DROPDOWN = "user/management/diy/dropdown";
export const GET_DIY_DROPDOWN_PUNE = "user/management/diy/get/branch?branch=Pune";

//Finance Report
export const UPDATE_FINANCE_SALE_REPORT = "user/management/update/sale/finance?";
export const GET_FINANCE_SALE_REPORT = "user/management/get/sale/finance?";
export const FINANCE_SALE_REPORT_EXCEL_DOWNLOAD = "user/management/download/sale/finance?fromDate=";
export const BUILDER_WISE_TURNOVER = "user/management/get/builderWise/turnover?";
export const DOWNLOAD_BUILDER_WISE_TURNOVER_EXCEL = "user/management/download/builderWise/turnover?fromDate=";
export const BUILDER_WISE_BOOKING = "user/management/get/builderWise/booking?";
export const DOWNLOAD_BUILDER_WISE_BOOKING_EXCEL = "user/management/download/builderWise/booking?fromDate=";
export const TEAM_WISE_BOOKING = "user/management/get/teamWise/booking?";
export const DOWNLOAD_TEAM_WISE_BOOKING_EXCEL = "user/management/download/teamWise/booking?fromDate=";
export const GET_DEMAND_REPORT = "user/management/get/demandForm/finance?";
export const DEMAND_REPORT_EXCEL_DOWNLOAD = "user/management/download/demandForm/finance?fromDate=";
export const UPDATE_DEMAND_REPORT = "user/management/update/demandForm/finance?";
export const UPDATE_DEMAND_DATE_REPORT = "user/management/update/demandForm/finance/date?";
export const UPDATE_RA_RC_REMARKS = "user/management/update/sale/ra-rc/remark?";
export const GET_RA_RC_REPORT = "user/management/get/saleMaster/ra/rc?fromDate=";
export const DOWNLOAD_RA_RC_EXCEL = "user/management/download/saleMaster/ra/rc?fromDate=";
export const GET_PAYMENT_BREAKUP = "user/management/get/payment/details?saleId=";

export const GET_VA_AB_REPORT_BD = "user/management/get/bd/ra/rc?fromDate=";
export const DOWNLOAD_BD_RA_RC_EXCEL = "user/management/download/bd/ra/rc?fromDate=";

//Ops Report
export const TEMP_BOOKING_REPORT = "user/management/admin/getTempBooking/report?offset=0&limit=5000";
export const MAIN_TEAM_DATA_REPORT = "user/management/get/bo/mainTeam/report?fromDate=";
export const DOWNLOAD_MAIN_TEAM_DATA_REPORT = "user/management/download/bo/mainTeam/report?fromDate=";
export const BUILDER_WISE_OPS_REPORT = "user/management/get/bo/builder/report?fromDate=";
export const DOWNLOAD_BUILDER_WISE_OPS_REPORT = "user/management/download/bo/builder/report?fromDate=";
export const PROJECT_WISE_OPS_REPORT = "user/management/get/bo/project/report?fromDate=";
export const DOWNLOAD_PROJECT_WISE_OPS_REPORT = "user/management/download/bo/project/report?fromDate=";
export const DAILY_BOOKING_OPS_REPORT = "user/management/get/bo/daily/booking/report?fromDate=";
export const DOWNLOAD_DAILY_BOOKING_OPS_REPORT = "user/management/download/bo/daily/booking/report?fromDate=";
export const DAILY_DISPATCH_OPS_REPORT = "user/management/get/bo/daily/dispatch/report?fromDate=";
export const DOWNLOAD_DAILY_DISPATCH_OPS_REPORT = "user/management/download/bo/daily/dispatch/report?fromDate=";
export const DAILY_TEMP_OPS_REPORT = "user/management/get/bo/daily/temp/report?fromDate=";
export const DOWNLOAD_DAILY_TEMP_OPS_REPORT = "user/management/download/bo/daily/temp/report?fromDate=";

//Change Request Form
export const CREATE_CHANGE_REQUEST = "user/management/sap-modification-request/create";
export const GET_ALL_CHANGE_REQUESTS = "user/management/sap-modification-request/get/all";
export const GET_CHANGE_REQUESTS_BY_ID = "user/management/sap-modification-request/get/created-by";

export const UPDATE_CHANGE_REQUEST_STATUS_HOD = "user/management/sap-modification-request/rm-approve-reject";
export const UPDATE_CHANGE_REQUEST_OTHER = "user/management/sap-modification-request/update";
export const MOVE_NEXT_CHANGE_REQUEST = "user/management/sap-modification-request/move-to-next-level";
export const GET_CHANGE_REQUESTS_BY_IT = "user/management/sap-modification-request/get/user?hodApproved=true&offset=0&limit=10000";
export const GET_CHANGE_REQUESTS_BY_RM = "user/management/sap-modification-request/get/user?offset=0&limit=10000";
export const GET_CHANGE_REQUESTS_BY_USER = "user/management/sap-modification-request/get/user?offset=0&limit=10000&createdById=";

//Screen Time APIs
export const SCREEN_TIME_START = "user/management/screen-time/enter";
export const SCREEN_TIME_END = "user/management/screen-time/exit";
export const GET_SCREEN_TIME_DATA = "user/management/screen-time/get";

//Support
export const GET_SUPPORT_DATA_BY_ID = "user/management/get/message/personalMessage?offset=0&limit=0&receiverId=";
export const SEND_SUPPORT_MESSAGE_ASSOCIATE = "user/management/send/message/support";
export const LIST_SUPPORT_MESSAGES = "user/management/get/support/receivedMessages/byUser?receiverId=";

//OTP
export const SEND_OTP = "user/management/eventForm/send/otp?mobileNumber=";
export const VERIFY_TEXT_OTP = "user/management/eventForm/verify/otp?otp=";
export const OTP_BALANCE = "user/management/admin/getMessage/count?userId=";

//Graphs APIs
export const MONTHLY_GRAPH = "user/management/get/monthly/data";
export const YEARLY_GRAPH = "user/management/get/yaerly/data";

//Verification APIs
export const VERIFY_PAN = "pan/verify?pan=";
export const VERIFY_BANK = "bank/verify";

//Q&A APIs
export const CREATE_Q_A = "user/management/question/create";
export const GET_ALL_Q_A = "user/management/question/get/all";
export const UPDATE_Q_A = "user/management/question/update";
export const DELETE_Q_A = "user/management/question/delete";
export const GET_Q_A_BY_ID = "user/management/question/get/byuser?userId=";
export const UPLOAD_Q_A_EXCEL = "user/management/question/upload/excel";
export const SAVE_Q_A = "user/management/question/point/save";

//Admin Asset API's
export const ADMIN_ASSET_CREATE = "user/management/adminasset/create";
export const ADMIN_ASSET_UPDATE = "user/management/adminasset/update";
export const ADMIN_ASSET_GET_ALL = "user/management/adminasset/get/all";

//BM APIs
export const BM_SUSPECT_DATA = "user/management/get/bm/suspect?fromDate=";
export const BM_PROSPECT_DATA = "user/management/get/bm/prospect?fromDate=";
export const BM_MEETING_DATA = "user/management/get/bm/meeting?fromDate=";
export const BM_ATTENDANCE_DATA = "user/management/get/bm/attendance?fromDate=";
export const BM_MEETING_NOT_ENDED = "user/management/get/meeting/report?fromDate=";

//Connect APIs
export const GET_ALL_CUSTOMERS = "customer/getAll/customer?";
export const CREATE_PLAN = "customer/plan/create";
export const UPDATE_PLAN = "customer/plan/update";
export const GET_ALL_PLANS = "customer/plan/get/all";
export const CHANGE_STATUS_PLAN = "customer/plan/change/status?planId=";
export const GET_ALL_ASSOCIATES = "customer/admin/getAll/associates?";
export const GET_ASSOCIATE_CONNECT = "customer/get/associate/connect?userId=";
export const GET_SINGLE_CUSTOMER_SUSPECT = "customer/get/associate/suspect?customerId=";
export const UPDATE_CONNECT_SUSPECT = "customer/associate/updateSuspect"
export const CREATE_CONNECT_PROSPECT = "lead/user/create/connectProspect?loginId="
export const GET_ALL_CONNECT_LEADS = "customer/admin/getAll/connectSuspect?"
export const GET_RM_CHANGE_PENDING_REQUESTS = "customer/get/rmChange/request"
export const GET_RM_CHANGE_COMPLETED_REQUESTS = "customer/get/approved/rmChange/request"
export const UPDATE_RM_CHANGE = "customer/updated/rm?customerId="
export const SEND_TO_ALL_NOTIFICATIONS_CONNECT = "customer/admin/notification/sendToAll";
export const GET_ALL_NOTIFICATIONS_CONNECT = "customer/admin/notification/getAll";
export const CHANGE_NOTIFICATIONS_STATUS_CONNECT = "customer/admin/notification/inActive?notificationId=";
export const ADD_POPUP_DATA_CONNECT = "customer/popup/create";
export const POPUP_LIST_CONNECT = "customer/popup/getAll";
export const CHANGE_STATUS_POPUP_FROM_LIST_CONNECT = "customer/popup/change/status?id=";
export const ADD_TICKER_DATA_CONNECT = "customer/admin/createTicker?loginId=";
export const GET_ALL_TICKER_DATA_CONNECT = "customer/admin/getAllTickers";
export const CHANGE_TICKER_STATUS_CONNECT = "customer/admin/statusUpdateTicker";
export const GET_CONNECT_OTP_LIST = "customer/admin/get/otp/logs";
export const UPLOAD_CONNECT_DOCS = "customer/upload/document";
export const GET_ALL_CONNECT_DOCS = "customer/getAll/document";
export const STATUS_CHANGE_CONNECT_DOCS = "customer/change/status/document?id=";
export const CREATE_TESTIMONIAL = "customer/testimonial/create";
export const GET_ALL_TESTIMONIAL = "customer/testimonial/get/all";
export const STATUS_CHANGE_TESTIMONIAL = "customer/testimonial/changeStatus?id=";
export const GET_CONNECT_SUPPORT_DATA_BY_ID = "customer/support/get/message/byUser?offset=0&limit=0&senderId=";
export const SEND_CONNECT_SUPPORT_MESSAGE = "customer/support/send/message";
export const CONNECT_LIST_SUPPORT_MESSAGES = "customer/support/get/all/message?receiverId=";
export const CONNECT_STATUS_DROPDOWN = "customer/track/status/get/dropdown";
export const CONNECT_INVOICE_GET_ALL = "customer/payment/received/get";
export const CONNECT_INVOICE_UPLOAD = "customer/invoice/create";
export const CONNECT_KYC_DOCS = "customer/get/kyc/list?";
export const CONNECT_KYC_UPDATE = "customer/update/kyc/status";
export const CONNECT_EVENT_IMAGE_UPLOAD = "customer/event/upload";
export const CONNECT_EVENT_GET_ALL = "customer/event/getAll";
export const DELETE_CONNECT_EVENT_IMAGE = "customer/event/changeStatus?eventId=";
export const CREATE_CONNECT_LOCATION = "customer/location/create?stateName=";
export const GET_ALL_CONNECT_LOCATION = "customer/location/get/all";
export const CONNECT_LOCATION_CHANGE_STATUS = "customer/location/change/status?id=";
export const CREATE_CONNECT_OCCUPATION = "customer/create/occupation?occupation=";
export const GET_ALL_CONNECT_OCCUPATION = "customer/getAll/occupation";
export const CONNECT_OCCUPATION_CHANGE_STATUS = "customer/update/occupation?id=";
export const ALL_CONNECT_DROPDOWN = "customer/getAll/connectDropdown";
export const ALL_CONNECT_PAYOUT_LIST = "user/management/get/payout/list";
export const CREATE_CONNECT_PAYOUT = "user/management/create/payout";
export const GET_CONNECT_PAYOUT = "user/management/get/payout/sale?saleId=";
export const CONNECT_DASHBOARD_DATA = "customer/get/dashboard/count?userId=";
export const CONNECT_DASHBOARD_DATA_DETAILS = "customer/get/dashboard/associate/connect?userId=";

//Facebook Apis
export const GET_ALL_ADS = "v1/ads/get/all";
export const GET_LEAD_FORM = "v1/ads/get/lead/form?pageId=";
export const GET_LEAD_INSIGHTS = "v1/ads/get/insight?adId=";
export const GET_LEAD_DETAILS = "v1/ads/get/details?adId=";
export const GET_CUSTOMER_LEADS = "v1/ads/get/customer/leads?formId=";
export const GET_ALL_FB_LEADS = "meta/admin/all/lead/form";
export const ASSIGN_FB_LEADS = "meta/admin/assign/add?";
export const ASSOCIATE_FB_LEADS = "meta/all/lead/form?empCode=";
export const ASSOCIATE_FB_LEADS_DETAILS = "meta/admin/all/leads?formId=";
export const UPDATE_ASSOCIATE_FB_LEAD = "meta/update/lead?";
export const ASSIGN_ASSOCIATE_FB_LEAD = "meta/admin/assign/leads";
export const GET_ASSIGNED_ASSOCIATE_FB_LEAD = "meta/all/assign/leads?assignToCode=";
export const META_LEAD_STATUS_ADMIN = "lead/report/meta/leads";
export const GOOGLE_LEAD_STATUS_ADMIN = "lead/report/google/leads";
export const ONLINE_PROJECT_DROPDOWN = "lead/report/lead/dropdown?type=";
export const GOOGLE_LEADS_COUNT = "lead/report/google/leads/count?fromDate=";
export const META_LEADS_COUNT = "lead/report/meta/leads/count?fromDate=";

//Google Apis
export const GET_GOOGLE_ADS = "google/admin/lead/get?empCode=";
export const ASSIGNED_GOOGLE_LEAD = "google/admin/lead/assign?leadId=";
export const GET_ASSIGNED_GOOGLE_ADS = "google/assign/lead/get?empCode=";
export const UPDATE_ASSIGNED_ADS = "google/assign/lead/update?leadId=";
export const GET_ALL_GOOGLE_ADS = "google/admin/lead/getAll";
export const GET_ALL_GOOGLE_PROJECTS = "google/admin/getAll/forms";

//Check User Persmission
export const CHECK_USER_PERMISSION = "user/management/get/user/right";
export const SHARE_LIVE_LOCATION = "user/management/save/user/location?";

//IVR call APIs
export const GET_ALL_IVR_AGENTS = "user/management/ivr/get/all/agents";
export const ADD_IVR_AGENT = "user/management/ivr/add/agent";
export const UPDATE_IVR_AGENT = "user/management/ivr/update/agent";
export const GET_ALL_IVR_USERS = "user/management/ivr/get/ivr/users";
export const IVR_MAKE_CALL = "user/management/ivr/make/call?";
export const IVR_RECORDING = "user/management/ivr/get/all/recording?fromDate=";

//FNF APIs
export const FIND_USER_BY_EMPCODE = "user/management/get/user-details";
export const CHECK_FNF_CREATED = "hr/fnf/get/status?empCode=";
export const SAVE_FNF_DATA = "hr/fnf/create";
export const UPDATE_FNF_DATA = "hr/fnf/add/department-clearance";
export const GET_FNF_LIST_URL = "hr/fnf/get/all";
export const GET_ALL_FNF_LIST_URL = "hr/fnf/get/department-clearance";
export const UPDATE_FNF_HR_DATA = "hr/fnf/update";
export const UPLOAD_FNF_FILE = "hr/fnf/upload"
export const COUNT_FNF_HR = "hr/interview/count"

//KYT
export const GET_KYT_DATA = "user/management/getAssociate/details?";