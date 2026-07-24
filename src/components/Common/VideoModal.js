import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { defaultTheme } from "../../helpers/defaultTheme";

const VideoModal = ({ isOpen, toggle, videoSrc }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>Video</ModalHeader>
      <ModalBody>
        <video
          controls
          style={{ width: "100%",height:300 }}
          src={videoSrc}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} style={{backgroundColor:defaultTheme.goldColorLogo}}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default VideoModal;
