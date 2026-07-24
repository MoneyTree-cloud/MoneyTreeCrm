/* eslint-disable no-mixed-operators */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useLocation, useNavigate } from "react-router-dom";
import { defaultTheme } from "../../helpers/defaultTheme";
import { formatDateForInput, generateTimestamp, getCurrentDate, WordWrapCell } from "../../helpers/function_helper";
import { CHANGE_STATUS_TO_LIVE, DELETE_FRESH_BOOKING, GET_ALL_FRESH_BOOKING, GET_ALL_MAIN_TEAM_DROPDOWN, GET_ALL_SUB_TEAM_DROPDOWN, GET_ALL_USERS_DROPDOWN, GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_, SAVE_SALE_FORM } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { useGet, usePost } from "../../Hooks/useApi";
import { useUserStore } from "../../store/useUserStore";
import { MdDelete } from "react-icons/md";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import * as XLSX from "xlsx";

const LIMIT = 100;

// Centralize filter options for better maintainability
const sortByTypeGroup = [
  { label: "Fresh ID", value: "saleId" },
  { label: "Client Name", value: "clientName" },
  { label: "Unit No.", value: "unitNo" },
];

const initialFormState = {
  fromDate: "",
  toDate: "",
  builder: null,
  project: null,
  mainTeam: null,
  subTeam: null,
  userList: null
};

