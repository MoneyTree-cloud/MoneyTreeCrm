/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useGet, usePost } from "../../Hooks/useApi";
import { GET_ALL_PROSPECTS_MASTER, GET_ALL_USERS_DROPDOWN_ALL, GET_MY_ALL_TEAM, GET_TEAMS_PROSPECTS_BY_ASSOCIATE_ID, PROJECT_ID_NAME_DROPDOWN, TRANSFER_PROSPECT_DATA_NEW } from "../../helpers/url_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import { formatDate, WordWrapCell } from "../../helpers/function_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import { MdEmail, MdMobileFriendly } from "react-icons/md";
import ApiClient from "../../helpers/api_helper";
import PageContent from "../../components/Common/PageContent";
import TransferProgressModal from "./TransferProgressModal";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import { USER_TYPE } from "../../constants/global";
import "../CSS/styles.css";

export default function TransferProspects() {
    const { userId, role } = useUserStore((state) => state.user);
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [rowData, setRowData] = useState([]);
    const [pending, setPending] = useState(false);
    const [pageLimit, setPageLimit] = useState(200);
    const [flag, setFlag] = useState(false)
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [uploadedFileId, setUploadedFileId] = useState(null);
    const [meetingStatus, setMeetingStatus] = useState("");
    const [meetingType, setMeetingType] = useState(null);
    const [project, setProject] = useState(null);
    const [accessGranted, setAccessGranted] = useState(null);
    const [totalElements, setTotalElements] = useState(0)
    const [dueFromDate, setDueFromDate] = useState(0)
    const [dueToDate, setDueToDate] = useState(0)
    const { data: projectData } = useGet(PROJECT_ID_NAME_DROPDOWN);

    const INITIALSTATE = {
        associateSelect: null,
        toAssociateSelect: null,
        transferTypeSelect: null,
        transferToScreen: null,
        purpose: null
    };

    const [formState, setFormState] = useState(INITIALSTATE);
    const isAdminOrOther = role === USER_TYPE.ADMIN || role === USER_TYPE.OTHER;
    const endpoint = isAdminOrOther
        ? GET_ALL_USERS_DROPDOWN_ALL
        : `${GET_MY_ALL_TEAM}${userId}`;

    const { data: prosData } = useGet(GET_ALL_PROSPECTS_MASTER, { enabled: !!accessGranted });
    const { data: associateList, isLoading } = useGet(endpoint, { enabled: !!accessGranted });
    const [structuredOutput, setStructuredOutput] = useState({});

    useEffect(() => {
        if (prosData?.data?.status_code === 1) {
            const output = {}; // Create a new output object

            prosData.data.object.forEach((item) => {
                const { masterTypeDesc, meetingType, id } = item;
                if (!output[masterTypeDesc]) {
                    output[masterTypeDesc] = [];
                }
                output[masterTypeDesc].push({
                    label: meetingType,
                    value: id.toString(),
                });
            });

            setStructuredOutput(output); // Update state with the structured output
        }
    }, [prosData])

    const getProspectsDetails = () => {
        setPending(true)
        let apiUrl = `${GET_TEAMS_PROSPECTS_BY_ASSOCIATE_ID}${formState?.associateSelect?.value}&sortField=created_Date&sortType=desc&limit=${pageLimit}&offset=${page - 1}`;
        if (meetingStatus) {
            apiUrl += `&meetingStatus=${meetingStatus}`
        }
        if (meetingType) {
            apiUrl += `&typeId=${meetingType?.value}`;
        }
        if (project) {
            apiUrl += `&projectId=${project?.value}`;
        }
        if (dueFromDate && dueToDate) {
            apiUrl += `&key=dueDate&fromDate=${dueFromDate}&toDate=${dueToDate}`;
        }
        if (formState?.purpose?.value === 'Meeting') {
            apiUrl += `&hasMeeting=Meeting`;
        }

        ApiClient.post(apiUrl)
            .then(function (response) {
                setPending(false);
                if (response?.data?.status === 1) {
                    const encryptedContent = response.data.data;
                    decryptData(encryptedContent).then((decrypted) => {
                        const updatedRows = decrypted?.content.map((prospect) => ({
                            ...prospect,
                            isChecked: false, // Checkbox state for each prospect
                        }));
                        setTotalElements(decrypted?.totalElements)
                        setRowData(updatedRows);

                    }).catch((error) => {
                        setRowData([]);
                    });
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setPending(false);
                toast.error(error.message);
            });
    };

    const { isPending: transferLoading, mutate } = usePost(
        `${TRANSFER_PROSPECT_DATA_NEW}${formState?.toAssociateSelect?.value}&transferFromAssociate=${formState?.associateSelect?.value}&loginId=${userId}&status=NO`,
        {
            onSuccess: (response) => {
                if (response?.data.status === 1) {
                    const fileData = response.data.data
                    setUploadedFileId(fileData);
                    setShowModal(true);
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    useEffect(() => {
        const allChecked = rowData.every((row) => row.isChecked);
        setSelectAllChecked(allChecked);
    }, [rowData]);

    const handleCheckboxChange = (rowId) => {
        setRowData((prevData) => {
            const updatedData = prevData.map((row) =>
                row.id === rowId ? { ...row, isChecked: !row.isChecked } : row
            );

            // Check if any prospect is still checked
            const anyChecked = updatedData.some((row) => row.isChecked);
            setSelectAllChecked(anyChecked);

            return updatedData;
        });
    };

    const handleSelectAllChange = () => {
        const newCheckedState = !selectAllChecked;
        setRowData((prevData) =>
            prevData.map((row) => ({ ...row, isChecked: newCheckedState }))
        );
        setSelectAllChecked(newCheckedState);
    };

    useEffect(() => {
        if (formState.transferTypeSelect?.value === "All") {
            setRowData((prevData) =>
                prevData.map((row) => ({ ...row, isChecked: true }))
            );
            setSelectAllChecked(true);
        } else {
            setRowData((prevData) =>
                prevData.map((row) => ({ ...row, isChecked: false }))
            );
            setSelectAllChecked(false);
        }
    }, [formState.transferTypeSelect]);

    const columns = [
        {
            name: (
                <input
                    type="checkbox"
                    checked={selectAllChecked}
                    onChange={handleSelectAllChange}
                    aria-label="Select All"
                />
            ),
            cell: (row) => (
                <input
                    type="checkbox"
                    checked={row.isChecked}
                    onChange={() => handleCheckboxChange(row.id)}
                />
            ),
            width: "4%",
        },
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "4%"
        },
        {
            name: <span className="font-weight-bold fs-13">Prospect Id</span>,
            selector: (row) => row.prospectId,
            sortable: true,
            width: "13%",
            cell: (row) => <WordWrapCell>{row.prospectId}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Name</span>,
            selector: (row) => row.associateName,
            sortable: true,
            width: "12%",
            cell: (row) => <WordWrapCell>{row.associateName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Meeting Type</span>,
            selector: (row) => row.typeName,
            sortable: true,
            width: "8%",
            cell: (row) => <WordWrapCell>{row.typeName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Prospects Date</span>,
            selector: (row) => formatDate(row.prosDate),
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.prosDate)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Due Date</span>,
            selector: (row) => formatDate(row.dueDate),
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row.dueDate)}</WordWrapCell>,
            width: "10%"
        },
        {
            name: <span className="font-weight-bold fs-13">Name</span>,
            selector: (row) => row.clientName,
            sortable: true,
            width: "15%",
            cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Mobile Number</span>,
            width: "7%",
            selector: (row) => row.phoneNo,
            sortable: true,
            cell: (row) => {
                return (
                    <div className="phone-container">
                        <MdMobileFriendly
                            className="phone-icon"
                            color={defaultTheme.goldColorLogo}
                        />
                        <span className="phone-number">{row.phoneNo}</span>
                    </div>
                );
            }
        },
        // ...(empCode === '1004'
        //     ? [
        //         {
        //             name: <span className="font-weight-bold fs-13">Mobile No.</span>,
        //             selector: (row) => row.phoneNo,
        //             width: "10%",
        //             sortable: true,
        //             cell: (row) => <WordWrapCell>{row.phoneNo}</WordWrapCell>
        //         },
        //     ]
        //     : [
        //         {
        //             name: <span className="font-weight-bold fs-13">Mobile No.</span>,
        //             selector: (row) => row.phoneNo,
        //             sortable: true,
        //             cell: (row) => (
        //                 <div className="phone-container">
        //                     <MdMobileFriendly
        //                         className="phone-icon"
        //                         color={defaultTheme.goldColorLogo}
        //                     />
        //                     <span className="phone-number">{row.phoneNo}</span>
        //                 </div>
        //             ),
        //         },
        //     ]),
        {
            name: <span className="font-weight-bold fs-13">Client Budget</span>,
            selector: (row) => row.clientBudgetName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.clientBudgetName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Task Timing</span>,
            selector: (row) => row.taskTimingRange,
            sortable: true,
            width: "10%",
            cell: (row) => <WordWrapCell>{row.taskTimingRange}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Address</span>,
            selector: (row) => row.clientAddress,
            sortable: true,
            width: "20%",
            cell: (row) => <WordWrapCell>{row.clientAddress}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Occupation</span>,
            selector: (row) => row.clientOccupation,
            sortable: true,
            width: "15%",
            cell: (row) => <WordWrapCell>{row.clientOccupation}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Email</span>,
            sortable: true,
            width: "5%",
            selector: (row) => row.clientEmail,
            cell: (row) =>
                row.clientEmail ? (
                    <div className="phone-container">
                        <MdEmail
                            className="phone-icon"
                            color={defaultTheme.goldColorLogo}
                        />
                        <span className="phone-number">{row.clientEmail}</span>
                    </div>
                ) : null,
        },
        {
            name: <span className="font-weight-bold fs-13">Project</span>,
            selector: (row) => row.projectName,
            sortable: true,
            width: "10%",
            cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Remarks</span>,
            selector: (row) => row.remarks,
            sortable: true,
            width: "50%",
            cell: (row) => <WordWrapCell>{row.remarks}</WordWrapCell>
        },
    ];

    const handleSelectChange = (name, selectedOption) => {
        setFormState((prevState) => ({
            ...prevState,
            [name]: selectedOption,
        }));
    };

    const handleShowData = () => {
        if (!formState.associateSelect) {
            toast.error("Please Select An Associate To Transfer From.");
            return;
        } else {
            getProspectsDetails();
        }
    };

    useEffect(() => {
        if (flag) {
            getProspectsDetails();
        }
    }, [page]);

    const handleTransferData = () => {
        const selectedProspects = rowData.filter((row) => row.isChecked);
        if (!formState.associateSelect) {
            toast.error("Please Select An Associate To Transfer From.");
        } else if (!formState.toAssociateSelect) {
            toast.error("Please Select An Associate To Transfer To.");
        } else if (selectedProspects.length === 0) {
            toast.error("Please Select At Least One Prospect To Transfer.");
        }
        // else if (!formState.transferToScreen) {
        //     toast.error("Please Select Where You Want To Transfer.");
        // }
        else {
            const prospectsToTransfer = selectedProspects.map(
                ({ isChecked, ...rest }) => rest
            ); // Remove isChecked from each object
            mutate(prospectsToTransfer);
        }
    };

    // const transferToGroup = [
    //     {
    //         "label": "Suspect",
    //         "value": 'NO'
    //     },
    //     {
    //         "label": "Prospect",
    //         "value": 'YES'
    //     }
    // ]

    const meetingtypeGroup = [
        {
            "label": "Meeting",
            "value": 'Meeting'
        },
        {
            "label": "All",
            "value": null
        }
    ]

    useEffect(() => {
        const checkAccess = async () => {
            if (role !== USER_TYPE.ASSOCIATE) {
                const hasAccess = await CheckUserAccess(userId, 'trasfer-prospect-data');
                setAccessGranted(hasAccess);
            }
            else {
                setAccessGranted(true);
            }
        };
        checkAccess();
    }, [userId, role]);

    // Handle radio button change
    const handleRadioChange = (event) => {
        setMeetingStatus(event.target.value,);
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Transfer" breadcrumbItem="Prospects" />
            {(pending || transferLoading || isLoading) && <ScreenLoader />}
            <Container fluid={true}>
                <h3
                    style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: defaultTheme.redColor,
                        marginBottom: 10
                    }}
                >
                    Note: The maximum transfer limit is set to 200 by default. To change this, please update the value in the <strong>Limit</strong> input field.
                </h3>

                <Card>
                    <CardBody>
                        <Row className="g-2">
                            <Col lg="2">
                                <h6 className="font-size-11 fw-semibold text-muted">Select Associate</h6>
                                <Select
                                    style={{ zIndex: 9999 }}
                                    menuPortalTarget={document.body}
                                    isClearable
                                    value={formState.associateSelect}
                                    onChange={(selectedOption) => handleSelectChange("associateSelect", selectedOption)}
                                    options={
                                        Array.isArray(associateList?.data?.data)
                                            ? associateList?.data?.data
                                            : []
                                    }
                                />
                            </Col>
                            {/* Meeting Type Select */}
                            <Col lg="2">
                                <h6 className="font-size-11 fw-semibold text-muted">Meeting Type</h6>
                                <Select
                                    isClearable
                                    options={structuredOutput["Type"]}
                                    className="react-select"
                                    onChange={setMeetingType}
                                    value={meetingType}
                                    style={{ zIndex: 9999 }}
                                    menuPortalTarget={document.body}
                                />
                            </Col>
                            <Col lg="2">
                                <h6 className="font-size-11 fw-semibold text-muted">Project</h6>
                                <Select
                                    style={{ zIndex: 9999 }}
                                    menuPortalTarget={document.body}
                                    isClearable
                                    value={project}
                                    onChange={setProject}
                                    options={projectData?.data?.data || []}
                                />
                            </Col>

                            <Col lg="2">
                                <h6 className="font-size-11 fw-semibold text-muted">Due Date Start</h6>
                                <input
                                    className="form-control"
                                    type="date"
                                    placeholder="Due Date Start..."
                                    value={dueFromDate}
                                    onChange={(e) => setDueFromDate(e.target.value)}
                                />
                            </Col>
                            <Col lg="2">
                                <h6 className="font-size-11 fw-semibold text-muted">Due Date End</h6>
                                <input
                                    className="form-control"
                                    type="date"
                                    placeholder="Due Date End..."
                                    value={dueToDate}
                                    onChange={(e) => setDueToDate(e.target.value)}
                                />
                            </Col>
                            <Col lg="2">
                                <h6 className="font-size-11 fw-semibold text-muted">Limit</h6>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Page Limit..."
                                    value={pageLimit}
                                    onChange={(e) => setPageLimit(e.target.value)}
                                />
                            </Col>
                            {/* Radio Buttons */}
                            <Col lg="3" >
                                <h6 className="font-size-11 fw-semibold text-muted">Meeting Status</h6>
                                <div className="radio-button-container">
                                    {["start", "cancel", "end"].map((type) => (
                                        <label
                                            key={type}
                                            className={`radio-label ${meetingStatus === type ? "active" : ""}`}
                                        >
                                            <input
                                                type="radio"
                                                value={type}
                                                checked={meetingStatus === type}
                                                onChange={handleRadioChange}
                                            />
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </label>
                                    ))}
                                </div>
                            </Col>

                            <Col lg="2">
                                <h6 className="font-size-11 fw-semibold text-muted">Purpose</h6>
                                <Select
                                    style={{ zIndex: 9999 }}
                                    menuPortalTarget={document.body}
                                    isClearable
                                    value={formState.purpose}
                                    onChange={(selectedOption) => handleSelectChange("purpose", selectedOption)}
                                    options={
                                        Array.isArray(meetingtypeGroup)
                                            ? meetingtypeGroup?.filter(
                                                (option) =>
                                                    option.value !== formState.purpose?.value // Filter out the selected associate
                                            )
                                            : []
                                    }
                                />
                            </Col>
                            <Col
                                lg="1"
                                className="d-flex align-items-center justify-content-center"
                            >
                                <Button
                                    color="primary"
                                    onClick={handleShowData}
                                >
                                    Show
                                </Button>
                            </Col>
                            <Col lg="2">
                                <h6 className="font-size-11 fw-semibold text-muted">To Associate</h6>
                                <Select
                                    style={{ zIndex: 9999 }}
                                    menuPortalTarget={document.body}
                                    isClearable
                                    value={formState.toAssociateSelect}
                                    onChange={(selectedOption) => handleSelectChange("toAssociateSelect", selectedOption)}
                                    options={
                                        Array.isArray(associateList?.data?.data)
                                            ? associateList?.data?.data?.filter(
                                                (option) =>
                                                    option.value !== formState.associateSelect?.value // Filter out the selected associate
                                            )
                                            : []
                                    }
                                />
                            </Col>
                            {/* <Col lg="2">
                                <h6 className="font-size-11 fw-semibold text-muted">Select Transfer To</h6>
                                <Select
                                    style={{ zIndex: 9999 }}
                                    menuPortalTarget={document.body}
                                    isClearable
                                    value={formState.transferToScreen}
                                    onChange={(selectedOption) => handleSelectChange("transferToScreen", selectedOption)}
                                    options={transferToGroup}
                                />
                            </Col> */}

                            <Col
                                lg="2"
                                className="d-flex align-items-center"
                            >
                                <Button
                                    color="secondary"
                                    onClick={handleTransferData}
                                >
                                    Transfer
                                </Button>
                            </Col>

                        </Row>
                    </CardBody>
                </Card>

                {rowData?.length > 0 && (
                    <AppTable
                        key={pageLimit}
                        progressPending={pending}
                        columns={columns}
                        data={rowData || []}
                        pagination
                        paginationTotalRows={totalElements}
                        paginationServer
                        paginationPerPage={Number(pageLimit)}
                        onChangePage={(newPage) => {
                            setPage(newPage);
                            setFlag(true);
                        }}
                    />
                )}
            </Container>

            <TransferProgressModal
                show={showModal}
                fileId={uploadedFileId}
                onClose={() => {
                    setShowModal(false);
                    setUploadedFileId(null);
                }}
            />
        </PageContent>
    );
}