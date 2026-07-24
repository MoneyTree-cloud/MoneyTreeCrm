/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, CardBody, FormGroup, Button, Container, Input } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Select from "react-select";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useLocation, useNavigate } from "react-router-dom";
import { useGet, usePost } from "../../Hooks/useApi";
import { GET_COSTING_BY_PROJECT_UNITID, CALL_FOR_BOOKING, UPDATE_KYC_BOOKING } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import { toast } from "react-toastify";
import { IoCall } from "react-icons/io5";
import { RegexFile } from "../../helpers/RegexFile";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { MdArrowBack, MdEmail, MdFileUpload } from "react-icons/md";
import { formatDate, formatDateTime } from "../../helpers/function_helper";
import { imageBaseUrl } from "../../helpers/api_helper";

const UpdateKycTeamScreen = () => {
  const location = useLocation();
  const navigation = useNavigate();
  const { userId, empCode, mobileNo } = useUserStore((state) => state.user);
  const { rowData, formState, taskType } = location.state || {};
  // const { data: paymentPlanList } = useGet(PAYMENT_PLAN_DROPDOWN);
  // const paymentPlanItem = Array.isArray(paymentPlanList?.data?.data) && paymentPlanList?.data?.data.find(item => item.value === parseInt(rowData?.rowData?.paymentPlan));

  const [formData, setFormData] = useState({
    kycStatus: null,
    kycRemarks: "",
    alternateMobile: "",
    alternateEmail: "",
    disputeStatus: null
  });
  const [kycType, setKycType] = useState(rowData.rowData.kycType ? rowData.rowData.kycType : 'call');
  const [file, setFile] = useState(null);

  const handleRadioChange = (e) => {
    setKycType(e.target.value); // Update state based on selected value
  };

  // Handle change in form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Optionally validate file type and size here
      setFile(selectedFile);
    }
  };

  const { data: costingData } = useGet(
    `${GET_COSTING_BY_PROJECT_UNITID}=${rowData?.rowData?.unitId}`,
    { enabled: Boolean(rowData?.rowData?.unitId) }
  );

  const kycStatusGroup = useMemo(
    () => [
      { label: "Call Not Picked", value: "callNotPicked" },
      { label: "Call Rescheduled", value: "callRescheduled" },
      { label: "Dispute", value: "dispute" },
      { label: "Not Reachable", value: "notReachable" },
      { label: "On Hold", value: "onHold" },
      { label: "Satisfied", value: "satisfied" },
      { label: "Waived Off", value: "waivedOff" },
      { label: "Email KYC Request", value: "emailKycRequest" }
    ],
    []
  );

  const disputeStatusGroup = useMemo(
    () => [
      { label: "Costing Mistmatch", value: "Costing Mistmatch" },
      { label: "Spam Call (Client Think it’s a spam call)", value: "Spam Call (Client Think it’s a spam call)" },
      { label: "Client Askig for Cancellation", value: "Client Askig for Cancellation" },
      { label: "Saying Not buying any property", value: "Saying Not buying any property" },
      { label: "Unhappy With Associate", value: "Unhappy With Associate" },
      { label: "Other", value: "Other" }
    ],
    []
  );

  useEffect(() => {
    if (rowData?.rowData?.kycStatus) {
      const kycStatus = kycStatusGroup?.find(
        (item) => item.value === rowData?.rowData?.kycStatus
      );
      if (kycStatus) {
        setFormData((prevState) => ({ ...prevState, kycStatus }));
      }
    }
  }, [kycStatusGroup, rowData?.rowData?.kycStatusId]);

  useEffect(() => {
    if (rowData?.rowData?.disputeCategory) {
      const disputeStatus = disputeStatusGroup?.find(
        (item) => item.value === rowData?.rowData?.disputeCategory
      );
      if (disputeStatus) {
        setFormData((prevState) => ({ ...prevState, disputeStatus }));
      }
    }
  }, [kycStatusGroup, rowData?.rowData?.kycStatusId]);

  useEffect(() => {
    if (rowData?.rowData) {
      setFormData((prevState) => ({
        ...prevState,
        kycRemarks: rowData?.rowData?.remarks,
        alternateEmail: rowData?.rowData?.clientEmail2,
        alternateMobile: rowData?.rowData?.clientPhone2,
      }));
    }
  }, [rowData?.rowData]);

  function handleTypeSelectGroup(selectedGroup) {
    setFormData((prevState) => ({
      ...prevState,
      kycStatus: selectedGroup,
    }));
  }

  function handleDisputeSelectGroup(selectedGroup) {
    setFormData((prevState) => ({
      ...prevState,
      disputeStatus: selectedGroup,
    }));
  }

  const { isPending, mutate: mutateCall } = usePost(
    `${CALL_FOR_BOOKING}${userId}&caller=${rowData?.rowData?.clientPhone1}&agent=${mobileNo}&saleId=${rowData?.rowData?.saleId}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
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

  const { isPending: updateLoading, mutate: mutateUpdate } = usePost(
    `${UPDATE_KYC_BOOKING}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          handleBack();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handleBack = () => {
    navigation("/kyc-team", {
      state: { formState_: formState, taskType_: taskType },
    });
  };

  const handleCallForKyc = () => {
    mutateCall();
  };

  const handleUpdateKyc = () => {
    // Check if alternateEmail exists and validate it
    if (formData?.alternateEmail) {
      if (!RegexFile.email.test(formData.alternateEmail)) {
        toast.error("Please Enter a Valid Email");
        return;
      }
    }

    // Check if alternateMobile exists and validate it
    if (formData?.alternateMobile) {
      if (!RegexFile.mobileNo.test(formData.alternateMobile)) {
        toast.error("Please Enter a Valid Mobile Number");
        return;
      }
    }

    // Check if KYC Status is selected
    if (!formData?.kycStatus) {
      toast.error("Please Select KYC Status");
      return;
    }
    // Check if KYC Status is selected
    if (formData?.kycStatus?.value === 'dispute' && !formData?.disputeStatus) {
      toast.error("Please Select Dispute Reason");
      return;
    }

    // Check if KYC Remarks are entered
    if (!formData?.kycRemarks) {
      toast.error("Please Enter Remarks");
      return;
    }
    if (kycType === 'mail' && !rowData?.rowData?.mailAttachment && !file) {
      toast.error("Please Attach Evidence Mail");
      return;
    }

    // If all validations pass, proceed to mutate
    let formDataObj = new FormData();
    formDataObj.append("saleId", rowData?.rowData?.saleId);
    formDataObj.append("loginId", userId);
    formDataObj.append("mobile1", rowData?.rowData?.clientPhone1);
    formDataObj.append("mobile2", formData?.alternateMobile);
    formDataObj.append("email1", rowData?.rowData?.clientEmail1);
    formDataObj.append("email2", formData?.alternateEmail);
    formDataObj.append("status", (formData?.kycStatus?.value === "satisfied" || formData?.kycStatus?.value === "waivedOff") ? true : false);
    formDataObj.append("kycStatus", formData?.kycStatus?.value);
    formDataObj.append("remarks", formData?.kycRemarks);
    formDataObj.append("disputeCategory", formData?.kycStatus?.value === "dispute" ? formData?.disputeStatus?.value : null);
    formDataObj.append("kycType", kycType);
    if (kycType === 'mail' && file) {
      formDataObj.append("mailAttachment", file);
    }

    mutateUpdate(formDataObj);
  };

  const handleOpenFile = () => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      const fileName = file.name || '';
      const isMsgFile = fileName.toLowerCase().endsWith('.msg');

      if (isMsgFile) {
        // Trigger download for .msg files
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Open other files in a new tab
        window.open(fileURL, "_blank");
      }
    }
  };

  const handleOpenMailFile = () => {
    const attachment = rowData?.rowData?.mailAttachment;

    if (attachment) {
      const fileURL = imageBaseUrl + attachment;
      const isMsgFile = attachment.toLowerCase().endsWith('.msg');
      if (isMsgFile) {
        // Create a temporary <a> element to trigger download
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = attachment.split('/').pop(); // Extract the filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(fileURL, "_blank"); // Open in new tab
      }
    }
  };

  return (
    <PageContent>
      <Container fluid={true}>
        {(isPending || updateLoading) && <ScreenLoader />}
        <Breadcrumbs title="KYC" breadcrumbItem="Update KYC- Team" />

        <Card>
          <CardBody>
            {/* ===== Associate & Property Info ===== */}
            <Row className="mt-4">
              <Col md={12}>
                <h5 className="mb-3 border-bottom pb-2 border-black">Associate & Property Info</h5>
              </Col>

              <Col md="4"><p><strong>Associate:</strong> {rowData?.rowData?.associateName || "N/A"}</p></Col>
              <Col md="4"><p><strong>Main Team:</strong> {rowData?.rowData?.mainTeam || "N/A"}</p></Col>
              <Col md="4"><p><strong>Sub Team:</strong> {rowData?.rowData?.subTeam || "N/A"}</p></Col>

              <Col md="4"><p><strong>Unique ID:</strong> {rowData?.rowData?.saleId || "N/A"}</p></Col>
              <Col md="4"><p><strong>Unit No:</strong> {rowData?.rowData?.unitNo || "N/A"}</p></Col>

              <Col md="4"><p><strong>Area:</strong> {costingData?.data?.data?.area || "N/A"}</p></Col>
              <Col md="4"><p><strong>Tower/Block:</strong> {costingData?.data?.data?.towerBlock || "N/A"}</p></Col>
              <Col md="4"><p><strong>Floor:</strong> {costingData?.data?.data?.floor || "N/A"}</p></Col>

              {/* <Col md="4"><p><strong>Final Cost:</strong> {rowData?.rowData?.finalCost || "N/A"}</p></Col> */}
              <Col md="4"><p><strong>Booking Date & Time:</strong> {formatDateTime(rowData?.rowData?.bookingDate) || "N/A"}</p></Col>

            </Row>

            {/* ===== Project & Customer Details ===== */}
            <Row className="mt-4">
              <Col md={12}>
                <h5 className="mb-3 border-bottom pb-2 border-black">Builder & Customer Details</h5>
              </Col>

              <Col md="4"><p><strong>Builder Name:</strong> {rowData?.rowData?.builderName || "N/A"}</p></Col>
              <Col md="4"><p><strong>Project Name:</strong> {rowData?.rowData?.projectName || "N/A"}</p></Col>
              <Col md="4"><p><strong>Customer Name:</strong> {rowData?.rowData?.clientName || "N/A"}</p></Col>
              <Col md="4"><p><strong>Customer Email:</strong> {rowData?.rowData?.clientEmail1 || "N/A"}</p></Col>


              <Col md="4"><p><strong>DOB:</strong> {formatDate(rowData?.rowData?.dateOfBirth) || "N/A"}</p></Col>
              <Col md="4"><p><strong>PAN:</strong> {rowData?.rowData?.panNumber || "N/A"}</p></Col>
              {/* <Col md="4"><p><strong>Payment Plan:</strong> {paymentPlanItem?.label || "N/A"}</p></Col> */}
              <Col md="4"><p><strong>Co-Applicant Name:</strong> {rowData?.rowData?.coApplicantDetails?.name || "N/A"}</p></Col>
              <Col md="4"><p><strong>Co-Applicant DOB:</strong> {formatDate(rowData?.rowData?.coApplicantDetails?.dateOfBirth) || "N/A"}</p></Col>

              <Col md="12"><p><strong>Customer Address:</strong> {rowData?.rowData?.clientAddress || "N/A"}</p></Col>

              {/* Editable: Alternate Email */}
              <Col md="4">
                <FormGroup>
                  <label className="form-label font-size-11">Alternate Email</label>
                  <Input
                    name="alternateEmail"
                    placeholder="Enter Email here..."
                    type="email"
                    onChange={handleChange}
                    className="form-control"
                    value={formData?.alternateEmail}
                  />
                </FormGroup>
              </Col>

              {/* Editable: Alternate Mobile */}
              <Col md="4">
                <FormGroup>
                  <label className="form-label font-size-11">Alternate Mobile</label>
                  <Input
                    name="alternateMobile"
                    placeholder="Enter Mobile Here..."
                    type="text"
                    maxLength={10}
                    pattern="\d*"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/[^0-9]/.test(value)) return;
                      handleChange(e);
                    }}
                    className="form-control"
                    value={formData?.alternateMobile}
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <label className="form-label font-size-11">KYC Type :</label>
                <div className="radio-button-container mt-1">
                  {["call", "mail"].map((type) => (
                    <label key={type} className={`radio-label ${kycType === type ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="kycType"
                        value={type}
                        checked={kycType === type}
                        onChange={handleRadioChange}
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
              </Col>
            </Row>

            {/* ===== KYC Section ===== */}
            <Row className="mt-4">
              <Col md={12}>
                <h5 className="mb-3 border-bottom pb-2 border-black">KYC Details</h5>
              </Col>

              {/* Editable: KYC Status */}
              <Col md="3">
                <label className="form-label font-size-11">
                  KYC Status <span className="text-danger">*</span>
                </label>
                <Select
                  isDisabled={rowData?.rowData?.kycStatusId === 3}
                  value={formData.kycStatus}
                  isClearable
                  menuPlacement="auto"
                  onChange={handleTypeSelectGroup}
                  options={kycStatusGroup}
                />
              </Col>
              {formData?.kycStatus?.value === 'dispute' && (
                <Col md="3">
                  <label className="form-label font-size-11">
                    Dispute Reason <span className="text-danger">*</span>
                  </label>
                  <Select
                    value={formData.disputeStatus}
                    isClearable
                    menuPlacement="auto"
                    onChange={handleDisputeSelectGroup}
                    options={disputeStatusGroup}
                  />
                </Col>
              )}

              {/* Editable: Remarks */}
              <Col md={formData?.kycStatus?.value === 'dispute' ? 6 : 9}>
                <label className="form-label font-size-11">
                  Remarks <span className="text-danger">*</span>
                </label>
                <textarea
                  name="kycRemarks"
                  disabled={rowData?.rowData?.kycStatusId === 3}
                  style={{
                    backgroundColor:
                      rowData?.rowData?.kycStatusId === 3 ? defaultTheme.btnDisable : null,
                  }}
                  className="form-control"
                  rows="5"
                  placeholder="Type here..."
                  value={
                    rowData?.rowData?.kycRemark
                      ? rowData?.rowData?.kycRemark
                      : formData.kycRemarks
                  }
                  onChange={handleChange}
                ></textarea>
              </Col>
            </Row>

            <FormGroup className="mt-4">

              <div className="d-flex align-items-center justify-content-center">
                {/* Conditionally render based on kycType */}
                {kycType === "call" && taskType !== "Completed" && empCode !== '1237' && (
                  <Button
                    type="submit"
                    color="info"
                    className="ms-1"
                    onClick={handleCallForKyc}
                  >
                    <IoCall />
                  </Button>
                )}

                {(kycType === "mail" && taskType !== "Completed") && (
                  <Button
                    type="button"
                    color="secondary"
                    className="ms-1"
                    onClick={() => document.getElementById("fileInput").click()}
                  >
                    <MdFileUpload />
                  </Button>
                )}
                <input
                  id="fileInput"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {(file && kycType === 'mail') && (
                  <div className="ms-3" onClick={handleOpenFile}>
                    <MdEmail color={defaultTheme.btnEnable} size={24} style={{ cursor: "pointer" }} />
                  </div>
                )}

                {(!file && kycType === 'mail' && rowData?.rowData?.mailAttachment) && (
                  <div className="ms-3" onClick={handleOpenMailFile}>
                    <MdEmail color={defaultTheme.btnEnable} size={24} style={{ cursor: "pointer" }} />
                  </div>
                )}

                {(taskType !== "Completed" && empCode !== '1237') && (
                  <Button
                    type="submit"
                    color="primary"
                    className="ms-3 me-3"
                    onClick={handleUpdateKyc}
                  >
                    Save
                  </Button>
                )}
                <MdArrowBack
                  style={{
                    cursor: "pointer",
                    color: defaultTheme.goldColorLogo
                  }}
                  size={30}
                  onClick={handleBack}
                />
              </div>

            </FormGroup>
          </CardBody>
        </Card>

      </Container>
    </PageContent>
  );
};

export default UpdateKycTeamScreen;
