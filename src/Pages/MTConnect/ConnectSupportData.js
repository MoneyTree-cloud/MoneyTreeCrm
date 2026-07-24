import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import "../CSS/styles.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useGet } from "../../Hooks/useApi";
import { CONNECT_LIST_SUPPORT_MESSAGES } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { formatDateTime } from "../../helpers/function_helper";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function ConnectSupportData() {
  const navigation = useNavigate();
  const location = useLocation();
  const { supportMsgType_ } = location.state || {};  // Destructure supportMsgType_ from state

  const userId = useUserStore((state) => state.user.userId);
  const [supportMsgType, setSupportMsgType] = useState("In Process");
  const [accessGranted, setAccessGranted] = useState(null);
  const [supportList, setSupportList] = useState([]);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'connect-support');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);


  useEffect(() => {
    if (supportMsgType_) {
      setSupportMsgType(supportMsgType_)
    }
  }, [supportMsgType_])

  const { data, isLoading } = useGet(
    CONNECT_LIST_SUPPORT_MESSAGES + '14', { enabled: Boolean(accessGranted) }
  );

  useEffect(() => {
    if (data?.data?.status === 1) {
      
      decryptData(data?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setSupportList(decryptedData);   
        } else {
          setSupportList([])
        }
      });
    }
  }, [data]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (row, index) => index + 1,
      sortable: true,
      width: "7%",
    },
    {
      name: <span className="font-weight-bold fs-13">Complainant Name</span>,
      selector: (row) => row.userName + " (" + row.userId + ")",
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.userName + " (" + row.userId + ")"}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Last Message</span>,
      selector: (row) => row.message,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          <span
            dangerouslySetInnerHTML={{
              __html: row.message.replace(/\n/g, "<br />"), // Convert newlines to <br />
            }}
          />
        </div>
      ),
    },
    {
      name: (
        <span className="font-weight-bold fs-13">Last Message Date & Time</span>
      ),
      selector: (row) => row.messageSentDate,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {formatDateTime(row.messageSentDate)}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      selector: (row) => (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleViewComplaint(row)}
        >
          View Complaint
        </button>
      ),
      sortable: false,
    },
  ];

  const handleViewComplaint = (row) => {
    navigation("/connect-support/connect-view-complaint", { state: { row, supportMsgType, } });
  };

  const handleRadioChange = (event) => {
    setSupportMsgType(event.target.value);
  };

  const getCount = (statusType) => {
    return Array.isArray(supportList)
      ? supportList.filter(
        (item) =>
          (statusType === "In Process" &&
            (item.supportStatus === "NO" || item.supportStatus === null)) ||
          (statusType === "Resolved" && item.supportStatus === "YES")
      ).length
      : 0;
  };

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Connect" breadcrumbItem="Support" />
      {isLoading && <ScreenLoader />}
      <div className="radio-button-wrapper">
        <div className="radio-button-container">
          <label className={`radio-label ${supportMsgType === "In Process" ? "active" : ""}`}>
            <input
              type="radio"
              value="In Process"
              checked={supportMsgType === "In Process"}
              onChange={handleRadioChange}
            />
            In Process ({getCount("In Process")})
          </label>
          <label className={`radio-label ${supportMsgType === "Resolved" ? "active" : ""}`}>
            <input
              type="radio"
              value="Resolved"
              checked={supportMsgType === "Resolved"}
              onChange={handleRadioChange}
            />
            Resolved ({getCount("Resolved")}){" "}
          </label>
        </div>
        <label>
          Total : ({getCount("Resolved") + getCount("In Process")})
        </label>
      </div>
      <Container fluid={true}>
        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={
            Array.isArray(supportList)
              ? supportList.filter((item) =>
                supportMsgType === "In Process"
                  ? item.supportStatus === "NO" ||
                  item.supportStatus === null
                  : item.supportStatus === "YES"
              )
              : []
          }
          pagination
        />
      </Container>
    </PageContent>
  );
}
