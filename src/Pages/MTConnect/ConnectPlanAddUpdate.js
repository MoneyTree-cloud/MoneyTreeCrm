import React, { useEffect, useState } from 'react'
import PageContent from '../../components/Common/PageContent'
import Breadcrumbs from '../../components/Common/Breadcrumb'
import { Card, CardBody, Col, Container, Row, Button } from 'reactstrap'
import Select from "react-select";
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import { usePost } from '../../Hooks/useApi';
import { CREATE_PLAN, UPDATE_PLAN } from '../../helpers/url_helper';
import ScreenLoader from '../../constants/ScreenLoader';
import { RequiredStar } from '../../helpers/function_helper';

export default function ConnectPlanAddUpdate() {
  const navigation = useNavigate()
  const empCode = useUserStore((state) => state.user.empCode);
  const location = useLocation();
  const { rowData } = location.state || {};

  const initialFormState = {
    planName: '',
    planPayment: '',
    planDescription: '',
    createdBy: empCode,
    planMasterRanges: [{ planRangeId: 0, planRange: '', planIncentive: '' }]
  }

  const [formState, setFormState] = useState(initialFormState)
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!formState.planName) newErrors.planName = "Plan Name is required";
    if (!formState.planPayment) newErrors.planPayment = "Plan Amount is required";
    if (!formState.planDescription) newErrors.planDescription = "Plan Description is required";
    formState.planMasterRanges.forEach((range, index) => {
      if (!range.planRange) newErrors[`planRange${index}`] = "Plan Range is required";
      if (!range.planIncentive) newErrors[`planIncentive${index}`] = "Plan Incentive is required";
    });

    setErrors(newErrors);
    return Object?.keys(newErrors).length === 0;
  }

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [id]: value
    }));
    setErrors(prevErrors => ({ ...prevErrors, [id]: '' })); // Remove error on change
  }

  const handleSelectChange = (index, selectedOption) => {
    const updatedRanges = [...formState.planMasterRanges];
    updatedRanges[index].planRange = selectedOption ? selectedOption.value : '';
    setFormState(prevState => ({
      ...prevState,
      planMasterRanges: updatedRanges
    }));
    setErrors(prevErrors => ({ ...prevErrors, [`planRange${index}`]: '' })); // Remove error on selection
  }

  const handleIncentiveChange = (index, e) => {
    const updatedRanges = [...formState.planMasterRanges];
    updatedRanges[index].planIncentive = e.target.value;
    setFormState(prevState => ({
      ...prevState,
      planMasterRanges: updatedRanges
    }));
    setErrors(prevErrors => ({ ...prevErrors, [`planIncentive${index}`]: '' })); // Remove error on typing
  }

  const addPlanRange = () => {
    setFormState(prevState => ({
      ...prevState,
      planMasterRanges: [...prevState.planMasterRanges, { planRangeId: 0, planRange: '', planIncentive: '' }]
    }));
  }

  const removePlanRange = (index) => {
    const updatedRanges = [...formState.planMasterRanges];
    updatedRanges.splice(index, 1);
    setFormState(prevState => ({
      ...prevState,
      planMasterRanges: updatedRanges
    }));
  }

  const handleSaveUpdate = () => {
    if (validateForm()) {
      const payload = {
        ...formState,
        planId: rowData.planId,
        planMasterRanges: formState.planMasterRanges.map(range => ({
          planRangeId: range.planRangeId,
          planRange: range.planRange,
          planIncentive: range.planIncentive
        }))
      }
      if (Object?.keys(rowData)?.length === 0) {
        mutateAdd(payload)
      }
      else {
        mutateUpdate(payload)
      }
    } else {
      toast.error("Please fill all required fields.");
    }
  }

  const { isPending, mutate: mutateAdd } = usePost(
    CREATE_PLAN,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          handleBack()
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const { isPending: isPendingUpdate, mutate: mutateUpdate } = usePost(
    UPDATE_PLAN,
    {
      onSuccess: (response) => {
        if (response?.data?.status === 1) {
          toast.success(response.data.message);
          handleBack()
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }
  );

  const handleBack = () => {
    navigation('/connect-plan-list')
  }

  const planRangeList = [
    { label: '0-50 Lakh', value: '0-50 Lakh' },
    { label: '50 Lakh- 1 Cr.', value: '50 Lakh- 1 Cr.' },
    { label: '1 Cr.- 1.5 Cr.', value: '1 Cr.- 1.5 Cr.' },
    { label: '1.5 Cr.- 2 Cr.', value: '1.5 Cr.- 2 Cr.' },
    { label: 'Greator than 2 Cr.', value: 'Greator than 2 Cr.' }
  ]

  // Filter out already selected values for dropdown
  const getFilteredOptions = (index) => {
    const selectedValues = formState.planMasterRanges.map(range => range.planRange);
    return planRangeList.filter(option => !selectedValues.includes(option.value) || formState.planMasterRanges[index].planRange === option.value);
  }

  useEffect(() => {
    if (Object?.keys(rowData)?.length > 0) {
      setFormState({
        planName: rowData.planName || '',
        planPayment: rowData.planPayment || '',
        planDescription: rowData.planDescription || '',
        createdBy: empCode,
        planMasterRanges: rowData.planMasterRanges?.length > 0
          ? rowData.planMasterRanges
          : [{ planRangeId: 0, planRange: '', planIncentive: '' }]
      });
    }
  }, [rowData, empCode]);

  return (
    <PageContent>
      <Breadcrumbs title="Connect" breadcrumbItem={Object?.keys(rowData)?.length === 0 ? "Plan Add" : "Plan Update"} />
      {(isPending || isPendingUpdate) && <ScreenLoader />}
      <Container fluid={true}>
        <form>
          <Card>
            <CardBody>
              <Row>
                <Col md="3">
                  <h6 className='font-size-11'>Plan Name <RequiredStar/></h6>
                  <input className="form-control" type="text" id="planName" placeholder='Plan Name...' value={formState.planName} onChange={handleChange} />
                  {errors.planName && <span className="text-danger font-size-11">{errors.planName}</span>}
                </Col>
                <Col md="3">
                  <h6 className='font-size-11'>Plan Amount (In Rupees) <RequiredStar/></h6>
                  <input className="form-control" type="number" id="planPayment" placeholder='Plan Amount...' value={formState.planPayment} onChange={handleChange}
                    onKeyDown={(e) => {
                      if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
                        e.preventDefault();
                      }
                    }} />
                  {errors.planPayment && <span className="text-danger font-size-11">{errors.planPayment}</span>}
                </Col>
                <Col md="6">
                  <h6 className='font-size-11'>Plan Description <RequiredStar/></h6>
                  <input className="form-control" type="text" id="planDescription" placeholder='Plan Description' value={formState.planDescription} onChange={handleChange} />
                  {errors.planDescription && <span className="text-danger font-size-11">{errors.planDescription}</span>}
                </Col>
              </Row>
              <hr className="dashed-divider" />

              {formState.planMasterRanges.map((range, index) => (
                <Row key={index} className="mt-3">
                  <Col md="5">
                    {index === 0 && <h6 className='font-size-11'>Plan Range <RequiredStar/></h6>}
                    <Select
                      menuPortalTarget={document.body}
                      isClearable
                      menuPlacement="auto"
                      value={getFilteredOptions(index).find(option => option.value === range.planRange)}
                      onChange={(selectedOption) => handleSelectChange(index, selectedOption)}
                      options={getFilteredOptions(index)}
                    />
                    {errors[`planRange${index}`] && <span className="text-danger font-size-11">{errors[`planRange${index}`]}</span>}
                  </Col>
                  <Col md="5">
                    {index === 0 && <h6 className='font-size-11'>Plan Incentive (In Rupees)<RequiredStar/></h6>}
                    <input className="form-control" type="number" placeholder='Plan Incentive...' value={range.planIncentive} onChange={(e) => handleIncentiveChange(index, e)}
                      onKeyDown={(e) => {
                        if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
                          e.preventDefault();
                        }
                      }} />
                    {errors[`planIncentive${index}`] && <span className="text-danger font-size-11">{errors[`planIncentive${index}`]}</span>}
                  </Col>
                  <Col md="2" className="d-flex align-items-end">
                    {index === formState.planMasterRanges.length - 1 && <Button color="primary" onClick={addPlanRange}>+</Button>}
                    {formState.planMasterRanges.length > 1 && <Button color="secondary" className="ms-2" onClick={() => removePlanRange(index)}>-</Button>}
                  </Col>
                </Row>
              ))}
              <Row className="mt-4 justify-content-center">
                <Col md='auto'>
                  <Button color="primary" onClick={handleSaveUpdate} className="btn btn-primary">{Object?.keys(rowData)?.length === 0 ? "Save All" : "Update All"}</Button>

                  <Button color="secondary" onClick={handleBack} className="btn btn-secondary ms-3">Back</Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </form>
      </Container>
    </PageContent>
  )
}
