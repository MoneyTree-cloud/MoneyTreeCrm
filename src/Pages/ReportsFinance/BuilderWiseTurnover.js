/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import ApiClient from '../../helpers/api_helper';
import { BUILDER_WISE_TURNOVER, DOWNLOAD_BUILDER_WISE_TURNOVER_EXCEL } from '../../helpers/url_helper';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import AppTable from '../../components/Common/Table';
import { formatDateForInput, formatTurnOverInCr, generateTimestamp, WordWrapCell } from '../../helpers/function_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { useUserStore } from '../../store/useUserStore';
import PermissionMissing from '../Utility/PermissonMissing';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import { decryptData } from '../../components/Common/CryptoUtils';

export default function BuilderWiseTurnover() {
    const [isPending, setIsPending] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reportdata, setReportdata] = useState([])
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'turnover-builder-wise');
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
        let url = `${BUILDER_WISE_TURNOVER}fromDate=${startDate}&toDate=${endDate}`;

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
        let url = `${DOWNLOAD_BUILDER_WISE_TURNOVER_EXCEL}${fromDate}&toDate=${toDate}`;

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
                link.download = `builderWiseTurnover_${generateTimestamp()}.xlsx`;
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
            name: <span className="font-weight-bold fs-13">Builder Name</span>,
            selector: (row) => row.builder_name,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.builder_name}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Project Name</span>,
            selector: (row) => row.project_name,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.project_name}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Project Location</span>,
            selector: (row) => row.project_location,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.project_location}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Booking Count</span>,
            selector: (row) => row.count,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.count}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Turnover (In Cr.)</span>,
            selector: (row) => row.turnover,
            sortable: true,
            cell: (row) => <WordWrapCell>₹{formatTurnOverInCr(row.turnover)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Total Area</span>,
            selector: (row) => row.totalArea,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.totalArea}</WordWrapCell>,
        }];

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Builder Wise Turnover" />
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
