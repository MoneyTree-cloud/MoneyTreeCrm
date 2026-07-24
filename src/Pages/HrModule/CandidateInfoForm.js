import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Button, Card, FormFeedback } from 'reactstrap';
import Select from 'react-select';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { CANDIDATE_FILL_MAIL_FORM, CANDIDATE_HISTORY_BY_ID, HR_LOCATION_DROPDOWN } from '../../helpers/url_helper';
import { useGet, usePost } from '../../Hooks/useApi';
import { toast } from 'react-toastify';
import ScreenLoader from '../../constants/ScreenLoader';
import { FaTrash } from 'react-icons/fa';
import { defaultTheme } from '../../helpers/defaultTheme';
import { useLocation } from 'react-router-dom';
import './CandidateInfoForm.css';
import ApiClient from '../../helpers/api_helper';
import SuccessCard from './SuccessCard';
import NoData from './NoData';
import { RequiredStar } from '../../helpers/function_helper';

// Constants
const qualificationOptions = [
  { value: 'twelfth', label: '12th' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'graduation', label: 'Graduate' },
  { value: 'postGraduation', label: 'Post Graduate' },
];

const yesNoOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

const vehicleTypeOptions = [
  { value: 'TwoWheeler', label: '2 Wheeler' },
  { value: 'FourWheeler', label: '4 Wheeler' },
  { value: 'Both', label: 'Both' },
];

const industriesOptions = [
  { label: "Advertising", value: "Advertising" },
  { label: "Auto", value: "Auto" },
  { label: "Banking", value: "Banking" },
  { label: "Construction", value: "Construction" },
  { label: "CSR", value: "CSR" },
  { label: "Consultancy", value: "Consultancy" },
  { label: "Developer", value: "Developer" },
  { label: "Education", value: "Education" },
  { label: "Energy", value: "Energy" },
  { label: "Environment", value: "Environment" },
  { label: "Fashion", value: "Fashion" },
  { label: "Finance", value: "Finance" },
  { label: "Health Care", value: "Health Care" },
  { label: "Hotel", value: "Hotel" },
  { label: "Insurance", value: "Insurance" },
  { label: "Media", value: "Media" },
  { label: "Miscellaneous", value: "Miscellaneous" },
  { label: "Real Estate", value: "Real Estate" },
  { label: "Retail", value: "Retail" },
  { label: "Technology", value: "Technology" },
  { label: "Transportation", value: "Transportation" },
  { label: "Travel", value: "Travel" },
  { label: "Other", value: "Other" }
];

const experienceYears = [
  { value: "Less than 1 Year", label: "Less than 1 Year" }, // Add this first
  ...Array.from({ length: 20 }, (_, i) => ({
    value: `${i + 1}`,
    label: `${i + 1} Year${i > 0 ? "s" : ""}`,
  })),
];

const mandatoryFields = {
  firstName: 'Applicant Name is required',
  location: 'Preferred Location is required',
  dob: 'Date of Birth is required',
  expectedSalary: 'Expected Salary is required',
  vehicle: 'Vehicle ownership is required',
  hasLicense: 'Driving License status is required',
};

const initialFormData = {
  firstName: '',
  location: null,
  dob: '',
  vehicle: null,
  vehicleType: null,
  hasLicense: null,
  expectedSalary: '',
  candidateType: '',
  internship: null,
  internshipDetails: {
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    stipend: '',
  },
  experienceDetails: {
    status: null,
    totalExp: null,
    realEstateExp: null,
    currentCompany: {
      previousCompanyName: '',
      currentLocation: '',
      department: '',
      position: '',
      currentCTC: '',
      noticePeriod: 0,
      reportingManagerName: '',
      reportingManagerNumber: '',
      employmentDurationStart: '',
      employmentDurationEnd: '',
      industryName: null,
      realEstate: null
    },
    lastCompanies: [
      { previousCompanyName: '', companyLocation: '', department: '', position: '', industryName: null, realEstate: null, employmentDurationStart: '', employmentDurationEnd: '' },
      { previousCompanyName: '', companyLocation: '', department: '', position: '', industryName: null, realEstate: null, employmentDurationStart: '', employmentDurationEnd: '' },
    ],
  },
  qualifications: [],
};

