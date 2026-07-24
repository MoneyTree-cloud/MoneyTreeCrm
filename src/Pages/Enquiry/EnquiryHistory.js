import React, { useEffect, useState } from "react";
import { Button, Container, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { useGet, usePost } from "../../Hooks/useApi";
import { ASSIGN_ENQUIRY, DELETE_ENQUIRY_BY_ID, GET_ALL_USERS_DROPDOWN, GET_NEW_ENQUIRY_BY_ID } from "../../helpers/url_helper";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import ScreenLoader from "../../constants/ScreenLoader";
import { MdDelete, MdEmail, MdMobileFriendly } from "react-icons/md";
import "../CSS/styles.css";
import { defaultTheme } from "../../helpers/defaultTheme";
import { calculateAging, formatActionType, formatDateTime, generateTimestamp, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import * as XLSX from "xlsx";
import Select from 'react-select';
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

const EnquiryHistory = () => {
  const LIMIT = 100;
  const [page, setPage] = useState(1);
  const userId = useUserStore((state) => state.user.userId);
  const [enquiryId, setEnquiryId] = useState("");
  const empCode = useUserStore((state) => state.user.empCode);
  const [assignToId, setAssignToId] = useState("");
  const [assignToValues, setAssignToValues] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enquiryType, setEnquiryType] = useState("Pending");
  const [selectedId, setSelectedId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accessGranted, setAccessGranted] = useState(null);
  const [enquiryList, setEnquiryList] = useState([]);
  const { data: allUsersList } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: !!accessGranted })
  const { data, isLoading, refetch: getEnquires } = useGet(`${GET_NEW_ENQUIRY_BY_ID}${empCode}&offset=${page - 1}&limit=${LIMIT}&assigned=${enquiryType === "Pending" ? false : true}`, { enabled: !!accessGranted });

  useEffect(() => {
    if (data?.data?.status === 1) {
      decryptData(data?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setEnquiryList(decryptedData);
        } else {
          setEnquiryList([]);
        }
      });
    }
  }, [data]);

  const handleStatusChange = (row, selectedOption) => {
    const id = selectedOption ? selectedOption.value : '';
    setAssignToValues((prevState) => ({
      ...prevState,
      [row.id]: id,
    }));
    setEnquiryId(row.id);
    setAssignToId(id);
    setIsModalOpen(true);
  };

  const { isPending, mutate } = usePost(
    `${ASSIGN_ENQUIRY}${assignToId}&assignBy=${userId}&enquiryId=${enquiryId}`,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getEnquires();
          setAssignToValues({})
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
    if (enquiryId && assignToId) {
      mutate();
    }
  };

  const { isPending: isPendingDelete, mutate: mutateDelete } = usePost(
    DELETE_ENQUIRY_BY_ID + selectedId,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getEnquires();
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Add your delete logic here, using selectedId
    setIsDeleteModalOpen(false);
    mutateDelete();
  };

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false);
  };

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      sortable: true,
      width: "5%",
      cell: (_, index) => <WordWrapCell>{index + 1}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Enquiry Date & Time</span>,
      selector: (row) => row.enquiryDate,
      width: "16%",
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.enquiryDate)}</WordWrapCell>
    },
    enquiryType !== "Others" && {
      name: <span className="font-weight-bold fs-13">Pending Since</span>,
      selector: (row) => row.enquiryDate,
      width: "10%",
      sortable: true,
      cell: (row) => <WordWrapCell>{calculateAging(row.enquiryDate, new Date())}</WordWrapCell>
    },
    enquiryType === "Others" && {
      name: <span className="font-weight-bold fs-13">Assigned Duration</span>,
      selector: (row) => row.enquiryDate,
      width: "10%",
      sortable: true,
      cell: (row) => <WordWrapCell>{calculateAging(row.enquiryDate, row.assignedDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Name</span>,
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.name}</WordWrapCell>
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
      name: <span className="font-weight-bold fs-13">Created By</span>,
      selector: (row) => row.loginId,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.loginId ? row.loginName + ' (' + row.loginId + ')' : 'Web/App'}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Remarks</span>,
      selector: (row) => row.remarks,
      sortable: true,
      width: "20%",
      cell: (row) => <WordWrapCell>{row.remarks}</WordWrapCell>,
    },
    enquiryType === "Others" && {
      name: <span className="font-weight-bold fs-13">Assigned To</span>,
      selector: (row) => row.assignToName,
      sortable: true,
      width: "15%",
      cell: (row) => <WordWrapCell>{row.assignToName ? row.assignToName + ' (' + row.assignTo + ')' : ''}</WordWrapCell>,
    },
    enquiryType === "Others" && {
      name: <span className="font-weight-bold fs-13">Assigned Date & Time</span>,
      selector: (row) => row.assignedDate,
      sortable: true,
      width: "20%",
      cell: (row) => <WordWrapCell>{formatDateTime(row.assignedDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      selector: (row) => row.loginId,
      sortable: true,
      width: '30%',
      cell: (row) => (
        <Select
          id="dropdown"
          placeholder={"Select Assign To..."}
          style={{ zIndex: 9999 }}
          menuPortalTarget={document.body}
          value={
            assignToValues[row.id]
              ? { value: assignToValues[row.id], label: assignToValues[row.id] }
              : null
          }
          onChange={(selectedOption) => handleStatusChange(row, selectedOption)}
          options={Array.isArray(allUsersList?.data?.data) ? allUsersList?.data?.data : []}
          styles={{
            control: (base) => ({
              ...base,
              width: '100%',
              minWidth: '250px',
            }),
            menu: (base) => ({
              ...base,
              width: '100%',
            }),
          }}
        />
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      sortable: true,
      cell: (row) => (
        <MdDelete
          onClick={() => handleDeleteClick(row.id)}
          style={{ cursor: "pointer", color: "red" }}
          size={20} // Adjust size as needed
        />
      ),
    },
  ].filter(Boolean);

  const downloadEnquiryDataExcel = () => {
    if (!Array.isArray(enquiryList?.content) || enquiryList?.content?.length === 0) return;

    // Define the fields that need to be excluded from the export
    const fieldsToRemove = ["assignToRemark", "assignTo", "assignToName", "assignBy", "assignByName", "mobileNumber", "email", "id", "active", "assigned", "otherEnquiry", "loginId", "loginName"];

    // Get headers of the first item and remove unwanted fields from headers
    const headers = Object.keys(enquiryList?.content[0])?.filter(header => !fieldsToRemove.includes(header));

    // Format the data to exclude the unwanted fields
    const formattedData = enquiryList?.content?.map((item) => {
      return headers.map((header) => item[header]);
    });

    // Add headers to the top of the formatted data
    const finalData = [headers, ...formattedData];

    // Generate the Excel file
    const ws = XLSX.utils.aoa_to_sheet(finalData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Enquiry Data");

    // Download the file
    XLSX.writeFile(wb, `enquiryData_${generateTimestamp()}.xlsx`);
  };

  const handleRadioChange = (event) => {
    setEnquiryType(event.target.value);
  };

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'enquiry-history');
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
      <Container fluid={true}>
        <Breadcrumbs title="Enquiry" breadcrumbItem="History" />
        {(isLoading || isPending || isPendingDelete) && <ScreenLoader />}

        <div className="radio-button-container">
          <label className={`radio-label ${enquiryType === "Pending" ? "active" : ""}`}>
            <input
              type="radio"
              value="Pending"
              checked={enquiryType === "Pending"}
              onChange={handleRadioChange}
            />
            Fresh
          </label>
          <label className={`radio-label ${enquiryType === "Others" ? "active" : ""}`}>
            <input
              type="radio"
              value="Others"
              checked={enquiryType === "Others"}
              onChange={handleRadioChange}
            />
            Assigned
          </label>
        </div>

        {enquiryList?.content?.length > 0 && (
          <i
            className="fas fa-file-excel"
            style={{
              color: defaultTheme.primary,
              cursor: "pointer",
              fontSize: "17px",
              marginBottom: '10px'
            }}
            onClick={downloadEnquiryDataExcel}
          ></i>
        )}

        {enquiryList?.content?.length > 0 &&
          <AppTable
            columns={columns}
            data={enquiryList?.content || []}
            progressPending={isLoading}
            paginationTotalRows={enquiryList?.totalElements || 0}
            paginationServer
            onChangePage={setPage}
            pagination
          />
        }
      </Container>

      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(!isModalOpen)}>
        <ModalHeader toggle={() => setIsModalOpen(!isModalOpen)}>
          Confirm Assign
        </ModalHeader>
        <ModalBody>Are you sure you want to assign?</ModalBody>
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

      <Modal isOpen={isDeleteModalOpen} toggle={handleCloseModal}>
        <ModalHeader toggle={handleCloseModal}>
          Confirm Deletion
        </ModalHeader>
        <ModalBody>Are you sure you want to delete this item?</ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            style={{ backgroundColor: defaultTheme.primary }}
            onClick={handleDeleteConfirm}
          >
            Yes
          </Button>
          <Button
            color="secondary"
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

export default EnquiryHistory;