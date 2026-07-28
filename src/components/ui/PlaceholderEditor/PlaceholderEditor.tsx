'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { getTokenColorIndex, PLACEHOLDER_PATTERN } from '@/helpers/placeholder-tokens';
import styles from './PlaceholderEditor.module.css';

const CHIP_KEY_ATTR = 'data-token-key';
const ZERO_WIDTH_SPACE = '​';

const TOKEN_COLOR_CLASSES = [styles.token0, styles.token1, styles.token2, styles.token3];

const getTokenColorClass = (key: string): string => TOKEN_COLOR_CLASSES[getTokenColorIndex(key)];

const isElement = (node: Node): node is Element => node.nodeType === Node.ELEMENT_NODE;

// Chips are atomic (contenteditable="false") — the browser's own cursor and
// Backspace/Delete handling treat them as a single unit, so there is no manual
// caret math anywhere in this component.
const buildChip = (
  key: string,
  label: string,
  removeLabel: string | undefined,
  onRemove: (chip: HTMLElement) => void,
): HTMLElement => {
  const chip = document.createElement('span');
  chip.contentEditable = 'false';
  chip.setAttribute(CHIP_KEY_ATTR, key);
  chip.className = `${styles.token} ${getTokenColorClass(key)}`;

  const labelNode = document.createElement('span');
  labelNode.textContent = label;
  chip.appendChild(labelNode);

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = styles.tokenRemove;
  removeButton.textContent = '×';
  if (removeLabel) {
    removeButton.setAttribute('aria-label', removeLabel);
    removeButton.title = removeLabel;
  }
  removeButton.addEventListener('mousedown', (event) => event.preventDefault());
  removeButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onRemove(chip);
  });
  chip.appendChild(removeButton);

  return chip;
};

const appendTextRun = (container: Node, text: string): void => {
  text.split('\n').forEach((line, index, lines) => {
    if (line) {
      container.appendChild(document.createTextNode(line));
    }
    if (index < lines.length - 1) {
      container.appendChild(document.createElement('br'));
    }
  });
};

const renderValue = (
  container: HTMLElement,
  value: string,
  placeholderLabels: Record<string, string> | undefined,
  removeLabel: string | undefined,
  onRemoveChip: (chip: HTMLElement) => void,
): void => {
  // eslint-disable-next-line no-param-reassign -- container is an imperatively-managed DOM node, not app data
  container.innerHTML = '';

  let lastIndex = 0;
  Array.from(value.matchAll(PLACEHOLDER_PATTERN)).forEach((match) => {
    const index = match.index ?? 0;
    appendTextRun(container, value.slice(lastIndex, index));
    const key = match[1];
    container.appendChild(buildChip(key, placeholderLabels?.[key] ?? key, removeLabel, onRemoveChip));
    lastIndex = index + match[0].length;
  });
  appendTextRun(container, value.slice(lastIndex));
};

const serializeNode = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? '').replace(new RegExp(ZERO_WIDTH_SPACE, 'g'), '');
  }

  if (isElement(node)) {
    if (node.tagName === 'BR') {
      return '\n';
    }

    const key = node.getAttribute(CHIP_KEY_ATTR);
    if (key) {
      return `{{${key}}}`;
    }

    // Unexpected wrapper (e.g. pasted formatting) — keep its text, drop the markup.
    return Array.from(node.childNodes).map(serializeNode).join('');
  }

  return '';
};

const serializeContainer = (container: HTMLElement): string =>
  Array.from(container.childNodes).map(serializeNode).join('');

const insertNodesAtSelection = (container: HTMLElement, nodes: Node[]): void => {
  container.focus();
  const selection = window.getSelection();
  let range: Range;

  if (selection && selection.rangeCount > 0 && container.contains(selection.anchorNode)) {
    range = selection.getRangeAt(0);
  } else {
    range = document.createRange();
    range.selectNodeContents(container);
    range.collapse(false);
  }

  range.deleteContents();

  let lastNode: Node | null = null;
  nodes.forEach((node) => {
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    lastNode = node;
  });

  if (lastNode && selection) {
    const nextRange = document.createRange();
    nextRange.setStartAfter(lastNode);
    nextRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(nextRange);
  }
};

