import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Spinner, Badge } from "reactstrap";
import { FaLaptopCode, FaSave } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import FnFHeaderSection from "./FnFHeaderSection";
import YesNoRow from "./YesNoRow";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import ApiClient from "../../helpers/api_helper";
import { UPDATE_FNF_DATA } from "../../helpers/url_helper";
import { defaultTheme } from "../../helpers/defaultTheme";

export default function ITScreen() {
    const location = useLocation();
    const { empCode, userName } = useUserStore((state) => state.user);
    const [saving, setSaving] = useState(false);

    // 1. Retrieve the row data passed from the List Screen
    const passedData = location?.state?.data || {};

    // 2. Map passed data to header state for FnFHeaderSection
    const [headerData, setHeaderData] = useState({
        employeeCode: passedData.employeeCode || "",
        employeeName: passedData.name || "",
        designation: passedData.designation || "",
        department: passedData.department || "",
        location: passedData.location || "",
        level: passedData.level || "",
        hod: passedData.hod || "",
        dateOfJoining: passedData.dateOfJoining || "",
        contactNo: passedData.contactNo || "",
        noticePeriod: passedData.noticePeriodDays || "",
        dateOfResignation: passedData.dateOfResignation || "",
        relievingDate: passedData.relievingDate || "",
        informationReceivedDate: passedData.informationReceivedDate || "",
        releavingReason: passedData?.relievingReason || "",
        profilePhoto: passedData?.profilePhoto || ""
    });

    const [itData, setItData] = useState({
        laptop: { status: null, remark: "" },
        email: { status: null, remark: "" },
        penDrive: { status: null, remark: "" },
        otherAsset: { status: null, remark: "" },
    });

    const handleSave = async () => {
        // Validation: All fields mandatory
        if (
            !itData.laptop.status ||
            !itData.email.status ||
            !itData.penDrive.status ||
            !itData.otherAsset.status
        ) {
            toast.error("Please complete all IT clearance checklist items");
            return;
        }

        setSaving(true);

        // Standardized Payload structure
        const payload = {
            createdBy: `${userName} (${empCode})`,
            formId: passedData?.id,
            departmentClearances: [
                {
                    department: "IT",
                    description: "Laptop & Accessories Returned",
                    cleared: itData.laptop.status?.value === "YES" ? true : itData.laptop.status?.value === "NO" ? false : null,
                    remarks: itData.laptop.remark || "",
                },
                {
                    department: "IT",
                    description: "Email ID Disabled",
                    cleared: itData.email.status?.value === "YES" ? true : itData.email.status?.value === "NO" ? false : null,
                    remarks: itData.email.remark || "",
                },
                {
                    department: "IT",
                    description: "Pen Drive Returned",
                    cleared: itData.penDrive.status?.value === "YES" ? true : itData.penDrive.status?.value === "NO" ? false : null,
                    remarks: itData.penDrive.remark || "",
                },
                {
                    department: "IT",
                    description: "Any Other IT Asset",
                    cleared: itData.otherAsset.status?.value === "YES" ? true : itData.otherAsset.status?.value === "NO" ? false : null,
                    remarks: itData.otherAsset.remark || "",
                },
                {
                    department: "IT",
                    description: "IVR Calling",
                    cleared: itData.ivrCalling.status?.value === "YES" ? true : itData.ivrCalling.status?.value === "NO" ? false : null,
                    remarks: itData.ivrCalling.remark || "",
                },
            ],
        };

        ApiClient.post(`${UPDATE_FNF_DATA}`, payload)
            .then((response) => {
                setSaving(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message || "IT Clearance Saved Successfully");
                    window.history.back(); // Navigate back to history list
                } else {
                    toast.error(response.data.message || "Failed to save clearance");
                }
            })
            .catch((error) => {
                setSaving(false);
                toast.error(error.message || "An error occurred");
            });
    };

    return (
        <PageContent>
            <div className="container-fluid">
                {/* Header Section (Read-Only) */}
                <FnFHeaderSection
                    isHR={false}
                    headerData={headerData}
                    setHeaderData={setHeaderData}
                />

                <Card className="shadow-sm border-0 mb-3">
                    <CardHeader
                        className="text-white d-flex justify-content-between align-items-center py-2"
                        style={{
                            background: "#0dcaf0", // Info/IT Cyan theme
                            borderTopLeftRadius: "8px",
                            borderTopRightRadius: "8px"
                        }}
                    >
                        <span className="fw-bold small text-uppercase">
                            <FaLaptopCode className="me-2" /> IT Clearance
                        </span>
                        <Badge color="light" className="text-dark">Pending</Badge>
                    </CardHeader>

                    <CardBody className="py-4">
                        <YesNoRow
                            label="Laptop & Accessories Returned"
                            value={itData.laptop}
                            showRemarksOnYes={false}
                            onChange={(val) => setItData({ ...itData, laptop: val })}
                        />

                        <YesNoRow
                            label="Email ID Disabled"
                            value={itData.email}
                            showRemarksOnYes={false}
                            onChange={(val) => setItData({ ...itData, email: val })}
                        />

                        <YesNoRow
                            label="Pen Drive Returned"
                            value={itData.penDrive}
                            showRemarksOnYes={false}
                            onChange={(val) => setItData({ ...itData, penDrive: val })}
                        />

                        <YesNoRow
                            label="Any Other IT Asset"
                            value={itData.otherAsset}
                            showRemarksOnYes={false}
                            onChange={(val) => setItData({ ...itData, otherAsset: val })}
                        />

                        <YesNoRow
                            label="IVR Calling"
                            value={itData.ivrCalling}
                            showRemarksOnYes={false}
                            onChange={(val) => setItData({ ...itData, ivrCalling: val })}
                        />

                        {/* ACTION BUTTONS */}
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button color="light" className="border px-4" onClick={() => window.history.back()}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                style={{ background: defaultTheme.primary, color: "white" }}
                                disabled={saving}
                                onClick={handleSave}
                            >
                                {saving ? (
                                    <>
                                        <Spinner size="sm" className="me-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="me-2" /> Save IT Clearance
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </PageContent>
    );
}