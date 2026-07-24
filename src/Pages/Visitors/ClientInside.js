/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import { Container } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { GET_ALL_CUSTOMER_VISIT_DATA, SEND_REQUEST_TO_MAIN_TL } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import ScreenLoader from "../../constants/ScreenLoader";
import { defaultTheme } from "../../helpers/defaultTheme";
import "../CSS/styles.css";
import PageContent from "../../components/Common/PageContent";
import { FaArrowAltCircleRight, FaCheck, FaClock, FaTimes } from "react-icons/fa";
import { useUserStore } from "../../store/useUserStore";
import { toast } from "react-toastify";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import ApiClient from "../../helpers/api_helper";

const ClientInside = () => {
  const userId = useUserStore((state) => state.user.userId);
  const LIMIT = 100;
  const [page, setPage] = useState(1);
  const [apiUrl, setApiUrl] = useState("");
  const todayDate = new Date().toISOString().slice(0, 10);
  const [accessGranted, setAccessGranted] = useState(null);
  const [customerData, setCustomerData] = useState([]);
  const [isPending, setIsPending] = useState(false);

  const buildApiUrl = (todayDate, offset) =>
    `${GET_ALL_CUSTOMER_VISIT_DATA}${todayDate}&todate=${todayDate}&offset=${offset}&limit=${LIMIT}`;

  const { data, isLoading, refetch: getAllData } = useGet(apiUrl, { enabled: Boolean(apiUrl && accessGranted) });

  useEffect(() => {
    if (accessGranted) {
      setApiUrl(buildApiUrl(todayDate, 0));
    }
  }, [todayDate, accessGranted]);

  useEffect(() => {
    if (data?.data?.status === 1) {
      decryptData(data?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setCustomerData(decryptedData);
        } else {
          setCustomerData([]);
        }
      });
    }
  }, [data]);

  const handleAssignToMT = (row) => {
    if (!window.confirm("Are you sure you want to assign this to the Main TL?")) return
    setIsPending(true)
    ApiClient.post(
      `${SEND_REQUEST_TO_MAIN_TL}${row?.visitId}&empId=${userId}`,
    )
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          getAllData()
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message);
      });
  }

  const columns = useMemo(
    () => [
      {
        name: <span className="font-weight-bold fs-13">SL No.</span>,
        selector: (_, i) => i + 1,
        width: "6%",
      },
      {
        name: <span className="font-weight-bold fs-13">Assign To MT</span>,
        width: "10%",
        selector: (row) => (
          <div>
            <FaArrowAltCircleRight
              cursor={'pointer'}
              size={16}
              style={{
                cursor: row.entryStatus ? 'not-allowed' : 'pointer',
                opacity: row.entryStatus ? 0.5 : 1,
              }}
              title={!row.entryStatus ? 'Send To Mail TL' : row?.entryStatus}
              className="text-primary"
              onClick={() => {
                if (row.entryStatus) return;
                handleAssignToMT(row)
              }}
            />
          </div>
        ),
      },
      {
        name: <span className="font-weight-bold fs-13">Status</span>,
        selector: (row) => row?.entryStatus,
        width: "7%",
        cell: (row) => (
          <WordWrapCell>
            {
              row?.entryStatus === 'Approved' ? (
                <FaCheck
                  color={defaultTheme.primary}
                  size={16}
                  title="Accepted"
                />
              ) : row?.entryStatus === 'Rejected' ? (
                <FaTimes
                  color={defaultTheme.redColor}
                  size={16}
                  title="Rejected"
                />
              ) : row?.entryStatus === 'Pending' ? (
                <FaClock
                  color={defaultTheme.btnEnable}
                  size={16}
                  title="Pending"
                />
              ) : (
                '-'
              )
            }
          </WordWrapCell>
        ),
      },
      {
        name: <span className="font-weight-bold fs-13">Assigned Date & Time</span>,
        selector: (row) => row?.requestDate,
        sortable: true,
        width: "16%",
        cell: (row) => <WordWrapCell>{formatDateTime(row?.requestDate)}</WordWrapCell>
      },
      {
        name: <span className="font-weight-bold fs-13">Updated Date & Time</span>,
        selector: (row) => row?.statusUpdateDate,
        sortable: true,
        width: "16%",
        cell: (row) => <WordWrapCell>{formatDateTime(row?.statusUpdateDate)}</WordWrapCell>,
      },
      {
        name: <span className="font-weight-bold fs-13">Meeting With</span>,
        selector: (row) => row.associateId,
        sortable: true,
        width: "18%",
        cell: (row) => <WordWrapCell>{`${row.associateName} (${row.associateCode})`}</WordWrapCell>,
      },
      {
        name: <span className="font-weight-bold fs-13">Name</span>,
        selector: (row) => row.name,
        sortable: true,
        width: "15%",
        cell: (row) => <WordWrapCell>{row.name}</WordWrapCell>,
      },
      {
        name: <span className="font-weight-bold fs-13">Type</span>,
        selector: (row) => row.visitorType,
        width: "12%",
        sortable: true,
        cell: (row) => <WordWrapCell>{row.visitorType}</WordWrapCell>,
      },
    ],
    []
  );

  useEffect(() => {
    if (page > 1) {
      setApiUrl(buildApiUrl(todayDate, page - 1));
    }
  }, [page]);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'client-inside-history');
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
      <Breadcrumbs title="Visitor" breadcrumbItem="History" />
      {(isLoading || isPending) && <ScreenLoader />}
      <Container fluid>
        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={
            (customerData?.content || []).filter(
              item => item.createdBy === "Office Noida(20001)"
            )
          }
          paginationTotalRows={customerData?.totalElements}
          paginationServer
          onChangePage={setPage}
          pagination
        />
      </Container>
    </PageContent>


  );
};

export default ClientInside;