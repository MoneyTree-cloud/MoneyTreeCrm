import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDate, formatDateForInput, generateTimestamp, WordWrapCell } from "../../helpers/function_helper";
import {
  PAYMENT_PLAN_MASTER_REPORT_VIEW,
  PAYMENT_MASTER_REPORT,
} from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css"; // Import your CSS file
import { toast } from "react-toastify";
import ApiClient from "../../helpers/api_helper";
import Select from "react-select";
import PageContent from "../../components/Common/PageContent";
import { defaultTheme } from "../../helpers/defaultTheme";
import PermissionMissing from "../Utility/PermissonMissing";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function PaymentPlanMasterReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [searchData, setSearchData] = useState("");
  const [saleMasterData, setSaleMasterData] = useState([]);
  const [searchByGroupSelect, setselectedSearchGroupSelect] = useState(null);

  const [accessGranted, setAccessGranted] = useState(null);
  const userId = useUserStore((state) => state.user.userId);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'report-payment-plan-master');
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

  const downloadPaymentMasterExcel = () => {
    setIsPending(true);
    ApiClient.get(`${PAYMENT_MASTER_REPORT}${fromDate}&toDate=${toDate}`, {
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
        link.download = `payment_plan_master_report_${generateTimestamp()}.xlsx`;
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
    let url = `${PAYMENT_PLAN_MASTER_REPORT_VIEW}${fromDate}&toDate=${toDate}`;

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
        setIsPending(false);
        setSaleMasterData([]);
        toast.error(error.message);
      });
  };

  const handleClearData = () => {
    setTodayDate();
    setSearchData("");
    setSaleMasterData([]);
    setselectedSearchGroupSelect(null)
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "3%",
    },
    {
      name: <span className="font-weight-bold fs-13">Unique ID</span>,
      selector: (row) => row.MTRS_Id,
      sortable: true,
      width: "6%",
      cell: (row) => <WordWrapCell>{row.MTRS_Id}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Main Team</span>,
      selector: (row) => row.Main_Team,
      sortable: true,
      width: "5%",
      cell: (row) => <WordWrapCell>{row.Main_Team}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Sub Team</span>,
      selector: (row) => row.Sub_Team,
      sortable: true,
      width: "5%",
      cell: (row) => <WordWrapCell>{row.Sub_Team}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      selector: (row) => row.Associat_Name,
      sortable: true,
      width: "10%",
      cell: (row) => <WordWrapCell>{row.Associat_Name + " (" + row.AssociateCode + ")"}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Booking Date</span>,
      selector: (row) => row.Date_of_Booking,
      sortable: true,
      width: "8%",
      cell: (row) => <WordWrapCell> {formatDate(row.Date_of_Booking)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name</span>,
      selector: (row) => row.Builder_Name,
      sortable: true,
      width: "8%",
      cell: (row) => <WordWrapCell>{row.Builder_Name}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      selector: (row) => row.Project_Name,
      sortable: true,
      width: "8%",
      cell: (row) => <WordWrapCell>{row.Project_Name}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.Client_Name,
      sortable: true,
      width: "8%",
      cell: (row) => <WordWrapCell>{row.Client_Name}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Floor</span>,
      selector: (row) => row.Floor,
      sortable: true,
      width: "5%",
      cell: (row) => <WordWrapCell>{row.Floor}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Tower/Block</span>,
      selector: (row) => row.Tower_Block,
      sortable: true,
      width: "7%",
      cell: (row) => <WordWrapCell>{row.Tower_Block}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Unit No</span>,
      selector: (row) => row.UnitNo,
      sortable: true,
      width: "6%",
      cell: (row) => <WordWrapCell>{row.UnitNo}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Bank Name</span>,
      selector: (row) => row.Bank_Name,
      sortable: true,
      width: "6%",
      cell: (row) => <WordWrapCell>{row.Bank_Name}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Branch Name</span>,
      selector: (row) => row.Branch_Name,
      sortable: true,
      width: "5%",
      cell: (row) => <WordWrapCell>{row.Branch_Name}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Cheque Date</span>,
      selector: (row) => row.Cheque_Date,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Cheque_Date}</WordWrapCell>,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Cheque No</span>,
      selector: (row) => row.Cheque_No,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.Cheque_No}</WordWrapCell>,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Amount</span>,
      selector: (row) => row.Amount,
      sortable: true,
      width: "6%",
      cell: (row) => <WordWrapCell>{row.Amount}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">PDC</span>,
      selector: (row) => row.PDC,
      sortable: true,
      width: "6%",
      cell: (row) => <WordWrapCell>{row.PDC}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Clearance Date</span>,
      selector: (row) => row.Clearance_Date,
      sortable: true,
      width: "8%",
      cell: (row) => <WordWrapCell>{row.Clearance_Date}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Clearance Amount</span>,
      selector: (row) => row.Clearance_Amount,
      sortable: true,
      width: "7%",
      cell: (row) => <WordWrapCell>{row.Clearance_Amount}</WordWrapCell>
    },

    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      selector: (row) => row.Remarks,
      sortable: true,
      width: "20%",
      cell: (row) => <WordWrapCell>{row.Remarks}</WordWrapCell>
    },
  ];

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }


  return (
    <PageContent>
      <Breadcrumbs
        title="Report"
        breadcrumbItem="Payment Plan Master"
      />
      {isPending && <ScreenLoader />}
      <Container fluid={true}>
        <Col lg="2" className="mb-2">
          <i
            className="fas fa-file-excel"
            style={{
              color: defaultTheme.primary,
              cursor: "pointer",
              fontSize: "16px",
            }}
            onClick={() => downloadPaymentMasterExcel()}
          ></i>
        </Col>
        <Card>
          <CardBody>
            <form onSubmit={handleShowData}>
              <Row>
                <Col md="2">
                  <h6 className=" font-size-11">From Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    id="date-input-1"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Col>
                <Col md="2">
                  <h6 className=" font-size-11">To Date</h6>
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
                    onChange={(selectedGroup) => { handleSearchByTypeSelectGroup(selectedGroup); }}
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
                <Col lg="2" className="d-flex align-items-end gap-2">
                  <Button
                    type="submit"
                    color="primary"
                    onClick={handleShowData}
                  >
                    Show
                  </Button>

                  <Button
                    type="button"
                    color="secondary"
                    onClick={handleClearData}
                  >
                    Clear
                  </Button>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>
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
