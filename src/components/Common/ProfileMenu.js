import React, { useState } from "react";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from "reactstrap";
import moneyTreeLogo from "../../assets/images/profile-user.png";
import { useUserStore } from "../../store/useUserStore";
import { defaultTheme } from "../../helpers/defaultTheme";
import { imageBaseUrl } from "../../helpers/api_helper";

const ProfileMenu = (props) => {
  const [menu, setMenu] = useState(false);
  const userName = useUserStore((state) => state.user.userName);
  const profileImage = useUserStore((state) => state.user.profileImage);
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
          className="btn header-item "
          id="page-header-user-dropdown"
          tag="button"
        >
          <span
            className="d-none d-xl-inline-block me-2"
            style={{
              fontWeight: 500,
              color: defaultTheme.primary,
              fontSize: 12,
            }}
          >
            Welcome {userName}
          </span>
          {profileImage === "null" || typeof profileImage === "object" || profileImage === '0' || !profileImage ? (
            <img
              className="rounded-circle header-profile-user"
              src={moneyTreeLogo}
              alt="Header Avatar"
              style={{ objectFit: 'contain' }}
            />
          ) : (
            <img
              className="rounded-circle header-profile-user"
              src={imageBaseUrl + profileImage}
              style={{ objectFit: 'contain',border: `2px solid ${defaultTheme.primary}` }}
              alt=""
            />
          )}
          <i className="mdi mdi-chevron-down d-none d-xl-inline-block ms-2" style={{ color: defaultTheme.primary }} />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownItem tag="a" href="/user-profile">
            {" "}
            <i className="ri-user-line align-middle me-2" />
            {"Profile"}{" "}
          </DropdownItem>
          <div className="dropdown-divider" />

          <DropdownItem tag="a" href="/password-change">
            {" "}
            <i className="ri-key-line align-middle me-2" />
            {"Change Password"}{" "}
          </DropdownItem>
          <div className="dropdown-divider" />

          <Button onClick={logout} className="dropdown-item">
            <i className="ri-shut-down-line align-middle me-2 text-danger" />
            <span style={{ color: "black" }}>{"Logout"}</span>
          </Button>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default (ProfileMenu);
