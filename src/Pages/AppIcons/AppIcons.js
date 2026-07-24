import React, { useEffect, useRef, useState } from "react";
import {
    Row,
    Col,
    Card,
    CardBody,
    Button,
    Container,
    ModalFooter,
    ModalBody,
    ModalHeader,
    Modal,
    Input
} from "reactstrap";
import { defaultTheme } from "../../helpers/defaultTheme";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
    CREATE_APP_BANNER,
    CHANGE_STATUS_APP_BANNER,
    CREATE_APP_ICON,
    ICONS_DROPDOWN,
    GET_ALL_APP_BANNER,
    STATUS_CHANGE_SCREEN,
    GET_ALL_SCREENS
} from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import { useGet, usePost } from "../../Hooks/useApi";
import AppTable from "../../components/Common/Table";
import { imageBaseUrl } from "../../helpers/api_helper";
import ImageModal from "../../components/Common/ImageModal";
import Select from "react-select";
import Switch from "react-switch";
import { formatDate, RequiredStar } from "../../helpers/function_helper";
import { MdAdd } from "react-icons/md";
import PageContent from "../../components/Common/PageContent";

const AppIcons = () => {
    const fileInputRef = useRef(null);
    const userId = useUserStore((state) => state.user.userId);
    const [currentImage, setCurrentImage] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [activeStatus, setActiveStatus] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const toggleModal = () => setModalOpen(!modalOpen);
    const [newIconModalOpen, setNewIconModalOpen] = useState(false); // State for new category modal
    const [newIcon, setNewIcon] = useState("");
    const [modalScreenId, setModalScreenId] = useState('')
    const [appIconType, setBannerType] = useState(null);
    const { data: iconsList, refetch: getIcons } = useGet(ICONS_DROPDOWN);
    const { data: allIconsList, refetch: getAllIconsList } = useGet(GET_ALL_SCREENS);

    const {
        data: bannerList,
        isLoading,
        refetch: getAllIcons,
    } = useGet(GET_ALL_APP_BANNER + userId);

    const [formData, setFormData] = useState({
        files: null,
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setFormData((prevState) => ({
            ...prevState,
            files: file,
        }));
    };

    const { isPending: isPendingAdd, mutate: mutateAdd } = usePost(
        CREATE_APP_BANNER,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    handleReset();
                    getAllIcons();
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    const { isPending: isPendingDelete, mutate: mutateStatusChange } = usePost(
        `${CHANGE_STATUS_APP_BANNER}${selectedId}&isActive=${activeStatus}&loginId=${userId}`,
        {
            onSuccess: (response) => {
                setSelectedId('')
                setActiveStatus('')
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    getAllIcons();
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                setSelectedId('')
                setActiveStatus('')
                toast.error(err.message);
            },
        }
    );

    const handleSave = (e) => {
        e.preventDefault();
        if (!appIconType) {
            toast.error("Please Select Screen Name");
        }
        else if (!formData.files) {
            toast.error("Please Choose Icon To Upload");
        }
        else {
            const formDataApi = new FormData();
            formDataApi.append("loginId", userId);
            formDataApi.append("type", 'ICON');
            formDataApi.append("iconNameId", appIconType?.value);
            formDataApi.append("file", formData.files);
            mutateAdd(formDataApi);
        }
    };

    const handleReset = () => {
        setFormData({
            files: null,
        });
        setBannerType(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the file input
        }
    };

    const handleViewFile = (fileName) => {
        const fileUrl = imageBaseUrl + fileName;
        setCurrentImage(fileUrl);
        toggleModal();
    };

    const profileStyle = {
        width: "35px",
        height: "35px",
        objectFit: "fill",
        cursor: "pointer", // Show finger (pointer) cursor on hover
        borderRadius: "50%", // Make it round (circular)
        border: "2px solid", // 2px solid border
        borderColor: defaultTheme.goldColorLogo, // Custom border color (using your theme's gold color)
        padding: "2px",
    };

    const handleSwitchChange = (row) => {
        setSelectedId(row.id);
        const newStatus = row.isActive === "YES" ? "NO" : "YES";
        setActiveStatus(newStatus);
    };

    const { isPending: isPendingDisable, mutate: mutateStatusModalChange } = usePost(
        `${STATUS_CHANGE_SCREEN}${modalScreenId}&loginId=${userId}`,
        {
            onSuccess: (response) => {
                setModalScreenId('')
                if (response?.data?.status === 1) {
                    getIcons();
                    getAllIconsList()
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                setModalScreenId('')
                toast.error(err.message);
            },
        }
    );

    const handleSwitchChangeModal = (row) => {
        setModalScreenId(row.id);
    };

    useEffect(() => {
        if (modalScreenId) {
            mutateStatusModalChange()
        }
    }, [modalScreenId, mutateStatusModalChange])

    useEffect(() => {
        if (selectedId && activeStatus) {
            mutateStatusChange();
        }
    }, [mutateStatusChange, selectedId, activeStatus]);

    const handleNewIconSave = () => {
        if (!newIcon) {
            toast.error('Screen Name Is Required')
            return
        }
        mutate();
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (row, index) => index + 1,
            sortable: true,
            width: '8%'
        },
        {
            name: <span className="font-weight-bold fs-13">File</span>,
            sortable: true,
            cell: (row) =>
                row.bannerUrl ? (
                    <img
                        src={imageBaseUrl + row.bannerUrl}
                        alt="File"
                        style={profileStyle}
                        onClick={() => handleViewFile(row.bannerUrl)}
                    />
                ) : null,
        },
        {
            name: <span className="font-weight-bold fs-13">Screen Name</span>,
            selector: (row) => row?.iconName?.iconName,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Created Date</span>,
            selector: (row) => formatDate(row.createdDate),
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            sortable: true,
            width: "10%",
            cell: (row) => (
                <Switch
                    onChange={() => handleSwitchChange(row)}
                    checked={row.isActive === 'YES'}
                    offColor={defaultTheme.goldColorLogo}
                    onColor={defaultTheme.primary}
                    height={20}
                    width={40}
                />
            ),
        },
    ];

    const columnsModal = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (row, index) => index + 1,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Screen Name</span>,
            selector: (row) => row?.iconName,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            sortable: true,
            cell: (row) => (
                <Switch
                    onChange={() => handleSwitchChangeModal(row)}
                    checked={row.active}
                    offColor={defaultTheme.goldColorLogo}
                    onColor={defaultTheme.primary}
                    height={20}
                    width={40}
                />
            ),
        },
    ];

    const { isPending, mutate } = usePost(`${CREATE_APP_ICON}${newIcon}&loginId=${userId}`, {
        onSuccess: (response) => {
            if (response?.data?.status === 1) {
                setNewIcon(""); // Reset new category input
                getIcons()
                getAllIconsList()
            } else {
                toast.error(response.data.message);
            }
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    const handleAppIconChange = (selectedOption) => {
        setBannerType(selectedOption); // Update the state with the selected option
    };

    return (
       <PageContent>
                <Container fluid={true}>
                    {(isPendingAdd || isLoading || isPendingDelete || isPending || isPendingDisable) && <ScreenLoader />}
                    <Breadcrumbs title="Icons" breadcrumbItem="App-Icons" />
                    <Button
                        color="primary"
                        onClick={() => setNewIconModalOpen(true)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 10,
                        }}
                    >
                        <MdAdd size={12} style={{ marginRight: 5 }} />
                        <span>Add Screen</span>
                    </Button>
                    <Row>
                        <Col>
                            <form onSubmit={handleSave}>
                                <Card>
                                    <CardBody>
                                        <Row>
                                            <Col md="4">
                                                <h6 className="font-size-11 mt-1">
                                                    Screen Name <RequiredStar/>
                                                </h6>

                                                <Select
                                                    style={{ zIndex: 9999 }}
                                                    menuPortalTarget={document.body}
                                                    isClearable
                                                    value={appIconType}
                                                    onChange={handleAppIconChange}
                                                    options={Array.isArray(iconsList?.data?.data) ? iconsList?.data?.data : []}
                                                />
                                            </Col>
                                            <Col md="4">
                                                <h6 className="mt-1 font-size-11">
                                                    Icon <RequiredStar/>
                                                </h6>
                                                <input
                                                    name="files"
                                                    type="file"
                                                    className="form-control"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    ref={fileInputRef}
                                                />
                                                <h6
                                                    className="font-size-10 mt-2"
                                                    style={{ color: defaultTheme.redColor }}
                                                >
                                                    Upload only Image
                                                </h6>
                                            </Col>



                                            <Col md="4 mt-4">
                                                <div className="d-flex align-items-center">
                                                    <Button
                                                        onClick={handleSave}
                                                        type="submit"
                                                        color="primary"
                                                        className="me-3"
                                                    >
                                                        Submit
                                                    </Button>{" "}
                                                    <Button
                                                        type="reset"
                                                        style={{
                                                            backgroundColor: defaultTheme.goldColorLogo,
                                                        }}
                                                        onClick={handleReset}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            </form>
                        </Col>
                    </Row>
                </Container>
                {Array.isArray(bannerList?.data?.data) &&
                    bannerList?.data?.data.length > 0 && (
                        <AppTable
                            progressPending={isLoading}
                            columns={columns}
                            data={
                                Array.isArray(bannerList?.data?.data)
                                    ? bannerList?.data?.data
                                    : []
                            }
                            pagination
                              
                        />
                    )}

            {/* New Icon Modal */}
            <Modal
                isOpen={newIconModalOpen}
                toggle={() => setNewIconModalOpen(false)}
            >
                <ModalHeader toggle={() => setNewIconModalOpen(false)}>
                    Add New Screen
                </ModalHeader>
                <ModalBody>
                    <Input
                        type="text"
                        placeholder="Enter Screen Name"
                        value={newIcon}
                        onChange={(e) => setNewIcon(e.target.value)}
                    />
                    {Array.isArray(allIconsList?.data?.data)
                        && allIconsList?.data?.data?.length > 0 &&
                        <AppTable
                            progressPending={isLoading}
                            columns={columnsModal}
                            data={
                                Array.isArray(allIconsList?.data?.data)
                                    ? allIconsList?.data?.data
                                    : []
                            }
                            pagination
                              
                        />
                    }
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        style={{ backgroundColor: defaultTheme.primary }}
                        onClick={handleNewIconSave}
                    >
                        Save
                    </Button>
                    <Button
                        color="secondary"
                        style={{ backgroundColor: defaultTheme.goldColorLogo }}
                        onClick={() => setNewIconModalOpen(false)}
                    >
                        Close
                    </Button>
                </ModalFooter>
            </Modal>

            <ImageModal
                isOpen={modalOpen}
                toggle={toggleModal}
                imageSrc={currentImage}
            />

        </PageContent>
    );
};

export default AppIcons;
