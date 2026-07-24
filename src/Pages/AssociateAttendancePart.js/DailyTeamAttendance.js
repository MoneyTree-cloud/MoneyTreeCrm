import { useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import { ALL_LOCATION_DROPDOWN, GET_DEFAULTER_REPORT, GET_MY_TEAM_ID } from "../../helpers/url_helper";
import { useGet, usePost } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import PageContent from "../../components/Common/PageContent";
import { decryptData } from "../../components/Common/CryptoUtils";
import { USER_TYPE } from "../../constants/global";

// ── Helpers ─────────────────────────────────────────────────────────────────

const toMinutes = (str) => {
  if (!str || str === "NA") return null;
  const match = String(str).match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
};

// Format minutes-since-midnight back to "HH:mm"
const minutesToHHMM = (mins) => {
  if (mins == null) return "";
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

// Get the effective in-time for the selected date.
// If the user is an associate AND the selected date is a Thursday,
// add 30 minutes of grace to the scheduled inTime.
const getEffectiveInTime = (scheduledInTime, dateStr, isAssociate) => {
  if (!scheduledInTime || scheduledInTime === "NA") return null;
  const baseMins = toMinutes(scheduledInTime);
  if (baseMins == null) return null;

  if (isAssociate && dateStr) {
    // dateStr comes from <input type="date">, so it's "YYYY-MM-DD"
    const d = new Date(dateStr);
    if (!isNaN(d.getTime()) && d.getDay() === 4) {
      // Thursday → +30 min grace
      return baseMins + 30;
    }
  }
  return baseMins;
};

export default function DailyTeamAttendance() {
  const [date, setDate] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const { mainTeam, userId, role } = useUserStore((state) => state.user);
  const [dailyTeamAttendanceData, setDailyTeamAttendanceData] = useState([]);
  const { data: teamList, isLoading: loadingTeam } = useGet(GET_MY_TEAM_ID + userId);
  const { data: locationList } = useGet(ALL_LOCATION_DROPDOWN)

  const isAssociate = role === USER_TYPE?.ASSOCIATE;
  const branchOptions = Array.isArray(locationList?.data?.data) ? locationList?.data?.data : []

  // Apply branch filter on top of the loaded list
  const filteredData = useMemo(() => {
    if (!selectedBranch) return dailyTeamAttendanceData;
    return dailyTeamAttendanceData?.filter(
      (row) => row?.branch === selectedBranch?.value
    );
  }, [dailyTeamAttendanceData, selectedBranch]);

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, i) => i + 1,
      width: "7%",
    },
    {
      name: <span className="font-weight-bold fs-13">Name</span>,
      selector: (row) => row.empName,
      sortable: true,
      width: "28%",
      cell: (row) => <WordWrapCell>{row.empName + " (" + row.empCode + ")"}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Main Team</span>,
      selector: (row) => row.mainTeam,
      sortable: true,
      width: "12%",
      cell: (row) => <WordWrapCell>{row.mainTeam}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Sub Team</span>,
      selector: (row) => row.subTeam,
      sortable: true,
      width: "12%",
      cell: (row) => <WordWrapCell>{row.subTeam}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Branch</span>,
      selector: (row) => row.branch,
      sortable: true,
      width: "13%",
      cell: (row) => <WordWrapCell>{row.branch || "-"}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">In Time</span>,
      selector: (row) => row.time,
      sortable: true,
      width: "28%",
      cell: (row) => {
        // Extract the punch time string the same way as before
        const formatted = formatDateTime(row.time);
        const display = formatted
          ? formatted.split(" ")[1] + " " + formatted.split(" ")[2]
          : "-";

        // Compare actual punch vs effective scheduled time
        const punchMins = toMinutes(row.time);
        const effectiveMins = getEffectiveInTime(row.inTime, date, isAssociate);
        const isLate =
          punchMins != null &&
          effectiveMins != null &&
          punchMins > effectiveMins;

        return (
          <WordWrapCell>
            <span
              style={{
                color: isLate ? "#d32f2f" : "inherit",
                fontWeight: isLate ? 600 : "normal",
              }}
              title={
                effectiveMins != null
                  ? `Scheduled: ${minutesToHHMM(effectiveMins)}${isAssociate &&
                    date &&
                    new Date(date).getDay() === 4
                    ? " (incl. Thursday grace)"
                    : ""
                  }`
                  : ""
              }
            >
              {display}
            </span>
          </WordWrapCell>
        );
      },
    },
  ];

  // ── API call ──────────────────────────────────────────────────────────────
  const { isPending, mutate: showAttendance } = usePost(
    `${GET_DEFAULTER_REPORT}${date}&time=21:00&type=Sales`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          const encryptedContent = response.data.data;
          decryptData(encryptedContent)
            .then((decrypted) => {
              const filteredByTeam = decrypted.filter(
                (item) => item.mainTeam === mainTeam
              );
              const matchData = filteredByTeam[0]?.present;
              const matched = matchData?.filter(
                (emp) =>
                  Array.isArray(teamList?.data?.data) &&
                  teamList?.data?.data?.some((item) => item.value === emp.empCode)
              );
              setDailyTeamAttendanceData(matched || []);
            })
            .catch(() => {
              setDailyTeamAttendanceData([]);
            });
        }
      },
      onError: (err) => {
        toast.error(err.message);
        setDailyTeamAttendanceData([]);
      },
    }
  );

  useEffect(() => {
    setTodayDate();
  }, []);

  const setTodayDate = () => {
    const today = new Date();
    setDate(formatDateForInput(today));
  };

  const handleShowButton = () => {
    if (!date) {
      toast.error("Please Enter Date");
    } else {
      showAttendance();
    }
  };

  const handleClear = () => {
    setTodayDate();
    setDailyTeamAttendanceData([]);
    setSelectedBranch(null);
  };

  return (
    <PageContent>
      <Breadcrumbs title="Attendance" breadcrumbItem="Daily Team Attendance" />
      {(isPending || loadingTeam) && <ScreenLoader />}
      <Container fluid={true}>
        <Card>
          <CardBody>
            <Row>
              <Col md="3">
                <h6 className="font-size-12">Date <RequiredStar /></h6>
                <input
                  className="form-control"
                  type="date"
                  id="date-input-1"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Col>

              <Col md="3">
                <h6 className="font-size-12">Branch</h6>
                <Select
                  options={branchOptions}
                  value={selectedBranch}
                  onChange={setSelectedBranch}
                  isClearable
                  isDisabled={branchOptions.length === 0}
                  style={{ zIndex: 9999 }}
                  menuPortalTarget={document.body}
                />
              </Col>

              <Col md="3" className="d-flex align-items-end">
                <Button
                  color="primary"
                  onClick={handleShowButton}
                  className="me-2"
                >
                  Show
                </Button>
                <Button color="secondary" onClick={handleClear}>
                  Clear
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <AppTable
          progressSales={isPending}
          columns={columns}
          data={filteredData}
          pagination
        />
      </Container>
    </PageContent>
  );
}