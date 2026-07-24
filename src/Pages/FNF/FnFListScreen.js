/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card, CardBody, Badge, Button, Row, Col, Nav, NavItem, NavLink, Input } from "reactstrap";
import classnames from "classnames";
import PageContent from "../../components/Common/PageContent";
import { FaEye, FaPlus, FaClock, FaCheckDouble, FaFilePdf, FaUserEdit, FaUpload, FaFileInvoiceDollar } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import ApiClient, { hrImageBaseUrl } from "../../helpers/api_helper";
import { GET_FNF_LIST_URL, GET_ALL_FNF_LIST_URL, UPLOAD_FNF_FILE } from "../../helpers/url_helper";
import { formatDate, formatDateTime, generateTimestamp, WordWrapCell } from "../../helpers/function_helper";
import ViewClearanceModal from "./ViewClearanceModal";
import AppTable from "../../components/Common/Table";
import ScreenLoader from "../../constants/ScreenLoader";
import { generateNoDuesPDF } from "./GenerateNoDuesPDF";
import { useUserStore } from "../../store/useUserStore";
import { USER_TYPE } from "../../constants/global";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import ManageHandoverModal from "./ManageHandoverModal";
import { defaultTheme } from "../../helpers/defaultTheme";
import * as XLSX from "xlsx";
import { usePost } from "../../Hooks/useApi";

