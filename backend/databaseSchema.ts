type DatabaseSchema = {
  knex_migrations: {
    id: number;
    name: string | null;
    batch: number | null;
    migration_time: string | null;
  };

  knex_migrations_lock: {
    index: number;
    is_locked: number;
  };

  roon_albums: {
    roon_album_id: string;
    album_name: string;
    artist_name: string;
    candidates_fetched_at: string | null;
    candidates_matched_at: string | null;
    created_at: string;
    updated_at: string;
  };

  roon_tracks: {
    roon_track_id: string;
    roon_album_id: string;
    track_name: string;
    number: string;
    position: number;
    created_at: string;
    updated_at: string;
  };

  mb_artists: {
    mb_artist_id: string;
    name: string;
    sort_name: string;
    disambiguation: string | null;
    created_at: string;
    updated_at: string;
  };

  mb_albums: {
    mb_album_id: string;
    roon_album_id: string;
    album_name: string;
    score: number | null;
    track_count: number | null;
    release_date: string | null;
    created_at: string;
    updated_at: string;
  };

  mb_tracks: {
    mb_track_id: string;
    mb_album_id: string;
    roon_album_id: string;
    name: string;
    number: string;
    position: number;
    length: number | null;
    created_at: string;
    updated_at: string;
  };

  mb_albums_mb_artists: {
    mb_album_id: string;
    mb_artist_id: string;
    roon_album_id: string;
    position: number;
    joinphrase: string;
    created_at: string;
    updated_at: string;
  };

  history: {
    id: number;
    mb_track_id: string;
    roon_album_id: string;
    track_name: string;
    album_name: string;
    artist_names: string;
    played_at: string;
    fraction_played: number;
    is_played: boolean;
    created_at: string;
    updated_at: string;
  };

  roon_messages: {
    id: number;
    message: string | null;
    message_type: string;
    sub_type: string | null;
    timestamp: string | null;
  };

  mb_candidates: {
    mb_album_id: string;
    roon_album_id: string;
    score: number | null;
    track_count: number | null;
    release_date: string | null;
    mb_candidate_album_name: string;
    mb_candidate_artists: string;
    mb_candidate_tracks: string;
    created_at: string;
    updated_at: string;
  };

  plays: {
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
    created_at: string;
    updated_at: string;
  };
};

export { DatabaseSchema };
