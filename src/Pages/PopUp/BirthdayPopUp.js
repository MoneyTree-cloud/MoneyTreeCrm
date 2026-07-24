import React, { useState, useEffect } from 'react'
import PageContent from '../../components/Common/PageContent'
import Breadcrumbs from '../../components/Common/Breadcrumb'
import { Container, Row, Col, Button, Card, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { FaUpload, FaImage, FaVideo, FaInstagram } from 'react-icons/fa'
import { ADD_BIRTHDAY_POPUP_DATA, BIRTHDAY_POPUP_LIST, DELETE_POPUP_FROM_LIST } from '../../helpers/url_helper'
import { useGet, usePost } from '../../Hooks/useApi'
import { formatDate, formatDateForInput } from '../../helpers/function_helper'
import ScreenLoader from '../../constants/ScreenLoader'
import { useUserStore } from '../../store/useUserStore'
import { toast } from 'react-toastify'
import '../CSS/styles.css'
import { imageBaseUrl } from '../../helpers/api_helper'
import { defaultTheme } from '../../helpers/defaultTheme'
import ImageModal from '../../components/Common/ImageModal'
import { MdDelete, MdMobileFriendly } from 'react-icons/md'
import CheckUserAccess from '../../components/Common/CheckUserAccess'
import PermissionMissing from '../Utility/PermissonMissing'
import { decryptData } from '../../components/Common/CryptoUtils'

function getMonthRange(monthType = 'current') {
    const now = new Date();
    let monthOffset = 0;

    if (monthType === 'previous') {
        monthOffset = -1;
    } else if (monthType === 'next') {
        monthOffset = 1;
    }

    const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0);

    return {
        startDate: formatDateForInput(start),
        endDate: formatDateForInput(end)
    };
}


