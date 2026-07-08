import { useContext, useState } from 'react';

function Tags() {
  const [tagsPattern, setTagsPattern] = useState('');

  return (
    <>
      <h1 className="heading-display">Tags</h1>
      <div className="tags-heading">
        <div className="tags-heading__buttons">
          <button type="button" className="tags-heading__button">
            New Tag
          </button>
        </div>
        <div className="tags-heading__filter">
          <div className="filter">
            <input
              className="filter__input"
              type="text"
              value={tagsPattern}
              onChange={(e) => setTagsPattern(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Tags;
