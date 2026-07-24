/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { MdEmail, MdMobileFriendly } from "react-icons/md";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css";
import PageContent from "../../components/Common/PageContent";
import { GET_ALL_CUSTOMERS } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import { imageBaseUrl } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import ImageModal from "../../components/Common/ImageModal";
import { FaMapMarkerAlt } from "react-icons/fa";
import { formatDateTime } from "../../helpers/function_helper";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import { USER_TYPE } from "../../constants/global";

export default function ConnectEnrollment() {
    const mainTeam = useUserStore((state) => state.user.mainTeam);
    const role = useUserStore((state) => state.user.role);
    const [page, setPage] = useState(1)
    const [apiUrl, setApiUrl] = useState('')
    const limit = 100;
    const [flag, setFlag] = useState(false)
    const mainTeamQuery = role === USER_TYPE.ASSOCIATE  ? `&mainTeam=${mainTeam}` : '';
    const toggleModal = () => setFileModalOpen(!fileModalOpen);
    const [fileModalOpen, setFileModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState("");
    const userId = useUserStore((state) => state.user.userId);
    const [accessGranted, setAccessGranted] = useState(null);
    const [customersList, setCustomersList] = useState([]);
    const { data, isLoading } = useGet(apiUrl, { enabled: Boolean(apiUrl && accessGranted) });

    useEffect(() => {
        if (data?.data?.status === 1) {
            
            decryptData(data?.data?.data).then((decryptedData) => {
                if (decryptedData) {
                    setCustomersList(decryptedData);   
                } else {
                    setCustomersList([])
                }
            });
        }
    }, [data]);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'connect-enrollment');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    useEffect(() => {
        setApiUrl(`${GET_ALL_CUSTOMERS}offset=${page - 1}&limit=${limit}${mainTeamQuery}`)
    }, [])

    useEffect(() => {
        if (flag) {
            setApiUrl(`${GET_ALL_CUSTOMERS}offset=${page - 1}&limit=${limit}${mainTeamQuery}`)
        }
    }, [page])

    const handleViewFile = (filePath) => {
        if (!filePath) {
            toast.error("No File Attached");
        } else {
            setCurrentImage(filePath);
            toggleModal();
        }
    };

    const profileStyle = {
        width: "35px",
        height: "35px",
        objectFit: "cover",
        cursor: "pointer", // Show finger (pointer) cursor on hover
        borderRadius: "50%", // Make it round (circular)
        border: "2px solid", // 2px solid border
        borderColor: defaultTheme.goldColorLogo, // Custom border color (using your theme's gold color)
        padding: "2px",
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (row, index) => index + 1,
            sortable: true,
            width: "4%",
        },
        {
            name: <span className="font-weight-bold fs-13">Connect Details</span>,
            selector: (row) => row.customerName,
            sortable: true,
            width: "15%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.customerName + ' (' + row.customerId + ')'}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Profile</span>,
            sortable: true,
            cell: (row) =>
                row.customerImage ? (
                    <img
                        src={imageBaseUrl + row.customerImage}
                        alt="Profile"
                        style={profileStyle}
                        onClick={() => handleViewFile(imageBaseUrl + row.customerImage)}
                    />
                ) : null,
        },
        {
            name: <span className="font-weight-bold fs-13">PAN</span>,
            selector: (row) => row.panNumber,
            sortable: true,
            width: "8%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.panNumber}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Mobile No.</span>,
            sortable: true,
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
            name: <span className="font-weight-bold fs-13">Email</span>,
            sortable: true,
            selector: (row) => row.email,
            cell: (row) =>
                row.email ? (
                    <div className="phone-container">
                        <MdEmail
                            className="phone-icon"
                            color={defaultTheme.goldColorLogo}
                        />
                        <span className="phone-number">{row.email}</span>
                    </div>
                ) : null,
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
                        <span className="phone-number">{row.address + ', ' + row.city + ', ' + row.state + ' ' + row.pinCode}</span>
                    </div>
                ) : null,
        },
        {
            name: <span className="font-weight-bold fs-13">Plan</span>,
            selector: (row) => row.planName,
            sortable: true,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.planName}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">RM</span>,
            selector: (row) => row.refIdName,
            sortable: true,
            width: "13%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.refIdName + '(' + row.refId + ')'}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">RM MT</span>,
            selector: (row) => row.refIdMainTeam,
            sortable: true,
            width: "5%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.refIdMainTeam}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">RM ST</span>,
            selector: (row) => row.refIdSubTeam,
            sortable: true,
            width: "5%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.refIdSubTeam}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">GST Number</span>,
            selector: (row) => row.gstNumber,
            sortable: true,
            width: "9%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.gstNumber}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Payment Status</span>,
            selector: (row) => row.paymentStatus,
            sortable: true,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.paymentStatus}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Bank Name</span>,
            selector: (row) => row?.bankDetails?.bankName,
            sortable: true,
            width: "8%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row?.bankDetails?.bankName}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Account Number</span>,
            selector: (row) => row?.bankDetails?.accountNumber,
            sortable: true,
            width: "8%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row?.bankDetails?.accountNumber}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">IFSC Code</span>,
            selector: (row) => row?.bankDetails?.ifscCode,
            sortable: true,
            width: "8%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row?.bankDetails?.ifscCode}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Branch Name</span>,
            selector: (row) => row?.bankDetails?.branchName,
            sortable: true,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row?.bankDetails?.branchName}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Account Holder Name</span>,
            selector: (row) => row?.bankDetails?.accountHolderName,
            sortable: true,
            width: "12%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row?.bankDetails?.accountHolderName}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
            selector: (row) => row.createdDate,
            sortable: true,
            width: "12%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {formatDateTime(row.createdDate)}
                </div>
            ),
        }
    ];

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            {isLoading && <ScreenLoader />}
            <Breadcrumbs title="Connect" breadcrumbItem="Enrollment" />
            <Container fluid={true}>
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={Array.isArray(customersList?.content) ? customersList?.content : []}
                    pagination
                    paginationTotalRows={customersList?.totalElements}
                    paginationServer
                    onChangePage={(newPage) => {
                        setPage(newPage);
                        setFlag(true);
                    }}
                />
            </Container>

            <ImageModal
                isOpen={fileModalOpen}
                toggle={toggleModal}
                imageSrc={currentImage}
            />
        </PageContent>
    );
}