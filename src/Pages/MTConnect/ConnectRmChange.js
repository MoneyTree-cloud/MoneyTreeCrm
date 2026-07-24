/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
    Button,
    Container,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet, usePost } from "../../Hooks/useApi";
import {
    GET_MY_TEAM_ID,
    GET_RM_CHANGE_COMPLETED_REQUESTS,
    GET_RM_CHANGE_PENDING_REQUESTS,
    UPDATE_RM_CHANGE
} from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css";
import PageContent from "../../components/Common/PageContent";
import { MdMobileFriendly } from "react-icons/md";
import { useUserStore } from "../../store/useUserStore";
import { FaEdit } from "react-icons/fa";
import Select from "react-select";
import { toast } from "react-toastify";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import { USER_TYPE } from "../../constants/global";

export default function ConnectRmChange() {
    const mainTeam = useUserStore((state) => state.user.mainTeam);
    const role = useUserStore((state) => state.user.role);
    const userId = useUserStore((state) => state.user.userId);
    // State
    const [accessGranted, setAccessGranted] = useState(null);
    const empCode = useUserStore((state) => state.user.empCode);
    const [customerId, setCustomerId] = useState('')
    const [selectedRMChange, setSelectedRMChange] = useState(null);
    const [RMChangeModalOpen, setRMChangeModalOpen] = useState(false);
    const limit = 100;
    const [page, setPage] = useState(1)
    const [flag, setFlag] = useState(false)
    const [pageApproved, setPageApproved] = useState(1)
    const [flagApproved, setFlagApproved] = useState(false)
    const [rmType, setRMType] = useState("PENDING");
    const [changeRmList, setchangeRmList] = useState([]);
    const [changeRmCompletedList, setchangeRmCompletedList] = useState([]);
    const { data: teamList, isLoading: loadingTeam } = useGet(GET_MY_TEAM_ID + userId, { enabled: !!accessGranted });

    const mainTeamQuery = role === USER_TYPE.ASSOCIATE  ? `&mainTeam=${mainTeam}` : '';
    const { data, isLoading, refetch: getAllChangeRMList } = useGet(`${GET_RM_CHANGE_PENDING_REQUESTS}?offset=${page - 1}&limit=${limit}${mainTeamQuery}`, { enabled: !!accessGranted });
    const { data: completedData, isLoading: completedLoading, refetch: getAllChangeCompletedRMList } = useGet(`${GET_RM_CHANGE_COMPLETED_REQUESTS}?offset=${pageApproved - 1}&limit=${limit}${mainTeamQuery}`, { enabled: !!accessGranted });

    useEffect(() => {
        if (data?.data?.status === 1) {
            
            decryptData(data?.data?.data).then((decryptedData) => {
                if (decryptedData) {
                    setchangeRmList(decryptedData);   
                } else {
                    setchangeRmList([])
                }
            });
        }
    }, [data]);


    useEffect(() => {
        if (completedData?.data?.status === 1) {
            
            decryptData(completedData?.data?.data).then((decryptedData) => {
                if (decryptedData) {
                    setchangeRmCompletedList(decryptedData);   
                } else {
                    setchangeRmCompletedList([]);
                }
            });
        }
    }, [completedData]);


    useEffect(() => {
        const checkAccess = async () => {
            if (role !== USER_TYPE.ASSOCIATE ) {
                const hasAccess = await CheckUserAccess(userId, 'connect-rm-change');
                setAccessGranted(hasAccess);
            }
            else {
                setAccessGranted(true)
            }
        };
        checkAccess();
    }, [userId, role]);

    useEffect(() => {
        if (flag) {
            getAllChangeRMList()
        }
    }, [page])

    useEffect(() => {
        if (flagApproved) {
            getAllChangeCompletedRMList()
        }
    }, [pageApproved])

    const { isPending, mutate } = usePost(
        `${UPDATE_RM_CHANGE}${customerId}&rmId=${selectedRMChange?.value}&loginId=${empCode}`,
        {
            onSuccess: (response) => {
                setCustomerId('');
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    toogleModalRMChange()
                    getAllChangeRMList()
                    getAllChangeCompletedRMList()
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                setCustomerId('');
                toast.error(err.message);
            },
        }
    );

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            sortable: true,
            width: "8%",
            selector: (row, index) => index + 1,
            cell: (row, index) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {index + 1}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Connect Name</span>,
            sortable: true,
            selector: (row) => row.customerName,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.customerName}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Mobile No.</span>,
            selector: (row) => row.customerNumber,
            sortable: true,
            cell: (row) => (
                <div className="phone-container">
                    <MdMobileFriendly
                        className="phone-icon"
                        color={defaultTheme.goldColorLogo}
                    />
                    <span className="phone-number">{row.customerNumber}</span>
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">State</span>,
            sortable: true,
            selector: (row) => row.customerState,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.customerState}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">RM Details</span>,
            sortable: true,
            selector: (row) => row.refIdName,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.refIdName + ' (' + row.refId + ')'}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">RM Mobile No.</span>,
            selector: (row) => row.refIdMobileNumber,
            sortable: true,
            cell: (row) => (
                <div className="phone-container">
                    <MdMobileFriendly
                        className="phone-icon"
                        color={defaultTheme.goldColorLogo}
                    />
                    <span className="phone-number">{row.refIdMobileNumber}</span>
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Main Team</span>,
            sortable: true,
            selector: (row) => row.mainTeam,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.mainTeam}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Sub Team</span>,
            sortable: true,
            selector: (row) => row.subTeam,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.subTeam}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Reason</span>,
            sortable: true,
            selector: (row) => row.requestRemark,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.requestRemark}
                </div>
            ),
        }
    ];

    if (role === USER_TYPE.ASSOCIATE ) {
        columns.push({
            name: <span className="font-weight-bold fs-13">Change RM</span>,
            selector: (row) => row.createdDate,
            sortable: true,
            width: "15%",
            cell: (row) => (
                <button
                    className="btn btn-secondary btn-sm"
                    type="submit"
                    onClick={() => { handleChangeRM(row) }}
                >
                    <FaEdit className="me-1" />
                </button>
            ),
        },);
    }

    const columnsApproved = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            sortable: true,
            width: "8%",
            selector: (row, index) => index + 1,
            cell: (row, index) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {index + 1}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Connect Name</span>,
            sortable: true,
            selector: (row) => row.customerName,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.customerName}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">RM Details</span>,
            sortable: true,
            selector: (row) => row.refIdName,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.refIdName + ' (' + row.refId + ')'}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Main Team</span>,
            sortable: true,
            selector: (row) => row.refIdMainTeam,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.refIdMainTeam}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Sub Team</span>,
            sortable: true,
            selector: (row) => row.refIdSubTeam,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.refIdSubTeam}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Old RM Details</span>,
            sortable: true,
            selector: (row) => row.oldRefIdName,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.oldRefIdName + ' (' + row.oldRefId + ')'}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Reason</span>,
            sortable: true,
            selector: (row) => row.requestRemark,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.requestRemark}
                </div>
            ),
        }
    ];

    const handleChangeRM = (rowData) => {
        setCustomerId(rowData.customerId)
        setRMChangeModalOpen(true)
    }

    const toogleModalRMChange = () => {
        setRMChangeModalOpen(!RMChangeModalOpen)
        setCustomerId('');
        setSelectedRMChange(null)
    }

    const handleSubmit = () => {
        mutate()
    };

    const handleRadioChange = (event) => {
        setRMType(event.target.value);
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }


    return (
        <PageContent>
            <Breadcrumbs title="Connect" breadcrumbItem="RM Change" />
            {(isLoading || loadingTeam || isPending || completedLoading) && <ScreenLoader />}
            <Container fluid={true}>

                <div className="radio-button-container">
                    <label className={`radio-label ${rmType === "PENDING" ? "active" : ""}`}>
                        <input
                            type="radio"
                            value="PENDING"
                            checked={rmType === "PENDING"}
                            onChange={handleRadioChange}
                        />
                        Pending
                    </label>
                    <label className={`radio-label ${rmType === "ACCEPT" ? "active" : ""}`}>
                        <input
                            type="radio"
                            value="ACCEPT"
                            checked={rmType === "ACCEPT"}
                            onChange={handleRadioChange}
                        />
                        Approved
                    </label>
                </div>

                {rmType === 'PENDING' ?
                    <AppTable
                        columns={columns}
                        data={changeRmList?.content || []}
                        pagination
                        progressPending={isLoading}
                        paginationTotalRows={changeRmList?.totalElements}
                        paginationServer
                        onChangePage={(newPage) => {
                            setPage(newPage);
                            setFlag(true);
                        }}
                    />
                    :
                    <AppTable
                        columns={columnsApproved}
                        data={changeRmCompletedList?.content || []}
                        pagination
                        progressPending={completedLoading}
                        paginationTotalRows={changeRmCompletedList?.totalElements}
                        paginationServer
                        onChangePage={(newPage) => {
                            setPageApproved(newPage);
                            setFlagApproved(true);
                        }}
                    />
                }
            </Container>

            <Modal isOpen={RMChangeModalOpen} toggle={toogleModalRMChange}>
                <ModalHeader toggle={toogleModalRMChange}>Connect RM Change</ModalHeader>
                <ModalBody>
                    <div>
                        <label>Select RM</label>
                        <Select
                            isClearable
                            options={Array.isArray(teamList?.data?.data) ? teamList?.data?.data : []}
                            value={selectedRMChange}
                            onChange={setSelectedRMChange}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSubmit} style={{ backgroundColor: defaultTheme.primary }} disabled={!selectedRMChange}>
                        Submit
                    </Button>
                    <Button color="secondary" onClick={toogleModalRMChange} style={{ backgroundColor: defaultTheme.goldColorLogo }}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>

        </PageContent>
    );
}
