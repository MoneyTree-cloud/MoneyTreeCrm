import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet } from "../../Hooks/useApi";
import { GET_ATTENDANCE } from "../../helpers/url_helper";
import { convertTo12HourFormat, formatDate, formatDateForInput, generateTimestamp, WordWrapCell } from "../../helpers/function_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css";
import { FaMapMarkerAlt } from "react-icons/fa";
import { BiFingerprint } from "react-icons/bi";
import * as XLSX from "xlsx";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { useUserStore } from "../../store/useUserStore";
import PermissionMissing from "../Utility/PermissonMissing";

export default function AttendanceScreen() {
  const [formState, setFormState] = useState({
    fromDate: "",
    toDate: "",
    apiUrl: null,
  });
  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);

  // Fetch attendance data based on apiUrl
  const { data: attendanceData, isLoading } = useGet(formState.apiUrl, { enabled: !!formState.apiUrl && !!accessGranted, });

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'attendance');
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
      apiUrl: `${GET_ATTENDANCE}startDate=${formatDateForInput(
        now
      )}&endDate=${formatDateForInput(now)}`,
    }));
  };

  const handleShowData = (e) => {
    e.preventDefault();
    setFormState((prev) => ({
      ...prev,
      apiUrl: `${GET_ATTENDANCE}startDate=${formState.fromDate}&endDate=${formState.toDate}`,
    }));
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Emp Code</span>,
      selector: (row) => row.empCode,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.empCode}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Emp Name</span>,
      selector: (row) => row.empName,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.empName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Date</span>,
      selector: (row) => row.inDateTime,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDate(row.inDateTime)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">In Time</span>,
      selector: (row) => row.inDateTime,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.inDateTime ? convertTo12HourFormat(row.inDateTime.split(" ")[1]) : ""}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">In Location</span>,
      selector: (row) => row.inTimeLng,
      sortable: true,
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
      cell: (row) => <WordWrapCell> {row.outDateTime ? convertTo12HourFormat(row.outDateTime.split(" ")[1]) : ""}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Out Location</span>,
      selector: (row) => row.inTimeLng,
      sortable: true,
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

  const downloadAllDataExcel = () => {
    const data = attendanceData?.data?.data?.data;
    // Ensure the data is not empty
    if (!Array.isArray(data) || data.length === 0) return;

    // 1. Extract the keys from the first object as the headers
    const headers = Object.keys(data[0]);

    // 2. Convert the data into a format compatible with the Excel file
    const formattedData = data.map((item) => {
      return headers.map((header) => item[header]);
    });

    // 3. Add the headers as the first row in the data
    const finalData = [headers, ...formattedData];

    // 4. Create a worksheet from the final data
    const ws = XLSX.utils.aoa_to_sheet(finalData);

    // 5. Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Data");

    // 6. Write the file and trigger download
    XLSX.writeFile(wb, `attendanceData_${generateTimestamp()}.xlsx`);
  };

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      {isLoading && <ScreenLoader />}
      <Breadcrumbs title="Attendance" breadcrumbItem="All Attendance" />
      <Container fluid={true}>
        <Card>
          <CardBody>
            <form onSubmit={handleShowData}>
              <Row>
                <Col lg="4 mt-1">
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
                <Col lg="4 mt-1">
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
                <Col lg="4" className="align-items-center mt-4">
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
                      className="btn btn-secondary ms-2"
                      onClick={getFromToDate}
                    >
                      Clear
                    </button>
                  </div>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>
        {attendanceData?.data?.data?.data?.length > 0 &&
          <i
            className="fas fa-file-excel"
            style={{
              color: defaultTheme.primary,
              cursor: "pointer",
              fontSize: "15px",
            }}
            onClick={downloadAllDataExcel}
          ></i>
        }
        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={
            Array.isArray(attendanceData?.data?.data?.data)
              ? attendanceData?.data?.data?.data
              : []
          }
          pagination

        />
      </Container>
    </PageContent>
  );
}
