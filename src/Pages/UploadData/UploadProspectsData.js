import React, { useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { toast } from "react-toastify";
import { useGet, usePost } from "../../Hooks/useApi";
import {
  DOWNLOAD_PROSPECT_EXCEL,
  GET_ALL_USERS_DROPDOWN,
  SAVE_PROSPECT_DATA,
  UPLOAD_PROSPECT_DATA,
} from "../../helpers/url_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import ScreenLoader from "../../constants/ScreenLoader";
import Select from "react-select";
import { useUserStore } from "../../store/useUserStore";
import { MdMobileFriendly } from "react-icons/md";
import "../CSS/styles.css";
import ApiClient from "../../helpers/api_helper";
import PageContent from "../../components/Common/PageContent";
import { RequiredStar, WordWrapCell } from "../../helpers/function_helper";

export default function UploadLeadData() {
  const userId = useUserStore((state) => state.user.userId);
  const [file, setFile] = useState(null);
  const [rowData, setRowData] = useState([]);
  const fileInputRef = useRef(null);
  const [searchByAdminSelect, setselectedSearchAdminSelect] = useState(null);
  const { data: adminList } = useGet(GET_ALL_USERS_DROPDOWN);

  function handleSearchByAdminSelectGroup(selectedGroup) {
    setselectedSearchAdminSelect(selectedGroup);
  }

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      sortable: true,
      width: "8%",
      selector: (_, index) => index + 1,
      cell: (_, index) => <WordWrapCell>{index + 1}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      sortable: true,
      selector: (row) => row.clientName,
      cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Mobile Number</span>,
      width: "10%",
      selector: (row) => row.phoneNo,
      sortable: true,
      cell: (row) => (
        <div className="phone-container">
          <MdMobileFriendly
            className="phone-icon"
            color={defaultTheme.goldColorLogo}
          />
          <span className="phone-number">{row.phoneNo}</span>
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Project</span>,
      sortable: true,
      selector: (row) => row.projectName,
      cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Id</span>,
      sortable: true,
      selector: (row) => row.associateId,
      cell: (row) => <WordWrapCell>{row.associateId}</WordWrapCell>,
    },
  ];

  const { isPending: uploadLoading, mutate: mutateUpload } = usePost(
    UPLOAD_PROSPECT_DATA + searchByAdminSelect?.value,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          setRowData(response?.data?.data);
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const { isPending: saveLoading, mutate: mutateSave } = usePost(
    SAVE_PROSPECT_DATA + userId,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          setRowData([]);
          setselectedSearchAdminSelect(null)
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
    setFile(event.target.files[0]);
  };

  const handleUploadData = () => {
    if (!searchByAdminSelect) {
      toast.error("Please Select User");
      return;
    } else if (!file) {
      toast.error("Please Select File First.");
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
    ApiClient.get(DOWNLOAD_PROSPECT_EXCEL, { responseType: "arraybuffer" })
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
        link.download = "prospect_format.xlsx";
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
      <Breadcrumbs title="Upload" breadcrumbItem="Upload Prospects" />
      {(uploadLoading || saveLoading) && <ScreenLoader />}
      <Container fluid>
        <Card>
          <CardBody>
            <Row>
              <Col lg="3">
                <h6 className="font-size-11 mt-1">Select User</h6>
                <Select
                  style={{ zIndex: 9999 }}
                  menuPortalTarget={document.body}
                  value={searchByAdminSelect}
                  onChange={(selectedGroup) => {
                    handleSearchByAdminSelectGroup(selectedGroup);
                  }}
                  options={
                    Array.isArray(adminList?.data?.data)
                      ? adminList?.data?.data
                      : []
                  }
                />
              </Col>
              <Col lg="3">
                <h6 className=" font-size-11 mt-1">
                  Choose File <RequiredStar/>
                </h6>
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
                lg="6"
                className="d-flex justify-content-center align-items-center mt-4"
              >
                <div className="mb-3">
                  <button
                    type="button"
                    className="btn btn-info"
                    onClick={handleUploadData}
                  >
                    Upload Data
                  </button>
                </div>
                <div className="mb-3 ms-4 me-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveData}
                  >
                    Save Data
                  </button>
                </div>
                <div className="mb-3">
                  <button
                    type="button"
                    className="btn btn-warning"
                    color="secondary"
                    onClick={handleFormatExcelDownload}
                  >
                    Download Format
                  </button>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
        {rowData.length > 0 && (
          <AppTable
            progressPending={uploadLoading}
            columns={columns}
            data={rowData || []}
            pagination
            paginationServer

            conditionalRowStyles={[
              {
                when: (row) => row.isExists === "NO",
                style: {
                  color: defaultTheme.primary,
                },
              },
              {
                when: (row) => row.isExists === "YES",
                style: {
                  color: defaultTheme.redColor,
                },
              },
            ]}
          />
        )}
      </Container>
    </PageContent>
  );
}
