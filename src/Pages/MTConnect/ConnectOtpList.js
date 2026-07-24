import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { formatDateTime } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";
import { MdMobileFriendly } from "react-icons/md";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css";
import { GET_CONNECT_OTP_LIST } from "../../helpers/url_helper";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function ConnectOtpList() {
  const [page, setPage] = useState(0);
  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);
  const [otpData, setOtpData] = useState([]);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'connect-otp-list');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  const {
    data,
    isLoading,
    refetch: getOtpData,
  } = useGet(GET_CONNECT_OTP_LIST + "?offset=" + page + "&size=100", { enabled: Boolean(accessGranted) });

  useEffect(() => {
    if (data?.data?.status === 1) {
      
      decryptData(data?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setOtpData(decryptedData);   
        } else {
          setOtpData([])
        }
      });
    }
  }, [data]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (row, index) => index + 1,
      sortable: true,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Mobile Number</span>,
      width: "7%",
      selector: (row) => row.mobileNumber,
      sortable: true,
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
      name: <span className="font-weight-bold fs-13">OTP</span>,
      selector: (row) => row.otp,
      width: "7%",
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.otp}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">OTP Send Datetime</span>,
      selector: (row) => (row.sentDate ? formatDateTime(row.sentDate) : ""),
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.sentDate ? formatDateTime(row.sentDate) : ""}
        </div>
      ),
    },
    {
      name: (
        <span className="font-weight-bold fs-13">OTP Verified Datetime</span>
      ),
      selector: (row) =>
        row.otpVerifiedDate ? formatDateTime(row.otpVerifiedDate) : "",
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.otpVerifiedDate ? formatDateTime(row.otpVerifiedDate) : ""}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">OTP Sent Status</span>,
      sortable: true,
      cell: (row) =>
        row.otpSentStatus ? (
          <FaCheck
            style={{
              color: "green",
              marginRight: "10px",
            }}
            size={20}
          />
        ) : (
          <FaTimes
            style={{
              color: "red",
              marginLeft: "10px",
            }}
            size={20}
          />
        ),
    },
    {
      name: <span className="font-weight-bold fs-13">OTP Verified Status</span>,
      sortable: true,
      cell: (row) =>
        row.verified ? (
          <FaCheck
            style={{
              color: "green",
              marginRight: "10px",
            }}
            size={20}
          />
        ) : (
          <FaTimes
            style={{
              color: "red",
              marginLeft: "10px",
            }}
            size={20}
          />
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
      <Breadcrumbs title="Security" breadcrumbItem="OTP Details" />
      {isLoading && <ScreenLoader />}
      <Container fluid={true}>
        <AppTable
          progressPending={isLoading}
          columns={columns}
          paginationTotalRows={otpData?.totalElements}
          data={
            Array.isArray(otpData?.content)
              ? otpData?.content
              : []
          }
          pagination
          paginationServer
          onChangePage={(newPage) => {
            setPage(newPage - 1);
            getOtpData();
          }}

        />
      </Container>
    </PageContent>
  );
}
