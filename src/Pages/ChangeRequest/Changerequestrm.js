/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState, useEffect } from 'react';
import { Container, Row, Col, Label, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaEye, FaFile, FaHistory } from 'react-icons/fa';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import { useGet } from '../../Hooks/useApi';
import ApiClient, { imageBaseUrl } from '../../helpers/api_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { daysBetween, formatDateTime, formatDuration, getCompletedDate, getInProcessDate, RequiredStar, WordWrapCell } from '../../helpers/function_helper';
import { GET_CHANGE_REQUESTS_BY_RM, UPDATE_CHANGE_REQUEST_STATUS_HOD } from '../../helpers/url_helper';
import './Changerequest.css';
import { useUserStore } from '../../store/useUserStore';
import DOMPurify from "dompurify";

const isStatus = (row, s) => String(row?.modificationStatus || '').toLowerCase() === s;

// ── Sub-components ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    if (!status || status === 'na') return <span className="cr-badge na">—</span>;
    const map = {
        pending: ['pending', 'Pending'], approved: ['approved', 'Approved'], rejected: ['rejected', 'Rejected'],
        'in-process': ['in-process', 'In Process'], inprocess: ['in-process', 'In Process'],
        uat: ['uat', 'UAT'], 'go-live': ['go-live', 'Go Live'], golive: ['go-live', 'Go Live'],
        reject: ['rejected', 'Reject'],
        live: ['live', 'LIVE'],

    };
    const [cls, label] = map[String(status).toLowerCase()] || ['pending', status];
    return <span className={`cr-badge ${cls}`}>{label}</span>;
}

function PriorityChip({ value }) {
    if (!value) return <span style={{ color: '#94A3B8' }}>—</span>;
    return <span className={`cr-priority ${String(value).toLowerCase()}`}>{value}</span>;
}

function StageTimeline({ row }) {
    const hodApproved = row.rmApproveStatus === 'APPROVED';
    const hodRejected = row.rmApproveStatus === 'REJECTED';
    const hodDone = hodApproved || hodRejected;
    const fs = (row.modificationStatus || '').toLowerCase();
    const finalDone = ['go-live', 'reject'].includes(fs);
    return (
        <div className="cr-stages">
            <div className="cr-stage done"><div className="cr-stage-label">Submitted</div><div className="cr-stage-value">{row.createdDate ? formatDateTime(row.createdDate) : '—'}</div></div>
            <div
                className={`cr-stage ${hodRejected ? 'rejected' : hodDone ? 'done' : 'active'
                    }`}
            >
                <div className="cr-stage-label">HOD Review</div>

                <div className="cr-stage-value">
                    {hodApproved && (
                        <>
                            <div>Approved</div>
                            {row.approveTime && (
                                <small>{formatDateTime(row.approveTime)}</small>
                            )}
                        </>
                    )}

                    {hodRejected && (
                        <>
                            <div>Rejected</div>
                            {row.rejectTime && (
                                <small>{formatDateTime(row.rejectTime)}</small>
                            )}
                        </>
                    )}

                    {!hodDone && 'New'}
                </div>
            </div>
            <div className={`cr-stage ${finalDone ? 'done' : hodApproved && !finalDone ? 'active' : ''}`}><div className="cr-stage-label">IT Working</div><div className="cr-stage-value">{fs ? fs.replace('-', ' ') : 'Pending'}</div></div>
        </div>
    );
}

