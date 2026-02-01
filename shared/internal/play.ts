type Play = {
  id: string;
  roon_track_id: string;
  roon_album_id: string;
  roon_album_name: string;
  roon_artist_name: string;
  roon_track_name: string;
  number: string;
  position: number;
  played_at: string;
  fraction_played: number;
  is_played: boolean;
};

export { Play };
