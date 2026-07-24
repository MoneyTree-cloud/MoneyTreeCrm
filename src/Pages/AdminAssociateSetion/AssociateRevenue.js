/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet, usePut } from "../../Hooks/useApi";
import { ASSOCIATE_REVENUE_EXCEL, CHANGE_REVENUE_STATUS, GET_ALL_ASSOCIATE_REVEUE, } from "../../helpers/url_helper";
import { useNavigate } from "react-router-dom";
import { formatDate, formatDateForInput } from "../../helpers/function_helper";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import { MdMobileFriendly } from "react-icons/md"; // Import the mobile icon
import "../CSS/styles.css"; // Import your CSS file
import ScreenLoader from "../../constants/ScreenLoader";
import ApiClient from "../../helpers/api_helper";
import * as XLSX from "xlsx";

export default function AssociateRevenue() {
  const userId = useUserStore((state) => state.user.userId);
  const navigation = useNavigate();
  const INITIALSTATE = {
    reportType: null,
    fromDate: "",
    toDate: "",
    searchBy: null,
    search: "",
  };
  const [formState, setFormState] = useState(INITIALSTATE);
  const [revenueId, setRevenueId] = useState("");
  const [rowStatus, setRowStatus] = useState(0);
  const LIMIT = 100;
  const [flag, setFlag] = useState(false);
  const [page, setPage] = useState(1);
  const [apiUrl, setApiUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isPending: addLoadingPut, mutate } = usePut(
    `${CHANGE_REVENUE_STATUS}${revenueId}&status=${rowStatus}&login=${userId}`,
    {
      onSuccess: (response) => {
        setRevenueId("");
        setRowStatus("");
        setIsModalOpen(false);
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          getProjectData();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        setRevenueId("");
        setIsModalOpen(false);
        setRowStatus("");
        toast.error(err.message);
      },
    }
  );

  const { data: revenueList, isLoading, refetch: getProjectData, } = useGet(apiUrl, { enabled: Boolean(apiUrl), });

  const getFromToDate = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setFormState((prevState) => ({
      ...prevState,
      fromDate: formatDateForInput(start),
      toDate: formatDateForInput(end),
    }));
    setApiUrl(
      `${GET_ALL_ASSOCIATE_REVEUE}fromdate=${formatDateForInput(
        start
      )}&todate=${formatDateForInput(
        end
      )}&sortField=entry_date&sortType=desc&page=${page - 1}&size=${LIMIT}`
    );
  };

  useEffect(() => {
    getFromToDate();
  }, []);

  const reportTypeGroup = [
    { label: "Associate ID", value: "associateId" },
    { label: "Builder Name", value: "builderName" },
    { label: "Project Name", value: "projectName" },
    { label: "Mobile Number", value: "phoneNo" },
    { label: "Client Name", value: "clientName" },
    // { label: "Prospect ID", value: "prospectId" },
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

  const optionsArray = [
    { value: "0", label: "Select" },
    { value: "1", label: "Accept" },
    { value: "2", label: "Reject" },
    { value: "3", label: "Cancel" },
  ];

  const handleStatusChange = (row, status) => {
    // Implement your logic for handling the status change
    setRowStatus(status);
    setRevenueId(row.id);
    setIsModalOpen(true);
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">Approved</span>,
      cell: (row) => (
        <select
          disabled={row.appStatus === 1 ? true : false}
          value={row.appStatus || ""}
          onChange={(e) => handleStatusChange(row, e.target.value)} // Handle status change
          style={{
            padding: "3px",
            color:
              row.appStatus === 1
                ? defaultTheme.primary
                : row.appStatus === 2
                  ? defaultTheme.redColor
                  : row.appStatus === 3
                    ? defaultTheme.btnEnable
                    : null,
          }}
        >
          {optionsArray.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ),
      sortable: true,
      width: "4%",
    },
    {
      name: <span className="font-weight-bold fs-13">Manage</span>,
      width: "3%",
      cell: (row) => (
        <i
          className="ri-pencil-fill align-bottom me-2"
          onClick={() => handleRevenueForm(row)}
          style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
        ></i>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Id</span>,
      selector: (row) => row.associateId,
      sortable: true,
      width: "4%",
    },
    {
      name: <span className="font-weight-bold fs-13">Entry Date</span>,
      selector: (row) => formatDate(row.entryDate),
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Name</span>,
      selector: (row) => row.associateName,
      width: "8%",
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.associateName}
        </div>
      ),
    },
    // {
    //   name: <span className="font-weight-bold fs-13">Main Team</span>,
    //   selector: (row) => row.mainTeam,
    //   sortable: true,
    //   cell: (row) => (
    //     <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
    //       {row.mainTeam}
    //     </div>
    //   ),
    // },
    // {
    //   name: <span className="font-weight-bold fs-13">Sub Team</span>,
    //   selector: (row) => row.subTeam,
    //   sortable: true,
    //   cell: (row) => (
    //     <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
    //       {row.subTeam}
    //     </div>
    //   ),
    // },
    // {
    //   name: <span className="font-weight-bold fs-13">Asso Location</span>,
    //   selector: (row) => row.associateLocation,
    //   sortable: true,
    //   cell: (row) => (
    //     <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
    //       {row.associateLocation}
    //     </div>
    //   ),
    // },
    {
      name: <span className="font-weight-bold fs-13">Builder</span>,
      selector: (row) => row.builderName,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.builderName}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Project</span>,
      selector: (row) => row.projectName,
      sortable: true,
      width: "10%",
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.projectName}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.clientName,
      width: "8%",
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.clientName}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Booked with Name</span>,
      selector: (row) => row.revenueBookedName,
      sortable: true,
      width: "8%",
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.revenueBookedName}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Mobile Number</span>,
      width: "4%",
      selector: (row) => row.phoneNo,
      sortable: true,
      cell: (row) => (
        <div className="phone-container">
          <MdMobileFriendly
            className="phone-icon"
            color={defaultTheme.goldColorLogo}
          />
          <span className="phone-number">{row.phoneNo}</span>
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Unit No.</span>,
      sortable: true,
      selector: (row) => row.unitNo,
      width: "10%",
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.unitNo}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Manual Unit No.</span>,
      selector: (row) => row.manualUnitNo,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.manualUnitNo}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Area</span>,
      selector: (row) => row.area,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.area}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Booking Type</span>,
      selector: (row) => row.bookingType,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.bookingType}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Total Revenue</span>,
      selector: (row) => row.totalRevenue,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.totalRevenue}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Over And Above</span>,
      selector: (row) => row.overAbove,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.overAbove}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Commission</span>,
      selector: (row) => row.lessCommission,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.lessCommission}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">On Form Disc.</span>,
      selector: (row) => row.lessOnFormDisc,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.lessOnFormDisc}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Net Revenue</span>,
      selector: (row) => row.netRevenue,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.netRevenue}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Incentive</span>,
      selector: (row) => row.incentive,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.incentive}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Broker Details</span>,
      selector: (row) => row.brokerDetails,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.brokerDetails}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Share Status</span>,
      selector: (row) => row.bookingShareStatus,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.bookingShareStatus}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Share %</span>,
      selector: (row) => row.sharingPercentage,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.sharingPercentage}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Share Main Team</span>,
      selector: (row) => row.sharingMainTeam,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.sharingMainTeam}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Share Associate</span>,
      selector: (row) => row.sharingAssociateName,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.sharingAssociateName + ' (' + row.sharingAssociateNameId + ')'}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Share Details</span>,
      selector: (row) => row.shareDetails,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.shareDetails}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Prospect ID</span>,
      selector: (row) => row.prospectId,
      sortable: true,
      width: "8%",
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.prospectId}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      selector: (row) => row.remarks,
      width: "15%",
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.remarks}
        </div>
      ),
    },
  ];

  const handleRevenueForm = (row) => {
    navigation("/associate-revenue/add-revenue", { state: { rowData: row } });
  };

  const handleShowData = () => {
    if (formState.searchBy && !formState.search) {
      toast.error("Please Input Text To Serach");
    } else {
      setPage(1);
      setApiUrl(
        `${GET_ALL_ASSOCIATE_REVEUE}fromdate=${formState.fromDate}&todate=${formState.toDate
        }&sortField=entry_date&sortType=desc&page=${page - 1}&size=${LIMIT}${formState.searchBy
          ? `&key=${formState?.searchBy?.value}&value=${formState?.search}`
          : ""
        }`
      );
    }
  };

  const handlePaginationData = () => {
    setApiUrl(
      `${GET_ALL_ASSOCIATE_REVEUE}fromdate=${formState.fromDate}&todate=${formState.toDate
      }&sortField=entry_date&sortType=desc&page=${page - 1}&size=${LIMIT}${formState.searchBy
        ? `&key=${formState?.searchBy?.value}&value=${formState?.search}`
        : ""
      }`
    );
  };

  useEffect(() => {
    if (flag) {
      handlePaginationData();
    }
  }, [page]);

  const confirmStatusChange = () => {
    setIsModalOpen(false);
    if (revenueId) {
      mutate();
    }
  };

  const handleClearData = () => {
    setFormState((prevState) => ({
      ...prevState,
      reportType: null,
      searchBy: null,
      search: "",
    }));
    getFromToDate();
  };

  const downloadAllDataExcel = () => {
    ApiClient.get(ASSOCIATE_REVENUE_EXCEL, { responseType: "arraybuffer" })
      .then(function (response) {
        if (response.data.status === 0) {
          toast.error(response.data.message);
          return;
        }
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "associate_revenue.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(function (error) {
        toast.error(error.message);
      });
  };

  const downloadFilterDataExcel = () => {
    const url = `${GET_ALL_ASSOCIATE_REVEUE}fromdate=${formState.fromDate
      }&todate=${formState.toDate}&sortField=entry_date&sortType=desc&page=${page - 1
      }&size=${revenueList?.data?.data?.totalElements}${formState.searchBy
        ? `&key=${formState?.searchBy?.value}&value=${formState?.search}`
        : ""
      }`;
    ApiClient.get(url)
      .then(function (response) {
        if (response.data.status === 1) {
          const data = response?.data?.data?.content;
          // Ensure the data is not empty
          if (!Array.isArray(data) || data.length === 0) return;

          // 1. Extract the keys from the first object as the headers
          const headers = Object.keys(data[0]);

          // 2. Convert the data into a format compatible with the Excel file
          const formattedData = data.map((item) => {
            return headers.map((header) => item[header]);
          });

          // 3. Add the headers as the first row in the data
          const finalData = [headers, ...formattedData];

          // 4. Create a worksheet from the final data
          const ws = XLSX.utils.aoa_to_sheet(finalData);

          // 5. Create a workbook and append the worksheet
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Associate Revenue");

          // 6. Write the file and trigger download
          XLSX.writeFile(wb, "filtered_associate_revenue.xlsx");
          return;
        } else {
          toast.error(response.data.message);
          return;
        }
      })
      .catch(function (error) {
        toast.error(error.message);
      });
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Breadcrumbs title="Associate" breadcrumbItem="Revenue List" />
        {(addLoadingPut || isLoading) && <ScreenLoader />}
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
                  <h6 className="font-size-11">Search By</h6>
                  <Select
                    value={formState.searchBy}
                    onChange={(selectedOption) =>
                      handleSelectChange("searchBy", selectedOption)
                    }
                    options={reportTypeGroup}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">Search</h6>
                  <input
                    className="form-control"
                    id="search"
                    type="text"
                    placeholder="Type here..."
                    value={formState.search}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col lg="4 mt-3">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleShowData}
                  >
                    Show Data
                  </button>

                  <button
                    type="button"
                    color="secondary"
                    className="btn btn-primary ms-3"
                    onClick={handleClearData}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* <i
            className="fas fa-plus mb-3 ms-1"
            style={{
              color: defaultTheme.primary,
              cursor: "pointer",
              fontSize: "15px",
            }}
            onClick={() => handleRevenueForm({})}
          ></i> */}
          <div
            className="d-flex align-items-center"
            style={{ marginLeft: "20px", gap: "20px", marginBottom: "20px" }}
          >
            <i
              className="fas fa-file-excel"
              style={{
                color: defaultTheme.primary,
                cursor: "pointer",
                fontSize: "15px",
              }}
              onClick={downloadAllDataExcel}
            ></i>

            <i
              className="fas fa-file-excel"
              style={{
                color: defaultTheme.primary,
                cursor: "pointer",
                fontSize: "15px",
              }}
              onClick={downloadFilterDataExcel}
            ></i>
          </div>

          <AppTable
            progressPending={isLoading}
            columns={columns}
            data={
              Array.isArray(revenueList?.data?.data?.content)
                ? revenueList?.data?.data?.content
                : []
            }
            pagination
            paginationTotalRows={revenueList?.data?.data?.totalElements}
            paginationServer
            onChangePage={(newPage) => {
              setPage(newPage);
              setFlag(true);
            }}

            conditionalRowStyles={[
              {
                when: (row) => row.appStatus === 1,
                style: {
                  color: defaultTheme.primary,
                },
              },
              {
                when: (row) => row.appStatus === 2,
                style: {
                  color: defaultTheme.redColor,
                },
              },
              {
                when: (row) => row.appStatus === 3,
                style: {
                  color: defaultTheme.btnEnable,
                },
              },
            ]}
          />
        </Container>
      </div>
      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(!isModalOpen)}>
        <ModalHeader toggle={() => setIsModalOpen(!isModalOpen)}>
          Confirm Status Change
        </ModalHeader>
        <ModalBody>Are you sure you want to change the status?</ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            style={{ backgroundColor: defaultTheme.primary }}
            onClick={confirmStatusChange}
          >
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
}
