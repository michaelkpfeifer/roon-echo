import { memo } from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div>
      <nav>
        <div>
          <Link to="/">Home</Link>
        </div>
        <div>
          <Link to="/browse">Browse</Link>
        </div>
        <div>
          <Link to="/albums">Albums</Link>
        </div>
        <div>
          <Link to="/artists">Artists</Link>
        </div>
        <div>
          <Link to="tracks">Tracks</Link>
        </div>
      </nav>
    </div>
  );
}

export default memo(Sidebar);