// Utility Functions
const setFieldValue = (prev, field, value, isNested = false) => {
  if (!isNested) return { ...prev, [field]: value };
  const parts = field.split('.');
  if (parts.length === 2) {
    const [parent, child] = parts;
    return {
      ...prev,
      [parent]: { ...prev[parent], [child]: value },
    };
  } else if (parts.length === 3 && parts[0] === 'experienceDetails' && parts[1] === 'currentCompany') {
    const [, , child] = parts;
    return {
      ...prev,
      experienceDetails: {
        ...prev.experienceDetails,
        currentCompany: {
          ...prev.experienceDetails.currentCompany,
          [child]: value,
        },
      },
    };
  }
  return prev;
};

// Components
const QualificationRow = ({ qual, index, errors, formData, handleQualificationChange, removeQualificationRow, getAvailableQualifications }) => (
  <Row key={index} className="qualification-row align-items-end">
    <Col md={2}>
      <FormGroup>
        <Label className="font-size-12 fw-medium">Highest Qualification <RequiredStar /></Label>
        <Select
          options={getAvailableQualifications(index)}
          value={qual.qualification}
          placeholder="Select"
          isClearable
          onChange={(val) => handleQualificationChange(index, 'qualification', val)}
          className="react-select-sm"
        />
        {errors[`qualifications[${index}].qualification`] && (
          <FormFeedback className="font-size-11 d-block">{errors[`qualifications[${index}].qualification`]}</FormFeedback>
        )}
      </FormGroup>
    </Col>
    <Col md={2}>
      <FormGroup>
        <Label className="font-size-12 fw-medium">Institution <RequiredStar /></Label>
        <Input
          type="text"
          value={qual.institution || ''}
          placeholder="Enter Name"
          onChange={(e) => handleQualificationChange(index, 'institution', e.target.value)}
          invalid={!!errors[`qualifications[${index}].institution`]}
          className="form-control-sm"
        />
        {errors[`qualifications[${index}].institution`] && (
          <FormFeedback className="font-size-11">{errors[`qualifications[${index}].institution`]}</FormFeedback>
        )}
      </FormGroup>
    </Col>
    <Col md={1}>
      <FormGroup>
        <Label className="font-size-12 fw-medium">Pursuing</Label>
        <div>
          <Input
            type="checkbox"
            checked={qual.pursuing || false}
            onChange={(e) => handleQualificationChange(index, 'pursuing', e.target.checked)}
          />
        </div>
      </FormGroup>
    </Col>
    <Col md={2}>
      <FormGroup>
        <Label className="font-size-12 fw-medium">Start Year <RequiredStar /></Label>
        <Input
          type="text"
          value={qual.startYear || ''}
          maxLength={4}
          placeholder="e.g. 2020"
          onChange={(e) => handleQualificationChange(index, 'startYear', e.target.value)}
          className="form-control-sm"
        />
      </FormGroup>
    </Col>
    <Col md={2}>
      <FormGroup>
        <Label className="font-size-12 fw-medium">End Year {!qual.pursuing && <RequiredStar />}</Label>
        {!qual.pursuing ? (
          <>
            <Input
              type="text"
              value={qual.endYear || ''}
              placeholder="e.g. 2023"
              maxLength={4}
              onChange={(e) => handleQualificationChange(index, 'endYear', e.target.value)}
              invalid={!!errors[`qualifications[${index}].endYear`]}
              className="form-control-sm"
            />
            {errors[`qualifications[${index}].endYear`] && (
              <FormFeedback className="font-size-11">{errors[`qualifications[${index}].endYear`]}</FormFeedback>
            )}
          </>
        ) : (
          <div className="text-muted font-size-11">Currently pursuing</div>
        )}
      </FormGroup>
    </Col>
    <Col md={2}>
      <FormGroup>
        <Label className="font-size-12 fw-medium">Grade <RequiredStar /></Label>
        <Input
          type="text"
          value={qual.grade || ''}
          placeholder="e.g. A / 8.5"
          onChange={(e) => handleQualificationChange(index, 'grade', e.target.value)}
          invalid={!!errors[`qualifications[${index}].grade`]}
          className="form-control-sm"
        />
        {errors[`qualifications[${index}].grade`] && (
          <FormFeedback className="font-size-11">{errors[`qualifications[${index}].grade`]}</FormFeedback>
        )}
      </FormGroup>
    </Col>
    <Col md={1} className="mb-4">
      <FaTrash
        className="remove-qualification"
        onClick={() => removeQualificationRow(index)}
        title="Remove Qualification"
        color={defaultTheme.redColor}
      />
    </Col>
  </Row>
);

