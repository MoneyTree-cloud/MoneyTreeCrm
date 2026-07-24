import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePut } from "../../Hooks/useApi";
import { ADD_DEPARTMENT, CHANGE_DEPARTMENT_STATUS, GET_ALL_DEPARTMENT } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import Switch from "react-switch";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { useUserStore } from "../../store/useUserStore";
import { WordWrapCell } from "../../helpers/function_helper";

export default function Department() {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [rowStatus, setRowStatus] = useState("");
  const [deptName, setDeptName] = useState("");
  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'department');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);


  const { isPending: addLoadingPut, mutate } = usePut(
    `${CHANGE_DEPARTMENT_STATUS}${rowStatus}&departName=${deptName}`,
    {
      onSuccess: (response) => {
        setRowStatus("");
        setDeptName("");
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          getAllData();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        setRowStatus("");
        setDeptName("");
        toast.error(err.message);
      },
    }
  );

  const handleSwitchChange = (row) => {
    const newStatus = row.isActive === "YES" ? "NO" : "YES";
    setRowStatus(newStatus);
    setDeptName(row.departmentName);
  };

  useEffect(() => {
    if (rowStatus && deptName) {
      mutate()
    }
  }, [rowStatus, deptName, mutate])


  const {
    data: departmentList,
    isLoading,
    refetch: getAllData,
  } = useGet(`${GET_ALL_DEPARTMENT}`, { enabled: Boolean(accessGranted) });

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: '10%'
    },
    {
      name: <span className="font-weight-bold fs-13">Department</span>,
      selector: (row) => row.departmentName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.departmentName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      cell: (row) => (
        <Switch
          checked={row.isActive === "YES"}
          offColor={defaultTheme.goldColorLogo}
          onColor={defaultTheme.primary}
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
    refetch: addDeptList,
  } = useGet(
    `${ADD_DEPARTMENT}${selectedDepartment}&isActive=YES`,
    { enabled: false } // Skip fetching if not searching
  );

  if (addData?.data?.status === 1) {
    toast.success(addData?.data?.message);
    setSelectedDepartment("");
    getAllData();
  } else {
    toast.error(addData?.data?.message);
  }

  // Handler for Save button click
  const handleButtonClick = (e) => {
    e.preventDefault();
    if (!selectedDepartment) {
      toast.error("Please Enter Department");
    } else {
      addDeptList();
    }
  };

  const handleClear = () => {
    setSelectedDepartment("");
    setRowStatus("");
    setDeptName("");
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
      <Breadcrumbs title="Master" breadcrumbItem="Department" />
      <Container fluid={true}>
        <form onSubmit={handleButtonClick}>
          <Card>
            <CardBody>
              <Row className="g-3">
                <Col lg="6">
                  <h6 className="font-size-12">Department Name</h6>
                  <input
                    className="form-control"
                    placeholder="Department Name"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
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
          data={Array.isArray(departmentList?.data?.data) ? departmentList?.data?.data : []}
          pagination
        />
      </Container>
    </PageContent>
  );
}
