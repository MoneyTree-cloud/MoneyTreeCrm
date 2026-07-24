/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { BM_MEETING_DATA } from "../../helpers/url_helper";
import { formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { USER_TYPE } from "../../constants/global";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function BmMeetingScreen() {
    const { userId, role } = useUserStore((state) => state.user);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isPending, setIsPending] = useState(false)
    const [meetData, setMeetData] = useState([])
    const [accessGranted, setAccessGranted] = useState(null);

    useEffect(() => {
        const checkAccess = async () => {
            if (role !== USER_TYPE.ASSOCIATE) {
                const hasAccess = await CheckUserAccess(userId, 'bm-meeting-screen');
                setAccessGranted(hasAccess);
                if (hasAccess) {
                    getMeetingDetails()
                }
            }
            else {
                setAccessGranted(true);
                getMeetingDetails()
            }
        };
        checkAccess();
    }, [userId, role]);

    const getMeetingDetails = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        setFromDate(formatDateForInput(startOfMonth));
        setToDate(formatDateForInput(endOfMonth));

        getMeetDetails(
            `${BM_MEETING_DATA}${formatDateForInput(startOfMonth)}&toDate=${formatDateForInput(endOfMonth)}&userId=${userId}`
        );
    }

    const getMeetDetails = (url) => {
        setIsPending(true)
        ApiClient.get(url)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    setMeetData(response.data.data)
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    }

    const handleShowData = (e) => {
        e.preventDefault();
        getMeetDetails(`${BM_MEETING_DATA}${fromDate}&toDate=${toDate}&userId=${userId}`);
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, i) => i + 1,
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            selector: (row) => row.name,
            sortable: true,
            cell: (row) => <WordWrapCell> {row.name + ' (' + row.code + ')'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Total Meetings</span>,
            selector: (row) => row.count,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.count}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Start Count</span>,
            selector: (row) => row.startCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.startCount}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Cancel Count</span>,
            selector: (row) => row.cancelCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.cancelCount}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Main Team</span>,
            selector: (row) => row.mainTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.mainTeam}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Sub Team</span>,
            selector: (row) => row.subTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.subTeam}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Normal Meeting</span>,
            selector: (row) => row.endCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.endCount - row.sameDayMeetingCount}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Same Day Meeting</span>,
            selector: (row) => row.sameDayMeetingCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.sameDayMeetingCount}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Total Meeting</span>,
            selector: (row) => row.endCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.endCount}</WordWrapCell>,
        },
    ];

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            {isPending && <ScreenLoader />}
            <Breadcrumbs title="Associate" breadcrumbItem="Meetings" />
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowData}>
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
                                        className="btn btn-primary me-2"
                                        onClick={handleShowData}
                                    >
                                        Show Data
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={getMeetingDetails}
                                    >
                                        Clear
                                    </button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>
                {meetData?.length > 0 &&
                    <AppTable
                        progressPending={isPending}
                        columns={columns}
                        data={meetData}
                        pagination
                    />
                }
            </Container>
        </PageContent>
    );
}
