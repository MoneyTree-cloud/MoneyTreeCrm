/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import ApiClient from '../../helpers/api_helper';
import { FINANCE_SALE_REPORT_EXCEL_DOWNLOAD, GET_DROPDOWN_BUILDER_, GET_FINANCE_SALE_REPORT, GET_PROJECT_BY_BUILDER_, GET_SALE_DETAILS, UPDATE_FINANCE_SALE_REPORT } from '../../helpers/url_helper';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import Select from "react-select";
import { useUserStore } from '../../store/useUserStore';
import AppTable from '../../components/Common/Table';
import { useGet } from '../../Hooks/useApi';
import { formatDate, formatDateForInput, generateTimestamp, WordWrapCell } from '../../helpers/function_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';
import { decryptData } from '../../components/Common/CryptoUtils';

export default function FinanceSaleUpdate() {
    const empCode = useUserStore((state) => state.user.empCode);
    const userId = useUserStore((state) => state.user.userId);
    const [accessGranted, setAccessGranted] = useState(null);

    const [mtrsId, setMtrsId] = useState('')
    const [isPending, setIsPending] = useState(false);
    const [mtrsData, setMtrsData] = useState('')
    const [financeBookingStatus, setFinanceBookingStatus] = useState(null)
    const [commisionStatus, setCommisionStatus] = useState(null)
    const [dueStatus, setDueStatus] = useState(null)
    const [builder, setBuilder] = useState(null)
    const [project, setProject] = useState(null)
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [saleId, setSaleId] = useState('');
    const [saledata, setSaledata] = useState([])
    const [showForm, setShowForm] = useState(false);
    const [searchBy, setSearchBy] = useState(null);
    const [searchValue, setSearchValue] = useState('');

    const searchByOptions = [
        { value: 'ClientName', label: 'Client Name' },
        { value: 'UnitNo', label: 'Unit No' },
        { value: 'AssociateName', label: 'Associate Name' }
    ];

    const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_, { enabled: !!accessGranted });

    const { data: projectData } = useGet(
        `${GET_PROJECT_BY_BUILDER_}${builder?.value}`,
        { enabled: Boolean(builder?.value) }
    );

    useEffect(() => {
        if (accessGranted) {
            getSaleDataInit()
        }
    }, [accessGranted])

    const getSaleDataInit = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        setFromDate(formatDateForInput(startOfMonth));
        setToDate(formatDateForInput(endOfMonth));

        getFinanceSaleData(formatDateForInput(startOfMonth), formatDateForInput(endOfMonth));
    }

    const getFinanceSaleData = (startDate, endDate, builder, project, saleId, searchBy, searchValue) => {
        setIsPending(true);
        let url = `${GET_FINANCE_SALE_REPORT}fromDate=${startDate}&toDate=${endDate}`;

        if (builder) {
            url += `&builderName=${encodeURIComponent(builder?.label)}`;
        }

        if (project) {
            url += `&projectName=${encodeURIComponent(project?.label)}`;
        }
        if (saleId) {
            url += `&saleId=${encodeURIComponent(saleId)}`;
        }
        else {
            url += `&saleId=0`;
        }

        if (searchBy && searchValue) {
            url += `&filterEnum=${encodeURIComponent(searchBy?.value)}&filterValue=${encodeURIComponent(searchValue)}`;
        }

        ApiClient.get(url).then(function (response) {
            setIsPending(false);
            if (response.data.status === 1) {
                const encryptedContent = response.data.data;
                decryptData(encryptedContent).then((decrypted) => {
                    setSaledata(decrypted);
                }).catch((error) => {
                    setSaledata([]);
                });
            } else {
                toast.error(response.data.message);
            }
        })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    }

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

    const handleClear = () => {
        setMtrsId('')
        setMtrsData('')
        setShowForm(false)
    }

    const financeBookingStatusGroup = [
        { value: 'Open', label: "Open" },
        { value: 'Cancel', label: "Cancel" },
        { value: 'Closed', label: "Closed" },
        { value: 'PartiallyClosed', label: "Partially Closed" }
    ]

    const commissionStatusGroup = [
        { value: 'Pending', label: "Pending" },
        { value: 'Received', label: "Received" },
    ]

    const dueStatusGroup = [
        { value: 'Pending', label: "Pending" },
        { value: 'Completed', label: "Completed" },
    ]

    const handleUpdateData = () => {
        if (!financeBookingStatus) {
            toast.error('Please Select Finance Booking Status')
            return;
        }
        else if (!commisionStatus) {
            toast.error('Please Select Commision Status')
            return;
        }
        else if (!dueStatus) {
            toast.error('Please Select Due Status')
            return;
        }
        else {
            setIsPending(true)
            ApiClient.post(`${UPDATE_FINANCE_SALE_REPORT}financeBookingStatus=${financeBookingStatus?.value}&commissionStatus=${commisionStatus?.value}&dueStatus=${dueStatus?.value}&saleId=${mtrsData?.saleId}&loginId=${empCode}`)
                .then(function (response) {
                    setIsPending(false);
                    if (response.data.status === 1) {
                        setMtrsData('')
                        setMtrsId('')
                        toast.success(response.data.message)
                        handleSaleData()
                        setCommisionStatus(null)
                        setFinanceBookingStatus(null)
                        setDueStatus(null)
                        setShowForm(false)
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

    const handleSaleData = () => {
        if (searchBy && !searchValue) {
            toast.error('Please Enter Search Value')
            return;
        }
        else if (!searchBy && searchValue) {
            toast.error('Please Select Search By')
            return;
        }
        getFinanceSaleData(fromDate, toDate, builder, project, saleId, searchBy, searchValue);
    }

    const handleClearData = () => {
        getSaleDataInit()
        setBuilder(null)
        setProject(null)
        setSaleId('')
        setSearchBy(null)
        setSearchValue('')
    }

    const downloadSaleExcel = () => {
        setIsPending(true)
        let url = `${FINANCE_SALE_REPORT_EXCEL_DOWNLOAD}${fromDate}&toDate=${toDate}`;
        if (builder) {
            url += `&builderName=${encodeURIComponent(builder?.label)}`;
        }
        if (project) {
            url += `&projectName=${encodeURIComponent(project?.label)}`;
        }

        ApiClient.get(url, { responseType: "arraybuffer" })
            .then(function (response) {
                setIsPending(false)
                const contentType = response.headers["content-type"];
                if (
                    contentType !==
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ) {
                    const errorResponse = new TextDecoder("utf-8").decode(
                        new Uint8Array(response.data)
                    );
                    const parsedError = JSON.parse(errorResponse);

                    if (parsedError.status === 0) {
                        toast.error(parsedError.message || "Something went wrong!");
                    } else {
                        toast.error("Unexpected error occurred!");
                    }
                    return;
                }

                const blob = new Blob([response.data], {
                    type: contentType,
                });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = `financeBookingData_${generateTimestamp()}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(function (error) {
                setIsPending(false)
                toast.error(error.message || "An unexpected error occurred.");
            });
    }

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: '2%'
        },
        {
            name: <span className="font-weight-bold fs-13">Unique ID</span>,
            selector: (row) => row.MTRS_ID,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.MTRS_ID}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Main Team</span>,
            selector: (row) => row.Main_Team,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Main_Team}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Sub Team</span>,
            selector: (row) => row.Sub_Team,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Sub_Team}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Code</span>,
            selector: (row) => row.AssociateCode,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.AssociateCode}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Name</span>,
            selector: (row) => row.AssociateName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.AssociateName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Date of Booking</span>,
            selector: (row) => row.DateOfBooking,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.DateOfBooking)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Builder Name</span>,
            selector: (row) => row.BuilderName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.BuilderName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Project Name</span>,
            selector: (row) => row.ProjectName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.ProjectName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row.ClientName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.ClientName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Floor</span>,
            selector: (row) => row.Floor,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Floor}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Tower/Block</span>,
            selector: (row) => row.TowerBlock,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.TowerBlock}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Unit No</span>,
            selector: (row) => row.UnitNo,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.UnitNo}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Form Stage</span>,
            selector: (row) => row.Form_Stage,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Form_Stage}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">KYC Status</span>,
            selector: (row) => row.KycStauts,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.KycStauts}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Customer Care Status</span>,
            selector: (row) => row.CustomerCareStatus,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.CustomerCareStatus}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">BBA Status</span>,
            selector: (row) => row.BbaStatus,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.BbaStatus}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Finance Booking Status</span>,
            selector: (row) => row.FinanceBookingStauts,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.FinanceBookingStauts}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Commission Status</span>,
            selector: (row) => row.CommissionStatus,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.CommissionStatus}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Due Status</span>,
            selector: (row) => row.DueStatus,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.DueStatus}</WordWrapCell>,
        },
    ];

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'finance-sale-update');
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
            <Breadcrumbs title="Finance" breadcrumbItem="Sale Update" />
            {(isPending) && <ScreenLoader />}
            <Container fluid={true}>
                <div>
                    <button
                        type="button"
                        className="btn btn-secondary mb-3"
                        onClick={() => setShowForm(prev => !prev)}
                        style={{ fontSize: '13px' }}
                    >
                        {showForm ? (
                            <span><FaChevronUp /> Hide Form</span>
                        ) : (
                            <span><FaChevronDown /> Show Form</span>
                        )}
                    </button>
                </div>
                {showForm &&
                    <Card>
                        <CardBody>
                            <form onSubmit={handleShowData}>
                                <Row className='g-3'>
                                    <Col md="6">
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
                                    <Row className='g-2'>
                                        <Col md="3">
                                            <p>
                                                <strong>Client Name:</strong> {mtrsData?.clientName || "N/A"}
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
                                                <strong>Unit No.:</strong> {mtrsData?.unitNo || "N/A"}
                                            </p>
                                        </Col>

                                        <Col md="3">
                                            <strong style={{ marginBottom: '5px', display: 'block' }}>Finance Booking Status : <span style={{ color: 'red' }}>*</span></strong>
                                            <Select
                                                isClearable
                                                value={financeBookingStatus}
                                                onChange={(selected) => setFinanceBookingStatus(selected)}
                                                options={financeBookingStatusGroup}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <strong style={{ marginBottom: '5px', display: 'block' }}>Commision Status : <span style={{ color: 'red' }}>*</span></strong>
                                            <Select
                                                isClearable
                                                value={commisionStatus}
                                                onChange={(selected) => setCommisionStatus(selected)}
                                                options={commissionStatusGroup}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <strong style={{ marginBottom: '5px', display: 'block' }}>Due Status : <span style={{ color: 'red' }}>*</span></strong>
                                            <Select
                                                isClearable
                                                value={dueStatus}
                                                onChange={(selected) => setDueStatus(selected)}
                                                options={dueStatusGroup}
                                            />
                                        </Col>
                                    </Row>

                                    <hr className="dashed-divider" />
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            onClick={handleUpdateData}
                                        >
                                            Update
                                        </button>
                                    </div>
                                </div>
                            }
                        </CardBody>
                    </Card>
                }

                <Card>
                    <CardBody>
                        <form onSubmit={handleSaleData}>
                            <Row className='g-3'>
                                <Col md="3">
                                    <h6 className="font-size-11">From Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={fromDate}
                                        onChange={e => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">To Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={toDate}
                                        onChange={e => setToDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Builder</h6>
                                    <Select
                                        value={builder}
                                        onChange={(selected) => setBuilder(selected)}
                                        options={builderList?.data?.data || []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Project</h6>
                                    <Select
                                        value={project}
                                        onChange={(selected) => setProject(selected)}
                                        options={projectData?.data?.data || []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        isDisabled={!builder}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Unique ID</h6>
                                    <input
                                        id="mtrsId"
                                        className="form-control"
                                        type="text"
                                        value={saleId}
                                        placeholder="Enter Unique ID..."
                                        onChange={(e) => setSaleId(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Search By</h6>
                                    <Select
                                        value={searchBy}
                                        onChange={(selected) => setSearchBy(selected)}
                                        options={searchByOptions}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Search</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={searchValue}
                                        placeholder="Search..."
                                        onChange={(e) => setSearchValue(e.target.value)}
                                    />
                                </Col>

                                <Col md="3" className="d-flex align-items-end">
                                    <button className="btn btn-primary me-2" type="button" onClick={handleSaleData}>Search</button>
                                    <button className="btn btn-secondary" type="button" onClick={handleClearData}>Clear</button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                {saledata?.length > 0 &&
                    <i
                        className="fas fa-file-excel"
                        style={{
                            color: defaultTheme.primary,
                            cursor: "pointer",
                            fontSize: "15px",
                        }}
                        onClick={downloadSaleExcel}
                    ></i>
                }

                <AppTable
                    progressPending={isPending}
                    columns={columns}
                    data={saledata || []}
                    pagination
                />

            </Container>
        </PageContent>
    );
}
