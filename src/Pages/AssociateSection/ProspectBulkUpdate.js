/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Select from "react-select";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet, usePost } from "../../Hooks/useApi";
import { GET_MY_TEAM, GET_PROSPECT_DATA_BY_ASSOCIATE_ID_NEW, PROSPECT_BULK_UPDATE } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { MdEmail, MdMobileFriendly } from "react-icons/md";
import { formatDate, WordWrapCell } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";
import { decryptData } from "../../components/Common/CryptoUtils";
import { FaSearch } from "react-icons/fa";

export default function ProspectBulkUpdate() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [updateDate, setUpdateDate] = useState("");
  const userId = useUserStore((state) => state.user.userId);
  const LIMIT = 100;
  const [page, setPage] = useState(1);
  const [flag, setFlag] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [prosData, setProsData] = useState([]);

  const initialFormState = {
    associateType: null,
    fromDate: "",
    toDate: "",
  };

  const [formState, setFormState] = useState(initialFormState);

  const { data: associateList, isLoading: loadingTeam } = useGet(GET_MY_TEAM + userId);

  const getProspectDetails = (url) => {
    setIsPending(true);
    ApiClient.get(url)
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          const encryptedContent = response.data.data;
          decryptData(encryptedContent).then((decrypted) => {
            setProsData(decrypted);
          }).catch((error) => {
            setProsData([]);
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

  useEffect(() => {
    getProsDetails()
  }, []); // Empty dependency array means this runs once when the component is mounted

  const getProsDetails = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // First day of the month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the month

    // Format dates for input fields
    const formatDateForInput = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    };

    // Set the calculated dates into the formState
    setFormState((prevState) => ({
      ...prevState,
      fromDate: formatDateForInput(startOfMonth),
      toDate: formatDateForInput(endOfMonth),
    }));

    // Fetch the prospect details
    getProspectDetails(
      `${GET_PROSPECT_DATA_BY_ASSOCIATE_ID_NEW}associateId=${formState?.associateType ? formState?.associateType?.value : userId
      }&fromDateStr=${formatDateForInput(startOfMonth)}&toDateStr=${formatDateForInput(endOfMonth)}&page=${page - 1
      }&size=${LIMIT}&allStatus=NO&key1=dueDate`
    );
  }

  const columns = [
    {
      name: (
        <input
          type="checkbox"
          checked={selectedRows.length === prosData?.content?.length}  // Check if all rows are selected
          onChange={(e) => handleSelectAll(e.target.checked)}  // Handle "Select All"
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.id)}  // Check if the row's prospectId is in selectedRows
          onChange={() => handleRowSelect(row.id)}  // Handle individual row selection
        />

      ),
      sortable: false,
      width: "4%",
    },
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      width: "5%",
      cell: (row, i) => <WordWrapCell>{i + 1}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Prospects Id</span>,
      selector: (row) => row.prospectId,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.prospectId}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      sortable: true,
      width: "20%",
      selector: (row) => row.associateName,
      cell: (row) => <WordWrapCell>{row.associateName + " (" + row.associateId + ")"}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Prospects Date</span>,
      selector: (row) => row.prosDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDate(row.prosDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Due Date</span>,
      sortable: true,
      selector: (row) => row.dueDate,
      cell: (row) => <WordWrapCell>{formatDate(row.dueDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Name</span>,
      selector: (row) => row.clientName,
      sortable: true,
      width: "12%",
      cell: (row) => <WordWrapCell> {row.clientName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Mobile No.</span>,
      width: "6%",
      selector: (row) => row.phoneNo,
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
      name: <span className="font-weight-bold fs-13">Client Budget</span>,
      sortable: true,
      width: '8%',
      cell: (row) => <WordWrapCell>{row.clientBudgetName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Task Timing</span>,
      sortable: true,
      width: "8%",
      selector: (row) => row.taskTimingRange,
      cell: (row) => <WordWrapCell>{row.taskTimingRange}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Address</span>,
      sortable: true,
      width: "18%",
      selector: (row) => row.clientAddress,
      cell: (row) => <WordWrapCell>{row.clientAddress}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Occupation</span>,
      sortable: true,
      width: "12%",
      selector: (row) => row.clientOccupation,
      cell: (row) => <WordWrapCell>{row.clientOccupation}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Email</span>,
      width: "7%",
      selector: (row) => row.clientEmail,
      cell: (row) =>
        row.clientEmail ? (
          <div className="phone-container">
            <MdEmail
              className="phone-icon"
              color={defaultTheme.goldColorLogo}
            />
            <span className="phone-number">{row.clientEmail}</span>
          </div>
        ) : null,
    },
    {
      name: <span className="font-weight-bold fs-13">Project</span>,
      sortable: true,
      width: "12%",
      selector: (row) => row.projectName,
      cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      selector: (row) => row.remarks,
      sortable: true,
      width: "100%",
      cell: (row) => <WordWrapCell>{row.remarks}</WordWrapCell>
    },
  ];

  function handleFormChange(event) {
    const { id, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  }

  function handleSelectChange(name) {
    return (selectedOption) => {
      setFormState((prevState) => ({
        ...prevState,
        [name]: selectedOption,
      }));
    };
  }

  function handleRowSelect(id) {
    setSelectedRows((prevSelectedRows) => {
      const newSelectedRows = [...prevSelectedRows];  // Create a new array to modify
      if (newSelectedRows.includes(id)) {
        // If already selected, remove it
        return newSelectedRows.filter(id_ => id_ !== id);
      } else {
        // Otherwise, add it to the array
        newSelectedRows.push(id);
        return newSelectedRows;
      }
    });
  }

  function handleSelectAll(isChecked) {
    if (isChecked) {
      setSelectedRows(prosData?.content?.map((row) => row.id));  // Select all rows
    } else {
      setSelectedRows([]);  // Deselect all rows
    }
  }

  const handleShowData = (e) => {
    e.preventDefault();
    getProspectDetails(
      `${GET_PROSPECT_DATA_BY_ASSOCIATE_ID_NEW}associateId=${formState?.associateType ? formState?.associateType?.value : userId
      }&fromDateStr=${formState?.fromDate}&toDateStr=${formState?.toDate
      }&page=${page - 1}&size=${LIMIT}&allStatus=NO&key1=dueDate`
    );
  };

  const { isPending: isPendingAdd, mutate: mutateUpdate } = usePost(
    PROSPECT_BULK_UPDATE,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getProspectDetails(
            `${GET_PROSPECT_DATA_BY_ASSOCIATE_ID_NEW}associateId=${formState?.associateType ? formState?.associateType?.value : userId
            }&fromDateStr=${formState?.fromDate}&toDateStr=${formState?.toDate
            }&page=${page - 1}&size=${LIMIT}&allStatus=NO&key1=dueDate`
          );
          setSelectedRows([])
          setUpdateDate("")
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handleUpdateDueDate = (e) => {
    e.preventDefault();
    if (selectedRows?.length < 1) {
      toast.error('Please Select Prospect To Update')
    }
    else if (!updateDate) {
      toast.error('Please Select Due Date To Update')
    }
    else {
      let params = {
        "prospectId": selectedRows,
        "dueDate": updateDate,
        "loginId": userId
      }
      mutateUpdate(params)
    }
  }

  const handlePaginationData = () => {
    getProspectDetails(
      `${GET_PROSPECT_DATA_BY_ASSOCIATE_ID_NEW}associateId=${formState?.associateType ? formState?.associateType?.value : userId
      }&fromDateStr=${formState?.fromDate}&toDateStr=${formState?.toDate
      }&page=${page - 1}&size=${LIMIT}&allStatus=NO&key1=dueDate`)
  }

  useEffect(() => {
    if (flag) {
      handlePaginationData();
    }
  }, [page]);

  return (
    <PageContent>
      <Breadcrumbs title="Associate Section" breadcrumbItem="Due Date Bulk Update" />
      {(loadingTeam || isPending || isPendingAdd) && <ScreenLoader />}
      <Container fluid={true}>
        <form onSubmit={handleShowData}>
          <Card>
            <CardBody>
              <Row className="g-3">
                <Col lg="3">
                  <h6 className="font-size-11">Select Associate</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    isClearable
                    menuPortalTarget={document.body}
                    value={formState.associateType}
                    onChange={handleSelectChange("associateType")}
                    options={Array.isArray(associateList?.data?.data) ? associateList?.data?.data : []}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">From Date</h6>
                  <input
                    className="form-control"
                    id="fromDate"
                    type="date"
                    value={formState.fromDate}
                    onChange={handleFormChange}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">To Date</h6>
                  <input
                    className="form-control"
                    id="toDate"
                    type="date"
                    value={formState.toDate}
                    onChange={handleFormChange}
                  />
                </Col>
                <Col
                  lg="3"
                  className="d-flex align-items-end"
                >
                  <button
                    type="submit"
                    className="btn btn-primary me-2"
                    onClick={handleShowData}
                  >
                    <FaSearch style={{ margin: '2px' }} />
                    Search
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={getProsDetails}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>
        <form onSubmit={handleUpdateDueDate}>
          <Card>
            <CardBody>
              <Row className="g-3">
                <Col lg="3">
                  <h6 className="font-size-11 mb-1">Due Date</h6>
                  <input
                    className="form-control"
                    id="updateDate"
                    type="date"
                    value={updateDate}
                    onChange={(e) => setUpdateDate(e.target.value)}
                  />
                </Col>
                <Col
                  lg="3"
                  className="d-flex align-items-end"
                >
                  <button
                    type="submit"
                    className="btn btn-primary me-2"
                    onClick={handleUpdateDueDate}
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setUpdateDate("")}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>
        <AppTable
          progressPending={isPending}
          columns={columns}
          data={prosData?.content}
          pagination
          paginationTotalRows={prosData?.totalElements}
          paginationServer
          onChangePage={(newPage) => {
            setPage(newPage);
            setFlag(true);
          }}

        />
      </Container>
    </PageContent>
  );
}