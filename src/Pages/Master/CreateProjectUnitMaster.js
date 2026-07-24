/* eslint-disable eqeqeq */
import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import Select from 'react-select';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import PageContent from '../../components/Common/PageContent';
import ScreenLoader from '../../constants/ScreenLoader';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useUserStore } from '../../store/useUserStore';
import { useGet, usePost, usePut } from '../../Hooks/useApi';
import { CALCULATE_PROJECT_UNIT, GET_ALL_USERS_DROPDOWN, GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_, GET_PROJECT_TYPE_DROPDOWN, SAVE_CALCULATE_PROJECT_UNIT, UPDATE_CALCULATE_PROJECT_UNIT } from '../../helpers/url_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { RequiredStar, roundToTwoDecimals } from '../../helpers/function_helper';

const INITIAL_STATE = {
  validTillDate: '',
  builder: null,
  project: null,
  projectType: null,
  unitNo: '',
  towerBlock: '',
  floor: '',
  area: 0,
  bsp: 0,
  inauguralDiscount: 0,
  npv: 0,
  otherDiscount: 0,
  netBsp: 0,
  netBspArea: 0,
  gstPercent: 0,
  gstAmount: 0,
  netUnitCost: 0,
  floorPlc: 0,
  facingPlc: 0,
  otherViewPlc: 0,
  parking: '',
  clubMembership: 0,
  powerBackup: 0,
  ifms: '',
  leaseRent: '',
  essc: '',
  crf: '',
  edcIdc: '',
  eecFfc: '',
  terraceGarden: '',
  development: '',
  facilities: '',
  maintenance: '',
  meter: '',
  otherCharges: '',
  totalOtherCharges: '',
  totalGstAmt: '',
  totalUnitCost: '',
  unitStatus: null,
  holdFor: null,
  clientName: '',
  holdRemarks: '',
  totalOtherchargeWithGst: 0,
  otherChargeGstRate: 0,
  gstAmountOnOtherCharges: 0,
  possessionCharges: 0
};

