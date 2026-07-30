import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Input, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";
import { MdMobileFriendly } from "react-icons/md";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css";
import { GET_NEW_OTP_DETAILS, GET_OTP_STATUS_DETAILS, SEND_OTP } from "../../helpers/url_helper";
import { FaCheck, FaEye, FaTimes } from "react-icons/fa";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";

export default function OtpDetails() {
  const [page, setPage] = useState(0);
  const { userId, empCode } = useUserStore((state) => state.user);
  const [accessGranted, setAccessGranted] = useState(null);
  const [otpData, setOtpData] = useState([]);
  const [statusModal, setStatusModal] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [isPending, setIsPending] = useState(false)
  const LIMIT = 100;
  const [otpNumber, setOtpNumber] = useState("")

  const { data, isLoading, refetch: getOtpData } = useGet(`${GET_NEW_OTP_DETAILS}?page=${page}&size=${LIMIT}`, { enabled: !!accessGranted });

  useEffect(() => {
    if (data?.data?.status === 1) {
      decryptData(data?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setOtpData(decryptedData);
        } else {
          setOtpData([]);
        }
      });
    }
  }, [data]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "7%",
    },
    {
      name: <span className="font-weight-bold fs-13">Mobile Number</span>,
      width: "10%",
      selector: (row) => row.mobileNumber,
      cell: (row) => (
        <div className="phone-container">
          <MdMobileFriendly
            className="phone-icon"
            color={defaultTheme.goldColorLogo}
          />
          <span className="phone-number">{row.mobileNumber}</span>
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Send By</span>,
      selector: (row) => row.clientName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.sentByName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">OTP</span>,
      selector: (row) => row.otp,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.otp}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">OTP Send Datetime</span>,
      selector: (row) => (row.sentDate ? formatDateTime(row.sentDate) : ""),
      sortable: true,
      cell: (row) => <WordWrapCell>{row.sentDate ? formatDateTime(row.sentDate) : ""}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">OTP Verified Datetime</span>,
      selector: (row) => row.otpVerifiedDate ? formatDateTime(row.otpVerifiedDate) : "",
      sortable: true,
      cell: (row) => <WordWrapCell>{row.otpVerifiedDate ? formatDateTime(row.otpVerifiedDate) : ""}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">OTP Sent Status</span>,
      cell: (row) =>
        row.otpSentStatus ? (
          <FaCheck
            color={defaultTheme.primary}
            title="OTP Sent"
            size={12}
          />
        ) : (
          <FaTimes
            color={defaultTheme.redColor}
            title="OTP Not Sent"
            size={12}
          />
        ),
    },
    {
      name: <span className="font-weight-bold fs-13">OTP Verified Status</span>,
      cell: (row) =>
        row.verified ? (
          <FaCheck
            color={defaultTheme.primary}
            title="OTP Verified"
            size={12}
          />
        ) : (
          <FaTimes
            color={defaultTheme.redColor}
            title="OTP Not Verified"
            size={12}
          />
        ),
    },
    {
      name: <span className="font-weight-bold fs-13">Status</span>,
      cell: (row) => (
        <FaEye
          size={15}
          color={defaultTheme.goldColorLogo}
          style={{ cursor: "pointer" }}
          title="View Status"
          onClick={() => fetchOtpStatus(row)}
        />
      ),
    }
  ];

  const fetchOtpStatus = (row) => {
    setIsPending(true)
    ApiClient.get(`${GET_OTP_STATUS_DETAILS}?id=${row.id}`)
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          const parsedData = JSON.parse(response.data.data)
          setStatusData(parsedData.DeliveryReports);
          setStatusModal(true);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message);
      });
  };

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'otp-details');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  const handleSendOtp = (e) => {
    e.preventDefault()
    if (!otpNumber) {
      toast.error("Please Enter Mobile Number")
    }
    else if (otpNumber?.length !== 10) {
      toast.error('Please Enter 10 Digits Mobile Number')
    }
    else {
      mutateOtpSend()
    }

  }

  const { isPending: isPendingOtpSend, mutate: mutateOtpSend } = usePost(
    SEND_OTP + otpNumber + "&userId=" + userId,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(`Happy Code has been sent to ${otpNumber} via SMS as well as WhatsApp`);
          setOtpNumber("")
          getOtpData()
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="OTP" breadcrumbItem="OTP Details" />
      {(isLoading || isPending || isPendingOtpSend) && <ScreenLoader />}
      <Container fluid={true}>
        {empCode === '1' &&
          <Card>
            <CardBody>
              <form className="needs-validation" noValidate onSubmit={handleSendOtp}>
                <Row className="g-3">
                  <Col md="6">
                    <h6 className="font-size-11">Mobile Number <RequiredStar /></h6>
                    <Input
                      name="otpNumber"
                      placeholder="Enter Mobile Number"
                      type="text"
                      className="form-control"
                      value={otpNumber}
                      maxLength={10}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setOtpNumber(value);
                      }}
                    />
                  </Col>
                  <Col md="4" className="d-flex align-items-end">
                    <Button
                      type="submit"
                      color="primary"
                      onClick={handleSendOtp}
                    >
                      Test
                    </Button>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        }
        <AppTable
          progressPending={isLoading}
          columns={columns}
          paginationTotalRows={otpData?.totalElements}
          data={otpData?.content || []}
          pagination
          paginationServer
          onChangePage={(newPage) => {
            setPage(newPage - 1);
            getOtpData();
          }}
        />
      </Container>

      <Modal isOpen={statusModal} toggle={() => setStatusModal(false)} centered size="md">
        <ModalHeader toggle={() => setStatusModal(false)}>
          OTP Delivery Status
        </ModalHeader>

        <ModalBody>
          {statusData?.length ? (
            statusData.map((item, index) => (
              <div
                key={index}
                className="border rounded p-3 mb-3 bg-light"
              >
                <p className="mb-2">
                  <strong>Delivery Status:</strong>
                  <span
                    className={`ms-2`}>
                    {item.DeliveryStatus}
                  </span>
                </p>

                <p className="mb-0">
                  <strong>Delivery Date:</strong>
                  <span className="ms-2">
                    {formatDateTime(item.DeliveryDate)}
                  </span>
                </p>
              </div>
            ))
          ) : (
            <ScreenLoader />
          )}
        </ModalBody>
      </Modal>
    </PageContent>
  );
}