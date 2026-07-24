/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { BM_ATTENDANCE_DATA, GET_ALL_USERS_DROPDOWN } from "../../helpers/url_helper";
import { convertTo12HourFormat, formatDate, formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { BiFingerprint } from "react-icons/bi";
import { FaMapMarkerAlt } from "react-icons/fa";
import { defaultTheme } from "../../helpers/defaultTheme";
import { USER_TYPE } from "../../constants/global";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { useGet } from "../../Hooks/useApi";
import Select from "react-select";

export default function BmAttendanceScreen() {
  const { userId, role, locationName } = useUserStore((state) => state.user);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isPending, setIsPending] = useState(false)
  const [attData, setAttData] = useState([])
  const [accessGranted, setAccessGranted] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const { data: usersList } = useGet(GET_ALL_USERS_DROPDOWN + '?filterKey=BRANCH&filterValue=' + locationName);

  useEffect(() => {
    const checkAccess = async () => {
      if (role !== USER_TYPE.ASSOCIATE) {
        const hasAccess = await CheckUserAccess(userId, 'bm-attendance-screen');
        setAccessGranted(hasAccess);
        if (hasAccess) {
          getAttendanceDetails()
        }
      }
      else {
        setAccessGranted(true);
        getAttendanceDetails()
      }
    };
    checkAccess();
  }, [userId, role]);

  const getAttendanceDetails = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfMonth = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    setFromDate(formatDateForInput(startOfMonth));
    setToDate(formatDateForInput(endOfMonth));
    setSelectedEmployee(null)

    getAttDetails(
      `${BM_ATTENDANCE_DATA}${formatDateForInput(
        startOfMonth
      )}&toDate=${formatDateForInput(endOfMonth)}&userId=${userId}`
    );
  }

  const getAttDetails = (url) => {
    setIsPending(true)
    ApiClient.get(url)
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          setAttData(response.data.data)
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message);
      });
  }

  const handleShowData = (e) => {
    e.preventDefault();

    if (selectedEmployee?.label) {
      // extract number inside ()
      const empCode = selectedEmployee?.label?.match(/\((\d+)\)/)?.[1];

      if (empCode) {
        getAttDetails(`${BM_ATTENDANCE_DATA}${fromDate}&toDate=${toDate}&userId=${userId}&empCode=${empCode}`);
      }
    }
    else {
      getAttDetails(`${BM_ATTENDANCE_DATA}${fromDate}&toDate=${toDate}&userId=${userId}`);
    }
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, i) => i + 1,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Emp Details</span>,
      selector: (row) => row.empCode,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.empName + ' (' + row.empCode + ')'}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Date</span>,
      selector: (row) => row.inDateTime,
      sortable: true,
      cell: (row) => <WordWrapCell> {formatDate(row.inDateTime)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">In Time</span>,
      selector: (row) => row.inDateTime,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.inDateTime
        ? convertTo12HourFormat(row.inDateTime.split(" ")[1])
        : ""}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">In Location</span>,
      selector: (row) => row.inTimeLng,
      cell: (row) => (
        <WordWrapCell>
          {row.inDateTime ? (
            row.inTimeLat && row.inTimeLng ? (
              <FaMapMarkerAlt
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/@${row.inTimeLat},${row.inTimeLng},16z?q=${row.inTimeLat},${row.inTimeLng}`,
                    "_blank"
                  )
                }
                style={{
                  cursor: "pointer",
                  color: defaultTheme.goldColorLogo,
                  fontSize: 18,
                }}
              />
            ) : (
              <BiFingerprint
                style={{ color: defaultTheme.goldColorLogo, fontSize: 18 }}
              />
            )
          ) : null}
        </WordWrapCell>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Out Time</span>,
      selector: (row) => row.outDateTime,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.outDateTime
        ? convertTo12HourFormat(row.outDateTime.split(" ")[1])
        : ""}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Out Location</span>,
      selector: (row) => row.inTimeLng,
      cell: (row) => (
        <WordWrapCell>
          {row.outDateTime ? (
            row.outTimeLat && row.outTimeLng ? (
              <FaMapMarkerAlt
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/@${row.outTimeLat},${row.outTimeLng},16z?q=${row.outTimeLat},${row.outTimeLng}`,
                    "_blank"
                  )
                }
                style={{
                  cursor: "pointer",
                  color: defaultTheme.goldColorLogo,
                  fontSize: 18,
                }}
              />
            ) : (
              <BiFingerprint
                style={{ color: defaultTheme.goldColorLogo, fontSize: 18 }}
              />
            )
          ) : null}
        </WordWrapCell>
      ),
    },
  ];

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      {isPending && <ScreenLoader />}
      <Breadcrumbs title="Associate" breadcrumbItem="Attendance" />
      <Container fluid={true}>
        <Card>
          <CardBody>
            <form onSubmit={handleShowData}>
              <Row className="g-3">
                <Col lg="3">
                  <h6 className="font-size-11">From Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">To Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Col>

                <Col md="3">
                  <h6 className="font-size-11">Select Employee</h6>
                  <Select
                    value={selectedEmployee}
                    onChange={(val) => setSelectedEmployee(val)}
                    options={usersList?.data?.data || []}
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                  />
                </Col>
                <Col
                  lg="3"
                  className="d-flex align-items-end"
                >
                  <button
                    type="submit"
                    className="btn btn-primary me-2"
                    onClick={handleShowData}
                  >
                    Show
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={getAttendanceDetails}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>

        {attData?.length > 0 &&
          <AppTable
            progressPending={isPending}
            columns={columns}
            data={attData}
            pagination
          />
        }
      </Container>
    </PageContent>
  );
}
