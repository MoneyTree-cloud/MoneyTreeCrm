/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Button, Label, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import { FaSearch, FaCalendarAlt, FaUserCheck, FaUserSlash, FaCommentDots } from 'react-icons/fa';
import { MdEdit, MdMobileFriendly } from 'react-icons/md';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import AppTable from '../../components/Common/Table';
import { useUserStore } from '../../store/useUserStore';
import { defaultTheme } from '../../helpers/defaultTheme';
import { formatDate, formatDateForInput, formatDateTime, WordWrapCell } from '../../helpers/function_helper';
import PermissionMissing from '../Utility/PermissonMissing';
import ApiClient from '../../helpers/api_helper';
import {
    GET_RECRUITMENT_FEEDBACK_LIST,
    GET_RECRUITMENT_FEEDBACK,
    UPDATE_RECRUITMENT_FEEDBACK1,
    UPDATE_RECRUITMENT_FEEDBACK2,
    UPDATE_RECRUITMENT_FEEDBACK3,
    ALL_HR_DROPDOWN,
} from '../../helpers/url_helper';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import './RecruitmentFeedback.css';
import { useGet } from '../../Hooks/useApi';

// ── Helpers ──────────────────────────────────────────────────────────────────
const countFilled = (row) => ['remark1', 'remark2', 'remark3'].filter((k) => row?.[k]?.trim?.()).length;

const nextSlot = (row) => {
    if (!row) return null;
    if (!row.remark1?.trim?.()) return 1;
    if (!row.remark2?.trim?.()) return 2;
    if (!row.remark3?.trim?.()) return 3;
    return null;
};

const buildCreatedBy = (user) => {
    const name = user?.userName || 'User';
    const code = user?.empCode || user?.userId || '';
    return code ? `${name} (${code})` : name;
};

const isUserActive = (row) => row?.isActive === true || row?.isActive === 'YES';

// Match recruiterCode against HR dropdown (handles "1005" vs 1005 type mismatch)
const lookupRecruiterName = (recruiterCode, hrList) => {
    if (!recruiterCode) return '';
    const hr = Array.isArray(hrList) ? hrList : [];
    const target = String(recruiterCode);
    const matched = hr.find((i) => String(i.value) === target);
    return matched?.label || '';
};

const normalizeListRow = (r) => ({
    ...r,
    empName: r.empName ?? r.name ?? '',
    empCode: r.empCode ?? r.employeeCode ?? '',
    personalMobile: r.personalMobile ?? r.phone ?? '',
    officialMobile: r.officialMobile ?? r.officialPhone ?? '',
    subTeam: r.subTeam ?? r.sTeam ?? '',
    branch: r.branch ?? r.locationName ?? '',
    isActive: r.isActive ?? (r.userMaster?.isActive === 'YES'),
});

// Merge GET_RECRUITMENT_FEEDBACK response into a row (used by enrichment + modal)
const mergeFeedbackIntoRow = (row, raw, hrList) => {
    const recruiterCode = row.recruiterCode || raw?.userMaster?.recruiterCode || '';
    return {
        ...row,
        feedbackId: raw?.id || null,
        remark1: raw?.remark1 || '',
        remark1Date: raw?.remark1Date || null,
        remark1FilledBy: raw?.remark1FilledBy || null,
        remark2: raw?.remark2 || '',
        remark2Date: raw?.remark2Date || null,
        remark2FilledBy: raw?.remark2FilledBy || null,
        remark3: raw?.remark3 || '',
        remark3Date: raw?.remark3Date || null,
        remark3FilledBy: raw?.remark3FilledBy || null,
        createdAt: raw?.createdAt || null,
        recruiterCode,
        recruiterName: lookupRecruiterName(recruiterCode, hrList),
    };
};

const getCurrentMonthDate = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
        fromDate: formatDateForInput(startOfMonth),
        toDate: formatDateForInput(endOfMonth),
    };
};

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ Sub-components                                                             ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const CountPill = ({ count }) => {
    const cls = ['zero', 'one', 'two', 'three'][count] || 'zero';
    return (
        <span className={`rf-count-pill ${cls}`} title={`${count} of 3 remarks filled`}>
            <FaCommentDots size={10} /> {count}/3
        </span>
    );
};

