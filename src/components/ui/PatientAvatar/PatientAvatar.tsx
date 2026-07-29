import { AlertTriangleIcon } from '@/components/icons/icons';
import { getInitials } from '@/helpers/initials';
import styles from './PatientAvatar.module.css';

export type PatientAvatarSize = 'sm' | 'md';

type PatientAvatarProps = {
  name: string;
  size?: PatientAvatarSize;
  /** Shows a red warning badge on the avatar's corner, e.g. for known allergies. */
  hasWarning?: boolean;
  warningLabel?: string;
  className?: string;
  style?: React.CSSProperties;
};

const WARNING_ICON_SIZE: Record<PatientAvatarSize, number> = { sm: 9, md: 11 };

export const PatientAvatar = ({
  name,
  size = 'md',
  hasWarning = false,
  warningLabel,
  className,
  style,
}: PatientAvatarProps) => (
  <span className={`${styles.wrap} ${styles[size]} ${className ?? ''}`} style={style}>
    <span className={styles.circle}>{getInitials(name)}</span>
    {hasWarning ? (
      <button
        type="button"
        className={styles.warning}
        aria-label={warningLabel}
        title={warningLabel}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AlertTriangleIcon size={WARNING_ICON_SIZE[size]} />
      </button>
    ) : null}
  </span>
);
