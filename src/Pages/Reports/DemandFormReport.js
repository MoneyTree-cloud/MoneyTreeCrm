import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { formatDateForInput } from "../../helpers/function_helper";
import { DEMAND_FORM_REPORT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css"; // Import your CSS file
import { toast } from "react-toastify";
import ApiClient from "../../helpers/api_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function DemandFormReport() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'demand-form-report');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                setTodayDate();
            }
        };
        checkAccess();
    }, [userId]);

    const setTodayDate = () => {
        const today = new Date(); // Get today's date
        setFromDate(formatDateForInput(today));
        setToDate(formatDateForInput(today));
    };

    const downloadDemandFormExcel = () => {
        setIsPending(true)
        ApiClient.get(`${DEMAND_FORM_REPORT}${fromDate}&toDate=${toDate}`, { responseType: "arraybuffer" })
            .then(function (response) {
                setIsPending(false)
                // Check if the response is an Excel file
                const contentType = response.headers["content-type"];

                if (
                    contentType !==
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ) {
                    // Assuming the response is an error response
                    const errorResponse = new TextDecoder("utf-8").decode(
                        new Uint8Array(response.data)
                    );
                    const parsedError = JSON.parse(errorResponse);

                    // Check if it has the expected structure
                    if (parsedError.status === 0) {
                        toast.error(parsedError.message || "Something went wrong!");
                    } else {
                        toast.error("Unexpected error occurred!");
                    }
                    return;
                }

                // Proceed to download the Excel file
                const blob = new Blob([response.data], {
                    type: contentType,
                });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = "demand_form_report.xlsx";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(function (error) {
                setIsPending(false)
                toast.error(error.message || "An unexpected error occurred.");
            });
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Demand Form" />
            {isPending && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <Row className="mb-3">
                            <Col md="4">
                                <h6 className="mb-1 font-size-11">From Date</h6>
                                <input
                                    className="form-control"
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </Col>
                            <Col md="4">
                                <h6 className="mb-1 font-size-11">To Date</h6>
                                <input
                                    className="form-control"
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </Col>

                            <Col md="4 mt-4">
                                <div className="d-flex align-items-center">
                                    <i
                                        className="fas fa-file-excel"
                                        style={{
                                            color: defaultTheme.primary,
                                            cursor: "pointer",
                                            fontSize: "18px",
                                        }}
                                        onClick={downloadDemandFormExcel}
                                    ></i>


                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Container>


        </PageContent>
    );
}
