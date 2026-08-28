import { err, ok } from 'neverthrow';
import { describe, expect, test } from 'vitest';

import {
  validateTag,
  tagValidationErrorsFor,
} from '../../src/validations/tag.ts';
import type {
  TagField,
  TagValidationError,
} from '../../src/validations/tag.ts';
import type { Tag } from '../../internal/tag.ts';

describe('validateTag', () => {
  test('returns input wrapped in ok when input is valid', () => {
    const tag: Tag = {
      name: 'pixies',
      description: 'Pixies',
      color: '#111111',
      backgroundColor: '#eeeeee',
    };

    const validationResult = validateTag(tag);

    expect(validationResult).toEqual(ok(tag));
  });

  test('returns a "Name is required" tag validation error when passing in a tag with an empty name', () => {
    const tag: Tag = {
      name: '',
      description: 'Pixies',
      color: '#111111',
      backgroundColor: '#eeeeee',
    };

    const validationResult = validateTag(tag);

    expect(validationResult).toEqual(
      err([{ field: 'name', message: 'Name is required' }]),
    );
  });

  test('returns a "Name is required" validation error when passing in a tag with a name consisting white space only', () => {
    const tag: Tag = {
      name: '    \t\n',
      description: 'Pixies',
      color: '#111111',
      backgroundColor: '#eeeeee',
    };

    const validationResult = validateTag(tag);

    expect(validationResult).toEqual(
      err([{ field: 'name', message: 'Name is required' }]),
    );
  });
});

describe('tagValidationErrorsFor', () => {
  test('returns an array of error messages for the given field', () => {
    const tagValidationErrors: TagValidationError[] = [
      { field: 'name', message: 'Name is required' },
    ];

    const validationErrors = tagValidationErrorsFor(
      tagValidationErrors,
      'name',
    );

    expect(validationErrors).toEqual(['Name is required']);
  });
});
