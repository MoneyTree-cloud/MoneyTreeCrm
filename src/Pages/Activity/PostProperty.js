import { useState, useEffect } from 'react';
import PageContent from "../../components/Common/PageContent";
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { Container, Row, Col, Card, CardBody, CardTitle, CardSubtitle, Button, Badge, Modal, ModalHeader, ModalBody, Carousel, CarouselItem, CarouselIndicators, CarouselControl } from 'reactstrap';
import { FaDownload, FaExpand, FaBath, FaSquare, FaMapMarkerAlt, FaHome, FaSun, FaBuilding, FaDoorOpen, FaClock, FaCalendarCheck, FaCalendarAlt, FaUser } from 'react-icons/fa';
import ApiClient, { imageBaseUrl } from '../../helpers/api_helper';
import { useGet } from '../../Hooks/useApi';
import ScreenLoader from '../../constants/ScreenLoader';
import { GET_POST_PROPERTY, POST_MARK_HOLD_RELEASE, POST_MARK_SOLD } from '../../helpers/url_helper';
import { toast } from 'react-toastify';
import { formatDateTime } from '../../helpers/function_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';
import { useUserStore } from '../../store/useUserStore';

const formatPrice = (price) => {
    if (price === null) return 'Price N/A';
    return price.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    });
};

//--- Full-Screen Image Gallery Modal Component (No changes needed) ---
const ImageGalleryModal = ({ isOpen, toggle, images, propertyAddress, initialIndex = 0 }) => {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setActiveIndex(initialIndex);
        }
    }, [initialIndex, isOpen]);

    const imageItems = images.map((imgName, index) => ({
        src: `${imageBaseUrl}${imgName}`,
        altText: `Property Image ${index + 1} for ${propertyAddress}`
    }));

    const next = () => {
        if (animating) return;
        const nextIndex = activeIndex === imageItems.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(nextIndex);
    };

    const previous = () => {
        if (animating) return;
        const nextIndex = activeIndex === 0 ? imageItems.length - 1 : activeIndex - 1;
        setActiveIndex(nextIndex);
    };

    const goToIndex = (newIndex) => {
        if (animating) return;
        setActiveIndex(newIndex);
    };

    const handleDownload = async () => {
        const imageSrc = imageItems[activeIndex]?.src;
        if (imageSrc) {
            try {
                const response = await fetch(imageSrc);
                // Check if the response is OK (status 200)
                if (!response.ok) {
                    throw new Error('Failed to fetch image');
                }

                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = imageSrc?.split('attachment/')[1] || 'downloaded_image.jpg';  // Fallback if filename extraction fails
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Download error: ", error);
                toast.error("There was an error downloading the image. Please try again.");
            }
        }
    };

    const slides = imageItems.map((item, index) => {
        return (
            <CarouselItem
                onExiting={() => setAnimating(true)}
                onExited={() => setAnimating(false)}
                key={index}
            >
                {/* Image container for full-screen view */}
                <div style={{ maxHeight: 'calc(100vh - 120px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img
                        src={item.src}
                        alt={item.altText}
                        style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 120px)', objectFit: 'contain' }}
                    />
                </div>
            </CarouselItem>
        );
    });

    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            size="xl"
            centered
            style={{ maxWidth: '95vw', margin: '1.5rem auto' }}
            contentClassName="h-100 d-flex flex-column"
            scrollable
        >
            <ModalHeader toggle={toggle} className="d-flex align-items-center justify-content-between" style={{ borderBottom: '1px solid #495057' }}>
                <span className="h5">Images for **{propertyAddress}** { }</span>
                <Button color="primary" className="ms-auto" onClick={handleDownload}>
                    <FaDownload className="me-2" /> ({imageItems.length > 0 ? (activeIndex + 1) : 0}/{imageItems.length})
                </Button>
            </ModalHeader>
            <ModalBody className="p-0 flex-grow-1 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#212529' }}>
                {imageItems.length > 0 ? (
                    <Carousel
                        activeIndex={activeIndex}
                        next={next}
                        previous={previous}
                        interval={false}
                        className="w-100 h-100"
                    >
                        <CarouselIndicators
                            items={imageItems}
                            activeIndex={activeIndex}
                            onClickHandler={goToIndex}
                            style={{ filter: 'invert(1)' }}
                        />
                        {slides}
                        <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
                        <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
                    </Carousel>
                ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 p-5 text-light">
                        No images found for this property.
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
};

// --- Static Clickable Image Component with Top-Right Icon (No changes needed) ---
const PropertyStaticImage = ({ images, propertyAddress, onClickImage }) => {
    const imageUrl = images.length > 0 ? `${imageBaseUrl}${images[0]}` : null;

    if (!imageUrl) {
        return (
            <div
                className="d-flex align-items-center justify-content-center text-muted"
                style={{
                    height: '180px',
                    backgroundColor: '#f8f9fa',
                    borderTopLeftRadius: '0.5rem',
                    borderTopRightRadius: '0.5rem'
                }}
            >
                No Images
            </div>
        );
    }

    return (
        <div
            onClick={() => onClickImage(0)}
            style={{
                height: '180px',
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden',
                borderTopLeftRadius: '0.5rem',
                borderTopRightRadius: '0.5rem'
            }}
            title={`View ${propertyAddress} images`}
        >
            {/* --- MAXIMIZE BUTTON (TOP RIGHT) --- */}
            <div
                style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    padding: '6px',
                    borderRadius: '50%',
                    zIndex: 10,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
            >
                {/* <span className="me-2" style={{ color: 'red' }}>{images.length}</span> */}
                <FaExpand size={16} color="white" />
            </div>

            {/* --- Image Count Badge (Bottom Right for reference) --- */}
            <Badge
                color="dark"
                style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    fontSize: '0.75rem',
                    padding: '0.3em 0.6em',
                }}
            >
                {images.length} <span className="ms-1">Photos</span>
            </Badge>
        </div>
    );
};

