import { memo } from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div>
      <nav>
        <div className="link-group">
          <div>
            <Link to="/">Home</Link>
          </div>
        </div>

        <div className="link-group">
          <div>
            <Link to="/browse">Browse</Link>
          </div>
        </div>

        <div className="link-group">
          <div>
            <Link to="/albums-old">Albums</Link>
          </div>
          <div>
            <Link to="/artists-old">Artists</Link>
          </div>
          <div>
            <Link to="/tracks-old">Tracks</Link>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default memo(Sidebar);
