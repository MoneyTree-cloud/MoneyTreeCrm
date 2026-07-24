import { useEffect, useRef, useState } from "react";
import { Row, Col, Card, CardBody, Button, Container, Form, Input } from "reactstrap";
import { usePost } from "../../Hooks/useApi";
import { SEND_WHATSAPP_MESSAGES } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import { toast } from "react-toastify";
import { RequiredStar } from "../../helpers/function_helper";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

const WhatsAppMessages = () => {
    const [accessGranted, setAccessGranted] = useState(null);
    const fileInputRef = useRef(null);
    const userId = useUserStore((state) => state.user.userId);
    const [templateName, setTemplateName] = useState("");
    const [filePath, setFilePath] = useState("");
    const [file, setFile] = useState("");

    // Reset values after form submission
    const resetValues = () => {
        setTemplateName("");
        setFilePath("")
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);
    };

    // API call to create a group
    const { isPending: addLoading, mutate } = usePost(`${SEND_WHATSAPP_MESSAGES}`, {
        onSuccess: (response) => {
            if (response?.data?.status === 1) {
                resetValues();
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        },
        onError: (err) => {
            resetValues();
            toast.error(err.message);
        },
    });

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!templateName) {
            toast.error("Please Enter Template Name");
        } else if (!filePath) {
            toast.error("Please Enter File Path");
        }
        else if (!file) {
            toast.error("Please Select Excel Sheet");
        } else {
            const formData = new FormData();
            formData.append("templateName", templateName);
            formData.append("filePath", filePath);
            formData.append("file", file);
            mutate(formData);
        }
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'whatsapp-messages');
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
                <Breadcrumbs title="Update" breadcrumbItem="WhatsApp Messages" />
                {(addLoading) && <ScreenLoader />}
                <Card>
                    <CardBody>
                        <Form className="needs-validation" onSubmit={handleSubmit}>
                            <Row>
                                <Col md="3">
                                    <h6 className="font-size-11">Template Name <RequiredStar /></h6>
                                    <Input
                                        name="templateName"
                                        placeholder="Type here..."
                                        type="text"
                                        className="form-control"
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">File Path <RequiredStar /></h6>
                                    <Input
                                        name="filePath"
                                        placeholder="Type here..."
                                        type="text"
                                        className="form-control"
                                        value={filePath}
                                        onChange={(e) => setFilePath(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Excel Sheet <RequiredStar /></h6>
                                    <input
                                        type="file"
                                        className="form-control"
                                        ref={fileInputRef}
                                        accept=".xlsx"
                                        onChange={handleFileChange}
                                    />
                                </Col>

                                <Col md="3" className="d-flex align-items-end">
                                    <Button
                                        type="submit"
                                        color="primary"
                                        className="me-2"
                                    >
                                        Submit
                                    </Button>{" "}
                                    <Button
                                        type="reset"
                                        color="secondary"
                                        onClick={resetValues}
                                    >
                                        Cancel
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </CardBody>
                </Card>
            </Container>
        </PageContent>
    );
};

export default WhatsAppMessages;
