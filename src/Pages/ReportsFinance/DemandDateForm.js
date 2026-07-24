/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import ApiClient from '../../helpers/api_helper';
import { DEMAND_REPORT_EXCEL_DOWNLOAD, GET_ALL_MAIN_TEAM_DROPDOWN, GET_ALL_SUB_TEAM_DROPDOWN, GET_ALL_USERS_DROPDOWN, GET_DEMAND_REPORT, GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_, UPDATE_DEMAND_DATE_REPORT, } from '../../helpers/url_helper';
import { Card, CardBody, Col, Container, Row, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import Select from "react-select";
import { useUserStore } from '../../store/useUserStore';
import AppTable from '../../components/Common/Table';
import { useGet } from '../../Hooks/useApi';
import { formatDate, formatDateForInput, generateTimestamp, WordWrapCell } from '../../helpers/function_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { FaEdit } from 'react-icons/fa';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';
import { decryptData } from '../../components/Common/CryptoUtils';

export default function DemandDateForm() {
    const empCode = useUserStore((state) => state.user.empCode);
    const [isPending, setIsPending] = useState(false);
    const [mtrsData, setMtrsData] = useState('')
    const [builder, setBuilder] = useState(null)
    const [project, setProject] = useState(null)
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [saleId, setSaleId] = useState('');
    const [saledata, setSaledata] = useState([])
    const [clientName, setClientName] = useState('');
    const [selectedMainTeam, setSelectedMainTeam] = useState(null);
    const [selectedSubTeam, setSelectedSubTeam] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({});

    const userId = useUserStore((state) => state.user.userId);
    const [accessGranted, setAccessGranted] = useState(null);

    const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN, { enabled: !!accessGranted });
    const { data: subTeams } = useGet(`${GET_ALL_SUB_TEAM_DROPDOWN}${selectedMainTeam?.value}`, { enabled: Boolean(selectedMainTeam) });
    const { data: usersList } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: !!accessGranted });
    const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_, { enabled: !!accessGranted });
    const { data: projectData } = useGet(`${GET_PROJECT_BY_BUILDER_}${builder?.value}`, { enabled: Boolean(builder?.value) });

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

    const getFinanceSaleData = (startDate, endDate, builder, project, saleId, clientName) => {
        setIsPending(true);
        let url = `${GET_DEMAND_REPORT}fromDate=${startDate}&toDate=${endDate}&saleStatus=Open`;

        if (builder) url += `&builderName=${encodeURIComponent(builder?.label)}`;
        if (project) url += `&projectName=${encodeURIComponent(project?.label)}`;
        url += `&saleId=${saleId ? encodeURIComponent(saleId) : 0}`;
        if (clientName) url += `&clientName=${encodeURIComponent(clientName)}`;
        if (selectedMainTeam) url += `&mainTeam=${encodeURIComponent(selectedMainTeam?.value)}`;
        if (selectedSubTeam) url += `&subTeam=${encodeURIComponent(selectedSubTeam?.value)}`;
        if (selectedUser) {
            const associate_Code = selectedUser?.label?.split('(')[1]?.split(')')[0];
            url += `&associateCode=${encodeURIComponent(associate_Code)}`;
        }

        ApiClient.get(url).then(response => {
            setIsPending(false);
            if (response.data.status === 1) {
                const encryptedContent = response.data.data;
                decryptData(encryptedContent).then((decrypted) => {
                    setSaledata(decrypted);
                }).catch((error) => {
                    setSaledata([]);
                });
            }
            else toast.error(response.data.message);
        }).catch(error => {
            setIsPending(false);
            toast.error(error.message);
        });
    }

    const handleEdit = (row) => {
        setEditData({
            demandDate: row.demand_date?.split(' ')[0] || ''
        });
        setMtrsData(row);
        setEditModalOpen(true);
    }

    const handleUpdateData = (demandDate) => {
        setIsPending(true);
        ApiClient.post(`${UPDATE_DEMAND_DATE_REPORT}saleId=${mtrsData?.MTRS_ID}&loginId=${empCode}&demandDate=${demandDate || ""}`)
            .then(response => {
                setIsPending(false);
                if (response.data.status === 1) {
                    toast.success(response.data.message);
                    handleSaleData();
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(error => {
                setIsPending(false);
                toast.error(error.message);
            });
    }

    const handleSaleData = (e) => {
        if (e) e.preventDefault();
        getFinanceSaleData(fromDate, toDate, builder, project, saleId, clientName)
    }

    const handleClearData = () => {
        getSaleDataInit();
        setBuilder(null);
        setProject(null);
        setSaleId('');
        setClientName('');
        setSelectedMainTeam(null);
        setSelectedUser(null);
        setSelectedSubTeam(null);
    }

    const downloadExcel = () => {
        setIsPending(true)
        let url = `${DEMAND_REPORT_EXCEL_DOWNLOAD}${fromDate}&toDate=${toDate}&saleStatus=Open`;

        if (builder) url += `&builderName=${encodeURIComponent(builder?.label)}`;
        if (project) url += `&projectName=${encodeURIComponent(project?.label)}`;
        url += `&saleId=${saleId ? encodeURIComponent(saleId) : 0}`;
        if (clientName) url += `&clientName=${encodeURIComponent(clientName)}`;
        if (selectedMainTeam) url += `&mainTeam=${encodeURIComponent(selectedMainTeam?.value)}`;
        if (selectedSubTeam) url += `&subTeam=${encodeURIComponent(selectedSubTeam?.value)}`;
        if (selectedUser) {
            const associate_Code = selectedUser?.label?.split('(')[1]?.split(')')[0];
            url += `&associateCode=${encodeURIComponent(associate_Code)}`;
        }

        ApiClient.get(url, { responseType: "arraybuffer" })
            .then(response => {
                setIsPending(false);
                const contentType = response.headers["content-type"];
                if (contentType !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                    const errorResponse = new TextDecoder("utf-8").decode(new Uint8Array(response.data));
                    const parsedError = JSON.parse(errorResponse);
                    toast.error(parsedError.message || "Unexpected error occurred!");
                    return;
                }
                const blob = new Blob([response.data], { type: contentType });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = `demandDateForm_${generateTimestamp()}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(error => {
                setIsPending(false);
                toast.error(error.message || "An unexpected error occurred.");
            });
    }
    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: '3%'
        },
        {
            name: <span className="font-weight-bold fs-13">Manage</span>,
            cell: (row) => (
                <FaEdit
                    style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
                    onClick={() => handleEdit(row)}
                    title="Edit"
                    size={20}
                />
            ),
            width: '5%',
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
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            selector: (row) => row.AssociateCode,
            sortable: true,
            width: '12%',
            cell: (row) => <WordWrapCell>{row.AssociateName + ' (' + row.AssociateCode + ')'}</WordWrapCell>,
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
            name: <span className="font-weight-bold fs-13">Area</span>,
            selector: (row) => row.area,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.area}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Final Cost</span>,
            selector: (row) => row.finalCost,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.finalCost}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Demand Amount</span>,
            selector: (row) => row.demand_amount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.demand_amount}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">GST Amount</span>,
            selector: (row) => row.gst_amount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.gst_amount}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Total Demand Amount</span>,
            selector: (row) => row.total_demand_amount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.total_demand_amount}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Demand Date</span>,
            selector: (row) => row.demand_date,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.demand_date)}</WordWrapCell>,
        }
    ];

    const handleModalUpdate = () => {
        if (!editData.demandDate) {
            toast.error('Please Select Demand Date');
            return;
        }
        setEditModalOpen(false);
        handleUpdateData(editData.demandDate);
    }

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'demand-date-form');
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
            <Breadcrumbs title="Finance" breadcrumbItem="Demand Date Form" />
            {(isPending) && <ScreenLoader />}
            <Container fluid={true}>
                <Container fluid={true}>
                    <Card>
                        <CardBody>
                            <form onSubmit={handleSaleData}>
                                <Row className='g-3'>
                                    <Col md="2">
                                        <h6 className="font-size-11">From Date</h6>
                                        <input
                                            className="form-control"
                                            type="date"
                                            value={fromDate}
                                            onChange={e => setFromDate(e.target.value)}
                                        />
                                    </Col>
                                    <Col md="2">
                                        <h6 className="font-size-11">To Date</h6>
                                        <input
                                            className="form-control"
                                            type="date"
                                            value={toDate}
                                            onChange={e => setToDate(e.target.value)}
                                        />
                                    </Col>
                                    <Col md="2">
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
                                    <Col md="2">
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
                                    <Col md="2">
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
                                    <Col md="2">
                                        <h6 className="font-size-11">Main Team</h6>
                                        <Select
                                            value={selectedMainTeam}
                                            onChange={(selected) => setSelectedMainTeam(selected)}
                                            options={mainTeams?.data?.data || []}
                                            isClearable
                                            style={{ zIndex: 9999 }}
                                            menuPortalTarget={document.body}
                                        />
                                    </Col>
                                    <Col md="2">
                                        <h6 className="font-size-11">Sub Team</h6>
                                        <Select
                                            value={selectedSubTeam}
                                            onChange={(selected) => setSelectedSubTeam(selected)}
                                            options={subTeams?.data?.data || []}
                                            isClearable
                                            style={{ zIndex: 9999 }}
                                            isDisabled={!selectedMainTeam}
                                            menuPortalTarget={document.body}
                                        />
                                    </Col>
                                    <Col md="2">
                                        <h6 className="font-size-11">Select Associate</h6>
                                        <Select
                                            value={selectedUser}
                                            onChange={(selected) => setSelectedUser(selected)}
                                            options={usersList?.data?.data || []}
                                            isClearable
                                            style={{ zIndex: 9999 }}
                                            menuPortalTarget={document.body}
                                        />
                                    </Col>
                                    <Col md="2">
                                        <h6 className="font-size-11">Client Name</h6>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={clientName}
                                            placeholder="Client Name..."
                                            onChange={(e) => setClientName(e.target.value)}
                                        />
                                    </Col>

                                    <Col md="3" className="d-flex align-items-end">
                                        <button className="btn btn-primary me-2" type="submit" onClick={handleSaleData}>Search</button>
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
                            onClick={downloadExcel}
                        ></i>
                    }

                    <AppTable
                        progressPending={isPending}
                        columns={columns}
                        data={saledata || []}
                        pagination
                    />

                </Container>

                {/* Modal */}
                <Modal isOpen={editModalOpen} toggle={() => setEditModalOpen(false)}>
                    <ModalHeader toggle={() => setEditModalOpen(false)}>
                        Edit Demand Date
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col md="12" className="mt-2">
                                <label>Demand Date</label>
                                <input
                                    className="form-control"
                                    type="date"
                                    value={editData.demandDate}
                                    onChange={e => setEditData({ ...editData, demandDate: e.target.value })}
                                />
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => handleModalUpdate()} style={{ backgroundColor: defaultTheme.primary }}>
                            Update
                        </Button>
                        <Button color="secondary" onClick={() => setEditModalOpen(false)} style={{ backgroundColor: defaultTheme.goldColorLogo }}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            </Container>
        </PageContent>
    );
}
