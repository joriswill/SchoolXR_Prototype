import { Modal, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
import Upload from "./Upload";

const UploadModal = ({ show, onClose }) => {
  return (
    <Modal
      show={show}
      onClose={onClose}
      size="lg"
      popup
      className="backdrop-blur-sm bg-black/30"
    >
      <ModalHeader>3D-Modell hochladen</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unterstützte Formate: <b>GLB, USDZ, OBJ</b> – max. 10MB
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Damit dein Modell auf allen Geräten funktioniert, lade es bitte in
            jeweils einem der unterstützten Formate hoch.
          </p>
          <div className="flex flex-row gap-4">
            <Upload description=".GLB oder .OBJ Datei" />
            <Upload description=".USDZ Datei" />
          </div>
        </div>
      </ModalBody>
      <ModalFooter></ModalFooter>
    </Modal>
  );
};

export default UploadModal;
