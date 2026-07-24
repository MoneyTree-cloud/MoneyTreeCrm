import React, { useState, useMemo, useRef, useEffect } from 'react'
import PageContent from '../../components/Common/PageContent'
import { Container } from 'reactstrap'
import { MdEmail, MdMobileFriendly } from 'react-icons/md'
import { defaultTheme } from '../../helpers/defaultTheme'
import CheckUserAccess from '../../components/Common/CheckUserAccess'
import ScreenLoader from '../../constants/ScreenLoader'
import PermissionMissing from '../Utility/PermissonMissing'
import { useUserStore } from '../../store/useUserStore'

/* ─────────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────────── */
const MASTER_PASSWORD = 'Moneytree@123#'
const MAX_ATTEMPTS = 5

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const DATA = [
    // ── Rows 1-13: SEO/SMM ── email: contact.moneytreerealty@gmail.com | password: 12mo34ne56Ytree | number: 9732300007
    { dept: 'SEO/SMM', platform: 'GSC', url: 'https://search.google.com/search-console?resource_id=sc-domain%3Amoneytreerealty.com', email: 'contact.moneytreerealty@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    { dept: 'SEO/SMM', platform: 'Google Analytics', url: 'https://analytics.google.com/analytics/web/#/a303380370p428504632/reports/intelligenthome?params=_u..nav%3D', email: 'contact.moneytreerealty@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    { dept: 'SEO/SMM', platform: 'GMB', url: 'https://share.google/6w10Xu2NneOVR9g5f', email: 'contact.moneytreerealty@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    { dept: 'SEO/SMM', platform: 'Instagram', url: 'https://www.instagram.com/moneytreerealty official/', email: 'contact.moneytreerealty@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    { dept: 'SEO/SMM', platform: 'Facebook', url: 'https://www.facebook.com/moneytreerealty/', email: 'contact.moneytreerealty@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    { dept: 'SEO/SMM', platform: 'LinkedIn', url: 'https://in.linkedin.com/company/moneytree-realty', email: 'contact.moneytreerealty@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    { dept: 'SEO/SMM', platform: 'Claude', url: 'https://claude.ai/new', email: 'contact.moneytreerealty@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    { dept: 'SEO/SMM', platform: 'Canva', url: 'https://www.canva.com/', email: 'contact.moneytreerealty@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    { dept: 'SEO/SMM', platform: 'Twitter / X', url: 'https://x.com/', email: 'contact.moneytreerealty@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    { dept: 'SEO/SMM', platform: 'ChatGPT', url: 'https://x.com/home', email: 'contact.moneytreerealty@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    { dept: 'SEO/SMM', platform: 'Gemini', url: 'https://gemini.google.com/app', email: 'contact.moneytreerealty@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    { dept: 'SEO/SMM', platform: 'ShukranaOfficial - Insta', url: 'https://www.instagram.com/shukranaofficial/', email: 'contact.moneytreerealty@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    { dept: 'SEO/SMM', platform: 'Youtube', url: 'https://www.youtube.com/@Moneytreerealty official', email: 'contact.moneytreerealty@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    // ── Rows 14-15: Hosting + Website ── email: anmolbhatia857@gmail.com
    { dept: 'Hosting', platform: 'Hostinger', url: 'https://hpanel.hostinger.com/vps/641683/overview', email: 'anmolbhatia857@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    { dept: 'Website', platform: 'Official Domain', url: 'https://moneytreerealty.com/', email: 'anmolbhatia857@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    // ── Rows 16-17: Pinterest + Adobe CC ── email: moneytreerealty82@gmail.com
    { dept: 'SEO/SMM', platform: 'Pinterest', url: 'https://in.pinterest.com/moneytreerealty offical/', email: 'moneytreerealty82@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    { dept: 'SEO/SMM', platform: 'Adobe CC', url: 'https://www.adobe.com/home?acomLocale=in&mv=other&promoid=LLVYT1CM', email: 'moneytreerealty82@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
    // ── Row 18: SEO ── email: seo@moneytreerealty.com
    { dept: 'SEO', platform: '—', url: '', email: 'seo@moneytreerealty.com', password: 'Kavya@3d', number: '9732300007' },
    // ── Row 19: SEO ── email: realtymoneytree470@gmail.com | number: 9732300007 (col P = 1)
    { dept: 'SEO', platform: '—', url: '', email: 'realtymoneytree470@gmail.com', password: '12mo34ne56Ytree', number: '9732300007' },
]

const DEPT_COLORS = {
    'SEO/SMM': { bg: '#FEF9EC', text: '#92650a', dot: '#C9A84C', border: '#f0d98a' },
    'Hosting': { bg: '#FFF7ED', text: '#C2410C', dot: '#F97316', border: '#fed7aa' },
    'Website': { bg: '#F0FDF4', text: '#166534', dot: '#22C55E', border: '#bbf7d0' },
    'SEO': { bg: '#FDF4FF', text: '#7E22CE', dot: '#A855F7', border: '#e9d5ff' },
}

const PLATFORM_ICONS = {
    'GSC': '🔍', 'Google Analytics': '📊', 'GMB': '📍', 'Instagram': '📸',
    'Facebook': '👥', 'LinkedIn': '💼', 'Claude': '🤖', 'Canva': '🎨',
    'Twitter / X': '🐦', 'ChatGPT': '💬', 'Gemini': '✨',
    'ShukranaOfficial - Insta': '💛', 'Youtube': '▶️', 'Hostinger': '🌐',
    'Official Domain': '🔗', 'Pinterest': '📌', 'Adobe CC': '🎭',
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function copyText(text, cb) {
    navigator.clipboard?.writeText(text).then(() => cb?.()).catch(() => { })
}

/* ─────────────────────────────────────────────────────────────
   ICONS (inline SVG)
───────────────────────────────────────────────────────────── */
const EyeOpen = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
)

const EyeOff = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
)

const CopyIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
)

const CheckIcon = ({ color = '#22c55e' }) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const LockIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
)

