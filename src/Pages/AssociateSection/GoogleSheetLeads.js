/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useEffect } from 'react'
import PageContent from '../../components/Common/PageContent'
import Breadcrumbs from '../../components/Common/Breadcrumb'
import { Container } from 'reactstrap'
import AppTable from '../../components/Common/Table'
import { formatDateTime, getDuration, WordWrapCell } from '../../helpers/function_helper'
import ApiClient from '../../helpers/api_helper'
import { toast } from 'react-toastify'
import ScreenLoader from '../../constants/ScreenLoader'
import { MdEmail, MdMobileFriendly, } from 'react-icons/md'
import { FaUserCheck } from 'react-icons/fa'
import { CREATE_SUSPECT, GET_GOOGLE_SHEET_LEADS, GET_MY_ALL_TEAM, UPDATE_GOOGLE_SHEET_LEADS } from '../../helpers/url_helper'
import { defaultTheme } from '../../helpers/defaultTheme'
import { useUserStore } from '../../store/useUserStore'
import Select from 'react-select'
import { useGet } from '../../Hooks/useApi'
import "../CSS/styles.css";

// ── Styles ─────────────────────────────────────────────────────────────────────
if (document.getElementById("imd-s")) document.getElementById("imd-s").remove()
const _s = document.createElement("style")
_s.id = "imd-s"
_s.textContent = `
    .imd-hdr { background:linear-gradient(135deg,#005B52 0%,#007A6E 60%,#00897B 100%); border-radius:16px; padding:20px 26px; margin-bottom:16px; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
    .imd-hdr::before { content:''; position:absolute; top:-40px; right:-40px; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,.05); pointer-events:none; }
    .imd-hdr::after  { content:''; position:absolute; bottom:-50px; left:60px; width:140px; height:140px; border-radius:50%; background:rgba(255,255,255,.04); pointer-events:none; }
    .imd-hdr-title { font-size:20px; font-weight:800; color:#fff; display:flex; align-items:center; gap:10px; position:relative; }
    .imd-hdr-sub { font-size:12px; color:rgba(255,255,255,.65); margin-top:3px; position:relative; }
    .imd-hdr-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.25); border-radius:20px; font-size:12px; font-weight:700; color:#fff; position:relative; }

    .imd-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:10px 16px; margin-bottom:14px; box-shadow:0 1px 4px rgba(0,0,0,.04); }
    .imd-search-wrap { display:flex; align-items:center; gap:8px; flex:1; min-width:200px; position:relative; }
    .imd-search-input { height:38px; padding:0 12px 0 34px; border:1.5px solid #080808; border-radius:8px; font-size:13px; color:#0F172A; outline:none; flex:1; transition:border-color .15s; background:#fff; }
    .imd-search-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }
    .imd-search-icon { position:absolute; left:10px; right:10px; color:#94A3B8; pointer-events:none; }
    .imd-clear-btn { display:inline-flex; align-items:center; gap:5px; padding:7px 14px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; border:1.5px solid #E2E8F0; background:#F8FAFC; color:#64748B; transition:all .15s; }
    .imd-clear-btn:hover { background:#E2E8F0; }

    .imd-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:14px; margin-bottom:16px; }
    @media(max-width:700px){ .imd-grid { grid-template-columns:1fr; } }

    .imd-card { background:#fff; border:1px solid #E2E8F0; border-radius:14px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.04); transition:all .2s; }
    .imd-card:hover { border-color:#007A6E; box-shadow:0 4px 16px rgba(0,91,82,.1); transform:translateY(-2px); }
    .imd-card-hdr { background:linear-gradient(135deg,#F0FDF9,#E6FAF5); padding:14px 16px; display:flex; align-items:center; gap:12px; border-bottom:1px solid #E2E8F0; }
    .imd-card-avatar { width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#005B52,#007A6E); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .imd-card-name { font-size:14px; font-weight:800; color:#0F172A; }
    .imd-card-body { padding:14px 16px; display:flex; flex-direction:column; gap:8px; }
    .imd-card-row { display:flex; align-items:center; gap:8px; font-size:12px; color:#374151; }
    .imd-card-row-icon { color:#005B52; flex-shrink:0; }
    .imd-card-row-label { color:#94A3B8; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.4px; min-width:70px; }
    .imd-card-row-val { font-size:12px; font-weight:600; color:#0F172A; word-break:break-word; }
    .imd-card-footer { padding:10px 16px; border-top:1px solid #F1F5F9; display:flex; gap:8px; flex-wrap:wrap; }
    .imd-chip { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; }
    .imd-chip-green  { background:#F0FDF4; color:#166534; border:1px solid #BBF7D0; }
    .imd-chip-blue   { background:#EFF6FF; color:#1E40AF; border:1px solid #BFDBFE; }
    .imd-chip-gold   { background:#FFFBEB; color:#92400E; border:1px solid #FDE68A; }
    .imd-chip-purple { background:#F5F3FF; color:#5B21B6; border:1px solid #DDD6FE; }

    .imd-view-toggle { display:flex; gap:4px; }
    .imd-view-btn { width:34px; height:34px; border-radius:8px; border:1.5px solid #E2E8F0; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; }
    .imd-view-btn.active { background:#005B52; border-color:#005B52; color:#fff; }

    .imd-empty { text-align:center; padding:50px 20px; color:#94A3B8; }
    .imd-empty-icon { font-size:48px; margin-bottom:12px; opacity:.5; }

    @media(max-width:600px){
        .imd-hdr { padding:14px 16px; }
        .imd-hdr-title { font-size:17px; }
        .imd-toolbar { flex-direction:column; align-items:stretch; }
    }
`
document.head.appendChild(_s)

