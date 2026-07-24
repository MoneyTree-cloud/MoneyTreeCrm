/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import { GET_ALL_SUB_TEAM_DROPDOWN, GET_MESSAGE_COUNT, HANDOVER_MAINTEAM_DETAILS, INTERVIEW_HANDOVER_ASSIGN } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import { FaArrowAltCircleRight, FaEye } from "react-icons/fa";
import PageContent from "../../components/Common/PageContent";
import { formatActionType, formatDate, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, CardBody, Col, Container, Input, Label, Row } from "reactstrap";
import CountdownTimer from "./CountdownTimer";
import { decryptData } from "../../components/Common/CryptoUtils";
import PermissionMissing from "../Utility/PermissonMissing";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { USER_TYPE } from "../../constants/global";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import ChatModal from "../../constants/ChatModal";
import { useGet } from "../../Hooks/useApi";
import { MdChat } from "react-icons/md";

export default function HandoverCandidate() {
    const navigation = useNavigate();
    const location = useLocation();
    const { user: { userId, role, empCode, mainTeam, mainTl, subTl } } = useUserStore();
    const LIMIT = 100;
    const [page, setPage] = useState(1);
    const [accessGranted, setAccessGranted] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const [data, setData] = useState([]);
    const [flag, setFlag] = useState(false)
    const [viewType, setViewType] = useState("my"); // "my" | "team"
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [handoverSelection, setHandoverSelection] = useState({});
    const [movingId, setMovingId] = useState(null);
    const [messageCounts, setMessageCounts] = useState({});

    const { data: subTeams = [] } = useGet(
        `${GET_ALL_SUB_TEAM_DROPDOWN}${mainTeam}`,
        {
            enabled: Boolean(mainTeam),
        }
    );

    useEffect(() => {
        if (!data?.content?.length) return;

        const fetchCounts = async () => {
            const counts = {};

            await Promise.all(
                data.content.map(async (candidate) => {
                    try {
                        const res = await ApiClient.get(
                            `${GET_MESSAGE_COUNT}?candidateId=${candidate.id}&receiverId=${userId}`
                        );

                        counts[candidate.id] =
                            res?.data?.status === 1
                                ? Number(res.data.data)
                                : 0;
                    } catch (err) {
                        counts[candidate.id] = 0;
                    }
                })
            );

            setMessageCounts(counts);
        };

        fetchCounts();
    }, [data?.content]);

    const handleOpenChat = (row) => {
        setSelectedCandidate(row);
        setIsChatOpen(true);
    };

    // Filter state
    const [filters, setFilters] = useState({
        name: '',
        interviewDate: '',
        doj: '',
        handoverDate: ''
    });

    useEffect(() => {
        const checkAccess = async () => {
            if (role !== USER_TYPE.ASSOCIATE) {
                const hasAccess = await CheckUserAccess(userId, 'assigned-candidate-data');
                setAccessGranted(hasAccess);
            }
            else {
                setAccessGranted(true)
            }
        };
        checkAccess();
    }, [userId, role]);

    useEffect(() => {
        // Safely set filters if passed
        if (location.state?.filters) {
            setFilters(prev => ({ ...prev, ...location.state.filters }));
        }

        // Set page if passed
        if (location.state?.page) {
            setPage(location.state.page);
        }
        setFlag(true)
    }, []);

    useEffect(() => {
        if (!flag) return;
        handleGetData()
    }, [page, flag, accessGranted])

    const handleFilterInputChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    }

    const handleClearFilters = () => {
        const hasFilters = filters.name || filters.interviewDate || filters.doj || filters.handoverDate;
        setViewType("my")
        setPage(1);
        if (hasFilters) {
            setFilters({ name: '', interviewDate: '', doj: '', handoverDate: '' });
            handleGetData(null, 'restart');
            navigation(location.pathname, { replace: true, state: {} });
        }
    };

    const handleGetData = (e, key, view_Type) => {
        if (e) e.preventDefault();
        if (accessGranted) {
            setIsPending(true)
            const queryParams = [];
            if (key !== 'restart') {
                if (filters.name) queryParams.push(`candidateName=${encodeURIComponent(filters.name)}`);
                if (filters.interviewDate) queryParams.push(`interviewDate=${encodeURIComponent(filters.interviewDate)}`);
                if (filters.doj) queryParams.push(`doj=${encodeURIComponent(filters.doj)}`);
                if (filters.handoverDate) queryParams.push(`handoverDate=${encodeURIComponent(filters.handoverDate)}`);

            }
            // Role based params
            let roleParam = "";

            if (role === USER_TYPE.ASSOCIATE) {
                if (mainTl === "YES") {
                    // 👇 NEW LOGIC
                    const type = view_Type || viewType
                    if (type === "my") {
                        roleParam = `empCode=${empCode}`;
                    } else {
                        roleParam = `mainTeam=${mainTeam}`;
                    }
                }
                else if (subTl === "YES") {
                    roleParam = `empCode=${empCode}`;
                }
            } else {
                roleParam = `empCode=${empCode}`;
            }

            // Combine all query parameters
            const queryString = queryParams.length > 0 ? `&${queryParams.join('&')}` : '';
            ApiClient.get(`${HANDOVER_MAINTEAM_DETAILS + roleParam}&offset=${key === 'page' ? 0 : page - 1}&limit=${LIMIT}${queryString}`)
                .then(function (response) {
                    setIsPending(false);
                    if (response?.data?.status === 1) {
                        const encryptedContent = response.data.data;
                        decryptData(encryptedContent).then((decrypted) => {
                            setData(decrypted);
                        }).catch((error) => {
                            setData([]); // fallback
                        });
                    } else if (response?.data?.message !== 'No record found') {
                        toast.error(response.data.message);
                        setData([])
                    }
                    else {
                        setData([])
                    }
                })
                .catch(function (error) {
                    setIsPending(false);
                    setData([])
                    toast.error(error.message);
                });
        }
    }

    const getManagerName = (row) => {
        const handovers = row.handovers;
        if (!handovers?.length) return;

        // Case 1: Only one object → return direct match
        if (handovers.length === 1) {
            return handovers[0].mainTeam === mainTeam
                ? handovers[0].reportingManagerName
                : undefined;
        }

        // Reverse for latest first
        const reversed = handovers.slice().reverse();

        // Find latest MANAGER entry
        const managerIndex = reversed.findIndex(
            h => h.mainTeam === mainTeam && h.handoverType === 'MANAGER'
        );

        // If MANAGER found → find previous same mainTeam
        if (managerIndex !== -1) {
            const previousMatch = reversed
                .slice(managerIndex + 1)
                .find(h => h.mainTeam === mainTeam);

            if (previousMatch) {
                return previousMatch.reportingManagerName;
            }
        }

        // Fallback → direct latest match of mainTeam
        const directMatch = reversed.find(h => h.mainTeam === mainTeam);
        return directMatch?.reportingManagerName;
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "6%",
            cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Show More</span>,
            width: '8%',
            selector: (row) => (
                <FaArrowAltCircleRight
                    title="Show Details"
                    className="ri-pencil-fill align-bottom me-2"
                    onClick={() => navigation("/assigned-candidate-data/handover-candidate-history", { state: { rowData: row, filters: filters, page: page } })}
                    cursor={'pointer'}
                    color={defaultTheme.primary}
                    size={16}
                />
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Chat With HR</span>,
            cell: r =>
                <div
                    style={{
                        position: "relative",
                        display: "inline-flex",
                    }}
                >
                    <button
                        onClick={() => handleOpenChat(r)}
                        title="Chat With MT/ST"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: `${defaultTheme.primary}1A`,
                            color: defaultTheme.primary,
                            border: `1px solid ${defaultTheme.primary}40`,
                            borderRadius: 8,
                            cursor: "pointer",
                        }}
                    >
                        <MdChat size={13} />
                    </button>

                    {messageCounts[r.id] > 0 && (
                        <span
                            style={{
                                position: "absolute",
                                top: -6,
                                right: -6,
                                minWidth: 18,
                                height: 18,
                                borderRadius: "50%",
                                background: "red",
                                color: "#fff",
                                fontSize: 10,
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "0 4px",
                            }}
                        >
                            {messageCounts[r.id]}
                        </span>
                    )}
                </div>
        },
        {
            name: <span className="font-weight-bold fs-13">Interview Date</span>,
            sortable: true,
            selector: (row) => row?.interviews[0]?.scheduledAtDate,
            cell: (row) => <WordWrapCell>{formatDate(row?.interviews[0]?.scheduledAtDate) || '-'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Handover Date</span>,
            sortable: true,
            selector: (row) => {
                const matchingHandover = row.handovers?.slice().reverse().find(h => h.mainTeam === mainTeam);
                return matchingHandover?.handoverDate;
            },
            cell: (row) => {
                const matchingHandover = row.handovers?.slice().reverse().find(h => h.mainTeam === mainTeam);
                const handoverDate = matchingHandover?.handoverDate;
                return <WordWrapCell>{formatDateTime(handoverDate)}</WordWrapCell>;
            },
        },
        ...(viewType === 'team'
            ? [
                {
                    name: <span className="font-weight-bold fs-13">Assigned To</span>,
                    sortable: true,
                    selector: (row) => getManagerName(row),
                    cell: (row) => <WordWrapCell>{getManagerName(row)}</WordWrapCell>,
                },
            ]
            : []),
        {
            name: <span className="font-weight-bold fs-13">Applicant Name</span>,
            sortable: true,
            selector: (row) => row.firstName,
            cell: (row) => <WordWrapCell>{row.firstName || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Handover Status</span>,
            sortable: true,
            selector: (row) => {
                const matchingHandover = row.handovers?.slice().reverse().find(h => h.mainTeam === mainTeam);
                return matchingHandover?.handoverStatus || '';
            },
            cell: (row) => {
                const matchingHandover = row.handovers?.slice().reverse().find(h => h.mainTeam === mainTeam);
                const status = matchingHandover?.handoverStatus;
                return <WordWrapCell>{row.status === 'NOT_SELECTED' ? row.status : formatActionType(status)}</WordWrapCell>;
            },
        },
        {
            name: <span className="font-weight-bold fs-13">Handover Expiry</span>,
            cell: (row) => {
                const matchingHandover = row.handovers?.slice().reverse().find(h => h.mainTeam === mainTeam);
                const handoverDate = matchingHandover?.handoverDate;
                const shouldShowTimer = matchingHandover?.handoverStatus === 'ON_HOLD' && handoverDate;
                return (
                    <WordWrapCell>
                        {shouldShowTimer ? (
                            <span style={{ color: 'yellowgreen', fontWeight: 'bold' }} title={formatDateTime(handoverDate)}>
                                <CountdownTimer targetDate={handoverDate} />
                            </span>
                        ) : (
                            '-'
                        )}
                    </WordWrapCell>
                );
            },
        },
        {
            name: <span className="font-weight-bold fs-13">1st DOJ</span>,
            sortable: true,
            width: '10%',
            selector: (row) => {
                const matchingHandover = row.handovers?.slice().reverse().find(h => h.mainTeam === mainTeam);
                return matchingHandover?.doj1;
            },
            cell: (row) => {
                const matchingHandover = row.handovers?.slice().reverse().find(h => h.mainTeam === mainTeam);

                return (
                    <div className="d-flex align-items-center gap-1">
                        <WordWrapCell>{formatDate(matchingHandover?.doj1)}</WordWrapCell>
                        {matchingHandover?.dojRemark1 &&
                            <FaEye
                                size={14}
                                style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                                title={matchingHandover?.dojRemark1 || "No remarks available"}
                                onClick={() => alert(matchingHandover?.dojRemark1 || "No remarks available")}
                            />
                        }
                    </div>
                );
            },
        },
        {
            name: <span className="font-weight-bold fs-13">2nd DOJ</span>,
            sortable: true,
            width: '10%',
            selector: (row) => {
                const matchingHandover = row.handovers?.slice().reverse().find(h => h.mainTeam === mainTeam);
                return matchingHandover?.doj2;
            },
            cell: (row) => {
                const matchingHandover = row.handovers?.slice().reverse().find(h => h.mainTeam === mainTeam);

                return (
                    <div className="d-flex align-items-center gap-1">
                        <WordWrapCell>{formatDate(matchingHandover?.doj2)}</WordWrapCell>
                        {matchingHandover?.dojRemark2 &&
                            <FaEye
                                size={14}
                                style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                                title={matchingHandover?.dojRemark2 || "No remarks available"}
                                onClick={() => alert(matchingHandover?.dojRemark2 || "No remarks available")}
                            />
                        }
                    </div>
                );
            },
        },
        {
            name: <span className="font-weight-bold fs-13">3rd DOJ</span>,
            sortable: true,
            width: '10%',
            selector: (row) => {
                const matchingHandover = row.handovers?.slice().reverse().find(h => h.mainTeam === mainTeam);
                return matchingHandover?.doj3;
            },
            cell: (row) => {
                const matchingHandover = row.handovers?.slice().reverse().find(h => h.mainTeam === mainTeam);

                return (
                    <div className="d-flex align-items-center gap-1">
                        <WordWrapCell>{formatDate(matchingHandover?.doj3)}</WordWrapCell>
                        {matchingHandover?.dojRemark3 &&
                            <FaEye
                                size={14}
                                style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                                title={matchingHandover?.dojRemark3 || "No remarks available"}
                                onClick={() => alert(matchingHandover?.dojRemark3 || "No remarks available")}
                            />
                        }
                    </div>
                );
            },
        },
        {
            name: <span className="font-weight-bold fs-13">Offer Declined Remarks</span>,
            width: "15%",
            cell: (row) => {
                const lastHandover = row.handovers?.[row.handovers.length - 1];
                const remark =
                    lastHandover?.mainTeam === mainTeam &&
                        row.finalStatusEnum === "OfferDeclined"
                        ? row.finalRemarks
                        : "";

                if (!remark) {
                    return <WordWrapCell>-</WordWrapCell>;
                }

                const isLong = remark.length > 30;

                return (
                    <WordWrapCell>
                        {isLong ? (
                            <span
                                style={{
                                    color: defaultTheme.goldColorLogo,
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                }}
                                title="Click to view full remark"
                                onClick={() => alert(remark)}
                            >
                                {remark.substring(0, 30)}...
                            </span>
                        ) : (
                            remark
                        )}
                    </WordWrapCell>
                );
            },
        },
        {
            name: <span className="font-weight-bold fs-13">Location</span>,
            sortable: true,
            selector: (row) => row.finalLocation,
            cell: (row) => row.finalLocation,
        },
        {
            name: (
                <span className="font-weight-bold fs-13">
                    Handover
                </span>
            ),
            width: "18%",
            cell: (row) => {

                const latestHandover = row.handovers
                    ?.slice()
                    .reverse()
                    .find(h => h.mainTeam === mainTeam);

                if (!latestHandover) {
                    return "-";
                }

                const status = latestHandover?.handoverStatus;
                const canMove = status === "ASSIGNED";

                return (
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                        }}
                    >
                        <select
                            className="form-select form-select-sm"
                            disabled={!canMove}
                            value={handoverSelection[row.id] || ""}
                            onChange={(e) =>
                                setHandoverSelection(prev => ({
                                    ...prev,
                                    [row.id]: e.target.value,
                                }))
                            }
                        >
                            <option value="">Select</option>

                            {subTeams?.data?.data?.map((item) => (
                                <option
                                    key={item.value}
                                    value={item.value}
                                >
                                    {item.label}
                                </option>
                            ))}
                        </select>

                        <button
                            className="btn btn-success btn-sm"
                            disabled={
                                !canMove ||
                                !handoverSelection[row.id] ||
                                movingId === row.id
                            }
                            onClick={() => handleMove(row)}
                        >
                            {movingId === row.id ? "..." : "Move"}
                        </button>
                    </div>
                );
            }
        }
    ];

    const handleMove = async (row) => {
        if (!window.confirm("Are you sure to move?")) return
        const selectedValue = handoverSelection[row.id];

        if (!selectedValue) {
            toast.error("Please select reporting manager");
            return;
        }

        const latestHandover = row.handovers
            ?.slice()
            .reverse()
            .find((h) => h.mainTeam === mainTeam);

        if (!latestHandover) {
            toast.error("Handover not found");
            return;
        }
        else if (latestHandover?.handoverType !== 'HR') {
            toast.error("Handover not allowed");
            return;
        }

        const manager = subTeams?.data?.data?.find((x) => x.value === selectedValue);

        if (!manager) {
            toast.error("Invalid manager");
            return;
        }

        // Example:
        // Prateek Saxena (3653) (RS-PS)

        const match = manager.label.match(/^(.*?)\s*\((\d+)\)/);

        const reportingManagerName = match?.[1]?.trim();
        const reportingManagerCode = match?.[2];

        try {
            setMovingId(row.id);

            const response = await ApiClient.post(
                `${INTERVIEW_HANDOVER_ASSIGN}?handoverId=${latestHandover.id}&subTeam=${manager.value}&reportingManagerName=${encodeURIComponent(
                    reportingManagerName + ' (' + reportingManagerCode + ')'
                )}&reportingManagerCode=${reportingManagerCode}`
            );

            if (response.data.status === 1) {
                toast.success(response.data.message);

                setHandoverSelection((prev) => ({
                    ...prev,
                    [row.id]: "",
                }));

                // Refresh table
                handleGetData();
            } else {
                toast.error(response.data.message);
            }
        } catch (e) {
            toast.error(e.response?.data?.message || e.message);
        } finally {
            setMovingId(null);
        }
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);

        if (selectedCandidate) {
            fetchMessageCount(selectedCandidate.id, userId);
        }
    };

    const fetchMessageCount = async (candidateId, receiverId) => {
        try {
            const response = await ApiClient.get(
                `${GET_MESSAGE_COUNT}?candidateId=${candidateId}&receiverId=${receiverId}`
            );

            if (response?.data?.status === 1) {
                setMessageCounts(prev => ({
                    ...prev,
                    [candidateId]: response.data.data || 0,
                }));
            }
        } catch (err) {
            console.error(err);
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
            <Breadcrumbs title="Hr Module" breadcrumbItem="Candidate History" />
            {(isPending) && <ScreenLoader />}
            <Container fluid={true}>

                <h3
                    style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: defaultTheme.redColor,
                    }}
                >
                    Note: As per the recruitment process, any candidate placed on hold will be automatically rejected if no further action is taken within 48 hours of the hold status being applied.
                </h3>

                <Card>
                    <CardBody>
                        <form onSubmit={() => handleGetData(null, "page")}>
                            <Row className="g-3">
                                {/* Name Filter */}
                                <Col sm="12" md="3">
                                    <Label for="name" className="font-size-11 fw-semibold text-muted">Candidate Name</Label>
                                    <Input
                                        type="text"
                                        id="name"
                                        value={filters.name}
                                        onChange={(e) => handleFilterInputChange('name', e.target.value)}
                                        placeholder="Search by candidate name..."
                                    />
                                </Col>
                                {/* Interview Date Filter */}
                                <Col sm="12" md="2">
                                    <Label for="interviewDate" className="font-size-11 fw-semibold text-muted">Interview Date</Label>
                                    <Input
                                        type="date"
                                        id="interviewDate"
                                        value={filters.interviewDate}
                                        onChange={(e) => handleFilterInputChange('interviewDate', e.target.value)}
                                    />
                                </Col>
                                {/* DOJ Filter */}
                                <Col sm="12" md="2">
                                    <Label for="doj" className="font-size-11 fw-semibold text-muted">DOJ</Label>
                                    <Input
                                        type="date"
                                        id="doj"
                                        value={filters.doj}
                                        onChange={(e) => handleFilterInputChange('doj', e.target.value)}
                                    />
                                </Col>
                                {/* Handover Date Filter */}
                                <Col sm="12" md="2">
                                    <Label for="handoverDate" className="font-size-11 fw-semibold text-muted">Handover Date</Label>
                                    <Input
                                        type="date"
                                        id="handoverDate"
                                        value={filters.handoverDate}
                                        onChange={(e) => handleFilterInputChange('handoverDate', e.target.value)}
                                    />
                                </Col>
                                {/* Search and Clear Buttons */}
                                <Col sm="12" md="3" className="d-flex align-items-end">
                                    <Button
                                        color="primary"
                                        onClick={(e) => handleGetData(e, "page")}
                                        type="submit"
                                    >
                                        Search
                                    </Button>
                                    <Button
                                        color="secondary"
                                        onClick={handleClearFilters}
                                        className="ms-2"
                                    >
                                        Clear
                                    </Button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                {/* Radio Buttons */}
                {mainTl === "YES" && (
                    <div className="radio-button-container">
                        {["my", "team"].map((type) => (
                            <label
                                key={type}
                                className={`radio-label ${viewType === type ? "active" : ""}`}
                            >
                                <input
                                    type="radio"
                                    value={type}
                                    checked={viewType === type}
                                    onChange={(e) => {
                                        setViewType(e.target.value)
                                        handleGetData(null, 'page', e.target.value)
                                    }}
                                />
                                {type === "my" ? "My" : "Team"}
                            </label>
                        ))}
                    </div>
                )}

                <AppTable
                    progressPending={isPending}
                    columns={columns}
                    data={data?.content}
                    pagination
                    paginationServer
                    paginationTotalRows={data?.totalElements}
                    onChangePage={setPage}
                    conditionalRowStyles={[
                        {
                            when: (row) => {
                                const lastHandover = row.handovers?.slice()?.reverse()?.find(h => h.mainTeam === mainTeam);
                                return lastHandover?.handoverStatus === 'NOT_SELECTED';
                            },
                            style: { color: defaultTheme.redColor }
                        },
                        {
                            when: (row) => {
                                const lastHandover = row.handovers?.slice()?.reverse()?.find(h => h.mainTeam === mainTeam);
                                return lastHandover?.handoverStatus === 'SELECTED';
                            },
                            style: { color: 'green' }
                        },
                        {
                            when: (row) => {
                                const lastHandover = row.handovers?.slice()?.reverse()?.find(h => h.mainTeam === mainTeam);
                                return lastHandover?.handoverStatus === 'ON_HOLD';
                            },
                            style: { color: 'yellowgreen' }
                        }
                    ]}
                />

                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => handleCloseChat()}
                    candidateDetail={selectedCandidate}
                />
            </Container>
        </PageContent>
    );
}