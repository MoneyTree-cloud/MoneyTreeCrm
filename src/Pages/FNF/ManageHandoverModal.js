/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, Button, Input } from "reactstrap";
import { FaUsersCog, FaIdBadge, FaBuilding } from "react-icons/fa";
import ApiClient from "../../helpers/api_helper";
import { FIND_USER_BY_EMPCODE, UPDATE_FNF_HR_DATA } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function ManageHandoverModal({ isOpen, toggle, rowData }) {
    const [loading, setLoading] = useState(false);
    const [rawUserData, setRawUserData] = useState(null);
    const [handoverType, setHandoverType] = useState("");

    useEffect(() => {
        if (!isOpen || !rowData?.employeeCode) return;

        setLoading(true);
        ApiClient.get(`${FIND_USER_BY_EMPCODE}?empCode=${rowData.employeeCode}`)
            .then(res => {
                if (res?.data?.status === 1) {
                    const data = res.data.data;
                    decryptData(data).then((decrypted) => {
                        setRawUserData(decrypted);
                        setHandoverType(decrypted?.user?.isAdmin !== "NO" ? "manager" : "subTeam");
                    }).catch((error) => {
                    });

                } else {
                    toast.error(res.data.message);
                    toggle();
                }
            })
            .catch(err => {
                toast.error(err.message);
                toggle();
            })
            .finally(() => setLoading(false));
    }, [isOpen, rowData]);

    const getSelectedManagerPayload = () => {
        if (!rawUserData) return null;

        if (handoverType === "manager") {
            return {
                reportingManagerId: rawUserData.reportingTo?.reportingUserId,
                reportingManagerName:
                    `${rawUserData.reportingTo?.reportingName} (${rawUserData.reportingTo?.reportingEmpCode})`
            };
        }

        if (handoverType === "mainTeam") {
            return {
                reportingManagerId: rawUserData.mainTeam?.mainTeamEmpId,
                reportingManagerName:
                    `${rawUserData.mainTeam?.mainTeamEmpName} (${rawUserData.mainTeam?.mainTeamEmpId})`
            };
        }

        if (handoverType === "subTeam") {
            return {
                reportingManagerId: rawUserData.subTeam?.subTeamEmpId,
                reportingManagerName:
                    `${rawUserData.subTeam?.subTeamEmpName}`
            };
        }

        return null;
    };

    const handleSave = () => {
        const payload = getSelectedManagerPayload();

        if (!payload?.reportingManagerId) {
            toast.error("Invalid handover selection");
            return;
        }
        setLoading(true);
        ApiClient.post(`${UPDATE_FNF_HR_DATA}?id=${rowData?.id}&reportingManagerId=${payload.reportingManagerId}&reportingManagerName=${payload.reportingManagerName}`,)
            .then(res => {
                if (res?.data?.status === 1) {
                    toast.success(res.data.message || "Handover updated successfully");
                    toggle();
                } else {
                    toast.error(res.data.message || "Update failed");
                }
            })
            .catch(err => {
                toast.error(err.message);
            })
            .finally(() => setLoading(false));
    };

    const user = rawUserData?.user;

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size="md">
            <ModalHeader toggle={toggle}>
                Manage Handover
            </ModalHeader>

            <ModalBody>
                {loading ? (
                    <div className="text-center py-4">
                        <ScreenLoader />
                    </div>
                ) : (
                    rawUserData && (
                        <>
                            {/* 👤 EMPLOYEE SUMMARY */}
                            <div className="p-3 rounded-3 bg-light border mb-3">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 className="fw-bold mb-1">
                                            {user?.name}
                                        </h6>
                                        <div className="small text-muted d-flex gap-3 flex-wrap">
                                            <span>
                                                <FaIdBadge className="me-1" />
                                                {rowData?.employeeCode}
                                            </span>
                                            <span>
                                                <FaBuilding className="me-1" />
                                                {user?.departmentName}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 small text-muted">
                                        {user?.positionMaster?.position} • {user?.designationName}
                                    </div>
                                </div>
                            </div>

                            {/* 🔽 HANDOVER SELECTION */}
                            <label
                                className="text-muted fw-bold text-uppercase mb-1"
                                style={{ fontSize: "10px", letterSpacing: "0.6px" }}
                            >
                                Final Handover Recipient
                            </label>

                            <div className="input-group input-group-sm border border-primary border-opacity-50 rounded-3 overflow-hidden bg-white shadow-sm mb-3">
                                <span className="input-group-text bg-white border-0 text-primary px-3">
                                    <FaUsersCog size={14} />
                                </span>

                                <Input
                                    type="select"
                                    className="border-0 fw-bold shadow-none"
                                    style={{ fontSize: "12px", height: "42px" }}
                                    value={handoverType}
                                    onChange={(e) => setHandoverType(e.target.value)}
                                >
                                    {user?.isAdmin !== 'NO' && (
                                        <option value="manager">
                                            RM ({rawUserData.reportingTo?.reportingName})
                                        </option>
                                    )}
                                    {user?.isAdmin === 'NO' && (
                                        <option value="subTeam">
                                            STL ({rawUserData.subTeam?.subTeamEmpName})
                                        </option>
                                    )}
                                    {user?.isAdmin === 'NO' && (
                                        <option value="mainTeam">
                                            MTL ({rawUserData.mainTeam?.mainTeamEmpName}
                                            ({rawUserData.mainTeam?.mainTeamEmpId}))
                                        </option>
                                    )}
                                </Input>
                            </div>

                            {/* 💾 ACTIONS */}
                            <div className="d-flex justify-content-end gap-2">
                                <Button color="secondary" size="sm" onClick={toggle}>
                                    Cancel
                                </Button>
                                <Button color="primary" size="sm" onClick={handleSave}>
                                    Save Changes
                                </Button>
                            </div>
                        </>
                    )
                )}
            </ModalBody>
        </Modal>
    );
}
