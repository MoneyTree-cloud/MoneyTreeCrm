/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import { ALL_LOCATION_DROPDOWN, VISITOR_MANAGEMENT_REPORT } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css"; // Import your CSS file
import { toast } from "react-toastify";
import ApiClient from "../../helpers/api_helper";
import Select from "react-select";
import { defaultTheme } from "../../helpers/defaultTheme";
import { MdMobileFriendly } from "react-icons/md";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function VisitorManagementReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [locationType, setLocationType] = useState(null);
  const [purposeType, setPurposeType] = useState(null);
  const [page, setPage] = useState(1);
  const LIMIT = 100;
  const [visitorData, setVisitorData] = useState([]);
  const { data: locationList } = useGet(ALL_LOCATION_DROPDOWN);
  const [flag, setFlag] = useState(false);

  const [accessGranted, setAccessGranted] = useState(null);
  const userId = useUserStore((state) => state.user.userId);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'report-visitor-management');
      setAccessGranted(hasAccess);
      if (hasAccess) {
        setTodayDate();
      }
    };
    checkAccess();
  }, [userId]);

  const setTodayDate = () => {
    const today = new Date(); // Get today's date
    setFromDate(formatDateForInput(today));
    setToDate(formatDateForInput(today));
  };

  const purposeGroup = [
    { label: "Client", value: "Client" },
    { label: "Visitor", value: "Visitor" },
    { label: "Interview", value: "Interview" },
    { label: "Vendor", value: "Vendor" },
  ];

  const handleLocationChange = (selectedOption) => {
    setLocationType(selectedOption); // Update the state with the selected option
  };

  const handlePurposeChange = (selectedOption) => {
    setPurposeType(selectedOption); // Update the state with the selected option
  };

  const handleClearData = () => {
    setTodayDate();
    setLocationType(null);
    setPurposeType(null);
    setVisitorData([]);
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      selector: (row) => row.associateId,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.associateName + " (" + row.associateId + ")"}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Name</span>,
      selector: (row) => row.name,
      sortable: true,
      width: "12%",
      cell: (row) => <WordWrapCell>{row.name}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Date</span>,
      selector: (row) => formatDateTime(row.createDate),
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{formatDateTime(row.createDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Mobile Number</span>,
      width: "10%",
      sortable: true,
      selector: (row) => row.mobileNo,
      cell: (row) => (
        <div className="phone-container">
          <MdMobileFriendly
            className="phone-icon"
            color={defaultTheme.goldColorLogo}
          />
          <span className="phone-number">{row.mobileNo}</span>
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Address</span>,
      selector: (row) => row.address,
      sortable: true,
      width: "12%",
      cell: (row) => <WordWrapCell>{row.address}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      selector: (row) => row.remarks,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.remarks}</WordWrapCell>,
    },
  ];

  useEffect(() => {
    if (flag) {
      getVisitorDetails();
    }
  }, [page]);

  const handleShowData = () => {
    if (!locationType) {
      toast.error("Please Select Location");
    } else if (!purposeType) {
      toast.error("Please Select Purpose");
    } else {
      getVisitorDetails();
    }
  };

  const getVisitorDetails = () => {
    setIsPending(true);
    ApiClient.get(
      `${VISITOR_MANAGEMENT_REPORT}${fromDate}&toDate=${toDate}&location=${locationType?.value
      }&purpose=${purposeType?.value}&offset=${page - 1}&limit=${LIMIT}`
    )
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          const encryptedContent = response.data.data;

          decryptData(encryptedContent).then((decrypted) => {
            setVisitorData(decrypted);
          }).catch((error) => {
            setVisitorData([]);
          });

        } else {
          setVisitorData([]);
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        setVisitorData([]);
        toast.error(error.message);
      });
  };

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Report" breadcrumbItem="Visitor Management" />
      {isPending && <ScreenLoader />}
      <Container fluid={true}>
        <Card>
          <CardBody>
            <Row>
              <Col md="2">
                <h6 className="font-size-11">From Date</h6>
                <input
                  className="form-control"
                  type="date"
                  id="date-input-1"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Col>
              <Col md="2">
                <h6 className="font-size-11">To Date</h6>
                <input
                  className="form-control"
                  type="date"
                  id="date-input-2"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Col>
              <Col md="3">
                <h6 className="font-size-11">Location <RequiredStar /></h6>
                <Select
                  style={{ zIndex: 9999 }}
                  menuPortalTarget={document.body}
                  isClearable
                  value={locationType}
                  onChange={handleLocationChange}
                  options={
                    Array.isArray(locationList?.data?.data)
                      ? locationList?.data?.data
                      : []
                  }
                />
              </Col>

              <Col md="3">
                <h6 className="font-size-11">Purpose <RequiredStar /></h6>
                <Select
                  style={{ zIndex: 9999 }}
                  menuPortalTarget={document.body}
                  isClearable
                  value={purposeType}
                  onChange={handlePurposeChange}
                  options={purposeGroup}
                />
              </Col>
              <Col md="2" className="d-flex align-items-end gap-2">
                <Button
                  color="primary"
                  type="submit"
                  onClick={handleShowData}
                >
                  Show
                </Button>
                <Button
                  color="secondary"
                  type="button"
                  onClick={handleClearData}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>

      {visitorData?.content?.length > 0 && (
        <AppTable
          progressPending={isPending}
          columns={columns}
          data={visitorData?.content || []}
          paginationTotalRows={visitorData?.totalElements}
          pagination
          paginationServer
          onChangePage={(newPage) => {
            setPage(newPage);
            setFlag(true);
          }}

        />
      )}
    </PageContent>
  );
}
