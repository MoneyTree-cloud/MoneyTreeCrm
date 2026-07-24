import { useEffect, useRef, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Input, Container, Card, CardBody, Row, Col, InputGroupText, InputGroup } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { formatActionType, formatDate, formatDateTime, RequiredStar, WordWrapCell } from '../../helpers/function_helper';
import { toast } from 'react-toastify';
import { defaultTheme } from '../../helpers/defaultTheme';
import ApiClient from '../../helpers/api_helper';
import { GET_PROSPECT_MEETING_DETAILS, MARK_DND_ADMIN } from '../../helpers/url_helper';
import { useUserStore } from '../../store/useUserStore';
import ScreenLoader from '../../constants/ScreenLoader';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';
import { usePost } from '../../Hooks/useApi';
import { decryptData } from '../../components/Common/CryptoUtils';
import AppTable from '../../components/Common/Table';
import { FaSearch } from 'react-icons/fa';

export default function MarkDNDAdmin() {
  const fileRef = useRef(null);
  const [mobileNo, setMobileNo] = useState('');
  const [clientName, setClientName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { userId, userName, empCode } = useUserStore((state) => state.user);
  const [accessGranted, setAccessGranted] = useState(null);
  const [file, setFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [reportType, setReportType] = useState("Prospects");
  const [prospectData, setProspectData] = useState([]);
  const [suspectData, setSuspectData] = useState([]);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'mark-dnd-admin');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mobileNo || isNaN(mobileNo)) {
      toast.error('Please enter a valid mobile number');
      return;
    }
    if (mobileNo.length < 10) {
      toast.error('Mobile number must be 10 digits long');
      return;
    }
    if (!remarks) {
      toast.error('Remarks are mandatory!');
      return;
    }
    if (!file) {
      toast.error('File is mandatory!');
      return;
    }

    setModalOpen(true); // Open confirmation modal when valid mobile number and remarks are entered
  };

  const handleConfirm = () => {
    setIsPending(true);
    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('mobile', mobileNo);
    formData.append('clientName', clientName);
    formData.append('remarks', remarks);
    formData.append('userId', empCode);
    formData.append('associateName', userName);

    ApiClient.post(MARK_DND_ADMIN, formData)
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          setModalOpen(false);
          handleClear();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message);
      });
  };

  // API call to Show Report
  const { isPending: isLoading, mutate: findMeetProsDetails } = usePost(
    `${GET_PROSPECT_MEETING_DETAILS}${mobileNo}&type=${reportType === "Prospects" ? "0" : "2"}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          const encryptedContent = response.data.data;
          decryptData(encryptedContent).then((decrypted) => {
            if (reportType === "Prospects") {
              setProspectData(decrypted);
            } else {
              setSuspectData(decrypted)
            }
          }).catch((error) => {
            setProspectData([])
            setSuspectData([])
          });
        }
        else {
          if ((response.data.message === 'No Prospects Found.' && reportType === "Prospects")) {
            toast.error('No Prospects Found With Mobile Number ' + mobileNo);
          }
          else if ((response.data.message === 'No Suspects Found.' && reportType === "Suspects")) {
            toast.error('No Suspect Found With Mobile Number ' + mobileNo);
          }
          else {
            toast.error(response.data.message);
          }
          setProspectData([])
          setSuspectData([])
        }
      },
      onError: (err) => {
        toast.error(err.message);
        setProspectData([]);
        setSuspectData([])
      },
    }
  );

  const handleCancel = () => {
    setModalOpen(false); // Close the modal on cancel
  };

  const handleClear = () => {
    setMobileNo('');
    setClientName('');
    setRemarks('');
    setFile(null);
    if (fileRef.current) {
      fileRef.current.value = null; // Clear the file input
    }
    setFileInputKey(Date.now());

  }

  const columnsProspect = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      selector: (row) => row.associateName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.associateName + " (" + row.associateId + ")"}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">MT/ST</span>,
      selector: (row) => row.mainTeam,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.mainTeam + '/' + row.subTeam}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Created Date</span>,
      selector: (row) => row.totalTeamSize,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDate(row.createdDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Type</span>,
      selector: (row) => row.typeName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.typeName}</WordWrapCell>,
    },
  ];

  const columnsSuspect = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      sortable: true,
      width: "6%",
      cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      selector: (row) => row.associateId,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.associateName + " (" + row.associateId + ")"}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Created At</span>,
      selector: (row) => row.createdDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">MT/ST</span>,
      selector: (row) => row.mainTeam,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.mainTeam + '/' + row.subTeam}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Status</span>,
      selector: (row) => row.meetingEndAt,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatActionType(row.status)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Suspect Type</span>,
      selector: (row) => row.suspectType,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatActionType(row.suspectType)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Status Update Date</span>,
      selector: (row) => row.statusUpdateDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.statusUpdateDate)}</WordWrapCell>,
    }
  ];

  const handleRadioChange = (event) => {
    setReportType(event.target.value);
  };

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="DND" breadcrumbItem="Mark DND" />
      {(isPending || isLoading) && <ScreenLoader />}
      <Container>
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <Row className='g-3'>
                <Col md="3">
                  <FormGroup>
                    <h6 className="font-size-11"> Mobile Number <RequiredStar /></h6>
                    <InputGroup>
                      <Input
                        type="text"
                        name="mobileNo"
                        id="mobileNo"
                        maxLength={10}
                        placeholder="Enter mobile number..."
                        value={mobileNo}
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          const numericValue = value.replace(/\D/g, ""); // \D matches any non-digit character
                          setMobileNo(numericValue.slice(0, 10)); // Ensure length does not exceed 10
                        }}
                      />
                      <InputGroupText style={{ cursor: 'pointer', backgroundColor: defaultTheme.primary }} onClick={() => findMeetProsDetails()} title='Search'>
                        <FaSearch color='white' />
                      </InputGroupText>
                    </InputGroup>
                  </FormGroup>
                </Col>
                <Col md="3">
                  <FormGroup>
                    <h6 className="font-size-11"> Client Name </h6>
                    <Input
                      type="text"
                      name="clientName"
                      id="clientName"
                      placeholder="Enter client name..."
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <h6 className="font-size-11"> Remarks <RequiredStar /></h6>
                    <Input
                      type="textarea"
                      name="remarks"
                      id="remarks"
                      rows="2"
                      placeholder="Enter remarks..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="3" className='mb-2'>
                  <FormGroup>
                    <h6 className="font-size-11"> Attachment <RequiredStar /></h6>
                    <Input
                      type="file"
                      key={fileInputKey}
                      name="file"
                      id="file"
                      ref={fileRef}
                      onChange={(e) => setFile(e.target.files[0])}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="3" className='d-flex align-items-center'>
                  <Button color="primary" onClick={handleSubmit} type='submit'>
                    Mark DND
                  </Button>
                  <Button color="secondary" className="ms-2" onClick={handleClear}>
                    Cancel
                  </Button>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>

        {/* Confirmation Modal */}
        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
          <ModalHeader toggle={() => setModalOpen(!modalOpen)}>Confirm Mark DND</ModalHeader>
          <ModalBody>
            Are you sure you want to mark the number as DND with the following details?
            <ul>
              <li><strong>Mobile No:</strong> {mobileNo}</li>
              <li><strong>Client Name:</strong> {clientName || 'N/A'}</li>
              <li><strong>Remarks:</strong> {remarks}</li>
            </ul>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={handleConfirm} style={{ backgroundColor: defaultTheme.primary }}>
              Confirm
            </Button>
            <Button color="secondary" onClick={handleCancel} style={{ backgroundColor: defaultTheme.goldColorLogo }}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

        {/* {(prospectData.length > 0 || suspectData?.length > 0) && */}
        <div className="radio-button-container mt-4 d-flex align-items-center justify-content-center">
          <label className={`radio-label ${reportType === "Prospects" ? "active" : ""}`}>
            <input
              type="radio"
              value="Prospects"
              checked={reportType === "Prospects"}
              onChange={handleRadioChange}
            />
            Prospects
          </label>

          <label className={`radio-label ${reportType === "Suspects" ? "active" : ""}`}>
            <input
              type="radio"
              value="Suspects"
              checked={reportType === "Suspects"}
              onChange={handleRadioChange}
            />
            Suspects
          </label>

        </div>
        {/* } */}
        {(reportType === "Prospects" && prospectData.length > 0) ||
          (reportType === "Suspects" && suspectData.length > 0)
          ? (
            <AppTable
              progressProspects={isPending}
              columns={reportType === "Prospects" ? columnsProspect : columnsSuspect}
              data={reportType === "Prospects" ? prospectData : suspectData}
              paginationServer
              pagination
            />
          ) : null}
      </Container>
    </PageContent>
  );
}
