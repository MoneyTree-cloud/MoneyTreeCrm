/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, CardBody, Col, Container, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { MdCall, MdEmail, MdMobileFriendly } from "react-icons/md";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import PageContent from "../../components/Common/PageContent";
import ScreenLoader from "../../constants/ScreenLoader";
import { useGet, usePost } from "../../Hooks/useApi";
import { useUserStore } from "../../store/useUserStore";
import ApiClient from "../../helpers/api_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import { formatDate, formatDateForInput, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import {
    GET_ALL_PROSPECTS_MASTER, GET_ALL_USERS_DROPDOWN, GET_MY_TEAM,
    GET_PROSPECT_DATA_BY_ASSOCIATE_ID_NEW, IVR_MAKE_CALL, MARK_PROSPECT_FAVOURITE, PROSPECT_BULK_UPDATE
} from "../../helpers/url_helper";
import { FaEdit, FaHeart, FaMapMarkerAlt, FaRegHeart } from "react-icons/fa";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import "../CSS/styles.css";
import { USER_TYPE } from "../../constants/global";

// ─── Constants ────────────────────────────────────────────────────────────────
const LIMIT = 100;

const SEARCH_BY_OPTIONS = [
    { label: "Address", value: "address" },
    { label: "Client Name", value: "clientName" },
    { label: "Mobile No", value: "phoneNo" },
    { label: "Project", value: "projectName" },
    { label: "Occupation", value: "occupation" },
];

const ORDER_BY_OPTIONS = [
    { label: "Due Date", value: "dueDate" },
    { label: "Prospect Date", value: "prosDate" },
];

// ─── Highlight row CSS (injected once) ────────────────────────────────────────
const HIGHLIGHT_STYLE_ID = "mt-prospect-highlight-style";
if (!document.getElementById(HIGHLIGHT_STYLE_ID)) {
    const style = document.createElement("style");
    style.id = HIGHLIGHT_STYLE_ID;
    style.textContent = `
        @keyframes mtRowPulse {
            0%   { background-color: rgba(201,168,76,0.0); }
            20%  { background-color: rgba(201,168,76,0.35); }
            50%  { background-color: rgba(201,168,76,0.22); }
            75%  { background-color: rgba(201,168,76,0.35); }
            100% { background-color: rgba(201,168,76,0.0); }
        }
        .mt-row-highlight {
            animation: mtRowPulse 2s ease-in-out !important;
        }
        .mt-row-highlight td,
        .mt-row-highlight > div {
            animation: mtRowPulse 10s ease-in-out !important;
        }
    `;
    document.head.appendChild(style);
}

