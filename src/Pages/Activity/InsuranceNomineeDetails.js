import { useState, useEffect, useCallback } from 'react'
import AppTable from '../../components/Common/Table'
import PageContent from '../../components/Common/PageContent'
import Breadcrumbs from '../../components/Common/Breadcrumb'
import ScreenLoader from '../../constants/ScreenLoader'
import { Container } from 'reactstrap'
import { formatDateTime, generateTimestamp, WordWrapCell } from '../../helpers/function_helper'
import ApiClient from '../../helpers/api_helper'
import { toast } from 'react-toastify'
import { MdSearch, MdClose, MdPerson, MdBadge } from 'react-icons/md'
import { INSURANCE_NOMINEE_DETAILS } from '../../helpers/url_helper'
import { useUserStore } from '../../store/useUserStore'
import CheckUserAccess from '../../components/Common/CheckUserAccess'
import PermissionMissing from '../Utility/PermissonMissing'
import { FaFileExcel } from 'react-icons/fa'
import * as XLSX from "xlsx";

// ── Styles ──────────────────────────────────────────────────────────────────
if (document.getElementById("ind-s")) document.getElementById("ind-s").remove()
const _s = document.createElement("style")
_s.id = "ind-s"
_s.textContent = `
    /* ── Header ── */
    .ind-hdr {
        background:linear-gradient(135deg,#005B52 0%,#007A6E 60%,#00897B 100%);
        border-radius:14px; padding:18px 22px; margin-bottom:14px;
        display:flex; align-items:center; justify-content:space-between;
        flex-wrap:wrap; gap:10px; position:relative; overflow:hidden;
    }
    .ind-hdr::before {
        content:''; position:absolute; top:-40px; right:-40px;
        width:160px; height:160px; border-radius:50%;
        background:rgba(255,255,255,.05); pointer-events:none;
    }
    .ind-hdr-left  { position:relative; }
    .ind-hdr-title { font-size:18px; font-weight:800; color:#fff; display:flex; align-items:center; gap:8px; }
    .ind-hdr-sub   { font-size:12px; color:rgba(255,255,255,.65); margin-top:2px; }
    .ind-hdr-badge {
        display:inline-flex; align-items:center; gap:6px;
        padding:5px 14px; background:rgba(255,255,255,.15);
        border:1px solid rgba(255,255,255,.25); border-radius:20px;
        font-size:12px; font-weight:700; color:#fff; position:relative;
    }

    /* ── Toolbar ── */
    .ind-toolbar {
        display:flex; align-items:center; gap:10px; flex-wrap:wrap;
        background:#fff; border:1px solid #E8ECF2; border-radius:12px;
        padding:10px 16px; margin-bottom:14px;
        box-shadow:0 1px 4px rgba(0,0,0,.04);
    }
    .ind-search-wrap { display:flex; align-items:center; gap:0; flex:1; min-width:200px; position:relative; }
    .ind-search-icon { position:absolute; left:10px; color:#94A3B8; pointer-events:none; }
    .ind-search-input {
        height:38px; padding:0 36px 0 34px; border:1.5px solid #E2E8F0;
        border-radius:8px; font-size:13px; color:#0F172A;
        outline:none; flex:1; width:100%; transition:border-color .15s; background:#fff;
    }
    .ind-search-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }
    .ind-clear-x {
        position:absolute; right:10px; color:#94A3B8; cursor:pointer;
        display:flex; align-items:center; transition:color .15s;
    }
    .ind-clear-x:hover { color:#005B52; }
    .ind-count-chip {
        font-size:11px; font-weight:700; color:#64748B;
        background:#F1F5F9; border:1px solid #E2E8F0;
        border-radius:20px; padding:4px 12px; white-space:nowrap;
    }

    /* ── Relation chip ── */
    .ind-rel {
        display:inline-flex; align-items:center;
        padding:2px 10px; border-radius:20px;
        font-size:11px; font-weight:700;
    }
    .ind-rel-father   { background:#EFF6FF; color:#1E40AF; border:1px solid #BFDBFE; }
    .ind-rel-mother   { background:#FDF4FF; color:#7E22CE; border:1px solid #E9D5FF; }
    .ind-rel-brother  { background:#F0FDF4; color:#166534; border:1px solid #BBF7D0; }
    .ind-rel-spouse   { background:#FFF7ED; color:#9A3412; border:1px solid #FED7AA; }
    .ind-rel-daughter { background:#FFFBEB; color:#92400E; border:1px solid #FDE68A; }
    .ind-rel-son      { background:#F0F9FF; color:#0C4A6E; border:1px solid #BAE6FD; }
    .ind-rel-other    { background:#F8FAFC; color:#475569; border:1px solid #E2E8F0; }

     .ul-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; border:none; transition:all .15s; white-space:nowrap; }
    .ul-btn-primary   { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; }
    .ul-btn-primary:hover { opacity:.88; }
    .ul-btn-secondary { background:#F1F5F9; color:#475569; border:1.5px solid #E2E8F0; }
    .ul-btn-secondary:hover { background:#E2E8F0; }
    .ul-btn-add   { background:#FFFBEB; color:#92400E; border:1.5px solid #FDE68A; }
    .ul-btn-add:hover { background:#FEF3C7; }
    .ul-btn-excel { background:#F0FDF4; color:#166534; border:1.5px solid #BBF7D0; }
    .ul-btn-excel:hover { background:#DCFCE7; }
`
document.head.appendChild(_s)

