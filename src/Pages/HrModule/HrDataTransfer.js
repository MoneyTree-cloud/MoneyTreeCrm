/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Button, Card, CardBody, Col, Container, Input, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useGet, usePost } from "../../Hooks/useApi";
import { ALL_DEPARTMENT_DROPDOWN, ALL_HR_DROPDOWN, CANDIDATE_HISTORY_FOR_TRANSFER, HR_LOCATION_DROPDOWN, HR_TRANSFER_DATA } from "../../helpers/url_helper";
import { toast } from "react-toastify";
import { RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import "../CSS/styles.css";
import ApiClient from "../../helpers/api_helper";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import { sourceOptions } from "../../constants/global";

export default function HrDataTransfer() {
    const { userId } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [rowData, setRowData] = useState([]);
    const [pending, setPending] = useState(false);
    const [page, setPage] = useState(1);
    const [totalElements, setTotalElements] = useState(0)
    const LIMIT = 100;

    const INITIALSTATE = {
        fromHrSelect: null,
        toHrSelect: null
    };
    const [formState, setFormState] = useState(INITIALSTATE);

    const { data: hrList, isLoading } = useGet(ALL_HR_DROPDOWN + '?status=NO&hrUserId=YES', { enabled: !!accessGranted });
    const { data: branchList } = useGet(HR_LOCATION_DROPDOWN, { enabled: !!accessGranted });
    const { data: departmentList } = useGet(ALL_DEPARTMENT_DROPDOWN, { enabled: !!accessGranted });

    const locationOptions = branchList?.data?.data?.map((loc) => ({
        value: loc.key,
        label: loc.value,
    })) || [];

    const getHrData = (page) => {
        setPending(true)
        const queryParams = [];
        if (filters.name) queryParams.push(`name=${encodeURIComponent(filters.name)}`);
        if (filters.candidateId) queryParams.push(`candidateId=${encodeURIComponent(filters.candidateId)}`);
        if (filters.email) queryParams.push(`email=${encodeURIComponent(filters.email)}`);
        if (filters.phone) queryParams.push(`phone=${encodeURIComponent(filters.phone)}`);
        if (filters.interviewDate) queryParams.push(`interviewDate=${encodeURIComponent(filters.interviewDate)}`);
        if (filters.teamName) queryParams.push(`teamName=${encodeURIComponent(filters.teamName)}`);
        if (filters.trialStatus) queryParams.push(`trialStatus=${encodeURIComponent(filters.trialStatus.value)}`);
        if (filters?.location?.value) {
            const locationId = filters.location.value;
            if (locationId) {
                queryParams.push(`interviewLocation=${encodeURIComponent(locationId)}`);
            }
        }
        if (filters.fromDate) queryParams.push(`fromDate=${encodeURIComponent(filters.fromDate)}`);
        if (filters.toDate) queryParams.push(`toDate=${encodeURIComponent(filters.toDate)}`);
        if (filters.department) queryParams.push(`department=${encodeURIComponent(filters.department.value)}`);
        if (filters?.status?.label === 'No Status') {
            queryParams.push('transferred=YES');
        } else if (filters?.status?.label === 'Offer Declined') {
            queryParams.push('finalStatusEnum=OfferDeclined');
        } else if (filters?.status?.value) {
            queryParams.push(`status=${encodeURIComponent(filters.status.value)}`);
        }

        if (filters?.source?.value) {
            queryParams.push(`source=${encodeURIComponent(filters.source.value)}`);
        }
        const queryString = queryParams.length > 0 ? `&${queryParams.join('&')}` : '';
        ApiClient.get(`${CANDIDATE_HISTORY_FOR_TRANSFER}hrId=${formState?.fromHrSelect?.value}&offset=${page - 1}&limit=${LIMIT}${queryString}`)
            .then(function (response) {
                setPending(false);
                if (response?.data?.status === 1) {
                    const encryptedContent = response.data.data;
                    decryptData(encryptedContent).then((decrypted) => {
                        setRowData(decrypted?.content);
                        setTotalElements(decrypted?.totalElements)
                    }).catch((error) => {
                        setRowData([]);
                    });
                }
                else {
                    toast.error(response.data.message)
                    setRowData([]);
                }
            })
            .catch(function (error) {
                setRowData([]);
                setPending(false);
                toast.error(error.message);
            });
    };

    const { isPending: transferLoading, mutate: transferData } = usePost(
        `${HR_TRANSFER_DATA}`,
        {
            onSuccess: (response) => {
                if (response?.data.status === 1) {
                    toast.success(response.data.message);
                    // setSelectAllChecked(false)
                    // setRowData([])
                    // setFormState(INITIALSTATE)
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
        const allChecked = rowData?.every((row) => row.isChecked);
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
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "8%",
        },
        {
            name: <span className="font-weight-bold fs-13">Candidate ID</span>,
            sortable: true,
            width: "15%",
            selector: (row) => row.id,
            cell: (row) => <WordWrapCell>{row.id}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Candidate Name</span>,
            sortable: true,
            selector: (row) => row.firstName,
            cell: (row) => <WordWrapCell>{row.firstName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Source</span>,
            sortable: true,
            selector: (row) => row.sources?.[0]?.sourceName,
            cell: (row) => <WordWrapCell>{row.sources?.[0]?.sourceName}</WordWrapCell>,
        },
    ];

    const handleSelectChange = (name, selectedOption) => {
        setFormState((prevState) => ({
            ...prevState,
            [name]: selectedOption,
        }));
    };

    const handleShowData = (e) => {
        e.preventDefault();
        if (!formState.fromHrSelect) {
            toast.error("Please Select An HR To Transfer From");
            return;
        }
        if (!filters?.candidateId && !filters?.status) {
            toast.error("Please Select Status To Transfer");
            return;
        }
        else {
            getHrData(page);
        }
    };

    const handleTransferData = () => {
        const selectedHR = rowData.filter((row) => row.isChecked);
        if (!formState.fromHrSelect) {
            toast.error("Please Select An HR To Transfer From.");
        } else if (!formState.toHrSelect) {
            toast.error("Please Select An HR To Transfer To.");
        } else if (selectedHR.length === 0) {
            toast.error("Please Select At Least One Record To Transfer.");
        }
        else {
            const candidateIds = selectedHR.map(row => row.id);
            const transferPayload = {
                transferById: userId,
                transferToId: formState?.toHrSelect?.value,
                candidateIds: candidateIds
            };
            transferData(transferPayload);
        }
    };

    // Filter state
    const [filters, setFilters] = useState({
        name: '',
        email: '',
        phone: '',
        interviewDate: '',
        teamName: '',
        location: null,
        status: null,
        trialStatus: null,
        startDate: '',
        endDate: '',
        department: null,
        source: null,
        candidateId: ''
    });

    const handleFilterInputChange = (field, value) => {
        if (field === 'phone') {
            // Remove non-digit characters only, no length limit
            const onlyNums = value.replace(/\D/g, '');
            setFilters(prev => ({ ...prev, [field]: onlyNums }));
        } else {
            setFilters(prev => ({ ...prev, [field]: value }));
        }
    }

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'hr-data-transfer');
            setAccessGranted(hasAccess);
        }
        checkAccess();
    }, [userId]);

    // trial options
    const trialStatusOptions = [
        { value: 'Started', label: 'Started' },
        { value: 'On_Boarded', label: 'On Boarded' },
        { value: 'Terminated', label: 'Terminated' },
        { value: 'Absconded', label: 'Absconded' },
        // { value: 'Join & Left', label: 'Join & Left' }
    ];

    const statusOptions = [
        { value: 'INTERESTED', label: 'Interested' },
        { value: 'NOT_INTERESTED', label: 'Not Interested' },
        { value: 'CALLBACK', label: 'Call Back' },
        { value: 'CALL_NOT_PICKED', label: 'Call Not Picked' },
        { value: 'DETAILS_SUBMITTED', label: 'Details Submitted' },
        { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
        { value: 'INTERVIEW_RESCHEDULED', label: 'Interview Rescheduled' },
        // { value: 'HIRED', label: 'Hired' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'OfferDeclined', label: 'Offer Declined' },
        { value: null, label: 'No Status' },
    ]

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Transfer" breadcrumbItem="HR Data" />
            {(pending || transferLoading || isLoading) && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <form onSubmit={handleShowData}>
                            <Row className="g-2">
                                <Col sm="12" md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">Select HR <RequiredStar /></h6>
                                    <Select
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        isClearable
                                        value={formState.fromHrSelect}
                                        onChange={(selectedOption) => handleSelectChange("fromHrSelect", selectedOption)}
                                        options={
                                            Array.isArray(hrList?.data?.data)
                                                ? hrList?.data?.data
                                                : []
                                        }
                                    />
                                </Col>
                                {/* Name Filter */}
                                <Col sm="12" md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">Name</h6>
                                    <Input
                                        type="text"
                                        id="name"
                                        value={filters.name}
                                        onChange={(e) => handleFilterInputChange('name', e.target.value)}
                                        placeholder="Search by Name"
                                    />
                                </Col>
                                {/* Candidate ID Filter */}
                                <Col sm="12" md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">Candidate Id</h6>
                                    <Input
                                        type="text"
                                        id="candidateId"
                                        value={filters.candidateId}
                                        onChange={(e) => handleFilterInputChange('candidateId', e.target.value)}
                                        placeholder="Search by Candidate Id"
                                    />
                                </Col>
                                {/* Email Filter */}
                                <Col sm="12" md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">Email</h6>
                                    <Input
                                        type="email"
                                        id="email"
                                        value={filters.email}
                                        onChange={(e) => handleFilterInputChange('email', e.target.value)}
                                        placeholder="Search by Email"
                                    />
                                </Col>
                                {/* Phone Filter */}
                                <Col sm="12" md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">Phone</h6>
                                    <Input
                                        type="text"
                                        maxLength={10}
                                        id="phone"
                                        value={filters.phone}
                                        onChange={(e) => handleFilterInputChange('phone', e.target.value)}
                                        placeholder="Search by Phone"
                                    />
                                </Col>
                                {/* Interview Date Filter */}
                                <Col sm="12" md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">Interview Date</h6>
                                    <Input
                                        type="date"
                                        id="interviewDate"
                                        value={filters.interviewDate}
                                        onChange={(e) => handleFilterInputChange('interviewDate', e.target.value)}
                                    />
                                </Col>
                                {/* Department Filter */}
                                <Col sm="12" md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">Department</h6>
                                    <Select
                                        options={departmentList?.data?.data || []}
                                        value={filters.department}
                                        isClearable
                                        onChange={(val) => setFilters(prev => ({ ...prev, department: val }))}
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                {/* Start Date Filter */}
                                <Col sm="12" md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">Start Date</h6>
                                    <Input
                                        type="date"
                                        id="fromDate"
                                        value={filters.fromDate}
                                        onChange={(e) => handleFilterInputChange('fromDate', e.target.value)}
                                    />
                                </Col>
                                {/* End Date Filter */}
                                <Col sm="12" md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">End Date</h6>
                                    <Input
                                        type="date"
                                        id="toDate"
                                        value={filters.toDate}
                                        onChange={(e) => handleFilterInputChange('toDate', e.target.value)}
                                    />
                                </Col>
                                {/* Team Name Filter */}
                                <Col sm="12" md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">Team Name</h6>
                                    <Input
                                        type="text"
                                        id="teamName"
                                        placeholder="Team Name..."
                                        value={filters.teamName}
                                        onChange={(e) => handleFilterInputChange('teamName', e.target.value)}
                                    />
                                </Col>
                                {/* Location Filter */}
                                <Col sm="12" md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">Location</h6>
                                    <Select
                                        options={locationOptions}
                                        value={filters.location}
                                        isClearable
                                        onChange={(val) => setFilters(prev => ({ ...prev, location: val }))}
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                {/* Status Filter */}
                                <Col sm="12" md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">Status <RequiredStar /></h6>
                                    <Select
                                        options={statusOptions}
                                        value={filters.status}
                                        isClearable
                                        onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                {/* Trail Status Filter */}
                                <Col sm="12" md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">Trial Status</h6>
                                    <Select
                                        id="trialStatus"
                                        options={trialStatusOptions}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        value={filters?.trialStatus}
                                        onChange={(val) => setFilters(prev => ({ ...prev, trialStatus: val }))}
                                    />
                                </Col>
                                {/* Source Filter */}
                                <Col sm="12" md="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">Source</h6>
                                    <Select
                                        options={sourceOptions || []}
                                        value={filters.source}
                                        isClearable
                                        onChange={(val) => setFilters(prev => ({ ...prev, source: val }))}
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                    />
                                </Col>
                                <Col lg="1" className="d-flex align-items-end justify-content-center">
                                    <Button
                                        color="primary"
                                        onClick={handleShowData}
                                        type="submit"
                                    >
                                        Show
                                    </Button>
                                </Col>
                                <Col sm="12" lg="2">
                                    <h6 className="font-size-11 fw-semibold text-muted">To HR <RequiredStar /></h6>
                                    <Select
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        isClearable
                                        value={formState.toHrSelect}
                                        onChange={(selectedOption) => handleSelectChange("toHrSelect", selectedOption)}
                                        options={
                                            Array.isArray(hrList?.data?.data)
                                                ? hrList?.data?.data
                                                : []
                                        }
                                    />
                                </Col>
                                <Col
                                    lg="2"
                                    className="d-flex align-items-end justify-content-start"
                                >
                                    <Button
                                        color="secondary"
                                        onClick={handleTransferData}
                                    >
                                        Transfer
                                    </Button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                {rowData?.length > 0 && (
                    <AppTable
                        progressPending={pending}
                        columns={columns}
                        data={rowData}
                        pagination
                        paginationServer
                        paginationTotalRows={totalElements}
                        onChangePage={(newPage) => {
                            setPage(newPage);
                            getHrData(newPage)
                        }}
                    />
                )}
            </Container>
        </PageContent>
    );
}