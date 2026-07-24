import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    Col,
    Container,
    Row,
} from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useGet, usePost } from "../../Hooks/useApi";
import {
    ALL_DEPARTMENT_DROPDOWN_ID,
    CREATE_MOM,
    UPDATE_MOM,
} from "../../helpers/url_helper";
import PageContent from "../../components/Common/PageContent";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import { useLocation, useNavigate } from "react-router-dom";
import { RequiredStar } from "../../helpers/function_helper";

export default function MOMAddScreen() {
    const userId = useUserStore((state) => state.user.userId);
    const location = useLocation();
    const { rowData } = location.state || {};

    const navigation = useNavigate();

    const initialFormState = {
        momDescription: "",
        momDepartment: null,
        momTime: "",
        momSubject: ""
    };

    const [formState, setFormState] = useState(initialFormState);
    const { data: departmentList, isLoading } = useGet(ALL_DEPARTMENT_DROPDOWN_ID);

    useEffect(() => {
        if (Object?.keys(rowData)?.length !== 0) {
            const department = departmentList?.data?.data?.find(
                (item) => item.value === rowData.departmentId
            );
            setFormState({
                momDepartment: department || null,
                momDescription: rowData.data || "",
                momTime: rowData.time || "",
                momSubject: rowData.subject || ""
            })
        }
    }, [departmentList?.data?.data, rowData])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSelectChange = (name) => (selectedOption) => {
        setFormState((prevState) => ({
            ...prevState,
            [name]: selectedOption,
        }));
    };

    const { isPending: isPendingAdd, mutate: mutateAdd } = usePost(CREATE_MOM, {
        onSuccess: (response) => {
            if (response?.data?.status === 1) {
                toast.success(response.data.message);
                handleCancel();
            } else {
                toast.error(response.data.message);
            }
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    const { isPending: isPendingUpdate, mutate: mutateUpdate } = usePost(UPDATE_MOM, {
        onSuccess: (response) => {
            if (response?.data?.status === 1) {
                toast.success(response.data.message);
                handleCancel();
            } else {
                toast.error(response.data.message);
            }
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    const handleSave = () => {
        if (!formState.momDepartment) {
            toast.error("Please Select Department");
        } else if (!formState.momTime) {
            toast.error("Please Enter Time");
        } else if (!formState.momSubject) {
            toast.error("Please Enter Subject");
        } else if (!formState.momDescription) {
            toast.error("Please Enter Description");
        } else {
            let params = {
                momId: rowData?.id ? rowData?.id : 0,
                department: formState?.momDepartment?.label,
                departmentId: formState?.momDepartment?.value,
                loginId: userId,
                data: formState.momDescription,
                time: formState.momTime,
                subject: formState?.momSubject
            };
            if (Object?.keys(rowData)?.length === 0) {
                mutateAdd(params);
            }
            else {
                mutateUpdate(params);
            }
        }
    };

    const handleCancel = () => {
        navigation('/mom-screen')
    };

    return (
        <PageContent>
            <Breadcrumbs title="M.O.M." breadcrumbItem="ADD M.O.M. Menu" />
            {(isPendingAdd || isPendingUpdate || isLoading) && <ScreenLoader />}
            <Container fluid={true}>
                <form>
                    <Card>
                        <CardBody>
                            <Row>

                                <Col md="4">
                                    <h6 className="font-size-11">
                                        Subject <RequiredStar/>
                                    </h6>
                                    <input
                                        name="momSubject"
                                        className="form-control"
                                        placeholder="Enter Subject..."
                                        type="text"
                                        value={formState.momSubject}
                                        onChange={handleChange}
                                    />
                                </Col>

                                <Col md="4">
                                    <h6 className="font-size-11">
                                        Time <RequiredStar/>
                                    </h6>
                                    <input
                                        name="momTime"
                                        className="form-control"
                                        type="time"
                                        value={formState.momTime}
                                        onChange={handleChange}
                                    />
                                </Col>

                                <Col md="4">
                                    <h6 className="font-size-11">
                                        Department <RequiredStar/>
                                    </h6>
                                    <Select
                                        style={{ zIndex: 9999 }}
                                        menuPortalTarget={document.body}
                                        value={formState.momDepartment}
                                        isClearable
                                        onChange={handleSelectChange("momDepartment")}
                                        options={
                                            Array.isArray(departmentList?.data?.data)
                                                ? departmentList?.data?.data
                                                : []
                                        }
                                    />
                                </Col>

                                <Col md="12">
                                    <h6 className="font-size-11 mt-3">
                                        Description <RequiredStar/>
                                    </h6>
                                    <textarea
                                        name="momDescription"
                                        required
                                        className="form-control"
                                        rows="10"
                                        placeholder="Enter Description Here..."
                                        value={formState.momDescription}
                                        onChange={handleChange}
                                    ></textarea>
                                </Col>
                            </Row>
                            <Row className="justify-content-center mt-4">
                                <Col md="auto">
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
                                            style={{ backgroundColor: defaultTheme.goldColorLogo }}
                                            type="button"
                                            onClick={handleCancel}
                                        >
                                            Cancel
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
