import { useEffect, useRef, useState } from "react";
import { Row, Col, Card, CardBody, Button, Container } from "reactstrap";
import { defaultTheme } from "../../helpers/defaultTheme";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import Select from "react-select";
import { useGet, usePost } from "../../Hooks/useApi";
import { ALL_HR_DROPDOWN, GET_ALL_CV_FILE, UPLOAD_CV_FILE, } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { hrImageBaseUrl } from "../../helpers/api_helper";
import { formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { FaFilePdf } from "react-icons/fa";

const UploadCVScreen = () => {
    const fileInputRef = useRef(null);
    const { data: hrList } = useGet(ALL_HR_DROPDOWN + '?status=YES');
    const { userId, empCode } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(true);

    const [formData, setFormData] = useState({
        files: null,
        selectHr: null, // Manage category within formData
    });

    // Handle change in form fields
    const handleChange = (e) => {
        const filesCount = e.target.files;

        if (filesCount.length > 10) {
            toast.error("You can upload a maximum of 10 Resume files.");
            e.target.value = null; // reset input
            return;
        }
        const { name, value, files } = e.target;
        if (name === "files") {
            const filesArray = Array.from(files);
            setFormData((prev) => ({
                ...prev,
                [name]: filesArray, // Store all selected files
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleHRChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            selectHr: selectedOption,
        }));
    }

    const { data: imagesData, isLoading: isLoadingImages, refetch: getAllImages, } = useGet(`${GET_ALL_CV_FILE}?offset=0&limit=10000&userId=${userId}`, { enabled: !!accessGranted });

    const { isPending: isPendingAdd, mutate: mutateAdd } = usePost(
        UPLOAD_CV_FILE,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    getAllImages();
                    handleReset();
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "8%",
        },
        {
            name: <span className="font-weight-bold fs-13">Assigned Date & Time</span>,
            selector: (row) => row?.assignedDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row?.assignedDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Assigned By</span>,
            selector: (row) => row.assignedByName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.assignedByName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Assigned To</span>,
            selector: (row) => row.assignedToName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.assignedToName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">File</span>,
            sortable: false,
            cell: (row) => <FaFilePdf
                size={20}
                onClick={() => handleViewFile(row?.resumePath)}
                style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
            />
        },
    ];

    const handleViewFile = (fileName) => {
        window.open(hrImageBaseUrl + fileName, "_blank");
    };

    const handleSave = () => {
        if (!formData.selectHr) {
            toast.error("Please Select HR to Assign");
        } else if (!formData.files) {
            toast.error("Please Choose File To Upload");
        } else {
            const formDataApi = new FormData();
            formDataApi.append("hrCode", formData?.selectHr?.value);
            formDataApi.append("assignedBy", empCode);
            for (let i = 0; i < formData.files.length; i++) {
                formDataApi.append("resume", formData.files[i], formData.files[i].name);
            }
            mutateAdd(formDataApi);
        }
    };

    const handleReset = () => {
        setFormData({
            files: null,
            selectHr: null,
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the file input
        }
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'upload-social-media-cv');
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
            <Container fluid={true}>
                {(isLoadingImages || isPendingAdd) && <ScreenLoader />}

                <Breadcrumbs title="Upload CV" breadcrumbItem="Social Media Data" />
                <Card>
                    <CardBody>
                        <Row>
                            <Col lg="4">
                                <h6 className="font-size-11 mt-1">Select HR <RequiredStar /></h6>
                                <Select
                                    style={{ zIndex: 9999 }}
                                    menuPortalTarget={document.body}
                                    options={hrList?.data?.data || []}
                                    onChange={handleHRChange}
                                    value={formData.selectHr}
                                    isClearable
                                />
                            </Col>
                            <Col md="4">
                                <h6 className="font-size-11 mt-1">Resumes <RequiredStar /></h6>
                                <input
                                    name="files"
                                    type="file"
                                    className="form-control"
                                    accept="*/*"
                                    multiple
                                    onChange={handleChange}
                                    ref={fileInputRef}
                                />

                            </Col>

                            <Col md="4 mt-4">
                                <div className="d-flex align-items-center">
                                    <Button
                                        onClick={handleSave}
                                        type="submit"
                                        color="primary"
                                        className="me-2"
                                    >
                                        Submit
                                    </Button>{" "}
                                    <Button
                                        type="reset"
                                        color="secondary"
                                        onClick={handleReset}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                <h3
                    style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: defaultTheme.redColor,
                    }}
                >
                    Note: A minimum of 1 and a maximum of 10 resumes can be uploaded.
                </h3>

                {imagesData?.data?.data?.content?.length > 0 && (
                    <AppTable
                        columns={columns}
                        data={
                            Array.isArray(imagesData?.data?.data?.content)
                                ? imagesData?.data?.data?.content
                                : []
                        }
                        pagination
                        paginationServer
                        paginationTotalRows={imagesData?.data?.data?.totalElements}
                    />
                )}
            </Container>
        </PageContent>
    );
};

export default UploadCVScreen;
