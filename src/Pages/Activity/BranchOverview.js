/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
    FaDownload,
    FaUsers, FaUserCheck, FaHandshake, FaCalendarAlt,
    FaFileSignature, FaBookmark, FaMapMarkerAlt,
} from "react-icons/fa";
import { LuTrendingUp, LuTrendingDown, LuArrowLeftRight } from "react-icons/lu";
import {
    Container, Card, CardBody, Row, Col,
    Modal, ModalHeader, ModalBody, ModalFooter, Button
} from "reactstrap";
import { toast } from "react-toastify";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PageContent from "../../components/Common/PageContent";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import ApiClient, { assetImageBaseUrl } from "../../helpers/api_helper";
import { BRANCH_WISE_DATA, BRANCH_WISE_GRAPH_DATA } from "../../helpers/url_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
    CartesianGrid, LabelList, Legend,
} from "recharts";
import { generateTimestamp } from "../../helpers/function_helper";

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║ USER → LOCATIONS MAPPING                                                   ║
// ╚════════════════════════════════════════════════════════════════════════════╝
const USER_LOCATIONS = {
    "1247": ["Lucknow"],
    "1874": ["Lucknow"],
    "1670": ["Pune", "Lucknow", "Mumbai", "Ghaziabad"],
    "1": ["Pune", "Lucknow", "Mumbai", "Ghaziabad"],
    "2065": ["Pune", "Mumbai", "Ghaziabad"],
};

