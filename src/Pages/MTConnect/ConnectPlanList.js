import React, { useEffect, useState } from "react";
import {
  Container,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet, usePost } from "../../Hooks/useApi";
import {
  CHANGE_STATUS_PLAN,
  GET_ALL_PLANS
} from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css";
import Switch from "react-switch";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import { WordWrapCell } from "../../helpers/function_helper";

export default function ConnectPlanList() {
  const navigation = useNavigate();
  const [planId, setPlanId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [planDetails, setPlanDetails] = useState([])

  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);
  const [connectPlanList, setConnectPlanList] = useState([]);
  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'connect-plan-list');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  const { data, isLoading, refetch: getAllPlansList } = useGet(GET_ALL_PLANS, { enabled: Boolean(accessGranted) }); useEffect(() => {
    if (data?.data?.status === 1) {

      decryptData(data?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setConnectPlanList(decryptedData);
        } else {
          setConnectPlanList([])
        }
      });
    }
  }, [data]);



  const handleSwitchChange = (row) => {
    setPlanId(row.planId);
  };

  const { isPending: isPendingStatus, mutate: mutateStatusUpdate } = usePost(
    CHANGE_STATUS_PLAN + planId,
    {
      onSuccess: (response) => {
        setPlanId("");
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getAllPlansList()
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        setPlanId("");
        toast.error(err.message);
      },
    }
  );

  useEffect(() => {
    if (planId) {
      mutateStatusUpdate();
    }
  }, [mutateStatusUpdate, planId]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      width: "8%",
      cell: (_, index) => <WordWrapCell>{index + 1}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Manage</span>,
      width: '8%',
      cell: (row) => (
        <i
          className="ri-pencil-fill align-bottom me-2"
          onClick={() => handleAddUpdateConnect(row)}
          style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
        ></i>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Name</span>,
      sortable: true,
      selector: (row) => row.planName,
      cell: (row) => <WordWrapCell>{row.planName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Amount</span>,
      sortable: true,
      selector: (row) => row.planPayment,
      cell: (row) => <WordWrapCell>{row.planPayment}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Description</span>,
      sortable: true,
      selector: (row) => row.planDescription,
      cell: (row) => <WordWrapCell>{row.planDescription}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Details</span>,
      selector: (row) => (
        <div>
          <i
            className="fas fa-eye"
            style={{ cursor: "pointer", color: defaultTheme.primary }}
            onClick={() => {
              setPlanDetails(row.planMasterRanges);
              setModalOpen(true);
            }}
          ></i>
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      cell: (row) => (
        <Switch
          checked={row.active === true}
          offColor={defaultTheme.goldColorLogo}
          onColor={defaultTheme.primary}
          height={20}
          width={40}
          onChange={() => handleSwitchChange(row)}
        />
      ),
    },
  ];

  const columnsPlanDetails = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      cell: (_, index) => <WordWrapCell>{index + 1}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Range</span>,
      sortable: true,
      selector: (row) => row.planRange,
      cell: (row) => <WordWrapCell>{row.planRange}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Incentive</span>,
      sortable: true,
      selector: (row) => row.planIncentive,
      cell: (row) => <WordWrapCell>{row.planIncentive}</WordWrapCell>,
    },
  ];

  const handleAddUpdateConnect = (rowData) => {
    navigation('/connect-plan-list/connect-plan-add-update', {
      state: { rowData: rowData },
    })
  }

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Connect" breadcrumbItem="Plan List" />
      {(isPendingStatus || isLoading) && <ScreenLoader />}
      <Container fluid={true}>
        <i
          className="fas fa-plus"
          style={{
            color: defaultTheme.primary,
            cursor: "pointer",
            fontSize: "18px",
            marginBottom: '10px'
          }}
          onClick={() => { handleAddUpdateConnect({}) }}
        ></i>

        <AppTable
          columns={columns}
          data={Array.isArray(connectPlanList) ? connectPlanList : []}
          pagination
          progressPending={isLoading}
        />
      </Container>

      <Modal
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
      >
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
          Plan Details
        </ModalHeader>
        <ModalBody>
          <AppTable
            progressSales={isLoading}
            columns={columnsPlanDetails}
            data={Array.isArray(planDetails) ? planDetails : []}
            pagination
          />
        </ModalBody>
      </Modal>

    </PageContent>
  );
}
