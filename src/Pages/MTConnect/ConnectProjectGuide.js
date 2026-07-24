/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import Switch from "react-switch";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet, usePost } from "../../Hooks/useApi";
import {
  GET_ALL_CONNECT_DOCS,
  STATUS_CHANGE_CONNECT_DOCS,
  UPLOAD_CONNECT_DOCS,
} from "../../helpers/url_helper";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import { imageBaseUrl } from "../../helpers/api_helper";
import ImageModal from "../../components/Common/ImageModal";
import { FaFilePdf } from "react-icons/fa";
import VideoModal from "../../components/Common/VideoModal";
import PageContent from "../../components/Common/PageContent";
import { formatDate, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function ConnectProjectGuide() {
  const fileInputRef = useRef(null); // Create a ref for the file input
  const initialFormState = {
    file: null,
    remarks: "",
  };
  const userId = useUserStore((state) => state.user.userId);
  const [formState, setFormState] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [mapId, setMapId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState("");
  const [projectMapData, setProjectMapData] = useState([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false); // State for video modal
  const toggleVideoModal = () => setVideoModalOpen(!videoModalOpen); // Function to toggle video modal

  const [currentImage, setCurrentImage] = useState("");
  const [accessGranted, setAccessGranted] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'connect-project-guide');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);


  const { isPending: addLoading, mutate } = usePost(
    UPLOAD_CONNECT_DOCS,
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


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file.type === 'application/pdf') {
      setFormState((prevState) => ({
        ...prevState,
        file: file,
      }));
      setErrors((prevErrors) => ({ ...prevErrors, file: null }));
    }
    else {
      toast.error('Only PDF files are allowed!');
    }
  };

  const {
    data,
    refetch: getAllData,
    isLoading,
  } = useGet(`${GET_ALL_CONNECT_DOCS}`, { enabled: Boolean(accessGranted) });

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

  const { isPending: addLoadingPut, mutate: mutatePost } = usePost(
    `${STATUS_CHANGE_CONNECT_DOCS}${mapId}`,
    {
      onSuccess: (response) => {
        setMapId("");
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          getAllData();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
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
      formData.append("createdBy ", userId);
      formData.append("file", formState.file);
      formData.append("remarks ", formState.remarks);
      mutate(formData);
    } else {
      toast.error("Please Fill In All Required Fields.");
    }
  };

  const handleSwitchChange = (row) => {
    setMapId(row.id);
  };

  useEffect(() => {
    if (mapId) {
      mutatePost();
    }
  }, [mapId, mutatePost]);

  const toggleModal = () => setModalOpen(!modalOpen);

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


  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No</span>,
      width: "4%",
      cell: (_, index) => <WordWrapCell>{index + 1}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Date Time</span>,
      sortable: true,
      width: "15%",
      selector: (row) => row.createdDate,
      cell: (row) => <WordWrapCell>{formatDate(row.createdDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      sortable: true,
      width: "30%",
      selector: (row) => row.remarks,
      cell: (row) => <WordWrapCell>{row.remarks}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">File</span>,
      selector: (row) => (
        <div>
          <FaFilePdf
            size={20} // Adjust the size as needed
            onClick={() => handleViewFile(row.docPath)} // Function to handle file viewing
            style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }} // Styling for the icon
          />
        </div>
      ),
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
          onChange={() => handleSwitchChange(row)}
        />
      ),
    }
  ];

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs
        title="Connect"
        breadcrumbItem="Project Guide"
      />
      {(addLoading || addLoadingPut || isLoading) && <ScreenLoader />}
      <Container fluid={true}>
        <Card>
          <CardBody>
            <Row>
              <Col md="4">
                <h6 className="font-size-12 mt-3">
                  Document Upload <RequiredStar />
                </h6>
                <input
                  type="file"
                  className="form-control"
                  ref={fileInputRef}
                  accept=".pdf"
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
                  Upload only PDF (Max Size : 100 Mb)
                </h6>
              </Col>

              <Col md="8">
                <h6 className="font-size-12 mt-3">
                  Remarks <RequiredStar />
                </h6>
                <textarea
                  name="remarks"
                  required
                  className="form-control"
                  rows="5"
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
            </Row>

            <Row className="justify-content-center mt-4">
              <Col md="auto">
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-secondary ms-3"
                    type="button"
                    onClick={handleClear}
                  >
                    Cancel
                  </button>
                </div>
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
          data={
            Array.isArray(projectMapData)
              ? projectMapData
              : []
          }
          pagination
        />
      </Container>
    </PageContent>
  );
}
