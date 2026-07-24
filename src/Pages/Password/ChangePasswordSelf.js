import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Button, Form, Input, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import { usePut } from "../../Hooks/useApi";
import { CHANGE_PASSWORD_SELF } from "../../helpers/url_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import { RegexFile } from "../../helpers/RegexFile";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import logo from "../../assets/images/Tree_transparent.png";
import { useFormik } from "formik";
import { FaArrowLeft } from "react-icons/fa";
import { RequiredStar } from "../../helpers/function_helper";
import { assetImageBaseUrl } from "../../helpers/api_helper";

export default function ChangePasswordSelf() {
  const empCode = useUserStore((state) => state.user.empCode);
  const logout = useUserStore((state) => state.logout);
  const setUser = useUserStore((state) => state.setUser);
  const currentYear = new Date().getFullYear();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const treeback = assetImageBaseUrl + 'logo.png';

  const { isPending, mutate } = usePut(`${CHANGE_PASSWORD_SELF}`, {
    onSuccess: (response) => {
      if (response?.data?.statusCode === 1) {
        toast.success(response.data.message);
        setUser({ isNew: true });
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

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

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: (values) => {
      if (!oldPassword) {
        toast.error("One Time Password Is Required");
      } else if (!newPassword) {
        toast.error("New Password Is Required.");
      } else if (!new RegExp(RegexFile.password).test(newPassword)) {
        toast.error("New Password Does Not Meet Password Policy Requirements.");
      } else if (!confirmPassword) {
        toast.error("Confirm Password Is Required.");
      } else if (newPassword !== confirmPassword) {
        toast.error("Passwords Do Not Match.");
      } else {
        let params = {
          userId: empCode,
          newPassword: newPassword,
          oldPassword: oldPassword,
        };
        mutate(params);
      }
    },
  });

  useEffect(() => {
    document.body.className = "bg-pattern";
    return () => {
      document.body.className = "";
    };
  }, []);

  const handleBackClick = () => {
    logout();
  };

  return (
    <React.Fragment>
      {isPending && <ScreenLoader />}
      <div className="account-pages my-5 pt-1">
        <Container>
          <div>
            <img src={treeback} className="treeback" alt="" />
          </div>
          <Row className="justify-content-end">
            <Col lg={6} md={8} xl={5}>
              <Card>
                <CardBody className="p-4">
                  <div>
                    <button onClick={handleBackClick} style={styles.button}>
                      <FaArrowLeft style={styles.icon} />
                      {/* Back */}
                    </button>

                    <div className="text-center">
                      <a
                        href="https://moneytreerealty.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={logo}
                          alt=""
                          height="40"
                          width={"60"}
                          className="auth-logo logo-dark mx-auto"
                        />
                      </a>

                      <p
                        className="text-center"
                        style={{
                          color: defaultTheme.primary,
                          fontWeight: "bold",
                        }}
                      >
                        Change Your Default Password
                      </p>
                    </div>

                    <Form
                      className="form-horizontal"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                      }}
                    >
                      <Row>
                        <Col md={12}>
                          <div className="mb-4">
                            <h6 className="mb-1 font-size-11">
                              One Time Password
                              <RequiredStar />
                            </h6>
                            <div
                              className="d-flex align-items-center position-relative"
                              style={{
                                border: "1px solid #ccc", // Add border to the container
                                borderRadius: "4px", // Optional: add border radius for rounded corners
                              }}
                            >
                              <Input
                                name="oldPassword"
                                value={validation.values.oldPassword}
                                type={oldPasswordVisible ? "text" : "password"}
                                placeholder="Enter Your One Time Password"
                                onChange={(e) => {
                                  setOldPassword(e.target.value);
                                  validation.setFieldValue(
                                    "oldPassword",
                                    e.target.value
                                  );
                                }}
                                style={{
                                  border: "none", // Remove border from the input itself
                                  outline: "none", // Remove focus outline
                                  paddingRight: "40px", // Provide space for the eye button on the right
                                  flex: 5, // Allow the input to take up remaining space
                                }}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setOldPasswordVisible(!oldPasswordVisible)
                                }
                                style={{
                                  flex: 0.5,
                                  backgroundColor: "transparent", // Transparent background
                                }}
                              >
                                {oldPasswordVisible ? (
                                  <AiFillEye size={20} color="black" />
                                ) : (
                                  <AiFillEyeInvisible size={20} color="black" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="mb-4">
                            <h6 className="mb-1 font-size-11">
                              New Password{" "}
                              <RequiredStar />
                            </h6>
                            <div
                              className="d-flex align-items-center position-relative"
                              style={{
                                border: "1px solid #ccc", // Add border to the container
                                borderRadius: "4px", // Optional: add border radius for rounded corners
                              }}
                            >
                              <Input
                                name="newPassword"
                                value={validation.values.newPassword}
                                type={newPasswordVisible ? "text" : "password"}
                                placeholder="Enter Your New Password"
                                onChange={(e) => {
                                  setNewPassword(e.target.value);
                                  validation.setFieldValue(
                                    "newPassword",
                                    e.target.value
                                  );
                                  validatePassword(e.target.value);
                                }}
                                style={{
                                  border: "none", // Remove border from the input itself
                                  outline: "none", // Remove focus outline
                                  paddingRight: "40px", // Provide space for the eye button on the right
                                  flex: 5, // Allow the input to take up remaining space
                                }}
                              />
                              <button
                                type="button"
                                style={{
                                  flex: 0.5,
                                  backgroundColor: "transparent", // Transparent background
                                }}
                                onClick={() =>
                                  setNewPasswordVisible(!newPasswordVisible)
                                }
                              >
                                {newPasswordVisible ? (
                                  <AiFillEye size={20} color="black" />
                                ) : (
                                  <AiFillEyeInvisible size={20} color="black" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="password-requirements mb-2">
                            <Button
                              color="link"
                              onClick={() => setModalOpen(true)}
                            >
                              <AiFillEye size={20} /> Password Policy
                            </Button>
                          </div>

                          <div className="mb-4">
                            <h6 className="mb-1 font-size-11">
                              Confirm Password
                              <RequiredStar />
                            </h6>
                            <div
                              className="d-flex align-items-center position-relative"
                              style={{
                                border: "1px solid #ccc", // Add border to the container
                                borderRadius: "4px", // Optional: add border radius for rounded corners
                              }}
                            >
                              <Input
                                name="confirmPassword"
                                value={validation.values.confirmPassword}
                                type={
                                  confirmPasswordVisible ? "text" : "password"
                                }
                                placeholder="Enter Your Confirm Password"
                                onChange={(e) => {
                                  setConfirmPassword(e.target.value);
                                  validation.setFieldValue(
                                    "confirmPassword",
                                    e.target.value
                                  );
                                }}
                                style={{
                                  border: "none",
                                  outline: "none",
                                  paddingRight: "40px",
                                  flex: 5,
                                }}
                              />
                              <button
                                type="button"
                                style={{
                                  flex: 0.5,
                                  backgroundColor: "transparent", // Transparent background
                                }}
                                onClick={() =>
                                  setConfirmPasswordVisible(
                                    !confirmPasswordVisible
                                  )
                                }
                              >
                                {confirmPasswordVisible ? (
                                  <AiFillEye size={20} color="black" />
                                ) : (
                                  <AiFillEyeInvisible size={20} color="black" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="d-grid mt-5">
                            <button
                              className="btn btn-primary waves-effect waves-light"
                              type="submit"
                              disabled={isPending}
                            >
                              {isPending ? "Loading..." : "Change Password"}
                            </button>
                          </div>
                        </Col>
                      </Row>
                    </Form>
                  </div>
                </CardBody>
              </Card>
              <div className="mt-2 text-center">
                <p
                  className="text-white font-size-14"
                  style={{ color: "white" }}
                >
                  Copyright © {currentYear}{" "}
                  <a
                    href="https://moneytreerealty.com"
                    style={{ color: "white", textDecoration: "underline" }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Moneytree Realty{" "}
                  </a>
                  All Rights Reserved.
                </p>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Modal for Password Requirements */}
        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
          <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
            Password Requirements
          </ModalHeader>
          <ModalBody>
            <div
              style={{
                color: passwordCriteria.minLength
                  ? "green"
                  : defaultTheme.goldColorLogo,
              }}
            >
              Minimum length: At least 8 characters.
            </div>
            <div
              style={{
                color: passwordCriteria.upperCase
                  ? "green"
                  : defaultTheme.goldColorLogo,
              }}
            >
              At least one uppercase letter (A-Z).
            </div>
            <div
              style={{
                color: passwordCriteria.lowerCase
                  ? "green"
                  : defaultTheme.goldColorLogo,
              }}
            >
              At least one lowercase letter (a-z).
            </div>
            <div
              style={{
                color: passwordCriteria.digit
                  ? "green"
                  : defaultTheme.goldColorLogo,
              }}
            >
              At least one digit (0-9).
            </div>
            <div
              style={{
                color: passwordCriteria.specialChar
                  ? "green"
                  : defaultTheme.goldColorLogo,
              }}
            >
              At least one special character (e.g., !@#$%^&*).
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => setModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </React.Fragment>
  );
}

const styles = {
  button: {
    display: "flex",
    alignItems: "flex-start", // Aligns items to the top of the button (vertical alignment)
    padding: "10px 20px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    justifyContent: "flex-start", // Aligns button's content to the start (left) horizontally
    maxWidth: "70px", // Sets a maximum width for the button
    width: "100%", // Button takes full width, but within the maxWidth
    margin: "0", // Remove horizontal centering
    marginBottom: "10px", // Adds space below the button
  },
  icon: {
    marginRight: "8px", // Space between the icon and the text
  },
};
