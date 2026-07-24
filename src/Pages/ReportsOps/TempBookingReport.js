import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Button, Card, CardBody } from 'reactstrap';
import Select from 'react-select';
import * as XLSX from 'xlsx-js-style';
import { FaFileExcel } from 'react-icons/fa';
import {
    TEMP_BOOKING_REPORT,
    GET_DROPDOWN_BUILDER_,
    GET_PROJECT_BY_BUILDER_,
    GET_ALL_MAIN_TEAM_DROPDOWN,
    GET_ALL_SUB_TEAM_DROPDOWN,
    ALL_LOCATION_DROPDOWN_ID,
} from '../../helpers/url_helper';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import AppTable from '../../components/Common/Table';
import {
    calculateAgingDayWise,
    formatDateTime,
    generateTimestamp,
    WordWrapCell,
} from '../../helpers/function_helper';
import { useGet } from '../../Hooks/useApi';
import PermissionMissing from '../Utility/PermissonMissing';
import { useUserStore } from '../../store/useUserStore';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import { decryptData } from '../../components/Common/CryptoUtils';
import { toast } from 'react-toastify';

const EMPTY_FILTERS = {
    builder: null,
    project: null,
    mainTeam: null,
    subTeam: null,
    branch: null,
};

// ── Excel styling presets (xlsx-js-style format) ─────────────────────────────
const BORDER = {
    top: { style: 'thin', color: { rgb: 'B7B7B7' } },
    bottom: { style: 'thin', color: { rgb: 'B7B7B7' } },
    left: { style: 'thin', color: { rgb: 'B7B7B7' } },
    right: { style: 'thin', color: { rgb: 'B7B7B7' } },
};

const TITLE_STYLE = {
    font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    fill: { patternType: 'solid', fgColor: { rgb: '005B52' } },
    border: BORDER,
};

const HEADER_STYLE = {
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    fill: { patternType: 'solid', fgColor: { rgb: '005B52' } },
    border: BORDER,
};

const CELL_BASE = {
    font: { name: 'Calibri', sz: 10, color: { rgb: '0F172A' } },
    alignment: { vertical: 'center', wrapText: true },
    border: BORDER,
};

