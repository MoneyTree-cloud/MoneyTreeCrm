import React, { useState, useEffect } from 'react'
import moneyGif from '../../assets/images/money.gif'
import PageContent from '../../components/Common/PageContent'
import Breadcrumbs from '../../components/Common/Breadcrumb'
import { Container } from 'reactstrap'
import Select from 'react-select'
import ApiClient from '../../helpers/api_helper'
import { defaultTheme } from '../../helpers/defaultTheme'
import { GET_DIY_DROPDOWN, GET_DIY_DROPDOWN_PUNE } from '../../helpers/url_helper'
import { useUserStore } from '../../store/useUserStore'

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatINR = (val) =>
    val != null
        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)
        : '—'

const COMBO_OPTIONS = [
    { value: 'combo', label: 'Single' },
    { value: 'combo2', label: 'Combo Of 2' },
    { value: 'combo3', label: 'Combo Of 3' },
]

const REGION_OPTIONS = [
    { value: 'ncr', label: 'NCR', api: GET_DIY_DROPDOWN },
    { value: 'pune', label: 'Pune', api: GET_DIY_DROPDOWN_PUNE },
]

// ── Inject keyframe CSS once ──────────────────────────────────────────────────
if (!document.getElementById('diy-gif-keyframes')) {
    const st = document.createElement('style')
    st.id = 'diy-gif-keyframes'
    st.textContent = `
        @keyframes gifFadeIn { from { opacity:0; transform:scale(.96) } to { opacity:1; transform:scale(1) } }
    `
    document.head.appendChild(st)
}

// ── Inline styles ─────────────────────────────────────────────────────────────
const S = {
    card: {
        background: '#fff', borderRadius: 16,
        boxShadow: '0 2px 16px rgba(0,91,82,0.08)',
        border: '1px solid rgba(0,91,82,0.10)',
        padding: '28px 28px 24px', marginTop: 16,
    },
    regionTabsWrap: {
        display: 'flex', gap: 4, marginBottom: 24,
        borderBottom: '2px solid #E5E7EB', paddingBottom: 0,
    },
    regionTab: (active) => ({
        padding: '12px 28px', cursor: 'pointer',
        fontSize: 15, fontWeight: active ? 700 : 600,
        color: active ? (defaultTheme.primary || '#005B52') : '#667085',
        background: 'transparent', border: 'none',
        borderBottom: `3px solid ${active ? (defaultTheme.primary || '#005B52') : 'transparent'}`,
        marginBottom: -2, transition: 'all .18s', letterSpacing: '.3px', outline: 'none',
    }),
    radioGroup: { display: 'flex', gap: 16, marginBottom: 28 },
    radioLabel: (active) => ({
        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
        padding: '10px 22px', borderRadius: 50,
        border: `2px solid ${active ? defaultTheme.primary || '#005B52' : '#D0D5DD'}`,
        background: active ? `${defaultTheme.primary || '#005B52'}12` : '#fff',
        fontWeight: active ? 700 : 500, fontSize: 14,
        color: active ? defaultTheme.primary || '#005B52' : '#667085',
        transition: 'all .18s', userSelect: 'none',
    }),
    radioDot: (active) => ({
        width: 18, height: 18, borderRadius: '50%',
        border: `2px solid ${active ? defaultTheme.primary || '#005B52' : '#D0D5DD'}`,
        background: active ? defaultTheme.primary || '#005B52' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'all .18s',
    }),
    radioDotInner: { width: 8, height: 8, borderRadius: '50%', background: '#fff' },
    dropdownsRow: { display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 20 },
    dropdownWrap: { flex: 1, minWidth: 200 },
    label: { fontSize: 12, fontWeight: 700, color: '#344054', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' },
    calcBtn: {
        height: 42, padding: '0 28px',
        background: `linear-gradient(135deg, ${defaultTheme.primary || '#005B52'}, #007A6E)`,
        color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 4px 14px rgba(0,91,82,0.25)', transition: 'opacity .18s', whiteSpace: 'nowrap',
    },
    resultBox: {
        marginTop: 24, padding: '20px 24px',
        background: 'linear-gradient(135deg, #f0fdf9, #e8f4f2)',
        border: `1.5px solid ${defaultTheme.primary || '#005B52'}30`,
        borderRadius: 14, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
    },
    resultLabel: { fontSize: 13, fontWeight: 600, color: '#4a6b67', marginBottom: 4 },
    resultAmount: { fontSize: 28, fontWeight: 900, color: defaultTheme.primary || '#005B52', letterSpacing: '-0.5px' },
    breakdown: { display: 'flex', gap: 16, flexWrap: 'wrap' },
    breakdownItem: {
        background: '#fff', borderRadius: 10, padding: '10px 16px',
        border: '1px solid rgba(0,91,82,0.12)', minWidth: 140,
    },
    breakdownLabel: { fontSize: 11, color: '#7a9b97', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 },
    breakdownName: { fontSize: 12, color: '#4a6b67', marginBottom: 4, fontWeight: 500 },
    breakdownVal: { fontSize: 15, fontWeight: 800, color: '#1a2e2c' },
    errMsg: { color: '#d32f2f', fontSize: 13, marginTop: 8, fontWeight: 600 },
    sectionTitle: { fontSize: 15, fontWeight: 700, color: '#1a2e2c', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 },
    gifWrap: { display: 'flex', justifyContent: 'center' },
    gifImg: {
        width: '100%', maxWidth: 355, borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,91,82,0.15)',
        objectFit: 'cover', display: 'block',
        animation: 'gifFadeIn .3s ease forwards',
    },
}

