/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Button, Card, CardBody, Col, Container, Row, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import Select from "react-select";
import { FiArrowLeft } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PageContent from "../../components/Common/PageContent";
import ScreenLoader from "../../constants/ScreenLoader";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import { useGet, usePost } from "../../Hooks/useApi";
import { GET_ALL_MAIN_TEAM_DROPDOWN_ID, GET_DROPDOWN_BUILDER_, GET_MEMBERS_BY_ID, GET_PROJECT_BY_BUILDER_, GET_SALES_TARGET_GROUP, SALES_TARGET_CREATE } from "../../helpers/url_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useNavigate, useLocation } from "react-router-dom";
import ApiClient from "../../helpers/api_helper";
import { RequiredStar } from "../../helpers/function_helper";

export default function EntrySalesTarget() {
  const empCode = useUserStore((state) => state.user.empCode);
  const navigate = useNavigate();
  const location = useLocation();
  const { rowData } = location.state || {};
  const [isPending, setIsPending] = useState(false)

  const [formState, setFormState] = useState({
    builderGroupSelect: null,
    projectNameSelect: null,
    targetType: "turnover",
    fromdate: null,
    toDate: null,
    remarks: "",
    totalTarget: 0,
  });

  const { data: mainTeams, isLoading: loadingMainTeams, } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN_ID);
  const { data: salesGroup, isLoading: loadingSalesGroup } = useGet(GET_SALES_TARGET_GROUP);
  const { data: builderList, } = useGet(GET_DROPDOWN_BUILDER_);
  const { data: projectData, isLoading: loadingProject, } = useGet(`${GET_PROJECT_BY_BUILDER_}${formState.builderGroupSelect?.value}`, { enabled: !!formState.builderGroupSelect });

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState({ name: "", members: [] });
  const [searchText, setSearchText] = useState("");
  // Pre-fill form on edit
  useEffect(() => {
    if (rowData && mainTeams?.data?.data?.length) {
      setFormState((prev) => ({
        ...prev,
        targetType: rowData.targetType?.toLowerCase(),
        fromdate: rowData.fromDate?.split(" ")[0],
        toDate: rowData.toDate?.split(" ")[0],
        remarks: rowData.remarks,
        totalTarget: rowData.totalTarget || 0,
      }));
    }
  }, [rowData, mainTeams]);

  useEffect(() => {
    if (rowData?.builderName && builderList?.data?.data?.length) {
      const builder = builderList.data.data.find(
        (b) => b.label === rowData.builderName
      );
      if (builder)
        setFormState((prev) => ({ ...prev, builderGroupSelect: builder }));
    }
  }, [rowData, builderList]);

  useEffect(() => {
    if (rowData?.projectName && projectData?.data?.data?.length) {
      const project = projectData.data.data.find(
        (p) => p.label === rowData.projectName
      );
      if (project)
        setFormState((prev) => ({ ...prev, projectNameSelect: project }));
    }
  }, [rowData, projectData]);

  const { mutate: addSalesTarget, isPending: savingNew } = usePost(
    SALES_TARGET_CREATE,
    {
      onSuccess: (res) => {
        if (res.data.status === 1) {
          toast.success(res.data.message);
          goBack()
        }
        else {
          toast.error(res.data.message);
          return;
        }
      },
      onError: (err) => toast.error(err.message),
    }
  );

  // const { mutate: updateSalesTarget, isPending: savingUpdate } = usePost(
  //   UPDATE_SALES_TARGET_ENTRY_REPORT_NEW,
  //   {
  //     onSuccess: (res) => {
  //       if (res.data.status === 1) {
  //         toast.success(res.data.message);
  //         goBack()
  //       }
  //       else {
  //         toast.error(res.data.message);
  //         return;
  //       }
  //     },
  //     onError: (err) => toast.error(err.message),
  //   }
  // );

  const isLoadingAny = loadingMainTeams || loadingSalesGroup || loadingProject || savingNew || isPending;

  const goBack = () => navigate("/sales-target-report");

  const handleSave = () => {
    const { builderGroupSelect, projectNameSelect, fromdate, toDate, remarks, totalTarget, } = formState;
    if (
      !builderGroupSelect ||
      !projectNameSelect ||
      !fromdate ||
      !toDate ||
      !remarks ||
      totalTarget === 0 ||
      !selectedGroup?.value
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    const payload = {
      targetId: rowData?.targetId || 0,
      builderId: builderGroupSelect.value,
      projectId: projectNameSelect.value,
      targetType:
        formState.targetType === "turnover" ? "Turnover" : "Unit",
      createdBy: empCode,
      remarks,
      fromDate: fromdate,
      toDate,
      totalTarget: parseFloat(totalTarget) || 0,
      targetGroupId: selectedGroup?.label || 0,
    };
    addSalesTarget(payload);

    // rowData?.targetId
    //   ? updateSalesTarget(payload)
    //   : addSalesTarget(payload);
  };

  const fetchMembers = async (group) => {
    setIsPending(true)
    ApiClient.get(`${GET_MEMBERS_BY_ID}/${group.label}`)
      .then(function (response) {
        setIsPending(false)
        if (response?.data?.status === 1) {
          setModalOpen(true);
          setGroupMembers(response?.data?.data);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false)
        toast.error(error.message);
      });
  };

  return (
    <PageContent>
      <Breadcrumbs title="Target" breadcrumbItem="Sales Target Entry" />
      <Container fluid>
        {isLoadingAny && <ScreenLoader />}

        <Card>
          <CardBody>
            <Row className="g-3">
              <Col md={3}>
                <label className="font-size-11">Builder <RequiredStar /></label>
                <Select
                  isClearable
                  value={formState.builderGroupSelect}
                  onChange={(val) =>
                    setFormState((ps) => ({
                      ...ps,
                      builderGroupSelect: val,
                      projectNameSelect: null,
                    }))
                  }
                  options={Array.isArray(builderList?.data?.data) ? builderList?.data?.data : []}
                />
              </Col>

              <Col md={3}>
                <label className="font-size-11">Project Name <RequiredStar /></label>
                <Select
                  isDisabled={!formState.builderGroupSelect}
                  isClearable
                  value={formState.projectNameSelect}
                  onChange={(val) =>
                    setFormState((ps) => ({
                      ...ps,
                      projectNameSelect: val,
                    }))
                  }
                  options={Array.isArray(projectData?.data?.data) ? projectData?.data?.data : []}
                />
              </Col>

              <Col md={3}>
                <label className="font-size-11">From Date <RequiredStar /></label>
                <input
                  type="date"
                  className="form-control"
                  value={formState.fromdate}
                  onChange={(e) =>
                    setFormState((ps) => ({
                      ...ps,
                      fromdate: e.target.value,
                    }))
                  }
                />
              </Col>

              <Col md={3}>
                <label className="font-size-11">To Date <RequiredStar /></label>
                <input
                  type="date"
                  className="form-control"
                  value={formState.toDate}
                  onChange={(e) =>
                    setFormState((ps) => ({
                      ...ps,
                      toDate: e.target.value,
                    }))
                  }
                />
              </Col>


              <Col md={3}>
                <label className="font-size-11">Target Type <RequiredStar /></label>
                <Select
                  isClearable
                  value={{
                    label:
                      formState.targetType === "turnover"
                        ? "Turnover"
                        : "Unit",
                    value: formState.targetType,
                  }}
                  onChange={(opt) =>
                    setFormState((ps) => ({
                      ...ps,
                      targetType: opt?.value,
                    }))
                  }
                  options={[
                    { label: "Turnover", value: "turnover" },
                    { label: "Unit", value: "unit" },
                  ]}
                />
              </Col>
              <Col md={3}>
                <label className="font-size-11">Total Target <RequiredStar /></label>
                <input
                  type="number"
                  className="form-control"
                  value={formState.totalTarget}
                  onChange={(e) =>
                    setFormState((ps) => ({
                      ...ps,
                      totalTarget: e.target.value,
                    }))
                  }
                />
              </Col>

              <Col md={6}>
                <label className="font-size-11">Remarks <RequiredStar /></label>
                <textarea
                  className="form-control"
                  rows={1}
                  value={formState.remarks}
                  placeholder="Enter remarks"
                  onChange={(e) =>
                    setFormState((ps) => ({
                      ...ps,
                      remarks: e.target.value,
                    }))
                  }
                />
              </Col>

              <Row className="mt-2">
                <label className="font-size-11">Branch <RequiredStar /></label>
                {salesGroup?.data?.data?.map((g, idx) => {
                  const isSelected = selectedGroup?.label === g.label;

                  return (
                    <Col key={idx} xs={12} sm={6} md={4} lg={3} className="mb-3">
                      <div
                        className={`d-flex align-items-center p-2 rounded shadow-sm transition-all ${isSelected ? "bg-light border border-primary" : "bg-white border"}`}
                        style={{
                          cursor: "pointer",
                          minHeight: "20px",
                          boxShadow: isSelected ? "0 0 0 2px rgba(13, 110, 253, 0.2)" : "none",
                        }}
                        onClick={() => setSelectedGroup(isSelected ? null : g)}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input me-3"
                          checked={isSelected}
                          readOnly
                        />

                        <div className="flex-grow-1 mt-1">
                          <span className="fw-semibold text-dark">{g.value}</span>
                        </div>

                        <FaEye
                          className="ms-3 text-primary"
                          title="View members"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent selecting group when clicking eye icon
                            fetchMembers(g);
                          }}
                          style={{ fontSize: "1rem" }}
                        />
                      </div>
                    </Col>
                  );
                })}
              </Row>


              <Col className="d-flex gap-2 align-items-center">
                <Button
                  color="primary"
                  type="button"
                  onClick={handleSave}
                >
                  {rowData?.targetId ? "Update" : "Save"}
                </Button>
                <Button
                  color="secondary"
                  type="button"
                  onClick={goBack}
                >
                  <FiArrowLeft /> Back
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg" centered>
          <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
            👥 Team Members of <strong className="text-primary">{groupMembers?.name} ({groupMembers?.members?.length})</strong>
          </ModalHeader>

          <ModalBody style={{ maxHeight: "60vh", overflowY: "auto", paddingTop: '0.5rem' }}>
            {groupMembers?.members?.length > 0 ? (
              <>
                {/* 🔍 Search Bar */}
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Search by name or code..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />

                {/* 🧠 Filtered Table */}
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "10%" }}>#</th>
                        <th>Emp Name</th>
                        <th>Emp Code</th>
                        <th>MT/ST</th>
                        <th>Branch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupMembers?.members
                        ?.filter((m) =>
                          m.empName.toLowerCase().includes(searchText.toLowerCase()) ||
                          m.empCode.toLowerCase().includes(searchText.toLowerCase())
                        )
                        ?.map((m, index) => (
                          <tr key={m.id}>
                            <td>{index + 1}</td>
                            <td>{m.empName}</td>
                            <td>{m.empCode}</td>
                            <td>{m.mainTeam + '/' + m.subTeam}</td>
                            <td>{m.branch}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center text-muted py-4">
                <i className="bi bi-info-circle" style={{ fontSize: "2rem" }}></i>
                <p className="mt-2 mb-0">No members found for this group.</p>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => setModalOpen(false)}
              style={{ backgroundColor: defaultTheme.goldColorLogo }}
            >
              Close
            </Button>
          </ModalFooter>
        </Modal>

      </Container>
    </PageContent>
  );
}
