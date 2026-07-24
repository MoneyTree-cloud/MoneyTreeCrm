import React, { useEffect, useState } from "react";
import { Container, Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input } from "reactstrap";
import AppTable from "../../components/Common/Table";
import { useGet, usePost } from "../../Hooks/useApi";
import { DASHBOARD_ASSOCIATE_MEETING, DASHBOARD_CHECK_SAME_DAY_MEETING, DASHBOARD_START_MEETING } from "../../helpers/url_helper";
import { formatDate, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { MdMobileFriendly } from "react-icons/md";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useUserStore } from "../../store/useUserStore";
import { decryptData } from "../../components/Common/CryptoUtils";
import "../CSS/styles.css";
import ApiClient from "../../helpers/api_helper";

export default function ProspectsForMeeting({ onRefresh }) {
  const navigation = useNavigate();
  const userId = useUserStore((state) => state.user.userId);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedType, setSelectedType] = useState("Walk-in");
  const { data, isLoading, refetch: getMeetData } = useGet(DASHBOARD_ASSOCIATE_MEETING + userId);
  const [meetingData, setMeetingData] = useState([]);
  const [referralRemark, setReferralRemark] = useState('')
  const [referralPersonName, setReferralPersonName] = useState('')
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [selectedRow, setSelectedRow] = useState({})

  useEffect(() => {
    if (data?.data?.status_code === 1) {
      decryptData(data?.data?.object).then((decryptedData) => {
        if (decryptedData) {
          setMeetingData(decryptedData);
          setDisableSubmit(false); // Ensure the submit button is enabled after data is loaded
        } else {
          setMeetingData([]);
          setDisableSubmit(false); // Ensure the submit button is enabled after data is loaded
        }
      });
    }
  }, [data]);

  const { isLoading: isLoadingPost, mutate: startMeeting } = usePost(
    DASHBOARD_START_MEETING,
    {
      onSuccess: (response) => {
        setModalOpen(false);
        if (response.data.status === 1) {
          toast.success(response.data.message);
          onRefresh();
          getMeetData();
        } else {
          setDisableSubmit(false); // Ensure the submit button is enabled after data is loaded
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        setDisableSubmit(false); // Re-enable the submit button on error
        toast.error(err.message);
      },
    }
  );

  const handleStartMeeting = (row) => {
    setDisableSubmit(true); // Ensure the submit button is enabled when starting a meeting
    ApiClient.get(`${DASHBOARD_CHECK_SAME_DAY_MEETING}${row.leadId}`)
      .then(function (response) {
        if (response?.data?.status === 1) {
          setSelectedMeeting(row);
          setSelectedRow(response?.data?.data)
          setModalOpen(true);
          setDisableSubmit(false); // Re-enable the submit button if there's no same day meeting
        } else {
          startMeeting(row);
        }
      })
      .catch(function (error) {
        setDisableSubmit(false); // Re-enable the submit button if there's no same day meeting
        toast.error(error.message);
      });
  };

  const handleModalSubmit = () => {
    setDisableSubmit(true);

    const contact = referralRemark?.trim();
    // Transferred validation
    if (selectedType === "Transferred") {
      if (
        selectedRow?.isTransferred?.toLowerCase() !== "yes"
      ) {
        toast.error("This prospect is not marked as transferred.");
        setDisableSubmit(false);
        return;
      }
    }

    // Validation for Walk-in / Activity
    if (
      selectedType !== "Transferred" &&
      selectedType !== "Referral" &&
      !contact
    ) {
      toast.error("Contact Details is required.");
      setDisableSubmit(false);
      return;
    }

    // Referral validation
    if (selectedType === "Referral") {
      if (!contact) {
        toast.error("Referral Contact Number is required.");
        setDisableSubmit(false);
        return;
      }

      if (contact.length !== 10) {
        toast.error("Referral Contact Number must be a 10-digit number.");
        setDisableSubmit(false);
        return;
      }

      if (!referralPersonName.trim()) {
        toast.error("Referral Person Name is required.");
        setDisableSubmit(false);
        return;
      }
    }

    const payload = {
      ...selectedMeeting,
      sameDayMeetingRemark: selectedType,
      referralRemark:
        selectedType === "Transferred" ? "" : referralRemark,
      referralPersonName:
        selectedType === "Referral" ? referralPersonName : "",
    };

    startMeeting(payload);
  };

  const handleEndMeeting = (row) => {
    navigation("/cancel-meeting", { state: { row } });
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
      width: "20%",
      cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Date</span>,
      sortable: true,
      selector: (row) => row.meetingDueDate,
      width: "12%",
      cell: (row) => <WordWrapCell>{formatDate(row.meetingDueDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Mobile Number</span>,
      width: "7%",
      selector: (row) => row.phoneNo,
      cell: (row) => (
        <div className="phone-container">
          <MdMobileFriendly className="phone-icon" color={defaultTheme.goldColorLogo} />
          <span className="phone-number">{row.phoneNo}</span>
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Budget</span>,
      selector: (row) => row.budgetName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.budgetName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Timing</span>,
      selector: (row) => row.meetingTimeRange,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.meetingTimeRange}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Start Meeting</span>,
      cell: (row) => (
        <button
          type="button"
          className="btn btn-primary"
          style={{ fontSize: "12px", padding: "2px 6px" }}
          onClick={() => handleStartMeeting(row)}
          disabled={disableSubmit} // Disable the button when disableSubmit is true
        >
          Start Meeting
        </button>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Meeting Cancel/Reject</span>,
      cell: (row) => (
        <button
          type="button"
          className="btn btn-danger"
          style={{ fontSize: "12px", padding: "2px 6px" }}
          onClick={() => handleEndMeeting(row)}
        >
          Cancel Meeting
        </button>
      ),
    },
  ];

  return (
    <React.Fragment>
      <Container fluid={true}>
        <h5 style={{ textAlign: "center" }}>Prospects for Meeting</h5>
        {(isLoadingPost || isLoading) && <ScreenLoader />}
        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={meetingData || []}
          pagination
        />

        {/* Modal for type selection */}
        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
          <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
            Same Day Meeting Reason
          </ModalHeader>

          <ModalBody>
            <FormGroup>
              <Label style={{ fontWeight: 600, marginBottom: "10px" }}>Select Reason</Label>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {["Walk-in", "Activity", "Referral", "Transferred"].map((type) => (
                  <label
                    key={type}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: selectedType === type ? "2px solid #3F51B5" : "1px solid #ccc",
                      cursor: "pointer",
                      transition: "0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Input
                      type="radio"
                      name="meetingType"
                      value={type}
                      checked={selectedType === type}
                      onChange={(e) => setSelectedType(e.target.value)}
                      style={{ accentColor: "#3F51B5" }}
                    />
                    <span style={{ fontSize: "1rem" }}>{type}</span>
                  </label>
                ))}
              </div>
            </FormGroup>
            {selectedType === "Referral" ?
              <div>
                <FormGroup style={{ marginTop: "15px" }}>
                  <Label style={{ fontWeight: 600 }}>Contact Number Of Referral <RequiredStar /></Label>
                  <Input
                    type="text"
                    value={referralRemark}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setReferralRemark(value);
                    }}
                    placeholder="Enter Referral Contact Number"
                    maxLength={10}
                    required
                  />
                </FormGroup>
                <FormGroup style={{ marginTop: "15px" }}>
                  <Label style={{ fontWeight: 600 }}>Name Of Referral Person <RequiredStar /></Label>
                  <Input
                    type="text"
                    value={referralPersonName}
                    onChange={(e) => setReferralPersonName(e.target.value)}
                    placeholder="Enter Name Of Referral Person"
                    required
                  />
                </FormGroup>
              </div>
              : selectedType === "Transferred" ? null : <FormGroup style={{ marginTop: "15px" }}>
                <Label style={{ fontWeight: 600 }}>Contact Details <RequiredStar /></Label>
                <Input
                  type="textarea"
                  value={referralRemark}
                  onChange={(e) => setReferralRemark(e.target.value)}
                  placeholder="Enter Contact Details"
                  required
                />
              </FormGroup>
            }

          </ModalBody>

          <ModalFooter>
            <Button
              color="primary"
              onClick={handleModalSubmit}
              style={{ backgroundColor: defaultTheme.primary }}
            >
              Submit
            </Button>

            <Button
              color="secondary"
              onClick={() => setModalOpen(false)}
              style={{ backgroundColor: defaultTheme.goldColorLogo }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

      </Container>
    </React.Fragment>
  );
}
