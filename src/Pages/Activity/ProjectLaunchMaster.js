import { useEffect, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { ADD_LAUNCH_PROJECT, GET_ALL_LAUNCH_PROJECT, UPDATE_LAUNCH_PROJECT } from "../../helpers/url_helper";
import Select from "react-select";
import PageContent from "../../components/Common/PageContent";
import { FaChevronDown, FaChevronUp, FaEdit, FaEye } from "react-icons/fa";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { useUserStore } from "../../store/useUserStore";
import PermissionMissing from "../Utility/PermissonMissing";
import { formatDate, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { getFileIcon, monthOptions, scrollToTop, yearOptions } from "../../constants/global";
import { defaultTheme } from "../../helpers/defaultTheme";
import { imageBaseUrl } from "../../helpers/api_helper";

export default function ProjectLaunchMaster() {
    const initialFormData = {
        builderName: "",
        projectName: "",
        startingPrice: "",
        type: null,
        city: "",
        configurations: "",
        reraRegistrationNumber: "",
        reraRegistrationDate: "",
        possesionMonth: null,
        possesionYear: null,
        projectDocs: [],
        launchDate: ""
    };
    const [formData, setFormData] = useState(initialFormData);
    const userId = useUserStore((state) => state.user.userId);
    const [accessGranted, setAccessGranted] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const fileInputRef = useRef(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [selectedAttachments, setSelectedAttachments] = useState([]);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'project-launch-master');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const { data: projectList, refetch: getAllData, isLoading } = useGet(GET_ALL_LAUNCH_PROJECT, { enabled: !!accessGranted });

    const handleEdit = (rowData) => {
        setShowForm(true);
        setIsEditMode(true);
        setEditId(rowData.id);
        scrollToTop()
        setFormData({
            builderName: rowData.builderName || "",
            projectName: rowData.projectName || "",
            startingPrice: rowData.startingPrice || "",
            type: rowData.projectType
                ? { value: rowData.projectType, label: rowData.projectType }
                : null,
            city: rowData.projectCity || "",
            configurations: rowData.configurations || "",
            reraRegistrationNumber: rowData.reraRegisteredNumber || "",
            reraRegistrationDate: rowData.reraRegistrationDate?.split(" ")[0] || "",
            possesionMonth: rowData.possessionMonth
                ? { value: rowData.possessionMonth, label: rowData.possessionMonth }
                : null,
            possesionYear: rowData.possessionYear
                ? { value: rowData.possessionYear, label: rowData.possessionYear }
                : null,
            projectDocs: [],
            launchDate: rowData.dateOfLaunch?.split(" ")[0] || ""
        });
    };

    const toggleAttachmentModal = () => {
        setIsAttachmentModalOpen(!isAttachmentModalOpen);
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "6%",
            cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Manage</span>,
            cell: (row) => (
                <FaEdit
                    style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                    onClick={() => handleEdit(row)}
                    title="Manage Project"
                    size={20}
                />
            ),
            width: '8%',
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
                const files = row.attachments || [];

                return files.length > 0 ? (
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
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdAt) || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Created By</span>,
            selector: (row) => row.createdByName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.createdByName || '-'}</WordWrapCell>
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleButtonClick = (e) => {
        e.preventDefault();
        const payload = new FormData();
        if (isEditMode) {
            payload.append("id", editId);
        }
        payload.append("userId", userId);
        payload.append("builderName", formData.builderName);
        payload.append("projectName", formData.projectName);
        payload.append("startingPrice", formData.startingPrice);
        payload.append("projectCity", formData.city);
        payload.append("configurations", formData.configurations);
        payload.append("reraRegisteredNumber", formData.reraRegistrationNumber);
        if (formData.reraRegistrationDate) {
            payload.append("reraRegistrationDate", formData.reraRegistrationDate);
        }
        if (formData?.type?.value) {
            payload.append("projectType", formData?.type?.value);
        }
        if (formData?.possesionMonth?.label) {
            payload.append("possesionMonth", formData?.possesionMonth?.label);
        }
        if (formData?.possesionYear?.value) {
            payload.append("possessionYear", formData?.possesionYear?.value);
        }
        if (formData.launchDate) {
            payload.append("dateOfLaunch", formData.launchDate);
        }
        if (formData.projectDocs?.length > 0) {
            formData.projectDocs.forEach((file) => {
                payload.append("attachments", file);
            });
        }

        if (isEditMode) {
            updateLaunchProject(payload);
        } else {
            addLaunchProject(payload);
        }
    };

    const { isPending: addLoading, mutate: addLaunchProject } = usePost(ADD_LAUNCH_PROJECT, {
        onSuccess: (response) => {
            if (response?.data.status === 1) {
                toast.success(response.data.message);
                handleCancel()
            } else {
                toast.error(response.data.message);
            }
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    const { isPending: updateLoading, mutate: updateLaunchProject } = usePost(UPDATE_LAUNCH_PROJECT, {
        onSuccess: (response) => {
            if (response?.data.status === 1) {
                toast.success(response.data.message);
                handleCancel();
            } else {
                toast.error(response.data.message);
            }
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    const handleCancel = () => {
        getAllData();
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
        setFormData({
            ...initialFormData,
            projectDocs: [],
        });
        setShowForm(false);
        setIsEditMode(false);
        setEditId(null);
    };

    const typeOptions = [
        { value: 'Residental', label: 'Residental' },
        { value: 'Commercial', label: 'Commercial' },
        { value: 'Plot', label: 'Plot' },
        { value: 'Other', label: 'Other' }
    ]

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);

        setFormData((prev) => ({
            ...prev,
            projectDocs: [...prev.projectDocs, ...newFiles],
        }));

        e.target.value = null;
    };

    const removeFile = (index) => {
        setFormData((prev) => ({
            ...prev,
            projectDocs: prev.projectDocs.filter((_, i) => i !== index),
        }));
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            {(isLoading || addLoading || updateLoading) && <ScreenLoader />}
            <Breadcrumbs title="Master" breadcrumbItem="Project Launch" />
            <Container fluid={true}>
                <div>
                    <button
                        type="button"
                        className="btn btn-secondary mb-3"
                        onClick={() => setShowForm(prev => !prev)}
                        style={{ fontSize: '13px' }}
                    >
                        {showForm ? (
                            <span style={{ fontWeight: 'bold' }}><FaChevronUp /> Hide Form</span>
                        ) : (
                            <span style={{ fontWeight: 'bold' }}><FaChevronDown /> Show Form</span>
                        )}
                    </button>
                </div>
                {showForm &&
                    <form onSubmit={handleButtonClick}>
                        <Card>
                            <CardBody>
                                <Row className="g-3">
                                    <Col lg="3">
                                        <h6 className="font-size-11">Builder Name</h6>
                                        <input
                                            className="form-control"
                                            placeholder="Enter Builder Name"
                                            name="builderName"
                                            value={formData.builderName}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <Col lg="3">
                                        <h6 className="font-size-11">Project Name</h6>
                                        <input
                                            className="form-control"
                                            placeholder="Enter Project Name"
                                            name="projectName"
                                            value={formData.projectName}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <Col lg="3">
                                        <h6 className="font-size-11">Starting Price (e.g., 2Cr onwards)</h6>
                                        <input
                                            className="form-control"
                                            placeholder="Enter Starting Price"
                                            name="startingPrice"
                                            value={formData.startingPrice}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <Col md="3">
                                        <h6 className="font-size-11">Type</h6>
                                        <Select
                                            style={{ zIndex: 9999 }}
                                            menuPortalTarget={document.body}
                                            value={formData.type}
                                            isClearable
                                            onChange={(selectedOption) =>
                                                setFormData((prevState) => ({
                                                    ...prevState,
                                                    type: selectedOption,
                                                }))
                                            }
                                            options={typeOptions}
                                        />
                                    </Col>
                                    <Col md="3">
                                        <h6 className="font-size-11">City</h6>
                                        <input
                                            name="city"
                                            className="form-control"
                                            type="text"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Enter City"
                                        />
                                    </Col>
                                    <Col lg="3">
                                        <h6 className="font-size-11">Configurations (e.g., 3BHK, 4BHK, etc.)</h6>
                                        <input
                                            className="form-control"
                                            placeholder="(e.g., 3BHK, 4BHK, etc.)"
                                            name="configurations"
                                            type="text"
                                            value={formData.configurations}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <Col lg="3">
                                        <h6 className="font-size-11">RERA Registration Number</h6>
                                        <input
                                            className="form-control"
                                            placeholder="Enter RERA Registration Number"
                                            name="reraRegistrationNumber"
                                            type="text"
                                            value={formData.reraRegistrationNumber}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <Col lg="3">
                                        <h6 className="font-size-11">RERA Registration Date</h6>
                                        <input
                                            className="form-control"
                                            placeholder="Enter RERA Registration Date"
                                            name="reraRegistrationDate"
                                            type="date"
                                            value={formData.reraRegistrationDate}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <Col lg="3">
                                        <h6 className="font-size-11">Possession Month</h6>
                                        <Select
                                            style={{ zIndex: 9999 }}
                                            menuPortalTarget={document.body}
                                            value={formData.possesionMonth}
                                            isClearable
                                            onChange={(selectedOption) =>
                                                setFormData((prevState) => ({
                                                    ...prevState,
                                                    possesionMonth: selectedOption,
                                                }))
                                            }
                                            options={monthOptions}
                                        />
                                    </Col>
                                    <Col lg="3">
                                        <h6 className="font-size-11">Possession Year</h6>
                                        <Select
                                            style={{ zIndex: 9999 }}
                                            menuPortalTarget={document.body}
                                            value={formData.possesionYear}
                                            isClearable
                                            onChange={(selectedOption) =>
                                                setFormData((prevState) => ({
                                                    ...prevState,
                                                    possesionYear: selectedOption,
                                                }))
                                            }
                                            options={yearOptions}
                                        />
                                    </Col>
                                    <Col lg="3">
                                        <h6 className="font-size-11">Project Docs</h6>
                                        {/* Hidden input */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            style={{ display: "none" }}
                                            onChange={handleFileChange}
                                        />

                                        {/* Main upload container */}
                                        <div
                                            style={{
                                                border: "1px dashed #0b0b0b",
                                                borderRadius: "12px",
                                                padding: "10px",
                                                background: "#fafafa",
                                                minHeight: "80px",
                                            }}
                                        >
                                            {/* Attach button */}
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current.click()}
                                                style={{
                                                    background: defaultTheme.primary,
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "20px",
                                                    padding: "6px 14px",
                                                    fontSize: "12px",
                                                    fontWeight: "500",
                                                    cursor: "pointer",
                                                    marginBottom: "8px",
                                                }}
                                            >
                                                + Attach Files {formData?.projectDocs?.length > 0 && `(${formData?.projectDocs?.length})`}
                                            </button>

                                            {/* File chips */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: "6px",
                                                    maxHeight: "70px",
                                                    overflowY: "auto",
                                                }}
                                            >
                                                {formData?.projectDocs?.map((file, index) => (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            background: "#ffffff",
                                                            border: "1px solid #e5e7eb",
                                                            borderRadius: "20px",
                                                            padding: "5px 10px",
                                                            fontSize: "12px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "6px",
                                                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                                        }}
                                                    >
                                                        {/* File icon */}
                                                        <span style={{ fontSize: "14px" }}>📄</span>

                                                        {/* File name */}
                                                        <span
                                                            style={{
                                                                maxWidth: "120px",
                                                                whiteSpace: "nowrap",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                            }}
                                                            title={file.name}
                                                        >
                                                            {file.name}
                                                        </span>

                                                        {/* Remove button */}
                                                        <span
                                                            style={{
                                                                cursor: "pointer",
                                                                color: "#dc3545",
                                                                fontWeight: "bold",
                                                                marginLeft: "4px",
                                                            }}
                                                            onClick={() => removeFile(index)}
                                                        >
                                                            ×
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Col>
                                    <Col lg="3">
                                        <h6 className="font-size-11">MT Launch Date</h6>
                                        <input
                                            className="form-control"
                                            name="launchDate"
                                            type="date"
                                            value={formData.launchDate}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <Col md="3" className="d-flex align-items-end">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                        >
                                            {isEditMode ? "Update" : "Save"}
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-secondary ms-2"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </button>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </form>
                }

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
