/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet } from "../../Hooks/useApi";
import { ADMIN_ALL_MEETING, ASSCOIATE_MEETING__EXCEL, GET_ALL_MAIN_TEAM_DROPDOWN, GET_ALL_SUB_TEAM_DROPDOWN } from "../../helpers/url_helper";
import { formatDateForInput, formatDateTime, generateTimestamp, WordWrapCell, } from "../../helpers/function_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import Select from "react-select";
import { defaultTheme } from "../../helpers/defaultTheme";
import { MdMobileFriendly } from "react-icons/md";
import "../CSS/styles.css";
import { toast } from "react-toastify";
import ApiClient from "../../helpers/api_helper";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function MeetingDashboardAdmin() {
  const [formState, setFormState] = useState({
    mainTeam: null,
    subTeam: null,
    fromDate: "",
    toDate: "",
    apiUrl: null,
    meetType: null,
  });
  const LIMIT = 100;
  const [page, setPage] = useState(1);
  const [flag, setFlag] = useState(false);
  const [accessGranted, setAccessGranted] = useState(null);
  const [revenueData, setRevenueData] = useState([])

  const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN, { enabled: !!accessGranted });
  const userId = useUserStore((state) => state.user.userId);

  const { data: subTeams } = useGet(
    GET_ALL_SUB_TEAM_DROPDOWN + formState?.mainTeam?.value,
    { enabled: Boolean(formState?.mainTeam) }
  );

  // Fetch meeting data based on apiUrl
  const { data, isLoading } = useGet(formState?.apiUrl, {
    enabled: !!formState.apiUrl,
  });

  useEffect(() => {
    if (data?.data?.status_code === 1) {
      decryptData(data?.data?.object).then((decryptedData) => {
        if (decryptedData) {
          setRevenueData(decryptedData);
        } else {
          setRevenueData([]);
        }
      });
    }
  }, [data]);

  const meetType = [
    { label: "Completed", value: 2 },
    { label: "Rejected", value: 3 },
    { label: "Started", value: 1 },
  ];

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'associate-meeting');
      setAccessGranted(hasAccess);
      if (hasAccess) {
        getFromToDate();
      }
    };
    checkAccess();
  }, [userId]);

  const getFromToDate = () => {
    const now = new Date();
    setFormState((prev) => ({
      ...prev,
      fromDate: formatDateForInput(now),
      toDate: formatDateForInput(now),
    }));
  };

  const handleShowData = (e) => {
    e.preventDefault();
    if (!formState.meetType) {
      toast.error("Please Select Meeting Type");
      return;
    }
    if (!formState.mainTeam) {
      toast.error("Please Select Main Team First");
      return;
    }
    if (!formState.subTeam) {
      toast.error("Please Select Sub Team First");
      return;
    }
    setPage(1);
    setFormState((prev) => ({
      ...prev,
      apiUrl: `${ADMIN_ALL_MEETING}startDate=${formState.fromDate}&endDate=${formState.toDate
        }&teamName=${formState?.subTeam?.value}&meetingStatus=${formState?.meetType?.value
        }&offset=${page - 1}&limit=${LIMIT}`,
    }));
  };

  const handlePaginationData = () => {
    setFormState((prev) => ({
      ...prev,
      apiUrl: `${ADMIN_ALL_MEETING}startDate=${formState.fromDate}&endDate=${formState.toDate
        }&teamName=${formState?.subTeam?.value}&meetingStatus=${formState?.meetType?.value
        }&offset=${page - 1}&limit=${LIMIT}`,
    }));
  };

  useEffect(() => {
    if (flag) {
      handlePaginationData();
    }
  }, [page]);

  const downloadMeetExcel = () => {
    ApiClient.get(ASSCOIATE_MEETING__EXCEL, { responseType: "arraybuffer" })
      .then(function (response) {
        // Check if the response is an Excel file
        const contentType = response.headers["content-type"];

        if (
          contentType !==
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
          // Assuming the response is an error response
          const errorResponse = new TextDecoder("utf-8").decode(
            new Uint8Array(response.data)
          );
          const parsedError = JSON.parse(errorResponse);

          // Check if it has the expected structure
          if (parsedError.status === 0) {
            toast.error(parsedError.message || "Something went wrong!");
          } else {
            toast.error("Unexpected error occurred!");
          }
          return;
        }

        // Proceed to download the Excel file
        const blob = new Blob([response.data], {
          type: contentType,
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `meeting_status_data_${generateTimestamp()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(function (error) {
        console.error("Error occurred:", error); // Log the error for debugging
        toast.error(error.message || "An unexpected error occurred.");
      });
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No</span>,
      selector: (_, index) => index + 1,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Prospects Id</span>,
      selector: (row) => row.prospectId,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.prospectId}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Name</span>,
      selector: (row) => row.loginUserName,
      sortable: true,
      width: "10%",
      cell: (row) => <WordWrapCell>{row.loginUserName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Type</span>,
      selector: (row) => row.meetTypeName,
      sortable: true,
      width: "7%",
      cell: (row) => <WordWrapCell>{row.meetTypeName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.clientName,
      sortable: true,
      width: "10%",
      cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Mobile Number</span>,
      width: "7%",
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
      name: <span className="font-weight-bold fs-13">Occupation</span>,
      selector: (row) => row.occupation,
      sortable: true,
      width: "9%",
      cell: (row) => <WordWrapCell>{row.occupation}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      selector: (row) => row.projectName,
      sortable: true,
      width: "7%",
      cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Budget</span>,
      selector: (row) => row.budgetName,
      sortable: true,
      width: "7%",
      cell: (row) => <WordWrapCell>{row.budgetName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Place</span>,
      selector: (row) => row.meetingPlaceName,
      sortable: true,
      width: "8%",
      cell: (row) => <WordWrapCell>{row.meetingPlaceName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Attempt</span>,
      selector: (row) => row.meetingAttemptName,
      sortable: true,
      width: "6%",
      cell: (row) => <WordWrapCell>{row.meetingAttemptName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Remarks</span>,
      selector: (row) => row.prospectsRemarks,
      sortable: true,
      width: "40%",
      cell: (row) => <WordWrapCell>{row.prospectsRemarks}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Start Time</span>,
      selector: (row) => row.meetingStartAt,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.meetingStartAt ? formatDateTime(row.meetingStartAt) : ""}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting End Time</span>,
      selector: (row) => row.meetingEndAt,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.meetingEndAt ? formatDateTime(row.meetingEndAt) : ""}</WordWrapCell>,
    },
  ];

  const handleCancel = () => {
    setPage(1);
    setFlag(false);
    getFromToDate();
    setFormState({
      mainTeam: null,
      subTeam: null,
      meetType: null,
      apiUrl: null,

    });
  }

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      {isLoading && <ScreenLoader />}
      <Breadcrumbs title="Admin Associate" breadcrumbItem="Associate Meeting" />
      <Container fluid={true}>
        <Card>
          <CardBody>
            <form onSubmit={handleShowData}>
              <Row className="g-3">
                <Col lg="3">
                  <h6 className="font-size-11">Meeting Type</h6>
                  <Select
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    value={formState.meetType}
                    onChange={(selectedOption) =>
                      setFormState((prev) => ({
                        ...prev,
                        meetType: selectedOption,
                      }))
                    }
                    options={meetType}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">Main Team</h6>
                  <Select
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    value={formState.mainTeam}
                    onChange={(selectedOption) =>
                      setFormState((prev) => ({
                        ...prev,
                        mainTeam: selectedOption,
                      }))
                    }
                    options={
                      Array.isArray(mainTeams?.data?.data)
                        ? mainTeams?.data?.data
                        : []
                    }
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">Sub Team</h6>
                  <Select
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    value={formState.subTeam}
                    isDisabled={!formState.mainTeam}
                    onChange={(selectedOption) =>
                      setFormState((prev) => ({
                        ...prev,
                        subTeam: selectedOption,
                      }))
                    }
                    options={
                      Array.isArray(subTeams?.data?.data)
                        ? subTeams?.data?.data
                        : []
                    }
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">From Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    value={formState.fromDate}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        fromDate: e.target.value,
                      }))
                    }
                  />
                </Col>
                <Col lg="3 mt-2">
                  <h6 className="font-size-11">To Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    value={formState.toDate}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        toDate: e.target.value,
                      }))
                    }
                  />
                </Col>
                <Col
                  lg="3"
                  className="align-items-center"
                  style={{ marginTop: 28 }}
                >
                  <div className="d-flex align-items-center">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      onClick={handleShowData}
                    >
                      Show Data
                    </button>

                    <button
                      type="button"
                      style={{ backgroundColor: defaultTheme.goldColorLogo }}
                      className="btn btn-primary ms-3"
                      onClick={() => handleCancel()}
                    >
                      Clear
                    </button>
                  </div>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>
        {revenueData?.content?.length > 0 &&
          <i
            className="fas fa-file-excel"
            style={{
              color: defaultTheme.primary,
              cursor: "pointer",
              fontSize: "16px",
              marginLeft: 12,
              marginBottom: 12,
            }}
            onClick={downloadMeetExcel}
          ></i>
        }
        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={
            Array.isArray(revenueData?.content)
              ? revenueData?.content
              : []
          }
          pagination
          paginationTotalRows={revenueData?.totalElements}
          paginationServer
          onChangePage={(newPage) => {
            setPage(newPage);
            setFlag(true);
          }}

        />
      </Container>
    </PageContent>
  );
}
