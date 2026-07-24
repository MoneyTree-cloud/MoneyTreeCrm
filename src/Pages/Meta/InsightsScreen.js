/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { Container, Row, Col, Card, CardBody, Badge } from 'reactstrap';
import { facebookApiClient } from '../../helpers/api_helper';
import { GET_LEAD_INSIGHTS } from '../../helpers/url_helper';
import { toast } from 'react-toastify';
import ScreenLoader from '../../constants/ScreenLoader';
import { formatActionType, formatDate } from '../../helpers/function_helper';
import { defaultTheme } from '../../helpers/defaultTheme';

export default function InsightsScreen() {
    const { adId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [insightsData, setInsightsData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getLeadInsights();
    }, [adId]);

    const getLeadInsights = () => {
        facebookApiClient.get(GET_LEAD_INSIGHTS + adId)
            .then((response) => {
                setIsLoading(false);
                if (response?.data?.statusCode === 1) {
                    const forms = response?.data?.data[adId]?.data || [];
                    setInsightsData(forms);
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch((error) => {
                setIsLoading(false);
                toast.error(error.message);
            });
    };

    return (
        <PageContent>
            <Breadcrumbs title="Meta" breadcrumbItem="Ad Insights" />
            <Container fluid>
                {isLoading && <ScreenLoader />}

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

                {!isLoading && insightsData?.length > 0 ? (
                    insightsData.map((data, index) => (
                        <Card key={index} className="my-2 shadow-sm">
                            <CardBody>
                                <h4 className="mb-2">{data.campaign_name}</h4>
                                <p className="text-muted mb-2">
                                    <strong>Date:</strong> {formatDate(data.date_start)} to {formatDate(data.date_stop)}
                                </p>
                                <Row className="mb-2">
                                    {[
                                        { label: 'Impressions', value: `${data.impressions}`, icon: '👁️', color: 'info' },
                                        { label: 'Reach', value: data.reach, icon: '📣', color: 'primary' },
                                        { label: 'Frequency', value: parseFloat(data.frequency).toFixed(2), icon: '🔁', color: 'warning' },
                                        { label: 'Clicks', value: data.clicks, icon: '🖱️', color: 'success' },
                                        { label: 'Unique Clicks', value: data.unique_clicks, icon: '🧍', color: 'secondary' },
                                        { label: 'Spend', value: `₹${parseFloat(data.spend).toFixed(2)}`, icon: '💸', color: 'danger' },
                                        { label: 'Inline Post Engagement', value: data.inline_post_engagement, icon: '📢', color: 'primary' },
                                        { label: 'Social Spend', value: `₹${parseFloat(data.social_spend || 0).toFixed(2)}`, icon: '🌐', color: 'dark' }
                                    ].map((item, idx) => (
                                        <Col md={3} sm={6} xs={12} className="mb-2" key={idx}>
                                            <Card className={`text-center shadow-sm border-${item.color}`}>
                                                <CardBody className="py-3">
                                                    <div style={{ fontSize: '24px' }}>{item.icon}</div>
                                                    <div className="text-muted small">{item.label}</div>
                                                    <h5 className={`text-${item.color} fw-bold mt-1`}>{item.value}</h5>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>

                                {/* Engagement Actions */}
                                {Array.isArray(data.actions) && data.actions.length > 0 && (
                                    <>
                                        <h5 className="mb-3">💬 Engagement Actions</h5>
                                        <Row>
                                            {data.actions.map((action, idx) => (
                                                <Col md={4} className="mb-2" key={idx}>
                                                    <Card className="bg-light border-0 shadow-sm">
                                                        <CardBody className="py-2 px-3">
                                                            <h6 className="text-muted">{formatActionType(action.action_type)}</h6>
                                                            <h5>
                                                                <Badge color="primary" pill>{action.value}</Badge>
                                                            </h5>
                                                        </CardBody>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </>
                                )}

                                {/* Video Stats */}
                                {(Array.isArray(data.video_avg_time_watched_actions) || Array.isArray(data.video_play_actions)) && (
                                    <>
                                        <h5 className="mt-2 mb-2">🎥 Video Stats</h5>
                                        <Row>
                                            {data.video_avg_time_watched_actions?.map((v, i) => (
                                                <Col md={4} sm={6} xs={12} key={`avg-${i}`} className="mb-3">
                                                    <Card className="text-center shadow-sm border-info">
                                                        <CardBody className="py-3">
                                                            <div style={{ fontSize: '24px' }}>⏱️</div>
                                                            <div className="text-muted small">Avg Watch Time</div>
                                                            <h5 className="text-info fw-bold mt-1">{v.value}</h5>
                                                        </CardBody>
                                                    </Card>
                                                </Col>
                                            ))}

                                            {data.video_play_actions?.map((v, i) => (
                                                <Col md={4} sm={6} xs={12} key={`play-${i}`} className="mb-3">
                                                    <Card className="text-center shadow-sm border-success">
                                                        <CardBody className="py-3">
                                                            <div style={{ fontSize: '24px' }}>▶️</div>
                                                            <div className="text-muted small">Total Video Plays</div>
                                                            <h5 className="text-success fw-bold mt-1">{v.value}</h5>
                                                        </CardBody>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </>
                                )}

                            </CardBody>
                        </Card>
                    ))
                ) : !isLoading && (
                    <p className="text-muted text-center my-4">No data found for this Ad ID.</p>
                )}
            </Container>
        </PageContent>
    );
}
