import { useState } from 'react'
import PageContent from '../../components/Common/PageContent'
import Breadcrumbs from '../../components/Common/Breadcrumb'
import { defaultTheme } from '../../helpers/defaultTheme'
import { Card, CardBody, Col, Container, FormGroup, Input, Label, Row } from 'reactstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { ADD_IVR_AGENT, GET_ALL_IVR_USERS, UPDATE_IVR_AGENT } from '../../helpers/url_helper'
import { useGet } from '../../Hooks/useApi'
import Select from 'react-select';
import ScreenLoader from '../../constants/ScreenLoader'
import { toast } from 'react-toastify'
import ApiClient from '../../helpers/api_helper'
import { RequiredStar } from '../../helpers/function_helper'

export default function AddUpdateAgent() {
    const navigation = useNavigate();
    const location = useLocation();
    const { rowData } = location.state || {};
    const { data: ivrUsers, isLoading, } = useGet(GET_ALL_IVR_USERS);
    const [ivrUser, setIvrUser] = useState(null);
    const [isLoadingState, setIsLoadingState] = useState(false);

    const [formData, setFormData] = useState({
        agentName: rowData?.agentName || "",
        mobile: rowData?.agentMobile || "",
        email: rowData?.agentEmail || "",
    });

    const ivrUsersOptions = ivrUsers?.data?.data?.map((ivrData) => ({
        value: ivrData.employeeCode,
        label: ivrData.name + ' (' + ivrData.employeeCode + ')',
        agentName: ivrData.name,
        mobile: ivrData.mobile,
        email: ivrData.email,
    })) || [];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!rowData?.id) {
            if (!ivrUser) {
                toast.error("Please select an IVR user.");
                return;
            }
            else {
                setIsLoadingState(true);
                ApiClient.post(`${ADD_IVR_AGENT}?mobile=${ivrUser.mobile}&name=${ivrUser.agentName}&email=${ivrUser.email}&empCode=${ivrUser.value}`)
                    .then(function (response) {
                        setIsLoadingState(false);
                        if (response?.data?.status === 1) {
                            setIvrUser(null);
                            toast.success(response.data.message);
                        } else {
                            toast.error(response.data.message);
                        }
                    })
                    .catch(function (error) {
                        setIsLoadingState(false);
                        toast.error(error.message);
                    });
            }
        }
        else {
            if (!formData.agentName || !formData.mobile || !formData.email) {
                toast.error("Please fill all the required fields.");
                return;
            }
            else {
                setIsLoadingState(true);
                ApiClient.post(`${UPDATE_IVR_AGENT}?mobile=${formData.mobile}&name=${formData.agentName}&email=${formData.email}&agentId=${rowData.agentId}&enabled=${rowData.agentStatus === "enabled" ? 1 : 0}&empCode=${rowData.employeeCode}`)
                    .then(function (response) {
                        setIsLoadingState(false);
                        if (response?.data?.status === 1) {
                            toast.success(response.data.message);
                        } else {
                            toast.error(response.data.message);
                        }
                    })
                    .catch(function (error) {
                        setIsLoadingState(false);
                        toast.error(error.message);
                    });
            }
        }
    }

    const handleClear = () => {
        setFormData({
            agentName: "",
            mobile: "",
            email: "",
        });
    }

    const handleBack = () => {
        navigation('/ivr-agent-list');
    }

    return (
        <PageContent>
            <Breadcrumbs title="IVR" breadcrumbItem={!rowData?.id ? "Add Agent" : "Update Agent"} />

            <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                padding: '10px 20px',
                width: '100%'
            }}
            >
                <button
                    onClick={() => handleBack()}
                    style={{
                        padding: '8px 10px',
                        backgroundColor: defaultTheme.goldColorLogo,
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        alignItems: 'center',
                        alignSelf: 'center',
                        marginLeft: 'auto'
                    }}
                >
                    ← Back
                </button>
            </div>

            <Container fluid>
                <form onSubmit={handleSubmit}>
                    {(isLoading || isLoadingState) && <ScreenLoader />}
                    <Card className='p-2'>
                        <CardBody>
                            {!rowData?.id ?
                                <Row className="align-items-end g-4">
                                    <Col md="6" className="mt-1">
                                        <h6 className="font-size-11 mb-1">IVR Users <RequiredStar /></h6>
                                        <Select
                                            options={Array.isArray(ivrUsersOptions) ? ivrUsersOptions : []}
                                            value={ivrUser}
                                            isClearable
                                            onChange={setIvrUser}
                                        />
                                    </Col>
                                    <Col md="6">
                                        <button type="submit" className="btn btn-primary">
                                            Save
                                        </button>
                                    </Col>
                                </Row>
                                :
                                <Row>
                                    {/* Agent Name */}
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className="font-size-11">Agent Name <RequiredStar /></Label>
                                            <Input
                                                placeholder="Agent name"
                                                value={formData.agentName}
                                                onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                                            />
                                        </FormGroup>
                                    </Col>

                                    {/* Mobile Number */}
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className="font-size-11">Mobile Number <RequiredStar /></Label>
                                            <Input
                                                placeholder="10-digit number"
                                                value={formData.mobile}
                                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                                                maxLength={10}
                                            />
                                        </FormGroup>
                                    </Col>

                                    {/* Email */}
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label className="font-size-11">Email <RequiredStar /></Label>
                                            <Input
                                                type="email"
                                                placeholder="e.g. name@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="3" className='mt-4 p-1'>
                                        <button type="submit" className="btn btn-primary">
                                            Update
                                        </button>
                                        <button type="reset" className="btn btn-secondary ms-2" onClick={handleClear}>
                                            Cancel
                                        </button>
                                    </Col>
                                </Row>
                            }
                        </CardBody>
                    </Card>
                </form>
            </Container>
        </PageContent>
    )
}
