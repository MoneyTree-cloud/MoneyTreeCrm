import React, { useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PageContent from "../../components/Common/PageContent";

export default function UploadUserData() {
  const [searchByAdminSelect, setselectedSearchAdminSelect] = useState(null);
  const sortByAdminGroup = [
    { label: "Email", value: "Email" },
    { label: "Mobile Number", value: "Mobile Number" },
    { label: "Name", value: "Name" },
    { label: "User ID", value: "User ID" },
  ];

  function handleSearchByAdminSelectGroup(selectedGroup) {
    setselectedSearchAdminSelect(selectedGroup);
  }

  return (
    <PageContent>
      <Breadcrumbs title="Upload" breadcrumbItem="User" />
      <Container fluid={true}>
        <Card>
          <CardBody>
            <Row>
              <Col lg="4">
                <h6 className="font-size-11">Select Admin</h6>
                <Select
                  style={{ zIndex: 9999 }}
                  menuPortalTarget={document.body}
                  value={searchByAdminSelect}
                  onChange={(selectedGroup) => {
                    handleSearchByAdminSelectGroup(selectedGroup);
                  }}
                  options={sortByAdminGroup}
                />
              </Col>
              <Col lg="4">
                <h6 className=" font-size-12">Choose File</h6>
                <input className="form-control" id="uploadFile" type="file" />
              </Col>

              <Col
                lg="4"
                className="d-flex justify-content-center align-items-center mt-3"
              >
                <div className="mb-3">
                  <button type="button" className="btn btn-info">
                    Upload Data
                  </button>
                </div>
                <div className="mb-3 ms-4 me-4">
                  <button type="button" className="btn btn-primary">
                    Format
                  </button>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>
    </PageContent>
  );
}
