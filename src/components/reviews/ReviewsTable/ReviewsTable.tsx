'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiReview } from '@/common/types/review';
import { StarIcon } from '@/components/icons/icons';
import { Alert, SwitchToggle } from '@/components/ui';
import { formatDate } from '@/helpers/date';
import { useDragScroll } from '@/hooks/useDragScroll';
import { useUpdateReviewFeatured, useUpdateReviewShowInBooking } from '@/hooks/useUpdateReview';
import styles from './ReviewsTable.module.css';

type ReviewsTableProps = {
  reviews: ApiReview[];
  isLoading?: boolean;
  errorMessage?: string | null;
  /** Hides the Featured / Show-in-booking toggle columns — a doctor can see their own reviews but not curate them. */
  readOnly?: boolean;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const RATING_MAX = 5;

const MiniStarRating = ({ rating }: { rating: number }) => (
  <span className={styles.stars} aria-label={`${rating}/${RATING_MAX}`}>
    {Array.from({ length: RATING_MAX }, (_, index) => (
      <StarIcon
        key={index}
        size={13}
        filled={index < rating}
        className={index < rating ? styles.starFilled : styles.starEmpty}
      />
    ))}
  </span>
);

export const ReviewsTable = ({
  reviews,
  isLoading = false,
  errorMessage = null,
  readOnly = false,
  footer,
  className,
  style,
}: ReviewsTableProps) => {
  const { t: dict } = useTranslation();
  const t = dict.reviews;
  const featuredMutation = useUpdateReviewFeatured();
  const showInBookingMutation = useUpdateReviewShowInBooking();
  const columnCount = readOnly ? 5 : 7;

  const {
    ref: tableWrapRef,
    isDragging: isTableDragging,
    handlers: dragScrollHandlers,
  } = useDragScroll<HTMLDivElement>();

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      {errorMessage ? (
        <div className={styles.stateWrap}>
          <Alert color="danger">{errorMessage}</Alert>
        </div>
      ) : null}

      <div
        ref={tableWrapRef}
        className={`${styles.tableWrap} ${isTableDragging ? styles.dragging : ''}`}
        {...dragScrollHandlers}
      >
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t.colDate}</th>
              <th>{t.colPatient}</th>
              <th>{t.colDoctor}</th>
              <th>{t.colRating}</th>
              <th>{t.colComment}</th>
              {readOnly ? null : (
                <>
                  <th>{t.colFeatured}</th>
                  <th>{t.colShowInBooking}</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className={styles.stateCell} colSpan={columnCount}>
                  {t.loading}
                </td>
              </tr>
            ) : null}

            {!isLoading && reviews.length === 0 ? (
              <tr>
                <td className={styles.stateCell} colSpan={columnCount}>
                  {t.empty}
                </td>
              </tr>
            ) : null}

            {!isLoading
              ? reviews.map((review) => {
                  const isRated = review.rating > 0;
                  const isUpdatingThisFeatured =
                    featuredMutation.isPending && featuredMutation.variables?.id === review.id;
                  const isUpdatingThisShowInBooking =
                    showInBookingMutation.isPending &&
                    showInBookingMutation.variables?.id === review.id;

                  return (
                    <tr key={review.id}>
                      <td>{formatDate(review.createdAt)}</td>
                      <td>
                        {review.patient.lastName} {review.patient.firstName}
                      </td>
                      <td>
                        {review.doctorProfile.user.lastName} {review.doctorProfile.user.firstName}
                      </td>
                      <td>
                        {isRated ? (
                          <MiniStarRating rating={review.rating} />
                        ) : (
                          <span className={styles.muted}>{t.notRatedYet}</span>
                        )}
                      </td>
                      <td className={styles.commentCell}>
                        {review.comment ?? <span className={styles.muted}>{t.noComment}</span>}
                      </td>
                      {readOnly ? null : (
                        <>
                          <td>
                            <SwitchToggle
                              checked={review.featured}
                              disabled={(!isRated && !review.featured) || isUpdatingThisFeatured}
                              onChange={(checked) =>
                                featuredMutation.mutate({ id: review.id, featured: checked })
                              }
                            />
                          </td>
                          <td>
                            <SwitchToggle
                              checked={review.showInBooking}
                              disabled={
                                (!isRated && !review.showInBooking) || isUpdatingThisShowInBooking
                              }
                              onChange={(checked) =>
                                showInBookingMutation.mutate({
                                  id: review.id,
                                  showInBooking: checked,
                                })
                              }
                            />
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>
      {footer ?? null}
    </div>
  );
};
