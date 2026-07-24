import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDate, formatDateForInput } from "../../helpers/function_helper";
import { SHOW_MEETING_DASHBOARD_REPORT } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";

export default function MeetingDashboard() {
  const [formState, setFormState] = useState({
    reportType: null,
    fromDate: "",
    toDate: "",
    apiUrl: "",
  });

  useEffect(() => {
    getFromToDate();
  }, []);

  const getFromToDate = () => {
    const now = new Date();
    setFormState((prev) => ({
      ...prev,
      fromDate: formatDateForInput(now),
      toDate: formatDateForInput(now),
      apiUrl: `${SHOW_MEETING_DASHBOARD_REPORT}${formatDateForInput(
        now
      )}&toDate=${formatDateForInput(now)}`,
    }));
  };

  const { data: meetingDashData, isLoading } = useGet(formState.apiUrl, {
    enabled: Boolean(formState.apiUrl),
  });

  function handleInputChange(event) {
    const { id, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  }

  const handleShowData = () => {
    setFormState((prev) => ({
      ...prev,
      apiUrl: `${SHOW_MEETING_DASHBOARD_REPORT}${formState.fromDate}&toDate=${formState.toDate}`,
    }));
  };

  const transformData = (data) => {
    if (data.length === 0) return { columns: [], rows: [] };

    const firstItem = data[0];
    const dateKeys = Object.keys(firstItem).filter(
      (key) => key !== "login_user_name" && key !== "user_id"
    );

    const columns = [
      {
        name: "Name",
        selector: (row) => row.login_user_name,
        sortable: true,
        // width:'3%',
        cell: (row) => (
          <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
            {row.login_user_name}
          </div>
        ),
      },
      {
        name: "ID",
        selector: (row) => row.user_id,
        sortable: true,
        cell: (row) => (
          <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
            {row.user_id}
          </div>
        ),
      },
      ...dateKeys.map((key) => ({
        name: <span className="font-weight-bold fs-13">{formatDate(key)}</span>, // JSX span for the date key
        selector: (row) => row[key], // Using the dynamic key for the row data
        sortable: true,
      })),
    ];
    // Map rows to ensure all date keys are available
    const rows = data.map((item) => {
      const row = {
        login_user_name: item.login_user_name,
        user_id: item.user_id,
      };
      dateKeys.forEach((key) => {
        row[key] = item[key] || 0; // Default to 0 if value is undefined
      });
      return row;
    });

    return { columns, rows };
  };

  const { columns, rows } = transformData(
    Array.isArray(meetingDashData?.data?.data)
      ? meetingDashData?.data?.data
      : []
  );

  return (
     <PageContent>
        <Breadcrumbs title="Reports" breadcrumbItem="Meeting Dashboard" />
        {isLoading && <ScreenLoader />}
        <Container fluid={true}>
          <Card>
            <CardBody>
              <Row>
                <Col lg="5">
                  <h6 className="font-size-11">From Date</h6>
                  <input
                    className="form-control"
                    id="fromDate"
                    type="date"
                    placeholder="From Date"
                    value={formState.fromDate}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col lg="5">
                  <h6 className="font-size-11">To Date</h6>
                  <input
                    className="form-control"
                    id="toDate"
                    type="date"
                    placeholder="To Date"
                    value={formState.toDate}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col
                  lg="2"
                  className="d-flex justify-content-center align-items-center mt-3"
                >
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleShowData}
                  >
                    Show Data
                  </button>
                </Col>
              </Row>
            </CardBody>
          </Card>
          {/* <i
            className="fas fa-file-excel mb-3"
            style={{
              color: defaultTheme.primary,
              cursor: "pointer",
              fontSize: "18px",
            }}
            onClick={() => alert("Excel download...")}
          ></i> */}
          <AppTable
            progressPending={isLoading}
            columns={columns}
            data={rows}
            pagination
          />
        </Container>
     </PageContent>
  );
}
