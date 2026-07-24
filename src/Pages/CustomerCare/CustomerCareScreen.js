/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { GET_ALL_CC, RESOLVE_CC } from "../../helpers/url_helper";
import { usePost } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css"; // Import your CSS file
import { useLocation, useNavigate } from "react-router-dom";
import PageContent from "../../components/Common/PageContent";
import { formatDate, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { MdEmail, MdMobileFriendly } from "react-icons/md";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { toast } from "react-toastify";
import ApiClient from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import DOMPurify from "dompurify";

export default function CustomerCareScreen() {
    const empCode = useUserStore((state) => state.user.empCode);
    const navigation = useNavigate();
    const [expandedRows, setExpandedRows] = useState({});
    const [statusValue, setStatusValue] = useState("YES");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowId, setRowId] = useState("");
    const [isPending, setIsPending] = useState(false)
    const [momData, setMomData] = useState([])
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);
    const location = useLocation();
    const { statusValue_ } = location.state || {};

    useEffect(() => {
        if (statusValue_) {
            setStatusValue(statusValue_)
        }
    }, [statusValue_])

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        if (accessGranted) {
            getMomDetails(`${GET_ALL_CC}?status=${statusValue_ ? statusValue_ : statusValue}`)
        }
    }, [accessGranted])

    const getMomDetails = (url) => {
        setIsPending(true)
        ApiClient.get(url)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    const encryptedContent = response.data.data
                    decryptData(encryptedContent).then((decrypted) => {
                        setMomData(decrypted);
                    }).catch((error) => {
                        setMomData([]);
                    });
                } else {
                    setMomData([])
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                setMomData([])
                toast.error(error.message);
            });
    };

    const handleRadioChange = (event) => {
        setStatusValue(event.target.value);
        getMomDetails(`${GET_ALL_CC}?status=${event.target.value}`)
    };

    const handleManageUpdate = (row) => {
        navigation("/customer-care-screen/customer-care-add-screen", {
            state: { rowData: row, statusValue: statusValue },
        });
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "5%",
        },
        ...((empCode !== '1247')
            ? [
                {
                    name: <span className="font-weight-bold fs-13">Manage</span>,
                    width: '8%',
                    cell: (row) => (
                        <i
                            className="ri-pencil-fill align-bottom me-2"
                            onClick={() => handleManageUpdate(row)}
                            style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                        ></i>
                    ),
                },
            ]
            : []),
        ...((statusValue === 'YES' && empCode !== '1247')
            ? [
                {
                    name: <span className="font-weight-bold fs-13">Action</span>,
                    width: "6%",
                    cell: (row) => (
                        <FaArrowAltCircleRight
                            className="ri-pencil-fill align-bottom me-2"
                            onClick={() => {
                                setIsModalOpen(true);
                                setRowId(row.id);
                            }}
                            style={{
                                cursor: "pointer",
                                color: defaultTheme.primary,
                                fontSize: 16,
                            }}
                        />
                    )
                }
            ]
            : []),
        {
            name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
            selector: (row) => row.createdDate,
            sortable: true,
            width: "13%",
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Builder Name</span>,
            selector: (row) => row.builderName,
            sortable: true,
            width: "10%",
            cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Project Name</span>,
            selector: (row) => row.projectName,
            sortable: true,
            width: "10%",
            cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Unit No.</span>,
            selector: (row) => row.unitNo,
            sortable: true,
            width: "10%",
            cell: (row) => <WordWrapCell>{row.unitNo}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Name</span>,
            selector: (row) => row.associateNam0,
            sortable: true,
            width: "12%",
            cell: (row) => <WordWrapCell>{row.associateName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Associate ID</span>,
            selector: (row) => row.associateCode,
            sortable: true,
            width: "10%",
            cell: (row) => <WordWrapCell>{row.associateCode}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Main Team</span>,
            selector: (row) => row.mainTeam,
            sortable: true,
            width: "10%",
            cell: (row) => <WordWrapCell>{row.mainTeam}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Sub Team</span>,
            selector: (row) => row.subTeam,
            sortable: true,
            width: "10%",
            cell: (row) => <WordWrapCell>{row.subTeam}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Assign To</span>,
            selector: (row) => row.assignTo,
            sortable: true,
            width: "8%",
            cell: (row) => <WordWrapCell>{row.assignTo}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Name</span>,
            selector: (row) => row.customerName,
            sortable: true,
            width: "10%",
            cell: (row) => <WordWrapCell>{row.customerName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Mobile No.</span>,
            width: "9%",
            selector: (row) => row.customerMobile,
            cell: (row) => (
                row.customerMobile ? (
                    <div className="phone-container">
                        <MdMobileFriendly
                            className="phone-icon"
                            color={defaultTheme.goldColorLogo}
                        />
                        <span className="phone-number">{row.customerMobile}</span>
                    </div>
                ) : null
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Email</span>,
            width: "6%",
            selector: (row) => row.location,
            cell: (row) =>
                row.customerEmail ? (
                    <div className="phone-container">
                        <MdEmail
                            className="phone-icon"
                            color={defaultTheme.goldColorLogo}
                        />
                        <span className="phone-number">{row.customerEmail}</span>
                    </div>
                ) : null,
        },
        {
            name: <span className="font-weight-bold fs-13">Complaint Type</span>,
            selector: (row) => row.complaintType,
            sortable: true,
            width: "12%",
            cell: (row) => <WordWrapCell>{row?.complaintType?.charAt(0).toUpperCase() + row?.complaintType?.slice(1) || '-'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Complaint Received Date</span>,
            selector: (row) => row.emailReceiveDate,
            sortable: true,
            width: "12%",
            cell: (row) => <WordWrapCell>{formatDate(row.emailReceiveDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Complaint Received Time</span>,
            selector: (row) => row.emailReceiveTime,
            sortable: true,
            width: "12%",
            cell: (row) => <WordWrapCell>{row.emailReceiveTime}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Summary Of Complaint</span>,
            selector: (row) => row.data,
            sortable: true,
            width: "57%",
            cell: (row, index) => {
                const isExpanded = expandedRows[index] || false; // Check if the current row is expanded

                const sanitizedDescription = row.emailDescription
                    ? row.emailDescription.replace(/(\r\n|\n|\r)/g, "<br /><br />")
                    : "";

                const truncatedDescription = sanitizedDescription.length > 100 ? sanitizedDescription.substring(0, 100) + '...' : sanitizedDescription;

                const toggleDescription = () => {
                    setExpandedRows((prevState) => ({
                        ...prevState,
                        [index]: !isExpanded, // Toggle the expanded state for the current row
                    }));
                };

                return (
                    <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                        {/* <div
                            dangerouslySetInnerHTML={{
                                __html: isExpanded ? sanitizedDescription : truncatedDescription,
                            }}
                        /> */}
                        <div
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                    isExpanded ? sanitizedDescription : truncatedDescription
                                ),
                            }}
                        />

                        {sanitizedDescription.length > 100 && (
                            <button
                                onClick={toggleDescription} // Toggle function for each row
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: defaultTheme.goldColorLogo,
                                    fontWeight: "bold",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    padding: 0,
                                    fontSize: "inherit",
                                    marginTop: "10px",
                                }}
                            >
                                {isExpanded ? "Show Less" : "Show More"}
                            </button>
                        )}
                    </div>
                );
            },
        }
    ];

    const handleManageaAdd = () => {
        navigation("/customer-care-screen/customer-care-add-screen", {
            state: { rowData: {} },
        });
    };

    const handleMoveConfirm = () => {
        setIsModalOpen(false);
        mutate()
    }

    const { isPending: addLoadingPost, mutate } = usePost(
        `${RESOLVE_CC}${rowId}`,
        {
            onSuccess: (response) => {
                setRowId("");
                if (response?.data.status === 1) {
                    toast.success(response.data.message);
                    getMomDetails(`${GET_ALL_CC}?status=${statusValue}`)
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                setRowId("");
                toast.error(err.message);
            },
        }
    );

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'customer-care-screen');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Customer Care" breadcrumbItem="Menu" />
            {(isPending || addLoadingPost) && <ScreenLoader />}
            {empCode !== '1247' &&
                <i
                    className="fas fa-plus"
                    style={{
                        color: defaultTheme.primary,
                        cursor: "pointer",
                        fontSize: "16px",
                        marginBottom: '20px'
                    }}
                    onClick={handleManageaAdd}
                ></i>
            }
            <div className="radio-button-container">
                <label
                    className={`radio-label ${statusValue === "YES" ? "active" : ""}`}
                >
                    <input
                        type="radio"
                        value="YES"
                        checked={statusValue === "YES"}
                        onChange={handleRadioChange}
                    />
                    Pending
                </label>
                <label
                    className={`radio-label ${statusValue === "NO" ? "active" : ""}`}
                >
                    <input
                        type="radio"
                        value="NO"
                        checked={statusValue === "NO"}
                        onChange={handleRadioChange}
                    />
                    Resolved
                </label>
            </div>

            <AppTable
                progressSales={isPending}
                columns={columns}
                data={momData}
                pagination
            />

            <Modal isOpen={isModalOpen} toggle={handleCloseModal}>
                <ModalHeader toggle={handleCloseModal}>Confirm Move</ModalHeader>
                <ModalBody>
                    Are you sure you want to move this to resolved?
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        style={{ backgroundColor: defaultTheme.primary }}
                        onClick={handleMoveConfirm}
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
