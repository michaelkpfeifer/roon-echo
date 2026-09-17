type SelectionToolbarProps = {
  selectedCount: number;
  onExitSelectionMode: () => void;
};

function SelectionToolbar({
  selectedCount,
  onExitSelectionMode,
}: SelectionToolbarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <>
      <div className="selection-toolbar">
        <span className="selection-toolbar__count">
          {selectedCount} album{selectedCount === 1 ? '' : 's'} selected
        </span>

        <div className="selection-toolbar--split-button">
          <button
            className="selection-toolbar--play-now"
            disabled={!hasSelection}
          >
            Play Now
          </button>
        </div>

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
