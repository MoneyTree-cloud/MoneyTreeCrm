/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Container } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import { toast } from 'react-toastify';
import ScreenLoader from '../../constants/ScreenLoader';
import { facebookApiClient } from '../../helpers/api_helper';
import { GET_ALL_GOOGLE_ADS } from '../../helpers/url_helper';
import { formatDateTime, WordWrapCell } from '../../helpers/function_helper';
import { MdEmail, MdMobileFriendly, MdOutlineFindInPage } from 'react-icons/md';
import { defaultTheme } from '../../helpers/defaultTheme';
import { FaRegComment } from 'react-icons/fa';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { decryptData } from '../../components/Common/CryptoUtils';

export default function AllGoogleLeads() {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const name = queryParams.get('name');

    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await facebookApiClient.get(GET_ALL_GOOGLE_ADS + '?formId=' + projectId);
            setIsLoading(false);
            if (response?.data?.statusCode === 1) {
                const encryptedContent = response.data.data;
                decryptData(encryptedContent).then((decrypted) => {
                    // // Map assign values to selectedOption for Select input
                    const updatedForms = decrypted.map(form => {
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

    const total = leads.length;
    const pendingCount = leads.filter(item => item.leadStatus === 'Pending' || item.leadStatus == null).length;
    const acceptCount = leads.filter(item => item.leadStatus === 'Accept').length;
    const holdCount = leads.filter(item => item.leadStatus === 'Hold').length;
    const rejectCount = leads.filter(item => item.leadStatus === 'Reject').length;

    const columns = [
        {
            name: 'SL No.',
            selector: (row, index) => index + 1,
            width: '7%',
        },
        {
            name: 'Lead Time',
            width: '16%',
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
            name: 'Assigned To',
            width: '15%',
            selector: (row) => row.assignToName,
            cell: (row) => <WordWrapCell>{row.assignToName ? `${row.assignToName}` : ''}</WordWrapCell>,
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
            <Breadcrumbs title="Google" breadcrumbItem="All Lead Details" />
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
