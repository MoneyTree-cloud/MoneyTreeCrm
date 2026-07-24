import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Select from "react-select";
import { useGet } from "../../Hooks/useApi";
import {
  GET_DROPDOWN_BUILDER_,
  GET_PROJECT_BY_BUILDER_,
  GET_PROJECT_UNIT_ASSOCIATE,
} from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { WordWrapCell } from "../../helpers/function_helper";
import { USER_TYPE } from "../../constants/global";

export default function HoldProjectUnitDetails() {
  const initialFormState = {
    builder: null,
    project: null,
  };
  const [formState, setFormState] = useState(initialFormState);
  const [unitData, setUnitData] = useState([]);
  const [isPending, setIsPending] = useState(false);
  const [accessGranted, setAccessGranted] = useState(null);
  const { user: { userId, role } } = useUserStore();

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name</span>,
      selector: (row) => row.builder_name,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.builder_name}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      selector: (row) => row.project_name,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.project_name}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Unit No</span>,
      selector: (row) => row.unit_no,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.unit_no}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Tower/Block</span>,
      selector: (row) => row.tower_block,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.tower_block}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Floor</span>,
      selector: (row) => row.floor,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.floor}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Area</span>,
      selector: (row) => row.area,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.area}</WordWrapCell>
    },
  ];

  const { data: builderList, isLoading } = useGet(GET_DROPDOWN_BUILDER_, { enabled: !!accessGranted });

  const { data: projectData, isLoading: isLoadingProject } = useGet(
    `${GET_PROJECT_BY_BUILDER_}${formState?.builder?.value}`,
    { enabled: Boolean(formState.builder) && !accessGranted }
  );

  function handleSelectChange(name) {
    return (selectedOption) => {
      setFormState((prevState) => ({
        ...prevState,
        [name]: selectedOption,
      }));
    };
  }

  const getUnitDetails = () => {
    ApiClient.post(
      `${GET_PROJECT_UNIT_ASSOCIATE}builderName=${formState?.builder?.value}&projectName=${formState?.project?.value}&unitStatus=hold`
    )
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          setUnitData(response.data.data);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message);
      });
  };

  const handleClear = () => {
    setFormState(initialFormState);
    setUnitData([]);
  };

  const clickHandler = () => {
    if (!formState.builder) {
      toast.error("Please Select Builder");
    } else if (!formState.project) {
      toast.error("Please Select Project");
    } else {
      setIsPending(true);
      getUnitDetails();
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (role !== USER_TYPE.ASSOCIATE) {
        const hasAccess = await CheckUserAccess(userId, 'hold-project-unit-details');
        setAccessGranted(hasAccess);
      }
      else {
        setAccessGranted(true)
      }
    };
    checkAccess();
  }, [userId, role]);

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs
        title="Hold Project Units"
        breadcrumbItem="Hold Project Units"
      />
      {(isPending || isLoadingProject || isLoading) && <ScreenLoader />}
      <Container fluid={true}>
        <form>
          <Card>
            <CardBody>
              <Row>
                <Col lg="4">
                  <h6 className="font-size-11">Select Builder</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    options={
                      Array.isArray(builderList?.data?.data)
                        ? builderList?.data?.data
                        : []
                    }
                    isClearable
                    onChange={handleSelectChange("builder")}
                    value={formState.builder}
                  />
                </Col>
                <Col lg="4">
                  <h6 className="font-size-11">Select Project</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isDisabled={!formState.builder}
                    isClearable
                    options={
                      Array.isArray(projectData?.data?.data)
                        ? projectData?.data?.data
                        : []
                    }
                    onChange={handleSelectChange("project")}
                    value={
                      Array.isArray(projectData?.data?.data) &&
                        projectData?.data?.data.length > 0
                        ? formState.project
                        : null
                    }
                  />
                </Col>
                <Col
                  lg="4"
                  className="d-flex align-items-end"
                >
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={clickHandler}
                  >
                    Show Data
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
        {Array.isArray(unitData) && unitData.length > 0 && (
          <AppTable
            progressPending={isPending}
            columns={columns}
            data={
              Array.isArray(unitData)
                ? unitData.filter((unit) => unit.unit_status === "hold")
                : []
            }
            pagination
          />
        )}
      </Container>
    </PageContent>
  );
}
