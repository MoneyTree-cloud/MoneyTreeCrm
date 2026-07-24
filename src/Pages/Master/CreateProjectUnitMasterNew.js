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

const INITIAL_STATE = {
    validTillDate: '',
    builder: null,
    project: null,
    projectType: null,
    unitNo: '',
    towerBlock: '',
    floor: '',
    area: '',
    bsp: '',
    inauguralDiscount: '',
    npv: '',
    otherDiscount: '',
    netBsp: 0,
    netBspArea: 0,
    gstPercent: '',
    gstAmount: 0,
    netUnitCost: 0,
    floorPlc: '',
    facingPlc: '',
    otherViewPlc: '',
    totalPlcWithoutGst: 0,
    gstPercentPlc: '',
    totalPlcGstAmt: 0,
    totalPlcWithGst: 0,
    parking: '',
    clubMembership: '',
    powerBackup: '',
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
    totalOtherCharges: 0,
    ifms: '',
    stampDuty: '',
    totalWithoutGst: 0,
    gstPercentSectionD: '',
    gstAmountSectionD: 0,
    totalWithGst: 0,
    totalGstPercent: 0,
    totalGstAmt: 0,
    totalUnitCost: 0,
    totalUnitCostWithoutGst: 0,
    unitStatus: null,
    holdFor: null,
    clientName: '',
    holdRemarks: '',
    totalOtherchargeWithGst: 0,
    otherChargeGstRate: '',
    gstAmountOnOtherCharges: 0
};

