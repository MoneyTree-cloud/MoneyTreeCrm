/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, FormGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";
import { ALL_CONNECT_PAYOUT_LIST, CREATE_CONNECT_PAYOUT, GET_CONNECT_PAYOUT } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PageContent from "../../components/Common/PageContent";
import AppTable from "../../components/Common/Table";
import ApiClient from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { MdAddBox } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useUserStore } from "../../store/useUserStore";
import { formatDate, numericInputOnly, RequiredStar } from "../../helpers/function_helper";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";

export default function ConnectPayout() {
    const empCode = useUserStore((state) => state.user.empCode);
    const [payoutType, setPayoutType] = useState(false);
    const [page, setPage] = useState(1)
    const limit = 100;
    const [payoutList, setPayoutList] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [saleId, setSaleId] = useState('')
    const [payoutData, setPayoutData] = useState('')
    const [modalOpen, setModalOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const userId = useUserStore((state) => state.user.userId);
    const [accessGranted, setAccessGranted] = useState(null);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'connect-payout');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const initialFormState = {
        transactionId: '',
        bankName: '',
        amount: '',
        tdsAmount: '',
        totalAmount: '',
        transactionDate: ''
    }

    const [formData, setFormData] = useState(initialFormState);

    const toggleModal = () => {
        setModalOpen(!modalOpen)
        setFormData(initialFormState);
    };

    const toggleShow = () => {
        setIsOpen(!isOpen)
    };

    useEffect(() => {
        if (accessGranted) {
            getPayoutDetails(`${ALL_CONNECT_PAYOUT_LIST}?offset=${page - 1}&limit=${limit}&status=${payoutType}`)
        }
    }, [page, accessGranted])

    const getPayoutDetails = (url) => {
        setIsLoading(true);
        ApiClient.get(url)
            .then(function (response) {
                setIsLoading(false);
                if (response?.data?.status === 1) {
                    const encryptedContent = response.data.data;  

                    decryptData(encryptedContent).then((decrypted) => {
                        setPayoutList(decrypted);  
                    }).catch((error) => {
                        setPayoutList([]);  
                    });
                } else {
                    if (response.data.message === 'No record found.') {
                        setPayoutList([])
                        return
                    }
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsLoading(false);
                toast.error(error.message);
            });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        let updatedFormData = {
            ...formData,
            [name]: value
        };

        // Auto-calculate totalAmount only if amount and tdsAmount are present
        const amount = name === 'amount' ? parseFloat(value) : parseFloat(updatedFormData.amount);
        const tdsAmount = name === 'tdsAmount' ? parseFloat(value) : parseFloat(updatedFormData.tdsAmount);

        if (!isNaN(amount) && !isNaN(tdsAmount)) {
            updatedFormData.totalAmount = amount - tdsAmount;
        }
        setFormData(updatedFormData);
    };

    const handleSubmit = () => {
        if (
            !formData.transactionId ||
            !formData.bankName ||
            !formData.amount ||
            !formData.tdsAmount ||
            !formData.transactionDate
        ) {
            toast.error('Please fill in all required fields.');
            return;
        }

        if (parseFloat(formData.amount) < parseFloat(formData.tdsAmount)) {
            toast.error('TDS Amount cannot be greater than the total Amount.');
            return;
        }
        setIsLoading(true);
        const finalData = {
            ...formData,
            saleId: saleId,
            createdBy: empCode
        };
        ApiClient.post(CREATE_CONNECT_PAYOUT, finalData)
            .then(function (response) {
                setIsLoading(false);
                toggleModal();
                if (response?.data?.status === 1) {
                    toast.success(response.data.message)
                    setFormData(initialFormState);
                    setSaleId('')
                    getPayoutDetails(`${ALL_CONNECT_PAYOUT_LIST}?offset=${page - 1}&limit=${limit}&status=${payoutType}`)
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                toggleModal();
                setIsLoading(false);
                toast.error(error.message);
            });
    };

    const handleAdd = (saleId) => {
        setSaleId(saleId)
        toggleModal()
    }

    const handleShow = (saleId) => {
        setSaleId(saleId)
        setIsLoading(true);
        ApiClient.post(GET_CONNECT_PAYOUT + saleId)
            .then(function (response) {
                setIsLoading(false);
                if (response?.data?.status === 1) {
                    setPayoutData(response.data.data);
                    toggleShow()
                } else {
                    setPayoutData('');
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsLoading(false);
                toast.error(error.message);
            });
    }

    const columns = [
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (row, index) => index + 1,
            sortable: true,
            width: "5%",
        },
        {
            name: <span className="font-weight-bold fs-13">Unique ID</span>,
            selector: (row) => row.saleId,
            sortable: true,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.saleId}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Connect Details</span>,
            selector: (row) => row.connectSuspectName,
            sortable: true,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.connectSuspectName + ' (' + row.connectSuspectId + ')'}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Booking Range</span>,
            selector: (row) => row.bookingRange,
            sortable: true,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.bookingRange}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Client Name</span>,
            selector: (row) => row.clientName,
            sortable: true,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.clientName}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Associate Details</span>,
            selector: (row) => row.associateName,
            sortable: true,
            cell: (row) => (
                <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {row.associateName}
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Action</span>,
            selector: (row) => (
                <div>
                    {payoutType ?
                        <FaEye
                            size={20}
                            style={{ color: defaultTheme.primary }}
                            onClick={() => handleShow(row.saleId)}
                        /> :
                        <MdAddBox
                            size={24}
                            style={{ color: defaultTheme.primary }}
                            onClick={() => handleAdd(row.saleId)}
                        />
                    }
                </div>
            ),
            sortable: true,
        },
    ];

    const handleRadioChange = (event) => {
        const value = event.target.value === "true"; // convert string to boolean
        setPayoutType(value);
        getPayoutDetails(`${ALL_CONNECT_PAYOUT_LIST}?offset=${page - 1}&limit=${limit}&status=${value}`)
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Connect" breadcrumbItem="Payout" />
            {(isLoading) && <ScreenLoader />}
            <div className="radio-button-container">
                <label className={`radio-label ${payoutType === false ? "active" : ""}`}>
                    <input
                        type="radio"
                        value={false}
                        checked={payoutType === false}
                        onChange={handleRadioChange}
                    />
                    Pending
                </label>
                <label className={`radio-label ${payoutType === true ? "active" : ""}`}>
                    <input
                        type="radio"
                        value={true}
                        checked={payoutType === true}
                        onChange={handleRadioChange}
                    />
                    Completed
                </label>
            </div>
            <Container fluid={true}>
                <AppTable
                    progressPending={isLoading}
                    columns={columns}
                    data={payoutList?.content || []}
                    pagination
                    paginationTotalRows={payoutList?.totalElements || 0}
                    paginationServer
                    onChangePage={(newPage) => setPage(newPage)}
                />
            </Container>

            <Modal isOpen={modalOpen} toggle={toggleModal}>
                <ModalHeader toggle={toggleModal}>Payout Information</ModalHeader>
                <ModalBody>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <h6 className="font-size-10">Bank Name <RequiredStar/> </h6>
                                    <Input
                                        type="text"
                                        name="bankName"
                                        id="bankName"
                                        placeholder="Bank Name"
                                        value={formData.bankName}
                                        onChange={handleChange}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <h6 className="font-size-10">Bank Txn ID <RequiredStar/> </h6>
                                    <Input
                                        type="text"
                                        name="transactionId"
                                        id="transactionId"
                                        placeholder="Transaction ID"
                                        value={formData.transactionId}
                                        onChange={handleChange}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <h6 className="font-size-10">Transaction Date <RequiredStar/> </h6>
                                    <Input
                                        type="date"
                                        name="transactionDate"
                                        id="transactionDate"
                                        value={formData.transactionDate}
                                        onChange={handleChange}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <h6 className="font-size-10">Payout Amount <RequiredStar/> </h6>
                                    <Input
                                        type="number"
                                        name="amount"
                                        id="amount"
                                        placeholder="Amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        min="0"
                                        step="1"
                                        onKeyDown={numericInputOnly}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <h6 className="font-size-10">TDS Amount <RequiredStar/> </h6>
                                    <Input
                                        type="number"
                                        name="tdsAmount"
                                        id="tdsAmount"
                                        placeholder="TDS Amount"
                                        value={formData.tdsAmount}
                                        onChange={handleChange}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        min="0"
                                        step="1"
                                        onKeyDown={numericInputOnly}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <h6 className="font-size-10">Total Credited Amount </h6>
                                    <Input
                                        type="number"
                                        readOnly
                                        style={{ backgroundColor: defaultTheme.btnDisable }}
                                        name="totalAmount"
                                        id="totalAmount"
                                        placeholder="Total Amount"
                                        value={formData.totalAmount}
                                        onChange={handleChange}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="success"
                        style={{ backgroundColor: defaultTheme.primary }}
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                    <Button
                        color="secondary"
                        style={{ backgroundColor: defaultTheme.goldColorLogo }}
                        onClick={toggleModal}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={isOpen} toggle={toggleShow}>
                <ModalHeader toggle={toggleShow}>Payout Details</ModalHeader>
                <ModalBody>
                    <Row>
                        <Col md={6}>
                            <strong>Bank Name:</strong>
                            <div>{payoutData?.bankName || '-'}</div>
                        </Col>
                        <Col md={6}>
                            <strong>Bank Txn ID:</strong>
                            <div>{payoutData?.transactionId || '-'}</div>
                        </Col>

                    </Row>
                    <Row className="mt-3">
                        <Col md={6}>
                            <strong>Transaction Date:</strong>
                            <div>{formatDate(payoutData?.transactionDate) || '-'}</div>
                        </Col>
                        <Col md={6}>
                            <strong>Amount:</strong>
                            <div>₹ {payoutData?.amount || 0}</div>
                        </Col>

                    </Row>
                    <Row className="mt-3">
                        <Col md={6}>
                            <strong>TDS Amount:</strong>
                            <div>₹ {payoutData?.tdsAmount || 0}</div>
                        </Col>
                        <Col md={6}>
                            <strong>Total Amount:</strong>
                            <div>₹ {payoutData?.totalAmount}</div>
                        </Col>

                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="secondary"
                        onClick={toggleShow}
                        style={{ backgroundColor: defaultTheme.goldColorLogo }}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>

        </PageContent>
    );
}