// ── Select custom styles ───────────────────────────────────────────────────────
const selectStyles = {
    control: (base, state) => ({
        ...base, borderRadius: 10,
        border: `1.5px solid ${state.isFocused ? defaultTheme.primary || '#005B52' : '#D0D5DD'}`,
        boxShadow: state.isFocused ? `0 0 0 3px ${defaultTheme.primary || '#005B52'}18` : 'none',
        minHeight: 42, fontSize: 14,
        '&:hover': { borderColor: defaultTheme.primary || '#005B52' },
    }),
    option: (base, state) => ({
        ...base,
        background: state.isSelected ? defaultTheme.primary || '#005B52' : state.isFocused ? '#f0fdf9' : '#fff',
        color: state.isSelected ? '#fff' : '#1a2e2c',
        fontWeight: state.isSelected ? 700 : 400, fontSize: 14,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
}

// ── CalcIcon ──────────────────────────────────────────────────────────────────
const CalcIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="8" y1="10" x2="16" y2="10" />
        <line x1="8" y1="14" x2="12" y2="14" />
    </svg>
)

const StackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={defaultTheme.primary || '#005B52'} strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
)

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DIYCalculator() {
    const { locationName } = useUserStore((state) => state.user) || {}

    // Pune-only users are locked to Pune and never see the tabs.
    const isPuneOnly = locationName === 'Pune'
    const showRegionTabs = !isPuneOnly

    const [region, setRegion] = useState(isPuneOnly ? 'pune' : 'ncr')
    const [combo, setCombo] = useState('combo')
    const [options, setOptions] = useState([])
    const [loading, setLoading] = useState(false)
    const [apiError, setApiError] = useState('')

    // Single
    const [selA, setSelA] = useState(null)
    const [result, setResult] = useState(null)
    const [err, setErr] = useState('')

    // Combo2
    const [sel2A, setSel2A] = useState(null)
    const [sel2B, setSel2B] = useState(null)
    const [result2, setResult2] = useState(null)
    const [err2, setErr2] = useState('')

    // Combo3
    const [sel3A, setSel3A] = useState(null)
    const [sel3B, setSel3B] = useState(null)
    const [sel3C, setSel3C] = useState(null)
    const [result3, setResult3] = useState(null)
    const [err3, setErr3] = useState('')

    // ── Reset every selection/result ──────────────────────────────────────────
    const resetAllSelections = () => {
        setSelA(null); setResult(null); setErr('')
        setSel2A(null); setSel2B(null); setResult2(null); setErr2('')
        setSel3A(null); setSel3B(null); setSel3C(null); setResult3(null); setErr3('')
    }

    // ── Fetch projects when region changes ────────────────────────────────────
    // Field names differ between APIs:
    //   NCR  → builder_project, single_incentive  (snake_case)
    //   Pune → builderProject,  singleIncentive   (camelCase)
    // We normalize both shapes into a single internal format.
    useEffect(() => {
        const regionCfg = REGION_OPTIONS.find(r => r.value === region)
        if (!regionCfg) return

        const fetchData = async () => {
            setLoading(true)
            setApiError('')
            setOptions([])
            try {
                const res = await ApiClient.get(regionCfg.api)
                const data = res?.data?.data || res?.data || []

                setOptions(data.map((item) => ({
                    label: item?.builder_project ?? item?.builderProject,
                    value: item?.id,
                    incentive: item?.incentive,
                    single_incentive: item?.single_incentive ?? item?.singleIncentive,
                })))
            } catch {
                setApiError('Failed to load projects. Please refresh.')
                setOptions([])
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [region])

    // ── Switch region tab ─────────────────────────────────────────────────────
    const handleRegionChange = (val) => {
        if (val === region) return
        setRegion(val)
        resetAllSelections()
    }

    // ── Reset ALL state on combo change ───────────────────────────────────────
    const handleComboChange = (val) => {
        setCombo(val)
        resetAllSelections()
    }

    // ── Calculate Single ──────────────────────────────────────────────────────
    const handleCalc = () => {
        if (!selA) { setErr('Please select a project.'); return }
        setErr('')
        setResult({ total: selA.single_incentive, items: [selA] })
    }

    // ── Calculate Combo2 ──────────────────────────────────────────────────────
    const handleCalc2 = () => {
        if (!sel2A || !sel2B) { setErr2('Please select both projects.'); return }
        setErr2('')
        setResult2({ total: sel2A.incentive + sel2B.incentive, items: [sel2A, sel2B] })
    }

    // ── Calculate Combo3 ──────────────────────────────────────────────────────
    const handleCalc3 = () => {
        if (!sel3A || !sel3B || !sel3C) { setErr3('Please select all three projects.'); return }
        setErr3('')
        setResult3({
            total: sel3A.incentive + sel3B.incentive + sel3C.incentive,
            items: [sel3A, sel3B, sel3C],
        })
    }

    // ── Shared Dropdown ───────────────────────────────────────────────────────
    const Dropdown = ({ label, value, onChange, placeholder }) => (
        <div style={S.dropdownWrap}>
            <div style={S.label}>{label}</div>
            <Select
                isLoading={loading}
                options={options}
                value={value}
                onChange={onChange}
                placeholder={placeholder || 'Select project…'}
                styles={selectStyles}
                menuPortalTarget={document.body}
                isClearable
            />
        </div>
    )

    // ── Result Panel ──────────────────────────────────────────────────────────
    const ResultPanel = ({ result }) => (
        <>
            <div style={S.resultBox}>
                <div style={S.breakdown}>
                    {result?.items?.map((item, idx) => (
                        <div key={idx} style={S.breakdownItem}>
                            <div style={S.breakdownLabel}>
                                {result.items.length === 1 ? 'Project' : `Project ${idx + 1}`}
                            </div>
                            <div style={S.breakdownName}>{item.label}</div>
                        </div>
                    ))}
                </div>

                <div>
                    <div style={S.resultLabel}>Total Incentive</div>
                    <div style={S.resultAmount}>{formatINR(result.total)}</div>
                </div>
            </div>

            <h1 style={{ textAlign: 'center', fontWeight: 'bold', marginTop: 10, fontSize: 20, color: defaultTheme.primary || '#005B52' }}>
                🎉 PAISA HI PAISA HOGA 🎉
            </h1>
            <div style={S.gifWrap}>
                <img src={moneyGif} alt="Money celebration" style={S.gifImg} />
            </div>
        </>
    )

    // ── Calculate button ──────────────────────────────────────────────────────
    const CalcButton = ({ onClick }) => (
        <div>
            <button
                style={S.calcBtn}
                onClick={onClick}
                onMouseEnter={e => e.currentTarget.style.opacity = '.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
                <CalcIcon /> Calculate
            </button>
        </div>
    )

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <PageContent>
            <Breadcrumbs title="Calculator" breadcrumbItem="DIY Calculator" />
            <Container fluid={true}>
                <div style={S.card}>

                    {/* ══ REGION TABS — hidden for Pune-only users ══ */}
                    {showRegionTabs && (
                        <div style={S.regionTabsWrap}>
                            {REGION_OPTIONS.map((r) => {
                                const active = region === r.value
                                return (
                                    <button
                                        key={r.value}
                                        type="button"
                                        style={S.regionTab(active)}
                                        onClick={() => handleRegionChange(r.value)}
                                    >
                                        {r.label}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* ── Combo radio buttons ── */}
                    <div style={S.radioGroup}>
                        {COMBO_OPTIONS.map((opt) => {
                            const active = combo === opt.value
                            return (
                                <label key={opt.value} style={S.radioLabel(active)}
                                    onClick={() => handleComboChange(opt.value)}>
                                    <input type="radio" name="combo" value={opt.value} checked={active}
                                        onChange={() => handleComboChange(opt.value)}
                                        style={{ display: 'none' }} />
                                    <span style={S.radioDot(active)}>
                                        {active && <span style={S.radioDotInner} />}
                                    </span>
                                    {opt.label}
                                </label>
                            )
                        })}
                    </div>

                    {apiError && <div style={S.errMsg}>{apiError}</div>}

                    {/* ══ SINGLE ══════════════════════════════════════════ */}
                    {combo === 'combo' && (
                        <div>
                            <div style={S.sectionTitle}><StackIcon /> Select Project</div>
                            <div style={S.dropdownsRow}>
                                <Dropdown
                                    label="Select Project"
                                    value={selA}
                                    onChange={setSelA}
                                    placeholder="Select project…"
                                />
                                <CalcButton onClick={handleCalc} />
                            </div>
                            {err && <div style={S.errMsg}>⚠ {err}</div>}
                            {result && <ResultPanel result={result} />}
                        </div>
                    )}

                    {/* ══ COMBO 2 ══════════════════════════════════════════ */}
                    {combo === 'combo2' && (
                        <div>
                            <div style={S.sectionTitle}><StackIcon /> Select 2 Projects</div>
                            <div style={S.dropdownsRow}>
                                <Dropdown label="Select Project 1" value={sel2A} onChange={setSel2A} placeholder="Select first project…" />
                                <Dropdown label="Select Project 2" value={sel2B} onChange={setSel2B} placeholder="Select second project…" />
                                <CalcButton onClick={handleCalc2} />
                            </div>
                            {err2 && <div style={S.errMsg}>⚠ {err2}</div>}
                            {result2 && <ResultPanel result={result2} />}
                        </div>
                    )}

                    {/* ══ COMBO 3 ══════════════════════════════════════════ */}
                    {combo === 'combo3' && (
                        <div>
                            <div style={S.sectionTitle}><StackIcon /> Select 3 Projects</div>
                            <div style={S.dropdownsRow}>
                                <Dropdown label="Select Project 1" value={sel3A} onChange={setSel3A} placeholder="Select first project…" />
                                <Dropdown label="Select Project 2" value={sel3B} onChange={setSel3B} placeholder="Select second project…" />
                                <Dropdown label="Select Project 3" value={sel3C} onChange={setSel3C} placeholder="Select third project…" />
                                <CalcButton onClick={handleCalc3} />
                            </div>
                            {err3 && <div style={S.errMsg}>⚠ {err3}</div>}
                            {result3 && <ResultPanel result={result3} />}
                        </div>
                    )}

                </div>
            </Container>
        </PageContent>
    )
}