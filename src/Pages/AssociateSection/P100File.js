/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Label } from 'reactstrap';
import { toast } from 'react-toastify';
import { MdMobileFriendly, MdSwapHoriz } from 'react-icons/md';
import { FaUserPlus } from 'react-icons/fa';

import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient from '../../helpers/api_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { formatDateTime, RequiredStar, WordWrapCell } from '../../helpers/function_helper';
import { useUserStore } from '../../store/useUserStore';
import {
    CREATE_P100_LEAD,
    GET_P100_LEADS,
    CREATE_SUSPECT,
} from '../../helpers/url_helper';
import { decryptData } from '../../components/Common/CryptoUtils';

// ── Regex ───────────────────────────────────────────────────────────────────
const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]{1,49}$/;   // letters, spaces, .'- (2-50 chars)
const MOBILE_REGEX = /^[6-9]\d{9}$/;                    // Indian 10-digit mobile

export default function P100File() {
    const { userId } = useUserStore((s) => s.user) || {};
    const [leads, setLeads] = useState([]);
    const [isPending, setIsPending] = useState(false);

    // ── Create-lead form ────────────────────────────────────────────────────
    const [form, setForm] = useState({ leadName: '', leadMobile: '' });
    const [errors, setErrors] = useState({ leadName: '', leadMobile: '' });
    const [creating, setCreating] = useState(false);

    // ── Move state ──────────────────────────────────────────────────────────
    const [movingId, setMovingId] = useState(null);   // id of row currently being moved

    // ── Fetch leads ─────────────────────────────────────────────────────────
    const fetchLeads = () => {
        if (!userId) return;
        setIsPending(true);
        ApiClient.get(`${GET_P100_LEADS}&associateId=${userId}`)
            .then((response) => {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    decryptData(response?.data?.data)
                        .then((decrypted) => setLeads(decrypted))
                        .catch(() => setLeads([]));
                } else {
                    setLeads([]);
                    toast.error(response?.data?.message || 'Failed to load leads');
                }
            })
            .catch((error) => {
                setIsPending(false);
                setLeads([]);
                toast.error(error.message);
            });
    };

    useEffect(() => { fetchLeads(); }, [userId]);

    // ── Lead form handlers ──────────────────────────────────────────────────
    const handleField = (key, val) => {
        setForm((p) => ({ ...p, [key]: val }));
        if (errors[key]) setErrors((p) => ({ ...p, [key]: '' }));
    };

    const validateLeadForm = () => {
        const e = { leadName: '', leadMobile: '' };
        if (!form.leadName.trim()) {
            e.leadName = 'Lead name is required';
        } else if (!NAME_REGEX.test(form.leadName.trim())) {
            e.leadName = 'Name must be 2-50 letters (letters, spaces, .\'- only)';
        }
        if (!form.leadMobile.trim()) {
            e.leadMobile = 'Mobile number is required';
        } else if (!MOBILE_REGEX.test(form.leadMobile.trim())) {
            e.leadMobile = 'Enter a valid 10-digit mobile (starts with 6-9)';
        }
        setErrors(e);
        return !e.leadName && !e.leadMobile;
    };

    const handleCreateLead = (e) => {
        e?.preventDefault();
        if (!validateLeadForm()) return;

        setCreating(true);
        const params = new URLSearchParams({
            userId,
            leadName: form.leadName.trim(),
            leadMobile: form.leadMobile.trim(),
        });

        ApiClient.post(`${CREATE_P100_LEAD}?${params.toString()}`)
            .then((response) => {
                setCreating(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message || 'Lead created');
                    setForm({ leadName: '', leadMobile: '' });
                    setErrors({ leadName: '', leadMobile: '' });
                    fetchLeads();
                } else {
                    toast.error(response?.data?.message || 'Failed to create lead');
                }
            })
            .catch((error) => {
                setCreating(false);
                toast.error(error.message || 'Network error');
            });
    };

    const handleResetForm = () => {
        setForm({ leadName: '', leadMobile: '' });
        setErrors({ leadName: '', leadMobile: '' });
    };

    // ── Move lead → Suspect (confirm only, no modal) ────────────────────────
    const handleMove = (row) => {
        if (!window.confirm(`Move "${row.leadName}" to Suspect?`)) return;

        setMovingId(row.id);

        const body = {
            leadName: row.leadName,
            leadMobile: row.leadMobile,
            remark: '',
            project: 'P100',
            projectCategory: 'P100',
        };

        ApiClient.post(`${CREATE_SUSPECT}${userId}&personalLeadId=${row.id}`, body)
            .then((response) => {
                setMovingId(null);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message || 'Moved to Suspect');
                    fetchLeads();
                } else {
                    toast.error(response?.data?.message || 'Failed to move');
                }
            })
            .catch((error) => {
                setMovingId(null);
                toast.error(error.message || 'Network error');
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
            name: 'Created At',
            sortable: true,
            selector: (r) => r.createdDate,
            cell: (r) => <WordWrapCell>{formatDateTime(r.createdDate) || '—'}</WordWrapCell>,
        },
        {
            name: 'Lead Name',
            sortable: true,
            selector: (r) => r.leadName,
            cell: (r) => <WordWrapCell>{r.leadName || '—'}</WordWrapCell>,
        },
        {
            name: 'Mobile',
            selector: (r) => r.leadMobile,
            cell: (r) => (
                <div className="phone-container">
                    <MdMobileFriendly className="phone-icon" color={defaultTheme.goldColorLogo} />
                    <span className="phone-number">{r.leadMobile || '—'}</span>
                </div>
            ),
        },
        {
            name: 'Action',
            cell: (r) => {
                const isThisMoving = movingId === r.id;
                const isDisabled = isThisMoving || !!r.suspectCreatedDate;
                return (
                    <button
                        onClick={() => handleMove(r)}
                        disabled={isDisabled}
                        title="Move to Suspect"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '5px 11px',
                            background: isDisabled ? '#E2E8F0' : `${defaultTheme.primary}1A`,
                            color: isDisabled ? '#94A3B8' : defaultTheme.primary,
                            border: `1px solid ${isDisabled ? '#CBD5E1' : `${defaultTheme.primary}40`}`,
                            borderRadius: 7,
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            transition: 'background .15s',
                        }}
                        onMouseEnter={(e) => {
                            if (!isDisabled) {
                                e.currentTarget.style.background = `${defaultTheme.primary}30`;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isDisabled) {
                                e.currentTarget.style.background = `${defaultTheme.primary}1A`;
                            }
                        }}
                    >
                        <MdSwapHoriz size={13} />
                        {isThisMoving ? 'Moving…' : 'Move'}
                    </button>
                );
            },
        },
    ].map((c) => ({
        ...c,
        name: <span className="font-weight-bold fs-13">{c.name}</span>,
    })), [userId, movingId]);

    return (
        <PageContent>
            <Breadcrumbs title="Associate Section" breadcrumbItem="P100 File" />
            {(isPending || creating) && <ScreenLoader />}

            <Container fluid>
                {/* ── Add Lead Form ───────────────────────────────────────── */}
                <Card>
                    <CardBody>
                        <h6 style={{
                            fontSize: 13, fontWeight: 700, color: defaultTheme.primary,
                            marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <FaUserPlus size={13} /> Add a New Lead
                        </h6>
                        <form onSubmit={handleCreateLead}>
                            <Row className="g-3">
                                <Col md="5">
                                    <Label className="form-label">
                                        Lead Name <RequiredStar />
                                    </Label>
                                    <input
                                        className={`form-control ${errors.leadName ? 'is-invalid' : ''}`}
                                        value={form.leadName}
                                        onChange={(e) => handleField('leadName', e.target.value)}
                                        placeholder="Enter Name..."
                                        maxLength={50}
                                    />
                                    {errors.leadName && (
                                        <div style={{ color: '#DC2626', fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                                            {errors.leadName}
                                        </div>
                                    )}
                                </Col>
                                <Col md="4">
                                    <Label className="form-label">
                                        Lead Mobile <RequiredStar />
                                    </Label>
                                    <input
                                        className={`form-control ${errors.leadMobile ? 'is-invalid' : ''}`}
                                        type="tel"
                                        value={form.leadMobile}
                                        onChange={(e) => handleField('leadMobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="10-digit mobile"
                                        maxLength={10}
                                    />
                                    {errors.leadMobile && (
                                        <div style={{ color: '#DC2626', fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                                            {errors.leadMobile}
                                        </div>
                                    )}
                                </Col>
                                <Col md="3" className="d-flex align-items-end">
                                    <Button
                                        color="primary" type="submit" disabled={creating}
                                        className="me-2"
                                        style={{ backgroundColor: defaultTheme.primary, border: 'none' }}
                                    >
                                        {creating ? 'Adding…' : 'Add Lead'}
                                    </Button>
                                    <Button color="secondary" type="button" onClick={handleResetForm} disabled={creating}>
                                        Reset
                                    </Button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                {/* ── Leads Table ────────────────────────────────────────── */}
                <AppTable
                    progressPending={isPending}
                    columns={columns}
                    data={leads?.content}
                    pagination
                />
            </Container>
        </PageContent>
    );
}