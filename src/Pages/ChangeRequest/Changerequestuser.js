/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useRef, useState, useEffect } from 'react';
import { Container, Row, Col, Form, Label, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { FaPaperclip, FaFilePdf, FaTimes, FaCheckCircle, FaTimesCircle, FaEye, FaFile, FaHistory, FaFlask } from 'react-icons/fa';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import AppTable from '../../components/Common/Table';
import { useGet, usePost } from '../../Hooks/useApi';
import ApiClient, { imageBaseUrl } from '../../helpers/api_helper';
import { useUserStore } from '../../store/useUserStore';
import { defaultTheme } from '../../helpers/defaultTheme';
import { daysBetween, formatDateTime, formatDuration, getCompletedDate, getInProcessDate, RequiredStar, WordWrapCell } from '../../helpers/function_helper';
import { CREATE_CHANGE_REQUEST, GET_CHANGE_REQUESTS_BY_USER, UPDATE_CHANGE_REQUEST_OTHER, MOVE_NEXT_CHANGE_REQUEST } from '../../helpers/url_helper';
import './Changerequest.css';
import DOMPurify from "dompurify";

// ── Constants ───────────────────────────────────────────────────────────────
const PRIORITY_OPTIONS = [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }];
const APPLICATION_OPTIONS = [{ value: 'web', label: 'Web' }, { value: 'app', label: 'App' }, { value: 'both', label: 'Both' }];
const CHANGE_TYPE_OPTIONS = [{ value: 'new', label: 'New' }, { value: 'existing', label: 'Existing' }];
const RS_STYLES = {
    control: (b) => ({ ...b, minHeight: '38px', borderColor: '#151617', borderWidth: '1.5px', borderRadius: '9px', fontSize: '13.5px' }),
    menuPortal: (b) => ({ ...b, zIndex: 9999 }),
};
const isStatus = (row, s) => String(row?.modificationStatus || '').toLowerCase() === s;
const isUAT = (row) => isStatus(row, 'uat');

