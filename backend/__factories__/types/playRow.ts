type PlayRow = {
  id: string;
  track_id: string;
  album_id: string;
  roon_album_name: string;
  roon_album_artist_name: string;
  roon_track_name: string;
  roon_number: string;
  roon_position: number;
  roon_length: number;
  played_at: string;
  fraction_played: number;
  is_played: boolean;
};

export type { PlayRow };
