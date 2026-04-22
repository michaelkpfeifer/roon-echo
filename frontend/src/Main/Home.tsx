import { Disc, Music4, User } from 'lucide-react';
import { useContext } from 'react';

import AppContext from '../AppContext';

function Home() {
  const { albumAggregates } = useContext(AppContext);

  const albumsCount = albumAggregates.length;

  const artistsCount = [
    ...new Set(
      albumAggregates
        .filter(
          (albumAggregate) =>
            albumAggregate.stage != 'empty' &&
            albumAggregate.stage != 'withRoonAlbum',
        )
        .map((albumAggregate) => albumAggregate.roonAlbum.roonAlbumArtistName),
    ),
  ].length;

  const tracksCount = albumAggregates
    .filter(
      (albumAggregate) =>
        albumAggregate.stage != 'empty' &&
        albumAggregate.stage != 'withRoonAlbum',
    )
    .map((albumAggregate) => albumAggregate.roonTracks.length)
    .reduce((acc, n) => acc + n, 0);

  return (
    <div className="main-container">
      <div className="count-cards-container">
        <div className="count-card">
          <div>
            <User className="count-card__icon" />
          </div>
          <div className="count-card__data">
            <div className="count-card__count">{artistsCount}</div>
            <div className="count-card__item-name">Artists</div>
          </div>
        </div>
        <div className="count-card">
          <div>
            <Disc className="count-card__icon" />
          </div>
          <div className="count-card__data">
            <div className="count-card__count">{albumsCount}</div>
            <div className="count-card__item-name">Albums</div>
          </div>
        </div>
        <div className="count-card">
          <div>
            <Music4 className="count-card__icon" />
          </div>
          <div className="count-card__data">
            <div className="count-card__count">{tracksCount}</div>
            <div className="count-card__item-name">Tracks</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
