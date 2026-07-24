/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GET_FINANCE_BOOKING } from "../../helpers/url_helper";
import { calculateAgingDayWise, formatDateForInput, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import ApiClient from "../../helpers/api_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useUserStore } from "../../store/useUserStore";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function FinanceKycScreen() {
  const navigate = useNavigate();
  const userId = useUserStore((state) => state.user.userId);
  const location = useLocation();
  const { formState_, taskType_ } = location.state || {};
  // Initial form state
  const initialFormState = {
    fromDate: "",
    toDate: "",
  };

  const LIMIT = 100;
  const [flag, setFlag] = useState(false);
  const [page, setPage] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [bookingData, setBookingData] = useState([]);
  const [formState, setFormState] = useState(initialFormState);
  const [taskType, setTaskType] = useState("Pending");
  const [accessGranted, setAccessGranted] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleRadioChange = (event) => {
    setTaskType(event.target.value);
    getOpsBooking(event.target.value === "Completed" ? "YES" : "NO");
  };

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'accounts-kyc');
      setAccessGranted(hasAccess);
      if (hasAccess) {
        getOpsBooking();
      }
    };
    checkAccess();
  }, [userId]);

  const getOpsBooking = (value) => {
    if (!formState_) {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const fromDate = '2025-02-01'
      setFormState((prevState) => ({
        ...prevState,
        fromDate: fromDate,
        toDate: formatDateForInput(end),
      }));
      getBookingDetails(
        `${GET_FINANCE_BOOKING}${fromDate}&toDate=${formatDateForInput(end)}&offset=${page - 1
        }&limit=${LIMIT}&loginId=${userId}&approvedStatus=${value ? value : taskType === "Pending" ? "NO" : "YES"
        }`
      );
    } else {
      setFormState({
        fromDate: formState_?.fromDate,
        toDate: formState_?.toDate,
      });
      setTaskType(
        value ? (value === "YES" ? "Completed" : "Pending") : taskType_
      );
      getBookingDetails(
        `${GET_FINANCE_BOOKING}${formState_?.fromDate}&toDate=${formState_?.toDate
        }&offset=${page - 1}&limit=${LIMIT}&loginId=${userId}&approvedStatus=${value ? value : taskType_ === "Pending" ? "NO" : "YES"
        }`
      );
    }
  };

  const handleShowData = (e) => {
    e.preventDefault();
    setPage(1);
    getBookingDetails(
      `${GET_FINANCE_BOOKING}${formState.fromDate}&toDate=${formState.toDate
      }&offset=${page - 1}&limit=${LIMIT}&loginId=${userId}&approvedStatus=${taskType === "Pending" ? "NO" : "YES"
      }`
    );
  };

  const handlePaginationData = () => {
    getBookingDetails(
      `${GET_FINANCE_BOOKING}${formState.fromDate}&toDate=${formState.toDate
      }&offset=${page - 1}&limit=${LIMIT}&loginId=${userId}&approvedStatus=${taskType === "Pending" ? "NO" : "YES"
      }`
    );
  };

  useEffect(() => {
    if (flag) {
      handlePaginationData();
    }
  }, [page]);

  const handleNavigation = (url, state) => {
    navigate(url, {
      state: { rowData: state, formState: formState, taskType: taskType },
    });
  };

  const getBookingDetails = (url) => {
    setIsPending(true);
    ApiClient.get(url)
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          const encryptedContent = response.data.data;
          decryptData(encryptedContent).then((decrypted) => {
            setBookingData(decrypted);
          }).catch((error) => {
            setBookingData([]);
          });
        } else if (response.data.message === "No Record Found.") {
          setBookingData([]);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        setBookingData([]);
        toast.error(error.message);
      });
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "5%",
    },
    {
      name: <span className="font-weight-bold fs-13">Manage</span>,
      sortable: true,
      width: "7%",
      cell: (row) => (
        <i
          title="Manage"
          className="ri-pencil-fill align-bottom me-2"
          onClick={() => {
            handleNavigation("/accounts-kyc/update-accounts-kyc", {
              rowData: row, // Send row data in the state
            });
          }}
          style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
        ></i>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Booking Date & Time</span>,
      selector: (row) => row.bookingDate,
      width: "15%",
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.bookingDate)}</WordWrapCell>,
    },
    ...(taskType !== "Pending"
      ? [
        {
          name: <span className="font-weight-bold fs-13">Approved Date & Time</span>,
          selector: (row) => row.approvedByFinanceDate,
          width: "15%",
          sortable: true,
          cell: (row) => <WordWrapCell>{formatDateTime(row.approvedByFinanceDate)}</WordWrapCell>
        }
      ]
      : []),
    {
      name: <span className="font-weight-bold fs-13">Pending From</span>,
      selector: (row) => row.bookingDate,
      sortable: true,
      width: '12%',
      cell: (row) =>
        <div className="phone-container">
          <WordWrapCell>{calculateAgingDayWise(row.approvedByOopsDate, new Date())}
            <span className="phone-number">{formatDateTime(row.approvedByOopsDate)}</span>
          </WordWrapCell>
        </div>
    },
    {
      name: <span className="font-weight-bold fs-13">Unique ID</span>,
      selector: (row) => row.saleId,
      width: "8%",
      sortable: true,
      cell: (row) => <WordWrapCell>{row.saleId}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Unit No</span>,
      selector: (row) => row.unitNo,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.unitNo}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      selector: (row) => row.associateName,
      sortable: true,
      width: '18%',
      cell: (row) => <WordWrapCell>{row.associateName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Client Team</span>,
      selector: (row) => row.clientName,
      sortable: true,
      width: '18%',
      cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Team</span>,
      selector: (row) => row.builderName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      selector: (row) => row.projectName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Interior Amt.</span>,
      selector: (row) => row.interiorAmount,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.interiorAmount}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Special Discount</span>,
      selector: (row) => row.specialDiscount,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.specialDiscount}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Final Cost</span>,
      selector: (row) => row.finalCost,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.finalCost}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Reject Remarks</span>,
      selector: (row) => row.fianceRejectRemark,
      sortable: true,
      width: '30%',
      cell: (row) => <WordWrapCell>{row.fianceRejectRemark}</WordWrapCell>
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
      <Breadcrumbs title="KYC" breadcrumbItem="Finance-KYC" />
      {isPending && <ScreenLoader />}
      <Container fluid={true}>
        <form onSubmit={handleShowData}>
          <div className="radio-button-container">
            <label className={`radio-label ${taskType === "Pending" ? "active" : ""}`}
            >
              <input
                type="radio"
                value="Pending"
                checked={taskType === "Pending"}
                onChange={handleRadioChange}
              />
              Pending
            </label>
            <label className={`radio-label ${taskType === "Completed" ? "active" : ""}`}
            >
              <input
                type="radio"
                value="Completed"
                checked={taskType === "Completed"}
                onChange={handleRadioChange}
              />
              Completed
            </label>
          </div>
          <Card>
            <CardBody>
              <Row>
                <Col md="4 mt-1">
                  <h6 className="font-size-11">From Date</h6>
                  <input
                    id="fromDate"
                    className="form-control"
                    type="date"
                    value={formState.fromDate}
                    onChange={handleChange}
                  />
                </Col>
                <Col md="4 mt-1">
                  <h6 className="font-size-11">To Date</h6>
                  <input
                    id="toDate"
                    className="form-control"
                    type="date"
                    value={formState.toDate}
                    onChange={handleChange}
                  />
                </Col>

                <Col lg="4">
                  <div className="d-flex align-items-center mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      onClick={handleShowData}
                    >
                      Show Data
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary ms-3"
                      onClick={getOpsBooking}
                    >
                      Clear
                    </button>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>

        <AppTable
          progressPending={isPending}
          columns={columns}
          data={bookingData?.content}
          pagination
          paginationTotalRows={bookingData?.totalElements}
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
