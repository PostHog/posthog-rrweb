import * as path from 'path';
import type * as puppeteer from 'puppeteer';
import { describe, expect, it, vi } from 'vitest';
import type { recordOptions } from '../../src/types';
import {
  listenerHandler,
  eventWithTime,
  EventType,
  IncrementalSource,
  CanvasContext,
} from '@posthog/rrweb-types';
import { launchPuppeteer, waitForCondition } from '../utils';

interface ISuite {
  browser: puppeteer.Browser;
  page: puppeteer.Page;
  events: eventWithTime[];
}

interface IWindow extends Window {
  rrweb: {
    record: (
      options: recordOptions<eventWithTime>,
    ) => listenerHandler | undefined;
  };
  emit: (e: eventWithTime) => undefined;
}

const setup = function (this: ISuite, content: string): ISuite {
  const ctx = {} as ISuite;

  beforeAll(async () => {
    ctx.browser = await launchPuppeteer({
      args: ['--no-sandbox', '--enable-unsafe-webgpu'],
    });
  });

  beforeEach(async () => {
    ctx.page = await ctx.browser.newPage();
    await ctx.page.goto('about:blank');
    await ctx.page.setContent(content);

    await ctx.page.evaluate(() => {
      (
        globalThis as typeof globalThis & {
          GPUTextureUsage?: {
            COPY_SRC: number;
            TEXTURE_BINDING: number;
            RENDER_ATTACHMENT: number;
          };
          __originalCreateImageBitmap?: typeof createImageBitmap;
        }
      ).GPUTextureUsage = {
        COPY_SRC: 0x01,
        TEXTURE_BINDING: 0x04,
        RENDER_ATTACHMENT: 0x10,
      };

      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        contextType: string,
        ...args: unknown[]
      ) {
        if (contextType === 'webgpu') {
          const canvas = this as HTMLCanvasElement & {
            __lastWebGPUConfigure?: { usage?: number };
          };

          return {
            configure(configuration: { usage?: number }) {
              canvas.__lastWebGPUConfigure = configuration;
            },
          } as unknown as RenderingContext;
        }

        return originalGetContext.call(this, contextType, ...args);
      };

      const originalCreateImageBitmap = createImageBitmap.bind(window);
      (
        globalThis as typeof globalThis & {
          __originalCreateImageBitmap?: typeof createImageBitmap;
        }
      ).__originalCreateImageBitmap = originalCreateImageBitmap;
      window.createImageBitmap = async () => {
        const source = document.createElement('canvas');
        source.width = 4;
        source.height = 4;
        const sourceContext = source.getContext('2d')!;
        sourceContext.fillStyle = 'rgb(0, 128, 0)';
        sourceContext.fillRect(0, 0, 4, 4);
        return await originalCreateImageBitmap(source);
      };
    });

    await ctx.page.addScriptTag({
      path: path.resolve(__dirname, '../../dist/rrweb.umd.cjs'),
    });
    ctx.events = [];
    await ctx.page.exposeFunction('emit', (e: eventWithTime) => {
      if (e.type === EventType.DomContentLoaded || e.type === EventType.Load) {
        return;
      }
      ctx.events.push(e);
    });

    await ctx.page.evaluate(() => {
      const { record } = (window as unknown as IWindow).rrweb;
      record({
        recordCanvas: true,
        sampling: {
          canvas: 60,
        },
        emit: (window as unknown as IWindow).emit,
      });
    });
  });

  afterEach(async () => {
    await ctx.page.close();
  });

  afterAll(async () => {
    await ctx.browser?.close();
  });

  return ctx;
};

describe('record webgpu snapshots', function (this: ISuite) {
  vi.setConfig({ testTimeout: 100_000 });

  const ctx: ISuite = setup.call(
    this,
    `
      <!DOCTYPE html>
      <html>
        <body>
          <canvas id="canvas" width="8" height="8" style="width: 8px; height: 8px;"></canvas>
        </body>
      </html>
    `,
  );

  it('records a replayable snapshot event for webgpu canvases', async () => {
    const configuredUsage = await ctx.page.evaluate(() => {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement & {
        __lastWebGPUConfigure?: { usage?: number };
      };
      const textureUsage = (
        globalThis as typeof globalThis & {
          GPUTextureUsage: {
            COPY_SRC: number;
            TEXTURE_BINDING: number;
            RENDER_ATTACHMENT: number;
          };
        }
      ).GPUTextureUsage;

      const context = canvas.getContext('webgpu') as {
        configure: (configuration: { usage?: number }) => void;
      };
      context.configure({
        usage: textureUsage.TEXTURE_BINDING,
      });

      return canvas.__lastWebGPUConfigure?.usage ?? null;
    });

    expect(configuredUsage).toBe(0x15);

    const snapshotEvent = await waitForCondition(() =>
      ctx.events.find(
        (event) =>
          event.type === EventType.IncrementalSnapshot &&
          event.data.source === IncrementalSource.CanvasMutation &&
          event.data.type === CanvasContext['2D'],
      ),
    );

    expect(snapshotEvent).toMatchObject({
      data: {
        source: IncrementalSource.CanvasMutation,
        type: CanvasContext['2D'],
        displayWidth: 8,
        displayHeight: 8,
        commands: [
          {
            property: 'clearRect',
          },
          {
            property: 'drawImage',
          },
        ],
      },
    });
  });
});
