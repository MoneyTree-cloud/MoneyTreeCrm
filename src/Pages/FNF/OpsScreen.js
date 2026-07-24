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
import { FaWhatsapp, FaSave } from "react-icons/fa";

export default function OpsScreen() {
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

  const [opsData, setOpsData] = useState({
    whatsappRemoval: { status: null, remark: "" },
  });

  const handleSave = async () => {
    // Validation
    if (!opsData.whatsappRemoval.status) {
      toast.error("Please select a status for WhatsApp Group removal");
      return;
    }
    setSaving(true);
    // Standardized Payload structure
    const payload = {
      createdBy: `${userName} (${empCode})`,
      formId: passedData?.id,
      departmentClearances: [
        {
          department: "OPS_TEAM",
          description: "Removed from WhatsApp Group",
          cleared: opsData.whatsappRemoval.status?.value === "YES" ? true : opsData.whatsappRemoval.status?.value === "NO" ? false : null,
          remarks: opsData.whatsappRemoval.remark || "",
        }
      ],
    };

    ApiClient.post(`${UPDATE_FNF_DATA}`, payload)
      .then((response) => {
        setSaving(false);
        if (response?.data?.status === 1) {
          toast.success(response.data.message || "Operations Clearance Saved Successfully");
          window.history.back(); // Navigate back to the list
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
              background: "#121212", // Dark theme for Operations
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px"
            }}
          >
            <span className="fw-bold small text-uppercase">
              <FaWhatsapp className="me-2" /> Operations Clearance
            </span>
            <Badge color="light" className="text-dark border-0">Pending</Badge>
          </CardHeader>

          <CardBody className="py-4">
            <YesNoRow
              label="Removed from WhatsApp Group"
              value={opsData.whatsappRemoval}
              showRemarksOnYes={false}
              onChange={(val) => setOpsData({ ...opsData, whatsappRemoval: val })}
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
                    <FaSave className="me-2" /> Save Operations Clearance
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