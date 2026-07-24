import { useEffect, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import { usePost } from "../../Hooks/useApi";
import { UPLOAD_SALE_MASTER_EXCEL } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css";
import PageContent from "../../components/Common/PageContent";
import { RequiredStar } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import PermissionMissing from "../Utility/PermissonMissing";
import CheckUserAccess from "../../components/Common/CheckUserAccess";

export default function UploadSaleMaster() {
    const [file, setFile] = useState(null);
    const { userId } = useUserStore((state) => state.user);
    const fileInputRef = useRef(null);
    const [accessGranted, setAccessGranted] = useState(null);

    const { isPending: uploadLoading, mutate: saleMasterUpload } = usePost(
        UPLOAD_SALE_MASTER_EXCEL,
        {
            onSuccess: (response) => {
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                setFile(null)
                if (response.data.status === 0) {
                    toast.error(response.data.message)
                }
                else {
                    toast.success(response.data.message)
                }

            },
            onError: (err) => {
                setFile(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                toast.error(err.message);
            },
        }
    );

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            const allowedExtensions = ['.xls', '.xlsx'];
            const fileName = file.name;
            const fileExtension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();

            if (allowedExtensions.includes(fileExtension)) {
                setFile(file);
            } else {
                // Show error message
                toast.error('Invalid file type. Please upload an Excel file (.xls or .xlsx).');
                event.target.value = '';
            }
        }
    };

    const handleUploadData = () => {
        if (!file) {
            toast.error("Please Select Sale Master File");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        saleMasterUpload(formData);
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'upload-sale-master');
            setAccessGranted(hasAccess);
        }
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
            <Breadcrumbs title="Upload" breadcrumbItem="Sale Master" />
            {(uploadLoading) && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <Row className="g-2">
                            <Col lg="4">
                                <h6 className=" font-size-12">Sale Master File <RequiredStar /></h6>
                                <input
                                    className="form-control"
                                    id="fileUpload"
                                    type="file"
                                    accept=".xls,.xlsx"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                />
                            </Col>

                            <Col
                                lg="4"
                                className="d-flex align-items-end"
                            >
                                <button
                                    type="button"
                                    className="btn btn-primary me-2"
                                    onClick={handleUploadData}
                                >
                                    Upload Data
                                </button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Container>
        </PageContent>
    );
}
