import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody, Modal, ModalHeader, ModalBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, formatDateTime, RequiredStar, timeDifference, WordWrapCell } from "../../helpers/function_helper";
import { GET_DEFAULTER_REPORT } from "../../helpers/url_helper";
import { usePost } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css"; // Import your CSS file
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { useUserStore } from "../../store/useUserStore";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function DefaulterReport() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reportType, setReportType] = useState("Sales");
  const [defaulterModalOpen, setDefaulterModalOpen] = useState(false);
  const [defaultersData, setDefaulterData] = useState([]);
  const [mainDefaultersData, setMainDefaulterData] = useState([]);
  const [type, setType] = useState("");

  const [accessGranted, setAccessGranted] = useState(null);
  const userId = useUserStore((state) => state.user.userId);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'defaulter-report');
      setAccessGranted(hasAccess);
      if (hasAccess) {
        setTodayDate();
      }
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
      name: <span className="font-weight-bold fs-13">Main Team</span>,
      selector: (row) => row.mainTeam,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.mainTeam}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Team Size</span>,
      selector: (row) => row.totalTeamSize,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.totalTeamSize}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Present Count</span>,
      selector: (row) => row.notPresent.length,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.totalTeamSize - row.notPresent.length}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Not Present Count</span>,
      selector: (row) => row.notPresent.length,
      sortable: true,
      cell: (row) => (
        <div
          style={{
            wordWrap: "break-word",
            whiteSpace: "normal",
            cursor: "pointer",
            color: defaultTheme.goldColorLogo,
            fontWeight: "bold",
          }}
          onClick={() => {
            setDefaulterData(row.notPresent);
            setDefaulterModalOpen(true);
            setType("notPresent");
          }}
        >
          {row.notPresent.length}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Defaulter Count</span>,
      selector: (row) => row.totalTeamSize,
      sortable: true,
      cell: (row) => (
        <div
          style={{
            wordWrap: "break-word",
            whiteSpace: "normal",
            cursor: "pointer",
            color: defaultTheme.goldColorLogo,
            fontWeight: "bold",
          }}
          onClick={() => {
            setDefaulterData(row.defaulters);
            setDefaulterModalOpen(true);
            setType("defaulters");
          }}
        >
          {row.defaulters.length}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Defaulter %</span>,
      selector: (row) => row.defaulterPercentage,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.defaulterPercentage + " %"}</WordWrapCell>
    },
  ];

  //Defaulter Table
  const columnsDefaulter = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      sortable: true,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Name</span>,
      selector: (row) => row.empName,
      sortable: true,
      width: "40%",
      cell: (row) => <WordWrapCell>{row.empName + " (" + row.empCode + ")"}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Main Team</span>,
      selector: (row) => row.mainTeam,
      sortable: true,
      width: type === "notPresent" ? "26%" : "10%",
      cell: (row) => <WordWrapCell>{row.mainTeam}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Sub Team</span>,
      selector: (row) => row.subTeam,
      sortable: true,
      width: type === "notPresent" ? "26%" : "10%",
      cell: (row) => <WordWrapCell>{row.subTeam}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">In Time</span>,
      selector: (row) => row.time,
      sortable: true,
      width: "20%",
      cell: (row) => <WordWrapCell>{formatDateTime(row.time)?.split(" ")[1] +
        " " +
        formatDateTime(row.time)?.split(" ")[2]}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Time Diff</span>,
      selector: (row) => row.time,
      sortable: true,
      width: "12%",
      cell: (row) => <WordWrapCell>{timeDifference(time, row.time.split(" ")[1])}</WordWrapCell>
    },
  ];

  // Remove last two columns if type is 'defaulters'
  if (type === "notPresent") {
    columnsDefaulter.splice(-2); // Removes the last two columns
  }

  // API call to Show Report
  const { isPending, mutate: showAttendance } = usePost(
    `${GET_DEFAULTER_REPORT}${date}&time=${time}&type=${reportType}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          // setMainDefaulterData(response.data.data);
          const encryptedContent = response.data.data;
          decryptData(encryptedContent).then((decrypted) => {
            setMainDefaulterData(decrypted);
          }).catch((error) => {
            setMainDefaulterData([]);
          });
        }
      },
      onError: (err) => {
        toast.error(err.message);
        setMainDefaulterData([]);
      },
    }
  );

  const setTodayDate = () => {
    const today = new Date(); // Get today's date
    setDate(formatDateForInput(today));
  };

  const handleShowButton = () => {
    if (!date) {
      toast.error("Please Enter Date");
    } else if (!time) {
      toast.error("Please Enter Time");
    } else {
      showAttendance();
    }
  };

  const handleClear = () => {
    setTime("");
    setReportType("Sales");
    setTodayDate();
    setMainDefaulterData([]);
    setDefaulterData([]);
  };

  const handleRadioChange = (event) => {
    setReportType(event.target.value);
  };

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Report" breadcrumbItem="Defaulter" />
      {isPending && <ScreenLoader />}
      <Container fluid={true}>
        <Card>
          <CardBody>
            <Row>
              <Col md="3">
                <h6 className=" font-size-12">Date <RequiredStar /></h6>
                <input
                  className="form-control"
                  type="date"
                  id="date-input-1"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Col>
              <Col md="3">
                <h6 className=" font-size-12">Time <RequiredStar /></h6>
                <input
                  className="form-control"
                  type="time"
                  id="date-input-2"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </Col>
              <Col md="2">
                <div className="radio-button-container mt-4 d-flex align-items-center">
                  <label className={`radio-label ${reportType === "Sales" ? "active" : ""}`}>
                    <input
                      type="radio"
                      value="Sales"
                      checked={reportType === "Sales"}
                      onChange={handleRadioChange}
                    />
                    Sales
                  </label>
                  <label className={`radio-label ${reportType === "Others" ? "active" : ""}`}>
                    <input
                      type="radio"
                      value="Others"
                      checked={reportType === "Others"}
                      onChange={handleRadioChange}
                    />
                    Others
                  </label>
                </div>
              </Col>
              <Col
                md="3"
                className="d-flex align-items-center gap-2"
              >
                <Button
                  color="primary"
                  onClick={handleShowButton}
                >
                  Show
                </Button>
                <Button
                  color="secondary"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
        {mainDefaultersData?.length > 0 && (
          <AppTable
            progressSales={isPending}
            columns={columns}
            data={mainDefaultersData}
            paginationServer
            pagination

          />
        )}
      </Container>

      <Modal
        isOpen={defaulterModalOpen}
        toggle={() => setDefaulterModalOpen(!defaulterModalOpen)}
        style={{
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <ModalHeader toggle={() => setDefaulterModalOpen(!defaulterModalOpen)}>
          {`${type === "notPresent" ? "Not Present List" : "Defaulters List"
            } (${defaultersData.length})`}
        </ModalHeader>
        <ModalBody>
          <AppTable
            progressSales={isPending}
            columns={columnsDefaulter}
            data={defaultersData}
            pagination

          />
        </ModalBody>
      </Modal>
    </PageContent>
  );
}
