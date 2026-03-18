type PersistedRoonAlbumRow = {
  album_id: string;
  roon_album_name: string;
  roon_album_artist_name: string;
  mb_candidates_fetched_at: string | null;
  mb_candidates_matched_at: string | null;
  created_at: string;
  updated_at: string;
};

export type { PersistedRoonAlbumRow };
