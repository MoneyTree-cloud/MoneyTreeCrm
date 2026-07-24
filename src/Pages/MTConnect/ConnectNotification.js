/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Button,
  Container,
  Form,
  Input,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import Switch from "react-switch";
import ImageModal from "../../components/Common/ImageModal";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import { useGet, usePost } from "../../Hooks/useApi";
import { SEND_TO_ALL_NOTIFICATIONS_CONNECT, GET_ALL_NOTIFICATIONS_CONNECT, CHANGE_NOTIFICATIONS_STATUS_CONNECT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { imageBaseUrl } from "../../helpers/api_helper";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { RequiredStar, WordWrapCell } from "../../helpers/function_helper";

const ConnectNotification = () => {
  const fileInputRef = useRef(null);
  const userId = useUserStore((state) => state.user.userId);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [notificationId, setNotificationId] = useState("");
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Key to force re-render
  const [page, setPage] = useState(1)
  const [apiUrl, setApiUrl] = useState('')
  const limit = 100;

  const [accessGranted, setAccessGranted] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'connect-notifications');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);


  const {
    data: notificationList,
    isLoading,
    refetch: getAllNotifications,
  } = useGet(apiUrl, { enabled: Boolean(apiUrl && accessGranted) });

  useEffect(() => {
    setApiUrl(`${GET_ALL_NOTIFICATIONS_CONNECT}?offset=${page - 1}&limit=${limit}`)
  }, [page])

  const toggleModal = () => setModalOpen(!modalOpen);

  const initialFormState = {
    title: "",
    file: null,
    content: "",
    selectedGroup: null,
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData({
        ...formData,
        [name]: files[0], // Only handling single file for simplicity
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const { isPending: addLoading, mutate: mutateNotifications } = usePost(SEND_TO_ALL_NOTIFICATIONS_CONNECT,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          handleClear();
          getAllNotifications();
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

  const { isPending: changeStatusLoading, mutate: mutateStatusChange } = usePost(CHANGE_NOTIFICATIONS_STATUS_CONNECT + notificationId, {
    onSuccess: (response) => {
      if (response?.data.status === 1) {
        setNotificationId("");
        getAllNotifications();
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
      setNotificationId("");
    },
  });

  const handleClear = () => {
    setFormData(initialFormState);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFileInputKey(Date.now());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Please Enter Title");
    } else if (!formData.content) {
      toast.error("Please Enter Content");
    } else {
      const formDataApi = new FormData();
      formDataApi.append("title", formData.title);
      formDataApi.append("file", formData.file);
      formDataApi.append("body", formData.content);
      formDataApi.append("loginId", userId);
      mutateNotifications(formDataApi);
    }
  };

  const handleSwitchChange = (id) => {
    setNotificationId(id);
  };

  useEffect(() => {
    if (notificationId) {
      mutateStatusChange();
    }
  }, [mutateStatusChange, notificationId]);

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
      name: <span className="font-weight-bold fs-13">Title</span>,
      selector: (row) => row.notificationTitle,
      sortable: true,
      width: "20%",
      cell: (row) => <WordWrapCell>{row.notificationTitle}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Content</span>,
      selector: (row) => row.notificationBody,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.notificationBody}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Date</span>,
      selector: (row) => row.createdDate,
      sortable: true,
      width: "20%",
      cell: (row) => <WordWrapCell>{row.createdDate}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">File</span>,
      width: "10%",
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
      width: "10%",
      cell: (row) => (
        <Switch
          onChange={() => handleSwitchChange(row.id)}
          checked={row.active === true}
          offColor={defaultTheme.goldColorLogo}
          onColor={defaultTheme.primary}
          height={20}
          width={40}
        />
      ),
    },
  ];

  const handleViewFile = (filePath) => {
    if (!filePath) {
      toast.error("No File Attached");
    } else {
      setCurrentImage(imageBaseUrl + filePath);
      toggleModal();
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
        <Breadcrumbs title="Connect" breadcrumbItem="Notifications" />
        {(addLoading || isLoading || changeStatusLoading) && <ScreenLoader />}
        <Card>
          <CardBody>
            <Form className="needs-validation" onSubmit={handleSubmit}>
              <Row>
                <Col md="4">
                  <FormGroup className="mb-3">
                    <h6 className="font-size-11">
                      Title <RequiredStar />
                    </h6>
                    <Input
                      name="title"
                      placeholder="Type here..."
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Col>

                <Col md="8">
                  <h6 className="font-size-11">
                    Content <RequiredStar />
                  </h6>
                  <textarea
                    name="content"
                    className="form-control"
                    rows="5"
                    placeholder="Type here..."
                    value={formData.content}
                    onChange={handleChange}
                  ></textarea>
                </Col>

                <Col md="6">
                  <FormGroup className="mb-3 mt-1">
                    <h6 className="font-size-11">File</h6>
                    <Input
                      key={fileInputKey}
                      name="file"
                      type="file"
                      ref={fileInputRef}
                      className="form-control"
                      onChange={handleChange}
                      accept="image/*"
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup className="mb-0 mt-4">
                    <div className="d-flex align-items-center">
                      <Button type="submit" color="primary" className="me-3">
                        Submit
                      </Button>{" "}
                      <Button
                        type="reset"
                        style={{
                          backgroundColor: defaultTheme.goldColorLogo,
                        }}
                        onClick={handleClear}
                      >
                        Cancel
                      </Button>
                    </div>
                  </FormGroup>
                </Col>
              </Row>

            </Form>
          </CardBody>
        </Card>

        <AppTable
          columns={columns}
          data={
            Array.isArray(notificationList?.data?.data?.content)
              ? notificationList?.data?.data?.content
              : []
          }
          pagination
          paginationTotalRows={notificationList?.data?.data?.totalElements}
          paginationServer
          onChangePage={(newPage) => setPage(newPage)}
        />
        <ImageModal
          isOpen={modalOpen}
          toggle={toggleModal}
          imageSrc={currentImage}
        />
      </Container>
    </PageContent>
  );
};

export default ConnectNotification;
