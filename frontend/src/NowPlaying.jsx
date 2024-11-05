import Cover from './NowPlaying/Cover';
import Controls from './NowPlaying/Controls';
import Zones from './NowPlaying/Zones';

const NowPlaying = () => {
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
};

export default NowPlaying;
