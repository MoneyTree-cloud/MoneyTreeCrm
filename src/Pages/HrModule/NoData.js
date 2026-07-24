import { Button, Card } from 'reactstrap'

export default function NoData() {
    return (
        <div
            style={{
                display: 'flex',
                height: '90vh',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f9fb',
            }}
        >
            <Card
                style={{
                    borderRadius: '12px',
                    maxWidth: '600px',
                    width: '100%',
                    padding: '2rem',
                    boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                }}
            >
                <div>
                    {/* Big icon */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <i
                            className="ri-ghost-line"
                            style={{
                                fontSize: '5rem',
                                color: '#556ee6',
                                display: 'inline-block',
                                animation: 'float 2s ease-in-out infinite',
                            }}
                        ></i>
                    </div>

                    {/* Title */}
                    <h3 style={{ textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.5rem' }}>
                        No Candidate Data
                    </h3>

                    {/* Subtext */}
                    <p style={{ color: '#6c757d', padding: '0 1rem', fontSize: '0.95rem' }}>
                        Oops! We couldn’t find any information for this candidate. It might be a temporary issue or missing data.
                    </p>

                    {/* Buttons */}
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <Button color="primary" onClick={() => window.location.reload()} style={{ minWidth: '140px' }}>
                            <i className="ri-refresh-line me-2"></i>Reload
                        </Button>

                    </div>
                </div>
            </Card>
        </div>
    )
}
