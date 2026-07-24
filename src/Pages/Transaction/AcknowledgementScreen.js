/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import ApiClient, { imageBaseUrl } from '../../helpers/api_helper';
import { GET_ACKNOWLEDGEMENT_LIST, SEND_ACKNOWLEDGEMENT_MAIL } from '../../helpers/url_helper';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import AppTable from '../../components/Common/Table';
import { formatDate, formatDateForInput, getDaysFromToday, WordWrapCell } from '../../helpers/function_helper';
import { useUserStore } from '../../store/useUserStore';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';
import { decryptData } from '../../components/Common/CryptoUtils';
import { FaFilePdf } from 'react-icons/fa';
import { defaultTheme } from '../../helpers/defaultTheme';
import { BiSend } from 'react-icons/bi';

export default function AcknowledgementScreen() {
    const [isPending, setIsPending] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reportdata, setReportdata] = useState([])
    const [accessGranted, setAccessGranted] = useState(null);
    const { userId, userName, empCode } = useUserStore((state) => state.user);
    const [type, setType] = useState('pending')

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'acknowledgement-screen');
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
        getReportData(formatDateForInput(startOfMonth), formatDateForInput(endOfMonth), type);
    }

    const getReportData = (startDate, endDate, selectedType = type) => {
        setIsPending(true);
        let url = `${GET_ACKNOWLEDGEMENT_LIST}${startDate}&toDate=${endDate}&completed=${selectedType === 'pending' ? 'NO' : 'YES'}`;

        ApiClient.get(url).then(function (response) {
            setIsPending(false);
            if (response.data.status === 1) {
                const encryptedContent = response.data.data;
                // setReportdata(encryptedContent)
                decryptData(encryptedContent).then((decrypted) => {
                    setReportdata(decrypted);
                }).catch((e) => {
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
        getReportData(fromDate, toDate, type)
    }

    const getAcknowledgementFile = (row) => {
        return row?.saleAttachmentPath?.find(
            (item) => item.fileType === "Acknowledgement"
        );
    };

    // Dynamically generate columns from reportdata
    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: '6%',
        },
        {
            name: <span className="font-weight-bold fs-13">Unique ID</span>,
            selector: (row) => row.saleId,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.saleId}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Builder</span>,
            selector: (row) => row?.builderId,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.builderId?.bulderName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Project</span>,
            selector: (row) => row?.projectId,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.projectId?.projectName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Unit No.</span>,
            selector: (row) => row?.unitNo,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.unitNo}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row?.clientName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.clientName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">KYC Status</span>,
            selector: (row) => row?.kycStatusName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.kycStatusName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">KYC Call Status</span>,
            selector: (row) => row?.callKycStatus,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.callKycStatus}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">KYC Complete Date</span>,
            selector: (row) => row?.kycCompletedDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row?.kycCompletedDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Days Since KYC</span>,
            selector: (row) => row?.kycCompletedDate,
            sortable: true,
            cell: (row) => <div style={{ wordWrap: "break-word", whiteSpace: "normal", fontWeight: (getDaysFromToday(row?.kycCompletedDate) >= 10 ? 'bold' : null), color: (getDaysFromToday(row?.kycCompletedDate) >= 10 ? defaultTheme.redColor : null) }}>{getDaysFromToday(row?.kycCompletedDate)}</div>,
        },
        {
            name: <span className="font-weight-bold fs-13">Document</span>,
            cell: (row) => {
                const ackFile = getAcknowledgementFile(row);

                if (!ackFile) return <span className="text-muted">No File</span>;

                const fileUrl = `${imageBaseUrl}${ackFile.filePath}`;

                return (
                    <FaFilePdf
                        size={20}
                        style={{ cursor: "pointer", color: defaultTheme.redColor }}
                        title="View Acknowledgement"
                        onClick={() => window.open(fileUrl, "_blank")}
                    />
                );
            },
        },
        ...(type !== "completed"
            ? [
                {
                    name: <span className="font-weight-bold fs-13">Send Mail</span>,
                    cell: (row) => {
                        const ackFile = getAcknowledgementFile(row);

                        if (!ackFile) return null; // no acknowledgement file

                        return (
                            <BiSend
                                style={{
                                    cursor: ackFile.mailSentStatus === 'YES'
                                        ? 'not-allowed'
                                        : 'pointer',
                                    opacity: ackFile.mailSentStatus === 'YES' ? 0.5 : 1,
                                }}
                                size={20}
                                title={
                                    ackFile.mailSentStatus === 'YES'
                                        ? 'File Already Sent'
                                        : 'Send Mail'
                                }
                                className="text-secondary"
                                onClick={() => {
                                    if (ackFile.mailSentStatus !== 'YES') {
                                        sendMail(row, ackFile);
                                    }
                                }}
                            />
                        );
                    },
                }
            ]
            : []),
    ]

    const sendMail = (row, ackFile) => {
        const isConfirmed = window.confirm("Are you sure you want to send mail?");
        if (!isConfirmed) return;

        setIsPending(true);

        ApiClient.post(
            `${SEND_ACKNOWLEDGEMENT_MAIL}?id=${ackFile.id}&saleId=${row.saleId}&loginId=${userName + ' (' + empCode + ')'}`
        )
            .then(function (response) {
                setIsPending(false);

                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    getReportData(fromDate, toDate, type);
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
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
            <Breadcrumbs title="Transaction" breadcrumbItem="Acknowledgement" />
            {(isPending) && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={getData}>
                            <Row className='g-3'>
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

                                <Col md="4" className="d-flex align-items-end">
                                    <button className="btn btn-primary me-2" type="submit" onClick={getData}>Show</button>
                                    <button className="btn btn-secondary" type="button" onClick={getDataInit}>Clear</button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                {/* Radio Buttons */}
                <div className="radio-button-container">
                    {["pending", "completed"].map((option) => (
                        <label
                            key={option}
                            className={`radio-label ${type === option ? "active" : ""}`}
                        >
                            <input
                                type="radio"
                                value={option}
                                checked={type === option}
                                onChange={(e) => {
                                    const selectedType = e.target.value;
                                    setType(selectedType);
                                    getReportData(fromDate, toDate, selectedType); // call API immediately
                                }}
                            />

                            {option.charAt(0).toUpperCase() + option.slice(1)}
                        </label>
                    ))}
                </div>

                {/* <h3 style={{ fontSize: 12, fontWeight: 800, color: defaultTheme.redColor }}>
                    Note: This list displays only bookings with a "SATISFIED" KYC status and an attached, signed acknowledgment copy.

                </h3> */}
                <h3 style={{ fontSize: 12, fontWeight: 800, color: defaultTheme.redColor }}>
                    Note : This list displays only bookings with a status of "Accepted by Builder and an attached, signed acknowledgment copy."
                </h3>
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
