import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { toast } from "react-toastify";
import { GET_ALL_BBA, GET_ALL_USERS_DROPDOWN, GET_SALE_DETAILS, UPLOAD_BBA } from "../../helpers/url_helper";
import ApiClient from "../../helpers/api_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PageContent from "../../components/Common/PageContent";
import AppTable from "../../components/Common/Table";
import { useUserStore } from "../../store/useUserStore";
import { useGet } from "../../Hooks/useApi";
import { defaultTheme } from "../../helpers/defaultTheme";
import { FaCheck, FaClock, FaTimes } from "react-icons/fa";
import { formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import Select from "react-select";
import { MdRefresh } from "react-icons/md";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import { formStageOptions } from "../../constants/global";

export default function UploadBBA() {
    const { empCode, userId } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);
    const { data: usersList } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: !!accessGranted });

    const [mtrsId, setMtrsId] = useState('')
    const [isPending, setIsPending] = useState(false);
    const [mtrsData, setMtrsData] = useState('')
    const [bbaFor, setBbaFor] = useState(null)
    const [mtrsAllData, setMtrsAllData] = useState([])
    const [page, setPage] = useState(1)
    const LIMIT = 100;

    const { data, isLoading: isLoadingData, refetch: getAllMtrsData } = useGet(`${GET_ALL_BBA}?offset=${page - 1}&limit=${LIMIT}`, { enabled: !!accessGranted });

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
        else if (!bbaFor) {
            toast.error('Please select a user to handover to.')
            return;
        }
        else {
            const formData = new FormData();
            formData.append("saleId", mtrsId);
            formData.append("loginId", empCode);
            formData.append("receiverName", bbaFor?.label);
            formData.append("receiverCode", bbaFor?.value);
            setIsPending(true)
            ApiClient.post(`${UPLOAD_BBA}`, formData)
                .then(function (response) {
                    setIsPending(false);
                    if (response.data.status === 1) {
                        setMtrsData('')
                        setBbaFor(null)
                        getAllMtrsData()
                        setMtrsId('')
                        toast.success(response.data.message)
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
        // setShowPDF(false)
    }

    const getFormStageLabel = (id) => {
        const option = formStageOptions.find(item => item.value === id);
        return option ? option.label : "N/A";
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">Uploaded Date & Time</span>,
            selector: (row) => row.bbaUploadDate,
            sortable: true,
            width: '16%',
            cell: (row) => <WordWrapCell>{formatDateTime(row.bbaUploadDate)}</WordWrapCell>
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
            width: "14%",
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
            name: <span className="font-weight-bold fs-13">Handover Details</span>,
            selector: (row) => row?.bbaReceiverName,
            sortable: true,
            width: "15%",
            cell: (row) => <WordWrapCell>{row.bbaReceiverName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Status</span>,
            selector: (row) => row?.bbaAccepted,
            width: "7%",
            cell: (row) => <WordWrapCell>{
                (row?.bbaAccepted && row?.bbaAcceptRejectDate != null) ?
                    <FaCheck
                        color={defaultTheme.primary}
                        size={16}
                        title="Accepted"
                    />
                    :
                    (row?.bbaAcceptRejectDate != null && !row?.bbaAccepted)
                        ?
                        <FaTimes
                            color={defaultTheme.redColor}
                            size={16}
                            title="Rejected"
                        /> :
                        <FaClock
                            color={defaultTheme.btnEnable}
                            size={16}
                            title="Pending"
                        />
            }</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Updated Date & Time</span>,
            selector: (row) => row?.bbaAcceptRejectDate,
            sortable: true,
            width: "17%",
            cell: (row) => <WordWrapCell>{formatDateTime(row?.bbaAcceptRejectDate)}</WordWrapCell>,
        },
    ];

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'upload-bba');
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
            <Breadcrumbs title="Upload" breadcrumbItem="BBA" />
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

                                <Col md="3" className="d-flex align-items-end">
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

                                <Row className='mt-3'>
                                    <Col md="3">
                                        <p>
                                            <strong>Associate Details:</strong> {mtrsData?.associateName || "N/A"}
                                        </p>
                                    </Col>
                                    <Col md="3">
                                        <p>
                                            <strong>MT/ST:</strong> {mtrsData?.mainTeam + '/' + mtrsData?.subTeam || "N/A"}
                                        </p>
                                    </Col>
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
                                    <Col md="3 mt-4">
                                        <p>
                                            <strong>Project:</strong> {mtrsData?.projectName || "N/A"}
                                        </p>
                                    </Col>
                                    <Col md="3 mt-4">
                                        <p>
                                            <strong>Unit No:</strong> {mtrsData?.unitNo || "N/A"}
                                        </p>
                                    </Col>
                                    <Col md="3 mt-4">
                                        <p>
                                            <strong>Form Stage:</strong> {getFormStageLabel(mtrsData?.formStageId) || "N/A"}
                                        </p>
                                    </Col>
                                    <Col md="3">
                                        <strong style={{ marginBottom: '5px', display: 'block' }}>Select Handover To :</strong>
                                        <Select
                                            style={{ zIndex: 9999 }}
                                            menuPortalTarget={document.body}
                                            isClearable
                                            value={bbaFor}
                                            onChange={(selected) => setBbaFor(selected)}
                                            options={Array.isArray(usersList?.data?.data) ? usersList?.data?.data : []}
                                        />

                                    </Col>

                                </Row>
                                <hr className="dashed-divider" />
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button
                                        type="submit"
                                        className="btn btn-primary ms-3"
                                        onClick={handleSaveData}
                                    >
                                        Save
                                    </button>
                                </div>

                            </div>
                        }

                    </CardBody>
                </Card>

                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: '10px' }}>
                    <MdRefresh
                        onClick={getAllMtrsData}
                        size={26}
                        style={{ cursor: 'pointer', color: 'green' }}
                        title="Refresh"
                    />
                </div>
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

        </PageContent>
    );
}
