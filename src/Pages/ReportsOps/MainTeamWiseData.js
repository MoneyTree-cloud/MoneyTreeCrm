import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, formatTurnOverInCr, generateTimestamp, WordWrapCell } from "../../helpers/function_helper";
import { DOWNLOAD_MAIN_TEAM_DATA_REPORT, MAIN_TEAM_DATA_REPORT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function MainTeamWiseData() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isPending, setIsPending] = useState(false)
    const [mainTeamWiseData, setMainTeamWiseData] = useState([]);
    const [dataType, setDataType] = useState("All");
    const [filterType, setFilterType] = useState(0);

    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'data-main-team-wise');
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
            name: <span className="font-weight-bold fs-13">Head Count</span>,
            selector: (row) => row.teamCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.teamCount}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">No. Of Booking</span>,
            selector: (row) => row.bookingCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.bookingCount}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Turnover (In Cr.)</span>,
            selector: (row) => row.turnover,
            sortable: true,
            cell: (row) => <WordWrapCell>₹{formatTurnOverInCr(row.turnover)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Per Person Turnover (In Cr.)</span>,
            selector: (row) => row.perPersonTurnover,
            sortable: true,
            cell: (row) => <WordWrapCell> ₹{formatTurnOverInCr(row.perPersonTurnover)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Per Person Booking</span>,
            selector: (row) => row.perPersonBooking,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.perPersonBooking}</WordWrapCell>
        },
    ];

    const getMainTeamData = (filter_Type) => {
        setIsPending(true)
        ApiClient.get(`${MAIN_TEAM_DATA_REPORT}${fromDate}&toDate=${toDate}&filterType=${filter_Type}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    const encryptedContent = response.data.data;
                    decryptData(encryptedContent).then((decrypted) => {
                        setMainTeamWiseData(decrypted);
                    }).catch((error) => {
                        setMainTeamWiseData([]);
                    });
                } else {
                    toast.error(response.data.message);
                    setMainTeamWiseData([]);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    const setTodayDate = () => {
        const today = new Date(); // Get today's date
        setFromDate(formatDateForInput(today));
        setToDate(formatDateForInput(today));
        // getMainTeamData('0')
    };

    const handleShowButton = (e) => {
        e.preventDefault()
        if (!fromDate) {
            toast.error("Please Enter Start Date");
        } else if (!toDate) {
            toast.error("Please Enter End Date");
        } else {
            getMainTeamData(filterType)
        }
    };

    const handleClear = () => {
        setTodayDate();
        setMainTeamWiseData([]);
        setDataType("All")
        setFilterType(0)
    };

    const downloadExcel = async () => {
        try {
            ApiClient.get(`${DOWNLOAD_MAIN_TEAM_DATA_REPORT}${fromDate}&toDate=${toDate}&filterType=${filterType}`, { responseType: "arraybuffer" })
                .then(function (response) {
                    setIsPending(false)
                    const contentType = response.headers["content-type"];
                    if (
                        contentType !==
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    ) {
                        const errorResponse = new TextDecoder("utf-8").decode(
                            new Uint8Array(response.data)
                        );
                        const parsedError = JSON.parse(errorResponse);

                        if (parsedError.status === 0) {
                            toast.error(parsedError.message || "Something went wrong!");
                        } else {
                            toast.error("Unexpected error occurred!");
                        }
                        return;
                    }

                    const blob = new Blob([response.data], {
                        type: contentType,
                    });
                    const link = document.createElement("a");
                    link.href = window.URL.createObjectURL(blob);
                    link.download = `mainTeamData_${generateTimestamp()}.xlsx`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                })
                .catch(function (error) {
                    setIsPending(false)
                    toast.error(error.message || "An unexpected error occurred.");
                });
        } catch (error) {
            toast.error(error.message);
        }
    };

    const DATA_TYPES = ["All", "Size < 11", "Size > 10"];
    const handleRadioChange = (event) => {
        const data = event.target.value
        setDataType(data); // Update the state with the selected data type
        let filterValue = '';

        if (data === 'All') {
            filterValue = '0';
        } else if (data === 'Size < 11') {
            filterValue = '1';
        } else if (data === 'Size > 10') {
            filterValue = '2';
        }

        setFilterType(filterValue);
        getMainTeamData(filterValue);
    };


    const filterData = () => {
        switch (dataType) {
            case "All":
                return "Showing All Main Team Report";
            case "Size < 11":
                return "Showing Data With Main Team Size Less Than 11";
            case "Size > 10":
                return "Showing Data With Main Team Size More Than 10";
            default:
                return "Invalid data type";
        }
    };


    const totalRow = mainTeamWiseData.reduce(
        (acc, curr) => {
            acc.teamCount += curr.teamCount;
            acc.bookingCount += curr.bookingCount;
            acc.turnover += curr.turnover;
            return acc;
        },
        {
            mainTeam: "Total",
            teamCount: 0,
            bookingCount: 0,
            turnover: 0,
            perPersonTurnover: 0,
            perPersonBooking: 0,
            isTotalRow: true,
        }
    );

    // Compute per person values if total headcount > 0
    if (totalRow.teamCount > 0) {
        totalRow.perPersonTurnover = Math.round((totalRow.turnover / totalRow.teamCount) * 100) / 100;
        totalRow.perPersonBooking = Math.round((totalRow.bookingCount / totalRow.teamCount) * 100) / 100;
    }

    // Add total row at the top
    const updatedData = [totalRow, ...mainTeamWiseData];


    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }
    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Main Team Wise" />
            {isPending && <ScreenLoader />}
            <div className="radio-button-container">
                {DATA_TYPES.map((type) => (
                    <label
                        key={type}
                        className={`radio-label ${dataType === type ? "active" : ""}`}
                    >
                        <input
                            type="radio"
                            value={type}
                            checked={dataType === type}
                            onChange={handleRadioChange}
                        />
                        {type === "Received" ? "Approved" : type}
                    </label>
                ))}
            </div>
            <div className="mb-2">
                {filterData()}
            </div>
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowButton}>
                            <Row>
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

                {mainTeamWiseData?.length > 0 && (
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
                {mainTeamWiseData?.length > 0 && (
                    <AppTable
                        progressSales={isPending}
                        columns={columns}
                        data={updatedData}
                        pagination
                        conditionalRowStyles={[
                            {
                                when: row => row.isTotalRow,
                                style: {
                                    color: defaultTheme.goldColorLogo, // gold color
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
