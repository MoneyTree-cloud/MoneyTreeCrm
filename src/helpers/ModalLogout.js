import { useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { AiOutlineInfoCircle } from "react-icons/ai"; // Info icon
import { FaSignOutAlt } from "react-icons/fa"; // Logout icon
import { defaultTheme } from "./defaultTheme";
import { useUserStore } from "../store/useUserStore";

const ModalLogout = () => {
  const logout = useUserStore((state) => state.logout);
  useEffect(() => {
    logout()
  }, [logout])

  return (
    <Modal isOpen={true} centered>
      <ModalHeader>
        <AiOutlineInfoCircle
          style={{
            marginRight: "8px",
            fontSize: "1.5em",
            color: defaultTheme.goldColorLogo,
          }}
        />
        Information
      </ModalHeader>
      <ModalBody className="text-center">
        <FaSignOutAlt
          style={{
            fontSize: "2em",
            color: "red",
            marginBottom: "10px",
          }}
        />
        <p>Session Ended. You Have Been Logged Out. Please Log In Again to Continue.</p>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          style={{ backgroundColor: defaultTheme.primary }}
          onClick={logout}
        >
          Okay
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalLogout;