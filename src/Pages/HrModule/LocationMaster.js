import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import { HR_CREATE_LOCATION, HR_LOCATION_GET_ALL, HR_LOCATION_STATUS_CHANGE, HR_UPDATE_LOCATION } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import Switch from "react-switch";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import { formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { FaEdit } from "react-icons/fa";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { scrollToTop } from "../../constants/global";

export default function LocationMaster() {
    const { empCode, userId } = useUserStore((state) => state.user);
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedAddress, setSelectedAddress] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [accessGranted, setAccessGranted] = useState(null);
    const { data: locationList, refetch: getAllData, isLoading } = useGet(`${HR_LOCATION_GET_ALL}`, { enabled: !!accessGranted });

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'location-master');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const handleSwitchChange = (row) => {
        ApiClient.get(`${HR_LOCATION_STATUS_CHANGE}${row.id}?updatedBy=${empCode}`)
            .then(function (response) {
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    getAllData();
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                toast.error(error.message);
            });
    };

    const handleEdit = (row) => {
        scrollToTop()
        setSelectedLocation(row.name);
        setSelectedAddress(row.address || "");
        setIsEditMode(true);
        setEditingId(row.id);
    };

    const handleClear = () => {
        setSelectedLocation("");
        setSelectedAddress("");
        setIsEditMode(false);
        setEditingId(null);
    };

    const handleButtonClick = (e) => {
        e.preventDefault();
        if (!selectedLocation) {
            toast.error("Please Enter Location");
        } else if (!selectedAddress) {
            toast.error("Please Enter Address");
        } else {
            if (isEditMode) {
                updateLocation();
            } else {
                addLocationList();
            }
        }
    };

    const { isPending: addLoading, mutate: addLocationList } = usePost(
        `${HR_CREATE_LOCATION}name=${selectedLocation}&address=${selectedAddress}&createdBy=${empCode}`,
        {
            onSuccess: (response) => {
                handleClear();
                if (response?.data.status === 1) {
                    toast.success(response.data.message);
                    getAllData();
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                handleClear();
                toast.error(err.message);
            },
        }
    );

    const { isPending: updateLoading, mutate: updateLocation } = usePost(
        `${HR_UPDATE_LOCATION}name=${selectedLocation}&address=${selectedAddress}&id=${editingId}`,
        {
            onSuccess: (response) => {
                handleClear();
                if (response?.data.status === 1) {
                    toast.success(response.data.message);
                    getAllData();
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                handleClear();
                toast.error(err.message);
            },
        }
    );

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: '7%',
        },
        {
            name: <span className="font-weight-bold fs-13">Manage</span>,
            cell: (row) => (
                <FaEdit
                    style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                    onClick={() => handleEdit(row)}
                    title="Edit"
                    size={20}
                />
            ),
            width: '8%',
        },
        {
            name: <span className="font-weight-bold fs-13">Location</span>,
            selector: (row) => row.name,
            sortable: true,
            width: '12%',
            cell: (row) => <WordWrapCell>{row.name}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Address</span>,
            selector: (row) => row.address,
            sortable: true,
            width: '45%',
            cell: (row) => <WordWrapCell>{row.address}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Created At</span>,
            selector: (row) => formatDateTime(row.createdAt),
            sortable: true,
            width: '15%',
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdAt)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            cell: (row) => (
                <Switch
                    checked={row.active === true}
                    offColor={defaultTheme.goldColorLogo}
                    onColor={defaultTheme.primary}
                    height={20}
                    width={40}
                    onChange={() => handleSwitchChange(row)}
                />

            ),
        },
    ];

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            {(addLoading || updateLoading || isLoading) && <ScreenLoader />}
            <Breadcrumbs title="Master" breadcrumbItem="Location" />
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleButtonClick}>
                            <Row className="g-3">
                                <Col lg="4">
                                    <h6 className="font-size-12">Location</h6>
                                    <input
                                        className="form-control"
                                        placeholder="Enter Location..."
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                    />
                                </Col>
                                <Col lg="6">
                                    <h6 className="font-size-12">Address</h6>
                                    <input
                                        className="form-control"
                                        placeholder="Enter Address..."
                                        value={selectedAddress}
                                        onChange={(e) => setSelectedAddress(e.target.value)}
                                    />
                                </Col>
                                <Col lg="2" className="d-flex align-items-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={handleButtonClick}
                                    >
                                        {isEditMode ? "Update" : "Save"}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary ms-2"
                                        onClick={handleClear}
                                    >
                                        Clear
                                    </button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={Array.isArray(locationList?.data?.data) ? locationList?.data?.data : []}
                    pagination
                />
            </Container>
        </PageContent>
    );
}
