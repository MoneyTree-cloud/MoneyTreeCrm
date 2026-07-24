/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { CONNECT_DASHBOARD_DATA_DETAILS } from "../../helpers/url_helper";
import { formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";

export default function ConnectListDetails() {
    const userId = useUserStore((state) => state.user.userId);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [connectData, setConnectData] = useState([]);
    const [isPending, setIsPending] = useState(false)

    // Calculate the first and last dates of the current month
    useEffect(() => {
        getConnectDetailsInit()
    }, []);

    const getConnectDetailsInit = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        setFromDate(formatDateForInput(startOfMonth));
        setToDate(formatDateForInput(endOfMonth));

        getSuspectDetails(
            `${CONNECT_DASHBOARD_DATA_DETAILS}${userId}&fromDate=${formatDateForInput(
                startOfMonth
            )}&toDate=${formatDateForInput(endOfMonth)}`
        );
    }

    const getSuspectDetails = (apiUrl) => {
        setIsPending(true)
        ApiClient.get(apiUrl).then(function (response) {
            setIsPending(false);
            if (response.data.status === 1) {
                setConnectData(response.data.data)
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

    const handleShowData = () => {
        getSuspectDetails(
            `${CONNECT_DASHBOARD_DATA_DETAILS}${userId}&fromDate=${fromDate}&toDate=${toDate}`
        );
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "10%",
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Id</span>,
            selector: (row) => row.associateCode,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.associateCode}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Name</span>,
            selector: (row) => row.associateName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.associateName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Connect Name</span>,
            selector: (row) => row.connectName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.connectName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Suspect Count</span>,
            selector: (row) => row.suspectCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.suspectCount}</WordWrapCell>,
        },
    ];

    return (
        <PageContent>
            {isPending && <ScreenLoader />}
            <Breadcrumbs title="Associate" breadcrumbItem="Connect Details" />
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <Row>
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
                                className="d-flex justify-content-center align-items-center"
                            >
                                <div className="d-flex align-items-center mt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={handleShowData}
                                    >
                                        Show Data
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary ms-3"
                                        onClick={getConnectDetailsInit}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                {connectData?.length > 0 &&
                    <AppTable
                        progressPending={isPending}
                        columns={columns}
                        data={connectData}
                        pagination
                    />
                }
            </Container>
        </PageContent>
    );
}
