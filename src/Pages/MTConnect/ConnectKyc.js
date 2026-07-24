import React, { useEffect, useState } from "react";
import { Button, Container, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css";
import PageContent from "../../components/Common/PageContent";
import { CONNECT_KYC_DOCS, CONNECT_KYC_UPDATE, } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { toast } from "react-toastify";
import ImageModal from "../../components/Common/ImageModal";
import { FaCheck, FaCheckCircle, FaFilePdf, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function ConnectKyc() {
    const [page, setPage] = useState(1)
    const [apiUrl, setApiUrl] = useState('')
    const limit = 100;
    const toggleModal = () => setFileModalOpen(!fileModalOpen);
    const [fileModalOpen, setFileModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState("");
    const [isPending, setIsPending] = useState(false)
    const [docName, setDocName] = useState('')
    const [row, setRow] = useState('')
    const [status, setStatus] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [kycType, setKycType] = useState("PENDING");

    const userId = useUserStore((state) => state.user.userId);
    const [accessGranted, setAccessGranted] = useState(null);
    const [kycList, setKycList] = useState([]);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'connect-kyc');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const { data, isLoading, refetch: getAllKycList } = useGet(apiUrl, { enabled: Boolean(apiUrl && accessGranted) });

    useEffect(() => {
        if (data?.data?.status === 1) {
            decryptData(data?.data?.data).then((decryptedData) => {
                if (decryptedData) {
                    setKycList(decryptedData);
                } else {
                    setKycList([])
                }
            });
        }
    }, [data]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        setApiUrl(`${CONNECT_KYC_DOCS}offset=${page - 1}&limit=${limit}&status=${kycType}`)
    }, [kycType, page])

    const handleViewFile = (fileName) => {
        const fileExtension = fileName.split(".").pop().toLowerCase();
        const fileUrl = imageBaseUrl + fileName;

        if (fileExtension === "pdf" || fileExtension === "pptx") {
            // Open PDF in a new window
            window.open(fileUrl, "_blank");
        } else {
            // Set the image source and open modal for images
            setCurrentImage(fileUrl);
            toggleModal();
        }
    };

    const handleFileStatusChange = (row, status, docName) => {
        setIsModalOpen(true)
        setRow(row)
        setStatus(status)
        setDocName(docName)
    }

    const handleUpdateConfirm = () => {
        setIsPending(true);
        ApiClient.get(
            `${CONNECT_KYC_UPDATE}?` +
            `panNumberStatus=${docName === 'pan' ? (status === 'approve' ? 'APPROVED' : status === 'reject' ? 'REJECTED' : row.panProofStatus) : row.panProofStatus}` +
            `&addressProofStatus=${docName === 'address' ? (status === 'approve' ? 'APPROVED' : status === 'reject' ? 'REJECTED' : row.addressProofStatus) : row.addressProofStatus}` +
            `&gstNumberStatus=${docName === 'gst' ? (status === 'approve' ? 'APPROVED' : status === 'reject' ? 'REJECTED' : row.gstProofStatus) : row.gstProofStatus}&customerId=${row.customerId}`
        )
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message)
                    getAllKycList()
                    setIsModalOpen(false)
                    setRow('')
                    setStatus('')
                    setDocName('')
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    }

    const handleRadioChange = (event) => {
        setKycType(event.target.value);
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (row, index) => index + 1,
            sortable: true,
            width: "5%",
        },
        {
            name: <span className="font-weight-bold fs-13">Connect Details</span>,
            selector: (row) => row.customerName,
            sortable: true,
            width: '20%',
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.customerName + ' (' + row.customerId + ')'}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">PAN</span>,
            selector: (row) => row.panNumber,
            sortable: true,
            width: '10%',
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.panNumber}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">File</span>,
            selector: (row) => (
                <div>
                    {row.panNumberProof &&
                        <FaFilePdf
                            size={20}
                            onClick={() => handleViewFile(row.panNumberProof)}
                            style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                        />
                    }
                </div>
            ),
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    {
                        row.panProofStatus === 'REJECTED' ? (
                            <FaTimes
                                style={{
                                    cursor: "pointer",
                                    color: defaultTheme.redColor,
                                }}
                                size={20}
                            />
                        ) : row.panProofStatus === 'UPLOADED' ? (
                            <div>
                                <FaCheck
                                    style={{
                                        cursor: "pointer",
                                        color: defaultTheme.primary,
                                        marginRight: "10px",
                                    }}
                                    onClick={() => handleFileStatusChange(row, 'approve', 'pan')}
                                    size={20}
                                />
                                <FaTimes
                                    style={{
                                        cursor: "pointer",
                                        color: defaultTheme.redColor,
                                        marginLeft: "10px",
                                    }}
                                    onClick={() => handleFileStatusChange(row, 'reject', 'pan')}
                                    size={20}
                                />
                            </div>
                        ) : row.panProofStatus === 'APPROVED' ? (
                            <FaCheckCircle
                                style={{ color: defaultTheme.btnEnable }}
                                size={20}
                            />
                        ) : null
                    }


                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Address</span>,
            sortable: true,
            selector: (row) => row.address,
            cell: (row) =>
                row.address ? (
                    <div className="phone-container">
                        <FaMapMarkerAlt
                            className="phone-icon"
                            color={defaultTheme.goldColorLogo}
                        />
                        <span className="phone-number">{row.address}</span>
                    </div>
                ) : null,
        },
        {
            name: <span className="font-weight-bold fs-13">File</span>,
            selector: (row) => (
                <div>
                    {row.addressProof &&
                        <FaFilePdf
                            size={20}
                            onClick={() => handleViewFile(row.addressProof)}
                            style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                        />
                    }
                </div>
            ),
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    {
                        row.addressProofStatus === 'REJECTED' ? (
                            <FaTimes
                                style={{
                                    cursor: "pointer",
                                    color: defaultTheme.redColor,
                                }}
                                size={20}
                            />
                        ) : row.addressProofStatus === 'UPLOADED' ? (
                            <div>
                                <FaCheck
                                    style={{
                                        cursor: "pointer",
                                        color: defaultTheme.primary,
                                        marginRight: "10px",
                                    }}
                                    size={20}
                                    onClick={() => handleFileStatusChange(row, 'approve', 'address')}
                                />
                                <FaTimes
                                    style={{
                                        cursor: "pointer",
                                        color: defaultTheme.redColor,
                                        marginLeft: "10px",
                                    }}
                                    size={20}
                                    onClick={() => handleFileStatusChange(row, 'reject', 'address')}
                                />
                            </div>
                        ) : row.addressProofStatus === 'APPROVED' ? (
                            <FaCheckCircle
                                style={{ color: defaultTheme.btnEnable }}
                                size={20}
                            />
                        ) : null
                    }

                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">GST Number</span>,
            selector: (row) => row.gstNumber,
            sortable: true,
            width: '16%',
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.gstNumber}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">File</span>,
            selector: (row) => (
                <div>
                    {row.gstProof &&
                        <FaFilePdf
                            size={20}
                            onClick={() => handleViewFile(row.gstProof)}
                            style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                        />
                    }
                </div>
            ),
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    {
                        row.gstProofStatus === 'REJECTED' ? (
                            <FaTimes
                                style={{
                                    cursor: "pointer",
                                    color: defaultTheme.redColor,
                                }}
                                size={20}
                            />
                        ) : row.gstProofStatus === 'UPLOADED' ? (
                            <div>
                                <FaCheck
                                    style={{
                                        cursor: "pointer",
                                        color: defaultTheme.primary,
                                        marginRight: "10px",
                                    }}
                                    size={20}
                                    onClick={() => handleFileStatusChange(row, 'approve', 'gst')}
                                />
                                <FaTimes
                                    style={{
                                        cursor: "pointer",
                                        color: defaultTheme.redColor,
                                        marginLeft: "10px",
                                    }}
                                    size={20}
                                    onClick={() => handleFileStatusChange(row, 'reject', 'gst')}
                                />
                            </div>
                        ) : row.gstProofStatus === 'APPROVED' ? (
                            <FaCheckCircle
                                style={{ color: defaultTheme.btnEnable }}
                                size={20}
                            />
                        ) : null
                    }

                </div>
            ),
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
            {(isLoading || isPending) && <ScreenLoader />}
            <Breadcrumbs title="Connect" breadcrumbItem="KYC" />

            <div className="radio-button-container">
                <label className={`radio-label ${kycType === "PENDING" ? "active" : ""}`}>
                    <input
                        type="radio"
                        value="PENDING"
                        checked={kycType === "PENDING"}
                        onChange={handleRadioChange}
                    />
                    Pending
                </label>
                <label className={`radio-label ${kycType === "APPROVED" ? "active" : ""}`}>
                    <input
                        type="radio"
                        value="APPROVED"
                        checked={kycType === "APPROVED"}
                        onChange={handleRadioChange}
                    />
                    Approved
                </label>
            </div>
            <Container fluid={true}>
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={Array.isArray(kycList?.content) ? kycList?.content : []}
                    pagination
                    paginationTotalRows={kycList?.totalElements}
                    paginationServer
                    onChangePage={(newPage) => setPage(newPage)}
                />
            </Container>

            <ImageModal
                isOpen={fileModalOpen}
                toggle={toggleModal}
                imageSrc={currentImage}
            />

            <Modal isOpen={isModalOpen} toggle={handleCloseModal}>
                <ModalHeader toggle={handleCloseModal}>
                    Confirm Update Status
                </ModalHeader>
                <ModalBody>Are you sure you want to update the status?</ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        style={{ backgroundColor: defaultTheme.primary }}
                        onClick={handleUpdateConfirm}
                    >
                        Yes
                    </Button>
                    <Button
                        color="secondary"
                        style={{ backgroundColor: defaultTheme.goldColorLogo }}
                        onClick={handleCloseModal}
                    >
                        No
                    </Button>
                </ModalFooter>
            </Modal>
        </PageContent>
    );
}