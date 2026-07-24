import PageContent from '../../components/Common/PageContent'
import Breadcrumbs from '../../components/Common/Breadcrumb'
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap'
import Select from "react-select";
import { useGet } from '../../Hooks/useApi';
import { ADMIN_ASSET_CREATE, ADMIN_ASSET_GET_ALL, ADMIN_ASSET_UPDATE, GET_ALL_MAIN_TEAM_DROPDOWN, GET_ALL_SUB_TEAM_DROPDOWN, GET_ALL_USERS_DROPDOWN } from '../../helpers/url_helper';
import { useEffect, useState } from 'react';
import ScreenLoader from '../../constants/ScreenLoader';
import { toast } from 'react-toastify';
import { formatDate, formatDateTime, RequiredStar, WordWrapCell } from '../../helpers/function_helper';
import AppTable from '../../components/Common/Table';
import { FaCheck, FaEdit, FaThumbsDown, FaTimes } from "react-icons/fa";
import ApiClient from '../../helpers/api_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { useUserStore } from '../../store/useUserStore';
import PermissionMissing from '../Utility/PermissonMissing';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import { AiFillFilter } from 'react-icons/ai';
import { RiFileDamageFill } from "react-icons/ri";
import { scrollToTop } from '../../constants/global';

export default function AdminAssetManagement() {
    const { userName, empCode, userId } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null)
    const [selectUser, setSelectUser] = useState(null)
    const [selectJackets, setSelectJackets] = useState("Not Issued")
    const [selectTshirts, setSelectTshirts] = useState("Not Issued")
    const [selectIdCard, setSelectIdCard] = useState("Not Issued")
    const [editId, setEditId] = useState(null)
    const [isPending, setIsPending] = useState(false)
    const [searchText, setSearchText] = useState("")
    const [searchBranch, setSearchBranch] = useState("")
    const [selectedMainTeam, setSelectedMainTeam] = useState(null)
    const [selectedSubTeam, setSelectedSubTeam] = useState(null)
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'asset-management');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const { data: usersList, isLoading: loadingUsers } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: Boolean(accessGranted) });

    const {
        data: assetsList,
        isLoading: loadingAssets,
        refetch
    } = useGet(ADMIN_ASSET_GET_ALL, { enabled: Boolean(accessGranted) });

    const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN + '?active=false', { enabled: Boolean(accessGranted) });
    const { data: subTeams } = useGet(`${GET_ALL_SUB_TEAM_DROPDOWN}${selectedMainTeam?.value}`, { enabled: Boolean(selectedMainTeam) });
    // ================= STATUS OPTIONS =================

    useEffect(() => {
        if (!selectedMainTeam) {
            setSelectedSubTeam(null)
        }
    }, [selectedMainTeam])

    const jacketsGroup = [
        { label: 'Issued', value: 'Issued' },
        { label: 'Not Issued', value: 'Not Issued' },
    ]

    const tshirtsGroup = jacketsGroup

    const idCardGroup = [
        { label: 'Issued', value: 'Issued' },
        { label: 'Not Issued', value: 'Not Issued' },
        { label: 'Destroyed', value: 'Destroyed' },
        { label: 'Not Returned', value: 'Not Returned' }
    ]

    // ================= SUBMIT =================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectUser) return toast.error('Please Select User')
        if (!selectJackets) return toast.error('Please Select Jacket Status')
        if (!selectTshirts) return toast.error('Please Select T-Shirt Status')
        if (!selectIdCard) return toast.error('Please Select ID Card Status')

        const todayDate = new Date().toISOString().split("T")[0]

        const fullLabel = selectUser?.label || "";
        const nameMatch = fullLabel.match(/^(.*)\s\((.*)\)$/);

        const emp_Name = nameMatch ? nameMatch[1] : fullLabel;
        const emp_Code = nameMatch ? nameMatch[2] : selectUser?.value;

        const payload = {
            empName: emp_Name,
            empCode: emp_Code,
            createdBy: userName + ' (' + empCode + ')',
            status: "YES",
            adminAssetDetails: [
                { type: "JACKET", typeValue: selectJackets },
                { type: "TSHIRT", typeValue: selectTshirts },
                {
                    type: "ID_CARD",
                    typeValue: selectIdCard,
                    destroyedDate: selectIdCard === "Destroyed" ? todayDate : ""
                }
            ]
        }

        try {
            setIsPending(true)
            let response;
            if (editId) {
                response = await ApiClient.put(
                    `${ADMIN_ASSET_UPDATE}/${editId}`,
                    payload
                )
            } else {
                response = await ApiClient.post(
                    ADMIN_ASSET_CREATE,
                    payload
                )
            }
            if (response?.data?.status === 1) {
                toast.success(response.data.message)
                await refetch()
                handleClear()
            } else {
                toast.error(response?.data?.message)
            }

        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsPending(false)
        }
    }

    // ================= CLEAR =================

    const handleClear = () => {
        setSelectUser(null)
        setSelectJackets("Not Issued")
        setSelectTshirts("Not Issued")
        setSelectIdCard("Not Issued")
        setEditId(null)
        setShowFilters(false)
    }

    // ================= EDIT =================

    const handleEdit = (row) => {
        setEditId(row.id)
        setShowFilters(true)
        setSelectUser({
            label: `${row.emp_name} (${row.emp_code})`,
            value: row.emp_code
        })

        const jacket = row.adminAssetDetails?.find(d => d.type === "JACKET")
        const tshirt = row.adminAssetDetails?.find(d => d.type === "TSHIRT")
        const idCard = row.adminAssetDetails?.find(d => d.type === "ID_CARD")

        setSelectJackets(jacket?.typeValue || "")
        setSelectTshirts(tshirt?.typeValue || "")
        setSelectIdCard(idCard?.typeValue || "")

        scrollToTop()
    }

    // ================= STATUS BUTTON UI =================

    const StatusCheckboxGroup = ({ label, value, onChange, options }) => (
        <div>
            <label className="form-label fw-semibold mb-2 font-size-11">
                {label} <RequiredStar />
            </label>

            <div className="d-flex gap-2 flex-wrap">
                {options.map((option) => {
                    const isActive = value === option.value

                    let bgColor = "#ffffff"
                    let textColor = "#495057"
                    let borderColor = "#dee2e6"
                    let boxShadow = "none"

                    // Active Colors
                    if (option.value === "Issued" && isActive) {
                        bgColor = defaultTheme.primary
                        textColor = "#fff"
                        borderColor = defaultTheme.primary
                        boxShadow = "0 2px 8px rgba(25,135,84,0.4)"
                    }

                    if (option.value === "Not Issued" && isActive) {
                        bgColor = defaultTheme.btnEnable
                        textColor = "#fff"
                        borderColor = defaultTheme.btnEnable
                        boxShadow = "0 2px 8px rgba(13,110,253,0.4)"
                    }

                    if (
                        (option.value === "Destroyed") &&
                        isActive
                    ) {
                        bgColor = defaultTheme.redColor
                        textColor = "#fff"
                        borderColor = defaultTheme.redColor
                        boxShadow = "0 2px 8px rgba(220,53,69,0.4)"
                    }

                    if (
                        (option.value === "Not Returned") &&
                        isActive
                    ) {
                        bgColor = "#fd7e14"
                        textColor = "#fff"
                        borderColor = "#fd7e14"
                        boxShadow = "0 2px 8px rgba(220,53,69,0.4)"
                    }

                    return (
                        <div
                            key={option.value}
                            onClick={() => onChange(option.value)}
                            style={{
                                padding: "8px 18px",
                                borderRadius: "30px",
                                cursor: "pointer",
                                backgroundColor: bgColor,
                                color: textColor,
                                fontSize: "13px",
                                fontWeight: 500,
                                border: `1px solid ${borderColor}`,
                                minWidth: "120px",
                                textAlign: "center",
                                transition: "all 0.25s ease",
                                boxShadow: boxShadow
                            }}
                        >
                            {option.label}
                        </div>
                    )
                })}
            </div>
        </div>
    )
    // ================= BADGE =================

    const getStatusIcon = (value) => {
        if (value === "Issued")
            return <FaCheck size={15} color={defaultTheme.primary} title="Issued" />

        if (value === "Not Issued")
            return <FaTimes size={15} color={defaultTheme.btnEnable} title="Not Issued" />

        if (value === "Destroyed")
            return <RiFileDamageFill size={15} color={defaultTheme.redColor} title="Destroyed" />

        if (value === "Not Returned")
            return <FaThumbsDown size={15} color="#fd7e14" title="Not Returned" />

        return "-"
    }
    const allAssets = assetsList?.data?.data || []

    const filteredAssets =
        allAssets.filter((item) => {

            const search = searchText.toLowerCase()
            const search_Branch = searchBranch.toLowerCase()

            const matchesSearch =
                !searchText ||
                item.emp_name?.toLowerCase().includes(search) ||
                item.emp_code?.toLowerCase().includes(search)

            const matchesBranch =
                !searchBranch ||
                item.branch?.toLowerCase().includes(search_Branch)

            const matchesMainTeam =
                !selectedMainTeam ||
                item.mainTeam === selectedMainTeam?.value

            const matchesSubTeam =
                !selectedSubTeam ||
                item.subTeam === selectedSubTeam?.value

            return matchesSearch && matchesMainTeam && matchesSubTeam && matchesBranch
        })

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    const getCount = (type, status) => {
        return allAssets?.filter(row =>
            row?.adminAssetDetails?.some(
                d => d.type === type && d.typeValue === status
            )
        ).length;
    };

    // Jacket
    const jacketIssued = getCount("JACKET", "Issued");
    const jacketNotIssued = getCount("JACKET", "Not Issued");

    // T-Shirt
    const tshirtIssued = getCount("TSHIRT", "Issued");
    const tshirtNotIssued = getCount("TSHIRT", "Not Issued");
    // ID Card
    const idIssued = getCount("ID_CARD", "Issued");
    const idNotIssued = getCount("ID_CARD", "Not Issued");
    const idDestroyed = getCount("ID_CARD", "Destroyed");
    const idNotReturned = getCount("ID_CARD", "Not Returned");

    // ================= TABLE COLUMNS =================

    const columns = [
        {
            name: "SL No.",
            selector: (_, i) => i + 1,
            width: '6%'
        },
        {
            name: "Action",
            cell: row => (
                <FaEdit
                    style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                    onClick={() => handleEdit(row)}
                    size={18}
                />
            )
        },
        {
            name: "Employee",
            width: '15%',
            selector: row => row.emp_name,
            sortable: true,
            cell: row => <WordWrapCell>{row.emp_name} ({row.emp_code})</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">MT/ST</span>,
            sortable: true,
            selector: (row) => row.mainTeam,
            cell: (row) => <WordWrapCell>{row.mainTeam + '/' + row.subTeam || '-'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Branch</span>,
            sortable: true,
            selector: (row) => row.branch,
            cell: (row) => <WordWrapCell>{row.branch || '-'}</WordWrapCell>,
        },
        {
            name: "Jacket",
            width: '8%',
            cell: row =>
                getStatusIcon(
                    row?.adminAssetDetails?.find(d => d.type === "JACKET")?.typeValue
                )
        },
        {
            name: "T-Shirt",
            width: '8%',
            cell: row =>
                getStatusIcon(
                    row?.adminAssetDetails?.find(d => d.type === "TSHIRT")?.typeValue
                )
        },
        {
            name: "ID Card",
            width: '8%',
            cell: row =>
                getStatusIcon(
                    row?.adminAssetDetails?.find(d => d.type === "ID_CARD")?.typeValue
                )
        },
        {
            name: "Destroyed Date",
            width: '15%',
            sortable: true,
            cell: row => {
                const idCard = row.adminAssetDetails?.find(
                    d => d.type === "ID_CARD"
                )

                const destroyedDate = idCard?.destroyedDate

                return (
                    <WordWrapCell>
                        {destroyedDate ? formatDate(destroyedDate) : "-"}
                    </WordWrapCell>
                )
            }
        },
        {
            name: <span className="font-weight-bold fs-13">Created By</span>,
            sortable: true,
            selector: (row) => row.createdBy,
            cell: (row) => <WordWrapCell>{row.createdBy}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Created At</span>,
            sortable: true,
            width: '15%',
            selector: (row) => row.createdDate,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
        }
    ]

    return (
        <PageContent>
            <Breadcrumbs title="User Management" breadcrumbItem="Assets" />

            {(loadingUsers || loadingAssets || isPending) && <ScreenLoader />}

            <Container fluid>
                <Row className="mb-3 align-items-center">

                    {/* LEFT SIDE - BUTTON */}
                    <Col md={4}>
                        <Button
                            color="primary"
                            onClick={() => setShowFilters((prev) => !prev)}
                            className="d-flex align-items-center"
                            style={{ fontWeight: 500 }}
                        >
                            <AiFillFilter size={18} className="me-2" />
                            {showFilters ? "Hide Form" : "Show Form"}
                        </Button>
                    </Col>

                    {/* RIGHT SIDE - COUNTS INLINE */}
                    <Col
                        md={8}
                        className="d-flex justify-content-md-end flex-wrap gap-3 mt-3 mt-md-0"
                        style={{ fontSize: "14px" }}
                    >

                        <span>
                            <strong>Jacket:</strong> I:{jacketIssued} | NI:{jacketNotIssued}
                        </span>

                        <span>
                            <strong>T-Shirt:</strong> I:{tshirtIssued} | NI:{tshirtNotIssued}
                        </span>

                        <span>
                            <strong>ID Card:</strong> I:{idIssued} | NI:{idNotIssued} | D:{idDestroyed} | NR:{idNotReturned}
                        </span>

                    </Col>

                </Row>
                {showFilters &&
                    <form onSubmit={handleSubmit}>
                        <Card className="shadow-sm border-0">
                            <CardBody>
                                <Row className="g-2">
                                    <Col lg="2">
                                        <label className="form-label fw-semibold font-size-11 fw-semibold">Select User <RequiredStar /></label>
                                        <Select
                                            value={selectUser}
                                            onChange={setSelectUser}
                                            options={usersList?.data?.data || []}
                                            isClearable
                                            style={{ zIndex: 9999 }}
                                            menuPortalTarget={document.body}
                                        />
                                    </Col>

                                    <Col lg="3">
                                        <StatusCheckboxGroup
                                            label="Jacket Status"
                                            value={selectJackets}
                                            onChange={setSelectJackets}
                                            options={jacketsGroup}
                                        />
                                    </Col>

                                    <Col lg="3">
                                        <StatusCheckboxGroup
                                            label="T-Shirt Status"
                                            value={selectTshirts}
                                            onChange={setSelectTshirts}
                                            options={tshirtsGroup}
                                        />
                                    </Col>

                                    <Col lg="4">
                                        <StatusCheckboxGroup
                                            label="ID Card Status"
                                            value={selectIdCard}
                                            onChange={setSelectIdCard}
                                            options={idCardGroup}
                                        />
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-end mt-4 gap-2">
                                    <button type="submit" className="btn btn-primary">
                                        {editId ? "Update" : "Save"}
                                    </button>
                                    <button type="button" onClick={handleClear} className="btn btn-secondary">
                                        Clear
                                    </button>
                                </div>

                            </CardBody>
                        </Card>
                    </form>
                }

                <Card className="mt-4 shadow-sm border-0">
                    <CardBody>
                        <Row className="g-3 align-items-end">
                            {/* 🔍 Name / Code Search */}
                            <Col lg="2" md="6">
                                <label className="form-label fw-semibold font-size-11">Search (Name OR Code)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter name or code..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </Col>

                            <Col lg="2" md="6">
                                <label className="form-label fw-semibold font-size-11">Branch</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter Branch..."
                                    value={searchBranch}
                                    onChange={(e) => setSearchBranch(e.target.value)}
                                />
                            </Col>

                            {/* 🏷 Main Team Filter */}
                            <Col lg="3" md="6">
                                <label className="form-label fw-semibold font-size-11">Main Team</label>
                                <Select
                                    value={selectedMainTeam}
                                    onChange={setSelectedMainTeam}
                                    options={mainTeams?.data?.data || []}
                                    isClearable
                                    style={{ zIndex: 9999 }}
                                    menuPortalTarget={document.body}
                                />
                            </Col>

                            {/* 🏷 Sub Team Filter */}
                            <Col lg="3" md="6">
                                <label className="form-label fw-semibold font-size-11">Sub Team</label>
                                <Select
                                    value={selectedSubTeam}
                                    onChange={setSelectedSubTeam}
                                    options={subTeams?.data?.data || []}
                                    isClearable
                                    style={{ zIndex: 9999 }}
                                    menuPortalTarget={document.body}
                                    isDisabled={!selectedMainTeam}
                                />
                            </Col>

                            {/* 🧹 Clear All Filters */}
                            <Col lg="2" md="6">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setSearchText("")
                                        setSelectedMainTeam("")
                                        setSelectedSubTeam("")
                                        setSearchBranch("")
                                    }}
                                >
                                    Clear
                                </button>
                            </Col>

                        </Row>

                    </CardBody>
                </Card>

                {/* 📋 Table */}
                <AppTable
                    columns={columns}
                    data={filteredAssets}
                    pagination
                    progressPending={loadingAssets}
                    conditionalRowStyles={[
                        {
                            when: (row) => row.userStatus === "NO",
                            style: { color: defaultTheme.redColor, fontWeight: 'bold' },
                        },
                    ]}
                />
            </Container>
        </PageContent>
    )
}