import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { Container, Card, CardBody, Row, Col, Table, Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Input } from 'reactstrap';
import { formatActionType, formatDate, formatDateTime, formatTimeTo12Hour, RequiredStar } from '../../helpers/function_helper';
import { MdEmail, MdPhone, MdCalendarToday, MdPerson, MdLocationOn, MdMoney, MdDescription } from "react-icons/md";
import { FaCar, FaIdCard, FaUserTie, FaFilePdf } from "react-icons/fa";
import { defaultTheme } from '../../helpers/defaultTheme';
import { hrImageBaseUrl } from '../../helpers/api_helper';
import { toast } from 'react-toastify';
import { useGet, usePost } from '../../Hooks/useApi';
import { GET_ALL_SUB_TEAM_DROPDOWN, GET_MY_TEAM_BY_EMP_CODE, MAINTEAM_HANDOVER_TO_HR } from '../../helpers/url_helper';
import Select from "react-select";
import ScreenLoader from '../../constants/ScreenLoader';
import { useUserStore } from '../../store/useUserStore';
import NoData from './NoData.js'

export default function HandoverCandidateHistory() {
  const location = useLocation();
  const { rowData, filters, page } = location.state || {};
  const navigate = useNavigate();
  const [confirmationModal, setConfirmationModal] = useState(false);
  const { mainTeam, empCode, userName } = useUserStore((state) => state.user);
  const [decision, setDecision] = useState(null);
  const [subTeam, setSubTeam] = useState(null);
  const [reportingManagerName, setReportingManagerName] = useState(null);
  const [rating, setRating] = useState(null);
  const [payType, setPayType] = useState(null);
  const [salaryStart, setSalaryStart] = useState("");
  const [salaryLast, setSalaryLast] = useState("");
  const [remarksRating, setRemarksRating] = useState("");
  const [doj, setDoj] = useState("");
  const { data: subTeams } = useGet(`${GET_ALL_SUB_TEAM_DROPDOWN}${mainTeam}`, { enabled: Boolean(mainTeam) });
  const subTeamEmpCode = subTeam?.label?.match(/\d+/)[0];
  const { data: teamList } = useGet(GET_MY_TEAM_BY_EMP_CODE + subTeamEmpCode, { enabled: Boolean(subTeam) });

  const decisionOptions = [
    { value: 'Accept', label: 'Accept' },
    { value: 'OnHold', label: 'On Hold' },
    { value: 'RELEASED', label: 'Release' },
    { value: 'Reject', label: 'Reject' }
  ];

  const ratingOptions = [
    { value: 'Unsatisfied', label: 'Unsatisfied' },
    { value: 'Satisfactory', label: 'Satisfactory' },
    { value: 'Average', label: 'Average' },
    { value: 'AboveAverage', label: 'Above Average' },
    { value: 'ExtraOrdinary', label: 'Extraordinary' }
  ];

  const payOptions = [
    { label: "Contractual", value: "Contractual" },
    { label: "Permanent", value: "Permanent" },
    { label: "Trainee", value: "Trainee" }
  ]

  const handleDecisionChange = (selectedOption) => {
    setDecision(selectedOption);
    if (selectedOption?.value === 'Reject') {
      setSubTeam(null);
      setReportingManagerName(null);
      setSalaryStart("");
      setSalaryLast("");
      setDoj("");
    }
  };

  const toggleConfirmationModal = () => {
    const interviewDate = new Date(rowData?.interviews?.[0]?.scheduledAtDate);
    const dateOfJoining = doj ? new Date(doj) : null;

    if (!decision) {
      toast.error('Please Select Decision');
    } else if (!rating && decision.value !== 'RELEASED') {
      toast.error('Please Select Rating');
    } else if (!remarksRating) {
      toast.error('Please Enter Remarks');
    }
    else if (decision.value === 'Accept') {
      if (rowData?.department === 'Sales' && !subTeam) {
        toast.error('Please Select Sub Team');
      } else if (rowData?.department === 'Sales' && !reportingManagerName) {
        toast.error('Please Select Reporting Manager');
      } else if (!salaryStart) {
        toast.error('Please enter the starting salary range.');
      } else if (!salaryLast) {
        toast.error('Please enter the ending salary range.');
      } else if (Number(salaryLast) <= Number(salaryStart)) {
        toast.error('Ending salary must be greater than the starting salary.');
      } else if (Number(salaryStart).toString().length < 5) {
        toast.error('Starting salary must be at least 5 digits long.');
      } else if (Number(salaryLast).toString().length < 5) {
        toast.error('Ending salary must be at least 5 digits long.');
      } else if (!payType) {
        toast.error('Please Select Pay Type');
      }
      else if (interviewDate && dateOfJoining && dateOfJoining < interviewDate) {
        toast.error('Date of Joining should not be before the Interview Date');
      } else {
        setConfirmationModal(!confirmationModal);
      }
    } else {
      setConfirmationModal(!confirmationModal);
    }
  };

  const handleInitiateHandover = async () => {
    let payload;
    if (decision.value === 'Accept') {
      payload = {
        candidateId: rowData.id,
        mainTeam: mainTeam,
        subTeam: rowData?.department === 'Sales' ? subTeam.value.trim() : 'SA',
        reportingManagerName: rowData?.department === 'Sales' ? reportingManagerName.label : userName,
        reportingManagerCode: rowData?.department === 'Sales' ? reportingManagerName.value : empCode,
        offeredPosition: "",
        salary: salaryStart + '-' + salaryLast,
        rating: rating.value,
        remarksRating: remarksRating,
        status: "SELECTED",
        doj: doj,
        payType: payType?.value
      };
    } else {
      payload = {
        candidateId: rowData.id,
        mainTeam: mainTeam,
        subTeam: mainTeam,
        reportingManagerName: userName,
        reportingManagerCode: empCode,
        offeredPosition: "",
        salary: "",
        rating: rating?.value,
        remarksRating: remarksRating,
        status: decision?.value === 'OnHold' ? 'ON_HOLD ' : decision?.value === 'RELEASED' ? 'RELEASED' : 'NOT_SELECTED',
        doj: "",
        payType: null
      };
    }

    handoverToMainTeam(payload);
  };

  const { isPending: addLoading, mutate: handoverToMainTeam } = usePost(
    MAINTEAM_HANDOVER_TO_HR,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          resetForm();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => toast.error(err.message),
    }
  );

  const resetForm = () => {
    setDecision(null);
    setSubTeam(null);
    setReportingManagerName(null);
    setRating(null);
    setSalaryStart("");
    setSalaryLast("")
    setRemarksRating("");
    setDoj("");
    setConfirmationModal(false);
    navigate('/assigned-candidate-data')
  };

  if (!rowData) {
    return (
      <PageContent>
        <Breadcrumbs title="HR Module" breadcrumbItem="Candidate History" />
        <NoData />
      </PageContent>
    );
  }

  return (
    <PageContent>
      <Breadcrumbs title="HR Module" breadcrumbItem="Candidate Information" />
      {addLoading && <ScreenLoader />}
      <Container fluid>
        <div className="d-flex justify-content-end text-end mb-2">
          <button
            onClick={() => navigate("/assigned-candidate-data", {
              state: {
                filters: filters,
                page: page
              }
            })}
            style={{
              padding: '6px 12px',
              backgroundColor: defaultTheme.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
        </div>
        <Card className="shadow">
          <CardBody>
            <h5 className="mb-4 border-bottom pb-2 text-secondary d-flex align-items-center">
              <MdPerson className="me-2" /> Candidate Profile
            </h5>

            {/* Personal Information */}
            <h6 className="mb-3 text-primary">Part 1 :</h6>

            <Row className="mb-3">
              <Col xs={12} sm={6} md={3}>
                <strong>Name:</strong>
                <div className="text-muted">
                  {rowData.firstName}
                </div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <strong><MdEmail className="me-1 text-primary" />Email:</strong>
                <div className="text-muted">{rowData.email || '-'}</div>
              </Col>

              <Col xs={12} sm={6} md={3}>
                <strong><MdPhone className="me-1 text-primary" />Phone:</strong>
                <div className="text-muted">{rowData.phone || '-'}</div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <strong><FaUserTie className="me-1 text-primary" />Position:</strong>
                <div className="text-muted">{rowData.jobTitle || '-'}</div>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={12} sm={6} md={3}>
                <strong><MdCalendarToday className="me-1 text-primary" />Date of Birth:</strong>
                <div className="text-muted">{formatDate(rowData.dateOfBirth) || '-'}</div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <strong><MdLocationOn className="me-1 text-primary" />Preferred Location:</strong>
                <div className="text-muted">{rowData.preferredLocationName || '-'}</div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                {rowData.documents && rowData.documents.length > 0 && (
                  (() => {
                    const resumeDoc = rowData.documents.find(doc => doc.documentType === 'RESUME');
                    return resumeDoc ? (
                      <>
                        <strong>Resume:</strong>
                        <div className="text-muted">
                          <a
                            href={`${hrImageBaseUrl}${resumeDoc.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="Open Resume"
                            style={{ fontSize: '17px' }}
                          >
                            <FaFilePdf className="w-5 h-5" color={defaultTheme.redColor} />
                          </a>
                        </div>
                      </>
                    ) : null;
                  })()
                )}
              </Col>
            </Row>

            <hr className="dashed-divider" />
            {/* Professional Information */}
            <h6 className="mb-3 text-primary">Part 2 : </h6>
            <Row className="mb-3">
              <Col xs={12} sm={6} md={3}>
                <strong><MdMoney className="me-1 text-primary" />Current CTC:</strong>
                <div className="text-muted">₹{rowData.currentCtc || '-'}</div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <strong><MdMoney className="me-1 text-primary" />Expected Salary:</strong>
                <div className="text-muted">₹{rowData.expectedSalary || '-'}</div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <strong>Notice Period:</strong>
                <div className="text-muted">{rowData.noticePeriod ? `${rowData.noticePeriod} days` : '-'}</div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <strong>Total Experience:</strong>
                <div className="text-muted">{rowData.totalYearsOfExperience ? rowData.totalYearsOfExperience + ' Years' : '-'}</div>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={12} sm={6} md={3}>
                <strong>Status:</strong>
                <div className="text-muted">{formatActionType(rowData.status) || '-'}</div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <strong>Current Status:</strong>
                <div className="text-muted">{rowData.currentStatus || '-'}</div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <strong>Working:</strong>
                <div className="text-muted">{rowData.working ? 'Yes' : 'No'}</div>
              </Col>
            </Row>

            <h6 className="mb-3 text-primary">Vehicle Details</h6>
            <Row className="mb-3">
              <Col xs={12} sm={6} md={3}>
                <strong><FaCar className="me-1 text-primary" />Has Vehicle:</strong>
                <div className="text-muted">{rowData.vehicleDetails?.hasVehicle ? 'Yes' : 'No'}</div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <strong><FaCar className="me-1 text-primary" />Vehicle Type:</strong>
                <div className="text-muted">{rowData.vehicleDetails?.vehicleType || '-'}</div>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <strong><FaIdCard className="me-1 text-primary" />Has Driving License:</strong>
                <div className="text-muted">{rowData.vehicleDetails?.hasDrivingLicense ? 'Yes' : 'No'}</div>
              </Col>
            </Row>

            {/* Interviews */}
            <h6 className="mb-3 text-primary">Interviews</h6>
            <Row className="mb-3">
              <Col xs={12}>
                {rowData.interviews && rowData.interviews.length > 0 ? (
                  <Table bordered responsive>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowData?.interviews?.map((interview, index) => (
                        <tr key={index}>
                          <td>{formatDate(interview?.scheduledAtDate) || '-'}</td>
                          <td>
                            {interview?.scheduledAtTime && interview?.scheduledToTime
                              ? `${formatTimeTo12Hour(interview?.scheduledAtTime)} - ${formatTimeTo12Hour(interview?.scheduledToTime)}`
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-muted">-</div>
                )}
              </Col>
            </Row>

            {/* Experiences */}
            <h6 className="mb-3 text-primary">{rowData.fresher ? 'Internship Details' : 'Job Experience'}</h6>
            <Row className="mb-3">
              <Col xs={12}>
                {rowData.experiences && rowData.experiences.length > 0 ? (
                  <Table bordered responsive>
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>Location</th>
                        {!rowData.fresher && <th>Job Title</th>}
                        {!rowData.fresher && <th>Department</th>}
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>CTC</th>
                        {!rowData.fresher && <th>Notice Period</th>}
                        <th>Current Company</th>
                        <th>Industry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowData.experiences.map((exp, index) => (
                        <tr key={index}>
                          <td>{exp.companyName || '-'}</td>
                          <td>{exp.companyLocation || '-'}</td>
                          {!rowData.fresher && <td>{exp.jobTitle || '-'}</td>}
                          {!rowData.fresher && <td>{exp.department || '-'}</td>}
                          <td>{formatDate(exp.startDate) || '-'}</td>
                          <td>{formatDate(exp.endDate) || '-'}</td>
                          <td>{exp.currentCTC || '-'}</td>
                          {!rowData.fresher && <td>{exp.noticePeriod || '-'}</td>}
                          <td>{exp.current ? 'Yes' : 'No'}</td>
                          <td>{exp.industryName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-muted">-</div>
                )}
              </Col>
            </Row>

            {/* Education */}
            <h6 className="mb-3 text-primary">Education</h6>
            <Row className="mb-3">
              <Col xs={12}>
                {rowData.educations && rowData.educations.length > 0 ? (
                  <Table bordered responsive>
                    <thead>
                      <tr>
                        <th>Degree</th>
                        <th>Institute</th>
                        <th>Start Year</th>
                        <th>End Year</th>
                        <th>Pursuing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowData.educations.map((edu, index) => (
                        <tr key={index}>
                          <td>{formatActionType(edu.degree) || '-'}</td>
                          <td>{edu.instituteName || '-'}</td>
                          <td>{edu.startYear || '-'}</td>
                          <td>{edu.endYear || '-'}</td>
                          <td>{edu.pursuing ? 'YES' : 'NO' || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-muted">-</div>
                )}
              </Col>
            </Row>

            {/* Handovers */}
            <h6 className="mb-3 text-primary">Handovers</h6>
            <Row className="mb-3">
              <Col xs={12}>
                {rowData.handovers && rowData.handovers.length > 0 ? (
                  <Table bordered responsive>
                    <thead>
                      <tr>
                        <th>Main Team</th>
                        <th>Sub Team</th>
                        <th>Reporting Manager</th>
                        <th>Rating</th>
                        <th>Salary/Contractual Pay Range</th>
                        <th>Remarks</th>
                        <th>Handover By</th>
                        <th>Handover At</th>
                        <th>Handover Status</th>
                        <th>DOJ</th>
                        <th>Pay Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowData.handovers
                        .filter(handover => handover.mainTeam === mainTeam) // <-- Filter here
                        .map((handover, index) => (
                          <tr key={handover.id || index}>
                            <td>{handover.mainTeam || '-'}</td>
                            <td>{handover.handoverStatus !== 'NOT_SELECTED' ? handover.subTeam : '' || '-'}</td>
                            <td>{handover.handoverStatus !== 'NOT_SELECTED' ? handover.reportingManagerName : '' || '-'}</td>
                            <td>{handover.rating || '-'}</td>
                            <td>{handover.salary || '-'}</td>
                            <td>{handover.remarksRating || '-'}</td>
                            <td>
                              {handover?.handoverBy?.name
                                ? `${handover.handoverBy.name} (${handover.handoverBy.employeeCode})`
                                : '-'}
                            </td>
                            <td>{handover?.handoverDate ? formatDateTime(handover?.handoverDate) : '—'}</td>
                            <td>{formatActionType(handover.handoverStatus) || '-'}</td>
                            <td>{formatDate(handover.doj) || '-'}</td>
                            <td>{handover.payrollType || '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-muted">-</div>
                )}
              </Col>
            </Row>

            {/* Professional Information */}
            {
              (
                !['SELECTED', 'NOT_SELECTED', 'RELEASED'].includes(rowData.handovers?.[rowData.handovers.length - 1]?.handoverStatus) &&
                rowData.handovers?.[rowData.handovers.length - 1]?.mainTeam === mainTeam
              )
              &&
              <div>
                <hr className="dashed-divider" />
                <h6 className="mb-3 text-primary">Part 3 : </h6>

                {/* Handover Form */}
                <h6 className="mb-3 text-primary">Handover Form</h6>
                <Row className="mb-3">
                  <Col md="3" className="mt-2">
                    <h6 className="font-size-11 fw-semibold text-muted">Select Decision <span className="text-danger">*</span></h6>
                    <Select
                      isClearable
                      options={decisionOptions}
                      className="react-select"
                      onChange={handleDecisionChange}
                      value={decision}
                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                      menuPortalTarget={document.body}
                    />
                  </Col>
                </Row>
                {decision?.value === 'Accept' && (
                  <>
                    <Row>
                      {rowData?.department === 'Sales' &&
                        <Col md="3" className="mt-2">
                          <h6 className="font-size-11 fw-semibold text-muted">Select Sub Team <RequiredStar /></h6>
                          <Select
                            isClearable
                            options={subTeams?.data?.data || []}
                            className="react-select"
                            onChange={setSubTeam}
                            value={subTeam}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            menuPortalTarget={document.body}
                          />
                        </Col>
                      }
                      {rowData?.department === 'Sales' &&
                        <Col md="3" className="mt-2">
                          <h6 className="font-size-11 fw-semibold text-muted">Reporting Manager Name <RequiredStar /></h6>
                          <Select
                            isClearable
                            options={teamList?.data?.data || []}
                            className="react-select"
                            isDisabled={!subTeam}
                            onChange={setReportingManagerName}
                            value={reportingManagerName}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            menuPortalTarget={document.body}
                          />
                        </Col>
                      }
                      <Col md="3" className="mt-2">
                        <h6 className="font-size-11 fw-semibold text-muted">Select Rating <RequiredStar /></h6>
                        <Select
                          isClearable
                          options={ratingOptions}
                          className="react-select"
                          onChange={setRating}
                          value={rating}
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                          menuPortalTarget={document.body}
                        />
                      </Col>
                      <Col md="3" className="mt-2">
                        <h6 className="font-size-11 fw-semibold text-muted">Date of Joining </h6>
                        <FormGroup>
                          <Input
                            type="date"
                            value={doj}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setDoj(e.target.value)}
                            className="form-control"
                          />
                        </FormGroup>
                      </Col>
                      <Col md="3" className="mt-2">
                        <h6 className="font-size-11 fw-semibold text-muted">Salary Range Start <RequiredStar /></h6>
                        <FormGroup>
                          <Input
                            type="number"
                            value={salaryStart}
                            onChange={(e) => setSalaryStart(e.target.value)}
                            placeholder="Enter salary Range Start"
                          />
                        </FormGroup>
                      </Col>
                      <Col md="3" className="mt-2">
                        <h6 className="font-size-11 fw-semibold text-muted">Salary Range To <RequiredStar /></h6>
                        <FormGroup>
                          <Input
                            type="number"
                            value={salaryLast}
                            onChange={(e) => setSalaryLast(e.target.value)}
                            placeholder="Enter salary Range Last"
                          />
                        </FormGroup>
                      </Col>
                      <Col md="3" className="mt-2">
                        <h6 className="font-size-11 fw-semibold text-muted">Select Pay Type <RequiredStar /></h6>
                        <Select
                          isClearable
                          options={payOptions}
                          className="react-select"
                          onChange={setPayType}
                          value={payType}
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                          menuPortalTarget={document.body}
                        />
                      </Col>
                      <Col md="6" className="mt-2">
                        <h6 className="font-size-11 fw-semibold text-muted">Remarks <RequiredStar /></h6>
                        <FormGroup>
                          <Input
                            type="textarea"
                            value={remarksRating}
                            onChange={(e) => setRemarksRating(e.target.value)}
                            placeholder="Enter remarks"
                            rows={4}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </>
                )}
                {(decision?.value === 'Reject' || decision?.value === 'OnHold' || decision?.value === 'RELEASED') && (
                  <Row className="mb-2">
                    {decision?.value !== 'RELEASED' &&
                      <Col md="3" className="mt-2">
                        <h6 className="font-size-11 fw-semibold text-muted">Select Rating <RequiredStar /></h6>
                        <Select
                          isClearable
                          options={ratingOptions}
                          className="react-select"
                          onChange={setRating}
                          value={rating}
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                          menuPortalTarget={document.body}
                        />
                      </Col>
                    }
                    <Col md="6" className="mt-2">
                      <h6 className="font-size-11 fw-semibold text-muted">Remarks <RequiredStar /></h6>
                      <FormGroup>
                        <Input
                          type="textarea"
                          value={remarksRating}
                          onChange={(e) => setRemarksRating(e.target.value)}
                          placeholder="Enter remarks"
                          rows={4}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                )}

                <Row>
                  <Col md="3" className="mt-2">
                    <div className="d-flex align-items-center">
                      <Button
                        color="primary"
                        onClick={toggleConfirmationModal}
                      >
                        Submit
                      </Button>
                      <Button
                        className='ms-2'
                        color="secondary"
                        onClick={resetForm}
                      >
                        Clear
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>
            }

            {((rowData.handovers?.[rowData.handovers.length - 1]?.mainTeam) === mainTeam && rowData.salary) &&
              <div className='mt-3'>
                <h6 className="section-heading text-primary mb-4">Part 3: Final Overview</h6>
                <Row className="salary-remarks-section mb-4">
                  <Col xs={12} sm={6} md={3} className="mb-3 mb-sm-0">
                    <div className="info-block">
                      <strong className="label">
                        <MdMoney className="icon me-1 text-primary" />
                        Final Salary
                      </strong>
                      <div className="value text-primary">
                        ₹{rowData.salary || '-'}
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <div className="info-block">
                      <strong className="label">
                        <MdDescription className="icon me-1 text-primary" />
                        Final Status
                      </strong>
                      <div className="value text-primary">
                        {rowData?.finalStatusEnum || '-'}
                      </div>
                    </div>
                  </Col>

                  <Col xs={12} sm={6} md={3}>
                    <div className="info-block">
                      <strong className="label">
                        <MdDescription className="icon me-1 text-primary" />
                        Final Designation
                      </strong>
                      <div className="value text-primary">
                        {rowData?.designation || '-'}
                      </div>
                    </div>
                  </Col>

                  <Col xs={12} sm={6} md={3}>
                    <div className="info-block">
                      <strong className="label">
                        <MdLocationOn className="icon me-1 text-primary" />
                        Final Location
                      </strong>
                      <div className="value text-primary">
                        {rowData.finalLocation || '-'}
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={6} md={9} className='mt-3'>
                    <div className="info-block">
                      <strong className="label">
                        <MdDescription className="icon me-1 text-primary" />
                        Final Remarks
                      </strong>
                      <div className="value text-primary">
                        {rowData.finalRemarks || '-'}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            }
          </CardBody>
        </Card>

        {/* Confirmation Modal */}
        <Modal isOpen={confirmationModal} toggle={toggleConfirmationModal}>
          <ModalHeader toggle={toggleConfirmationModal}>Confirm Submission</ModalHeader>
          <ModalBody>
            {decision?.value === "OnHold" ? (
              <strong>
                Are you sure you want to place this candidate on hold? This candidate will be automatically rejected if no action is taken within 48 hours.
              </strong>
            ) : (
              <strong>
                Are you sure you want to move this candidate to "{decision?.label}" status?
              </strong>
            )}
          </ModalBody>

          <ModalFooter>
            <Button style={{ backgroundColor: defaultTheme.primary }} onClick={handleInitiateHandover}>Yes</Button>{' '}
            <Button style={{ backgroundColor: defaultTheme.goldColorLogo }} onClick={toggleConfirmationModal}>No</Button>
          </ModalFooter>
        </Modal>

      </Container>
    </PageContent>
  );
}