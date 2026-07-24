/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from 'react';
import AppTable from '../../components/Common/Table';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import { DOWNLOAD_TUESDAY_REPORT_EXCEL, GET_TUESDAY_REPORT } from '../../helpers/url_helper';
import { formatDateForInput, formatDateTime, generateTimestamp, WordWrapCell } from '../../helpers/function_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import ApiClient from '../../helpers/api_helper';
import { toast } from 'react-toastify';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import { useUserStore } from '../../store/useUserStore';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';

export default function TuesdayReport() {
    const [pending, setPending] = useState(false);
    const [page, setPage] = useState(1);
    const LIMIT = 100;
    const [fromDate, setFromDate] = useState('');
    const [reportData, setReportData] = useState([]);
    const [totalElements, setTotalElements] = useState(0);

    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'tuesday-report');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                getInitDate();
            }
        };
        checkAccess();
    }, [userId]);

    const getInitDate = () => {
        const today = new Date();
        // Get the first day of the current month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const formattedStart = formatDateForInput(startOfMonth);
        setFromDate(formattedStart);
        getReportDetails(formattedStart);
    };


    const getReportDetails = (fromDate) => {
        setPending(true);
        let apiUrl = `${GET_TUESDAY_REPORT}offset=${page - 1}&limit=${LIMIT}&fromDate=${fromDate}&toDate=${fromDate}`;
        ApiClient.get(apiUrl)
            .then(response => {
                setPending(false);
                if (response?.data?.status === 1) {
                    const data = response.data.data.content;
                    setReportData(data);
                    setTotalElements(response.data.data.totalElements);
                } else {
                    setReportData([]);
                    toast.error(response.data.message);
                }
            })
            .catch(error => {
                setPending(false);
                setReportData([]);
                toast.error(error.message);
            });
    };

    const downloadExcel = () => {
        setPending(true);
        ApiClient.get(DOWNLOAD_TUESDAY_REPORT_EXCEL, { responseType: 'arraybuffer' })
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
                    } catch (parseError) {
                        toast.error("Unexpected error occurred while downloading Excel file.");
                    }
                    return;
                }

                const blob = new Blob([response.data], { type: contentType });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = `tuesday_activity_report_${generateTimestamp()}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((error) => {
                setPending(false);
                toast.error(error.message || "An unexpected error occurred.");
            });
    };

    const handleShowData = (e) => {
        e.preventDefault();
        getReportDetails(fromDate);
    };

    const handleClearData = () => {
        getInitDate()
    };

    const columns = useMemo(() => [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "4%",
            selector: (_, index) => index + 1,
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            selector: (row) => row.associateName,
            sortable: true,
            width: "12%",
            cell: (row) => <WordWrapCell>{row.associateName + ' (' + row.associateCode + ')'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Main Team</span>,
            selector: (row) => row.associateMainTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.associateMainTeam}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Sub Team</span>,
            selector: (row) => row.associateSubTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.associateSubTeam}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Created Date</span>,
            selector: (row) => row.createdDate,
            sortable: true,
            width: "10%",
            cell: (row) => <WordWrapCell>{formatDateTime(row?.createdDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Time For Joining</span>,
            selector: (row) => row.timeForJoining,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.timeForJoining}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Time For Leaving</span>,
            selector: (row) => row.timeForLeaving,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.timeForLeaving}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Personal Work</span>,
            selector: (row) => row.personalWork,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.personalWork}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Net Working Hour</span>,
            selector: (row) => row.netWorkingHour,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.netWorkingHour}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Achieve Target</span>,
            selector: (row) => row.achieveTarget,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.achieveTarget}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Any Sale Picked</span>,
            selector: (row) => row.anySalePicked,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.anySalePicked}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Anything Special</span>,
            selector: (row) => row.anythingSpecial,
            sortable: true,
            width: '30%',
            cell: (row) => <WordWrapCell>{row?.anythingSpecial}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Any Boarding Activity</span>,
            selector: (row) => row.anyBoardingActivity,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.anyBoardingActivity}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Productivity Rate</span>,
            selector: (row) => row.productivityRate,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.productivityRate}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Associates Present</span>,
            selector: (row) => row.associatesPresent,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.associatesPresent}</WordWrapCell>,
        }
    ], []);

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Tuesday Report" />
            {pending && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowData}>
                            <Row>
                                <Col md="3">
                                    <h6 className="font-size-11">Select Tuesday Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="3" className='d-flex align-items-end gap-2'>
                                        <Button
                                            color="primary"
                                            type="submit"
                                        >
                                            Show
                                        </Button>
                                        <Button
                                            color="secondary"
                                            type="button"
                                            onClick={handleClearData}
                                        >
                                            Cancel
                                        </Button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>
            </Container>

            {reportData?.length > 0 && (
                <i
                    className="fas fa-file-excel"
                    style={{
                        color: defaultTheme.primary,
                        cursor: 'pointer',
                        fontSize: '16px',
                        marginBottom: '10px'
                    }}
                    onClick={downloadExcel}
                ></i>
            )}

            <AppTable
                progressPending={pending}
                columns={columns}
                data={reportData}
                pagination
                paginationTotalRows={totalElements}
                paginationServer
                onChangePage={(newPage) => setPage(newPage)}
            />
        </PageContent>
    );
}
