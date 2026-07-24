import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AiOutlineWarning } from "react-icons/ai";

const DisableActions = () => {
  const [isBlurred, setIsBlurred] = useState(false);

  // Prevent copy, cut, etc.
  const handleCopy = (e) => e.preventDefault();
  const handleContextMenu = (e) => e.preventDefault();
  const handleDragStart = (e) => e.preventDefault();
  const handleDrop = (e) => e.preventDefault();
  const handleCut = (e) => e.preventDefault();

  useEffect(() => {
    // Disable interactions
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("drop", handleDrop);

    // Disable text selection
    const body = document.body;
    body.style.userSelect = "none";
    body.style.webkitUserSelect = "none";
    body.style.msUserSelect = "none";
    body.style.MozUserSelect = "none";

    // Handle PrintScreen key
    const handleKeyUp = (e) => {
      if (e.key === "PrintScreen") {
        setIsBlurred(true);
      }
    };

    window.addEventListener("keyup", handleKeyUp);

    return () => {
      // Cleanup
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("drop", handleDrop);
      window.removeEventListener("keyup", handleKeyUp);

      // Restore styles
      body.style.userSelect = "";
      body.style.webkitUserSelect = "";
      body.style.msUserSelect = "";
      body.style.MozUserSelect = "";
    };
  }, []);

  // --- Inline Styles ---
  const blurStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backdropFilter: "blur(20px)",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 999998,
  };

  const modalBackdropStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999,
    backgroundColor: "rgba(0,0,0,0.2)",
    animation: "fadeIn 0.3s ease",
  };

  const modalStyle = {
    backgroundColor: "#fff",
    padding: "35px 40px",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    textAlign: "center",
    maxWidth: "400px",
    width: "90%",
    fontFamily: "system-ui, sans-serif",
    transform: "scale(1)",
    animation: "zoomIn 0.3s ease",
  };

  const iconStyle = {
    color: "#e74c3c",
    fontSize: "60px",
    marginBottom: "20px",
    animation: "pulse 1.2s infinite",
  };

  const titleStyle = {
    fontSize: "22px",
    fontWeight: "600",
    color: "#222",
    marginBottom: "12px",
  };

  const messageStyle = {
    fontSize: "16px",
    color: "#555",
    marginBottom: "25px",
    lineHeight: "1.5",
  };

  const buttonStyle = {
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 25px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s ease",
  };

  // Inject keyframes for animation
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes zoomIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <>
      {isBlurred &&
        createPortal(
          <>
            {/* Blur overlay */}
            <div style={blurStyle}></div>

            {/* Modal */}
            <div style={modalBackdropStyle}>
              <div style={modalStyle}>
                <AiOutlineWarning style={iconStyle} />
                <h3 style={titleStyle}>Screenshots Disabled</h3>
                <p style={messageStyle}>
                  Screenshots are disabled on this page.
                  <br />
                  Please refresh the page to continue.
                </p>
                <button
                  style={buttonStyle}
                  onClick={() => window.location.reload()}
                >
                  🔄 Refresh Page
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
};

export default DisableActions;