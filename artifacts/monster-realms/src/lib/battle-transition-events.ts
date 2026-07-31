export const BATTLE_FOCUS_EVENT = 'litardia:battle-focus';
export const BATTLE_FOCUS_READY_EVENT = 'litardia:battle-focus-ready';
export const BATTLE_RELEASE_EVENT = 'litardia:battle-release';
export const BATTLE_OPEN_EVENT = 'litardia:battle-open';

export function waitForBattleFocus(timeoutMs = 2600): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.removeEventListener(BATTLE_FOCUS_READY_EVENT, finish);
      resolve();
    };

    window.addEventListener(BATTLE_FOCUS_READY_EVENT, finish, { once: true });
    window.setTimeout(finish, timeoutMs);
  });
}
