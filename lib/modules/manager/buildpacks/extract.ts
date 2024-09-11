import is from '@sindresorhus/is';
import { logger } from '../../../logger';
import { regEx } from '../../../util/regex';
import { isVersion } from '../../versioning/semver';
import { getDep } from '../dockerfile/extract';
import type {
  ExtractConfig,
  PackageDependency,
  PackageFileContent,
} from '../types';
import { type ProjectDescriptor, ProjectDescriptorToml } from './schema';
import { BuildpacksRegistryDatasource } from '../../datasource/buildpacks-registry';

const dockerPrefix = regEx(/^docker:\/?\//);
const buildpackRegistryPrefix = regEx(/^urn:cnb:registry:/)
const buildpackRegistryRef = regEx(
  /^urn:cnb:registry:[a-z0-9\-.]+\/[a-z0-9\-.]+(?:@(?<version>.+))?$/,
);

function isBuildpackRegistryRef(ref: string | undefined): boolean {
  if (ref === undefined) {
    return false
  }
  const bpRegistryMatch = buildpackRegistryRef.exec(ref);
  if (!bpRegistryMatch) {
    return false;
  } else if (!bpRegistryMatch.groups?.version) {
    return true;
  }

  return isVersion(bpRegistryMatch.groups.version);
}

function isDockerRef(ref: string): boolean {
  const schemaMatch = regEx(/^([a-z0-9]+):\/?\//).test(ref);
  if (
    ref.startsWith('urn:cnb') || // buildpacks registry or builder urns
    ref.startsWith('from=') || // builder reference
    isBuildpackRegistryRef(ref) || // buildpack registry ID reference
    (schemaMatch && !ref.startsWith('docker:/')) // unsupported schema
  ) {
    return false;
  }

  return true;
}

function parseProjectToml(
  content: string,
  packageFile: string,
): ProjectDescriptor | null {
  const res = ProjectDescriptorToml.safeParse(content);
  if (res.success) {
    return res.data;
  }

  logger.debug(
    { packageFile, err: res.error },
    'Failed to parse buildpacks project descriptor TOML',
  );

  return null;
}

export function extractPackageFile(
  content: string,
  packageFile: string,
  config: ExtractConfig,
): PackageFileContent | null {
  const deps: PackageDependency[] = [];

  const descriptor = parseProjectToml(content, packageFile);
  if (!descriptor) {
    return null;
  }

  if (
    descriptor.io?.buildpacks?.builder &&
    isDockerRef(descriptor.io.buildpacks.builder)
  ) {
    const dep = getDep(
      descriptor.io.buildpacks.builder.replace(dockerPrefix, ''),
      true,
      config.registryAliases,
    );
    logger.trace(
      {
        depName: dep.depName,
        currentValue: dep.currentValue,
        currentDigest: dep.currentDigest,
      },
      'Cloud Native Buildpacks builder',
    );

    deps.push({ ...dep, commitMessageTopic: 'builder {{depName}}' });
  }

  if (
    descriptor.io?.buildpacks?.group &&
    is.array(descriptor.io.buildpacks.group)
  ) {
    for (const group of descriptor.io.buildpacks.group) {
      if (group.uri && isDockerRef(group.uri)) {
        const dep = getDep(
          group.uri.replace(dockerPrefix, ''),
          true,
          config.registryAliases,
        );
        logger.trace(
          {
            depName: dep.depName,
            currentValue: dep.currentValue,
            currentDigest: dep.currentDigest,
          },
          'Cloud Native Buildpack',
        );

        deps.push(dep);
      } else if (group.uri && isBuildpackRegistryRef(group.uri)) {
        const dependency = group.uri.replace(buildpackRegistryPrefix, '')
        const version = dependency.split('@')[1] || "latest"

        const dep: PackageDependency = {
          datasource: BuildpacksRegistryDatasource.id,
          currentValue: version,
          packageName: dependency.split('@')[0],
          replaceString: `urn:cnb:registry:${dependency}`
        }
        deps.push(dep);
      } else if (group.id && isBuildpackRegistryRef(group.id)) {
        const version = group.version || "latest"

        const packageName = group.id.replace(buildpackRegistryPrefix, '');
        const dep: PackageDependency = {
          datasource: BuildpacksRegistryDatasource.id,
          currentValue: version,
          packageName: packageName,
          replaceString: `${version}`
        }
        deps.push(dep);
      }
    }
  }

  if (!deps.length) {
    return null;
  }
  return { deps };
}
