/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import { CHANGE_SBI_STATUS, GET_ALL_USERS_DROPDOWN, UPLOAD_SBI_FILES_NON_SALES } from "../../helpers/url_helper";
import { formatDate, formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { useGet, usePost } from "../../Hooks/useApi";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { FaFilePdf } from "react-icons/fa";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import ImageModal from "../../components/Common/ImageModal";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

// Constants
const LIMIT = 100;
const SEARCH_BY_OPTIONS = [
  { label: "Project Name", value: "ProjectName" },
  { label: "Builder Name", value: "BuilderName" },
];
const STATUS_OPTIONS = [
  { label: "Select", value: 2 },
  { label: "Accept", value: 1 },
  { label: "Reject", value: 0 },
];
const TRANSACTION_TYPES = ["Pending", "Received"];

// Helper Functions
const getDefaultDateRange = () => {
  const now = new Date();
  // const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfMonth = '2024-01-01';
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    fromDate: formatDateForInput(startOfMonth),
    toDate: formatDateForInput(endOfMonth),
  };
};

const UploadSbiFiles = () => {
  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);
  const { data: associateList } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: !!accessGranted });

  // Consolidated state
  const [state, setState] = useState({
    form: {
      searchByAssociate: null,
      searchBy: null,
      textInput: "",
      fromDate: "",
      toDate: "",
    },
    table: {
      page: 1,
      data: [],
      totalElements: 0,
      isLoading: false,
    },
    modal: {
      data: null,
      isOpen: false,
      isStatusOpen: false,
      imageUrl: "",
      isImageOpen: false,
      transactionId: "",
      status: 2, // 2: Select, 1: Accept, 0: Reject
      remarks: "",
    },
    transactionType: "Pending",
  });

  // API hook for status change
  const { isPending, mutate: changeProofStatus } = usePost(
    `${CHANGE_SBI_STATUS}${state.modal.status}&transactionId=${state.modal.transactionId}&remarks=${state.modal.remarks}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          fetchSbiProofData();
          setState((prev) => ({
            ...prev,
            modal: {
              ...prev.modal,
              isStatusOpen: false,
              transactionId: "",
              status: 2,
              remarks: "",
            },
          }));
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
        setState((prev) => ({
          ...prev,
          modal: {
            ...prev.modal,
            isStatusOpen: false,
            transactionId: "",
            status: 2,
            remarks: "",
          },
        }));
      },
    }
  );

  // Initialize default date range
  useEffect(() => {
    const { fromDate, toDate } = getDefaultDateRange();
    setState((prev) => ({
      ...prev,
      form: { ...prev.form, fromDate, toDate },
      table: { ...prev.table, isLoading: true },
    }));
  }, []);

  // Fetch data when page or transaction type changes
  useEffect(() => {
    if (state.table.isLoading && accessGranted) {
      fetchSbiProofData();
    }
  }, [state.table.page, state.transactionType, state.table.isLoading, accessGranted]);

  // Build API URL
  const getApiUrl = () => {
    const { searchByAssociate, searchBy, textInput, fromDate, toDate } = state.form;
    let url = `${UPLOAD_SBI_FILES_NON_SALES}page=${state.table.page - 1}&size=${LIMIT}&enumUpload=UPLOADED&status=${state.transactionType}`;

    if (searchByAssociate?.value) {
      url += `&associateId=${searchByAssociate.value}`;
    }

    const textFilterSales = searchBy?.value || "SELECTALL";
    url += `&textFilterSales=${textFilterSales}`;

    if (textFilterSales !== "SELECTALL" && textInput) {
      url += `&textFilter=${encodeURIComponent(textInput)}`;
    }

    url += `&from=${fromDate}&to=${toDate}`;
    return url;
  };

  // Fetch SBI data
  const fetchSbiProofData = () => {
    setState((prev) => ({ ...prev, table: { ...prev.table, isLoading: true } }));
    ApiClient.get(getApiUrl())
      .then((response) => {
        if (response?.data?.status === 1) {
          setState((prev) => ({
            ...prev,
            table: {
              ...prev.table,
              data: response.data.data.data || [],
              totalElements: response.data.data.count || 0,
              isLoading: false,
            },
          }));
        } else {
          toast.error(response.data.message || "Failed to fetch data");
          setState((prev) => ({ ...prev, table: { ...prev.table, isLoading: false } }));
        }
      })
      .catch((error) => {
        toast.error(error.message || "An error occurred");
        setState((prev) => ({ ...prev, table: { ...prev.table, isLoading: false } }));
      });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setState((prev) => ({
      ...prev,
      form: { ...prev.form, [id]: value },
    }));
  };

  // Handle select changes
  const handleSelectChange = (name) => (selectedOption) => {
    setState((prev) => ({
      ...prev,
      form: { ...prev.form, [name]: selectedOption },
    }));
  };

  // Handle search form submission
  const handleShowData = (e) => {
    e.preventDefault();
    if (state.form.searchBy && !state.form.textInput) {
      toast.error('Input Value To Search')
      return;
    }
    else if (!state.form.searchBy && state.form.textInput) {
      toast.error('Select Value To Search')
      return;
    }
    setState((prev) => ({
      ...prev,
      table: { ...prev.table, page: 1, isLoading: true },
    }));
  };

  // Handle clear form
  const handleClear = () => {
    const { fromDate, toDate } = getDefaultDateRange();
    setState((prev) => ({
      ...prev,
      form: {
        searchByAssociate: null,
        searchBy: null,
        textInput: "",
        fromDate,
        toDate,
      },
      table: { ...prev.table, page: 1, isLoading: true },
    }));
  };

  // Handle transaction type change
  const handleRadioChange = (e) => {
    setState((prev) => ({
      ...prev,
      transactionType: e.target.value,
      table: { ...prev.table, page: 1, isLoading: true },
    }));
  };

  // Handle status change
  const handleStatusChange = (row, status) => {
    if (status !== "2") {
      setState((prev) => ({
        ...prev,
        modal: {
          ...prev.modal,
          transactionId: row.transactionId,
          status: parseInt(status),
          isStatusOpen: true,
        },
      }));
    }
  };

  // Confirm status change
  const confirmStatusChange = () => {
    if (!state.modal.remarks) {
      toast.error("Please enter remarks");
      return;
    }
    changeProofStatus();
  };

  // Handle file view
  const handleViewFile = (fileName) => {
    if (!fileName) {
      toast.error("No file exists for this transaction");
      return;
    }
    const fileExtension = fileName.split(".").pop().toLowerCase();
    const fileUrl = imageBaseUrl + fileName;

    if (fileExtension === "pdf") {
      window.open(fileUrl, "_blank");
    } else {
      setState((prev) => ({
        ...prev,
        modal: { ...prev.modal, imageUrl: fileUrl, isImageOpen: true },
      }));
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        name: <span className="font-weight-bold fs-13">SL No.</span>,
        selector: (_, index) => index + 1,
        width: "5%",
      },
      ...(state.transactionType !== "Received"
        ? [
          {
            name: <span className="font-weight-bold fs-13">Received</span>,
            cell: (row) => (
              <select
                value={row.proofStatus ?? 2}
                onChange={(e) => handleStatusChange(row, e.target.value)}
                style={{
                  padding: "3px",
                  color: row.proofStatus === 0 ? defaultTheme.redColor : null,
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ),
          },
        ]
        : []),
      {
        name: <span className="font-weight-bold fs-13">File</span>,
        selector: (row) => (
          <FaFilePdf
            size={20}
            onClick={() => handleViewFile(row.fileName)}
            style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
          />
        ),
        width: "5%",
        sortable: true,
      },
      {
        name: <span className="font-weight-bold fs-13">Unique ID</span>,
        selector: (row) => row.strNo,
        sortable: true,
        cell: (row) => <WordWrapCell>{row.strNo}</WordWrapCell>,
      },
      {
        name: <span className="font-weight-bold fs-13">Cheque Date</span>,
        selector: (row) => row.chequeDate,
        sortable: true,
        cell: (row) => <WordWrapCell>{formatDate(row.chequeDate)}</WordWrapCell>,
      },
      {
        name: <span className="font-weight-bold fs-13">Cheque No</span>,
        selector: (row) => row.chequeNo,
        width: "10%",
        sortable: true,
        cell: (row) => <WordWrapCell>{row.chequeNo}</WordWrapCell>,
      },
      {
        name: <span className="font-weight-bold fs-13">Associate Details</span>,
        selector: (row) => row.associateName,
        sortable: true,
        width: "12%",
        cell: (row) => <WordWrapCell>{row.associateName}</WordWrapCell>,
      },
      {
        name: <span className="font-weight-bold fs-13">Builder Name</span>,
        selector: (row) => row.builderName,
        sortable: true,
        width: "12%",
        cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>,
      },
      {
        name: <span className="font-weight-bold fs-13">Project Name</span>,
        selector: (row) => row.projectName,
        sortable: true,
        width: "12%",
        cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>,
      },
      {
        name: <span className="font-weight-bold fs-13">Client Name</span>,
        selector: (row) => row.clientName,
        sortable: true,
        width: "12%",
        cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
      },
      {
        name: <span className="font-weight-bold fs-13">Amount</span>,
        selector: (row) => row.amount,
        sortable: true,
        cell: (row) => <WordWrapCell>{row.amount}</WordWrapCell>,
      },
      {
        name: <span className="font-weight-bold fs-13">Unit No</span>,
        selector: (row) => row.unitNo,
        sortable: true,
        width: "15%",
        cell: (row) => <WordWrapCell>{row.unitNo}</WordWrapCell>,
      },
      ...(state.transactionType === "Received"
        ? [
          {
            name: <span className="font-weight-bold fs-13">Remarks</span>,
            selector: (row) => row.financeRemarks,
            sortable: true,
            width: "15%",
            cell: (row) => <WordWrapCell>{row.financeRemarks}</WordWrapCell>,
          },
        ]
        : []),
    ],
    [state.transactionType]
  );

  const status = String(state.modal.status); // forces it to be a string
  const action = status === '0' ? 'reject' : status === '1' ? 'accept' : '';

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'upload-sbi-files');
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
      <Breadcrumbs title="Upload" breadcrumbItem="Upload SBI Files" />
      {(state.table.isLoading || isPending) && <ScreenLoader />}
      <Container fluid>
        <form onSubmit={handleShowData}>
          <Card>
            <CardBody>
              <Row>
                {/* Radio Buttons */}
                <div className="radio-button-container">
                  {TRANSACTION_TYPES.map((type) => (
                    <label
                      key={type}
                      className={`radio-label ${state.transactionType === type ? "active" : ""}`}
                    >
                      <input
                        type="radio"
                        value={type}
                        checked={state.transactionType === type}
                        onChange={handleRadioChange}
                      />
                      {type === "Received" ? "Approved" : type}
                    </label>
                  ))}
                </div>

                {/* Form Inputs */}
                <Col lg={2}>
                  <h6 className="font-size-11">Select Associate</h6>
                  <Select
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    isClearable
                    value={state.form.searchByAssociate}
                    onChange={handleSelectChange("searchByAssociate")}
                    options={Array.isArray(associateList?.data?.data) ? associateList.data.data : []}
                  />
                </Col>
                <Col lg={2}>
                  <h6 className="font-size-11">Search By</h6>
                  <Select
                    isClearable
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    value={state.form.searchBy}
                    onChange={handleSelectChange("searchBy")}
                    options={SEARCH_BY_OPTIONS}
                  />
                </Col>
                <Col lg={2}>
                  <h6 className="font-size-11">Type Text</h6>
                  <input
                    className="form-control"
                    id="textInput"
                    type="text"
                    placeholder="Type to search..."
                    value={state.form.textInput}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col lg={2}>
                  <h6 className="font-size-11">From Date</h6>
                  <input
                    className="form-control"
                    id="fromDate"
                    type="date"
                    value={state.form.fromDate}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col lg={2}>
                  <h6 className="font-size-11">To Date</h6>
                  <input
                    className="form-control"
                    id="toDate"
                    type="date"
                    value={state.form.toDate}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col md="2" className="d-flex align-items-end justify-content-center">
                  <Button type="submit" color="primary" className="me-2">
                    Search
                  </Button>
                  <Button color="secondary" onClick={handleClear} style={{ backgroundColor: defaultTheme.goldColorLogo }}>
                    Clear
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>

        {/* Data Table */}
        <AppTable
          progressPending={state.table.isLoading}
          columns={columns}
          data={state.table.data}
          pagination
          paginationTotalRows={state.table.totalElements}
          paginationServer
          onChangePage={(newPage) =>
            setState((prev) => ({
              ...prev,
              table: { ...prev.table, page: newPage, isLoading: true },
            }))
          }
          conditionalRowStyles={[
            {
              when: (row) => row.proofStatus === 0,
              style: { color: defaultTheme.redColor },
            },
          ]}
        />

        {/* File Upload Modal */}
        <Modal
          isOpen={state.modal.isOpen}
          toggle={() => setState((prev) => ({ ...prev, modal: { ...prev.modal, isOpen: false } }))}
        >
          <ModalHeader
            toggle={() => setState((prev) => ({ ...prev, modal: { ...prev.modal, isOpen: false } }))}
          >
            Upload File
          </ModalHeader>
          <ModalBody>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setState((prev) => ({ ...prev, modal: { ...prev.modal, isOpen: false } }));
              }}
            >
              <div className="mb-3">
                <h6 className="font-size-12">STS No</h6>
                <input
                  type="text"
                  className="form-control"
                  value={state.modal.data?.prospectId || ""}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      modal: { ...prev.modal, data: { ...prev.modal.data, stsNo: e.target.value } },
                    }))
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <h6 className="font-size-12">Associate ID</h6>
                <input
                  type="text"
                  className="form-control"
                  value={state.modal.data?.prospectId || ""}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      modal: { ...prev.modal, data: { ...prev.modal.data, associateId: e.target.value } },
                    }))
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <h6 className="font-size-12">Upload File</h6>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      modal: { ...prev.modal, data: { ...prev.modal.data, file: e.target.files[0] } },
                    }))
                  }
                  required
                />
              </div>
              <Button type="submit" color="primary">
                Upload File
              </Button>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              color="warning"
              onClick={() => setState((prev) => ({ ...prev, modal: { ...prev.modal, isOpen: false } }))}
              style={{ backgroundColor: defaultTheme.goldColorLogo }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

        {/* Status Change Modal */}

        <Modal
          isOpen={state.modal.isStatusOpen}
          toggle={() => setState((prev) => ({ ...prev, modal: { ...prev.modal, isStatusOpen: false } }))}
        >
          <ModalHeader
            toggle={() => setState((prev) => ({ ...prev, modal: { ...prev.modal, isStatusOpen: false } }))}
          >
            Confirm {action}
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want {action} this ?</p>
            <textarea
              className="form-control mt-2"
              placeholder="Enter Remarks..."
              value={state.modal.remarks}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  modal: { ...prev.modal, remarks: e.target.value },
                }))
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={confirmStatusChange} style={{ backgroundColor: defaultTheme.primary }}>
              Confirm
            </Button>
            <Button
              color="warning"
              onClick={() => setState((prev) => ({ ...prev, modal: { ...prev.modal, isStatusOpen: false } }))}
              style={{ backgroundColor: defaultTheme.goldColorLogo }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

        {/* Image Modal */}
        <ImageModal
          isOpen={state.modal.isImageOpen}
          toggle={() => setState((prev) => ({ ...prev, modal: { ...prev.modal, isImageOpen: false } }))}
          imageSrc={state.modal.imageUrl}
        />
      </Container>
    </PageContent>
  );
};

export default UploadSbiFiles;