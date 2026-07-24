/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import Switch from "react-switch";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet, usePost, usePut } from "../../Hooks/useApi";
import {
  CHANGE_PROJECT_DOCUMENTATION_STATUS,
  GET_ALL_PROJECT_DOCUMENTATION_DATA,
  GET_DROPDOWN_BUILDER_,
  GET_PROJECT_BY_BUILDER_,
  SAVE_PROJECT_DOCUMENTATION_DATA,
} from "../../helpers/url_helper";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import { imageBaseUrl } from "../../helpers/api_helper";
import ImageModal from "../../components/Common/ImageModal";
import { FaFilePdf } from "react-icons/fa";
import VideoModal from "../../components/Common/VideoModal";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import { USER_TYPE } from "../../constants/global";
import { RequiredStar, WordWrapCell } from "../../helpers/function_helper";

export default function ProjectDocumentation() {
  const role = useUserStore((state) => state.user.role);
  const fileInputRef = useRef(null); // Create a ref for the file input
  const initialFormState = {
    builderGroupSelect: null,
    projectNameSelect: null,
    searchByGroupSelect: null,
    file: null,
    remarks: "",
  };
  const userId = useUserStore((state) => state.user.userId);
  const LIMIT = 100;
  const [flag, setFlag] = useState(false);
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [filterQueryParam, setFilterQueryParam] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSelect, setSearchSelect] = useState(null);
  const [rowStatus, setRowStatus] = useState("");
  const [mapId, setMapId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState("");
  const [projectMapData, setProjectMapData] = useState([])
  const [videoModalOpen, setVideoModalOpen] = useState(false); // State for video modal
  const toggleVideoModal = () => setVideoModalOpen(!videoModalOpen); // Function to toggle video modal

  const [currentImage, setCurrentImage] = useState("");
  const [accessGranted, setAccessGranted] = useState(null);
  const toggleModal = () => setModalOpen(!modalOpen);

  const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_, { enabled: !!accessGranted });
  const { data: projectData } = useGet(
    formState?.builderGroupSelect
      ? `${GET_PROJECT_BY_BUILDER_}${formState?.builderGroupSelect?.value}`
      : null,
    { enabled: !!formState?.builderGroupSelect }
  );

  const { isPending: addLoading, mutate } = usePost(
    SAVE_PROJECT_DOCUMENTATION_DATA,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          handleClear();
          getAllData();
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handleBuilderTypeSelectGroup = (selectedGroup) => {
    setFormState((prevState) => ({
      ...prevState,
      builderGroupSelect: selectedGroup,
      projectNameSelect: null,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, builderGroupSelect: null }));
  };

  const handleProjectNameSelectGroup = (selectedProject) => {
    setFormState((prevState) => ({
      ...prevState,
      projectNameSelect: selectedProject,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, projectNameSelect: null }));
  };

  const handleSearchByTypeSelectGroup = (selectedGroup) => {
    setFormState((prevState) => ({
      ...prevState,
      searchByGroupSelect: selectedGroup,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, searchByGroupSelect: null }));
  };

  const handleSearchByTypeSelectListGroup = (selectedOption) => {
    setSearchSelect(selectedOption); // Update searchSelect
    setErrors((prevErrors) => ({ ...prevErrors, searchByGroupSelect: null })); // Clear any errors
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormState((prevState) => ({
      ...prevState,
      file: file,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, file: null }));
  };

  const {
    data,
    refetch: getAllData,
    isLoading,
  } = useGet(
    `${GET_ALL_PROJECT_DOCUMENTATION_DATA}?page=${page - 1}&size=${LIMIT}${filterQueryParam ?? ""
    }`,
    { enabled: !!page && !!accessGranted }
  );

  useEffect(() => {
    if (data?.data?.status === 1) {
      decryptData(data?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setProjectMapData(decryptedData);
        } else {
          setProjectMapData([])
        }
      });
    }
  }, [data]);


  const { isPending: addLoadingPut, mutate: mutatePut } = usePut(
    `${CHANGE_PROJECT_DOCUMENTATION_STATUS}${rowStatus}&mappingId=${mapId}`,
    {
      onSuccess: (response) => {
        setRowStatus("");
        setMapId("");
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          getAllData();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        setRowStatus("");
        setMapId("");
        toast.error(err.message);
      },
    }
  );

  const handleRemarksChange = (e) => {
    const remarks = e.target.value;
    setFormState((prevState) => ({
      ...prevState,
      remarks: remarks,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, remarks: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formState.builderGroupSelect)
      newErrors.builderGroupSelect = "Builder is required.";
    if (!formState.projectNameSelect)
      newErrors.projectNameSelect = "Project name is required.";
    if (!formState.searchByGroupSelect)
      newErrors.searchByGroupSelect = "Document type is required.";
    if (!formState.file) newErrors.file = "Document upload is required.";
    if (!formState.remarks) newErrors.remarks = "Remarks are required.";
    return newErrors;
  };

  const handleClear = () => {
    setFormState(initialFormState);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
  };

  const handleSave = () => {
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("builderName", formState.builderGroupSelect?.label);
      formData.append("projectName", formState.projectNameSelect?.label);
      formData.append("projectId", formState.projectNameSelect?.value);
      formData.append("builderId", formState.builderGroupSelect?.value);
      formData.append("fileType", formState.searchByGroupSelect?.value);
      formData.append("Attachment1", formState.file);
      formData.append("remark", formState.remarks);
      formData.append("active", "YES");
      mutate(formData);
    } else {
      toast.error("Please Fill In All Required Fields.");
    }
  };

  const handleSwitchChange = (row) => {
    const newStatus = row.isActive === "YES" ? "NO" : "YES";
    setMapId(row.mappingId);
    setRowStatus(newStatus);
  };

  useEffect(() => {
    if (rowStatus && mapId) {
      mutatePut();
    }
  }, [mapId, mutatePut, rowStatus]);


  const handleViewFile = (fileName) => {
    const fileExtension = fileName.split(".").pop().toLowerCase();
    const fileUrl = imageBaseUrl + fileName;

    if (fileExtension === "pdf" || fileExtension === "pptx") {
      // Open PDF in a new window
      window.open(fileUrl, "_blank");
    } else if (fileExtension === "mp4") {
      setCurrentVideo(fileUrl); // Set the video source
      toggleVideoModal();
    } else {
      // Set the image source and open modal for images
      setCurrentImage(fileUrl);
      toggleModal();
    }
  };

  useEffect(() => {
    if (flag) {
      handlePaginationData();
    }
  }, [page]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No</span>,
      width: "6%",
      cell: (_,index) => <WordWrapCell>{index+1}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Date Time</span>,
      sortable: true,
      width: "15%",
      selector: (row) => row.createdDate,
      cell: (row) => <WordWrapCell>{row.createdDate}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name</span>,
      sortable: true,
      width: "15%",
      selector: (row) => row.builderName,
      cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      sortable: true,
      width: "15%",
      selector: (row) => row.projectName,
      cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Document Type</span>,
      sortable: true,
      selector: (row) => row.docName,
      cell: (row) => <WordWrapCell>{row.docName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      sortable: true,
      width: "30%",
      selector: (row) => row.remark,
      cell: (row) => <WordWrapCell>{row.remark}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">File</span>,
      selector: (row) => (
        <div>
          <FaFilePdf
            size={20}
            onClick={() => handleViewFile(row.fileDetails.filePath)}
            style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
          />
        </div>
      ),
    },
    ...(role !== "ASSOCIATE"
      ? [
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
      ]
      : []),
  ];

  const handleClearSearchData = () => {
    setSearchTerm("");
    setSearchSelect(null);
    setFilterQueryParam(null);
  };

  const handleShowData = () => {
    if (!searchSelect) {
      toast.error("Please Select Search Field");
    } else if (!searchTerm) {
      toast.error("Please Input Value For Search");
    } else {
      setPage(1);
      setFilterQueryParam(
        `&key=${searchSelect ? searchSelect?.value : ""}&value=${searchTerm}`
      );
    }
  };

  const handlePaginationData = () => {
    setFilterQueryParam(
      `&key=${searchSelect ? searchSelect?.value : ""}&value=${searchTerm}`
    );
  };

  const projectDocumentGroupList = [
    { label: "Bank Proof", value: "bankProof" },
    { label: "Builder PPT", value: "builderPresentation" },
    { label: "Payment Plan", value: "paymentPolicy" },
    { label: "Project PPT", value: "projectPresentation" },
    { label: "Project Video", value: "projectVideo" }
  ]

  useEffect(() => {
    const checkAccess = async () => {
      if (role !== USER_TYPE.ASSOCIATE) {
        const hasAccess = await CheckUserAccess(userId, 'project-documentation');
        setAccessGranted(hasAccess);
      }
      else {
        setAccessGranted(true)
      }
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
      <Breadcrumbs
        title="Documentation"
        breadcrumbItem="Project Documentation"
      />
      {(addLoading || addLoadingPut || isLoading) && <ScreenLoader />}
      <Container fluid={true}>
        {role !== "ASSOCIATE" && (
          <form>
            <Card>
              <CardBody>
                <Row className="g-3">
                  <Col md="4">
                    <h6 className="font-size-11">
                      Select Builder <RequiredStar/>
                    </h6>
                    <Select
                      style={{ zIndex: 9999 }}
                      menuPortalTarget={document.body}
                      value={formState.builderGroupSelect}
                      onChange={handleBuilderTypeSelectGroup}
                      isClearable
                      options={
                        Array.isArray(builderList?.data?.data)
                          ? builderList?.data?.data
                          : []
                      }
                    />
                    {errors.builderGroupSelect && (
                      <div className="text-danger font-size-11">
                        {errors.builderGroupSelect}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="font-size-11">
                      Project Name <RequiredStar/>
                    </h6>
                    <Select
                      style={{ zIndex: 9999 }}
                      menuPortalTarget={document.body}
                      isClearable
                      isDisabled={!formState.builderGroupSelect}
                      value={formState.projectNameSelect}
                      onChange={handleProjectNameSelectGroup}
                      options={
                        Array.isArray(projectData?.data?.data)
                          ? projectData?.data?.data
                          : []
                      }
                    />
                    {errors.projectNameSelect && (
                      <div className="text-danger font-size-11">
                        {errors.projectNameSelect}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <h6 className="font-size-11">
                      Document Type <RequiredStar/>
                    </h6>
                    <Select
                      isClearable
                      value={formState.searchByGroupSelect}
                      onChange={handleSearchByTypeSelectGroup}
                      options={projectDocumentGroupList}
                    />
                    {errors.searchByGroupSelect && (
                      <div className="text-danger font-size-11">
                        {errors.searchByGroupSelect}
                      </div>
                    )}
                  </Col>
              
                  <Col md="4">
                    <h6 className="font-size-12">
                      Document Upload <RequiredStar/>
                    </h6>
                    <input
                      type="file"
                      className="form-control"
                      ref={fileInputRef}
                      accept=".pdf, .ppt, .pptx, image/*, video/*"
                      onChange={handleFileChange}
                    />
                    {errors.file && (
                      <div className="text-danger font-size-11">
                        {errors.file}
                      </div>
                    )}
                    <h6
                      className="font-size-10 mt-2"
                      style={{ color: defaultTheme.redColor }}
                    >
                      Upload only PDF, PPT, PPTX, Images, and Videos
                    </h6>
                    <h6
                      className="font-size-10 mt-2"
                      style={{ color: defaultTheme.redColor }}
                    >
                      Max Size : 100 Mb
                    </h6>
                  </Col>

                  <Col md="4">
                    <h6 className="font-size-12">
                      Remarks <RequiredStar/>
                    </h6>
                    <textarea
                      name="remarks"
                      required
                      className="form-control"
                      rows="4"
                      placeholder="Type here..."
                      value={formState.remarks}
                      onChange={handleRemarksChange}
                    ></textarea>
                    {errors.remarks && (
                      <div className="text-danger font-size-11">
                        {errors.remarks}
                      </div>
                    )}
                  </Col>

                  <Col md="4" className="d-flex align-items-center">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={handleSave}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-secondary ms-2"
                        type="button"
                        onClick={handleClear}
                      >
                        Cancel
                      </button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </form>
        )}
        <Card>
          <CardBody>
            <Row className="g-3">
              <Col lg="4">
                <h6 className="font-size-11">Search By</h6>
                <Select
                  style={{ zIndex: 9999 }}
                  menuPortalTarget={document.body}
                  isClearable
                  value={searchSelect}
                  onChange={handleSearchByTypeSelectListGroup}
                  options={[
                    {
                      label: "Search By",
                      options: [
                        { label: "Project Name", value: "projectName" },
                        { label: "Builder Name", value: "builderName" },
                      ],
                    },
                  ]}
                />
              </Col>
              <Col lg="4">
                <h6 className="font-size-11">Search</h6>
                <input
                  className="form-control"
                  placeholder="Type to search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>

              <Col lg="4" className="d-flex align-items-end">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleShowData}
                  >
                    Show Data
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={handleClearSearchData}
                  >
                    Clear
                  </button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <ImageModal
          isOpen={modalOpen}
          toggle={toggleModal}
          imageSrc={currentImage}
        />

        <VideoModal
          isOpen={videoModalOpen}
          toggle={toggleVideoModal}
          videoSrc={currentVideo}
        />
        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={projectMapData?.content || []}
          pagination
          paginationTotalRows={projectMapData?.totalElements}
          paginationServer
          onChangePage={(newPage) => {
            setPage(newPage);
            setFlag(true);
          }}

        />
      </Container>
    </PageContent>
  );
}
