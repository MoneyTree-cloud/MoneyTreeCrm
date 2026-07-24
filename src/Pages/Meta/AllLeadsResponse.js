/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { facebookApiClient } from '../../helpers/api_helper';
import { GET_CUSTOMER_LEADS } from '../../helpers/url_helper';
import { toast } from 'react-toastify';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import { FaUserCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { formatActionType, formatDateTime } from '../../helpers/function_helper';
import { defaultTheme } from '../../helpers/defaultTheme';

export default function AllLeadsResponse() {
    const { formId, pageId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [leadData, setLeadData] = useState([]);
    const [expandedLeadId, setExpandedLeadId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        getLeadForms();
    }, [formId]);

    const getLeadForms = () => {
        facebookApiClient.get(GET_CUSTOMER_LEADS + formId)
            .then((response) => {
                setIsLoading(false);
                if (response?.data?.statusCode === 1) {
                    setLeadData(response.data.data.data);
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch((error) => {
                setIsLoading(false);
                toast.error(error.message);
            });
    };

    const handleExpandToggle = (leadId) => {
        setExpandedLeadId(prevId => (prevId === leadId ? null : leadId));
    };

    return (
        <PageContent>
            <Breadcrumbs title="Meta" breadcrumbItem="All Leads" />
            {isLoading && <ScreenLoader />}
            <Container fluid style={{ padding: '10px 0' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: '10px 20px'
                }}>
                    <button
                        onClick={() => navigate(`/all-ads-screen/lead-form/${pageId}`)}
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
                <Row>

                    {leadData.map((lead) => (
                        <Col md={12} key={lead.id} className="mb-1">
                            <Card style={{ borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                <CardBody>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                        <FaUserCircle size={24} style={{ marginRight: '10px', color: '#0d6efd' }} />
                                        <h5 className="mb-0">
                                            {lead.field_data.find(f => f.name === 'full_name')?.values[0] || 'Unnamed Lead'}
                                        </h5>
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#666' }}>
                                        🕒 Submitted on: {formatDateTime(lead.created_time)}
                                    </p>

                                    {/* Show First 3 Questions */}
                                    <Row>
                                        {lead.field_data.slice(0, 3).map((field, idx) => (
                                            <Col xs={12} sm={4} key={idx}>
                                                <div style={{
                                                    marginBottom: '5px',
                                                    backgroundColor: '#f8f9fa',
                                                    padding: '10px',
                                                    borderRadius: '6px'
                                                }}>
                                                    <strong style={{ textTransform: 'capitalize' }}>
                                                        {formatActionType(field.name)}
                                                    </strong>
                                                    <div style={{ marginTop: '4px', color: '#333' }}>
                                                        {formatActionType(field.values[0])}
                                                    </div>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>

                                    {/* Show More Button */}
                                    {lead.field_data.length > 3 && expandedLeadId !== lead.id && (
                                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                                            <button
                                                onClick={() => handleExpandToggle(lead.id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: defaultTheme.primary,
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <FaChevronDown size={14} style={{ marginRight: '5px' }} />
                                                Show More
                                            </button>
                                        </div>
                                    )}

                                    {/* Show Expanded Questions */}
                                    {expandedLeadId === lead.id && (
                                        <>
                                            <Row className="mt-2">
                                                {lead.field_data.slice(3).map((field, idx) => (
                                                    <Col xs={12} sm={4} key={idx}>
                                                        <div style={{
                                                            marginBottom: '10px',
                                                            backgroundColor: '#f1f1f1',
                                                            padding: '10px',
                                                            borderRadius: '6px'
                                                        }}>
                                                            <strong style={{ textTransform: 'capitalize' }}>
                                                                {formatActionType(field.name)}
                                                            </strong>
                                                            <div style={{ marginTop: '4px', color: '#333' }}>
                                                                {formatActionType(field.values[0])}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                ))}
                                            </Row>

                                            {/* Show Less Button at the Bottom */}
                                            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                                                <button
                                                    onClick={() => handleExpandToggle(null)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: defaultTheme.goldColorLogo,
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <FaChevronUp size={14} style={{ marginRight: '5px' }} />
                                                    Show Less
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    ))
                    }
                </Row>

            </Container>
        </PageContent>
    );
}
