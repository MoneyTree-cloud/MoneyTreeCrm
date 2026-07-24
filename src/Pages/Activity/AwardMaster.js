/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react";
import { Row, Col, Card, CardBody, Button, Container } from "reactstrap";
import { defaultTheme } from "../../helpers/defaultTheme";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import ImageModal from "../../components/Common/ImageModal";
import { useGet, usePost } from "../../Hooks/useApi";
import { GET_ALL_REWARDS_DATA, STATUS_CHANGE_REWARDS_DATA, UPLOAD_REWARD_FILE } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import { formatDate, formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import Switch from "react-switch";

const AwardMaster = () => {
  const fileInputRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);
  const [file, setFile] = useState('')
  const LIMIT = 100;
  const [page, setPage] = useState(1);
  const [flag, setFlag] = useState(false)
  const [apiUrl, setApiUrl] = useState("");

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  const {
    data: imagesData,
    isLoading: isLoadingImages,
    refetch: getAllImages,
  } = useGet(apiUrl, { enabled: Boolean(accessGranted && apiUrl) });

  const buildApiUrl = (offset) => `${GET_ALL_REWARDS_DATA}?offset=${offset}&limit=${LIMIT}`;

  useEffect(() => {
    setApiUrl(buildApiUrl(0));
  }, [])

  const { isPending: isPendingAdd, mutate: mutateAdd } = usePost(
    UPLOAD_REWARD_FILE,
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

  useEffect(() => {
    if (flag) {
      setApiUrl(buildApiUrl(page - 1));
    }
  }, [page]);

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

  const handleSwitchChange = useCallback((row) => {
    ApiClient.post(`${STATUS_CHANGE_REWARDS_DATA}?rewardId=${row.id}`)
      .then(function (response) {
        if (response?.data?.status === 1) {
          toast.success('Status changed successfully');
          getAllImages();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        toast.error(error.message);
      });
  }, [getAllImages]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "10%",
    },
    {
      name: <span className="font-weight-bold fs-13">File</span>,
      sortable: true,
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
      name: <span className="font-weight-bold fs-13">Created At</span>,
      selector: (row) => formatDate(row.createdAt),
      sortable: true,
      cell: (row) => <WordWrapCell> {formatDateTime(row.createdAt)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Created By</span>,
      selector: (row) => row.createdByName,
      sortable: true,
      cell: (row) => <WordWrapCell> {row.createdByName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      cell: (row) => (
        <Switch
          checked={row.active}
          offColor={defaultTheme.goldColorLogo}
          onColor={defaultTheme.primary}
          height={20}
          width={40}
          onChange={() => handleSwitchChange(row)}
        />
      ),
    },
  ];

  const handleViewFile = (fileName) => {
    setCurrentImage(imageBaseUrl + fileName);
    toggleModal();
  };

  const handleSave = () => {
    if (!file) {
      toast.error("Please Choose File To Upload");
    } else {
      const formDataApi = new FormData();
      formDataApi.append("userId", userId);
      formDataApi.append("file", file);

      mutateAdd(formDataApi);
    }
  };

  const handleReset = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };
  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'reward-master');
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
        {(isLoadingImages || isPendingAdd) && <ScreenLoader />}
        <Breadcrumbs title="Award" breadcrumbItem="Master" />
        <Card>
          <CardBody>
            <Row>
              <Col md="6">
                <h6 className="font-size-11 mt-1">Award File <RequiredStar /></h6>
                <input
                  name="files"
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleChange}
                  ref={fileInputRef}
                />
              </Col>

              <Col md="4" className="d-flex align-items-end">
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
                  color="secondary"
                  onClick={handleReset}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {imagesData?.data?.data?.content?.length > 0 && (
          <AppTable
            columns={columns}
            data={
              Array.isArray(imagesData?.data?.data?.content)
                ? imagesData?.data?.data?.content
                : []
            }
            pagination
            paginationTotalRows={imagesData?.data?.data?.totalElements}
            paginationServer
            onChangePage={(newPage) => {
              setPage(newPage);
              setFlag(true)
            }}
          />
        )}
        <ImageModal
          isOpen={modalOpen}
          toggle={toggleModal}
          imageSrc={currentImage}
        />
      </Container>
    </PageContent>
  );
};

export default AwardMaster;
