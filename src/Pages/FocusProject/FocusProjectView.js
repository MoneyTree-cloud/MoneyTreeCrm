import React from "react";
import { Card, CardBody, Row, Col, Container } from "reactstrap";
import { useGet } from "../../Hooks/useApi";
import { GET_ACTIVE_FOCUS_PROJECT } from "../../helpers/url_helper";
import PageContent from "../../components/Common/PageContent";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { formatDate } from "../../helpers/function_helper";
import { FaInbox } from "react-icons/fa";

export default function FocusProjectView() {
    const userId = useUserStore((state) => state.user.userId);
    const { data: focusProjectList, isLoading } = useGet(`${GET_ACTIVE_FOCUS_PROJECT}${userId}`);

    const projects = focusProjectList?.data?.data || [];

    return (
        <PageContent>
            <Container fluid>
                <Breadcrumbs title="Focus Project" breadcrumbItem="View Focus Project" />

                {/* Loading State */}
                {isLoading && <ScreenLoader />}

                {/* No Data */}
                {!isLoading && projects.length === 0 && (
                    <div className="d-flex justify-content-center align-items-center mt-5">
                        <Card
                            className="shadow-sm border-0 rounded-4 text-center"
                            style={{
                                width: "350px",
                                background:
                                    "linear-gradient(135deg, #f9fafb 0%, #eef2ff 100%)",
                                padding: "25px 15px",
                            }}
                        >
                            <CardBody>
                                <div
                                    className="mb-3 d-flex justify-content-center align-items-center"
                                    style={{
                                        width: "70px",
                                        height: "70px",
                                        backgroundColor: "#e0e7ff",
                                        borderRadius: "50%",
                                        margin: "0 auto",
                                    }}
                                >
                                    <FaInbox size={30} color="#4f46e5" />
                                </div>
                                <h5 className="fw-bold text-dark mb-1">
                                    No Focus Projects Found
                                </h5>
                                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                                    There are currently no active focus projects to display.
                                </p>
                            </CardBody>
                        </Card>
                    </div>
                )}

                {/* Projects List */}
                {projects.length > 0 &&
                    <Row className="mt-2 g-4">
                        {[...projects] // Create a copy so we don't mutate the original
                            .sort((a, b) => Number(b.focus) - Number(a.focus)) // Sort by focus descending
                            .map((project, index) => (
                                <Col lg="4" md="6" sm="12" key={index}>
                                    <Card
                                        className="shadow-lg border-0 rounded-4"
                                        style={{
                                            transition: "0.3s ease-in-out",
                                            background: "linear-gradient(135deg, #f9fafb 0%, #eef2ff 100%)",
                                        }}
                                    >
                                        <CardBody className="p-4">
                                            {/* Header */}
                                            {/* <h5 className="fw-bold text-primary mb-1">{project.builder}</h5> */}
                                            <h5 className="fw-bold text-primary mb-1">{project.project}</h5>
                                            <h6 className="text-dark mb-3">{project.builder}</h6>

                                            {/* Focus Project Period */}
                                            <div className="mb-2">
                                                <small className="text-muted d-block mb-1">
                                                    Period
                                                </small>
                                                <span className="fw-semibold text-dark">
                                                    {formatDate(project.fromDate)} → {formatDate(project.toDate)}
                                                </span>
                                            </div>

                                            {/* Focus Percentage */}
                                            <div>
                                                <small className="text-muted d-block">Focus your</small>
                                                <h4
                                                    className="fw-bold"
                                                    style={{
                                                        color: "#16a34a"
                                                        // project.focus >= 80
                                                        //     ? "#16a34a"
                                                        //     : project.focus >= 50
                                                        //         ? "#eab308"
                                                        //         : "#dc2626",
                                                    }}
                                                >
                                                    {project.focus}%
                                                </h4>
                                            </div>

                                        </CardBody>
                                    </Card>
                                </Col>
                            ))}
                    </Row>
                }

            </Container>
        </PageContent>
    );
}
