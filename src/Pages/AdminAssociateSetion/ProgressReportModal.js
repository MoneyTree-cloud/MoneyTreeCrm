/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, Badge } from 'reactstrap';
import { toast } from 'react-toastify';
import {
    FaCheckCircle,
    FaTimesCircle,
    FaFileAlt,
    FaDownload,
} from 'react-icons/fa';
import ApiClient, { imageBaseUrl } from '../../helpers/api_helper';
import { USER_PERFORMANCE_STATUS } from '../../helpers/url_helper';
import { generateTimestamp } from '../../helpers/function_helper';

const ProgressReportModal = ({ show, reportId, onClose }) => {
    const [statusMessage, setStatusMessage] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [isError, setIsError] = useState(false);
    const [downloadPath, setDownloadPath] = useState('');
    const [elapsedTime, setElapsedTime] = useState('00:00');
    const startTimeRef = useRef(null);

    const ERROR_STATUSES = ['NOT_FOUND', 'FAILED'];
    const PROGRESS_STATUSES = [
        'STARTED',
        'DATA_PREPARING',
        'DATA_PREPARED',
        'PREPARING_EXCEL',
        'EXCEL_PREPARED',
    ];

    useEffect(() => {
        let statusIntervalId;
        let timerIntervalId;

        if (show && reportId) {
            setStatusMessage('');
            setIsCompleted(false);
            setIsError(false);
            setDownloadPath('');
            setElapsedTime('00:00');
            startTimeRef.current = null;

            timerIntervalId = setInterval(() => {
                if (startTimeRef.current) {
                    const now = Date.now();
                    const diff = now - startTimeRef.current;
                    const minutes = String(Math.floor(diff / (1000 * 60)) % 60).padStart(2, '0');
                    const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
                    setElapsedTime(`${minutes}:${seconds}`);
                }
            }, 1000);

            statusIntervalId = setInterval(() => {
                ApiClient.get(`${USER_PERFORMANCE_STATUS}${reportId}`)
                    .then((response) => {
                        if (response?.data?.status === 1) {
                            const rawStatus = response.data.data || '';
                            const normalizedStatus = rawStatus.trim().toUpperCase().replace(/\s+/g, '_');

                            setStatusMessage(rawStatus);

                            if (!startTimeRef.current) {
                                startTimeRef.current = Date.now();
                            }

                            if (ERROR_STATUSES.includes(normalizedStatus)) {
                                clearInterval(statusIntervalId);
                                clearInterval(timerIntervalId);
                                setIsError(true);
                                return;
                            }

                            if (PROGRESS_STATUSES.includes(normalizedStatus)) {
                                return;
                            }

                            clearInterval(statusIntervalId);
                            clearInterval(timerIntervalId);
                            setDownloadPath(response.data.data);
                            setIsCompleted(true);
                        } else {
                            toast.error(response.data.message || 'Failed to fetch status');
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
    }, [show, reportId]);

    const downloadReport = async () => {
        try {
            const response = await fetch(`${imageBaseUrl}${downloadPath}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Performance_Report_${generateTimestamp()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Failed to download report.');
        }
    };

    return (
        <Modal isOpen={show} toggle={onClose} backdrop="static" centered>
            <ModalHeader
                toggle={onClose}
                className="border-0 pb-1 d-flex align-items-center"
                style={{ backgroundColor: '#f7f9fc' }}
            >
                <FaFileAlt size={20} className="me-2 text-primary" />
                <span className="fw-semibold fs-5">Performance Report</span>
            </ModalHeader>

            <ModalBody className="text-center px-4 pt-3 pb-4">
                {isError ? (
                    <div className="py-3">
                        <FaTimesCircle size={50} className="mb-2 text-danger" />
                        <h5 className="text-danger fw-bold mb-2">Failed to Generate</h5>
                        <p className="text-muted small mb-1">
                            Status: <strong>{statusMessage}</strong>
                        </p>
                        <p className="text-muted small">Elapsed Time: {elapsedTime}</p>
                    </div>
                ) : isCompleted ? (
                    <div className="py-3">
                        <FaCheckCircle size={50} className="mb-2 text-success" />
                        <h5 className="text-success fw-bold mb-2">Report is Ready!</h5>
                        <p className="text-muted small mb-2">Time Taken: {elapsedTime}</p>
                        <button
                            className="btn btn-success px-4 rounded-pill d-inline-flex align-items-center gap-2 shadow-sm"
                            onClick={downloadReport}
                        >
                            <FaDownload />
                            Download Report
                        </button>
                    </div>
                ) : (
                    <div className="py-4 d-flex flex-column align-items-center justify-content-center">
                        <div
                            className="spinner-border text-primary mb-3"
                            role="status"
                            style={{ width: '3rem', height: '3rem' }}
                        ></div>
                        <h6 className="fw-semibold mb-2">Generating your report...</h6>
                        <Badge color="info" pill className="mb-2 px-3 py-1">
                            {statusMessage}
                        </Badge>
                        {/* <p className="text-muted small">Elapsed Time: {elapsedTime}</p> */}
                        <p className="text-muted small mb-2">Elapsed Time: {elapsedTime}</p>
                        {/* {isLoading && (
                            <div className="my-2">
                                <Spinner color="primary" />
                                <p className="text-muted small mt-2 mb-0">
                                    Preparing your report...
                                </p>
                            </div>
                        )} */}
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
};

export default ProgressReportModal;
