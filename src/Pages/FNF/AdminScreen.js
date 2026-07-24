import { Card, CardBody, CardHeader, Button, Spinner, Badge } from "reactstrap";
import { useState } from "react";
import FnFHeaderSection from "./FnFHeaderSection";
import YesNoRow from "./YesNoRow";
import PageContent from "../../components/Common/PageContent";
import { useLocation } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";
import ApiClient from "../../helpers/api_helper";
import { UPDATE_FNF_DATA } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import { defaultTheme } from "../../helpers/defaultTheme";
import { FaBoxes, FaSave } from "react-icons/fa";

export default function AdminScreen() {
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

  const [adminData, setAdminData] = useState({
    stationary: { status: null, remark: "" },
    // mobileSim: { status: null, remark: "" },
    companyAsset: { status: null, remark: "" },
    visitingCard: { status: null, remark: "" },
    assets: { status: null, remark: "" }
  });

  const handleSave = async () => {
    // Validation: All fields mandatory
    if (
      !adminData.stationary.status ||
      // !adminData.mobileSim.status ||
      !adminData.companyAsset.status ||
      !adminData.visitingCard.status ||
      !adminData.assets?.status
    ) {
      toast.error("Please complete all Admin clearance checklist items");
      return;
    }

    setSaving(true);

    // Payload following required structure
    const payload = {
      createdBy: `${userName} (${empCode})`,
      formId: passedData?.id,
      departmentClearances: [
        {
          department: "ADMIN",
          description: "Stationary Returned",
          cleared: adminData.stationary.status?.value === "YES" ? true : adminData.stationary.status?.value === "NO" ? false : null,
          remarks: adminData.stationary.remark || "",
        },
        {
          department: "ADMIN",
          description: "Any Company Asset",
          cleared: adminData.companyAsset.status?.value === "YES" ? true : adminData.companyAsset.status?.value === "NO" ? false : null,
          remarks: adminData.companyAsset.remark || "",
        },
        {
          department: "ADMIN",
          description: "Visiting Card Returned",
          cleared: adminData.visitingCard.status?.value === "YES" ? true : adminData.visitingCard.status?.value === "NO" ? false : null,
          remarks: adminData.visitingCard.remark || "",
        },
        {
          department: "ADMIN",
          description: "ID Card & Assets Submitted",
          cleared: adminData.assets?.status?.value === "YES" ? true : adminData.assets?.status?.value === "NO" ? false : null,
          remarks: adminData.assets?.remark || "",
        }
      ],
    };

    ApiClient.post(`${UPDATE_FNF_DATA}`, payload)
      .then((response) => {
        setSaving(false);
        if (response?.data?.status === 1) {
          toast.success(response.data.message || "Admin Clearance Saved Successfully");
          window.history.back();
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
        {/* Read-only header populated from passedData */}
        <FnFHeaderSection
          isHR={false}
          headerData={headerData}
          setHeaderData={setHeaderData}
        />

        <Card className="shadow-sm border-0 mb-3">
          <CardHeader
            className="text-white d-flex justify-content-between align-items-center py-2"
            style={{
              background: defaultTheme.primary,
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px"
            }}
          >
            <span className="fw-bold small">
              <FaBoxes className="me-2" /> ADMIN CLEARANCE
            </span>
            <Badge color="light" className="text-dark">Pending</Badge>
          </CardHeader>

          <CardBody className="py-4">
            <YesNoRow
              label="Stationary Returned"
              value={adminData.stationary}
              showRemarksOnYes={false}
              onChange={(val) => setAdminData({ ...adminData, stationary: val })}
            />

            {/* <YesNoRow
              label="Mobile & SIM Returned"
              value={adminData.mobileSim}
              showRemarksOnYes={false}
              onChange={(val) => setAdminData({ ...adminData, mobileSim: val })}
            /> */}
            <YesNoRow label="ID Card & Assets Submitted" value={adminData.assets} onChange={(val) => setAdminData({ ...adminData, assets: val })} />


            <YesNoRow
              label="Any Company Asset"
              value={adminData.companyAsset}
              showRemarksOnYes={false}
              onChange={(val) => setAdminData({ ...adminData, companyAsset: val })}
            />

            <YesNoRow
              label="Visiting Card Returned"
              value={adminData.visitingCard}
              showRemarksOnYes={false}
              onChange={(val) => setAdminData({ ...adminData, visitingCard: val })}
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
                    <FaSave className="me-2" /> Save Admin Clearance
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