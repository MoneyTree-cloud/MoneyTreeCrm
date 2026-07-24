import { useEffect, useState } from 'react'
import AppTable from '../../components/Common/Table';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import { GET_TRADING_WINDOW } from '../../helpers/url_helper';
import { useGet } from '../../Hooks/useApi';
import { formatDateTime, generateTimestamp, WordWrapCell } from '../../helpers/function_helper';
import * as XLSX from "xlsx";
import { defaultTheme } from '../../helpers/defaultTheme';
import { useUserStore } from '../../store/useUserStore';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';

export default function TradingWindowData() {
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'trading-window-report');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const { data: tradingData, isLoading } = useGet(GET_TRADING_WINDOW, { enabled: !!accessGranted });

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            width: "6%",
            selector: (_, index) => index + 1,
        },
        {
            name: <span className="font-weight-bold fs-13">Remarks</span>,
            selector: (row) => row.saleId,
            sortable: true,
            cell: (row) => <WordWrapCell> {row.remarks}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Created By</span>,
            selector: (row) => row.createdByName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.createdByName + ' (' + row.createdBy + ')'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Main Team</span>,
            selector: (row) => row.createdByMainTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.createdByMainTeam}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Sub Team</span>,
            selector: (row) => row.createdBySubTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.createdBySubTeam}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Created Date</span>,
            selector: (row) => row.createdDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row?.createdDate)}</WordWrapCell>
        }
    ]

    const downloadExcel = () => {
        // Ensure the data is not empty
        const tradeData = tradingData?.data?.data;
        if (!Array.isArray(tradeData) || tradeData.length === 0) return;
        // 1. Extract the keys from the first object as the headers
        const headers = Object.keys(tradeData[0]);

        // 2. Convert the data into a format compatible with the Excel file
        const formattedData = tradeData.map((item) => {
            return headers.map((header) => item[header]);
        });

        // 3. Add the headers as the first row in the data
        const finalData = [headers, ...formattedData];

        // 4. Create a worksheet from the final data
        const ws = XLSX.utils.aoa_to_sheet(finalData);

        // 5. Create a workbook and append the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Trading Window Report");

        // 6. Write the file and trigger download
        XLSX.writeFile(wb, `tradingWindowReport_${generateTimestamp()}.xlsx`);
        return;

    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Trading Window" />
            {isLoading && <ScreenLoader />}
            {tradingData?.data?.data?.length > 0 && (
                <i
                    className="fas fa-file-excel"
                    style={{
                        color: defaultTheme.primary,
                        cursor: "pointer",
                        fontSize: "16px",
                        marginBottom: '10px'
                    }}
                    onClick={downloadExcel}
                ></i>
            )}
            <AppTable
                progressPending={isLoading}
                columns={columns}
                data={tradingData?.data?.data || []}
                pagination

            />
        </PageContent>
    );
}
