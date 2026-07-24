/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContent from '../../components/Common/PageContent';
import { Container } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { facebookApiClient } from '../../helpers/api_helper';
import { GET_LEAD_FORM } from '../../helpers/url_helper';
import { toast } from 'react-toastify';
import { formatDateTime } from '../../helpers/function_helper';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Importing icons for expand/collapse
import ScreenLoader from '../../constants/ScreenLoader';
import { defaultTheme } from '../../helpers/defaultTheme';

export default function LeadFormScreen() {
    const { pageId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [leadForms, setLeadForms] = useState([]);
    const [expandedFormId, setExpandedFormId] = useState(null); // Track which form is expanded

    useEffect(() => {
        getLeadForms();
    }, [pageId]);

    const getLeadForms = () => {
        facebookApiClient.get(GET_LEAD_FORM + pageId)
            .then((response) => {
                setIsLoading(false);
                if (response?.data?.statusCode === 1) {
                    const forms = response.data.data.data;
                    setLeadForms(forms);
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch((error) => {
                setIsLoading(false);
                toast.error(error.message);
            });
    };

    // Toggle expand/collapse for form
    const toggleExpand = (formId) => {
        setExpandedFormId(prevState => (prevState === formId ? null : formId));
    };

    return (
        <PageContent>
            <Breadcrumbs title="Meta" breadcrumbItem="Lead Forms" />
            {isLoading && <ScreenLoader />}
            <Container fluid={true} style={{ padding: '10px 0' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: '10px 20px'
                }}>
                    <button
                        onClick={() => navigate('/all-ads-screen')}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: defaultTheme.primary,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        ← Back
                    </button>
                </div>

                <div style={{
                    maxWidth: '100%',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px' // Increase space between forms
                }}>

                    {
                        leadForms.map(form => (
                            <div key={form.id} style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                padding: '20px', // Reduced padding for more compact design
                                marginBottom: '5px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                width: '100%'
                            }}>
                                {/* Metadata */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '10px'
                                }}>
                                    {/* all-ads-screen/lead-form/:pageId/all-leads/:formId */}
                                    <h4 style={{ color: '#007bff', margin: 0 }}>{form.name}</h4>
                                    <button
                                        onClick={() => navigate(`/all-ads-screen/lead-form/${pageId}/all-leads/${form.id}`)}
                                        style={{
                                            padding: '6px 12px',
                                            fontSize: '13px',
                                            backgroundColor: defaultTheme.goldColorLogo,
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        View Leads →
                                    </button>
                                </div>

                                <p style={{ marginBottom: '5px' }}><strong>Status:</strong> <span style={{ color: form.status === 'ACTIVE' ? 'green' : 'red' }}>{form.status}</span></p>
                                <p style={{ marginBottom: '5px' }}><strong>Created:</strong> {formatDateTime(form.created_time)}</p>
                                <p style={{ marginBottom: '10px' }}><strong>Leads Count:</strong> {form.leads_count}</p>


                                {/* Show more button */}
                                <button
                                    onClick={() => toggleExpand(form.id)}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: '#007bff',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        marginTop: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    {expandedFormId === form.id ? (
                                        <>
                                            <FaChevronUp /> Hide Questions
                                        </>
                                    ) : (
                                        <>
                                            <FaChevronDown /> Show Questions
                                        </>
                                    )}
                                </button>

                                {/* Questions (conditionally rendered) */}
                                {expandedFormId === form.id && (
                                    <div style={{ marginTop: '15px' }}>
                                        {/* Dropdown Questions Group */}
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '12px',
                                            marginBottom: '20px'
                                        }}>
                                            {form.questions.filter(q => q.options).map((q) => (
                                                <div key={q.id} style={{ width: '32%', display: 'flex', flexDirection: 'column' }}>
                                                    <label style={{
                                                        fontWeight: '600',
                                                        fontSize: '14px',
                                                        marginBottom: '6px',
                                                        color: '#333',
                                                        minHeight: '40px', // Ensures consistent height across all labels
                                                        lineHeight: '18px'
                                                    }}>
                                                        {q.label}?
                                                    </label>
                                                    <select
                                                        defaultValue=""
                                                        style={{
                                                            padding: '10px',
                                                            width: '100%',
                                                            borderRadius: '5px',
                                                            border: '1px solid #ccc',
                                                            backgroundColor: '#fff',
                                                            flexGrow: 1
                                                        }}
                                                    >
                                                        <option value="">Select an option</option>
                                                        {q.options.map(opt => (
                                                            <option key={opt.key} value={opt.value}>{opt.value}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}

                                        </div>

                                        {/* Text-only Questions Group */}
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '12px'
                                        }}>
                                            {form.questions.filter(q => !q.options).map((q) => (
                                                <div key={q.id} style={{ width: '32%' }}>
                                                    <label style={{
                                                        fontWeight: '600',
                                                        fontSize: '14px',
                                                        display: 'block',
                                                        color: '#333',
                                                        padding: '10px 15px',
                                                        borderRadius: '5px',
                                                        backgroundColor: '#f8f9fa',
                                                        border: '1px solid #ccc'
                                                    }}>
                                                        {q.label}?
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        ))
                    }
                </div>
            </Container>
        </PageContent>
    );
}
