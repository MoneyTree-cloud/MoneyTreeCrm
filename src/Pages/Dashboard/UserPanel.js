import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { defaultTheme } from "../../helpers/defaultTheme";
import { GET_ALL_DASHBOARD_DATA } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import { decryptData } from "../../components/Common/CryptoUtils";

const UserPanel = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();
  const { data } = useGet(GET_ALL_DASHBOARD_DATA);
  const [dashboardDataCountData, setDashboardDataCountData] = useState({});

  useEffect(() => {
    if (data?.data?.status === 1) {
      decryptData(data?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setDashboardDataCountData(decryptedData);
        } else {
          setDashboardDataCountData({});
        }
      });
    }
  }, [data]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const cardStyle = {
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
  };

  const hoverStyle = {
    transform: "translateY(-5px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    backgroundColor: "#f8f9fa",
    borderRadius: "5px",
  };

  const cardBodyStyle = { margin: "-0.7rem" };
  const cardBodyStyleNew = { padding: "-0.9drem" };

  const handleMouseEnter = (cardId) => {
    setHoveredCard(cardId);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
  };

  return (
    <React.Fragment>
      <Row>
        <Col xl={4} sm={6}>
          <Card
            style={{
              ...cardStyle,
              ...(hoveredCard === "prospects" ? hoverStyle : {}),
            }}
            onMouseEnter={() => handleMouseEnter("prospects")}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleNavigation("/prospect-list")}
          >
            <CardBody>
              <div className="d-flex" style={{ ...cardBodyStyleNew }}>
                <div className="flex-shrink-0 me-3 align-self-center">
                  <i
                    className="mdi mdi-account-plus"
                    style={{
                      fontSize: "2rem",
                      color: defaultTheme.goldColorLogo,
                    }}
                  ></i>
                </div>
                <div
                  className="flex-grow-1 overflow-hidden"
                  style={{ ...cardBodyStyle }}
                >
                  <p
                    className="mb-1 fw-bold fs-6"
                    style={{ color: defaultTheme.primary }}
                  >
                    Prospects
                  </p>
                  <div className="d-flex flex-column mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="font-size-11">Total Prospects</span>
                      <span className="fw-bold font-size-10">
                        {dashboardDataCountData?.totalProspect || 0}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span className="font-size-11">Total Associates</span>
                      <span className="fw-bold font-size-10">
                        {dashboardDataCountData?.totalAssociate || 0}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span className="font-size-11">Very Hot/Hot</span>
                      <span className="fw-bold font-size-10">
                        {(dashboardDataCountData?.hotprospect || 0) +
                          "/" +
                          (dashboardDataCountData?.veryhotprospect || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={4} sm={6}>
          <Card
            style={{
              ...cardStyle,
              ...(hoveredCard === "sales" ? hoverStyle : {}),
            }}
            onMouseEnter={() => handleMouseEnter("sales")}
            onMouseLeave={handleMouseLeave}
          // onClick={() => handleNavigation("/sales-list")}
          >
            <CardBody>
              <div className="d-flex" style={{ ...cardBodyStyleNew }}>
                <div className="flex-shrink-0 me-3 align-self-center">
                  <i
                    className="mdi mdi-account-group"
                    style={{
                      fontSize: "2rem",
                      color: defaultTheme.goldColorLogo,
                    }}
                  ></i>
                </div>

                <div className="flex-grow-1 overflow-hidden">
                  <p
                    className="mb-1 fw-bold fs-6"
                    style={{ color: defaultTheme.primary }}
                  >
                    Sales
                  </p>
                  <div className="d-flex flex-column mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="font-size-11">Total</span>
                      <span className="fw-bold font-size-10">
                        {dashboardDataCountData?.totalsale || 0}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span className="font-size-11">Completed</span>
                      <span className="fw-bold font-size-10">
                        {dashboardDataCountData?.copletedsale || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xl={4} sm={6}>
          <Card
            style={{
              ...cardStyle,
              ...(hoveredCard === "meetings" ? hoverStyle : {}),
            }}
            onMouseEnter={() => handleMouseEnter("meetings")}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleNavigation("/associate-meeting")}
          >
            <CardBody>
              <div className="d-flex" style={{ ...cardBodyStyle }}>
                <div className="flex-shrink-0 me-3 align-self-center">
                  <i
                    className="mdi mdi-calendar-check"
                    style={{
                      fontSize: "2rem",
                      color: defaultTheme.goldColorLogo,
                    }}
                  ></i>
                </div>

                <div className="flex-grow-1 overflow-hidden">
                  <p
                    className="mb-1 fw-bold fs-6"
                    style={{ color: defaultTheme.primary }}
                  >
                    Total Meeting
                  </p>
                  <div className="d-flex flex-column mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="font-size-11">Done</span>
                      <span className="fw-bold font-size-10">
                        {dashboardDataCountData?.totalMeetingdone || 0}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span className="font-size-11">Started</span>
                      <span className="fw-bold font-size-10">
                        {dashboardDataCountData?.totalMeetingstated || 0}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span className="font-size-11">Upcoming</span>
                      <span className="fw-bold font-size-10">
                        {dashboardDataCountData?.totalMeetingupcoming || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default UserPanel;
