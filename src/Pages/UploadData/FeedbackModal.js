import { useEffect, useState, useRef, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, Badge, Progress, Spinner } from 'reactstrap';
import { toast } from 'react-toastify';
import {
    FaCheckCircle,
    FaTimesCircle,
    FaFileAlt,
    FaDownload
} from 'react-icons/fa';
import ApiClient, { imageBaseUrl } from '../../helpers/api_helper';
import { generateTimestamp } from '../../helpers/function_helper';
import { LEAD_UPLOAD_FEEDBACK_STATUS } from '../../helpers/url_helper';
import { defaultTheme } from '../../helpers/defaultTheme';

const FeedbackModal = ({ show, taskId, onClose }) => {
    const [statusMessage, setStatusMessage] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [isError, setIsError] = useState(false);
    const [downloadPath, setDownloadPath] = useState('');
    const [elapsedTime, setElapsedTime] = useState('00:00');
    const [total, setTotal] = useState(0);
    const [processed, setProcessed] = useState(0);
    const [hideProgress, setHideProgress] = useState(false);

    const startTimeRef = useRef(null);

    const ERROR_STATUSES = useMemo(() => ['ERROR', 'FAILED', 'NOTFOUND'], []);

    const getStatusMessage = (status) => {
        switch (status.toUpperCase()) {
            case 'ERROR':
                return 'Some Error Occurred';
            case 'GENERATINGDATA':
                return 'Fetching Data';
            case 'GENERATINGEXCEL':
                return 'Generating Excel';
            case 'NOTFOUND':
                return 'No Task Found';
            default:
                return status;
        }
    };

    useEffect(() => {
        let statusIntervalId;
        let timerIntervalId;

        if (show && taskId) {
            // Reset
            setStatusMessage('');
            setIsCompleted(false);
            setIsError(false);
            setDownloadPath('');
            setElapsedTime('00:00');
            setTotal(0);
            setProcessed(0);
            setHideProgress(false);
            startTimeRef.current = null;

            // Timer
            timerIntervalId = setInterval(() => {
                if (startTimeRef.current) {
                    const now = Date.now();
                    const diff = now - startTimeRef.current;
                    const minutes = String(Math.floor(diff / (1000 * 60)) % 60).padStart(2, '0');
                    const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
                    setElapsedTime(`${minutes}:${seconds}`);
                }
            }, 1000);

            // Polling
            statusIntervalId = setInterval(() => {
                ApiClient.get(`${LEAD_UPLOAD_FEEDBACK_STATUS}${taskId}`)
                    .then((response) => {
                        const data = response?.data;

                        if (data?.Status) {
                            const status = data.Status;
                            const normalized = status.toUpperCase();

                            if (!startTimeRef.current) {
                                startTimeRef.current = Date.now();
                            }

                            setStatusMessage(getStatusMessage(status));
                            setTotal(data.Total || 0);
                            setProcessed(data.Processed || 0);

                            // 1. Error handling
                            if (ERROR_STATUSES.includes(normalized)) {
                                clearInterval(statusIntervalId);
                                clearInterval(timerIntervalId);
                                setIsError(true);
                                return;
                            }

                            // 2. Wait for file to be ready
                            if (status.endsWith('.xlsx')) {
                                clearInterval(statusIntervalId);
                                clearInterval(timerIntervalId);
                                setDownloadPath(status);
                                setIsCompleted(true);
                                return;
                            }

                            // 3. If Generating Excel and Processed === Total → Hide progress bar and show status
                            if (normalized === 'GENERATINGEXCEL' && data.Total === data.Processed) {
                                setHideProgress(true);
                            } else {
                                setHideProgress(false);
                            }

                        } else {
                            toast.error(data?.message || 'Unexpected response');
                            clearInterval(statusIntervalId);
                            clearInterval(timerIntervalId);
                            setIsError(true);
                        }
                    })
                    .catch((error) => {
                        toast.error(error.message || 'Something went wrong');
                        clearInterval(statusIntervalId);
                        clearInterval(timerIntervalId);
                        setIsError(true);
                    });
            }, 1000);
        }

        return () => {
            clearInterval(statusIntervalId);
            clearInterval(timerIntervalId);
        };
    }, [ERROR_STATUSES, show, taskId]);

    const downloadReport = async () => {
        try {
            const response = await fetch(`${imageBaseUrl}${downloadPath}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Lead_Feedback_Report_${generateTimestamp()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Failed to download report.');
        }
    };

    const progressPercent =
        total && total > 0 ? (processed / total) * 100 : null;

    const progressColor =
        progressPercent > 75 ? 'success' : progressPercent > 40 ? 'warning' : 'danger';

    return (
        <Modal isOpen={show} toggle={onClose} backdrop="static" centered>
            <ModalHeader toggle={onClose}>
                <div className="d-flex align-items-center gap-2">
                    <FaFileAlt size={22} color={defaultTheme.primary} />
                    Generating Feedback Report
                </div>
            </ModalHeader>

            <ModalBody className="text-center">
                {isError ? (
                    <div className="my-4">
                        <FaTimesCircle size={50} color="#dc3545" className="mb-3" />
                        <h5 className="text-danger">Failed to Generate</h5>
                        <p className="text-muted">Time Taken: {elapsedTime}</p>
                        <div className="border border-danger rounded p-3 mt-2 mx-auto" style={{
                            backgroundColor: '#f8d7da',
                            color: '#721c24',
                            maxWidth: '90%',
                            fontSize: '15px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}>
                            <p className="mb-0">{statusMessage}</p>
                        </div>
                    </div>
                ) : isCompleted ? (
                    <div className="my-4">
                        <FaCheckCircle size={50} color="#28a745" className="mb-3" />
                        <h5 className="text-success">Report is Ready!</h5>
                        <p className="text-muted">Time Taken: {elapsedTime}</p>
                        <button
                            className="btn btn-success px-4 rounded-pill d-inline-flex align-items-center gap-2 shadow-sm mt-2"
                            onClick={downloadReport}
                        >
                            <FaDownload />
                            Download Report
                        </button>
                    </div>
                ) : (
                    <>
                        <h6 className="mb-3">
                            Status: <Badge color="info">{statusMessage}</Badge>
                        </h6>

                        <div className="mb-2 text-muted" style={{ fontSize: '14px' }}>
                            Time Elapsed: {elapsedTime}
                        </div>

                        {!hideProgress && progressPercent !== null && total ? (
                            <>
                                <div className="mb-3 fw-bold text-dark">
                                    Processed: {processed} / {total} (
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
                                <p className="mt-2 mb-0">Processing...</p>
                            </div>
                        )}
                    </>
                )}
            </ModalBody>
        </Modal>
    );
};

export default FeedbackModal;
