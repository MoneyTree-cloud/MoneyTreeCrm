import { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, Button, Container, Form, Input } from "reactstrap";
import Switch from "react-switch";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import { useGet, usePost } from "../../Hooks/useApi";
import { ADD_TICKER_DATA, CHANGE_TICKER_STATUS, GET_ALL_TICKER_DATA } from "../../helpers/url_helper";
import { formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

const AddTickerData = () => {
  const { userId, empCode, userName } = useUserStore((state) => state.user);
  const [tickerTitle, setTickerTitle] = useState(null);
  const [rowStatus, setRowStatus] = useState("");
  const [tickerId, setTickerId] = useState("");
  const [accessGranted, setAccessGranted] = useState(null);

  const { data: tickerList, refetch: getTickerList, isLoading } = useGet(GET_ALL_TICKER_DATA, { enabled: !!accessGranted })

  const { isPending, mutate } = usePost(ADD_TICKER_DATA + userId, {
    onSuccess: (response) => {
      if (response?.data.status === 1) {
        toast.success(response.data.message);
        setTickerTitle("");
        getTickerList();
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { isPending: updatePending, mutate: mutateUpdate } = usePost(
    CHANGE_TICKER_STATUS,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          setRowStatus('')
          setTickerId('')
          getTickerList();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handleChange = (e) => {
    setTickerTitle(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tickerTitle) {
      toast.error("Please Enter Ticker Content");
      return;
    }
    let params = {
      tickerId: 0,
      tickerName: tickerTitle,
      isActive: "YES",
      createdDate: "",
      createdBy: `${userName} (${empCode})`,
      updatedBy: "",
      updatedDate: "",
    };
    mutate(params);
  };

  const handleSwitchChange = (row) => {
    const newStatus = row.isActive === "YES" ? "NO" : "YES";
    setRowStatus(newStatus);
    setTickerId(row.tickerId);
  };

  useEffect(() => {
    if (rowStatus && tickerId) {
      let params = {
        tickerId: tickerId,
        status: rowStatus,
      };
      mutateUpdate(params);
    }
  }, [rowStatus, tickerId, mutateUpdate]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, i) => i + 1,
      width: "7%",
    },
    {
      name: <span className="font-weight-bold fs-13">Title</span>,
      selector: (row) => row.tickerName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.tickerName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
      selector: (row) => row.createdDate,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      width: "10%",
      cell: (row) => (
        <Switch
          onChange={() => handleSwitchChange(row)}
          checked={row.isActive === "YES"}
          offColor={defaultTheme.goldColorLogo}
          onColor={defaultTheme.primary}
          height={20}
          width={40}
        />
      ),
    },
  ];

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'ticker');
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
      <Container fluid={true}>
        <Breadcrumbs title="Ticker" breadcrumbItem="Data" />
        {(isPending || updatePending || isLoading) && <ScreenLoader />}
        <Card>
          <CardBody>
            <Form className="needs-validation" onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md="8">
                  <h6 className="font-size-11">Title <RequiredStar /></h6>
                  <Input
                    name="title"
                    placeholder="Type here..."
                    type="text"
                    className="form-control"
                    value={tickerTitle || ""}
                    onChange={handleChange}
                  />
                </Col>
                <Col md="4" className="d-flex align-items-end">
                  <Button type="submit" color="primary">
                    Submit
                  </Button>{" "}
                  <Button
                    type="reset"
                    className="ms-2"
                    color="secondary"
                    onClick={() => setTickerTitle(null)}
                  >
                    Cancel
                  </Button>
                </Col>
              </Row>
            </Form>
          </CardBody>
        </Card>

        <AppTable
          columns={columns}
          progressLoading={isLoading}
          data={
            Array.isArray(tickerList?.data?.data)
              ? tickerList?.data?.data
              : []
          }
          pagination
        />
      </Container>
    </PageContent>
  );
};

export default AddTickerData;