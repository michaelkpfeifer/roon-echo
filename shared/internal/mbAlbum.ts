import { MbArtist } from './mbArtist';
import { MbTrack } from './mbTrack';

type MbAlbum = {
  mbAlbumId: string;
  roonAlbumId: string;
  score: number;
  trackCount: number;
  releaseDate?: string;
  artists: MbArtist[];
  tracks: MbTrack[];
};

export { MbAlbum };
