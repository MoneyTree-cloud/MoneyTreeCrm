/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { Col, Container, Label, Row } from 'reactstrap';
import Select from '../../components/Common/AppSelect';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaSyncAlt, FaFileExcel, FaLayerGroup, FaLock, FaSearch, FaTimes, FaTrashAlt, FaEye } from 'react-icons/fa';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient, { imageBaseUrl } from '../../helpers/api_helper';
import { getFileIcon } from '../../constants/global';
import { defaultTheme } from '../../helpers/defaultTheme';
import { formatDate, generateTimestamp, Note, Notes, WordWrapCell } from '../../helpers/function_helper';
import { useGet } from '../../Hooks/useApi';
import {
    CHANGE_NFA_STATUS,
    DOWNLOAD_NFA_EXCEL,
    GET_ALL_NFA_MASTER,
    GET_DROPDOWN_BUILDER_,
    GET_PROJECT_BY_BUILDER_,
} from '../../helpers/url_helper';
import { useUserStore } from '../../store/useUserStore';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';

const PAGE_SIZE = 100;
const EMPTY_FILTERS = { builder: null, project: null, nfaId: '' };

// inactive (disabled) NFAs show in red on both screens
const INACTIVE_ROW_STYLES = [
    {
        when: (row) => row.status !== 'YES',
        style: { color: defaultTheme.redColor, backgroundColor: 'rgba(255, 0, 0, 0.04)' },
    },
];
const EDIT_WINDOW_MS = 72 * 60 * 60 * 1000;

// API sends "2026-11-08 12:55:04" — the "T" form parses in every browser (Safari rejects the space)
const getCreatedDate = (row) => {
    const value = row?.createdDate || row?.createdAt;
    return typeof value === 'string' ? value.replace(' ', 'T') : value;
};

// Path of the uploaded attachment (key name not fixed yet on the API side)
export const getNfaFile = (row) => row?.file || row?.filePath || row?.fileName || row?.attachment || null;

// Records can only be edited within 72 hours of creation
export const isNfaEditable = (row) => {
    const created = getCreatedDate(row);
    if (!created) return false;
    const createdTime = new Date(created).getTime();
    if (Number.isNaN(createdTime)) return false;
    return Date.now() - createdTime <= EDIT_WINDOW_MS;
};

// Column order/labels shared by the table and the Excel export
const EXPORT_COLUMNS = [
    { header: 'NFA ID', key: 'nfaId' },
    // builder / project come as nested masters ("bulderName" is the API's spelling)
    { header: 'Builder', key: 'builder', get: (row) => row.builderMaster?.bulderName ?? row.builderMaster?.builderId },
    { header: 'Project', key: 'project', get: (row) => row.projectMaster?.projectName ?? row.projectMaster?.mappingId },
    { header: 'Master Plan', key: 'masterPlan' },
    { header: 'Total Slab (Agreement %)', key: 'totalSlab' },
    { header: 'SMS (CAT 1)', key: 'sms' },
    { header: 'MT Slab', key: 'mtSlab' },
    { header: 'Marketing', key: 'marketing' },
    { header: 'Team Incentive MT', key: 'teamIncentive' },
    { header: 'Incentive Status', key: 'incentiveStatus' },
    { header: 'Incentive BD', key: 'incentiveBd' },
    { header: 'Remarks', key: 'remarks' },
    { header: 'Created By', key: 'createdBy' },
];

const cellValue = (row, col) => (col.get ? col.get(row) : row[col.key]) ?? '';

