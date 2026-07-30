import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Container } from 'reactstrap';
import { FaRegFolderOpen, FaMapMarkerAlt, FaShieldAlt, FaUmbrellaBeach, FaChevronRight } from 'react-icons/fa';
import mammoth from 'mammoth';
import PageContent from '../../components/Common/PageContent';
import { useUserStore } from '../../store/useUserStore';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { assetImageBaseUrl } from '../../helpers/api_helper';

// ── Docx imports ───────────────────────────────────────────────────────────
import COC_DOC from '../../assets/docs/COC.docx';
import LEAVE_GZB from '../../assets/docs/Leave Policy. - Gzb.docx';
import LEAVE_PUNE from '../../assets/docs/Leave Policy Pune.docx';
import LEAVE_LUCKNOW from '../../assets/docs/Leave Policy. - Lucknow.docx';
import LEAVE_NOIDA from '../../assets/docs/Leave Policy. - Noida.docx';
import LEAVE_MUMBAI from '../../assets/docs/Leave Policy Mumbai.docx';
import LEAVE_GURUGRAM from '../../assets/docs/Leave Policy. - Gurugram.docx';

import ZERO_TOLERANCE_POLICY_DOC from '../../assets/docs/Zero Tolerance Policy.docx';
import PIP_POLICY_DOC from '../../assets/docs/PIP Policy.docx';
import EXIT_POLICY_DOC from '../../assets/docs/Exit Policy.docx';

const LEAVE_POLICY_BY_LOCATION = {
    Ghaziabad: LEAVE_GZB,
    Pune: LEAVE_PUNE,
    Lucknow: LEAVE_LUCKNOW,
    Noida: LEAVE_NOIDA,
    Mumbai: LEAVE_MUMBAI,
    Gurugram: LEAVE_GURUGRAM,
};

const LOGO_URL = `${assetImageBaseUrl}logo.png`;

// ── Document viewer (renders below the list when a policy is selected) ─────
function DocumentViewer({ title, subtitle, icon: Icon, accent, fileUrl }) {
    const [html, setHtml] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!fileUrl) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        setHtml('');

        const load = async () => {
            try {
                const res = await fetch(fileUrl);
                const arrayBuffer = await res.arrayBuffer();
                const result = await mammoth.convertToHtml(
                    { arrayBuffer },
                    {
                        // Preserve paragraph alignment from Word's direct formatting
                        transformDocument: mammoth.transforms.paragraph((paragraph) => {
                            if (paragraph.alignment === 'center') {
                                return { ...paragraph, styleId: 'Center', styleName: 'Center' };
                            }
                            if (paragraph.alignment === 'right') {
                                return { ...paragraph, styleId: 'Right', styleName: 'Right' };
                            }
                            if (paragraph.alignment === 'justify') {
                                return { ...paragraph, styleId: 'Justify', styleName: 'Justify' };
                            }
                            return paragraph;
                        }),
                        styleMap: [
                            "p[style-name='Center'] => p.docx-center:fresh",
                            "p[style-name='Right'] => p.docx-right:fresh",
                            "p[style-name='Justify'] => p.docx-justify:fresh",
                        ],
                    }
                );
                if (!cancelled) setHtml(result.value);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Failed to load document');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [fileUrl]);

    return (
        <section
            style={{
                background: '#fff',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 6px 24px rgba(15,23,42,.08)',
                border: '1px solid #E2E8F0',
                animation: 'docFadeIn .25s ease-out',
            }}
        >
            {/* Header strip */}
            <div
                style={{
                    background: `linear-gradient(135deg, ${accent} 0%, ${accent}dd 100%)`,
                    padding: '16px 24px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                }}
            >
                <div
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 11,
                        background: 'rgba(255,255,255,.18)',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                    }}
                >
                    <Icon size={20} color="#fff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '.2px' }}>
                        {title}
                    </div>
                    {subtitle && (
                        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                            {subtitle}
                        </div>
                    )}
                </div>
            </div>

            {/* Body with watermark */}
            <div
                style={{
                    position: 'relative',
                    padding: '36px 48px',
                    background: '#fff',
                    minHeight: 320,
                    overflow: 'hidden',
                }}
            >
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${LOGO_URL})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundSize: '320px auto',
                        opacity: 0.06,
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />
                <div
                    className="docx-render"
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        color: '#1a2e2c',
                        fontSize: 14,
                        lineHeight: 1.75,
                        fontFamily: 'Georgia, "Times New Roman", serif',
                    }}
                >
                    {loading && (
                        <div style={{ textAlign: 'center', padding: 80, color: '#94A3B8', fontStyle: 'italic' }}>
                            Loading document…
                        </div>
                    )}
                    {error && (
                        <div style={{ textAlign: 'center', padding: 80, color: '#DC2626' }}>
                            {error}
                        </div>
                    )}
                    {!loading && !error && html && (
                        <div dangerouslySetInnerHTML={{ __html: html }} />
                    )}
                </div>
            </div>
        </section>
    );
}

