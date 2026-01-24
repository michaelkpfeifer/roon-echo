import { RawRoonAlbum } from '../../shared/external/rawRoonAlbum';

const buildRawRoonAlbum = (
  overrides?: Partial<RawRoonAlbum>,
): RawRoonAlbum => ({
  title: 'Default Title',
  subtitle: 'Default Subtitle',
  itemKey: '2265:23',
  imageKey: 'e271e7a0d59b7fb45185440ae1bcf1bf',
  hint: 'list',
  ...overrides,
});

export { buildRawRoonAlbum };
