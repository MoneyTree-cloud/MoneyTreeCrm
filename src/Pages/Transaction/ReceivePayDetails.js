/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useLocation, useNavigate } from "react-router-dom";
import { defaultTheme } from "../../helpers/defaultTheme";
import { formatDate, formatDateForInput, generateTimestamp, WordWrapCell } from "../../helpers/function_helper";
import { GET_ALL_RECEIVE_PAYMENT } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import * as XLSX from 'xlsx-js-style';
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import PageContent from "../../components/Common/PageContent";
import { FaCheck, FaDownload, FaSearch, FaTimes, FaFileExcel } from "react-icons/fa";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

// ── Styles ─────────────────────────────────────────────────────────────────────
if (document.getElementById("rpd-s")) document.getElementById("rpd-s").remove()
const _s = document.createElement("style")
_s.id = "rpd-s"
_s.textContent = `
    /* Filter bar */
    .rpd-filter { background:#fff; border:1px solid #E8ECF2; border-radius:14px; padding:14px 18px; margin-bottom:14px; box-shadow:0 1px 4px rgba(0,0,0,.04); }
    .rpd-filter-row { display:flex; align-items:flex-end; gap:12px; flex-wrap:wrap; }
    .rpd-field { display:flex; flex-direction:column; gap:4px; flex:1; min-width:160px; }
    .rpd-label { font-size:10px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.5px; }
    .rpd-input { height:38px; padding:0 11px; border:1.5px solid #080808; border-radius:8px; font-size:13px; color:#0F172A; outline:none; transition:border-color .15s; background:#fff; width:100%; }
    .rpd-input:focus { border-color:#005B52; box-shadow:0 0 0 3px rgba(0,91,82,.08); }

    /* Buttons */
    .rpd-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 18px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; border:none; transition:all .15s; white-space:nowrap; flex-shrink:0; }
    .rpd-btn-primary   { background:linear-gradient(135deg,#005B52,#007A6E); color:#fff; }
    .rpd-btn-primary:hover { opacity:.88; }
    .rpd-btn-secondary { background:#F1F5F9; color:#475569; border:1.5px solid #E2E8F0; }
    .rpd-btn-secondary:hover { background:#E2E8F0; }
    .rpd-btn-excel { background:#F0FDF4; color:#166534; border:1.5px solid #BBF7D0; }
    .rpd-btn-excel:hover { background:#DCFCE7; }

    /* Excel row */
    .rpd-actions { display:flex; justify-content:flex-end; margin-bottom:10px; }
`
document.head.appendChild(_s)

const LIMIT = 100;

const buildUrl = (formState, page, extra = "", size) =>
    `${GET_ALL_RECEIVE_PAYMENT}&fromDate=${formState.fromDate}&toDate=${formState.toDate}&page=${page - 1}&size=${size || LIMIT}` +
    (formState.searchQuery ? `&key=SaleId&value=${formState.searchQuery}` : "") + extra;

const fetchAndDecrypt = async (url) => {
    const res = await ApiClient.get(url);
    if (res?.data?.status !== 1) throw new Error(res.data.message);
    return decryptData(res.data.data);
};

