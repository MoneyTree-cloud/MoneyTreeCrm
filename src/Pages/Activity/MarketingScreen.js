import { useRef, useState } from "react";
import { Row, Col, Card, CardBody, Button, Container } from "reactstrap";
import { MdDelete, MdVideoLibrary } from "react-icons/md"; // Import the video icon
import { defaultTheme } from "../../helpers/defaultTheme";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import VideoModal from "../../components/Common/VideoModal";
import { DELETE_IMAGE, GET_ALL_VIDEOS, UPLOAD_VIDEO } from "../../helpers/url_helper";
import { useGet, usePost } from "../../Hooks/useApi";
import { toast } from "react-toastify";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { formatDate } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";

export default function MarketingScreen() {
  const videoInputRef = useRef(null);
  const [currentVideo, setCurrentVideo] = useState("");
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleVideoModal = () => setVideoModalOpen(!videoModalOpen); // Function to toggle video modal

  const [formData, setFormData] = useState({
    file: null,
  });

  const { data: videosData, isLoading: isLoadingVideo, refetch: getAllVideos } = useGet(GET_ALL_VIDEOS);

  const { isPending: isPendingAdd, mutate: mutateAdd } = usePost(UPLOAD_VIDEO, {
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

  const handleDeleteClick = (id) => {
      const isConfirmed = window.confirm(
    "Are you sure you want to delete this item?"
  );

  if (!isConfirmed) {
    return;
  }
    setIsLoading(true);
    ApiClient.post(
      `${DELETE_IMAGE}${id}`
    )
      .then(function (response) {
        setIsLoading(false);
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getAllVideos();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsLoading(false);
        toast.error(error.message);
      });
  };


  const handleSave = () => {
    if (!formData.file) {
      toast.error("Please Choose Video To Upload");
    } else {
      const formDataApi = new FormData();
      formDataApi.append("video", formData.file);
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
      selector: (row) => formatDate(row.uploadDate),
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Video</span>,
      cell: (row) => (
        <MdVideoLibrary
          size={25}
          onClick={() => {
            setCurrentVideo(imageBaseUrl + row.filePath); // Set the video source
            toggleVideoModal(); // Open video modal
          }}
          style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
        />
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      cell: (row) => (
        <MdDelete
          onClick={() => handleDeleteClick(row.id)}
          style={{ cursor: "pointer", color: "red" }}
          size={20} // Adjust size as needed
        />
      ),
    },
  ];

  return (
    <PageContent>
      <Container fluid={true}>
        {(isLoading || isLoadingVideo || isPendingAdd) && (
          <ScreenLoader />
        )}
        <Breadcrumbs title="Marketing" breadcrumbItem="Add-Data" />
            <Card>
              <CardBody>
                <Row>
                  <Col md="4">
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
                  <Col md="4" className="d-flex align-items-end">
                      <Button
                        type="submit"
                        color="primary"
                        className="me-2"
                        onClick={handleSave}
                      >
                        Submit
                      </Button>
                      <Button
                        type="reset"
                        color="secondary"
                        onClick={handleReset}
                      >
                        Cancel
                      </Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          
        {Array.isArray(videosData?.data?.data) &&
          videosData?.data?.data?.length > 0 && (
            <AppTable
              columns={columns}
              progressPending={isLoadingVideo}
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
