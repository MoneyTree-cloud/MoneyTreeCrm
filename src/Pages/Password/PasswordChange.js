import React, { useState } from "react";
import { Card, CardBody, Col, Container, Row, Button } from "reactstrap";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import ScreenLoader from "../../constants/ScreenLoader";
import { usePut } from "../../Hooks/useApi";
import { CHANGE_PASSWORD_SELF } from "../../helpers/url_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import { RegexFile } from "../../helpers/RegexFile";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import PageContent from "../../components/Common/PageContent";

export default function PasswordChange() {
  const navigation = useNavigate();
  const empCode = useUserStore((state) => state.user.empCode);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

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
      toast.error("New Password Does Not Meet Password Policy Requirements.");
    } else if (!confirmPassword) {
      toast.error("Confirm Password Is Required.");
    } else if (newPassword !== confirmPassword) {
      toast.error("Passwords Do Not Match.");
    } else {
      if (Object.keys(newErrors).length === 0) {
        let params = {
          userId: empCode,
          newPassword: newPassword,
          oldPassword: oldPassword,
        };
        mutate(params);
      }
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, [e.target.id]: undefined }));
  };

  const { isPending, mutate } = usePut(`${CHANGE_PASSWORD_SELF}`, {
    onSuccess: (response) => {
      if (response?.data?.statusCode === 1) {
        toast.success(response.data.message);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        navigation('/dashboard');
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
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

  const resetForm = () => {
    navigation('/dashboard');
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
                  <Col md="12">
                    <h6 className="font-size-11">
                      Old Password <span className="text-danger">*</span>
                    </h6>
                    <div
                      className="d-flex align-items-center position-relative"
                      style={{
                        border: "1px solid #ccc", // Add border to the container
                        borderRadius: "4px", // Optional: add border radius for rounded corners
                      }}
                    >
                      <input
                        id="oldPassword"
                        className={`form-control ${
                          errors.oldPassword ? "is-invalid" : ""
                        }`}
                        type={oldPasswordVisible ? "text" : "password"}
                        value={oldPassword}
                        style={{
                          border: "none", // Remove border from the input itself
                          outline: "none", // Remove focus outline
                          paddingRight: "40px", // Provide space for the eye button on the right
                          flex: 5, // Allow the input to take up remaining space
                        }}
                        onChange={handleInputChange(setOldPassword)}
                        placeholder="Enter old password..."
                      />
                      <button
                        type="button"
                        style={{
                          flex: 0.5,
                          backgroundColor: "transparent", // Transparent background
                        }}
                        className="input-group-text"
                        onClick={() =>
                          setOldPasswordVisible(!oldPasswordVisible)
                        }
                      >
                        {oldPasswordVisible ? (
                          <AiFillEyeInvisible color="black" size={24} />
                        ) : (
                          <AiFillEye color="black" size={24} />
                        )}
                      </button>
                    </div>
                    {errors.oldPassword && (
                      <div className="invalid-feedback">
                        {errors.oldPassword}
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="12">
                    <h6 className="font-size-11">
                      New Password <span className="text-danger">*</span>
                    </h6>
                    <div
                      className="d-flex align-items-center position-relative"
                      style={{
                        border: "1px solid #ccc", // Add border to the container
                        borderRadius: "4px", // Optional: add border radius for rounded corners
                      }}
                    >
                      {/* <div className="input-group"> */}
                      <input
                        id="newPassword"
                        className={`form-control ${
                          errors.newPassword ? "is-invalid" : ""
                        }`}
                        type={newPasswordVisible ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          handleInputChange(setNewPassword)(e);
                          validatePassword(e.target.value);
                        }}
                        style={{
                          border: "none", // Remove border from the input itself
                          outline: "none", // Remove focus outline
                          paddingRight: "40px", // Provide space for the eye button on the right
                          flex: 5, // Allow the input to take up remaining space
                        }}
                        placeholder="Enter new password..."
                      />
                      <button
                        style={{
                          flex: 0.5,
                          backgroundColor: "transparent", // Transparent background
                        }}
                        type="button"
                        className="input-group-text"
                        onClick={() =>
                          setNewPasswordVisible(!newPasswordVisible)
                        }
                      >
                        {newPasswordVisible ? (
                          <AiFillEyeInvisible color="black" size={24} />
                        ) : (
                          <AiFillEye color="black" size={24} />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <div className="invalid-feedback">
                        {errors.newPassword}
                      </div>
                    )}

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
                      Confirm Password <span className="text-danger">*</span>
                    </h6>
                    <div
                      className="d-flex align-items-center position-relative"
                      style={{
                        border: "1px solid #ccc", // Add border to the container
                        borderRadius: "4px", // Optional: add border radius for rounded corners
                      }}
                    >
                      <input
                        id="confirmPassword"
                        className={`form-control ${
                          errors.confirmPassword ? "is-invalid" : ""
                        }`}
                        type={confirmPasswordVisible ? "text" : "password"}
                        value={confirmPassword}
                        onChange={handleInputChange(setConfirmPassword)}
                        placeholder="Enter confirm password..."
                        style={{
                          border: "none", // Remove border from the input itself
                          outline: "none", // Remove focus outline
                          paddingRight: "40px", // Provide space for the eye button on the right
                          flex: 5, // Allow the input to take up remaining space
                        }}
                      />
                      <button
                        style={{
                          flex: 0.5,
                          backgroundColor: "transparent", // Transparent background
                        }}
                        type="button"
                        className="input-group-text"
                        onClick={() =>
                          setConfirmPasswordVisible(!confirmPasswordVisible)
                        }
                      >
                        {confirmPasswordVisible ? (
                          <AiFillEyeInvisible color="black" size={24} />
                        ) : (
                          <AiFillEye color="black" size={24} />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="invalid-feedback">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="justify-content-center mt-4">
                  <Col md="auto">
                    <div className="d-flex align-items-center mb-3">
                      <Button
                        color="primary"
                        style={{ backgroundColor: defaultTheme.primary }}
                        className="me-2"
                        type="submit"
                      >
                        Save
                      </Button>
                      <Button
                        style={{ backgroundColor: defaultTheme.goldColorLogo }}
                        color="secondary"
                        type="button"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </form>
        </Container>
    </PageContent>
  );
}
