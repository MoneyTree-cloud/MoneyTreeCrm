/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Row, Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Select from "react-select";
import { usePost, usePut } from "../../Hooks/useApi";
import { CREATE_SUSPECT, GET_SUSPECT_DATA_BY_ASSOCIATE_ID_NEW, IVR_MAKE_CALL, MARK_DND, UPDATE_SUSPECT_DATA } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import { useNavigate } from "react-router-dom";
import { MdCall, MdMobileFriendly } from "react-icons/md";
import PageContent from "../../components/Common/PageContent";
import { FaEdit, FaFacebookF, FaFileExcel, FaGoogle } from "react-icons/fa";
import { formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import ApiClient, { assetImageBaseUrl } from "../../helpers/api_helper";
import "../CSS/styles.css";
import { decryptData } from "../../components/Common/CryptoUtils";
import Tree from "../../assets/images/Tree_transparent.png";
import P100 from "../../assets/images/p100.png";

// Constants
const LIMIT = 100;
const SEARCH_BY_OPTIONS = [
  { label: "Mobile Number", value: "PHONE" },
  { label: "Name", value: "NAME" },
];

const PROJECT_CATEGORIES = [
  { label: "1st Floor", value: "1st Floor" },
  { label: "2nd Floor", value: "2nd Floor" },
  { label: "3rd Floor", value: "3rd Floor" },
  { label: "3.5 BHK", value: "3.5 BHK" },
  { label: "Audi", value: "Audi" },
  { label: "Audi-1", value: "Audi-1" },
  { label: "Audi-2", value: "Audi-2" },
  { label: "Audi-3", value: "Audi-3" },
  { label: "Commercial", value: "Commercial" },
  { label: "Food Court", value: "Food Court" },
  { label: "Fourth Floor", value: "Fourth Floor" },
  { label: "FEC", value: "FEC" },
  { label: "Ground", value: "Ground" },
  { label: "LGF", value: "LGF" },
  { label: "Office", value: "Office" },
  { label: "Plot", value: "Plot" },
  { label: "Retail", value: "Retail" },
  { label: "Residential", value: "Residential" },
  { label: "Share", value: "Share" },
  { label: "Second Floor", value: "Second Floor" },
  { label: "Shop", value: "Shop" },
  { label: "SIP", value: "SIP" },
  { label: "Studio", value: "Studio" },
  { label: "Third Floor", value: "Third Floor" },
  { label: "UV", value: "UV" },
  { label: "Vibe", value: "Vibe" },
  { label: "WTC Quad", value: "WTC Quad" },
];

const STATUS_OPTIONS = [
  { label: "Accept", value: "accept" },
  { label: "CallBack", value: "hold" },
  { label: "Reject", value: "reject" },
  { label: "DND", value: "dnd" },
];

const REJECT_CATEGORIES = [
  { label: "Not Reachable", value: "Not Reachable" },
  { label: "Call Not Picking", value: "Call Not Picking" },
  { label: "Not Interested", value: "Not Interested" },
  { label: "Wrong Number", value: "Wrong Number" },
  { label: "DND", value: "DND" },
  { label: "Another City", value: "Another City" },
  { label: "Switch Off", value: "Switch Off" },
];

const SuspectData = () => {
  // ★ ONE LINE — track active time on this screen
  // useScreenTime('Suspect');
  const navigate = useNavigate();
  const { user: { userId, empCode, userName, ivrCallStatus } } = useUserStore();
  const [isPending, setIsPending] = useState(false);
  // Consolidated state
  const [state, setState] = useState({
    form: {
      clientName: "",
      project: "",
      mobile: "",
      projectCategory: null,
    },
    search: {
      searchBy: null,
      searchText: "",
    },
    modal: null,
    suspectType: "self",
    page: 1,
    suspectData: [],
    totalElements: 0,
    isLoading: false,
    shouldFetch: false,
  });

  const [errors, setErrors] = useState({
    clientName: "",
    project: "",
    mobile: "",
    projectCategory: "",
  });

  // API hooks
  const { isPending: isPendingAdd, mutate: mutateAdd } = usePost(
    `${CREATE_SUSPECT}${userId}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          setState((prev) => ({
            ...prev,
            form: { clientName: "", project: "", mobile: "", projectCategory: null },
            shouldFetch: true,
          }));
          setErrors({ clientName: "", project: "", mobile: "", projectCategory: "" });
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => toast.error(err.message),
    }
  );

  const { isPending: isPendingUpdate, mutate: mutateUpdate } = usePut(
    `${UPDATE_SUSPECT_DATA}${state?.modal?.leadId}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          if (state.modal.status?.value === "accept") {
            navigate("/prospect-list-menu/add-prospect-list", {
              state: { rowData: state.modal, screen: "suspect" },
            });
          }
          setState((prev) => ({ ...prev, modal: null, shouldFetch: true }));
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => toast.error(err.message),
    }
  );

  // Memoized API URL
  const apiUrl = useMemo(() => {
    const { suspectType, page, search } = state;
    const baseUrl = `${GET_SUSPECT_DATA_BY_ASSOCIATE_ID_NEW}${userId}`;
    const params = [
      `page=${page - 1}`,
      `size=${LIMIT}`,
      search?.searchBy && search.searchText.trim() ? `key=${search?.searchBy?.value}&value=${encodeURIComponent(search?.searchText.trim())}` : "",
      `status=${suspectType}`,
    ].filter(Boolean).join("&");
    return `${baseUrl}&${params}`;
  }, [state.search.searchBy, state.search.searchText, state.suspectType, state.page]);

  // Fetch suspect data
  useEffect(() => {
    if (state.shouldFetch) {
      setState((prev) => ({ ...prev, isLoading: true }));
      ApiClient.get(apiUrl)
        .then((response) => {
          if (response?.data?.status === 1) {
            const encryptedContent = response.data.data || [];
            decryptData(encryptedContent).then((decrypted) => {
              setState((prev) => ({
                ...prev,
                suspectData: decrypted?.content || [],
                totalElements: decrypted.totalElements || 0,
                shouldFetch: false,
                isLoading: false,
              }));
            }).catch((error) => {
            });

          } else {
            toast.error(response.data.message || "Failed to fetch suspect data");
            setState((prev) => ({ ...prev, isLoading: false, shouldFetch: false }));
          }
        })
        .catch((error) => {
          toast.error(error.message || "An error occurred");
          setState((prev) => ({ ...prev, isLoading: false, shouldFetch: false }));
        });
    }
  }, [state.shouldFetch, apiUrl]);

  // Initial fetch
  useEffect(() => {
    setState((prev) => ({ ...prev, shouldFetch: true }));
  }, []);

  // Form validation
  const validateForm = () => {
    const { form } = state;
    const newErrors = {
      clientName: form.clientName ? "" : "Client Name is required",
      project: form.project ? "" : "Project is required",
      mobile: !form.mobile
        ? "Mobile Number is required"
        : form.mobile.length !== 10 || isNaN(form.mobile)
          ? "Mobile Number must be exactly 10 digits"
          : "",
      projectCategory: form.projectCategory ? "" : "Project Category is required",
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { id, value } = e.target;
    if (id === "searchText") {
      setState((prev) => ({
        ...prev,
        search: { ...prev.search, searchText: value },
      }));
    } else {
      if (id === "mobile" && (!/^\d*$/.test(value) || value.length > 10)) return;
      setState((prev) => ({
        ...prev,
        form: { ...prev.form, [id]: value },
      }));
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  // Handle select changes
  const handleSelectChange = (name, isForm = true) => (selectedOption) => {
    setState((prev) => ({
      ...prev,
      [isForm ? "form" : "search"]: {
        ...prev[isForm ? "form" : "search"],
        [name]: selectedOption,
      },
    }));
    if (isForm) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle save form submission
  const handleSaveData = () => {
    if (validateForm()) {
      const { form } = state;
      const request = {
        leadName: form.clientName,
        leadMobile: form.mobile,
        remark: "",
        project: form.project,
        projectCategory: form.projectCategory?.value,
      };
      mutateAdd(request);
    } else {
      toast.error("Please fix the errors before proceeding.");
    }
  };

  // Handle search form submission
  const handleShowData = () => {
    const { searchBy, searchText } = state.search;
    if (!searchBy) {
      toast.error("Please select a search field");
      return;
    }
    if (!searchText.trim()) {
      toast.error("Please input a value for search");
      return;
    }
    setState((prev) => ({
      ...prev,
      page: 1,
      search: { searchBy, searchText: searchText.trim() },
      shouldFetch: true,
    }));
  };

  // Clear forms
  const handleClear = () => {
    setState((prev) => ({
      ...prev,
      form: { clientName: "", project: "", mobile: "", projectCategory: null },
      search: { searchBy: null, searchText: "" },
      shouldFetch: true,
    }));
    setErrors({ clientName: "", project: "", mobile: "", projectCategory: "" });
  };

  // Handle radio button change
  const handleRadioChange = (event) => {
    const value = event.target.value;
    setState((prev) => ({
      ...prev,
      suspectType: value === 'callback' ? 'hold' : value,
      page: 1,
      shouldFetch: true,
    }));
  };

  // Handle modal update
  const handleUpdateStatus = () => {
    const { modal } = state;
    if (!modal.leadMobile || modal.leadMobile.length !== 10) {
      toast.error("Mobile Number must be exactly 10 digits");
      return;
    }
    if (!modal.leadName) {
      toast.error("Name can't be empty");
      return;
    }
    if (!modal.project) {
      toast.error("Project can't be empty");
      return;
    }
    if (!modal.status) {
      toast.error("Feedback1 is required");
      return;
    }
    if (modal.status.value === "reject" && !modal.category) {
      toast.error("Feedback2 is required when Reject is selected");
      return;
    }
    if (modal.status.value === "hold") {
      const holdDate = modal.holdDate?.split(" ")[0];
      const holdTime = modal.holdDate?.split(" ")[1];

      if (!holdDate) {
        toast.error("CallBack Date is required when CallBack is selected");
        return;
      }

      if (!holdTime || holdTime === "00:00:00") {
        toast.error("CallBack Time is required when CallBack is selected");
        return;
      }
    }


    if (!modal.remark) {
      toast.error("Remarks is required");
      return;
    }
    if (modal.status.value === 'dnd') {
      let params = {
        "dndClientNumber": modal.leadMobile,
        "dndClientName": modal.leadName,
        "associateId": empCode,
        "associateName": userName,
        "remarks": modal.remarks
      };
      markDND(params);
    }
    else {
      const params = {
        client_name: modal.leadName,
        mobile_no: modal.leadMobile,
        project_name: modal.project,
        feed1: modal.status.value,
        feed2: modal.category ? modal.category.value : null,
        remark: modal.remark || "",
        holdDate: modal.holdDate || "",
      };
      mutateUpdate(params);
    }
  };

  const { isPending: dndLoading, mutate: markDND } = usePost(
    MARK_DND,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          setState((prev) => ({ ...prev, modal: null, shouldFetch: true }));
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handleCallClick = (row) => {
    setIsPending(true);
    ApiClient.get(`${IVR_MAKE_CALL}userId=${userId}&callerMobile=${row.leadMobile}`)
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message);
      });
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        name: <span className="font-weight-bold fs-13">SL No.</span>,
        selector: (_, index) => index + 1,
        width: "7%",
      },
      ...(ivrCallStatus === "YES"
        ? [
          {
            name: <span className="font-weight-bold fs-13">Call</span>,
            width: "10%",
            cell: (row) => (
              <MdCall
                className="phone-icon"
                title={row.dnd ? "DND Enabled - Call Disabled" : "Click to Call"}
                color={defaultTheme.goldColorLogo}
                cursor={row.dnd ? "not-allowed" : "pointer"}
                onClick={() => {
                  if (!row.dnd) {
                    handleCallClick(row);
                  }
                }}
              />
            ),
          },
        ]
        : [
          ...(empCode === '1004'
            ? [
              {
                name: <span className="font-weight-bold fs-13">Mobile No.</span>,
                selector: (row) => row.leadMobile,
                width: "10%",
                sortable: true,
                cell: (row) => <WordWrapCell>{row.leadMobile}</WordWrapCell>
              },
            ]
            : [
              {
                name: <span className="font-weight-bold fs-13">Mobile No.</span>,
                selector: (row) => row.leadMobile,
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
            ]),
        ]),
      {
        name: <span className="font-weight-bold fs-13">Name</span>,
        selector: (row) => row.leadName,
        sortable: true,
        cell: (row) => <WordWrapCell>{row.leadName}</WordWrapCell>,
      },
      {
        name: <span className="font-weight-bold fs-13">Project Name</span>,
        selector: (row) => row.project,
        sortable: true,
        cell: (row) => <WordWrapCell>{row.project}</WordWrapCell>,
      },
      {
        name: <span className="font-weight-bold fs-13">Project Category</span>,
        selector: (row) => row.projectCategory,
        cell: (row) => {
          let content;
          if (row.createdBy === "1237" || row.createdBy === "100042" || row.transferBy === 1237 || row.createdBy === "101322" || row.transferBy === 101322) {
            content = (
              <img
                src={Tree}
                alt="Tree"
                title="MoneyTree Lead"
                style={{ width: "20px", height: "20px" }}
              />
            );
          } else if (row.projectCategory === "Google") {
            content = <FaGoogle style={{ color: "#4285F4" }} title="Google Lead" />;
          } else if (row.projectCategory === "Meta") {
            content = <FaFacebookF style={{ color: "#1877F2" }} title="Meta Lead" />;
          }
          else if (row.projectCategory === "P100") {
            content = <img
              src={P100}
              alt="Tree"
              title="P100"
              style={{ width: "20px", height: "20px" }}
            />;
          }
          else if (row.projectCategory === "Thinkit") {
            content = <img
              src={assetImageBaseUrl + 'GEnie.png'}
              alt="Tree"
              title="ThinkIt Lead"
              style={{ width: "20px", height: "20px" }}
            />;
          }
          else if (row.projectCategory === "Website") {
            content = <img
              src={Tree}
              alt="Tree"
              title="PPC Lead"
              style={{ width: "20px", height: "20px" }}
            />;
          }
          else {
            // ✅ Default fallback → Excel icon
            content = (
              <FaFileExcel
                style={{ color: "#217346" }} // Excel green
                title="Excel Lead"
                size={18}
              />
            );
          }

          return <WordWrapCell>{content}</WordWrapCell>;
        },
      },
      {
        name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
        selector: (row) => row.createdDate,
        sortable: true,
        cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
      },
      {
        name: <span className="font-weight-bold fs-13">Lead Remarks</span>,
        selector: (row) => row.leadRemark,
        sortable: true,
        cell: (row) => <WordWrapCell>{row.leadRemark || '-'}</WordWrapCell>,
      },
      {
        name: <span className="font-weight-bold fs-13">Action</span>,
        cell: (row) => (
          <i
            className="text-secondary me-2"
            style={{ cursor: row.dnd ? "not-allowed" : "pointer" }}
            onClick={() => {
              if (!row.dnd) {
                setState((prev) => ({
                  ...prev,
                  modal: { ...row, status: null, category: null }
                }));
              }
            }}
            title={row.dnd ? "DND Enabled - Action Disabled" : "Edit Suspect"}
          >
            <FaEdit style={{ cursor: row.dnd ? "not-allowed" : "pointer", opacity: row.dnd ? 0.5 : 1 }} size={20} />
          </i>
        ),
      },
      ...(state.suspectType === "rejected"
        ? [
          {
            name: <span className="font-weight-bold fs-13">Feedback</span>,
            selector: (row) => row.status2,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.status2}</WordWrapCell>,
          },
        ]
        : []),
      ...(state.suspectType === "rejected" || state.suspectType === "hold"
        ? [
          {
            name: <span className="font-weight-bold fs-13">Remarks</span>,
            selector: (row) => row.remark,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.remark}</WordWrapCell>,
          },
        ]
        : []),

      ...(state.suspectType === "hold"
        ? [
          {
            name: <span className="font-weight-bold fs-13">CallBack Date&Time</span>,
            selector: (row) => row.holdDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.holdDate)}</WordWrapCell>,
          },
        ]
        : []),
    ],
    [state.suspectType]
  );

  const PULLBACK_NOTES = {
    transferred: "Transferred suspects are pulled back after 5 days.",
    self: "Uploaded suspects are pulled back after 7 days. Manually created suspects are not pulled back.",
    hold: "Call-back suspects are pulled back after 30 days.",
  };

  return (
    <PageContent>
      <Breadcrumbs title="Associate Section" breadcrumbItem="Suspect Data" />
      {(state.isLoading || isPendingAdd || isPendingUpdate || dndLoading || isPending) && <ScreenLoader />}
      <Container fluid>
        {/* Create Suspect Form */}
        <Card>
          <CardBody>
            <Row className="g-3">
              <Col lg={3}>
                <h6 className="font-size-11">Client Name <RequiredStar /></h6>
                <Input
                  className={errors.clientName ? "is-invalid" : ""}
                  id="clientName"
                  type="text"
                  value={state.form.clientName}
                  onChange={handleFormChange}
                  placeholder="Enter Client Name..."
                />
                {errors.clientName && (
                  <div className="invalid-feedback">{errors.clientName}</div>
                )}
              </Col>
              <Col lg={3}>
                <h6 className="font-size-11">Project <RequiredStar /></h6>
                <Input
                  className={errors.project ? "is-invalid" : ""}
                  id="project"
                  type="text"
                  value={state.form.project}
                  onChange={handleFormChange}
                  placeholder="Enter project..."
                />
                {errors.project && (
                  <div className="invalid-feedback">{errors.project}</div>
                )}
              </Col>
              <Col lg={3}>
                <h6 className="font-size-11">Mobile Number <RequiredStar /></h6>
                <Input
                  className={errors.mobile ? "is-invalid" : ""}
                  id="mobile"
                  type="text"
                  maxLength={10}
                  value={state.form.mobile}
                  onChange={handleFormChange}
                  placeholder="Enter mobile number..."
                />
                {errors.mobile && (
                  <div className="invalid-feedback">{errors.mobile}</div>
                )}
              </Col>
              <Col lg={3}>
                <h6 className="font-size-11">Project Category <RequiredStar /></h6>
                <Select
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  isClearable
                  value={state.form.projectCategory}
                  onChange={handleSelectChange("projectCategory")}
                  options={PROJECT_CATEGORIES}
                />
                {errors.projectCategory && (
                  <div className="invalid-feedback d-block">{errors.projectCategory}</div>
                )}
              </Col>
              <Col lg={12} style={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  color="primary"
                  onClick={handleSaveData}
                >
                  Save
                </Button>
                <Button
                  color="secondary"
                  className="ms-2"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Radio Buttons */}
        <div className="radio-button-container">
          {["self", "transferred", "callback", "rejected"].map((type) => (
            <label
              key={type}
              className={`radio-label ${state.suspectType === (type === 'callback' ? 'hold' : type) ? "active" : ""}`}
            >
              <input
                type="radio"
                value={type}
                checked={state.suspectType === (type === 'callback' ? 'hold' : type)}
                onChange={handleRadioChange}
              />
              {type === 'callback' ? 'Callback' : type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>


        {/* ── Notes ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            margin: "14px 0 4px",
            alignItems: "stretch",
          }}
        >
          {/* Pull-back note (tab-specific) — takes more room */}
          {PULLBACK_NOTES[state.suspectType] && (
            <div
              style={{
                flex: "1 1 320px",
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "10px 14px",
                borderRadius: 8,
                background: "#FFFBEB",
                borderLeft: "4px solid #C9A84C",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#8A6D1A",
              }}
            >
              <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
              {PULLBACK_NOTES[state.suspectType]}
            </div>
          )}

          {/* DND note */}
          <div
            style={{
              flex: "1 1 200px",
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "10px 14px",
              borderRadius: 8,
              background: `${defaultTheme.redColor}0F`,
              borderLeft: `4px solid ${defaultTheme.redColor}`,
              fontSize: 12.5,
              fontWeight: 600,
              color: defaultTheme.redColor,
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: defaultTheme.redColor, flexShrink: 0 }} />
            Rows shown in red are marked Do Not Disturb (DND).
          </div>

          {/* Online leads note */}
          <div
            style={{
              flex: "1 1 200px",
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "10px 14px",
              borderRadius: 8,
              background: `${defaultTheme.btnEnable}0F`,
              borderLeft: `4px solid ${defaultTheme.btnEnable}`,
              fontSize: 12.5,
              fontWeight: 600,
              color: defaultTheme.btnEnable,
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: defaultTheme.btnEnable, flexShrink: 0 }} />
            Rows shown in blue are Online Leads.
          </div>
        </div>

        {/* Search Form */}
        <Card>
          <CardBody>
            <Row className="g-3">
              <Col lg={4}>
                <h6 className="font-size-11">Search By</h6>
                <Select
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  isClearable
                  value={state.search.searchBy}
                  onChange={handleSelectChange("searchBy", false)}
                  options={SEARCH_BY_OPTIONS}
                />
              </Col>
              <Col lg={4}>
                <h6 className="font-size-11">Search</h6>
                <Input
                  id="searchText"
                  type="text"
                  value={state.search.searchText}
                  onChange={handleFormChange}
                  placeholder="Type to search..."
                />
              </Col>
              <Col lg={4} className="d-flex align-items-end">
                <Button
                  color="primary"
                  className="me-2"
                  onClick={handleShowData}
                >
                  Search
                </Button>
                <Button
                  color="secondary"
                  onClick={handleClear}
                  type="reset"
                >
                  Clear
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Table */}
        <AppTable
          progressPending={state.isLoading}
          columns={columns}
          data={state?.suspectData}
          pagination
          paginationTotalRows={state?.totalElements}
          paginationServer
          onChangePage={(newPage) => setState((prev) => ({ ...prev, page: newPage, shouldFetch: true }))}
          conditionalRowStyles={[
            {
              when: (row) => row.dnd,
              style: {
                color: defaultTheme.redColor,
                fontWeight: 'bold'
              },
            },
            {
              when: (row) => !row.dnd && (row.projectCategory === 'Google' || row.projectCategory === 'Meta'),
              style: {
                color: defaultTheme.btnEnable,
                fontWeight: 'bold'
              },
            },
          ]}
        />

        {/* Edit Modal */}
        <Modal isOpen={!!state.modal} toggle={() => setState((prev) => ({ ...prev, modal: null }))}>
          <ModalHeader toggle={() => setState((prev) => ({ ...prev, modal: null }))}>
            Suspect Status
          </ModalHeader>
          <ModalBody>
            {state.modal && (
              <Row className="g-3">
                <Col lg={4}>
                  <h6 className="font-size-11">Mobile No</h6>
                  <Input
                    type="text"
                    maxLength={10}
                    value={state.modal.dnd ? '0000000000' : state.modal.leadMobile}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        modal: { ...prev.modal, leadMobile: e.target.value },
                      }))
                    }
                  />
                </Col>
                <Col lg={4}>
                  <h6 className="font-size-11">Name</h6>
                  <Input
                    type="text"
                    value={state.modal.leadName}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        modal: { ...prev.modal, leadName: e.target.value },
                      }))
                    }
                  />
                </Col>
                <Col lg={4}>
                  <h6 className="font-size-11">Project</h6>
                  <Input
                    type="text"
                    value={state.modal.project}
                    disabled={state.modal.projectCategory === 'Google' || state.modal.projectCategory === 'Meta' ? true : false}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        modal: { ...prev.modal, project: e.target.value },
                      }))
                    }
                  />
                </Col>
                <Col lg={state.modal.status?.value === "hold" ? 4 : 6}>
                  <h6 className="font-size-11">Feedback1 <RequiredStar /></h6>
                  <Select
                    isClearable
                    options={STATUS_OPTIONS}
                    onChange={(selectedOption) =>
                      setState((prev) => ({
                        ...prev,
                        modal: {
                          ...prev.modal,
                          status: selectedOption,
                          category: selectedOption?.value === "accept" ? null : prev.modal.category,
                        },
                      }))
                    }
                    value={state.modal.status}
                  />
                </Col>
                {state.modal.status?.value === "reject" && (
                  <Col lg={6}>
                    <h6 className="font-size-11">Feedback2 <RequiredStar /></h6>
                    <Select
                      isClearable
                      options={REJECT_CATEGORIES}
                      onChange={(selectedOption) =>
                        setState((prev) => ({
                          ...prev,
                          modal: { ...prev.modal, category: selectedOption },
                        }))
                      }
                      value={state.modal.category}
                    />
                  </Col>
                )}
                {state.modal.status?.value === "hold" && (
                  <>
                    <Col lg={4}>
                      <h6 className="font-size-11">CallBack Date <RequiredStar /></h6>
                      <Input
                        type="date"
                        value={state.modal.holdDate?.split(" ")[0] || ""}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                          const date = e.target.value;
                          const time = state.modal.holdDate?.split(" ")[1] || "00:00:00";
                          setState((prev) => ({
                            ...prev,
                            modal: { ...prev.modal, holdDate: `${date} ${time}` },
                          }));
                        }}
                      />
                    </Col>

                    <Col lg={4}>
                      <h6 className="font-size-11">CallBack Time <RequiredStar /></h6>
                      <Input
                        type="time"
                        value={(state.modal.holdDate?.split(" ")[1] || "").substring(0, 5)}
                        onChange={(e) => {
                          const time = e.target.value + ":00"; // Add seconds
                          const date = state.modal.holdDate?.split(" ")[0] || "";
                          setState((prev) => ({
                            ...prev,
                            modal: { ...prev.modal, holdDate: `${date} ${time}` },
                          }));
                        }}
                      />
                    </Col>
                  </>
                )}

                <Col lg={12}>
                  <h6 className="font-size-11"> Remarks <RequiredStar /></h6>
                  <textarea
                    placeholder="Add remarks..."
                    className="form-control"
                    rows={4}
                    value={state.modal.remark || ""}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        modal: { ...prev.modal, remark: e.target.value },
                      }))
                    }
                  />
                </Col>
              </Row>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleUpdateStatus} style={{ backgroundColor: defaultTheme.primary }}>
              Update Status
            </Button>
            <Button
              color="warning"
              onClick={() => setState((prev) => ({ ...prev, modal: null }))}
              style={{ backgroundColor: defaultTheme.goldColorLogo }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </PageContent>
  );
};

export default SuspectData;