import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownToggle } from "reactstrap";
import { useUserStore } from "../../store/useUserStore";
import { useGet } from "../../Hooks/useApi";
import { GET_NOTIFICATIONS_BY_ID } from "../../helpers/url_helper";
import LottieIcon from "../../components/Common/LottieIcon";
import bellAnimation from "../../assets/lottie/Notification.lottie/animations/12345.json";

const NotificationDropdown = () => {
  const navigation = useNavigate();
  const userId = useUserStore((state) => state.user.userId);
  const [hovered, setHovered] = useState(false);
  
  const { data: notificationList } = useGet(`${GET_NOTIFICATIONS_BY_ID}${userId}`, { enabled: Boolean(userId) });

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
          className="btn header-item mt-header__icon-btn"
          aria-label="Notifications"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* rings while there are unread notifications, or on hover */}
          <LottieIcon
            animationData={bellAnimation}
            playing={count > 0 || hovered}
            className="mt-header__lottie"
          />

          {count > 0 && (
            <span className="mt-header__badge">
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