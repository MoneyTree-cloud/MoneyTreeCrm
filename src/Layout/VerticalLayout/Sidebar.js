import { useState, useMemo } from "react";
import withRouter from "../../components/Common/withRouter";
import { Link, useLocation } from "react-router-dom";
import { Sidebar as SBar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import useLayoutStore from "../../store/useLayoutStore";
import { MdDashboard } from "react-icons/md";
import withSidebarOptions from "./withSidebarOptions";
import { defaultTheme } from "../../helpers/defaultTheme";
import {
  FaCheckCircle,
  FaClipboardCheck,
  FaDesktop,
  FaHeadset,
  FaTools,
  FaUsers,
  FaSearch,
  FaLaptopCode,
} from "react-icons/fa";
import { InputGroup, InputGroupText } from "reactstrap";
import { useUserStore } from "../../store/useUserStore";
import { USER_TYPE } from "../../constants/global";
import "../../Pages/CSS/styles.css";
import { RiFilePaper2Line, RiHealthBookLine } from "react-icons/ri";
import { useGet } from "../../Hooks/useApi";
import { VERIFY_GROUP_MEMBER } from "../../helpers/url_helper";

const Sidebar = (props) => {
  const isSidebarCollapsed = useLayoutStore((state) => state.isSidebarCollapsed);
  const pathname = props.router.location.pathname;
  const role = useUserStore((state) => state.user.role);
  const empCode = useUserStore((state) => state.user.empCode);
  const changeSidebar = useLayoutStore((state) => state.changeSidebar);
  const location = useLocation();
  const pathname_ = location.pathname;
  const search = location.search;

  const { data: verifyData } = useGet(VERIFY_GROUP_MEMBER + empCode)
  const thinkItEnabled = verifyData?.data?.data?.thinkIt;


  const [searchTerm, setSearchTerm] = useState("");
  const [openMenu, setOpenMenu] = useState(() => {
    let result = "";
    for (let item of props.list) {
      if (item?.url && item?.url === pathname) {
        result = item.label;
        break;
      }
      if (!item?.url && item.subItem?.length > 0) {
        for (let subItem of item.subItem) {
          if (pathname.includes(subItem.link)) {
            result = item.label;
            break;
          }
        }
      }
    }
    return result;
  });

  // ✅ Search filtering for both main & submenus
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return props.list;
    const lower = searchTerm.toLowerCase();

    return props.list
      .map((item) => {
        const parentMatch = item.label.toLowerCase().includes(lower);
        const subItems =
          item.subItem?.filter((sub) =>
            sub.sublabel.toLowerCase().includes(lower)
          ) || [];

        if (parentMatch) {
          return { ...item };
        } else if (subItems.length > 0) {
          return { ...item, subItem: subItems };
        }
        return null;
      })
      .filter(Boolean);
  }, [searchTerm, props.list]);

  // Style definitions
  const activeMenuStyle = {
    color: defaultTheme.primary,
    backgroundColor: defaultTheme.goldColorLogo,
  };

  const activeSubMenuStyle = {
    color: defaultTheme.goldColorLogo,
    backgroundColor: defaultTheme.primary,
  };

  const isMainMenuActive = (item) => {
    return item.subItem
      ? item.subItem.some((subItem) => pathname.includes(subItem.link))
      : false;
  };

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

  function toogleOpen() {
    if (window.innerWidth < 1024) {
      tToggle();
    }
  }

  return (
    <div className="vertical-menu">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          overflow: "auto",
          marginTop: "5px",
        }}
      >
        {/* 🔍 Search Bar (Second Last Section) */}
        <div className="p-2 border-top border-bottom bg-light">
          <InputGroup size="sm" style={{ borderRadius: "8px" }}>
            <InputGroupText
              style={{
                backgroundColor: defaultTheme.primary,
                color: "white",
                border: "none",
                borderRadius: "8px 0 0 8px",
              }}
            >
              <FaSearch size={13} />
            </InputGroupText>
            <input
              type="text"
              className="form-control"
              placeholder="Search menu or submenu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: "#f9fafb",
                fontSize: "13px",
                borderRadius: "0 8px 8px 0",
              }}
            />
          </InputGroup>
        </div>
        <SBar collapsed={isSidebarCollapsed} style={{ overflowX: "hidden" }}>
          <Menu closeOnClick>
            {/* 🏠 Dashboard */}
            <MenuItem
              icon={<MdDashboard color={defaultTheme.btnEnable} size={16} />}
              component={
                <Link
                  to="/dashboard"
                  style={{
                    height: "40px",
                    fontWeight: "bold",
                    marginLeft: -15,
                    fontSize: "14px",
                    ...(pathname === "/dashboard" ? activeMenuStyle : {}),
                  }}
                  className={
                    pathname === "/dashboard" ? "sidebarItemActive" : ""
                  }
                  onClick={toogleOpen}
                />
              }
            >
              Dashboard
            </MenuItem>

            {thinkItEnabled && (
              <MenuItem
                icon={<FaLaptopCode color={defaultTheme.btnEnable} size={16} />}
                component={
                  <Link
                    to="/think-it-data"
                    style={{
                      height: "40px",
                      fontWeight: "bold",
                      marginLeft: -15,
                      fontSize: "14px",
                      ...(pathname === "/think-it-data" ? activeMenuStyle : {}),
                    }}
                    className={
                      pathname === "/think-it-data" ? "sidebarItemActive" : ""
                    }
                    onClick={toogleOpen}
                  />
                }
              >
                Think IT
              </MenuItem>
            )}

            {/* 🧭 Dynamic Menu Items (Filtered) */}
            {filteredList?.map((item) => {
              const menuItemActive =
                pathname.includes(item.url) || isMainMenuActive(item);

              return item?.url ? (
                <MenuItem
                  icon={item.icon}
                  key={item.label}
                  component={
                    <Link
                      to={item.url}
                      style={{
                        height: "40px",
                        fontWeight: "bold",
                        marginLeft: -15,
                        fontSize: "14px",
                        ...(menuItemActive ? activeMenuStyle : {}),
                      }}
                      onClick={toogleOpen}
                      className={menuItemActive ? "sidebarItemActive" : ""}
                    />
                  }
                >
                  {item.label}
                </MenuItem>
              ) : (
                <SubMenu
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  open={openMenu === item.label}
                  onClick={() =>
                    setOpenMenu((prev) =>
                      prev === item.label ? "" : item.label
                    )
                  }
                  style={{
                    height: "40px",
                    fontWeight: "bold",
                    marginLeft: -15,
                    fontSize: "14px",
                    ...(menuItemActive ? activeMenuStyle : {}),
                  }}
                >
                  {item.subItem?.map((sItem) => {
                    const isSubMenuItemActive = pathname.includes(sItem.link);
                    return (
                      <MenuItem
                        style={{
                          height: "35px",
                          marginLeft: -30,
                          fontSize: "13px",
                          textDecoration: "underline",
                          ...(isSubMenuItemActive ? activeSubMenuStyle : {}),
                        }}
                        active={isSubMenuItemActive}
                        key={sItem.sublabel}
                        icon={sItem.icon}
                        component={
                          <Link
                            to={sItem.link}
                            className={
                              isSubMenuItemActive ? "sidebarItemActive" : ""
                            }
                            onClick={toogleOpen}
                          />
                        }
                      >
                        {sItem.sublabel}
                      </MenuItem>
                    );
                  })}
                </SubMenu>
              );
            })}

            {/* 👥 My Attendance (Static) */}
            {(role === USER_TYPE.ADMIN || role === USER_TYPE.OTHER) && (
              <SubMenu
                label="My Attendance"
                icon={
                  <FaClipboardCheck color={defaultTheme.btnEnable} size={16} />
                }
                open={openMenu === "My Attendance"}
                onClick={() =>
                  setOpenMenu((prev) =>
                    prev === "My Attendance" ? "" : "My Attendance"
                  )
                }
                style={{
                  height: "40px",
                  fontWeight: "bold",
                  marginLeft: -15,
                  fontSize: "14px",
                  ...(pathname.includes("/my-attendance") ||
                    pathname.includes("/apply-od") ||
                    pathname.includes("/apply-attendance-regularization")
                    ? activeMenuStyle
                    : {}),
                }}
              >
                <MenuItem
                  icon={<FaCheckCircle color={defaultTheme.btnEnable} size={16} />}
                  component={
                    <Link
                      to="/my-attendance"
                      style={{
                        height: "35px",
                        fontWeight: "bold",
                        marginLeft: -30,
                        fontSize: "13px",
                        ...(pathname === "/my-attendance"
                          ? activeSubMenuStyle
                          : {}),
                      }}
                      className={
                        pathname === "/my-attendance" ? "sidebarItemActive" : ""
                      }
                      onClick={toogleOpen}
                    />
                  }
                >
                  My Attendance
                </MenuItem>

                <MenuItem
                  icon={<FaClipboardCheck color={defaultTheme.btnEnable} size={16} />}
                  component={
                    <Link
                      to="/apply-od"
                      style={{
                        height: "35px",
                        fontWeight: "bold",
                        marginLeft: -30,
                        fontSize: "13px",
                        ...(pathname === "/apply-od" ? activeSubMenuStyle : {}),
                      }}
                      className={
                        pathname === "/apply-od" ? "sidebarItemActive" : ""
                      }
                      onClick={toogleOpen}
                    />
                  }
                >
                  Apply OD
                </MenuItem>

                <MenuItem
                  icon={<FaClipboardCheck color={defaultTheme.btnEnable} size={16} />}
                  component={
                    <Link
                      to="/apply-attendance-regularization"
                      style={{
                        height: "35px",
                        fontWeight: "bold",
                        marginLeft: -30,
                        fontSize: "13px",
                        ...(pathname === "/apply-attendance-regularization"
                          ? activeSubMenuStyle
                          : {}),
                      }}
                      className={
                        pathname === "/apply-attendance-regularization"
                          ? "sidebarItemActive"
                          : ""
                      }
                      onClick={toogleOpen}
                    />
                  }
                >
                  Regularize Attendance
                </MenuItem>
              </SubMenu>
            )}

            {/* 📄 Policies */}
            <MenuItem
              icon={<RiFilePaper2Line color={defaultTheme.btnEnable} size={16} />}
              component={
                <Link
                  to="/view-policies"
                  style={{
                    height: "40px",
                    fontWeight: "bold",
                    marginLeft: -15,
                    fontSize: "14px",
                    ...(pathname === "/view-policies" ? activeMenuStyle : {}),
                  }}
                  className={
                    pathname === "/view-policies" ? "sidebarItemActive" : ""
                  }
                  onClick={toogleOpen}
                />
              }
            >
              Policies
            </MenuItem>

             {/* 📄 Policies */}
            <MenuItem
              icon={<RiHealthBookLine color={defaultTheme.btnEnable} size={16} />}
              component={
                <Link
                  to="/insurance-card"
                  style={{
                    height: "40px",
                    fontWeight: "bold",
                    marginLeft: -15,
                    fontSize: "14px",
                    ...(pathname === "/insurance-card" ? activeMenuStyle : {}),
                  }}
                  className={
                    pathname === "/insurance-card" ? "sidebarItemActive" : ""
                  }
                  onClick={toogleOpen}
                />
              }
            >
              Insurance Card
            </MenuItem>

            {/* 🎧 Support (Last Menu) */}
            <SubMenu
              label="Support (24x7)"
              icon={<FaHeadset color={defaultTheme.btnEnable} size={16} />}
              open={openMenu === "Support"}
              onClick={() =>
                setOpenMenu((prev) => (prev === "Support" ? "" : "Support"))
              }
              style={{
                height: "40px",
                fontWeight: "bold",
                marginLeft: -15,
                fontSize: "14px",
                ...(pathname_ === "/live-support" ? activeMenuStyle : {}),
              }}
            >
              <MenuItem
                icon={<FaTools color={defaultTheme.btnEnable} size={16} />}
                component={
                  <Link
                    to="/live-support?supportType=sap"
                    style={{
                      height: "35px",
                      fontWeight: "bold",
                      marginLeft: -30,
                      fontSize: "13px",
                      ...(search.includes("supportType=sap")
                        ? activeSubMenuStyle
                        : {}),
                    }}
                    className={
                      search.includes("supportType=sap")
                        ? "sidebarItemActive"
                        : ""
                    }
                    onClick={toogleOpen}
                  />
                }
              >
                SAP Support
              </MenuItem>

              <MenuItem
                icon={<FaUsers color={defaultTheme.btnEnable} size={16} />}
                component={
                  <Link
                    to="/live-support?supportType=hr"
                    style={{
                      height: "35px",
                      fontWeight: "bold",
                      marginLeft: -30,
                      fontSize: "13px",
                      ...(search.includes("supportType=hr")
                        ? activeSubMenuStyle
                        : {}),
                    }}
                    className={
                      search.includes("supportType=hr")
                        ? "sidebarItemActive"
                        : ""
                    }
                    onClick={toogleOpen}
                  />
                }
              >
                HR Support
              </MenuItem>

              <MenuItem
                icon={<FaDesktop color={defaultTheme.btnEnable} size={16} />}
                component={
                  <Link
                    to="/live-support?supportType=ops"
                    style={{
                      height: "35px",
                      fontWeight: "bold",
                      marginLeft: -30,
                      fontSize: "13px",
                      marginBottom: "10px",
                      ...(search.includes("supportType=ops")
                        ? activeSubMenuStyle
                        : {}),
                    }}
                    className={
                      search.includes("supportType=ops")
                        ? "sidebarItemActive"
                        : ""
                    }
                    onClick={toogleOpen}
                  />
                }
              >
                OPS Support
              </MenuItem>
            </SubMenu>
          </Menu>
        </SBar>
      </div>
    </div>
  );
};

export default withRouter(withSidebarOptions(Sidebar));
