/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, Container, Modal, ModalBody, ModalHeader } from "reactstrap";
import { toast } from "react-toastify";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import PageContent from "../../components/Common/PageContent";
import ScreenLoader from "../../constants/ScreenLoader";
import { useGet } from "../../Hooks/useApi";
import { useUserStore } from "../../store/useUserStore";
import ApiClient from "../../helpers/api_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import { formatDate, WordWrapCell } from "../../helpers/function_helper";
import { GENERATE_TOKEN, GET_ALL_PROSPECTS_MASTER, GET_PROSPECT_DATA_BY_ASSOCIATE_ID_NEW, MARK_PROSPECT_FAVOURITE } from "../../helpers/url_helper";
import { FaCheck, FaCheckCircle, FaCopy, FaFileDownload, FaHeart, FaIdCard, FaRegHeart } from "react-icons/fa";
import { decryptData } from "../../components/Common/CryptoUtils";
import "../CSS/styles.css";

// ─── Constants ────────────────────────────────────────────────────────────────
const LIMIT = 100;

// ─── Component ────────────────────────────────────────────────────────────────
const FavouriteProspects = () => {
    const { user: { userId, userName, locationName } } = useUserStore();
    // ── State ─────────────────────────────────────────────────────────────────
    const [isPending, setIsPending] = useState(false);
    const [prosData, setProsData] = useState([]);
    const [structuredOutput, setStructuredOutput] = useState({});
    const [activeTab, setActiveTab] = useState("VERY_HOT");
    const [page, setPage] = useState(1);

    const [generatedToken, setGeneratedToken] = useState("");
    const [rowData, setRowData] = useState("");
    const [tokenModal, setTokenModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [tokenGenerated, setTokenGenerated] = useState(false);
    const { data, isLoading } = useGet(GET_ALL_PROSPECTS_MASTER);

    const today = new Date();

    const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);

    const dayAfterTomorrow = new Date(); dayAfterTomorrow.setDate(today.getDate() + 2);

    const formatDateOnly = (date) => date.toISOString().split("T")[0];

    const allowedDates = [
        formatDateOnly(today),
        formatDateOnly(tomorrow),
        formatDateOnly(dayAfterTomorrow),
    ];

    const copyToken = async () => {
        try {
            await navigator.clipboard.writeText(generatedToken?.token);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (err) {
            console.error("Failed to copy token:", err);
        }
    };

    const shareToken = () => {
        if (locationName !== generatedToken?.branch) return;

        const params = new URLSearchParams();
        params.append('title', 'MEETING INVITATION');
        if (generatedToken?.token) params.append('token', generatedToken.token);
        if (generatedToken?.event) params.append('event', generatedToken.event);
        if (userName) params.append('user', userName);
        if (generatedToken?.location) params.append('location', generatedToken.location);
        if (generatedToken?.tokenDate) params.append('tokenDate', formatDate(generatedToken.tokenDate));
        params.append('download', '1');

        const url = `${window.location.origin}/meeting-invitation.html?${params.toString()}`;
        window.open(url, '_blank');
    };

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

    const veryHotId = useMemo(() => {
        return structuredOutput["Type"]?.find(
            item => item.label === "Very Hot"
        )?.value;
    }, [structuredOutput]);

    const hotId = useMemo(() => {
        return structuredOutput["Type"]?.find(
            item => item.label === "Hot"
        )?.value;
    }, [structuredOutput]);

    useEffect(() => {
        if (activeTab === "VERY_HOT" && !veryHotId) return;
        if (activeTab === "HOT" && !hotId) return;
        fetchProspectData();
    }, [activeTab, page, veryHotId, hotId]);

    // ── API URL ───────────────────────────────────────────────────────────────
    const apiUrl = useMemo(() => {
        let typeId = "";
        if (activeTab === "VERY_HOT") {
            typeId = veryHotId;
        } else if (activeTab === "HOT") {
            typeId = hotId;
        }

        const params = [
            `fromDateStr=2020-01-01`,
            `toDateStr=${new Date().toISOString().split("T")[0]}`,
            `page=${page - 1}`,
            `size=${LIMIT}`,
            `associateId=${userId}`,
            `status=MT`,
            `favourite=${activeTab === "FAVOURITE"}`,
            typeId ? `typeId=${typeId}` : "",
            `allStatus=NO`
        ]
            .filter(Boolean)
            .join("&");

        return `${GET_PROSPECT_DATA_BY_ASSOCIATE_ID_NEW}${params}`;
    }, [page, activeTab, veryHotId, hotId]);

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
        }
    }, [apiUrl]);

    useEffect(() => {
        if (activeTab === "VERY_HOT" && !veryHotId) return;
        if (activeTab === "HOT" && !hotId) return;
        fetchProspectData();
    }, [page, activeTab, veryHotId, hotId]);

    const handleToggleFavourite = (row) => {
        const isCurrentlyFav = row.favourite === true;
        if (!window.confirm(`Are you sure you want to ${isCurrentlyFav ? 'remove from' : 'mark as'} favourite?`)) return;
        setIsPending(true)
        ApiClient.post(`${MARK_PROSPECT_FAVOURITE}?prospectId=${row.id}`)
            .then((response) => {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message)
                    fetchProspectData();
                } else {
                    toast.error(response?.data?.message || 'Failed to mark');
                }
            })
            .catch((error) => {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    const handleAddToken = (row) => {
        setRowData(row);
        if (row.token) {
            setGeneratedToken(row.token);
            setSelectedDate(row.tokenDate);
            setTokenGenerated(true);
            setTokenModal(true);
            return;
        }
        setSelectedDate(allowedDates[0]);
        setGeneratedToken("");
        setTokenGenerated(false);
        setTokenModal(true);
        // if (row.token) {
        //     setGeneratedToken({
        //         token: row.token,
        //         branch: row.branch,
        //         event: row.event,
        //         location: row.location,
        //         tokenDate: row.tokenDate,
        //     });

        //     setSelectedDate(row.tokenDate);
        //     setTokenGenerated(true);
        //     setTokenModal(true);
        //     return;
        // }
    };

    const generateToken = () => {
        setIsPending(true);
        ApiClient.post(
            `${GENERATE_TOKEN}?prospectId=${rowData.id}&tokenDate=${selectedDate}`
        )
            .then((response) => {
                setIsPending(false);
                if (response.data.status === 1) {
                    toast.success(response.data.message);
                    fetchProspectData();
                    setGeneratedToken(response.data.data);
                    setTokenGenerated(true);
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch((err) => {
                setIsPending(false);
                toast.error(err.message);
            });

    };

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "6%",
            // FIX 1: SL No. reflects actual position across pages
            // e.g. page 3, item 5 → SL = (3-1)*100 + 5 = 205
            cell: (_, i) => (
                <WordWrapCell>{(page - 1) * LIMIT + i + 1}</WordWrapCell>
            ),
        },
        ...(activeTab === 'FAVOURITE'
            ? [
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
            ]
            : []),
        {
            name: "Token",
            cell: (row) => {
                return row.token ?
                    <span
                        style={{
                            color: defaultTheme.primary,
                            // cursor: "pointer",
                            // textDecoration: "underline",
                            // textUnderlineOffset: "2px"
                        }}
                        title="Share Token"
                    // onClick={() => handleAddToken(row)}
                    >
                        {row.token}
                    </span>
                    :
                    <FaIdCard
                        size={18}
                        color={defaultTheme.primary}
                        style={{ cursor: "pointer" }}
                        title="Generate Token"
                        onClick={() => handleAddToken(row)}
                    />;
            }
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row.clientName,
            sortable: true,
            width: "10%",
            cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Project</span>,
            sortable: true,
            width: "8%",
            selector: (row) => row.projectName,
            cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>,
        },
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
            name: <span className="font-weight-bold fs-13">Remarks</span>,
            sortable: true,
            width: "70%",
            selector: (row) => row.remarks,
            cell: (row) => <WordWrapCell>{row.remarks}</WordWrapCell>,
        },
    ], [page, activeTab]);   // ← page added so SL No. recalculates

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <PageContent>
            <Breadcrumbs title="Associate" breadcrumbItem="Favourite Prospects" />
            {(isPending || isLoading) && <ScreenLoader />}
            <Container fluid>

                <>
                    <Card className="border-0 shadow-sm rounded-4">
                        <CardBody className="py-3">

                            <div className="d-flex justify-content-between align-items-center flex-wrap">

                                <div>
                                    <h5 className="mb-1 fw-bold">
                                        Favourite Prospects
                                    </h5>
                                    <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                                        Manage your Very Hot, Hot & Favourite prospects
                                    </p>
                                </div>

                                <div
                                    className="d-flex rounded-pill p-1 mt-3 mt-md-0"
                                    style={{
                                        background: "#f4f6f9",
                                        border: "1px solid #e8eaef",
                                        gap: "6px",
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveTab("VERY_HOT");
                                            setPage(1);
                                        }}
                                        className="btn"
                                        style={{
                                            minWidth: 135,
                                            borderRadius: 30,
                                            fontWeight: 600,
                                            transition: ".25s",
                                            background:
                                                activeTab === "VERY_HOT"
                                                    ? "#dc3545"
                                                    : "transparent",
                                            color:
                                                activeTab === "VERY_HOT"
                                                    ? "#fff"
                                                    : "#555",
                                            boxShadow:
                                                activeTab === "VERY_HOT"
                                                    ? "0 4px 12px rgba(220,53,69,.3)"
                                                    : "none",
                                        }}
                                    >
                                        Very Hot🔥🔥
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveTab("HOT");
                                            setPage(1);
                                        }}
                                        className="btn"
                                        style={{
                                            minWidth: 120,
                                            borderRadius: 30,
                                            fontWeight: 600,
                                            transition: ".25s",
                                            background:
                                                activeTab === "HOT"
                                                    ? "#fd7e14"
                                                    : "transparent",
                                            color:
                                                activeTab === "HOT"
                                                    ? "#fff"
                                                    : "#555",
                                            boxShadow:
                                                activeTab === "HOT"
                                                    ? "0 4px 12px rgba(253,126,20,.3)"
                                                    : "none",
                                        }}
                                    >
                                        Hot🔥
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveTab("FAVOURITE");
                                            setPage(1);
                                        }}
                                        className="btn"
                                        style={{
                                            minWidth: 145,
                                            borderRadius: 30,
                                            fontWeight: 600,
                                            transition: ".25s",
                                            background:
                                                activeTab === "FAVOURITE"
                                                    ? "#e83e8c"
                                                    : "transparent",
                                            color:
                                                activeTab === "FAVOURITE"
                                                    ? "#fff"
                                                    : "#555",
                                            boxShadow:
                                                activeTab === "FAVOURITE"
                                                    ? "0 4px 12px rgba(232,62,140,.3)"
                                                    : "none",
                                        }}
                                    >
                                        Favourite❤️
                                    </button>

                                </div>

                            </div>

                        </CardBody>
                    </Card>
                </>

                <AppTable
                    progressPending={isPending}
                    columns={columns}
                    data={prosData?.content}
                    pagination
                    paginationTotalRows={prosData?.totalElements}
                    paginationServer
                    onChangePage={(newPage) => setPage(newPage)}
                    conditionalRowStyles={[
                        {
                            when: (row) => row.isTransferData === "yes",
                            style: { color: defaultTheme.btnEnable }
                        },
                        {
                            when: (row) => row.dnd,
                            style: { color: defaultTheme.redColor }
                        }
                    ]}
                />

                <Modal
                    isOpen={tokenModal}
                    toggle={() => {
                        setTokenModal(false)
                        setRowData("")
                    }}
                    centered
                    size="md"
                >
                    <ModalHeader toggle={() => {
                        setTokenModal(false)
                        setRowData("")
                    }}>
                        Generated Token
                    </ModalHeader>
                    <ModalBody className="text-center py-4">
                        {!tokenGenerated ? (
                            <>
                                <h4 className="mb-4">
                                    Generate Token
                                </h4>
                                <div className="mb-4">
                                    <label className="form-label fw-bold">
                                        Select Valid Till Date
                                    </label>
                                    <select
                                        className="form-control"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    >
                                        <option value={allowedDates[0]}>
                                            Today
                                        </option>
                                        <option value={allowedDates[1]}>
                                            Tomorrow
                                        </option>
                                        <option value={allowedDates[2]}>
                                            Day After Tomorrow
                                        </option>
                                    </select>
                                </div>
                                <Button
                                    color="primary"
                                    onClick={generateToken}
                                >
                                    Generate Token
                                </Button>
                            </>
                        ) : (
                            <>
                                <div
                                    style={{
                                        width: 70,
                                        height: 70,
                                        borderRadius: "50%",
                                        background: "#e8f5e9",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 20px",
                                    }}
                                >
                                    <FaCheckCircle
                                        size={36}
                                        color="#28a745"
                                    />
                                </div>
                                <h4 className="fw-bold">
                                    Token Generated Successfully
                                </h4>
                                <div
                                    className="d-flex align-items-center justify-content-between px-3 py-3"
                                    style={{
                                        background: "#f8f9fa",
                                        border: "1px dashed #0d6efd",
                                        borderRadius: 10
                                    }}
                                >
                                    <div>
                                        <FaIdCard
                                            className="me-2"
                                            color="#0d6efd"
                                        />
                                        <span
                                            style={{
                                                fontFamily: "monospace",
                                                fontWeight: 700
                                            }}
                                        >
                                            {generatedToken?.token || rowData?.token}
                                        </span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Button
                                            color={copied ? "success" : "primary"}
                                            size="sm"
                                            onClick={copyToken}
                                        >
                                            {copied ?
                                                <>
                                                    <FaCheck className="me-1" />
                                                    Copied
                                                </>
                                                :
                                                <>
                                                    <FaCopy className="me-1" />
                                                    Copy
                                                </>
                                            }
                                        </Button>
                                        {String(generatedToken?.branch) === String(locationName) && (
                                            <Button
                                                color="info"
                                                size="sm"
                                                onClick={shareToken}
                                            >
                                                <FaFileDownload className="me-1" />
                                                Download Invitation
                                            </Button>
                                        )}

                                    </div>
                                </div>
                            </>
                        )}
                    </ModalBody>

                </Modal>
            </Container>
        </PageContent>
    );
};

export default FavouriteProspects;