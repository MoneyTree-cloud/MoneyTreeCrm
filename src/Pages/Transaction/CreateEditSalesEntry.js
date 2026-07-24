/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Form, Row, TabContent, TabPane, Progress, NavLink, NavItem, Button } from "reactstrap";
import classnames from "classnames";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost, usePut } from "../../Hooks/useApi";
import {
  // ALL_CONNECT_DROPDOWN,
  GET_ALL_PROSPECT_DETAILS_BY_PROS_ID,
  GET_ALL_USERS_DROPDOWN,
  GET_ALL_USERS_DROPDOWN_LIST,
  GET_COSTING_BY_PROJECT_UNITID,
  GET_DROPDOWN_BUILDER_,
  GET_PROJECT_BY_BUILDER_,
  GET_UNIT_BY_BUILDER_PROJECT,
  PAYMENT_PLAN_DROPDOWN,
  PROSPECT_DROPDOWN,
  SAVE_SALE_FORM,
  UPDATE_SALE_ENTRY,
} from "../../helpers/url_helper";
import Select from "react-select";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import { RegexFile } from "../../helpers/RegexFile";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { formatDate, formatDateTime, getDaysAgo, maskEmail, maskLastFour, maskValue, RequiredStar, roundToTwoDecimals } from "../../helpers/function_helper";
import { formStageOptions } from "../../constants/global";
import { decryptData } from "../../components/Common/CryptoUtils";

