import { useEffect, useState } from 'react';
import ApiClient, { imageBaseUrl } from '../../helpers/api_helper';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import { toast } from 'react-toastify';
import { GET_MTRS_STATUS } from '../../helpers/url_helper';
import ScreenLoader from '../../constants/ScreenLoader';
import { formatDateTime } from "../../helpers/function_helper";
import { FaFilePdf } from 'react-icons/fa';
import { defaultTheme } from '../../helpers/defaultTheme';
import { useUserStore } from '../../store/useUserStore';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';

const MtrsFiles = () => {
  const [mtrsStatus, setMtrsStatus] = useState('')
  const [mtrsId, setMtrsId] = useState('')
  const [isPending, setIsPending] = useState(false);
  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);

  const handleShowData = (e) => {
    e.preventDefault();
    if (!mtrsId) {
      toast.error('Please Enter Unique ID')
      return;
    }
    else {
      setIsPending(true)
      ApiClient.get(`${GET_MTRS_STATUS}${mtrsId}`).then(function (response) {
        setIsPending(false);
        if (response.data.status === 1) {
          setMtrsStatus(response.data.data)
        }
        else {
          toast.error(response.data.message)
        }

      })
        .catch(function (error) {
          setIsPending(false);
          toast.error(error.message);
        });
    }
  }

  const handleClear = () => {
    setMtrsId('')
    setMtrsStatus('')
  }

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'mtrs-files');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />;
  }

  return (
    <PageContent>
      <Breadcrumbs title="MTRS" breadcrumbItem="Files" />
      {(isPending) && <ScreenLoader />}
      <Container fluid={true}>
        <Card>
          <CardBody>
            <form onSubmit={handleShowData}>
              <Row>
                <Col md="6 mt-1">
                  <h6 className="font-size-11">Unique ID</h6>
                  <input
                    id="mtrsId"
                    className="form-control"
                    type="text"
                    value={mtrsId}
                    placeholder="Enter Unique ID..."
                    onChange={(e) => setMtrsId(e.target.value)}
                  />
                </Col>
                <Col lg="6">
                  <div className="d-flex align-items-center mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      onClick={handleShowData}
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary ms-2"
                      onClick={handleClear}
                    >
                      Clear
                    </button>
                  </div>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>
        {Object.keys(mtrsStatus)?.length > 0 && (
          <Card>
            <CardBody>

              <div style={{ fontFamily: 'Arial, sans-serif' }}>

                <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
                  <h4>Client: {mtrsStatus.clientName}</h4>
                  <p><strong>Unit No:</strong> {mtrsStatus.unitNo}</p>
                  <p><strong>Builder:</strong> {mtrsStatus.builder}</p>
                  <p><strong>Project:</strong> {mtrsStatus.project}</p>

                  <div style={{ marginTop: '15px' }}>
                    <strong>BBA File:</strong>{' '}
                    {mtrsStatus.bba ? (
                      <a
                        href={`${imageBaseUrl}${mtrsStatus.bba}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: defaultTheme.primary }}
                      >
                        <FaFilePdf />
                        View BBA
                      </a>
                    ) : (
                      <span>No BBA uploaded</span>
                    )}
                  </div>
                  {/* NOC Files */}

                  <div style={{ marginTop: '20px' }}>
                    <strong>NOC Files:</strong>
                    {mtrsStatus.noc && mtrsStatus.noc.length > 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '16px',
                          marginTop: '10px'
                        }}
                      >
                        {mtrsStatus?.noc?.map((nocItem, index) => (
                          <div
                            key={index}
                            style={{
                              flex: '0 0 calc(50% - 8px)', // 2 items per row with some spacing
                              borderLeft: '3px solid #007bff',
                              background: '#f9f9f9',
                              padding: '10px',
                              borderRadius: '6px',
                              boxSizing: 'border-box'
                            }}
                          >
                            <p><strong>Type:</strong> {nocItem.nocType}</p>
                            <p><strong>Project:</strong> {nocItem.projectName}</p>
                            <p><strong>Uploaded On:</strong> {formatDateTime(nocItem.nocUploadDate)}</p>
                            <a
                              href={`${imageBaseUrl}${nocItem.nocUpload}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                color: defaultTheme.primary,
                                fontWeight: 'bold'
                              }}
                            >
                              <FaFilePdf />
                              View NOC
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No NOC files available.</p>
                    )}
                  </div>

                  {/* //Receive Pay files */}
                  <div style={{ marginTop: '20px' }}>
                    <strong>Receive Pay Files:</strong>
                    {mtrsStatus.saleAttachment && mtrsStatus.saleAttachment.length > 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '16px',
                          marginTop: '10px'
                        }}
                      >
                        {mtrsStatus.saleAttachment?.map((nocItem, index) => (
                          (nocItem.attachement1 || (nocItem.paymentAttachmentPath && nocItem.paymentAttachmentPath !== 'NULL')) &&
                          <div
                            key={index}
                            style={{
                              flex: '0 0 calc(50% - 8px)', // 2 items per row with some spacing
                              borderLeft: '3px solid #007bff',
                              background: '#f9f9f9',
                              padding: '10px',
                              borderRadius: '6px',
                              boxSizing: 'border-box'
                            }}
                          >
                            <p><strong>Cheque No:</strong> {nocItem.chequeNo}</p>
                            <p><strong>Clearance Amount:</strong> {nocItem.clearanceAmount}</p>
                            <p><strong>ClearanceDate:</strong> {formatDateTime(nocItem.clearanceDate)}</p>
                            {nocItem.attachement1 &&
                              <a
                                href={`${imageBaseUrl}${nocItem.attachement1}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  color: defaultTheme.primary,
                                  fontWeight: 'bold',
                                  marginRight: '20px'
                                }}
                              >
                                <FaFilePdf />
                                View File
                              </a>
                            }
                            {(nocItem.paymentAttachmentPath && nocItem.paymentAttachmentPath !== 'NULL') &&
                              < a
                                href={`${imageBaseUrl}${nocItem.paymentAttachmentPath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  color: defaultTheme.primary,
                                  fontWeight: 'bold'
                                }}
                              >
                                <FaFilePdf />
                                View Sales Proof
                              </a>
                            }
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No Receive Pay files available.</p>
                    )}
                  </div>

                  {/* //Sale Entry Files */}
                  <div style={{ marginTop: '20px' }}>
                    <strong>Sale Entry Files:</strong>
                    {mtrsStatus.fileDetails && mtrsStatus.fileDetails.length > 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '16px',
                          marginTop: '10px'
                        }}
                      >
                        {mtrsStatus.fileDetails?.map((nocItem, index) => (
                          <div
                            key={index}
                            style={{
                              flex: '0 0 calc(50% - 8px)', // 2 items per row with some spacing
                              borderLeft: '3px solid #007bff',
                              background: '#f9f9f9',
                              padding: '10px',
                              borderRadius: '6px',
                              boxSizing: 'border-box'
                            }}
                          >
                            <p><strong>Uploaded On:</strong> {formatDateTime(nocItem.createdDate)}</p>
                            <a
                              href={`${imageBaseUrl}${nocItem.filePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                color: defaultTheme.primary,
                                fontWeight: 'bold'
                              }}
                            >
                              <FaFilePdf />
                              View File
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No Sale Entry files available.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </Container>
    </PageContent >
  );

};

export default MtrsFiles;
