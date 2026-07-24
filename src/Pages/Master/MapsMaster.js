import { useState, useRef, useEffect } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet, usePost } from "../../Hooks/useApi";
import { CREATE_MAPS_MASTER, GET_ALL_MAPS_MASTER } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import { imageBaseUrl } from "../../helpers/api_helper";
import ImageModal from "../../components/Common/ImageModal";
import { FaFilePdf } from "react-icons/fa";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";

export default function MapsMaster() {
    const fileInputRef = useRef(null); // Create a ref for the file input
    const initialFormState = {
        file: null,
        place: "",
    };
    const { userId, empCode, userName } = useUserStore((state) => state.user);
    const [formState, setFormState] = useState(initialFormState);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState("");
    const [accessGranted, setAccessGranted] = useState(null);

    const { data: mapsList, refetch: getAllData, isLoading } = useGet(GET_ALL_MAPS_MASTER, { enabled: !!accessGranted });
    const toggleModal = () => setModalOpen(!modalOpen);

    const { isPending: addLoading, mutate } = usePost(
        CREATE_MAPS_MASTER,
        {
            onSuccess: (response) => {
                if (response?.data.status === 1) {
                    handleClear();
                    getAllData();
                    toast.success(response.data.message);
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormState((prevState) => ({
            ...prevState,
            file: file,
        }));
    };

    const handlePlaceChange = (e) => {
        const remarks = e.target.value;
        setFormState((prevState) => ({
            ...prevState,
            place: remarks,
        }));
    };

    const handleClear = () => {
        setFormState(initialFormState);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the file input
        }
    };

    const handleSave = (e) => {
        e.preventDefault()
        if (!formState.file) {
            toast.error("Please Select Map File")
        }
        else if (!formState.place) {
            toast.error('Please Enter Place')
        }
        else {
            const formData = new FormData();
            formData.append("createdBy", userName + ' (' + empCode + ')');
            formData.append("place", formState.place);
            formData.append("file", formState.file);
            mutate(formData);
        }
    };

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

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "10%",
            cell: (_, index) => <WordWrapCell>{index + 1}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Place Name</span>,
            sortable: true,
            selector: (row) => row.place,
            cell: (row) => <WordWrapCell>{row.place || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">File</span>,
            selector: (row) => (
                <div>
                    <FaFilePdf
                        size={20}
                        onClick={() => handleViewFile(row.attachment)}
                        style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                    />
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Created By</span>,
            sortable: true,
            selector: (row) => row.createdBy,
            cell: (row) => <WordWrapCell>{row.createdBy || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Created At</span>,
            sortable: true,
            selector: (row) => row.createdDate,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate) || '-'}</WordWrapCell>
        },
    ];

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'maps-master');
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
            <Breadcrumbs title="Master" breadcrumbItem="Maps Master" />
            {(addLoading || isLoading) && <ScreenLoader />}
            <Container fluid={true}>
                <form onSubmit={handleSave}>
                    <Card>
                        <CardBody>
                            <Row className="g-3">
                                <Col md="4">
                                    <h6 className="font-size-12">Place <RequiredStar /></h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formState?.place || ""}
                                        onChange={handlePlaceChange}
                                        placeholder="Enter Place..."
                                    />
                                </Col>
                                <Col md="4">
                                    <h6 className="font-size-12">Map <RequiredStar /></h6>
                                    <input
                                        type="file"
                                        className="form-control"
                                        ref={fileInputRef}
                                        accept=".pdf, image/*"
                                        onChange={handleFileChange}
                                    />
                                </Col>
                                <Col md="4" className="d-flex align-items-end">
                                    <button
                                        className="btn btn-primary"
                                        type="submit"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="btn btn-secondary ms-2"
                                        type="button"
                                        onClick={handleClear}
                                    >
                                        Cancel
                                    </button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </form>

                <ImageModal
                    isOpen={modalOpen}
                    toggle={toggleModal}
                    imageSrc={currentImage}
                />

                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={mapsList?.data?.data || []}
                    pagination
                />
            </Container>
        </PageContent>
    );
}