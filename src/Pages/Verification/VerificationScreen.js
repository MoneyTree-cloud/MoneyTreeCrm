// import React, { useState } from "react";
// import { Card, CardBody, Col, Container, Row } from "reactstrap";
// import { toast } from "react-toastify";
// import { VERIFY_BANK, VERIFY_PAN } from "../../helpers/url_helper";
// import { verificationApiClient } from "../../helpers/api_helper";
// import ScreenLoader from "../../constants/ScreenLoader";
// import { defaultTheme } from "../../helpers/defaultTheme";
// import Breadcrumbs from "../../components/Common/Breadcrumb";
// import { RegexFile } from "../../helpers/RegexFile";
// import PageContent from "../../components/Common/PageContent";

// export default function VerificationScreen() {
//     // Initial form state
//     const initialFormState = {
//         bankAccountNum: "",
//         bankIfscCode: "",
//     };

//     const [panNumber, setPanNumber] = useState('')
//     const [isPending, setIsPending] = useState(false);
//     const [formState, setFormState] = useState(initialFormState);
//     const [panData, setPanData] = useState('')
//     const [bankData, setBankData] = useState('')
//     const [taskType, setTaskType] = useState("Bank");

//     const handleChange = (e) => {
//         const { id, value } = e.target;
//         setFormState((prevState) => ({
//             ...prevState,
//             [id]: value,
//         }));
//     };

//     const handleRadioChange = (event) => {
//         setTaskType(event.target.value);
//     };

//     const handleShowData = (e) => {
//         e.preventDefault();
//         if (!formState.bankAccountNum) {
//             toast.error('Please Enter Account Number')
//         }
//         else if (!formState.bankIfscCode) {
//             toast.error('Please Enter IFSC Code')
//         }
//         else {
//             getBankVerificationDetails();
//         }
//     };

//     const handleShowPanData = (e) => {
//         e.preventDefault();

//         if (!panNumber) {
//             toast.error('Please Enter PAN Number')
//             return
//         }
//         else if (!RegexFile.panNo.test(panNumber.toUpperCase())) {
//             toast.error('Please Enter Valid PAN Number')
//             return
//         }
//         else {

//             setIsPending(true)
//             verificationApiClient.post(`${VERIFY_PAN}${panNumber.toUpperCase()}`, {
//                 headers: {
//                     "Content-Type": "application/json", // Manually set here
//                 },
//             })
//                 .then(function (response) {
//                     setIsPending(false);
//                     if (response.data.statusCode === 1) {
//                         if (response.data.data.valid === 'true') {
//                             setPanData(response.data.data)
//                         }
//                         else {
//                             setPanData('')
//                             toast.error('PAN Number is invalid')
//                         }
//                     }
//                     else {
//                         setPanData('')
//                         toast.error(response.data.message)
//                     }

//                 })
//                 .catch(function (error) {
//                     setPanData('')
//                     setIsPending(false);
//                     toast.error(error.message);
//                 });
//         }
//     }

//     const handleClearPan = () => {
//         setPanNumber('')
//         setPanData('')
//     }

//     const handleClear = () => {
//         setFormState(initialFormState)
//         setBankData('')
//     };

//     const getBankVerificationDetails = () => {
//         setIsPending(true)
//         let params = {
//             "bank_account": formState?.bankAccountNum,
//             "ifsc": formState?.bankIfscCode,
//             "name": "Himanshu",
//             "phone": "7992304986",
//             "companyId": "C00001"
//         }
//         verificationApiClient.post(`${VERIFY_BANK}`, params, {
//             headers: {
//                 "Content-Type": "application/json", // Manually set here
//             },
//         })
//             .then(function (response) {
//                 setIsPending(false);
//                 if (response.data.statusCode === 1) {
//                     if (response.data.data.accountStatus === 'INVALID') {
//                         toast.error('Bank Account Is Invalid')
//                         setBankData('')
//                     }
//                     else {
//                         setBankData(response.data.data)
//                     }
//                 }
//                 else {
//                     setBankData('')
//                     toast.error(response.data.message)
//                 }

//             })
//             .catch(function (error) {
//                 setBankData('')
//                 setIsPending(false);
//                 toast.error(error.message);
//             });
//     };


