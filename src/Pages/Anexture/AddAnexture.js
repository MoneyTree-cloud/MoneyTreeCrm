import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  Container,
  Form
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Select from "react-select";
import { RequiredStar } from "../../helpers/function_helper";

const AddAnexture = () => {
  // Initialize state for form fields
  const [formData, setFormData] = useState({
    paymentType: null,
    receivePaymentType: null,
    paymentMode: null,
    unit: "",
    clientName: "",
    associateName: "",
    projectName: "",
    remarks: "",
  });

  // Handle change in form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle select field change
  const handleSelectChange = (field) => (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [field]: selectedOption,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Process the formData object here
  };

  // Handle form reset
  const handleReset = () => {
    setFormData({
      paymentType: null,
      receivePaymentType: null,
      paymentMode: null,
      unit: "",
      clientName: "",
      associateName: "",
      projectName: "",
      remarks: "",
    });
  };

  // Options for select fields

  const statusTypeGroup = [
    { label: "Pending", value: "Pending" },
    { label: "Accepted", value: "Accepted" },
    { label: "In Process", value: "In Process" },
    { label: "Completed", value: "Completed" },
  ];

  const pendingFromTypeGroup = [
    { label: "Associate", value: "Associate" },
    { label: "Back Office", value: "Back Office" }
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="Anexture" breadcrumbItem="Add Anexture" />
          <Row>
            <Col>
              <Card>
                <CardBody>
                  <Form className="needs-validation" onSubmit={handleSubmit}>
                    <Row>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 font-size-13">
                            Status <RequiredStar/>
                          </h6>
                          <Select
                            style={{ zIndex: 9999 }}
                            menuPortalTarget={document.body}
                            value={formData.paymentType}
                            onChange={handleSelectChange("paymentType")}
                            options={statusTypeGroup}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 font-size-13">
                            Pending From <RequiredStar/>
                          </h6>
                          <Select
                            style={{ zIndex: 9999 }}
                            menuPortalTarget={document.body}
                            value={formData.receivePaymentType}
                            onChange={handleSelectChange("receivePaymentType")}
                            options={pendingFromTypeGroup}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 font-size-13">
                            Select Client <RequiredStar/>
                          </h6>
                          <Select
                            style={{ zIndex: 9999 }}
                            menuPortalTarget={document.body}
                            value={formData.paymentMode}
                            onChange={handleSelectChange("paymentMode")}
                            options={statusTypeGroup}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 mt-2 font-size-13">
                            Unit <RequiredStar/>
                          </h6>
                          <input
                            name="unit"
                            className="form-control"
                            placeholder="Unit"
                            type="text"
                            value={formData.unit}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 mt-2 font-size-13">
                            Client Name <RequiredStar/>
                          </h6>
                          <input
                            name="clientName"
                            className="form-control"
                            placeholder="Client Name"
                            type="text"
                            value={formData.clientName}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 mt-2 font-size-13">
                            Associate Name <RequiredStar/>
                          </h6>
                          <input
                            name="associateName"
                            className="form-control"
                            placeholder="Associate Name"
                            type="text"
                            value={formData.associateName}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 mt-2 font-size-13">
                            Project Name <RequiredStar/>
                          </h6>
                          <input
                            name="projectName"
                            className="form-control"
                            placeholder="Project Name"
                            type="text"
                            value={formData.projectName}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="8">
                        <h6 className="font-size-11">Remarks</h6>
                        <textarea
                          name="remarks"
                          className="form-control"
                          rows="5"
                          placeholder="Type here..."
                          value={formData.remarks}
                          onChange={handleChange}
                        ></textarea>
                      </Col>
                    </Row>
                    <FormGroup className="mb-0 mt-3">
                      <div>
                        <Button type="submit" color="primary" className="ms-1">
                          Submit
                        </Button>{" "}
                        <Button
                          type="button" // Changed from "reset" to "button"
                          color="secondary"
                          onClick={handleReset}
                        >
                          Cancel
                        </Button>
                      </div>
                    </FormGroup>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AddAnexture;
