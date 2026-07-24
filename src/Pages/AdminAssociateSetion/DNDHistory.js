import { useCallback, useEffect, useState } from "react";
import { Container } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import "../CSS/styles.css";
import { toast } from "react-toastify";
import { GET_ALL_DND, UPDATE_DND } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import AppTable from "../../components/Common/Table";
import { FaCheck, FaFilePdf, FaTimes } from "react-icons/fa";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import { formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import { MdMobileFriendly } from "react-icons/md";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import ImageModal from "../../components/Common/ImageModal";

export default function DNDHistory() {
    const { empCode, userName, userId } = useUserStore((state) => state.user);
    const [dndType, setDndType] = useState("pending");
    const [dndData, setDndData] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [accessGranted, setAccessGranted] = useState(null);
    const [currentImage, setCurrentImage] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const toggleModal = () => setModalOpen(!modalOpen);
    const [isPending, setIsPending] = useState(false)

    const getAllDndList = useCallback(() => {
        setIsLoading(true)
        ApiClient.post(`${GET_ALL_DND}status=${dndType}`)
            .then((response) => {
                setIsLoading(false)
                if (response?.data?.status === 1) {
                    decryptData(response.data.data).then((decrypted) => {
                        setDndData(decrypted);
                    }).catch((error) => {
                        setDndData([]);
                    });
                } else if (response.data.message === 'No record found') {
                    setDndData([])
                }
                else {
                    toast.error(response.data.message || "Failed to fetch DND data");
                }
            })
            .catch((error) => {
                setIsLoading(false)
                toast.error(error.message || "An error occurred");
            });
    }, [dndType]);

    useEffect(() => {
        if (accessGranted) {
            getAllDndList()
        }
    }, [dndType, accessGranted, getAllDndList])

    const handleStatusChange = (rowData, rowStatus) => {
        if (!window.confirm("Are you sure you want change the status?")) return
        setIsPending(true)
        ApiClient.post(
            `${UPDATE_DND}id=${rowData?.id}&status=${rowStatus}&associateId=${empCode}&associateName=${userName}`,
        )
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    getAllDndList()
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    const handleViewFile = (fileName) => {
        // const fileName = fileList?.data?.data?.fileName;
        const fileExtension = fileName?.split(".").pop().toLowerCase();
        const fileUrl = imageBaseUrl + fileName;

        if (fileExtension === "pdf") {
            // Open PDF in a new window
            window.open(fileUrl, "_blank");
        }
        else if ((fileExtension === "heic" || fileExtension === 'msg')) {
            // Trigger download for HEIC files
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = fileName; // Specify the filename for the download
            document.body.appendChild(link); // Append the link to the DOM
            link.click(); // Simulate a click to start the download
            document.body.removeChild(link); // Clean up by removing the link
        }
        else {
            // Set the image source and open modal for images
            setCurrentImage(fileUrl);
            toggleModal();
        }
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, i) => i + 1,
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            selector: (row) => row.associateId,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.associateName + " (" + row.associateId + ")"}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Request Date</span>,
            selector: (row) => row.requestDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.requestDate)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Mobile No.</span>,
            selector: (row) => row.dndClientNumber,
            cell: (row) => (
                <div className="phone-container">
                    <MdMobileFriendly
                        className="phone-icon"
                        color={defaultTheme.goldColorLogo}
                    />
                    <span className="phone-number">{row.dndClientNumber}</span>
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row.dndClientName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.dndClientName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Remarks</span>,
            selector: (row) => row.remarks,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.remarks}</WordWrapCell>
        },
        ...(dndType === "accept"
            ? [
                {
                    name: <span className="font-weight-bold fs-13">Attachment</span>,
                    sortable: true,
                    cell: (row) => (
                        row.attachment ?
                            <FaFilePdf
                                size={20}
                                onClick={() => handleViewFile(row.attachment)}
                                style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                            />
                            : '-'
                    ),
                },
            ]
            : []),
        ...(dndType === "pending"
            ? [
                {
                    name: "Action",
                    cell: (row) => (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <FaCheck
                                title="Approve"
                                style={{
                                    cursor: "pointer",
                                    color: "green",
                                    marginRight: "10px",
                                }}
                                size={18}
                                onClick={() => handleStatusChange(row, 'accept')}
                            />
                            <FaTimes
                                title="Reject"
                                style={{
                                    cursor: "pointer",
                                    color: "red",
                                    marginLeft: "10px",
                                }}
                                size={18}
                                onClick={() => handleStatusChange(row, 'reject')}
                            />
                        </div>
                    ),
                },
            ]
            : []),
        ...(dndType !== "pending"
            ? [
                {
                    name: <span className="font-weight-bold fs-13">Updated By</span>,
                    selector: (row) => row.approvedByName,
                    sortable: true,
                    cell: (row) => <WordWrapCell> {row.approvedByName + " (" + row.approvedBy + ")"}</WordWrapCell>
                },
                {
                    name: <span className="font-weight-bold fs-13">Updated Date</span>,
                    selector: (row) => row.approvedDate,
                    sortable: true,
                    cell: (row) => <WordWrapCell>{formatDateTime(row.approvedDate)}</WordWrapCell>
                },

            ]
            : [])
    ];

    const handleRadioChange = (event) => {
        setDndType(event.target.value);
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'dnd-history');
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
            <Breadcrumbs title="DND" breadcrumbItem="History" />
            {(isLoading || isPending) && <ScreenLoader />}
            <Container>
                <div className="radio-button-container">
                    <label
                        className={`radio-label ${dndType === "pending" ? "active" : ""}`}
                    >
                        <input
                            type="radio"
                            value="pending"
                            checked={dndType === "pending"}
                            onChange={handleRadioChange}
                        />
                        Pending
                    </label>
                    <label
                        className={`radio-label ${dndType === "accept" ? "active" : ""}`}
                    >
                        <input
                            type="radio"
                            value="accept"
                            checked={dndType === "accept"}
                            onChange={handleRadioChange}
                        />
                        Approved
                    </label>
                    <label
                        className={`radio-label ${dndType === "reject" ? "active" : ""}`}
                    >
                        <input
                            type="radio"
                            value="reject"
                            checked={dndType === "reject"}
                            onChange={handleRadioChange}
                        />
                        Rejected
                    </label>
                </div>

                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={dndData}
                    pagination

                />
            </Container>

            <ImageModal
                isOpen={modalOpen}
                toggle={toggleModal}
                imageSrc={currentImage}
            />
        </PageContent>
    );
}
