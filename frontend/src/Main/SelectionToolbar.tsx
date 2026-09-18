import { useState } from 'react';

type SelectionToolbarProps = {
  selectedCount: number;
  onExitSelectionMode: () => void;
};

function SelectionToolbar({
  selectedCount,
  onExitSelectionMode,
}: SelectionToolbarProps) {
  const [playMenuOpen, setPlayMenuOpen] = useState(false);

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

          <button
            className="selection-toolbar--play-caret"
            disabled={!hasSelection}
            aria-label="More play options"
            onClick={() => {
              setPlayMenuOpen((open) => !open);
            }}
          >
            ▾
          </button>

          {playMenuOpen && (
            <div className="selection-toolbar--play-options">
              <button onClick={() => setPlayMenuOpen(false)}>Play Now</button>
              <button onClick={() => setPlayMenuOpen(false)}>Add Next</button>
              <button onClick={() => setPlayMenuOpen(false)}>Queue</button>
            </div>
          )}
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
