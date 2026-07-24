/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { RegexFile } from "../../helpers/RegexFile";
import { enquiryApiClient } from "../../helpers/api_helper";
import { CREATE_ENQUIRY, GET_ENQUIRY_BY_ID } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import AppTable from "../../components/Common/Table";
import { MdEmail, MdMobileFriendly } from "react-icons/md";
import { formatActionType, formatDateTime, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function AddEnquiry() {
    const initialFormState = {
        name: "",
        mobile: "",
        email: "",
        subject: null,
        remarks: "",
        file: null,
    };

    const empCode = useUserStore((state) => state.user.empCode);
    const [formState, setFormState] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);
    const [isPending, setIsPending] = useState(false)
    const [enquiryList, setEnquiryList] = useState([]);

    const { data, isLoading, refetch: getEnquires } = useGet(`${GET_ENQUIRY_BY_ID}${empCode}`, { enabled: !!accessGranted });

    useEffect(() => {
        if (data?.data?.status === 1) {

            decryptData(data?.data?.data).then((decryptedData) => {
                if (decryptedData) {
                    setEnquiryList(decryptedData);
                } else {
                    setEnquiryList([])
                }
            });
        }
    }, [data]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Restrict mobile number field
        if (name === "mobile") {
            if (!/^\d*$/.test(value)) return; // Allow only numbers
            if (value.length > 10) return; // Restrict length to 10
        }

        setFormState((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    };

    const handleSelectChange = (selectedGroup) => {
        setFormState((prevState) => ({
            ...prevState,
            subject: selectedGroup,
        }));
        setErrors((prevErrors) => ({ ...prevErrors, subject: null }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formState.name) newErrors.name = "Name is required.";
        if (!formState.mobile) newErrors.mobile = "Mobile No. is required.";
        else if (formState.mobile.length !== 10) {
            newErrors.mobile = "Valid Mobile No. is required."
        }
        if (formState.email && !RegexFile.email.test(formState.email)) {
            newErrors.email = "Valid Email ID is required."
        }
        if (!formState.subject) newErrors.subject = "Subject is required.";
        if (!formState.remarks) newErrors.remarks = "Remarks are required.";
        return newErrors;
    };

    const handleClear = () => {
        setFormState(initialFormState);
        setErrors({});
    };

    const handleSave = (e) => {
        e.preventDefault()
        const newErrors = validateForm();
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            setIsPending(true)
            let params = {
                "name": formState.name,
                "mobileNumber": formState.mobile,
                "email": formState.email,
                "remarks": formState.remarks,
                "enquiryOption": formState.subject.value,
                "loginId": empCode
            }
            enquiryApiClient.post(`${CREATE_ENQUIRY}`, params)
                .then(function (response) {
                    setIsPending(false);
                    if (response.data.status === 1) {
                        toast.success(response.data.message)
                        handleClear()
                        getEnquires()
                    }
                    else {
                        toast.error(response.data.message)
                    }

                })
                .catch(function (error) {
                    setIsPending(false);
                    toast.error(error.message);
                });
        } else {
            toast.error("Please Fill In All Required Fields.");
        }
    };

    const subjectDropDopwnData = [
        { label: "Studio Apartment", value: "STUDIO_APARTMENT" },
        { label: "Two BHK", value: "TWO_BHK" },
        { label: "Three BHK", value: "THREE_BHK" },
        { label: "Retail Shop", value: "RETAIL_SHOP" },
        { label: "Other", value: "OTHER" },
    ]

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            sortable: true,
            width: "5%",
        },
        {
            name: <span className="font-weight-bold fs-13">Enquiry Date & Time</span>,
            selector: (row) => row.enquiryDate,
            width: "20%",
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.enquiryDate)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Name</span>,
            selector: (row) => row.name,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.name}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Mobile No.</span>,
            selector: (row) => row.mobileNumber,
            sortable: true,
            cell: (row) => (
                <div className="phone-container">
                    <MdMobileFriendly
                        className="phone-icon"
                        color={defaultTheme.goldColorLogo}
                    />
                    <span className="phone-number">{row.mobileNumber}</span>
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Email ID</span>,
            selector: (row) => row.email,
            sortable: true,
            cell: (row) =>
                row.email ? (
                    <div className="phone-container">
                        <MdEmail
                            className="phone-icon"
                            color={defaultTheme.goldColorLogo}
                        />
                        <span className="phone-number">{row.email}</span>
                    </div>
                ) : null,
        },
        {
            name: <span className="font-weight-bold fs-13">Property Options</span>,
            selector: (row) => row.enquiryOption,
            sortable: true,
            width: "20%",
            cell: (row) => <WordWrapCell>{formatActionType(row.enquiryOption)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Remarks</span>,
            selector: (row) => row.remarks,
            sortable: true,
            width: "50%",
            cell: (row) => <WordWrapCell>{row.remarks}</WordWrapCell>
        },
    ];


    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'add-enquiry');
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
            <Breadcrumbs title="Enquiry" breadcrumbItem="ADD Enquiry" />
            {(isPending || isLoading) && <ScreenLoader />}
            <Container fluid={true}>
                <form onSubmit={handleSave}>
                    <Card>
                        <CardBody>
                            <Row>
                                <Col md="4">
                                    <h6 className="font-size-11">
                                        Name <RequiredStar />
                                    </h6>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        placeholder="Enter Name..."
                                        value={formState.name}
                                        onChange={handleInputChange}
                                    />
                                    {errors.name && <div className="text-danger font-size-11">{errors.name}</div>}
                                </Col>

                                <Col md="4">
                                    <h6 className="font-size-11">
                                        Mobile Number <RequiredStar />
                                    </h6>
                                    <input
                                        type="text"
                                        name="mobile"
                                        maxLength={10}
                                        className="form-control"
                                        placeholder="Enter Mobile Number..."
                                        value={formState.mobile}
                                        onChange={handleInputChange}
                                    />
                                    {errors.mobile && <div className="text-danger font-size-11">{errors.mobile}</div>}
                                </Col>

                                <Col md="4">
                                    <h6 className="font-size-11">
                                        Email
                                    </h6>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="Enter Email..."
                                        value={formState.email}
                                        onChange={handleInputChange}
                                    />
                                    {errors.email && <div className="text-danger font-size-11">{errors.email}</div>}
                                </Col>

                                <Col md="4">
                                    <h6 className="font-size-11 mt-3">
                                        Subject <RequiredStar />
                                    </h6>
                                    <Select
                                        menuPortalTarget={document.body}
                                        isClearable
                                        value={formState.subject}
                                        onChange={handleSelectChange}
                                        options={subjectDropDopwnData}
                                    />
                                    {errors.subject && <div className="text-danger font-size-11">{errors.subject}</div>}
                                </Col>

                                <Col md="8">
                                    <h6 className="font-size-12 mt-3">
                                        Remarks <RequiredStar />
                                    </h6>
                                    <textarea
                                        name="remarks"
                                        required
                                        className="form-control"
                                        rows="4"
                                        placeholder="Type here..."
                                        value={formState.remarks}
                                        onChange={handleInputChange}
                                    ></textarea>
                                    {errors.remarks && <div className="text-danger font-size-11">{errors.remarks}</div>}
                                </Col>
                            </Row>

                            <Row className="justify-content-center mt-4">
                                <Col md="auto">
                                    <div className="d-flex align-items-center">
                                        <button
                                            className="btn btn-primary"
                                            type="submit"
                                            onClick={handleSave}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="btn btn-secondary ms-2"
                                            type="button"
                                            onClick={handleClear}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </form>
            </Container>

            {Array.isArray(enquiryList) && enquiryList.length > 0 &&
                <AppTable
                    columns={columns}
                    data={Array.isArray(enquiryList) ? enquiryList : []}
                    pagination
                    progressPending={isLoading}
                />
            }
        </PageContent>
    );
}
