import { Disc, Music4, User } from 'lucide-react';
import { useContext } from 'react';

import AppContext from '../AppContext';
import { albumsCount, artistsCount, tracksCount } from '../utils';

function Home() {
  const { albumAggregates } = useContext(AppContext);

  return (
    <div className="main-container">
      <div className="count-cards-container">
        <div className="count-card">
          <div>
            <User className="count-card__icon" />
          </div>
          <div className="count-card__data">
            <div className="count-card__count">
              {artistsCount(albumAggregates)}
            </div>
            <div className="count-card__item-name">Artists</div>
          </div>
        </div>
        <div className="count-card">
          <div>
            <Disc className="count-card__icon" />
          </div>
          <div className="count-card__data">
            <div className="count-card__count">
              {albumsCount(albumAggregates)}
            </div>
            <div className="count-card__item-name">Albums</div>
          </div>
        </div>
        <div className="count-card">
          <div>
            <Music4 className="count-card__icon" />
          </div>
          <div className="count-card__data">
            <div className="count-card__count">
              {tracksCount(albumAggregates)}
            </div>
            <div className="count-card__item-name">Tracks</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
