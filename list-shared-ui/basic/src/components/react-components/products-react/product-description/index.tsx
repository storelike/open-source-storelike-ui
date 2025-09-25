import React from 'react';
import styles from './styles.module.css';
import { AiOutlineClose } from 'react-icons/ai';
import MarkdownText from '../../markdown-text';
import localeTextSite from "../../../../locale/locale_text_site.json";

interface ProductDescriptionModalProps {
  title: string;
  description: string;
  productSlug: string
  onClose: () => void;
}


const ProductDescriptionModal: React.FC<ProductDescriptionModalProps> = ({ productSlug, title, description, onClose }) => {
  
  const handleMoreDetails = () => {
    window.location.href = `/products/${productSlug}`;
  };

  return (
    <div
    style={{zIndex:9999}}
    className={` ${styles.modalOverlay}`}>
        <div className={`h-[500px] overflow-y-auto ${styles.modalContent}`}>
        <button
    className="absolute bg-red-300 rounded-full p-1 top-2 right-10 text-gray-500 hover:text-gray-800"
    onClick={onClose}
    aria-label="Close modal"
  >
    <AiOutlineClose size={24} />
  </button>
        <div className={`pt-4 ${styles.modalTitle}`}>
          
          <MarkdownText text={title} /> 
          </div>
        <div className={styles.modalDescription}>
        <MarkdownText text={description} /> 
          </div>
        <button className={styles.closeButton} onClick={handleMoreDetails}>
          {localeTextSite.components.reactComponents.productDescription.btnDetails}
        </button>
      </div>
    </div>
  );
};

export default ProductDescriptionModal;
