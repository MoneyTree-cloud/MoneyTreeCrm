/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { HR_MAIN_TEAM_REPORT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function HrMainTeamReport() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [hrMTReport, setHrMTReport] = useState([]);
    const [isPending, setIsPending] = useState(false);
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'hr-main-team-report');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                setDefaultDateRange();
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
            name: <span className="font-weight-bold fs-13">Main Team</span>,
            selector: (row) => row.main_team,
            cell: (row) => <WordWrapCell>{row.main_team}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Sub Team</span>,
            selector: (row) => row.sub_team,
            cell: (row) => <WordWrapCell>{row.sub_team}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Assigned</span>,
            selector: (row) => row.assigned,
            cell: (row) => <WordWrapCell>{row.assigned}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Hold</span>,
            selector: (row) => row.hold,
            cell: (row) => <WordWrapCell>{row.hold}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Reject</span>,
            selector: (row) => row.reject,
            cell: (row) => <WordWrapCell>{row.reject}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Offered</span>,
            selector: (row) => row.hired,
            cell: (row) => <WordWrapCell>{row.hired}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Joined</span>,
            selector: (row) => row.joined,
            cell: (row) => <WordWrapCell>{row.joined}</WordWrapCell>,
            sortable: true,
        },
    ];

    // API Call with custom or state-based dates
    const getCallDetails = (start = fromDate, end = toDate) => {
        setIsPending(true);
        ApiClient.get(`${HR_MAIN_TEAM_REPORT}${start}&toDate=${end}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    const result = response.data.data;

                    // Calculate totals
                    const totalRow = {
                        main_team: "Total",
                        assigned: 0,
                        hold: 0,
                        reject: 0,
                        hired: 0,
                        joined: 0,
                        isTotalRow: true,
                    };

                    result.forEach(item => {
                        totalRow.assigned += Number(item.assigned || 0);
                        totalRow.hold += Number(item.hold || 0);
                        totalRow.reject += Number(item.reject || 0);
                        totalRow.hired += Number(item.hired || 0);
                        totalRow.joined += Number(item.joined || 0);
                    });

                    setHrMTReport([...result, totalRow]);

                } else {
                    toast.error(response.data.message);
                    setHrMTReport([]);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                setHrMTReport([]);
                toast.error(error.message);
            });
    };

    // Set first day of month and today as default date range
    const setDefaultDateRange = () => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const formattedFromDate = formatDateForInput(firstDayOfMonth);
        const formattedToDate = formatDateForInput(today);

        setFromDate(formattedFromDate);
        setToDate(formattedToDate);

        // Call API immediately
        getCallDetails(formattedFromDate, formattedToDate);
    };

    const handleShowButton = (e) => {
        e.preventDefault();
        if (!fromDate) {
            toast.error("Please Enter Start Date");
        } else if (!toDate) {
            toast.error("Please Enter End Date");
        } else {
            getCallDetails();
        }
    };

    const handleClear = () => {
        setDefaultDateRange();
        setHrMTReport([]);
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Main Team Details" />
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
                                        max={toDate}
                                    />
                                </Col>
                                <Col md="4">
                                    <h6 className="font-size-12">To Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        max={formatDateForInput(new Date())}
                                        min={fromDate}
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

                {hrMTReport.length > 0 && (
                    <AppTable
                        progressSales={isPending}
                        columns={columns}
                        data={hrMTReport}
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