const CreateEditSalesEntry = () => {
  const location = useLocation();
  const { rowData, formState, page, searchByGroupSelect, searchTerm, builder, project, formStage } = location.state || {};
  const { userId, empCode } = useUserStore((state) => state.user);
  const [activeTabWiz, setActiveTabWiz] = useState(1);
  const [unitData, setUnitData] = useState([]);
  const navigation = useNavigate();
  const [prosOptions, setProsOptions] = useState([]);
  const [passedStepsWiz, setPassedStepsWiz] = useState([1]);
  const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_);
  const { data: paymentPlanList } = useGet(PAYMENT_PLAN_DROPDOWN);
  const [errors, setErrors] = useState({});
  // const { data: connectList } = useGet(ALL_CONNECT_DROPDOWN);
  const [activeField, setActiveField] = useState("");
  const [prospectData, setProspectData] = useState({})

  const [formData, setFormData] = useState({
    associate: null,
    builder: null,
    project: null,
    unit: null,
    revenue: null,
    prospect: null,
    bookingType: null,
    rewardPoints: 0,
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
    unitStatus: null,
    paymentPlan: null,
    raPercent: 0,
    rcPercent: 0,
  });

  const [formStateTab3, setFormStateTab3] = useState({
    bookingStatus: null,
    location: null,
    bookingDate: "",
    propType: null,
    saleStatus: null,
    schemeIncentive: null,
    incentiveId: null,
    formStage: null,
    loanSelfFunding: null,
    kycStatus: null,
    kycCompletionDate: "",
    soReceiveDate: "",
    soDispatchDate: "",
    acceptanceDateByBuilder: "",
    clientBBAStatus: "",
    remarks: "",
    connectBookingStatus: null,
    connectSuspectName: null,
    bookingRange: null
  });

  const bookingTypeGrp = useMemo(
    () => [
      { label: "Fresh", value: "Fresh" },
      { label: "Resale", value: "Resale" },
    ],
    []
  );

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
    }

    // Update the error state
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
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
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
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

  // const handleChangeSelect = (selectedOption, fieldName) => {
  //   setFormData((prevState) => ({
  //     ...prevState,
  //     [fieldName]: selectedOption,
  //   }));
  //   setErrors((prev) => ({
  //     ...prev,
  //     [fieldName]: "",
  //   }));
  // };

  const handleChangeSelect = (selectedOption, fieldName) => {
    setFormData((prevState) => {
      const updatedState = { ...prevState };

      // Set the current field
      updatedState[fieldName] = selectedOption;

      // Clear dependent fields
      if (fieldName === "builder") {
        updatedState.project = null;
        updatedState.unit = null;
      } else if (fieldName === "project") {
        updatedState.unit = null;
      }

      return updatedState;
    });

    setErrors((prev) => {
      const updatedErrors = { ...prev };
      updatedErrors[fieldName] = "";

      // Optionally clear child errors too
      if (fieldName === "builder") {
        updatedErrors.project = "";
        updatedErrors.unit = "";
      } else if (fieldName === "project") {
        updatedErrors.unit = "";
      }

      return updatedErrors;
    });
  };

  const { isPending: addLoadingUnit, mutate: mutateUnitData } = usePut(
    `${GET_UNIT_BY_BUILDER_PROJECT}${formData?.builder?.value}&projectName=${formData?.project?.value}`,
    {
      onSuccess: (response) => {
        if (response.data.status === 1) {
          if (Object?.keys(rowData)?.length === 0) {
            setUnitData(response?.data?.data);
          } else {
            setUnitData((prev) => [
              { label: rowData?.unitName, value: rowData?.unitId }, // Add the new object
              ...response?.data?.data, // Add any additional data from the response (assuming it's an array)
            ]);
          }
        } else if (response.data.message === "No record found !") {
          setUnitData((prev) => [
            { label: rowData?.unitName, value: rowData?.unitId }, // Add the new object
          ]);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  useEffect(() => {
    if (formData?.project?.value) {
      mutateUnitData();
    }
  }, [formData?.project]);

  const handleChangeSelectTab3 = (selectedOption, fieldName) => {
    setFormStateTab3((prevState) => ({
      ...prevState,
      [fieldName]: selectedOption, // Use selectedOption.value for the value
    }));
  };

  const { data: prospectDetails, isLoading } = useGet(
    GET_ALL_PROSPECT_DETAILS_BY_PROS_ID + formData?.prospect?.value,
    { enabled: Boolean(formData?.prospect?.value) }
  );

  useEffect(() => {
    if (prospectDetails?.data) {
      decryptData(prospectDetails?.data).then((decryptedData) => {
        if (decryptedData) {
          setProspectData(decryptedData);
        } else {
          setProspectData({})
        }
      });
    }
  }, [prospectDetails]);

  const { data: associateList, isLoading: loadingUserList } = useGet(
    (Object.keys(rowData).length === 0) ? GET_ALL_USERS_DROPDOWN : GET_ALL_USERS_DROPDOWN_LIST
  );

  const { data: prospectList, isLoading: loadingProsList } = useGet(PROSPECT_DROPDOWN + formData?.associate?.value, { enabled: Boolean(formData?.associate?.value), });

  useEffect(() => {
    if (rowData?.prospectId && prospectList?.data?.data) {
      const exists = prospectList.data.data.some(
        (item) => item.value === rowData.prospectId
      );

      if (!exists && rowData.prospectName && rowData.prospectId) {
        // Append new prospect
        const newOption = {
          label: rowData.prospectName,
          value: rowData.prospectId,
        };

        setProsOptions((prev) => [...prospectList.data.data, newOption]);
      } else {
        setProsOptions(prospectList.data.data);
      }
    }
  }, [rowData, prospectList]);

  const { data: projectData } = useGet(
    `${GET_PROJECT_BY_BUILDER_}${formData?.builder?.value}`,
    { enabled: !!formData.builder?.value }
  );

  const { data: costingData } = useGet(
    `${GET_COSTING_BY_PROJECT_UNITID}=${formData?.unit?.value}`,
    { enabled: Boolean(formData?.unit) }
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

  const MASK_FIELD_MAP = {
    // Contact Numbers
    contactNum1: maskLastFour,
    contactNum2: maskLastFour,
    coApplicantContactNum1: maskLastFour,
    coApplicantContactNum2: maskLastFour,

    // Aadhaar
    aadhar: maskLastFour,
    coApplicantAadhar: maskLastFour,

    // PAN
    pan: maskLastFour,
    coApplicantPan: maskLastFour,

    // Email
    emailId: maskEmail,
    coApplicantEmailId: maskEmail,

    // Address
    applicantAddress: maskValue,
    coApplicantAddress: maskValue,
  };

  const getDisplayValue = (name, value) => {
    if (activeField === name) return value || "";

    const masker = MASK_FIELD_MAP[name];
    return masker ? masker(value || "") : value || "";
  };

  const validateFields = () => {
    let newErrors = {};

    // Tab validation for the formData fields
    if (!formData.associate)
      newErrors.associate = "Select Associate is required";
    if (!formData.builder) newErrors.builder = "Select Builder is required";
    if (!formData.project) newErrors.project = "Select Project is required";
    if (!formData.prospect) newErrors.prospect = "Select Prospect is required";
    if (!formData.unit) newErrors.unit = "Select Unit is required";
    if (!formData.bookingType)
      newErrors.bookingType = "Select Booking Type is required";

    // Tab 1 Validation - All fields mandatory
    if (!formStateTab1.applicantName)
      newErrors.applicantName = "Applicant Name is required";
    if (!formStateTab1.applicantAddress)
      newErrors.applicantAddress = "Applicant Address is required";
    if (!formStateTab1.contactNum1)
      newErrors.contactNum1 = "Contact Number 1 is required";
    if (
      formStateTab1.contactNum1 &&
      !RegexFile.mobileNo.test(formStateTab1.contactNum1)
    ) {
      newErrors.contactNum1 = "Enter Valid Contact Number1";
    }
    if (
      formStateTab1.contactNum2 &&
      !RegexFile.mobileNo.test(formStateTab1.contactNum2)
    ) {
      newErrors.contactNum2 = "Enter Valid Contact Number2";
    }
    if (formStateTab1.emailId && !RegexFile.email.test(formStateTab1.emailId)) {
      newErrors.emailId = "Enter Valid Email ID";
    }
    if (!formStateTab1.dob) newErrors.dob = "Date of Birth is required";
    if (!formStateTab1.aadhar) newErrors.aadhar = "Aadhar Number is required";
    if (!formStateTab1.pan) newErrors.pan = "PAN Number is required";
    if (formStateTab1.pan && !RegexFile.panNo.test(formStateTab1.pan)) {
      newErrors.pan = "Enter Valid PAN Number";
    }
    // Tab 2 Validation
    // if (!formStateTab2.unitStatus)
    //   newErrors.unitStatus = "Unit Status is required";
    if (!formStateTab2.bbavalue && !formStateTab2.paymentPlan) {
      newErrors.paymentPlan = "Payment Plan is required";
    }
    // if (!formStateTab2.raPercent) newErrors.raPercent = "RA% is required";
    // if (!formStateTab2.rcPercent) newErrors.rcPercent = "RC% is required";

    // Tab 3 Validation - All fields mandatory
    if (!formStateTab3.bookingStatus)
      newErrors.bookingStatus = "Booking Status is required";
    // if (!formStateTab3.location) newErrors.location = "Location is required";
    if (!formStateTab3.bookingDate)
      newErrors.bookingDate = "Booking Date is required";
    if (!formStateTab3.propType)
      newErrors.propType = "Property Type is required";
    if (!formStateTab3.saleStatus)
      newErrors.saleStatus = "Sale Status is required";
    if (!formStateTab3.schemeIncentive)
      newErrors.schemeIncentive = "Scheme is required";
    if (!formStateTab3.incentiveId)
      newErrors.incentiveId = "Incentive is required";
    if (!formStateTab3.formStage)
      newErrors.formStage = "Form Stage is required";
    if (!formStateTab3.loanSelfFunding)
      newErrors.loanSelfFunding = "Loan/Self Funding is required";
    if (!formStateTab3.kycStatus)
      newErrors.kycStatus = "KYC Status is required";
    if (!formStateTab3.remarks) newErrors.remarks = "Remarks are required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const incentiveOptions = [
    { value: "BUILDER", label: "Builder" },
    { value: "MTRS", label: "MTRS" },
    { value: "NA", label: "Not Applicable" },
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

  const { isPending: addLoading, mutate } = usePost(
    `${SAVE_SALE_FORM}${userId}`,
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

  const { isPending: updateLoading, mutate: mutateUpdate } = usePut(
    `${UPDATE_SALE_ENTRY}${userId}`,
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
      // Proceed with saving the data
      let params = {
        saleId: rowData?.uniqueId,
        builderName: formData?.builder?.label,
        projectName: formData?.project?.label,
        projectId: formData?.project?.value,
        builderId: formData?.builder?.value,
        associateId: formData?.associate?.value,
        associateName: formData?.associate?.label,
        unitId: formData?.unit?.value,
        projectUnitName: formData?.unit?.label,
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
        bookingStatusId: (formStateTab3?.formStage?.value === 20 || formStateTab3?.formStage?.value === 14) ? 1 : formStateTab3?.bookingStatus?.value,
        locationId: rowData?.locationId || 0,
        bookingDate: formStateTab3?.bookingDate,
        propTypeId: formStateTab3?.propType?.value,
        saleStatusId: (formStateTab3?.formStage?.value === 20 || formStateTab3?.formStage?.value === 14) ? 3 : formStateTab3?.saleStatus?.value,
        schemaIncentiveId: formStateTab3?.schemeIncentive?.value,
        incentiveId: formStateTab3?.incentiveId?.value,
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
        unitStatus: (Object.keys(rowData).length === 0) ? 'sold' : tab2CostingData?.unitStatus,
        paymentPlan: formStateTab2?.paymentPlan?.value || "",
        prospectId: formData?.prospect?.value,
        prospectName: formData?.prospect?.label,
        bookingType: formData?.bookingType?.value,
        revenueId: formData?.revenue?.value || 0,
        connectBookingStatus: formStateTab3?.connectBookingStatus?.value || null,
        connectSuspectName: formStateTab3?.connectBookingStatus?.value === "MTC" ? formStateTab3.connectSuspectName?.label : "" || "",
        connectSuspectId: formStateTab3?.connectBookingStatus?.value === "MTC" ? formStateTab3.connectSuspectName?.value : 0 || 0,
        bookingRange: formStateTab3?.connectBookingStatus?.value === "MTC" ? formStateTab3?.bookingRange?.value : "" || "",
        rewardPoint: formData?.rewardPoints || 0,
        mtPayScheme: rowData?.mtPayScheme || null,
        mtrsScheme: rowData?.mtrsScheme || null,
        builderSchemeRemark: rowData?.builderSchemeRemark || "",
      };
      if (Object.keys(rowData).length === 0) {
        mutate(params); // Call mutate if rowData is empty
      } else {
        mutateUpdate(params); // Call mutateUpdate if rowData has properties
      }
    } else {
      toast.error("Some Mandatory Fields Are Still Not Filled");
    }
  };

  const handleCancel = () => {
    navigation("/sales-entry-new", {
      state: {
        formState_: formState,
        page_: page,
        searchByGroupSelect_: searchByGroupSelect,
        searchTerm_: searchTerm,
        builder: builder,
        project: project,
        formStage: formStage

      },
    });
  };

  const connectBookingStatusGroup = [
    { value: 'MT', label: "MT" },
    { value: 'MTC', label: "MTC" },
  ]

  const planRangeList = [
    { label: '0-50 Lakh', value: '0-50 Lakh' },
    { label: '50 Lakh - 1 Cr.', value: '50 Lakh - 1 Cr.' },
    { label: '1 Cr. - 1.5 Cr.', value: '1 Cr. - 1.5 Cr.' },
    { label: '1.5 Cr. - 2 Cr.', value: '1.5 Cr. - 2 Cr.' },
    { label: 'Greator than 2 Cr.', value: 'Greator than 2 Cr.' }
  ]

  // UPDATE SALE

  useEffect(() => {
    if (Object.keys(rowData).length > 0) {
      setFormStateTab1((prevState) => ({
        ...prevState,
        applicantName: rowData?.clientName,
        applicantAddress: rowData?.clientAddress,
        contactNum1: rowData?.clientPhone,
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
      setFormData((prevState) => ({
        ...prevState,
        rewardPoints: rowData?.rewardPoint || 0,
      }));

      setFormStateTab2((prevState) => ({
        ...prevState,
        raPercent: rowData.ra_percent,
        rcPercent: rowData.rc_percent,
      }));

      setFormStateTab3((prevState) => ({
        ...prevState,
        bookingStatus:
          bookingStatusOptions.find(
            (role) => role.value == rowData.bookingStatusId
          ) || null,
        location: rowData?.locationName || null,
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
        incentiveId:
          incentiveOptions.find((role) => role.value == rowData.incentiveId) ||
          null,
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
        connectBookingStatus:
          connectBookingStatusGroup.find(
            (role) => role.value == rowData.connectBookingStatus
          ) || null,
        bookingRange:
          planRangeList.find(
            (role) => role.value == rowData.bookingRange
          ) || null,
        remarks: rowData?.remarks,
      }));
    }
  }, [rowData]);

  // useEffect(() => {
  //   if (rowData?.connectSuspectId) {
  //     const connectSuspectName = Array.isArray(connectList?.data?.data) && connectList?.data?.data?.find(
  //       (item) => item.value === rowData.connectSuspectId
  //     );
  //     if (connectSuspectName) {
  //       setFormStateTab3((prevState) => ({ ...prevState, connectSuspectName }));
  //     }
  //   }
  // }, [connectList?.data?.data, rowData?.connectSuspectName]);

  useEffect(() => {
    if (Object.keys(rowData).length === 0) {
      const prosData = prospectData;
      setFormStateTab1((prevState) => ({
        ...prevState,
        applicantName: prosData?.clientName,
        applicantAddress: prosData?.clientAddress,
        contactNum1: prosData?.phoneNo,
      }));
    }
    else {
      const prosData = prospectData;
      setFormStateTab1((prevState) => ({
        ...prevState,
        contactNum1: prosData?.phoneNo,
      }));
    }
  }, [prospectData, rowData]);

  useEffect(() => {
    if (rowData?.associateId) {
      const associate = Array.isArray(associateList?.data?.data)
        ? associateList?.data?.data?.find(
          (item) => item.value === rowData.associateId
        )
        : [];
      if (associate) {
        setFormData((prevState) => ({ ...prevState, associate }));
      }
    }
  }, [associateList?.data?.data, rowData?.associateId]);

  useEffect(() => {
    // Check if rowData.bookingType has a value, if not, set 'Resale'
    const bookingTypeValue = rowData?.bookingType || "Resale";

    // Try to find the bookingType in bookingTypeGrp array
    const bookingType = bookingTypeGrp?.find(
      (item) => item.value === bookingTypeValue
    );

    if (bookingType) {
      setFormData((prevState) => ({ ...prevState, bookingType }));
    } else {
      // Set bookingType to 'Resale' if not found or if rowData.bookingType is empty
      setFormData((prevState) => ({ ...prevState, bookingType: "Resale" }));
    }
  }, [bookingTypeGrp, rowData?.bookingType]);

  useEffect(() => {
    if (rowData?.paymentPlan) {
      const paymentPlan = Array.isArray(paymentPlanList?.data?.data)
        ? paymentPlanList?.data?.data?.find(
          (item) => item.value == rowData.paymentPlan
        )
        : [];
      if (paymentPlan) {
        setFormStateTab2((prevState) => ({ ...prevState, paymentPlan }));
      }
    }
  }, [paymentPlanList?.data?.data, rowData?.paymentPlan]);

  useEffect(() => {

    // If a valid unitId is found, look for the unit in the data
    if (rowData?.unitId) {
      const unit = unitData?.find((item) => item.value === rowData?.unitId);

      // If a unit is found, update the formData state
      if (unit) {
        setFormData((prevState) => ({ ...prevState, unit }));
      }
    }
  }, [rowData?.unitId, unitData]);

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
  }, [builderList?.data?.data, rowData?.builderName]);

  useEffect(() => {
    if (rowData?.prospectId) {
      const prospect = Array.isArray(prosOptions)
        ? prosOptions?.find(
          (item) => item.value === rowData.prospectId
        )
        : [];
      if (prospect) {
        setFormData((prevState) => ({ ...prevState, prospect }));
      }
    }
  }, [prospectList?.data?.data, rowData?.prospectId, prosOptions]);

  const days = prospectData?.createdDate
    ? getDaysAgo(prospectData?.createdDate)
    : null;

  return (
    <PageContent>
      <Container fluid={true}>
        <Breadcrumbs title="Transaction" breadcrumbItem="Sale Entry New" />
        {(addLoading || updateLoading || addLoadingUnit || isLoading || loadingUserList || loadingProsList) && <ScreenLoader />}
        {rowData?.uniqueId && (
          <h5 style={{ marginBottom: 5, fontSize: 12 }}>
            Unique ID : {rowData?.uniqueId}
          </h5>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            color="secondary"
            type="button"
            style={{
              backgroundColor: defaultTheme.primary,
              marginBottom: "10px",
            }}
            onClick={handleCancel}
          >
            ← Back
          </Button>
        </div>

        <Card>
          <CardBody>
            <Form>
              <Row className="g-3">
                <Col lg="3">
                  <h6 className="font-size-11" htmlFor="selectedBuilder">
                    Select Associate <RequiredStar />
                  </h6>
                  <Select
                    id="selectedAssociate"
                    value={formData.associate}
                    isClearable
                    onChange={(option) =>
                      handleChangeSelect(option, "associate")}
                    options={
                      Array.isArray(associateList?.data?.data)
                        ? associateList?.data?.data
                        : []
                    }
                    className={`${errors.associate ? "is-invalid" : ""}`}
                  />
                  {errors.associate && (
                    <div className="invalid-feedback">
                      {errors.associate}
                    </div>
                  )}
                </Col>
                <Col lg="3">
                  <h6 className="font-size-10">Branch Location</h6>
                  <input
                    placeholder="Branch Location"
                    value={rowData?.locationName || ""}
                    className="form-control"
                    style={inputStyle}
                    disabled
                  />
                </Col>

                <Col lg="3">
                  <h6 className="font-size-11" htmlFor="selectedBuilder">
                    Select Builder <RequiredStar />
                  </h6>
                  <Select
                    id="selectedBuilder"
                    isClearable
                    value={formData.builder}
                    onChange={(option) =>
                      handleChangeSelect(option, "builder")}
                    options={
                      Array.isArray(builderList?.data?.data)
                        ? builderList?.data?.data
                        : []
                    }
                    className={`${errors.builder ? "is-invalid" : ""}`}
                  />
                  {errors.builder && (
                    <div className="invalid-feedback">{errors.builder}</div>
                  )}
                </Col>

                <Col lg="3">
                  <h6 className="font-size-11" htmlFor="selectedProject">
                    Select Project <RequiredStar />
                  </h6>
                  <Select
                    isDisabled={!formData.builder}
                    isClearable
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
                    <div className="invalid-feedback">{errors.project}</div>
                  )}
                </Col>

                <Col lg="3">
                  <h6 className="font-size-10" htmlFor="unit">
                    Select Unit <RequiredStar />
                  </h6>
                  <Select
                    isDisabled={!formData.project}
                    id="selectedUnit"
                    isClearable
                    value={formData.unit}
                    onChange={(option) =>
                      handleChangeSelect(option, "unit")
                    }
                    options={Array.isArray(unitData) ? unitData : []}
                    className={`${errors.unit ? "is-invalid" : ""}`}
                  />
                  {errors.unit && (
                    <div className="invalid-feedback">{errors.unit}</div>
                  )}
                </Col>

                <Col lg="3">
                  <h6 className="font-size-10" htmlFor="selectedProspect">
                    Select Prospect <RequiredStar />
                  </h6>
                  <Select
                    isClearable
                    isDisabled={!formData.associate}
                    id="selectedProspect"
                    value={formData.prospect}
                    onChange={(option) =>
                      handleChangeSelect(option, "prospect")
                    }
                    options={
                      Array.isArray(prosOptions)
                        ? prosOptions
                        : []
                    }
                    className={`${errors.prospect ? "is-invalid" : ""}`}
                  />
                  {errors.prospect && (
                    <div className="invalid-feedback">
                      {errors.prospect}
                    </div>
                  )}
                </Col>
                <Col lg="3">
                  <h6 className="font-size-10">Prospect ID</h6>
                  <input
                    placeholder="Prospect ID"
                    value={prospectData?.prospectId || ""}
                    className="form-control"
                    style={inputStyle}
                    disabled
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-10">
                    Prospect Created Date{" "}
                    {days !== null && (
                      <span className={days < 15 ? "text-danger" : "text-success"}>
                        (<strong>{days}</strong>)
                      </span>
                    )}
                    {prospectData?.transferred === 1 && (
                      <span className="text-success">
                        {" "}
                        - <strong>Transferred</strong>
                      </span>
                    )}
                  </h6>
                  <input
                    placeholder="Prospect Created Date"
                    value={formatDate(prospectData?.createdDate) || ""}
                    className="form-control"
                    style={inputStyle}
                    disabled
                  />
                </Col>

                <Col lg="3">
                  <h6 className="font-size-10" htmlFor="selectedBookingType">Booking Type <RequiredStar /></h6>
                  <Select
                    isClearable
                    id="selectedBookingType"
                    value={formData.bookingType}
                    onChange={(option) => handleChangeSelect(option, "bookingType")}
                    options={bookingTypeGrp}
                    className={`${errors.bookingType ? "is-invalid" : ""}`}
                  />
                  {errors.bookingType && (
                    <div className="invalid-feedback">
                      {errors.bookingType}
                    </div>
                  )}
                </Col>
                <Col lg="3">
                  <h6 className="font-size-10">Reward Points</h6>
                  <input
                    placeholder="Reward Points"
                    value={formData.rewardPoints}
                    className="form-control"
                    type="text"
                    onChange={(option) => setFormData((prev) => ({ ...prev, rewardPoints: option.target.value }))}
                  />
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
                    <Row className="g-3">
                      <Col lg="3">
                        <h6
                          className="font-size-10"
                          htmlFor="applicantName"
                        >
                          Applicant Name{" "}
                          <RequiredStar />
                        </h6>
                        <input
                          type="text"
                          name="applicantName"
                          value={formStateTab1.applicantName}
                          onChange={handleChangeTab1}
                          placeholder="Enter Applicant Name"
                          className={`form-control ${errors.applicantName ? "is-invalid" : ""}`}
                        />
                        {errors.applicantName && (
                          <div className="invalid-feedback">
                            {errors.applicantName}
                          </div>
                        )}
                      </Col>

                      <Col lg="3">
                        <h6 className="font-size-10" htmlFor="contactNum1">
                          Contact Number 1{" "}
                          <RequiredStar />
                        </h6>
                        <input
                          type="text"
                          name="contactNum1"
                          value={getDisplayValue("contactNum1", formStateTab1.contactNum1)}
                          onFocus={(e) => setActiveField(e.target.name)}
                          onBlur={() => setActiveField("")}
                          onChange={handleChangeTab1}
                          placeholder="Enter Contact Number 1"
                          className={`form-control ${errors.contactNum1 ? "is-invalid" : ""}`}
                        />
                        {errors.contactNum1 && (
                          <div className="invalid-feedback">
                            {errors.contactNum1}
                          </div>
                        )}
                      </Col>

                      {/* Second Column (3 inputs) */}
                      <Col lg="3">
                        <h6 className="font-size-10" htmlFor="contactNum2">
                          Contact Number 2{" "}
                        </h6>
                        <input
                          type="text"
                          name="contactNum2"
                          value={getDisplayValue("contactNum2", formStateTab1.contactNum2)}
                          onFocus={(e) => setActiveField(e.target.name)}
                          onBlur={() => setActiveField("")}
                          onChange={handleChangeTab1}
                          placeholder="Enter Contact Number 2"
                          className={`form-control ${errors.contactNum2 ? "is-invalid" : ""}`}
                        />
                        {errors.contactNum2 && (
                          <div className="invalid-feedback">
                            {errors.contactNum2}
                          </div>
                        )}
                      </Col>
                      <Col lg="3">
                        <h6 className="font-size-10" htmlFor="emailId">
                          Email ID
                        </h6>
                        <input
                          type="email"
                          name="emailId"
                          value={getDisplayValue("emailId", formStateTab1.emailId)}
                          onFocus={(e) => setActiveField(e.target.name)}
                          onBlur={() => setActiveField("")}
                          onChange={handleChangeTab1}
                          placeholder="Enter Email ID"
                          className={`form-control ${errors.emailId ? "is-invalid" : ""}`}
                        />
                        {errors.emailId && (
                          <div className="invalid-feedback">
                            {errors.emailId}
                          </div>
                        )}
                      </Col>
                      <Col lg="3">
                        <h6 className="font-size-10" htmlFor="dob">
                          Date of Birth{" "}
                          <RequiredStar />
                        </h6>
                        <input
                          type="date"
                          name="dob"
                          value={formStateTab1.dob}
                          onChange={handleChangeTab1}
                          className={`form-control ${errors.dob ? "is-invalid" : ""}`}
                        />
                        {errors.dob && (
                          <div className="invalid-feedback">
                            {errors.dob}
                          </div>
                        )}
                      </Col>

                      {/* Third Column (3 inputs) */}
                      <Col lg="3">
                        <h6 className="font-size-10" htmlFor="aadhar">
                          Aadhar Number{" "}
                          <RequiredStar />
                        </h6>
                        <input
                          type="text"
                          name="aadhar"
                          value={getDisplayValue("aadhar", formStateTab1.aadhar)}
                          onFocus={(e) => setActiveField(e.target.name)}
                          onBlur={() => setActiveField("")}
                          onChange={handleChangeTab1}
                          maxLength={12}
                          placeholder="Enter Aadhar Number"
                          className={`form-control ${errors.aadhar ? "is-invalid" : ""}`}
                        />
                        {errors.aadhar && (
                          <div className="invalid-feedback">
                            {errors.aadhar}
                          </div>
                        )}
                      </Col>
                      <Col lg="3">
                        <h6 className="font-size-10" htmlFor="pan">
                          PAN Number <RequiredStar />
                        </h6>
                        <input
                          type="text"
                          name="pan"
                          maxLength={10}
                          value={getDisplayValue("pan", formStateTab1.pan)}
                          onFocus={(e) => setActiveField(e.target.name)}
                          onBlur={() => setActiveField("")}
                          onChange={handleChangeTab1}
                          placeholder="Enter PAN Number"
                          className={`form-control ${errors.pan ? "is-invalid" : ""}`}
                        />
                        {errors.pan && (
                          <div className="invalid-feedback">
                            {errors.pan}
                          </div>
                        )}
                      </Col>
                      <Col lg="3">
                        <h6
                          className="font-size-10"
                          htmlFor="applicantAddress"
                        >
                          Applicant Address{" "}
                          <RequiredStar />
                        </h6>
                        <input
                          type="text"
                          name="applicantAddress"
                          value={getDisplayValue("applicantAddress", formStateTab1.applicantAddress)}
                          onFocus={(e) => setActiveField(e.target.name)}
                          onBlur={() => setActiveField("")}
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

                      <Col lg="3">
                        <h6
                          className="font-size-10"
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
                          className={`form-control ${errors.coApplicantName ? "is-invalid" : ""}`}
                        />
                        {errors.coApplicantName && (
                          <div className="invalid-feedback">
                            {errors.coApplicantName}
                          </div>
                        )}
                      </Col>
                      {/* Fifth Column (3 inputs - Co-applicant) */}
                      <Col lg="3">
                        <h6
                          className="font-size-10"
                          htmlFor="coApplicantContactNum1"
                        >
                          Co-Applicant Contact Number 1{" "}
                        </h6>
                        <input
                          type="text"
                          name="coApplicantContactNum1"
                          value={getDisplayValue(
                            "coApplicantContactNum1",
                            formStateTab1.coApplicantContactNum1
                          )}
                          onFocus={(e) => setActiveField(e.target.name)}
                          onBlur={() => setActiveField("")}
                          onChange={handleChangeTab1}
                          placeholder="Co-Applicant Contact 1"
                          className={`form-control ${errors.coApplicantContactNum1 ? "is-invalid" : ""
                            }`}
                        />
                        {errors.coApplicantContactNum1 && (
                          <div className="invalid-feedback">
                            {errors.coApplicantContactNum1}
                          </div>
                        )}
                      </Col>
                      <Col lg="3">
                        <h6
                          className="font-size-10"
                          htmlFor="coApplicantContactNum2"
                        >
                          Co-Applicant Contact Number 2{" "}
                        </h6>
                        <input
                          type="text"
                          name="coApplicantContactNum2"
                          value={getDisplayValue(
                            "coApplicantContactNum2",
                            formStateTab1.coApplicantContactNum2
                          )}
                          onFocus={(e) => setActiveField(e.target.name)}
                          onBlur={() => setActiveField("")}
                          onChange={handleChangeTab1}
                          placeholder="Co-Applicant Contact 2"
                          className={`form-control ${errors.coApplicantContactNum2 ? "is-invalid" : ""
                            }`}
                        />
                        {errors.coApplicantContactNum2 && (
                          <div className="invalid-feedback">
                            {errors.coApplicantContactNum2}
                          </div>
                        )}
                      </Col>
                      <Col lg="3">
                        <h6
                          className="font-size-10"
                          htmlFor="coApplicantEmailId"
                        >
                          Co-Applicant Email ID{" "}
                        </h6>
                        <input
                          type="email"
                          name="coApplicantEmailId"
                          value={getDisplayValue(
                            "coApplicantEmailId",
                            formStateTab1.coApplicantEmailId
                          )}
                          onFocus={(e) => setActiveField(e.target.name)}
                          onBlur={() => setActiveField("")}
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

                      <Col lg="3">
                        <h6
                          className="font-size-10"
                          htmlFor="coApplicantDob"
                        >
                          Co-Applicant DOB{" "}
                        </h6>
                        <input
                          type="date"
                          name="coApplicantDob"
                          value={formStateTab1.coApplicantDob}
                          onChange={handleChangeTab1}
                          className={`form-control ${errors.coApplicantDob ? "is-invalid" : ""}`}
                        />
                        {errors.coApplicantDob && (
                          <div className="invalid-feedback">
                            {errors.coApplicantDob}
                          </div>
                        )}
                      </Col>

                      <Col lg="3">
                        <h6
                          className="font-size-10"
                          htmlFor="coApplicantAadhar"
                        >
                          Co-Applicant Aadhar Number{" "}
                        </h6>
                        <input
                          type="text"
                          name="coApplicantAadhar"
                          value={getDisplayValue(
                            "coApplicantAadhar",
                            formStateTab1.coApplicantAadhar
                          )}
                          onFocus={(e) => setActiveField(e.target.name)}
                          onBlur={() => setActiveField("")}
                          onChange={handleChangeTab1}
                          placeholder="Enter Co-Applicant Aadhar"
                          className={`form-control ${errors.coApplicantAadhar ? "is-invalid" : ""
                            }`}
                        />
                        {errors.coApplicantAadhar && (
                          <div className="invalid-feedback">
                            {errors.coApplicantAadhar}
                          </div>
                        )}
                      </Col>
                      <Col lg="3">
                        <h6
                          className="font-size-10"
                          htmlFor="coApplicantPan"
                        >
                          Co-Applicant PAN Number{" "}
                        </h6>
                        <input
                          type="text"
                          maxLength={10}
                          name="coApplicantPan"
                          value={getDisplayValue(
                            "coApplicantPan",
                            formStateTab1.coApplicantPan
                          )}
                          onFocus={(e) => setActiveField(e.target.name)}
                          onBlur={() => setActiveField("")}
                          onChange={handleChangeTab1}
                          placeholder="Enter Co-Applicant PAN"
                          className={`form-control ${errors.coApplicantPan ? "is-invalid" : ""
                            }`}
                        />
                        {errors.coApplicantPan && (
                          <div className="invalid-feedback">
                            {errors.coApplicantPan}
                          </div>
                        )}
                      </Col>
                      <Col lg="3">
                        <h6
                          className="font-size-10"
                          htmlFor="coApplicantAddress"
                        >
                          Co-Applicant Address{" "}
                        </h6>
                        <input
                          type="text"
                          name="coApplicantAddress"
                          value={getDisplayValue(
                            "coApplicantAddress",
                            formStateTab1.coApplicantAddress
                          )}
                          onFocus={(e) => setActiveField(e.target.name)}
                          onBlur={() => setActiveField("")}
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
                    </Row>
                  </Form>
                </TabPane>

                <TabPane tabId={2}>
                  <Form>
                    <Row className="g-3 mb-3">
                      <Col lg="3">
                        <h6 className="font-size-10">Unit No</h6>
                        <input
                          type="text"
                          name="unitNo"
                          placeholder="Unit No"
                          value={tab2CostingData?.unitNo}
                          className="form-control"
                          style={inputStyle}
                          disabled
                        />
                      </Col>

                      <Col lg="3">
                        <h6 className="font-size-10">Tower/Block</h6>
                        <input
                          type="text"
                          name="towerBlock"
                          placeholder="Tower/Block"
                          value={tab2CostingData?.towerBlock}
                          className="form-control"
                          style={inputStyle}
                          disabled
                        />
                      </Col>

                      <Col lg="3">
                        <h6 className="font-size-10">Floor</h6>
                        <input
                          type="text"
                          name="floor"
                          placeholder="Floor"
                          value={tab2CostingData?.floor}
                          className="form-control"
                          style={inputStyle}
                          disabled
                        />
                      </Col>

                      <Col lg="3">
                        <h6 className="font-size-10">Area</h6>
                        <input
                          type="text"
                          name="area"
                          placeholder="Area"
                          value={tab2CostingData?.area}
                          className="form-control"
                          style={inputStyle}
                          disabled
                        />
                      </Col>
                      {rowData?.bbavalue &&
                        <Col lg="3">
                          <h6 className="font-size-10">BBA Value</h6>
                          <input
                            type="text"
                            name="area"
                            placeholder="Area"
                            value={rowData?.bbavalue}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>
                      }
                    </Row>
                    {!rowData?.bbavalue &&
                      <Row className="g-3">
                        <Col lg="3">
                          <h6 className="font-size-10">BSP</h6>
                          <input
                            type="text"
                            name="bsp"
                            placeholder="BSP"
                            value={tab2CostingData?.bsp}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Inaugural Discount</h6>
                          <input
                            type="text"
                            name="inauguralDiscount"
                            placeholder="Inaugural Discount"
                            value={tab2CostingData?.inauguralDiscount}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">NPV</h6>
                          <input
                            type="text"
                            name="npv"
                            placeholder="NPV"
                            value={tab2CostingData?.npv}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>
                        <Col lg="3">
                          <h6 className="font-size-10">Other Discount</h6>

                          <input
                            type="text"
                            name="otherDiscount"
                            placeholder="Other Discount"
                            value={tab2CostingData?.othDicountBuilder}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Net BSP</h6>
                          <input
                            type="text"
                            name="netBsp"
                            placeholder="Net BSP"
                            value={roundToTwoDecimals(tab2CostingData?.netBsp)}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Net BSP Area</h6>
                          <input
                            type="text"
                            name="netBspArea"
                            placeholder="Net BSP Area"
                            value={roundToTwoDecimals(tab2CostingData?.netBspArea)}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">GST %</h6>
                          <input
                            type="text"
                            name="gstPercent"
                            placeholder="GST %"
                            value={tab2CostingData?.gstPercent}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">GST Amount</h6>
                          <input
                            type="text"
                            name="gstAmount"
                            placeholder="GST Amount"
                            value={roundToTwoDecimals(tab2CostingData?.gstAmount)}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Net Unit Cost</h6>
                          <input
                            type="text"
                            name="netUnitCost"
                            placeholder="Net Unit Cost"
                            value={roundToTwoDecimals(tab2CostingData?.netCost)}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Floor PLC</h6>
                          <input
                            type="text"
                            name="floorPlc"
                            placeholder="Floor PLC"
                            value={tab2CostingData?.floorPlc}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Facing PLC</h6>
                          <input
                            type="text"
                            name="facingPlc"
                            placeholder="Facing PLC"
                            value={tab2CostingData?.facingPlc}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Other View PLC</h6>
                          <input
                            type="text"
                            name="otherViewPlc"
                            placeholder="Other View PLC"
                            value={tab2CostingData?.otherViewPlc}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Parking</h6>
                          <input
                            type="text"
                            name="parking"
                            placeholder="Parking"
                            value={tab2CostingData?.carParking}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Club Membership</h6>
                          <input
                            type="text"
                            name="clubMembership"
                            placeholder="Club Membership"
                            value={tab2CostingData?.clubMembership}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Power Backup</h6>
                          <input
                            type="text"
                            name="powerBackup"
                            placeholder="Power Backup"
                            value={tab2CostingData?.powerBackupCharges}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">IFMS</h6>
                          <input
                            type="text"
                            name="ifms"
                            placeholder="IFMS"
                            value={tab2CostingData?.ifmsAfterDiscount}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Lease Rent</h6>
                          <input
                            type="text"
                            name="leaseRent"
                            placeholder="Lease Rent"
                            value={tab2CostingData?.leaseRentAfterDiscount}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">ESSC</h6>
                          <input
                            type="text"
                            name="essc"
                            placeholder="ESSC"
                            value={tab2CostingData?.esscPer}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">CRF</h6>
                          <input
                            type="text"
                            name="crf"
                            placeholder="CRF"
                            value={tab2CostingData?.crfPer}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">EDC/IDC</h6>
                          <input
                            type="text"
                            name="edcIdc"
                            placeholder="EDC/IDC"
                            value={tab2CostingData?.edcIdc}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">EEC/FFC</h6>
                          <input
                            type="text"
                            name="eecFfc"
                            placeholder="EEC/FFC"
                            value={tab2CostingData?.eecFfc}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Terrace/Garden</h6>
                          <input
                            type="text"
                            name="terraceGarden"
                            placeholder="Terrace/Garden"
                            value={tab2CostingData?.terrageGarden}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Development</h6>
                          <input
                            type="text"
                            name="development"
                            placeholder="Development"
                            value={tab2CostingData?.development}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Facilities</h6>
                          <input
                            type="text"
                            name="facilities"
                            placeholder="Facilities"
                            value={tab2CostingData?.facilities}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Maintenance</h6>
                          <input
                            type="text"
                            name="maintenance"
                            placeholder="Maintenance"
                            value={tab2CostingData?.maintenance}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Meter</h6>
                          <input
                            type="text"
                            name="meter"
                            placeholder="Meter"
                            value={tab2CostingData?.meter}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Other Charges</h6>
                          <input
                            type="text"
                            name="otherCharges"
                            placeholder="Other Charges"
                            value={tab2CostingData?.otherCharges}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>
                        <Col lg="3">
                          <h6 className="font-size-10">Possession Charges</h6>
                          <input
                            type="text"
                            name="possessionCharges"
                            placeholder="Possession Charges"
                            value={tab2CostingData?.possessionCharges}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">
                            Total Other Charges
                          </h6>
                          <input
                            type="text"
                            name="totalOtherCharges"
                            placeholder="Total Other Charges"
                            value={tab2CostingData?.totalOtherCharge}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">
                            Other Charges GST %"
                          </h6>
                          <input
                            type="text"
                            name="otherChargeGstRate"
                            placeholder="Other Charges GST %"
                            value={tab2CostingData?.otherChargeGstRate}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">
                            Other Charges GST Amount
                          </h6>
                          <input
                            type="text"
                            name="otherChargeGstAmt"
                            placeholder="Other Charges GST Amount"
                            value={tab2CostingData?.otherChargeGstAmt}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        {/* <Col lg="3">
                          <h6 className="font-size-10">Total with GST</h6>
                          <input
                            type="text"
                            name="totalWithGst"
                            placeholder="Total with GST"
                            value={tab2CostingData?.totalOtherchargeWithGst}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Total GST Amount</h6>
                          <input
                            type="text"
                            name="totalGstAmt"
                            placeholder="Total GST Amount"
                            value={roundToTwoDecimals(tab2CostingData?.totalGstAmount)}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Total Unit Cost</h6>
                          <input
                            type="text"
                            name="totalUnitCost"
                            placeholder="Total Unit Cost"
                            value={roundToTwoDecimals(tab2CostingData?.netCostWithGst)}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col> */}

                        <Col lg="3">
                          <h6 className="font-size-10">Total Unit Cost (Without GST)(OC)</h6>
                          <input
                            type="text"
                            name="totalUnitCost"
                            placeholder="Total Unit Cost"
                            value={roundToTwoDecimals(tab2CostingData?.netBspArea + tab2CostingData?.totalOtherCharge)}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Total Unit Cost (Without GST)+PC+OC</h6>
                          <input
                            type="text"
                            name="totalUnitCost"
                            placeholder="Total Unit Cost"
                            value={roundToTwoDecimals(tab2CostingData?.netBspArea + tab2CostingData?.totalOtherCharge + tab2CostingData?.possessionCharges)}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">Total GST Amount</h6>
                          <input
                            type="text"
                            name="totalUnitCost"
                            placeholder="Total Unit Cost"
                            value={roundToTwoDecimals(tab2CostingData?.totalGstAmount)}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>
                        <Col lg="3">
                          <h6 className="font-size-10">Total Unit Cost (With GST)</h6>
                          <input
                            type="text"
                            name="totalUnitCost"
                            placeholder="Total Unit Cost"
                            value={roundToTwoDecimals(tab2CostingData?.netCostWithGst)}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col>

                        {/* <Col lg="3">
                          <h6 className="font-size-10">Total Cost Without GST</h6>
                          <input
                            type="text"
                            placeholder="Total Cost Without GST"
                            value={roundToTwoDecimals((parseFloat(tab2CostingData?.netBspArea) + parseFloat(tab2CostingData?.totalOtherCharge))) || 0}
                            className="form-control"
                            style={inputStyle}
                            disabled
                          />
                        </Col> */}

                        <Col lg="3">
                          <h6 className="font-size-10">
                            Payment Plan{" "}
                            <RequiredStar />
                          </h6>
                          <Select
                            isClearable
                            options={
                              Array.isArray(paymentPlanList?.data?.data)
                                ? paymentPlanList?.data?.data
                                : []
                            }
                            menuPlacement="auto"
                            value={formStateTab2?.paymentPlan}
                            onChange={handlePaymentPlanChange}
                            className={`${errors.paymentPlan ? "is-invalid" : ""}`}
                          />
                          {errors.paymentPlan && (
                            <div className="invalid-feedback">
                              {errors.paymentPlan}
                            </div>
                          )}
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">
                            Assured Business % <RequiredStar />
                          </h6>
                          <input
                            type="text"
                            name="raPercent"
                            placeholder="Enter  Assured Business %"
                            value={formStateTab2?.raPercent}
                            onChange={handleChangeTab2}
                            className={`form-control ${errors.raPercent ? "is-invalid" : ""}`}
                          />
                          {errors.raPercent && (
                            <div className="invalid-feedback">
                              {errors.raPercent}
                            </div>
                          )}
                        </Col>

                        <Col lg="3">
                          <h6 className="font-size-10">
                            Verified Business % <RequiredStar />
                          </h6>
                          <input
                            type="text"
                            name="rcPercent"
                            placeholder="Enter Verified Business %"
                            value={formStateTab2?.rcPercent}
                            onChange={handleChangeTab2}
                            className={`form-control ${errors.rcPercent ? "is-invalid" : ""}`}
                          />
                          {errors.rcPercent && (
                            <div className="invalid-feedback">
                              {errors.rcPercent}
                            </div>
                          )}
                        </Col>
                      </Row>
                    }

                  </Form>
                </TabPane>

                <TabPane tabId={3}>
                  <Form>
                    <Row className="g-3">
                      <Col lg={3}>
                        <h6
                          className="font-size-11"
                          htmlFor="bookingStatus"
                        >
                          Booking Status{" "}
                          <RequiredStar />
                        </h6>
                        <Select
                          isClearable
                          isDisabled
                          id="bookingStatus"
                          value={formStateTab3.bookingStatus}
                          onChange={(option) =>
                            handleChangeSelectTab3(option, "bookingStatus")
                          }
                          options={bookingStatusOptions}
                          className={`${errors.bookingStatus ? "is-invalid" : ""}`}
                        />
                        {errors.bookingStatus && (
                          <div className="invalid-feedback">
                            {errors.bookingStatus}
                          </div>
                        )}
                      </Col>
                      <Col lg={3}>
                        <h6 className="font-size-11" htmlFor="tempCreatedDate">Temp Entry Date</h6>
                        <input
                          type="text"
                          name="createdDate"
                          value={formatDateTime(rowData?.tempCreatedDate)}
                          style={inputStyle}
                          disabled
                          placeholder="Temp Entry Date"
                          className={`form-control ${errors.bookingDate ? "is-invalid" : ""}`}
                        />
                      </Col>
                      <Col lg={3}>
                        <h6 className="font-size-11" htmlFor="bookingDate">Booking Date<RequiredStar /></h6>
                        <input
                          type="date"
                          name="bookingDate"
                          value={formStateTab3.bookingDate}
                          onChange={handleChangeTab3}
                          placeholder="Booking Date"
                          className={`form-control ${errors.bookingDate ? "is-invalid" : ""}`}
                        />
                        {errors.bookingDate && (
                          <div className="invalid-feedback">
                            {errors.bookingDate}
                          </div>
                        )}
                      </Col>

                      <Col lg={3}>
                        <h6 className="font-size-11" htmlFor="propType">
                          Property Type{" "}
                          <RequiredStar />
                        </h6>
                        <Select
                          id="propType"
                          isClearable
                          value={formStateTab3.propType}
                          onChange={(option) =>
                            handleChangeSelectTab3(option, "propType")
                          }
                          options={propTypeOptions}
                          className={`${errors.propType ? "is-invalid" : ""}`}
                        />
                        {errors.propType && (
                          <div className="invalid-feedback">
                            {errors.propType}
                          </div>
                        )}
                      </Col>

                      <Col lg={3}>
                        <h6 className="font-size-10" htmlFor="saleStatus">Sale Status{" "}<RequiredStar />
                        </h6>
                        <Select
                          id="saleStatus"
                          isClearable
                          isDisabled
                          value={formStateTab3.saleStatus}
                          onChange={(option) =>
                            handleChangeSelectTab3(option, "saleStatus")
                          }
                          options={saleStatusOptions}
                          className={`${errors.saleStatus ? "is-invalid" : ""}`}
                        />
                        {errors.saleStatus && (
                          <div className="invalid-feedback">
                            {errors.saleStatus}
                          </div>
                        )}
                      </Col>

                      <Col lg={3}>
                        <h6
                          className="font-size-10"
                          htmlFor="schemeIncentive"
                        >
                          Scheme <RequiredStar />
                        </h6>
                        <Select
                          id="schemeIncentive"
                          isClearable
                          value={formStateTab3.schemeIncentive}
                          onChange={(option) =>
                            handleChangeSelectTab3(
                              option,
                              "schemeIncentive"
                            )
                          }
                          options={schemeIncentiveOptions}
                          className={`${errors.schemeIncentive ? "is-invalid" : ""}`}
                        />
                        {errors.schemeIncentive && (
                          <div className="invalid-feedback">
                            {errors.schemeIncentive}
                          </div>
                        )}
                      </Col>

                      <Col lg={3}>
                        <h6
                          className="font-size-10"
                          htmlFor="schemeIncentive"
                        >
                          Incentive <RequiredStar />
                        </h6>
                        <Select
                          id="incentiveId"
                          isClearable
                          value={formStateTab3.incentiveId}
                          onChange={(option) =>
                            handleChangeSelectTab3(option, "incentiveId")
                          }
                          options={incentiveOptions}
                          className={`${errors.incentiveId ? "is-invalid" : ""}`}
                        />
                        {errors.incentiveId && (
                          <div className="invalid-feedback">
                            {errors.incentiveId}
                          </div>
                        )}
                      </Col>

                      <Col lg={3}>
                        <h6 className="font-size-10" htmlFor="formStage">
                          Form Stage <RequiredStar />
                        </h6>
                        <Select
                          id="formStage"
                          isClearable
                          value={formStateTab3.formStage}
                          onChange={(option) =>
                            handleChangeSelectTab3(option, "formStage")
                          }
                          options={formStageOptions}
                          className={`${errors.formStage ? "is-invalid" : ""}`}
                        />
                        {errors.formStage && (
                          <div className="invalid-feedback">
                            {errors.formStage}
                          </div>
                        )}
                      </Col>

                      <Col lg={3}>
                        <h6
                          className="font-size-10"
                          htmlFor="loanSelfFunding"
                        >
                          Loan/Self Funding{" "}
                          <RequiredStar />
                        </h6>
                        <Select
                          id="loanSelfFunding"
                          isClearable
                          value={formStateTab3.loanSelfFunding}
                          onChange={(option) =>
                            handleChangeSelectTab3(
                              option,
                              "loanSelfFunding"
                            )
                          }
                          options={loanSelfFundingOptions}
                          className={`${errors.loanSelfFunding ? "is-invalid" : ""}`}
                        />
                        {errors.loanSelfFunding && (
                          <div className="invalid-feedback">
                            {errors.loanSelfFunding}
                          </div>
                        )}
                      </Col>

                      <Col lg={3}>
                        <h6 className="font-size-10" htmlFor="kycStatus">
                          KYC Status <RequiredStar />
                        </h6>
                        <Select
                          id="kycStatus"
                          isClearable
                          value={formStateTab3.kycStatus}
                          onChange={(option) => handleChangeSelectTab3(option, "kycStatus")}
                          options={kycStatusOptions}
                          className={`${errors.kycStatus ? "is-invalid" : ""}`}
                        />
                        {errors.kycStatus && (
                          <div className="invalid-feedback">
                            {errors.kycStatus}
                          </div>
                        )}
                      </Col>

                      <Col lg={3}>
                        <h6
                          className="font-size-10"
                          htmlFor="kycCompletionDate"
                        >
                          KYC Completion Date
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

                      <Col lg={3}>
                        <h6
                          className="font-size-10"
                          htmlFor="soReceiveDate"
                        >
                          SO Receive Date
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

                      <Col lg={3}>
                        <h6
                          className="font-size-10"
                          htmlFor="soDispatchDate"
                        >
                          SO Dispatch Date
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
                      <Col lg={3}>
                        <h6
                          className="font-size-10"
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

                      <Col lg={3}>
                        <h6
                          className="font-size-10"
                          htmlFor="clientBBAStatus"
                        >
                          Client BBA Status
                        </h6>
                        <input
                          type="date"
                          name="clientBBAStatus"
                          value={formStateTab3.clientBBAStatus || ""}
                          onChange={handleChangeTab3}
                          placeholder="Client BBA Status"
                          className={`form-control`}
                        />
                      </Col>
                      <Col lg={3}>
                        <h6
                          className="font-size-10"
                          htmlFor="clientBBAStatus"
                        >
                          BD Scheme
                        </h6>
                        <input
                          value={rowData.builderSchemeRemark || ""}
                          placeholder="BD Scheme"
                          className={`form-control`}
                          style={inputStyle}
                          disabled
                        />
                      </Col>
                      <Col lg={3}>
                        <h6
                          className="font-size-10"
                          htmlFor="clientBBAStatus"
                        >
                          MT Scheme
                        </h6>
                        <input
                          value={rowData.mtrsScheme || ""}
                          placeholder="MT Scheme"
                          className={`form-control`}
                          style={inputStyle}
                          disabled
                        />
                      </Col>

                      <Col lg={3}>
                        <h6
                          className="font-size-10"
                          htmlFor="clientBBAStatus"
                        >
                          MT Pay Scheme
                        </h6>
                        <input
                          value={rowData.mtPayScheme || ""}
                          placeholder="MT Pay Scheme"
                          className={`form-control`}
                          style={inputStyle}
                          disabled
                        />
                      </Col>


                      {/* <Col lg="3">
                            <h6 className="font-size-10" htmlFor="connectBookingStatus">
                              Connect Booking Status <RequiredStar/>
                            </h6>
                            <Select
                              id="connectBookingStatus"
                              isClearable
                              value={formStateTab3.connectBookingStatus}
                              onChange={(option) =>
                                handleChangeSelectTab3(option, "connectBookingStatus")
                              }
                              options={connectBookingStatusGroup}
                              className={`${errors.incentiveId ? "is-invalid" : "" }`}
                            />
                          </Col>
                          {formStateTab3?.connectBookingStatus?.value === 'MTC' &&
                            <Col lg="3">
                              <h6 className="font-size-10 mt-3" htmlFor="connectSuspectName">
                                Select Connect <RequiredStar/>
                              </h6>
                              <Select
                                id="connectSuspectName"
                                isClearable
                                value={formStateTab3.connectSuspectName}
                                onChange={(option) =>
                                  handleChangeSelectTab3(option, "connectSuspectName")
                                }
                                options={Array.isArray(connectList?.data?.data) ? connectList?.data?.data : []}
                                getOptionLabel={(e) => `${e.label} (${e.value})`}
                                className={`${errors.connectSuspectName ? "is-invalid" : ""}`}
                              />
                            </Col>
                          }
                          {formStateTab3?.connectBookingStatus?.value === 'MTC' &&
                            <Col lg="3">
                              <h6 className="font-size-10 mt-3" htmlFor="bookingRange">
                                Booking Range <RequiredStar/>
                              </h6>
                              <Select
                                id="bookingRange"
                                isClearable
                                value={formStateTab3.bookingRange}
                                onChange={(option) =>
                                  handleChangeSelectTab3(option, "bookingRange")
                                }
                                options={planRangeList}
                                className={`${errors.bookingRange ? "is-invalid" : ""}`}
                              />
                            </Col>
                          } */}

                      <Col md={6}>
                        <h6 className="font-size-10" htmlFor="remarks">
                          Remarks <RequiredStar />
                        </h6>
                        <textarea
                          name="remarks"
                          value={formStateTab3.remarks}
                          onChange={handleChangeTab3}
                          rows={4}
                          placeholder="Enter remarks"
                          className={`form-control ${errors.remarks ? "is-invalid" : ""}`}
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
              <ul className="pager wizard twitter-bs-wizard-pager-link">
                <li
                  className={
                    activeTabWiz === 1
                      ? "previous disabled me-2"
                      : "previous me-2"
                  }
                >
                  <button
                    onClick={() => {
                      if (activeTabWiz > 1) {
                        toggleTabWiz(activeTabWiz - 1);
                      }
                    }}
                    disabled={activeTabWiz === 1}
                    className="btn btn-secondary"
                    color="secondary"
                  >
                    Previous
                  </button>
                </li>
                <li
                  className={activeTabWiz === 3 ? "next disabled" : "next"}
                >
                  <button
                    onClick={() => {
                      if (activeTabWiz < 4) {
                        toggleTabWiz(activeTabWiz + 1);
                      }
                    }}
                    disabled={activeTabWiz === 3}
                    className="btn btn-primary"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </div>
          </CardBody>
        </Card>

        <Row>
          {(empCode !== '1357' && empCode !== '1431' && empCode !== '1240' && empCode !== '1585' && empCode !== '2099' && empCode !== '20006' && empCode !== '20019' && empCode !== '2956') && (
            <Col>
              <div className="d-flex justify-content-center mb-3">
                <button className="btn btn-primary" onClick={handleSave}>
                  Update
                </button>
                <button
                  className="btn btn-secondary ms-2"
                  color="secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </Col>
          )}
        </Row>
      </Container>
    </PageContent >
  );
};

export default CreateEditSalesEntry;