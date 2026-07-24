/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { formatDateForInput } from "../../helpers/function_helper";
import { GET_ALL_MAIN_TEAM_DROPDOWN, USER_PERFORMANCE_REPORT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import ProgressReportModal from "./ProgressReportModal";
import Select from "react-select";
import { useGet } from "../../Hooks/useApi";

export default function AllUsersPerformanceReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isPending, setIsPending] = useState(false)
  const [accessGranted, setAccessGranted] = useState(null);
  const userId = useUserStore((state) => state.user.userId);
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [reportId, setReportId] = useState(null);
  const [selectedMainTeam, setSelectedMainTeam] = useState(null);
  const [activeStatus, setActiveStatus] = useState(false); // Default All
  const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN + '?active=false', { enabled: !!accessGranted });

  const closeModal = () => {
    setModalVisible(false); // Close the modal
  };

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'user-performance-report');
      setAccessGranted(hasAccess);
      if (hasAccess) {
        setTodayDate();
      }
    };
    checkAccess();
  }, [userId]);

  const getPerformanceDetails = (fromDate, toDate, activeStatus) => {
    setIsPending(true);

    let url =
      USER_PERFORMANCE_REPORT +
      `${fromDate}&toDate=${toDate}&allActive=${activeStatus ? 'NO' : 'YES'}`;

    if (selectedMainTeam?.value) {
      url += `&mainTeam=${selectedMainTeam.value}`;
    }

    ApiClient.get(url)
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          setReportId(response.data.data);
          setModalVisible(true);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message);
      });
  };

  const setTodayDate = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setFromDate(formatDateForInput(startOfMonth));
    setToDate(formatDateForInput(today));
  };

  const handleShowButton = (e) => {
    e.preventDefault()
    if (!fromDate) {
      toast.error("Please Enter Start Date");
    } else if (!toDate) {
      toast.error("Please Enter End Date");
    } else {
      getPerformanceDetails(fromDate, toDate, activeStatus);
    }
  };

  const handleClear = () => {
    setTodayDate();
    setActiveStatus(true)
    setSelectedMainTeam(null);
  };

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Report" breadcrumbItem="Performance" />
      {isPending && <ScreenLoader />}
      <Container fluid={true}>
        <Card>
          <CardBody>
            <form onSubmit={handleShowButton}>
              <Row className="g-2">
                <Col md="2">
                  <h6 className=" font-size-12">From Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    id="date-input-1"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Col>
                <Col md="2">
                  <h6 className=" font-size-12">To Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    id="date-input-2"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Col>
                <Col md="3">
                  <h6 className="font-size-12">Main Team</h6>
                  <Select
                    value={selectedMainTeam}
                    onChange={setSelectedMainTeam}
                    options={mainTeams?.data?.data || []}
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                  />
                </Col>
                <Col md="3">
                  <h6 className="font-size-12">Users</h6>
                  <div className="d-flex align-items-center mt-2">

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="allUsers"
                        checked={activeStatus === false}
                        onChange={() => setActiveStatus(false)}
                      />
                      <label className="form-check-label" htmlFor="allUsers">
                        All
                      </label>
                    </div>
                    <div className="form-check ms-4">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="activeUsers"
                        checked={activeStatus === true}
                        onChange={() => setActiveStatus(true)}
                      />
                      <label className="form-check-label" htmlFor="activeUsers">
                        Active
                      </label>
                    </div>
                  </div>
                </Col>
                <Col md="2" className="d-flex align-items-end">
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

        <ProgressReportModal
          show={modalVisible}
          reportId={reportId}
          onClose={closeModal}
        />
      </Container>
    </PageContent>
  );
}
