import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FaUserAlt } from 'react-icons/fa'; // Importing a user icon from react-icons
import { defaultTheme } from '../../helpers/defaultTheme';

const ProfileCompletionModal = ({ isOpen, onNavigateToProfile }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Modal isOpen={isOpen} backdrop="static" centered style={styles.modal}>
            <ModalHeader style={styles.modalHeader}>
                <FaUserAlt style={styles.icon} />
                <span style={styles.headerText}>Complete OR Correct Your Profile</span>
            </ModalHeader>
            <ModalBody style={styles.modalBody}>
                <p style={styles.bodyText}>
                    Some details in your profile are either missing OR incorrect. Please complete OR correct your profile to continue using the SAP.
                </p>

            </ModalBody>
            <ModalFooter style={styles.modalFooter}>
                <Button
                    color="primary"
                    onClick={onNavigateToProfile}
                    style={isHovered ? { ...styles.button, ...styles.buttonHover } : styles.button}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    Go to Profile
                </Button>
            </ModalFooter>
        </Modal>
    );
};

// Inline styles
const styles = {
    modal: {
        borderRadius: '15px',  // Rounded corners for a smoother look
        overflow: 'hidden',
    },
    modalHeader: {
        borderBottom: 'none',
        color: '#fff',
        fontSize: '24px',
        fontWeight: 600,
        padding: '15px',
        textAlign: 'center',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '10px'
    },
    icon: {
        fontSize: '22px',  // Slightly larger icon for more prominence
        marginRight: '15px',
        transition: 'transform 0.3s ease',
        color: defaultTheme.btnEnable
    },
    headerText: {
        fontSize: '18px',
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
        color: defaultTheme.btnEnable
    },
    modalBody: {
        backgroundColor: '#fff',
        padding: '30px 20px',
        textAlign: 'center',
        fontSize: '18px',
        color: '#555',
        lineHeight: '1.6',
        fontFamily: 'Helvetica, sans-serif',
    },
    bodyText: {
        marginBottom: '18px',
    },
    modalFooter: {
        backgroundColor: '#f8f9fa',
        borderTop: 'none',
        padding: '18px',
        display: 'flex',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: defaultTheme.primary,
        borderColor: defaultTheme.btnEnable,
        fontWeight: 600,
        padding: '12px 25px',
        fontSize: '14px',
        borderRadius: '8px',
        transition: 'transform 0.3s ease, background-color 0.3s ease',
        // boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',  // Soft button shadow
    },
    buttonHover: {
        backgroundColor: defaultTheme.goldColorLogo,
        borderColor: '#1e7e34',
        transform: 'translateY(-2px)',  // Floating effect when hovering
    },
};

export default ProfileCompletionModal;
