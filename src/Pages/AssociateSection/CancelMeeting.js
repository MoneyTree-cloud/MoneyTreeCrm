/* eslint-disable eqeqeq */
import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import {
  CANCEL_ASSOCIATE_MEETING,
  GET_ALL_PROJECT_DROPDOWN,
  GET_ALL_PROSPECTS_MASTER,
  GET_DATA_FROM_PIN_CODE,
} from "../../helpers/url_helper";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { RequiredStar } from "../../helpers/function_helper";

export default function CancelMeeting() {
  const location = useLocation();
  const rowData = location?.state?.row;
  const { data: projectData } = useGet(GET_ALL_PROJECT_DROPDOWN);
  const [structuredOutput, setStructuredOutput] = useState({});
  const userName = useUserStore((state) => state.user.userName);
  const today = new Date();
  const formattedDate = today.toISOString()?.split("T")[0]; // Format as YYYY-MM-DD

  const navigation = useNavigate();
  const [formState, setFormState] = useState({
    meetingType: null,
    date: "",
    assName: "",
    clientName: "",
    phoneNo: "",
    budget: null,
    project: null,
    address: "",
    pin: "",
    city: null,
    state: "",
    occupation: null,
    dueDate: "",
    prospectPurpose: null,
    timing: null,
    source: null,
    meetingAttempt: null,
    emailId: "",
    tlName: "",
    siteVisit: null,
    meetingLocation: null,
    meetingStatus: null,
    meetingPurpose: null,
    swot: "",
    prospectsRemarks: "",
    remarks: "",
  });

  const { data, isLoading } = useGet(GET_ALL_PROSPECTS_MASTER);
  const [errors, setErrors] = useState({});

  const { data: pinData, refetch: getPinData } = useGet(
    GET_DATA_FROM_PIN_CODE + formState.pin,
    { enabled: formState?.pin?.length === 6 } // Use enabled option for conditional fetching
  );

  useEffect(() => {
    if (formState?.pin?.length === 6) {
      getPinData(); // Fetch data when the PIN length is 6
    }
  }, [formState?.pin, getPinData]);

  useEffect(() => {
    if (formState?.pin?.length === 6 && pinData?.data?.status === 0) {
      toast.error(pinData?.data?.message);
    }
  }, [formState?.pin?.length, pinData]);

  const transformedData = useMemo(() => {
    if (pinData && pinData.data?.data?.length > 0) {
      return (
        pinData.data.data[0].blocks?.map((block) => ({
          label: block,
          value: block,
        })) || []
      );
    }
    return []; // Clear to an empty array if conditions are not met
  }, [pinData]);

  useEffect(() => {
    // Set city if transformedData has exactly one item
    if (transformedData?.length === 1) {
      setFormState((prevState) => ({
        ...prevState,
        city: transformedData[0],
      }));

      // Clear any existing city error
      setErrors((prevErrors) => ({
        ...prevErrors,
        city: undefined,
      }));
    }
  }, [transformedData]);

  useEffect(() => {
    const pinState = pinData?.data?.data[0]?.state;
    if (pinState) {
      setFormState((prevState) => ({
        ...prevState,
        state: pinState,
      }));
    }
  }, [pinData]);

  useEffect(() => {
    if (data?.data?.status_code === 1) {
      const output = {}; // Create a new output object

      data.data.object.forEach((item) => {
        const { masterTypeDesc, meetingType, id } = item;
        if (!output[masterTypeDesc]) {
          output[masterTypeDesc] = [];
        }
        output[masterTypeDesc].push({
          label: meetingType,
          value: id.toString(),
        });
      });

      setStructuredOutput(output); // Update state with the structured output
    }
  }, [data]);

  useEffect(() => {
    if (Object.keys(rowData).length > 0) {
      setFormState((prev) => ({
        ...prev,
        meetingType:
          structuredOutput["Type"]?.find(
            (item) => item.value == rowData.meetTypeId
          ) || null,
        date: rowData.meetingDate ? rowData.meetingDate.split(" ")[0] : "", // Format date
        assName: rowData.loginUserName,
        clientName: rowData.clientName,
        phoneNo: rowData.phoneNo,
        budget:
          structuredOutput["Budget Dropdown"]?.find(
            (item) => item.value == rowData.budgetId
          ) || null,
        project:
          projectData?.data?.data?.find(
            (item) => item.value == rowData.projectId
          ) || null,
        address: rowData.address,
        pin: rowData.pin,
        city: rowData.city,
        state: rowData.state,
        occupation: rowData.occupation,
        dueDate: rowData.meetingDueDate
          ? rowData.meetingDueDate.split(" ")[0]
          : "", // Format date
        prospectPurpose:
          structuredOutput["Purpose Dropdown"]?.find(
            (item) => item.value == rowData.prospectPurposeId
          ) || null,
        timing:
          structuredOutput["timing Dropdown"]?.find(
            (item) => item.value == rowData.meetingTimeId
          ) || null,
        source:
          structuredOutput["Data Source"]?.find(
            (item) => item.value == rowData.meetingSourceId
          ) || null,
        emailId: rowData.emailId || "", // Use empty string if null
        tlName: rowData.meetingTLName || "", // Use empty string if null
        prospectsRemarks: rowData.prospectsRemarks || "",
        remarks: rowData.overAllRemarks || "",
        siteVisit:
          structuredOutput["Site visite"]?.find(
            (item) => item.value == rowData.siteVisitStatusId
          ) || null,
      }));
    }
  }, [projectData?.data?.data, rowData, structuredOutput]); // Dependency on rowData

  const { mutate, isPending } = usePost(CANCEL_ASSOCIATE_MEETING, {
    onSuccess: (response) => {
      if (response?.data.status === 1) {
        toast.success(response.data.message);
        handleCancel();
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleChange = (e) => {
    const { id, value } = e.target;

    // Handle PIN field validation
    if (id === "phoneNo") {
      if (/^\d{0,10}$/.test(value)) {
        setFormState({ ...formState, [id]: value });
      }
    }
    if (id === "pin") {
      // Allow only numbers and limit to 6 digits
      if (/^\d*$/.test(value) && value.length <= 6) {
        setFormState((prevState) => ({
          ...prevState,
          [id]: value,
        }));

        if (value.length === 6) {
          getPinData(); // Fetch data
        }
        // Clear error if exists
        if (errors[id]) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [id]: undefined,
          }));
        }
      }
    } else {
      // Handle other fields normally
      setFormState((prevState) => ({
        ...prevState,
        [id]: value,
      }));

      // Clear error if exists
      if (errors[id]) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [id]: undefined,
        }));
      }
    }
  };

  const handleSelectChange = (field) => (selectedOption) => {
    setFormState((prev) => ({
      ...prev,
      [field]: selectedOption,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: "", // Clear error for this field
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formState.remarks) newErrors.remarks = "Remarks are required.";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.error("Some Mandatory Fields Are Still Not Filled");
      return;
    }
    const meetRemarksWordCount = formState.remarks.trim().split(/\s+/).filter((word) => word.length > 0).length;
    if (meetRemarksWordCount < 100) {
      toast.error("Meeting remarks should be at least 100 words.");
      return;
    }
    // If there are no errors, proceed to submit
    const params = {
      meetingId: formState.meetingId || "",
      meetTypeId: formState?.meetingType?.value || "",
      meetTypeName: formState?.meetingType?.label || "",
      prospectId: rowData.prospectId || "",
      meetingDate: formattedDate || "",
      associateId: rowData.associateId || "",
      loginUserName: userName || "",
      clientName: formState.clientName || "",
      phoneNo: formState.phoneNo || "",
      budgetId: formState?.budget?.value || "",
      budgetName: formState?.budget?.label || "",
      projectName: formState?.project?.value || "",
      address: formState.address || "",
      city: formState?.city?.label || "",
      state: formState.state || "",
      pin: formState.pin || "",
      occupation: formState.occupation || "",
      meetingDueDate: formState.dueDate || "",
      prospectPurposeId: formState?.prospectPurpose?.value || "",
      prospectPurposeName: formState?.prospectPurpose?.label || "",
      meetingTimeId: formState?.timing?.value || "",
      meetingTimeRange: formState?.timing?.label || "",
      meetingSourceId: formState?.source?.value || "",
      meetingSourcename: formState?.source?.label || "",
      meetingAttemptId: formState?.meetingAttempt?.value || "",
      meetingAttemptName: formState?.meetingAttempt?.label || "",
      emailId: formState.emailId || "",
      meetingTLName: formState.tlName || "",
      siteVisitStatusId: formState?.siteVisit?.value || "",
      siteVisitStatusName: formState?.siteVisit?.label || "",
      meetingPlaceId: formState?.meetingLocation?.value || "",
      meetingPlaceName: formState?.meetingLocation?.label || "",
      meetingStatusId: "cancel",
      meetingPurposeId: formState?.meetingPurpose?.value || null,
      meetingPurposeName: formState?.meetingPurpose?.label || "",
      meetingStartAt: null,
      meetingEndAt: null,
      swot: formState.swot,
      prospectsRemarks: formState.prospectsRemarks || "",
      overAllRemarks: formState.remarks || "",
      leadId: rowData?.leadId
    };
    mutate(params);
  };

  const handleCancel = () => {
    navigation(-1);
  };

  return (
    <PageContent>
      <Breadcrumbs title="Associate Section" breadcrumbItem="Cancel Meeting" />
      {(isLoading || isPending) && <ScreenLoader />}
      <Container fluid={true}>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardBody>
              <Row className="g-3">
                <Col md="4">
                  <h6 className="font-size-12">Meeting Type</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isClearable
                    options={structuredOutput?.Type}
                    onChange={handleSelectChange("meetingType")}
                    value={formState.meetingType}
                  />
                  {errors.meetingType && (
                    <div className="text-danger font-size-10">
                      {errors.meetingType}
                    </div>
                  )}
                </Col>
                <Col md="4">
                  <h6 className="font-size-12">Date</h6>
                  <input
                    id="date"
                    className="form-control"
                    type="date"
                    readOnly
                    style={{ backgroundColor: defaultTheme.btnDisable }}
                    value={formattedDate}
                    onChange={handleChange}
                  />
                </Col>
                <Col md="4">
                  <h6 className="font-size-12">Ass Name</h6>
                  <input
                    id="assName"
                    className="form-control"
                    type="text"
                    style={{ backgroundColor: defaultTheme.btnDisable }}
                    readOnly
                    placeholder="Enter Ass Name..."
                    value={formState.assName}
                    onChange={handleChange}
                  />
                </Col>

                <Col md="4">
                  <h6 className="font-size-12">Client Name</h6>
                  <input
                    id="clientName"
                    className="form-control"
                    type="text"
                    placeholder="Enter Client Name..."
                    value={formState.clientName}
                    onChange={handleChange}
                  />
                </Col>
                <Col md="4">
                  <h6 className="font-size-12">Mobile No.</h6>
                  <input
                    id="phoneNo"
                    className="form-control"
                    type="number"
                    placeholder="Enter Phone Number..."
                    value={formState.phoneNo}
                    onChange={handleChange}
                  />
                </Col>
                <Col md="4">
                  <h6 className="font-size-12">Budget</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isClearable
                    options={structuredOutput["Budget Dropdown"]}
                    onChange={handleSelectChange("budget")}
                    value={formState.budget}
                  />
                </Col>

                <Col md="4">
                  <h6 className="font-size-12">Project</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isClearable
                    options={projectData?.data?.data}
                    onChange={handleSelectChange("project")}
                    value={formState.project}
                  />
                </Col>
                <Col md="8">
                  <h6 className="font-size-12">Address</h6>
                  <input
                    id="address"
                    className="form-control"
                    type="text"
                    placeholder="Enter Address..."
                    value={formState.address}
                    onChange={handleChange}
                  />
                </Col>
                <Col md="4">
                  <h6 className="font-size-12">Occupation</h6>
                  <input
                    id="occupation"
                    className="form-control"
                    type="text"
                    placeholder="Enter Occupation..."
                    value={formState.occupation}
                    onChange={handleChange}
                  />
                </Col>

                <Col md="4">
                  <h6 className="font-size-12">Due Date</h6>
                  <input
                    id="dueDate"
                    className="form-control"
                    type="date"
                    value={formState.dueDate}
                    onChange={handleChange}
                  />
                </Col>
                <Col md="4">
                  <h6 className="font-size-12">Prospect Purpose</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isClearable
                    options={structuredOutput["Purpose Dropdown"]}
                    onChange={handleSelectChange("prospectPurpose")}
                    value={formState.prospectPurpose}
                  />
                </Col>
                <Col md="4">
                  <h6 className="font-size-12">Timing</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isClearable
                    options={structuredOutput["timing Dropdown"]}
                    onChange={handleSelectChange("timing")}
                    value={formState.timing}
                  />
                </Col>

                <Col md="4">
                  <h6 className="font-size-12">Source</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isClearable
                    options={structuredOutput["Data Source"]}
                    onChange={handleSelectChange("source")}
                    value={formState.source}
                  />
                </Col>
                <Col md="4">
                  <h6 className="font-size-12">Meeting Attempt</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isClearable
                    options={structuredOutput["Meeting attempted"]}
                    onChange={handleSelectChange("meetingAttempt")}
                    value={formState.meetingAttempt}
                  />
                </Col>
                <Col md="4">
                  <h6 className="font-size-12">Email ID</h6>
                  <input
                    id="emailId"
                    className="form-control"
                    type="email"
                    placeholder="Enter Email Id..."
                    value={formState.emailId}
                    onChange={handleChange}
                  />
                </Col>

                <Col md="4">
                  <h6 className="font-size-12">TL Name</h6>
                  <input
                    id="tlName"
                    className="form-control"
                    type="text"
                    placeholder="Enter TL Name..."
                    value={formState.tlName}
                    onChange={handleChange}
                  />
                </Col>
                <Col md="4">
                  <h6 className="font-size-12">Site Visit</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isClearable
                    options={structuredOutput["Site visite"]}
                    onChange={handleSelectChange("siteVisit")}
                    value={formState.siteVisit}
                  />
                </Col>
                <Col md="4">
                  <h6 className="font-size-12">Meeting Location</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isClearable
                    options={structuredOutput["Meeting Done Location"]}
                    onChange={handleSelectChange("meetingLocation")}
                    value={formState.meetingLocation}
                  />
                </Col>

                <Col md="4">
                  <h6 className="font-size-12">Meeting Status</h6>
                  <input
                    id="meetStatus"
                    className="form-control"
                    type="text"
                    style={{ backgroundColor: defaultTheme.btnDisable }}
                    readOnly
                    value={"Cancel"}
                    onChange={handleChange}
                  />
                </Col>
                <Col md="4">
                  <h6 className="font-size-12">Meeting Purpose</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isClearable
                    options={structuredOutput["Feedback Purpose"]}
                    onChange={handleSelectChange("meetingPurpose")}
                    value={formState.meetingPurpose}
                  />
                </Col>
                <Col md="4">
                  <h6 className="font-size-12">SWOT</h6>
                  <input
                    id="swot"
                    className="form-control"
                    type="text"
                    placeholder="Enter SWOT..."
                    value={formState.swot}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
              <Row>
                <Col md="6">
                  <h6 className="font-size-13">
                    Prospects Remarks<RequiredStar />
                  </h6>
                  <textarea
                    id="prospectsRemarks"
                    className={`form-control ${errors.prospectsRemarks ? "is-invalid" : ""}`}
                    rows="4"
                    placeholder="Type here..."
                    onChange={handleChange}
                    value={formState.prospectsRemarks}
                  ></textarea>
                  {errors.prospectsRemarks && (
                    <div className="invalid-feedback">
                      {errors.prospectsRemarks}
                    </div>
                  )}
                </Col>

                <Col md="6">
                  <h6 className="font-size-13">
                    Remarks<RequiredStar />
                  </h6>
                  <textarea
                    id="remarks"
                    className={`form-control ${errors.remarks ? "is-invalid" : ""}`}
                    rows="4"
                    placeholder="Type here..."
                    onChange={handleChange}
                    value={formState.remarks}
                  ></textarea>
                  {errors.remarks && (
                    <div className="invalid-feedback">{errors.remarks}</div>
                  )}
                </Col>
              </Row>

              <div className="d-flex align-items-center mt-4">
                <Button type="submit" color="primary" className="ms-1">
                  Submit
                </Button>
                <Button
                  type="reset"
                  color="secondary"
                  className="ms-2"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </CardBody>
          </Card>
        </form>
      </Container>
    </PageContent>
  );
}
