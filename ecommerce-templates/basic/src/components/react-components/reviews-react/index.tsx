import React, { useEffect, useRef, useState } from 'react';
import { cmReviews } from '../../../locale/cms-locale.json'; 
import styles from './style.module.css'

interface Review {
  id?: number;
  author: string;
  rating: number;
  comment: string;
}

const ReviewReact: React.FC<Review> = ({ author, rating, comment }) => {
  return (
    <div className="flex h-full flex-col rounded-sm border border-border bg-surface p-6">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={index < rating ? 'text-accent' : 'text-muted'}
          >
            ★
          </span>
        ))}
      </div>
      <p className="mt-4 flex-1 leading-relaxed text-secondary">{comment}</p>
      <h3 className="mt-6 text-sm font-medium text-text">{author}</h3>
    </div>
  );
};



const ReviewsReact: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const reviewsLength = cmReviews?.list.length || 0;
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Go to the next review
  const nextReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviewsLength);
  };

  // Go to the previous review
  const prevReview = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reviewsLength) % reviewsLength);
  };



  useEffect(() => {
    if (scrollRef.current) {
      // Scroll to the current index
      scrollRef.current.scrollTo({
        left: currentIndex * (scrollRef.current.clientWidth / 3), // 3 — number of visible reviews
        behavior: 'smooth', // Smooth scroll
      });
    }
  }, [currentIndex]);

  return (
    <section className="py-20 lg:py-28">
      <div className="mb-12 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-eyebrow uppercase tracking-[0.2em] text-muted">
            Reviews
          </p>
          <h2 className="mt-6 text-3xl text-text sm:text-4xl">
            {cmReviews?.title.value}
          </h2>
        </div>
        <div className="hidden shrink-0 gap-2 sm:flex">
          <button
            onClick={prevReview}
            aria-label="Previous review"
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-border-strong text-text transition-colors hover:bg-surface"
          >
            ←
          </button>
          <button
            onClick={nextReview}
            aria-label="Next review"
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-border-strong text-text transition-colors hover:bg-surface"
          >
            →
          </button>
        </div>
      </div>
      <div
        className={`flex gap-5 overflow-x-scroll pb-2 ${styles.scrollbarHide}`}
        ref={scrollRef}
      >
        {cmReviews?.list.map((review) => (
          <div key={review?.id} className="w-72 shrink-0 md:w-80">
            <ReviewReact
              author={review?.author}
              rating={review?.rating}
              comment={review?.comment}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewsReact;