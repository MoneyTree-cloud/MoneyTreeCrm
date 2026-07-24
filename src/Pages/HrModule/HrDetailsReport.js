/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, generateTimestamp, WordWrapCell } from "../../helpers/function_helper";
import { HR_DETAILS_REPORT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import * as XLSX from 'xlsx';
import { defaultTheme } from "../../helpers/defaultTheme";

export default function HrDetailsReport() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [hrDataReport, serHRDataReport] = useState([]);
    const [isPending, setIsPending] = useState(false)
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);
    const [filterType, setFilterType] = useState("all");

    const handleRadioChange = (e) => {
        setFilterType(e.target.value);
        getCallDetails(fromDate, toDate, e.target.value);
    }

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'details-report');
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
            name: <span className="font-weight-bold fs-13">Emp Details</span>,
            selector: (row) => row["Emp Name"],
            cell: (row) => <WordWrapCell>{row["Emp Name"] + ' (' + row["Emp Code"] + ')'}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Total Calls</span>,
            selector: (row) => row["Total Calls"],
            cell: (row) => <WordWrapCell>{row["Total Calls"]}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Interview Scheduled</span>,
            selector: (row) => row["Interview Scheduled"],
            cell: (row) => <WordWrapCell>{row["Interview Scheduled"]}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Interview Conducted</span>,
            selector: (row) => row["Interview Conducted"],
            cell: (row) => <WordWrapCell>{row["Interview Conducted"]}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Offer Send</span>,
            selector: (row) => row["Offer Send"],
            cell: (row) => <WordWrapCell>{row["Offer Send"]}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Offer Declined</span>,
            selector: (row) => row["Offer Decline"],
            cell: (row) => <WordWrapCell>{row["Offer Decline"]}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Joined</span>,
            selector: (row) => row.Hired,
            cell: (row) => <WordWrapCell>{row.Hired}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Future Hiring</span>,
            selector: (row) => row["Future Hiring"],
            cell: (row) => <WordWrapCell>{row["Future Hiring"]}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Resigned</span>,
            selector: (row) => row["Resigned"],
            cell: (row) => <WordWrapCell>{row["Resigned"]}</WordWrapCell>,
            sortable: true,
        },
    ];

    const getCallDetails = (fromDate, toDate, filter) => {
        setIsPending(true)
        ApiClient.get(`${HR_DETAILS_REPORT}${fromDate}&toDate=${toDate}&filter=${filter === "all" ? true : false}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    serHRDataReport(response.data.data);
                } else {
                    toast.error(response.data.message);
                    serHRDataReport([]);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                serHRDataReport([]);
                toast.error(error.message);
            });
    };

    const setTodayDate = () => {
        const today = new Date(); // Get today's date
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setFromDate(formatDateForInput(startOfMonth));
        setToDate(formatDateForInput(today));
        getCallDetails(formatDateForInput(startOfMonth), formatDateForInput(today), filterType); // Fetch data for the current month
    };

    const handleShowButton = (e) => {
        e.preventDefault()
        if (!fromDate) {
            toast.error("Please Enter Start Date");
        } else if (!toDate) {
            toast.error("Please Enter End Date");
        } else {
            getCallDetails(fromDate, toDate, filterType);
        }
    };

    const handleClear = () => {
        setTodayDate();
        serHRDataReport([]);
        setFilterType("all");
    };

    const downloadExcel = () => {
        // Ensure the data is not empty
        if (!Array.isArray(hrDataReport) || hrDataReport.length === 0) return;

        // 1. Define the fields you want to include and map them
        const transformedData = hrDataReport.map((item) => {
            return {
                'Emp Details': item["Emp Name"] + ' (' + item["Emp Code"] + ')',
                'Total Calls': item["Total Calls"],
                'Interview Scheduled': item["Interview Scheduled"],
                'Interview Conducted': item["Interview Conducted"],
                'Offer Send': item["Offer Send"],
                'Offer Declined': item["Offer Decline"],
                'Joined': item["Hired"],
                'Future Hiring': item["Future Hiring"],
                'Resigned': item["Resigned"],
            };
        });

        // 2. Extract headers from the transformed data (this will be the keys of the transformedData objects)
        const headers = Object.keys(transformedData[0]);

        // 3. Convert the transformed data into a format compatible with Excel (using the headers)
        const formattedData = transformedData.map((item) => headers.map((header) => item[header]));

        // 4. Add the headers as the first row in the data
        const finalData = [headers, ...formattedData];

        // 5. Create a worksheet from the final data
        const ws = XLSX.utils.aoa_to_sheet(finalData);

        // 6. Create a workbook and append the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `${filterType === 'all' ? 'All' : 'Referral'} HR Details Report`);

        // 7. Write the file and trigger download with a dynamic file name based on the project select label and timestamp
        const fileName = `${filterType === 'all' ? 'All' : 'Referral'}_hrDetailsReport_${generateTimestamp()}.xlsx`;
        XLSX.writeFile(wb, fileName);

        return;
    }

    const iconStyle = {
        color: defaultTheme.primary,
        cursor: "pointer",
        fontSize: "18px",
        marginBottom: "10px",
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Details" />
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
                                <Col md="1" className="d-flex align-items-end">
                                    <i
                                        title="Excel Download"
                                        className="fas fa-file-excel"
                                        style={iconStyle}
                                        onClick={downloadExcel}
                                    />
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                {/* Radio Buttons */}
                <div className="radio-button-container">
                    {["all", "referral"].map((type) => (
                        <label
                            key={type}
                            className={`radio-label ${filterType === type ? "active" : ""}`}
                        >
                            <input
                                type="radio"
                                value={type}
                                checked={filterType === type}
                                onChange={handleRadioChange}
                            />
                            {type === "all" ? "All Employees" : "Referral Employees"}
                        </label>
                    ))}
                </div>

                {hrDataReport?.length > 0 && (
                    <AppTable
                        progressSales={isPending}
                        columns={columns}
                        // data={hrDataReport?.filter((item) => item["Total Calls"] === 0) || []}
                        data={hrDataReport || []}
                        pagination
                    />
                )}
            </Container>
        </PageContent>
    );
}