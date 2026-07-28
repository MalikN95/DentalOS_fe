import { getTokenColorIndex, PLACEHOLDER_PATTERN } from '@/helpers/placeholder-tokens';
import styles from './PlaceholderText.module.css';

const TOKEN_COLOR_CLASSES = [styles.token0, styles.token1, styles.token2, styles.token3];

type PlaceholderTextProps = {
  text: string;
  /** Maps a raw `{{key}}` token to the label rendered on its chip. */
  placeholderLabels?: Record<string, string>;
  className?: string;
  style?: React.CSSProperties;
};

/** Read-only rendering of `{{key}}` tokens as colored chips — the list-view counterpart of PlaceholderEditor. */
export const PlaceholderText = ({ text, placeholderLabels, className, style }: PlaceholderTextProps) => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  Array.from(text.matchAll(PLACEHOLDER_PATTERN)).forEach((match) => {
    const index = match.index ?? 0;
    const key = match[1];

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    parts.push(
      <mark key={index} className={`${styles.token} ${TOKEN_COLOR_CLASSES[getTokenColorIndex(key)]}`}>
        {placeholderLabels?.[key] ?? match[0]}
      </mark>,
    );
    lastIndex = index + match[0].length;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return (
    <span className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      {parts.length > 0 ? parts : text}
    </span>
  );
};
