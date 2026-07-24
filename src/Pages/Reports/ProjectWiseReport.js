/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDate, formatDateForInput, formatTurnOver, generateTimestamp } from "../../helpers/function_helper";
import { ALL_LOCATION_DROPDOWN_ID, GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_, PROJECT_WISE_REPORT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css";
import { toast } from "react-toastify";
import ApiClient from "../../helpers/api_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import * as XLSX from 'xlsx-js-style';
import { useGet } from "../../Hooks/useApi";
import Select from "react-select";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function ProjectWiseReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const [builderSelect, setBuilderSelect] = useState(null);
  const [projectSelect, setProjectSelect] = useState(null);
  const [locationSelect, setLocationSelect] = useState(null);
  const [accessGranted, setAccessGranted] = useState(null);

  const userId = useUserStore((state) => state.user.userId);
  const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_, { enabled: Boolean(accessGranted) });
  const { data: projectList } = useGet(`${GET_PROJECT_BY_BUILDER_}${builderSelect?.value}&bdId=${userId}`, { enabled: Boolean(builderSelect?.value) });
  const { data: locationList } = useGet(ALL_LOCATION_DROPDOWN_ID, { enabled: Boolean(accessGranted) });

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'report-project-wise');
      setAccessGranted(hasAccess);
      if (hasAccess) {
        setTodayDate();
      }
    };
    checkAccess();
  }, [userId]);

  const setTodayDate = () => {
    const today = new Date(); // Get today's date
    setFromDate(formatDateForInput(today));
    setToDate(formatDateForInput(today));
  };

  const handleClearData = () => {
    setTodayDate();
    setProjectData([]);
    setBuilderSelect(null)
    setProjectSelect(null)
    setLocationSelect(null)
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "8%",
      // Skip the SL No. for the Total Row
      cell: (row, index) => row.main_team === "Total" ? "" : index + 1
    },
    {
      name: <span className="font-weight-bold fs-13">Main Team</span>,
      sortable: true,
      cell: (row) => (
        <div
          style={{
            wordWrap: "break-word",
            whiteSpace: "normal",
            fontWeight: row.main_team === "Total" ? "bold" : "normal", // Bold the total row
            color: row.main_team === "Total" ? defaultTheme.goldColorLogo : "black",
          }}
        >
          {row.main_team}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Project</span>,
      selector: (row) => row.project_name,
      sortable: true,
      cell: (row) => (
        <div
          style={{
            wordWrap: "break-word",
            whiteSpace: "normal",
            fontWeight: row.main_team === "Total" ? "bold" : "normal", // Bold the total row
            color: row.main_team === "Total" ? defaultTheme.goldColorLogo : "black",
          }}
        >
          {row.project_name}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Unit No.</span>,
      selector: (row) => row.unit_no,
      sortable: true,
      cell: (row) => (
        <div
          style={{
            wordWrap: "break-word",
            whiteSpace: "normal",
            fontWeight: row.main_team === "Total" ? "bold" : "normal", // Bold the total row
            color: row.main_team === "Total" ? defaultTheme.goldColorLogo : "black",
          }}
        >
          {row.unit_no}
        </div>
      ),
    },
     {
      name: <span className="font-weight-bold fs-13">Booking Date</span>,
      sortable: true,
      cell: (row) => (
        <div
          style={{
            wordWrap: "break-word",
            whiteSpace: "normal",
            fontWeight: row.booking_date === "Total" ? "bold" : "normal", // Bold the total row
            color: row.booking_date === "Total" ? defaultTheme.goldColorLogo : "black",
          }}
        >
          {formatDate(row.booking_date)||'-'}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Total Turnover (Cr.)</span>,
      selector: (row) => row.turnover,
      sortable: true,
      cell: (row) => (
        <div
          style={{
            wordWrap: "break-word",
            whiteSpace: "normal",
            fontWeight: row.main_team === "Total" ? "bold" : "normal", // Bold the total row
            color: row.main_team === "Total" ? defaultTheme.goldColorLogo : "black",
          }}
        >
          {formatTurnOver(row.turnover)}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Area (Sq.Ft.)</span>,
      selector: (row) => row.area,
      sortable: true,
      cell: (row) => (
        <div
          style={{
            wordWrap: "break-word",
            whiteSpace: "normal",
            fontWeight: row.main_team === "Total" ? "bold" : "normal", // Bold the total row
            color: row.main_team === "Total" ? defaultTheme.goldColorLogo : "black",
          }}
        >
          {row.area}
        </div>
      ),
    },
  ];

  const handleShowData = (e) => {
    e.preventDefault();
    if (!builderSelect) {
      toast.error('Please Select Builder')
    }
    else if (!projectSelect) {
      toast.error('Please Select Project')
    }
    else {
      getProjectDetails(builderSelect, projectSelect);
    }
  };

  const getProjectDetails = (builderSelect, projectSelect) => {
    setIsPending(true);
    let apiUrl = `${PROJECT_WISE_REPORT}${fromDate}&toDate=${toDate}`;
    // if (mainTeamSelect) {
    //   apiUrl += `&mainTeam=${mainTeamSelect.value}`;
    // }
    if (builderSelect) {
      apiUrl += `&builderId=${builderSelect.value}`;
    }
    if (projectSelect) {
      apiUrl += `&projectId=${projectSelect.value}`;
    }
    if (locationSelect) {
      apiUrl += `&locationId=${locationSelect.value}`;
    }
    ApiClient.get(apiUrl)
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          setProjectData(response.data.data)
        } else {
          setProjectData([]);
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        setProjectData([]);
        toast.error(error.message);
      });
  };

  const downloadProjectDataExcel = () => {
    if (!Array.isArray(projectData) || projectData.length === 0) return;

    // ── Styles ─────────────────────────────────────────────────────────────
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

    const cellStyle = (rowIdx, opts = {}) => ({
      font: { name: 'Calibri', sz: 10, color: { rgb: '0F172A' }, ...(opts.font || {}) },
      alignment: { vertical: 'center', wrapText: true, ...(opts.alignment || {}) },
      fill: opts.fill || {
        patternType: 'solid',
        fgColor: { rgb: rowIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC' },
      },
      border: BORDER,
    });

    // Pretty header from camelCase / snake_case keys
    const prettifyHeader = (key) =>
      String(key)
        .replace(/([A-Z])/g, ' $1')         // camelCase → camel Case
        .replace(/_/g, ' ')                   // snake_case → snake case
        .replace(/\b\w/g, (c) => c.toUpperCase()) // title-case
        .trim();

    // Decide if a column should be treated as numeric (right-aligned)
    const isNumericColumn = (key) => {
      // Sample first 5 values — if most are numbers, the column is numeric
      const sample = projectData.slice(0, 5).map((r) => r[key]);
      const numericCount = sample.filter(
        (v) => v !== null && v !== '' && !isNaN(Number(v))
      ).length;
      return numericCount > sample.length / 2;
    };

    // Width tuned to longest value (capped at 50)
    const colWidth = (key) => {
      const headerLen = prettifyHeader(key).length;
      const maxValueLen = projectData.reduce((max, row) => {
        const v = row[key];
        const len = v == null ? 0 : String(v).length;
        return Math.max(max, len);
      }, 0);
      return { wch: Math.min(Math.max(headerLen, maxValueLen) + 2, 50) };
    };

    // ── Build sheet ────────────────────────────────────────────────────────
    const headers = Object.keys(projectData[0]);
    const totalCols = headers.length;
    const lastColLetter = XLSX.utils.encode_col(totalCols - 1);

    const ws = {};
    ws['!ref'] = `A1:${lastColLetter}${3 + projectData.length}`;

    // Row 1: Title
    ws['A1'] = {
      v: `${projectSelect?.label || 'Project'} — Report`,
      t: 's',
      s: TITLE_STYLE,
    };

    // Row 2: Headers
    headers.forEach((key, ci) => {
      const addr = XLSX.utils.encode_cell({ c: ci, r: 2 });
      ws[addr] = { v: prettifyHeader(key), t: 's', s: HEADER_STYLE };
    });

    // Pre-compute numeric flag per column (faster than per cell)
    const numericFlags = headers.map(isNumericColumn);

    // Rows 3+: Data
    projectData.forEach((row, ri) => {
      headers.forEach((key, ci) => {
        const value = row[key];
        const addr = XLSX.utils.encode_cell({ c: ci, r: 3 + ri });
        const isNum = numericFlags[ci] && value !== null && value !== '' && !isNaN(Number(value));

        ws[addr] = {
          v: isNum ? Number(value) : (value ?? ''),
          t: isNum ? 'n' : 's',
          s: cellStyle(ri, {
            alignment: { horizontal: numericFlags[ci] ? 'right' : 'left' },
          }),
        };
      });
    });

    // ── Merges: title and meta span all columns ────────────────────────────
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
    ];

    // ── Column widths, row heights, freeze ─────────────────────────────────
    ws['!cols'] = headers.map(colWidth);
    ws['!rows'] = [
      { hpt: 28 }, // Title
      { hpt: 18 }, // Meta
      { hpt: 24 }, // Header
    ];
    ws['!freeze'] = { xSplit: 0, ySplit: 3 }; // freeze title/meta/header rows

    // ── Workbook + save ────────────────────────────────────────────────────
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Project Wise Report');
    XLSX.writeFile(
      wb,
      `${projectSelect?.label || 'Project'}_Report_${generateTimestamp()}.xlsx`
    );
  };

  // Calculate totals
  const totalTurnover = projectData?.reduce((sum, row) => sum + row.turnover, 0);
  const totalArea = projectData?.reduce((sum, row) => sum + row.area, 0);

  // Add a new row for the totals
  const totalRow = {
    main_team: 'Total',  // Add a label to show it's the total row
    unit_no: null,
    turnover: totalTurnover?.toFixed(2),
    area: totalArea?.toFixed(2)
  };

  // Add the total row to projectData
  // const dataWithTotal = [...projectData?.content, totalRow];
  const dataWithTotal = Array.isArray(projectData)
    ? [...projectData, totalRow]
    : projectData || [];

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Report" breadcrumbItem="Project Wise" />
      {isPending && <ScreenLoader />}
      <Container fluid={true}>
        <Card>
          <CardBody>
            <form onSubmit={handleShowData}>
              <Row className="g-3">
                <Col md="2">
                  <h6 className="font-size-11">From Date (Created Date)</h6>
                  <input
                    className="form-control"
                    type="date"
                    id="date-input-1"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Col>
                <Col md="2">
                  <h6 className="font-size-11">To Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    id="date-input-2"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Col>
                <Col md="2">
                  <h6 className="font-size-11">Builder</h6>
                  <Select
                    value={builderSelect}
                    onChange={setBuilderSelect}
                    options={Array.isArray(builderList?.data?.data) ? builderList?.data?.data : []}
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                  />
                </Col>
                <Col md="2">
                  <h6 className="font-size-11">Project</h6>
                  <Select
                    value={projectSelect}
                    onChange={setProjectSelect}
                    options={Array.isArray(projectList?.data?.data) ? projectList?.data?.data : []}
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isDisabled={!builderSelect}
                  />
                </Col>
                <Col md="2">
                  <h6 className="font-size-11">Branch</h6>
                  <Select
                    value={locationSelect}
                    onChange={setLocationSelect}
                    options={Array.isArray(locationList?.data?.data) ? locationList?.data?.data : []}
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                  />
                </Col>
                {/* <Col md="3">
                  <h6 className="font-size-11">Main Team</h6>
                  <Select
                    menuPortalTarget={document.body}
                    isClearable
                    value={mainTeamSelect}
                    onChange={setMainTeamSelect}
                    options={mainTeams?.data?.data || []}
                  />
                </Col> */}

                <Col md="2" className="d-flex align-items-end gap-2">
                  <Button
                    color="primary"
                    type="submit"
                    onClick={handleShowData}
                  >
                    Show
                  </Button>
                  <Button
                    color="secondary"
                    type="button"
                    onClick={handleClearData}
                  >
                    Clear
                  </Button>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>
      </Container>
      {projectData?.length > 0 && (
        <i
          className="fas fa-file-excel"
          style={{
            color: defaultTheme.primary,
            cursor: "pointer",
            fontSize: "15px",
          }}
          onClick={downloadProjectDataExcel}
        ></i>
      )}
      {projectData?.length > 0 && (
        <AppTable
          progressPending={isPending}
          columns={columns}
          data={dataWithTotal}
          pagination
        />
      )}
    </PageContent>
  );
}