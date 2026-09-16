type SelectionToolbarProps = {
  selectedCount: number;
  onExitSelectionMode: () => void;
};

function SelectionToolbar({
  selectedCount,
  onExitSelectionMode,
}: SelectionToolbarProps) {
  return (
    <>
      <div className="selection-toolbar">
        <span className="selection-toolbar__count">
          {selectedCount} album{selectedCount === 1 ? '' : 's'} selected
        </span>
        <button
          className="selection-toolbar--done"
          onClick={onExitSelectionMode}
        >
          Done
        </button>
      </div>
    </>
  );
}

export default SelectionToolbar;
