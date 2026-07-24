import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Row, } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import { ALL_DEPARTMENT_DROPDOWN, ALL_LOCATION_DROPDOWN, CREATE_JOB, STATUS_CHANGE_JOB, GET_ALL_JOBS, UPDTATE_JOB, } from "../../helpers/url_helper";
import PageContent from "../../components/Common/PageContent";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import AppTable from "../../components/Common/Table";
import { formatDate, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import Switch from "react-switch";
import { FaChevronDown, FaChevronUp, FaEdit } from 'react-icons/fa';
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import DOMPurify from "dompurify";
import { scrollToTop } from "../../constants/global";

export default function JobsScreen() {
  const initialFormState = {
    jobTitle: "",
    jobDescription: "",
    jobLocation: null,
    jobDepartment: null,
    jobValidTill: "",
    jobVacancy: "",
    jobExperience: null,
  };
  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);
  const [formState, setFormState] = useState(initialFormState);
  const [selectedId, setSelectedId] = useState(null);
  const [editSelectedId, setEditSelectedId] = useState(null);
  const { data: locationGroup } = useGet(ALL_LOCATION_DROPDOWN, { enabled: !!accessGranted });
  const { data: departmentGroup } = useGet(ALL_DEPARTMENT_DROPDOWN, { enabled: !!accessGranted });
  const [expandedRows, setExpandedRows] = useState({});
  const [showForm, setShowForm] = useState(false)

  const experienceOptions = [
    { label: "Fresher", value: "Fresher" },
    { label: "1-2 Years", value: "1-2 Years" },
    { label: "3-5 Years", value: "3-5 Years" },
    { label: "5+ Years", value: "5+ Years" },
  ];

  const {
    data: jobsData,
    isLoading: isLoadingJobs,
    refetch: getAllJobs,
  } = useGet(GET_ALL_JOBS, { enabled: !!accessGranted });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelectChange = (name) => (selectedOption) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: selectedOption,
    }));
  };

  const { isPending: isPendingDelete, mutate: statusChange } = usePost(
    STATUS_CHANGE_JOB + selectedId,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getAllJobs();
          handleClear()
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handleSave = (e) => {
    e.preventDefault()
    if (!formState.jobTitle) {
      toast.error("Please Enter Job Title");
    } else if (!formState.jobDepartment) {
      toast.error("Please Select Department");
    } else if (!formState.jobLocation) {
      toast.error("Please Select Location");
    } else if (!formState.jobExperience) {
      toast.error("Please Select Job Experience");
    } else if (!formState.jobVacancy) {
      toast.error("Please Enter Vacancy");
    } else if (!formState.jobValidTill) {
      toast.error("Please Enter Valid Till Date");
    } else if (!formState.jobDescription) {
      toast.error("Please Enter Job Description");
    } else {
      let params = {
        id: editSelectedId || 0,
        vacancy: formState.jobVacancy,
        applyEndDate: formState.jobValidTill + " 00:00:00",
        jobLocation: formState?.jobLocation?.value,
        experienceRequired: formState?.jobExperience?.value,
        departmentRequired: formState?.jobDepartment?.value,
        active: true,
        jobDescription: formState.jobDescription,
        jobTitle: formState.jobTitle,
      };
      if (editSelectedId) {
        updateJob(params);
      }
      else {
        createJob(params);
      }
    }
  };

  const { isPending: isPendingAdd, mutate: createJob } = usePost(CREATE_JOB, {
    onSuccess: (response) => {
      if (response?.data?.status === 1) {
        toast.success(response.data.message);
        getAllJobs();
        handleClear();
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { isPending: isPendingUpdate, mutate: updateJob } = usePost(UPDTATE_JOB, {
    onSuccess: (response) => {
      if (response?.data?.status === 1) {
        toast.success(response.data.message);
        getAllJobs();
        handleClear();
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleClear = () => {
    setFormState(initialFormState);
    setSelectedId(null)
    setEditSelectedId(null)
  };

  const handleStatusChange = (id) => {
    setSelectedId(id);
  };

  useEffect(() => {
    if (selectedId) {
      statusChange()
    }
  }, [selectedId, statusChange])

  const handleEdit = (row) => {
    scrollToTop()
    setFormState({
      jobTitle: row.jobTitle,
      jobDescription: row.jobDescription,
      jobLocation: {
        label: row.jobLocation,
        value: row.jobLocation,
      },
      jobDepartment: {
        label: row.departmentRequired,
        value: row.departmentRequired,
      },
      jobValidTill: row.applyEndDate?.split("T")[0],
      jobVacancy: row.vacancy,
      jobExperience: {
        label: row.experienceRequired,
        value: row.experienceRequired,
      },
    });
    setEditSelectedId(row.id);
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Manage</span>,
      cell: (row) => (
        <FaEdit
          style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
          onClick={() => handleEdit(row)}
          title="Manage Job"
          size={20}
        />
      ),
      width: '8%',
    },
    {
      name: <span className="font-weight-bold fs-13">Title</span>,
      selector: (row) => row.jobTitle,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.jobTitle}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Department</span>,
      selector: (row) => row.departmentRequired,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.departmentRequired}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Location</span>,
      selector: (row) => row.jobLocation,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.jobLocation}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Experience</span>,
      selector: (row) => row.experienceRequired,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.experienceRequired}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Vacancy (No. Of Positions)</span>,
      selector: (row) => row.vacancy,
      width: "15%",
      sortable: true,
      cell: (row) => <WordWrapCell>{row.vacancy}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Valid Till</span>,
      selector: (row) => formatDate(row.applyEndDate),
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{formatDate(row.applyEndDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Description</span>,
      selector: (row) => row.data,
      sortable: true,
      width: "57%",
      cell: (row, index) => {
        const isExpanded = expandedRows[index] || false; // Check if the current row is expanded

        const sanitizedDescription = row.jobDescription
          ? row.jobDescription.replace(/(\r\n|\n|\r)/g, "<br /><br />")
          : "";

        const truncatedDescription = sanitizedDescription.length > 100 ? sanitizedDescription.substring(0, 100) + '...' : sanitizedDescription;

        const toggleDescription = () => {
          setExpandedRows((prevState) => ({
            ...prevState,
            [index]: !isExpanded, // Toggle the expanded state for the current row
          }));
        };

        return (
          <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  isExpanded ? sanitizedDescription : truncatedDescription
                ),
              }}
            />

            {sanitizedDescription.length > 100 && (
              <button
                onClick={toggleDescription} // Toggle function for each row
                style={{
                  background: "none",
                  border: "none",
                  color: defaultTheme.goldColorLogo,
                  fontWeight: "bold",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "inherit",
                  marginTop: "10px",
                }}
              >
                {isExpanded ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
        );
      },
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      sortable: true,
      cell: (row) => (
        <Switch
          checked={row.active}
          offColor={defaultTheme.goldColorLogo}
          onColor={defaultTheme.primary}
          height={20}
          width={40}
          onChange={() => handleStatusChange(row.id)}
        />
      ),
    },
  ];

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'jobs');
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
      <Breadcrumbs title="Jobs" breadcrumbItem={editSelectedId ? 'Update Job' : 'Add Job'} />
      {(isPendingAdd || isLoadingJobs || isPendingDelete || isPendingUpdate) && <ScreenLoader />}
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
          <form onSubmit={handleSave}>
            <Card>
              <CardBody>
                <Row className="g-3">
                  <Col md="4">
                    <h6 className="font-size-11">Title <RequiredStar /></h6>
                    <input
                      name="jobTitle"
                      className="form-control"
                      type="text"
                      value={formState.jobTitle}
                      onChange={handleChange}
                      placeholder="Enter Job Title..."
                    />
                  </Col>
                  <Col md="4">
                    <h6 className="font-size-11">Department <RequiredStar /></h6>
                    <Select
                      style={{ zIndex: 9999 }}
                      menuPortalTarget={document.body}
                      value={formState.jobDepartment}
                      isClearable
                      onChange={handleSelectChange("jobDepartment")}
                      options={
                        Array.isArray(departmentGroup?.data?.data)
                          ? departmentGroup?.data?.data
                          : []
                      }
                    />
                  </Col>
                  <Col md="4">
                    <h6 className="font-size-11">Location <RequiredStar /></h6>
                    <Select
                      style={{ zIndex: 9999 }}
                      menuPortalTarget={document.body}
                      value={formState.jobLocation}
                      isClearable
                      onChange={handleSelectChange("jobLocation")}
                      options={
                        Array.isArray(locationGroup?.data?.data)
                          ? locationGroup?.data?.data
                          : []
                      }
                    />
                  </Col>
                  <Col md="4">
                    <h6 className="font-size-11">Experience <RequiredStar />
                    </h6>
                    <Select
                      style={{ zIndex: 9999 }}
                      menuPortalTarget={document.body}
                      value={formState.jobExperience}
                      onChange={handleSelectChange("jobExperience")}
                      options={experienceOptions}
                      isClearable
                    />
                  </Col>
                  <Col md="4">
                    <h6 className="font-size-11">Vacancy <RequiredStar />
                    </h6>
                    <input
                      name="jobVacancy"
                      className="form-control"
                      type="number"
                      value={formState.jobVacancy}
                      onChange={handleChange}
                      placeholder="Vacancy..."
                    />
                  </Col>
                  <Col md="4">
                    <h6 className="font-size-11">Valid Till <RequiredStar /></h6>
                    <input
                      name="jobValidTill"
                      className="form-control"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={formState.jobValidTill}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md="12">
                    <h6 className="font-size-11 mt-3">Job Description <RequiredStar /></h6>
                    <textarea
                      name="jobDescription"
                      required
                      className="form-control"
                      rows="5"
                      placeholder="Enter Job Description Here..."
                      value={formState.jobDescription}
                      onChange={handleChange}
                    ></textarea>
                  </Col>
                  <Col className="d-flex justify-content-center">
                    <Button
                      color="primary"
                      className="me-2"
                      type="submit"
                      onClick={handleSave}
                    >
                      {editSelectedId ? 'Update' : 'Save'}
                    </Button>
                    <Button
                      color="secondary"
                      type="button"
                      onClick={handleClear}
                    >
                      Clear
                    </Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </form>
        }

        {Array.isArray(jobsData?.data?.data) &&
          jobsData?.data?.data?.length > 0 && (
            <AppTable
              columns={columns}
              data={Array.isArray(jobsData?.data?.data) ? jobsData?.data?.data : []}
              pagination
            />
          )}
      </Container>
    </PageContent>
  );
}
