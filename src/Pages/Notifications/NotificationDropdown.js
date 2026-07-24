import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownToggle } from "reactstrap";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useUserStore } from "../../store/useUserStore";
import { useGet } from "../../Hooks/useApi";
import { GET_NOTIFICATIONS_BY_ID } from "../../helpers/url_helper";

const NotificationDropdown = () => {
  const navigation = useNavigate();
  const userId = useUserStore((state) => state.user.userId);

  const { data: notificationList } = useGet(
    GET_NOTIFICATIONS_BY_ID + userId
  );

  const count =
    notificationList?.data?.data?.notificationCount || 0;

  return (
    <React.Fragment>
      <Dropdown
        isOpen={false}
        title="Notifications"
        toggle={() => navigation("/view-notification")}
        className="dropdown d-inline-block"
        tag="li"
      >
        <DropdownToggle
          tag="button"
          id="page-header-notifications-dropdown"
          className="btn header-item noti-icon"
          style={{ position: "relative" }}
        >
          <i
            className="ri-notification-3-line"
            style={{
              color: defaultTheme.primary,
              fontSize: 22,
            }}
          />

          {count > 0 && (
            <span
              style={{
                position: "absolute",
                top: "6px",
                right: "-5px",
                minWidth: "18px",
                height: "18px",
                padding: "0 5px",
                background: "#f44336",
                color: "#fff",
                borderRadius: "999px",
                border: "2px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 700,
                lineHeight: 1,
                zIndex: 1000,
              }}
            >
              {/* {count > 99 ? "99+" : count} */}
              {count}
            </span>
          )}
        </DropdownToggle>
      </Dropdown>
    </React.Fragment>
  );
};

NotificationDropdown.propTypes = {
  t: PropTypes.any,
};

export default NotificationDropdown;