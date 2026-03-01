import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMirror } from '@posthog/rrweb-snapshot';
import { CanvasManager } from '../../src/record/observers/canvas/canvas-manager';

vi.mock('../../src/record/observers/canvas/canvas', () => ({
  default: () => () => {},
}));

vi.mock('../../src/record/observers/canvas/2d', () => ({
  default: () => () => {},
}));

vi.mock('../../src/record/observers/canvas/webgl', () => ({
  default: () => () => {},
}));

vi.mock(
  '../../src/record/workers/image-bitmap-data-url-worker?worker&inline',
  () => ({
    default: class FakeWorker {
      onmessage: ((e: MessageEvent) => void) | null = null;
      postMessage() {}
    },
  }),
);

describe('CanvasManager FPS observer', () => {
  let rafCallbacks: Map<number, FrameRequestCallback>;
  let nextRafId: number;

  beforeEach(() => {
    rafCallbacks = new Map();
    nextRafId = 1;

    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((cb: FrameRequestCallback) => {
        const id = nextRafId++;
        rafCallbacks.set(id, cb);
        return id;
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createCanvasManager(win: any) {
    return new CanvasManager({
      recordCanvas: true,
      mutationCb: vi.fn(),
      win,
      blockClass: 'rr-block',
      blockSelector: null,
      mirror: createMirror(),
      sampling: 4,
      dataURLOptions: {},
    });
  }

  it('should not start the rAF loop when OffscreenCanvas is unavailable', () => {
    const win = { document: { querySelectorAll: vi.fn(() => []) } };

    createCanvasManager(win);

    expect(rafCallbacks.size).toBe(0);
  });

  it('should start the rAF loop when OffscreenCanvas is available', () => {
    const win = {
      document: { querySelectorAll: vi.fn(() => []) },
      OffscreenCanvas: class {},
    };

    createCanvasManager(win);

    expect(rafCallbacks.size).toBeGreaterThan(0);
  });
});