const cellStyle = (rowIdx, opts = {}) => ({
    ...CELL_BASE,
    ...opts,
    alignment: { ...CELL_BASE.alignment, ...(opts.alignment || {}) },
    font: { ...CELL_BASE.font, ...(opts.font || {}) },
    fill: opts.fill || {
        patternType: 'solid',
        fgColor: { rgb: rowIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC' },
    },
});


export default function TempBookingReport() {
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);
    const [tempBookingList, setTempBookingList] = useState([]);

    const [formState, setFormState] = useState(EMPTY_FILTERS);

    const handleFormChange = (key, val) => {
        setFormState((prev) => {
            const next = { ...prev, [key]: val };
            if (key === 'builder') next.project = null;
            if (key === 'mainTeam') next.subTeam = null;
            return next;
        });
    };

    const handleClearFilters = () => setFormState(EMPTY_FILTERS);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'temp-booking-report');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const { data, isLoading } = useGet(
        `${TEMP_BOOKING_REPORT}&bdId=${userId}`,
        { enabled: !!accessGranted }
    );

    useEffect(() => {
        if (data?.data?.status === 1) {
            decryptData(data?.data?.data).then((decryptedData) => {
                if (decryptedData) {
                    setTempBookingList(decryptedData);
                } else {
                    setTempBookingList([]);
                }
            });
        }
    }, [data]);

    const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_, {
        enabled: Boolean(accessGranted),
    });

    const { data: locationList } = useGet(ALL_LOCATION_DROPDOWN_ID, { enabled: Boolean(accessGranted) });

    const { data: projectData } = useGet(
        `${GET_PROJECT_BY_BUILDER_}${formState?.builder?.value}&bdId=${userId}`,
        { enabled: Boolean(formState?.builder?.value && accessGranted) }
    );

    const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN, {
        enabled: Boolean(accessGranted),
    });

    const { data: subTeams } = useGet(
        `${GET_ALL_SUB_TEAM_DROPDOWN}${formState?.mainTeam?.value}`,
        { enabled: Boolean(formState?.mainTeam && accessGranted) }
    );

    const filteredRows = useMemo(() => {
        const rows = tempBookingList?.content || [];
        if (!Array.isArray(rows) || rows.length === 0) return [];

        const { builder, project, mainTeam, subTeam, branch } = formState;
        if (!builder && !project && !mainTeam && !subTeam && !branch) return rows;

        return rows.filter((row) => {
            if (builder && row.builderName !== builder.label) return false;
            if (project && row.projectName !== project.label) return false;
            if (mainTeam && row.mainTeam !== mainTeam.value) return false;
            if (subTeam && row.subTeam !== subTeam.value) return false;
            if (branch && row.location !== branch.label) return false;
            return true;
        });
    }, [tempBookingList, formState]);

    // ── Excel download ───────────────────────────────────────────────────────
    const handleDownloadExcel = () => {
        if (!filteredRows || filteredRows.length === 0) {
            toast.warn('No records to export');
            return;
        }

        // Column definitions (header + value extractor)
        const COLS = [
            { header: 'SL No.', get: (r, i) => i + 1, width: 8 },
            { header: 'Complete %', get: (r) => r.bookingCompletePercentage ?? '', width: 12 },
            { header: 'Associate', get: (r) => r.associateName ?? '', width: 22 },
            { header: 'Team', get: (r) => r.mainTeam + '/' + (r.subTeam || '') ?? '', width: 14 },
            { header: 'Booking Date & Time', get: (r) => r.bookingDate ? formatDateTime(r.bookingDate) : '', width: 22 },
            { header: 'Branch', get: (r) => r.location ?? '', width: 14 },
            { header: 'Pending From', get: (r) => r.bookingDate ? calculateAgingDayWise(r.bookingDate, new Date()) : '', width: 16 },
            { header: 'Builder', get: (r) => r.builderName ?? '', width: 22 },
            { header: 'Project Name', get: (r) => r.projectName ?? '', width: 26 },
            { header: 'Area (sq.ft.)', get: (r) => r.squareFeetArea ?? '', width: 14 },
            { header: 'Unit No.', get: (r) => r.unitNo ?? '', width: 14 },
            { header: 'Token Money', get: (r) => r.tokenMoney ?? '', width: 14 },
            { header: 'Remarks', get: (r) => r.remarks ?? '', width: 50 },
        ];

        const totalCols = COLS.length;
        const lastColLetter = XLSX.utils.encode_col(totalCols - 1);

        // Build worksheet as an object map (cell address → cell with style)
        const ws = {};
        ws['!ref'] = `A1:${lastColLetter}${4 + filteredRows.length}`;

        // ── Row 1: Title ─────────────────────────────────────────────────────
        ws['A1'] = { v: 'TEMP BOOKING REPORT', t: 's', s: TITLE_STYLE };

        // ── Row 2: Meta (generated timestamp + filter summary) ──────────────
        // const filterSummary = [
        //     formState.builder && `Builder: ${formState.builder.label}`,
        //     formState.project && `Project: ${formState.project.label}`,
        //     formState.mainTeam && `Main Team: ${formState.mainTeam.label}`,
        //     formState.subTeam && `Sub Team: ${formState.subTeam.label}`,
        // ].filter(Boolean).join('  ·  ');

        // const metaText =
        //     `Generated: ${new Date().toLocaleString('en-IN')}` +
        //     `   ·   Records: ${filteredRows.length}` +
        //     (filterSummary ? `   ·   Filters → ${filterSummary}` : '');

        // ws['A2'] = { v: metaText, t: 's', s: META_STYLE };

        // ── Row 3: empty spacer ──────────────────────────────────────────────
        // (left blank intentionally)

        // ── Row 4: Header ────────────────────────────────────────────────────
        COLS.forEach((col, ci) => {
            const addr = XLSX.utils.encode_cell({ c: ci, r: 3 });
            ws[addr] = { v: col.header, t: 's', s: HEADER_STYLE };
        });

        // ── Rows 5+: Data ────────────────────────────────────────────────────
        filteredRows.forEach((row, ri) => {
            COLS.forEach((col, ci) => {
                const value = col.get(row, ri);
                const addr = XLSX.utils.encode_cell({ c: ci, r: 4 + ri });

                // SL No. column → centered
                if (ci === 0) {
                    ws[addr] = {
                        v: value, t: 'n',
                        s: cellStyle(ri, { alignment: { horizontal: 'center' } }),
                    };
                    return;
                }

                // Complete % column → colored by value, centered, bold
                // if (col.header === 'Complete %') {
                //     ws[addr] = {
                //         v: value, t: 's',
                //         s: cellStyle(ri, {
                //             alignment: { horizontal: 'center' },
                //             font: { bold: true, color: { rgb: '0F172A' } },
                //             fill: completePctFill(value),
                //         }),
                //     };
                //     return;
                // }

                // Numeric columns → right-aligned
                if (col.header === 'Area (sq.ft.)' || col.header === 'Turnover (Cr.)' || col.header === 'Pending From') {
                    ws[addr] = {
                        v: value,
                        t: typeof value === 'number' ? 'n' : 's',
                        s: cellStyle(ri, { alignment: { horizontal: 'right' } }),
                    };
                    return;
                }

                // Default text cell
                ws[addr] = {
                    v: value,
                    t: typeof value === 'number' ? 'n' : 's',
                    s: cellStyle(ri),
                };
            });
        });

        // ── Merges: title and meta span the full width ──────────────────────
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }, // Title row
            { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } }, // Meta row
        ];

        // ── Column widths ────────────────────────────────────────────────────
        ws['!cols'] = COLS.map((c) => ({ wch: c.width }));

        // ── Row heights ──────────────────────────────────────────────────────
        ws['!rows'] = [
            { hpt: 28 }, // Title
            { hpt: 18 }, // Meta
            { hpt: 8 },  // Spacer
            { hpt: 24 }, // Header
            // Data rows use auto-height; leave undefined for the rest
        ];

        // ── Freeze top 4 rows ────────────────────────────────────────────────
        ws['!freeze'] = { xSplit: 0, ySplit: 4 };

        // ── Workbook + save ──────────────────────────────────────────────────
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Temp Bookings');

        const filename = `TempBookingReport_${generateTimestamp ? generateTimestamp() : Date.now()}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, i) => i + 1,
            width: '6%',
        },
        {
            name: <span className="font-weight-bold fs-13">Complete %</span>,
            selector: (row) => row.bookingCompletePercentage,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.bookingCompletePercentage || "—"}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Associate</span>,
            selector: (row) => row.associateName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.associateName || "—"}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Team</span>,
            selector: (row) => row.mainTeam,
            sortable: true,
            cell: (row) => (
                <WordWrapCell>{row.mainTeam + '/' + row.subTeam || "—"}</WordWrapCell>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Booking Date & Time</span>,
            selector: (row) => row.bookingDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.bookingDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Branch</span>,
            selector: (row) => row.location,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.location || "—"}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Pending From</span>,
            selector: (row) => row.bookingDate,
            sortable: true,
            cell: (row) => (
                <WordWrapCell>
                    {calculateAgingDayWise(row.bookingDate, new Date()) || "—"}
                </WordWrapCell>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Builder Name</span>,
            selector: (row) => row.builderName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.builderName || "—"}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Project Name</span>,
            selector: (row) => row.projectName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.projectName || "—"}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Area</span>,
            selector: (row) => row.squareFeetArea,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.squareFeetArea || "—"}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Unit No.</span>,
            selector: (row) => row.unitNo,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.unitNo || "—"}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Token Money</span>,
            selector: (row) => row.tokenMoney,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.tokenMoney || "—"}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Remarks</span>,
            selector: (row) => row.remarks,
            sortable: true,
            width: '40%',
            cell: (row) => <WordWrapCell>{row.remarks || "—"}</WordWrapCell>,
        },
    ];

    if (accessGranted === null) return <ScreenLoader />;
    if (!accessGranted) return <PermissionMissing />;

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Temp Booking" />
            {isLoading && <ScreenLoader />}

            <Container fluid={true}>
                {/* ══ Filters ══════════════════════════════════════════════ */}
                <Card>
                    <CardBody>
                        <Row className="align-items-end">
                            <Col md="2">
                                <h6 className="font-size-11">Builder</h6>
                                <Select
                                    value={formState.builder}
                                    onChange={(val) => handleFormChange('builder', val)}
                                    options={Array.isArray(builderList?.data?.data) ? builderList.data.data : []}
                                    isClearable
                                    styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                                    menuPortalTarget={document.body}
                                />
                            </Col>
                            <Col md="2">
                                <h6 className="font-size-11">Project</h6>
                                <Select
                                    value={formState.project}
                                    onChange={(val) => handleFormChange('project', val)}
                                    options={Array.isArray(projectData?.data?.data) ? projectData.data.data : []}
                                    isClearable
                                    styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                                    menuPortalTarget={document.body}
                                    isDisabled={!formState.builder}
                                />
                            </Col>
                            <Col md="2">
                                <h6 className="font-size-11">Main Team</h6>
                                <Select
                                    value={formState.mainTeam}
                                    onChange={(val) => handleFormChange('mainTeam', val)}
                                    options={Array.isArray(mainTeams?.data?.data) ? mainTeams.data.data : []}
                                    isClearable
                                    styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                                    menuPortalTarget={document.body}
                                />
                            </Col>
                            <Col md="2">
                                <h6 className="font-size-11">Sub Team</h6>
                                <Select
                                    value={formState.subTeam}
                                    onChange={(val) => handleFormChange('subTeam', val)}
                                    options={Array.isArray(subTeams?.data?.data) ? subTeams.data.data : []}
                                    isClearable
                                    styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                                    menuPortalTarget={document.body}
                                    isDisabled={!formState.mainTeam}
                                />
                            </Col>
                            <Col md="2">
                                <h6 className="font-size-11">Branch</h6>
                                <Select
                                    value={formState.branch}
                                    onChange={(val) => handleFormChange("branch", val)}
                                    options={Array.isArray(locationList?.data?.data) ? locationList?.data?.data : []}
                                    isClearable
                                    style={{ zIndex: 9999 }}
                                    menuPortalTarget={document.body}
                                />
                            </Col>
                            <Col md="2">
                                <Button
                                    color="primary"
                                    onClick={handleClearFilters}
                                >
                                    Clear
                                </Button>

                                <Button
                                    onClick={handleDownloadExcel}
                                    className="secondary ms-2"
                                >
                                    <FaFileExcel size={13} className="me-1" />
                                    Excel
                                </Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                {/* ══ Data table ═══════════════════════════════════════════ */}
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={filteredRows}
                    pagination
                />
            </Container>
        </PageContent>
    );
}