/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, CardBody, Label } from 'reactstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { FaInbox, FaCalendarAlt } from 'react-icons/fa';

import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient from '../../helpers/api_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { formatDate, formatDateForInput, getAgingDaysByDoj, WordWrapCell } from '../../helpers/function_helper';
import { useGet } from '../../Hooks/useApi';
import { useUserStore } from '../../store/useUserStore';
import {
    GET_P100_LEADS_DOJ,           // ★ add: lead/personal-leads/get/doj
    GET_ALL_MAIN_TEAM_DROPDOWN,   // ★ existing
} from '../../helpers/url_helper';

const RS_STYLES = {
    control: (b) => ({
        ...b,
        minHeight: '38px',
        borderColor: '#111112',
        borderWidth: '1.5px',
        borderRadius: '9px',
        fontSize: '13.5px',
    }),
    menuPortal: (b) => ({ ...b, zIndex: 9999 }),
};

// Tab options — each represents a time-range filter in months
const TAB_OPTIONS = [
    { months: 1, label: '1 Month' },
    { months: 2, label: '2 Months' },
    { months: 3, label: '3 Months' },
];

// Compute fromDate / toDate for a given month range (from N months ago → today)
const getDateRange = (months) => {
    const today = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - months);
    return {
        fromDate: formatDateForInput(from),
        toDate: formatDateForInput(today),
    };
};


