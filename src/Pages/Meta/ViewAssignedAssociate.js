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
import { CREATE_SUSPECT, GET_ASSIGNED_ASSOCIATE_FB_LEAD, UPDATE_ASSOCIATE_FB_LEAD } from '../../helpers/url_helper';
import { formatActionType, formatDateTime, WordWrapCell } from '../../helpers/function_helper';
import { MdEmail, MdMobileFriendly, MdOutlineFindInPage } from 'react-icons/md';
import { defaultTheme } from '../../helpers/defaultTheme';
import { FaEye, FaRegComment, FaWhatsapp } from 'react-icons/fa';
import { useUserStore } from '../../store/useUserStore';
import Select from 'react-select';
import { usePost } from '../../Hooks/useApi';
import { decryptData } from '../../components/Common/CryptoUtils';
import { USER_TYPE } from '../../constants/global';

export default function ViewAssignedAssociate() {
    const { empCode, userId, empName, role } = useUserStore((state) => state.user);
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

    const fixedFields = ['full_name', 'full name', 'phone_number', 'phone', 'email', 'job_title', 'job title', 'share_whatsapp_number'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await facebookApiClient.get(GET_ASSIGNED_ASSOCIATE_FB_LEAD + empCode);
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

    const getFieldValue = (fieldData, key) =>
        fieldData.find((f) => f.name === key)?.values?.[0] || null

    const openModal = (lead) => {
        setSelectedLead(lead);
        setRemarks('');
        setStatus(null);
        setModalOpen(true);
    };

    const getDynamicFields = () => {
        if (!selectedLead) return [];
        return selectedLead.fieldData.filter((f) => !fixedFields.includes(f.name));
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
        const endPoint = `leadId=${selectedLead?.id}&remarks=${remarks}&empCode=${empCode}&empName=${empName}&leadStatus=${status.value}`;
        facebookApiClient.post(UPDATE_ASSOCIATE_FB_LEAD + endPoint)
            .then((response) => {
                setIsLoading(false);
                if (response?.data?.statusCode === 1) {
                    fetchData();
                    setModalOpen(false);
                    // const leadMobileRaw = getFieldValue(selectedLead.fieldData, 'phone_number');
                    const leadMobileRaw = getFieldValue(selectedLead.fieldData, 'phone_number') || getFieldValue(selectedLead.fieldData, 'phone');

                    const leadMobile = leadMobileRaw?.startsWith('+91') ? leadMobileRaw.slice(3) : leadMobileRaw;

                    const request = {
                        leadName: getFieldValue(selectedLead.fieldData, 'full_name') || getFieldValue(selectedLead.fieldData, 'full name'),
                        leadMobile: leadMobile,
                        remark: "N/A",
                        project: "N/A",
                        projectCategory: "N/A",
                    };
                    mutateAdd(request);
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
    const { isPending: isPendingAdd, mutate: mutateAdd } = usePost(
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
            selector: (_, index) => index + 1,
            width: '7%',
        },
        {
            name: 'Campaign Name',
            width: '16%',
            selector: (row) => row.campaignName,
            cell: (row) => <WordWrapCell>{row.campaignName}</WordWrapCell>,
            sortable: true,
        },
        {
            name: 'Lead Time',
            width: '15%',
            selector: (row) => row.createdTime,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdTime)}</WordWrapCell>,
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
            selector: (row) => getFieldValue(row.fieldData, 'full_name'),
            cell: (row) => <WordWrapCell>{getFieldValue(row.fieldData, 'full_name') || getFieldValue(row.fieldData, 'full name')}</WordWrapCell>,
            sortable: true,
        },
        {
            name: 'Mobile No.',
            selector: (row) => {
                return getFieldValue(row.fieldData, 'phone_number') || getFieldValue(row.fieldData, 'phone');
            },
            cell: (row) => {
                const phone = getFieldValue(row.fieldData, 'phone_number') || getFieldValue(row.fieldData, 'phone');
                return (
                    <div className="phone-container">
                        <MdMobileFriendly
                            className="phone-icon"
                            color={defaultTheme.goldColorLogo}
                        />
                        <span className="phone-number">{phone}</span>
                    </div>
                );
            },
        },
        {
            name: 'WhatsApp No.',
            selector: (row) => getFieldValue(row.fieldData, 'share_whatsapp_number'),
            cell: (row) => (
                <div className="phone-container">
                    <FaWhatsapp className="phone-icon" color="#25D366" />
                    <span className="phone-number">{getFieldValue(row.fieldData, 'share_whatsapp_number')}</span>
                </div>
            ),
        },
        {
            name: 'Email',
            selector: (row) => getFieldValue(row.fieldData, 'email'),
            cell: (row) => (
                <div className="phone-container">
                    <MdEmail
                        className="phone-icon"
                        color={defaultTheme.goldColorLogo}
                    />
                    <span className="phone-number">{getFieldValue(row.fieldData, 'email')}</span>
                </div>
            ),
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
            name: 'Job Title',
            width: '15%',
            selector: (row) => getFieldValue(row.fieldData, 'job_title'),
            cell: (row) => <WordWrapCell>{getFieldValue(row.fieldData, 'job_title') || getFieldValue(row.fieldData, 'job title')}</WordWrapCell>,
        },
        {
            name: 'More Details',
            cell: (row) => (
                <FaEye
                    onClick={() => openModal(row)}
                    size={20}
                    color={defaultTheme.primary}
                    cursor={'pointer'}
                />
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
            <Breadcrumbs title="Meta" breadcrumbItem="Leads Details" />
            {(isLoading || isPendingAdd) && <ScreenLoader />}
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
                    <h5 className="mb-0">Lead Details</h5>
                </ModalHeader>

                <ModalBody>

                    <div className="mb-2">
                        <h6 className="text-muted">Additional Information</h6>
                        <div className="p-3 border rounded bg-white">
                            {getDynamicFields().map((field) => (
                                <div key={field.id} className="mb-2">
                                    <strong>{formatActionType(field.name)}:</strong>{' '}
                                    {formatActionType(field.values[0])}
                                </div>
                            ))}
                            {getDynamicFields().length === 0 && <div>No additional fields available.</div>}
                        </div>
                    </div>
                    {(role === USER_TYPE.ASSOCIATE && selectedLead?.leadStatus !== 'Accept') && (
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
                    )}
                </ModalBody>
                {(role === USER_TYPE.ASSOCIATE && selectedLead?.leadStatus !== 'Accept') && (

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
                )}
            </Modal>
        </PageContent>
    );
}
