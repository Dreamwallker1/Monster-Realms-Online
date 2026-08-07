/**
 * @rive-app/canvas ships as UMD/CJS. Under Vite the useful API may live on
 * either the module namespace or its `.default` — normalize once here.
 */
import * as RiveNS from '@rive-app/canvas';

type RiveModule = typeof import('@rive-app/canvas');

function resolveRiveApi(): RiveModule {
  const ns = RiveNS as unknown as RiveModule & { default?: RiveModule };
  return (ns.default ?? ns) as RiveModule;
}

export const riveApi = resolveRiveApi();
export const { Rive, Layout, Fit, Alignment, RuntimeLoader, EventType } = riveApi;
