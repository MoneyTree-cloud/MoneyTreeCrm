import { useUserStore } from "../store/useUserStore";
import { Navigate } from "react-router-dom";
import SuspenseWrapper from "./SuspenseWrapper";

const NonAuthLayout = ({ children }) => {
  const isAuthenticated = useUserStore((state) => state.user.isAuthenticated);
  if (isAuthenticated) {
    return (
      <SuspenseWrapper><Navigate to={{ pathname: "/" }} replace={true} /></SuspenseWrapper>
    )
  }
  return <SuspenseWrapper>{children}</SuspenseWrapper>;
};

export default NonAuthLayout;
