import React from 'react';
import paginationStyles from './styles.module.css';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleClick = (page: number) => {
    onPageChange(page);
  };


  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className={paginationStyles.pagination}>
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => handleClick(page)}
          className={`${paginationStyles.pageButton} ${page === currentPage ? paginationStyles.active : ''}`}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
