/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { convertTo12HourFormat, formatAttDateWithDay, formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css";
import { useUserStore } from "../../store/useUserStore";
import { GET_ASSOCIATE_ATTENDANCE } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import PageContent from "../../components/Common/PageContent";
import { toast } from "react-toastify";
import { USER_TYPE } from "../../constants/global";
import { BsClockFill } from "react-icons/bs";
import { MdOutlineWatchLater, MdFreeBreakfast, MdPersonOff } from "react-icons/md";

export default function MyAttendance() {
  const { empCode, locationName, role } = useUserStore((state) => state.user);
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    fromDate: "",
    toDate: "",
    apiUrl: null,
  });

  // Fetch attendance data based on apiUrl
  const { data: attendanceData, isLoading } = useGet(formState.apiUrl, {
    enabled: !!formState.apiUrl,
  });

  // Extract metaData and data arrays from the response
  const metaData = attendanceData?.data?.data?.metaData || {};
  const rawList = Array.isArray(attendanceData?.data?.data?.data)
    ? [...attendanceData.data.data.data].reverse()
    : [];

  useEffect(() => {
    getFromToDate();
  }, []);

  const getFromToDate = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = now;
    setFormState((prev) => ({
      ...prev,
      fromDate: formatDateForInput(startDate),
      toDate: formatDateForInput(toDate),
      apiUrl: `${GET_ASSOCIATE_ATTENDANCE}empCode=${empCode}&startDate=${formatDateForInput(startDate)}&endDate=${formatDateForInput(toDate)}`,
    }));
  };

  const handleShowData = () => {
    setFormState((prev) => ({
      ...prev,
      apiUrl: `${GET_ASSOCIATE_ATTENDANCE}empCode=${empCode}&startDate=${formState.fromDate}&endDate=${formState.toDate}`,
    }));
  };

  // ---------- Helpers for color logic ----------

  // Convert "HH:MM:SS" or "HH:MM" to total minutes
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // 🆕 Safely extract YYYY-MM-DD from a row.
  // Prefers inDateTime / outDateTime (clean format), falls back to attDate.
  const extractDateYMD = (row) => {
    // Try inDateTime / outDateTime first: "2026-05-01 09:58:00"
    const cleanSource = row.inDateTime || row.outDateTime;
    if (cleanSource && cleanSource.includes(" ")) {
      return cleanSource.split(" ")[0]; // "2026-05-01"
    }

    // Fallback: parse attDate like "May  1 2026 12:00AM"
    if (row.attDate) {
      // Normalize extra spaces -> single space
      const normalized = row.attDate.replace(/\s+/g, " ").trim();
      const date = new Date(normalized);
      if (!isNaN(date.getTime())) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
    }

    return "";
  };

  const isWeeklyOff = (dateStr, weeklyOffDay) => {
    if (!dateStr || !weeklyOffDay) return false;

    // Normalize spaces AND add space before AM/PM
    const normalized = dateStr
      .replace(/\s+/g, " ")
      .replace(/(\d)(AM|PM)/i, "$1 $2")
      .trim();

    const date = new Date(normalized);
    if (isNaN(date.getTime())) return false;

    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    return dayName === weeklyOffDay;
  };

  // Determine in-time status
  const getInTimeStatus = (row) => {
    if (!row.inDateTime) return "none";
    if (isWeeklyOff(row.attDate, metaData.weeklyOff)) return "weeklyOff";

    const inTime = row.inDateTime.split(" ")[1];
    const actualMinutes = timeToMinutes(inTime);
    // const expectedMinutes = timeToMinutes(metaData.InTime);
    const expectedMinutes = getAdjustedExpectedTime(
      metaData.InTime,
      row
    );
    if (actualMinutes === null || expectedMinutes === null) return "none";
    if (actualMinutes > expectedMinutes) return "late";
    return "onTime";
  };

  const getAdjustedExpectedTime = (time, row) => {
    if (!time) return null;

    const specialLocations = ["Noida", "Gurugram", "Lucknow"];

    // Check location
    const isSpecialLocation = specialLocations?.includes(locationName);

    // Get day from attendance date
    const normalized = row?.attDate
      ?.replace(/\s+/g, " ")
      ?.replace(/(\d)(AM|PM)/i, "$1 $2")
      ?.trim();

    const date = new Date(normalized);

    const isThursday =
      !isNaN(date.getTime()) &&
      date?.toLocaleDateString("en-US", {
        weekday: "long",
      }) === "Thursday";

    let minutes = timeToMinutes(time);

    // Add 30 mins only for Thursday + selected locations
    if (isSpecialLocation && isThursday && role === USER_TYPE.ASSOCIATE) {
      minutes += 30;
    }

    return minutes;
  };

  // Determine out-time status
  const getOutTimeStatus = (row) => {
    if (!row.outDateTime) return "none";
    if (isWeeklyOff(row.attDate, metaData.weeklyOff)) return "weeklyOff";

    const outTime = row.outDateTime.split(" ")[1];
    const actualMinutes = timeToMinutes(outTime);
    // const expectedMinutes = timeToMinutes(metaData.OutTime);
    const expectedMinutes = getAdjustedExpectedTime(
      metaData.OutTime,
      row
    );

    if (actualMinutes === null || expectedMinutes === null) return "none";
    if (actualMinutes < expectedMinutes) return "early";
    return "onTime";
  };

  // Map status -> color
  const getColorByStatus = (status) => {
    switch (status) {
      case "late":
      case "early":
        return "red";
      case "onTime":
        return "green";
      case "weeklyOff":
        return "#FFC107"; // amber/yellow
      default:
        return "inherit";
    }
  };

  const canRegularize = (dateTime) => {
    if (!dateTime) return false;

    const attendanceTime = new Date(dateTime);
    const now = new Date();

    const diffInHours = (now - attendanceTime) / (1000 * 60 * 60);

    return diffInHours <= 48;
  };

  const handleRegularizationClick = (row, type) => {
    const dateTime =
      type === "in" ? row.inDateTime : row.outDateTime;

    if (!canRegularize(dateTime)) {
      toast.error(
        "Attendance regularization is no longer allowed as the 48-hour submission window has expired."
      );
      return;
    }

    handleTimeClick(row);
  };

  // ---------- Click handler for red times ----------
  const handleTimeClick = (row) => {
    const inStatus = getInTimeStatus(row);
    const outStatus = getOutTimeStatus(row);

    const inIsRed = inStatus === "late";
    const outIsRed = outStatus === "early";

    let reasonValue;
    if (inIsRed && outIsRed) {
      reasonValue = "2"; // Both
    } else if (inIsRed) {
      reasonValue = "0"; // In Time
    } else if (outIsRed) {
      reasonValue = "1"; // Out Time
    } else {
      return;
    }

    // 🆕 Safe YYYY-MM-DD extraction (no more Invalid time value crash)
    const formattedDate = extractDateYMD(row);
    if (!formattedDate) {
      // Couldn't determine date — bail out gracefully
      return;
    }

    // Extract HH:MM (strip seconds — input type="time" needs HH:MM)
    const inTime = row.inDateTime
      ? row.inDateTime.split(" ")[1].substring(0, 5)
      : "";
    const outTime = row.outDateTime
      ? row.outDateTime.split(" ")[1].substring(0, 5)
      : "";

    navigate("/apply-attendance-regularization", {
      state: {
        prefillData: {
          reasonValue,
          startDate: formattedDate,
          startTime: inTime,
          endTime: outTime,
          inIsRed,
          outIsRed,
        },
      },
    });
  };

  // ✅ place this just above:  const columns = [ ...
  const statusCounts = rawList.reduce(
    (acc, row) => {
      const isOff = isWeeklyOff(row.attDate, metaData.weeklyOff);
      const hasIn = !!row.inDateTime;
      const hasOut = !!row.outDateTime;

      if (isOff) {
        acc.weeklyOff += 1;
      } else if (!hasIn && !hasOut) {
        acc.absent += 1;
      } else {
        const inStatus = getInTimeStatus(row);
        const outStatus = getOutTimeStatus(row);
        if (inStatus === "late" || outStatus === "early") {
          acc.lateEarly += 1;
        } else {
          acc.onTime += 1;
        }
      }
      return acc;
    },
    { onTime: 0, lateEarly: 0, weeklyOff: 0, absent: 0 }
  );


  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "8%",
      cell: (row, index) => {
        const isOff = isWeeklyOff(row.attDate, metaData.weeklyOff);
        return (
          <span style={{ color: isOff ? "#FFC107" : undefined, fontWeight: isOff ? "bold" : undefined }}>
            {index + 1}
          </span>
        );
      },
    },
    {
      name: <span className="font-weight-bold fs-13">Date</span>,
      selector: (row) => row.attDate,
      sortable: true,
      cell: (row) => {
        const isOff = isWeeklyOff(row.attDate, metaData.weeklyOff);
        return (
          <WordWrapCell>
            <span
              className={isOff ? "fw-semibold" : "fw-semibold"}
              style={{ color: isOff ? "#FFC107" : undefined }}
            >
              {formatAttDateWithDay(row.attDate)}
            </span>
          </WordWrapCell>
        );
      },
    },
    {
      name: <span className="font-weight-bold fs-13">In Time</span>,
      selector: (row) => row.inDateTime,
      sortable: true,
      cell: (row) => {
        const isOff = isWeeklyOff(row.attDate, metaData.weeklyOff);
        const status = getInTimeStatus(row);
        const color = getColorByStatus(status);
        const isClickable = status === "late";
        const timeStr = row.inDateTime
          ? convertTo12HourFormat(row.inDateTime.split(" ")[1])
          : "-";

        return (
          <WordWrapCell>
            <span
              // onClick={isClickable ? () => handleTimeClick(row) : undefined}
              onClick={
                status === "late"
                  ? () => handleRegularizationClick(row, "in")
                  : undefined
              }
              style={{
                color: isOff ? "#FFC107" : color,
                fontWeight:
                  isOff || status === "late" || status === "onTime"
                    ? "bold"
                    : "normal",
                cursor: isClickable ? "pointer" : "default",
                textDecoration: isClickable ? "underline" : "none",
              }}
              title={isClickable ? "Click to regularize" : ""}
            >
              {timeStr}
            </span>
          </WordWrapCell>
        );
      },
    },
    {
      name: <span className="font-weight-bold fs-13">Out Time</span>,
      selector: (row) => row.outDateTime,
      sortable: true,
      cell: (row) => {
        const isOff = isWeeklyOff(row.attDate, metaData.weeklyOff);
        const status = getOutTimeStatus(row);
        const color = getColorByStatus(status);
        const isClickable = status === "early";
        const timeStr = row.outDateTime
          ? convertTo12HourFormat(row.outDateTime.split(" ")[1])
          : "-";

        return (
          <WordWrapCell>
            <span
              // onClick={isClickable ? () => handleTimeClick(row) : undefined}
              onClick={
                status === "early"
                  ? () => handleRegularizationClick(row, "out")
                  : undefined
              }
              style={{
                color: isOff ? "#FFC107" : color,
                fontWeight:
                  isOff || status === "early" || status === "onTime"
                    ? "bold"
                    : "normal",
                cursor: isClickable ? "pointer" : "default",
                textDecoration: isClickable ? "underline" : "none",
              }}
              title={isClickable ? "Click to regularize" : ""}
            >
              {timeStr}
            </span>
          </WordWrapCell>
        );
      },
    },
  ];

  return (
    <PageContent>
      {isLoading && <ScreenLoader />}
      <Breadcrumbs title="Attendance" breadcrumbItem="My Attendance" />
      <Container fluid={true}>
        <Card>
          <CardBody>
            <form onSubmit={(e) => e.preventDefault()}>
              <Row className="g-3">
                <Col lg="4">
                  <h6 className="font-size-11">From Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    value={formState.fromDate}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        fromDate: e.target.value,
                      }))
                    }
                  />
                </Col>
                <Col lg="4">
                  <h6 className="font-size-11">To Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    value={formState.toDate}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        toDate: e.target.value,
                      }))
                    }
                  />
                </Col>
                <Col lg="4" className="d-flex align-items-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleShowData}
                  >
                    Show
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={getFromToDate}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>

        {/* ✅ REPLACE old legend div with this */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "0.5rem 0 1rem" }}>
          {[
            { icon: <BsClockFill size={18} color="#3B6D11" />, label: "On time", count: statusCounts.onTime, bg: "#EAF3DE", color: "#3B6D11" },
            { icon: <MdOutlineWatchLater size={20} color="#A32D2D" />, label: "Late / early", count: statusCounts.lateEarly, bg: "#FCEBEB", color: "#A32D2D" },
            { icon: <MdFreeBreakfast size={18} color="#854F0B" />, label: "Weekly off", count: statusCounts.weeklyOff, bg: "#FAEEDA", color: "#854F0B" },
            { icon: <MdPersonOff size={18} color="#5F5E5A" />, label: "Absent", count: statusCounts.absent, bg: "#F1EFE8", color: "#5F5E5A" },
          ].map(({ icon, label, count, bg, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "0.5px solid #e0e0e0", borderRadius: 8, padding: "10px 16px", flex: 1, minWidth: 130 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "#888", lineHeight: 1.2 }}>{label}</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 500, color, lineHeight: 1.2 }}>{count}</p>
              </div>
            </div>
          ))}
        </div>


        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={rawList}
          pagination
        />
      </Container>
    </PageContent>
  );
}