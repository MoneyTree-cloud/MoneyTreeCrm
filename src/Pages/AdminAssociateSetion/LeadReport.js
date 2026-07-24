/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Nav, NavItem, NavLink } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { defaultTheme } from "../../helpers/defaultTheme";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { generateTimestamp } from "../../helpers/function_helper";
import { DOWNLOAD_ENQUIRY_REPORT, DOWNLOAD_GOOGLE_LEAD_REPORT, DOWNLOAD_META_LEAD_REPORT } from "../../helpers/url_helper";
import { FaFacebookF, FaGoogle, FaQuestionCircle } from 'react-icons/fa';  // Add icons for the tabs

export default function LeadReport() {
  const { userId, role } = useUserStore((state) => state.user);
  const [accessGranted, setAccessGranted] = useState(null);
  const [platform, setPlatform] = useState("Meta");
  const [pending, setPending] = useState(false);
  const [activeTab, setActiveTab] = useState("Meta");

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'lead-report');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId, role]);

  const iconStyle = {
    color: defaultTheme.primary,
    cursor: "pointer",
    fontSize: "20px",
    marginTop: "20px",
    transition: "color 0.3s ease",
  };

  const downloadReportExcel = () => {
    let url = '';
    if (platform === 'Meta') {
      url = DOWNLOAD_META_LEAD_REPORT;
    } else if (platform === 'Google') {
      url = DOWNLOAD_GOOGLE_LEAD_REPORT;
    } else if (platform === 'Website/Hotline') {
      url = DOWNLOAD_ENQUIRY_REPORT;
    }
    setPending(true);
    ApiClient.get(url, { responseType: "arraybuffer" })
      .then((response) => {
        setPending(false);
        const contentType = response.headers["content-type"];

        if (
          contentType !==
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
          const errorResponse = new TextDecoder("utf-8").decode(new Uint8Array(response.data));
          try {
            const parsedError = JSON.parse(errorResponse);
            toast.error(parsedError.message || "Failed to download Excel file.");
          } catch {
            toast.error("Unexpected error occurred while downloading Excel file.");
          }
          return;
        }

        const blob = new Blob([response.data], { type: contentType });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `leadReport_${platform}_${generateTimestamp()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        setPending(false);
        toast.error(error.message || "An unexpected error occurred.");
      });
  };

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />;
  }

  return (
    <PageContent>
      <Breadcrumbs title="Report" breadcrumbItem="Lead Report" />
      <Container fluid={true}>
        {pending && <ScreenLoader />}
        <Card className="shadow-sm rounded-lg">
          <CardBody>
            {/* Tab Navigation for Platforms */}
            <Row>
              <Col md="12" className="text-center">
                <Nav tabs className="d-flex justify-content-center">
                  {["Meta", "Google", "Website/Hotline"].map((platformTab) => (
                    <NavItem key={platformTab} className="mx-2">
                      <NavLink
                        className={`${activeTab === platformTab ? "active" : ""}`}
                        style={{
                          fontSize: "16px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          borderRadius: "30px",
                          padding: "7px 20px",
                          transition: "all 0.3s ease",
                          backgroundColor:
                            activeTab === platformTab ? defaultTheme.primary : "#f4f6f9",
                          color: activeTab === platformTab ? "#fff" : "#555",
                          boxShadow: activeTab === platformTab ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none",
                        }}
                        onClick={() => {
                          setActiveTab(platformTab);
                          setPlatform(platformTab);
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          {platformTab === "Meta" && <FaFacebookF />}
                          {platformTab === "Google" && <FaGoogle />}
                          {platformTab === "Website/Hotline" && <FaQuestionCircle />}
                          <span>{platformTab}</span>
                        </div>

                      </NavLink>
                    </NavItem>
                  ))}
                </Nav>
              </Col>
            </Row>

            {/* Excel Download Icon */}
            <Row className="d-flex justify-content-center mt-4">
              <Col md="auto">
                <i
                  title="Download Excel"
                  className="fas fa-file-excel"
                  style={iconStyle}
                  onClick={downloadReportExcel}
                />
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>
    </PageContent>
  );
}
