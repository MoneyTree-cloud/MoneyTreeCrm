/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Container } from 'reactstrap';
import { toast } from 'react-toastify';
import { FaHistory, FaArrowLeft, FaUser, FaClock, FaEdit, FaTrash, FaCircle } from 'react-icons/fa';
import { MdArrowForward } from 'react-icons/md';

import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient from '../../helpers/api_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { formatDateTime } from '../../helpers/function_helper';
import { GET_CANDIDATE_AUDIT_LOG } from '../../helpers/url_helper';   // ★ hr/audit/get/log

// ── Pretty field labels ─────────────────────────────────────────────────────
const FIELD_LABELS = {
    addhar: 'Aadhaar', pan: 'PAN', email: 'Email', phone: 'Phone',
    dob: 'Date of Birth', doj: 'Date of Joining',
    motherName: 'Mother Name', fatherName: 'Father Name',
    alternateNumber: 'Alternate Number',
    permanentAddress: 'Permanent Address', temporaryAddress: 'Temporary Address',
    recruiterCode: 'Recruiter Code', aiCode: 'AI Code',
    currentDesignation: 'Current Designation',
    mainTeam: 'Main Team', sTeam: 'Sub Team', subTeam: 'Sub Team',
    ctc: 'CTC', previousCompany: 'Previous Company',
    hraAmount: 'HRA Amount', hraApplicable: 'HRA Applicable',
    drivingLicense: 'Driving License',
    location: 'Location', department: 'Department',
    reportingManager: 'Reporting Manager', reportingManagerName: 'Reporting Manager',
    reportingManagerCode: 'Reporting Manager Code',
    recruitmentBy: 'Recruitment By', interviewedBy: 'Interviewed By',
    candidateName: 'Candidate Name',
    gender: 'Gender', maritalStatus: 'Marital Status',
    experience: 'Experience', qualification: 'Qualification',
    status: 'Status', remark: 'Remark',
    source: 'Source', skillSet: 'Skill Set', branch: 'Branch',
    tShirtSize: 'T-Shirt Size', bloodGroup: 'Blood Group',
    nationality: 'Nationality', religion: 'Religion',
    referredBy: 'Referred By', joiningStatus: 'Joining Status',
    offerLetterStatus: 'Offer Letter Status',
    handoverDate: 'Handover Date', handoverType: 'Handover Type',
    handoverStatus: 'Handover Status', handoverBy: 'Handover By',
    handoverRemark: 'Handover Remark',
    remarksRating: 'Remarks Rating', rating: 'Rating',
    offeredPosition: 'Offered Position', assignedDate: 'Assigned Date',
    payrollType: 'Payroll Type', salary: 'Salary',
    dojRemark1: 'DOJ Remark 1', dojRemark2: 'DOJ Remark 2', dojRemark3: 'DOJ Remark 3',
    DOJ1: 'DOJ 1', DOJ2: 'DOJ 2', DOJ3: 'DOJ 3',
    doj1: 'DOJ 1', doj2: 'DOJ 2', doj3: 'DOJ 3',
    employeeCode: 'Employee Code', empCode: 'Emp Code',
};

// Internal/noise fields we don't want to display inside array-item cards
const NOISE_FIELDS = new Set([
    'id', 'createdBy', 'createdDate', 'updatedBy', 'updatedDate',
    'active', 'isActive', 'userId', 'role',
]);

const prettifyField = (key) => {
    if (FIELD_LABELS[key]) return FIELD_LABELS[key];
    return String(key)
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
};

// ── JSON string parser ──────────────────────────────────────────────────────
const parseIfJSON = (val) => {
    if (val === null || val === undefined) return {};
    if (typeof val === 'object') return val;
    if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed) return {};
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try { return JSON.parse(trimmed); }
            catch { return {}; }
        }
        return {};
    }
    return {};
};

// Extract display text from a lookup-style object
const extractObjectName = (obj) => {
    if (!obj || typeof obj !== 'object') return null;
    const name = obj.label || obj.name || obj.sourceName || obj.title || obj.value;
    if (!name) return null;
    return obj.code ? `${name} (${obj.code})` : String(name);
};

