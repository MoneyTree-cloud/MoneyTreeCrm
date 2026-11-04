import {
  PiCalendarCheckDuotone,
  PiHeadsetDuotone,
  PiHeartbeatDuotone,
  PiLightbulbFilamentDuotone,
  PiScrollDuotone,
  PiSquaresFourDuotone,
} from "react-icons/pi";
import { useState, useMemo, useEffect, useRef } from "react";
import withRouter from "../../components/Common/withRouter";
import { Link, useLocation } from "react-router-dom";
import { Sidebar as SBar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import useLayoutStore from "../../store/useLayoutStore";
import { MdClose } from "react-icons/md";
import withSidebarOptions from "./withSidebarOptions";
import {
  FaCheckCircle,
  FaClipboardCheck,
  FaDesktop,
  FaTools,
  FaUsers,
  FaSearch,
} from "react-icons/fa";
import { useUserStore } from "../../store/useUserStore";
import { USER_TYPE, ICON_COLOR, ICON_SIZE, TOP_ICON_COLOR, TOP_ICON_SIZE, MENU_TEXT_COLOR, SUB_MENU_TEXT_COLOR } from "../../constants/global";
import "../../Pages/CSS/styles.css";
import { useGet } from "../../Hooks/useApi";
import { VERIFY_GROUP_MEMBER } from "../../helpers/url_helper";

// Keep in sync with the drawer breakpoint in Pages/CSS/styles.css / _vertical.scss
const MOBILE_QUERY = "(max-width: 992px)";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    () => Boolean(window.matchMedia?.(MOBILE_QUERY).matches)
  );

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    // Safari/iOS < 14 and old Edge only support the deprecated addListener
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, []);

  return isMobile;
};

