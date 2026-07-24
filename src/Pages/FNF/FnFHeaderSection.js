import { useState } from "react";
import { Card, CardBody, Row, Col, Input, Badge, Button, Spinner } from "reactstrap";
import { FaIdBadge, FaCheckCircle, FaUsersCog, FaBuilding, FaUserTie } from "react-icons/fa";
import ApiClient, { imageBaseUrl } from "../../helpers/api_helper";
import { CHECK_FNF_CREATED, FIND_USER_BY_EMPCODE } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import { formatDate } from "../../helpers/function_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useNavigate } from "react-router-dom";
import ImageModal from "../../components/Common/ImageModal";
import { decryptData } from "../../components/Common/CryptoUtils";

const InfoField = ({ label, value, editable, type = "text", name, onChange, isActionable, minDate }) => (
    <div className="mb-2 w-100">
        <div
            className={`d-flex align-items-center rounded-3 border transition-all h-100 ${isActionable
                ? "bg-white border-primary shadow-sm"
                : "bg-light border-light"
                }`}
            style={{ minHeight: "40px" }}
        >
            <div
                className="px-2 border-end d-flex align-items-center bg-light bg-opacity-50 rounded-start"
                style={{ alignSelf: "stretch", flexBasis: "35%", minWidth: "75px" }}
            >
                <span className="text-muted fw-bold text-uppercase" style={{ fontSize: "8px", letterSpacing: "0.3px", lineHeight: "1.1" }}>
                    {label}
                </span>
            </div>
            <div className="flex-grow-1 px-2 py-1 d-flex align-items-center overflow-hidden">
                {editable ? (
                    <Input
                        type={type}
                        name={name}
                        value={value || ""}
                        bsSize="sm"
                        placeholder={"Enter " + label + "..."}
                        min={type === "date" ? minDate : undefined}
                        onChange={(e) => onChange(e.target.value)}

                        className="border-0 bg-transparent fw-bold text-primary p-0 shadow-none w-100"
                        style={{ fontSize: "12px", fontWeight: "700" }}
                    />
                ) : (
                    <span
                        className="fw-bold text-dark d-block w-100"
                        style={{
                            fontSize: "11px",
                            lineHeight: "1.2",
                            wordBreak: "break-word",
                            whiteSpace: "normal"
                        }}
                    >
                        {value || "—"}
                    </span>
                )}
            </div>
        </div>
    </div>
);