// ── Inject styles once ───────────────────────────────────────────────────────
if (!document.getElementById("branch-data-styles")) {
    const s = document.createElement("style");
    s.id = "branch-data-styles";
    s.textContent = `
        @keyframes ringDraw { from { stroke-dashoffset: var(--ring-total); } to { stroke-dashoffset: var(--ring-offset); } }
        @keyframes fadeUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform:none; } }

        .modal-backdrop.show { backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); background: rgba(15,23,42,.55); opacity:1 !important; }

        .bwd-page { padding-bottom: 20px; }
        .bwd-headercard {
            background:#fff;
            border:1px solid #E8ECF2;
            border-radius:14px;
            padding:16px 20px;
            box-shadow:0 1px 4px rgba(0,0,0,.04);
            margin-bottom:16px;
            display:flex; align-items:center; justify-content:space-between;
            flex-wrap:wrap; gap:14px;
        }
        .bwd-headercard-left { display:flex; align-items:center; gap:14px; }
        .bwd-location-icon {
            width:44px; height:44px;
            display:flex; align-items:center; justify-content:center;
            border-radius:11px;
            background:linear-gradient(135deg, ${defaultTheme.primary}, #007A6E);
            color:#fff;
            box-shadow:0 2px 6px rgba(0,91,82,.22);
            flex-shrink:0;
        }
        .bwd-location-meta { display:flex; flex-direction:column; gap:2px; }
        .bwd-location-label {
            font-size:10.5px; font-weight:700; color:#94A3B8;
            text-transform:uppercase; letter-spacing:.6px;
        }
        .bwd-location-name {
            font-size:18px; font-weight:800; color:#0F172A;
            line-height:1.2;
        }
        .bwd-loc-tabs {
            display:flex; gap:4px; padding:4px;
            background:#F1F5F9; border-radius:11px;
            flex-wrap:wrap;
        }
        .bwd-loc-tab {
            border:none; background:transparent;
            padding:8px 18px; border-radius:8px;
            font-size:12.5px; font-weight:700; color:#64748B;
            cursor:pointer; transition:all .15s; white-space:nowrap;
        }
        .bwd-loc-tab:hover:not(.active) { background:rgba(255,255,255,.7); color:#334155; }
        .bwd-loc-tab.active {
            background:#fff;
            color:${defaultTheme.primary};
            box-shadow:0 1px 3px rgba(0,0,0,.08);
        }
        .bwd-loc-single {
            display:inline-flex; align-items:center; gap:7px;
            padding:7px 14px; border-radius:999px;
            background:${defaultTheme.primary}1A;
            color:${defaultTheme.primary};
            font-size:12px; font-weight:700;
        }

        .bwd-grid {
            display:grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap:16px;
        }
        @media (max-width: 992px) { .bwd-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .bwd-grid { grid-template-columns: 1fr; } }

        .bwd-card {
            background:#fff;
            border:1px solid #E8ECF2;
            border-radius:14px;
            padding:20px 18px;
            display:flex; flex-direction:column; align-items:center;
            box-shadow:0 1px 4px rgba(0,0,0,.04);
            transition:transform .18s, box-shadow .18s, border-color .18s;
            animation: fadeUp .35s ease forwards;
            opacity:0;
            position:relative;
        }
        .bwd-card:hover {
            transform:translateY(-3px);
            box-shadow:0 8px 22px rgba(15,23,42,.08);
            border-color:#CBD5E1;
        }

        /* Top row of card — status image on left, period tag on right */
        .bwd-card-top {
            display:flex;
            justify-content:space-between;
            align-items:flex-start;
            width:100%;
            min-height: 38px;
            margin-bottom:4px;
        }
        .bwd-status-img {
            width:38px; height:38px;
            object-fit:contain;
            user-select:none;
            -webkit-user-drag:none;
            flex-shrink:0;
        }
        .bwd-status-img-placeholder {
            width:38px; height:38px;
            visibility:hidden;
        }

        .bwd-period-tag {
            font-size:9.5px; font-weight:700;
            padding:3px 8px; border-radius:10px;
            background:#F1F5F9; color:#64748B;
            text-transform:uppercase; letter-spacing:.4px;
            white-space:nowrap;
        }
        .bwd-period-tag.total { background:#FEF3C7; color:#92400E; }

        .bwd-ring-wrap {
            position:relative;
            width:140px; height:140px;
            display:flex; align-items:center; justify-content:center;
            margin-bottom:14px;
        }
        .bwd-ring-bg { fill:none; stroke:#F1F5F9; stroke-width:10; }
        .bwd-ring-fg {
            fill:none; stroke-width:10; stroke-linecap:round;
            animation: ringDraw 1.1s cubic-bezier(.22,.61,.36,1) forwards;
            stroke-dasharray: var(--ring-total);
            stroke-dashoffset: var(--ring-total);
        }
        .bwd-ring-center {
            position:absolute; inset:0;
            display:flex; flex-direction:column; align-items:center; justify-content:center;
            gap:1px;
        }
        .bwd-ring-icon { margin-bottom:3px; opacity:.9; }
        .bwd-ring-value {
            font-size:22px; font-weight:800; color:#0F172A;
            line-height:1;
            display:flex; align-items:baseline; gap:2px;
        }
        .bwd-ring-value .total { font-size:13px; font-weight:600; color:#94A3B8; }
        .bwd-ring-pct {
            font-size:10.5px; font-weight:700;
            margin-top:3px;
            padding:2px 8px; border-radius:10px;
            letter-spacing:.3px;
        }
        .bwd-ring-single { font-size:28px; font-weight:800; line-height:1; }

        .bwd-card-label { font-size:13px; font-weight:700; color:#334155; text-align:center; }
        .bwd-card-sub { font-size:11px; font-weight:500; color:#94A3B8; margin-top:3px; text-align:center; }

        .bwd-graph-title {
            text-align:center;
            margin-bottom:8px;
            font-weight:700;
            color:#0F172A;
            font-size:16px;
        }
        .bwd-graph-sub {
            text-align:center;
            margin-bottom:18px;
            color:#94A3B8;
            font-size:12px;
        }

        .bwd-legend {
            display:flex; justify-content:center; align-items:center;
            gap:24px; flex-wrap:wrap;
            margin-bottom:8px;
        }
        .bwd-legend-item {
            display:inline-flex; align-items:center;
            gap:7px;
            font-size:12.5px; font-weight:600;
            color:#334155;
        }
        .bwd-legend-swatch {
            width:14px; height:14px;
            border-radius:3px;
            flex-shrink:0;
        }
        .bwd-trend {
            display:inline-flex; align-items:center; justify-content:center;
            width:20px; height:20px;
            border-radius:50%;
        }
        .bwd-trend.up   { background:#DCFCE7; color:#16A34A; }
        .bwd-trend.down { background:#FEE2E2; color:#DC2626; }
        .bwd-trend.flat { background:#F1F5F9; color:#64748B; }

        .bwd-avg-row {
            display:flex; justify-content:center; gap:10px;
            flex-wrap:wrap;
            margin: 4px 0 16px;
        }
        .bwd-avg-chip {
            display:inline-flex; align-items:center; gap:7px;
            padding:5px 12px;
            border-radius:999px;
            background:#F8FAFC;
            border:1px solid #E2E8F0;
            font-size:11.5px;
            font-weight:600;
            color:#475569;
        }
        .bwd-avg-chip-dot {
            width:8px; height:8px;
            border-radius:50%;
            flex-shrink:0;
        }
        .bwd-avg-chip-val {
            color:#0F172A;
            font-weight:800;
        }

        /* Chart container: add right padding so the last X-axis label has breathing room */
        .bwd-chart-shell { padding: 0 12px 0 0; }

        /* Remarks block — visible inside PDF capture, below the graph */
        .bwd-remarks-block {
            margin-top: 16px;
            background: #fff;
            border: 1px solid #E8ECF2;
            border-radius: 14px;
            padding: 14px 18px;
            border-left: 4px solid ${defaultTheme.primary};
        }
        .bwd-remarks-label {
            font-size: 11.5px;
            font-weight: 800;
            color: ${defaultTheme.primary};
            text-transform: uppercase;
            letter-spacing: .5px;
            margin-bottom: 6px;
        }
        .bwd-remarks-text {
            font-size: 13px;
            color: #0F172A;
            line-height: 1.55;
            white-space: pre-wrap;
            word-break: break-word;
        }
    `;
    document.head.appendChild(s);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatNumber = (v) => {
    if (v == null) return "-";
    return Number(v).toLocaleString("en-IN");
};

// Trend = avg(prior months) compared to FIRST month (e.g. March)
//   avg > first → up
//   avg < first → down
//   else        → flat
const computeTrend = (values) => {
    if (!Array.isArray(values) || values.length < 2) return "flat";
    const nums = values.map((v) => Number(v) || 0);
    const priorMonths = nums.slice(0, -1);
    if (priorMonths.length === 0) return "flat";

    const avg = priorMonths.reduce((a, b) => a + b, 0) / priorMonths.length;
    const firstMonth = priorMonths[0];

    if (avg > firstMonth) return "up";
    if (avg < firstMonth) return "down";
    return "flat";
};

// ── Status (Green/Yellow/Red) resolution per metric ──────────────────────────
// Returns "green" | "yellow" | "red" | null (null = no image)
const resolveStatus = (metricLabel, pct, total) => {
    if (total <= 0 && metricLabel !== "Temp Bookings") return null;

    switch (metricLabel) {
        case "Sitting Capacity":
            if (pct >= 85) return "green";
            if (pct >= 60) return "yellow";
            return "red";

        case "Meetings":
        case "Prospects/Meetings":
            if (pct >= 100) return "green";
            if (pct >= 70) return "yellow";
            return "red";

        case "Employee Presence":
            if (pct >= 95) return "green";
            if (pct >= 80 && pct < 95) return "yellow";
            return "red";

        case "Temp Bookings":
            if (total === 0) return null;
            if (pct === 0) return "green";
            if (pct > 0 && pct <= 25) return "yellow";
            return "red";

        default:
            return null;  // EOI Bookings + anything else
    }
};

const STATUS_IMG = {
    green: "gc.png",
    yellow: "yc.png",
    red: "rc.png",
};

// ── Single ring card ─────────────────────────────────────────────────────────
function RingCard({ metric, data, index, branchTargets }) {
    const { Icon, color, label, sub, period, valueKey, totalKey, single, targetType, softCap } = metric;

    const rawValue = metric.calculateValue
        ? metric.calculateValue(data)
        : Number(data?.[valueKey] ?? 0);

    let rawTotal;
    if (targetType) {
        rawTotal = Number(branchTargets?.[targetType] ?? 0);
    } else if (totalKey) {
        rawTotal = Number(data?.[totalKey] ?? 0);
    } else if (softCap) {
        rawTotal = softCap;
    } else if (single) {
        rawTotal = rawValue;
    } else {
        rawTotal = 0;
    }

    const pct = rawTotal > 0
        ? Math.min(100, (rawValue / rawTotal) * 100)
        : 0;

    const status = resolveStatus(label, pct, rawTotal);
    const statusImg = status ? STATUS_IMG[status] : null;

    const size = 140;
    const stroke = 10;
    const radius = (size - stroke) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - pct / 100);

    // Rotate each circle individually around its center → top-start origin.
    const rotation = `rotate(-90 ${cx} ${cy})`;

    return (
        <div className="bwd-card" style={{ animationDelay: `${index * 70}ms` }}>
            {/* Top row: status image (left) ↔ period tag (right) */}
            <div className="bwd-card-top">
                {statusImg ? (
                    <img
                        src={`${assetImageBaseUrl}/${statusImg}`}
                        alt={`${status} status`}
                        className="bwd-status-img"
                        crossOrigin="anonymous"
                    />
                ) : (
                    <span className="bwd-status-img-placeholder" />
                )}

                <span className={`bwd-period-tag ${period === "total" ? "total" : ""}`}>
                    {period === "total" ? "Total" : "Today"}
                </span>
            </div>

            <div className="bwd-ring-wrap">
                <svg width={size} height={size}>
                    <circle
                        className="bwd-ring-bg"
                        cx={cx} cy={cy} r={radius}
                        transform={rotation}
                    />
                    <circle
                        className="bwd-ring-fg"
                        cx={cx} cy={cy} r={radius}
                        stroke={color}
                        transform={rotation}
                        style={{
                            "--ring-total": circumference,
                            "--ring-offset": offset,
                        }}
                    />
                </svg>

                <div className="bwd-ring-center">
                    <Icon size={16} color={color} className="bwd-ring-icon" />

                    {single && !targetType && !softCap ? (
                        <div className="bwd-ring-single" style={{ color }}>
                            {formatNumber(rawValue)}
                        </div>
                    ) : (
                        <>
                            <div className="bwd-ring-value">
                                <span style={{ color }}>{formatNumber(rawValue)}</span>
                                <span className="total">/{formatNumber(rawTotal)}</span>
                            </div>
                            <div
                                className="bwd-ring-pct"
                                style={{ background: `${color}1A`, color }}
                            >
                                {pct.toFixed(0)}%
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="bwd-card-label">{label}</div>
            <div className="bwd-card-sub">{sub}</div>
        </div>
    );
}

// ── Custom legend with trend arrows ──────────────────────────────────────────
function GraphLegend({ trends }) {
    const items = [
        { key: "prospect", label: "Prospects", color: defaultTheme.primary },
        { key: "meeting", label: "Meetings", color: "#9333EA" },
        { key: "booking", label: "Bookings", color: defaultTheme.goldColorLogo },
    ];

    const renderArrow = (dir) => {
        if (dir === "up") return <span className="bwd-trend up"><LuTrendingUp size={12} /></span>;
        if (dir === "down") return <span className="bwd-trend down"><LuTrendingDown size={12} /></span>;
        return <span className="bwd-trend flat"><LuArrowLeftRight size={12} /></span>;
    };

    return (
        <div className="bwd-legend">
            {items.map((it) => (
                <span key={it.key} className="bwd-legend-item">
                    <span className="bwd-legend-swatch" style={{ background: it.color }} />
                    {it.label}
                    {renderArrow(trends?.[it.key])}
                </span>
            ))}
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function BranchOverview() {
    const { userId, empCode } = useUserStore((s) => s.user);

    const userLocations = useMemo(() => {
        const fromMap = USER_LOCATIONS[String(empCode)];
        return Array.isArray(fromMap) && fromMap.length > 0
            && fromMap
    }, [empCode]);

    const [activeLocation, setActiveLocation] = useState(userLocations[0]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const [accessGranted, setAccessGranted] = useState(null);
    const printRef = useRef(null);
    const [downloading, setDownloading] = useState(false);
    const [graphData, setGraphData] = useState([]);
    const [graphLoading, setGraphLoading] = useState(false);

    // ── Remarks modal state ──────────────────────────────────────────────────
    const [remarksOpen, setRemarksOpen] = useState(false);
    const [remarksText, setRemarksText] = useState("");
    // Remarks rendered INTO the PDF capture (only while generating)
    const [remarksForPdf, setRemarksForPdf] = useState("");

    const METRICS = [
        {
            label: "Sitting Capacity",
            sub: "Active Employees vs Total Capacity",
            valueKey: "currentSitting",
            totalKey: "sitingCapacity",
            period: "same-day",
            color: defaultTheme.primary,
            Icon: FaUsers,
        },
        {
            label: "Meetings",
            sub: "Meetings End vs Total Meetings",
            valueKey: "numberOfMeetingEnded",
            targetType: "meetings",
            period: "same-day",
            color: "#9333EA",
            Icon: FaCalendarAlt,
        },
        {
            label: "Prospects/Meetings",
            sub: "Total Prospects vs Expected Prospects",
            calculateValue: (d) =>
                Number(d?.numberOfProspects || 0) +
                Number(d?.numberOfMeetingEnded || 0) * 2,
            targetType: "prospects",
            period: "same-day",
            color: "#0369A1",
            Icon: FaHandshake,
        },
        {
            label: "Employee Presence",
            sub: "Todays Attendance vs Active Employees",
            valueKey: "numberOfPresentEmployees",
            totalKey: "currentSitting",
            period: "same-day",
            color: "#16A34A",
            Icon: FaUserCheck,
        },
        {
            label: "Temp Bookings",
            sub: `${activeLocation === 'Pune' || activeLocation === 'Mumbai' ? '45' : '15'} Days Old Bookings vs Total Temp Bookings`,
            valueKey: "numberOfBooking15Days",
            totalKey: "numberOfNormalTempBooking",
            period: "total",
            color: defaultTheme.goldColorLogo,
            Icon: FaBookmark,
        },
        {
            label: "EOI Bookings",
            sub: "Total EOI Bookings",
            valueKey: "numberOfEOITempBooking",
            single: true,
            period: "total",
            color: "#DC2626",
            Icon: FaFileSignature,
        },
    ];

    const BRANCH_TARGETS = {
        prospects:
            activeLocation === "Pune" || activeLocation === "Mumbai"
                ? (data?.numberOfPresentEmployees || 0) * 3
                : (data?.numberOfPresentEmployees || 0) * 5,

        meetings:
            (data?.numberOfMeetingEnded || 0) +
            (data?.numberOfMeetingPending || 0),
    };

    useEffect(() => {
        if (!userLocations.includes(activeLocation)) {
            setActiveLocation(userLocations[0]);
        }
    }, [userLocations]);

    const getBranchData = (loc) => {
        if (!loc) return;
        setLoading(true);
        ApiClient.get(`${BRANCH_WISE_DATA}?branch=${encodeURIComponent(loc)}`)
            .then((resp) => {
                setLoading(false);
                if (resp?.data?.status === 1) {
                    setData(resp.data.data || {});
                } else if (resp?.data?.message && resp.data.message !== "No record found.") {
                    toast.error(resp.data.message);
                    setData({});
                } else {
                    setData({});
                }
            })
            .catch(() => {
                setLoading(false);
                setData({});
            });
    };

    const getLast4MonthsRange = () => {
        const today = new Date();
        const formatDate = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${y}-${m}-${dd}`;
        };
        const startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        return {
            fromDate: formatDate(startDate),
            toDate: formatDate(today),
        };
    };

    const getMonthlyGraphData = (branch) => {
        if (!branch) return;
        const { fromDate, toDate } = getLast4MonthsRange();
        setGraphLoading(true);
        ApiClient.get(
            `${BRANCH_WISE_GRAPH_DATA}?fromDate=${fromDate}&toDate=${toDate}&branch=${encodeURIComponent(branch)}`
        )
            .then((resp) => {
                setGraphLoading(false);
                if (resp?.data?.status === 1) {
                    setGraphData(resp?.data?.data || []);
                } else {
                    setGraphData([]);
                }
            })
            .catch(() => {
                setGraphLoading(false);
                setGraphData([]);
            });
    };

    const { trends } = useMemo(() => {
        const prospects = graphData.map((d) => d.prospect);
        const meetings = graphData.map((d) => d.meeting);
        const bookings = graphData.map((d) => d.booking);
        return {
            trends: {
                prospect: computeTrend(prospects),
                meeting: computeTrend(meetings),
                booking: computeTrend(bookings),
            },
        };
    }, [graphData]);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, "branch-overview");
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const thStyle = {
        border: "1px solid #E2E8F0",
        padding: "8px",
        background: "#F8FAFC",
        fontWeight: 700,
        textAlign: "center",
    };

    const tdStyle = {
        border: "1px solid #E2E8F0",
        padding: "8px",
        textAlign: "center",
    };

    useEffect(() => {
        if (accessGranted) {
            getBranchData(activeLocation);
            getMonthlyGraphData(activeLocation);
        }
    }, [activeLocation, accessGranted]);

    // ── PDF generation (called after remarks modal submit/skip) ──────────────
    const runDownload = async (remarks) => {
        if (!printRef.current) return;
        setDownloading(true);
        setRemarksForPdf(remarks || "");

        // Preload status images so they're cached when html2canvas runs
        await Promise.all(
            Object.values(STATUS_IMG).map((file) =>
                new Promise((resolve) => {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.onload = resolve;
                    img.onerror = resolve;  // resolve even on error so we don't hang
                    img.src = `${assetImageBaseUrl}/${file}`;
                })
            )
        );

        // Wait for remarks block to render
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

        const node = printRef.current;

        // ── Force a fixed wide width on the capture container so it fills the PDF ──
        const originalWidth = node.style.width;
        const originalMaxWidth = node.style.maxWidth;
        const CAPTURE_WIDTH = 1100; // px — close to A4 portrait usable width @ 2x scale
        node.style.width = `${CAPTURE_WIDTH}px`;
        node.style.maxWidth = `${CAPTURE_WIDTH}px`;

        // Let Recharts re-lay out at the new width, plus settle ring animations
        await new Promise((r) => setTimeout(r, 1400));

        try {
            const canvas = await html2canvas(node, {
                scale: 1.5,
                useCORS: true,
                backgroundColor: "#FFFFFF",
                logging: false,
                width: CAPTURE_WIDTH,
                windowWidth: CAPTURE_WIDTH,
            });
            const imgData = canvas.toDataURL("image/jpeg", 0.85);

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
                compress: true,
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 8;
            const usableWidth = pageWidth - margin * 2;
            const headerHeight = 16;

            const now = new Date();
            const datePart = now
                .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                .replace(/ /g, "-");
            const timePart = now.toLocaleTimeString("en-US", {
                hour: "2-digit", minute: "2-digit", hour12: true,
            });

            const drawHeader = () => {
                pdf.setFillColor(0, 91, 82);
                pdf.rect(0, 0, pageWidth, headerHeight, "F");
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(13);
                pdf.setTextColor(255, 255, 255);
                pdf.text(`${activeLocation} — Branch Overview`, margin, 10);
                pdf.setFontSize(9);
                pdf.setFont("helvetica", "normal");
                pdf.text(`${datePart} ${timePart}`, pageWidth - margin, 10, { align: "right" });
            };

            drawHeader();

            const imgY = headerHeight + 6;
            const imgWidth = usableWidth;           // Image always fills usable width
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const availableHeight = pageHeight - imgY - 10;

            if (imgHeight <= availableHeight) {
                pdf.addImage(imgData, "JPEG", margin, imgY, imgWidth, imgHeight, undefined, "FAST");
            } else {
                const totalPages = Math.ceil(imgHeight / availableHeight);
                for (let i = 0; i < totalPages; i++) {
                    if (i > 0) {
                        pdf.addPage();
                        drawHeader();
                    }
                    const sourceY = (i * availableHeight * canvas.width) / imgWidth;
                    const sourceH = Math.min(
                        (availableHeight * canvas.width) / imgWidth,
                        canvas.height - sourceY
                    );
                    const sliceCanvas = document.createElement("canvas");
                    sliceCanvas.width = canvas.width;
                    sliceCanvas.height = sourceH;
                    const ctx = sliceCanvas.getContext("2d");
                    ctx.drawImage(
                        canvas,
                        0, sourceY, canvas.width, sourceH,
                        0, 0, canvas.width, sourceH
                    );
                    const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.85);
                    const sliceHeight = (sourceH * imgWidth) / canvas.width;
                    pdf.addImage(sliceData, "JPEG", margin, imgY, imgWidth, sliceHeight, undefined, "FAST");

                    pdf.setFontSize(8);
                    pdf.setTextColor(120, 120, 120);
                    pdf.text(
                        `Page ${i + 1} of ${totalPages}`,
                        pageWidth / 2, pageHeight - 4, { align: "center" }
                    );
                }
            }

            pdf.save(`${activeLocation}_BranchOverview_${generateTimestamp()}.pdf`);
        } catch (err) {
            console.error("PDF export failed:", err);
            toast.error("Failed to generate PDF");
        } finally {
            // ── Restore the container's original width ─────────────────────────
            node.style.width = originalWidth;
            node.style.maxWidth = originalMaxWidth;

            setDownloading(false);
            setRemarksForPdf("");
        }
    };

    // Button click → open the remarks modal
    const handleDownloadClick = () => {
        setRemarksText("");
        setRemarksOpen(true);
    };

    // Modal submit / skip
    const handleRemarksSubmit = (status) => {
        const r = remarksText.trim();
        if (status === 'YES' && r.length === 0) {
            toast.error("Please enter remarks to proceed");
            return;
        }
        setRemarksOpen(false);
        // Slight delay so the modal close animation doesn't fight html2canvas
        setTimeout(() => runDownload(r), 250);
    };

    if (accessGranted === null) return <ScreenLoader />;
    if (!accessGranted) return <PermissionMissing />;

    const showTabs = userLocations?.length > 1;

    return (
        <PageContent>
            <Container fluid className="bwd-page">
                <Breadcrumbs title="Reports" breadcrumbItem="Branch Overview" />

                {loading && <ScreenLoader />}

                {/* ══ Header card ════════════════════════════════════════════ */}
                <div className="bwd-headercard">
                    <div className="bwd-headercard-left">
                        <div className="bwd-location-icon">
                            <FaMapMarkerAlt size={18} />
                        </div>
                        <div className="bwd-location-meta">
                            <span className="bwd-location-label">Branch Overview</span>
                            <span className="bwd-location-name">{activeLocation}</span>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        {showTabs ? (
                            <div className="bwd-loc-tabs">
                                {userLocations?.map((loc) => (
                                    <button
                                        key={loc}
                                        className={`bwd-loc-tab ${activeLocation === loc ? "active" : ""}`}
                                        onClick={() => setActiveLocation(loc)}
                                    >
                                        {loc}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="bwd-loc-single">
                                <FaMapMarkerAlt size={10} />
                                Single Branch Access
                            </div>
                        )}

                        <button
                            onClick={handleDownloadClick}
                            disabled={downloading}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "8px 14px",
                                borderRadius: 9,
                                border: "none",
                                background: downloading
                                    ? "#94A3B8"
                                    : `linear-gradient(135deg, ${defaultTheme.primary}, #007A6E)`,
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: downloading ? "not-allowed" : "pointer",
                                boxShadow: "0 2px 6px rgba(0,91,82,.22)",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <FaDownload size={11} />
                            {downloading ? "Generating…" : "Download PDF"}
                        </button>
                    </div>
                </div>

                {/* ══ Captured area: rings + graph + (optional) remarks ════ */}
                <div ref={printRef} key={activeLocation}>
                    {/* Rings */}
                    <div className="bwd-grid">
                        {METRICS.map((m, i) => (
                            <RingCard
                                key={m.label}
                                metric={m}
                                data={data}
                                index={i}
                                branchTargets={BRANCH_TARGETS}
                            />
                        ))}
                    </div>



                    {/* Graph card */}
                    <Row style={{ marginTop: 20 }}>
                        <Col xs={12}>
                            <Card style={{ borderRadius: 14, border: "1px solid #E8ECF2" }}>
                                <CardBody>
                                    <h5 className="bwd-graph-title">
                                        Last 3 Months Overview
                                    </h5>
                                    {/* <div className="bwd-graph-sub">
                                        Prospects, meetings and bookings over the most recent months
                                    </div> */}

                                    <GraphLegend trends={trends} />
                                    {/* <GraphAverages averages={averages} /> */}

                                    {graphLoading ? (
                                        <div
                                            style={{
                                                height: 350,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                color: "#94A3B8",
                                                fontSize: 13,
                                            }}
                                        >
                                            Loading graph…
                                        </div>
                                    ) : graphData.length === 0 ? (
                                        <div
                                            style={{
                                                height: 350,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                color: "#94A3B8",
                                                fontSize: 13,
                                            }}
                                        >
                                            No graph data available
                                        </div>
                                    ) : (
                                        <div className="bwd-chart-shell">
                                            <ResponsiveContainer width="100%" height={360}>
                                                <BarChart
                                                    data={graphData}
                                                    margin={{ top: 30, right: 40, left: 10, bottom: 20 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF2" />
                                                    <XAxis
                                                        dataKey="month"
                                                        interval={0}
                                                        tick={{ fontSize: 12, fill: "#475569" }}
                                                        padding={{ left: 10, right: 20 }}
                                                    />
                                                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
                                                    <Tooltip
                                                        contentStyle={{
                                                            borderRadius: 8,
                                                            border: "1px solid #E2E8F0",
                                                            fontSize: 12,
                                                        }}
                                                    />
                                                    <Legend wrapperStyle={{ display: "none" }} />
                                                    <Bar dataKey="prospect" fill={defaultTheme.primary} name="Prospects" radius={[4, 4, 0, 0]}>
                                                        <LabelList
                                                            dataKey="prospect"
                                                            position="top"
                                                            style={{ fontSize: 11, fontWeight: 700, fill: "#111827" }}
                                                        />
                                                    </Bar>
                                                    <Bar dataKey="meeting" fill="#9333EA" name="Meetings" radius={[4, 4, 0, 0]}>
                                                        <LabelList
                                                            dataKey="meeting"
                                                            position="top"
                                                            style={{ fontSize: 11, fontWeight: 700, fill: "#111827" }}
                                                        />
                                                    </Bar>
                                                    <Bar dataKey="booking" fill={defaultTheme.goldColorLogo} name="Bookings" radius={[4, 4, 0, 0]}>
                                                        <LabelList
                                                            dataKey="booking"
                                                            position="top"
                                                            style={{ fontSize: 11, fontWeight: 700, fill: "#111827" }}
                                                        />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <div className="bwd-remarks-block" style={{ marginTop: 20 }}>
                        <div className="bwd-remarks-label">
                            Status Indicator Conditions
                        </div>

                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: 12,
                                marginTop: 10,
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={thStyle}>Metric</th>
                                    <th style={thStyle}>Green</th>
                                    <th style={thStyle}>Yellow</th>
                                    <th style={thStyle}>Red</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td style={tdStyle}>Sitting Capacity</td>
                                    <td style={tdStyle}>
                                        <img src={`${assetImageBaseUrl}/gc.png`} width={18} alt="" /> ≥ 85%
                                    </td>
                                    <td style={tdStyle}>
                                        <img src={`${assetImageBaseUrl}/yc.png`} width={18} alt="" /> &lt; 85% &amp; ≥ 60%
                                    </td>
                                    <td style={tdStyle}>
                                        <img src={`${assetImageBaseUrl}/rc.png`} width={18} alt="" /> &lt; 60%
                                    </td>
                                </tr>

                                <tr>
                                    <td style={tdStyle}>Meetings</td>
                                    <td style={tdStyle}>
                                        <img src={`${assetImageBaseUrl}/gc.png`} width={18} alt="" />  100%
                                    </td>
                                    <td style={tdStyle}>
                                        <img src={`${assetImageBaseUrl}/yc.png`} width={18} alt="" /> &lt; 100% &amp; ≥ 70%
                                    </td>
                                    <td style={tdStyle}>
                                        <img src={`${assetImageBaseUrl}/rc.png`} width={18} alt="" /> &lt; 70%
                                    </td>
                                </tr>

                                <tr>
                                    <td style={tdStyle}>Prospects / Meetings</td>
                                    <td style={tdStyle}>
                                        <img src={`${assetImageBaseUrl}/gc.png`} width={18} alt="" /> ≥ 100%
                                    </td>
                                    <td style={tdStyle}>
                                        <img src={`${assetImageBaseUrl}/yc.png`} width={18} alt="" /> &lt; 100% &amp; ≥ 70%
                                    </td>
                                    <td style={tdStyle}>
                                        <img src={`${assetImageBaseUrl}/rc.png`} width={18} alt="" /> &lt; 70%
                                    </td>
                                </tr>

                                <tr>
                                    <td style={tdStyle}>Employee Presence</td>
                                    <td style={tdStyle}>
                                        <img src={`${assetImageBaseUrl}/gc.png`} width={18} alt="" /> ≥ 95%
                                    </td>
                                    <td style={tdStyle}>
                                        <img src={`${assetImageBaseUrl}/yc.png`} width={18} alt="" /> &lt; 95% &amp; ≥ 80%
                                    </td>
                                    <td style={tdStyle}>
                                        <img src={`${assetImageBaseUrl}/rc.png`} width={18} alt="" /> &lt; 80%
                                    </td>
                                </tr>

                                <tr>
                                    <td style={tdStyle}>Temp Bookings</td>
                                    <td style={tdStyle}>
                                        <img src={`${assetImageBaseUrl}/gc.png`} width={18} alt="" /> 0%
                                    </td>
                                    <td style={tdStyle}>
                                        <img src={`${assetImageBaseUrl}/yc.png`} width={18} alt="" /> ≤ 25% &amp; &gt; 0%
                                    </td>
                                    <td style={tdStyle}>
                                        <img src={`${assetImageBaseUrl}/rc.png`} width={18} alt="" /> &gt; 25%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Remarks block — only rendered during PDF generation */}
                    {remarksForPdf && (
                        <div className="bwd-remarks-block">
                            <div className="bwd-remarks-label">
                                Branch Coordinator's Remarks / Highlights
                            </div>
                            <div className="bwd-remarks-text">{remarksForPdf}</div>
                        </div>
                    )}
                </div>
            </Container>

            {/* ══ Remarks Modal ══════════════════════════════════════════════ */}
            <Modal
                isOpen={remarksOpen}
                toggle={() => setRemarksOpen(false)}
                centered
                backdrop="static"
                keyboard={false}
            >
                <ModalHeader toggle={() => setRemarksOpen(false)}>
                    Add Remarks Before Download
                </ModalHeader>
                <ModalBody>
                    <label
                        style={{
                            display: "block",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#334155",
                            marginBottom: 6,
                        }}
                    >
                        Branch Coordinator's Remarks / Highlights
                        <span style={{
                            marginLeft: 8,
                            fontSize: 10,
                            fontWeight: 500,
                            color: "#94A3B8",
                        }}>
                            (optional)
                        </span>
                    </label>
                    <textarea
                        value={remarksText}
                        onChange={(e) => setRemarksText(e.target.value)}
                        placeholder="Type any notes, context, or highlights to include in the PDF…"
                        rows={5}
                        maxLength={1000}
                        style={{
                            width: "100%",
                            border: "1px solid #0b0b0b",
                            borderRadius: 8,
                            padding: "10px 12px",
                            fontSize: 13,
                            outline: "none",
                            resize: "vertical",
                            fontFamily: "inherit",
                            color: "#0F172A",
                        }}
                    />
                    <div
                        style={{
                            marginTop: 6,
                            fontSize: 10.5,
                            color: "#94A3B8",
                            textAlign: "right",
                        }}
                    >
                        {remarksText.length}/1000
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="secondary"
                        onClick={() => { handleRemarksSubmit('NO') }}
                        style={{
                            backgroundColor: defaultTheme.goldColorLogo,
                            border: "none",
                        }}
                    >
                        Skip & Download
                    </Button>
                    <Button
                        color="primary"
                        onClick={() => { handleRemarksSubmit('YES') }}
                        style={{
                            backgroundColor: defaultTheme.primary,
                            border: "none",
                        }}
                    >
                        Download with Remarks
                    </Button>
                </ModalFooter>
            </Modal>
        </PageContent>
    );
}