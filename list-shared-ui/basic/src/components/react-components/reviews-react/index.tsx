import React, { useEffect, useRef, useState } from 'react';
import reviewsData from '../../../const/reviews/reviews.json'; 
import styles from './style.module.css'

interface Review {
  id?: number;
  author: string;
  rating: number;
  comment: string;
}

const ReviewReact: React.FC<Review> = ({ author, rating, comment }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (<>

      <div
          className="border p-4 rounded-md shadow-md flex flex-col justify-between mx-2"
          style={{ width: '100%', maxWidth: '300px', height: isHovered ? 'auto' : '150px' }} // Исправляем ширину карточки
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
      >
          <h3 className="font-bold text-lg">{author}</h3>
          <div className="flex mb-1">
              {[...Array(5)].map((_, index) => (
                  <span key={index} className={index < rating ? 'text-yellow-500' : 'text-gray-300'}>
                      ★
                  </span>
              ))}
          </div>
          <p className={`mt-1 transition-all duration-300 ${isHovered ? '' : 'line-clamp-3'}`}>
              {comment}
          </p>
      </div>
      </>);
};



const ReviewsReact: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const reviewsLength = reviewsData?.list.length || 0;
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Функция для перехода к следующему отзыву
  const nextReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviewsLength);
  };

  // Функция для перехода к предыдущему отзыву
  const prevReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reviewsLength) % reviewsLength);
  };



  useEffect(() => {
    if (scrollRef.current) {
      // Прокрутка к текущему индексу
      scrollRef.current.scrollTo({
        left: currentIndex * (scrollRef.current.clientWidth / 3), // 3 — количество видимых отзывов
        behavior: 'smooth', // Плавная прокрутка
      });
    }
  }, [currentIndex]);

  return (
    <div className="max-w-full mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">{reviewsData?.title}</h2>
      <div className={`flex overflow-x-scroll ${styles.scrollbarHide}`} ref={scrollRef}>
        {reviewsData?.list.map((review) => (
          <div
            key={review?.id}
            className="flex-shrink-0 w-64 md:w-80 px-2"
          >
            <ReviewReact
              author={review?.author}
              rating={review?.rating}
              comment={review?.comment}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <button onClick={prevReview} className="text-lg">←</button>
        <button onClick={nextReview} className="text-lg">→</button>
      </div>
    </div>
  );
};

export default ReviewsReact;