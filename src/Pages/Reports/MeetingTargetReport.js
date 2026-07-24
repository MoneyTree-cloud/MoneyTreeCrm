import { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDate, WordWrapCell } from "../../helpers/function_helper";
import { GET_ALL_MEETING_TARGET } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css";
import { useNavigate } from "react-router-dom";
import PageContent from "../../components/Common/PageContent";
import PermissionMissing from "../Utility/PermissonMissing";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { decryptData } from "../../components/Common/CryptoUtils";
import DOMPurify from "dompurify";

export default function MeetingTargetReport() {
    const navigation = useNavigate();

    const [modalOpen, setModalOpen] = useState(false);
    const [targetDataTeamWise, setTargetDataTeamWise] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [targetData, setTargetData] = useState([]);
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);
    const { data, isLoading } = useGet(GET_ALL_MEETING_TARGET, { enabled: !!accessGranted });

    useEffect(() => {
        if (data?.data?.status === 1) {

            decryptData(data?.data?.data).then((decryptedData) => {
                if (decryptedData) {
                    setTargetData(decryptedData);
                } else {
                    setTargetData([])
                }
            });
        }
    }, [data]);


    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'meeting-target-report');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const handleManageUpdate = (row) => {
        navigation("/meeting-target-report/meeting-target-entry", {
            state: { rowData: row },
        });
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">Manage</span>,
            width: '8%',
            cell: (row) => (
                <i
                    className="ri-pencil-fill align-bottom me-2"
                    onClick={() => handleManageUpdate(row)}
                    title="Manage"
                    style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                ></i>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">From Date</span>,
            selector: (row) => row.fromDate,
            sortable: true,
            cell: (row) =><WordWrapCell>{formatDate(row.fromDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">To Date</span>,
            selector: (row) => row.toDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.toDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Event</span>,
            selector: (row) => row.eventName,
            sortable: true,
            cell: (row) =><WordWrapCell>{row.eventName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Description</span>,
            selector: (row) => row.remarks,
            sortable: true,
            width: "45%",
            cell: (row, index) => {
                const isExpanded = expandedRows[index] || false; // Check if the current row is expanded

                const sanitizedDescription = row.remarks
                    ? row.remarks.replace(/(\r\n|\n|\r)/g, "<br /><br />")
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
        },
        {
            name: <span className="font-weight-bold fs-13">View Team Wise Data</span>,
            selector: (row) => (
                <div>
                    <i
                        className="fas fa-eye"
                        title="View Team Wise Data"
                        style={{ cursor: "pointer", color: defaultTheme.primary }}
                        onClick={() => {
                            setTargetDataTeamWise(row.teams);
                            setModalOpen(true);
                        }}
                    ></i>
                </div>
            ),
            sortable: true,
        },
    ];

    // Calculate totals
    const target = targetDataTeamWise.reduce(
        (total, row) => total + (row.target),
        0
    );

    const targetAchieved = targetDataTeamWise.reduce(
        (total, row) => total + (row.targetAchieved),
        0
    );


    // Create the total row
    const totalRow = {
        mainTeam: "Total",
        target: `${target}`,
        targetAchieved: targetAchieved
    };

    const dataWithTotal = [...targetDataTeamWise, totalRow];

    const columnsDataTeamWise = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (row, index) => index + 1,
            sortable: true,
            width: "10%",
            cell: (row, index) => {
                if (row.mainTeam === "Total") {
                    return null;
                }
                return (
                    <div
                        style={{
                            fontWeight: row.mainTeam === "Total" ? "bold" : "normal",
                            color: row.mainTeam === "Total" ? "blue" : "black",
                        }}
                    >
                        {index + 1}
                    </div>
                );
            },
        },
        {
            name: <span className="font-weight-bold fs-13">Main Team</span>,
            selector: (row) => row.mainTeam,
            sortable: true,
            cell: (row) => (
                <div
                    style={{
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                        fontWeight: row.mainTeam === "Total" ? "bold" : "normal", // Bold for Total row
                        color: row.mainTeam === "Total" ? defaultTheme.goldColorLogo : "black", // Change color for Total row
                    }}
                >
                    {row.mainTeam}
                </div>
            ),
        },

        {
            name: <span className="font-weight-bold fs-13">Participants</span>,
            selector: (row) => row.target,
            sortable: true,
            cell: (row) => (
                <div
                    style={{
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                        fontWeight: row.mainTeam === "Total" ? "bold" : "normal", // Bold for Total row
                        color: row.mainTeam === "Total" ? defaultTheme.goldColorLogo : "black", // Change color for Total row
                    }}
                >
                    {row.target}
                </div>
            ),
        },

        {
            name: <span className="font-weight-bold fs-13">Participated</span>,
            selector: (row) => row.targetAchieved,
            sortable: true,
            cell: (row) => (
                <div
                    style={{
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                        fontWeight: row.mainTeam === "Total" ? "bold" : "normal", // Bold for Total row
                        color: row.mainTeam === "Total" ? defaultTheme.goldColorLogo : "black", // Change color for Total row
                    }}
                >
                    {row.targetAchieved}
                </div>
            ),
        },
    ];

    const handleManageTargetEntry = () => {
        navigation("/meeting-target-report/meeting-target-entry", {
            state: { rowData: {} },
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
            <Breadcrumbs title="Report" breadcrumbItem="Event Participants Target" />
            {isLoading && <ScreenLoader />}
            <i
                className="fas fa-plus"
                style={{
                    color: defaultTheme.primary,
                    cursor: "pointer",
                    fontSize: "16px",
                    marginBottom: '10px'
                }}
                title="Add Event Target"
                onClick={handleManageTargetEntry}
            ></i>
            <AppTable
                progressSales={isLoading}
                columns={columns}
                data={
                    Array.isArray(targetData)
                        ? targetData
                        : []
                }
                pagination
            />

            <Modal
                isOpen={modalOpen}
                toggle={() => setModalOpen(!modalOpen)}
                style={{
                    width: "100%",
                    maxWidth: "100%",
                }}
            >
                <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
                    Team Wise Participants
                </ModalHeader>
                <ModalBody>
                    <AppTable
                        progressSales={isLoading}
                        columns={columnsDataTeamWise}
                        data={dataWithTotal}
                        pagination
                    />
                </ModalBody>
            </Modal>
        </PageContent>

    );
}