/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Label } from 'reactstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { FaUsers, FaSearch, FaInbox } from 'react-icons/fa';

import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient from '../../helpers/api_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { useUserStore } from '../../store/useUserStore';
import {
    GET_MY_ALL_TEAM,       // ★ add: user/management/getAllTeamById?associateId=
    GET_P100_LEADS,           // ★ existing: lead/personal-leads/get?
} from '../../helpers/url_helper';
import { decryptData } from '../../components/Common/CryptoUtils';

const RS_STYLES = {
    control: (b) => ({
        ...b,
        minHeight: '38px',
        borderColor: '#101111',
        borderWidth: '1.5px',
        borderRadius: '9px',
        fontSize: '13.5px',
    }),
    menuPortal: (b) => ({ ...b, zIndex: 9999 }),
};

export default function P100TeamLeadsViewer() {
    const { userId } = useUserStore((s) => s.user) || {};
    const [teamOptions, setTeamOptions] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [totalElements, setTotalElements] = useState(0);
    const [isTeamLoading, setIsTeamLoading] = useState(false);
    const [isLeadsLoading, setIsLeadsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [leadInfo, setLeadInfo] = useState(null);

    // ── Fetch team members on mount ─────────────────────────────────────────
    useEffect(() => {
        if (!userId) return;
        setIsTeamLoading(true);
        ApiClient.get(`${GET_MY_ALL_TEAM}${userId}`)
            .then((response) => {
                setIsTeamLoading(false);
                if (response?.data?.status === 1) {
                    setTeamOptions(Array.isArray(response.data.data) ? response.data.data : []);
                } else {
                    setTeamOptions([]);
                    toast.error(response?.data?.message || 'Failed to load team members');
                }
            })
            .catch((error) => {
                setIsTeamLoading(false);
                setTeamOptions([]);
                toast.error(error.message);
            });
    }, [userId]);

    // ── Fetch leads for selected member ─────────────────────────────────────
    const fetchLeads = () => {
        if (!selectedMember) {
            return toast.error('Please select a team member first');
        }
        setIsLeadsLoading(true);
        setHasSearched(true);

        ApiClient.get(`${GET_P100_LEADS}&associateId=${selectedMember.value}`)
            .then((response) => {
                setIsLeadsLoading(false);
                if (response?.data?.status === 1) {
                    decryptData(response?.data?.data)
                        .then((decrypted) => {
                            setLeadInfo(decrypted.content[0])
                            setTotalElements(decrypted?.totalElements || 0);
                        })
                        .catch(() => {
                            setLeadInfo(null)
                            setTotalElements(0)
                        });
                } else {
                    setTotalElements(0);
                    setLeadInfo(null);
                    toast.error(response?.data?.message || 'Failed to load leads');
                }
            })
            .catch((error) => {
                setIsLeadsLoading(false);
                setTotalElements(0);
                setLeadInfo(null);
                toast.error(error.message);
            });
    };

    const handleReset = () => {
        setSelectedMember(null);
        setTotalElements(0);
        setLeadInfo(null);
        setHasSearched(false);
    };


    return (
        <PageContent>
            <Breadcrumbs title="Team Section" breadcrumbItem="Team Leads" />
            {(isTeamLoading || isLeadsLoading) && <ScreenLoader />}

            <Container fluid>
                {/* ── Filter card ────────────────────────────────────────── */}
                <Card>
                    <CardBody>
                        <h6 style={{
                            fontSize: 13, fontWeight: 700, color: defaultTheme.primary,
                            marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <FaUsers size={13} /> View Leads by Team Member
                        </h6>

                        <Row className="g-3 align-items-end">
                            <Col md="6">
                                <Label className="form-label">Select Team Member</Label>
                                <Select
                                    value={selectedMember}
                                    onChange={setSelectedMember}
                                    options={teamOptions}
                                    isClearable
                                    isLoading={isTeamLoading}
                                    placeholder={isTeamLoading ? 'Loading team…' : 'Choose a team member…'}
                                    styles={RS_STYLES}
                                    menuPortalTarget={document.body}
                                    noOptionsMessage={() => 'No team members found'}
                                />
                            </Col>
                            <Col md="6" className="d-flex gap-2">
                                <Button
                                    color="primary"
                                    onClick={fetchLeads}
                                    disabled={!selectedMember || isLeadsLoading}
                                    style={{
                                        backgroundColor: defaultTheme.primary,
                                        border: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                    }}
                                >
                                    <FaSearch size={11} />
                                    {isLeadsLoading ? 'Loading…' : 'Show Leads'}
                                </Button>
                                <Button
                                    color="secondary"
                                    onClick={handleReset}
                                    disabled={isLeadsLoading}
                                >
                                    Reset
                                </Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                {/* ── Total count strip (only shown after a search) ──────── */}
                {hasSearched && (
                    <div
                        style={{
                            background: '#fff',
                            border: '1px solid #E8ECF2',
                            borderRadius: 14,
                            marginBottom: 18,
                            padding: '18px 22px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 20,
                            boxShadow: '0 1px 4px rgba(0,0,0,.04)',
                        }}
                    >
                        {/* Left Side */}
                        <div>
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: '#94A3B8',
                                    textTransform: 'uppercase',
                                    marginBottom: 10,
                                }}
                            >
                                Team Information
                            </div>

                            <div className="d-flex flex-wrap gap-4">
                                <div>
                                    <small className="text-muted d-block">Branch</small>
                                    <strong>{leadInfo?.branch || '-'}</strong>
                                </div>

                                <div>
                                    <small className="text-muted d-block">MT / ST</small>
                                    <strong>{leadInfo?.mainTeam ? leadInfo?.mainTeam + '/' + leadInfo?.subTeam : '-'}</strong>
                                </div>

                            </div>

                            {selectedMember && (
                                <div
                                    style={{
                                        marginTop: 10,
                                        fontSize: 12,
                                        color: '#64748B',
                                    }}
                                >
                                    Member:{" "}
                                    <span
                                        style={{
                                            color: defaultTheme.primary,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {selectedMember.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right Side */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                            }}
                        >
                            <div
                                style={{
                                    width: 55,
                                    height: 55,
                                    borderRadius: 14,
                                    background: `linear-gradient(135deg, ${defaultTheme.primary}, #007A6E)`,
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 20,
                                }}
                            >
                                <FaInbox />
                            </div>

                            <div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: '#94A3B8',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Total Leads
                                </div>

                                <div
                                    style={{
                                        fontSize: 32,
                                        fontWeight: 800,
                                        color: defaultTheme.primary,
                                        lineHeight: 1.1,
                                    }}
                                >
                                    {totalElements.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </PageContent>
    );
}