export default function FreshBooking() {
  const navigate = useNavigate();
  const location = useLocation();

  // Destructure state from route for cleaner access
  const { formState: routeFormState, page: routePage, searchByGroupSelect: routeSearchByGroupSelect, searchTerm: routeSearchTerm } = location.state || {};

  const { userId, empCode } = useUserStore((state) => state.user);
  const [page, setPage] = useState(routePage || 1);
  const [formState, setFormState] = useState(initialFormState);
  const [searchByGroupSelect, setselectedSearchGroupSelect] = useState(null);
  const [searchTerm, setSearchTerm] = useState(routeSearchTerm || "");
  const [isPending, setIsPending] = useState(false);
  const [saleEntryData, setSaleEntryData] = useState([]);
  const [rowData, setRowData] = useState(null);
  const [accessGranted, setAccessGranted] = useState(null);

  // --- API Data Hooks ---

  // All dependent on accessGranted
  const { data: builderListRaw } = useGet(GET_DROPDOWN_BUILDER_, { enabled: Boolean(accessGranted) });
  const { data: mainTeamsRaw } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN + '?active=false', { enabled: Boolean(accessGranted) });
  const { data: usersListRaw } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: Boolean(accessGranted) });

  // Dependent on formState.builder
  const { data: projectDataRaw } = useGet(`${GET_PROJECT_BY_BUILDER_}${formState?.builder?.value}`, { enabled: Boolean(formState?.builder?.value) });

  // Dependent on formState.mainTeam
  const { data: subTeamsRaw } = useGet(
    `${GET_ALL_SUB_TEAM_DROPDOWN}${formState?.mainTeam?.value}`,
    { enabled: Boolean(formState?.mainTeam) }
  );

  // Memoize dropdown data for safety and performance
  const builderList = useMemo(() => builderListRaw?.data?.data || [], [builderListRaw]);
  const projectData = useMemo(() => projectDataRaw?.data?.data || [], [projectDataRaw]);
  const mainTeams = useMemo(() => mainTeamsRaw?.data?.data || [], [mainTeamsRaw]);
  const subTeams = useMemo(() => subTeamsRaw?.data?.data || [], [subTeamsRaw]);
  const usersList = useMemo(() => usersListRaw?.data?.data || [], [usersListRaw]);

  // --- Helper Functions (Memoized) ---

  const handleFormChange = useCallback((field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const getSaleDetails = useCallback((url) => {
    setIsPending(true);
    ApiClient.get(url)
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          const encryptedContent = response.data.data;
          decryptData(encryptedContent).then(setSaleEntryData).catch(() => setSaleEntryData([]));
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message);
      });
  }, []);

  const getBaseApiUrl = useCallback(({ fromDate, toDate, pageNum, term, searchBy, size = LIMIT, builder, project, mainTeam, subTeam, userList }) => {
    // pageNum - 1 because the API expects 0-based indexing for page
    let apiUrl = `${GET_ALL_FRESH_BOOKING}?fromDateStr=${fromDate}&toDateStr=${toDate}&sortField=createdDate&sortType=desc&page=${pageNum - 1}&size=${size}&saleStatus=YES`;

    if (searchBy && term) apiUrl += `&key=${searchBy.value}&value=${term}`;
    if (builder) apiUrl += `&builderId=${builder}`;
    if (project) apiUrl += `&projectId=${project}`;
    if (mainTeam) apiUrl += `&mainTeam=${mainTeam}`;
    if (subTeam) apiUrl += `&subTeam=${subTeam}`;
    if (userList) apiUrl += `&key=associateId&value=${userList}`;

    return apiUrl;
  }, []);

  const getFromToDate = useCallback(() => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const initialFromDate = "2025-01-01";
    const initialToDate = formatDateForInput(endOfMonth);

    setFormState((prevState) => ({
      ...prevState,
      fromDate: initialFromDate,
      toDate: initialToDate,
    }));

    // Initial data fetch if no route state is present
    if (!routeFormState) {
      const initialUrl = getBaseApiUrl({
        fromDate: initialFromDate,
        toDate: initialToDate,
        pageNum: 1,
        term: "",
        searchBy: null,
      });
      getSaleDetails(initialUrl);
    }
  }, [getBaseApiUrl, getSaleDetails, routeFormState]);

  const handlePaginationData = useCallback((fromDate, toDate, newPage) => {
    const apiUrl = getBaseApiUrl({
      fromDate: fromDate,
      toDate: toDate,
      pageNum: newPage,
      term: searchTerm,
      searchBy: searchByGroupSelect,
      builder: formState.builder?.value,
      project: formState.project?.value,
      mainTeam: formState.mainTeam?.value,
      subTeam: formState.subTeam?.value,
      userList: formState.userList?.value
    });
    getSaleDetails(apiUrl);
  }, [formState.builder, formState.project, formState.mainTeam, formState.subTeam, formState.userList, searchTerm, searchByGroupSelect, getBaseApiUrl, getSaleDetails]);

  // Handler for loading data from route state (when navigating back)
  const hitGetFreshBookingApi = useCallback(() => {
    if (!accessGranted || !routeFormState && !routeSearchByGroupSelect && !routeSearchTerm && !routePage) return;

    // Build the new state object from route state
    let newFormState = {
      fromDate: routeFormState?.fromDate || formState.fromDate,
      toDate: routeFormState?.toDate || formState.toDate,
    };

    // Function to find selected dropdown item
    const findSelected = (value, list) => list?.find((item) => item.value === value?.value);

    newFormState.builder = findSelected(routeFormState?.builder, builderList) || null;
    newFormState.project = findSelected(routeFormState?.project, projectData) || null;
    newFormState.mainTeam = findSelected(routeFormState?.mainTeam, mainTeams) || null;
    newFormState.subTeam = findSelected(routeFormState?.subTeam, subTeams) || null;
    newFormState.userList = findSelected(routeFormState?.userList, usersList) || null;

    // Update local state
    setFormState(newFormState);
    setSearchTerm(routeSearchTerm || "");
    setPage(routePage || 1);

    const currentSearchByGroupSelect = findSelected(routeSearchByGroupSelect, sortByTypeGroup) || null;
    setselectedSearchGroupSelect(currentSearchByGroupSelect);

    // Construct API URL with the new state values
    const apiUrl = getBaseApiUrl({
      fromDate: newFormState.fromDate,
      toDate: newFormState.toDate,
      pageNum: routePage || 1,
      term: routeSearchTerm,
      searchBy: currentSearchByGroupSelect,
      mainTeam: newFormState.mainTeam?.value,
      subTeam: newFormState.subTeam?.value,
      builder: newFormState.builder?.value,
      project: newFormState.project?.value,
      userList: newFormState.userList?.value
    });

    getSaleDetails(apiUrl);
  }, [accessGranted, routeFormState, routeSearchByGroupSelect, routeSearchTerm, routePage, builderList, projectData, mainTeams, subTeams, usersList, getBaseApiUrl, getSaleDetails]);

  // --- API Hooks (Post) ---

  const { isPending: pendingStatus, mutate: mutateUpdateStatus } = usePost(
    `${CHANGE_STATUS_TO_LIVE}${rowData?.id}&loginId=${empCode}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          // Force reload data based on current filters and page
          handlePaginationData(formState.fromDate, formState.toDate, page);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const { isPending: addLoading, mutate: mutateSaveSale } = usePost(
    `${SAVE_SALE_FORM}${userId}`,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          // Only trigger status update if sale save was successful
          mutateUpdateStatus();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  // --- Effects ---

  // Effect 1: Check access and set initial dates/data
  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'fresh-booking');
      setAccessGranted(hasAccess);
      if (hasAccess) {
        getFromToDate();
      }
    };
    checkAccess();
  }, [userId, getFromToDate]);

  // Effect 2: Load data when navigating back (route state changes)
  useEffect(() => {
    // Only run if dependent lists are loaded (to ensure correct lookups in hitGetFreshBookingApi)
    if (accessGranted && builderList.length > 0 && mainTeams.length > 0 && usersList.length > 0) {
      // Small delay to ensure all dependent lists are populated before running the logic in hitGetFreshBookingApi
      const timeoutId = setTimeout(hitGetFreshBookingApi, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [routeSearchByGroupSelect, routeFormState, routeSearchTerm, routePage, accessGranted, builderList, projectData, mainTeams, subTeams, usersList]);

  // Effect 3: Clear dependent dropdowns (Project/SubTeam)
  useEffect(() => {
    setFormState((prev) => {
      let updated = { ...prev };
      let changed = false;

      // If builder is null, clear project
      if (!prev.builder && prev.project !== null) {
        updated.project = null;
        changed = true;
      }

      // If mainTeam is null, clear subTeam
      if (!prev.mainTeam && prev.subTeam !== null) {
        updated.subTeam = null;
        changed = true;
      }

      return changed ? updated : prev;
    });
  }, [formState.builder, formState.mainTeam]);

  // --- Event Handlers (Memoized) ---

  const handleSearchByTypeSelectGroup = useCallback((selectedGroup) => {
    setselectedSearchGroupSelect(selectedGroup);
  }, []);

  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  }, []);

  const handleClearData = useCallback(() => {
    navigate("/fresh-booking", { replace: true });
    getFromToDate(); // This sets initial dates and fetches initial data
    setselectedSearchGroupSelect(null);
    setSearchTerm("");
    setPage(1); // Reset page

    setFormState((prev) => ({
      ...prev,
      builder: null,
      project: null,
      mainTeam: null,
      subTeam: null,
      userList: null
    }));
    const initialFromDate = "2025-01-01"; // Consistent with getFromToDate logic
    const apiUrl = getBaseApiUrl({
      fromDate: initialFromDate,
      toDate: formState.toDate,
      pageNum: 1,
      term: "",
      searchBy: null,
    });
    getSaleDetails(apiUrl);

  }, [navigate, getFromToDate, formState.toDate, getBaseApiUrl, getSaleDetails]);


  const handleShowData = useCallback((event) => {
    event.preventDefault();
    setPage(1); // Reset page to 1 for new search

    const apiUrl = getBaseApiUrl({
      fromDate: formState.fromDate,
      toDate: formState.toDate,
      pageNum: 1, // Always page 1 on search
      term: searchTerm,
      searchBy: searchByGroupSelect,
      builder: formState?.builder?.value,
      project: formState?.project?.value,
      mainTeam: formState?.mainTeam?.value,
      subTeam: formState?.subTeam?.value,
      userList: formState?.userList?.value
    });

    getSaleDetails(apiUrl);
  }, [formState.fromDate, formState.toDate, searchTerm, searchByGroupSelect, getBaseApiUrl, getSaleDetails, formState.builder, formState.project, formState.mainTeam, formState.subTeam, formState.userList]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    handlePaginationData(formState.fromDate, formState.toDate, newPage); // Fetch data for the new page
  }, [formState.fromDate, formState.toDate, handlePaginationData]);

  const handleAddBooking = useCallback(() => {
    navigate("/fresh-booking/fresh-booking-entry", { state: { rowData: {} } });
  }, [navigate]);

  const handleDeleteClick = useCallback((row) => {
    if (!window.confirm("Are you sure you want to delete this Booking?")) return;
    setIsPending(true);
    ApiClient.post(`${DELETE_FRESH_BOOKING}${row.id}&status=NO&loginId=${userId}`)
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          handlePaginationData(formState.fromDate, formState.toDate, page);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message);
      });
  }, [formState.fromDate, formState.toDate, page, userId, handlePaginationData]);

  const handleMoveConfirm = useCallback((row) => {
    // Memoized params object structure for SAVE_SALE_FORM API
    const params = {
      builderName: row.builderName || "",
      projectName: row.projectName || "",
      projectId: row.projectId || 0,
      builderId: row.builderId || 0,
      associateId: row.associateId || 0,
      associateName: row.associateName || "",
      unitId: row.projectunitId || 0,
      projectUnitName: row.projectUnitName,
      clientName: row.clientName,
      clientAddress: row.clientAddress,
      clientPhone: row.clientPhone,
      clientPhone2: row.clientPhone2,
      clientEmail: row.clientEmail,
      clientDob: row.clientDob,
      clientAddharCard: row.clientAddharCard,
      clientPan: row.clientPan,
      coApplicantName: row.coApplicantName,
      coApplicantAddress: row.coApplicantAddress,
      coApplicantPhone: row.coApplicantPhone,
      coApplicantPhone2: row.coApplicantPhone2,
      coApplicantEmail: row.coApplicantEmail,
      coApplicantDob: row.coApplicantDob,
      coApplicantAddharCard: row.coApplicantAddharCard,
      coApplicantPan: row.coApplicantPan,
      bookingStatusId: 4, // Status to move to 'Live'
      locationId: row.locationId,
      bookingDate: getCurrentDate(),
      propTypeId: row.propTypeId,
      saleStatusId: 1,
      schemaIncentiveId: row.schemaIncentiveId,
      incentiveId: row.incentiveId,
      formStageId: 13,
      loanSelfFundingId: row.loanSelfFundingId,
      kycStatusId: 31,
      kycDate: row.kycDate,
      remarks: row.remarks,
      soReceiveDate: row.soReceiveDate,
      soDispatchDate: row.soDispatchDate,
      acceptanceDateByBuilder: row.acceptanceDateByBuilder,
      clientBbaStatus: row.clientBbaStatus,
      ra_percent: row.ra_percent || 0,
      rc_percent: row.rc_percent || 0,
      unitStatus: "sold",
      paymentPlan: row.paymentPlan || "",
      prospectId: row.prospectId,
      prospectName: row.prospectName,
      bookingType: row.bookingType,
      connectBookingStatus: row.connectBookingStatus,
      connectSuspectName: row.connectBookingStatus === 'MTC' ? row.connectSuspectName : "",
      connectSuspectId: row.connectBookingStatus === 'MTC' ? row.connectSuspectId : "",
      bookingRange: row.connectBookingStatus === 'MTC' ? row.bookingRange : "",
      rewardPoint: row?.rewardPoint || 0
    };

    setRowData(row); // Set rowData for use in mutateUpdateStatus dependency
    mutateSaveSale(params);
  }, [mutateSaveSale]);

  const downloadDataExcel = useCallback(() => {
    setIsPending(true);
    // Use totalElements for size to download all data (defaulting to LIMIT if not available)
    const totalSize = saleEntryData?.totalElements || LIMIT;
    let apiUrl = getBaseApiUrl({
      fromDate: formState.fromDate,
      toDate: formState.toDate,
      pageNum: 1, // Start page at 1 for full download
      term: searchTerm,
      searchBy: searchByGroupSelect,
      size: totalSize, // Use total size
      builder: formState?.builder?.value, // Include filter params for download
      project: formState?.project?.value,
      mainTeam: formState?.mainTeam?.value,
      subTeam: formState?.subTeam?.value,
      userList: formState?.userList?.value
    });

    ApiClient.get(apiUrl)
      .then(function (response) {
        setIsPending(false);
        if (response.data.status === 1) {
          const encryptedContent = response?.data?.data;
          decryptData(encryptedContent).then((decrypted) => {
            const d_data = decrypted;
            if (!Array.isArray(d_data?.content) || d_data?.content?.length === 0) {
              toast.info("No data to export.");
              return;
            }

            // Keys to exclude
            const excludedKeys = ['connectBookingStatus', 'connectSuspectId', 'connectSuspectName', "bookingType", "clientAddress", "clientPhone", "clientPhone2", "clientEmail", "clientDob", "clientAddharCard", "coApplicantAddress", "coApplicantPhone", "coApplicantPhone2", "coApplicantEmail", "coApplicantDob", "coApplicantAddharCard", "projectunitId", "bookingStatusId", "locationId", "propTypeId", "saleStatusId", "formStageId", "loanSelfFundingId", "kycStatusId", "paymentPlan", "schemaIncentiveId", "incentiveId"];

            // Format data for XLSX
            const headers = Object.keys(d_data?.content?.[0]).filter(key => !excludedKeys.includes(key));
            const formattedData = d_data?.content?.map((item) => headers.map((header) => item[header]));
            const finalData = [headers, ...formattedData];

            // Create and download the Excel file
            const ws = XLSX.utils.aoa_to_sheet(finalData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Fresh Booking Details");
            XLSX.writeFile(wb, `freshBookingData_${generateTimestamp()}.xlsx`);
          }).catch((error) => {
            toast.error("Decryption failed: " + error.message);
          });
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error("API error: " + error.message);
      });
  }, [formState.fromDate, formState.toDate, searchTerm, searchByGroupSelect, saleEntryData?.totalElements, getBaseApiUrl, formState.builder, formState.project, formState.mainTeam, formState.subTeam, formState.userList]);

  // --- Table Columns (Memoized) ---

  const columns = useMemo(() => ([
    {
      name: <span className="font-weight-bold fs-13">Manage</span>,
      cell: (row) => (
        <i
          title="Manage Booking"
          className="ri-pencil-fill align-bottom me-2"
          onClick={() => {
            navigate("/fresh-booking/fresh-booking-entry", {
              state: {
                rowData: row,
                formState: formState,
                page: page,
                searchByGroupSelect: searchByGroupSelect,
                searchTerm: searchTerm,
              },
            });
          }}
          style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
        ></i>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      cell: (row) => (
        <FaArrowAltCircleRight
          title="Move to Live"
          onClick={() => {
            if (!window.confirm("Are you sure you want to move this booking to live?")) return;
            handleMoveConfirm(row);
          }}
          style={{
            cursor: "pointer",
            color: defaultTheme.primary,
            fontSize: 16,
          }}
        />
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Fresh ID</span>,
      selector: (row) => row.id,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.id}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Complete %</span>,
      selector: (row) => row.bookingCompletePercentage,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.bookingCompletePercentage}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Name</span>,
      selector: (row) => row.associateName,
      sortable: true,
      width: '10%',
      cell: (row) => <WordWrapCell>{row.associateName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">MT/ST</span>,
      selector: (row) => row.mainTeam,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.mainTeam + '/' + row.subTeam}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Prospect Name</span>,
      selector: (row) => row.prospectName,
      sortable: true,
      width: '15%',
      cell: (row) => <WordWrapCell>{row.prospectName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Property Type</span>,
      selector: (row) => row.propTypeName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.propTypeName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Location</span>,
      selector: (row) => row.locationName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.locationName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name</span>,
      selector: (row) => row.builderName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      selector: (row) => row.projectName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.clientName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Unit No.</span>,
      selector: (row) => row.projectUnitName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.projectUnitName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      selector: (row) => row.remarks,
      sortable: true,
      width: '40%',
      cell: (row) => <WordWrapCell>{row.remarks}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      cell: (row) => (
        <MdDelete
          title="Delete Fresh Booking"
          onClick={() => handleDeleteClick(row)}
          style={{ cursor: "pointer", color: "red" }}
          size={20}
        />
      ),
    },
  ]), [navigate, formState, page, searchByGroupSelect, searchTerm, handleDeleteClick, handleMoveConfirm]);

  // --- Conditional Renderings ---

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />;
  }

  const iconStyle = {
    color: defaultTheme.primary,
    cursor: "pointer",
    fontSize: "15px",
  };
  const showLoader = isPending || addLoading || pendingStatus;

  return (
    <PageContent>
      {showLoader && <ScreenLoader />}
      <Breadcrumbs title="Transaction" breadcrumbItem="Fresh Booking" />
      <Container fluid={true}>
        <form onSubmit={handleShowData}>
          <Card>
            <CardBody>
              <Row className="g-3">
                {/* Date Filters */}
                <Col md="2">
                  <h6 className="font-size-11">From Date</h6>
                  <input
                    id="fromDate"
                    className="form-control"
                    type="date"
                    value={formState.fromDate}
                    onChange={handleChange}
                  />
                </Col>
                <Col md="2">
                  <h6 className="font-size-11">To Date</h6>
                  <input
                    id="toDate"
                    className="form-control"
                    type="date"
                    value={formState.toDate}
                    onChange={handleChange}
                  />
                </Col>

                {/* Search Filters */}
                <Col lg="2">
                  <h6 className="font-size-11">Search By</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isClearable
                    value={searchByGroupSelect}
                    onChange={handleSearchByTypeSelectGroup}
                    options={sortByTypeGroup}
                  />
                </Col>
                <Col lg="2">
                  <h6 className=" font-size-12">Search</h6>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Type to search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>

                {/* Dropdown Filters */}
                <Col md="2">
                  <h6 className="font-size-11">Builder</h6>
                  <Select
                    value={formState.builder}
                    onChange={(val) => handleFormChange("builder", val)}
                    options={builderList}
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                  />
                </Col>

                <Col md="2">
                  <h6 className="font-size-11">Project</h6>
                  <Select
                    value={formState.project}
                    onChange={(val) => handleFormChange("project", val)}
                    options={projectData}
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isDisabled={!formState.builder}
                  />
                </Col>
                <Col md="2">
                  <h6 className="font-size-11">Main Team</h6>
                  <Select
                    value={formState.mainTeam}
                    onChange={(val) => handleFormChange("mainTeam", val)}
                    options={mainTeams}
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                  />
                </Col>

                <Col md="2">
                  <h6 className="font-size-11">Sub Team</h6>
                  <Select
                    value={formState.subTeam}
                    onChange={(val) => handleFormChange("subTeam", val)}
                    options={subTeams}
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isDisabled={!formState.mainTeam}
                  />
                </Col>
                <Col md="2">
                  <h6 className="font-size-11">Select Associate</h6>
                  <Select
                    value={formState.userList}
                    onChange={(val) => handleFormChange("userList", val)}
                    options={usersList}
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                  />
                </Col>

                {/* Action Buttons */}
                <Col lg="3" className="d-flex align-items-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Show Data
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={handleClearData}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>

        <div
          className="d-flex align-items-center"
          style={{ marginLeft: "10px", gap: "20px", marginBottom: "20px" }}
        >
          <i
            className="fas fa-plus"
            title="Add Booking"
            style={iconStyle}
            onClick={handleAddBooking}
          ></i>
          {(empCode === '1005' || empCode === '1' || empCode === '1670') &&
            <i
              className="fas fa-file-excel"
              style={iconStyle}
              title="Download Excel"
              onClick={downloadDataExcel}
            />
          }
        </div>

        <AppTable
          progressPending={isPending}
          columns={columns}
          data={saleEntryData?.content}
          pagination
          paginationTotalRows={saleEntryData?.totalElements}
          paginationServer
          onChangePage={handlePageChange}
          conditionalRowStyles={[
            { when: (row) => row.bookingStatusId === 1, style: { color: defaultTheme.redColor } },
            { when: (row) => row.bookingStatusId === 2, style: { color: defaultTheme.primary } },
            { when: (row) => row.bookingStatusId === 3, style: { color: defaultTheme.btnEnable } },
            { when: (row) => row.bookingStatusId === 4, style: { color: defaultTheme.goldColorLogo } },
          ]}
        />
      </Container>
    </PageContent>
  );
}