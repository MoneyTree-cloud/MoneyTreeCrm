/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { ALL_LOCATION_DROPDOWN, GET_ALL_MAIN_TEAM_DROPDOWN, GET_ALL_SUB_TEAM_DROPDOWN, GET_ALL_USERS_DROPDOWN, TRACK_LOCATION, } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { FaMapMarkerAlt } from "react-icons/fa";
import Select from 'react-select';
import "../CSS/styles.css";
import { MdRefresh } from "react-icons/md";

const LocationTrack = () => {
    const LIMIT = 100;
    const [page, setPage] = useState(1);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [fromTime, setFromTime] = useState("");
    const [toTime, setToTime] = useState("");
    const [apiUrl, setApiUrl] = useState("");
    const [flag, setFlag] = useState(false)
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);
    const [filters, setFilters] = useState({
        mainTeam: null,
        subTeam: null,
        employeeCode: null,
        branch: null
    });

    const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN);
    const { data: locationList } = useGet(ALL_LOCATION_DROPDOWN);
    const { data: employees } = useGet(GET_ALL_USERS_DROPDOWN);
    const { data: subTeams } = useGet(`${GET_ALL_SUB_TEAM_DROPDOWN}${filters.mainTeam?.value}`, { enabled: Boolean(filters.mainTeam) });

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'track-location');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                getInitialData();
            }
        };
        checkAccess();
    }, [userId]);

    const buildApiUrl = (from, to, fromTime, toTime, offset, filters) => {
        const baseUrl = `${TRACK_LOCATION}${from}&toDate=${to}&fromTime=${fromTime ? fromTime + ':00' : '00:00:00'}&toTime=${toTime ? toTime + ':00' : '23:59:59'}&offset=${offset}&limit=${LIMIT}`;
        const filterParams = [];

        if (filters?.mainTeam?.value) {
            filterParams.push(`mainTeam=${encodeURIComponent(filters.mainTeam.value)}`);
        }

        if (filters?.subTeam?.value) {
            filterParams.push(`subTeam=${encodeURIComponent(filters.subTeam.value)}`);
        }

        if (filters?.employeeCode?.label) {
            const match = filters.employeeCode.label.match(/\((\d+)\)/);
            if (match && match[1]) {
                filterParams.push(`empCode=${match[1]}`);
            }
        }

        if (filters?.branch?.value) {
            filterParams.push(`branch=${encodeURIComponent(filters.branch.value)}`);
        }

        const finalUrl = `${baseUrl}${filterParams.length ? '&' + filterParams.join('&') : ''}`;

        return finalUrl;
    };

    const { data: locationData, isLoading, refetch: getAllData } = useGet(apiUrl, { enabled: Boolean(apiUrl && accessGranted), });

    const columns = useMemo(
        () => [{
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">Emp Details</span>,
            selector: (row) => row.employeeName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.employeeName + ' (' + row.employeeCode + ')'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">MT/ST</span>,
            selector: (row) => row.mainTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.mainTeam + '/' + row.subTeam}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Branch</span>,
            selector: (row) => row.branch,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.branch}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Location</span>,
            selector: (row) => row.latitude,
            cell: (row) => <WordWrapCell>
                {(row.latitude && row.longitude) ?
                    <FaMapMarkerAlt
                        title="View on Map"
                        onClick={() =>
                            window.open(
                                `https://www.google.com/maps/@${row.latitude},${row.longitude},16z?q=${row.latitude},${row.longitude}`,
                                "_blank"
                            )
                        }
                        style={{
                            cursor: "pointer",
                            color: defaultTheme.goldColorLogo,
                            fontSize: 18,
                        }}
                    /> : '-'}
            </WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
            selector: (row) => formatDateTime(row.createdDate),
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>
        }
        ],
        []
    );

    const handleClear = () => {
        setFilters({
            mainTeam: null,
            subTeam: null,
            employeeCode: null,
            branch: null,
        });
        setFromTime('')
        setToTime('')
        getInitialData();
    }

    const getInitialData = () => {
        const now = new Date();
        setFromDate(formatDateForInput(now));
        setToDate(formatDateForInput(now));
        setApiUrl(buildApiUrl(formatDateForInput(now), formatDateForInput(now), '00:00:00', '23:59:59', 0));
    }

    const handleShowButton = (e) => {
        e.preventDefault();
        setPage(1);
        setApiUrl(buildApiUrl(fromDate, toDate, fromTime, toTime, 0, filters));
    };

    useEffect(() => {
        if (flag) {
            setApiUrl(buildApiUrl(fromDate, toDate, fromTime, toTime, page - 1, filters));
        }
    }, [page]);

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Track" breadcrumbItem="Location" />
            {isLoading && <ScreenLoader />}
            <Container fluid>
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
                                    <h6 className="font-size-11">From Time</h6>
                                    <input
                                        className="form-control"
                                        type="time"
                                        value={fromTime}
                                        onChange={(e) => setFromTime(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">To Time</h6>
                                    <input
                                        className="form-control"
                                        type="time"
                                        value={toTime}
                                        onChange={(e) => setToTime(e.target.value)}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Main Team</h6>
                                    <Select
                                        options={mainTeams?.data?.data || []}
                                        value={filters.mainTeam}
                                        isClearable
                                        onChange={(val) => setFilters(prev => ({ ...prev, mainTeam: val }))}
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Sub Team</h6>
                                    <Select
                                        options={subTeams?.data?.data || []}
                                        value={filters.subTeam}
                                        isClearable
                                        onChange={(val) => setFilters(prev => ({ ...prev, subTeam: val }))}
                                        style={{ zIndex: 9999 }}
                                        isDisabled={!filters.mainTeam}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Employee</h6>
                                    <Select
                                        options={employees?.data?.data || []}
                                        value={filters.employeeCode}
                                        isClearable
                                        onChange={(val) => setFilters(prev => ({ ...prev, employeeCode: val }))}
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Branch</h6>
                                    <Select
                                        options={locationList?.data?.data || []}
                                        value={filters.branch}
                                        isClearable
                                        onChange={(val) => setFilters(prev => ({ ...prev, branch: val }))}
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="4" className="d-flex align-items-end">
                                    <Button
                                        color="primary"
                                        onClick={handleShowButton}
                                        type="submit"
                                        className="me-2"
                                    >
                                        Show
                                    </Button>
                                    <Button
                                        color="secondary"
                                        onClick={handleClear}
                                        type="reset"
                                    >
                                        Clear
                                    </Button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: '10px' }}>
                    <MdRefresh
                        onClick={getAllData}
                        size={26}
                        style={{ cursor: 'pointer', color: 'green' }}
                        title="Refresh"
                    />
                </div>

                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={locationData?.data?.data?.content || []}
                    paginationTotalRows={locationData?.data?.data?.totalElements || 0}
                    paginationServer
                    onChangePage={(newPage) => {
                        setPage(newPage);
                        setFlag(true);
                    }}
                    pagination
                />
            </Container>
        </PageContent>
    );
};

export default LocationTrack;