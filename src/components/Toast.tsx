import { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
}

export function Toast({ message, onDismiss, durationMs = 3200 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(t);
  }, [message, onDismiss, durationMs]);

  if (!message) return null;

  return (
    <div className="app-toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}