const ExperienceSection = ({ formData, errors, handleSelectChange, handleCurrentCompanyChange, handleLastCompanyChange, working }) => (
  <>
    <h5 className="mt-3">Experience Details</h5>
    <Row>
      <Col md={3}>
        <FormGroup>
          <Label className="font-size-12 fw-medium">Current Status <RequiredStar /></Label>
          <Select
            options={[{ value: 'Working', label: 'Working' }, { value: 'Serving Notice Period', label: 'Serving Notice Period' }, { value: 'Immediate Joiner', label: 'Immediate Joiner' }]}
            onChange={(val) => handleSelectChange(val, 'experienceDetails.status')}
            value={formData.experienceDetails.status}
            isClearable
            placeholder="Select"
            className="react-select-sm"
          />
          {errors['experienceDetails.status'] && <FormFeedback className="font-size-11 d-block">{errors['experienceDetails.status']}</FormFeedback>}
        </FormGroup>
      </Col>
      <Col md={3}>
        <FormGroup>
          <Label className="font-size-12 fw-medium">Total Years of Experience <RequiredStar /></Label>
          <Select
            options={experienceYears}
            onChange={(val) => handleSelectChange(val, 'experienceDetails.totalExp')}
            value={formData.experienceDetails.totalExp}
            isClearable
            placeholder="Select Years"
            className="react-select-sm"
          />
          {errors['experienceDetails.totalExp'] && <FormFeedback className="font-size-11 d-block">{errors['experienceDetails.totalExp']}</FormFeedback>}
        </FormGroup>
      </Col>
      <Col md={3}>
        <FormGroup>
          <Label className="font-size-12 fw-medium">Real Estate Experience <RequiredStar /></Label>
          <Select
            options={yesNoOptions}
            onChange={(val) => handleSelectChange(val, 'experienceDetails.realEstateExp')}
            value={formData.experienceDetails.realEstateExp}
            isClearable
            placeholder="Select"
            className="react-select-sm"
          />
          {errors['experienceDetails.realEstateExp'] && <FormFeedback className="font-size-11 d-block">{errors['experienceDetails.realEstateExp']}</FormFeedback>}
        </FormGroup>
      </Col>
    </Row>

    <h6 className="mt-2">Current Company Details</h6>
    <Row>
      {[
        { label: 'Previous Company Name', field: 'previousCompanyName' },
        { label: 'Current Location', field: 'currentLocation' },
        { label: 'Department', field: 'department' },
        { label: 'Position', field: 'position' },
      ].map(({ label, field }, i) => (
        <Col md={3} key={i}>
          <FormGroup>
            <Label className="font-size-12 fw-medium">{label} <RequiredStar /></Label>
            <Input
              type="text"
              placeholder={`Enter ${label}`}
              value={formData.experienceDetails.currentCompany[field]}
              onChange={(e) => handleCurrentCompanyChange(field, e.target.value)}
              invalid={!!errors[`currentCompany.${field}`]}
              className="form-control-sm"
            />
            {errors[`currentCompany.${field}`] && <FormFeedback className="font-size-11">{errors[`currentCompany.${field}`]}</FormFeedback>}
          </FormGroup>
        </Col>
      ))}
    </Row>
    <Row>
      <Col md={3}>
        <FormGroup>
          <Label className="font-size-12 fw-medium">Current CTC / Month <RequiredStar /></Label>
          <Input
            type="number"
            placeholder="Enter Current CTC / Month"
            value={formData.experienceDetails.currentCompany.currentCTC}
            onChange={(e) => handleCurrentCompanyChange('currentCTC', e.target.value)}
            invalid={!!errors['currentCompany.currentCTC']}
            className="form-control-sm"
          />
          {errors['currentCompany.currentCTC'] && <FormFeedback className="font-size-11">{errors['currentCompany.currentCTC']}</FormFeedback>}
        </FormGroup>
      </Col>
      <Col md={3}>
        <FormGroup>
          <Label className="font-size-12 fw-medium">Industry <RequiredStar /></Label>
          <Select
            options={industriesOptions}
            onChange={(val) => handleSelectChange(val, 'experienceDetails.currentCompany.industryName')}
            value={formData.experienceDetails.currentCompany.industryName}
            isClearable
            placeholder="Select Industry"
            className="react-select-sm"
          />
          {errors['currentCompany.industryName'] && <FormFeedback className="font-size-11 d-block">{errors['currentCompany.industryName']}</FormFeedback>}
        </FormGroup>
      </Col>
      {working &&
        <Col md={3}>
          <FormGroup>
            <Label className="font-size-12 fw-medium">Notice Period (In Days) <RequiredStar /></Label>
            <Input
              type="number"
              placeholder="Enter Notice Period"
              value={formData.experienceDetails.currentCompany.noticePeriod}
              onChange={(e) => {
                const value = e.target.value;
                // if (value === '' || /^[0-9]\d*$/.test(value)) {
                handleCurrentCompanyChange('noticePeriod', value);
                // }
              }}
              className="form-control-sm"
            />
          </FormGroup>
        </Col>
      }
    </Row>
    <Row>
      <Col md={3}>
        <FormGroup>
          <Label className="font-size-12 fw-medium">Reporting Manager Name</Label>
          <Input
            type="text"
            placeholder="Enter Manager Name"
            value={formData.experienceDetails.currentCompany.reportingManagerName}
            onChange={(e) => handleCurrentCompanyChange('reportingManagerName', e.target.value)}
            className="form-control-sm"
          />
        </FormGroup>
      </Col>
      <Col md={3}>
        <FormGroup>
          <Label className="font-size-12 fw-medium">Reporting Manager Number</Label>
          <Input
            type="text"
            placeholder="Enter Manager Number"
            value={formData.experienceDetails.currentCompany.reportingManagerNumber}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,10}$/.test(value)) {
                handleCurrentCompanyChange('reportingManagerNumber', value);
              }
            }}
            maxLength={10}
            className="form-control-sm"
          />
        </FormGroup>
      </Col>
      <Col md={3}>
        <FormGroup>
          <Label className="font-size-12 fw-medium">Employment Duration Start <RequiredStar /></Label>
          <Input
            type="date"
            value={formData.experienceDetails.currentCompany.employmentDurationStart}
            onChange={(e) => handleCurrentCompanyChange('employmentDurationStart', e.target.value)}
            invalid={!!errors['currentCompany.employmentDurationStart']}
            className="form-control-sm"
          />
          {errors['currentCompany.employmentDurationStart'] && (
            <FormFeedback className="font-size-11">{errors['currentCompany.employmentDurationStart']}</FormFeedback>
          )}
        </FormGroup>
      </Col>
      <Col md={3}>
        <FormGroup>
          <Label className="font-size-12 fw-medium">Employment Duration End</Label>
          <Input
            type="date"
            value={formData.experienceDetails.currentCompany.employmentDurationEnd}
            onChange={(e) => handleCurrentCompanyChange('employmentDurationEnd', e.target.value)}
            className="form-control-sm"
          />
        </FormGroup>
      </Col>
    </Row>

    <h6 className="mt-2">Last 2 Companies</h6>
    {[0, 1].map((i) => (
      <div key={i} className="last-companies-row">
        <Row>
          <Col md={4}>
            <FormGroup>
              <Label className="font-size-12 fw-medium">Previous Company Name</Label>
              <Input
                type="text"
                placeholder="Enter Previous Company Name"
                value={formData.experienceDetails.lastCompanies[i].previousCompanyName}
                onChange={(e) => handleLastCompanyChange(i, 'previousCompanyName', e.target.value)}
                className="form-control-sm"
              />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label className="font-size-12 fw-medium">Company Location {formData.experienceDetails.lastCompanies[i].previousCompanyName&&<RequiredStar/>}</Label>
              <Input
                type="text"
                placeholder="Enter Company Location"
                value={formData.experienceDetails.lastCompanies[i].companyLocation}
                onChange={(e) => handleLastCompanyChange(i, 'companyLocation', e.target.value)}
                className="form-control-sm"
              />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label className="font-size-12 fw-medium">Department {formData.experienceDetails.lastCompanies[i].previousCompanyName&&<RequiredStar/>}</Label>
              <Input
                type="text"
                placeholder="Enter Department"
                value={formData.experienceDetails.lastCompanies[i].department}
                onChange={(e) => handleLastCompanyChange(i, 'department', e.target.value)}
                className="form-control-sm"
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <FormGroup>
              <Label className="font-size-12 fw-medium">Position {formData.experienceDetails.lastCompanies[i].previousCompanyName&&<RequiredStar/>}</Label>
              <Input
                type="text"
                placeholder="Enter Position"
                value={formData.experienceDetails.lastCompanies[i].position}
                onChange={(e) => handleLastCompanyChange(i, 'position', e.target.value)}
                className="form-control-sm"
              />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label className="font-size-12 fw-medium">Industry Name {formData.experienceDetails.lastCompanies[i].previousCompanyName&&<RequiredStar/>}</Label>
              <Select
                options={industriesOptions}
                onChange={(val) => handleLastCompanyChange(i, 'industryName', val)}
                value={formData.experienceDetails.lastCompanies[i].industryName}
                isClearable
                placeholder="Select industryName"
                className="react-select-sm"
              />
              {errors[`lastCompanies[${i}].industryName`] && (
                <FormFeedback className="font-size-11 d-block">{errors[`lastCompanies[${i}].industryName`]}</FormFeedback>
              )}
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label className="font-size-12 fw-medium">Employment Duration Start {formData.experienceDetails.lastCompanies[i].previousCompanyName&&<RequiredStar/>}</Label>
              <Input
                type="date"
                value={formData.experienceDetails.lastCompanies[i].employmentDurationStart}
                onChange={(e) => handleLastCompanyChange(i, 'employmentDurationStart', e.target.value)}
                className="form-control-sm"
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <FormGroup>
              <Label className="font-size-12 fw-medium">Employment Duration End {formData.experienceDetails.lastCompanies[i].previousCompanyName&&<RequiredStar/>}</Label>
              <Input
                type="date"
                value={formData.experienceDetails.lastCompanies[i].employmentDurationEnd}
                onChange={(e) => handleLastCompanyChange(i, 'employmentDurationEnd', e.target.value)}
                className="form-control-sm"
              />
            </FormGroup>
          </Col>
        </Row>
      </div>
    ))}
  </>
);

