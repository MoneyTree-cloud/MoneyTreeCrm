import { useEffect, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { toast } from "react-toastify";
import { usePost } from "../../Hooks/useApi";
import { DOWNLOAD_UNIT_MASTER_EXCEL, SAVE_PROJECT_UNIT_MASTER, UPLOAD_PROJECT_UNIT_MASTER } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { formatDate, generateTimestamp, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import ApiClient from "../../helpers/api_helper";
import PageContent from "../../components/Common/PageContent";
import { FaDownload } from "react-icons/fa";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function UploadUnitMaster() {
  const userId = useUserStore((state) => state.user.userId);
  const [file, setFile] = useState(null);
  const [rowData, setRowData] = useState([]);
  const fileInputRef = useRef(null);
  const [accessGranted, setAccessGranted] = useState(null);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      width: "1%",
      cell: (_, index) => <WordWrapCell>{index + 1}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name</span>,
      sortable: true,
      width: "3%",
      selector: (row) => row.builderName,
      cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      sortable: true,
      width: "3%",
      selector: (row) => row.projectName,
      cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Project Type Id</span>,
      sortable: true,
      width: "3%",
      selector: (row) => row.projectTypeId,
      cell: (row) => <WordWrapCell>{row.projectTypeId}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Unit No.</span>,
      sortable: true,
      selector: (row) => row.unitNo,
      cell: (row) => <WordWrapCell>{row.unitNo}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Tower/Block</span>,
      sortable: true,
      selector: (row) => row.towerBlock,
      cell: (row) => <WordWrapCell>{row.towerBlock}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Floor</span>,
      sortable: true,
      selector: (row) => row.floor,
      cell: (row) => <WordWrapCell>{row.floor}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Area</span>,
      sortable: true,
      selector: (row) => row.area,
      cell: (row) => <WordWrapCell>{row.area}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">BSP</span>,
      sortable: true,
      selector: (row) => row.bsp,
      cell: (row) => <WordWrapCell>{row.bsp}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Inugral Discount</span>,
      sortable: true,
      selector: (row) => row.inauguralDiscount,
      cell: (row) => <WordWrapCell>{row.inauguralDiscount}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">NPV</span>,
      sortable: true,
      selector: (row) => row.npv,
      cell: (row) => <WordWrapCell>{row.npv}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Other Discount</span>,
      sortable: true,
      selector: (row) => row.othDicountBuilder,
      cell: (row) => <WordWrapCell>{row.othDicountBuilder}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Total Discount</span>,
      sortable: true,
      selector: (row) => row.totalDiscount,
      cell: (row) => <WordWrapCell>{row.totalDiscount}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Net BSP</span>,
      sortable: true,
      selector: (row) => row.netBsp,
      cell: (row) => <WordWrapCell>{row.netBsp}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">BSP*Area</span>,
      sortable: true,
      selector: (row) => row.netBspArea,
      cell: (row) => <WordWrapCell>{row.netBspArea}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">GST %</span>,
      sortable: true,
      selector: (row) => row.gstPercent,
      cell: (row) => <WordWrapCell>{row.gstPercent}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">GST Amount</span>,
      sortable: true,
      selector: (row) => row.gstAmount,
      cell: (row) => <WordWrapCell>{row.gstAmount}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Floor PLC</span>,
      sortable: true,
      selector: (row) => row.floorPlc,
      cell: (row) => <WordWrapCell>{row.floorPlc}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Facing PLC</span>,
      sortable: true,
      selector: (row) => row.facingPlc,
      cell: (row) => <WordWrapCell>{row.facingPlc}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Other View PLC</span>,
      sortable: true,
      selector: (row) => row.otherViewPlc,
      cell: (row) => <WordWrapCell>{row.otherViewPlc}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Parking</span>,
      sortable: true,
      selector: (row) => row.carParking,
      cell: (row) => <WordWrapCell>{row.carParking}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Club Membership</span>,
      sortable: true,
      selector: (row) => row.clubMembership,
      cell: (row) => <WordWrapCell>{row.clubMembership}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Power Backup</span>,
      sortable: true,
      selector: (row) => row.powerBackupCharges,
      cell: (row) => <WordWrapCell>{row.powerBackupCharges}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">IFMS</span>,
      sortable: true,
      selector: (row) => row.ifmsAfterDiscount,
      cell: (row) => <WordWrapCell>{row.ifmsAfterDiscount}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Lease Rent</span>,
      sortable: true,
      selector: (row) => row.leaseRentAfterDiscount,
      cell: (row) => <WordWrapCell>{row.leaseRentAfterDiscount}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">ESSC</span>,
      sortable: true,
      selector: (row) => row.esscPer,
      cell: (row) => <WordWrapCell>{row.esscPer}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">CRF</span>,
      sortable: true,
      selector: (row) => row.crfPer,
      cell: (row) => <WordWrapCell>{row.crfPer}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">EDC IDC</span>,
      sortable: true,
      selector: (row) => row.edcIdc,
      cell: (row) => <WordWrapCell>{row.edcIdc}</WordWrapCell>,
    },
      {
      name: <span className="font-weight-bold fs-13">EEC FFC</span>,
      sortable: true,
      selector: (row) => row.eecFfc,
      cell: (row) => <WordWrapCell>{row.eecFfc}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Terrage Garden</span>,
      sortable: true,
      selector: (row) => row.terrageGarden,
      cell: (row) => <WordWrapCell>{row.terrageGarden}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Development</span>,
      sortable: true,
      selector: (row) => row.development,
      cell: (row) => <WordWrapCell>{row.development}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Facilities</span>,
      sortable: true,
      selector: (row) => row.facilities,
      cell: (row) => <WordWrapCell>{row.facilities}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Maintenance</span>,
      sortable: true,
      selector: (row) => row.maintenance,
      cell: (row) => <WordWrapCell>{row.maintenance}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Meter</span>,
      sortable: true,
      selector: (row) => row.meter,
      cell: (row) => <WordWrapCell>{row.meter}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Other Charge </span>,
      sortable: true,
      selector: (row) => row.otherCharges,
      cell: (row) => <WordWrapCell>{row.otherCharges}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Total Other Charge</span>,
      sortable: true,
      selector: (row) => row.totalOtherCharge,
      cell: (row) => <WordWrapCell>{row.totalOtherCharge}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Other Charge GST %</span>, // ISSUE
      sortable: true,
      selector: (row) => row.otherChargeGstRate,
      cell: (row) => <WordWrapCell>{row.otherChargeGstRate}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Other Charge GST Amount</span>,
      sortable: true,
      selector: (row) => row.otherChargeGstAmt,
      cell: (row) => <WordWrapCell>{row.otherChargeGstAmt}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Total Amount</span>,
      sortable: true,
      selector: (row) => row.netCost,
      cell: (row) => <WordWrapCell>{row.netCost}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Total GST Amount</span>,
      sortable: true,
      selector: (row) => row.totalGstAmount,
      cell: (row) => <WordWrapCell>{row.totalGstAmount}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">NetCost To Client</span>,
      sortable: true,
      selector: (row) => row.netCostWithGst,
      cell: (row) => <WordWrapCell>{row.netCostWithGst}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Validaty Date</span>,
      sortable: true,
      selector: (row) => (row.validTill ? formatDate(row.validTill) : ""),
      cell: (row) => <WordWrapCell>{row.validTill ? formatDate(row.validTill) : ""}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Hold Validity Hour</span>,
      sortable: true,
      selector: (row) => row.holdResetHours,
      cell: (row) => <WordWrapCell>{row.holdResetHours}</WordWrapCell>,
    },
  ];

  const { isPending: uploadLoading, mutate: mutateUpload } = usePost(
    UPLOAD_PROJECT_UNIT_MASTER,
    {
      onSuccess: (response) => {
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Clear the input value
        }
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          setRowData(response?.data?.data);
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Clear the input value
        }
        toast.error(err.message);
      },
    }
  );

  const { isPending: saveLoading, mutate: mutateSave } = usePost(
    `${SAVE_PROJECT_UNIT_MASTER}?loginId=${userId}`,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          setRowData([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the input value
          }
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const allowedExtensions = ['.xls', '.xlsx'];
      const fileName = file.name;
      const fileExtension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();

      if (allowedExtensions.includes(fileExtension)) {
        setFile(file);
        // Optional: Clear any previous error
      } else {
        // Show error message
        toast.error('Invalid file type. Please upload an Excel file (.xls or .xlsx).');
        // Reset the input field (optional)
        event.target.value = '';
      }
    }
  };

  const handleUploadData = () => {
    if (!file) {
      toast.error("Please Select Unit File");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    mutateUpload(formData);
  };

  const handleSaveData = () => {
    if (!rowData) {
      toast.error("There Is No Data To Save");
      return;
    }
    mutateSave(rowData);
  };

  const handleFormatExcelDownload = () => {
    ApiClient.get(DOWNLOAD_UNIT_MASTER_EXCEL, { responseType: "arraybuffer" })
      .then(function (response) {
        if (response.data.status === 0) {
          toast.error(response.data.message);
          return;
        }
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `unit_upload_format_${generateTimestamp()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(function (error) {
        toast.error(error.message);
      });
  };

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'upload-unit-master');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Upload" breadcrumbItem="Upload Unit Master" />
      {(uploadLoading || saveLoading) && <ScreenLoader />}
      <Container fluid={true}>
        <Card>
          <CardBody>
            <Row>
              <Col lg="4">
                <h6 className="font-size-11 mt-1">Choose Unit File <RequiredStar /></h6>
                <input
                  className="form-control"
                  id="fileUpload"
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </Col>
              <Col
                lg="4"
                className="d-flex align-items-end"
              >
                <button
                  type="button"
                  className="btn btn-info"
                  onClick={handleUploadData}
                >
                  Upload
                </button>

                <button
                  type="button"
                  className="btn btn-primary ms-2"
                  onClick={handleSaveData}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={handleFormatExcelDownload}
                >
                  <FaDownload /> Format
                </button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {rowData?.length > 0 && (
          <AppTable
            progressPending={uploadLoading}
            columns={columns}
            data={rowData || []}
            pagination

          />
        )}
      </Container>
    </PageContent>
  );
}
