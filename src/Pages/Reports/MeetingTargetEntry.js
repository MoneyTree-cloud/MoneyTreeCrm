/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import {
    GET_ALL_MAIN_TEAM_DROPDOWN,
    GET_EVENT_MASTER_DROPDOWN,
    MEETING_TARGET_ENTRY_REPORT,
    MEETING_TARGET_UPDATE_REPORT,
} from "../../helpers/url_helper";
import { toast } from "react-toastify";
import PageContent from "../../components/Common/PageContent";
import "../CSS/styles.css";
import ScreenLoader from "../../constants/ScreenLoader";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useUserStore } from "../../store/useUserStore";
import { RequiredStar } from "../../helpers/function_helper";

export default function MeetingTargetEntry() {
    const userId = useUserStore((state) => state.user.userId);
    const navigation = useNavigate();
    const location = useLocation();
    const { rowData } = location.state || {};

    const initialFormState = {
        eventNameSelect: null,
        fromdate: null,
        toDate: null,
        remarks: ''
    };

    const [formState, setFormState] = useState(initialFormState);
    const [rows, setRows] = useState([]); // To manage dynamic rows

    const { data: mainTeams, isLoading } = useGet(GET_ALL_MAIN_TEAM_DROPDOWN);
    const { data: eventMasterList } = useGet(GET_EVENT_MASTER_DROPDOWN);

    // Set rows on data load
    useEffect(() => {
        if (Object.keys(rowData)?.length === 0) {
            if (Array.isArray(mainTeams?.data?.data)) {
                const initializedRows = mainTeams?.data?.data?.map((team) => ({
                    mainTeam: { label: team.label, value: team.value },
                    meetings: "",
                    isSaved: false,
                }));
                setRows(initializedRows);
            }
        } else {
            const initializedRows = rowData.teams.map((team) => ({
                mainTeam: { label: team.mainTeam, value: team.mainTeam },
                meetings: team.target || "",
                isSaved: false,
            }));
            setRows(initializedRows);
        }
    }, [mainTeams, rowData]);

    // Handle select change for prEventoject
    const handleEventSelect = (selectedEvent) => {
        setFormState((prevState) => ({
            ...prevState,
            eventNameSelect: selectedEvent,
        }));
    };

    // Handle select change for rows (mainTeam)
    const handleSelectChange = (field, index) => (selectedOption) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = selectedOption;
        setRows(updatedRows);
    };

    const handleRowChange = (index, field, value) => {
        const updatedRows = [...rows];
        if (/^\d{0,3}$/.test(value)) {
            updatedRows[index][field] = value;
        }
        setRows(updatedRows);
    };

    const { isPending, mutate: addTarget } = usePost(`${MEETING_TARGET_ENTRY_REPORT}${userId}`, {
        onSuccess: (response) => {
            if (response?.data.status === 1) {
                toast.success(response.data.message);
                navigation('/meeting-target-report')
            } else {
                toast.error(response.data.message);
            }
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    const { isPending: updateLoading, mutate: updateTarget } = usePost(`${MEETING_TARGET_UPDATE_REPORT}`, {
        onSuccess: (response) => {
            if (response?.data.status === 1) {
                toast.success(response.data.message);
                navigation('/meeting-target-report')
            } else {
                toast.error(response.data.message);
            }
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    const handleSaveAll = () => {
        if (
            !formState?.eventNameSelect ||
            !formState?.fromdate ||
            !formState?.toDate ||
            !formState?.remarks
        ) {
            toast.error("Please fill all required fields.");
            return;
        }

        const isMainTeamFilled = rows.some(row => row.mainTeam);
        if (!isMainTeamFilled) {
            toast.error("Please fill at least one Main Team.");
            return;
        }
        const teams = rows
            .filter(row => row.mainTeam && row.meetings)
            .map((row) => {
                let id = 0;

                if (rowData?.teams?.length > 0) {
                    const existingTeam = rowData.teams.find(team => team.mainTeam === row.mainTeam?.value);
                    if (existingTeam) {
                        id = existingTeam.id;
                    }
                }

                const teamTarget = {
                    target: row.meetings || 0,
                    mainTeam: row.mainTeam?.value,
                };

                if (id !== 0) {
                    teamTarget.id = id;
                }

                return teamTarget;
            });


        if (teams.length === 0) {
            toast.error("Please fill all required fields for at least one valid Main Team.");
            return;
        }

        const payload = {
            eventId: formState.eventNameSelect?.value,
            eventName: formState.eventNameSelect?.label,
            remarks: formState?.remarks,
            fromDate: formState.fromdate,
            toDate: formState.toDate,
            ...(Object.keys(rowData)?.length === 0
                ? { teams }
                : { teams: teams }),
        };

        if (rowData && Object.keys(rowData).length === 0) {
            addTarget(payload);
        } else {
            updateTarget(payload)
        }
    };

    const calculateTotal = () => {
        return rows.reduce((total, row) => {
            const value = parseInt(row.meetings, 10);
            return total + (isNaN(value) ? 0 : value);
        }, 0);
    };

    // Disable save button if row is saved
    const getMainTeamOptions = (index) => {
        const selectedTeams = rows
            .filter((row, i) => i !== index && row.mainTeam !== null)
            .map((row) => row.mainTeam.value);

        if (selectedTeams.length === 0) {
            return (
                Array.isArray(mainTeams?.data?.data) &&
                mainTeams?.data?.data?.map((team) => ({
                    label: team.label,
                    value: team.value,
                }))
            );
        }

        const availableTeams =
            Array.isArray(mainTeams?.data?.data) &&
            mainTeams?.data?.data
                .filter((team) => !selectedTeams.includes(team.id))
                .map((team) => ({
                    label: team.label,
                    value: team.value,
                }));

        return availableTeams;
    };

    useEffect(() => {
        if (Object.keys(rowData)?.length !== 0 && rows.length > 0) {
            setFormState(prevState => ({
                ...prevState,
                fromdate: rowData.fromDate.split(" ")[0],
                toDate: rowData.toDate.split(" ")[0],
                remarks: rowData?.remarks
            }));

            const updatedRows = rows.map((row) => {
                const initials = row.mainTeam?.value;
                const targetData = rowData?.data?.find((d) => {
                    const labelInitials = d.mainTeam;
                    return labelInitials === initials;
                });


                if (targetData) {
                    return {
                        ...row,
                        turnover: targetData.targetInCr,
                        unit: targetData.targetInUnit,
                    };
                }

                return row;
            });

            setRows(updatedRows);
        }
    }, [rowData, rows.length, mainTeams]);

    useEffect(() => {
        if (rowData?.eventId) {
            const eventNameSelect = eventMasterList?.data?.data?.find(
                (item) => item.value == rowData.eventId
            );
            if (eventNameSelect) {
                setFormState((prevState) => ({ ...prevState, eventNameSelect }));
            }
        }
    }, [eventMasterList?.data?.data, rowData?.eventId, rowData]);


    return (
        <PageContent>
            <Breadcrumbs title="Target" breadcrumbItem="Event Participants Entry" />
            <Container fluid={true}>
                {(isLoading || isPending || updateLoading) && (
                    <ScreenLoader />
                )}
                <form>
                    <Card>
                        <CardBody>
                            <Row>
                                <Col md="2">
                                    <h6 className="font-size-11">From Date <RequiredStar /></h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        id="fromdate"
                                        value={formState.fromdate}
                                        onChange={(e) => setFormState({ ...formState, fromdate: e.target.value })}
                                    />
                                </Col>

                                <Col md="2">
                                    <h6 className="font-size-11">To Date <RequiredStar /></h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        id="toDate"
                                        value={formState.toDate}
                                        onChange={(e) => setFormState({ ...formState, toDate: e.target.value })}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Select Event <RequiredStar /></h6>
                                    <Select
                                        isClearable
                                        value={formState.eventNameSelect}
                                        onChange={handleEventSelect}
                                        options={
                                            Array.isArray(eventMasterList?.data?.data)
                                                ? eventMasterList?.data?.data
                                                : []
                                        }
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">Remarks <RequiredStar /></h6>
                                    <textarea
                                        className="form-control"
                                        type="text"
                                        id="remarks"
                                        rows={3}
                                        placeholder="Enter remarks"
                                        value={formState.remarks}
                                        onChange={(e) => setFormState({ ...formState, remarks: e.target.value })}
                                    />
                                </Col>
                                <Col md="2" className="d-flex align-items-center gap-2">
                                    <Button
                                        color="primary"
                                        onClick={handleSaveAll}
                                    >
                                        Save All
                                    </Button>

                                    <Button
                                        color="secondary"
                                        onClick={() => navigation("/meeting-target-report")}
                                    >
                                        <FiArrowLeft /> Back
                                    </Button>
                                </Col>
                            </Row>

                            <hr className="dashed-divider" />
                            <Row className="mt-3">
                                <Col md="4">
                                    <h6 className="font-size-13">Total</h6>
                                </Col>
                                <Col md="4">
                                    <h6 className="font-size-13">
                                        Total Participants: {calculateTotal()}
                                    </h6>
                                </Col>
                            </Row>

                            {/* Dynamically Render Rows for each Main Team */}
                            {rows.map((row, index) => (
                                <Row key={index}>
                                    <Col md="4">
                                        <h6 className="mt-2 font-size-11">
                                            Main Team {index + 1}{" "}
                                            <RequiredStar />
                                        </h6>
                                        <Select
                                            isClearable
                                            value={row.mainTeam}
                                            onChange={handleSelectChange("mainTeam", index)}
                                            options={getMainTeamOptions(index)}
                                            isDisabled={row.mainTeam !== null}
                                        />
                                    </Col>

                                    <Col md="4 mt-2">
                                        <h6 className="font-size-11">
                                            Participants <RequiredStar />
                                        </h6>
                                        <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Enter No Of Participants..."
                                            value={row.meetings}
                                            onChange={(e) => handleRowChange(index, "meetings", e.target.value)}
                                        />
                                    </Col>

                                </Row>
                            ))}
                        </CardBody>
                    </Card>
                </form>
            </Container>
        </PageContent>
    );
}
