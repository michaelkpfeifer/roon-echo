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
    </>
  );
}

export default Album;
