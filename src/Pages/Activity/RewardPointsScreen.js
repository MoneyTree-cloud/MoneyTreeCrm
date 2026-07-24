/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, CardBody, Label } from "reactstrap";
import Select from "react-select";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet } from "../../Hooks/useApi";
import { GET_ALL_MAIN_TEAM_DROPDOWN, GET_ALL_SUB_TEAM_DROPDOWN, PROJECT_REWARD_POINTS_GET_ALL } from "../../helpers/url_helper";
import { formatDate, generateTimestamp, WordWrapCell } from "../../helpers/function_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css";
import * as XLSX from "xlsx";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { useUserStore } from "../../store/useUserStore";
import PermissionMissing from "../Utility/PermissonMissing";

export default function RewardPointsScreen() {
    const userId = useUserStore((state) => state.user.userId);
    const [accessGranted, setAccessGranted] = useState(null);
    const [filters, setFilters] = useState({
        associate: null,
        mainTeam: null,
        subTeam: null,
    });
    const { data: rewardData, isLoading } = useGet(PROJECT_REWARD_POINTS_GET_ALL, { enabled: !!accessGranted });
    const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN, { enabled: !!accessGranted });
    // const { data: allUsers } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: !!accessGranted });
    const { data: subTeams } = useGet(`${GET_ALL_SUB_TEAM_DROPDOWN}${filters?.mainTeam?.value}`, { enabled: Boolean(filters?.mainTeam) });
    const [totalPoints, setTotalPoints] = useState(0);

    /* -------------------- ACCESS CHECK -------------------- */
    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, "reward-points-all");
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const rawData = rewardData?.data?.data ?? [];

    /* -------------------- DROPDOWN OPTIONS -------------------- */
    const associateOptions = useMemo(() => {
        return [...new Set(rawData.map(i => i.associateName).filter(Boolean))]
            .map(name => ({ label: name, value: name }));
    }, [rawData]);

    // const mainTeamOptions = useMemo(() => {
    //     return [...new Set(rawData.map(i => i.mainTeam).filter(Boolean))]
    //         .map(team => ({ label: team, value: team }));
    // }, [rawData]);

    // const subTeamOptions = useMemo(() => {
    //     return [...new Set(rawData.map(i => i.subTeam).filter(Boolean))]
    //         .map(team => ({ label: team, value: team }));
    // }, [rawData]);

    /* -------------------- FILTERED DATA -------------------- */
    const filteredData = useMemo(() => {
        return rawData.filter(item => {
            return (
                (!filters.associate || item.associateName === filters.associate.value) &&
                (!filters.mainTeam || item.mainTeam === filters.mainTeam.value) &&
                (!filters.subTeam || item.subTeam === filters.subTeam.value)
            );
        });
    }, [rawData, filters]);

    /* -------------------- TOTAL POINTS -------------------- */
    useEffect(() => {
        const total = filteredData.reduce(
            (sum, item) => sum + (Number(item.rewardPoint) || 0),
            0
        );
        setTotalPoints(total);
    }, [filteredData]);

    /* -------------------- TABLE COLUMNS -------------------- */
    const columns = [
        {
            name: "SL No.",
            width: "6%",
            cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>
        },
        {
            name: "Unique ID",
            selector: row => row?.saleId,
            sortable: true,
            cell: row => <WordWrapCell>{row?.saleId}</WordWrapCell>
        },
        {
            name: "Associate",
            selector: row => row?.associateName,
            sortable: true,
            cell: row => <WordWrapCell>{row?.associateName}</WordWrapCell>
        },
        {
            name: "MT/ST",
            selector: row => row?.mainTeam,
            sortable: true,
            cell: row => <WordWrapCell>{row?.mainTeam}/{row?.subTeam}</WordWrapCell>
        },
        {
            name: "Unit No.",
            selector: row => row?.projectUnitMaster?.unitNo,
            sortable: true,
            cell: row => <WordWrapCell>{row?.projectUnitMaster?.unitNo}</WordWrapCell>
        },
        {
            name: "Area",
            selector: row => row?.projectUnitMaster?.area,
            sortable: true,
            cell: row => <WordWrapCell>{row?.projectUnitMaster?.area}</WordWrapCell>
        },
        {
            name: "Builder",
            selector: row => row?.builderId?.bulderName,
            sortable: true,
            cell: row => <WordWrapCell>{row?.builderId?.bulderName}</WordWrapCell>
        },
        {
            name: "Project",
            selector: row => row?.projectId?.projectName,
            sortable: true,
            cell: row => <WordWrapCell>{row?.projectId?.projectName}</WordWrapCell>
        },
        {
            name: "Points",
            selector: row => row?.rewardPoint,
            sortable: true,
            cell: row => <WordWrapCell>{row?.rewardPoint}</WordWrapCell>
        },
        {
            name: "Booking Date",
            selector: row => row?.bookingDate,
            sortable: true,
            cell: row => <WordWrapCell>{formatDate(row?.bookingDate)}</WordWrapCell>
        }
    ];

    /* -------------------- EXCEL DOWNLOAD -------------------- */
    const downloadAllDataExcel = () => {
        if (!filteredData?.length) return;

        const headers = [
            "SL No.",
            "Unique ID",
            "Associate",
            "MT/ST",
            "Unit No.",
            "Area",
            "Builder",
            "Project",
            "Reward Points",
            "Booking Date"
        ];

        const rows = (filteredData?.filter(i => i?.rewardPoint !== 0))?.map((row, i) => [
            i + 1,
            row?.saleId,
            row?.associateName,
            `${row?.mainTeam}/${row?.subTeam}`,
            row?.projectUnitMaster?.unitNo,
            row?.projectUnitMaster?.area,
            row?.builderId?.bulderName,
            row?.projectId?.projectName,
            row?.rewardPoint,
            formatDate(row?.bookingDate)
        ]);

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reward Points");
        XLSX.writeFile(wb, `rewardPoints_${generateTimestamp()}.xlsx`);
    };

    if (accessGranted === null) return <ScreenLoader />;
    if (!accessGranted) return <PermissionMissing />;

    return (
        <PageContent>
            <Breadcrumbs title="Reward Points" breadcrumbItem="All Reward Points" />
            {isLoading && <ScreenLoader />}
            <Container fluid>
                <Card>
                    <CardBody>
                        {/* ---------------- FILTERS ---------------- */}
                        <Row className="g-3">
                            <Col md={3}>
                                <Label className="font-size-11 fw-semibold text-muted">Associate Name</Label>
                                <Select
                                    options={associateOptions}
                                    value={filters.associate}
                                    onChange={(v) =>
                                        setFilters({ ...filters, associate: v })
                                    }
                                    isClearable
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                />
                            </Col>

                            <Col md={3}>
                                <Label className="font-size-11 fw-semibold text-muted">Main Team</Label>
                                <Select
                                    options={mainTeams?.data?.data || []}
                                    value={filters.mainTeam}
                                    onChange={(v) =>
                                        setFilters({ ...filters, mainTeam: v })
                                    }
                                    isClearable
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                />
                            </Col>
                            <Col md={3}>
                                <Label className="font-size-11 fw-semibold text-muted">Sub Team</Label>
                                <Select
                                    options={subTeams?.data?.data || []}
                                    value={filters.subTeam}
                                    onChange={(v) =>
                                        setFilters({ ...filters, subTeam: v })
                                    }
                                    isClearable
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    isDisabled={!filters.mainTeam}
                                />
                            </Col>

                            <Col md={3} className="text-center align-items-end mt-5">
                                <h5 className="text-primary fw-bold font-size-14">
                                    Total Points: {totalPoints}
                                </h5>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                {/* ---------------- EXCEL ICON ---------------- */}
                {filteredData.length > 0 && (
                    <i
                        className="fas fa-file-excel mb-2"
                        style={{
                            color: defaultTheme.primary,
                            cursor: "pointer",
                            fontSize: "16px",
                        }}
                        onClick={downloadAllDataExcel}
                    />
                )}

                {/* ---------------- TABLE ---------------- */}
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={filteredData.filter(i => i.rewardPoint !== 0)}
                    pagination
                />
            </Container>
        </PageContent>
    );
}
