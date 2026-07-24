/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react'
import PageContent from '../../components/Common/PageContent'
import Breadcrumbs from '../../components/Common/Breadcrumb'
import { Button, Card, CardBody, Col, Container, Input, Row } from 'reactstrap'
import { formatDateForInput, formatDateTime, RequiredStar, WordWrapCell } from '../../helpers/function_helper'
import { toast } from 'react-toastify'
import CheckUserAccess from '../../components/Common/CheckUserAccess'
import { useUserStore } from '../../store/useUserStore'
import ScreenLoader from '../../constants/ScreenLoader'
import PermissionMissing from '../Utility/PermissonMissing'
import ApiClient, { imageBaseUrl } from '../../helpers/api_helper'
import { FILL_BD_AMOUNT, GET_ALL_BD_AMOUNT, UPDATE_BD_AMOUNT_EXCEL } from '../../helpers/url_helper'
import { useGet, usePost } from '../../Hooks/useApi'
import AppTable from '../../components/Common/Table'
import { FaFilePdf } from 'react-icons/fa'
import { defaultTheme } from '../../helpers/defaultTheme'
import ImageModal from '../../components/Common/ImageModal'
import { AiFillFilter } from 'react-icons/ai'

export default function BDAmount() {
    const fileInputRef = useRef(null)
    const fileInputExcelRef = useRef(null)
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    const [fileInputExcelKey, setFileInputExcelKey] = useState(Date.now());
    const [saleId, setSaleId] = useState('')
    const [BDAmount, setBDAmount] = useState(0)
    const { userId } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);
    const [isPending, setIsPending] = useState(false)
    const LIMIT = 100;
    const [page, setPage] = useState(1);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [filterSaleId, setFilterSaleId] = useState('')
    const [apiUrl, setApiUrl] = useState("");
    const [flag, setFlag] = useState(false)
    const [file, setFile] = useState(null);
    const [excelFile, setExcelFile] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [currentImage, setCurrentImage] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const toggleModal = () => setModalOpen(!modalOpen)

    const handleClear = () => {
        setSaleId('')
        setBDAmount(0)
        setFile(null);
        setFileInputKey(Date.now());

        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the file input
        }
    }

    const getInitialData = () => {
        const now = new Date();
        setFromDate('2024-01-01');
        setToDate(formatDateForInput(now));
        setApiUrl(buildApiUrl('2024-01-01', formatDateForInput(now), null, 0));
    }

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'bd-amount');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                getInitialData()
            }
        };
        checkAccess();
    }, [userId]);

    const { data: bdAmountList, isLoading, refetch: getAllData } = useGet(apiUrl, { enabled: Boolean(apiUrl && accessGranted), });

    const buildApiUrl = (from, to, filterSaleId, offset) => {
        const baseUrl = `${GET_ALL_BD_AMOUNT}${from}&toDate=${to}&offset=${offset}&limit=${LIMIT}`;
        const filterParams = [];

        if (filterSaleId) {
            filterParams.push(`saleId=${encodeURIComponent(filterSaleId)}`);
        }

        const finalUrl = `${baseUrl}${filterParams.length ? '&' + filterParams.join('&') : ''}`;

        return finalUrl;
    };

    const handleSave = (e) => {
        e.preventDefault();

        if (!saleId || !BDAmount || BDAmount < 1) {
            toast.error('Please fill mandatory fields with correct values');
            return;
        }

        const isConfirmed = window.confirm(
            "Are you sure you want to update this?"
        );
        if (!isConfirmed) return;

        setIsPending(true);

        const formData = new FormData();
        formData.append('saleId', saleId);
        formData.append('bdValue', BDAmount);
        formData.append('updatedBy', userId);
        formData.append('file', file);

        ApiClient.post(FILL_BD_AMOUNT, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then((response) => {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    getAllData();
                    handleClear();
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch((error) => {
                setIsPending(false);
                toast.error(error.message);
            });
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

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "8%",
        },
        {
            name: <span className="font-weight-bold fs-13">Unique ID</span>,
            selector: (row) => row.uniqueId,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.uniqueId}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">BD Amount</span>,
            selector: (row) => row.builderDirect,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.builderDirect}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">File</span>,
            selector: (row) => (
                <div>
                    {row.bdProofFile ?
                        <FaFilePdf
                            size={20}
                            onClick={() => handleViewFile(row.bdProofFile)}
                            style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                        />
                        : '-'
                    }
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Updated Date Time</span>,
            selector: (row) => row.bdUploadedAt,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.bdUploadedAt)}</WordWrapCell>
        }
    ]

    const handleShowButton = (e) => {
        e.preventDefault();
        setPage(1);
        setApiUrl(buildApiUrl(fromDate, toDate, filterSaleId, 0));
    };

    useEffect(() => {
        if (flag) {
            setApiUrl(buildApiUrl(fromDate, toDate, filterSaleId, page - 1));
        }
    }, [page]);

    const handleClearFilters = () => {
        setFilterSaleId('')
        getInitialData()
    }

    const handleClearExcel = () => {
        setFileInputExcelKey(Date.now());
        getInitialData()
        if (fileInputExcelRef.current) {
            fileInputExcelRef.current.value = "";
        }
    }

    const handleSubmitExcel = () => {
        if (!excelFile) {
            toast.error("Please Select Lead File");
            return;
        }
        const formData = new FormData();
        formData.append("file", excelFile);
        formData.append("uploadedBy", userId);
        leadExcelUpload(formData);
    }

    const { isPending: uploadLoading, mutate: leadExcelUpload } = usePost(
        UPDATE_BD_AMOUNT_EXCEL,
        {
            onSuccess: (response) => {
                if (response.data.status === 1) {
                    toast.success(response.data.message)
                    getAllData()
                }
                else {
                    toast.error(response.data.message)
                }
                if (fileInputExcelRef.current) {
                    fileInputExcelRef.current.value = "";
                }
                setFileInputExcelKey(Date.now());
                setFile(null)
            },
            onError: (err) => {
                setFile(null)
                if (fileInputExcelRef.current) {
                    fileInputExcelRef.current.value = "";
                }
                setFileInputExcelKey(Date.now());
                toast.error(err.message);
            },
        }
    );

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="BD" breadcrumbItem="Amount" />
            {(isPending || isLoading || uploadLoading) && <ScreenLoader />}
            <Container fluid>
                <Button
                    color="primary"
                    onClick={() => setShowFilters((prev) => !prev)}
                    className="d-flex align-items-center"
                    style={{ fontWeight: 500, marginBottom: '10px' }}
                >
                    <AiFillFilter size={18} className="me-2" />
                    {showFilters ? "Hide Form" : "Show Form"}
                </Button>

                {showFilters && (
                    <Card>
                        <CardBody>
                            <form onSubmit={handleSave}>
                                <Row className="g-3">
                                    <Col lg={3}>
                                        <h6 className="font-size-11">Unique ID <RequiredStar /></h6>
                                        <Input
                                            type="text"
                                            value={saleId}
                                            onChange={(e) => setSaleId(e.target.value)}
                                            placeholder="Enter Unique ID..."
                                        />
                                    </Col>
                                    <Col lg={3}>
                                        <h6 className="font-size-11">BD Amount <RequiredStar /></h6>
                                        <Input
                                            type="text"
                                            value={BDAmount}
                                            onChange={(e) => setBDAmount(e.target.value)}
                                            placeholder="Enter BD Amount..."
                                        />
                                    </Col>

                                    <Col lg={3}>
                                        <h6 className="font-size-11">Upload File</h6>
                                        <Input
                                            type="file"
                                            ref={fileInputRef}
                                            key={fileInputKey}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => setFile(e.target.files[0])}
                                        />
                                    </Col>
                                    <Col lg={3} className="d-flex align-items-end">
                                        <Button color="primary" type='submit'>
                                            Save
                                        </Button>
                                        <Button
                                            color="secondary"
                                            className="ms-2"
                                            onClick={handleClear}
                                            type='reset'
                                        >
                                            Clear
                                        </Button>
                                    </Col>

                                </Row>
                            </form>

                            <Row className='mt-3'>
                                <Col lg={6}>
                                    <h6 className="font-size-11">Upload Excel</h6>
                                    <Input
                                        type="file"
                                        ref={fileInputExcelRef}
                                        key={fileInputExcelKey}
                                        accept="*/*"
                                        onChange={(e) => setExcelFile(e.target.files[0])}
                                    />
                                </Col>
                                <Col lg={6} className="d-flex align-items-end">
                                    <Button color="primary" type='button' onClick={handleSubmitExcel}>
                                        Save
                                    </Button>
                                    <Button
                                        color="secondary"
                                        className="ms-2"
                                        onClick={handleClearExcel}
                                        type='reset'
                                    >
                                        Clear
                                    </Button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                )}
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowButton}>
                            <Row className="g-3">
                                <Col md="3">
                                    <h6 className="font-size-11">From Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">To Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Unique ID</h6>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={filterSaleId}
                                        placeholder='Unique ID'
                                        onChange={(e) => setFilterSaleId(e.target.value)}
                                    />
                                </Col>
                                <Col md="3" className="d-flex align-items-end">
                                    <Button
                                        color="primary"
                                        onClick={handleShowButton}
                                        type="submit"
                                        className="me-2"
                                    >
                                        Search
                                    </Button>
                                    <Button
                                        color="secondary"
                                        onClick={handleClearFilters}
                                        type="reset"
                                    >
                                        Clear
                                    </Button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>


                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={bdAmountList?.data?.data?.content || []}
                    paginationTotalRows={bdAmountList?.data?.data?.totalElements || 0}
                    paginationServer
                    onChangePage={(newPage) => {
                        setPage(newPage);
                        setFlag(true);
                    }}
                    pagination
                />

                <ImageModal
                    isOpen={modalOpen}
                    toggle={toggleModal}
                    imageSrc={currentImage}
                />
            </Container>
        </PageContent>
    )
}