export default function ReceivePayDetails() {
    const navigate = useNavigate();
    const { userId, empCode } = useUserStore(s => s.user);
    const { state } = useLocation();
    const { formState_, page_ } = state || {};

    const [page, setPage] = useState(1);
    const [flag, setFlag] = useState(false);
    const [pending, setPending] = useState(false);
    const [receiveData, setReceiveData] = useState([]);
    const [accessGranted, setAccessGranted] = useState(null);
    const [formState, setFormState] = useState({ fromDate: "", toDate: "", searchQuery: "" });

    useEffect(() => { CheckUserAccess(userId, "receive-pay-details").then(setAccessGranted) }, [userId]);

    const loadData = async (url) => {
        setPending(true);
        try { const d = await fetchAndDecrypt(url); setReceiveData(d) }
        catch (e) { toast.error(e.message); setReceiveData([]) }
        finally { setPending(false) }
    };

    const getDefaultDates = () => {
        const now = new Date();
        return {
            fromDate: formatDateForInput(new Date(now.getFullYear(), now.getMonth() - 6, 1)),
            toDate: formatDateForInput(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
        };
    };

    const initLoad = () => {
        const dates = getDefaultDates();
        const fs = { ...dates, searchQuery: "" };
        setFormState(fs);
        loadData(buildUrl(fs, 1));
    };

    useEffect(() => {
        if (!accessGranted) return;
        if (formState_ || page_) {
            const fs = { fromDate: formState_?.fromDate || getDefaultDates().fromDate, toDate: formState_?.toDate || getDefaultDates().toDate, searchQuery: formState_?.searchQuery || "" };
            setFormState(fs); setPage(page_ || 1); loadData(buildUrl(fs, page_ || 1));
        } else { initLoad() }
    }, [accessGranted]);

    useEffect(() => { if (flag) loadData(buildUrl(formState, page)) }, [page]);

    const handleChange = e => setFormState(p => ({ ...p, [e.target.id]: e.target.value }));
    const handleShowData = e => { e.preventDefault(); setPage(1); loadData(buildUrl(formState, 1)) };
    const handleClear = () => { navigate("/receive-pay-details", { replace: true }); initLoad() };

    const handleDownload = async (row) => {
        try {
            const res = await fetch(imageBaseUrl + row.paymentAttachmentPath);
            if (!res.ok) throw new Error("Failed to fetch");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = Object.assign(document.createElement("a"), { href: url, download: row.paymentAttachmentPath || "download.jpg" });
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch { toast.error("Error downloading file. Please try again.") }
    };

    const downloadFilterDataExcel = async () => {
        setPending(true);
        try {
            const d = await fetchAndDecrypt(
                buildUrl(formState, 1, "", receiveData?.totalElements)
            );
            const rows = d?.content;
            if (!Array.isArray(rows) || !rows.length) {
                toast.info("No data to export.");
                return;
            }

            // ── Styles ─────────────────────────────────────────────────────────
            const BORDER = {
                top: { style: 'thin', color: { rgb: 'B7B7B7' } },
                bottom: { style: 'thin', color: { rgb: 'B7B7B7' } },
                left: { style: 'thin', color: { rgb: 'B7B7B7' } },
                right: { style: 'thin', color: { rgb: 'B7B7B7' } },
            };

            const TITLE_STYLE = {
                font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: 'FFFFFF' } },
                alignment: { horizontal: 'center', vertical: 'center' },
                fill: { patternType: 'solid', fgColor: { rgb: '005B52' } },
                border: BORDER,
            };

            const META_STYLE = {
                font: { name: 'Calibri', sz: 10, italic: true, color: { rgb: '475569' } },
                alignment: { horizontal: 'left', vertical: 'center' },
                fill: { patternType: 'solid', fgColor: { rgb: 'F8FAFC' } },
            };

            const HEADER_STYLE = {
                font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
                alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                fill: { patternType: 'solid', fgColor: { rgb: '005B52' } },
                border: BORDER,
            };

            const cellStyle = (rowIdx, opts = {}) => ({
                font: { name: 'Calibri', sz: 10, color: { rgb: '0F172A' }, ...(opts.font || {}) },
                alignment: { vertical: 'center', wrapText: true, ...(opts.alignment || {}) },
                fill: opts.fill || {
                    patternType: 'solid',
                    fgColor: { rgb: rowIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC' },
                },
                border: BORDER,
            });

            // Pretty header from camelCase / snake_case keys
            const prettifyHeader = (key) =>
                String(key)
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase())
                    .trim();

            // Parse value to number, stripping commas/currency/whitespace
            const toNumber = (v) => {
                if (v === null || v === undefined || v === '') return null;
                if (typeof v === 'number') return isFinite(v) ? v : null;
                const cleaned = String(v).trim().replace(/[^\d.-]/g, '');
                if (!cleaned || cleaned === '-' || cleaned === '.') return null;
                const n = Number(cleaned);
                return isFinite(n) ? n : null;
            };

            const isNumericColumn = (key) => {
                const values = rows.map((r) => r[key]);

                const nonEmptyValues = values.filter(
                    (v) => v !== null && v !== undefined && v !== ''
                );

                if (!nonEmptyValues.length) return false;

                return nonEmptyValues.every(
                    (v) => toNumber(v) !== null
                );
            };

            // Width tuned to longest value (capped at 50)
            const colWidth = (key) => {
                const headerLen = prettifyHeader(key).length;
                const maxValueLen = rows.reduce((max, row) => {
                    const v = row[key];
                    const len = v == null ? 0 : String(v).length;
                    return Math.max(max, len);
                }, 0);
                return { wch: Math.min(Math.max(headerLen, maxValueLen) + 2, 50) };
            };

            const excludedColumns = [
                'createdby',
                'updatedon',
                'updatedby',
                'paymentattachmentpath',
                'fileappstatus',
                'fileappdate',
                'fileuploaddate',
                'attachement1',
                'attachement2',
                'receivefilestatus',
                'approveddate',
                'createddate'
            ];

            const headers = Object.keys(rows[0]).filter(
                key => !excludedColumns.includes(key.toLowerCase())
            );
            // ── Build sheet ────────────────────────────────────────────────────
            // const headers = Object.keys(rows[0]);
            const totalCols = headers.length;
            const lastColLetter = XLSX.utils.encode_col(totalCols - 1);

            const ws = {};
            ws['!ref'] = `A1:${lastColLetter}${3 + rows.length}`;

            // Row 1: Title
            ws['A1'] = {
                v: 'Receive Pay Details',
                t: 's',
                s: TITLE_STYLE,
            };

            // Row 2: Meta
            const metaText =
                `Generated: ${new Date().toLocaleString('en-IN')}` +
                `   ·   Records: ${rows.length}` +
                (formState.searchQuery ? `   ·   Filter: Unique ID contains "${formState.searchQuery}"` : '');
            ws['A2'] = { v: metaText, t: 's', s: META_STYLE };

            // Row 3: Headers
            headers.forEach((key, ci) => {
                const addr = XLSX.utils.encode_cell({ c: ci, r: 2 });
                ws[addr] = { v: prettifyHeader(key), t: 's', s: HEADER_STYLE };
            });

            // Pre-compute numeric flag per column
            const numericFlags = headers.map(isNumericColumn);

            // Rows 4+: Data
            rows.forEach((row, ri) => {
                headers.forEach((key, ci) => {
                    const value = row[key];
                    const addr = XLSX.utils.encode_cell({ c: ci, r: 3 + ri });
                    const numValue = numericFlags[ci] ? toNumber(value) : null;
                    const isNum = numValue !== null;

                    ws[addr] = {
                        v: isNum ? numValue : (value ?? ''),
                        t: isNum ? 'n' : 's',
                        s: cellStyle(ri, {
                            alignment: { horizontal: numericFlags[ci] ? 'right' : 'left' },
                        }),
                    };
                });
            });

            // Merges: title + meta span all columns
            ws['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
            ];

            // Column widths, row heights, freeze panes
            ws['!cols'] = headers.map(colWidth);
            ws['!rows'] = [
                { hpt: 28 }, // Title
                { hpt: 22 }, // Meta (taller — filter line can be long)
                { hpt: 24 }, // Header
            ];
            ws['!freeze'] = { xSplit: 0, ySplit: 3 };

            // Workbook + save
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Receive Pay Details');
            XLSX.writeFile(wb, `receivePayFilterData_${generateTimestamp()}.xlsx`);
        } catch (e) {
            toast.error(e.message);
        } finally {
            setPending(false);
        }
    };

    const col = (label, selector, extra = {}) => ({
        name: <span className="font-weight-bold fs-13">{label}</span>,
        selector, sortable: true,
        cell: row => <WordWrapCell>{selector(row)}</WordWrapCell>,
        ...extra,
    });

    const columns = [
        { name: <span className="font-weight-bold fs-13">SL No.</span>, selector: (_, i) => i + 1, width: "3%" },
        ...(empCode !== "20006" ? [{
            name: <span className="font-weight-bold fs-13">Manage</span>, width: "3%",
            cell: row => <i className="ri-pencil-fill" onClick={() => navigate("/receive-pay-details/receive-pay", { state: { row, screen: "receivePay", formState, page, searchTerm: formState.searchQuery } })} style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }} />,
        }] : []),
        {
            name: <span className="font-weight-bold fs-13">File Upload</span>, width: "3%",
            cell: row => <i className="ri-pencil-fill" onClick={() => navigate("/receive-pay-details/receive-pay-file", { state: { transactionId: row.transactionId, formState, page, uniqueId: row.uniqueId } })} style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }} />,
        },
        { name: <span className="font-weight-bold fs-13">File Status</span>, selector: r => r.attachement1, cell: r => <WordWrapCell>{r.attachement1 ? <FaCheck color={defaultTheme.primary} size={14} title="File Uploaded" /> : "-"}</WordWrapCell> },
        { name: <span className="font-weight-bold fs-13">Download Proof</span>, selector: r => r.paymentAttachmentPath, cell: r => <WordWrapCell>{r.paymentAttachmentPath && r.paymentAttachmentPath !== "NULL" ? <FaDownload color={defaultTheme.goldColorLogo} size={18} style={{ cursor: "pointer" }} onClick={() => handleDownload(r)} title="Download" /> : "-"}</WordWrapCell> },
        col("Builder Name", r => r.builderName),
        col("Project Name", r => r.projectName),
        col("Unit Name", r => r.unitName),
        col("Created By", r => r.createdBy),
        col("Client Name", r => r.clientName),
        col("Created Date", r => formatDate(r.createdOn)),
        col("Unique ID", r => r.uniqueId),
        { name: <span className="font-weight-bold fs-13">Payment Proof Status</span>, selector: r => r.receiveFileStatus, cell: r => <WordWrapCell>{r.receiveFileStatus === 0 || r.receiveFileStatus == null ? "Pending For Upload" : r.receiveFileStatus === 1 ? "In Process" : "File Approved"}</WordWrapCell> },
        col("Mode of Payment", r => r.modeOfPayment),
        col("Bank Name", r => r.bankName),
        col("Cheque Date", r => formatDate(r.chequeDate)),
        col("Cheque No", r => r.chequeNo),
        col("Credit Amount", r => r.creditAmount),
        col("Debit Amount", r => r.debitAmount),
        col("Clearance Status", r => r.clearanceStatus === 'CancelOrBounce' ? "Cancel/Bounce" : r.clearanceStatus),
        col("Clearance Amount", r => r.clearanceAmount),
        col("Clearance Date", r => formatDate(r.clearanceDate)),
        col("Ops Remarks", r => r.remarks, { width: "10%" }),
        col("Finance Remarks", r => r.financeRemarks, { width: "10%" }),
    ];

    if (accessGranted === null) return <ScreenLoader />;
    if (!accessGranted) return <PermissionMissing />;

    return (
        <PageContent>
            {pending && <ScreenLoader />}
            <Breadcrumbs title="Transaction" breadcrumbItem="Receive Pay Details" />
            <Container fluid>

                {/* ── Filter bar ── */}
                <form onSubmit={handleShowData}>
                    <div className="rpd-filter">
                        <div className="rpd-filter-row">
                            {[
                                { id: "fromDate", label: "From Date", type: "date" },
                                { id: "toDate", label: "To Date", type: "date" },
                                { id: "searchQuery", label: "Unique ID", type: "text", placeholder: "Enter Unique ID…" },
                            ].map(({ id, label, type, placeholder }) => (
                                <div className="rpd-field" key={id}>
                                    <label className="rpd-label">{label}</label>
                                    <input id={id} className="rpd-input" type={type}
                                        placeholder={placeholder} value={formState[id]} onChange={handleChange} />
                                </div>
                            ))}
                            <button type="submit" className="rpd-btn rpd-btn-primary">
                                <FaSearch size={11} /> Search
                            </button>
                            <button type="button" className="rpd-btn rpd-btn-secondary" onClick={handleClear}>
                                <FaTimes size={11} /> Clear
                            </button>
                        </div>
                    </div>
                </form>

                {/* ── Excel download ── */}
                {receiveData?.content?.length > 0 && (
                    <div className="rpd-actions">
                        <button type="button" className="rpd-btn rpd-btn-excel" onClick={downloadFilterDataExcel}>
                            <FaFileExcel size={13} /> Download Excel
                        </button>
                    </div>
                )}

                <AppTable
                    progressPending={pending}
                    columns={columns}
                    data={receiveData?.content}
                    pagination
                    paginationTotalRows={receiveData?.totalElements || 0}
                    paginationServer
                    onChangePage={(newPage) => { setPage(newPage); setFlag(true) }}
                    conditionalRowStyles={[{
                        when: r => r.clearanceStatus === "CancelOrBounce",
                        style: { color: defaultTheme.redColor }
                    }]}
                />
            </Container>
        </PageContent>
    );
}