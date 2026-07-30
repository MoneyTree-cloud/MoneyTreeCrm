import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useGet } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { formatINR, generateTimestamp, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { GET_ALL_MT_PAY_SCHEME_BOOKING_DATA, GET_ALL_USERS_DROPDOWN_LIST, MARK_PAYOUT_MT_PAY_SCHEME_BOOKING_DATA } from "../../helpers/url_helper";
import Select from "react-select";
import Switch from "react-switch";
import ApiClient from "../../helpers/api_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";

export default function MTPaySchemeBooking() {
    const { userId, empCode } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);
    const [activeTab, setActiveTab] = useState('Justified');

    const today = new Date().toISOString().split("T")[0];
    const [filters, setFilters] = useState({
        fromDate: '2026-07-13',
        toDate: today,
        associate: null
    });

    const [switchLoading, setSwitchLoading] = useState(false);
    const { data: schemeData, isLoading, refetch: refetchSchemes } = useGet(
        `${GET_ALL_MT_PAY_SCHEME_BOOKING_DATA}?fromDate=${filters.fromDate}&toDate=${filters.toDate}&associateId=${filters.associate?.value || ""}&schemeName=MTpay`,
        {
            enabled: Boolean(accessGranted),
        }
    );
    const allData = Array.isArray(schemeData?.data?.data)
        ? schemeData.data.data
        : [];

    const filteredData = allData.filter((row) => {
        switch (activeTab) {
            case "Justified":
                return row.vbstatus === "Justified" && !row.firstPayoutStatus;

            case "Non Justified":
                return row.vbstatus === "Non Justified";

            case "Paid":
                return row.firstPayoutStatus === true;

            default:
                return true;
        }
    });

    const tabCounts = {
        Justified: allData.filter(
            (row) => row.vbstatus === "Justified" && !row.firstPayoutStatus
        ).length,

        "Non Justified": allData.filter(
            (row) => row.vbstatus === "Non Justified"
        ).length,

        Paid: allData.filter(
            (row) => row.firstPayoutStatus === true
        ).length,
    };

    const { data: usersList } = useGet(GET_ALL_USERS_DROPDOWN_LIST, { enabled: Boolean(accessGranted) });

    const handleMarkPayout = async (checked, row) => {
        if (!checked) return;
        if (!window.confirm("Are you sure to continue?")) return
        setSwitchLoading(true);
        ApiClient.post(
            `${MARK_PAYOUT_MT_PAY_SCHEME_BOOKING_DATA}?saleId=${row.saleId}`
        )
            .then(function (response) {
                setSwitchLoading(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    refetchSchemes();
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setSwitchLoading(false);
                toast.error(error.message);
            });
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "5%",
            cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Sale ID</span>,
            sortable: true,
            selector: (row) => row.saleId,
            cell: (row) => <WordWrapCell>{row.saleId}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Associate</span>,
            sortable: true,
            selector: (row) => row.associateName,
            cell: (row) => <WordWrapCell>{row.associateName + ' (' + row.associateCode + ')'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Team</span>,
            sortable: true,
            selector: (row) => row.mainTeam,
            cell: (row) => <WordWrapCell>{row.mainTeam + '/' + row.subTeam}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Branch</span>,
            sortable: true,
            selector: (row) => row.location,
            cell: (row) => <WordWrapCell>{row.location}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Builder</span>,
            sortable: true,
            selector: (row) => row?.builderName,
            cell: (row) => <WordWrapCell>{row?.builderName || '-'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Project</span>,
            sortable: true,
            selector: (row) => row?.projectName,
            cell: (row) => <WordWrapCell>{row?.projectName || '-'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Unit No.</span>,
            sortable: true,
            selector: (row) => row.unitNo,
            cell: (row) => <WordWrapCell>{row.unitNo}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            sortable: true,
            selector: (row) => row.clientName,
            cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">MTpay Scheme</span>,
            sortable: true,
            selector: (row) => row.schemeName,
            cell: (row) => <WordWrapCell>{row.schemeName}</WordWrapCell>,
        },
        ...(empCode !== '3615'
            ? [
                {
                    name: <span className="font-weight-bold fs-13">First Payout</span>,
                    sortable: true,
                    selector: (row) => row.firstPayout,
                    cell: (row) => <WordWrapCell>{formatINR(row.firstPayout)}</WordWrapCell>,
                },
            ]
            : []),
        {
            name: <span className="font-weight-bold fs-13">VB Status</span>,
            sortable: true,
            selector: (row) => row.vbstatus,
            cell: (row) =>
                <div style={{ wordWrap: "break-word", whiteSpace: "normal", color: row.vbstatus === 'Justified' ? 'green' : 'red' }}>
                    {row.vbstatus}
                </div>
        },
        ...(empCode === '1250'
            ? [
                {
                    name: <span className="font-weight-bold fs-13">Payout</span>,
                    cell: (row) => (
                        <Switch
                            checked={row.firstPayoutStatus}
                            onChange={(checked) => handleMarkPayout(checked, row)}
                            offColor={defaultTheme.goldColorLogo}
                            onColor={defaultTheme.primary}
                            height={22}
                            width={45}
                            disabled={row.vbstatus !== 'Justified' || row.firstPayoutStatus}
                        />
                    ),
                },
            ]
            : []),
    ];

    const handleDownloadExcel = () => {
        const data = Array.isArray(schemeData?.data?.data)
            ? schemeData.data.data
            : [];

        if (!data.length) {
            toast.info("No data available to export.");
            return;
        }

        const excelData = data.map((row, index) => ({
            "SL No.": index + 1,
            "Sale ID": row.saleId,
            "Associate": `${row.associateName} (${row.associateCode})`,
            "Team": `${row.mainTeam}/${row.subTeam}`,
            "Branch": row.location,
            "Builder": row.builderName,
            "Project": row.projectName,
            "Unit No.": row.unitNo,
            "Client Name": row.clientName,
            "MTpay Scheme": row.schemeName,
            "First Payout": row.firstPayout,
            "VB Status": row.vbstatus,
            // "Payout Status": row.fi/rstPayoutStatus ? "Paid" : "Due",
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "MTPay Scheme");

        XLSX.writeFile(
            workbook,
            `MTPay_Scheme_${generateTimestamp()}.xlsx`
        );
    };

    const handleShow = () => {
        refetchSchemes();
    };

    const handleClear = () => {
        setFilters({
            fromDate: today,
            toDate: today,
            associate: null,
            scheme: null,
        });

        setTimeout(() => {
            refetchSchemes();
        }, 0);
    };

    // ── Tab definitions ─────────────────────────────────────────────────────────
    const TABS = [
        { key: 'Justified', label: 'Justified', icon: FaClock, color: '#D97706', bg: '#FEF3C7' },
        { key: 'Non Justified', label: 'Non Justified', icon: FaTimesCircle, color: '#DC2626', bg: '#FEE2E2' },
        { key: 'Paid', label: 'Paid', icon: FaCheckCircle, color: '#16A34A', bg: '#DCFCE7' },
    ];

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'booking-mt-pay-scheme');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Booking" breadcrumbItem="MTpay Scheme" />
            {(isLoading || switchLoading) && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <Row className="align-items-end">
                            <Col md="2">
                                <label className="form-label">From Date</label>
                                <input
                                    type="date"
                                    disabled
                                    className="form-control"
                                    value={filters.fromDate}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            fromDate: e.target.value,
                                        }))
                                    }
                                />
                            </Col>

                            <Col md="2">
                                <label className="form-label">To Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filters.toDate}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            toDate: e.target.value,
                                        }))
                                    }
                                />
                            </Col>

                            <Col md="3">
                                <label className="form-label">Select Associate</label>
                                <Select
                                    options={Array.isArray(usersList?.data?.data) ? usersList.data.data : []}
                                    value={filters.associate}
                                    onChange={(value) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            associate: value,
                                        }))
                                    }
                                    isClearable
                                    placeholder="Select Associate"
                                    style={{ zIndex: 9999 }}
                                    menuPortalTarget={document.body}
                                />
                            </Col>

                            <Col md="4" className="d-flex gap-2">
                                <Button
                                    color="primary"
                                    onClick={handleShow}
                                >
                                    Show
                                </Button>

                                <Button
                                    color="secondary"
                                    outline
                                    onClick={handleClear}
                                >
                                    Clear
                                </Button>
                                {(empCode === '1246' || empCode === '1') &&
                                    < Button
                                        color="success"
                                        onClick={handleDownloadExcel}
                                    >
                                        Download Excel
                                    </Button>
                                }
                            </Col>

                        </Row>
                    </CardBody>
                </Card>

                {/* ── Tabs ─────────────────────────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    background: '#E2E8F0',
                    padding: 5,
                    borderRadius: 12,
                    marginBottom: 18,
                    gap: 4,
                    flexWrap: 'wrap',
                }}>
                    {TABS.map((tab) => {
                        const active = activeTab === tab.key;
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    minWidth: 130,
                                    padding: '11px 20px',
                                    fontSize: 13.5,
                                    fontWeight: 700,
                                    border: 'none',
                                    borderRadius: 9,
                                    background: active ? '#fff' : 'transparent',
                                    color: active ? tab.color : '#64748B',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    boxShadow: active ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 7,
                                    transition: 'all .15s',
                                }}
                            >
                                <TabIcon size={12} /> {tab.label}
                                {active && allData?.length > 0 && (
                                    <span
                                        style={{
                                            background: tab.bg,
                                            color: tab.color,
                                            padding: "1px 8px",
                                            borderRadius: 10,
                                            fontSize: 11,
                                            fontWeight: 800,
                                            marginLeft: 4,
                                        }}
                                    >
                                        {tabCounts[tab.key]}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={filteredData || []}
                    pagination
                />
            </Container>
        </PageContent >
    );
}