import { useEffect, useState } from 'react'
import PageContent from '../../components/Common/PageContent'
import ScreenLoader from '../../constants/ScreenLoader'
import { Container } from 'reactstrap'
import Breadcrumbs from '../../components/Common/Breadcrumb'
import ApiClient from '../../helpers/api_helper'
import { toast } from 'react-toastify'
import { MdPerson, MdEmail, MdPhone, MdLink, MdLocationOn, MdCampaign, MdClose } from 'react-icons/md'
import { ADD_PPC_LEADS, ALL_LOCATION_DROPDOWN } from '../../helpers/url_helper'
import CheckUserAccess from '../../components/Common/CheckUserAccess'
import PermissionMissing from '../Utility/PermissonMissing'
import { useUserStore } from '../../store/useUserStore'
import { useGet } from '../../Hooks/useApi'
import Select from 'react-select'

// ── Styles ────────────────────────────────────────────────────────────────────
if (document.getElementById("appc-s")) document.getElementById("appc-s").remove()
const _s = document.createElement("style")
_s.id = "appc-s"
_s.textContent = `
    .appc-hdr {
        background: linear-gradient(135deg, #005B52 0%, #007A6E 60%, #00897B 100%);
        border-radius: 16px; padding: 20px 26px; margin-bottom: 20px;
        position: relative; overflow: hidden;
        display: flex; align-items: center; gap: 16px;
    }
    .appc-hdr::before { content: ''; position: absolute; top: -40px; right: -40px; width: 180px; height: 180px; border-radius: 50%; background: rgba(255,255,255,.05); pointer-events: none; }
    .appc-hdr::after  { content: ''; position: absolute; bottom: -50px; left: 60px; width: 140px; height: 140px; border-radius: 50%; background: rgba(255,255,255,.04); pointer-events: none; }
    .appc-hdr-icon { width: 52px; height: 52px; border-radius: 14px; background: rgba(255,255,255,.15); border: 1.5px solid rgba(255,255,255,.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; }
    .appc-hdr-title { font-size: 20px; font-weight: 800; color: #fff; position: relative; }
    .appc-hdr-sub   { font-size: 12px; color: rgba(255,255,255,.65); margin-top: 3px; position: relative; }

    .appc-card { background: #fff; border: 1px solid #E8ECF2; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,.05); overflow: hidden; }
    .appc-card-head { background: linear-gradient(90deg, #f8fffe 0%, #f0fdf9 100%); border-bottom: 1px solid #E8ECF2; padding: 14px 24px; display: flex; align-items: center; gap: 10px; }
    .appc-card-head-title { font-size: 14px; font-weight: 700; color: #005B52; }
    .appc-card-head-sub   { font-size: 11px; color: #94A3B8; margin-top: 1px; }
    .appc-card-body { padding: 24px; }

    .appc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    @media (max-width: 900px) { .appc-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 580px) { .appc-grid { grid-template-columns: 1fr; } }

    .appc-field { display: flex; flex-direction: column; gap: 6px; }
    .appc-label { font-size: 11px; font-weight: 700; color: #64748B; letter-spacing: .4px; text-transform: uppercase; display: flex; align-items: center; gap: 5px; }
    .appc-req { color: #E53E3E; font-size: 13px; line-height: 1; }

    .appc-input-wrap { position: relative; }
    .appc-input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94A3B8; pointer-events: none; display: flex; align-items: center; transition: color .2s; }
    .appc-input-wrap:focus-within .appc-input-icon { color: #005B52; }

    .appc-input { height: 42px; width: 100%; padding: 0 14px 0 38px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 500; color: #0F172A; background: #F8FAFC; outline: none; transition: border-color .2s, background .2s, box-shadow .2s; }
    .appc-input::placeholder { color: #CBD5E1; font-weight: 400; }
    .appc-input:hover:not(:focus) { border-color: #CBD5E1; background: #fff; }
    .appc-input:focus { border-color: #005B52; background: #fff; box-shadow: 0 0 0 3px rgba(0,91,82,.09); }
    .appc-input.err { border-color: #E53E3E !important; box-shadow: 0 0 0 3px rgba(229,62,62,.1) !important; background: #fff8f8; }

    .appc-hint { font-size: 11px; color: #E53E3E; font-weight: 600; display: none; margin-top: 2px; }
    .appc-hint.show { display: block; }

    .appc-source-badge { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 20px; background: linear-gradient(135deg,#005B52,#007A6E); color: #fff; font-size: 12px; font-weight: 700; box-shadow: 0 2px 8px rgba(0,91,82,.25); width: fit-content; }

    .appc-divider { height: 1px; background: #F1F5F9; margin: 20px 0; }

    .appc-actions { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding-top: 4px; }
    .appc-btn { height: 42px; padding: 0 24px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; border: none; transition: all .2s; }
    .appc-btn-cancel { background: #F1F5F9; color: #475569; border: 1.5px solid #E2E8F0; }
    .appc-btn-cancel:hover { background: #E2E8F0; }
    .appc-btn-save { background: linear-gradient(135deg, #005B52 0%, #007A6E 100%); color: #fff; box-shadow: 0 4px 14px rgba(0,91,82,.3); position: relative; overflow: hidden; }
    .appc-btn-save::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent); transform: translateX(-100%); transition: transform .5s; }
    .appc-btn-save:hover { box-shadow: 0 6px 20px rgba(0,91,82,.4); transform: translateY(-1px); }
    .appc-btn-save:hover::before { transform: translateX(100%); }
    .appc-btn-save:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: none; }

    .appc-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: appc-spin .7s linear infinite; flex-shrink: 0; }
    @keyframes appc-spin { to { transform: rotate(360deg); } }
`
document.head.appendChild(_s)

