import { useEffect, useState } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDate, WordWrapCell } from "../../helpers/function_helper";
import { GET_ALL_SALES_TARGET_NEW } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css"; // Import your CSS file
import { useNavigate } from "react-router-dom";
import PageContent from "../../components/Common/PageContent";
import { FaArrowAltCircleRight } from "react-icons/fa";
import PermissionMissing from "../Utility/PermissonMissing";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import { useUserStore } from "../../store/useUserStore";
import { decryptData } from "../../components/Common/CryptoUtils";
import DOMPurify from "dompurify";

export default function SalesTarget() {
  const navigation = useNavigate();
  const [expandedRows, setExpandedRows] = useState({});
  const [accessGranted, setAccessGranted] = useState(null);
  const userId = useUserStore((state) => state.user.userId);
  const [targetData, setTargetData] = useState([]);
  const { data, isLoading } = useGet(GET_ALL_SALES_TARGET_NEW, { enabled: !!accessGranted });

  useEffect(() => {
    if (data?.data?.status === 1) {
      decryptData(data?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setTargetData(decryptedData);
        } else {
          setTargetData([])
        }
      });
    }
  }, [data]);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'sales-target-report');
      setAccessGranted(hasAccess);
    };
    checkAccess();
  }, [userId]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "5%",
    },
    {
      name: <span className="font-weight-bold fs-13">Builder</span>,
      selector: (row) => row.builderName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.builderName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Project</span>,
      selector: (row) => row.projectName,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.projectName}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Target Type</span>,
      selector: (row) => row.targetType,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.targetType}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">From Date</span>,
      selector: (row) => row.fromDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDate(row.fromDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">To Date</span>,
      selector: (row) => row.toDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDate(row.toDate)}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Total Target</span>,
      selector: (row) => row.totalTarget,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.targetType === 'Turnover' ? row.totalTarget + ' Cr.' : row.totalTarget}</WordWrapCell>
    },
    {
      name: <span className="font-weight-bold fs-13">Description</span>,
      selector: (row) => row.remarks,
      sortable: true,
      width: "20%",
      cell: (row, index) => {
        const isExpanded = expandedRows[index] || false; // Check if the current row is expanded

        const sanitizedDescription = row.remarks
          ? row.remarks.replace(/(\r\n|\n|\r)/g, "<br /><br />")
          : "";

        const truncatedDescription = sanitizedDescription.length > 100 ? sanitizedDescription.substring(0, 100) + '...' : sanitizedDescription;

        const toggleDescription = () => {
          setExpandedRows((prevState) => ({
            ...prevState,
            [index]: !isExpanded, // Toggle the expanded state for the current row
          }));
        };

        return (
          <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
            {/* <div
              dangerouslySetInnerHTML={{
                __html: isExpanded ? sanitizedDescription : truncatedDescription,
              }}
            /> */}
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  isExpanded ? sanitizedDescription : truncatedDescription
                ),
              }}
            />

            {sanitizedDescription.length > 100 && (
              <button
                onClick={toggleDescription} // Toggle function for each row
                style={{
                  background: "none",
                  border: "none",
                  color: defaultTheme.goldColorLogo,
                  fontWeight: "bold",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "inherit",
                  marginTop: "10px",
                }}
              >
                {isExpanded ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
        );
      },
    },
    {
      name: <span className="font-weight-bold fs-13">Show More</span>,
      selector: (row) => (
        <div>
          <FaArrowAltCircleRight
            title="Show Details"
            className="ri-pencil-fill align-bottom me-2"
            onClick={() => {
              navigation("/sales-target-report/sales-target-report-new-details", {
                state: { rowData: row }
              });
            }}
            style={{
              cursor: "pointer",
              color: defaultTheme.primary,
              fontSize: 16,
            }}
          />
        </div>
      ),
    },
  ];

  const handleManageTargetEntry = () => {
    navigation("/sales-target-report/sales-target-entry", {
      state: { rowData: {} },
    });
  };

  if (accessGranted === null) {
    return <ScreenLoader />;
  }

  if (!accessGranted) {
    return <PermissionMissing />
  }

  return (
    <PageContent>
      <Breadcrumbs title="Report" breadcrumbItem="Sales Target" />
      {isLoading && <ScreenLoader />}

      <i
        className="fas fa-plus"
        style={{
          color: defaultTheme.primary,
          cursor: "pointer",
          fontSize: "18px",
          marginBottom: '10px',
        }}
        title="Add Sales Target"
        onClick={handleManageTargetEntry}
      ></i>

      <AppTable
        progressSales={isLoading}
        columns={columns}
        data={targetData}
        pagination
      />

    </PageContent>
  );
}
