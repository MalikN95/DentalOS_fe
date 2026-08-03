'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { StaffRole } from '@/common/types/staff';
import { ReviewsTable } from '@/components/reviews/ReviewsTable/ReviewsTable';
import { EmptyState, Pagination } from '@/components/ui';
import { useReviews } from '@/hooks/useReviews';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './ReviewsPageContent.module.css';

const REVIEWS_ROLES: StaffRole[] = ['owner', 'admin', 'doctor'];
// A doctor can only read their own reviews — the backend already force-scopes
// the list to their doctorProfileId, this just hides the curation toggles
// that only make sense for owner/admin.
const CURATION_ROLES: StaffRole[] = ['owner', 'admin'];

export const ReviewsPageContent = () => {
  const { t: dict } = useTranslation();
  const t = dict.reviews;
  const currentUser = useAppSelector(selectCurrentUser);
  const hasAccess = Boolean(currentUser && REVIEWS_ROLES.includes(currentUser.role as StaffRole));
  const canCurate = Boolean(currentUser && CURATION_ROLES.includes(currentUser.role as StaffRole));

  const { reviews, total, page, limit, setPage, setLimit, query } = useReviews();

  if (!hasAccess) {
    return <EmptyState title={t.noAccessTitle} description={t.noAccessDescription} />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.subtitle}>{t.description}</p>
        </div>
      </div>

      <ReviewsTable
        reviews={reviews}
        isLoading={query.isLoading}
        errorMessage={query.error?.message ?? null}
        readOnly={!canCurate}
        className={styles.tableSection}
        footer={
          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        }
      />
    </div>
  );
};
