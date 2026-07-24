import { useEffect, useState, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, Progress, Spinner, Badge } from 'reactstrap';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaExchangeAlt } from 'react-icons/fa';
import ApiClient from '../../helpers/api_helper';
import { TRANSFER_PROSPECT_DATA_NEW_STATUS } from '../../helpers/url_helper';
import { defaultTheme } from '../../helpers/defaultTheme';

const TransferProgressModal = ({ show, fileId, onClose }) => {
    const [uploadedCount, setUploadedCount] = useState(0);
    const [totalRecords, setTotalRecords] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [successCount, setSuccessCount] = useState('0');
    const [isCompleted, setIsCompleted] = useState(false);
    const [isError, setIsError] = useState(false);
    const [elapsedTime, setElapsedTime] = useState('00:00');

    const startTimeRef = useRef(null); // useRef for accurate timer tracking

    useEffect(() => {
        let statusIntervalId;
        let timerIntervalId;

        if (show && fileId) {
            // Reset state
            setUploadedCount(0);
            setTotalRecords(null);
            setStatusMessage('');
            setSuccessCount(0);
            setIsCompleted(false);
            setIsError(false);
            setElapsedTime('00:00');
            startTimeRef.current = null;

            // Timer interval
            timerIntervalId = setInterval(() => {
                if (startTimeRef.current) {
                    const now = Date.now();
                    const diff = now - startTimeRef.current;
                    const minutes = String(Math.floor(diff / (1000 * 60)) % 60).padStart(2, '0');
                    const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
                    setElapsedTime(`${minutes}:${seconds}`);
                }
            }, 1000);

            // Polling status
            statusIntervalId = setInterval(() => {
                ApiClient.get(`${TRANSFER_PROSPECT_DATA_NEW_STATUS}${fileId}`)
                    .then((response) => {
                        if (response?.data?.status === 1) {
                            const { type, message, total, suspect, prospect, success } = response.data.data;
                            const msg = message?.toLowerCase() || '';
                            setUploadedCount(success);
                            setTotalRecords(total);
                            setStatusMessage(message);
                            setSuccessCount(type === 'Suspect' ? suspect : prospect);

                            // Start timer when upload starts
                            if (!startTimeRef.current && msg.includes('started')) {
                                startTimeRef.current = Date.now();
                                setElapsedTime('00:00');
                            }

                            if (msg.includes('completed')) {
                                clearInterval(statusIntervalId);
                                clearInterval(timerIntervalId);
                                setIsCompleted(true);
                            } else if (!msg.includes('started') && !msg.includes('completed')) {
                                clearInterval(statusIntervalId);
                                clearInterval(timerIntervalId);
                                setIsError(true);
                                setStatusMessage(msg.startsWith('/')
                                    ? 'Error occurred! Please try again.'
                                    : message);
                                setIsCompleted(false);
                                setUploadedCount(0);
                                setTotalRecords(null);
                            }
                        } else {
                            toast.error(response.data.message);
                        }
                    })
                    .catch((error) => {
                        toast.error(error.message);
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

    return (
        <Modal isOpen={show} toggle={onClose} backdrop="static" centered>
            <ModalHeader toggle={onClose}>
                <div className="d-flex align-items-center gap-2">
                    <FaExchangeAlt size={22} color={defaultTheme.primary} />
                    Transferring Records
                </div>
            </ModalHeader>

            <ModalBody className="text-center">
                {isError ? (
                    <div className="my-4">
                        <FaTimesCircle size={50} color="#dc3545" className="mb-3" />
                        <h5 className="text-danger">Transfer Failed</h5>
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
                        <h5 className="text-success">Completed</h5>
                        <p>{successCount} Out Of {totalRecords} Records Transferred Successfully.</p>
                        <p className="text-muted">Time Taken: {elapsedTime}</p>
                    </div>
                ) : (
                    <>
                        <h6 className="mb-3">
                            Status: <Badge color="info">{statusMessage}</Badge>
                        </h6>

                        <div className="mb-2 text-muted" style={{ fontSize: '14px' }}>
                            Time Elapsed: {elapsedTime}
                        </div>

                        {progressPercent !== null && totalRecords ? (
                            <>
                                <div className="mb-4 fw-bold text-dark">
                                    Transferred: {uploadedCount} / {totalRecords} (
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
                                <p className="mt-2 mb-0">Transfer in progress...</p>
                            </div>
                        )}
                    </>
                )}
            </ModalBody>
        </Modal>
    );
};

export default TransferProgressModal;
