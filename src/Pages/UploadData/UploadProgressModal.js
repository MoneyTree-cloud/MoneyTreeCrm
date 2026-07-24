import React, { useEffect, useState, useRef } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    Progress,
    Spinner,
    Badge,
    Button
} from 'reactstrap';
import { toast } from 'react-toastify';
import {
    FaCloudUploadAlt,
    FaCheckCircle,
    FaTimesCircle
} from 'react-icons/fa';
import ApiClient from '../../helpers/api_helper';
import {
    UPLOAD_LEAD_DATA_LATEST_STATUS_NEW,
    UPLOAD_LEAD_DATA_LATEST_EXCEL_DOWNLOAD
} from '../../helpers/url_helper';
import { defaultTheme } from '../../helpers/defaultTheme';

const UploadProgressModal = ({ show, fileId, onClose }) => {
    const [uploadedCount, setUploadedCount] = useState(0);
    const [totalRecords, setTotalRecords] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [successCount, setSuccessCount] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isError, setIsError] = useState(false);
    const [elapsedTime, setElapsedTime] = useState('00:00');
    const [isPending, setIsPending] = useState(false);

    const startTimeRef = useRef(null);

    useEffect(() => {
        let statusIntervalId;
        let timerIntervalId;

        if (show && fileId) {
            setUploadedCount(0);
            setTotalRecords(null);
            setStatusMessage('');
            setSuccessCount(0);
            setIsCompleted(false);
            setIsError(false);
            setElapsedTime('00:00');
            startTimeRef.current = null;

            timerIntervalId = setInterval(() => {
                if (startTimeRef.current) {
                    const now = Date.now();
                    const diff = now - startTimeRef.current;

                    const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
                    const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

                    setElapsedTime(`${minutes}:${seconds}`);
                }
            }, 1000);

            statusIntervalId = setInterval(() => {
                ApiClient.get(`${UPLOAD_LEAD_DATA_LATEST_STATUS_NEW}${fileId}`)
                    .then((response) => {
                        if (response?.data?.status === 1) {
                            const { Total, Processed, Success } = response.data.data || {};
                            setUploadedCount(Processed || 0);
                            setTotalRecords(Total || 0);
                            setSuccessCount(Success || 0);
                            setStatusMessage(response.data.message === 'Task status fetched' ? 'Please wait while the upload is in progress.' : response.data.message);

                            if (!startTimeRef.current && Processed > 0) {
                                startTimeRef.current = Date.now();
                            }

                            if (Processed >= Total && Processed !== null && Processed !== 0) {
                                clearInterval(statusIntervalId);
                                clearInterval(timerIntervalId);
                                setIsCompleted(true);
                                // toast.success("Upload Completed Successfully");
                            }
                        } else {
                            clearInterval(statusIntervalId);
                            clearInterval(timerIntervalId);
                            setIsError(true);
                            setStatusMessage(response?.data?.message || 'Upload failed.');
                        }
                    })
                    .catch((error) => {
                        clearInterval(statusIntervalId);
                        clearInterval(timerIntervalId);
                        setIsError(true);
                        setStatusMessage(error.message || 'Error occurred during upload.');
                    });
            }, 1000);
        }

        return () => {
            clearInterval(statusIntervalId);
            clearInterval(timerIntervalId);
        };
    }, [show, fileId]);

    const progressPercent =
        totalRecords && totalRecords > 0
            ? (uploadedCount / totalRecords) * 100
            : null;

    const progressColor =
        progressPercent > 75 ? 'success' : progressPercent > 40 ? 'warning' : 'danger';

    const downloadFailedExcel = () => {
        setIsPending(true);
        ApiClient.get(UPLOAD_LEAD_DATA_LATEST_EXCEL_DOWNLOAD + fileId, { responseType: "arraybuffer" })
            .then((response) => {
                setIsPending(false);
                const contentType = response.headers["content-type"];
                if (contentType !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                    const errorResponse = new TextDecoder("utf-8").decode(new Uint8Array(response.data));
                    try {
                        const parsedError = JSON.parse(errorResponse);
                        toast.error(parsedError.message || "Failed to download Excel file.");
                    } catch {
                        toast.error("Unexpected error occurred while downloading Excel file.");
                    }
                    return;
                }

                const blob = new Blob([response.data], { type: contentType });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = `failed_lead_list_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((error) => {
                setIsPending(false);
                toast.error(error.message || "An unexpected error occurred.");
            });
    };

    return (
        <Modal isOpen={show} toggle={onClose} backdrop="static" centered>
            <ModalHeader toggle={onClose}>
                <div className="d-flex align-items-center gap-2">
                    <FaCloudUploadAlt size={22} color={defaultTheme.primary} />
                    Uploading Leads
                </div>
            </ModalHeader>

            <ModalBody className="text-center">
                {isError ? (
                    <div className="my-4">
                        <FaTimesCircle size={50} color="#dc3545" className="mb-3" />
                        <h5 className="text-danger">Upload Failed</h5>
                        <p className="text-muted">Time Taken: {elapsedTime}</p>
                        <div
                            className="border border-danger rounded p-3 mt-2 mx-auto"
                            style={{
                                backgroundColor: '#f8d7da',
                                color: '#721c24',
                                maxWidth: '90%',
                                fontSize: '15px',
                                wordWrap: 'break-word',        // ✅ wrap long words
                                overflowWrap: 'break-word',    // ✅ fallback for long error text
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            <p className="mb-0">{statusMessage}</p>
                        </div>
                    </div>
                ) : isCompleted ? (
                    <div className="my-4">
                        <FaCheckCircle size={50} color="#28a745" className="mb-3" />
                        <h5 className="text-success">Upload Completed Successfully</h5>
                        <p>{successCount} out of {totalRecords} records uploaded.</p>
                        <p className="text-muted">Time Taken: {elapsedTime}</p>

                        {/* {successCount < totalRecords && ( */}
                        <Button
                            color="danger"
                            className="mt-3"
                            onClick={downloadFailedExcel}
                            disabled={isPending}
                        >
                            {isPending ? 'Preparing File...' : 'Download Failure Report'}
                        </Button>
                        {/* )} */}
                    </div>
                ) : (
                    <>
                        <h6 className="mb-3">
                            Status: <Badge color="info">{statusMessage}</Badge>
                        </h6>
                        <div className="mb-2 text-muted">Time Elapsed: {elapsedTime}</div>
                        {progressPercent !== null && totalRecords ? (
                            <>
                                <div className="mb-3 fw-bold text-dark">
                                    Uploaded: {uploadedCount} / {totalRecords} (
                                    {Math.round(progressPercent)}%)
                                </div>
                                <Progress
                                    animated
                                    striped
                                    color={progressColor}
                                    value={progressPercent}
                                    style={{ height: '24px', fontSize: '14px' }}
                                >
                                    {Math.round(progressPercent)}%
                                </Progress>
                            </>
                        ) : (
                            <div className="my-3">
                                <Spinner color="primary" />
                                <p className="mt-2 mb-0">Uploading in progress...</p>
                            </div>
                        )}
                    </>
                )}
            </ModalBody>
        </Modal>
    );
};

export default UploadProgressModal;
