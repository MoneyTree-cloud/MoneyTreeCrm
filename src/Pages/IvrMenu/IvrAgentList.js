import { useCallback, useEffect, useState } from 'react'
import { GET_ALL_IVR_AGENTS, UPDATE_IVR_AGENT } from '../../helpers/url_helper';
import { useGet } from '../../Hooks/useApi';
import AppTable from '../../components/Common/Table';
import ScreenLoader from '../../constants/ScreenLoader';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import PageContent from '../../components/Common/PageContent';
import { formatDateTime, generateTimestamp, WordWrapCell } from '../../helpers/function_helper';
import { MdMobileFriendly } from 'react-icons/md';
import { defaultTheme } from '../../helpers/defaultTheme';
import Switch from "react-switch";
import ApiClient from '../../helpers/api_helper';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { decryptData } from '../../components/Common/CryptoUtils';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import { useUserStore } from '../../store/useUserStore';
import * as XLSX from 'xlsx';

export default function IvrAgentList() {
    const navigation = useNavigate();
    const [ivrAgents, setIvrAgents] = useState([]);
    const userId = useUserStore((state) => state.user.userId);
    const [accessGranted, setAccessGranted] = useState(false);
    const { data, isLoading, refetch: getAllAgents } = useGet(GET_ALL_IVR_AGENTS, { enabled: Boolean(accessGranted) });

    useEffect(() => {
        if (data?.data?.status === 1) {
            decryptData(data?.data?.data).then((decryptedData) => {
                if (decryptedData) {
                    setIvrAgents(decryptedData);
                } else {
                    setIvrAgents([])
                }
            });
        }
    }, [data]);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'ivr-agent-list');
            setAccessGranted(hasAccess);
        };

        checkAccess();
    }, [userId]);

    const iconStyle = {
        color: defaultTheme.primary,
        cursor: "pointer",
        fontSize: "18px",
        marginBottom: "10px",
    };

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "6%",
            cell: (_, index) => <WordWrapCell>{index + 1}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Name</span>,
            sortable: true,
            selector: (row) => row.agentName,
            cell: (row) => <WordWrapCell>{row.agentName}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Emp Code</span>,
            sortable: true,
            selector: (row) => row.employeeCode,
            cell: (row) => <WordWrapCell>{row.employeeCode}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Mobile No.</span>,
            selector: (row) => row.agentMobile,
            cell: (row) => (
                <div className="phone-container">
                    <MdMobileFriendly
                        className="phone-icon"
                        color={defaultTheme.goldColorLogo}
                    />
                    <span className="phone-number">{row.agentMobile}</span>
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">MT/ST</span>,
            sortable: true,
            selector: (row) => row.mainTeam,
            cell: (row) => <WordWrapCell>{row.mainTeam + '/' + row.steam}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Branch</span>,
            sortable: true,
            selector: (row) => row.branch,
            cell: (row) => <WordWrapCell>{row.branch}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
            sortable: true,
            selector: (row) => row.doj,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdAt)}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            cell: (row) => (
                <Switch
                    checked={row.agentStatus === "enabled"}
                    offColor={defaultTheme.goldColorLogo}
                    onColor={defaultTheme.primary}
                    height={20}
                    width={40}
                    onChange={() => handleSwitchChange(row)}
                />
            ),
        },
    ];

    const handleSwitchChange = useCallback((row) => {
        ApiClient.post(`${UPDATE_IVR_AGENT}?mobile=${row.agentMobile}&name=${row.agentName}&email=${row.agentEmail}&agentId=${row.agentId}&enabled=${row.agentStatus === "enabled" ? 0 : 1}&empCode=${row.employeeCode}`)
            .then(function (response) {
                if (response?.data?.status === 1) {
                    toast.success('Status changed successfully');
                    getAllAgents();
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                toast.error(error.message);
            });
    }, [getAllAgents]);

    const handleManageAgent = (row) => {
        navigation('/ivr-agent-list/add-update-agent', { state: { rowData: row } });
    }
    const enabledCount = ivrAgents.filter(agent => agent.agentStatus === "enabled").length;
    const disabledCount = ivrAgents.filter(agent => agent.agentStatus === "disabled").length;


    const downloadAgentsExcel = () => {
        // Ensure the data is not empty
        if (!Array.isArray(ivrAgents) || ivrAgents.length === 0) return;

        // 1. Define the fields you want to include and map them
        const transformedData = ivrAgents.map((item) => {
            return {
                'Agent Name': item.agentName,
                'Agent Emp Code': item.employeeCode,
                'Agent Mobile': item.agentMobile,
                'Agent Status': item.agentStatus === 'enabled' ? 'Active' : 'Inactive',
                'Main Team': item.mainTeam || 'N/A',
                'Sub Team': item.steam || 'N/A',
                'Branch': item.branch,
            };
        });

        // 2. Extract headers from the transformed data (this will be the keys of the transformedData objects)
        const headers = Object.keys(transformedData[0]);

        // 3. Convert the transformed data into a format compatible with Excel (using the headers)
        const formattedData = transformedData.map((item) => headers.map((header) => item[header]));

        // 4. Add the headers as the first row in the data
        const finalData = [headers, ...formattedData];

        // 5. Create a worksheet from the final data
        const ws = XLSX.utils.aoa_to_sheet(finalData);

        // 6. Create a workbook and append the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "IVR Agents Report");

        // 7. Write the file and trigger download with a dynamic file name based on the project select label and timestamp
        const fileName = `ivrAgentsReport_${generateTimestamp()}.xlsx`;
        XLSX.writeFile(wb, fileName);

        return;
    }

    return (
        <PageContent>
            <Breadcrumbs title="IVR" breadcrumbItem="Agents List" />
            {(isLoading) && <ScreenLoader />}
            <div
                className="d-flex align-items-center justify-content-between"
                style={{ marginLeft: "20px", gap: "20px" }}
            >
                <div style={{ display: "flex", gap: "1rem" }}>
                    <i
                        className="fas fa-plus"
                        style={iconStyle}
                        title="Add Agent"
                        onClick={() => handleManageAgent()}
                    />
                    <i
                        title="Excel Download"
                        className="fas fa-file-excel"
                        style={iconStyle}
                        onClick={downloadAgentsExcel}
                    />
                </div>

                <div style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
                    <div><strong style={{ color: defaultTheme.btnEnable }}>Total:</strong> {ivrAgents?.length}</div>
                    <div><strong style={{ color: defaultTheme.primary }}>Active:</strong> {enabledCount}</div>
                    <div><strong style={{ color: defaultTheme.redColor }}>Inactive:</strong> {disabledCount}</div>
                </div>
            </div>


            <AppTable
                progressPending={isLoading}
                columns={columns}
                data={ivrAgents || []}
                pagination
                conditionalRowStyles={[
                    {
                        when: (row) => row.isActive === "NO",
                        style: { color: defaultTheme.redColor, fontWeight: 'bold' },
                    },
                ]}
            />
        </PageContent>
    );
}
