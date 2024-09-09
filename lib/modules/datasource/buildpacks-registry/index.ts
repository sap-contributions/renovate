import { logger } from '../../../logger';
import { Datasource } from '../datasource';
import type { GetReleasesConfig, ReleaseResult } from '../types';
import { BuildpacksRegistryResponseSchema } from './schema';

export class BuildpacksRegistryDatasource extends Datasource {
  static readonly id = 'buildpacks-registry';

  constructor() {
    super(BuildpacksRegistryDatasource.id);
  }

  override readonly customRegistrySupport = false;

  override readonly releaseTimestampSupport = true;
  override readonly releaseTimestampNote =
    'The release timestamp is determined from the `published_at` field in the results.';
  override readonly sourceUrlSupport = 'release';
  override readonly sourceUrlNote =
    'The source URL is determined from the `source_code_url` field of the release object in the results.';

  async getReleases({
    packageName,
    registryUrl,
  }: GetReleasesConfig): Promise<ReleaseResult | null> {
    
    const url = `https://registry.buildpacks.io/api/v1/buildpacks/${packageName}`

    const { val: response, err: baseErr } = await this.http
      .getJsonSafe(url, BuildpacksRegistryResponseSchema)
      .onError((err) => {
        logger.warn(
          { datasource: this.id, packageName, err },
          `Error fetching ${url}`,
        );
      })
      .unwrap();
    if (baseErr) {
      this.handleGenericErrors(baseErr);
    }

    const result = response.map((value) => {
      return {
        ...value,
        homepage: response.latest.homepage,
      };
    });

    return result.releases.length ? result : null;
  }
}