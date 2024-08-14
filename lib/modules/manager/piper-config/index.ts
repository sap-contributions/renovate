import type { Category } from '../../../constants';
import { DockerDatasource } from '../../datasource/docker';
export { extractPackageFile } from './extract';

export const defaultConfig = {
  commitMessageTopic: 'piper configuration {{depName}}',
  fileMatch: ['(^\\.pipeline/config\\.ya?ml$'],
  pinDigests: false,
};

export const categories: Category[] = ['jenkins'];

export const supportedDatasources = [DockerDatasource.id];