// ── Sub-components ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    if (!status || status === 'na') return <span className="cr-badge na">—</span>;
    const map = {
        pending: ['pending', 'Pending'], approved: ['approved', 'Approved'], rejected: ['rejected', 'Rejected'],
        'in-process': ['in-process', 'In Process'], inprocess: ['in-process', 'In Process'],
        uat: ['uat', 'UAT'], 'go-live': ['go-live', 'Go Live'], golive: ['go-live', 'Go Live'],
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

function FileUploadZone({ label, file, onChange, accept = '.pdf,.png,.jpg,.jpeg', hint }) {
    const inputRef = useRef(null);
    return (
        <>
            <Label className="cr-field-label">{label}{hint && <span className="cr-field-hint">{hint}</span>}</Label>
            <div className={`cr-file-zone ${file ? 'has-file' : ''}`} onClick={() => inputRef.current?.click()}>
                <div className="cr-file-icon">{file ? <FaFilePdf size={15} /> : <FaPaperclip size={14} />}</div>
                <div className="cr-file-info">
                    {file ? (<><div className="cr-file-name">{file.name}</div><div className="cr-file-meta">{(file.size / 1024).toFixed(1)} KB · Click to replace</div></>)
                        : (<><div className="cr-file-name">Choose file to upload</div><div className="cr-file-meta">PDF, PNG, or JPG · Max 10 MB</div></>)}
                </div>
                {file && (
                    <button className="cr-file-clear" title="Remove"
                        onClick={(e) => { e.stopPropagation(); onChange(null); if (inputRef.current) inputRef.current.value = ''; }}>
                        <FaTimes size={13} />
                    </button>
                )}
                <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
            </div>
        </>
    );
}

function StageTimeline({ row }) {
    const rmStatus = (row.rmApproveStatus || '').toUpperCase();

    const hodApproved = rmStatus === 'APPROVED';
    const hodRejected = rmStatus === 'REJECTED';
    const hodPending = rmStatus === 'PENDING';
    const hodNew = rmStatus === 'NEW';

    const hodDone = hodApproved || hodRejected;

    const fs = (row.modificationStatus || '').toLowerCase();
    const finalDone = ['go-live', 'reject'].includes(fs);

    return (
        <div className="cr-stages">
            <div className="cr-stage done">
                <div className="cr-stage-label">Submitted</div>
                <div className="cr-stage-value">
                    {row.createdDate ? formatDateTime(row.createdDate) : '—'}
                </div>
            </div>

            <div
                className={`cr-stage ${hodRejected ? 'rejected' :
                    hodDone ? 'done' :
                        'active'
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

                    {hodPending && <div>Pending</div>}

                    {hodNew && <div>New</div>}

                    {!rmStatus && <div>New</div>}
                </div>
            </div>

            <div
                className={`cr-stage ${finalDone
                    ? 'done'
                    : hodApproved && !finalDone
                        ? 'active'
                        : ''
                    }`}
            >
                <div className="cr-stage-label">IT Working</div>
                <div className="cr-stage-value">
                    {fs ? fs.replace('-', ' ') : 'Pending'}
                </div>
            </div>
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
// User screen — submits + tracks + UAT-tests own requests
// ════════════════════════════════════════════════════════════════════════════
export default function ChangeRequestUser() {
    const { userName, empCode, userId, parentId } = useUserStore((s) => s.user) || {};
    const [formState, setFormState] = useState({ priority: null, application: null, changeType: null, description: '', sampleAttachment: null });
    const [modal, setModal] = useState({ open: false, kind: null, row: null });
    const [updateState, setUpdateState] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const { data: listData, isLoading: listLoading, refetch } = useGet(
        userId ? `${GET_CHANGE_REQUESTS_BY_USER}${userId}` : null,
        { enabled: !!userId }
    );
    const requests = useMemo(() => Array.isArray(listData?.data?.data?.content) ? listData.data.data?.content : [], [listData]);

    const { isPending: creating, mutate: createMutate } = usePost(CREATE_CHANGE_REQUEST, {
        onSuccess: (resp) => {
            if (resp?.data?.status === 1) {
                toast.success(resp.data.message || 'Change request submitted');
                setFormState({ priority: null, application: null, changeType: null, description: '', sampleAttachment: null });
                refetch();
            } else toast.error(resp?.data?.message || 'Failed');
        },
        onError: (err) => toast.error(err.message || 'Network error'),
    });

    const handleField = (key, val) => setFormState((p) => ({ ...p, [key]: val }));

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (!formState.priority) return toast.error('Please select priority');
        if (!formState.application) return toast.error('Please select application');
        if (!formState.changeType) return toast.error('Please select type of change');
        if (!formState.description?.trim()) return toast.error('Please add a description');
        const fd = new FormData();
        fd.append('priority', formState.priority.value);
        fd.append('application', formState.application.value);
        fd.append('typeOfChange', formState.changeType.value);
        fd.append('descriptionDetails', formState.description.trim());
        fd.append('createdBy', `${userName} (${empCode})`);
        fd.append('createdById', userId);
        if (formState.sampleAttachment) fd.append('file', formState.sampleAttachment);
        createMutate(fd);
    };

    const handleMove = async (row) => {
        if (!window.confirm('Send this Change Request to your RM for approval?')) return;
        try {
            const res = await ApiClient.put(`${MOVE_NEXT_CHANGE_REQUEST}/${row.id}`);
            if (res?.data?.status === 1) { toast.success('Request moved successfully'); refetch(); }
            else toast.error(res?.data?.message || 'Failed to move request');
        } catch (err) { toast.error(err?.message || 'Something went wrong'); }
    };

    useEffect(() => {
        if (!modal.open || !modal.row) return;
        if (modal.kind === 'UAT') setUpdateState({ uatFeedback: modal.row.uatFeedback || '', modificationStatus: null });
        else setUpdateState({});
    }, [modal.kind, modal.row?.id, modal.open]);

    const closeModal = () => { if (!submitting) { setModal({ open: false, kind: null, row: null }); setUpdateState({}); } };

    const submitUAT = async () => {
        const row = modal.row;
        if (!updateState.uatFeedback?.trim()) return toast.error('Please write UAT feedback');
        if (!updateState.modificationStatus) return toast.error('Choose Accept or Reject');
        if (!window.confirm('Submit UAT feedback?')) return;
        setSubmitting(true);
        try {
            const params = new URLSearchParams();
            params.append('priority', row.priority || '');
            params.append('application', row.application || '');
            params.append('requestedUser', row.createdBy || '');
            params.append('hod', row.parentUserId || '');
            params.append('typeOfChange', row.typeOfChange || '');
            params.append('descriptionDetails', row.descriptionDetails || '');
            params.append('createdBy', `${userName} (${empCode})` || '');
            params.append('estimatedDays', row.estimatedDays || '');
            params.append('impactChanges', row.impactChanges || '');
            params.append('modificationStatus', updateState.modificationStatus.value);
            params.append('modifierStatus', `${userName} (${empCode})`);
            params.append('uatFeedback', updateState.uatFeedback.trim());
            const resp = await ApiClient.put(`${UPDATE_CHANGE_REQUEST_OTHER}/${row.id}?${params.toString()}`, new FormData());
            if (resp?.data?.status === 1) { toast.success(resp.data.message || 'UAT feedback submitted'); refetch(); closeModal(); }
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
            name: 'HOD/RM Status',
            width: '140px',
            sortable: true,
            selector: (r) => r.rmApproveStatus,
            cell: (r) => <StatusBadge status={r.rmApproveStatus === null ? 'New' : r.rmApproveStatus} />
        },
        // {
        //     name: 'Running Status',
        //     width: '160px',
        //     sortable: true,
        //     selector: (r) => r.modificationStatus,
        //     cell: (r) => {
        //         const hist =
        //             Array.isArray(r.dropdownUpdateHistories) &&
        //             r.dropdownUpdateHistories.length > 0;

        //         return (
        //             <div className="cr-status-cell">
        //                 <StatusBadge status={r.modificationStatus} />
        //                 {hist && (
        //                     <button
        //                         className="cr-status-history-btn"
        //                         title="View status history"
        //                         onClick={(e) => {
        //                             e.stopPropagation();
        //                             setModal({ open: true, kind: 'HISTORY', row: r });
        //                         }}
        //                     >
        //                         <FaHistory size={11} />
        //                     </button>
        //                 )}
        //                 {isUAT(r) && (
        //                     <button
        //                         className="cr-action-btn uat-test"
        //                         onClick={() => setModal({ open: true, kind: 'UAT', row: r })}
        //                     >
        //                         <FaFlask size={11} /> UAT
        //                     </button>
        //                 )}
        //             </div>
        //         );
        //     }
        // },
        {
            name: 'Running Status',
            width: '160px',
            sortable: true,
            selector: (r) => r.modificationStatus,
            cell: (r) => {
                if (isUAT(r)) {
                    return (
                        <button
                            className="cr-action-btn uat-test"
                            onClick={(e) => {
                                e.stopPropagation();
                                setModal({ open: true, kind: 'UAT', row: r });
                            }}
                        >
                            <FaFlask size={11} /> UAT
                        </button>
                    );
                }

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
            cell: (r) => (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button
                        className="cr-action-btn view"
                        onClick={() => setModal({ open: true, kind: 'VIEW', row: r })}
                        title='View Full Details'
                    >
                        <FaEye size={11} /> View
                    </button>

                    {!r.rmApproveStatus && (
                        <button
                            className="cr-action-btn assign"
                            onClick={() => handleMove(r)}
                            title='Move To RM'
                        >
                            Move
                        </button>
                    )}

                    {/* {isUAT(r) && (
                        <button
                            className="cr-action-btn uat-test"
                            onClick={() => setModal({ open: true, kind: 'UAT', row: r })}
                        >
                            <FaFlask size={11} /> UAT
                        </button>
                    )} */}
                </div>
            )
        }
    ].map((c) => ({
        ...c,
        name: <span className="font-weight-bold fs-13">{c.name}</span>
    })), [userId, parentId]);

    const row = modal?.row;

    return (
        <PageContent>
            <Container fluid className="cr-page">
                <Breadcrumbs title="Change Request" breadcrumbItem="My Change Requests" />
                {creating && <ScreenLoader />}

                <div className="cr-card">
                    <div className="cr-card-head">
                        <div>
                            <div className="cr-card-head-title">
                                Submit a Change Request
                            </div>
                            <div className="cr-card-head-sub">
                                Describe the change, attach a sample, your RM will review first.
                            </div>
                        </div>

                        <button
                            type="button"
                            className='cr-cancel-btn'
                            // className={showForm ? "cr-cancel-btn" : "cr-submit-btn"}
                            onClick={() => setShowForm(!showForm)}
                            style={{ margin: 0 }}
                        >
                            {showForm ? (
                                <>
                                    <FaTimes size={12} /> Hide Form
                                </>
                            ) : (
                                <>
                                    Create Change Request
                                </>
                            )}
                        </button>
                    </div>

                    {showForm && (
                        <div className="cr-card-body">
                            <Form onSubmit={handleSubmit}>
                                <Row className='g-2'>
                                    <Col md="6">
                                        <Label className="cr-field-label">Application <RequiredStar /></Label>
                                        <Select value={formState.application} onChange={(v) => handleField('application', v)}
                                            options={APPLICATION_OPTIONS} isClearable styles={RS_STYLES} menuPortalTarget={document.body}
                                            placeholder="Select application…" />
                                    </Col>
                                    <Col md="6">
                                        <Label className="cr-field-label">Type of Change <RequiredStar /></Label>
                                        <Select value={formState.changeType} onChange={(v) => handleField('changeType', v)}
                                            options={CHANGE_TYPE_OPTIONS} isClearable styles={RS_STYLES} menuPortalTarget={document.body}
                                            placeholder="New or existing…" />
                                    </Col>

                                    <Col md="12">
                                        <Label className="cr-field-label">Detailed Description <RequiredStar /><span className="cr-field-hint">What, why, and expected outcome</span></Label>
                                        <textarea className="cr-textarea" value={formState.description} rows={4} maxLength={5000}
                                            onChange={(e) => handleField('description', e.target.value)} placeholder="Describe the change in detail…" />
                                        <div className="cr-char-counter">{formState.description.length}/5000</div>
                                    </Col>
                                    <Col md="6">
                                        <FileUploadZone label="Attachment" file={formState.sampleAttachment}
                                            onChange={(f) => handleField('sampleAttachment', f)} hint="screenshot or reference" />
                                    </Col>
                                    <Col md="6">
                                        <Label className="cr-field-label">Priority <RequiredStar /></Label>
                                        <Select value={formState.priority} onChange={(v) => handleField('priority', v)}
                                            options={PRIORITY_OPTIONS} isClearable styles={RS_STYLES} menuPortalTarget={document.body}
                                            placeholder="Select priority…" />
                                    </Col>
                                </Row>
                                <div style={{ marginTop: 15, display: 'flex' }}>
                                    <button type="submit" className="cr-submit-btn" disabled={creating}>
                                        {creating ? 'Submitting…' : 'Submit Request'}
                                    </button>
                                    <button type="button" className="cr-cancel-btn" disabled={creating}
                                        onClick={() => setFormState({ priority: null, application: null, changeType: null, description: '', sampleAttachment: null })}>
                                        Reset
                                    </button>
                                </div>
                            </Form>
                        </div>
                    )}
                </div>

                <div className="cr-card">
                    <div className="cr-card-head">
                        <div>
                            <div className="cr-card-head-title">My Change Requests</div>
                            <div className="cr-card-head-sub">Track and test your requests</div>
                        </div>
                        <div style={{ fontSize: 11.5, opacity: .9 }}>{requests.length} {requests.length === 1 ? 'request' : 'requests'}</div>
                    </div>
                    <div style={{ padding: '0 8px 8px' }}>
                        <AppTable progressPending={listLoading} columns={columns} data={requests} pagination
                            conditionalRowStyles={[
                                { when: (r) => r.rmApproveStatus === 'REJECTED' || isStatus(r, 'reject'), style: { background: '#FEF2F2', opacity: .85 } },
                                { when: (r) => isStatus(r, 'go-live'), style: { background: '#F0FDF4' } },
                                { when: (r) => isStatus(r, 'live'), style: { background: '#F0FDF4' } },
                            ]} />
                    </div>
                </div>
            </Container>

            <Modal isOpen={modal.open} toggle={closeModal} centered backdrop="static" keyboard={!submitting} size="lg">
                <ModalHeader toggle={closeModal}>
                    {modal.kind === 'VIEW' && 'Change Request Details'}
                    {modal.kind === 'UAT' && 'UAT Testing & Feedback'}
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
                                        <Col md="12"><div className="cr-detail-strip-label">Description</div>
                                            <span
                                                className="wa-bubble-text"
                                                dangerouslySetInnerHTML={{
                                                    __html: DOMPurify.sanitize(
                                                        row.descriptionDetails.replace(/\n/g, "<br />")
                                                    ),
                                                }}
                                            />
                                        </Col>

                                        {row.attachment && (<Col md="12"><a className="cr-download-btn" href={imageBaseUrl + row.attachment} target="_blank" rel="noreferrer"><FaFile size={11} /> Attachment</a></Col>)}
                                    </Row>
                                </div>
                            )}

                            {modal.kind === 'HISTORY' && <StatusHistory histories={row.dropdownUpdateHistories} />}

                            {modal.kind === 'UAT' && (
                                <>
                                    <div className="cr-section-divider"><span className="cr-section-divider-label">UAT Testing</span></div>
                                    <Row className="g-3" style={{ marginBottom: 12 }}>
                                        <Col md="4"><Label className="cr-field-label">Estimated Days</Label><div className="cr-readonly-field">{row.estimatedDays || '—'}</div></Col>
                                        <Col md="8"><Label className="cr-field-label">Impact of Changes</Label><div className="cr-readonly-field">{row.impactChanges || '—'}</div></Col>
                                    </Row>
                                    <Label className="cr-field-label">UAT Feedback <RequiredStar /><span className="cr-field-hint">What you tested, what works, what doesn't</span></Label>
                                    <textarea className="cr-textarea" rows={4} maxLength={5000}
                                        value={updateState.uatFeedback || ''}
                                        onChange={(e) => setUpdateState((p) => ({ ...p, uatFeedback: e.target.value }))}
                                        placeholder="Describe what was tested, what passed, what needs fixing…" />
                                    <Label className="cr-field-label" style={{ marginTop: 12 }}>Decision <RequiredStar /></Label>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button type="button" className="cr-submit-btn"
                                            style={{
                                                flex: 1, background: updateState.modificationStatus?.value === 'go-live' ? 'linear-gradient(135deg,#16A34A,#22C55E)' : '#F8FAFC',
                                                color: updateState.modificationStatus?.value === 'go-live' ? '#fff' : '#16A34A', border: '1.5px solid #16A34A', boxShadow: 'none'
                                            }}
                                            onClick={() => setUpdateState((p) => ({ ...p, modificationStatus: { value: 'go-live', label: 'Accept' } }))}>
                                            <FaCheckCircle size={13} /> Accept — Go Live
                                        </button>
                                        <button type="button" className="cr-submit-btn"
                                            style={{
                                                flex: 1, background: updateState.modificationStatus?.value === 'in-process' ? 'linear-gradient(135deg,#DC2626,#EF4444)' : '#F8FAFC',
                                                color: updateState.modificationStatus?.value === 'in-process' ? '#fff' : '#DC2626', border: '1.5px solid #DC2626', boxShadow: 'none'
                                            }}
                                            onClick={() => setUpdateState((p) => ({ ...p, modificationStatus: { value: 'in-process', label: 'In Process' } }))}>
                                            <FaTimesCircle size={13} /> In Process
                                        </button>
                                    </div>
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

                                            {row.impactChanges && (<Col md="12"><div className="cr-detail-strip-label">Impact of Changes</div>
                                                <span
                                                    className="wa-bubble-text"
                                                    dangerouslySetInnerHTML={{
                                                        __html: DOMPurify.sanitize(
                                                            row.impactChanges.replace(/\n/g, "<br />")
                                                        ),
                                                    }}
                                                />
                                            </Col>)}

                                            {row.uatFeedback && (<Col md="12"><div className="cr-detail-strip-label">UAT Feedback</div>
                                                <span
                                                    className="wa-bubble-text"
                                                    dangerouslySetInnerHTML={{
                                                        __html: DOMPurify.sanitize(
                                                            row.uatFeedback.replace(/\n/g, "<br />")
                                                        ),
                                                    }}
                                                />
                                            </Col>)}
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
                    {modal.kind === 'UAT' && (
                        <Button color="primary" onClick={submitUAT} disabled={submitting}
                            style={{ backgroundColor: defaultTheme.primary, border: 'none' }}>
                            {submitting ? 'Saving…' : 'Submit UAT Feedback'}
                        </Button>
                    )}
                </ModalFooter>
            </Modal>
        </PageContent>
    );
}