/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { GET_SUSPECT_DATA } from "../../helpers/url_helper";
import { formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";

export default function SuspectListCount() {
    const userId = useUserStore((state) => state.user.userId);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isPending, setIsPending] = useState(false)
    const [suspectData, setSuspectData] = useState([])

    // Calculate the first and last dates of the current month
    useEffect(() => {
        getSuspectDetailsInit()
    }, []);

    const getSuspectDetailsInit = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the month

        setFromDate(formatDateForInput(startOfMonth)); // Set default from date
        setToDate(formatDateForInput(endOfMonth)); // Set default to date

        // Set the initial API URL
        getSuspectDetails(
            `${GET_SUSPECT_DATA}${userId}&startDate=${formatDateForInput(startOfMonth)}&endDate=${formatDateForInput(endOfMonth)}`
        );
    }

    const getSuspectDetails = (apiUrl) => {
        setIsPending(true)
        ApiClient.get(apiUrl).then(function (response) {
            setIsPending(false);
            if (response.data.status === 1) {
                setSuspectData(response.data.data)
            }
            else {
                toast.error(response.data.message)
            }

        })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    }

    const handleShowData = (e) => {
        if (e) e.preventDefault()
        const startDate = formatDateForInput(new Date(fromDate));
        const endDate = formatDateForInput(new Date(toDate));
        getSuspectDetails(`${GET_SUSPECT_DATA}${userId}&startDate=${startDate}&endDate=${endDate}`);
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "8%",
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            selector: (row) => row.associateId,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.associateName + ' (' + row.associateId + ')'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Total Suspects</span>,
            selector: (row) => row.totalSuspectCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.totalSuspectCount}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Pending Suspects</span>,
            selector: (row) => row.totalPendingCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.totalPendingCount}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Rejected Suspects</span>,
            selector: (row) => row.totalRejectedCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.totalRejectedCount}</WordWrapCell>
        }
    ];

    return (
        <PageContent>
            {isPending && <ScreenLoader />}
            <Breadcrumbs title="Associate" breadcrumbItem="Suspect List" />
            <Container fluid={true}>
                <form onSubmit={handleShowData}>
                    <Card>
                        <CardBody>
                            <Row className="g-3">
                                <Col lg="4">
                                    <h6 className="font-size-11">From Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col lg="4">
                                    <h6 className="font-size-11">To Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </Col>
                                <Col
                                    lg="4"
                                    className="d-flex align-items-end"
                                >
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={handleShowData}
                                    >
                                        Show Data
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary ms-2"
                                        onClick={getSuspectDetailsInit}
                                    >
                                        Clear
                                    </button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </form>
                <AppTable
                    progressPending={isPending}
                    columns={columns}
                    data={suspectData}
                    pagination
                />
            </Container>
        </PageContent>
    );
}
