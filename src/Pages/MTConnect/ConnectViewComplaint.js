/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  Button,
  Label,
} from "reactstrap";
import "../CSS/styles.css"; // Importing the external CSS file
import { AiOutlinePaperClip } from "react-icons/ai";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import {
  GET_CONNECT_SUPPORT_DATA_BY_ID,
  SEND_CONNECT_SUPPORT_MESSAGE,
} from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { usePost } from "../../Hooks/useApi";
import { formatDateTime } from "../../helpers/function_helper";
import { IoIosCloudUpload, IoMdSend } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import ImageModal from "../../components/Common/ImageModal";
import { MdArrowBack } from "react-icons/md";

export default function ConnectViewComplaint() {
  const location = useLocation();
  const navigation = useNavigate();

  const { row, supportMsgType } = location.state || {};
  const [inputValue, setInputValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]); // Store chat messages
  const [file, setFile] = useState(null); // State to hold the selected file
  const chatBodyRef = useRef(null); // Reference to chat body for scrolling
  const fileInputRef = useRef(null); // Reference to file input
  const [messageStatus, setMessageStatus] = useState("");

  useEffect(() => {
    getSupportList(); // Fetch messages when the component mounts
  }, []);

  const getSupportList = () => {
    setIsLoading(true);
    ApiClient.get(GET_CONNECT_SUPPORT_DATA_BY_ID + '14&receiverId=' + row.userId)
      .then(function (response) {
        if (response?.data?.status === 1) {
          setMessages(response.data.data);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        toast.error(error.message);
      })
      .finally(function () {
        setIsLoading(false);
      });
  };

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  // Auto scroll to bottom whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(); // Scroll to the bottom whenever messages array changes
    }
  }, [messages]);

  const { isPending: addLoading, mutate: mutateSend } = usePost(
    SEND_CONNECT_SUPPORT_MESSAGE,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          getSupportList();
          setInputValue("");
          setMessageStatus("");
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

  const handleSendMessage = () => {
    if (!inputValue) {
      toast.error("Please Enter Message To Send");
      return;
    }
    const formattedMessage = inputValue.replace(/\n/g, "<br />");
    const formData = new FormData();
    formData.append("message", formattedMessage);
    formData.append("receiverId", row?.userId);
    formData.append("senderId", '14');
    formData.append("file", file);
    formData.append("isResolved", messageStatus === "resolved" ? true : false); //No For Pending

    mutateSend(formData);
  };

  const handleKeyPress = (e) => {
    // Check if the user presses "Ctrl + Enter"
    if (e.key === "Enter" && e.ctrlKey) {
      // Prevent the default behavior (so it doesn't insert a new line)
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  // Handle file input change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]; // Get the first selected file
    if (selectedFile) {
      setFile(selectedFile); // Store the selected file
    }
  };

  // Trigger file input click when the attachment button is pressed
  const handleAttachFile = () => {
    fileInputRef.current.click(); // Click the file input element
  };

  const handleViewFile = () => {
    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const fileUrl = URL.createObjectURL(file); // Generate URL for the file object

      if (fileExtension === "pdf") {
        // Open PDF in a new tab/window
        window.open(fileUrl, "_blank");
      } else {
        // Set the image source and open modal for images
        setCurrentImage(fileUrl);
        toggleModal(); // Open modal to display image
      }
    }
  };

  const handleChatFileOpen = (fileName) => {
    const fileExtension = fileName.split(".").pop().toLowerCase();
    const fileUrl = imageBaseUrl + fileName;

    if (fileExtension === "pdf") {
      // Open PDF in a new window
      window.open(fileUrl, "_blank");
    } else {
      // Set the image source and open modal for images
      setCurrentImage(fileUrl);
      toggleModal();
    }
  };

  const handleToggle = (e) => {
    setMessageStatus((prevState) =>
      prevState === "resolved" ? "" : "resolved"
    );
  };

  const handleBack = () => {
    navigation("/connect-support", { state: { supportMsgType_: supportMsgType } });
  };

  return (
    <Container fluid className="chat-app">
      {(addLoading || loading) && <ScreenLoader />}
      <div className="page-content">

        <Row className="chat-row">
          <Col sm="12" className="chat-area">
            <Card className="chat-card">
              <CardBody className="chat-body">
                <div className="message-container" ref={chatBodyRef}>
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message ${String(message.receiver.userId) !== '14'
                          ? "message-right"
                          : "message-left"
                          }`}
                      >
                        <span
                          className="message-text"
                          dangerouslySetInnerHTML={{
                            __html: message.message.replace(/\n/g, "<br />"), // Replace newlines with <br />
                          }}
                        />
                        <div className="message-timestamp">
                          <span
                            style={{
                              color:
                                String(message.receiver.userId) !== '14'
                                  ? "skyblue"
                                  : "black",
                              fontWeight: "bold",
                            }}
                          >
                            {formatDateTime(message.createdDate)}
                          </span>
                          {message.attachment && (
                            <span className="file-icon">
                              <AiOutlinePaperClip
                                size={18}
                                color={defaultTheme.whiteColor}
                                onClick={() =>
                                  handleChatFileOpen(message.attachment)
                                }
                              />
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-chat">Start chatting!</div>
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Chat Footer */}
        {supportMsgType === "In Process" ?
          <div
            className={`chat-footer ${supportMsgType !== "In Process" ? "hidden" : ""
              }`}
          >
            <textarea
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              className="form-control"
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Button color="link" onClick={handleAttachFile}>
              <IoIosCloudUpload
                size={27}
                style={{ color: defaultTheme.goldColorLogo }}
              />
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept=".pdf, image/*"
            />
            {file && (
              <AiOutlinePaperClip
                size={20}
                color={defaultTheme.goldColorLogo}
                onClick={handleViewFile}
              />
            )}

            <Label
              check
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: "2px",
              }}
            >
              <Input
                type="checkbox"
                name="messageStatus"
                value="resolved"
                checked={messageStatus === "resolved"}
                onChange={handleToggle}
              />
              <span>Resolved</span>
            </Label>

            <IoMdSend
              onClick={handleSendMessage}
              style={{
                cursor: "pointer",
                color: defaultTheme.primary,
                fontSize: "30px",
                marginLeft: "10px",
              }}
            />
            <MdArrowBack
              onClick={handleBack}
              style={{
                cursor: "pointer",
                color: defaultTheme.goldColorLogo,
                fontSize: "30px",
                marginLeft: "10px",
              }}
            />
          </div>
          :
          <MdArrowBack
            onClick={handleBack}
            style={{
              cursor: "pointer",
              color: defaultTheme.goldColorLogo,
              fontSize: "30px",
              marginLeft: "10px",
            }}
          />
        }

      </div>

      <ImageModal
        isOpen={modalOpen}
        toggle={toggleModal}
        imageSrc={currentImage}
      />
    </Container>
  );
}
