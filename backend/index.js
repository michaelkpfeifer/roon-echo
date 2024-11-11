import { roon, server } from './src/server.js';

const PORT = 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}.`);
});

roon.start_discovery();