export default function FnFHeaderSection({ isHR = false, headerData, setHeaderData, resetHeaderData }) {
    const [verifying, setVerifying] = useState(false);
    const [rawUserData, setRawUserData] = useState(null);
    const [handoverType, setHandoverType] = useState("manager");
    const navigate = useNavigate();
    const [fileModalOpen, setFileModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState("");

    const handleVerify = () => {
        if (!headerData?.employeeCode || headerData.employeeCode.length < 4) return;

        setVerifying(true);

        // 1️⃣ First API – check if FNF already created
        ApiClient.get(`${CHECK_FNF_CREATED}${headerData?.employeeCode}`)
            .then((fnfRes) => {

                if (fnfRes?.data?.status === 1 && fnfRes?.data?.data) {
                    setVerifying(false);
                    toast.error(`FNF process is already initiated for this employee`);
                    return;
                }

                // 2️⃣ Second API – existing verify logic
                return ApiClient.get(`${FIND_USER_BY_EMPCODE}?empCode=${headerData?.employeeCode}`)
            })
            .then((response) => {
                if (!response) return;
                setVerifying(false);
                if (response?.data?.status === 1) {
                    const userResp = response?.data?.data;
                    decryptData(userResp).then((decrypted) => {
                        if (decrypted?.user?.isActive !== 'YES') {
                            // 👉 releavingReason check
                            if (!decrypted?.user?.releavingReason) {
                                setRawUserData(null);
                                resetHeaderData();
                                toast.error('Please add releavingReason first in User Master');
                                return;
                            }
                            setRawUserData(decrypted);
                            if (decrypted?.user?.isAdmin !== "NO") {
                                updateHandoverData("manager", decrypted);
                            } else {
                                updateHandoverData("subTeam", decrypted);
                            }
                        } else {
                            setRawUserData(null);
                            resetHeaderData();
                            toast.error('Please ensure the account is disabled before initiating the FNF process');
                        }
                    }).catch((error) => {
                        setRawUserData(null);
                    });
                } else {
                    setRawUserData(null);
                    resetHeaderData();
                    toast.error(response?.data?.message);
                }
            })
            .catch((error) => {
                setVerifying(false);
                setRawUserData(null);
                resetHeaderData();
                toast.error(error.message);
            });
    };

    const updateHandoverData = (type, data = rawUserData) => {
        if (!data) return;
        let targetId = "";
        let targetName = "";

        if (type === "manager") {
            targetId = data.reportingTo?.reportingUserId;
            targetName = data.reportingTo?.reportingName + ' (' + data.reportingTo.reportingEmpCode + ')';
        } else if (type === "mainTeam") {
            targetId = data.mainTeam?.mainTeamEmpId;
            targetName = data.mainTeam?.mainTeamEmpName + ' (' + data.mainTeam.mainTeamEmpId + ')';;
        } else if (type === "subTeam") {
            targetId = data.subTeam?.subTeamEmpId;
            targetName = data.subTeam?.subTeamEmpName;
        }

        setHeaderData({
            ...headerData,
            employeeName: data.user?.name,
            designation: data.user?.positionMaster?.position,
            department: data.user?.departmentName,
            location: data.user?.locationName,
            hod: targetName + '/' + data?.mainTeam?.teamName + '/' + data?.subTeam?.subTeamName,
            dateOfJoining: data.user?.doj,
            contactNo: data.user?.phone,
            level: data.user?.designationName,
            noticePeriod: "",
            dateOfResignation: "",
            relievingDate: "",
            informationReceivedDate: "",
            reportingManagerId: targetId,
            reportingManagerName: targetName,
            address: data.user?.address1 + ',' + data.user?.city + ',' + data.user?.state + ',' + data.user?.pincode,
            releavingReason: data?.user?.releavingReason,
            profilePhoto: imageBaseUrl + data?.user?.fileDetails
        });
    };

    const handleViewFile = (fileName) => {
        const fileExtension = fileName?.split(".").pop().toLowerCase();
        const fileUrl = fileName;

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
        width: "35px",
        height: "35px",
        objectFit: "cover",
        cursor: "pointer",
        borderRadius: "50%",
        border: `2px solid ${defaultTheme.goldColorLogo}`,
        padding: "2px",
    };

    return (
        <Card className="border-0 shadow-lg mb-4" style={{ borderRadius: "12px", overflow: "hidden" }}>
            <div className="bg-primary bg-gradient px-3 py-2 text-white">
                <Row className="align-items-center gy-2">

                    {/* Left: Title */}
                    <Col xs={12} sm={4}>
                        <div className="d-flex align-items-center">
                            <FaIdBadge className="me-2" size={16} />
                            <h6 className="mb-0 fw-bold text-white">Clearance Profile</h6>
                        </div>
                    </Col>

                    {/* Center: Back button */}
                    <Col xs={12} sm={4} className="text-center">
                        <Button
                            color="secondary"
                            type="button"
                            style={{ backgroundColor: defaultTheme.goldColorLogo }}
                            onClick={() => navigate(-1)}
                        >
                            ← Back
                        </Button>
                    </Col>

                    {/* Right: HR controls */}
                    {isHR && (
                        <Col xs={12} sm={4} className="text-sm-end">
                            <div className="d-inline-flex gap-2 align-items-center flex-wrap justify-content-end">
                                <div
                                    className="input-group input-group-sm bg-white rounded-2 overflow-hidden border shadow-sm"
                                    style={{ maxWidth: "220px" }}
                                >
                                    <Input
                                        placeholder="Enter Code"
                                        value={headerData.employeeCode || ""}
                                        onChange={(e) =>
                                            setHeaderData({
                                                ...headerData,
                                                employeeCode: e.target.value,
                                            })
                                        }
                                        className="border-0 fw-bold shadow-none"
                                        style={{ fontSize: "13px" }}
                                    />
                                    <Button
                                        color="primary"
                                        className="fw-bold px-3"
                                        onClick={handleVerify}
                                        disabled={verifying}
                                    >
                                        {verifying ? <Spinner size="sm" /> : "FETCH"}
                                    </Button>
                                </div>

                                {headerData?.employeeName && (
                                    <Badge
                                        color="light"
                                        // pill
                                        className="text-primary border-0 px-3 py-2 shadow-sm d-flex align-items-center"
                                    >
                                        <FaCheckCircle className="text-success me-1" />
                                        Profile Verified
                                    </Badge>
                                )}
                            </div>
                        </Col>
                    )}
                </Row>
            </div>

            <CardBody className="p-3">
                <Row className="gy-4">
                    {/* LEFT SECTION: 5/12 Columns */}
                    <Col xs={12} lg={5} className="border-end-lg">
                        <div className="d-flex align-items-center mb-3 pb-2 border-bottom border-light">
                            <div
                                onClick={() => handleViewFile(headerData.profilePhoto)}
                                className="bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 shadow-sm flex-shrink-0 overflow-hidden"
                                style={profileStyle}
                            >
                                {headerData.profilePhoto ? (
                                    <img
                                        src={headerData.profilePhoto}
                                        alt={headerData.employeeName || 'Employee'}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                ) : (
                                    <span style={{ fontSize: '1.2rem' }}>
                                        {headerData.employeeName?.charAt(0) || 'E'}
                                    </span>
                                )}
                            </div>

                            <div className="overflow-hidden">
                                <h5 className="fw-bold text-dark mb-0 text-truncate">{headerData.employeeName || "Ready to Fetch"}</h5>
                                <div className="d-flex align-items-center gap-2 mt-1">
                                    <Badge color="primary" className="bg-opacity-10 text-primary border-0" style={{ fontSize: '10px' }}>Emp Code: {headerData.employeeCode || "N/A"}</Badge>
                                    <span className="text-muted small fw-semibold" style={{ fontSize: '10px' }}><FaBuilding className="me-1" size={10} /> {headerData.department}</span>
                                </div>
                            </div>
                        </div>

                        <Row className="gx-2 gy-1">
                            <Col xs={6}><InfoField label="Designation" value={headerData.designation} /></Col>
                            <Col xs={6}><InfoField label="Level" value={headerData.level} /></Col>
                            <Col xs={6}><InfoField label="Branch" value={headerData.location} /></Col>
                            <Col xs={6}><InfoField label="Joined Date" value={formatDate(headerData.dateOfJoining)} /></Col>
                            <Col xs={6}><InfoField label="Phone" value={headerData.contactNo} /></Col>
                            <Col xs={6}><InfoField label="Manager" value={headerData.hod} /></Col>
                            <Col xs={6}><InfoField label="Releaving Reason" value={headerData.releavingReason} /></Col>
                        </Row>
                    </Col>

                    {/* RIGHT SECTION: 7/12 Columns for Handover */}
                    <Col xs={12} lg={7} className="ps-lg-4">
                        <div className="text-uppercase fw-bold text-primary mb-3 d-flex align-items-center justify-content-between" style={{ fontSize: "10px", letterSpacing: '0.8px' }}>
                            <span><FaUserTie className="me-2" /> Handover & Timeline Lifecycle</span>
                            <Badge color="info" className="bg-opacity-10 text-info border-0 px-2 py-1">Notice Tracking</Badge>
                        </div>

                        <div className="p-3 rounded-4 border border-dashed bg-light bg-opacity-30 shadow-sm">
                            <Row className="gx-2 gy-3">
                                {rawUserData && isHR && (
                                    <Col xs={12} className="mb-1">
                                        <div className="d-flex flex-column">
                                            {/* Refined Label Sentence */}
                                            <label className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: "9px", letterSpacing: "0.5px" }}>
                                                Final Handover Recipient (HOD Approval):
                                            </label>
                                            <div className="input-group input-group-sm border border-primary border-opacity-50 rounded-3 overflow-hidden bg-white shadow-sm">
                                                <span className="input-group-text bg-white border-0 text-primary px-3"><FaUsersCog size={14} /></span>
                                                <Input
                                                    type="select"
                                                    className="border-0 fw-bold shadow-none cursor-pointer"
                                                    style={{ fontSize: "12px", height: "42px" }}
                                                    value={handoverType}
                                                    onChange={(e) => {
                                                        setHandoverType(e.target.value);
                                                        updateHandoverData(e.target.value);
                                                    }}
                                                >
                                                    {rawUserData?.user?.isAdmin !== 'NO' && <option value="manager">{`RM (${rawUserData.reportingTo?.reportingName})`}</option>}
                                                    {rawUserData?.user?.isAdmin === 'NO' && <option value="subTeam">{`STL (${rawUserData.subTeam?.subTeamEmpName})`}</option>}
                                                    {rawUserData?.user?.isAdmin === 'NO' && <option value="mainTeam">{`MTL (${rawUserData.mainTeam?.mainTeamEmpName}(${rawUserData.mainTeam?.mainTeamEmpId}))`}</option>}
                                                </Input>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                                <Col xs={6}><InfoField label="Notice Days" name="noticePeriod" type="text" value={
                                    isHR
                                        ? headerData.noticePeriod
                                        : headerData?.noticePeriod
                                            ? headerData.noticePeriod
                                            : '0'
                                }

                                    editable={isHR} isActionable={isHR} onChange={(val) => setHeaderData({ ...headerData, noticePeriod: val })} /></Col>
                                <Col xs={6}><InfoField label="Resigned On" name="dateOfResignation" type="date" value={isHR ? headerData.dateOfResignation : formatDate(headerData.dateOfResignation)} editable={isHR} isActionable={isHR} minDate={headerData.dateOfJoining} onChange={(val) => setHeaderData({ ...headerData, dateOfResignation: val })} /></Col>
                                <Col xs={6}><InfoField label="Relieving On" name="relievingDate" type="date" value={isHR ? headerData.relievingDate : formatDate(headerData?.relievingDate)} editable={isHR} isActionable={isHR} minDate={headerData.dateOfJoining} onChange={(val) => setHeaderData({ ...headerData, relievingDate: val })} /></Col>
                                <Col xs={6}><InfoField label="Info Rec." name="informationReceivedDate" type="date" value={isHR ? headerData.informationReceivedDate : formatDate(headerData?.informationReceivedDate)} editable={isHR} minDate={headerData.dateOfJoining} isActionable={isHR} onChange={(val) => setHeaderData({ ...headerData, informationReceivedDate: val })} /></Col>
                            </Row>
                        </div>
                    </Col>
                </Row>

                <ImageModal
                    isOpen={fileModalOpen}
                    toggle={() => setFileModalOpen(!fileModalOpen)}
                    imageSrc={currentImage}
                />
            </CardBody>
        </Card>
    );
}