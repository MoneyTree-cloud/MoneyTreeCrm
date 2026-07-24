/* eslint-disable eqeqeq */
import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import { CANCEL_START_MEETING, END_ASSOCIATE_MEETING, GET_ALL_PROSPECTS_MASTER, GET_MEETING_DETAILS_BY_ID, GET_MY_ALL_TEAM, PROJECT_ID_NAME_DROPDOWN } from "../../helpers/url_helper";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { defaultTheme } from "../../helpers/defaultTheme";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import PageContent from "../../components/Common/PageContent";
import { RequiredStar } from "../../helpers/function_helper";

export default function EndCancelMeeting() {
  const location = useLocation();
  const navigation = useNavigate();

  const { meetingId, screen } = location.state || {};
  const [structuredOutput, setStructuredOutput] = useState({});
  const { userName, empCode, userId, parentUserId } = useUserStore((state) => state.user);

  const today = new Date();
  const formattedDate = today?.toISOString()?.split("T")[0]; // Format as YYYY-MM-DD

  const { data: projectData } = useGet(PROJECT_ID_NAME_DROPDOWN);

  const [formState, setFormState] = useState({
    meetingType: null,
    date: "",
    assName: "",
    clientName: "",
    phoneNo: "",
    budget: null,
    project: null,
    address: "",
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

  const [errors, setErrors] = useState({});
  const [wordCount, setWordCount] = useState(0)
  const { data, isLoading } = useGet(GET_ALL_PROSPECTS_MASTER);
  const { data: meetData, isLoading: isLoadingMeet } = useGet(GET_MEETING_DETAILS_BY_ID + meetingId);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [seniorSelected, setSeniorSelected] = useState(null);
  const [meetingBy, setMeetingBy] = useState('')

  // Only fetch team list when needed — Closed sale + Senior conducted
  const { data: teamList } = useGet(
    `${GET_MY_ALL_TEAM}${parentUserId}`,
    {
      enabled: meetingBy === "Senior",
    }
  );
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
    if (meetData?.data.data) {
      const rowData = meetData?.data.data;
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
        address: rowData.address,
        project:
          projectData?.data?.data?.find(
            (item) => item.value == rowData.projectId
          ) || null,
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
  }, [meetData?.data.data, projectData?.data?.data, structuredOutput]); // Dependency on rowData

  const { mutate: endMeeting, isPending: isPendingEnd } = usePost(END_ASSOCIATE_MEETING, {
    onSuccess: (response) => {
      if (response?.data.status === 1) {
        toast.success(response.data.message);
        navigation("/dashboard");
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { mutate: cancelMeeting, isPending: isPendingCancel } = usePost(
    CANCEL_START_MEETING,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          navigation("/dashboard");
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handleChange = (e) => {
    const { id, value } = e.target;
    // Word count for 'remarks' field only
    if (id === "remarks") {
      const words = value.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
    }
    if (id === "phoneNo") {
      // Allow only digits and restrict to 10 characters
      if (/^\d{0,10}$/.test(value) && value.length <= 10) {
        setFormState((prevState) => ({
          ...prevState,
          [id]: value,
        }));
      }
      if (errors[id]) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [id]: undefined,
        }));
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
    if (!formState.meetingType)
      newErrors.meetingType = "Meeting Type is required.";
    if (!formState.clientName)
      newErrors.clientName = "Client Name is required.";
    if (!formState.phoneNo) newErrors.phoneNo = "Mobile Number is required.";
    if (formState.phoneNo.length < 10) newErrors.phoneNo = "Mobile Number Must be of 10 digits.";
    if (!formState.budget) newErrors.budget = "Budget is required.";
    if (!formState.project) newErrors.project = "Project is required.";
    if (!formState.address) newErrors.address = "Address is required.";
    if (!formState.occupation) newErrors.occupation = "Occupation is required.";
    if (!formState.dueDate) newErrors.dueDate = "Due Date is required.";
    if (screen !== "start" && !formState.prospectPurpose)
      newErrors.prospectPurpose = "Prospect Purpose is required.";
    if (!formState.timing) newErrors.timing = "Timing is required.";
    if (!formState.source) newErrors.source = "Source is required.";
    if (screen !== "start" && !formState.meetingAttempt)
      newErrors.meetingAttempt = "Meeting Attempt is required.";
    if (!formState.tlName) newErrors.tlName = "TL Name is required.";
    if (screen !== "start" && !formState.siteVisit) newErrors.siteVisit = "Site Visit is required.";
    if (screen !== "start" && !formState.meetingLocation)
      newErrors.meetingLocation = "Meeting Location is required.";
    if (screen !== "start" && !formState.meetingPurpose)
      newErrors.meetingPurpose = "Meeting Purpose is required.";
    if (screen !== "start" && !formState.swot) newErrors.swot = "Swot Purpose is required.";
    if (!formState.prospectsRemarks)
      newErrors.prospectsRemarks = "Prospects Remarks is required.";
    if (!formState.remarks) newErrors.remarks = "Meeting Remarks are required.";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      toast.error("Some Mandatory Fields Are Still Not Filled");
      setErrors(formErrors);
      return;
    }
    // Validate closed-sale meeting attribution
    if (!meetingBy) {
      toast.error("Please specify who conducted this closed-sale meeting.");
      return;
    }
    if (meetingBy === "Senior" && !seniorSelected) {
      toast.error("Please select the senior who conducted the meeting.");
      return;
    }
    const meetRemarksWordCount = formState.remarks.trim().split(/\s+/).filter((word) => word.length > 0).length;
    if (screen !== "start" && meetRemarksWordCount < 30) {
      toast.error("Meeting remarks should be at least 30 words.");
      return;
    }
    if (screen !== "start" && !acceptTerms && formState?.meetingType?.label === 'Closed (For Sale)') {
      toast.error("Please Accept The Terms To Proceed");
      return;
    }

    // Resolve who closed the sale (only relevant for "Closed (For Sale)")
    const closedSaleFields = {};
    if (meetingBy === "Self") {
      closedSaleFields.finalSaleClosedById = userId;
      closedSaleFields.finalSaleClosedBy = userName + ' (' + empCode + ')';
    } else {
      closedSaleFields.finalSaleClosedById = seniorSelected?.value;
      closedSaleFields.finalSaleClosedBy = seniorSelected?.label;
    }
    const params = {
      meetingId: meetingId || "",
      meetTypeId: formState?.meetingType?.value || null,
      meetTypeName: formState?.meetingType?.label || "",
      prospectId: meetData?.data?.data?.prospectId || "",
      meetingDate: formattedDate || "",
      associateId: meetData?.data?.data?.associateId || "",
      loginUserName: userName || "",
      clientName: formState.clientName,
      phoneNo: formState.phoneNo || "",
      budgetId: formState?.budget?.value || null,
      budgetName: formState?.budget?.label || null,
      projectName: formState?.project?.label || null,
      projectId: formState?.project?.value || null,
      address: formState.address || "",
      occupation: formState.occupation || "",
      meetingDueDate: formState.dueDate || "",
      prospectPurposeId: formState?.prospectPurpose?.value || null,
      prospectPurposeName: formState?.prospectPurpose?.label || null,
      meetingTimeId: formState?.timing?.value || null,
      meetingTimeRange: formState?.timing?.label || null,
      meetingSourceId: formState?.source?.value || null,
      meetingSourcename: formState?.source?.label || null,
      meetingAttemptId: formState?.meetingAttempt?.value || null,
      meetingAttemptName: formState?.meetingAttempt?.label || null,
      emailId: formState.emailId || "",
      meetingTLName: formState.tlName || "",
      siteVisitStatusId: formState?.siteVisit?.value || null,
      siteVisitStatusName: formState?.siteVisit?.label || null,
      meetingPlaceId: formState?.meetingLocation?.value || null,
      meetingPlaceName: formState?.meetingLocation?.label || "",
      meetingStatusId: "end",
      meetingPurposeId: formState?.meetingPurpose?.value || null,
      meetingPurposeName: formState?.meetingPurpose?.label || "",
      meetingStartAt: null,
      meetingEndAt: null,
      swot: formState.swot || "",
      prospectsRemarks: formState.prospectsRemarks || "",
      overAllRemarks: formState.remarks || "",
      leadId: meetData?.data?.data?.leadId,
      sameDayMeetingRemark: meetData?.data?.data?.sameDayMeetingRemark,
      referralRemark: meetData?.data?.data?.referralRemark,
      referralPersonName: meetData?.data?.data?.referralPersonName,
      ...closedSaleFields,
    };
    if (screen === "start") {
      cancelMeeting(params);
    } else {
      endMeeting(params);
    }
  };

  const handleCancel = () => {
    navigation(-1);
  };

  return (
    <PageContent>
      <Breadcrumbs title="Associate Section" breadcrumbItem={screen !== "start" ? "End Meeting" : "Cancel Meeting"} />
      {(isLoading || isPendingCancel || isLoadingMeet || isPendingEnd) && (<ScreenLoader />)}
      <Container fluid={true}>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardBody>
              <Row className="g-3">
                <Col md="3">
                  <h6 className="font-size-11">Meeting Type <RequiredStar /></h6>
                  <Select
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

                <Col md="3">
                  <h6 className="font-size-11">Meeting Conducted By <RequiredStar /></h6>
                  <div className="d-flex gap-3 mt-1">
                    <label className="d-flex align-items-center gap-1" style={{ cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="meetingBy"
                        value="Self"
                        checked={meetingBy === "Self"}
                        onChange={() => {
                          setMeetingBy("Self");
                          setSeniorSelected(null);
                          setErrors((p) => ({ ...p, seniorSelected: "" }));
                        }}
                      />
                      Self
                    </label>
                    <label className="d-flex align-items-center gap-1" style={{ cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="meetingBy"
                        value="Senior"
                        checked={meetingBy === "Senior"}
                        onChange={() => setMeetingBy("Senior")}
                      />
                      Senior
                    </label>
                  </div>
                </Col>

                {meetingBy === "Senior" && (
                  <Col md="3">
                    <h6 className="font-size-11">Select Senior <RequiredStar /></h6>
                    <Select
                      isClearable
                      options={
                        Array.isArray(teamList?.data?.data) ? teamList.data.data : []
                      }
                      value={seniorSelected}
                      onChange={(opt) => {
                        setSeniorSelected(opt);
                        setErrors((p) => ({ ...p, seniorSelected: "" }));
                      }}
                      placeholder="Choose senior..."
                    />
                    {errors.seniorSelected && (
                      <div className="text-danger font-size-10">
                        {errors.seniorSelected}
                      </div>
                    )}
                  </Col>
                )}

                <Col md="3">
                  <h6 className="font-size-11">Date</h6>
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
                <Col md="3">
                  <h6 className="font-size-11">Ass. Name</h6>
                  <input
                    id="assName"
                    className="form-control"
                    type="text"
                    style={{ backgroundColor: defaultTheme.btnDisable }}
                    readOnly
                    placeholder="Enter Ass Name..."
                    value={userName}
                    onChange={handleChange}
                  />
                </Col>

                <Col md="3">
                  <h6 className="font-size-11">Client Name <RequiredStar /></h6>
                  <input
                    id="clientName"
                    className="form-control"
                    type="text"
                    placeholder="Enter Client Name..."
                    value={formState.clientName}
                    onChange={handleChange}
                  />
                  {errors.clientName && (
                    <div className="text-danger font-size-10">
                      {errors.clientName}
                    </div>
                  )}
                </Col>
                <Col md="3">
                  <h6 className="font-size-11">Mobile No. <RequiredStar /></h6>
                  <input
                    id="phoneNo"
                    className="form-control"
                    type="number"
                    readOnly
                    style={{ backgroundColor: defaultTheme.btnDisable }}
                    placeholder="Enter Mobile Number..."
                    value={formState.phoneNo}
                    onChange={handleChange}
                  />
                  {errors.phoneNo && (
                    <div className="text-danger font-size-10">
                      {errors.phoneNo}
                    </div>
                  )}
                </Col>
                <Col md="3">
                  <h6 className="font-size-11">Budget <RequiredStar /></h6>
                  <Select
                    isClearable
                    options={structuredOutput["Budget Dropdown"]}
                    onChange={handleSelectChange("budget")}
                    value={formState.budget}
                  />
                  {errors.budget && (
                    <div className="text-danger font-size-10">
                      {errors.budget}
                    </div>
                  )}
                </Col>

                <Col md="3">
                  <h6 className="font-size-11">Project <RequiredStar /></h6>
                  <Select
                    isClearable
                    options={projectData?.data?.data}
                    onChange={handleSelectChange("project")}
                    value={formState.project}
                  />
                  {errors.project && (
                    <div className="text-danger font-size-10">
                      {errors.project}
                    </div>
                  )}
                </Col>
                <Col md="8">
                  <h6 className="font-size-11">Address <RequiredStar /></h6>
                  <input
                    id="address"
                    className="form-control"
                    type="text"
                    placeholder="Enter Address..."
                    value={formState.address}
                    onChange={handleChange}
                  />
                  {errors.address && (
                    <div className="text-danger font-size-10">
                      {errors.address}
                    </div>
                  )}
                </Col>
                <Col md="3">
                  <h6 className="font-size-11">Occupation <RequiredStar /></h6>
                  <input
                    id="occupation"
                    className="form-control"
                    type="text"
                    placeholder="Enter Occupation..."
                    value={formState.occupation}
                    onChange={handleChange}
                  />
                  {errors.occupation && (
                    <div className="text-danger font-size-10">
                      {errors.occupation}
                    </div>
                  )}
                </Col>

                <Col md="3">
                  <h6 className="font-size-11">Due Date <RequiredStar /></h6>
                  <input
                    id="dueDate"
                    className="form-control"
                    type="date"
                    value={formState.dueDate}
                    onChange={handleChange}
                  />
                  {errors.dueDate && (
                    <div className="text-danger font-size-10">
                      {errors.dueDate}
                    </div>
                  )}
                </Col>
                <Col md="3">
                  <h6 className="font-size-11">Prospect Purpose {screen !== "start" && <RequiredStar />}</h6>
                  <Select
                    isClearable
                    options={structuredOutput["Purpose Dropdown"]}
                    onChange={handleSelectChange("prospectPurpose")}
                    value={formState.prospectPurpose}
                  />
                  {errors.prospectPurpose && (
                    <div className="text-danger font-size-10">
                      {errors.prospectPurpose}
                    </div>
                  )}
                </Col>
                <Col md="3">
                  <h6 className="font-size-11">Timing <RequiredStar /></h6>
                  <Select
                    isClearable
                    options={structuredOutput["timing Dropdown"]}
                    onChange={handleSelectChange("timing")}
                    value={formState.timing}
                  />
                  {errors.timing && (
                    <div className="text-danger font-size-10">
                      {errors.timing}
                    </div>
                  )}
                </Col>

                <Col md="3">
                  <h6 className="font-size-11">Source <RequiredStar /></h6>
                  <Select
                    isClearable
                    options={structuredOutput["Data Source"]}
                    onChange={handleSelectChange("source")}
                    value={formState.source}
                  />
                  {errors.source && (
                    <div className="text-danger font-size-10">
                      {errors.source}
                    </div>
                  )}
                </Col>
                <Col md="3">
                  <h6 className="font-size-11">Meeting Attempt {screen !== "start" && <RequiredStar />}</h6>
                  <Select
                    isClearable
                    options={structuredOutput["Meeting attempted"]}
                    onChange={handleSelectChange("meetingAttempt")}
                    value={formState.meetingAttempt}
                  />
                  {errors.meetingAttempt && (
                    <div className="text-danger font-size-10">
                      {errors.meetingAttempt}
                    </div>
                  )}
                </Col>
                <Col md="3">
                  <h6 className="font-size-11">Email ID</h6>
                  <input
                    id="emailId"
                    className="form-control"
                    type="email"
                    placeholder="Enter Email Id..."
                    value={formState.emailId}
                    onChange={handleChange}
                  />
                </Col>

                <Col md="3">
                  <h6 className="font-size-11">TL Name <RequiredStar /></h6>
                  <input
                    id="tlName"
                    className="form-control"
                    type="text"
                    placeholder="Enter TL Name..."
                    value={formState.tlName}
                    onChange={handleChange}
                  />
                  {errors.tlName && (
                    <div className="text-danger font-size-10">
                      {errors.tlName}
                    </div>
                  )}
                </Col>
                <Col md="3">
                  <h6 className="font-size-11">Site Visit {screen !== "start" && <RequiredStar />}</h6>
                  <Select
                    isClearable
                    options={structuredOutput["Site visite"]}
                    onChange={handleSelectChange("siteVisit")}
                    value={formState.siteVisit}
                  />
                  {errors.siteVisit && (
                    <div className="text-danger font-size-10">
                      {errors.siteVisit}
                    </div>
                  )}
                </Col>
                <Col md="3">
                  <h6 className="font-size-11">Meeting Location {screen !== "start" && <RequiredStar />}</h6>
                  <Select
                    isClearable
                    options={structuredOutput["Meeting Done Location"]}
                    onChange={handleSelectChange("meetingLocation")}
                    value={formState.meetingLocation}
                  />
                  {errors.meetingLocation && (
                    <div className="text-danger font-size-10">
                      {errors.meetingLocation}
                    </div>
                  )}
                </Col>

                {/* <Col md="3">
                  <h6 className="font-size-11">Meeting Status</h6>
                  <input
                    id="meetStatus"
                    className="form-control"
                    type="text"
                    style={{ backgroundColor: defaultTheme.btnDisable }}
                    readOnly
                    value={"End"}
                    onChange={handleChange}
                  />
                </Col> */}
                <Col md="3">
                  <h6 className="font-size-11">Meeting Purpose {screen !== "start" && <RequiredStar />}</h6>
                  <Select
                    isClearable
                    options={structuredOutput["Feedback Purpose"]}
                    onChange={handleSelectChange("meetingPurpose")}
                    value={formState.meetingPurpose}
                  />
                  {errors.meetingPurpose && (
                    <div className="text-danger font-size-10">
                      {errors.meetingPurpose}
                    </div>
                  )}
                </Col>
                <Col md="3">
                  <h6 className="font-size-11">SWOT {screen !== "start" && <RequiredStar />}</h6>
                  <input
                    id="swot"
                    className="form-control"
                    type="text"
                    placeholder="Enter SWOT..."
                    value={formState.swot}
                    onChange={handleChange}
                  />
                  {errors.swot && (
                    <div className="text-danger font-size-10">
                      {errors.swot}
                    </div>
                  )}
                </Col>

                <Col md="6">
                  <h6 className="font-size-11">Prospects Remarks<RequiredStar /></h6>
                  <textarea
                    id="prospectsRemarks"
                    className={`form-control ${errors.prospectsRemarks ? "is-invalid" : ""}`}
                    rows="5"
                    placeholder="Type Prospect Remarks Here..."
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
                  <h6 className="font-size-11">
                    Meeting Remarks<span style={{ color: "red" }}> * {screen !== "start" && <span>Min 30 words required ({wordCount}/{30})</span>}</span>
                  </h6>
                  <textarea
                    id="remarks"
                    className={`form-control ${errors.remarks ? "is-invalid" : ""}`}
                    rows="5"
                    placeholder="Type Meeting Remarks Here..."
                    onChange={handleChange}
                    value={formState.remarks}
                  ></textarea>
                  {errors.remarks && (
                    <div className="invalid-feedback">{errors.remarks}</div>
                  )}
                </Col>
              </Row>
              {(screen !== "start" && formState?.meetingType?.label === 'Closed (For Sale)') && (
                <div className="form-check mt-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="acceptTerms">
                    This booking is closed for sale as per MoneyTree Policy. <RequiredStar />
                  </label>
                </div>
              )}

              <div className="d-flex align-items-center mt-4">
                <Button
                  type="submit"
                  color="primary">
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
