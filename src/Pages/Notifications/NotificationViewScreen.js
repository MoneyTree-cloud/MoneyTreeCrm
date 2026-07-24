import { useState } from "react";
import { Row, Col, Card, CardBody, Container } from "reactstrap";
import "../CSS/styles.css";
import { useUserStore } from "../../store/useUserStore";
import { useGet } from "../../Hooks/useApi";
import { CLEAR_NOTIFICATIONS_COUNT, GET_NOTIFICATIONS_BY_ID } from "../../helpers/url_helper";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import ScreenLoader from "../../constants/ScreenLoader";
import { imageBaseUrl } from "../../helpers/api_helper";
import ImageModal from "../../components/Common/ImageModal";
import PageContent from "../../components/Common/PageContent";
import DOMPurify from "dompurify";

const NotificationViewScreen = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const userId = useUserStore((state) => state.user.userId);
  const { data: notificationList, isLoading } = useGet(GET_NOTIFICATIONS_BY_ID + userId);
  const { data } = useGet(CLEAR_NOTIFICATIONS_COUNT + userId);

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleViewFile = (filePath) => {
    setCurrentImage(filePath);
    toggleModal();
  };

  return (
    <PageContent>
      <Container fluid={true}>
        <Breadcrumbs title="Notification" breadcrumbItem="View Notifications" />
        {isLoading && <ScreenLoader />}
        <Row>
          {Array.isArray(notificationList?.data?.data?.notifications) &&
            notificationList?.data?.data?.notifications.map((row, index) => (
              <Col key={index} xs="12">
                <Card
                  className={"card-custom"}
                  style={{
                    boxShadow:
                      index % 2 === 0 ? "0 0 0 #c38c42" : "0 0 0 #005b52",
                  }}
                >
                  <CardBody className="card-body-custom">
                    <img
                      onClick={() => {
                        const imagePath = row.filePath
                          ? imageBaseUrl + row.filePath
                          : require("../../assets/images/Tree_transparent.png");
                        handleViewFile(imagePath);
                      }}
                      src={
                        row.filePath
                          ? imageBaseUrl + row.filePath
                          : require("../../assets/images/Tree_transparent.png")
                      }
                      alt="Notification"
                      className="notification-image"
                    />

                    <div className="flex-grow-1">
                      <h6 className="notification-title">
                        {row.notificationTitle}
                      </h6>
                      <p
                        className="notification-body"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            row.notificationBody.split("\n").join("<br />")
                          ),
                        }}
                      />
                      {row.groupName && (
                        <p className="notification-body">
                          Group : {row.groupName}
                        </p>
                      )}
                    </div>
                  </CardBody>

                  <div className="footer-text" style={{ marginTop: -15 }}>
                    <span>{row.createdDate}</span>
                  </div>
                </Card>
              </Col>
            ))}
        </Row>

        <ImageModal
          isOpen={modalOpen}
          toggle={toggleModal}
          imageSrc={currentImage}
        />
      </Container>
    </PageContent>
  );
};

export default NotificationViewScreen;