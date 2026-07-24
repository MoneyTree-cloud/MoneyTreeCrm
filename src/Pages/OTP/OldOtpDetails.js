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
import { GET_OLD_OTP_DETAILS } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function OldOtpDetails() {
  const [page, setPage] = useState(0);
  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);

  const {
    data: otpData,
    isLoading,
    refetch: getOtpData,
  } = useGet(GET_OLD_OTP_DETAILS + "?page=" + page + "&size=100", { enabled: !!accessGranted });

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      sortable: true,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting ID</span>,
      selector: (row) => row.meetingid,
      sortable: true,
      width: "12%",
    },
    {
      name: <span className="font-weight-bold fs-13">Prospect Id</span>,
      selector: (row) => row.prospectId,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Mobile Number</span>,
      width: "7%",
      selector: (row) => row.prospectMob,
      sortable: true,
      cell: (row) => (
        <div className="phone-container">
          <MdMobileFriendly
            className="phone-icon"
            color={defaultTheme.goldColorLogo}
          />
          <span className="phone-number">{row.prospectMob}</span>
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.clientName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">OTP</span>,
      selector: (row) => row.otp,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">OTP Datetime</span>,
      selector: (row) => (row.otpTime ? formatDateTime(row.otpTime) : ""),
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.otpTime ? formatDateTime(row.otpTime) : ""}
        </div>
      ),
    },
  ];


  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'old-otp-details');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

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
          paginationTotalRows={otpData?.data?.data?.totalElements}
          data={
            Array.isArray(otpData?.data?.data?.content)
              ? otpData?.data?.data?.content
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
