import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import { toast } from "react-toastify";
import { CALL_FOR_BOOKING, GET_ALL_SALE_DETAILS, GET_SALE_DETAILS, RECORDING_BOOKING, SAVE_SALE_DETAILS } from "../../helpers/url_helper";
import ApiClient from "../../helpers/api_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PageContent from "../../components/Common/PageContent";
import { FaHeadphones } from "react-icons/fa";
import AppTable from "../../components/Common/Table";
import { useUserStore } from "../../store/useUserStore";
import { IoCall } from "react-icons/io5";
import { useGet } from "../../Hooks/useApi";
import { formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function MTRSCalling() {
    const { userId, empCode, mobileNo } = useUserStore((state) => state.user);
    const [mtrsId, setMtrsId] = useState('')
    const [isPending, setIsPending] = useState(false);
    const [mtrsData, setMtrsData] = useState('')
    const [recordingModalOpen, setRecordingModalOpen] = useState(false);
    const [recordingData, setRecordingData] = useState([]);
    const [accessGranted, setAccessGranted] = useState(null);
    const [mtrsAllData, setmtrsAllData] = useState([])
    const { data, isLoading: isLoadingData, refetch: getAllMtrsData } = useGet(GET_ALL_SALE_DETAILS, { enabled: !!accessGranted });

    useEffect(() => {
        if (data?.data?.status === 1) {
            decryptData(data?.data?.data).then((decryptedData) => {
                if (decryptedData) {
                    setmtrsAllData(decryptedData);
                } else {
                    setmtrsAllData([])
                }
            });
        }
    }, [data]);

    const handleShowData = (e) => {
        e.preventDefault();
        if (!mtrsId) {
            toast.error('Please Enter Unique ID')
            return;
        }
        else {
            setIsPending(true)
            ApiClient.get(`${GET_SALE_DETAILS}${mtrsId}`).then(function (response) {
                setIsPending(false);
                if (response.data.status === 1) {
                    decryptData(response?.data?.data).then((decryptedData) => {
                        if (decryptedData) {
                            setMtrsData(decryptedData);
                        } else {
                            setMtrsData('')
                        }
                    });
                }
                else {
                    toast.error(response.data.message)
                }

            })
                .catch(function (error) {
                    setIsPending(false);
                    toast.error(error.message);
                });
        }
    }

    const handleSaveData = () => {
        if (!mtrsData) {
            toast.error('Please Enter Unique ID')
            return;
        }
        else {
            setIsPending(true)
            ApiClient.post(`${SAVE_SALE_DETAILS}`, mtrsData)
                .then(function (response) {
                    setIsPending(false);
                    if (response.data.status === 1) {
                        setMtrsData('')
                        getAllMtrsData()
                        setMtrsId('')
                        toast.success(response.data.message)
                    }
                    else {
                        toast.error(response.data.message)
                    }

                })
                .catch(function (error) {
                    setIsPending(false);
                    toast.error(error.message);
                });
        }
    }

    const handleClear = () => {
        setMtrsId('')
        setMtrsData('')
    }

    const handleCall = (rowData) => {
        setIsPending(true);
        ApiClient.post(`${CALL_FOR_BOOKING}${userId}&caller=${rowData?.clientPhone1}&agent=${mobileNo}&saleId=${rowData?.saleId}`)
            .then(function (response) {
                setIsPending(false);
                if (response.data.status === 1) {
                    toast.success(response.data.message)
                }
                else {
                    toast.error(response.data.message)
                }

            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });

    }

    const handleShowRecording = (rowData) => {
        setIsPending(true);
        ApiClient.get(`${RECORDING_BOOKING}saleId=${rowData.saleId}&agentNumber=${mobileNo}&callerNumber=${rowData.clientPhone1}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    setRecordingModalOpen(true);
                    setRecordingData(response.data.data);
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "5%",
        },
        {
            name: <span className="font-weight-bold fs-13">Unique ID</span>,
            selector: (row) => row.saleId,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.saleId}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row.clientName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Builder Team</span>,
            selector: (row) => row.builderName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Project Name</span>,
            selector: (row) => row.projectName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Unit No</span>,
            selector: (row) => row.unitNo,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.unitNo}</WordWrapCell>
        },
        ...(empCode !== "1237"
            ? [
                {
                    name: <span className="font-weight-bold fs-13">Call</span>,
                    selector: (row) => (
                        <div>
                            <IoCall
                                size={20}
                                onClick={() => handleCall(row)}
                                style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                            />
                        </div>

                    ),
                },
            ]
            : []),
        {
            name: <span className="font-weight-bold fs-13">Recording</span>,
            selector: (row) => (
                row.hasCallLog &&
                <div>
                    <FaHeadphones
                        size={20}
                        onClick={() => handleShowRecording(row)}
                        style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                    />
                </div>

            ),
        },
    ];

    const recordingColumns = [
        {
            name: <span className="font-weight-bold fs-13">Dur (In Sec.)</span>,
            selector: (row) => row.totalCallDuration,
            sortable: true,
            width: "10%",
            cell: (row) => <WordWrapCell>{row.totalCallDuration}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Date & Time</span>,
            selector: (row) => formatDateTime(row.createdDate),
            sortable: true,
            width: "22%",
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Recording</span>,
            selector: (row) => (
                <div>
                    <audio controls>
                        <source src={row.callRecordingUrl} type="audio/mp3" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            ),
        },
    ];

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'mtrs-calling');
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
            <Breadcrumbs title="Details" breadcrumbItem="MTRS Details" />
            {(isPending || isLoadingData) && <ScreenLoader />}
            <Container fluid={true}>
                {empCode !== '1237' &&
                    <form onSubmit={handleShowData}>
                        <Card>
                            <CardBody>
                                <Row>
                                    <Col md="6 mt-1">
                                        <h6 className="font-size-11">Unique ID</h6>
                                        <input
                                            id="mtrsId"
                                            className="form-control"
                                            type="text"
                                            value={mtrsId}
                                            placeholder="Enter Unique ID..."
                                            onChange={(e) => setMtrsId(e.target.value)}
                                        />
                                    </Col>


                                    <Col lg="6">
                                        <div className="d-flex align-items-center mt-4">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                onClick={handleShowData}
                                            >
                                                Verify
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary ms-3"
                                                onClick={handleClear}
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </Col>
                                </Row>

                                {mtrsData &&
                                    <div>
                                        <hr className="dashed-divider" />

                                        <Row className='mt-3'>
                                            <Col md="3">
                                                <p>
                                                    <strong>Name:</strong> {mtrsData?.clientName || "N/A"}
                                                </p>
                                            </Col>
                                            <Col md="3">
                                                <p>
                                                    <strong>Builder:</strong> {mtrsData?.builderName || "N/A"}
                                                </p>
                                            </Col>
                                            <Col md="3">
                                                <p>
                                                    <strong>Project:</strong> {mtrsData?.projectName || "N/A"}
                                                </p>
                                            </Col>
                                            <Col md="3">
                                                <p>
                                                    <strong>Unit No:</strong> {mtrsData?.unitNo || "N/A"}
                                                </p>
                                            </Col>
                                        </Row>
                                        <hr className="dashed-divider" />

                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                onClick={handleSaveData}
                                            >
                                                Save
                                            </button>
                                        </div>

                                    </div>
                                }

                            </CardBody>
                        </Card>
                    </form>
                }

                <AppTable
                    progressPending={isPending}
                    columns={columns}
                    data={mtrsAllData || []}
                    pagination
                />

                <Modal
                    isOpen={recordingModalOpen}
                    toggle={() => setRecordingModalOpen(!recordingModalOpen)}
                    style={{ width: "100%", maxWidth: "100%" }}>
                    <ModalHeader toggle={() => setRecordingModalOpen(!recordingModalOpen)}>
                        Call Recording
                    </ModalHeader>
                    <ModalBody>
                        <AppTable
                            progressSales={isPending}
                            columns={recordingColumns}
                            data={recordingData}
                            pagination
                        />
                    </ModalBody>
                </Modal>
            </Container>
        </PageContent>
    );
}
