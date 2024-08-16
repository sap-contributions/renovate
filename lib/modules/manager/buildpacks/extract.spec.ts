import { Fixtures } from '../../../../test/fixtures';

import { extractPackageFile } from '.';

describe('modules/manager/buildpacks/extract', () => {
  describe('extractPackageFile()', () => {
    it('returns null for empty', () => {
      expect(extractPackageFile('not a project toml', '', {})).toBeNull();
    });

    it('extracts builder and buildpack images', () => {
      const res = extractPackageFile(
        Fixtures.get('project.toml'),
        'project.toml',
        {},
      );
      expect(res?.deps).toHaveLength(3);
      expect(res?.deps).toMatchSnapshot();
    });
  });
});
