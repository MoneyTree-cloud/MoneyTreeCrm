import { useEffect, useState } from "react";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet } from "../../Hooks/useApi";
import { GET_ALL_MOU_MASTER } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { useUserStore } from "../../store/useUserStore";
import { formatDate, WordWrapCell } from "../../helpers/function_helper";
import { Container, Modal, ModalBody, ModalHeader } from "reactstrap";
import { imageBaseUrl } from "../../helpers/api_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import { getFileIcon } from "../../constants/global";
import { FaEye } from "react-icons/fa";
import DOMPurify from "dompurify";

export default function MOUScreen() {
    const { userId } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [selectedAttachments, setSelectedAttachments] = useState([]);

    const toggleAttachmentModal = () => {
        setIsAttachmentModalOpen(!isAttachmentModalOpen);
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'mou-screen');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const { data: mouList, isLoading } = useGet(`${GET_ALL_MOU_MASTER}`, { enabled: Boolean(accessGranted) });

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, i) => i + 1,
            width: '10%'
        },
        {
            name: <span className="font-weight-bold fs-13">Builder</span>,
            selector: (row) => row.builderName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Project</span>,
            selector: (row) => row.projectName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">MOU Start Date</span>,
            selector: (row) => row.agreementStartDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.agreementStartDate)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">MOU End Date</span>,
            selector: (row) => row.agreementEndDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.agreementEndDate)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Docs</span>,
            width: '9%',
            cell: (row) => {
                const files = row?.attachments || [];
                return files?.length > 0 ? (
                    <button
                        onClick={() => {
                            setSelectedAttachments(row);
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
                        <FaEye /> ({files.length})
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
            cell: (row) => <WordWrapCell>{formatDate(row.createdAt)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Created By</span>,
            selector: (row) => row.createdBy,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.createdBy}</WordWrapCell>
        },
    ];

    if (accessGranted === null) return <ScreenLoader />;
    if (!accessGranted) return <PermissionMissing />;

    return (
        <PageContent>
            {(isLoading) && <ScreenLoader />}
            <Breadcrumbs title="Screen" breadcrumbItem="MOU" />
            <Container fluid={true}>

                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={Array.isArray(mouList?.data?.data) ? mouList?.data?.data : []}
                    pagination
                />

                <Modal isOpen={isAttachmentModalOpen} toggle={toggleAttachmentModal} size="lg">
                    <ModalHeader toggle={toggleAttachmentModal}>
                        <div>
                            <strong>Remarks :</strong>
                            <div
                                style={{ fontSize: 13, fontWeight: "normal" }}
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                        selectedAttachments?.remarks?.replace(/\r?\n/g, "<br/>")
                                    ),
                                }}
                            />
                        </div>
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
                                    {selectedAttachments?.attachments?.map((file, index) => (
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
