import React, { useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useNavigate } from "react-router-dom";
import { defaultTheme } from "../../helpers/defaultTheme";

export default function AnextureList() {
  const navigate = useNavigate();

  // Initial form state
  const initialFormState = {
    selectAssociate: null,
    fromDate: "",
    toDate: "",
    searchBy: null,
    searchQuery: "",
  };

  const [formState, setFormState] = useState(initialFormState);

  // Options for Select components
  const searchOptions = [
    { label: "Email", value: "Email" },
    { label: "Mobile Number", value: "Mobile Number" },
    { label: "Name", value: "Name" },
    { label: "User ID", value: "User ID" },
  ];

  // Column definitions for AppTable
  const columns = [
    {
      name: <span className="font-weight-bold fs-13">Manage</span>,
      sortable: true,
      cell: (row) => (
        <i
          className="ri-pencil-fill align-bottom me-2 text-muted"
          onClick={() => navigate("/add-anexture")}
          style={{ cursor: "pointer" }}
        ></i>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">MRN Id</span>,
      selector: (row) => row.projectName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">KYC Status</span>,
      selector: (row) => row.projectName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Name</span>,
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Client Team</span>,
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Team</span>,
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      selector: (row) => row.status,
      sortable: true,
    }
  ];

  // Sample row data for the table
  const rowData = [
    { id: 1, builderName: "3C", projectName: "3Cs Lotus Panache", status: 0 },
    {
      id: 2,
      builderName: "ABA",
      projectName: "Aba Cleo County 121",
      status: 1,
    },
    // More data...
  ];

  // Handler functions
  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSelectChange = (selectedOption, actionMeta) => {
    setFormState((prevState) => ({
      ...prevState,
      [actionMeta.name]: selectedOption,
    }));
  };

  const handleSearchChange = (e) => {
    setFormState((prevState) => ({
      ...prevState,
      searchQuery: e.target.value,
    }));
  };

  const handleManageUser = () => {
    navigate("/add-anexture");
  };


  return (
    <React.Fragment>
      <div className="page-content">
        <Breadcrumbs title="Associate" breadcrumbItem="Revenue List" />
        <Container fluid={true}>
          <form>
            <Card>
              <CardBody>
                <Row>
                  <Col lg="4">
                    <h6 className="font-size-11">Select Associate</h6>
                    <Select
                      style={{ zIndex: 9999 }}
                      menuPortalTarget={document.body}
                      name="selectAssociate"
                      value={formState.selectAssociate}
                      onChange={handleSelectChange}
                      options={searchOptions}
                    />
                  </Col>
                  <Col md="4">
                    <h6 className="font-size-11">From Date</h6>
                    <input
                      id="fromDate"
                      className="form-control"
                      type="date"
                      value={formState.fromDate}
                      onChange={handleFormChange}
                    />
                  </Col>
                  <Col md="4">
                    <h6 className="font-size-11">To Date</h6>
                    <input
                      id="toDate"
                      className="form-control"
                      type="date"
                      value={formState.toDate}
                      onChange={handleFormChange}
                    />
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col lg="6">
                    <h6 className="font-size-11">Search By</h6>
                    <Select
                      style={{ zIndex: 9999 }}
                      menuPortalTarget={document.body}
                      name="searchBy"
                      value={formState.searchBy}
                      onChange={handleSelectChange}
                      options={searchOptions}
                    />
                  </Col>
                  <Col lg="6">
                    <h6 className="font-size-11">Search</h6>
                    <input
                      className="form-control"
                      value={formState.searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Type to search..."
                    />
                  </Col>
                  <Col lg="12" className="mb-3 mt-3">
                    <button type="button" className="btn btn-primary">
                      Show Data
                    </button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </form>

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
          <AppTable columns={columns} data={rowData} pagination />
        </Container>
      </div>
    </React.Fragment>
  );
}
