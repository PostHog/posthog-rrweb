/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { Mirror } from '@posthog/rrweb-snapshot';

import { initAdoptedStyleSheetObserver } from '../../src/record/observer';

describe('initAdoptedStyleSheetObserver', () => {
  it('does not throw when host.ownerDocument access throws SecurityError', () => {
    // Reproduces the Firefox "Permission denied to access property
    // 'ownerDocument'" thrown when a same-origin shadow host's owning
    // document later navigates cross-origin. The observer must bail out
    // cleanly instead of re-throwing and aborting the recorder.
    const mirror = new Mirror();
    const stylesheetManager = { adoptStyleSheets: vi.fn() } as any;

    const hostEl = document.createElement('div');
    document.body.appendChild(hostEl);
    const shadowRoot = hostEl.attachShadow({ mode: 'open' });
    mirror.add(hostEl, {
      type: 2,
      tagName: 'div',
      attributes: {},
      childNodes: [],
      id: 1,
    });
    Object.defineProperty(shadowRoot, 'ownerDocument', {
      get() {
        throw new DOMException(
          "Permission denied to access property 'ownerDocument'",
          'SecurityError',
        );
      },
    });

    let cleanup: () => void = () => {
      //
    };
    expect(() => {
      cleanup = initAdoptedStyleSheetObserver(
        { mirror, stylesheetManager },
        shadowRoot,
      );
    }).not.toThrow();
    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();

    document.body.removeChild(hostEl);
  });
});
