/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import {
    Container,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button
} from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet, usePost } from "../../Hooks/useApi";
import {
    CONNECT_INVOICE_GET_ALL,
    CONNECT_INVOICE_UPLOAD
} from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { formatDateTime } from "../../helpers/function_helper";
import { FaEye, FaFilePdf } from "react-icons/fa";
import { imageBaseUrl } from "../../helpers/api_helper";
import { IoIosCloudUpload, IoMdSend } from "react-icons/io";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function ConnectInvoice() {
    const empCode = useUserStore((state) => state.user.empCode);
    const userName = useUserStore((state) => state.user.userName);
    const [modal, setModal] = useState(false);
    const [modalData, setModalData] = useState(false);
    const [customerId, setCustomerId] = useState('');
    const [historyId, setHistoryId] = useState('');
    const [file, setFile] = useState({});
    const [moreModalData, setMoreModalData] = useState([])
    const [invoiceType, setInvoiceType] = useState("pending");
    const fileInputRefs = useRef([]);
    const userId = useUserStore((state) => state.user.userId);
    const [accessGranted, setAccessGranted] = useState(null);
    const [invoiceData, setInvoiceData] = useState([]);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'connect-invoice');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const {
        data,
        isLoading,
        refetch: getInvoiceData
    } = useGet(CONNECT_INVOICE_GET_ALL, { enabled: Boolean(accessGranted) });

    useEffect(() => {
    if (data?.data?.status === 1) {
      
      decryptData(data?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setInvoiceData(decryptedData);   
        } else {
          setInvoiceData([])
        }
      });
    }
  }, [data]);

    const handleFileChange = (e, index) => {
        const selectedFile = e.target.files[0];  // Get the selected file
        if (selectedFile) {
            // Check if the file is a PDF
            if (selectedFile.type === 'application/pdf') {
                setFile(prevState => ({
                    ...prevState,
                    [index]: { file: selectedFile, preview: null },  // Update the file for the specific row
                }));
            } else {
                toast.error('Only PDF files are allowed!');
            }
        }
    };

    const toggle = () => setModal(!modal);

    const toggleModalData = () => setModalData(!modalData);

    const handleFileUpload = (index, row) => {
        if (file) {
            setCustomerId(row.customerId);
            setHistoryId(row.historyId)
            setFile(file[index].file)
            toggle();
        } else {
            toast.error("Please Select File To Upload");
        }
    };

    const confirmUpload = () => {
        const formDataApi = new FormData();
        formDataApi.append("customerId", customerId);
        formDataApi.append("createdBy", userName + ' (' + empCode + ')');
        formDataApi.append("historyId", historyId);
        formDataApi.append("file", file);
        mutateAdd(formDataApi);
    };

    const { isPending: isPendingAdd, mutate: mutateAdd } = usePost(
        CONNECT_INVOICE_UPLOAD,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    getInvoiceData();
                    setCustomerId('');
                    setHistoryId('')
                    setFile({});
                    toggle();
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    const handleViewFile = (fileName) => {
        const fileUrl = imageBaseUrl + fileName;
        window.open(fileUrl, "_blank");
    };

    const handleAttachFile = (rowIndex) => {
        fileInputRefs.current[rowIndex].click(); // Trigger file selection for the specific row
    };

    const handleViewUploadedFile = (rowIndex) => {
        const files = file[rowIndex]?.file;
        if (files) {
            const fileExtension = files.name.split(".").pop().toLowerCase();
            const fileUrl = URL.createObjectURL(files); // Generate URL for the file object

            if (fileExtension === "pdf") {
                // Open PDF in a new tab/window
                window.open(fileUrl, "_blank");
            }
        }
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (row, index) => index + 1,
            sortable: true,
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">Connect Details</span>,
            selector: (row) => row.customerName,
            sortable: true,
            width: "20%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.customerName + ' (' + row.customerId + ')'}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Payment Amount</span>,
            selector: (row) => row.totalAmount,
            sortable: true,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.totalAmount / 100}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Payment Date & Time</span>,
            selector: (row) => row.createdDate,
            sortable: true,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {formatDateTime(row.createdDate)}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">KYC Status</span>,
            selector: (row) => row.kycStatus,
            sortable: true,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.kycStatus}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Upload Invoice</span>,
            cell: (row, index) => (
                <div className="d-flex align-items-center">
                    <Button color="link" onClick={() => handleAttachFile(index)}>
                        <IoIosCloudUpload
                            size={27}
                            style={{ color: defaultTheme.btnEnable }}
                        />
                    </Button>
                    <input
                        name="files"
                        type="file"
                        ref={(el) => (fileInputRefs.current[index] = el)}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, index)}
                        accept=".pdf"
                    />
                    {file[index] && file[index].file && (
                        <div className="d-flex align-items-center">
                            <FaFilePdf
                                size={22}
                                color={defaultTheme.goldColorLogo}
                                onClick={() => handleViewUploadedFile(index)}
                                style={{ cursor: "pointer" }}
                            />
                            <IoMdSend
                                onClick={() => handleFileUpload(index, row)}
                                style={{
                                    cursor: "pointer",
                                    color: defaultTheme.primary,
                                    fontSize: "28px",
                                    marginLeft: "15px",
                                }}
                            />
                        </div>
                    )}
                </div>
            ),
            sortable: false,
        },
        ...(invoiceType !== "pending"
            ? [
                {
                    name: <span className="font-weight-bold fs-13">File</span>,
                    selector: (row) => (
                        <div>
                            {row.invoice && row.invoice !== null && (
                                <FaFilePdf
                                    size={20}
                                    onClick={() => handleViewFile(row.invoice.invoicePath)}
                                    style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                                />
                            )}
                        </div>
                    ),
                    sortable: true,
                },
            ]
            : []),
        {
            name: <span className="font-weight-bold fs-13">View More</span>,
            selector: (row) => (
                <div>
                    <FaEye
                        size={18}
                        onClick={() => {
                            setMoreModalData(row);
                            toggleModalData();
                        }}
                        style={{ cursor: "pointer", color: defaultTheme.primary }}
                    />
                </div>
            ),
            sortable: true,
        },
    ];

    const handleRadioChange = (event) => {
        setInvoiceType(event.target.value);
    };

    const filteredData = Array.isArray(invoiceData) ? invoiceData.reverse().filter(item =>
        invoiceType === "pending" ? item.invoice === null : item.invoice !== null
    )
        : [];

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }
    
    return (
        <PageContent>
            {(isLoading || isPendingAdd) && <ScreenLoader />}
            <Breadcrumbs title="Connect" breadcrumbItem="Invoice" />
            <Container fluid={true}>

                <div className="radio-button-container">
                    <label className={`radio-label ${invoiceType === "pending" ? "active" : ""}`}>
                        <input
                            type="radio"
                            value="pending"
                            checked={invoiceType === "pending"}
                            onChange={handleRadioChange}
                        />
                        Pending
                    </label>
                    <label className={`radio-label ${invoiceType === "completed" ? "active" : ""}`}>
                        <input
                            type="radio"
                            value="completed"
                            checked={invoiceType === "completed"}
                            onChange={handleRadioChange}
                        />
                        Completed
                    </label>
                </div>

                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={filteredData}
                    pagination
                />

                {/* Confirmation Modal */}
                <Modal isOpen={modal} toggle={toggle}>
                    <ModalHeader toggle={toggle}>Confirm Invoice Upload</ModalHeader>
                    <ModalBody>Are you sure you want to upload the invoice ?</ModalBody>
                    <ModalFooter>
                        <Button
                            color="primary"
                            style={{ backgroundColor: defaultTheme.primary }}
                            onClick={confirmUpload}
                        >
                            Yes, Upload
                        </Button>
                        <Button
                            color="secondary"
                            style={{ backgroundColor: defaultTheme.goldColorLogo }}
                            onClick={toggle}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={modalData} toggle={toggleModalData}>
                    <ModalHeader toggle={toggleModalData}>Additional Information</ModalHeader>
                    <ModalBody>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <strong style={{ textDecoration: 'underline', color: defaultTheme.btnEnable }}>Personal Information:</strong>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Name:</strong>
                                <span>{moreModalData.customerName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Mobile No:</strong>
                                <span>{moreModalData.customerPhone}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Email:</strong>
                                <span>{moreModalData.customerEmail}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>PAN:</strong>
                                <span>{moreModalData.panNumber}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>GST:</strong>
                                <span>{moreModalData.gstNumber}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Address:</strong>
                                <span>{moreModalData.customerStreetAddress1 + ', ' + moreModalData.customerCity + ', ' + moreModalData.customerState + ', ' + moreModalData.customerZip + ', ' + moreModalData.customerCountry}</span>
                            </div>
                            <strong style={{ textDecoration: 'underline', color: defaultTheme.btnEnable }}>Bank Details:</strong>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Bank Name:</strong>
                                <span>{moreModalData?.bankDetails?.bankName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Account Number:</strong>
                                <span>{moreModalData?.bankDetails?.accountNumber}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>IFSC Code:</strong>
                                <span>{moreModalData?.bankDetails?.ifscCode}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Branch Name:</strong>
                                <span>{moreModalData?.bankDetails?.branchName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Account Holder Name:</strong>
                                <span>{moreModalData?.bankDetails?.accountHolderName}</span>
                            </div>
                            <strong style={{ textDecoration: 'underline', color: defaultTheme.btnEnable }}>Payment Details:</strong>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Amount:</strong>
                                <span>{moreModalData?.totalAmount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Payment Date:</strong>
                                <span>{formatDateTime(moreModalData.createdDate)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>RRN Number:</strong>
                                <span>{moreModalData.rrnNumber}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>UPI ID:</strong>
                                <span>{moreModalData.cardMask}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Pay Id:</strong>
                                <span>{moreModalData.payId}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Order Id:</strong>
                                <span>{moreModalData.orderId}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Txn Type:</strong>
                                <span>{moreModalData.txntype}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Plan Name:</strong>
                                <span>{moreModalData.planName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Invoice Uploaded By:</strong>
                                <span>{moreModalData?.invoice?.uploadedBy}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Invoice Uploaded Date:</strong>
                                <span>{formatDateTime(moreModalData?.invoice?.createdDate)}</span>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="secondary"
                            style={{ backgroundColor: defaultTheme.goldColorLogo }}
                            onClick={toggleModalData}
                        >
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>

            </Container>
        </PageContent>
    );
}
