import { describe, expect, test } from 'vitest';

import { camelCaseKeys, snakeCaseKeys, toIso8601 } from '../src/utils.js';

describe('toIso8601', () => {
  test('converts to ISO 8601 format', () => {
    const date = new Date(2025, 4, 13, 17, 19, 23, 29);

    expect(toIso8601(date)).toEqual('2025-05-13 17:19:23.029');
  });
});

describe('camelCaseKeys', () => {
  test('returns an empty object when given an empty object', () => {
    const obj = {};

    const newObj = camelCaseKeys(obj);

    expect(newObj).toEqual(obj);
  });

  test('converts the key to camelCase in a simple case', () => {
    const obj = { key_one: 'value_one' };

    const newObj = camelCaseKeys(obj);

    expect(newObj).toEqual({ keyOne: 'value_one' });
  });

  test('leves camelCase keys alone', () => {
    const obj = { keyOne: 'value_one' };

    const newObj = camelCaseKeys(obj);

    expect(newObj).toEqual(obj);
  });

  test('works correctly for objects stored in arrays', () => {
    const ary = ['val', { key_one: 'value_one' }];

    const newAry = camelCaseKeys(ary);

    expect(newAry).toEqual(['val', { keyOne: 'value_one' }]);
  });

  test('works correctly for nested objects', () => {
    const obj = {
      key_one: 'value_one',
      key_two: { key_three: 'value_three' },
    };

    const newObj = camelCaseKeys(obj);

    expect(newObj).toEqual({
      keyOne: 'value_one',
      keyTwo: { keyThree: 'value_three' },
    });
  });
});

describe('snakeCaseKeys', () => {
  test('returns an empty object when given an empty object', () => {
    const obj = {};

    const newObj = snakeCaseKeys(obj);

    expect(newObj).toEqual(obj);
  });

  test('converts the key to camelCase in a simple case', () => {
    const obj = { keyOne: 'value_one' };

    const newObj = snakeCaseKeys(obj);

    expect(newObj).toEqual({ key_one: 'value_one' });
  });

  test('leves snakeCase keys alone', () => {
    const obj = { key_one: 'value_one' };

    const newObj = snakeCaseKeys(obj);

    expect(newObj).toEqual(obj);
  });

  test('works correctly for objects stored in arrays', () => {
    const ary = ['val', { keyOne: 'value_one' }];

    const newAry = snakeCaseKeys(ary);

    expect(newAry).toEqual(['val', { key_one: 'value_one' }]);
  });

  test('works correctly for nested objects', () => {
    const obj = {
      keyOne: 'value_one',
      keyTwo: { keyThree: 'value_three' },
    };

    const newObj = snakeCaseKeys(obj);

    expect(newObj).toEqual({
      key_one: 'value_one',
      key_two: { key_three: 'value_three' },
    });
  });
});
