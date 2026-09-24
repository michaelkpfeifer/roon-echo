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
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

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
              setMoreMenuOpen(false);
            }}
          >
            ▾
          </button>

          {playMenuOpen && (
            <div className="selection-toolbar--menu">
              <button onClick={() => setPlayMenuOpen(false)}>Play Now</button>
              <button onClick={() => setPlayMenuOpen(false)}>Add Next</button>
              <button onClick={() => setPlayMenuOpen(false)}>Queue</button>
            </div>
          )}
        </div>

        <div className="selection-toolbar--more">
          <button
            className="selection-toolbar--more-button"
            disabled={!hasSelection}
            aria-label="More actions"
            onClick={() => {
              setMoreMenuOpen((open) => !open);
              setPlayMenuOpen(false);
            }}
          >
            ...
          </button>

          {moreMenuOpen && (
            <div className="selection-toolbar--menu">
              <button onClick={() => setMoreMenuOpen(false)}>Add to Tag</button>
              <button onClick={() => setMoreMenuOpen(false)}>
                Add to Playlist{' '}
              </button>
              <button onClick={() => setMoreMenuOpen(false)}>Like</button>
            </div>
          )}

          <button
            className="selection-toolbar--done"
            onClick={onExitSelectionMode}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}

export default SelectionToolbar;
