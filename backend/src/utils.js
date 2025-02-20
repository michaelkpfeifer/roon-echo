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

export { camelCaseKeys, snakeCaseKeys };
