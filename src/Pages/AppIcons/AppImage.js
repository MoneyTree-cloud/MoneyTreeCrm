import { useEffect, useRef, useState } from "react";
import { Row, Col, Card, CardBody, Button, Container } from "reactstrap";
import { defaultTheme } from "../../helpers/defaultTheme";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  CHANGE_STATUS_APP_BANNER,
  CREATE_APP_BANNER,
  GET_ALL_APP_BANNER
} from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import { useGet, usePost } from "../../Hooks/useApi";
import AppTable from "../../components/Common/Table";
import { imageBaseUrl } from "../../helpers/api_helper";
import ImageModal from "../../components/Common/ImageModal";
import Select from "react-select";
import Switch from "react-switch";
import { formatDate, RequiredStar } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";

const AppImage = () => {
  const fileInputRef = useRef(null);
  const userId = useUserStore((state) => state.user.userId);
  const [currentImage, setCurrentImage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const toggleModal = () => setModalOpen(!modalOpen);

  const {
    data: bannerList,
    isLoading,
    refetch: getAllBanners,
  } = useGet(GET_ALL_APP_BANNER + userId);

  const [formData, setFormData] = useState({
    files: null,
  });
  const [bannerType, setBannerType] = useState(null);
  const bannerTypeGroup = [
    { label: 'Moneytree', value: 'MONEY_TREE' },
    { label: 'M-Connect', value: 'M_CONNECT' }
  ]

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevState) => ({
      ...prevState,
      files: file,
    }));
  };

  const { isPending: isPendingAdd, mutate: mutateAdd } = usePost(
    CREATE_APP_BANNER,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          handleReset();
          getAllBanners();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const { isPending: isPendingDelete, mutate: mutateStatusChange } = usePost(
    `${CHANGE_STATUS_APP_BANNER}${selectedId}&isActive=${activeStatus}&loginId=${userId}`,
    {
      onSuccess: (response) => {
        setSelectedId('')
        setActiveStatus('')
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getAllBanners();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        setSelectedId('')
        setActiveStatus('')
        toast.error(err.message);
      },
    }
  );

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.files) {
      toast.error("Please Choose Banner To Upload");
    }
    else if (!bannerType) {
      toast.error("Please Choose Banner Type");
    }
    else {
      const formDataApi = new FormData();
      formDataApi.append("loginId", userId);
      formDataApi.append("file", formData.files);
      formDataApi.append("type", bannerType?.value);
      mutateAdd(formDataApi);
    }
  };

  const handleReset = () => {
    setFormData({
      files: null,
    });
    setBannerType(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
  };


  const handleViewFile = (fileName) => {
    // const fileExtension = fileName.split(".").pop().toLowerCase();
    const fileUrl = imageBaseUrl + fileName;
    setCurrentImage(fileUrl);
    toggleModal();
  };

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


  const handleSwitchChange = (row) => {
    setSelectedId(row.id);
    const newStatus = row.isActive === "YES" ? "NO" : "YES";
    setActiveStatus(newStatus);
  };

  useEffect(() => {
    if (selectedId && activeStatus) {
      mutateStatusChange();
    }
  }, [mutateStatusChange, selectedId, activeStatus]);


  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: '8%'
    },
    {
      name: <span className="font-weight-bold fs-13">File</span>,
      sortable: true,
      cell: (row) =>
        row.bannerUrl ? (
          <img
            src={imageBaseUrl + row.bannerUrl}
            alt="File"
            style={profileStyle}
            onClick={() => handleViewFile(row.bannerUrl)}
          />
        ) : null,
    },
    {
      name: <span className="font-weight-bold fs-13">Type</span>,
      selector: (row) => row.bannerType,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Created Date</span>,
      selector: (row) => formatDate(row.createdDate),
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      sortable: true,
      width: "10%",
      cell: (row) => (
        <Switch
          onChange={() => handleSwitchChange(row)}
          checked={row.isActive === 'YES'}
          offColor={defaultTheme.goldColorLogo}
          onColor={defaultTheme.primary}
          height={20}
          width={40}
        />
      ),
    },
  ];

  const handleBannerChange = (selectedOption) => {
    setBannerType(selectedOption); // Update the state with the selected option
  };

  return (
    <PageContent>
      <Container fluid={true}>
        {(isPendingAdd || isLoading || isPendingDelete) && <ScreenLoader />}
        <Breadcrumbs title="Banner" breadcrumbItem="App-Banner" />
        <Row>
          <Col>
            <form onSubmit={handleSave}>
              <Card>
                <CardBody>
                  <Row>
                    <Col md="4">
                      <h6 className="mt-1 font-size-11">
                        Banner <RequiredStar />
                      </h6>
                      <input
                        name="files"
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                      />
                      <h6
                        className="font-size-10 mt-2"
                        style={{ color: defaultTheme.redColor }}
                      >
                        Upload only Image
                      </h6>
                    </Col>

                    <Col md="4">
                      <h6 className="font-size-11 mt-1">
                        Banner Type <RequiredStar />
                      </h6>

                      <Select
                        style={{ zIndex: 9999 }}
                        menuPortalTarget={document.body}
                        isClearable
                        value={bannerType}
                        onChange={handleBannerChange}
                        options={bannerTypeGroup}
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
            </form>
          </Col>
        </Row>
      </Container>
      {Array.isArray(bannerList?.data?.data) &&
        bannerList?.data?.data.length > 0 && (
          <AppTable
            progressPending={isLoading}
            columns={columns}
            data={
              Array.isArray(bannerList?.data?.data)
                ? bannerList?.data?.data
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

    </PageContent>
  );
};

export default AppImage;
