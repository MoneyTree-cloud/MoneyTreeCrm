/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import { useGet, usePost } from "../../Hooks/useApi";
import { GET_ALL_LETTER_HEAD, GET_ALL_USERS_DROPDOWN, UPLOAD_LETTER_HEAD } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import AppTable from "../../components/Common/Table";
import "../CSS/styles.css";
import Select from "react-select";

export default function LetterHeadAdminScreen() {
    const [file, setFile] = useState(null);
    const { userId } = useUserStore((state) => state.user);
    const fileInputRef = useRef(null);
    const [accessGranted, setAccessGranted] = useState(null);
    const LIMIT = 100;
    const [page, setPage] = useState(1);
    const [flag, setFlag] = useState(false)
    const [apiUrl, setApiUrl] = useState("");
    const [providedToCode, setProvidedToCode] = useState(null);
    const [status, setStatus] = useState(null);
    const [serialNumber, setSerialNumber] = useState(null);
    const { data: usersList } = useGet(GET_ALL_USERS_DROPDOWN);

    const buildApiUrl = (offset, providedToCode, status, serialNumber) => {
        let url = `${GET_ALL_LETTER_HEAD}?offset=${offset}&limit=${LIMIT}`;

        if (providedToCode) {
            url += `&empCode=${providedToCode?.label?.match(/\(([^()]*)\)\s*$/)?.[1] || ""}`;
        }

        if (status?.value) {
            url += `&status=${status.value}`;
        }
        if (serialNumber) {
            url += `&serialnumber=${serialNumber}`;
        }

        return url;
    };

    const { data: letterData, isLoading, refetch: getData } = useGet(apiUrl, { enabled: Boolean(apiUrl && accessGranted), });

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'letter-head-admin-screen');
            setAccessGranted(hasAccess);
            getInitialData();

        };
        checkAccess();
    }, [userId,]);

    const getInitialData = () => {
        setApiUrl(buildApiUrl(0, providedToCode, status, serialNumber));
    }

    const handleShowData = (e) => {
        e.preventDefault();
        setApiUrl(buildApiUrl(0, providedToCode, status, serialNumber));
    }

    const statusOptions = [
        { value: 'Unused', label: 'Unused' },
        { value: 'Used', label: 'Used' },
        { value: 'Damaged', label: 'Damaged' },
    ];

    useEffect(() => {
        if (flag) {
            setApiUrl(buildApiUrl(page - 1, providedToCode, status, serialNumber));
        }
    }, [page]);

    const { isPending: uploadLoading, mutate: leadExcelUpload } = usePost(
        UPLOAD_LETTER_HEAD + userId,
        {
            onSuccess: (response) => {
                if (response.data.status === 0) {
                    toast.error(response.data.message)
                }
                else {
                    toast.success(response.data.message);
                    getData()
                }
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // Clear the input value
                }
                setFile(null)
            },
            onError: (err) => {
                setFile(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // Clear the input value
                }
                toast.error(err.message);
            },
        }
    );

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            const allowedExtensions = ['.xls', '.xlsx'];
            const fileName = file.name;
            const fileExtension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();

            if (allowedExtensions.includes(fileExtension)) {
                setFile(file);
            } else {
                // Show error message
                toast.error('Invalid file type. Please upload an Excel file (.xls or .xlsx).');
                event.target.value = '';
            }
        }
    };

    const columns = useMemo(
        () => [
            {
                name: <span className="font-weight-bold fs-13">SL No.</span>,
                selector: (_, index) => index + 1,
                width: "6%",
            },
            {
                name: <span className="font-weight-bold fs-13">Serial No.</span>,
                selector: (row) => row.serialNumber,
                sortable: true,
                cell: (row) => <WordWrapCell>{row.serialNumber}</WordWrapCell>
            },
            {
                name: <span className="font-weight-bold fs-13">Provide To</span>,
                selector: (row) => row.providedToName,
                sortable: true,
                width: "15%",
                cell: (row) => <WordWrapCell>{row.providedToName + ' (' + row.providedToCode + ')'}</WordWrapCell>
            },
            {
                name: <span className="font-weight-bold fs-13">Provide By</span>,
                selector: (row) => row.providedBy,
                sortable: true,
                width: "15%",
                cell: (row) => <WordWrapCell>{row.providedBy}</WordWrapCell>
            },
            {
                name: <span className="font-weight-bold fs-13">Provided At</span>,
                selector: (row) => row.providedAt,
                sortable: true,
                width: "15%",
                cell: (row) => <WordWrapCell>{formatDateTime(row.providedAt)}</WordWrapCell>
            },
            {
                name: <span className="font-weight-bold fs-13">Type</span>,
                selector: (row) => row.letterType,
                sortable: true,
                width: "8%",
                cell: (row) => (
                    <span className="badge bg-info-subtle text-info">
                        {row.letterType}
                    </span>
                ),
            },
            {
                name: <span className="fw-bold fs-13">Status</span>,
                sortable: true,
                cell: (row) => {
                    const color =
                        row.status === "Used"
                            ? "success"
                            : row.status === "Damaged"
                                ? "danger"
                                : "secondary";

                    return (
                        <span className={`badge bg-${color}`}>
                            {row.status}
                        </span>
                    );
                },
                width: "10%",
            },
            {
                name: <span className="font-weight-bold fs-13">Updated At</span>,
                selector: (row) => row.updatedDate,
                sortable: true,
                width: "15%",
                cell: (row) => <WordWrapCell>{formatDateTime(row.updatedDate)}</WordWrapCell>
            },
            {
                name: <span className="font-weight-bold fs-13">Remarks</span>,
                selector: (row) => row.remarks,
                width: "40%",
                sortable: true,
                cell: (row) => <WordWrapCell>{row.remarks || '-'}</WordWrapCell>
            },
        ],
        []
    );

    const handleUploadData = () => {
        if (!file) {
            toast.error("Please Select File");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        leadExcelUpload(formData);
    };

    const handleClear = () => {
        setProvidedToCode(null);
        setStatus(null);
        setSerialNumber(null);
        setApiUrl(buildApiUrl(0, null, null, null));
    }

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Upload" breadcrumbItem="Letter Head" />
            {(uploadLoading || isLoading) && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <Row className="g-3">
                            <Col lg="6">
                                <h6 className=" font-size-12">Choose File <RequiredStar /></h6>
                                <input
                                    className="form-control"
                                    id="fileUpload"
                                    type="file"
                                    accept=".xls,.xlsx"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                />
                            </Col>
                            <Col
                                lg="4"
                                className="d-flex align-items-end"
                            >
                                <button
                                    type="button"
                                    className="btn btn-primary me-2"
                                    onClick={handleUploadData}
                                >
                                    Upload Data
                                </button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <form onSubmit={handleShowData}>
                            <Row className="g-3">
                                <Col md="3">
                                    <h6 className="font-size-11">Serial Number</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={serialNumber || ""}
                                        placeholder="Serial Number..."
                                        onChange={(e) => setSerialNumber(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Search Provided To</h6>
                                    <Select
                                        value={providedToCode}
                                        onChange={(setProvidedToCode)}
                                        options={usersList?.data?.data || []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Search Status</h6>
                                    <Select
                                        value={status}
                                        onChange={(setStatus)}
                                        options={statusOptions}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="3" className="d-flex align-items-end">
                                    <button className="btn btn-primary me-2" type="submit" onClick={handleShowData}>Show Data</button>
                                    <button className="btn btn-secondary" type="button" onClick={handleClear}>Clear</button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={letterData?.data?.data?.content || []}
                    paginationTotalRows={letterData?.data?.data?.totalElements || 0}
                    paginationServer
                    onChangePage={(newPage) => {
                        setPage(newPage);
                        setFlag(true)
                    }}
                    pagination
                />
            </Container>
        </PageContent>
    );
}
