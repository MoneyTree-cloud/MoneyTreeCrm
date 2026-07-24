import { useEffect, useState } from "react";
import { Container } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useGet } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { formatDate, formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import PageContent from "../../components/Common/PageContent";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { GET_ALL_BUILDER_RM_DETAILS } from "../../helpers/url_helper";
import { MdEmail, MdMobileFriendly } from "react-icons/md";
import { defaultTheme } from "../../helpers/defaultTheme";
import { FiPlus } from "react-icons/fi";
import { htmlBaseURL } from "../../helpers/api_helper";

const BuilderRMDetailsData = () => {
    const userId = useUserStore((state) => state.user.userId);
    const [accessGranted, setAccessGranted] = useState(null);

    const { data: builderRmData, isLoading } = useGet(GET_ALL_BUILDER_RM_DETAILS, { enabled: !!accessGranted });

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, i) => i + 1,
            width: "5%"
        },
        {
            name: <span className="font-weight-bold fs-13">Company Name</span>,
            selector: (row) => row?.companyName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.companyName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Name</span>,
            selector: (row) => row?.name,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.name}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Designation</span>,
            selector: (row) => row?.designation,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.designation}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Mobile</span>,
            selector: (row) => row?.mobile,
            cell: (row) => (
                <WordWrapCell>
                    {row?.mobile ? (
                        <div className="phone-container">
                            <MdMobileFriendly
                                className="phone-icon"
                                color={defaultTheme.goldColorLogo}
                            />
                            <span className="phone-number">{row.mobile}</span>
                        </div>
                    ) : (
                        "-"
                    )}
                </WordWrapCell>
            )
        },
        {
            name: <span className="font-weight-bold fs-13">Email</span>,
            selector: (row) => row?.email,
            cell: (row) =>
                <WordWrapCell>
                    {row?.email ? <div className="phone-container">
                        <MdEmail
                            className="phone-icon"
                            color={defaultTheme.goldColorLogo}
                        />
                        <span className="phone-number">{row.email}</span>
                    </div> : '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Birthday</span>,
            selector: (row) => row?.birthday,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row?.birthday)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Spouse Name</span>,
            selector: (row) => row?.spouseName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.spouseName || '—'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Spouse Birthday</span>,
            selector: (row) => row?.spouseBirthday,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row?.spouseBirthday) || '—'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Marriage Anniversary Date</span>,
            selector: (row) => row?.marriageAnniversaryDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDate(row?.marriageAnniversaryDate) || '—'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Address</span>,
            selector: (row) => row?.address,
            sortable: true,
            cell: (row) => <WordWrapCell>{row?.address || '—'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Childrens</span>,
            selector: (row) => row?.children?.length || 0,
            sortable: true,
            cell: (row) => {
                const kids = Array.isArray(row?.children) ? row.children : [];
                if (kids.length === 0) {
                    return <WordWrapCell><span style={{ color: '#94A3B8' }}>—</span></WordWrapCell>;
                }
                return (
                    <WordWrapCell>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {kids.map((c, idx) => (
                                <div key={c.id ?? idx} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                    <span style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: defaultTheme.goldColorLogo,
                                        background: '#FEF3C7',
                                        padding: '1px 6px',
                                        borderRadius: 9,
                                        flexShrink: 0,
                                    }}>
                                        #{idx + 1}
                                    </span>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 12 }}>
                                            {c.childName || '—'}
                                        </div>
                                        <div style={{ fontSize: 10.5, color: '#94A3B8' }}>
                                            {c.childBirthday ? formatDate(c.childBirthday) : '—'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </WordWrapCell>
                );
            },
        },
        {
            name: <span className="font-weight-bold fs-13">Created At</span>,
            selector: (row) => row?.createdDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row?.createdDate)}</WordWrapCell>
        }
    ];

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'rm-details-data');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Container fluid={true}>
                {(isLoading) && <ScreenLoader />}

                <Breadcrumbs title="Builder RM Details" breadcrumbItem="Builder RM Data" />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>

                    {/* Add Button */}
                    <button
                        onClick={() => window.open(`${htmlBaseURL}/rm-registration-form.html`, "_blank")}
                        style={{
                            borderRadius: "50%",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(59,130,246,.3)",
                            marginBottom: '10px'
                        }}
                    >
                        <FiPlus size={20} title="Add Data" />
                    </button>
                </div>
                <AppTable
                    columns={columns}
                    progressPending={isLoading}
                    data={
                        Array.isArray(builderRmData?.data?.data)
                            ? builderRmData?.data?.data
                            : []
                    }
                    pagination
                />
            </Container>
        </PageContent>
    );
};

export default BuilderRMDetailsData;