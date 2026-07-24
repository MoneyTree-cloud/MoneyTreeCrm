/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState, useEffect } from 'react';
import { Container, Row, Col, Label, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { FaEye, FaFile, FaHistory } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import { useGet } from '../../Hooks/useApi';
import ApiClient, { imageBaseUrl } from '../../helpers/api_helper';
import { useUserStore } from '../../store/useUserStore';
import { defaultTheme } from '../../helpers/defaultTheme';
import { daysBetween, formatDateTime, formatDuration, getCompletedDate, getInProcessDate, RequiredStar, WordWrapCell } from '../../helpers/function_helper';
import { GET_CHANGE_REQUESTS_BY_IT, UPDATE_CHANGE_REQUEST_OTHER } from '../../helpers/url_helper';
import './Changerequest.css';
import PageContent from '../../components/Common/PageContent';
import DOMPurify from "dompurify";

// ── Constants ───────────────────────────────────────────────────────────────
const IT_STATUS_OPTIONS = [
    { value: 'in-process', label: 'In Process' },
    { value: 'uat', label: 'UAT' },
    // { value: 'go-live', label: 'Go Live' },
    { value: 'reject', label: 'Reject' },
    { value: 'live', label: 'LIVE' },
];
const RS_STYLES = {
    control: (b) => ({ ...b, minHeight: '38px', borderColor: '#CBD5E1', borderWidth: '1.5px', borderRadius: '9px', fontSize: '13.5px' }),
    menuPortal: (b) => ({ ...b, zIndex: 9999 }),
};

const findOption = (opts, value) =>
    value ? opts.find((o) => o.value?.toLowerCase?.() === String(value).toLowerCase()) || null : null;

const isStatus = (row, s) => String(row?.modificationStatus || '').toLowerCase() === s;
const isLocked = (row) => isStatus(row, 'reject') || isStatus(row, 'live');
// const isRejected = (row) => isStatus(row, 'reject');
const isGoLive = (row) => isStatus(row, 'live');

// ── Sub-components ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    if (!status || status === 'na') return <span className="cr-badge na">—</span>;
    const map = {
        pending: ['pending', 'Pending'], approved: ['approved', 'Approved'], rejected: ['rejected', 'Rejected'],
        'in-process': ['in-process', 'In Process'], inprocess: ['in-process', 'In Process'],
        uat: ['uat', 'UAT'],
        live: ['live', 'LIVE'],
        reject: ['rejected', 'Reject'],
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
    const finalDone = ['live', 'reject'].includes(fs);
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
// IT screen — fills estimated days, impact, status
// ════════════════════════════════════════════════════════════════════════════
export default function ChangeRequestIT() {
    const { userName, empCode } = useUserStore((s) => s.user) || {};
    const [modal, setModal] = useState({ open: false, kind: null, row: null });
    const [updateState, setUpdateState] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const { data: listData, isLoading: listLoading, refetch } = useGet(GET_CHANGE_REQUESTS_BY_IT);
    const requests = useMemo(() => Array.isArray(listData?.data?.data?.content) ? listData?.data?.data?.content : [], [listData]);

    useEffect(() => {
        if (!modal.open || !modal.row) return;
        if (modal.kind === 'UPDATE') {
            setUpdateState({
                estimatedDays: modal.row.estimatedDays || '',
                impactChanges: modal.row.impactChanges || '',
                modificationStatus: findOption(IT_STATUS_OPTIONS, modal.row.modificationStatus),
            });
        } else setUpdateState({});
    }, [modal.kind, modal.row?.id, modal.open]);

    const closeModal = () => { if (!submitting) { setModal({ open: false, kind: null, row: null }); setUpdateState({}); } };

    const submitITUpdate = async () => {
        const row = modal.row;

        if (!updateState.estimatedDays)
            return toast.error('Please enter estimated days');

        if (!updateState.impactChanges?.trim())
            return toast.error('Please describe the impact of changes');

        if (!updateState.modificationStatus)
            return toast.error('Please select a status');

        if (!window.confirm('Submit IT update for this request?'))
            return;

        setSubmitting(true);

        try {
            const formData = new FormData();

            formData.append('priority', row.priority || '');
            formData.append('application', row.application || '');
            formData.append('requestedUser', row.createdBy || '');
            formData.append('typeOfChange', row.typeOfChange || '');
            formData.append('descriptionDetails', row.descriptionDetails || '');
            formData.append('createdBy', `${userName} (${empCode})` || '');
            formData.append('estimatedDays', updateState.estimatedDays);
            formData.append('impactChanges', updateState.impactChanges.trim());
            formData.append(
                'modificationStatus',
                updateState.modificationStatus.value
            );
            formData.append(
                'modifierStatus',
                `${userName} (${empCode})`
            );
            formData.append('uatFeedback', row.uatFeedback || '');

            const resp = await ApiClient.put(
                `${UPDATE_CHANGE_REQUEST_OTHER}/${row.id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (resp?.data?.status === 1) {
                toast.success(resp.data.message || 'Update submitted');
                refetch();
                closeModal();
            } else {
                toast.error(resp?.data?.message || 'Failed');
            }
        } catch (err) {
            toast.error(err.message || 'Network error');
        } finally {
            setSubmitting(false);
        }
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
            cell: (r) => (
                <WordWrapCell>
                    {formatDateTime(r.createdDate)}
                </WordWrapCell>
            )
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
            width: '170px',
            sortable: true,
            selector: (r) => r.modificationStatus,
            cell: (r) => {
                const hist =
                    Array.isArray(r.dropdownUpdateHistories) &&
                    r.dropdownUpdateHistories.length > 0;

                return (
                    <WordWrapCell>
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
                    </WordWrapCell>
                );
            }
        },
        // {
        //     name: 'Started (In Process)',
        //     width: '160px',
        //     sortable: true,
        //     selector: (r) => getInProcessDate(r),
        //     cell: (r) => {
        //         const d = getInProcessDate(r);
        //         return <WordWrapCell>{d ? formatDateTime(d) : '—'}</WordWrapCell>;
        //     },
        // },
        // {
        //     name: 'Completed (Live)',
        //     width: '160px',
        //     sortable: true,
        //     selector: (r) => getCompletedDate(r),
        //     cell: (r) => {
        //         const d = getCompletedDate(r);
        //         return <WordWrapCell>{d ? formatDateTime(d) : '—'}</WordWrapCell>;
        //     },
        // },
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


        // {
        //     name: 'Estimated Days',
        //     width: '130px',
        //     sortable: true,
        //     selector: (r) => r.estimatedDays,
        //     cell: (r) => <WordWrapCell>{r.estimatedDays || '—'}</WordWrapCell>
        // },

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
                const hodApproved = r.rmApproveStatus === 'APPROVED';
                const locked = isLocked(r);

                return (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <button
                            className="cr-action-btn view"
                            onClick={() => setModal({ open: true, kind: 'VIEW', row: r })}
                            title='View Full Details'
                        >
                            <FaEye size={11} /> View
                        </button>

                        {hodApproved && !locked && (
                            <button
                                className="cr-action-btn update"
                                onClick={() => setModal({ open: true, kind: 'UPDATE', row: r })}
                            >
                                <MdEdit size={12} /> Update
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

    return (
        <PageContent>
            <Container fluid className="cr-page">
                <Breadcrumbs title="Change Request" breadcrumbItem="All Change Requests" />

                <div className="cr-card">
                    <div className="cr-card-head">
                        <div>
                            <div className="cr-card-head-title">All Change Requests</div>
                            <div className="cr-card-head-sub">Manage estimates, impact, and progression across departments</div>
                        </div>
                        <div style={{ fontSize: 11.5, opacity: .9 }}>{requests.length} {requests.length === 1 ? 'request' : 'requests'}</div>
                    </div>
                    <div style={{ padding: '0 8px 8px' }}>
                        <AppTable progressPending={listLoading} columns={columns} data={requests} pagination
                            conditionalRowStyles={[
                                { when: (r) => r.rmApproveStatus === 'REJECTED' || isStatus(r, 'reject'), style: { background: '#FEF2F2', opacity: .85 } },
                                { when: (r) => isStatus(r, 'live'), style: { background: '#F0FDF4' } },
                            ]} />
                    </div>
                </div>
            </Container>

            <Modal isOpen={modal.open} toggle={closeModal} centered backdrop="static" keyboard={!submitting} size="lg">
                <ModalHeader toggle={closeModal}>
                    {modal.kind === 'VIEW' && 'Change Request Details'}
                    {modal.kind === 'UPDATE' && 'IT Department Update'}
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

                            {modal.kind === 'UPDATE' && (
                                <>
                                    {isLocked(row) ? (
                                        <div className={`cr-locked-card ${isGoLive(row) ? 'live' : 'rejected'}`}>
                                            {isGoLive(row)
                                                ? '✓ This request is Live. No further edits are allowed.'
                                                : '🚫 This request has been Rejected. No further edits are allowed.'}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="cr-section-divider"><span className="cr-section-divider-label">IT Department Fields</span></div>
                                            <Row className="g-3">
                                                <Col md="8">
                                                    <Label className="cr-field-label">Status <RequiredStar /><span className="cr-field-hint">Move through In Process → UAT → LIVE</span></Label>
                                                    <Select value={updateState.modificationStatus}
                                                        onChange={(v) => setUpdateState((p) => ({ ...p, modificationStatus: v }))}
                                                        options={IT_STATUS_OPTIONS} isClearable styles={RS_STYLES} menuPortalTarget={document.body}
                                                        placeholder="Select status…" />
                                                </Col>
                                                <Col md="4">
                                                    <Label className="cr-field-label">Estimated Days <RequiredStar /></Label>
                                                    <input type="number" className="cr-input" min={0} placeholder="e.g. 5"
                                                        value={updateState.estimatedDays || ''}
                                                        onChange={(e) => setUpdateState((p) => ({ ...p, estimatedDays: e.target.value }))} />
                                                </Col>

                                                <Col md="12">
                                                    <Label className="cr-field-label">Impact of Changes <RequiredStar /><span className="cr-field-hint">What modules/users will be affected</span></Label>
                                                    <textarea className="cr-textarea" rows={3} maxLength={1000}
                                                        value={updateState.impactChanges || ''}
                                                        onChange={(e) => setUpdateState((p) => ({ ...p, impactChanges: e.target.value }))}
                                                        placeholder="Describe the impact in detail…" />
                                                </Col>
                                            </Row>
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
                                            {/* {row.impactChanges && (<Col md="12"><div className="cr-detail-strip-label">Impact of Changes</div><div style={{ fontSize: 13, color: '#1E293B', lineHeight: 1.5 }}>{row.impactChanges}</div></Col>)} */}
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
                                            {/* {row.uatFeedback && (<Col md="12"><div className="cr-detail-strip-label">UAT Feedback</div><div style={{ fontSize: 13, color: '#1E293B', lineHeight: 1.5 }}>{row.uatFeedback}</div></Col>)} */}
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
                    {modal.kind === 'UPDATE' && !isLocked(row) && (
                        <Button color="primary" onClick={submitITUpdate} disabled={submitting}
                            style={{ backgroundColor: defaultTheme.primary, border: 'none' }}>
                            {submitting ? 'Saving…' : 'Submit Update'}
                        </Button>
                    )}
                </ModalFooter>
            </Modal>
        </PageContent>
    );
}