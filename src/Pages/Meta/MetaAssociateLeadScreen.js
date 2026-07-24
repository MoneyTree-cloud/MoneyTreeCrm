/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AppTable from '../../components/Common/Table';
import { ASSOCIATE_FB_LEADS } from '../../helpers/url_helper';
import { facebookApiClient } from '../../helpers/api_helper';
import { toast } from 'react-toastify';
import ScreenLoader from '../../constants/ScreenLoader';
import { WordWrapCell } from '../../helpers/function_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { useUserStore } from '../../store/useUserStore';
import { MdOutlineFindInPage } from 'react-icons/md';
import { decryptData } from '../../components/Common/CryptoUtils';

export default function MetaAssociateLeadScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const empCode = useUserStore((state) => state.user.empCode);
  const [leadList, setLeadList] = useState([]);

  useEffect(() => {
    fetchLeadList();
  }, []);

  const fetchLeadList = () => {
    facebookApiClient.get(ASSOCIATE_FB_LEADS + empCode)
      .then((response) => {
        setIsLoading(false);
        if (response?.data?.statusCode === 1) {
          const encryptedContent = response.data.data;
          decryptData(encryptedContent).then((decrypted) => {
            setLeadList(decrypted);
          }).catch((error) => {
            setLeadList([]);
          });
        } else if (response.data.message !== 'No record found.') {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        toast.error(error.message);
      });
  };

  const columns = [
    {
      name: 'SL No.',
      selector: (_, index) => index + 1,
      width: '10%',
    },
    {
      name: 'Campaign Name',
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.name}</WordWrapCell>,
      width: '55%',
    },
    {
      name: 'Lead Count',
      selector: (row) => row.leadsCount || 0,
      cell: (row) => <WordWrapCell>{row.leadsCount}</WordWrapCell>,
      width: '20%',
      sortable: true,
    },
    {

      name: 'View Leads',
      width: '15%',
      cell: row => (
        <a
          href={`/meta-associate-leads/leads-details/${row.id}?name=${encodeURIComponent(row.name)}`}
          style={{
            color: defaultTheme.btnEnable,
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >
          View Leads →
        </a>
      )
    }
  ];

  return (
    <PageContent>
      <Breadcrumbs title="Meta" breadcrumbItem="Campaigns" />
      {isLoading && <ScreenLoader />}
      <Container fluid>
        {leadList && leadList.length > 0 ? (
          <AppTable
            progressPending={isLoading}
            columns={columns}
            data={leadList}
            pagination
          />
        ) : (
          !isLoading && (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#6c757d' }}>
              <MdOutlineFindInPage size={80} color={defaultTheme.redColor} style={{ marginBottom: '20px' }} />
              <h4>No Campaigns Found</h4>
            </div>
          )
        )}
      </Container>
    </PageContent>
  );
}
