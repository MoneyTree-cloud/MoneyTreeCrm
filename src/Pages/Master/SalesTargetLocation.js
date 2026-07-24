import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import { ALL_LOCATION_DROPDOWN, CREATE_SALES_TARGET_GROUP, GET_ALL_MAIN_TEAM_SUB_TEAM_DROPDOWN, GET_ALL_SALES_TARGET_GROUP, UPDATE_SALES_TARGET_GROUP } from "../../helpers/url_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import AppTable from "../../components/Common/Table";
import { useUserStore } from "../../store/useUserStore";
import { formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import Select from "react-select";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { scrollToTop } from "../../constants/global";

export default function SalesTargetLocation() {
    const userId = useUserStore((state) => state.user.userId);
    const initialFormState = {
        branchName: null,
        branchUserSelected: []
    };
    const [editMode, setEditMode] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);
    const [formState, setFormState] = useState(initialFormState);
    const [accessGranted, setAccessGranted] = useState(null);
    const { data: mainTeamSubTeam } = useGet(GET_ALL_MAIN_TEAM_SUB_TEAM_DROPDOWN, { enabled: !!accessGranted });
    const { data: locationList } = useGet(ALL_LOCATION_DROPDOWN);

    const mainTeamSubTeamOptions = mainTeamSubTeam?.data?.data?.map((emp) => ({
        label: `${emp?.name} (${emp?.empCode}) (${emp.isMainTeam ? emp?.mainTeam : emp?.subTeam})`,
        value: emp?.empCode,
        // mainTeam: emp?.mainTeam,
        // subTeam: emp?.subTeam
    }));
    const [expandedRows, setExpandedRows] = useState({})

    const { data: eventMasterData, isLoading, refetch: getAllEventData } = useGet(`${GET_ALL_SALES_TARGET_GROUP}`, { enabled: !!accessGranted });

    const { isPending, mutate: addData } = usePost(
        `${CREATE_SALES_TARGET_GROUP}`,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    getAllEventData()
                    setFormState(initialFormState);
                    setEditMode(false);
                    setEditingEventId(null);
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    const { isPending: isPendingUpdate, mutate: updateData } = usePost(
        `${UPDATE_SALES_TARGET_GROUP}`,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    getAllEventData()
                    setFormState(initialFormState);
                    setEditMode(false);
                    setEditingEventId(null);
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formState.branchName) {
            toast.error('Branch is required')
            return
        }
        else if (formState.branchUserSelected.length < 1) {
            toast.error("Select User to continue")
            return
        }
        const selectedUsers = formState?.branchUserSelected?.map(item => {
            // Extract number between parentheses in the label
            const match = item.value;
            return match ? parseInt(match) : null;
        }).filter(id => id !== null); // Remove any nulls in case of no match

        const payload = {
            id: editingEventId || 0,
            name: formState?.branchName?.value,
            createdBy: parseInt(userId),
            memberId: selectedUsers
        };

        if (editMode) {
            updateData(payload);
        } else {
            addData(payload);
        }

    };

    const handleMultiSelectChange = (selectedOptions) => {
        const selectedValues = selectedOptions || [];

        setFormState((prevState) => ({
            ...prevState,
            branchUserSelected: selectedValues,
        }));
    };

    const handleSelectChange = (selectedOptions) => {
        const selectedValues = selectedOptions;

        setFormState((prevState) => ({
            ...prevState,
            branchName: selectedValues,
        }));
    };

    const prefillUsersFromEvent = (event) => {
        scrollToTop()
        const employeeCodesFromEvent = event.members.map(
            (mapping) => mapping.empCode
        );

        const matchedOptions = (mainTeamSubTeamOptions || []).filter((option) => {
            const match = option.label?.match(/\((\d+)\)/); // Extract number from label
            const empCodeInLabel = match?.[1];
            return empCodeInLabel && employeeCodesFromEvent.includes(empCodeInLabel);
        });

        setFormState((prevState) => ({
            ...prevState,
            branchUserSelected: matchedOptions,
            branchName: locationList?.data?.data?.find((item) => item.label === event.name),
        }));

        setEditMode(true);
        setEditingEventId(event.id);
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">Manage</span>,
            width: "8%",
            cell: (row) => (
                <i
                    className="ri-pencil-fill align-bottom me-2"
                    style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                    onClick={() => prefillUsersFromEvent(row)}
                ></i>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Name</span>,
            selector: (row) => row.name,
            width: "10%",
            sortable: true,
            cell: (row) => <WordWrapCell>{row.name}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Members</span>,
            selector: (row) => row.members,
            sortable: true,
            cell: (row, index) => {
                const isExpanded = expandedRows[index] || false;

                const members = row.members || [];

                const sanitizedMembers = members.map(
                    (user) => `${user.empName} (${user.empCode})`
                );

                const visibleMembers = isExpanded ? sanitizedMembers : sanitizedMembers.slice(0, 5); // Show first 5 only when collapsed

                const toggleDescription = () => {
                    setExpandedRows((prevState) => ({
                        ...prevState,
                        [index]: !isExpanded,
                    }));
                };

                return (
                    <WordWrapCell>
                        <div className="d-flex flex-wrap gap-1">
                            {visibleMembers.map((member, i) => (
                                <span
                                    key={i}
                                    className="badge bg-light border text-dark"
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: "12px",
                                        fontSize: "12px",
                                    }}
                                >
                                    {member}
                                </span>
                            ))}
                        </div>

                        {sanitizedMembers.length > 5 && (
                            <div className="mt-2">
                                <button
                                    onClick={toggleDescription}
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
                                    {isExpanded ? "Show Less" : `+${sanitizedMembers.length - 5} More`}
                                </button>
                            </div>
                        )}
                    </WordWrapCell>
                );
            }

        },
        {
            name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
            selector: (row) => row.createdAt,
            sortable: true,
            width: "15%",
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdAt)}</WordWrapCell>
        }
    ];

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'sales-target-location');
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
            <Breadcrumbs title="Sales" breadcrumbItem="Target Branch" />
            {(isPending || isLoading || isPendingUpdate) && <ScreenLoader />}
            <Container fluid={true}>
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardBody>
                            <Row className="g-3">
                                {/* Event Place */}
                                <Col xs="12" md="3">
                                    <label className="form-label font-size-10">
                                        Branch <span className="text-danger">*</span>
                                    </label>
                                    <Select
                                        isClearable
                                        value={formState.branchName}
                                        onChange={handleSelectChange}
                                        options={locationList?.data?.data || []}
                                        menuPortalTarget={document.body}
                                        styles={{
                                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                        }}
                                    />
                                </Col>

                                {/* Assign Users */}
                                <Col xs="12" md="">
                                    <label className="form-label font-size-10">
                                        Select User To Assign <span className="text-danger">*</span>
                                    </label>
                                    <Select
                                        isClearable
                                        isMulti
                                        closeMenuOnSelect={false}
                                        value={formState.branchUserSelected}
                                        onChange={handleMultiSelectChange}
                                        options={mainTeamSubTeamOptions || []}
                                        menuPortalTarget={document.body}
                                        styles={{
                                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                        }}
                                    />
                                </Col>

                                {/* Buttons */}
                                <div className="mt-4 d-flex justify-content-center">
                                    <Button
                                        color="primary"
                                        type="submit"
                                        className="me-2"
                                    >
                                        {editMode ? "Update" : "Save"}
                                    </Button>
                                    <Button
                                        color="secondary"
                                        type="button"
                                        onClick={() => {
                                            setFormState(initialFormState);
                                            setEditMode(false);
                                            setEditingEventId(null);
                                        }}
                                        className="me-2"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </Row>
                        </CardBody>
                    </Card>
                </form>

            </Container>

            <AppTable
                progressPending={isLoading}
                columns={columns}
                data={
                    Array.isArray(eventMasterData?.data?.data)
                        ? eventMasterData?.data?.data
                        : []
                }
                pagination

            />
        </PageContent>
    );
}
