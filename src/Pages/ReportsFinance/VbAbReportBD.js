/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import ApiClient from '../../helpers/api_helper';
import { GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_, GET_ALL_MAIN_TEAM_DROPDOWN, GET_ALL_SUB_TEAM_DROPDOWN, GET_VA_AB_REPORT_BD, ALL_LOCATION_DROPDOWN_ID, DOWNLOAD_BD_RA_RC_EXCEL } from '../../helpers/url_helper';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import AppTable from '../../components/Common/Table';
import { formatDate, formatDateForInput, generateTimestamp, WordWrapCell } from '../../helpers/function_helper';
import { useUserStore } from '../../store/useUserStore';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';
import { decryptData } from '../../components/Common/CryptoUtils';
import Select from "react-select";
import { useGet } from '../../Hooks/useApi';
import { defaultTheme } from '../../helpers/defaultTheme';

export default function VbAbReportBD() {
    const { userId } = useUserStore((state) => state.user);
    const [isPending, setIsPending] = useState(false);
    const [reportdata, setReportdata] = useState([])
    const [accessGranted, setAccessGranted] = useState(null);

    const initialFormState = {
        fromDate: "",
        toDate: "",
        saleId: "",
        builder: null,
        project: null,
        mainTeam: null,
        subTeam: null,
        dueDate: "",
        financeBookingStatus: null,
        branch: null
    };

    const [formState, setFormState] = useState(initialFormState);
    const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_, { enabled: Boolean(accessGranted) });
    const { data: projectData } = useGet(`${GET_PROJECT_BY_BUILDER_}${formState?.builder?.value}&bdId=${userId}`, { enabled: Boolean(formState?.builder?.value && accessGranted) });
    const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN, { enabled: Boolean(accessGranted) });
    const { data: subTeams } = useGet(
        `${GET_ALL_SUB_TEAM_DROPDOWN}${formState?.mainTeam?.value}`,
        { enabled: Boolean(formState?.mainTeam && accessGranted) }
    );
    const { data: locationList } = useGet(ALL_LOCATION_DROPDOWN_ID, { enabled: Boolean(accessGranted) });

    const handleFormChange = (field, value) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'bd-vb-ab-report');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                getDataInit();
            }
        };
        checkAccess();
    }, [userId]);

    const handleClear = () => {
        setFormState(initialFormState)
        getDataInit()
    }

    const getDataInit = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // const startOfMonth = '2024-01-01'
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setFormState(prevState => ({
            ...prevState,
            fromDate: formatDateForInput(startOfMonth),
            toDate: formatDateForInput(endOfMonth)
        }));
        getReportData(formatDateForInput(startOfMonth), formatDateForInput(endOfMonth));
    }

    const getReportData = (startDate, endDate, builder, project, mainTeam, subTeam, saleId, financeBookingStatus, dueDate, branch) => {
        setIsPending(true);
        let url = `${GET_VA_AB_REPORT_BD}${startDate}&toDate=${endDate}&bdId=${userId}&raStatus=Non Justified`;
        if (saleId) {
            url += `&saleId=${saleId}`
        }
        if (builder) {
            url += `&builderName=${builder?.label}`
        }
        if (project) {
            url += `&projectName=${project?.label}`
        }
        if (mainTeam) {
            url += `&mainTeam=${mainTeam?.value}`
        }
        if (subTeam) {
            url += `&subTeam=${subTeam?.value}`
        }
        if (financeBookingStatus) {
            url += `&financeBookingStatus=${financeBookingStatus}`
        }
        if (dueDate) {
            url += `&demandDate=${dueDate}`
        }
        if (branch) {
            url += `&location=${branch?.value}`
        }
        ApiClient.get(url).then(function (response) {
            setIsPending(false);
            if (response.data.status === 1) {
                const encryptedContent = response.data.data;
                decryptData(encryptedContent).then((decrypted) => {
                    setReportdata(decrypted);
                }).catch((error) => {
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
        getReportData(formState.fromDate, formState.toDate, formState.builder, formState.project, formState.mainTeam, formState.subTeam, formState.saleId, formState.financeBookingStatus?.value, formState.dueDate, formState.branch);
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
            name: <span className="font-weight-bold fs-13">Team</span>,
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
            cell: (row) => <WordWrapCell>{row.UnitNo}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Branch</span>,
            selector: (row) => row.Location,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Location}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Demand %</span>,
            selector: (row) => row.Demand,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Demand}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Balance Payment With GST</span>,
            selector: (row) => row.Balance_Payment_with_GST,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Balance_Payment_with_GST % 1 === 0
                ? row.Balance_Payment_with_GST
                : row.Balance_Payment_with_GST.toFixed(2)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Payment Received</span>,
            selector: (row) => row.Payment_Rec,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Payment_Rec}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Clearance Amount</span>,
            selector: (row) => row.Clearance_Amount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Clearance_Amount}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">BD Amount</span>,
            selector: (row) => row.BD_Amount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.BD_Amount}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Assured Business Status</span>,
            selector: (row) => row.AB_Status,
            sortable: true,
            cell: (row) =>
                <div style={{ wordWrap: "break-word", whiteSpace: "normal", color: row.AB_Status === 'Justified' ? 'green' : 'red', fontWeight: row.AB_Status === 'Justified' ? 'bold' : null }}>
                    {row.AB_Status}
                </div>
        },
        {
            name: <span className="font-weight-bold fs-13">Due Balance</span>,
            selector: (row) => row.Due_Balance,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Due_Balance % 1 === 0
                ? row.Due_Balance
                : row.Due_Balance.toFixed(2)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Aging (Days)</span>,
            selector: (row) => row.Aging,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.Aging}</WordWrapCell>
        }
    ];

    const downloadExcel = () => {
        setIsPending(true)
        let url = `${DOWNLOAD_BD_RA_RC_EXCEL}${formState.fromDate}&toDate=${formState.toDate}&bdId=${userId}&raStatus=Non Justified`;
        if (formState.saleId) {
            url += `&saleId=${formState.saleId}`
        }
        if (formState.builder) {
            url += `&builderName=${formState.builder?.label}`
        }
        if (formState.project) {
            url += `&projectName=${formState.project?.label}`
        }
        if (formState.mainTeam) {
            url += `&mainTeam=${formState.mainTeam?.value}`
        }
        if (formState.subTeam) {
            url += `&subTeam=${formState.subTeam?.value}`
        }
        if (formState.branch) {
            url += `&location=${formState.branch?.value}`
        }

        ApiClient.get(url, { responseType: "arraybuffer" }).then(function (response) {
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
            link.download = `BD_VB_AB_Report_${generateTimestamp()}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
            .catch(function (error) {
                setIsPending(false)
                toast.error(error.message || "An unexpected error occurred.");
            });
    }

    const financeBookingStatusGroup = [
        { value: 'Open', label: "Open" },
        { value: 'Cancel', label: "Cancel" },
        { value: 'Closed', label: "Closed" }
    ]

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="VB/AB" />
            {(isPending) && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={getData}>
                            <Row className='g-3'>
                                <Col md="2">
                                    <h6 className="font-size-11">From Date</h6>
                                    <input type="date" className="form-control" value={formState.fromDate} onChange={(e) => handleFormChange("fromDate", e.target.value)} />

                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">To Date</h6>
                                    <input type="date" className="form-control" value={formState.toDate} onChange={(e) => handleFormChange("toDate", e.target.value)} />

                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Builder</h6>
                                    <Select
                                        value={formState.builder}
                                        onChange={(val) => handleFormChange("builder", val)}
                                        options={Array.isArray(builderList?.data?.data) ? builderList.data.data : []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Project</h6>
                                    <Select
                                        value={formState.project}
                                        onChange={(val) => handleFormChange("project", val)}
                                        options={Array.isArray(projectData?.data?.data) ? projectData.data.data : []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        isDisabled={!formState.builder}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Main Team</h6>
                                    <Select
                                        value={formState.mainTeam}
                                        onChange={(val) => handleFormChange("mainTeam", val)}
                                        options={Array.isArray(mainTeams?.data?.data) ? mainTeams.data.data : []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Sub Team</h6>
                                    <Select
                                        value={formState.subTeam}
                                        onChange={(val) => handleFormChange("subTeam", val)}
                                        options={Array.isArray(subTeams?.data?.data) ? subTeams.data.data : []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        isDisabled={!formState.mainTeam}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Unique ID</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formState.saleId}
                                        placeholder="Search By Unique ID..."
                                        onChange={(e) => handleFormChange("saleId", e.target.value)}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Due Date</h6>
                                    <input type="date" className="form-control" value={formState.dueDate} onChange={(e) => handleFormChange("dueDate", e.target.value)} />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Booking Status</h6>
                                    <Select
                                        value={formState.financeBookingStatus}
                                        onChange={(val) => handleFormChange("financeBookingStatus", val)}
                                        options={financeBookingStatusGroup || []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Branch</h6>
                                    <Select
                                        value={formState.branch}
                                        onChange={(val) => handleFormChange("branch", val)}
                                        options={Array.isArray(locationList?.data?.data) ? locationList?.data?.data : []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>

                                <Col md="4" className="d-flex align-items-end">
                                    <button className="btn btn-primary me-2" type="submit" onClick={getData}>Search</button>
                                    <button className="btn btn-secondary" type="button" onClick={handleClear}>Clear</button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                {reportdata?.length > 0 &&
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
                    data={reportdata || []}
                    pagination
                />

            </Container>
        </PageContent>
    );
}