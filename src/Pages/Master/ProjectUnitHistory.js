import { useGet } from "../../Hooks/useApi";
import { GET_PROJECT_UNIT_HISTORY } from "../../helpers/url_helper";
import { useLocation, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import ScreenLoader from "../../constants/ScreenLoader";
import { Button, Container } from "reactstrap";
import AppTable from "../../components/Common/Table";
import { formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";

export default function ProjectUnitHistory() {
  const location = useLocation();
  const navigation = useNavigate();
  const { row: rowData, unitNo, fromDate, toDate, page, unitGroupSelect, builder, project, area, floor, tower } = location?.state || {};

  const { data: projectUnitHistoryList, isLoading } = useGet(
    GET_PROJECT_UNIT_HISTORY + rowData?.projectUnitId,
    { enabled: Boolean(rowData?.projectUnitId) }
  );

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Modify By</span>,
      selector: (row) => row?.modifiedBy,
      sortable: true,
      cell: (row) => <WordWrapCell>{row?.modifiedBy}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Modified Date</span>,
      selector: (row) => row.modifiedDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.modifiedDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Unit No.</span>,
      selector: (row) => row.unitNo,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.unitNo}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Unit Status</span>,
      selector: (row) => row.unitStatus,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.unitStatus}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.clientName,
      sortable: true,
      width: "10%",
      cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Unit Mapped Areas</span>,
      selector: (row) => row.remarks,
      sortable: true,
      width: "18%",
      cell: (row) => <WordWrapCell>{row.remarks}</WordWrapCell>
    },
  ];

  const handleCancel = () => {
    navigation("/project-unit-master", {
      state: {
        unitNo: unitNo,
        fromDate: fromDate,
        toDate: toDate,
        page: page,
        unitGroupSelect: unitGroupSelect,
        builder: builder,
        project: project,
        area: area,
        tower: tower,
        floor: floor
      },
    });
  };

  return (
    <PageContent>
      <Breadcrumbs title="Project Unit" breadcrumbItem="History" />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          color="secondary"
          type="button"
          style={{
            backgroundColor: defaultTheme.primary,
            marginBottom: "10px",
          }}
          onClick={handleCancel}
        >
          Back
        </Button>
      </div>
      {isLoading && <ScreenLoader />}
      <Container fluid={true}></Container>
      <AppTable
        progressPending={isLoading}
        columns={columns}
        data={
          Array.isArray(projectUnitHistoryList?.data?.data)
            ? projectUnitHistoryList?.data?.data
            : []
        }
        pagination
        paginationServer

      />
    </PageContent>
  );
}
