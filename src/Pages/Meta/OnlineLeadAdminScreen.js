/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { META_LEAD_STATUS_ADMIN, GOOGLE_LEAD_STATUS_ADMIN, ONLINE_PROJECT_DROPDOWN, META_LEADS_COUNT, GOOGLE_LEADS_COUNT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { MdMobileFriendly } from "react-icons/md";
import { useGet } from "../../Hooks/useApi";
import Select from "react-select";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import { USER_TYPE } from "../../constants/global";

export default function OnlineLeadAdminScreen() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [onlineLead, setOnlineLead] = useState([]);
    const [isPending, setIsPending] = useState(false);
    const [platform, setPlatform] = useState("Meta"); // Default to Meta
    const [selectedProject, setSelectedProject] = useState(null);
    const { data: projectList } = useGet(ONLINE_PROJECT_DROPDOWN + platform);
    const { userId, role } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);
    const [leadsCountData, setLeadsCountData] = useState(0);
    const [limit] = useState(100); // Fixed page size
    const [offset, setOffset] = useState(0);

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            sortable: true,
            width: "6%",
            cell: (_, index) => index + 1,
        },
        {
            name: <span className="font-weight-bold fs-13">Name</span>,
            selector: (row) => row.leadName,
            cell: (row) => <WordWrapCell>{row.leadName}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Mobile No.</span>,
            selector: (row) => row.leadMobile,
            cell: (row) => (
                <div className="phone-container">
                    <MdMobileFriendly
                        className="phone-icon"
                        color={defaultTheme.goldColorLogo}
                    />
                    <span className="phone-number">{row.leadMobile}</span>
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Project</span>,
            selector: (row) => row.project,
            cell: (row) => <WordWrapCell>{row.project}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Project Category</span>,
            selector: (row) => row.projectCategory,
            cell: (row) => <WordWrapCell>{row.projectCategory}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Status</span>,
            selector: (row) => row.status,
            cell: (row) => <WordWrapCell>{row.status}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Created Date</span>,
            selector: (row) => row.createdDate,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Status Update Date</span>,
            selector: (row) => row.statusUpdateDate,
            cell: (row) => <WordWrapCell>{formatDateTime(row.statusUpdateDate)}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Remark</span>,
            selector: (row) => row.remark,
            cell: (row) => <WordWrapCell>{row.remark}</WordWrapCell>,
            sortable: true,
        },
    ];

    const getCallDetails = (start = fromDate, end = toDate, selectedPlatform = platform, off = offset, type) => {
        setIsPending(true);
        let url = "";
        if (selectedPlatform === "Meta") {
            url = `${META_LEAD_STATUS_ADMIN}`;
        } else if (selectedPlatform === "Google") {
            url = `${GOOGLE_LEAD_STATUS_ADMIN}`;
        }

        const body = {
            fromDate: start,
            toDate: end,
            limit: limit,
            offset: off,
            project: !type ? selectedProject?.value : null
        };

        ApiClient.post(url, body)
            .then((response) => {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    const encryptedContent = response.data.data;
                    decryptData(encryptedContent).then((decrypted) => {
                        setOnlineLead(decrypted);
                    }).catch((error) => {
                        setOnlineLead([]);
                    });
                } else {
                    toast.error(response.data.message);
                    setOnlineLead([]);
                }
            })
            .catch((error) => {
                setIsPending(false);
                setOnlineLead([]);
                toast.error(error.message);
            });
    };

    const getLeadsCount = (start = fromDate, toDate, selectedPlatform = platform) => {
        let url = "";
        if (selectedPlatform === "Meta") {
            url = `${META_LEADS_COUNT}${start}&toDate=${toDate}`;
        } else if (selectedPlatform === "Google") {
            url = `${GOOGLE_LEADS_COUNT}${start}&toDate=${toDate}`;
        }
        ApiClient.get(url)
            .then((response) => {
                if (response?.data?.status === 1) {
                    setLeadsCountData(response.data.data || 0);
                } else {
                    setLeadsCountData(0)
                }
            })
            .catch((error) => {
                setLeadsCountData(0)
            });
    }

    const setDefaultDateRange = (type) => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const formattedFromDate = formatDateForInput(firstDayOfMonth);
        const formattedToDate = formatDateForInput(today);

        setFromDate(formattedFromDate);
        setToDate(formattedToDate);
        setOffset(0);
        getCallDetails(formattedFromDate, formattedToDate, platform, 0, type);
        getLeadsCount(formattedFromDate, formattedToDate, platform);
    };

    useEffect(() => {
        if (accessGranted) {
            setDefaultDateRange();
        }
    }, [accessGranted]);

    useEffect(() => {
        if (fromDate && toDate && accessGranted) {
            setOffset(0);
            getCallDetails(fromDate, toDate, platform, 0);
            getLeadsCount(fromDate, toDate, platform);
        }
    }, [platform, accessGranted]);

    const handleShowButton = (e) => {
        e.preventDefault();
        if (!fromDate) {
            toast.error("Please Enter Start Date");
        } else if (!toDate) {
            toast.error("Please Enter End Date");
        } else {
            setOffset(0);
            getCallDetails(fromDate, toDate, platform, 0);
            getLeadsCount(fromDate, toDate, platform);
        }
    };

    const handleClear = () => {
        setDefaultDateRange('clear');
        setOnlineLead([]);
        setSelectedProject(null)
        setPlatform("Meta")
        setOffset(0);
    };

    const handlePageChange = (page) => {
        const newOffset = (page - 1);
        setOffset(newOffset);
        getCallDetails(fromDate, toDate, platform, newOffset);
    };

    useEffect(() => {
        const checkAccess = async () => {
            if (role !== USER_TYPE.ASSOCIATE) {
                const hasAccess = await CheckUserAccess(userId, 'online-lead-screen');
                setAccessGranted(hasAccess);
            }
            else {
                setAccessGranted(true)
            }
        };
        checkAccess();
    }, [userId, role]);

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Details" breadcrumbItem="Online Leads" />
            {isPending && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowButton}>
                            <Row className="g-3">
                                <Col md="3">
                                    <h6 className="font-size-12">From Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        max={toDate}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-12">To Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        max={formatDateForInput(new Date())}
                                        min={fromDate}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-12">Project</h6>
                                    <Select
                                        options={projectList?.data?.data?.map((item) => ({
                                            label: item?.project,
                                            value: item?.project,
                                        })) || []}
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        value={selectedProject}
                                        onChange={(selected) => setSelectedProject(selected)}
                                        isClearable
                                    />
                                </Col>

                                <Col md="3" className="d-flex align-items-end">
                                    <Button
                                        color="primary"
                                        type="submit"
                                        className="me-2"
                                    >
                                        Show
                                    </Button>
                                    <Button
                                        color="secondary"
                                        type="button"
                                        onClick={handleClear}
                                    >
                                        Clear
                                    </Button>
                                </Col>
                            </Row>
                        </form>

                        {/* Radio Buttons */}
                        <Row className="mt-4">
                            <Col md="12">
                                <div className="d-flex align-items-center gap-1">
                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="platform"
                                            id="metaRadio"
                                            value="Meta"
                                            checked={platform === "Meta"}
                                            onChange={(e) => setPlatform(e.target.value)}
                                        />
                                        <label className="form-check-label" htmlFor="metaRadio">Meta</label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="platform"
                                            id="googleRadio"
                                            value="Google"
                                            checked={platform === "Google"}
                                            onChange={(e) => setPlatform(e.target.value)}
                                        />
                                        <label className="form-check-label" htmlFor="googleRadio">Google</label>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                <div style={{ display: 'flex', gap: '2rem', padding: '1rem' }}>
                    {/* <div><strong>Total:</strong> {totalRows}</div> */}
                    <div><strong>Pending:</strong> {leadsCountData?.pending}</div>
                    <div><strong>Prospect:</strong> {leadsCountData?.prospect}</div>
                    <div><strong>Hold:</strong> {leadsCountData?.hold}</div>
                    <div><strong>Reject:</strong> {leadsCountData?.reject}</div>
                </div>

                {onlineLead?.content?.length > 0 && (
                    <AppTable
                        progressSales={isPending}
                        columns={columns}
                        data={onlineLead?.content}
                        pagination
                        paginationServer
                        paginationTotalRows={onlineLead?.totalElements || 0}
                        onChangePage={handlePageChange}
                    />
                )}
            </Container>
        </PageContent>
    );
}
