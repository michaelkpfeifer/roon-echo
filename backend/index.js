import { server } from './src/server.js';
import { roon } from './src/roon_init.js';

const PORT = 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}.`);
});

roon.start_discovery();