const SEL_STYLES = {
    control: (b, st) => ({ ...b, minHeight: 38, fontSize: 13, border: `1.5px solid ${st.isFocused ? "#005B52" : "#374151"}`, borderRadius: 8, boxShadow: st.isFocused ? "0 0 0 3px rgba(0,91,82,.08)" : "none" }),
    option: (b, st) => ({ ...b, fontSize: 13, background: st.isSelected ? "#005B52" : st.isFocused ? "#f0fdf9" : "#fff", color: st.isSelected ? "#fff" : "#0F172A" }),
    placeholder: b => ({ ...b, color: "#9CA3AF", fontSize: 13 }),
    menuPortal: b => ({ ...b, zIndex: 9999 }),
}

export default function GoogleSheetLeads() {
    const [data, setData] = useState([])
    const [pending, setPending] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const { parentUserId, empCode } = useUserStore(s => s.user)
    const [selectedUsers, setSelectedUsers] = useState({})

    const { data: usersList } = useGet(`${GET_MY_ALL_TEAM}${parentUserId}`, { enabled: Boolean(parentUserId) });

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = useCallback(() => {
        setPending(true)
        ApiClient.get(GET_GOOGLE_SHEET_LEADS)
            .then(res => {
                setPending(false)
                if (res?.data?.status === 1) {
                    const raw = res.data.data
                    if (empCode === "1" || empCode === "1670") {
                        setData(raw)
                        return
                    }
                    else {
                        const filteredData = raw.filter(
                            (item) => String(item.associateCode) === String(empCode)
                        );
                        setData(filteredData);
                    }
                } else {
                    toast.error(res.data.message)
                }
            })
            .catch(err => { setPending(false); toast.error(err.message) })
    }, [])

    const handleUserChange = (rowId, selectedOption) => {
        setSelectedUsers(prev => ({ ...prev, [rowId]: selectedOption }))
    }

    // ── Updated handleAssign — uses new field names + new URL structure ──
    const handleAssign = async (row) => {
        const selected = selectedUsers[row.id]
        if (!selected) { toast.error("Please select a user"); return }
        const confirm = window.confirm("Are you sure you want to assign this user?")
        if (!confirm) return

        setPending(true)

        const params = new URLSearchParams({
            campaignId: row.campaignId || '',
            campaign_name: row.campaign_name || '',
            full_name: row.full_name || '',
            phone: row.phone || '',
            customerEmail: row.customerEmail || '',
            associateCode: row.associateCode || '',
            assignToName: selected.label,
            assignToCode: selected.value,
            isTransfered: true
        }).toString()

        const urlWithParams = `${UPDATE_GOOGLE_SHEET_LEADS}/${row.id}?${params}`

        ApiClient.put(urlWithParams)
            .then(res => {
                if (res?.data?.status === 1) {
                    const request = {
                        leadName: row.full_name || 'N/A',
                        leadMobile: row.phone || 'N/A',
                        remark: "N/A",
                        project: row.campaign_name || "N/A",
                        projectCategory: "Meta",
                    }
                    ApiClient.post(`${CREATE_SUSPECT}${selected?.value}`, request)
                        .then(response => {
                            setPending(false)
                            if (response?.data?.status === 1) {
                                toast.success('Assigned Successfully')
                                fetchData()
                                setSelectedUsers(prev => ({ ...prev, [row.id]: null }))
                            } else {
                                toast.error(response.data.message)
                            }
                        })
                        .catch(err => { setPending(false); toast.error(err.message) })
                } else {
                    toast.error(res.data.message)
                    setPending(false)
                }
            })
            .catch(err => { setPending(false); toast.error(err.message) })
    }

    // ── Filter — updated field names ──
    const filtered = data?.filter(r => {
        const matchesSearch =
            !searchTerm ||
            r.campaign_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.assignToName?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
    })

    // ── Table columns — updated field names ──
    const columns = [
        { name: <span className="font-weight-bold fs-13">#</span>, width: "4%", cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell> },
        ...(['1', '1670'].includes(empCode)
            ? [
                { name: <span className="font-weight-bold fs-13">Associate Code</span>, selector: r => r.associateCode, sortable: true, cell: r => <WordWrapCell>{r.associateCode}</WordWrapCell> },
            ]
            : []),
        { name: <span className="font-weight-bold fs-13">Campaign Name</span>, selector: r => r.campaign_name, sortable: true, cell: r => <WordWrapCell>{r.campaign_name}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Mobile No.</span>, cell: r => <div className="phone-container"><MdMobileFriendly className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{r.phone}</span></div> },
        { name: <span className="font-weight-bold fs-13">Email</span>, cell: r => <div className="phone-container"><MdEmail className="phone-icon" color={defaultTheme.goldColorLogo} /><span className="phone-number">{r.email}</span></div> },
        { name: <span className="font-weight-bold fs-13">Customer Name</span>, selector: r => r.full_name, sortable: true, cell: r => <WordWrapCell>{r.full_name || '—'}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Created At</span>, selector: r => r.createdDate, sortable: true, cell: r => <WordWrapCell>{formatDateTime(r.createdDate)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Assigned At</span>, selector: r => r.updatedDate, sortable: true, cell: r => <WordWrapCell>{formatDateTime(r.updatedDate) || '—'}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Assign Duration</span>, cell: r => <WordWrapCell>{getDuration(r.createdDate, r.updatedDate)}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Assigned To</span>, selector: r => r.assignToName, sortable: true, cell: r => <WordWrapCell>{r.assignToName || '—'}</WordWrapCell> },
        {
            name: "Assign User",
            width: "280px",
            cell: row => (
                <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                    <div style={{ flex: 1 }}>
                        <Select
                            options={Array.isArray(usersList?.data?.data) ? usersList?.data?.data : []}
                            value={selectedUsers[row.id] || null}
                            onChange={opt => handleUserChange(row.id, opt)}
                            placeholder="Select user"
                            isClearable
                            styles={SEL_STYLES}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                        />
                    </div>
                    <button
                        disabled={!selectedUsers[row.id]}
                        onClick={() => handleAssign(row)}
                        title="Assign"
                        style={{
                            height: 40, width: 40, display: "flex", alignItems: "center", justifyContent: "center",
                            background: selectedUsers[row.id] ? "#005B52" : "#CBD5E1",
                            color: "#fff", border: "none", borderRadius: 8,
                            cursor: selectedUsers[row.id] ? "pointer" : "not-allowed", transition: "all 0.2s ease"
                        }}
                    >
                        <FaUserCheck size={20} />
                    </button>
                </div>
            )
        }
    ]

    return (
        <PageContent>
            {pending && <ScreenLoader />}
            <Container fluid>
                <Breadcrumbs title="Leads" breadcrumbItem="Meta Leads" />

                {/* ── Toolbar ── */}
                <div className="imd-toolbar">
                    <div className="imd-search-wrap">
                        <input
                            className="imd-search-input form-control"
                            type="text"
                            placeholder="Search by campaign name, assigned user..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* ── Table View ── */}
                <AppTable
                    columns={columns}
                    data={filtered}
                    pagination
                    progressPending={pending}
                />
            </Container>
        </PageContent>
    )
}