// Simple text formatting for scalar values / lookup objects
const formatScalar = (val) => {
    if (val === null || val === undefined || val === '') return '(empty)';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'object' && !Array.isArray(val)) {
        return extractObjectName(val) || JSON.stringify(val);
    }
    return String(val);
};

// Is this an object that's just a lookup entry (label/name + maybe code)?
const isSimpleLookup = (obj) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
    return !!(obj.label || obj.name || obj.sourceName || obj.title);
};

// Deep-equal via JSON stringify
const isSameValue = (a, b) => {
    if (a === b) return true;
    if (a == null && b == null) return true;
    try { return JSON.stringify(a) === JSON.stringify(b); }
    catch { return false; }
};

const getChanges = (oldValues, newValues) => {
    const oldObj = parseIfJSON(oldValues);
    const newObj = parseIfJSON(newValues);
    if (typeof oldObj !== 'object' || typeof newObj !== 'object' ||
        Array.isArray(oldObj) || Array.isArray(newObj)) {
        return [];
    }
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
    const changes = [];
    for (const key of allKeys) {
        if (isSameValue(oldObj[key], newObj[key])) continue;
        changes.push({ field: key, oldVal: oldObj[key], newVal: newObj[key] });
    }
    return changes;
};

const getEventStyle = (eventType) => {
    const type = String(eventType || '').toUpperCase();
    const map = {
        UPDATE: { icon: FaEdit,  bg: '#DBEAFE', fg: '#1E40AF', border: '#1E40AF', label: 'Updated' },
        DELETE: { icon: FaTrash, bg: '#FEE2E2', fg: '#DC2626', border: '#DC2626', label: 'Deleted' },
    };
    return map[type] || { icon: FaCircle, bg: '#F1F5F9', fg: '#475569', border: '#94A3B8', label: type || 'Event' };
};

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ Sub-components for value rendering                                         ║
// ╚════════════════════════════════════════════════════════════════════════════╝

