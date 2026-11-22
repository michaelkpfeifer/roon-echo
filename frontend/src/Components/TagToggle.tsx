import type { Tag } from '../../../shared/internal/tag';

type TagToggleProps = {
  tag: Tag;
  operation: 'add' | 'remove';
};

function TagToggle({ tag, operation }: TagToggleProps) {
  const badgeText = operation === 'add' ? `${tag.name} +` : `${tag.name} -`;

  return (
    <div
      className="tag-badge"
      style={{ color: tag.color, backgroundColor: tag.backgroundColor }}
    >
      {badgeText}
    </div>
  );
}

export default TagToggle;
