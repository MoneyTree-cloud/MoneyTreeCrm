import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useGet, usePost } from "../../Hooks/useApi";
import { defaultTheme } from "../../helpers/defaultTheme";
import Switch from "react-switch";
import { CREATE_PROJECT_TYPE_MASTER, GET_ALL_PROJECT_TYPE_MASTER, GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_, STATUS_CHANGE_PROJECT_TYPE_MASTER, } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { useUserStore } from "../../store/useUserStore";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import { WordWrapCell } from "../../helpers/function_helper";

export default function ProjectTypeMaster() {
  const initialFormState = {
    builderName: null,
    projectName: null,
    projectTypeName: "",
    isActive: false,
    selectedRow: null,
    searchByGroupSelect: null,
    page: 1,
  };

  const [formState, setFormState] = useState(initialFormState);
  const [rowId, setRowId] = useState(null);
  const [accessGranted, setAccessGranted] = useState(null);
  const userId = useUserStore((state) => state.user.userId);
  const [projectTypeList, setProjectTypeList] = useState([])

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'project-type-master');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_, { enabled: !!accessGranted });
  const { data: projectData } = useGet(
    `${GET_PROJECT_BY_BUILDER_}${formState?.builderName?.value}`,
    { enabled: !!formState.builderName }
  );

  const { data, refetch: getAllData, isLoading, } = useGet(`${GET_ALL_PROJECT_TYPE_MASTER}`, { enabled: !!accessGranted });

  useEffect(() => {
    if (data?.data?.status === 1) {
      decryptData(data?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setProjectTypeList(decryptedData);
        } else {
          setProjectTypeList([])
        }
      });
    }
  }, [data]);

  function handleBuilderTypeSelectGroup(selectedGroup) {
    setFormState((prevState) => ({
      ...prevState,
      builderName: selectedGroup,
    }));
  }

  function handleProjectTypeSelectGroup(selectedGroup) {
    setFormState((prevState) => ({
      ...prevState,
      projectName: selectedGroup,
    }));
  }

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "7%",
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name</span>,
      selector: (row) => row.builderName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      selector: (row) => row.projectName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Project Type Id</span>,
      selector: (row) => row.id,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.id}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Project Type Name</span>,
      selector: (row) => row.projectTypeName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.projectTypeName}</WordWrapCell>,
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

  const handleSwitchChange = (row) => {
    setRowId(row.id);
  };

  const { isPending: updateLoadingPut, mutate: mutateChangeStatus } = usePost(
    `${STATUS_CHANGE_PROJECT_TYPE_MASTER}?id=${rowId}`,
    {
      onSuccess: (response) => {
        setRowId(null);
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          getAllData();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        setRowId(null);
        toast.error(err.message);
      },
    }
  );

  useEffect(() => {
    if (rowId) {
      mutateChangeStatus();
    }
  }, [mutateChangeStatus, rowId]);

  const resetForm = () => {
    setFormState(initialFormState);
  };

  const { isLoading: addLoading, mutate: mutateAdd } = usePost(
    CREATE_PROJECT_TYPE_MASTER,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getAllData();
          setFormState(initialFormState)
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message || "An Error Occurred While Adding Data");
      },
    }
  );

  const handleSave = (e) => {
    e.preventDefault();
    if (!formState.builderName) {
      toast.error("Please Select Builder Name");
    } else if (!formState.projectName) {
      toast.error("Please Select Project Name");
    } else if (!formState.projectTypeName) {
      toast.error("Please Enter Project Type Name");
    } else {
      let params = {
        id: 0,
        projectTypeName: formState.projectTypeName,
        builderProjectId: formState?.projectName?.value,
        projectName: formState?.projectName?.label,
        builderId: formState?.builderName?.value,
        builderName: formState?.builderName?.label
      };
      mutateAdd(params);
    }
  };

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Master" breadcrumbItem="Project Type Master" />
      {(addLoading || updateLoadingPut || isLoading) && <ScreenLoader />}
      <Container fluid={true}>
        <form onSubmit={handleSave}>
          <Card>
            <CardBody>
              <Row className="g-3">
                <Col md="3">
                  <h6 className="font-size-11">Select Builder</h6>
                  <Select
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    value={formState.builderName}
                    onChange={handleBuilderTypeSelectGroup}
                    options={
                      Array.isArray(builderList?.data?.data)
                        ? builderList?.data?.data
                        : []
                    }
                  />
                </Col>
                <Col md="3">
                  <h6 className="font-size-11">Select Project</h6>
                  <Select
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isDisabled={!formState.builderName}
                    value={formState.projectName}
                    onChange={handleProjectTypeSelectGroup}
                    options={
                      Array.isArray(projectData?.data?.data)
                        ? projectData?.data?.data
                        : []
                    }
                  />
                </Col>
                <Col md="3">
                  <h6 className="font-size-11">Project Type Name</h6>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Project Type"
                    value={formState.projectTypeName}
                    onChange={(e) =>
                      setFormState((prevState) => ({
                        ...prevState,
                        projectTypeName: e.target.value,
                      }))
                    }
                  />
                </Col>

                <Col md="3" className="d-flex align-items-end">
                  <Button
                    color="primary"
                    className="me-2"
                    type="submit"
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                  <Button
                    color="secondary"
                    type="button"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>

        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={projectTypeList || []}
          pagination
        />
      </Container>
    </PageContent>
  );
}
