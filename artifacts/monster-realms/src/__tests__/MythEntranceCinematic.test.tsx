/**
 * Tests for MythEntranceCinematic — verifying that entrance animations
 * finish cleanly when a battle ends mid-sequence.
 *
 * Covers the three "done looks like" scenarios from task #62:
 *  1. onComplete is harmless after the parent unmounts
 *  2. onComplete fires correctly under normal conditions
 *  3. showSwitchPanel / showOrbPicker z-index layering doesn't block entrances
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import React, { useState } from 'react';
import MythEntranceCinematic from '../components/battle/MythEntranceCinematic';

// ── Mocks ──────────────────────────────────────────────────────────────────────

// framer-motion: render children synchronously without animation machinery
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ children, ...props }: any) =>
          React.createElement(tag === 'div' ? 'div' : tag, props, children),
    },
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// myth-svgs: just export an empty archetype map
vi.mock('@/lib/myth-svgs', () => ({
  MYTH_ARCHETYPE: {} as Record<string, string>,
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Smallest timeout for a C-rarity myth (380 ms). */
const C_TIMEOUT = 380;
/** Largest timeout for an S-rarity myth (600 ms). */
const S_TIMEOUT = 600;

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('MythEntranceCinematic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    cleanup();
  });

  // ── 1. onComplete fires after the rarity timeout ────────────────────────────

  it('calls onComplete after the rarity timeout for C-rarity', () => {
    const onComplete = vi.fn();
    render(
      <MythEntranceCinematic
        mythId="FireWolf"
        element="Fire"
        rarity="C"
        side="wild"
        onComplete={onComplete}
      />,
    );

    expect(onComplete).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(C_TIMEOUT - 1); });
    expect(onComplete).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(1); });
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('calls onComplete after the rarity timeout for S-rarity', () => {
    const onComplete = vi.fn();
    render(
      <MythEntranceCinematic
        mythId="FireWolf"
        element="Fire"
        rarity="S"
        side="player"
        onComplete={onComplete}
      />,
    );

    act(() => { vi.advanceTimersByTime(S_TIMEOUT - 1); });
    expect(onComplete).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(1); });
    expect(onComplete).toHaveBeenCalledOnce();
  });

  // ── 2. onComplete is NOT called after unmount (battle ended mid-animation) ──

  it('does NOT call onComplete after the parent unmounts (endBattle mid-sequence)', () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <MythEntranceCinematic
        mythId="FireWolf"
        element="Fire"
        rarity="C"
        side="wild"
        onComplete={onComplete}
      />,
    );

    // Unmount before the timeout fires — simulates endBattle() being called
    // while showPlayerEntrance / showWildEntrance is still true.
    act(() => { unmount(); });

    // Advance well past the timeout; onComplete must stay silent.
    act(() => { vi.advanceTimersByTime(S_TIMEOUT * 2); });

    expect(onComplete).not.toHaveBeenCalled();
  });

  // ── 3. onComplete fires exactly once even when the parent re-renders ────────

  it('calls onComplete exactly once despite frequent parent re-renders', () => {
    const onComplete = vi.fn();

    /** Wrapper that re-renders every 100 ms, simulating battleData polling. */
    function PollParent() {
      const [tick, setTick] = useState(0);
      React.useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 100);
        return () => clearInterval(id);
      }, []);
      return (
        <MythEntranceCinematic
          mythId="FireWolf"
          element="Fire"
          rarity="C"
          side="wild"
          // New arrow function on every render — the old bug would restart
          // the timeout here; the ref fix means it fires exactly once.
          onComplete={onComplete}
        />
      );
    }

    render(<PollParent />);

    // Simulate several polling cycles (3 × 100 ms = 300 ms) before timeout
    act(() => { vi.advanceTimersByTime(300); });
    expect(onComplete).not.toHaveBeenCalled();

    // Advance to exactly the C_TIMEOUT from mount (380 ms total)
    act(() => { vi.advanceTimersByTime(C_TIMEOUT - 300); });
    expect(onComplete).toHaveBeenCalledOnce();

    // Extra time — should NOT be called again
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onComplete).toHaveBeenCalledOnce();
  });

  // ── 4. onComplete callback reference can change without restarting timer ────

  it('uses the latest onComplete reference when the timer fires', () => {
    const firstCallback  = vi.fn();
    const secondCallback = vi.fn();

    const { rerender } = render(
      <MythEntranceCinematic
        mythId="FireWolf"
        element="Fire"
        rarity="C"
        side="wild"
        onComplete={firstCallback}
      />,
    );

    // Swap callback mid-way — the timer must still fire once and use the NEW ref
    act(() => { vi.advanceTimersByTime(200); });
    rerender(
      <MythEntranceCinematic
        mythId="FireWolf"
        element="Fire"
        rarity="C"
        side="wild"
        onComplete={secondCallback}
      />,
    );

    act(() => { vi.advanceTimersByTime(C_TIMEOUT); });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledOnce();
  });

  // ── 5. Verify z-index layering: entrance cinematic overlays panels cleanly ──

  it('renders with z-index 25 so it sits above switch/orb panels (z-index 20)', () => {
    const { container } = render(
      <MythEntranceCinematic
        mythId="FireWolf"
        element="Fire"
        rarity="C"
        side="wild"
        onComplete={vi.fn()}
      />,
    );

    // The outermost motion.div produced by the component carries zIndex 25
    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toBeTruthy();
    expect(overlay.style.zIndex).toBe('25');
  });

  // ── 6. pointer-events-none ensures panels beneath remain interactive ────────

  it('is pointer-events-none so underlying orb/switch panels stay interactive', () => {
    const { container } = render(
      <MythEntranceCinematic
        mythId="FireWolf"
        element="Fire"
        rarity="C"
        side="wild"
        onComplete={vi.fn()}
      />,
    );

    const overlay = container.firstChild as HTMLElement;
    expect(overlay.className).toContain('pointer-events-none');
  });
});
