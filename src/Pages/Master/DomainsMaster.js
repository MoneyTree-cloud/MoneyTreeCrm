import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet } from "../../Hooks/useApi";
import { GET_ALL_DOMAIN_MASTER, SAVE_DOMAIN_MASTER, UPDATE_DOMAIN_MASTER } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { useUserStore } from "../../store/useUserStore";
import { formatDate, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import ApiClient from "../../helpers/api_helper";
import { FaEdit } from "react-icons/fa";
import { defaultTheme } from "../../helpers/defaultTheme";
import { scrollToTop } from "../../constants/global";

export default function DomainsMaster() {
    const [selectedDomain, setSelectedDomain] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const { userId, empCode, userName } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);
    const [isPending, setIsPending] = useState(false)
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'domains-master');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const { data: domainsList, isLoading, refetch: getAllData } = useGet(`${GET_ALL_DOMAIN_MASTER}`, { enabled: Boolean(accessGranted) });

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, i) => i + 1,
            width: '10%'
        },
        {
            name: <span className="font-weight-bold fs-13">Manage</span>,
            cell: (row) => (
                <FaEdit
                    style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                    onClick={() => handleEdit(row)}
                    title="Manage Domains"
                    size={20}
                />
            ),
            width: '15%'
        },
        {
            name: <span className="font-weight-bold fs-13">Domain Name</span>,
            selector: (row) => row.domainName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.domainName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Domain Expiry Date</span>,
            selector: (row) => row.expiryDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.expiryDate)}</WordWrapCell>
        },
    ];

    const handleEdit = (row) => {
        scrollToTop()
        setEditId(row.id);
        setSelectedDomain(row.domainName);
        setExpiryDate(row.expiryDate);
    };

    // Handler for Save button click
    const handleButtonClick = (e) => {
        e.preventDefault();

        if (!selectedDomain) {
            return toast.error("Please Enter Domain");
        }

        if (!expiryDate) {
            return toast.error("Please Enter Expiry Date");
        }

        if (editId) {
            updateDomain();
        } else {
            addDomainList();
        }
    };

    const updateDomain = () => {
        setIsPending(true);

        ApiClient.post(
            `${UPDATE_DOMAIN_MASTER}?id=${editId}&domainName=${selectedDomain}&expiryDate=${expiryDate}&updatedBy=${userName + ' (' + empCode + ')'}`
        )
            .then((response) => {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message || "Domain Updated Successfully");
                    handleClear();
                    getAllData();
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch((error) => {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    const addDomainList = () => {
        setIsPending(true)
        ApiClient.post(
            `${SAVE_DOMAIN_MASTER}?domainName=${selectedDomain}&expiryDate=${expiryDate}&createdBy=${userName + ' (' + empCode + ')'}`
        )
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message || "Domain Created Successfully");
                    getAllData()
                    handleClear();
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    }

    const handleClear = () => {
        setSelectedDomain("");
        setExpiryDate("")
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
            {(isLoading || isPending) && <ScreenLoader />}
            <Breadcrumbs title="Master" breadcrumbItem="Domains" />
            <Container fluid={true}>
                <form onSubmit={handleButtonClick}>
                    <Card>
                        <CardBody>
                            <Row className="g-3">
                                <Col lg="4">
                                    <h6 className="font-size-11">Domain Name <RequiredStar /></h6>
                                    <input
                                        className="form-control"
                                        placeholder="Enter Domain Name"
                                        value={selectedDomain}
                                        onChange={(e) => setSelectedDomain(e.target.value)}
                                    />
                                </Col>
                                <Col lg="4">
                                    <h6 className="font-size-11">Expiry Date <RequiredStar /></h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="4" className="d-flex align-items-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
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
                    data={Array.isArray(domainsList?.data?.data) ? domainsList?.data?.data : []}
                    pagination
                />
            </Container>
        </PageContent>
    );
}
