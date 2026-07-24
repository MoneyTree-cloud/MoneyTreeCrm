import { useEffect, useState } from "react";
import { Row, Container, Col } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import UsePanelAssociate from "../Dashboard/UsePanelAssociate";
import ProspectsForMeeting from "../Dashboard/ProspectsForMeeting";
import MeetingOngoing from "../Dashboard/MeetingOngoing";
import { GET_SALES_TARGET_POPUP_SALES } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import { useUserStore } from "../../store/useUserStore";
import PageContent from "../../components/Common/PageContent";
import MandatoryPopupTarget from "./MandatoryPopupTarget";
import { useNavigate } from "react-router-dom";
import ProfileCompletionModal from "../../components/Common/ProfileCompletionModal";
import { toast } from "react-toastify";
import TickerFile from "../Activity/TickerFile";
// import RewardPointsModal from "../Activity/RewardPointsModal";
// import DailyQuestionModal from "../AdminAssociateSetion/DailyQuestionModal";

const AssociateDashboard = () => {
  // State to trigger re-render
  const navigate = useNavigate();
  const [refreshMeeting, setRefreshMeeting] = useState(false);
  const { empCode, mainTeam, firstTimeLogin } = useUserStore((state) => state.user);
  const [modalOpen, setModalOpen] = useState(false);
  // const [rewardModalOpen, setRewardModalOpen] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // const { latitude, longitude } = position.coords;
      },
      (error) => {
        toast.error("Location access is required to proceed.");
        console.error("Error getting location:", error);
      }
    );
    if (firstTimeLogin === 'YES') {
      setModalOpen(true);
    }
  }, [firstTimeLogin]);

  const handleUpdateProfile = () => {
    setModalOpen(false);
    navigate('/user-profile');
  };

  const { data: saleTargetPopUpData, refetch: handleSaveSuccess } = useGet(`${GET_SALES_TARGET_POPUP_SALES}?empCode=${empCode}&mainTeam=${mainTeam}`);
  // const { data: rewardData } = useGet(`${PROJECT_REWARD_POINTS_POPUP}${userId}`, { enabled: Boolean(locationName === "Noida" || locationName === "Gurugram" || locationName === "Ghaziabad") });

  // useEffect(() => {
  //   if (rewardData?.data?.status === 1) {
  //     setRewardModalOpen(true);
  //   }
  // }, [rewardData]);

  // Function to toggle refresh state
  const handleRefreshMeeting = () => {
    setRefreshMeeting((prev) => !prev); // Toggle the state to trigger re-render
  };

  return (
    <PageContent>
      <Container fluid={true}>
        <Breadcrumbs title="MoneyTree" breadcrumbItem="Dashboard" />
        <ProfileCompletionModal
          isOpen={modalOpen}
          onNavigateToProfile={handleUpdateProfile}
        />
        {/* <DailyQuestionModal userId={userId} /> */}
        {/* {(locationName === "Noida" || locationName === "Gurugram" || locationName === "Ghaziabad") &&
          <RewardPointsModal
            data={rewardData?.data?.data || []}
            isOpen={rewardModalOpen}
            onClose={() => setRewardModalOpen(false)}
          />
        } */}

        <TickerFile />
        <MandatoryPopupTarget data={saleTargetPopUpData?.data?.data} onSaveSuccess={handleSaveSuccess} />
        <UsePanelAssociate />
        <Row>
          <Col lg="12">
            <ProspectsForMeeting onRefresh={handleRefreshMeeting} />
          </Col>
          <Col lg="12">
            <MeetingOngoing refresh={refreshMeeting} />
          </Col>
        </Row>
      </Container>
    </PageContent>
  );
};

export default AssociateDashboard;