export default function FnFListScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId, role, locationName } = useUserStore((state) => state.user);

    // States
    const [loading, setLoading] = useState(false);
    const [dataList, setDataList] = useState({ content: [], totalElements: 0 });
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("NO");
    const [page, setPage] = useState(1);
    const LIMIT = 200;
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [manageModalOpen, setManageModalOpen] = useState(false);
    const [selectedModalRow, setSelectedModalRow] = useState(null);
    const [accessGranted, setAccessGranted] = useState(null);
    const [file, setFile] = useState({});

    // Role Logic
    const path = location.pathname;
    const isHR = path.includes("hr-fnf-list");
    const isHOD = path.includes("hods-fnf-list");
    const isFinance = path.includes("finance-fnf-list");
    const isAdmin = path.includes("admin-fnf-list");
    const isIT = path.includes("it-fnf-list");
    const isOps = path.includes("ops-fnf-list");

    useEffect(() => {
        const checkAccess = async () => {
            let hasAccess = false;

            // 🔒 HOD route → role condition applies
            if (isHOD) {
                if (role !== USER_TYPE.ASSOCIATE) {
                    hasAccess = await CheckUserAccess(userId, "hods-fnf-list");
                } else {
                    hasAccess = true;
                }
            }
            // 🔓 All other routes → no role condition
            else if (isHR) {
                hasAccess = await CheckUserAccess(userId, "hr-fnf-list");
            }
            else if (isFinance) {
                hasAccess = await CheckUserAccess(userId, "finance-fnf-list");
            }
            else if (isAdmin) {
                if (role !== USER_TYPE.ASSOCIATE) {
                    hasAccess = await CheckUserAccess(userId, "admin-fnf-list");
                }
                else {
                    hasAccess = true;
                }
            }
            else if (isIT) {
                hasAccess = await CheckUserAccess(userId, "it-fnf-list");
            }
            else if (isOps) {
                hasAccess = await CheckUserAccess(userId, "ops-fnf-list");
            }
            else {
                hasAccess = false;
            }
            setAccessGranted(hasAccess);
        };

        checkAccess();
    }, [userId, role, path]);

    const getType = () => {
        if (isIT) return "IT";
        if (isHOD) return "HOD";
        if (isFinance) return "ACCOUNTS_FINANCE";
        if (isAdmin) return "ADMIN";
        if (isOps) return "OPS_TEAM";
        return "HR";
    };

    const isDeptCleared = (item, deptName) => item.departmentClearances?.some(d => d.department === deptName);

    const toggleModal = (item = null) => {
        setSelectedItem(item);
        setModalOpen(!modalOpen);
    };

    // RESET LOGIC: Reset tab and page when the URL path changes
    useEffect(() => {
        setActiveTab("NO");
        setPage(1);
    }, [path]);

    useEffect(() => {
        if (accessGranted) {
            fetchList();
        }
    }, [activeTab, page, path, accessGranted]);

    const fetchList = (startDate, endDate) => {
        setLoading(true);
        const type = getType();
        const offset = page - 1;
        let url;

        if (isHR) {
            const params = new URLSearchParams({
                offset,
                limit: LIMIT,
                filter: activeTab
            });

            if (startDate) params.append("fromDate", startDate);
            if (startDate) params.append("toDate", endDate);

            url = `${GET_FNF_LIST_URL}?${params.toString()}`;
        } else {
            if (isAdmin) {
                url = `${GET_ALL_FNF_LIST_URL}?type=${type}&isCompleted=${activeTab}&offset=${offset}&limit=${LIMIT}&location=${locationName}`;
            }
            else {
                url = `${GET_ALL_FNF_LIST_URL}?type=${type}&isCompleted=${activeTab}&offset=${offset}&limit=${LIMIT}&managerUserId=${userId}`;
            }
        }

        ApiClient.get(url).then((res) => {
            setLoading(false);
            if (res?.data?.status === 1) {
                setDataList({
                    content: res.data.data.content || [],
                    totalElements: res.data.data.totalElements || 0
                });
            }
            else {
                setDataList({ content: [], totalElements: 0 })
            }
        }).catch((err) => {
            setLoading(false);
            toast.error(err.message);
            setDataList({ content: [], totalElements: 0 })
        });
    };

    const getHODInfo = (departmentClearances = []) => {
        const hodItems = departmentClearances.filter(
            (item) => item.department === "HOD"
        );
        if (hodItems?.length > 0) {
            const ffItem = hodItems.find(
                (item) => item.description === "Can we process the F&F?"
            );

            const targetItem = hodItems.find(
                (item) => item.description === "Target Achieved?"
            );

            return {
                canProcessFF: ffItem?.cleared === true ? "YES" : "NO",
                targetAchieved: targetItem?.remarks || "N/A",
            };
        }
        else {
            return {
                canProcessFF: 'N/A',
                targetAchieved: 'N/A',
            };
        }
    };

    const handleFileChange = (e, id) => {
        const selectedFile = e.target?.files?.[0];
        if (selectedFile) {
            setFile((prev) => ({ ...prev, [id]: selectedFile }));
        }
    };

    const handleViewSelectedFile = (file) => {
        if (!file) return;

        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank");
    };

    const handleFileUpload = (id) => {
        const selectedFile = file[id];

        if (selectedFile) {
            const isConfirmed = window.confirm(
                "Are you sure you want to upload the file?"
            );

            if (!isConfirmed) return;
            const selectedFile = file[id];
            if (!selectedFile) {
                toast.error("No file found for upload.");
                return;
            }
            //  fetchList(startDate, endDate);
            const formDataApi = new FormData();
            formDataApi.append("id", id);
            formDataApi.append("file", selectedFile);
            mutateAdd(formDataApi);

        } else {
            toast.error("Please select a file to upload.");
        }
    };

    const { isPending, mutate: mutateAdd } = usePost(
        UPLOAD_FNF_FILE,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    fetchList(startDate, endDate);
                    setFile((prev) => {
                        const newFile = { ...prev };
                        return newFile;
                    });
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    // Define Table Columns

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "7%",
            cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>
        },
        ...(isHR && activeTab === 'NO' ? [{
            name: <span className="font-weight-bold fs-13">Manage</span>,
            cell: (row) => {

                // ❌ If HOD is cleared, don't show Manage option
                if (isDeptCleared(row, "HOD")) {
                    return null;
                }

                return (
                    <FaUserEdit
                        size={22}
                        title="Manage FNF"
                        onClick={() => {
                            setSelectedModalRow(row);
                            setManageModalOpen(true);
                        }}
                        style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                    />
                );
            },
        }] : []),
        {
            name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
            sortable: true,
            selector: (row) => row.createdAt,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdAt)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Emp Code</span>,
            sortable: true,
            selector: (row) => row.employeeCode,
            cell: (row) => <WordWrapCell>{row.employeeCode}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Employee Name</span>,
            sortable: true,
            width: '15%',
            selector: (row) => row.name,
            cell: (row) => (
                <div className="py-2">
                    <WordWrapCell>{row.name}</WordWrapCell>
                    <div className="small text-muted text-uppercase" style={{ fontSize: '10px' }}>
                        {row.designation} | {row.level}
                    </div>
                </div>
            )
        },
        {
            name: <span className="font-weight-bold fs-13">MT/ST</span>,
            sortable: true,
            selector: (row) => row.hod,
            cell: (row) => <WordWrapCell>{row?.hod?.split('/')?.slice(1)?.join('/')}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Org Details</span>,
            cell: (row) => (
                <div>
                    <div className="small fw-bold text-dark">{row.department}</div>
                    <div className="small text-muted">{row.location}</div>
                </div>
            )
        },
        {
            name: <span className="font-weight-bold fs-13">HOD</span>,
            sortable: true,
            selector: (row) => row.reportingManagerName,
            width: '15%',
            cell: (row) => <WordWrapCell>{row.reportingManagerName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Relieving Reason</span>,
            sortable: true,
            selector: (row) => row.relievingReason,
            cell: (row) => <WordWrapCell>{row.relievingReason}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Lifecycle Info</span>,
            width: '15%',
            cell: (row) => (
                <div className="py-1">
                    <div className="small mb-1">
                        <span className="text-muted small fw-bold">RELIEVING:</span>
                        <span className="ms-2 text-danger fw-bold">{formatDate(row.relievingDate)}</span>
                    </div>
                    <div className="small mb-1">
                        <span className="text-muted small fw-bold">RESIGNED:</span>
                        <span className="ms-2 text-dark">{formatDate(row.dateOfResignation)}</span>
                    </div>
                    <Badge color="light" className="text-dark border-0 fw-normal">Notice: {row.noticePeriodDays} Days</Badge>
                </div>
            )
        },
        ...((isHR || isFinance) ? [{
            name: <span className="font-weight-bold fs-13">HOD FNF Status</span>,
            sortable: false,
            cell: (row) => {
                const { canProcessFF, targetAchieved } = getHODInfo(
                    row.departmentClearances
                );

                return (
                    <WordWrapCell>{canProcessFF + ' (' + targetAchieved + ')'}
                    </WordWrapCell>
                );
            },
        },
        // Conditionally show progress tracker for HR
        {
            name: <span className="font-weight-bold fs-13">Clearance Status</span>,
            width: '15%',
            cell: (row) => {
                const depts = [
                    { id: "HR", label: "HR" },
                    { id: "HOD", label: "HOD" },
                    { id: "IT", label: "IT" },
                    { id: "ADMIN", label: "ADMIN" },
                    { id: "ACCOUNTS_FINANCE", label: "FINANCE" },
                    { id: "OPS_TEAM", label: "OPS" }
                ];
                return (
                    <div className="d-flex flex-wrap justify-content-center gap-1">
                        {depts.map(dept => (
                            <Badge
                                key={dept.id}
                                color={isDeptCleared(row, dept.id) ? "primary" : "secondary"}
                                style={{ fontSize: '8px', minWidth: '38px' }}
                                title={dept.label}
                            >
                                {dept.label}
                            </Badge>
                        ))}
                    </div>
                );
            }
        }] : []),
        {
            name: <span className="font-weight-bold fs-13">View</span>,
            width: '10%',
            cell: (row) => (
                <div className="d-flex gap-2">
                    {/* Master View Modal */}
                    <Button
                        color="light"
                        size="sm"
                        className="btn-soft-primary border-0"
                        onClick={() => toggleModal(row)}
                    >
                        <FaEye className="text-primary" />
                    </Button>

                    {/* Show Process button only in Pending tab for Departments */}
                    {!isHR && activeTab === "NO" && (
                        <Button
                            color="primary"
                            size="sm"
                            className="rounded-pill px-3 border-0 shadow-sm"
                            onClick={() => {
                                const routeMap = {
                                    IT: "/it-fnf-list/it-fnf-screen",
                                    HOD: "/hods-fnf-list/hods-fnf-screen",
                                    ACCOUNTS_FINANCE: "/finance-fnf-list/accounts-fnf-screen",
                                    ADMIN: "/admin-fnf-list/admin-fnf-screen",
                                    OPS_TEAM: "/ops-fnf-list/ops-fnf-screen"
                                };
                                navigate(routeMap[getType()], { state: { data: row } });
                            }}
                        >
                            Process
                        </Button>
                    )}
                </div>
            )
        },
        ...((isHR && activeTab === 'YES') ? [
            {
                name: <span className="font-weight-bold fs-13">Actions</span>,
                cell: (row) => {
                    // Find unique departments with cleared true
                    const uniqueDepartments = [
                        ...new Set(row?.departmentClearances?.map(d => d?.department))
                    ];
                    return (
                        <div className="d-flex gap-2">
                            {uniqueDepartments?.length === 6 ? (
                                <Button
                                    color="light"
                                    size="sm"
                                    className="btn-soft-danger border-0"
                                    onClick={() => generateNoDuesPDF(row)}
                                    title="Download No Dues Certificate"
                                >
                                    <FaFilePdf className="text-danger" size={16} />
                                </Button>
                            ) : '-'}
                        </div>
                    );
                },
            },
        ] : []),
        ...((isHR && activeTab !== 'NO') ? [
            {
                name: <span className="font-weight-bold fs-13">Upload</span>,
                width: "15%",
                cell: (row) => (
                    (!row?.file && activeTab === 'YES') ?
                        <div className="d-flex align-items-center">
                            <label className="btn btn-outline-secondary btn-sm mb-0">
                                <FaUpload title="Choose File" />
                                <input
                                    type="file"
                                    disabled={row.fileProof ? true : false}
                                    accept=".pdf,image/*"
                                    onChange={(e) => handleFileChange(e, row.id)}
                                    hidden
                                />
                            </label>
                            {file[row.id] && (
                                <FaFilePdf
                                    size={18}
                                    title="View Selected File"
                                    onClick={() => handleViewSelectedFile(file[row.id])}
                                    style={{
                                        cursor: "pointer",
                                        color: defaultTheme.goldColorLogo,
                                        marginLeft: "10px",
                                    }}
                                />
                            )}
                            <button
                                title="Upload Selected File"
                                type="button"
                                className="btn btn-primary btn-sm ms-2"
                                onClick={() => handleFileUpload(row.id)}
                            >
                                Upload
                            </button>
                        </div>
                        :
                        <a
                            href={`${hrImageBaseUrl}${row?.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="Open File"
                            style={{ fontSize: '17px' }}
                        >
                            <FaFilePdf className="w-5 h-5" color={defaultTheme.redColor} />
                        </a>
                ),
            },
        ] : []),
    ];

    const iconStyle = {
        color: defaultTheme.primary,
        cursor: "pointer",
        fontSize: "15px",
        marginBottom: '12px'
    };

    const downloadAllDataExcel = () => {
        if (!dataList?.content?.length) {
            toast.warning("No data available");
            return;
        }

        const hodMap = {};

        dataList.content.forEach((item) => {

            const hod = item?.reportingManagerName || "-";

            if (!hodMap[hod]) {
                hodMap[hod] = {
                    HR: 0,
                    HOD: 0,
                    IT: 0,
                    ADMIN: 0,
                    FINANCE: 0,
                    OPS: 0
                };
            }

            if (!isDeptCleared(item, "HR")) hodMap[hod].HR++;
            if (!isDeptCleared(item, "HOD")) hodMap[hod].HOD++;
            if (!isDeptCleared(item, "IT")) hodMap[hod].IT++;
            if (!isDeptCleared(item, "ADMIN")) hodMap[hod].ADMIN++;
            if (!isDeptCleared(item, "ACCOUNTS_FINANCE")) hodMap[hod].FINANCE++;
            if (!isDeptCleared(item, "OPS_TEAM")) hodMap[hod].OPS++;
        });

        const rows = Object.entries(hodMap).map(([hodName, counts], index) => [
            index + 1,
            hodName,
            // counts.HR,
            counts.HOD,
            counts.IT,
            counts.ADMIN,
            counts.FINANCE,
            counts.OPS
        ]);

        const headers = [
            "SL No.",
            "HOD Name",
            // "HR Pending",
            "HOD Pending",
            "IT Pending",
            "ADMIN Pending",
            "FINANCE Pending",
            "OPS Pending"
        ];

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, "Department Pending Summary");

        XLSX.writeFile(wb, `fnf_department_pending_${generateTimestamp()}.xlsx`);
    };

    const downloadCompletedExcel = () => {
        if (!dataList?.content?.length) {
            toast.warning("No data available");
            return;
        }

        const rows = dataList?.content?.map((item, index) => {
            const { canProcessFF, targetAchieved } = getHODInfo(item?.departmentClearances);

            return [
                index + 1,
                item?.name + ' (' + item?.employeeCode + ')' || "-",
                item?.reportingManagerName || "-",
                item?.hod?.split('/')?.slice(1)?.join('/') || "-",
                item?.department || "-",
                item?.designation || "-",
                item?.level || "-",
                item?.relievingReason || "-",
                `${canProcessFF} (${targetAchieved})`,
                // item?.remarks || "-"   // 👈 if remarks not available, keep "-"
            ];
        });

        const headers = [
            "SL No.",
            "Emp Details",
            "HOD Name",
            "MT/ST",
            "Department",
            "Designation",
            "Level",
            "Relieving Reason",
            "HOD FNF Status",
            // "Remarks"
        ];

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, "FNF Completed Data");

        XLSX.writeFile(wb, `fnf_completed_${generateTimestamp()}.xlsx`);
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <div className="container-fluid px-4">
                {(loading || isPending) && <ScreenLoader />}
                {/* Header Section */}
                <Card className="border-0 shadow-sm mb-4 bg-primary bg-gradient text-white" style={{ borderRadius: "15px" }}>
                    <CardBody className="p-4">
                        <Row className="align-items-center">
                            <Col md={8}>
                                <div className="d-flex align-items-center">
                                    <div>
                                        <h4 className="fw-bold mb-0 text-white">
                                            {isHR ? "HR Master Clearance Dashboard" : `${getType()?.replace('_', ' ')} Portal`}
                                        </h4>
                                        <p className="mb-0 opacity-75 small">Track and manage employee exit formalities</p>
                                    </div>
                                </div>
                            </Col>
                            <Col md={4} className="text-end">
                                {isHR && (
                                    <Button color="light" className="fw-bold px-4 rounded-pill shadow-sm" onClick={() => navigate("/hr-fnf-list/hr-fnf-screen")}>
                                        <FaPlus className="me-2 text-primary" /> New Request
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                <div className="d-flex align-items-end gap-3 mb-4 flex-wrap">

                    {/* HR Filters */}
                    {isHR && (
                        <>
                            {/* Start Date */}
                            <div>
                                <h4 className="font-size-11 fw-semibold text-muted mb-1"> Start Date</h4>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <h4 className="font-size-11 fw-semibold text-muted mb-1">End Date</h4>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>

                            {/* Search Button */}
                            <div>
                                <button
                                    className="btn btn-primary mt-4 px-3"
                                    onClick={() => {
                                        setPage(1);
                                        fetchList(startDate, endDate);
                                    }}
                                >
                                    Search
                                </button>
                            </div>
                            {/* {(isHR && activeTab === 'NO') &&
                                <i
                                    title="Excel Download"
                                    className="fas fa-file-excel"
                                    style={iconStyle}
                                    onClick={downloadAllDataExcel}
                                />
                            } */}

                            {isHR && (
                                <i
                                    title="Excel Download"
                                    className="fas fa-file-excel"
                                    style={iconStyle}
                                    onClick={() => {
                                        if (activeTab === "NO") {
                                            downloadAllDataExcel(); // existing pending logic
                                        } else {
                                            downloadCompletedExcel(); // new completed logic
                                        }
                                    }}
                                />
                            )}
                        </>
                    )}

                    {/* Tabs */}
                    <Nav
                        className="bg-white p-1 shadow-sm d-inline-flex"
                        style={{ borderRadius: "12px" }}
                    >
                        <NavItem>
                            <NavLink
                                className={classnames(
                                    "border-0 rounded-3 px-4 py-2 fw-bold",
                                    { active: activeTab === "NO" }
                                )}
                                onClick={() => {
                                    setActiveTab("NO");
                                    setPage(1);
                                }}
                                style={{
                                    cursor: "pointer",
                                    backgroundColor:
                                        activeTab === "NO" ? "#0d6efd" : "transparent",
                                    color: activeTab === "NO" ? "#fff" : "#6c757d"
                                }}
                            >
                                <FaClock className="me-2" /> Pending
                            </NavLink>
                        </NavItem>

                        <NavItem>
                            <NavLink
                                className={classnames(
                                    "border-0 rounded-3 px-4 py-2 fw-bold",
                                    { active: activeTab === "YES" }
                                )}
                                onClick={() => {
                                    setActiveTab("YES");
                                    setPage(1);
                                }}
                                style={{
                                    cursor: "pointer",
                                    backgroundColor:
                                        activeTab === "YES" ? "#198754" : "transparent",
                                    color: activeTab === "YES" ? "#fff" : "#6c757d"
                                }}
                            >
                                <FaCheckDouble className="me-2" /> Completed
                            </NavLink>
                        </NavItem>
                        {isHR && (

                            <NavItem>
                                <NavLink
                                    className={classnames(
                                        "border-0 rounded-3 px-4 py-2 fw-bold",
                                        { active: activeTab === "FNF" }
                                    )}
                                    onClick={() => {
                                        setActiveTab("FNF");
                                        setPage(1);
                                    }}
                                    style={{
                                        cursor: "pointer",
                                        backgroundColor:
                                            activeTab === "FNF" ? defaultTheme.primary : "transparent",
                                        color: activeTab === "FNF" ? "#fff" : "#6c757d"
                                    }}
                                >
                                    <FaFileInvoiceDollar className="me-2" /> FNF
                                </NavLink>
                            </NavItem>
                        )}
                    </Nav>
                </div>

                <AppTable
                    columns={columns}
                    data={dataList?.content}
                    pagination
                    paginationServer
                    paginationTotalRows={dataList?.totalElements}
                    paginationPerPage={200}
                    onChangePage={(newPage) => setPage(newPage)}
                    progressPending={loading}
                />

                <ManageHandoverModal
                    isOpen={manageModalOpen}
                    toggle={() => {
                        setManageModalOpen(false)
                        fetchList();
                    }}
                    rowData={selectedModalRow}
                />

            </div>

            {selectedItem && <ViewClearanceModal isOpen={modalOpen} toggle={() => toggleModal()} data={selectedItem} />}
        </PageContent>
    );
}