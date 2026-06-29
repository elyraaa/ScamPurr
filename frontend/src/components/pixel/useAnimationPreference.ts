import { useEffect, useState } from 'react';

const STORAGE_KEY = 'scampurr-animations-enabled';
const CHANGE_EVENT = 'scampurr-animation-preference';

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function readPreference() {
  if (typeof window === 'undefined') return true;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) return !prefersReducedMotion();
  return stored !== 'false';
}

export function useAnimationPreference() {
  const [enabled, setEnabledState] = useState(readPreference);

  useEffect(() => {
    const handlePreferenceChange = (event: Event) => {
      setEnabledState((event as CustomEvent<boolean>).detail ?? readPreference());
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setEnabledState(readPreference());
    };

    window.addEventListener(CHANGE_EVENT, handlePreferenceChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(CHANGE_EVENT, handlePreferenceChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const setEnabled = (nextEnabled: boolean) => {
    window.localStorage.setItem(STORAGE_KEY, String(nextEnabled));
    setEnabledState(nextEnabled);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: nextEnabled }));
  };

  return [enabled, setEnabled] as const;
}
