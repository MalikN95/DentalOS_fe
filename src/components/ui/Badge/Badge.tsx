import styles from './Badge.module.css';

export type BadgeColor = 'primary' | 'gray' | 'danger' | 'success';

type BadgeProps = {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLElement>;
};

export const Badge = ({ children, color = 'primary', className, style, onClick }: BadgeProps) => {
  const badgeClassName = `${styles.badge} ${styles[color]} ${className ?? ''}`;

  if (onClick) {
    return (
      <button type="button" className={badgeClassName} style={style} onClick={onClick}>
        {children}
      </button>
    );
  }

  return (
    <span className={badgeClassName} style={style}>
      {children}
    </span>
  );
};

type NotificationBadgeProps = {
  count: number;
  max?: number;
  className?: string;
  style?: React.CSSProperties;
};

export const NotificationBadge = ({
  count,
  max = 99,
  className,
  style,
}: NotificationBadgeProps) => (
  <span className={`${styles.dot} ${className ?? ''}`} style={style}>
    {count > max ? `${max}+` : count}
  </span>
);
