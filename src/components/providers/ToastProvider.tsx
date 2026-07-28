'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Toast, type ToastColor } from '@/components/ui/Toast/Toast';
import styles from './ToastProvider.module.css';

type ToastItem = {
  id: number;
  message: string;
  color: ToastColor;
  isClosing: boolean;
};

type ToastContextValue = {
  showToast: (message: string, color?: ToastColor) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DISPLAY_MS = 3500;
const EXIT_MS = 200;

type ToastProviderProps = {
  children: React.ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const closeToast = useCallback(
    (id: number) => {
      setToasts((prev) =>
        prev.map((toast) => (toast.id === id ? { ...toast, isClosing: true } : toast)),
      );
      setTimeout(() => removeToast(id), EXIT_MS);
    },
    [removeToast],
  );

  const showToast = useCallback(
    (message: string, color: ToastColor = 'success') => {
      const id = nextId.current;
      nextId.current += 1;
      setToasts((prev) => [...prev, { id, message, color, isClosing: false }]);
      setTimeout(() => closeToast(id), DISPLAY_MS);
    },
    [closeToast],
  );

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className={styles.container}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            color={toast.color}
            isClosing={toast.isClosing}
            onClose={() => closeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};
