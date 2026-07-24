/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from "react";
import "../CSS/whatsapp.css";
import { AiOutlinePaperClip } from "react-icons/ai";
import { toast } from "react-toastify";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import { GET_SUPPORT_DATA_BY_ID, SEND_SUPPORT_MESSAGE_ASSOCIATE } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import { usePost } from "../../Hooks/useApi";
import { formatDateTime } from "../../helpers/function_helper";
import { IoIosCloudUpload, IoMdSend } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import ImageModal from "../../components/Common/ImageModal";
import { MdArrowBack, MdCheckCircle, MdSupportAgent } from "react-icons/md";
import DOMPurify from "dompurify";
import { LuCopy } from "react-icons/lu";

function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export default function ViewComplaint() {
  const location = useLocation();
  const navigation = useNavigate();
  const { row, supportMsgType } = location.state || {};

  const [inputValue, setInputValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const { userId, empCode } = useUserStore((state) => state.user);
  const [loading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [messageStatus, setMessageStatus] = useState("");
  const chatBodyRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const isResolved = supportMsgType === "Resolved";

  useEffect(() => {
    getSupportList();
  }, []);

  const getSupportList = () => {
    setIsLoading(true);
    ApiClient.get(
      GET_SUPPORT_DATA_BY_ID + userId + "&senderId=" + row?.userId
    )
      .then((response) => {
        if (response?.data?.status === 1) {
          setMessages(response.data.data.content.reverse());
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setIsLoading(false));
  };

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  const handleCopyMessage = async (message) => {
    try {
      const text = message
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "");

      await navigator.clipboard.writeText(text);
    } catch (err) {
      toast.error("Failed to copy message");
    }
  };

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages]);

  const { isPending: addLoading, mutate: mutateSend } = usePost(
    SEND_SUPPORT_MESSAGE_ASSOCIATE,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          getSupportList();
          setInputValue("");
          setMessageStatus("");
          setFile(null);

          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
          }
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => toast.error(err.message),
    }
  );

  const handleSendMessage = () => {
    if (!inputValue.trim()) {
      toast.error("Please enter a message to send");
      return;
    }
    const formattedMessage = inputValue.replace(/\n/g, "<br />");
    const formData = new FormData();
    formData.append("message", formattedMessage);
    formData.append("receiverId", row?.userId);
    formData.append("senderId", userId);
    formData.append("file", file || "");
    formData.append("isResolved", messageStatus === "resolved" ? "YES" : "NO");
    mutateSend(formData);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleAttachFile = () => fileInputRef.current.click();

  const handleViewFile = () => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    const fileUrl = URL.createObjectURL(file);
    if (ext === "pdf") {
      window.open(fileUrl, "_blank");
    } else {
      setCurrentImage(fileUrl);
      toggleModal();
    }
  };

  const handleChatFileOpen = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    const fileUrl = imageBaseUrl + fileName;
    if (ext === "pdf") {
      window.open(fileUrl, "_blank");
    } else {
      setCurrentImage(fileUrl);
      toggleModal();
    }
  };

  const handleBack = () => {
    navigation("/support", { state: { supportMsgType_: supportMsgType } });
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  };

  const complainantName = row?.userName
    ? `${row.userName}${row.employeeCode ? ` (${row.employeeCode})` : ""}`
    : "Complainant";

  return (
    <div className="page-content wa-page-wrap">
      <div className="wa-page">
        {(addLoading || loading) && <ScreenLoader />}

        {/* Header */}
        <div className="wa-header">
          <button className="wa-header-back" onClick={handleBack} title="Back">
            <MdArrowBack />
          </button>
          <div className="wa-avatar">{getInitials(row?.userName || "?")}</div>
          <div className="wa-header-info">
            <div className="wa-header-name">{complainantName}</div>
            <div className="wa-header-sub">
              {isResolved ? (
                <span style={{ color: "#a5d6a7" }}>✔ Resolved</span>
              ) : (
                <span>In Process</span>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="wa-messages-bg" ref={chatBodyRef}>
          {messages.length === 0 ? (
            <div className="wa-empty-chat">
              <div className="wa-empty-icon-wrap">
                <MdSupportAgent size={42} />
              </div>
              <p className="wa-empty-title">No messages yet</p>
              <p className="wa-empty-sub">
                No conversation found for this complaint
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isSent = String(message.sender.userId) === String(userId);
              return (
                <div
                  key={message.id}
                  className={`wa-msg-row ${isSent ? "sent" : "received"}`}
                >
                  {/* {!isSent && (
                    <div className="wa-sender-name">
                      {row?.userName || message.sender?.firstName || message.sender?.userName || "User"}
                    </div>
                  )} */}
                  <div className="wa-bubble">
                    <div className="wa-bubble-content">
                      <span
                        className="wa-bubble-text"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            message.message.replace(/\n/g, "<br />")
                          ),
                        }}
                      />
                      {empCode === '20000' &&
                        <button
                          type="button"
                          className="wa-copy-btn"
                          onClick={() => handleCopyMessage(message.message)}
                          title="Copy message"
                        >
                          <LuCopy size={14} />
                        </button>
                      }
                    </div>

                    <div className="wa-bubble-footer">
                      {message.attachment && (
                        <span
                          className="wa-bubble-attach"
                          onClick={() => handleChatFileOpen(message.attachment)}
                          title="View attachment"
                        >
                          <AiOutlinePaperClip size={13} />
                        </span>
                      )}
                      <span className="wa-bubble-time">
                        {formatDateTime(message.createdDate)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer — only when In Process */}
        {!isResolved ? (
          <div className="wa-footer">
            <div className="wa-footer-input-wrap">
              <button
                className="wa-icon-btn"
                onClick={handleAttachFile}
                title="Attach file"
              >
                <IoIosCloudUpload size={22} />
              </button>
              <textarea
                ref={textareaRef}
                className="wa-textarea"
                placeholder="Type a message..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                rows={1}
              />
              {file && (
                <div
                  className="wa-file-chip"
                  onClick={handleViewFile}
                  title={file.name}
                >
                  <AiOutlinePaperClip size={13} />
                  {file.name}
                </div>
              )}
              <label className="wa-resolved-wrap" title="Mark as resolved">
                <input
                  type="checkbox"
                  className="wa-resolved-checkbox"
                  checked={messageStatus === "resolved"}
                  onChange={() =>
                    setMessageStatus((prev) =>
                      prev === "resolved" ? "" : "resolved"
                    )
                  }
                />
                <span className="wa-resolved-label">Resolved</span>
              </label>
            </div>

            <button
              className="wa-send-btn"
              onClick={handleSendMessage}
              title="Send (Enter)"
            >
              <IoMdSend size={20} />
            </button>
          </div>
        ) : (
          <div className="wa-resolved-banner">
            <MdCheckCircle size={20} />
            This complaint has been resolved
          </div>
        )}

        {/* Hidden file input — kept outside footer to prevent mobile touch interference */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ position: "fixed", left: "-9999px", top: "-9999px", opacity: 0 }}
          onChange={handleFileChange}
          accept=".pdf, image/*"
        />

        <ImageModal isOpen={modalOpen} toggle={toggleModal} imageSrc={currentImage} />
      </div>
    </div>
  );
}
