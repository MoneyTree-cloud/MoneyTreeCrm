import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import {
    CONNECT_LOCATION_CHANGE_STATUS,
    CREATE_CONNECT_LOCATION,
    GET_ALL_CONNECT_LOCATION,
} from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import Switch from "react-switch";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function ConnectLocationMaster() {
    const [selectedLocation, setSelectedLocation] = useState("");
    const [locationId, setLocationId] = useState("");
    const userId = useUserStore((state) => state.user.userId);
    const [accessGranted, setAccessGranted] = useState(null);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'connect-location-master');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const { isPending: addLoading, mutate: mutateAdd } = usePost(
        `${CREATE_CONNECT_LOCATION}${selectedLocation}&stateCode=${selectedLocation}`,
        {
            onSuccess: (response) => {
                setSelectedLocation("");
                if (response?.data.status === 1) {
                    toast.success(response.data.message);
                    getAllData();
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    const { isPending: changeLoading, mutate: mutateChange } = usePost(
        `${CONNECT_LOCATION_CHANGE_STATUS}${locationId}`,
        {
            onSuccess: (response) => {
                setLocationId("");
                if (response?.data.status === 1) {
                    toast.success(response.data.message);
                    getAllData();
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    const handleSwitchChange = (row) => {
        setLocationId(row.id);
    };

    useEffect(() => {
        if (locationId) {
            mutateChange()
        }
    }, [locationId, mutateChange])

    const {
        data: locationIdList,
        isLoading,
        refetch: getAllData,
    } = useGet(`${GET_ALL_CONNECT_LOCATION}`, { enabled: Boolean(accessGranted) });

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (row, index) => index + 1,
            sortable: true,
            width: '10%'
        },
        {
            name: <span className="font-weight-bold fs-13">Location</span>,
            selector: (row) => row.stateName,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            cell: (row) => (
                <Switch
                    checked={row.active}
                    offColor={defaultTheme.goldColorLogo}
                    onColor={defaultTheme.primary}
                    height={20}
                    width={40}
                    onChange={() => handleSwitchChange(row)}
                />
            ),
        },
    ];


    // Handler for Save button click
    const handleButtonClick = (e) => {
        e.preventDefault()
        if (!selectedLocation) {
            toast.error("Please Enter Location");
        } else {
            mutateAdd();
        }
    };

    const handleClearData = () => {
        setLocationId('')
        setSelectedLocation('')
    }

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            {(addLoading || changeLoading || isLoading) && <ScreenLoader />}
            <Breadcrumbs title="Connect" breadcrumbItem="Location" />
            <Container fluid={true}>
                <form onSubmit={handleButtonClick}>
                    <Card>
                        <CardBody>
                            <Row>
                                <Col lg="8">
                                    <h6 className="font-size-12 mt-1">Location Name</h6>
                                    <input
                                        className="form-control"
                                        placeholder="Location Name..."
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                    />
                                </Col>
                                <Col md="3" className="d-flex align-items-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary me-3"
                                        onClick={handleButtonClick}
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleClearData}
                                    >
                                        Clear
                                    </button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </form>
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={Array.isArray(locationIdList?.data?.data) ? locationIdList?.data?.data : []}
                    pagination
                />
            </Container>
        </PageContent>
    );
}