const CreateProjectUnitMaster = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { row: rowData = {}, unitNo, fromDate, toDate, page, unitGroupSelect, builder, project, area, floor, tower } = state || {};
  const userId = useUserStore(state => state.user.userId);
  const empCode = useUserStore(state => state.user.empCode);
  const [showFinalSave, setShowFinalSave] = useState(false)
  const [formState, setFormState] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});

  // API hooks
  const { data: usersList } = useGet(GET_ALL_USERS_DROPDOWN);
  const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_);
  const { data: projectData } = useGet(
    `${GET_PROJECT_BY_BUILDER_}${formState.builder?.value}`,
    { enabled: Boolean(formState.builder) }
  );

  const { data: projectTypeData } = useGet(
    `${GET_PROJECT_TYPE_DROPDOWN}${formState.builder?.label}&projectName=${formState.project?.label}`,
    { enabled: Boolean(formState.project) }
  );

  const unitStatusOptions = useMemo(() => {
    if (empCode === "1") {
      return [
        { label: 'Admin Pre Sold', value: 'adminPreSold' },
        { label: 'Block', value: 'block' },
        { label: 'Builder Sold', value: 'builderSold ' },
        { label: 'Hold', value: 'hold' },
        { label: 'Open', value: 'open' },
        { label: 'Pre Sold', value: 'preSold' },
        { label: 'Sold', value: 'sold' },
      ];
    } else {
      return [
        { label: 'Admin Pre Sold', value: 'adminPreSold' },
        { label: 'Block', value: 'block' },
        { label: 'Builder Sold', value: 'builderSold ' },
        { label: 'Hold', value: 'hold' },
        { label: 'Open', value: 'open' },
        { label: 'Pre Sold', value: 'preSold' },
      ];
    }
  }, [empCode]);

  // Initialize form state from rowData
  useEffect(() => {
    if (Object.keys(rowData).length) {
      setFormState({
        ...INITIAL_STATE,
        validTillDate: rowData.createdDate?.split(' ')[0] || '',
        unitNo: rowData.unitNo || '',
        towerBlock: rowData.towerBlock || '',
        floor: rowData.floor || '',
        area: rowData.area || 0,
        bsp: rowData.bsp || 0,
        inauguralDiscount: rowData.inauguralDiscount || 0,
        npv: rowData.npv || 0,
        otherDiscount: rowData.othDicountBuilder || 0,
        netBsp: rowData.netBsp || 0,
        netBspArea: rowData.netBspArea || 0,
        gstPercent: rowData.gstPercent || 0,
        gstAmount: rowData.gstAmount || 0,
        netUnitCost: rowData.netCost || 0,
        floorPlc: rowData.floorPlc || 0,
        facingPlc: rowData.facingPlc || 0,
        otherViewPlc: rowData.otherViewPlc || 0,
        parking: rowData.carParking || '',
        clubMembership: rowData.clubMembership || 0,
        powerBackup: rowData.powerBackupCharges || 0,
        ifms: rowData.ifmsAfterDiscount || '',
        leaseRent: rowData.leaseRentAfterDiscount || '',
        essc: rowData.esscPer || '',
        crf: rowData.crfPer || '',
        edcIdc: rowData.edcIdc || '',
        eecFfc: rowData.eecFfc || '',
        terraceGarden: rowData.terrageGarden || '',
        development: rowData.development || '',
        facilities: rowData.facilities || '',
        maintenance: rowData.maintenance || '',
        meter: rowData.meter || '',
        otherCharges: rowData.otherCharges || '',
        totalOtherCharges: rowData.totalOtherCharge || '',
        totalGstAmt: rowData.totalGstAmount || '',
        totalUnitCost: rowData.netCostWithGst || '',
        unitStatus: unitStatusOptions.find(item => item.value === rowData.unitStatus) || null,
        clientName: rowData.clientName || '',
        holdRemarks: rowData.holdRemarks || '',
        totalOtherchargeWithGst: rowData.totalOtherchargeWithGst || 0,
        otherChargeGstRate: rowData.otherChargeGstRate || 0,
        gstAmountOnOtherCharges: rowData.otherChargeGstAmt || 0,
        possessionCharges: rowData.possessionCharges || 0
      });
    }
  }, [rowData, unitStatusOptions]);

  // Set dropdown values from rowData
  useEffect(() => {
    if (rowData.builderName && Array.isArray(builderList?.data?.data)) {
      setFormState(prev => ({
        ...prev,
        builder: builderList.data.data.find(item => item.label === rowData.builderName) || null
      }));
    }
  }, [builderList, rowData.builderName]);

  useEffect(() => {
    if (rowData.projectName && Array.isArray(projectData?.data?.data)) {
      setFormState(prev => ({
        ...prev,
        project: projectData?.data?.data.find(item => item.label === rowData.projectName) || null
      }));
    }
  }, [projectData, rowData.projectName]);

  useEffect(() => {
    if (rowData.projectTypeId && Array.isArray(projectTypeData?.data?.data)) {
      setFormState(prev => ({
        ...prev,
        projectType: projectTypeData?.data?.data.find(item => item.label === rowData.projectTypeId) || null
      }));
    }
  }, [projectTypeData, rowData.projectTypeId]);

  useEffect(() => {
    if (rowData.adminHoldFor && Array.isArray(usersList?.data?.data)) {
      setFormState(prev => ({
        ...prev,
        holdFor: usersList.data.data.find(item => item.value == rowData.adminHoldFor) || null
      }));
    }
  }, [usersList, rowData.adminHoldFor]);

  // Form handlers
  const handleChange = e => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const handleSelectChange = field => selectedOption => {
    setFormState(prev => ({ ...prev, [field]: selectedOption }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleReset = () => {
    navigate('/project-unit-master', {
      state: { unitNo, fromDate, toDate, page, unitGroupSelect, builder, project, area, floor, tower }
    });
  };

  const buildFormParams = (key) => {
    const params = {
      unitNo: formState.unitNo,
      towerBlock: formState.towerBlock,
      floor: formState.floor,
      area: formState.area || "",
      bsp: formState.bsp || "",
      inauguralDiscount: formState.inauguralDiscount || "",
      npv: formState.npv || 0,
      othDicountBuilder: formState.otherDiscount || 0,
      floorPlc: formState.floorPlc || "",
      facingPlc: formState.facingPlc || "",
      otherViewPlc: formState.otherViewPlc || 0,
      carParking: formState.parking,
      clubMembership: formState.clubMembership || "",
      powerBackupCharges: formState.powerBackup || 0,
      ifmsAfterDiscount: formState.ifms,
      leaseRentAfterDiscount: formState.leaseRent,
      esscPer: formState.essc,
      crfPer: formState.crf,
      edcIdc: formState.edcIdc,
      eecFfc: formState.eecFfc,
      terrageGarden: formState.terraceGarden,
      facilities: formState.facilities,
      maintenance: formState.maintenance,
      meter: formState.meter,
      miscellaneous: 0,
      otherCharges: formState.otherCharges,
      netCost: parseFloat(formState.netUnitCost) || 0,
      gstPercent: formState.gstPercent || "",
      gstAmount: parseFloat(formState.gstAmount) || 0,
      netCostWithGst: parseFloat(formState.totalUnitCost) || 0,
      development: formState.development,
      validTill: formState.validTillDate,
      holdBy: '',
      revenueId: 0,
      totalOtherCharge: parseFloat(formState.totalOtherCharges) || 0,
      otherChargeGstRate: parseFloat(formState.otherChargeGstRate) || 0,
      otherChargeGstAmt: parseFloat(formState.gstAmountOnOtherCharges) || 0,
      totalOtherchargeWithGst: parseFloat(formState.totalOtherchargeWithGst) || 0,
      totalGstAmount: parseFloat(formState.totalGstAmt) || 0,
      unitMapRevenueStatus: 0,
      unitHoldDate: '',
      holdRemarks: formState.holdRemarks,
      holdResetHours: 0,
      createdBy: '',
      createdDate: '',
      modifyBy: '',
      modifyDate: '',
      adminHoldFor: "",
      adminHoldDate: "",
      clientName: formState?.clientName,
      projectTypeId: formState?.projectType?.value,
      possessionCharges: formState?.possessionCharges || 0
    };

    // Conditionally add builder and project fields based on `key === 'add'`
    if (key === 'Add') {
      params.builderName = formState.builder?.label || '';
      params.builderMasterId = formState.builder?.value || '';
      params.projectName = formState.project?.label || '';
      params.projectNameId = formState.project?.value || '';
      params.netBsp = parseFloat(formState.netBsp) || 0;
      params.unitStatus = formState.unitStatus?.value || '';
      params.projectUnitId = rowData.projectUnitId || 0;
      params.netBspArea = parseFloat(formState.netBspArea) || 0
    } else {
      params.builderId = formState.builder?.value;
      params.projectId = formState.project?.value;
      params.projectUnitid = rowData.projectUnitId || 0;
      params.totalAreaBsp = parseFloat(formState.netBspArea) || 0

    }

    // Additional field if needed for `adminHoldFor`
    if (formState.holdFor) {
      params.adminHoldFor = formState.holdFor?.value || '';
    }

    return params;
  };

  // API mutations
  const { mutate: mutateCalculate } = usePost(CALCULATE_PROJECT_UNIT, {
    onSuccess: response => {
      if (response?.data.status === 1) {
        const calcData = response.data.data;
        setFormState(prev => ({
          ...prev,
          netBsp: calcData.netBsp,
          netBspArea: calcData.netBspArea,
          netUnitCost: calcData.netCost,
          gstAmount: calcData.gstAmount,
          totalOtherCharges: calcData.totalOtherCharge,
          gstAmountOnOtherCharges: calcData.otherChargeGstAmt,
          totalOtherchargeWithGst: calcData.totalOtherchargeWithGst,
          totalGstAmt: calcData.totalGstAmount,
          totalUnitCost: calcData.netCostWithGst
        }));
      } else {
        toast.error(response.data.message);
      }
    },
    onError: err => toast.error(err.message)
  });

  const { isPending: saveLoading, mutate: saveMutate } = usePost(
    `${SAVE_CALCULATE_PROJECT_UNIT}?loginId=${userId}`,
    {
      onSuccess: response => {
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          handleReset();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: err => toast.error(err.message)
    }
  );

  const { isPending: updateLoading, mutate: updateMutate } = usePut(
    `${UPDATE_CALCULATE_PROJECT_UNIT}${userId}`,
    {
      onSuccess: response => {
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          handleReset();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: err => toast.error(err.message)
    }
  );

  // Form submission
  const handleSubmit = e => {
    e.preventDefault();
    const requiredFields = [
      'validTillDate',
      'builder',
      'project',
      'projectType',
      'unitNo',
      'towerBlock',
      'floor',
      'area',
      'bsp',
      'unitStatus'
    ];

    const validationErrors = requiredFields.reduce((acc, field) => {
      if (!formState[field]) {
        acc[field] = 'This field is required.';
      }
      return acc;
    }, {});

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      toast.error('Some mandatory fields are not filled');
      return;
    }

    const params = buildFormParams('Add');
    if (Object.keys(rowData).length) {
      updateMutate(params);
    } else {
      saveMutate(params);
    }
  };

  const handleCalculateCost = (type) => {
    if (type === 'final') {
      setShowFinalSave(true)
    }
    mutateCalculate(buildFormParams('Calculate'));
  };

  // Form field configurations
  const formFields = [
    { id: 'validTillDate', label: 'Valid Till Date', type: 'date', required: true },
    { id: 'builder', label: 'Select Builder', type: 'select', options: builderList?.data?.data, disabled: !!Object.keys(rowData).length, required: true },
    { id: 'project', label: 'Select Project', type: 'select', options: projectData?.data?.data, disabled: !formState.builder || !!Object.keys(rowData).length, required: true },
    { id: 'projectType', label: 'Project Unit Type', type: 'select', options: projectTypeData?.data?.data, disabled: !formState.project, required: true },
    { id: 'unitNo', label: 'Unit No', type: 'text', placeholder: 'Unit Number', required: true },
    { id: 'towerBlock', label: 'Tower/Block', type: 'text', placeholder: 'Tower/Block', required: true },
    { id: 'floor', label: 'Floor', type: 'text', placeholder: 'Floor', required: true },
    { id: 'area', label: 'Area', type: 'text', placeholder: 'Area', required: true },
    { id: 'bsp', label: 'BSP', type: 'text', placeholder: 'BSP', onBlur: handleCalculateCost, required: true },
    { id: 'inauguralDiscount', label: 'Inaugural Discount', type: 'text', placeholder: 'Inaugural Discount', onBlur: handleCalculateCost },
    { id: 'npv', label: 'NPV', type: 'text', placeholder: 'NPV', onBlur: handleCalculateCost },
    { id: 'otherDiscount', label: 'Other Discount', type: 'text', placeholder: 'Other Discount', onBlur: handleCalculateCost },
    { id: 'netBsp', label: 'Net BSP', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.netBsp) },
    { id: 'netBspArea', label: 'Net BSP Area', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.netBspArea) },
    { id: 'gstPercent', label: 'GST %', type: 'text', placeholder: 'GST %', onBlur: handleCalculateCost },
    { id: 'gstAmount', label: 'GST Amount', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.gstAmount) },
    { id: 'netUnitCost', label: 'Net Unit Cost', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.netUnitCost) },
    { id: 'floorPlc', label: 'Floor PLC', type: 'text', placeholder: 'Floor PLC', onBlur: handleCalculateCost },
    { id: 'facingPlc', label: 'Facing PLC', type: 'text', placeholder: 'Facing PLC', onBlur: handleCalculateCost },
    { id: 'otherViewPlc', label: 'Other View PLC', type: 'text', placeholder: 'Other View PLC', onBlur: handleCalculateCost },
    { id: 'parking', label: 'Parking', type: 'text', placeholder: 'Parking', onBlur: handleCalculateCost },
    { id: 'clubMembership', label: 'Club Membership', type: 'text', placeholder: 'Club Membership', onBlur: handleCalculateCost },
    { id: 'powerBackup', label: 'Power Backup', type: 'text', placeholder: 'Power Backup', onBlur: handleCalculateCost },
    { id: 'ifms', label: 'IFMS', type: 'text', placeholder: 'IFMS', onBlur: handleCalculateCost },
    { id: 'leaseRent', label: 'Lease Rent', type: 'text', placeholder: 'Lease Rent', onBlur: handleCalculateCost },
    { id: 'essc', label: 'ESSC', type: 'text', placeholder: 'ESSC', onBlur: handleCalculateCost },
    { id: 'crf', label: 'CRF', type: 'text', placeholder: 'CRF', onBlur: handleCalculateCost },
    { id: 'edcIdc', label: 'EDC/IDC', type: 'text', placeholder: 'EDC/IDC', onBlur: handleCalculateCost },
    { id: 'eecFfc', label: 'EEC/FFC', type: 'text', placeholder: 'EEC/FFC', onBlur: handleCalculateCost },
    { id: 'terraceGarden', label: 'Terrace/Garden', type: 'text', placeholder: 'Terrace/Garden', onBlur: handleCalculateCost },
    { id: 'development', label: 'Development', type: 'text', placeholder: 'Development', onBlur: handleCalculateCost },
    { id: 'facilities', label: 'Facilities', type: 'text', placeholder: 'Facilities', onBlur: handleCalculateCost },
    { id: 'maintenance', label: 'Maintenance', type: 'text', placeholder: 'Maintenance', onBlur: handleCalculateCost },
    { id: 'meter', label: 'Meter', type: 'text', placeholder: 'Meter', onBlur: handleCalculateCost },
    { id: 'otherCharges', label: 'Other Charges', type: 'text', placeholder: 'Other Charges', onBlur: handleCalculateCost },

    { id: 'possessionCharges', label: 'Possession Charges', type: 'text', placeholder: 'Possession Charges', onBlur: handleCalculateCost },

    { id: 'totalOtherCharges', label: 'Total Other Charges', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalOtherCharges) },
    { id: 'otherChargeGstRate', label: 'GST% On Other Charges', type: 'text', placeholder: 'GST% On Other Charges', onBlur: handleCalculateCost },
    { id: 'gstAmountOnOtherCharges', label: 'GST Amount On Other Charges', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.gstAmountOnOtherCharges) },
    { id: 'totalOtherchargeWithGst', label: 'Total Other Charges With GST', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalOtherchargeWithGst) },
    { id: 'totalGstAmt', label: 'Total GST Amt', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalGstAmt) },
    { id: 'totalUnitCost', label: 'Total Unit Cost', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalUnitCost) },
    { id: 'unitStatus', label: 'Unit Status', type: 'select', options: unitStatusOptions, required: true },
    { id: 'holdFor', label: 'Hold For', type: 'select', options: usersList?.data?.data },
    { id: 'clientName', label: 'Client Name', type: 'text', placeholder: 'Client Name' },
    { id: 'holdRemarks', label: 'Remarks', type: 'textarea', placeholder: 'Enter Remarks', rows: 4 }
  ];

  return (
    <PageContent>
      <Breadcrumbs title={(Object.keys(rowData).length) > 0 ? 'Update' : 'Add'} breadcrumbItem="Unit Master" />
      {(saveLoading || updateLoading) && <ScreenLoader />}
      <Container fluid>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardBody>
              {[
                formFields.slice(0, 17),
                formFields.slice(17, 39),
                formFields.slice(39)
              ].map((fieldGroup, index) => (
                <React.Fragment key={index}>
                  <Row>
                    {fieldGroup.map(field => (
                      <Col md={field.id === 'holdRemarks' ? 6 : 3} key={field.id} className="g-3">
                        <h6 className="font-size-11">
                          {field.label}
                          {field.required && <RequiredStar />}
                        </h6>
                        {field.type === 'select' ? (
                          <Select
                            isClearable
                            value={formState[field.id]}
                            onChange={handleSelectChange(field.id)}
                            options={field.options || []}
                            isDisabled={field.disabled}
                            className={errors[field.id] ? 'is-invalid' : ''}
                          />
                        ) : field.type === 'textarea' ? (
                          <textarea
                            id={field.id}
                            className="form-control"
                            placeholder={field.placeholder}
                            value={formState[field.id]}
                            rows={field.rows}
                            onChange={handleChange}
                          />
                        ) : (
                          <input
                            id={field.id}
                            type={field.type}
                            className={`form-control ${errors[field.id] ? 'is-invalid' : ''}`}
                            placeholder={field.placeholder}
                            value={field.value !== undefined ? field.value : formState[field.id]}
                            onChange={handleChange}
                            onBlur={field.onBlur}
                            readOnly={field.readOnly}
                            style={field.readOnly ? { backgroundColor: defaultTheme.btnDisable } : undefined}
                          />
                        )}
                        {errors[field.id] && (
                          <div className="invalid-feedback font-size-11">{errors[field.id]}</div>
                        )}
                      </Col>
                    ))}
                  </Row>
                  {index < 2 && <hr className="dashed-divider" />}
                </React.Fragment>
              ))}
              <div className="mt-4 d-flex justify-content-center">
                <button type="button" className="btn btn-primary" onClick={() => handleCalculateCost('final')}>Calculate</button>
                <button
                  type={showFinalSave ? 'submit' : 'button'}
                  className="btn btn-primary me-2 ms-2"
                  title={!showFinalSave ? "Please complete the necessary calculations first." : ""}
                  style={{ cursor: !showFinalSave ? "not-allowed" : "pointer", opacity: !showFinalSave ? 0.6 : 1, }}
                >
                  {(Object.keys(rowData).length) > 0 ? 'Update' : 'Save'}
                </button>
                {/* <button type="submit" className="btn btn-primary me-2 ms-2" disabled={!showFinalSave}>{(Object.keys(rowData).length) > 0 ? 'Update' : 'Save'}</button> */}
                <button type="button" className="btn btn-secondary" onClick={handleReset}>Cancel</button>
              </div>
            </CardBody>
          </Card>
        </form>
      </Container>
    </PageContent>
  );
};

export default CreateProjectUnitMaster;