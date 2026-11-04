/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { Container } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { FaPlus, FaEdit, FaSyncAlt, FaFileExcel, FaLayerGroup, FaLock } from 'react-icons/fa';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient from '../../helpers/api_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { formatDate, generateTimestamp, WordWrapCell } from '../../helpers/function_helper';
import { GET_ALL_NFA_MASTER } from '../../helpers/url_helper';
import { useUserStore } from '../../store/useUserStore';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';

const PAGE_SIZE = 100;
const EDIT_WINDOW_MS = 72 * 60 * 60 * 1000;

// Records can only be edited within 72 hours of creation
export const isNfaEditable = (row) => {
    const created = row?.createdAt || row?.createdDate;
    if (!created) return false;
    const createdTime = new Date(created).getTime();
    if (Number.isNaN(createdTime)) return false;
    return Date.now() - createdTime <= EDIT_WINDOW_MS;
};

// Column order/labels shared by the table and the Excel export
const EXPORT_COLUMNS = [
    { header: 'Builder', key: 'builderName' },
    { header: 'Project', key: 'projectName' },
    { header: 'Slab', key: 'slabName' },
    { header: 'Master Plan', key: 'masterPlan' },
    { header: 'Total Slab (Agreement %)', key: 'totalSlabAgreement', numeric: true },
    { header: 'SMS (CAT 1)', key: 'smsCat1', numeric: true },
    { header: 'MT Slab', key: 'mtSlab', numeric: true },
    { header: 'Marketing', key: 'marketing', numeric: true },
    { header: 'Team Incentive MT', key: 'teamIncentiveMt', numeric: true },
    { header: 'Incentive Status MT', key: 'incentiveStatusMt' },
    { header: 'Incentive BD', key: 'incentiveBd', numeric: true },
    { header: 'Incentive Status', key: 'incentiveStatus' },
    { header: 'Remarks', key: 'remarks' },
];

