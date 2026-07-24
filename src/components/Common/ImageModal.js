import { Modal, ModalBody, ModalHeader, Button } from "reactstrap";
import { FaDownload, FaExpand } from "react-icons/fa"; // Import icons
import { defaultTheme } from "../../helpers/defaultTheme";
import { toast } from "react-toastify";

const ImageModal = ({ isOpen, toggle, imageSrc }) => {
  const handleFullScreen = () => {
    const imgElement = document.getElementById("modal-image");
    if (imgElement.requestFullscreen) {
      imgElement.requestFullscreen();
    } else if (imgElement.mozRequestFullScreen) {
      // Firefox
      imgElement.mozRequestFullScreen();
    } else if (imgElement.webkitRequestFullscreen) {
      // Chrome, Safari, Opera
      imgElement.webkitRequestFullscreen();
    } else if (imgElement.msRequestFullscreen) {
      // IE/Edge
      imgElement.msRequestFullscreen();
    }
  };


  const handleDownload = async () => {
    try {
      const response = await fetch(imageSrc);

      // Check if the response is OK (status 200)
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = imageSrc?.split('attachment/')[1] || 'downloaded_image.jpg';  // Fallback if filename extraction fails
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error: ", error);
      toast.error("There was an error downloading the image. Please try again.");
    }
  };


  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle} className="d-flex justify-content-between">
        <div>
          <Button
            color="primary"
            onClick={handleFullScreen}
            style={{ marginRight: 5 }}
          >
            <FaExpand style={{ color: defaultTheme.goldColorLogo }} />
          </Button>
          <Button
            color="primary"
            style={{ backgroundColor: defaultTheme.primary }}
            onClick={handleDownload}
          >
            <FaDownload style={{ color: defaultTheme.goldColorLogo }} />
          </Button>
        </div>
      </ModalHeader>
      <ModalBody>
        <img
          id="modal-image"
          src={imageSrc}
          alt="Preview"
          crossOrigin="anonymous"
          style={{ width: "100%" }}
        />
      </ModalBody>
    </Modal>
  );
};

export default ImageModal;
