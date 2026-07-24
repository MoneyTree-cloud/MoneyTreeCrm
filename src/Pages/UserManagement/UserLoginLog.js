/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import { useRawGet } from "../../Hooks/useApi";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { defaultTheme } from "../../helpers/defaultTheme";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { USER_LOGIN_LOG, USER_LOGIN_LOG_EXCEL } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { useUserStore } from "../../store/useUserStore";
import PermissionMissing from "../Utility/PermissonMissing";
import { formatDateForInput, generateTimestamp } from "../../helpers/function_helper";

export default function UserLoginLog() {
  const [accessGranted, setAccessGranted] = useState(null);
  const userId = useUserStore((state) => state.user.userId);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'user-login-log');
      setAccessGranted(hasAccess);
      if (hasAccess) {
        getInitialData(); // Fetch initial data if access is granted
      }
    };
    checkAccess();
  }, [userId]);

  const buildApiUrl = (from, to) => `${USER_LOGIN_LOG}${from}&toDate=${to}`;
  const { data: userLoginData, isLoading } = useRawGet(apiUrl, { enabled: Boolean(apiUrl && accessGranted), });

  const columns = [
    {
      name: <span className="font-weight-bold fs-11">SL No.</span>,
      selector: (_, index) => index + 1,
      width: '10%'
    },
    {
      name: <span className="font-weight-bold fs-11">Emp Code</span>,
      selector: (row) => row.userId,
      sortable: true
    },
    {
      name: <span className="font-weight-bold fs-11">Login Datetime</span>,
      selector: (row) => row.loginDate,
      sortable: true
    },
  ];

  const getInitialData = () => {
    const today = new Date();

    // Format today's date using your existing helper
    const formattedToday = formatDateForInput(today);

    setFromDate(formattedToday);
    setToDate(formattedToday);
    setApiUrl(buildApiUrl(formattedToday, formattedToday));
  };

  const handleShowButton = (e) => {
    e.preventDefault();
    setApiUrl(buildApiUrl(fromDate, toDate));
  };

  const downloadUserExcel = () => {
    setIsPending(true);
    ApiClient.get(`${USER_LOGIN_LOG_EXCEL}${fromDate}&toDate=${toDate}`, { responseType: "arraybuffer" })
      .then(function (response) {
        setIsPending(false);
        if (response.data.status === 0) {
          toast.error(response.data.message)
          return
        }
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `user_login_logs_data_${generateTimestamp()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message);
      });
  };

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      {(isLoading || isPending) && <ScreenLoader />}
      <Breadcrumbs title="User Management" breadcrumbItem="User Login Log" />
      <Card>
        <CardBody>
          <form onSubmit={handleShowButton}>
            <Row className="g-2">
              <Col md="4">
                <h6 className="font-size-11">From Date</h6>
                <input
                  className="form-control"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Col>
              <Col md="4">
                <h6 className="font-size-11">To Date</h6>
                <input
                  className="form-control"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Col>
              <Col md="4" className="d-flex align-items-end justify-content-start">
                <Button
                  color="primary"
                  onClick={handleShowButton}
                  type="submit"
                  className="ms-2 me-2"
                >
                  Show
                </Button>
                <Button
                  color="secondary"
                  onClick={getInitialData}
                  type="reset"
                >
                  Reset
                </Button>
              </Col>
            </Row>
          </form>
        </CardBody>
      </Card>
      {userLoginData?.data?.list?.length > 0 && (
        <i
          className="fas fa-file-excel"
          style={{
            color: defaultTheme.primary,
            cursor: "pointer",
            fontSize: "16px",
            marginLeft: 12,
            marginBottom: 12,
          }}
          onClick={downloadUserExcel}
        ></i>
      )}
      <Container fluid={true}>
        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={
            Array.isArray(userLoginData?.data?.list)
              ? userLoginData?.data?.list
              : []
          }
          pagination
        />
      </Container>
    </PageContent>
  );
}
