import { Fixtures } from '../../../../test/fixtures';
import { partial } from '../../../../test/util';
import type { ExtractConfig } from '../types';
import { extractPackageFile } from '.';

const piperConfigSimple = Fixtures.get(
  'simple.yaml',
);

const config = partial<ExtractConfig>({});

const packageFile = 'config.yaml';

describe('modules/manager/piper-config/extract', () => {
  describe('extractPackageFile()', () => {
    it('returns null for invalid yaml file content', () => {
      const result = extractPackageFile('nothing here: [', packageFile, config);
      expect(result).toBeNull();
    });

    it('returns null for empty yaml file content', () => {
      const result = extractPackageFile('', packageFile, config);
      expect(result).toBeNull();
    });

    it('extracts from config.yaml correctly', () => {
      const result = extractPackageFile(
        piperConfigSimple,
        packageFile,
        config,
      );
      expect(result).toMatchSnapshot();
    });
  });
});
