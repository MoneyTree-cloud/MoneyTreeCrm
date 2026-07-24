/* eslint-disable eqeqeq */
import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Form,
  Row,
  TabContent,
  TabPane,
  Progress,
  NavLink,
  NavItem,
} from "reactstrap";
import classnames from "classnames";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost, usePut } from "../../Hooks/useApi";
import {
  CALCULATE_PROJECT_UNIT,
  GET_ALL_PROSPECT_DETAILS_BY_PROS_ID,
  GET_COSTING_BY_PROJECT_UNITID,
  GET_DROPDOWN_BUILDER,
  GET_PROJECT_BY_BUILDER,
  GET_REVENUE_BY_ASSOCIATE_ID,
  PAYMENT_PLAN_DROPDOWN,
  UPDATE_REVENUE_SALE,
} from "../../helpers/url_helper";
import Select from "react-select";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import { RegexFile } from "../../helpers/RegexFile";
import ScreenLoader from "../../constants/ScreenLoader";
import { RequiredStar } from "../../helpers/function_helper";

export default function ManageRevenueSale() {
  const location = useLocation();
  const { rowData } = location.state || {};

  const userId = useUserStore((state) => state.user.userId);
  const [activeTabWiz, setActiveTabWiz] = useState(1);
  const navigation = useNavigate();

  const [formData, setFormData] = useState({
    builder: null,
    project: null,
    revenue: null,
  });

  const [formStateTab1, setFormStateTab1] = useState({
    applicantName: "",
    applicantAddress: "",
    contactNum1: "",
    contactNum2: "",
    emailId: "",
    dob: "",
    aadhar: "",
    pan: "",
    coApplicantName: "",
    coApplicantDob: "",
    coApplicantAddress: "",
    coApplicantContactNum1: "",
    coApplicantContactNum2: "",
    coApplicantEmailId: "",
    coApplicantAadhar: "",
    coApplicantPan: "",
  });

  // Initialize the form state for Tab2
  const [formStateTab2, setFormStateTab2] = useState({
    unitNo: "",
    towerBlock: "",
    floor: "",
    area: "",
    bsp: "",
    inauguralDiscount: "",
    npv: "",
    otherDiscount: "",
    netBsp: "",
    netBspArea: "",
    gstPercent: "",
    gstAmount: "",
    netUnitCost: "",
    floorPlc: "",
    facingPlc: "",
    otherViewPlc: "",
    carParking: "",
    clubMembership: "",
    powerBackupCharges: "",
    ifms: "",
    leaseRent: "",
    essc: "",
    crf: "",
    edcIdc: "",
    eecFfc: "",
    terraceGarden: "",
    development: "",
    facilities: "",
    maintenance: "",
    meter: "",
    otherCharges: "",
    totalOtherCharges: "",
    otherChargeGstRate: "",
    gstAmountOnOtherCharges: "",
    totalWithGst: "",
    totalGstAmount: "",
    totalUnitCost: "",
    unitStatus: null,
    paymentPlan: null,
    raPercent: "",
    rcPercent: "",
  });

  const [formStateTab3, setFormStateTab3] = useState({
    bookingStatus: null,
    location: null,
    bookingDate: "",
    propType: null,
    saleStatus: null,
    schemeIncentive: null,
    formStage: null,
    loanSelfFunding: null,
    kycStatus: null,
    kycCompletionDate: "",
    soReceiveDate: "",
    soDispatchDate: "",
    acceptanceDateByBuilder: "",
    clientBBAStatus: "",
    remarks: "",
  });

  const unitStatusOptions = [
    { label: "Admin Pre Sold", value: "adminPreSold" },
    { label: "Hold", value: "hold" },
    { label: "Open", value: "open" },
    { label: "Pre Sold", value: "preSold" },
    { label: "Sold", value: "sold" },
  ];

  const handleChangeTab1 = (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors }; // Initialize a new errors object
    const numericFields = [
      "contactNum1",
      "contactNum2",
      "coApplicantContactNum1",
      "coApplicantContactNum2",
    ];

    // Handle PAN specifically
    if (name === "pan" || name === "coApplicantPan") {
      const upperCaseValue = value.toUpperCase(); // Convert to uppercase
      const isValidPan = RegexFile.panNo.test(upperCaseValue); // Check PAN format

      if (!upperCaseValue) {
        newErrors[name] = `${name === "pan" ? "PAN Number" : "Co-Applicant PAN Number"
          } is required`;
      } else if (!isValidPan) {
        newErrors[name] = `${name === "pan" ? "PAN Number" : "Co-Applicant PAN Number"
          } must be in the format AAAAA1234A.`;
      } else {
        newErrors[name] = ""; // Clear error if valid
      }

      setFormStateTab1({
        ...formStateTab1,
        [name]: upperCaseValue,
      });
    } else if (name === "emailId") {
      const isValidEmail = RegexFile.email.test(value); // Check email format

      if (!value) {
        newErrors.emailId = "Email ID is required";
      } else if (!isValidEmail) {
        newErrors.emailId = "Invalid email format.";
      } else {
        newErrors.emailId = ""; // Clear error if valid
      }

      setFormStateTab1({
        ...formStateTab1,
        [name]: value,
      });
    } else if (name === "dob") {
      if (!value) {
        newErrors.dob = "Date of Birth is required";
      } else {
        newErrors.dob = ""; // Clear error if valid
      }

      setFormStateTab1({
        ...formStateTab1,
        [name]: value,
      });
    } else if (name === "aadhar" || name === "coApplicantAadhar") {
      // Allow only numeric input and limit to 12 digits
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 12); // Restrict input to digits and max length of 12

      if (!numericValue) {
        newErrors[name] = `${name === "aadhar" ? "Aadhar Number" : "Co-Applicant Aadhar Number"
          } is required`;
      } else if (numericValue.length !== 12) {
        newErrors[name] = `${name === "aadhar" ? "Aadhar Number" : "Co-Applicant Aadhar Number"
          } must be 12 digits.`;
      } else {
        newErrors[name] = ""; // Clear error if valid
      }

      setFormStateTab1({
        ...formStateTab1,
        [name]: numericValue,
      });
    } else if (numericFields.includes(name)) {
      // For numeric fields: Allow only numbers and limit length to 10
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormStateTab1({
        ...formStateTab1,
        [name]: numericValue,
      });
    } else {
      // For other fields, update normally
      setFormStateTab1({
        ...formStateTab1,
        [name]: value,
      });
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Update the error state
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    // setErrors(newErrors);
  };

  // Handle input change
  const handleChangeTab2 = (e) => {
    const { name, value } = e.target;
    setFormStateTab2({
      ...formStateTab2,
      [name]: value, // Update the corresponding form field
    });
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleChangeTab3 = (e) => {
    const { name, value } = e.target;
    setFormStateTab3({
      ...formStateTab3,
      [name]: value,
    });
    // Update the error state
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleUnitStatusChange = (selectedOption) => {
    setFormStateTab2({
      ...formStateTab2,
      unitStatus: selectedOption,
    });
  };

  const handlePaymentPlanChange = (selectedOption) => {
    setFormStateTab2({
      ...formStateTab2,
      paymentPlan: selectedOption,
    });
  };

  const inputStyle = {
    backgroundColor: defaultTheme.btnDisable,
  };

  const handleChangeSelect = (selectedOption, fieldName) => {
    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: selectedOption,
    }));
    // Update the error state
    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  const handleChangeSelectTab3 = (selectedOption, fieldName) => {
    setFormStateTab3((prevState) => ({
      ...prevState,
      [fieldName]: selectedOption, // Use selectedOption.value for the value
    }));
    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  const [passedStepsWiz, setPassedStepsWiz] = useState([1]);
  const { data: builderList } = useGet(GET_DROPDOWN_BUILDER);
  const { data: paymentPlanList } = useGet(PAYMENT_PLAN_DROPDOWN);

  const { data: projectData } = useGet(
    formData.builder
      ? `${GET_PROJECT_BY_BUILDER}${formData?.builder?.value}`
      : "",
    { enabled: !!formData.builder }
  );

  const { data: prospectDetails, isLoading: getLoading } = useGet(
    GET_ALL_PROSPECT_DETAILS_BY_PROS_ID + rowData?.prospectId,
    { enabled: Boolean(rowData?.prospectId) }
  );

  const { data: revenueData } = useGet(
    rowData?.unitId
      ? `${GET_REVENUE_BY_ASSOCIATE_ID}${rowData?.associateId}&unitId=${rowData?.unitId}`
      : "",
    { enabled: !!rowData?.unitId }
  );

  const { data: costingData } = useGet(
    rowData?.unitId
      ? `${GET_COSTING_BY_PROJECT_UNITID}=${rowData?.unitId}`
      : "",
    { enabled: !!rowData?.unitId }
  );

  const tab2CostingData = costingData?.data?.data;

  const toggleTabWiz = (tab) => {
    if (activeTabWiz !== tab) {
      const modifiedSteps = [...passedStepsWiz, tab];
      if (tab >= 1 && tab <= 3) {
        setActiveTabWiz(tab);
        setPassedStepsWiz(modifiedSteps);
      }
    }
  };

  const [errors, setErrors] = useState({});

  const validateFields = () => {
    let newErrors = {};
    // Tab validation for the formData fields
    if (!formData.builder) newErrors.builder = "Select Builder is required";
    if (!formData.project) newErrors.project = "Select Project is required";
    if (!formData.revenue) newErrors.revenue = "Revenue is required";

    // Tab 1 Validation - All fields mandatory
    if (!formStateTab1.applicantName)
      newErrors.applicantName = "Applicant Name is required";
    if (!formStateTab1.applicantAddress)
      newErrors.applicantAddress = "Applicant Address is required";
    if (!formStateTab1.contactNum1)
      newErrors.contactNum1 = "Contact Number 1 is required";
    // if (!formStateTab1.emailId) newErrors.emailId = "Email ID is required";
    if (!formStateTab1.dob) newErrors.dob = "Date of Birth is required";
    if (!formStateTab1.aadhar) newErrors.aadhar = "Aadhar Number is required";
    if (!formStateTab1.pan) newErrors.pan = "PAN Number is required";
    if (!RegexFile.panNo.test(formStateTab1.pan)) {
      newErrors.pan = "Invalid PAN No format.";
    }

    // Tab 2 Validation
    if (!formStateTab2.unitStatus)
      newErrors.unitStatus = "Unit Status is required";

    // Tab 3 Validation - All fields mandatory
    if (!formStateTab3.bookingStatus)
      newErrors.bookingStatus = "Booking Status is required";
    if (!formStateTab3.location) newErrors.location = "Location is required";
    if (!formStateTab3.bookingDate)
      newErrors.bookingDate = "Booking Date is required";
    if (!formStateTab3.propType)
      newErrors.propType = "Property Type is required";
    if (!formStateTab3.saleStatus)
      newErrors.saleStatus = "Sale Status is required";
    if (!formStateTab3.schemeIncentive)
      newErrors.schemeIncentive = "Scheme/Incentive is required";
    if (!formStateTab3.formStage)
      newErrors.formStage = "Form Stage is required";
    if (!formStateTab3.loanSelfFunding)
      newErrors.loanSelfFunding = "Loan/Self Funding is required";
    if (!formStateTab3.kycStatus)
      newErrors.kycStatus = "KYC Status is required";
    if (!formStateTab3.remarks) newErrors.remarks = "Remarks are required";

    setErrors(newErrors);

    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  const locationData = [
    { value: 44, label: "Banglore" },
    { value: 41, label: "Gurugram" },
    { value: 45, label: "Lucknow" },
    { value: 42, label: "Mumbai" },
    { value: 40, label: "Noida" },
    { value: 46, label: "Patna" },
    { value: 43, label: "Pune" },
  ];

  const bookingStatusOptions = [
    { value: 1, label: "Cancel" },
    { value: 2, label: "Complete" },
    { value: 3, label: "In Complete" },
    { value: 4, label: "Live" },
  ];

  const propTypeOptions = [
    { value: 22, label: "Commercial" },
    { value: 25, label: "Plot" },
    { value: 24, label: "Residential" },
    { value: 23, label: "Retail" },
  ];

  const saleStatusOptions = [
    { value: 3, label: "Cancel" },
    { value: 2, label: "Closed" },
    { value: 1, label: "Open" },
    { value: 4, label: "Reject" },
  ];

  const schemeIncentiveOptions = [
    { value: 12, label: "No" },
    { value: 11, label: "Yes" },
  ];

  const formStageOptions = [
    { value: 18, label: "Accepted By Builder" },
    { value: 20, label: "Cancelled" },
    { value: 14, label: "Cancel NOC Generate" },
    { value: 13, label: "Login" },
    { value: 15, label: "Not Login" },
    { value: 19, label: "Rejected" },
    { value: 16, label: "Sent To KYC" },
    { value: 17, label: "Submit To Builder" },
  ];

  const loanSelfFundingOptions = [
    { value: 1, label: "Loan" },
    { value: 2, label: "Self" },
  ];

  const kycStatusOptions = [
    { value: 29, label: "Closed" },
    { value: 31, label: "Pending Kyc Team" },
    { value: 32, label: "Pending Sales Team" },
    { value: 30, label: "Under Issue" },
  ];

  const { isPending: addLoading, mutate } = usePut(
    `${UPDATE_REVENUE_SALE}${userId}`,
    {
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
    }
  );

  const handleSave = () => {
    if (validateFields()) {
      let params = {
        saleId: rowData?.saleId ? rowData?.saleId : 0,
        projectunitId: rowData?.unitId ? rowData?.unitId : 0,
        clientName: formStateTab1?.applicantName,
        clientAddress: formStateTab1?.applicantAddress,
        clientPhone: formStateTab1?.contactNum1,
        clientPhone2: formStateTab1?.contactNum2,
        clientEmail: formStateTab1?.emailId,
        clientDob: formStateTab1?.dob,
        clientAddharCard: formStateTab1?.aadhar,
        clientPan: formStateTab1?.pan,
        coApplicantName: formStateTab1?.coApplicantName,
        coApplicantAddress: formStateTab1?.coApplicantAddress,
        coApplicantPhone: formStateTab1?.coApplicantContactNum1,
        coApplicantPhone2: formStateTab1?.coApplicantContactNum2,
        coApplicantEmail: formStateTab1?.coApplicantEmailId,
        coApplicantDob: formStateTab1?.coApplicantDob,
        coApplicantAddharCard: formStateTab1?.coApplicantAadhar,
        coApplicantPan: formStateTab1?.coApplicantPan,
        bookingStatusId: formStateTab3?.bookingStatus?.value,
        locationId: formStateTab3?.location?.value,
        bookingDate: formStateTab3?.bookingDate,
        propTypeId: formStateTab3?.propType?.value,
        saleStatusId: formStateTab3?.saleStatus?.value,
        schemaIncentiveId: formStateTab3?.schemeIncentive?.value,
        formStageId: formStateTab3?.formStage?.value,
        loanSelfFundingId: formStateTab3?.loanSelfFunding?.value,
        kycStatusId: formStateTab3?.kycStatus?.value,
        kycDate: formStateTab3?.kycCompletionDate,
        remarks: formStateTab3?.remarks,
        soReceiveDate: formStateTab3?.soReceiveDate,
        soDispatchDate: formStateTab3?.soDispatchDate,
        acceptanceDateByBuilder: formStateTab3?.acceptanceDateByBuilder,
        clientBbaStatus: formStateTab3?.clientBBAStatus,
        ra_percent: formStateTab2?.raPercent || 0,
        rc_percent: formStateTab2?.rcPercent || 0,
        paymentPlan: formStateTab2?.paymentPlan?.value,
        builderId: formData?.builder?.value,
        projectId: formData?.project?.value || 0,
        unitNo: formStateTab2?.unitNo || 0,
        towerBlock: formStateTab2?.towerBlock || 0,
        floor: formStateTab2?.floor || 0,
        area: formStateTab2?.area || 0,
        bsp: formStateTab2?.bsp || 0,
        inauguralDiscount: formStateTab2?.inauguralDiscount || 0,
        npv: formStateTab2?.npv || 0,
        othDicountBuilder: formStateTab2?.otherDiscount || 0,
        netBsp: formStateTab2?.netBsp || 0,
        totalAreaBsp: formStateTab2?.netBspArea || 0,
        floorPlc: formStateTab2?.floorPlc || 0,
        facingPlc: formStateTab2?.facingPlc || 0,
        otherViewPlc: formStateTab2?.otherViewPlc || 0,
        carParking: formStateTab2?.carParking || 0,
        clubMembership: formStateTab2?.clubMembership || 0,
        powerBackupCharges: formStateTab2?.powerBackupCharges || 0,
        ifmsAfterDiscount: formStateTab2?.ifms || 0,
        leaseRentAfterDiscount: formStateTab2?.leaseRent || 0,
        esscPer: formStateTab2?.essc || 0,
        crfPer: formStateTab2?.crf || 0,
        edcIdc: formStateTab2?.edcIdc || 0,
        eecFfc: formStateTab2?.eecFfc || 0,
        terrageGarden: formStateTab2?.terraceGarden || 0,
        facilities: formStateTab2?.facilities,
        maintenance: formStateTab2?.maintenance || 0,
        meter: formStateTab2?.meter || 0,
        otherCharges: formStateTab2?.otherCharges || 0,
        netCost: formStateTab2?.netUnitCost || 0,
        gstPercent: formStateTab2?.gstPercent || 0,
        gstAmount: formStateTab2?.gstAmount || 0,
        netCostWithGst: formStateTab2?.totalUnitCost || 0,
        development: formStateTab2?.development || "",
        revenueId: formData?.revenue?.value || 0,
        totalOtherCharge: formStateTab2?.totalOtherCharges || 0,
        otherChargeGstRate: formStateTab2?.otherChargeGstRate || 0,
        otherChargeGstAmt: formStateTab2?.gstAmountOnOtherCharges || 0,
        totalOtherchargeWithGst: formStateTab2?.totalWithGst || 0,
        totalGstAmount: formStateTab2?.totalGstAmount || 0,
        unitStatus: formStateTab2?.unitStatus?.value || null,
        unitHoldDate: "string",
        adminHoldFor: "string",
        adminHoldDate: "string",
      };
      mutate(params);
    } else {
      toast.error("Some Mandatory Fields Are Still Not Filled");
    }
  };

  const handleCancel = () => {
    navigation(-1);
  };

  useEffect(() => {
    if (Object.keys(rowData).length > 0) {
      setFormStateTab1((prevState) => ({
        ...prevState,
        applicantName: rowData?.clientName,
        applicantAddress: prospectDetails?.data?.clientAddress
          ? prospectDetails?.data?.clientAddress
          : rowData?.clientAddress,
        contactNum1: prospectDetails?.data?.phoneNo
          ? prospectDetails?.data?.phoneNo
          : rowData?.clientPhone,
        contactNum2: rowData?.clientPhone2,
        emailId: rowData?.clientEmail,
        dob: rowData?.clientDob,
        aadhar: rowData?.clientAddharCard,
        pan: rowData?.clientPan,
        coApplicantName: rowData?.coApplicantName,
        coApplicantDob: rowData?.coApplicantDob,
        coApplicantAddress: rowData?.coApplicantAddress,
        coApplicantContactNum1: rowData?.coApplicantPhone,
        coApplicantContactNum2: rowData?.coApplicantPhone2,
        coApplicantEmailId: rowData?.coApplicantEmail,
        coApplicantAadhar: rowData?.coApplicantAddharCard,
        coApplicantPan: rowData?.coApplicantPan,
      }));

      setFormStateTab2((prevState) => ({
        ...prevState,
        unitNo: tab2CostingData?.unitNo,
        towerBlock: tab2CostingData?.towerBlock,
        floor: tab2CostingData?.floor,
        area: tab2CostingData?.area,
        bsp: tab2CostingData?.bsp,
        inauguralDiscount: tab2CostingData?.inauguralDiscount,
        npv: tab2CostingData?.npv,
        otherDiscount: tab2CostingData?.othDicountBuilder,
        netBsp: tab2CostingData?.netBsp,
        netBspArea: tab2CostingData?.totalAreaBsp,
        gstPercent: tab2CostingData?.gstPercent,
        gstAmount: tab2CostingData?.gstAmount,
        netUnitCost: tab2CostingData?.netCost,
        floorPlc: tab2CostingData?.floorPlc,
        facingPlc: tab2CostingData?.facingPlc,
        otherViewPlc: tab2CostingData?.otherViewPlc,
        carParking: tab2CostingData?.carParking,
        clubMembership: tab2CostingData?.clubMembership,
        powerBackupCharges: tab2CostingData?.powerBackupCharges,
        ifms: tab2CostingData?.ifmsAfterDiscount,
        leaseRent: tab2CostingData?.leaseRentAfterDiscount,
        essc: tab2CostingData?.esscPer,
        crf: tab2CostingData?.crfPer,
        edcIdc: tab2CostingData?.edcIdc,
        eecFfc: tab2CostingData?.eecFfc,
        terraceGarden: tab2CostingData?.terrageGarden,
        development: tab2CostingData?.development,
        facilities: tab2CostingData?.facilities,
        maintenance: tab2CostingData?.maintenance,
        meter: tab2CostingData?.meter,
        otherCharges: tab2CostingData?.otherCharges,
        totalOtherCharges: tab2CostingData?.totalOtherCharge,
        otherChargeGstRate: tab2CostingData?.otherChargeGstRate,
        gstAmountOnOtherCharges: tab2CostingData?.otherChargeGstAmt,
        totalWithGst: tab2CostingData?.totalOtherchargeWithGst,
        totalGstAmount: tab2CostingData?.totalGstAmount,
        totalUnitCost: tab2CostingData?.netCostWithGst,
        raPercent: rowData.ra_percent,
        rcPercent: rowData.rc_percent,
      }));

      setFormStateTab3((prevState) => ({
        ...prevState,
        bookingStatus:
          bookingStatusOptions.find(
            (role) => role.value == rowData.bookingStatusId
          ) || null,
        location:
          locationData.find((role) => role.value == rowData.locationId) || null,
        bookingDate: rowData?.bookingDate
          ? rowData?.bookingDate?.split(" ")[0]
          : "",
        propType:
          propTypeOptions.find((role) => role.value == rowData.propTypeId) ||
          null,
        saleStatus:
          saleStatusOptions.find(
            (role) => role.value == rowData.saleStatusId
          ) || null,
        schemeIncentive:
          schemeIncentiveOptions.find(
            (role) => role.value == rowData.schemaIncentiveId
          ) || null,
        formStage:
          formStageOptions.find((role) => role.value == rowData.formStageId) ||
          null,
        loanSelfFunding:
          loanSelfFundingOptions.find(
            (role) => role.value == rowData.loanSelfFundingId
          ) || null,
        kycStatus:
          kycStatusOptions.find((role) => role.value == rowData.kycStatusId) ||
          null,
        kycCompletionDate: rowData?.kycDate
          ? rowData?.kycDate?.split(" ")[0]
          : "",
        soReceiveDate: rowData?.soReceiveDate
          ? rowData?.soReceiveDate?.split(" ")[0]
          : "",
        soDispatchDate: rowData?.soDispatchDate
          ? rowData?.soDispatchDate?.split(" ")[0]
          : "",
        acceptanceDateByBuilder: rowData?.acceptanceDateByBuilder
          ? rowData?.acceptanceDateByBuilder?.split(" ")[0]
          : "",
        clientBBAStatus: rowData?.clientBbaStatus
          ? rowData?.clientBbaStatus?.split(" ")[0]
          : "",
        remarks: rowData?.remarks,
      }));
    }
  }, [rowData, tab2CostingData, prospectDetails?.data]);

  useEffect(() => {
    if (tab2CostingData && tab2CostingData.unitStatus) {
      const unitStatusKey = tab2CostingData.unitStatus;
      const unitStatusOption = unitStatusOptions.find(
        (option) => option.value === unitStatusKey
      );

      // Check if a matching option is found
      if (unitStatusOption) {
        setFormStateTab2((prevState) => ({
          ...prevState,
          unitStatus: unitStatusOption, // Set the found option
        }));
      }
    }
  }, [tab2CostingData]);

  useEffect(() => {
    if (rowData?.revanueId) {
      const revenue =
        Array.isArray(revenueData?.data?.data) &&
        revenueData?.data?.data?.find(
          (item) => item.value == rowData.revanueId
        );
      if (revenue) {
        setFormData((prevState) => ({ ...prevState, revenue }));
      }
    }
  }, [revenueData?.data?.data, rowData.revanueId]);

  useEffect(() => {
    if (rowData?.projectName) {
      const project = Array.isArray(projectData?.data?.data)
        ? projectData?.data?.data?.find(
          (item) => item.label === rowData.projectName
        )
        : [];
      if (project) {
        setFormData((prevState) => ({ ...prevState, project }));
      }
    }
  }, [projectData?.data?.data, rowData?.projectName]);

  useEffect(() => {
    if (rowData?.builderName) {
      const builder = Array.isArray(builderList?.data?.data)
        ? builderList?.data?.data?.find(
          (item) => item.label === rowData.builderName
        )
        : [];
      if (builder) {
        setFormData((prevState) => ({ ...prevState, builder }));
      }
    }
  }, [builderList?.data?.data, rowData.builderName]);

  const { mutate: calMutate } = usePost(CALCULATE_PROJECT_UNIT, {
    onSuccess: (response) => {
      if (response?.data.status === 1) {
        const calcData = response?.data?.data;
        setFormStateTab2({
          ...formStateTab2,
          netBsp: calcData.netBsp,
          netBspArea: calcData.netBspArea,
          netUnitCost: calcData.netCost,
          gstAmount: calcData.gstAmount,
          totalOtherCharges: calcData.totalOtherCharge,
          otherChargeGstRate: calcData.otherChargeGstAmt,

          gstAmountOnOtherCharges: calcData.totalOtherchargeWithGst, //gstAmount
          totalGstAmount: calcData.totalGstAmount,
          totalUnitCost: calcData.netCostWithGst,
        });
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleCalculateCostOnBlur = () => {
    let params = {
      projectUnitid: 0,
      builderId: "",
      projectId: "",
      createdBy: "",
      createdDate: "",
      modifyBy: "",
      modifyDate: "",
      unitNo: formStateTab2?.unitNo ? formStateTab2?.unitNo : "",
      towerBlock: formStateTab2?.towerBlock ? formStateTab2?.towerBlock : "",
      floor: formStateTab2?.floor,
      area: formStateTab2.area,
      bsp: formStateTab2.bsp,
      inauguralDiscount: formStateTab2.inauguralDiscount,
      npv: formStateTab2.npv,
      othDicountBuilder: formStateTab2.otherDiscount,
      totalAreaBsp: formStateTab2.netBspArea,
      floorPlc: formStateTab2.floorPlc,
      facingPlc: formStateTab2.facingPlc,
      otherViewPlc: formStateTab2.otherViewPlc,
      carParking: formStateTab2.parking,
      clubMembership: formStateTab2.clubMembership,
      powerBackupCharges: formStateTab2.powerBackup,
      ifmsAfterDiscount: formStateTab2.ifms,
      leaseRentAfterDiscount: formStateTab2.leaseRent,
      esscPer: formStateTab2.essc,
      crfPer: formStateTab2.crf,
      edcIdc: formStateTab2.edcIdc,
      eecFfc: formStateTab2.eecFfc,
      terrageGarden: formStateTab2.terraceGarden,
      facilities: formStateTab2.facilities,
      maintenance: formStateTab2.maintenance,
      meter: formStateTab2.meter,
      miscellaneous: 0,
      otherCharges: formStateTab2.otherCharges,
      netCost: formStateTab2.netUnitCost,
      gstPercent: formStateTab2.gstPercent,
      gstAmount: formStateTab2.gstAmount,
      netCostWithGst: formStateTab2.totalUnitCost,
      development: formStateTab2.development,
      unitStatus: formStateTab2?.unitStatus?.value,
      validTill: formStateTab2.validTillDate,
      holdBy: "",
      revenueId: 0,
      totalOtherCharge: formStateTab2.totalOtherCharges,
      otherChargeGstRate: formStateTab2.otherChargeGstRate,
      otherChargeGstAmt: formStateTab2.gstAmountOnOtherCharges,
      totalOtherchargeWithGst: formStateTab2.totalWithGst,
      totalGstAmount: formStateTab2.totalGstAmount,
      unitMapRevenueStatus: 0,
      unitHoldDate: "",
      adminHoldFor: "",
      adminHoldDate: "",
      clientName: "",
      holdRemarks: "",
      holdResetHours: 0,
      projectTypeId: "",
    };

    calMutate(params);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs title="Transaction" breadcrumbItem="Sale Data" />
          {(addLoading || getLoading) && <ScreenLoader />}
          {rowData?.saleId && (
            <h5 style={{ marginBottom: 5, fontSize: 12 }}>
              Unique ID : {rowData.saleId}
            </h5>
          )}
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <Form>
                    <Row>
                      <Col lg="4">
                        <h6 className="font-size-12" htmlFor="selectedBuilder">
                          Select Builder <RequiredStar/>
                        </h6>
                        <Select
                          style={{ zIndex: 9999 }}
                          menuPortalTarget={document.body}
                          id="selectedBuilder"
                          value={formData.builder}
                          onChange={(option) =>
                            handleChangeSelect(option, "builder")
                          }
                          options={
                            Array.isArray(builderList?.data?.data)
                              ? builderList?.data?.data
                              : []
                          }
                          className={`${errors.builder ? "is-invalid" : ""}`}
                        />
                        {errors.builder && (
                          <div className="invalid-feedback">
                            {errors.builder}
                          </div>
                        )}
                      </Col>

                      <Col lg="4">
                        <h6 className="font-size-12" htmlFor="selectedProject">
                          Select Project <RequiredStar/>
                        </h6>
                        <Select
                          style={{ zIndex: 9999 }}
                          menuPortalTarget={document.body}
                          isDisabled={!formData.builder}
                          id="selectedProject"
                          value={formData.project}
                          onChange={(option) =>
                            handleChangeSelect(option, "project")
                          }
                          options={
                            Array.isArray(projectData?.data?.data)
                              ? projectData?.data?.data
                              : []
                          }
                          className={`${errors.project ? "is-invalid" : ""}`}
                        />
                        {errors.project && (
                          <div className="invalid-feedback">
                            {errors.project}
                          </div>
                        )}
                      </Col>

                      <Col lg="4">
                        <h6 className="font-size-11" htmlFor="revenue">
                          Revenue List <RequiredStar/>
                        </h6>
                        <Select
                          style={{ zIndex: 9999 }}
                          menuPortalTarget={document.body}
                          id="revenue"
                          value={formData.revenue}
                          onChange={(option) =>
                            handleChangeSelect(option, "revenue")
                          }
                          options={
                            Array.isArray(revenueData?.data?.data)
                              ? revenueData?.data?.data
                              : []
                          }
                          className={`${errors.revenue ? "is-invalid" : ""}`}
                        />
                        {errors.revenue && (
                          <div className="invalid-feedback">
                            {errors.revenue}
                          </div>
                        )}
                      </Col>
                    </Row>
                  </Form>
                  <div id="progrss-wizard" className="twitter-bs-wizard mt-4">
                    <ul className="twitter-bs-wizard-nav nav-justified nav nav-pills">
                      <NavItem
                        className={classnames({ active: activeTabWiz === 1 })}
                      >
                        <NavLink
                          className={classnames({ active: activeTabWiz === 1 })}
                          onClick={() => toggleTabWiz(1)}
                        >
                          <span className="step-number">01</span>
                          <span
                            className="step-title"
                            style={{ paddingLeft: "10px" }}
                          >
                            Basic Information
                          </span>
                        </NavLink>
                      </NavItem>
                      <NavItem
                        className={classnames({ active: activeTabWiz === 2 })}
                      >
                        <NavLink
                          className={classnames({ active: activeTabWiz === 2 })}
                          onClick={() => toggleTabWiz(2)}
                        >
                          <span className="step-number">02</span>
                          <span
                            className="step-title"
                            style={{ paddingLeft: "10px" }}
                          >
                            Costing Details
                          </span>
                        </NavLink>
                      </NavItem>
                      <NavItem
                        className={classnames({ active: activeTabWiz === 3 })}
                      >
                        <NavLink
                          className={classnames({ active: activeTabWiz === 3 })}
                          onClick={() => toggleTabWiz(3)}
                        >
                          <span className="step-number">03</span>
                          <span
                            className="step-title"
                            style={{ paddingLeft: "10px" }}
                          >
                            Other Details
                          </span>
                        </NavLink>
                      </NavItem>
                    </ul>
                    <div id="bar" className="mt-4">
                      <div className="mb-4">
                        <Progress
                          value={34 * activeTabWiz}
                          color="success"
                          animated
                        ></Progress>
                      </div>
                    </div>

                    <TabContent
                      activeTab={activeTabWiz}
                      className="twitter-bs-wizard-tab-content"
                    >
                      <TabPane tabId={1}>
                        <Form>
                          <Row>
                            <Col lg="4">
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="applicantName"
                              >
                                Applicant Name{" "}
                                <RequiredStar/>
                              </h6>
                              <input
                                type="text"
                                name="applicantName"
                                value={formStateTab1.applicantName}
                                onChange={handleChangeTab1}
                                placeholder="Enter Applicant Name"
                                className={`form-control ${errors.applicantName ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.applicantName && (
                                <div className="invalid-feedback">
                                  {errors.applicantName}
                                </div>
                              )}
                            </Col>
                            <Col lg="4">
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="applicantAddress"
                              >
                                Applicant Address{" "}
                                <RequiredStar/>
                              </h6>
                              <input
                                type="text"
                                name="applicantAddress"
                                value={formStateTab1.applicantAddress}
                                onChange={handleChangeTab1}
                                placeholder="Enter Applicant Address"
                                className={`form-control ${errors.applicantAddress ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.applicantAddress && (
                                <div className="invalid-feedback">
                                  {errors.applicantAddress}
                                </div>
                              )}
                            </Col>

                            <Col lg="4">
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="contactNum1"
                              >
                                Contact Number 1{" "}
                                <RequiredStar/>
                              </h6>
                              <input
                                type="number"
                                name="contactNum1"
                                value={formStateTab1.contactNum1}
                                onChange={handleChangeTab1}
                                placeholder="Enter Contact Number 1"
                                className={`form-control ${errors.contactNum1 ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.contactNum1 && (
                                <div className="invalid-feedback">
                                  {errors.contactNum1}
                                </div>
                              )}
                            </Col>

                            {/* Second Column (3 inputs) */}
                            <Col lg="4">
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="contactNum2"
                              >
                                Contact Number 2{" "}
                              </h6>
                              <input
                                type="number"
                                name="contactNum2"
                                value={formStateTab1.contactNum2}
                                onChange={handleChangeTab1}
                                placeholder="Enter Contact Number 2"
                                className={`form-control`}
                              />
                            </Col>
                            <Col lg="4">
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="emailId"
                              >
                                Email ID
                              </h6>
                              <input
                                type="email"
                                name="emailId"
                                value={formStateTab1.emailId}
                                onChange={handleChangeTab1}
                                placeholder="Enter Email ID"
                                className={`form-control ${errors.emailId ? "is-invalid" : ""
                                  }`}
                              />
                            </Col>
                            <Col lg="4">
                              <h6 className="font-size-11 mt-2" htmlFor="dob">
                                Date of Birth{" "}
                                <RequiredStar/>
                              </h6>
                              <input
                                type="date"
                                name="dob"
                                value={formStateTab1.dob}
                                onChange={handleChangeTab1}
                                className={`form-control ${errors.dob ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.dob && (
                                <div className="invalid-feedback">
                                  {errors.dob}
                                </div>
                              )}
                            </Col>

                            {/* Third Column (3 inputs) */}
                            <Col lg="4">
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="aadhar"
                              >
                                Aadhar Number{" "}
                                <RequiredStar/>
                              </h6>
                              <input
                                type="number"
                                name="aadhar"
                                value={formStateTab1.aadhar}
                                onChange={handleChangeTab1}
                                maxLength={12}
                                placeholder="Enter Aadhar Number"
                                className={`form-control ${errors.aadhar ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.aadhar && (
                                <div className="invalid-feedback">
                                  {errors.aadhar}
                                </div>
                              )}
                            </Col>
                            <Col lg="4">
                              <h6 className="font-size-11 mt-2" htmlFor="pan">
                                PAN Number{" "}
                                <RequiredStar/>
                              </h6>
                              <input
                                type="text"
                                name="pan"
                                maxLength={10}
                                value={formStateTab1.pan}
                                onChange={handleChangeTab1}
                                placeholder="Enter PAN Number"
                                className={`form-control ${errors.pan ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.pan && (
                                <div className="invalid-feedback">
                                  {errors.pan}
                                </div>
                              )}
                            </Col>
                          </Row>
                          <Row>
                            <Col lg="4">
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="coApplicantName"
                              >
                                Co-Applicant Name{" "}
                              </h6>
                              <input
                                type="text"
                                name="coApplicantName"
                                value={formStateTab1.coApplicantName}
                                onChange={handleChangeTab1}
                                placeholder="Enter Co-Applicant Name"
                                className={`form-control ${errors.coApplicantName ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.coApplicantName && (
                                <div className="invalid-feedback">
                                  {errors.coApplicantName}
                                </div>
                              )}
                            </Col>
                            <Col lg="4">
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="coApplicantDob"
                              >
                                Co-Applicant DOB{" "}
                              </h6>
                              <input
                                type="date"
                                name="coApplicantDob"
                                value={formStateTab1.coApplicantDob}
                                onChange={handleChangeTab1}
                                className={`form-control ${errors.coApplicantDob ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.coApplicantDob && (
                                <div className="invalid-feedback">
                                  {errors.coApplicantDob}
                                </div>
                              )}
                            </Col>
                            <Col lg="4">
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="coApplicantAddress"
                              >
                                Co-Applicant Address{" "}
                              </h6>
                              <input
                                type="text"
                                name="coApplicantAddress"
                                value={formStateTab1.coApplicantAddress}
                                onChange={handleChangeTab1}
                                placeholder="Enter Co-Applicant Address"
                                className={`form-control ${errors.coApplicantAddress ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.coApplicantAddress && (
                                <div className="invalid-feedback">
                                  {errors.coApplicantAddress}
                                </div>
                              )}
                            </Col>

                            {/* Fifth Column (3 inputs - Co-applicant) */}
                            <Col lg="4">
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="coApplicantContactNum1"
                              >
                                Co-Applicant Contact Number 1{" "}
                              </h6>
                              <input
                                type="number"
                                name="coApplicantContactNum1"
                                value={formStateTab1.coApplicantContactNum1}
                                onChange={handleChangeTab1}
                                placeholder="Enter Co-Applicant Contact Number 1"
                                className={`form-control ${errors.coApplicantContactNum1
                                    ? "is-invalid"
                                    : ""
                                  }`}
                              />
                              {errors.coApplicantContactNum1 && (
                                <div className="invalid-feedback">
                                  {errors.coApplicantContactNum1}
                                </div>
                              )}
                            </Col>
                            <Col lg="4">
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="coApplicantContactNum2"
                              >
                                Co-Applicant Contact Number 2{" "}
                              </h6>
                              <input
                                type="number"
                                name="coApplicantContactNum2"
                                value={formStateTab1.coApplicantContactNum2}
                                onChange={handleChangeTab1}
                                placeholder="Enter Co-Applicant Contact Number 2"
                                className={`form-control ${errors.coApplicantContactNum2
                                    ? "is-invalid"
                                    : ""
                                  }`}
                              />
                              {errors.coApplicantContactNum2 && (
                                <div className="invalid-feedback">
                                  {errors.coApplicantContactNum2}
                                </div>
                              )}
                            </Col>
                            <Col lg="4">
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="coApplicantEmailId"
                              >
                                Co-Applicant Email ID{" "}
                              </h6>
                              <input
                                type="email"
                                name="coApplicantEmailId"
                                value={formStateTab1.coApplicantEmailId}
                                onChange={handleChangeTab1}
                                placeholder="Enter Co-Applicant Email ID"
                                className={`form-control ${errors.coApplicantEmailId ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.coApplicantEmailId && (
                                <div className="invalid-feedback">
                                  {errors.coApplicantEmailId}
                                </div>
                              )}
                            </Col>

                            <Col lg="4">
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="coApplicantAadhar"
                              >
                                Co-Applicant Aadhar Number{" "}
                              </h6>
                              <input
                                type="number"
                                name="coApplicantAadhar"
                                value={formStateTab1.coApplicantAadhar}
                                onChange={handleChangeTab1}
                                placeholder="Enter Co-Applicant Aadhar Number"
                                className={`form-control ${errors.coApplicantAadhar ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.coApplicantAadhar && (
                                <div className="invalid-feedback">
                                  {errors.coApplicantAadhar}
                                </div>
                              )}
                            </Col>
                            <Col lg="4">
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="coApplicantPan"
                              >
                                Co-Applicant PAN Number{" "}
                              </h6>
                              <input
                                type="text"
                                maxLength={10}
                                name="coApplicantPan"
                                value={formStateTab1.coApplicantPan}
                                onChange={handleChangeTab1}
                                placeholder="Enter Co-Applicant PAN Number"
                                className={`form-control ${errors.coApplicantPan ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.coApplicantPan && (
                                <div className="invalid-feedback">
                                  {errors.coApplicantPan}
                                </div>
                              )}
                            </Col>
                          </Row>
                        </Form>
                      </TabPane>

                      <TabPane tabId={2}>
                        <Form>
                          <Row>
                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">Unit No</h6>
                              <input
                                type="text"
                                name="unitNo"
                                disabled
                                style={inputStyle}
                                placeholder="Enter Unit No"
                                className="form-control"
                                value={formStateTab2?.unitNo}
                                onChange={handleChangeTab2}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">Tower/Block</h6>
                              <input
                                type="text"
                                name="towerBlock"
                                disabled
                                style={inputStyle}
                                placeholder="Enter Tower/Block"
                                value={formStateTab2?.towerBlock}
                                onChange={handleChangeTab2}
                                className="form-control"
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">Floor</h6>
                              <input
                                type="text"
                                name="floor"
                                disabled
                                style={inputStyle}
                                placeholder="Enter Floor"
                                value={formStateTab2?.floor}
                                onChange={handleChangeTab2}
                                className="form-control"
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">Area</h6>
                              <input
                                type="text"
                                disabled
                                style={inputStyle}
                                name="area"
                                placeholder="Enter Area"
                                onBlur={handleCalculateCostOnBlur}
                                value={formStateTab2?.area}
                                onChange={handleChangeTab2}
                                className="form-control"
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">BSP</h6>
                              <input
                                type="text"
                                name="bsp"
                                placeholder="Enter BSP"
                                onBlur={handleCalculateCostOnBlur}
                                value={formStateTab2?.bsp}
                                onChange={handleChangeTab2}
                                className="form-control"
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                Inaugural Discount
                              </h6>
                              <input
                                type="text"
                                name="inauguralDiscount"
                                onBlur={handleCalculateCostOnBlur}
                                placeholder="Enter Inaugural Discount"
                                value={formStateTab2?.inauguralDiscount}
                                onChange={handleChangeTab2}
                                className="form-control"
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">NPV</h6>
                              <input
                                type="text"
                                name="npv"
                                placeholder="Enter NPV"
                                onBlur={handleCalculateCostOnBlur}
                                value={formStateTab2?.npv}
                                onChange={handleChangeTab2}
                                className="form-control"
                                disabled
                                style={inputStyle}
                              />
                            </Col>
                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                Other Discount
                              </h6>

                              <input
                                type="text"
                                name="otherDiscount"
                                onBlur={handleCalculateCostOnBlur}
                                placeholder="Enter Other Discount"
                                value={formStateTab2?.otherDiscount}
                                onChange={handleChangeTab2}
                                className="form-control"
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">Net BSP</h6>
                              <input
                                type="text"
                                name="netBsp"
                                placeholder="Enter Net BSP"
                                value={formStateTab2?.netBsp}
                                onChange={handleChangeTab2}
                                className="form-control"
                                style={inputStyle}
                                disabled
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                Net BSP Area
                              </h6>
                              <input
                                type="text"
                                name="netBspArea"
                                placeholder="Enter Net BSP Area"
                                value={formStateTab2?.netBspArea}
                                onChange={handleChangeTab2}
                                className="form-control"
                                style={inputStyle}
                                disabled
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">GST %</h6>
                              <input
                                type="text"
                                name="gstPercent"
                                onBlur={handleCalculateCostOnBlur}
                                placeholder="Enter GST %"
                                value={formStateTab2?.gstPercent}
                                onChange={handleChangeTab2}
                                className="form-control"
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">GST Amount</h6>
                              <input
                                type="text"
                                name="gstAmount"
                                placeholder="Enter GST Amount"
                                value={formStateTab2?.gstAmount}
                                onChange={handleChangeTab2}
                                className="form-control"
                                style={inputStyle}
                                disabled
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                Net Unit Cost
                              </h6>
                              <input
                                type="text"
                                name="netUnitCost"
                                placeholder="Enter Net Unit Cost"
                                value={formStateTab2?.netUnitCost}
                                onChange={handleChangeTab2}
                                className="form-control"
                                style={inputStyle}
                                disabled
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">Floor PLC</h6>
                              <input
                                type="text"
                                name="floorPlc"
                                placeholder="Enter Floor PLC"
                                onBlur={handleCalculateCostOnBlur}
                                value={formStateTab2?.floorPlc}
                                onChange={handleChangeTab2}
                                className="form-control"
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">Facing PLC</h6>
                              <input
                                type="text"
                                name="facingPlc"
                                placeholder="Enter Facing PLC"
                                onBlur={handleCalculateCostOnBlur}
                                value={formStateTab2?.facingPlc}
                                onChange={handleChangeTab2}
                                className="form-control"
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                Other View PLC
                              </h6>
                              <input
                                type="text"
                                onBlur={handleCalculateCostOnBlur}
                                name="otherViewPlc"
                                placeholder="Enter Other View PLC"
                                className="form-control"
                                value={formStateTab2?.otherViewPlc}
                                onChange={handleChangeTab2}
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">Parking</h6>
                              <input
                                type="text"
                                onBlur={handleCalculateCostOnBlur}
                                name="carParking"
                                placeholder="Enter Parking"
                                className="form-control"
                                value={formStateTab2?.carParking}
                                onChange={handleChangeTab2}
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                Club Membership
                              </h6>
                              <input
                                type="text"
                                name="clubMembership"
                                onBlur={handleCalculateCostOnBlur}
                                placeholder="Enter Club Membership"
                                className="form-control"
                                value={formStateTab2?.clubMembership}
                                onChange={handleChangeTab2}
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                Power Backup
                              </h6>
                              <input
                                type="text"
                                onBlur={handleCalculateCostOnBlur}
                                name="powerBackupCharges"
                                placeholder="Enter Power Backup"
                                className="form-control"
                                value={formStateTab2?.powerBackupCharges}
                                onChange={handleChangeTab2}
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">IFMS</h6>
                              <input
                                type="text"
                                onBlur={handleCalculateCostOnBlur}
                                name="ifms"
                                placeholder="Enter IFMS"
                                className="form-control"
                                value={formStateTab2?.ifms}
                                onChange={handleChangeTab2}
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">Lease Rent</h6>
                              <input
                                type="text"
                                onBlur={handleCalculateCostOnBlur}
                                name="leaseRent"
                                placeholder="Enter Lease Rent"
                                className="form-control"
                                value={formStateTab2?.leaseRent}
                                onChange={handleChangeTab2}
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">ESSC</h6>
                              <input
                                type="text"
                                onBlur={handleCalculateCostOnBlur}
                                name="essc"
                                placeholder="Enter ESSC"
                                className="form-control"
                                value={formStateTab2?.essc}
                                onChange={handleChangeTab2}
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">CRF</h6>
                              <input
                                type="text"
                                onBlur={handleCalculateCostOnBlur}
                                name="crf"
                                placeholder="Enter CRF"
                                className="form-control"
                                value={formStateTab2?.crf}
                                onChange={handleChangeTab2}
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">EDC/IDC</h6>
                              <input
                                type="text"
                                name="edcIdc"
                                onBlur={handleCalculateCostOnBlur}
                                placeholder="Enter EDC/IDC"
                                className="form-control"
                                value={formStateTab2?.edcIdc}
                                onChange={handleChangeTab2}
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">EEC/FFC</h6>
                              <input
                                type="text"
                                name="eecFfc"
                                onBlur={handleCalculateCostOnBlur}
                                placeholder="Enter EEC/FFC"
                                className="form-control"
                                value={formStateTab2?.eecFfc}
                                onChange={handleChangeTab2}
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                Terrace/Garden
                              </h6>
                              <input
                                type="text"
                                name="terraceGarden"
                                onBlur={handleCalculateCostOnBlur}
                                placeholder="Enter Terrace/Garden"
                                className="form-control"
                                value={formStateTab2?.terraceGarden}
                                onChange={handleChangeTab2}
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">Development</h6>
                              <input
                                type="text"
                                name="development"
                                onBlur={handleCalculateCostOnBlur}
                                placeholder="Enter Development"
                                className="form-control"
                                value={formStateTab2?.development}
                                onChange={handleChangeTab2}
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">Facilities</h6>
                              <input
                                type="text"
                                name="facilities"
                                onBlur={handleCalculateCostOnBlur}
                                placeholder="Enter Facilities"
                                className="form-control"
                                value={formStateTab2?.facilities}
                                onChange={handleChangeTab2}
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">Maintenance</h6>
                              <input
                                type="text"
                                name="maintenance"
                                onBlur={handleCalculateCostOnBlur}
                                placeholder="Enter Maintenance"
                                className="form-control"
                                value={formStateTab2?.maintenance}
                                onChange={handleChangeTab2}
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">Meter</h6>
                              <input
                                type="text"
                                name="meter"
                                onBlur={handleCalculateCostOnBlur}
                                placeholder="Enter Meter"
                                className="form-control"
                                value={formStateTab2?.meter}
                                onChange={handleChangeTab2}
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                Other Charges
                              </h6>
                              <input
                                type="text"
                                name="otherCharges"
                                onBlur={handleCalculateCostOnBlur}
                                placeholder="Enter Other Charges"
                                className="form-control"
                                value={formStateTab2?.otherCharges}
                                onChange={handleChangeTab2}
                                disabled
                                style={inputStyle}
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                Total Other Charges
                              </h6>
                              <input
                                type="text"
                                name="totalOtherCharges"
                                placeholder="Enter Total Other Charges"
                                value={formStateTab2?.totalOtherCharges}
                                onChange={handleChangeTab2}
                                className="form-control"
                                style={inputStyle}
                                disabled
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                GST% On Other Charges
                              </h6>
                              <input
                                type="text"
                                name="otherChargeGstRate"
                                placeholder="Enter Total Other Charges"
                                value={formStateTab2?.otherChargeGstRate}
                                onChange={handleChangeTab2}
                                onBlur={handleCalculateCostOnBlur}
                                className="form-control"
                                style={inputStyle}
                                disabled
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                GST Amount On Other Charges
                              </h6>
                              <input
                                type="text"
                                name="gstAmountOnOtherCharges"
                                placeholder="Enter Total Other Charges"
                                value={formStateTab2?.gstAmountOnOtherCharges}
                                onChange={handleChangeTab2}
                                className="form-control"
                                style={inputStyle}
                                disabled
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                Total with GST
                              </h6>
                              <input
                                type="text"
                                name="totalWithGst"
                                placeholder="Enter Total with GST"
                                value={formStateTab2?.totalWithGst}
                                onChange={handleChangeTab2}
                                className="form-control"
                                style={inputStyle}
                                disabled
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                Total GST Amount
                              </h6>
                              <input
                                type="text"
                                name="totalGstAmt"
                                placeholder="Enter Total GST Amount"
                                value={formStateTab2?.totalGstAmount}
                                onChange={handleChangeTab2}
                                className="form-control"
                                style={inputStyle}
                                disabled
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                Total Unit Cost
                              </h6>
                              <input
                                type="text"
                                name="totalUnitCost"
                                placeholder="Enter Total Unit Cost"
                                value={formStateTab2?.totalUnitCost}
                                onChange={handleChangeTab2}
                                className="form-control"
                                style={inputStyle}
                                disabled
                              />
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                Unit Status{" "}
                                <RequiredStar/>
                              </h6>
                              <Select
                                style={{ zIndex: 9999 }}
                                menuPortalTarget={document.body}
                                options={unitStatusOptions}
                                value={formStateTab2?.unitStatus}
                                onChange={handleUnitStatusChange}
                                className={`${errors.unitStatus ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.unitStatus && (
                                <div className="invalid-feedback">
                                  {errors.unitStatus}
                                </div>
                              )}
                            </Col>
                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">
                                Payment Plan{" "}
                              </h6>
                              {/* <input
                                type="text"
                                name="paymentPlan"
                                placeholder="Enter Payment Plan"
                                value={formStateTab2?.paymentPlan}
                                onChange={handleChangeTab2}
                                className={`form-control ${
                                  errors.paymentPlan ? "is-invalid" : ""
                                }`}
                              /> */}
                              <Select
                                style={{ zIndex: 9999 }}
                                menuPortalTarget={document.body}
                                options={
                                  Array.isArray(paymentPlanList?.data?.data)
                                    ? paymentPlanList?.data?.data
                                    : []
                                }
                                value={formStateTab2?.paymentPlan}
                                onChange={handlePaymentPlanChange}
                                className={`${errors.paymentPlan ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.paymentPlan && (
                                <div className="invalid-feedback">
                                  {errors.paymentPlan}
                                </div>
                              )}
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2"> Assured Business %</h6>
                              <input
                                type="number"
                                name="raPercent"
                                placeholder="Enter  Assured Business %"
                                value={formStateTab2?.raPercent}
                                onChange={handleChangeTab2}
                                className={`form-control ${errors.raPercent ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.raPercent && (
                                <div className="invalid-feedback">
                                  {errors.raPercent}
                                </div>
                              )}
                            </Col>

                            <Col lg="4">
                              <h6 className="font-size-11 mt-2">Verified Business %</h6>
                              <input
                                type="number"
                                name="rcPercent"
                                placeholder="Enter Verified Business %"
                                value={formStateTab2?.rcPercent}
                                onChange={handleChangeTab2}
                                className={`form-control ${errors.rcPercent ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.rcPercent && (
                                <div className="invalid-feedback">
                                  {errors.rcPercent}
                                </div>
                              )}
                            </Col>
                          </Row>
                        </Form>
                      </TabPane>

                      <TabPane tabId={3}>
                        <Form>
                          <Row>
                            <Col md={4}>
                              <h6
                                className="font-size-12"
                                htmlFor="bookingStatus"
                              >
                                Booking Status{" "}
                                <RequiredStar/>
                              </h6>
                              <Select
                                style={{ zIndex: 9999 }}
                                menuPortalTarget={document.body}
                                id="bookingStatus"
                                value={formStateTab3.bookingStatus}
                                onChange={(option) =>
                                  handleChangeSelectTab3(
                                    option,
                                    "bookingStatus"
                                  )
                                }
                                options={bookingStatusOptions}
                                placeholder="Select Booking Status"
                                className={`${errors.bookingStatus ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.bookingStatus && (
                                <div className="invalid-feedback">
                                  {errors.bookingStatus}
                                </div>
                              )}
                            </Col>

                            <Col md={4}>
                              <h6 className="font-size-11" htmlFor="location">
                                Location <RequiredStar/>
                              </h6>
                              <Select
                                style={{ zIndex: 9999 }}
                                menuPortalTarget={document.body}
                                id="location"
                                value={formStateTab3.location}
                                onChange={(option) =>
                                  handleChangeSelectTab3(option, "location")
                                }
                                options={locationData}
                                placeholder="Select Location"
                                className={`${errors.location ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.location && (
                                <div className="invalid-feedback">
                                  {errors.location}
                                </div>
                              )}
                            </Col>

                            <Col md={4}>
                              <h6
                                className="font-size-12"
                                htmlFor="bookingDate"
                              >
                                Booking Date{" "}
                                <RequiredStar/>
                              </h6>
                              <input
                                type="date"
                                name="bookingDate"
                                value={formStateTab3.bookingDate}
                                onChange={handleChangeTab3}
                                placeholder="Booking Date"
                                className={`form-control ${errors.bookingDate ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.bookingDate && (
                                <div className="invalid-feedback">
                                  {errors.bookingDate}
                                </div>
                              )}
                            </Col>
                          </Row>

                          <Row>
                            <Col md={4}>
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="propType"
                              >
                                Property Type{" "}
                                <RequiredStar/>
                              </h6>
                              <Select
                                style={{ zIndex: 9999 }}
                                menuPortalTarget={document.body}
                                id="propType"
                                value={formStateTab3.propType}
                                onChange={(option) =>
                                  handleChangeSelectTab3(option, "propType")
                                }
                                options={propTypeOptions}
                                placeholder="Select Property Type"
                                className={`${errors.propType ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.propType && (
                                <div className="invalid-feedback">
                                  {errors.propType}
                                </div>
                              )}
                            </Col>

                            <Col md={4}>
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="saleStatus"
                              >
                                Sale Status{" "}
                                <RequiredStar/>
                              </h6>
                              <Select
                                style={{ zIndex: 9999 }}
                                menuPortalTarget={document.body}
                                id="saleStatus"
                                value={formStateTab3.saleStatus}
                                onChange={(option) =>
                                  handleChangeSelectTab3(option, "saleStatus")
                                }
                                options={saleStatusOptions}
                                placeholder="Select Sale Status"
                                className={`${errors.saleStatus ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.saleStatus && (
                                <div className="invalid-feedback">
                                  {errors.saleStatus}
                                </div>
                              )}
                            </Col>

                            <Col md={4}>
                              <h6
                                className="font-size-12 mt-2"
                                htmlFor="schemeIncentive"
                              >
                                Scheme/Incentive{" "}
                                <RequiredStar/>
                              </h6>
                              <Select
                                style={{ zIndex: 9999 }}
                                menuPortalTarget={document.body}
                                id="schemeIncentive"
                                value={formStateTab3.schemeIncentive}
                                onChange={(option) =>
                                  handleChangeSelectTab3(
                                    option,
                                    "schemeIncentive"
                                  )
                                }
                                options={schemeIncentiveOptions}
                                placeholder="Select Scheme/Incentive"
                                className={`${errors.schemeIncentive ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.schemeIncentive && (
                                <div className="invalid-feedback">
                                  {errors.schemeIncentive}
                                </div>
                              )}
                            </Col>
                          </Row>

                          <Row>
                            <Col md={4}>
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="formStage"
                              >
                                Form Stage{" "}
                                <RequiredStar/>
                              </h6>
                              <Select
                                style={{ zIndex: 9999 }}
                                menuPortalTarget={document.body}
                                id="formStage"
                                value={formStateTab3.formStage}
                                onChange={(option) =>
                                  handleChangeSelectTab3(option, "formStage")
                                }
                                options={formStageOptions}
                                placeholder="Select Form Stage"
                                className={`${errors.formStage ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.formStage && (
                                <div className="invalid-feedback">
                                  {errors.formStage}
                                </div>
                              )}
                            </Col>

                            <Col md={4}>
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="loanSelfFunding"
                              >
                                Loan/Self Funding{" "}
                                <RequiredStar/>
                              </h6>
                              <Select
                                style={{ zIndex: 9999 }}
                                menuPortalTarget={document.body}
                                id="loanSelfFunding"
                                value={formStateTab3.loanSelfFunding}
                                onChange={(option) =>
                                  handleChangeSelectTab3(
                                    option,
                                    "loanSelfFunding"
                                  )
                                }
                                options={loanSelfFundingOptions}
                                placeholder="Select Loan/Self Funding"
                                className={`${errors.loanSelfFunding ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.loanSelfFunding && (
                                <div className="invalid-feedback">
                                  {errors.loanSelfFunding}
                                </div>
                              )}
                            </Col>

                            <Col md={4}>
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="kycStatus"
                              >
                                KYC Status{" "}
                                <RequiredStar/>
                              </h6>
                              <Select
                                style={{ zIndex: 9999 }}
                                menuPortalTarget={document.body}
                                id="kycStatus"
                                value={formStateTab3.kycStatus}
                                onChange={(option) =>
                                  handleChangeSelectTab3(option, "kycStatus")
                                }
                                options={kycStatusOptions}
                                placeholder="Select KYC Status"
                                className={`${errors.kycStatus ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.kycStatus && (
                                <div className="invalid-feedback">
                                  {errors.kycStatus}
                                </div>
                              )}
                            </Col>
                          </Row>

                          <Row>
                            <Col md={4}>
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="kycCompletionDate"
                              >
                                KYC Completion Date{" "}
                              </h6>
                              <input
                                type="date"
                                name="kycCompletionDate"
                                value={formStateTab3.kycCompletionDate}
                                onChange={handleChangeTab3}
                                placeholder="KYC Completion Date"
                                className={`form-control`}
                              />
                            </Col>

                            <Col md={4}>
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="soReceiveDate"
                              >
                                SO Receive Date{" "}
                              </h6>
                              <input
                                type="date"
                                name="soReceiveDate"
                                value={formStateTab3.soReceiveDate}
                                onChange={handleChangeTab3}
                                placeholder="SO Receive Date"
                                className={`form-control`}
                              />
                            </Col>

                            <Col md={4}>
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="soDispatchDate"
                              >
                                SO Dispatch Date{" "}
                              </h6>
                              <input
                                type="date"
                                name="soDispatchDate"
                                value={formStateTab3.soDispatchDate}
                                onChange={handleChangeTab3}
                                placeholder="SO Dispatch Date"
                                className={`form-control`}
                              />
                            </Col>
                          </Row>

                          <Row>
                            <Col md={4}>
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="acceptanceDateByBuilder"
                              >
                                Acceptance Date by Builder{" "}
                              </h6>
                              <input
                                type="date"
                                name="acceptanceDateByBuilder"
                                value={formStateTab3.acceptanceDateByBuilder}
                                onChange={handleChangeTab3}
                                placeholder="Acceptance Date"
                                className={`form-control`}
                              />
                            </Col>

                            <Col md={4}>
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="clientBBAStatus"
                              >
                                Client BBA Status{" "}
                              </h6>
                              <input
                                type="date"
                                name="clientBBAStatus"
                                value={formStateTab3.clientBBAStatus}
                                onChange={handleChangeTab3}
                                placeholder="Client BBA Status"
                                className={`form-control`}
                              />
                            </Col>

                            <Col md={8}>
                              <h6
                                className="font-size-11 mt-2"
                                htmlFor="remarks"
                              >
                                Remarks <RequiredStar/>
                              </h6>
                              <textarea
                                name="remarks"
                                value={formStateTab3.remarks}
                                onChange={handleChangeTab3}
                                rows={4}
                                placeholder="Enter remarks"
                                className={`form-control ${errors.remarks ? "is-invalid" : ""
                                  }`}
                              />
                              {errors.remarks && (
                                <div className="invalid-feedback">
                                  {errors.remarks}
                                </div>
                              )}
                            </Col>
                          </Row>
                        </Form>
                      </TabPane>
                    </TabContent>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          {activeTabWiz === 3 && (
            <Row className="justify-content-center mb-3">
              <Col className="text-center">
                <button className="btn btn-primary" onClick={handleSave}>
                  Save
                </button>
                <button
                  className="btn btn-secondary ms-2"
                  color="secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
}
