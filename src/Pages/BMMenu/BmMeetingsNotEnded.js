/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { ALL_LOCATION_DROPDOWN_ID, BM_MEETING_NOT_ENDED } from "../../helpers/url_helper";
import { formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { useGet } from "../../Hooks/useApi";
import { USER_TYPE } from "../../constants/global";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function BmMeetingsNotEnded() {
  const { userId, role, locationName } = useUserStore((state) => state.user);
  const [fromDate, setFromDate] = useState("");
  const [isPending, setIsPending] = useState(false)
  const [meetData, setMeetData] = useState([])
  const [accessGranted, setAccessGranted] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (role !== USER_TYPE.ASSOCIATE) {
        const hasAccess = await CheckUserAccess(userId, 'bm-meeting-not-ended');
        setAccessGranted(hasAccess);
      }
      else {
        setAccessGranted(true);
      }
    };
    checkAccess();
  }, [userId, role]);

  const { data: branchList, isLoading } = useGet(ALL_LOCATION_DROPDOWN_ID, { enabled: !!accessGranted });

  function findIdByName(name) {
    const item = branchList?.data?.data.find(branch => branch.label === name);
    return item ? item.value : null; // Returns the Value if found, or null if not
  }
  const locationId = findIdByName(locationName)
  useEffect(() => {
    if (locationId && accessGranted) {
      getMeetingDetails()
    }
  }, [locationId, accessGranted]);

  const getMeetingDetails = () => {
    const now = new Date();
    const startOfMonth = now;
    setFromDate(formatDateForInput(startOfMonth));
    getMeetDetails(
      `${BM_MEETING_NOT_ENDED}${formatDateForInput(startOfMonth)}&toDate=${formatDateForInput(startOfMonth)}&locationId=${locationId}`
    );
  }

  const getMeetDetails = (url) => {
    setIsPending(true)
    ApiClient.get(url)
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          setMeetData(response.data.data)
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message);
      });
  }
  
  const handleShowData = (e) => {
    e.preventDefault()
    getMeetDetails(`${BM_MEETING_NOT_ENDED}${fromDate}&toDate=${fromDate}&locationId=${locationId}`);
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "10%",
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.employeeName + ' (' + row.employeeCode + ')'}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Time</span>,
      selector: (row) => row.meetingDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.meetingDate}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Main Team</span>,
      selector: (row) => row.mainTeam,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.mainTeam}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Sub Team</span>,
      selector: (row) => row.subTeam,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.subTeam}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.clientName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>
    }
  ];

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      {(isPending || isLoading) && <ScreenLoader />}
      <Breadcrumbs title="Meetings" breadcrumbItem="Not Ended" />
      <Container fluid={true}>
        <Card>
          <CardBody>
            <form onSubmit={handleShowData}>
              <Row className="g-3">
                <Col lg="6">
                  <h6 className="font-size-11">From Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Col>
                <Col
                  lg="6"
                  className="d-flex align-items-end"
                >
                  <button
                    type="submit"
                    className="btn btn-primary me-2"
                    onClick={handleShowData}
                  >
                    Show Data
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={getMeetingDetails}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>
        {meetData?.length > 0 &&
          <AppTable
            progressPending={isPending}
            columns={columns}
            data={meetData}
            pagination
          />
        }
      </Container>
    </PageContent>
  );
}
