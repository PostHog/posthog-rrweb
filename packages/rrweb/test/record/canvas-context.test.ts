import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import initCanvasContextObserver from '../../src/record/observers/canvas/canvas';

class FakeCanvasElement {
  public nodeType = 1;
  public ELEMENT_NODE = 1;
  public classList = { contains: () => false };

  closest() {
    return null;
  }

  matches() {
    return false;
  }

  getContext(_contextType: string, ..._args: unknown[]) {
    return null;
  }
}

describe('initCanvasContextObserver', () => {
  const originalGPUTextureUsage = (
    globalThis as typeof globalThis & {
      GPUTextureUsage?: {
        COPY_SRC: number;
        RENDER_ATTACHMENT: number;
        TEXTURE_BINDING: number;
      };
    }
  ).GPUTextureUsage;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & {
        GPUTextureUsage?: {
          COPY_SRC: number;
          RENDER_ATTACHMENT: number;
          TEXTURE_BINDING: number;
        };
      }
    ).GPUTextureUsage = {
      COPY_SRC: 0x01,
      TEXTURE_BINDING: 0x04,
      RENDER_ATTACHMENT: 0x10,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();

    (
      globalThis as typeof globalThis & {
        GPUTextureUsage?: {
          COPY_SRC: number;
          RENDER_ATTACHMENT: number;
          TEXTURE_BINDING: number;
        };
      }
    ).GPUTextureUsage = originalGPUTextureUsage;
  });

  it('adds the snapshot-safe usage flags when webgpu contexts are configured', () => {
    const configure = vi.fn();
    const fakeWebGPUContext = { configure };
    const win = {
      HTMLCanvasElement: FakeCanvasElement,
    };

    const getContextSpy = vi
      .spyOn(FakeCanvasElement.prototype, 'getContext')
      .mockImplementation(((contextType: string) => {
        if (contextType === 'webgpu') {
          return fakeWebGPUContext as unknown as RenderingContext;
        }

        return null;
      }) as HTMLCanvasElement['getContext']);

    const restore = initCanvasContextObserver(
      win as unknown as Parameters<typeof initCanvasContextObserver>[0],
      'rr-block',
      null,
      true,
    );

    const canvas = new FakeCanvasElement();
    const context = canvas.getContext('webgpu') as typeof fakeWebGPUContext;
    const textureUsage = (
      globalThis as typeof globalThis & {
        GPUTextureUsage?: {
          COPY_SRC: number;
          RENDER_ATTACHMENT: number;
          TEXTURE_BINDING: number;
        };
      }
    ).GPUTextureUsage!;

    context.configure({
      usage: textureUsage.TEXTURE_BINDING,
    });

    expect(
      (canvas as FakeCanvasElement & { __context?: string }).__context,
    ).toBe('webgpu');
    expect(getContextSpy).toHaveBeenCalledWith('webgpu');
    expect(configure).toHaveBeenCalledWith({
      usage:
        textureUsage.TEXTURE_BINDING |
        textureUsage.COPY_SRC |
        textureUsage.RENDER_ATTACHMENT,
    });

    restore();
  });

  it('leaves other contexts unchanged', () => {
    const contextAttributes: WebGLContextAttributes = {};
    const win = {
      HTMLCanvasElement: FakeCanvasElement,
    };
    const getContext = vi
      .spyOn(FakeCanvasElement.prototype, 'getContext')
      .mockReturnValue({} as RenderingContext);
    const restore = initCanvasContextObserver(
      win as unknown as Parameters<typeof initCanvasContextObserver>[0],
      'rr-block',
      null,
      true,
    );

    const canvas = new FakeCanvasElement();
    canvas.getContext('webgl', contextAttributes);

    expect(
      (canvas as FakeCanvasElement & { __context?: string }).__context,
    ).toBe('webgl');
    expect(contextAttributes.preserveDrawingBuffer).toBe(true);
    expect(getContext).toHaveBeenCalledWith('webgl', contextAttributes);

    restore();
  });
});
