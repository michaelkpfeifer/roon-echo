import { Result, ok, err } from 'neverthrow';

type validatableTagFields = {
  name: string;
};

const validateTag = <T extends validatableTagFields>(
  tag: T,
): Result<T, string[]> => {
  const errors: string[] = [];

  if (tag.name.trim().length === 0) {
    errors.push('Name is required');
  }

  return errors.length === 0 ? ok(tag) : err(errors);
};

export { validateTag };
