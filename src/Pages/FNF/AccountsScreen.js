import { Card, CardBody, CardHeader, Button, Spinner } from "reactstrap";
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

export default function AccountsScreen() {
  const location = useLocation();
  const { empCode, userName } = useUserStore((state) => state.user);
  const [saving, setSaving] = useState(false);

  // 1. Retrieve the row data passed from the List Screen
  const passedData = location?.state?.data || {};

  // 2. Pass this data directly to the header state (Read-Only)
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

  const [clearance, setClearance] = useState({
    loanAdvance: { status: null, remark: "" },
    recovery: { status: null, remark: "" },
    vehicle: { status: null, remark: "" },
    otherDues: { status: null, remark: "" },
  });

  const handleSave = async () => {
    // Validation: Ensure all checklist items are selected
    if (
      !clearance.loanAdvance.status ||
      !clearance.recovery.status ||
      !clearance.vehicle.status ||
      !clearance.otherDues.status
    ) {
      toast.error("Please complete all clearance checklist items");
      return;
    }

    setSaving(true);

    const payload = {
      createdBy: `${userName} (${empCode})`,
      formId: passedData?.id,
      departmentClearances: [
        {
          department: "ACCOUNTS_FINANCE",
          description: "Company Loan / Advance",
          cleared: clearance.loanAdvance.status?.value === "YES" ? true : clearance.loanAdvance.status?.value === "NO" ? false : null,
          remarks: clearance.loanAdvance.remark || "",
        },
        {
          department: "ACCOUNTS_FINANCE",
          description: "Recovery / Financial Liabilities",
          cleared: clearance.recovery.status?.value === "YES" ? true : clearance.recovery.status?.value === "NO" ? false : null,
          remarks: clearance.recovery.remark || "",
        },
        {
          department: "ACCOUNTS_FINANCE",
          description: "Vehicle (If Applicable)",
          cleared: clearance.vehicle.status?.value === "YES" ? true : clearance.vehicle.status?.value === "NO" ? false : null,
          remarks: clearance.vehicle.remark || "",
        },
        {
          department: "ACCOUNTS_FINANCE",
          description: "Any Other Dues",
          cleared: clearance.otherDues.status?.value === "YES" ? true : clearance.otherDues.status?.value === "NO" ? false : null,
          remarks: clearance.otherDues.remark || "",
        },
      ],
    };

    ApiClient.post(`${UPDATE_FNF_DATA}`, payload)
      .then((response) => {
        setSaving(false);
        if (response?.data?.status === 1) {
          toast.success(response.data.message || "Accounts Clearance Updated Successfully");
          window.history.back(); // Go back to list
        } else {
          toast.error(response.data.message || "Failed to save data");
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
        {/* Header Section remains Read-Only */}
        <FnFHeaderSection
          isHR={false}
          headerData={headerData}
          setHeaderData={setHeaderData}
        />

        <Card className="shadow-sm border-0">
          <CardHeader
            className="text-white fw-bold py-2"
            style={{ background: defaultTheme.primary, borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}
          >
            Accounts & Finance Clearance
          </CardHeader>

          <CardBody className="py-4">
            <YesNoRow
              label="Company Loan / Advance"
              value={clearance.loanAdvance}
              showRemarksOnYes={false}
              onChange={(val) => setClearance({ ...clearance, loanAdvance: val })}
            />

            <YesNoRow
              label="Recovery / Financial Liabilities"
              value={clearance.recovery}
              showRemarksOnYes={false}
              onChange={(val) => setClearance({ ...clearance, recovery: val })}
            />

            <YesNoRow
              label="Vehicle (If Applicable)"
              value={clearance.vehicle}
              showRemarksOnYes={false}
              onChange={(val) => setClearance({ ...clearance, vehicle: val })}
            />

            <YesNoRow
              label="Any Other Dues"
              value={clearance.otherDues}
              showRemarksOnYes={false}
              onChange={(val) => setClearance({ ...clearance, otherDues: val })}
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
                  "Save Clearance"
                )}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageContent>
  );
}