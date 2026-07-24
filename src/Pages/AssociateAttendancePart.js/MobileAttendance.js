/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet } from "../../Hooks/useApi";
import { GET_ALL_MAIN_TEAM_DROPDOWN, GET_ALL_SUB_TEAM_DROPDOWN, GET_MOBILE_ATTENDANCE } from "../../helpers/url_helper";
import { convertTo12HourFormat, formatDate, formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import { FaMapMarkerAlt } from "react-icons/fa";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { useUserStore } from "../../store/useUserStore";
import PermissionMissing from "../Utility/PermissonMissing";
import Select from "react-select";
import { imageBaseUrl } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import ImageModal from "../../components/Common/ImageModal";
import "../CSS/styles.css";

export default function MobileAttendance() {
    const [formState, setFormState] = useState({
        fromDate: "",
        toDate: "",
        mainTeam: null,
        subTeam: null,
        apiUrl: null,
    });
    const userId = useUserStore((state) => state.user.userId);
    const [accessGranted, setAccessGranted] = useState(null);
    const [page, setPage] = useState(1)
    const LIMIT = 100
    const [fileModalOpen, setFileModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState("");
    // Fetch attendance data based on apiUrl
    const { data: attendanceData, isLoading } = useGet(formState.apiUrl, { enabled: !!formState.apiUrl && !!accessGranted, });
    const { data: mainTeams } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN, { enabled: !!accessGranted });
    const { data: subTeams } = useGet(`${GET_ALL_SUB_TEAM_DROPDOWN}${formState?.mainTeam?.value}`, { enabled: Boolean(formState?.mainTeam) });

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'mobile-attendance');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                getFromToDate();
            }
        };
        checkAccess();
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFormChange = (field, value) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const getFromToDate = () => {
        const now = new Date();

        // Check if mainTeam or subTeam is selected
        const isMainTeamSelected = formState?.mainTeam;
        const isSubTeamSelected = formState?.subTeam;

        // Construct the apiUrl based on the conditions
        let apiUrl = `${GET_MOBILE_ATTENDANCE}fromDate=${formatDateForInput(now)}&toDate=${formatDateForInput(now)}&limit=${LIMIT}&offset=${page - 1}`;

        // Append mainTeam only if it's selected
        if (isMainTeamSelected) {
            apiUrl += `&mainTeam=${formState.mainTeam.value}`;
        }

        // Append subTeam if subTeam is selected, or if mainTeam is selected but subTeam is not
        if (isSubTeamSelected) {
            apiUrl += `&subTeam=${formState.subTeam.value}`;
        }

        // Update the formState with the new apiUrl
        setFormState((prev) => ({
            ...prev,
            fromDate: formatDateForInput(now),
            toDate: formatDateForInput(now),
            apiUrl: apiUrl,  // Updated API URL
            mainTeam: null,
            subTeam: null
        }));
    };

    const handleShowData = (e) => {
        e.preventDefault();
        const isMainTeamSelected = formState?.mainTeam;
        const isSubTeamSelected = formState?.subTeam;
        let apiUrl = `${GET_MOBILE_ATTENDANCE}fromDate=${formState.fromDate}&toDate=${formState.toDate}&limit=${LIMIT}&offset=${page - 1}`;

        // Append mainTeam only if it's selected
        if (isMainTeamSelected) {
            apiUrl += `&mainTeam=${formState.mainTeam.value}`;
        }

        // Append subTeam if subTeam is selected, or if mainTeam is selected but subTeam is not
        if (isSubTeamSelected) {
            apiUrl += `&subTeam=${formState.subTeam.value}`;
        }

        // Update the formState with the new apiUrl
        setFormState((prev) => ({
            ...prev,
            apiUrl: apiUrl,  // Updated API URL
        }));
    };

    useEffect(() => {
        const isMainTeamSelected = formState?.mainTeam;
        const isSubTeamSelected = formState?.subTeam;

        // Construct the apiUrl based on the conditions
        let apiUrl = `${GET_MOBILE_ATTENDANCE}fromDate=${formState.fromDate}&toDate=${formState.toDate}&limit=${LIMIT}&offset=${page - 1}`;

        // Append mainTeam only if it's selected
        if (isMainTeamSelected) {
            apiUrl += `&mainTeam=${formState.mainTeam.value}`;
        }

        // Append subTeam if subTeam is selected, or if mainTeam is selected but subTeam is not
        if (isSubTeamSelected) {
            apiUrl += `&subTeam=${formState.subTeam.value}`;
        }

        // Update the formState with the new apiUrl
        setFormState((prev) => ({
            ...prev,
            apiUrl: apiUrl,  // Updated API URL
        }));
    }, [page])

    const handleViewFile = useCallback((filePath) => {
        if (!filePath) {
            toast.error("No File Attached");
            return;
        }
        setCurrentImage(imageBaseUrl + filePath);
        setFileModalOpen(true);
    }, []);

    const profileStyle = {
        width: "35px",
        height: "35px",
        objectFit: "cover",
        cursor: "pointer",
        borderRadius: "50%",
        border: `2px solid ${defaultTheme.goldColorLogo}`,
        padding: "2px",
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "5%",
        },
        {
            name: <span className="font-weight-bold fs-13">Emp Code</span>,
            selector: (row) => row.empCode,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.empCode}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Emp Name</span>,
            selector: (row) => row.empName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.empName}</WordWrapCell>
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
            name: <span className="font-weight-bold fs-13">Date</span>,
            selector: (row) => row.trnDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.trnDate)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">In Time</span>,
            selector: (row) => row.trnTime,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.punchType === 'IN' ? convertTo12HourFormat(row.trnTime) : '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Out Time</span>,
            selector: (row) => row.trnTime,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.punchType === 'OUT' ? convertTo12HourFormat(row.trnTime) : '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Location</span>,
            selector: (row) => row.inLocation,
            sortable: true,
            cell: (row) => (
                <WordWrapCell>
                    {(row.inLocation && row.outLocation) ? (
                        <FaMapMarkerAlt
                            onClick={() =>
                                window.open(
                                    `https://www.google.com/maps/@${row.inLocation},${row.outLocation},16z?q=${row.inLocation},${row.outLocation}`,
                                    "_blank"
                                )
                            }
                            style={{
                                cursor: "pointer",
                                color: defaultTheme.goldColorLogo,
                                fontSize: 18,
                            }}
                        />
                    ) : '-'}
                </WordWrapCell>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Image</span>,
            cell: (row) =>
                row.imagePath ? (
                    <img
                        src={imageBaseUrl + row.imagePath}
                        alt="Profile"
                        style={profileStyle}
                        onClick={() => handleViewFile(row.imagePath)}
                    />
                ) : (
                    <span>-</span>
                ),
        },
    ];

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            {isLoading && <ScreenLoader />}
            <Breadcrumbs title="Attendance" breadcrumbItem="Mobile Attendance" />
            <Container fluid={true}>
                <form onSubmit={handleShowData}>
                    <Card>
                        <CardBody>
                            <Row>
                                <Col lg="2">
                                    <h6 className="font-size-11">From Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        name="fromDate"
                                        value={formState.fromDate}
                                        onChange={handleInputChange}
                                    />
                                </Col>
                                <Col lg="2">
                                    <h6 className="font-size-11">To Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        name="toDate"
                                        value={formState.toDate}
                                        onChange={handleInputChange}
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
                                <Col lg="4" className="align-items-center mt-4">
                                    <div className="d-flex align-items-center">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            onClick={handleShowData}
                                        >
                                            Show Data
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary ms-3"
                                            onClick={getFromToDate}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </form>
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={
                        Array.isArray(attendanceData?.data?.data?.content)
                            ? attendanceData?.data?.data?.content
                            : []
                    }
                    pagination
                    paginationServer
                    paginationTotalRows={attendanceData?.data?.data?.totalElements}
                    onChangePage={setPage}
                />
            </Container>

            <ImageModal
                isOpen={fileModalOpen}
                toggle={() => setFileModalOpen(!fileModalOpen)}
                imageSrc={currentImage}
            />
        </PageContent>
    );
}
