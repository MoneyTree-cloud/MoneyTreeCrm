import { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useGet } from "../../Hooks/useApi";
import { CREATE_PERSONAL_BIRTHDAY, DELETE_PERSONAL_BIRTHDAY, GET_ALL_PERSONAL_BIRTHDAY, UPDATE_PERSONAL_BIRTHDAY } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { formatDate, formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import ApiClient from "../../helpers/api_helper";
import { FaUserEdit } from "react-icons/fa";
import { defaultTheme } from "../../helpers/defaultTheme";
import { MdClose, MdDelete, MdSearch } from "react-icons/md";
import { scrollToTop } from "../../constants/global";

export default function PersonalBirthdayDetails() {
    const initialFormState = {
        name: "",
        dob: "",
        anniversary: "",
        remark: "",
        address: ""
    };
    const { userId, empCode, userName } = useUserStore((state) => state.user);
    const [formState, setFormState] = useState(initialFormState);
    const [accessGranted, setAccessGranted] = useState(null);
    const [isPending, setIsPending] = useState(false)
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("")

    const { data: personalData, refetch: getAllData, isLoading } = useGet(GET_ALL_PERSONAL_BIRTHDAY, { enabled: !!accessGranted });

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleClear = () => {
        setFormState(initialFormState);
        setEditId(null)
    };

    const handleSave = (e) => {
        e.preventDefault()

        if (!formState.name) {
            toast.error("Please Enter Name")
        }
        // else if (!formState.dob) {
        //     toast.error('Please Enter DOB')
        // }
        else if (!formState.address) {
            toast.error('Please Enter Address')
        }
        else if (!formState.remark) {
            toast.error('Please Enter Remarks')
        }
        else {
            setIsPending(true)
            const url = editId
                ? `${UPDATE_PERSONAL_BIRTHDAY}/${editId}?name=${formState.name}&DOB=${formState.dob}&Anniversary=${formState.anniversary}&address=${formState.address}&remark=${formState.remark}&createdBy=${userName + ' (' + empCode + ')'}`
                : `${CREATE_PERSONAL_BIRTHDAY}?name=${formState.name}&DOB=${formState.dob}&Anniversary=${formState.anniversary}&address=${formState.address}&remark=${formState.remark}&createdBy=${userName + ' (' + empCode + ')'}`

            const apiCall = editId
                ? ApiClient.put(url)   // UPDATE
                : ApiClient.post(url); // CREATE

            apiCall
                .then(function (response) {
                    setIsPending(false);
                    if (response?.data?.status === 1) {
                        handleClear()
                        getAllData()
                        toast.success(response.data.message);
                    } else {
                        toast.error(response.data.message);
                    }
                })
                .catch(function (error) {
                    setIsPending(false);
                    toast.error(error.message);
                });
        }
    };

    const formatInputDate = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toISOString().split("T")[0];
    };

    const handleManageRow = (row) => {
        scrollToTop()
        setEditId(row.id);
        setFormState({
            name: row.name || "",
            dob: formatInputDate(row.dob),
            anniversary: formatInputDate(row.anniversary),
            address: row.address || "",
            remark: row.remark || ""
        });
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "7%",
            cell: (_, index) => <WordWrapCell>{index + 1}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Manage</span>,
            cell: (row) => (
                <FaUserEdit size={22}
                    title="Manage User"
                    onClick={() => handleManageRow(row)}
                    style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }} />
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Name</span>,
            sortable: true,
            selector: (row) => row.name,
            cell: (row) => <WordWrapCell>{row.name || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">DOB</span>,
            sortable: true,
            selector: (row) => row.dob,
            cell: (row) => <WordWrapCell>{formatDate(row.dob) || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Anniversary</span>,
            sortable: true,
            selector: (row) => row.anniversary,
            cell: (row) => <WordWrapCell>{formatDate(row.anniversary) || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Address</span>,
            sortable: true,
            selector: (row) => row.address,
            cell: (row) => <WordWrapCell>{row.address || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Remarks</span>,
            sortable: true,
            selector: (row) => row.remark,
            cell: (row) => <WordWrapCell>{row.remark || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Created By</span>,
            sortable: true,
            selector: (row) => row.createdBy,
            cell: (row) => <WordWrapCell>{row.createdBy || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Created At</span>,
            sortable: true,
            selector: (row) => row.createdDate,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate) || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            cell: (row) => (
                <MdDelete
                    onClick={() => handleDeleteClick(row.id)}
                    style={{ cursor: "pointer", color: "red" }}
                    size={20}
                />
            ),
        },
    ];

    const handleDeleteClick = (id) => {
        const isConfirmed = window.confirm(
            "Are you sure you want to delete this?"
        );

        if (!isConfirmed) {
            return;
        }
        setIsPending(true);
        ApiClient.post(`${DELETE_PERSONAL_BIRTHDAY}/${id}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
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
    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'personal-birthday-details');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const filteredData = (personalData?.data?.data || []).filter(r =>
        !searchTerm || r.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Personal" breadcrumbItem="Details" />
            {(isPending || isLoading) && <ScreenLoader />}
            <Container fluid={true}>
                <form onSubmit={handleSave}>
                    <Card>
                        <CardBody>
                            <Row className="g-3">
                                <Col md="3">
                                    <h6 className="font-size-12">Name <RequiredStar /></h6>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        value={formState?.name || ""}
                                        onChange={handleInputChange}
                                        placeholder="Enter Name..."
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-12">DOB</h6>
                                    <input
                                        type="date"
                                        name="dob"
                                        className="form-control"
                                        value={formState?.dob || ""}
                                        onChange={handleInputChange}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-12">Anniversary </h6>
                                    <input
                                        type="date"
                                        name="anniversary"
                                        className="form-control"
                                        value={formState?.anniversary || ""}
                                        onChange={handleInputChange}
                                    />
                                </Col>
                                <Col md="5">
                                    <h6 className="font-size-12">Address <RequiredStar /></h6>
                                    <textarea
                                        name="address"
                                        className="form-control"
                                        rows="2"
                                        value={formState?.address || ""}
                                        onChange={handleInputChange}
                                        placeholder="Enter Address..."
                                    />
                                </Col>
                                {/* Remarks Textarea */}
                                <Col md="4">
                                    <h6 className="font-size-12">Remarks <RequiredStar /></h6>
                                    <textarea
                                        name="remark"
                                        className="form-control"
                                        rows="2"
                                        value={formState?.remark || ""}
                                        onChange={handleInputChange}
                                        placeholder="Enter Remarks..."
                                    />
                                </Col>
                                <Col md="3" className="d-flex align-items-end">
                                    <button
                                        className="btn btn-primary"
                                        type="submit"
                                    >
                                        {editId ? "Update" : "Save"}
                                    </button>

                                    <button
                                        className="btn btn-secondary ms-2"
                                        type="button"
                                        onClick={handleClear}
                                    >
                                        Cancel
                                    </button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </form>

                {/* Search Filter */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #E8ECF2", borderRadius: 10, padding: "8px 14px", marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,.04)", maxWidth: 320 }}>
                    <MdSearch size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Search by name…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ border: "none", outline: "none", fontSize: 13, color: "#0F172A", width: "100%", background: "transparent" }}
                    />
                    {searchTerm && <MdClose size={14} color="#94A3B8" style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => setSearchTerm("")} />}
                </div>

                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={filteredData || []}
                    pagination
                />
            </Container>
        </PageContent>
    );
}