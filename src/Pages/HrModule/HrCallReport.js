/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { HR_CALL_REPORT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function HrCallReport() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [hrCallReport, setHrCallReport] = useState([]);
    const [isPending, setIsPending] = useState(false)
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'call-report');
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
            selector: (row, index) => row.isTotalRow ? "" : index + 1,
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">Name</span>,
            selector: (row) => row.name,
            cell: (row) =>
                row.isTotalRow ? (
                    <strong>Total</strong>
                ) : (
                    <WordWrapCell>{row.name + ' (' + row.employee_code + ')'}</WordWrapCell>
                ),
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">No. Of Calls</span>,
            selector: (row) => row["No. of Calls"],
            cell: (row) => (
                row.isTotalRow
                    ? <strong>{row["No. of Calls"]}</strong>
                    : <WordWrapCell>{row["No. of Calls"]}</WordWrapCell>
            ),
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Self</span>,
            selector: (row) => row["No. of Calls"] - row.Referral,
            cell: (row) => (
                row.isTotalRow
                    ? <strong>{row["No. of Calls"] - row.Referral}</strong>
                    : <WordWrapCell>{row["No. of Calls"] - row.Referral}</WordWrapCell>
            ),
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Referral</span>,
            selector: (row) => row.Referral,
            cell: (row) => (
                row.isTotalRow
                    ? <strong>{row.Referral}</strong>
                    : <WordWrapCell>{row.Referral}</WordWrapCell>
            ),
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Interview</span>,
            selector: (row) => row.Interview,
            cell: (row) => (
                row.isTotalRow
                    ? <strong>{row.Interview}</strong>
                    : <WordWrapCell>{row.Interview}</WordWrapCell>
            ),
            sortable: true,
        }
    ];

    const getCallDetails = (fromDate, toDate) => {
        setIsPending(true)
        ApiClient.get(`${HR_CALL_REPORT}${fromDate}&toDate=${toDate}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    setHrCallReport(response.data.data);
                } else {
                    toast.error(response.data.message);
                    setHrCallReport([]);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                setHrCallReport([]);
                toast.error(error.message);
            });
    };

    const setTodayDate = () => {
        const today = new Date(); // Get today's date
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setFromDate(formatDateForInput(startOfMonth));
        setToDate(formatDateForInput(today));
        getCallDetails(formatDateForInput(startOfMonth), formatDateForInput(today)); // Fetch data for the current month
    };

    const handleShowButton = (e) => {
        e.preventDefault()
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
        setHrCallReport([]);
    };

    const computeTotalRow = () => {
        let totalCalls = 0;
        let totalInterviews = 0;
        let totalReferral = 0;
        let totalSelf = 0;

        hrCallReport.forEach((row) => {
            totalCalls += parseInt(row["No. of Calls"] || 0);
            totalInterviews += parseInt(row.Interview || 0);
            totalSelf += parseInt(row["No. of Calls"] - row.Referral || 0);
            totalReferral += parseInt(row.Referral || 0);
        });

        return {
            name: "Total",
            employee_code: "",
            "No. of Calls": totalCalls,
            Interview: totalInterviews,
            Self: totalSelf,
            Referral: totalReferral,
            isTotalRow: true // flag to identify this row
        };
    };

    const tableData = hrCallReport.length > 0
        ? [...hrCallReport, computeTotalRow()]
        : [];

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }
    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Call Details" />
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
                                        id="date-input-1"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="4">
                                    <h6 className="font-size-12">To Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        id="date-input-2"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="3" className="d-flex align-items-end">
                                    <Button
                                        color="primary"
                                        type="submit"
                                        onClick={handleShowButton}
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

                {hrCallReport?.length > 0 && (
                    <AppTable
                        progressSales={isPending}
                        columns={columns}
                        data={tableData}
                        pagination
                        conditionalRowStyles={[
                            {
                                when: row => row.isTotalRow,
                                style: {
                                    color: defaultTheme.goldColorLogo, // gold color
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
