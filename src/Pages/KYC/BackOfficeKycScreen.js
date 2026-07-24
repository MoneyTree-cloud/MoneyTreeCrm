/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { GET_BO_BOOKING, UPDATE_BO_BOOKING } from "../../helpers/url_helper";
import { calculateAgingDayWise, formatDateForInput, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import ApiClient from "../../helpers/api_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useUserStore } from "../../store/useUserStore";
import PageContent from "../../components/Common/PageContent";
import { FaCheck } from "react-icons/fa";
import { usePost } from "../../Hooks/useApi";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function BackOfficeKycScreen() {
    const userId = useUserStore((state) => state.user.userId);
    const location = useLocation();
    const { formState_, taskType_ } = location.state || {};
    // Initial form state
    const initialFormState = {
        fromDate: "",
        toDate: "",
    };

    const LIMIT = 100;
    const [flag, setFlag] = useState(false);
    const [page, setPage] = useState(1);
    const [isPending, setIsPending] = useState(false);
    const [bookingData, setBookingData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formState, setFormState] = useState(initialFormState);
    const [taskType, setTaskType] = useState("Pending");
    const [saleId, setSaleId] = useState('')
    const [accessGranted, setAccessGranted] = useState(null);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormState((prevState) => ({
            ...prevState,
            [id]: value,
        }));
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'back-office-kyc');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                getBOBooking();
            }
        };
        checkAccess();
    }, [userId]);

    const getBOBooking = (value) => {
        if (!formState_) {
            const now = new Date();
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const fromDate = '2025-02-01'

            setFormState((prevState) => ({
                ...prevState,
                fromDate: fromDate,
                toDate: formatDateForInput(end),
            }));
            getBookingDetails(
                `${GET_BO_BOOKING}${fromDate}&toDate=${formatDateForInput(end)}&offset=${page - 1
                }&limit=${LIMIT}&loginId=${userId}&approvedStatus=${value ? value : taskType === "Pending" ? "NO" : "YES"
                }`
            );
        } else {
            setFormState({
                fromDate: formState_?.fromDate,
                toDate: formState_?.toDate,
            });
            setTaskType(value ? value === 'YES' ? 'Completed' : 'Pending' : taskType_);
            getBookingDetails(
                `${GET_BO_BOOKING}${formState_?.fromDate}&toDate=${formState_?.toDate
                }&offset=${page - 1}&limit=${LIMIT}&loginId=${userId}&approvedStatus=${value ? value : taskType_ === "Pending" ? "NO" : "YES"
                }`
            );
        }
    };

    const handleShowData = (e) => {
        e.preventDefault();
        setPage(1);
        getBookingDetails(
            `${GET_BO_BOOKING}${formState.fromDate}&toDate=${formState.toDate
            }&offset=${page - 1}&limit=${LIMIT}&loginId=${userId}&approvedStatus=${taskType === "Pending" ? "NO" : "YES"
            }`
        );
    };

    const handlePaginationData = () => {
        getBookingDetails(
            `${GET_BO_BOOKING}${formState.fromDate}&toDate=${formState.toDate
            }&offset=${page - 1}&limit=${LIMIT}&loginId=${userId}&approvedStatus=${taskType === "Pending" ? "NO" : "YES"
            }`
        );
    };

    useEffect(() => {
        if (flag) {
            handlePaginationData();
        }
    }, [page]);

    const getBookingDetails = (url) => {
        setIsPending(true);
        ApiClient.get(url)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    const encryptedContent = response.data.data;
                    decryptData(encryptedContent).then((decrypted) => {
                        setBookingData(decrypted);
                    }).catch((error) => {
                        setBookingData([]);
                    });
                } else {
                    if (response.data.message === "No record found.") {
                        setBookingData([]);
                    }
                    else {
                        toast.error(response.data.message);
                    }
                }
            })
            .catch(function (error) {
                setIsPending(false);
                setBookingData([]);
                toast.error(error.message);
            });
    };

    const handleCloseModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleApprove = (saleId) => {
        setSaleId(saleId)
        setIsModalOpen(true)
    }

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "5%",
        },
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            selector: (row) => row.saleId,
            width: "6%",
            sortable: true,
            cell: (row) => (
                <FaCheck
                    style={{
                        cursor: "pointer",
                        color: defaultTheme.primary,
                    }}
                    size={20}
                    onClick={() => handleApprove(row.saleId)}
                />
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Booking Date & Time</span>,
            selector: (row) => row.bookingDate,
            width: "13%",
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.bookingDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Pending From</span>,
            selector: (row) => row.bookingDate,
            sortable: true,
            width: '10%',
            cell: (row) =>
                <div className="phone-container">
                    <WordWrapCell>{calculateAgingDayWise(row.opsRejectDate, new Date())}
                        <span className="phone-number">{formatDateTime(row.opsRejectDate)}</span>
                    </WordWrapCell>
                </div>
        },
        {
            name: <span className="font-weight-bold fs-13">Unique ID</span>,
            selector: (row) => row.saleId,
            width: "8%",
            sortable: true,
            cell: (row) => <WordWrapCell>{row.saleId}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Unit No</span>,
            selector: (row) => row.unitNo,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.unitNo}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            selector: (row) => row.associateName,
            sortable: true,
            width: '18%',
            cell: (row) => <WordWrapCell>{row.associateName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Client Team</span>,
            selector: (row) => row.clientName,
            sortable: true,
            width: '18%',
            cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Builder Team</span>,
            selector: (row) => row.builderName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Project Name</span>,
            selector: (row) => row.projectName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Interior Amt.</span>,
            selector: (row) => row.interiorAmount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.interiorAmount}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Special Discount</span>,
            selector: (row) => row.specialDiscount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.specialDiscount}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Final Cost</span>,
            selector: (row) => row.finalCost,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.finalCost}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Reject Date & Time</span>,
            selector: (row) => row.opsRejectDate,
            sortable: true,
            width: '14%',
            cell: (row) => <WordWrapCell>{formatDateTime(row.opsRejectDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Reject Remarks</span>,
            selector: (row) => row.opsRejectRemarks,
            sortable: true,
            width: '30%',
            cell: (row) => <WordWrapCell>{row.opsRejectRemarks}</WordWrapCell>,
        },
    ];

    const { isPending: updateLoading, mutate: mutateUpdate } = usePost(
        `${UPDATE_BO_BOOKING}${saleId}&loginId=${userId}&status=YES`,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    getBOBooking();
                    setIsModalOpen(false)
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="KYC" breadcrumbItem="Back-Office-KYC" />
            {(isPending || updateLoading) && <ScreenLoader />}
            <Container fluid={true}>
                <form onSubmit={handleShowData}>
                    <Card>
                        <CardBody>
                            <Row>
                                <Col md="4 mt-1">
                                    <h6 className="font-size-11">From Date</h6>
                                    <input
                                        id="fromDate"
                                        className="form-control"
                                        type="date"
                                        value={formState.fromDate}
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col md="4 mt-1">
                                    <h6 className="font-size-11">To Date</h6>
                                    <input
                                        id="toDate"
                                        className="form-control"
                                        type="date"
                                        value={formState.toDate}
                                        onChange={handleChange}
                                    />
                                </Col>

                                <Col lg="4">
                                    <div className="d-flex align-items-center mt-4">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            onClick={handleShowData}
                                        >
                                            Show Data
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary ms-3"
                                            onClick={getBOBooking}
                                            color="secondary"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </form>

                <AppTable
                    progressPending={isPending}
                    columns={columns}
                    data={bookingData?.content}
                    pagination
                    paginationTotalRows={bookingData?.totalElements}
                    paginationServer
                    onChangePage={(newPage) => {
                        setPage(newPage);
                        setFlag(true);
                    }}

                    conditionalRowStyles={[
                        {
                            when: (row) => row.rejectRemark,
                            style: {
                                color: defaultTheme.redColor,
                            },
                        }]}
                />
            </Container>

            <Modal isOpen={isModalOpen} toggle={handleCloseModal}>
                <ModalHeader toggle={handleCloseModal}>
                    Confirm Approve
                </ModalHeader>
                <ModalBody>Are you sure you want to approve?</ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        style={{ backgroundColor: defaultTheme.primary }}
                        onClick={() => mutateUpdate()}
                    >
                        Yes
                    </Button>
                    <Button
                        color="primary"
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
