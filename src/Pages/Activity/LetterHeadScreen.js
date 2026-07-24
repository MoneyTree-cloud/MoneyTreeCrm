/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Container, Input, Button, Spinner } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import { useGet } from "../../Hooks/useApi";
import { GET_LETTER_HEAD_BY_ID, UPDATE_LETTER_HEAD_STATUS } from "../../helpers/url_helper";
import ScreenLoader from "../../constants/ScreenLoader";
import PageContent from "../../components/Common/PageContent";
import { formatDateTime, WordWrapCell } from "../../helpers/function_helper";
import { useUserStore } from "../../store/useUserStore";
import CheckUserAccess from "../../components/Common/CheckUserAccess";
import PermissionMissing from "../Utility/PermissonMissing";
import AppTable from "../../components/Common/Table";
import ApiClient from "../../helpers/api_helper";

/* ---------------- STATUS OPTIONS ---------------- */

const STATUS_OPTIONS = [
    { label: "Used", value: "Used" },
    { label: "Unused", value: "Unused" },
    { label: "Damaged", value: "Damaged" },
];

/* ---------------- ROW EDITOR ---------------- */

const STATUS_COLORS = {
    Used: "success",
    Unused: "secondary",
    Damaged: "danger",
};

const RowEditor = React.memo(({ row, onUpdate, isPending }) => {
    const [status, setStatus] = useState(row.status);
    const [remarks, setRemarks] = useState(row.remarks || "");

    useEffect(() => {
        setStatus(row.status);
        setRemarks(row.remarks || "");
    }, [row.status, row.remarks]);

    const isDisabled =
        status === row.status &&
        (remarks === (row.remarks || "") || remarks.length < 10);

    return (
        <div
            className="d-flex align-items-start gap-2 p-2 border rounded bg-light"
            style={{ minWidth: "420px" }}
        >
            {/* STATUS */}
            <div style={{ width: "120px" }}>
                <label className="form-label fw-semibold mb-1 small">
                    Status
                </label>
                <Input
                    type="select"
                    value={status}
                    className={`border-${STATUS_COLORS[status]}`}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </Input>
            </div>

            {/* REMARKS */}
            <div className="flex-grow-1">
                <label className="form-label fw-semibold mb-1 small">
                    Remarks
                </label>
                <Input
                    type="textarea"
                    rows="2"
                    value={remarks}
                    placeholder="Enter remarks"
                    onChange={(e) => setRemarks(e.target.value)}
                />
            </div>

            {/* ACTION */}
            <div className="d-flex align-items-center mt-4">
                <Button
                    color={STATUS_COLORS[status]}
                    size="sm"
                    className="px-3"
                    disabled={isDisabled || isPending}
                    onClick={() =>
                        onUpdate({
                            id: row.id,
                            status,
                            remarks,
                        })
                    }
                >
                    {isPending ? (
                        <Spinner size="sm" />
                    ) : (
                        <>
                            <i className="ri-save-line me-1" />
                            Update
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
});

/* ---------------- MAIN COMPONENT ---------------- */

export default function LetterHeadScreen() {
    const { userId, empCode } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);
    const [page, setPage] = useState(1);
    const LIMIT = 100;
    const [isPending, setIsPending] = useState(false);
    const [status, setStatus] = useState('Unused');

    const buildApiUrl = (offset, status) => `${GET_LETTER_HEAD_BY_ID}?empCode=${empCode}&offset=${offset}&limit=${LIMIT}&status=${status || ''}`;

    const [apiUrl, setApiUrl] = useState(buildApiUrl(0, status));

    const { data: letterData, isLoading, refetch: getData } = useGet(apiUrl, {
        enabled: Boolean(apiUrl && accessGranted),
    });

    /* ---------------- ACCESS CHECK ---------------- */

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, "letter-head-user-screen");
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    /* ---------------- PAGINATION ---------------- */

    useEffect(() => {
        setApiUrl(buildApiUrl(page - 1, status));
    }, [page]);

    const updateStatus = async (payload) => {
        const isConfirmed = window.confirm(
            "Are you sure you want to update the letter head status?"
        );

        if (!isConfirmed) return;
        setIsPending(true);
        ApiClient.post(
            `${UPDATE_LETTER_HEAD_STATUS}?id=${payload.id}&status=${payload.status}&remarks=${encodeURIComponent(payload.remarks)}`
        )
            .then(function (response) {
                setIsPending(false);
                if (response?.data?.status === 1) {
                    toast.success(response.data.message);
                    getData()
                } else {
                    toast.error(response.data.message);
                }
            })
            .catch(function (error) {
                setIsPending(false);
                toast.error(error.message);
            });
    }

    /* ---------------- TABLE COLUMNS ---------------- */

    const columns = useMemo(
        () => [
            {
                name: "SL No.",
                selector: (_, index) => index + 1,
                width: "6%",
            },
            {
                name: "Serial No.",
                cell: (row) => <WordWrapCell>{row.serialNumber}</WordWrapCell>,
                sortable: true,
                selector: (row) => row.serialNumber,
                width: "10%",
            },
            {
                name: "Provide By",
                selector: (row) => row.providedBy,
                sortable: true,
                cell: (row) => <WordWrapCell>{row.providedToName} ({row.providedToCode})</WordWrapCell>,
            },
            {
                name: "Provided At",
                cell: (row) => <WordWrapCell>{formatDateTime(row.providedAt)}</WordWrapCell>,
                selector: (row) => row.providedAt,
                sortable: true,
            },
            {
                name: "Type",
                selector: (row) => row.letterType,
                sortable: true,
                width: "8%",
                cell: (row) => (
                    <span className="badge bg-info-subtle text-info">
                        {row.letterType}
                    </span>
                ),
            },
            {
                name: "Action / Remarks",
                width: "45%",
                cell: (row) =>
                    row.status === "Unused" ? (
                        <RowEditor
                            row={row}
                            isPending={isPending}
                            onUpdate={updateStatus}
                        />
                    ) : (
                        <WordWrapCell>{row.remarks || "-"}</WordWrapCell>
                    ),
            },
        ],
        [isPending]
    );

    const handleRadioChange = (event) => {
        const value = event.target.value;
        setStatus(value);
        setApiUrl(buildApiUrl(page - 1) + value);
    };
    /* ---------------- ACCESS HANDLING ---------------- */

    if (accessGranted === null) return <ScreenLoader />;
    if (!accessGranted) return <PermissionMissing />;

    /* ---------------- RENDER ---------------- */

    return (
        <PageContent>
            <Breadcrumbs title="Letter Head" breadcrumbItem="Update Status" />
            {(isLoading || isPending) && <ScreenLoader />}
            <Container fluid>
                <Card>
                    <CardBody>
                        {/* Radio Buttons */}
                        <div className="radio-button-container">
                            {["Unused", "Used", "Damaged"].map((type) => (
                                <label
                                    key={type}
                                    className={`radio-label ${status === type ? "active" : ""}`}
                                >
                                    <input
                                        type="radio"
                                        value={type}
                                        checked={status === type}
                                        onChange={handleRadioChange}
                                    />
                                    {type}
                                </label>
                            ))}
                        </div>
                        <AppTable
                            columns={columns}
                            data={letterData?.data?.data?.content || []}
                            pagination
                            paginationServer
                            paginationTotalRows={
                                letterData?.data?.data?.totalElements || 0
                            }
                            onChangePage={setPage}
                            progressPending={isLoading}
                        />
                    </CardBody>
                </Card>
            </Container>
        </PageContent>
    );
}