export const MRO_MOVE_EVENT = 'mro:move';

export function dispatchMove(dx: number, dy: number) {
  window.dispatchEvent(new CustomEvent(MRO_MOVE_EVENT, { detail: { dx, dy } }));
}
