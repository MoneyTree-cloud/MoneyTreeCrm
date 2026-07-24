import { useEffect, useRef, useState } from "react";
import { Row, Col, Card, CardBody, Button, Container } from "reactstrap";
import { MdVideoLibrary } from "react-icons/md"; // Import the video icon
import { defaultTheme } from "../../helpers/defaultTheme";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import VideoModal from "../../components/Common/VideoModal";
import {
  CREATE_TESTIMONIAL,
  GET_ALL_TESTIMONIAL,
  STATUS_CHANGE_TESTIMONIAL
} from "../../helpers/url_helper";
import { useGet, usePost } from "../../Hooks/useApi";
import { toast } from "react-toastify";
import { imageBaseUrl } from "../../helpers/api_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { formatDate } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import Switch from "react-switch";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function ConnectTestimonial() {
  const userId = useUserStore((state) => state.user.userId);

  const videoInputRef = useRef(null);
  const [currentVideo, setCurrentVideo] = useState("");
  const [videoModalOpen, setVideoModalOpen] = useState(false); // State for video modal
  const [selectedId, setSelectedId] = useState(null);

  const toggleVideoModal = () => setVideoModalOpen(!videoModalOpen); // Function to toggle video modal

  const [formData, setFormData] = useState({
    file: null,
  });

  const [accessGranted, setAccessGranted] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'connect-testimonial');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);


  const {
    data: videosData,
    isLoading: isLoadingVideo,
    refetch: getAllVideos,
  } = useGet(GET_ALL_TESTIMONIAL, { enabled: Boolean(accessGranted) });

  const { isPending: isPendingDelete, mutate: mutateStatusChange } = usePost(
    STATUS_CHANGE_TESTIMONIAL + selectedId,
    {
      onSuccess: (response) => {
        setSelectedId('')
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getAllVideos();
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

  const { isPending: isPendingAdd, mutate: mutateAdd } = usePost(CREATE_TESTIMONIAL, {
    onSuccess: (response) => {
      if (response?.data?.status === 1) {
        toast.success(response.data.message);
        getAllVideos();
        handleReset();
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSwitchClick = (id) => {
    setSelectedId(id);
  };

  useEffect(() => {
    if (selectedId) {
      mutateStatusChange()
    }
  }, [selectedId, mutateStatusChange])


  const handleSave = () => {
    if (!formData.file) {
      toast.error("Please Choose Video To Upload");
    } else {
      const formDataApi = new FormData();
      formDataApi.append("file", formData.file);
      formDataApi.append("createdBy", userId);
      mutateAdd(formDataApi);
    }
  };

  const handleReset = () => {
    setFormData({
      file: null,
    });
    if (videoInputRef.current) {
      videoInputRef.current.value = ""; // Clear the file input
    }
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "10%",
    },
    {
      name: <span className="font-weight-bold fs-13">Date</span>,
      selector: (row) => formatDate(row.createdDate),
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Video</span>,
      cell: (row) => (
        <MdVideoLibrary
          size={25}
          onClick={() => {
            setCurrentVideo(imageBaseUrl + row.fileName); // Set the video source
            toggleVideoModal(); // Open video modal
          }}
          style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
        />
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      sortable: true,
      width: "10%",
      cell: (row) => (
        <Switch
          onChange={() => handleSwitchClick(row.id)}
          checked={row.active === true}
          offColor={defaultTheme.goldColorLogo}
          onColor={defaultTheme.primary}
          height={20}
          width={40}
        />
      ),
    },
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
        {(isPendingDelete || isLoadingVideo || isPendingAdd) && (
          <ScreenLoader />
        )}
        <Breadcrumbs title="Connect" breadcrumbItem="Testimonial" />
        <Row>
          <Col>
            <Card>
              <CardBody>
                <Row>
                  <Col md="8 mt-1">
                    <h6 className="font-size-11">Video File</h6>
                    <input
                      name="file"
                      type="file"
                      accept="video/*"
                      className="form-control"
                      onChange={handleChange}
                      ref={videoInputRef}
                    />
                  </Col>
                  <Col md="4 mt-4">
                    <div className="d-flex align-items-center">
                      <Button
                        type="submit"
                        color="primary"
                        className="me-3"
                        onClick={handleSave}
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
        {Array.isArray(videosData?.data?.data) &&
          videosData?.data?.data?.length > 0 && (
            <AppTable
              columns={columns}
              data={
                Array.isArray(videosData?.data?.data)
                  ? videosData?.data?.data
                  : []
              }
              pagination
            />
          )}
        <VideoModal
          isOpen={videoModalOpen}
          toggle={toggleVideoModal}
          videoSrc={currentVideo}
        />

      </Container>
    </PageContent>
  );
}
