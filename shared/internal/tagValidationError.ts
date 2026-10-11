type TagField = 'name';

type TagValidationError = {
  field: TagField;
  message: string;
};

export type { TagField, TagValidationError };
