import { MbAlbum } from './mbAlbum';
import { RoonAlbum } from './roonAlbum.js';
import { RoonTrack } from './roonTrack.js';
import { MbCandidate } from './mbCandidate.js';
import { MbArtist } from './mbArtist';
import { MbTrack } from './mbTrack';

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

export { AlbumAggregate };
