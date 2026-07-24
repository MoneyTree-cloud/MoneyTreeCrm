/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
    Container,
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,
    Input,
    Label,
} from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import { toast } from 'react-toastify';
import ScreenLoader from '../../constants/ScreenLoader';
import { facebookApiClient } from '../../helpers/api_helper';
import { CREATE_SUSPECT, GET_ASSIGNED_GOOGLE_ADS, UPDATE_ASSIGNED_ADS } from '../../helpers/url_helper';
import { formatDateTime, WordWrapCell } from '../../helpers/function_helper';
import { MdEmail, MdMobileFriendly, MdOutlineFindInPage } from 'react-icons/md';
import { defaultTheme } from '../../helpers/defaultTheme';
import { FaCheck, FaEye, FaRegComment } from 'react-icons/fa';
import { useUserStore } from '../../store/useUserStore';
import Select from 'react-select';
import { usePost } from '../../Hooks/useApi';
import { decryptData } from '../../components/Common/CryptoUtils';

export default function GoogleAssignedLeads() {
    const empCode = useUserStore((state) => state.user.empCode);
    const userId = useUserStore((state) => state.user.userId);
    const empName = useUserStore((state) => state.user.userName);
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [status, setStatus] = useState(null);

    const statusOptions = [
        { value: 'Accept', label: 'Move To Suspect' },
        { value: 'Hold', label: 'Hold' },
        { value: 'Reject', label: 'Reject' }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await facebookApiClient.get(GET_ASSIGNED_GOOGLE_ADS + empCode);
            setIsLoading(false);
            if (response?.data?.statusCode === 1) {
                const encryptedContent = response.data.data;
                decryptData(encryptedContent).then((decrypted) => {
                    setLeads(decrypted);
                }).catch((error) => {
                    setLeads([]);
                });

            } else if (response.data.message !== 'No record found.') {
                toast.error(response.data.message || "Failed to fetch leads");
            }
        } catch (error) {
            setIsLoading(false);
            toast.error(error.message);
        }
    };

    const openModal = (lead) => {
        setSelectedLead(lead);
        setRemarks('');
        setStatus(null);
        setModalOpen(true);
    };

    const handleSave = () => {
        if (!status) {
            toast.error('Status is required.');
            return;
        }
        if (!remarks.trim()) {
            toast.error('Remarks are required.');
            return;
        }
        setIsLoading(true);
        const endPoint = `${selectedLead?.id}&remarks=${remarks}&empCode=${empCode}&empName=${empName}&leadStatus=${status.value}`;
        facebookApiClient.post(UPDATE_ASSIGNED_ADS + endPoint)
            .then((response) => {
                setIsLoading(false);
                if (response?.data?.statusCode === 1) {
                    fetchData();
                    setModalOpen(false);

                    const request = {
                        leadName: selectedLead.name,
                        leadMobile: selectedLead.number,
                        remark: "N/A",
                        project: "N/A",
                        projectCategory: "N/A",
                    };
                    createSuspect(request);
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch((error) => {
                setIsLoading(false);
                toast.error(error.message);
            });
    };

    // API hooks
    const { isPending: isPendingAddSuspect, mutate: createSuspect } = usePost(
        `${CREATE_SUSPECT}${userId}`,
        {
            onSuccess: (response) => {
                if (response?.data?.status === 1) {
                    toast.success('Suspect created successfully');
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => toast.error(err.message),
        }
    );

    const columns = [
        {
            name: 'SL No.',
            selector: (row, index) => index + 1,
            width: '7%'
        },
        {
            name: 'Lead Time',
            width: '15%',
            selector: (row) => row.createdDate,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
            sortable: true,
        },
        {
            name: 'Assigned Time',
            width: '16%',
            selector: (row) => row.assignDate,
            cell: (row) => <WordWrapCell>{formatDateTime(row.assignDate)}</WordWrapCell>,
            sortable: true,
        },
        {
            name: 'Response Time',
            width: '16%',
            selector: (row) => row.remarkTime,
            cell: (row) => <WordWrapCell>{formatDateTime(row.remarkTime)}</WordWrapCell>,
            sortable: true,
        },
        {
            name: 'Name',
            width: '15%',
            selector: (row) => row.name,
            cell: (row) => <WordWrapCell>{row.name}</WordWrapCell>,
            sortable: true,
        },
        {
            name: 'Mobile No.',
            selector: (row) => row.number,
            cell: (row) => (
                <div className="phone-container">
                    <MdMobileFriendly
                        className="phone-icon"
                        color={defaultTheme.goldColorLogo}
                    />
                    <span className="phone-number">{row.number}</span>
                </div>
            ),
        },
        {
            name: 'Email',
            selector: (row) => row.email,
            cell: (row) => (
                <div className="phone-container">
                    <MdEmail
                        className="phone-icon"
                        color={defaultTheme.goldColorLogo}
                    />
                    <span className="phone-number">{row.email}</span>
                </div>
            ),
        },
        {
            name: 'Project Name',
            width: '15%',
            selector: (row) => row.project_name,
            cell: (row) => <WordWrapCell>{row.project_name}</WordWrapCell>,
            sortable: true,
        },
        {
            name: <span className="font-weight-bold fs-13">Remarks</span>,
            sortable: true,
            selector: (row) => row.remarks,
            cell: (row) =>
                row.remarks ? (
                    <div className="phone-container">
                        <FaRegComment
                            className="phone-icon"
                            color={defaultTheme.goldColorLogo}
                        />
                        <span className="phone-number">{row.remarks}</span>
                    </div>
                ) : null,
        },
        {
            name: 'More Details',
            width: '10%',
            cell: (row) => (
                row.leadStatus !== 'Accept' ?
                    <FaEye
                        onClick={() => openModal(row)}
                        size={20}
                        color={defaultTheme.primary}
                        cursor={'pointer'}
                    />
                    :
                    <div className="phone-container">
                        <FaCheck
                            size={20}
                            color={defaultTheme.primary}
                            cursor={'pointer'}
                            className="phone-icon"
                        />
                        <span className="phone-number">{row.leadStatus === 'Accept' ? 'Moved To Suspect' : row.leadStatus}</span>
                    </div>

            ),
        },
        {
            name: 'Status',
            width: '10%',
            selector: (row) => row.leadStatus,
            cell: (row) => <WordWrapCell>{row.leadStatus === 'Accept' ? 'Move To Suspect' : row.leadStatus}</WordWrapCell>,
        },
    ];

    const total = leads.length;
    const pendingCount = leads.filter(item => item.leadStatus === 'Pending').length;
    const acceptCount = leads.filter(item => item.leadStatus === 'Accept').length;
    const holdCount = leads.filter(item => item.leadStatus === 'Hold').length;
    const rejectCount = leads.filter(item => item.leadStatus === 'Reject').length;

    return (
        <PageContent>
            <Breadcrumbs title="Google" breadcrumbItem="Lead Details" />
            {(isLoading || isPendingAddSuspect) && <ScreenLoader />}
            <div style={{ display: 'flex', gap: '2rem', padding: '1rem' }}>
                <div><strong>Total:</strong> {total}</div>
                <div><strong>Pending:</strong> {pendingCount}</div>
                <div><strong>Moved To Suspect:</strong> {acceptCount}</div>
                <div><strong>Hold:</strong> {holdCount}</div>
                <div><strong>Reject:</strong> {rejectCount}</div>
            </div>
            <Container fluid>
                {leads && leads.length > 0 ? (
                    <AppTable
                        progressPending={isLoading}
                        columns={columns}
                        data={leads}
                        pagination
                    />
                ) : (
                    !isLoading && (
                        <div style={{ textAlign: 'center', padding: '50px 0', color: '#6c757d' }}>
                            <MdOutlineFindInPage size={80} color={defaultTheme.redColor} style={{ marginBottom: '20px' }} />
                            <h4>No Leads Found</h4>
                        </div>
                    )
                )}
            </Container>

            <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="lg" centered>
                <ModalHeader toggle={() => setModalOpen(false)} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <h5 className="mb-0">Lead Update</h5>
                </ModalHeader>

                <ModalBody>

                    <>
                        <div className="mt-2">
                            <Label for="status">Status <span className="text-danger">*</span></Label>
                            <Select
                                id="status"
                                isClearable
                                options={statusOptions}
                                value={status}
                                onChange={(selected) => setStatus(selected)}
                            />
                        </div>

                        <div className="mt-2">
                            <Label for="remarks">
                                Remarks <span className="text-danger">*</span>
                            </Label>
                            <Input
                                type="textarea"
                                id="remarks"
                                value={remarks}
                                className={`form-control`}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows="4"
                                placeholder="Enter your remarks here..."
                            />
                        </div>
                    </>
                </ModalBody>

                <ModalFooter style={{ borderTop: '1px solid #dee2e6' }}>
                    <Button
                        color="primary"
                        style={{ backgroundColor: defaultTheme.primary, }}
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                    <Button
                        color="secondary"
                        style={{ backgroundColor: defaultTheme.goldColorLogo, }}
                        onClick={() => setModalOpen(false)}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </PageContent>
    );
}
