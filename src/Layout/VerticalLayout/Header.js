import React, { useEffect, useRef, useState } from "react";
import { Modal } from "reactstrap";
import useLayoutStore from "../../store/useLayoutStore";
import NotificationDropdown from "../../Pages/Notifications/NotificationDropdown";
import ProfileMenu from "../../components/Common/ProfileMenu";
import { useGet } from "../../Hooks/useApi";
import { OTP_BALANCE, COUNT_FNF_HR } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import { assetImageBaseUrl } from "../../helpers/api_helper";
import { THEMES, normalizeHex, buildPalette } from "../../helpers/defaultTheme";
import { Notes, Note } from "../../helpers/function_helper";
import { USER_TYPE } from "../../constants/global";
import "../../../src/Pages/CSS/styles.css";
import { useNavigate } from "react-router-dom";
import EmpCodeMarquee from "../../constants/EmpCodeMarquee";

// briefly animates every colour on the page while the theme changes
const smoothSwitch = () => {
  const root = document.documentElement;
  root.classList.add("mt-theme-switching");
  clearTimeout(smoothSwitch.timer);
  smoothSwitch.timer = setTimeout(() => root.classList.remove("mt-theme-switching"), 450);
};

// Header button + dialog to pick the app colour theme
const ThemeSwitcher = () => {
  const theme = useLayoutStore((state) => state.theme);
  const setTheme = useLayoutStore((state) => state.setTheme);
  const previewTheme = useLayoutStore((state) => state.previewTheme);
  const resetTheme = useLayoutStore((state) => state.resetTheme);

  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(theme);
  const colorInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) setDraft(theme);
  }, [isOpen, theme]);

  const pick = (next) => {
    smoothSwitch();
    setDraft(next);
    previewTheme(next);
  };

  const close = () => {
    // nothing applied — go back to the saved theme
    smoothSwitch();
    previewTheme(theme);
    setIsOpen(false);
  };

  const apply = () => {
    setTheme(draft);
    setIsOpen(false);
  };

  const reset = () => {
    smoothSwitch();
    resetTheme();
    setIsOpen(false);
  };

  const onCustomColor = (e) => {
    const hex = normalizeHex(e.target.value);
    if (hex) pick({ id: "custom", primary: hex });
  };

  // a theme saved earlier that is no longer in the list counts as a custom colour
  const preset = THEMES.find((t) => t.id === draft.id);
  const isCustom = !preset;
  const activeName = preset ? preset.name : "Custom";
  const palette = buildPalette(draft.primary);

  return (
    <React.Fragment>
      <button
        type="button"
        title="Change Theme"
        aria-label="Change theme"
        onClick={() => setIsOpen(true)}
        className="btn header-item mt-header__icon-btn mt-theme-trigger"
      >
        <i className="ri-palette-line"></i>
        <span className="mt-theme-trigger__dot" />
      </button>

      <Modal
        isOpen={isOpen}
        toggle={close}
        centered
        className="mt-theme-dialog"
        contentClassName="mt-theme-modal"
      >
        {/* ---- hero with live preview ---- */}
        <div className="mt-theme-hero">
          <button type="button" className="mt-theme-hero__close" onClick={close} aria-label="Close">
            <i className="ri-close-line" />
          </button>

          <div className="mt-theme-hero__text">
            <span className="mt-theme-hero__eyebrow">
              <i className="ri-palette-line" /> Personalise
            </span>
            <h5 className="mt-theme-hero__title">Choose your theme</h5>
            <p className="mt-theme-hero__sub">The whole app updates instantly.</p>
          </div>

          <div className="mt-theme-mock" aria-hidden="true">
            <div className="mt-theme-mock__card">
              <span className="mt-theme-mock__icon">
                <i className="ri-calendar-event-fill" />
              </span>
              <div className="mt-theme-mock__lines">
                <small>Today's Meetings</small>
                <strong>12 Scheduled</strong>
              </div>
            </div>
            <div className="mt-theme-mock__stats">
              <div className="mt-theme-mock__stat">
                <small>Prospects</small>
                <strong>248</strong>
              </div>
              <div className="mt-theme-mock__stat">
                <small>Hot Leads</small>
                <strong>36</strong>
              </div>
            </div>
            <div className="mt-theme-mock__bubble is-in">Site visit with prospect at 4 PM?</div>
            <div className="mt-theme-mock__bubble is-out">
              Meeting confirmed <i className="ri-check-double-line" />
            </div>
          </div>
        </div>

        {/* ---- swatches ---- */}
        <div className="mt-theme-body">
          {/* the picker needs CSS variables, grid and newer layout features */}
          <Notes style={{ margin: "0 0 14px" }}>
            <Note tone="gold">
              Best viewed on Chrome / Edge 90+, Safari / iOS 15+ or Firefox 90+. On older browsers
              some theme options may not work.
            </Note>
          </Notes>
          <div className="mt-theme-body__head">
            <span className="mt-theme-grid-label">Colours</span>
            <span className="mt-theme-current">
              <span className="mt-theme-current__dot" />
              {activeName}
            </span>
          </div>

          <div className="mt-theme-grid" role="radiogroup" aria-label="Theme colours">
            {THEMES.map((t, i) => {
              const selected = draft.id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  title={t.name}
                  className={`mt-theme-swatch${selected ? " is-selected" : ""}`}
                  style={{ "--sw": t.primary, "--sw-light": buildPalette(t.primary).light, animationDelay: `${i * 30}ms` }}
                  onClick={() => pick({ id: t.id, primary: t.primary })}
                >
                  <span className="mt-theme-swatch__dot">
                    <i className="ri-check-line" />
                  </span>
                  <span className="mt-theme-swatch__name">{t.name}</span>
                </button>
              );
            })}

            {/* custom colour */}
            <button
              type="button"
              role="radio"
              aria-checked={isCustom}
              title="Pick any colour"
              className={`mt-theme-swatch is-custom${isCustom ? " is-selected" : ""}`}
              style={{ "--sw": isCustom ? palette.primary : "#ffffff", animationDelay: `${THEMES.length * 30}ms` }}
              onClick={() => colorInputRef.current?.click()}
            >
              <span className="mt-theme-swatch__dot">
                <i className={isCustom ? "ri-check-line" : "ri-add-line"} />
              </span>
              <span className="mt-theme-swatch__name">Custom</span>
              <input
                ref={colorInputRef}
                type="color"
                className="mt-theme-swatch__input"
                value={palette.primary}
                onChange={onCustomColor}
                tabIndex={-1}
              />
            </button>
          </div>
        </div>

        {/* ---- footer ---- */}
        <div className="mt-theme-footer">
          <button type="button" className="mt-theme-footer__reset" onClick={reset}>
            <i className="ri-refresh-line" /> Reset
          </button>
          <div className="mt-theme-footer__right">
            <button type="button" className="mt-theme-footer__btn is-ghost" onClick={close}>
              Cancel
            </button>
            <button type="button" className="mt-theme-footer__btn" onClick={apply}>
              <i className="ri-check-line" /> Apply
            </button>
          </div>
        </div>
      </Modal>
    </React.Fragment>
  );
};

