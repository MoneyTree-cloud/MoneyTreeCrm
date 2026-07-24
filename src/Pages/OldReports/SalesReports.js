import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import { formatDateForInput } from "../../helpers/function_helper";
import {
  EXCEL_SALE_REPORTS,
  SHOW_SALE_REPORTS,
} from "../../helpers/url_helper";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { useGet } from "../../Hooks/useApi";

export default function SalesReports() {
  const INITIALSTATE = {
    fromDate: "",
    toDate: "",
    apiUrl: null,
    searchData: "",
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
      apiUrl: `${SHOW_SALE_REPORTS}${formatDateForInput(
        now
      )}&toDate=${formatDateForInput(now)}`,
    }));
  };

  const { data: reportsDetails, isLoading } = useGet(formState.apiUrl, {
    enabled: Boolean(formState.apiUrl),
  });

  const downloadDataExcel = () => {
    ApiClient.get(
      `${EXCEL_SALE_REPORTS}${formState.fromDate}&toDate=${formState.toDate}&searchData=${formState.searchData}`,
      { responseType: "arraybuffer" }
    )
      .then(function (response) {
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
        link.download = "sale_report_data.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(function (error) {
        toast.error(error.message);
      });
  };

  function handleInputChange(event) {
    const { id, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  }

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (row, index) => index + 1,
      sortable: true,
      width: "1%",
    },
    {
      name: <span className="font-weight-bold fs-13">Unique ID</span>,
      selector: (row) => row.sale_id,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.sale_id}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Main Team</span>,
      selector: (row) => row.main_team,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.main_team}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Sub Team</span>,
      selector: (row) => row.sub_team,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.sub_team}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Code</span>,
      selector: (row) => row.associate_id,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.associate_id}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Name</span>,
      selector: (row) => row.associate_name,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.associate_name}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Prospect ID</span>,
      selector: (row) => row.prospect_id,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.prospect_id}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Date of Booking</span>,
      selector: (row) => row.booking_date,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.booking_date}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Month</span>,
      selector: (row) => row.Booking_month,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.Booking_month}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Year</span>,
      selector: (row) => row.Booking_year,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.Booking_year}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Status</span>, //
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.status}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">PLC/No PLC Case</span>, //
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.status}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Sharing Yes/No</span>, //
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.employeeCode}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Count</span>, //
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.employeeCode}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Prop Type</span>,
      selector: (row) => row.prop_type_id,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.prop_type_id}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Status : Form Stage</span>, //
      selector: (row) => row.form_stage_name,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.form_stage_name}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Location</span>,
      selector: (row) => row.asso_location,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.asso_location}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name</span>,
      selector: (row) => row.builder_name,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.builder_name}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      selector: (row) => row.project_name,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.project_name}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.client_name,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.client_name}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Address</span>,
      selector: (row) => row.address,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.address}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">State/City</span>,
      selector: (row) => row.State_City,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.State_City}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Email ID</span>, //
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.employeeCode}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">DOB</span>,
      selector: (row) => row.client_dob,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.client_dob}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">PAN</span>,
      selector: (row) => row.client_pan,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.client_pan}
        </div>
      ),
    },
    {
      //
      name: (
        <span className="font-weight-bold fs-13">Booking done outside</span>
      ),
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.employeeCode}
        </div>
      ),
    },

    {
      //
      name: (
        <span className="font-weight-bold fs-13">
          Plan Chosen by Customer (Flexi/CLP/DP)
        </span>
      ),
      selector: (row) => row.mainTeam,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.employeeCode}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Floor</span>,
      selector: (row) => row.floor,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.floor}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Tower / Block</span>,
      selector: (row) => row.tower_block,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.tower_block}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Unit No</span>,
      selector: (row) => row.unit_no,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.unit_no}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Area</span>,
      selector: (row) => row.area,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.area}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Scheme/Incentive</span>,
      selector: (row) => row.incentive,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.incentive}
        </div>
      ),
    },
    {
      name: (
        <span className="font-weight-bold fs-13">BuilderIncentive Status</span>
      ),
      selector: (row) => row.Builder_Incintive_status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.Builder_Incintive_status}
        </div>
      ),
    },
    {
      //
      name: (
        <span className="font-weight-bold fs-13">Scheme/Incentive Amount</span>
      ),
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.employeeCode}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Loan/Self Funding</span>,
      selector: (row) => row.loan_self_funding_id,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.loan_self_funding_id}
        </div>
      ),
    },
    {
      //
      name: (
        <span className="font-weight-bold fs-13">
          BSP (As per rate List) (Rs/Sqft)
        </span>
      ),
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.employeeCode}
        </div>
      ),
    },
    {
      //
      name: (
        <span className="font-weight-bold fs-13">
          Less: Inaugral Discount(Rs/Sqft)
        </span>
      ),
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.employeeCode}
        </div>
      ),
    },
    {
      name: (
        <span className="font-weight-bold fs-13">
          Less: Discount on Form (Rs/Sqft)
        </span>
      ),
      selector: (row) => row.less_onformdisc,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.less_onformdisc}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Less: NPV (Rs/Sqft)</span>, //
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.employeeCode}
        </div>
      ),
    },
    {
      name: (
        <span className="font-weight-bold fs-13">
          Total Discount Amount Per SqFt
        </span>
      ),
      selector: (row) => row.total_disc_Amount_Per_sqft,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.total_disc_Amount_Per_sqft}
        </div>
      ),
    },
    {
      name: (
        <span className="font-weight-bold fs-13">
          Effective BSP to Customer (Rate)
        </span>
      ),
      selector: (row) => row.Effective_BSP_Cust_Rate,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.Effective_BSP_Cust_Rate}
        </div>
      ),
    },
    {
      //
      name: (
        <span className="font-weight-bold fs-13">
          Effective BSP to Customer X Area (Amount)
        </span>
      ),
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.employeeCode}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Floor PLC</span>,
      selector: (row) => row.floor_plc,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.floor_plc}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Facing PLC</span>,
      selector: (row) => row.facing_plc,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.facing_plc}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Other View PLC</span>,
      selector: (row) => row.other_view_plc,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.other_view_plc}
        </div>
      ),
    },
    {
      name: (
        <span className="font-weight-bold fs-13">
          Net PLC Amount for all PLC
        </span>
      ),
      selector: (row) => row.Net_PLC_Amount_all_PLC,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.Net_PLC_Amount_all_PLC}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Car Parking</span>,
      selector: (row) => row.car_parking,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.car_parking}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Club Membership</span>,
      selector: (row) => row.club_membership,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.club_membership}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Power Backup</span>,
      selector: (row) => row.power_backup_charges,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.power_backup_charges}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">IFMS After discount</span>,
      selector: (row) => row.ifms_after_discount,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.ifms_after_discount}
        </div>
      ),
    },
    {
      name: (
        <span className="font-weight-bold fs-13">
          Lease/Rent after discount (Rs)
        </span>
      ),
      selector: (row) => row.lease_rent_after_discount,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.lease_rent_after_discount}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">ESSC per(Rs)</span>,
      selector: (row) => row.essc_per,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.essc_per}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">CRF per(Rs)</span>,
      selector: (row) => row.crf_per,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.crf_per}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">EDC/IDC</span>,
      selector: (row) => row.edc_idc,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.edc_idc}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">EEC/FFC</span>,
      selector: (row) => row.eec_ffc,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.eec_ffc}
        </div>
      ),
    },
    {
      name: (
        <span className="font-weight-bold fs-13">
          Terrage / Garden /Lawn(Rs)
        </span>
      ),
      selector: (row) => row.terrage_garden,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.terrage_garden}
        </div>
      ),
    },
    {
      name: (
        <span className="font-weight-bold fs-13">
          Development/ Sinking fund
        </span>
      ),
      selector: (row) => row.sinking_fund,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.sinking_fund}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Facilities</span>,
      selector: (row) => row.facilities,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.facilities}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Maintenance</span>,
      selector: (row) => row.maintenance,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.maintenance}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Meter</span>,
      selector: (row) => row.meter,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.meter}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Security</span>,
      selector: (row) => row.security,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.security}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Other Charges</span>,
      selector: (row) => row.other_charges,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.other_charges}
        </div>
      ),
    },
    {
      name: (
        <span className="font-weight-bold fs-13">
          Total value of All Other Charges (Rs)
        </span>
      ),
      selector: (row) => row.total_other_charge,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.total_other_charge}
        </div>
      ),
    },
    {
      //
      name: (
        <span className="font-weight-bold fs-13">
          Net Cost to Customer-After deducting All Discounts
        </span>
      ),
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.employeeCode}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Possession Charge</span>,
      selector: (row) => row.Possession_Charge,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.Possession_Charge}
        </div>
      ),
    },
    {
      name: (
        <span className="font-weight-bold fs-13">
          Net Cost after Possession Charges
        </span>
      ),
      selector: (row) => row.Net_Cost_after_Possession_Charges,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.Net_Cost_after_Possession_Charges}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">GST %</span>,
      selector: (row) => row.gst_percent,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.gst_percent}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">GST Amount</span>,
      selector: (row) => row.total_gst_amount,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.total_gst_amount}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Total Cost with GST</span>,
      selector: (row) => row.total_cost_to_client,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.total_cost_to_client}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Cheque Received</span>, //
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.status}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Cheque Clearence</span>, //
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.status}
        </div>
      ),
    },
    {
      //
      name: (
        <span className="font-weight-bold fs-13">
          Total Payment Receive From Customer/Client
        </span>
      ),
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.employeeCode}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Total Revenue</span>, //
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.employeeCode}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Over Above</span>, //
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.employeeCode}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Net Revenue</span>, //
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.employeeCode}
        </div>
      ),
    },
  ];

  const handleShowData = () => {
    setFormState((prevState) => ({
      ...prevState,
      apiUrl: `${SHOW_SALE_REPORTS}${formState.fromDate}&toDate=${formState.toDate}&searchData=${formState.searchData}`,
    }));
  };

  const handleClearData = () => {
    getFromToDate();
    setFormState((prevState) => ({
      ...prevState,
      searchData: "",
    }));
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Breadcrumbs title="Reports" breadcrumbItem="Sales Reports" />
        <Container fluid={true}>
          <Card>
            <CardBody>
              <Row>
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
                <Col lg="3">
                  <h6 className="font-size-11">Search Field</h6>
                  <input
                    className="form-control"
                    id="searchData"
                    type="text"
                    value={formState.searchData}
                    onChange={handleInputChange}
                    placeholder="Search..."
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
                    onClick={handleClearData}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <i
            className="fas fa-file-excel mb-3"
            style={{
              color: defaultTheme.primary,
              cursor: "pointer",
              fontSize: "16px",
            }}
            onClick={() => downloadDataExcel()}
          ></i>
          {Array.isArray(reportsDetails?.data?.data) &&
            reportsDetails?.data?.data?.length > 0 && (
              <AppTable
                progressPending={isLoading}
                columns={columns}
                data={
                  Array.isArray(reportsDetails?.data?.data)
                    ? reportsDetails?.data?.data
                    : []
                }
                pagination
              />
            )}
        </Container>
      </div>
    </React.Fragment>
  );
}
