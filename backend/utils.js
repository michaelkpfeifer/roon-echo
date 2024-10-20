import fp from 'lodash/fp.js';

function camelCaseKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(camelCaseKeys);
  } else if (fp.isPlainObject(obj)) {
    return fp.mapKeys(
      fp.camelCase,
      fp.mapValues((value) => camelCaseKeys(value))(obj),
    );
  } else {
    return obj;
  }
}

function snakeCaseKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(snakeCaseKeys);
  } else if (fp.isPlainObject(obj)) {
    return fp.mapKeys(
      fp.snakeCase,
      fp.mapValues((value) => snakeCaseKeys(value))(obj),
    );
  } else {
    return obj;
  }
}

export { camelCaseKeys, snakeCaseKeys };
