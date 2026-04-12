type MainArtistCardProps = {
  roonAlbumArtistName: string;
};

function ArtistCard({ roonAlbumArtistName }: MainArtistCardProps) {
  return (
    <div className="artist-card">
      <div className="artist-card__name">{roonAlbumArtistName}</div>
    </div>
  );
}

export default ArtistCard;
