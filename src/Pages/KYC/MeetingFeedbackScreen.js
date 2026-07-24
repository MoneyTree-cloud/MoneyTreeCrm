/* eslint-disable react-hooks/exhaustive-deps */
import PageContent from '../../components/Common/PageContent'
import Breadcrumbs from '../../components/Common/Breadcrumb'
import { Button, Card, CardBody, Col, Container, Row, Modal, ModalHeader, ModalBody } from 'reactstrap'
import { useEffect, useState } from 'react';
import AppTable from '../../components/Common/Table';
import { calculateOnlyAgingDayWise, formatDateForInput, formatDateTime, RequiredStar, WordWrapCell } from '../../helpers/function_helper';
import { useUserStore } from '../../store/useUserStore';
import ScreenLoader from '../../constants/ScreenLoader';
import PermissionMissing from '../Utility/PermissonMissing';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import ApiClient from '../../helpers/api_helper';
import { ALL_LOCATION_DROPDOWN, CALL_FOR_BOOKING, GET_ALL_MAIN_TEAM_DROPDOWN, GET_ALL_SUB_TEAM_DROPDOWN, MEETING_FEEDBACK_DATA, RECORDING_BOOKING, UPDATE_MEETING_FEEDBACK_DATA } from '../../helpers/url_helper';
import { toast } from 'react-toastify';
import { FaEye, FaHeadphones } from "react-icons/fa";
import Select from "react-select";
import { defaultTheme } from '../../helpers/defaultTheme';
import { useGet, usePost } from '../../Hooks/useApi';
import { IoCall } from 'react-icons/io5';