// ── react-select styles (matching app theme) ──────────────────────────────────
const SEL_STYLES = {
    control: (b, st) => ({
        ...b,
        minHeight: 42, fontSize: 13, fontWeight: 500,
        border: `1.5px solid ${st.isFocused ? '#005B52' : '#E2E8F0'}`,
        borderRadius: 10,
        background: st.isFocused ? '#fff' : '#F8FAFC',
        boxShadow: st.isFocused ? '0 0 0 3px rgba(0,91,82,.09)' : 'none',
        paddingLeft: 28,           // room for the icon
        cursor: 'pointer',
        transition: 'border-color .2s, box-shadow .2s',
        '&:hover': { borderColor: '#CBD5E1', background: '#fff' },
    }),
    option: (b, st) => ({
        ...b, fontSize: 13,
        background: st.isSelected ? '#005B52' : st.isFocused ? '#f0fdf9' : '#fff',
        color: st.isSelected ? '#fff' : '#0F172A',
        cursor: 'pointer',
    }),
    placeholder: b => ({ ...b, color: '#CBD5E1', fontWeight: 400, fontSize: 13 }),
    singleValue: b => ({ ...b, color: '#0F172A', fontWeight: 500 }),
    menuPortal: b => ({ ...b, zIndex: 9999 }),
    menu: b => ({ ...b, borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,.1)' }),
}

// error variant
const SEL_STYLES_ERR = {
    ...SEL_STYLES,
    control: (b, st) => ({
        ...SEL_STYLES.control(b, st),
        border: '1.5px solid #E53E3E !important',
        boxShadow: '0 0 0 3px rgba(229,62,62,.1) !important',
        background: '#fff8f8',
    }),
}

const INITIAL = { name: '', email: '', mobileNumber: '', websiteUrl: '', location: null }

// ── Component ─────────────────────────────────────────────────────────────────
export default function AddPPCLeads() {
    const [form,          setForm]          = useState(INITIAL)
    const [errors,        setErrors]        = useState({})
    const [pending,       setPending]       = useState(false)
    const [accessGranted, setAccessGranted] = useState(null)
    const { userId } = useUserStore(s => s.user)

    const { data: locationList } = useGet(ALL_LOCATION_DROPDOWN, { enabled: Boolean(accessGranted) })

    // Build options from API: adjust key names to match your actual response
    const locationOptions = (locationList?.data?.data || []).map(item => ({
        label: item.locationName || item.name || item.label,
        value: item.locationName || item.name || item.value,
    }))

    const set = (key, val) => {
        setForm(p => ({ ...p, [key]: val }))
        if (errors[key]) setErrors(p => ({ ...p, [key]: '' }))
    }

    // ── Validation ──────────────────────────────────────────────────────────
    const validate = () => {
        const e = {}
        if (!form.name.trim())
            e.name = 'Name is required'
        if (!form.email.trim())
            e.email = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = 'Enter a valid email address'
        if (!form.mobileNumber)
            e.mobileNumber = 'Mobile number is required'
        else if (!/^\d{10}$/.test(form.mobileNumber))
            e.mobileNumber = 'Must be exactly 10 digits'
        if (!form.websiteUrl.trim())
            e.websiteUrl = 'Website URL is required'
        if (!form.location)
            e.location = 'Location is required'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!validate()) { toast.error('Please fix the highlighted errors'); return }
        setPending(true)
        try {
            const params = new URLSearchParams({
                name:         form.name.trim(),
                email:        form.email.trim(),
                mobileNumber: form.mobileNumber,
                websiteUrl:   form.websiteUrl.trim(),
                location:     form.location?.value || '',
                source:       '1BHK',           // hardcoded
            }).toString()
            const res = await ApiClient.post(`${ADD_PPC_LEADS}?${params}`)
            if (res?.data?.status === 1) {
                toast.success(res.data.message || 'Lead added successfully')
                setForm(INITIAL)
                setErrors({})
            } else {
                toast.error(res?.data?.message || 'Something went wrong')
            }
        } catch (err) {
            toast.error(err.message)
        } finally {
            setPending(false)
        }
    }

    const handleReset = () => { setForm(INITIAL); setErrors({}) }

    // digits only, max 10
    const onMobileChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 10)
        set('mobileNumber', val)
    }

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'add-ppc-leads')
            setAccessGranted(hasAccess)
        }
        checkAccess()
    }, [userId])

    if (accessGranted === null) return <ScreenLoader />
    if (!accessGranted) return <PermissionMissing />

    return (
        <PageContent>
            {pending && <ScreenLoader />}
            <Container fluid>
                <Breadcrumbs title="Leads" breadcrumbItem="Add PPC Lead" />

                {/* ── Header ── */}
                <div className="appc-hdr">
                    <div className="appc-hdr-icon">
                        <MdCampaign size={26} color="#fff" />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <div className="appc-hdr-title">Add PPC Lead</div>
                        <div className="appc-hdr-sub">Fill in the details below to register a new PPC lead</div>
                    </div>
                </div>

                {/* ── Form Card ── */}
                <div className="appc-card">
                    <div className="appc-card-head">
                        <div>
                            <div className="appc-card-head-title">Lead Information</div>
                            <div className="appc-card-head-sub">All fields marked * are required</div>
                        </div>
                    </div>

                    <div className="appc-card-body">
                        <div className="appc-grid">

                            {/* Name */}
                            <div className="appc-field">
                                <label className="appc-label"><MdPerson size={13} /> Name <span className="appc-req">*</span></label>
                                <div className="appc-input-wrap">
                                    <span className="appc-input-icon"><MdPerson size={15} /></span>
                                    <input
                                        className={`appc-input ${errors.name ? 'err' : ''}`}
                                        type="text" placeholder="Enter full name"
                                        value={form.name} onChange={e => set('name', e.target.value)}
                                    />
                                </div>
                                <span className={`appc-hint ${errors.name ? 'show' : ''}`}>{errors.name}</span>
                            </div>

                            {/* Email */}
                            <div className="appc-field">
                                <label className="appc-label"><MdEmail size={13} /> Email <span className="appc-req">*</span></label>
                                <div className="appc-input-wrap">
                                    <span className="appc-input-icon"><MdEmail size={15} /></span>
                                    <input
                                        className={`appc-input ${errors.email ? 'err' : ''}`}
                                        type="email" placeholder="example@email.com"
                                        value={form.email} onChange={e => set('email', e.target.value)}
                                    />
                                </div>
                                <span className={`appc-hint ${errors.email ? 'show' : ''}`}>{errors.email}</span>
                            </div>

                            {/* Mobile */}
                            <div className="appc-field">
                                <label className="appc-label"><MdPhone size={13} /> Mobile Number <span className="appc-req">*</span></label>
                                <div className="appc-input-wrap">
                                    <span className="appc-input-icon"><MdPhone size={15} /></span>
                                    <input
                                        className={`appc-input ${errors.mobileNumber ? 'err' : ''}`}
                                        type="text" inputMode="numeric"
                                        placeholder="10-digit mobile number"
                                        value={form.mobileNumber}
                                        onChange={onMobileChange}
                                        maxLength={10}
                                    />
                                </div>
                                <span className={`appc-hint ${errors.mobileNumber ? 'show' : ''}`}>{errors.mobileNumber}</span>
                            </div>

                            {/* Website URL — now mandatory */}
                            <div className="appc-field">
                                <label className="appc-label"><MdLink size={13} /> Website URL <span className="appc-req">*</span></label>
                                <div className="appc-input-wrap">
                                    <span className="appc-input-icon"><MdLink size={15} /></span>
                                    <input
                                        className={`appc-input ${errors.websiteUrl ? 'err' : ''}`}
                                        type="text" placeholder="https://example.com"
                                        value={form.websiteUrl}
                                        onChange={e => set('websiteUrl', e.target.value)}
                                    />
                                </div>
                                <span className={`appc-hint ${errors.websiteUrl ? 'show' : ''}`}>{errors.websiteUrl}</span>
                            </div>

                            {/* Location — react-select dropdown */}
                            <div className="appc-field">
                                <label className="appc-label"><MdLocationOn size={13} /> Location <span className="appc-req">*</span></label>
                                <div style={{ position: 'relative' }}>
                                    {/* icon sits on top of the select control */}
                                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1, color: form.location ? '#005B52' : '#94A3B8', pointerEvents: 'none', display: 'flex' }}>
                                        <MdLocationOn size={15} />
                                    </span>
                                    <Select
                                        options={locationOptions}
                                        value={form.location}
                                        onChange={opt => set('location', opt)}
                                        placeholder="Select location…"
                                        isClearable
                                        styles={errors.location ? SEL_STYLES_ERR : SEL_STYLES}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                    />
                                </div>
                                <span className={`appc-hint ${errors.location ? 'show' : ''}`}>{errors.location}</span>
                            </div>


                        </div>

                        {/* ── Actions ── */}
                        <div className="appc-divider" />
                        <div className="appc-actions">
                            <button className="appc-btn appc-btn-cancel" type="button" onClick={handleReset}>
                                <MdClose size={14} /> Reset
                            </button>
                            <button className="appc-btn appc-btn-save" type="button" onClick={handleSave} disabled={pending}>
                                {pending
                                    ? <><div className="appc-spinner" /> Submitting…</>
                                    : <><MdCampaign size={15} /> Add Lead</>
                                }
                            </button>
                        </div>
                    </div>
                </div>

            </Container>
        </PageContent>
    )
}