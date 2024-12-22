import Album from './Main/Album';
import Albums from './Main/Albums';
import Artists from './Main/Artists';
import Tracks from './Main/Tracks';

function Main() {
  return (
    <div>
      <div>
        <Albums />
      </div>
      <div>
        <Album />
      </div>
      <div>
        <Artists />
      </div>
      <div>
        <Tracks />
      </div>
    </div>
  );
}

export default Main;
