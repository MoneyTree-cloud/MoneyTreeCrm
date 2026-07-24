/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import ApiClient, { imageBaseUrl } from '../../helpers/api_helper';
import { GET_RA_RC_REPORT, DOWNLOAD_RA_RC_EXCEL, GET_MTRS_STATUS, GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_, GET_ALL_MAIN_TEAM_DROPDOWN, GET_ALL_SUB_TEAM_DROPDOWN, GET_PAYMENT_BREAKUP, UPDATE_RA_RC_REMARKS } from '../../helpers/url_helper';
import { Button, Card, CardBody, Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import AppTable from '../../components/Common/Table';
import { formatDate, formatDateForInput, formatDateTime, generateTimestamp, getBookingMonthName, getBookingYear, roundToTwoDecimals, WordWrapCell } from '../../helpers/function_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { useUserStore } from '../../store/useUserStore';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';
import { decryptData } from '../../components/Common/CryptoUtils';
import Select from "react-select";
import { FaDownload, FaEdit, FaFilePdf } from 'react-icons/fa';
import ImageModal from '../../components/Common/ImageModal';
import { useGet } from '../../Hooks/useApi';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function VBAbReport() {
    const { userId, empCode } = useUserStore((state) => state.user);
    const [isPending, setIsPending] = useState(false);
    const [reportdata, setReportdata] = useState([])
    const [accessGranted, setAccessGranted] = useState(null);
    const [mtrsStatus, setMtrsStatus] = useState('')
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [raStatusType, setRaStatusType] = useState('')
    const [rcStatusType, setRcStatusType] = useState('')
    const [amountModalOpen, setAmountModalOpen] = useState(false)
    const [amountData, setAmountData] = useState([])
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const [modalSaleId, setModalSaleId] = useState('')
    const [mtrsData, setMtrsData] = useState('')

    const toggleModal = () => setModalOpen(!modalOpen);
    const toggleAmountModal = () => setAmountModalOpen(!amountModalOpen);
    const toggleImageModal = () => setImageModalOpen(!imageModalOpen);

    const initialFormState = {
        fromDate: "",
        toDate: "",
        saleId: "",
        builder: null,
        project: null,
        mainTeam: null,
        subTeam: null,
        dueDate: "",
        financeBookingStatus: null
    };
    const [formState, setFormState] = useState(initialFormState);
    const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_, { enabled: Boolean(accessGranted) });
    const { data: projectData } = useGet(`${GET_PROJECT_BY_BUILDER_}${formState?.builder?.value}`, { enabled: Boolean(formState?.builder?.value && accessGranted) });
    const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN, { enabled: Boolean(accessGranted) });
    const { data: subTeams } = useGet(
        `${GET_ALL_SUB_TEAM_DROPDOWN}${formState?.mainTeam?.value}`,
        { enabled: Boolean(formState?.mainTeam && accessGranted) }
    );

    const handleFormChange = (field, value) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageClick = (imageSrc) => {
        const fileExtension = imageSrc.split(".").pop().toLowerCase();
        const fileUrl = imageSrc;

        if (fileExtension === "pdf") {
            window.open(fileUrl, "_blank");
        }
        else if (fileExtension === "heic") {
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = imageSrc;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        else {
            setSelectedImage(fileUrl);
            toggleImageModal();
        }
    };

    const handleRadioChange = (event) => {
        setRaStatusType(event.target.value)
    };

    const handleRCRadioChange = (event) => {
        setRcStatusType(event.target.value)
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'vb-ab-report');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                getDataInit();
            }
        };
        checkAccess();
    }, [userId]);

    const handleClear = () => {
        setFormState(initialFormState)
        setRaStatusType('')
        setRcStatusType('')
        getDataInit()
    }

    const getDataInit = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // const startOfMonth = '2024-01-01'
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setFormState(prevState => ({
            ...prevState,
            fromDate: formatDateForInput(startOfMonth),
            toDate: formatDateForInput(endOfMonth)
        }));
        getReportData(formatDateForInput(startOfMonth), formatDateForInput(endOfMonth));
    }

    const getReportData = (startDate, endDate, builder, project, mainTeam, subTeam, saleId, raStatusType, rcStatusType, financeBookingStatus, dueDate) => {
        setIsPending(true);
        let url = `${GET_RA_RC_REPORT}${startDate}&toDate=${endDate}`;
        if (saleId) {
            url += `&saleId=${saleId}`
        }
        if (builder) {
            url += `&builderName=${builder?.label}`
        }
        if (project) {
            url += `&projectName=${project?.label}`
        }
        if (mainTeam) {
            url += `&mainTeam=${mainTeam?.value}`
        }
        if (subTeam) {
            url += `&subTeam=${subTeam?.value}`
        }
        if (raStatusType) {
            url += `&raStatus=${raStatusType === 'justified' ? 'Justified' : 'Non Justified'}`
        }
        if (rcStatusType) {
            url += `&rcStatus=${rcStatusType === 'justified' ? 'Justified' : 'Non Justified'}`
        }
        if (financeBookingStatus) {
            url += `&financeBookingStatus=${financeBookingStatus}`
        }
        if (dueDate) {
            url += `&demandDate=${dueDate}`
        }
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
        if (e) e.preventDefault();
        getReportData(formState.fromDate, formState.toDate, formState.builder, formState.project, formState.mainTeam, formState.subTeam, formState.saleId, raStatusType, rcStatusType, formState.financeBookingStatus?.value, formState.dueDate)
    }

    const downloadExcel = () => {
        setIsPending(true)
        let url = `${DOWNLOAD_RA_RC_EXCEL}${formState.fromDate}&toDate=${formState.toDate}`;
        if (formState.saleId) {
            url += `&saleId=${formState.saleId}`
        }
        if (formState.builder) {
            url += `&builderName=${formState.builder?.label}`
        }
        if (formState.project) {
            url += `&projectName=${formState.project?.label}`
        }
        if (formState.mainTeam) {
            url += `&mainTeam=${formState.mainTeam?.value}`
        }
        if (formState.subTeam) {
            url += `&subTeam=${formState.subTeam?.value}`
        }
        if (raStatusType) {
            url += `&raStatus=${raStatusType === 'justified' ? 'Justified' : 'Non Justified'}`
        }
        if (rcStatusType) {
            url += `&rcStatus=${rcStatusType === 'justified' ? 'Justified' : 'Non Justified'}`
        }

        ApiClient.get(url, { responseType: "arraybuffer" }).then(function (response) {
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
            link.download = `VB_AB_Report_${generateTimestamp()}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
            .catch(function (error) {
                setIsPending(false)
                toast.error(error.message || "An unexpected error occurred.");
            });
    }

    const handleEdit = (row) => {
        setEditData({
            RaRc_Remarks: row.RaRc_Remarks || ''
        });
        setMtrsData(row);
        setEditModalOpen(true);
    }

    const handleModalUpdate = () => {
        if (!editData.RaRc_Remarks || editData.RaRc_Remarks.trim() === '') {
            toast.error('Please enter remarks');
            return;
        }
        setEditModalOpen(false);
        handleUpdateData(editData.RaRc_Remarks);
    }

    const handleUpdateData = (remarks) => {
        setIsPending(true);
        ApiClient.post(`${UPDATE_RA_RC_REMARKS}saleId=${mtrsData?.MTRS_ID}&remarks=${remarks || ""}`)
            .then(response => {
                setIsPending(false);
                if (response.data.status === 1) {
                    toast.success(response.data.message);
                    getData();
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(error => {
                setIsPending(false);
                toast.error(error.message);
            });
    }

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "2%",
        },
        {
            name: <span className="font-weight-bold fs-13">Unique ID</span>,
            selector: (row) => row.MTRS_ID,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.MTRS_ID}</WordWrapCell>
        },
        ...((empCode !== '20019') ? [
            {
                name: <span className="font-weight-bold fs-13">Manage Remarks</span>,
                cell: (row) => (
                    <FaEdit
                        style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                        onClick={() => handleEdit(row)}
                        title="Edit"
                        size={20}
                    />
                ),
            },
        ] : []),
        {
            name: <span className="font-weight-bold fs-13">Team</span>,
            selector: (row) => row.Main_Team,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Main_Team + '/' + row.Sub_Team}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            selector: (row) => row.AssociateName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.AssociateName + " (" + row.AssociateCode + ")"}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Booking Date</span>,
            selector: (row) => row.DateOfBooking,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.DateOfBooking)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Booking Month</span>,
            selector: (row) => getBookingMonthName(row.DateOfBooking),
            sortable: true,
            cell: (row) => <WordWrapCell>{getBookingMonthName(row.DateOfBooking)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Booking Year</span>,
            selector: (row) => getBookingYear(row.DateOfBooking),
            sortable: true,
            cell: (row) => <WordWrapCell> {getBookingYear(row.DateOfBooking)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Location</span>,
            selector: (row) => row.Location,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Location}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Booking Count</span>,
            selector: (row) => row.booking_count,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.booking_count}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Prop Type</span>,
            selector: (row) => row.PropType,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.PropType}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Form Stage</span>,
            selector: (row) => row.Form_Stage,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Form_Stage}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Booking Status</span>,
            selector: (row) => row.BookingStatus,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.BookingStatus}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Builder Name</span>,
            selector: (row) => row.BuilderName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.BuilderName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Project Name</span>,
            selector: (row) => row.ProjectName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.ProjectName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row.ClientName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.ClientName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Floor</span>,
            selector: (row) => row.Floor,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Floor}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Tower/Block</span>,
            selector: (row) => row.TowerBlock,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.TowerBlock}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Unit No</span>,
            selector: (row) => row.UnitNo,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.UnitNo}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Area</span>,
            selector: (row) => row.Area,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Area % 1 === 0
                ? row.Area
                : row.Area.toFixed(2)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Possession Charges</span>,
            selector: (row) => row.Possession_Charges,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Possession_Charges}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Net Cost After Possession Charges</span>,
            selector: (row) => row.Net_Cost_after_Possession_Charges,
            sortable: true,
            cell: (row) =>
                <WordWrapCell>{row.Net_Cost_after_Possession_Charges % 1 === 0
                    ? row.Net_Cost_after_Possession_Charges
                    : row.Net_Cost_after_Possession_Charges.toFixed(2)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Turnover</span>,
            selector: (row) => row.Turnover,
            sortable: true,
            cell: (row) =>
                <WordWrapCell>{row.Turnover % 1 === 0
                    ? row.Turnover
                    : row.Turnover.toFixed(2)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Plan Choosen By Customer</span>,
            selector: (row) => row.Plan_Chosen_by_Customer,
            sortable: true,
            width: "10%",
            cell: (row) => <WordWrapCell>{row.Plan_Chosen_by_Customer}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Demand %</span>,
            selector: (row) => row.Demand,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Demand}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Due Date As Per Builder</span>,
            selector: (row) => row.builder_due_date,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.builder_due_date) || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Demand Date</span>,
            selector: (row) => row.Demand_Date,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.Demand_Date) || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Demand Amt</span>,
            selector: (row) => row.Demand_Amt,
            sortable: true,
            cell: (row) => <WordWrapCell>{roundToTwoDecimals(row.Demand_Amt)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">GST%</span>,
            selector: (row) => row.GST,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.GST}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">GST Amount</span>,
            selector: (row) => row.GST_Amount,
            sortable: true,
            cell: (row) => <WordWrapCell> {row.GST_Amount % 1 === 0
                ? row.GST_Amount
                : row.GST_Amount.toFixed(2)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Balance Payment With GST</span>,
            selector: (row) => row.Balance_Payment_with_GST,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Balance_Payment_with_GST % 1 === 0
                ? row.Balance_Payment_with_GST
                : row.Balance_Payment_with_GST.toFixed(2)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Payment Rec</span>,
            selector: (row) => row.Payment_Rec,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Payment_Rec}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Clearance Amount</span>,
            selector: (row) => row.Clearance_Amount,
            sortable: true,
            cell: (row) => <WordWrapCell>
                <span
                    className="attachment-count clickable"
                    onClick={() => row.Clearance_Amount > 0 && handleViewPayment(row.MTRS_ID)}
                    style={{ cursor: row.Clearance_Amount > 0 ? 'pointer' : 'not-allowed', color: 'blue', textDecoration: 'underline', fontWeight: 'bold' }}
                >
                    {row.Clearance_Amount}
                </span>
            </WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">BD Amount</span>,
            selector: (row) => row.BD_Amount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.BD_Amount}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Max Amount</span>,
            selector: (row) => row.Max_Amount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Max_Amount}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Due Balance</span>,
            selector: (row) => row.Due_Balance,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Due_Balance % 1 === 0
                ? row.Due_Balance
                : row.Due_Balance.toFixed(2)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Aging (Days)</span>,
            selector: (row) => row.Aging,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Aging}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Verified Business Status</span>,
            selector: (row) => row.VB_Status,
            sortable: true,
            cell: (row) =>
                <div style={{ wordWrap: "break-word", whiteSpace: "normal", color: row.VB_Status === 'Justified' ? 'green' : 'red', fontWeight: row.VB_Status === 'Justified' ? 'bold' : null }}>
                    {row.VB_Status}
                </div>
        },
        {
            name: <span className="font-weight-bold fs-13">Assured Business Status</span>,
            selector: (row) => row.AB_Status,
            sortable: true,
            cell: (row) =>
                <div style={{ wordWrap: "break-word", whiteSpace: "normal", color: row.AB_Status === 'Justified' ? 'green' : 'red', fontWeight: row.AB_Status === 'Justified' ? 'bold' : null }}>
                    {row.AB_Status}
                </div>
        },
        {
            name: <span className="font-weight-bold fs-13">Finance Booking Status</span>,
            selector: (row) => row.finance_booking_status,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.finance_booking_status}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Attachment Count</span>,
            selector: (row) => row.Attachment_Count,
            sortable: true,
            cell: (row) => <WordWrapCell>
                <span
                    className="attachment-count clickable"
                    onClick={() => row.Attachment_Count > 0 && handleViewImages(row.MTRS_ID)}
                    style={{ cursor: row.Attachment_Count > 0 ? 'pointer' : 'not-allowed', color: 'blue', textDecoration: 'underline', fontWeight: 'bold' }}
                >
                    {row.Attachment_Count}
                </span>
            </WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Remarks</span>,
            selector: (row) => row.RaRc_Remarks,
            sortable: true,
            width: '20%',
            cell: (row) => <WordWrapCell>{row.RaRc_Remarks}</WordWrapCell>
        }
    ];

    // Download all files as a ZIP
    const downloadAll = async () => {
        setIsPending(true);
        const zip = new JSZip();
        const filesToDownload = [];

        // Filter files with a valid payment attachment path
        mtrsStatus?.forEach(data => {
            if (data?.clearanceStatus === "Received") {
                const fileUrl = `${imageBaseUrl}${data?.financeRemarks ? data?.paymentAttachmentPath : data?.attachement1}`;
                const fileName = data?.financeRemarks ? data?.paymentAttachmentPath?.split('/').pop() : data?.attachement1?.split('/').pop(); // Get the file name from the URL
                filesToDownload?.push({ fileUrl, fileName });
            }
        });

        if (filesToDownload?.length > 0) {
            try {
                // Add each file to the ZIP
                for (const { fileUrl, fileName } of filesToDownload) {
                    const response = await fetch(fileUrl);
                    const blob = await response.blob();
                    zip.file(fileName, blob);
                }

                // Generate the ZIP file and trigger download
                const content = await zip.generateAsync({ type: 'blob' });
                saveAs(content, `${modalSaleId}_MTRS_all_payments_proof_${generateTimestamp()}.zip`);
            } catch (error) {
                console.error('Error downloading files:', error);
            }
            finally {
                setIsPending(false);
            }
        } else {
            setIsPending(false);
            toast.error('No files available for download');
        }
    };

    const handleViewImages = (MTRS_ID) => {
        ApiClient.get(`${GET_MTRS_STATUS}${MTRS_ID}`).then(function (response) {
            setIsPending(false);
            if (response.data.status === 1) {
                setMtrsStatus(response.data.data.saleAttachment)
                setModalSaleId(response.data.data.saleId)
                toggleModal();
            }
            else {
                toast.error(response.data.message)
            }
        })
            .catch(function (error) {
                toast.error(error.message);
            });
    }

    const handleViewPayment = (MTRS_ID) => {
        ApiClient.get(`${GET_PAYMENT_BREAKUP}${MTRS_ID}`).then(function (response) {
            setIsPending(false);
            if (response.data.status === 1) {
                setAmountData(response.data.data)
                toggleAmountModal();
            }
            else {
                toast.error(response.data.message)
            }
        })
            .catch(function (error) {
                toast.error(error.message);
            });
    }

    const financeBookingStatusGroup = [
        { value: 'Open', label: "Open" },
        { value: 'Cancel', label: "Cancel" },
        { value: 'Closed', label: "Closed" }
    ]

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="VB/AB" />
            {(isPending) && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={getData}>
                            <Row className='g-3'>
                                <Col md="2">
                                    <h6 className="font-size-11">From Date</h6>
                                    <input type="date" className="form-control" value={formState.fromDate} onChange={(e) => handleFormChange("fromDate", e.target.value)} />

                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">To Date</h6>
                                    <input type="date" className="form-control" value={formState.toDate} onChange={(e) => handleFormChange("toDate", e.target.value)} />

                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Builder</h6>
                                    <Select
                                        value={formState.builder}
                                        onChange={(val) => handleFormChange("builder", val)}
                                        options={Array.isArray(builderList?.data?.data) ? builderList.data.data : []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Project</h6>
                                    <Select
                                        value={formState.project}
                                        onChange={(val) => handleFormChange("project", val)}
                                        options={Array.isArray(projectData?.data?.data) ? projectData.data.data : []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        isDisabled={!formState.builder}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Main Team</h6>
                                    <Select
                                        value={formState.mainTeam}
                                        onChange={(val) => handleFormChange("mainTeam", val)}
                                        options={Array.isArray(mainTeams?.data?.data) ? mainTeams.data.data : []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Sub Team</h6>
                                    <Select
                                        value={formState.subTeam}
                                        onChange={(val) => handleFormChange("subTeam", val)}
                                        options={Array.isArray(subTeams?.data?.data) ? subTeams.data.data : []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        isDisabled={!formState.mainTeam}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Unique ID</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formState.saleId}
                                        placeholder="Unique ID..."
                                        onChange={(e) => handleFormChange("saleId", e.target.value)}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Due Date</h6>
                                    <input type="date" className="form-control" value={formState.dueDate} onChange={(e) => handleFormChange("dueDate", e.target.value)} />

                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Booking Status</h6>
                                    <Select
                                        value={formState.financeBookingStatus}
                                        onChange={(val) => handleFormChange("financeBookingStatus", val)}
                                        options={financeBookingStatusGroup || []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11"> Assured Business Status</h6>
                                    <div className="radio-button-container">
                                        {["justified", "not-Justified"].map((type) => (
                                            <label
                                                key={type}
                                                className={`radio-label ${raStatusType === type ? "active" : ""}`}
                                            >
                                                <input
                                                    type="radio"
                                                    value={type}
                                                    checked={raStatusType === type}
                                                    onChange={handleRadioChange}
                                                />
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </label>
                                        ))}
                                    </div>
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Verified Business Status</h6>
                                    <div className="radio-button-container">
                                        {["justified", "not-Justified"].map((type) => (
                                            <label
                                                key={type}
                                                className={`radio-label ${rcStatusType === type ? "active" : ""}`}
                                            >
                                                <input
                                                    type="radio"
                                                    value={type}
                                                    checked={rcStatusType === type}
                                                    onChange={handleRCRadioChange}
                                                />
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </label>
                                        ))}
                                    </div>
                                </Col>

                                <Col md="4" className="d-flex align-items-center">
                                    <button className="btn btn-primary me-2" type="submit" onClick={getData}>Search</button>
                                    <button className="btn btn-secondary" type="button" onClick={handleClear}>Clear</button>
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
                            fontSize: "15px",
                        }}
                        onClick={downloadExcel}
                    />
                )}

                <AppTable
                    progressPending={isPending}
                    columns={columns}
                    data={reportdata || []}
                    pagination
                    conditionalRowStyles={[{
                        when: r => r.BookingStatus === "Cancel",
                        style: { color: defaultTheme.redColor, fontWeight: 'bold' }
                    }]}
                />

                {mtrsStatus?.length > 0 &&
                    <Modal
                        isOpen={modalOpen}
                        toggle={toggleModal}
                    >
                        <ModalHeader toggle={toggleModal}>All Payment Proofs of Unique ID - {modalSaleId}</ModalHeader>
                        <ModalBody>
                            {mtrsStatus?.filter(data => data.clearanceStatus === "Received") ? (
                                <>
                                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <button
                                            onClick={downloadAll}
                                            style={{
                                                backgroundColor: defaultTheme.primary,
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                alignItems: 'center',
                                                padding: '8px 12px',
                                                borderRadius: '4px',
                                                color: '#fff',
                                                marginBottom: '10px'
                                            }}
                                        >
                                            Download All <FaDownload size={14} />
                                        </button>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: "10%" }}>#</th>
                                                    <th>Instrument No</th>
                                                    <th>Clearance Amount</th>
                                                    <th>Clearance Date</th>
                                                    <th>File</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mtrsStatus
                                                    ?.filter(data => data?.clearanceStatus === "Received")
                                                    ?.map((m, index) => (

                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>{m.chequeNo}</td>
                                                            <td>{m.clearanceAmount + ' (' + (m.financeRemarks ? 'F' : 'O') + ')'}</td>
                                                            <td>{formatDateTime(m.clearanceDate)}</td>
                                                            <td><button
                                                                onClick={() => handleImageClick(`${imageBaseUrl}${m?.financeRemarks ? m?.paymentAttachmentPath : m?.attachement1}`)}
                                                                style={{
                                                                    gap: '8px',
                                                                    color: defaultTheme.goldColorLogo,
                                                                    fontSize: '18px',
                                                                    background: 'transparent',
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                <FaFilePdf />
                                                            </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <p style={{ textAlign: 'center', color: 'gray', fontSize: '16px' }}>No Payment details available</p>
                            )}
                        </ModalBody>

                        {selectedImage && (
                            <ImageModal
                                isOpen={imageModalOpen}
                                toggle={toggleImageModal}
                                imageSrc={selectedImage}
                            />
                        )}
                    </Modal>
                }

                {/* Clearance Amount Details */}
                {amountData?.length > 0 &&
                    <Modal
                        isOpen={amountModalOpen}
                        toggle={toggleAmountModal}
                    >
                        <ModalHeader toggle={toggleAmountModal}>Clearance Amount Details</ModalHeader>
                        <ModalBody>
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: "10%" }}>#</th>
                                            <th>Instrument No</th>
                                            <th>Clearance Amount</th>
                                            <th>Clearance Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {amountData?.map((m, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{m.chequeNo}</td>
                                                <td>{m.clearanceAmount}</td>
                                                <td>{formatDate(m.clearanceDate)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </ModalBody>

                    </Modal>
                }

                {/* Modal */}
                <Modal isOpen={editModalOpen} toggle={() => setEditModalOpen(false)}>
                    <ModalHeader toggle={() => setEditModalOpen(false)}>
                        Edit Remarks
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col md="12" className="mt-2">
                                <label>Remarks</label>
                                <textarea
                                    className="form-control"
                                    type="text"
                                    placeholder='Enter Remarks...'
                                    rows="4"
                                    value={editData.RaRc_Remarks || ''}
                                    onChange={e => setEditData({ ...editData, RaRc_Remarks: e.target.value })}
                                />
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => handleModalUpdate()} style={{ backgroundColor: defaultTheme.primary }}>
                            Update
                        </Button>
                        <Button color="secondary" onClick={() => setEditModalOpen(false)} style={{ backgroundColor: defaultTheme.goldColorLogo }}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>

            </Container>
        </PageContent>
    );
}