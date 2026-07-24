/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useGet } from "../../Hooks/useApi";
import {
    GET_ALL_USERS_DROPDOWN_ALL,
    GET_MY_ALL_TEAM,
    GET_P100_LEADS,
    TRANSFER_P100_LEADS,
} from "../../helpers/url_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import {  WordWrapCell } from "../../helpers/function_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import { MdMobileFriendly } from "react-icons/md";
import "../CSS/styles.css";
import ApiClient from "../../helpers/api_helper";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { USER_TYPE } from "../../constants/global";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function TransferP100Leads() {
    const { userId, role } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);

    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [rowData, setRowData] = useState([]);
    const [pending, setPending] = useState(false);
    const [transferring, setTransferring] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    const INITIAL_STATE = {
        associateSelect: null,
        toAssociateSelect: null,
        transferTypeSelect: null,
    };
    const [formState, setFormState] = useState(INITIAL_STATE);

    // ── Endpoint for associate dropdown depends on role ─────────────────────
    const isAdminOrOther = role === USER_TYPE.ADMIN || role === USER_TYPE.OTHER;
    const endpoint = isAdminOrOther
        ? GET_ALL_USERS_DROPDOWN_ALL
        : `${GET_MY_ALL_TEAM}${userId}`;

    const { data: associateList, isLoading } = useGet(endpoint, { enabled: !!accessGranted });

    // ── Fetch P100 leads for the selected associate ─────────────────────────
    const getLeadsData = () => {
        setPending(true);

        const url = `${GET_P100_LEADS}&associateId=${formState.associateSelect.value}`;

        ApiClient.get(url)
            .then((response) => {
                if (response?.data?.status === 1) {
                    decryptData(response?.data?.data)
                        .then((decrypted) => {
                            const content = decrypted?.content || [];

                            const updatedRows = Array.isArray(content)
                                ? content.map((lead) => ({
                                    ...lead,
                                    isChecked: false,
                                }))
                                : [];

                            setRowData(updatedRows);
                            setTotalElements(
                                decrypted?.totalElements || updatedRows.length
                            );
                        })
                        .catch(() => {
                            setRowData([]);
                            setTotalElements(0);
                            toast.error("Failed to decrypt data");
                        })
                        .finally(() => {
                            setPending(false);
                        });
                } else {
                    setPending(false);
                    setRowData([]);
                    setTotalElements(0);
                    toast.error(response?.data?.message || "Failed to load leads");
                }
            })
            .catch((error) => {
                setPending(false);
                setRowData([]);
                setTotalElements(0);
                toast.error(error.message);
            });
    };

    // ── Select-all + per-row checkbox sync ──────────────────────────────────
    useEffect(() => {
        if (rowData.length === 0) {
            setSelectAllChecked(false);
            return;
        }
        const allChecked = rowData.every((row) => row.isChecked);
        setSelectAllChecked(allChecked);
    }, [rowData]);

    const handleCheckboxChange = (rowId) => {
        setRowData((prev) => prev.map((row) =>
            row.id === rowId ? { ...row, isChecked: !row.isChecked } : row
        ));
    };

    const handleSelectAllChange = () => {
        const newCheckedState = !selectAllChecked;
        setRowData((prev) => prev.map((row) => ({ ...row, isChecked: newCheckedState })));
        setSelectAllChecked(newCheckedState);
    };

    // ── Transfer-type "All" auto-checks every row ───────────────────────────
    useEffect(() => {
        if (formState.transferTypeSelect?.value === "All") {
            setRowData((prev) => prev.map((row) => ({ ...row, isChecked: true })));
            setSelectAllChecked(true);
        } else if (formState.transferTypeSelect?.value === "Selected") {
            setRowData((prev) => prev.map((row) => ({ ...row, isChecked: false })));
            setSelectAllChecked(false);
        }
    }, [formState.transferTypeSelect]);

    // ── Form handlers ───────────────────────────────────────────────────────
    const handleSelectChange = (name, selectedOption) => {
        setFormState((prev) => ({ ...prev, [name]: selectedOption }));
    };

    const handleShowData = () => {
        if (!formState.associateSelect) {
            return toast.error("Please select an associate");
        }
        getLeadsData();
    };

    // ── Transfer ────────────────────────────────────────────────────────────
    const handleTransferData = () => {
        if (!formState.associateSelect) {
            return toast.error("Please select an associate to transfer from");
        }
        if (!formState.toAssociateSelect) {
            return toast.error("Please select an associate to transfer to");
        }
        const selected = rowData.filter((row) => row.isChecked);
        if (selected.length === 0) {
            return toast.error("Please select at least one lead to transfer");
        }

        if (!window.confirm(`Transfer ${selected.length} lead${selected.length > 1 ? 's' : ''} to ${formState.toAssociateSelect.label}?`)) return;

        // Strip the isChecked flag before sending — backend doesn't need it
        // const payload = selected.map(({ isChecked, ...rest }) => rest);
        const payload = selected.map(({ isChecked, status, suspectCreatedDate, ...rest }) => rest);
        setTransferring(true);
        const url = `${TRANSFER_P100_LEADS}?associateId=${formState.toAssociateSelect.value}&loginId=${userId}`;

        ApiClient.post(url, payload)
            .then((response) => {
                setTransferring(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message || 'Leads transferred successfully');
                    // Refresh the list so transferred leads disappear
                    getLeadsData();
                } else {
                    toast.error(response?.data?.message || 'Failed to transfer');
                }
            })
            .catch((error) => {
                setTransferring(false);
                toast.error(error.message || 'Network error');
            });
    };

    // ── Columns ─────────────────────────────────────────────────────────────
    const columns = useMemo(() => [
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
                    checked={!!row.isChecked}
                    onChange={() => handleCheckboxChange(row.id)}
                />
            ),
            width: '4%',
        },
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, i) => i + 1,
            width: '6%',
        },
        {
            name: <span className="font-weight-bold fs-13">Lead Name</span>,
            selector: (row) => row.leadName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.leadName || '—'}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Lead Mobile</span>,
            selector: (row) => row.leadMobile,
            cell: (row) => (
                <div className="phone-container">
                    <MdMobileFriendly className="phone-icon" color={defaultTheme.goldColorLogo} />
                    <span className="phone-number">{row.leadMobile || '—'}</span>
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Sub Team</span>,
            selector: (row) => row.subTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.subTeam}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Branch</span>,
            selector: (row) => row.branch,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.branch || '—'}</WordWrapCell>,
        },
    ], [selectAllChecked, rowData]);

    // ── Access check ────────────────────────────────────────────────────────
    useEffect(() => {
        const checkAccess = async () => {
            if (role !== USER_TYPE.ASSOCIATE) {
                const hasAccess = await CheckUserAccess(userId, 'lead-transfer');
                setAccessGranted(hasAccess);
            } else {
                setAccessGranted(true);
            }
        };
        checkAccess();
    }, [userId, role]);

    if (accessGranted === null) return <ScreenLoader />;
    if (!accessGranted) return <PermissionMissing />;

    const selectedCount = rowData.filter((r) => r.isChecked).length;

    return (
        <PageContent>
            <Breadcrumbs title="Transfer" breadcrumbItem="P100 Leads" />
            {(pending || transferring || isLoading) && <ScreenLoader />}

            <Container fluid>
                <Card>
                    <CardBody>
                        <h3 style={{
                            fontSize: 12, fontWeight: 'bold',
                            color: defaultTheme.redColor, marginBottom: 10,
                        }}>
                            Note: Select an associate to load their P100 leads, then choose individual leads or select all to transfer them to another associate.
                        </h3>

                        <Row className="g-3">
                            <Col lg="4">
                                <h6 className="font-size-11">Select Associate (From)</h6>
                                <Select
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                                    isClearable
                                    value={formState.associateSelect}
                                    onChange={(opt) => handleSelectChange('associateSelect', opt)}
                                    options={Array.isArray(associateList?.data?.data) ? associateList.data.data : []}
                                    placeholder="Choose associate…"
                                />
                            </Col>

                            <Col lg="1" className="d-flex align-items-end justify-content-center">
                                <Button color="primary" onClick={handleShowData}>Show</Button>
                            </Col>

                            <Col lg="4">
                                <h6 className="font-size-11">To Associate</h6>
                                <Select
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                                    isClearable
                                    value={formState.toAssociateSelect}
                                    onChange={(opt) => handleSelectChange('toAssociateSelect', opt)}
                                    options={
                                        Array.isArray(associateList?.data?.data)
                                            ? associateList.data.data.filter(
                                                (o) => o.value !== formState.associateSelect?.value
                                            )
                                            : []
                                    }
                                    placeholder="Choose target associate…"
                                />
                            </Col>

                            <Col lg="3" className="d-flex align-items-end justify-content-start">
                                <Button color="secondary" onClick={handleTransferData} disabled={transferring}>
                                    {transferring ? 'Transferring…' : `Transfer${selectedCount > 0 ? ` (${selectedCount})` : ''}`}
                                </Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                {rowData?.length > 0 && (
                    <>
                        {/* Quick selection summary */}
                        <div style={{
                            background: '#fff',
                            border: '1px solid #E8ECF2',
                            borderRadius: 10,
                            padding: '10px 14px',
                            marginBottom: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 10,
                            fontSize: 12.5,
                        }}>
                            <div style={{ color: '#475569', fontWeight: 600 }}>
                                Total: <span style={{ color: defaultTheme.primary, fontWeight: 800 }}>{totalElements}</span>
                                {selectedCount > 0 && (
                                    <>
                                        {' · Selected: '}
                                        <span style={{ color: '#16A34A', fontWeight: 800 }}>{selectedCount}</span>
                                    </>
                                )}
                            </div>
                            {rowData.length > 0 && (
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectAllChange()}
                                        style={{
                                            padding: '5px 12px',
                                            fontSize: 11.5,
                                            fontWeight: 700,
                                            background: '#F1F5F9',
                                            color: '#475569',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: 7,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {selectAllChecked ? 'Unselect All' : 'Select All'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <AppTable
                            progressPending={pending}
                            columns={columns}
                            data={rowData}
                            pagination
                            paginationPerPage={100}
                        />
                    </>
                )}
            </Container>
        </PageContent>
    );
}