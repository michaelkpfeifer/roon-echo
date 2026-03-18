type TrackRowRow = {
  track_id: string;
  album_id: string;
  roon_track_name: string;
  roon_number: string;
  roon_position: number;
  roon_length: number | null;
  mb_track_id: string | null;
  mb_track_name: string | null;
  mb_medium_position: number | null;
  mb_number: string | null;
  mb_Position: number | null;
  mb_length: number | undefined;
  created_at: string;
  updated_at: string;
};

export type { TrackRowRow };
