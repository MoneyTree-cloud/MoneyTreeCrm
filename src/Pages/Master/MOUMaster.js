import { useEffect, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import { GET_ALL_MOU_MASTER, GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_, SAVE_MOU_MASTER, UPDATE_MOU_MASTER } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { useUserStore } from "../../store/useUserStore";
import { formatDate, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import Select from "react-select";
import { imageBaseUrl } from "../../helpers/api_helper";
import { FaEdit, FaEye } from "react-icons/fa";
import { defaultTheme } from "../../helpers/defaultTheme";
import { getFileIcon, scrollToTop } from "../../constants/global";
import DOMPurify from "dompurify";

export default function MOUMaster() {
  const { userId, empCode, userName } = useUserStore((state) => state.user);
  const fileInputRef = useRef(null);
  const [accessGranted, setAccessGranted] = useState(null);
  const [builder, setBuilder] = useState(null);
  const [project, setProject] = useState(null);
  const [mouStartDate, setMouStartDate] = useState("");
  const [mouEndDate, setMouEndDate] = useState("");
  const [mouDocs, setMouDocs] = useState([]);
  const [editId, setEditId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [remarks, setRemarks] = useState("")
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'mou-master');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_, { enabled: Boolean(accessGranted) });
  const { data: projectData } = useGet(`${GET_PROJECT_BY_BUILDER_}${builder?.value}`, { enabled: Boolean(builder?.value) });
  const { data: mouList, isLoading, refetch: getAllData } = useGet(`${GET_ALL_MOU_MASTER}`, { enabled: Boolean(accessGranted) });

  const toggleAttachmentModal = () => {
    setIsAttachmentModalOpen(!isAttachmentModalOpen);
  };

  // Auto set project after project list loads (for edit case)
  useEffect(() => {
    if (editProjectId && projectData?.data?.data) {
      const selectedProject = projectData.data.data.find(
        (item) => item.value === editProjectId
      );
      setProject(selectedProject || null);
      setEditProjectId(null);
    }
  }, [projectData, editProjectId]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, i) => i + 1,
      width: '8%'
    },
    {
      name: <span className="font-weight-bold fs-13">Manage</span>,
      width: '8%',
      cell: (row) => (
        <FaEdit
          style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
          onClick={() => handleEdit(row)}
          title="Manage MOU"
          size={20}
        />
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Builder</span>,
      selector: (row) => row.builderName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Project</span>,
      selector: (row) => row.projectName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">MOU Start Date</span>,
      selector: (row) => row.agreementStartDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDate(row.agreementStartDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">MOU End Date</span>,
      selector: (row) => row.agreementEndDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDate(row.agreementEndDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Docs</span>,
      width: '9%',
      cell: (row) => {
        const files = row?.attachments || [];
        return files?.length > 0 ? (
          <button
            onClick={() => {
              setSelectedAttachments(row);
              setIsAttachmentModalOpen(true);
            }}
            style={{
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "12px",
              backgroundColor: "#f5f5f5",
              color: defaultTheme.goldColorLogo,
              border: `1px solid ${defaultTheme.goldColorLogo}`,
              cursor: "pointer",
            }}
          >
            <FaEye /> ({files.length})
          </button>
        ) : (
          <span style={{ color: "#999" }}>-</span>
        );
      },
    },
    {
      name: <span className="font-weight-bold fs-13">Created At</span>,
      selector: (row) => row.createdAt,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDate(row.createdAt)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Created By</span>,
      selector: (row) => row.createdBy,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.createdBy}</WordWrapCell>
    },
  ];

  const handleEdit = (row) => {
    scrollToTop()
    setIsEdit(true);
    setEditId(row?.id);

    const selectedBuilder = builderList?.data?.data?.find(
      (item) => item.value === row.builderId
    );

    setBuilder(selectedBuilder || null);
    setEditProjectId(row?.projectId);

    setMouStartDate(row?.agreementStartDate);
    setMouEndDate(row?.agreementEndDate);
    setRemarks(row?.remarks)
    setMouDocs([])
  };

  const handleButtonClick = (e) => {
    e.preventDefault();

    if (!builder) return toast.error("Please Select Builder");
    if (!project) return toast.error("Please Select Project");
    if (!mouStartDate) return toast.error("Please Enter MOU Start Date");
    if (!mouEndDate) return toast.error("Please Enter MOU End Date");

    const payload = new FormData();
    if (editId) {
      payload.append("id", editId);
    }
    payload.append("createdBy", userName + ' (' + empCode + ')');
    payload.append("builderId", builder?.value);
    payload.append("projectId", project?.value);
    payload.append("startDate", mouStartDate);
    payload.append("endDate", mouEndDate);
    if (remarks) {
      payload.append("remarks", remarks);
    }
    if (mouDocs?.length > 0) {
      Array.from(mouDocs)?.forEach((file) => {
        payload.append("files", file);
      });
    }
    if (isEdit) {
      updateMOU(payload);
    } else {
      addMou(payload);
    }
  };

  const { isPending: addLoading, mutate: addMou } = usePost(SAVE_MOU_MASTER, {
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
      toast.error(err.message);
    },
  });

  const { isPending: updateLoading, mutate: updateMOU } = usePost(UPDATE_MOU_MASTER, {
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
      toast.error(err.message);
    },
  });

  const handleClear = () => {
    setBuilder(null);
    setProject(null);
    setMouStartDate("");
    setMouEndDate("");
    setIsEdit(false);
    setEditId(null);
    setEditProjectId(null);
    setMouDocs([]); // clear files
    setRemarks("")
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    setMouDocs((prev) => [...prev, ...newFiles]);

    // reset input so same file can be selected again
    e.target.value = null;
  };

  const removeFile = (index) => {
    setMouDocs((prev) => prev.filter((_, i) => i !== index));
  };

  if (accessGranted === null) return <ScreenLoader />;
  if (!accessGranted) return <PermissionMissing />;

  return (
    <PageContent>
      {(isLoading || addLoading || updateLoading) && <ScreenLoader />}
      <Breadcrumbs title="Master" breadcrumbItem="MOU" />
      <Container fluid={true}>
        <form onSubmit={handleButtonClick}>
          <Card>
            <CardBody>
              <Row className="g-3">
                <Col md="3">
                  <h6 className="font-size-11">Builder <RequiredStar /></h6>
                  <Select
                    value={builder}
                    onChange={setBuilder}
                    options={builderList?.data?.data || []}
                    isClearable
                    menuPortalTarget={document.body}
                  />
                </Col>
                <Col md="3">
                  <h6 className="font-size-11">Project <RequiredStar /></h6>
                  <Select
                    value={project}
                    onChange={setProject}
                    options={projectData?.data?.data || []}
                    isClearable
                    isDisabled={!builder}
                    menuPortalTarget={document.body}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">MOU Start date <RequiredStar /></h6>
                  <input
                    className="form-control"
                    type="date"
                    value={mouStartDate}
                    onChange={(e) => setMouStartDate(e.target.value)}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">MOU End date <RequiredStar /></h6>
                  <input
                    className="form-control"
                    type="date"
                    value={mouEndDate}
                    onChange={(e) => setMouEndDate(e.target.value)}
                  />
                </Col>

                <Col lg="3">
                  <h6 className="font-size-11">MOU Docs</h6>

                  {/* Hidden input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />

                  {/* Main upload container */}
                  <div
                    style={{
                      border: "1px dashed #0b0b0b",
                      borderRadius: "12px",
                      padding: "10px",
                      background: "#fafafa",
                      minHeight: "80px",
                    }}
                  >
                    {/* Attach button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      style={{
                        background: defaultTheme.primary,
                        color: "#fff",
                        border: "none",
                        borderRadius: "20px",
                        padding: "6px 14px",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                        marginBottom: "8px",
                      }}
                    >
                      + Attach Files {mouDocs?.length > 0 && `(${mouDocs?.length})`}
                    </button>

                    {/* File chips */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        maxHeight: "70px",
                        overflowY: "auto",
                      }}
                    >
                      {mouDocs?.map((file, index) => (
                        <div
                          key={index}
                          style={{
                            background: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "20px",
                            padding: "5px 10px",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                          }}
                        >
                          {/* File icon */}
                          <span style={{ fontSize: "14px" }}>📄</span>

                          {/* File name */}
                          <span
                            style={{
                              maxWidth: "120px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={file.name}
                          >
                            {file.name}
                          </span>

                          {/* Remove button */}
                          <span
                            style={{
                              cursor: "pointer",
                              color: "#dc3545",
                              fontWeight: "bold",
                              marginLeft: "4px",
                            }}
                            onClick={() => removeFile(index)}
                          >
                            ×
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Col>

                <Col lg="6">
                  <h6 className="font-size-11">Remarks</h6>
                  <textarea
                    name="remarks"
                    className="form-control"
                    rows="3"
                    placeholder="Enter Remarks Here..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  >
                  </textarea>

                </Col>

                <Col md="2" className="d-flex align-items-center">
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {isEdit ? "Update" : "Save"}
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
          data={Array.isArray(mouList?.data?.data) ? mouList?.data?.data : []}
          pagination
        />

        <Modal isOpen={isAttachmentModalOpen} toggle={toggleAttachmentModal} size="lg">
          <ModalHeader toggle={toggleAttachmentModal}>
            <div>
              <strong>Remarks :</strong>
              <div
                style={{ fontSize: 13, fontWeight: "normal" }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    selectedAttachments?.remarks?.replace(/\r?\n/g, "<br/>")
                  ),
                }}
              />
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAttachments?.attachments?.map((file, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{getFileIcon(file)}</td>
                      <td>
                        <a
                          href={`${imageBaseUrl}${file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModalBody>
        </Modal>
      </Container>
    </PageContent>
  );
}
