/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useLocation } from "react-router-dom";
import { defaultTheme } from "../../helpers/defaultTheme";
import { formatActionType, formatDate, formatDateForInput, getBookingMonthName, getBookingYear, WordWrapCell } from "../../helpers/function_helper";
import { GET_ALL_MAIN_TEAM_DROPDOWN, GET_ALL_SALE_DATA, GET_ALL_SUB_TEAM_DROPDOWN, GET_ALL_USERS_DROPDOWN, GET_DROPDOWN_BUILDER_, GET_PROJECT_BY_BUILDER_ } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import { useGet } from "../../Hooks/useApi";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import { formStageOptions, USER_TYPE } from "../../constants/global";

export default function BHSalesEntryNew() {
    const location = useLocation();
    const { userId, locationName, role } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);
    const LIMIT = 100;
    const { formState_: formStateFromNav, page_: pageFromNav } = location.state || {};

    const initialFormState = {
        fromDate: "",
        toDate: "",
        searchBy: null,
        searchValue: "",
        builder: null,
        project: null,
        formStage: null,
        mainTeam: null,
        subTeam: null,
        userList: null,
    };
    const [formState, setFormState] = useState(initialFormState);
    const [pending, setPending] = useState(false);
    const [saleEntryData, setSaleEntryData] = useState([]);

    const { data: builderList } = useGet(GET_DROPDOWN_BUILDER_, { enabled: Boolean(accessGranted) });
    const { data: projectData } = useGet(`${GET_PROJECT_BY_BUILDER_}${formState?.builder?.value}`, { enabled: Boolean(formState?.builder?.value) });
    const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN + '?active=false');
    const { data: subTeams } = useGet(
        `${GET_ALL_SUB_TEAM_DROPDOWN}${formState?.mainTeam?.value}`,
        { enabled: Boolean(formState?.mainTeam) }
    );
    const { data: usersList } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: Boolean(accessGranted) });

    const sortByOptions = [
        { label: "Client Name", value: "clientName" },
        { label: "Unique ID", value: "saleId" },
        { label: "Unit No.", value: "unitNo" },
    ];

    const handleFormChange = (field, value) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const getDefaultDates = () => {
        const now = new Date();

        // Start date: 6 months before, day = 1
        const startOfSixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

        // End date: end of current month
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return {
            fromDate: formatDateForInput(startOfSixMonthsAgo),
            toDate: formatDateForInput(endOfMonth),
        };
    };

    // ── Access check ──────────────────────────────────────────────────────────
    useEffect(() => {
        const checkAccess = async () => {
            if (role !== USER_TYPE.ASSOCIATE) {
                const hasAccess = await CheckUserAccess(userId, "bm-sales-entry-new");
                setAccessGranted(hasAccess);
                if (hasAccess) {
                    getInitData();
                }
            } else {
                setAccessGranted(true);
                getInitData();
            }
        };
        checkAccess();
    }, [userId, role]);

    const getInitData = () => {
        const defaults = getDefaultDates();
        setFormState((prev) => ({ ...prev, ...defaults }));

        if (!formStateFromNav && accessGranted) {
            fetchData({ ...formState, ...defaults }, 1);
        }
    }

    useEffect(() => {
        if (accessGranted) {
            getSaleData()
        }
    }, [pageFromNav, accessGranted]);

    const getSaleData = () => {
        const mergedState = {
            ...formState,
            ...formStateFromNav,
        };
        setFormState(mergedState);
        fetchData(mergedState, pageFromNav || 1);
    }

    const fetchData = async (state, currentPage) => {
        setPending(true);
        let url = `${GET_ALL_SALE_DATA}?fromDateStr=${state.fromDate}&toDateStr=${state.toDate}&page=${currentPage - 1}&size=${LIMIT}&branch=${locationName}`;

        if (state.searchBy?.value && state.searchValue) {
            url += `&key=${state.searchBy.value}&value=${state.searchValue}`;
        }
        if (state.builder?.value) {
            url += `&builderId=${state.builder.value}`;
        }
        if (state.project?.value) {
            url += `&projectId=${state.project.value}`;
        }
        if (state.formStage?.value) {
            url += `&formStageId=${state.formStage.value}`;
        }
        if (state.mainTeam?.value) {
            url += `&mainTeam=${state.mainTeam.value}`;
        }
        if (state.subTeam?.value) {
            url += `&subTeam=${state.subTeam.value}`;
        }
        if (state.userList?.value) {
            url += `&key=associateId&value=${state.userList.value}`;
        }

        try {
            const res = await ApiClient.get(url);
            if (res?.data?.status === 1) {
                const encryptedContent = res.data.data;
                decryptData(encryptedContent).then((decrypted) => {
                    setSaleEntryData(decrypted);
                }).catch((error) => {
                    setSaleEntryData([]);
                });
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setPending(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formState.searchBy && !formState.searchValue) return toast.error("Enter value to search");
        if (!formState.searchBy && formState.searchValue) return toast.error("Select a field to search by");
        fetchData(formState, 1);
    };

    const handleClear = () => {
        const defaults = getDefaultDates();
        const cleared = { ...initialFormState, ...defaults };
        setFormState(cleared);
        fetchData(cleared, 1);
    };

    const handlePagination = (newPage) => {
        fetchData(formState, newPage);
    };


    // Columns definition

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "4%",
            cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Unique ID</span>,
            selector: (row) => row.uniqueId,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.uniqueId}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Booking Status</span>,
            selector: (row) => row.bookingStatusName,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatActionType(row.bookingStatusName)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Name</span>,
            selector: (row) => row.associateName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.associateName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">MT/ST</span>,
            selector: (row) => row.mainTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.mainTeam + '/' + row.subTeam}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Booking Type</span>,
            selector: (row) => row.bookingType,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.bookingType}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Booking Date</span>,
            selector: (row) => (row.bookingDate ? formatDate(row.bookingDate) : ""),
            sortable: true,
            cell: (row) => <WordWrapCell>{row.bookingDate ? formatDate(row.bookingDate) : ""}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Booking Month</span>,
            selector: (row) => getBookingMonthName(row.bookingDate),
            sortable: true,
            cell: (row) => <WordWrapCell>{getBookingMonthName(row.bookingDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Booking Year</span>,
            selector: (row) => getBookingYear(row.bookingDate),
            sortable: true,
            cell: (row) => <WordWrapCell>{getBookingYear(row.bookingDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Form Stage</span>,
            selector: (row) => row.formStageName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.formStageName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Property Type</span>,
            selector: (row) => row.propTypeName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.propTypeName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Location</span>,
            selector: (row) => row.locationName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.locationName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Builder Name</span>,
            selector: (row) => row.builderName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Project Name</span>,
            selector: (row) => row.projectName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row.clientName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Unit Name</span>,
            selector: (row) => row.unitName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.unitName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">BBA Value</span>,
            selector: (row) => row.bbavalue,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.bbavalue || '-'}</WordWrapCell>,
        }
    ];

    useEffect(() => {
        setFormState((prev) => {
            let updated = { ...prev };
            let changed = false;

            // If builder is null, clear project
            if (!prev.builder && prev.project !== null) {
                updated.project = null;
                changed = true;
            }

            // If mainTeam is null, clear subTeam
            if (!prev.mainTeam && prev.subTeam !== null) {
                updated.subTeam = null;
                changed = true;
            }

            // Only update state if something actually changed
            return changed ? updated : prev;
        });
    }, [formState.builder, formState.mainTeam]);

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            {(pending) && <ScreenLoader />}
            <Breadcrumbs title="BH Menu" breadcrumbItem="Sales Entry New" />
            <Container fluid>
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardBody>
                            <Row className="g-2">
                                <Col md="2">
                                    <h6 className="font-size-11">From Date</h6>
                                    <input type="date" className="form-control" value={formState.fromDate} onChange={(e) => handleFormChange("fromDate", e.target.value)} />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">To Date</h6>
                                    <input type="date" className="form-control" value={formState.toDate} onChange={(e) => handleFormChange("toDate", e.target.value)} />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Search By</h6>
                                    <Select
                                        value={formState.searchBy}
                                        onChange={(val) => handleFormChange("searchBy", val)}
                                        options={sortByOptions}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Search</h6>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formState.searchValue}
                                        placeholder="Search..."
                                        onChange={(e) => handleFormChange("searchValue", e.target.value)}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Builder</h6>
                                    <Select
                                        value={formState.builder}
                                        onChange={(val) => handleFormChange("builder", val)}
                                        options={builderList?.data?.data || []}
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
                                        options={projectData?.data?.data || []}
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
                                        options={mainTeams?.data?.data || []}
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
                                        options={subTeams?.data?.data || []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        isDisabled={!formState.mainTeam}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Form Stage</h6>
                                    <Select
                                        value={formState.formStage}
                                        onChange={(val) => handleFormChange("formStage", val)}
                                        options={formStageOptions || []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="2">
                                    <h6 className="font-size-11">Select Associate</h6>
                                    <Select
                                        value={formState.userList}
                                        onChange={(val) => handleFormChange("userList", val)}
                                        options={usersList?.data?.data || []}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="2" className="d-flex align-items-end">
                                    <button className="btn btn-primary me-2" type="submit">Show</button>
                                    <button className="btn btn-secondary" type="button" onClick={handleClear}>Clear</button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </form>

                {/* <i
                    className="fas fa-file-excel"
                    style={iconStyle}
                    title="Download Excel"
                    fontSize="15px"
                    onClick={downloadDataExcel}
                /> */}

                <AppTable
                    columns={columns}
                    data={saleEntryData?.content}
                    progressPending={pending}
                    pagination
                    paginationServer
                    paginationTotalRows={saleEntryData?.totalElements}
                    onChangePage={handlePagination}
                    conditionalRowStyles={[
                        {
                            when: (row) => row.saleStatusId === 2,
                            style: { color: defaultTheme.primary }
                        },
                        {
                            when: (row) => row.saleStatusId === 3,
                            style: { color: defaultTheme.redColor }
                        },
                        {
                            when: (row) => row.saleStatusId === 4,
                            style: { color: defaultTheme.btnEnable }
                        }
                    ]}
                />
            </Container>
        </PageContent>
    );
}