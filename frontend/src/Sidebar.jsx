import { memo } from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div>
      <nav>
        <div className="sidebar-link-group">
          <div className="sidebar-link">
            <Link to="/">Home</Link>
          </div>
        </div>

        <div className="sidebar-link-group">
          <div className="sidebar-link">
            <Link to="/albums">Albums</Link>
          </div>
          <div className="sidebar-link">
            <Link to="/artists">Artists</Link>
          </div>
          <div className="sidebar-link">
            <Link to="/tracks">Tracks</Link>
          </div>
        </div>

        <div className="sidebar-link-group">
          <div className="sidebar-link">
            <Link to="/queues">Queues</Link>
          </div>{' '}
        </div>
      </nav>
    </div>
  );
}

export default memo(Sidebar);
