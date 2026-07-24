import { Modal, ModalHeader, ModalBody, Row, Col, Card, Badge, Table, CardBody, Progress } from "reactstrap";
import { FaBuilding, FaFilePdf } from "react-icons/fa";
import { formatDate, formatDateTime, generateTimestamp } from "../../helpers/function_helper";
import { useLocation } from "react-router-dom";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useState } from "react";
import ImageModal from "../../components/Common/ImageModal";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ViewClearanceModal({ isOpen, toggle, data }) {
    const location = useLocation();
    const [fileModalOpen, setFileModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState("");
    if (!data) return null;
    // 1. Role-Based Data Filtering logic remains consistent
    const path = location.pathname;
    const isHR = path.includes("hr-fnf-list");
    const isHOD = path.includes("hods-fnf-list");
    const isFinance = path.includes("finance-fnf-list");
    const isAdmin = path.includes("admin-fnf-list");
    const isIT = path.includes("it-fnf-list");
    const isOps = path.includes("ops-fnf-list");


    const filteredClearances = data.departmentClearances?.filter((item) => {
        if (isHR) return true;
        if (isIT && item.department === "IT") return true;
        if (isHOD && item.department === "HOD") return true;
        if (isFinance && item.department === "ACCOUNTS_FINANCE") return true;
        if (isAdmin && item.department === "ADMIN") return true;
        if (isOps && item.department === "OPS_TEAM") return true;
        return false;
    }) || [];

    const totalClearances = data.departmentClearances?.filter((item) => {
        return true;
    }) || [];

    const groupedClearances = filteredClearances.reduce((acc, obj) => {
        const key = obj.department;
        if (!acc[key]) acc[key] = [];
        acc[key].push(obj);
        return acc;
    }, {});

    const totalGroupedClearances = totalClearances.reduce((acc, obj) => {
        const key = obj.department;
        if (!acc[key]) acc[key] = [];
        acc[key].push(obj);
        return acc;
    }, {});

    const totalDepts = Object.keys(totalGroupedClearances).length;

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

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // ✅ Main Header
        doc.setFontSize(13);
        doc.text(
            `Employee Clearance Report - ${data.name} (${data.employeeCode})`,
            14,
            14
        );

        // ✅ Compact 3-column header (including designation)
        doc.setFontSize(8);

        const startX = 14;
        let startY = 20;
        const colGap = 65;
        const rowGap = 4;

        // Row 1
        doc.text(`Department: ${data.department}`, startX, startY);
        doc.text(`Location: ${data.location}`, startX + colGap, startY);
        doc.text(`Level: ${data.level}`, startX + colGap * 2, startY);

        // Row 2
        startY += rowGap;
        doc.text(`Designation: ${data.designation || "-"}`, startX, startY);
        doc.text(`Relieving: ${formatDate(data.relievingDate)}`, startX + colGap, startY);
        doc.text(`Notice: ${data.noticePeriodDays} Days`, startX + colGap * 2, startY);

        // Row 3
        startY += rowGap;
        doc.text(`Resignation: ${formatDate(data.dateOfResignation)}`, startX, startY);
        doc.text(`Created: ${formatDateTime(data.createdAt)}`, startX + colGap, startY);
        // doc.text(`Cleared: ${totalDepts}/6`, startX + colGap * 2, startY);

        let tableStartY = startY + 6;

        // ✅ Tables (tight layout for single page)
        Object.keys(totalGroupedClearances).forEach((dept) => {

            const isHODDept = dept === "HOD";

            doc.setFontSize(9);
            doc.text(`${dept.replace('_', ' ')} DEPARTMENT`, 14, tableStartY);

            const tableHead = isHODDept
                ? ["Description", "Status", "Remarks", "Updated By"]
                : ["Description", "Status", "Updated By"];

            const tableData = totalGroupedClearances[dept].map((item) => {
                const status =
                    item.cleared === true
                        ? "YES"
                        : item.cleared === false
                            ? "NO"
                            : "Not Applicable";

                return isHODDept
                    ? [item.description, status, item.remarks || "-", item.updatedBy]
                    : [item.description, status, item.updatedBy];
            });

            autoTable(doc, {
                startY: tableStartY + 2,
                head: [tableHead],
                body: tableData,
                styles: {
                    fontSize: 6.5,   // 🔥 ultra compact
                    cellPadding: 1.5
                },
                headStyles: {
                    fillColor: [13, 110, 253],
                    textColor: 255,
                    fontStyle: "bold",
                },
                margin: { left: 14, right: 14 },
                theme: "grid",
            });

            tableStartY = doc.lastAutoTable.finalY + 4;
        });

        // ❌ Force single page (no addPage)

        doc.save(`${data.name}_Clearance_Report_${generateTimestamp()}.pdf`);
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl" centered scrollable className="custom-modal border-0">
            <ModalHeader toggle={toggle} className="bg-white border-bottom py-3">
                <div className="d-flex align-items-center">
                    {/* <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                        <FaHistory className="text-primary fs-5" />
                    </div> */}
                    <div
                        onClick={() => handleViewFile(data.profilePhoto)}
                        className="bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 shadow-sm flex-shrink-0 overflow-hidden"
                        style={profileStyle}
                    >
                        {data.profilePhoto ? (
                            <img
                                src={data.profilePhoto}
                                alt={data.employeeName || 'Employee'}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: '1.2rem' }}>
                                {data.employeeName?.charAt(0) || 'E'}
                            </span>
                        )}
                    </div>
                    <div>
                        <h5 className="mb-0 fw-bold text-dark">
                            {isHR ? "Master Clearance Summary" : "Departmental Submission Record"}
                        </h5>
                        <small className="text-muted"><b>{data.name}</b>, Created At: {formatDateTime(data.createdAt)}</small>
                    </div>
                    {((isHR) && totalDepts === 6) && (
                        <div
                            style={{ marginLeft: '10px', cursor: "pointer" }}
                            onClick={handleDownloadPDF}
                            title="Download PDF"
                        >
                            <FaFilePdf size={20} color={defaultTheme.redColor} />
                        </div>
                    )}
                </div>
            </ModalHeader>

            <ModalBody className="p-3 p-md-4 bg-light bg-opacity-50">
                {/* Employee Info Header */}
                <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
                    <CardBody className="p-4 bg-white">
                        <Row className="gy-4">
                            <Col xs={12} md={4} className="border-end-md">
                                <div className="d-flex align-items-center">
                                    {/* <FaUserCircle size={50} className="text-primary opacity-25 me-3" /> */}
                                    <div>
                                        <h5 className="fw-bold mb-0">{data.name}</h5>
                                        <Badge color="primary" pill className="bg-opacity-10 text-primary border-0 mt-1">
                                            Emp Code : {data.employeeCode}
                                        </Badge>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={6} md={4} className="border-end-md px-md-4">
                                <label className="text-muted small text-uppercase fw-bold d-block mb-1">Deployment</label>
                                <div className="fw-bold small text-dark"><FaBuilding className="text-info me-2" />{data.department}</div>
                                <div className="text-muted small">{data.location} | Level: {data.level}</div>

                            </Col>
                            <Col xs={6} md={4} className="px-md-4">
                                <label className="text-muted small text-uppercase fw-bold d-block mb-1">Settlement Status</label>
                                <Progress value={(totalDepts / 6) * 100} color="primary" className="rounded-pill mb-1" style={{ height: '6px' }} />
                                <span className="small fw-bold text-secondary">{totalDepts} / 6 Depts Cleared</span>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                {/* Relieving Dates Context */}
                <Row className="mb-4 g-3">
                    <Col sm={6}>
                        <div className="p-3 bg-white rounded-3 shadow-sm border-start border-danger border-4">
                            <label className="text-muted small text-uppercase fw-bold d-block">Relieving Date</label>
                            <span className="fw-bold text-dark">{formatDate(data.relievingDate)}</span>
                        </div>
                    </Col>
                    <Col sm={6}>
                        <div className="p-3 bg-white rounded-3 shadow-sm border-start border-primary border-4">
                            <label className="text-muted small text-uppercase fw-bold d-block">Notice Period</label>
                            <span className="fw-bold text-dark">{data.noticePeriodDays} Days</span>
                        </div>
                    </Col>
                </Row>
                <ImageModal
                    isOpen={fileModalOpen}
                    toggle={() => setFileModalOpen(!fileModalOpen)}
                    imageSrc={currentImage}
                />

                {/* Section 3: Departmental Card Breakdown */}
                <Row>
                    {Object.keys(groupedClearances).map((dept) => (
                        <Col xs={12} key={dept} className="mb-4">
                            <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '12px' }}>
                                <div className="px-4 py-3 bg-white border-bottom d-flex justify-content-between align-items-center">
                                    <h6 className="fw-bold text-primary mb-0">{dept.replace('_', ' ')} DEPARTMENT</h6>
                                    <Badge color="success" className="bg-opacity-10 text-primary border-0 px-3 py-1">Verified Submission</Badge>
                                </div>
                                <div className="table-responsive">
                                    <Table hover className="mb-0 align-middle">
                                        <thead className="bg-light text-muted small text-uppercase">
                                            <tr>
                                                <th className="ps-4 border-0 py-3">Description</th>
                                                <th className="text-center border-0 py-3">Status</th>
                                                <th className="border-0 py-3">Remarks</th>
                                                <th className="border-0 py-3 pe-4 text-end">Updated By</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedClearances[dept].map((item, i) => (
                                                <tr key={i} className="border-top">
                                                    <td className="ps-4 py-3">
                                                        <span className="fw-semibold text-dark small">{item.description}</span>
                                                    </td>
                                                    <td className="text-center">
                                                        {item.cleared === true ? "YES" : item.cleared === false ? "NO" : "Not Applicable"}
                                                    </td>
                                                    <td className="small text-muted italic">
                                                        {item.remarks || <span className="opacity-50">—</span>}
                                                    </td>
                                                    <td className="pe-4 text-end">
                                                        <div className="small fw-bold text-dark">{item.updatedBy}</div>
                                                        <div className="text-muted fw-semibold" style={{ fontSize: '10px' }}>{formatDateTime(item.updatedAt)}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </ModalBody>
        </Modal>
    );
}