export default function P100Report() {
    const user = useUserStore((s) => s.user) || {};
    const { role, mainTeam: userMainTeam } = user;
    const isAssociate = String(role).toUpperCase() === 'ASSOCIATE';

    const [activeTab, setActiveTab] = useState(1);                 // months
    const [selectedTeam, setSelectedTeam] = useState(null);        // for non-associates
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // ── Main team dropdown (only fetched/used for non-associates) ───────────
    const { data: mainTeamsData } = useGet(
        isAssociate ? null : `${GET_ALL_MAIN_TEAM_DROPDOWN}?active=false`,
        { enabled: !isAssociate }
    );
    const mainTeamOptions = useMemo(() => {
        const raw = mainTeamsData?.data?.data;
        return Array.isArray(raw) ? raw : [];
    }, [mainTeamsData]);

    // ── Resolve which mainTeam value to send ────────────────────────────────
    // Associate → their own, hardcoded.   Other → from dropdown (optional).
    const effectiveMainTeam = isAssociate
        ? (userMainTeam || '')
        : (selectedTeam?.value || '');

    // ── Fetch leads ─────────────────────────────────────────────────────────
    const fetchLeads = (months, mainTeam) => {
        const { fromDate, toDate } = getDateRange(months);
        setIsLoading(true);

        const params = new URLSearchParams({ fromDate, toDate });
        if (mainTeam) params.append('mainTeam', mainTeam);

        ApiClient.get(`${GET_P100_LEADS_DOJ}?${params.toString()}`)
            .then((response) => {
                setIsLoading(false);
                if (response?.data?.status === 1) {
                    const raw = response.data.data;
                    // Handle both flat-array and paginated response shapes
                    const content = Array.isArray(raw) ? raw : (raw?.content || []);
                    const sortedContent = [...content].sort(
                        (a, b) => getAgingDaysByDoj(b.doj) - getAgingDaysByDoj(a.doj)
                    );

                    setLeads(sortedContent);
                } else {
                    setLeads([]);
                    toast.error(response?.data?.message || 'Failed to load leads');
                }
            })
            .catch((error) => {
                setIsLoading(false);
                setLeads([]);
                toast.error(error.message);
            });
    };

    // ── Refetch when tab or team filter changes ─────────────────────────────
    useEffect(() => {
        // For non-associates, wait until dropdown data is available
        // (so default fetch happens only once we know what teams exist)
        if (!isAssociate && mainTeamsData === undefined) return;
        fetchLeads(activeTab, effectiveMainTeam);
    }, [activeTab, effectiveMainTeam, isAssociate, mainTeamsData]);

    // ── Columns ─────────────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            name: 'SL No.',
            width: '80px',
            cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
        },
        {
            name: 'Associate',
            sortable: true,
            selector: (r) => r.name,
            cell: (r) => <WordWrapCell>{r.name + ' (' + r.employee_code + ')'}</WordWrapCell>,
        },
        {
            name: 'Team',
            sortable: true,
            selector: (r) => r.main_team,
            cell: (r) => <WordWrapCell>{r.main_team + '/' + r.s_team}</WordWrapCell>,
        },
        {
            name: 'Branch',
            sortable: true,
            selector: (r) => r.location,
            cell: (r) => <WordWrapCell>{r.location || '—'}</WordWrapCell>,
        },
        {
            name: 'Aging',
            sortable: true,
            selector: (r) => getAgingDaysByDoj(r.doj),
            sortFunction: (a, b) => getAgingDaysByDoj(b.doj) - getAgingDaysByDoj(a.doj), // Highest aging first
            cell: (r) => (
                <WordWrapCell>
                    {getAgingDaysByDoj(r.doj)} Days
                </WordWrapCell>
            ),
        },
        {
            name: 'P100 Count',
            sortable: true,
            selector: (r) => r.leadCount,
            cell: (r) => <WordWrapCell>{r.leadCount || 0}</WordWrapCell>,
        },
    ].map((c) => ({
        ...c,
        name: <span className="font-weight-bold fs-13">{c.name}</span>,
    })), []);

    const dateRange = getDateRange(activeTab);

    const totalP100Leads = useMemo(() => {
        return leads.reduce((sum, row) => sum + (row.leadCount || 0), 0);
    }, [leads]);

    return (
        <PageContent>
            <Breadcrumbs title="Reports" breadcrumbItem="P100 Report" />
            {isLoading && <ScreenLoader />}

            <Container fluid>
                {/* ── Filter card ────────────────────────────────────────── */}
                <Card>
                    <CardBody>
                        <Row className="g-3 align-items-end">
                            {/* Tabs */}
                            <Col md={isAssociate ? 12 : 7}>
                                <Label className="form-label">
                                    <FaCalendarAlt size={10} style={{ marginRight: 4 }} />
                                    Time Range
                                </Label>
                                <div style={{
                                    display: 'inline-flex',
                                    background: '#F1F5F9',
                                    padding: 4,
                                    borderRadius: 10,
                                    gap: 2,
                                }}>
                                    {TAB_OPTIONS.map((tab) => {
                                        const active = activeTab === tab.months;
                                        return (
                                            <button
                                                key={tab.months}
                                                type="button"
                                                onClick={() => setActiveTab(tab.months)}
                                                disabled={isLoading}
                                                style={{
                                                    padding: '7px 18px',
                                                    fontSize: 12.5,
                                                    fontWeight: 700,
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    background: active ? '#fff' : 'transparent',
                                                    color: active ? defaultTheme.primary : '#64748B',
                                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                                    boxShadow: active ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                                                    transition: 'all .15s',
                                                }}
                                            >
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, fontWeight: 600 }}>
                                    {formatDate(dateRange.fromDate)} → {formatDate(dateRange.toDate)}
                                </div>
                            </Col>

                            {/* Main team dropdown (non-associates only) */}
                            {!isAssociate && (
                                <Col md="5">
                                    <Label className="form-label">
                                        Main Team
                                        <span style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 500, marginLeft: 6 }}>
                                            (optional — leave empty for all teams)
                                        </span>
                                    </Label>
                                    <Select
                                        value={selectedTeam}
                                        onChange={setSelectedTeam}
                                        options={mainTeamOptions}
                                        isClearable
                                        placeholder="All teams"
                                        styles={RS_STYLES}
                                        menuPortalTarget={document.body}
                                        isDisabled={isLoading}
                                    />
                                </Col>
                            )}

                        </Row>
                    </CardBody>
                </Card>

                {/* ── Total count strip ──────────────────────────────────── */}
                <div style={{
                    background: '#fff',
                    border: '1px solid #E8ECF2',
                    borderRadius: 14,
                    marginBottom: 18,
                    padding: '16px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 14,
                    boxShadow: '0 1px 4px rgba(0,0,0,.04)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 48, height: 48,
                            borderRadius: 12,
                            background: `linear-gradient(135deg, ${defaultTheme.primary}, #007A6E)`,
                            color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18,
                        }}>
                            <FaInbox />
                        </div>
                        <div>
                            <div style={{
                                fontSize: 11, fontWeight: 700, color: '#94A3B8',
                                textTransform: 'uppercase', letterSpacing: '.5px',
                            }}>
                                Total P100 Leads
                            </div>
                            <div style={{
                                fontSize: 28, fontWeight: 800, color: defaultTheme.primary,
                                lineHeight: 1.1, marginTop: 2,
                            }}>
                                {totalP100Leads.toLocaleString('en-IN')}
                            </div>
                        </div>
                    </div>
                    <div style={{
                        fontSize: 12, color: '#475569',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        padding: '8px 14px',
                        borderRadius: 9,
                        fontWeight: 600,
                    }}>
                        Last <span style={{ color: defaultTheme.primary, fontWeight: 700 }}>
                            {activeTab} month{activeTab > 1 ? 's' : ''}
                        </span>
                        {effectiveMainTeam && (
                            <>
                                {' · Team: '}
                                <span style={{ color: defaultTheme.primary, fontWeight: 700 }}>
                                    {effectiveMainTeam}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Table ──────────────────────────────────────────────── */}
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={leads}
                    pagination
                />
            </Container>
        </PageContent>
    );
}