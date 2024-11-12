import Controls from './NowPlaying/Controls';
import Cover from './NowPlaying/Cover';
import Zones from './NowPlaying/Zones';

function NowPlaying() {
  return (
    <div className="now-playing">
      <div className="cover">
        <Cover />
      </div>
      <div className="controls">
        <Controls />
      </div>
      <div className="zones">
        <Zones />
      </div>
    </div>
  );
}

export default NowPlaying;
