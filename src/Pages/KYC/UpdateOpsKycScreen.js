/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Row, Col, Card, CardBody, FormGroup, Container, Input, Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";
import { useGet, usePost } from "../../Hooks/useApi";
import { GET_COSTING_BY_PROJECT_UNITID, SHOW_UPLOADED_FILE, UPDATE_OPS_BOOKING } from "../../helpers/url_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { FaCheck, FaFilePdf, FaTimes } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import { imageBaseUrl } from "../../helpers/api_helper";
import ImageModal from "../../components/Common/ImageModal";

const UpdateOpsKycScreen = () => {
  const location = useLocation();
  const userId = useUserStore((state) => state.user.userId);
  const { rowData, formState, taskType } = location.state || {};
  const [fileList, setFileList] = useState();
  const [currentImage, setCurrentImage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remarks, setRemarks] = useState('')
  const [status, setStatus] = useState('')

  const navigation = useNavigate();
  const [formData, setFormData] = useState({
    specialDiscount: "",
    interiorAmount: "",
    finalCost: "",
  });

  const toggleModal = () => setModalOpen(!modalOpen);

  useEffect(() => {
    mutateGet()
    if (Object.keys(rowData).length > 0 && taskType !== "Completed") {
      setFormData((prevState) => ({
        ...prevState,
        specialDiscount: rowData?.rowData?.specialDiscount,
        interiorAmount: rowData?.rowData?.interiorAmount,
      }));
    }
    else {
      setFormData({
        specialDiscount: rowData?.rowData?.specialDiscount,
        interiorAmount: rowData?.rowData?.interiorAmount,
        finalCost: rowData?.rowData?.finalCost,
      });
    }
  }, [rowData]);

  // Handle change in form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const { data: costingData } = useGet(
    `${GET_COSTING_BY_PROJECT_UNITID}=${rowData?.rowData?.unitId}`,
    { enabled: Boolean(rowData?.rowData?.unitId) }
  );

  const consting_Data = costingData?.data?.data
  const netCost = (parseFloat(consting_Data?.netBspArea) + parseFloat(consting_Data?.totalOtherCharge)) || 0; // Ensure netCost is a number

  const { isPending: updateLoading, mutate: mutateUpdate } = usePost(
    `${UPDATE_OPS_BOOKING}${rowData?.rowData?.saleId}&loginId=${userId}&interiorAmount=${formData?.interiorAmount}&specialDiscount=${formData?.specialDiscount}&finalCost=${formData?.finalCost}&status=${status}&rejectRemarks=${remarks}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          handleBack();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handleBack = () => {
    navigation("/ops-kyc", {
      state: { formState_: formState, taskType_: taskType },
    });
  };

  const handleSave = (status) => {
    setStatus(status)
    // Check if the interiorAmount is undefined, null, or an empty string
    if (formData.interiorAmount === undefined || formData.interiorAmount === null || formData.interiorAmount === '') {
      toast.error("Please Enter Interior Amount");
    } else if (formData.specialDiscount === undefined || formData.specialDiscount === null || formData.specialDiscount === '') {
      toast.error("Please Enter Special Discount");
    } else if (!formData.finalCost) {
      toast.error("Please Fill Mandatory Fields");
    } else if ((status === 'NO' && !remarks)) {
      toast.error('Please Enter Rejection Reason')
    }
    else {
      setIsModalOpen(true)
    }
  };

  const handleCalculateCostOnBlur = () => {
    const interiorAmount = parseFloat(formData.interiorAmount) || 0; // Ensure interiorAmount is a number
    const specialDiscount = parseFloat(formData.specialDiscount) || 0; // Ensure specialSpecial Discount is a number

    const finalCost = Math.round(netCost + interiorAmount - specialDiscount);

    setFormData((prevFormData) => ({
      ...prevFormData,
      finalCost: finalCost,
    }));
  };

  const { isPending: getLoading, mutate: mutateGet } = usePost(
    SHOW_UPLOADED_FILE + rowData?.rowData?.saleId,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          const data = response?.data?.data
          if (data?.length > 0) {
            setFileList(data[0]?.fileName);

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

  const handleViewFile = () => {
    if (fileList) {
      const fileExtension = fileList?.split(".")?.pop()?.toLowerCase();
      const fileUrl = imageBaseUrl + fileList;

      if (fileExtension === "pdf") {
        // Open PDF in a new window
        window.open(fileUrl, "_blank");
      }
      else if ((fileExtension === "heic" || fileExtension === 'msg')) {
        // Trigger download for HEIC files
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileList; // Specify the filename for the download
        document.body.appendChild(link); // Append the link to the DOM
        link.click(); // Simulate a click to start the download
        document.body.removeChild(link); // Clean up by removing the link
      }
      else {
        // Set the image source and open modal for images
        setCurrentImage(fileUrl);
        toggleModal();
      }
    }
    else {
      toast.error('No File Exists.')
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleConfirm = () => {
    mutateUpdate()
  }

  return (
    <PageContent>
      <Container fluid={true}>
        {(updateLoading || getLoading) && <ScreenLoader />}
        <Breadcrumbs title="KYC" breadcrumbItem="Update Ops KYC" />
        <Card>
          <CardBody>

            <Row>
              {/* === Associate & Property Details Section === */}
              <Col md={12}>
                <h5 className="mb-3 border-bottom pb-2">Associate & Property Details</h5>
              </Col>

              <Col md={4}>
                <p><strong>Associate:</strong> {rowData?.rowData?.associateName || "N/A"}</p>
              </Col>
              <Col md={4}>
                <p><strong>Unique ID:</strong> {rowData?.rowData?.saleId || "N/A"}</p>
              </Col>
              <Col md={4}>
                <p><strong>Unit No:</strong> {rowData?.rowData?.unitNo || "N/A"}</p>
              </Col>
              <Col md={4}>
                <p><strong>Area:</strong> {consting_Data?.area || "N/A"}</p>
              </Col>
              <Col md={4}>
                <p><strong>Tower/Block:</strong> {consting_Data?.towerBlock || "N/A"}</p>
              </Col>
              <Col md={4}>
                <p><strong>Floor:</strong> {consting_Data?.floor || "N/A"}</p>
              </Col>

              {/* === Builder & Customer Section === */}
              <Col md={12}>
                <h5 className="mt-4 mb-3 border-bottom pb-2">Builder & Customer Details</h5>
              </Col>

              <Col md={4}>
                <p><strong>Builder Name:</strong> {rowData?.rowData?.builderName || "N/A"}</p>
              </Col>
              <Col md={4}>
                <p><strong>Project Name:</strong> {rowData?.rowData?.projectName || "N/A"}</p>
              </Col>
              <Col md={4}>
                <p><strong>Customer Name:</strong> {rowData?.rowData?.clientName || "N/A"}</p>
              </Col>
              <Col md={4}>
                <p><strong>Customer Email:</strong> {rowData?.rowData?.clientEmail1 || "N/A"}</p>
              </Col>
              <Col md={8}>
                <p><strong>Customer Address:</strong> {rowData?.rowData?.clientAddress || "N/A"}</p>
              </Col>

              <Col md={12}>
                <h5 className="mt-4 mb-3 border-bottom pb-2">Costing Details</h5>
              </Col>

              <Col md={4} className="mt-4">
                <p><strong>Total Cost:</strong> {Math.round(netCost) || "N/A"}</p>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <label className="form-label font-size-11">
                    Interior Amount <span className="text-danger">*</span>
                  </label>
                  <Input
                    name="interiorAmount"
                    placeholder="Enter Interior Amount..."
                    type="number"
                    onChange={handleChange}
                    onBlur={handleCalculateCostOnBlur}
                    className="form-control"
                    value={formData?.interiorAmount}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <label className="form-label font-size-11">
                    Special Discount <span className="text-danger">*</span>
                  </label>
                  <Input
                    name="specialDiscount"
                    placeholder="Enter Special Discount..."
                    type="number"
                    onChange={handleChange}
                    onBlur={handleCalculateCostOnBlur}
                    className="form-control"
                    value={formData?.specialDiscount}
                  />
                </FormGroup>
              </Col>
              <Col md={4} className="mt-5">
                <p><strong>Final Cost:</strong> {formData.finalCost || "N/A"}</p>
              </Col>

              {/* === Remarks & File === */}
              <Col md={6}>
                <FormGroup>
                  <label className="form-label font-size-11">Remarks</label>
                  <textarea
                    name="remarks"
                    value={remarks}
                    className="form-control"
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={4}
                    placeholder="Enter remarks"
                  />
                </FormGroup>
              </Col>

              <Col md={2} className="mt-5">
                <p><strong>Booking Form:</strong>  <FaFilePdf
                  size={25}
                  onClick={() => handleViewFile()}
                  style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                /></p>
              </Col>
            </Row>


            <Col className="d-flex justify-content-center align-items-center">
              <FormGroup className="mt-4">
                <div>
                  {taskType !== "Completed" && (
                    <FaCheck
                      style={{
                        cursor: "pointer",
                        color: defaultTheme.primary,
                        marginRight: "20px",
                      }}
                      size={25}
                      onClick={() => handleSave('YES')}
                    />
                  )}
                  {taskType !== "Completed" && (
                    <FaTimes
                      style={{
                        cursor: "pointer",
                        color: defaultTheme.redColor,
                        marginRight: "20px",
                      }}
                      size={25}
                      onClick={() => handleSave('NO')}
                    />
                  )}
                  <MdArrowBack
                    style={{
                      cursor: "pointer",
                      color: defaultTheme.goldColorLogo,
                    }}
                    size={25}
                    onClick={handleBack}
                  />
                </div>
              </FormGroup>
            </Col>
          </CardBody>
        </Card>

        <ImageModal
          isOpen={modalOpen}
          toggle={toggleModal}
          imageSrc={currentImage}
        />
      </Container>

      <Modal isOpen={isModalOpen} toggle={handleCloseModal}>
        <ModalHeader toggle={handleCloseModal}>
          Confirm {status === "YES" ? "Approve" : "Rejection"}
        </ModalHeader>
        <ModalBody>Are you sure you want to {status === "YES" ? "approve" : "reject"}?</ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            style={{ backgroundColor: defaultTheme.primary }}
            onClick={() => handleConfirm()}
          >
            Yes
          </Button>
          <Button
            color="primary"
            style={{ backgroundColor: defaultTheme.goldColorLogo }}
            onClick={handleCloseModal}
          >
            No
          </Button>
        </ModalFooter>
      </Modal>
    </PageContent>
  );
};

export default UpdateOpsKycScreen;

