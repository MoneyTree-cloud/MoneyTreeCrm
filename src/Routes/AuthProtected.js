import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { useGet } from "../Hooks/useApi";
import { GET_MENU_BY_ID, FIND_USER_BY_ID } from "../helpers/url_helper";
import ScreenLoader from "../constants/ScreenLoader";
import ChangePasswordSelf from "../Pages/Password/ChangePasswordSelf";
import { USER_TYPE } from "../constants/global";
import { decryptData } from "../components/Common/CryptoUtils";

export function withLoadData(Component) {
  return (props) => {
    const { isAuthenticated, userId } = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);
    const [sideBarData, setSideBarData] = useState({});

    const { isLoading, data } = useGet(GET_MENU_BY_ID + userId, { enabled: Boolean(isAuthenticated && userId) });
    const { data: userData } = useGet(`${FIND_USER_BY_ID}${userId}`, { enabled: Boolean(userId) });

    useEffect(() => {
      if (data?.data?.status === 1) {
        decryptData(data?.data?.data).then((decryptedData) => {
          if (decryptedData) {
            setSideBarData(decryptedData);
          } else {
            setSideBarData({});
          }
        });
        if (userData?.data?.status === 1) {
          decryptData(userData?.data?.data).then((decryptedData) => {
            if (decryptedData) {
              setUser({
                showRevenueLink: decryptedData?.user?.showRevenueForm,
                ivrCallStatus: decryptedData?.user?.ivrCallStatus,
                parentUserId: decryptedData?.mainTL?.empCode,
                departmentName: decryptedData?.user?.departmentName,
                parentId: decryptedData?.user?.parentId
              });
            }
          });
        }
      }
    }, [data, setUser, userData]);

    useEffect(() => {
      if (sideBarData) {
        setUser({ sidebar: sideBarData });
      }
    }, [sideBarData, setUser]);

    if (isLoading) {
      return <ScreenLoader />;
    }
    return <Component {...props} />;
  };
}

export function withPasswordChange(Component) {
  return (props) => {
    const isNew = useUserStore((state) => state.user.isNew);
    if (isNew === false) {
      return <ChangePasswordSelf />;
    }
    return <Component {...props} />;
  };
}

export function withProtected(Component) {
  return (props) => {
    const isAuthenticated = useUserStore((state) => state.user.isAuthenticated);
    if (!isAuthenticated) {
      return <Navigate to={{ pathname: "/login" }} replace={true} />;
    }
    return <Component {...props} />;
  };
}

export function withAssociateAccess(Component) {
  return (props) => {
    const userRole = useUserStore((state) => state.user.role);

    if (userRole === USER_TYPE.ASSOCIATE) {
      return <Component {...props} />;
    }
    // instead of this message to the admin redirect to the dashboard
    return <h1 style={{ marginTop: "80px" }}>Un-Authorize Access</h1>;
  };
}

export function withAdminAccess(Component, isSidebarRoute = true) {
  return (props) => {
    // const userRole = useUserStore((state) => state.user.role);
    // const sidebar = useUserStore((state) => state.user.sidebar);
    // const { pathname } = useLocation();
    // const currentPath = pathname.split("/")?.[1];

    // if (
    //   userRole !==
    //   USER_TYPE.ADMIN(currentPath !== "dashboard" && isSidebarRoute && !sidebar?.[currentPath]
    //   )
    // ) {
    //   return (
    //     <h1 style={{ marginTop: "80px" }}>
    //       <PermissionMissing />
    //     </h1>
    //   );
    // }

    return <Component {...props} />;
  };
}
