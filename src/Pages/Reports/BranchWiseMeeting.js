import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, generateTimestamp, WordWrapCell } from "../../helpers/function_helper";
import { GET_BRANCH_WISE_MEET_REPORT } from "../../helpers/url_helper";
import { usePost } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import * as XLSX from "xlsx";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function BranchWiseMeeting() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [branchWiseMeetData, setBranchWiseMeetData] = useState([]);
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'meet-report-branch-wise');
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
            selector: (_, index) => index + 1,
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">Branch</span>,
            selector: (row) => row.branchName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.branchName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Due Date Count</span>,
            selector: (row) => row.dueDateCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.dueDateCount}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Meeting Start Count</span>,
            selector: (row) => row.startCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.startCount}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Meeting Cancel Count</span>,
            selector: (row) => row.cancelCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.cancelCount}</WordWrapCell>,
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
        }
    ];

    // API call to Show Report
    const { isPending, mutate } = usePost(
        `${GET_BRANCH_WISE_MEET_REPORT}${fromDate}&toDate=${toDate}`,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    setBranchWiseMeetData(response.data.data);
                }
                else {
                    toast.error(response.data.message)
                    setBranchWiseMeetData([]);
                }
            },
            onError: (err) => {
                toast.error(err.message);
                setBranchWiseMeetData([]);
            },
        }
    );

    const setTodayDate = () => {
        const today = new Date(); // Get today's date
        setFromDate(formatDateForInput(today));
        setToDate(formatDateForInput(today));
    };

    const handleShowButton = (e) => {
        e.preventDefault()
        if (!fromDate) {
            toast.error("Please Enter Start Date");
        } else if (!toDate) {
            toast.error("Please Enter End Date");
        } else {
            mutate();
        }
    };

    const handleClear = () => {
        setTodayDate();
        setBranchWiseMeetData([]);
    };


    const downloadExcel = () => {
        // Ensure the data is not empty
        if (!Array.isArray(branchWiseMeetData) || branchWiseMeetData.length === 0) return;

        // 1. Exclude 'mainTeam' and 'totalTeamCount' from headers
        const filteredHeaders = Object.keys(branchWiseMeetData[0])
            .filter(key => key !== 'mainTeam' && key !== 'totalTeamCount');

        // 2. Format the data according to filtered headers
        const formattedData = branchWiseMeetData.map((item) =>
            filteredHeaders.map((header) => item[header])
        );

        // 3. Add headers as the first row
        const finalData = [filteredHeaders, ...formattedData];

        // 4. Create worksheet and workbook
        const ws = XLSX.utils.aoa_to_sheet(finalData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Branch Wise Meetings");

        // 5. Download file
        XLSX.writeFile(wb, `branchWiseMeetings_${generateTimestamp()}.xlsx`);
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Branch Wise Meetings" />
            {isPending && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowButton}>
                            <Row>
                                <Col md="3">
                                    <h6 className=" font-size-12">From Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        id="date-input-1"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className=" font-size-12">To Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        id="date-input-2"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </Col>

                                <Col md="3" className="d-flex align-items-end gap-2">
                                    <Button
                                        color="primary"
                                        type="submit"
                                        onClick={handleShowButton}
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

                {branchWiseMeetData?.length > 0 && (
                    <i
                        className="fas fa-file-excel"
                        style={{
                            color: defaultTheme.primary,
                            cursor: "pointer",
                            fontSize: "16px",
                            marginBottom: '10px'
                        }}
                        onClick={downloadExcel}
                    ></i>
                )}
                {branchWiseMeetData?.length > 0 && (
                    <AppTable
                        progressSales={isPending}
                        columns={columns}
                        data={branchWiseMeetData}
                        pagination
                    />
                )}
            </Container>
        </PageContent>
    );
}
