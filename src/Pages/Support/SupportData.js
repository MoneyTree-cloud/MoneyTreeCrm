import { useEffect, useState } from "react";
import "../CSS/whatsapp.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useGet } from "../../Hooks/useApi";
import { LIST_SUPPORT_MESSAGES } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { IoChatbubblesOutline } from "react-icons/io5";

function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export default function SuppportData() {
  const navigation = useNavigate();
  const location = useLocation();
  const { supportMsgType_ } = location.state || {};
  const [accessGranted, setAccessGranted] = useState(null);
  const userId = useUserStore((state) => state.user.userId);
  const [supportMsgType, setSupportMsgType] = useState("In Process");

  useEffect(() => {
    if (supportMsgType_) setSupportMsgType(supportMsgType_);
  }, [supportMsgType_]);

  const { data: supportList, isLoading } = useGet(LIST_SUPPORT_MESSAGES + userId, {
    enabled: !!accessGranted,
  });

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, "support");
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  if (accessGranted === null) return <ScreenLoader />;
  if (!accessGranted) return <PermissionMissing />;

  const allData = Array.isArray(supportList?.data?.data) ? supportList.data.data : [];

  const filtered = allData.filter((item) =>
    supportMsgType === "In Process"
      ? item.supportStatus === "NO" || item.supportStatus === null
      : item.supportStatus === "YES"
  );

  const inProcessCount = allData.filter(
    (item) => item.supportStatus === "NO" || item.supportStatus === null
  ).length;

  const resolvedCount = allData.filter((item) => item.supportStatus === "YES").length;

  const handleViewComplaint = (row) => {
    navigation("/support/view-complaint", { state: { row, supportMsgType } });
  };

  return (
    <div className="page-content wa-page-wrap">
    <div className="wa-page">
      {isLoading && <ScreenLoader />}

      {/* Header */}
      {/* <div className="wa-header">
        <span className="wa-header-title">Support</span>
        <span style={{ fontSize: 13, opacity: 0.75 }}>
          Total: {inProcessCount + resolvedCount}
        </span>
      </div> */}

      {/* Tabs */}
      <div className="wa-tabs">
        <button
          className={`wa-tab ${supportMsgType === "In Process" ? "active" : ""}`}
          onClick={() => setSupportMsgType("In Process")}
        >
          In Process
          {inProcessCount > 0 && (
            <span className="wa-tab-badge">{inProcessCount}</span>
          )}
        </button>
        <button
          className={`wa-tab ${supportMsgType === "Resolved" ? "active" : ""}`}
          onClick={() => setSupportMsgType("Resolved")}
        >
          Resolved
          {resolvedCount > 0 && (
            <span className="wa-tab-badge">{resolvedCount}</span>
          )}
        </button>
      </div>

      {/* Chat List */}
      <div className="wa-chat-list">
        {filtered.length === 0 ? (
          <div className="wa-empty-list">
            <IoChatbubblesOutline size={56} />
            <p>No {supportMsgType} complaints</p>
          </div>
        ) : (
          filtered.map((item, idx) => (
            <div
              key={item.userId || idx}
              className="wa-chat-item"
              onClick={() => handleViewComplaint(item)}
            >
              <div className="wa-avatar wa-avatar-lg">
                {getInitials(item.userName || "?")}
              </div>
              <div className="wa-chat-body">
                <div className="wa-chat-top">
                  <span className="wa-chat-name">
                    {item.userName}
                    {item.employeeCode ? ` (${item.employeeCode})` : ""}
                  </span>
                  <span className="wa-chat-time">{item.messageSentDate}</span>
                </div>
                <div className="wa-chat-bottom">
                  <span className="wa-chat-preview">
                    {item.message
                      ? item.message.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "")
                      : "No messages yet"}
                  </span>
                  {supportMsgType === "In Process" && (
                    <span className="wa-unread-dot" title="In Process" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </div>
  );
}
