import { Button } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatTurnOverInCr, WordWrapCell } from "../../helpers/function_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css";
import { useLocation, useNavigate } from "react-router-dom";
import PageContent from "../../components/Common/PageContent";

export default function SalesTargetDetails() {
    const navigation = useNavigate();
    const location = useLocation();
    const { rowData } = location.state || {};
    const isUnitAvailable = rowData?.targetType !== "Turnover";

    const totalMainTeamHeadCount = rowData?.data?.reduce(
        (total, row) => total + (parseFloat(row?.teamCount) || 0),
        0
    );

    const totalTargetTaken = rowData?.data?.reduce((total, row) => {
        return total + (parseFloat(isUnitAvailable ? row?.targetInUnit : row?.targetInCr) || 0);
    }, 0);

    const targetTakenPercentage = rowData?.data?.reduce((total, row) => {
        const expected = (rowData?.totalTarget / totalMainTeamHeadCount) * row?.teamCount;
        const actual = isUnitAvailable ? row?.targetInUnit : row?.targetInCr;
        const percent = expected ? (actual / expected) * 100 : 0;
        return total + (parseFloat(percent?.toFixed(2)) || 0);
    }, 0);

    const targetAsPerTeamTotal = rowData?.data?.reduce((total, row) => {
        const share = ((rowData?.totalTarget / totalMainTeamHeadCount) * row?.teamCount).toFixed(2);
        return total + (parseFloat(share) || 0);
    }, 0);

    const achieveTarget = rowData?.data?.reduce((total, row) => {
        const share = isUnitAvailable
            ? row?.targetAchieved?.toFixed(0)
            : (row?.targetAchieved / 10000000)?.toFixed(2);
        return total + (parseFloat(share) || 0);
    }, 0);

    const percentOfActuals = rowData?.data?.reduce((total, row) => {
        const taken = isUnitAvailable ? row?.targetInUnit : row?.targetInCr;
        const achieved = isUnitAvailable ? row?.targetAchieved : (row?.targetAchieved) / 10000000;
        const percent = taken ? (achieved / taken) * 100 : 0;
        return total + (parseFloat(percent?.toFixed(2)) || 0);
    }, 0);

    const totalRow = {
        mainTeam: "Total",
        teamCount: totalMainTeamHeadCount,
        targetInCr: !isUnitAvailable ? totalTargetTaken?.toFixed(2) : undefined,
        targetInUnit: isUnitAvailable ? totalTargetTaken?.toFixed(0) : undefined,
        targetAchieved: isUnitAvailable ? achieveTarget : achieveTarget.toFixed(2),
        targetAsPerTeam: targetAsPerTeamTotal?.toFixed(2),
        targetTakenPercentage: `${targetTakenPercentage?.toFixed(2)}%`,
        percentOfActuals: `${percentOfActuals?.toFixed(2)}%`
    };

    const dataWithTotal = [...rowData.data, totalRow];

    const goldStyle = { fontWeight: "bold", color: defaultTheme.goldColorLogo };

    const columnsDataTeamWise = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "8%",
            cell: (row, index) => row.mainTeam === "Total" ? null : <div>{index + 1}</div>
        },
        {
            name: <span className="font-weight-bold fs-13">Main Team</span>,
            selector: row => row.mainTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.mainTeam}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Sub Team</span>,
            selector: row => row.subTeam,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.subTeam}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Head Count</span>,
            selector: row => row.teamCount,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.teamCount}</WordWrapCell>
        },
        {
            name: (
                <span className="font-weight-bold fs-13">
                    {isUnitAvailable ? "Target as per Team (In Unit)" : "Target as per Team (In Cr.)"}
                </span>
            ),
            cell: row => {
                const value = row.mainTeam === "Total"
                    ? row.targetAsPerTeam
                    : ((rowData.totalTarget / totalMainTeamHeadCount) * row.teamCount).toFixed(2);
                return <div style={row.mainTeam === "Total" ? goldStyle : {}}>{value ?? '-'}</div>;
            },
        },
        {
            name: (
                <span className="font-weight-bold fs-13">
                    {isUnitAvailable ? "Target Taken (In Unit)" : "Target Taken (In Cr.)"}
                </span>
            ),
            selector: row => isUnitAvailable ? row.targetInUnit : row.targetInCr,
            sortable: true,
            cell: row => {
                const value = isUnitAvailable ? row.targetInUnit : row.targetInCr;
                return <div style={row.mainTeam === "Total" ? goldStyle : {}}>{value != null ? value : '-'}</div>;
            },
        },
        {
            name: <span className="font-weight-bold fs-13">Target Taken %</span>,
            cell: row => {
                if (row.mainTeam === "Total") {
                    return <div style={goldStyle}>{row.targetTakenPercentage}</div>;
                }
                const expected = (rowData.totalTarget / totalMainTeamHeadCount) * row.teamCount;
                const actual = isUnitAvailable ? row.targetInUnit : row.targetInCr;
                const percent = expected && actual != null ? (actual / expected) * 100 : 0;
                return <div>{actual != null ? percent.toFixed(2) + '%' : '-'}</div>;
            },
        },
        {
            name: <span className="font-weight-bold fs-13">Achieved Target</span>,
            selector: row => row.targetAchieved,
            sortable: true,
            cell: row => {
                if (row.mainTeam === "Total") {
                    return <div style={goldStyle}>{row.targetAchieved}</div>;
                }
                if (row.targetAchieved == null) return <div>-</div>;

                const value = isUnitAvailable
                    ? row.targetAchieved
                    : formatTurnOverInCr(row.targetAchieved);
                return <div>{value}</div>;
            },
        },
        {
            name: <span className="font-weight-bold fs-13">% Of Actuals</span>,
            cell: row => {
                if (row.mainTeam === "Total") {
                    return <div style={goldStyle}>{row.percentOfActuals}</div>;
                }
                const taken = isUnitAvailable ? row.targetInUnit : row.targetInCr;
                const achieved = isUnitAvailable ? row.targetAchieved : (row.targetAchieved / 10000000);
                const percent = taken && achieved != null ? (achieved / taken) * 100 : 0;
                return <div>{taken != null && achieved != null ? percent.toFixed(2) + '%' : '-'}</div>;
            },
        }
    ];

    // Optional: use conditional row styling if AppTable supports it
    const conditionalRowStyles = [
        {
            when: row => row.mainTeam === "Total",
            style: {
                fontWeight: "bold",
                color: defaultTheme.goldColorLogo,
                backgroundColor: "#fffaf0",
            },
        },
    ];

    return (
        <PageContent>
            <Breadcrumbs title="Report" breadcrumbItem="Sales Target Details" />

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                    color="secondary"
                    title="Back to Sales Target"
                    type="button"
                    style={{
                        backgroundColor: defaultTheme.primary,
                        marginBottom: "5px",
                    }}
                    onClick={() => navigation(-1)}
                >
                    ← Back
                </Button>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1rem",
                    backgroundColor: "#f9f9f9",
                    padding: "1rem",
                    borderRadius: "5px",
                    boxShadow: "0 2px 2px rgba(0, 0, 0, 0.1)",
                }}
            >
                <div><strong>Builder:</strong> {rowData.builderName}</div>
                <div><strong>Project:</strong> {rowData.projectName}</div>
                <div><strong>Total Target:</strong> {rowData.targetType === 'Turnover' ? rowData.totalTarget + " Cr." : rowData.totalTarget}</div>
                <div><strong>Target Type:</strong> {rowData.targetType}</div>
            </div>

            <AppTable
                columns={columnsDataTeamWise}
                data={dataWithTotal}
                pagination
                conditionalRowStyles={conditionalRowStyles}
            />

        </PageContent>
    );
}