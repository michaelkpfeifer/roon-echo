import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import './styles/global.css';
import './styles/global/album-card.css';
import './styles/global/album.css';
import './styles/global/albums.css';
import './styles/global/artists.css';
import './styles/global/main.css';
import './styles/global/queue.css';
import './styles/global/sidebar.css';
import './styles/global/track-row.css';
import './styles/global/tracks.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Cannot find root element.');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
