import { useState } from "react";
import { Row, Col, Card, CardBody, Button, Container, Input } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { usePost } from "../../Hooks/useApi";
import { SEND_OTP, VERIFY_TEXT_OTP } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useUserStore } from "../../store/useUserStore";
import PageContent from "../../components/Common/PageContent";
import { RequiredStar } from "../../helpers/function_helper";

const EndMeetingOTPScreen = () => {
  const location = useLocation();
  const navigation = useNavigate();
  const meetingId = location.state?.meetingId;
  const userId = useUserStore((state) => state.user.userId);
  const clientMobNo = location.state?.clientMobNo;
  const localOtpId = localStorage.getItem("otpId");
  const [otp, setOtp] = useState("");
  const [otpId, setOtpId] = useState("");

  const { isPending: isPendingOtpSend, mutate: mutateOtpSend } = usePost(
    SEND_OTP + clientMobNo + "&userId=" + userId,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          setOtpId(response.data.data.optId);
          localStorage.setItem("otpId", response.data.data.optId);
          toast.success("Happy Code has been sent to customer via SMS as well as WhatsApp");
        } else {
          setOtpId("");
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const { isPending: isVerifyOtpSend, mutate: mutateOtpVerify } = usePost(
    VERIFY_TEXT_OTP + otp + "&userId=" + userId + "&otpId=" + (otpId ? otpId : localOtpId),
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          navigation("/end-cancel-meeting", { state: { meetingId, type: "end" } });
          localStorage.removeItem("otpId");
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.length !== 4) {
      toast.error("Please Enter A Valid Happy Code");
      return;
    } else if (!otpId || !localOtpId) {
      toast.error("The Happy Code is either invalid or has already been verified. Please generate a new code and try again.");
      return;
    } else {
      mutateOtpVerify(); // This will trigger the verification API call
    }
  };

  const handleGenerateRegenerate = () => {
    mutateOtpSend();
    setOtp(""); // Clear OTP field on regenerate
  };

  const handleCancel = () => {
    navigation(-1);
  };

  return (
    <PageContent>
      <Container fluid={true}>
        {(isVerifyOtpSend || isPendingOtpSend) && <ScreenLoader />}
        <Breadcrumbs title="Meeting" breadcrumbItem="End Meeting" />

        <span
          style={{
            color: defaultTheme.redColor,
            fontSize: 12,
            display: "block",
            marginBottom: 10,
          }}
        >
          Note : The Happy Code will be sent to customer via SMS.
        </span>

        <Card>
          <CardBody>
            <form className="needs-validation" noValidate onSubmit={handleVerify}>
              <Row className="g-3">
                <Col md="6">
                  <h6 className="font-size-11">Happy Code <RequiredStar /></h6>
                  <Input
                    name="otp"
                    placeholder="Enter Happy Code"
                    type="text"
                    className="form-control"
                    value={otp}
                    maxLength={4}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </Col>
                <Col md="6" className="d-flex align-items-end">
                  <Button
                    type="submit"
                    color="primary"
                    className="ms-1"
                    disabled={otp.length !== 4}
                    style={{ paddingLeft: 50, paddingRight: 50 }}
                    onClick={handleVerify}
                  >
                    Verify
                  </Button>{" "}
                  <Button
                    type="button"
                    color="info"
                    style={{ marginLeft: 10, marginRight: 10 }}
                    onClick={handleGenerateRegenerate}
                  >
                    Generate
                  </Button>
                  <Button
                    type="button"
                    color="secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>
      </Container>
    </PageContent>
  );
};

export default EndMeetingOTPScreen;
