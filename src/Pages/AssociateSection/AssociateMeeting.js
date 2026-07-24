/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from "react";
import { Card, CardBody, Col, Container, Input, Label, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Select from "react-select";
import { useGet } from "../../Hooks/useApi";
import { GET_ALL_ASSOCIATE_MEETING_DETAILS, GET_MY_TEAM, PROJECT_ID_NAME_DROPDOWN } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import { defaultTheme } from "../../helpers/defaultTheme";
import { formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { toast } from "react-toastify";
import { MdMobileFriendly } from "react-icons/md";
import "../CSS/styles.css";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function AssociateMeeting() {
  const { userId } = useUserStore((state) => state.user);
  const LIMIT = 100;
  const [page, setPage] = useState(1);
  const [meetingData, setMeetingData] = useState([]);
  const [allDataStatus, setAllDataStatus] = useState("NO");
  const [isPending, setIsPending] = useState(false);

  const [formState, setFormState] = useState({
    associateType: null,
    fromDate: "",
    toDate: "",
    searchBy: null,
    searchText: "",
    meetingStatus: null,
    project : null,
  });

  const { data: associateList } = useGet(GET_MY_TEAM + userId);
    const { data: projectData } = useGet(PROJECT_ID_NAME_DROPDOWN);

  const getMeetDetails = useCallback(async (apiUrl) => {
    setIsPending(true);
    try {
      const response = await ApiClient.get(apiUrl);
      setIsPending(false);
      if (response.data.status === 1) {
        const decrypted = await decryptData(response.data.data);
        setMeetingData(decrypted);
      } else if (response.data.message !== 'No record found.') {
        toast.error(response.data.message);
      }
    } catch (error) {
      setIsPending(false);
      toast.error(error.message);
    }
  }, []);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "4%",
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting ID</span>,
      selector: (row) => row.meetingId,
      width: "7%",
      sortable: true,
      cell: (row) => <WordWrapCell>{row.meetingId}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      selector: (row) => row.loginUserName,
      width: "8%",
      sortable: true,
      cell: (row) => <WordWrapCell>{row.loginUserName + ' (' + row.empCode + ')'}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Sub Team</span>,
      selector: (row) => row.subTeam,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.subTeam}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Prospects ID</span>,
      selector: (row) => row.prospectId,
      width: "11%",
      sortable: true,
      cell: (row) => <WordWrapCell>{row.prospectId}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Status</span>,
      selector: (row) => row.meetingStatusId,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.meetingStatusId}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Type</span>,
      selector: (row) => row.meetTypeName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.meetTypeName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Self/Senior</span>,
      selector: (row) => row.finalSaleClosedBy,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.finalSaleClosedBy || '-'}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.clientName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Mobile No.</span>,
      selector: (row) => row.phoneNo,
      cell: (row) => (
        <div className="phone-container">
          <MdMobileFriendly
            className="phone-icon"
            color={defaultTheme.goldColorLogo}
          />
          <span className="phone-number">{row.phoneNo}</span>
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Project</span>,
      selector: (row) => row.projectName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Budget</span>,
      selector: (row) => row.budgetName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.budgetName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Time</span>,
      selector: (row) => row.meetingTimeRange,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.meetingTimeRange}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Client Address</span>,
      selector: (row) => row.address,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.address}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Occupation</span>,
      selector: (row) => row.occupation,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.occupation}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Place</span>,
      selector: (row) => row.meetingPlaceName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.meetingPlaceName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Attempt</span>,
      selector: (row) => row.meetingAttemptName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.meetingAttemptName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Site Visit Status</span>,
      selector: (row) => row.siteVisitStatusName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.siteVisitStatusName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      selector: (row) => row.overAllRemarks,
      width: "50%",
      sortable: true,
      cell: (row) => <WordWrapCell>{row.overAllRemarks}</WordWrapCell>
    }
  ];

  const sortByTypeGroup = [
    { label: "Prospect ID", value: "prospectId" },
    { label: "Meeting Status", value: "allDataStatusId" },
  ];

  const handleFormChange = (event) => {
    const { id, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSelectChange = (name) => (selectedOption) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: selectedOption,
    }));
  };

  const handlePaginationData = useCallback((page) => {
    const baseApiUrl = `${GET_ALL_ASSOCIATE_MEETING_DETAILS}associateId=${formState?.associateType ? formState.associateType?.value : userId}&fromDateStr=${formState.fromDate}&toDateStr=${formState.toDate}&sortField=meetingDueDate&sortType=desc&page=${page - 1}&size=${LIMIT}&allData=${allDataStatus === 'NO' ? false : true}`;

    const searchParams =
      formState?.searchBy?.value && formState?.searchText
        ? `&key=${formState.searchBy.value}&value=${formState.searchText}`
        : "";
    const meetingFilter = formState?.meetingStatus ? `&key=meetingStatusId&value=${formState?.meetingStatus?.value}` : ""
    const projectFilter = formState?.project ? `&projectName=${formState?.project?.label}` : ""
    getMeetDetails(baseApiUrl + searchParams + meetingFilter + projectFilter);
  }, [formState, page, userId, getMeetDetails, allDataStatus]);

  const clickHandler = (e) => {
    e.preventDefault();
    if (formState.searchBy && !formState.searchText) {
      toast.error("Please Enter Value To Search");
    } else {
      handlePaginationData(page);
    }
  };

  const handleToggle = (e) => {
    const isChecked = e.target.checked;
    setAllDataStatus(isChecked ? "YES" : "NO");
  };

  useEffect(() => {
    const now = new Date();
    setFormState((prevState) => ({
      ...prevState,
      fromDate: formatDateForInput(now),
      toDate: formatDateForInput(now),
    }));
    getMeetDetails(`${GET_ALL_ASSOCIATE_MEETING_DETAILS}associateId=${userId}&fromDateStr=${formatDateForInput(now)}&toDateStr=${formatDateForInput(now)}&sortField=meetingDueDate&sortType=desc&page=${page - 1}&size=${LIMIT}&allData=${allDataStatus === 'NO' ? false : true}`);
  }, [userId, getMeetDetails]);

  const meetingStatusGroup = [
    { label: 'Start', value: 'start' },
    { label: 'Cancel', value: 'cancel' },
    { label: 'End', value: 'end' },
  ]

  return (
    <PageContent>
      <Breadcrumbs title="Associate" breadcrumbItem="Meeting" />
      {isPending && <ScreenLoader />}
      <Container fluid={true}>
        <Card>
          <CardBody>
            <form onSubmit={clickHandler}>
              <Row className="g-4">
                <Col lg="2">
                  <h6 className="font-size-11">From Date</h6>
                  <input className="form-control" id="fromDate" type="date" value={formState.fromDate} onChange={handleFormChange} />
                </Col>
                <Col lg="2">
                  <h6 className="font-size-11">To Date</h6>
                  <input className="form-control" id="toDate" type="date" value={formState.toDate} onChange={handleFormChange} />
                </Col>
                <Col lg="2">
                  <h6 className="font-size-11">Search By</h6>
                  <Select style={{ zIndex: 9999 }} menuPortalTarget={document.body} value={formState.searchBy} onChange={handleSelectChange("searchBy")} options={sortByTypeGroup} isClearable />
                </Col>
                <Col lg="2">
                  <h6 className="font-size-11">Search</h6>
                  <input className="form-control" id="searchText" type="text" value={formState.searchText} onChange={handleFormChange} placeholder="Type to search..." />
                </Col>
                <Col lg="2">
                  <h6 className="font-size-11">Select Associate</h6>
                  <Select isClearable style={{ zIndex: 9999 }} menuPortalTarget={document.body} value={formState.associateType} onChange={handleSelectChange("associateType")} options={associateList?.data?.data || []} />
                </Col>
                <Col lg="2">
                  <h6 className="font-size-11">Select Meeting Status</h6>
                  <Select isClearable style={{ zIndex: 9999 }} menuPortalTarget={document.body} value={formState.meetingStatus} onChange={handleSelectChange("meetingStatus")} options={meetingStatusGroup || []} />
                </Col>

                 <Col lg="2">
                  <h6 className="font-size-11">Select Project</h6>
                  <Select isClearable style={{ zIndex: 9999 }} menuPortalTarget={document.body} value={formState.project} onChange={handleSelectChange("project")} options={Array.isArray(projectData?.data?.data)?projectData?.data?.data : []} />
                </Col>
                <Col lg="3" className="d-flex align-items-end">
                  <Label>
                    <Input
                      type="checkbox"
                      name="messageStatus"
                      style={{ cursor: "pointer" }}
                      checked={allDataStatus === "YES"}
                      onChange={handleToggle}
                    />
                    <span style={{ marginLeft: 5, cursor: 'pointer' }}>All Data</span>
                  </Label>
                  <button type="submit" className="btn btn-primary ms-2">Show</button>
                </Col>

              </Row>
            </form>
          </CardBody>
        </Card>

        <AppTable
          columns={columns}
          data={meetingData?.content}
          pagination
          paginationServer
          paginationTotalRows={meetingData.totalElements}
          onChangePage={(newPage) => {
            setPage(newPage);
            handlePaginationData(newPage)
          }}
        />
      </Container>
    </PageContent>
  );
}