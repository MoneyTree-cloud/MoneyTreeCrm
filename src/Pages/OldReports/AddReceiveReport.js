import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  Container,
  Form,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Select from "react-select";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import { RequiredStar } from "../../helpers/function_helper";

const AddReceiveReport = () => {
  // Initialize state for form fields
  const [formData, setFormData] = useState({
    paymentType: null,
    receivePaymentType: null,
    paymentMode: null,
    selectData: null,
    date: "",
    amount: "",
    chequeNum: "",
    chequeDate: "",
    receiveType: null,
    builderName: null,
    projectName: null,
    associateName: null,
    clientName: "",
    unitNum: "",
    bankImprest: null,
    remarks: "",
  });

  // Handle change in form fields
  const handleChange = (e) => {
    const { id, value, type } = e.target;
    if (type === "date" || type === "text") {
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  // Handle Select change
  const handleSelectChange = (field) => (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [field]: selectedOption ? selectedOption.value : null,
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
      selectData: null,
      date: "",
      amount: "",
      chequeNum: "",
      chequeDate: "",
      receiveType: null,
      builderName: null,
      projectName: null,
      associateName: null,
      clientName: "",
      unitNum: "",
      bankImprest: null,
      remarks: "",
    });
  };

  // Options for select inputs
  const userTypeGroup = [
    { label: "Associate", value: "Associate" },
    { label: "Admin", value: "Admin" },
  ];

  return (
     <PageContent>
        <Container fluid={true}>
          <Breadcrumbs title="Report" breadcrumbItem="Add Receive Report" />
          <Row>
            <Col>
              <Card>
                <CardBody>
                  <Form className="needs-validation" onSubmit={handleSubmit}>
                    <Row>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 font-size-13">Select Type</h6>
                           <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                            value={userTypeGroup.find(
                              (option) => option.value === formData.paymentType
                            )}
                            onChange={handleSelectChange("paymentType")}
                            options={userTypeGroup}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 font-size-13">
                            Receive/Payment Type
                          </h6>
                           <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                            value={userTypeGroup.find(
                              (option) =>
                                option.value === formData.receivePaymentType
                            )}
                            onChange={handleSelectChange("receivePaymentType")}
                            options={userTypeGroup}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 font-size-13">
                            Receive From <RequiredStar/>
                          </h6>
                           <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                            value={userTypeGroup.find(
                              (option) => option.value === formData.paymentMode
                            )}
                            onChange={handleSelectChange("paymentMode")}
                            options={userTypeGroup}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 font-size-13">
                            Select Data <RequiredStar/>
                          </h6>
                           <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                            value={userTypeGroup.find(
                              (option) => option.value === formData.selectData
                            )}
                            onChange={handleSelectChange("selectData")}
                            options={userTypeGroup}
                          />
                        </FormGroup>
                      </Col>

                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 mt-2 font-size-13">
                            Date <RequiredStar/>
                          </h6>
                          <input
                            id="date"
                            className="form-control"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>

                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 mt-2 font-size-13">
                            Amount <RequiredStar/>
                          </h6>
                          <input
                            id="amount"
                            className="form-control"
                            type="text"
                            placeholder="Amount..."
                            value={formData.amount}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 mt-2 font-size-13">Cheque No</h6>
                          <input
                            id="chequeNum"
                            className="form-control"
                            placeholder="Cheque No"
                            type="text"
                            value={formData.chequeNum}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>

                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 mt-2 font-size-13">
                            Cheque Date
                          </h6>
                          <input
                            id="chequeDate"
                            className="form-control"
                            type="date"
                            value={formData.chequeDate}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>

                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 mt-2 font-size-13">
                            Receive Type <RequiredStar/>
                          </h6>
                           <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                            value={userTypeGroup.find(
                              (option) => option.value === formData.receiveType
                            )}
                            onChange={handleSelectChange("receiveType")}
                            options={userTypeGroup}
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 mt-2 font-size-13">
                            Builder Name
                          </h6>
                           <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                            value={userTypeGroup.find(
                              (option) => option.value === formData.builderName
                            )}
                            onChange={handleSelectChange("builderName")}
                            options={userTypeGroup}
                          />
                        </FormGroup>
                      </Col>

                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 mt-2 font-size-13">
                            Project Name
                          </h6>
                           <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                            value={userTypeGroup.find(
                              (option) => option.value === formData.projectName
                            )}
                            onChange={handleSelectChange("projectName")}
                            options={userTypeGroup}
                          />
                        </FormGroup>
                      </Col>

                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 mt-2 font-size-13">
                            Associate Name
                          </h6>
                           <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                            value={userTypeGroup.find(
                              (option) =>
                                option.value === formData.associateName
                            )}
                            onChange={handleSelectChange("associateName")}
                            options={userTypeGroup}
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 mt-2 font-size-13">
                            Client Name <RequiredStar/>
                          </h6>
                          <input
                            id="clientName"
                            className="form-control"
                            type="text"
                            placeholder="Client Name"
                            value={formData.clientName}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>

                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 mt-2 font-size-13">Unit No</h6>
                          <input
                            id="unitNum"
                            className="form-control"
                            placeholder="Unit Number"
                            type="text"
                            value={formData.unitNum}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>

                      <Col md="4">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 mt-2 font-size-13">
                            Bank Imprest
                          </h6>
                           <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                            value={userTypeGroup.find(
                              (option) => option.value === formData.bankImprest
                            )}
                            onChange={handleSelectChange("bankImprest")}
                            options={userTypeGroup}
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col md="12">
                        <FormGroup className="mb-3">
                          <h6 className="mb-1 mt-2 font-size-13">
                            Remarks <RequiredStar/>
                          </h6>
                          <textarea
                            id="remarks"
                            className="form-control"
                            rows="3"
                            placeholder="Remarks..."
                            value={formData.remarks}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col md="12" className="text-center mt-2">
                        <Button type="submit" color="primary">
                          Submit
                        </Button>
                        <Button
                          type="button"
                          color="secondary"
                          onClick={handleReset}
                          className="ms-2"
                          style={{
                            backgroundColor: defaultTheme.goldColorLogo,
                          }}
                        >
                          Reset
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
     </PageContent>
  );
};

export default AddReceiveReport;