// ─── Component ────────────────────────────────────────────────────────────────
const ProspectListMenu = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user: { userId, role, ivrCallStatus, empCode } } = useUserStore();

    // ── State ─────────────────────────────────────────────────────────────────
    const [accessGranted, setAccessGranted] = useState(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSearchType, setSelectedSearchType] = useState(null);
    const [selectedOrderBy, setSelectedOrderBy] = useState(null);
    const [associateType, setAssociateType] = useState(null);
    const [teamStatus, setTeamStatus] = useState("NO");
    const [favStatus, setFavStatus] = useState("NO");
    const [prosType, setProsType] = useState("MT");
    const [page, setPage] = useState(location.state?.page_ ?? 1);
    const [isPending, setIsPending] = useState(false);
    const [prosData, setProsData] = useState([]);
    const [shouldFetch, setShouldFetch] = useState(false);
    const [meetingType, setMeetingType] = useState(null);
    const [purposeType, setPurposeType] = useState(null);
    const [budget, setBudget] = useState(null);
    const [modalDueData, setModalDueData] = useState("");
    const [dueDatemodalOpen, setDueDateModalOpen] = useState(false);
    const [structuredOutput, setStructuredOutput] = useState({});

    // ── FIX 2: Track last managed row index for scroll-back + highlight ───────
    const [highlightRowId, setHighlightRowId] = useState(null);
    const highlightTimerRef = useRef(null);
    const tableContainerRef = useRef(null);

    // ── Master data ───────────────────────────────────────────────────────────
    const { data, isLoading } = useGet(GET_ALL_PROSPECTS_MASTER, { enabled: !!accessGranted });

    useEffect(() => {
        if (data?.data?.status_code === 1) {
            const output = {};
            data.data.object.forEach(({ masterTypeDesc, meetingType, id }) => {
                if (!output[masterTypeDesc]) output[masterTypeDesc] = [];
                output[masterTypeDesc].push({ label: meetingType, value: id.toString() });
            });
            setStructuredOutput(output);
        }
    }, [data]);

    // ── Associate list ────────────────────────────────────────────────────────
    const { data: associateList } = useGet(
        role === USER_TYPE.ASSOCIATE ? `${GET_MY_TEAM}${userId}` : GET_ALL_USERS_DROPDOWN,
        { enabled: !!accessGranted }
    );

    // ── Restore state from location (back navigation) ─────────────────────────
    useEffect(() => {
        const {
            associateValue_, searchByValue_, searchTerm_ = "",
            orderByValue_, fromDate_ = "", toDate_ = "",
            teamStatus_ = "NO", prosType_ = "MT",
            page_, budget_, meetingType_,
            highlightProspectId_, purposeType_
        } = location.state || {};

        const now = new Date();
        setFromDate(fromDate_ || formatDateForInput(now));
        setToDate(toDate_ || formatDateForInput(now));
        setSearchTerm(searchTerm_);
        setTeamStatus(teamStatus_);
        setProsType(prosType_);
        setPage(page_ == null ? 1 : page_);

        setBudget(structuredOutput["Budget Dropdown"]?.find(
            (item) => String(item.value) === String(budget_)
        ));
        setMeetingType(structuredOutput["Type"]?.find(
            (item) => String(item.value) === String(meetingType_)
        ));
        setPurposeType(structuredOutput["Purpose Dropdown"]?.find(
            (item) => String(item.value) === String(purposeType_)
        ))

        if (associateValue_ && associateList?.data?.data) {
            setAssociateType(associateList.data.data.find(
                (item) => String(item.value) === String(associateValue_)
            ));
        }
        if (searchByValue_) {
            setSelectedSearchType(SEARCH_BY_OPTIONS.find(
                (item) => String(item.value) === String(searchByValue_)
            ));
        }
        if (orderByValue_) {
            setSelectedOrderBy(ORDER_BY_OPTIONS.find(
                (item) => String(item.value) === String(orderByValue_)
            ));
        }

        // FIX 2: Store which prospect to highlight after data loads
        if (highlightProspectId_) {
            setHighlightRowId(highlightProspectId_);
        }

        setShouldFetch(true);
    }, [location.state, associateList, structuredOutput, data]);

    // ── FIX 2: Scroll + highlight after data loads ────────────────────────────
    useEffect(() => {
        if (!highlightRowId || !prosData?.content?.length) return;

        // Small delay to let DataTable render rows
        const scrollTimer = setTimeout(() => {
            const container = tableContainerRef.current;
            if (!container) return;

            // Find the row element by data attribute we will set in conditionalRowStyles
            const rowEl = container.querySelector(`[data-prospect-id="${highlightRowId}"]`);
            if (rowEl) {
                rowEl.scrollIntoView({ behavior: "smooth", block: "center" });
                rowEl.classList.add("mt-row-highlight");

                // Remove highlight after animation completes
                if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
                highlightTimerRef.current = setTimeout(() => {
                    rowEl.classList.remove("mt-row-highlight");
                    setHighlightRowId(null);
                }, 10000);
            } else {
                // Fallback: no element found, just clear
                setHighlightRowId(null);
            }
        }, 350);

        return () => clearTimeout(scrollTimer);
    }, [highlightRowId, prosData]);

    // Cleanup highlight timer on unmount
    useEffect(() => () => {
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    }, []);

    // ── API URL ───────────────────────────────────────────────────────────────
    const apiUrl = useMemo(() => {
        const selectedAssociateId = associateType?.value ? associateType.value : userId;
        const params = [
            (role === USER_TYPE.ASSOCIATE || associateType?.value) ? `associateId=${selectedAssociateId}` : "",
            `fromDateStr=${fromDate}`,
            `toDateStr=${toDate}`,
            `page=${page - 1}`,
            `size=${LIMIT}`,
            `allStatus=${teamStatus}`,
            `favourite=${favStatus === "YES" ? true : false}`,
            selectedSearchType ? `key=${selectedSearchType?.value}&value=${searchTerm}` : "",
            selectedOrderBy ? `key1=${selectedOrderBy?.value}` : "",
            budget ? `clientBudgetId=${budget?.value}` : "",
            meetingType ? `typeId=${meetingType?.value}` : "",
            purposeType ? `purposeId=${purposeType?.value}` : "",
            `status=${prosType}`,
        ].filter(Boolean).join("&");
        return `${GET_PROSPECT_DATA_BY_ASSOCIATE_ID_NEW}${params}`;
    }, [associateType?.value, userId, fromDate, toDate, page, teamStatus,
        selectedSearchType, searchTerm, selectedOrderBy, budget, meetingType, prosType, role, purposeType, favStatus]);

    // ── Fetch prospect data ───────────────────────────────────────────────────
    const fetchProspectData = useCallback(async () => {
        setIsPending(true);
        try {
            const response = await ApiClient.get(apiUrl);
            if (response?.data?.status === 1) {
                decryptData(response.data.data)
                    .then((decrypted) => setProsData(decrypted))
                    .catch(() => setProsData([]));
            } else {
                toast.error(response.data.message || "Failed to fetch prospects");
            }
        } catch (error) {
            toast.error(error.message || "An error occurred");
        } finally {
            setIsPending(false);
            setShouldFetch(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        if (shouldFetch && accessGranted) fetchProspectData();
    }, [shouldFetch, fetchProspectData, apiUrl, accessGranted]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleShowData = (event) => {
        event.preventDefault();
        if (selectedSearchType && !searchTerm) {
            toast.error("Please enter a value to search");
            return;
        }
        setShouldFetch(true);
    };

    const handleClearData = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setFromDate(formatDateForInput(startOfMonth));
        setToDate(formatDateForInput(endOfMonth));
        setSearchTerm("");
        setSelectedSearchType(null);
        setSelectedOrderBy(null);
        setAssociateType(null);
        setTeamStatus("NO");
        setProsType("MT");
        setPage(1);
        setShouldFetch(true);
        setMeetingType(null);
        setBudget(null);
        setPurposeType(null)
    };

    // ── FIX 2: Save prospectId when navigating to manage ─────────────────────
    const handleManageProspect = useCallback((row, rowIndex) => {
        navigate("/prospect-list-menu/add-prospect-list", {
            state: {
                rowData: row,
                screen: "prospect",
                associateValue: associateType?.value,
                searchByValue: selectedSearchType?.value,
                searchTerm,
                orderByValue: selectedOrderBy?.value,
                fromDate,
                toDate,
                page,
                teamStatus,
                prosType,
                budget: budget?.value,
                meetingType: meetingType?.value,
                purposeType: purposeType?.value,
                // FIX 2: pass back so parent can highlight this row on return
                highlightProspectId_: row.id ?? row.prospectId,
                highlightRowIndex_: rowIndex,
            },
        });
    }, [navigate, associateType?.value, selectedSearchType?.value, searchTerm,
        selectedOrderBy?.value, fromDate, toDate, page, teamStatus, prosType,
        budget?.value, meetingType?.value, purposeType?.value]);

    const handleManageDueDate = (rowData) => {
        setModalDueData(rowData);
        setDueDateModalOpen(true);
    };

    const handleCloseModal = () => {
        setDueDateModalOpen(false);
        setModalDueData("");
    };

    const handleModalUpdate = () => {
        if (!modalDueData?.dueDate) {
            toast.error("Due Date Is Required");
            return;
        }
        mutateUpdate({
            prospectId: [modalDueData?.id],
            dueDate: modalDueData.dueDate,
            loginId: userId,
        });
    };

    const { isPending: isPendingAdd, mutate: mutateUpdate } = usePost(PROSPECT_BULK_UPDATE, {
        onSuccess: (response) => {
            if (response?.data?.status === 1) {
                toast.success(response.data.message);
                fetchProspectData();
                handleCloseModal();
            } else {
                toast.error(response.data.message);
            }
        },
        onError: (err) => toast.error(err.message),
    });

    const handleCallClick = (row) => {
        setIsPending(true);
        ApiClient.get(`${IVR_MAKE_CALL}userId=${userId}&callerMobile=${row.phoneNo}`)
            .then((response) => {
                setIsPending(false);
                if (response?.data?.status === 1) toast.success(response.data.message);
                else toast.error(response.data.message);
            })
            .catch((error) => {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    const handleToggleFavourite = (row) => {
        const isCurrentlyFav = row.favourite === true;
        if (!window.confirm(`Are you sure you want to ${isCurrentlyFav ? 'remove from' : 'mark as'} favourite?`)) return;
        setIsPending(true)
        ApiClient.post(`${MARK_PROSPECT_FAVOURITE}?prospectId=${row.id}`)
            .then((response) => {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message)
                    setShouldFetch(true);
                } else {
                    toast.error(response?.data?.message || 'Failed to mark');
                }
            })
            .catch((error) => {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "4%",
            // FIX 1: SL No. reflects actual position across pages
            // e.g. page 3, item 5 → SL = (3-1)*100 + 5 = 205
            cell: (_, i) => (
                <WordWrapCell>{(page - 1) * LIMIT + i + 1}</WordWrapCell>
            ),
        },
        {
            name: <span className="fw-bold fs-13">❤</span>,
            cell: (row) => {
                const isFav = row.favourite === true;
                const HeartIcon = isFav ? FaHeart : FaRegHeart;

                return (
                    <button
                        type="button"
                        onClick={() => handleToggleFavourite(row)}
                        style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <HeartIcon
                            style={{
                                color: isFav ? "#ED4956" : "#8E8E93", // Instagram-like red & gray
                                fontSize: "18px",
                                transition: "all 0.2s ease",
                            }}
                        />
                    </button>
                );
            },
        },
        {
            name: <span className="font-weight-bold fs-13">Manage</span>,
            width: "5%",
            cell: (row, i) => (
                <i
                    className="ri-pencil-fill align-bottom me-2"
                    title={row.dnd ? "DND Enabled - Action Disabled" : "Manage Prospect"}
                    onClick={() => { if (!row.dnd) handleManageProspect(row, i); }}
                    style={{
                        cursor: row.dnd ? "not-allowed" : "pointer",
                        color: defaultTheme.goldColorLogo,
                        opacity: row.dnd ? 0.5 : 1,
                    }}
                />
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            sortable: true,
            width: "10%",
            selector: (row) => `${row.associateName} (${row.associateId})`,
            cell: (row) => <WordWrapCell>{`${row.associateName} (${row.associateId})`}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Type</span>,
            selector: (row) => row.typeName,
            sortable: true,
            width: "5%",
            cell: (row) => <WordWrapCell>{row.typeName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Prospects Date</span>,
            selector: (row) => row.prosDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.prosDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Name</span>,
            selector: (row) => row.clientName,
            sortable: true,
            width: "10%",
            cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
        },
        ...(ivrCallStatus === "YES"
            ? [{
                name: <span className="font-weight-bold fs-13">Call</span>,
                width: "10%",
                sortable: true,
                cell: (row) => (
                    <MdCall
                        className="phone-icon"
                        title={row.dnd ? "DND Enabled - Call Disabled" : "Click to Call"}
                        color={defaultTheme.goldColorLogo}
                        cursor={row.dnd ? "not-allowed" : "pointer"}
                        onClick={() => { if (!row.dnd) handleCallClick(row); }}
                    />
                ),
            }]
            : empCode === "1004"
                ? [{
                    name: <span className="font-weight-bold fs-13">Mobile No.</span>,
                    selector: (row) => row.phoneNo,
                    width: "10%",
                    sortable: true,
                    cell: (row) => <WordWrapCell>{row.phoneNo}</WordWrapCell>,
                }]
                : [{
                    name: <span className="font-weight-bold fs-13">Mobile No.</span>,
                    selector: (row) => row.phoneNo,
                    cell: (row) => (
                        <div className="phone-container">
                            <MdMobileFriendly className="phone-icon" color={defaultTheme.goldColorLogo} />
                            <span className="phone-number">{row.phoneNo}</span>
                        </div>
                    ),
                }]
        ),
        {
            name: <span className="font-weight-bold fs-13">Due Date</span>,
            sortable: true,
            selector: (row) => row.dueDate,
            cell: (row) => {
                if (!row.dueDate) {
                    return <WordWrapCell>No Due Date Updated</WordWrapCell>;
                }

                const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
                const isOverdue = row.dueDate < today;

                return (
                    <div style={{ wordWrap: "break-word", whiteSpace: "normal", color: isOverdue ? defaultTheme.redColor : undefined }}>
                        {formatDate(row.dueDate)}
                    </div>
                );
            }
        },
        {
            name: <span className="font-weight-bold fs-13">Manage Due Date</span>,
            width: "5%",
            cell: (row) => (
                <FaEdit
                    style={{ cursor: "pointer", color: defaultTheme.btnEnable }}
                    size={20}
                    onClick={() => handleManageDueDate(row)}
                    title="Manage Due Date"
                />
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Client Budget</span>,
            sortable: true,
            selector: (row) => row.clientBudgetName,
            cell: (row) => <WordWrapCell>{row.clientBudgetName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Task Timing</span>,
            sortable: true,
            width: "7%",
            selector: (row) => row.taskTimingRange,
            cell: (row) => <WordWrapCell>{row.taskTimingRange}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Address</span>,
            selector: (row) => row.clientAddress,
            cell: (row) => row.clientAddress ? (
                <div className="phone-container">
                    <FaMapMarkerAlt className="phone-icon" color={defaultTheme.goldColorLogo} />
                    <span className="phone-number">{row.clientAddress}</span>
                </div>
            ) : "-",
        },
        {
            name: <span className="font-weight-bold fs-13">Occupation</span>,
            sortable: true,
            width: "7%",
            selector: (row) => row.clientOccupation,
            cell: (row) => <WordWrapCell>{row.clientOccupation}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Email</span>,
            sortable: true,
            width: "5%",
            selector: (row) => row.clientEmail,
            cell: (row) => row.clientEmail ? (
                <div className="phone-container">
                    <MdEmail className="phone-icon" color={defaultTheme.goldColorLogo} />
                    <span className="phone-number">{row.clientEmail}</span>
                </div>
            ) : "-",
        },
        {
            name: <span className="font-weight-bold fs-13">Project</span>,
            sortable: true,
            width: "8%",
            selector: (row) => row.projectName,
            cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Meeting Attempt</span>,
            sortable: true,
            selector: (row) => row.meetingAttemptCount,
            cell: (row) => <WordWrapCell>{row.meetingAttemptCount}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Source Name</span>,
            sortable: true,
            width: "8%",
            selector: (row) => row.sourceName,
            cell: (row) => <WordWrapCell>{row.sourceName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Purpose</span>,
            sortable: true,
            selector: (row) => row.purposeName,
            cell: (row) => <WordWrapCell>{row.purposeName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Prospects Id</span>,
            selector: (row) => row.prospectId,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.prospectId}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Remarks</span>,
            sortable: true,
            width: "70%",
            selector: (row) => row.remarks,
            cell: (row) => <WordWrapCell>{row.remarks}</WordWrapCell>,
        },
    ], [handleManageProspect, page]);   // ← page added so SL No. recalculates

    // ── Access check ──────────────────────────────────────────────────────────
    useEffect(() => {
        const checkAccess = async () => {
            if (role !== USER_TYPE.ASSOCIATE) {
                const hasAccess = await CheckUserAccess(userId, "prospect-list-menu");
                setAccessGranted(hasAccess);
            } else {
                setAccessGranted(true);
            }
        };
        checkAccess();
    }, [userId, role]);


    if (accessGranted === null) return <ScreenLoader />;
    if (!accessGranted) return <PermissionMissing />;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <PageContent>
            <Breadcrumbs title="Associate" breadcrumbItem="Prospects" />
            {(isPending || isLoading || isPendingAdd) && <ScreenLoader />}
            <Container fluid>

                <form onSubmit={handleShowData}>
                    <Card>
                        <CardBody>
                            <Row className="g-2">
                                <Col lg={2}>
                                    <h6 className="font-size-11 fw-semibold text-muted">Select Associate</h6>
                                    <Select
                                        isClearable
                                        menuPortalTarget={document.body}
                                        value={associateType}
                                        onChange={setAssociateType}
                                        options={Array.isArray(associateList?.data?.data) ? associateList?.data?.data : []}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    />
                                </Col>
                                <Col lg={2}>
                                    <h6 className="font-size-11 fw-semibold text-muted">Search By</h6>
                                    <Select
                                        isClearable
                                        menuPortalTarget={document.body}
                                        value={selectedSearchType}
                                        onChange={setSelectedSearchType}
                                        options={SEARCH_BY_OPTIONS}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    />
                                </Col>
                                <Col lg={2}>
                                    <h6 className="font-size-11 fw-semibold text-muted">Search</h6>
                                    <Input
                                        type="text"
                                        className="form-control"
                                        placeholder="Type to search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </Col>
                                <Col lg={2}>
                                    <h6 className="font-size-11 fw-semibold text-muted">Order By</h6>
                                    <Select
                                        isClearable
                                        menuPortalTarget={document.body}
                                        value={selectedOrderBy}
                                        onChange={setSelectedOrderBy}
                                        options={ORDER_BY_OPTIONS}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    />
                                </Col>
                                <Col lg={2}>
                                    <h6 className="font-size-11 fw-semibold text-muted">From Date</h6>
                                    <Input
                                        type="date"
                                        className="form-control"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col lg={2}>
                                    <h6 className="font-size-11 fw-semibold text-muted">To Date</h6>
                                    <Input
                                        type="date"
                                        className="form-control"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">Budget</h6>
                                    <Select
                                        isClearable
                                        options={structuredOutput["Budget Dropdown"]}
                                        className="react-select"
                                        onChange={setBudget}
                                        value={budget}
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">Meeting Type</h6>
                                    <Select
                                        isClearable
                                        options={structuredOutput["Type"]}
                                        className="react-select"
                                        onChange={setMeetingType}
                                        value={meetingType}
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">Purpose</h6>
                                    <Select
                                        isClearable
                                        options={structuredOutput["Purpose Dropdown"]}
                                        className="react-select"
                                        onChange={setPurposeType}
                                        value={purposeType}
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    />
                                </Col>
                                <Col md="2" className="d-flex align-items-end">
                                    <Label>
                                        <Input
                                            type="checkbox"
                                            name="teamStatus"
                                            value="YES"
                                            style={{ cursor: "pointer" }}
                                            checked={teamStatus === "YES"}
                                            onChange={() => {
                                                setTeamStatus(teamStatus === "YES" ? "NO" : "YES");
                                                setShouldFetch(true);
                                            }}
                                        />
                                        <span style={{ marginLeft: 8, fontSize: 12, cursor: "pointer" }}>
                                            Team Prospects
                                        </span>
                                    </Label>
                                </Col>
                                <Col md="2" className="d-flex align-items-end">
                                    <Label>
                                        <Input
                                            type="checkbox"
                                            name="favStatus"
                                            value="YES"
                                            style={{ cursor: "pointer" }}
                                            checked={favStatus === "YES"}
                                            onChange={() => {
                                                setFavStatus(favStatus === "YES" ? "NO" : "YES");
                                                setShouldFetch(true);
                                            }}
                                        />
                                        <span style={{ marginLeft: 8, fontSize: 12, cursor: "pointer" }}>
                                            Favourite Prospects
                                        </span>
                                    </Label>
                                </Col>
                                <Col md="2" className="d-flex align-items-end justify-content-end">
                                    <button className="btn btn-primary me-2" type="submit">Show</button>
                                    <button className="btn btn-secondary" type="button" onClick={handleClearData}>Clear</button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </form>

                <h3 style={{ fontSize: 12, fontWeight: 500, color: defaultTheme.primary }}>
                    Note: Prospects showing in{" "}
                    <span style={{ color: defaultTheme.btnEnable }}>BLUE</span> color are transferred prospects.
                </h3>
                <h3 style={{ fontSize: 12, fontWeight: "500", color: defaultTheme.redColor }}>
                    Note: The Prospect highlighted in red is marked as DND (Do Not Disturb).
                </h3>

                {/* ── FIX 2: ref wrapper so we can query rows inside ── */}
                <div ref={tableContainerRef}>
                    <AppTable
                        progressPending={isPending}
                        columns={columns}
                        data={prosData?.content}
                        pagination
                        paginationTotalRows={prosData?.totalElements}
                        paginationServer

                        // ── FIX 1: Tell DataTable which page is active so the
                        //    "X-Y of N" range displays correctly on back-navigation.
                        //    key forces re-mount with correct internal state.
                        paginationDefaultPage={page}
                        key={`prospect-table-page-${page}`}

                        // ── FIX 1: Override the default "from row" shown in footer.
                        //    react-data-table-component accepts paginationComponentOptions
                        //    to customise the range label.
                        paginationComponentOptions={{
                            noRowsPerPage: true,        // keeps UI clean
                            rangeSeparatorText: "of",
                        }}
                        // The from-row is derived from page number because it's server-side
                        paginationRowsPerPageOptions={[LIMIT]}

                        onChangePage={(newPage) => {
                            setPage(newPage);
                            setShouldFetch(true);
                        }}

                        // ── FIX 2: attach data-prospect-id to each row so we can query it ──
                        conditionalRowStyles={[
                            {
                                when: (row) => row.isTransferData === "yes",
                                style: { color: defaultTheme.btnEnable },
                            },
                            {
                                when: (row) => row.dnd,
                                style: { color: defaultTheme.redColor },
                            },
                        ]}
                    // Pass row-level attributes via AppTable's customStyles or
                    // wrap each row — we set id via the SL No cell trick instead.
                    // The actual highlight uses a MutationObserver approach below.
                    />
                </div>

                {/* ── FIX 2: Hidden sentinel elements with prospect IDs so querySelector works ── */}
                {highlightRowId && prosData?.content?.map((row, idx) => {
                    const id = row.id ?? row.prospectId;
                    if (String(id) !== String(highlightRowId)) return null;
                    // We inject an attribute into the rendered row via a side-effect div
                    return (
                        <RowHighlightInjector
                            key={`hl-${id}`}
                            rowIndex={idx}
                            prospectId={id}
                            tableContainerRef={tableContainerRef}
                        />
                    );
                })}

                {/* Due Date Modal */}
                <Modal isOpen={dueDatemodalOpen} toggle={handleCloseModal}>
                    <ModalHeader toggle={handleCloseModal}>
                        Manage Due Date for {modalDueData?.clientName}
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col md="12" className="mt-2">
                                <label>Due Date</label>
                                <input
                                    className="form-control"
                                    type="date"
                                    min={new Date().toISOString().split("T")[0]}
                                    value={modalDueData?.dueDate}
                                    onChange={(e) =>
                                        setModalDueData({ ...modalDueData, dueDate: e.target.value })
                                    }
                                />
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="primary"
                            onClick={handleModalUpdate}
                            style={{ backgroundColor: defaultTheme.primary }}
                        >
                            Update
                        </Button>
                        <Button
                            color="secondary"
                            onClick={handleCloseModal}
                            style={{ backgroundColor: defaultTheme.goldColorLogo }}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>


            </Container>
        </PageContent>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// FIX 2 HELPER: RowHighlightInjector
// react-data-table-component doesn't expose row-level DOM attributes directly.
// This component uses a MutationObserver to watch for the Nth row to appear,
// then adds data-prospect-id so our scroll+highlight logic can find it.
// ─────────────────────────────────────────────────────────────────────────────
function RowHighlightInjector({ rowIndex, prospectId, tableContainerRef }) {
    useEffect(() => {
        const container = tableContainerRef.current;
        if (!container) return;

        const applyAttribute = () => {
            // react-data-table-component renders rows as [role="row"] inside the table body
            const rows = container.querySelectorAll('[role="row"]:not([role="columnheader"])');
            // rows[0] is header row, so data rows start at index 1
            const targetRow = rows[rowIndex + 1]; // +1 to skip header
            if (targetRow) {
                targetRow.setAttribute("data-prospect-id", String(prospectId));
                return true;
            }
            return false;
        };

        // Try immediately first
        if (applyAttribute()) return;

        // If rows not yet rendered, observe DOM mutations
        const observer = new MutationObserver(() => {
            if (applyAttribute()) observer.disconnect();
        });
        observer.observe(container, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [rowIndex, prospectId, tableContainerRef]);

    return null; // renders nothing
}

export default ProspectListMenu;