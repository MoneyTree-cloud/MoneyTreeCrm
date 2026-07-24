/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { MdHistory } from 'react-icons/md';
import * as XLSX from 'xlsx-js-style';
import { toast } from 'react-toastify';
import AppTable from '../../components/Common/Table';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import PageContent from '../../components/Common/PageContent';
import { useGet } from '../../Hooks/useApi';
import { defaultTheme } from '../../helpers/defaultTheme';
import { GET_ALL_PROJECT_UNITS, GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_ } from '../../helpers/url_helper';
import { formatDate, formatDateForInput, formatDateTime, generateTimestamp, WordWrapCell } from '../../helpers/function_helper';
import ApiClient from '../../helpers/api_helper';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import { useUserStore } from '../../store/useUserStore';
import PermissionMissing from '../Utility/PermissonMissing';
import { decryptData } from '../../components/Common/CryptoUtils';

const ProjectUnitMaster = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const {
    unitNo: initialUnitNo,
    fromDate: initialFromDate,
    toDate: initialToDate,
    page: initialPage,
    unitGroupSelect: initialUnitGroup,
    builder: initialBuilder,
    project: initialProject,
    area: initialArea,
    tower: initialTower,
    floor: initialFloor
  } = state || {};

  // State management
  const [unitNo, setUnitNo] = useState(initialUnitNo || '');
  const [area, setArea] = useState(initialArea || '');
  const [tower, setTower] = useState(initialTower || '');
  const [floor, setFloor] = useState(initialFloor || '');

  const [unitGroupSelect, setUnitGroupSelect] = useState(null);
  const [builderGroupSelect, setBuilderGroupSelect] = useState(null);
  const [projectGroupSelect, setProjectGroupSelect] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [projectUnitData, setProjectUnitData] = useState([]);
  const [page, setPage] = useState(initialPage || 1);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [accessGranted, setAccessGranted] = useState(null);

  const LIMIT = 100;

  // API hooks
  const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_, { enabled: !!accessGranted });
  const userId = useUserStore((state) => state.user.userId);

  const { data: projectData } = useGet(
    `${GET_PROJECT_BY_BUILDER_}${builderGroupSelect?.value}`,
    { enabled: Boolean(builderGroupSelect?.value || initialBuilder) }
  );

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'project-unit-master');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  // Unit status options
  const unitTypeGroup = [
    { label: 'Admin Pre Sold', value: 'adminPreSold' },
    { label: 'Block', value: 'block' },
    { label: 'Builder Sold', value: 'builderSold ' },
    { label: 'Hold', value: 'hold' },
    { label: 'Open', value: 'open' },
    { label: 'Pre Sold', value: 'preSold' },
    { label: 'Sold', value: 'sold' }
  ];

  // Initialize date range
  useEffect(() => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setFromDate(initialFromDate || '2024-01-01');
    setToDate(initialToDate || formatDateForInput(endOfMonth));

    if (!initialFromDate && accessGranted) {
      fetchUnitDetails({
        fromDate: '2024-01-01',
        toDate: formatDateForInput(endOfMonth),
        page: 0
      });
    }
  }, [accessGranted]);

  // Handle initial state from location
  useEffect(() => {
    if (initialBuilder && builderList?.data?.data) {
      setBuilderGroupSelect(
        builderList.data.data.find(item => item.value === initialBuilder)
      );
    }
  }, [initialBuilder, builderList]);

  useEffect(() => {
    if (initialProject && projectData?.data?.data) {
      setProjectGroupSelect(
        projectData.data.data.find(item => item.value === initialProject)
      );
    }
  }, [initialProject, projectData]);

  useEffect(() => {
    if (initialFromDate || initialToDate || initialUnitGroup || initialUnitNo) {
      setUnitNo(initialUnitNo || '');
      setFromDate(initialFromDate || fromDate);
      setToDate(initialToDate || toDate);
      setPage(initialPage || 1);

      if (initialUnitGroup) {
        setUnitGroupSelect(
          unitTypeGroup.find(item => item.value === initialUnitGroup)
        );
      }
      if (accessGranted) {
        fetchUnitDetails({
          fromDate: initialFromDate || fromDate,
          toDate: initialToDate || toDate,
          page: (initialPage || page) - 1,
          unitStatus: initialUnitGroup,
          unitNo: initialUnitNo,
          builderId: initialBuilder,
          projectId: initialProject
        });
      }
    }
  }, [initialFromDate, initialToDate, initialUnitGroup, initialUnitNo, initialBuilder, initialProject, accessGranted]);

  // Handle pagination
  useEffect(() => {
    if (shouldFetch && accessGranted) {
      fetchUnitDetails();
    }
  }, [page, shouldFetch, accessGranted]);

  // Common function to build query parameters
  const buildQueryParams = (params = {}) => {
    const {
      fromDate: fDate = fromDate,
      toDate: tDate = toDate,
      page: pg = page - 1,
      size: sz = LIMIT,
      unitStatus = unitGroupSelect?.value,
      unitNo: uNo = unitNo,
      builderId = builderGroupSelect?.value,
      projectId = projectGroupSelect?.value,
    } = params;

    let query = `${GET_ALL_PROJECT_UNITS}&fromdate=${fDate}&todate=${tDate}&page=${pg}&size=${sz}`;
    if (unitStatus) query += `&unitStatus=${unitStatus}`;
    if (uNo) query += `&key=unitNo&value=${uNo}`;
    if (builderId) query += `&builderId=${builderId}`;
    if (projectId) query += `&projectId=${projectId}`;
    if (area) query += `&area=${area}`;
    if (floor) query += `&floor=${floor}`;
    if (tower) query += `&tower=${tower}`;
    return query;
  };

  // Fetch unit details
  const fetchUnitDetails = async (params = {}) => {
    setIsPending(true);
    try {
      const response = await ApiClient.get(buildQueryParams(params));
      setIsPending(false);
      if (response?.data?.status === 1) {
        const encryptedContent = response.data.data;
        decryptData(encryptedContent).then((decrypted) => {
          setProjectUnitData(decrypted);
        }).catch((error) => {
          setProjectUnitData([]);
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      setIsPending(false);
      toast.error(error.message);
    }
  };

  // Handle navigation to add/edit project unit
  const handleManageProjectUnit = (row) => {
    navigate('/project-unit-master/add-project-unit-master', {
      state: {
        row,
        unitNo,
        fromDate,
        toDate,
        page,
        unitGroupSelect: unitGroupSelect?.value,
        builder: builderGroupSelect?.value,
        project: projectGroupSelect?.value,
        area: area,
        tower: tower,
        floor: floor
      }
    });
  };

  // Table columns configuration
  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: '2%'
    },
    {
      name: <span className="font-weight-bold fs-13">Manage</span>,
      width: '2%',
      cell: row => (
        <i
          className="ri-pencil-fill"
          title='Manage Unit'
          style={{ cursor: 'pointer', color: defaultTheme.goldColorLogo }}
          onClick={() => handleManageProjectUnit(row)}
        />
      )
    },
    {
      name: <span className="font-weight-bold fs-13">History</span>,
      width: '2%',
      cell: row => (
        <MdHistory
          color={defaultTheme.goldColorLogo}
          cursor={'pointer'}
          fontSize={20}
          title='Unit History'
          onClick={() => navigate('/project-unit-master/project-unit-history', {
            state: {
              row, unitNo, fromDate, toDate, page, unitGroupSelect: unitGroupSelect?.value, builder: builderGroupSelect?.value, project: projectGroupSelect?.value, area: area, tower: tower,
              floor: floor
            }
          })}
        />
      )
    },
    ...[
      ['Builder Name', 'builderName', '3%'],
      ['Project Name', 'projectName', '3%'],
      ['Project Type Name', 'projectTypeId', '4%'],
      ['Unit No', 'unitNo'],
      ['Unit Status', 'unitStatus'],
      ['Hold By', 'holdByName', null, (value, row) =>
        row?.unitStatus === 'hold' ? value || '-' : '-'
      ],
      ['Admin Hold For', 'adminHoldFor'],
      ['Created Date & Time', 'createdDate', '4%', formatDateTime],
      ['Tower Block', 'towerBlock'],
      ['Floor', 'floor'],
      ['Area', 'area'],
      ['BSP', 'bsp', null, value => value?.toFixed(2)],
      ['Total Area Bsp', 'totalAreaBsp', null, value => value?.toFixed(2)],
      ['Inugral Discount', 'inauguralDiscount'],
      ['NPV', 'npv'],
      ['Other Discount builder', 'othDicountBuilder', null, value => value?.toFixed(2)],
      ['Net BSP', 'netBsp', null, value => value?.toFixed(2)],
      ['Floor Plc', 'floorPlc'],
      ['Facing Plc', 'facingPlc'],
      ['Other View Plc', 'otherViewPlc'],
      ['Car Parking', 'carParking'],
      ['Club Membership', 'clubMembership'],
      ['Power Backup Charges', 'powerBackupCharges'],
      ['IFMS', 'ifmsAfterDiscount'],
      ['Lease Rent', 'leaseRentAfterDiscount'],
      ['ESSC', 'esscPer'],
      ['CRF', 'crfPer'],
      ['EDC IDC', 'edcIdc'],
      ['EEC FFC', 'eecFfc'],
      ['Terrage/Garden', 'terrageGarden'],
      ['Sinking Fund', 'sinkingFund'],
      ['Facilities', 'facilities'],
      ['Maintenance', 'maintenance'],
      ['Meter', 'meter'],
      ['Security', 'security'],
      ['Miscellaneous', 'miscellaneous'],
      ['Other Charges', 'otherCharges', '3%', value => value?.toFixed(2)],
      ['Net Cost', 'netCost', '3%', value => value?.toFixed(2)],
      ['Gst Percent', 'gstPercent'],
      ['Gst Amount', 'gstAmount', null, value => value?.toFixed(2)],
      ['Net Cost WithGst', 'netCostWithGst', null, value => value?.toFixed(2)],
      ['Valid Till', 'validTill', null, formatDate]
    ].map(([name, selector, width, formatter]) => ({
      name: <span className="font-weight-bold fs-13">{name}</span>,
      selector: row => row[selector],
      sortable: true,
      ...(width && { width }),
      cell: (row) => (
        <WordWrapCell>
          {formatter ? formatter(row[selector], row) : row[selector]}
        </WordWrapCell>
      ),
      // cell: (row) => <WordWrapCell>{formatter ? formatter(row[selector]) : row[selector]}</WordWrapCell>,
    }))
  ];

  // Event handlers
  const handleShowData = e => {
    e.preventDefault();
    setPage(1);
    fetchUnitDetails();
  };

  const handleClearData = () => {
    // Define default values
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const defaultFromDate = '2024-01-01';
    const defaultToDate = formatDateForInput(endOfMonth);

    // Clear state
    setUnitGroupSelect(null);
    setUnitNo('');
    setBuilderGroupSelect(null);
    setProjectGroupSelect(null);
    setFromDate(defaultFromDate);
    setToDate(defaultToDate);
    setPage(1);
    setArea('')
    setFloor('')
    setTower('')
    navigate('/project-unit-master', { state: {} });

    // Fetch data with cleared values
    fetchUnitDetails({
      fromDate: defaultFromDate,
      toDate: defaultToDate,
      page: 0,
      unitStatus: null,
      unitNo: '',
      builderId: null,
      projectId: null,
      sortField: 'createdDate',
      sortType: 'desc',
      area: '',
      floor: '',
      tower: ''
    });
  };

  const downloadFilterDataExcel = async () => {
    try {
      setIsPending(true);
      const response = await ApiClient.get(
        buildQueryParams({ page: 0, size: projectUnitData?.totalElements })
      );
      if (response.data.status !== 1) {
        setIsPending(false);
        toast.error(response.data.message);
        return;
      }

      const encryptedContent = response.data.data;
      decryptData(encryptedContent)
        .then((decrypted) => {
          const rows = decrypted?.content;
          if (!Array.isArray(rows) || !rows.length) {
            toast.info("No data to export.");
            setIsPending(false);
            return;
          }

          // ── Styles ─────────────────────────────────────────────────
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

          const META_STYLE = {
            font: { name: 'Calibri', sz: 10, italic: true, color: { rgb: '475569' } },
            alignment: { horizontal: 'left', vertical: 'center' },
            fill: { patternType: 'solid', fgColor: { rgb: 'F8FAFC' } },
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
          const isNumericColumn = (key) => {
            const sample = rows.slice(0, 5).map((r) => r[key]);
            const numericCount = sample.filter(
              (v) => v !== null && v !== '' && !isNaN(Number(v))
            ).length;
            return numericCount > sample.length / 2;
          };

          // Width tuned to longest value (capped at 50)
          const colWidth = (key) => {
            const headerLen = prettifyHeader(key).length;
            const maxValueLen = rows.reduce((max, row) => {
              const v = row[key];
              const len = v == null ? 0 : String(v).length;
              return Math.max(max, len);
            }, 0);
            return { wch: Math.min(Math.max(headerLen, maxValueLen) + 2, 50) };
          };

          // Build filter summary — reads individual filter states
          const filterSummary = [
            fromDate && toDate && `Period: ${fromDate} → ${toDate}`,
            fromDate && !toDate && `From: ${fromDate}`,
            !fromDate && toDate && `To: ${toDate}`,
            unitGroupSelect?.label && `Unit Status: ${unitGroupSelect.label}`,
            unitNo && `Unit No: ${unitNo}`,
            builderGroupSelect?.label && `Builder: ${builderGroupSelect.label}`,
            projectGroupSelect?.label && `Project: ${projectGroupSelect.label}`,
            area && `Area: ${area}`,
            tower && `Tower: ${tower}`,
            floor && `Floor: ${floor}`,
          ].filter(Boolean).join('  ·  ');

          // ── Build sheet ────────────────────────────────────────────
          const headers = Object.keys(rows[0]);
          const totalCols = headers.length;
          const lastColLetter = XLSX.utils.encode_col(totalCols - 1);

          const ws = {};
          ws['!ref'] = `A1:${lastColLetter}${3 + rows.length}`;

          // Row 1: Title
          ws['A1'] = {
            v: 'Project Unit Master',
            t: 's',
            s: TITLE_STYLE,
          };

          // Row 2: Meta
          const metaText =
            `Generated: ${new Date().toLocaleString('en-IN')}` +
            `   ·   Records: ${rows.length}` +
            (filterSummary ? `   ·   ${filterSummary}` : '');
          ws['A2'] = { v: metaText, t: 's', s: META_STYLE };

          // Row 3: Headers
          headers.forEach((key, ci) => {
            const addr = XLSX.utils.encode_cell({ c: ci, r: 2 });
            ws[addr] = { v: prettifyHeader(key), t: 's', s: HEADER_STYLE };
          });

          // Pre-compute numeric flag per column
          const numericFlags = headers.map(isNumericColumn);

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

          // Merges: title + meta span all columns
          ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
          ];

          // Column widths, row heights, freeze panes
          ws['!cols'] = headers.map(colWidth);
          ws['!rows'] = [
            { hpt: 28 }, // Title
            { hpt: 22 }, // Meta (taller — filter line can be long)
            { hpt: 24 }, // Header
          ];
          ws['!freeze'] = { xSplit: 0, ySplit: 3 };

          // Workbook + save
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Project Unit Master');
          XLSX.writeFile(wb, `projectUnitMaster_${generateTimestamp()}.xlsx`);
          setIsPending(false);
        })
        .catch((error) => {
          setProjectUnitData([]);
          setIsPending(false);
          toast.error("Decryption failed: " + error.message);
        });
    } catch (error) {
      setIsPending(false);
      toast.error(error.message);
    }
  };

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Master" breadcrumbItem="Project Unit Master" />
      {isPending && <ScreenLoader />}
      <Container fluid>
        <form onSubmit={handleShowData}>
          <Card>
            <CardBody>
              <Row className="g-3">
                <Col md="2">
                  <h6 className="font-size-11">From Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                  />
                </Col>
                <Col md="2">
                  <h6 className="font-size-11">To Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                  />
                </Col>
                <Col md="2">
                  <h6 className="font-size-11">Unit Status</h6>
                  <Select
                    isClearable
                    menuPortalTarget={document.body}
                    value={unitGroupSelect}
                    onChange={setUnitGroupSelect}
                    options={unitTypeGroup}
                  />
                </Col>
                <Col md="2">
                  <h6 className="font-size-11">Unit No.</h6>
                  <input
                    className="form-control"
                    placeholder="Unit No..."
                    value={unitNo}
                    onChange={e => setUnitNo(e.target.value)}
                  />
                </Col>
                <Col md="2">
                  <h6 className="font-size-11">Select Builder</h6>
                  <Select
                    menuPortalTarget={document.body}
                    isClearable
                    value={builderGroupSelect}
                    onChange={setBuilderGroupSelect}
                    options={builderList?.data?.data || []}
                  />
                </Col>
                <Col md="2">
                  <h6 className="font-size-11">Select Project</h6>
                  <Select
                    menuPortalTarget={document.body}
                    isClearable
                    isDisabled={!builderGroupSelect?.value}
                    value={projectGroupSelect}
                    onChange={setProjectGroupSelect}
                    options={projectData?.data?.data || []}
                  />
                </Col>
                <Col md="2">
                  <h6 className="font-size-11">Area</h6>
                  <input
                    className="form-control"
                    placeholder="Enter Exact Area..."
                    value={area}
                    onChange={e => setArea(e.target.value)}
                  />
                </Col>
                <Col md="2">
                  <h6 className="font-size-11">Tower</h6>
                  <input
                    className="form-control"
                    placeholder="Tower..."
                    value={tower}
                    onChange={e => setTower(e.target.value)}
                  />
                </Col>
                <Col md="2">
                  <h6 className="font-size-11">Floor</h6>
                  <input
                    className="form-control"
                    placeholder="Floor..."
                    value={floor}
                    onChange={e => setFloor(e.target.value)}
                  />
                </Col>
                <Col md="3" className="d-flex align-items-end">
                  <button type="submit" className="btn btn-primary">
                    Show Data
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={handleClearData}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>

        <div className="d-flex align-items-center mb-4" style={{ marginLeft: '10px', gap: '20px' }}>
          <i
            className="fas fa-plus"
            title='Add Unit'
            style={{ color: defaultTheme.primary, cursor: 'pointer', fontSize: '15px' }}
            onClick={() => handleManageProjectUnit({})}
          />
          <i
            title='Download Excel'
            className="fas fa-file-excel"
            style={{ color: defaultTheme.primary, cursor: 'pointer', fontSize: '15px' }}
            onClick={downloadFilterDataExcel}
          />
        </div>

        <AppTable
          progressPending={isPending}
          columns={columns}
          data={projectUnitData?.content}
          pagination
          paginationTotalRows={projectUnitData?.totalElements}
          paginationServer
          onChangePage={newPage => {
            setPage(newPage);
            setShouldFetch(true);
          }}
        />
      </Container>
    </PageContent>
  );
};

export default ProjectUnitMaster;