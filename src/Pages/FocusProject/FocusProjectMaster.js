import { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, Button, Container, Form, Input } from "reactstrap";
import Select from "react-select";
import { useGet, usePost } from "../../Hooks/useApi";
import { ALL_LOCATION_DROPDOWN, GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_, CREATE_FOCUS_PROJECT, GET_ALL_FOCUS_PROJECT, STATUS_CHANGE_FOCUS_PROJECT, UPDATE_FOCUS_PROJECT } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import { toast } from "react-toastify";
import AppTable from "../../components/Common/Table";
import { formatDate, formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { FaEdit } from "react-icons/fa";
import { defaultTheme } from "../../helpers/defaultTheme";
import ApiClient from "../../helpers/api_helper";
import Switch from "react-switch";
import "../CSS/styles.css";
import { scrollToTop } from "../../constants/global";

const FocusProjectMaster = () => {
    const [accessGranted, setAccessGranted] = useState(null);
    const { data: locationList } = useGet(ALL_LOCATION_DROPDOWN, { enabled: !!accessGranted });
    const userId = useUserStore((state) => state.user.userId);
    const { data: groupList, isLoading, refetch: getAllData, } = useGet(`${GET_ALL_FOCUS_PROJECT}`, { enabled: !!accessGranted });
    const [expandedRows, setExpandedRows] = useState({})
    const [builder, setBuilder] = useState(null);
    const [project, setProject] = useState(null);
    const [focusPercentage, setFocusPercentage] = useState(0);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [editId, setEditId] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const [updateProject, setUpdateProject] = useState(null);
    const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_, { enabled: !!accessGranted });
    const { data: projectList } = useGet(`${GET_PROJECT_BY_BUILDER_}${builder?.value}`, { enabled: Boolean(builder && accessGranted) });

    // Handle changes in multi-select dropdown for users
    const handleSelectChange = (selectedOptions) => {
        const selectedValues = selectedOptions
            ? selectedOptions.map((option) => option.value)
            : [];
        setSelectedLocations(selectedValues);
    };

    // Reset values after form submission
    const resetValues = () => {
        setSelectedLocations([]);
        setFromDate("");
        setToDate("");
        setFocusPercentage(0);
        setBuilder(null);
        setProject(null);
        setEditId(null);
        setUpdateProject(null);
    };

    // API call to create a group
    const { isPending: addLoading, mutate: addFocusProject } = usePost(`${CREATE_FOCUS_PROJECT}?userId=${userId}`, {
        onSuccess: (response) => {
            if (response?.data?.status === 1) {
                getAllData();
                resetValues();
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        },
        onError: (err) => {
            resetValues();
            toast.error(err.message);
        },
    });

    // API call to create a group
    const { isPending: updateLoading, mutate: updateFocusProject } = usePost(`${UPDATE_FOCUS_PROJECT}?userId=${userId}&id=${editId}`, {
        onSuccess: (response) => {
            if (response?.data?.status === 1) {
                getAllData();
                resetValues();
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        },
        onError: (err) => {
            resetValues();
            toast.error(err.message);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if fromDate is provided
        if (!fromDate) {
            toast.error("Please Input From Date");
        }
        // Check if toDate is provided
        else if (!toDate) {
            toast.error("Please Input To Date");
        }
        else if (new Date(fromDate) > new Date(toDate)) {
            toast.error("From Date cannot be later than To Date");
        }
        else if (!builder) {
            toast.error("Please Select Builder");
        }
        else if (!project || project?.value === '') {
            toast.error("Please Select Project");
        }

        // Check if at least one location is selected
        else if (selectedLocations.length < 1) {
            toast.error("Please Select At Least One Branch");
        }
        else if (focusPercentage <= 0) {
            toast.error("Please Input Valid Focus %");
        }
        else if (focusPercentage > 100) {
            toast.error("Focus % cannot be more than 100");
        }
        // Check if a file is selected and it's a PDF
        else {
            const postData = {
                fromDate,
                toDate,
                builder: builder.label,
                project: project.label,
                branch: selectedLocations,
                focus: focusPercentage
            };
            if (editId) {
                updateFocusProject(postData);
                return;
            }
            addFocusProject(postData);
        }
    };

    const handleSwitchChange = (row) => {
        setIsPending(true);
        ApiClient.post(`${STATUS_CHANGE_FOCUS_PROJECT}${row.id}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    getAllData();
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    const handleEdit = (row) => {
        scrollToTop()
        // Set date, focus percentage, and selected locations
        setFromDate(row.fromDate);
        setToDate(row.toDate);
        setFocusPercentage(row.focus);
        setSelectedLocations(row.branch);
        setEditId(row.id);
        setUpdateProject({ value: row.projectId, label: row.project })

        // Find the builder by name in the builder list
        const selectedBuilder = builderList?.data?.data?.find(builderItem => builderItem.label === row.builder);

        // Update the builder state (this will trigger the re-fetch of the project list)
        if (selectedBuilder) {
            setBuilder({ value: selectedBuilder.value, label: selectedBuilder.label });
        } else {
            setBuilder({ value: '', label: '' }); // Handle case where no builder is found
        }
    };

    // Trigger the project list fetch when builder changes
    useEffect(() => {
        if (builder?.value) {
            // Trigger the project API request only if builder has a value
            setProject({ value: '', label: '' }); // Clear project initially when changing builder
        }
    }, [builder?.value]);

    // You can set the project after the projectList is fetched successfully
    useEffect(() => {
        if (projectList?.data?.data && builder?.value) {
            const selectedProject = projectList?.data?.data.find(projectItem => projectItem.label === updateProject?.label);
            if (selectedProject) {
                setProject({ value: selectedProject.value, label: selectedProject.label });
            }
        }
    }, [projectList?.data?.data, builder?.value, updateProject]); // Only re-run when project list or builder changes

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
                    title="Manage Focus Project"
                    size={20}
                />
            ),
            width: '8%',
        },
        {
            name: <span className="font-weight-bold fs-13">Builder</span>,
            selector: (row) => row.builder,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.builder}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Project</span>,
            selector: (row) => row.project,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.project}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">From Date</span>,
            selector: (row) => row.fromDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.fromDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">To Date</span>,
            selector: (row) => row.toDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.toDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Focus %</span>,
            selector: (row) => row.focus,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.focus + '%'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Branches</span>,
            selector: (row) => row.branch,
            width: "30%",
            sortable: true,
            cell: (row, index) => {
                const isExpanded = expandedRows[index] || false;
                const locations = row.branch || []; // Direct array of strings

                const sanitizedLocations = locations; // `locations` is already an array of strings

                const visibleLocations = isExpanded
                    ? sanitizedLocations
                    : sanitizedLocations.slice(0, 5);  // Show first 5 only when collapsed

                const toggleDescription = () => {
                    setExpandedRows((prevState) => ({
                        ...prevState,
                        [index]: !isExpanded,
                    }));
                };

                return (
                    <WordWrapCell>
                        <div className="d-flex flex-wrap gap-1">
                            {visibleLocations.map((location, i) => (
                                <span
                                    key={i}
                                    className="badge bg-light border text-dark"
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: "12px",
                                        fontSize: "12px",
                                    }}
                                >
                                    {location}  {/* Directly use the location string */}
                                </span>
                            ))}
                        </div>

                        {sanitizedLocations.length > 5 && (
                            <div className="mt-2">
                                <button
                                    onClick={toggleDescription}
                                    aria-expanded={isExpanded}
                                    aria-controls={`locations-list-${index}`}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: defaultTheme.goldColorLogo,
                                        fontWeight: "500",
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                        padding: 0,
                                        fontSize: "13px",
                                    }}
                                >
                                    {isExpanded
                                        ? "Show Less"
                                        : `+${sanitizedLocations.length - 5} More`}
                                </button>
                            </div>
                        )}
                    </WordWrapCell>
                );
            },
        },
        {
            name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
            selector: (row) => formatDateTime(row.createdDate),
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Created By</span>,
            selector: (row) => row.createdBy,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.createdBy}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            cell: (row) => (
                <Switch
                    checked={row.active}
                    offColor={defaultTheme.goldColorLogo}
                    onColor={defaultTheme.primary}
                    height={20}
                    width={40}
                    onChange={() => handleSwitchChange(row)}
                />
            ),
        },
    ];

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'focus-project-master');
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
            <Container fluid={true}>
                <Breadcrumbs title="Focus Project" breadcrumbItem="Master" />
                {(addLoading || isLoading || isPending || updateLoading) && <ScreenLoader />}
                <Card>
                    <CardBody>
                        <Form className="needs-validation" onSubmit={handleSubmit}>
                            <Row className="g-3">
                                <Col md="3">
                                    <h6 className="font-size-11">Builder <RequiredStar /></h6>
                                    <Select
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        options={
                                            Array.isArray(builderList?.data?.data)
                                                ? builderList?.data?.data
                                                : []
                                        }
                                        onChange={setBuilder}
                                        value={builder}
                                        isClearable
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Project <RequiredStar /></h6>
                                    <Select
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        options={
                                            Array.isArray(projectList?.data?.data)
                                                ? projectList?.data?.data
                                                : []
                                        }
                                        onChange={setProject}
                                        value={project}
                                        isDisabled={!builder}
                                        isClearable
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Focus Period Start <RequiredStar /></h6>
                                    <Input
                                        name="fromDate"
                                        type="date"
                                        className="form-control"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Focus Period End <RequiredStar /></h6>
                                    <Input
                                        name="toDate"
                                        type="date"
                                        className="form-control"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="6">
                                    <h6 className="font-size-11">Select Branch <RequiredStar />{" "}</h6>
                                    <Select
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        options={
                                            Array.isArray(locationList?.data?.data)
                                                ? locationList?.data?.data
                                                : []
                                        }
                                        isMulti
                                        closeMenuOnSelect={false}
                                        value={
                                            Array.isArray(locationList?.data?.data)
                                                ? locationList?.data?.data.filter((location) =>
                                                    selectedLocations.includes(location.value)
                                                )
                                                : null
                                        }
                                        onChange={handleSelectChange} // Update selected locations state
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Focus % <RequiredStar /></h6>
                                    <Input
                                        name="focusPercentage"
                                        placeholder="Type here..."
                                        type="number"
                                        className="form-control"
                                        value={focusPercentage}
                                        onChange={(e) => setFocusPercentage(e.target.value)}
                                    />
                                </Col>
                                <Col md="3" className="d-flex align-items-end">
                                    <Button
                                        type="submit"
                                        color="primary"
                                        className="me-2"
                                    >
                                        {editId ? "Update" : "Submit"}
                                    </Button>{" "}
                                    <Button
                                        type="reset"
                                        color="secondary"
                                        onClick={resetValues}
                                    >
                                        Cancel
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </CardBody>
                </Card>

                {/* Table */}
                {Array.isArray(groupList?.data?.data) &&
                    groupList?.data?.data?.length > 0 && (
                        <AppTable
                            progressPending={isLoading}
                            columns={columns}
                            data={
                                Array.isArray(groupList?.data?.data)
                                    ? groupList?.data?.data
                                    : []
                            }
                            pagination
                        />
                    )}

            </Container>
        </PageContent>
    );
};

export default FocusProjectMaster;