/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import "../CSS/styles.css";
import { toast } from "react-toastify";
import { useGet, usePost } from "../../Hooks/useApi";
import { CHANGE_OD_STATUS, GET_OD_DATA_BY_ID } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import AppTable from "../../components/Common/Table";
import { FaCheck, FaTimes } from "react-icons/fa";
import { defaultTheme } from "../../helpers/defaultTheme";
import { formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";

export default function AttendanceRegularizeHistory() {
  const empCode = useUserStore((state) => state.user.empCode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pkId, setPkId] = useState("");
  const [flag, setFlag] = useState("");
  const [empCode_, setEmpCode_] = useState("");
  const [date, setDate] = useState("");
  const [inTime, setInTime] = useState("");
  const [odType, setOdType] = useState("Pending");
  const [apiUrl, setApiUrl] = useState(null);

  const INITIALSTATE = {
    reportType: null,
    fromDate: "",
  };
  const [formState, setFormState] = useState(INITIALSTATE);

  function handleInputChange(event) {
    const { id, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  }

  const handleStatusChange = () => {
    setIsModalOpen(false);
    const apiDate = date
      ? new Date(date)
        .toLocaleDateString("en-GB", {
          year: "numeric",
          month: "long", // Get full month name first
          day: "2-digit",
        })
        .replace(/January|February|March|April|May|June|July|August|September|October|November|December/g, (match) => {
          return match.slice(0, 3); // Take the first 3 letters of the month
        })
        .split(" ")
        .reverse()
        .join(" ")
      : "";

    let params = {
      pk_Id: pkId,
      flag: flag,
      empCode: empCode_,
      fromDate: apiDate,
      inTime: inTime,
      date: apiDate,
      inPunch: "",
      requestType: "P",
      approveId: empCode,
    };
    mutateStatusChange(params);
  };

  const { isPending: isPendingChange, mutate: mutateStatusChange } = usePost(
    CHANGE_OD_STATUS,
    {
      onSuccess: (response) => {
        if (response?.data?.statusCode === 1) {
          getAttendanceListData();
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const getFromToDate = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setFormState((prevState) => ({
      ...prevState,
      fromDate: formatDateForInput(start),
      toDate: formatDateForInput(end),
    }));
    setApiUrl(
      `${GET_OD_DATA_BY_ID + empCode}&fromDate=${formatDateForInput(
        start
      )}&toDate=${formatDateForInput(end)}`
    );
  };

  useEffect(() => {
    getFromToDate();
  }, []);

  const { data: attendanceList, isLoading: loadingGet, refetch: getAttendanceListData, } = useGet(apiUrl, { enabled: Boolean(apiUrl), });

  const handleStatusChangeClick = (pk_Id, inTime, date, empCode, flag) => {
    setPkId(pk_Id);
    setFlag(flag);
    setInTime(inTime);
    setDate(date);
    setEmpCode_(empCode);
    setIsModalOpen(true);
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Emp Details</span>,
      selector: (row) => row.empcode + "-" + row.Employeename,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Employeename + " (" + row.empcode + ")"}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Apply Date</span>,
      selector: (row) => row.TrnDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.TrnDate}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Att Date</span>,
      selector: (row) => row.fromdate,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.fromdate}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">In Time</span>,
      selector: (row) => row.intime,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.intime}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Out Time</span>,
      selector: (row) => row.outtime,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.outtime}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Status</span>,
      selector: (row) => row.TLbalchange,
      sortable: true,
      cell: (row) => (
        <div
          style={{
            wordWrap: "break-word",
            whiteSpace: "normal",
            color:
              row.TLbalchange === "REJECTED"
                ? defaultTheme.redColor
                : row.TLbalchange === "APPROVED"
                  ? defaultTheme.primary
                  : null,
            fontWeight:
              row.TLbalchange === "REJECTED"
                ? "bold"
                : row.TLbalchange === "APPROVED"
                  ? "bold"
                  : null,
          }}
        >
          {row.TLbalchange}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      selector: (row) => row.Remarks,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Remarks}</WordWrapCell>
    },
    ...(odType === "Pending"
      ? [
        {
          name: "Action",
          cell: (row) => (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <FaCheck
                style={{
                  cursor: "pointer",
                  color: "green",
                  marginRight: "10px",
                }}
                size={20}
                onClick={() =>
                  handleStatusChangeClick(
                    row.Pk_id,
                    row.intime,
                    row.fromdate,
                    row.empcode,
                    'A'
                  )
                }
              />
              <FaTimes
                style={{
                  cursor: "pointer",
                  color: "red",
                  marginLeft: "10px",
                }}
                size={20}
                onClick={() =>
                  handleStatusChangeClick(
                    row.Pk_id,
                    row.intime,
                    row.fromdate,
                    row.empcode,
                    'R'
                  )
                }
              />
            </div>
          ),
        },
      ]
      : []),
  ];

  const handleRadioChange = (event) => {
    setOdType(event.target.value);
  };

  const handleShowData = () => {
    setApiUrl(
      `${GET_OD_DATA_BY_ID + empCode}&fromDate=${formState?.fromDate}&toDate=${formState?.toDate
      }`
    );
  };

  return (
    <PageContent>
      <Breadcrumbs title="Attendance" breadcrumbItem="Regularize Attendance History" />
      {(loadingGet || isPendingChange) && <ScreenLoader />}
      <Container>
        <div className="radio-button-container">
          <label
            className={`radio-label ${odType === "Pending" ? "active" : ""}`}
          >
            <input
              type="radio"
              value="Pending"
              checked={odType === "Pending"}
              onChange={handleRadioChange}
            />
            Pending
          </label>
          <label
            className={`radio-label ${odType === "Others" ? "active" : ""}`}
          >
            <input
              type="radio"
              value="Others"
              checked={odType === "Others"}
              onChange={handleRadioChange}
            />
            Approved/Rejected
          </label>
        </div>

        <Card>
          <CardBody>
            <Row className="g-3">
              <Col lg="4">
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
              <Col lg="4">
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
              <Col lg="4" className="d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleShowData}
                >
                  Show Data
                </button>

                <button
                  type="button"
                  className="btn btn-secondary ms-3"
                  onClick={getFromToDate}
                >
                  Clear
                </button>
              </Col>
            </Row>
          </CardBody>
        </Card>
        <AppTable
          progressPending={loadingGet}
          columns={columns}
          data={
            odType === "Pending"
              ? Array.isArray(attendanceList?.data?.data)
                ? attendanceList?.data?.data.filter(
                  (row) =>
                    row.TLbalchange === "PENDING" && row.status === "P"
                )
                : []
              : Array.isArray(attendanceList?.data?.data)
                ? attendanceList?.data?.data.filter(
                  (row) => row.TLbalchange !== "PENDING" && row.status === "P"
                )
                : []
          }
          pagination

        />
      </Container>

      <Modal isOpen={isModalOpen} toggle={handleCloseModal}>
        <ModalHeader toggle={handleCloseModal}>
          Confirm Status Change
        </ModalHeader>
        <ModalBody>Are you sure you want to change the status?</ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            style={{ backgroundColor: defaultTheme.primary }}
            onClick={handleStatusChange}
          >
            Yes
          </Button>
          <Button
            color="secondary"
            style={{ backgroundColor: defaultTheme.goldColorLogo }}
            onClick={handleCloseModal}
          >
            No
          </Button>
        </ModalFooter>
      </Modal>
    </PageContent>
  );
}
