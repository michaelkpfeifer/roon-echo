import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AppProvider } from './AppContext';
import { DataProvider } from './DataContext';
import Album from './Main/Album';
import Albums from './Main/Albums';
import Artists from './Main/Artists';
import Home from './Main/Home';
import Queues from './Main/Queues';
import Tags from './Main/Tags';
import Tracks from './Main/Tracks';
import Zones from './Main/Zones';
import Notifications from './Notifications';
import NowPlaying from './NowPlaying';
import { PlaybackProvider } from './PlaybackContext';
import Sidebar from './Sidebar';
import { socket } from './socket';

function App() {
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <AppProvider>
      <DataProvider>
        <PlaybackProvider>
          <Router>
            <div className="page">
              <div className="header" />
              <div className="container">
                <div className="left">
                  <Sidebar />
                </div>
                <div className="right">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/albums" element={<Albums />} />
                    <Route path="/albums/:id" element={<Album />} />
                    <Route path="/artists" element={<Artists />} />
                    <Route path="/tracks" element={<Tracks />} />
                    <Route path="/queues" element={<Queues />} />
                    <Route path="/tags" element={<Tags />} />
                    <Route path="/zones" element={<Zones />} />
                  </Routes>
                </div>
              </div>
              <div className="footer">
                <NowPlaying />
                <Notifications />
              </div>
            </div>
          </Router>
        </PlaybackProvider>
      </DataProvider>
    </AppProvider>
  );
}

export default App;
