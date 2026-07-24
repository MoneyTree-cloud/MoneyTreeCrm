/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateForInput, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { GET_PULLBACK_SUSPECT } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { MdMobileFriendly, MdRefresh } from "react-icons/md";
import { decryptData } from "../../components/Common/CryptoUtils";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css";

const PullBackSuspect = () => {
    const LIMIT = 100;
    const [page, setPage] = useState(1);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [apiUrl, setApiUrl] = useState("");
    const [accessGranted, setAccessGranted] = useState(null);
    const [suspectData, setSuspectData] = useState([])
    const [flag, setFlag] = useState(false)
    const [suspectType, setSuspectType] = useState('uploaded')
    const userId = useUserStore((state) => state.user.userId);
    const [checkboxChecked, setCheckboxChecked] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'pull-back-suspect');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                getInitialData();
            }
        };
        checkAccess();
    }, [userId]);

    const buildApiUrl = (from, to, offset, suspectType, checkboxChecked) => {
        let finalUrl = `${GET_PULLBACK_SUSPECT}${from}&toDate=${to}&offset=${offset}&limit=${LIMIT}&transferred=${suspectType === 'uploaded' ? "NO" : "YES"}`;

        if (checkboxChecked) {
            finalUrl += `&status=hold`;
        }
        return finalUrl;
    };

    const { data, isLoading, refetch: getAllData } = useGet(apiUrl, { enabled: Boolean(apiUrl && accessGranted), });

    useEffect(() => {
        if (data?.data?.status === 1) {
            decryptData(data?.data?.data).then((decryptedData) => {
                if (decryptedData) {
                    setSuspectData(decryptedData);
                } else {
                    setSuspectData([])
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
            name: <span className="font-weight-bold fs-13">Name</span>,
            selector: (row) => row.leadName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.leadName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Mobile No.</span>,
            selector: (row) => row.leadMobile,
            cell: (row) => (
                <div className="phone-container">
                    <MdMobileFriendly
                        className="phone-icon"
                        color={defaultTheme.goldColorLogo}
                    />
                    <span className="phone-number">
                        {row.dnd ? "0000000000" : row.leadMobile}
                    </span>
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            selector: (row) => row.associateName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.associateName + ' (' + row.employeeCode + ')'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">MT/ST</span>,
            selector: (row) => row.mainTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.mainTeam + '/' + row.subTeam}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Project Name</span>,
            selector: (row) => row.projectName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Project Category</span>,
            selector: (row) => row.projectCategory,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.projectCategory}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Updated Date & Time</span>,
            selector: (row) => formatDateTime(row.updatedDate),
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.updatedDate)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Pullback Date & Time</span>,
            selector: (row) => formatDateTime(row.pullBackDate),
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.pullBackDate)}</WordWrapCell>
        }
        ],
        []
    );

    const getInitialData = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setFromDate(formatDateForInput(startOfMonth));
        setToDate(formatDateForInput(endOfMonth));
        setApiUrl(buildApiUrl(formatDateForInput(startOfMonth), formatDateForInput(endOfMonth), 0, suspectType, checkboxChecked));
    }

    const handleShowButton = (e) => {
        e.preventDefault();
        setPage(1);
        setApiUrl(buildApiUrl(fromDate, toDate, 0, suspectType, checkboxChecked));
    };

    useEffect(() => {
        if (flag) {
            setApiUrl(buildApiUrl(fromDate, toDate, page - 1, suspectType, checkboxChecked));
        }
    }, [page]);

    // Handle radio button change
    const handleRadioChange = (event) => {
        setSuspectType(event.target.value)
        setApiUrl(buildApiUrl(fromDate, toDate, 0, event.target.value, checkboxChecked));
    };

    const handleCheckboxChange = () => {
        setCheckboxChecked(prevState => {
            const newValue = !prevState;
            return newValue;
        });
        setApiUrl(buildApiUrl(fromDate, toDate, 0, suspectType, !checkboxChecked));
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Suspect" breadcrumbItem="Pull Back" />
            {isLoading && <ScreenLoader />}
            <Container fluid>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowButton}>
                            <Row className="g-3">
                                <Col md="4">
                                    <h6 className="font-size-11">From Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="4">
                                    <h6 className="font-size-11">To Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="4" className="d-flex align-items-end justify-content-start">
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
                                        type="reset"
                                    >
                                        Clear
                                    </Button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <div className="radio-button-container">
                            {["uploaded", "transferred"].map((type) => (
                                <label
                                    key={type}
                                    className={`radio-label ${suspectType === type ? "active" : ""}`}
                                >
                                    <input
                                        type="radio"
                                        value={type}
                                        checked={suspectType === type}
                                        onChange={handleRadioChange}
                                    />
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </label>
                            ))}
                        </div>
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                gap: "5px",
                                marginLeft: "20px"
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={checkboxChecked}
                                onChange={handleCheckboxChange}
                                style={{ cursor: "pointer" }}
                            />
                            <span>CallBack</span>
                        </label>
                    </div>
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
                    data={suspectData?.content || []}
                    paginationTotalRows={suspectData?.totalElements || 0}
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

export default PullBackSuspect;