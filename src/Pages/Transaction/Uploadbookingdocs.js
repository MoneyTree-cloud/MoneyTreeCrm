/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Container, Row, Col, Card, CardBody, Label, Button } from 'reactstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import {
    FaClock, FaCheckCircle, FaTimesCircle,
    FaFilePdf, FaFileAlt, FaCloudUploadAlt, FaTimes,
} from 'react-icons/fa';

import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient, { imageBaseUrl } from '../../helpers/api_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { formatDateTime, WordWrapCell, RequiredStar } from '../../helpers/function_helper';
import { useUserStore } from '../../store/useUserStore';
import {
    CREATE_SALE_ATTACHMENT,
    GET_SALE_ATTACHMENT_BY_EMPLOYEE,
} from '../../helpers/url_helper';
import { USER_TYPE } from '../../constants/global';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';

// ── Document type options ───────────────────────────────────────────────────
const DOC_TYPE_OPTIONS = [
    { value: 'bookingForm', label: 'Booking Form' },
    { value: 'approvalMail', label: 'Approve Mail' },
    { value: 'kycDocument', label: 'KYC Document' },
    { value: 'Acknowledgement', label: 'Acknowledgement' },
    { value: 'checkList', label: 'Check List' },
    { value: 'costSheet', label: 'Cost Sheet' },
    { value: 'paymentProof', label: 'Payment' },
    { value: 'other', label: 'Other' },
];

