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
            <Link to="/albums">Albums</Link>
          </div>
          <div>
            <Link to="/artists">Artists</Link>
          </div>
          <div>
            <Link to="/tracks">Tracks</Link>
          </div>
        </div>

        <div className="link-group">
          <div>
            <Link to="/queues">Queues</Link>
          </div>{' '}
        </div>
      </nav>
    </div>
  );
}

export default memo(Sidebar);
