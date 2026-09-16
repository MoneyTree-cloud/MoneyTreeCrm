import { useEffect, useRef, useState } from 'react';
import { Container, Card, CardBody, Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaFileExcel, FaTimes } from 'react-icons/fa';

import PageContent from '../../components/Common/PageContent';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ScreenLoader from '../../constants/ScreenLoader';
import ApiClient from '../../helpers/api_helper';
import { defaultTheme } from '../../helpers/defaultTheme';
import { UPLOAD_BOOKING_ANNEXURE } from '../../helpers/url_helper';
import { useUserStore } from '../../store/useUserStore';
import CheckUserAccess from '../../components/Common/CheckUserAccess';
import PermissionMissing from '../Utility/PermissonMissing';

const ALLOWED_EXTENSIONS = ['.xls', '.xlsx'];

// ── Excel drop-zone ──────────────────────────────────────────────────────────
function ExcelUploadZone({ file, onChange }) {
    const inputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);

    const validateAndSet = (f) => {
        if (!f) return;
        const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            toast.error('Invalid file type. Please upload an Excel file (.xls or .xlsx).');
            return;
        }
        onChange(f);
    };

    return (
        <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                validateAndSet(e.dataTransfer.files?.[0]);
            }}
            style={{
                border: `1.5px dashed ${dragOver || file ? defaultTheme.primary : '#CBD5E1'}`,
                borderRadius: 12,
                padding: '28px 20px',
                background: dragOver ? '#F0FDF9' : file ? '#F8FCFB' : '#FAFBFC',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                textAlign: 'center',
                transition: 'all .15s',
            }}
        >
            <div style={{
                width: 54, height: 54,
                borderRadius: 14,
                background: `${defaultTheme.primary}15`,
                color: defaultTheme.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
            }}>
                {file ? <FaFileExcel size={24} /> : <FaCloudUploadAlt size={26} />}
            </div>

            {file ? (
                <>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{file.name}</div>
                    <div style={{ fontSize: 11.5, color: '#64748B' }}>
                        {(file.size / 1024).toFixed(1)} KB · Click or drop to replace
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(null);
                            if (inputRef.current) inputRef.current.value = '';
                        }}
                        style={{
                            marginTop: 4,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '5px 12px',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            border: 'none',
                            borderRadius: 7,
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        <FaTimes size={10} /> Remove File
                    </button>
                </>
            ) : (
                <>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>
                        Click to upload or drop your Excel file here
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748B' }}>
                        Supports .xls and .xlsx formats
                    </div>
                </>
            )}

            <input
                ref={inputRef}
                type="file"
                accept=".xls,.xlsx"
                style={{ display: 'none' }}
                onChange={(e) => validateAndSet(e.target.files?.[0])}
            />
        </div>
    );
}

export default function BookingDetailsUpload() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const { userId } = useUserStore((state) => state.user);
    const [accessGranted, setAccessGranted] = useState(null);

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await CheckUserAccess(userId, 'booking-annexure-upload');
            setAccessGranted(hasAccess);
        };
        checkAccess();
    }, [userId]);

    const handleUpload = () => {
        if (!file) {
            toast.error('Please select a Booking Details Excel file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        ApiClient.post(UPLOAD_BOOKING_ANNEXURE, formData)
            .then((response) => {
                setUploading(false);
                if (response?.data?.status === 0) {
                    toast.error(response.data.message || 'Upload failed');
                } else {
                    toast.success(response?.data?.message || 'Booking Details uploaded successfully');
                    setFile(null);
                }
            })
            .catch((error) => {
                setUploading(false);
                toast.error(error.message || 'Network error');
            });
    };

    if (accessGranted === null) {
        return <ScreenLoader />;
    }

    if (!accessGranted) {
        return <PermissionMissing />;
    }

    return (
        <PageContent>
            <Breadcrumbs title="Transaction" breadcrumbItem="Booking Details Upload" />
            {uploading && <ScreenLoader />}

            <Container fluid>
                <Card>
                    <CardBody>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 10,
                            marginBottom: 18,
                            paddingBottom: 14,
                            borderBottom: '1px dashed #E2E8F0',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 40, height: 40,
                                    borderRadius: 10,
                                    background: `linear-gradient(135deg, ${defaultTheme.primary}, #007A6E)`,
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 16,
                                }}>
                                    <FaFileExcel />
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                                        Upload Booking Details Excel
                                    </div>
                                    <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                                        Bulk-import booking details records from an Excel sheet
                                    </div>
                                </div>
                            </div>

                        </div>

                        <ExcelUploadZone file={file} onChange={setFile} />

                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <Button
                                color="primary"
                                type="button"
                                disabled={uploading || !file}
                                onClick={handleUpload}
                            >
                                {uploading ? 'Uploading…' : 'Upload Data'}
                            </Button>
                            <Button
                                color="secondary"
                                type="button"
                                disabled={uploading}
                                onClick={() => setFile(null)}
                            >
                                Reset
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </Container>
        </PageContent>
    );
}
