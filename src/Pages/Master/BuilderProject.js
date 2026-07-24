/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useGet, usePost, usePut } from "../../Hooks/useApi";
import { CHANGE_BUILDER_PROJECT_STATUS, GET_ALL_BUILDER_PROJECT_MAPPING, GET_DROPDOWN_BUILDER_, MAP_PROJECT_WITH_BUILDER } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import Switch from "react-switch";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useUserStore } from "../../store/useUserStore";
import PageContent from "../../components/Common/PageContent";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function BuilderProject() {
  const { userId, empCode, userName } = useUserStore((state) => state.user);

  const initialFormState = {
    builderGroupSelect: null,
    projectName: "",
    projectLocation: "",
    remarks: "",
    raDueDays: "",
    bd: null,
  };

  const LIMIT = 100;
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSearchType, setSelectedSearchType] = useState(null);
  const [formState, setFormState] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [rowStatus, setRowStatus] = useState("");
  const [mapId, setMapId] = useState("");
  const [filterQueryParam, setFilterQueryParam] = useState(null);
  const [flag, setFlag] = useState(false);
  const [accessGranted, setAccessGranted] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'project-builder');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  const { isPending: addLoading, mutate: addProject } = usePost(
    `${MAP_PROJECT_WITH_BUILDER}`,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          getAllData();
          resetForm();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );
  const { data: builderList, isLoading: loadingBuilder } = useGet(GET_DROPDOWN_BUILDER_, { enabled: !!accessGranted });

  const { data: builderProjectMappingList, refetch: getAllData, isLoading } = useGet(
    `${GET_ALL_BUILDER_PROJECT_MAPPING}?&sortField=createdDate&sortType=desc&page=${page - 1
    }&size=${LIMIT}${filterQueryParam ?? ""}`,
    { enabled: !!page && !!accessGranted }
  );

  const validateForm = () => {
    const newErrors = {};
    if (!formState.builderGroupSelect)
      newErrors.builderGroupSelect = "Builder is required.";
    if (!formState.projectName)
      newErrors.projectName = "Project name is required.";
    if (!formState.bd) newErrors.bd = "BD is required.";
    if (!formState.projectLocation)
      newErrors.projectLocation = "Project location is required.";
    if (!formState.remarks)
      newErrors.remarks = "AB % Information is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle PIN field validation
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear error if exists
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  const handleClearData = () => {
    setSelectedSearchType(null);
    setSearchTerm("");
    setFilterQueryParam(null);
  };

  const handleShowData = (e) => {
    e.preventDefault()
    if (!selectedSearchType) {
      toast.error("Please Select Search Field");
    } else if (!searchTerm) {
      toast.error("Please Input Value For Search");
    } else {
      setPage(1);
      setFilterQueryParam(`&key=${selectedSearchType ? selectedSearchType?.value : ""}&value=${searchTerm}`
      );
    }
  };

  const handlePaginationData = () => {
    setFilterQueryParam(`&key=${selectedSearchType ? selectedSearchType?.value : ""}&value=${searchTerm}`);
  };

  useEffect(() => {
    if (flag) {
      handlePaginationData();
    }
  }, [page]);

  const resetForm = () => {
    setFormState(initialFormState);
    setErrors({});
  };

  const handleButtonClick = (e) => {
    e.preventDefault()
    if (validateForm()) {
      handleSave();
    }
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("createdBy", userName + ' (' + empCode + ')');
    formData.append("builderName", formState.builderGroupSelect?.label);
    formData.append("builderId", formState.builderGroupSelect?.value);
    formData.append("projectName", formState.projectName);
    formData.append("projectLocation", formState.projectLocation);
    formData.append("gstNumber", "GST");
    formData.append("netCost", 1);
    formData.append("city", "CITY");
    formData.append("state", "STATE");
    formData.append("pin", "PIN");
    formData.append("address", "ADDRESS");
    formData.append("active", "YES");
    formData.append("remark", formState.remarks);
    formData.append("projectTypeName", "TYPE NAME");
    formData.append("raDueDays", formState?.raDueDays);
    formData.append("assignedNameBD", formState?.bd?.label || '');
    formData.append("assignedNameCode", formState?.bd?.value || '');
    addProject(formData);
  };

  const { isPending: addLoadingPut, mutate: mutatePut } = usePut(
    `${CHANGE_BUILDER_PROJECT_STATUS}${rowStatus}&mapid=${mapId}`,
    {
      onSuccess: (response) => {
        setRowStatus("");
        setMapId("");
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          getAllData();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        setRowStatus("");
        setMapId("");
        toast.error(err.message);
      },
    }
  );

  const handleSwitchChange = (row) => {
    const newStatus = row.isActive === "YES" ? "NO" : "YES";
    setRowStatus(newStatus);
    setMapId(row.mappingId);
  };

  useEffect(() => {
    if (rowStatus && mapId) {
      mutatePut();
    }
  }, [rowStatus, mapId, mutatePut]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Created At</span>,
      sortable: true,
      selector: (row) => row.createdDate,
      cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Created By</span>,
      selector: (row) => row.createdBy,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.createdBy}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name</span>,
      sortable: true,
      selector: (row) => row.builderName,
      cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">AB % Information</span>,
      sortable: true,
      selector: (row) => row.remark,
      width: '20%',
      cell: (row) => <WordWrapCell>{row.remark || '-'}</WordWrapCell>
    },
    ...((empCode !== '1469')
      ? [
        {
          name: <span className="font-weight-bold fs-13">Project ID</span>,
          sortable: true,
          selector: (row) => row.mappingId,
          cell: (row) => <WordWrapCell>{row.mappingId}</WordWrapCell>
        },
      ] : []),
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      sortable: true,
      selector: (row) => row.projectName,
      cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">BD</span>,
      sortable: true,
      width: '12%',
      selector: (row) => row.assignedNameBD,
      cell: (row) => <WordWrapCell>{row.assignedNameBD || '-'}</WordWrapCell>,
    },
    ...((empCode !== '1469')
      ? [
        {
          name: <span className="font-weight-bold fs-13">AB Due Days</span>,
          sortable: true,
          selector: (row) => row.raDueDays,
          cell: (row) => <WordWrapCell>{row.raDueDays || '-'}</WordWrapCell>
        },
      ] : []),
    {
      name: <span className="font-weight-bold fs-13">Project Location</span>,
      sortable: true,
      selector: (row) => row.projectLocation,
      width: '20%',
      cell: (row) => <WordWrapCell>{row.projectLocation}</WordWrapCell>
    },
    ...((empCode !== '1469')
      ? [
        {
          name: <span className="font-weight-bold fs-13">Action</span>,
          cell: (row) => (
            <Switch
              checked={row.isActive === "YES"}
              offColor={defaultTheme.goldColorLogo}
              onColor={defaultTheme.primary}
              height={20}
              width={40}
              onChange={() => handleSwitchChange(row)}
            />
          ),
        }
      ] : []),
  ];

  const bdGroupOptions = [
    { label: 'Gaurav Gautam (1247)', value: 1247 },
    { label: 'Sandeep Chamyal (2065)', value: 100319 }
  ]

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Master" breadcrumbItem="Builder Project" />
      {(isLoading || addLoading || addLoadingPut || loadingBuilder) && (<ScreenLoader />)}
      <Container fluid={true}>
        {(empCode !== '1469') &&
          <form onSubmit={handleButtonClick}>
            <div>
              <button
                type="button"
                className="btn btn-secondary mb-3"
                onClick={() => setShowForm(prev => !prev)}
                style={{ fontSize: '13px' }}
              >
                {showForm ? (
                  <span><FaChevronUp /> Hide Form</span>
                ) : (
                  <span><FaChevronDown /> Show Form</span>
                )}
              </button>
            </div>
            {showForm &&
              <Card>
                <CardBody>
                  <Row className="g-3">
                    <Col md="3">
                      <h6 className="font-size-11">Select Builder <RequiredStar /></h6>
                      <Select
                        style={{ zIndex: 9999 }}
                        menuPortalTarget={document.body}
                        isClearable
                        value={formState.builderGroupSelect}
                        onChange={(selectedGroup) => {
                          setFormState((prevState) => ({
                            ...prevState,
                            builderGroupSelect: selectedGroup,
                          }));
                          if (errors.builderGroupSelect) {
                            setErrors((prevErrors) => ({
                              ...prevErrors,
                              builderGroupSelect: undefined,
                            }));
                          }
                        }}
                        options={Array.isArray(builderList?.data?.data) ? builderList?.data?.data : []}
                      />
                      {errors.builderGroupSelect && (
                        <div className="invalid-feedback d-block">
                          {errors.builderGroupSelect}
                        </div>
                      )}
                    </Col>
                    <Col md="3">
                      <h6 className="font-size-11">Project Name <RequiredStar /></h6>
                      <input
                        name="projectName"
                        className={`form-control ${errors.projectName ? "is-invalid" : ""}`}
                        type="text"
                        value={formState.projectName}
                        onChange={handleInputChange}
                        placeholder="Enter Project Name..."
                      />
                      {errors.projectName && (
                        <div className="invalid-feedback">
                          {errors.projectName}
                        </div>
                      )}
                    </Col>

                    <Col md="3">
                      <h6 className="font-size-11">BD <RequiredStar /></h6>
                      <Select
                        style={{ zIndex: 9999 }}
                        menuPortalTarget={document.body}
                        value={formState.bd}
                        isClearable
                        onChange={(selectedOption) =>
                          setFormState((prevState) => ({
                            ...prevState,
                            bd: selectedOption,
                          }))
                        }
                        className={errors.bd ? 'is-invalid' : ''}
                        options={bdGroupOptions}
                      />
                      {errors.bd && (
                        <div className="invalid-feedback">{errors.bd}</div>
                      )}
                    </Col>
                    <Col md="3">
                      <h6 className="font-size-11">Project Location (Sector,City Location etc.) <RequiredStar /></h6>
                      <input
                        name="projectLocation"
                        className={`form-control ${errors.projectLocation ? "is-invalid" : ""}`}
                        type="text"
                        value={formState.projectLocation}
                        onChange={handleInputChange}
                        placeholder="Enter Project Location (Sector,City Location etc.)..."
                      />
                      {errors.projectLocation && (
                        <div className="invalid-feedback">
                          {errors.projectLocation}
                        </div>
                      )}
                    </Col>
                    <Col md="3">
                      <h6 className="font-size-11"> AB Due Days</h6>
                      <input
                        name="raDueDays"
                        className={`form-control ${errors.raDueDays ? "is-invalid" : ""}`}
                        type="text"
                        maxLength={3}
                        value={formState.raDueDays}
                        onChange={handleInputChange}
                        placeholder="Enter AB Due Days..."
                      />
                    </Col>
                    <Col md="3">
                      <h6 className="font-size-11">AB % Information <RequiredStar /></h6>
                      <textarea
                        name="remarks"
                        className={`form-control ${errors.remarks ? "is-invalid" : ""}`}
                        value={formState.remarks}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Enter AB % Information"
                      ></textarea>
                      {errors.remarks && (
                        <div className="invalid-feedback">{errors.remarks}</div>
                      )}
                    </Col>

                    <Col md="3" className="d-flex align-items-end">
                      <Button
                        color="primary"
                        className="me-2"
                        type="submit"
                        onClick={handleButtonClick}
                      >
                        Save
                      </Button>
                      <Button
                        className="btn btn-secondary"
                        type="button"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            }
          </form>
        }

        <Card>
          <CardBody>
            <form onSubmit={handleShowData}>
              <Row className="g-3">
                <Col lg="4">
                  <h6 className="font-size-11">Search By</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    value={selectedSearchType}
                    isClearable
                    onChange={setSelectedSearchType}
                    options={[
                      { label: "Builder Name", value: "builderName" },
                      { label: "Project Name", value: "projectName" },
                      { label: "Project ID", value: "mappingId" },
                    ]}
                  />
                </Col>
                <Col lg="4">
                  <h6 className="font-size-11">Search</h6>
                  <input
                    className="form-control"
                    type="text"
                    required
                    placeholder="Type to search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col lg="4" className="d-flex align-items-end">
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
            </form>

          </CardBody>
        </Card>

        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={
            Array.isArray(builderProjectMappingList?.data?.data?.content)
              ? builderProjectMappingList?.data?.data?.content
              : []
          }
          pagination
          paginationTotalRows={builderProjectMappingList?.data?.data?.totalElements}
          paginationServer
          onChangePage={(newPage) => {
            setPage(newPage);
            setFlag(true);
          }}
          conditionalRowStyles={[
            {
              when: (row) => row.isActive === "NO",
              style: { color: defaultTheme.redColor, fontWeight: 'bold' },
            },
          ]}

        />
      </Container>
    </PageContent>
  );
}
