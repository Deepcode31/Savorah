import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

let gsiPromise: Promise<void> | null = null;
function loadGsi(): Promise<void> {
  if (gsiPromise) return gsiPromise;
  gsiPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
    document.head.appendChild(script);
  });
  return gsiPromise;
}

interface GoogleButtonProps {
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
}

/**
 * Renders the official Google Identity Services button when a client ID is
 * configured on the server. Otherwise shows a disabled state pointing users to
 * the email-code flow — never a fake login.
 */
export const GoogleButton: React.FC<GoogleButtonProps> = ({ onCredential, onError }) => {
  const holder = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    fetch('/api/auth/config')
      .then((r) => r.json())
      .then((d) => setClientId(d.googleClientId ?? null))
      .catch(() => setClientId(null));
  }, []);

  useEffect(() => {
    if (!clientId || !holder.current) return;
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || !holder.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          // Prefer FedCM when available (Chrome) — avoids fragile popup postMessage.
          use_fedcm_for_prompt: true,
          callback: (resp: { credential?: string }) => {
            if (resp.credential) onCredential(resp.credential);
            else onError('Google sign-in was cancelled.');
          },
          error_callback: (err: { type?: string; message?: string }) => {
            const msg =
              err?.type === 'popup_closed'
                ? 'Google sign-in was closed before finishing.'
                : err?.message ||
                  'Google sign-in failed. Check that http://localhost:5055 is listed under Authorized JavaScript origins for your OAuth client.';
            onError(msg);
          },
        });
        holder.current.innerHTML = '';
        window.google.accounts.id.renderButton(holder.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: 320,
          // FedCM button flow when supported; falls back to popup otherwise.
          use_fedcm_for_button: true,
        });
      })
      .catch((e) => onError(e.message));
    return () => {
      cancelled = true;
    };
  }, [clientId, onCredential, onError]);

  if (clientId === undefined) {
    return <div className="h-11 rounded-2xl glass animate-pulse" aria-hidden />;
  }

  if (!clientId) {
    return (
      <div
        className="w-full py-3.5 rounded-2xl glass text-sm font-semibold text-mist-500 text-center cursor-not-allowed"
        title="Set GOOGLE_CLIENT_ID in .env to enable Google sign-in"
      >
        Google sign-in unavailable — use email code below
      </div>
    );
  }

  return <div ref={holder} className="flex justify-center [color-scheme:normal]" />;
};
