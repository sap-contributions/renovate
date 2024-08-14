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
      expect(result).toMatchSnapshot({
        deps: [
        {
            "autoReplaceStringTemplate": "{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}",
           "currentDigest": undefined,
           "currentValue": "3.9.6",
           "datasource": "docker",
           "depName": "maven",
           "replaceString": "maven:3.9.6",
         },
        {
           "autoReplaceStringTemplate": "{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}",
           "currentDigest": undefined,
           "currentValue": "8-jdk17-alpine",
           "datasource": "docker",
           "depName": "gradle",
           "replaceString": "gradle:8-jdk17-alpine",
         },
          {
           "autoReplaceStringTemplate": "{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}",
           "currentDigest": undefined,
           "currentValue": "11",
           "datasource": "docker",
           "depName": "openjdk",
           "replaceString": "openjdk:11",
         },
          {
           "autoReplaceStringTemplate": "{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}",
           "currentDigest": undefined,
           "currentValue": "0.0.2",
           "datasource": "docker",
            "depName": "docker.io/paketobuildpacks/build-noble-base",
           "replaceString": "docker.io/paketobuildpacks/build-noble-base:0.0.2",
          },
          {
           "autoReplaceStringTemplate": "{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}",
           "currentDigest": undefined,
           "currentValue": "0.0.2",
           "datasource": "docker",
            "depName": "index.docker.io/paketobuildpacks/run-noble-base",
           "replaceString": "index.docker.io/paketobuildpacks/run-noble-base:0.0.2",
          },
        ],
      });
    });
  });
});
