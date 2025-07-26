import React, { useState } from 'react';
import { FaPhone } from 'react-icons/fa';
import CalToActionForm from './form-call-to-action';
import localeTextSite from "../../../locale/locale_text_site.json";

const CallToActionIcon: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsFormOpen((prev) => !prev)}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors"
        aria-label={localeTextSite.components.reactComponents.callToActionIconReact.indexCallToActionIconReact.ariaLabel}
      >
        <FaPhone size={24} />
      </button>

      {isFormOpen && (
        <CalToActionForm onClose={() => setIsFormOpen(false)} />
      )}
      
    </div>
  );
};

export default CallToActionIcon;
