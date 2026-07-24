import { useEffect, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { toast } from "react-toastify";
import { useGet, usePost } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { formatDateTime, formatINR, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { GET_ALL_MT_PAY_SCHEME_DATA, UPLOAD_MT_PAY_SCHEME_DATA } from "../../helpers/url_helper";

export default function MTPayScheme() {
    const userId = useUserStore((state) => state.user.userId);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const [accessGranted, setAccessGranted] = useState(null);

    const { data: schemeData, isLoading, refetch: refetchSchemes } = useGet(GET_ALL_MT_PAY_SCHEME_DATA, { enabled: Boolean(accessGranted) });

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "5%",
            cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Scheme Name</span>,
            sortable: true,
            selector: (row) => row.schemeName,
            cell: (row) => <WordWrapCell>{row.schemeName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Branch</span>,
            sortable: true,
            selector: (row) => row.branch,
            cell: (row) => <WordWrapCell>{row.branch}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Total Incentive</span>,
            sortable: true,
            selector: (row) => row.totalIncentive,
            cell: (row) => <WordWrapCell>{formatINR(row.totalIncentive)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">First Payout</span>,
            sortable: true,
            selector: (row) => row.firstPayout,
            cell: (row) => <WordWrapCell>{formatINR(row.firstPayout)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Second Payout</span>,
            sortable: true,
            selector: (row) => row.secondPayout,
            cell: (row) => <WordWrapCell>{formatINR(row.secondPayout)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Created At</span>,
            sortable: true,
            selector: (row) => row.createdDate,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
        }
    ];

    const { isPending: uploadLoading, mutate: mutateUpload } = usePost(
        UPLOAD_MT_PAY_SCHEME_DATA,
        {
            onSuccess: (response) => {
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // Clear the input value
                }
                if (response?.data.status === 1) {
                    toast.success(response.data.message);
                    setFile(null); // Clear the file state
                    refetchSchemes(); // Refetch the schemes after successful upload
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
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
                // Optional: Clear any previous error
            } else {
                // Show error message
                toast.error('Invalid file type. Please upload an Excel file (.xls or .xlsx).');
                // Reset the input field (optional)
                event.target.value = '';
            }
        }
    };

    const handleUploadData = () => {
        if (!file) {
            toast.error("Please Select File");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        mutateUpload(formData);
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'mt-pay-scheme');
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
            <Breadcrumbs title="Upload" breadcrumbItem="Upload Scheme" />
            {(uploadLoading) && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <Row>
                            <Col lg="4">
                                <h6 className="font-size-11 mt-1">Choose File <RequiredStar /></h6>
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
                                    className="btn btn-primary"
                                    onClick={handleUploadData}
                                >
                                    Upload
                                </button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={Array.isArray(schemeData?.data?.data) ? schemeData?.data?.data : []}
                    pagination
                />
            </Container>
        </PageContent>
    );
}