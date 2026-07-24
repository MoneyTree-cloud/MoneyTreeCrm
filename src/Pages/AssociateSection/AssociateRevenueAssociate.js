/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet, usePut } from "../../Hooks/useApi";
import {CHANGE_REVENUE_STATUS,GET_ALL_ASSOCIATE_REVEUE} from "../../helpers/url_helper";
import { useNavigate } from "react-router-dom";
import { formatDate, formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import "../CSS/styles.css"; // Import your CSS file
import ScreenLoader from "../../constants/ScreenLoader";

export default function AssociateRevenueAssociate() {
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
  const [page, setPage] = useState(1);
  const [apiUrl, setApiUrl] = useState(null);
  const [flag, setFlag] = useState(false);

  const { isPending: addLoadingPut, mutate } = usePut(
    `${CHANGE_REVENUE_STATUS}${revenueId}&status=${rowStatus}&login=${userId}`,
    {
      onSuccess: (response) => {
        setRevenueId("");
        setRowStatus("");
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          getProjectData();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        setRevenueId("");
        setRowStatus("");
        toast.error(err.message);
      },
    }
  );

  const {data: revenueList,isLoading,refetch: getProjectData,} = useGet(apiUrl, {enabled: Boolean(apiUrl),});

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
      `${GET_ALL_ASSOCIATE_REVEUE}assoId=${userId}&fromdate=${formatDateForInput(
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
    { label: "Prospect ID", value: "prospectId" },
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

  useEffect(() => {
    if (revenueId) {
      mutate();
    }
  }, [revenueId, mutate]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      sortable: true,
      width: "7%",
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Id</span>,
      selector: (row) => row.associateId,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.associateId}</WordWrapCell>,
      width: "10%",
    },
    {
      name: <span className="font-weight-bold fs-13">Entry Date</span>,
      selector: (row) => formatDate(row.entryDate),
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDate(row.entryDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Name</span>,
      selector: (row) => row.associateName,
      width: "15%",
      sortable: true,
      cell: (row) => <WordWrapCell>{row.associateName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Builder</span>,
      selector: (row) => row.builderName,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Project</span>,
      selector: (row) => row.projectName,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.clientName,
      width: "15%",
      sortable: true,
      cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Unit No.</span>,
      sortable: true,
      selector: (row) => row.unitId,
      cell: (row) => <WordWrapCell>{row.unitId}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Manual Unit No.</span>,
      selector: (row) => row.manualUnitNo,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.manualUnitNo}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      selector: (row) => row.remarks,
      width: "60%",
      sortable: true,
      cell: (row) => <WordWrapCell>{row.remarks}</WordWrapCell>
    },
  ];

  const handleRevenueForm = (row) => {
    navigation("/associate-revenue-associate/add-revenue-associate", {
      state: { rowData: row },
    });
  };

  const handleShowData = () => {
    if (formState.searchBy && !formState.search) {
      toast.error("Please Input Text To Serach");
    } else {
      setPage(1);
      setApiUrl(
        `${GET_ALL_ASSOCIATE_REVEUE}assoId=${userId}&fromdate=${formState.fromDate
        }&todate=${formState.toDate}&sortField=entry_date&sortType=desc&page=${page - 1
        }&size=${LIMIT}${formState.searchBy
          ? `&key=${formState?.searchBy?.value}&value=${formState?.search}`
          : ""
        }`
      );
    }
  };

  const handlePaginationData = () => {
    setApiUrl(
      `${GET_ALL_ASSOCIATE_REVEUE}assoId=${userId}&fromdate=${formState.fromDate
      }&todate=${formState.toDate}&sortField=entry_date&sortType=desc&page=${page - 1
      }&size=${LIMIT}${formState.searchBy
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

  const handleClearData = () => {
    setFormState((prevState) => ({
      ...prevState,
      reportType: null,
      searchBy: null,
      search: "",
    }));
    getFromToDate();
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
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
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
                    style={{ backgroundColor: defaultTheme.goldColorLogo }}
                    className="btn btn-primary ms-3"
                    onClick={handleClearData}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </CardBody>
          </Card>

          <i
            className="fas fa-plus mb-3 ms-1"
            style={{
              color: defaultTheme.primary,
              cursor: "pointer",
              fontSize: "15px",
            }}
            onClick={() => handleRevenueForm({})}
          ></i>

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

          />
        </Container>
      </div>
    </React.Fragment>
  );
}
