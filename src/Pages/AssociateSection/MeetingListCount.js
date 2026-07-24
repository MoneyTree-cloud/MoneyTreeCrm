/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { GET_MEETING_DATA } from "../../helpers/url_helper";
import { formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function MeetingListCount() {
  const userId = useUserStore((state) => state.user.userId);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [meetData, setMeetData] = useState([]);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    getMeetingDetailsInit();
  }, []);

  const getMeetingDetailsInit = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setFromDate(formatDateForInput(startOfMonth));
    setToDate(formatDateForInput(endOfMonth));

    getMeetingData(
      `${GET_MEETING_DATA}${userId}&startDate=${formatDateForInput(startOfMonth)}&endDate=${formatDateForInput(endOfMonth)}`
    );
  };

  const getMeetingData = (apiUrl) => {
    setIsPending(true);
    ApiClient.get(apiUrl)
      .then(function (response) {
        setIsPending(false);
        if (response.data.status === 1) {
          const encryptedContent = response.data.data;
          decryptData(encryptedContent)
            .then((decrypted) => {
              const processed = processMeetingData(decrypted);
              setMeetData(processed);
            })
            .catch(() => {
              setMeetData([]);
            });
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message);
      });
  };

  // ✅ Transform the API data
  const processMeetingData = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const { assoId, aasoName, meetstatus, totalAttemps } = item;

      if (!grouped[assoId]) {
        grouped[assoId] = {
          assoId,
          aasoName,
          startCount: 0,
          endCount: 0,
          cancelCount: 0,
          totalCount: 0,
        };
      }

      // Count by status
      if (meetstatus === "start") grouped[assoId].startCount += totalAttemps;
      else if (meetstatus === "end") grouped[assoId].endCount += totalAttemps;
      else if (meetstatus === "cancel") grouped[assoId].cancelCount += totalAttemps;

      // Update total count
      grouped[assoId].totalCount += totalAttemps;
    });

    return Object.values(grouped);
  };

  const handleShowData = (e) => {
    if (e) e.preventDefault();
    getMeetingData(`${GET_MEETING_DATA}${userId}&startDate=${fromDate}&endDate=${toDate}`);
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      selector: (row) => row.assoId,
      cell: (row) => <WordWrapCell>{row.aasoName + " (" + row.assoId + ")"}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13 text-warning">Start Count</span>,
      selector: (row) => row.startCount,
      cell: (row) => (
        <span className="badge bg-warning">{row.startCount}</span>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13 text-success">End Count</span>,
      selector: (row) => row.endCount,
      cell: (row) => (
        <span className="badge bg-success">{row.endCount}</span>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13 text-danger">Cancel Count</span>,
      selector: (row) => row.cancelCount,
      cell: (row) => (
        <span className="badge bg-danger">{row.cancelCount}</span>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13 text-secondary">Total Attempts</span>,
      selector: (row) => row.totalCount,
      cell: (row) => (
        <span className="badge bg-secondary">{row.totalCount}</span>
      ),
    },
  ];

  return (
    <PageContent>
      {isPending && <ScreenLoader />}
      <Breadcrumbs title="Associate" breadcrumbItem="Meeting Summary" />
      <Container fluid>
        {/* Filters */}
        <form onSubmit={handleShowData}>
          <Card>
            <CardBody>
              <Row className="g-3">
                <Col lg="4">
                  <h6 className="font-size-11">From Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Col>
                <Col lg="4">
                  <h6 className="font-size-11">To Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Col>
                <Col lg="4" className="d-flex align-items-end">
                  <button type="submit" className="btn btn-primary">
                    Show Data
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={getMeetingDetailsInit}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>

        {/* Table */}
        {meetData?.length > 0 && (
          <AppTable
            progressPending={isPending}
            columns={columns}
            data={meetData}
            pagination
          />
        )}
      </Container>
    </PageContent>
  );
}
