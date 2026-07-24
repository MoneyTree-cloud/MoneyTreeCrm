import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import {
  CHANGE_STATUS_EVENT_MASTER,
  CREATE_EVENT_MASTER,
  GET_ALL_EVENT_MASTER,
  GET_ALL_USERS_DROPDOWN,
  UPDATE_EVENT_MASTER
} from "../../helpers/url_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import AppTable from "../../components/Common/Table";
import Switch from "react-switch";
import { useUserStore } from "../../store/useUserStore";
import { formatDate, formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import Select from "react-select";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { scrollToTop } from "../../constants/global";

export default function CreateEvent() {
  const userId = useUserStore((state) => state.user.userId);

  const initialFormState = {
    eventPlaceName: "",
    eventDate: "",
    eventUserSelected: []
  };
  const [editMode, setEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [formState, setFormState] = useState(initialFormState);
  const [rowId, setRowId] = useState("");
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const [accessGranted, setAccessGranted] = useState(null);
  const { data: eventUsersList } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: !!accessGranted });

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" })); // Clear error on change
    }
    setFormState((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formState.eventPlaceName)
      newErrors.eventPlaceName = "Event Place Name is required.";
    if (!formState.eventDate) newErrors.eventDate = "Event Date is required.";
    return newErrors;
  };

  const {
    data: eventMasterData,
    isLoading,
    refetch: getAllEventData
  } = useGet(`${GET_ALL_EVENT_MASTER}?page=${page - 1}&size=500`, { enabled: !!accessGranted });

  const { isPending, mutate: addEvent } = usePost(
    `${CREATE_EVENT_MASTER}`,
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

  const { isPending: isPendingUpdate, mutate: updateEvent } = usePost(
    `${UPDATE_EVENT_MASTER}`,
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

  const { isPending: isPendingStatus, mutate: mutateStatus } = usePost(
    `${CHANGE_STATUS_EVENT_MASTER}?eventId=${rowId}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getAllEventData()
          setRowId("");
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
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Some Mandatory Fields Are Still Not Filled");
      return;
    }
    const selectedUsers = formState?.eventUserSelected?.map(item => {
      // Extract number between parentheses in the label
      const match = item.value;
      return match ? parseInt(match) : null;
    }).filter(id => id !== null); // Remove any nulls in case of no match

    const payload = {
      eventId: editingEventId || 0,
      name: formState?.eventPlaceName,
      date: formState?.eventDate,
      userId: parseInt(userId),
      users: selectedUsers
    };

    if (editMode) {
      updateEvent(payload);
    } else {
      addEvent(payload);
    }

  };

  const handleSwitchChange = (id) => {
    setRowId(id);
  };

  const handleMultiSelectChange = (selectedOptions) => {
    const selectedValues = selectedOptions || [];

    setFormState((prevState) => ({
      ...prevState,
      eventUserSelected: selectedValues,
    }));
    if (errors.eventUserSelected) {
      setErrors((prev) => ({ ...prev, eventUserSelected: "" }));
    }
  };
  useEffect(() => {
    if (rowId) {
      mutateStatus();
    }
  }, [mutateStatus, rowId]);

  const prefillUsersFromEvent = (event) => {
    scrollToTop()
    const employeeCodesFromEvent = event.userMapping.map(
      (mapping) => mapping.userEmpCode
    );

    const matchedOptions = (eventUsersList?.data?.data || []).filter((option) => {
      const match = option.label?.match(/\((\d+)\)/); // Extract number from label
      const empCodeInLabel = match?.[1];
      return empCodeInLabel && employeeCodesFromEvent.includes(empCodeInLabel);
    });

    setFormState((prevState) => ({
      ...prevState,
      eventUserSelected: matchedOptions,
      eventPlaceName: event.eventName,
      eventDate: event.eventDate,
    }));

    setEditMode(true);
    setEditingEventId(event.id);
  };


  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "7%",
    },
    {
      name: <span className="font-weight-bold fs-13">Manage</span>,
      width: "10%",
      cell: (row) => (
        <i
          className="ri-pencil-fill align-bottom me-2"
          style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
          onClick={() => prefillUsersFromEvent(row)}
        ></i>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
      selector: (row) => row.createdDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Event Place</span>,
      selector: (row) => row.eventName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.eventName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Event End Date</span>,
      selector: (row) => row.eventDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDate(row.eventDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Assigned To</span>,
      selector: (row) => row.userMapping,
      sortable: true,
      width: "25%",
      cell: (row) => <WordWrapCell>{row.userMapping
        .map((user) => user.username)
        .join(", ")}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      cell: (row) => (
        <Switch
          checked={row.active === true}
          offColor={defaultTheme.goldColorLogo}
          onColor={defaultTheme.primary}
          height={20}
          width={40}
          onChange={() => handleSwitchChange(row.id)}
        />
      ),
    },
  ];

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'create-event');
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
      <Breadcrumbs title="Event" breadcrumbItem="Create Event" />
      {(isPending || isLoading || isPendingStatus || isPendingUpdate) && <ScreenLoader />}
      <Container fluid={true}>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardBody>
              <Row className="g-3">
                {/* Event Place */}
                <Col xs="12" md="3">
                  <label className="form-label font-size-10">
                    Event Place <RequiredStar />
                  </label>
                  <input
                    id="eventPlaceName"
                    className={`form-control ${errors.eventPlaceName ? "is-invalid" : ""}`}
                    type="text"
                    value={formState.eventPlaceName}
                    onChange={handleChange}
                    placeholder="Enter Event Place..."
                  />
                  {errors.eventPlaceName && (
                    <div className="invalid-feedback font-size-11">
                      {errors.eventPlaceName}
                    </div>
                  )}
                </Col>

                {/* Event Date */}
                <Col xs="12" md="3">
                  <label className="form-label font-size-10">
                    Event End Date <RequiredStar />
                  </label>
                  <input
                    id="eventDate"
                    type="date"
                    className={`form-control ${errors.eventDate ? "is-invalid" : ""}`}
                    value={formState.eventDate}
                    onChange={handleChange}
                  />
                  {errors.eventDate && (
                    <div className="invalid-feedback font-size-11">
                      {errors.eventDate}
                    </div>
                  )}
                </Col>

                {/* Assign Users */}
                <Col xs="12" md="6">
                  <label className="form-label font-size-10">
                    Select User To Assign <RequiredStar />
                  </label>
                  <Select
                    isClearable
                    isMulti
                    closeMenuOnSelect={false}
                    value={formState.eventUserSelected}
                    onChange={handleMultiSelectChange}
                    options={eventUsersList?.data?.data || []}
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
                      setErrors({});
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
          Array.isArray(eventMasterData?.data?.data?.content)
            ? eventMasterData?.data?.data?.content
            : []
        }
        paginationTotalRows={eventMasterData?.data?.data?.totalElements}
        paginationServer
        onChangePage={(newPage) => {
          setPage(newPage);
          getAllEventData();
        }}
        pagination
      />
    </PageContent>
  );
}