// ── List item ──────────────────────────────────────────────────────────────
function PolicyListItem({ icon: Icon, accent, title, subtitle, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                background: active ? `${accent}0f` : '#fff',
                border: `1.5px solid ${active ? accent : '#E2E8F0'}`,
                borderRadius: 12,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all .15s ease',
                boxShadow: active
                    ? `inset 0 0 0 1px ${accent}55`
                    : '0 1px 3px rgba(15,23,42,.04)',
            }}
            onMouseEnter={(e) => {
                if (!active) {
                    e.currentTarget.style.borderColor = accent;
                    e.currentTarget.style.background = `${accent}08`;
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.background = '#fff';
                }
            }}
        >
            <div
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    background: active ? accent : `${accent}1a`,
                    color: active ? '#fff' : accent,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    transition: 'all .15s ease',
                }}
            >
                <Icon size={19} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontSize: 14.5,
                        fontWeight: 700,
                        color: active ? accent : '#0F172A',
                        marginBottom: 2,
                    }}
                >
                    {title}
                </div>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                    {subtitle}
                </div>
            </div>
            <FaChevronRight
                size={13}
                color={active ? accent : '#94A3B8'}
                style={{
                    transition: 'transform .2s ease',
                    transform: active ? 'rotate(90deg)' : 'none',
                }}
            />
        </button>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ShowPolicy() {
    const { locationName } = useUserStore((state) => state.user);
    const viewerRef = useRef(null);

    const leavePolicyFile = useMemo(
        () => LEAVE_POLICY_BY_LOCATION[locationName] || null,
        [locationName]
    );

    // Build the policy list dynamically so the viewer can swap content
    const policies = useMemo(() => {
        const list = [
            {
                id: 'coc',
                title: 'Code of Conduct (COC)',
                subtitle: 'Moneytree Realty Services Limited',
                icon: FaShieldAlt,
                accent: '#005B52',
                fileUrl: COC_DOC,
            },
            {
                id: 'zero-tolerance',
                title: 'Zero Tolerance Policy (ZTP)',
                subtitle: 'Moneytree Realty Services Limited',
                icon: FaShieldAlt,
                accent: '#DC2626',
                fileUrl: ZERO_TOLERANCE_POLICY_DOC,
            },
            {
                id: 'pip',
                title: 'Performance Improvement Plan Policy (PIP)',
                subtitle: 'Moneytree Realty Services Limited',
                icon: FaRegFolderOpen,
                accent: '#2563EB',
                fileUrl: PIP_POLICY_DOC,
            },
            {
                id: 'exit',
                title: 'Exit On Seperation Policy',
                subtitle: 'Moneytree Realty Services Limited',
                icon: FaRegFolderOpen,
                accent: '#7C3AED',
                fileUrl: EXIT_POLICY_DOC,
            },
        ];

        if (leavePolicyFile) {
            list.push({
                id: 'leave',
                title: 'Leave Policy',
                subtitle: `${locationName} Leave Policy`,
                icon: FaUmbrellaBeach,
                accent: '#B8862B',
                fileUrl: leavePolicyFile,
            });
        }

        return list;
    }, [leavePolicyFile, locationName]);


    const [activeId, setActiveId] = useState(null);
    const activePolicy = policies.find((p) => p.id === activeId) || null;

    const handleSelect = (id) => {
        const next = activeId === id ? null : id; // click again to collapse
        setActiveId(next);
        // Scroll to viewer when opening a new one
        if (next) {
            setTimeout(() => {
                viewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 80);
        }
    };

    return (
        <PageContent>
            <Container fluid={true}>
                <Breadcrumbs title="Policy" breadcrumbItem="View Policies" />

                {/* Hero banner */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #005B52 0%, #007A6E 100%)',
                        borderRadius: 16,
                        padding: '22px 28px',
                        marginBottom: 22,
                        color: '#fff',
                        boxShadow: '0 6px 22px rgba(0,91,82,.22)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute',
                            top: -40,
                            right: -40,
                            width: 180,
                            height: 180,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,.05)',
                        }}
                    />
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute',
                            bottom: -60,
                            right: 80,
                            width: 140,
                            height: 140,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,.04)',
                        }}
                    />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '1.4px',
                                opacity: 0.8,
                                textTransform: 'uppercase',
                                marginBottom: 4,
                            }}
                        >
                            Company Policies
                        </div>
                        {/* <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 10px', color: '#fff' }}>
                            Policies &amp; Code of Conduct
                        </h2> */}
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                background: 'rgba(255,255,255,.16)',
                                backdropFilter: 'blur(4px)',
                                padding: '7px 14px',
                                borderRadius: 999,
                                fontSize: 12.5,
                                fontWeight: 600,
                            }}
                        >
                            <FaMapMarkerAlt size={12} />
                            <span style={{ opacity: 0.85 }}>Location:</span>
                            <span style={{ fontWeight: 800 }}>{locationName || 'Not set'}</span>
                        </div>
                    </div>
                </div>

                {/* Policy list */}
                <div
                    style={{
                        background: '#fff',
                        borderRadius: 14,
                        padding: 14,
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 2px 8px rgba(15,23,42,.04)',
                        marginBottom: 22,
                    }}
                >
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            color: '#64748B',
                            padding: '6px 8px 12px',
                        }}
                    >
                        Available Documents
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 12,
                        }}
                    >
                        {policies.map((p) => (
                            <PolicyListItem
                                key={p.id}
                                icon={p.icon}
                                accent={p.accent}
                                title={p.title}
                                subtitle={p.subtitle}
                                active={activeId === p.id}
                                onClick={() => handleSelect(p.id)}
                            />
                        ))}

                        {!leavePolicyFile && (
                            <div
                                style={{
                                    background: '#FFFBEB',
                                    border: '1px dashed #FCD34D',
                                    borderRadius: 11,
                                    padding: '12px 14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    fontSize: 12.5,
                                    color: '#92400E',
                                }}
                            >
                                <FaRegFolderOpen size={16} />
                                <span>
                                    No leave policy mapped for{' '}
                                    <strong>{locationName || 'your location'}</strong>.
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Viewer area */}
                <div ref={viewerRef}>
                    {activePolicy ? (
                        <DocumentViewer
                            title={activePolicy.title}
                            subtitle={activePolicy.subtitle}
                            icon={activePolicy.icon}
                            accent={activePolicy.accent}
                            fileUrl={activePolicy.fileUrl}
                        />
                    ) : (
                        <div
                            style={{
                                background: '#fff',
                                border: '2px dashed #E2E8F0',
                                borderRadius: 14,
                                padding: '50px 24px',
                                textAlign: 'center',
                            }}
                        >
                            <div
                                style={{
                                    width: 62,
                                    height: 62,
                                    borderRadius: '50%',
                                    background: '#F1F5F9',
                                    display: 'grid',
                                    placeItems: 'center',
                                    margin: '0 auto 14px',
                                }}
                            >
                                <FaRegFolderOpen size={28} color="#94A3B8" />
                            </div>
                            <h6 style={{ color: '#475569', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
                                Select a document to view
                            </h6>
                            <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 0 }}>
                                Tap any policy above to read its full content here.
                            </p>
                        </div>
                    )}
                </div>
            </Container>

            {/* Animations + typography for rendered docx */}
            <style>{`
                @keyframes docFadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .docx-render h1 {
                    font-size: 26px;
                    margin: 24px 0 14px;
                    color: #0F172A;
                    font-weight: 700;
                    border-bottom: 2px solid #E2E8F0;
                    padding-bottom: 8px;
                    font-family: 'Georgia', serif;
                }
                .docx-render h2 {
                    font-size: 21px;
                    margin: 22px 0 12px;
                    color: #1E293B;
                    font-weight: 700;
                    font-family: 'Georgia', serif;
                }
                .docx-render h3 {
                    font-size: 17px;
                    margin: 18px 0 8px;
                    color: #334155;
                    font-weight: 700;
                    font-family: 'Georgia', serif;
                }
                .docx-render p {
                    margin: 10px 0;
                }
                .docx-render p.docx-center { text-align: center; }
                .docx-render p.docx-right  { text-align: right; }
                .docx-render p.docx-justify { text-align: justify; }
                .docx-render strong { color: #0F172A; }
                .docx-render ul, .docx-render ol {
                    padding-left: 26px;
                    margin: 10px 0;
                }
                .docx-render li { margin: 5px 0; }
                .docx-render table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 14px 0;
                    font-size: 13px;
                }
                .docx-render td, .docx-render th {
                    border: 1px solid #CBD5E1;
                    padding: 8px 12px;
                    text-align: left;
                }
                .docx-render th {
                    background: #F1F5F9;
                    font-weight: 700;
                    color: #1E293B;
                }
                .docx-render tr:nth-child(even) { background: #FAFBFC; }
                .docx-render img { max-width: 100%; height: auto; border-radius: 6px; }
                .docx-render a { color: #2563EB; text-decoration: underline; }
                .docx-render blockquote {
                    border-left: 4px solid #005B52;
                    padding: 8px 16px;
                    margin: 14px 0;
                    background: #F0FDF9;
                    color: #475569;
                    font-style: italic;
                }
            `}</style>
        </PageContent>
    );
}