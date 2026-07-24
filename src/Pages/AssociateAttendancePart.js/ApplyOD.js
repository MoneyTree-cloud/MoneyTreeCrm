/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css";
import { toast } from "react-toastify";
import { usePost } from "../../Hooks/useApi";
import { UPDATE_OD_DATA, GET_OD_DATA, DELETE_OD_DATA } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import ApiClient from "../../helpers/api_helper";
import AppTable from "../../components/Common/Table";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"; // For the left and right arrows
import { MdDelete } from "react-icons/md";
import PageContent from "../../components/Common/PageContent";
import { RequiredStar, WordWrapCell } from "../../helpers/function_helper";

export default function ApplyOD() {
  const { empCode, userName } = useUserStore((state) => state.user);
  const initialFormState = {
    outdoorType: "",
    date: "",
    inTime: "",
    outTime: "",
    purpose: "",
  };
  const [odFormState, setOdFormState] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [odList, setOdList] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Start with current month
  const [year, setYear] = useState(new Date().getFullYear());
  const [currentColor, setCurrentColor] = useState(defaultTheme.primary);
  const [previousColor, setPreviousColor] = useState(null);

  const { isPending: isPendingDelete, mutate: mutateDelete } = usePost(
    DELETE_OD_DATA,
    {
      onSuccess: (response) => {
        if (response?.data?.statusCode === 1) {
          toast.success(response.data.message);
          getOdList(month, year);
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  useEffect(() => {
    getOdList(month, year);
  }, []);

  const handleOdInputChange = (e) => {
    const { name, value } = e.target;
    setOdFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const currentErrors = {};
    if (!odFormState.date) currentErrors.date = "Date is required";
    if (!odFormState.inTime) currentErrors.inTime = "In Time is required";
    if (!odFormState.outTime) currentErrors.outTime = "Out Time is required";
    if (!odFormState.purpose) currentErrors.purpose = "Purpose is required";

    return Object.keys(currentErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const inTime = odFormState.inTime;
    const outTime = odFormState.outTime;
    if (validateForm()) {
      if (inTime && outTime) {
        const inTimeDate = new Date(`1970-01-01T${inTime}`);
        const outTimeDate = new Date(`1970-01-01T${outTime}`);

        if (inTimeDate >= outTimeDate) {
          toast.error("In Time must be earlier than Out Time");
          return;
        }
      }
      let params = {
        fkEmpCode: empCode,
        empName: userName,
        attDate: odFormState.date,
        requestType: "O",
        fromDate: odFormState.date,
        toDate: odFormState.date,
        intime: odFormState.inTime,
        outtime: odFormState.outTime,
        remarks: odFormState.purpose,
        pkId: 0,
        flag: "S",
        fkUserlog: 25356,
      };
      mutateUpdate(params);
    } else {
      toast.error("Some Mandatory Fields Are Still Not Filled");
    }
  };

  const handlePreviousMonth = () => {
    let newMonth = month - 1;
    let newYear = year;

    if (newMonth === 0) {
      newMonth = 12;
      newYear -= 1;
    }

    setMonth(newMonth);
    setYear(newYear);
    getOdList(newMonth, newYear);
    setPreviousColor(defaultTheme.primary);
    setCurrentColor(null);
  };

  const handleCurrentMonth = () => {
    const currentDate = new Date();
    setMonth(currentDate.getMonth() + 1);
    setYear(currentDate.getFullYear());
    getOdList(currentDate.getMonth() + 1, currentDate.getFullYear());
    setPreviousColor(null);
    setCurrentColor(defaultTheme.primary);
  };

  const handleDeleteClick = (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this request?"
    );

    if (!isConfirmed) return;
    let params = {
      pk_id: id,
      fk_userlog: "3",
    };
    mutateDelete(params);
  };

  const getOdList = (apiMonth, apiYear) => {
    let params = {
      empCode: empCode,
      month: apiMonth,
      year: apiYear,
      requestType: "O",
    };
    setIsLoading(true);
    ApiClient.post(GET_OD_DATA, params)
      .then(function (response) {
        if (response?.data?.statusCode === 1) {
          setOdList(response.data.data);
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

  const { isPending, mutate: mutateUpdate } = usePost(UPDATE_OD_DATA, {
    onSuccess: (response) => {
      if (response?.data?.statusCode === 1) {
        toast.success(response.data.message);
        getOdList(month, year);
        setOdFormState(initialFormState);
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

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
      name: <span className="font-weight-bold fs-13">OD Date</span>,
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

  const handleClear = () => {
    setOdFormState(initialFormState);
  };

  const minDate = new Date();
  minDate.setHours(minDate.getHours() - 48);

  const formatDate = (date) => date.toISOString().split("T")[0];


  return (
    <PageContent>
      <Breadcrumbs title="OD" breadcrumbItem="Apply OD" />
      {(isPending || isLoading || isPendingDelete) && <ScreenLoader />}

      <Container fluid={true}>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardBody>
              <Row className="g-3">
                <Col md="2">
                  <h6 className="font-size-11">Date <RequiredStar /></h6>
                  <input
                    type="date"
                    className="form-control"
                    name="date"
                    value={odFormState.date}
                    onChange={handleOdInputChange}
                    min={formatDate(minDate)}
                  />
                </Col>

                <Col md="2">
                  <h6 className="font-size-11">In Time <RequiredStar /></h6>
                  <input
                    type="time"
                    className={`form-control`}
                    name="inTime"
                    value={odFormState.inTime}
                    onChange={handleOdInputChange}
                  />
                </Col>

                <Col md="2">
                  <h6 className="font-size-11">Out Time <RequiredStar /></h6>
                  <input
                    type="time"
                    className={`form-control`}
                    name="outTime"
                    value={odFormState.outTime}
                    onChange={handleOdInputChange}
                  />
                </Col>

                <Col md="6">
                  <h6 className="font-size-11">Purpose <RequiredStar /></h6>
                  <textarea
                    name="purpose"
                    className={`form-control`}
                    rows={4}
                    value={odFormState.purpose}
                    onChange={handleOdInputChange}
                    placeholder="Enter Purpose..."
                  />
                </Col>

                <Col md="3" className="d-flex align-items-end">
                  <Button color="primary" type="submit">
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
        </form>
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
            data={odList}
            pagination

          />
      </Container>

    </PageContent>
  );
}
