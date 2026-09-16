/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, CardBody, Label, Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { FaUser, FaFilePdf, FaSearch, FaSyncAlt, FaBuilding } from 'react-icons/fa';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient, { hrImageBaseUrl } from '../../helpers/api_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { WordWrapCell, RequiredStar, formatDate } from '../../helpers/function_helper';
import { GET_REFERRAL_DATA_STATUS } from '../../helpers/url_helper';
import { useUserStore } from '../../store/useUserStore';
import { MdEmail } from 'react-icons/md';

// ── Status pill config ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
    DETAILS_SUBMITTED: { color: '#D97706', bg: '#FEF3C7', label: 'Details Submitted' },
    INTERVIEW_SCHEDULED: { color: '#1E40AF', bg: '#DBEAFE', label: 'Interview Scheduled' },
    SELECTED: { color: '#16A34A', bg: '#DCFCE7', label: 'Selected' },
    REJECTED: { color: '#DC2626', bg: '#FEE2E2', label: 'Rejected' },
    HIRED: { color: '#7C3AED', bg: '#EDE9FE', label: 'hired' },
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
// ║ Main Component                                                             ║
// ╚════════════════════════════════════════════════════════════════════════════╝
export default function ReferalCandidateStatus() {
    const monthRange = getMonthRange();

    // ── Filters ─────────────────────────────────────────────────────────────
    const [filters, setFilters] = useState({
        fromDate: monthRange.from,
        toDate: monthRange.to,
    });
    const { empCode, userName } = useUserStore(s => s.user)

    // ── Data ────────────────────────────────────────────────────────────────
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // ── Fetch data ──────────────────────────────────────────────────────────
    const fetchData = () => {
        if (!filters.fromDate || !filters.toDate) return toast.error('Please select date range');

        const params = new URLSearchParams({
            fromDate: filters.fromDate,
            toDate: filters.toDate,
            empName: userName + ' (' + empCode + ')',
        });

        setIsLoading(true);
        ApiClient.get(`${GET_REFERRAL_DATA_STATUS}?${params.toString()}`)
            .then((response) => {
                setIsLoading(false);
                if (response?.data?.status === 1) {
                    const data = response.data.data;
                    setRows(Array.isArray(data) ? data : []);
                } else {
                    setRows([]);
                    toast.error(response?.data?.message || 'Failed to load data');
                }
            })
            .catch((error) => {
                setIsLoading(false);
                setRows([]);
                toast.error(error.message);
            });
    };

    // Initial load
    useEffect(() => {
        fetchData();
    }, []);

    const handleShow = () => {
        fetchData();
    };

    const handleReset = () => {
        const range = getMonthRange();
        setFilters({
            fromDate: range.from,
            toDate: range.to,
        });
    };

    // ── Columns ─────────────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            name: 'SL No.',
            width: '80px',
            cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
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
            sortable: true,
            selector: (r) => r.status,
            cell: (r) => <StatusBadge status={r.status} />,
        },
        {
            name: "Email",
            cell: row => <div className="phone-container"><MdEmail className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{row.email}</span></div>
        },
        {
            name: <span className="font-weight-bold fs-13">Created By</span>, sortable: true, selector: r => r.createdByName,
            cell: r => <WordWrapCell>{r.createdByName + ' (' + r.createdByCode + ')'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Created At</span>, sortable: true, selector: r => r.createdAt,
            cell: r => <WordWrapCell>{formatDate(r.createdAt)}</WordWrapCell>
        },
        {
            name: 'Resume',
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
        }
    ].map((c) => ({
        ...c,
        name: <span className="font-weight-bold fs-13">{c.name}</span>,
    })), []);

    return (
        <PageContent>
            <Breadcrumbs title="HR Reports" breadcrumbItem="Referral Candidates" />
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
                                    Referral Candidates Status
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



                {/* ══ Table ══════════════════════════════════════════════════ */}
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={rows}
                    pagination
                    paginationServer
                />
            </Container>
        </PageContent>
    );
}