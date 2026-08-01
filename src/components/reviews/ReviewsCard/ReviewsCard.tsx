'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import { MessageIcon, StarIcon } from '@/components/icons/icons';
import { formatDate } from '@/helpers/date';
import { useReviews } from '@/hooks/useReviews';
import styles from './ReviewsCard.module.css';

type ReviewsCardProps = {
  patientId?: string;
  doctorProfileId?: string;
  className?: string;
  style?: React.CSSProperties;
};

const RATING_MAX = 5;

const StarRating = ({ rating }: { rating: number }) => (
  <div className={styles.stars} aria-label={`${rating}/${RATING_MAX}`}>
    {Array.from({ length: RATING_MAX }, (_, index) => (
      <StarIcon
        key={index}
        size={14}
        filled={index < rating}
        className={index < rating ? styles.starFilled : styles.starEmpty}
      />
    ))}
  </div>
);

export const ReviewsCard = ({ patientId, doctorProfileId, className, style }: ReviewsCardProps) => {
  const { t: dict } = useTranslation();
  const t = dict.reviews;
  const { reviews, query } = useReviews({ patientId, doctorProfileId });

  return (
    <section className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>
          <MessageIcon size={13} />
        </span>
        <h2 className={styles.heading}>{t.title}</h2>
      </div>

      <div className={styles.list}>
        {query.isLoading ? <span className={styles.state}>{t.loading}</span> : null}
        {!query.isLoading && reviews.length === 0 ? (
          <span className={styles.state}>{t.empty}</span>
        ) : null}

        {reviews.map((review) => {
          const counterpartName = doctorProfileId
            ? `${review.patient.firstName} ${review.patient.lastName}`.trim()
            : `${review.doctorProfile.user.firstName} ${review.doctorProfile.user.lastName}`.trim();

          return (
            <article key={review.id} className={styles.review}>
              <div className={styles.reviewHeader}>
                {review.rating > 0 ? (
                  <StarRating rating={review.rating} />
                ) : (
                  <span className={styles.notRated}>{t.notRatedYet}</span>
                )}
              </div>

              {review.comment ? (
                <p className={styles.comment}>{review.comment}</p>
              ) : (
                <p className={styles.noComment}>{t.noComment}</p>
              )}

              <div className={styles.reviewMeta}>
                <span className={styles.counterpartName}>{counterpartName}</span>
                <span className={styles.date}>{formatDate(review.createdAt)}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
