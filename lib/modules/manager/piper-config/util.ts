import { regEx } from '../../../util/regex';

const parentKeyRe = regEx(/image$/i);

export function matchesImageConfig(
  parentKey: string,
  data: unknown,
): data is string {
  return !!(parentKeyRe.test(parentKey) && data && typeof data === 'string');
}
