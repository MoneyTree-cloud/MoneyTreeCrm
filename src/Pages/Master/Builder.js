/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost, usePut } from "../../Hooks/useApi";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { ADD_BUILDER, CHANGE_BUILDER_STATUS, GET_ALL_BUILDER } from "../../helpers/url_helper";
import Select from "react-select";
import Switch from "react-switch";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { useUserStore } from "../../store/useUserStore";
import PermissionMissing from "../Utility/PermissonMissing";
import { formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";

export default function Builder() {
  const initialFormData = {
    builderName: "",
    builderNameAsPerPan: "",
  };
  const LIMIT = 100;
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSearchType, setSelectedSearchType] = useState(null);
  const [rowStatus, setRowStatus] = useState("");
  const [builderName, setBuilderName] = useState("");
  const [filterQueryParam, setFilterQueryParam] = useState(null);
  const [flag, setFlag] = useState(false);
  const { userId, empCode, userName } = useUserStore((state) => state.user);
  const [accessGranted, setAccessGranted] = useState(null);
  const [showForm, setShowForm] = useState(false);
  // const { data: departmentData } = useGet(`${GET_DEPARTMENT_BY_ID}?departmentId=10&departmentUserId=YES&status=NO`, { enabled: Boolean(accessGranted) });

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'builder');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  const { data: builderList, refetch: getAllData, isLoading } = useGet(
    `${GET_ALL_BUILDER}?&sortField=createdDate&sortType=desc&page=${page - 1}&size=${LIMIT}${filterQueryParam ?? ""}`,
    { enabled: !!page && !!accessGranted }
  );

  const { isPending: addLoadingPut, mutate: mutatePut } = usePut(
    `${CHANGE_BUILDER_STATUS}${rowStatus}&builder=${builderName}`,
    {
      onSuccess: (response) => {
        setRowStatus("");
        setBuilderName("");
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          getAllData();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        setRowStatus("");
        setBuilderName("");
        toast.error(err.message);
      },
    }
  );

  const handleSwitchChange = (row) => {
    const newStatus = row.isActive === "YES" ? "NO" : "YES";
    setRowStatus(newStatus);
    setBuilderName(row.builderId);
  };

  useEffect(() => {
    if (rowStatus && builderName) {
      mutatePut();
    }
  }, [builderName, mutatePut, rowStatus]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      width: "8%",
      cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Builder ID</span>,
      sortable: true,
      selector: (row) => row.builderId,
      cell: (row) => <WordWrapCell>{row.builderId}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name</span>,
      sortable: true,
      selector: (row) => row.bulderName,
      cell: (row) => <WordWrapCell>{row.bulderName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name As Per PAN</span>,
      sortable: true,
      selector: (row) => row.bulderNameAsPerPan,
      cell: (row) => <WordWrapCell>{row.bulderNameAsPerPan}</WordWrapCell>,
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
      cell: (row) => <WordWrapCell>{row.createdBy || '-'}</WordWrapCell>
    },
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
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.builderName) newErrors.builderName = "Builder name is required.";
    if (!formData.builderNameAsPerPan) newErrors.builderNameAsPerPan = "Builder Name As Per PAN is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleButtonClick = () => {
    if (validateForm()) {
      let params = {
        builderId: 0,
        bulderName: formData.builderName,
        bulderNameAsPerPan: formData.builderNameAsPerPan,
        city: "CITY",
        pin: "PIN",
        address: "ADDRESS",
        isActive: "YES",
        createdBy: userName + ' (' + empCode + ')',
      };
      addBuilder(params);
    } else {
      toast.error("Please Fill In All Required Fields.");
    }
  };

  const { isPending: addLoading, mutate: addBuilder } = usePost(ADD_BUILDER, {
    onSuccess: (response) => {
      if (response?.data.status === 1) {
        toast.success(response.data.message);
        setFormData(initialFormData); // Reset form data to initial state
        setErrors({});
        getAllData();
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleClearData = () => {
    setSelectedSearchType(null);
    setSearchTerm("");
    setFilterQueryParam(null);
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const handleShowData = (e) => {
    e.preventDefault()
    if (selectedSearchType && !searchTerm) {
      toast.error("Please Input Value For Search");
    }
    else if (!selectedSearchType && searchTerm) {
      toast.error("Please Select Value For Search");
    }
    else if (!selectedSearchType && !searchTerm) {
      toast.error("Please Select Value For Search");
    }
    else {
      setPage(1);
      let filterQuery = "";

      if (selectedSearchType && searchTerm) {
        filterQuery += `&key=${selectedSearchType.value}&value=${searchTerm}`;
      }
      setFilterQueryParam(filterQuery);
    }
  };

  const handlePaginationData = () => {
    let filterQuery = "";

    if (selectedSearchType && searchTerm) {
      filterQuery += `&key=${selectedSearchType.value}&value=${searchTerm}`;
    }
    setFilterQueryParam(filterQuery);
  };

  useEffect(() => {
    if (flag) {
      handlePaginationData();
    }
  }, [page]);

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      {(isLoading || addLoading || addLoadingPut) && <ScreenLoader />}
      <Breadcrumbs title="Master" breadcrumbItem="Builder" />
      <Container fluid={true}>
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
          <form>
            <Card>
              <CardBody>
                <Row className="g-3">
                  <Col lg="4">
                    <h6 className="font-size-11">Builder's Brand Name<RequiredStar /></h6>
                    <input
                      className={`form-control ${errors.builderName ? "is-invalid" : ""}`}
                      placeholder="Builder's Brand Name"
                      name="builderName"
                      value={formData.builderName}
                      onChange={handleInputChange}
                    />
                    {errors.builderName && (
                      <div className="invalid-feedback">
                        {errors.builderName}
                      </div>
                    )}
                  </Col>
                  <Col lg="4">
                    <h6 className="font-size-11">Builder's Company Name As Per PAN<RequiredStar /></h6>
                    <input
                      className={`form-control ${errors.builderNameAsPerPan ? "is-invalid" : ""}`}
                      placeholder="Builder's Company Name"
                      name="builderNameAsPerPan"
                      value={formData.builderNameAsPerPan}
                      onChange={handleInputChange}
                    />
                    {errors.builderNameAsPerPan && (
                      <div className="invalid-feedback">
                        {errors.builderNameAsPerPan}
                      </div>
                    )}
                  </Col>
                  <Col md="3" className="d-flex align-items-end">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleButtonClick}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary ms-2"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </form>
        }
        <Card>
          <CardBody>
            <form onSubmit={handleShowData}>
              <Row className="d-flex align-items-end">
                <Col lg="3">
                  <h6 className="font-size-11">Search By</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    value={selectedSearchType}
                    isClearable
                    onChange={setSelectedSearchType}
                    options={[
                      { label: "Builder Name", value: "bulderName" },
                      { label: "Builder ID", value: "builderId" },
                    ]}
                  />
                </Col>
                <Col lg="3">
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
                <Col lg="4">
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
            Array.isArray(builderList?.data?.data?.content)
              ? builderList?.data?.data?.content
              : []
          }
          pagination
          paginationTotalRows={builderList?.data?.data?.totalElements}
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
