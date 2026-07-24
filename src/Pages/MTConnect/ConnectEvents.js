import React, { useEffect, useRef, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Container,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { defaultTheme } from "../../helpers/defaultTheme";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import ImageModal from "../../components/Common/ImageModal";
import { MdDelete } from "react-icons/md";
import { useGet, usePost } from "../../Hooks/useApi";
import {
  DELETE_CONNECT_EVENT_IMAGE,
  CONNECT_EVENT_IMAGE_UPLOAD,
  CONNECT_EVENT_GET_ALL
} from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { imageBaseUrl } from "../../helpers/api_helper";
import { formatDate } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

const ConnectEvents = () => {
  const empCode = useUserStore((state) => state.user.empCode);
  const fileInputRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'connect-events');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);


  const [formData, setFormData] = useState({
    files: null
  });

  const {
    data: eventData,
    isLoading: isLoadingEvents,
    refetch: getAllEvents,
  } = useGet(CONNECT_EVENT_GET_ALL, { enabled: Boolean(accessGranted) });

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setIsModalOpen(false);
    mutateDelete();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "files") {
      const filesArray = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        [name]: filesArray,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const { isPending: isPendingDelete, mutate: mutateDelete } = usePost(
    DELETE_CONNECT_EVENT_IMAGE + selectedId,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getAllEvents();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const { isPending: isPendingAdd, mutate: mutateAdd } = usePost(
    CONNECT_EVENT_IMAGE_UPLOAD,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getAllEvents();
          handleReset();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const profileStyle = {
    width: "35px",
    height: "35px",
    objectFit: "fill",
    cursor: "pointer",
    borderRadius: "50%",
    border: "2px solid",
    borderColor: defaultTheme.goldColorLogo,
    padding: "2px",
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (row, index) => index + 1,
      sortable: true,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Date</span>,
      selector: (row) => formatDate(row.createdDate),
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {formatDate(row.createdDate)}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">File</span>,
      sortable: true,
      cell: (row) =>
        row.fileName ? (
          <img
            src={imageBaseUrl + row.fileName}
            alt="File"
            style={profileStyle}
            onClick={() => handleViewFile(row.fileName)}
          />
        ) : null,
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      sortable: true,
      cell: (row) => (
        <MdDelete
          onClick={() => handleDeleteClick(row.id)}
          style={{ cursor: "pointer", color: "red" }}
          size={20}
        />
      ),
    },
  ];

  const handleViewFile = (fileName) => {
    setCurrentImage(imageBaseUrl + fileName);
    toggleModal();
  };

  const handleSave = () => {
    if (!formData.files) {
      toast.error("Please Choose File To Upload");
    } else {
      const formDataApi = new FormData();
      formDataApi.append("createdBy", empCode)
      for (let i = 0; i < formData.files.length; i++) {
        formDataApi.append("files", formData.files[i], formData.files[i].name);
      }
      mutateAdd(formDataApi);
    }
  };

  const handleReset = () => {
    setFormData({
      files: null,
      category: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      <Container fluid={true}>
        {(isLoadingEvents || isPendingDelete || isPendingAdd) && <ScreenLoader />}

        <Breadcrumbs title="Connect" breadcrumbItem="Events" />
        <Card>
          <CardBody>
            <Row>
              <Col md="8">
                <h6 className="font-size-11 mt-1">File</h6>
                <input
                  name="files"
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleChange}
                  multiple
                  ref={fileInputRef}
                />
              </Col>

              <Col md="4 mt-4">
                <div className="d-flex align-items-center">
                  <Button
                    onClick={handleSave}
                    type="submit"
                    color="primary"
                    className="me-3"
                  >
                    Submit
                  </Button>
                  <Button
                    type="reset"
                    style={{ backgroundColor: defaultTheme.goldColorLogo, }}
                    onClick={handleReset}
                  >
                    Cancel
                  </Button>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {eventData?.data?.data?.length > 0 && (
          <AppTable
            columns={columns}
            data={
              Array.isArray(eventData?.data?.data)
                ? eventData?.data?.data?.filter(item => item.active) // Filter the active items
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

        <Modal isOpen={isModalOpen} toggle={handleCloseModal}>
          <ModalHeader toggle={handleCloseModal}>
            Confirm Deletion
          </ModalHeader>
          <ModalBody>Are you sure you want to delete this item?</ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              style={{ backgroundColor: defaultTheme.primary }}
              onClick={handleDeleteConfirm}
            >
              Yes
            </Button>
            <Button
              color="secondary"
              style={{ backgroundColor: defaultTheme.goldColorLogo }}
              onClick={handleCloseModal}
            >
              No
            </Button>
          </ModalFooter>
        </Modal>

      </Container>
    </PageContent>
  );
};

export default ConnectEvents;
