import fp from 'lodash/fp';
import { useContext } from 'react';

import AppContext from '../AppContext';
import AlbumCard from './AlbumCard';

function Albums() {
  const { albumAggregates } = useContext(AppContext);

  return (
    <>
      <h1 className="heading-display">Albums</h1>
      <div className="albums-container">
        {fp
          .orderBy(
            [
              'sortCriteria.artistNames',
              'sortCriteria.mbReleaseDate',
              'sortCriteria.roonAlbumName',
            ],
            ['asc', 'asc', 'asc'],
            albumAggregates,
          )
          .map((albumAggregate) => (
            <div key={albumAggregate.roonAlbum.itemKey}>
              <AlbumCard albumAggregate={albumAggregate} />
            </div>
          ))}
      </div>
    </>
  );
}

export default Albums;
