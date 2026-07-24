/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Row, UncontrolledTooltip } from "reactstrap";
import Select from "react-select";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { GET_KYT_DATA } from "../../helpers/url_helper";
import { formatDateForInput, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { defaultTheme } from "../../helpers/defaultTheme";
import ImageModal from "../../components/Common/ImageModal";
import { FaStar } from "react-icons/fa";

export default function KYTScreen() {
    const { userId, subTl, mainTl } = useUserStore((state) => state.user);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [meetData, setMeetData] = useState([]);
    const [isPending, setIsPending] = useState(false);
    const [fileModalOpen, setFileModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState("")
    // Dropdown filters
    const [selectedSubTeam, setSelectedSubTeam] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    // ✅ Checkbox filter
    const [removeNotPresent, setRemoveNotPresent] = useState(false);

    useEffect(() => {
        getMeetingDetailsInit();
    }, []);

    const getMeetingDetailsInit = () => {
        const now = new Date();
        setFromDate(formatDateForInput(now));
        setToDate(formatDateForInput(now));
        setSelectedSubTeam(null);
        setSelectedBranch(null);
        setRemoveNotPresent(false);
        getMeetingData(`${GET_KYT_DATA}associateId=${userId}&fromDate=${formatDateForInput(now)}&toDate=${formatDateForInput(now)}`);
    };

    const getMeetingData = (apiUrl) => {
        setIsPending(true);
        ApiClient.get(apiUrl)
            .then((response) => {
                setIsPending(false);
                if (response.data.status === 1) {
                    setMeetData(response.data.data || []);
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch((error) => {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    const handleShowData = (e) => {
        e.preventDefault();
        getMeetingData(
            `${GET_KYT_DATA}associateId=${userId}&fromDate=${fromDate}&toDate=${toDate}`
        );
    };

    /* ================= DROPDOWN OPTIONS ================= */

    const subTeamOptions = useMemo(() => {
        const unique = [
            ...new Set(meetData.map((item) => item.subTeam).filter(Boolean)),
        ];
        return unique.map((team) => ({ label: team, value: team }));
    }, [meetData]);

    const branchOptions = useMemo(() => {
        const unique = [
            ...new Set(meetData.map((item) => item.branch).filter(Boolean)),
        ];
        return unique.map((branch) => ({ label: branch, value: branch }));
    }, [meetData]);

    /* ================= FILTERED DATA ================= */

    const filteredData = useMemo(() => {
        return meetData.filter((item) => {
            const subTeamMatch = selectedSubTeam
                ? item.subTeam === selectedSubTeam.value
                : true;

            const branchMatch = selectedBranch
                ? item.branch === selectedBranch.value
                : true;

            const presentMatch = removeNotPresent ? !!item.inTime : true;

            return subTeamMatch && branchMatch && presentMatch;
        });
    }, [meetData, selectedSubTeam, selectedBranch, removeNotPresent]);

    const getStatusIcon = (per) => {
        if (per <= 40) return "rc.png";
        if (per > 40 && per < 100) return "yc.png";
        return "gc.png";
    };

    const handleViewFile = (fileName) => {
        const fileExtension = fileName?.split(".").pop().toLowerCase();
        const fileUrl = imageBaseUrl + fileName;

        if ((fileExtension === "heic" || fileExtension === 'msg')) {
            // Trigger download for HEIC and msg files
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = fileName; // Specify the filename for the download
            document.body.appendChild(link); // Append the link to the DOM
            link.click(); // Simulate a click to start the download
            document.body.removeChild(link); // Clean up by removing the link
        }
        else {
            // Set the image source and open modal for images
            setCurrentImage(fileUrl);
            setFileModalOpen(true)
        }
    };

    const profileStyle = {
        width: "30px",
        height: "30px",
        objectFit: "cover",
        cursor: "pointer",
        borderRadius: "50%",
        border: `2px solid ${defaultTheme.goldColorLogo}`,
        padding: "2px",
    };

    /* ================= TABLE COLUMNS ================= */

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, i) => i + 1,
            width: "8%",
        },
        {
            name: <span className="font-weight-bold fs-13">Profile</span>,
            width: "8%",
            cell: (row) => (
                <div
                    style={{
                        position: "relative",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "visible"
                    }}
                >
                    <img
                        src={imageBaseUrl + row.profilePhoto}
                        alt="Profile"
                        style={{
                            ...profileStyle,
                            display: "block"
                        }}
                        onClick={() => handleViewFile(row.profilePhoto)}
                    />

                    {/* TOP RIGHT STAR */}
                    {row.meetingCount > 0 && (
                        <FaStar
                            style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                transform: "translate(40%, -40%)",
                                color: defaultTheme.redColor,
                                fontSize: "15px",
                                background: "#fff",
                                borderRadius: "50%",
                                padding: "3px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                            }}
                        />
                    )}
                </div>
            )
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            width: "25%",
            selector: (row) => row.name,
            cell: (row) => {
                const startDate = new Date(fromDate);
                const endDate = new Date(toDate);
                const diffDays =
                    (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;

                const total = row.prospectCount + 2 * row.meetingCount;
                const dayTotal = diffDays * 5;
                const per = (total / dayTotal) * 100;

                const icon = getStatusIcon(per);

                return (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <img
                            src={imageBaseUrl + icon}
                            alt="status"
                            style={{ width: "20px", height: "20px" }}
                        />
                        <WordWrapCell>{row.name}</WordWrapCell>
                        <span
                            style={{
                                height: "6px",
                                width: "6px",
                                minWidth: "6px",
                                minHeight: "6px",
                                borderRadius: "50%",
                                backgroundColor: row.inTime ? "green" : "red",
                                display: "inline-block",
                                flexShrink: 0
                            }}
                        />
                    </div>
                );
            },
        },
        {
            name: <span className="font-weight-bold fs-13">Sub Team</span>,
            selector: (row) => row.subTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.subTeam}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Branch</span>,
            selector: (row) => row.branch,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.branch}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Prospects</span>,
            selector: (row) => row.prospectCount,
            cell: (row) => <WordWrapCell>{row.prospectCount}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Meeting</span>,
            selector: (row) => row.meetingCount,
            cell: (row) => <WordWrapCell>{row.meetingCount}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Today's SAP Login Status</span>,
            selector: (row) => row.lastLoginDate,
            sortable: true,
            cell: (row) => {
                if (!row.lastLoginDate) return "-";

                const loginDate = new Date(row.lastLoginDate);
                const today = new Date();

                const isToday =
                    loginDate.getFullYear() === today.getFullYear() &&
                    loginDate.getMonth() === today.getMonth() &&
                    loginDate.getDate() === today.getDate();

                const tooltipId = `last-login-${row.employeeId || row.id}`;

                return (
                    <>
                        <span
                            id={tooltipId}
                            style={{
                                cursor: "pointer",
                                fontWeight: 600,
                                color: isToday ? "green" : "red",
                            }}
                        >
                            {isToday ? "YES" : "NO"}
                        </span>

                        <UncontrolledTooltip
                            placement="top"
                            target={tooltipId}
                        >
                            {formatDateTime(row.lastLoginDate)}
                        </UncontrolledTooltip>
                    </>
                );
            },
        }
    ];

    return (
        <PageContent>
            {isPending && <ScreenLoader />}
            <Breadcrumbs title="KYT Menu" breadcrumbItem="Know Your Team (KYT)" />

            <Container fluid>
                {/* ================= FILTERS ================= */}
                <form onSubmit={handleShowData}>
                    <Card>
                        <CardBody>
                            <Row className="g-3">
                                <Col lg="2">
                                    <h6 className="font-size-11">From Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </Col>
                                <Col lg="2">
                                    <h6 className="font-size-11">To Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </Col>
                                {mainTl === "YES" && (
                                    <Col lg="2">
                                        <h6 className="font-size-11">Sub Team</h6>
                                        <Select
                                            options={subTeamOptions}
                                            value={selectedSubTeam}
                                            onChange={setSelectedSubTeam}
                                            isClearable
                                            menuPortalTarget={document.body}
                                            styles={{
                                                menuPortal: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                }),
                                            }}
                                        />
                                    </Col>
                                )}
                                <Col lg={(mainTl === "NO" && subTl === 'YES') ? "3" : "2"}>
                                    <h6 className="font-size-11">Branch</h6>
                                    <Select
                                        options={branchOptions}
                                        value={selectedBranch}
                                        onChange={setSelectedBranch}
                                        isClearable
                                        menuPortalTarget={document.body}
                                        styles={{
                                            menuPortal: (base) => ({
                                                ...base,
                                                zIndex: 9999,
                                            }),
                                        }}
                                    />
                                </Col>

                                {/* ✅ Remove Not Present Checkbox */}
                                <Col lg="2" className="d-flex align-items-center justify-content-center">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="removeNotPresent"
                                            checked={removeNotPresent}
                                            onChange={(e) => setRemoveNotPresent(e.target.checked)}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="removeNotPresent"
                                        >
                                            Remove Absent
                                        </label>
                                    </div>
                                </Col>

                                <Col lg={(mainTl === "NO" && subTl === 'YES') ? "3" : "2"} className="d-flex align-items-end">
                                    <button type="submit" className="btn btn-primary">
                                        Show
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary ms-2"
                                        onClick={getMeetingDetailsInit}
                                    >
                                        Clear
                                    </button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </form>

                {/* ================= TABLE ================= */}
                {filteredData?.length > 0 && (
                    <AppTable
                        progressPending={isPending}
                        columns={columns}
                        data={filteredData}
                        pagination
                    />
                )}

                <ImageModal
                    isOpen={fileModalOpen}
                    toggle={() => setFileModalOpen(!fileModalOpen)}
                    imageSrc={currentImage}
                />
            </Container>
        </PageContent>
    );
}
