import { RoonAlbum } from './roonAlbum.js';
import { RoonTrack } from './roonTrack.js';
import { MbCandidate } from './mbCandidate.js';

type AlbumAggregate =
  | {
      stage: 'empty';
    }
  | {
      stage: 'withRoonAlbum';
      id: string;
      roonAlbum: RoonAlbum;
    }
  | {
      stage: 'withRoonTracks';
      id: string;
      roonAlbum: RoonAlbum;
      roonTracks: RoonTrack[];
    }
  | {
      stage: 'withMbMatch';
      id: string;
      roonAlbum: RoonAlbum;
      roonTracks: RoonTrack[];
      mbCandidates: MbCandidate[];
    }
  | {
      stage: 'withoutMbMatch';
      id: string;
      roonAlbum: RoonAlbum;
      roonTracks: RoonTrack[];
      mbCandidates: MbCandidate[];
    };

export { AlbumAggregate };