//     return (
//         <PageContent>
//             <Breadcrumbs title="Verification" breadcrumbItem="Bank & PAN" />
//             {isPending && <ScreenLoader />}
//             <Container fluid={true}>
//                 <form onSubmit={handleShowData}>
//                     <div className="radio-button-container">
//                         <label
//                             className={`radio-label ${taskType === "Bank" ? "active" : ""
//                                 }`}
//                         >
//                             <input
//                                 type="radio"
//                                 value="Bank"
//                                 checked={taskType === "Bank"}
//                                 onChange={handleRadioChange}
//                             />
//                             Bank
//                         </label>
//                         <label
//                             className={`radio-label ${taskType === "PAN" ? "active" : ""
//                                 }`}
//                         >
//                             <input
//                                 type="radio"
//                                 value="PAN"
//                                 checked={taskType === "PAN"}
//                                 onChange={handleRadioChange}
//                             />
//                             PAN
//                         </label>
//                     </div>
//                     <Card>
//                         <CardBody>
//                             {taskType === 'Bank' ?
//                                 <div>
//                                     <Row>
//                                         <Col md="4 mt-1">
//                                             <h6 className="font-size-11">Account Number</h6>
//                                             <input
//                                                 id="bankAccountNum"
//                                                 className="form-control"
//                                                 type="text"
//                                                 value={formState.bankAccountNum}
//                                                 placeholder="Account Number"
//                                                 onChange={handleChange}
//                                             />
//                                         </Col>
//                                         <Col md="4 mt-1">
//                                             <h6 className="font-size-11">IFSC Code</h6>
//                                             <input
//                                                 id="bankIfscCode"
//                                                 className="form-control"
//                                                 type="text"
//                                                 placeholder="IFSC Code"
//                                                 value={formState.bankIfscCode.toUpperCase()}
//                                                 onChange={handleChange}
//                                             />
//                                         </Col>

//                                         <Col lg="4">
//                                             <div className="d-flex align-items-center mt-4">
//                                                 <button
//                                                     type="submit"
//                                                     className="btn btn-primary"
//                                                     onClick={handleShowData}
//                                                 >
//                                                     Verify
//                                                 </button>
//                                                 <button
//                                                     type="button"
//                                                     className="btn btn-secondary ms-3"
//                                                     onClick={handleClear}
//                                                 >
//                                                     Clear
//                                                 </button>
//                                             </div>
//                                         </Col>
//                                     </Row>


//                                     {bankData &&
//                                         <Row>
//                                             <Col md="4 mt-4">
//                                                 <h6 className="font-size-11">Account Holder Name</h6>
//                                                 <input
//                                                     id="bankAccountNum"
//                                                     className="form-control"
//                                                     type="text"
//                                                     readOnly
//                                                     value={bankData?.nameAtBank}
//                                                     style={{ backgroundColor: defaultTheme.btnDisable }}

//                                                     placeholder="Account Holder Name"
//                                                 />
//                                             </Col>
//                                             <Col md="4 mt-4">
//                                                 <h6 className="font-size-11">Bank Name</h6>
//                                                 <input
//                                                     id="bankIfscCode"
//                                                     className="form-control"
//                                                     type="text"
//                                                     readOnly
//                                                     placeholder="Bank Name"
//                                                     style={{ backgroundColor: defaultTheme.btnDisable }}
//                                                     value={bankData?.bankName}
//                                                 />
//                                             </Col>

//                                             <Col md="4 mt-4">
//                                                 <h6 className="font-size-11">Branch Name</h6>
//                                                 <input
//                                                     id="bankIfscCode"
//                                                     className="form-control"
//                                                     type="text"
//                                                     readOnly
//                                                     style={{ backgroundColor: defaultTheme.btnDisable }}
//                                                     placeholder="Bank Branch"
//                                                     value={bankData?.branch}
//                                                 />
//                                             </Col>


//                                         </Row>
//                                     }
//                                 </div>
//                                 :
//                                 <div>
//                                     <Row>
//                                         <Col md="4 mt-1">
//                                             <h6 className="font-size-11">PAN Number</h6>
//                                             <input
//                                                 id="bankAccountNum"
//                                                 className="form-control"
//                                                 type="text"
//                                                 maxLength={10}
//                                                 value={panNumber.toUpperCase()}
//                                                 placeholder="PAN Number"
//                                                 onChange={(e) => setPanNumber(e.target.value)}
//                                             />
//                                         </Col>


//                                         <Col lg="4">
//                                             <div className="d-flex align-items-center mt-4">
//                                                 <button
//                                                     type="submit"
//                                                     className="btn btn-primary"
//                                                     onClick={handleShowPanData}
//                                                 >
//                                                     Verify
//                                                 </button>
//                                                 <button
//                                                     type="button"
//                                                     className="btn btn-secondary ms-3"
//                                                     onClick={handleClearPan}
//                                                 >
//                                                     Clear
//                                                 </button>
//                                             </div>
//                                         </Col>
//                                     </Row>
//                                     {panData &&
//                                         <Row>
//                                             <Col md="4 mt-4">
//                                                 <h6 className="font-size-11">Name</h6>
//                                                 <input
//                                                     className="form-control"
//                                                     type="text"
//                                                     readOnly
//                                                     value={panData?.registeredName}
//                                                     style={{ backgroundColor: defaultTheme.btnDisable }}

//                                                     placeholder="Name"
//                                                 />
//                                             </Col>
//                                             <Col md="4 mt-4">
//                                                 <h6 className="font-size-11">Type</h6>
//                                                 <input
//                                                     className="form-control"
//                                                     type="text"
//                                                     readOnly
//                                                     placeholder="Type"
//                                                     style={{ backgroundColor: defaultTheme.btnDisable }}
//                                                     value={panData?.type}
//                                                 />
//                                             </Col>

//                                         </Row>
//                                     }
//                                 </div>
//                             }
//                         </CardBody>
//                     </Card>
//                 </form>
//             </Container>
//         </PageContent>
//     );
// }
