import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePut } from "../../Hooks/useApi";
import { ADD_DESIGNATION, CHANGE_DESIGNATION_STATUS, GET_ALL_DESIGNATION } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import Switch from "react-switch";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { useUserStore } from "../../store/useUserStore";
import { WordWrapCell } from "../../helpers/function_helper";

export default function Level() {
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);

  const { data: designationList, refetch: getAllData, isLoading } = useGet(
    `${GET_ALL_DESIGNATION}`, { enabled: Boolean(accessGranted) }
  );

  const [rowStatus, setRowStatus] = useState("");
  const [desName, setDesName] = useState("");


  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'level');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);


  const { isPending: addLoadingPut, mutate } = usePut(
    `${CHANGE_DESIGNATION_STATUS}${rowStatus}&degignation=${desName}`,
    {
      onSuccess: (response) => {
        setRowStatus("");
        setDesName("");
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          getAllData();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        setRowStatus("");
        setDesName("");
        toast.error(err.message);
      },
    }
  );

  useEffect(() => {
    if (rowStatus && desName) {
      mutate();
    }
  }, [rowStatus, desName, mutate]);

  const handleSwitchChange = (row) => {
    const newStatus = row.isActive === "YES" ? "NO" : "YES";
    setRowStatus(newStatus);
    setDesName(row.name);
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: '10%'
    },
    {
      name: <span className="font-weight-bold fs-13">Level</span>,
      selector: (row) => row.name,
      cell: (row) => <WordWrapCell>{row.name}</WordWrapCell>,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      cell: (row) => (
        <Switch
          checked={row.isActive === "YES"}
          offColor={defaultTheme.goldColorLogo}
          onColor={defaultTheme.primary}
          // uncheckedIcon={false}
          // checkedIcon={false}
          height={20}
          width={40}
          onChange={() => handleSwitchChange(row)}
        />
      ),
    },
  ];

  const {
    data: addData,
    isLoading: addLoading,
    refetch: addDesList,
  } = useGet(
    `${ADD_DESIGNATION}${selectedDesignation}&isActive=YES`,
    { enabled: false } // Skip fetching if not searching
  );

  if (addData?.data?.status === 1) {
    toast.success(addData?.data?.message);
    setSelectedDesignation("");
    getAllData();
  } else {
    toast.error(addData?.data?.message);
  }

  // Handler for Save button click
  const handleButtonClick = (e) => {
    e.preventDefault();
    if (!selectedDesignation) {
      toast.error("Please Enter Level");
    } else {
      addDesList();
    }
  };

  const handleClear = () => {
    setSelectedDesignation("");
    setRowStatus("");
    setDesName("");
  }

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }


  return (
    <PageContent>
      {(addLoading || addLoadingPut || isLoading) && <ScreenLoader />}
      <Breadcrumbs title="Master" breadcrumbItem="Level" />
      <Container fluid={true}>
        <form onSubmit={handleButtonClick}>
          <Card>
            <CardBody>
              <Row className="g-3">
                <Col lg="6">
                  <h6 className="font-size-12">Level</h6>
                  <input
                    className="form-control"
                    placeholder="Level"
                    value={selectedDesignation}
                    onChange={(e) => setSelectedDesignation(e.target.value)}
                  />
                </Col>
                <Col md="3" className="d-flex align-items-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleButtonClick}
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
          data={Array.isArray(designationList?.data?.data) ? designationList?.data?.data : []}
          pagination
        />
      </Container>
    </PageContent>
  );
}
