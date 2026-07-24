/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Input, Label, Modal, ModalBody, ModalHeader, Row, Table } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { defaultTheme } from "../../helpers/defaultTheme";
import { ALL_CANDIDATE_HISTORY } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import ApiClient, { hrImageBaseUrl } from "../../helpers/api_helper";
import { FaCheck, FaEye, FaFilePdf, FaTimes } from "react-icons/fa";
import PageContent from "../../components/Common/PageContent";
import { formatDate, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import Select from 'react-select';
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function FinanceHrDocs() {
    const LIMIT = 100;
    const [page, setPage] = useState(1);
    const [isPending, setIsPending] = useState(false)
    const [data, setData] = useState([]);
    const [accessGranted, setAccessGranted] = useState(null);
    const { userId } = useUserStore((state) => state.user);
    const [docModalOpen, setDocModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const toggleDocModal = () => setDocModalOpen(!docModalOpen);

    useEffect(() => {
        if (accessGranted) {
            handleGetData()
        }
    }, [page, accessGranted])

    // Filter state
    const [filters, setFilters] = useState({
        name: '',
        teamName: '',
        trialStatus: null,
        empCode: '',
        doj: ''
    });

    const handleFilterInputChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    }

    // Trial Status Options
    const trialStatusOptions = [
        { value: 'Started', label: 'Started' },
        { value: 'On_Boarded', label: 'On Boarded' },
        { value: 'Terminated', label: 'Terminated' },
        { value: 'Absconded', label: 'Absconded' },
    ];

    const handleGetData = (e, key) => {
        if (e) e.preventDefault();
        setIsPending(true)
        const queryParams = [];
        if (key !== 'restart') {
            if (filters.name) queryParams.push(`name=${encodeURIComponent(filters.name)}`);
            if (filters.teamName) queryParams.push(`teamName=${encodeURIComponent(filters.teamName)}`);
            if (filters.trialStatus) queryParams.push(`trialStatus=${encodeURIComponent(filters.trialStatus)}`);
            if (filters.empCode) queryParams.push(`empCode=${encodeURIComponent(filters.empCode)}`);
            if (filters.doj) queryParams.push(`doj=${encodeURIComponent(filters.doj)}`);
        }

        // Combine all query parameters
        const queryString = queryParams.length > 0 ? `&${queryParams.join('&')}` : '';
        ApiClient.get(`${ALL_CANDIDATE_HISTORY}offset=${key === 'page' ? 0 : page - 1}&limit=${LIMIT}&status=HIRED${queryString}`)
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    const encryptedContent = response.data.data;
                    decryptData(encryptedContent).then((decrypted) => {
                        setData(decrypted);
                    }).catch((error) => {
                        setData([]);
                    });
                } else if (response?.data?.message !== 'No record found.') {
                    toast.error(response.data.message);
                    setData([]);
                }
                else {
                    setData([]);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
                setData([]);
            });
    }

    const handleClearFilters = () => {
        const hasFilters = filters.name || filters.teamName || filters.trialStatus || filters.empCode || filters.doj;

        if (hasFilters) {
            setFilters({ name: '', teamName: '', trialStatus: null, empCode: '', doj: '' });
            handleGetData(null, 'restart');
            setPage(1);
        }
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "5%",
            cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Docs Uploaded</span>,
            selector: (row) => row.status,
            cell: (row) => <WordWrapCell>{row.documentUploaded ?
                <FaCheck color="green" size={10} title="YES" />
                : <FaTimes color="red" size={10} title="NO"
                />
            }</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">View Docs</span>,
            cell: (row) => (
                row.documentUploaded ?
                    <FaEye
                        size={16}
                        color={defaultTheme.primary}
                        style={{ cursor: "pointer" }}
                        title="View Documents"
                        onClick={() => {
                            setSelectedRow(row);
                            setDocModalOpen(true);
                        }}
                    />
                    :
                    '-'
            ),
            width: "8%",
        },
        {
            name: <span className="font-weight-bold fs-13">Candidate Name</span>,
            sortable: true,
            selector: (row) => row.firstName,
            cell: (row) => <WordWrapCell>{row.firstName || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Emp Code</span>,
            sortable: true,
            selector: (row) => row.empCode,
            cell: (row) =>
                <div className="phone-container">
                    <WordWrapCell>{row.empCode || '-'}
                        <span className="phone-number">{row.salaryAmount}</span>
                    </WordWrapCell>
                </div>
        },
        {
            name: <span className="font-weight-bold fs-13">Father's Name</span>,
            sortable: true,
            selector: (row) => row.candidateDetails?.fatherName,
            cell: (row) => <WordWrapCell>{row.candidateDetails?.fatherName || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Team</span>,
            sortable: true,
            selector: (row) => row.status,
            cell: (row) => {
                const lastHandover = row.handovers?.[row.handovers.length - 1];
                return (
                    <WordWrapCell>
                        {lastHandover?.mainTeam && lastHandover?.subTeam
                            ? `${lastHandover.mainTeam}/${lastHandover.subTeam}`
                            : "-"}
                    </WordWrapCell>
                );
            },
        },
        {
            name: <span className="font-weight-bold fs-13">RM</span>,
            sortable: true,
            selector: (row) => row.firstName,
            cell: (row) => <WordWrapCell>{row?.handovers?.length ? row?.handovers[row?.handovers?.length - 1]?.reportingManagerName : '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">DOJ</span>,
            sortable: true,
            selector: (row) => row?.handovers[row?.handovers?.length - 1]?.doj,
            cell: (row) => <WordWrapCell>{formatDate(row?.handovers[row?.handovers?.length - 1]?.doj) || '-'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Pay Type</span>,
            sortable: true,
            selector: (row) => row?.payrollType,
            cell: (row) => <WordWrapCell>{row?.payrollType || '-'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Designation</span>,
            sortable: true,
            selector: (row) => row?.designation,
            cell: (row) => <WordWrapCell>{row?.designation || '-'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Location</span>,
            sortable: true,
            selector: (row) => row.finalLocation,
            cell: (row) => <WordWrapCell>{row.finalLocation || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Department</span>,
            sortable: true,
            selector: (row) => row?.department,
            cell: (row) => <WordWrapCell>{row?.department || '-'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Gender</span>,
            sortable: true,
            selector: (row) => row.candidateDetails?.gender,
            cell: (row) => <WordWrapCell>{row.candidateDetails?.gender || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Religion</span>,
            sortable: true,
            selector: (row) => row.candidateDetails?.religion,
            cell: (row) => <WordWrapCell>{row.candidateDetails?.religion || '-'}</WordWrapCell>
        },
    ];

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'finance-hr-docs');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Hr Module" breadcrumbItem="Finance Docs" />
            {(isPending) && <ScreenLoader />}
            <Container fluid={true}>

                <Card>
                    <CardBody>
                        <form onSubmit={handleGetData}>
                            <Row className="g-2">
                                {/* Name Filter */}
                                <Col sm="12" md="2">
                                    <Label for="name" className="font-size-11 fw-semibold text-muted">Name</Label>
                                    <Input
                                        type="text"
                                        id="name"
                                        value={filters.name}
                                        onChange={(e) => handleFilterInputChange('name', e.target.value)}
                                        placeholder="Search by Name"
                                    />
                                </Col>
                                {/* Team Name Filter */}
                                <Col sm="12" md="2">
                                    <Label for="teamName" className="font-size-11 fw-semibold text-muted">Team Name</Label>
                                    <Input
                                        type="text"
                                        id="teamName"
                                        placeholder="Team Name..."
                                        value={filters.teamName}
                                        onChange={(e) => handleFilterInputChange('teamName', e.target.value)}
                                    />
                                </Col>
                                {/* Emp Code Filter */}
                                <Col sm="12" md="2">
                                    <Label for="empCode" className="font-size-11 fw-semibold text-muted">Emp Code</Label>
                                    <Input
                                        type="text"
                                        id="empCode"
                                        placeholder="Emp Code..."
                                        value={filters.empCode}
                                        onChange={(e) => handleFilterInputChange('empCode', e.target.value)}
                                    />
                                </Col>
                                {/* DOJ Filter */}
                                <Col sm="12" md="2">
                                    <Label for="doj" className="font-size-11 fw-semibold text-muted">DOJ</Label>
                                    <Input
                                        type="date"
                                        id="doj"
                                        value={filters.doj}
                                        onChange={(e) => handleFilterInputChange('doj', e.target.value)}
                                    />
                                </Col>
                                {/* Trail Status Filter */}
                                <Col sm="12" md="2">
                                    <Label for="trialStatus" className="font-size-11 fw-semibold text-muted">Trial Status</Label>
                                    <Select
                                        id="trialStatus"
                                        options={trialStatusOptions}
                                        isClearable
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        value={trialStatusOptions.find(option => option.value === filters.trialStatus) || null}
                                        onChange={(selectedOption) => handleFilterInputChange('trialStatus', selectedOption ? selectedOption.value : '')}
                                    />
                                </Col>
                                {/* Search and Clear Buttons */}
                                <Col sm="12" md="2" className="d-flex align-items-end">
                                    <Button
                                        color="primary"
                                        onClick={(e) => handleGetData(e, 'page')}
                                        type="submit"
                                    >
                                        Search
                                    </Button>
                                    <Button
                                        color="secondary"
                                        onClick={handleClearFilters}
                                        className="ms-2"
                                    >
                                        Clear
                                    </Button>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>

                <AppTable
                    progressPending={isPending}
                    columns={columns}
                    data={data?.content}
                    pagination
                    paginationServer
                    paginationTotalRows={data?.totalElements}
                    onChangePage={setPage}
                    conditionalRowStyles={[
                        {
                            when: (row) =>
                                ['Absconded', 'Terminated'].includes(
                                    row?.candidateTrial?.trialStatus
                                ),
                            style: {
                                color: defaultTheme.redColor,
                                fontWeight: 'bold',
                            },
                        },
                    ]}
                />

                <Modal
                    isOpen={docModalOpen}
                    toggle={toggleDocModal}
                    size="lg"
                    centered
                >
                    <ModalHeader toggle={toggleDocModal}>Documents - {selectedRow?.firstName}</ModalHeader>

                    <ModalBody>
                        {selectedRow?.documents?.length > 0 ? (
                            <Table bordered responsive>
                                <thead>
                                    <tr>
                                        <th>Document Type</th>
                                        <th>Uploaded At</th>
                                        <th>File</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedRow?.documents
                                        .filter(doc =>
                                            [
                                                'PAN',
                                                'DRIVING_LICENCE',
                                                'ADDRESS_PROOF',
                                                'ADDRESS_PROOF_BACK',
                                                'MT_BANK_PROOF'
                                            ].includes(doc?.documentType)
                                        )
                                        .map((document, index) => (
                                            <tr key={document.id || index}>
                                                <td>
                                                    {document.documentType === 'PAN' && 'PAN / Applied For'}
                                                    {document.documentType === 'DRIVING_LICENCE' && 'DL / Learning'}
                                                    {document.documentType === 'ADDRESS_PROOF' && 'Aadhar Front'}
                                                    {document.documentType === 'ADDRESS_PROOF_BACK' && 'Aadhar Back'}
                                                    {document.documentType === 'MT_BANK_PROOF' && 'MoneyTree Bank Proof'}
                                                </td>

                                                <td>{formatDateTime(document?.uploadedAt) || '-'}</td>

                                                <td>
                                                    {document?.filePath ? (
                                                        <a
                                                            href={`${hrImageBaseUrl}${document?.filePath}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <FaFilePdf
                                                                size={18}
                                                                color={defaultTheme.redColor}
                                                            />
                                                        </a>
                                                    ) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted">No documents available</p>
                        )}
                    </ModalBody>
                </Modal>

            </Container>
        </PageContent>
    );
}