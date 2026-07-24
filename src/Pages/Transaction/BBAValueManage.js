import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Table } from "reactstrap";
import { toast } from "react-toastify";
import { GET_MTRS_STATUS, UPDATE_BBA_VALUE } from "../../helpers/url_helper";
import ApiClient from "../../helpers/api_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import PageContent from "../../components/Common/PageContent";
import { FaCheck, FaTimes } from "react-icons/fa";
import { defaultTheme } from "../../helpers/defaultTheme";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";

export default function MtrsStatus() {
    const { userId, empCode, userName } = useUserStore((state) => state.user);
    const [mtrsId, setMtrsId] = useState('')
    const [isPending, setIsPending] = useState(false);
    const [mtrsStatus, setMtrsStatus] = useState('')
    const [accessGranted, setAccessGranted] = useState(null);
    const [bbaValue, setBbaValue] = useState('')

    const handleShowData = (e) => {
        e.preventDefault();
        if (!mtrsId) {
            toast.error('Please Enter Unique ID')
            return;
        }
        else {
            setIsPending(true)
            ApiClient.get(`${GET_MTRS_STATUS}${mtrsId}`).then(function (response) {
                setIsPending(false);
                if (response.data.status === 1) {
                    setMtrsStatus(response.data.data)
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
    }

    const handleClear = () => {
        setMtrsId('')
        setMtrsStatus('')
        setBbaValue('')
    }

    const MtrsTableView = ({ mtrsId, clientName, unitNo, builder, project, bba, noc, stage, kyc, acknowledgement }) => {
        return (
            <Table striped>
                <thead>
                    <tr>
                        <th>Client Name</th>
                        <th>Unit No.</th>
                        <th>Builder</th>
                        <th>Project</th>
                        <th>Accepted By Builder</th>
                        <th>KYC</th>
                        <th>BBA</th>
                        <th>NOC</th>
                        <th>Acknowledgement</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{clientName}</td>
                        <td>{unitNo}</td>
                        <td>{builder}</td>
                        <td>{project}</td>
                        <td>
                            {stage ? <FaCheck
                                title="YES"
                                style={{ color: defaultTheme.primary, }}
                                size={15}
                            />
                                :
                                <FaTimes
                                    style={{ color: defaultTheme.redColor, }}
                                    size={15}
                                    title="NO"
                                />
                            }
                        </td>
                        <td>
                            {kyc === 'YES' ? <FaCheck
                                style={{ color: defaultTheme.primary, }}
                                title="YES"
                                size={15}
                            />
                                :
                                <FaTimes
                                    style={{ color: defaultTheme.redColor, }}
                                    title="NO"
                                    size={15}
                                />
                            }
                        </td>
                        <td>
                            {bba ? <FaCheck
                                style={{ color: defaultTheme.primary, }}
                                title="YES"
                                size={15}
                            />
                                :
                                <FaTimes
                                    style={{ color: defaultTheme.redColor, }}
                                    title="NO"
                                    size={15}
                                />
                            }
                        </td>
                        <td>
                            {noc?.length > 0 ? <FaCheck
                                style={{ color: defaultTheme.primary, }}
                                title="YES"
                                size={15}
                            />
                                :
                                <FaTimes
                                    style={{ color: defaultTheme.redColor, }}
                                    title="NO"
                                    size={15}
                                />
                            }
                        </td>
                    </tr>
                </tbody>
            </Table>
        );
    };

    const handleFinalClose = () => {
        // Check if value is entered
        if (bbaValue === "" || bbaValue === null || bbaValue === undefined) {
            toast.error("Please enter Sale Status Value (minimum 0)");
            return;
        }

        const numericValue = Number(bbaValue);

        // Validate numeric and minimum 0
        if (isNaN(numericValue) || numericValue < 0) {
            toast.error("Sale Status Value must be 0 or greater");
            return;
        }

        const firstMsg = `You are about to close Unique ID: ${mtrsId} with a recorded Sale Status Value of ₹${bbaValue}. Do you want to proceed?`;

        if (!window.confirm(firstMsg)) return;

        const secondMsg = `Please confirm once again. This action is irreversible and cannot be modified later.\n\nDo you want to proceed?`;
        if (!window.confirm(secondMsg)) return;

        const updatedBy = `${userName} (${empCode})`;
        let apiUrl = `${UPDATE_BBA_VALUE}?saleId=${mtrsStatus?.saleId}&updatedBy=${updatedBy}&bbaValue=${bbaValue}`;

        setIsPending(true);

        ApiClient.post(apiUrl)
            .then((response) => {
                setIsPending(false);
                if (response.data.status === 1) {
                    toast.success(response.data.message);
                    handleClear();
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch((error) => {
                setIsPending(false);
                toast.error(error.message);
            });
    };

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'bba-value-manage');
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
            <Breadcrumbs title="Sale" breadcrumbItem="Status" />
            {(isPending) && <ScreenLoader />}
            <Container fluid={true}>
                <form onSubmit={handleShowData}>
                    <Card>
                        <CardBody>
                            <Row className="g-3">
                                <Col md="6">
                                    <h6 className="font-size-11">Unique ID</h6>
                                    <input
                                        id="mtrsId"
                                        className="form-control"
                                        type="text"
                                        value={mtrsId}
                                        placeholder="Enter Unique ID..."
                                        onChange={(e) => setMtrsId(e.target.value)}
                                    />
                                </Col>

                                <Col lg="6" className="d-flex align-items-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={handleShowData}
                                    >
                                        Verify
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary ms-2"
                                        onClick={handleClear}
                                    >
                                        Clear
                                    </button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </form>

                {Object.keys(mtrsStatus)?.length > 0 && (
                    <>
                        <MtrsTableView
                            bba={mtrsStatus?.bba}
                            noc={mtrsStatus?.noc}
                            stage={mtrsStatus?.stage}
                            kyc={mtrsStatus?.kyc}
                            mtrsId={mtrsStatus?.saleId}
                            clientName={mtrsStatus?.clientName}
                            unitNo={mtrsStatus?.unitNo}
                            builder={mtrsStatus?.builder}
                            project={mtrsStatus?.project}
                            acknowledgement={mtrsStatus?.acknowledgement}
                        />

                        {/* ===================== NEW SECTION ADDED ===================== */}
                        <Card className="mt-3">
                            <CardBody>
                                <Row className="g-3">

                                    {/* Sales Status Input */}
                                    <Col md="6">
                                        <h6 className="font-size-11">Sales Status</h6>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter Sales Status"
                                            value={bbaValue}
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                // Allow only numbers and a single decimal (unlimited decimal places)
                                                if (/^\d*\.?\d*$/.test(value)) {
                                                    setBbaValue(value);
                                                }
                                            }}
                                        />
                                    </Col>

                                    {/* Close Button */}
                                    <Col md="6" className="d-flex align-items-end">
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            onClick={handleFinalClose}
                                        >
                                            Close
                                        </button>
                                    </Col>

                                </Row>
                            </CardBody>
                        </Card>
                        {/* ===================== NEW SECTION ENDS ===================== */}
                    </>
                )}
            </Container>
        </PageContent>
    );
}
