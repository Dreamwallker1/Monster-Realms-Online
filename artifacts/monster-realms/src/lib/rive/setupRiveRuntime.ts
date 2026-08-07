import riveWasmUrl from '@rive-app/canvas/rive.wasm?url';
import { RuntimeLoader } from './riveApi';

let configured = false;

/** Call once before constructing any Rive instance. */
export function ensureRiveRuntimeConfigured(): void {
  if (configured) return;
  if (RuntimeLoader && typeof RuntimeLoader.setWasmUrl === 'function') {
    RuntimeLoader.setWasmUrl(riveWasmUrl);
  }
  configured = true;
}
