/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import { defaultTheme } from '../../helpers/defaultTheme';
import { GET_ALL_GOOGLE_PROJECTS } from '../../helpers/url_helper';
import { toast } from 'react-toastify';
import { formatDateTime, WordWrapCell } from '../../helpers/function_helper';
import { facebookApiClient } from '../../helpers/api_helper';
import ScreenLoader from '../../constants/ScreenLoader';
import { useUserStore } from '../../store/useUserStore';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';
import { decryptData } from '../../components/Common/CryptoUtils';
import { USER_TYPE } from '../../constants/global';

export default function GoogleProjectsList() {
    const { empCode, role, userId } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [leadForms, setLeadForms] = useState([]);

    useEffect(() => {
        if (accessGranted) {
            getLeadForms();
        }
    }, [accessGranted]);

    const getLeadForms = () => {
        let apiUrl = `${GET_ALL_GOOGLE_PROJECTS}`;
        if (role === USER_TYPE.ASSOCIATE) {
            apiUrl = `${GET_ALL_GOOGLE_PROJECTS}?empCode=${empCode}`;
        }
        facebookApiClient.get(apiUrl)
            .then((response) => {
                setIsLoading(false);
                if (response?.data?.statusCode === 1) {
                    const encryptedContent = response.data.data;
                    decryptData(encryptedContent).then((decrypted) => {
                        setLeadForms(decrypted);
                    }).catch((error) => {
                        setLeadForms([]);
                    });
                } else if (response.data.message !== 'No record found.') {
                    toast.error(response.data.message);
                }
            })
            .catch((error) => {
                setIsLoading(false);
                toast.error(error.message);
            });
    };

    const columns = [
        {
            name: 'SL No.',
            selector: (row, index) => index + 1,
            width: '6%',
            cell: (row, index) => <WordWrapCell>{index + 1}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
            selector: (row) => row.created_time,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.created_time)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Project Name</span>,
            selector: (row) => row.name,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.name}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Lead Count</span>,
            selector: (row) => row.lead_count,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.lead_count}</WordWrapCell>,
        },
        {
            name: 'View Leads',
            cell: row => (
                <a
                    href={role === USER_TYPE.ASSOCIATE ? `/all-google-projects/view-google-leads/${row.form_id}?name=${encodeURIComponent(row.name)}` : `/all-google-projects/view-all-google-leads/${row.form_id}?name=${encodeURIComponent(row.name)}`}
                    style={{
                        color: defaultTheme.btnEnable,
                        textDecoration: 'underline',
                        cursor: 'pointer'
                    }}
                >
                    View Leads →
                </a>
            )
        },
    ];



    useEffect(() => {
        const checkAccess = async () => {
            if (role !== USER_TYPE.ASSOCIATE) {
                const hasAccess = await CheckUserAccess(userId, 'all-google-projects');
                setAccessGranted(hasAccess);
            }
            else {
                setAccessGranted(true)
            }
        };
        checkAccess();
    }, [userId, role]);

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Google" breadcrumbItem="All Projects" />
            {isLoading && <ScreenLoader />}
            <Container fluid>
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={leadForms}
                    pagination
                />
            </Container>
        </PageContent>
    );
}
