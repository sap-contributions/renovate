import { logger } from '../../../logger';
import { parseYaml } from '../../../util/yaml';
import { getDep } from '../dockerfile/extract';
import type {
  ExtractConfig,
  PackageDependency,
  PackageFileContent,
} from '../types';
import {
  matchesImageConfig,
} from './util';

/**
 * Recursively find all supported dependencies in the yaml object.
 *
 * @param parsedContent
 */
function findDependencies(
  parsedContent: Record<string, unknown>,
  packageDependencies: Array<PackageDependency>,
  config: ExtractConfig,
): Array<PackageDependency> {
  if (!parsedContent || typeof parsedContent !== 'object') {
    return packageDependencies;
  }

  Object.entries(parsedContent).forEach(([key, value]) => {
    if (matchesImageConfig(key, value)) {
      packageDependencies.push(getDep(value, true, config.registryAliases));
    } else {
      findDependencies(
        value as Record<string, unknown>,
        packageDependencies,
        config,
      );
    }
  });
  return packageDependencies;
}

export function extractPackageFile(
  content: string,
  packageFile: string,
  config: ExtractConfig,
): PackageFileContent | null {
  let parsedContent: Record<string, unknown>[];
  try {
    // a parser that allows extracting line numbers would be preferable, with
    // the current approach we need to match anything we find again during the update
    // TODO: fix me (#9610)
    parsedContent = parseYaml(content, null, { json: true }) as any;
  } catch (err) {
    logger.debug({ err, packageFile }, 'Failed to parse helm-values YAML');
    return null;
  }
  try {
    const deps: PackageDependency<Record<string, any>>[] = [];

    for (const con of parsedContent) {
      deps.push(...findDependencies(con, [], config));
    }

    if (deps.length) {
      return { deps };
    }
  } catch (err) /* istanbul ignore next */ {
    logger.debug(
      { err, packageFile },
      'Error parsing helm-values parsed content',
    );
  }
  return null;
}
