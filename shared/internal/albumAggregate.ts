import type { MbAlbum } from './mbAlbum.js';
import type { RoonAlbum } from './roonAlbum.js';
import type { RoonTrack } from './roonTrack.js';
import type { MbCandidate } from './mbCandidate.js';
import type { MbArtist } from './mbArtist.js';
import type { MbTrack } from './mbTrack.js';
import type { SortCriteria } from './sortCriteria.js';

type AlbumAggregate =
  | {
      stage: 'empty';
    }
  | {
      stage: 'withRoonAlbum';
      id: string;
      roonAlbum: RoonAlbum;
      sortCriteria: SortCriteria;
    }
  | {
      stage: 'withRoonTracks';
      id: string;
      roonAlbum: RoonAlbum;
      roonTracks: RoonTrack[];
      sortCriteria: SortCriteria;
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
      sortCriteria: SortCriteria;
    }
  | {
      stage: 'withoutMbMatch';
      id: string;
      roonAlbum: RoonAlbum;
      roonTracks: RoonTrack[];
      mbCandidates: MbCandidate[];
      sortCriteria: SortCriteria;
    };

export type { AlbumAggregate };
