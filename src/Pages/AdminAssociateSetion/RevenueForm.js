import React, { useEffect, useMemo, useState } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Card, CardBody, Col, Container, Row, Button } from "reactstrap";
import Select from "react-select";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet, usePost, usePut } from "../../Hooks/useApi";
import {
  CALCULATE_ASSOCIATE_REVENUE,
  GET_ALL_MAIN_TEAM_DROPDOWN_ID,
  GET_ALL_UNIT_BY_BUILDER_PROJECT,
  GET_ALL_USERS_DROPDOWN,
  GET_COSTING_BY_PROJECT_UNITID,
  GET_DROPDOWN_BUILDER,
  GET_MY_TEAM,
  GET_PROJECT_BY_BUILDER,
  GET_PROSPECT_DETAILS_BY_PROS_ID,
  PROSPECT_DROPDOWN,
  UPDATE_ASSOCIATE_REVENUE,
} from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";
import { RequiredStar } from "../../helpers/function_helper";

export default function RevenueForm() {
  const location = useLocation();
  const { rowData } = location.state || {};
  const navigation = useNavigate();
  const userId = useUserStore((state) => state.user.userId);
  const role = useUserStore((state) => state.user.role);

  const INITIAL_STATE = {
    revenueDate: null,
    associate: null,
    builder: null,
    project: null,
    unit: null,
    prospect: null,
    bookingType: null,
    clientName: "",
    bookingName: "",
    phoneNo: "",
    area: 0,
    revenueAsPerSlab: 0,
    manualUnitNo: "",
    overAndAbove: 0,
    incentive: 0,
    brokerCommission: "",
    onFormDiscount: "",
    netRevenue: "",
    retentionOldRevenue: "",
    totalCostToClient: "",
    brokerDetail: "",
    sharingStatus: null,
    sharingDetails: "",
    slabRate: "",
    slabAmount: "",
    remarks: "",
    sharingPrecentage: "",
    sharingAssociate: null,
    mainTeam: null,
    revenueMonth:''
  };

  const [unitList, setUnitList] = useState([]);
  const [formState, setFormState] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});

  const { data: myTeamList } = useGet(
    GET_MY_TEAM + formState?.mainTeam?.value,
    {
      enabled: Boolean(formState?.mainTeam),
    }
  );

  const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN_ID);

  const { data: associateList } = useGet(
    role === "ADMIN" ? GET_ALL_USERS_DROPDOWN : GET_MY_TEAM + userId
  );
  const { data: builderList } = useGet(GET_DROPDOWN_BUILDER);

  const { data: prospectList } = useGet(
    PROSPECT_DROPDOWN + formState?.associate?.value,
    {
      enabled: Boolean(formState?.associate),
    }
  );

  const { data: prospectDetails, refetch: getProspectDetails } = useGet(
    GET_PROSPECT_DETAILS_BY_PROS_ID + formState?.prospect?.value,
    { enabled: Boolean(formState?.prospect) }
  );

  const { isPending: isPendingUnit, mutate: mutateUnitData } = usePut(
    `${GET_ALL_UNIT_BY_BUILDER_PROJECT}${formState?.builder?.value}&projectName=${formState?.project?.value}`,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          setUnitList(response?.data?.data);
        } else {
          // toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const sharingStatusGroup = useMemo(
    () => [
      { label: "No", value: "no" },
      { label: "Yes", value: "yes" },
    ],
    []
  );

  const bookingTypeGrp = useMemo(
    () => [
      { label: "MIS", value: "MIS" },
      { label: "SBI", value: "SBI" },
    ],
    []
  );

  const { data: projectData } = useGet(
    formState.builder
      ? `${GET_PROJECT_BY_BUILDER}${formState?.builder?.value}`
      : null,
    { enabled: Boolean(formState.builder) }
  );

  const { data: costingData } = useGet(
    `${GET_COSTING_BY_PROJECT_UNITID}=${formState?.unit?.value}`,
    { enabled: !!formState?.unit }
  );

  useEffect(() => {
    if (Object.keys(rowData).length > 0) {
      setFormState((prevState) => ({
        ...prevState,
        revenueDate: rowData?.entryDate
          ? rowData?.entryDate?.split("T")[0]
          : "",
          revenueMonth: rowData?.newRevenueDate?
          rowData?.newRevenueDate?.split("T")[0]:
          rowData?.entryDate
          ? rowData?.entryDate?.split("T")[0]
          : "",
        bookingType:
          bookingTypeGrp?.find((item) => item.label === rowData.bookingType) ||
          null,
        clientName: rowData.clientName,
        bookingName: rowData.revenueBookedName,
        phoneNo: rowData.phoneNo,
        area: costingData?.data?.data?.area
          ? costingData?.data?.data?.area
          : rowData.area,
        revenueAsPerSlab: rowData.totalRevenue,
        manualUnitNo: rowData.manualUnitNo,
        overAndAbove: rowData.overAbove,
        incentive: rowData.incentive,
        brokerCommission: rowData.lessCommission,
        onFormDiscount: rowData.lessOnFormDisc,
        netRevenue: rowData.netRevenue,
        retentionOldRevenue: rowData.retentionOldRev,
        totalCostToClient: rowData.totalCostToClient,
        brokerDetail: rowData.brokerDetails,
        sharingStatus:
          sharingStatusGroup?.find(
            (item) => item.value === rowData.bookingShareStatus
          ) || null,
        sharingPrecentage: rowData?.sharingPercentage,
        sharingDetails: rowData.shareDetails,
        slabRate: rowData.slabRate,
        slabAmount: rowData.slab,
        remarks: rowData.remarks,
      }));
    }
  }, [
    bookingTypeGrp,
    costingData?.data?.data?.area,
    rowData,
    sharingStatusGroup,
  ]);

  useEffect(() => {
    if (formState?.project && formState?.builder) {
      mutateUnitData();
    }
  }, [formState?.builder, formState?.project, mutateUnitData]);

  useEffect(() => {
    if (rowData?.sharingMainTeamId) {
      const mainTeam = mainTeams?.data?.data?.find(
        (item) => item.value == rowData.sharingMainTeamId
      );
      if (mainTeam) {
        setFormState((prevState) => ({ ...prevState, mainTeam }));
      }
    }
  }, [mainTeams?.data?.data, rowData?.sharingMainTeamId]);

  useEffect(() => {
    if (rowData?.sharingAssociateNameId) {
      const sharingAssociate = myTeamList?.data?.data?.find(
        (item) => item.value == rowData.sharingAssociateNameId
      );
      if (sharingAssociate) {
        setFormState((prevState) => ({ ...prevState, sharingAssociate }));
      }
    }
  }, [myTeamList?.data?.data, rowData?.sharingAssociateNameId]);

  useEffect(() => {
    if (rowData?.projectName) {
      const project = projectData?.data?.data?.find(
        (item) => item.label === rowData.projectName
      );
      if (project) {
        setFormState((prevState) => ({ ...prevState, project }));
      }
    }
  }, [projectData?.data?.data, rowData?.projectName]);

  useEffect(() => {
    if (rowData?.projectName) {
      const project = projectData?.data?.data?.find(
        (item) => item.label === rowData.projectName
      );
      if (project) {
        setFormState((prevState) => ({ ...prevState, project }));
      }
    }
  }, [projectData?.data?.data, rowData?.projectName]);

  useEffect(() => {
    if (rowData?.builderName) {
      const builder = builderList?.data?.data?.find(
        (item) => item.label === rowData.builderName
      );
      if (builder) {
        setFormState((prevState) => ({ ...prevState, builder }));
      }
    }
  }, [builderList?.data?.data, rowData?.builderName]);

  useEffect(() => {
    if (rowData?.associateId) {
      const associate = associateList?.data?.data?.find(
        (item) => `${item.value}` === `${rowData.associateId}`
      );
      if (associate) {
        setFormState((prevState) => ({ ...prevState, associate }));
      }
    }
  }, [associateList?.data?.data, rowData?.associateId]);

  useEffect(() => {
    if (rowData?.unitId) {
      const unit = unitList?.find((item) => item.value == rowData.unitId);
      if (unit) {
        setFormState((prevState) => ({ ...prevState, unit }));
      }
    }
  }, [unitList, rowData?.unitId]);

  useEffect(() => {
    if (rowData?.prospectId) {
      const prospect = Array.isArray(prospectList?.data?.data)
        ? prospectList?.data?.data?.find(
            (item) => item.value === rowData.prospectId
          )
        : [];
      if (prospect) {
        setFormState((prevState) => ({ ...prevState, prospect }));
      }
    }
  }, [prospectList?.data?.data, rowData?.prospectId]);

  useEffect(() => {
    const phoneNo = prospectDetails?.data?.data?.clientMobile;
    if (phoneNo) {
      setFormState((prevState) => ({ ...prevState, phoneNo }));
    } else {
      setFormState((prevState) => ({ ...prevState, phoneNo: "" }));
    }
  }, [prospectDetails?.data?.data?.clientMobile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNo") {
      if (/^\d{0,10}$/.test(value)) {
        setFormState({ ...formState, [name]: value });
      }
    } else {
      setFormState({ ...formState, [name]: value });
    }
    setErrors((prev) => ({
      ...prev,
      [name]: "", // Clear error for this field
    }));
  };

  const handleSelectChange = (name) => (selectedOption) => {
    setFormState((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    if (name === "prospect") {
      getProspectDetails();
    }
    if (name === "project") {
      mutateUnitData(); // Call your specific function here
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const excludedFields = [
      "unit",
      "sharingDetails",
      "onFormDiscount",
      "retentionOldRevenue",
      "slabRate",
      "slabAmount",
      "brokerCommission",
      "totalCostToClient",
      "brokerDetail",
      "state",
      "pin",
      "address",
    ]; // Replace with actual field names

    if (formState?.sharingStatus?.value === "no") {
      excludedFields.push("sharingAssociate", "sharingPrecentage", "mainTeam");
    }

    Object.keys(formState).forEach((key) => {
      // Skip validation for excluded fields
      if (excludedFields.includes(key)) {
        return; // Skip this iteration if the key is in the excludedFields array
      }
      if (
        formState[key] === null ||
        formState[key] === undefined ||
        formState[key] === ""
      ) {
        newErrors[key] = "This field is required.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if there are no errors
  };

  const handleSave = () => {
    if (validateForm()) {
      // Handle save logic here
      let params = {
        id: rowData ? rowData.id : 0,
        entryDate: formState.revenueDate,
        associateId: formState?.associate ? formState?.associate?.value : "",
        builderName: formState?.builder ? formState?.builder?.value : "",
        projectName: formState?.project ? formState?.project?.value : "",
        unitId: formState?.unit ? formState?.unit?.value : "",
        unitNo: formState?.unit ? formState?.unit?.label : "",
        prospectId: formState?.prospect ? formState?.prospect?.value : "",
        bookingType: formState?.bookingType ? formState.bookingType?.value : "",
        clientName: formState.clientName,
        revenueBookedName: formState.bookingName,
        phoneNo: formState.phoneNo,
        area: formState.area,
        totalRevenue: formState.revenueAsPerSlab,
        manualUnitNo: formState.manualUnitNo,
        overAbove: formState.overAndAbove,
        incentive: formState.incentive,
        lessCommission: formState.brokerCommission,
        lessOnFormDisc: formState.onFormDiscount,
        netRevenue: formState.netRevenue,
        retentionOldRev: formState.retentionOldRevenue,
        totalCostToClient: formState.totalCostToClient,
        brokerDetails: formState.brokerDetail,
        bookingShareStatus: formState?.sharingStatus
          ? formState?.sharingStatus?.value
          : "no",
        shareDetails: formState.sharingDetails,
        slabRate: formState.slabRate,
        slab: formState.slabAmount,
        remarks: formState.remarks,
        sharingPercentage: formState?.sharingPrecentage,
        sharingMainTeam: formState?.mainTeam?.label,
        sharingMainTeamId: formState?.mainTeam?.value,
        sharingAssociateName: formState?.sharingAssociate?.label,
        sharingAssociateNameId: formState?.sharingAssociate?.value,
        newRevenueDate: formState?.revenueMonth,
      };

      mutateUpdate(params);
    } else {
      toast.error("Some Mandatory Fields Are Still Not Filled");
    }
  };

  const handleCancel = () => {
    navigation(-1);
  };

  const { isPending: isPendingUpdate, mutate: mutateUpdate } = usePut(
    UPDATE_ASSOCIATE_REVENUE + userId,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          handleCancel();
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

  const { mutate: mutateCalculate } = usePost(CALCULATE_ASSOCIATE_REVENUE, {
    onSuccess: (response) => {
      if (response?.data.status === 1) {
        // toast.success(response.data.message);
        const calcData = response?.data?.data;
        setFormState({
          ...formState,
          netRevenue: calcData.netRevenue,
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
      entryDate: formState.revenueDate,
      associateId: formState?.associate ? formState?.associate?.value : "",
      builderId: formState?.builder ? formState?.builder?.value : "",
      projectId: formState?.project ? formState?.project?.value : "",
      unitId: formState?.unit ? formState?.unit?.value : "",
      unitNo: formState?.unit ? formState?.unit?.label : "",
      prospectId: formState?.prospect ? formState?.prospect?.value : "",
      bookingType: formState?.bookingType ? formState.bookingType?.value : "",
      clientName: formState.clientName,
      revenueBookedName: formState.bookingName,
      phoneNo: formState.phoneNo,
      area: formState.area,
      totalRevenue: formState.revenueAsPerSlab,
      manualUnitNo: formState.manualUnitNo,
      overAbove: formState.overAndAbove,
      incentive: formState.incentive,
      lessCommission: formState.brokerCommission,
      lessOnFormDisc: formState.onFormDiscount,
      netRevenue: formState.netRevenue,
      retentionOldRev: formState.retentionOldRevenue,
      totalCostToClient: formState.totalCostToClient,
      brokerDetails: formState.brokerDetail,
      bookingShareStatus: formState?.sharingStatus
        ? formState?.sharingStatus?.value
        : "no",
      shareDetails: formState.sharingDetails,
      slabRate: formState.slabRate,
      slab: formState.slabAmount,
      remarks: formState.remarks,
    };

    mutateCalculate(params);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Breadcrumbs title="Revenue" breadcrumbItem={"Add Revenue"} />
        {(isPendingUpdate || isPendingUnit) && <ScreenLoader />}
        <Container fluid={true}>
          <form>
            <Card>
              <CardBody>
                <Row className="mt-2">
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">
                      Revenue Date <RequiredStar/>
                    </h6>
                    <input
                      type="date"
                      className={`form-control ${
                        errors.revenueDate ? "is-invalid" : ""
                      }`}
                      name="revenueDate"
                      value={formState.revenueDate}
                      onChange={handleChange}
                    />
                    {errors.revenueDate && (
                      <div className="invalid-feedback font-size-11">
                        {errors.revenueDate}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">
                      Select Associate <RequiredStar/>
                    </h6>
                     <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                      options={
                        Array.isArray(associateList?.data?.data)
                          ? associateList?.data?.data
                          : []
                      }
                      className={`react-select ${
                        errors.associate ? "is-invalid" : ""
                      }`}
                      isClearable
                      onChange={handleSelectChange("associate")}
                      value={formState.associate}
                    />
                    {errors.associate && (
                      <div className="invalid-feedback font-size-11">
                        {errors.associate}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">
                      Select Builder <RequiredStar/>
                    </h6>
                     <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                      options={
                        Array.isArray(builderList?.data?.data)
                          ? builderList?.data?.data
                          : []
                      }
                      className={`react-select ${
                        errors.builder ? "is-invalid" : ""
                      }`}
                      isClearable
                      onChange={handleSelectChange("builder")}
                      value={formState.builder}
                    />
                    {errors.builder && (
                      <div className="invalid-feedback font-size-11">
                        {errors.builder}
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">
                      Project <RequiredStar/>
                    </h6>
                     <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                      isDisabled={!formState.builder}
                      options={
                        Array.isArray(projectData?.data?.data)
                          ? projectData?.data?.data
                          : []
                      }
                      isClearable
                      className={`react-select ${
                        errors.unit ? "is-invalid" : ""
                      }`}
                      onChange={handleSelectChange("project")}
                      value={formState.project}
                    />
                    {errors.project && (
                      <div className="invalid-feedback font-size-11">
                        {errors.project}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">Select Unit</h6>
                     <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                      isDisabled={!formState.project}
                      options={Array.isArray(unitList) ? unitList : []}
                      className={`react-select`}
                      isClearable
                      onChange={handleSelectChange("unit")}
                      value={formState.unit}
                    />
                  </Col>
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">
                      Select Prospect <RequiredStar/>
                    </h6>
                     <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                      isDisabled={!formState.associate}
                      isClearable
                      options={
                        Array.isArray(prospectList?.data?.data)
                          ? prospectList?.data?.data
                          : []
                      }
                      className={`react-select ${
                        errors.prospect ? "is-invalid" : ""
                      }`}
                      onChange={handleSelectChange("prospect")}
                      value={formState.prospect}
                    />
                    {errors.prospect && (
                      <div className="invalid-feedback font-size-11">
                        {errors.prospect}
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">
                      Booking Type <RequiredStar/>
                    </h6>
                     <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                      isClearable
                      options={bookingTypeGrp}
                      className={`react-select ${
                        errors.bookingType ? "is-invalid" : ""
                      }`}
                      onChange={handleSelectChange("bookingType")}
                      value={formState.bookingType}
                    />
                    {errors.bookingType && (
                      <div className="invalid-feedback font-size-11">
                        {errors.bookingType}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">
                      Client Name <RequiredStar/>
                    </h6>
                    <input
                      type="text"
                      name="clientName"
                      placeholder="Enter Client Name"
                      className={`form-control ${
                        errors.clientName ? "is-invalid" : ""
                      }`}
                      value={formState.clientName}
                      onChange={handleChange}
                    />
                    {errors.clientName && (
                      <div className="invalid-feedback font-size-11">
                        {errors.clientName}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">
                      Booking Name <RequiredStar/>
                    </h6>
                    <input
                      type="text"
                      name="bookingName"
                      className={`form-control ${
                        errors.bookingName ? "is-invalid" : ""
                      }`}
                      value={formState.bookingName}
                      placeholder="Enter booking name"
                      onChange={handleChange}
                    />
                    {errors.bookingName && (
                      <div className="invalid-feedback font-size-11">
                        {errors.bookingName}
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">
                      Mobile No. <RequiredStar/>
                    </h6>
                    <input
                      type="text"
                      disabled
                      style={{ backgroundColor: defaultTheme.btnDisable }}
                      name="phoneNo"
                      className={`form-control ${
                        errors.phoneNo ? "is-invalid" : ""
                      }`}
                      value={formState.phoneNo}
                      placeholder="Enter mobile number"
                      onChange={handleChange}
                    />
                    {errors.phoneNo && (
                      <div className="invalid-feedback font-size-11">
                        {errors.phoneNo}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">
                      Area <RequiredStar/>
                    </h6>
                    <input
                      type="text"
                      name="area"
                      className={`form-control ${
                        errors.area ? "is-invalid" : ""
                      }`}
                      value={formState.area}
                      placeholder="Enter area"
                      onChange={handleChange}
                    />
                    {errors.area && (
                      <div className="invalid-feedback font-size-11">
                        {errors.area}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">
                      Revenue As Per Slab{" "}
                      <RequiredStar/>
                    </h6>
                    <input
                      type="text"
                      name="revenueAsPerSlab"
                      onBlur={handleCalculateCostOnBlur}
                      className={`form-control ${
                        errors.revenueAsPerSlab ? "is-invalid" : ""
                      }`}
                      value={formState.revenueAsPerSlab}
                      onChange={handleChange}
                      placeholder="Enter revenue as per slab"
                    />
                    {errors.revenueAsPerSlab && (
                      <div className="invalid-feedback font-size-11">
                        {errors.revenueAsPerSlab}
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">
                      Manual Unit No <RequiredStar/>
                    </h6>
                    <input
                      type="text"
                      name="manualUnitNo"
                      className={`form-control ${
                        errors.manualUnitNo ? "is-invalid" : ""
                      }`}
                      value={formState.manualUnitNo}
                      onBlur={handleCalculateCostOnBlur}
                      placeholder="Enter manual unit number"
                      onChange={handleChange}
                    />
                    {errors.manualUnitNo && (
                      <div className="invalid-feedback font-size-11">
                        {errors.manualUnitNo}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">
                      Over and Above <RequiredStar/>
                    </h6>
                    <input
                      type="text"
                      name="overAndAbove"
                      onBlur={handleCalculateCostOnBlur}
                      className={`form-control ${
                        errors.overAndAbove ? "is-invalid" : ""
                      }`}
                      value={formState.overAndAbove}
                      onChange={handleChange}
                      placeholder="Enter over and above"
                    />
                    {errors.overAndAbove && (
                      <div className="invalid-feedback font-size-11">
                        {errors.overAndAbove}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">
                      Incentive <RequiredStar/>
                    </h6>
                    <input
                      type="text"
                      name="incentive"
                      className={`form-control ${
                        errors.incentive ? "is-invalid" : ""
                      }`}
                      value={formState.incentive}
                      placeholder="Enter incentive"
                      onChange={handleChange}
                    />
                    {errors.incentive && (
                      <div className="invalid-feedback font-size-11">
                        {errors.incentive}
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">Broker Commission</h6>
                    <input
                      type="text"
                      name="brokerCommission"
                      onBlur={handleCalculateCostOnBlur}
                      className={`form-control ${
                        errors.brokerCommission ? "is-invalid" : ""
                      }`}
                      value={formState.brokerCommission}
                      onChange={handleChange}
                      placeholder="Enter broker commission"
                    />
                    {errors.brokerCommission && (
                      <div className="invalid-feedback font-size-11">
                        {errors.brokerCommission}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">On Form Discount</h6>
                    <input
                      type="text"
                      name="onFormDiscount"
                      onBlur={handleCalculateCostOnBlur}
                      className={`form-control ${
                        errors.onFormDiscount ? "is-invalid" : ""
                      }`}
                      value={formState.onFormDiscount}
                      onChange={handleChange}
                      placeholder="Enter on form discount"
                    />
                    {errors.onFormDiscount && (
                      <div className="invalid-feedback font-size-11">
                        {errors.onFormDiscount}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">
                      Net Revenue <RequiredStar/>
                    </h6>
                    <input
                      type="text"
                      readOnly
                      style={{ backgroundColor: defaultTheme.btnDisable }}
                      name="netRevenue"
                      className={`form-control ${
                        errors.netRevenue ? "is-invalid" : ""
                      }`}
                      value={formState.netRevenue}
                      onChange={handleChange}
                      placeholder="Enter net revenue"
                    />
                    {errors.netRevenue && (
                      <div className="invalid-feedback font-size-11">
                        {errors.netRevenue}
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">Retention/Old Revenue</h6>
                    <input
                      type="text"
                      name="retentionOldRevenue"
                      className={`form-control ${
                        errors.retentionOldRevenue ? "is-invalid" : ""
                      }`}
                      value={formState.retentionOldRevenue}
                      onChange={handleChange}
                      placeholder="Enter retention old revenue"
                    />
                    {errors.retentionOldRevenue && (
                      <div className="invalid-feedback font-size-11">
                        {errors.retentionOldRevenue}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">Total Cost to Client </h6>
                    <input
                      type="text"
                      name="totalCostToClient"
                      className={`form-control ${
                        errors.totalCostToClient ? "is-invalid" : ""
                      }`}
                      value={formState.totalCostToClient}
                      onChange={handleChange}
                      placeholder="Enter total cost to client"
                    />
                    {errors.totalCostToClient && (
                      <div className="invalid-feedback font-size-11">
                        {errors.totalCostToClient}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">Broker Detail</h6>
                    <input
                      type="text"
                      name="brokerDetail"
                      className={`form-control ${
                        errors.brokerDetail ? "is-invalid" : ""
                      }`}
                      value={formState.brokerDetail}
                      onChange={handleChange}
                      placeholder="Enter broker detail"
                    />
                    {errors.brokerDetail && (
                      <div className="invalid-feedback font-size-11">
                        {errors.brokerDetail}
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">Sharing Details</h6>
                    <input
                      type="text"
                      name="sharingDetails"
                      className={`form-control ${
                        errors.sharingDetails ? "is-invalid" : ""
                      }`}
                      value={formState.sharingDetails}
                      onChange={handleChange}
                      placeholder="Enter sharing details"
                    />
                    {errors.sharingDetails && (
                      <div className="invalid-feedback font-size-11">
                        {errors.sharingDetails}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">Slab Rate</h6>
                    <input
                      type="text"
                      name="slabRate"
                      className={`form-control ${
                        errors.slabRate ? "is-invalid" : ""
                      }`}
                      value={formState.slabRate}
                      onChange={handleChange}
                      placeholder="Enter slab rate"
                    />
                    {errors.slabRate && (
                      <div className="invalid-feedback font-size-11">
                        {errors.slabRate}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">
                      Sharing Status <RequiredStar/>
                    </h6>
                     <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                      isClearable
                      options={sharingStatusGroup}
                      className={`react-select ${
                        errors.sharingStatus ? "is-invalid" : ""
                      }`}
                      onChange={handleSelectChange("sharingStatus")}
                      value={formState.sharingStatus}
                    />
                    {errors.sharingStatus && (
                      <div className="invalid-feedback font-size-11">
                        {errors.sharingStatus}
                      </div>
                    )}
                  </Col>
                </Row>

                {/* ///New Fields */}
                {formState?.sharingStatus?.value === "yes" && (
                  <Row className="mt-2">
                    <Col md="4">
                      <h6 className="mb-1 font-size-11">
                        Sharing % <RequiredStar/>
                      </h6>
                      <input
                        type="number"
                        name="sharingPrecentage"
                        className={`form-control ${
                          errors.sharingPrecentage ? "is-invalid" : ""
                        }`}
                        value={formState.sharingPrecentage}
                        onChange={handleChange}
                        placeholder="Enter sharing %"
                      />
                      {errors.sharingPrecentage && (
                        <div className="invalid-feedback font-size-11">
                          {errors.sharingPrecentage}
                        </div>
                      )}
                    </Col>
                    <Col md="4">
                      <h6 className="mb-1 font-size-11">
                        Main Team <RequiredStar/>
                      </h6>
                       <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                        isClearable
                        options={
                          Array.isArray(mainTeams?.data?.data)
                            ? mainTeams?.data?.data
                            : []
                        }
                        className={`react-select ${
                          errors.mainTeam ? "is-invalid" : ""
                        }`}
                        onChange={handleSelectChange("mainTeam")}
                        value={formState.mainTeam}
                      />
                      {errors.mainTeam && (
                        <div className="invalid-feedback font-size-11">
                          {errors.mainTeam}
                        </div>
                      )}
                    </Col>
                    <Col md="4">
                      <h6 className="mb-1 font-size-11">
                        Select Sharing Associate{" "}
                        <RequiredStar/>
                      </h6>
                       <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                        isClearable
                        isDisabled={!formState?.mainTeam}
                        options={
                          Array.isArray(myTeamList?.data?.data)
                            ? myTeamList?.data?.data
                            : []
                        }
                        className={`react-select ${
                          errors.sharingAssociate ? "is-invalid" : ""
                        }`}
                        onChange={handleSelectChange("sharingAssociate")}
                        value={formState.sharingAssociate}
                      />
                      {errors.sharingAssociate && (
                        <div className="invalid-feedback font-size-11">
                          {errors.sharingAssociate}
                        </div>
                      )}
                    </Col>
                  </Row>
                )}
                {/* ///New Fields */}

                <Row className="mt-2">
                  <Col md="4">
                    <h6 className="mb-1 font-size-11">Slab Amount</h6>
                    <input
                      type="text"
                      name="slabAmount"
                      className={`form-control ${
                        errors.slabAmount ? "is-invalid" : ""
                      }`}
                      value={formState.slabAmount}
                      onChange={handleChange}
                      placeholder="Enter slab amount"
                    />
                    {errors.slabAmount && (
                      <div className="invalid-feedback font-size-11">
                        {errors.slabAmount}
                      </div>
                    )}
                  </Col>

                  <Col md="4">
                    <h6 className="mb-1 font-size-11">Revenue Report Month <RequiredStar/></h6>
                    <input
                      type="date"
                      name="revenueMonth"
                      className={`form-control ${
                        errors.revenueMonth ? "is-invalid" : ""
                      }`}
                      value={formState.revenueMonth}
                      onChange={handleChange}
                    />
                    {errors.revenueMonth && (
                      <div className="invalid-feedback font-size-11">
                        {errors.revenueMonth}
                      </div>
                    )}
                  </Col>

                  <Col md="8 mt-2">
                    <h6 className="mb-1 font-size-11">
                      Remarks <RequiredStar/>
                    </h6>
                    <textarea
                      name="remarks"
                      className={`form-control ${
                        errors.remarks ? "is-invalid" : ""
                      }`}
                      value={formState.remarks}
                      rows={4}
                      onChange={handleChange}
                      placeholder="Enter remarks"
                    />
                    {errors.remarks && (
                      <div className="invalid-feedback font-size-11">
                        {errors.remarks}
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col md="12">
                    <Button
                      color="primary"
                      style={{ backgroundColor: defaultTheme.primary }}
                      onClick={handleSave}
                    >
                      Update
                    </Button>
                    <Button
                      color="secondary"
                      onClick={handleCancel}
                      className="ms-3"
                    >
                      Cancel
                    </Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </form>
        </Container>
      </div>
    </React.Fragment>
  );
}
