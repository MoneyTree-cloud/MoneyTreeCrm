import { useEffect, useRef, useState } from "react";
import { Row, Col, Card, CardBody, Button, Container, Input, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { defaultTheme } from "../../helpers/defaultTheme";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import ImageModal from "../../components/Common/ImageModal";
import { MdDelete, MdAdd } from "react-icons/md";
import Select from "react-select";
import { useGet, usePost } from "../../Hooks/useApi";
import { CREATE_FOLDER, DELETE_IMAGE, GET_ALL_FOLDER, GET_ALL_IMAGES, UPLOAD_MULTIPLE_IMAGE } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import { formatDate, WordWrapCell } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

const GalleryScreen = () => {
  const fileInputRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [newCategoryModalOpen, setNewCategoryModalOpen] = useState(false); // State for new category modal
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);

  const handleDeleteClick = (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this?"
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
          getAllImages();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsLoading(false);
        toast.error(error.message);
      });
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  const [formData, setFormData] = useState({
    files: null,
    category: null, // Manage category within formData
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

  // Handle category change directly in formData
  const handleCategoryChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      category: selectedOption, // Set selected category in formData
    }));
  };

  const {
    data: categoriesData,
    refetch: getAllFolder,
  } = useGet(GET_ALL_FOLDER, { enabled: !!accessGranted }); //Manage as dropdown

  const transformedCategoryOptions = Array.isArray(categoriesData?.data?.data)
    ? categoriesData?.data?.data.map((item) => ({
      label: item.fileTypeName,
      value: item.id,
    }))
    : [];

  const { data: imagesData, isLoading: isLoadingImages, refetch: getAllImages } = useGet(GET_ALL_IMAGES, { enabled: !!accessGranted });

  const { isPending, mutate: createFolder } = usePost(CREATE_FOLDER + newCategory, {
    onSuccess: (response) => {
      if (response?.data?.status === 1) {
        toast.success(response.data.message);
        setNewCategory(""); // Reset new category input
        setNewCategoryModalOpen(false); // Close modal
        getAllFolder();
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { isPending: isPendingAdd, mutate: mutateAdd } = usePost(
    UPLOAD_MULTIPLE_IMAGE,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getAllImages();
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
    cursor: "pointer", // Show finger (pointer) cursor on hover
    borderRadius: "50%", // Make it round (circular)
    border: "2px solid", // 2px solid border
    borderColor: defaultTheme.goldColorLogo, // Custom border color (using your theme's gold color)
    padding: "2px",
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Category</span>,
      selector: (row) => row?.fileType?.fileTypeName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row?.fileType?.fileTypeName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Date</span>,
      selector: (row) => formatDate(row.uploadDate),
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDate(row.uploadDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">File</span>,
      cell: (row) =>
        row.filePath ? (
          <img
            src={imageBaseUrl + row.filePath}
            alt="File"
            style={profileStyle}
            onClick={() => handleViewFile(row.filePath)}
          />
        ) : null,
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
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
    // Set the image source based on the row data or use a static image
    setCurrentImage(imageBaseUrl + fileName);
    toggleModal();
  };

  const handleSave = () => {
    if (!formData.category) {
      toast.error("Please Select Category");
    } else if (!formData.files) {
      toast.error("Please Choose File To Upload");
    } else {
      const formDataApi = new FormData();
      formDataApi.append("folder_id", formData?.category?.value);
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
      fileInputRef.current.value = ""; // Clear the file input
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'gallery');
      setAccessGranted(hasAccess);
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
      <Container fluid={true}>
        {(isLoadingImages || isPending || isPendingAdd || isLoading) && <ScreenLoader />}

        <Breadcrumbs title="Gallery" breadcrumbItem="Add-Data" />

        <Button
          color="primary"
          onClick={() => setNewCategoryModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <MdAdd size={12} style={{ marginRight: 2 }} />
          <span>Add Category</span>
        </Button>

        <Card>
          <CardBody>
            <Row className="g-3">
              <Col lg="4">
                <h6 className="font-size-11">Select Category</h6>
                <Select
                  style={{ zIndex: 9999 }}
                  menuPortalTarget={document.body}
                  options={transformedCategoryOptions}
                  onChange={handleCategoryChange}
                  value={formData.category}
                  isClearable
                />
              </Col>
              <Col md="4">
                <h6 className="font-size-11">File</h6>
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
              <Col md="4" className="d-flex align-items-end gap-2">
                <Button
                  type="submit"
                  color="primary"
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


        {imagesData?.data?.data?.length > 0 && (
          <AppTable
            columns={columns}
            progressPending={isLoadingImages}
            data={
              Array.isArray(imagesData?.data?.data)
                ? imagesData?.data?.data
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

        {/* New Category Modal */}
        <Modal
          isOpen={newCategoryModalOpen}
          toggle={() => setNewCategoryModalOpen(false)}
        >
          <ModalHeader toggle={() => setNewCategoryModalOpen(false)}>
            Add New Category
          </ModalHeader>
          <ModalBody>
            <Input
              type="text"
              placeholder="Enter new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              style={{ backgroundColor: defaultTheme.primary }}
              onClick={() => createFolder()}
            >
              Save
            </Button>
            <Button
              color="secondary"
              style={{ backgroundColor: defaultTheme.goldColorLogo }}
              onClick={() => setNewCategoryModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </PageContent>
  );
};

export default GalleryScreen;