// Renders a complex object as a compact card with only meaningful (non-null) fields
function ObjectCard({ obj, tone = 'new' }) {
    const bg = tone === 'old' ? '#FEF2F2' : '#F0FDF4';
    const border = tone === 'old' ? '#FECACA' : '#BBF7D0';
    const labelColor = tone === 'old' ? '#991B1B' : '#166534';

    const entries = Object.entries(obj || {}).filter(([key, val]) => {
        if (NOISE_FIELDS.has(key)) return false;
        if (val === null || val === undefined || val === '') return false;
        return true;
    });

    if (entries.length === 0) {
        return (
            <span style={{
                fontSize: 11, color: '#94A3B8', fontStyle: 'italic',
                padding: '3px 8px', background: bg, border: `1px solid ${border}`,
                borderRadius: 6,
            }}>
                (empty)
            </span>
        );
    }

    return (
        <div style={{
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: 8,
            padding: '8px 10px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '4px 12px',
            fontSize: 11.5,
            maxWidth: 500,
        }}>
            {obj.id && (
                <div style={{ gridColumn: '1 / -1', fontWeight: 700, color: labelColor, fontSize: 10.5, marginBottom: 3 }}>
                    ID: {obj.id}
                </div>
            )}
            {entries.map(([key, val]) => (
                <div key={key} style={{ display: 'flex', gap: 4, minWidth: 0 }}>
                    <span style={{ color: '#64748B', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {prettifyField(key)}:
                    </span>
                    <span style={{
                        color: labelColor, fontWeight: 700,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }} title={formatScalar(val)}>
                        {formatScalar(val)}
                    </span>
                </div>
            ))}
        </div>
    );
}

// Main value renderer — decides between pill, tag list, or card
function ValueRenderer({ value, tone }) {
    const bg = tone === 'old' ? '#FEF2F2' : '#F0FDF4';
    const border = tone === 'old' ? '#FECACA' : '#BBF7D0';
    const fg = tone === 'old' ? '#991B1B' : '#166534';

    const emptyPill = (
        <span style={{
            padding: '4px 10px', background: bg, color: '#94A3B8',
            border: `1px solid ${border}`, borderRadius: 6,
            fontSize: 11.5, fontStyle: 'italic',
        }}>
            (empty)
        </span>
    );

    // Null / empty
    if (value === null || value === undefined || value === '') return emptyPill;

    // Boolean / scalar / simple lookup
    if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string' ||
        (typeof value === 'object' && !Array.isArray(value) && isSimpleLookup(value))) {
        return (
            <span style={{
                padding: '4px 10px', background: bg, color: fg,
                border: `1px solid ${border}`, borderRadius: 6,
                fontSize: 11.5, fontWeight: 700,
                wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: 1.4,
                maxWidth: 400,
            }}>
                {formatScalar(value)}
            </span>
        );
    }

    // Array
    if (Array.isArray(value)) {
        if (value.length === 0) return emptyPill;

        // Array of simple items — show as comma-separated tags
        const allSimple = value.every((it) =>
            it === null || it === undefined ||
            typeof it !== 'object' || isSimpleLookup(it)
        );
        if (allSimple) {
            return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {value.map((it, i) => (
                        <span key={i} style={{
                            padding: '3px 9px', background: bg, color: fg,
                            border: `1px solid ${border}`, borderRadius: 6,
                            fontSize: 11.5, fontWeight: 700,
                        }}>
                            {formatScalar(it)}
                        </span>
                    ))}
                </div>
            );
        }

        // Array of complex objects — render as stacked cards
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {value.map((it, i) => (
                    <ObjectCard key={i} obj={it} tone={tone} />
                ))}
            </div>
        );
    }

    // Complex single object
    if (typeof value === 'object') {
        return <ObjectCard obj={value} tone={tone} />;
    }

    return <span>{String(value)}</span>;
}

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ Main Component                                                             ║
// ╚════════════════════════════════════════════════════════════════════════════╝
export default function CandidateHistory() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    const candidateId = params.candidateId || location.state?.candidateId;
    const candidateName = location.state?.candidateName;

    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!candidateId) {
            toast.error('No candidate specified');
            return;
        }
        setIsLoading(true);
        ApiClient.get(`${GET_CANDIDATE_AUDIT_LOG}?candidateId=${candidateId}`)
            .then((response) => {
                setIsLoading(false);
                if (response?.data?.status === 1) {
                    const arr = Array.isArray(response.data.data) ? response.data.data : [];
                    // Filter OUT create events + sort newest first
                    const filtered = arr.filter((log) =>
                        String(log.action || '').toUpperCase() !== 'CREATE'
                    );
                    const sorted = [...filtered].sort((a, b) => {
                        const ta = new Date(a.changedAt || 0).getTime();
                        const tb = new Date(b.changedAt || 0).getTime();
                        return tb - ta;
                    });
                    setLogs(sorted);
                } else {
                    setLogs([]);
                    toast.error(response?.data?.message || 'Failed to load history');
                }
            })
            .catch((error) => {
                setIsLoading(false);
                setLogs([]);
                toast.error(error.message);
            });
    }, [candidateId]);

    const processedLogs = useMemo(() => {
        return logs.map((log) => ({
            ...log,
            changes: getChanges(log.oldValues, log.newValues),
            style: getEventStyle(log.eventType),
        }));
    }, [logs]);

    return (
        <PageContent>
            <Breadcrumbs title="HR" breadcrumbItem="Candidate History" />
            {isLoading && <ScreenLoader />}

            <Container fluid>
                {/* ── Header ──────────────────────────────────────────────── */}
                <div style={{
                    background: '#fff', border: '1px solid #E8ECF2', borderRadius: 14,
                    padding: '16px 22px', marginBottom: 18,
                    display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                    boxShadow: '0 1px 4px rgba(0,0,0,.04)',
                }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: '#F1F5F9', color: '#475569',
                            border: '1px solid #E2E8F0', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        title="Go back"
                    >
                        <FaArrowLeft size={13} />
                    </button>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: `linear-gradient(135deg, ${defaultTheme.primary}, #007A6E)`,
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18,
                    }}>
                        <FaHistory />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontSize: 11, fontWeight: 700, color: '#94A3B8',
                            textTransform: 'uppercase', letterSpacing: '.5px',
                        }}>
                            Change History
                        </div>
                        <div style={{
                            fontSize: 18, fontWeight: 800, color: '#0F172A',
                            lineHeight: 1.2, marginTop: 2,
                        }}>
                            {candidateName || logs[0]?.candidateName || `Candidate #${candidateId}`}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                            {processedLogs.length} {processedLogs.length === 1 ? 'update' : 'updates'} recorded
                        </div>
                    </div>
                </div>

                {/* ── Empty state ─────────────────────────────────────────── */}
                {processedLogs.length === 0 && !isLoading && (
                    <div style={{
                        background: '#fff', border: '1px dashed #CBD5E1',
                        borderRadius: 12, padding: '40px 22px',
                        textAlign: 'center', color: '#94A3B8', fontSize: 13.5,
                    }}>
                        <FaHistory size={32} color="#CBD5E1" style={{ marginBottom: 10 }} />
                        <div>No update history recorded for this candidate.</div>
                    </div>
                )}

                {/* ── Timeline ────────────────────────────────────────────── */}
                {processedLogs.length > 0 && (
                    <div style={{ position: 'relative', paddingLeft: 32 }}>
                        <div style={{
                            position: 'absolute', left: 15, top: 20, bottom: 20,
                            width: 2, background: '#E2E8F0',
                        }} />

                        {processedLogs.map((log, idx) => {
                            const StyleIcon = log.style.icon;
                            return (
                                <div key={log.id ?? idx} style={{ position: 'relative', marginBottom: 18 }}>
                                    {/* Timeline dot */}
                                    <div style={{
                                        position: 'absolute', left: -32, top: 14,
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: log.style.bg,
                                        border: `2px solid ${log.style.border}`,
                                        color: log.style.fg,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, zIndex: 2,
                                    }}>
                                        <StyleIcon />
                                    </div>

                                    {/* Event card */}
                                    <div style={{
                                        background: '#fff',
                                        border: '1px solid #E8ECF2',
                                        borderLeft: `4px solid ${log.style.border}`,
                                        borderRadius: 12, padding: '14px 18px',
                                        boxShadow: '0 1px 4px rgba(0,0,0,.04)',
                                    }}>
                                        {/* Header row */}
                                        <div style={{
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap', gap: 10,
                                            marginBottom: 10, paddingBottom: 10,
                                            borderBottom: '1px dashed #E2E8F0',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                                    padding: '3px 10px', borderRadius: 12,
                                                    fontSize: 10.5, fontWeight: 800,
                                                    textTransform: 'uppercase', letterSpacing: '.3px',
                                                    background: log.style.bg, color: log.style.fg,
                                                }}>
                                                    <StyleIcon size={9} />
                                                    {log.style.label}
                                                </span>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: 5,
                                                    fontSize: 12, color: '#475569', fontWeight: 600,
                                                }}>
                                                    <FaUser size={10} color="#94A3B8" />
                                                    {log.action || '—'}
                                                </div>
                                            </div>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: 5,
                                                fontSize: 11.5, color: '#94A3B8', fontWeight: 600,
                                            }}>
                                                <FaClock size={9} />
                                                {formatDateTime(log.changedAt)}
                                            </div>
                                        </div>

                                        {/* Changes */}
                                        {log.changes.length === 0 ? (
                                            <div style={{
                                                fontSize: 12.5, color: '#94A3B8',
                                                fontStyle: 'italic', textAlign: 'center',
                                                padding: '8px 0',
                                            }}>
                                                No field changes recorded.
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                {log.changes.map((chg, cidx) => (
                                                    <div key={cidx} style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '180px 1fr',
                                                        gap: 12, padding: '10px 0',
                                                        fontSize: 12.5, alignItems: 'start',
                                                        borderBottom: cidx < log.changes.length - 1 ? '1px solid #F1F5F9' : 'none',
                                                    }}>
                                                        <div style={{
                                                            fontWeight: 700, color: '#475569', paddingTop: 4,
                                                        }}>
                                                            {prettifyField(chg.field)}
                                                        </div>
                                                        <div style={{
                                                            display: 'flex', alignItems: 'flex-start', gap: 8,
                                                            flexWrap: 'wrap',
                                                        }}>
                                                            <ValueRenderer value={chg.oldVal} tone="old" />
                                                            <MdArrowForward size={14} color="#94A3B8" style={{ flexShrink: 0, marginTop: 6 }} />
                                                            <ValueRenderer value={chg.newVal} tone="new" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Container>
        </PageContent>
    );
}