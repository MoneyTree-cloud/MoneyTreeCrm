import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, generateTimestamp, WordWrapCell } from "../../helpers/function_helper";
import { GET_SUB_TEAM_WISE_MEET_REPORT } from "../../helpers/url_helper";
import { usePost } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import * as XLSX from "xlsx";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { useUserStore } from "../../store/useUserStore";
import PermissionMissing from "../Utility/PermissonMissing";

export default function SubTeamWiseMeetingReport() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [subTeamWiseMeetData, setSubTeamWiseMeetData] = useState([]);

    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'meet-report-subteam');
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
            selector: (_, i) => i + 1,
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">Main Team</span>,
            selector: (row) => row.mainTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.mainTeam}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Sub Team</span>,
            selector: (row) => row.subTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.subTeam}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Team Count</span>,
            selector: (row) => row.totalTeamCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.totalTeamCount}</WordWrapCell>,
        },
         {
            name: <span className="font-weight-bold fs-13">Normal Meeting</span>,
            selector: (row) => row.endCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.prospectCount - row.sameDayMeetingCount}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Same Day Meeting</span>,
            selector: (row) => row.sameDayMeetingCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.sameDayMeetingCount}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Total Meeting</span>,
            selector: (row) => row.prospectCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.prospectCount}</WordWrapCell>,
        },
    ];

    // API call to Show Report
    const { isPending, mutate } = usePost(
        `${GET_SUB_TEAM_WISE_MEET_REPORT}${fromDate}&toDate=${toDate}`,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    setSubTeamWiseMeetData(response.data.data);
                }
                else {
                    toast.error(response.data.message)
                    setSubTeamWiseMeetData([]);
                }
            },
            onError: (err) => {
                toast.error(err.message);
                setSubTeamWiseMeetData([]);
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
        setSubTeamWiseMeetData([]);
    };


    const downloadExcel = () => {
        // Ensure the data is not empty
        if (!Array.isArray(subTeamWiseMeetData) || subTeamWiseMeetData.length === 0) return;
        const headers = Object.keys(subTeamWiseMeetData[0]);

        // 2. Remove 'subTeam' and 'average' from headers, and replace 'totalTeamCount' with 'totalMeetingCount'
        const filteredHeaders = headers
            .filter(header => header !== 'average')
            .map(header => header === 'prospectCount' ? 'totalMeetingCount' : header);

        // 3. Convert the data into a format compatible with the Excel file, renaming the field in the data
        const formattedData = subTeamWiseMeetData.map((item) => {
            // Create the updated row by mapping the filtered headers
            return filteredHeaders.map((header) => {
                if (header === 'totalMeetingCount') {
                    return item.prospectCount;
                }
                return item[header];  // For other fields, just use the value
            });
        });

        // 4. Add the filtered headers as the first row in the data
        const finalData = [filteredHeaders, ...formattedData];


        // 4. Create a worksheet from the final data
        const ws = XLSX.utils.aoa_to_sheet(finalData);

        // 5. Create a workbook and append the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sub Team Wise Meetings");

        // 6. Write the file and trigger download
        XLSX.writeFile(wb, `subTeamWiseMeetings_${generateTimestamp()}.xlsx`);
        return;
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Sub Team Wise Meetings" />
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

                {subTeamWiseMeetData?.length > 0 && (
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
                {subTeamWiseMeetData?.length > 0 && (
                    <AppTable
                        progressSales={isPending}
                        columns={columns}
                        data={subTeamWiseMeetData}
                        pagination
                    />
                )}
            </Container>
        </PageContent>
    );
}
