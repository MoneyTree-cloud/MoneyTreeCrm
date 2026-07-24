import Select from "react-select";
import { Row, Col, Input } from "reactstrap";

const options = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
  { value: "Not Applicable", label: "Not Applicable" },
];

export default function YesNoRow({ label, value, onChange, showRemarksOnYes = false }) {
  // Find current selected option object for react-select
  const selectedOption = options.find(opt => opt.value === value?.status?.value) || null;

  return (
    <Row className="align-items-center mb-3">
      <Col md={5} className="fw-semibold text-secondary" style={{ fontSize: "14px" }}>
        {label}
      </Col>

      <Col md={3}>
        <Select
          options={options}
          value={selectedOption}
          onChange={(opt) => onChange({ status: opt, remark: "" })}
          placeholder="Select"
          isSearchable={true}
          menuPlacement="auto"
          isClearable
          styles={{
            control: (base) => ({ ...base, minHeight: "35px", fontSize: "13px" })
          }}
        />
      </Col>

      <Col md={4}>
        {/* Remark only opens if prop is true AND status is YES */}
        {showRemarksOnYes && value?.status?.value === "YES" && (
          <Input
            placeholder="Enter remarks"
            value={value.remark || ""}
            onChange={(e) => onChange({ ...value, remark: e.target.value })}
            bsSize="sm"
          />
        )}
      </Col>
    </Row>
  );
}