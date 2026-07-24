/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import {
    Container, Row, Col, Label, Button,
    Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { toast } from 'react-toastify';
import { FaClock, FaCheckCircle, FaTimesCircle, FaFilePdf, FaFileAlt } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';

import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient, { imageBaseUrl } from '../../helpers/api_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { formatDateTime, WordWrapCell, RequiredStar } from '../../helpers/function_helper';
import {
    GET_SALE_ATTACHMENT_BY_STATUS,
    UPDATE_SALE_ATTACHMENT_STATUS,
} from '../../helpers/url_helper';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import { useUserStore } from '../../store/useUserStore';
import ImageModal from '../../components/Common/ImageModal';

// ── Tab definitions ─────────────────────────────────────────────────────────
const TABS = [
    { key: 'Pending', label: 'Pending', icon: FaClock, color: '#D97706', bg: '#FEF3C7' },
    { key: 'Rejected', label: 'Rejected', icon: FaTimesCircle, color: '#DC2626', bg: '#FEE2E2' },
    { key: 'Approved', label: 'Accepted', icon: FaCheckCircle, color: '#16A34A', bg: '#DCFCE7' },
];

// ── Pretty label for document type ──────────────────────────────────────────
const DOC_TYPE_LABELS = {
    bookingForm: 'Booking Form',
    approvalMail: 'Approve Mail',
    kycDocument: 'KYC Document',
    Acknowledgement: 'Acknowledgement',
    checkList: 'Check List',
    costSheet: 'Cost Sheet',
    paymentProof: 'Payment Proof',
    other: 'Other',
};

const prettyDocType = (val) => {
    if (!val) return '—';
    if (DOC_TYPE_LABELS[val]) return DOC_TYPE_LABELS[val];
    return String(val)
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
};

export default function BookingDocuments() {
    const [activeTab, setActiveTab] = useState('Pending');
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // ── Update modal state ──────────────────────────────────────────────────
    const [updateModal, setUpdateModal] = useState({ open: false, row: null });
    const [decision, setDecision] = useState(null);        // 'Approved' | 'Rejected'
    const [remarks, setRemarks] = useState('');
    const [updating, setUpdating] = useState(false);
    const [accessGranted, setAccessGranted] = useState(null);
    const { userId } = useUserStore((state) => state.user);
    const [imgSrc, setImgSrc] = useState("")
    const [modalOpen, setModalOpen] = useState(false)

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'booking-docs');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    // ── Fetch data for current tab ──────────────────────────────────────────
    const fetchData = (status) => {
        setIsLoading(true);
        ApiClient.get(`${GET_SALE_ATTACHMENT_BY_STATUS}${status}`)
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

    // Refetch on tab change
    useEffect(() => {
        if (accessGranted)
            fetchData(activeTab);
    }, [activeTab, accessGranted]);

    // ── Update modal handlers ───────────────────────────────────────────────
    const openUpdateModal = (row) => {
        setDecision(null);
        setRemarks('');
        setUpdateModal({ open: true, row });
    };

    const closeUpdateModal = () => {
        if (updating) return;
        setUpdateModal({ open: false, row: null });
        setDecision(null);
        setRemarks('');
    };

    const submitUpdate = () => {
        const row = updateModal.row;
        if (!row) return;
        if (!decision) return toast.error('Please choose Accept or Reject');
        if (decision === 'Rejected' && !remarks.trim())
            return toast.error('Please provide rejection remarks');

        if (!window.confirm(
            decision === 'Approved'
                ? 'Are you sure you want to accept this document?'
                : 'Are you sure you want to reject this document?'
        )) return;

        setUpdating(true);

        const params = new URLSearchParams({ entryStatusEnum: decision });
        if (decision === 'Rejected') {
            params.append('rejectRemarks', remarks.trim());
        }

        ApiClient.put(`${UPDATE_SALE_ATTACHMENT_STATUS}${row.id}?${params.toString()}`)
            .then((response) => {
                setUpdating(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message || `Document ${decision.toLowerCase()}`);
                    closeUpdateModal();
                    fetchData(activeTab);
                } else {
                    toast.error(response?.data?.message || 'Failed to update');
                }
            })
            .catch((error) => {
                setUpdating(false);
                toast.error(error.message || 'Network error');
            });
    };

    const handleViewFile = fileName => {
        const ext = fileName?.split(".").pop().toLowerCase()
        const url = imageBaseUrl + fileName
        if (ext === "pdf") { window.open(url, "_blank"); return }
        if (ext === "heic" || ext === "msg") {
            const a = Object.assign(document.createElement("a"), { href: url, download: fileName })
            document.body.appendChild(a); a.click(); document.body.removeChild(a)
        } else { setImgSrc(url); setModalOpen(true) }
    }

    // ── Columns ─────────────────────────────────────────────────────────────
    const columns = useMemo(() => {
        const base = [
            {
                name: 'SL No.',
                width: '80px',
                cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
            },
            {
                name: 'Employee',
                sortable: true,
                selector: (r) => r.empName,
                cell: (r) => <WordWrapCell>{r.empName + ' (' + r.empCode + ')'}</WordWrapCell>,
            },
            {
                name: 'Team',
                sortable: true,
                selector: (r) => r.mainTeam,
                cell: (r) => <WordWrapCell>{r.mainTeam + '/' + r.subTeam}</WordWrapCell>,
            },
            {
                name: 'Branch',
                sortable: true,
                selector: (r) => r.branch,
                cell: (r) => <WordWrapCell>{r.branch}</WordWrapCell>,
            },
            {
                name: 'Document Type',
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
                name: <span className="font-weight-bold fs-13">Attachment</span>,
                cell: (row) => row.attachment ? (
                    <FaFilePdf
                        size={16}
                        color={defaultTheme.goldColorLogo}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleViewFile(row.attachment)}
                        title="View attachment"
                    />
                ) : (
                    <span>—</span>
                ),
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
                            <span>No remarks</span>
                        )}
                    </WordWrapCell>
                ),
            },
            {
                name: 'Created At',
                sortable: true,
                selector: (r) => r.createdDate,
                cell: (r) => <WordWrapCell>{formatDateTime(r.createdDate)}</WordWrapCell>
            },
        ];

        // Rejected tab — show rejection remarks column
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

        // Approved tab — show statusUpdatedDate
        if (activeTab === 'Approved' || activeTab === 'Rejected') {
            base.push({
                name: `${activeTab === 'Approved' ? 'Approved' : 'Rejected'} At`,
                width: '160px',
                sortable: true,
                selector: (r) => r.statusUpdatedDate,
                cell: (r) => <WordWrapCell>{formatDateTime(r.statusUpdatedDate) || '—'}</WordWrapCell>,
            });
        }

        // Actions — only in Pending tab
        if (activeTab === 'Pending') {
            base.push({
                name: 'Action',
                width: '100px',
                cell: (r) => (
                    <button
                        onClick={() => openUpdateModal(r)}
                        title="Update status"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '5px 11px',
                            background: `${defaultTheme.primary}1A`,
                            color: defaultTheme.primary,
                            border: `1px solid ${defaultTheme.primary}40`,
                            borderRadius: 7,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        <MdEdit size={12} /> Update
                    </button>
                ),
            });
        }

        return base.map((c) => ({
            ...c,
            name: <span className="font-weight-bold fs-13">{c.name}</span>,
        }));
    }, [activeTab]);

    const row = updateModal.row;

    return (
        <PageContent>
            <Breadcrumbs title="Transaction" breadcrumbItem="Booking Docs" />
            {isLoading && <ScreenLoader />}

            <Container fluid>
                {/* ── Tabs ─────────────────────────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    background: '#E2E8F0',
                    padding: 5,
                    borderRadius: 12,
                    marginBottom: 18,
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

                {/* ── Info strip ───────────────────────────────────────────── */}
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
                            Showing <span style={{
                                color: TABS.find((t) => t.key === activeTab)?.color,
                                fontWeight: 800,
                            }}>{rows.length}</span> {activeTab.toLowerCase()} document{rows.length !== 1 ? 's' : ''}
                        </div>
                        {activeTab === 'Pending' && (
                            <div style={{ fontSize: 11, color: '#94A3B8' }}>
                                Click the Update button to approve or reject
                            </div>
                        )}
                    </div>
                )}

                {/* ── Table ────────────────────────────────────────────────── */}
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
                            <div>No {activeTab.toLowerCase()} documents.</div>
                        </div>
                    }
                />
            </Container>
            <ImageModal isOpen={modalOpen} toggle={() => setModalOpen(p => !p)} imageSrc={imgSrc} />


            {/* ══ Update Modal ═══════════════════════════════════════════════ */}
            <Modal
                isOpen={updateModal.open}
                toggle={closeUpdateModal}
                centered size="md"
                backdrop="static"
                keyboard={!updating}
            >
                <ModalHeader toggle={closeUpdateModal}>
                    <MdEdit style={{ marginRight: 8, color: defaultTheme.primary }} />
                    Update Document Status
                    {/* {row?.id && (
                        <span style={{ marginLeft: 10, fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                            · #{row.id}
                        </span>
                    )} */}
                </ModalHeader>
                <ModalBody>
                    {row && (
                        <>
                            {/* Row context */}
                            <div style={{
                                background: '#F8FAFC', border: '1px solid #E2E8F0',
                                borderRadius: 9, padding: '10px 12px', marginBottom: 14,
                                fontSize: 12, color: '#475569',
                            }}>
                                <Row className="g-2">
                                    <Col md="6">
                                        <div style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                                            Employee
                                        </div>
                                        <div style={{ fontWeight: 700, color: '#0F172A' }}>
                                            {row.empName} ({row.empCode})
                                        </div>
                                    </Col>
                                    <Col md="6">
                                        <div style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                                            Document
                                        </div>
                                        <div style={{ fontWeight: 700, color: '#0F172A' }}>
                                            {prettyDocType(row.saleAttachmentEnum)}
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            <Label className="form-label" style={{ fontSize: 12.5, fontWeight: 700 }}>
                                Decision <RequiredStar />
                            </Label>
                            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                                <button
                                    type="button"
                                    onClick={() => setDecision('Approved')}
                                    style={{
                                        flex: 1,
                                        padding: '10px 16px',
                                        fontSize: 13,
                                        fontWeight: 700,
                                        border: '1.5px solid #16A34A',
                                        borderRadius: 9,
                                        background: decision === 'Approved'
                                            ? 'linear-gradient(135deg,#16A34A,#22C55E)'
                                            : '#F8FAFC',
                                        color: decision === 'Approved' ? '#fff' : '#16A34A',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 7,
                                        transition: 'all .15s',
                                    }}
                                >
                                    <FaCheckCircle size={13} /> Accept
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDecision('Rejected')}
                                    style={{
                                        flex: 1,
                                        padding: '10px 16px',
                                        fontSize: 13,
                                        fontWeight: 700,
                                        border: '1.5px solid #DC2626',
                                        borderRadius: 9,
                                        background: decision === 'Rejected'
                                            ? 'linear-gradient(135deg,#DC2626,#EF4444)'
                                            : '#F8FAFC',
                                        color: decision === 'Rejected' ? '#fff' : '#DC2626',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 7,
                                        transition: 'all .15s',
                                    }}
                                >
                                    <FaTimesCircle size={13} /> Reject
                                </button>
                            </div>

                            {decision === 'Rejected' && (
                                <>
                                    <Label className="form-label" style={{ fontSize: 12.5, fontWeight: 700 }}>
                                        Rejection Remarks <RequiredStar />
                                        <span style={{
                                            fontSize: 10.5, color: '#94A3B8', fontWeight: 500,
                                            marginLeft: 6, textTransform: 'none',
                                        }}>
                                            Tell the associate what's wrong
                                        </span>
                                    </Label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        maxLength={500}
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Explain why this is being rejected…"
                                        style={{ borderRadius: 9, fontSize: 13 }}
                                    />
                                    <div style={{
                                        textAlign: 'right', fontSize: 10.5,
                                        color: '#94A3B8', marginTop: 3,
                                    }}>
                                        {remarks.length}/500
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="secondary" onClick={closeUpdateModal} disabled={updating}
                        style={{ backgroundColor: defaultTheme.goldColorLogo, border: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="primary" onClick={submitUpdate} disabled={updating || !decision}
                        style={{ backgroundColor: defaultTheme.primary, border: 'none' }}
                    >
                        {updating ? 'Saving…' : 'Submit'}
                    </Button>
                </ModalFooter>
            </Modal>
        </PageContent>
    );
}