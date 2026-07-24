import { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, Button, Container, Form, Input } from "reactstrap";
import Switch from "react-switch";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import { useGet, usePost } from "../../Hooks/useApi";
import {
  ADD_TICKER_DATA_CONNECT,
  CHANGE_TICKER_STATUS_CONNECT,
  GET_ALL_TICKER_DATA_CONNECT,
} from "../../helpers/url_helper";
import { formatDate } from "../../helpers/function_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

const ConnectTicker = () => {
  const userId = useUserStore((state) => state.user.userId);
  const [tickerTitle, setTickerTitle] = useState(null);
  const [tickerId, setTickerId] = useState("");
  const [tickerAdd, setTickerAdd] = useState(false)

  const [accessGranted, setAccessGranted] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'connect-ticker');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  const { data: tickerList, refetch: getTickerList, isLoading } = useGet(GET_ALL_TICKER_DATA_CONNECT, { enabled: Boolean(accessGranted) });

  const { isPending, mutate } = usePost(`${ADD_TICKER_DATA_CONNECT}${userId}&tickerName=${tickerTitle}`, {
    onSuccess: (response) => {
      setTickerAdd(false)
      if (response?.data.status === 1) {
        toast.success(response.data.message);
        setTickerTitle("");
        getTickerList();
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      setTickerAdd(false)
      toast.error(err.message);
    },
  });

  const { isPending: updatePending, mutate: mutateUpdate } = usePost(
    `${CHANGE_TICKER_STATUS_CONNECT}?id=${tickerId}`,
    {
      onSuccess: (response) => {
        setTickerId('')
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          getTickerList();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        setTickerId('')
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
    else {
      setTickerAdd(true)
    }
  };

  useEffect(() => {
    if (tickerAdd) {
      mutate()
    }
  }, [tickerAdd, mutate])

  const handleSwitchChange = (row) => {
    setTickerId(row.tickerId);
  };

  useEffect(() => {
    if (tickerId) {
      mutateUpdate();
    }
  }, [mutateUpdate, tickerId]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Title</span>,
      selector: (row) => row.tickerName,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.tickerName}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Date</span>,
      selector: (row) => formatDate(row.createdDate),
      sortable: true,
      width: "15%",
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      sortable: true,
      width: "10%",
      cell: (row) => (
        <Switch
          onChange={() => handleSwitchChange(row)}
          checked={row.active === true}
          offColor={defaultTheme.goldColorLogo}
          onColor={defaultTheme.primary}
          height={20}
          width={40}
        />
      ),
    },
  ];

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Container fluid={true}>
        <Breadcrumbs
          title="Connect"
          breadcrumbItem="Ticker"
        />
        {(isPending || updatePending || isLoading) && <ScreenLoader />}
        <Row>
          <Col>
            <Card>
              <CardBody>
                <Form className="needs-validation" onSubmit={handleSubmit}>
                  <Row className="g-2">
                    <Col md="8">
                      <h6 className="font-size-11">Title</h6>
                      <Input
                        name="title"
                        placeholder="Type here..."
                        type="text"
                        className="form-control"
                        value={tickerTitle}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col md="4" style={{ marginTop: 30 }}>
                      <div className="d-flex align-items-center">
                        <Button type="submit" color="primary">
                          Submit
                        </Button>{" "}
                        <Button
                          type="reset"
                          className="ms-3"
                          style={{
                            backgroundColor: defaultTheme.goldColorLogo,
                          }}
                          onClick={() => setTickerTitle(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <AppTable
          progressPending={isLoading}
          columns={columns}
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

export default ConnectTicker;
