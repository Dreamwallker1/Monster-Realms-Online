export const MRO_MOVE_EVENT = 'mro:move';
export const MRO_MOVE_STATE_EVENT = 'mro:move-state';

export interface MoveStateDetail {
  locked: boolean;
  readyAt: number;
}

export function dispatchMove(dx: number, dy: number) {
  window.dispatchEvent(new CustomEvent(MRO_MOVE_EVENT, { detail: { dx, dy } }));
}

export function dispatchMoveState(detail: MoveStateDetail) {
  window.dispatchEvent(new CustomEvent(MRO_MOVE_STATE_EVENT, { detail }));
}
