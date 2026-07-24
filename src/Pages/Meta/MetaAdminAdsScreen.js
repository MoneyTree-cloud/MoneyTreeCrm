import React, { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import { defaultTheme } from '../../helpers/defaultTheme';
import { ASSIGN_FB_LEADS, GET_ALL_FB_LEADS, GET_ALL_USERS_DROPDOWN } from '../../helpers/url_helper';
import { useGet } from '../../Hooks/useApi';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { WordWrapCell } from '../../helpers/function_helper';
import { facebookApiClient } from '../../helpers/api_helper';
import ScreenLoader from '../../constants/ScreenLoader';
import { useUserStore } from '../../store/useUserStore';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';
import { USER_TYPE } from '../../constants/global';
import { decryptData } from '../../components/Common/CryptoUtils';

export default function MetaAdminAdsScreen() {
    const { empCode, empName, userId, role } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);
    const { data: usersList } = useGet(GET_ALL_USERS_DROPDOWN, { enabled: !!accessGranted });
    const [isLoading, setIsLoading] = useState(true);
    const [leadForms, setLeadForms] = useState([]);

    useEffect(() => {
        if (accessGranted) {
            getLeadForms();
        }
    }, [accessGranted]);

    const getLeadForms = () => {
        facebookApiClient.get(GET_ALL_FB_LEADS)
            .then((response) => {
                setIsLoading(false);
                if (response?.data?.statusCode === 1) {
                    const encryptedContent = response.data.data;
                    decryptData(encryptedContent).then((decrypted) => {
                        // Map assign values to selectedOption for Select input
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

                        setLeadForms(updatedForms);
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

    const handleDropdownChange = (id, selectedOption) => {
        setLeadForms(prev =>
            prev.map(form =>
                form.id === id ? { ...form, selectedOption } : form
            )
        );
    };

    const handleSave = (user) => {
        if (!user.selectedOption) {
            toast.error(`Please select a user for ${user.name}`);
            return;
        }
        const assignToCode = user?.selectedOption?.label?.split('(')[1]?.split(')')[0]
        setIsLoading(true);
        const endPoint = `leadFormId=${user?.id}&empCode=${assignToCode}&empName=${user?.selectedOption?.label}&loginId=${empCode}&loginName=${empName}`;

        facebookApiClient.post(ASSIGN_FB_LEADS + endPoint)
            .then((response) => {
                setIsLoading(false);
                if (response?.data?.statusCode === 1) {
                    toast.success(response.data.message);
                    getLeadForms();
                } else {
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
            name: <span className="font-weight-bold fs-13">Campaign Name</span>,
            selector: (row) => row.name,
            sortable: true,
            width: '40%',
            cell: (row) => <WordWrapCell>{row.name}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Lead Count</span>,
            selector: (row) => row.leadsCount,
            sortable: true,
            width: '10%',
            cell: (row) => <WordWrapCell>{row.leadsCount}</WordWrapCell>,
        },
        {
            name: 'Select User',
            width: '30%',
            cell: row => (
                <div style={{ minWidth: '250px', maxWidth: '250px' }}>
                    <Select
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
                        onClick={() => handleSave(row)}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: defaultTheme.primary,
                            borderRadius: '4px',
                        }}
                    >
                        {'Assign'}
                    </button>
                );
            }
        },
        {
            name: 'View Leads',
            width: '15%',
            cell: row => (
                <a
                    href={`/meta-admin-ads/leads-details/${row.id}?name=${encodeURIComponent(row.name)}`}
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
                const hasAccess = await CheckUserAccess(userId, 'meta-admin-ads');
                setAccessGranted(hasAccess);
            }
            else {
                setAccessGranted(true);
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
            <Breadcrumbs title="Meta" breadcrumbItem="All Campaigns" />
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
