import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { formatDateForInput, generateTimestamp, RequiredStar } from "../../helpers/function_helper";
import { EXCEL_DOWNLOAD_EVENT_MEETING_DETAILS } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css"; // Import your CSS file
import { toast } from "react-toastify";
import ApiClient from "../../helpers/api_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function EventMeetingDetails() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'event-meeting-details');
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

    const downloadExcel = () => {
        setIsPending(true)
        ApiClient.get(`${EXCEL_DOWNLOAD_EVENT_MEETING_DETAILS}${fromDate}&toDate=${toDate}`, { responseType: "arraybuffer" })
            .then((response) => {
                setIsPending(false);
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
                link.download = `Event_Meeting_Details_${generateTimestamp()}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((error) => {
                setIsPending(false);
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
            <Breadcrumbs title="Event" breadcrumbItem="Meeting Details" />
            {(isPending) && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <Row className="mb-3">
                            <Col md="4">
                                <h6 className="font-size-11">From Date <RequiredStar/></h6>
                                <input
                                    className="form-control"
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </Col>
                            <Col md="4">
                                <h6 className="font-size-11">To Date <RequiredStar/></h6>
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
                                        onClick={downloadExcel}
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
