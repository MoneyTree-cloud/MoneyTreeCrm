/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import ApiClient from '../../helpers/api_helper';
import { GET_RA_RC_REPORT, GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_, GET_ALL_SUB_TEAM_DROPDOWN, GET_PAYMENT_BREAKUP } from '../../helpers/url_helper';
import { Card, CardBody, Col, Container, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import AppTable from '../../components/Common/Table';
import { formatDate, formatDateForInput, getDateDifference, WordWrapCell } from '../../helpers/function_helper';
import { useUserStore } from '../../store/useUserStore';
import { decryptData } from '../../components/Common/CryptoUtils';
import Select from "react-select";
import { useGet } from '../../Hooks/useApi';
import { defaultTheme } from '../../helpers/defaultTheme';

export default function SalesDuePaymentReport() {
    const { mainTl, subTl, mainTeam, subTeam } = useUserStore((state) => state.user);
    const [isPending, setIsPending] = useState(false);
    const [reportdata, setReportdata] = useState([])
    const [amountModalOpen, setAmountModalOpen] = useState(false)
    const [amountData, setAmountData] = useState([])

    const toggleAmountModal = () => setAmountModalOpen(!amountModalOpen);

    const initialFormState = {
        builder: null,
        project: null,
        subTeam: null
    };
    const [formState, setFormState] = useState(initialFormState);

    const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_);
    const { data: projectData } = useGet(`${GET_PROJECT_BY_BUILDER_}${formState?.builder?.value}`, { enabled: Boolean(formState?.builder?.value) });
    const shouldFetchSubTeams = mainTl === 'YES' && subTl === 'YES' && Boolean(mainTeam);
    const { data: subTeams } = useGet(`${GET_ALL_SUB_TEAM_DROPDOWN}${mainTeam}`, { enabled: shouldFetchSubTeams });

    const handleFormChange = (field, value) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        getReportData(null, null, null);
    }, []);

    const handleClear = () => {
        setFormState(initialFormState)
        getReportData(null, null, null)
    }

    const getReportData = (builder, project, sub_Team,) => {
        const now = new Date();
        const startOfMonth = '2024-01-01';
        const endOfMonth = new Date(now);
        const todayDate = formatDateForInput(endOfMonth);
        setIsPending(true);

        let url = `${GET_RA_RC_REPORT}${startOfMonth}&toDate=${todayDate}&mainTeam=${mainTeam}&financeBookingStatus=Open`;

        if (mainTl === 'NO' && subTl === 'YES') {
            url += `&subTeam=${subTeam}`;
        }
        if (builder) {
            url += `&builderName=${builder?.label}`
        }
        if (project) {
            url += `&projectName=${project?.label}`
        }
        if (sub_Team) {
            url += `&subTeam=${sub_Team?.value}`
        }

        ApiClient.get(url)
            .then(function (response) {
                setIsPending(false);
                if (response.data.status === 1) {
                    const encryptedContent = response.data.data;
                    decryptData(encryptedContent)
                        .then((decrypted) => {

                            // Sort by Demand_Date (latest first)
                            const sorted = decrypted.sort((a, b) => {
                                const dateA = a.Demand_Date ? new Date(a.Demand_Date) : new Date(0);
                                const dateB = b.Demand_Date ? new Date(b.Demand_Date) : new Date(0);
                                return dateB - dateA;
                            });

                            setReportdata(sorted);
                        })
                        .catch(() => {
                            setReportdata([]);
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

    const getData = (e) => {
        if (e) e.preventDefault();
        getReportData(formState.builder, formState.project, formState.subTeam)
    }

    const handleViewPayment = (MTRS_ID) => {
        ApiClient.get(`${GET_PAYMENT_BREAKUP}${MTRS_ID}`)
            .then(function (response) {
                if (response.data.status === 1) {
                    setAmountData(response.data.data)
                    toggleAmountModal();
                } else {
                    toast.error(response.data.message)
                }
            })
            .catch(function (error) {
                toast.error(error.message);
            });
    }

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, i) => i + 1,
            width: "4%",
        },
        {
            name: <span className="font-weight-bold fs-13">Unique ID</span>,
            selector: (row) => row.MTRS_ID,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.MTRS_ID}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">MTL/STL</span>,
            selector: (row) => row.Main_Team,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Main_Team + '/' + row.Sub_Team}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            selector: (row) => row.AssociateName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.AssociateName + " (" + row.AssociateCode + ")"}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Booking Date</span>,
            selector: (row) => row.DateOfBooking,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.DateOfBooking)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Builder Name</span>,
            selector: (row) => row.BuilderName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.BuilderName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Project Name</span>,
            selector: (row) => row.ProjectName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.ProjectName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row.ClientName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.ClientName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Unit No</span>,
            selector: (row) => row.UnitNo,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.UnitNo || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Payment Rec</span>,
            selector: (row) => row.Payment_Rec,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Payment_Rec || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Cleared Amount</span>,
            selector: (row) => row.Clearance_Amount,
            sortable: true,
            cell: (row) => (
                <WordWrapCell>
                    <span
                        className="attachment-count clickable"
                        onClick={() => row.Clearance_Amount > 0 && handleViewPayment(row.MTRS_ID)}
                        style={{
                            cursor: row.Clearance_Amount > 0 ? 'pointer' : 'not-allowed',
                            color: 'blue',
                            textDecoration: 'underline',
                            fontWeight: 'bold'
                        }}
                    >
                        {row.Clearance_Amount|| '-'}
                    </span>
                </WordWrapCell>
            )
        },
        {
            name: <span className="font-weight-bold fs-13">Due Balance</span>,
            selector: (row) => row.Due_Balance,
            sortable: true,
            cell: (row) => (
                <WordWrapCell>
                    {row.Due_Balance % 1 === 0
                        ? row.Due_Balance
                        : Math.round(row.Due_Balance)}
                </WordWrapCell>
            )
        },
        {
            name: <span className="font-weight-bold fs-13">Due Date As Per Builder</span>,
            selector: (row) => row.builder_due_date,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.builder_due_date) || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Due Date As Per Sales</span>,
            selector: (row) => row.Demand_Date,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.Demand_Date) || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Aging (Days)</span>,
            selector: (row) => row.builder_due_date,
            sortable: true,
            cell: (row) => (
                <WordWrapCell>
                    {getDateDifference(row.builder_due_date, row.Demand_Date)}
                </WordWrapCell>
            )
        },
    ];

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Due Payment" />
            {(isPending) && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={getData}>
                            <Row className='g-3'>
                                <Col md="3">
                                    <h6 className="font-size-11">Builder</h6>
                                    <Select
                                        value={formState.builder}
                                        onChange={(val) => handleFormChange("builder", val)}
                                        options={builderList?.data?.data || []}
                                        isClearable
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Project</h6>
                                    <Select
                                        value={formState.project}
                                        onChange={(val) => handleFormChange("project", val)}
                                        options={projectData?.data?.data || []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        isDisabled={!formState.builder}
                                    />
                                </Col>
                                {(mainTl === 'YES' && subTl === 'YES') &&
                                    <Col md="3">
                                        <h6 className="font-size-11">Sub Team</h6>
                                        <Select
                                            value={formState.subTeam}
                                            onChange={(val) => handleFormChange("subTeam", val)}
                                            options={subTeams?.data?.data || []}
                                            isClearable
                                            style={{ zIndex: 9999 }}
                                            menuPortalTarget={document.body}
                                        />
                                    </Col>
                                }
                                <Col md="3" className="d-flex align-items-end">
                                    <button className="btn btn-primary me-2" type="submit">Search</button>
                                    <button className="btn btn-secondary" type="button" onClick={handleClear}>Clear</button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                <AppTable
                    progressPending={isPending}
                    columns={columns}
                    data={reportdata || []}
                    pagination
                    conditionalRowStyles={[
                        {
                            when: (row) => {
                                const today = new Date();
                                const demandDate = row?.Demand_Date
                                    ? new Date(row?.Demand_Date)
                                    : null;

                                return demandDate && today > demandDate;
                            },
                            style: {
                                color: defaultTheme.redColor,
                                fontWeight: 'bold',
                            },
                        },
                    ]}
                />

                {amountData?.length > 0 &&
                    <Modal isOpen={amountModalOpen} toggle={toggleAmountModal}>
                        <ModalHeader toggle={toggleAmountModal}>Cleared Payment Details</ModalHeader>
                        <ModalBody>
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Instrument No</th>
                                            <th>Clearance Amount</th>
                                            <th>Clearance Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {amountData?.map((m, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{m.chequeNo}</td>
                                                <td>{m.clearanceAmount}</td>
                                                <td>{formatDate(m.clearanceDate)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </ModalBody>
                    </Modal>
                }
            </Container>
        </PageContent>
    );
}
