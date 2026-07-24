/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Container, Modal, ModalBody, ModalHeader } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient, { facebookApiClient } from '../../helpers/api_helper';
import { ASSIGN_ASSOCIATE_FB_LEAD, ASSOCIATE_FB_LEADS_DETAILS, CREATE_SUSPECT, GET_MY_TEAM } from '../../helpers/url_helper';
import { formatActionType, formatDateTime, WordWrapCell } from '../../helpers/function_helper';
import { MdEmail, MdMobileFriendly, MdOutlineFindInPage } from 'react-icons/md';
import { defaultTheme } from '../../helpers/defaultTheme';
import { FaEye, FaRegComment, FaWhatsapp } from 'react-icons/fa';
import { useUserStore } from '../../store/useUserStore';
import Select from 'react-select';
import { useGet } from '../../Hooks/useApi';
import { USER_TYPE } from '../../constants/global';
import { decryptData } from '../../components/Common/CryptoUtils';
// import * as XLSX from "xlsx";

export default function ViewLeadsDetails() {
    const navigate = useNavigate();
    const { empCode, empName, role, userId } = useUserStore((state) => state.user);
    const { data: usersList } = useGet(GET_MY_TEAM + userId);

    const { formId } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const name = queryParams.get('name');

    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [assignedLeadsCount, setAssignedLeadsCount] = useState(0);
    const fixedFields = ['full_name', 'full name', 'phone_number', 'phone', 'email', 'job_title', 'job title', 'share_whatsapp_number'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await facebookApiClient.get(ASSOCIATE_FB_LEADS_DETAILS + formId);
            setIsLoading(false);
            if (response?.data?.statusCode === 1) {
                const encryptedContent = response.data.data;
                decryptData(encryptedContent).then((decrypted) => {
                    // // Map assign values to selectedOption for Select input
                    const updatedForms = decrypted.map(form => {
                        const isAssigned = form.assignToEmpCode && form.assignToEmpName;
                        return {
                            ...form,
                            selectedOption: isAssigned
                                ? {
                                    value: form.assignToEmpCode,
                                    label: form.assignToEmpName
                                }
                                : null
                        };
                    });

                    setLeads(updatedForms);
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

    const handleUserChange = (selectedOption) => {
        setSelectedUser(selectedOption);
        if (!selectedOption) {
            setAssignedLeadsCount(0);
            return;
        }
        const selectedEmpCode = selectedOption?.label?.match(/\(([^()]*)\)\s*$/)?.[1];
        const count = leads.filter(
            (lead) => String(lead.assignToEmpCode) === selectedEmpCode
        ).length;
        setAssignedLeadsCount(count);
    };

    const total = leads.length;
    const pendingCount = leads.filter(item => item.leadStatus === 'Pending' || item.leadStatus == null).length;
    const acceptCount = leads.filter(item => item.leadStatus === 'Accept').length;
    const holdCount = leads.filter(item => item.leadStatus === 'Hold').length;
    const rejectCount = leads.filter(item => item.leadStatus === 'Reject').length;

    const getFieldValue = (fieldData, key) =>
        fieldData.find((f) => f.name === key)?.values?.[0] || null

    const openModal = (lead) => {
        setSelectedLead(lead);
        setModalOpen(true);
    };

    const getDynamicFields = () => {
        if (!selectedLead) return [];
        return selectedLead.fieldData.filter((f) => !fixedFields.includes(f.name));
    };

    const handleDropdownChange = (id, selectedOption) => {
        setLeads(prev =>
            prev.map(form =>
                form.id === id ? { ...form, selectedOption } : form
            )
        );
    };

    const handleAssign = (rowData) => {
        if (!rowData.selectedOption) {
            toast.error(`Please select a user for ${rowData.name}`);
            return;
        }

        setSelectedLead(rowData);
        setIsLoading(true);
        const assignToCode = rowData?.selectedOption?.label?.split('(')[1]?.split(')')[0]?.trim()
        const params = {
            "leadId": rowData?.id,
            "assignedByCode": empCode,
            "assignedByName": empName,
            "assignToCode": assignToCode,
            "assignToName": rowData?.selectedOption?.label,
            "campaignName": name
        }
        facebookApiClient.post(ASSIGN_ASSOCIATE_FB_LEAD, params)
            .then((response) => {
                if (response?.data?.statusCode === 1) {
                    const leadMobileRaw = getFieldValue(rowData.fieldData, 'phone_number') || getFieldValue(rowData.fieldData, 'phone');
                    const leadMobile = leadMobileRaw?.replace(/\D/g, '').slice(-10); // Extract last 10 digits

                    const request = {
                        leadName: getFieldValue(rowData.fieldData, 'full_name') || getFieldValue(rowData.fieldData, 'full name'),
                        leadMobile: leadMobile,
                        remark: "N/A",
                        project: name,
                        projectCategory: "Meta",
                    };

                    ApiClient.post(`${CREATE_SUSPECT}${rowData?.selectedOption?.value}`, request,)
                        .then(function (response) {
                            setIsLoading(false);
                            if (response?.data?.status === 1) {
                                toast.success('Suspect created successfully');
                                fetchData();
                                setSelectedLead(null)
                            } else {
                                toast.error(response.data.message);
                            }
                        })
                        .catch(function (error) {
                            setIsLoading(false);
                            toast.error(error.message);
                        });
                } else {
                    setIsLoading(false);
                    toast.error(response.data.message);
                }
            })
            .catch((error) => {
                setIsLoading(false);
                toast.error(error.message);
            });
    }

    const columns = [
        {
            name: 'SL No.',
            selector: (_, index) => index + 1,
            width: '7%',
        },
        {
            name: 'Lead Time',
            width: '16%',
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
        }, {
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
            name: 'Job Title',
            width: '12%',
            sortable: true,
            selector: (row) => getFieldValue(row.fieldData, 'job_title'),
            cell: (row) => <WordWrapCell>{getFieldValue(row.fieldData, 'job_title') || getFieldValue(row.fieldData, 'job title')}</WordWrapCell>,
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
            name: 'Assigned To',
            width: '15%',
            sortable: true,
            selector: (row) => row.assignToEmpName,
            cell: (row) => <WordWrapCell>{row.assignToEmpName}</WordWrapCell>,
        },
        ...(role === USER_TYPE.ASSOCIATE
            ? [
                {
                    name: 'Select Associate To Assign',
                    width: '25%',
                    sortable: true,
                    cell: row => (
                        <div style={{ minWidth: '250px', maxWidth: '250px' }}>
                            <Select
                                isDisabled={row.leadStatus === 'Accept'}
                                options={usersList?.data?.data || []}
                                value={row.selectedOption || null}
                                onChange={(selected) => handleDropdownChange(row.id, selected)}
                                menuPortalTarget={document.body}
                                isClearable
                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                            />
                        </div>
                    ),
                },
                {
                    name: 'Action',
                    width: '9%',
                    cell: row => {
                        return (
                            <button
                                disabled={row.leadStatus === 'Accept'}
                                onClick={() => handleAssign(row)}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: row.leadStatus === 'Accept' ? '#ccc' : defaultTheme.primary,
                                    borderRadius: '4px',
                                    cursor: row.leadStatus === 'Accept' ? 'not-allowed' : 'pointer',
                                    color: '#fff',
                                    border: 'none',
                                }}
                            >
                                {'Assign'}
                            </button>
                        );
                    }
                },
            ]
            : []),
        {
            name: 'Status',
            width: '15%',
            sortable: true,
            selector: (row) => row.leadStatus,
            cell: (row) => <WordWrapCell>{row.leadStatus === 'Accept' ? 'Move To Suspect' : row.leadStatus}</WordWrapCell>,
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
        }
    ];

    // const downloadExcel = () => {
    //     const data = leads;
    //     if (!Array.isArray(data) || data.length === 0) return;

    //     // 1. Extract and modify the required headers
    //     const headers = ["SL No.", "Name", "Mobile Number"];

    //     // 2. Format the data to match the new structure
    //     const formattedData = data.map((item, index) => [
    //         index + 1, // Sl No.
    //         getFieldValue(item.fieldData, 'full name'),
    //         getFieldValue(item.fieldData, 'phone')
    //     ]);

    //     // 3. Add headers to the formatted data
    //     const finalData = [headers, ...formattedData];

    //     // 4. Create a worksheet from the final data
    //     const ws = XLSX.utils.aoa_to_sheet(finalData);

    //     // 5. Create a workbook and append the worksheet
    //     const wb = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(wb, ws, "Group Members");

    //     // 6. Write the file and trigger download
    //     XLSX.writeFile(wb, `leadData.xlsx`);
    //     return;
    // };

    return (
        <PageContent>
            <Breadcrumbs title="Meta" breadcrumbItem="Leads Details" />
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 20px'
            }}>
                <h5> {name} </h5>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: defaultTheme.primary,
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    ← Back
                </button>
            </div>
            <div style={{ display: 'flex', gap: '2rem', padding: '1rem' }}>
                <div><strong>Total:</strong> {total}</div>
                <div><strong>Pending:</strong> {pendingCount}</div>
                <div><strong>Moved To Suspect:</strong> {acceptCount}</div>
                <div><strong>Hold:</strong> {holdCount}</div>
                <div><strong>Reject:</strong> {rejectCount}</div>
            </div>
            {(isLoading) && <ScreenLoader />}

            {role === USER_TYPE.ASSOCIATE && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                        flexWrap: 'wrap',
                        gap: '1rem',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label style={{ fontWeight: 'bold', marginBottom: 0 }}>Select Team Member:</label>
                        <Select
                            options={usersList?.data?.data || []}
                            menuPortalTarget={document.body}
                            isClearable
                            value={selectedUser}
                            onChange={handleUserChange}
                            styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                container: (base) => ({ ...base, minWidth: 250 }),
                            }}
                        />
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '500', color: '#495057' }}>
                        <span style={{ fontWeight: 'bold', color: '#333' }}>Assigned Leads:</span>{' '}
                        <span style={{ color: '#007bff' }}>{assignedLeadsCount}</span>
                    </div>
                </div>
            )}

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
                </ModalBody>
            </Modal>
        </PageContent>
    );
}