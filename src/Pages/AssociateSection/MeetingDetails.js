/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Input, Label, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { GET_ALL_SUB_TEAM_DROPDOWN, GET_MEETING_DETAILS_DATA, GET_MY_TEAM } from "../../helpers/url_helper";
import { formatDateForInput, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import Select from "react-select";
import { useGet } from "../../Hooks/useApi";

export default function MeetingDetails() {
    const { userId, mainTeam, mainTl } = useUserStore((state) => state.user);
    const [date, setDate] = useState("");
    const [meetData, setMeetData] = useState([]);
    const [isPending, setIsPending] = useState(false)
    const [allDataStatus, setAllDataStatus] = useState("YES");
    const [associate, setAssociate] = useState(null)
    const [subTeam, setSubTeam] = useState(null)
    const { data: associateList } = useGet(GET_MY_TEAM + userId);
    const { data: subTeams } = useGet(`${GET_ALL_SUB_TEAM_DROPDOWN}${mainTeam}`, { enabled: Boolean(mainTeam && mainTl === "YES") });

    // Calculate the first and last dates of the current month
    useEffect(() => {
        getMeetingDetailsInit()
    }, []);

    const getMeetingDetailsInit = () => {
        const now = new Date();
        setDate(formatDateForInput(now));
        // Prepare API parameters
        let apiUrl = `${GET_MEETING_DETAILS_DATA}${formatDateForInput(now)}&assoId=${userId}&showTeam=${allDataStatus === 'NO' ? false : true}`;
        getMeetingDetails(apiUrl);
    }

    const handleClear = () => {
        getMeetingDetailsInit()
        setAssociate(null)
        setAllDataStatus('YES')
        setSubTeam(null)
    }

    const getMeetingDetails = (apiUrl) => {
        setIsPending(true)
        ApiClient.get(apiUrl).then(function (response) {
            setIsPending(false);
            if (response.data.status === 1) {
                const resData = response.data.data;
                setMeetData(resData);
            }
            else {
                setMeetData([])
                toast.error(response.data.message)
            }
        })
            .catch(function (error) {
                setIsPending(false);
                setMeetData([])
                toast.error(error.message);
            });
    }

    const handleShowData = (e) => {
        e.preventDefault()
        let apiUrl = `${GET_MEETING_DETAILS_DATA}${date}&assoId=${associate ? associate?.value : userId}&showTeam=${allDataStatus === 'NO' ? false : true}`;
        if (subTeam?.value) {
            apiUrl += '&subTeam=' + subTeam?.value
        }
        getMeetingDetails(apiUrl);
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "8%",
            cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Name</span>,
            selector: (row) => row.associateName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.associateName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Id</span>,
            selector: (row) => row.associateId,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.associateId}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row.clientName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.clientName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Meeting Status</span>,
            selector: (row) => row.meetingStatus,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.meetingStatus}</WordWrapCell>
        }
    ];

    const handleToggle = (e) => {
        setAllDataStatus((prevState) => prevState === "YES" ? "NO" : "YES");
    }

    return (
        <PageContent>
            {isPending && <ScreenLoader />}
            <Breadcrumbs title="Associate" breadcrumbItem="Meeting Details" />
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowData}>
                            <Row className="g-3">
                                <Col lg="2">
                                    <h6 className="font-size-11">Date</h6>
                                    <input
                                        className="form-control"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </Col>
                                <Col lg="3">
                                    <h6 className="font-size-11">Select Associate</h6>
                                    <Select
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        value={associate}
                                        onChange={setAssociate}
                                        options={
                                            Array.isArray(associateList?.data?.data)
                                                ? associateList?.data?.data
                                                : []
                                        }
                                    />
                                </Col>
                                {mainTl === "YES" &&
                                    <Col lg="3">
                                        <h6 className="font-size-11">Select Sub Team</h6>
                                        <Select
                                            isClearable
                                            style={{ zIndex: 9999 }}
                                            menuPortalTarget={document.body}
                                            value={subTeam}
                                            onChange={setSubTeam}
                                            options={
                                                Array.isArray(subTeams?.data?.data)
                                                    ? subTeams?.data?.data
                                                    : []
                                            }
                                        />
                                    </Col>
                                }
                                <Col lg="2 d-flex align-items-end justify-content-center" >
                                    <Label>
                                        <Input
                                            type="checkbox"
                                            name="messageStatus"
                                            value="YES"
                                            style={{ cursor: "pointer" }}
                                            checked={allDataStatus === "YES"}
                                            onChange={handleToggle}
                                        />
                                        <span style={{ marginLeft: 5, cursor: 'pointer' }}>All Data</span>
                                    </Label>
                                </Col>
                                <Col lg="2" className="d-flex align-items-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={handleShowData}
                                    >
                                        Show
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary ms-2"
                                        onClick={handleClear}
                                    >
                                        Clear
                                    </button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>
                {meetData?.length > 0 &&
                    <AppTable
                        progressPending={isPending}
                        columns={columns}
                        data={meetData}
                        pagination
                    />
                }
            </Container>
        </PageContent>
    );
}
