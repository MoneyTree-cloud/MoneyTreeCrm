import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, generateTimestamp, WordWrapCell } from "../../helpers/function_helper";
import { GET_MAIN_TEAM_WISE_PROSPECT_REPORT } from "../../helpers/url_helper";
import { usePost } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import * as XLSX from "xlsx";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function MainTeamWiseProspectsReport() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [mainTeamWiseProsData, setMainTeamWiseProsData] = useState([]);

    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'pros-report-mainteam');
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
            name: <span className="font-weight-bold fs-13">Main Team</span>,
            selector: (row) => row.mainTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.mainTeam}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Team Count</span>,
            selector: (row) => row.totalTeamCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.totalTeamCount}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Prospect Count</span>,
            selector: (row) => row.prospectCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.prospectCount}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Average / Person</span>,
            selector: (row) => row.average,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.average}</WordWrapCell>,
        }
    ];

    // API call to Show Report
    const { isPending, mutate } = usePost(
        `${GET_MAIN_TEAM_WISE_PROSPECT_REPORT}${fromDate}&endDate=${toDate}`,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    setMainTeamWiseProsData(response.data.data);
                }
                else {
                    toast.error(response.data.message)
                    setMainTeamWiseProsData([]);
                }
            },
            onError: (err) => {
                toast.error(err.message);
                setMainTeamWiseProsData([]);
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
        setMainTeamWiseProsData([]);
    };


    const downloadExcel = () => {
        // Ensure the data is not empty
        if (!Array.isArray(mainTeamWiseProsData) || mainTeamWiseProsData.length === 0) return;

        // 1. Extract the keys from the first object and remove 'subTeam' from the headers
        const headers = Object.keys(mainTeamWiseProsData[0]).filter(key => key !== "subTeam");

        // 2. Convert the data into a format compatible with the Excel file, excluding 'subTeam'
        const formattedData = mainTeamWiseProsData.map((item) => {
            return headers.map((header) => item[header]);
        });

        // 3. Add the headers as the first row in the data
        const finalData = [headers, ...formattedData];

        // 4. Create a worksheet from the final data
        const ws = XLSX.utils.aoa_to_sheet(finalData);

        // 5. Create a workbook and append the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Main Team Wise Prospects");

        // 6. Write the file and trigger download
        XLSX.writeFile(wb, `MainTeamWiseProspects_${generateTimestamp()}.xlsx`);
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
            <Breadcrumbs title="Report" breadcrumbItem="Main Team Wise Prospects" />
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

                {mainTeamWiseProsData?.length > 0 && (
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
                {mainTeamWiseProsData?.length > 0 && (
                    <AppTable
                        progressSales={isPending}
                        columns={columns}
                        data={mainTeamWiseProsData}
                        pagination
                    />
                )}
            </Container>
        </PageContent>
    );
}
