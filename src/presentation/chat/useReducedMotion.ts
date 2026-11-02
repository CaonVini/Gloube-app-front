import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** true quando o sistema pede "reduzir movimento": as animações viram trocas instantâneas. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => { if (alive) setReduced(!!v); }).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v: boolean) => setReduced(v));
    return () => { alive = false; sub?.remove?.(); };
  }, []);
  return reduced;
}
