/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, formatTurnOver, generateTimestamp } from "../../helpers/function_helper";
import { BUIDER_WISE_REPORT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css"; // Import your CSS file
import { toast } from "react-toastify";
import ApiClient from "../../helpers/api_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import * as XLSX from 'xlsx-js-style';
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function BuilderWiseReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [page, setPage] = useState(1);
  const LIMIT = 100;
  const [builderData, setBuilderData] = useState([]);
  const [flag, setFlag] = useState(false);

  const [accessGranted, setAccessGranted] = useState(null);
  const userId = useUserStore((state) => state.user.userId);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'report-builder-wise');
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
    setBuilderData([]);
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (row, index) => index + 1,
      width: "10%",
      // Skip the SL No. for the Total Row
      cell: (row, index) => row.builder === "Total" ? "" : index + 1
    },
    {
      name: <span className="font-weight-bold fs-13">Builder</span>,
      selector: (row) => row.builder,
      sortable: true,
      width: "30%",
      cell: (row) => (
        <div
          style={{
            wordWrap: "break-word",
            whiteSpace: "normal",
            fontWeight: row.builder === "Total" ? "bold" : "normal", // Bold the total row
            color: row.builder === "Total" ? defaultTheme.goldColorLogo : "black",
          }}
        >
          {row.builder}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Total Unit</span>,
      selector: (row) => row.count,
      sortable: true,
      width: "30%",
      cell: (row) => (
        <div
          style={{
            wordWrap: "break-word",
            whiteSpace: "normal",
            fontWeight: row.builder === "Total" ? "bold" : "normal", // Bold the total row
            color: row.builder === "Total" ? defaultTheme.goldColorLogo : "black",
          }}
        >
          {row.count}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Total Turnover (Cr.)</span>,
      selector: (row) => row.turnover,
      sortable: true,
      width: "15%",
      cell: (row) => (
        <div
          style={{
            wordWrap: "break-word",
            whiteSpace: "normal",
            fontWeight: row.builder === "Total" ? "bold" : "normal", // Bold the total row
            color: row.builder === "Total" ? defaultTheme.goldColorLogo : "black",
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
      width: "15%",
      cell: (row) => (
        <div
          style={{
            wordWrap: "break-word",
            whiteSpace: "normal",
            fontWeight: row.builder === "Total" ? "bold" : "normal", // Bold the total row
            color: row.builder === "Total" ? defaultTheme.goldColorLogo : "black",
          }}
        >
          {row.area}
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (flag) {
      getBuilderDetails();
    }
  }, [page]);

  const handleShowData = (e) => {
    e.preventDefault();
    getBuilderDetails();
  };

  const getBuilderDetails = () => {
    setIsPending(true);
    ApiClient.get(
      `${BUIDER_WISE_REPORT}${fromDate}&toDate=${toDate}&offset=${page - 1
      }&limit=${LIMIT}`
    )
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          const encryptedContent = response.data.data;
          decryptData(encryptedContent).then((decrypted) => {
            setBuilderData(decrypted);
          }).catch((error) => {
            setBuilderData([]);
          });

        } else {
          setBuilderData([]);
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        setBuilderData([]);
        toast.error(error.message);
      });
  };

  const downloadBuilderDataExcel = () => {
    if (!Array.isArray(builderData?.content) || builderData.content.length === 0) return;

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
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();

    // Sample first 5 rows to decide if a column is numeric
    const isNumericColumn = (key, rows) => {
      const sample = rows.slice(0, 5).map((r) => r[key]);
      const numericCount = sample.filter(
        (v) => v !== null && v !== '' && !isNaN(Number(v))
      ).length;
      return numericCount > sample.length / 2;
    };

    // Width tuned to longest value (capped at 50)
    const colWidth = (key, rows) => {
      const headerLen = prettifyHeader(key).length;
      const maxValueLen = rows.reduce((max, row) => {
        const v = row[key];
        const len = v == null ? 0 : String(v).length;
        return Math.max(max, len);
      }, 0);
      return { wch: Math.min(Math.max(headerLen, maxValueLen) + 2, 50) };
    };

    // ── Prepare headers (drop the 2nd key, same as original) ───────────────
    const rows = builderData.content;
    const headers = Object.keys(rows[0]);
    headers.splice(1, 1); // Removes the second element (SL No.)

    const totalCols = headers.length;
    const lastColLetter = XLSX.utils.encode_col(totalCols - 1);

    const ws = {};
    ws['!ref'] = `A1:${lastColLetter}${3 + rows.length}`;

    // Row 1: Title
    ws['A1'] = {
      v: 'Builder Wise Report',
      t: 's',
      s: TITLE_STYLE,
    };


    // Row 3: Headers
    headers.forEach((key, ci) => {
      const addr = XLSX.utils.encode_cell({ c: ci, r: 2 });
      ws[addr] = { v: prettifyHeader(key), t: 's', s: HEADER_STYLE };
    });

    // Pre-compute numeric flag per kept column
    const numericFlags = headers.map((key) => isNumericColumn(key, rows));

    // Rows 4+: Data
    rows.forEach((row, ri) => {
      headers.forEach((key, ci) => {
        const value = row[key];
        const addr = XLSX.utils.encode_cell({ c: ci, r: 3 + ri });
        const isNum =
          numericFlags[ci] &&
          value !== null &&
          value !== '' &&
          !isNaN(Number(value));

        ws[addr] = {
          v: isNum ? Number(value) : (value ?? ''),
          t: isNum ? 'n' : 's',
          s: cellStyle(ri, {
            alignment: { horizontal: numericFlags[ci] ? 'right' : 'left' },
          }),
        };
      });
    });

    // Merges: title and meta span the full width
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
    ];

    // Column widths, row heights, freeze panes
    ws['!cols'] = headers.map((key) => colWidth(key, rows));
    ws['!rows'] = [
      { hpt: 28 }, // Title
      { hpt: 18 }, // Meta
      { hpt: 24 }, // Header
    ];
    ws['!freeze'] = { xSplit: 0, ySplit: 3 };

    // Workbook + save
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Builder Wise Report');
    XLSX.writeFile(wb, `builderWiseReport_${generateTimestamp()}.xlsx`);
  };

  const totalCount = builderData?.content?.reduce((sum, row) => sum + row.count, 0);
  const totalTurnover = builderData?.content?.reduce((sum, row) => sum + row.turnover, 0);
  const totalArea = builderData?.content?.reduce((sum, row) => sum + row.area, 0);

  const totalRow = {
    builder: "Total",
    project: null,
    count: totalCount,
    turnover: totalTurnover?.toFixed(2),
    area: totalArea?.toFixed(2),
  };

  const dataWithTotal = Array.isArray(builderData?.content)
    ? [...builderData?.content, totalRow]
    : builderData?.content || [];


  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Report" breadcrumbItem="Builder Wise" />
      {isPending && <ScreenLoader />}
      <Container fluid={true}>
        <Card>
          <CardBody>
            <form onSubmit={handleShowData}>
              <Row className="mb-3">
                <Col md="3">
                  <h6 className="mb-1 mt-2 font-size-11">From Date (Created Date)</h6>
                  <input
                    className="form-control"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Col>
                <Col md="3">
                  <h6 className="mb-1 mt-2 font-size-11">To Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Col>

                <Col md="3" className="d-flex align-items-end gap-2">
                    <Button
                      color="primary"
                      type="submit"
                      onClick={handleShowData}
                    >
                      Show
                    </Button>
                    <Button
                      color="secondary"
                      onClick={handleClearData}
                    >
                      Cancel
                    </Button>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>
      </Container>

      {builderData?.content?.length > 0 && (
        <i
          className="fas fa-file-excel"
          style={{
            color: defaultTheme.primary,
            cursor: "pointer",
            fontSize: "15px",
          }}
          onClick={downloadBuilderDataExcel}
        ></i>
      )}

      {builderData?.content?.length > 0 && (
        <AppTable
          progressPending={isPending}
          columns={columns}
          data={Array.isArray(dataWithTotal) ? dataWithTotal : []}
          paginationTotalRows={builderData?.totalElements || 0}
          pagination
          paginationServer
          onChangePage={(newPage) => {
            setPage(newPage);
            setFlag(true);
          }}
        />
      )}
    </PageContent>
  );
}
