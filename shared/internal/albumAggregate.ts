import { RoonAlbum } from './roonAlbum.js';
import { RoonTrack } from './roonTrack.js';

type AlbumAggregate =
  | {
      stage: 'empty';
    }
  | {
      stage: 'withRoonAlbum';
      id: string,
      roonAlbum: RoonAlbum;
    }
  | {
      stage: 'withRoonTracks';
      id: string,
      roonAlbum: RoonAlbum;
      roonTracks: RoonTrack[];
    };

export { AlbumAggregate };
