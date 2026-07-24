/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { EXCEL_DOWNLOAD_EVENT, GET_ALL_EVENT_FORM } from "../../helpers/url_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, formatDateTime, generateTimestamp, WordWrapCell } from "../../helpers/function_helper";
import { MdMobileFriendly } from "react-icons/md";
import ApiClient from "../../helpers/api_helper";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { useUserStore } from "../../store/useUserStore";
import { decryptData } from "../../components/Common/CryptoUtils";
import { Button, Card, CardBody, Col, Row } from "reactstrap";
import "../CSS/styles.css";

export default function EventHistory() {
    const [page, setPage] = useState(1);
    const LIMIT = 100;
    const [isLoading, setIsLoading] = useState(false)
    const [eventEntryData, setEventEntryData] = useState([]);
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [flag, setFlag] = useState(false)

    const getEventDetails = (url) => {
        setIsLoading(true);
        ApiClient.get(url)
            .then(function (response) {
                setIsLoading(false);
                if (response?.data?.status === 1) {
                    const encryptedContent = response.data.data;
                    decryptData(encryptedContent).then((decrypted) => {
                        setEventEntryData(decrypted);
                    }).catch((error) => {
                        setEventEntryData([]);
                    });
                } else if (response.data.message !== 'No Event Form Found!') {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsLoading(false);
                toast.error(error.message);
            });
    };

    useEffect(() => {
        if (accessGranted) {
            setTodayDate()
        }
    }, [accessGranted])

    const setTodayDate = () => {
        const today = new Date(); // Get today's date
        setStartDate(formatDateForInput(today));
        setEndDate(formatDateForInput(today));
        getEventDetails(`${GET_ALL_EVENT_FORM}?page=${page - 1}&size=${LIMIT}&fromDate=${formatDateForInput(today)}&toDate=${formatDateForInput(today)}`)
    };

    useEffect(() => {
        if (flag) {
            getEventDetails(`${GET_ALL_EVENT_FORM}?page=${page - 1}&size=${LIMIT}&fromDate=${startDate}&toDate=${endDate}`)
        }
    }, [page, flag])

    const downloadEventExcel = () => {
        setIsLoading(true);
        ApiClient.get(`${EXCEL_DOWNLOAD_EVENT}?fromDate=${startDate}&toDate=${endDate}`, { responseType: "arraybuffer" })
            .then(function (response) {
                setIsLoading(false);
                if (response.data.status === 0) {
                    toast.error(response.data.message);
                    return;
                }
                const blob = new Blob([response.data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = `event_data_${generateTimestamp()}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(function (error) {
                setIsLoading(false);
                toast.error(error.message);
            });
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "7%",
            cell: (_, index) => <WordWrapCell>{index + 1}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Customer Details</span>,
            selector: (row) => row.userName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.userName + ' (' + row.peopleCount + ')'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Mobile No.</span>,
            selector: (row) => row.mobileNumber,
            cell: (row) => (
                <div className="phone-container">
                    <MdMobileFriendly
                        className="phone-icon"
                        color={defaultTheme.goldColorLogo}
                    />
                    <span className="phone-number">{row.mobileNumber}</span>
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Event Name</span>,
            selector: (row) => row?.eventMaster?.eventName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.eventMaster?.eventName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            selector: (row) => row.toWhomName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.toWhomName + " (" + row.toWhomId + ")"}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Address</span>,
            selector: (row) => row.address,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.address}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
            selector: (row) => row.createdDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Created By</span>,
            selector: (row) => row.createdByName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.createdByName + " (" + row.createdById + ")"}</WordWrapCell>
        },
    ];

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'event-history');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    const handleShowButton = (e) => {
        e.preventDefault()
        getEventDetails(`${GET_ALL_EVENT_FORM}?page=${page - 1}&size=${LIMIT}&fromDate=${startDate}&toDate=${endDate}`)

    }

    const handleClear = () => {
        setTodayDate();
        setEventEntryData([]);
    }

    return (
        <PageContent>
            <Breadcrumbs title="Event" breadcrumbItem="Event History" />
            {(isLoading) && <ScreenLoader />}
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
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </Col>
                            <Col md="4">
                                <h6 className=" font-size-12">To Date</h6>
                                <input
                                    className="form-control"
                                    type="date"
                                    id="date-input-2"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
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

            {eventEntryData?.content?.length > 0 && (
                <i
                    className="fas fa-file-excel"
                    style={{
                        color: defaultTheme.primary,
                        cursor: "pointer",
                        fontSize: "16px",
                    }}
                    onClick={downloadEventExcel}
                ></i>
            )}
            {eventEntryData?.content?.length > 0 && (
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={eventEntryData?.content || []}
                    paginationTotalRows={eventEntryData?.totalElements}
                    paginationServer
                    onChangePage={(newPage) => {
                        setPage(newPage)
                        setFlag(true)
                    }}
                    pagination
                />
            )}
        </PageContent>
    );
}
