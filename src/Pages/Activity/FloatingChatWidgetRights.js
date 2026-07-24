/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, CardBody, Label, Button } from 'reactstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { FaUsers, FaTrash, FaPlus, FaShieldAlt } from 'react-icons/fa';
import { MdCheckCircle, MdCancel } from 'react-icons/md';

import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import ScreenLoader from '../../constants/ScreenLoader';
import { useGet } from '../../Hooks/useApi';
import ApiClient from '../../helpers/api_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { WordWrapCell } from '../../helpers/function_helper';
import {
    GET_ALL_USER_AI_TABLE,
    CREATE_USER_AI_TABLE,
    // UPDATE_USER_AI_TABLE,
    DELETE_USER_AI_TABLE_BY_ID,
    GET_ALL_USERS_DROPDOWN,
    GET_ALL_TABLES
} from '../../helpers/url_helper';



const RS_STYLES = {
    control: (b) => ({
        ...b,
        minHeight: '42px',
        borderColor: '#CBD5E1',
        borderWidth: '1.5px',
        borderRadius: '10px',
        fontSize: '14px',
    }),
    menuPortal: (b) => ({ ...b, zIndex: 9999 }),
};


export default function FloatingChatWidgetRights() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [rights, setRights] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // ── Add new access state ────────────────────────────────────────────────
    const [newTable, setNewTable] = useState(null);
    const [creating, setCreating] = useState(false);

    // ── User dropdown ───────────────────────────────────────────────────────
    const { data: usersList, isLoading: usersLoading } = useGet(GET_ALL_USERS_DROPDOWN);
    const { data: tablesList } = useGet(GET_ALL_TABLES);

    const tableOptions = (tablesList?.data || []).map((table) => ({
        label: table
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        value: table,
    }));

    const userOptions = useMemo(() => {
        const raw = usersList?.data?.data;
        return Array.isArray(raw) ? raw : [];
    }, [usersList]);

    // ── Fetch rights for selected user ──────────────────────────────────────
    const fetchRights = () => {
        if (!selectedUser?.value) return;
        setIsLoading(true);
        ApiClient.get(`${GET_ALL_USER_AI_TABLE}?employee_code=${selectedUser.label?.split("(")[1]?.slice(0, -1)}`)
            .then((response) => {
                setIsLoading(false);
                if (response?.data?.length > 0) {
                    setRights(Array.isArray(response.data) ? response.data : []);
                } else {
                    setRights([]);
                    toast.error(response?.data?.message || 'No rights given');
                }
            })
            .catch((error) => {
                setIsLoading(false);
                setRights([]);
                toast.error(error.message);
            });
    };

    // Load rights whenever the selected user changes
    useEffect(() => {
        if (selectedUser?.value) {
            fetchRights();
        } else {
            setRights([]);
        }
    }, [selectedUser?.value]);

    // ── Filter out tables that already have rights ──────────────────────────
    const availableTables = useMemo(() => {
        const assigned = new Set(rights.map((r) => r.tableName));
        return tableOptions.filter((t) => !assigned.has(t.value));
    }, [rights]);

    // ── Add new access ──────────────────────────────────────────────────────
    const handleAddAccess = () => {
        if (!selectedUser?.value) return toast.error('Select a user first');
        if (!newTable) return toast.error('Select a table');

        const body = {
            employeeCode: selectedUser.label?.split("(")[1]?.slice(0, -1),
            tableName: newTable.value,
            isActive: 0,
        };

        setCreating(true);
        ApiClient.post(CREATE_USER_AI_TABLE, body)
            .then((response) => {
                setCreating(false);
                if (response.status === 201) {
                    toast.success('Access granted');
                    fetchRights();
                }
                else {
                    toast.error(response?.data?.message || 'Failed')
                }
            })
            .catch((error) => {
                if (error.response?.status === 409) {
                    toast.info('Already Granted');
                    return
                }
                setCreating(false);
                toast.error(error.message);
            });
    };

    // ── Delete single access ────────────────────────────────────────────────
    const handleDelete = (row) => {
        if (!window.confirm(`Remove ${row.tableName} access for this user?`)) return;

        setDeletingId(row.id);
        ApiClient.post(`${DELETE_USER_AI_TABLE_BY_ID}${row.id}`)
            .then((response) => {
                setDeletingId(null);
                if (response?.status === 200) {
                    toast.success(response.data.message || 'Access removed');
                    fetchRights();
                } else {
                    toast.error(response?.data?.message || 'Failed');
                }
            })
            .catch((error) => {
                setDeletingId(null);
                toast.error(error.message);
            });
    };


    // ── Get pretty label from raw table name ────────────────────────────────
    const getTableLabel = (tableName) => {
        const match = tableOptions?.find((t) => t.value === tableName);
        return match?.label || tableName;
    };

    // ── Columns ─────────────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            name: 'SL No.',
            width: '80px',
            cell: (_, i) => <WordWrapCell>{i + 1}</WordWrapCell>,
        },
        {
            name: 'Table',
            sortable: true,
            selector: (r) => r.tableName,
            cell: (r) => (
                <WordWrapCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div>
                            <div style={{ fontWeight: 700, color: '#0F172A' }}>
                                {getTableLabel(r.tableName)}
                            </div>
                            <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 2 }}>
                                {r.tableName}
                            </div>
                        </div>
                    </div>
                </WordWrapCell>
            ),
        },
        {
            name: 'Actions',
            width: '110px',
            cell: (r) => {
                const isDeleting = deletingId === r.id;
                return (
                    <button
                        onClick={() => handleDelete(r)}
                        disabled={isDeleting}
                        title="Remove access"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '5px 11px',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            borderRadius: 7,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            opacity: isDeleting ? 0.5 : 1,
                        }}
                    >
                        <FaTrash size={10} /> {isDeleting ? 'Removing…' : 'Remove'}
                    </button>
                );
            },
        },
    ].map((c) => ({
        ...c,
        name: <span className="font-weight-bold fs-13">{c.name}</span>,
    })), [deletingId]);

    return (
        <PageContent>
            <Breadcrumbs title="Access Control" breadcrumbItem="Table Access Rights" />
            {(isLoading || usersLoading) && <ScreenLoader />}

            <Container fluid>
                {/* ── User Selection ──────────────────────────────────────── */}
                <Card>
                    <CardBody>
                        <h6 style={{
                            fontSize: 13, fontWeight: 700, color: defaultTheme.primary,
                            marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <FaUsers size={13} /> Grant AI Table Access to User
                        </h6>
                        <Row className="g-3 align-items-end">
                            <Col md="8">
                                <Label className="form-label">
                                    Select User <span style={{ color: '#DC2626' }}>*</span>
                                </Label>
                                <Select
                                    value={selectedUser}
                                    onChange={setSelectedUser}
                                    options={userOptions}
                                    isClearable
                                    isLoading={usersLoading}
                                    placeholder={usersLoading ? 'Loading users…' : 'Choose a user…'}
                                    styles={RS_STYLES}
                                    menuPortalTarget={document.body}
                                />
                            </Col>

                        </Row>
                    </CardBody>
                </Card>

                {selectedUser && (
                    <>
                        {/* ── Access Summary ──────────────────────────────── */}
                        <div style={{
                            background: '#fff',
                            border: '1px solid #E8ECF2',
                            borderRadius: 14,
                            padding: '16px 22px',
                            marginBottom: 18,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            boxShadow: '0 1px 4px rgba(0,0,0,.04)',
                        }}>
                            <div style={{
                                width: 48, height: 48,
                                borderRadius: 12,
                                background: `linear-gradient(135deg, ${defaultTheme.primary}, #007A6E)`,
                                color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 18,
                            }}>
                                <FaShieldAlt />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: 11, fontWeight: 700, color: '#94A3B8',
                                    textTransform: 'uppercase', letterSpacing: '.5px',
                                }}>
                                    Tables Accessible
                                </div>
                                <div style={{
                                    fontSize: 24, fontWeight: 800, color: defaultTheme.primary,
                                    lineHeight: 1.1, marginTop: 2,
                                }}>
                                    {rights.length}{' '}
                                    <span style={{ fontSize: 14, color: '#94A3B8', fontWeight: 600 }}>
                                        of {tableOptions?.length}
                                    </span>
                                </div>
                            </div>
                            <div style={{
                                fontSize: 12, color: '#475569',
                                background: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                padding: '8px 14px',
                                borderRadius: 9,
                                fontWeight: 600,
                            }}>
                                User: <span style={{ color: defaultTheme.primary, fontWeight: 700 }}>
                                    {selectedUser.label}
                                </span>
                            </div>
                        </div>

                        {/* ── Add New Access ──────────────────────────────── */}
                        {availableTables.length > 0 && (
                            <Card>
                                <CardBody>
                                    <h6 style={{
                                        fontSize: 12.5, fontWeight: 700, color: '#0F172A',
                                        marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
                                    }}>
                                        <FaPlus size={11} color={defaultTheme.primary} /> Add New Table Access
                                    </h6>
                                    <Row className="g-3 align-items-end">
                                        <Col md="5">
                                            <Label className="form-label">Table Name</Label>
                                            <Select
                                                value={newTable}
                                                onChange={setNewTable}
                                                options={availableTables}
                                                isClearable
                                                placeholder="Select a table…"
                                                styles={RS_STYLES}
                                                menuPortalTarget={document.body}
                                            />
                                        </Col>
                                        <Col md="2">
                                            <Button
                                                color="primary"
                                                onClick={handleAddAccess}
                                                disabled={!newTable || creating}
                                                style={{
                                                    backgroundColor: defaultTheme.primary,
                                                    border: 'none',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 6,
                                                }}
                                            >
                                                <FaPlus size={11} />
                                                {creating ? 'Adding…' : 'Grant'}
                                            </Button>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        )}

                        {availableTables.length === 0 && rights.length > 0 && (
                            <div style={{
                                background: '#F0FDF4',
                                border: '1px solid #BBF7D0',
                                borderRadius: 10,
                                padding: '10px 14px',
                                marginBottom: 14,
                                fontSize: 12.5,
                                color: '#166534',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontWeight: 600,
                            }}>
                                <MdCheckCircle size={16} />
                                All available tables have been granted access.
                            </div>
                        )}

                        {/* ── Existing Access Table ───────────────────────── */}
                        <AppTable
                            progressPending={isLoading}
                            columns={columns}
                            data={rights}
                            pagination
                            noDataComponent={
                                <div style={{
                                    padding: '40px 20px',
                                    textAlign: 'center',
                                    color: '#94A3B8',
                                    fontSize: 13,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 8,
                                }}>
                                    <MdCancel size={32} color="#CBD5E1" />
                                    <div>No table access rights granted yet.</div>
                                    <div style={{ fontSize: 11.5, color: '#CBD5E1' }}>
                                        Use the "Add New Table Access" section above to grant permissions.
                                    </div>
                                </div>
                            }
                        />
                    </>
                )}

                {!selectedUser && (
                    <div style={{
                        background: '#fff',
                        border: '1px dashed #CBD5E1',
                        borderRadius: 12,
                        padding: '40px 22px',
                        textAlign: 'center',
                        color: '#94A3B8',
                        fontSize: 13.5,
                    }}>
                        <FaUsers size={32} color="#CBD5E1" style={{ marginBottom: 10 }} />
                        <div>Select a user above to manage their AI table access rights.</div>
                    </div>
                )}
            </Container>
        </PageContent>
    );
}