const CreateProjectUnitMasterNew = () => {
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
        `${GET_PROJECT_BY_BUILDER_}${formState.builder?.value}`,
        { enabled: Boolean(formState.builder) }
    );
    const { data: projectTypeData } = useGet(
        `${GET_PROJECT_TYPE_DROPDOWN}${formState.builder?.label}&projectName=${formState.project?.label}`,
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

        if (empCode === "1") {
            return [...baseOptions, { label: 'Sold', value: 'sold' }];
        }

        return baseOptions;
    }, [empCode]);

    // Initialize form state from rowData
    useEffect(() => {
        if (Object.keys(rowData).length) {
            const totalBaseAmount = (
                (parseFloat(rowData.totalAreaBsp) || 0) +
                (parseFloat(rowData.totalPlcWithoutGst) || 0) +
                (parseFloat(rowData.totalOtherCharge) || 0)
            );
            const totalGstAmount = (
                (parseFloat(rowData.gstAmount) || 0) +
                (parseFloat(rowData.totalPlcGstAmt) || 0) +
                (parseFloat(rowData.otherChargeGstAmt) || 0)
            );
            const totalGstPercent = totalBaseAmount > 0 ? (totalGstAmount / totalBaseAmount) * 100 : 0;

            const totalUnitCostWithoutGst = (
                (parseFloat(rowData.netCost) || 0) - (parseFloat(rowData.gstAmount) || 0) +
                (parseFloat(rowData.totalPlcWithoutGst) || 0) +
                (parseFloat(rowData.totalOtherCharge) || 0) +
                ((parseFloat(rowData.ifmsAfterDiscount) || 0) + (parseFloat(rowData.stampDuty) || 0))
            );

            setFormState({
                ...INITIAL_STATE,
                validTillDate: rowData.createdDate?.split(' ')[0] || '',
                unitNo: rowData.unitNo || '',
                towerBlock: rowData.towerBlock || '',
                floor: rowData.floor || '',
                area: rowData.area || '',
                bsp: rowData.bsp || '',
                inauguralDiscount: rowData.inauguralDiscount || '',
                npv: rowData.npv || '',
                otherDiscount: rowData.othDicountBuilder || '',
                netBsp: rowData.netBsp || 0,
                netBspArea: rowData.totalAreaBsp || 0,
                gstPercent: rowData.gstPercent || '',
                gstAmount: rowData.gstAmount || 0,
                netUnitCost: rowData.netCost || 0,
                floorPlc: rowData.floorPlc || '',
                facingPlc: rowData.facingPlc || '',
                otherViewPlc: rowData.otherViewPlc || '',
                totalPlcWithoutGst: rowData.totalPlcWithoutGst || 0,
                gstPercentPlc: rowData.gstPercentPlc || '',
                totalPlcGstAmt: rowData.totalPlcGstAmt || 0,
                totalPlcWithGst: rowData.totalPlcWithGst || 0,
                parking: rowData.carParking || '',
                clubMembership: rowData.clubMembership || '',
                powerBackup: rowData.powerBackupCharges || '',
                ifms: rowData.ifmsAfterDiscount || '',
                stampDuty: rowData.stampDuty || '',
                totalWithoutGst: ((parseFloat(rowData.ifmsAfterDiscount) || 0) + (parseFloat(rowData.stampDuty) || 0)),
                gstPercentSectionD: '',
                gstAmountSectionD: 0,
                totalWithGst: ((parseFloat(rowData.ifmsAfterDiscount) || 0) + (parseFloat(rowData.stampDuty) || 0)),
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
                totalOtherCharges: rowData.totalOtherCharge || 0,
                totalGstPercent: roundToTwoDecimals(totalGstPercent),
                totalGstAmt: rowData.totalGstAmount || 0,
                totalUnitCost: rowData.netCostWithGst || 0,
                totalUnitCostWithoutGst: roundToTwoDecimals(totalUnitCostWithoutGst),
                unitStatus: unitStatusOptions.find(item => item.value === rowData.unitStatus) || null,
                clientName: rowData.clientName || '',
                holdRemarks: rowData.holdRemarks || '',
                totalOtherchargeWithGst: rowData.totalOtherchargeWithGst || 0,
                otherChargeGstRate: rowData.otherChargeGstRate || '',
                gstAmountOnOtherCharges: rowData.otherChargeGstAmt || 0
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
        // Convert numeric fields to numbers, keep as string if empty or non-numeric
        const numericFields = [
            'area', 'bsp', 'inauguralDiscount', 'npv', 'otherDiscount', 'gstPercent',
            'floorPlc', 'facingPlc', 'otherViewPlc', 'gstPercentPlc',
            'parking', 'clubMembership', 'powerBackup', 'leaseRent', 'essc', 'crf',
            'edcIdc', 'eecFfc', 'terraceGarden', 'development', 'facilities',
            'maintenance', 'meter', 'otherCharges', 'otherChargeGstRate',
            'ifms', 'stampDuty', 'gstPercentSectionD'
        ];
        const newValue = numericFields.includes(id) ? (value === '' ? '' : parseFloat(value) || '') : value;
        setFormState(prev => ({ ...prev, [id]: value }));
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
    const calculateCost = () => {
        // Parse form inputs as numbers, defaulting to 0 if empty or invalid
        const area = parseFloat(formState.area) || 0;
        const bsp = parseFloat(formState.bsp) || 0;
        const inauguralDiscount = parseFloat(formState.inauguralDiscount) || 0;
        const npv = parseFloat(formState.npv) || 0;
        const otherDiscount = parseFloat(formState.otherDiscount) || 0;
        const terraceGarden = parseFloat(formState.terraceGarden) || 0;
        const gstPercent = parseFloat(formState.gstPercent) || 0;
        const floorPlc = parseFloat(formState.floorPlc) || 0;
        const facingPlc = parseFloat(formState.facingPlc) || 0;
        const otherViewPlc = parseFloat(formState.otherViewPlc) || 0;
        const gstPercentPlc = parseFloat(formState.gstPercentPlc) || 0;
        const clubMembership = parseFloat(formState.clubMembership) || 0;
        const powerBackup = parseFloat(formState.powerBackup) || 0;
        const leaseRent = parseFloat(formState.leaseRent) || 0;
        const essc = parseFloat(formState.essc) || 0;
        const crf = parseFloat(formState.crf) || 0;
        const edcIdc = parseFloat(formState.edcIdc) || 0;
        const eecFfc = parseFloat(formState.eecFfc) || 0;
        const development = parseFloat(formState.development) || 0;
        const facilities = parseFloat(formState.facilities) || 0;
        const maintenance = parseFloat(formState.maintenance) || 0;
        const meter = parseFloat(formState.meter) || 0;
        const otherCharges = parseFloat(formState.otherCharges) || 0;
        const otherChargeGstRate = parseFloat(formState.otherChargeGstRate) || 0;
        const ifms = parseFloat(formState.ifms) || 0;
        const stampDuty = parseFloat(formState.stampDuty) || 0;
        const gstPercentSectionD = parseFloat(formState.gstPercentSectionD) || 0;

        // Debug log for Section A inputs
        console.log('Section A Inputs:', {
            area,
            bsp,
            inauguralDiscount,
            npv,
            otherDiscount,
            terraceGarden
        });

        // Calculate Net BSP, including terraceGarden as an additional cost
        const netBsp = bsp - (inauguralDiscount + npv + otherDiscount) + terraceGarden;

        // Calculate Net BSP Area
        const netBspArea = netBsp * area;

        // Calculate GST Amount on BSP
        const gstAmount = (netBspArea * gstPercent) / 100;

        // Calculate Net Unit Cost (Net BSP Area + GST Amount)
        const netUnitCost = netBspArea + gstAmount;

        // Handle parking separately since it may not always be numeric
        const parking = parseFloat(formState.parking) || 0;

        // Calculate Total PLC (Without GST)
        const totalPlcWithoutGst = floorPlc + facingPlc + otherViewPlc;

        // Calculate Total PLC GST Amount
        const totalPlcGstAmt = (totalPlcWithoutGst * gstPercentPlc) / 100;

        // Calculate Total PLC (With GST)
        const totalPlcWithGst = totalPlcWithoutGst + totalPlcGstAmt;

        // Calculate Total Other Charges (Without GST)
        const totalOtherCharges = (
            parking +
            clubMembership +
            powerBackup +
            leaseRent +
            essc +
            crf +
            edcIdc +
            eecFfc +
            development +
            facilities +
            maintenance +
            meter +
            otherCharges
        );

        // Debug log to trace Section C fields
        console.log('Section C Inputs:', {
            parking,
            clubMembership,
            powerBackup,
            leaseRent,
            essc,
            crf,
            edcIdc,
            eecFfc,
            development,
            facilities,
            maintenance,
            meter,
            otherCharges,
            totalOtherCharges
        });

        // Calculate GST on Other Charges
        const gstAmountOnOtherCharges = (totalOtherCharges * otherChargeGstRate) / 100;

        // Calculate Total Other Charges (With GST)
        const totalOtherchargeWithGst = totalOtherCharges + gstAmountOnOtherCharges;

        // Calculate Total Without GST for IFMS and Stamp Duty
        const totalWithoutGst = ifms + stampDuty;

        // Calculate GST for Section D
        const gstAmountSectionD = (totalWithoutGst * gstPercentSectionD) / 100;
        const totalWithGst = totalWithoutGst + gstAmountSectionD;

        // Debug log for Section D
        console.log('Section D Inputs:', {
            ifms,
            stampDuty,
            totalWithoutGst,
            gstPercentSectionD,
            gstAmountSectionD,
            totalWithGst
        });

        // Calculate Total GST Amount (GST on BSP + GST on Other Charges + GST on PLC + GST on Section D)
        const totalGstAmt = gstAmount + gstAmountOnOtherCharges + totalPlcGstAmt + gstAmountSectionD;

        // Calculate Total Unit Cost Without GST
        const totalUnitCostWithoutGst = netBspArea + totalPlcWithoutGst + totalOtherCharges + totalWithoutGst;

        // Calculate Total Unit Cost (With GST)
        const totalUnitCost = netUnitCost + totalPlcWithGst + totalOtherchargeWithGst + totalWithGst;

        // Update form state with calculated values
        setFormState(prev => {
            const newState = {
                ...prev,
                netBsp: roundToTwoDecimals(netBsp),
                netBspArea: roundToTwoDecimals(netBspArea),
                netUnitCost: roundToTwoDecimals(netUnitCost),
                gstAmount: roundToTwoDecimals(gstAmount),
                totalPlcWithoutGst: roundToTwoDecimals(totalPlcWithoutGst),
                totalPlcGstAmt: roundToTwoDecimals(totalPlcGstAmt),
                totalPlcWithGst: roundToTwoDecimals(totalPlcWithGst),
                totalOtherCharges: roundToTwoDecimals(totalOtherCharges),
                gstAmountOnOtherCharges: roundToTwoDecimals(gstAmountOnOtherCharges),
                totalOtherchargeWithGst: roundToTwoDecimals(totalOtherchargeWithGst),
                totalWithoutGst: roundToTwoDecimals(totalWithoutGst),
                gstAmountSectionD: roundToTwoDecimals(gstAmountSectionD),
                totalWithGst: roundToTwoDecimals(totalWithGst),
                totalGstAmt: roundToTwoDecimals(totalGstAmt),
                totalUnitCost: roundToTwoDecimals(totalUnitCost),
                totalUnitCostWithoutGst: roundToTwoDecimals(totalUnitCostWithoutGst)
            };
            console.log('Updated totalOtherCharges:', newState.totalOtherCharges);
            return newState;
        });
    };

    const handleCalculateCost = e => {
        setFormState(prev => {
            const updatedState = { ...prev };
            calculateCost(updatedState);
            return updatedState;
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
            terrageGarden: formState.terraceGarden,
            totalAreaBsp: parseFloat(formState.netBspArea) || 0,
            floorPlc: formState.floorPlc || "",
            facingPlc: formState.facingPlc || "",
            otherViewPlc: formState.otherViewPlc || 0,
            carParking: formState.parking,
            clubMembership: formState.clubMembership || "",
            powerBackupCharges: formState.powerBackup || 0,
            ifmsAfterDiscount: formState.ifms,
            stampDuty: formState.stampDuty,
            totalWithoutGst: parseFloat(formState.totalWithoutGst) || 0,
            gstPercentSectionD: formState.gstPercentSectionD || '',
            gstAmountSectionD: parseFloat(formState.gstAmountSectionD) || 0,
            totalWithGst: parseFloat(formState.totalWithGst) || 0,
            leaseRentAfterDiscount: formState.leaseRent,
            esscPer: formState.essc,
            crfPer: formState.crf,
            edcIdc: formState.edcIdc,
            eecFfc: formState.eecFfc,
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
            totalPlcWithoutGst: parseFloat(formState.totalPlcWithoutGst) || 0,
            totalPlcGstAmt: parseFloat(formState.totalPlcGstAmt) || 0,
            totalPlcWithGst: parseFloat(formState.totalPlcWithGst) || 0
        };

        if (key === 'Add') {
            params.builderName = formState.builder?.label || '';
            params.builderMasterId = formState.builder?.value || '';
            params.projectName = formState.project?.label || '';
            params.projectNameId = formState.project?.value || '';
            params.netBsp = parseFloat(formState.netBsp) || 0;
            params.unitStatus = formState.unitStatus?.value || '';
            params.projectUnitId = rowData.projectUnitId || 0;
        } else {
            params.builderId = formState.builder?.value;
            params.projectId = formState.project?.value;
            params.projectUnitid = rowData.projectUnitId || 0;
        }

        if (formState.holdFor) {
            params.adminHoldFor = formState.holdFor?.value || '';
        }

        return params;
    };

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
            'unitStatus',
            'netBspArea'
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

    const formFields = [
        // A>>>>
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
        { id: 'terraceGarden', label: 'Terrace/Garden', type: 'text', placeholder: 'Terrace/Garden', onBlur: handleCalculateCost },
        { id: 'netBsp', label: 'Net BSP', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.netBsp) },
        { id: 'netBspArea', label: 'Net BSP Amount (Without GST)', type: 'text', readOnly: true, required: true, value: roundToTwoDecimals(formState.netBspArea) },
        { id: 'gstPercent', label: 'GST %', type: 'text', placeholder: 'GST %', onBlur: handleCalculateCost },
        { id: 'gstAmount', label: 'GST Amount', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.gstAmount) },
        { id: 'netUnitCost', label: 'Net BSP Amount (With GST)', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.netUnitCost) },

        // B>>>>
        { id: 'floorPlc', label: 'Floor PLC', type: 'text', placeholder: 'Floor PLC', onBlur: handleCalculateCost },
        { id: 'facingPlc', label: 'Facing PLC', type: 'text', placeholder: 'Facing PLC', onBlur: handleCalculateCost },
        { id: 'otherViewPlc', label: 'Other View PLC', type: 'text', placeholder: 'Other View PLC', onBlur: handleCalculateCost },
        { id: 'totalPlcWithoutGst', label: 'Total PLC (Without GST)', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalPlcWithoutGst) },
        { id: 'gstPercentPlc', label: 'GST %', type: 'text', placeholder: 'GST %', onBlur: handleCalculateCost },
        { id: 'totalPlcGstAmt', label: 'PLC GST Amount', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalPlcGstAmt) },
        { id: 'totalPlcWithGst', label: 'Total PLC (With GST)', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalPlcWithGst) },

        // C>>>>
        { id: 'parking', label: 'Parking', type: 'text', placeholder: 'Parking', onBlur: handleCalculateCost },
        { id: 'clubMembership', label: 'Club Membership', type: 'text', placeholder: 'Club Membership', onBlur: handleCalculateCost },
        { id: 'powerBackup', label: 'Power Backup', type: 'text', placeholder: 'Power Backup', onBlur: handleCalculateCost },
        { id: 'leaseRent', label: 'Lease Rent', type: 'text', placeholder: 'Lease Rent', onBlur: handleCalculateCost },
        { id: 'essc', label: 'ESSC', type: 'text', placeholder: 'ESSC', onBlur: handleCalculateCost },
        { id: 'crf', label: 'CRF', type: 'text', placeholder: 'CRF', onBlur: handleCalculateCost },
        { id: 'edcIdc', label: 'EDC/IDC', type: 'text', placeholder: 'EDC/IDC', onBlur: handleCalculateCost },
        { id: 'eecFfc', label: 'EEC/FFC', type: 'text', placeholder: 'EEC/FFC', onBlur: handleCalculateCost },
        { id: 'development', label: 'Development', type: 'text', placeholder: 'Development', onBlur: handleCalculateCost },
        { id: 'facilities', label: 'Facilities', type: 'text', placeholder: 'Facilities', onBlur: handleCalculateCost },
        { id: 'maintenance', label: 'Maintenance', type: 'text', placeholder: 'Maintenance', onBlur: handleCalculateCost },
        { id: 'meter', label: 'Meter', type: 'text', placeholder: 'Meter', onBlur: handleCalculateCost },
        { id: 'otherCharges', label: 'Other Charges', type: 'text', placeholder: 'Other Charges', onBlur: handleCalculateCost },
        { id: 'totalOtherCharges', label: 'Total Other Charges (Without GST)', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalOtherCharges) },
        { id: 'otherChargeGstRate', label: 'GST% On Other Charges', type: 'text', placeholder: 'GST% On Other Charges', onBlur: handleCalculateCost },
        { id: 'gstAmountOnOtherCharges', label: 'GST Amount On Other Charges', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.gstAmountOnOtherCharges) },
        { id: 'totalOtherchargeWithGst', label: 'Total Other Charges (With GST)', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalOtherchargeWithGst) },

        // D>>>>
        { id: 'ifms', label: 'IFMS', type: 'text', placeholder: 'IFMS', onBlur: handleCalculateCost },
        { id: 'stampDuty', label: 'Stamp Duty / Registration Charges', type: 'text', placeholder: 'Stamp Duty', onBlur: handleCalculateCost },
        { id: 'totalWithoutGst', label: 'Total (Without GST)', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalWithoutGst) },
        { id: 'gstPercentSectionD', label: 'GST %', type: 'text', placeholder: 'GST %', onBlur: handleCalculateCost },
        { id: 'gstAmountSectionD', label: 'GST Amount', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.gstAmountSectionD) },
        { id: 'totalWithGst', label: 'Total (With GST)', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalWithGst) },

        // E>>>>
        { id: 'totalGstAmt', label: 'Total GST Amt', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalGstAmt) },
        { id: 'totalUnitCostWithoutGst', label: 'Total Unit Cost (Without GST)', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalUnitCostWithoutGst) },
        { id: 'totalUnitCost', label: 'Total Unit Cost (With GST)', type: 'text', readOnly: true, value: roundToTwoDecimals(formState.totalUnitCost) },
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
                                formFields.slice(0, 18), // Section A: 18 fields
                                formFields.slice(18, 25), // Section B: 7 fields
                                formFields.slice(25, 42), // Section C: 17 fields
                                formFields.slice(42, 48), // Section D: 6 fields
                                formFields.slice(48) // Section E: 7 fields
                            ].map((fieldGroup, index) => (
                                <React.Fragment key={index}>
                                    <Row>
                                        {fieldGroup.map(field => (
                                            <Col md={field.id === 'holdRemarks' ? 6 : 3} key={field.id} className="mb-3">
                                                <h6 className="mb-1 font-size-11">
                                                    {field.label}
                                                    {field.required && <span style={{ color: 'red' }}>*</span>}
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
                                    {index < 4 && <hr className="dashed-divider" />}
                                </React.Fragment>
                            ))}
                            <div className="mt-4 d-flex justify-content-center">
                                <button type="submit" className="btn btn-primary">{(Object.keys(rowData).length) > 0 ? 'Update' : 'Save'}</button>
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

export default CreateProjectUnitMasterNew;