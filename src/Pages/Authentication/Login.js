import React, { useEffect, useState } from "react";
import logo from "../../assets/images/Tree_transparent.png";
import { Row, Col, CardBody, Card, Container, Form, Input, Label, } from "reactstrap";
import { useFormik } from "formik";
import { useRawPost } from "../../Hooks/useApi";
import { POST_LOGIN } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import { toast } from "react-toastify";
import { defaultTheme } from "../../helpers/defaultTheme";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import "../CSS/styles.css";
import SocialMediaLinks from "../../constants/SocialMediaLinks";
import { assetImageBaseUrl } from "../../helpers/api_helper";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const login = useUserStore((state) => state.login);
  const setUser = useUserStore((state) => state.setUser);
  const navigation = useNavigate()
  const [lockUntil, setLockUntil] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
    const treeback = assetImageBaseUrl + 'logo.png';

  const { isPending, mutate } = useRawPost(POST_LOGIN, {
    onSuccess: async (response) => {
      if (response.data.status === 1) {
        const payload = {
          accessToken: response.data.data,
          role: response.data.userRole,
          userId: response.data.userId,
          userName: response.data.userName,
          isNew: response.data.isPasswordChange,
          profileImage: response.data.filePath,
          mobileNo: response.data.mobileNo,
          showRevanueLink: response.data.showRevanueLink,
          emailId: response.data.emailId,
          empCode: response.data.empCode,
          reporingTo: response.data.reporingTo,
          mainTlName: response.data.mainTlName,
          mainTeam: response.data.mainTeam,
          subTlName: response.data.subTlName,
          subTeam: response.data.subTeam,
          level: response.data.level,
          branchManager: response.data.branchManager ? 'Yes' : 'No',
          mainTl: response.data.mainTl,
          subTl: response.data.subTl,
          firstTimeLogin: response.data.firstTimeLogin,
          ivrCallStatus: response.data.ivrCallStatus,
          locationName: response.data.branchName
        };
        await login(payload);
        await setUser({
          userId: response.data.userId,
          role: response.data.userRole,
          userName: response.data.userName,
          profileImage: response.data.filePath,
          mobileNo: response.data.mobileNo,
          showRevanueLink: response.data.showRevanueLink,
          emailId: response.data.emailId,
          empCode: response.data.empCode,
          reporingTo: response.data.reporingTo,
          mainTlName: response.data.mainTlName,
          mainTeam: response.data.mainTeam,
          subTlName: response.data.subTlName,
          subTeam: response.data.subTeam,
          level: response.data.level,
          branchManager: response.data.branchManager ? 'Yes' : 'No',
          mainTl: response.data.mainTl,
          subTl: response.data.subTl,
          firstTimeLogin: response.data.firstTimeLogin,
          ivrCallStatus: response.data.ivrCallStatus,
          locationName: response.data.branchName
        });
        if (response.data.isPasswordChange) {
          window.location.reload();
          toast.success("Welcome : " + response.data.userName);
        }
      } else {
        const message = response.data.message;

        if (message?.includes("Too many login attempts")) {
          const unlockTime = Date.now() + 15 * 60 * 1000; // 15 minutes
          localStorage.setItem("loginLockUntil", unlockTime);

          setLockUntil(unlockTime);
        }
        toast.error(
          <div>
            {response.data.message.split('\n').map((line, index) => (
              <p key={index} style={{ marginBottom: '1em' }}>{line}</p>
            ))}
          </div>
        );
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  useEffect(() => {
    const storedLock = localStorage.getItem("loginLockUntil");

    if (storedLock) {
      setLockUntil(parseInt(storedLock));
    }
  }, []);

  useEffect(() => {
    if (!lockUntil) return;

    const interval = setInterval(() => {
      const remaining = Math.floor((lockUntil - Date.now()) / 1000);

      if (remaining <= 0) {
        setRemainingTime(0);
        setLockUntil(null);
        localStorage.removeItem("loginLockUntil");
        clearInterval(interval);
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockUntil]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      empcode: "",
      password: "",
    },

    onSubmit: (values) => {
      if (!values.empcode) {
        toast.error("Please Enter Employee Id");
      } else if (!values.password) {
        toast.error("Please Enter Password");
      } else {
        mutate({
          userId: values.empcode,
          password: values.password,
          // gcmId: fcmToken
        });
      }
    },
  });

  useEffect(() => {
    document.body.className = "bg-pattern";
    return function cleanup() {
      document.body.className = "";
    };
  }, []);

  const navigateToForgotPassword = ev => {
    ev.preventDefault();
    navigation("/forgot-password");
  }

  return (
    <React.Fragment>
      {isPending && <ScreenLoader />}
      <div className="account-pages my-2 pt-3">
        <Container>
          <div>
            <img src={treeback} className="treeback" alt="" />
          </div>
          <Row className="justify-content-end res">
            <Col lg={4} md={8} xl={4}>
              <Card style={{ backgroundColor: 'white' }} >
                <CardBody className="p-3">
                  <div>
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
                    </div>
                    <p
                      className="text-center"
                      style={{ color: defaultTheme.primary, fontWeight: "bold" }}
                    >
                      Welcome Back !
                    </p>
                    <p
                      className="mb-5 text-center"
                      style={{ fontWeight: "bold" }}
                    >
                      Sign in to continue to MoneyTree.
                    </p>
                    <Form
                      className="form-horizontal"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                    >
                      <Row>
                        <Col md={12}>
                          <div className="mb-4">
                            <Label className="form-label">Employee Code</Label>
                            <Input
                              name="empcode"
                              className="form-control"
                              placeholder="Enter Your Employee Code"
                              type="number"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.empcode || ""}
                              autoComplete="username"
                            />
                          </div>
                          <div className="mb-4">
                            <Label className="form-label">Password</Label>
                            <div
                              className="d-flex align-items-center position-relative"
                              style={{
                                border: "1px solid #000000",
                                borderRadius: "4px",
                              }}
                            >
                              <Input
                                name="password"
                                value={validation.values.password || ""}
                                type={passwordVisible ? "text" : "password"}
                                placeholder="Enter Your Password"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                style={{
                                  border: "none",
                                  outline: "none",
                                  paddingRight: "40px",
                                  flex: 5,
                                }}
                                autoComplete="current-password"
                              />
                              <button
                                type="button"
                                style={{
                                  flex: 0.5,
                                  backgroundColor: "transparent",
                                }}
                                onClick={() =>
                                  setPasswordVisible(!passwordVisible)
                                }
                              >
                                {passwordVisible ? (
                                  <AiFillEye size={24} color="black" />
                                ) : (
                                  <AiFillEyeInvisible size={24} color="black" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="d-grid mt-3">
                            {/* <button
                              className="btn btn-primary waves-effect waves-light"
                              type="submit"
                              disabled={isPending}
                            >
                              {isPending ? "Loading..." : "Log In"}
                            </button> */}
                            <button
                              className="btn btn-primary waves-effect waves-light"
                              type="submit"
                              disabled={isPending || remainingTime > 0}
                            >
                              {remainingTime > 0
                                ? `Try again in ${formatTime(remainingTime)}`
                                : isPending
                                  ? "Loading..."
                                  : "Log In"}
                            </button>
                          </div>
                        </Col>
                        <Col className="col-12 mt-3 d-flex justify-content-center">
                          <div className="text-md-end mt-3 mt-md-0">
                            <button
                              className="btn btn-link text-muted"
                              onClick={navigateToForgotPassword}
                            >
                              <i className="mdi mdi-lock"></i> Forgot your password?
                            </button>
                          </div>
                        </Col>

                      </Row>
                    </Form>
                  </div>
                </CardBody>
              </Card>

              <SocialMediaLinks />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Login;