const Sidebar = (props) => {
  const isSidebarCollapsed = useLayoutStore((state) => state.isSidebarCollapsed);
  const changeSidebar = useLayoutStore((state) => state.changeSidebar);
  const role = useUserStore((state) => state.user.role);
  const empCode = useUserStore((state) => state.user.empCode);
  const { pathname, search } = useLocation();
  const isMobile = useIsMobile();
  // On small screens the sidebar is a full-width drawer, never an icon rail
  const collapsed = isSidebarCollapsed && !isMobile;

  const { data: verifyData } = useGet(VERIFY_GROUP_MEMBER + empCode, { enabled: Boolean(empCode), });
  const thinkItEnabled = verifyData?.data?.data?.thinkIt;

  const [searchTerm, setSearchTerm] = useState("");
  const [openMenu, setOpenMenu] = useState("");
  const searchInputRef = useRef(null);
  const focusSearchOnExpand = useRef(false);

  const isLinkActive = (link, exact) => {
    if (!link) return false;
    const [path, query] = link.split("?");
    if (query) return pathname === path && search.includes(query);
    return exact ? pathname === path : pathname.includes(path);
  };

  const isItemActive = (item) =>
    item.url
      ? isLinkActive(item.url, item.exact)
      : Boolean(item.subItem?.some((sub) => isLinkActive(sub.link, sub.exact)));

  // Static entries use the same shape as SidebarData so everything renders
  // (and is searched) through one code path.
  const groups = useMemo(() => {
    const showAttendance = role === USER_TYPE.ADMIN || role === USER_TYPE.OTHER;

    return [
      {
        title: "",
        items: [
          {
            label: "Dashboard",
            url: "/dashboard",
            exact: true,
            icon: <PiSquaresFourDuotone color={TOP_ICON_COLOR} size={TOP_ICON_SIZE} />,
          },
          thinkItEnabled && {
            label: "Think IT",
            url: "/think-it-data",
            exact: true,
            icon: <PiLightbulbFilamentDuotone color={TOP_ICON_COLOR} size={TOP_ICON_SIZE} />,
          },
        ].filter(Boolean),
      },
      { title: "Modules", items: props.list || [] },
      {
        title: "Self Service",
        items: [
          showAttendance && {
            label: "My Attendance",
            icon: <PiCalendarCheckDuotone color={TOP_ICON_COLOR} size={TOP_ICON_SIZE} />,
            subItem: [
              {
                sublabel: "My Attendance",
                link: "/my-attendance",
                exact: true,
                icon: <FaCheckCircle color={ICON_COLOR} size={ICON_SIZE} />,
              },
              {
                sublabel: "Apply OD",
                link: "/apply-od",
                exact: true,
                icon: <FaClipboardCheck color={ICON_COLOR} size={ICON_SIZE} />,
              },
              {
                sublabel: "Regularize Attendance",
                link: "/apply-attendance-regularization",
                exact: true,
                icon: <FaClipboardCheck color={ICON_COLOR} size={ICON_SIZE} />,
              },
            ],
          },
          {
            label: "Policies",
            url: "/view-policies",
            exact: true,
            icon: <PiScrollDuotone color={TOP_ICON_COLOR} size={TOP_ICON_SIZE} />,
          },
          {
            label: "Insurance Card",
            url: "/insurance-card",
            exact: true,
            icon: <PiHeartbeatDuotone color={TOP_ICON_COLOR} size={TOP_ICON_SIZE} />,
          },
          {
            label: "Support (24x7)",
            icon: <PiHeadsetDuotone color={TOP_ICON_COLOR} size={TOP_ICON_SIZE} />,
            subItem: [
              {
                sublabel: "SAP Support",
                link: "/live-support?supportType=sap",
                icon: <FaTools color={ICON_COLOR} size={ICON_SIZE} />,
              },
              {
                sublabel: "HR Support",
                link: "/live-support?supportType=hr",
                icon: <FaUsers color={ICON_COLOR} size={ICON_SIZE} />,
              },
              {
                sublabel: "OPS Support",
                link: "/live-support?supportType=ops",
                icon: <FaDesktop color={ICON_COLOR} size={ICON_SIZE} />,
              },
            ],
          },
        ].filter(Boolean),
      },
    ];
  }, [props.list, role, thinkItEnabled]);

  // ✅ Search filtering for both main & submenus
  const isSearching = Boolean(searchTerm.trim());
  const filteredGroups = useMemo(() => {
    const lower = searchTerm.trim().toLowerCase();
    if (!lower) return groups.filter((group) => group.items.length > 0);

    return groups
      .map((group) => ({
        ...group,
        items: group.items
          .map((item) => {
            if (item.label.toLowerCase().includes(lower)) return item;
            const subItems =
              item.subItem?.filter((sub) =>
                sub.sublabel.toLowerCase().includes(lower)
              ) || [];
            return subItems.length > 0 ? { ...item, subItem: subItems } : null;
          })
          .filter(Boolean),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchTerm, groups]);

  // Keep the group of the current page expanded as the route changes
  let activeGroupLabel = "";
  for (const group of groups) {
    const match = group.items.find((item) => item.subItem && isItemActive(item));
    if (match) {
      activeGroupLabel = match.label;
      break;
    }
  }
  useEffect(() => {
    if (activeGroupLabel) setOpenMenu(activeGroupLabel);
  }, [activeGroupLabel]);

  // Header toggles this class too; deriving it here keeps it right on resize
  useEffect(() => {
    document.body.classList.toggle("vertical-collpsed", collapsed);
  }, [collapsed]);

  // Crossing the breakpoint always starts with the drawer closed
  useEffect(() => {
    document.body.classList.remove("sidebar-enable");
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) return undefined;
    const onKeyDown = (e) => {
      // Old Edge reports "Esc"
      if (e.key === "Escape" || e.key === "Esc") {
        document.body.classList.remove("sidebar-enable");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMobile]);

  useEffect(() => {
    if (!collapsed && focusSearchOnExpand.current) {
      focusSearchOnExpand.current = false;
      searchInputRef.current?.focus();
    }
  }, [collapsed]);

  const closeDrawer = () => document.body.classList.remove("sidebar-enable");

  const handleLinkClick = () => {
    if (isMobile) closeDrawer();
  };

  const expandAndSearch = () => {
    focusSearchOnExpand.current = true;
    changeSidebar();
  };

  const renderLink = (item) => {
    const active = isItemActive(item);
    return (
      <MenuItem
        key={item.label}
        icon={item.icon}
        active={active}
        className={`mt-nav-top${active ? " is-active" : ""}`}
        component={
          <Link to={item.url} title={item.label} onClick={handleLinkClick} />
        }
      >
        {item.label}
      </MenuItem>
    );
  };

  const renderGroup = (item) => {
    const active = isItemActive(item);
    return (
      <SubMenu
        key={item.label}
        label={item.label}
        icon={item.icon}
        title={item.label}
        className={`mt-nav-top mt-nav-group${active ? " has-active-child" : ""}`}
        open={isSearching || openMenu === item.label}
        onClick={() =>
          setOpenMenu((prev) => (prev === item.label ? "" : item.label))
        }
      >
        {item.subItem?.map((sItem) => {
          const isSubMenuItemActive = isLinkActive(sItem.link, sItem.exact);
          return (
            <MenuItem
              key={sItem.sublabel}
              icon={sItem.icon}
              active={isSubMenuItemActive}
              className={`mt-nav-sub${isSubMenuItemActive ? " is-active" : ""}`}
              component={
                <Link
                  to={sItem.link}
                  title={sItem.sublabel}
                  onClick={handleLinkClick}
                />
              }
            >
              {sItem.sublabel}
            </MenuItem>
          );
        })}
      </SubMenu>
    );
  };

  return (
    <>
      <div className="sidebar-backdrop" onClick={closeDrawer} />
      <div
        className={`vertical-menu mt-sidebar${collapsed ? " mt-sidebar--collapsed" : ""}`}
        // menu / sub menu text colours come from constants/global.js
        style={{ "--mt-sb-text": MENU_TEXT_COLOR, "--mt-sb-sub-text": SUB_MENU_TEXT_COLOR }}
      >
        <div className="mt-sidebar__inner">
          {/* 🔍 Search */}
          <div className="mt-sidebar__search">
            {collapsed ? (
              <button
                type="button"
                className="mt-sidebar__search-btn"
                title="Search menu"
                aria-label="Search menu"
                onClick={expandAndSearch}
              >
                <FaSearch size={14} />
              </button>
            ) : (
              <label className="mt-sidebar__search-box">
                <FaSearch size={14} className="mt-sidebar__search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search menu..."
                  aria-label="Search menu"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="mt-sidebar__search-clear"
                    aria-label="Clear search"
                    onClick={() => setSearchTerm("")}
                  >
                    <MdClose size={14} />
                  </button>
                )}
              </label>
            )}
          </div>

          <div className="mt-sidebar__nav">
            <SBar
              collapsed={collapsed}
              width="100%"
              collapsedWidth="100%"
              backgroundColor="transparent"
              transitionDuration={250}
            >
              <Menu closeOnClick>
                {filteredGroups.map((group) => [
                  group.title && (
                    <li
                      key={`caption-${group.title}`}
                      className="mt-sidebar__caption"
                      role="presentation"
                    >
                      {group.title}
                    </li>
                  ),
                  ...group.items.map((item) =>
                    item.url ? renderLink(item) : renderGroup(item)
                  ),
                ])}

                {filteredGroups.length === 0 && (
                  <li className="mt-sidebar__empty" role="presentation">
                    {`No menu found for "${searchTerm.trim()}"`}
                  </li>
                )}
              </Menu>
            </SBar>
          </div>
        </div>
      </div>
    </>
  );
};

export default withRouter(withSidebarOptions(Sidebar));
