import { err, ok } from 'neverthrow';
import { describe, expect, test } from 'vitest';

import { validateTag } from '../../src/validations/tag.ts';
import { Tag } from '../../internal/tag.ts';

describe('validateTag', () => {
  test('returns input wrapped in ok when input valid', () => {
    const tag: Tag = {
      name: 'pixies',
      description: 'Pixies',
      color: '#111111',
      backgroundColor: '#eeeeee',
    };

    const validationResult = validateTag(tag);

    expect(validationResult).toEqual(ok(tag));
  });

  test('returns "Name is required" when passing in a tag with an empty name', () => {
    const tag: Tag = {
      name: '',
      description: 'Pixies',
      color: '#111111',
      backgroundColor: '#eeeeee',
    };

    const validationResult = validateTag(tag);

    expect(validationResult).toEqual(err(['Name is required']));
  });

  test('returns "Name is required" when passing in a tag with a name consisting white space only', () => {
    const tag: Tag = {
      name: '    \t\n',
      description: 'Pixies',
      color: '#111111',
      backgroundColor: '#eeeeee',
    };

    const validationResult = validateTag(tag);

    expect(validationResult).toEqual(err(['Name is required']));
  });
});
