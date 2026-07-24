import { Button, Container, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { useGet, usePost } from "../../Hooks/useApi";
import { ASSIGN_ENQUIRY_REPLY, GET_ASSIGN_ENQUIRY_BY_ID } from "../../helpers/url_helper";
import AppTable from "../../components/Common/Table";
import React, { useState } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import ScreenLoader from "../../constants/ScreenLoader";
import { MdEmail, MdMobileFriendly } from "react-icons/md";
import { defaultTheme } from "../../helpers/defaultTheme";
import { formatActionType, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import "../CSS/styles.css";

const EnquiryReplyScreen = () => {
  const userId = useUserStore((state) => state.user.userId);
  const [enquiryId, setEnquiryId] = useState("");
  const [remarksState, setRemarksState] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: enquiryList, isLoading, refetch: getListData, } = useGet(GET_ASSIGN_ENQUIRY_BY_ID + userId);

  const handleRemarksSend = (id) => {
    setEnquiryId(id);
    setIsModalOpen(true);
  };

  const { isPending, mutate } = usePost(
    `${ASSIGN_ENQUIRY_REPLY}${userId}&remark=${remarksState[enquiryId]}&enquiryId=${enquiryId}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          setEnquiryId("");
          setRemarksState({});
          getListData();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const confirmStatusChange = () => {
    setIsModalOpen(false);
    if (enquiryId && remarksState[enquiryId]) {
      mutate();
    }
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      sortable: true,
      width: "5%",
      cell: (_, index) => <WordWrapCell>{index + 1}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Enquiry Date & Time</span>,
      selector: (row) => row.enquiryDate,
      width: "20%",
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.enquiryDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Name</span>,
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.name}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Mobile No.</span>,
      selector: (row) => row.mobileNumber,
      sortable: true,
      cell: (row) => (
        <div className="phone-container">
          <MdMobileFriendly
            className="phone-icon"
            color={defaultTheme.goldColorLogo}
          />
          <span className="phone-number">{row.mobileNumber}</span>
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Email ID</span>,
      selector: (row) => row.email,
      sortable: true,
      cell: (row) =>
        row.email ? (
          <div className="phone-container">
            <MdEmail
              className="phone-icon"
              color={defaultTheme.goldColorLogo}
            />
            <span className="phone-number">{row.email}</span>
          </div>
        ) : null,
    },
    {
      name: <span className="font-weight-bold fs-13">Assigned By</span>,
      selector: (row) => row.assignByName + " (" + row.assignBy + ")",
      sortable: true,
      cell: (row) => <WordWrapCell>{row.assignByName + " (" + row.assignBy + ")"}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Other Enquiry Options</span>,
      selector: (row) => row.otherEnquiryOption,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{formatActionType(row.otherEnquiryOption)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Property Options</span>,
      selector: (row) => row.enquiryOption,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{formatActionType(row.enquiryOption)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      selector: (row) => row.remarks,
      sortable: true,
      width: "20%",
      cell: (row) => <WordWrapCell>{row.remarks}</WordWrapCell>,
    },

    {
      name: <span className="font-weight-bold fs-13">Assign Remarks</span>,
      selector: (row) => row.assignToRemark,
      sortable: true,
      width: "20%",
      cell: (row) => <WordWrapCell>{row.assignToRemark}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Enter Assign Remarks</span>,
      width: "35%",
      cell: (row) => (
        <div className="d-flex align-items-center" style={{ width: "100%" }}>
          <textarea
            name="assignRemarks"
            type="text"
            value={remarksState[row.id] || ""}
            className="form-control"
            placeholder="Enter Remarks..."
            onChange={(e) => handleRemarkChange(e, row.id)}
          />
          <button
            type="button"
            className={"btn btn-primary btn-sm ms-2"}
            onClick={() => handleRemarksSend(row.id)}
          >
            Submit
          </button>
        </div>
      ),
      sortable: false,
    },
  ];

  const handleRemarkChange = (e, rowId) => {
    const updatedRemarks = e.target.value;
    setRemarksState((prevState) => ({
      ...prevState,
      [rowId]: updatedRemarks, // Update the specific remark for this row
    }));
  };

  return (
    <PageContent>
      <Container fluid={true}>
        <Breadcrumbs title="Enquiry" breadcrumbItem="Enquiry Details" />
        {(isLoading || isPending) && <ScreenLoader />}
        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={
            Array.isArray(enquiryList?.data?.data)
              ? enquiryList?.data?.data
              : []
          }
          pagination
        />
      </Container>

      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(!isModalOpen)}>
        <ModalHeader toggle={() => setIsModalOpen(!isModalOpen)}>
          Confirm Assign
        </ModalHeader>
        <ModalBody>Are you sure you want to submit?</ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            style={{ backgroundColor: defaultTheme.goldColorLogo }}
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            style={{ backgroundColor: defaultTheme.primary }}
            onClick={confirmStatusChange}
          >
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </PageContent>
  );
};

export default EnquiryReplyScreen;