export default function BirthdayPopUp() {
    const userId = useUserStore((state) => state.user.userId)
    const [selectedMonth, setSelectedMonth] = useState('current')
    const [dateRange, setDateRange] = useState(getMonthRange('current'))
    const [rowStates, setRowStates] = useState({})
    const toggleModal = () => setFileModalOpen(!fileModalOpen);
    const [fileModalOpen, setFileModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [accessGranted, setAccessGranted] = useState(null);
    const [birthdayList, setBirthdayList] = useState([]);

    useEffect(() => {
        setDateRange(getMonthRange(selectedMonth))
    }, [selectedMonth])

    const query = `&fromDate=${dateRange.startDate}&toDate=${dateRange.endDate}`
    const { data, isLoading, refetch: getLists } = useGet(`${BIRTHDAY_POPUP_LIST}${query}`, { enabled: !!accessGranted })

    useEffect(() => {
        if (data?.data?.status === 1) {
            decryptData(data?.data?.data).then((decryptedData) => {
                if (decryptedData) {
                    setBirthdayList(decryptedData);
                } else {
                    setBirthdayList([])
                }
            });
        }
    }, [data]);

    const { isPending: isPendingAdd, mutate: mutateAdd } = usePost(ADD_BIRTHDAY_POPUP_DATA, {
        onSuccess: (response) => {
            if (response?.data?.status === 1) {
                toast.success(response.data.message)
                getLists()
            } else {
                toast.error(response.data.message)
            }
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    const handleFileChange = (e, index) => {
        const file = e.target.files[0]
        if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
            const fileURL = URL.createObjectURL(file)
            setRowStates(prev => ({
                ...prev,
                [index]: {
                    ...prev[index],
                    file,
                    fileURL,
                    fileType: file.type
                }
            }))
        }
    }

    function updateYearToCurrent(birthdayDate) {
        const dateObj = new Date(birthdayDate);
        if (isNaN(dateObj)) {
            throw new Error("Invalid date format. Use 'DD-MMM-YYYY' (e.g., 01-May-1985).");
        }

        const currentYear = new Date().getFullYear();

        const updatedDate = new Date(currentYear, dateObj.getMonth(), dateObj.getDate() + 1);
        return updatedDate.toISOString().split('T')[0];
    }

    const handleSave = (index, birthDate, employeeCode) => {
        const rowData = rowStates[index]

        if (!rowData?.file) {
            toast.error('Please upload an image before saving.')
            return
        }
        const formattedDate = updateYearToCurrent(birthDate)
        const formDataApi = new FormData()
        formDataApi.append('popupFromDate', formattedDate)
        formDataApi.append('popupToDate', formattedDate)
        formDataApi.append('loginId', userId)
        formDataApi.append('type', 'image')
        formDataApi.append('popup', rowData.file)
        formDataApi.append('employeeCode', employeeCode)

        mutateAdd(formDataApi, {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    setRowStates(prev => ({
                        ...prev,
                        [index]: {}
                    }))
                }
            },
            onError: (err) => {
            }
        })
    }

    const renderPreviewIcon = (fileType, fileURL) => {
        if (!fileType || !fileURL) return null
        const isImage = fileType.startsWith('image/')
        const isVideo = fileType.startsWith('video/')
        return (
            <a href={fileURL} target="_blank" rel="noopener noreferrer" title="View File">
                {isImage && <FaImage size={20} className="text-info" />}
                {isVideo && <FaVideo size={20} className="text-success" />}
            </a>
        )
    }

    const handleShowFile = (file) => {
        if (file) {
            const url = imageBaseUrl + file;
            setCurrentImage(url);
            toggleModal();
        }
    };

    const handleDeleteClick = (id) => {
        setSelectedId(id);
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        setIsModalOpen(false);
        mutateDelete();
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const { isPending: isPendingDelete, mutate: mutateDelete } = usePost(
        DELETE_POPUP_FROM_LIST + selectedId,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    getLists();
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'birthday-popup');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Pop-Up" breadcrumbItem="Birthday" />
            {(isLoading || isPendingAdd || isPendingDelete) && <ScreenLoader />}
            <Card className='p-3'>
                <Container fluid={true}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h5 className="mb-4">
                            🎉 Birthday List for {new Date(dateRange.startDate).toLocaleString('default', { month: 'long' })}
                        </h5>
                        <div className="radio-button-container mb-3">
                            {["previous","current", "next"].map((type) => (
                                <label
                                    key={type}
                                    className={`radio-label ${selectedMonth === type ? "active" : ""}`}
                                >
                                    <input
                                        type="radio"
                                        value={type}
                                        checked={selectedMonth === type}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                    />
                                    {type.charAt(0).toUpperCase() + type.slice(1)} Month
                                </label>
                            ))}
                        </div>

                    </div>
                    {birthdayList?.content?.map((item, index) => (
                        <Row key={index} className="birthday-row align-items-center mb-4 p-3 border rounded shadow-sm bg-white">

                            {/* Serial Number */}
                            <Col md="1" className="text-center fw-bold fs-5">
                                {index + 1}
                            </Col>

                            {/* Basic Info */}
                            <Col md="2">
                                <div className="fw-semibold">{item.name || "-"}</div>
                                <div className="text-muted small">({item.employeeCode || "-"})</div>
                            </Col>

                            {/* Birthday Date */}
                            <Col md="2">
                                <div className="fw-medium">🎂 {item.birthdayDate || "-"}</div>
                                <div className="small">DOJ: <strong>{formatDate(item.doj) || "-"}</strong></div>
                            </Col>

                            {/* Teams */}
                            <Col md="2">
                                <div className="small">MT: <strong>{item.mainTeam || "-"}</strong></div>
                                <div className="small">ST: <strong>{item.subTeam || "-"}</strong></div>
                            </Col>

                            {/* Contact */}
                            <Col md="2">
                                <div className="phone-container small">
                                    <MdMobileFriendly
                                        className="phone-icon"
                                        color={defaultTheme.goldColorLogo}
                                        size={18}
                                    />
                                    <span className="phone-number">{item.phoneNumber}</span>
                                </div>

                                <div><FaInstagram style={{ color: "#C13584" }} /> <span className="text-muted">{item.instagramId || "-"}</span></div>
                            </Col>

                            {/* Actions */}
                            <Col md="3" className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2 mt-2 mt-md-0">
                                {/* Upload */}
                                <label className="upload-label btn-sm">
                                    <FaUpload />
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={(e) => handleFileChange(e, index)}
                                        hidden
                                    />
                                </label>

                                {/* Preview Icon */}
                                {renderPreviewIcon(rowStates[index]?.fileType, rowStates[index]?.fileURL) && (
                                    <div className="preview-icon">
                                        {renderPreviewIcon(rowStates[index]?.fileType, rowStates[index]?.fileURL)}
                                    </div>
                                )}

                                {/* Save */}
                                <Button
                                    color="primary"
                                    size="sm"
                                    onClick={() => handleSave(index, item.birthdayDate, item.employeeCode)}
                                >
                                    Save
                                </Button>
                            </Col>

                            {/* Photo Display with Delete */}
                            {item.birthdayPhoto && (
                                <Col md="12" className="d-flex justify-content-center mt-2 pt-2 border-top aling-items-center">
                                    <img
                                        src={imageBaseUrl + item.birthdayPhoto}
                                        alt="Profile"
                                        className="birthday-img me-4"
                                        onClick={() => handleShowFile(item.birthdayPhoto)}
                                    />
                                    <MdDelete
                                        onClick={() => handleDeleteClick(item.popupId)}
                                        cursor={'pointer'}
                                        color='red'
                                        className='mt-2'
                                        size={22}
                                        title="Delete"
                                    />
                                </Col>
                            )}
                        </Row>
                    ))}

                </Container>
            </Card>

            <ImageModal
                isOpen={fileModalOpen}
                toggle={toggleModal}
                imageSrc={currentImage}
            />

            <Modal isOpen={isModalOpen} toggle={handleCloseModal}>
                <ModalHeader toggle={handleCloseModal}>Confirm Deletion</ModalHeader>
                <ModalBody>Are you sure you want to delete this item?</ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        style={{ backgroundColor: defaultTheme.primary }}
                        onClick={handleDeleteConfirm}
                    >
                        Yes
                    </Button>
                    <Button
                        color="secondary"
                        style={{ backgroundColor: defaultTheme.goldColorLogo }}
                        onClick={handleCloseModal}
                    >
                        No
                    </Button>
                </ModalFooter>
            </Modal>
        </PageContent>
    )
}
