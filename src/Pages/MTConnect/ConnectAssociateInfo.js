import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useGet } from "../../Hooks/useApi";
import { GET_ASSOCIATE_CONNECT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import "../CSS/styles.css";
import PageContent from "../../components/Common/PageContent";
import { MdMobileFriendly } from "react-icons/md";
import { useUserStore } from "../../store/useUserStore";
import { useNavigate } from "react-router-dom";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { toast } from "react-toastify";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function ConnectAssociateInfo() {
  const userId = useUserStore((state) => state.user.userId);
  const navigation = useNavigate()
  const[connectAssociateList, setConnectAssociateList] = useState([]);
  const { data, isLoading } = useGet(GET_ASSOCIATE_CONNECT + userId);

  useEffect(() => {
    if (data?.data?.status === 1) {
      decryptData(data?.data?.data).then((decryptedData) => {
        if (decryptedData) {
          setConnectAssociateList(decryptedData);   
        } else {
          setConnectAssociateList([])
        }
      });
    }
  }, [data]);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      sortable: true,
      width: "8%",
      selector: (row, index) => index + 1,
      cell: (row, index) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {index + 1}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Connect Details</span>,
      sortable: true,
      selector: (row) => row.customerName,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.customerName + ' (' + row.customerId + ')'}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Connect Mobile</span>,
      selector: (row) => row.customerMobile,
      sortable: true,
      cell: (row) => (
        <div className="phone-container">
          <MdMobileFriendly
            className="phone-icon"
            color={defaultTheme.goldColorLogo}
          />
          <span className="phone-number">{row.customerMobile}</span>
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">No. Of Leads</span>,
      sortable: true,
      selector: (row) => row.count,
      cell: (row) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          {row.count}
        </div>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Details Of Leads</span>,
      selector: (row) => (
        <div>
          <FaArrowAltCircleRight
            className="ri-pencil-fill"
            onClick={() => handleNavigation(row)}
            style={{
              cursor: "pointer",
              color: defaultTheme.primary,
              fontSize: 18,
            }}
          />
        </div>
      ),
      sortable: true,
    },
  ];

  const handleNavigation = (row) => {
    if (row.count !== 0) {
      navigation('/connect-associate-info/connect-associate-lead-info', { state: { customerId: row.customerId } })
    }
    else {
      toast.error('No leads available for this connect.')
    }
  }

  return (
    <PageContent>
      <Breadcrumbs title="Connect" breadcrumbItem="Information" />
      {(isLoading) && <ScreenLoader />}
      <Container fluid={true}>

        <AppTable
          columns={columns}
          data={Array.isArray(connectAssociateList) ? connectAssociateList : []}
          pagination
          progressPending={isLoading}
        />
      </Container>
    </PageContent>
  );
}
