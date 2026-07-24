import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet } from "../../Hooks/useApi";
import { ADD_BRANCH, GET_ALL_BRANCH, UPDATE_BRANCH } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { useUserStore } from "../../store/useUserStore";
import { formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import ApiClient from "../../helpers/api_helper";
import { FaEdit } from "react-icons/fa";
import { scrollToTop } from "../../constants/global";
import { defaultTheme } from "../../helpers/defaultTheme";

export default function BranchMaster() {
    const userId = useUserStore((state) => state.user.userId);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [branchStrength, setBranchStrength] = useState("");
    const [accessGranted, setAccessGranted] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'branch-master');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const { data: branchList, isLoading, refetch: getAllData } = useGet(`${GET_ALL_BRANCH}`, { enabled: Boolean(accessGranted) });

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, i) => i + 1,
            width: '10%'
        },
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            width: "10%",
            cell: (row) => (
                <FaEdit
                    size={18}
                    style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                    onClick={() => handleEdit(row)}
                />
            )
        },
        {
            name: <span className="font-weight-bold fs-13">Branch</span>,
            selector: (row) => row.location,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.location}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Branch Strength</span>,
            selector: (row) => row.capacity,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.capacity}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Created At</span>,
            selector: (row) => row.createdDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>
        },
    ];

    const handleEdit = (row) => {
        scrollToTop();
        setEditId(row.id);
        setSelectedBranch(row.location);
        setBranchStrength(row.capacity);
    };

    // Handler for Save button click
    const handleButtonClick = (e) => {
        e.preventDefault();

        if (!selectedBranch) {
            toast.error("Please Enter Branch Name");
            return;
        }

        if (!branchStrength) {
            toast.error("Please Enter Branch Strength");
            return;
        }

        if (editId) {
            updateBranch();
        } else {
            addBranch();
        }
    };

    const updateBranch = () => {
        setIsPending(true);

        ApiClient.post(`${UPDATE_BRANCH}?id=${editId}&locationName=${selectedBranch}&capacity=${branchStrength}&isActive=YES`)
            .then((response) => {
                setIsPending(false);

                if (response?.data?.status === 1) {
                    toast.success(response.data.data);
                    handleClear();
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch((error) => {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    const addBranch = () => {
        setIsPending(true)
        ApiClient.post(`${ADD_BRANCH}?locationName=${selectedBranch}&capacity=${branchStrength}&isActive=YES`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.data);
                    handleClear();
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    const handleClear = () => {
        setSelectedBranch("");
        setBranchStrength("");
        getAllData();
        setEditId(null);
    }

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            {(isPending || isLoading) && <ScreenLoader />}
            <Breadcrumbs title="Master" breadcrumbItem="Branch" />
            <Container fluid={true}>
                <form onSubmit={handleButtonClick}>
                    <Card>
                        <CardBody>
                            <Row className="g-3">
                                <Col lg="5">
                                    <h6 className="font-size-12">Branch Name</h6>
                                    <input
                                        className="form-control"
                                        placeholder="Branch Name"
                                        value={selectedBranch}
                                        onChange={(e) => setSelectedBranch(e.target.value)}
                                    />
                                </Col>
                                <Col lg="2">
                                    <h6 className="font-size-12">Branch Strength</h6>
                                    <input
                                        className="form-control"
                                        placeholder="Branch Strength"
                                        value={branchStrength}
                                        onChange={(e) => setBranchStrength(e.target.value)}
                                    />
                                </Col>
                                <Col md="3" className="d-flex align-items-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={handleButtonClick}
                                    >
                                        {editId ? "Update" : "Save"}
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
                        </CardBody>
                    </Card>
                </form>
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={Array.isArray(branchList?.data?.data) ? branchList?.data?.data : []}
                    pagination
                />
            </Container>
        </PageContent>
    );
}