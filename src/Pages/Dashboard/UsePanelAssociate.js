import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useGet } from "../../Hooks/useApi";
import { PROSPECT_DASHBOARD_DATA } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import { decryptData } from "../../components/Common/CryptoUtils";

// React Icons
import { FaUsers, FaCalendarCheck, FaRegClock, FaFire } from "react-icons/fa";
import { MdPendingActions } from "react-icons/md";

const UsePanelAssociate = () => {
  const navigate = useNavigate();
  const { userId, mainTl, subTl } = useUserStore((state) => state.user);
  const { data } = useGet(PROSPECT_DASHBOARD_DATA + userId);
  const [dashboard, setDashboard] = useState({});

  useEffect(() => {
    if (data?.data?.status_code === 1) {
      decryptData(data?.data?.object).then((res) => {
        setDashboard(res || {});
      });
    }
  }, [data]);

  // Card theme sets
  const themes = {
    primary: {
      icon: "text-blue-600",
      mainStat: "text-blue-800",
      color: "#2563EB",
      lightBg: "#E0F2FE",
    },
    success: {
      icon: "text-green-600",
      mainStat: "text-green-800",
      color: "#10B981",
      lightBg: "#D1FAE5",
    },
    warning: {
      icon: "text-yellow-600",
      mainStat: "text-yellow-800",
      color: "#F59E0B",
      lightBg: "#FFFBEB",
    },
    danger: {
      icon: "text-red-600",
      mainStat: "text-red-800",
      color: "#EF4444",
      lightBg: "#FEE2E2",
    },
    info: {
      icon: "text-indigo-600",
      mainStat: "text-indigo-800",
      color: "#4F46E5",
      lightBg: "#EEF2FF",
    },
  };

  const StatCard = ({ title, icon, theme, mainStat, stats, onClick }) => {
    return (
      <div className="h-100">
        <Card
          onClick={onClick}
          className="rounded-3 shadow-sm border-0 cursor-pointer h-100 overflow-hidden stat-card"
        >
          {/* Top Color Bar */}
          <div style={{ height: "4px", backgroundColor: theme.color }} />

          {/* Main Content */}
          <div className="p-3 pb-0">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center">
                <div
                  className="p-1 me-2 rounded-2"
                  style={{
                    backgroundColor: theme.lightBg,
                    lineHeight: 1,
                  }}
                >
                  {React.cloneElement(icon, {
                    size: 16,
                    className: theme.icon,
                  })}
                </div>

                <h6
                  className="m-0 fw-bold text-uppercase text-dark"
                  style={{ fontSize: "0.8rem" }}
                >
                  {title}
                </h6>
              </div>

              <div className="text-end">
                <h4
                  className={`mb-0 fw-bolder ${theme.mainStat}`}
                  style={{ fontSize: "1.6rem" }}
                >
                  {mainStat.value}
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: "0.65rem" }}>
                  {mainStat.label}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div
            className="p-2 pt-3"
            style={{ borderTop: `1px solid ${theme.color}20` }}
          >
            <div className="d-flex justify-content-between align-items-end">
              {stats.map((item, i) => (
                <div key={i} className="text-center flex-fill mx-1">
                  <span
                    className="fw-bolder d-block"
                    style={{
                      fontSize: "0.9rem",
                      color:
                        item.badge === "danger"
                          ? themes.danger.color
                          : item.badge === "warning"
                          ? themes.warning.color
                          : themes.primary.color,
                    }}
                  >
                    {item.value}
                  </span>
                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: "0.6rem", lineHeight: 1 }}
                  >
                    {item.label?.split(" ")[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Prospect Main Stat Logic
  const prospectMainStat =
    mainTl === "YES" || subTl === "YES"
      ? {
          label: "Active / Resigned",
          value: `${dashboard.totalProspect || 0}/${
            dashboard.resignedProspect || 0
          }`,
        }
      : {
          label: "Total Prospects",
          value: dashboard.totalProspect || 0,
        };

  return (
    <div className="p-3 p-md-4" style={{ background: "#f4f6f9" }}>
      <Row className="g-4">
        <Col xl={4} lg={6} sm={12}>
          <StatCard
            title="Prospects"
            icon={<FaUsers />}
            theme={themes.primary}
            onClick={() => navigate("/prospect-list-count")}
            mainStat={prospectMainStat}
            stats={[
              { label: "Associates", value: dashboard.totalAssociate || 0 },
              { label: "Today", value: dashboard.todayProspect || 0 },
            ]}
          />
        </Col>

        <Col xl={4} lg={6} sm={12}>
          <StatCard
            title="Suspects"
            icon={<MdPendingActions />}
            theme={themes.info}
            onClick={() => navigate("/suspect-list-count")}
            mainStat={{
              label: "Pending",
              value: dashboard.pendingSuspect || 0,
            }}
            stats={[
              {
                label: "Rejected",
                badge: "danger",
                value: dashboard.rejectedSuspect || 0,
              },
              {
                label: "Today",
                badge: "warning",
                value: dashboard.todaySuspect || 0,
              },
            ]}
          />
        </Col>

        <Col xl={4} lg={6} sm={12}>
          <StatCard
            title="Monthly Meetings"
            icon={<FaCalendarCheck />}
            theme={themes.success}
            onClick={() => navigate("/meeting-list-count")}
            mainStat={{
              label: "Completed",
              value: dashboard.m_meetingDone || 0,
            }}
            stats={[
              {
                label: "Running",
                value: dashboard.m_tmeetingRunning || 0,
              },
              {
                label: "Cancelled",
                badge: "danger",
                value: dashboard.m_tmeetingReject || 0,
              },
            ]}
          />
        </Col>

        <Col xl={4} lg={6} sm={12}>
          <StatCard
            title="Total Meetings"
            icon={<FaRegClock />}
            theme={themes.primary}
            onClick={() => navigate("/meeting-list-count")}
            mainStat={{
              label: "Total Done",
              value: dashboard.t_meetingDone || 0,
            }}
            stats={[
              {
                label: "Running",
                value: dashboard.t_meetingRunning || 0,
              },
              {
                label: "Rejected",
                badge: "danger",
                value: dashboard.t_meetingReject || 0,
              },
            ]}
          />
        </Col>

        <Col xl={4} lg={6} sm={12}>
          <StatCard
            title="Upcoming Meetings"
            icon={<FaFire />}
            theme={themes.danger}
            onClick={() => navigate("/prospect-list-menu")}
            mainStat={{
              label: "Upcoming",
              value: dashboard.upcomingMeeting || 0,
            }}
            stats={[
              {
                label: "Hot",
                badge: "warning",
                value: dashboard.hotMeeting || 0,
              },
              {
                label: "V.Hot",
                badge: "danger",
                value: dashboard.veryHotMeeting || 0,
              },
            ]}
          />
        </Col>
      </Row>
    </div>
  );
};

export default UsePanelAssociate;
