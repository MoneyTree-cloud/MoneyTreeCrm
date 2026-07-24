/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, Col, Container, Label, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { ALL_LOCATION_DROPDOWN, GET_ALL_HR_VISITOR_DATA, GET_ALL_USERS_DROPDOWN } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css";
import PageContent from "../../components/Common/PageContent";
import { MdMobileFriendly } from "react-icons/md";
import { defaultTheme } from "../../helpers/defaultTheme";
import { formatDateForInput, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { decryptData } from "../../components/Common/CryptoUtils";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import Select from 'react-select';

const VisitorHrDetails = () => {
    const LIMIT = 200;
    const [page, setPage] = useState(1);
    const [apiUrl, setApiUrl] = useState("");
    const [customerData, setCustomerData] = useState([]);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);
    const [flag, setFlag] = useState(false)
    const [location, setLocation] = useState(null);
    const [meetingWith, setMeetingWith] = useState(null);
    const { data: locationList } = useGet(ALL_LOCATION_DROPDOWN);
    const { data: allUsersList } = useGet(GET_ALL_USERS_DROPDOWN);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'interview-hr-history');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                getInitialData(); // Fetch initial data if access is granted
            }
        };
        checkAccess();
    }, [userId]);

    const getInitialData = () => {
        const now = new Date();
        setFromDate(formatDateForInput(now));
        setToDate(formatDateForInput(now));
        setApiUrl(buildApiUrl(formatDateForInput(now), formatDateForInput(now), 0));
        setLocation(null);
        setMeetingWith(null);
        setPage(1);
        setFlag(false);
    }

    const buildApiUrl = (from, to, offset, location, meetingWith) => {
        let url = `${GET_ALL_HR_VISITOR_DATA}${from}&todate=${to}&offset=${offset}&limit=${LIMIT}`;

        // Append location if it exists
        if (location) {
            url += `&location=${location}`;
        }

        // Append meetingWith if it exists
        if (meetingWith) {
            url += `&toWhomId=${meetingWith}`;
        }

        return url;
    };

    const { data, isLoading } = useGet(apiUrl, { enabled: Boolean(apiUrl && accessGranted) });

    useEffect(() => {
        if (data?.data?.status === 1) {

            decryptData(data?.data?.data).then((decryptedData) => {
                if (decryptedData) {
                    setCustomerData(decryptedData);
                } else {
                    setCustomerData([]);
                }
            });
        }
    }, [data]);

    const handleShowButton = (e) => {
        e.preventDefault();
        setPage(1);
        setApiUrl(buildApiUrl(fromDate, toDate, 0, location?.label, meetingWith?.value));
    };

    useEffect(() => {
        if (flag) {
            setApiUrl(buildApiUrl(fromDate, toDate, page - 1, location?.label, meetingWith?.value));
        }
    }, [page, flag]);

    const columns = useMemo(
        () => [
            {
                name: <span className="font-weight-bold fs-13">SL No.</span>,
                selector: (_, index) => index + 1,
                width: "6%"
            },
            {
                name: <span className="font-weight-bold fs-13">Meeting With</span>,
                selector: (row) => row.associateId,
                sortable: true,
                cell: (row) => <WordWrapCell>{`${row.associateName} (${row.associateCode})`}</WordWrapCell>
            },
            {
                name: <span className="font-weight-bold fs-13">Name</span>,
                selector: (row) => row.name,
                sortable: true,
                cell: (row) => <WordWrapCell>{row.name}</WordWrapCell>
            },
            {
                name: <span className="font-weight-bold fs-13">Mobile No.</span>,
                selector: (row) => row.mobileNo,
                cell: (row) => (
                    <div className="phone-container">
                        <MdMobileFriendly className="phone-icon" color={defaultTheme.goldColorLogo} />
                        <span className="phone-number">{row.mobileNo}</span>
                    </div>
                ),
            },
            {
                name: <span className="font-weight-bold fs-13">Type</span>,
                selector: (row) => row.visitorType,
                sortable: true,
                cell: (row) => <WordWrapCell>{row.visitorType}</WordWrapCell>
            },
            {
                name: <span className="font-weight-bold fs-13">Entry City</span>,
                selector: (row) => row.entryCity,
                sortable: true,
                cell: (row) => <WordWrapCell>{row.entryCity}</WordWrapCell>
            },
            {
                name: <span className="font-weight-bold fs-13">Purpose</span>,
                selector: (row) => row.purpose,
                sortable: true,
                cell: (row) => <WordWrapCell>{row.purpose}</WordWrapCell>
            },
            {
                name: <span className="font-weight-bold fs-13">Entry Date & Time</span>,
                selector: (row) => row.createDate,
                sortable: true,
                cell: (row) => <WordWrapCell>{formatDateTime(row.createDate)}</WordWrapCell>
            },
        ],
        []
    );

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Interview/TP" breadcrumbItem="History" />
            {(isLoading) && <ScreenLoader />}
            <Container fluid>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowButton}>
                            <Row className="g-3">
                                <Col sm="12" md="2">
                                    <Label for="phone" className="font-size-11 fw-semibold text-muted">From Date</Label>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col sm="12" md="2">
                                    <Label for="phone" className="font-size-11 fw-semibold text-muted">To Date</Label>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </Col>
                                {/* Meeting With Filter */}
                                <Col sm="12" md="3">
                                    <Label for="recruiter" className="font-size-11 fw-semibold text-muted">Select Meeting With</Label>
                                    <Select
                                        options={allUsersList?.data?.data || []}
                                        value={meetingWith}
                                        isClearable
                                        onChange={(val) => setMeetingWith(val)}
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                {/* Location Filter */}
                                <Col sm="12" md="3">
                                    <Label for="location" className="font-size-11 fw-semibold text-muted">Select Location</Label>
                                    <Select
                                        options={locationList?.data?.data || []}
                                        value={location}
                                        isClearable
                                        onChange={(val) => setLocation(val)}
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col md="2" className="d-flex align-items-end justify-content-start">
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
                                        onClick={getInitialData}
                                    >
                                        Reset
                                    </Button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={customerData?.content}
                    paginationTotalRows={customerData?.totalElements}
                    paginationServer
                    onChangePage={(newPage) => {
                        setPage(newPage)
                        setFlag(true)
                    }}
                    pagination
                    paginationPerPage={200}
                />
            </Container>
        </PageContent>
    );
};

export default VisitorHrDetails;