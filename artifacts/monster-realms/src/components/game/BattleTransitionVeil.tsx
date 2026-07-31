import { useEffect, useState, type CSSProperties } from 'react';
import {
  BATTLE_FOCUS_EVENT,
  BATTLE_OPEN_EVENT,
  BATTLE_RELEASE_EVENT,
} from '@/lib/battle-transition-events';

const ELEMENT_COLOR: Record<string, string> = {
  Fire: '#ff542e', Water: '#38bdf8', Nature: '#4ade80', Earth: '#a3e635',
  Electric: '#fde047', Storm: '#fde047', Dark: '#c084fc', Shadow: '#c084fc',
};

export default function BattleTransitionVeil() {
  const [state, setState] = useState<'idle' | 'focus' | 'open'>('idle');
  const [color, setColor] = useState('#ff6542');

  useEffect(() => {
    let closeTimer: number | undefined;
    const focus = (event: Event) => {
      const detail = (event as CustomEvent<{ element?: string }>).detail;
      setColor(ELEMENT_COLOR[detail?.element ?? 'Fire'] ?? '#ff6542');
      setState('focus');
    };
    const open = () => {
      setState('open');
      closeTimer = window.setTimeout(() => setState('idle'), 1650);
    };
    const release = () => setState('idle');

    window.addEventListener(BATTLE_FOCUS_EVENT, focus);
    window.addEventListener(BATTLE_OPEN_EVENT, open);
    window.addEventListener(BATTLE_RELEASE_EVENT, release);
    return () => {
      window.clearTimeout(closeTimer);
      window.removeEventListener(BATTLE_FOCUS_EVENT, focus);
      window.removeEventListener(BATTLE_OPEN_EVENT, open);
      window.removeEventListener(BATTLE_RELEASE_EVENT, release);
    };
  }, []);

  if (state === 'idle') return null;

  return (
    <div className={`battle-transition-veil battle-transition-${state}`} style={{ '--battle-color': color } as CSSProperties}>
      <div className="battle-transition-letterbox battle-transition-letterbox-top" />
      <div className="battle-transition-letterbox battle-transition-letterbox-bottom" />
      <div className="battle-transition-focus-ring" />
      <div className="battle-transition-speed-lines" />
      <div className="battle-transition-core" />
      <div className="battle-transition-title">
        <span>FIELD RESONANCE</span>
        <strong>ENGAGING</strong>
      </div>
    </div>
  );
}
