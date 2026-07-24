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
  SAVE_FRESH_BOOKING_FORM,
  UPDATE_FRESH_BOOKING_FORM,
} from "../../helpers/url_helper";
import Select from "react-select";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import { RegexFile } from "../../helpers/RegexFile";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { formatDate, getDaysAgo, RequiredStar, roundToTwoDecimals } from "../../helpers/function_helper";
import { decryptData } from "../../components/Common/CryptoUtils";

const FreshBookingEntry = () => {
  const location = useLocation();
  const { rowData, formState, page, searchByGroupSelect, searchTerm } = location.state || {};
  const userId = useUserStore((state) => state.user.userId);
  const [activeTabWiz, setActiveTabWiz] = useState(1);
  const [unitData, setUnitData] = useState([]);
  const navigation = useNavigate();
  // const { data: connectList } = useGet(ALL_CONNECT_DROPDOWN);
  const [prospectData, setProspectData] = useState({});
  const [formData, setFormData] = useState({
    associate: null,
    builder: null,
    project: null,
    unit: null,
    revenue: null,
    prospect: null,
    bookingType: null,
    tempUnit: "",
    tempArea: "",
    tempTurnOver: "",
    freshBookingType: 'Pending',
    rewardPoints: 0
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

  const unitStatusOptions = [
    { label: "Admin Pre Sold", value: "adminPreSold" },
    { label: "Hold", value: "hold" },
    { label: "Open", value: "open" },
    { label: "Pre Sold", value: "preSold" },
    { label: "Sold", value: "sold" },
  ];

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

  const handleChangeSelect = (selectedOption, fieldName) => {
    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: selectedOption,
    }));
    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));

    // Call a specific function only for the "project" field
    if (fieldName === "project") {
      mutateUnitData(); // Call your specific function here
    }
  };

  const { isPending: addLoadingUnit, mutate: mutateUnitData } = usePut(
    `${GET_UNIT_BY_BUILDER_PROJECT}${formData?.builder?.value}&projectName=${formData?.project?.value}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          if (Object.keys(rowData).length === 0) {
            setUnitData(response?.data?.data);
          } else {
            setUnitData((prev) => [
              { label: rowData.projectUnitName, value: rowData.projectunitId }, // Add the new object
              ...response?.data?.data, // Add any additional data from the response (assuming it's an array)
            ]);
          }
        } else if (response.data.message === "No record found !") {
          setUnitData((prev) => [
            { label: rowData?.projectUnitName, value: rowData?.projectunitId }, // Add the new object
          ]);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  useEffect(() => {
    if (formData?.project?.value && formData?.builder?.value) {
      mutateUnitData();
    }
  }, [formData?.builder, formData?.project, mutateUnitData]);

  const handleChangeSelectTab3 = (selectedOption, fieldName) => {
    setFormStateTab3((prevState) => ({
      ...prevState,
      [fieldName]: selectedOption, // Use selectedOption.value for the value
    }));
  };

  const { data: prospectDetails } = useGet(
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

  const [passedStepsWiz, setPassedStepsWiz] = useState([1]);
  const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_);
  const { data: paymentPlanList } = useGet(PAYMENT_PLAN_DROPDOWN);

  const { data: associateList, isLoading: loadingAssociate } = useGet(
    (Object.keys(rowData).length === 0) ? GET_ALL_USERS_DROPDOWN : GET_ALL_USERS_DROPDOWN_LIST
  );

  const { data: prospectList, isLoading: loadingProsList } = useGet(PROSPECT_DROPDOWN + formData?.associate?.value, { enabled: Boolean(formData?.associate?.value), });

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

  const [errors, setErrors] = useState({});

  const propTypeOptions = [
    { value: 22, label: "Commercial" },
    { value: 25, label: "Plot" },
    { value: 24, label: "Residential" },
    { value: 23, label: "Retail" },
  ];

  const schemeOptions = [
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

  const { isPending: addFreshBookingLoading, mutate: addFreshBooking } = usePost(
    `${SAVE_FRESH_BOOKING_FORM}${userId}`,
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

  const { isPending: updateFreshBookingLoading, mutate: updateFreshBooking } = usePut(
    `${UPDATE_FRESH_BOOKING_FORM}${userId}`,
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
    if (!formData?.associate) {
      toast.error("Select Associate is Required");
      return;
    }
    if (!formData?.unit && (formData?.tempUnit === "" || formData?.tempArea === "" || formData?.tempTurnOver === "")) {
      toast.error("Temp Fields are Required");
      return;
    }
    if (!formStateTab3?.soReceiveDate) {
      toast.error("SO Received date is Required");
      return;
    }
    // else if (!formStateTab3?.connectBookingStatus) {
    //   toast.error("Connect Booking Status is Required");
    //   return;
    // }
    // else if (formStateTab3.connectBookingStatus?.value === 'MTC' && !formStateTab3.connectSuspectName) {
    //   toast.error("Connect Select is Required");
    //   return;
    // }
    // else if (formStateTab3.connectBookingStatus?.value === 'MTC' && !formStateTab3.bookingRange) {
    //   toast.error("Booking Range is  Required");
    //   return;
    // }
    // return
    const percentage = calculateFilledPercentage();
    let params = {
      id: rowData.id || 0,
      builderName: formData?.builder?.label || "",
      projectName: formData?.project?.label || "",
      projectId: formData?.project?.value || 0,
      builderId: formData?.builder?.value || 0,
      associateId: formData?.associate?.value || 0,
      associateName: formData?.associate?.label || "",
      projectunitId: formData?.unit?.value || 0,
      projectUnitName: formData?.unit?.label || "",
      clientName: formStateTab1?.applicantName || "",
      clientAddress: formStateTab1?.applicantAddress || "",
      clientPhone: formStateTab1?.contactNum1 || "",
      clientPhone2: formStateTab1?.contactNum2 || "",
      clientEmail: formStateTab1?.emailId || "",
      clientDob: formStateTab1?.dob || "",
      clientAddharCard: formStateTab1?.aadhar || "",
      clientPan: formStateTab1?.pan || "",
      coApplicantName: formStateTab1?.coApplicantName || "",
      coApplicantAddress: formStateTab1?.coApplicantAddress || "",
      coApplicantPhone: formStateTab1?.coApplicantContactNum1 || "",
      coApplicantPhone2: formStateTab1?.coApplicantContactNum2 || "",
      coApplicantEmail: formStateTab1?.coApplicantEmailId || "",
      coApplicantDob: formStateTab1?.coApplicantDob || "",
      coApplicantAddharCard: formStateTab1?.coApplicantAadhar || "",
      coApplicantPan: formStateTab1?.coApplicantPan || "",
      bookingStatusId: formStateTab3?.bookingStatus?.value || 0,
      locationId: rowData?.locationId || 0,
      bookingDate: formStateTab3?.bookingDate || "",
      propTypeId: formStateTab3?.propType?.value || 0,
      saleStatusId: formStateTab3?.saleStatus?.value || 0,
      schemaIncentiveId: formStateTab3?.schemeIncentive?.value || 0,
      incentiveId: formStateTab3?.incentiveId?.value || null,
      formStageId: formStateTab3?.formStage?.value || 0,
      loanSelfFundingId: formStateTab3?.loanSelfFunding?.value || 0,
      kycStatusId: formStateTab3?.kycStatus?.value || 0,
      kycDate: formStateTab3?.kycCompletionDate || "",
      remarks: formStateTab3?.remarks || "",
      soReceiveDate: formStateTab3?.soReceiveDate || "",
      soDispatchDate: formStateTab3?.soDispatchDate || "",
      acceptanceDateByBuilder: formStateTab3?.acceptanceDateByBuilder || "",
      clientBbaStatus: formStateTab3?.clientBBAStatus || "",
      ra_percent: formStateTab2?.raPercent || 0,
      rc_percent: formStateTab2?.rcPercent || 0,
      unitStatus: formData?.unit?.value && 'sold',
      paymentPlan: formStateTab2?.paymentPlan?.value || "",
      prospectId: formData?.prospect?.value || "",
      prospectName: formData?.prospect?.label || "",
      bookingType: formData?.bookingType?.value || "",
      bookingCompletePercentage: percentage || "",
      connectBookingStatus: formStateTab3?.connectBookingStatus?.value || null,
      connectSuspectName: formStateTab3?.connectBookingStatus?.value === "MTC" ? formStateTab3.connectSuspectName?.label : "" || "",
      connectSuspectId: formStateTab3?.connectBookingStatus?.value === "MTC" ? formStateTab3.connectSuspectName?.value : 0 || 0,
      bookingRange: formStateTab3?.connectBookingStatus?.value === "MTC" ? formStateTab3?.bookingRange?.value : "" || "",
      tempUnit: formData?.tempUnit || "",
      tempArea: formData?.tempArea || "",
      tempTurnOver: formData?.tempTurnOver || "",
      freshBookingType: formData?.freshBookingType,
      rewardPoint: formData?.rewardPoints
    };
    if (Object.keys(rowData).length === 0) {
      addFreshBooking(params); // Call addFreshBooking if rowData is empty
    } else {
      updateFreshBooking(params); // Call updateFreshBooking if rowData has properties
    }
  };

  const handleCancel = () => {
    navigation("/fresh-booking", {
      state: {
        formState: formState,
        page: page,
        searchByGroupSelect: searchByGroupSelect,
        searchTerm: searchTerm,
      },
    });
  };

  // UPDATE BOOKING

  useEffect(() => {
    if (Object.keys(rowData).length > 0) {
      setFormData((prevState) => ({
        ...prevState,
        tempUnit: rowData?.tempUnit,
        tempArea: rowData?.tempArea,
        tempTurnOver: rowData?.tempTurnOver,
        freshBookingType: rowData?.freshBookingType,
        rewardPoints: rowData?.rewardPoint || 0,
      }));
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

      setFormStateTab2((prevState) => ({
        ...prevState,
        raPercent: rowData.ra_percent,
        rcPercent: rowData.rc_percent,
      }));

      setFormStateTab3((prevState) => ({
        ...prevState,
        location: rowData?.locationName || "",
        bookingDate: rowData?.bookingDate
          ? rowData?.bookingDate?.split(" ")[0]
          : "",
        propType:
          propTypeOptions.find((role) => role.value == rowData.propTypeId) ||
          null,
        schemeIncentive:
          schemeOptions.find(
            (role) => role.value == rowData.schemaIncentiveId
          ) || null,
        incentiveId:
          incentiveOptions.find((role) => role.value == rowData.incentiveId) ||
          null,
        loanSelfFunding:
          loanSelfFundingOptions.find(
            (role) => role.value == rowData.loanSelfFundingId
          ) || null,
        connectBookingStatus:
          connectBookingStatusGroup.find(
            (role) => role.value == rowData.connectBookingStatus
          ) || null,
        bookingRange:
          planRangeList.find(
            (role) => role.value == rowData.bookingRange
          ) || null,
        soReceiveDate: rowData?.soReceiveDate
          ? rowData?.soReceiveDate?.split(" ")[0]
          : "",
        remarks: rowData?.remarks,
      }));
    }
  }, [rowData]);

  // if (rowData?.bookingRange) {
  //   const bookingRange = planRangeList?.find(
  //     (item) => item.label === rowData.bookingRange
  //   );
  //   if (bookingRange) {
  //     setFormStateTab3((prevState) => ({ ...prevState, bookingRange }));
  //   }
  // }

  useEffect(() => {
    if (
      tab2CostingData &&
      tab2CostingData.unitStatus &&
      Object.keys(rowData).length > 0
    ) {
      const unitStatusKey = tab2CostingData.unitStatus;
      const unitStatusOption = unitStatusOptions.find(
        (option) => option.value === unitStatusKey
      );
      if (unitStatusOption) {
        setFormStateTab2((prevState) => ({
          ...prevState,
          unitStatus: unitStatusOption, // Set the found option
        }));
      }
    }
  }, [tab2CostingData]);

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
    if (rowData?.bookingType) {
      const bookingType = bookingTypeGrp.find(
        (item) => item.label === rowData.bookingType
      );
      if (bookingType) {
        setFormData((prevState) => ({ ...prevState, bookingType }));
      }
    }
  }, [associateList?.data?.data, rowData?.associateId]);

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
    if (rowData?.projectunitId) {
      const unit = Array.isArray(unitData)
        ? unitData?.find((item) => item.value === rowData?.projectunitId)
        : [];

      // If a unit is found, update the formData state
      if (unit) {
        setFormData((prevState) => ({ ...prevState, unit }));
      }
    }
  }, [rowData?.projectUnitId, unitData]);

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
      const prospect = Array.isArray(prospectList?.data?.data)
        ? prospectList?.data?.data?.find(
          (item) => item.value === rowData.prospectId
        )
        : [];
      if (prospect) {
        setFormData((prevState) => ({ ...prevState, prospect }));
      }
    }
  }, [prospectList?.data?.data, rowData?.prospectId]);

  // useEffect(() => {
  //   if (rowData?.connectBookingStatus) {
  //     const connectBookingStatus = connectBookingStatusGroup.find(
  //       (item) => item.label === rowData.connectBookingStatus
  //     );
  //     if (connectBookingStatus) {
  //       setFormStateTab3((prevState) => ({ ...prevState, connectBookingStatus }));
  //     }
  //   }
  // }, [connectBookingStatusGroup, rowData?.connectBookingStatus]);

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

  // useEffect(() => {
  //   if (rowData?.bookingRange) {
  //     const bookingRange = planRangeList?.find(
  //       (item) => item.label === rowData.bookingRange
  //     );
  //     if (bookingRange) {
  //       setFormStateTab3((prevState) => ({ ...prevState, bookingRange }));
  //     }
  //   }
  // }, [planRangeList, rowData?.bookingRange]);

  // Function to calculate the percentage of filled fields from the specified array

  const calculateFilledPercentage = () => {
    // Array of fields to check
    const fieldsToCheck = [
      formData.associate,
      formData.builder,
      formData.project,
      formData.unit,
      formData.prospect,
      formData.bookingType,
      formStateTab1.applicantName,
      formStateTab1.applicantAddress,
      formStateTab1.contactNum1,
      formStateTab1.dob,
      formStateTab1.aadhar,
      formStateTab1.pan,
      formStateTab2.paymentPlan,
      formStateTab2.raPercent,
      formStateTab2.rcPercent,
      formStateTab3.soReceiveDate,
      // formStateTab3.location,
      formStateTab3.propType,
      formStateTab3.schemeIncentive,
      formStateTab3.incentiveId,
      formStateTab3.loanSelfFunding,
      formStateTab3.remarks,
      // formStateTab3.connectBookingStatus
    ];

    // if (formStateTab3?.connectBookingStatus?.value === 'MTC') {
    //   fieldsToCheck.push(formStateTab3.connectSuspectName, formStateTab3.bookingRange);
    // }
    // Count the number of non-empty fields (i.e., not null, undefined, or empty string)
    const filledFields = fieldsToCheck.filter(value => value !== null && value !== undefined && value !== '').length;
    // Calculate the percentage based on total fields
    const percentage = Math.round((filledFields / fieldsToCheck.length) * 100);

    return percentage;
  };

  const handleBookingTypeChange = (event) => {
    setFormData((prevState) => ({
      ...prevState,
      freshBookingType: event.target.value,
    }))
  };

  const days = prospectData?.createdDate ? getDaysAgo(prospectData.createdDate) : null;

  return (
    <PageContent>
      <Container fluid={true}>
        <Breadcrumbs title="Transaction" breadcrumbItem={(Object.keys(rowData).length === 0) ? "Fresh Booking Entry" : 'Update Fresh Booking'} />
        {(addFreshBookingLoading || updateFreshBookingLoading || addLoadingUnit || loadingAssociate || loadingProsList) && <ScreenLoader />}

        {rowData?.id && (<h5 style={{ marginBottom: 5, fontSize: 12 }}>Fresh ID : {rowData.id}</h5>)}

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
                  <h6 className="font-size-11" htmlFor="selectedBuilder">Select Associate <RequiredStar /></h6>
                  <Select
                    id="selectedAssociate"
                    value={formData.associate}
                    isClearable
                    onChange={(option) =>
                      handleChangeSelect(option, "associate")
                    }
                    options={
                      Array.isArray(associateList?.data?.data)
                        ? associateList?.data?.data
                        : []
                    }
                    className={`${errors.associate ? "is-invalid" : ""}`}
                  />
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
                  <h6 className="font-size-11" htmlFor="selectedBuilder">Select Builder <RequiredStar /></h6>
                  <Select
                    id="selectedBuilder"
                    isClearable
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
                </Col>

                <Col lg="3">
                  <h6 className="font-size-11" htmlFor="selectedProject">Select Project <RequiredStar /></h6>
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
                </Col>

                <Col lg="3">
                  <h6 className="font-size-10" htmlFor="unit">Select Unit <RequiredStar /></h6>
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
                      Array.isArray(prospectList?.data?.data)
                        ? prospectList?.data?.data
                        : []
                    }
                    className={`${errors.prospect ? "is-invalid" : ""}`}
                  />
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
                  <h6 className="font-size-10">Prospect Created Date{" "}
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
                    onChange={(option) =>
                      handleChangeSelect(option, "bookingType")
                    }
                    options={bookingTypeGrp}
                    className={`${errors.bookingType ? "is-invalid" : ""}`}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-10">Temp Unit</h6>
                  <input
                    placeholder="Temp Unit"
                    value={formData.tempUnit}
                    className="form-control"
                    onChange={(e) => setFormData({ ...formData, tempUnit: e.target.value })}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-10">Temp Area</h6>
                  <input
                    placeholder="Temp Area"
                    value={formData.tempArea || ""}
                    className="form-control"
                    onChange={(e) => setFormData({ ...formData, tempArea: e.target.value })}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-10">Temp Turnover</h6>
                  <input
                    placeholder="Temp Turnover"
                    value={formData.tempTurnOver || ""}
                    className="form-control"
                    onChange={(e) => setFormData({ ...formData, tempTurnOver: e.target.value })}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">
                    Booking Type <RequiredStar />
                  </h6>
                  <div className="radio-button-container">
                    <label
                      className={`radio-label ${formData.freshBookingType === "Pending" ? "active" : ""}`}
                    >
                      <input
                        type="radio"
                        value="Pending"
                        checked={formData.freshBookingType === "Pending"}
                        onChange={handleBookingTypeChange}
                      />
                      Pending
                    </label>
                    <label
                      className={`radio-label ${formData.freshBookingType === "EOI" ? "active" : ""}`}
                    >
                      <input
                        type="radio"
                        value="EOI"
                        checked={formData.freshBookingType === "EOI"}
                        onChange={handleBookingTypeChange}
                      />
                      EOI
                    </label>
                  </div>
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
                    <Row>
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
                          className={`form-control ${errors.applicantName ? "is-invalid" : ""
                            }`}
                        />
                      </Col>


                      <Col lg="3">
                        <h6 className="font-size-10" htmlFor="contactNum1">
                          Contact Number 1{" "}
                          <RequiredStar />
                        </h6>
                        <input
                          type="text"
                          name="contactNum1"
                          value={formStateTab1.contactNum1}
                          onChange={handleChangeTab1}
                          placeholder="Enter Contact Number 1"
                          className={`form-control ${errors.contactNum1 ? "is-invalid" : ""
                            }`}
                        />
                      </Col>

                      <Col lg="3">
                        <h6 className="font-size-10" htmlFor="contactNum2">
                          Contact Number 2{" "}
                        </h6>
                        <input
                          type="text"
                          name="contactNum2"
                          value={formStateTab1.contactNum2}
                          onChange={handleChangeTab1}
                          placeholder="Enter Contact Number 2"
                          className={`form-control`}
                        />
                      </Col>
                      <Col lg="3">
                        <h6 className="font-size-10" htmlFor="emailId">
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
                    </Row>
                    <Row className="mt-3">

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
                          className={`form-control ${errors.dob ? "is-invalid" : ""
                            }`}
                        />
                      </Col>

                      <Col lg="3">
                        <h6 className="font-size-10" htmlFor="aadhar">
                          Aadhar Number{" "}
                          <RequiredStar />
                        </h6>
                        <input
                          type="text"
                          name="aadhar"
                          value={formStateTab1.aadhar}
                          onChange={handleChangeTab1}
                          maxLength={12}
                          placeholder="Enter Aadhar Number"
                          className={`form-control ${errors.aadhar ? "is-invalid" : ""
                            }`}
                        />
                      </Col>
                      <Col lg="3">
                        <h6 className="font-size-10" htmlFor="pan">
                          PAN Number <RequiredStar />
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
                          value={formStateTab1.applicantAddress}
                          onChange={handleChangeTab1}
                          placeholder="Enter Applicant Address"
                          className={`form-control ${errors.applicantAddress ? "is-invalid" : ""
                            }`}
                        />
                      </Col>
                    </Row>
                    <Row className="mt-3">
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
                          className={`form-control ${errors.coApplicantName ? "is-invalid" : ""
                            }`}
                        />
                      </Col>

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
                          value={formStateTab1.coApplicantContactNum1}
                          onChange={handleChangeTab1}
                          placeholder="Co-Applicant Contact 1"
                          className={`form-control ${errors.coApplicantContactNum1
                            ? "is-invalid"
                            : ""
                            }`}
                        />
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
                          value={formStateTab1.coApplicantContactNum2}
                          onChange={handleChangeTab1}
                          placeholder="Co-Applicant Contact 2"
                          className={`form-control ${errors.coApplicantContactNum2
                            ? "is-invalid"
                            : ""
                            }`}
                        />
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
                          value={formStateTab1.coApplicantEmailId}
                          onChange={handleChangeTab1}
                          placeholder="Enter Co-Applicant Email ID"
                          className={`form-control ${errors.coApplicantEmailId ? "is-invalid" : ""
                            }`}
                        />
                      </Col>
                    </Row>
                    <Row className="mt-3">

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
                          className={`form-control ${errors.coApplicantDob ? "is-invalid" : ""
                            }`}
                        />
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
                          value={formStateTab1.coApplicantAadhar}
                          onChange={handleChangeTab1}
                          placeholder="Enter Co-Applicant Aadhar"
                          className={`form-control ${errors.coApplicantAadhar ? "is-invalid" : ""
                            }`}
                        />
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
                          value={formStateTab1.coApplicantPan}
                          onChange={handleChangeTab1}
                          placeholder="Enter Co-Applicant PAN"
                          className={`form-control ${errors.coApplicantPan ? "is-invalid" : ""
                            }`}
                        />
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
                          value={formStateTab1.coApplicantAddress}
                          onChange={handleChangeTab1}
                          placeholder="Enter Co-Applicant Address"
                          className={`form-control ${errors.coApplicantAddress ? "is-invalid" : ""
                            }`}
                        />
                      </Col>
                    </Row>
                  </Form>
                </TabPane>

                <TabPane tabId={2}>
                  <Form>
                    <Row>
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
                    </Row>

                    <Row className="mt-3">
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
                    </Row>
                    <Row className="mt-3">
                      <Col lg="3">
                        <h6 className="font-size-10">Net BSP</h6>
                        <input
                          type="text"
                          name="netBsp"
                          placeholder="Net BSP"
                          value={tab2CostingData?.netBsp}
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
                          value={tab2CostingData?.gstAmount}
                          className="form-control"
                          style={inputStyle}
                          disabled
                        />
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col lg="3">
                        <h6 className="font-size-10">Net Unit Cost</h6>
                        <input
                          type="text"
                          name="netUnitCost"
                          placeholder="Net Unit Cost"
                          value={tab2CostingData?.netCost}
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
                    </Row>
                    <Row className="mt-3">
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
                    </Row>
                    <Row className="mt-3">
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
                    </Row>
                    <Row className="mt-3">
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
                    </Row>
                    <Row className="mt-3">
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
                    </Row>

                    <Row className="mt-3">
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
                          value={tab2CostingData?.totalGstAmount}
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
                          value={tab2CostingData?.netCostWithGst}
                          className="form-control"
                          style={inputStyle}
                          disabled
                        />
                      </Col> */}

                       <Col lg="3">
                          <h6 className="font-size-10">Total Unit Cost (Without GST)</h6>
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

                    </Row>
                    <Row className="mt-3">
                      <Col lg="3">
                        <h6 className="font-size-10">
                          Payment Plan{" "}
                          <RequiredStar />{" "}
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
                          className={`${errors.paymentPlan ? "is-invalid" : ""
                            }`}
                        />
                      </Col>

                      <Col lg="3">
                        <h6 className="font-size-10">
                          Assured Business % <RequiredStar />{" "}
                        </h6>
                        <input
                          type="text"
                          name="raPercent"
                          placeholder="Enter  Assured Business %"
                          value={formStateTab2?.raPercent}
                          onChange={handleChangeTab2}
                          className={`form-control ${errors.raPercent ? "is-invalid" : ""
                            }`}
                        />
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
                          className={`form-control ${errors.rcPercent ? "is-invalid" : ""
                            }`}
                        />
                      </Col>
                    </Row>
                  </Form>
                </TabPane>

                <TabPane tabId={3}>
                  <Form>
                    <Row lg={12}>
                      <Col lg="3">
                        <h6 className="font-size-10" htmlFor="soReceiveDate">SO Received Date{" "}<RequiredStar /></h6>
                        <input
                          type="date"
                          name="soReceiveDate"
                          value={formStateTab3.soReceiveDate}
                          onChange={handleChangeTab3}
                          placeholder="SO Received Date"
                          className={`form-control`}
                        />
                      </Col>

                      <Col lg="3">
                        <h6 className="font-size-11" htmlFor="propType">Property Type{" "}<RequiredStar /></h6>
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
                      </Col>

                      <Col lg="3">
                        <h6 className="font-size-10" htmlFor="schemeIncentive">Scheme <RequiredStar /></h6>
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
                          options={schemeOptions}
                          className={`${errors.schemeIncentive ? "is-invalid" : ""}`}
                        />
                      </Col>

                      <Col lg="3">
                        <h6 className="font-size-10" htmlFor="incentiveId">
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
                      </Col>
                    </Row>

                    <Row className="mt-3">
                      <Col lg="3">
                        <h6 className="font-size-10" htmlFor="loanSelfFunding">Loan/Self Funding<RequiredStar />
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
                          className={`${errors.loanSelfFunding ? "is-invalid" : ""
                            }`}
                        />
                      </Col>
                      {/* </Row> */}

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
                              className={`${errors.incentiveId ? "is-invalid" : ""
                                }`}
                            />
                          </Col>
                          {formStateTab3?.connectBookingStatus?.value === 'MTC' &&
                            <Col lg="3">
                              <h6 className="font-size-10" htmlFor="connectSuspectName">
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
                                className={`${errors.connectSuspectName ? "is-invalid" : ""
                                  }`}
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
                                className={`${errors.bookingRange ? "is-invalid" : ""
                                  }`}
                              />
                            </Col>
                          } */}

                      <Col md={6}>
                        <h6 className="font-size-10" htmlFor="remarks">Remarks <RequiredStar /></h6>
                        <textarea
                          name="remarks"
                          value={formStateTab3.remarks}
                          onChange={handleChangeTab3}
                          rows={4}
                          placeholder="Enter remarks"
                          className={`form-control ${errors.remarks ? "is-invalid" : ""
                            }`}
                        />
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

        <Row className="justify-content-center mb-3 align-items-center">
          <Col className="text-center">
            <div className="d-flex justify-content-center">
              <button className="btn btn-primary" onClick={handleSave}>
                {(Object.keys(rowData).length === 0) ? "Save" : "Update"}
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
        </Row>
      </Container>
    </PageContent>
  );
};

export default FreshBookingEntry;