const RemarkCard = ({ n, row, slot, newRemark, setNewRemark }) => {
    const text = row[`remark${n}`];
    const time = row[`remark${n}Date`];
    const filledBy = row[`remark${n}FilledBy`];
    const isFilled = !!text?.trim?.();
    const isActive = !isFilled && slot === n;

    return (
        <div className={`rf-remark-card ${isFilled ? 'locked' : ''} ${isActive ? 'active' : ''}`}>
            <div className="rf-remark-head">
                <span>
                    <span className="rf-remark-num">Remark {n}</span>
                    {isFilled && (
                        <span style={{ marginLeft: 6, color: defaultTheme.primary }}>· 🔒 Locked</span>
                    )}
                    {isActive && (
                        <span style={{ marginLeft: 6, color: defaultTheme.goldColorLogo }}>· ✏️ Now Editing</span>
                    )}
                </span>
                {time && <span className="rf-remark-time">{formatDateTime(time)}</span>}
            </div>

            {isFilled ? (
                <>
                    <div className="rf-remark-text">{text}</div>
                    {filledBy && (
                        <div style={{ marginTop: 6, fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                            — by {filledBy}
                        </div>
                    )}
                </>
            ) : isActive ? (
                <textarea
                    className="rf-remark-textarea"
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    placeholder={`Write remark ${n}…`}
                    rows={3}
                    maxLength={1000}
                    autoFocus
                />
            ) : (
                <div className="rf-remark-empty">Will unlock after remark {n - 1} is saved.</div>
            )}
        </div>
    );
};

const EmployeeStrip = ({ row }) => {
    const items = [
        { label: 'DOJ', value: formatDate(row.doj) },
        { label: 'Team', value: `${row.mainTeam || '—'} / ${row.subTeam || '—'}` },
        { label: 'Branch', value: row.branch },
        { label: 'Recruiter', value: row.recruiterName },
    ];
    return (
        <div className="rf-emp-strip">
            {items.map((it) => (
                <div key={it.label}>
                    <div className="rf-emp-strip-label">{it.label}</div>
                    <div className="rf-emp-strip-value">{it.value || '—'}</div>
                </div>
            ))}
        </div>
    );
};

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ Main component                                                             ║
// ╚════════════════════════════════════════════════════════════════════════════╝
export default function RecruitmentFeedback() {
    const user = useUserStore((s) => s.user);
    const userId = user?.userId;

    const [accessGranted, setAccessGranted] = useState(null);
    const [loading, setLoading] = useState(false);
    const [enriching, setEnriching] = useState(false);
    const [rows, setRows] = useState([]);

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [empSearch, setEmpSearch] = useState('');
    const [activeTab, setActiveTab] = useState('pending');   // 'pending' | 'completed'

    const [modal, setModal] = useState({ open: false, row: null });
    const [newRemark, setNewRemark] = useState('');
    const [saving, setSaving] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [showInactive, setShowInactive] = useState(false);

    const { data: hrList } = useGet(ALL_HR_DROPDOWN);
    const hrReady = (hrList?.data?.data?.length ?? 0) > 0;

    // ── Access check + initial load ──────────────────────────────────────────
    useEffect(() => {
        const { fromDate: from, toDate: to } = getCurrentMonthDate();
        setFromDate(from);
        setToDate(to);

        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'recruitment-feedback');
            setAccessGranted(hasAccess);
            if (hasAccess) fetchData(from, to);
        };
        checkAccess();
    }, [userId]);

    // ── Fetch list ───────────────────────────────────────────────────────────
    const fetchData = (from, to) => {
        setLoading(true);
        const params = new URLSearchParams();
        if (from) params.append('startDate', from);
        if (to) params.append('endDate', to);

        ApiClient.get(`${GET_RECRUITMENT_FEEDBACK_LIST}?${params.toString()}`)
            .then((resp) => {
                setLoading(false);
                if (resp?.data?.status === 1) {
                    const normalized = (resp.data.data || []).map(normalizeListRow);
                    setRows(normalized);
                } else {
                    setRows([]);
                    toast.error(resp?.data?.message || 'Failed to load');
                }
            })
            .catch((err) => {
                setLoading(false);
                setRows([]);
                toast.error(err.message);
            });
    };

    // ── Enrich rows with per-employee feedback data + recruiter name ─────────
    // Fires once after both list + HR dropdown are ready.
    useEffect(() => {
        if (!hrReady || rows.length === 0) return;
        if (rows[0]?._enriched) return;   // already enriched, don't re-fire
        enrichRows(rows);
    }, [rows, hrReady]);

    const enrichRows = async (rawRows) => {
        setEnriching(true);
        const hrData = Array.isArray(hrList?.data?.data) ? hrList.data.data : [];

        const promises = rawRows.map((row) =>
            ApiClient.get(`${GET_RECRUITMENT_FEEDBACK}?id=${row.userId}`)
                .then((resp) => {
                    if (resp?.data?.status === 1) {
                        const raw = Array.isArray(resp.data.data) ? resp.data.data[0] : resp.data.data;
                        return { row, raw };
                    }
                    return { row, raw: null };
                })
                .catch(() => ({ row, raw: null }))
        );

        const results = await Promise.all(promises);

        const enriched = results.map(({ row, raw }) =>
            ({ ...mergeFeedbackIntoRow(row, raw, hrData), _enriched: true })
        );

        setRows(enriched);
        setEnriching(false);
    };

    // ── Fetch one employee's record (used on manage click + after save) ──────
    const fetchOneEmployee = async (row) => {
        try {
            const resp = await ApiClient.get(`${GET_RECRUITMENT_FEEDBACK}?id=${row.userId}`);
            const hrData = Array.isArray(hrList?.data?.data) ? hrList.data.data : [];

            if (resp?.data?.status === 1) {
                const raw = Array.isArray(resp.data.data) ? resp.data.data[0] : resp.data.data;
                return mergeFeedbackIntoRow(row, raw, hrData);
            }
            return mergeFeedbackIntoRow(row, null, hrData);
        } catch (err) {
            toast.error(err.message || 'Failed to load employee details');
            return mergeFeedbackIntoRow(row, null, []);
        }
    };

    const handleApply = (e) => {
        e.preventDefault();
        if (fromDate && toDate && fromDate > toDate) {
            toast.error('From date cannot be after To date');
            return;
        }
        fetchData(fromDate, toDate);
    };

    const handleClearAll = () => {
        const { fromDate: from, toDate: to } = getCurrentMonthDate();
        setFromDate(from);
        setToDate(to);
        setEmpSearch('');
        fetchData(from, to);
    };

    // ── Frontend filter + tab split (by remarks count) ───────────────────────
    const filteredRows = useMemo(() => {
        const q = empSearch.trim().toLowerCase();

        return rows.filter((r) => {
            const filled = countFilled(r);

            // Active / Inactive filter
            if (showInactive) {
                if (r.isActive !== 'NO') return false;
            } else {
                if (r.isActive !== 'YES') return false;
            }

            // Tab filter
            if (activeTab === 'pending' && filled >= 3) return false;
            if (activeTab === 'completed' && filled < 3) return false;

            if (q) {
                const code = String(r.empCode || '').toLowerCase();
                const name = String(r.empName || '').toLowerCase();
                const branch = String(r.branch || '').toLowerCase();

                if (
                    !code.includes(q) &&
                    !name.includes(q) &&
                    !branch.includes(q)
                ) {
                    return false;
                }
            }

            return true;
        });
    }, [rows, empSearch, activeTab, showInactive]);

    const tabCounts = useMemo(() => {
        const baseRows = rows.filter((r) =>
            showInactive ? r.isActive === 'NO' : r.isActive === 'YES'
        );

        return {
            pending: baseRows.filter((r) => countFilled(r) < 3).length,
            completed: baseRows.filter((r) => countFilled(r) === 3).length,
        };
    }, [rows, showInactive]);

    const hasAnyFilter = empSearch.trim() || fromDate || toDate;

    // ── Modal handlers ───────────────────────────────────────────────────────
    const openModal = async (row) => {
        setNewRemark('');
        setModal({ open: true, row });
        setModalLoading(true);

        const fresh = await fetchOneEmployee(row);
        setModalLoading(false);

        // mergeFeedbackIntoRow always returns a usable object, never null
        setModal((prev) => ({ ...prev, row: { ...prev.row, ...fresh } }));
    };

    const closeModal = () => {
        if (saving) return;
        setModal({ open: false, row: null });
        setNewRemark('');
    };

    // ── Save remark ──────────────────────────────────────────────────────────
    const submitRemark = async () => {
        const { row } = modal;
        if (!row) return;

        const slot = nextSlot(row);
        if (!slot) return toast.error('All three remarks are already filled');
        if (!newRemark.trim()) return toast.error('Please write a remark before saving');

        setSaving(true);

        try {
            const createdBy = buildCreatedBy(user);
            const remarkText = newRemark.trim();
            let url;

            if (slot === 1) {
                const params = new URLSearchParams({
                    empId: row.userId,
                    remark1: remarkText,
                    createdBy,
                }).toString();
                url = `${UPDATE_RECRUITMENT_FEEDBACK1}?${params}`;
            } else {
                const feedbackId = row.feedbackId || row.id;
                if (!feedbackId) {
                    setSaving(false);
                    return toast.error('Missing feedback record id — please refresh');
                }
                const params = new URLSearchParams({
                    id: feedbackId,
                    [`remark${slot}`]: remarkText,
                    createdBy,
                }).toString();
                url = slot === 2
                    ? `${UPDATE_RECRUITMENT_FEEDBACK2}?${params}`
                    : `${UPDATE_RECRUITMENT_FEEDBACK3}?${params}`;
            }

            const resp = await ApiClient.post(url);
            if (resp?.data?.status !== 1) {
                toast.error(resp?.data?.message || 'Failed to save remark');
                setSaving(false);
                return;
            }

            toast.success(resp.data.message || `Remark ${slot} saved`);

            const updated = await fetchOneEmployee(row);
            if (updated) {
                setRows((prev) =>
                    prev.map((r) =>
                        r.userId === row.userId
                            ? { ...r, ...updated, _enriched: true }
                            : r
                    )
                );
                setModal((prev) => ({ ...prev, row: { ...prev.row, ...updated } }));
            } else {
                fetchData(fromDate, toDate);
                closeModal();
            }

            setNewRemark('');
        } catch (err) {
            toast.error(err.message || 'Network error');
        } finally {
            setSaving(false);
        }
    };

    // ── Columns ──────────────────────────────────────────────────────────────
    const columns = useMemo(() => [
        { name: 'SL No.', width: '70px', selector: (_, i) => i + 1 },
        {
            name: 'DOJ',
            width: '110px',
            selector: (r) => r.doj,
            sortable: true,
            cell: (r) => <WordWrapCell>{formatDate(r.doj)}</WordWrapCell>,
        },
        {
            name: 'Employee',
            selector: (r) => r.empName,
            sortable: true,
            cell: (r) => <WordWrapCell>{r.empName + ' (' + r.empCode + ')'}</WordWrapCell>,
        },
        {
            name: 'Mobile No.',
            width: '140px',
            cell: (r) => (
                <div className="phone-container">
                    <MdMobileFriendly className="phone-icon" color={defaultTheme.goldColorLogo} />
                    <span className="phone-number">{r.personalMobile || '—'}</span>
                </div>
            ),
        },
        {
            name: 'MT/ST',
            selector: (r) => r.mainTeam,
            sortable: true,
            cell: (r) => <WordWrapCell>{r.mainTeam + '/' + r.subTeam}</WordWrapCell>,
        },
        {
            name: 'Branch',
            width: '110px',
            selector: (r) => r.branch,
            sortable: true,
            cell: (r) => <WordWrapCell>{r.branch || '—'}</WordWrapCell>,
        },
        {
            name: 'Recruiter',
            selector: (r) => r.recruiterName,
            sortable: true,
            cell: (r) => <WordWrapCell>{r.recruiterName || '—'}</WordWrapCell>,
        },
        {
            name: 'Remarks',
            width: '95px',
            sortable: true,
            selector: (r) => countFilled(r),
            cell: (r) => <CountPill count={countFilled(r)} />,
        },
        {
            name: 'Action',
            width: '110px',
            cell: (r) => (
                <button
                    className="rf-action-btn"
                    onClick={() => openModal(r)}
                    disabled={!hrReady}
                    title={hrReady ? 'Manage remarks' : 'Loading HR list…'}
                    style={!hrReady ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                >
                    <MdEdit size={12} /> Manage
                </button>
            ),
        },
    ].map((c) => ({ ...c, name: <span className="font-weight-bold fs-13">{c.name}</span> })), [hrReady]);

    if (accessGranted === null) return <ScreenLoader />;
    if (!accessGranted) return <PermissionMissing />;

    const slot = nextSlot(modal.row);
    const allFilled = slot === null;

    return (
        <PageContent>
            <Container fluid className="rf-page">
                <Breadcrumbs title="Feedback" breadcrumbItem="Recruitment Feedback" />

                {loading && <ScreenLoader />}

                {/* ══ Filter card ══════════════════════════════════════════ */}
                <div className="rf-card">
                    <div className="rf-card-body">
                        <form onSubmit={handleApply}>
                            <Row className="align-items-end g-3">
                                <Col md="2" sm="6" xs="12">
                                    <Label className="rf-field-label">
                                        <FaCalendarAlt size={10} style={{ marginRight: 4 }} />
                                        DOJ From
                                    </Label>
                                    <input
                                        type="date"
                                        className="rf-input"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>

                                <Col md="2" sm="6" xs="12">
                                    <Label className="rf-field-label">
                                        <FaCalendarAlt size={10} style={{ marginRight: 4 }} />
                                        DOJ To
                                    </Label>
                                    <input
                                        type="date"
                                        className="rf-input"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </Col>

                                <Col md="3" sm="6" xs="12">
                                    <Label className="rf-field-label">
                                        Search by Code, Name or Branch
                                    </Label>
                                    <div className="rf-search-wrap">
                                        <FaSearch size={12} className="rf-search-icon" />
                                        <input
                                            type="text"
                                            className="rf-search-input"
                                            value={empSearch}
                                            onChange={(e) => setEmpSearch(e.target.value)}
                                            placeholder="Search by code, name or branch..."
                                        />
                                    </div>
                                </Col>

                                <Col md="2" sm="6" xs="12">
                                    <Label className="rf-field-label">&nbsp;</Label>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="rf-primary-btn"
                                            type="submit"
                                            disabled={loading}
                                        >
                                            <FaSearch size={11} /> Apply
                                        </button>

                                        <Button
                                            color="secondary"
                                            onClick={handleClearAll}
                                            disabled={loading || !hasAnyFilter}
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                </Col>

                                <Col md="3" sm="12" xs="12">
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: "12px",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        {/* Tabs */}
                                        <div className="rf-tabs">
                                            <button
                                                type="button"
                                                className={`rf-tab ${activeTab === "pending" ? "active" : ""}`}
                                                onClick={() => setActiveTab("pending")}
                                            >
                                                <FaUserCheck size={11} />
                                                Pending
                                                <span className="rf-tab-count">{tabCounts.pending}</span>
                                            </button>

                                            <button
                                                type="button"
                                                className={`rf-tab ${activeTab === "completed" ? "active inactive" : ""}`}
                                                onClick={() => setActiveTab("completed")}
                                            >
                                                <FaUserSlash size={11} />
                                                Completed
                                                <span className="rf-tab-count">{tabCounts.completed}</span>
                                            </button>
                                        </div>

                                        {/* Show Inactive Toggle */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                padding: "8px 12px",
                                                background: showInactive ? "#FEF2F2" : "#F8FAFC",
                                                border: `1px solid ${showInactive ? "#FCA5A5" : "#E2E8F0"}`,
                                                borderRadius: "10px",
                                                cursor: "pointer",
                                                minHeight: "40px",
                                            }}
                                            onClick={() => setShowInactive(!showInactive)}
                                        >
                                            <input
                                                type="checkbox"
                                                id="showInactive"
                                                checked={showInactive}
                                                onChange={(e) => setShowInactive(e.target.checked)}
                                                style={{
                                                    width: "16px",
                                                    height: "16px",
                                                    cursor: "pointer",
                                                }}
                                            />

                                            <Label
                                                htmlFor="showInactive"
                                                style={{
                                                    marginBottom: 0,
                                                    cursor: "pointer",
                                                    fontWeight: 600,
                                                    color: showInactive ? "#DC2626" : "#475569",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                Show Inactive Employees
                                            </Label>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </form>
                    </div>
                </div>

                {/* ══ Enrichment loading banner ════════════════════════════ */}
                {enriching && (
                    <div style={{
                        background: '#FEF3C7',
                        border: '1px solid #FDE68A',
                        color: '#92400E',
                        padding: '8px 14px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}>
                        ⏳ Loading remarks data for {rows.length} employee{rows.length !== 1 ? 's' : ''}…
                    </div>
                )}

                {/* ══ Table ═══════════════════════════════════════════════ */}
                <AppTable
                    progressPending={loading}
                    columns={columns}
                    data={filteredRows}
                    pagination
                    conditionalRowStyles={[
                        {
                            when: (r) => countFilled(r) === 3,
                            style: { background: '#F0FDF4' },
                        },
                        {
                            when: r => r.isActive === "NO",
                            style: { color: defaultTheme.redColor, fontWeight: 'bold' }
                        }
                    ]}
                />
            </Container>

            {/* ══ Manage Remarks Modal ═════════════════════════════════════ */}
            <Modal
                isOpen={modal.open}
                toggle={closeModal}
                centered
                backdrop="static"
                keyboard={!saving}
                size="lg"
            >
                <ModalHeader toggle={closeModal}>
                    <FaCommentDots style={{ marginRight: 8, color: defaultTheme.primary }} />
                    Manage Remarks
                    {modal.row?.empName && (
                        <span style={{ marginLeft: 10, fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                            · {modal.row.empName} ({modal.row.empCode})
                        </span>
                    )}
                    {modal.row && !isUserActive(modal.row) && (
                        <span style={{
                            marginLeft: 8,
                            fontSize: 10.5,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 10,
                            background: '#FEE2E2',
                            color: '#DC2626',
                            textTransform: 'uppercase',
                            letterSpacing: '.4px',
                        }}>
                            Inactive
                        </span>
                    )}
                </ModalHeader>

                <ModalBody>
                    {modalLoading ? (
                        <div style={{ padding: '40px 0', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                            Loading remark details…
                        </div>
                    ) : modal.row && (
                        <>
                            <EmployeeStrip row={modal.row} />

                            {/* Inactive banner — read-only mode notice */}
                            {!isUserActive(modal.row) && (
                                <div style={{
                                    background: '#FEF2F2',
                                    border: '1px solid #FECACA',
                                    borderLeft: '4px solid #DC2626',
                                    color: '#991B1B',
                                    padding: '9px 13px',
                                    borderRadius: 9,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    marginBottom: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}>
                                    🚫 This employee is inactive. Remarks are view-only — no further entries can be added.
                                </div>
                            )}

                            {/* Render remark cards — only show filled ones when inactive */}
                            {[1, 2, 3].map((n) => {
                                const hasContent = !!modal.row[`remark${n}`]?.trim?.();
                                // For inactive users, skip empty cards entirely
                                if (!isUserActive(modal.row) && !hasContent) return null;

                                return (
                                    <RemarkCard
                                        key={n}
                                        n={n}
                                        row={modal.row}
                                        slot={isUserActive(modal.row) ? slot : null}   // inactive → no editing slot
                                        newRemark={newRemark}
                                        setNewRemark={setNewRemark}
                                    />
                                );
                            })}

                            {/* Empty state — inactive employee with zero remarks */}
                            {!isUserActive(modal.row) && countFilled(modal.row) === 0 && (
                                <div style={{
                                    background: '#F8FAFC',
                                    border: '1px dashed #CBD5E1',
                                    borderRadius: 9,
                                    padding: '20px 14px',
                                    textAlign: 'center',
                                    fontSize: 12.5,
                                    color: '#64748B',
                                }}>
                                    No remarks were recorded for this employee while they were active.
                                </div>
                            )}

                            {/* Completion banner — only for active employees who filled all 3 */}
                            {isUserActive(modal.row) && allFilled && (
                                <div className="rf-locked-banner">
                                    ✓ All three remarks have been recorded for this employee. No further remarks can be added.
                                </div>
                            )}
                        </>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button
                        color="secondary"
                        onClick={closeModal}
                        disabled={saving}
                        style={{ backgroundColor: defaultTheme.goldColorLogo, border: 'none' }}
                    >
                        Close
                    </Button>
                    {/* Save button only for ACTIVE employees with unfilled slots */}
                    {isUserActive(modal.row) && !allFilled && !modalLoading && (
                        <Button
                            color="primary"
                            onClick={submitRemark}
                            disabled={saving || !newRemark.trim()}
                            style={{ backgroundColor: defaultTheme.primary, border: 'none' }}
                        >
                            {saving ? 'Saving…' : `Save Remark ${slot}`}
                        </Button>
                    )}
                </ModalFooter>
            </Modal>
        </PageContent>
    );
}