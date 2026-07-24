/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { BM_SUSPECT_DATA } from "../../helpers/url_helper";
import { formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { USER_TYPE } from "../../constants/global";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { defaultTheme } from "../../helpers/defaultTheme";

export default function BmSuspectScreen() {
    const { userId, role } = useUserStore((state) => state.user);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isPending, setIsPending] = useState(false)
    const [suspectData, setSuspectData] = useState([])
    const [accessGranted, setAccessGranted] = useState(null);

    useEffect(() => {
        const checkAccess = async () => {
            if (role !== USER_TYPE.ASSOCIATE) {
                const hasAccess = await CheckUserAccess(userId, 'bm-suspect-screen');
                setAccessGranted(hasAccess);
                if (hasAccess) {
                    getSuspectDetails()
                }
            }
            else {
                setAccessGranted(true);
                getSuspectDetails()
            }
        };
        checkAccess();
    }, [userId, role]);

    const getSuspectDetails = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        setFromDate(formatDateForInput(startOfMonth));
        setToDate(formatDateForInput(endOfMonth));

        get_Suspect_Details(
            `${BM_SUSPECT_DATA}${formatDateForInput(
                startOfMonth
            )}&toDate=${formatDateForInput(endOfMonth)}&userId=${userId}`
        );
    }

    const get_Suspect_Details = (url) => {
        setIsPending(true)
        ApiClient.get(url)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    setSuspectData(response.data.data)
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
        get_Suspect_Details(`${BM_SUSPECT_DATA}${fromDate}&toDate=${toDate}&userId=${userId}`);
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (row, index) => row.isTotalRow ? '-' : index + 1,
            width: "10%",
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            selector: (row) => row.name,
            sortable: true,
            cell: (row) => (
                <WordWrapCell>
                    {row.isTotalRow
                        ? <strong>Total</strong>
                        : `${row.name} (${row.code})`}
                </WordWrapCell>
            )
        },
        {
            name: <span className="font-weight-bold fs-13">Total Suspects</span>,
            selector: (row) => row.count,
            sortable: true,
            cell: (row) => (
                <WordWrapCell>
                    {row.isTotalRow
                        ? <strong>{row.count}</strong>
                        : row.count}
                </WordWrapCell>
            )
        },
        {
            name: <span className="font-weight-bold fs-13">Main Team</span>,
            selector: (row) => row.mainTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>
                {row.isTotalRow ? "-" : row.mainTeam}
            </WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Sub Team</span>,
            selector: (row) => row.subTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>
                {row.isTotalRow ? "-" : row.subTeam}
            </WordWrapCell>
        },
    ];

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    const totalSuspects = suspectData?.reduce(
        (sum, item) => sum + (Number(item.count) || 0),
        0
    );

    const tableDataWithTotal = suspectData?.length > 0 ? [
        ...suspectData,
        {
            name: "Total",
            code: "",
            count: totalSuspects,
            mainTeam: "",
            subTeam: "",
            isTotalRow: true,
        },
    ]
        : [];

    return (
        <PageContent>
            {isPending && <ScreenLoader />}
            <Breadcrumbs title="Associate" breadcrumbItem="Suspects" />
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
                                        onClick={getSuspectDetails}
                                    >
                                        Clear
                                    </button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                {tableDataWithTotal?.length > 0 &&
                    <AppTable
                        progressPending={isPending}
                        columns={columns}
                        data={tableDataWithTotal}
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
                }
            </Container>
        </PageContent>
    );
}