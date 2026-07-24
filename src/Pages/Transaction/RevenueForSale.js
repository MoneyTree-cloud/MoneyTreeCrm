import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useNavigate } from "react-router-dom";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet } from "../../Hooks/useApi";
import { formatDate, formatDateForInput } from "../../helpers/function_helper";
import {
  GET_ALL_SALE_DATA,
  REVENUE_FOR_SALE_EXCEL,
} from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import ApiClient from "../../helpers/api_helper";
import * as XLSX from "xlsx";

export default function RevenueForSale() {
  const navigate = useNavigate();
  const LIMIT = 100;
  const [page, setPage] = useState(1);
  const [flag, setFlag] = useState(false);

  // Initial form state
  const initialFormState = {
    selectType: null,
    fromDate: "",
    toDate: "",
  };
  const [apiUrl, setApiUrl] = useState(null);
  const [formState, setFormState] = useState(initialFormState);
  const [searchByGroupSelect, setselectedSearchGroupSelect] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: revenueData,
    refetch: getAllData,
    isLoading,
  } = useGet(apiUrl, { enabled: Boolean(apiUrl) });

  useEffect(() => {
    getFromToDate();
  }, []);

  const getFromToDate = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the month
    setFormState((prevState) => ({
      ...prevState,
      fromDate: formatDateForInput(startOfMonth),
      toDate: formatDateForInput(endOfMonth),
    }));
    setApiUrl(
      `${GET_ALL_SALE_DATA}?fromDateStr=${formatDateForInput(
        startOfMonth
      )}&toDateStr=${formatDateForInput(
        endOfMonth
      )}&sortField=created_date&sortType=desc&page=${
        page - 1
      }&size=${LIMIT}&saleStatus=NO`
    );
  };

  const sortByTypeGroup = [
    { label: "Unique ID", value: "saleId" },
    { label: "Client Name", value: "clientName" },
    { label: "Unit No.", value: "unitNo" },
  ];

  function handleSearchByTypeSelectGroup(selectedGroup) {
    setselectedSearchGroupSelect(selectedGroup);
  }

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">Manage</span>,
      sortable: true,
      width: "8%",
      cell: (row) => (
        <i
          className="ri-pencil-fill align-bottom me-2"
          onClick={() =>
            navigate("/revenue-for-sales/manage-revenue-for-sales", {
              state: { rowData: row },
            })
          }
          style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
        ></i>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Id</span>,
      selector: (row) => row.associateId,
      sortable: true,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Entry Date</span>,
      selector: (row) => formatDate(row.createdDate),
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {formatDate(row.createdDate)}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Name</span>,
      selector: (row) => row.associateName,
      width: "18%",
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.associateName}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Main Team</span>,
      selector: (row) => row.mainTeam,
      sortable: true,
      width: "15%",
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.mainTeam}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Sub Team</span>,
      selector: (row) => row.subTeam,
      sortable: true,
      width: "15%",
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.subTeam}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.clientName,
      sortable: true,
      width: "18%",
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.clientName}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Booked with Name</span>,
      selector: (row) => row.bookingName,
      sortable: true,
      width: "18%",
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.bookingName}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Unit No</span>,
      selector: (row) => row.unitNo,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.unitNo}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Manual Unit No</span>,
      selector: (row) => row.manualUnitNo,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.manualUnitNo}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      selector: (row) => row.remarks,
      sortable: true,
      width: "40%",
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.remarks}
        </div>
      ),
    },
  ];

  const handleShowData = () => {
    setPage(1);
    if (searchByGroupSelect && !searchTerm) {
      toast.error("Please Enter Value To Search");
      return;
    }
    let apiUrl = `${GET_ALL_SALE_DATA}?fromDateStr=${
      formState.fromDate
    }&toDateStr=${formState.toDate}&sortField=created_date&sortType=desc&page=${
      page - 1
    }&size=${LIMIT}&saleStatus=NO`;

    if (searchByGroupSelect && searchByGroupSelect.value) {
      apiUrl += `&key=${searchByGroupSelect.value}&value=${searchTerm}`;
    }
    setApiUrl(apiUrl);
  };

  const downloadAllDataExcel = () => {
    ApiClient.get(REVENUE_FOR_SALE_EXCEL, { responseType: "arraybuffer" })
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
        link.download = "revenue_for_sale.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(function (error) {
        toast.error(error.message);
      });
  };

  const downloadFilterDataExcel = () => {
    let apiUrl = `${GET_ALL_SALE_DATA}?fromDateStr=${
      formState.fromDate
    }&toDateStr=${formState.toDate}&sortField=created_date&sortType=desc&page=${
      page - 1
    }&size=${revenueData?.data?.data?.totalElements}&saleStatus=NO`;

    if (searchByGroupSelect && searchByGroupSelect.value) {
      apiUrl += `&key=${searchByGroupSelect.value}&value=${searchTerm}`;
    }

    ApiClient.get(apiUrl)
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
          XLSX.utils.book_append_sheet(wb, ws, "Revenue For Sale");

          // 6. Write the file and trigger download
          XLSX.writeFile(wb, "revenueForSaleFilterData.xlsx");
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

  // const downloadFilterDataExcel = () => {
  //   const data=revenueData?.data?.data?.content
  //   // Ensure the data is not empty
  //   if (!Array.isArray(data) || data.length === 0) return;

  //   // 1. Extract the keys from the first object as the headers
  //   const headers = Object.keys(data[0]);

  //   // 2. Convert the data into a format compatible with the Excel file
  //   const formattedData = data.map(item => {
  //     return headers.map(header => item[header]);
  //   });

  //   // 3. Add the headers as the first row in the data
  //   const finalData = [headers, ...formattedData];

  //   // 4. Create a worksheet from the final data
  //   const ws = XLSX.utils.aoa_to_sheet(finalData);

  //   // 5. Create a workbook and append the worksheet
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Revenue For Sale');

  //   // 6. Write the file and trigger download
  //   XLSX.writeFile(wb, 'revenueForSaleFilterData.xlsx');
  // };

  const handlePaginationData = () => {
    let apiUrl = `${GET_ALL_SALE_DATA}?fromDateStr=${
      formState.fromDate
    }&toDateStr=${formState.toDate}&sortField=created_date&sortType=desc&page=${
      page - 1
    }&size=${LIMIT}&saleStatus=NO`;

    if (searchByGroupSelect && searchByGroupSelect.value) {
      apiUrl += `&key=${searchByGroupSelect.value}&value=${searchTerm}`;
    }

    setApiUrl(apiUrl);
  };

  useEffect(() => {
    if (flag) {
      handlePaginationData();
    }
  }, [page]);

  const handleClear = () => {
    getFromToDate();
    setselectedSearchGroupSelect(null);
    setSearchTerm("");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Breadcrumbs
          title="Transaction"
          breadcrumbItem="Pending Revenue List"
        />
        {isLoading && <ScreenLoader />}
        <Container fluid={true}>
          <form>
            <Card>
              <CardBody>
                <Row>
                  <Col md="3">
                    <h6 className="font-size-11">From Date</h6>
                    <input
                      id="fromDate"
                      className="form-control"
                      type="date"
                      value={formState.fromDate}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md="3">
                    <h6 className="font-size-11">To Date</h6>
                    <input
                      id="toDate"
                      className="form-control"
                      type="date"
                      value={formState.toDate}
                      onChange={handleChange}
                    />
                  </Col>

                  <Col lg="3">
                    <h6 className="font-size-11">Search By</h6>
                     <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                      value={searchByGroupSelect}
                      onChange={(selectedGroup) => {
                        handleSearchByTypeSelectGroup(selectedGroup);
                      }}
                      options={sortByTypeGroup}
                    />
                  </Col>
                  <Col lg="3">
                    <h6 className=" font-size-12">Search</h6>
                    <input
                      className="form-control"
                      type="text"
                      required
                      placeholder="Type to search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Col>

                  <Col lg="3" className="align-items-center mt-3">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleShowData}
                    >
                      Show Data
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary ms-3"
                      color="secondary"
                      onClick={handleClear}
                    >
                      Clear
                    </button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </form>
          <div
            className="d-flex align-items-center"
            style={{ marginLeft: "10px", gap: "20px", marginBottom: "20px" }}
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
              Array.isArray(revenueData?.data?.data?.content)
                ? revenueData?.data?.data?.content
                : []
            }
            pagination
            paginationTotalRows={revenueData?.data?.data?.totalElements}
            paginationServer
            onChangePage={(newPage) => {
              setPage(newPage);
              setFlag(true);
            }}
              
          />
        </Container>
      </div>
    </React.Fragment>
  );
}
