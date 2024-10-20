import express from 'express';
import { roon } from './roon_init.js';
import { getRoonState } from './roon_state.js';

const app = express();
const EXPRESS_PORT = process.env.EXPRESS_PORT || 3009;

app.get('/', (req, res) => {
  res.send('Connected.');
});

app.listen(EXPRESS_PORT, () => {
  console.log(`Express running on http://localhost:${EXPRESS_PORT}.`);
});

roon.start_discovery();
