import type { Tag } from '../../../shared/internal/tag';

const filterTagsByPattern = (tags: Tag[], pattern: string): Tag[] => {
  if (!pattern) {
    return [...tags];
  }

  try {
    const regex = new RegExp(pattern, 'i');
    return tags.filter((tag) => regex.test(tag.name));
  } catch {
    return [...tags];
  }
};

const sortTagsByName = (tags: Tag[]): Tag[] => {
  return [...tags].sort((t1, t2) => t1.name.localeCompare(t2.name));
};

export { filterTagsByPattern, sortTagsByName };
