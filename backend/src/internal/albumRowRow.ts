type AlbumRowRow = {
  album_id: string;
  roon_album_name: string;
  roon_album_artist_name: string;
  mb_candidates_fetched_at: string | null;
  mb_candidates_matched_at: string | null;
  mb_album_id: string | null;
  mb_album_name: string | null;
  mb_sore: number | null;
  mb_track_count: number | null;
  mb_release_date: string | undefined;
  created_at: string;
  updated_at: string;
};

export type { AlbumRowRow };
