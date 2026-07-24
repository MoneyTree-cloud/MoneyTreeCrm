/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import AppTable from "../../components/Common/Table";
import { useGet, usePost } from "../../Hooks/useApi";
import { GET_ALL_USERS_DROPDOWN_ALL, GET_MY_ALL_TEAM, GET_SUSPECT_DATA_BY_ASSOCIATE_ID_NEW, TRANSFER_LEAD_DATA } from "../../helpers/url_helper";
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";
import { formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import { useUserStore } from "../../store/useUserStore";
import { MdMobileFriendly } from "react-icons/md";
import "../CSS/styles.css";
import ApiClient from "../../helpers/api_helper";
import PageContent from "../../components/Common/PageContent";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import { decryptData } from "../../components/Common/CryptoUtils";
import { USER_TYPE } from "../../constants/global";

export default function TransferSuspects() {
    const { userId, role } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);

    // const mainTeam = useUserStore((state) => state.user.mainTeam);
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [rowData, setRowData] = useState([]);
    const [pending, setPending] = useState(false);
    const [totalElements, setTotalElements] = useState("");
    const [flag, setFlag] = useState(false)
    const [page, setPage] = useState(1);
    const [pageLimit, setPageLimit] = useState(200);

    const INITIALSTATE = {
        associateSelect: null,
        toAssociateSelect: null,
        transferTypeSelect: null,
        suspectStatus: null
    };
    const [formState, setFormState] = useState(INITIALSTATE);
    const isAdminOrOther = role === USER_TYPE.ADMIN || role === USER_TYPE.OTHER;
    const endpoint = isAdminOrOther
        ? GET_ALL_USERS_DROPDOWN_ALL
        : `${GET_MY_ALL_TEAM}${userId}`;

    const { data: associateList, isLoading } = useGet(endpoint, { enabled: !!accessGranted });

    const getSuspectDetails = () => {
        setPending(true)
        let url = `${GET_SUSPECT_DATA_BY_ASSOCIATE_ID_NEW}${formState?.associateSelect?.value}&page=${page - 1}&size=${pageLimit}&isDnd=false`;

        if (formState?.suspectStatus) {
            url += `&status=${formState?.suspectStatus?.value}`;
        }
        ApiClient.get(url)
            .then(function (response) {
                setPending(false);
                if (response?.data?.status === 1) {
                    const encryptedContent = response.data.data;
                    decryptData(encryptedContent).then((decrypted) => {
                        const updatedRows = decrypted?.content.map((prospect) => ({
                            ...prospect,
                            isChecked: false, // Checkbox state for each prospect
                        }));
                        setTotalElements(decrypted?.totalElements)
                        setRowData(updatedRows);

                    }).catch((error) => {
                        setRowData([]);
                    });
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setPending(false);
                toast.error(error.message);
            });
    };

    const { isPending: transferLoading, mutate } = usePost(
        `${TRANSFER_LEAD_DATA}${formState?.toAssociateSelect?.value}&loginId=${userId}`,
        {
            onSuccess: (response) => {
                if (response?.data.status === 1) {
                    toast.success(response.data.message);
                } else {
                    toast.error(response.data.message);
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        }
    );

    useEffect(() => {
        const allChecked = rowData.every((row) => row.isChecked);
        setSelectAllChecked(allChecked);
    }, [rowData]);

    const handleCheckboxChange = (rowId) => {
        setRowData((prevData) => {
            const updatedData = prevData.map((row) =>
                row.leadId === rowId ? { ...row, isChecked: !row.isChecked } : row
            );

            // Check if any prospect is still checked
            const anyChecked = updatedData.some((row) => row.isChecked);
            setSelectAllChecked(anyChecked);

            return updatedData;
        });
    };

    const handleSelectAllChange = () => {
        const newCheckedState = !selectAllChecked;
        setRowData((prevData) =>
            prevData.map((row) => ({ ...row, isChecked: newCheckedState }))
        );
        setSelectAllChecked(newCheckedState);
    };

    useEffect(() => {
        if (formState.transferTypeSelect?.value === "All") {
            setRowData((prevData) =>
                prevData.map((row) => ({ ...row, isChecked: true }))
            );
            setSelectAllChecked(true);
        } else {
            setRowData((prevData) =>
                prevData.map((row) => ({ ...row, isChecked: false }))
            );
            setSelectAllChecked(false);
        }
    }, [formState.transferTypeSelect]);

    const columns = [
        {
            name: (
                <input
                    type="checkbox"
                    checked={selectAllChecked}
                    onChange={handleSelectAllChange}
                    aria-label="Select All"
                />
            ),
            cell: (row) => (
                <input
                    type="checkbox"
                    checked={row.isChecked}
                    onChange={() => handleCheckboxChange(row.leadId)}
                />
            ),
            width: "4%",
        },
        {
            name: <span className="font-weight-bold fs-13">SL No.</span>,
            selector: (_, index) => index + 1,
            width: "6%",
        },
        {
            name: <span className="font-weight-bold fs-13">Lead Name</span>,
            selector: (row) => row.leadName,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.leadName}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Mobile Number</span>,
            selector: (row) => row.leadMobile,
            cell: (row) => (
                <div className="phone-container">
                    <MdMobileFriendly
                        className="phone-icon"
                        color={defaultTheme.goldColorLogo}
                    />
                    <span className="phone-number">{row.leadMobile}</span>
                </div>
            ),
        },
        {
            name: <span className="font-weight-bold fs-13">Project</span>,
            selector: (row) => row.project,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.project}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Project Category</span>,
            selector: (row) => row.projectCategory,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.projectCategory}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Lead Remarks</span>,
            selector: (row) => row.leadRemark,
            sortable: true,
            cell: (row) => <WordWrapCell>{row.leadRemark || '-'}</WordWrapCell>
        },
        {
            name: <span className="font-weight-bold fs-13">Created At</span>,
            selector: (row) => row.createdDate,
            sortable: true,
            cell: (row) => <WordWrapCell>{formatDateTime(row.createdDate)}</WordWrapCell>
        }
    ];

    const handleSelectChange = (name, selectedOption) => {
        setFormState((prevState) => ({
            ...prevState,
            [name]: selectedOption,
        }));
    };

    const handleShowData = () => {
        if (!formState.associateSelect) {
            toast.error("Please Select Associate");
            return;
        } else {
            getSuspectDetails();
        }
    };

    useEffect(() => {
        if (flag) {
            getSuspectDetails();
        }
    }, [page]);

    const handleTransferData = () => {
        const selectedSuspects = rowData.filter((row) => row.isChecked);
        if (!formState.associateSelect) {
            toast.error("Please Select An Associate To Transfer From.");
        } else if (!formState.toAssociateSelect) {
            toast.error("Please Select An Associate To Transfer To.");
        } else if (selectedSuspects.length === 0) {
            toast.error("Please Select At Least One Suspect To Transfer.");
        }
        else {
            const prospectsToTransfer = selectedSuspects.map(
                ({ isChecked, ...rest }) => rest
            ); // Remove isChecked from each object
            mutate(prospectsToTransfer);
            // You can add further logic to handle the transfer here
        }
    };

    useEffect(() => {
        const checkAccess = async () => {
            if (role !== USER_TYPE.ASSOCIATE) {
                const hasAccess = await CheckUserAccess(userId, 'lead-transfer');
                setAccessGranted(hasAccess);
            }
            else {
                setAccessGranted(true)
            }
        };
        checkAccess();
    }, [userId, role]);

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />
    }

    return (
        <PageContent>
            <Breadcrumbs title="Transfer" breadcrumbItem="Suspects" />
            {(pending || transferLoading || isLoading) && <ScreenLoader />}
            <Container fluid={true}>
                <Card>
                    <CardBody>
                        <h3
                            style={{
                                fontSize: 12,
                                fontWeight: "bold",
                                color: defaultTheme.redColor,
                                marginBottom: 10
                            }}
                        >
                            Note: The maximum transfer limit is set to 200 by default. To change this, please update the value in the <strong>Limit</strong> input field. <br /> If no status is selected, all suspects will be displayed, including Self, Transferred, Hold, and Rejected.
                        </h3>

                        <Row className="g-3">
                            <Col lg="3">
                                <h6 className="font-size-11">Select Associate</h6>
                                <Select
                                    style={{ zIndex: 9999 }}
                                    menuPortalTarget={document.body}
                                    isClearable
                                    value={formState.associateSelect}
                                    onChange={(selectedOption) => handleSelectChange("associateSelect", selectedOption)}
                                    options={
                                        Array.isArray(associateList?.data?.data)
                                            ? associateList?.data?.data
                                            : []
                                    }
                                />
                            </Col>
                            <Col md="2">
                                <h6 className="font-size-11">Limit</h6>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Page Limit..."
                                    value={pageLimit}
                                    onChange={(e) => setPageLimit(e.target.value)}
                                />
                            </Col>
                            <Col lg="2">
                                <h6 className="font-size-11">Status</h6>
                                <Select
                                    style={{ zIndex: 9999 }}
                                    menuPortalTarget={document.body}
                                    isClearable
                                    value={formState.suspectStatus}
                                    onChange={(selectedOption) => handleSelectChange("suspectStatus", selectedOption)}
                                    options={[
                                        { label: 'CallBack', value: 'hold' },
                                        { label: 'Rejected', value: 'rejected' },
                                        { label: 'Self', value: 'self' },
                                        { label: 'Transferred', value: 'transferred' },
                                    ]}
                                />
                            </Col>

                            <Col lg="1" className="d-flex align-items-end justify-content-center">
                                <Button
                                    color="primary"
                                    onClick={handleShowData}
                                >
                                    Show
                                </Button>
                            </Col>
                            <Col lg="3">
                                <h6 className="font-size-11">To Associate</h6>
                                <Select
                                    style={{ zIndex: 9999 }}
                                    menuPortalTarget={document.body}
                                    isClearable
                                    value={formState.toAssociateSelect}
                                    onChange={(selectedOption) => handleSelectChange("toAssociateSelect", selectedOption)}
                                    options={
                                        Array.isArray(associateList?.data?.data)
                                            ? associateList?.data?.data?.filter(
                                                (option) =>
                                                    option.value !== formState.associateSelect?.value // Filter out the selected associate
                                            )
                                            : []
                                    }
                                />
                            </Col>

                            <Col
                                lg="1"
                                className="d-flex align-items-end justify-content-center"
                            >
                                <Button
                                    color="secondary"
                                    onClick={handleTransferData}
                                >
                                    Transfer
                                </Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                {rowData?.length > 0 && (
                    <AppTable
                        key={pageLimit}
                        progressPending={pending}
                        columns={columns}
                        data={rowData || []}
                        pagination
                        paginationPerPage={Number(pageLimit)}
                        paginationTotalRows={totalElements}
                        paginationServer
                        onChangePage={(newPage) => {
                            setPage(newPage);
                            setFlag(true);
                        }}

                    />
                )}
            </Container>
        </PageContent>
    );
}
