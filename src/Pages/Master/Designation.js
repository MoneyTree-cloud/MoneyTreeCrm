import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import { CHANGE_POSITION_STATUS, CREATE_POSITION, GET_ALL_POSITION } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import Switch from "react-switch";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import ApiClient from "../../helpers/api_helper";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { WordWrapCell } from "../../helpers/function_helper";

export default function Designation() {
    const [selectedDesignation, setSelectedDesignation] = useState("");
    const { empCode, userId } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);

    const { data: designationList, refetch: getAllData, isLoading } = useGet(`${GET_ALL_POSITION}`, { enabled: Boolean(accessGranted) });

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'designation');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const handleSwitchChange = (row) => {
        ApiClient.get(`${CHANGE_POSITION_STATUS}${row.id}`)
            .then(function (response) {
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    getAllData()
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                toast.error(error.message);
            });
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: '10%'
        },
        {
            name: <span className="font-weight-bold fs-13">Designation</span>,
            selector: (row) => row.position,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.position}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            cell: (row) => (
                <Switch
                    checked={row.status === true}
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
        e.preventDefault();
        if (!selectedDesignation) {
            toast.error("Please Enter Designation");
        } else {
            addDesList()
        }
    };

    const handleClear = () => {
        setSelectedDesignation("");
    }

    const { isPending: addLoading, mutate: addDesList } = usePost(
        `${CREATE_POSITION}${selectedDesignation}&createdBy=${empCode}`,
        {
            onSuccess: (response) => {
                handleClear()
                if (response?.data.status === 1) {
                    toast.success(response.data.message);
                    getAllData();
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                handleClear()
                toast.error(err.message);
            },
        }
    );

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            {(addLoading || isLoading) && <ScreenLoader />}
            <Breadcrumbs title="Master" breadcrumbItem="Designation" />
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleButtonClick}>
                            <Row className="g-3">
                                <Col lg="6">
                                    <h6 className="font-size-12"> Designation</h6>
                                    <input
                                        className="form-control"
                                        placeholder="Enter Designation..."
                                        value={selectedDesignation}
                                        onChange={(e) => setSelectedDesignation(e.target.value)}
                                    />
                                </Col>
                                <Col md="3" className="d-flex align-items-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={handleButtonClick}
                                    >
                                        Save
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
                    data={Array.isArray(designationList?.data?.data) ? designationList?.data?.data : []}
                    pagination
                />
            </Container>
        </PageContent>
    );
}
