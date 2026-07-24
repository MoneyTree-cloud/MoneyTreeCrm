/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useGet, usePost } from "../../Hooks/useApi";
import { GET_ALL_LEAD_DATA, GET_ALL_USERS_DROPDOWN, TRANSFER_LEAD_DATA } from "../../helpers/url_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import { formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import { MdMobileFriendly } from "react-icons/md";
import "../CSS/styles.css";
import ApiClient from "../../helpers/api_helper";
import PageContent from "../../components/Common/PageContent";

export default function LeadTransfer() {
  const userId = useUserStore((state) => state.user.userId);

  // const mainTeam = useUserStore((state) => state.user.mainTeam);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [pending, setPending] = useState(false);

  const INITIALSTATE = {
    associateSelect: null,
    toAssociateSelect: null,
    transferTypeSelect: null,
  };

  const [formState, setFormState] = useState(INITIALSTATE);
  const { data: associateList, isLoading } = useGet(GET_ALL_USERS_DROPDOWN);

  const getSuspectDetails = () => {
    setPending(true)
    ApiClient.get(
      `${GET_ALL_LEAD_DATA}`
    )
      .then(function (response) {
        setPending(false);
        if (response?.data?.status === 1) {
          const updatedRows = response.data.data.map((suspect) => ({
            ...suspect,
            isChecked: false, // Checkbox state for each prospect
          }));
          setRowData(updatedRows);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setPending(false);
        toast.error(error.message);
      });
  };

  const { isPending: transferLoading, mutate } = usePost(
    `${TRANSFER_LEAD_DATA}${formState?.toAssociateSelect?.value}&loginId=${userId}`,
    {
      onSuccess: (response) => {
        if (response?.data.status === 1) {
          toast.success(response.data.message);
          setRowData([]);
          setSelectAllChecked(false);
          setFormState(INITIALSTATE);
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  useEffect(() => {
    const allChecked = rowData.every((row) => row.isChecked);
    setSelectAllChecked(allChecked);
  }, [rowData]);

  const handleCheckboxChange = (rowId) => {
    setRowData((prevData) => {
      const updatedData = prevData.map((row) =>
        row.leadId === rowId ? { ...row, isChecked: !row.isChecked } : row
      );

      // Check if any prospect is still checked
      const anyChecked = updatedData.some((row) => row.isChecked);
      setSelectAllChecked(anyChecked);

      return updatedData;
    });
  };

  const handleSelectAllChange = () => {
    const newCheckedState = !selectAllChecked;
    setRowData((prevData) =>
      prevData.map((row) => ({ ...row, isChecked: newCheckedState }))
    );
    setSelectAllChecked(newCheckedState);
  };

  useEffect(() => {
    if (formState.transferTypeSelect?.value === "All") {
      setRowData((prevData) =>
        prevData.map((row) => ({ ...row, isChecked: true }))
      );
      setSelectAllChecked(true);
    } else {
      setRowData((prevData) =>
        prevData.map((row) => ({ ...row, isChecked: false }))
      );
      setSelectAllChecked(false);
    }
  }, [formState.transferTypeSelect]);

  const columns = [
    {
      name: (
        <input
          type="checkbox"
          checked={selectAllChecked}
          onChange={handleSelectAllChange}
          aria-label="Select All"
        />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={row.isChecked}
          onChange={() => handleCheckboxChange(row.leadId)}
        />
      ),
      width: "4%",
    },
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "6%",
    },
    {
      name: <span className="font-weight-bold fs-13">Lead Name</span>,
      selector: (row) => row.leadName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.leadName}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Mobile Number</span>,
      selector: (row) => row.leadMobile,
      sortable: true,
      cell: (row) => (
        <div className="phone-container">
          <MdMobileFriendly
            className="phone-icon"
            color={defaultTheme.goldColorLogo}
          />
          <span className="phone-number">{row.leadMobile}</span>
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Project</span>,
      selector: (row) => row.project,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.project}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Project Category</span>,
      selector: (row) => row.projectCategory,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.projectCategory}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Created Date  & Time</span>,
      selector: (row) => row.createdDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
    }
  ];

  const handleSelectChange = (name, selectedOption) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: selectedOption,
    }));
  };

  const handleShowData = () => {
    if (!formState.associateSelect) {
      toast.error("Please Select Associate");
      return;
    } else {
      getSuspectDetails();
    }
  };


  const handleTransferData = () => {
    const selectedSuspects = rowData.filter((row) => row.isChecked);
    if (!formState.associateSelect) {
      toast.error("Please Select An Associate From The First Dropdown.");
    } else if (!formState.toAssociateSelect) {
      toast.error("Please Select An Associate To Transfer To.");
    } else if (selectedSuspects.length === 0) {
      toast.error("Please Select At Least One Suspect To Transfer.");
    }
    else {
      const prospectsToTransfer = selectedSuspects.map(
        ({ isChecked, ...rest }) => rest
      ); // Remove isChecked from each object
      mutate(prospectsToTransfer);
      // You can add further logic to handle the transfer here
    }
  };


  return (
    <PageContent>
      <Breadcrumbs title="Transfer" breadcrumbItem="Suspects" />
      {(pending || transferLoading || isLoading) && <ScreenLoader />}
      <Container fluid={true}>
        <Card>
          <CardBody>
            <Row>
              <Col lg="3">
                <h6 className="font-size-11">Select Associate</h6>
                <Select
                  style={{ zIndex: 9999 }}
                  menuPortalTarget={document.body}
                  isClearable
                  value={formState.associateSelect}
                  onChange={(selectedOption) =>
                    handleSelectChange("associateSelect", selectedOption)
                  }
                  options={
                    Array.isArray(associateList?.data?.data)
                      ? associateList?.data?.data
                      : []
                  }
                />
              </Col>

              <Col
                lg="3"
                className="d-flex justify-content-center align-items-center mt-3"
              >
                <Button
                  color="primary"
                  style={{ backgroundColor: defaultTheme.primary }}
                  onClick={handleShowData}
                >
                  Show Data
                </Button>
              </Col>
              <Col lg="3">
                <h6 className="font-size-11">To Associate</h6>
                <Select
                  style={{ zIndex: 9999 }}
                  menuPortalTarget={document.body}
                  isClearable
                  value={formState.toAssociateSelect}
                  onChange={(selectedOption) =>
                    handleSelectChange("toAssociateSelect", selectedOption)
                  }
                  options={
                    Array.isArray(associateList?.data?.data)
                      ? associateList?.data?.data?.filter(
                        (option) =>
                          option.value !== formState.associateSelect?.value // Filter out the selected associate
                      )
                      : []
                  }
                />
              </Col>


              <Col
                lg="3"
                className="d-flex justify-content-center align-items-center mt-3"
              >
                <Button
                  color="primary"
                  style={{ backgroundColor: defaultTheme.goldColorLogo }}
                  onClick={handleTransferData}
                >
                  Transfer Data
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
        {rowData?.length > 0 && (
          <AppTable
            progressPending={pending}
            columns={columns}
            data={rowData || []}
            pagination
          />
        )}
      </Container>
    </PageContent>
  );
}
