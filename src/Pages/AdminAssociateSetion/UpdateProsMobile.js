import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody, Modal, ModalHeader, ModalBody, Label, Input, ModalFooter } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { GET_MEETING_BY_NUMBER, GET_PROSPECT_BY_NUMBER, UPDATE_MEETING_BY_NUMBER, UPDATE_PROSPECT_BY_NUMBER } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css"; // Import your CSS file
import { toast } from "react-toastify";
import { RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";
import PermissionMissing from "../Utility/PermissonMissing";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { decryptData } from "../../components/Common/CryptoUtils";
import ApiClient from "../../helpers/api_helper";
import { FaEdit } from "react-icons/fa";
import { defaultTheme } from "../../helpers/defaultTheme";

export default function UpdateProsMobile() {
    const [mobile, setMobile] = useState("");
    const [reportType, setReportType] = useState("Prospects");
    const [prospectData, setProspectData] = useState([]);
    const [meetingData, setMeetingData] = useState([]);
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);
    const [isPending, setIsPending] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'update-pros-mobile');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const columnsPros = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "6%",
            cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Manage</span>,
            width: "10%",
            cell: (row) => <FaEdit
                style={{ cursor: "pointer", color: defaultTheme.btnEnable }}
                size={20}
                onClick={() => handleManage(row, "Prospects")}
                title="Manage"
            />,
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            selector: (row) => row.associateId,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.associateName + " (" + row.associateId + ")"}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row.clientName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Prospect ID</span>,
            selector: (row) => row.prospectId,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.prospectId}</WordWrapCell>,
        },
    ];

    const columnsMeet = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">Manage</span>,
            width: "10%",
            cell: (row) => <FaEdit
                style={{ cursor: "pointer", color: defaultTheme.btnEnable }}
                size={20}
                onClick={() => handleManage(row, "Meetings")}
                title="Manage"
            />,
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            selector: (row) => row.associateId,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.loginUserName + " (" + row.associateId + ")"}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row.clientName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Prospect ID</span>,
            selector: (row) => row.prospectId,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.prospectId}</WordWrapCell>,
        },
    ];

    const findProsDetails = () => {
        setIsPending(true);
        ApiClient.get(`${GET_PROSPECT_BY_NUMBER}${mobile}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    const encryptedContent = response.data.data;
                    decryptData(encryptedContent).then((decrypted) => {
                        setProspectData(decrypted || []);
                    }).catch((error) => {
                        setMeetingData([])
                    });
                    setProspectData(response.data.data);
                } else {
                    setProspectData([])
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                setProspectData([])
                toast.error(error.message);
            });
    }

    const findMeetDetails = () => {
        setIsPending(true);
        ApiClient.get(`${GET_MEETING_BY_NUMBER}${mobile}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    const encryptedContent = response.data.data;
                    decryptData(encryptedContent).then((decrypted) => {
                        setMeetingData(decrypted || []);
                    }).catch((error) => {
                        setMeetingData([])
                    });
                    setMeetingData(response.data.data);
                } else {
                    setMeetingData([])
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                setMeetingData([])
                toast.error(error.message);
            });
    }

    const handleManage = (row) => {
        setSelectedRow(row);
        setModalOpen(true);
    };

    const handleUpdate = () => {
        setIsPending(true);
        let url = "";
        if (reportType === "Prospects") {
            url = `${UPDATE_PROSPECT_BY_NUMBER}${selectedRow.id}&name=${selectedRow.clientName}&mobile=${selectedRow.phoneNo}`;
        }
        else {
            url = `${UPDATE_MEETING_BY_NUMBER}${selectedRow.meetingId}&name=${selectedRow.clientName}&mobile=${selectedRow.phoneNo}`;
        }
        ApiClient.post(url)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    setModalOpen(false);
                    if (reportType === "Prospects") {
                        findProsDetails();
                    } else {
                        findMeetDetails();
                    }
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    const handleShowButton = (e) => {
        e.preventDefault();
        if (!mobile) {
            toast.error("Please Enter Mobile Number");
        } else if (mobile.length < 10) {
            toast.error("Please Enter Valid Mobile Number");
        } else {
            if (reportType === "Prospects") {
                findProsDetails();
            } else if (reportType === "Meeting") {
                findMeetDetails();
            }
        }
    };

    const handleClear = () => {
        setMobile("");
        setReportType("Prospects");
        setProspectData([]);
        setMeetingData([]);
        setSelectedRow(null);
        setModalOpen(false);
    };

    const handleRadioChange = (event) => {
        setReportType(event.target.value);
        if (event.target.value === "Prospects") {
            setMeetingData([]);
        } else {
            setProspectData([]);
        }
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Update Associate" breadcrumbItem="Name & Mobile" />
            {(isPending) && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowButton}>
                            <Row>
                                <Col md="6">
                                    <h6 className="font-size-11"> Mobile Number <RequiredStar /></h6>
                                    <input
                                        className="form-control"
                                        type="text"
                                        maxLength={10}
                                        defaultValue=""
                                        placeholder="Enter Mobile Number..."
                                        id="date-input-1"
                                        value={mobile}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const numericValue = value.replace(/\D/g, ""); // \D matches any non-digit character
                                            setMobile(numericValue.slice(0, 10)); // Ensure length does not exceed 10
                                        }}
                                    />
                                </Col>

                                <Col md="4" className="d-flex align-items-end justify-content-center">
                                    <div className="radio-button-container mt-4 d-flex align-items-center justify-content-center">
                                        <label className={`radio-label ${reportType === "Prospects" ? "active" : ""}`}>
                                            <input
                                                type="radio"
                                                value="Prospects"
                                                checked={reportType === "Prospects"}
                                                onChange={handleRadioChange}
                                            />
                                            Prospects
                                        </label>

                                        <label className={`radio-label ${reportType === "Meeting" ? "active" : ""}`}>
                                            <input
                                                type="radio"
                                                value="Meeting"
                                                checked={reportType === "Meeting"}
                                                onChange={handleRadioChange}
                                            />
                                            Meetings
                                        </label>
                                    </div>
                                </Col>

                                <Col md="2" className="d-flex align-items-center">
                                    <Button
                                        color="primary"
                                        type="submit"
                                        onClick={handleShowButton}
                                        className="me-2"
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

                {(prospectData.length > 0 || meetingData.length > 0) && (
                    <AppTable
                        progressProspects={isPending}
                        columns={reportType === "Prospects" ? columnsPros : columnsMeet}
                        data={reportType === "Prospects" ? prospectData : meetingData}
                        paginationServer
                        pagination
                    />
                )}

                {/* Modal for Edit */}
                <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
                    <ModalHeader toggle={() => setModalOpen(false)}>Edit Details</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col md="6">
                                <Label for="mobile">Mobile Number</Label>
                                <Input
                                    type="text"
                                    id="mobile"
                                    value={selectedRow ? selectedRow.phoneNo : ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const numericValue = value.replace(/\D/g, "");
                                        setSelectedRow({ ...selectedRow, phoneNo: numericValue.slice(0, 10) })
                                    }}
                                    maxLength={10}
                                    placeholder="Enter Mobile Number"
                                />
                            </Col>
                            <Col md="6">
                                <Label for="clientName">Client Name</Label>
                                <Input
                                    type="text"
                                    id="clientName"
                                    value={selectedRow ? selectedRow.clientName : ""}
                                    onChange={(e) => setSelectedRow({ ...selectedRow, clientName: e.target.value })}
                                    placeholder="Enter Client Name"
                                />
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={handleUpdate} style={{ backgroundColor: defaultTheme.primary }}>
                            Update
                        </Button>
                        <Button color="secondary" onClick={() => setModalOpen(false)} style={{ backgroundColor: defaultTheme.goldColorLogo }}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            </Container>
        </PageContent>
    );
}