export default function MeetingFeedbackScreen() {

    const initialFormState = {
        fromDate: "",
        toDate: "",
        mainTeam: null,
        subTeam: null,
        branch: null,
    };

    const [formState, setFormState] = useState(initialFormState);
    const { userId, userName, empCode, mobileNo } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);
    const LIMIT = 100;
    const [page, setPage] = useState(1)
    const [isPending, setIsPending] = useState(false);
    const [data, setData] = useState([]);
    const [remarksStatus, setRemarksStatus] = useState('pending')
    const [recordingModalOpen, setRecordingModalOpen] = useState(false);
    const [recordingData, setRecordingData] = useState([]);
    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [rating, setRating] = useState(null);

    const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN + '?active=false');
    const { data: subTeams } = useGet(
        `${GET_ALL_SUB_TEAM_DROPDOWN}${formState?.mainTeam?.value}`,
        { enabled: Boolean(formState?.mainTeam) }
    );
    const { data: locationList } = useGet(ALL_LOCATION_DROPDOWN);

    const ratingOptions = [
        { value: 1, label: "1 ⭐" },
        { value: 2, label: "2 ⭐⭐" },
        { value: 3, label: "3 ⭐⭐⭐" },
        { value: 4, label: "4 ⭐⭐⭐⭐" },
        { value: 5, label: "5 ⭐⭐⭐⭐⭐" }
    ];

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'meeting-feedback');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                getInitData()
            }
        };
        checkAccess();
    }, [userId]);

    const getInitData = () => {
        const now = new Date();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const initialDate = formatDateForInput(yesterday);
        setFormState({
            fromDate: initialDate,
            toDate: initialDate,
            mainTeam: null,
            subTeam: null,
            branch: null,
        });
        setRemarksStatus('pending')
        handleShowData(null, initialDate, initialDate, remarksStatus);
    }

    const handleShowData = (event, fromDate, toDate, status, newPage) => {
        if (event) event.preventDefault();
        setIsPending(true);
        const isCompleted =
            status
                ? status !== "pending"
                : remarksStatus !== "pending";

        const params = new URLSearchParams({
            fromDateStr: fromDate || formState.fromDate,
            toDateStr: toDate || formState.toDate,
            offset: Number(newPage - 1) >= 0 ? Number(newPage - 1) : page - 1,
            limit: LIMIT,
            isCompleted
        });

        if (formState?.mainTeam?.value) params.append("mainTeam", formState.mainTeam.value);
        if (formState?.subTeam?.value) params.append("subTeam", formState.subTeam.value);
        if (formState?.branch?.value) params.append("branch", formState.branch.value);

        const url = `${MEETING_FEEDBACK_DATA}?${params.toString()}`;
        ApiClient.get(url)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    setData(response.data.data);
                } else {
                    setData([]);
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                setData([]);
                toast.error(error.message);
            });
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormState(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleFormChange = (field, value) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const openModal = (row) => {
        setSelectedRow(row);
        setRemarks("");
        setRating(null);
        setModalOpen(true);
    };

    const handleSave = () => {
        if (!remarks) {
            toast.error("Please enter remarks");
            return;
        }
        if (!rating) {
            toast.error("Please select rating");
            return;
        }
        setIsPending(true);
        ApiClient.post(`${UPDATE_MEETING_FEEDBACK_DATA}?meetingId=${selectedRow?.meeting_id}&kycRemarks=${remarks}&updatedBy=${userName + ' (' + empCode + ')'}&rating=${rating?.label}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    setModalOpen(false);
                    handleShowData();
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
            name: "SL No.",
            selector: (_, i) => i + 1,
            width: "6%"
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Name</span>,
            selector: (row) => row.name,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.name + ' (' + row.employee_code + ')'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">MT/ST</span>,
            selector: (row) => row.main_team,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.main_team + '/' + row.s_team}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Branch</span>,
            selector: (row) => row.location,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.location}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Project Name</span>,
            selector: (row) => row.project_name,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.project_name}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Prospect Created At</span>,
            selector: (row) => row.created_date,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.created_date)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Meeting Date</span>,
            selector: (row) => row.meeting_date,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.meeting_date)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Aging</span>,
            selector: (row) => row.meetingDate,
            cell: (row) => <WordWrapCell>{calculateOnlyAgingDayWise(row.created_date, row.meeting_date)}</WordWrapCell>
        },
        {
            name: "Action",
            cell: (row) => (
                <FaEye
                    color={defaultTheme.goldColorLogo}
                    style={{ cursor: "pointer", fontSize: "18px" }}
                    onClick={() => openModal(row)}
                />

            )
        },
        ...(remarksStatus === 'completed'
            ? [
                {
                    name: <span className="font-weight-bold fs-13">Rating</span>,
                    selector: (row) => row.rating,
                    cell: (row) => <WordWrapCell>{row.rating}</WordWrapCell>
                },
                {
                    name: <span className="font-weight-bold fs-13">Recording/File</span>,
                    selector: (row) => (
                        <FaHeadphones
                            size={20}
                            onClick={() => handleShowRecording(row)}
                            style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                        />
                    ),
                    sortable: true,
                    width: '12%',
                },
            ]
            : []),
    ];

    const handleShowRecording = (rowData) => {
        setIsPending(true);
        ApiClient.get(`${RECORDING_BOOKING}meetingId=${rowData.meeting_id}&agentNumber=${mobileNo}&callerNumber=${rowData.phone_no}`)
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

    // Handle radio button change
    const handleRadioChange = (event) => {
        setRemarksStatus(event.target.value);
        handleShowData(null, formState.fromDate, formState.toDate, event.target.value)
    };

    const handlePagination = (newPage) => {
        setPage(newPage);
        handleShowData(null, formState.fromDate, formState.toDate, remarksStatus, newPage)
    };

    const { isPending: pendingCall, mutate: mutateCall } = usePost(
        `${CALL_FOR_BOOKING}${userId}&caller=${selectedRow?.phone_no}&agent=${mobileNo}&meetingId=${selectedRow?.meeting_id}`,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
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

    if (accessGranted === null) return <ScreenLoader />;

    if (!accessGranted) return <PermissionMissing />;

    return (
        <PageContent>
            <Breadcrumbs title="Feedback" breadcrumbItem="Meeting Feedback" />
            {(isPending || pendingCall) && <ScreenLoader />}
            <Container fluid>
                <form onSubmit={handleShowData}>
                    <Card>
                        <CardBody>
                            <Row className="g-3">
                                <Col md="2">
                                    <h6 className="font-size-11">Meeting Start Date</h6>
                                    <input
                                        id="fromDate"
                                        type="date"
                                        className="form-control"
                                        value={formState.fromDate}
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Meeting End Date</h6>
                                    <input
                                        id="toDate"
                                        type="date"
                                        className="form-control"
                                        value={formState.toDate}
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Main Team</h6>
                                    <Select
                                        value={formState.mainTeam}
                                        onChange={(val) => handleFormChange("mainTeam", val)}
                                        options={mainTeams?.data?.data || []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Sub Team</h6>
                                    <Select
                                        value={formState.subTeam}
                                        onChange={(val) => handleFormChange("subTeam", val)}
                                        options={subTeams?.data?.data || []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        isDisabled={!formState.mainTeam}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Branch</h6>
                                    <Select
                                        value={formState.branch}
                                        onChange={(val) => handleFormChange("branch", val)}
                                        options={locationList?.data?.data || []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="2" className="d-flex align-items-end">
                                    <Button color="primary" type="submit">
                                        Show
                                    </Button>
                                    <Button
                                        color="secondary"
                                        className="ms-2"
                                        onClick={getInitData}
                                    >
                                        Clear
                                    </Button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </form>

                {/* Radio Buttons */}
                <div className="radio-button-container">
                    {["pending", "completed"].map((type) => (
                        <label
                            key={type}
                            className={`radio-label ${remarksStatus === type ? "active" : ""}`}
                        >
                            <input
                                type="radio"
                                value={type}
                                checked={remarksStatus === type}
                                onChange={handleRadioChange}
                            />
                            {type?.charAt(0)?.toUpperCase() + type.slice(1)}
                        </label>
                    ))}
                </div>

                <AppTable
                    progressPending={isPending}
                    columns={columns}
                    data={data?.content || []}
                    pagination
                    paginationTotalRows={data?.totalElements}
                    paginationServer
                    onChangePage={handlePagination}
                />


                {/* Modal */}
                <Modal size="lg" isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
                    <ModalHeader toggle={() => setModalOpen(false)}>
                        Meeting Details
                    </ModalHeader>
                    <ModalBody>
                        {selectedRow && (
                            <>
                                <Row className="g-2">
                                    <Col md="6">
                                        <b>Associate :</b> {selectedRow?.name + ' (' + selectedRow?.employee_code + ')'}
                                    </Col>
                                    <Col md="6">
                                        <b>Branch :</b> {selectedRow?.location}
                                    </Col>
                                    <Col md="6">
                                        <b>Client :</b> {selectedRow?.client_name}
                                    </Col>
                                    <Col md="6">
                                        <b>Project :</b> {selectedRow?.project_name}
                                    </Col>
                                    <Col md="6">
                                        <b>Meeting Location :</b> {selectedRow?.meeting_place_name}
                                    </Col>
                                    <Col md="6">
                                        <b>Prospect Created :</b> {formatDateTime(selectedRow?.created_date)}
                                    </Col>
                                    <Col md="6">
                                        <b>Meeting Date :</b> {formatDateTime(selectedRow?.meeting_date)}
                                    </Col>
                                    <Col md="6">
                                        <b>Aging :</b> {calculateOnlyAgingDayWise(selectedRow?.created_date, selectedRow?.meeting_date)}
                                    </Col>
                                    <Col md="12">
                                        <b>Meeting Remarks :</b> {selectedRow?.prospects_remarks}
                                    </Col>
                                    <Col md="12">
                                        <b>Feedback Remarks :</b> {selectedRow?.kyc_remarks}
                                    </Col>
                                    <Col md="6">
                                        <b>Feedback Submitted At :</b> {formatDateTime(selectedRow?.kyc_remark_updated_date)}
                                    </Col>
                                    <Col md="6">
                                        <b>Feedback Rating :</b> {selectedRow?.rating}
                                    </Col>
                                </Row>
                                {remarksStatus === 'pending' && (
                                    <div>
                                        <Row className="mb-3 mt-3">
                                            <Col md="12">
                                                <label>Remarks <RequiredStar /></label>
                                                <textarea
                                                    className="form-control"
                                                    rows="3"
                                                    value={remarks}
                                                    placeholder='Enter Remarks...'
                                                    onChange={(e) => setRemarks(e.target.value)}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className='d-flex align-items-end'>
                                            <Col md="6">
                                                <label>Rating <RequiredStar /></label>
                                                <Select
                                                    options={ratingOptions}
                                                    value={rating}
                                                    onChange={setRating}
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Button
                                                    type="submit"
                                                    color="info"
                                                    onClick={() => mutateCall()}
                                                >
                                                    <IoCall />
                                                </Button>
                                            </Col>
                                            <Col md="4">
                                                <Button color="primary" onClick={handleSave}>
                                                    Save
                                                </Button>
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                            </>
                        )}
                    </ModalBody>
                </Modal>

                <Modal
                    isOpen={recordingModalOpen}
                    toggle={() => setRecordingModalOpen(!recordingModalOpen)}
                    style={{
                        width: "100%",
                        maxWidth: "100%",
                    }}
                >
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
    )
}