import snapshot, {
  serializeNodeWithId,
  transformAttribute,
  ignoreAttribute,
  visitSnapshot,
  cleanupSnapshot,
  needMaskingText,
  classMatchesRegex,
  IGNORED_NODE,
  DEFAULT_MAX_DEPTH,
  wasMaxDepthReached,
  genId,
} from './snapshot';
export * from './types';
export * from './utils';

export {
  snapshot,
  serializeNodeWithId,
  transformAttribute,
  ignoreAttribute,
  visitSnapshot,
  cleanupSnapshot,
  needMaskingText,
  classMatchesRegex,
  IGNORED_NODE,
  DEFAULT_MAX_DEPTH,
  wasMaxDepthReached,
  genId,
};
