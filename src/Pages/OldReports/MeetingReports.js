import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import { formatDateForInput } from "../../helpers/function_helper";
import { SHOW_MEETING_REPORT } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import Select from "react-select";
import ScreenLoader from "../../constants/ScreenLoader";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import * as XLSX from "xlsx";


const MeetingReports = () => {
  const INITIALSTATE = {
    fromDate: "",
    toDate: "",
    apiUrl: null,
    reportType: null,
  };

  const [formState, setFormState] = useState(INITIALSTATE);

  useEffect(() => {
    getFromToDate();
  }, []);

  const getFromToDate = () => {
    const now = new Date();
    setFormState((prevState) => ({
      ...prevState,
      fromDate: formatDateForInput(now),
      toDate: formatDateForInput(now),
    }));
  };

  const { data: reportsDetails, isLoading } = useGet(formState.apiUrl, {
    enabled: Boolean(formState.apiUrl),
  });

  const reportsTypeGroup = [
    { label: "Main Team Wise", value: 62 },
    { label: "Sub Team DSF Wise", value: 63 },
    { label: "Old Monk 2.0", value: 64 },
    { label: "Location Wise", value: 65 },
  ];

  function handleSelectChange(selectedOption, actionMeta) {
    setFormState((prevState) => ({
      ...prevState,
      [actionMeta.name]: selectedOption,
    }));
  }

  function handleInputChange(event) {
    const { id, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  }

  const handleShowData = () => {
    if (!formState?.reportType) {
      toast.error("Please Select Report Type");
      return;
    }
    setFormState((prevState) => ({
      ...prevState,
      apiUrl: `${SHOW_MEETING_REPORT}${formState.fromDate}&toDate=${formState.toDate}&inputType=${formState?.reportType?.value}`,
    }));
  };

  const handleClearData = () => {
    setFormState(INITIALSTATE);
    getFromToDate();
  };

  // Group data by main_team only
  const groupBy = (data, mainKey) => {
    return data?.reduce((result, currentValue) => {
      const mainGroup = currentValue[mainKey];

      if (!result[mainGroup]) {
        result[mainGroup] = [];
      }

      result[mainGroup].push(currentValue);

      return result;
    }, {});
  };

  // Flatten grouped data and handle subtotal row for each main_team
  const flattenGroupedData = (groupedData) => {
    let flatData = [];

    // Loop over each main team
    Object.keys(groupedData).forEach((mainTeam) => {
      const teamMembers = groupedData[mainTeam];
      let totalRunningTotal = 0;
      let totalStrength = 0;

      // Add employee rows for each team
      teamMembers.forEach((employee, index) => {
        totalRunningTotal += employee.Runningtotal;
        totalStrength += employee.strength;

        flatData.push({
          id: `${mainTeam}-${employee.s_team}-${employee.name}`, // Unique id for each employee
          mainTeam,
          s_team: employee.s_team,
          name: employee.name,
          Runningtotal: employee.Runningtotal,
          strength: employee.strength,
          isSubtotalRow: false, // This is not a subtotal row
        });
      });

      // Add the main team subtotal row (no employee data, just the totals)
      flatData.push({
        id: `${mainTeam}-subtotal`, // Add a unique id for subtotal row
        mainTeam: mainTeam,
        s_team: "Subtotal",
        name: `${totalStrength}`, // Show total employee count in Name column
        Runningtotal: totalRunningTotal,
        strength: totalStrength,
        isSubtotalRow: true, // This is a subtotal row
      });
    });

    return flatData;
  };

  // Sample data (from API)
  const sampleData = reportsDetails?.data?.data || [];

  // Group by main_team
  const groupedData = groupBy(sampleData, "main_team");

  // Flatten the grouped data
  const flattenedData = flattenGroupedData(groupedData);

  const columns62 = [
    {
      name: "Team",
      selector: (row) => formState?.reportType?.value===62?row.main_team:row.s_team,
      sortable: true,
    },
    {
      name: "Strength",
      selector: (row) => row.strength,
      sortable: true,
    },
    {
      name: "Currents Meeting",
      selector: (row) => row.Runningtotal,
      sortable: true,
    }
  ];
  const columns64 = [
    {
      name: "Main Team",
      selector: (row) => row.mainTeam,
      sortable: true,
    },
    {
      name: "Sub Team",
      selector: (row) => row.s_team,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Running Total",
      selector: (row) => row.Runningtotal,
      sortable: true,
    },
    {
      name: "Strength",
      selector: (row) => row.strength,
      sortable: true,
    },
  ];


  // const downloadFilterDataExcel = () => {
  //         const data = flattenedData;
  //         // Ensure the data is not empty
  //         if (!Array.isArray(data) || data.length === 0) return;

  //         // 1. Extract the keys from the first object as the headers
  //         const headers = Object.keys(data[0]);

  //         // 2. Convert the data into a format compatible with the Excel file
  //         const formattedData = data.map((item) => {
  //           return headers.map((header) => item[header]);
  //         });

  //         // 3. Add the headers as the first row in the data
  //         const finalData = [headers, ...formattedData];

  //         // 4. Create a worksheet from the final data
  //         const ws = XLSX.utils.aoa_to_sheet(finalData);

  //         // 5. Create a workbook and append the worksheet
  //         const wb = XLSX.utils.book_new();
  //         XLSX.utils.book_append_sheet(wb, ws, "Receive Pay Details");

  //         // 6. Write the file and trigger download
  //         XLSX.writeFile(wb, "receivePayFilterData.xlsx");
  //         return;
  // };


  const downloadFilterDataExcel = () => {
    const data = flattenedData;
    // Ensure the data is not empty
    if (!Array.isArray(data) || data.length === 0) return;
  
    // Step 1: Group the data by main_team (just like you do in the UI)
    const groupedData = groupBy(data, "mainTeam");
  
    // Step 2: Prepare the headers for the Excel file
    const headers = ['Main Team', 'Sub Team', 'Name', 'Running Total', 'Strength'];
  
    // Step 3: Flatten the grouped data, preserving groups and subtotal rows
    const formattedData = [];
    let rowIndex = 0; // This will keep track of the row index for merging cells
  
    Object.keys(groupedData).forEach((mainTeam) => {
      const teamMembers = groupedData[mainTeam];
      let totalRunningTotal = 0;
      let totalStrength = 0;
  
      // Add the rows for each employee in the main team
      teamMembers.forEach((employee, index) => {
        totalRunningTotal += employee.Runningtotal;
        totalStrength += employee.strength;
  
        // For the first employee in the group, add the Main Team value
        if (index === 0) {
          formattedData.push([
            mainTeam,           // Main Team (only for the first row)
            employee.s_team,    // Sub Team
            employee.name,      // Name
            employee.Runningtotal, // Running Total
            employee.strength,  // Strength
          ]);
        } else {
          // For subsequent employees, leave the Main Team cell empty
          formattedData.push([
            '',                 // Main Team (empty for the rest of the group)
            employee.s_team,    // Sub Team
            employee.name,      // Name
            employee.Runningtotal, // Running Total
            employee.strength,  // Strength
          ]);
        }
      });
  
      // Add the subtotal row for the main team
      formattedData.push([
        mainTeam,             // Main Team (name of the group)
        'Subtotal',           // Sub Team (mark as 'Subtotal')
        `${totalStrength}`,   // Name (total strength)
        totalRunningTotal,    // Running Total (sum of all employees' Running Total)
        totalStrength,        // Strength (sum of all employees' Strength)
      ]);
    });
  
    // Step 4: Add headers to the data
    const finalData = [headers, ...formattedData];
  
    // Step 5: Create a worksheet from the final data
    const ws = XLSX.utils.aoa_to_sheet(finalData);
  
    // Step 6: Apply cell merging for the 'Main Team' column
    let rowStartIndex = 1; // Start after the header row
    Object.keys(groupedData).forEach((mainTeam) => {
      const teamMembers = groupedData[mainTeam];
      // Merge cells for the Main Team column for each group
      ws["!merges"] = ws["!merges"] || [];
      const lastRowIndex = rowStartIndex + teamMembers.length; // Last row index for the group
      ws["!merges"].push({
        s: { r: rowStartIndex, c: 0 }, // Start row and column (Main Team column)
        e: { r: lastRowIndex, c: 0 }, // End row (same column)
      });
  
      // Update rowStartIndex for the next group
      rowStartIndex = lastRowIndex + 1;
    });
  
    // Step 7: Add styling (optional)
    ws['A1'].s = { font: { bold: true }, alignment: { horizontal: "center" } }; // Main Team header
    ws['B1'].s = { font: { bold: true }, alignment: { horizontal: "center" } }; // Sub Team header
    ws['C1'].s = { font: { bold: true }, alignment: { horizontal: "center" } }; // Name header
    ws['D1'].s = { font: { bold: true }, alignment: { horizontal: "center" } }; // Running Total header
    ws['E1'].s = { font: { bold: true }, alignment: { horizontal: "center" } }; // Strength header
  
    // Step 8: Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Grouped Meeting Report");
  
    // Step 9: Trigger the file download
    XLSX.writeFile(wb, "grouped_meeting_report_with_pivot_style.xlsx");
  };
  
  
  

  return (
    <PageContent>
        {isLoading && <ScreenLoader />}
        <Breadcrumbs title="Reports" breadcrumbItem="Meeting Reports" />
        <Container fluid={true}>
          <Card>
            <CardBody>
              <Row>
                <Col lg="3">
                  <h6 className="font-size-11">Report Type</h6>
                   <Select
                style={{ zIndex: 9999 }}  
                menuPortalTarget={document.body}
                    name="reportType"
                    value={formState.reportType}
                    onChange={handleSelectChange}
                    options={reportsTypeGroup}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">From Date</h6>
                  <input
                    className="form-control"
                    id="fromDate"
                    type="date"
                    value={formState.fromDate}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">To Date</h6>
                  <input
                    className="form-control"
                    id="toDate"
                    type="date"
                    value={formState.toDate}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col
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
                    onClick={downloadFilterDataExcel}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {(formState?.reportType?.value === 62 || formState?.reportType?.value === 63) && (
            <AppTable
              progressPending={isLoading}
              columns={columns62}
              data={
                Array.isArray(reportsDetails?.data?.data)
                  ? reportsDetails?.data?.data
                  : []
              }
              pagination
            />
          )}

          {formState?.reportType?.value === 64 && (
            <AppTable
              progressPending={isLoading}
              columns={columns64}
              data={flattenedData}
              pagination
              paginationPerPage={500}
              conditionalRowStyles={[
                {
                  when: (row) => row.isSubtotalRow,
                  style: {
                    fontSize: "16px",
                    fontWeight: "bold",
                    backgroundColor: "#f0f8ff",
                    color: "#000",
                  },
                },
              ]}
            />
          )}
        </Container>
    </PageContent>
  );
};

export default MeetingReports;
