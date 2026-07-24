import { useState } from "react";
import { Card, CardHeader, CardBody, Button, Spinner, Badge } from "reactstrap";
import FnFHeaderSection from "./FnFHeaderSection";
import YesNoRow from "./YesNoRow";
import { FaClipboardCheck, FaSave, FaTimes } from "react-icons/fa";
import PageContent from "../../components/Common/PageContent";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import ApiClient from "../../helpers/api_helper";
import { SAVE_FNF_DATA } from "../../helpers/url_helper";
import { useNavigate } from "react-router-dom";

export default function HRScreen() {
    const { empCode, userName } = useUserStore((state) => state.user);
    const navigate = useNavigate();

    const initialHeaderState = {
        employeeCode: "",
        employeeName: "",
        designation: "",
        department: "",
        location: "",
        level: "",
        hod: "",
        dateOfJoining: "",
        contactNo: "",
        noticePeriod: "",
        dateOfResignation: "",
        relievingDate: "",
        informationReceivedDate: "",
        reportingManagerId: "",
        reportingManagerName: "",
        address: ""
    };

    const initialClearanceState = {
        hrms: { status: null, remark: "" },
        // assets: { status: null, remark: "" },
        biometrics: { status: null, remark: "" },
        muster: { status: null, remark: "" }
    };

    const [headerData, setHeaderData] = useState(initialHeaderState);
    const [clearance, setClearance] = useState(initialClearanceState);
    const [saving, setSaving] = useState(false);

    const validateForm = () => {
        const required = ["employeeCode", "employeeName", "noticePeriod", "dateOfResignation", "relievingDate", "informationReceivedDate", "reportingManagerId"];
        for (let field of required) {
            if (!headerData[field]) {
                toast.error(`Please complete the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return false;
            }
        }
        if (!clearance.hrms.status || !clearance.biometrics.status || !clearance.muster) {
            toast.error("Please complete the HR checklist");
            return false;
        }
        return true;
    };

    const handleSave = () => {
        if (!validateForm()) return;
        setSaving(true);

        const payload = {
            createdBy: `${userName} (${empCode})`,
            employeeCode: headerData.employeeCode,
            name: headerData.employeeName,
            designation: headerData.designation,
            level: headerData.level,
            department: headerData.department,
            location: headerData.location,
            hod: headerData.hod,
            dateOfJoining: headerData.dateOfJoining,
            dateOfResignation: headerData.dateOfResignation,
            relievingDate: headerData.relievingDate,
            contactNumber: headerData.contactNo,
            informationReceivedDate: headerData.informationReceivedDate,
            noticePeriodDays: parseInt(headerData.noticePeriod),
            reportingManagerId: headerData.reportingManagerId,
            reportingManagerName: headerData.reportingManagerName,
            relievingReason: headerData?.releavingReason,
            profilePhoto: headerData?.profilePhoto,
            departmentClearances: [
                { department: "HR", description: "HRMS Deactivated", cleared: clearance.hrms.status?.value === "YES" ? true : clearance.hrms.status?.value === "NO" ? false : null, remarks: clearance.hrms.remark || "" },
                // { department: "HR", description: "ID Card & Assets Submitted", cleared: clearance.assets.status?.value === "YES" ? true : clearance.assets.status?.value === "NO" ? false : null, remarks: clearance.assets.remark || "" },
                { department: "HR", description: "Muster Roll Updated", cleared: clearance.muster.status?.value === "YES" ? true : clearance.muster.status?.value === "NO" ? false : null, remarks: clearance.muster.remark || "" },
                { department: "HR", description: "Biometric Disabled", cleared: clearance.biometrics.status?.value === "YES" ? true : clearance.biometrics.status?.value === "NO" ? false : null, remarks: clearance.biometrics.remark || "" }
            ]
        };
        ApiClient.post(`${SAVE_FNF_DATA}`, payload)
            .then((res) => {
                setSaving(false);
                if (res?.data?.status === 1) {
                    toast.success(res.data.message);
                    setHeaderData(initialHeaderState);
                    setClearance(initialClearanceState);
                    window.history.back();
                } else {
                    toast.error(res.data.message);
                }
            })
            .catch((err) => {
                setSaving(false);
                toast.error(err.message);
            });
    };

    const resetHeaderData = () => {
        setHeaderData(initialHeaderState);
    }

    return (
        <PageContent>
            <FnFHeaderSection isHR={true} headerData={headerData} setHeaderData={setHeaderData} resetHeaderData={resetHeaderData} />

            <Card className="shadow-lg border-0" style={{ borderRadius: "12px", overflow: "hidden" }}>
                <CardHeader className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                            <FaClipboardCheck className="text-primary" />
                        </div>
                        <h6 className="fw-bold mb-0">HR Department Checklist</h6>
                    </div>
                    <Badge color="warning" pill className="bg-opacity-10 text-warning border-0 px-3">Required Action</Badge>
                </CardHeader>
                <CardBody className="p-4">
                    <YesNoRow label="HRMS Deactivated" value={clearance.hrms} onChange={(val) => setClearance({ ...clearance, hrms: val })} />
                    {/* <YesNoRow label="SAP ID Deactivated" value={clearance.sap} onChange={(val) => setClearance({ ...clearance, sap: val })} /> */}
                    {/* <YesNoRow label="ID Card & Assets Submitted" value={clearance.assets} onChange={(val) => setClearance({ ...clearance, assets: val })} /> */}
                    <YesNoRow label="Muster Roll Updated" value={clearance.muster} onChange={(val) => setClearance({ ...clearance, muster: val })} />
                    <YesNoRow label="Biometric Disabled" value={clearance.biometrics} onChange={(val) => setClearance({ ...clearance, biometrics: val })} />
                </CardBody>

                <div className="d-flex justify-content-end gap-2 pb-5">
                    <Button color="light" className="px-4 fw-bold text-muted border-0 shadow-sm" style={{ borderRadius: '8px' }} onClick={() => navigate(-1)}>
                        <FaTimes className="me-2" /> CANCEL
                    </Button>
                    <Button color="primary" className="px-4 fw-bold shadow-sm" disabled={saving} onClick={handleSave} style={{ borderRadius: '8px' }}>
                        {saving ? <Spinner size="sm" /> : <><FaSave className="me-2" /> SUBMIT CLEARANCE</>}
                    </Button>
                </div>
            </Card>
        </PageContent>
    );
}