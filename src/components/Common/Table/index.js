import DataTable from "react-data-table-component";
import { Card, CardBody } from "reactstrap";
import { defaultTheme } from "../../../helpers/defaultTheme";
import "../../../Pages/CSS/styles.css";

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