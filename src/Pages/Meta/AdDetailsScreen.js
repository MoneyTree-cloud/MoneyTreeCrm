/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { Container, Card, CardBody, Row, Col } from 'reactstrap';
import { facebookApiClient } from '../../helpers/api_helper';
import { GET_LEAD_DETAILS } from '../../helpers/url_helper';
import { toast } from 'react-toastify';
import ScreenLoader from '../../constants/ScreenLoader';
import { formatDateTime } from '../../helpers/function_helper';
import { defaultTheme } from '../../helpers/defaultTheme';

export default function AdDetailsScreen() {
    const { adId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [adDetail, setAdDetail] = useState(null);

    useEffect(() => {
        getAdDetails();
    }, [adId]);

    const getAdDetails = () => {
        facebookApiClient.get(GET_LEAD_DETAILS + adId)
            .then((response) => {
                setIsLoading(false);
                if (response?.data?.statusCode === 1) {
                    setAdDetail(response.data.data);
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch((error) => {
                setIsLoading(false);
                toast.error(error.message);
            });
    };

    const renderArraySection = (title, data, icon = '📌') => {
        if (!data || data.length === 0) return null;
        return (
            <Card className="mb-1 border-light shadow-sm">
                <CardBody>
                    <h6 className="mb-1">{icon} {title}</h6>
                    <Row>
                        {data.map((item, index) => (
                            <Col md={4} sm={6} xs={12} key={index} className="mb-2">
                                <div style={{
                                    background: '#f7f7f7',
                                    padding: '10px 15px',
                                    borderRadius: '6px',
                                    border: '1px solid #e0e0e0',
                                    fontSize: '15px',
                                    fontWeight: '500'
                                }}>
                                    {item.name}
                                </div>
                            </Col>
                        ))}
                    </Row>
                </CardBody>
            </Card>
        );
    };


    return (
        <PageContent>
            <Breadcrumbs title="Meta" breadcrumbItem="Ad Details" />
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
            <Container fluid>
                {isLoading && <ScreenLoader />}
                {adDetail && (
                    <Card className="shadow-sm">
                        <CardBody>
                            <h4 className="mb-2">{adDetail.name}</h4>
                            <Row className="mb-2">
                                <Col md={4}><strong>Configured Status:</strong> {adDetail.configured_status}</Col>
                                <Col md={4}><strong>Status:</strong> {adDetail.status}</Col>
                                <Col md={4}><strong>Created:</strong> {formatDateTime(adDetail.created_time)}</Col>
                            </Row>

                            <hr />
                            <h5 className="mb-2">🎯 Targeting Details</h5>

                            {adDetail.targeting?.flexible_spec?.map((spec, idx) => (
                                <div key={idx}>
                                    {renderArraySection("Interests", spec.interests, "💡")}
                                    {renderArraySection("Behaviors", spec.behaviors, "🧠")}
                                    {renderArraySection("Industries", spec.industries, "🏢")}
                                    {renderArraySection("Work Employers", spec.work_employers, "🧑‍💼")}
                                    {renderArraySection("Work Positions", spec.work_positions, "👔")}
                                </div>
                            ))}

                            {renderArraySection("Targeted Cities", adDetail.targeting?.geo_locations?.cities?.map(city => ({
                                name: `${city.name}, ${city.region}`
                            })), "🌍")}
                        </CardBody>
                    </Card>
                )}
            </Container>
        </PageContent>
    );
}
