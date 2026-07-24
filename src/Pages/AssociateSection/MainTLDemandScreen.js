/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import ApiClient from '../../helpers/api_helper';
import { GET_ALL_SUB_TEAM_DROPDOWN, GET_DEMAND_REPORT, GET_DROPDOWN_BUILDER_, GET_MY_TEAM, GET_PROJECT_BY_BUILDER_, } from '../../helpers/url_helper';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import Select from "react-select";
import { useUserStore } from '../../store/useUserStore';
import AppTable from '../../components/Common/Table';
import { useGet } from '../../Hooks/useApi';
import { formatDate, formatDateForInput, roundToTwoDecimals, WordWrapCell } from '../../helpers/function_helper';

export default function MainTLDemandScreen() {
    const mainTeam = useUserStore((state) => state.user.mainTeam);
    const userId = useUserStore((state) => state.user.userId);
    const [isPending, setIsPending] = useState(false);
    const [builder, setBuilder] = useState(null)
    const [project, setProject] = useState(null)
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [saleId, setSaleId] = useState('');
    const [saledata, setSaledata] = useState([])
    const [clientName, setClientName] = useState('');
    const [selectedSubTeam, setSelectedSubTeam] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    const { data: subTeams } = useGet(`${GET_ALL_SUB_TEAM_DROPDOWN}${mainTeam}`, { enabled: Boolean(mainTeam) });
    const { data: usersList } = useGet(GET_MY_TEAM + userId);
    const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_);
    const { data: projectData } = useGet(`${GET_PROJECT_BY_BUILDER_}${builder?.value}`, { enabled: Boolean(builder?.value) });

    useEffect(() => {
        getSaleDataInit()
    }, [])

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
        let url = `${GET_DEMAND_REPORT}fromDate=${startDate}&toDate=${endDate}&saleStatus=Open&mainTeam=${mainTeam}`;

        if (builder) url += `&builderName=${encodeURIComponent(builder?.label)}`;
        if (project) url += `&projectName=${encodeURIComponent(project?.label)}`;
        url += `&saleId=${saleId ? encodeURIComponent(saleId) : 0}`;
        if (clientName) url += `&clientName=${encodeURIComponent(clientName)}`;
        if (selectedSubTeam) url += `&subTeam=${encodeURIComponent(selectedSubTeam?.value)}`;
        if (selectedUser) {
            const associate_Code = selectedUser?.label?.split('(')[1]?.split(')')[0];
            url += `&associateCode=${encodeURIComponent(associate_Code)}`;
        }

        ApiClient.get(url).then(response => {
            setIsPending(false);
            if (response.data.status === 1) setSaledata(response.data.data);
            else toast.error(response.data.message);
        }).catch(error => {
            setIsPending(false);
            toast.error(error.message);
        });
    }

    const handleSaleData = (e) => {
        e.preventDefault();
        getFinanceSaleData(fromDate, toDate, builder, project, saleId, clientName)
    }

    const handleClearData = () => {
        getSaleDataInit();
        setBuilder(null);
        setProject(null);
        setSaleId('');
        setClientName('');
        setSelectedUser(null);
        setSelectedSubTeam(null);
    }


    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: '3%'
        },
        {
            name: <span className="font-weight-bold fs-13">Unique ID</span>,
            selector: (row) => row.MTRS_ID,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.MTRS_ID}</WordWrapCell>,
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
            width: '13%',
            cell: (row) => <WordWrapCell>{row.AssociateName + ' (' + row.AssociateCode + ')'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Date of Booking</span>,
            selector: (row) => row.DateOfBooking,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.DateOfBooking)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">PLC/NPLC</span>,
            selector: (row) => row.PLC_NPLC,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.PLC_NPLC}</WordWrapCell>,
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
            cell: (row) => <WordWrapCell>{roundToTwoDecimals(row.finalCost)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Demand Amount</span>,
            selector: (row) => row.demand_amount,
            sortable: true,
            cell: (row) => <WordWrapCell>{roundToTwoDecimals(row.demand_amount)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">GST Amount</span>,
            selector: (row) => row.gst_amount,
            sortable: true,
            cell: (row) => <WordWrapCell>{roundToTwoDecimals(row.gst_amount)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Total Demand Amount</span>,
            selector: (row) => row.total_demand_amount,
            sortable: true,
            cell: (row) => <WordWrapCell>{roundToTwoDecimals(row.total_demand_amount)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Demand Date</span>,
            selector: (row) => row.demand_date,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.demand_date)}</WordWrapCell>,
        }
    ];

    return (
        <PageContent>
            <Breadcrumbs title="Associate Section" breadcrumbItem="Demand Data" />
            {(isPending) && <ScreenLoader />}
            <Container fluid={true}>
                <Container fluid={true}>
                    <Card>
                        <CardBody>
                            <form onSubmit={handleSaleData}>
                                <Row>
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
                                    <Col md="3 mt-2">
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
                                        <h6 className="font-size-11 mt-2">Sub Team</h6>
                                        <Select
                                            value={selectedSubTeam}
                                            onChange={(selected) => setSelectedSubTeam(selected)}
                                            options={subTeams?.data?.data || []}
                                            isClearable
                                            style={{ zIndex: 9999 }}
                                            isDisabled={!mainTeam}
                                            menuPortalTarget={document.body}
                                        />
                                    </Col>
                                    <Col md="3">
                                        <h6 className="font-size-11 mt-2">Select Associate</h6>
                                        <Select
                                            value={selectedUser}
                                            onChange={(selected) => setSelectedUser(selected)}
                                            options={usersList?.data?.data || []}
                                            isClearable
                                            style={{ zIndex: 9999 }}
                                            menuPortalTarget={document.body}
                                        />
                                    </Col>
                                    <Col md="3">
                                        <h6 className="font-size-11 mt-2">Client Name</h6>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={clientName}
                                            placeholder="Client Name..."
                                            onChange={(e) => setClientName(e.target.value)}
                                        />
                                    </Col>

                                    <Col md="3" className="d-flex align-items-end mt-3">
                                        <button className="btn btn-primary me-2" type="submit" onClick={handleSaleData}>Search</button>
                                        <button className="btn btn-secondary" type="button" onClick={handleClearData}>Clear</button>
                                    </Col>
                                </Row>
                            </form>
                        </CardBody>
                    </Card>


                    <AppTable
                        progressPending={isPending}
                        columns={columns}
                        data={saledata || []}
                        pagination
                    />

                </Container>
            </Container>
        </PageContent>
    );
}
