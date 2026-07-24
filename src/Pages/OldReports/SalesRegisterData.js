import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import { formatDateForInput } from "../../helpers/function_helper";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import {
  EXCEL_SALE_DATA_REPORTS,
  SHOW_SALE_DATA_REPORTS,
} from "../../helpers/url_helper";

export default function SaleRegisterData() {
  const initialFormState = {
    fromDate: "",
    toDate: "",
    apiUrl: null,
  };
  const [formState, setFormState] = useState(initialFormState);


  function handleInputChange(event) {
    const { id, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  }

  useEffect(() => {
    getFromToDate();
  }, []);

  const getFromToDate = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setFormState((prevState) => ({
      ...prevState,
      fromDate: formatDateForInput(startOfMonth),
      toDate: formatDateForInput(endOfMonth),
      apiUrl: `${SHOW_SALE_DATA_REPORTS}${formatDateForInput(
        startOfMonth
      )}&toDate=${formatDateForInput(endOfMonth)}`,
    }));
  };

  const downloadSaleDataExcel = () => {
    ApiClient.get(
      `${EXCEL_SALE_DATA_REPORTS}${formState.fromDate}&toDate=${formState.toDate}`,
      { responseType: "arraybuffer" }
    )
      .then(function (response) {
         // Check if the response is an Excel file
         const contentType = response.headers["content-type"];

         if (
           contentType !==
           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
         ) {
           // Assuming the response is an error response
           const errorResponse = new TextDecoder("utf-8").decode(
             new Uint8Array(response.data)
           );
           const parsedError = JSON.parse(errorResponse);
 
           // Check if it has the expected structure
           if (parsedError.status === 0) {
             toast.error(parsedError.message || "Something went wrong!");
           } else {
             toast.error("Unexpected error occurred!");
           }
           return;
         }
 
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "sale_data.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(function (error) {
        toast.error(error.message);
      });
  };

  
  return (
    <PageContent>
      <Breadcrumbs title="Reports" breadcrumbItem="Sales Register Data" />
      {/* {isLoading && <ScreenLoader />} */}
      <Container fluid={true}>
        <Card>
          <CardBody>
            <Row>
              <Col lg="5">
                <h6 className="font-size-11">From Date</h6>
                <input
                  className="form-control"
                  id="fromDate"
                  type="date"
                  placeholder="From Date"
                  value={formState.fromDate}
                  onChange={handleInputChange}
                />
              </Col>
              <Col lg="5">
                <h6 className="font-size-11">To Date</h6>
                <input
                  className="form-control"
                  id="toDate"
                  type="date"
                  placeholder="To Date"
                  value={formState.toDate}
                  onChange={handleInputChange}
                />
              </Col>

              {/* <Col
                lg="3"
                className="d-flex justify-content-center align-items-center mt-3"
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleShowData}
                >
                  Show Data
                </button>

                <button
                  type="button"
                  className="btn btn-primary ms-3"
                  color="secondary"
                  onClick={handleClearData}
                >
                  Clear
                </button>
              </Col> */}

              <Col lg="2" className="mt-4">
                <i
                  className="fas fa-file-excel mt-1"
                  style={{
                    color: defaultTheme.primary,
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                  onClick={() => downloadSaleDataExcel()}
                ></i>
              </Col>
            </Row>
          </CardBody>
        </Card>
        {/* 
        <AppTable
          columns={columns}
          data={
            Array.isArray(reportsDetails?.data?.data)
              ? reportsDetails?.data?.data
              : []
          }
          pagination
          progressPending={isLoading}
        /> */}
      </Container>
    </PageContent>
  );
}

// import React from "react";
// import AppTable from "../../components/Common/Table";
// import { defaultTheme } from "../../helpers/defaultTheme";

// const SaleRegisterData = () => {
//   // Define columns for the table
//   const columns = [
//     {
//       name: "Main Team",
//       selector: (row) => row.mainTeam,
//       sortable: true,
//     },
//     {
//       name: "Sub Team",
//       selector: (row) => row.subTeam,
//       sortable: true,
//     },
//     {
//       name: "Name",
//       selector: (row) => row.name,
//     },
//     {
//       name: "Currents Meeting",
//       selector: (row) => row.currentsMeeting,
//       // right: true, // Align to the right
//       // center:true
//     },
//     {
//       name: "Percentage (%)",
//       selector: (row) => row.percentage,
//       // right: true, // Align to the right
//     },
//   ];

//   // Define rows for the table
//   const data = [
//     { mainTeam: "AB", subTeam: "AB", name: "Abhishek Mehta", currentsMeeting: 0, percentage: 0 },
//     { mainTeam: "AB", subTeam: "AB", name: "Ashish Bhatia", currentsMeeting: 0, percentage: 0 },
//     { mainTeam: "AK", subTeam: "AK", name: "Anil Kumar", currentsMeeting: 0, percentage: 0 },
//     { mainTeam: "AK", subTeam: "AK", name: "Ankit Rawat", currentsMeeting: 0, percentage: 0 },
//     { mainTeam: "AKS", subTeam: "AKS", name: "Anish Kumar Singh", currentsMeeting: 0, percentage: 0 },
//     {
//       mainTeam: "",
//       subTeam: "Sub Total",
//       name: "",
//       currentsMeeting: 4,
//       percentage: 0,
//     },
//     { mainTeam: "AB", subTeam: "AB", name: "Abhishek Mehta", currentsMeeting: 0, percentage: 0 },
//     { mainTeam: "AB", subTeam: "AB", name: "Ashish Bhatia", currentsMeeting: 0, percentage: 0 },
//     { mainTeam: "AK", subTeam: "AK", name: "Anil Kumar", currentsMeeting: 0, percentage: 0 },
//     { mainTeam: "AK", subTeam: "AK", name: "Ankit Rawat", currentsMeeting: 0, percentage: 0 },
//     { mainTeam: "AKS", subTeam: "AKS", name: "Anish Kumar Singh", currentsMeeting: 0, percentage: 0 },
//     {
//       mainTeam: "",
//       subTeam: "Sub Total",
//       name: "",
//       currentsMeeting: 4,
//       percentage: 0,
//     },
//   ];

//   return (
//     <div style={{ padding: "20px" , marginTop:100 }}>
//       <AppTable
//        columns={columns}
//        data={data}
//       conditionalRowStyles={[
//         {
//           when: (row) => row.subTeam === "Sub Total",
//               style: {
//                 fontWeight: "bold",
//                 fontSize: "14px",
//                 color:defaultTheme.primary,
//                 backgroundColor: defaultTheme.goldColorLogo,
//               },
//             }
//           ]}
//       />
//     </div>
//   );
// };

// export default SaleRegisterData;
