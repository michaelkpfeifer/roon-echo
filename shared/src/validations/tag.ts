import { Result, ok, err } from 'neverthrow';

import type {
  TagField,
  TagValidationError,
} from '../../internal/tagValidationError.js';

type validatableTagFields = {
  name: string;
};

const validateTag = <T extends validatableTagFields>(
  tag: T,
): Result<T, TagValidationError[]> => {
  const errors: TagValidationError[] = [];

  if (tag.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  return errors.length === 0 ? ok(tag) : err(errors);
};

const tagValidationErrorsFor = (
  errors: TagValidationError[],
  field: TagField,
): string[] => {
  return errors.filter((e) => e.field === field).map((e) => e.message);
};

export type { TagField, TagValidationError };
export { validateTag, tagValidationErrorsFor };
