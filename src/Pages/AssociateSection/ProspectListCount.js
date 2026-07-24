/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import AppTable from "../../components/Common/Table";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { GET_PROSPECT_DATA } from "../../helpers/url_helper";
import { formatDateForInput } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { defaultTheme } from "../../helpers/defaultTheme";

export default function ProspectListCount() {
  const userId = useUserStore((state) => state.user.userId);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isPending, setIsPending] = useState(false)
  const [prosData, setProsData] = useState([])

  // Calculate the first and last dates of the current month
  useEffect(() => {
    getProsDetailsInit()
  }, []);

  const getProsDetailsInit = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the month

    setFromDate(formatDateForInput(startOfMonth)); // Set default from date
    setToDate(formatDateForInput(endOfMonth)); // Set default to date

    // Set the initial API URL
    getProspectDetails(
      `${GET_PROSPECT_DATA}${userId}&startDate=${formatDateForInput(
        startOfMonth
      )}&endDate=${formatDateForInput(endOfMonth)}`
    );
  }

  const handleShowData = (e) => {
    if (e) e.preventDefault()
    const startDate = formatDateForInput(new Date(fromDate));
    const endDate = formatDateForInput(new Date(toDate));
    getProspectDetails(
      `${GET_PROSPECT_DATA}${userId}&startDate=${startDate}&endDate=${endDate}`
    );
  };

  const getProspectDetails = (apiUrl) => {
    setIsPending(true)
    ApiClient.get(apiUrl).then(function (response) {
      setIsPending(false);
      if (response.data.status === 1) {
        setProsData(response.data.data)
      }
      else {
        toast.error(response.data.message)
      }

    })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message);
      });
  }

  const totalProspects = prosData?.reduce((sum, row) => sum + (row.prospCount || 0), 0);

  const dataWithTotal = [
    {
      isTotalRow: true,
      assoId: '-',
      aasoName: 'Total',
      prospCount: totalProspects
    },
    ...prosData
  ];

  const goldStyle = { fontWeight: "bold", color: defaultTheme.goldColorLogo };
  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index === 0 ? '' : index,
      width: "10%",
    },
    {
      name: <span className="font-weight-bold fs-13">Associate Id</span>,
      selector: (row) => row.assoId,
      sortable: true,
      cell: row => {
        return <div style={row.isTotalRow ? goldStyle : {}}>{row.assoId}</div>;
      },
    },
    {
      name: <span className="font-weight-bold fs-13">Name</span>,
      selector: (row) => row.aasoName,
      sortable: true,
      cell: row => {
        return <div style={row.isTotalRow ? goldStyle : {}}>{row.aasoName}</div>;
      },
    },
    {
      name: <span className="font-weight-bold fs-13">Total Prospects</span>,
      selector: (row) => row.prospCount,
      sortable: true,
      cell: row => {
        return <div style={row.isTotalRow ? goldStyle : {}}>{row.prospCount}</div>;
      },
    },
  ];

  return (
    <PageContent>
      {isPending && <ScreenLoader />}
      <Breadcrumbs title="Associate" breadcrumbItem="Prospect List" />
      <Container fluid={true}>
        <form onSubmit={handleShowData}>
          <Card>
            <CardBody>
              <Row className="g-3">
                <Col lg="4">
                  <h6 className="font-size-11">From Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Col>
                <Col lg="4">
                  <h6 className="font-size-11">To Date</h6>
                  <input
                    className="form-control"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Col>
                <Col
                  lg="4"
                  className="d-flex align-items-end"
                >
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleShowData}
                  >
                    Show Data
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={getProsDetailsInit}
                  >
                    Clear
                  </button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>
        <AppTable
          progressPending={isPending}
          columns={columns}
          data={dataWithTotal}
          pagination
        />
      </Container>
    </PageContent>
  );
}
