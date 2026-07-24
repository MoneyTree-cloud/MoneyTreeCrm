/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css";
import Select from "react-select";
import { toast } from "react-toastify";
import { usePost } from "../../Hooks/useApi";
import { DELETE_OD_DATA, GET_OD_DATA, UPDATE_OD_DATA } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import ApiClient from "../../helpers/api_helper";
import AppTable from "../../components/Common/Table";
import { MdDelete } from "react-icons/md";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import PageContent from "../../components/Common/PageContent";
import { RequiredStar, WordWrapCell } from "../../helpers/function_helper";

export default function ApplyAttendanceRegular() {
  const { empCode, userName } = useUserStore((state) => state.user);
  const location = useLocation();

  const initialFormState = {
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    reason: null,
    remarks: "",
  };

  const reasonGroup = [
    { label: "Forgot/Mispunch In Time", value: "0" },
    { label: "Forgot/Mispunch Out Time", value: "1" },
    { label: "Forgot/Mispunch Both Time", value: "2" },
  ];

  const [attendanceFormState, setAttendanceFormState] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Start with current month
  const [year, setYear] = useState(new Date().getFullYear());
  const [currentColor, setCurrentColor] = useState(defaultTheme.primary);
  const [previousColor, setPreviousColor] = useState(null);

  // 🆕 Prefill form when navigated from My Attendance with a red time clicked

  useEffect(() => {
    if (location.state?.prefillData) {
      const { reasonValue, startDate, startTime, endTime } =
        location.state.prefillData;

      const selectedReason = reasonGroup.find((r) => r.value === reasonValue);

      setAttendanceFormState({
        ...initialFormState,
        reason: selectedReason || null,
        startDate: startDate || "",
        startTime: startTime || "",
        endTime: endTime || "",
      });

      window.history.replaceState({}, document.title);
    }
  }, []);


  const handleAttendanceInputChange = (e) => {
    const { name, value } = e.target;
    setAttendanceFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const { isPending, mutate: mutateUpdate } = usePost(UPDATE_OD_DATA, {
    onSuccess: (response) => {
      if (response?.data?.statusCode === 1) {
        toast.success(response.data.message);
        getAllAttendanceList(month, year);
        setAttendanceFormState(initialFormState);
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSaveAttendance = () => {
    if (!attendanceFormState.reason) {
      toast.error("Please Select Reason");
    } else if (!attendanceFormState.startDate) {
      toast.error("Please Select Date");
    } else if (
      (attendanceFormState?.reason?.value === "0" ||
        attendanceFormState?.reason?.value === "2") &&
      !attendanceFormState.startTime
    ) {
      toast.error("Please Select In Time");
    } else if (
      (attendanceFormState?.reason?.value === "1" ||
        attendanceFormState?.reason?.value === "2") &&
      !attendanceFormState.endTime
    ) {
      toast.error("Please Select Out Time");
    }
    else if (
      attendanceFormState?.reason?.value === "2" &&
      attendanceFormState.startTime &&
      attendanceFormState.endTime &&
      new Date(`1970-01-01T${attendanceFormState.startTime}`) >= new Date(`1970-01-01T${attendanceFormState.endTime}`)
    ) {
      toast.error("In Time must be earlier than Out Time");
    }
    else if (!attendanceFormState.remarks) {
      toast.error("Please Enter Reason");
    } else {
      let params = {
        fkEmpCode: empCode,
        empName: userName,
        attDate: attendanceFormState.startDate,
        requestType: "P",
        fromDate: attendanceFormState.startDate,
        toDate: attendanceFormState.startDate,
        intime:
          attendanceFormState?.reason?.value === "0" ||
            attendanceFormState?.reason?.value === "2"
            ? attendanceFormState.startTime
            : attendanceFormState.endTime,
        outtime:
          attendanceFormState?.reason?.value === "1" ||
            attendanceFormState?.reason?.value === "2"
            ? attendanceFormState.endTime
            : attendanceFormState.startTime,
        remarks: attendanceFormState.remarks,
        pkId: 0,
        flag: "S",
        fkUserlog: 25356,
      };
      mutateUpdate(params);
    }
  };

  useEffect(() => {
    getAllAttendanceList(month, year);
  }, []);

  const getAllAttendanceList = (apiMonth, apiYear) => {
    let params = {
      empCode: empCode,
      month: apiMonth,
      year: apiYear,
      requestType: "P",
    };
    setIsLoading(true);
    ApiClient.post(GET_OD_DATA, params)
      .then(function (response) {
        if (response?.data?.statusCode === 1) {
          setAttendanceList(response.data.data);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        toast.error(error.message);
      })
      .finally(function () {
        setIsLoading(false);
      });
  };

  const handleDeleteClick = (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this request?");
    if (!isConfirmed) return;

    let params = {
      pk_id: id,
      fk_userlog: "3",
    };
    mutateDelete(params);
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Apply Date</span>,
      selector: (row) => row.Trndate,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Trndate}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Attendance Date</span>,
      selector: (row) => row.Fromdate,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Fromdate}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">In Time</span>,
      selector: (row) => row.Intime,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Intime}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Out Time</span>,
      selector: (row) => row.OutTime,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.OutTime}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Status</span>,
      selector: (row) => row.Status,
      sortable: true,
      width: "25%",
      cell: (row) => (
        <div
          style={{
            wordWrap: "break-word",
            whiteSpace: "normal",
            color:
              (row.TLbalchange === "PENDING" || row.TLbalchange === 'N/A')
                ? null
                : row.TLbalchange === "APPROVED"
                  ? defaultTheme.primary
                  : defaultTheme.redColor,
            fontWeight:
              row.TLbalchange === "APPROVED"
                ? "bold"
                : (row.TLbalchange === "PENDING" || row.TLbalchange === 'N/A')
                  ? null
                  : "bold",
          }}
        >
          {row.Status}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      selector: (row) => row.Remarks,
      sortable: true,
      width: "30%",
      cell: (row) => <WordWrapCell>{row.Remarks}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      sortable: true,
      cell: (row) =>
        (row.TLbalchange === "PENDING" || row.TLbalchange === 'N/A') ? (
          <MdDelete
            onClick={() => handleDeleteClick(row.pk_id)}
            style={{ cursor: "pointer", color: "red" }}
            size={20}
          />
        ) : null,
    },
  ];

  const handleSelectChange = (name) => (selectedOption) => {
    setAttendanceFormState({
      ...attendanceFormState,
      [name]: selectedOption,
    });
  };

  const { isPending: isPendingDelete, mutate: mutateDelete } = usePost(
    DELETE_OD_DATA,
    {
      onSuccess: (response) => {
        if (response?.data?.statusCode === 1) {
          toast.success(response.data.message);
          getAllAttendanceList(month, year);
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handlePreviousMonth = () => {
    let newMonth = month - 1;
    let newYear = year;

    if (newMonth === 0) {
      newMonth = 12;
      newYear -= 1;
    }

    setMonth(newMonth);
    setYear(newYear);
    getAllAttendanceList(newMonth, newYear);
    setPreviousColor(defaultTheme.primary);
    setCurrentColor(null);
  };

  const handleCurrentMonth = () => {
    const currentDate = new Date();
    setMonth(currentDate.getMonth() + 1);
    setYear(currentDate.getFullYear());
    getAllAttendanceList(currentDate.getMonth() + 1, currentDate.getFullYear());
    setPreviousColor(null);
    setCurrentColor(defaultTheme.primary);
  };

  const handleClear = () => {
    setAttendanceFormState(initialFormState);
  };

  const minDate = new Date();
  minDate.setHours(minDate.getHours() - 48);

  const formatDate = (date) => date.toISOString().split("T")[0];

  return (
    <PageContent>
      <Breadcrumbs
        title="Attendance"
        breadcrumbItem="Regularize Attendance"
      />
      {(isPending || isLoading || isPendingDelete) && <ScreenLoader />}

      <Container fluid={true}>
        <Card>
          <CardBody>
            <Row className="g-3">
              <Col md="3">
                <h6 className="font-size-11">Select Reason <RequiredStar /></h6>
                <Select
                  style={{ zIndex: 9999 }}
                  menuPortalTarget={document.body}
                  options={reasonGroup}
                  className={`react-select`}
                  isClearable
                  name="reason"
                  value={attendanceFormState.reason}
                  onChange={handleSelectChange("reason")}
                />
              </Col>
              <Col md="3">
                <h6 className="font-size-11">Date <RequiredStar /></h6>
                <input
                  type="date"
                  className={`form-control`}
                  name="startDate"
                  value={attendanceFormState.startDate}
                  onChange={handleAttendanceInputChange}
                  min={formatDate(minDate)}
                />
              </Col>

              {(attendanceFormState?.reason?.value === "0" ||
                attendanceFormState?.reason?.value === "2") && (
                  <Col md="3">
                    <h6 className="font-size-11">In Time <RequiredStar /></h6>
                    <input
                      type="time"
                      className={`form-control`}
                      name="startTime"
                      value={attendanceFormState.startTime}
                      onChange={handleAttendanceInputChange}
                    />
                  </Col>
                )}

              {(attendanceFormState?.reason?.value === "1" ||
                attendanceFormState?.reason?.value === "2") && (
                  <Col md="3">
                    <h6 className="font-size-11">Out Time <RequiredStar /></h6>
                    <input
                      type="time"
                      className={`form-control`}
                      name="endTime"
                      value={attendanceFormState.endTime}
                      onChange={handleAttendanceInputChange}
                    />
                  </Col>
                )}

              <Col md="8">
                <h6 className="font-size-11">Reason <RequiredStar /></h6>
                <textarea
                  name="remarks"
                  className={`form-control`}
                  rows={4}
                  value={attendanceFormState.remarks}
                  onChange={handleAttendanceInputChange}
                  placeholder="Enter Reason..."
                />
              </Col>

              <Col md="3" className="d-flex align-items-center">
                <Button
                  color="primary"
                  onClick={handleSaveAttendance}
                >
                  Save
                </Button>
                <Button
                  color="secondary"
                  className="ms-2"
                  onClick={handleClear}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>
      <div className="d-flex justify-content-between align-items-center mb-3 ms-2 me-2">
        <span
          className="d-flex align-items-center border p-2 pointer"
          onClick={handlePreviousMonth}
          style={{
            backgroundColor: previousColor,
            color: previousColor ? "white" : null,
            cursor: "pointer",
          }}
        >
          <FaArrowLeft className="me-2" />
          Previous Month
        </span>

        <span
          className="d-flex align-items-center border p-2 pointer"
          onClick={handleCurrentMonth}
          style={{
            backgroundColor: currentColor,
            color: currentColor ? "white" : null,
            cursor: "pointer",
          }}
        >
          <FaArrowRight className="me-2" />
          Current Month
        </span>
      </div>
      <AppTable
        progressPending={isLoading}
        columns={columns}
        data={attendanceList}
        pagination

      />
    </PageContent>
  );
}