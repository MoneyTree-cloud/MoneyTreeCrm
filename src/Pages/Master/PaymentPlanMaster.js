import { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet, usePost, usePut } from "../../Hooks/useApi";
import { ADD_PAYMENT_PLAN, CHANGE_PLAN_STATUS, GET_ALL_PAYMENT_PLAN } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import Switch from "react-switch";
import ScreenLoader from "../../constants/ScreenLoader";
import { formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { useUserStore } from "../../store/useUserStore";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function PaymentPlanMaster() {
  // Initial form state
  const [paymentPlanname, setPaymentPlanName] = useState("");
  const [rowStatus, setRowStatus] = useState(null);
  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);
  const [paymentPlanList, setPaymentPlanList] = useState([])
  const [rowId, setRowId] = useState("");
  const { data, isLoading, refetch: getAllData, } = useGet(GET_ALL_PAYMENT_PLAN, { enabled: !!accessGranted });

  useEffect(() => {
    if (data?.data?.status === 1) {
      decryptData(data?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setPaymentPlanList(decryptedData);
        } else {
          setPaymentPlanList([])
        }
      });
    }
  }, [data]);


  const handleSwitchChange = (row) => {
    const newStatus = row.status === "YES" ? "NO" : "YES";
    setRowStatus(newStatus);
    setRowId(row.paymentId);
  };

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'payment-plan-master');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);


  const { isPending: loadingPut, mutate: mutateUpdate } = usePut(
    `${CHANGE_PLAN_STATUS}${rowStatus}&id=${rowId}`,
    {
      onSuccess: (response) => {
        setRowStatus("");
        setRowId("");
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          getAllData();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        setRowStatus("");
        setRowId("");
        toast.error(err.message);
      },
    }
  );

  useEffect(() => {
    if (rowStatus && rowId) {
      mutateUpdate();
    }
  }, [mutateUpdate, rowId, rowStatus]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Id</span>,
      selector: (row) => row.paymentId,
      sortable: true,
      width: "8%",
      cell: (row) => <WordWrapCell>{row.paymentId}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Plan Name</span>,
      selector: (row) => row.paymentName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.paymentName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
      selector: (row) => formatDateTime(row.createdDate),
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      cell: (row) => (
        <Switch
          checked={row.status === "YES"}
          offColor={defaultTheme.goldColorLogo}
          onColor={defaultTheme.primary}
          height={20}
          width={40}
          onChange={() => handleSwitchChange(row)}
        />
      ),
    },
  ];

  const { isPending: addLoading, mutate: addPaymentPlan } = usePost(
    `${ADD_PAYMENT_PLAN}${paymentPlanname}`,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          handleClear();
          getAllData();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        handleClear();
        toast.error(err.message);
      },
    }
  );

  // Handler for Save button click
  const handleSave = (event) => {
    event.preventDefault();
    if (!paymentPlanname) {
      toast.error("Please Enter Plan Name Before Save");
    } else {
      addPaymentPlan();
    }
  };

  const handleClear = () => {
    setPaymentPlanName('')
  }

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Master" breadcrumbItem="Payment Plan" />
      {(loadingPut || addLoading || isLoading) && <ScreenLoader />}
      <Container fluid={true}>
        <form onSubmit={handleSave}>
          <Card>
            <CardBody>
              <Row>
                <Col md="8">
                  <h6 className="font-size-11">Payment Plan Name</h6>
                  <input
                    id="paymentPlanName"
                    className="form-control"
                    type="text"
                    value={paymentPlanname}
                    onChange={(e) => setPaymentPlanName(e.target.value)}
                    placeholder="Type here..."
                  />
                </Col>
                <Col md="4" className="d-flex align-items-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={handleClear}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>

        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={paymentPlanList || []}
          pagination
        />
      </Container>
    </PageContent>
  );
}
