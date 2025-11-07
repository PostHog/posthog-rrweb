import snapshot, {
  serializeNodeWithId,
  transformAttribute,
  ignoreAttribute,
  visitSnapshot,
  cleanupSnapshot,
  needMaskingText,
  classMatchesRegex,
  IGNORED_NODE,
  genId,
} from './snapshot';
import rebuild, { buildNodeWithSN, createCache } from './rebuild';
export * from './types';
export * from './utils';
export * from './utils-snapshot'; // CSS stringifying for recording
export * from './utils-rebuild'; // CSS transformation for replay

export {
  snapshot,
  serializeNodeWithId,
  rebuild,
  buildNodeWithSN,
  createCache,
  transformAttribute,
  ignoreAttribute,
  visitSnapshot,
  cleanupSnapshot,
  needMaskingText,
  classMatchesRegex,
  IGNORED_NODE,
  genId,
};
