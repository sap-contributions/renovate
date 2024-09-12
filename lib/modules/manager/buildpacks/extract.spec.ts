import { Fixtures } from '../../../../test/fixtures';

import { extractPackageFile } from '.';

describe('modules/manager/buildpacks/extract', () => {
  describe('extractPackageFile()', () => {
    it('returns null for invalid files', () => {
      expect(extractPackageFile('not a project toml', '', {})).toBeNull();
    });

    it('returns null for empty package.toml', () => {
      const res = extractPackageFile(
        '[_]\nschema-version = "0.2"',
        'project.toml',
        {},
      );
      expect(res).toBeNull();
    });

    it('extracts builder and buildpack images', () => {
      const res = extractPackageFile(
        Fixtures.get('project.toml'),
        'project.toml',
        {},
      );
      expect(res?.deps).toHaveLength(8)
      expect(res?.deps).toEqual([
        {
          autoReplaceStringTemplate:
            '{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}',
          commitMessageTopic: 'builder {{depName}}',
          currentValue: '1.1.1',
          datasource: 'docker',
          depName: 'registry.corp/builder/noble',
          replaceString: 'registry.corp/builder/noble:1.1.1',
        },
        {
          autoReplaceStringTemplate:
            '{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}',
          currentValue: '2.2.2',
          datasource: 'docker',
          depName: 'buildpacks/java',
          replaceString: 'buildpacks/java:2.2.2',
        },
        {
          autoReplaceStringTemplate:
            '{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}',
          currentValue: '3.3.3',
          datasource: 'docker',
          depName: 'buildpacks/nodejs',
          replaceString: 'buildpacks/nodejs:3.3.3',
        },
        {
          datasource: 'buildpacks-registry',
          currentValue: '1.0.0',
          packageName: 'example/foo',
          replaceString:
            'urn:cnb:registry:example/foo@1.0.0',
        },
        {
          datasource: 'buildpacks-registry',
          currentValue: '1.2.3',
          packageName: 'example/bar',
          replaceString:
            'urn:cnb:registry:example/bar@1.2.3',
        },
        {
          autoReplaceStringTemplate:
            '{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}',
          currentDigest:
            'sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          datasource: 'docker',
          depName: 'cnbs/some-bp',
          replaceString:
            'cnbs/some-bp@sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        },
        {
          autoReplaceStringTemplate:
            '{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}',
          currentDigest:
            'sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          currentValue: 'some-tag',
          datasource: 'docker',
          depName: 'cnbs/some-bp',
          replaceString:
            'cnbs/some-bp:some-tag@sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        },
        {
          datasource: 'buildpacks-registry',
          currentValue: '2.3.4',
          packageName: 'example/tee',
          replaceString: '2.3.4',
        },
      ]);
    });
  });
});