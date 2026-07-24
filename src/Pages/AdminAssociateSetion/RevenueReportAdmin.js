import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet } from "../../Hooks/useApi";
import {
  ADMIN_REVENUE_REPORT,
  GET_ALL_MAIN_TEAM_DROPDOWN,
  GET_ALL_SUB_TEAM_DROPDOWN,
  REVENUE_REPORT_EXCEL,
} from "../../helpers/url_helper";
import { formatDateForInput } from "../../helpers/function_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import Select from "react-select";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css";
import { toast } from "react-toastify";
import ApiClient from "../../helpers/api_helper";
import PageContent from "../../components/Common/PageContent";

export default function RevenueReportAdmin() {
  const [formState, setFormState] = useState({
    mainTeam: null,
    subTeam: null,
    fromDate: "",
    toDate: "",
    apiUrl: null,
  });
  const LIMIT = 100;
  const [page, setPage] = useState(1);
  const [flag, setFlag] = useState(false);

  const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN);
  const { data: subTeams } = useGet(
    formState.mainTeam
      ? GET_ALL_SUB_TEAM_DROPDOWN + formState.mainTeam.value
      : null,
    { enabled: Boolean(formState.mainTeam) }
  );

  // Fetch meeting data based on apiUrl
  const { data: revenueData, isLoading } = useGet(formState.apiUrl, {
    enabled: Boolean(formState.apiUrl),
  });

  // Calculate the first and last dates of the current month
  useEffect(() => {
    getFromToDate();
  }, []);

  const getFromToDate = () => {
    const now = new Date();

    setFormState((prev) => ({
      ...prev,
      fromDate: formatDateForInput(now),
      toDate: formatDateForInput(now),
    }));
  };

  const handleShowData = () => {
    if (!formState.mainTeam) {
      toast.error("Please Select Main Team First");
      return;
    }
    setPage(1);
    setFormState((prev) => ({
      ...prev,
      apiUrl: `${ADMIN_REVENUE_REPORT}fromdate=${formState.fromDate}&todate=${formState.toDate
        }&mainTeam=${formState?.mainTeam?.value}&subTeam=${formState?.subTeam?.value
        }&offset=${page - 1}&limit=${LIMIT}`,
    }));
  };

  const handlePaginationData = () => {
    setFormState((prev) => ({
      ...prev,
      apiUrl: `${ADMIN_REVENUE_REPORT}fromdate=${formState.fromDate}&todate=${formState.toDate
        }&mainTeam=${formState?.mainTeam?.value}&subTeam=${formState?.subTeam?.value
        }&offset=${page - 1}&limit=${LIMIT}`,
    }));
  };

  useEffect(() => {
    if (flag) {
      handlePaginationData();
    }
  }, [page]);

  const handleClear = () => {
    getFromToDate();
    setFormState((prevState) => ({
      ...prevState,
      mainTeam: null,
      subTeam: null,
    }));
  };

  const downloadUserExcel = () => {
    ApiClient.get(REVENUE_REPORT_EXCEL, { responseType: "arraybuffer" })
      .then(function (response) {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "mainteam_revenue_data.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(function (error) {
        toast.error(error.message);
      });
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (row, index) => index + 1,
      sortable: true,
      width: "10%",
    },
    {
      name: <span className="font-weight-bold fs-13">Main Team</span>,
      selector: (row) => row.mainTeam,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Sub Team</span>,
      selector: (row) => row.subTeam,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Team Strength</span>,
      selector: (row) => row.teamStrength,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Booking Count</span>,
      selector: (row) => row.bookingCount,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Total Revenue</span>,
      selector: (row) => row.totalRevanue,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Per Person Revenue</span>,
      selector: (row) => row.perPesronRevanue,
      sortable: true,
    },
  ];

  return (
    <PageContent>
      {isLoading && <ScreenLoader />}
      <Breadcrumbs title="Admin Associate" breadcrumbItem="Revenue Report" />
      <Container fluid={true}>
        <Card>
          <CardBody>
            <Row>
              <Col lg="3">
                <h6 className="font-size-11">Main Team</h6>
                <Select
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
                      : ""
                  }
                />
              </Col>
              <Col lg="3">
                <h6 className="font-size-11">Sub Team</h6>
                <Select
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
              <Col lg="3">
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
              <Col lg="3 mt-4" className="align-items-center">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleShowData}
                >
                  Show Data
                </button>

                <button
                  type="button"
                  color="secondary"
                  className="btn btn-primary ms-3"
                  onClick={() => handleClear()}
                >
                  Clear
                </button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <i
          className="fas fa-file-excel"
          style={{
            color: defaultTheme.primary,
            cursor: "pointer",
            fontSize: "18px",
            marginBottom: 12,
          }}
          onClick={downloadUserExcel}
        ></i>
        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={
            Array.isArray(revenueData?.data?.data?.content)
              ? revenueData?.data?.data?.content
              : []
          }
          pagination
          paginationTotalRows={revenueData?.data?.data?.totalElements}
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
