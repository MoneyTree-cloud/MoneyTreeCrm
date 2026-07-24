/* eslint-disable eqeqeq */
import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Select from "react-select";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet, usePut } from "../../Hooks/useApi";
import {CHANGE_PROJECT_UNIT_ASSOCIATE_STATUS,GET_DROPDOWN_BUILDER_,GET_PROJECT_BY_BUILDER_,GET_PROJECT_UNIT_ASSOCIATE} from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { WordWrapCell } from "../../helpers/function_helper";
import { USER_TYPE } from "../../constants/global";

export default function OpenProjectUnitDetails() {
  const { user: { userId, role } } = useUserStore();
  const [accessGranted, setAccessGranted] = useState(null);

  const initialFormState = {
    builder: null,
    project: null,
    status: null,
  };

  const [formState, setFormState] = useState(initialFormState);
  const [unitData, setUnitData] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const optionsArray = [
    { value: "0", label: "Select" },
    { value: "1", label: "Hold" },
  ];

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Hold</span>,
      cell: (row) => (
        <select
          value={row.unitStatus || ""}
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue == 1) {
              setSelectedUnitId(row.project_unit_id);
              setModalOpen(true);
            }
          }}
          style={{ padding: "3px" }}
        >
          {optionsArray.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ),
      sortable: true,
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
      width: "10%",
      cell: (row) => <WordWrapCell>{row.unit_no}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Tower/Block</span>,
      selector: (row) => row.tower_block,
      sortable: true,
      width: "12%",
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

  const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_, { enabled: !!accessGranted });

  const getUnitDetails = () => {
    ApiClient.post(
      `${GET_PROJECT_UNIT_ASSOCIATE}builderName=${formState?.builder?.value}&projectName=${formState?.project?.value}&unitStatus=open`
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

  const { isPending: isPendingUpdate, mutate: mutateUpdate } = usePut(
    `${CHANGE_PROJECT_UNIT_ASSOCIATE_STATUS}${selectedUnitId}&loginId=${userId}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          setUnitData((prev) =>
            prev.filter(
              (unitData) => unitData.project_unit_id !== selectedUnitId
            )
          );
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
      onSettled: () => {
        setSelectedUnitId("");
      },
    }
  );

  const { data: projectData } = useGet(
    formState.builder
      ? `${GET_PROJECT_BY_BUILDER_}${formState?.builder?.value}`
      : null,
    { enabled: Boolean(formState.builder) }
  );

  function handleSelectChange(name) {
    return (selectedOption) => {
      setFormState((prevState) => ({
        ...prevState,
        [name]: selectedOption,
      }));
    };
  }

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

  const handleClear = () => {
    setFormState(initialFormState);
    setUnitData([]);
  };

  const handleConfirm = () => {
    if (selectedUnitId) {
      mutateUpdate();
    }
    setModalOpen(false);
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (role !== USER_TYPE.ASSOCIATE) {
        const hasAccess = await CheckUserAccess(userId, 'open-project-unit-details');
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
      <Breadcrumbs title="Open Project Units" breadcrumbItem="Open Project Units" />
      {(isPending || isPendingUpdate) && <ScreenLoader />}
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
                    onChange={handleSelectChange("builder")}
                    value={formState.builder}
                    isClearable
                  />
                </Col>
                <Col lg="4">
                  <h6 className="font-size-11">Select Project</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isDisabled={!formState.builder}
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
                    isClearable
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
                ? unitData.filter((unit) => unit.unit_status !== "hold")
                : []
            }
            pagination

          />
        )}
      </Container>

      <Modal isOpen={isModalOpen} toggle={handleCancel}>
        <ModalHeader toggle={handleCancel}>Confirm Hold</ModalHeader>
        <ModalBody>Are you sure you want to hold this unit?</ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            style={{ backgroundColor: defaultTheme.primary }}
            onClick={handleConfirm}
          >
            Yes
          </Button>
          <Button
            color="secondary"
            style={{ backgroundColor: defaultTheme.goldColorLogo }}
            onClick={handleCancel}
          >
            No
          </Button>
        </ModalFooter>
      </Modal>
    </PageContent>
  );
}
