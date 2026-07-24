/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDate, formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { HR_JOINING_DETAILS, HR_UPDATE_JOINING_DETAILS_REMARKS } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { MdMobileFriendly } from "react-icons/md";
import { defaultTheme } from "../../helpers/defaultTheme";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function HrJoiningList() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [hrJoiningList, setHrJoiningList] = useState([]);
    const [isPending, setIsPending] = useState(false);
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);
    const [remarksStatus, setRemarksStatus] = useState('pending')

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'hr-joining-list');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                setDefaultDateRange();
            }
        };
        checkAccess();
    }, [userId]);

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "6%",
            cell: (_, i) => i + 1,
        },
        {
            name: <span className="font-weight-bold fs-13">Name</span>,
            selector: (row) => row.firstName,
            cell: (row) => <WordWrapCell>{row.firstName}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Mobile No.</span>,
            cell: (row) => (
                <div className="phone-container">
                    <MdMobileFriendly
                        className="phone-icon"
                        color={defaultTheme.goldColorLogo}
                    />
                    <span className="phone-number">
                        {row.phone}
                    </span>
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Designation</span>,
            selector: (row) => row.designation,
            cell: (row) => <WordWrapCell>{row.designation}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Location</span>,
            selector: (row) => row.finalLocation,
            cell: (row) => <WordWrapCell>{row.finalLocation}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">DOJ</span>,
            selector: (row) => row.doj,
            cell: (row) => <WordWrapCell>{formatDate(row?.doj)}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">MT</span>,
            selector: (row) => row.mainTeam,
            cell: (row) => <WordWrapCell>{row.mainTeam}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">ST</span>,
            selector: (row) => row.subTeam,
            cell: (row) => <WordWrapCell>{row.subTeam}</WordWrapCell>,
            sortable: true,
        },
        ...(remarksStatus === 'pending'
            ? [
                {
                    name: <span className="font-weight-bold fs-13">Remarks</span>,
                    width: '30%',
                    cell: (row, index) => (
                        <textarea
                            value={row.updateRemarks || ''}
                            className="form-control"
                            onChange={(e) => handleRemarksChange(e, index)}
                            placeholder="Enter remarks...."
                            rows="2"
                        />
                    ),
                    sortable: false,
                },
                {
                    name: <span className="font-weight-bold fs-13">Action</span>,
                    cell: (row, index) => (
                        <Button
                            color="secondary"
                            type="button"
                            size="sm"
                            onClick={() => handleSave(row, index)}
                        >
                            Save
                        </Button>
                    ),
                    sortable: false,
                },
            ]
            : []),
        ...(remarksStatus !== 'pending'
            ? [
                {
                    name: <span className="font-weight-bold fs-13">Remarks</span>,
                    cell: (row) => <WordWrapCell>{row?.followUpRemarks}</WordWrapCell>,
                    sortable: true,
                    width: '30%'
                },
            ]
            : []),
    ];

    const handleRemarksChange = (e, index) => {
        // Clone the current content array from hrJoiningList
        const updatedContent = [...hrJoiningList.content];

        // Update the remarks field for the specific row
        updatedContent[index].updateRemarks = e.target.value;

        // Set the full hrJoiningList object back, not just the content array
        setHrJoiningList(prev => ({
            ...prev,
            content: updatedContent
        }));
    };

    const handleSave = (row, i) => {
        if (!row.updateRemarks || row.updateRemarks.trim() === '') {
            toast.error("Please Enter Remarks");
            return;
        }
        setIsPending(true);
        ApiClient.post(`${HR_UPDATE_JOINING_DETAILS_REMARKS}${row.id}&remarks=${row.updateRemarks}&userId=${userId}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    getJoiningDetails()
                    toast.success(response.data.message);
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    // API Call with custom or state-based dates
    const getJoiningDetails = (start = fromDate, end = toDate, remarksStatus) => {
        setIsPending(true);
        ApiClient.get(`${HR_JOINING_DETAILS}${start}&toDate=${end}&offset=0&limit=10000&status=${remarksStatus === 'pending' ? false : true}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    const encryptedContent = response.data.data;
                    decryptData(encryptedContent).then((decrypted) => {
                        setHrJoiningList(decrypted);
                    }).catch((error) => {
                        setHrJoiningList([]);
                    });
                } else {
                    toast.error(response.data.message);
                    setHrJoiningList([]);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                setHrJoiningList([]);
                toast.error(error.message);
            });
    };

    // Set first day of month and today as default date range
    const setDefaultDateRange = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Format tomorrow's date
        const formattedFromDate = formatDateForInput(startOfMonth);
        const formattedToDate = formatDateForInput(endOfMonth);

        // Set both dates to tomorrow
        setFromDate(formattedFromDate);
        setToDate(formattedToDate);

        // Call API with tomorrow's date
        getJoiningDetails(formattedFromDate, formattedToDate, remarksStatus);
    };

    const handleShowButton = (e) => {
        e.preventDefault();
        if (!fromDate) {
            toast.error("Please Enter Start Date");
        } else if (!toDate) {
            toast.error("Please Enter End Date");
        } else {
            getJoiningDetails(fromDate, toDate, remarksStatus);
        }
    };

    const handleClear = () => {
        setDefaultDateRange();
        setHrJoiningList([]);
    };

    // Handle radio button change
    const handleRadioChange = (event) => {
        setRemarksStatus(event.target.value);
        getJoiningDetails(fromDate, toDate, event.target.value)
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="HR Report" breadcrumbItem="Joining" />
            {isPending && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowButton}>
                            <Row className="g-3">
                                <Col md="4">
                                    <h6 className="font-size-12">From Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="4">
                                    <h6 className="font-size-12">To Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </Col>
                                <Col md="3" className="d-flex align-items-end">
                                    <Button
                                        color="primary"
                                        type="submit"
                                        className="me-2"
                                    >
                                        Show
                                    </Button>
                                    <Button
                                        color="secondary"
                                        type="button"
                                        onClick={handleClear}
                                    >
                                        Clear
                                    </Button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                {/* Radio Buttons */}
                <div className="radio-button-container">
                    {["pending", "completed"].map((type) => (
                        <label
                            key={type}
                            className={`radio-label ${remarksStatus === type ? "active" : ""}`}
                        >
                            <input
                                type="radio"
                                value={type}
                                checked={remarksStatus === type}
                                onChange={handleRadioChange}
                            />
                            {type?.charAt(0)?.toUpperCase() + type.slice(1)}
                        </label>
                    ))}
                </div>

                <AppTable
                    progressSales={isPending}
                    columns={columns}
                    data={hrJoiningList?.content}
                    pagination
                />
            </Container>
        </PageContent>
    );
}