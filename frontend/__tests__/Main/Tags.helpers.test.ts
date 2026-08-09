import { describe, it, expect } from 'vitest';
import { v7 as uuidv7 } from 'uuid';

import {
  filterTagsByPattern,
  sortTagsByName,
} from '../../src/Main/Tags.helpers';

const jazz = {
  tagId: uuidv7(),
  name: 'jazz',
  description: 'Jazz',
  color: '#ff0000',
  backgroundColor: '#ffffff',
};

const pixies = {
  tagId: uuidv7(),
  name: 'pixies',
  description: 'Pixies',
  color: '#0000ff',
  backgroundColor: '#eeeeee',
};

describe('filterTagsByPattern', () => {
  it('returns all tags when pattern is empty', () => {
    expect(filterTagsByPattern([jazz, pixies], '')).toEqual([jazz, pixies]);
  });

  it('returns a new array reference, not the original, when pattern is empty', () => {
    const input = [pixies, jazz];
    const result = filterTagsByPattern(input, '');
    expect(result).not.toBe(input);
  });

  it('matches case-insensitively', () => {
    expect(filterTagsByPattern([jazz, pixies], 'AZ')).toEqual([jazz]);
  });

  it('returns a new array reference on a matching pattern', () => {
    const input = [pixies, jazz];
    const result = filterTagsByPattern(input, 'URG');
    expect(result).not.toBe(input);
  });

  it('returns all tags on invalid regex', () => {
    expect(filterTagsByPattern([jazz, pixies], '[')).toEqual([jazz, pixies]);
  });

  it('returns a new array reference on invalid regex', () => {
    const input = [pixies, jazz];
    const result = filterTagsByPattern(input, '[');
    expect(result).not.toBe(input);
  });
});

describe('sortTagsByName', () => {
  it('sorts alphabetically without mutating the input', () => {
    const input = [pixies, jazz];
    const result = sortTagsByName(input);

    expect(result).toEqual([jazz, pixies]);
    expect(input).toEqual([pixies, jazz]);
  });

  it('returns a new array reference', () => {
    const input = [pixies, jazz];
    const result = filterTagsByPattern(input, '[');
    expect(result).not.toBe(input);
  });
});
