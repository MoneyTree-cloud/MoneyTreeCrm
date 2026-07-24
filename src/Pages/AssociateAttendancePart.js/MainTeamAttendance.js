import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { formatDateForInput, generateTimestamp, RequiredStar } from "../../helpers/function_helper";
import { GET_ALL_MAIN_TEAM_DROPDOWN_ID, GET_MAIN_TEAM_ATTENDANCE } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css"; // Import your CSS file
import { toast } from "react-toastify";
import ApiClient from "../../helpers/api_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import Select from "react-select";
import { useGet } from "../../Hooks/useApi";
import PermissionMissing from "../Utility/PermissonMissing";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";

export default function MainTeamAttendance() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [selectedMainTeams, setSelectedMainTeams] = useState(null);
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'view-team-attendance');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                setTodayDate();
            }
        };
        checkAccess();
    }, [userId]);

    const { data: mainTeams, isLoading } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN_ID, { enabled: Boolean(accessGranted) });

    const setTodayDate = () => {
        const today = new Date(); // Get today's date
        setFromDate(formatDateForInput(today));
        setToDate(formatDateForInput(today));
    };

    const downloadBookingStatusFormExcel = () => {
        if (!selectedMainTeams) {
            toast.error('Please Select Main Team')
            return;
        }
        const mainTeam = selectedMainTeams?.label?.match(/\(([^)]+)\)/g).pop().replace(/[()]/g, '').trim()
        setIsPending(true)
        ApiClient.get(`${GET_MAIN_TEAM_ATTENDANCE}fromDate=${fromDate}&toDate=${toDate}&mainTeam=${mainTeam}`, { responseType: "arraybuffer" })
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
                link.download = `${mainTeam}_${generateTimestamp()}.xlsx`;
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
            <Breadcrumbs title="Attendance" breadcrumbItem="Main Team" />
            {(isPending || isLoading) && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <Row className="mb-3">
                            <Col md="3">
                                <h6 className="font-size-11">From Date <RequiredStar /></h6>
                                <input
                                    className="form-control"
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </Col>
                            <Col md="3">
                                <h6 className="font-size-11">To Date <RequiredStar /></h6>
                                <input
                                    className="form-control"
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </Col>

                            <Col md="4">
                                <h6 className="font-size-11">Select Main Team <RequiredStar /></h6>
                                <Select
                                    isClearable
                                    value={selectedMainTeams}
                                    onChange={setSelectedMainTeams}
                                    options={mainTeams?.data?.data || []}
                                />
                            </Col>

                            <Col md="2 mt-4">
                                <div className="d-flex align-items-center">
                                    <i
                                        className="fas fa-file-excel"
                                        style={{
                                            color: defaultTheme.primary,
                                            cursor: "pointer",
                                            fontSize: "18px",
                                        }}
                                        onClick={downloadBookingStatusFormExcel}
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
