/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { Container } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaSyncAlt, FaClipboardList } from 'react-icons/fa';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient from '../../helpers/api_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { formatDate, WordWrapCell } from '../../helpers/function_helper';
import { GET_ALL_BOOKING_ANNEXURE } from '../../helpers/url_helper';
import { useUserStore } from '../../store/useUserStore';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';

const PAGE_SIZE = 100;

export default function BookingDetails() {
    const { userId } = useUserStore((state) => state.user);
    const navigate = useNavigate();
    const [accessGranted, setAccessGranted] = useState(null);

    const [rows, setRows] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'booking-details');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const fetchData = (pageNum) => {
        setIsLoading(true);
        ApiClient.get(`${GET_ALL_BOOKING_ANNEXURE}?page=${pageNum}&size=${PAGE_SIZE}`)
            .then((response) => {
                setIsLoading(false);
                const payload = response?.data?.data;
                if (response?.data?.status === 0) {
                    setRows([]);
                    setTotalRows(0);
                    toast.error(response?.data?.message || 'Failed to load booking details list');
                    return;
                }
                if (response?.data?.status === 1) {
                    setRows(payload.content);
                    setTotalRows(payload.totalElements ?? payload.content.length);
                } else {
                    setRows([]);
                    setTotalRows(0);
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
        navigate('/booking-details/booking-details-form', { state: { rowData: {} } });
    };

    const goToEdit = (row) => {
        navigate('/booking-details/booking-details-form', { state: { rowData: row } });
    };

    // ── Table columns ───────────────────────────────────────────────────────
    const columns = useMemo(() => ([
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: '80px',
            cell: (_, i) => <WordWrapCell>{page * PAGE_SIZE + i + 1}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            width: '90px',
            cell: (row) => (
                <FaEdit
                    size={17}
                    style={{ cursor: 'pointer', color: defaultTheme.goldColorLogo }}
                    onClick={() => goToEdit(row)}
                    title="Edit Booking Details"
                />
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">MTRS ID</span>,
            selector: (row) => row.mtrsId,
            sortable: true,
            width: '100px',
            cell: (row) => <WordWrapCell>{row.mtrsId}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Booking Date</span>,
            selector: (row) => row.dateOfBooking,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.dateOfBooking)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Associate</span>,
            selector: (row) => row.associateName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.associateName} ({row.associateId})</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Builder</span>,
            selector: (row) => row.builderName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Project</span>,
            selector: (row) => row.projectName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row.clientName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Unit No.</span>,
            selector: (row) => row.unitNo,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.unitNo}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">BSP</span>,
            selector: (row) => row.bsp,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.bsp}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Area</span>,
            selector: (row) => row.area,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.area}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">BBA Value</span>,
            selector: (row) => row.bbaValue,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.bbaValue}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Location</span>,
            selector: (row) => row.location,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.location}</WordWrapCell>
        },
    ]), [page]);

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />;
    }

    return (
        <PageContent>
            <Breadcrumbs title="Transaction" breadcrumbItem="Booking Details" />
            {isLoading && <ScreenLoader />}

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
                            background: `linear-gradient(135deg, ${defaultTheme.primary}, #007A6E)`,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                        }}>
                            <FaClipboardList />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                                Booking Details Records
                            </div>
                            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                                {totalRows} record{totalRows !== 1 ? 's' : ''} found
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
                            onClick={goToCreate}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 7,
                                padding: '9px 16px',
                                background: `linear-gradient(135deg, ${defaultTheme.primary}, #007A6E)`,
                                color: '#fff', border: 'none', borderRadius: 8,
                                fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                            }}
                        >
                            <FaPlus size={12} /> Create Booking Details
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
                            <FaClipboardList size={32} color="#CBD5E1" />
                            <div>No booking details records found.</div>
                        </div>
                    }
                />
            </Container>
        </PageContent>
    );
}
