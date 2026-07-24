import { useEffect, useState } from 'react'
import PageContent from '../../components/Common/PageContent'
import Breadcrumbs from '../../components/Common/Breadcrumb'
import { Container, Row, Col, FormGroup, Label, Input, Button, Card } from 'reactstrap'
import Select from 'react-select'
import { toast } from 'react-toastify'
import AppTable from '../../components/Common/Table'
import { formatDate, formatDateTime, RequiredStar, WordWrapCell } from '../../helpers/function_helper'
import { usePost } from '../../Hooks/useApi'
import { CREATE_MONEYTREE_CALENDER, GET_MONEYTREE_CALENDER, UPDATE_MONEYTREE_CALENDER } from '../../helpers/url_helper'
import { defaultTheme } from '../../helpers/defaultTheme'
import { useUserStore } from '../../store/useUserStore'
import ScreenLoader from '../../constants/ScreenLoader'
import ApiClient from '../../helpers/api_helper'
import CheckUserAccess from '../../components/Common/CheckUserAccess'
import PermissionMissing from '../Utility/PermissonMissing'
import { scrollToTop } from '../../constants/global'

export default function CalenderMaster() {
  const empCode = useUserStore((state) => state.user.empCode);
  const userId = useUserStore((state) => state.user.userId);
  const [month, setMonth] = useState(null)
  const [year, setYear] = useState(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [isEditing, setIsEditing] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [isPending, setIsPending] = useState(false)
  const [calenderMasterData, setCalenderMasterData] = useState([])
  const [accessGranted, setAccessGranted] = useState(null);

  useEffect(() => {
    if (accessGranted) {
      getCalenderData()
    }
  }, [accessGranted])

  const getCalenderData = () => {
    setIsPending(true)
    ApiClient.post(`${GET_MONEYTREE_CALENDER}`)
      .then(function (response) {
        setIsPending(false);
        if (response?.data?.status === 1) {
          setCalenderMasterData(response.data.data);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(function (error) {
        setIsPending(false);
        toast.error(error.message);
      });
  };

  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ]

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: (currentYear + 1) - 2024 + 1 }, (_, i) => {
    const yr = 2024 + i
    return { value: yr, label: yr.toString() }
  })

  const handleClear = () => {
    setMonth(null);
    setYear(null);
    setFromDate('');
    setToDate('');
    setIsEditing(false);
    setEditRowId(null);
  };

  const handleSave = () => {
    if (!year || !month || !fromDate || !toDate) {
      toast.error('All fields are required');
      return;
    }
    else {
      createMoneyTreeCalender()
    }
  }

  const { isPending: addLoading, mutate: createMoneyTreeCalender } = usePost(`${CREATE_MONEYTREE_CALENDER}year=${year?.value}&month=${month?.value}&fromDate=${fromDate}&toDate=${toDate}&createdBy=${empCode}`, {
    onSuccess: (response) => {
      if (response?.data.status === 1) {
        toast.success(response.data.message);
        handleClear()
        getCalenderData()
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const prefillForm = (row) => {
    scrollToTop()
    if (row) {
      const monthOption = monthOptions.find(option => option.value === row.month);
      setYear({ value: row.year, label: row.year.toString() });
      setMonth(monthOption);
      setFromDate(row.fromDate);
      setToDate(row.toDate);
      setIsEditing(true);
      setEditRowId(row.id);
    }
  };

  const handleUpdate = () => {
    if (!year || !month || !fromDate || !toDate) {
      toast.error('All fields are required');
      return;
    }
    updateMoneyTreeCalender()
  };

  const { isPending: updateLoading, mutate: updateMoneyTreeCalender } = usePost(`${UPDATE_MONEYTREE_CALENDER}year=${year?.value}&month=${month?.value}&fromDate=${fromDate}&toDate=${toDate}&createdBy=${empCode}&id=${editRowId}`, {
    onSuccess: (response) => {
      if (response?.data.status === 1) {
        toast.success(response.data.message);
        handleClear()
        getCalenderData()
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const columns = [
    {
      name: <span className="font-weight-bold fs-13">SL No.</span>,
      selector: (_, index) => index + 1,
      width: "7%",
    },
    {
      name: <span className="font-weight-bold fs-13">Manage</span>,
      width: "10%",
      cell: (row) => (
        <i
          title='Manage'
          className="ri-pencil-fill align-bottom me-2"
          style={{ cursor: "pointer", color: defaultTheme.goldColorLogo }}
          onClick={() => prefillForm(row)}
        ></i>
      ),
    },
    {
      name: <span className="font-weight-bold fs-13">Created Date & Time</span>,
      selector: (row) => row.createdDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Year</span>,
      selector: (row) => row.year,
      sortable: true,
      cell: (row) => <WordWrapCell>{row.year}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">Month</span>,
      selector: (row) => row.month,
      sortable: true,
      cell: (row) => <WordWrapCell> {monthOptions.find(option => option.value === row.month)?.label || ''}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">From Date</span>,
      selector: (row) => row.fromDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDate(row.fromDate)}</WordWrapCell>,
    },
    {
      name: <span className="font-weight-bold fs-13">To Date</span>,
      selector: (row) => row.toDate,
      sortable: true,
      cell: (row) => <WordWrapCell>{formatDate(row.toDate)}</WordWrapCell>,
    }
  ];

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await CheckUserAccess(userId, 'calender-master');
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
      <Breadcrumbs title="Master" breadcrumbItem="MoneyTree Calendar" />
      {(addLoading || isPending || updateLoading) && <ScreenLoader />}
      <Card>
        <Container fluid>
          <Row className='g-3'>
            <Col md={3}>
              <FormGroup>
                <Label className="font-size-11">Year <RequiredStar /></Label>
                <Select
                  options={yearOptions}
                  value={year}
                  onChange={setYear}
                  placeholder="Select Year"
                  isClearable
                  style={{ zIndex: 9999 }}
                  menuPortalTarget={document.body}
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label className="font-size-11">Month <RequiredStar /></Label>
                <Select
                  options={monthOptions}
                  value={month}
                  onChange={setMonth}
                  placeholder="Select Month"
                  isClearable
                  style={{ zIndex: 9999 }}
                  menuPortalTarget={document.body}
                />
              </FormGroup>
            </Col>
            <Col md={2}>
              <FormGroup>
                <Label className="font-size-11">From Date <RequiredStar /></Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col md={2}>
              <FormGroup>
                <Label className="font-size-11">To Date <RequiredStar /></Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </FormGroup>
            </Col>

            <Col md={2} className="d-flex align-items-center">
              <Button color="primary" onClick={isEditing ? handleUpdate : handleSave} className='me-2'>
                {isEditing ? 'Update' : 'Save'}
              </Button>
              <Button color="secondary" onClick={handleClear}>Clear</Button>
            </Col>
          </Row>
        </Container>
      </Card>

      <AppTable
        progressPending={isPending}
        columns={columns}
        data={calenderMasterData || []}
        pagination
      />
    </PageContent>
  )
}
