import Controls from './NowPlaying/Controls';
import Cover from './NowPlaying/Cover';
import Volume from './NowPlaying/Volume';
import SelectedZone from './NowPlaying/SelectedZone';

function NowPlaying() {
  return (
    <div className="now-playing">
      <div className="cover">
        <Cover />
      </div>
      <div className="controls">
        <Controls />
      </div>
      <div className="zones-and-volume">
        <span>
          <SelectedZone />
        </span>
        <span>
          <Volume />
        </span>
      </div>
    </div>
  );
}

export default NowPlaying;
