import { useState } from "react";
import { Card, CardHeader, CardBody, Button, Spinner, Badge, Row, Col, Input } from "reactstrap";
import Select from "react-select";
import FnFHeaderSection from "./FnFHeaderSection";
import YesNoRow from "./YesNoRow";
import { FaClipboardCheck, FaSave } from "react-icons/fa";
import PageContent from "../../components/Common/PageContent";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import ApiClient from "../../helpers/api_helper";
import { UPDATE_FNF_DATA } from "../../helpers/url_helper";
import { useLocation } from "react-router-dom";

const percentageOptions = [
  { value: "0%", label: "0%" },
  { value: "40%", label: "40%" },
  { value: "100%", label: "100%" }
];

export default function HODScreen() {
  const location = useLocation();
  const { empCode, userName } = useUserStore((state) => state.user);
  const [saving, setSaving] = useState(false);

  // 1. Retrieve the row data passed from the List Screen
  const passedData = location?.state?.data || {};

  // 2. Pass this data directly to the header state
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
    pendingTasks: { status: null, remark: "" },
    handover: { status: null, remark: "" },
    processFnF: { status: null, remark: "" },
    advance: { status: null, remark: "" },
    recovery: { status: null, remark: "" },
    percentage: null
  });

  const handleSave = () => {
    if (!clearance.pendingTasks.status || !clearance.handover.status || !clearance.processFnF.status || !clearance.percentage) {
      toast.error("Please complete all HOD checklist items and define percentage");
      return;
    }

    if (clearance.processFnF.status?.value === "NO" && !clearance.processFnF.remark) {
      toast.error("Please mention the reason why F&F cannot be processed");
      return;
    }

    setSaving(true);

    const payload = {
      createdBy: `${userName} (${empCode})`,
      formId: passedData?.id,
      departmentClearances: [
        {
          department: "HOD",
          description: "Current Pending Tasks",
          cleared: clearance.pendingTasks.status?.value === "YES" ? true : clearance.pendingTasks.status?.value === "NO" ? false : null,
          remarks: clearance.pendingTasks.remark || ""
        },
        {
          department: "HOD",
          description: "Handover Documents/ Files (Soft & Hard)",
          cleared: clearance.handover.status?.value === "YES" ? true : clearance.handover.status?.value === "NO" ? false : null,
          remarks: clearance.handover.remark || ""
        },
        {
          department: "HOD",
          description: "Can we process the F&F?",
          cleared: clearance.processFnF.status?.value === "YES" ? true : clearance.processFnF.status?.value === "NO" ? false : null,
          remarks: clearance.processFnF.remark || ""
        },
        {
          department: "HOD",
          description: "Target Achieved?",
          cleared: clearance.percentage.status?.value === "YES" ? true : clearance.percentage.status?.value === "NO" ? false : null,
          remarks: clearance.percentage.value || ""
        },
        {
          department: "HOD",
          description: "Any advance issued?",
          cleared: clearance.advance.status?.value === "YES" ? true : clearance.advance.status?.value === "NO" ? false : null,
          remarks: clearance.advance.remark || ""
        },
        {
          department: "HOD",
          description: "Any recovery remaining?",
          cleared: clearance.recovery.status?.value === "YES" ? true : clearance.recovery.status?.value === "NO" ? false : null,
          remarks: clearance.recovery.remark || ""
        }

      ]
    };
    ApiClient.post(`${UPDATE_FNF_DATA}`, payload)
      .then((response) => {
        setSaving(false);
        if (response?.data?.status === 1) {
          toast.success(response.data.message || "HOD Clearance Saved Successfully");
          window.history.back();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setSaving(false);
        toast.error(error.message);
      });
  };

  // return
  return (
    <PageContent>
      {/* 3. isHR={false} ensures header is Read-Only and doesn't trigger Fetch */}
      <FnFHeaderSection
        isHR={false}
        headerData={headerData}
        setHeaderData={setHeaderData}
      />

      <Card className="shadow-sm border-0 mb-3">
        <CardHeader
          className="text-white d-flex justify-content-between align-items-center py-2"
          style={{ background: defaultTheme.primary, borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}
        >
          <span className="fw-bold small">
            <FaClipboardCheck className="me-2" /> HOD CLEARANCE
          </span>
          <Badge color="light" className="text-dark">Pending</Badge>
        </CardHeader>

        <CardBody className="py-4">
          <YesNoRow
            label="Current Pending Tasks"
            value={clearance.pendingTasks}
            onChange={(val) => setClearance({ ...clearance, pendingTasks: val })}
          />

          <YesNoRow
            label="Handover Documents/ Files (Soft & Hard)"
            value={clearance.handover}
            onChange={(val) => setClearance({ ...clearance, handover: val })}
          />

          <YesNoRow
            label="Any Advance Issued?"
            value={clearance.advance}
            onChange={(val) => setClearance({ ...clearance, advance: val })}
          />

          <YesNoRow
            label="Any Recovery Remaining?"
            value={clearance.recovery}
            onChange={(val) => setClearance({ ...clearance, recovery: val })}
          />

          <Row className="align-items-start">
            <Col md={5} className="fw-semibold text-secondary">Can we process the F&F?</Col>
            <Col md={3}>
              <Select
                options={[{ value: "YES", label: "Yes" }, { value: "NO", label: "No" }]}
                value={clearance.processFnF.status}
                onChange={(opt) => setClearance({ ...clearance, processFnF: { status: opt, remark: "" } })}
                placeholder="Select"
                isClearable
              />
            </Col>
            <Col md={4}>
              {clearance.processFnF.status?.value === "NO" && (
                <Input
                  type="textarea"
                  placeholder="Kindly mention the reason"
                  rows="2"
                  value={clearance.processFnF.remark}
                  onChange={(e) => setClearance({ ...clearance, processFnF: { ...clearance.processFnF, remark: e.target.value } })}
                />
              )}
            </Col>
          </Row>

          <hr />

          <Row className="align-items-center">
            <Col md={5} className="fw-semibold text-secondary">Target Achieved:-</Col>
            <Col md={3}>
              <Select
                options={percentageOptions}
                value={clearance.percentage}
                isClearable
                onChange={(opt) => setClearance({ ...clearance, percentage: opt })}
                placeholder="Select %"
              />
            </Col>
          </Row>
        </CardBody>
      </Card>

      <div className="d-flex justify-content-end gap-2 mt-3 pb-4">
        <Button color="light" className="border px-4" onClick={() => window.history.back()}>Back to List</Button>
        <Button
          color="primary"
          style={{ background: defaultTheme.primary, color: "white" }}
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? <Spinner size="sm" /> : <><FaSave className="me-2" /> Save HOD Clearance</>}
        </Button>
      </div>
    </PageContent>
  );
}