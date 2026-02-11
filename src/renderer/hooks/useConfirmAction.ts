import { useCallback, useEffect, useRef, useState } from 'react';

interface ConfirmOptions {
  timeoutMs?: number;
}

export function useConfirmAction(
  onConfirm: () => void,
  options: ConfirmOptions = {}
): {
  confirming: boolean;
  handleConfirmClick: (event?: { stopPropagation?: () => void }) => void;
  resetConfirm: () => void;
} {
  const { timeoutMs = 3000 } = options;
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const handleConfirmClick = useCallback(
    (event?: { stopPropagation?: () => void }) => {
      event?.stopPropagation?.();

      if (confirming) {
        clearTimer();
        setConfirming(false);
        onConfirm();
        return;
      }

      setConfirming(true);
      clearTimer();
      timerRef.current = setTimeout(() => {
        setConfirming(false);
        timerRef.current = null;
      }, timeoutMs);
    },
    [clearTimer, confirming, onConfirm, timeoutMs]
  );

  return { confirming, handleConfirmClick, resetConfirm: () => {
    clearTimer();
    setConfirming(false);
  } };
}
