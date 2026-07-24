/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Container } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import { toast } from 'react-toastify';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient, { facebookApiClient } from '../../helpers/api_helper';
import { GET_GOOGLE_ADS, ASSIGNED_GOOGLE_LEAD, GET_MY_TEAM, CREATE_SUSPECT } from '../../helpers/url_helper';
import { formatDateTime, WordWrapCell } from '../../helpers/function_helper';
import { MdEmail, MdMobileFriendly, MdOutlineFindInPage } from 'react-icons/md';
import { defaultTheme } from '../../helpers/defaultTheme';
import { FaRegComment } from 'react-icons/fa';
import { useUserStore } from '../../store/useUserStore';
import Select from 'react-select';
import { useGet } from '../../Hooks/useApi';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { USER_TYPE } from '../../constants/global';

export default function GoogleLeads() {
    const empCode = useUserStore((state) => state.user.empCode);
    const empName = useUserStore((state) => state.user.userName);
    const role = useUserStore((state) => state.user.role);
    const navigate = useNavigate();

    const { projectId } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const name = queryParams.get('name');
    const userId = useUserStore((state) => state.user.userId);
    const { data: usersList } = useGet(GET_MY_TEAM + userId, { enabled: !!userId });
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await facebookApiClient.get(GET_GOOGLE_ADS + empCode + '&formId=' + projectId);
            setIsLoading(false);
            if (response?.data?.statusCode === 1) {
                const forms = response.data.data;

                // Map assign values to selectedOption for Select input
                const updatedForms = forms.map(form => {
                    const isAssigned = form.assignToCode && form.assignToName;
                    return {
                        ...form,
                        selectedOption: isAssigned
                            ? {
                                value: form.assignToCode,
                                label: form.assignToName
                            }
                            : null
                    };
                });

                setLeads(updatedForms);
            } else if (response.data.message !== 'No record found.') {
                toast.error(response.data.message || "Failed to fetch leads");
            }
        } catch (error) {
            setIsLoading(false);
            toast.error(error.message);
        }
    };

    const total = leads.length;
    const pendingCount = leads.filter(item => item.leadStatus === 'Pending' || item.leadStatus == null).length;
    const acceptCount = leads.filter(item => item.leadStatus === 'Accept').length;
    const holdCount = leads.filter(item => item.leadStatus === 'Hold').length;
    const rejectCount = leads.filter(item => item.leadStatus === 'Reject').length;

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

        setIsLoading(true);

        const assignToCode = rowData?.selectedOption?.label?.split('(')[1]?.split(')')[0]?.trim()
        const assignToName = rowData?.selectedOption?.label
        const endPoint = `${rowData?.id}&assignByCode=${empCode}&assignByName=${empName}&assignToCode=${assignToCode}&assignToName=${assignToName}`;
        facebookApiClient.post(ASSIGNED_GOOGLE_LEAD + endPoint)
            .then((response) => {
                if (response?.data?.statusCode === 1) {
                    const request = {
                        leadName: rowData.name,
                        leadMobile: rowData.number,
                        remark: "N/A",
                        project: name,
                        projectCategory: "Google",
                    };
                    ApiClient.post(`${CREATE_SUSPECT}${rowData?.selectedOption?.value}`, request,)
                        .then(function (response) {
                            setIsLoading(false);
                            if (response?.data?.status === 1) {
                                toast.success('Suspect created successfully');
                                fetchData();
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
            selector: (row, index) => index + 1,
            width: '7%',
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
        ...(role !== USER_TYPE.ASSOCIATE
            ? [
                {
                    name: 'Assigned To',
                    width: '18%',
                    selector: (row) => row.assignToName,
                    cell: (row) => <WordWrapCell>{row.assignToName}</WordWrapCell>,
                },
            ]
            : []),
        {
            name: 'Select Asscoiate To Assign',
            width: '25%',
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
        {
            name: 'Status',
            width: '12%',
            selector: (row) => row.leadStatus,
            cell: (row) => <WordWrapCell>{row.leadStatus === 'Accept' ? 'Move To Suspect' : row.leadStatus}</WordWrapCell>,
        },
    ];

    return (
        <PageContent>
            <Breadcrumbs title="Google" breadcrumbItem="Lead Details" />

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
        </PageContent>
    );
}
