import { z } from 'zod';
import { Toml } from '../../../util/schema-utils';

const BuildpackByName = z.object({
  id: z.string(),
  version: z.string().optional(),
});

const BuildpackByURI = z.object({
  uri: z.string(),
});

const BuildpackGroup = BuildpackByName.or(BuildpackByURI);

const IoBuildpacks = z.object({
  builder: z.string().optional(),
  group: z.array(BuildpackGroup).optional(),
});

export const ProjectDescriptor = z.object({
  _: z.object({
    'schema-version': z.string(),
  }),
  io: z
    .object({
      buildpacks: IoBuildpacks.optional(),
    })
    .optional(),
});

export type ProjectDescriptor = z.infer<typeof ProjectDescriptor>;
export const ProjectDescriptorToml = Toml.pipe(ProjectDescriptor);
