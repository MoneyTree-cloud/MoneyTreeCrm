import { Container } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet } from "../../Hooks/useApi";
import { PROSPECTS_COUNT_PER_ASSOCIATE } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";

function ProspectList() {
  const { data: prospectData, isLoading } = useGet(PROSPECTS_COUNT_PER_ASSOCIATE);

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "10%",
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Id</span>,
      selector: (row) => row.assoId,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Name</span>,
      selector: (row) => row.assoName,
      sortable: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Total Prospects</span>,
      selector: (row) => row.prosCount,
      sortable: true,
    },
  ];

  return (
    <PageContent>
      {isLoading && <ScreenLoader />}
      <Breadcrumbs title="Associate" breadcrumbItem="Prospect List" />
      <Container fluid={true}>
        <AppTable
          progressPending={isLoading}
          columns={columns}
          data={
            Array.isArray(prospectData?.data?.data)
              ? prospectData?.data?.data
              : []
          }
          pagination
        />
      </Container>
    </PageContent>
  );
}

export default ProspectList;
