import { useEffect, useState } from "react";
import { Container, Modal, ModalBody, ModalHeader } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { GET_ALL_LAUNCH_PROJECT } from "../../helpers/url_helper";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { useUserStore } from "../../store/useUserStore";
import PermissionMissing from "../Utility/PermissonMissing";
import { formatDate, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import { imageBaseUrl } from "../../helpers/api_helper";
import { getFileIcon } from "../../constants/global";
import { FaEye } from "react-icons/fa";

export default function ProjectLaunchScreen() {
    const userId = useUserStore((state) => state.user.userId);
    const [accessGranted, setAccessGranted] = useState(null);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [selectedAttachments, setSelectedAttachments] = useState([]);

    const toggleAttachmentModal = () => {
        setIsAttachmentModalOpen(!isAttachmentModalOpen);
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'project-launch-screen');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const { data: projectList, isLoading } = useGet(GET_ALL_LAUNCH_PROJECT, { enabled: !!accessGranted });

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "6%",
            cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Builder</span>,
            sortable: true,
            selector: (row) => row.builderName,
            cell: (row) => <WordWrapCell>{row.builderName || '-'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Project</span>,
            sortable: true,
            selector: (row) => row.projectName,
            cell: (row) => <WordWrapCell>{row.projectName || '-'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Starting Price</span>,
            sortable: true,
            selector: (row) => row.startingPrice,
            cell: (row) => <WordWrapCell>{row.startingPrice || '-'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Type</span>,
            selector: (row) => row.projectType,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.projectType || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">City</span>,
            selector: (row) => row.projectCity,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.projectCity || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Configurations</span>,
            selector: (row) => row.configurations,
            sortable: true,
            width: '10%',
            cell: (row) => <WordWrapCell>{row.configurations || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">RERA Registration Number</span>,
            selector: (row) => row.reraRegisteredNumber,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.reraRegisteredNumber || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">RERA Registration Date</span>,
            selector: (row) => row.reraRegistrationDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.reraRegistrationDate) || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Possession Month</span>,
            selector: (row) => row.possessionMonth,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.possessionMonth || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Possession Year</span>,
            selector: (row) => row.possessionYear,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.possessionYear || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">MT Launch Date</span>,
            selector: (row) => row.dateOfLaunch,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.dateOfLaunch) || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Docs</span>,
            width: '9%',
            cell: (row) => {
                const files = row?.attachments || [];

                return files?.length > 0 ? (
                    <button
                        onClick={() => {
                            setSelectedAttachments(files);
                            setIsAttachmentModalOpen(true);
                        }}
                        style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            backgroundColor: "#f5f5f5",
                            color: defaultTheme.goldColorLogo,
                            border: `1px solid ${defaultTheme.goldColorLogo}`,
                            cursor: "pointer",
                        }}
                    >
                        <FaEye /> ({files?.length})
                    </button>
                ) : (
                    <span style={{ color: "#999" }}>-</span>
                );
            },
        },
        {
            name: <span className="font-weight-bold fs-13">Created At</span>,
            selector: (row) => row.createdAt,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdAt) || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Created By</span>,
            selector: (row) => row.createdByName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.createdByName || '-'}</WordWrapCell>
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
            {(isLoading) && <ScreenLoader />}
            <Breadcrumbs title="List" breadcrumbItem="Project Launch" />
            <Container fluid={true}>

                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={
                        Array.isArray(projectList?.data?.data)
                            ? projectList?.data?.data
                            : []
                    }
                    pagination
                />

                <Modal isOpen={isAttachmentModalOpen} toggle={toggleAttachmentModal} size="lg">
                    <ModalHeader toggle={toggleAttachmentModal}>
                        Attachments
                    </ModalHeader>

                    <ModalBody>
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Type</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedAttachments?.map((file, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{getFileIcon(file)}</td>
                                            <td>
                                                <a
                                                    href={`${imageBaseUrl}${file}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    View
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ModalBody>
                </Modal>
            </Container>
        </PageContent>
    );
}