// Main Component
const CandidateInfoForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const [candidateId, setCandidateId] = useState(null);
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: locationList } = useGet(HR_LOCATION_DROPDOWN, { enabled: !!candidateData });

  // Extract candidateId from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = (params.get('candidateId') || params.get('candidateld'));
    if (id && !isNaN(id)) {
      setCandidateId(parseInt(id));
      ApiClient.get(`${CANDIDATE_HISTORY_BY_ID}${id}`)
        .then(function (response) {
          setLoading(false);
          if (response?.data?.status === 1) {
            setCandidateData(response.data.data);
          }
        })
        .catch(function (error) {
          setLoading(false);
          toast.error(error.message);
        });
    }
    else {
      setLoading(false);
    }
  }, [location.search]);

  // Map locationList to Select options
  const locationOptions = locationList?.data?.data?.map((loc) => ({
    value: loc.key,
    label: loc.value,
  })) || [];

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const validateFieldGroup = (data, fields, prefix = '') => {
    const newErrors = {};
    fields.forEach((field) => {
      const key = prefix ? `${prefix}.${field}` : field;
      const value = prefix ? data[field] : data[key];
      if (!value || (typeof value === 'string' && !value.trim())) {
        newErrors[key] = mandatoryFields[key] || `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    return newErrors;
  };

  const validateForm = () => {
    const newErrors = {
      ...validateFieldGroup(formData, Object.keys(mandatoryFields)),
    };

    if (formData.dob) {
      const dob = new Date(formData.dob);
      const today = new Date();

      let age =
        today.getFullYear() -
        dob.getFullYear() -
        (today.getMonth() < dob.getMonth() ||
          (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
          ? 1
          : 0);

      if (age < 18) {
        newErrors.dob = "Applicant must be at least 18 years old";
      }
    }

    if (formData.vehicle?.value === 'yes' && !formData.vehicleType?.value) {
      newErrors.vehicleType = 'Vehicle Type is required';
    }


    if (candidateData?.fresher && formData.internship?.value === 'yes') {
      Object.assign(newErrors, validateFieldGroup(formData.internshipDetails, ['company', 'location', 'startDate', 'endDate'], 'internshipDetails'));
    }

    if (!candidateData?.fresher) {
      const expFields = ['status', 'totalExp', 'realEstateExp'];
      expFields.forEach((field) => {
        if (!formData.experienceDetails[field]?.value) {
          newErrors[`experienceDetails.${field}`] = `${field === 'realEstateExp' ? 'Real Estate Experience' : field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        }
      });

      const currentCompanyFields = ['previousCompanyName', 'currentLocation', 'department', 'position', 'currentCTC', 'employmentDurationStart', 'industryName'];
      Object.assign(newErrors, validateFieldGroup(formData.experienceDetails.currentCompany, currentCompanyFields, 'currentCompany'));

      formData.experienceDetails.lastCompanies.forEach((company, i) => {
        if (company.previousCompanyName.trim() && !company.industryName?.value) {
          newErrors[`lastCompanies[${i}].industryName`] = 'industryName selection is required';
        }
      });
    }

    if (formData.qualifications.length === 0) {
      newErrors.qualifications = 'At least one qualification is required';
    } else {
      formData.qualifications.forEach((qual, index) => {
        ['qualification', 'institution', 'endYear', 'grade'].forEach((field) => {
          if (field === 'endYear' && qual.pursuing) {
            return;
          }

          const value = field === 'qualification'
            ? qual[field]?.value
            : qual[field]?.toString().trim();

          if (!value) {
            newErrors[`qualifications[${index}].${field}`] =
              `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
          }
        });
        if (!qual.pursuing && qual.startYear && qual.endYear) {
          const start = parseInt(qual.startYear);
          const end = parseInt(qual.endYear);
          if (!isNaN(start) && !isNaN(end) && end <= start) {
            newErrors[`qualifications[${index}].endYear`] =
              'End year must be greater than start year';
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field, value, isNested = false, index = null, subField = null) => {
    setFormData((prev) => {
      let updated;
      if (index !== null && subField) {
        const updatedArray = [...prev[field]];
        updatedArray[index] = { ...updatedArray[index], [subField]: value };
        updated = { ...prev, [field]: updatedArray };
      } else if (field === 'experienceDetails.currentCompany') {
        updated = {
          ...prev,
          experienceDetails: {
            ...prev.experienceDetails,
            currentCompany: { ...prev.experienceDetails.currentCompany, [subField]: value },
          },
        };
      } else if (field.startsWith('lastCompanies')) {
        const [, idx] = field.match(/lastCompanies\[(\d+)\]\.(.+)/) || [];
        const updatedCompanies = prev.experienceDetails.lastCompanies.map((company, i) =>
          i === parseInt(idx) ? { ...company, [subField]: value } : company
        );
        updated = {
          ...prev,
          experienceDetails: { ...prev.experienceDetails, lastCompanies: updatedCompanies },
        };
      } else if (field === 'internshipDetails') {
        updated = {
          ...prev,
          internshipDetails: { ...prev.internshipDetails, [subField]: value },
        };
      } else {
        updated = setFieldValue(prev, field, value, isNested);
      }
      return updated;
    });

    setErrors((prev) => {
      const errorKey = index !== null ? `qualifications[${index}].${subField}` : field.includes('currentCompany') ? 'currentCompany.' + (subField || field.split('.').pop()) : field;
      return { ...prev, [errorKey]: '' };
    });
  };

  const addQualificationRow = () => {
    if (formData.qualifications.length < qualificationOptions.length) {
      setFormData((prev) => ({
        ...prev,
        qualifications: [
          ...prev.qualifications,
          {
            qualification: null,
            institution: '',
            startYear: '',
            endYear: '',
            grade: '',
            fieldOfStudy: '',
            pursuing: false
          }
        ]
      }));
      setErrors((prev) => ({ ...prev, qualifications: '' }));
    }
  };

  const removeQualificationRow = (index) => {
    const updated = formData.qualifications.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, qualifications: updated }));
    setErrors((prev) => ({
      ...prev,
      ...Object.keys(prev)
        .filter((key) => key.startsWith(`qualifications[${index}]`))
        .reduce((acc, key) => ({ ...acc, [key]: '' }), {}),
      qualifications: updated.length === 0 ? 'At least one qualification is required' : '',
    }));
  };

  const getAvailableQualifications = (index) => {
    const selected = formData.qualifications.map((q) => q?.qualification?.value);
    return qualificationOptions.filter(
      (opt) => !selected.includes(opt.value) || formData.qualifications[index]?.qualification?.value === opt.value
    );
  };

  const buildPayload = () => ({
    candidateId: candidateId,
    experiences: !candidateData?.fresher ? [
      {
        employmentFromDate: formData.experienceDetails.currentCompany.employmentDurationStart,
        employmentToDate: formData.experienceDetails.currentCompany.employmentDurationEnd || '',
        companyName: formData.experienceDetails.currentCompany.previousCompanyName,
        companyLocation: formData.experienceDetails.currentCompany.currentLocation,
        department: formData.experienceDetails.currentCompany.department,
        position: formData.experienceDetails.currentCompany.position,
        currentCTC: formData.experienceDetails.currentCompany.currentCTC,
        noticePeriod: formData.experienceDetails.currentCompany.noticePeriod || 0,
        reportingManagerName: formData.experienceDetails.currentCompany.reportingManagerName || '',
        reportingManagerNumber: formData.experienceDetails.currentCompany.reportingManagerNumber || '',
        industryName: formData.experienceDetails.currentCompany.industryName?.value || '',
        currentCompany: true,
      },
      ...formData.experienceDetails.lastCompanies
        .filter((company) => company.previousCompanyName.trim())
        .map((company) => ({
          employmentFromDate: company.employmentDurationStart,
          employmentToDate: company.employmentDurationEnd,
          companyName: company.previousCompanyName,
          companyLocation: company.companyLocation,
          department: company.department,
          position: company.position,
          currentCTC: '',
          noticePeriod: 0,
          reportingManagerName: '',
          reportingManagerNumber: '',
          industryName: company.industryName?.value || '',
          currentCompany: false,
        })),
    ] : [],
    vehicle: {
      hasVehicle: formData.vehicle?.value === 'yes',
      vehicleType: formData.vehicleType?.value || null,
      hasDrivingLicense: formData.hasLicense?.value === 'yes',
    },
    qualifications: formData.qualifications.map((qual) => ({
      instituteName: qual.institution || '',
      degree: qual.qualification?.value || '',
      fieldOfStudy: qual.fieldOfStudy || '',
      startYear: qual.startYear ? parseInt(qual.startYear) : 0,
      endYear: qual.pursuing ? 0 : (qual.endYear ? parseInt(qual.endYear) : 0),
      grade: qual.grade || '',
      pursuing: !!qual.pursuing
    })),
    preferredLocationId: formData.location?.value || 0,
    firstName: formData.firstName,
    dateOfBirth: formData.dob,
    expectedSalary: formData.expectedSalary,
    currentStatus: formData.experienceDetails.status?.value || '',
    totalYearsOfExperience: formData.experienceDetails.totalExp?.value || '',
    fresher: candidateData?.fresher,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const payload = buildPayload();
      if (candidateData?.fresher && formData.internship?.value === 'yes') {
        payload.experiences.push({
          employmentFromDate: formData.internshipDetails.startDate,
          employmentToDate: formData.internshipDetails.endDate,
          companyName: formData.internshipDetails.company,
          companyLocation: formData.internshipDetails.location,
          department: '',
          position: '',
          currentCTC: formData.internshipDetails.stipend || '',
          noticePeriod: '',
          reportingManagerName: '',
          reportingManagerNumber: '',
          industryName: '',
          currentCompany: false,
        });
      }
      fillCandidateForm(payload);
    }
  };

  const { isPending: addLoading, mutate: fillCandidateForm } = usePost(
    CANDIDATE_FILL_MAIL_FORM,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          resetForm();
          window.location.reload();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => toast.error(err.message),
    }
  );

  const renderInput = ({ label, name, placeholder, type = 'text', value = formData[name], required = true, onChange = (e) => handleFieldChange(name, e.target.value) }) => (
    <FormGroup className="mb-2">
      <Label className="font-size-12 fw-medium">{label} {required && <RequiredStar />}</Label>
      <Input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        invalid={!!errors[name]}
        className="form-control-sm"
      />
      {errors[name] && <FormFeedback className="font-size-11">{errors[name]}</FormFeedback>}
    </FormGroup>
  );

  const renderSelect = ({ label, field, options, placeholder, value = formData[field.split('.')[0]]?.[field.split('.')[1]] || formData[field], required = true, onChange = (val) => handleFieldChange(field, val, field.includes('.')) }) => (
    <FormGroup className="mb-2">
      <Label className="font-size-12 fw-medium">{label} {required && <RequiredStar />}</Label>
      <Select
        options={options}
        onChange={onChange}
        value={value}
        isClearable
        placeholder={placeholder}
        className="react-select-sm"
        isDisabled={!options.length}
      />
      {errors[field] && <FormFeedback className="font-size-11 d-block">{errors[field]}</FormFeedback>}
    </FormGroup>
  );

  return (
    <div>
      {(addLoading || loading) && <ScreenLoader />}
      <Container>
        {!candidateData ? (
          <NoData />
        ) : candidateData?.formFilled ? (
          <SuccessCard candidateData={candidateData} title={'Form Submitted'} message="We've received your application and will review it shortly. Our team will be in touch with you soon regarding the next steps." />
        ) :
          <Card className="candidate-form-card">
            <Breadcrumbs title="Candidate" breadcrumbItem="Information" />
            <Form onSubmit={handleSubmit}>
              <h5>Personal Details</h5>
              <Row>
                {[
                  { label: 'Applicant Name', name: 'firstName', placeholder: 'Enter Applicant Name' },
                ].map(({ label, name, placeholder, required }, i) => (
                  <Col md={3} key={i}>
                    {renderInput({ label, name, placeholder, required })}
                  </Col>
                ))}
                <Col md={3}>
                  {renderSelect({ label: 'Preferred Location', field: 'location', options: locationOptions, placeholder: 'Select Location' })}
                </Col>
                <Col md={3}>{renderInput({ label: 'Date of Birth', name: 'dob', placeholder: 'Select Date of Birth', type: 'date' })}</Col>
                <Col md={3}>{renderInput({ label: 'Expected Salary', name: 'expectedSalary', placeholder: 'Enter expected salary', type: 'number' })}</Col>
              </Row>

              {candidateData?.fresher && (
                <>
                  <Row className="mt-2">
                    <Col md={3}>
                      {renderSelect({ label: 'Any Internship?', field: 'internship', options: yesNoOptions, placeholder: 'Select', required: false })}
                    </Col>
                  </Row>
                  {formData.internship?.value === 'yes' && (
                    <Row>
                      {[
                        { field: 'company', label: 'Company', required: true },
                        { field: 'location', label: 'Location', required: true },
                        { field: 'startDate', label: 'Start Date', required: true, type: 'date' },
                        { field: 'endDate', label: 'End Date', required: true, type: 'date' },
                        { field: 'stipend', label: 'Stipend', required: false },
                      ].map(({ field, label, required, type = 'text' }, i) => (
                        <Col md={3} key={i}>
                          <FormGroup className="mb-2">
                            <Label className="font-size-12 fw-medium">{label} {required && <RequiredStar />}</Label>
                            <Input
                              type={type}
                              placeholder={`Enter ${label}`}
                              value={formData.internshipDetails[field]}
                              onChange={(e) => handleFieldChange('internshipDetails', e.target.value, false, null, field)}
                              invalid={!!errors[`internshipDetails.${field}`]}
                              className="form-control-sm"
                            />
                            {errors[`internshipDetails.${field}`] && <FormFeedback className="font-size-11">{errors[`internshipDetails.${field}`]}</FormFeedback>}
                          </FormGroup>
                        </Col>
                      ))}
                    </Row>
                  )}
                </>
              )}

              {!candidateData?.fresher && (
                <ExperienceSection
                  formData={formData}
                  errors={errors}
                  handleSelectChange={(val, field) => handleFieldChange(field, val, true)}
                  handleCurrentCompanyChange={(field, value) => handleFieldChange('experienceDetails.currentCompany', value, false, null, field)}
                  handleLastCompanyChange={(index, field, value) => handleFieldChange(`lastCompanies[${index}].${field}`, value, false, null, field)}
                  working={candidateData?.working}
                />
              )}

              <Row className="mt-2">
                <Col md={3}>{renderSelect({ label: 'Do you have a Vehicle?', field: 'vehicle', options: yesNoOptions, placeholder: 'Select' })}</Col>
                {formData.vehicle?.value === 'yes' && (
                  <Col md={3}>
                    {renderSelect({ label: 'Vehicle Type', field: 'vehicleType', options: vehicleTypeOptions, placeholder: 'Select' })}
                  </Col>
                )}
                <Col md={3}>{renderSelect({ label: 'Driving License', field: 'hasLicense', options: yesNoOptions, placeholder: 'Select' })}</Col>
              </Row>

              <div className="section-divider" />
              <h5 className="text-success">Education Qualifications</h5>
              {errors.qualifications && <div className="text-danger font-size-11 mb-2">{errors.qualifications}</div>}
              {formData.qualifications.map((qual, index) => (
                <QualificationRow
                  key={index}
                  qual={qual}
                  index={index}
                  errors={errors}
                  formData={formData}
                  handleQualificationChange={(i, field, value) => handleFieldChange('qualifications', value, false, i, field)}
                  removeQualificationRow={removeQualificationRow}
                  getAvailableQualifications={getAvailableQualifications}
                />
              ))}
              {formData.qualifications.length < 1 && (
                <Button color="outline-info" className="mb-3" onClick={addQualificationRow}>
                  + Add Qualification
                </Button>
              )}

              <div className="text-end mt-3">
                <Button color="primary" type="submit">Submit</Button>
              </div>
            </Form>
          </Card>
        }
      </Container>
    </div>
  );
};

export default CandidateInfoForm;