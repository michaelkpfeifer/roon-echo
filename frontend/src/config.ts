import type { Config } from './internal/config';

const saveConfig = (config: Config) => {
  localStorage.setItem('roonRemoteFrontendConfig', JSON.stringify(config));
};

const loadConfig = () => {
  const config = localStorage.getItem('roonRemoteFrontendConfig');
  return config ? JSON.parse(config) : null;
};

export { loadConfig, saveConfig };