const DOC_TYPE_LABEL = Object.fromEntries(
    DOC_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

const prettyDocType = (val) => {
    if (!val) return '—';
    if (DOC_TYPE_LABEL[val]) return DOC_TYPE_LABEL[val];
    return String(val)
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
};

// ── Tab config ──────────────────────────────────────────────────────────────
const TABS = [
    { key: 'Pending', label: 'Pending', icon: FaClock, color: '#D97706', bg: '#FEF3C7' },
    { key: 'Approved', label: 'Accepted', icon: FaCheckCircle, color: '#16A34A', bg: '#DCFCE7' },
    { key: 'Rejected', label: 'Rejected', icon: FaTimesCircle, color: '#DC2626', bg: '#FEE2E2' },
];

const RS_STYLES = {
    control: (b) => ({
        ...b,
        minHeight: '42px',
        borderColor: '#CBD5E1',
        borderWidth: '1.5px',
        borderRadius: '10px',
        fontSize: '13.5px',
    }),
    menuPortal: (b) => ({ ...b, zIndex: 9999 }),
};

// ── File upload zone ────────────────────────────────────────────────────────
function FileUploadZone({ file, onChange, accept = '.pdf,.png,.jpg,.jpeg' }) {
    const inputRef = useRef(null);
    return (
        <div
            onClick={() => inputRef.current?.click()}
            style={{
                border: `1.5px dashed ${file ? defaultTheme.primary : '#CBD5E1'}`,
                borderRadius: 10,
                padding: '14px 16px',
                background: file ? '#F0FDF9' : '#FAFBFC',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all .15s',
            }}
        >
            <div style={{
                width: 44, height: 44,
                borderRadius: 10,
                background: `${defaultTheme.primary}15`,
                color: defaultTheme.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                {file ? <FaFilePdf size={18} /> : <FaCloudUploadAlt size={20} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                {file ? (
                    <>
                        <div style={{
                            fontWeight: 700, fontSize: 13, color: '#0F172A',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {file.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 3 }}>
                            {(file.size / 1024).toFixed(1)} KB · Click to replace
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>
                            Click to upload or drop file here
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 3 }}>
                            PDF, JPG, or PNG · Max 10 MB
                        </div>
                    </>
                )}
            </div>
            {file && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange(null);
                        if (inputRef.current) inputRef.current.value = '';
                    }}
                    title="Remove file"
                    style={{
                        width: 32, height: 32,
                        background: 'transparent',
                        color: '#94A3B8',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        flexShrink: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEE2E2';
                        e.currentTarget.style.color = '#DC2626';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94A3B8';
                    }}
                >
                    <FaTimes size={13} />
                </button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                style={{ display: 'none' }}
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 10 * 1024 * 1024) {
                        toast.error('File too large (max 10 MB)');
                        return;
                    }
                    onChange(f);
                }}
            />
        </div>
    );
}

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ Main Component                                                             ║
// ╚════════════════════════════════════════════════════════════════════════════╝
export default function UploadBookingDocs() {
    const { empCode, role, userId } = useUserStore((s) => s.user) || {};

    // ── Upload form state ───────────────────────────────────────────────────
    const [docType, setDocType] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // ── List state ──────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState('Pending');
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [accessGranted, setAccessGranted] = useState(null);


    // ── Fetch data for current tab ──────────────────────────────────────────
    const fetchData = (status) => {
        if (!empCode) return;
        setIsLoading(true);
        ApiClient.get(`${GET_SALE_ATTACHMENT_BY_EMPLOYEE}${empCode}/${status}`)
            .then((response) => {
                setIsLoading(false);
                if (response?.data?.status === 1) {
                    setRows(Array.isArray(response.data.data) ? response.data.data : []);
                } else {
                    setRows([]);
                    toast.error(response?.data?.message || 'Failed to load');
                }
            })
            .catch((error) => {
                setIsLoading(false);
                setRows([]);
                toast.error(error.message);
            });
    };

    useEffect(() => {
        if (accessGranted) {
            fetchData(activeTab);
        }
    }, [activeTab, empCode, accessGranted]);

    // ── Upload handler ──────────────────────────────────────────────────────
    const handleUpload = (e) => {
        e?.preventDefault();
        if (!empCode) return toast.error('User not identified');
        if (!docType) return toast.error('Please select document type');
        if (!remarks.trim()) return toast.error('Please enter remarks');
        if (!file) return toast.error('Please choose a file to upload');

        setUploading(true);

        const params = new URLSearchParams({
            empCode,
            saleAttachmentEnum: docType.value,
            remarks: remarks.trim(),
        });

        const fd = new FormData();
        fd.append('file', file);

        ApiClient.post(`${CREATE_SALE_ATTACHMENT}?${params.toString()}`, fd)
            .then((response) => {
                setUploading(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message || 'Document uploaded successfully');
                    setDocType(null);
                    setRemarks('');
                    setFile(null);
                    setActiveTab('Pending');
                    fetchData('Pending');
                } else {
                    toast.error(response?.data?.message || 'Upload failed');
                }
            })
            .catch((error) => {
                setUploading(false);
                toast.error(error.message || 'Network error');
            });
    };

    const handleResetForm = () => {
        setDocType(null);
        setRemarks('');
        setFile(null);
    };

    // ── Columns ─────────────────────────────────────────────────────────────
    const columns = useMemo(() => {
        const base = [
            {
                name: 'SL No.',
                width: '80px',
                cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
            },
            {
                name: 'Document Type',
                width: '160px',
                sortable: true,
                selector: (r) => r.saleAttachmentEnum,
                cell: (r) => (
                    <WordWrapCell>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 9px',
                            background: '#F1F5F9',
                            color: '#475569',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                        }}>
                            <FaFileAlt size={9} />
                            {prettyDocType(r.saleAttachmentEnum)}
                        </div>
                    </WordWrapCell>
                ),
            },
            {
                name: 'Attachment',
                width: '110px',
                cell: (r) => r.attachment ? (
                    <a
                        href={imageBaseUrl + r.attachment}
                        target="_blank"
                        rel="noreferrer"
                        title="View / Download"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '5px 11px',
                            background: `${defaultTheme.primary}15`,
                            color: defaultTheme.primary,
                            border: `1px solid ${defaultTheme.primary}40`,
                            borderRadius: 7,
                            fontSize: 11,
                            fontWeight: 700,
                            textDecoration: 'none',
                        }}
                    >
                        <FaFilePdf size={11} /> View
                    </a>
                ) : <span style={{ color: '#94A3B8' }}>—</span>,
            },
            {
                name: 'Remarks',
                grow: 1.5,
                selector: (r) => r.remarks,
                cell: (r) => (
                    <WordWrapCell>
                        {r.remarks ? (
                            <div style={{
                                background: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                borderLeft: `3px solid ${defaultTheme.primary}`,
                                color: '#334155',
                                padding: '6px 10px',
                                borderRadius: 6,
                                fontSize: 11.5,
                                fontWeight: 600,
                                lineHeight: 1.4,
                                maxWidth: 260,
                            }} title={r.remarks}>
                                {r.remarks}
                            </div>
                        ) : (
                            <span style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: 11.5 }}>
                                No remarks
                            </span>
                        )}
                    </WordWrapCell>
                ),
            },
            {
                name: 'Uploaded At',
                width: '170px',
                sortable: true,
                selector: (r) => r.createdDate,
                cell: (r) => <WordWrapCell>{formatDateTime(r.createdDate) || '—'}</WordWrapCell>,
            },
        ];

        if (activeTab === 'Rejected') {
            base.push({
                name: 'Rejection Remarks',
                grow: 2,
                selector: (r) => r.rejectRemarks,
                cell: (r) => (
                    <WordWrapCell>
                        <div style={{
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderLeft: '3px solid #DC2626',
                            color: '#991B1B',
                            padding: '6px 10px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 600,
                            lineHeight: 1.4,
                        }}>
                            {r.rejectRemarks || <em style={{ color: '#94A3B8', fontStyle: 'italic' }}>No remarks</em>}
                        </div>
                    </WordWrapCell>
                ),
            });
        }

        if (activeTab === 'Approved' || activeTab === 'Rejected') {
            base.push({
                name: `${activeTab} At`,
                width: '170px',
                sortable: true,
                selector: (r) => r.statusUpdatedDate,
                cell: (r) => <WordWrapCell>{formatDateTime(r.statusUpdatedDate) || '—'}</WordWrapCell>,
            });
        }

        return base.map((c) => ({
            ...c,
            name: <span className="font-weight-bold fs-13">{c.name}</span>,
        }));
    }, [activeTab]);

    useEffect(() => {
        const checkAccess = async () => {
            if (role !== USER_TYPE.ASSOCIATE) {
                const hasAccess = await CheckUserAccess(userId, "upload-booking-docs");
                setAccessGranted(hasAccess);
            } else {
                setAccessGranted(true);
            }
        };
        checkAccess();
    }, [userId, role]);


    if (accessGranted === null) return <ScreenLoader />;
    if (!accessGranted) return <PermissionMissing />;


    return (
        <PageContent>
            <Breadcrumbs title="Transaction" breadcrumbItem="Upload Booking Docs" />
            {(isLoading || uploading) && <ScreenLoader />}

            <Container fluid>
                {/* ══ Upload Card ═════════════════════════════════════════ */}
                <Card>
                    <CardBody>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 16,
                            paddingBottom: 12,
                            borderBottom: '1px dashed #E2E8F0',
                        }}>
                            <div style={{
                                width: 40, height: 40,
                                borderRadius: 10,
                                background: `linear-gradient(135deg, ${defaultTheme.primary}, #007A6E)`,
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 16,
                            }}>
                                <FaCloudUploadAlt />
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                                    Upload a Booking Document
                                </div>
                                <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                                    Choose the document type, add remarks, then attach your file
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleUpload}>
                            <Row className="g-3">
                                {/* Row 1: Document Type + Remarks textarea */}
                                <Col md="4">
                                    <Label className="form-label">
                                        Document Type <RequiredStar />
                                    </Label>
                                    <Select
                                        value={docType}
                                        onChange={setDocType}
                                        options={DOC_TYPE_OPTIONS}
                                        isClearable
                                        placeholder="Select type…"
                                        styles={RS_STYLES}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="8">
                                    <Label className="form-label">
                                        Remarks <RequiredStar />
                                    </Label>
                                    <textarea
                                        className="form-control"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Any additional info about this document…"
                                        maxLength={500}
                                        rows={3}
                                        style={{ resize: 'vertical', minHeight: 80 }}
                                    />
                                    <div style={{
                                        textAlign: 'right', fontSize: 10.5,
                                        color: '#94A3B8', marginTop: 3, fontWeight: 600,
                                    }}>
                                        {remarks.length}/500
                                    </div>
                                </Col>

                                {/* Row 2: Attachment + Buttons on same line */}
                                <Col md="8">
                                    <Label className="form-label">
                                        Attachment <RequiredStar />
                                    </Label>
                                    <FileUploadZone file={file} onChange={setFile} />
                                </Col>
                                <Col md="4" className="d-flex flex-column justify-content-end">
                                    <Label className="form-label" style={{ visibility: 'hidden' }}>
                                        Actions
                                    </Label>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <Button
                                            color="primary" type="submit" disabled={uploading}
                                        >
                                            {uploading ? 'Uploading…' : 'Upload'}
                                        </Button>
                                        <Button
                                            color="secondary"
                                            type="button"
                                            onClick={handleResetForm}
                                            disabled={uploading}
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                {/* ══ Tabs ═════════════════════════════════════════════════ */}
                <div style={{
                    display: 'flex',
                    background: '#E2E8F0',
                    padding: 5,
                    borderRadius: 12,
                    marginBottom: 14,
                    gap: 4,
                    flexWrap: 'wrap',
                }}>
                    {TABS.map((tab) => {
                        const active = activeTab === tab.key;
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    minWidth: 130,
                                    padding: '11px 20px',
                                    fontSize: 13.5,
                                    fontWeight: 700,
                                    border: 'none',
                                    borderRadius: 9,
                                    background: active ? '#fff' : 'transparent',
                                    color: active ? tab.color : '#64748B',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    boxShadow: active ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 7,
                                    transition: 'all .15s',
                                }}
                            >
                                <TabIcon size={12} /> {tab.label}
                                {active && rows.length > 0 && (
                                    <span style={{
                                        background: tab.bg,
                                        color: tab.color,
                                        padding: '1px 8px',
                                        borderRadius: 10,
                                        fontSize: 11,
                                        fontWeight: 800,
                                        marginLeft: 4,
                                    }}>
                                        {rows.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ══ Info strip ═══════════════════════════════════════════ */}
                {rows.length > 0 && (
                    <div style={{
                        background: '#fff',
                        border: '1px solid #E8ECF2',
                        borderRadius: 10,
                        padding: '10px 14px',
                        marginBottom: 12,
                        fontSize: 12.5,
                        color: '#475569',
                        fontWeight: 600,
                    }}>
                        You have{' '}
                        <span style={{
                            color: TABS.find((t) => t.key === activeTab)?.color,
                            fontWeight: 800,
                        }}>
                            {rows.length}
                        </span>{' '}
                        {activeTab.toLowerCase()} document{rows.length !== 1 ? 's' : ''}
                    </div>
                )}

                {/* ══ Table ════════════════════════════════════════════════ */}
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={rows}
                    pagination
                    noDataComponent={
                        <div style={{
                            padding: '40px 20px',
                            textAlign: 'center',
                            color: '#94A3B8',
                            fontSize: 13,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 10,
                        }}>
                            {(() => {
                                const t = TABS.find((tab) => tab.key === activeTab);
                                const TabIcon = t?.icon || FaFileAlt;
                                return <TabIcon size={32} color="#CBD5E1" />;
                            })()}
                            <div>No {activeTab.toLowerCase()} documents uploaded yet.</div>
                            {activeTab === 'Pending' && (
                                <div style={{ fontSize: 11.5, color: '#CBD5E1' }}>
                                    Upload a document above to get started.
                                </div>
                            )}
                        </div>
                    }
                />
            </Container>
        </PageContent>
    );
}