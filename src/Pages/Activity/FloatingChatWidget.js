import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import ApiClient from '../../helpers/api_helper';
import { useUserStore } from '../../store/useUserStore';
import { MT_AI_CHAT, MT_AI_HISTORY, MT_AI_HISTORY_BY_ID } from '../../helpers/url_helper';
import AIResponseRenderer from "./AIResponseRenderer";
/* ─────────────────────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────────────────────── */
const Icon = {
    bot: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
            <line x1="8" y1="16" x2="8" y2="16" />
            <line x1="16" y1="16" x2="16" y2="16" />
        </svg>
    ),
    send: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
    ),
    close: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    mic: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="10" height="12" rx="3" />
            <path d="M19 10v2a7 7 0 01-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
    ),
    history: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <polyline points="3 3 3 8 8 8" />
            <polyline points="12 7 12 12 15 14" />
        </svg>
    ),
    plus: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    trash: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
        </svg>
    ),
    back: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    ),
    maximize: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M8 3H3v5" />
            <path d="M3 3l7 7" />
            <path d="M16 21h5v-5" />
            <path d="M21 21l-7-7" />
        </svg>
    ),

    minimize: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M14 10l7-7" />
            <path d="M21 3h-5" />
            <path d="M21 3v5" />
            <path d="M10 14l-7 7" />
            <path d="M3 21h5" />
            <path d="M3 21v-5" />
        </svg>
    ),
};

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */

function timeAgo(d) {
    if (!d) return '';
    const dt = new Date(d);
    const diff = Date.now() - dt.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day}d ago`;
    return dt.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/* ─────────────────────────────────────────────────────────────────────────────
   TYPING DOTS
───────────────────────────────────────────────────────────────────────────── */
function TypingDots() {
    return (
        <span className="mtw-typing">
            <span /><span /><span />
        </span>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function FloatingChatWidget() {
    const user = useUserStore((s) => s.user);
    const userName = user?.userName;

    const [open, setOpen] = useState(false);
    const [view, setView] = useState('chat');           // 'chat' | 'history'
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessId, setSessId] = useState(null);
    const [convHist, setConvHist] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [sessLoading, setSessLoading] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    // Voice recording state
    const [recording, setRecording] = useState(false);
    const [recSupported, setRecSupported] = useState(true);
    const recognitionRef = useRef(null);

    const chatScrollRef = useRef(null);
    const inputRef = useRef(null);
    const busy = useRef(false);

    /* Auto-scroll to bottom on new message */
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    /* Focus input on open */
    useEffect(() => {
        if (open && view === 'chat') {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open, view]);

    /* Detect Web Speech API support */
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        setRecSupported(!!SR);
    }, []);

    /* ── Sessions ──────────────────────────────────────────────────────── */
    const fetchSessions = useCallback(() => {
        setSessLoading(true);
        ApiClient.get(MT_AI_HISTORY)
            .then((resp) => {
                setSessLoading(false);
                if (resp.status === 200) {
                    setSessions(resp.data || []);
                } else if (resp.data?.message !== 'No record found.') {
                    setSessions([]);
                }
            })
            .catch(() => {
                setSessLoading(false);
                setSessions([]);
            });
    }, []);

    const openHistory = () => {
        setView('history');
        fetchSessions();
    };

    const openSession = (sid) => {
        ApiClient.get(`${MT_AI_HISTORY_BY_ID}${sid}`)
            .then((resp) => {
                if (resp?.status === 200) {
                    const msgs = resp.data || [];
                    setSessId(sid);
                    const hist = [];
                    const rendered = msgs.map((m) => {
                        hist.push({ role: m.role, content: m.content });
                        if (m.role === 'user') {
                            return { id: Math.random(), role: 'user', text: m.content };
                        }
                        return { id: Math.random(), role: 'assistant', data: { answer: m.content } };
                    });
                    setMessages(rendered);
                    setConvHist(hist);
                    setView('chat');
                } else {
                    toast.error(resp.data?.message || 'Could not load conversation');
                }
            })
            .catch((err) => toast.error(err.message || 'Failed to load'));
    };

    // const deleteSession = (sid, e) => {
    //     e.stopPropagation();
    //     if (!window.confirm('Delete this conversation?')) return;
    //     ApiClient.delete(`${MT_AI_HISTORY_BY_ID}${sid}`)
    //         .then((resp) => {
    //             if (resp.data?.status === 1) {
    //                 toast.success('Conversation deleted');
    //                 if (sid === sessId) startNew();
    //                 fetchSessions();
    //             } else {
    //                 toast.error(resp.data?.message || 'Failed to delete');
    //             }
    //         })
    //         .catch((err) => toast.error(err.message || 'Failed'));
    // };

    const startNew = () => {
        setSessId(null);
        setConvHist([]);
        setMessages([]);
        setView('chat');
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    /* ── Voice recording (Web Speech API) ──────────────────────────────── */
    const startRecording = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            toast.warn('Voice input not supported in this browser');
            return;
        }

        try {
            const rec = new SR();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-IN';

            rec.onstart = () => setRecording(true);
            rec.onend = () => {
                // If user didn't click stop, restart it automatically
                if (recognitionRef.current && recognitionRef.current._userStopped !== true) {
                    try { rec.start(); } catch { /* may throw if already started */ }
                } else {
                    setRecording(false);
                }
            };
            rec.onresult = (e) => {
                let transcript = '';
                for (let i = e.resultIndex; i < e.results.length; i++) {
                    transcript += e.results[i][0].transcript;
                }
                setInput(transcript);
                // Auto-resize textarea
                if (inputRef.current) {
                    inputRef.current.style.height = 'auto';
                    inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
                }
            };

            rec.onerror = (e) => {
                if (e.error === 'not-allowed') {
                    toast.error('Microphone permission denied');
                    setRecording(false);
                } else if (e.error === 'no-speech' || e.error === 'aborted') {
                    // These fire when silence is detected — let onend handle restart
                    return;
                } else {
                    toast.error(`Voice input error: ${e.error}`);
                    setRecording(false);
                }
            };

            recognitionRef.current = rec;
            recognitionRef.current._userStopped = false;
            rec.start();
        } catch (err) {
            setRecording(false);
            toast.error('Could not start voice input');
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current._userStopped = true;  // ← mark intentional stop
            try { recognitionRef.current.stop(); } catch { /* noop */ }
        }
        setRecording(false);
    };

    const toggleRecording = () => {
        if (recording) stopRecording();
        else startRecording();
    };

    /* ── Send message ──────────────────────────────────────────────────── */
    const sendMessage = useCallback((overrideText) => {
        const q = (overrideText || input).trim();
        if (!q || busy.current) return;
        busy.current = true;

        if (recording) stopRecording();
        setInput('');
        if (inputRef.current) inputRef.current.style.height = 'auto';

        const userMsg = { id: Date.now(), role: 'user', text: q };
        setMessages((prev) => [...prev, userMsg]);
        setIsTyping(true);

        const body = { question: q, conversation_history: convHist };
        if (sessId) body.session_id = sessId;

        ApiClient.post(MT_AI_CHAT, body)
            .then((resp) => {
                setIsTyping(false);
                busy.current = false;

                const responseData = resp.data || {};

                const answer = responseData.answer || "";

                const records = Array.isArray(responseData.data)
                    ? responseData.data
                    : [];

                const rowCount =
                    responseData.row_count ||
                    records.length ||
                    0;

                const isSuccess =
                    answer ||
                    records.length > 0;

                if (isSuccess) {

                    if (responseData.session_id && !sessId) {
                        setSessId(responseData.session_id);
                    }

                    setConvHist((prev) => [
                        ...prev,
                        {
                            role: "user",
                            content: q,
                        },
                        {
                            role: "assistant",
                            content: answer,
                        },
                    ]);

                    setMessages((prev) => [
                        ...prev,
                        {
                            id: Date.now(),
                            role: "assistant",
                            data: {
                                answer,
                                records,
                                row_count: rowCount,
                            },
                        },
                    ]);
                } else {

                    const errMsg =
                        responseData.message ||
                        "Could not process your request";

                    toast.error(errMsg);

                    setMessages((prev) => [
                        ...prev,
                        {
                            id: Date.now(),
                            role: "assistant",
                            data: {
                                answer: errMsg,
                                records: [],
                            },
                        },
                    ]);
                }
            })
            .catch((err) => {
                setIsTyping(false);
                busy.current = false;
                toast.error(err.message || 'Network error');
                setMessages((prev) => [
                    ...prev,
                    { id: Date.now() + 1, role: 'assistant', data: { answer: `**Error:** ${err.message || 'Network issue'}` } },
                ]);
            });
    }, [input, sessId, convHist, recording]);

    const onKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    };

    const resetWidget = () => {
        // Stop voice recording if active
        if (recording) {
            stopRecording();
        }

        busy.current = false;

        // Reset all chat state
        setMessages([]);
        setInput('');
        setIsTyping(false);
        setSessId(null);
        setConvHist([]);
        setView('chat');
        setIsMaximized(false);

        // Optional: keep or remove this
        // setSessions([]);
    };

    const toggleWidget = () => {
        if (open) {
            resetWidget();
        }

        setOpen(prev => !prev);
    };

    return (
        <>
            <style>{WIDGET_CSS}</style>

            {/* ══ FLOATING BUBBLE ══ */}
            {!open && (
                <button
                    className="mtw-bubble"
                    onClick={toggleWidget}
                    title="Ask MoneyTree AI"
                    aria-label="Open AI Assistant"
                >
                    {Icon.bot}
                    <span className="mtw-bubble-pulse" />
                </button>
            )}

            {/* ══ CHAT PANEL ══ */}
            {open && (
                <div className={`mtw-panel ${isMaximized ? "mtw-panel-max" : ""}`}>
                    {/* Header */}
                    <header className="mtw-header">
                        {view === 'history' ? (
                            <button
                                className="mtw-icon-btn mtw-header-back"
                                onClick={() => setView('chat')}
                                title="Back to chat"
                            >
                                {Icon.back}
                            </button>
                        ) : (
                            <div className="mtw-header-bot">
                                <div className="mtw-header-avatar">{Icon.bot}</div>
                                <div className="mtw-header-info">
                                    <div className="mtw-header-title">MoneyTree AI</div>
                                    <div className="mtw-header-status">
                                        <span className="mtw-status-dot" />
                                        Online
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mtw-header-actions">
                            {view === 'chat' && (
                                <>
                                    <button
                                        className="mtw-icon-btn"
                                        onClick={startNew}
                                        title="New chat"
                                    >
                                        {Icon.plus}
                                    </button>
                                    <button
                                        className="mtw-icon-btn"
                                        onClick={openHistory}
                                        title="History"
                                    >
                                        {Icon.history}
                                    </button>
                                </>
                            )}
                            <button
                                className="mtw-icon-btn"
                                onClick={() => setIsMaximized(!isMaximized)}
                                title={isMaximized ? "Restore" : "Maximize"}
                            >
                                {isMaximized ? Icon.minimize : Icon.maximize}
                            </button>
                            <button
                                className="mtw-icon-btn mtw-close"
                                onClick={toggleWidget}
                                title="Close"
                            >
                                {Icon.close}
                            </button>
                        </div>
                    </header>

                    {/* Body */}
                    {view === 'chat' ? (
                        <>
                            <div className="mtw-chat" ref={chatScrollRef}>
                                {messages.length === 0 ? (
                                    <div className="mtw-welcome">
                                        <div className="mtw-welcome-icon">{Icon.bot}</div>
                                        <div className="mtw-welcome-title">
                                            Hi{user ? `, ${userName.split(' ')[0]}` : ''}! 👋
                                        </div>
                                        <div className="mtw-welcome-sub">
                                            I'm your MoneyTree AI assistant. Ask me about sales, leads, attendance, or any SAP data.
                                        </div>
                                        {/* <div className="mtw-quick-actions">
                                            <button
                                                className="mtw-quick-btn"
                                                onClick={() => sendMessage("Show today's attendance summary")}
                                            >
                                                📊 Today's attendance
                                            </button>
                                            <button
                                                className="mtw-quick-btn"
                                                onClick={() => sendMessage('Top 5 leads by revenue this quarter')}
                                            >
                                                💰 Top leads by revenue
                                            </button>
                                            <button
                                                className="mtw-quick-btn"
                                                onClick={() => sendMessage('My pending follow-ups')}
                                            >
                                                🔔 My follow-ups
                                            </button>
                                        </div> */}
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((m) =>
                                            m.role === 'user' ? (
                                                <div className="mtw-msg mtw-msg-user" key={m.id}>
                                                    <div className="mtw-bubble-user">{m.text}</div>
                                                </div>
                                            ) : (
                                                <div className="mtw-msg mtw-msg-ai" key={m.id}>
                                                    <div className="mtw-ai-avatar">{Icon.bot}</div>
                                                    <div className="mtw-bubble-ai">
                                                        <AIResponseRenderer data={m.data} />
                                                    </div>
                                                </div>
                                            )
                                        )}

                                        {isTyping && (
                                            <div className="mtw-msg mtw-msg-ai">
                                                <div className="mtw-ai-avatar">{Icon.bot}</div>
                                                <div className="mtw-bubble-ai mtw-bubble-typing">
                                                    <TypingDots />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Input zone */}
                            <div className="mtw-input-zone">
                                {recording && (
                                    <div className="mtw-recording-banner">
                                        <span className="mtw-rec-dot" />
                                        <span>Listening… speak now</span>
                                    </div>
                                )}
                                <div className={`mtw-input-box ${recording ? 'mtw-input-recording' : ''}`}>
                                    <textarea
                                        ref={inputRef}
                                        className="mtw-textarea"
                                        placeholder={recording ? 'Listening…' : 'Ask anything…'}
                                        value={input}
                                        onChange={handleInputChange}
                                        onKeyDown={onKey}
                                        rows={1}
                                        disabled={isTyping}
                                    />
                                    {recSupported && (
                                        <button
                                            className={`mtw-mic-btn ${recording ? 'mtw-mic-active' : ''}`}
                                            onClick={toggleRecording}
                                            disabled={isTyping}
                                            title={recording ? 'Stop recording' : 'Voice input'}
                                        >
                                            {Icon.mic}
                                        </button>
                                    )}
                                    <button
                                        className={`mtw-send-btn ${input.trim() && !isTyping ? 'mtw-send-active' : ''}`}
                                        onClick={() => sendMessage()}
                                        disabled={!input.trim() || isTyping}
                                    >
                                        {Icon.send}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* History view */
                        <div className="mtw-history">
                            <div className="mtw-history-title">Recent Conversations</div>

                            {sessLoading ? (
                                <div className="mtw-empty">
                                    <TypingDots />
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="mtw-empty">
                                    <span style={{ fontSize: 30, marginBottom: 8 }}>💬</span>
                                    <span>No conversations yet</span>
                                </div>
                            ) : (
                                <div className="mtw-sess-list">
                                    {sessions.map((s) => (
                                        <div
                                            key={s.session_id}
                                            className={`mtw-sess-item ${s.session_id === sessId ? 'active' : ''}`}
                                            onClick={() => openSession(s.session_id)}
                                        >
                                            <div className="mtw-sess-content">
                                                <div className="mtw-sess-msg">
                                                    {(s.first_message || 'Conversation').substring(0, 60)}
                                                    {(s.first_message || '').length > 60 ? '…' : ''}
                                                </div>
                                                <div className="mtw-sess-meta">
                                                    <span>{timeAgo(s.last_at)}</span>
                                                    <span className="mtw-sess-dot">·</span>
                                                    <span>{s.message_count} message{s.message_count === 1 ? '' : 's'}</span>
                                                </div>
                                            </div>
                                            {/* <button
                                                className="mtw-sess-del"
                                                onClick={(e) => deleteSession(s.session_id, e)}
                                                title="Delete"
                                            >
                                                {Icon.trash}
                                            </button> */}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────────────────── */
const WIDGET_CSS = `
    /* ── Floating bubble ── */

    .mtw-show-more-btn{
    margin-top:10px;
    padding:6px 12px;
    border:none;
    border-radius:6px;
    background:#005B52;
    color:#fff;
    cursor:pointer;
    font-size:12px;
    font-weight:600;
}