// readOnly = "All NFA Master" screen: every user's records, list + Excel download only.
// Otherwise "NFA Master": the logged-in user's records with create / edit / enable-disable.
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
    // draft = what is typed / picked, filters = what the list was last searched with
    const [draft, setDraft] = useState(EMPTY_FILTERS);
    const [filters, setFilters] = useState(EMPTY_FILTERS);

    const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_, { enabled: Boolean(accessGranted) });
    const { data: projectList, isLoading: projectsLoading } = useGet(
        `${GET_PROJECT_BY_BUILDER_}${draft.builder?.value}`,
        { enabled: Boolean(draft.builder?.value) }
    );

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, readOnly ? 'all-nfa-master' : 'nfa-master');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId, readOnly]);

    const listUrl = (pageNum, size) => {
        let url = `${GET_ALL_NFA_MASTER}?page=${pageNum}&size=${size}`;
        if (filters.nfaId) url += `&nfaId=${encodeURIComponent(filters.nfaId)}`;
        if (filters.builder) url += `&builderId=${filters.builder.value}`;
        if (filters.project) url += `&projectId=${filters.project.value}`;
        if (!readOnly) url += `&loginId=${userId}`;
        return url;
    };

    const fetchData = (pageNum) => {
        setIsLoading(true);
        ApiClient.get(listUrl(pageNum, PAGE_SIZE))
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
    }, [accessGranted, page, filters]);

    const handleChangePage = (newPage) => {
        // react-data-table-component reports 1-indexed pages, API is 0-indexed
        setPage(newPage - 1);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        setFilters({ ...draft, nfaId: draft.nfaId.trim() });
    };

    const clearSearch = () => {
        setDraft(EMPTY_FILTERS);
        setPage(0);
        setFilters(EMPTY_FILTERS);
    };

    const hasFilters = Boolean(filters.nfaId || filters.builder || filters.project);

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

    // Delete = disable (status NO); the record then drops out of the list
    const handleDelete = (row) => {
        if (!window.confirm(`Are you sure you want to delete NFA ${row.nfaId || ''}?`)) return;
        setIsLoading(true);
        ApiClient.put(`${CHANGE_NFA_STATUS}${row.id}?status=NO`)
            .then((response) => {
                setIsLoading(false);
                if (response?.data?.status === 0) {
                    toast.error(response.data.message || 'Delete failed');
                    return;
                }
                toast.success(response?.data?.message || 'NFA deleted successfully');
                fetchData(page);
            })
            .catch((error) => {
                setIsLoading(false);
                toast.error(error.message || 'Network error');
            });
    };

    // ── Excel file comes from the backend (own records only on NFA Master) ──
    const downloadExcel = () => {
        setIsExporting(true);
        const url = readOnly ? DOWNLOAD_NFA_EXCEL : `${DOWNLOAD_NFA_EXCEL}?loginId=${userId}`;
        ApiClient.get(url, { responseType: 'arraybuffer' })
            .then((response) => {
                setIsExporting(false);
                const contentType = response.headers['content-type'];
                if (contentType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                    try {
                        const parsedError = JSON.parse(new TextDecoder('utf-8').decode(new Uint8Array(response.data)));
                        toast.error(parsedError.message || 'Something went wrong!');
                    } catch {
                        toast.error('Unexpected error occurred!');
                    }
                    return;
                }
                const blob = new Blob([response.data], { type: contentType });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = `${readOnly ? 'allNfaMaster' : 'nfaMaster'}_${generateTimestamp()}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
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
            width: '100px',
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {isNfaEditable(row) ? (
                        <FaEdit
                            size={17}
                            style={{ cursor: 'pointer', color: defaultTheme.goldColorLogo }}
                            onClick={() => goToEdit(row)}
                            title="Edit NFA"
                        />
                    ) : (
                        <FaLock size={14} color="#94A3B8" title="Edit window (72 hours) has expired" />
                    )}
                    {row.status === 'YES' && (
                        <FaTrashAlt
                            size={15}
                            style={{ cursor: 'pointer', color: defaultTheme.redColor }}
                            onClick={() => handleDelete(row)}
                            title="Delete NFA"
                        />
                    )}
                </div>
            ),
        }]),
        ...EXPORT_COLUMNS.map((col) => ({
            name: <span className="font-weight-bold fs-13">{col.header}</span>,
            selector: (row) => cellValue(row, col),
            sortable: true,
            cell: (row) => <WordWrapCell>{cellValue(row, col)}</WordWrapCell>,
        })),
        {
            name: <span className="font-weight-bold fs-13">File</span>,
            width: '80px',
            cell: (row) => {
                const file = getNfaFile(row);
                return file ? (
                    <a
                        href={`${imageBaseUrl}${file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Preview ${file.split('/').pop()}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        {getFileIcon(file)}
                        <FaEye size={14} color={defaultTheme.primary} />
                    </a>
                ) : (
                    <span style={{ color: '#94A3B8' }}>-</span>
                );
            },
        },
        {
            name: <span className="font-weight-bold fs-13">Created At</span>,
            selector: (row) => getCreatedDate(row),
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(getCreatedDate(row))}</WordWrapCell>
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

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
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
                            onClick={downloadExcel}
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

                {/* ── Filters: Builder → Project, NFA ID ───────────────────── */}
                <form
                    onSubmit={handleSearch}
                    style={{
                        background: '#fff', border: '1px solid #E8ECF2', borderRadius: 10,
                        padding: '12px 16px', marginBottom: 14,
                    }}
                >
                    <Row className="g-2 align-items-end">
                        <Col md={3}>
                            <Label className="form-label">Builder</Label>
                            <Select
                                options={builderList?.data?.data || []}
                                value={draft.builder}
                                onChange={(opt) => setDraft((prev) => ({ ...prev, builder: opt, project: null }))}
                                isClearable
                                placeholder="All Builders"
                            />
                        </Col>
                        <Col md={3}>
                            <Label className="form-label">Project</Label>
                            <Select
                                options={projectList?.data?.data || []}
                                value={draft.project}
                                onChange={(opt) => setDraft((prev) => ({ ...prev, project: opt }))}
                                isLoading={Boolean(draft.builder) && projectsLoading}
                                isDisabled={!draft.builder}
                                isClearable
                                placeholder={draft.builder ? 'All Projects' : 'Select Builder first'}
                            />
                        </Col>
                        <Col md={3}>
                            <Label className="form-label">NFA ID</Label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="NFA ID"
                                value={draft.nfaId}
                                onChange={(e) => setDraft((prev) => ({ ...prev, nfaId: e.target.value }))}
                            />
                        </Col>
                        <Col md={3} className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary d-inline-flex align-items-center gap-2">
                                <FaSearch size={12} /> Search
                            </button>
                            {hasFilters && (
                                <button type="button" className="btn btn-secondary d-inline-flex align-items-center gap-2" onClick={clearSearch}>
                                    <FaTimes size={12} /> Clear
                                </button>
                            )}
                        </Col>
                    </Row>
                </form>

                {!readOnly && (
                    <Notes style={{ margin: '0 0 12px' }}>
                        <Note tone="gold">An NFA can be edited only within 72 hours of its creation. After that it is locked.</Note>
                    </Notes>
                )}

                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={rows}
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    onChangePage={handleChangePage}
                    conditionalRowStyles={INACTIVE_ROW_STYLES}
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
