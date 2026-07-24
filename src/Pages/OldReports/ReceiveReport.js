import React, { useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useNavigate } from "react-router-dom";

export default function ReceiveReport() {
  // Define initial form state with specific keys for each input
  const navigation = useNavigate();
  const handleManageUser = () => {
    navigation("/receive-pay");
  };
  const [formState, setFormState] = useState({
    reportType: null,
    fromDate: "",
    toDate: "",
  });

  const reportTypeGroup = [
    { label: "Email", value: "Email" },
    { label: "Mobile Number", value: "Mobile Number" },
    { label: "Name", value: "Name" },
    { label: "User ID", value: "User ID" },
  ];

  function handleInputChange(event) {
    const { id, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  }

  function handleSelectChange(name, selectedOption) {
    setFormState((prevState) => ({
      ...prevState,
      [name]: selectedOption,
    }));
  }

  const rowData=[
    { prospectId: 1, builderName: "3C", status: 0 },
    { prospectId: 2, builderName: "ABA", status: 1 },
    { prospectId: 3, builderName: "ACE", status: 1 },
    { prospectId: 4, builderName: "AIMS", status: 0 },
    { prospectId: 5, builderName: "AJNARA", status: 1 },
    { prospectId: 6, builderName: "ATS", status: 1 },
    { prospectId: 7, builderName: "BHUTANI", status: 1 },
    { prospectId: 8, builderName: "COMPANY UNIT", status: 0 },
    { prospectId: 9, builderName: "CORBET NATURE CRAFT", status: 0 },
    { prospectId: 10, builderName: "ELAN GROUP", status: 1 },
    { prospectId: 11, builderName: "ELDECO", status: 1 },
    { prospectId: 12, builderName: "EXOTICA", status: 0 },
    { prospectId: 13, builderName: "EXPRESS BUILDERS", status: 0 },
    { prospectId: 14, builderName: "FAIRFOX", status: 1 },
    { prospectId: 15, builderName: "FUSION", status: 1 },
  ];

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL. No</span>,
      selector: (row) => row.builderName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">System Date</span>,
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Entry Date</span>,
      selector: (row) => row.builderName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Booking Date</span>,
      selector: (row) => row.builderName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Unique ID</span>,
      selector: (row) => row.builderName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">STS No</span>,
      selector: (row) => row.builderName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Received From</span>,
      selector: (row) => row.builderName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Customer Name</span>,
      selector: (row) => row.builderName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Name</span>,
      selector: (row) => row.builderName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name</span>,
      selector: (row) => row.builderName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      selector: (row) => row.builderName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Payment Type</span>,
      selector: (row) => row.builderName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Cheque No</span>,
      selector: (row) => row.builderName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Cheque Date</span>,
      selector: (row) => row.builderName,
      sortable: true,
    },
    {
      name: (
        <span className="font-weight-bold fs-13">Total Received Amount</span>
      ),
      selector: (row) => row.builderName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Received In</span>,
      selector: (row) => row.builderName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      selector: (row) => row.builderName,
      sortable: true,
    },
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Breadcrumbs title="Reports" breadcrumbItem="Receive Report" />
        <Container fluid={true}>
          <Card>
            <CardBody>
              <Row>
                <Col lg="3">
                  <h6 className="font-size-11">From Date</h6>
                  <input
                    className="form-control"
                    id="fromDate"
                    type="date"
                    placeholder="From Date"
                    value={formState.fromDate}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">To Date</h6>
                  <input
                    className="form-control"
                    id="toDate"
                    type="date"
                    placeholder="To Date"
                    value={formState.toDate}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">Report Type</h6>
                   <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                    value={formState.reportType}
                    onChange={(selectedOption) =>
                      handleSelectChange("reportType", selectedOption)
                    }
                    options={reportTypeGroup}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">Search</h6>
                  <input
                    className="form-control"
                    id="search"
                    type="text."
                    placeholder="Type here..."
                    value={formState.toDate}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col lg="3" className="mt-3 ms-3">
                  <button type="button" className="btn btn-primary">
                    Show Data
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary ms-3"
                    color="secondary"
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <div
            className="d-flex align-items-center"
            style={{ marginLeft: "20px", gap: "20px", marginBottom: "20px" }}
          >
            <i
              className="fas fa-plus"
              style={{
                color: defaultTheme.primary,
                cursor: "pointer",
                fontSize: "15px",
              }}
              onClick={handleManageUser}
            ></i>
            <i
              className="fas fa-file-excel"
              style={{
                color: defaultTheme.primary,
                cursor: "pointer",
                fontSize: "15px",
              }}
              onClick={() => alert("Excel download...")}
            ></i>
          </div>
          <AppTable
            // progressPending={isLoading}
            columns={columns}
            data={rowData || []}
            pagination
          />
        </Container>
      </div>
    </React.Fragment>
  );
}
