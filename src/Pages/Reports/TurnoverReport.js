import { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, Button, Container } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { TURNOVER_REPORT } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { useGet } from "../../Hooks/useApi";
import AppTable from "../../components/Common/Table";
import {
  formatDateForInput,
  formatTurnOver,
  RequiredStar,
  WordWrapCell,
} from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";

const TurnoverReport = () => {
  const [apiUrl, setApiUrl] = useState(null);
  const [reportType, setReportType] = useState("builder");

  const { data: turnoverList, isLoading } = useGet(apiUrl, {
    enabled: Boolean(apiUrl),
  });

  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleShowReport = () => {
    if (!formData.fromDate) {
      toast.error("Please Enter Start Date");
    } else if (!formData.toDate) {
      toast.error("Please Enter End Date");
    } else if (!reportType) {
      toast.error("Please Select Report Type");
    } else {
      setApiUrl(
        `${TURNOVER_REPORT}fromDate=${formData.fromDate}&toDate=${formData.toDate}&reportType=${reportType}`
      );
    }
  };

  const handleClear = () => {
    getFromToDate();
    setReportType("builder");
    setApiUrl(null);
  };

  useEffect(() => {
    getFromToDate();
  }, []);

  const getFromToDate = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);

    setFormData((prev) => ({
      fromDate: formatDateForInput(start),
      toDate: formatDateForInput(now),
    }));
  };

  const builderColumns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name</span>,
      selector: (row) => row.builderName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Total Booking</span>,
      selector: (row) => row.bookingCount,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.bookingCount}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Total Turnover (Cr.)</span>,
      selector: (row) => row.totalTurnOver,
      sortable: true,
      cell: (row) => <WordWrapCell> {formatTurnOver(row.totalTurnOver)}</WordWrapCell>
    }
  ];

  const projectColumns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      sortable: true,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      selector: (row) => row.projectName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name</span>,
      selector: (row) => row.builderName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Total Booking</span>,
      selector: (row) => row.bookingCount,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.bookingCount}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Total Turnover (Cr.)</span>,
      selector: (row) => row.totalTurnOver,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatTurnOver(row.totalTurnOver)}</WordWrapCell>
    },
  ];

  const mainTeamColumns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      sortable: true,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Main Team</span>,
      selector: (row) => row.mainTeam,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.mainTeam}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Total Booking</span>,
      selector: (row) => row.bookingCount,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.bookingCount}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Total Turnover (Cr.)</span>,
      selector: (row) => row.totalTurnOver,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatTurnOver(row.totalTurnOver)}</WordWrapCell>
    },
  ];

  const handleRadioChange = (event) => {
    setReportType(event.target.value);
    setApiUrl(null);
  };

  return (
    <PageContent>
      <Container fluid={true}>
        {isLoading && <ScreenLoader />}
        <Breadcrumbs title="Report" breadcrumbItem="Turnover Report" />
        <Card>
          <CardBody>
            <Row>
              <Col md="2">
                <h6 className="font-size-11">Start Date <RequiredStar /></h6>
                <input
                  type="date"
                  className={`form-control`}
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleInputChange}
                />
              </Col>

              <Col md="2">
                <h6 className="font-size-11">End Date <RequiredStar /></h6>
                <input
                  type="date"
                  className={`form-control`}
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md="4">
                <div className="radio-button-container mt-4">
                  <label className={`radio-label ${reportType === "builder" ? "active" : ""}`}>
                    <input
                      type="radio"
                      value="builder"
                      checked={reportType === "builder"}
                      onChange={handleRadioChange}
                    />
                    Builder Wise
                  </label>
                  <label className={`radio-label ${reportType === "project" ? "active" : ""}`}>
                    <input
                      type="radio"
                      value="project"
                      checked={reportType === "project"}
                      onChange={handleRadioChange}
                    />
                    Project Wise
                  </label>
                  <label className={`radio-label ${reportType === "mainTeam" ? "active" : ""}`}>
                    <input
                      type="radio"
                      value="mainTeam"
                      checked={reportType === "mainTeam"}
                      onChange={handleRadioChange}
                    />
                    Main Team Wise
                  </label>
                </div>
              </Col>

              <Col md="2" className="d-flex align-items-center gap-2">
                <Button
                  onClick={handleShowReport}
                  type="submit"
                  color="primary"
                >
                  Show
                </Button>{" "}
                <Button
                  type="reset"
                  color="secondary"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>

      </Container>
      {Array.isArray(turnoverList?.data?.data) &&
        turnoverList?.data?.data.length > 0 && (
          <AppTable
            progressPending={isLoading}
            columns={
              reportType === "builder"
                ? builderColumns
                : reportType === "project"
                  ? projectColumns
                  : mainTeamColumns
            }
            data={
              Array.isArray(turnoverList?.data?.data)
                ? turnoverList?.data?.data
                : []
            }
            pagination

          />
        )}
    </PageContent>
  );
};

export default TurnoverReport;
