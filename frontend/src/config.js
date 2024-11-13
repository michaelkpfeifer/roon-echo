import fp from 'lodash/fp';

const saveConfig = (config) => {
  localStorage.setItem('roonRemoteFrontendConfig', JSON.stringify(config));
};

const loadConfig = () => {
  const config = localStorage.getItem('roonRemoteFrontendConfig');
  return config ? JSON.parse(config) : null;
};

export { loadConfig, saveConfig };
