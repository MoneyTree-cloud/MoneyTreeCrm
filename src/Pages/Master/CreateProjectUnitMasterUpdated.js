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
import {
    GET_ALL_USERS_DROPDOWN,
    GET_DROPDOWN_BUILDER_,
    GET_PROJECT_BY_BUILDER_,
    GET_PROJECT_TYPE_DROPDOWN,
    SAVE_CALCULATE_PROJECT_UNIT,
    UPDATE_CALCULATE_PROJECT_UNIT
} from '../../helpers/url_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { roundToTwoDecimals } from '../../helpers/function_helper';

// Helper function to safely parse float values
const safeParseFloat = (value) => isNaN(parseFloat(value)) ? 0 : parseFloat(value);

const INITIAL_STATE = {
    builder: null,
    project: null,
    projectType: null,
    unitNo: '',
    tower: '',
    block: '',
    floor: '',
    area: '',
    bsp: 0,
    inauguralDiscount: 0,
    npv: 0,
    onFormDiscount: 0,
    netBsp: 0,
    netBspCost: 0,
    gstPercent: 0,
    gstAmountOnBsp: 0,
    netBspCostWithGst: 0,
    floorPlc: 0,
    floorPlcGstPercent: 0,
    viewPlc: 0,
    viewPlcGstPercent: 0,
    otherViewPlc: 0,
    otherViewPlcGstPercent: 0,
    parking: 0,
    parkingGstPercent: 0,
    clubMembership: 0,
    clubMembershipGstPercent: 0,
    powerBackup: 0,
    powerBackupGstPercent: 0,
    leaseRent: 0,
    leaseRentGstPercent: 0,
    essc: 0,
    esscGstPercent: 0,
    crf: 0,
    crfGstPercent: 0,
    edcIdc: 0,
    edcIdcGstPercent: 0,
    eecFfc: 0,
    eecFfcGstPercent: 0,
    terraceGarden: 0,
    terraceGardenGstPercent: 0,
    development: 0,
    developmentGstPercent: 0,
    facilities: 0,
    facilitiesGstPercent: 0,
    maintenance: 0,
    maintenanceGstPercent: 0,
    meter: 0,
    meterGstPercent: 0,
    miscellaneousCharges: 0,
    miscellaneousChargesGstPercent: 0,
    otherIfAny: 0,
    otherIfAnyGstPercent: 0,
    ifms: 0,
    ifmsGstPercent: 0,
    totalOtherCharges: 0,
    gstAmountOnOtherCharges: 0,
    totalOtherchargeWithGst: 0,
    totalGstAmountOnUnit: 0,
    totalUnitCostWithoutGst: 0,
    totalUnitCostWithGst: 0,
    unitStatus: null,
    holdFor: null,
    clientName: '',
    holdRemarks: ''
};

