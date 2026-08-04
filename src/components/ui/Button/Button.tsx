import styles from './Button.module.css';

export type ButtonColor = 'primary' | 'gray' | 'danger' | 'success' | 'warning';
export type ButtonVariant = 'solid' | 'soft' | 'outline';
export type ButtonSize = 'md' | 'sm';

type ButtonProps = {
  children: React.ReactNode;
  color?: ButtonColor;
  variant?: ButtonVariant;
  /** 'sm' renders a more compact button, e.g. in a modal action bar. */
  size?: ButtonSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Required for an icon-only button (no text children) so it stays accessible. */
  ariaLabel?: string;
};

const variantClass: Record<ButtonColor, Record<ButtonVariant, string>> = {
  primary: {
    solid: styles.primarySolid,
    soft: styles.primarySoft,
    outline: styles.primaryOutline,
  },
  gray: {
    solid: styles.graySolid,
    soft: styles.graySoft,
    outline: styles.grayOutline,
  },
  danger: {
    solid: styles.dangerSolid,
    soft: styles.dangerSoft,
    outline: styles.dangerOutline,
  },
  success: {
    solid: styles.successSolid,
    soft: styles.successSoft,
    outline: styles.successOutline,
  },
  warning: {
    solid: styles.warningSolid,
    soft: styles.warningSoft,
    outline: styles.warningOutline,
  },
};

export const Button = ({
  children,
  color = 'primary',
  variant = 'solid',
  size = 'md',
  iconLeft,
  iconRight,
  type = 'button',
  disabled = false,
  className,
  style,
  onClick,
  ariaLabel,
}: ButtonProps) => (
  <button
    // eslint-disable-next-line react/button-has-type -- type comes from a typed prop with a default
    type={type}
    disabled={disabled}
    aria-label={ariaLabel}
    className={`${styles.button} ${variantClass[color][variant]} ${size === 'sm' ? styles.sizeSm : ''} ${className ?? ''}`}
    style={style}
    onClick={onClick}
  >
    {iconLeft ? <span className={`${styles.icon} ${size === 'sm' ? styles.iconSm : ''}`}>{iconLeft}</span> : null}
    {children}
    {iconRight ? <span className={`${styles.icon} ${size === 'sm' ? styles.iconSm : ''}`}>{iconRight}</span> : null}
  </button>
);
