import { useEffect, useState } from "react";
import UsePanel from "./UserPanel";
import { Row, Container } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import CartesianGridChart from "./CartesianGridChart";
import withUserDashboard from "./withUserDashboard";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import { USER_TYPE } from "../../constants/global";
import { useNavigate } from "react-router-dom";
import ProfileCompletionModal from "../../components/Common/ProfileCompletionModal";
import TickerFile from "../Activity/TickerFile";
import { assetImageBaseUrl, imageBaseUrl } from "../../helpers/api_helper";

// ── Styles ────────────────────────────────────────────────────────────────────
if (document.getElementById("dash-s")) document.getElementById("dash-s").remove()
const _s = document.createElement("style")
_s.id = "dash-s"
_s.textContent = `
    /* ── Hero ── */
    .dash-hero {
        background:linear-gradient(135deg,#004A42 0%,#005B52 45%,#007A6E 100%);
        border-radius:18px; padding:0; overflow:hidden;
        box-shadow:0 8px 30px rgba(0,91,82,.22); margin-bottom:18px;
        display:flex; align-items:stretch; min-height:200px;
        position:relative;
    }
    /* big decorative circle top-right */
    .dash-hero::before {
        content:""; position:absolute; top:-80px; right:-80px;
        width:260px; height:260px; border-radius:50%;
        background:radial-gradient(circle,rgba(255,255,255,.09),transparent 65%);
        pointer-events:none;
    }
    /* gold glow bottom-left */
    .dash-hero::after {
        content:""; position:absolute; bottom:-80px; left:120px;
        width:200px; height:200px; border-radius:50%;
        background:radial-gradient(circle,rgba(201,168,76,.18),transparent 65%);
        pointer-events:none;
    }

    /* left logo panel */
    .dash-hero-logo-panel {
        width:50%; flex-shrink:0;
        background:rgba(255,255,255,.10);
        border-right:1px solid rgba(255,255,255,.12);
        display:flex; align-items:center; justify-content:center; padding:24px 20px;
    }
    .dash-hero-logo-panel img { width:350px; max-height:350px; object-fit:contain; filter:brightness(1.15) drop-shadow(0 4px 12px rgba(0,0,0,.18)); }

    /* right text content */
    .dash-hero-body { flex:1; padding:24px 28px; position:relative; z-index:1; display:flex; flex-direction:column; justify-content:center; gap:8px; }
    .dash-hero-greeting { font-size:15px; font-weight:700; color:rgba(255,255,255,.65); text-transform:uppercase; letter-spacing:1.6px; display:flex; align-items:center; gap:6px; }
    .dash-hero-name { font-size:30px; font-weight:900; color:#fff; line-height:1.15; letter-spacing:-.3px; }
    .dash-hero-pills { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .dash-hero-pill { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; }
    .dash-hero-pill-emp   { background:rgba(255,255,255,.14); color:#fff;font-size:18px }
    .dash-hero-pill-date  { background:rgba(201,168,76,.22); color:#FDE68A; border:1px solid rgba(201,168,76,.3); }
    .dash-hero-pill-level { background:rgba(0,165,149,.28); color:#A7F3D0; border:1px solid rgba(167,243,208,.25); letter-spacing:.4px;font-size:18px }
    .dash-hero-user-row { display:flex; align-items:center; gap:14px; }
    .dash-hero-avatar { width:100px; height:100px; border-radius:14px; object-fit:cover; border:2.5px solid rgba(255,255,255,.4); flex-shrink:0; box-shadow:0 4px 12px rgba(0,0,0,.2); }
    .dash-hero-avatar-ph { width:100px; height:100px; border-radius:14px; background:rgba(255,255,255,.13); border:2px dashed rgba(255,255,255,.3); display:flex; align-items:center; justify-content:center; flex-shrink:0; }

    /* ── Quick link cards ── */
    .dash-cards { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-bottom:18px; }
    @media(max-width:600px){ .dash-cards { grid-template-columns:1fr; } }

    .dash-card {
        border-radius:14px; padding:20px 22px; cursor:pointer;
        display:flex; align-items:center; gap:16px;
        border:1.5px solid transparent; transition:all .2s;
        position:relative; overflow:hidden;
    }
    .dash-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,.1); }
    .dash-card-icon {
        width:50px; height:50px; border-radius:14px;
        display:flex; align-items:center; justify-content:center;
        font-size:22px; flex-shrink:0;
    }
    .dash-card-text { flex:1; }
    .dash-card-label { font-size:13px; font-weight:800; margin-bottom:2px; }
    .dash-card-sub   { font-size:11px; opacity:.65; font-weight:600; }
    .dash-card-arrow { font-size:18px; flex-shrink:0; opacity:.4; transition:all .18s; }
    .dash-card:hover .dash-card-arrow { opacity:.9; transform:translateX(3px); }

    /* card colour variants */
    .dash-card-teal   { background:linear-gradient(135deg,#F0FDF9,#E6FAF6); border-color:#A7F3D0; color:#065F46; }
    .dash-card-teal   .dash-card-icon { background:#CCFBEF; }
    .dash-card-teal:hover { border-color:#005B52; box-shadow:0 8px 24px rgba(0,91,82,.12); }

    .dash-card-gold   { background:linear-gradient(135deg,#FFFBEB,#FEF3C7); border-color:#FDE68A; color:#78350F; }
    .dash-card-gold   .dash-card-icon { background:#FEF9C3; }
    .dash-card-gold:hover { border-color:#C9A84C; box-shadow:0 8px 24px rgba(201,168,76,.15); }

    /* ── Date / time card ── */
    .dash-datetime {
        background:#fff; border:1px solid #E2E8F0; border-radius:14px;
        padding:16px 22px; display:flex; align-items:center; gap:16px;
        box-shadow:0 1px 4px rgba(0,0,0,.04);
    }
    .dash-dt-icon { font-size:28px; }
    .dash-dt-date { font-size:15px; font-weight:800; color:#0F172A; }
    .dash-dt-time { font-size:12px; color:#64748B; margin-top:2px; font-weight:600; }

    /* ── Responsive ── */

    /* Tablet landscape (≤1024px) */
    @media(max-width:1024px){
        .dash-hero-logo-panel { width:42%; }
        .dash-hero-logo-panel img { width:220px; max-height:220px; }
        .dash-hero-name { font-size:26px; }
        .dash-hero-greeting { font-size:13px; }
    }

    /* Tablet portrait (≤768px) — hero stacks vertically */
    @media(max-width:768px){
        .dash-hero { flex-direction:column; min-height:unset; }
        .dash-hero-logo-panel {
            width:100%; border-right:none;
            border-bottom:1px solid rgba(255,255,255,.12);
            padding:22px 20px; min-height:130px;
        }
        .dash-hero-logo-panel img { width:160px; max-height:160px; }
        .dash-hero-body { padding:20px 22px; gap:10px; }
        .dash-hero-name { font-size:24px; }
        .dash-hero-greeting { font-size:12px; letter-spacing:1.2px; }
        .dash-hero-avatar { width:72px; height:72px; }
        .dash-hero-avatar-ph { width:72px; height:72px; }
        .dash-cards { gap:10px; }
        .dash-card { padding:16px 18px; }
        .dash-card-label { font-size:15px; }
        .dash-card-sub   { font-size:12px; }
    }

    /* Mobile (≤480px) */
    @media(max-width:480px){
        .dash-hero { border-radius:14px; }
        .dash-hero-logo-panel { padding:16px; min-height:100px; }
        .dash-hero-logo-panel img { width:110px; max-height:110px; }
        .dash-hero-body { padding:16px 18px; gap:8px; }
        .dash-hero-name { font-size:20px; }
        .dash-hero-greeting { font-size:11px; letter-spacing:.9px; }
        .dash-hero-avatar { width:54px; height:54px; border-radius:10px; }
        .dash-hero-avatar-ph { width:54px; height:54px; border-radius:10px; }
        .dash-hero-user-row { gap:10px; }
        .dash-hero-pills { gap:6px; }
        .dash-hero-pill { font-size:10px !important; padding:3px 9px; }
        .dash-cards { grid-template-columns:1fr; gap:10px; }
        .dash-card { padding:14px 16px; gap:12px; }
        .dash-card-icon { width:42px; height:42px; font-size:18px; border-radius:10px; }
        .dash-card-label { font-size:14px; }
        .dash-card-sub   { font-size:11px; }
        .dash-datetime { padding:12px 16px; gap:12px; }
        .dash-dt-date { font-size:13px; }
        .dash-dt-time { font-size:11px; }
        .dash-dt-icon { font-size:22px; }
    }

    /* Very small (≤360px) */
    @media(max-width:360px){
        .dash-hero-logo-panel img { width:80px; max-height:80px; }
        .dash-hero-name { font-size:17px; }
        .dash-hero-avatar { width:44px; height:44px; }
        .dash-hero-avatar-ph { width:44px; height:44px; }
        .dash-card-label { font-size:13px; }
    }
`
document.head.appendChild(_s)

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return { text: "Good Morning", icon: "☀️" }
  if (h < 17) return { text: "Good Afternoon", icon: "🌤️" }
  if (h < 20) return { text: "Good Evening", icon: "🌅" }
  return { text: "Good Night", icon: "🌙" }
}

