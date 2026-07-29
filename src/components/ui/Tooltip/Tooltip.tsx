import styles from './Tooltip.module.css';

type TooltipProps = {
  children: React.ReactNode;
  label: string;
  side?: 'top' | 'bottom';
  className?: string;
  style?: React.CSSProperties;
};

// Hover/focus label for icon-only controls — wraps a single focusable child
// (button, link) and shows `label` above/below it, keyboard-accessible via
// the child's own focus ring rather than a separate tabbable element.
export const Tooltip = ({ children, label, side = 'top', className, style }: TooltipProps) => (
  <span className={`${styles.wrap} ${className ?? ''}`} style={style}>
    {children}
    <span className={styles.bubble} data-side={side} role="tooltip">
      {label}
    </span>
  </span>
);
