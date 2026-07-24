import { useUserStore } from "../../store/useUserStore";
import AssociateDashboard from "../AssociateSection/AssociateDashboard";
import { USER_TYPE } from "../../constants/global";
import ScreenLoader from "../../constants/ScreenLoader";

// Higher-Order Component
const withUserDashboard = (Component) => {
  return (props) => {
    const role = useUserStore((state) => state.user.role)
    if (!role) {
      <ScreenLoader />
      return
    }
    if (role === USER_TYPE.ADMIN || role === USER_TYPE.OTHER) {
      return <Component {...props} />;
    }
    return <AssociateDashboard />;
  };
};

export default withUserDashboard;
