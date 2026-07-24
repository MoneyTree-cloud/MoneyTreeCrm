/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { HR_EMPLOYEE_REPORT_DETAILS } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import ApiClient from "../../helpers/api_helper";

export default function JoiningResignedReport() {
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [hrReport, setHrReport] = useState([]);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'view-employee-details');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                setTodayDate();
            }
        };
        checkAccess();
    }, [userId]);

    const getCallDetails = (fromDate, toDate) => {
        setIsPending(true)
        ApiClient.get(`${HR_EMPLOYEE_REPORT_DETAILS}${fromDate}&toDate=${toDate}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    setHrReport(response.data.data);
                } else {
                    toast.error(response.data.message);
                    setHrReport([]);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                setHrReport([]);
                toast.error(error.message);
            });
    }

    const setTodayDate = () => {
        const today = new Date(); // Get today's date
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setFromDate(formatDateForInput(startOfMonth));
        setToDate(formatDateForInput(today));
        getCallDetails(formatDateForInput(startOfMonth), formatDateForInput(today)); // Fetch data for the current month
    };

    const totalRow = {
        recruiterName: "Total",
        Active: hrReport.reduce((sum, row) => sum + row.Active, 0),
        Resigned: hrReport.reduce((sum, row) => sum + row.Resigned, 0),
        isTotalRow: true
    };

    const tableData = [...hrReport || [], totalRow];

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "6%",
            cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Recruiter Details</span>,
            selector: (row) => row.recruiterName,
            cell: (row) =>
                row.isTotalRow ? (
                    <strong>Total</strong>
                ) : (
                    <WordWrapCell>{row.recruiterName + ' (' + row.recruiter_code + ')'}</WordWrapCell>
                ),
            sortable: true
        },
        {
            name: <span className="font-weight-bold fs-13">Active</span>,
            selector: (row) => row.Active,
            cell: (row) => <WordWrapCell>{row.Active}</WordWrapCell>,
            sortable: true
        },
        {
            name: <span className="font-weight-bold fs-13">Resigned</span>,
            selector: (row) => row.Resigned,
            cell: (row) => <WordWrapCell>{row.Resigned}</WordWrapCell>,
            sortable: true
        }
    ];

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

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
        setHrReport([]);
    };

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Joining/Resigned Report" />
            {isPending && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowButton}>
                            <Row className="g-3">
                                <Col md="4">
                                    <h6 className=" font-size-12">From Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        id="date-input-1"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="4">
                                    <h6 className=" font-size-12">To Date</h6>
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
                {tableData.length > 0 && (
                    <AppTable
                        progressSales={isPending}
                        columns={columns}
                        data={tableData}
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
