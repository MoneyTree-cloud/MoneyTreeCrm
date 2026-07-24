/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatActionType, formatDate, formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { HR_INTERVIEW_REPORT, HR_INTERVIEW_REPORT_DETAILS } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function HrInterviewDetailsReport() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [hrInterviewReport, setHrInterviewReport] = useState({});
    const [hrInterviewReportDetails, setHrInterviewReportDetails] = useState([]);
    const [isPending, setIsPending] = useState(false);
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'view-interview-report-details');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                setTodayDate();
            }
        };
        checkAccess();
    }, [userId]);

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "6%",
            cell: (_, index) => index + 1,
        },
        {
            name: <span className="font-weight-bold fs-13">Interview Date</span>,
            selector: (row) => row.interviewDate,
            cell: (row) => <WordWrapCell>{formatDate(row.interviewDate)}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Candidate Name</span>,
            selector: (row) => row.name,
            cell: (row) => <WordWrapCell>{row.name}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Created By</span>,
            selector: (row) => row.createdByName,
            cell: (row) => <WordWrapCell>{row.createdByName}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Status</span>,
            selector: (row) => row.status,
            cell: (row) => <WordWrapCell>{formatActionType(row.status)}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Referral</span>,
            selector: (row) => row.referral,
            cell: (row) => <WordWrapCell>{row.referral ? 'Yes' : 'No'}</WordWrapCell>,
            sortable: true,
        }
    ];

    const getCallDetails = (fromDate, toDate) => {
        setIsPending(true);
        ApiClient.get(`${HR_INTERVIEW_REPORT}${fromDate}&toDate=${toDate}`)
            .then(function (response) {
                if (response?.data?.status === 1) {
                    const result = response.data.data;
                    setHrInterviewReport(result);
                    ApiClient.get(`${HR_INTERVIEW_REPORT_DETAILS}${fromDate}&toDate=${toDate}`)
                        .then(function (response) {
                            setIsPending(false);
                            if (response?.data?.status === 1) {
                                const result = response.data.data;
                                setHrInterviewReportDetails(result);
                            } else if (response.data.message !== 'No record found.') {
                                toast.error(response.data.message);
                                setHrInterviewReportDetails([]);
                            }
                        })
                        .catch(function (error) {
                            setIsPending(false);
                            setHrInterviewReportDetails([]);
                            toast.error(error.message);
                        });
                } else {
                    toast.error(response.data.message);
                    setHrInterviewReport({});
                    setIsPending(false);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                setHrInterviewReport({});
                toast.error(error.message);
            });

    };

    const setTodayDate = () => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        setFromDate(formatDateForInput(startOfMonth));
        setToDate(formatDateForInput(today));
        getCallDetails(formatDateForInput(startOfMonth), formatDateForInput(today));
    };

    const handleShowButton = (e) => {
        e.preventDefault();
        if (!fromDate) {
            toast.error("Please Enter Start Date");
        } else if (!toDate) {
            toast.error("Please Enter End Date");
        } else {
            getCallDetails(fromDate, toDate);
        }
    };

    const handleClear = () => {
        setTodayDate();
        setHrInterviewReportDetails([]);
        setHrInterviewReport({})
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Interview Details" />
            {isPending && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowButton}>
                            <Row className="g-3">
                                <Col md="4">
                                    <h6 className="font-size-12">From Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="4">
                                    <h6 className="font-size-12">To Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="3" className="d-flex align-items-end">
                                    <Button
                                        color="primary"
                                        type="submit"
                                        className="me-2"
                                    >
                                        Show
                                    </Button>
                                    <Button
                                        color="secondary"
                                        type="button"
                                        onClick={handleClear}
                                    >
                                        Clear
                                    </Button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                {Object.keys(hrInterviewReport)?.length > 0 &&
                    <div>

                        <Row className='mt-3'>
                            <Col md="3">
                                <p>
                                    <strong>Total Candidate:</strong> {hrInterviewReport?.totalCandidate}
                                </p>
                            </Col>
                            <Col md="2">
                                <p>
                                    <strong>Referral:</strong> {hrInterviewReport?.referral}
                                </p>
                            </Col>
                            <Col md="2">
                                <p>
                                    <strong>Not Came:</strong> {hrInterviewReport?.notCame}
                                </p>
                            </Col>
                            <Col md="2">
                                <p>
                                    <strong>Selected:</strong> {hrInterviewReport?.selected}
                                </p>
                            </Col>
                            <Col md="3">
                                <p>
                                    <strong>Not Selected:</strong> {hrInterviewReport?.notSelected}
                                </p>
                            </Col>
                        </Row>
                        <hr className="dashed-divider" />

                    </div>
                }

                {hrInterviewReportDetails.length > 0 && (
                    <AppTable
                        progressSales={isPending}
                        columns={columns}
                        data={hrInterviewReportDetails}
                        pagination
                        conditionalRowStyles={[
                            {
                                when: row => row.isTotalRow,
                                style: {
                                    color: defaultTheme.goldColorLogo,
                                    fontWeight: "bold",
                                    backgroundColor: "#fffaf0",
                                },
                            },
                        ]}
                    />
                )}
            </Container>
        </PageContent>
    );
}