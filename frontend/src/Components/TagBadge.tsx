type TagBadgeProps = {
  name: string;
  color: string;
  backgroundColor: string;
};

function TagBadge({ name, color, backgroundColor }: TagBadgeProps) {
  return (
    <div className="tag-badge" style={{ color, backgroundColor }}>
      {name}
    </div>
  );
}

export default TagBadge;
