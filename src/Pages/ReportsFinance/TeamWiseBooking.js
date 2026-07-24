/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import ApiClient from '../../helpers/api_helper';
import { DOWNLOAD_TEAM_WISE_BOOKING_EXCEL, TEAM_WISE_BOOKING } from '../../helpers/url_helper';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import AppTable from '../../components/Common/Table';
import { formatDateForInput, generateTimestamp, WordWrapCell } from '../../helpers/function_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import { useUserStore } from '../../store/useUserStore';
import PermissionMissing from '../Utility/PermissonMissing';
import { decryptData } from '../../components/Common/CryptoUtils';

export default function TeamWiseBooking() {
    const [isPending, setIsPending] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reportdata, setReportdata] = useState([])
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'booking-team-wise');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                getDataInit();
            }
        };
        checkAccess();
    }, [userId]);

    const getDataInit = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        setFromDate(formatDateForInput(startOfMonth));
        setToDate(formatDateForInput(endOfMonth));

        getReportData(formatDateForInput(startOfMonth), formatDateForInput(endOfMonth));
    }

    const getReportData = (startDate, endDate) => {
        setIsPending(true);
        let url = `${TEAM_WISE_BOOKING}fromDate=${startDate}&toDate=${endDate}`;

        ApiClient.get(url).then(function (response) {
            setIsPending(false);
            if (response.data.status === 1) {
                const encryptedContent = response.data.data;
                decryptData(encryptedContent).then((decrypted) => {
                    setReportdata(decrypted);
                }).catch((error) => {
                    setReportdata([]);
                });
            } else {
                toast.error(response.data.message);
            }
        })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    }

    const getData = (e) => {
        e.preventDefault()
        getReportData(fromDate, toDate)
    }

    const downloadExcel = () => {
        setIsPending(true)
        let url = `${DOWNLOAD_TEAM_WISE_BOOKING_EXCEL}${fromDate}&toDate=${toDate}`;

        ApiClient.get(url, { responseType: "arraybuffer" })
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
                link.download = `teamWiseBooking_${generateTimestamp()}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(function (error) {
                setIsPending(false)
                toast.error(error.message || "An unexpected error occurred.");
            });
    }

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: '5%'
        },
        {
            name: <span className="font-weight-bold fs-13">Main Team</span>,
            selector: (row) => row.main_team,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.main_team}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Sub Team</span>,
            selector: (row) => row.s_team,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.s_team}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Total Booking</span>,
            selector: (row) => row.TotalBooking,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.TotalBooking}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Total Cancel</span>,
            selector: (row) => row.TotalCancel,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.TotalCancel}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Total Close</span>,
            selector: (row) => row.TotalClose,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.TotalClose}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Total Open</span>,
            selector: (row) => row.TotalOpen,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.TotalOpen}</WordWrapCell>,
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
            <Breadcrumbs title="Report" breadcrumbItem="Team Wise Booking" />
            {(isPending) && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={getData}>
                            <Row>
                                <Col md="4">
                                    <h6 className="font-size-11">From Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={fromDate}
                                        onChange={e => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="4">
                                    <h6 className="font-size-11">To Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={toDate}
                                        onChange={e => setToDate(e.target.value)}
                                    />
                                </Col>

                                <Col md="4" className="d-flex align-items-end mt-3">
                                    <button className="btn btn-primary me-2" type="submit" onClick={getData}>Show</button>
                                    <button className="btn btn-secondary" type="button" onClick={getDataInit}>Clear</button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                {reportdata?.length > 0 &&
                    <i
                        className="fas fa-file-excel"
                        style={{
                            color: defaultTheme.primary,
                            cursor: "pointer",
                            fontSize: "15px",
                        }}
                        onClick={downloadExcel}
                    ></i>
                }

                <AppTable
                    progressPending={isPending}
                    columns={columns}
                    data={reportdata || []}
                    pagination
                />
            </Container>
        </PageContent>
    );
}