// readOnly = "All NFA Master" screen: list + Excel download only, no create/edit
export default function NFAMaster({ readOnly = false }) {
    const { userId } = useUserStore((state) => state.user);
    const screenTitle = readOnly ? 'All NFA Master' : 'NFA Master';
    const navigate = useNavigate();
    const [accessGranted, setAccessGranted] = useState(null);

    const [rows, setRows] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, readOnly ? 'all-nfa-master' : 'nfa-master');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId, readOnly]);

    const fetchData = (pageNum) => {
        setIsLoading(true);
        ApiClient.get(`${GET_ALL_NFA_MASTER}?page=${pageNum}&size=${PAGE_SIZE}`)
            .then((response) => {
                setIsLoading(false);
                const payload = response?.data?.data;
                if (response?.data?.status === 1) {
                    setRows(payload?.content || []);
                    setTotalRows(payload?.totalElements ?? payload?.content?.length ?? 0);
                } else {
                    setRows([]);
                    setTotalRows(0);
                    if (response?.data?.status === 0) {
                        toast.error(response?.data?.message || 'Failed to load NFA list');
                    }
                }
            })
            .catch((error) => {
                setIsLoading(false);
                setRows([]);
                setTotalRows(0);
                toast.error(error.message || 'Network error');
            });
    };

    useEffect(() => {
        if (accessGranted) fetchData(page);
    }, [accessGranted, page]);

    const handleChangePage = (newPage) => {
        // react-data-table-component reports 1-indexed pages, API is 0-indexed
        setPage(newPage - 1);
    };

    const goToCreate = () => {
        navigate('/nfa-master/nfa-master-form', { state: { rowData: {} } });
    };

    const goToEdit = (row) => {
        if (!isNfaEditable(row)) {
            toast.info('Editing is allowed only within 72 hours of creation');
            return;
        }
        navigate('/nfa-master/nfa-master-form', { state: { rowData: row } });
    };

    // ── Excel export (fetches all records, not just the current page) ──────
    const handleExport = () => {
        if (!totalRows) return toast.info('No records to export');
        setIsExporting(true);
        ApiClient.get(`${GET_ALL_NFA_MASTER}?page=0&size=${totalRows}`)
            .then((response) => {
                setIsExporting(false);
                const data = response?.data?.data?.content || [];
                if (response?.data?.status !== 1 || data.length === 0) {
                    toast.error(response?.data?.message || 'No records to export');
                    return;
                }

                const columnsWithMeta = [
                    ...EXPORT_COLUMNS,
                    { header: 'Created At', key: 'createdAt', date: true },
                ];
                // plain sheet: one object per row, keys become the header row
                const sheetRows = data.map((row) => {
                    const out = {};
                    columnsWithMeta.forEach((col) => {
                        const value = row[col.key];
                        if (col.date) out[col.header] = formatDate(value);
                        else if (col.numeric && value !== null && value !== '' && !isNaN(Number(value))) out[col.header] = Number(value);
                        else out[col.header] = value ?? '';
                    });
                    return out;
                });
                const ws = XLSX.utils.json_to_sheet(sheetRows);

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'NFA Master');
                XLSX.writeFile(wb, `nfaMaster_${generateTimestamp()}.xlsx`);
            })
            .catch((error) => {
                setIsExporting(false);
                toast.error(error.message || 'Network error');
            });
    };

    // ── Table columns ───────────────────────────────────────────────────────
    const columns = useMemo(() => ([
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: '80px',
            cell: (_, i) => <WordWrapCell>{page * PAGE_SIZE + i + 1}</WordWrapCell>,
        },
        ...(readOnly ? [] : [{
            name: <span className="font-weight-bold fs-13">Action</span>,
            width: '90px',
            cell: (row) => (isNfaEditable(row) ? (
                <FaEdit
                    size={17}
                    style={{ cursor: 'pointer', color: defaultTheme.goldColorLogo }}
                    onClick={() => goToEdit(row)}
                    title="Edit NFA"
                />
            ) : (
                <FaLock size={14} color="#94A3B8" title="Edit window (72 hours) has expired" />
            )),
        }]),
        ...EXPORT_COLUMNS.map((col) => ({
            name: <span className="font-weight-bold fs-13">{col.header}</span>,
            selector: (row) => row[col.key],
            sortable: true,
            minWidth: col.key === 'remarks' ? '200px' : '130px',
            cell: (row) => <WordWrapCell>{row[col.key]}</WordWrapCell>,
        })),
        {
            name: <span className="font-weight-bold fs-13">Created At</span>,
            selector: (row) => row.createdAt,
            sortable: true,
            minWidth: '120px',
            cell: (row) => <WordWrapCell>{formatDate(row.createdAt)}</WordWrapCell>
        },
    ]), [page, readOnly]);

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />;
    }

    return (
        <PageContent>
            <Breadcrumbs title="Transaction" breadcrumbItem={screenTitle} />
            {(isLoading || isExporting) && <ScreenLoader />}

            <Container fluid>
                {/* ── Header strip ─────────────────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10,
                    background: '#fff',
                    border: '1px solid #E8ECF2',
                    borderRadius: 10,
                    padding: '12px 16px',
                    marginBottom: 14,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 40, height: 40,
                            borderRadius: 10,
                            background: `linear-gradient(135deg, ${defaultTheme.primary}, var(--mt-primary-light))`,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                        }}>
                            <FaLayerGroup />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                                {screenTitle} Records
                            </div>
                            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                                {totalRows} record{totalRows !== 1 ? 's' : ''} found
                                {!readOnly && ' · editable for 72 hours after creation'}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => fetchData(page)}
                            title="Refresh"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 7,
                                padding: '9px 14px', background: '#F1F5F9', color: '#475569',
                                border: '1px solid #E2E8F0', borderRadius: 8,
                                fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                            }}
                        >
                            <FaSyncAlt size={12} /> Refresh
                        </button>
                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={isExporting}
                            title="Download Excel"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 7,
                                padding: '9px 16px', background: '#1D6F42',
                                color: '#fff', border: 'none', borderRadius: 8,
                                fontSize: 12.5, fontWeight: 700,
                                cursor: isExporting ? 'not-allowed' : 'pointer',
                                opacity: isExporting ? 0.7 : 1,
                            }}
                        >
                            <FaFileExcel size={13} /> Download Excel
                        </button>
                    </div>
                </div>

                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={rows}
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    onChangePage={handleChangePage}
                    noDataComponent={
                        <div style={{
                            padding: '40px 20px', textAlign: 'center', color: '#94A3B8',
                            fontSize: 13, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: 10,
                        }}>
                            <FaLayerGroup size={32} color="#CBD5E1" />
                            <div>No NFA records found.</div>
                        </div>
                    }
                />
            </Container>

            {/* ── Floating create button ───────────────────────────────────── */}
            {!readOnly && <button
                type="button"
                onClick={goToCreate}
                title="Create NFA"
                aria-label="Create NFA"
                style={{
                    position: 'fixed', right: 28, bottom: 28, zIndex: 1000,
                    width: 56, height: 56, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${defaultTheme.primary}, var(--mt-primary-light))`,
                    color: '#fff', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 6px 18px rgba(var(--mt-primary-light-rgb), 0.35)',
                }}
            >
                <FaPlus size={20} />
            </button>}
        </PageContent>
    );
}
