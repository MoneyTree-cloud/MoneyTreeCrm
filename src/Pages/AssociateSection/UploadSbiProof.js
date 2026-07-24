/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Select from "react-select";
import { toast } from "react-toastify";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet, usePost } from "../../Hooks/useApi";
import { GET_MY_TEAM, GET_SBI_SALES_ASSOCIATE, UPLOAD_SBI_FILES } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { FaFilePdf, FaUpload } from "react-icons/fa";
import { imageBaseUrl } from "../../helpers/api_helper";
import ImageModal from "../../components/Common/ImageModal";
import { WordWrapCell } from "../../helpers/function_helper";

export default function UploadSbiProof() {
  const userId = useUserStore((state) => state.user.userId);
  const [modal, setModal] = useState(false);
  const [apiUrl, setApiUrl] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const toggleModal = () => setModalOpen(!modalOpen);

  const initialFormState = {
    associateType: null,
    searchBy: null,
    searchText: "",
  };

  const [file, setFile] = useState({});
  const [formState, setFormState] = useState(initialFormState);

  const { data: associateList, isLoading: loadingTeam } = useGet(GET_MY_TEAM + userId);
  const { data: sbiData, isLoading, refetch: getSbiData, } = useGet(apiUrl, { enabled: Boolean(apiUrl), });

  useEffect(() => {
    updateApiUrl();
  }, []);

  const updateApiUrl = ({
    associateType = formState?.associateType?.value || userId,
    searchBy = formState?.searchBy?.value,
    searchText = formState?.searchText,
  } = {}) => {
    const params = new URLSearchParams();

    if (associateType) params.append("associateId", associateType);
    if (searchBy) params.append("textFilterSales", searchBy);
    if (!searchBy) params.append("textFilterSales", 'SelectAll');
    if (searchText) params.append("textFilter", searchText);

    const url = `${GET_SBI_SALES_ASSOCIATE}${params.toString()}`;
    setApiUrl(url);
  };

  const clickHandler = () => {
    updateApiUrl();
    getSbiData();
  };

  const sortByTypeGroup = [
    { label: "Select All", value: "SelectAll" },
    { label: "Project Name", value: "ProjectName" },
    { label: "Builder Name", value: "BuilderName" },
  ];

  const handleFileChange = (e, transactionId) => {
    const selectedFile = e.target?.files?.[0];
    if (selectedFile) {
      setFile((prev) => ({ ...prev, [transactionId]: selectedFile }));
    }
  };

  function handleFormChange(event) {
    const { id, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  }

  function handleSelectChange(name) {
    return (selectedOption) => {
      setFormState((prevState) => ({
        ...prevState,
        [name]: selectedOption,
      }));
    };
  }

  const toggle = () => setModal(!modal);

  const handleFileUpload = (transactionId) => {
    const selectedFile = file[transactionId];

    if (selectedFile) {
      const isConfirmed = window.confirm(
        "Are you sure you want to upload the file?"
      );

      if (!isConfirmed) return;
      const selectedFile = file[transactionId];
      if (!selectedFile) {
        toast.error("No file found for upload.");
        return;
      }
      const formDataApi = new FormData();
      formDataApi.append("transactionId", transactionId);
      formDataApi.append("file", selectedFile);
      mutateAdd(formDataApi);
    } else {
      toast.error("Please select a file to upload.");
    }
  };

  const { isPending: isPendingAdd, mutate: mutateAdd } = usePost(
    UPLOAD_SBI_FILES,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getSbiData();
          setFile((prev) => {
            const newFile = { ...prev };
            return newFile;
          });
          toggle();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handleClear = () => {
    updateApiUrl();
    setFormState(initialFormState);
  };

  const handleViewFile = (fileName) => {
    const fileExtension = fileName.split(".").pop().toLowerCase();
    const fileUrl = imageBaseUrl + fileName;

    if (fileExtension === "pdf" || fileExtension === "pptx") {
      // Open PDF in a new window
      window.open(fileUrl, "_blank");
    } else {
      // Set the image source and open modal for images
      setCurrentImage(fileUrl);
      toggleModal();
    }
  };

  const handleViewSelectedFile = (file) => {
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, "_blank");
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "5%",
    },
    {
      name: <span className="font-weight-bold fs-13">Unique ID</span>,
      selector: (row) => row.saleNo,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.saleNo}</WordWrapCell>,
      width: "8%",
    },
    {
      name: <span className="font-weight-bold fs-13">Cheque No.</span>,
      selector: (row) => row.chequeNo,
      sortable: true,
      width: "10%",
      cell: (row) => <WordWrapCell>{row.chequeNo}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name</span>,
      selector: (row) => row.builderName,
      sortable: true,
      width: "12%",
      cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      selector: (row) => row.projectName,
      sortable: true,
      width: "12%",
      cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.clientName,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Receive Amount</span>,
      selector: (row) => row.reciveAmount,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.reciveAmount}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Proof Status</span>,
      selector: (row) => row.proofStatus,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.proofStatus === 0 ? "Pending For Approve" : "Pending For Upload"}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Proof</span>,
      selector: (row) => (
        <div>
          {(row.file && row.file !== 'NULL') &&
            <FaFilePdf
              size={20}
              onClick={() => handleViewFile(row.file)}
              style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
            />
          }
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Upload Proof</span>,
      width: "15%",
      cell: (row) => (
        <div className="d-flex align-items-center">
          <label className="btn btn-outline-secondary btn-sm mb-0">
            <FaUpload />
            <input
              type="file"
              disabled={row.proofStatus === 0 ? true : false}
              accept=".pdf,image/*"
              onChange={(e) => handleFileChange(e, row.transactionId)}
              hidden
            />
          </label>
          {file[row.transactionId] && (
            <FaFilePdf
              size={20}
              onClick={() => handleViewSelectedFile(file[row.transactionId])}
              style={{
                cursor: "pointer",
                color: defaultTheme.goldColorLogo,
                marginLeft: "10px",
              }}
            />
          )}
          <button
            disabled={row.proofStatus === 0 ? true : false}
            type="button"
            className={
              row.proofStatus === 0
                ? "btn btn-secondary btn-sm ms-2"
                : "btn btn-primary btn-sm ms-2"
            }
            onClick={() => handleFileUpload(row.transactionId)}
          >
            {row.proofStatus === 0 ? 'Uploaded' : 'Upload'}
          </button>
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Reject Remarks</span>,
      sortable: true,
      selector: (row) => row.rejectRemark,
      cell: (row) => <WordWrapCell>{row.rejectRemark}</WordWrapCell>
    }
  ];

  return (
    <PageContent>
      {(isLoading || isPendingAdd || loadingTeam) && <ScreenLoader />}
      <Breadcrumbs title="Associate Section" breadcrumbItem="Upload SBI Proof" />
      <Container fluid={true}>
        <Card>
          <CardBody>
            <Row className="g-3">
              <Col lg="3">
                <h6 className="font-size-11">Select Associate</h6>
                <Select
                  isClearable
                  style={{ zIndex: 9999 }}
                  menuPortalTarget={document.body}
                  value={formState.associateType}
                  onChange={handleSelectChange("associateType")}
                  options={
                    Array.isArray(associateList?.data?.data)
                      ? associateList?.data?.data
                      : []
                  }
                />
              </Col>
              <Col lg="3">
                <h6 className="font-size-11">Search By</h6>
                <Select
                  isClearable
                  style={{ zIndex: 9999 }}
                  menuPortalTarget={document.body}
                  value={formState.searchBy}
                  onChange={handleSelectChange("searchBy")}
                  options={sortByTypeGroup}
                />
              </Col>
              <Col lg="3">
                <h6 className="font-size-11">Search</h6>
                <input
                  className="form-control"
                  id="searchText"
                  type="text"
                  value={formState.searchText}
                  onChange={handleFormChange}
                  placeholder="Type to search..."
                />
              </Col>
              <Col
                lg="3"
                className="d-flex align-items-end justify-content-center"
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={clickHandler}
                >
                  Search
                </button>

                <button
                  type="button"
                  className="btn btn-secondary ms-3"
                  onClick={handleClear}
                >
                  Clear
                </button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {Array.isArray(sbiData?.data?.data) && sbiData?.data?.data?.length > 0 &&
          <AppTable
            progressPending={isLoading}
            columns={columns}
            data={Array.isArray(sbiData?.data?.data) ? sbiData?.data?.data : []}
            pagination
            paginationTotalRows={sbiData?.data?.count}

          />
        }

        <ImageModal
          isOpen={modalOpen}
          toggle={toggleModal}
          imageSrc={currentImage}
        />
      </Container>
    </PageContent>
  );
}
