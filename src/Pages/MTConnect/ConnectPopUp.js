import { useEffect, useRef, useState } from "react";
import { Row, Col, Card, CardBody, Button, Container } from "reactstrap";
import { defaultTheme } from "../../helpers/defaultTheme";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  ADD_POPUP_DATA_CONNECT,
  CHANGE_STATUS_POPUP_FROM_LIST_CONNECT,
  POPUP_LIST_CONNECT,
} from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import { useGet, usePost } from "../../Hooks/useApi";
import AppTable from "../../components/Common/Table";
import { formatDate, RequiredStar } from "../../helpers/function_helper";
import { imageBaseUrl } from "../../helpers/api_helper";
import ImageModal from "../../components/Common/ImageModal";
import VideoModal from "../../components/Common/VideoModal";
import { FaVideo } from "react-icons/fa";
import Select from "react-select";
import PageContent from "../../components/Common/PageContent";
import Switch from "react-switch";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

const ConnectPopUp = () => {
  const fileInputRef = useRef(null);
  const userId = useUserStore((state) => state.user.userId);
  const [currentImage, setCurrentImage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [popupType, setPopupType] = useState(null);
  const toggleModal = () => setModalOpen(!modalOpen);
  const [currentVideo, setCurrentVideo] = useState("");
  const [videoModalOpen, setVideoModalOpen] = useState(false); // State for video modal
  const toggleVideoModal = () => setVideoModalOpen(!videoModalOpen); // Function to toggle video modal
  const [accessGranted, setAccessGranted] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'connect-pop-up');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  const {
    data: popupList,
    isLoading,
    refetch: getAllPopups,
  } = useGet(POPUP_LIST_CONNECT, { enabled: Boolean(accessGranted) });

  const [formData, setFormData] = useState({
    files: null,
    fromDate: "",
    toDate: "",
  });

  // Handle change in form fields
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "files") {
      const filesArray = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        [name]: filesArray, // Store all selected files
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const { isPending: isPendingAdd, mutate: mutateAdd } = usePost(
    ADD_POPUP_DATA_CONNECT,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          handleReset();
          getAllPopups();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const { isPending: isPendingDelete, mutate: mutateDelete } = usePost(
    CHANGE_STATUS_POPUP_FROM_LIST_CONNECT + selectedId,
    {
      onSuccess: (response) => {
        setSelectedId('')
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getAllPopups();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        setSelectedId('')
        toast.error(err.message);
      },
    }
  );

  const handleSave = () => {
    if (!formData.fromDate) {
      toast.error("Please Enter Start Date");
    } else if (!formData.toDate) {
      toast.error("Please Enter End Date");
    } else if (!popupType) {
      toast.error("Please Select Popup Type");
    } else if (!formData.files) {
      toast.error("Please Choose File To Upload");
    } else {
      const formDataApi = new FormData();
      formDataApi.append("fromDate", formData?.fromDate);
      formDataApi.append("toDate", formData?.toDate);
      formDataApi.append("createdBy", userId);
      formDataApi.append("type", popupType?.value);
      for (let i = 0; i < formData.files.length; i++) {
        formDataApi.append("popup", formData.files[i], formData.files[i].name);
      }
      mutateAdd(formDataApi);
    }
  };

  const getFileType = (filePath) => {
    const extension = filePath?.split(".").pop()?.toLowerCase();
    if (!extension) return "unknown";

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) return "image";
    if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension)) return "video";

    return "unknown";
  };

  const handleReset = () => {
    setFormData({
      files: null,
      fromDate: "",
      toDate: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    setPopupType(null);
  };

  const handleDeleteClick = (id) => {
    setSelectedId(id);
  };

  useEffect(() => {
    if (selectedId) {
      mutateDelete()
    }
  }, [selectedId, mutateDelete])

  const handleViewFile = (fileName) => {
    const fileExtension = fileName.split(".").pop().toLowerCase();
    const fileUrl = imageBaseUrl + fileName;

    if (fileExtension === "mp4") {
      setCurrentVideo(fileUrl); // Set the video source
      toggleVideoModal();
    } else {
      // Set the image source and open modal for images
      setCurrentImage(fileUrl);
      toggleModal();
    }
  };

  const profileStyle = {
    width: "35px",
    height: "35px",
    objectFit: "cover",
    cursor: "pointer",
    borderRadius: "50%",
    border: "2px solid",
    borderColor: defaultTheme.goldColorLogo,
    padding: "2px",
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">From Date</span>,
      selector: (row) => row.fromDate,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {formatDate(row.fromDate)}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">To Date</span>,
      selector: (row) => row.toDate,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {formatDate(row.toDate)}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Type</span>,
      selector: (row) => row.type,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.type}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">File</span>,
      selector: (row) => {
        const fileType = getFileType(row.popupPath);

        if (fileType === "image") {
          return (
            <img
              src={imageBaseUrl + row.popupPath}
              alt="Preview"
              style={profileStyle}
              onClick={() => handleViewFile(row.popupPath)}
            />
          );
        }

        if (fileType === "video") {
          return (
            <FaVideo
              size={25}
              className="text-success"
              onClick={() => handleViewFile(row.popupPath)}
              style={{ cursor: "pointer" }}
            />
          );
        }

        return <span>Unknown file</span>;
      },
      sortable: true,
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
          onChange={() => handleDeleteClick(row.id)}
        />
      ),
    },
  ];

  const handlePopUpChange = (selectedOption) => {
    setPopupType(selectedOption); // Update the state with the selected option
  };

  const popupGroup = [
    { label: "Image", value: "image" },
    { label: "Video", value: "video" },
  ];

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Container fluid={true}>
        {(isPendingAdd || isLoading || isPendingDelete) && <ScreenLoader />}
        <Breadcrumbs title="Connect" breadcrumbItem="Pop-up" />
        <Row>
          <Col>
            <Card>
              <CardBody>
                <Row>
                  <Col md="3">
                    <h6 className="font-size-11">
                      Start Date <RequiredStar />
                    </h6>
                    <input
                      type="date"
                      className={`form-control`}
                      name="fromDate"
                      value={formData.fromDate}
                      onChange={handleInputChange}
                    />
                  </Col>

                  <Col md="3">
                    <h6 className="font-size-11">
                      End Date <RequiredStar />
                    </h6>
                    <input
                      type="date"
                      className={`form-control`}
                      name="toDate"
                      value={formData.toDate}
                      onChange={handleInputChange}
                    />
                  </Col>

                  <Col md="3">
                    <h6 className="font-size-11">
                      Type <RequiredStar />
                    </h6>

                    <Select
                      style={{ zIndex: 9999 }}
                      menuPortalTarget={document.body}
                      isClearable
                      value={popupType}
                      onChange={handlePopUpChange}
                      options={popupGroup}
                    />
                  </Col>

                  <Col md="3">
                    <h6 className="font-size-11">
                      File <RequiredStar />
                    </h6>
                    <input
                      name="files"
                      type="file"
                      className="form-control"
                      accept="image/*,video/*"
                      onChange={handleChange}
                      multiple
                      ref={fileInputRef}
                    />
                    <h6
                      className="font-size-10 mt-1"
                      style={{ color: defaultTheme.redColor }}
                    >
                      Upload only Images, and Videos
                    </h6>
                  </Col>

                  <Col md="4">
                    <div className="d-flex align-items-center">
                      <Button
                        onClick={handleSave}
                        type="submit"
                        color="primary"
                        className="me-2"
                      >
                        Submit
                      </Button>{" "}
                      <Button
                        type="reset"
                        style={{
                          backgroundColor: defaultTheme.goldColorLogo,
                        }}
                        onClick={handleReset}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      {Array.isArray(popupList?.data?.data) &&
        popupList?.data?.data.length > 0 && (
          <AppTable
            progressPending={isLoading}
            columns={columns}
            data={
              Array.isArray(popupList?.data?.data)
                ? popupList?.data?.data
                : []
            }
            pagination

          />
        )}

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
    </PageContent>
  );
};

export default ConnectPopUp;
