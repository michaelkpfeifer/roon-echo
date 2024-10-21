import { server } from './server.js';
import { roon } from './roon_init.js';

const PORT = 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}.`);
});

roon.start_discovery();
