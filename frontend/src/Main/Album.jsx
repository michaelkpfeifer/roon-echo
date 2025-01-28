import { useContext } from 'react';
import { useParams } from 'react-router-dom';

import AppContext from '../AppContext';

function Album() {
  const { appState } = useContext(AppContext);
  const { id } = useParams();

  const album = appState.albums.find(
    (a) => a.mbAlbum && a.mbAlbum.id === parseInt(id, 10),
  );

  return (
    <>
      <h1>Album</h1>
      <h2>{album.mbAlbum.albumName}</h2>
      {album.mbAlbumTracks.map((track) => (
        <div key={track.id} className="album-track-row">
          <div className="track-row__name">
            <b>{track.name}</b>
          </div>
          <div className="album-track-row__track-add-next">
            <button type="button">Play Next</button>
          </div>
        </div>
      ))}
    </>
  );
}

export default Album;
