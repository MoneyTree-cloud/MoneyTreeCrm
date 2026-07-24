import React from "react";
import useLayoutStore from "../../store/useLayoutStore";
import { defaultTheme } from "../../helpers/defaultTheme";
import NotificationDropdown from "../../Pages/Notifications/NotificationDropdown";
import ProfileMenu from "../../components/Common/ProfileMenu";
import { useGet } from "../../Hooks/useApi";
import { OTP_BALANCE, COUNT_FNF_HR } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import { assetImageBaseUrl } from "../../helpers/api_helper";
import { USER_TYPE } from "../../constants/global";
import "../../../src/Pages/CSS/styles.css";
import { useNavigate } from "react-router-dom";
import EmpCodeMarquee from "../../constants/EmpCodeMarquee";

const Header = () => {
  const changeSidebar = useLayoutStore((state) => state.changeSidebar);
  const { userId, role, empCode, mainTl, subTl } = useUserStore((state) => state.user);
  const imageSrc = assetImageBaseUrl + 'logo.png';
  // const { data: rewardData } = useGet(PROJECT_REWARD_POINTS_POPUP + userId, { enabled: Boolean(role === USER_TYPE.ASSOCIATE && (locationName === "Noida" || locationName === "Ghaziabad" || locationName === "Gurugram")) });
  const { data: countData } = useGet(`${COUNT_FNF_HR}?empCode=${empCode}&userId=${userId}`);
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
    changeSidebar();
    if (window.screen.width <= 998) {
      body.classList.toggle("sidebar-enable");
    } else {
      body.classList.toggle("vertical-collpsed");
      body.classList.toggle("sidebar-enable");
    }
  }

  const allowedEmpCodes = ['1586', '1005', '1237', '1246', '1247', '1469'];

  return (
    <React.Fragment>
      <header id="page-topbar">
        <div className="navbar-header">
          <div className="d-flex">
            <div className="navbar-brand-box text-center bg-primary">
              <a
                href="https://moneytreerealty.com"
                className="logo logo-dark"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="logo-sm">
                  <img
                    src={imageSrc}
                    alt="logo-sm-dark"
                    height="50"
                    width="60"
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
            {/* <AnimationBackground /> */}
            <button
              type="button"
              className="btn btn-sm px-3 font-size-24 header-item waves-effect"
              id="vertical-menu-btn"
              onClick={() => tToggle()}
            >
              <i className="ri-menu-2-line align-middle color-primary"></i>
            </button>
          </div>

          {(mainTl === "YES" || subTl === "YES" || allowedEmpCodes.includes(empCode)) &&
            countData?.data?.status === 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  fontSize: "12px",
                  fontWeight: 500,
                  marginLeft: "10px",
                }}
              >
                {/* Pending Interview */}
                <div
                  onClick={() => navigate("/assigned-candidate-data")}
                  style={{
                    cursor: "pointer",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    background: "#f8d7da",
                    color: "#721c24",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontWeight: 600,
                  }}
                >
                  📅 Interview
                  <span
                    style={{
                      background: "#dc3545",
                      color: "#fff",
                      padding: "2px 6px",
                      borderRadius: "12px",
                      fontSize: "11px",
                    }}
                  >
                    {countData?.data?.data?.pendingInterview}
                  </span>
                </div>


                {/* Hold Interview */}
                <div
                  onClick={() => navigate("/assigned-candidate-data")}
                  style={{
                    cursor: "pointer",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    background: "#d1ecf1",
                    color: "#0c5460",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontWeight: 600,
                  }}
                >
                  ⏸ Hold
                  <span
                    style={{
                      background: "#17a2b8",
                      color: "#fff",
                      padding: "2px 6px",
                      borderRadius: "12px",
                      fontSize: "11px",
                    }}
                  >
                    {countData?.data?.data?.holdInterview}
                  </span>
                </div>


                {/* Pending FNF */}
                <div
                  onClick={() => navigate("/hods-fnf-list")}
                  style={{
                    cursor: "pointer",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    background: "#fff3cd",
                    color: "#856404",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontWeight: 600,
                  }}
                >
                  💰 FNF
                  <span
                    style={{
                      background: "#ffc107",
                      color: "#000",
                      padding: "2px 6px",
                      borderRadius: "12px",
                      fontSize: "11px",
                    }}
                  >
                    {countData?.data?.data?.pendingFnf}
                  </span>
                </div>
              </div>
            )}

          {/* {(role === USER_TYPE.ASSOCIATE && (locationName === "Noida" || locationName === "Gurugram" || locationName === "Ghaziabad")) &&
            <CarClubProgress data={rewardData?.data?.data || []} />
          } */}

          <div className="d-flex">
            <div className="dropdown d-inline-block d-lg-none ms-2">
              <div
                className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0"
                aria-labelledby="page-header-search-dropdown"
              >
                <form className="p-3">
                  <div className="form-group m-0">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search ..."
                        aria-label="Recipient's username"
                      />
                      <div className="input-group-append">
                        <button className="btn btn-primary" type="submit">
                          <i className="ri-search-line" />
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* //Otp Balance */}

            {role === "ADMIN" && otpData?.data?.status === 1 && (
              <h5
                style={{
                  alignItems: "center",
                  alignContent: "center",
                  fontSize: 12,
                  alignSelf: "center",
                  textAlign: "center",
                  color: defaultTheme.primary,
                }}
              >
                OTP Balance :{" "}
                <span style={{ color: defaultTheme.goldColorLogo }}>
                  {otpData?.data?.data?.split("|")[1]?.split(":")[1]}
                </span>
              </h5>
            )}


            <div className="dropdown d-none d-lg-inline-block ms-1">
              <button
                type="button"
                title="Maximize"
                onClick={toggleFullscreen}
                className="btn header-item noti-icon"
                data-toggle="fullscreen"
              >
                <i className="ri-fullscreen-line color-primary"></i>
              </button>
            </div>
            <NotificationDropdown />
            <ProfileMenu />
            <EmpCodeMarquee/>
          </div>
        </div>
      </header>
    </React.Fragment>
  );
};

export default Header;