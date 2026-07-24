/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { LEAD_FEEDBACK_DATA_ALL } from "../../helpers/url_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { MdMobileFriendly } from "react-icons/md";
import "../CSS/styles.css";
import ApiClient from "../../helpers/api_helper";
import { formatDateForInput, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function LeadFeedbackReport() {
  const LIMIT = 100;
  const [page, setPage] = useState(1)
  const [flag, setFlag] = useState(false)

  const INITIALSTATE = {
    fromDate: "",
    toDate: "",
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [pending, setIsPending] = useState(false);
  const [leadData, setLeadData] = useState([]);
  const [searchByGroupSelect, setselectedSearchGroupSelect] = useState(null);
  const [formState, setFormState] = useState(INITIALSTATE);
  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);

  function handleSearchByTypeSelectGroup(selectedGroup) {
    setselectedSearchGroupSelect(selectedGroup);
  }

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Id</span>,
      selector: (row) => row.transferToAssociate,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.transferToAssociate}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Mobile No.</span>,
      selector: (row) => row.leadMobile,
      sortable: true,
      cell: (row) => (
        <div className="phone-container">
          <MdMobileFriendly
            className="phone-icon"
            color={defaultTheme.goldColorLogo}
          />
          <span className="phone-number">{row.leadMobile}</span>
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Name</span>,
      selector: (row) => row.leadName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.leadName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Project</span>,
      selector: (row) => row.project,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.project}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Project Category</span>,
      selector: (row) => row.projectCategory,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.projectCategory}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Status</span>,
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.status}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Feedback</span>,
      selector: (row) => row.status2,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.status2}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
      selector: (row) => row.createdDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      selector: (row) => row.remark,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.remark}</WordWrapCell>,
      width: "30%"
    },
  ];

  useEffect(() => {
    if (accessGranted) {
      getFromToDate();
    }
  }, [accessGranted]);

  const getFromToDate = () => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the month
    setFormState((prevState) => ({
      ...prevState,
      fromDate: "2024-01-01",
      toDate: formatDateForInput(endOfMonth),
    }));
    getLeadDetails(
      `${LEAD_FEEDBACK_DATA_ALL}${"2024-01-01"}&toDate=${formatDateForInput(endOfMonth)}&offset=${page - 1}&limit=${LIMIT}`);
  };

  const getLeadDetails = (url) => {
    setIsPending(true);
    ApiClient.get(url)
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          const encryptedContent = response.data.data;
          decryptData(encryptedContent).then((decrypted) => {
            setLeadData(decrypted);
          }).catch((error) => {
            setLeadData([]);
          });
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message);
      });
  };

  const sortByTypeGroup = [
    { label: 'Associate ID', value: 'employeeCode' },
    { label: 'Client Name', value: 'clientName' },
  ]

  const handleShowData = (event) => {
    event.preventDefault();
    setPage(1);
    let apiUrl = `${LEAD_FEEDBACK_DATA_ALL}${formState.fromDate}&toDate=${formState.toDate}&offset=${page - 1}&limit=${LIMIT}`;

    if (searchByGroupSelect && searchByGroupSelect.value) {
      apiUrl += `&filter=${searchByGroupSelect.value}&value=${searchTerm}`;
    }

    getLeadDetails(apiUrl);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handlePaginationData = () => {
    let apiUrl = `${LEAD_FEEDBACK_DATA_ALL}${formState.fromDate
      }&toDate=${formState.toDate}&offset=${page - 1
      }&limit=${LIMIT}`;

    if (searchByGroupSelect && searchByGroupSelect.value) {
      apiUrl += `&filter=${searchByGroupSelect.value}&value=${searchTerm}`;
    }

    getLeadDetails(apiUrl);
  };

  useEffect(() => {
    if (flag) {
      handlePaginationData();
    }
  }, [page]);

  const handleClearData = () => {
    getFromToDate();
    setselectedSearchGroupSelect(null);
    setSearchTerm("");
    setLeadData([])
  };

  // const downloadLeadExcel = () => {
  //   setIsPending(true)
  //   ApiClient.get(`${EXCEL_DOWNLOAD_LEAD_FEEDBACK}${formState?.fromDate}&toDate=${formState?.toDate}`, { responseType: "arraybuffer" })
  //     .then(function (response) {
  //       setIsPending(false)
  //       // Check if the response is an Excel file
  //       const contentType = response.headers["content-type"];

  //       if (
  //         contentType !==
  //         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  //       ) {
  //         // Assuming the response is an error response
  //         const errorResponse = new TextDecoder("utf-8").decode(
  //           new Uint8Array(response.data)
  //         );
  //         const parsedError = JSON.parse(errorResponse);

  //         // Check if it has the expected structure
  //         if (parsedError.status === 0) {
  //           toast.error(parsedError.message || "Something went wrong!");
  //         } else {
  //           toast.error("Unexpected error occurred!");
  //         }
  //         return;
  //       }

  //       // Proceed to download the Excel file
  //       const blob = new Blob([response.data], {
  //         type: contentType,
  //       });
  //       const link = document.createElement("a");
  //       link.href = window.URL.createObjectURL(blob);
  //       link.download = "lead_feedback_data.xlsx";
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //     })
  //     .catch(function (error) {
  //       setIsPending(false)
  //       toast.error(error.message || "An unexpected error occurred.");
  //     });
  // };

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'lead-feedback-list');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Admin Associate" breadcrumbItem="Lead Feedback" />
      {(pending) && <ScreenLoader />}
      <Container fluid={true}>
        <form onSubmit={handleShowData}>
          <Card>
            <CardBody>
              <Row className="g-3">
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
                    isClearable
                    value={searchByGroupSelect}
                    onChange={(selectedGroup) => { handleSearchByTypeSelectGroup(selectedGroup); }}
                    options={sortByTypeGroup}
                  />
                </Col>
                <Col lg="3">
                  <h6 className=" font-size-12">Search</h6>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Type to search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>

                <Col lg="3" className="d-flex align-items-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleShowData}
                  >
                    Show Data
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={handleClearData}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>

        {/* {leadData?.content?.length > 0 && (
          <i
            className="fas fa-file-excel"
            style={{
              color: defaultTheme.primary,
              cursor: "pointer",
              fontSize: "16px",
            }}
            onClick={downloadLeadExcel}
          ></i>
        )} */}

        {leadData?.content?.length > 0 && (
          <AppTable
            progressPending={pending}
            columns={columns}
            data={leadData?.content}
            pagination
            paginationTotalRows={leadData?.totalElements}
            paginationServer
            onChangePage={(newPage) => {
              setPage(newPage)
              setFlag(true)
            }}

          />
        )}
      </Container>
    </PageContent>
  );
}
