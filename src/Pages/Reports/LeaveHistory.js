/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import AppTable from '../../components/Common/Table';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import { DOWNLOAD_LEAVE_EXCEL, GET_LEAVE_HISTORY } from '../../helpers/url_helper';
import { formatActionType, formatDate, formatDateForInput, formatDateTime, generateTimestamp, WordWrapCell } from '../../helpers/function_helper';
import { FaCheck, FaClock, FaTimes } from 'react-icons/fa';
import { defaultTheme } from '../../helpers/defaultTheme';
import ApiClient from '../../helpers/api_helper';
import { toast } from 'react-toastify';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import { useUserStore } from '../../store/useUserStore';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';

export default function LeaveHistory() {
    const [pending, setPending] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [leaveData, setLeaveData] = useState([]);
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'leave-history-report');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                getInitDate();
            }
        };
        checkAccess();
    }, [userId]);

    const getInitDate = () => {
        const today = new Date();
        // First day of the current month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        // Last day of the current month
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const formattedStart = formatDateForInput(startOfMonth);
        const formattedEnd = formatDateForInput(endOfMonth); // now set to last day of month

        setFromDate(formattedStart);
        setToDate(formattedEnd);

        getReportDetails(formattedStart, formattedEnd);
    };

    const getReportDetails = (fromDate, toDate) => {
        setPending(true);
        let apiUrl = `${GET_LEAVE_HISTORY}fromDate=${fromDate}&toDate=${toDate}`;
        ApiClient.get(apiUrl)
            .then(response => {
                setPending(false);
                if (response?.data?.status === 1) {
                    const data = response.data.data;
                    setLeaveData(data);
                } else if (response.data.message !== 'No record found') {
                    setLeaveData([]);
                    toast.error(response.data.message);
                }
                else {
                    setLeaveData([]);
                }
            })
            .catch(error => {
                setPending(false);
                setLeaveData([]);
                toast.error(error.message);
            });
    };

    const handleShowData = (e) => {
        e.preventDefault();
        getReportDetails(fromDate, toDate);
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "5%",
            selector: (_, i) => i + 1,
        },
        {
            name: <span className="font-weight-bold fs-13">Emp Details</span>,
            selector: (row) => row.empCode,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.empName + ' (' + row.empCode + ')'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Assign To</span>,
            selector: (row) => row.reportingTo,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.reportingToName + '(' + row.reportingTo + ')'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Leave Date</span>,
            selector: (row) => row.leaveDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row?.leaveDate)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Leave Type</span>,
            selector: (row) => row.leaveType,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatActionType(row.leaveType)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Status</span>,
            selector: (row) => row.leaveStatus,
            cell: (row) => (
                <WordWrapCell>
                    {
                        row?.leaveStatus === 'approved' ?
                            <FaCheck
                                color={defaultTheme.primary}
                                size={15}
                                title="Accepted"
                            />
                            :
                            (row?.leaveStatus === 'rejected')
                                ?
                                <FaTimes
                                    color={defaultTheme.redColor}
                                    size={15}
                                    title="Rejected"
                                /> :
                                <FaClock
                                    color={defaultTheme.btnEnable}
                                    size={15}
                                    title="Pending"
                                />
                    }
                </WordWrapCell>
            ),
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
            name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
            selector: (row) => row.createdDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Response Date & Time</span>,
            selector: (row) => row.statusUpdateDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.statusUpdateDate)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Remarks</span>,
            selector: (row) => row.remarks,
            sortable: true,
            width: '15%',
            cell: (row) => <WordWrapCell>{row.remarks}</WordWrapCell>
        }
    ]

    const downloadExcel = () => {
        setPending(true);
        ApiClient.get(`${DOWNLOAD_LEAVE_EXCEL}fromDate=${fromDate}&toDate=${toDate}`, { responseType: "arraybuffer" })
            .then((response) => {
                setPending(false);
                const contentType = response.headers["content-type"];

                if (
                    contentType !==
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ) {
                    const errorResponse = new TextDecoder("utf-8").decode(new Uint8Array(response.data));
                    try {
                        const parsedError = JSON.parse(errorResponse);
                        toast.error(parsedError.message || "Failed to download Excel file.");
                    } catch {
                        toast.error("Unexpected error occurred while downloading Excel file.");
                    }
                    return;
                }

                const blob = new Blob([response.data], { type: contentType });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = `leaveHistory_${generateTimestamp()}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((error) => {
                setPending(false);
                toast.error(error.message || "An unexpected error occurred.");
            });
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Leave History" />
            {pending && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowData}>
                            <Row>
                                <Col md="3">
                                    <h6 className="font-size-11">From Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">To Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
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
                                        onClick={getInitDate}
                                    >
                                        Cancel
                                    </Button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>
            </Container>
            {leaveData?.length > 0 && (
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
            <AppTable
                progressPending={pending}
                columns={columns}
                data={leaveData || []}
                pagination

            />
        </PageContent>
    );
}
