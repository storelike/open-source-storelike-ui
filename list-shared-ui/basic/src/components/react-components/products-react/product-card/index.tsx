import React from 'react';
import styles from './styles.module.css';
import { TbLampOff, TbTruckDelivery } from 'react-icons/tb';
import cardProductTheme from '../../../../const/products/products.json';
import type { Product } from '../ProductTypes';
import MarkdownText from '../../../../components/react-components/markdown-text';
import localeTextSite from '../../../../locale/locale_text_site.json';

interface ProductCardProps {
  productSlug?: string;
  productData: Product;
  onMoreDetails: (productSlug: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ productData, productSlug, onMoreDetails }) => {
  const { title, price, discount, image, is_active, is_delivery } = productData;
  const discountedPrice = price - (price * Number(discount)) / 100;

  return (
    <div
      style={{ backgroundColor: cardProductTheme?.bgCard, color: cardProductTheme?.cardTextColor }}
      className={styles.productCard}
    >
      {image?.src && (
        <div className={styles.imageWrapper}>
          <img
            src={`${image.src}?w=600&h=400&format=webp`}
            alt={title}
            className={`${styles.productImage} ${cardProductTheme.isBlackAndWhitePhoto ? 'grayscale' : ''}`}
          />
        </div>
      )}

      <div className={styles.productDetails}>
        <div className={styles.productTitle}>
          <MarkdownText text={title} />
        </div>

        {!is_active && <TbLampOff size={48} color="red" className={styles.statusIcon} />}

        <div className={styles.priceContainer}>
          {Number(discount) > 0 ? (
            <>
              <span className={styles.originalPrice}>
                {price.toFixed(2)} {localeTextSite.globalSettings.iconCurrency}
              </span>
              <span className={styles.discountedPrice}>
                {discountedPrice.toFixed(2)} {localeTextSite.globalSettings.iconCurrency}
              </span>
            </>
          ) : (
            <span className={styles.productPrice}>
              {price.toFixed(2)} {localeTextSite.globalSettings.iconCurrency}
            </span>
          )}
        </div>

        {is_delivery && (
          <div className={styles.deliveryIcon}>
            <TbTruckDelivery size={24} />
          </div>
        )}

        <div className={styles.buttonsContainer}>
          <button className={styles.moreButton} onClick={() => productSlug && onMoreDetails(productSlug)}>
            {localeTextSite.components.reactComponents.productCard.btnDetails}
          </button>

          {productData.is_payment_button ? (
            <a href={`/init-payment/${productSlug}`}>
              <button className={styles.payButton}>
                {localeTextSite.components.reactComponents.productCard.btnPay}
              </button>
            </a>
          ) : (
            <a href={`/send-order/${productSlug}`}>
              <button className={styles.payButton}>
                <span className="orderText">
                  {cardProductTheme?.text_button_to_order}
                </span>
              </button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
