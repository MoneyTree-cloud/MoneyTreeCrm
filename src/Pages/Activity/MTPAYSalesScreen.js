/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Container, Card, CardBody, Label } from 'reactstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { FaCalculator, FaFileInvoiceDollar, FaCoins, FaWallet, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient, { assetImageBaseUrl } from '../../helpers/api_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { formatINR, WordWrapCell } from '../../helpers/function_helper';
import { useUserStore } from '../../store/useUserStore';
import {
    GET_ALL_MT_PAY_SCHEME_DATA,
    GET_ALL_MT_PAY_SCHEME_BOOKING_DATA
} from '../../helpers/url_helper';

const RS_STYLES = {
    control: (b) => ({
        ...b,
        minHeight: '42px',
        borderColor: '#CBD5E1',
        borderWidth: '1.5px',
        borderRadius: '10px',
        fontSize: '14px',
    }),
    menuPortal: (b) => ({ ...b, zIndex: 9999 }),
};

// ── Fixed statement date range ──────────────────────────────────────────────
const FIXED_FROM_DATE = '2026-07-13';
const FIXED_TO_DATE = '2026-12-31';

// ── Media assets ────────────────────────────────────────────────────────────
const LOGO_URL = `${assetImageBaseUrl}mtPayNew.png`;
const MALAMAAL_URL = `${assetImageBaseUrl}malamaal.png`;
const SOUND_URL = `${assetImageBaseUrl}mtpay-sound.mpeg`;

// ── StatusPill component ─────────────────────────────────────────────────────
function StatusPill({ row }) {
    let cfg;

    if (row.vbstatus === "Non Justified") {
        cfg = {
            fg: "#C2410C",
            bg: "#FED7AA",
            label: "In Process",
        };
    } else if (row.vbstatus === "Justified" && row.firstPayoutStatus) {
        cfg = {
            fg: "#16A34A",
            bg: "#DCFCE7",
            label: "Credited",
        };
    } else {
        // vbstatus === "Justified" && !firstPayoutStatus
        cfg = {
            fg: "#DC2626",
            bg: "#FEE2E2",
            label: "Due",
        };
    }

    return (
        <span
            style={{
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: 12,
                fontSize: 10.5,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".3px",
                background: cfg.bg,
                color: cfg.fg,
            }}
        >
            {cfg.label}
        </span>
    );
}

