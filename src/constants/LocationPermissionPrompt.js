import { Card, CardBody } from 'reactstrap';
import { MdLocationOff, MdSettings } from 'react-icons/md';
import { FaRedoAlt } from 'react-icons/fa';

const LocationPermissionPrompt = () => {
  return (
    <div
      style={{
        height: '100vh',
        backgroundColor: '#f0f2f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
      }}
    >
      <Card style={{ maxWidth: '500px', width: '100%', border: 'none', boxShadow: '0 0 15px rgba(0,0,0,0.1)' }}>
        <CardBody className="text-center">
          <MdLocationOff size={60} color="#dc3545" style={{ marginBottom: '1rem' }} />
          <h4 className="mb-3" style={{ color: '#333' }}>
            Location Access Required
          </h4>
          <p className="mb-2 text-muted" style={{ fontSize: '1rem' }}>
            This application needs access to your location for full functionality.
          </p>
          <p style={{ fontSize: '0.95rem', color: '#666' }}>
            <MdSettings size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Please enable location permission in your browser:
            <br />
            <span style={{ display: 'inline-block', marginTop: '0.5rem', textAlign: 'left' }}>
              • Go to your browser settings<br />
              • Open <strong>Site Settings</strong><br />
              • Allow <strong>Location Access</strong>
            </span>
          </p>

          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary mt-4 d-inline-flex align-items-center"
            style={{ padding: '0.6rem 1.25rem', fontSize: '1rem' }}
          >
            <FaRedoAlt size={16} className="me-2" />
            Retry After Enabling
          </button>
        </CardBody>
      </Card>
    </div>
  );
};

export default LocationPermissionPrompt;
