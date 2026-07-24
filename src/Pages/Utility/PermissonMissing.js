import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";

const PermissionMissing = () => {
  return (
    <React.Fragment>
      <div className="py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={6} md={8} xl={5}>
              <div className="text-center mt-sm-5 mb-4">
                <h5 className="mt-3 font-weight-bold">Permission Required</h5>

                <div className="mt-5">
                  <div className="mb-4">
                    <i className="ri-tools-fill display-3 text-primary"></i>
                  </div>
                  <h4 className="font-weight-bold font-size-15">
                    You need administrative permissions to access this page.
                    Please contact your system administrator to request the
                    necessary permissions.
                  </h4>
                  <p className="font-size-15">
                    If you believe you should have access or if this is an
                    error, please reach out to support.
                    {/* at{" "}
                    <a href="mailto:support@moneytree.com">support@example.com</a>
                    . */}
                  </p>

                  <div className="mt-4 pt-2">
                    <Link to="/" className="btn btn-primary">
                      Back to Home
                    </Link>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PermissionMissing;