function StatusHistory({ histories }) {
    if (!Array.isArray(histories) || !histories.length)
        return <div className="cr-history-list" style={{ textAlign: 'center', color: '#94A3B8' }}>No history yet.</div>;
    return (
        <div className="cr-history-list">
            {[...histories]?.map((h, i) => (
                <div key={i} className="cr-history-item">
                    <div className="cr-history-item-status"><StatusBadge status={h.dropdownValue} /></div>
                    <div className="cr-history-item-by">{h.updatedByEmpCode || '—'}</div>
                    <div className="cr-history-item-date">{h.updatedDate ? formatDateTime(h.updatedDate) : ''}</div>
                </div>
            ))}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// RM screen — approve/reject the requests assigned to them
// ════════════════════════════════════════════════════════════════════════════
export default function ChangeRequestRM() {
    const [modal, setModal] = useState({ open: false, kind: null, row: null });
    const [updateState, setUpdateState] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const userId = useUserStore((state) => state.user.userId);
    const [activeTab, setActiveTab] = useState('PENDING');

    const { data: listData, isLoading: listLoading, refetch } = useGet(
        `${GET_CHANGE_REQUESTS_BY_RM}&isAssignedToHOD=${activeTab === 'PENDING'}&rmId=${userId}`
    );
    const requests = useMemo(() => Array.isArray(listData?.data?.data?.content) ? listData?.data?.data?.content : [], [listData]);

    useEffect(() => {
        if (!modal.open || !modal.row) return;
        if (modal.kind === 'HOD') setUpdateState({ rmApproveStatus: null, rmRejectRemarks: '' });
        else setUpdateState({});
    }, [modal.kind, modal.row?.id, modal.open]);

    const closeModal = () => { if (!submitting) { setModal({ open: false, kind: null, row: null }); setUpdateState({}); } };

    const submitDecision = async () => {
        const row = modal.row;
        if (!updateState.rmApproveStatus) return toast.error('Choose Approve or Reject');
        if (updateState.rmApproveStatus === 'REJECTED' && !updateState.rmRejectRemarks?.trim())
            return toast.error('Please provide rejection remarks');
        if (!window.confirm('Submit your decision?')) return;
        setSubmitting(true);
        try {
            const params = new URLSearchParams({ rmApproveStatus: updateState.rmApproveStatus });
            if (updateState.rmRejectRemarks?.trim())
                params.append('rmRejectRemarks', updateState.rmRejectRemarks.trim());
            const resp = await ApiClient.put(`${UPDATE_CHANGE_REQUEST_STATUS_HOD}/${row.id}?${params.toString()}`);
            if (resp?.data?.status === 1) { toast.success(resp.data.message || 'Decision recorded'); refetch(); closeModal(); }
            else toast.error(resp?.data?.message || 'Failed');
        } catch (err) { toast.error(err.message || 'Network error'); }
        finally { setSubmitting(false); }
    };

    const columns = useMemo(() => [
        {
            name: 'SL No.',
            width: '70px',
            cell: (r, i) => <WordWrapCell>{i + 1}</WordWrapCell>
        },
        {
            name: 'Created At',
            width: '145px',
            sortable: true,
            selector: (r) => r.createdDate,
            cell: (r) => <WordWrapCell>{formatDateTime(r.createdDate)}</WordWrapCell>
        },
        {
            name: 'Priority',
            width: '100px',
            sortable: true,
            selector: (r) => r.priority,
            cell: (r) => <PriorityChip value={r.priority} />
        },
        {
            name: 'Application',
            width: '100px',
            sortable: true,
            selector: (r) => r.application,
            cell: (r) => <WordWrapCell>{r.application || '—'}</WordWrapCell>
        },
        {
            name: 'Type',
            width: '100px',
            sortable: true,
            selector: (r) => r.typeOfChange,
            cell: (r) => <WordWrapCell>{r.typeOfChange || '—'}</WordWrapCell>
        },
        {
            name: 'Description',
            width: '280px',
            sortable: true,
            selector: (r) => r.descriptionDetails,
            cell: (r) => {
                const t = r.descriptionDetails || '';
                if (!t) return <span style={{ color: '#94A3B8' }}>—</span>;

                const long = t.length > 80;

                return (
                    <div
                        onClick={long ? () => setModal({ open: true, kind: 'VIEW', row: r }) : undefined}
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: 12.5,
                            lineHeight: 1.4,
                            color: long ? defaultTheme.primary : '#0F172A',
                            cursor: long ? 'pointer' : 'default',
                            textDecoration: long ? 'underline' : 'none',
                            textDecorationStyle: 'dotted',
                            textDecorationColor: 'rgba(0,91,82,.3)',
                            textUnderlineOffset: 3
                        }}
                        title={long ? 'Click to view full description' : ''}
                    >
                        {t}
                    </div>
                );
            }
        },
        {
            name: 'Requested By',
            width: '170px',
            sortable: true,
            selector: (r) => r.createdBy,
            cell: (r) => <WordWrapCell>{r.createdBy}</WordWrapCell>
        },
        {
            name: 'HOD/RM Status',
            width: '140px',
            sortable: true,
            selector: (r) => r.rmApproveStatus,
            cell: (r) => <StatusBadge status={r.rmApproveStatus === null ? 'New' : r.rmApproveStatus} />
        },
        {
            name: 'Running Status',
            width: '160px',
            sortable: true,
            selector: (r) => r.modificationStatus,
            cell: (r) => {
                const hist =
                    Array.isArray(r.dropdownUpdateHistories) &&
                    r.dropdownUpdateHistories.length > 0;

                return (
                    <div className="cr-status-cell">
                        <StatusBadge status={r.modificationStatus} />
                        {hist && (
                            <button
                                className="cr-status-history-btn"
                                title="View status history"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setModal({ open: true, kind: 'HISTORY', row: r });
                                }}
                            >
                                <FaHistory size={11} />
                            </button>
                        )}
                    </div>
                );
            }
        },
        {
            name: 'Estimated / Actual',
            width: '180px',
            sortable: true,
            selector: (r) => r.estimatedDays,
            cell: (r) => {
                const estimated = r.estimatedDays;
                const actual = daysBetween(getInProcessDate(r), getCompletedDate(r));

                let actualColor = '#94A3B8';   // gray when no comparison possible
                if (actual !== null && estimated) {
                    if (actual <= estimated) actualColor = '#16A34A';   // on/under → green
                    else if (actual <= estimated * 1.2) actualColor = '#D97706';   // up to 20% over → amber
                    else actualColor = '#DC2626';   // way over → red
                }

                return (
                    <WordWrapCell>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div style={{ fontSize: 11.5 }}>
                                <span style={{ color: '#64748B', fontWeight: 600 }}>Est:</span>{' '}
                                <span style={{ color: '#0F172A', fontWeight: 700 }}>
                                    {estimated ? `${estimated}d` : '—'}
                                </span>
                            </div>
                            <div style={{ fontSize: 11.5 }}>
                                <span style={{ color: '#64748B', fontWeight: 600 }}>Actual:</span>{' '}
                                <span style={{ color: actualColor, fontWeight: 700 }}>
                                    {formatDuration(actual)}
                                </span>
                            </div>
                        </div>
                    </WordWrapCell>
                );
            },
        },

        {
            name: 'Attachment',
            width: '85px',
            cell: (r) =>
                r.attachment ? (
                    <a
                        className="cr-download-btn"
                        href={imageBaseUrl + r.attachment}
                        // download
                        target="_blank"
                        rel="noreferrer"
                    >
                        <FaFile size={10} />
                    </a>
                ) : (
                    <span style={{ color: '#94A3B8', fontSize: 11 }}>—</span>
                )
        },
        {
            name: 'Actions',
            width: '200px',
            cell: (r) => {
                const canDecide =
                    activeTab === 'PENDING' &&
                    (!r.rmApproveStatus || r.rmApproveStatus === 'PENDING');

                return (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <button
                            className="cr-action-btn view"
                            onClick={() => setModal({ open: true, kind: 'VIEW', row: r })}
                            title='View Full Details'
                        >
                            <FaEye size={11} /> View
                        </button>

                        {canDecide && (
                            <button
                                className="cr-action-btn hod-approve"
                                onClick={() => setModal({ open: true, kind: 'HOD', row: r })}
                            >
                                <FaCheckCircle size={11} /> Decide
                            </button>
                        )}
                    </div>
                );
            }
        }
    ].map((c) => ({
        ...c,
        name: <span className="font-weight-bold fs-13">{c.name}</span>
    })), []);

    const row = modal.row;
    const isReadOnly = activeTab === 'COMPLETED';

    return (
        <PageContent>
            <Container fluid className="cr-page">
                <Breadcrumbs title="Change Request" breadcrumbItem="Change Request Approvals" />

                <div className="cr-card">
                    <div className="cr-card-head">
                        <div>
                            <div className="cr-card-head-title">
                                Requests Awaiting Your Approval
                            </div>

                            <div className="cr-card-head-sub">
                                Review the change requests your reportees have raised
                            </div>
                        </div>

                        <div className="cr-header-right">
                            <div className="cr-tabs">
                                <button className={`cr-tab ${activeTab === 'PENDING' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('PENDING')}
                                >
                                    Pending
                                </button>

                                <button className={`cr-tab ${activeTab === 'COMPLETED' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('COMPLETED')}
                                >
                                    Completed
                                </button>
                            </div>

                            <div className="cr-request-count">
                                {requests.length}{' '}
                                {requests.length === 1 ? 'Request' : 'Requests'}
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '12px' }}>
                        <AppTable
                            progressPending={listLoading}
                            columns={columns}
                            data={requests}
                            pagination
                            conditionalRowStyles={[
                                {
                                    when: (r) =>
                                        r.rmApproveStatus === 'REJECTED' ||
                                        isStatus(r, 'reject'),
                                    style: {
                                        background: '#FEF2F2',
                                        opacity: 0.85,
                                    },
                                },
                                {
                                    when: (r) => isStatus(r, 'go-live'),
                                    style: {
                                        background: '#F0FDF4',
                                    },
                                },
                                {
                                    when: (r) => isStatus(r, 'live'),
                                    style: {
                                        background: '#F0FDF4',
                                    },
                                },
                            ]}
                        />
                    </div>
                </div>
            </Container>

            <Modal isOpen={modal.open} toggle={closeModal} centered backdrop="static" keyboard={!submitting}
                size={modal.kind === 'HOD' ? 'md' : 'lg'}>
                <ModalHeader toggle={closeModal}>
                    {modal.kind === 'VIEW' && 'Change Request Details'}
                    {modal.kind === 'HOD' && 'HOD / RM Approval'}
                    {modal.kind === 'HISTORY' && 'Status Update History'}
                    {row?.id && <span style={{ marginLeft: 10, fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>· #{row.id}</span>}
                </ModalHeader>
                <ModalBody>
                    {row && (
                        <>
                            <StageTimeline row={row} />
                            {modal.kind !== 'HISTORY' && (
                                <div className="cr-detail-strip">
                                    <Row className="g-3">
                                        <Col md="3"><div className="cr-detail-strip-label">Priority</div><div className="cr-detail-strip-value"><PriorityChip value={row.priority} /></div></Col>
                                        <Col md="3"><div className="cr-detail-strip-label">Application</div><div className="cr-detail-strip-value">{row.application || '—'}</div></Col>
                                        <Col md="3"><div className="cr-detail-strip-label">Type</div><div className="cr-detail-strip-value">{row.typeOfChange || '—'}</div></Col>
                                        <Col md="3"><div className="cr-detail-strip-label">Requested By</div><div className="cr-detail-strip-value">{row.createdBy || '—'}</div></Col>
                                        {/* <Col md="12"><div className="cr-detail-strip-label">Description</div><div style={{ fontSize: 13, color: '#1E293B', lineHeight: 1.5, marginTop: 2 }}>{row.descriptionDetails || '—'}</div></Col> */}
                                        <Col md="12"><div className="cr-detail-strip-label">Description</div><div style={{ fontSize: 13, color: '#1E293B', marginTop: 2 }}>
                                            <span
                                                className="wa-bubble-text"
                                                dangerouslySetInnerHTML={{
                                                    __html: DOMPurify.sanitize(
                                                        row.descriptionDetails.replace(/\n/g, "<br />")
                                                    ),
                                                }}
                                            />
                                        </div></Col>
                                        {row.attachment && (<Col md="12"><a className="cr-download-btn" href={imageBaseUrl + row.attachment} target="_blank" rel="noreferrer"><FaFile size={11} /> Attachment</a></Col>)}
                                    </Row>
                                </div>
                            )}

                            {modal.kind === 'HISTORY' && <StatusHistory histories={row.dropdownUpdateHistories} />}

                            {!isReadOnly && (
                                <>
                                    <Label className="cr-field-label">Decision <RequiredStar /></Label>
                                    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                                        <button type="button" className="cr-submit-btn"
                                            style={{
                                                flex: 1, background: updateState.rmApproveStatus === 'APPROVED' ? 'linear-gradient(135deg,#16A34A,#22C55E)' : '#F8FAFC',
                                                color: updateState.rmApproveStatus === 'APPROVED' ? '#fff' : '#16A34A', border: '1.5px solid #16A34A', boxShadow: 'none'
                                            }}
                                            onClick={() => setUpdateState((p) => ({ ...p, rmApproveStatus: 'APPROVED', rmRejectRemarks: '' }))}>
                                            <FaCheckCircle size={13} /> Approve
                                        </button>
                                        <button type="button" className="cr-submit-btn"
                                            style={{
                                                flex: 1, background: updateState.rmApproveStatus === 'REJECTED' ? 'linear-gradient(135deg,#DC2626,#EF4444)' : '#F8FAFC',
                                                color: updateState.rmApproveStatus === 'REJECTED' ? '#fff' : '#DC2626', border: '1.5px solid #DC2626', boxShadow: 'none'
                                            }}
                                            onClick={() => setUpdateState((p) => ({ ...p, rmApproveStatus: 'REJECTED' }))}>
                                            <FaTimesCircle size={13} /> Reject
                                        </button>
                                    </div>
                                    {updateState.rmApproveStatus === 'REJECTED' && (
                                        <>
                                            <Label className="cr-field-label">Rejection Remarks <RequiredStar /><span className="cr-field-hint">Tell the requester what's missing or wrong</span></Label>
                                            <textarea className="cr-textarea" rows={3} maxLength={1000}
                                                value={updateState.rmRejectRemarks || ''}
                                                onChange={(e) => setUpdateState((p) => ({ ...p, rmRejectRemarks: e.target.value }))}
                                                placeholder="Explain why this is being rejected…" />
                                        </>
                                    )}
                                </>
                            )}

                            {modal.kind === 'VIEW' && (
                                <>
                                    {row.rmRejectRemarks && (
                                        <div style={{
                                            background: '#FEF2F2', border: '1px solid #FECACA', borderLeft: '4px solid #DC2626',
                                            color: '#991B1B', padding: '10px 13px', borderRadius: 9, fontSize: 12.5, marginBottom: 12
                                        }}>
                                            <strong>RM/HOD Rejection Reason:</strong>
                                            <div style={{ marginTop: 4 }}>{row.rmRejectRemarks}</div>
                                        </div>
                                    )}
                                    {(row.estimatedDays || row.impactChanges || row.uatFeedback) && (
                                        <Row className="g-3">
                                            {row.estimatedDays && (<Col md="4"><div className="cr-detail-strip-label">Estimated Days</div><div className="cr-detail-strip-value">{row.estimatedDays}</div></Col>)}
                                            {row.modificationStatus && (<Col md="4"><div className="cr-detail-strip-label">Running Status</div><div className="cr-detail-strip-value"><StatusBadge status={row.modificationStatus} /></div></Col>)}
                                            {row.updatedDate && (<Col md="4"><div className="cr-detail-strip-label">Last Update</div><div className="cr-detail-strip-value">{formatDateTime(row.updatedDate)}</div></Col>)}
                                            {/* {row.impactChanges && (<Col md="12"><div className="cr-detail-strip-label">Impact of Changes</div><div style={{ fontSize: 13, color: '#1E293B', lineHeight: 1.5 }}>{row.impactChanges}</div></Col>)}
                                            {row.uatFeedback && (<Col md="12"><div className="cr-detail-strip-label">UAT Feedback</div><div style={{ fontSize: 13, color: '#1E293B', lineHeight: 1.5 }}>{row.uatFeedback}</div></Col>)} */}
                                            {row.impactChanges && (<Col md="12"><div className="cr-detail-strip-label">Impact of Changes</div><div style={{ fontSize: 13, color: '#1E293B', marginTop: 2 }}>
                                                <span
                                                    className="wa-bubble-text"
                                                    dangerouslySetInnerHTML={{
                                                        __html: DOMPurify.sanitize(
                                                            row.impactChanges.replace(/\n/g, "<br />")
                                                        ),
                                                    }}
                                                />
                                            </div></Col>)}

                                            {row.uatFeedback && (<Col md="12"><div className="cr-detail-strip-label">UAT Feedback</div><div style={{ fontSize: 13, color: '#1E293B',  marginTop: 2 }}>
                                                <span
                                                    className="wa-bubble-text"
                                                    dangerouslySetInnerHTML={{
                                                        __html: DOMPurify.sanitize(
                                                            row.uatFeedback.replace(/\n/g, "<br />")
                                                        ),
                                                    }}
                                                />
                                            </div></Col>)}
                                        </Row>
                                    )}
                                    {Array.isArray(row.dropdownUpdateHistories) && row.dropdownUpdateHistories.length > 0 && (
                                        <>
                                            <div className="cr-section-divider"><span className="cr-section-divider-label">Status History</span></div>
                                            <StatusHistory histories={row.dropdownUpdateHistories} />
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={closeModal} disabled={submitting}
                        style={{ backgroundColor: defaultTheme.goldColorLogo, border: 'none' }}>Close</Button>
                    {!isReadOnly && (
                        <Button color="primary" onClick={submitDecision} disabled={submitting || !updateState.rmApproveStatus}
                            style={{ backgroundColor: defaultTheme.primary, border: 'none' }}>
                            {submitting ? 'Saving…' : 'Submit Decision'}
                        </Button>
                    )}
                </ModalFooter>
            </Modal>
        </PageContent >
    );
}