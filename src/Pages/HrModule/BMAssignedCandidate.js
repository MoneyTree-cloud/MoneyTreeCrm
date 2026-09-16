/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import {
    Container, Row, Col, Card, CardBody, Label, Button,
    Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { toast } from 'react-toastify';
import {
    FaUser, FaCalendarAlt, FaFilePdf, FaClipboardList,
    FaUserTie,
    FaSearch, FaSyncAlt, FaCommentDots, FaLock,
    FaGraduationCap, FaBriefcase, FaBuilding,
} from 'react-icons/fa';

import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient, { hrImageBaseUrl } from '../../helpers/api_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { WordWrapCell, RequiredStar, formatDate } from '../../helpers/function_helper';
import { GET_BRANCH_WISE_ASSIGNED_CANDIDATE, SUBMIT_CANDIDATE_REMARKS } from '../../helpers/url_helper';
import { useUserStore } from '../../store/useUserStore';

// ── Status pill config ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
    DETAILS_SUBMITTED: { color: '#D97706', bg: '#FEF3C7', label: 'Details Submitted' },
    INTERVIEW_SCHEDULED: { color: '#1E40AF', bg: '#DBEAFE', label: 'Interview Scheduled' },
    SELECTED: { color: '#16A34A', bg: '#DCFCE7', label: 'Selected' },
    REJECTED: { color: '#DC2626', bg: '#FEE2E2', label: 'Rejected' },
    ONBOARDED: { color: '#7C3AED', bg: '#EDE9FE', label: 'Onboarded' },
    PENDING: { color: '#64748B', bg: '#F1F5F9', label: 'Pending' },
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const getMonthRange = () => {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const fmt = (d) => d.toISOString().split('T')[0];
    return { from: fmt(first), to: fmt(last) };
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || { color: '#475569', bg: '#F1F5F9', label: status || '—' };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 9px', borderRadius: 10,
            fontSize: 10.5, fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '.3px',
            background: cfg.bg, color: cfg.color,
        }}>
            {cfg.label}
        </span>
    );
}

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ Remarks Modal                                                              ║
// ╚════════════════════════════════════════════════════════════════════════════╝
function RemarksModal({ isOpen, toggle, candidate, onSuccess, branchHeadName }) {
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) setRemarks('');
    }, [isOpen]);

    const handleSubmit = () => {
        if (!remarks.trim()) return toast.error('Please enter remarks');
        if (remarks.trim().length < 5) return toast.error('Remarks too short (min 5 chars)');

        if (!window.confirm(`Save remarks for ${candidate?.firstName}?`)) return;

        setSubmitting(true);

        ApiClient.post(`${SUBMIT_CANDIDATE_REMARKS}?candidateId=${candidate?.id}&remarks=${remarks.trim()}&branchHeadName=${branchHeadName}`)
            .then((response) => {
                setSubmitting(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message || 'Remarks saved successfully');
                    onSuccess(candidate.id, remarks.trim());
                    toggle();
                } else {
                    toast.error(response?.data?.message || 'Failed to save remarks');
                }
            })
            .catch((error) => {
                setSubmitting(false);
                toast.error(error.message || 'Network error');
            });
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size="md" backdrop="static" keyboard={!submitting}>
            <ModalHeader toggle={submitting ? null : toggle}>
                <FaCommentDots style={{ marginRight: 8, color: defaultTheme.primary }} />
                Add Remarks
            </ModalHeader>
            <ModalBody>
                {candidate && (
                    <>
                        {/* Candidate info */}
                        <div style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: 9,
                            padding: '10px 12px',
                            marginBottom: 14,
                        }}>
                            <div style={{
                                fontSize: 10.5, color: '#94A3B8', fontWeight: 700,
                                textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 3,
                            }}>
                                Candidate
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: `${defaultTheme.primary}15`, color: defaultTheme.primary,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <FaUser size={12} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 14 }}>
                                        {candidate.firstName}
                                    </div>
                                    <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                                        ID: {candidate.id}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Label className="form-label" style={{ fontSize: 13, fontWeight: 700 }}>
                            Remarks <RequiredStar />
                            <span style={{
                                fontSize: 10.5, color: '#94A3B8', fontWeight: 500,
                                marginLeft: 6, textTransform: 'none',
                            }}>
                                Once saved, this cannot be edited
                            </span>
                        </Label>
                        <textarea
                            className="form-control"
                            rows={4}
                            maxLength={500}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter your remarks about this candidate…"
                            style={{ borderRadius: 9, fontSize: 13 }}
                            autoFocus
                        />
                        <div style={{
                            textAlign: 'right', fontSize: 10.5,
                            color: '#94A3B8', marginTop: 3, fontWeight: 600,
                        }}>
                            {remarks.length}/500
                        </div>

                        {/* Warning strip */}
                        <div style={{
                            background: '#FEF3C7',
                            border: '1px solid #FCD34D',
                            borderRadius: 8,
                            padding: '8px 11px',
                            marginTop: 12,
                            fontSize: 11.5,
                            color: '#92400E',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                        }}>
                            <FaLock size={11} />
                            <span>Remarks lock after submission — you cannot edit them later.</span>
                        </div>
                    </>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle} disabled={submitting}
                    style={{ backgroundColor: defaultTheme.goldColorLogo, border: 'none' }}>
                    Cancel
                </Button>
                <Button color="primary" onClick={handleSubmit} disabled={submitting}
                    style={{ backgroundColor: defaultTheme.primary, border: 'none' }}>
                    {submitting ? 'Saving…' : 'Save Remarks'}
                </Button>
            </ModalFooter>
        </Modal>
    );
}

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ Main Component                                                             ║
// ╚════════════════════════════════════════════════════════════════════════════╝
export default function BMAssignedCandidate() {
    const monthRange = getMonthRange();

    // ── Filters ─────────────────────────────────────────────────────────────
    const [filters, setFilters] = useState({
        fromDate: monthRange.from,
        toDate: monthRange.to,
        branch: null,
    });
    const { locationName, empCode, userName } = useUserStore(s => s.user)

    // ── Data ────────────────────────────────────────────────────────────────
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    // ── Pagination ──────────────────────────────────────────────────────────
    const [page, setPage] = useState(1);
    const [pageSize] = useState(100);

    // ── Remarks modal ───────────────────────────────────────────────────────
    const [remarksModal, setRemarksModal] = useState({ open: false, candidate: null });

    // ── Fetch data ──────────────────────────────────────────────────────────
    const fetchData = (pageNum = 1) => {
        if (!filters.fromDate || !filters.toDate) return toast.error('Please select date range');

        const offset = pageNum - 1;
        const params = new URLSearchParams({
            fromDate: filters.fromDate,
            toDate: filters.toDate,
            branch: locationName === 'Ghaziabad' ? 'Noida 63' : locationName,
            offset,
            limit: pageSize,
        });

        setIsLoading(true);
        ApiClient.get(`${GET_BRANCH_WISE_ASSIGNED_CANDIDATE}?${params.toString()}`)
            .then((response) => {
                setIsLoading(false);
                if (response?.data?.status === 1) {
                    const data = response.data.data;
                    setRows(Array.isArray(data?.content) ? data.content : []);
                    setTotalElements(data?.totalElements || 0);
                } else {
                    setRows([]);
                    setTotalElements(0);
                    toast.error(response?.data?.message || 'Failed to load data');
                }
            })
            .catch((error) => {
                setIsLoading(false);
                setRows([]);
                setTotalElements(0);
                toast.error(error.message);
            });
    };

    // Initial load
    useEffect(() => {
        fetchData(1);
    }, []);

    const handleShow = () => {
        setPage(1);
        fetchData(1);
    };

    const handleReset = () => {
        const range = getMonthRange();
        setFilters({
            fromDate: range.from,
            toDate: range.to,
            branch: null,
        });
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchData(newPage);
    };

    // Update remarks in local row without full refetch
    const handleRemarksSuccess = (candidateId, branchHeadRemarks) => {
        setRows((prev) => prev.map((r) =>
            r.id === candidateId ? { ...r, branchHeadRemarks } : r
        ));
    };

    // ── Columns ─────────────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            name: 'SL No.',
            width: '80px',
            cell: (_, i) => <WordWrapCell>{(page - 1) * pageSize + i + 1}</WordWrapCell>,
        },
        {
            name: 'Candidate',
            sortable: true,
            selector: (r) => r.firstName,
            cell: (r) => (
                <WordWrapCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: `${defaultTheme.primary}15`, color: defaultTheme.primary,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, flexShrink: 0,
                        }}>
                            <FaUser size={11} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: '#0F172A' }}>
                                {r.firstName || '—'}
                            </div>
                            <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 1 }}>
                                ID: {r.id}
                            </div>
                        </div>
                    </div>
                </WordWrapCell>
            ),
        },
        {
            name: 'Status',
            width: '160px',
            sortable: true,
            selector: (r) => r.status,
            cell: (r) => <StatusBadge status={r.status} />,
        },
        {
            name: 'Type',
            width: '110px',
            cell: (r) => (
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 8px', borderRadius: 6, fontSize: 10.5, fontWeight: 700,
                    background: r.fresher ? '#DBEAFE' : '#FEE2E2',
                    color: r.fresher ? '#1E40AF' : '#DC2626',
                }}>
                    {r.fresher ? <FaGraduationCap size={9} /> : <FaBriefcase size={9} />}
                    {r.fresher ? 'Fresher' : 'Experienced'}
                </span>
            ),
        },
        {
            name: 'Team',
            width: '130px',
            sortable: true,
            selector: (r) => r.mainTeam,
            cell: (r) => (
                <WordWrapCell>
                    <div>{r.mainTeam || '—'}</div>
                    <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 1 }}>
                        {r.subTeam}
                    </div>
                </WordWrapCell>
            ),
        },
        {
            name: 'Resume',
            width: '100px',
            cell: (r) => {
                const resume = r.documents?.find((d) => d.documentType === 'RESUME');
                return resume ? (
                    <a href={hrImageBaseUrl + resume.filePath} target="_blank" rel="noreferrer"
                        title="View Resume"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px',
                            background: `${defaultTheme.primary}15`,
                            color: defaultTheme.primary,
                            border: `1px solid ${defaultTheme.primary}40`,
                            borderRadius: 6, fontSize: 10.5, fontWeight: 700,
                            textDecoration: 'none',
                        }}>
                        <FaFilePdf size={10} /> Resume
                    </a>
                ) : <span style={{ color: '#94A3B8' }}>—</span>;
            },
        },
        {
            name: 'Interview',
            grow: 2,
            cell: (r) => {
                const iv = r.interviews?.[0];
                if (!iv) return <span style={{ color: '#94A3B8' }}>—</span>;
                return (
                    <WordWrapCell>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: '#0F172A' }}>
                            <FaCalendarAlt size={9} color={defaultTheme.primary}
                                style={{ marginRight: 4 }} />
                            {formatDate(iv.scheduledAtDate)} · {iv.scheduledAtTime?.slice(0, 5)}-{iv.scheduledToTime?.slice(0, 5)}
                        </div>
                        <div style={{ fontSize: 10.5, color: '#64748B', marginTop: 2 }}>
                            <FaUserTie size={9} style={{ marginRight: 4 }} />
                            {iv.interviewer?.name || '—'}
                            {iv.interviewType && (
                                <span style={{
                                    marginLeft: 6, padding: '1px 6px',
                                    background: '#F1F5F9', color: '#475569',
                                    borderRadius: 4, fontSize: 9.5, fontWeight: 700,
                                }}>
                                    {iv.interviewType.replace(/_/g, ' ')}
                                </span>
                            )}
                        </div>
                    </WordWrapCell>
                );
            },
        },
        {
            name: 'Remarks',
            grow: 1.5,
            cell: (r) => {
                const hasRemarks = r.branchHeadRemarks && r.branchHeadRemarks.trim();
                if (hasRemarks) {
                    // ★ Read-only display when remarks already exist
                    return (
                        <WordWrapCell>
                            <div style={{
                                background: '#F0FDF4',
                                border: '1px solid #BBF7D0',
                                borderLeft: '3px solid #16A34A',
                                color: '#166534',
                                padding: '5px 9px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 600,
                                lineHeight: 1.4,
                                maxWidth: 240,
                            }} title={r.branchHeadRemarks}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    fontSize: 9, textTransform: 'uppercase',
                                    letterSpacing: '.3px', marginBottom: 3, opacity: .8,
                                }}>
                                    {/* <FaLock size={8} /> Locked */}
                                </div>
                                {r.branchHeadRemarks}
                            </div>
                        </WordWrapCell>
                    );
                }
                // ★ Add remarks button when no remarks yet
                return (
                    <button
                        onClick={() => setRemarksModal({ open: true, candidate: r })}
                        title="Add remarks"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '5px 11px',
                            background: `${defaultTheme.primary}1A`,
                            color: defaultTheme.primary,
                            border: `1px solid ${defaultTheme.primary}40`,
                            borderRadius: 7,
                            fontSize: 11, fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'background .15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = `${defaultTheme.primary}25`}
                        onMouseLeave={(e) => e.currentTarget.style.background = `${defaultTheme.primary}1A`}
                    >
                        <FaCommentDots size={10} /> Add Remarks
                    </button>
                );
            },
        },
    ].map((c) => ({
        ...c,
        name: <span className="font-weight-bold fs-13">{c.name}</span>,
    })), [page, pageSize]);

    return (
        <PageContent>
            <Breadcrumbs title="HR Reports" breadcrumbItem="Branch Assigned Candidates" />
            {isLoading && <ScreenLoader />}

            <Container fluid>
                {/* ══ Filters Card ═══════════════════════════════════════════ */}
                <Card>
                    <CardBody>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            marginBottom: 14, paddingBottom: 10,
                            borderBottom: '1px dashed #E2E8F0',
                        }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: `linear-gradient(135deg, ${defaultTheme.primary}, #007A6E)`,
                                color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 14,
                            }}>
                                <FaBuilding />
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                                    Branch-wise Assigned Candidates
                                </div>
                            </div>
                        </div>

                        <Row className="g-3 align-items-end">
                            <Col md="3">
                                <Label className="form-label">
                                    From Date <RequiredStar />
                                </Label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filters.fromDate}
                                    onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))}
                                    style={{ borderRadius: 9, height: 40 }}
                                />
                            </Col>
                            <Col md="3">
                                <Label className="form-label">
                                    To Date <RequiredStar />
                                </Label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filters.toDate}
                                    onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))}
                                    style={{ borderRadius: 9, height: 40 }}
                                />
                            </Col>
                            <Col md="3">
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Button
                                        color="primary" onClick={handleShow} disabled={isLoading}
                                        style={{
                                            backgroundColor: defaultTheme.primary, border: 'none',
                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                            padding: '9px 16px',
                                        }}>
                                        <FaSearch size={11} /> Show
                                    </Button>
                                    <Button
                                        color="secondary" onClick={handleReset} disabled={isLoading}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                            padding: '9px 16px',
                                        }}>
                                        <FaSyncAlt size={11} /> Reset
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                {/* ══ Info strip ═════════════════════════════════════════════ */}
                {rows.length > 0 && (
                    <div style={{
                        background: '#fff',
                        border: '1px solid #E8ECF2',
                        borderRadius: 10,
                        padding: '10px 14px',
                        marginBottom: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 8,
                        fontSize: 12.5,
                        color: '#475569',
                        fontWeight: 600,
                    }}>
                        <div>
                            Total candidates found:{' '}
                            <span style={{ color: defaultTheme.primary, fontWeight: 800 }}>
                                {totalElements}
                            </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>
                            <FaClipboardList size={10} style={{ marginRight: 4 }} />
                            Click "Add Remarks" to submit feedback (one-time only)
                        </div>
                    </div>
                )}

                {/* ══ Table ══════════════════════════════════════════════════ */}
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={rows}
                    pagination
                    paginationServer
                    paginationTotalRows={totalElements}
                    paginationPerPage={pageSize}
                    onChangePage={handlePageChange}
                    noDataComponent={
                        <div style={{
                            padding: '40px 20px', textAlign: 'center',
                            color: '#94A3B8', fontSize: 13,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: 10,
                        }}>
                            <FaClipboardList size={32} color="#CBD5E1" />
                            <div>No candidates found for selected filters.</div>
                        </div>
                    }
                />
            </Container>

            {/* ══ Remarks Modal ══════════════════════════════════════════════ */}
            <RemarksModal
                isOpen={remarksModal.open}
                toggle={() => setRemarksModal({ open: false, candidate: null })}
                candidate={remarksModal.candidate}
                onSuccess={handleRemarksSuccess}
                branchHeadName={userName + ' (' + empCode + ')'}
            />
        </PageContent>
    );
}