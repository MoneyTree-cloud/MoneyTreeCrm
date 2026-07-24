/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { HR_BRANCH_STRENGTH_REPORT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import Select from "react-select";

export default function BranchStrength() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [branchStrengthReport, setBranchStrengthReport] = useState([]);
    const [isPending, setIsPending] = useState(false)
    const [accessGranted, setAccessGranted] = useState(null);
    const [userType, setUserType] = useState(null)
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'branch-strength-report');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                setTodayDate();
            }
        };
        checkAccess();
    }, [userId]);

    const userTypeGroup = [
        { label: 'Sales', value: 'Sales ' },
        { label: 'Non-Sales', value: 'NonSales' }
    ]

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "6%",
            cell: (row, index) => row.isTotalRow ? null : index + 1,
        },
        {
            name: <span className="font-weight-bold fs-13">Location</span>,
            selector: (row) => row.name,
            cell: (row) =>
                row.isTotalRow ? (
                    <strong>Total</strong>
                ) : (
                    <WordWrapCell>{row.location}</WordWrapCell>
                ),
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Joined</span>,
            selector: (row) => row.joinedUser,
            cell: (row) => (
                row.isTotalRow
                    ? <strong>{row.joinedUser}</strong>
                    : <WordWrapCell>{row.joinedUser}</WordWrapCell>
            ),
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Resigned</span>,
            selector: (row) => row.resignedUser,
            cell: (row) => (
                row.isTotalRow
                    ? <strong>{row.resignedUser}</strong>
                    : <WordWrapCell>{row.resignedUser}</WordWrapCell>
            ),
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">All</span>,
            selector: (row) => row.allUser,
            cell: (row) => (
                row.isTotalRow
                    ? <strong>{row.allUser}</strong>
                    : <WordWrapCell>{row.allUser}</WordWrapCell>
            ),
            sortable: true,
        },
    ];

    const getReportDetails = (fromDate, toDate, userType) => {
        setIsPending(true)
        let url = `${HR_BRANCH_STRENGTH_REPORT}${fromDate}&toDate=${toDate}`
        if (userType) {
            url += `&userType=${userType?.value}`
        }
        ApiClient.get(url)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    setBranchStrengthReport(response.data.data);
                } else {
                    toast.error(response.data.message);
                    setBranchStrengthReport([]);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                setBranchStrengthReport([]);
                toast.error(error.message);
            });
    };

    const setTodayDate = () => {
        const today = new Date();
        setFromDate(formatDateForInput(today));
        setToDate(formatDateForInput(today));
        getReportDetails(formatDateForInput(today), formatDateForInput(today)); // Fetch data for the current month
    };

    const handleShowButton = (e) => {
        e.preventDefault()
        if (!fromDate) {
            toast.error("Please Enter Start Date");
        } else if (!toDate) {
            toast.error("Please Enter End Date");
        } else {
            getReportDetails(fromDate, toDate, userType);
        }
    };

    const handleClear = () => {
        setTodayDate();
        setBranchStrengthReport([]);
        setUserType(null)
    };

    const computeTotalRow = () => {
        let totalJoined = 0;
        let totalResigned = 0;
        let totalAll = 0;

        branchStrengthReport.forEach((row) => {
            totalJoined += parseInt(row.joinedUser || 0);
            totalResigned += parseInt(row.resignedUser || 0);
            totalAll += parseInt(row.allUser || 0);
        });

        return {
            name: "Total",
            joinedUser: totalJoined,
            resignedUser: totalResigned,
            allUser: totalAll,
            isTotalRow: true // flag to identify this row
        };
    };

    const tableData = branchStrengthReport.length > 0
        ? [...branchStrengthReport, computeTotalRow()]
        : [];

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Branch Strength" />
            {isPending && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowButton}>
                            <Row className="g-3">
                                <Col md="3">
                                    <h6 className="font-size-12">From Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        id="date-input-1"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-12">To Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        id="date-input-2"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">User Type</h6>
                                    <Select
                                        value={userType}
                                        onChange={setUserType}
                                        options={userTypeGroup}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
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

                {branchStrengthReport?.length > 0 && (
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