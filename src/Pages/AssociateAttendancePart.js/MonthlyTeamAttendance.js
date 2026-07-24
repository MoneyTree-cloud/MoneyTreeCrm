import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  convertTo12HourFormat,
  formatAttDateWithDay,
  formatDate,
  formatDateForInput,
  WordWrapCell,
} from "../../helpers/function_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css";
import { useUserStore } from "../../store/useUserStore";
import { toast } from "react-toastify";
import {
  GET_ASSOCIATE_ATTENDANCE,
  GET_MY_TEAM_ID,
} from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import Select from "react-select";
import ApiClient from "../../helpers/api_helper";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { USER_TYPE } from "../../constants/global";

export default function MonthlyTeamAttendance() {
  const {
    user: { userId, role },
  } = useUserStore();
  const [accessGranted, setAccessGranted] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (role !== USER_TYPE.ASSOCIATE) {
        const hasAccess = await CheckUserAccess(userId, "monthly-team-attendance");
        setAccessGranted(hasAccess);
      } else {
        setAccessGranted(true);
      }
    };
    checkAccess();
    getFromToDate();
  }, [userId, role]);

  const { data: teamList, isLoading: loadingTeam } = useGet(
    GET_MY_TEAM_ID + userId,
    { enabled: Boolean(accessGranted) }
  );

  const [isPending, setIsPending] = useState(false);
  const [teamData, setTeamData] = useState([]);
  const [metaData, setMetaData] = useState({}); // 🆕 store metaData

  const [formState, setFormState] = useState({
    fromDate: "",
    toDate: "",
    apiUrl: null,
    teamList: null,
  });

  function handleSelectChange(name) {
    return (selectedOption) => {
      setFormState((prevState) => ({
        ...prevState,
        [name]: selectedOption,
      }));
    };
  }

  const getFromToDate = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = now;

    setFormState((prev) => ({
      ...prev,
      fromDate: formatDateForInput(startDate),
      toDate: formatDateForInput(toDate),
    }));
  };

  const handleShowData = () => {
    if (!formState?.teamList) {
      toast.error("Please Select Team");
      return;
    } else {
      setIsPending(true);
      ApiClient.get(
        `${GET_ASSOCIATE_ATTENDANCE}empCode=${formState?.teamList?.value}&startDate=${formState.fromDate}&endDate=${formState.toDate}`
      )
        .then(function (response) {
          setIsPending(false);
          if (response?.data?.status === 1) {
            // 🆕 capture metaData from response
            setMetaData(response.data.data.metaData || {});
            setTeamData([...response.data.data.data].reverse());
          } else {
            toast.error(response.data.message);
          }
        })
        .catch(function (error) {
          setIsPending(false);
          toast.error(error.message);
        });
    }
  };

  // ---------- Helpers for color logic ----------

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const isWeeklyOff = (dateStr, weeklyOffDay) => {
    if (!dateStr || !weeklyOffDay) return false;
    const normalized = dateStr
      .replace(/\s+/g, " ")
      .replace(/(\d)(AM|PM)/i, "$1 $2")
      .trim();
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return false;
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    return dayName === weeklyOffDay;
  };

  const getInTimeStatus = (row) => {
    if (!row.inDateTime) return "none";
    if (isWeeklyOff(row.attDate, metaData.weeklyOff)) return "weeklyOff";

    const inTime = row.inDateTime.split(" ")[1];
    const actualMinutes = timeToMinutes(inTime);
    const expectedMinutes = timeToMinutes(metaData.InTime);

    if (actualMinutes === null || expectedMinutes === null) return "none";
    if (actualMinutes > expectedMinutes) return "late";
    return "onTime";
  };

  const getOutTimeStatus = (row) => {
    if (!row.outDateTime) return "none";
    if (isWeeklyOff(row.attDate, metaData.weeklyOff)) return "weeklyOff";

    const outTime = row.outDateTime.split(" ")[1];
    const actualMinutes = timeToMinutes(outTime);
    const expectedMinutes = timeToMinutes(metaData.OutTime);

    if (actualMinutes === null || expectedMinutes === null) return "none";
    if (actualMinutes < expectedMinutes) return "early";
    return "onTime";
  };

  const getColorByStatus = (status) => {
    switch (status) {
      case "late":
      case "early":
        return "red";
      case "onTime":
        return "green";
      case "weeklyOff":
        return "#FFC107";
      default:
        return "inherit";
    }
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "8%",
      cell: (row, index) => {
        const isOff = isWeeklyOff(row.attDate, metaData.weeklyOff);
        return (
          <span
            style={{
              color: isOff ? "#FFC107" : undefined,
              fontWeight: isOff ? "bold" : undefined,
            }}
          >
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
        const timeStr = row.inDateTime
          ? convertTo12HourFormat(row.inDateTime.split(" ")[1])
          : "";

        return (
          <WordWrapCell>
            <span
              style={{
                color: isOff ? "#FFC107" : color,
                fontWeight:
                  isOff || status === "late" || status === "onTime"
                    ? "bold"
                    : "normal",
              }}
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
        const timeStr = row.outDateTime
          ? convertTo12HourFormat(row.outDateTime.split(" ")[1])
          : "";

        return (
          <WordWrapCell>
            <span
              style={{
                color: isOff ? "#FFC107" : color,
                fontWeight:
                  isOff || status === "early" || status === "onTime"
                    ? "bold"
                    : "normal",
              }}
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
      {(loadingTeam || isPending) && <ScreenLoader />}
      <Breadcrumbs title="Attendance" breadcrumbItem="Monthly Team Attendance" />
      <Container fluid={true}>
        <Card>
          <CardBody>
            <Row className="g-3">
              <Col lg="3">
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
              <Col lg="3">
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
              <Col lg="3">
                <h6 className="font-size-11">Select Team</h6>
                <Select
                  style={{ zIndex: 9999 }}
                  menuPortalTarget={document.body}
                  isClearable
                  value={formState.associateType}
                  onChange={handleSelectChange("teamList")}
                  options={
                    Array.isArray(teamList?.data?.data)
                      ? teamList?.data?.data
                      : []
                  }
                />
              </Col>
              <Col lg="3" className="d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleShowData}
                >
                  Show Data
                </button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Legend */}
        <div className="d-flex gap-3 align-items-center flex-wrap mb-2 ms-1 mt-2">
          <span style={{ fontSize: "12px" }}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                backgroundColor: "green",
                borderRadius: "50%",
                marginRight: 5,
              }}
            />
            On Time
          </span>
          <span style={{ fontSize: "12px" }}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                backgroundColor: "red",
                borderRadius: "50%",
                marginRight: 5,
              }}
            />
            Late / Early
          </span>
          <span style={{ fontSize: "12px" }}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                backgroundColor: "#FFC107",
                borderRadius: "50%",
                marginRight: 5,
              }}
            />
            Weekly Off
          </span>
        </div>

        <AppTable
          progressPending={isPending}
          columns={columns}
          data={teamData}
          pagination
        />
      </Container>
    </PageContent>
  );
}