.mtw-show-more-btn:hover{
    opacity:.9;
}

.mtw-table-wrapper{
    margin-top:12px;
    overflow:auto;
    max-height:350px;
    border:1px solid #E2E8F0;
    border-radius:8px;
}

.mtw-table{
    width:100%;
    border-collapse:collapse;
    font-size:12px;
}

.mtw-table th{
    position:sticky;
    top:0;
    background:#F8FAFC;
    padding:8px;
    text-align:left;
    border-bottom:1px solid #E2E8F0;
    white-space:nowrap;
    font-weight:600;
}

.mtw-table td{
    padding:8px;
    border-bottom:1px solid #F1F5F9;
    white-space:nowrap;
}

.mtw-table tr:hover{
    background:#F8FAFC;
}
    .mtw-bubble {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #005B52, #007A6E);
        color: #fff;
        border: none;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(0,91,82,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9998;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    .mtw-bubble:hover {
        transform: scale(1.08);
        box-shadow: 0 8px 24px rgba(0,91,82,0.45);
    }
    .mtw-bubble:active {
        transform: scale(0.95);
    }
    .mtw-bubble-pulse {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2px solid #007A6E;
        animation: mtwPulse 2s infinite;
        opacity: 0;
        pointer-events: none;
    }
    @keyframes mtwPulse {
        0%   { transform: scale(1);   opacity: 0.7; }
        100% { transform: scale(1.5); opacity: 0;   }
    }

    /* ── Chat panel ── */
    .mtw-panel {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 380px;
        height: 580px;
        max-height: calc(100vh - 48px);
        background: #FFFFFF;
        border-radius: 16px;
        box-shadow: 0 20px 50px rgba(15,23,42,0.25);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 9999;
        animation: mtwSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #0F172A;
    }
    @keyframes mtwSlideIn {
        from { opacity: 0; transform: translateY(20px) scale(0.95); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @media (max-width: 480px) {
        .mtw-panel {
            bottom: 0; right: 0; left: 0; top: 0;
            width: 100%; height: 100%; max-height: 100%;
            border-radius: 0;
        }
    }

    /* ── Header ── */
    .mtw-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        background: linear-gradient(135deg, #005B52, #007A6E);
        color: #fff;
        flex-shrink: 0;
    }
    .mtw-header-bot { display: flex; align-items: center; gap: 10px; }
    .mtw-header-avatar {
        width: 36px; height: 36px;
        background: rgba(255,255,255,0.15);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
    }
    .mtw-header-info { line-height: 1.2; }
    .mtw-header-title { font-size: 14px; font-weight: 700; }
    .mtw-header-status {
        font-size: 11px;
        opacity: 0.85;
        display: flex; align-items: center; gap: 5px;
        margin-top: 2px;
    }
    .mtw-status-dot {
        width: 7px; height: 7px;
        background: #4ADE80; border-radius: 50%;
        box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.25);
    }
    .mtw-header-actions { display: flex; gap: 4px; }
    .mtw-header-back { background: rgba(255,255,255,0.12); }

    .mtw-icon-btn {
        background: transparent;
        border: none;
        color: #fff;
        border-radius: 8px;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.15s;
    }
    .mtw-icon-btn:hover { background: rgba(255,255,255,0.18); }

    /* ── Chat scroll area ── */
    .mtw-chat {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #F8FAFC;
    }
    .mtw-chat::-webkit-scrollbar { width: 5px; }
    .mtw-chat::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
    .mtw-chat::-webkit-scrollbar-track { background: transparent; }

    /* ── Welcome ── */
    .mtw-welcome {
        display: flex; flex-direction: column; align-items: center;
        text-align: center;
        padding: 24px 12px;
    }
    .mtw-welcome-icon {
        width: 56px; height: 56px; border-radius: 50%;
        background: linear-gradient(135deg, #005B52, #007A6E);
        color: #fff;
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 12px;
        box-shadow: 0 4px 12px rgba(0,91,82,0.25);
    }
    .mtw-welcome-title {
        font-size: 17px; font-weight: 700;
        color: #0F172A;
        margin-bottom: 6px;
    }
    .mtw-welcome-sub {
        font-size: 13px;
        color: #64748B;
        line-height: 1.55;
        margin-bottom: 18px;
        max-width: 280px;
    }
    .mtw-quick-actions {
        display: flex; flex-direction: column;
        gap: 8px;
        width: 100%;
    }
    .mtw-quick-btn {
        background: #fff;
        border: 1.5px solid #E2E8F0;
        border-radius: 10px;
        padding: 10px 14px;
        font-size: 13px; font-weight: 600;
        color: #334155;
        cursor: pointer;
        text-align: left;
        transition: all 0.15s;
        font-family: inherit;
    }
    .mtw-quick-btn:hover {
        border-color: #005B52;
        background: #F0FDF9;
        color: #005B52;
    }

    /* ── Messages ── */
    .mtw-msg {
        display: flex; gap: 8px;
        margin-bottom: 12px;
    }
    .mtw-msg-user { justify-content: flex-end; }

    .mtw-ai-avatar {
        width: 30px; height: 30px;
        background: linear-gradient(135deg, #005B52, #007A6E);
        color: #fff;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        margin-top: 2px;
    }
    .mtw-ai-avatar svg { width: 18px; height: 18px; }

    .mtw-bubble-ai {
        background: #fff;
        border: 1px solid #E2E8F0;
        border-radius: 4px 14px 14px 14px;
        padding: 10px 14px;
        font-size: 14px;
        color: #1E293B;
        line-height: 1.5;
        max-width: 78%;
        word-break: break-word;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .mtw-bubble-ai code {
        background: #F1F5F9;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        font-family: 'Fira Code', monospace;
        color: #005B52;
    }
    .mtw-bubble-ai strong { font-weight: 700; color: #0F172A; }
    .mtw-bubble-ai em { font-style: italic; color: #005B52; }

    .mtw-bubble-typing {
        padding: 14px 16px;
    }

    .mtw-bubble-user {
        background: linear-gradient(135deg, #005B52, #007A6E);
        color: #fff;
        border-radius: 14px 14px 4px 14px;
        padding: 10px 14px;
        font-size: 14px;
        line-height: 1.5;
        max-width: 78%;
        word-break: break-word;
        box-shadow: 0 2px 6px rgba(0,91,82,0.2);
    }

    /* ── Typing dots ── */
    .mtw-typing {
        display: inline-flex; gap: 4px; align-items: center;
    }
    .mtw-typing span {
        width: 6px; height: 6px;
        background: #005B52;
        border-radius: 50%;
        animation: mtwBounce 1.2s infinite ease-in-out;
    }
    .mtw-typing span:nth-child(2) { animation-delay: 0.18s; }
    .mtw-typing span:nth-child(3) { animation-delay: 0.36s; }
    @keyframes mtwBounce {
        0%,60%,100% { transform: translateY(0); opacity: 0.4; }
        30%         { transform: translateY(-5px); opacity: 1; }
    }

    /* ── Input zone ── */
    .mtw-input-zone {
        padding: 10px 12px 12px;
        background: #fff;
        border-top: 1px solid #E2E8F0;
        flex-shrink: 0;
    }

    .mtw-recording-banner {
        display: flex; align-items: center; gap: 8px;
        background: #FEE2E2;
        color: #991B1B;
        padding: 6px 12px;
        border-radius: 8px;
        margin-bottom: 8px;
        font-size: 12px;
        font-weight: 600;
        animation: mtwBlink 1.6s infinite;
    }
    @keyframes mtwBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    .mtw-rec-dot {
        width: 8px; height: 8px;
        background: #DC2626;
        border-radius: 50%;
        animation: mtwPulseDot 1s infinite;
    }
    @keyframes mtwPulseDot {
        0%, 100% { transform: scale(1); opacity: 1; }
        50%      { transform: scale(1.3); opacity: 0.6; }
    }

    .mtw-input-box {
        display: flex; align-items: flex-end;
        gap: 6px;
        background: #F8FAFC;
        border: 1.5px solid #E2E8F0;
        border-radius: 12px;
        padding: 6px 6px 6px 14px;
        transition: border-color 0.15s, box-shadow 0.15s;
    }
    .mtw-input-box:focus-within {
        border-color: #005B52;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(0, 91, 82, 0.08);
    }
    .mtw-input-recording {
        border-color: #DC2626 !important;
        background: #fff !important;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.08) !important;
    }

    .mtw-textarea {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        resize: none;
        font-family: inherit;
        font-size: 14px;
        color: #0F172A;
        line-height: 1.45;
        min-height: 22px;
        max-height: 120px;
        padding: 6px 0;
    }
    .mtw-textarea::placeholder { color: #94A3B8; }
    .mtw-textarea::-webkit-scrollbar { width: 3px; }
    .mtw-textarea::-webkit-scrollbar-thumb { background: #CBD5E1; }

    .mtw-mic-btn, .mtw-send-btn {
        // width: 34px; height: 34px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        background: #F1F5F9;
        color: #64748B;
        flex-shrink: 0;
        transition: all 0.15s;
    }
    .mtw-mic-btn:hover:not(:disabled),
    .mtw-send-btn:hover:not(:disabled) {
        background: #E2E8F0;
        color: #334155;
    }
    .mtw-mic-active {
        background: #DC2626 !important;
        color: #fff !important;
        animation: mtwBlink 1.6s infinite;
    }
    .mtw-send-active {
        background: linear-gradient(135deg, #005B52, #007A6E) !important;
        color: #fff !important;
        box-shadow: 0 2px 6px rgba(0,91,82,0.25);
    }
    .mtw-send-active:hover { opacity: 0.92; }
    .mtw-send-btn:disabled, .mtw-mic-btn:disabled { cursor: not-allowed; opacity: 0.6; }

    /* ── History view ── */
    .mtw-history {
        flex: 1;
        overflow-y: auto;
        padding: 16px 14px;
        background: #F8FAFC;
    }
    .mtw-history::-webkit-scrollbar { width: 5px; }
    .mtw-history::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }

    .mtw-history-title {
        font-size: 11px;
        font-weight: 700;
        color: #94A3B8;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 10px;
        padding: 0 4px;
    }

    .mtw-empty {
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 60px 20px;
        color: #94A3B8;
        font-size: 13px;
        gap: 6px;
    }

    .mtw-sess-list { display: flex; flex-direction: column; gap: 6px; }

    .mtw-sess-item {
        display: flex; align-items: center; gap: 8px;
        background: #fff;
        border: 1.5px solid #E2E8F0;
        border-radius: 10px;
        padding: 10px 12px;
        cursor: pointer;
        transition: all 0.15s;
    }
    .mtw-sess-item:hover {
        border-color: #005B52;
        background: #F0FDF9;
    }
    .mtw-sess-item.active {
        border-color: #005B52;
        background: #ECFDF5;
    }

    .mtw-sess-content { flex: 1; min-width: 0; }
    .mtw-sess-msg {
        font-size: 13px; font-weight: 600;
        color: #1E293B;
        line-height: 1.35;
        margin-bottom: 3px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
    }
    .mtw-sess-meta {
        display: flex; align-items: center; gap: 4px;
        font-size: 11px;
        color: #94A3B8;
    }
    .mtw-sess-dot { opacity: 0.6; }

    .mtw-sess-del {
        background: transparent;
        border: none;
        color: #94A3B8;
        cursor: pointer;
        padding: 6px;
        border-radius: 6px;
        flex-shrink: 0;
        display: flex; align-items: center;
        transition: color 0.15s, background 0.15s;
    }
    .mtw-sess-del:hover { color: #DC2626; background: #FEE2E2; }
    .mtw-panel-max {
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;

    width: auto !important;
    height: auto !important;
    max-width: none;
    max-height: none;

    border-radius: 12px;
    animation: none;
}

.mtw-panel-max .mtw-chat {
    flex: 1;
}

.mtw-panel-max .mtw-bubble-ai,
.mtw-panel-max .mtw-bubble-user {
    max-width: 90%;
}
`;