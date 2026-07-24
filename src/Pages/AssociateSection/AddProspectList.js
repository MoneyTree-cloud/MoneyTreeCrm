/* eslint-disable eqeqeq */
import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost, usePut } from "../../Hooks/useApi";
import { CREATE_PROSPECT, GET_ALL_PROSPECTS_MASTER, PROJECT_ID_NAME_DROPDOWN, UPDATE_PROSPECT, MARK_DND, GET_MY_ALL_TEAM } from "../../helpers/url_helper";
import { useLocation, useNavigate } from "react-router-dom";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { RegexFile } from "../../helpers/RegexFile";
import { useUserStore } from "../../store/useUserStore";
import PageContent from "../../components/Common/PageContent";
import { RequiredStar } from "../../helpers/function_helper";

export default function AddProspectList() {
    const location = useLocation();
    const { userName, empCode, userId, parentUserId } = useUserStore((state) => state.user);

    const today = new Date();
    const formattedDate = today.toISOString()?.split("T")[0]; // Format as YYYY-MM-DD
    const { rowData, screen, associateValue, searchByValue, searchTerm, orderByValue, fromDate, toDate, page, messageStatus, prosType, budget, meetingType, teamStatus, highlightProspectId_, highlightRowIndex_, purposeType, activeTab } = location.state || {};
    const [structuredOutput, setStructuredOutput] = useState({});
    const [errors, setErrors] = useState({});
    const navigation = useNavigate();

    const INITIALSTATE = {
        meetingType: null,
        date: "",
        assName: "",
        clientName: "",
        phoneNo: "",
        budget: null,
        project: null,
        otherProject: "",
        address: "",
        occupation: "",
        dueDate: "",
        prospectPurpose: null,
        timing: null,
        source: null,
        meetingAttempt: null,
        emailId: "",
        remarks: "",
        trackStatus: null
    };
    const [formState, setFormState] = useState(INITIALSTATE);
    const [dndRemarks, setDndRemarks] = useState('')
    const [dndModal, setDndModal] = useState(false)
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [wordCount, setWordCount] = useState(0)
    const { data, isLoading } = useGet(GET_ALL_PROSPECTS_MASTER);
    const { data: projectData, isLoading: loadingProject } = useGet(PROJECT_ID_NAME_DROPDOWN);
    // const { data: connectStatusData } = useGet(CONNECT_STATUS_DROPDOWN);
    const [seniorSelected, setSeniorSelected] = useState(null);
    const [meetingBy, setMeetingBy] = useState('')


    // Only fetch team list when needed — Closed sale + Senior conducted
    const { data: teamList } = useGet(
        `${GET_MY_ALL_TEAM}${parentUserId}`,
        {
            enabled:
                formState?.meetingType?.label === "Closed (For Sale)" &&
                meetingBy === "Senior",
        }
    );

    // On edit: if the row was finalised by current user, auto-select "Self"
    // If by someone else, select "Senior" and pre-fill the dropdown
    useEffect(() => {
        if (!rowData?.id) return;
        if (rowData?.finalSaleClosedById) {
            if (String(rowData.finalSaleClosedById) === String(userId)) {
                setMeetingBy("Self");
                setSeniorSelected(null);
            } else {
                setMeetingBy("Senior");
                setSeniorSelected({
                    value: rowData.finalSaleClosedById,
                    label: rowData.finalSaleClosedBy || "",
                });
            }
        }
    }, [rowData, userId]);

    useEffect(() => {
        if (data?.data?.status_code === 1) {
            const output = {}; // Create a new output object

            data.data.object.forEach((item) => {
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
    }, [data]);

    useEffect(() => {
        if (rowData && (screen === "prospect" || screen === "FavouriteProspects")) {
            setFormState((prevState) => ({
                ...prevState,
                date: rowData?.prosDate,
                assName: rowData.associateName || "",
                clientName: rowData.clientName || "",
                phoneNo: rowData.dnd ? "0000000000" : rowData.phoneNo || "",
                address: rowData.clientAddress || "",
                state: rowData.state || "",
                pin: rowData.pincode || "",
                occupation: rowData.clientOccupation || null,
                dueDate: rowData?.dueDate
                    ? rowData.dueDate.split(" ")[0]
                    : "",
                emailId: rowData.clientEmail || "",
                remarks: rowData.remarks || "",
                otherProject: rowData?.otherProjectName || "",
            }));
        } else if (rowData && screen === "suspect") {
            setFormState((prevState) => ({
                ...prevState,
                date: formattedDate,
                assName: rowData.associateName || "",
                clientName: rowData.leadName || "",
                phoneNo: rowData.leadMobile || "",
                remarks: rowData.remark || "",
            }));
        } else if (rowData && screen === "connect") {
            setFormState((prevState) => ({
                ...prevState,
                date: formattedDate,
                assName: rowData.associateName || "",
                clientName: rowData.suspectName || "",
                phoneNo: rowData.suspectMobile || "",
                remarks: rowData.remark || "",
            }));
        }
    }, [
        formattedDate,
        projectData?.data?.data,
        rowData,
        screen,
        structuredOutput,
    ]);
    //meetingType
    useEffect(() => {
        if (rowData?.typeId && (screen === "prospect" || screen === "FavouriteProspects")) {
            const meetingType = structuredOutput["Type"]?.find(
                (item) => item.value == rowData.typeId
            );
            if (meetingType) {
                setFormState((prevState) => ({ ...prevState, meetingType }));
            }
        }
    }, [rowData.typeId, screen, structuredOutput]);

    //budget
    useEffect(() => {
        if (rowData?.clientBudgetId && (screen === "prospect" || screen === "FavouriteProspects")) {
            const budget = structuredOutput["Budget Dropdown"]?.find(
                (item) => item.value == rowData.clientBudgetId
            );
            if (budget) {
                setFormState((prevState) => ({ ...prevState, budget }));
            }
        }
    }, [rowData.clientBudgetId, screen, structuredOutput]);

    //Project
    useEffect(() => {
        if (rowData?.projectId && (screen === "prospect" || screen === "FavouriteProspects")) {
            const project = projectData?.data?.data?.find(
                (item) => item.value === rowData.projectId
            );
            if (project) {
                setFormState((prevState) => ({ ...prevState, project }));
            }
        }
    }, [projectData?.data?.data, rowData.projectId, screen]);

    //Track Status
    // useEffect(() => {
    //     if (rowData?.trackStatusId && screen === "prospect") {
    //         const trackStatus = connectStatusData?.data?.data?.find(
    //             (item) => item.value === rowData.trackStatusId
    //         );
    //         if (trackStatus) {
    //             setFormState((prevState) => ({ ...prevState, trackStatus }));
    //         }
    //     }
    // }, [connectStatusData?.data?.data, rowData.trackStatusId, screen]);

    // useEffect(() => {
    //     if (!rowData?.trackStatusId && screen === "prospect") {
    //         const trackStatus = connectStatusData?.data?.data?.find(
    //             (item) => item.value === 2
    //         );
    //         if (trackStatus) {
    //             setFormState((prevState) => ({ ...prevState, trackStatus }));
    //         }
    //     }
    // }, [connectStatusData?.data?.data, rowData.trackStatusId, screen]);

    // Prospect Purpose

    useEffect(() => {
        if (rowData?.purposeId && (screen === "prospect" || screen === "FavouriteProspects")) {
            const prospectPurpose = structuredOutput["Purpose Dropdown"]?.find(
                (item) => item.value == rowData.purposeId
            );
            if (prospectPurpose) {
                setFormState((prevState) => ({ ...prevState, prospectPurpose }));
            }
        }
    }, [rowData.purposeId, screen, structuredOutput]);

    //Timing
    useEffect(() => {
        if (rowData?.taskTimingId && (screen === "prospect" || screen === "FavouriteProspects")) {
            const timing = structuredOutput["timing Dropdown"]?.find(
                (item) => item.value == rowData.taskTimingId
            );
            if (timing) {
                setFormState((prevState) => ({ ...prevState, timing }));
            }
        }
    }, [rowData.taskTimingId, screen, structuredOutput]);

    //source
    useEffect(() => {
        if (rowData?.sourceId && (screen === "prospect" || screen === "FavouriteProspects")) {
            const source = structuredOutput["Data Source"]?.find(
                (item) => item.value == rowData.sourceId
            );
            if (source) {
                setFormState((prevState) => ({ ...prevState, source }));
            }
        }
    }, [rowData.sourceId, screen, structuredOutput]);

    //source
    useEffect(() => {
        if (rowData?.meetingAttemptId && (screen === "prospect" || screen === "FavouriteProspects")) {
            const meetingAttempt = structuredOutput["Meeting attempted"]?.find(
                (item) => item.value == rowData.meetingAttemptId
            );
            if (meetingAttempt) {
                setFormState((prevState) => ({ ...prevState, meetingAttempt }));
            }
        }
    }, [rowData.meetingAttemptId, screen, structuredOutput]);

    const { isPending, mutate: createProspect } = usePost(CREATE_PROSPECT + userId, {
        onSuccess: (response) => {
            if (response?.data?.status === 1) {
                handleBack();
                toast.success(response.data.message);
                setFormState(INITIALSTATE);
            } else {
                toast.error(response.data.message);
            }
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    // const { isPending: isPendingConnect, mutate: mutateConnect } = usePost(CREATE_CONNECT_PROSPECT + userId, {
    //     onSuccess: (response) => {
    //         if (response?.data?.status === 1) {
    //             handleBack();
    //             toast.success(response.data.message);
    //             setFormState(INITIALSTATE);
    //         } else {
    //             toast.error(response.data.message);
    //         }
    //     },
    //     onError: (err) => {
    //         toast.error(err.message);
    //     },
    // });

    const { isPending: updateLoading, mutate: updateProspect } = usePut(
        UPDATE_PROSPECT + userId,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    handleBack();
                    // setFormState(INITIALSTATE)
                    toast.success(response.data.message);
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id === "remarks") {
            const words = value.trim().split(/\s+/).filter(Boolean);
            setWordCount(words.length);
        }
        if (id === "phoneNo") {
            if (/^\d{0,10}$/.test(value)) {
                setFormState({ ...formState, [id]: value });
            }
        } else if (id === "pin") {
            if (/^\d{0,6}$/.test(value)) {
                setFormState({ ...formState, [id]: value });
            }
        } else if (id === "occupation") {
            // Ensure occupation is handled here, if needed.
            setFormState({ ...formState, [id]: value });
        } else {
            // Default case for all other inputs
            setFormState({ ...formState, [id]: value });
        }

        // Clear error for this field
        setErrors((prev) => ({
            ...prev,
            [id]: "",
        }));
    };

    const handleSelectChange = (field) => (selectedOption) => {
        setFormState((prev) => ({
            ...prev,
            [field]: selectedOption,
        }));
        setErrors((prev) => ({
            ...prev,
            [field]: "", // Clear error for this field
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formState.meetingType)
            newErrors.meetingType = "Meeting Type is required.";
        if (!formState.clientName)
            newErrors.clientName = "Client Name is required.";
        if (!formState.phoneNo) {
            newErrors.phoneNo = "Mobile No. is required.";
        } else if (!RegexFile.mobileNo.test(formState.phoneNo)) {
            newErrors.phoneNo = "Mobile No. must be a 10-digit number.";
        }
        if (!formState.budget) newErrors.budget = "Budget is required.";
        if (!formState.project) newErrors.project = "Project is required.";
        if (!formState.address) newErrors.address = "Address is required.";
        if (!formState.occupation) newErrors.occupation = "Occupation is required.";
        if (!formState.prospectPurpose)
            newErrors.prospectPurpose = "Purpose is required.";
        if (!formState.timing) newErrors.timing = "Timing is required.";
        if (!formState.source) newErrors.source = "Source is required.";
        if (!formState.meetingAttempt)
            newErrors.meetingAttempt = "Meeting Attempt is required.";
        if (!formState.remarks) newErrors.remarks = "Remarks are required.";
        if (formState.project?.label === 'Other' && !formState?.otherProject) newErrors.otherProject = "Other Project Name Is Required.";
        // if (!formState.trackStatus)
        //     newErrors.trackStatus = "Track status is required."
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            toast.error("Some Mandatory Fields Are Still Not Filled");
            return;
        }
        // Validate closed-sale meeting attribution
        if (formState?.meetingType?.label === "Closed (For Sale)") {
            if (!meetingBy) {
                toast.error("Please specify who conducted this closed-sale meeting.");
                return;
            }
            if (meetingBy === "Senior" && !seniorSelected) {
                toast.error("Please select the senior who conducted the meeting.");
                return;
            }
        }
        const meetRemarksWordCount = formState.remarks.trim().split(/\s+/).filter((word) => word.length > 0).length;

        if (meetRemarksWordCount < 25) {
            toast.error("Remarks should be at least 25 words.");
            return;
        }
        // Resolve who closed the sale (only relevant for "Closed (For Sale)")
        const closedSaleFields = {};
        if (formState?.meetingType?.label === "Closed (For Sale)") {
            if (meetingBy === "Self") {
                closedSaleFields.finalSaleClosedById = userId;
                closedSaleFields.finalSaleClosedBy = userName + ' (' + empCode + ')';
            } else {
                closedSaleFields.finalSaleClosedById = seniorSelected?.value;
                closedSaleFields.finalSaleClosedBy = seniorSelected?.label;
            }
        }
        let params = {
            prospectId: "",
            typeId: formState?.meetingType?.value,
            typeName: formState?.meetingType?.label,
            prosDate: formState?.date,
            clientName: formState.clientName,
            phoneNo: formState.phoneNo,
            clientBudgetId: formState?.budget?.value,
            clientBudgetName: formState?.budget?.label,
            clientAddress: formState.address,
            clientOccupation: formState.occupation,
            clientEmail: formState.emailId,
            projectName: formState?.project?.label,
            projectId: formState?.project?.value,
            dueDate: formState.dueDate ? formState.dueDate : "",
            taskTimingId: formState?.timing?.value,
            taskTimingRange: formState?.timing?.label,
            remarks: formState.remarks,
            meetingAttemptId: formState?.meetingAttempt?.value,
            meetingAttemptCount: formState?.meetingAttempt?.label,
            sourceId: formState?.source?.value,
            sourceName: formState?.source?.label,
            purposeId: formState?.prospectPurpose?.value,
            purposeName: formState?.prospectPurpose?.label,
            metingStatus: "misc",
            prospectStatus: "misc",
            isTransferData: rowData?.isTransferred === "YES" ? 'yes' : 'no',
            transferBy: rowData?.transferBy || "",
            transferFromId: 0,
            trackStatusId: formState?.trackStatus?.value,
            leadId: rowData.leadId,
            otherProjectName: formState?.otherProject,
            ...closedSaleFields,
        };
        // if (screen === 'connect') {
        //     params.connectSuspectId = rowData.id;

        // } else {
        //     params.id = 0;
        //     params.leadId = rowData.leadId;
        // }
        // if (screen === 'connect') {
        //     mutateConnect(params)
        // }
        // else {
        //     createProspect(params);
        // }
        createProspect(params);
    };
    const handleBack = () => {
        if (screen === "FavouriteProspects") {
            navigation("/my-favourite", {
                state: {
                    page_: page,
                    activeTab,
                    highlightProspectId_,
                    highlightRowIndex_,
                },
            });
        } else {
            navigation("/prospect-list-menu", {
                state: {
                    associateValue_: associateValue,
                    searchByValue_: searchByValue,
                    searchTerm_: searchTerm,
                    orderByValue_: orderByValue,
                    fromDate_: fromDate,
                    toDate_: toDate,
                    page_: page,
                    messageStatus_: messageStatus,
                    prosType_: prosType,
                    budget_: budget,
                    meetingType_: meetingType,
                    teamStatus_: teamStatus,
                    highlightProspectId_,
                    highlightRowIndex_,
                    purposeType_: purposeType,
                },
            });
        }
    };

    const handleUpdate = () => {
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            toast.error("Some Mandatory Fields Are Still Not Filled");
            return;
        }
        // Validate closed-sale meeting attribution
        if (formState?.meetingType?.label === "Closed (For Sale)") {
            if (!meetingBy) {
                toast.error("Please specify who conducted this closed-sale meeting.");
                return;
            }
            if (meetingBy === "Senior" && !seniorSelected) {
                toast.error("Please select the senior who conducted the meeting.");
                return;
            }
        }
        const meetRemarksWordCount = formState.remarks.trim().split(/\s+/).filter((word) => word.length > 0).length;
        if (meetRemarksWordCount < 25) {
            toast.error("Remarks should be at least 25 words.");
            return;
        }
        if (acceptTerms === false && formState?.meetingType?.label === "Closed (For Sale)") {
            toast.error("Please Accept The Terms To Proceed")
            return
        }

        // Resolve who closed the sale (only relevant for "Closed (For Sale)")
        const closedSaleFields = {};
        if (formState?.meetingType?.label === "Closed (For Sale)") {
            if (meetingBy === "Self") {
                closedSaleFields.finalSaleClosedById = userId;
                closedSaleFields.finalSaleClosedBy = userName + ' (' + empCode + ')';
            } else {
                closedSaleFields.finalSaleClosedById = seniorSelected?.value;
                closedSaleFields.finalSaleClosedBy = seniorSelected?.label;
            }
        }

        let params = {
            id: rowData?.id,
            prospectId: rowData.prospectId,
            typeId: formState?.meetingType?.value,
            typeName: formState?.meetingType?.label,
            prosDate: formState?.date,
            clientName: formState.clientName,
            phoneNo: formState.phoneNo,
            clientBudgetId: formState.budget?.value,
            clientBudgetName: formState?.budget?.label,
            clientAddress: formState.address,
            clientOccupation: formState.occupation,
            clientEmail: formState.emailId,
            projectName: formState?.project?.label,
            projectId: formState?.project?.value,
            dueDate: formState.dueDate ? formState.dueDate : "",
            taskTimingId: formState?.timing.value,
            taskTimingRange: formState?.timing?.label,
            remarks: formState.remarks,
            meetingAttemptId: formState?.meetingAttempt?.value,
            meetingAttemptCount: formState?.meetingAttempt?.label,
            sourceId: formState?.source?.value,
            sourceName: formState?.source?.label,
            purposeId: formState?.prospectPurpose?.value,
            purposeName: formState?.prospectPurpose?.label,
            metingStatus: "misc",
            prospectStatus: "misc",
            isTransferData: rowData?.isTransferData ? rowData?.isTransferData : 'no',
            transferBy: rowData?.transferBy || "",
            transferFromId: 0,
            trackStatusId: formState?.trackStatus?.value,
            otherProjectName: formState?.otherProject,
            ...closedSaleFields,
        };

        updateProspect(params);
    };

    const confirmStatusChange = () => {
        if (!dndRemarks) {
            toast.error('DND Reason Is Required')
            return
        }
        let params = {
            "dndClientNumber": formState.phoneNo,
            "dndClientName": formState.clientName,
            "associateId": empCode,
            "associateName": userName,
            "remarks": dndRemarks
        };
        markDND(params);
    }

    const { isPending: dndLoading, mutate: markDND } = usePost(
        MARK_DND,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    handleDndModalStatusChange()
                    handleBack();
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    const handleDndModalStatusChange = () => {
        setDndRemarks('')
        setDndModal(!dndModal)
    }

    return (
        <PageContent>
            <Breadcrumbs
                title="Associate Section"
                breadcrumbItem={!(screen === "suspect" || screen === "connect") ? "Update Prospect" : "Add Prospect"}
            />

            <Container fluid={true}>
                {(isLoading || isPending || updateLoading || loadingProject || dndLoading) && <ScreenLoader />}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardBody>
                            <Row className="g-3">
                                <Col md="3">
                                    <h6 className="font-size-11">Meeting Type <RequiredStar /></h6>
                                    <Select
                                        isClearable
                                        options={structuredOutput["Type"]}
                                        onChange={handleSelectChange("meetingType")}
                                        value={formState.meetingType}
                                    />
                                    {errors.meetingType && (
                                        <div className="text-danger font-size-10">
                                            {errors.meetingType}
                                        </div>
                                    )}
                                </Col>
                                {formState?.meetingType?.label === "Closed (For Sale)" && (
                                    <>
                                        <Col md="3">
                                            <h6 className="font-size-11">
                                                Meeting Conducted By <RequiredStar />
                                            </h6>
                                            <div className="d-flex gap-3 mt-1">
                                                <label className="d-flex align-items-center gap-1" style={{ cursor: "pointer" }}>
                                                    <input
                                                        type="radio"
                                                        name="meetingBy"
                                                        value="Self"
                                                        checked={meetingBy === "Self"}
                                                        onChange={() => {
                                                            setMeetingBy("Self");
                                                            setSeniorSelected(null);
                                                            setErrors((p) => ({ ...p, seniorSelected: "" }));
                                                        }}
                                                    />
                                                    Self
                                                </label>
                                                <label className="d-flex align-items-center gap-1" style={{ cursor: "pointer" }}>
                                                    <input
                                                        type="radio"
                                                        name="meetingBy"
                                                        value="Senior"
                                                        checked={meetingBy === "Senior"}
                                                        onChange={() => setMeetingBy("Senior")}
                                                    />
                                                    Senior
                                                </label>
                                            </div>
                                        </Col>

                                        {meetingBy === "Senior" && (
                                            <Col md="3">
                                                <h6 className="font-size-11">
                                                    Select Senior <RequiredStar />
                                                </h6>
                                                <Select
                                                    isClearable
                                                    options={
                                                        Array.isArray(teamList?.data?.data) ? teamList.data.data : []
                                                    }
                                                    value={seniorSelected}
                                                    onChange={(opt) => {
                                                        setSeniorSelected(opt);
                                                        setErrors((p) => ({ ...p, seniorSelected: "" }));
                                                    }}
                                                    placeholder="Choose senior..."
                                                />
                                                {errors.seniorSelected && (
                                                    <div className="text-danger font-size-10">
                                                        {errors.seniorSelected}
                                                    </div>
                                                )}
                                            </Col>
                                        )}
                                    </>
                                )}
                                <Col md="3">
                                    <h6 className="font-size-11">Date</h6>
                                    <input
                                        id="date"
                                        style={{ backgroundColor: defaultTheme.btnDisable }}
                                        className="form-control"
                                        type="date"
                                        disabled
                                        value={formState.date}
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Associate Name</h6>
                                    <input
                                        id="assName"
                                        style={{ backgroundColor: defaultTheme.btnDisable }}
                                        className="form-control"
                                        type="text"
                                        disabled
                                        placeholder="Enter Ass. Name..."
                                        value={formState.assName || userName}
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Client Name <RequiredStar /></h6>
                                    <input
                                        id="clientName"
                                        className="form-control"
                                        type="text"
                                        disabled
                                        placeholder="Enter Client Name..."
                                        value={formState.clientName}
                                        style={{ backgroundColor: defaultTheme.btnDisable }}
                                        onChange={handleChange}
                                    />
                                    {errors.clientName && (
                                        <div className="text-danger font-size-10">
                                            {errors.clientName}
                                        </div>
                                    )}
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Mobile No. <RequiredStar /></h6>
                                    <input
                                        id="phoneNo"
                                        className="form-control"
                                        disabled
                                        style={{ backgroundColor: defaultTheme.btnDisable }}
                                        type="number"
                                        maxLength={10}
                                        placeholder="Enter Mobile Number..."
                                        value={formState.phoneNo}
                                        onChange={handleChange}
                                    />
                                    {errors.phoneNo && (
                                        <div className="text-danger font-size-10">
                                            {errors.phoneNo}
                                        </div>
                                    )}
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Budget <RequiredStar /></h6>
                                    <Select
                                        isClearable
                                        options={structuredOutput["Budget Dropdown"]}
                                        onChange={handleSelectChange("budget")}
                                        value={formState.budget}
                                    />
                                    {errors.budget && (
                                        <div className="text-danger font-size-10">
                                            {errors.budget}
                                        </div>
                                    )}
                                </Col>

                                <Col md="3">
                                    <h6 className="font-size-11">Project <RequiredStar /></h6>
                                    <Select
                                        isClearable
                                        options={
                                            Array.isArray(projectData?.data?.data)
                                                ? projectData?.data?.data
                                                : []
                                        }
                                        onChange={handleSelectChange("project")}
                                        value={formState.project}
                                    />
                                    {errors.project && (
                                        <div className="text-danger font-size-10">
                                            {errors.project}
                                        </div>
                                    )}
                                </Col>
                                {formState?.project?.label === "Other" &&
                                    <Col md="3">
                                        <h6 className="font-size-11">Other Project <RequiredStar /></h6>
                                        <input
                                            id="otherProject"
                                            className="form-control"
                                            type="text"
                                            placeholder="Enter The Other Project..."
                                            value={formState.otherProject}
                                            onChange={handleChange}
                                        />
                                        {errors.otherProject && (
                                            <div className="text-danger font-size-10">
                                                {errors.otherProject}
                                            </div>
                                        )}
                                    </Col>
                                }
                                <Col md="3">
                                    <h6 className="font-size-11">Occupation <RequiredStar /></h6>
                                    <input
                                        id="occupation"
                                        className="form-control"
                                        type="text"
                                        placeholder="Enter Occupation..."
                                        value={formState.occupation}
                                        onChange={handleChange}
                                    />
                                    {errors.occupation && (
                                        <div className="text-danger font-size-10">
                                            {errors.occupation}
                                        </div>
                                    )}
                                </Col>
                                <Col md="9">
                                    <h6 className="font-size-11">Address <RequiredStar /></h6>
                                    <input
                                        id="address"
                                        className="form-control"
                                        type="text"
                                        placeholder="Enter Address..."
                                        value={formState.address}
                                        onChange={handleChange}
                                    />
                                    {errors.address && (
                                        <div className="text-danger font-size-10">
                                            {errors.address}
                                        </div>
                                    )}
                                </Col>

                                <Col md="3">
                                    <h6 className="font-size-11">Next Folloup Date</h6>
                                    <input
                                        id="dueDate"
                                        className="form-control"
                                        type="date"
                                        value={formState.dueDate}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={handleChange}
                                    />
                                    {errors.dueDate && (
                                        <div className="text-danger font-size-10">
                                            {errors.dueDate}
                                        </div>
                                    )}
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Purpose<RequiredStar /></h6>
                                    <Select
                                        isClearable
                                        options={structuredOutput["Purpose Dropdown"]}
                                        onChange={handleSelectChange("prospectPurpose")}
                                        value={formState.prospectPurpose}
                                    />
                                    {errors.prospectPurpose && (
                                        <div className="text-danger font-size-10">
                                            {errors.prospectPurpose}
                                        </div>
                                    )}
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Timing <RequiredStar /></h6>
                                    <Select
                                        isClearable
                                        options={structuredOutput["timing Dropdown"]}
                                        onChange={handleSelectChange("timing")}
                                        value={formState.timing}
                                    />
                                    {errors.timing && (
                                        <div className="text-danger font-size-10">
                                            {errors.timing}
                                        </div>
                                    )}
                                </Col>

                                <Col md="3">
                                    <h6 className="font-size-11">Source <RequiredStar /></h6>
                                    <Select
                                        isClearable
                                        options={structuredOutput["Data Source"]}
                                        onChange={handleSelectChange("source")}
                                        value={formState.source}
                                    />
                                    {errors.source && (
                                        <div className="text-danger font-size-10">
                                            {errors.source}
                                        </div>
                                    )}
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Meeting Attempt <RequiredStar /></h6>
                                    <Select
                                        isClearable
                                        options={structuredOutput["Meeting attempted"]}
                                        onChange={handleSelectChange("meetingAttempt")}
                                        value={formState.meetingAttempt}
                                    />
                                    {errors.meetingAttempt && (
                                        <div className="text-danger font-size-10">
                                            {errors.meetingAttempt}
                                        </div>
                                    )}
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Email ID</h6>
                                    <input
                                        id="emailId"
                                        className="form-control"
                                        type="email"
                                        placeholder="Enter Email Id..."
                                        value={formState.emailId}
                                        onChange={handleChange}
                                    />
                                    {errors.email && (
                                        <div className="text-danger font-size-10">
                                            {errors.email}
                                        </div>
                                    )}
                                </Col>
                                {/* <Col md="3">
                                    <h6 className="font-size-11">
                                        Status <RequiredStar/>
                                    </h6>
                                    <Select
                                        isClearable
                                        menuPlacement="auto"
                                        options={Array.isArray(connectStatusData?.data?.data) ? connectStatusData?.data?.data : []}
                                        onChange={handleSelectChange("trackStatus")}
                                        value={formState.trackStatus}
                                    />
                                    {errors.trackStatus && (
                                        <div className="text-danger font-size-10">
                                            {errors.trackStatus}
                                        </div>
                                    )}
                                </Col> */}
                                <Col md="6">
                                    <h6 className="font-size-11">
                                        Remarks<RequiredStar /> <span>Min 25 words required ({wordCount}/{25})</span>
                                    </h6>
                                    <textarea
                                        id="remarks"
                                        className={`form-control ${errors.remarks ? "is-invalid" : ""}`}
                                        rows="5"
                                        placeholder="Type here..."
                                        onChange={handleChange}
                                        value={formState.remarks}
                                    ></textarea>
                                    {errors.remarks && (
                                        <div className="invalid-feedback font-size-10">
                                            {errors.remarks}
                                        </div>
                                    )}
                                </Col>
                            </Row>

                            {formState?.meetingType?.label === "Closed (For Sale)" &&
                                <div className="form-check mt-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="acceptTerms"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="acceptTerms">
                                        This booking is closed for sale as per MoneyTree Policy. <RequiredStar />
                                    </label>
                                </div>
                            }
                            <div className="d-flex align-items-center mt-4 justify-content-center">
                                {Object.keys(rowData).length > 0 && !(screen === "suspect" || screen === "connect") ? (
                                    <Button
                                        type="button"
                                        color="primary"
                                        onClick={handleUpdate}
                                    >
                                        Update
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        color="primary">
                                        Save
                                    </Button>
                                )}

                                <Button
                                    type="reset"
                                    color="secondary"
                                    className="ms-2"
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>

                                <Button
                                    type="button"
                                    color="danger"
                                    className="ms-2"
                                    onClick={handleDndModalStatusChange}
                                >
                                    Mark As DND
                                </Button>
                            </div>

                        </CardBody>
                    </Card>
                </form>
            </Container>

            {/* Modal DND */}
            <Modal
                isOpen={dndModal}
                toggle={handleDndModalStatusChange}
            >
                <ModalHeader
                    toggle={handleDndModalStatusChange}
                >
                    Confirm DND Mark
                </ModalHeader>
                <ModalBody>
                    <p>Are you sure you want to mark this as DND ?</p>
                    <textarea
                        className="form-control mt-2"
                        placeholder="Enter DND Reason..."
                        value={dndRemarks}
                        onChange={(e) => setDndRemarks(e.target.value)}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={confirmStatusChange} style={{ backgroundColor: defaultTheme.primary }}>
                        Confirm
                    </Button>
                    <Button
                        color="warning"
                        onClick={handleDndModalStatusChange}
                        style={{ backgroundColor: defaultTheme.goldColorLogo }}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </PageContent>
    );
}
