import { useEffect, useRef, useState } from "react";
import { Row, Col, Card, CardBody, FormGroup, Button, Container, Form, Input } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import Switch from "react-switch";
import ImageModal from "../../components/Common/ImageModal";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css";
import Select from "react-select";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import { useGet, usePost } from "../../Hooks/useApi";
import { CHANGE_NOTIFICATIONS_STATUS, GET_ALL_TODAYS_NOTIFICATIONS, GROUP_DROPDOWN_MULTISELECT, SEND_TO_ALL_NOTIFICATIONS, SEND_TO_CHAT_GROUPS } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { imageBaseUrl } from "../../helpers/api_helper";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import DOMPurify from "dompurify";

const NotificationScreen = () => {
  const fileInputRef = useRef(null);
  const userId = useUserStore((state) => state.user.userId);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [notificationId, setNotificationId] = useState("");
  const [userType, setUserType] = useState("All");
  const [expandedRows, setExpandedRows] = useState({});
  const [accessGranted, setAccessGranted] = useState(null);
  const todayDate = new Date().toISOString().split('T')[0];
  const { data: chatGroupList } = useGet(GROUP_DROPDOWN_MULTISELECT, { enabled: Boolean(accessGranted && userType !== 'All') });
  const { data: notificationList, isLoading, refetch: getAllNotifications } = useGet(`${GET_ALL_TODAYS_NOTIFICATIONS}?date=${todayDate}`, { enabled: !!accessGranted });

  const toggleModal = () => setModalOpen(!modalOpen);

  const initialFormState = {
    title: "",
    file: null,
    content: "",
    selectedGroup: null,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

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

  const { isPending: addLoading, mutate: mutateNotifications } = usePost(
    userType === "ChatGroup" ? SEND_TO_CHAT_GROUPS : SEND_TO_ALL_NOTIFICATIONS,
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

  const { isPending: changeStatusLoading, mutate: mutateStatusChange } = usePost(CHANGE_NOTIFICATIONS_STATUS + notificationId, {
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
    } else if (userType === "ChatGroup" && !formData.selectedGroup) {
      toast.error("Please Select Chat Group");
    } else if (!formData.content) {
      toast.error("Please Enter Content");
    } else {
      const formDataApi = new FormData();
      formDataApi.append("title", formData.title);
      formDataApi.append("file", formData.file);
      formDataApi.append("body", formData.content);
      formDataApi.append("loginId", userId);
      if (userType === "ChatGroup") {
        formDataApi.append("groupId", formData.selectedGroup.value);
      }
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
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Title</span>,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.notificationTitle}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Description</span>,
      selector: (row) => row.notificationBody,
      sortable: true,
      width: "30%",
      cell: (row, index) => {
        const isExpanded = expandedRows[index] || false; // Check if the current row is expanded

        const sanitizedDescription = row.notificationBody
          ? row.notificationBody.replace(/(\r\n|\n|\r)/g, "<br /><br />")
          : "";

        const truncatedDescription = sanitizedDescription.length > 100 ? sanitizedDescription.substring(0, 100) + '...' : sanitizedDescription;

        const toggleDescription = () => {
          setExpandedRows((prevState) => ({
            ...prevState,
            [index]: !isExpanded, // Toggle the expanded state for the current row
          }));
        };

        return (
          <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
            {/* <div
              dangerouslySetInnerHTML={{
                __html: isExpanded ? sanitizedDescription : truncatedDescription,
              }}
            /> */}
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  isExpanded ? sanitizedDescription : truncatedDescription
                ),
              }}
            />

            {sanitizedDescription.length > 100 && (
              <button
                onClick={toggleDescription} // Toggle function for each row
                style={{
                  background: "none",
                  border: "none",
                  color: defaultTheme.goldColorLogo,
                  fontWeight: "bold",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "inherit",
                  marginTop: "10px",
                }}
              >
                {isExpanded ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
        );
      },
    },
    {
      name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
      sortable: true,
      width: "20%",
      cell: (row) => <WordWrapCell>{row.createdDate}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Group</span>,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.groupName}</WordWrapCell>
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

  const handleRadioChange = (event) => {
    setUserType(event.target.value);
  };

  const handleViewFile = (filePath) => {
    if (!filePath) {
      toast.error("No File Attached");
    } else {
      setCurrentImage(imageBaseUrl + filePath);
      toggleModal();
    }
  };

  const handleSelectChange = (field) => (selectedOption) => {
    setFormData((prev) => ({ ...prev, [field]: selectedOption }));
  };

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'notification');
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
        <Breadcrumbs title="Notifications" breadcrumbItem="Data" />
        {(addLoading || isLoading || changeStatusLoading) && <ScreenLoader />}
        <Card>
          <CardBody>
            <Form className="needs-validation" onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md="4">
                  <FormGroup>
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
                <Col md="3">
                  <div className="radio-button-container mt-4">
                    <label className={`radio-label ${userType === "All" ? "active" : ""}`}>
                      <input
                        type="radio"
                        value="All"
                        checked={userType === "All"}
                        onChange={handleRadioChange}
                      />
                      All
                    </label>
                    <label className={`radio-label ${userType === "ChatGroup" ? "active" : ""}`}>
                      <input
                        type="radio"
                        value="ChatGroup"
                        checked={userType === "ChatGroup"}
                        onChange={handleRadioChange}
                      />
                      Chat Group
                    </label>
                  </div>
                </Col>

                {userType !== "All" && (
                  <Col md="5">
                    <FormGroup className="mb-3">
                      <h6 className="font-size-11">
                        Select Chat Group{" "}
                        <RequiredStar />
                      </h6>
                      <Select
                        style={{ zIndex: 9999 }}
                        menuPortalTarget={document.body}
                        isClearable
                        value={formData.selectedGroup}
                        onChange={handleSelectChange("selectedGroup")}
                        options={
                          Array.isArray(chatGroupList?.data?.data)
                            ? chatGroupList?.data?.data
                            : []
                        }
                      />
                    </FormGroup>
                  </Col>
                )}
              </Row>
              <Row>
                <Col md="6">
                  <h6 className="font-size-11">Content <RequiredStar /></h6>
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
                  <FormGroup className="mb-3">
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
              </Row>
              <FormGroup className=" mt-3">
                <div className="d-flex align-items-center">
                  <Button type="submit" color="primary" className="me-2">
                    Submit
                  </Button>{" "}
                  <Button
                    type="reset"
                    color="secondary"
                    onClick={handleClear}
                  >
                    Cancel
                  </Button>
                </div>
              </FormGroup>
            </Form>
          </CardBody>
        </Card>

        <AppTable
          columns={columns}
          data={
            Array.isArray(notificationList?.data?.data)
              ? notificationList?.data?.data
              : []
          }
          pagination
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

export default NotificationScreen;
