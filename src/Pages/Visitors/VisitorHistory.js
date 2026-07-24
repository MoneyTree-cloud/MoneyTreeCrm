/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody, Modal, ModalHeader, ModalBody, ModalFooter, Label } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, formatDateTime, generateTimestamp, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import { CUSTOMER_VISIT_EXCEL, GET_ALL_CUSTOMER_VISIT_DATA, UPDATE_VISITOR } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { MdMobileFriendly, MdEdit } from "react-icons/md";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import { decryptData } from "../../components/Common/CryptoUtils";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import ImageModal from "../../components/Common/ImageModal";
import Select from "react-select";
import { GET_ALL_USERS_DROPDOWN } from "../../helpers/url_helper";

const VISITOR_TYPE_OPTIONS = ['Client', 'Visitor', 'Interview', '1st Day Of Joining', 'Vendor']

const VisitorHistory = () => {
  const LIMIT = 100;
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customerData, setCustomerData] = useState([]);
  const [accessGranted, setAccessGranted] = useState(null);
  const { userId, empCode } = useUserStore((state) => state.user) || {};
  const [isPending, setIsPending] = useState(false);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [userOptions, setUserOptions] = useState([]);

  // ── Update modal state ───────────────────────────────────────────────────
  const [updateModal, setUpdateModal] = useState({ open: false, row: null });
  const [updateForm, setUpdateForm] = useState({
    name: '', mobileNo: '', address: '', city: '',
    visitorType: '', purpose: '', remarks: '', visitorCardNumber: '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'visitor-history');
      setAccessGranted(hasAccess);
      if (hasAccess) getInitialData();
    };
    checkAccess();
  }, [userId]);

  // ── Fetch via ApiClient.get + .then/.catch ───────────────────────────────
  const fetchData = (from, to, offset) => {
    setIsPending(true);
    ApiClient.get(`${GET_ALL_CUSTOMER_VISIT_DATA}${from}&todate=${to}&offset=${offset}&limit=${LIMIT}`)
      .then((response) => {
        setIsPending(false);
        if (response?.data?.status === 1) {
          decryptData(response.data.data).then((decryptedData) => {
            setCustomerData(decryptedData || []);
          });
        } else {
          setCustomerData([]);
          toast.error(response?.data?.message || 'Failed to load');
        }
      })
      .catch((error) => {
        setIsPending(false);
        setCustomerData([]);
        toast.error(error.message);
      });
  };

  const loadUsersDropdown = () => {
    ApiClient.get(GET_ALL_USERS_DROPDOWN)
      .then((response) => {
        if (response?.data?.status === 1) {
          const data = response?.data?.data || [];

          const options = data.map((item) => ({
            label: item.label,
            value: item.value,
          }));

          setUserOptions(options);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    loadUsersDropdown();
  }, []);

  const getInitialData = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const from = formatDateForInput(startOfMonth);
    const to = formatDateForInput(endOfMonth);
    setFromDate(from);
    setToDate(to);
    setPage(1);
    fetchData(from, to, 0);
  };

  const handleShowButton = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData(fromDate, toDate, 0);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchData(fromDate, toDate, newPage - 1);
  };

  const profileStyle = {
    width: "35px", height: "35px", objectFit: "cover", cursor: "pointer",
    borderRadius: "50%", border: `2px solid ${defaultTheme.goldColorLogo}`, padding: "2px",
  };

  const handleViewFile = (fileName) => {
    const fileExtension = fileName?.split(".").pop().toLowerCase();
    const fileUrl = imageBaseUrl + fileName;
    if ((fileExtension === "heic" || fileExtension === 'msg')) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setCurrentImage(fileUrl);
      setFileModalOpen(true);
    }
  };

  // ── Update modal handlers ────────────────────────────────────────────────
  const openUpdateModal = (row) => {
    const selectedAssociate =
      userOptions.find(
        (item) => Number(item.value) === Number(row.associateId)
      ) || null;

    setUpdateForm({
      name: row.name || '',
      mobileNo: row.mobileNo || '',
      address: row.address || '',
      city: row.city || row.entryCity || '',
      visitorType: row.visitorType || '',
      purpose: row.purpose || '',
      remarks: row.remarks || '',
      visitorCardNumber: row.visitorCardNumber || '',
      associate: selectedAssociate,
    });

    setUpdateModal({ open: true, row });
  };

  useEffect(() => {
    if (
      updateModal.open &&
      updateModal.row &&
      userOptions.length &&
      !updateForm.associate
    ) {
      const selectedAssociate =
        userOptions.find(
          (item) =>
            Number(item.value) === Number(updateModal.row.associateId)
        ) || null;

      setUpdateForm((prev) => ({
        ...prev,
        associate: selectedAssociate,
      }));
    }
  }, [userOptions, updateModal]);

  const closeUpdateModal = () => {
    if (updating) return;
    setUpdateModal({ open: false, row: null });
    setUpdateForm({
      name: '',
      mobileNo: '',
      address: '',
      city: '',
      visitorType: '',
      purpose: '',
      remarks: '',
      visitorCardNumber: '',
      associate: null,
    });
  };

  const handleFormField = (key, val) => setUpdateForm((p) => ({ ...p, [key]: val }));

  const handleUpdate = () => {
    const row = updateModal.row;
    if (!row) return;

    if (!updateForm.name?.trim()) return toast.error('Name is required');
    if (!updateForm.mobileNo?.trim()) return toast.error('Mobile number is required');
    if (!updateForm.visitorType?.trim()) return toast.error('Visitor type is required');
    if (!updateForm.purpose?.trim()) return toast.error('Purpose is required');

    if (!window.confirm('Update visitor details?')) return;

    setUpdating(true);
    const params = new URLSearchParams({
      name: updateForm.name.trim(),
      mobileNo: updateForm.mobileNo.trim(),
      address: updateForm.address.trim(),
      city: updateForm.city.trim(),
      toWhomId: updateForm.associate?.value || '',
      visitorType: updateForm.visitorType.trim(),
      purpose: updateForm.purpose.trim(),
      remarks: updateForm.remarks.trim(),
      createdBy: empCode || '',
      loginId: userId || '',
      id: row.visitId,
      visitorCardNumber: updateForm.visitorCardNumber.trim(),
    });

    ApiClient.post(`${UPDATE_VISITOR}?${params.toString()}`)
      .then((response) => {
        setUpdating(false);
        if (response?.data?.status === 1) {
          toast.success(response.data.message || 'Visitor updated');
          closeUpdateModal();
          fetchData(fromDate, toDate, page - 1);   // refresh current page
        } else {
          toast.error(response?.data?.message || 'Failed to update');
        }
      })
      .catch((error) => {
        setUpdating(false);
        toast.error(error.message || 'Network error');
      });
  };

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      width: "80px",
      cell: (row) => (
        <button
          onClick={() => openUpdateModal(row)}
          title="Update visitor details"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${defaultTheme.primary}1A`,
            color: defaultTheme.primary,
            border: `1px solid ${defaultTheme.primary}40`,
            borderRadius: 7,
            cursor: 'pointer',
            transition: 'background .15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = `${defaultTheme.primary}30`}
          onMouseLeave={(e) => e.currentTarget.style.background = `${defaultTheme.primary}1A`}
        >
          <MdEdit size={15} />
        </button>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Photo</span>,
      selector: (r) => r?.visitorPhoto,
      cell: (r) => r?.visitorPhoto ? (
        <img src={imageBaseUrl + r.visitorPhoto} alt="Profile" style={profileStyle}
          onClick={() => handleViewFile(r.visitorPhoto)} />
      ) : (
        <span style={{ color: "#999", fontSize: 12 }}>No file</span>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Details</span>,
      selector: (row) => row.associateCode, sortable: true, width: "15%",
      cell: (row) => <WordWrapCell>{`${row.associateName} (${row.associateCode})`}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Name</span>,
      selector: (row) => row.name, sortable: true, width: "15%",
      cell: (row) => <WordWrapCell>{row.name}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Created By</span>,
      selector: (row) => row.createdBy, sortable: true, width: "15%",
      cell: (row) => <WordWrapCell>{row.createdBy}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Mobile No.</span>,
      width: "10%", selector: (row) => row.mobileNo,
      cell: (row) => (
        <div className="phone-container">
          <MdMobileFriendly className="phone-icon" color={defaultTheme.goldColorLogo} />
          <span className="phone-number">{row.mobileNo}</span>
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Address</span>,
      selector: (row) => row.address, sortable: true, width: "20%",
      cell: (row) => <WordWrapCell>{row.address}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Type</span>,
      selector: (row) => row.visitorType, width: "12%", sortable: true,
      cell: (row) => <WordWrapCell>{row.visitorType}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Purpose</span>,
      selector: (row) => row.purpose, sortable: true,
      cell: (row) => <WordWrapCell>{row.purpose}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Card No.</span>,
      selector: (row) => row.visitorCardNumber, sortable: true, width: "10%",
      cell: (row) => <WordWrapCell>{row.visitorCardNumber || '-'}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Token</span>,
      selector: (r) => r.token,
      sortable: true,
      cell: (r) => <WordWrapCell>{r.token || '-'}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">In Date & Time</span>,
      selector: (row) => formatDateTime(row.createDate), sortable: true, width: "15%",
      cell: (row) => <WordWrapCell>{formatDateTime(row.createDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Out Date & Time</span>,
      selector: (row) => formatDateTime(row.visitorOutTime), sortable: true, width: "15%",
      cell: (row) => <WordWrapCell>{formatDateTime(row.visitorOutTime) || '-'}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      selector: (row) => row.remarks, width: "15%", sortable: true,
      cell: (row) => <WordWrapCell>{row.remarks || '-'}</WordWrapCell>,
    },
  ], []);

  const totalRecords = useMemo(() => customerData?.totalElements || 0, [customerData]);

  const downloadExcel = () => {
    setIsPending(true);
    ApiClient.get(`${CUSTOMER_VISIT_EXCEL}?fromDate=${fromDate}&toDate=${toDate}`, { responseType: "arraybuffer" })
      .then((response) => {
        setIsPending(false);
        const contentType = response.headers["content-type"];
        if (contentType !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
          const errorResponse = new TextDecoder("utf-8").decode(new Uint8Array(response.data));
          const parsedError = JSON.parse(errorResponse);
          toast.error(parsedError.message || "Something went wrong!");
          return;
        }
        const blob = new Blob([response.data], { type: contentType });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `customer_visit_details_${generateTimestamp()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        setIsPending(false);
        toast.error(error.message || "An unexpected error occurred.");
      });
  };

  if (accessGranted === null) return <ScreenLoader />;
  if (!accessGranted) return <PermissionMissing />;

  const row = updateModal.row;

  return (
    <PageContent>
      <Breadcrumbs title="Visitor" breadcrumbItem="History" />
      {isPending && <ScreenLoader />}

      <Container fluid>
        <Card>
          <CardBody>
            <form onSubmit={handleShowButton}>
              <Row className="g-2">
                <Col md="4">
                  <h6 className="font-size-11">From Date</h6>
                  <input className="form-control" type="date" value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)} />
                </Col>
                <Col md="4">
                  <h6 className="font-size-11">To Date</h6>
                  <input className="form-control" type="date" value={toDate}
                    onChange={(e) => setToDate(e.target.value)} />
                </Col>
                <Col md="4" className="d-flex align-items-end justify-content-start">
                  <Button color="primary" onClick={handleShowButton} type="submit" className="me-2">Show</Button>
                  <Button color="secondary" onClick={getInitialData} type="reset">Reset</Button>
                </Col>
              </Row>
            </form>
          </CardBody>
        </Card>

        {customerData?.content?.length > 0 && (
          <i className="fas fa-file-excel"
            style={{ color: defaultTheme.primary, cursor: "pointer", fontSize: "16px", marginBottom: 10 }}
            onClick={downloadExcel} />
        )}

        <AppTable
          progressPending={isPending}
          columns={columns}
          data={customerData?.content || []}
          paginationTotalRows={totalRecords}
          paginationServer
          onChangePage={handlePageChange}
          pagination
        />

        <ImageModal
          isOpen={fileModalOpen}
          toggle={() => setFileModalOpen(!fileModalOpen)}
          imageSrc={currentImage}
        />

        {/* ══ Update Modal ═══════════════════════════════════════════════════ */}
        <Modal isOpen={updateModal.open} toggle={closeUpdateModal} centered size="lg"
          backdrop="static" keyboard={!updating}>
          <ModalHeader toggle={closeUpdateModal}>
            <MdEdit style={{ marginRight: 8, color: defaultTheme.primary }} />
            Update Visitor
            {row?.visitId && (
              <span style={{ marginLeft: 10, fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                · Visit #{row.visitId}
              </span>
            )}
          </ModalHeader>
          <ModalBody>
            {row && (
              <>
                {/* Read-only context strip */}
                <div style={{
                  background: '#F8FAFC', border: '1px solid #E2E8F0',
                  borderRadius: 9, padding: '10px 12px', marginBottom: 14,
                  fontSize: 12, color: '#475569',
                }}>
                  <Row className="g-2">
                    <Col md="6">
                      <Label className="form-label">
                        Associate <RequiredStar />
                      </Label>

                      <Select
                        options={userOptions}
                        value={updateForm.associate}
                        onChange={(selected) =>
                          handleFormField("associate", selected)
                        }
                        placeholder="Select Associate"
                        isClearable
                      />
                    </Col>
                    <Col md="6">
                      <div style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Entry Time</div>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>
                        {formatDateTime(row.createDate)}
                      </div>
                    </Col>
                  </Row>
                </div>

                <Row className="g-3">
                  <Col md="6">
                    <Label className="form-label">Name <RequiredStar /></Label>
                    <input className="form-control" value={updateForm.name}
                      onChange={(e) => handleFormField('name', e.target.value)}
                      placeholder="Visitor name" />
                  </Col>
                  <Col md="6">
                    <Label className="form-label">Mobile Number <RequiredStar /></Label>
                    <input className="form-control" type="tel" value={updateForm.mobileNo}
                      onChange={(e) => handleFormField('mobileNo', e.target.value)}
                      placeholder="10-digit mobile" maxLength={15} />
                  </Col>
                  <Col md="8">
                    <Label className="form-label">Address</Label>
                    <input className="form-control" value={updateForm.address}
                      onChange={(e) => handleFormField('address', e.target.value)}
                      placeholder="Visitor's address" />
                  </Col>
                  <Col md="4">
                    <Label className="form-label">City</Label>
                    <input className="form-control" value={updateForm.city}
                      onChange={(e) => handleFormField('city', e.target.value)}
                      placeholder="City" />
                  </Col>
                  <Col md="4">
                    <Label className="form-label">Visitor Type <RequiredStar /></Label>
                    <select className="form-control" value={updateForm.visitorType}
                      onChange={(e) => handleFormField('visitorType', e.target.value)}>
                      <option value="">Select type…</option>
                      {VISITOR_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </Col>
                  <Col md="4">
                    <Label className="form-label">Purpose <RequiredStar /></Label>
                    <input className="form-control" value={updateForm.purpose}
                      onChange={(e) => handleFormField('purpose', e.target.value)}
                      placeholder="Reason for visit" />
                  </Col>
                  <Col md="4">
                    <Label className="form-label">Card Number</Label>
                    <input className="form-control" value={updateForm.visitorCardNumber}
                      onChange={(e) => handleFormField('visitorCardNumber', e.target.value)}
                      placeholder="Visitor card #" />
                  </Col>
                  <Col md="12">
                    <Label className="form-label">Remarks</Label>
                    <textarea className="form-control" rows={3} maxLength={500}
                      value={updateForm.remarks}
                      onChange={(e) => handleFormField('remarks', e.target.value)}
                      placeholder="Any additional notes…" />
                  </Col>
                </Row>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={closeUpdateModal} disabled={updating}
              style={{ backgroundColor: defaultTheme.goldColorLogo, border: 'none' }}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleUpdate} disabled={updating}
              style={{ backgroundColor: defaultTheme.primary, border: 'none' }}>
              {updating ? 'Updating…' : 'Save Changes'}
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </PageContent>
  );
};

export default VisitorHistory;