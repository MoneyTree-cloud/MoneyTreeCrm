/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { Modal, ModalBody, Input, } from "reactstrap";
import { FaSyncAlt, FaPaperPlane, FaTimes, } from "react-icons/fa";
import { GET_CANDIDATE_CHAT, SEND_CANDIDATE_CHAT } from "../helpers/url_helper";
import ApiClient from "../helpers/api_helper";
import ScreenLoader from "./ScreenLoader";
import { toast } from "react-toastify";
import { formatDateTime } from "../helpers/function_helper";
import { useUserStore } from "../store/useUserStore";
import { defaultTheme } from "../helpers/defaultTheme";

const ChatModal = ({ isOpen, onClose, candidateDetail }) => {

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);

    const { userId, empCode } = useUserStore((state) => state.user);

    const fetchMessages = async () => {
        if (!candidateDetail?.id) return;
        try {
            setLoading(true);
            const res = await ApiClient.get(
                `${GET_CANDIDATE_CHAT}?candidateId=${candidateDetail?.id}&receiverId=${userId}`
            );
            if (res?.data?.status === 1) {
                const list = (res.data.data || []).map((item) => ({
                    id: item.id,
                    senderId: item.sender?.userId,
                    employeeCode: String(item.sender?.employeeCode || ""),
                    senderName: `${item.sender?.name || "Unknown"} (${item.sender?.employeeCode || ""})`,
                    message: item.message,
                    sendAt: item.sendAt,
                }));
                setMessages(list);
            } else if (res.data.message === 'No chat found!') {
                setMessages([]);
            }
            else {
                setMessages([]);
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
        }
    }, [isOpen, candidateDetail?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) {
            toast.error("Please Enter Note...")
            return;
        }
        try {
            setLoading(true);
            const res = await ApiClient.post(
                `${SEND_CANDIDATE_CHAT}?candidateId=${candidateDetail?.id}&senderId=${userId}&message=${encodeURIComponent(
                    newMessage
                )}`
            );
            if (res?.data?.status === 1) {
                setNewMessage("");
                fetchMessages();
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
.chat-modal .modal-dialog{
    max-width:540px;
}

.chat-modal .modal-content{
    border:none;
    border-radius:16px;
    overflow:hidden;
    box-shadow:0 18px 45px rgba(0,0,0,.25);
}

/* Header */

.chat-header{
    background:#005b52;
    color:#fff;
    padding:12px 16px;
    display:flex;
    justify-content:space-between;
    align-items:center;
}

.chat-header h5{
    margin:0;
    font-size:15px;
    font-weight:400;
    color:#fff;
}

.chat-icons{
    display:flex;
    align-items:center;
    gap:18px;
}

.chat-icons svg{
    cursor:pointer;
    font-size:20px;
    transition:.2s;
}

.chat-icons svg:hover{
    transform:scale(1.12);
}

/* Body */

.chat-body{
    background:#f8f9fd;
    height:430px;
    overflow-y:auto;
    padding:18px;
}

.chat-empty{
    display:flex;
    justify-content:center;
    align-items:center;
    height:100%;
    color:#999;
    font-size:14px;
}

/* Messages */

.message-row{
    display:flex;
    flex-direction:column;
    margin-bottom:18px;
}

.message-row.self{
    align-items:flex-end;
}

.message-row.other{
    align-items:flex-start;
}

.sender-name{
    font-size:10px;
    font-weight:600;
    color:#a36b00;
    margin-bottom:5px;
}

.message-box{
    max-width:75%;
    background:#eef2ff;
    border-radius:14px;
    padding:12px 14px;
    box-shadow:0 2px 8px rgba(0,0,0,.08);
}

.message-row.self .message-box{
    background:#2563eb;
    color:#fff;
}

.message-text{
    font-size:12px;
    line-height:1.5;
    word-break:break-word;
}

.message-time{
    margin-top:6px;
    font-size:8px;
    opacity:.75;
    text-align:right;
}

/* Footer */

.chat-footer{
    display:flex;
    align-items:center;
    gap:10px;
    padding:14px;
    border-top:1px solid #ececec;
    background:#fff;
}

.chat-footer .form-control{
    flex:1;
    height:44px;
    border-radius:10px;
    border:1px solid #d8dce6;
}

.chat-footer .form-control:focus{
    box-shadow:none;
    border-color:#2563eb;
}

/* Send Button */

.send-btn{
    flex:0 0 46px;
    width:46px;
    height:44px;
    min-width:46px;
    border:none;
    outline:none;
    border-radius:10px;
    background:#26a3c0;
    display:flex !important;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    opacity:1 !important;
    visibility:visible !important;
    transition:.2s;
}

.send-btn svg{
    font-size:17px;
}

.send-btn:focus{
    outline:none;
    box-shadow:none;
}

.message-row.self{
    align-items:flex-end;
}

.message-row.other{
    align-items:flex-start;
}

.message-box{
    max-width:75%;
    padding:10px 14px;
    border-radius:12px;
    box-shadow:0 1px 3px rgba(0,0,0,.15);
    word-break:break-word;
}

/* My Messages */
.message-row.self .message-box{
    background:#dcf8c6;
    color:#222;
    border-bottom-right-radius:4px;
}

/* Others */
.message-row.other .message-box{
    background:#fff;
    color:#222;
    border-bottom-left-radius:4px;
}

.sender-name{
    font-size:11px;
    font-weight:600;
    margin-bottom:4px;
    color:#9b6b00;
}

.message-time{
    font-size:10px;
    color:#777;
    margin-top:4px;
    text-align:right;
}

`}</style>

            <Modal
                isOpen={isOpen}
                toggle={onClose}
                centered
                size="md"
                backdrop="static"
                className="chat-modal"
            >
                <ModalBody className="p-0">

                    {/* Header */}

                    <div className="chat-header">

                        <h5>
                            {candidateDetail?.firstName + ' (' + candidateDetail?.id + ')'}
                        </h5>

                        <div className="chat-icons">

                            <FaSyncAlt
                                size={17}
                                onClick={fetchMessages}
                            />

                            <FaTimes
                                size={18}
                                onClick={onClose}
                            />

                        </div>

                    </div>

                    {/* Body */}

                    <div className="chat-body">

                        {loading ? (

                            <ScreenLoader />

                        ) : messages.length === 0 ? (

                            <div className="chat-empty">
                                No messages yet.
                            </div>

                        ) : (

                            messages.map((msg) => {

                                const mine = String(msg.employeeCode) === String(empCode);

                                return (

                                    <div
                                        key={msg.id}
                                        className={`message-row ${mine ? "self" : "other"}`}
                                    >

                                        <div
                                            className="sender-name"
                                            style={{
                                                textAlign: mine ? "right" : "left"
                                            }}
                                        >
                                            {msg.senderName}
                                        </div>

                                        <div className="message-box">

                                            <div className="message-text">
                                                {msg.message}
                                            </div>

                                            <div className="message-time">
                                                {formatDateTime(msg.sendAt)}
                                            </div>

                                        </div>

                                    </div>

                                );

                            })
                        )}

                        <div ref={messagesEndRef} />

                    </div>

                    {/* Footer */}

                    <div className="chat-footer">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        />


                        <button
                            onClick={handleSendMessage}
                            title="Send Message"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                height: '40px', width: '40px',
                                justifyContent: 'center',
                                background: `${defaultTheme.primary}1A`,
                                color: defaultTheme.primary,
                                border: `1px solid ${defaultTheme.primary}40`,
                                borderRadius: 8,
                                cursor: 'pointer',
                                transition: 'background .15s, transform .1s',
                            }}
                        >
                            <FaPaperPlane size={13} />
                        </button>
                    </div>

                </ModalBody>
            </Modal>
        </>
    );
};

export default ChatModal;