import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import './styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Cannot find root element.');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
