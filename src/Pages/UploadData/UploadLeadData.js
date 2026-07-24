import { useEffect, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import { usePost } from "../../Hooks/useApi";
import { DOWNLOAD_LEAD_EXCEL, UPLOAD_LEAD_DATA_LATEST } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css";
import ApiClient from "../../helpers/api_helper";
import PageContent from "../../components/Common/PageContent";
import UploadProgressModal from "./UploadProgressModal";
import { generateTimestamp, RequiredStar } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import { FaDownload } from "react-icons/fa";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { USER_TYPE } from "../../constants/global";

export default function UploadLeadData() {
  const [file, setFile] = useState(null);
  const { role, userId } = useUserStore((state) => state.user);
  const fileInputRef = useRef(null);
  const [accessGranted, setAccessGranted] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [isLoading, setIsLoading] = useState(false)

  const { isPending: uploadLoading, mutate: leadExcelUpload } = usePost(
    UPLOAD_LEAD_DATA_LATEST + userId,
    {
      onSuccess: (response) => {
        if (response.data.status === 0) {
          toast.error(response.data.message)
        }
        else {
          const fileData = response.data.taskId
          setUploadedFileId(fileData);
          setShowModal(true);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setFile(null)
      },
      onError: (err) => {
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
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
      } else {
        // Show error message
        toast.error('Invalid file type. Please upload an Excel file (.xls or .xlsx).');
        event.target.value = '';
      }
    }
  };

  const handleUploadData = () => {
    if (!file) {
      toast.error("Please Select Lead File");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    leadExcelUpload(formData);
  };

  const handleFormatExcelDownload = () => {
    setIsLoading(true)
    ApiClient.get(DOWNLOAD_LEAD_EXCEL, { responseType: "arraybuffer" })
      .then(function (response) {
        setIsLoading(false)
        if (response.data.status === 0) {
          toast.error(response.data.message);
          return;
        }
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `lead_format_${generateTimestamp()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(function (error) {
        setIsLoading(false)
        toast.error(error.message);
      });
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (role !== USER_TYPE.ASSOCIATE) {
        const hasAccess = await CheckUserAccess(userId, 'upload-lead-data');
        setAccessGranted(hasAccess);
      }
      else {
        setAccessGranted(true);
      }
    };
    checkAccess();
  }, [userId, role]);

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Upload" breadcrumbItem="Leads" />
      {(uploadLoading || isLoading) && <ScreenLoader />}
      <Container fluid={true}>
        <Card>
          <CardBody>
            <Row className="g-2">
              <Col lg="4">
                <h6 className=" font-size-12">Lead File <RequiredStar /></h6>
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
                  className="btn btn-primary me-2"
                  onClick={handleUploadData}
                >
                  Upload Data
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  color="secondary"
                  onClick={handleFormatExcelDownload}
                >
                  <FaDownload /> Format
                </button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <UploadProgressModal
          show={showModal}
          fileId={uploadedFileId}
          onClose={() => {
            setShowModal(false);
            setUploadedFileId(null);
          }}
        />
      </Container>
    </PageContent>
  );
}
