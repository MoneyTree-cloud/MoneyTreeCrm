import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody, CardTitle, CardText } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { formatDate, formatDateForInput } from "../../helpers/function_helper";
import { GET_KYC_REPORT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import { FaClipboardList, FaThumbsUp, FaHourglassHalf, FaUserClock, FaUsersCog, FaMoneyCheckAlt, FaUserTimes, FaUserCheck } from 'react-icons/fa';
import ApiClient from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function KycReport() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [kycData, setKycData] = useState('');
    const [isPending, setIsPending] = useState(false);

    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'kyc-report');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                getCurrentMonthDates();
            }
        };
        checkAccess();
    }, [userId]);

    const getCurrentMonthDates = () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setFromDate(formatDateForInput(firstDay));
        setToDate(formatDateForInput(lastDay));
    };

    const getKycDetails = () => {
        setIsPending(true);
        ApiClient.get(`${GET_KYC_REPORT}${fromDate}&toDate=${toDate}`)
            .then(response => {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    setKycData(response.data.data);
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(error => {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    const handleShowButton = (e) => {
        e.preventDefault();
        if (!fromDate) {
            toast.error("Please Enter Start Date");
        } else if (!toDate) {
            toast.error("Please Enter End Date");
        } else {
            getKycDetails();
        }
    };

    const handleClear = () => {
        getCurrentMonthDates();
        setKycData('');
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="KYC" />
            {isPending && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowButton}>
                            <Row>
                                <Col md="3">
                                    <h6 className="font-size-12">From Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-12">To Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="3" className="d-flex align-items-end gap-2">
                                    <Button
                                        color="primary"
                                        type="submit"
                                    >
                                        Show
                                    </Button>
                                    <Button
                                        color="secondary"
                                        type="button"
                                        onClick={handleClear}
                                    >
                                        Clear
                                    </Button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                {(Object.keys(kycData).length > 0) && (
                    <>
                        <h6 style={{ fontWeight: 'bold' }}>Booking Details ({formatDate(fromDate) + ' - ' + formatDate(toDate)})</h6>

                        <Row className="mt-4">
                            <Col md="4" sm="12">
                                <Card>
                                    <CardBody className="text-center">
                                        <FaClipboardList size={30} color="#007bff" />
                                        <CardTitle className="mt-3">Total Booking Count</CardTitle>
                                        <CardText>{kycData?.totalBookingCount || 0}</CardText>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col md="4" sm="12">
                                <Card>
                                    <CardBody className="text-center">
                                        <FaThumbsUp size={30} color="#28a745" />
                                        <CardTitle className="mt-3">Ready To Dispatch</CardTitle>
                                        <CardText>{kycData?.totalABBCount || 0}</CardText>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col md="4" sm="12">
                                <Card>
                                    <CardBody className="text-center">
                                        <FaHourglassHalf size={30} color="#ffc107" />
                                        <CardTitle className="mt-3">Pending For Builder</CardTitle>
                                        <CardText>{kycData?.totalBookingCount - kycData?.totalABBCount || 0}</CardText>
                                    </CardBody>
                                </Card>
                            </Col>

                        </Row>

                        <h6 style={{ fontWeight: 'bold' }}>KYC Details ({formatDate(fromDate) + ' - ' + formatDate(toDate)})</h6>
                        <Row className="mt-3">
                            <Col md="3" sm="12">
                                <Card>
                                    <CardBody className="text-center">
                                        <FaUserClock size={30} color="#fd7e14" />
                                        <CardTitle className="mt-3">Backoffice Pending</CardTitle>
                                        <CardText>{kycData?.backOfficePendingCount || 0}</CardText>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col md="3" sm="12">
                                <Card>
                                    <CardBody className="text-center">
                                        <FaUsersCog size={30} color="#17a2b8" />
                                        <CardTitle className="mt-3">Ops Pending</CardTitle>
                                        <CardText>{kycData?.opsPendingCount || 0}</CardText>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col md="3" sm="12">
                                <Card>
                                    <CardBody className="text-center">
                                        <FaMoneyCheckAlt size={30} color="#6f42c1" />
                                        <CardTitle className="mt-3">Finance Pending</CardTitle>
                                        <CardText>{kycData?.financePendingCount || 0}</CardText>
                                    </CardBody>
                                </Card>
                            </Col>

                            <Col md="3" sm="12">
                                <Card>
                                    <CardBody className="text-center">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <FaUserCheck size={28} color="#28a745" />
                                                <CardTitle className="mt-3">Completed</CardTitle>
                                                <CardText>{kycData?.completedKycCount || 0}</CardText>
                                            </div>
                                            <div>
                                                <FaUserTimes size={28} color="#dc3545" />
                                                <CardTitle className="mt-3">Pending</CardTitle>
                                                <CardText>{kycData?.kycPendingCount || 0}</CardText>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}


            </Container>
        </PageContent>
    );
}
