import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import {
    CONNECT_OCCUPATION_CHANGE_STATUS,
    CREATE_CONNECT_OCCUPATION,
    GET_ALL_CONNECT_OCCUPATION,
} from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import Switch from "react-switch";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import { formatDate } from "../../helpers/function_helper";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function ConnectOccupationMaster() {
    const empCode = useUserStore((state) => state.user.empCode);

    const [selectedOccupation, setSelectedOccupation] = useState("");
    const [occupationId, setOccupationId] = useState("");
     const userId = useUserStore((state) => state.user.userId);
  const [accessGranted, setAccessGranted] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'connect-occupation-master');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

    const { isPending: addLoading, mutate: mutateAdd } = usePost(
        `${CREATE_CONNECT_OCCUPATION}${selectedOccupation}&userId=${empCode}`,
        {
            onSuccess: (response) => {
                setSelectedOccupation("");
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
        `${CONNECT_OCCUPATION_CHANGE_STATUS}${occupationId}`,
        {
            onSuccess: (response) => {
                setOccupationId("");
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
        setOccupationId(row.id);
    };

    useEffect(() => {
        if (occupationId) {
            mutateChange()
        }
    }, [occupationId, mutateChange])

    const {
        data: occupationIdList,
        isLoading,
        refetch: getAllData,
    } = useGet(`${GET_ALL_CONNECT_OCCUPATION}`,{enabled: Boolean(accessGranted)});

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (row, index) => index + 1,
            sortable: true,
            width:'10%'
        },
        {
            name: <span className="font-weight-bold fs-13">Occupation</span>,
            selector: (row) => row.occupationName,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Created Date</span>,
            selector: (row) => formatDate(row.createdDate),
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
        if (!selectedOccupation) {
            toast.error("Please Enter Occupation");
        } else {
            mutateAdd();
        }
    };

    const handleClearData = () => {
        setOccupationId('')
        setSelectedOccupation('')
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
            <Breadcrumbs title="Connect" breadcrumbItem="Occupation" />
            <Container fluid={true}>
                <form onSubmit={handleButtonClick}>
                    <Card>
                        <CardBody>
                            <Row>
                                <Col lg="8">
                                    <h6 className="font-size-12 mt-1">Occupation Name</h6>
                                    <input
                                        className="form-control"
                                        placeholder="Occupation Name..."
                                        value={selectedOccupation}
                                        onChange={(e) => setSelectedOccupation(e.target.value)}
                                    />
                                </Col>

                                <Col md="3" className="d-flex align-items-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary me-2"
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
                    data={Array.isArray(occupationIdList?.data?.data) ? occupationIdList?.data?.data : []}
                    pagination
                />
            </Container>
        </PageContent>
    );
}
