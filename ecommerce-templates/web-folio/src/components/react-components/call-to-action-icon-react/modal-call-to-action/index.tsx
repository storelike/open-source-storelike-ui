// components/ModalCallToAction.tsx
import React from 'react';
import localeTextSite from "../../../../locale/locale_text_site.json";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  message: string;
}

const ModalCallToAction: React.FC<ModalProps> = ({ open, onClose, message }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-lg">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">{message}</p>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {localeTextSite.components.reactComponents.callToActionIconReact.modalCallToAction.btnClose}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCallToAction;