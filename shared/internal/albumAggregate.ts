import type { MbAlbum } from './mbAlbum.js';
import type { RoonAlbum } from './roonAlbum.js';
import type { RoonTrack } from './roonTrack.js';
import type { MbCandidate } from './mbCandidate.js';
import type { MbArtist } from './mbArtist.js';
import type { MbTrack } from './mbTrack.js';

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
      mbAlbum: MbAlbum;
      mbArtists: MbArtist[];
      mbTracks: MbTrack[];
    }
  | {
      stage: 'withoutMbMatch';
      id: string;
      roonAlbum: RoonAlbum;
      roonTracks: RoonTrack[];
      mbCandidates: MbCandidate[];
    };

export type { AlbumAggregate };
