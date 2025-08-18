import fp from 'lodash/fp.js';

import type { RawOneLine, RawTwoLine, RawThreeLine } from '@shared/external/rawNLine';
import type { RawRoonQueueItem } from '@shared/external/rawRoonQueueItem';

const hasNumber = (prop: string) => (obj: unknown) =>
  fp.isObject(obj) && fp.isNumber(fp.get(prop, obj))

const hasString = (prop: string) => (obj: unknown) =>
  fp.isObject(obj) && fp.isString(fp.get(prop, obj))

const hasArray = (prop: string) => (obj: unknown) =>
  fp.isObject(obj) && Array.isArray(fp.get(prop, obj))

function isRawOneLine(obj: unknown): obj is RawOneLine {
  return (
    fp.isObject(obj) &&
    hasString('line1')(obj)
  );
}

function isRawTwoLine(obj: unknown): obj is RawTwoLine {
  return (
    fp.isObject(obj) &&
    hasString('line1')(obj) &&
    hasString('line2')(obj)
  );
}

function isRawThreeLine(obj: unknown): obj is RawThreeLine {
  return (
    fp.isObject(obj) &&
    hasString('line1')(obj) &&
    hasString('line2')(obj) &&
    hasString('line3')(obj)
  );
}


function isRawRoonQueueItem(obj: unknown): obj is RawRoonQueueItem {
  return (
    fp.isObject(obj) &&
    hasNumber('queueItemId')(obj) &&
    hasNumber('length')(obj) &&
    hasString('imageKey')(obj) &&
    isRawOneLine(fp.get('oneLine', obj)) &&
    isRawTwoLine(fp.get('twoLine', obj)) &&
    isRawThreeLine(fp.get('threeLine', obj))
  );
}

export {
  hasNumber,
  hasString,
  hasArray,
  isRawOneLine,
  isRawTwoLine,
  isRawThreeLine,
  isRawRoonQueueItem,
};
