import React, { useState } from "react";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import moneyTreeLogo from "../../assets/images/profile-user.png";
import { useUserStore } from "../../store/useUserStore";
import { imageBaseUrl } from "../../helpers/api_helper";

const ProfileMenu = (props) => {
  const [menu, setMenu] = useState(false);
  const {userName, profileImage} = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);

  return (
    <React.Fragment>
      <Dropdown
        title="Profile"
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="d-inline-block"
      >
        <DropdownToggle
          className="btn header-item mt-header__profile"
          id="page-header-user-dropdown"
          tag="button"
        >
          <span className="mt-header__profile-text d-none d-xl-flex">
            <span className="mt-header__profile-hello">Welcome</span>
            <span className="mt-header__profile-name">{userName}</span>
          </span>
          {profileImage === "null" || typeof profileImage === "object" || profileImage === '0' || !profileImage ? (
            <img
              className="rounded-circle header-profile-user"
              src={moneyTreeLogo}
              alt="Header Avatar"
            />
          ) : (
            <img
              className="rounded-circle header-profile-user"
              src={imageBaseUrl + profileImage}
              alt=""
            />
          )}
          <i className="mdi mdi-chevron-down mt-header__profile-caret d-none d-xl-inline-block" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end mt-header__menu">
          <DropdownItem tag="a" href="/user-profile" title="Profile">
            <i className="ri-user-line align-middle me-2" />
            Profile
          </DropdownItem>
          <DropdownItem tag="a" href="/password-change" title="Change Password">
            <i className="ri-key-line align-middle me-2" />
            Change Password
          </DropdownItem>
          <div className="dropdown-divider" />
          <DropdownItem onClick={logout} title="Logout">
            <i className="ri-shut-down-line align-middle me-2 text-danger" />
            Logout
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default (ProfileMenu);
