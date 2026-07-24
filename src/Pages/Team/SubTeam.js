import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { defaultTheme } from "../../helpers/defaultTheme";
import Select from "react-select";
import { toast } from "react-toastify";
import { useGet, usePost, usePut } from "../../Hooks/useApi";
import {
  SAVE_SUB_TEAM_DATA,
  GET_ALL_MAIN_TEAM_DROPDOWN,
  GET_SUB_TEAM_TABLE,
  GET_ALL_USERS_DROPDOWN,
  CHANGE_SUB_TEAM_STATUS,
} from "../../helpers/url_helper";
import Switch from "react-switch";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { RequiredStar, WordWrapCell } from "../../helpers/function_helper";

export default function SubTeam() {
  const [formData, setFormData] = useState({
    selectedMainTeam: null,
    selectedEmployee: null,
    nickName: "",
  });
  const [rowStatus, setRowStatus] = useState("");
  const [rowId, setRowId] = useState("");

  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);

  // Fetch options for the main teams and employees
  const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN, { enabled: !!accessGranted });
  const { data: empList } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: !!accessGranted });

  const handleSwitchChange = (row) => {
    const newStatus = row.isActive === "YES" ? "NO" : "YES";
    setRowStatus(newStatus);
    setRowId(row.id);
  };

  const { isPending: addLoadingPut, mutate: mutateUpdate } = usePut(
    `${CHANGE_SUB_TEAM_STATUS}${rowStatus}&id=${rowId}`,
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

  const {
    data: subTeamList,
    isLoading,
    refetch: getAllData,
  } = useGet(`${GET_SUB_TEAM_TABLE}`, { enabled: !!accessGranted });

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      width: "10%",
      cell: (_, index) => <WordWrapCell>{index + 1}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Main Team</span>,
      sortable: true,
      selector: (row) => row.mainTeamName,
      cell: (row) => <WordWrapCell> {row.mainTeamEmp + " (" + row.mainTeamName + ")"}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Sub Team Person Name</span>,
      sortable: true,
      selector: (row) => row.empName,
      cell: (row) => <WordWrapCell>{row.empName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Sub Team</span>,
      sortable: true,
      selector: (row) => row.subTeamName,
      cell: (row) => <WordWrapCell>{row.subTeamName}</WordWrapCell>,
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
    const { selectedMainTeam, selectedEmployee, nickName } = formData;
    if (!selectedMainTeam) {
      toast.error("Please Select A Main Team");
    } else if (!selectedEmployee) {
      toast.error("Please Select An Employee");
    } else if (!nickName) {
      toast.error("Please Enter Nick Name");
    } else {
      let params = {
        id: 0,
        empCode: formData?.selectedEmployee?.value,
        empName: formData?.selectedEmployee?.label,
        subTeamName: nickName,
        mainTeamName: formData?.selectedMainTeam?.value,
        isActive: "YES",
      };
      createSubTeam(params);
    }
  };

  const handleClearData = () => {
    setFormData({
      selectedMainTeam: null,
      selectedEmployee: null,
      nickName: "",
    });
  };

  const handleMainTeamChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      selectedMainTeam: selectedOption,
    }));
  };

  const handleEmployeeChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      selectedEmployee: selectedOption,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const { isPending, mutate: createSubTeam } = usePost(SAVE_SUB_TEAM_DATA, {
    onSuccess: (response) => {
      if (response?.data?.status === 1) {
        toast.success(response.data.message);
        handleClearData();
        getAllData();
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
      const hasAccess = await CheckUserAccess(userId, 'sub-team');
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
      <Breadcrumbs title="Team" breadcrumbItem="Sub Team" />
      {(isPending || addLoadingPut || isLoading) && <ScreenLoader />}
      <Container fluid={true}>
        <form onSubmit={handleSaveData}>
          <Card>
            <CardBody>
              <Row className="g-2">
                <Col lg="3">
                  <h6 className="font-size-11">Select Main Team <RequiredStar /></h6>
                  <Select
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    value={formData.selectedMainTeam}
                    onChange={handleMainTeamChange}
                    options={
                      Array.isArray(mainTeams?.data?.data)
                        ? mainTeams?.data?.data
                        : []
                    }
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">Select Employee <RequiredStar /></h6>
                  <Select
                    menuPortalTarget={document.body}
                    isClearable
                    value={formData.selectedEmployee}
                    onChange={handleEmployeeChange}
                    options={
                      Array.isArray(empList?.data?.data)
                        ? empList?.data?.data
                        : []
                    }
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">Nick Name <RequiredStar /></h6>
                  <input
                    className="form-control"
                    type="text"
                    name="nickName"
                    required
                    placeholder="Nick Name"
                    value={formData.nickName}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col lg="3" className="d-flex align-items-end">
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
            </CardBody>
          </Card>
        </form>

        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={
            Array.isArray(subTeamList?.data?.data)
              ? subTeamList?.data?.data
              : []
          }
          pagination
        />
      </Container>
    </PageContent>
  );
}
