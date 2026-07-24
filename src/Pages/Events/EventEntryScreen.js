/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Card, CardBody, Input } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import { CREATE_EVENT_FORM, GET_ALL_EVENT_FORM_BY_ID, GET_ALL_USERS_DROPDOWN, GET_ASSIGNED_EVENT, GET_VISITOR_DATA_BY_MOBILE, SEND_OTP, VERIFY_TEXT_OTP } from "../../helpers/url_helper";
import { RegexFile } from "../../helpers/RegexFile";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import AppTable from "../../components/Common/Table";
import { formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import ApiClient from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import "../CSS/styles.css";

export default function EventEntryScreen() {
  const [accessGranted, setAccessGranted] = useState(null);
  const userId = useUserStore((state) => state.user.userId);
  const [flag, setFlag] = useState(false)
  const { data: assignedEvent } = useGet(GET_ASSIGNED_EVENT + userId, { enabled: !!accessGranted })
  const [otpShow, setOtpShow] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]); // 4 input boxes
  const inputRefs = useRef([]); // Array of references to each input field
  const [otpId, setOtpId] = useState("");
  const [visitorData, setVisitorData] = useState(null);
  const [page, setPage] = useState(1);
  const [errors, setErrors] = useState({});
  const LIMIT = 100;
  const [isLoading, setIsLoading] = useState(false)
  const [eventEntryData, setEventEntryData] = useState([]);
  const [totalElements, setTotalElements] = useState("");

  const initialFormState = {
    userName: "",
    mobileNo: "",
    toWhom: null,
    address: "",
    eventName: null,
    peopleCount: 1
  };

  // Handle OTP input changes
  const handleChangeOtp = (e, index) => {
    const value = e.target.value;

    // Allow only numeric input
    if (/[^0-9]/.test(value)) return;

    // Update OTP array
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    // Move to the next input if a value is entered
    if (value && index < 3) {
      inputRefs.current[index + 1].focus(); // Focus next input
    }
  };

  // Handle Backspace to move focus to previous box if the current one is empty
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus(); // Move focus to previous input
    }
  };

  // Focus on the respective input field
  const handleFocus = (index) => {
    inputRefs.current[index].focus(); // Focus the input box when clicked
  };

  const [formState, setFormState] = useState(initialFormState);
  const { data: adminList } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: !!accessGranted });

  const getEventDetails = (url) => {
    setIsLoading(true);
    ApiClient.get(url)
      .then(function (response) {
        setIsLoading(false);
        if (response?.data?.status === 1) {
          setEventEntryData(response.data.data.content);
          setTotalElements(response.data.data.totalElements);
        } else if (response.data.message !== 'No Event Form Found!') {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsLoading(false);
        toast.error(error.message);
      });
  };

  useEffect(() => {
    if (accessGranted) {
      getEventDetails(`${GET_ALL_EVENT_FORM_BY_ID}?page=${page - 1}&size=${LIMIT}&userId=${userId}`)
    }
  }, [accessGranted])

  const handleChange = (e) => {
    const { id, value } = e.target;

    const numberFields = ["mobileNo"];

    // Clear error for this field
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" })); // Clear error on change
    }

    // Handle mobile number validation
    if (numberFields.includes(id)) {
      // Validate that only digits and up to 10 characters are allowed
      if (/^\d{0,10}$/.test(value)) {
        setFormState((prev) => ({
          ...prev,
          [id]: value,
        }));
      }
      return; // Exit early for number fields
    }

    // For all other fields, update state without restrictions
    setFormState((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (field) => (selectedOption) => {
    setFormState((prev) => ({
      ...prev,
      [field]: selectedOption,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formState.userName) newErrors.userName = "Visitor Name is required.";
    if (!formState.mobileNo) {
      newErrors.mobileNo = "Mobile No. is required.";
    } else if (!RegexFile.mobileNo.test(formState.mobileNo)) {
      newErrors.mobileNo = "Mobile No must be a 10-digit number.";
    }
    if (!formState.toWhom) newErrors.toWhom = "Select Associate Name";
    if (!formState.address) newErrors.address = "Address is required.";
    if (!formState.eventName) newErrors.eventName = "Event Name is required.";
    if (!formState.peopleCount) newErrors.peopleCount = "People Count is required.";

    return newErrors;
  };

  useEffect(() => {
    if (Array.isArray(assignedEvent?.data?.data)) {
      const events = assignedEvent.data.data;

      // Map them to Select format if needed (label/value)
      const formattedEvents = events.map((event) => ({
        label: event.eventName,
        value: event.id,
      }));

      // Auto-select if only one
      if (formattedEvents.length === 1) {
        setFormState((prevState) => ({
          ...prevState,
          eventName: formattedEvents[0],
        }));
      }
    }
  }, [assignedEvent]);

  const { isPending, mutate } = usePost(CREATE_EVENT_FORM, {
    onSuccess: (response) => {
      if (response?.data?.status === 1) {
        toast.success(response.data.message);
        getEventDetails(`${GET_ALL_EVENT_FORM_BY_ID}?page=${page - 1}&size=${LIMIT}&userId=${userId}`)
        handleClear()
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Some Mandatory Fields Are Still Not Filled");
      return;
    } else if (!visitorData && !otpVerified) {
      setErrors(validationErrors);
      toast.error("Please Verify Mobile Number Before Submit.");
      return;
    }
    let params = {
      userName: formState.userName,
      mobileNumber: formState.mobileNo,
      address: formState?.address,
      toWhomId: formState?.toWhom?.value,
      visitorType: formState?.visitorType?.value,
      eventId: formState?.eventName?.value,
      createdById: userId,
      peopleCount: formState?.peopleCount
    };
    mutate(params);
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      width: "7%",
      cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Customer Details</span>,
      selector: (row) => row.userName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.userName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Event Name</span>,
      selector: (row) => row?.eventMaster?.eventName,
      sortable: true,
      cell: (row) => <WordWrapCell> {row?.eventMaster?.eventName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      selector: (row) => row.toWhomName,
      sortable: true,
      cell: (row) => <WordWrapCell> {row.toWhomName + " (" + row.toWhomId + ")"}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Address</span>,
      selector: (row) => row.address,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.address}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
      selector: (row) => row.createdDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Created By</span>,
      selector: (row) => row.createdByName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.createdByName}</WordWrapCell>
    },
  ];

  const { isPending: isVerifyOtpSend, mutate: mutateOtpVerify } = usePost(
    VERIFY_TEXT_OTP + otp.join("") + "&userId=" + userId + "&otpId=" + otpId,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          setOtpVerified(true);
          setOtpShow(false);
          setOtp(["", "", "", ""]);
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  useEffect(() => {
    // Trigger API call when OTP reaches 4 digits
    if (otp.join("").length === 4 && otpId) {
      mutateOtpVerify();
    }
  }, [mutateOtpVerify, otp, otpId]);

  const { isPending: isPendingOtpSend, mutate: mutateOtpSend } = usePost(
    SEND_OTP + formState.mobileNo + "&userId=" + userId,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          setOtpId(response.data.data.optId);
          setOtpShow(true);
          toast.success(response.data.message)
          // toast.success("Happy Code has been sent to customer via SMS as well as WhatsApp");
        } else {
          setOtpId("");
          setOtpShow(false);
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  useEffect(() => {
    // Check if visitorData is not empty
    if (visitorData !== null) {
      // Update formState with the values from visitorData
      setFormState((prevState) => ({
        ...prevState,
        userName: visitorData.name || "",
        mobileNo: visitorData.mobileNo || "",
        address: visitorData.address || "",
      }));
    } else {
      setFormState((prevState) => ({
        ...prevState,
        userName: "",
        address: "",
        purpose: "",
        toWhom: null,
        visitorType: null,
      }));
    }
  }, [visitorData]);

  useEffect(() => {
    if (visitorData?.toWhom) {
      const toWhom = adminList?.data?.data?.find(
        (item) => item.value == visitorData?.toWhom
      );
      if (toWhom) {
        setFormState((prevState) => ({ ...prevState, toWhom }));
      }
    }
  }, [adminList?.data?.data, visitorData?.toWhom]);

  const { isPending: isPendingMobileCheck, mutate: mutateMobileCheck } = usePost(GET_VISITOR_DATA_BY_MOBILE + formState.mobileNo, {
    onSuccess: (response) => {
      if (response?.data?.status === 1 && response?.data?.data !== null) {
        setVisitorData(response.data.data);
        setOtpShow(false);
      } else if (
        response?.data?.status === 1 &&
        response?.data?.data === null
      ) {
        mutateOtpSend();
        setVisitorData(null);
      } else {
        setVisitorData(null);
        setOtpShow(false);
      }
    },
    onError: (err) => {
      toast.error(err.message);
      setVisitorData(null);
      setOtpShow(false);
    },
  });

  useEffect(() => {
    if (formState?.mobileNo?.length === 10) {
      mutateMobileCheck();
    } else {
      setVisitorData(null);
    }
  }, [formState?.mobileNo?.length, mutateMobileCheck]);

  useEffect(() => {
    if (flag) {
      getEventDetails(`${GET_ALL_EVENT_FORM_BY_ID}?page=${page - 1}&size=${LIMIT}&userId=${userId}`)
    }
  }, [page])

  const handleClear = () => {
    setOtpVerified(false)
    setOtpShow(false)
    setOtpId('')
    if (assignedEvent.data.data?.length > 1) {
      setFormState((prevState) => ({
        ...prevState,
        userName: "",
        mobileNo: "",
        toWhom: null,
        address: "",
        eventName: null,
        peopleCount: 1
      }));
    }
    else {
      setFormState((prevState) => ({
        ...prevState,
        userName: "",
        mobileNo: "",
        toWhom: null,
        address: "",
        peopleCount: 1
      }));
    }
  }

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'event-entry');
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
      <Breadcrumbs title="Event" breadcrumbItem="Event Entry" />
      {(isPending || isLoading || isPendingOtpSend || isVerifyOtpSend || isPendingMobileCheck) && <ScreenLoader />}
      <Container fluid={true}>
        <form onSubmit={handleSubmit}>
          <Card className="shadow-sm">
            <CardBody>
              <Row className="g-2">
                {/* Mobile Number */}
                <Col xs="12" md="6">
                  <label className="form-label font-size-13 mt-2">
                    Mobile No. <RequiredStar />
                  </label>
                  <Input
                    id="mobileNo"
                    name="mobileNo"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    maxLength={10}
                    value={formState.mobileNo}
                    onChange={handleChange}
                    placeholder="Enter Mobile No..."
                    className={errors.mobileNo ? "is-invalid" : ""}
                  />
                  {errors.mobileNo && <div className="invalid-feedback">{errors.mobileNo}</div>}
                </Col>

                {/* OTP Section */}
                {otpShow && (
                  <Col xs="12" md="6">
                    <label className="form-label font-size-13 mt-2">
                      Happy Code <RequiredStar />
                    </label>
                    <div className="d-flex gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleChangeOtp(e, index)}
                          onFocus={() => handleFocus(index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          ref={(el) => (inputRefs.current[index] = el)}
                          className="form-control text-center otp-input"
                          style={{
                            width: "40px",
                            fontSize: "15px",
                            borderColor: defaultTheme.goldColorLogo,
                          }}
                        />
                      ))}
                    </div>
                  </Col>
                )}

                {/* Customer Name */}
                <Col xs="12" md="6">
                  <label className="form-label font-size-13 mt-2">
                    Customer Name <RequiredStar />
                  </label>
                  <input
                    id="userName"
                    className={`form-control ${errors.userName ? "is-invalid" : ""}`}
                    type="text"
                    value={formState.userName}
                    onChange={handleChange}
                    placeholder="Enter Customer Name..."
                  />
                  {errors.userName && <div className="invalid-feedback">{errors.userName}</div>}
                </Col>

                {/* Associate Name */}
                <Col xs="12" md="6">
                  <label className="form-label font-size-13 mt-2">
                    Associate Name <RequiredStar />
                  </label>
                  <Select
                    isClearable
                    value={formState.toWhom}
                    onChange={handleSelectChange("toWhom")}
                    options={Array.isArray(adminList?.data?.data) ? adminList.data.data : []}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor: errors.toWhom ? "red" : "black",
                        boxShadow: state.isFocused ? "0 0 0 1px #005b52" : "none",
                      }),
                    }}
                    className={errors.toWhom ? "is-invalid" : ""}
                    menuPortalTarget={document.body}
                  />
                  {errors.toWhom && <div className="invalid-feedback">{errors.toWhom}</div>}
                </Col>

                {/* Event Name */}
                <Col xs="12" md="6">
                  <label className="form-label font-size-13 mt-2">
                    Select Event <RequiredStar />
                  </label>
                  <Select
                    isClearable
                    value={formState.eventName}
                    onChange={handleSelectChange("eventName")}
                    options={
                      Array.isArray(assignedEvent?.data?.data)
                        ? assignedEvent.data.data.map((event) => ({
                          label: event.eventName,
                          value: event.id,
                        }))
                        : []
                    }
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor: errors.eventName ? "red" : "black",
                        boxShadow: state.isFocused ? "0 0 0 1px #005b52" : "none",
                      }),
                    }}
                    className={errors.eventName ? "is-invalid" : ""}
                    menuPortalTarget={document.body}
                  />
                  {errors.eventName && <div className="invalid-feedback">{errors.eventName}</div>}
                </Col>

                {/* Address */}
                <Col xs="12" md="6">
                  <label className="form-label font-size-13 mt-2">
                    Address / Location <RequiredStar />
                  </label>
                  <input
                    id="address"
                    className={`form-control ${errors.address ? "is-invalid" : ""}`}
                    type="text"
                    value={formState.address}
                    placeholder="Enter Address..."
                    onChange={handleChange}
                  />
                  {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                </Col>

                {/* People Count */}
                <Col xs="12" md="6">
                  <label className="form-label font-size-13 mt-2">
                    No. Of People <RequiredStar />
                  </label>
                  <input
                    id="peopleCount"
                    className={`form-control ${errors.peopleCount ? "is-invalid" : ""}`}
                    type="number"
                    value={formState.peopleCount}
                    onChange={handleChange}
                    placeholder="Enter Count..."
                  />
                  {errors.peopleCount && <div className="invalid-feedback">{errors.peopleCount}</div>}
                </Col>

                {/* Buttons */}
                <div className="mt-4 d-flex justify-content-center">
                  <button type="submit" className="btn btn-primary me-2">
                    Save
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleClear}>
                    Cancel
                  </button>
                </div>
              </Row>
            </CardBody>
          </Card>
        </form>

      </Container>
      {eventEntryData.length > 0 && (
        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={eventEntryData}
          paginationTotalRows={totalElements}
          paginationServer
          onChangePage={(newPage) => {
            setPage(newPage);
            setFlag(true);
          }}
          pagination

        />
      )}
    </PageContent>
  );
}
