import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { facebookApiClient } from '../../helpers/api_helper';
import { toast } from 'react-toastify';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { Card, Container } from 'reactstrap';
import ScreenLoader from '../../constants/ScreenLoader';
import { GET_ALL_ADS } from '../../helpers/url_helper';
import { formatDateTime } from "../../helpers/function_helper";
import { defaultTheme } from '../../helpers/defaultTheme';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import { useUserStore } from '../../store/useUserStore';
import PermissionMissing from '../Utility/PermissonMissing';
import { USER_TYPE } from '../../constants/global';

export default function AllAdsScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [allAdsData, setAllAdsData] = useState([]);
    const navigate = useNavigate(); // For navigation
    const userId = useUserStore((state) => state.user.userId);
    const role = useUserStore((state) => state.user.role);
    const [accessGranted, setAccessGranted] = useState(null);

    useEffect(() => {
        if (accessGranted) {
            getAllAds();
        }
    }, [accessGranted]);

    const getAllAds = () => {
        facebookApiClient.get(GET_ALL_ADS)
            .then(function (response) {
                setIsLoading(false);
                if (response?.data?.statusCode === 1) {
                    setAllAdsData(response.data.data.data);
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsLoading(false);
                toast.error(error.message);
            });
    };

    // const renderAdList = () => (
    //     <div>
    //         {allAdsData.map((ad) => {
    //             const tracking = ad.tracking_specs.find(
    //                 spec => spec.page && spec.post
    //             );
    //             const pageId = tracking?.page?.[0];

    //             return (
    //                 <Card>
    //                     <div key={ad.id} style={{ borderRadius: '5px', padding: '15px', marginBottom: '20px' }}>
    //                         <h4>{ad.name}</h4>
    //                         <p><strong>Status:</strong> {ad.status}</p>
    //                         <p><strong>Created:</strong> {formatDateTime(ad.created_time)}</p>

    //                         <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
    //                             <button
    //                                 onClick={() => navigate(`/all-ads-screen/insights/${ad.id}`)}
    //                                 style={buttonStyle}
    //                             >
    //                                 📊 Show Insights
    //                             </button>

    //                             <button
    //                                 onClick={() => navigate(`/all-ads-screen/ad-details/${ad.id}`)}
    //                                 style={buttonStyle}
    //                             >
    //                                 📄 Show Ad Details
    //                             </button>

    //                             {pageId && (
    //                                 <button
    //                                     onClick={() => navigate(`/all-ads-screen/lead-form/${pageId}`)}
    //                                     style={buttonStyle}
    //                                 >
    //                                     📝 Lead Form
    //                                 </button>
    //                             )}
    //                         </div>
    //                     </div>
    //                 </Card>
    //             );
    //         })}
    //     </div>
    // );


    useEffect(() => {
        const checkAccess = async () => {
            if (role !== USER_TYPE.ASSOCIATE) {
                const hasAccess = await CheckUserAccess(userId, 'all-ads-screen');
                setAccessGranted(hasAccess);
            }
        };
        checkAccess();
    }, [userId, role]);

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }



    const renderAdList = () => {
        if (allAdsData.length === 0) {
            return <p>No data available</p>;
        }

        return (
            <div>
                {allAdsData.map((ad) => {
                    const tracking = ad.tracking_specs.find(
                        spec => spec.page && spec.post
                    );
                    const pageId = tracking?.page?.[0];

                    return (
                        <Card key={ad.id}>
                            <div style={{ borderRadius: '5px', padding: '15px', marginBottom: '20px' }}>
                                <h4>{ad.name}</h4>
                                <p><strong>Status:</strong> {ad.status}</p>
                                <p><strong>Created:</strong> {formatDateTime(ad.created_time)}</p>

                                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                                    <button
                                        onClick={() => navigate(`/all-ads-screen/insights/${ad.id}`)}
                                        style={buttonStyle}
                                    >
                                        📊 Show Insights
                                    </button>

                                    <button
                                        onClick={() => navigate(`/all-ads-screen/ad-details/${ad.id}`)}
                                        style={buttonStyle}
                                    >
                                        📄 Show Ad Details
                                    </button>

                                    {pageId && (
                                        <button
                                            onClick={() => navigate(`/all-ads-screen/lead-form/${pageId}`)}
                                            style={buttonStyle}
                                        >
                                            📝 Lead Form
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        );
    };


    const buttonStyle = {
        padding: '5px 10px',
        background: defaultTheme.primary,
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    };

    return (
        <PageContent>
            <Breadcrumbs title="Meta" breadcrumbItem="All Ads" />
            {isLoading && <ScreenLoader />}
            <Container fluid={true}>
                {renderAdList()}
            </Container>
        </PageContent>
    );
}
