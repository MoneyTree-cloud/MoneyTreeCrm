/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
    Button,
    Col,
    Container,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet, usePost } from "../../Hooks/useApi";
import {
    GET_SINGLE_CUSTOMER_SUSPECT,
    UPDATE_CONNECT_SUSPECT,
} from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css";
import PageContent from "../../components/Common/PageContent";
import { MdMobileFriendly } from "react-icons/md";
import { formatDateTime, RequiredStar } from "../../helpers/function_helper";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function ConnectAssociateLeadInfo() {
    const location = useLocation();
    const navigation = useNavigate()
    const { customerId } = location.state || {};
    const [page, setPage] = useState(1)
    const [modalData, setModalData] = useState(null);
    const [apiUrl, setApiUrl] = useState('')
    const [suspectType, setSuspectType] = useState("PENDING");
    const [connectLeadList, setConnectLeadList] = useState([]);
    const limit = 100;
    const [flag, setFlag] = useState(false)
    const { data, isLoading, refetch: getSuspectData } = useGet(apiUrl, { enabled: Boolean(apiUrl) });

    useEffect(() => {
        if (data?.data?.status === 1) {
            decryptData(data?.data?.data).then((decryptedData) => {
                if (decryptedData) {
                    setConnectLeadList(decryptedData);   
                } else {
                    setConnectLeadList([]);
                }
            });
        }
    }, [data]);

    useEffect(() => {
        setApiUrl(`${GET_SINGLE_CUSTOMER_SUSPECT}${customerId}&offset=${page - 1}&limit=${limit}&status=${suspectType}`)
    }, [page])

    useEffect(() => {
        if (flag) {
            setApiUrl(`${GET_SINGLE_CUSTOMER_SUSPECT}${customerId}&offset=${page - 1}&limit=${limit}&status=${suspectType}`)
        }
    }, [page])

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            sortable: true,
            width: '5%',
            selector: (row, index) => index + 1,
            cell: (row, index) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {index + 1}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
            sortable: true,
            width: '15%',
            selector: (row) => row.createdDate,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {formatDateTime(row.createdDate)}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Connect Details</span>,
            sortable: true,
            width: '20%',
            selector: (row) => row.customerName,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.customerName + ' (' + row.customerId + ')'}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Suspect Name</span>,
            sortable: true,
            width: '15%',
            selector: (row) => row.suspectName,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.suspectName}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Mobile No.</span>,
            selector: (row) => row.suspectMobile,
            sortable: true,
            cell: (row) => (
                <div className="phone-container">
                    <MdMobileFriendly
                        className="phone-icon"
                        color={defaultTheme.goldColorLogo}
                    />
                    <span className="phone-number">{row.suspectMobile}</span>
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Occupation</span>,
            sortable: true,
            selector: (row) => row.occupation,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.occupation}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Budget</span>,
            sortable: true,
            selector: (row) => row.suspectBudget,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.suspectBudget}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Preferred Location</span>,
            sortable: true,
            selector: (row) => row.preferredLocation,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.preferredLocation}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Connect Reference</span>,
            sortable: true,
            selector: (row) => row.connectReference,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.connectReference ? 'YES' : "NO"}
                </div>
            ),
        },
        suspectType !== 'ACCEPT' && {
            name: <span className="font-weight-bold fs-13">Action</span>,
            cell: (row) => (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                            e.preventDefault(); // Prevent any default behavior
                            setModalData(row);
                        }}
                    >
                        <FaEdit className="me-1" />
                    </button>
                </div>
            ),
        },
    ].filter(Boolean);

    const handleUpdateStatus = () => {
        // Validate modal data before proceeding
        if (!modalData.status) {
            toast.error("Feedback1 Is Required");
            return;
        }
        if (modalData.status.value === "reject" && !modalData.category) {
            toast.error("Feedback2 Is Required When Reject Is Selected");
            return;
        }
        if (!modalData.remarks) {
            toast.error("Remarks Is Required");
            return;
        }
        let params = {
            "id": modalData.id,
            "customerId": modalData.customerId,
            "customerName": modalData.customerName,
            "suspectMobile": modalData.suspectMobile,
            "occupation": modalData.occupation,
            "suspectName": modalData.suspectName,
            "suspectBudget": modalData.suspectBudget,
            "preferredLocation": modalData.preferredLocation,
            "suspectAcceptStatus": modalData.status.value === 'accept' ? 'ACCEPT' : "REJECT",
            "rejectRemark": modalData.remarks
        };
        mutate(params);
    };

    const { isPending, mutate } = usePost(
        UPDATE_CONNECT_SUSPECT,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    if (modalData?.status?.value !== "reject") {
                        navigation("/prospect-list-menu/add-prospect-list", {
                            state: { rowData: modalData, screen: "connect" },
                        });
                        return
                    }
                    setModalData(null);
                    getSuspectData(); // Refresh the data
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    const handleRadioChange = (event) => {
        setSuspectType(event.target.value);
        setApiUrl(`${GET_SINGLE_CUSTOMER_SUSPECT}${customerId}&offset=${page - 1}&limit=${limit}&status=${event.target.value}`)
    };

    const handleBack = () => {
        navigation('/connect-associate-info')
    }

    return (
        <PageContent>
            <Breadcrumbs title="Connect" breadcrumbItem="Lead Info" />
            {(isLoading || isPending) && <ScreenLoader />}
            <Container fluid={true}>
                <div className="radio-button-wrapper">
                    <div className="radio-button-container">
                        <label className={`radio-label ${suspectType === "PENDING" ? "active" : ""}`}>
                            <input
                                type="radio"
                                value="PENDING"
                                checked={suspectType === "PENDING"}
                                onChange={handleRadioChange}
                            />
                            Pending
                        </label>
                        <label className={`radio-label ${suspectType === "ACCEPT" ? "active" : ""}`}>
                            <input
                                type="radio"
                                value="ACCEPT"
                                checked={suspectType === "ACCEPT"}
                                onChange={handleRadioChange}
                            />
                            Accepted
                        </label>
                        <label className={`radio-label ${suspectType === "REJECT" ? "active" : ""}`}>
                            <input
                                type="radio"
                                value="REJECT"
                                checked={suspectType === "REJECT"}
                                onChange={handleRadioChange}
                            />
                            Rejected
                        </label>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleBack}
                        >
                            Back
                        </button>
                    </div>
                </div>
                <AppTable
                    columns={columns}
                    data={connectLeadList?.content || []}
                    pagination
                    progressPending={isLoading}
                    paginationTotalRows={connectLeadList?.totalElements}
                    paginationServer
                    onChangePage={(newPage) => {
                        setPage(newPage);
                        setFlag(true);
                    }}
                />
            </Container>

            {/* Edit Modal */}
            <Modal isOpen={!!modalData} toggle={() => setModalData(null)}>
                <ModalHeader toggle={() => setModalData(null)}>
                    Lead Status
                </ModalHeader>
                <ModalBody>
                    {modalData && (
                        <Row>
                            <Col lg="6">
                                <div className="form-group">
                                    <h6 className="font-size-11">Mobile No</h6>
                                    <input
                                        type="text"
                                        value={modalData.suspectMobile}
                                        className="form-control"
                                        disabled
                                        maxLength={10}
                                        onChange={(e) =>
                                            setModalData({
                                                ...modalData,
                                                leadMobile: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </Col>
                            <Col lg="6">
                                <div className="form-group">
                                    <h6 className="font-size-11">Name</h6>
                                    <input
                                        type="text"
                                        value={modalData.suspectName}
                                        disabled
                                        className="form-control"
                                        onChange={(e) =>
                                            setModalData({
                                                ...modalData,
                                                leadName: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </Col>

                            {/* Dropdown 1: Status */}
                            <Col lg="6 mt-3">
                                <div className="form-group">
                                    <h6 className="font-size-11">
                                        Feedback1 <RequiredStar/>
                                    </h6>
                                    <Select
                                        isClearable
                                        options={[
                                            { label: "Accept", value: "accept" },
                                            { label: "Reject", value: "reject" },
                                        ]}
                                        onChange={(selectedOption) => {
                                            setModalData((prevData) => ({
                                                ...prevData,
                                                status: selectedOption,
                                                category:
                                                    selectedOption && selectedOption.value === "Accept" ? null : prevData.category,
                                            }));
                                        }}
                                        value={modalData?.status || null}
                                    />
                                </div>
                            </Col>

                            {/* Dropdown 2: Category (Only shown when Reject is selected) */}
                            {modalData.status?.value === "reject" && (
                                <Col lg="6 mt-3">
                                    <div className="form-group">
                                        <h6 className="font-size-11">
                                            Feedback2 <RequiredStar/>
                                        </h6>
                                        <Select
                                            isClearable
                                            options={[
                                                { label: "Not Reachable", value: "Not Reachable" },
                                                {
                                                    label: "Call Not Picking",
                                                    value: "Call Not Picking",
                                                },
                                                {
                                                    label: "Not Interested",
                                                    value: "Not Interested",
                                                },
                                                { label: "Wrong Number", value: "Wrong Number" },
                                                { label: "DND", value: "DND" },
                                                { label: "Another City", value: "Another City" },
                                                { label: "Switch Off", value: "Switch Off" },
                                            ]}
                                            onChange={(selectedOption) =>
                                                setModalData({
                                                    ...modalData,
                                                    category: selectedOption,
                                                })
                                            }
                                            value={modalData.category}
                                        />
                                    </div>
                                </Col>
                            )}

                            <Col lg="12 mt-3">
                                <div className="form-group">
                                    <h6 className="font-size-11">
                                        Remarks <RequiredStar/>
                                    </h6>
                                    <textarea
                                        placeholder="Add remarks..."
                                        className="form-control"
                                        rows="4" // Adjust the number of rows as needed
                                        value={modalData.remarks || ""}
                                        onChange={(e) =>
                                            setModalData({
                                                ...modalData,
                                                remarks: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </Col>
                        </Row>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        style={{ backgroundColor: defaultTheme.primary }}
                        onClick={handleUpdateStatus}
                    >
                        Update Status
                    </Button>
                    <Button
                        color="secondary"
                        style={{ backgroundColor: defaultTheme.goldColorLogo }}
                        onClick={() => setModalData(null)}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </PageContent>
    );
}
