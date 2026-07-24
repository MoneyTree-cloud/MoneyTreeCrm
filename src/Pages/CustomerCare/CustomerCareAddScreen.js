/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { usePost } from "../../Hooks/useApi";
import { CREATE_CC, GET_DATA_BY_MTRS_ID, UPDATE_CC } from "../../helpers/url_helper";
import PageContent from "../../components/Common/PageContent";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import { useLocation, useNavigate } from "react-router-dom";
import { RegexFile } from "../../helpers/RegexFile";
import Select from "react-select";
import ApiClient from "../../helpers/api_helper";
import { RequiredStar } from "../../helpers/function_helper";

export default function CustomerCareAddScreen() {
    const userId = useUserStore((state) => state.user.userId);
    const location = useLocation();
    const [isPending, setIsPending] = useState(false)
    const { rowData, statusValue } = location.state || {};
    const [complaintType, setComplaintType] = useState('email');
    const navigation = useNavigate();

    const initialFormState = {
        mtrsId: '',
        emailDescription: "",
        emailTime: "",
        emailDate: '',
        assignTo: null,
        name: '',
        mobileNo: '',
        email: '',
        builderName: '',
        projectName: '',
        UnitNo: '',
        unitId: '',
        associateName: '',
        associateCode: '',
        mainTeam: '',
        subTeam: ''
    };

    const [formState, setFormState] = useState(initialFormState);

    const [assignToType, setAssignToType] = useState(null);

    const assignToGroup = [
        { label: 'Anmol Bhatia', value: 'Anmol Bhatia' },
        { label: 'Client End', value: 'Client End' },
        { label: 'Deendayal Arya', value: 'Deendayal Arya' },
        { label: 'Gaurav Gautam', value: 'Gaurav Gautam' },
        { label: 'Vishal Kaushik', value: 'Vishal Kaushik' },
        { label: 'Main Team', value: 'Main Team' },
        { label: 'Legal', value: 'Legal' },
        { label: 'Sales Operations', value: 'Sales Operations' },
        { label: 'Sumit Khillani', value: 'Sumit Khillani' },
        { label: 'Sandeep Chamyal', value: 'Sandeep Chamyal' },
        { label: "Developer’s Desk", value: "Developer’s Desk" },

    ]


    useEffect(() => {
        if (Object?.keys(rowData)?.length !== 0) {
            setFormState({
                emailDescription: rowData.emailDescription || "",
                emailTime: rowData.emailReceiveTime || "",
                emailDate: rowData.emailReceiveDate || "",
                name: rowData.customerName || "",
                mobileNo: rowData.customerMobile || "",
                email: rowData.customerEmail || "",
                builderName: rowData.builderName,
                projectName: rowData.projectName,
                UnitNo: rowData.unitNo,
                unitId: rowData.unitId,
                associateName: rowData.associateName,
                associateCode: rowData.associateCode,
                mainTeam: rowData.mainTeam,
                subTeam: rowData.subTeam,
                mtrsId: rowData.saleId,
            })
            setComplaintType(rowData.complaintType || 'email');

            const assignTo = assignToGroup?.find(
                (item) => item.label === rowData.assignTo
            )

            if (assignTo) {
                setAssignToType(assignTo)
            }
        }
    }, [rowData])

    const handleChange = (e) => {
        const { name, value } = e.target;
        const numberFields = ["mobileNo",];
        // Handle mobile number validation
        if (numberFields.includes(name)) {
            // Validate that only digits and up to 10 characters are allowed
            if (/^\d{0,10}$/.test(value)) {
                setFormState((prev) => ({
                    ...prev,
                    [name]: value,
                }));
            }
            return; // Exit early for number fields
        }

        setFormState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const { isPending: isPendingAdd, mutate: mutateAdd } = usePost(CREATE_CC, {
        onSuccess: (response) => {
            if (response?.data?.status === 1) {
                toast.success(response.data.message);
                handleBack();
            } else {
                toast.error(response.data.message);
            }
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    const { isPending: isPendingUpdate, mutate: mutateUpdate } = usePost(UPDATE_CC, {
        onSuccess: (response) => {
            if (response?.data?.status === 1) {
                toast.success(response.data.message);
                handleBack();
            } else {
                toast.error(response.data.message);
            }
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    const handleSave = () => {
        if (!formState.name) {
            toast.error("Please Enter Name");
        } else if (formState.mobileNo && !RegexFile.mobileNo.test(formState.mobileNo)) {
            toast.error("Mobile No must be a 10-digit number.");
        }
        else if (!formState.email) {
            toast.error("Please Enter Email");
        }
        else if (!RegexFile.email.test(formState.email)) {
            toast.error("Please Enter Valid Email");
        }
        else if (!formState.emailDate) {
            toast.error("Please Enter Email Received Date");
        } else if (!formState.emailTime) {
            toast.error("Please Enter Email Received Time");
        } else if (!formState.emailDescription) {
            toast.error("Please Enter Summary Of Email");
        } else if (!assignToType) {
            toast.error("Please Enter Assign To");
        }
        else {
            let params = {
                "id": rowData?.id ? rowData?.id : 0,
                "customerName": formState.name,
                "customerMobile": formState.mobileNo,
                "customerEmail": formState.email,
                "emailReceiveDate": formState.emailDate,
                "emailReceiveTime": formState.emailTime + ':00',
                "emailDescription": formState.emailDescription,
                "assignTo": assignToType?.label,
                "userId": parseInt(userId),
                "builderName": formState?.builderName,
                "projectName": formState?.projectName,
                "unitNo": formState?.UnitNo,
                "unitId": parseInt(formState?.unitId),
                "associateName": formState?.associateName,
                "associateCode": formState?.associateCode,
                "mainTeam": formState?.mainTeam,
                "subTeam": formState?.subTeam,
                "saleId": parseInt(formState?.mtrsId),
                "complaintType": complaintType
            }
            if (Object?.keys(rowData)?.length === 0) {
                mutateAdd(params);
            }
            else {
                mutateUpdate(params);
            }
        }
    };

    const handleBack = () => {
        navigation("/customer-care-screen", {
            state: { statusValue_: statusValue },
        });
    };

    const handleDataOnBlur = () => {
        if (formState?.mtrsId) {
            setIsPending(true)
            ApiClient.get(
                `${GET_DATA_BY_MTRS_ID}${formState?.mtrsId}`
            )
                .then(function (response) {
                    setIsPending(false);
                    if (response?.data?.status === 1) {
                        const saleData = response?.data?.data
                        setFormState((prevFormData) => ({
                            ...prevFormData,
                            builderName: saleData.builderName,
                            projectName: saleData.projectName,
                            UnitNo: saleData.unitNo,
                            unitId: saleData.unitId,
                            associateName: saleData.associateName,
                            associateCode: saleData.associateCode,
                            mainTeam: saleData.mainTeam,
                            subTeam: saleData.subTeam,
                            name: saleData.customerName,
                            mobileNo: saleData.customerMobile

                        }));
                    } else {
                        toast.error(response.data.message);
                    }
                })
                .catch(function (error) {
                    setIsPending(false);
                    toast.error(error.message);
                });
        }
    };

    return (
        <PageContent>
            <Breadcrumbs title="Customer Care" breadcrumbItem="Add/Update" />
            {(isPendingAdd || isPendingUpdate || isPending) && <ScreenLoader />}
            <Container fluid={true}>
                <form>
                    <Card>
                        <CardBody>
                            <Row>
                                <Col md="3">
                                    <h6 className="font-size-11">
                                        MTRS No.
                                    </h6>
                                    <input
                                        name="mtrsId"
                                        className="form-control"
                                        type="text"
                                        placeholder="Enter MTRS No..."
                                        value={formState.mtrsId}
                                        onChange={handleChange}
                                        onBlur={handleDataOnBlur}
                                    />
                                </Col>
                                <Col md="3">
                                    <h6 className="font-size-11">
                                        Name
                                    </h6>
                                    <input
                                        name="name"
                                        className="form-control"
                                        type="text"
                                        placeholder="Name"
                                        value={formState.name}
                                        onChange={handleChange}
                                    />
                                </Col>

                                <Col md="3">
                                    <h6 className="font-size-11">
                                        Mobile No.
                                    </h6>
                                    <input
                                        name="mobileNo"
                                        className="form-control"
                                        type="text"
                                        placeholder="Mobile No"
                                        value={formState.mobileNo}
                                        onChange={handleChange}
                                    />
                                </Col>

                                <Col md="3">
                                    <h6 className="font-size-11">
                                        Builder Name
                                    </h6>
                                    <input
                                        name="builderName"
                                        className="form-control"
                                        type="text"
                                        placeholder="Builder Name"
                                        value={formState.builderName}
                                        onChange={handleChange}
                                    />
                                </Col>

                                <Col md="3 mt-3">
                                    <h6 className="font-size-11">
                                        Project Name
                                    </h6>
                                    <input
                                        name="projectName"
                                        className="form-control"
                                        type="text"
                                        placeholder="Project Name"
                                        value={formState.projectName}
                                        onChange={handleChange}
                                    />
                                </Col>

                                <Col md="3 mt-3">
                                    <h6 className="font-size-11">
                                        Unit No.
                                    </h6>
                                    <input
                                        name="UnitNo"
                                        className="form-control"
                                        type="text"
                                        placeholder="Unit No."
                                        value={formState.UnitNo}
                                        onChange={handleChange}
                                    />
                                </Col>

                                <Col md="3 mt-3">
                                    <h6 className="font-size-11">
                                        Associate Name
                                    </h6>
                                    <input
                                        name="associateName"
                                        className="form-control"
                                        type="text"
                                        placeholder="Associate Name"
                                        value={formState.associateName}
                                        // value={formState.associateName + ' (' + formState.associateCode + ')'}
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col md="3 mt-3">
                                    <h6 className="font-size-11">
                                        Associate ID
                                    </h6>
                                    <input
                                        name="associateCode"
                                        className="form-control"
                                        type="text"
                                        placeholder="Associate ID"
                                        value={formState.associateCode}
                                        onChange={handleChange}
                                    />
                                </Col>

                                <Col md="3 mt-3">
                                    <h6 className="font-size-11">
                                        Main Team
                                    </h6>
                                    <input
                                        name="mainTeam"
                                        className="form-control"
                                        type="text"
                                        placeholder="Main Team"
                                        value={formState.mainTeam}
                                        onChange={handleChange}
                                    />
                                </Col>

                                <Col md="3 mt-3">
                                    <h6 className="font-size-11">
                                        Sub Team
                                    </h6>
                                    <input
                                        name="subTeam"
                                        className="form-control"
                                        type="text"
                                        placeholder="Sub Team"
                                        value={formState.subTeam}
                                        onChange={handleChange}
                                    />
                                </Col>


                                <Col md="3 mt-3">
                                    <h6 className="font-size-11">
                                        Email <RequiredStar />
                                    </h6>
                                    <input
                                        name="email"
                                        className="form-control"
                                        type="email"
                                        placeholder="Enter Email..."
                                        value={formState.email}
                                        onChange={handleChange}
                                    />
                                </Col>

                                <Col md="3 mt-3">
                                    <h6 className="font-size-11">
                                        Email Received Date <RequiredStar />
                                    </h6>
                                    <input
                                        name="emailDate"
                                        className="form-control"
                                        type="date"
                                        value={formState.emailDate}
                                        onChange={handleChange}
                                    />
                                </Col>

                                <Col md="3 mt-3">
                                    <h6 className="font-size-11">
                                        Email Received Time <RequiredStar />
                                    </h6>
                                    <input
                                        name="emailTime"
                                        className="form-control"
                                        type="time"
                                        value={formState.emailTime}
                                        onChange={handleChange}
                                    />
                                </Col>


                                <Col md="6">
                                    <h6 className="font-size-11 mt-3">
                                        Summary Of Complaint <RequiredStar />
                                    </h6>
                                    <textarea
                                        name="emailDescription"
                                        required
                                        className="form-control"
                                        rows="5"
                                        placeholder="Enter Summary Of Complaint Here..."
                                        value={formState.emailDescription}
                                        onChange={handleChange}
                                    ></textarea>
                                </Col>

                                <Col md="3 mt-3">
                                    <h6 className="font-size-11">
                                        Assign To <RequiredStar />
                                    </h6>
                                    <Select
                                        isClearable
                                        menuPlacement="auto"
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        value={assignToType}
                                        onChange={setAssignToType}
                                        options={assignToGroup}
                                    />
                                </Col>

                                <Col md="4">
                                    <label className="form-label font-size-11">Complaint Type :</label>
                                    <div className="radio-button-container mt-1">
                                        {["call", "email"].map((type) => (
                                            <label key={type} className={`radio-label ${complaintType === type ? "active" : ""}`}>
                                                <input
                                                    type="radio"
                                                    name="complaintType"
                                                    value={type}
                                                    checked={complaintType === type}
                                                    onChange={(e) => setComplaintType(e.target.value)}
                                                />
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </label>
                                        ))}
                                    </div>
                                </Col>

                                <Col md="4 mt-3">
                                    <div className="d-flex align-items-center">
                                        <Button
                                            color="primary"
                                            className="me-2"
                                            type="button"
                                            onClick={handleSave}
                                        >
                                            {Object?.keys(rowData)?.length === 0 ? 'Save' : 'Update'}
                                        </Button>
                                        <Button
                                            color="secondary"
                                            type="button"
                                            onClick={handleBack}
                                        >
                                            Back
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </form>

            </Container>
        </PageContent>
    );
}