/* ─────────────────────────────────────────────────────────────
   MASTER PASSWORD MODAL
───────────────────────────────────────────────────────────── */
function MasterPasswordModal({ onSuccess, onClose }) {
    const [val, setVal] = useState('')
    const [show, setShow] = useState(false)
    const [err, setErr] = useState('')
    const [attempts, setAttempts] = useState(0)
    const [locked, setLocked] = useState(false)
    const [shake, setShake] = useState(false)
    const inputRef = useRef(null)

    useEffect(() => {
        const t = setTimeout(() => inputRef.current?.focus(), 80)
        return () => clearTimeout(t)
    }, [])

    const submit = (e) => {
        e?.preventDefault()
        if (locked || !val) return
        if (val === MASTER_PASSWORD) {
            setErr('')
            onSuccess()
        } else {
            const next = attempts + 1
            setAttempts(next)
            setShake(true)
            setTimeout(() => setShake(false), 500)
            setVal('')
            if (next >= MAX_ATTEMPTS) {
                setLocked(true)
                setErr('Too many failed attempts. Access locked.')
            } else {
                setErr(`Wrong password — ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next !== 1 ? 's' : ''} left.`)
            }
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.78)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{
                background: '#fff', borderRadius: 24, width: '100%', maxWidth: 400,
                boxShadow: '0 40px 100px rgba(0,0,0,.4)',
                animation: shake ? 'mtShake .45s ease' : 'mtFadeUp .3s ease',
                overflow: 'hidden',
            }}>
                {/* Header band */}
                <div style={{ background: 'linear-gradient(135deg,#005B52 0%,#007A6E 60%,#009688 100%)', padding: '30px 28px 26px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -40, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
                    <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(201,168,76,.12)' }} />
                    {/* ✕ Close button */}
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ position: 'absolute', top: 14, right: 14, zIndex: 10, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.18)', border: '1.5px solid rgba(255,255,255,.35)', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, fontWeight: 700, transition: 'background .15s' }}
                            title="Close"
                        >
                            ✕
                        </button>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: '2px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LockIcon size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', textAlign: 'center', letterSpacing: -0.3 }}>Vault Access</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', textAlign: 'center', marginTop: 3 }}>MoneyTree Secure Credential Store</div>
                        </div>
                    </div>
                </div>

                {/* Gold accent line */}
                <div style={{ height: 3, background: 'linear-gradient(90deg,#005B52,#C9A84C,#005B52)' }} />

                {/* Body */}
                <div style={{ padding: '24px 28px 20px' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', textAlign: 'center', marginBottom: 4 }}>Enter Vault Password</div>
                    <div style={{ fontSize: 12, color: '#64748B', textAlign: 'center', marginBottom: 18, lineHeight: 1.5 }}>
                        Authorized personnel only. Incorrect attempts are tracked.
                    </div>

                    <form onSubmit={submit}>
                        {/* Input */}
                        <div style={{ position: 'relative', marginBottom: err ? 10 : 14 }}>
                            <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                <LockIcon size={15} />
                            </div>
                            <input
                                ref={inputRef}
                                type={show ? 'text' : 'password'}
                                value={val}
                                onChange={e => { setVal(e.target.value); setErr('') }}
                                placeholder="Enter vault password"
                                disabled={locked}
                                autoComplete="off"
                                style={{
                                    width: '100%', padding: '13px 42px 13px 40px',
                                    border: `2px solid ${err ? '#EF4444' : '#E2E8F0'}`,
                                    borderRadius: 12, fontSize: 15, color: '#0F172A',
                                    outline: 'none', fontFamily: 'inherit',
                                    background: err ? '#FEF2F2' : '#F8FAFC',
                                    transition: 'border-color .2s, background .2s',
                                    boxSizing: 'border-box',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShow(s => !s)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4, display: 'flex', alignItems: 'center' }}
                                tabIndex={-1}
                            >
                                {show ? <EyeOff /> : <EyeOpen />}
                            </button>
                        </div>

                        {/* Error */}
                        {err && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#FEF2F2', color: '#DC2626', fontSize: 12, fontWeight: 600, padding: '8px 12px', borderRadius: 8, border: '1px solid #FECACA', marginBottom: 12 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                {err}
                            </div>
                        )}

                        {/* Attempt dots */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
                            {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < attempts ? '#EF4444' : '#E2E8F0', transition: 'background .3s' }} />
                            ))}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={locked || !val}
                            style={{
                                width: '100%', padding: 14,
                                background: locked ? '#F1F5F9' : 'linear-gradient(135deg,#005B52,#007A6E)',
                                color: locked ? '#94A3B8' : '#fff',
                                border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800,
                                cursor: locked || !val ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                fontFamily: 'inherit', transition: 'opacity .2s',
                                opacity: !val && !locked ? .5 : 1,
                                boxSizing: 'border-box',
                            }}
                        >
                            {locked
                                ? '🔒 Access Locked'
                                : <><CheckIcon color="#fff" /> Unlock Vault</>
                            }
                        </button>
                    </form>
                </div>

                <div style={{ textAlign: 'center', padding: '10px 16px 14px', fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>
                    🔐 Protected by MoneyTree Security Policy
                </div>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   SECURE CHIP — email / number: hidden until vault unlocked
───────────────────────────────────────────────────────────── */
function SecureChip({ value, icon, masterUnlocked, onNeedAuth, showAll = false }) {
    const [revealed, setRevealed] = useState(false)
    const [copied, setCopied] = useState(false)
    const [shake, setShake] = useState(false)

    if (!value) return <span style={{ color: '#CBD5E1', fontSize: 13 }}>—</span>

    const isVisible = masterUnlocked && (showAll || revealed)

    const handleClick = () => {
        if (!masterUnlocked) {
            setShake(true)
            setTimeout(() => setShake(false), 400)
            onNeedAuth()
            return
        }
        setRevealed(v => !v)
    }

    const handleCopy = (e) => {
        e.stopPropagation()
        if (!masterUnlocked) { onNeedAuth(); return }
        copyText(value, () => { setCopied(true); setTimeout(() => setCopied(false), 1600) })
    }

    return (
        <div
            style={{
                display: 'flex', alignItems: 'center', gap: 6,
                animation: shake ? 'mtShake .4s ease' : 'none',
            }}
        >
            {/* Icon + masked/revealed value */}
            <div
                onClick={handleClick}
                title={masterUnlocked ? (isVisible ? 'Click to hide' : 'Click to reveal') : 'Unlock vault to view'}
                style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    cursor: 'pointer', padding: '4px 8px', borderRadius: 8,
                    background: isVisible ? '#F8FAFC' : '#F1F5F9',
                    border: `1px solid ${isVisible ? '#E2E8F0' : '#E2E8F0'}`,
                    transition: 'background .2s',
                    maxWidth: 200,
                }}
            >
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>
                {isVisible ? (
                    <span style={{ fontSize: 12, color: '#334155', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {value}
                    </span>
                ) : (
                    <span style={{ fontSize: 14, color: '#94A3B8', letterSpacing: 3, fontWeight: 700, userSelect: 'none' }}>
                        ••••••
                    </span>
                )}
                {/* eye icon */}
                <span style={{ color: '#CBD5E1', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {isVisible
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                </span>
            </div>

            {/* Copy button — only when revealed */}
            {isVisible && (
                <button
                    onClick={handleCopy}
                    title="Copy"
                    style={{ width: 24, height: 24, border: 'none', background: 'transparent', cursor: 'pointer', color: copied ? '#22c55e' : '#CBD5E1', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'color .15s' }}
                >
                    {copied
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                    }
                </button>
            )}
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   PASSWORD CELL
───────────────────────────────────────────────────────────── */
function PasswordCell({ value, masterUnlocked, showAll, onNeedAuth }) {
    const [localVisible, setLocalVisible] = useState(false)
    const [copied, setCopied] = useState(false)
    const [shake, setShake] = useState(false)

    if (!value) return <span style={{ color: '#CBD5E1', fontSize: 13 }}>—</span>

    const isVisible = masterUnlocked && (showAll || localVisible)

    const handleReveal = () => {
        if (!masterUnlocked) {
            setShake(true); setTimeout(() => setShake(false), 400)
            onNeedAuth()
        } else {
            setLocalVisible(v => !v)
        }
    }

    const handleCopy = () => {
        if (!masterUnlocked) { onNeedAuth(); return }
        copyText(value, () => { setCopied(true); setTimeout(() => setCopied(false), 1800) })
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, animation: shake ? 'mtShake .4s ease' : 'none' }}>
            <code style={{
                fontFamily: isVisible ? "'Fira Code','Courier New',monospace" : 'inherit',
                fontSize: isVisible ? 12 : 15,
                letterSpacing: isVisible ? 0.3 : 4,
                color: isVisible ? '#0F172A' : '#94A3B8',
                fontWeight: 700, minWidth: 80,
                transition: 'all .2s',
            }}>
                {isVisible ? value : '••••••••'}
            </code>
            <div style={{ display: 'flex', gap: 2 }}>
                <button
                    onClick={handleReveal}
                    title={isVisible ? 'Hide' : masterUnlocked ? 'Show' : 'Unlock to view'}
                    style={{ width: 26, height: 26, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                >
                    {isVisible ? <EyeOff /> : <EyeOpen />}
                </button>
                <button
                    onClick={handleCopy}
                    title={masterUnlocked ? 'Copy' : 'Unlock to copy'}
                    style={{ width: 26, height: 26, border: 'none', background: 'transparent', cursor: 'pointer', color: copied ? '#22c55e' : '#94A3B8', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   DEPT BADGE
───────────────────────────────────────────────────────────── */
function DeptBadge({ dept }) {
    const c = DEPT_COLORS[dept] || { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8', border: '#E2E8F0' }
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: c.bg, color: c.text, border: `1px solid ${c.border}`, letterSpacing: .5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
            {dept}
        </span>
    )
}

/* ─────────────────────────────────────────────────────────────
   URL CELL
───────────────────────────────────────────────────────────── */
function UrlCell({ value }) {
    if (!value) return <span style={{ color: '#CBD5E1', fontSize: 13 }}>—</span>
    const display = value.replace(/^https?:\/\//, '')
    return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="mt-url" title={value}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{display}</span>
        </a>
    )
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function SocialMediaData() {
    const [masterUnlocked, setMasterUnlocked] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showAllPw, setShowAllPw] = useState(false)
    const [showAllSecure, setShowAllSecure] = useState(false)
    const [search, setSearch] = useState('')
    const [deptFilter, setDeptFilter] = useState('All')
    const [pendingAction, setPendingAction] = useState(null)
    const [accessGranted, setAccessGranted] = useState(null);

    const userId = useUserStore((state) => state.user.userId);
    const goldColor = defaultTheme?.goldColorLogo || '#C9A84C'
    const greenColor = defaultTheme?.primaryColor || '#005B52'

    const depts = ['All', ...Array.from(new Set(DATA.map(d => d.dept)))]

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return DATA.filter(row => {
            const matchDept = deptFilter === 'All' || row.dept === deptFilter
            const matchQ = !q || row.platform.toLowerCase().includes(q)
                || row.email.toLowerCase().includes(q)
                || row.dept.toLowerCase().includes(q)
                || row.url.toLowerCase().includes(q)
            return matchDept && matchQ
        })
    }, [search, deptFilter])

    const handleNeedAuth = () => {
        if (masterUnlocked) return
        setPendingAction('single')
        setShowModal(true)
    }

    const handleShowAll = () => {
        if (!masterUnlocked) { setPendingAction('all'); setShowModal(true) }
        else { setShowAllPw(v => !v); setShowAllSecure(v => !v) }
    }

    const handleMasterSuccess = () => {
        setMasterUnlocked(true)
        setShowModal(false)
        if (pendingAction === 'all') { setShowAllPw(true); setShowAllSecure(true) }
        setPendingAction(null)
    }
    
    const handleLock = () => { setMasterUnlocked(false); setShowAllPw(false); setShowAllSecure(false) }

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'social-media-data');
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
            <style>{GLOBAL_CSS}</style>

            {showModal && <MasterPasswordModal onSuccess={handleMasterSuccess} onClose={() => { setShowModal(false); setPendingAction(null) }} />}

            <Container fluid style={{ padding: '20px 16px', minHeight: '100vh', background: '#F8FAFC' }}>

                {/* ══ HEADER ══════════════════════════════════════════ */}
                <div className="mt-header">
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                            <span className="mt-badge-red">🔐 Internal Access Only</span>
                            {masterUnlocked && <span className="mt-badge-green">✓ Vault Unlocked</span>}
                        </div>
                        <h1 style={{ fontSize: 'clamp(20px,3.5vw,30px)', fontWeight: 900, color: '#0F172A', letterSpacing: -0.5, margin: 0, marginBottom: 4 }}>
                            Platform Credentials
                        </h1>
                        <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                            MoneyTree Realty — Login Details &amp; Access Management
                        </p>
                    </div>

                    {/* Stat cards */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Platforms', value: DATA.length, color: '#6366F1' },
                            { label: 'Departments', value: Array.from(new Set(DATA.map(d => d.dept))).length, color: goldColor },
                            { label: masterUnlocked ? 'Unlocked' : 'Locked', value: masterUnlocked ? '✓' : '🔒', color: masterUnlocked ? '#22C55E' : '#EF4444' },
                        ].map(s => (
                            <div key={s.label} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '10px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 80, boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
                                <span style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</span>
                                <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: .6, whiteSpace: 'nowrap' }}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ══ TOOLBAR ═════════════════════════════════════════ */}
                <div className="mt-toolbar">
                    {/* Search */}
                    <div className="mt-search-box">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input className="mt-search-input" placeholder="Search platform, email…" value={search} onChange={e => setSearch(e.target.value)} />
                        {search && <button className="mt-clear-btn" onClick={() => setSearch('')}>✕</button>}
                    </div>

                    {/* Dept filter chips */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {depts.map(d => (
                            <button key={d} className={`mt-chip-btn ${deptFilter === d ? 'active' : ''}`} onClick={() => setDeptFilter(d)}>{d}</button>
                        ))}
                    </div>

                    {/* Right actions */}
                    <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
                        <button className={`mt-action-btn ${showAllPw ? 'danger' : ''}`} onClick={handleShowAll}>
                            {showAllPw ? <><EyeOff /> Hide All</> : <><EyeOpen /> Show All</>}
                        </button>
                        {masterUnlocked
                            ? <button className="mt-action-btn danger" onClick={handleLock}><LockIcon size={13} /> Lock Vault</button>
                            : <button className="mt-action-btn primary" onClick={() => setShowModal(true)}><LockIcon size={13} /> Unlock Vault</button>
                        }
                    </div>
                </div>

                {/* Count */}
                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
                    Showing <strong style={{ color: '#334155' }}>{filtered.length}</strong> of <strong style={{ color: '#334155' }}>{DATA.length}</strong> platforms
                    {search && <span style={{ color: goldColor }}> · "{search}"</span>}
                </div>

                {/* ══ TABLE ═══════════════════════════════════════════ */}
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'auto', boxShadow: '0 4px 28px rgba(0,0,0,.07)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(90deg,#F8FAFC,#f3f6fb)', borderBottom: '2px solid #E2E8F0' }}>
                                <th className="mt-th" style={{ width: 40, textAlign: 'center' }}>#</th>
                                <th className="mt-th" style={{ width: 120 }}>Dept.</th>
                                <th className="mt-th" style={{ width: 180 }}>Platform</th>
                                <th className="mt-th" style={{ minWidth: 320 }}>Login URL</th>
                                <th className="mt-th" style={{ width: 250 }}>Email ID</th>
                                <th className="mt-th" style={{ width: 190 }}>Password</th>
                                <th className="mt-th" style={{ width: 170 }}>Number</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: '#94A3B8' }}>
                                        <span style={{ fontSize: 38 }}>🔍</span>
                                        <span style={{ fontSize: 14 }}>No results for "{search}"</span>
                                    </div>
                                </td></tr>
                            ) : filtered.map((row, idx) => (
                                <tr key={idx} className="mt-row">
                                    <td style={{ padding: '12px 14px', fontSize: 11, color: '#CBD5E1', fontWeight: 800, textAlign: 'center' }}>{idx + 1}</td>
                                    <td style={{ padding: '12px 14px' }}><DeptBadge dept={row.dept} /></td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ width: 30, height: 30, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                                                {PLATFORM_ICONS[row.platform] || '🔗'}
                                            </span>
                                            <span style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>{row.platform}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 14px', maxWidth: 0, overflow: 'hidden' }}>
                                        <UrlCell value={row.url} />
                                    </td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <SecureChip value={row.email} icon={<MdEmail size={14} color={goldColor} />} masterUnlocked={masterUnlocked} onNeedAuth={handleNeedAuth} showAll={showAllSecure} />
                                    </td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <PasswordCell value={row.password} masterUnlocked={masterUnlocked} showAll={showAllPw} onNeedAuth={handleNeedAuth} />
                                    </td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <SecureChip value={row.number} icon={<MdMobileFriendly size={14} color={greenColor} />} masterUnlocked={masterUnlocked} onNeedAuth={handleNeedAuth} showAll={showAllSecure} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ══ FOOTER ══════════════════════════════════════════ */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 16, padding: '12px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, fontSize: 12, color: '#92400E', fontWeight: 500 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Confidential credentials — do not share outside the organization.&nbsp;·&nbsp;
                    Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>

            </Container>
        </PageContent>
    )
}


/* ─────────────────────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @keyframes mtFadeUp {
    from { opacity:0; transform:translateY(22px) scale(.97) }
    to   { opacity:1; transform:none }
  }
  @keyframes mtShake {
    0%,100% { transform:translateX(0) }
    15%     { transform:translateX(-9px) }
    35%     { transform:translateX(9px) }
    55%     { transform:translateX(-6px) }
    75%     { transform:translateX(5px) }
    90%     { transform:translateX(-2px) }
  }

  /* Layout */
  .mt-header  { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:16px; }
  .mt-toolbar { display:flex; align-items:center; gap:10px; margin-bottom:14px; flex-wrap:wrap; }

  /* Badges */
  .mt-badge-red   { padding:3px 10px; border-radius:20px; font-size:10px; font-weight:800; letter-spacing:1px; text-transform:uppercase; background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; }
  .mt-badge-green { padding:3px 10px; border-radius:20px; font-size:10px; font-weight:800; letter-spacing:1px; text-transform:uppercase; background:#F0FDF4; color:#15803D; border:1px solid #BBF7D0; }

  /* Search */
  .mt-search-box   { display:flex; align-items:center; gap:8px; background:#fff; border:1.5px solid #E2E8F0; border-radius:10px; padding:9px 13px; flex:1 1 200px; max-width:360px; box-shadow:0 1px 3px rgba(0,0,0,.04); }
  .mt-search-input { border:none; outline:none; font-size:13px; color:#0F172A; background:transparent; flex:1; font-family:inherit; min-width:80px; }
  .mt-clear-btn    { border:none; background:none; cursor:pointer; color:#94A3B8; font-size:12px; padding:0; }

  /* Filter chips */
  .mt-chip-btn        { padding:6px 13px; border-radius:8px; border:1.5px solid #E2E8F0; background:#fff; color:#64748B; font-size:11px; font-weight:700; cursor:pointer; font-family:inherit; transition:all .15s; white-space:nowrap; letter-spacing:.3px; }
  .mt-chip-btn.active { background:#005B52; border-color:#005B52; color:#fff; }
  .mt-chip-btn:hover:not(.active) { background:#F1F5F9; border-color:#CBD5E1; }

  /* Action buttons */
  .mt-action-btn         { display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:9px; border:1.5px solid #E2E8F0; background:#fff; color:#334155; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; transition:all .15s; white-space:nowrap; }
  .mt-action-btn.primary { background:linear-gradient(135deg,#005B52,#007A6E); border-color:#005B52; color:#fff; }
  .mt-action-btn.primary:hover { opacity:.9; }
  .mt-action-btn.danger  { background:#FEF2F2; border-color:#FECACA; color:#DC2626; }
  .mt-action-btn:hover:not(.primary):not(.danger) { background:#F1F5F9; }

  /* Table */
  .mt-th  { padding:12px 14px; text-align:left; font-size:10px; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:.9px; white-space:nowrap; }
  .mt-row { border-bottom:1px solid #F1F5F9; transition:background .12s; }
  .mt-row:hover { background:#F8FBFF !important; }
  .mt-row:last-child { border-bottom:none; }

  /* URL link */
  .mt-url { display:flex; align-items:center; gap:5px; color:#6366F1; text-decoration:none; font-size:12px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:100%; }
  .mt-url:hover { text-decoration:underline !important; }

  /* Copy chip */
  .mt-chip { display:flex; align-items:center; gap:5px; cursor:pointer; padding:5px 8px; border-radius:8px; transition:background .15s; background:transparent; max-width:220px; }
  .mt-chip:hover { background:#F1F5F9 !important; }

  /* Icon button hover — scoped, does NOT override primary/action buttons */
  .mt-action-btn.primary:hover { background:linear-gradient(135deg,#004840,#005B52) !important; color:#fff !important; opacity:1 !important; }
  .mt-action-btn.danger:hover  { background:#fee2e2 !important; color:#DC2626 !important; }
  .mt-action-btn:hover:not(.primary):not(.danger) { background:#F1F5F9 !important; color:#334155 !important; }

  /* Modal input focus */
  input:focus {
    border-color: #005B52 !important;
    background: #fff !important;
    box-shadow: 0 0 0 3px rgba(0,91,82,.1) !important;
  }

  /* Responsive */
  @media (max-width:768px) {
    .mt-header  { flex-direction:column; }
    .mt-toolbar { flex-direction:column; align-items:stretch; }
    .mt-search-box { max-width:100%; }
    .mt-action-btn { justify-content:center; }
  }
  @media (max-width:480px) {
    .mt-chip-btn { font-size:10px; padding:5px 9px; }
    .mt-badge-red, .mt-badge-green { font-size:9px; }
  }
`