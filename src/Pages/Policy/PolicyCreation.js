import { Row, Col, Card, CardBody, FormGroup, Button, Container, Form, Input, Modal, ModalHeader, ModalBody, Table } from "reactstrap";
import Select from "react-select";
import { useGet, usePost } from "../../Hooks/useApi";
import { GET_ALL_POLICY_DOCUMENT, ALL_LOCATION_DROPDOWN, UPLOAD_POLICY_DOCUMENT, STATUS_CHANGE_POLICY_DOCUMENT } from "../../helpers/url_helper";
import { useUserStore } from "../../store/useUserStore";
import { toast } from "react-toastify";
import AppTable from "../../components/Common/Table";
import { formatDateTime, generateTimestamp, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import React, { useEffect, useRef, useState } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { FaFilePdf } from "react-icons/fa";
import { defaultTheme } from "../../helpers/defaultTheme";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import Switch from "react-switch";
import * as XLSX from "xlsx";

const PolicyCreation = () => {
    const [accessGranted, setAccessGranted] = useState(null);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [selectedDownloads, setSelectedDownloads] = useState([]);
    const [selectedPolicyTitle, setSelectedPolicyTitle] = useState("");
    const fileInputRef = useRef(null); // Create a ref for the file input
    const { data: locationList } = useGet(ALL_LOCATION_DROPDOWN, { enabled: !!accessGranted });
    const userId = useUserStore((state) => state.user.userId);
    const { data: groupList, isLoading, refetch: getAllData, } = useGet(`${GET_ALL_POLICY_DOCUMENT}`, { enabled: !!accessGranted });
    const [expandedRows, setExpandedRows] = useState({})
    const [policyTitle, setPolicyTitle] = useState("");
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [file, setFile] = useState("");
    const [isPending, setIsPending] = useState(false);

    // Handle input changes for policy title
    const handleTitleChange = (e) => setPolicyTitle(e.target.value);

    // Handle changes in multi-select dropdown for users
    const handleSelectChange = (selectedOptions) => {
        const selectedValues = selectedOptions
            ? selectedOptions.map((option) => option.value)
            : [];
        setSelectedLocations(selectedValues);
    };

    // Reset values after form submission
    const resetValues = () => {
        setPolicyTitle("");
        setFile(null);
        setSelectedLocations([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the file input
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);
    };

    // API call to create a group
    const { isPending: addLoading, mutate } = usePost(`${UPLOAD_POLICY_DOCUMENT}`, {
        onSuccess: (response) => {
            if (response?.data?.status === 1) {
                getAllData();
                resetValues();
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        },
        onError: (err) => {
            resetValues();
            toast.error(err.message);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if policy title is provided
        if (!policyTitle) {
            toast.error("Please Input Policy Title");
        }
        // Check if at least one location is selected
        else if (selectedLocations.length < 1) {
            toast.error("Please Select At Least One Branch");
        }
        // Check if a file is selected and it's a PDF
        else if (!file) {
            toast.error("Please Select Policy Document");
        }
        // else if (file && file.type !== "application/pdf") {
        //     toast.error("Only PDF files are allowed.");
        // } 
        else {
            // If everything is valid, proceed with form submission
            const formData = new FormData();
            formData.append("title", policyTitle);

            // Append selected locations
            selectedLocations.forEach((location) => {
                formData.append("locations", encodeURIComponent(location)); // Append locationId for each selected location
            });

            // Append userId and the file
            formData.append("userId", userId);
            formData.append("document", file);

            // Call mutate function with form data
            mutate(formData);
        }
    };

    const handleViewFile = (fileName) => {
        const fileExtension = fileName.split(".").pop().toLowerCase();
        const fileUrl = imageBaseUrl + fileName;

        // if (fileExtension === "pdf" || fileExtension === "pptx") {
        // Open PDF in a new window
        window.open(fileUrl, "_blank");
        // }
    };

    const handleSwitchChange = (row) => {
        setIsPending(true);
        ApiClient.post(`${STATUS_CHANGE_POLICY_DOCUMENT}${row.id}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    getAllData();
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    const handleViewDownloads = (row) => {
        if (row.downloads && row.downloads.length > 0) {
            setSelectedDownloads(row.downloads);
            setSelectedPolicyTitle(row.title); // Set the title of the policy
            setIsDownloadModalOpen(true);
        } else {
            toast.info("No downloads available for this policy.");
        }
    };

    const closeDownloadModal = () => {
        setIsDownloadModalOpen(false);
        setSelectedDownloads([]);
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">Policy Title</span>,
            selector: (row) => row.title,
            sortable: true,
            width: "15%",
            cell: (row) => <WordWrapCell>{row.title}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
            selector: (row) => formatDateTime(row.createdDate),
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Uploaded By</span>,
            selector: (row) => row.uploadedByName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.uploadedByName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">File</span>,
            width: "8%",
            selector: (row) => (
                <div>
                    <FaFilePdf
                        size={20}
                        onClick={() => handleViewFile(row.document)}
                        style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                    />
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Branches</span>,
            selector: (row) => row.locations,
            width: "30%",
            sortable: true,
            cell: (row, index) => {
                const isExpanded = expandedRows[index] || false;
                const locations = row.locations || []; // Direct array of strings

                const sanitizedLocations = locations;
                const visibleLocations = isExpanded
                    ? sanitizedLocations
                    : sanitizedLocations.slice(0, 5);  // Show first 5 only when collapsed

                const toggleDescription = () => {
                    setExpandedRows((prevState) => ({
                        ...prevState,
                        [index]: !isExpanded,
                    }));
                };

                return (
                    <WordWrapCell>
                        <div className="d-flex flex-wrap gap-1">
                            {visibleLocations.map((location, i) => (
                                <span
                                    key={i}
                                    className="badge bg-light border text-dark"
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: "12px",
                                        fontSize: "12px",
                                    }}
                                >
                                    {location}  {/* Directly use the location string */}
                                </span>
                            ))}
                        </div>

                        {sanitizedLocations.length > 5 && (
                            <div className="mt-2">
                                <button
                                    onClick={toggleDescription}
                                    aria-expanded={isExpanded}
                                    aria-controls={`locations-list-${index}`}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: defaultTheme.goldColorLogo,
                                        fontWeight: "500",
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                        padding: 0,
                                        fontSize: "13px",
                                    }}
                                >
                                    {isExpanded
                                        ? "Show Less"
                                        : `+${sanitizedLocations.length - 5} More`}
                                </button>
                            </div>
                        )}
                    </WordWrapCell>
                );
            },
        },
        {
            name: <span className="font-weight-bold fs-13">Viewed</span>,
            width: "8%",
            selector: (row) => row.downloads,
            cell: (row) => (
                <WordWrapCell>
                    {/* Check if there are downloads, then display the count with bold and underline */}
                    <span
                        onClick={() => handleViewDownloads(row)} // Trigger the modal or action
                        style={{
                            color: defaultTheme.goldColorLogo,
                            fontWeight: 'bold',  // Make the text bold
                            cursor: 'pointer',
                            textDecoration: 'underline',  // Underline the text
                        }}
                        title={`View ${row?.downloads.length} downloads`}
                    >
                        {row?.downloads.length}
                    </span>
                </WordWrapCell>
            ),
        }

        ,
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            cell: (row) => (
                <Switch
                    checked={!row.disabled}
                    offColor={defaultTheme.goldColorLogo}
                    onColor={defaultTheme.primary}
                    height={20}
                    width={40}
                    onChange={() => handleSwitchChange(row)}
                />
            ),
        },
    ];

    const downloadViewedExcel = () => {
        if (!Array.isArray(selectedDownloads) || selectedDownloads.length === 0) return;

        // 1. Extract and modify the required headers
        const headers = ["SL No.", "Emp Name", "Emp Code", "Main Team", "Sub Team", "Branch", "Download Date & Time"];

        // 2. Format the data to match the new structure
        const formattedData = selectedDownloads.map((item, index) => [
            index + 1, // Sl No.
            item.empName,
            item.empCode,
            item.mainTeam,
            item.subTeam,
            item.branch,
            formatDateTime(item.downloadDate)
        ]);

        // 3. Add headers to the formatted data
        const finalData = [headers, ...formattedData];

        // 4. Create a worksheet from the final data
        const ws = XLSX.utils.aoa_to_sheet(finalData);

        // 5. Create a workbook and append the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Policy Viewed Details");

        // 6. Write the file and trigger download
        XLSX.writeFile(wb, `${selectedPolicyTitle}_Data_${generateTimestamp()}.xlsx`);
        return;
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'policy-creation');
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
                <Breadcrumbs title="Policy" breadcrumbItem="Add-Show Policy" />
                {(addLoading || isLoading || isPending) && <ScreenLoader />}
                <Card>
                    <CardBody>
                        <Form className="needs-validation" onSubmit={handleSubmit}>
                            <Row>
                                <Col md="3">
                                    <FormGroup>
                                        <h6 className="font-size-11 mt-1">Policy Title <RequiredStar /></h6>
                                        <Input
                                            name="title"
                                            placeholder="Type here..."
                                            type="text"
                                            className="form-control"
                                            value={policyTitle}
                                            onChange={handleTitleChange}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md="4">
                                    <FormGroup>
                                        <h6 className="font-size-11 mt-1">Select Branch <RequiredStar />{" "}</h6>
                                        <Select
                                            style={{ zIndex: 9999 }}
                                            menuPortalTarget={document.body}
                                            options={
                                                Array.isArray(locationList?.data?.data)
                                                    ? locationList?.data?.data
                                                    : []
                                            }
                                            isMulti
                                            closeMenuOnSelect={false}
                                            value={
                                                Array.isArray(locationList?.data?.data)
                                                    ? locationList?.data?.data.filter((location) =>
                                                        selectedLocations.includes(location.value)
                                                    )
                                                    : null
                                            }
                                            onChange={handleSelectChange} // Update selected locations state
                                        />
                                    </FormGroup>
                                </Col>

                                <Col md="3">
                                    <h6 className="font-size-11 mt-1">Policy File <RequiredStar /></h6>
                                    <input
                                        type="file"
                                        className="form-control"
                                        ref={fileInputRef}
                                        // accept="application/pdf"
                                        onChange={handleFileChange}
                                    />
                                </Col>

                                <Col md="2">
                                    <FormGroup className="mt-4">
                                        <div className="d-flex align-items-center">
                                            <Button
                                                type="submit"
                                                color="primary"
                                                className="me-2"
                                            >
                                                Submit
                                            </Button>
                                            <Button
                                                type="reset"
                                                color="secondary"
                                                onClick={resetValues}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Form>
                    </CardBody>
                </Card>

                {/* Table */}
                {Array.isArray(groupList?.data?.data) &&
                    groupList?.data?.data?.length > 0 && (
                        <AppTable
                            progressPending={isLoading}
                            columns={columns}
                            data={
                                Array.isArray(groupList?.data?.data)
                                    ? groupList?.data?.data
                                    : []
                            }
                            pagination
                        />
                    )}

                {/* Beautiful Modern Modal */}
                <Modal
                    isOpen={isDownloadModalOpen}
                    toggle={closeDownloadModal}
                    centered
                    size="lg"
                    className="download-modal-wrapper"
                >
                    {/* Excel Export Icon */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            padding: "10px 20px 0 20px",
                        }}
                    >
                        <i
                            className="fas fa-file-excel"
                            style={{
                                color: defaultTheme.primary,
                                cursor: "pointer",
                                fontSize: "22px",
                                padding: "8px",
                                borderRadius: "8px",
                                background: "#e7f8f4",
                            }}
                            onClick={() => downloadViewedExcel()}
                            title="Download Excel"
                        ></i>
                    </div>

                    <ModalHeader
                        toggle={closeDownloadModal}
                        className="border-0 pb-0"
                        style={{
                            background: "linear-gradient(135deg, #007b73, #00a88c)",
                            color: "#fff",
                            borderRadius: "12px 12px 0 0",
                        }}
                    >
                        <h6 className="m-0 fw-bold text-white mb-2">
                            Views for <strong>{selectedPolicyTitle}</strong> ({selectedDownloads.length})
                        </h6>
                    </ModalHeader>

                    <ModalBody
                        className="p-0"
                        style={{
                            background: "#f8fafc",
                            borderRadius: "0 0 12px 12px",
                            maxHeight: "65vh",
                            overflowY: "auto",
                        }}
                    >
                        <div>
                            <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
                                <Table hover bordered className="modern-table align-middle">
                                    <thead
                                        style={{
                                            background: "#007b73",
                                            color: "#fff",
                                            fontSize: "12px",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.2px",
                                        }}
                                    >
                                        <tr className="text-center">
                                            <th>#</th>
                                            <th>Employee</th>
                                            <th>Team</th>
                                            <th>Branch</th>
                                            <th>Viewed On</th>
                                        </tr>
                                    </thead>

                                    <tbody style={{ background: "#ffffff" }}>
                                        {selectedDownloads?.length > 0 ? (
                                            selectedDownloads.map((download, index) => (
                                                <tr key={index}>
                                                    <td className="text-center">{index + 1}</td>
                                                    <td>
                                                        <div className="fw-semibold text-dark">
                                                            {download.empName} ({download.empCode})
                                                        </div>
                                                    </td>

                                                    <td className="text-center">
                                                        <span className="badge rounded-pill bg-teal text-white px-3 py-2">
                                                            {download.mainTeam} / {download.subTeam}
                                                        </span>
                                                    </td>

                                                    <td className="text-center">
                                                        <span className="badge bg-light border text-dark px-3 py-2">
                                                            {download.branch}
                                                        </span>
                                                    </td>

                                                    <td className="text-center">
                                                        <span className="text-secondary">
                                                            {formatDateTime(download.downloadDate)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4">
                                                    <i className="text-muted">No download records available</i>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>

                        </div>
                    </ModalBody>
                </Modal>


            </Container>
        </PageContent>
    );
};

export default PolicyCreation;
