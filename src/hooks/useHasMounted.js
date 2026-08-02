'use client';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * SSR-safe "has this component mounted on the client yet" flag.
 * Returns false during the server render and the initial client hydration
 * pass (matching the server output), then true immediately after — the
 * React-endorsed replacement for the old `useState(false) + useEffect(() =>
 * setMounted(true))` pattern, without calling setState from inside an effect.
 */
export default function useHasMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
