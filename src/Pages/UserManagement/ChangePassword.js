import { useState } from "react";
import { Card, CardBody, Col, Container, Row, Button } from "reactstrap";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { RegexFile } from "../../helpers/RegexFile";
import { usePost } from "../../Hooks/useApi";
import { CHANGE_PASSWORD } from "../../helpers/url_helper";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Import eye icons
import PageContent from "../../components/Common/PageContent";
import { RequiredStar } from "../../helpers/function_helper";

export default function ChangePassword() {
  const navigation = useNavigate();
  const location = useLocation();
  const { userId } = location.state || {};
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for password visibility
  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!oldPassword) {
      toast.error("Old Password Is Required");
    } else if (!newPassword) {
      toast.error("New Password Is Required.");
    } else if (!new RegExp(RegexFile.password).test(newPassword)) {
      toast.error("New Password Does Not Meet Requirements.");
    } else if (!confirmPassword) {
      toast.error("Confirm Password Is Required.");
    } else if (newPassword !== confirmPassword) {
      toast.error("Passwords Do Not Match.");
    }
    else {
      if (Object.keys(newErrors).length === 0) {
        let params = {
          userId: userId,
          oldPassword: oldPassword,
          newPassword: newPassword,
        };
        mutate(params);
      }
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const { isPending, mutate } = usePost(CHANGE_PASSWORD, {
    onSuccess: (response) => {
      if (response?.data?.status === 1) {
        toast.success(response.data.message);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const resetForm = () => {
    navigation(-1);
  };

  // Password requirements state
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    upperCase: false,
    lowerCase: false,
    digit: false,
    specialChar: false,
  });

  const validatePassword = (password) => {
    setPasswordCriteria({
      minLength: password.length >= 8,
      upperCase: /[A-Z]/.test(password),
      lowerCase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      specialChar: /[!@#$%^&*]/.test(password),
    });
  };

  return (
    <PageContent>
      <Breadcrumbs title="Dashboard" breadcrumbItem="Change Password" />
      {isPending && <ScreenLoader />}
      <Container
        fluid={true}
        className="d-flex justify-content-center align-items-center"
      >
        <form onSubmit={handleSubmit} className="w-100">
          <Card>
            <CardBody>
              <Row className="mb-3">
                <Col md="16">
                  <h6 className="font-size-11">
                    Old Password <RequiredStar />
                  </h6>
                  <div className="input-group">
                    <input
                      id="oldPassword"
                      className={`form-control`}
                      type={oldPasswordVisible ? "text" : "password"}
                      value={oldPassword}
                      onChange={handleInputChange(setOldPassword)}
                      placeholder="Enter old password..."
                    />
                    <button
                      type="button"
                      className="input-group-text"
                      onClick={() =>
                        setOldPasswordVisible(!oldPasswordVisible)
                      }
                    >
                      {oldPasswordVisible ? (
                        <AiFillEyeInvisible color="black" />
                      ) : (
                        <AiFillEye color="black" />
                      )}
                    </button>
                  </div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="12">
                  <h6 className="font-size-11">
                    New Password <RequiredStar />
                  </h6>
                  <div className="input-group">
                    <input
                      id="newPassword"
                      className={`form-control`}
                      type={newPasswordVisible ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        handleInputChange(setNewPassword)(e);
                        validatePassword(e.target.value);
                      }}
                      placeholder="Enter new password..."
                    />
                    <button
                      type="button"
                      className="input-group-text"
                      onClick={() =>
                        setNewPasswordVisible(!newPasswordVisible)
                      }
                    >
                      {newPasswordVisible ? (
                        <AiFillEyeInvisible color="black" />
                      ) : (
                        <AiFillEye color="black" />
                      )}
                    </button>
                  </div>

                  <div className="password-requirements mt-2">
                    <div
                      style={{
                        color: passwordCriteria.minLength
                          ? defaultTheme.primary
                          : defaultTheme.goldColorLogo,
                      }}
                    >
                      Minimum length: At least 8 characters.
                    </div>
                    <div
                      style={{
                        color: passwordCriteria.upperCase
                          ? defaultTheme.primary
                          : defaultTheme.goldColorLogo,
                      }}
                    >
                      At least one uppercase letter (A-Z).
                    </div>
                    <div
                      style={{
                        color: passwordCriteria.lowerCase
                          ? defaultTheme.primary
                          : defaultTheme.goldColorLogo,
                      }}
                    >
                      At least one lowercase letter (a-z).
                    </div>
                    <div
                      style={{
                        color: passwordCriteria.digit
                          ? defaultTheme.primary
                          : defaultTheme.goldColorLogo,
                      }}
                    >
                      At least one digit (0-9).
                    </div>
                    <div
                      style={{
                        color: passwordCriteria.specialChar
                          ? defaultTheme.primary
                          : defaultTheme.goldColorLogo,
                      }}
                    >
                      At least one special character (e.g., !@#$%^&*).
                    </div>
                  </div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="12">
                  <h6 className="font-size-11">
                    Confirm Password <RequiredStar />
                  </h6>
                  <div className="input-group">
                    <input
                      id="confirmPassword"
                      className={`form-control`}
                      type={confirmPasswordVisible ? "text" : "password"}
                      value={confirmPassword}
                      onChange={handleInputChange(setConfirmPassword)}
                      placeholder="Enter confirm password..."
                    />
                    <button
                      type="button"
                      className="input-group-text"
                      onClick={() =>
                        setConfirmPasswordVisible(!confirmPasswordVisible)
                      }
                    >
                      {confirmPasswordVisible ? (
                        <AiFillEyeInvisible color="black" />
                      ) : (
                        <AiFillEye color="black" />
                      )}
                    </button>
                  </div>
                </Col>
              </Row>
              <Row className="justify-content-center mt-4">
                <Col md="auto">
                  <Button
                    color="primary"
                    className="me-2"
                    type="submit">
                    Save
                  </Button>
                  <Button
                    color="secondary"
                    type="button"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>
      </Container>
    </PageContent>
  );
}
