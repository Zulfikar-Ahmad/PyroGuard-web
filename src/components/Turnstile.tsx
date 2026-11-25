import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('Turnstile script failed to load'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export interface TurnstileHandle {
  reset: () => void;
}

interface TurnstileProps {
  siteKey: string;
  theme: 'light' | 'dark';
  onToken: (token: string | null) => void;
}

/** Cloudflare Turnstile ("are you human?") widget. onToken(null) means not verified / expired. */
export const Turnstile = forwardRef<TurnstileHandle, TurnstileProps>(
  ({ siteKey, theme, onToken }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const onTokenRef = useRef(onToken);
    onTokenRef.current = onToken;

    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useImperativeHandle(ref, () => ({
      reset: () => {
        onTokenRef.current(null);
        if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
      },
    }));

    useEffect(() => {
      let cancelled = false;
      setFailed(false);
      onTokenRef.current(null);

      loadTurnstileScript()
        .then(() => {
          if (cancelled || !containerRef.current || !window.turnstile) return;
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme,
            callback: (token: string) => onTokenRef.current(token),
            'expired-callback': () => onTokenRef.current(null),
            'error-callback': () => onTokenRef.current(null),
          });
        })
        .catch(() => {
          if (!cancelled) setFailed(true);
        });

      return () => {
        cancelled = true;
        if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      };
    }, [siteKey, theme, attempt]);

    if (failed) {
      return (
        <div className="text-center text-xs text-red-600 dark:text-red-400">
          Captcha gagal dimuat (cek koneksi / pemblokir iklan).{' '}
          <button type="button" onClick={() => setAttempt((n) => n + 1)} className="font-bold underline">
            Coba lagi
          </button>
        </div>
      );
    }

    return <div ref={containerRef} className="flex justify-center min-h-[65px]" />;
  }
);

Turnstile.displayName = 'Turnstile';
