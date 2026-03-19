type RoonAlbumRow = {
  album_id: string;
  roon_album_name: string;
  roon_album_artist_name: string;
  image_key: string;
  item_key: string;
  mb_candidates_fetched_at: string | null;
  mb_candidates_matched_at: string | null;
};

export type { RoonAlbumRow };
