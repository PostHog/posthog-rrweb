import type { ICanvas } from '@posthog/rrweb-snapshot';
import type {
  blockClass,
  IWindow,
  listenerHandler,
} from '@posthog/rrweb-types';
import { isBlocked } from '../../../utils';
import { patch } from '@posthog/rrweb-utils';

const WEBGL_CONTEXT_NAMES = ['webgl', 'webgl2'];

type GPUCanvasConfigurationLike = {
  usage?: number;
};

type WebGPUCanvasContextLike = {
  configure?: (configuration: GPUCanvasConfigurationLike) => void;
  __rrwebWebGPUConfigurePatched?: boolean;
};

function getNormalizedContextName(contextType: string) {
  return contextType === 'experimental-webgl' ? 'webgl' : contextType;
}

function getRequiredWebGPUTextureUsage() {
  const textureUsage = (
    globalThis as typeof globalThis & {
      GPUTextureUsage?: {
        COPY_SRC: number;
        RENDER_ATTACHMENT: number;
      };
    }
  ).GPUTextureUsage;

  if (!textureUsage) {
    return null;
  }

  return textureUsage.COPY_SRC | textureUsage.RENDER_ATTACHMENT;
}

function patchWebGPUConfigureForSnapshotting(context: unknown) {
  if (!context || typeof context !== 'object') {
    return;
  }

  const webgpuContext = context as WebGPUCanvasContextLike;
  if (
    webgpuContext.__rrwebWebGPUConfigurePatched ||
    typeof webgpuContext.configure !== 'function'
  ) {
    return;
  }

  const originalConfigure = webgpuContext.configure;
  webgpuContext.configure = function (
    this: WebGPUCanvasContextLike,
    configuration: GPUCanvasConfigurationLike,
  ) {
    const requiredUsage = getRequiredWebGPUTextureUsage();
    if (requiredUsage === null || !configuration) {
      return originalConfigure.call(this, configuration);
    }

    return originalConfigure.call(this, {
      ...configuration,
      // WebGPU does not implicitly keep RENDER_ATTACHMENT when usage is set,
      // so include both flags needed for drawing and snapshot reads.
      usage:
        typeof configuration.usage === 'number'
          ? configuration.usage | requiredUsage
          : requiredUsage,
    });
  };
  webgpuContext.__rrwebWebGPUConfigurePatched = true;
}

export default function initCanvasContextObserver(
  win: IWindow,
  blockClass: blockClass,
  blockSelector: string | null,
  setPreserveDrawingBufferToTrue: boolean,
): listenerHandler {
  const handlers: listenerHandler[] = [];
  try {
    const restoreHandler = patch(
      win.HTMLCanvasElement.prototype,
      'getContext',
      function (
        original: (
          this: ICanvas | HTMLCanvasElement,
          contextType: string,
          ...args: Array<unknown>
        ) => void,
      ) {
        return function (
          this: ICanvas | HTMLCanvasElement,
          contextType: string,
          ...args: Array<unknown>
        ) {
          const ctxName = getNormalizedContextName(contextType);
          if (!isBlocked(this, blockClass, blockSelector, true)) {
            if (!('__context' in this)) (this as ICanvas).__context = ctxName;

            if (
              setPreserveDrawingBufferToTrue &&
              WEBGL_CONTEXT_NAMES.includes(ctxName)
            ) {
              if (args[0] && typeof args[0] === 'object') {
                const contextAttributes = args[0] as WebGLContextAttributes;
                if (!contextAttributes.preserveDrawingBuffer) {
                  contextAttributes.preserveDrawingBuffer = true;
                }
              } else {
                args.splice(0, 1, {
                  preserveDrawingBuffer: true,
                });
              }
            }
          }

          const context = original.apply(this, [contextType, ...args]);

          if (
            !isBlocked(this, blockClass, blockSelector, true) &&
            setPreserveDrawingBufferToTrue &&
            ctxName === 'webgpu'
          ) {
            patchWebGPUConfigureForSnapshotting(context);
          }

          return context;
        };
      },
    );
    handlers.push(restoreHandler);
  } catch {
    console.error('failed to patch HTMLCanvasElement.prototype.getContext');
  }
  return () => {
    handlers.forEach((h) => h());
  };
}
