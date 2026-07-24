import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost, usePut } from "../../Hooks/useApi";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import Switch from "react-switch";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { useUserStore } from "../../store/useUserStore";
import { formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import { CREATE_SCHEME_MASTER, GET_ALL_SCHEME_MASTER, STATUS_CHANGE_SCHEME_MASTER, UPDATE_SCHEME_MASTER } from "../../helpers/url_helper";
import { MdCancel } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";
import ApiClient from "../../helpers/api_helper";

export default function SchemeMaster() {
    const [schemeName, setSchemeName] = useState("");
    const [editId, setEditId] = useState(null);
    const [accessGranted, setAccessGranted] = useState(null);
    const [isPending, setIsPending] = useState(false)

    const { userId, empCode, userName } = useUserStore((state) => state.user);

    // ── Access check ──────────────────────────────────────────────────────
    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, "scheme-master");
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    // ── GET ALL ───────────────────────────────────────────────────────────
    const {
        data: schemeList,
        isLoading,
        refetch: getAllData,
    } = useGet(`${GET_ALL_SCHEME_MASTER}`, { enabled: Boolean(accessGranted) });

    // ── CREATE ────────────────────────────────────────────────────────────
    const { isPending: createLoading, mutate: createScheme } = usePost(
        `${CREATE_SCHEME_MASTER}?scheme=${encodeURIComponent(schemeName.trim())}&createdBy=${encodeURIComponent(userName + ' (' + empCode + ')')}`,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    toast.success(response.data.message || "Scheme created");
                    resetForm();
                    getAllData();
                } else {
                    toast.error(response?.data?.message || "Failed to create scheme");
                }
            },
            onError: (err) => toast.error(err.message),
        }
    );

    // ── UPDATE ────────────────────────────────────────────────────────────
    const { isPending: updateLoading, mutate: updateScheme } = usePut(
        `${UPDATE_SCHEME_MASTER}/${editId}?scheme=${encodeURIComponent(schemeName.trim())}&createdBy=${encodeURIComponent(userName + ' (' + empCode + ')')}`,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    toast.success(response.data.message || "Scheme updated");
                    resetForm();
                    getAllData();
                } else {
                    toast.error(response?.data?.message || "Failed to update scheme");
                }
            },
            onError: (err) => toast.error(err.message),
        }
    );
    // ── Handlers ──────────────────────────────────────────────────────────
    const resetForm = () => {
        setSchemeName("");
        setEditId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmed = schemeName.trim();
        if (!trimmed) {
            toast.error("Please enter scheme name");
            return;
        }

        if (editId) {
            updateScheme();
        } else {
            createScheme()
        }
    };

    const handleEdit = (row) => {
        setEditId(row.id);
        setSchemeName(row.scheme ?? row.schemeName ?? "");
        // Bring the form into view if needed:
        window?.scrollTo?.({ top: 0, behavior: "smooth" });
    };

    const handleSwitchChange = (row) => {
        if (!window.confirm(`Are You Sure To Change status?`)) return;
        setIsPending(true)
        ApiClient.post(
            `${STATUS_CHANGE_SCHEME_MASTER}/${row.id}`,
        )
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message || "Status updated");
                    getAllData();
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    const handleClear = () => resetForm();

    // ── Columns ───────────────────────────────────────────────────────────
    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "10%",
        },
        {
            name: <span className="font-weight-bold fs-13">Scheme</span>,
            selector: (row) => row.scheme,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.scheme}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Created By</span>,
            selector: (row) => row.createdBy,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.createdBy}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Created At</span>,
            selector: (row) => row.createdDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            cell: (row) => (
                <div className="d-flex align-items-center gap-2">
                    <Switch
                        checked={row.active}
                        offColor={defaultTheme.goldColorLogo}
                        onColor={defaultTheme.primary}
                        height={20}
                        width={40}
                        onChange={() => handleSwitchChange(row)}
                    />
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary p-1 d-flex align-items-center"
                        title="Edit"
                        onClick={() => handleEdit(row)}
                    >
                        <FaUserEdit size={14} />
                    </button>
                </div>
            ),
            width: "20%",
        },
    ];

    // ── Render guards ─────────────────────────────────────────────────────
    if (accessGranted === null) return <ScreenLoader />;
    if (!accessGranted) return <PermissionMissing />;

    const isBusy = createLoading || updateLoading || isPending || isLoading;

    return (
        <PageContent>
            {isBusy && <ScreenLoader />}
            <Breadcrumbs title="Master" breadcrumbItem="Scheme" />

            <Container fluid={true}>
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardBody>
                            <Row className="g-3">
                                <Col lg="6">
                                    <h6 className="font-size-12">Scheme Name <RequiredStar /></h6>
                                    <input
                                        className="form-control"
                                        placeholder="Enter Scheme Name"
                                        value={schemeName}
                                        onChange={(e) => setSchemeName(e.target.value)}
                                    />
                                </Col>
                                <Col md="3" className="d-flex align-items-end">
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
                                        {editId ? (
                                            <>
                                                <MdCancel size={14} className="me-1" />
                                                Cancel
                                            </>
                                        ) : (
                                            "Clear"
                                        )}
                                    </button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </form>

                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={
                        Array.isArray(schemeList?.data?.data)
                            ? schemeList.data.data
                            : []
                    }
                    pagination
                />
            </Container>
        </PageContent>
    );
}