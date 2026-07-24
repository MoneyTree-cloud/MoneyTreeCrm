import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import {
  CHANGE_ATTENDANCE_LOCATION_MASTER_STATUS,
  CREATE_ATTENDANCE_LOCATION_MASTER,
  GET_ALL_ATTENDANCE_LOCATION_MASTER
} from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import Switch from "react-switch";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import { FaMapMarkerAlt } from "react-icons/fa";
import { WordWrapCell } from "../../helpers/function_helper";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function AttendanceLocationMaster() {
  const userId = useUserStore((state) => state.user.userId);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationId, setLocationId] = useState("");
  const [accessGranted, setAccessGranted] = useState(null);

  const { isPending: addLoading, mutate: mutateAdd } = usePost(
    `${CREATE_ATTENDANCE_LOCATION_MASTER}${latitude}&longitude=${longitude}&createdBy=${userId}&locationName=${selectedLocation}`,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          handleClearData()
          getAllData();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const { isPending: changeLoading, mutate: mutateChange } = usePost(
    `${CHANGE_ATTENDANCE_LOCATION_MASTER_STATUS}${locationId}`,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          getAllData();
          setLocationId("");
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handleSwitchChange = (row) => {
    setLocationId(row.id);
  };

  useEffect(() => {
    if (locationId) {
      mutateChange()
    }
  }, [locationId, mutateChange])

  const {
    data: locationIdList,
    isLoading,
    refetch: getAllData,
  } = useGet(`${GET_ALL_ATTENDANCE_LOCATION_MASTER}`, { enabled: !!accessGranted });

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: '6%'
    },
    {
      name: <span className="font-weight-bold fs-13">Location</span>,
      selector: (row) => row.locationName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.locationName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Latitude</span>,
      selector: (row) => row.latitude,
      cell: (row) => <WordWrapCell>{row.latitude}</WordWrapCell>,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Longitude</span>,
      selector: (row) => row.longitude,
      cell: (row) => <WordWrapCell>{row.longitude}</WordWrapCell>,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      cell: (row) => (
        <Switch
          checked={row.active}
          offColor={defaultTheme.goldColorLogo}
          onColor={defaultTheme.primary}
          height={20}
          width={40}
          onChange={() => handleSwitchChange(row)}
        />
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Location</span>,
      selector: (row) => row.longitude,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {(row.latitude && row.longitude) && (
            <FaMapMarkerAlt
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/@${row.latitude},${row.longitude},16z?q=${row.latitude},${row.longitude}`,
                  "_blank"
                )
              }
              style={{
                cursor: "pointer",
                color: defaultTheme.goldColorLogo,
                fontSize: 20,
              }}
            />
          )}
        </div>
      ),
    },
  ];

  // Handler for Save button click
  const handleButtonClick = (e) => {
    e.preventDefault()
    if (!selectedLocation) {
      toast.error("Please Enter Location");
    } else if (!latitude) {
      toast.error("Please Enter Latitude");
    } else if (!longitude) {
      toast.error("Please Enter Longitude");
    }
    else {
      mutateAdd()
    }
  };

  const handleClearData = () => {
    setLocationId('')
    setSelectedLocation('')
    setLatitude('')
    setLongitude('')
  }


  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'attendance-location-master');
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
      {(addLoading || changeLoading || isLoading) && <ScreenLoader />}
      <Breadcrumbs title="Attendance" breadcrumbItem="Attendance Location" />
      <Container fluid={true}>
        <h3
          style={{
            fontSize: 12,
            fontWeight: "500",
            color: defaultTheme.redColor,
          }}
        >
          Note: Users can only mark their attendance will be only recorded within a 100-meter radius of the designated location.
        </h3>
        <form onSubmit={handleButtonClick}>
          <Card>
            <CardBody>
              <Row className="g-3">
                <Col lg="3">
                  <h6 className="font-size-12">Location</h6>
                  <input
                    className="form-control"
                    placeholder="Enter Location..."
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-12">Latitude</h6>
                  <input
                    className="form-control"
                    placeholder="Example : 28.5413108"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-12">Longitude</h6>
                  <input
                    className="form-control"
                    placeholder="Example : 77.3360677"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </Col>

                <Col md="3" className="d-flex align-items-end">
                  <button
                    type="submit"
                    className="btn btn-primary me-2"
                    onClick={handleButtonClick}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClearData}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>
        {Array.isArray(locationIdList?.data?.data) && locationIdList?.data?.data?.length > 0 &&
          <AppTable
            progressPending={isLoading}
            columns={columns}
            data={Array.isArray(locationIdList?.data?.data) ? locationIdList?.data?.data : []}
            pagination
          />
        }
      </Container>
    </PageContent>
  );
}
