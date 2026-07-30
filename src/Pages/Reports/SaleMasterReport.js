import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDate, formatDateForInput, generateTimestamp, getBookingMonthName, getBookingYear, roundToTwoDecimals, WordWrapCell } from "../../helpers/function_helper";
import { SALE_MASTER_REPORT, SALE_MASTER_REPORT_VIEW } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css";
import { toast } from "react-toastify";
import ApiClient from "../../helpers/api_helper";
import Select from "react-select";
import PageContent from "../../components/Common/PageContent";
import { defaultTheme } from "../../helpers/defaultTheme";
import PermissionMissing from "../Utility/PermissonMissing";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function SaleMasterReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [searchData, setSearchData] = useState("");
  const [saleMasterData, setSaleMasterData] = useState([]);
  const [searchByGroupSelect, setselectedSearchGroupSelect] = useState(null);
  const [accessGranted, setAccessGranted] = useState(null);
  const { userId, empCode } = useUserStore((state) => state.user);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'report-sale-master');
      setAccessGranted(hasAccess);
      if (hasAccess) {
        setTodayDate();
      }
    };
    checkAccess();
  }, [userId]);

  const sortByTypeGroup = [
    { label: "Unique ID", value: "saleId" },
    { label: "Client Name", value: "clientName" },
    { label: "Project Name", value: "projectName" },
    { label: "Associate Name", value: "associateName" },
  ];

  function handleSearchByTypeSelectGroup(selectedGroup) {
    setselectedSearchGroupSelect(selectedGroup);
  }

  const setTodayDate = () => {
    const today = new Date(); // Get today's date
    setFromDate(formatDateForInput(today));
    setToDate(formatDateForInput(today));
  };

  const downloadSaleMasterExcel = () => {
    setIsPending(true);
    ApiClient.get(`${SALE_MASTER_REPORT}${fromDate}&toDate=${toDate}`, {
      responseType: "arraybuffer",
    })
      .then(function (response) {
        setIsPending(false);
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

        // Proceed to download the Excel file
        const blob = new Blob([response.data], {
          type: contentType,
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `sale_master_${generateTimestamp()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message || "An unexpected error occurred.");
      });
  };

  const handleShowData = (e) => {
    e.preventDefault();
    if (searchByGroupSelect && !searchData) {
      toast.error("Please Enter Search Field");
      return;
    } else if (searchData && !searchByGroupSelect) {
      toast.error("Please Select Search By Value");
      return;
    }
    setIsPending(true);
    let url = `${SALE_MASTER_REPORT_VIEW}${fromDate}&toDate=${toDate}`;

    if (searchData && searchByGroupSelect) {
      url += `&filterType=${searchByGroupSelect?.value}&value=${searchData}`;
    }

    ApiClient.get(url)
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          const encryptedContent = response.data.data;
          decryptData(encryptedContent).then((decrypted) => {
            setSaleMasterData(decrypted);
          }).catch((error) => {
            setSaleMasterData([]);
          });

        } else {
          setSaleMasterData([]);
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setSaleMasterData([]);
        setIsPending(false);
        toast.error(error.message);
      });
  };

  const handleClearData = () => {
    setTodayDate();
    setSearchData("");
    setSaleMasterData([]);
    setselectedSearchGroupSelect(null);
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "2%",
    },
    {
      name: <span className="font-weight-bold fs-13">Unique ID</span>,
      selector: (row) => row.Unique_ID,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Unique_ID}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Main Team</span>,
      selector: (row) => row.Main_Team,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Main_Team}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Sub Team</span>,
      selector: (row) => row.Sub_Team,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Sub_Team}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      selector: (row) => row.AssociateName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.AssociateName + " (" + row.AssociateCode + ")"}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Booking Date</span>,
      selector: (row) => row.DateOfBooking,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDate(row.DateOfBooking)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Booking Month</span>,
      selector: (row) => getBookingMonthName(row.DateOfBooking),
      sortable: true,
      cell: (row) => <WordWrapCell>{getBookingMonthName(row.DateOfBooking)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Booking Year</span>,
      selector: (row) => getBookingYear(row.DateOfBooking),
      sortable: true,
      cell: (row) => <WordWrapCell> {getBookingYear(row.DateOfBooking)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Location</span>,
      selector: (row) => row.Location,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Location}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Booking Count</span>,
      selector: (row) => row.booking_count,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.booking_count}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Prop Type</span>,
      selector: (row) => row.PropType,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.PropType}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Form Stage</span>,
      selector: (row) => row.Form_Stage,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Form_Stage}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">BD Amount</span>,
      selector: (row) => row.BD_Amount,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.BD_Amount}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Booking Status</span>,
      selector: (row) => row.BookingStatus,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.BookingStatus}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name</span>,
      selector: (row) => row.BuilderName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.BuilderName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      selector: (row) => row.ProjectName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.ProjectName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.ClientName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.ClientName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Floor</span>,
      selector: (row) => row.Floor,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Floor}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Tower/Block</span>,
      selector: (row) => row.TowerBlock,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.TowerBlock}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Unit No</span>,
      selector: (row) => row.UnitNo,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.UnitNo}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Area</span>,
      selector: (row) => row.Area,
      sortable: true,
      cell: (row) =>
        <WordWrapCell>{row.Area % 1 === 0
          ? row.Area
          : row?.Area?.toFixed(2)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">BSP</span>,
      selector: (row) => row.BSP,
      sortable: true,
      cell: (row) =>
        <WordWrapCell>{row.BSP % 1 === 0
          ? row.BSP
          : row?.BSP?.toFixed(2)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Inaugral Discount</span>,
      selector: (row) => row.Inaugral_Discount,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Inaugral_Discount}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Discount On Form</span>,
      selector: (row) => row.Discount_on_Form,
      sortable: true,
      cell: (row) =>
        <WordWrapCell>{row.Discount_on_Form % 1 === 0
          ? row.Discount_on_Form
          : row.Discount_on_Form?.toFixed(2)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">NPV</span>,
      selector: (row) => row.NPV,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.NPV}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Total Discount Amount Per SqFt</span>,
      selector: (row) => row.Total_Discount_Amount_Per_SqFt,
      sortable: true,
      cell: (row) =>
        <WordWrapCell>{row.Total_Discount_Amount_Per_SqFt % 1 === 0
          ? row.Total_Discount_Amount_Per_SqFt
          : row.Total_Discount_Amount_Per_SqFt?.toFixed(2)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Effective BSP to Customer</span>,
      selector: (row) => row.Effective_BSP_to_Customer,
      sortable: true,
      cell: (row) =>
        <WordWrapCell>{row.Effective_BSP_to_Customer % 1 === 0
          ? row.Effective_BSP_to_Customer
          : row.Effective_BSP_to_Customer?.toFixed(2)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Effective BSP To Customer*Area</span>,
      selector: (row) => row.Effective_BSP_to_Customer_X_Area,
      sortable: true,
      cell: (row) =>
        <WordWrapCell>{row.Effective_BSP_to_Customer_X_Area % 1 === 0
          ? row.Effective_BSP_to_Customer_X_Area
          : row.Effective_BSP_to_Customer_X_Area?.toFixed(2)}</WordWrapCell>
    },
    // {
    //   name: <span className="font-weight-bold fs-13">Net PLC Amount</span>,
    //   selector: (row) => row.Net_PLC_Amount,
    //   sortable: true,
    //   cell: (row) => <WordWrapCell>{row.Net_PLC_Amount}</WordWrapCell>
    // },
    {
      name: <span className="font-weight-bold fs-13">Total Value Of Other Charges</span>,
      selector: (row) => row.Total_value_of_Other_Charges,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Total_value_of_Other_Charges}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Possession Charges</span>,
      selector: (row) => row.Possession_Charges,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Possession_Charges}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Net Cost After Possession Charges</span>,
      selector: (row) => row.Net_Cost_after_Possession_Charges,
      sortable: true,
      cell: (row) =>
        <WordWrapCell>{row.Net_Cost_after_Possession_Charges % 1 === 0
          ? row.Net_Cost_after_Possession_Charges
          : row.Net_Cost_after_Possession_Charges?.toFixed(2)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Turnover</span>,
      selector: (row) => row.Turnover,
      sortable: true,
      cell: (row) =>
        <WordWrapCell>{row.Turnover % 1 === 0
          ? row?.Turnover
          : row?.Turnover?.toFixed(2)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Plan Choosen By Customer</span>,
      selector: (row) => row.Plan_Chosen_by_Customer,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Plan_Chosen_by_Customer}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Demand</span>,
      selector: (row) => row.Demand,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Demand}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Demand Amt</span>,
      selector: (row) => row.Demand_Amt,
      sortable: true,
      cell: (row) => <WordWrapCell>{roundToTwoDecimals(row.Demand_Amt)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">GST%</span>,
      selector: (row) => row.GST,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.GST}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">GST Amount</span>,
      selector: (row) => row.GST_Amount,
      sortable: true,
      cell: (row) => <WordWrapCell> {row.GST_Amount % 1 === 0
        ? row.GST_Amount
        : row.GST_Amount?.toFixed(2)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Balance Payment With GST</span>,
      selector: (row) => row.Balance_Payment_with_GST,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Balance_Payment_with_GST % 1 === 0
        ? row.Balance_Payment_with_GST
        : row.Balance_Payment_with_GST?.toFixed(2)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Payment Rec</span>,
      selector: (row) => row.Payment_Rec,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Payment_Rec}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Clearance Amount</span>,
      selector: (row) => row.Clearance_Amount,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Clearance_Amount}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Due Balance</span>,
      selector: (row) => row.Due_Balance,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Due_Balance % 1 === 0
        ? row?.Due_Balance
        : row?.Due_Balance?.toFixed(2)}</WordWrapCell>
    }
  ];

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Report" breadcrumbItem="Sale Master" />
      {isPending && <ScreenLoader />}
      <Container fluid={true}>
        <Card>
          <CardBody>
            <form onSubmit={handleShowData}>
              <Row className="g-3">
                <Col md="2">
                  <h6 className="font-size-11">From Date</h6>
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
                <Col lg="3">
                  <h6 className="font-size-11">Search By</h6>
                  <Select
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    isClearable
                    value={searchByGroupSelect}
                    onChange={(selectedGroup) => handleSearchByTypeSelectGroup(selectedGroup)}
                    options={sortByTypeGroup}
                  />
                </Col>
                <Col lg="3">
                  <h6 className="font-size-11">Search Field</h6>
                  <input
                    className="form-control"
                    id="searchData"
                    type="text"
                    value={searchData}
                    onChange={(e) => setSearchData(e.target.value)}
                    placeholder="Search..."
                  />
                </Col>
                <Col lg="2" className="d-flex align-items-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleShowData}
                  >
                    Show
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    color="secondary"
                    onClick={handleClearData}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>

        {saleMasterData?.length > 0 && empCode !== "20019" && (
          <Col lg="2" className="mb-2">
            <i
              className="fas fa-file-excel"
              style={{
                color: defaultTheme.primary,
                cursor: "pointer",
                fontSize: "16px",
              }}
              onClick={downloadSaleMasterExcel}
            />
          </Col>
        )}

        {saleMasterData?.length > 0 && (
          <AppTable
            progressPending={isPending}
            columns={columns}
            data={saleMasterData}
            pagination
          />
        )}
      </Container>
    </PageContent>
  );
}
