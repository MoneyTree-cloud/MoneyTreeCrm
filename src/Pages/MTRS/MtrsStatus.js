import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Table } from "reactstrap";
import { toast } from "react-toastify";
import { GET_MTRS_STATUS } from "../../helpers/url_helper";
import ApiClient from "../../helpers/api_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PageContent from "../../components/Common/PageContent";
import { FaCheck, FaTimes } from "react-icons/fa";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function MtrsStatus() {
  const userId = useUserStore((state) => state.user.userId);
  const [mtrsId, setMtrsId] = useState('')
  const [isPending, setIsPending] = useState(false);
  const [mtrsStatus, setMtrsStatus] = useState('')
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

  const MtrsTableView = ({ clientName, unitNo, builder, project, bba, noc, stage, kyc ,acknowledgement}) => {
    return (
      <Table striped>
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Unit No.</th>
            <th>Builder</th>
            <th>Project</th>
            <th>Accepted By Builder</th>
            <th>KYC</th>
            <th>BBA</th>
            <th>NOC</th>
            <th>Acknowledgement</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{clientName}</td>
            <td>{unitNo}</td>
            <td>{builder}</td>
            <td>{project}</td>
            <td>
              {stage ? <FaCheck
                title="YES"
                style={{ color: defaultTheme.primary, }}
                size={15}
              />
                :
                <FaTimes
                  style={{ color: defaultTheme.redColor, }}
                  size={15}
                  title="NO"
                />
              }
            </td>

            <td>
              {kyc === 'YES' ? <FaCheck
                style={{ color: defaultTheme.primary, }}
                title="YES"
                size={15}
              />
                :
                <FaTimes
                  style={{ color: defaultTheme.redColor, }}
                  title="NO"
                  size={15}
                />
              }
            </td>
            <td>
              {bba ? <FaCheck
                style={{ color: defaultTheme.primary, }}
                title="YES"
                size={15}
              />
                :
                <FaTimes
                  style={{ color: defaultTheme.redColor, }}
                  title="NO"
                  size={15}
                />
              }
            </td>
            <td>
              {noc?.length > 0 ? <FaCheck
                style={{ color: defaultTheme.primary, }}
                title="YES"
                size={15}
              />
                :
                <FaTimes
                  style={{ color: defaultTheme.redColor, }}
                  title="NO"
                  size={15}
                />
              }
            </td>

             <td>
              {acknowledgement ? <FaCheck
                title="YES"
                style={{ color: defaultTheme.primary, }}
                size={15}
              />
                :
                <FaTimes
                  style={{ color: defaultTheme.redColor, }}
                  size={15}
                  title="NO"
                />
              }
            </td>

          </tr>
        </tbody>
      </Table>
    );
  };

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'mtrs-status');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="MTRS" breadcrumbItem="Status" />
      {(isPending) && <ScreenLoader />}
      <Container fluid={true}>
        <form onSubmit={handleShowData}>
          <Card>
            <CardBody>
              <Row className="g-3">
                <Col md="6">
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

                <Col lg="6" className="d-flex align-items-end">
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
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>

        {Object.keys(mtrsStatus)?.length > 0 && (
          <MtrsTableView
            bba={mtrsStatus?.bba}
            noc={mtrsStatus?.noc}
            stage={mtrsStatus?.stage}
            kyc={mtrsStatus?.kyc}
            mtrsId={mtrsStatus?.saleId}
            clientName={mtrsStatus?.clientName}
            unitNo={mtrsStatus?.unitNo}
            builder={mtrsStatus?.builder}
            project={mtrsStatus?.project}
            acknowledgement={mtrsStatus?.acknowledgement}
          />
        )
        }

      </Container>
    </PageContent>
  );
}
