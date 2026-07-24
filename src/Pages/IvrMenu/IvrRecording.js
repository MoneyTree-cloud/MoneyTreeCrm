/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, formatDateTimeWithSeconds, WordWrapCell } from "../../helpers/function_helper";
import { GET_ALL_MAIN_TEAM_DROPDOWN, GET_ALL_SUB_TEAM_DROPDOWN, GET_ALL_USERS_DROPDOWN, GET_MY_TEAM, IVR_RECORDING } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import Select from 'react-select';
import { MdMobileFriendly, MdRefresh } from "react-icons/md";
import { USER_TYPE } from "../../constants/global";
import { decryptData } from "../../components/Common/CryptoUtils";
import "../CSS/styles.css";
import { defaultTheme } from "../../helpers/defaultTheme";

const IvrRecording = () => {
    const LIMIT = 100;
    const [page, setPage] = useState(1);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [apiUrl, setApiUrl] = useState("");
    const [accessGranted, setAccessGranted] = useState(null);
    const [recordingData, setRecordingData] = useState([]);

    const { userId, role, mainTl, subTl, mainTeam, subTeam } = useUserStore((state) => state.user);
    const [filters, setFilters] = useState({
        mainTeam: null,
        subTeam: null,
        employeeCode: null
    });

    const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN, { enabled: !!(accessGranted) });
    const { data: employees } = useGet(role === USER_TYPE.ASSOCIATE ? GET_MY_TEAM + userId : GET_ALL_USERS_DROPDOWN, { enabled: !!accessGranted });
    const { data: subTeams } = useGet(`${GET_ALL_SUB_TEAM_DROPDOWN}${mainTl === 'YES' ? mainTeam : filters.mainTeam?.value}`, { enabled: Boolean((filters.mainTeam || mainTl === 'YES') && accessGranted) });

    useEffect(() => {
        const checkAccess = async () => {
            if (role !== USER_TYPE.ASSOCIATE) {
                const hasAccess = await CheckUserAccess(userId, 'ivr-recording');
                setAccessGranted(hasAccess);
                if (hasAccess) {
                    getInitialData();
                }
            }
            else {
                setAccessGranted(true);
                getInitialData();
            }
        };
        checkAccess();
    }, [userId]);

    const buildApiUrl = (from, to, offset, filters) => {
        const baseUrl = `${IVR_RECORDING}${from}&toDate=${to}&offset=${offset}&limit=${LIMIT}`;
        const filterParams = [];

        if (filters?.mainTeam?.value) {
            filterParams.push(`mainTeam=${encodeURIComponent(filters.mainTeam.value)}`);
        }
        else if (mainTl === 'YES' || subTl === 'YES') {
            filterParams.push(`mainTeam=${mainTeam}`);
        }

        if (filters?.subTeam?.value) {
            filterParams.push(`subTeam=${encodeURIComponent(filters.subTeam.value)}`);
        }
        else if (mainTl === "NO" && subTl === 'YES') {
            filterParams.push(`subTeam=${subTeam}`);
        }

        if (filters?.employeeCode?.label) {
            const match = filters.employeeCode.label.match(/\((\d+)\)/);
            if (match && match[1]) {
                filterParams.push(`empCode=${match[1]}`);
            }
        }

        const finalUrl = `${baseUrl}${filterParams.length ? '&' + filterParams.join('&') : ''}`;

        return finalUrl;
    };

    const { data, isLoading, refetch: getAllData } = useGet(apiUrl, { enabled: Boolean(apiUrl && accessGranted), });

    useEffect(() => {
        if (data?.data?.status === 1) {
            decryptData(data?.data?.data).then((decryptedData) => {
                if (decryptedData) {
                    setRecordingData(decryptedData);
                } else {
                    setRecordingData([])
                }
            });
        }
    }, [data]);

    const columns = useMemo(
        () => [{
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">Recording</span>,
            width: '33%',
            cell: (row) => <WordWrapCell><audio controls>
                <source src={row.callRecordingUrl} type="audio/mp3" />
                Your browser does not support the audio element.
            </audio></WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Emp Code</span>,
            selector: (row) => row.empCode,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.empCode}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">MT/ST</span>,
            selector: (row) => row.mainTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.callType === 'IN' ? null : row.mainTeam + '/' + row.subTeam}</WordWrapCell>
        },
        ...(role !== USER_TYPE.ASSOCIATE
            ? [
                {
                    name: <span className="font-weight-bold fs-13">Caller Number</span>,
                    selector: (row) => row.callerNumber,
                    sortable: true,
                    cell: (row) => (
                        <div className="phone-container">
                            <MdMobileFriendly
                                className="phone-icon"
                                color={defaultTheme.goldColorLogo}
                            />
                            <span className="phone-number">{row.callerNumber}</span>
                        </div>
                    ),
                },
            ]
            : []),
        {
            name: <span className="font-weight-bold fs-13">Total Duration (In Sec.)</span>,
            selector: (row) => row.talkTimeCallDuration,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.talkTimeCallDuration}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Pickup Time</span>,
            selector: (row) => formatDateTimeWithSeconds(row.pickupTime),
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTimeWithSeconds(row.pickupTime)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Hangup Time</span>,
            selector: (row) => formatDateTimeWithSeconds(row.hangupTime),
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTimeWithSeconds(row.hangupTime)}</WordWrapCell>
        }
        ],
        []
    );

    const handleClear = () => {
        setFilters({
            mainTeam: null,
            subTeam: null,
            employeeCode: null,
        });
        getInitialData();
    }

    const getInitialData = () => {
        const now = new Date();
        setFromDate(formatDateForInput(now));
        setToDate(formatDateForInput(now));
        setApiUrl(buildApiUrl(formatDateForInput(now), formatDateForInput(now), 0));
    }

    const handleShowButton = (e) => {
        e.preventDefault();
        setPage(1);
        setApiUrl(buildApiUrl(fromDate, toDate, 0, filters));
    };

    useEffect(() => {
        if (page > 1) {
            setApiUrl(buildApiUrl(fromDate, toDate, page - 1, filters));
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
            <Breadcrumbs title="IVR" breadcrumbItem="Recording" />
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
                                {role !== USER_TYPE.ASSOCIATE &&
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
                                }

                                {(role !== USER_TYPE.ASSOCIATE || mainTl === 'YES') &&
                                    <Col md="3">
                                        <h6 className="font-size-11">Sub Team</h6>
                                        <Select
                                            options={subTeams?.data?.data || []}
                                            value={filters.subTeam}
                                            isClearable
                                            onChange={(val) => setFilters(prev => ({ ...prev, subTeam: val }))}
                                            style={{ zIndex: 9999 }}
                                            // isDisabled={(filters.mainTeam === false || mainTl !== "YES")}
                                            menuPortalTarget={document.body}
                                        />
                                    </Col>
                                }

                                <Col md="3">
                                    <h6 className="font-size-11">Select Associate</h6>
                                    <Select
                                        options={employees?.data?.data || []}
                                        value={filters.employeeCode}
                                        isClearable
                                        onChange={(val) => setFilters(prev => ({ ...prev, employeeCode: val }))}
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>

                                <Col md="3" className="d-flex align-items-end justify-content-start">
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
                    data={recordingData?.content || []}
                    paginationTotalRows={recordingData?.totalElements || 0}
                    paginationServer
                    onChangePage={setPage}
                    pagination
                />
            </Container>
        </PageContent>
    );
};

export default IvrRecording;