const Header = () => {
  const changeSidebar = useLayoutStore((state) => state.changeSidebar);
  const isSidebarCollapsed = useLayoutStore((state) => state.isSidebarCollapsed);
  const { userId, role, empCode, mainTl, subTl } = useUserStore((state) => state.user);
  const imageSrc = assetImageBaseUrl + 'logo.png';
  // const { data: rewardData } = useGet(PROJECT_REWARD_POINTS_POPUP + userId, { enabled: Boolean(role === USER_TYPE.ASSOCIATE && (locationName === "Noida" || locationName === "Ghaziabad" || locationName === "Gurugram")) });
  const { data: countData } = useGet(`${COUNT_FNF_HR}?empCode=${empCode}&userId=${userId}`, { enabled: Boolean(empCode && userId) });
  const { data: otpData } = useGet(OTP_BALANCE + userId, { enabled: Boolean(role === USER_TYPE.ADMIN) });

  const navigate = useNavigate()

  function toggleFullscreen() {
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement
    ) {
      // current working methods
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(
          Element.ALLOW_KEYBOARD_INPUT
        );
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
  }

  function tToggle() {
    var body = document.body;
    if (window.innerWidth <= 992) {
      if (isSidebarCollapsed) changeSidebar();
      body.classList.toggle("sidebar-enable");
    } else {
      changeSidebar();
      body.classList.toggle("vertical-collpsed");
      body.classList.toggle("sidebar-enable");
    }
  }

  const allowedEmpCodes = ['1586', '1005', '1237', '1246', '1247', '1469'];

  const showInterviewPills = (mainTl === "YES" || subTl === "YES" || allowedEmpCodes.includes(empCode)) && countData?.data?.status === 1;

  return (
    <React.Fragment>
      <header id="page-topbar" className="mt-header">
        <div className="navbar-header">
          <div className="mt-header__start">
            <div className="navbar-brand-box text-center bg-primary">
              <a
                href="https://moneytreerealty.com"
                className="logo logo-dark"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="logo-sm">
                  {/* collapsed sidebar / small screen: tree icon only */}
                  <img
                    src={assetImageBaseUrl + 'tree.png'}
                    alt="logo-sm-dark"
                    style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
                  />
                </span>
                <span className="logo-lg" height="75" width="170" >
                  <img
                    src={imageSrc}
                    alt="logo-dark"
                    style={{ maxHeight: '75px', width: 'auto', objectFit: 'cover' }} // Ensure no stretching
                  />
                </span>
              </a>
            </div>
            <button
              type="button"
              className="btn header-item mt-header__icon-btn mt-header__toggle"
              id="vertical-menu-btn"
              title="Toggle menu"
              aria-label="Toggle menu"
              onClick={() => tToggle()}
            >
              <i className="ri-menu-2-line"></i>
            </button>
          </div>

          {showInterviewPills && (
            <div className="header-status-badges">
              {/* Pending Interview */}
              <div
                className="header-status-pill header-status-pill--danger"
                onClick={() => navigate("/assigned-candidate-data")}
              >
                📅 <span className="header-status-pill-label">Interview</span>
                <span className="header-status-pill-count">
                  {countData?.data?.data?.pendingInterview}
                </span>
              </div>

              {/* Hold Interview */}
              <div
                className="header-status-pill header-status-pill--info"
                onClick={() => navigate("/assigned-candidate-data")}
              >
                ⏸ <span className="header-status-pill-label">Hold</span>
                <span className="header-status-pill-count">
                  {countData?.data?.data?.holdInterview}
                </span>
              </div>

              {/* Pending FNF */}
              <div
                className="header-status-pill header-status-pill--warning"
                onClick={() => navigate("/hods-fnf-list")}
              >
                💰 <span className="header-status-pill-label">FNF</span>
                <span className="header-status-pill-count">
                  {countData?.data?.data?.pendingFnf}
                </span>
              </div>
            </div>
          )}

          <div className="mt-header__actions">
            {/* //Otp Balance */}
            {role === "ADMIN" && otpData?.data?.status === 1 && (
              <div className="mt-header__chip" title="OTP Balance">
                OTP<span className="mt-header__chip-extra">Balance</span>
                <strong>{otpData?.data?.data?.split("|")[1]?.split(":")[1]}</strong>
              </div>
            )}

            <div className="dropdown d-none d-lg-inline-block">
              <button
                type="button"
                title="Maximize"
                aria-label="Maximize"
                onClick={toggleFullscreen}
                className="btn header-item mt-header__icon-btn"
                data-toggle="fullscreen"
              >
                <i className="ri-fullscreen-line"></i>
              </button>
            </div>
            <NotificationDropdown />
            <ThemeSwitcher />
            <ProfileMenu />
            <EmpCodeMarquee />
          </div>
        </div>
      </header>
    </React.Fragment>
  );
};

export default Header;