const Dashboard = () => {
  const navigate = useNavigate()
  const { role, userName, empCode, firstTimeLogin, profileImage } = useUserStore(s => s.user)
  const [modalOpen, setModalOpen] = useState(false)
  const imageSrc = assetImageBaseUrl + 'logo.png'

  useEffect(() => { if (firstTimeLogin === 'YES') setModalOpen(true) }, [firstTimeLogin])
  const handleUpdateProfile = () => { setModalOpen(false); navigate('/user-profile') }

  const greeting = getGreeting()
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = today.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <PageContent>
      <Container fluid>
        <Breadcrumbs title="MoneyTree" breadcrumbItem="Dashboard" />
        <TickerFile />
        <ProfileCompletionModal isOpen={modalOpen} onNavigateToProfile={handleUpdateProfile} />

        {role !== USER_TYPE.ADMIN ? (
          <>
            {/* ── Hero ── */}
            <div className="dash-hero">
              <div className="dash-hero-logo-panel">
                <img src={imageSrc} alt="MoneyTree" />
              </div>
              <div className="dash-hero-body">
                <div className="dash-hero-greeting">
                  <span>{greeting.icon}</span> {greeting.text}
                </div>
                <div className="dash-hero-user-row">
                  {profileImage ? (
                    <img src={imageBaseUrl + profileImage} alt="Profile" className="dash-hero-avatar" />
                  ) : (
                    <div className="dash-hero-avatar-ph">
                      <span style={{ fontSize: 22, opacity: .6 }}>👤</span>
                    </div>
                  )}
                  <div className="dash-hero-name">{userName}</div>
                </div>
                <div className="dash-hero-pills">
                  <span className="dash-hero-pill dash-hero-pill-emp">Emp Code: {empCode}</span>
                  {/* {level && <span className="dash-hero-pill dash-hero-pill-level">🏅 {level}</span>} */}
                </div>
              </div>
            </div>

            {/* ── Quick links ── */}
            <div className="dash-cards">
              <div className="dash-card dash-card-teal" onClick={() => navigate('/user-profile')}>
                <div className="dash-card-icon">👤</div>
                <div className="dash-card-text">
                  <div className="dash-card-label">My Profile</div>
                  <div className="dash-card-sub">View & edit your info</div>
                </div>
                <span className="dash-card-arrow">→</span>
              </div>
              <div className="dash-card dash-card-gold" onClick={() => navigate('/my-attendance')}>
                <div className="dash-card-icon">📅</div>
                <div className="dash-card-text">
                  <div className="dash-card-label">Attendance</div>
                  <div className="dash-card-sub">View your attendance</div>
                </div>
                <span className="dash-card-arrow">→</span>
              </div>
            </div>

            {/* ── Date & time ── */}
            <div className="dash-datetime">
              <div className="dash-dt-icon">🕐</div>
              <div>
                <div className="dash-dt-date">{dateStr}</div>
                <div className="dash-dt-time">{timeStr}</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <UsePanel />
            <Row><CartesianGridChart /></Row>
          </>
        )}
      </Container>
    </PageContent>
  )
}

export default withUserDashboard(Dashboard)