import React, { useState } from 'react';
import styles from './styles.module.css';
import ProductDescriptionModal from '../product-description';
import ProductCard from '../product-card';
import type { ProductColection } from '../ProductTypes';


interface ProductListProps {
  productsColection: ProductColection[];
}

const ProductList: React.FC<ProductListProps> = ({ productsColection }) => {
  const [selectedProduct, setSelectedProduct] = useState<null | { slug: string; title:string; body: string }>(null);
  
  const formatProducts = productsColection?.map((product) => ({
    ...product,
    price: typeof product.data.price === 'string' ? parseFloat(product.data.price) : product.data.price,
    discount: typeof product.data.discount === 'string' ? parseFloat(product.data.discount) : product.data.discount,
  }));
  

  const filteredProducts = formatProducts
  .filter((product) => product.data.is_active)
  .sort((a, b) => {
    
    const serialA = Number(a.data.serial_number);
    const serialB = Number(b.data.serial_number);

    return serialA - serialB;
  });


  const openModal = (slug: string, title: string, body: string) => {
    setSelectedProduct({ slug, title, body });
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  return (<>
  <div className={` ${styles.container}`}>
    <div className={styles.productList}>
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          productSlug={product.slug}
          productData={product?.data}
          onMoreDetails={() => product.slug && openModal(product.slug, product.data.title, product.data.description)}
        />
      ))}
      {selectedProduct && (
        <ProductDescriptionModal
          productSlug={selectedProduct.slug}
          title={selectedProduct.title}
          description={selectedProduct.body}
          onClose={closeModal}
        />
      )}
   </div> 
   </div>
    </>);
};

export default ProductList;
