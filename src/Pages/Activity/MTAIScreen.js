import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Container } from 'reactstrap'
import { toast } from 'react-toastify'
import PageContent from '../../components/Common/PageContent'
import ApiClient from '../../helpers/api_helper'
import { useUserStore } from '../../store/useUserStore'
import {
    MT_AI_CHAT,
    MT_AI_HISTORY,
    MT_AI_HISTORY_BY_ID,
} from '../../helpers/url_helper'

/* ─────────────────────────────────────────────────────────────────────────────
   SUGGESTION CARDS (role-based)
───────────────────────────────────────────────────────────────────────────── */
const SUGGESTIONS_MAP = {
    MAIN_TL: [
        { icon: '📊', title: 'Attendance Summary', text: "Show today's attendance summary for all teams" },
        { icon: '🏆', title: 'Top Performing Team', text: 'Which sub-team has the highest sales this month?' },
        { icon: '💰', title: 'Top Leads by Revenue', text: 'List top 5 leads by revenue this quarter' },
        { icon: '📈', title: 'Team Performance', text: 'Compare sub-team performance this week' },
    ],
    SUB_TL: [
        { icon: '🗓', title: "Team's Attendance", text: "Show my team's attendance today" },
        { icon: '⭐', title: 'Top Performers', text: 'Who are the top performers this month?' },
        { icon: '📋', title: 'Open Leads', text: "List my team's open leads" },
        { icon: '📈', title: 'Revenue Trend', text: 'Show revenue trend for my sub-team' },
    ],
    EMPLOYEE: [
        { icon: '💼', title: 'My Sales', text: 'Show my sales this month' },
        { icon: '🔔', title: 'Follow-ups', text: 'What are my pending follow-ups?' },
        { icon: '📅', title: 'My Attendance', text: 'Show my attendance for this week' },
        { icon: '✅', title: 'Closed Leads', text: 'How many leads did I close?' },
    ],
    DEFAULT: [
        { icon: '📊', title: 'Attendance Summary', text: "Show today's attendance summary" },
        { icon: '🏆', title: 'Sales Performance', text: 'Which team has the highest sales this month?' },
        { icon: '💰', title: 'Top Leads', text: 'List top 5 leads by revenue' },
        { icon: '📈', title: 'Team Comparison', text: 'Compare team performance this week' },
    ],
}

/* ─────────────────────────────────────────────────────────────────────────────
   MARKDOWN RENDERER (unchanged from original)
───────────────────────────────────────────────────────────────────────────── */
function renderMarkdown(text) {
    if (!text) return ''
    let html = text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^### (.+)$/gm, '<h4 class="md-h4">$1</h4>')
        .replace(/^## (.+)$/gm, '<h3 class="md-h3">$1</h3>')
        .replace(/^# (.+)$/gm, '<h2 class="md-h2">$1</h2>')
        .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
        .replace(/^\d+\. (.+)$/gm, '<li class="ol">$1</li>')
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        .replace(/^---$/gm, '<hr/>')
        .replace(/\n\n+/g, '</p><p>')
        .replace(/\n/g, '<br/>')
    html = html.replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gs, '<ul>$1</ul>')
    html = html.replace(/<\/ul>\s*<ul>/g, '')
    return `<p>${html}</p>`
}

/* ─────────────────────────────────────────────────────────────────────────────
   DATE GROUPING
───────────────────────────────────────────────────────────────────────────── */
function formatDate(d) {
    if (!d) return ''
    const dt = new Date(d)
    const diff = Math.floor((Date.now() - dt) / 86400000)
    if (diff === 0) return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (diff === 1) return 'Yesterday'
    if (diff < 7) return dt.toLocaleDateString([], { weekday: 'short' })
    return dt.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

/* ─────────────────────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────────────────────── */
const Icon = {
    send: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
    ),
    plus: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    trash: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
        </svg>
    ),
    copy: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
    ),
    check: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    chevron: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    ),
    sql: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
    ),
    table: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" />
        </svg>
    ),
    sidebar: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
        </svg>
    ),
    refresh: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
        </svg>
    ),
    sparkles: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
            <path d="M19 13l.7 2.1L22 16l-2.3.9L19 19l-.7-2.1L16 16l2.3-.9z" />
        </svg>
    ),
}

