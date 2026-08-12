import Bottleneck from 'bottleneck';

const roonApiRateLimiter = new Bottleneck({
  minTime: 50,
  maxConcurrent: 1,
});

export { roonApiRateLimiter };
