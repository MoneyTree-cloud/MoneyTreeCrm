import React, { useEffect } from "react";
import { Row, Col, CardBody, Card, Container, Form, Input, Label } from "reactstrap";
import { useFormik } from "formik";
import { usePut } from "../../Hooks/useApi";
import { RESET_PASSWORD } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { toast } from "react-toastify";
import { defaultTheme } from "../../helpers/defaultTheme";
import logo from "../../assets/images/Tree_transparent.png";
import { useNavigate } from "react-router-dom";
import SocialMediaLinks from "../../constants/SocialMediaLinks";
import { assetImageBaseUrl } from "../../helpers/api_helper";

const ForgetPasswordPage = (props) => {
    const navigation = useNavigate()
    const treeback = assetImageBaseUrl + 'logo.png';

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            empcode: "",
            email: "",
        },
    });

    useEffect(() => {
        document.body.className = "bg-pattern";
        return function cleanup() {
            document.body.className = "";
        };
    }, []);

    const handleResetPassword = () => {
        if (!validation.values.empcode) {
            toast.error("Please Enter Emp Code");
        } else if (!validation.values.email) {
            toast.error("Please Enter Personal Email");
        } else {
            mutateUpdate();
        }
    };

    const { isPending: isPendingReset, mutate: mutateUpdate } = usePut(
        RESET_PASSWORD + validation.values.empcode + "&email=" + validation.values.email,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    navigateToLogin()
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    const navigateToLogin = () => {
        navigation('/login')
    }

    return (
        <React.Fragment>
            {(isPendingReset) && <ScreenLoader />}
            <div className="account-pages my-4 pt-5">
                <Container>
                    <div>
                        <img src={treeback} className="treeback" alt="" />
                    </div>
                    <Row className="justify-content-end res">
                        <Col lg={6} md={8} xl={4}>
                            <Card>
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
                                            style={{
                                                color: defaultTheme.primary,
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Welcome Back !
                                        </p>
                                        <p
                                            className="mb-4 text-center"
                                            style={{ fontWeight: "bold" }}
                                        >
                                            Forgot your password?
                                        </p>
                                        <Form className="form-horizontal">
                                            <Row>
                                                <Col md={12}>
                                                    <div>
                                                        <Label className="form-label">Employee Code</Label>
                                                        <Input
                                                            name="empcode"
                                                            className="form-control"
                                                            placeholder="Enter Your Employee Code"
                                                            type="text"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.empcode || ""}
                                                        />

                                                        <Label className="form-label mt-2">Personal Email</Label>
                                                        <Input
                                                            name="email"
                                                            className="form-control"
                                                            placeholder="Enter Your Personal Email ID"
                                                            type="text"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.email || ""}
                                                        />
                                                    </div>
                                                    {/* {!userData && (
                                                        <div className="d-grid mt-5">
                                                            <button
                                                                className="btn btn-primary waves-effect waves-light"
                                                                type="submit"
                                                                disabled={isPending}
                                                            >
                                                                {isPending ? "Loading..." : "Show Email"}
                                                            </button>
                                                        </div>
                                                    )}
                                                    {userData && (
                                                        <div>
                                                            <div className="mb-4 mt-3">
                                                                <Label className="form-label">
                                                                    Email ID :{" "}
                                                                </Label>
                                                                <h9 className="form-label">
                                                                    {maskEmail(userData.email)}
                                                                </h9>
                                                            </div> */}
                                                    <div className="d-grid mt-3">
                                                        <button
                                                            className="btn btn-primary waves-effect waves-light"
                                                            type="button"
                                                            onClick={handleResetPassword}
                                                            disabled={isPendingReset}
                                                        >
                                                            {isPendingReset ? "Loading..." : "Reset Password"}
                                                        </button>
                                                    </div>
                                                    {/* </div>
                                                    )} */}
                                                </Col>
                                                <Col className="col-12 mt-3 d-flex justify-content-center">
                                                    <div className="text-md-end mt-3 mt-md-0">
                                                        <button
                                                            type="button"
                                                            className="btn btn-link text-muted"
                                                            onClick={navigateToLogin}
                                                        >
                                                            <i className="mdi mdi-lock"></i> Back To Login
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

export default ForgetPasswordPage;