/* ─────────────────────────────────────────────────────────────────────────────
   TYPING DOTS
───────────────────────────────────────────────────────────────────────────── */
function TypingDots() {
    return (
        <span className="mt-typing">
            <span /><span /><span />
        </span>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────────────────────────────────────────── */
function CopyBtn({ text }) {
    const [copied, setCopied] = useState(false)
    const copy = () => {
        navigator.clipboard?.writeText(text).catch(() => { })
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    return (
        <button className="mt-icon-btn" onClick={copy} title="Copy">
            {copied ? Icon.check : Icon.copy}
        </button>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   DATA TABLE
───────────────────────────────────────────────────────────────────────────── */
function DataTable({ data }) {
    if (!data || data.length === 0 || data.length > 50) return null
    const keys = Object.keys(data[0])
    return (
        <div className="mt-table-outer">
            <div className="mt-table-header">
                {Icon.table}
                <span>{data.length} rows · {keys.length} columns</span>
            </div>
            <div className="mt-table-scroll">
                <table className="mt-table">
                    <thead>
                        <tr>{keys.map(k => <th key={k}>{k}</th>)}</tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i}>
                                {keys.map(k => {
                                    const v = row[k] != null ? String(row[k]) : '—'
                                    return <td key={k} title={v}>{v}</td>
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SQL BLOCK
───────────────────────────────────────────────────────────────────────────── */
function SqlBlock({ sql, rowCount, database }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="mt-sql-wrap">
            <button className="mt-sql-toggle" onClick={() => setOpen(o => !o)}>
                {Icon.sql}
                <span>SQL Query</span>
                {rowCount !== undefined && <span className="mt-sql-meta">{rowCount} rows</span>}
                {database && <span className="mt-sql-meta">{database}</span>}
                <span style={{ marginLeft: 'auto', opacity: 0.5, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>{Icon.chevron}</span>
            </button>
            {open && (
                <div className="mt-sql-body">
                    <pre><code>{sql}</code></pre>
                    <CopyBtn text={sql} />
                </div>
            )}
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   ASSISTANT MESSAGE
───────────────────────────────────────────────────────────────────────────── */
function AssistantMsg({ data, isLatest }) {
    const answer = data.answer || ''
    return (
        <div className="mt-msg-row mt-msg-ai">
            <div className="mt-ai-avatar">
                <span>🌳</span>
            </div>
            <div className="mt-msg-body">
                <div className="mt-ai-label">MoneyTree AI</div>
                <div
                    className="mt-ai-text"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(answer) }}
                />
                {data.sql && (
                    <SqlBlock sql={data.sql} rowCount={data.row_count} database={data.database} />
                )}
                {data.data && data.data.length > 0 && (
                    <DataTable data={data.data} />
                )}
                <div className="mt-msg-actions">
                    <CopyBtn text={answer} />
                </div>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   USER MESSAGE
───────────────────────────────────────────────────────────────────────────── */
function UserMsg({ text, userInitial }) {
    return (
        <div className="mt-msg-row mt-msg-user">
            <div className="mt-msg-body mt-user-body">
                <div className="mt-user-bubble">
                    <p>{text}</p>
                </div>
                <div className="mt-user-avatar">{userInitial}</div>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SESSION ITEM (sidebar)
───────────────────────────────────────────────────────────────────────────── */
function SessItem({ session, active, onSelect, onDelete }) {
    const [hov, setHov] = useState(false)
    const preview = (session.first_message || 'Chat').substring(0, 38) +
        ((session.first_message || '').length > 38 ? '…' : '')
    return (
        <div
            className={`mt-sess-item ${active ? 'mt-sess-active' : ''} ${hov ? 'mt-sess-hov' : ''}`}
            onClick={onSelect}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
        >
            <div className="mt-sess-content">
                <div className="mt-sess-preview">{preview}</div>
                <div className="mt-sess-date">{formatDate(session.last_at)}</div>
            </div>
            {(hov || active) && (
                <button
                    className="mt-sess-del"
                    onClick={e => { e.stopPropagation(); onDelete() }}
                    title="Delete"
                >
                    {Icon.trash}
                </button>
            )}
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function MTAIScreen() {
    const user = useUserStore(state => state.user)
    const userInitial = (user?.userName || user?.name || 'U')[0].toUpperCase()
    const suggestions = SUGGESTIONS_MAP[user?.role] || SUGGESTIONS_MAP.DEFAULT

    const [messages, setMessages] = useState([])
    const [isTyping, setIsTyping] = useState(false)
    const [input, setInput] = useState('')
    const [sessId, setSessId] = useState(null)
    const [convHist, setConvHist] = useState([])
    const [title, setTitle] = useState('New conversation')
    const [sessions, setSessions] = useState([])
    const [sessLoad, setSessLoad] = useState(false)
    const [sideOpen, setSideOpen] = useState(true)

    const chatRef = useRef(null)
    const inputRef = useRef(null)
    const busy = useRef(false)

    /* Scroll to bottom on new message */
    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
    }, [messages, isTyping])

    /* Initial load */
    useEffect(() => {
        fetchSessions()
        inputRef.current?.focus()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleInputChange = e => {
        setInput(e.target.value)
        e.target.style.height = 'auto'
        e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
    }

    /* ── API: sessions list ────────────────────────────────────────────── */
    const fetchSessions = () => {
        setSessLoad(true)
        ApiClient.get(MT_AI_HISTORY)
            .then(resp => {
                setSessLoad(false)
                if (resp.data && resp.data.status === 1) {
                    setSessions(resp.data.data || [])
                } else if (resp.data?.message !== 'No record found.') {
                    toast.error(resp.data?.message || 'Error fetching conversations')
                    setSessions([])
                }
            })
            .catch(err => {
                setSessLoad(false)
                toast.error(err.message || 'Failed to load conversations')
                setSessions([])
            })
    }

    /* ── API: open a session ───────────────────────────────────────────── */
    const openSession = (sid, hint) => {
        ApiClient.get(`${MT_AI_HISTORY_BY_ID}${sid}`)
            .then(resp => {
                if (resp.data && resp.data.status === 1) {
                    const msgs = resp.data.data || []
                    setSessId(sid)
                    setTitle(hint || 'Conversation')
                    const hist = []
                    const rendered = msgs.map(m => {
                        hist.push({ role: m.role, content: m.content })
                        if (m.role === 'user') return { id: Math.random(), role: 'user', text: m.content }
                        return { id: Math.random(), role: 'assistant', data: { answer: m.content, sql: m.sql_query } }
                    })
                    setMessages(rendered)
                    setConvHist(hist)
                } else if (resp.data?.message !== 'No record found.') {
                    toast.error(resp.data?.message || 'Could not load conversation')
                }
            })
            .catch(err => {
                toast.error(err.message || 'Failed to load conversation')
            })
    }

    /* ── API: delete session ───────────────────────────────────────────── */
    const deleteSession = (sid) => {
        if (!window.confirm('Delete this conversation?')) return
        ApiClient.delete(`${MT_AI_HISTORY_BY_ID}${sid}`)
            .then(resp => {
                if (resp.data && resp.data.status === 1) {
                    toast.success(resp.data.message || 'Conversation deleted')
                    if (sid === sessId) startNew()
                    fetchSessions()
                } else {
                    toast.error(resp.data?.message || 'Could not delete conversation')
                }
            })
            .catch(err => {
                toast.error(err.message || 'Failed to delete conversation')
            })
    }

    /* ── Start fresh chat ──────────────────────────────────────────────── */
    const startNew = useCallback(() => {
        setSessId(null); setConvHist([])
        setMessages([]); setTitle('New conversation')
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.value = ''
                inputRef.current.style.height = 'auto'
                inputRef.current.focus()
            }
        }, 30)
    }, [])

    /* ── API: send message ─────────────────────────────────────────────── */
    const sendMessage = useCallback(() => {
        const q = input.trim()
        if (!q || busy.current) return
        busy.current = true
        setInput('')
        if (inputRef.current) inputRef.current.style.height = 'auto'

        const userMsg = { id: Date.now(), role: 'user', text: q }
        setMessages(prev => [...prev, userMsg])
        setIsTyping(true)

        const body = { question: q, conversation_history: convHist }
        if (sessId) body.session_id = sessId

        ApiClient.post(MT_AI_CHAT, body)
            .then(resp => {
                setIsTyping(false)
                busy.current = false
                if (resp.data && resp.data.status === 1) {
                    const data = resp.data.data || {}
                    if (data.session_id) {
                        const isNew = !sessId
                        setSessId(data.session_id)
                        if (isNew) fetchSessions()
                    }
                    setConvHist(prev => [
                        ...prev,
                        { role: 'user', content: q },
                        { role: 'assistant', content: data.answer || '' },
                    ])
                    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', data }])
                    setTitle(prev => prev === 'New conversation'
                        ? q.substring(0, 45) + (q.length > 45 ? '…' : '')
                        : prev)
                } else {
                    const errMsg = resp.data?.message || 'Could not process your request'
                    toast.error(errMsg)
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1, role: 'assistant',
                        data: { answer: `**${errMsg}**\n\nPlease try rephrasing your question.` },
                    }])
                }
                setTimeout(() => inputRef.current?.focus(), 40)
            })
            .catch(err => {
                setIsTyping(false)
                busy.current = false
                toast.error(err.message || 'API error')
                setMessages(prev => [...prev, {
                    id: Date.now() + 1, role: 'assistant',
                    data: { answer: `**Error:** ${err.message || 'Network error'}\n\nPlease try again.` },
                }])
                setTimeout(() => inputRef.current?.focus(), 40)
            })
    }, [input, sessId, convHist])

    const onKey = e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
    }

    const onSuggestion = s => {
        setInput(s.text)
        setTimeout(sendMessage, 30)
    }

    /* Role badge colour */
    const roleColor = {
        MAIN_TL: '#005B52',
        SUB_TL: '#B8862B',
        EMPLOYEE: '#0369A1',
    }[user?.role] || '#005B52'

    const scopeText = user ? ({
        MAIN_TL: `Main TL · ${user.mainTeam || user.main_team || ''}`,
        SUB_TL: `Sub TL · ${user.subTeam || user.sub_team || ''}`,
        EMPLOYEE: 'Employee',
    }[user.role] || '') : ''

    return (
        <PageContent>
            <style>{GLOBAL_CSS}</style>
            <Container fluid style={{ padding: 0 }}>
                <div className="mt-root">

                    {/* ══ SIDEBAR ══════════════════════════════════════════ */}
                    <aside className={`mt-sidebar ${sideOpen ? 'mt-sidebar-open' : 'mt-sidebar-closed'}`}>

                        <div className="mt-side-top">
                            <button className="mt-toggle-btn" onClick={() => setSideOpen(o => !o)} title="Toggle sidebar">
                                {Icon.sidebar}
                            </button>
                            {sideOpen && (
                                <button className="mt-new-chat-btn" onClick={startNew}>
                                    {Icon.plus}
                                    <span>New chat</span>
                                </button>
                            )}
                        </div>

                        {sideOpen && (
                            <>
                                <div className="mt-side-scroll">
                                    {sessLoad ? (
                                        <div className="mt-sess-empty">
                                            <TypingDots />
                                        </div>
                                    ) : sessions.length === 0 ? (
                                        <div className="mt-sess-empty">
                                            <span style={{ fontSize: 28, marginBottom: 8 }}>💬</span>
                                            <span>No conversations yet</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mt-sess-group-label">Recent</div>
                                            {sessions.map(s => (
                                                <SessItem
                                                    key={s.session_id}
                                                    session={s}
                                                    active={s.session_id === sessId}
                                                    onSelect={() => {
                                                        const hint = (s.first_message || '').substring(0, 45) +
                                                            ((s.first_message || '').length > 45 ? '…' : '')
                                                        openSession(s.session_id, hint || 'Conversation')
                                                    }}
                                                    onDelete={() => deleteSession(s.session_id)}
                                                />
                                            ))}
                                        </>
                                    )}
                                </div>

                                {user && (
                                    <div className="mt-side-user">
                                        <div className="mt-side-avatar" style={{ background: roleColor }}>
                                            {userInitial}
                                        </div>
                                        <div className="mt-side-user-info">
                                            <div className="mt-side-uname">{user.userName || user.name}</div>
                                            <div className="mt-side-umeta">{scopeText}</div>
                                        </div>
                                        <div className="mt-role-dot" style={{ background: roleColor }} />
                                    </div>
                                )}
                            </>
                        )}
                    </aside>

                    {/* ══ MAIN PANEL ═══════════════════════════════════════ */}
                    <main className="mt-main">

                        <header className="mt-header">
                            {!sideOpen && (
                                <button className="mt-toggle-btn" onClick={() => setSideOpen(true)} title="Open sidebar">
                                    {Icon.sidebar}
                                </button>
                            )}
                            <div className="mt-header-brand">
                                <span className="mt-brand-mark">{Icon.sparkles}</span>
                                <span className="mt-header-title">{title}</span>
                            </div>
                            <div className="mt-header-right">
                                {user?.role && (
                                    <span className="mt-role-badge" style={{
                                        color: roleColor,
                                        borderColor: roleColor + '40',
                                        background: roleColor + '12',
                                    }}>
                                        <span className="mt-role-dot-sm" style={{ background: roleColor }} />
                                        {user.role.replace(/_/g, ' ')}
                                    </span>
                                )}
                            </div>
                        </header>

                        <div className="mt-chat" ref={chatRef}>
                            <div className="mt-chat-inner">

                                {messages.length === 0 && (
                                    <div className="mt-welcome">
                                        <div className="mt-welcome-logo">🌳</div>
                                        <h2 className="mt-welcome-title">
                                            {user ? `Hello, ${(user.userName || user.name || 'there').split(' ')[0]}` : 'MoneyTree AI'}
                                        </h2>
                                        <p className="mt-welcome-sub">
                                            Ask me anything about your CRM data — sales, leads, attendance, revenue &amp; more.
                                        </p>

                                        <div className="mt-suggestion-grid">
                                            {suggestions.map((s, i) => (
                                                <button
                                                    key={i}
                                                    className="mt-suggestion-card"
                                                    onClick={() => onSuggestion(s)}
                                                >
                                                    <span className="mt-sug-icon">{s.icon}</span>
                                                    <span className="mt-sug-title">{s.title}</span>
                                                    <span className="mt-sug-text">{s.text}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {messages.map((m, idx) =>
                                    m.role === 'user'
                                        ? <UserMsg key={m.id} text={m.text} userInitial={userInitial} />
                                        : <AssistantMsg key={m.id} data={m.data} isLatest={idx === messages.length - 1} />
                                )}

                                {isTyping && (
                                    <div className="mt-msg-row mt-msg-ai">
                                        <div className="mt-ai-avatar"><span>🌳</span></div>
                                        <div className="mt-msg-body">
                                            <div className="mt-ai-label">MoneyTree AI</div>
                                            <div className="mt-typing-bubble"><TypingDots /></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-input-zone">
                            <div className="mt-input-box">
                                <textarea
                                    ref={inputRef}
                                    className="mt-textarea"
                                    placeholder="Message MoneyTree AI…"
                                    value={input}
                                    onChange={handleInputChange}
                                    onKeyDown={onKey}
                                    rows={1}
                                />
                                <button
                                    className={`mt-send-btn ${input.trim() && !isTyping ? 'mt-send-active' : ''}`}
                                    onClick={sendMessage}
                                    disabled={!input.trim() || isTyping}
                                    title="Send (Enter)"
                                >
                                    {Icon.send}
                                </button>
                            </div>
                            <p className="mt-disclaimer">
                                MoneyTree AI can make mistakes. Data reflects your hierarchy access level.
                            </p>
                        </div>

                    </main>
                </div>
            </Container>
        </PageContent>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL CSS — LIGHT MONEYTREE THEME
───────────────────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  /* Reset within component */
  .mt-root * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Root layout ── */
  .mt-root {
    display: flex;
    height: calc(100vh - 70px);
    background: #F4F7F9;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #0F172A;
    overflow: hidden;
  }

  /* ─────────── SIDEBAR ─────────── */
  .mt-sidebar {
    background: #FFFFFF;
    border-right: 1px solid #E2E8F0;
    display: flex;
    flex-direction: column;
    transition: width .25s ease;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 1px 0 3px rgba(0,0,0,.02);
  }
  .mt-sidebar-open   { width: 268px; }
  .mt-sidebar-closed { width: 52px; }

  .mt-side-top {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 12px;
    border-bottom: 1px solid #F1F5F9;
    flex-shrink: 0;
  }

  .mt-toggle-btn {
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    background: transparent; border: none;
    color: #64748B; cursor: pointer; border-radius: 8px;
    transition: background .15s, color .15s;
    flex-shrink: 0;
  }
  .mt-toggle-btn:hover { background: #F1F5F9; color: #005B52; }

  .mt-new-chat-btn {
    flex: 1; display: flex; align-items: center; gap: 8px;
    padding: 8px 14px;
    background: linear-gradient(135deg, #005B52, #007A6E);
    border: none;
    border-radius: 9px;
    color: #fff; font-size: 13px; font-weight: 700;
    cursor: pointer;
    transition: opacity .15s, transform .1s;
    white-space: nowrap; overflow: hidden;
    box-shadow: 0 2px 6px rgba(0,91,82,.18);
  }
  .mt-new-chat-btn:hover { opacity: .92; }
  .mt-new-chat-btn:active { transform: scale(.98); }

  .mt-side-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 8px 8px;
  }
  .mt-side-scroll::-webkit-scrollbar { width: 5px; }
  .mt-side-scroll::-webkit-scrollbar-track { background: transparent; }
  .mt-side-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }

  .mt-sess-group-label {
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1px;
    color: #94A3B8; padding: 8px 10px 6px;
  }

  .mt-sess-empty {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 50px 16px; color: #94A3B8; font-size: 13px; gap: 6px;
    text-align: center;
  }

  .mt-sess-item {
    display: flex; align-items: center;
    padding: 9px 11px; border-radius: 9px;
    cursor: pointer; gap: 8px;
    margin-bottom: 2px;
    transition: background .15s;
    position: relative;
    border: 1px solid transparent;
  }
  .mt-sess-item:hover, .mt-sess-hov {
    background: #F0FDF9;
    border-color: #B7E4C7;
  }
  .mt-sess-active {
    background: #ECFDF5 !important;
    border-color: #005B52 !important;
  }

  .mt-sess-content { flex: 1; overflow: hidden; }
  .mt-sess-preview {
    font-size: 13px; color: #334155;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    font-weight: 500;
  }
  .mt-sess-active .mt-sess-preview { color: #005B52; font-weight: 600; }
  .mt-sess-date { font-size: 11px; color: #94A3B8; margin-top: 2px; }

  .mt-sess-del {
    background: none; border: none;
    color: #94A3B8; cursor: pointer; padding: 5px;
    border-radius: 5px; flex-shrink: 0;
    transition: color .15s, background .15s;
    display: flex; align-items: center;
  }
  .mt-sess-del:hover { color: #DC2626; background: #FEE2E2; }

  /* Sidebar user */
  .mt-side-user {
    display: flex; align-items: center; gap: 11px;
    padding: 13px 14px;
    border-top: 1px solid #F1F5F9;
    flex-shrink: 0;
    background: #FAFBFC;
  }
  .mt-side-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; color: #fff; flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(0,0,0,.1);
  }
  .mt-side-user-info { flex: 1; overflow: hidden; }
  .mt-side-uname { font-size: 13px; font-weight: 700; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mt-side-umeta { font-size: 11px; color: #64748B; margin-top: 1px; }
  .mt-role-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  /* ─────────── MAIN PANEL ─────────── */
  .mt-main {
    flex: 1; display: flex; flex-direction: column;
    overflow: hidden; background: #F4F7F9;
    min-width: 0;
  }

  /* Header */
  .mt-header {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 24px;
    background: #FFFFFF;
    border-bottom: 1px solid #E2E8F0;
    flex-shrink: 0;
    min-height: 56px;
    box-shadow: 0 1px 3px rgba(0,0,0,.02);
  }
  .mt-header-brand {
    display: flex; align-items: center; gap: 10px;
    flex: 1; min-width: 0;
  }
  .mt-brand-mark {
    width: 30px; height: 30px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #005B52, #007A6E);
    color: #fff; border-radius: 8px;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(0,91,82,.2);
  }
  .mt-header-title {
    font-size: 14px; font-weight: 600; color: #334155;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .mt-header-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .mt-role-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 20px;
    font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .5px;
    border: 1px solid;
  }
  .mt-role-dot-sm { width: 6px; height: 6px; border-radius: 50%; }

  /* Chat area */
  .mt-chat {
    flex: 1; overflow-y: auto;
    background: #F4F7F9;
  }
  .mt-chat::-webkit-scrollbar { width: 6px; }
  .mt-chat::-webkit-scrollbar-track { background: transparent; }
  .mt-chat::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }

  .mt-chat-inner {
    max-width: 840px;
    margin: 0 auto;
    padding: 32px 24px 16px;
    display: flex; flex-direction: column; gap: 0;
  }

  /* Welcome */
  .mt-welcome {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: 40px 20px 48px;
  }
  .mt-welcome-logo {
    font-size: 52px;
    margin-bottom: 18px;
    filter: drop-shadow(0 4px 8px rgba(0,91,82,.15));
  }
  .mt-welcome-title {
    font-size: 30px; font-weight: 800;
    background: linear-gradient(135deg, #005B52, #007A6E);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 12px; letter-spacing: -.5px;
  }
  .mt-welcome-sub {
    font-size: 15px; color: #64748B; line-height: 1.65;
    max-width: 460px; margin-bottom: 40px;
  }

  /* Suggestion grid */
  .mt-suggestion-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    width: 100%;
    max-width: 580px;
  }
  .mt-suggestion-card {
    display: flex; flex-direction: column; align-items: flex-start;
    gap: 6px; padding: 16px 18px;
    background: #FFFFFF;
    border: 1.5px solid #E2E8F0;
    border-radius: 13px;
    cursor: pointer; text-align: left;
    transition: all .15s;
    font-family: inherit;
    box-shadow: 0 1px 3px rgba(15,23,42,.03);
  }
  .mt-suggestion-card:hover {
    border-color: #005B52;
    background: #F0FDF9;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,91,82,.08);
  }
  .mt-sug-icon { font-size: 22px; margin-bottom: 2px; }
  .mt-sug-title { font-size: 13px; font-weight: 700; color: #0F172A; }
  .mt-sug-text  { font-size: 12px; color: #64748B; line-height: 1.45; }

  /* Messages */
  .mt-msg-row {
    display: flex; gap: 14px;
    padding: 18px 0;
  }
  .mt-msg-ai   { align-items: flex-start; }
  .mt-msg-user { justify-content: flex-end; }

  .mt-ai-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #005B52, #007A6E);
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; flex-shrink: 0; margin-top: 2px;
    box-shadow: 0 2px 6px rgba(0,91,82,.2);
  }

  .mt-msg-body  { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .mt-user-body { align-items: flex-end; }

  .mt-ai-label {
    font-size: 12px; font-weight: 700;
    color: #005B52; letter-spacing: .3px;
  }

  .mt-ai-text {
    font-size: 15px; color: #1E293B; line-height: 1.75;
    word-break: break-word;
  }
  .mt-ai-text p      { margin-bottom: 12px; }
  .mt-ai-text p:last-child { margin-bottom: 0; }
  .mt-ai-text h2,
  .mt-ai-text .md-h2 { font-size: 19px; font-weight: 700; color: #0F172A; margin: 18px 0 9px; }
  .mt-ai-text h3,
  .mt-ai-text .md-h3 { font-size: 16px; font-weight: 700; color: #0F172A; margin: 15px 0 7px; }
  .mt-ai-text h4,
  .mt-ai-text .md-h4 { font-size: 14px; font-weight: 700; color: #0F172A; margin: 13px 0 5px; }
  .mt-ai-text strong  { color: #0F172A; font-weight: 700; }
  .mt-ai-text em      { color: #005B52; font-style: italic; }
  .mt-ai-text ul      { margin: 8px 0; padding-left: 24px; list-style: disc; }
  .mt-ai-text ol      { margin: 8px 0; padding-left: 24px; list-style: decimal; }
  .mt-ai-text li      { margin-bottom: 5px; color: #334155; }
  .mt-ai-text blockquote {
    border-left: 3px solid #005B52;
    padding: 10px 16px;
    margin: 12px 0;
    color: #475569; font-style: italic;
    background: #F0FDF9; border-radius: 0 8px 8px 0;
  }
  .mt-ai-text code.inline-code {
    background: #F1F5F9; border: 1px solid #E2E8F0;
    padding: 2px 6px; border-radius: 5px;
    font-size: 13px; font-family: 'Fira Code', monospace;
    color: #005B52;
  }
  .mt-ai-text pre {
    background: #0F172A;
    border-radius: 10px; padding: 16px;
    overflow-x: auto; margin: 12px 0;
  }
  .mt-ai-text pre code {
    font-family: 'Fira Code', monospace; font-size: 13px;
    color: #A7F3D0; white-space: pre;
  }
  .mt-ai-text hr { border: none; border-top: 1px solid #E2E8F0; margin: 18px 0; }

  /* User bubble */
  .mt-user-bubble {
    background: linear-gradient(135deg, #005B52, #007A6E);
    border: none;
    border-radius: 18px 18px 4px 18px;
    padding: 12px 18px;
    max-width: 72%;
    box-shadow: 0 2px 8px rgba(0,91,82,.15);
  }
  .mt-user-bubble p { font-size: 15px; color: #fff; line-height: 1.6; }

  .mt-user-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #B8862B;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; color: #fff;
    flex-shrink: 0; margin-top: 2px;
    box-shadow: 0 2px 6px rgba(184,134,43,.25);
  }

  /* Action buttons */
  .mt-msg-actions {
    display: flex; gap: 4px;
    opacity: 0; transition: opacity .2s;
    margin-top: 2px;
  }
  .mt-msg-row:hover .mt-msg-actions { opacity: 1; }

  .mt-icon-btn {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px;
    background: transparent; border: none;
    color: #94A3B8; cursor: pointer; border-radius: 6px;
    transition: background .15s, color .15s;
  }
  .mt-icon-btn:hover { background: #F1F5F9; color: #005B52; }

  /* Typing bubble */
  .mt-typing-bubble {
    display: inline-flex; align-items: center;
    background: #FFFFFF; border: 1px solid #E2E8F0;
    border-radius: 18px; padding: 12px 16px;
    box-shadow: 0 1px 3px rgba(15,23,42,.04);
  }
  .mt-typing {
    display: flex; gap: 4px; align-items: center;
  }
  .mt-typing span {
    width: 7px; height: 7px;
    background: #005B52; border-radius: 50%;
    display: inline-block;
    animation: mtBounce 1.2s ease-in-out infinite;
  }
  .mt-typing span:nth-child(2) { animation-delay: .18s; }
  .mt-typing span:nth-child(3) { animation-delay: .36s; }
  @keyframes mtBounce {
    0%,60%,100% { transform: translateY(0); opacity: .4; }
    30%          { transform: translateY(-6px); opacity: 1; }
  }

  /* SQL block */
  .mt-sql-wrap {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 11px; overflow: hidden; margin-top: 14px;
    box-shadow: 0 1px 3px rgba(15,23,42,.03);
  }
  .mt-sql-toggle {
    display: flex; align-items: center; gap: 8px;
    width: 100%; padding: 11px 14px;
    background: #FAFBFC; border: none;
    color: #475569; font-family: inherit; font-size: 12.5px; font-weight: 600;
    cursor: pointer; text-align: left;
    transition: background .15s;
  }
  .mt-sql-toggle:hover { background: #F1F5F9; }
  .mt-sql-meta {
    background: #F0FDF9; border: 1px solid #B7E4C7;
    padding: 2px 9px; border-radius: 20px; font-size: 11px;
    color: #005B52; font-weight: 700;
  }
  .mt-sql-body { position: relative; }
  .mt-sql-body pre {
    padding: 14px 16px; overflow-x: auto;
    font-family: 'Fira Code', monospace; font-size: 12px;
    color: #B8862B; white-space: pre-wrap; word-break: break-all;
    border-top: 1px solid #E2E8F0;
    background: #FAFBFC;
  }
  .mt-sql-body .mt-icon-btn {
    position: absolute; top: 10px; right: 10px;
  }

  /* Data table */
  .mt-table-outer {
    border: 1px solid #E2E8F0; border-radius: 11px;
    overflow: hidden; margin-top: 14px;
    background: #FFFFFF;
    box-shadow: 0 1px 3px rgba(15,23,42,.03);
  }
  .mt-table-header {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 14px; background: #FAFBFC;
    border-bottom: 1px solid #E2E8F0;
    font-size: 12px; color: #475569; font-weight: 600;
  }
  .mt-table-scroll { max-height: 300px; overflow: auto; }
  .mt-table-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
  .mt-table-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }

  .mt-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  .mt-table th {
    background: #F1F5F9; padding: 9px 13px;
    text-align: left; font-weight: 700; color: #334155;
    border-bottom: 1px solid #E2E8F0;
    position: sticky; top: 0; white-space: nowrap;
  }
  .mt-table td {
    padding: 8px 13px; border-bottom: 1px solid #F1F5F9;
    color: #1E293B; max-width: 200px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .mt-table tr:last-child td { border-bottom: none; }
  .mt-table tr:hover td { background: #F0FDF9; }

  /* Input zone */
  .mt-input-zone {
    padding: 16px 24px 16px;
    background: #FFFFFF;
    border-top: 1px solid #E2E8F0;
    flex-shrink: 0;
    box-shadow: 0 -1px 3px rgba(0,0,0,.02);
  }

  .mt-input-box {
    max-width: 840px; margin: 0 auto;
    display: flex; align-items: flex-end; gap: 10px;
    background: #FFFFFF;
    border: 1.5px solid #E2E8F0;
    border-radius: 14px;
    padding: 10px 10px 10px 18px;
    transition: border-color .2s, box-shadow .2s;
  }
  .mt-input-box:focus-within {
    border-color: #005B52;
    box-shadow: 0 0 0 3px rgba(0,91,82,.08);
  }

  .mt-textarea {
    flex: 1;
    background: transparent; border: none; outline: none;
    color: #0F172A; font-family: inherit; font-size: 15px;
    resize: none; line-height: 1.55;
    min-height: 26px; max-height: 160px;
    overflow-y: auto;
  }
  .mt-textarea::placeholder { color: #94A3B8; }
  .mt-textarea::-webkit-scrollbar { width: 4px; }
  .mt-textarea::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 2px; }

  .mt-send-btn {
    width: 38px; height: 38px; border-radius: 9px;
    border: none; cursor: pointer; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: #F1F5F9; color: #94A3B8;
    transition: all .15s;
  }
  .mt-send-active {
    background: linear-gradient(135deg, #005B52, #007A6E) !important;
    color: #fff !important;
    box-shadow: 0 2px 6px rgba(0,91,82,.25) !important;
  }
  .mt-send-btn:disabled { cursor: not-allowed; }
  .mt-send-active:hover { opacity: .92; }
  .mt-send-active:active { transform: scale(.94); }

  .mt-disclaimer {
    max-width: 840px; margin: 10px auto 0;
    text-align: center; font-size: 11px; color: #94A3B8;
  }
`