export default function MTPay() {
    const { userId, mainTl, subTl, locationName } = useUserStore((s) => s.user) || {};
    const isTL = mainTl === "YES" || subTl === "YES";
    const [activeTab, setActiveTab] = useState('calculator');

    // ── Audio state ─────────────────────────────────────────────────────────
    const audioRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);

    // ── Calculator state ────────────────────────────────────────────────────
    const [schemeOptions, setSchemeOptions] = useState([]);
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [isSchemeLoading, setIsSchemeLoading] = useState(false);

    // ── Statement state ─────────────────────────────────────────────────────
    const [statementRows, setStatementRows] = useState([]);
    const [isStatementLoading, setIsStatementLoading] = useState(false);

    // ── Auto-play audio on mount ────────────────────────────────────────────
    // Browsers block autoplay without user interaction; we still attempt it,
    // and provide a mute/unmute button as a fallback.
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = 1;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Autoplay blocked — user will need to click unmute
                setIsMuted(true);
            });
        }

        // Cleanup — stop audio when leaving screen
        return () => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        };
    }, []);

    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isMuted) {
            audio.play().then(() => setIsMuted(false)).catch(() => { });
        } else {
            audio.pause();
            setIsMuted(true);
        }
    };

    // ── Fetch schemes on Calculator tab mount ───────────────────────────────
    useEffect(() => {
        if (activeTab !== "calculator" || schemeOptions.length > 0) return;

        setIsSchemeLoading(true);

        ApiClient.get(GET_ALL_MT_PAY_SCHEME_DATA)
            .then((response) => {
                setIsSchemeLoading(false);

                if (response?.data?.status === 1) {
                    const raw = response.data.data;
                    const arr = Array.isArray(raw) ? raw : (raw?.content || []);

                    // Show all data for Main TL/Sub TL
                    // Otherwise filter by user's location
                    const filteredSchemes = isTL
                        ? arr
                        : arr.filter(
                            (scheme) =>
                                scheme.branch?.trim().toLowerCase() ===
                                locationName?.trim().toLowerCase()
                        );

                    const opts = filteredSchemes.map((s) => ({
                        value: s.id ?? s.schemeName,
                        label: s.schemeName || s.name,
                        raw: s,
                    }));

                    setSchemeOptions(opts);

                    if (opts.length > 0) {
                        setSelectedScheme(opts[0]);
                    } else {
                        setSelectedScheme(null);
                    }
                } else {
                    toast.error(response?.data?.message || "Failed to load schemes");
                }
            })
            .catch((error) => {
                setIsSchemeLoading(false);
                toast.error(error.message);
            });
    }, [activeTab, isTL, locationName]);

    // ── Fetch statement when tab opens ──────────────────────────────────────
    useEffect(() => {
        if (activeTab !== 'statement') return;
        fetchStatement(FIXED_FROM_DATE, FIXED_TO_DATE);
    }, [activeTab]);

    const fetchStatement = (from, to) => {
        if (!userId) return;
        setIsStatementLoading(true);
        const url = `${GET_ALL_MT_PAY_SCHEME_BOOKING_DATA}?fromDate=${from}&toDate=${to}&associateId=${userId}&schemeName=MTpay`;
        ApiClient.get(url)
            .then((response) => {
                setIsStatementLoading(false);
                if (response?.data?.status === 1) {
                    const raw = response.data.data;
                    const arr = Array.isArray(raw) ? raw : (raw?.content || []);
                    setStatementRows(arr);
                } else {
                    setStatementRows([]);
                    toast.error(response?.data?.message || 'Failed to load statement');
                }
            })
            .catch((error) => {
                setIsStatementLoading(false);
                setStatementRows([]);
                toast.error(error.message);
            });
    };

    // ── Statement columns ───────────────────────────────────────────────────
    const columns = useMemo(() => [
        { name: 'SL No.', width: '80px', cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell> },
        {
            name: 'Scheme', sortable: true,
            selector: (r) => r.schemeName,
            cell: (r) => <WordWrapCell><strong>{r.schemeName || '—'}</strong></WordWrapCell>,
        },
        {
            name: 'Unit', sortable: true,
            selector: (r) => r.unitNo,
            cell: (r) => <WordWrapCell>{r.unitNo || r.unit || '—'}</WordWrapCell>,
        },
        {
            name: 'Customer', sortable: true,
            selector: (r) => r.clientName,
            cell: (r) => <WordWrapCell>{r.clientName || '—'}</WordWrapCell>,
        },
        {
            name: 'Amount', sortable: true,
            selector: (r) => r.firstPayout,
            cell: (r) => (
                <span style={{ color: '#16A34A', fontWeight: 700 }}>
                    {formatINR(r.firstPayout || 0)}
                </span>
            ),
        },
        {
            name: "Status",
            selector: (r) => r.firstPayoutStatus,
            cell: (r) => <StatusPill row={r} />,
        },
    ].map((c) => ({
        ...c,
        name: <span className="font-weight-bold fs-13">{c.name}</span>,
    })), []);

    // ── Compute totals from selected scheme ─────────────────────────────────
    const totalIncentive = selectedScheme?.raw?.totalIncentive ?? 0;
    const loginIncentive = selectedScheme?.raw?.firstPayout ?? 0;

    return (
        <PageContent>
            <Breadcrumbs title="MT Pay" breadcrumbItem={activeTab === 'calculator' ? 'Calculator' : 'My Statement'} />
            {(isSchemeLoading || isStatementLoading) && <ScreenLoader />}

            {/* Hidden autoplay audio */}
            <audio ref={audioRef} src={SOUND_URL} preload="auto" />

            <Container fluid>
                {/* ── Top MT Pay Logo Header ────────────────────────────── */}
                <div style={{
                    background: '#0F172A',
                    borderRadius: 14,
                    padding: '20px 22px',
                    marginBottom: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,.15)',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <img
                            src={LOGO_URL}
                            alt="MT Pay"
                            style={{
                                height: 60,
                                maxWidth: 180,
                                objectFit: 'contain',
                            }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    </div>

                    {/* Mute / Unmute toggle */}
                    <button
                        type="button"
                        onClick={toggleMute}
                        title={isMuted ? 'Play sound' : 'Mute sound'}
                        style={{
                            width: 40, height: 40,
                            borderRadius: 20,
                            background: 'rgba(255,255,255,.1)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,.2)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 15,
                            transition: 'background .15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
                    >
                        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    </button>
                </div>

                {/* ── Tab Switcher ─────────────────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    background: '#E2E8F0',
                    padding: 5,
                    borderRadius: 12,
                    marginBottom: 18,
                    gap: 4,
                }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('calculator')}
                        style={{
                            flex: 1,
                            padding: '11px 20px',
                            fontSize: 13.5,
                            fontWeight: 700,
                            border: 'none',
                            borderRadius: 9,
                            background: activeTab === 'calculator' ? '#fff' : 'transparent',
                            color: activeTab === 'calculator' ? defaultTheme.primary : '#64748B',
                            cursor: 'pointer',
                            boxShadow: activeTab === 'calculator' ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 7,
                            transition: 'all .15s',
                        }}
                    >
                        <FaCalculator size={12} /> Calculator
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('statement')}
                        style={{
                            flex: 1,
                            padding: '11px 20px',
                            fontSize: 13.5,
                            fontWeight: 700,
                            border: 'none',
                            borderRadius: 9,
                            background: activeTab === 'statement' ? '#fff' : 'transparent',
                            color: activeTab === 'statement' ? defaultTheme.primary : '#64748B',
                            cursor: 'pointer',
                            boxShadow: activeTab === 'statement' ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 7,
                            transition: 'all .15s',
                        }}
                    >
                        <FaFileInvoiceDollar size={12} /> My Statement
                    </button>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "8px",
                        fontSize: 12,
                        fontWeight: 500,
                        color: defaultTheme.redColor,
                        marginTop: 8,
                    }}
                >
                    <span><strong>Note:</strong></span>
                    <span>1• You should be active in the system at the time of disbursal.</span>
                    <span>2• Subject to the 5× incentive rule.</span>
                </div>

                {/* ══ Calculator tab ══════════════════════════════════════ */}
                {activeTab === 'calculator' && (
                    <>
                        <Card>
                            <CardBody>
                                <Label style={{
                                    fontSize: 13, fontWeight: 700, color: '#0F172A',
                                    marginBottom: 6,
                                }}>
                                    Select Scheme <span style={{ color: '#DC2626' }}>*</span>
                                </Label>
                                <Select
                                    value={selectedScheme}
                                    onChange={setSelectedScheme}
                                    options={schemeOptions}
                                    isClearable
                                    isLoading={isSchemeLoading}
                                    placeholder={isSchemeLoading ? 'Loading schemes…' : 'Choose a scheme…'}
                                    styles={RS_STYLES}
                                    menuPortalTarget={document.body}
                                />
                            </CardBody>
                        </Card>

                        {/* Total Incentive Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #005B52, #007A6E)',
                            color: '#fff',
                            borderRadius: 14,
                            padding: '18px 22px',
                            marginBottom: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 10,
                            boxShadow: '0 2px 8px rgba(0,91,82,.2)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 44, height: 44,
                                    borderRadius: 11,
                                    background: 'rgba(255,255,255,.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 18,
                                }}>
                                    <FaWallet />
                                </div>
                                <div style={{ fontSize: 13.5, fontWeight: 700, opacity: .95 }}>
                                    Total Incentive
                                </div>
                            </div>
                            <div style={{ fontSize: 26, fontWeight: 800 }}>
                                {formatINR(totalIncentive)}
                            </div>
                        </div>

                        {/* Incentive at Login Card */}
                        <div style={{
                            background: '#fff',
                            border: `1.5px solid ${defaultTheme.primary}`,
                            borderRadius: 14,
                            padding: '18px 22px',
                            marginBottom: 18,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 10,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 44, height: 44,
                                    borderRadius: 11,
                                    background: `${defaultTheme.primary}15`,
                                    color: defaultTheme.primary,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 18,
                                }}>
                                    <FaCoins />
                                </div>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                                    Incentive at Login
                                </div>
                            </div>
                            <div style={{ fontSize: 26, fontWeight: 800, color: '#16A34A' }}>
                                {formatINR(loginIncentive)}
                            </div>
                        </div>

                        {/* ── Malamaal image ─────────────────────────────── */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: 20,
                            marginBottom: 20,
                        }}>
                            <img
                                src={MALAMAAL_URL}
                                alt="Malamaal Weekly"
                                style={{
                                    maxWidth: '100%',
                                    width: 500,
                                    height: 'auto',
                                    borderRadius: 12,
                                    boxShadow: '0 4px 12px rgba(0,0,0,.15)',
                                }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                    </>
                )}

                {/* ══ Statement tab ═══════════════════════════════════════ */}
                {activeTab === 'statement' && (
                    <>
                        <AppTable
                            progressPending={isStatementLoading}
                            columns={columns}
                            data={statementRows}
                            pagination
                            noDataComponent={
                                <div style={{
                                    padding: '40px 20px',
                                    textAlign: 'center',
                                    color: '#94A3B8',
                                    fontSize: 13,
                                }}>
                                    No statement entries in the selected date range.
                                </div>
                            }
                        />
                    </>
                )}
            </Container>
        </PageContent>
    );
}