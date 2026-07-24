import { useEffect, useRef, useState } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import { toast } from "react-toastify";
import { GET_ALL_NOC, GET_ALL_USERS_DROPDOWN, GET_SALE_DETAILS, UPLOAD_NOC } from "../../helpers/url_helper";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PageContent from "../../components/Common/PageContent";
import AppTable from "../../components/Common/Table";
import { useUserStore } from "../../store/useUserStore";
import { useGet } from "../../Hooks/useApi";
import { IoIosCloudUpload } from "react-icons/io";
import { defaultTheme } from "../../helpers/defaultTheme";
import ImageModal from "../../components/Common/ImageModal";
import { FaFilePdf } from "react-icons/fa";
import { formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import Select from "react-select";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import { formStageOptions } from "../../constants/global";

export default function UploadNoc() {
    const { empCode, userId } = useUserStore((state) => state.user);
    const [mtrsId, setMtrsId] = useState('')
    const [isPending, setIsPending] = useState(false);
    const [mtrsData, setMtrsData] = useState('')
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState("");
    const [nocType, setNocType] = useState(null)
    const [handoverToUser, setHandoverToUser] = useState(null)
    const [handoverTo, setHandoverTo] = useState(null)
    const [page, setPage] = useState(1)
    const LIMIT = 100;
    const [accessGranted, setAccessGranted] = useState(null);
    const [mtrsAllData, setMtrsAllData] = useState([])
    const { data: usersList } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: !!accessGranted });
    const { data, isLoading: isLoadingData, refetch: getAllMtrsData } = useGet(`${GET_ALL_NOC}?offset=${page - 1}&limit=${LIMIT}`, { enabled: !!accessGranted });

    useEffect(() => {
        if (data?.data?.status === 1) {
            decryptData(data?.data?.data).then((decryptedData) => {
                if (decryptedData) {
                    setMtrsAllData(decryptedData);
                } else {
                    setMtrsAllData([])
                }
            });
        }
    }, [data]);

    const nycTypeGroup = [
        { label: 'Cancellation And Refund', value: 'Cancellation And Refund' },
        { label: 'Fund Transfer', value: 'Fund Transfer' },
        { label: 'Unit Shifting', value: 'Unit Shifting' },
        { label: 'Ownership Transfer', value: 'Ownership Transfer' },
    ]

    const handoverToOptions = [
        { label: 'Client', value: 'Client' },
        { label: 'Staff', value: 'Staff' }
    ]

    const handleShowData = (e) => {
        e.preventDefault();
        if (!mtrsId) {
            toast.error('Please Enter Unique ID')
            return;
        }
        else {
            setIsPending(true)
            ApiClient.get(`${GET_SALE_DETAILS}${mtrsId}`).then(function (response) {
                setIsPending(false);
                if (response.data.status === 1) {
                    decryptData(response?.data?.data).then((decryptedData) => {
                        if (decryptedData) {
                            setMtrsData(decryptedData);
                        } else {
                            setMtrsData('')
                        }
                    });
                }
                else {
                    toast.error(response.data.message)
                }

            })
                .catch(function (error) {
                    setIsPending(false);
                    toast.error(error.message);
                });
        }
    }

    const handleSaveData = () => {
        if (!mtrsData) {
            toast.error('Please Enter Unique ID')
            return;
        }
        else if (!nocType) {
            toast.error('Please Select NOC Type')
            return;
        }
        else if (!file) {
            toast.error('Please Upload File')
            return;
        }
        else if (!handoverTo) {
            toast.error('Please Select Handover To')
            return;
        }
        else if (handoverTo?.value === 'Staff' && !handoverToUser) {
            toast.error('Please Select Handover To Staff')
            return;
        }
        else {
            const formData = new FormData();
            formData.append("saleId", mtrsId);
            formData.append("loginId", empCode);
            formData.append("file", file);
            formData.append("nocType", nocType?.label);
            formData.append("handoverType", handoverTo?.value);
            formData.append("handoverUserId", handoverToUser?.value || 0);
            setIsPending(true)
            ApiClient.post(`${UPLOAD_NOC}`, formData)
                .then(function (response) {
                    setIsPending(false);
                    if (response.data.status === 1) {
                        toast.success(response.data.message)
                        handleClear();
                    }
                    else {
                        toast.error(response.data.message)
                    }
                })
                .catch(function (error) {
                    setIsPending(false);
                    toast.error(error.message);
                });
        }
    }

    const handleClear = () => {
        setMtrsId('')
        setMtrsData('')
        setNocType(null)
        setHandoverTo(null)
        setHandoverToUser(null)
        getAllMtrsData();
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the file input
        }
        setFile(null);
    }

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "5%",
        },
        {
            name: <span className="font-weight-bold fs-13">Uploaded Date & Time</span>,
            selector: (row) => row.nocUploadDate,
            sortable: true,
            width: '16%',
            cell: (row) => <WordWrapCell>{formatDateTime(row.nocUploadDate)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Unique ID</span>,
            selector: (row) => row.saleId,
            sortable: true,
            width: "8%",
            cell: (row) => <WordWrapCell>{row.saleId}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row?.clientName,
            sortable: true,
            width: "12%",
            cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Unit No.</span>,
            selector: (row) => row?.unitNo,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.unitNo}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Builder</span>,
            selector: (row) => row?.builderName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Project</span>,
            selector: (row) => row?.projectName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">NOC Type</span>,
            selector: (row) => row.nocType,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.nocType}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">File</span>,
            selector: (row) => row.bbaUpload,
            cell: (row) => (
                <div>
                    <FaFilePdf
                        size={20}
                        onClick={() => handleViewFileList(row)}
                        style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                    />
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Handover Type</span>,
            selector: (row) => row.handoverType,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.handoverType || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">NOC Handover Name</span>,
            selector: (row) => row.nocHandoverName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.nocHandoverName || '-'}</WordWrapCell>
        },
    ];

    // Handle file input change
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]; // Get the first selected file
        if (selectedFile) {
            setFile(selectedFile); // Store the selected file
        }
    };

    // Trigger file input click when the attachment button is pressed
    const handleAttachFile = () => {
        fileInputRef.current.click(); // Click the file input element
    };

    const handleViewFileList = (row) => {
        const fileName = row?.nocUpload
        if (fileName) {
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
        }
        else {
            toast.error('No File Exists')
        }

    };

    const handleViewFile = () => {
        if (file) {
            const fileExtension = file.name.split(".").pop().toLowerCase();
            const fileUrl = URL.createObjectURL(file); // Generate URL for the file object

            if (fileExtension === "pdf") {
                // Open PDF in a new tab/window
                window.open(fileUrl, "_blank");
            } else {
                // Set the image source and open modal for images
                setCurrentImage(fileUrl);
                toggleModal(); // Open modal to display image
            }
        }
    };

    const toggleModal = () => setModalOpen(!modalOpen);

    const getFormStageLabel = (id) => {
        const option = formStageOptions.find(item => item.value === id);
        return option ? option.label : "N/A";
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'upload-noc');
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
            <Breadcrumbs title="Upload" breadcrumbItem="NOC" />
            {(isPending || isLoadingData) && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowData}>
                            <Row className="g-3">
                                <Col md="3">
                                    <h6 className="font-size-11">Unique ID</h6>
                                    <input
                                        id="mtrsId"
                                        className="form-control"
                                        type="text"
                                        value={mtrsId}
                                        placeholder="Enter Unique ID..."
                                        onChange={(e) => setMtrsId(e.target.value)}
                                    />
                                </Col>
                                <Col lg="6" className="d-flex align-items-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={handleShowData}
                                    >
                                        Verify
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary ms-2"
                                        onClick={handleClear}
                                    >
                                        Clear
                                    </button>
                                </Col>
                            </Row>
                        </form>

                        {mtrsData &&
                            <div>
                                <hr className="dashed-divider" />
                                <Row className='g-3'>
                                    <Col md="3">
                                        <p>
                                            <strong>Name:</strong> {mtrsData?.clientName || "N/A"}
                                        </p>
                                    </Col>
                                    <Col md="3">
                                        <p>
                                            <strong>Builder:</strong> {mtrsData?.builderName || "N/A"}
                                        </p>
                                    </Col>
                                    <Col md="3">
                                        <p>
                                            <strong>Project:</strong> {mtrsData?.projectName || "N/A"}
                                        </p>
                                    </Col>
                                    <Col md="3">
                                        <p>
                                            <strong>Unit No:</strong> {mtrsData?.unitNo || "N/A"}
                                        </p>
                                    </Col>
                                    <Col md="3">
                                        <p>
                                            <strong>Form Stage:</strong> {getFormStageLabel(mtrsData?.formStageId) || "N/A"}
                                        </p>
                                    </Col>
                                    <Col md="3">
                                        <strong style={{ marginBottom: '5px', display: 'block' }}>Select NOC Type: <RequiredStar /></strong>
                                        <Select
                                            style={{ zIndex: 9999 }}
                                            menuPortalTarget={document.body}
                                            isClearable
                                            value={nocType}
                                            onChange={(selected) => setNocType(selected)}
                                            options={nycTypeGroup}
                                        />
                                    </Col>
                                    <Col md="3">
                                        <strong>NOC: <RequiredStar /></strong>
                                        <Button color="link" onClick={handleAttachFile}>
                                            <IoIosCloudUpload
                                                size={27}
                                                style={{ color: defaultTheme.btnEnable }}
                                            />
                                        </Button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: "none" }}
                                            onChange={handleFileChange}
                                            accept=".pdf,image/*"
                                        />
                                        {file && (
                                            <FaFilePdf
                                                size={20}
                                                color={defaultTheme.goldColorLogo}
                                                onClick={handleViewFile}
                                                style={{ cursor: "pointer" }}
                                            />
                                        )}
                                        <h6
                                            className="font-size-10 mt-2"
                                            style={{ color: defaultTheme.redColor }}
                                        >
                                            Upload only PDF, and Images
                                        </h6>
                                    </Col>
                                    <Col md="3">
                                        <strong style={{ marginBottom: '5px', display: 'block' }}>Handover To: <RequiredStar /></strong>
                                        <Select
                                            style={{ zIndex: 9999 }}
                                            menuPortalTarget={document.body}
                                            isClearable
                                            value={handoverTo}
                                            onChange={(selected) => setHandoverTo(selected)}
                                            options={handoverToOptions}
                                        />
                                    </Col>
                                    {handoverTo?.value === 'Staff' &&
                                        <Col md="4">
                                            <strong style={{ marginBottom: '5px', display: 'block' }}>Select Handover To Staff: <RequiredStar /></strong>
                                            <Select
                                                style={{ zIndex: 9999 }}
                                                menuPortalTarget={document.body}
                                                isClearable
                                                value={handoverToUser}
                                                onChange={(selected) => setHandoverToUser(selected)}
                                                options={usersList?.data?.data || []}
                                            />
                                        </Col>
                                    }

                                </Row>
                                <hr className="dashed-divider" />

                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={handleSaveData}
                                    >
                                        Save
                                    </button>
                                </div>

                            </div>
                        }
                    </CardBody>
                </Card>


                <AppTable
                    progressPending={isPending}
                    columns={columns}
                    data={mtrsAllData?.content || []}
                    pagination
                    paginationTotalRows={mtrsAllData?.totalElements}
                    paginationServer
                    onChangePage={(newPage) => {
                        setPage(newPage);
                        getAllMtrsData()
                    }}
                />

            </Container>

            <ImageModal
                isOpen={modalOpen}
                toggle={toggleModal}
                imageSrc={currentImage}
            />
        </PageContent>
    );
}
