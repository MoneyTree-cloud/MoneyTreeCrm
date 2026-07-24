/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from "react";
import "../CSS/whatsapp.css";
import { AiOutlinePaperClip } from "react-icons/ai";
import { toast } from "react-toastify";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import {
  GET_SUPPORT_DATA_BY_ID,
  SEND_SUPPORT_MESSAGE_ASSOCIATE,
} from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import { usePost } from "../../Hooks/useApi";
import { formatDateTime } from "../../helpers/function_helper";
import { IoIosCloudUpload, IoMdSend } from "react-icons/io";
import { MdRefresh, MdHeadsetMic, MdSupportAgent, MdComputer } from "react-icons/md";
import ImageModal from "../../components/Common/ImageModal";
import { useLocation } from "react-router-dom";
import DOMPurify from "dompurify";

const RECEIVER_MAP = { sap: "100047", hr: "101657", ops: "101658" };

const SUPPORT_CONFIG = {
  sap: {
    label: "SAP Support",
    Icon: MdSupportAgent,
    initials: "SS",
  },
  hr: {
    label: "HR Support",
    Icon: MdHeadsetMic,
    initials: "HR",
  },
  ops: {
    label: "Ops Support",
    Icon: MdComputer,
    initials: "OP",
  },
};

export default function MainSupport() {
  const [inputValue, setInputValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const userId = useUserStore((state) => state.user.userId);
  const [loading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const chatBodyRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const location = useLocation();
  const supportType = new URLSearchParams(location.search).get("supportType") || "sap";
  const config = SUPPORT_CONFIG[supportType] || SUPPORT_CONFIG.sap;
  const { label: receiverLabel, Icon: SupportIcon } = config;

  useEffect(() => {
    getSupportList();
  }, [supportType]);

  const getSupportList = () => {
    setIsLoading(true);
    const receiverId = RECEIVER_MAP[supportType] || "101658";
    ApiClient.get(`${GET_SUPPORT_DATA_BY_ID}${receiverId}&senderId=${userId}`)
      .then((response) => {
        if (response?.data?.status === 1) {
          setMessages(response.data.data.content.reverse());
        } else if (response.data.message !== "No Personal Chat Found !") {
          toast.error(response.data.message);
          setMessages([]);
        } else {
          setMessages([]);
        }
      })
      .catch((error) => {
        setMessages([]);
        toast.error(error.message);
      })
      .finally(() => setIsLoading(false));
  };

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
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
          setFile(null);
          if (textareaRef.current) textareaRef.current.style.height = "auto";
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
    const receiverId = RECEIVER_MAP[supportType] || "101658";
    const formattedMessage = inputValue.replace(/\n/g, "<br />");
    const formData = new FormData();
    formData.append("message", formattedMessage);
    formData.append("receiverId", receiverId);
    formData.append("senderId", userId);
    formData.append("file", file || "");
    formData.append("isResolved", "NO");
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
    if (ext === "pdf") window.open(fileUrl, "_blank");
    else { setCurrentImage(fileUrl); toggleModal(); }
  };

  const handleChatFileOpen = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    const fileUrl = imageBaseUrl + fileName;
    if (ext === "pdf") window.open(fileUrl, "_blank");
    else { setCurrentImage(fileUrl); toggleModal(); }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 130) + "px";
    }
  };

  return (
    <div className="page-content wa-page-wrap">
      {(addLoading || loading) && <ScreenLoader />}
      <div className="wa-page">

        {/* Header */}
        <div className="wa-header">
          <div className="wa-avatar">
            <SupportIcon size={20} />
            {/* <span className="wa-online-dot" /> */}
          </div>
          <div className="wa-header-info">
            <div className="wa-header-name">{receiverLabel}</div>
            <div className="wa-header-sub">
              {/* <span className="wa-header-sub-dot" /> */}
              {/* Online &middot; */}
              MoneyTree {receiverLabel} Team
            </div>
          </div>
          <button
            className="wa-header-action"
            onClick={getSupportList}
            title="Refresh messages"
          >
            <MdRefresh size={22} />
          </button>
        </div>

        {/* Messages */}
        <div className="wa-messages-bg" ref={chatBodyRef}>
          {messages.length === 0 ? (
            <div className="wa-empty-chat">
              <div className="wa-empty-icon-wrap">
                <SupportIcon size={42} />
              </div>
              <p className="wa-empty-title">No messages yet</p>
              <p className="wa-empty-sub">
                Send a message to start the conversation with {receiverLabel}
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
                  <div className="wa-bubble">
                    <span
                      className="wa-bubble-text"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          message.message.replace(/\n/g, "<br />")
                        ),
                      }}
                    />
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

        {/* Footer */}
        <div className="wa-footer">
          <div className="wa-footer-input-wrap">
            <button className="wa-icon-btn" onClick={handleAttachFile} title="Attach file">
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
              <div className="wa-file-chip" onClick={handleViewFile} title={file.name}>
                <AiOutlinePaperClip size={12} />
                {file.name}
              </div>
            )}
          </div>

          <button className="wa-send-btn" onClick={handleSendMessage} title="Send (Enter)">
            <IoMdSend size={20} />
          </button>
        </div>
      </div>

      {/* Hidden file input — outside footer to prevent mobile touch interference */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ position: "fixed", left: "-9999px", top: "-9999px", opacity: 0 }}
        onChange={handleFileChange}
        accept=".pdf, image/*"
      />

      <ImageModal isOpen={modalOpen} toggle={toggleModal} imageSrc={currentImage} />
    </div>
  );
}
