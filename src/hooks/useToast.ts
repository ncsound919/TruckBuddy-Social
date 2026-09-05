import { useState, useEffect, useCallback, useRef } from 'react';

export function useToast(duration = 3000) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
  }, []);

  useEffect(() => {
    if (toastMsg) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setToastMsg(null);
        timerRef.current = null;
      }, duration);
    }
  }, [toastMsg, duration]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { toastMsg, showToast, setToastMsg };
}
