import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { HR_INTERVIEW_REPORT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";

export default function HrInterviewReport() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [hrInterviewReport, setHrInterviewReport] = useState([]);
    const [isPending, setIsPending] = useState(false);

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "6%",
            cell: (_, index) => index + 1,
        },
        {
            name: <span className="font-weight-bold fs-13">Total Candidate</span>,
            selector: (row) => row.totalCandidate,
            cell: (row) => <WordWrapCell>{row.totalCandidate}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Not Came</span>,
            selector: (row) => row.notCame,
            cell: (row) => <WordWrapCell>{row.notCame}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Selected</span>,
            selector: (row) => row.selected,
            cell: (row) =>
                <WordWrapCell>{row.selected}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Not Selected</span>,
            selector: (row) => row.notSelected,
            cell: (row) => <WordWrapCell>{row.notSelected}</WordWrapCell>,
            sortable: true,
        }
    ];

    const getCallDetails = () => {
        setIsPending(true);
        ApiClient.get(`${HR_INTERVIEW_REPORT}${fromDate}&toDate=${toDate}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    const result = response.data.data;
                    // ✅ Convert object to array with one item
                    const dataAsArray = result ? [result] : [];
                    setHrInterviewReport(dataAsArray);
                } else {
                    toast.error(response.data.message);
                    setHrInterviewReport([]);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                setHrInterviewReport([]);
                toast.error(error.message);
            });
    };

    useEffect(() => {
        setTodayDate();
    }, []);

    const setTodayDate = () => {
        const today = new Date();
        setFromDate(formatDateForInput(today));
        setToDate(formatDateForInput(today));
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
        setTodayDate();
        setHrInterviewReport([]);
    };

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Interview Details" />
            {isPending && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowButton}>
                            <Row>
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

                {hrInterviewReport.length > 0 && (
                    <AppTable
                        progressSales={isPending}
                        columns={columns}
                        data={hrInterviewReport}
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
