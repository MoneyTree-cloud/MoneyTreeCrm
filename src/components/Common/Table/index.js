import DataTable from "react-data-table-component";
import { Card, CardBody } from "reactstrap";
import { defaultTheme } from "../../../helpers/defaultTheme";
import "../../../Pages/CSS/styles.css";

// Friendly "nothing here yet" panel — the default `noDataComponent` of AppTable,
// so every table in the app shows the same empty state.
const EmptyState = ({
  title = "No records found",
  message = "There's nothing to show here right now.",
  icon = "ri-inbox-2-line",
}) => (
  <div className="mt-empty" role="status">
    <div className="mt-empty__panel">
      <div className="mt-empty__art" aria-hidden="true">
        <span className="mt-empty__halo" />
        <span className="mt-empty__orbit">
          <span className="mt-empty__orbit-dot" />
        </span>
        <span className="mt-empty__spark s1" />
        <span className="mt-empty__spark s2" />
        <div className="mt-empty__sheet">
          <span className="mt-empty__sheet-row is-head" />
          <span className="mt-empty__sheet-row" />
          <span className="mt-empty__sheet-row is-short" />
        </div>
        <span className="mt-empty__badge">
          <i className={icon} />
        </span>
      </div>

      <div className="mt-empty__text">
        <div className="mt-empty__title">{title}</div>
        <div className="mt-empty__msg">{message}</div>
      </div>
    </div>
  </div>
);

const customStyles = {
  rows: {
    style: {
      minHeight: "50px",
    },
  },
  headCells: {
    style: {
      backgroundColor: defaultTheme.primary,
      color: "#fff",
      borderBottom: "2px solid #ddd",
      padding: "4px 8px",
      margin: 0,
    },
  },
  cells: {
    style: {
      borderBottom: "1px solid #ddd",
      padding: "4px 8px",
      margin: 0,
      whiteSpace: "nowrap",
    },
  },
};

const AppTable = (props) => {
  return (
    <Card>
      <CardBody>
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "4px",
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          <div className="datatable-container">
            <DataTable
              noDataComponent={<EmptyState />}
              {...props}
              customStyles={customStyles}
              paginationPerPage={props.paginationPerPage || 100}
              fixedHeader
              fixedHeaderScrollHeight="400px"
              responsive
              paginationComponentOptions={{ noRowsPerPage: true }}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default AppTable;