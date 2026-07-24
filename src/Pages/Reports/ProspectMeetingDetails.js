import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { GET_ALL_PROSPECT_DETAILS_BY_PROS_ID, GET_PROSPECT_MEETING_DETAILS } from "../../helpers/url_helper";
import { usePost } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css"; // Import your CSS file
import { toast } from "react-toastify";
import { formatActionType, formatDate, formatDateTime, getDaysAgo, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";
import PermissionMissing from "../Utility/PermissonMissing";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { decryptData } from "../../components/Common/CryptoUtils";
import ApiClient from "../../helpers/api_helper";
import { MdMobileFriendly } from "react-icons/md";
import { defaultTheme } from "../../helpers/defaultTheme";

export default function ProspectMeetingDetails() {
  const [mobile, setMobile] = useState("");
  const [reportType, setReportType] = useState("Prospects");
  const [prospectData, setProspectData] = useState([]);
  const [meetingData, setMeetingData] = useState([]);
  const [suspectData, setSuspectData] = useState([]);
  const [accessGranted, setAccessGranted] = useState(null);
  const userId = useUserStore((state) => state.user.userId);
  const [searchBy, setSearchBy] = useState("mobile"); // mobile | prospect | Suspect
  const [prospectId, setProspectId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allProspectData, setAllProspectData] = useState({});

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'prospect-meeting-details-report');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      selector: (row) => row.associateName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.associateName + " (" + row.associateId + ")"}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">MT/ST</span>,
      selector: (row) => row.mainTeam,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.mainTeam + '/' + row.subTeam}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.clientName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Created Date</span>,
      selector: (row) => row.totalTeamSize,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDate(row.createdDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Type</span>,
      selector: (row) => row.typeName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.typeName}</WordWrapCell>,
    },
  ];

  const columnsMeet = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      selector: (row) => row.associateId,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.loginUserName + " (" + row.associateId + ")"}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">MT/ST</span>,
      selector: (row) => row.mainTeam,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.mainTeam + '/' + row.subTeam}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.clientName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Start Date</span>,
      selector: (row) => row.meetingStartAt,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.meetingStartAt)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting End Date</span>,
      selector: (row) => row.meetingEndAt,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.meetingEndAt)}</WordWrapCell>,
    },
  ];

  const columnsSuspect = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      selector: (row) => row.associateId,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.associateName + " (" + row.associateId + ")"}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Created At</span>,
      selector: (row) => row.createdDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">MT/ST</span>,
      selector: (row) => row.mainTeam,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.mainTeam + '/' + row.subTeam}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.clientName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Status</span>,
      selector: (row) => row.meetingEndAt,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatActionType(row.status)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Suspect Type</span>,
      selector: (row) => row.suspectType,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatActionType(row.suspectType)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Status Update Date</span>,
      selector: (row) => row.statusUpdateDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.statusUpdateDate)}</WordWrapCell>,
    }
  ];

  // API call to Show Report
  const { isPending, mutate: findMeetProsDetails } = usePost(
    `${GET_PROSPECT_MEETING_DETAILS}${mobile}&type=${reportType === "Prospects" ? "0" : reportType === "Suspects" ? "2" : "1"}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          const encryptedContent = response.data.data;
          decryptData(encryptedContent).then((decrypted) => {
            if (reportType === "Prospects") {
              setProspectData(decrypted);
            } else if (reportType === 'Meeting') {
              setMeetingData(decrypted);
            } else {
              setSuspectData(decrypted)
            }
          }).catch((error) => {
            setProspectData([])
            setMeetingData([])
            setSuspectData([])
          });
        }
        else {
          if ((response.data.message === 'No Prospects Found.' && reportType === "Prospects")) {
            toast.error('No Prospects Found With Mobile Number ' + mobile);
          }
          else if ((response.data.message === 'No Prospects Found.' && reportType === "Meeting")) {
            toast.error('No Meeting Found With Mobile Number ' + mobile);
          }
          else if ((response.data.message === 'No Suspects Found.' && reportType === "Suspects")) {
            toast.error('No Suspect Found With Mobile Number ' + mobile);
          }
          else {
            toast.error(response.data.message);
          }
          setProspectData([])
          setMeetingData([])
          setSuspectData([])
        }
      },
      onError: (err) => {
        toast.error(err.message);
        setProspectData([]);
        setMeetingData([]);
        setSuspectData([])
      },
    }
  );

  const handleShowButton = (e) => {
    e.preventDefault();

    if (searchBy === "mobile") {
      if (!mobile) {
        toast.error("Please Enter Mobile Number");
        return;
      }
      if (mobile.length < 10) {
        toast.error("Please Enter Valid Mobile Number");
        return;
      }
      findMeetProsDetails();

    }

    if (searchBy === "prospect") {
      if (!prospectId) {
        toast.error("Please Enter Prospect ID");
        return;
      }
      findProsWithProspectId();
    }

  };

  const findProsWithProspectId = () => {
    setIsLoading(true);
    ApiClient.get(GET_ALL_PROSPECT_DETAILS_BY_PROS_ID + prospectId)
      .then(function (response) {
        setIsLoading(false);
        if (response?.data) {
          decryptData(response?.data).then((decryptedData) => {
            if (decryptedData) {
              setAllProspectData(decryptedData);
            } else {
              setAllProspectData({})
            }
          });
        }

      })
      .catch(function (error) {
        setIsLoading(false);
        toast.error(error.message);
      });
  }

  const handleClear = () => {
    setMobile("");
    setReportType("Prospects");
    setProspectData([]);
    setMeetingData([]);
    setSuspectData([])
    setAllProspectData({});
    setProspectId("");
  };

  const handleRadioChange = (event) => {
    setReportType(event.target.value);
  };

  const days = allProspectData?.createdDate ? getDaysAgo(allProspectData?.createdDate) : null;

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Report" breadcrumbItem="Search Report" />
      {(isPending || isLoading) && <ScreenLoader />}
      <Container fluid={true}>
        <Card>
          <CardBody>
            <form onSubmit={handleShowButton}>

              {/* Search By */}
              <Row className="mb-3">
                <Col md="12" className="d-flex">
                  <label className="me-4">
                    <input
                      type="radio"
                      value="mobile"
                      checked={searchBy === "mobile"}
                      onChange={(e) => setSearchBy(e.target.value)}
                    />{" "}
                    Search By Mobile
                  </label>

                  <label>
                    <input
                      type="radio"
                      value="prospect"
                      checked={searchBy === "prospect"}
                      onChange={(e) => setSearchBy(e.target.value)}
                    />{" "}
                    Search By Prospect ID
                  </label>
                </Col>
              </Row>

              <Row>
                {searchBy === "mobile" && (
                  <Col md="6">
                    <h6 className="font-size-11">Mobile Number <RequiredStar /></h6>
                    <input
                      className="form-control"
                      type="text"
                      maxLength={10}
                      placeholder="Enter Mobile Number..."
                      value={mobile}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, "");
                        setMobile(numericValue.slice(0, 10));
                      }}
                    />
                  </Col>
                )}

                {searchBy === "prospect" && (
                  <Col md="6">
                    <h6 className="font-size-11">Prospect ID (Format : PI/1000/2025/286818)<RequiredStar /></h6>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter Prospect ID..."
                      value={prospectId}
                      onChange={(e) => setProspectId(e.target.value)}
                    />
                  </Col>
                )}

                {searchBy === "mobile" && (
                  <Col md="4" className="d-flex align-items-end">
                    <div className="radio-button-container mt-4 d-flex align-items-center justify-content-center">
                      <label className={`radio-label ${reportType === "Prospects" ? "active" : ""}`}>
                        <input
                          type="radio"
                          value="Prospects"
                          checked={reportType === "Prospects"}
                          onChange={handleRadioChange}
                        />
                        Prospects
                      </label>

                      <label className={`radio-label ${reportType === "Suspects" ? "active" : ""}`}>
                        <input
                          type="radio"
                          value="Suspects"
                          checked={reportType === "Suspects"}
                          onChange={handleRadioChange}
                        />
                        Suspects
                      </label>

                      <label className={`radio-label ${reportType === "Meeting" ? "active" : ""}`}>
                        <input
                          type="radio"
                          value="Meeting"
                          checked={reportType === "Meeting"}
                          onChange={handleRadioChange}
                        />
                        Meetings
                      </label>
                    </div>
                  </Col>
                )}

                <Col
                  md="2"
                  className={`d-flex ${searchBy === "mobile" ? "align-items-center" : "align-items-end"}`}
                >
                  <Button
                    color="primary"
                    type="submit"
                    onClick={handleShowButton}
                    className="me-2"
                  >
                    Show
                  </Button>
                  <Button
                    color="secondary"
                    type="button"
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>

        {searchBy === "prospect" &&
          allProspectData &&
          Object.keys(allProspectData).length > 0 && (
            <Row className="mt-4">
              <Col md="8" lg="12">
                <Card className="border-0 shadow-sm">
                  <CardBody>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0 text-primary fw-semibold">
                        Prospect Summary
                      </h5>
                    </div>

                    <Row className="gy-3">
                      {/* Client Name */}
                      <Col md="3">
                        <div className="d-flex align-items-start">
                          <div className="me-2 text-primary fs-5">
                            <i className="bx bx-user" />
                          </div>
                          <div>
                            <small className="text-muted">Client Name</small>
                            <div className="fw-semibold text-dark">
                              {allProspectData?.clientName}
                            </div>
                          </div>
                        </div>
                      </Col>

                      {/* Created Date */}
                      <Col md="3">
                        <div className="d-flex align-items-start">
                          <div className="me-2 text-warning fs-5">
                            <i className="bx bx-calendar" />
                          </div>
                          <div>
                            <small className="text-muted">Created Date</small>
                            <div className="fw-semibold text-dark">
                              {formatDateTime(allProspectData?.createdDate)} {days !== null ? `(Aging : ${days} days)` : ''}
                            </div>
                          </div>
                        </div>
                      </Col>

                      {/* Phone */}
                      <Col md="3">
                        <div className="d-flex align-items-start">
                          <div className="me-2 text-info fs-5">
                            <i className="bx bx-phone" />
                          </div>
                          <div>
                            <small className="text-muted">Phone Number</small>
                            <div className="phone-container">
                              <MdMobileFriendly
                                className="phone-icon"
                                color={defaultTheme.goldColorLogo}
                              />
                              <span className="phone-number">
                                {allProspectData?.phoneNo}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Col>

                      <Col md="3">
                        <div className="d-flex align-items-start">
                          <div className="me-2 text-primary fs-5">
                            <i className="bx bx-user" />
                          </div>
                          <div>
                            <small className="text-muted">Transferred</small>
                            <div className="fw-semibold text-dark">
                              {allProspectData?.transferred === 1 ? "Yes" : "No"}
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}

        {searchBy === "mobile" &&
          (
            (reportType === "Prospects" && prospectData.length > 0) ||
            (reportType === "Meeting" && meetingData.length > 0) ||
            (reportType === "Suspects" && suspectData.length > 0)
          ) && (
            <AppTable
              progressProspects={isPending}
              columns={
                reportType === "Prospects"
                  ? columns
                  : reportType === "Meeting"
                    ? columnsMeet
                    : columnsSuspect
              }
              data={
                reportType === "Prospects"
                  ? prospectData
                  : reportType === "Meeting"
                    ? meetingData
                    : suspectData
              }
              paginationServer
              pagination
            />
          )
        }

      </Container>
    </PageContent>
  );
}