const CreateProjectUnitMasterCorrected = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { row: rowData = {}, unitNo, fromDate, toDate, page, unitGroupSelect, builder, project } = state || {};
    const userId = useUserStore(state => state.user.userId);
    const empCode = useUserStore(state => state.user.empCode);

    const [formState, setFormState] = useState(INITIAL_STATE);
    const [errors, setErrors] = useState({});

    // API hooks
    const { data: usersList } = useGet(GET_ALL_USERS_DROPDOWN);
    const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_);
    
    const { data: projectData } = useGet(
        `${GET_PROJECT_BY_BUILDER_}${formState.builder?.value || ''}`,
        { enabled: Boolean(formState.builder) }
    );

    const { data: projectTypeData } = useGet(
        `${GET_PROJECT_TYPE_DROPDOWN}${formState.builder?.label || ''}&projectName=${formState.project?.label || ''}`,
        { enabled: Boolean(formState.project) }
    );

    const unitStatusOptions = useMemo(() => {
        const baseOptions = [
            { label: 'Admin Pre Sold', value: 'adminPreSold' },
            { label: 'Block', value: 'block' },
            { label: 'Hold', value: 'hold' },
            { label: 'Open', value: 'open' },
            { label: 'Pre Sold', value: 'preSold' },
        ];
        return empCode === '1' ? [...baseOptions, { label: 'Sold', value: 'sold' }] : baseOptions;
    }, [empCode]);

    // Initialize form state from rowData
    useEffect(() => {
        if (Object.keys(rowData).length) {
            const totalUnitCostWithoutGst = safeParseFloat(rowData.netCost) + safeParseFloat(rowData.totalOtherCharge);
            setFormState({
                ...INITIAL_STATE,
                unitNo: rowData.unitNo || '',
                tower: rowData.towerBlock ? rowData.towerBlock : '',
                block: rowData.towerBlock ? rowData.towerBlock : '',
                floor: rowData.floor || '',
                area: rowData.area || '',
                bsp: roundToTwoDecimals(rowData.bsp) || '',
                inauguralDiscount: rowData.inauguralDiscount || '',
                npv: rowData.npv || '',
                onFormDiscount: rowData.othDicountBuilder || '',
                netBsp: rowData.netBsp || 0,
                netBspCost: rowData.totalAreaBsp || 0,
                gstPercent: rowData.gstPercent || '',
                gstAmountOnBsp: rowData.gstAmount || 0,
                netBspCostWithGst: rowData.netCost || 0,
                floorPlc: rowData.floorPlc || '',
                floorPlcGstPercent: rowData.gstPercentPlc || '',
                viewPlc: rowData.facingPlc || '',
                viewPlcGstPercent: rowData.gstPercentPlc || '',
                otherViewPlc: rowData.otherViewPlc || '',
                otherViewPlcGstPercent: rowData.gstPercentPlc || '',
                parking: rowData.carParking || '',
                parkingGstPercent: rowData.otherChargeGstRate || '',
                clubMembership: rowData.clubMembership || '',
                clubMembershipGstPercent: rowData.otherChargeGstRate || '',
                powerBackup: rowData.powerBackupCharges || '',
                powerBackupGstPercent: rowData.otherChargeGstRate || '',
                leaseRent: rowData.leaseRentAfterDiscount || '',
                leaseRentGstPercent: rowData.otherChargeGstRate || '',
                essc: rowData.esscPer || '',
                esscGstPercent: rowData.otherChargeGstRate || '',
                crf: rowData.crfPer || '',
                crfGstPercent: rowData.otherChargeGstRate || '',
                edcIdc: rowData.edcIdc || '',
                edcIdcGstPercent: rowData.otherChargeGstRate || '',
                eecFfc: rowData.eecFfc || '',
                eecFfcGstPercent: rowData.otherChargeGstRate || '',
                terraceGarden: rowData.terrageGarden || '',
                terraceGardenGstPercent: rowData.otherChargeGstRate || '',
                development: rowData.development || '',
                developmentGstPercent: rowData.otherChargeGstRate || '',
                facilities: rowData.facilities || '',
                facilitiesGstPercent: rowData.otherChargeGstRate || '',
                maintenance: rowData.maintenance || '',
                maintenanceGstPercent: rowData.otherChargeGstRate || '',
                meter: rowData.meter || '',
                meterGstPercent: rowData.otherChargeGstRate || '',
                miscellaneousCharges: rowData.miscellaneousCharges || '',
                miscellaneousChargesGstPercent: rowData.otherChargeGstRate || '',
                otherIfAny: rowData.otherCharges || '',
                otherIfAnyGstPercent: rowData.otherChargeGstRate || '',
                ifms: rowData.ifmsAfterDiscount || '',
                ifmsGstPercent: rowData.gstPercentSectionD || '',
                totalOtherCharges: rowData.totalOtherCharge || 0,
                gstAmountOnOtherCharges: rowData.otherChargeGstAmt || 0,
                totalOtherchargeWithGst: rowData.totalOtherchargeWithGst || 0,
                totalGstAmountOnUnit: rowData.totalGstAmount || 0,
                totalUnitCostWithoutGst: roundToTwoDecimals(totalUnitCostWithoutGst),
                totalUnitCostWithGst: rowData.netCostWithGst || 0,
                unitStatus: unitStatusOptions.find(item => item.value === rowData.unitStatus) || null,
                clientName: rowData.clientName || '',
                holdRemarks: rowData.holdRemarks || ''
            });
        }
    }, [rowData, unitStatusOptions]);

    // Set dropdown values from rowData
    useEffect(() => {
        if (rowData.builderName && builderList?.data?.data) {
            setFormState(prev => ({
                ...prev,
                builder: builderList.data.data.find(item => item.label === rowData.builderName) || null
            }));
        }
    }, [builderList, rowData.builderName]);

    useEffect(() => {
        if (rowData.projectName && projectData?.data?.data) {
            setFormState(prev => ({
                ...prev,
                project: projectData.data.data.find(item => item.label === rowData.projectName) || null
            }));
        }
    }, [projectData, rowData.projectName]);

    useEffect(() => {
        if (rowData.projectTypeId && projectTypeData?.data?.data) {
            setFormState(prev => ({
                ...prev,
                projectType: projectTypeData.data.data.find(item => item.label === rowData.projectTypeId) || null
            }));
        }
    }, [projectTypeData, rowData.projectTypeId]);

    useEffect(() => {
        if (rowData.adminHoldFor && usersList?.data?.data) {
            setFormState(prev => ({
                ...prev,
                holdFor: usersList.data.data.find(item => item.value.toString() === rowData.adminHoldFor) || null
            }));
        }
    }, [usersList, rowData.adminHoldFor]);

    // Form handlers
    const handleChange = e => {
        const { id, value } = e.target;
        const numericFields = [
            'area', 'bsp', 'inauguralDiscount', 'npv', 'onFormDiscount', 'gstPercent',
            'floorPlc', 'floorPlcGstPercent', 'viewPlc', 'viewPlcGstPercent',
            'otherViewPlc', 'otherViewPlcGstPercent', 'parking', 'parkingGstPercent',
            'clubMembership', 'clubMembershipGstPercent', 'powerBackup', 'powerBackupGstPercent',
            'leaseRent', 'leaseRentGstPercent', 'essc', 'esscGstPercent', 'crf', 'crfGstPercent',
            'edcIdc', 'edcIdcGstPercent', 'eecFfc', 'eecFfcGstPercent', 'terraceGarden',
            'terraceGardenGstPercent', 'development', 'developmentGstPercent', 'facilities',
            'facilitiesGstPercent', 'maintenance', 'maintenanceGstPercent', 'meter',
            'meterGstPercent', 'miscellaneousCharges', 'miscellaneousChargesGstPercent',
            'otherIfAny', 'otherIfAnyGstPercent', 'ifms', 'ifmsGstPercent'
        ];
        const chargeToGstMap = {
            floorPlc: 'floorPlcGstPercent',
            viewPlc: 'viewPlcGstPercent',
            otherViewPlc: 'otherViewPlcGstPercent',
            parking: 'parkingGstPercent',
            clubMembership: 'clubMembershipGstPercent',
            powerBackup: 'powerBackupGstPercent',
            leaseRent: 'leaseRentGstPercent',
            essc: 'esscGstPercent',
            crf: 'crfGstPercent',
            edcIdc: 'edcIdcGstPercent',
            eecFfc: 'eecFfcGstPercent',
            terraceGarden: 'terraceGardenGstPercent',
            development: 'developmentGstPercent',
            facilities: 'facilitiesGstPercent',
            maintenance: 'maintenanceGstPercent',
            meter: 'meterGstPercent',
            miscellaneousCharges: 'miscellaneousChargesGstPercent',
            otherIfAny: 'otherIfAnyGstPercent',
            ifms: 'ifmsGstPercent'
        };

        // const newValue = numericFields.includes(id) ? (value === '' ? '' : safeParseFloat(value)) : value;
        const newValue = numericFields.includes(id) ? (value === '' ? '' : value) : value;
        let updatedState = { [id]: newValue };

        // Reset GST % to 0 if charge is 0
        if (Object.keys(chargeToGstMap).includes(id) && safeParseFloat(value) === 0) {
            updatedState[chargeToGstMap[id]] = 0;
        }

        setFormState(prev => ({ ...prev, ...updatedState }));
        setErrors(prev => ({ ...prev, [id]: '' }));
    };

    const handleSelectChange = field => selectedOption => {
        setFormState(prev => ({ ...prev, [field]: selectedOption }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleReset = () => {
        navigate('/project-unit-master', {
            state: { unitNo, fromDate, toDate, page, unitGroupSelect, builder, project }
        });
    };

    // Frontend calculation logic
    const handleCalculateCost = () => {
        const area = safeParseFloat(formState.area);
        const bsp = safeParseFloat(formState.bsp);
        const inauguralDiscount = safeParseFloat(formState.inauguralDiscount);
        const npv = safeParseFloat(formState.npv);
        const onFormDiscount = safeParseFloat(formState.onFormDiscount);
        const gstPercent = safeParseFloat(formState.gstPercent);
        const floorPlc = safeParseFloat(formState.floorPlc);
        const floorPlcGstPercent = safeParseFloat(formState.floorPlcGstPercent);
        const viewPlc = safeParseFloat(formState.viewPlc);
        const viewPlcGstPercent = safeParseFloat(formState.viewPlcGstPercent);
        const otherViewPlc = safeParseFloat(formState.otherViewPlc);
        const otherViewPlcGstPercent = safeParseFloat(formState.otherViewPlcGstPercent);
        const parking = safeParseFloat(formState.parking);
        const parkingGstPercent = safeParseFloat(formState.parkingGstPercent);
        const clubMembership = safeParseFloat(formState.clubMembership);
        const clubMembershipGstPercent = safeParseFloat(formState.clubMembershipGstPercent);
        const powerBackup = safeParseFloat(formState.powerBackup);
        const powerBackupGstPercent = safeParseFloat(formState.powerBackupGstPercent);
        const leaseRent = safeParseFloat(formState.leaseRent);
        const leaseRentGstPercent = safeParseFloat(formState.leaseRentGstPercent);
        const essc = safeParseFloat(formState.essc);
        const esscGstPercent = safeParseFloat(formState.esscGstPercent);
        const crf = safeParseFloat(formState.crf);
        const crfGstPercent = safeParseFloat(formState.crfGstPercent);
        const edcIdc = safeParseFloat(formState.edcIdc);
        const edcIdcGstPercent = safeParseFloat(formState.edcIdcGstPercent);
        const eecFfc = safeParseFloat(formState.eecFfc);
        const eecFfcGstPercent = safeParseFloat(formState.eecFfcGstPercent);
        const terraceGarden = safeParseFloat(formState.terraceGarden);
        const terraceGardenGstPercent = safeParseFloat(formState.terraceGardenGstPercent);
        const development = safeParseFloat(formState.development);
        const developmentGstPercent = safeParseFloat(formState.developmentGstPercent);
        const facilities = safeParseFloat(formState.facilities);
        const facilitiesGstPercent = safeParseFloat(formState.facilitiesGstPercent);
        const maintenance = safeParseFloat(formState.maintenance);
        const maintenanceGstPercent = safeParseFloat(formState.maintenanceGstPercent);
        const meter = safeParseFloat(formState.meter);
        const meterGstPercent = safeParseFloat(formState.meterGstPercent);
        const miscellaneousCharges = safeParseFloat(formState.miscellaneousCharges);
        const miscellaneousChargesGstPercent = safeParseFloat(formState.miscellaneousChargesGstPercent);
        const otherIfAny = safeParseFloat(formState.otherIfAny);
        const otherIfAnyGstPercent = safeParseFloat(formState.otherIfAnyGstPercent);
        const ifms = safeParseFloat(formState.ifms);
        const ifmsGstPercent = safeParseFloat(formState.ifmsGstPercent);

        const netBsp = bsp - (inauguralDiscount + npv + onFormDiscount);
        const netBspCost = netBsp * area;
        const gstAmountOnBsp = (netBspCost * gstPercent) / 100;
        const netBspCostWithGst = netBspCost + gstAmountOnBsp;

        const totalOtherCharges = (
            floorPlc + viewPlc + otherViewPlc + parking + clubMembership + powerBackup +
            leaseRent + essc + crf + edcIdc + eecFfc + terraceGarden + development +
            facilities + maintenance + meter + miscellaneousCharges + otherIfAny + ifms
        );

        const gstAmountOnOtherCharges = (
            (floorPlc > 0 ? (floorPlc * floorPlcGstPercent) / 100 : 0) +
            (viewPlc > 0 ? (viewPlc * viewPlcGstPercent) / 100 : 0) +
            (otherViewPlc > 0 ? (otherViewPlc * otherViewPlcGstPercent) / 100 : 0) +
            (parking > 0 ? (parking * parkingGstPercent) / 100 : 0) +
            (clubMembership > 0 ? (clubMembership * clubMembershipGstPercent) / 100 : 0) +
            (powerBackup > 0 ? (powerBackup * powerBackupGstPercent) / 100 : 0) +
            (leaseRent > 0 ? (leaseRent * leaseRentGstPercent) / 100 : 0) +
            (essc > 0 ? (essc * esscGstPercent) / 100 : 0) +
            (crf > 0 ? (crf * crfGstPercent) / 100 : 0) +
            (edcIdc > 0 ? (edcIdc * edcIdcGstPercent) / 100 : 0) +
            (eecFfc > 0 ? (eecFfc * eecFfcGstPercent) / 100 : 0) +
            (terraceGarden > 0 ? (terraceGarden * terraceGardenGstPercent) / 100 : 0) +
            (development > 0 ? (development * developmentGstPercent) / 100 : 0) +
            (facilities > 0 ? (facilities * facilitiesGstPercent) / 100 : 0) +
            (maintenance > 0 ? (maintenance * maintenanceGstPercent) / 100 : 0) +
            (meter > 0 ? (meter * meterGstPercent) / 100 : 0) +
            (miscellaneousCharges > 0 ? (miscellaneousCharges * miscellaneousChargesGstPercent) / 100 : 0) +
            (otherIfAny > 0 ? (otherIfAny * otherIfAnyGstPercent) / 100 : 0) +
            (ifms > 0 ? (ifms * ifmsGstPercent) / 100 : 0)
        );

        const totalOtherchargeWithGst = totalOtherCharges + gstAmountOnOtherCharges;
        const totalGstAmountOnUnit = gstAmountOnBsp + gstAmountOnOtherCharges;
        const totalUnitCostWithoutGst = netBspCost + totalOtherCharges;
        const totalUnitCostWithGst = totalUnitCostWithoutGst + totalGstAmountOnUnit;

        setFormState(prev => ({
            ...prev,
            netBsp: roundToTwoDecimals(netBsp),
            netBspCost: roundToTwoDecimals(netBspCost),
            gstAmountOnBsp: roundToTwoDecimals(gstAmountOnBsp),
            netBspCostWithGst: roundToTwoDecimals(netBspCostWithGst),
            totalOtherCharges: roundToTwoDecimals(totalOtherCharges),
            gstAmountOnOtherCharges: roundToTwoDecimals(gstAmountOnOtherCharges),
            totalOtherchargeWithGst: roundToTwoDecimals(totalOtherchargeWithGst),
            totalGstAmountOnUnit: roundToTwoDecimals(totalGstAmountOnUnit),
            totalUnitCostWithoutGst: roundToTwoDecimals(totalUnitCostWithoutGst),
            totalUnitCostWithGst: roundToTwoDecimals(totalUnitCostWithGst)
        }));
    };

    const buildFormParams = () => ({
        unitNo: formState.unitNo || '',
        tower: formState.tower || '',
        block: formState.block || '',
        floor: formState.floor || '',
        area: safeParseFloat(formState.area),
        bsp: safeParseFloat(formState.bsp),
        inauguralDiscount: safeParseFloat(formState.inauguralDiscount),
        npv: safeParseFloat(formState.npv),
        othDicountBuilder: safeParseFloat(formState.onFormDiscount),
        terrageGarden: safeParseFloat(formState.terraceGarden),
        totalAreaBsp: safeParseFloat(formState.netBspCost),
        floorPlc: safeParseFloat(formState.floorPlc),
        facingPlc: safeParseFloat(formState.viewPlc),
        otherViewPlc: safeParseFloat(formState.otherViewPlc),
        carParking: safeParseFloat(formState.parking),
        clubMembership: safeParseFloat(formState.clubMembership),
        powerBackupCharges: safeParseFloat(formState.powerBackup),
        ifmsAfterDiscount: safeParseFloat(formState.ifms),
        leaseRentAfterDiscount: safeParseFloat(formState.leaseRent),
        esscPer: safeParseFloat(formState.essc),
        crfPer: safeParseFloat(formState.crf),
        edcIdc: safeParseFloat(formState.edcIdc),
        eecFfc: safeParseFloat(formState.eecFfc),
        facilities: safeParseFloat(formState.facilities),
        maintenance: safeParseFloat(formState.maintenance),
        meter: safeParseFloat(formState.meter),
        miscellaneousCharges: safeParseFloat(formState.miscellaneousCharges),
        otherCharges: safeParseFloat(formState.otherIfAny),
        netCost: safeParseFloat(formState.netBspCostWithGst),
        gstPercent: safeParseFloat(formState.gstPercent),
        gstAmount: safeParseFloat(formState.gstAmountOnBsp),
        netCostWithGst: safeParseFloat(formState.totalUnitCostWithGst),
        development: safeParseFloat(formState.development),
        holdBy: '',
        revenueId: 0,
        totalOtherCharge: safeParseFloat(formState.totalOtherCharges),
        otherChargeGstAmt: safeParseFloat(formState.gstAmountOnOtherCharges),
        totalOtherchargeWithGst: safeParseFloat(formState.totalOtherchargeWithGst),
        totalGstAmount: safeParseFloat(formState.totalGstAmountOnUnit),
        unitMapRevenueStatus: 0,
        unitHoldDate: '',
        holdRemarks: formState.holdRemarks || '',
        holdResetHours: 0,
        createdBy: '',
        createdDate: '',
        modifyBy: '',
        modifyDate: '',
        adminHoldFor: formState.holdFor?.value || '',
        clientName: formState.clientName || '',
        projectTypeId: formState.projectType?.value || '',
        builderName: formState.builder?.label || '',
        builderMasterId: formState.builder?.value || '',
        projectName: formState.project?.label || '',
        projectNameId: formState.project?.value || '',
        netBsp: safeParseFloat(formState.netBsp),
        unitStatus: formState.unitStatus?.value || '',
        projectUnitId: rowData.projectUnitId || 0
    });

    const { isPending: saveLoading, mutate: createUnit } = usePost(
        `${SAVE_CALCULATE_PROJECT_UNIT}?loginId=${userId}`,
        {
            onSuccess: response => {
                if (response?.data?.status === '1') {
                    toast.success(response.data.message);
                    handleReset();
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: err => toast.error(err.message)
        }
    );

    const { isPending: updateLoading, mutate: updateUnit } = usePut(
        `${UPDATE_CALCULATE_PROJECT_UNIT}?loginId=${userId}`,
        {
            onSuccess: response => {
                if (response?.data?.status === '1') {
                    toast.success(response.data.message);
                    handleReset();
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: err => toast.error(err.message)
        }
    );

    const handleSubmit = e => {
        e.preventDefault();
        const requiredFields = [
            'builder', 'project', 'projectType', 'unitNo', 'tower', 'block', 'floor',
            'area', 'bsp', 'unitStatus'
        ];
        const validationErrors = {};
        requiredFields.forEach(field => {
            if (!formState[field] || (typeof formState[field] === 'string' && !formState[field].trim())) {
                validationErrors[field] = 'This field is required.';
            }
        });

        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            toast.error('Some mandatory fields are not filled');
            return;
        }

        const params = buildFormParams();
        if (Object.keys(rowData).length) {
            updateUnit(params);
        } else {
            createUnit(params);
        }
    };

    const formFields = [
        // Part A
        { id: 'builder', label: 'Select Builder', type: 'select', options: builderList?.data?.data || [], disabled: !!Object.keys(rowData).length, required: true },
        { id: 'project', label: 'Select Project', type: 'select', options: projectData?.data?.data || [], disabled: !formState.builder || !!Object.keys(rowData).length, required: true },
        { id: 'projectType', label: 'Select Project Unit Type', type: 'select', options: projectTypeData?.data?.data || [], disabled: !formState.project, required: true },
        { id: 'unitNo', label: 'Unit No', type: 'text', placeholder: 'Unit Number', required: true },
        { id: 'tower', label: 'Tower', type: 'text', placeholder: 'Tower', required: true },
        { id: 'block', label: 'Block', type: 'text', placeholder: 'Block', required: true },
        { id: 'floor', label: 'Floor', type: 'text', placeholder: 'Floor', required: true },
        { id: 'area', label: 'Area', type: 'text', placeholder: 'Area', required: true },
        { id: 'bsp', label: 'BSP', type: 'text', placeholder: 'BSP', onBlur: handleCalculateCost, required: true },
        { id: 'inauguralDiscount', label: 'Inaugural Discount', type: 'text', placeholder: 'Inaugural Discount', onBlur: handleCalculateCost },
        { id: 'npv', label: 'NPV', type: 'text', placeholder: 'NPV', onBlur: handleCalculateCost },
        { id: 'onFormDiscount', label: 'On Form Discount', type: 'text', placeholder: 'On Form Discount', onBlur: handleCalculateCost },
        { id: 'netBsp', label: 'Net BSP', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.netBsp) },
        { id: 'netBspCost', label: 'Net BSP Cost (Without GST)', type: 'text', readOnly: true, required: true, value: roundToTwoDecimals(formState.netBspCost) },
        { id: 'gstPercent', label: 'Net BSP GST %', type: 'text', placeholder: 'Net BSP GST %', onBlur: handleCalculateCost },
        { id: 'gstAmountOnBsp', label: 'GST Amount on BSP', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.gstAmountOnBsp) },
        { id: 'netBspCostWithGst', label: 'Net BSP Cost (With GST)', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.netBspCostWithGst) },

        // Part B
        { id: 'floorPlc', label: 'Floor PLC', type: 'text', placeholder: 'Floor PLC', onBlur: handleCalculateCost },
        { id: 'floorPlcGstPercent', label: 'Floor PLC GST %', type: 'text', placeholder: 'Floor PLC GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.floorPlc) > 0 },
        { id: 'viewPlc', label: 'View PLC', type: 'text', placeholder: 'View PLC', onBlur: handleCalculateCost },
        { id: 'viewPlcGstPercent', label: 'View PLC GST %', type: 'text', placeholder: 'View PLC GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.viewPlc) > 0 },
        { id: 'otherViewPlc', label: 'Other View PLC', type: 'text', placeholder: 'Other View PLC', onBlur: handleCalculateCost },
        { id: 'otherViewPlcGstPercent', label: 'Other View PLC GST %', type: 'text', placeholder: 'Other View PLC GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.otherViewPlc) > 0 },
        { id: 'parking', label: 'Parking', type: 'text', placeholder: 'Parking', onBlur: handleCalculateCost },
        { id: 'parkingGstPercent', label: 'Parking GST %', type: 'text', placeholder: 'Parking GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.parking) > 0 },
        { id: 'clubMembership', label: 'Club Membership', type: 'text', placeholder: 'Club Membership', onBlur: handleCalculateCost },
        { id: 'clubMembershipGstPercent', label: 'Club Membership GST %', type: 'text', placeholder: 'Club Membership GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.clubMembership) > 0 },
        { id: 'powerBackup', label: 'Power Backup', type: 'text', placeholder: 'Power Backup', onBlur: handleCalculateCost },
        { id: 'powerBackupGstPercent', label: 'Power Backup GST %', type: 'text', placeholder: 'Power Backup GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.powerBackup) > 0 },
        { id: 'ifms', label: 'IFMS', type: 'text', placeholder: 'IFMS', onBlur: handleCalculateCost },
        { id: 'ifmsGstPercent', label: 'IFMS GST %', type: 'text', placeholder: 'IFMS GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.ifms) > 0 },
        { id: 'leaseRent', label: 'Lease Rent', type: 'text', placeholder: 'Lease Rent', onBlur: handleCalculateCost },
        { id: 'leaseRentGstPercent', label: 'Lease Rent GST %', type: 'text', placeholder: 'Lease Rent GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.leaseRent) > 0 },
        { id: 'essc', label: 'ESSC', type: 'text', placeholder: 'ESSC', onBlur: handleCalculateCost },
        { id: 'esscGstPercent', label: 'ESSC GST %', type: 'text', placeholder: 'ESSC GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.essc) > 0 },
        { id: 'crf', label: 'CRF', type: 'text', placeholder: 'CRF', onBlur: handleCalculateCost },
        { id: 'crfGstPercent', label: 'CRF GST %', type: 'text', placeholder: 'CRF GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.crf) > 0 },
        { id: 'edcIdc', label: 'EDC/IDC', type: 'text', placeholder: 'EDC/IDC', onBlur: handleCalculateCost },
        { id: 'edcIdcGstPercent', label: 'EDC/IDC GST %', type: 'text', placeholder: 'EDC/IDC GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.edcIdc) > 0 },
        { id: 'eecFfc', label: 'EEC/FFC', type: 'text', placeholder: 'EEC/FFC', onBlur: handleCalculateCost },
        { id: 'eecFfcGstPercent', label: 'EEC/FFC GST %', type: 'text', placeholder: 'EEC/FFC GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.eecFfc) > 0 },
        { id: 'terraceGarden', label: 'Terrace Garden', type: 'text', placeholder: 'Terrace Garden', onBlur: handleCalculateCost },
        { id: 'terraceGardenGstPercent', label: 'Terrace Garden GST %', type: 'text', placeholder: 'Terrace Garden GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.terraceGarden) > 0 },
        { id: 'development', label: 'Development', type: 'text', placeholder: 'Development', onBlur: handleCalculateCost },
        { id: 'developmentGstPercent', label: 'Development GST %', type: 'text', placeholder: 'Development GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.development) > 0 },
        { id: 'facilities', label: 'Facilities', type: 'text', placeholder: 'Facilities', onBlur: handleCalculateCost },
        { id: 'facilitiesGstPercent', label: 'Facilities GST %', type: 'text', placeholder: 'Facilities GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.facilities) > 0 },
        { id: 'maintenance', label: 'Maintenance', type: 'text', placeholder: 'Maintenance', onBlur: handleCalculateCost },
        { id: 'maintenanceGstPercent', label: 'Maintenance GST %', type: 'text', placeholder: 'Maintenance GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.maintenance) > 0 },
        { id: 'meter', label: 'Meter', type: 'text', placeholder: 'Meter', onBlur: handleCalculateCost },
        { id: 'meterGstPercent', label: 'Meter GST %', type: 'text', placeholder: 'Meter GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.meter) > 0 },
        { id: 'miscellaneousCharges', label: 'Miscellaneous Charges', type: 'text', placeholder: 'Miscell. Charges', onBlur: handleCalculateCost },
        { id: 'miscellaneousChargesGstPercent', label: 'Miscellaneous Charges GST %', type: 'text', placeholder: 'Miscellaneous Charges GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.miscellaneousCharges) > 0 },
        { id: 'otherIfAny', label: 'Other if Any', type: 'text', placeholder: 'Other if Any', onBlur: handleCalculateCost },
        { id: 'otherIfAnyGstPercent', label: 'Other if Any GST %', type: 'text', placeholder: 'Other if Any GST %', onBlur: handleCalculateCost, show: safeParseFloat(formState.otherIfAny) > 0 },
        { id: 'totalOtherCharges', label: 'Total Other Charges (Without GST)', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalOtherCharges) },
        { id: 'gstAmountOnOtherCharges', label: 'GST Amount on Other Charges', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.gstAmountOnOtherCharges) },
        { id: 'totalOtherchargeWithGst', label: 'Total Other Charges (With GST)', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalOtherchargeWithGst) },
        { id: 'totalGstAmountOnUnit', label: 'Total GST Amount on Unit', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalGstAmountOnUnit) },

        // Part C
        { id: 'totalUnitCostWithoutGst', label: 'Total Unit Cost (Without GST)', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalUnitCostWithoutGst) },
        { id: 'totalUnitCostWithGst', label: 'Total Unit Cost (With GST)', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalUnitCostWithGst) },
        { id: 'unitStatus', label: 'Unit Status', type: 'select', options: unitStatusOptions, required: true },
        { id: 'holdFor', label: 'Hold For', type: 'select', options: usersList?.data?.data || [] },
        { id: 'clientName', label: 'Client Name', type: 'text', placeholder: 'Client Name' },
        { id: 'holdRemarks', label: 'Remarks', type: 'textarea', placeholder: 'Enter Remarks', rows: 3 }
    ];

    return (
        <PageContent>
            <Breadcrumbs title={Object.keys(rowData).length > 0 ? 'Update' : 'Add'} breadcrumbItem="Unit Master" />
            {(saveLoading || updateLoading) && <ScreenLoader />}
            <Container fluid>
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardBody>
                            {[
                                { title: 'Part A', fields: formFields.slice(0, 17) },
                                { title: 'Part B', fields: formFields.slice(17, 58) },
                                { title: 'Part C', fields: formFields.slice(58) }
                            ].map((section, index) => (
                                <React.Fragment key={index}>
                                    <h5 className="mb-3">{section.title}</h5>
                                    <Row className='align-items-end'>
                                        {section.fields.map(field => (
                                            (field.show === undefined || field.show) && (
                                                // <Col md={field.id === 'holdRemarks' ? 6 : field.type === 'select' ? '3' : 2} key={field.id} className="mb-3">
                                                <Col md={field.id === 'holdRemarks' ? 4 : 2} key={field.id} className="mb-3">
                                                    <h6 className="mb-1 font-size-11" style={{ wordWrap: 'break-word', color: field.label.includes('GST %') ? defaultTheme.btnEnable : null, fontWeight: field.label.includes('GST %') ? 'bolder' : null }} >
                                                        {field.label}
                                                        {field.required && <span style={{ color: 'red' }}>*</span>}
                                                    </h6>
                                                    {field.type === 'select' ? (
                                                        <Select
                                                            id={field.id}
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
                                            )
                                        ))}
                                    </Row>
                                    {index < 2 && <hr className="dashed-divider" />}
                                </React.Fragment>
                            ))}
                            <div className="mt-4 d-flex justify-content-center">
                                <button type="submit" className="btn btn-primary">{Object.keys(rowData).length > 0 ? 'Update' : 'Save'}</button>
                                <button type="button" className="btn btn-secondary ms-2" onClick={handleReset}>
                                    Cancel
                                </button>
                            </div>
                        </CardBody>
                    </Card>
                </form>
            </Container>
        </PageContent>
    );
};

export default CreateProjectUnitMasterCorrected;