const REL_CLASS = {
    Father: 'ind-rel-father',
    Mother: 'ind-rel-mother',
    Brother: 'ind-rel-brother',
    Spouse: 'ind-rel-spouse',
    Daughter: 'ind-rel-daughter',
    Son: 'ind-rel-son',
}

const RelChip = ({ value }) => (
    <span className={`ind-rel ${REL_CLASS[value] || 'ind-rel-other'}`}>
        {value || '—'}
    </span>
)

// ── Columns ───────────────────────────────────────────────────────────────────
const columns = [
    {
        name: <span className="font-weight-bold fs-13">#</span>,
        width: '56px',
        cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
    },
    {
        name: <span className="font-weight-bold fs-13">Emp Code</span>,
        selector: r => r.empCode,
        sortable: true,
        cell: r => (
            <WordWrapCell>
                <span style={{ fontWeight: 700, color: '#005B52' }}>{r.empCode || '—'}</span>
            </WordWrapCell>
        ),
    },
    {
        name: <span className="font-weight-bold fs-13">Employee Name</span>,
        selector: r => r.empName,
        sortable: true,
        cell: r => <WordWrapCell>{r.empName || '—'}</WordWrapCell>,
    },
    {
        name: <span className="font-weight-bold fs-13">Nominee Name</span>,
        selector: r => r.nomineeName,
        sortable: true,
        cell: r => <WordWrapCell>{r.nomineeName || '—'}</WordWrapCell>,
    },
    {
        name: <span className="font-weight-bold fs-13">Relation</span>,
        selector: r => r.nomineeRelation,
        sortable: true,
        cell: r => <WordWrapCell><RelChip value={r.nomineeRelation} /></WordWrapCell>,
    },
    {
        name: <span className="font-weight-bold fs-13">Created Date</span>,
        selector: r => r.createdDate,
        sortable: true,
        cell: r => <WordWrapCell>{formatDateTime(r.createdDate)}</WordWrapCell>,
    },
]

// ── Main Component ────────────────────────────────────────────────────────────
export default function InsuranceNomineeDetails() {
    const [data, setData] = useState([])
    const [pending, setPending] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const userId = useUserStore((state) => state.user.userId);
    const [accessGranted, setAccessGranted] = useState(null);

    const fetchData = useCallback(async () => {
        setPending(true)
        try {
            const res = await ApiClient.get(INSURANCE_NOMINEE_DETAILS)
            if (res?.data?.status === 1) {
                setData(res.data.data || [])
            } else {
                toast.error(res?.data?.message || 'Failed to load data')
            }
        } catch (err) {
            toast.error(err.message)
        } finally {
            setPending(false)
        }
    }, [])

    useEffect(() => {
        if (accessGranted) {
            fetchData()
        }
    }, [fetchData, accessGranted])

    // ── Filter: empCode OR empName ──
    const filtered = data.filter(r => {
        if (!searchTerm) return true
        const q = searchTerm.toLowerCase()
        return (
            String(r.empCode || '').toLowerCase().includes(q) ||
            String(r.empName || '').toLowerCase().includes(q)
        )
    })

    const downloadExcel = () => {
        if (!Array.isArray(data) || data.length === 0) return;

        // 1. Extract and modify the required headers
        const headers = ["SL No.", "Employee Code", "Employee Name", "Nominee Name", "Relation"];

        // 2. Format the data to match the new structure
        const formattedData = data.map((item, index) => [
            index + 1, // Sl No.
            item.empCode,
            item.empName,
            item.nomineeName,
            item.nomineeRelation
        ]);

        // 3. Add headers to the formatted data
        const finalData = [headers, ...formattedData];

        // 4. Create a worksheet from the final data
        const ws = XLSX.utils.aoa_to_sheet(finalData);

        // 5. Create a workbook and append the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Insurance Nominee Details");

        // 6. Write the file and trigger download
        XLSX.writeFile(wb, `InsuranceNomineeDetails_${generateTimestamp()}.xlsx`);
        return;
    }

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'insurance-nominee-details');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            {pending && <ScreenLoader />}

            <Breadcrumbs title="Insurance" breadcrumbItem="Nominee Details" />

            <Container fluid={true}>

                {/* ── Header ── */}
                <div className="ind-hdr">
                    <div className="ind-hdr-left">
                        <div className="ind-hdr-title">
                            <MdPerson size={20} /> Insurance Nominee Details
                        </div>
                        <div className="ind-hdr-sub">All registered insurance nominee records</div>
                    </div>
                    <div className="ind-hdr-badge">
                        <MdBadge size={13} /> {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
                    </div>
                </div>

                {/* ── Toolbar ── */}
                <div className="ind-toolbar">
                    <div className="ind-search-wrap">
                        <MdSearch size={15} className="ind-search-icon" />
                        <input
                            className="ind-search-input"
                            type="text"
                            placeholder="Search by Emp Code or Employee Name…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <span className="ind-clear-x" onClick={() => setSearchTerm('')}>
                                <MdClose size={14} />
                            </span>
                        )}
                    </div>
                    {searchTerm && (
                        <span className="ind-count-chip">
                            {filtered.length} of {data.length}
                        </span>
                    )}
                    <button type="button" className="ul-btn ul-btn-excel" onClick={downloadExcel}>
                        <FaFileExcel size={12} /> Excel
                    </button>
                </div>

                {/* ── Table ── */}
                <AppTable
                    progressPending={pending}
                    columns={columns}
                    data={filtered}
                    pagination
                />

            </Container>
        </PageContent>
    )
}