/**
 * CSS transformation utilities for rebuild/replay.
 * These functions are used during replay to adapt CSS for the replayer environment.
 * Note: This file imports PostCSS and should NOT be bundled with the recorder.
 */

import { mediaSelectorPlugin, pseudoClassPlugin } from './css';
import safeParser from 'postcss-safe-parser';
import postcss from 'postcss';
import type { BuildCache } from './types';

export function adaptCssForReplay(cssText: string, cache: BuildCache): string {
  const cachedStyle = cache?.stylesWithHoverClass.get(cssText);
  if (cachedStyle) return cachedStyle;

  let result = cssText;
  try {
    const ast: { css: string } = postcss([
      mediaSelectorPlugin,
      pseudoClassPlugin,
    ]).process(cssText, { parser: safeParser });
    result = ast.css;
  } catch (error) {
    // on the replay side so should be ok to just log here
    console.warn('Failed to adapt css for replay', error);
  }
  cache?.stylesWithHoverClass.set(cssText, result);
  return result;
}