export type PlaceholderEditorHandle = {
  insertPlaceholder: (key: string) => void;
  focus: () => void;
};

type PlaceholderEditorProps = {
  value: string;
  placeholder?: string;
  rows?: number;
  error?: boolean;
  disabled?: boolean;
  /** Maps a raw `{{key}}` token to the label rendered on its chip. */
  placeholderLabels?: Record<string, string>;
  /** Accessible label for each chip's remove ("×") button. */
  removeLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (value: string) => void;
  onBlur?: () => void;
};

export const PlaceholderEditor = forwardRef<PlaceholderEditorHandle, PlaceholderEditorProps>(
  (
    {
      value,
      placeholder,
      rows = 4,
      error = false,
      disabled = false,
      placeholderLabels,
      removeLabel,
      className,
      style,
      onChange,
      onBlur,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const lastEmittedRef = useRef<string | null>(null);
    const singleLine = rows === 1;

    // Event handlers below fire long after the render that created them (user
    // clicks, async DOM events) — reading props through this ref instead of
    // closing over them directly means they can never go stale.
    const latestRef = useRef({ placeholderLabels, removeLabel, onChange });
    latestRef.current = { placeholderLabels, removeLabel, onChange };

    const emitChange = () => {
      const container = containerRef.current;
      if (!container) return;

      let next = serializeContainer(container);
      if (!next) {
        // Some browsers leave a stray <br>/empty node behind after deleting
        // everything — normalize back to a truly empty node so the CSS
        // placeholder (:empty::before) shows again.
        container.innerHTML = '';
        next = '';
      }

      lastEmittedRef.current = next;
      latestRef.current.onChange?.(next);
    };

    const handleRemoveChip = (chip: HTMLElement) => {
      chip.remove();
      emitChange();
    };

    useImperativeHandle(ref, () => ({
      insertPlaceholder: (key: string) => {
        const container = containerRef.current;
        if (!container) return;

        const { placeholderLabels: labels, removeLabel: removeText } = latestRef.current;
        const chip = buildChip(key, labels?.[key] ?? key, removeText, handleRemoveChip);
        const spacer = document.createTextNode(ZERO_WIDTH_SPACE);
        insertNodesAtSelection(container, [chip, spacer]);
        emitChange();
      },
      focus: () => containerRef.current?.focus(),
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      if (lastEmittedRef.current === value) return;

      renderValue(container, value, placeholderLabels, removeLabel, handleRemoveChip);
      lastEmittedRef.current = value;
      // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the external value actually changes
    }, [value]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Enter') return;

      event.preventDefault();
      if (singleLine) return;

      const container = containerRef.current;
      if (!container) return;

      insertNodesAtSelection(container, [document.createElement('br')]);
      emitChange();
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      const container = containerRef.current;
      if (!container || !text) return;

      const nodes: Node[] = [];
      text.split('\n').forEach((line, index, lines) => {
        if (line) nodes.push(document.createTextNode(line));
        if (index < lines.length - 1) nodes.push(document.createElement('br'));
      });
      insertNodesAtSelection(container, nodes);
      emitChange();
    };

    const editorClassName = [
      styles.editor,
      singleLine ? styles.singleLine : '',
      error ? styles.error : '',
      disabled ? styles.disabled : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={containerRef}
        className={editorClassName}
        style={{ minHeight: `${rows * 24 + 20}px`, ...style }}
        contentEditable={!disabled}
        role="textbox"
        tabIndex={0}
        aria-label={placeholder}
        aria-multiline={!singleLine}
        aria-disabled={disabled}
        data-placeholder={placeholder}
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
      />
    );
  },
);

PlaceholderEditor.displayName = 'PlaceholderEditor';
