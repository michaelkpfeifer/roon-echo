import fp from 'lodash/fp.js';

const camelCaseKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(camelCaseKeys);
  }

  if (fp.isPlainObject(obj)) {
    return fp.mapKeys(
      fp.camelCase,
      fp.mapValues((value) => camelCaseKeys(value))(obj),
    );
  }

  return obj;
};

const snakeCaseKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(snakeCaseKeys);
  }

  if (fp.isPlainObject(obj)) {
    return fp.mapKeys(
      fp.snakeCase,
      fp.mapValues((value) => snakeCaseKeys(value))(obj),
    );
  }

  return obj;
};

const toIso8601 = (ts) => {
  const year = ts.getFullYear();
  const month = String(ts.getMonth() + 1).padStart(2, '0');
  const day = String(ts.getDate()).padStart(2, '0');
  const hours = String(ts.getHours()).padStart(2, '0');
  const minutes = String(ts.getMinutes()).padStart(2, '0');
  const seconds = String(ts.getSeconds()).padStart(2, '0');
  const milliseconds = String(ts.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

export { camelCaseKeys, snakeCaseKeys, toIso8601 };
