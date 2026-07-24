import React, { useEffect, useState } from "react";
import {
  Container
} from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet } from "../../Hooks/useApi";
import {
  GET_ALL_CONNECT_LEADS,
} from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css";
import PageContent from "../../components/Common/PageContent";
import { MdMobileFriendly } from "react-icons/md";
import { formatDate } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import { USER_TYPE } from "../../constants/global";

export default function ConnectAllEnrollmentLeads() {
  const mainTeam = useUserStore((state) => state.user.mainTeam);
  const role = useUserStore((state) => state.user.role);

  const [page, setPage] = useState(1)
  const [apiUrl, setApiUrl] = useState('')
  const limit = 100;
  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);
  const [connectLeadList, setConnectLeadList] = useState([]);
  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'all-connect-enrollment-leads');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);
  const { data, isLoading } = useGet(apiUrl, { enabled: Boolean(apiUrl && accessGranted) });

  useEffect(() => {
    if (data?.data?.status === 1) {
      
      decryptData(data?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setConnectLeadList(decryptedData);   
        } else {
          setConnectLeadList([])
        }
      });
    }
  }, [data]);

  const mainTeamQuery = role === USER_TYPE.ASSOCIATE  ? `&mainTeam=${mainTeam}` : '';

  useEffect(() => {
    setApiUrl(`${GET_ALL_CONNECT_LEADS}offset=${page - 1}&limit=${limit}${mainTeamQuery}`)
  }, [mainTeamQuery, page])

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      sortable: true,
      width: '5%',
      selector: (row, index) => index + 1,
      cell: (row, index) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {index + 1}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Created Date</span>,
      sortable: true,
      selector: (row) => row.createdDate,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {formatDate(row.createdDate)}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Connect Details</span>,
      sortable: true,
      width: '18%',
      selector: (row) => row.customerName,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.customerName + ' (' + row.customerId + ')'}
        </div>
      ),
    },

    {
      name: <span className="font-weight-bold fs-13">Suspect Name</span>,
      sortable: true,
      width: '15%',
      selector: (row) => row.suspectName,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.suspectName}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Mobile No.</span>,
      selector: (row) => row.suspectMobile,
      sortable: true,
      cell: (row) => (
        <div className="phone-container">
          <MdMobileFriendly
            className="phone-icon"
            color={defaultTheme.goldColorLogo}
          />
          <span className="phone-number">{row.suspectMobile}</span>
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Occupation</span>,
      sortable: true,
      selector: (row) => row.occupation,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.occupation}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Budget</span>,
      sortable: true,
      selector: (row) => row.suspectBudget,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.suspectBudget}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Preferred Location</span>,
      sortable: true,
      selector: (row) => row.preferredLocation,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.preferredLocation}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Connect Reference</span>,
      sortable: true,
      selector: (row) => row.connectReference,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.connectReference ? 'YES' : "NO"}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">RM</span>,
      selector: (row) => row.empName,
      sortable: true,
      width: "15%",
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.empName + '(' + row.empCode + ')'}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">RM MT</span>,
      selector: (row) => row.empMainTeam,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.empMainTeam}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">RM ST</span>,
      selector: (row) => row.empSubTeam,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.empSubTeam}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Status</span>,
      sortable: true,
      selector: (row) => row.suspectAcceptStatus,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.suspectAcceptStatus}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      sortable: true,
      width: '20%',
      selector: (row) => row.rejectRemarks,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.rejectRemarks}
        </div>
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
      <Breadcrumbs title="Connect" breadcrumbItem="All Leads" />
      {(isLoading) && <ScreenLoader />}
      <Container fluid={true}>
        <AppTable
          columns={columns}
          data={Array.isArray(connectLeadList?.content) ? connectLeadList?.content : []}
          pagination
          progressPending={isLoading}
          paginationTotalRows={connectLeadList?.totalElements || 0}
          paginationServer
          onChangePage={(newPage) => setPage(newPage)}
        />
      </Container>
    </PageContent>
  );
}