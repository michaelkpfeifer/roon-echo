import Controls from './NowPlaying/Controls';
import Cover from './NowPlaying/Cover';
import Volume from './NowPlaying/Volume';

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
        <span>
          <Volume />
        </span>
      </div>
    </div>
  );
}

export default NowPlaying;
