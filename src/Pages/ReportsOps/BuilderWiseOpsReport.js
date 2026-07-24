/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import ApiClient from '../../helpers/api_helper';
import { BUILDER_WISE_OPS_REPORT, DOWNLOAD_BUILDER_WISE_OPS_REPORT } from '../../helpers/url_helper';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import AppTable from '../../components/Common/Table';
import { formatDateForInput, generateTimestamp, WordWrapCell } from '../../helpers/function_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { useUserStore } from '../../store/useUserStore';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';

export default function BuilderWiseOpsReport() {
    const [isPending, setIsPending] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reportdata, setReportdata] = useState([])

    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'ops-report-builder-wise');
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
        let url = `${BUILDER_WISE_OPS_REPORT}${startDate}&toDate=${endDate}`;

        ApiClient.get(url).then(function (response) {
            setIsPending(false);
            if (response.data.status === 1) {
                setReportdata(response.data.data);
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

    // Dynamically generate columns from reportdata
    const columns = reportdata && reportdata.length > 0
        ? [
            {
                name: <span className="font-weight-bold fs-13">SL No.</span>,
                selector: (_, index) => index + 1,
            },
            ...Object.keys(reportdata[0]).map(key => ({
                name: <span className="font-weight-bold fs-13">{key.replace(/_/g, ' ')}</span>,
                selector: row => row[key],
                sortable: true,
                cell: row => <WordWrapCell>{row[key]}</WordWrapCell>,
            }))
        ]
        : [];

    const generateTotalRow = (data) => {
        if (!data || data.length === 0) return null;

        const keys = Object.keys(data[0]);
        const totalRow = { isTotalRow: true };

        keys.forEach((key) => {
            const firstValue = data[0][key];

            // If the column is numeric (number or string-number), sum it
            const isNumeric = typeof firstValue === "number" || (!isNaN(firstValue) && firstValue !== null && firstValue !== "");

            if (isNumeric) {
                totalRow[key] = data.reduce((sum, row) => {
                    const value = parseFloat(row[key]);
                    return sum + (isNaN(value) ? 0 : value);
                }, 0);
            } else {
                // Show "Total" in the first non-numeric column
                if (!totalRow.firstNonNumericSet) {
                    totalRow[key] = "Total";
                    totalRow.firstNonNumericSet = true; // temp flag, remove later
                } else {
                    totalRow[key] = ""; // empty for others
                }
            }
        });

        delete totalRow.firstNonNumericSet; // Clean up
        return totalRow;
    };

    const totalRow = generateTotalRow(reportdata);
    const updatedData = totalRow ? [totalRow, ...reportdata] : reportdata;

    const downloadExcel = () => {
        try {
            ApiClient.get(`${DOWNLOAD_BUILDER_WISE_OPS_REPORT}${fromDate}&toDate=${toDate}`, { responseType: "arraybuffer" })
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
                    link.download = `builderWiseData_${generateTimestamp()}.xlsx`;
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

    }

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Builder Wise" />
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

                {reportdata?.length > 0 && (
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
                    progressPending={isPending}
                    columns={columns}
                    data={updatedData || []}
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
            </Container>
        </PageContent>
    );
}