export default function PostProperty() {
    const { user: { userId, userName, empCode } } = useUserStore();
    const [accessGranted, setAccessGranted] = useState(true);
    const [properties, setProperties] = useState([]);
    const [isPending, setIsPending] = useState(false);

    // State for the Full-Screen Modal (unchanged)
    const [modal, setModal] = useState(false);
    const [modalImages, setModalImages] = useState([]);
    const [modalPropertyAddress, setModalPropertyAddress] = useState('');
    const [modalInitialIndex, setModalInitialIndex] = useState(0);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'post-property');
            setAccessGranted(hasAccess);

        };
        checkAccess();
    }, [userId]);

    // Use GET API for fetching property list (assuming it is defined/imported)
    const { data, isLoading, refetch: getAllData } = useGet(GET_POST_PROPERTY, { enabled: accessGranted });

    useEffect(() => {
        if (data && data?.data?.status === 1) {
            setProperties(data.data.data.content);
        }
    }, [data]);

    const toggleModal = () => setModal(!modal);

    const handleImageClick = (property, initialIndex) => {
        setModalImages(property.propertyImages);
        setModalPropertyAddress(property.propertyAddress);
        setModalInitialIndex(initialIndex);
        setModal(true);
    };

    // --- REFACTORED: Handler for the "Sell" button click with API integration ---
    const handlePropertyStatusChange = async (id, status) => {
        if (!window.confirm(`Are you sure you want to mark this property as ${status} ?`)) return;
        setIsPending(true)
        // 1. API Call to Mark Sold
        let url = ""
        if (status === 'sold') {
            url = `${POST_MARK_SOLD}?id=${id}`;
        }
        else {
            url = `${POST_MARK_HOLD_RELEASE}?id=${id}&holdByName=${userName + ' (' + empCode + ')'}`;
        }

        ApiClient.post(url)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message || `Property marked as ${status} successfully!`);
                    getAllData(); // Refresh the property list after marking as sold
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Container fluid={true}>
                <Breadcrumbs title="Post" breadcrumbItem="Property" />
                {(isLoading || isPending) && <ScreenLoader />}

                <h2 className="mb-2 text-secondary">
                    <FaHome className="me-2" /> All Property
                </h2>
                <p className="text-muted mb-4">Click the image or the expand icon to view the full gallery.</p>
                <hr className="dashed-divider" />

                <Row>
                    {properties.map(property => (
                        <Col key={property.id} lg={4} md={6} sm={12} className="mb-2 d-flex">
                            <Card
                                className="shadow-sm h-100 w-100 border-0"
                                style={{
                                    borderRadius: '0.5rem',
                                    border: '1px solid #dee2e6',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
                                }}
                            >
                                <PropertyStaticImage
                                    images={property.propertyImages}
                                    propertyAddress={property.propertyAddress}
                                    onClickImage={(index) => handleImageClick(property, index)}
                                />

                                <CardBody className="d-flex flex-column p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <CardTitle tag="h6" className="mb-0 text-truncate fw-bold text-dark">
                                            <FaMapMarkerAlt size={14} className="me-1 text-secondary" /> {property.propertyAddress}
                                        </CardTitle>
                                        <Badge color={property.sold ? "danger" : "primary"} pill className="ms-2">
                                            {property.sold ? 'SOLD' : 'Active'}
                                        </Badge>
                                    </div>

                                    <CardSubtitle className="mb-3 text-primary fw-bold fs-5">
                                        {formatPrice(property.propertyExpectedPrice)}
                                    </CardSubtitle>

                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between mb-1">
                                            <small className="text-secondary fw-bold">
                                                <FaBuilding size={12} className="me-2" />Property Type:
                                            </small>
                                            <small className="text-dark fw-bold">
                                                {property.propertyType || '-'}
                                            </small>
                                        </div>

                                        <div className="d-flex justify-content-between mb-1">
                                            <small className="text-secondary fw-bold">
                                                <FaSun size={12} className="me-2" /> Facing:
                                            </small>
                                            <small className="text-dark">
                                                {property.propertyFacing || '-'}
                                            </small>
                                        </div>

                                        <div className="d-flex justify-content-between mb-1">
                                            <small className="text-secondary fw-bold">
                                                <FaDoorOpen size={12} className="me-2" /> Floor No:
                                            </small>
                                            <small className="text-dark">
                                                {property.propertyFloorNumber || '-'}
                                            </small>
                                        </div>

                                        <div className="d-flex justify-content-between mb-1">
                                            <small className="text-secondary fw-bold">
                                                <FaClock size={12} className="me-2" /> Age:
                                            </small>
                                            <small className="text-dark">
                                                {property.propertyAgeType || '-'}
                                            </small>
                                        </div>

                                        {/* Additional Standard Details (Kept for completeness) */}
                                        {(property.bathrooms && property.bathrooms.trim() !== '') && (
                                            <div className="d-flex justify-content-between mb-1">
                                                <small className="text-secondary fw-bold">
                                                    <FaBath size={12} className="me-2" /> Baths:
                                                </small>
                                                <small className="text-dark">
                                                    {property.bathrooms || '-'}
                                                </small>
                                            </div>
                                        )}
                                        <div className="d-flex justify-content-between mb-1">
                                            <small className="text-secondary fw-bold">
                                                <FaSquare size={12} className="me-2" /> Area:
                                            </small>
                                            <small className="text-dark">
                                                {property.propertyArea || '-'} sq.ft.
                                            </small>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <small className="text-secondary fw-bold">
                                                <FaBuilding size={12} className="me-2" />Residential Type:
                                            </small>
                                            <small className="text-dark fw-bold">
                                                {property.residentialType || '-'}
                                            </small>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <small className="text-secondary fw-bold">
                                                <FaCalendarAlt size={12} className="me-2" />Created At:
                                            </small>
                                            <small className="text-dark fw-bold">
                                                {formatDateTime(property.createdAt) || '-'}
                                            </small>
                                        </div>
                                    </div>

                                    {/* --- ENHANCED: Sold Date Display --- */}
                                    {property.sold && property.soldDate ?
                                        <small className="fw-bold mb-2" style={{ color: defaultTheme.goldColorLogo }}>
                                            <FaCalendarCheck className="me-1" /> Sold On: {formatDateTime(property.soldDate)}
                                        </small>
                                        :
                                        property.hold ?
                                            <small className="fw-bold mb-2" style={{ color: defaultTheme.goldColorLogo }}>
                                                <FaCalendarCheck className="me-1" /> Hold On: {formatDateTime(property.holdDate)}
                                            </small>
                                            :
                                            null
                                    }
                                    {property.hold &&
                                        <small className="fw-bold mb-2" style={{ color: defaultTheme.goldColorLogo }}>
                                            <FaUser className="me-1" /> Hold By: {property.holdByName}
                                        </small>
                                    }

                                    <small className="text-muted text-truncate mb-2">
                                        Posted By: {property.createdByName}
                                        {(property.createdByMainTeam || property.createdBySubTeam || property.createdByBranch) && (
                                            <> (
                                                {property.createdByMainTeam ?? "N/A"},
                                                {property.createdBySubTeam ?? "N/A"},
                                                {property.createdByBranch ?? "N/A"}
                                                )</>
                                        )}
                                    </small>

                                    {/* Property Action Buttons */}
                                    {property.sold ? (
                                        <Button disabled className="py-2" color="secondary" block>
                                            Sold 🎉
                                        </Button>
                                    ) : property.hold ? (
                                        <div className="d-flex gap-5">
                                            <Button
                                                color="info"
                                                block
                                                className="py-2"
                                                onClick={() => handlePropertyStatusChange(property.id, "release")}
                                            >
                                                Release Hold
                                            </Button>

                                            <Button
                                                color="primary"
                                                block
                                                className="py-2"
                                                onClick={() => handlePropertyStatusChange(property.id, "sold")}
                                            >
                                                Mark as Sold
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="d-flex gap-5">
                                            <Button
                                                color="warning"
                                                block
                                                onClick={() => handlePropertyStatusChange(property.id, "hold")}
                                            >
                                                Put on Hold
                                            </Button>

                                            <Button
                                                color="primary"
                                                block
                                                onClick={() => handlePropertyStatusChange(property.id, "sold")}
                                            >
                                                Mark as Sold
                                            </Button>
                                        </div>
                                    )}



                                </CardBody>
                            </Card>
                        </Col>
                    ))}
                </Row>

            </Container>

            {/* --- The Full-Screen Image Modal --- */}
            {modal && (
                <ImageGalleryModal
                    isOpen={modal}
                    toggle={toggleModal}
                    images={modalImages}
                    propertyAddress={modalPropertyAddress}
                    initialIndex={modalInitialIndex}
                />
            )}
        </PageContent>
    );
}