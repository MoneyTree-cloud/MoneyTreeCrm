/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import { useUserStore } from "../../store/useUserStore";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { RegexFile } from "../../helpers/RegexFile";
import ApiClient from "../../helpers/api_helper";
import { CREATE_NEW_ENQUIRY, DOWNLOAD_ENQUIRY_EXCEL, GET_ENQUIRY_BY_ID } from "../../helpers/url_helper";
import { useGet } from "../../Hooks/useApi";
import AppTable from "../../components/Common/Table";
import { MdEmail, MdMobileFriendly } from "react-icons/md";
import { formatActionType, formatDateForInput, formatDateTime, generateTimestamp, RequiredStar, WordWrapCell } from "../../helpers/function_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function NewEnquiry() {
    const initialFormState = {
        name: "",
        mobile: "",
        email: "",
        subject: null,
        enquiryOptionNewQuery: null,
        remarks: "",
    };

    const empCode = useUserStore((state) => state.user.empCode);
    const [formState, setFormState] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [accessGranted, setAccessGranted] = useState(null);
    const userId = useUserStore((state) => state.user.userId);
    const [isPending, setIsPending] = useState(false)
    const [enquiryList, setEnquiryList] = useState([]);
    const LIMIT = 100;
    const [page, setPage] = useState(1);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [apiUrl, setApiUrl] = useState("");
    const [flag, setFlag] = useState(false)
    const [filterSubject, setFilterSubject] = useState(null);

    const buildApiUrl = (from, to, offset, subject) => {
        const url = `${GET_ENQUIRY_BY_ID}${empCode}&fromDate=${from}&toDate=${to}&offset=${offset}&limit=${LIMIT}`;

        if (subject) {
            return `${url}&type=${subject.label}`;
        }

        return url;
    };

    const { data, isLoading, refetch: getEnquires } = useGet(apiUrl, { enabled: Boolean(apiUrl && accessGranted), });

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

    useEffect(() => {
        if (flag) {
            setApiUrl(buildApiUrl(fromDate, toDate, page - 1, filterSubject));
        }
    }, [page]);

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

    const handleSelectOtherChange = (selectedGroup) => {
        setFormState((prevState) => ({
            ...prevState,
            enquiryOptionNewQuery: selectedGroup,
        }));
        setErrors((prevErrors) => ({ ...prevErrors, enquiryOptionNewQuery: null }));
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
        if (!formState.subject) newErrors.subject = "Enquiry Option is required.";
        if (formState.subject?.value === 'NewQuery' && !formState?.enquiryOptionNewQuery) newErrors.enquiryOptionNewQuery = "Other Enquiry Option is required.";
        if (!formState.remarks) newErrors.remarks = "Remarks are required.";
        return newErrors;
    };

    const getInitialData = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        setFromDate(formatDateForInput(startOfMonth));
        setToDate(formatDateForInput(endOfMonth));
        setApiUrl(buildApiUrl(formatDateForInput(startOfMonth), formatDateForInput(endOfMonth), 0));
        setFilterSubject(null);
    }

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
                "otherEnquiryOption": formState.subject.value,
                "enquiryOption": formState.subject.value === "NewQuery" ? formState.enquiryOptionNewQuery?.value : null,
                "loginId": empCode
            }
            ApiClient.post(`${CREATE_NEW_ENQUIRY}`, params)
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
        { label: "New Query", value: "NewQuery" },
        { label: "Vendor", value: "Vendor" },
        { label: "Builder", value: "Builder" },
        { label: "Job Query", value: "JobQuery" },
        { label: "Junk Query", value: "JunkQuery" },
        { label: "General Query", value: "GeneralQuery" },
        { label: "Complaint Call", value: "ComplaintCall" },
        { label: "Query For Rental", value: "QueryForRental" },
        { label: "Broker Call", value: "BrokerCall" },
    ]

    const otherEnquiryOptionData = [
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
            width: "18%",
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
            name: <span className="font-weight-bold fs-13">Other Enquiry Options</span>,
            selector: (row) => row.otherEnquiryOption,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.otherEnquiryOption}</WordWrapCell>,
        },
        {
            name: <span className="font-weight-bold fs-13">Enquiry Options</span>,
            selector: (row) => row.enquiryOption,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatActionType(row.enquiryOption)}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Remarks</span>,
            selector: (row) => row.remarks,
            sortable: true,
            width: "50%",
            cell: (row) => <WordWrapCell>{row.remarks}</WordWrapCell>,
        },
    ];

    const handleShowButton = (e) => {
        e.preventDefault();
        setPage(1);
        setApiUrl(buildApiUrl(fromDate, toDate, 0, filterSubject));
    };

    const downloadExcel = async () => {
        try {
            const response = await ApiClient.get(`${DOWNLOAD_ENQUIRY_EXCEL}${empCode}&fromDate=${fromDate}&toDate=${toDate}`, { responseType: "arraybuffer" });
            const contentType = response.headers["content-type"];

            if (contentType !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                const errorResponse = new TextDecoder("utf-8").decode(new Uint8Array(response.data));
                const parsedError = JSON.parse(errorResponse);
                toast.error(parsedError.message || "Something went wrong!");
                return;
            }

            const blob = new Blob([response.data], { type: contentType });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = `enquiry_data_${generateTimestamp()}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            toast.error(error.message || "An unexpected error occurred.");
        }
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'new-enquiry');
            setAccessGranted(hasAccess);
            if (hasAccess) {
                getInitialData();
            }
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
                            <Row className="g-3">
                                <Col md="4">
                                    <h6 className="font-size-11">Name <RequiredStar /></h6>
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
                                    <h6 className="font-size-11">Mobile Number <RequiredStar /></h6>
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
                                    <h6 className="font-size-11">Email</h6>
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
                                    <h6 className="font-size-11">Enquiry Option <RequiredStar /></h6>
                                    <Select
                                        menuPortalTarget={document.body}
                                        isClearable
                                        value={formState.subject}
                                        onChange={handleSelectChange}
                                        options={subjectDropDopwnData}
                                    />
                                    {errors.subject && <div className="text-danger font-size-11">{errors.subject}</div>}
                                </Col>
                                {formState.subject?.value === 'NewQuery' &&
                                    <Col md="4">
                                        <h6 className="font-size-11">Other Enquiry Option <RequiredStar /></h6>
                                        <Select
                                            menuPortalTarget={document.body}
                                            isClearable
                                            value={formState.enquiryOptionNewQuery}
                                            onChange={handleSelectOtherChange}
                                            options={otherEnquiryOptionData}
                                        />
                                        {errors.enquiryOptionNewQuery && <div className="text-danger font-size-11">{errors.enquiryOptionNewQuery}</div>}
                                    </Col>
                                }
                                <Col md={formState.subject?.value === 'NewQuery' ? "4" : "8"}>
                                    <h6 className="font-size-12">Remarks <RequiredStar /></h6>
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
                                <Col md="4" className="d-flex align-items-center">
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
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </form>
            </Container>

            <Card>
                <CardBody>
                    <form onSubmit={handleShowButton}>
                        <Row className="g-2">
                            <Col md="3">
                                <h6 className="font-size-11">From Date</h6>
                                <input
                                    className="form-control"
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </Col>
                            <Col md="3">
                                <h6 className="font-size-11">To Date</h6>
                                <input
                                    className="form-control"
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </Col>
                            <Col md="3">
                                <h6 className="font-size-11">Enquiry Option</h6>
                                <Select
                                    menuPortalTarget={document.body}
                                    isClearable
                                    value={filterSubject}
                                    onChange={setFilterSubject}
                                    options={subjectDropDopwnData}
                                />
                            </Col>
                            <Col md="3" className="d-flex align-items-end justify-content-start">
                                <Button
                                    color="primary"
                                    onClick={handleShowButton}
                                    type="submit"
                                    className="ms-2 me-2"
                                >
                                    Show
                                </Button>
                                <Button
                                    color="secondary"
                                    onClick={getInitialData}
                                    type="reset"
                                >
                                    Clear
                                </Button>
                            </Col>
                        </Row>
                    </form>
                </CardBody>
            </Card>
            {enquiryList?.content?.length > 0 && (
                <i
                    className="fas fa-file-excel"
                    style={{
                        color: defaultTheme.primary,
                        cursor: "pointer",
                        fontSize: "16px",
                        marginBottom: 10,
                    }}
                    onClick={downloadExcel}
                />
            )}
            <AppTable
                columns={columns}
                data={Array.isArray(enquiryList?.content) ? enquiryList?.content : []}
                progressPending={isLoading}
                pagination
                paginationTotalRows={enquiryList?.totalElements || 0}
                paginationServer
                onChangePage={(newPage) => {
                    setPage(newPage);
                    setFlag(true)
                }}
            />
        </PageContent>
    );
}