/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { formatDateForInput, RequiredStar } from "../../helpers/function_helper";
import { CANCEL_LEAD_UPLOAD_FEEDBACK_STATUS, LEAD_UPLOAD_FEEDBACK } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import FeedbackModal from "./FeedbackModal";
import Select from "react-select";

export default function LeadUploadFeedback() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isPending, setIsPending] = useState(false)
    const [accessGranted, setAccessGranted] = useState(null);
    const { userId } = useUserStore((state) => state.user);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskId, setTaskId] = useState(null);
    const [uploadedBy, setUploadedBy] = useState(null)

    // Function to trigger the modal with a taskId
    const triggerModal = (taskId) => {
        setTaskId(taskId);
        setIsModalOpen(true);
    };

    // Function to close the modal
    const closeModal = () => {
        setIsPending(true)
        ApiClient.post(`${CANCEL_LEAD_UPLOAD_FEEDBACK_STATUS}${taskId}`)
            .then(function (response) {
                setIsPending(false);
                setIsModalOpen(false);
                setTaskId(null)
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'lead-upload-feedback');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                setTodayDate();
            }
        };
        checkAccess();
    }, [userId]);

    const getReportDetails = (fromDate, toDate) => {
        setIsPending(true)
        ApiClient.get(`${LEAD_UPLOAD_FEEDBACK}${uploadedBy?.value}&fromDate=${fromDate}&toDate=${toDate}`)
            .then(function (response) {
                setIsPending(false);
                if (response.status === 200) {
                    // Assuming the taskId is part of the response data
                    const taskId = response.data.taskId;

                    if (taskId) {
                        // Trigger the modal with the taskId to check its status
                        triggerModal(taskId);
                    } else {
                        toast.error("No Task ID found. Please try again later.");
                    }
                } else {
                    toast.error("Something Went Wrong, Please Try Again Later");
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    const setTodayDate = () => {
        const today = new Date(); // Get today's date
        // const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setFromDate(formatDateForInput(today));
        setToDate(formatDateForInput(today));
        setUploadedBy(null)
    };

    const handleShowButton = (e) => {
        e.preventDefault();

        if (!fromDate) {
            toast.error("Please Enter Start Date");
            return;
        }

        if (!toDate) {
            toast.error("Please Enter End Date");
            return;
        }

        // date diff validation (max 30 days)
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);

        const diffTime = endDate - startDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays < 0) {
            toast.error("End Date should be after Start Date");
            return;
        }

        if (diffDays > 30) {
            toast.error("Date range should not be more than 30 days");
            return;
        }

        if (!uploadedBy) {
            toast.error("Please Select Uploaded By");
            return;
        }

        getReportDetails(fromDate, toDate);
    };

    const uploadedByGroup = [
        { value: 100042, label: 'Admin' },
        { value: 1237, label: 'Anmol Bhatia' },
        { value: 100058, label: 'Deepanshu Kumar' },
        { value: 101322, label: 'MoneyTree' }
    ]

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Lead Feedback" />
            {isPending && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowButton}>
                            <Row className="g-3">
                                <Col md="3">
                                    <h6 className="font-size-12">From Date <RequiredStar /></h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        id="date-input-1"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-12">To Date <RequiredStar /></h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        id="date-input-2"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </Col>
                                < Col md="3">
                                    <h6 className="font-size-12">Uploaded By <RequiredStar /></h6>
                                    <Select
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        isClearable
                                        value={uploadedBy}
                                        onChange={setUploadedBy}
                                        options={uploadedByGroup}
                                    />
                                </Col>
                                {/* } */}
                                <Col md="3" className="d-flex align-items-end">
                                    <Button
                                        color="primary"
                                        type="submit"
                                        onClick={handleShowButton}
                                        className="me-2"
                                    >
                                        Generate Report
                                    </Button>
                                    <Button
                                        color="secondary"
                                        type="button"
                                        onClick={setTodayDate}
                                    >
                                        Clear
                                    </Button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                <FeedbackModal
                    show={isModalOpen}
                    taskId={taskId}
                    onClose={closeModal}
                />
            </Container>
        </PageContent >
    );
}