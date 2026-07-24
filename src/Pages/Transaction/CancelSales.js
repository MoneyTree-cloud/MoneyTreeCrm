/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Input } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import Select from "react-select";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import { CANCEL_SALE, CANCEL_SALES_LIST } from "../../helpers/url_helper";
import { useGet, usePut } from "../../Hooks/useApi";
import { formatDate, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import PageContent from "../../components/Common/PageContent";

export default function CancelSales() {
  const userId = useUserStore((state) => state.user.userId);
  const LIMIT = 100;
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [apiUrl, setApiUrl] = useState(null);
  const [saleId, setSaleId] = useState("");
  const [flag, setFlag] = useState(false);

  // State for search
  const [searchText, setSearchText] = useState("");
  const [searchByGroupSelect, setSearchByGroupSelect] = useState(null);

  const {
    data: cancelSaleList,
    isLoading,
    refetch: getCancelSaleData,
  } = useGet(apiUrl, { enabled: Boolean(apiUrl), cacheTime: 0 });

  // Set the API URL whenever the page changes
  useEffect(() => {
    getApiBaseUrl();
  }, []);

  const getApiBaseUrl = () => {
    setApiUrl(`${CANCEL_SALES_LIST}page=${page - 1}&size=${LIMIT}`);
  };

  const handleCancel = (row) => {
    setSaleId(row.saleId);
    setModalOpen(true);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setFlag(true);
  };

  const handleSubmit = () => {
    if (!remarks) {
      toast.error("Remarks Are Required.");
      return;
    }
    mutateUpdate();
  };

  const { isPending, mutate: mutateUpdate } = usePut(
    `${CANCEL_SALE}${saleId}&remark=${remarks}&loginId=${userId}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getCancelSaleData();
          setModalOpen(false);
          setRemarks("");
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handleShowData = () => {
    setPage(1);
    let url = `${CANCEL_SALES_LIST}page=${page - 1}&size=${LIMIT}`;

    // Only append key and value if searchText exists
    if (searchText) {
      url += `&key=${searchByGroupSelect?.value}&value=${searchText}`;
    }

    setApiUrl(url);
  };

  const handlePaginationData = () => {
    let url = `${CANCEL_SALES_LIST}page=${page - 1}&size=${LIMIT}`;

    // Only append key and value if searchText exists
    if (searchText) {
      url += `&key=${searchByGroupSelect?.value}&value=${searchText}`;
    }

    setApiUrl(url);
  };

  useEffect(() => {
    if (flag) {
      handlePaginationData();
    }
  }, [page]);

  const handleClearData = () => {
    setSearchByGroupSelect(null);
    setSearchText("");
    getApiBaseUrl();
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (row, index) => index + 1,
      width: "4%",
    },
    {
      name: <span className="font-weight-bold fs-13">Cancel</span>,
      cell: (row) => (
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleCancel(row)}
        >
          Cancel
        </button>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Unique ID</span>,
      selector: (row) => row.saleId,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Main Team</span>,
      selector: (row) => row.mainTeam,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Sub Team</span>,
      selector: (row) => row.subTeam,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.subTeam}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Id</span>,
      selector: (row) => row.assoId,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.assoId}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Name</span>,
      selector: (row) => row.assoName,
      sortable: true,
      width: "10%",
      cell: (row) => <WordWrapCell>{row.assoName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Prospect Id</span>,
      selector: (row) => row.prospectId,
      width: "12%",
      sortable: true,
      cell: (row) => <WordWrapCell>{row.prospectId}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Booking Date</span>,
      selector: (row) => formatDate(row.bookingDate),
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDate(row.bookingDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Location</span>,
      selector: (row) => row.location,
      sortable: true,
      width: "10%",
      cell: (row) => <WordWrapCell>{row.location}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Builder Name</span>,
      selector: (row) => row.builderName,
      sortable: true,
      width: "10%",
      cell: (row) => <WordWrapCell>  {row.builderName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Project Name</span>,
      selector: (row) => row.projectName,
      sortable: true,
      width: "10%",
      cell: (row) => <WordWrapCell> {row.projectName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Client Name</span>,
      selector: (row) => row.clientName,
      sortable: true,
      width: "12%",
      cell: (row) => <WordWrapCell> {row.clientName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Unit No</span>,
      selector: (row) => row.unitNo,
      sortable: true,
      width: "10%",
      cell: (row) => <WordWrapCell> {row.unitNo}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Tower Block</span>,
      selector: (row) => row.towerblock,
      sortable: true,
      cell: (row) => <WordWrapCell> {row.towerblock}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Floor</span>,
      selector: (row) => row.floor,
      sortable: true,
      cell: (row) => <WordWrapCell> {row.floor}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Area</span>,
      selector: (row) => row.area,
      sortable: true,
      cell: (row) => <WordWrapCell> {row.area}</WordWrapCell>
    },
  ];

  const sortByTypeGroup = [
    { label: "Client Name", value: "clientName" },
    { label: "Unique ID", value: "saleId" },
  ];

  return (
    <PageContent>
      {(isPending || isLoading) && <ScreenLoader />}
      <Breadcrumbs title="Security" breadcrumbItem="Cancel Sales" />
      <Container fluid={true}>
        <form>
          <Card>
            <CardBody>
              <Row>
                <Col lg="4 mt-1">
                  <h6 className="font-size-11">Search By</h6>
                  <Select
                    isClearable
                    style={{ zIndex: 9999 }}
                    menuPortalTarget={document.body}
                    value={searchByGroupSelect}
                    onChange={setSearchByGroupSelect}
                    options={sortByTypeGroup}
                  />
                </Col>
                <Col lg="4 mt-1">
                  <h6 className="font-size-12">Search</h6>
                  <Input
                    type="text"
                    placeholder="Type to search..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
                <Col lg="auto" className="mt-4">
                  <div className="d-flex align-items-center">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleShowData}
                    >
                      Show Data
                    </button>

                    <Button
                      type="button"
                      className="btn btn-secondary ms-3"
                      onClick={() => handleClearData()}
                    >
                      Clear
                    </Button>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>
        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={
            Array.isArray(cancelSaleList?.data?.data?.content)
              ? cancelSaleList?.data?.data?.content
              : []
          }
          pagination
          paginationTotalRows={cancelSaleList?.data?.data?.totalElements}
          paginationServer
          onChangePage={handlePageChange}
        />
      </Container>

      {/* Modal for Cancel Remarks */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
        <ModalHeader toggle={() => setModalOpen(false)}>
          Cancel Remarks
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <h6 className="font-size-12">
              Enter Remarks <RequiredStar />
            </h6>
            <textarea
              rows={4}
              className="form-control"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter your remarks here..."
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            style={{ backgroundColor: defaultTheme.primary }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
          <Button
            color="secondary"
            style={{ backgroundColor: defaultTheme.goldColorLogo }}
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </PageContent>
  );
}
