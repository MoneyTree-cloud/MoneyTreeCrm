/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GET_KYC_TEAM_BOOKING, RECORDING_BOOKING } from "../../helpers/url_helper";
import { formatDateForInput, formatDateTime, formatLabel, WordWrapCell } from "../../helpers/function_helper";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useUserStore } from "../../store/useUserStore";
import { FaHeadphones } from "react-icons/fa";
import PageContent from "../../components/Common/PageContent";
import Select from "react-select";
import { MdEmail } from "react-icons/md";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function KycTeamScreen() {
  const navigate = useNavigate();
  const { userId, mobileNo } = useUserStore((state) => state.user);
  const location = useLocation();
  const [recordingModalOpen, setRecordingModalOpen] = useState(false);
  const [recordingData, setRecordingData] = useState([]);
  const [kycStatus, setKycStatus] = useState(null)
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
  const [filteredData, setFilteredData] = useState([]);
  const [formState, setFormState] = useState(initialFormState);
  const [taskType, setTaskType] = useState("Pending");
  const [accessGranted, setAccessGranted] = useState(null);

  const handleTypeSelectGroup = (selectedOption) => {
    setKycStatus(selectedOption);
  };

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
      const hasAccess = await CheckUserAccess(userId, 'kyc-team');
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
      const fromDate = '2025-09-18'
      setFormState((prevState) => ({
        ...prevState,
        fromDate: fromDate,
        toDate: formatDateForInput(end),
      }));
      getBookingDetails(
        `${GET_KYC_TEAM_BOOKING}${fromDate}&toDate=${formatDateForInput(end)}&offset=${page - 1
        }&limit=${LIMIT}&loginId=${userId}&approvedStatus=${value ? value : taskType === "Pending" ? "NO" : "YES"
        }`
      );
    } else {
      setFormState({
        fromDate: formState_?.fromDate,
        toDate: formState_?.toDate,
      });
      setTaskType(value ? value === 'YES' ? 'Completed' : 'Pending' : taskType_);
      getBookingDetails(
        `${GET_KYC_TEAM_BOOKING}${formState_?.fromDate}&toDate=${formState_?.toDate
        }&offset=${page - 1}&limit=${LIMIT}&loginId=${userId}&approvedStatus=${value ? value : taskType_ === "Pending" ? "NO" : "YES"
        }`
      );
    }
  };

  const handleShowData = (e) => {
    e.preventDefault();
    setPage(1);
    getBookingDetails(
      `${GET_KYC_TEAM_BOOKING}${formState.fromDate}&toDate=${formState.toDate
      }&offset=${page - 1}&limit=${LIMIT}&loginId=${userId}&approvedStatus=${taskType === "Pending" ? "NO" : "YES"
      }`
    );
  };

  const handlePaginationData = () => {
    getBookingDetails(
      `${GET_KYC_TEAM_BOOKING}${formState.fromDate}&toDate=${formState.toDate
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

  const handleShowRecording = (rowData) => {
    setIsPending(true);
    ApiClient.get(`${RECORDING_BOOKING}saleId=${rowData.saleId}&agentNumber=${mobileNo}&callerNumber=${rowData.clientPhone1}`)
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          setRecordingModalOpen(true);
          setRecordingData(response.data.data);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message);
      });
  };

  const recordingColumns = [
    {
      name: <span className="font-weight-bold fs-13">Dur (In Sec.)</span>,
      selector: (row) => row.totalCallDuration,
      sortable: true,
      width: "10%",
      cell: (row) => <WordWrapCell>{row.totalCallDuration}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Date & Time</span>,
      selector: (row) => formatDateTime(row.createdDate),
      sortable: true,
      width: "22%",
      cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Recording</span>,
      selector: (row) => (
        <div>
          <audio controls>
            <source src={row.callRecordingUrl} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      ),
    },
  ];

  // Open the uploaded file
  const handleOpenFile = (file) => {
    if (file) {
      const fileURL = imageBaseUrl + file;
      const fileName = file.split('/').pop() || '';
      const isMsgFile = fileName.toLowerCase().endsWith('.msg');

      if (isMsgFile) {
        // Trigger download for .msg files
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Open other files in a new tab
        window.open(fileURL, "_blank");
      }
    }
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "5%",
    },
    {
      name: <span className="font-weight-bold fs-13">Manage</span>,
      width: "7%",
      cell: (row) => (
        <i
          className="ri-pencil-fill align-bottom me-2"
          onClick={() => {
            handleNavigation("/kyc-team/update-kyc-team", {
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
    ...(taskType === "Completed"
      ? [
        {
          name: <span className="font-weight-bold fs-13">KYC Completed Date & Time</span>,
          selector: (row) => row.kycCompletedDate,
          width: "15%",
          sortable: true,
          cell: (row) => <WordWrapCell>{formatDateTime(row.kycCompletedDate)}</WordWrapCell>,
        },
      ]
      : []),
    {
      name: <span className="font-weight-bold fs-13">Recording/File</span>,
      selector: (row) => (
        row.hasCallLog ?
          <FaHeadphones
            size={20}
            onClick={() => handleShowRecording(row)}
            style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
          />
          :
          row.mailAttachment ?
            <div onClick={() => handleOpenFile(row.mailAttachment)}>
              <MdEmail color={defaultTheme.goldColorLogo} size={20} style={{ cursor: "pointer" }} />
            </div>
            : null
      ),
      width: '12%',
    },
    {
      name: <span className="font-weight-bold fs-13">KYC Status</span>,
      selector: (row) => row.kycStatus,
      sortable: true,
      width: '15%',
      cell: (row) => <WordWrapCell>{formatLabel(row.kycStatus)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Unique ID</span>,
      selector: (row) => row.saleId,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.saleId}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Unit No</span>,
      selector: (row) => row.unitNo,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.unitNo}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      selector: (row) => row.associateName,
      sortable: true,
      width: '18%',
      cell: (row) => <WordWrapCell>{row.associateName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Client Team</span>,
      selector: (row) => row.clientName,
      sortable: true,
      width: '18%',
      cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name</span>,
      selector: (row) => row.builderName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      selector: (row) => row.projectName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Main Team</span>,
      selector: (row) => row.mainTeam,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.mainTeam}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Sub Team</span>,
      selector: (row) => row.subTeam,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.subTeam}</WordWrapCell>
    },
    // {
    //   name: <span className="font-weight-bold fs-13">Final Cost</span>,
    //   selector: (row) => row.finalCost,
    //   sortable: true,
    //   cell: (row) => <WordWrapCell>{row.finalCost}</WordWrapCell>
    // },
  ];

  const kycStatusGroup = useMemo(
    () => [
      { label: "Call Not Picked", value: "callNotPicked" },
      { label: "Call Rescheduled", value: "callRescheduled" },
      { label: "Dispute", value: "dispute" },
      { label: "Not Reachable", value: "notReachable" },
      { label: "On Hold", value: "onHold" },
      { label: "Fresh", value: "fresh" },
      { label: "Email KYC Request", value: "emailKycRequest" }
    ],
    []
  );

  // Filter data whenever kycStatus changes
  useEffect(() => {
    if (taskType === 'Pending') {
      if (!kycStatus) {
        setFilteredData(bookingData?.content);
        return;
      }

      const filtered = bookingData?.content?.filter((item) =>
        kycStatus.value === "fresh"
          ? item.kycStatus === null // Show rows where kycStatus is null
          : item.kycStatus === kycStatus.value
      );

      setFilteredData(filtered);
    }
    else {
      setFilteredData(bookingData?.content);
    }
  }, [kycStatus, bookingData]);

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="KYC" breadcrumbItem="KYC-Team" />
      {isPending && <ScreenLoader />}
      <Container fluid={true}>
        <form onSubmit={handleShowData}>
          <div className="radio-button-container">
            <label className={`radio-label ${taskType === "Pending" ? "active" : ""}`}>
              <input
                type="radio"
                value="Pending"
                checked={taskType === "Pending"}
                onChange={handleRadioChange}
              />
              New
            </label>
            {taskType === "Pending" &&
              <div style={{ minWidth: '250px', maxWidth: '250px' }}>
                <Select
                  style={{ zIndex: 9999 }}
                  menuPortalTarget={document.body}
                  value={kycStatus}
                  isClearable
                  onChange={handleTypeSelectGroup}
                  options={kycStatusGroup}
                />
              </div>
            }
            <label className={`radio-label ${taskType === "Completed" ? "active" : ""}`}>
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
                <Col md="3">
                  <h6 className="font-size-11">From Date</h6>
                  <input
                    id="fromDate"
                    className="form-control"
                    type="date"
                    value={formState.fromDate}
                    onChange={handleChange}
                  />
                </Col>
                <Col md="3">
                  <h6 className="font-size-11">To Date</h6>
                  <input
                    id="toDate"
                    className="form-control"
                    type="date"
                    value={formState.toDate}
                    onChange={handleChange}
                  />
                </Col>
                <Col lg="4" className="d-flex align-items-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      onClick={handleShowData}
                    >
                      Show
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary ms-2"
                      onClick={getOpsBooking}
                    >
                      Clear
                    </button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>

        <h3 style={{ fontSize: 12, fontWeight: 800, color: defaultTheme.redColor }}>
          Note : This list displays only bookings with a status of "Ready to Dispatch," "Submit to Builder," or "Accepted by Builder."
        </h3>
        <AppTable
          progressPending={isPending}
          columns={columns}
          data={filteredData}
          pagination
          paginationTotalRows={bookingData?.totalElements}
          paginationServer
          onChangePage={(newPage) => {
            setPage(newPage);
            setFlag(true);
          }}
        />
      </Container>

      <Modal
        isOpen={recordingModalOpen}
        toggle={() => setRecordingModalOpen(!recordingModalOpen)}
        style={{
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <ModalHeader toggle={() => setRecordingModalOpen(!recordingModalOpen)}>
          Call Recording
        </ModalHeader>
        <ModalBody>
          <AppTable
            progressSales={isPending}
            columns={recordingColumns}
            data={recordingData}
            pagination

          />
        </ModalBody>
      </Modal>
    </PageContent>
  );
}
