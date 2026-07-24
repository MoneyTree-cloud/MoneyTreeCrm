import React, { useEffect, useState } from "react";
import { Button, Container } from "reactstrap";
import AppTable from "../../components/Common/Table";
import { useNavigate } from "react-router-dom";
import { useGet } from "../../Hooks/useApi";
import { DASHBOARD_ONGOING_MEETING } from "../../helpers/url_helper";
import { formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function MeetingOngoing({ refresh }) {
  const userId = useUserStore((state) => state.user.userId);
  const navigation = useNavigate();
  const { data, isLoading, refetch: getMeetData } = useGet(DASHBOARD_ONGOING_MEETING + userId);
  const [meetingData, setMeetingData] = useState([])

  useEffect(() => {
    if (data?.data?.status_code === 1) {
      decryptData(data?.data?.object).then((decryptedData) => {
        if (decryptedData) {
          setMeetingData(decryptedData);
        } else {
          setMeetingData([])
        }
      });
    }
  }, [data]);

  useEffect(() => {
    getMeetData();
  }, [getMeetData, refresh]);

  const handleEndMeeting = (meetingId, clientMobNo) => {
    navigation("/end-meeting-otp", { state: { meetingId, clientMobNo } });
  };

  const handleCancelMeeting = (meetingId) => {
    navigation("/end-cancel-meeting", { state: { meetingId, screen: 'start' } });
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Customer Name</span>,
      sortable: true,
      selector: (row) => row.clientName,
      cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting ID</span>,
      sortable: true,
      width: "12%",
      selector: (row) => row.meetingId,
      cell: (row) => <WordWrapCell>{row.meetingId}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Start Date & Time</span>,
      sortable: true,
      selector: (row) => row.meetingStartAt,
      cell: (row) => <WordWrapCell>{formatDateTime(row.meetingStartAt)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Cancel</span>,
      cell: (row) => (
        <button
          type="button"
          className="btn btn-danger"
          style={{ fontSize: "12px", padding: "2px 6px" }}
          onClick={() => handleCancelMeeting(row.meetingId)}
        >
          Cancel Meeting
        </button>
      ),
    },
    // {
    //   name: <span className="font-weight-bold fs-13">End Meeting</span>,
    //   cell: (row) => (
    //     <Button
    //       style={{ fontSize: "12px", padding: "2px 6px" }}
    //       color="info" // Adjust color as needed
    //       onClick={() => handleEndMeeting(row.meetingId, row.clientMobile)} // Function to handle button click
    //     >
    //       End Meeting
    //     </Button>
    //   ),
    //   sortable: true,
    // },
    {
    name: <span className="font-weight-bold fs-13">End Meeting</span>,
    cell: (row) => {
      // Get the meeting start time and the current time
      const meetingStartTime = new Date(row.meetingStartAt);
      const currentTime = new Date();

      // Calculate the time difference in hours
      const timeDifferenceInHours = (currentTime - meetingStartTime) / (1000 * 60 * 60);

      // If the time difference is greater than 12 hours, show "Expired" else show the "End Meeting" button
      if (timeDifferenceInHours > 12) {
        return (
          <span
            className="text-warning"
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              textAlign: "center",
              display: "inline-block",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            <i className="fas fa-clock" style={{ marginRight: "5px" }}></i>
            Expired
          </span>
        );
      } else {
        return (
          <Button
            style={{ fontSize: "12px", padding: "2px 6px" }}
            color="danger" // Adjust color as needed
            onClick={() => handleEndMeeting(row.meetingId, row.clientMobile)} // Function to handle button click
          >
            End Meeting
          </Button>
        );
      }
    },
  },
  ];


  return (
    <React.Fragment>
      <Container fluid={true}>
        {isLoading && <ScreenLoader />}
        <h5 style={{ textAlign: "center" }}>Meeting Ongoing</h5>
        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={meetingData || []}
          pagination
        />
      </Container>
    </React.Fragment>
  );
}
