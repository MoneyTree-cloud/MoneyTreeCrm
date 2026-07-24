import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { defaultTheme } from "../../helpers/defaultTheme";
import Select from "react-select";
import { toast } from "react-toastify";
import { useGet, usePost, usePut } from "../../Hooks/useApi";
import {
  CHANGE_MAIN_TEAM_STATUS,
  GET_ALL_USERS_DROPDOWN,
  GET_MAIN_TEAM_TABLE,
  SAVE_MAIN_TEAM_DATA,
} from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import Switch from "react-switch";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { RequiredStar, WordWrapCell } from "../../helpers/function_helper";

export default function MainTeam() {
  const [formData, setFormData] = useState({
    selectedEmployee: null,
    nickName: "",
  });

  const [rowStatus, setRowStatus] = useState("");
  const [rowId, setRowId] = useState("");
  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);

  const { data: empList } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: !!accessGranted });
  const {
    data: mainTeamList,
    isLoading,
    refetch: getAllData,
  } = useGet(`${GET_MAIN_TEAM_TABLE}`, { enabled: !!accessGranted });

  const handleSwitchChange = (row) => {
    const newStatus = row.isActive === "YES" ? "NO" : "YES";
    setRowStatus(newStatus);
    setRowId(row.id);
  };

  const { isPending: addLoadingPut, mutate: mutateUpdate } = usePut(
    `${CHANGE_MAIN_TEAM_STATUS}${rowStatus}&id=${rowId}`,
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
  }, [rowStatus, rowId, mutateUpdate]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      width: '10%',
      cell: (_, index) => <WordWrapCell>{index + 1}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Emp Team</span>,
      sortable: true,
      selector: (row) => row.empName,
      cell: (row) => <WordWrapCell>{row.empName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Nick Name</span>,
      sortable: true,
      selector: (row) => row.teamName,
      cell: (row) => <WordWrapCell>{row.teamName}</WordWrapCell>,
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

  const handleSaveData = (e) => {
    e.preventDefault()
    const { selectedEmployee, nickName } = formData;
    if (!selectedEmployee) {
      toast.error("Please Select An Employee");
    } else if (!nickName) {
      toast.error("Please Enter Nick Name");
    } else {
      let params = {
        id: 0,
        empCode: selectedEmployee?.value,
        empName: selectedEmployee?.label,
        teamName: nickName,
      };
      createMainTeam(params);
    }
  };

  const handleClearData = () => {
    setFormData({
      selectedEmployee: null,
      nickName: "",
    });
  };

  const handleSelectChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      selectedEmployee: selectedOption,
    }));
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      nickName: value,
    }));
  };

  const { isPending, mutate: createMainTeam } = usePost(SAVE_MAIN_TEAM_DATA, {
    onSuccess: (response) => {
      if (response?.data?.status === 1) {
        toast.success(response.data.message);
        getAllData();
        handleClearData();
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'main-team');
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
      <Breadcrumbs title="Team" breadcrumbItem="Main Team" />
      {(isPending || addLoadingPut || isLoading) && <ScreenLoader />}
      <Container fluid={true}>
        <Card>
          <CardBody>
            <form onSubmit={handleSaveData}>
              <Row className="g-2">
                <Col lg="4">
                  <h6 className="font-size-11">Select Employee <RequiredStar /></h6>
                  <Select
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    value={formData.selectedEmployee}
                    onChange={handleSelectChange}
                    options={
                      Array.isArray(empList?.data?.data)
                        ? empList?.data?.data
                        : []
                    }
                  />
                </Col>
                <Col lg="4">
                  <h6 className="font-size-11">Nick Name <RequiredStar /></h6>
                  <input
                    className="form-control"
                    type="text"
                    required
                    placeholder="Nick Name"
                    value={formData.nickName}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col lg="4" className="d-flex align-items-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleSaveData}
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={handleClearData}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>
        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={
            Array.isArray(mainTeamList?.data?.data)
              ? mainTeamList?.data?.data
              : []
          }
          pagination
        />
      </Container>
    </PageContent>
  );
}
