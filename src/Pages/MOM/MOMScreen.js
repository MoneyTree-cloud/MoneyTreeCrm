import { useEffect, useState } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { ALL_DEPARTMENT_DROPDOWN_ID, DELETE_MOM, GET_ALL_MOM } from "../../helpers/url_helper";
import { useGet, usePost } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css"; // Import your CSS file
import { useNavigate } from "react-router-dom";
import PageContent from "../../components/Common/PageContent";
import { formatDateTime, RequiredStar } from "../../helpers/function_helper";
import { Button, Card, CardBody, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import { toast } from "react-toastify";
import Select from "react-select";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import DOMPurify from "dompurify";

export default function MOMScreen() {
    const navigation = useNavigate();
    const [apiUrl, setApiUrl] = useState('')
    const [accessGranted, setAccessGranted] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const { data: departmentList } = useGet(ALL_DEPARTMENT_DROPDOWN_ID, { enabled: !!accessGranted });
    const userId = useUserStore((state) => state.user.userId);

    const [formData, setFormData] = useState({
        selectedDepartment: null,
    });

    const { data: momData, isLoading, refetch: getAllMom } = useGet(apiUrl, { enabled: Boolean(apiUrl) });


    useEffect(() => {
        if (accessGranted) {
            setApiUrl(GET_ALL_MOM)
        }
    }, [accessGranted])

    const handleDeleteClick = (id) => {
        setSelectedId(id);
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        // Add your delete logic here, using selectedId
        setIsModalOpen(false);
        mutateDelete();
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const { isPending: isPendingDelete, mutate: mutateDelete } = usePost(
        DELETE_MOM + selectedId,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    getAllMom();
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    const handleManageUpdate = (row) => {
        navigation("/mom-screen/mom-add-screen", {
            state: { rowData: row },
        });
    }

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (row, index) => index + 1,
            sortable: true,
            width: "5%",
        },
        {
            name: <span className="font-weight-bold fs-13">Manage</span>,
            sortable: true,
            width: '7%',
            cell: (row) => (
                <i
                    className="ri-pencil-fill align-bottom me-2"
                    onClick={() => handleManageUpdate(row)}
                    style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                ></i>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
            selector: (row) => row.createdDate,
            sortable: true,
            width: "15%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {formatDateTime(row.createdDate)}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Created By</span>,
            selector: (row) => row.employeeName,
            sortable: true,
            width: "10%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.employeeName}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Time</span>,
            selector: (row) => row.time,
            sortable: true,
            width: "8%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.time}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Department</span>,
            selector: (row) => row.departmentName,
            sortable: true,
            width: "10%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.departmentName}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Subject</span>,
            selector: (row) => row.subject,
            sortable: true,
            width: "20%",
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.subject}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Description</span>,
            selector: (row) => row.data,
            sortable: true,
            width: "57%",
            cell: (row, index) => {
                const isExpanded = expandedRows[index] || false; // Check if the current row is expanded

                const sanitizedDescription = row.data
                    ? row.data.replace(/(\r\n|\n|\r)/g, "<br /><br />")
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
        // {
        //     name: <span className="font-weight-bold fs-13">Action</span>,
        //     sortable: true,
        //     width: '7%',
        //     cell: (row) => (
        //         <MdDelete
        //             onClick={() => handleDeleteClick(row.id)}
        //             style={{ cursor: "pointer", color: "red" }}
        //             size={20} // Adjust size as needed
        //         />
        //     ),
        // },
    ];

    const handleManageTargetEntry = () => {
        navigation("/mom-screen/mom-add-screen", {
            state: { rowData: {} },
        });
    };

    const handleShowData = () => {
        if (!formData?.selectedDepartment) {
            toast.error('Please Select Department')
        }
        else {
            setApiUrl(`${GET_ALL_MOM}?departmentId=${formData?.selectedDepartment?.value}`)
        }
    }

    const handleClearData = () => {
        setFormData(prevFormData => ({
            ...prevFormData, // Preserve the existing values of formData
            selectedDepartment: null, // Nullify only the selectedDepartment field
        }));
        setApiUrl(GET_ALL_MOM)
    }

    const handleSelectChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            selectedDepartment: selectedOption,
        }));
    };


    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'mom-screen');
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
            <Breadcrumbs title="M.O.M." breadcrumbItem="Minutes Of Meetings" />
            {(isLoading || isPendingDelete) && <ScreenLoader />}
            <i
                className="fas fa-plus"
                style={{
                    color: defaultTheme.primary,
                    cursor: "pointer",
                    fontSize: "16px",
                    marginBottom: '10px'
                }}
                onClick={handleManageTargetEntry}
            ></i>
            <Card>
                <CardBody>
                    <Row>
                        <Col lg="6 mt-1">
                            <h6 className="font-size-11">
                                Select Department <RequiredStar />
                            </h6>
                            <Select
                                isClearable
                                style={{ zIndex: 9999 }}
                                menuPortalTarget={document.body}
                                value={formData.selectedDepartment}
                                onChange={handleSelectChange}
                                options={
                                    Array.isArray(departmentList?.data?.data)
                                        ? departmentList?.data?.data
                                        : []
                                }
                            />
                        </Col>
                        <Col lg="4 mt-4" className="text-center">
                            <div className="d-flex align-items-center">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleShowData}
                                >
                                    Show
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-secondary ms-3"
                                    onClick={handleClearData}
                                >
                                    Clear
                                </button>
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
            <AppTable
                progressSales={isLoading}
                columns={columns}
                data={
                    Array.isArray(momData?.data?.data)
                        ? momData?.data?.data
                        : []
                }
                pagination
            />

            <Modal isOpen={isModalOpen} toggle={handleCloseModal}>
                <ModalHeader toggle={handleCloseModal}>
                    Confirm Deletion
                </ModalHeader>
                <ModalBody>Are you sure you want to delete this?</ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        style={{ backgroundColor: defaultTheme.primary }}
                        onClick={handleDeleteConfirm}
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
