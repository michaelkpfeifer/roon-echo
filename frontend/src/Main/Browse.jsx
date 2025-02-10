import { useContext, useEffect } from 'react';

import AppContext from '../AppContext';
import noAlbumArt from '../images/no-album-art.svg';

const renderList = ({ list, coreUrl }) => (
  <div className="browse-list">
    <h2 className="browse-list__heading">{list.title}</h2>
    <div className="browse-list__list">
      <div className="browse-list__card">
        <div className="browse-list__key_desc">Title</div>
        <div className="browse-list__key">title</div>
        <div className="browse-list__value">{list.title}</div>
        <div className="browse-list__key_desc">Level</div>
        <div className="browse-list__key">level</div>
        <div className="browse-list__value">{list.level}</div>
        <div className="browse-list__key_desc">Sub Title</div>
        <div className="browse-list__key">subtitle</div>
        <div className="browse-list__value">{list.subtitle}</div>
        <div className="browse-list__key_desc">Count</div>
        <div className="browse-list__key">count</div>
        <div className="browse-list__value">{list.count}</div>
        <div className="browse-list__key_desc">Display Offset</div>
        <div className="browse-list__key">display_offset</div>
        <div className="browse-list__value">{list.display_offset}</div>
        <div className="browse-list__key_desc">Image Key</div>{' '}
        <div className="browse-list__key">image_key</div>
        <div className="browse-list__value">{list.image_key}</div>
      </div>
      <div>
        {list.image_key ? (
          <img
            src={`${coreUrl}/api/image/${list.image_key}?scale=fit&width=120&height=120`}
            alt={list.title}
            className="browse-list__image"
          />
        ) : (
          <img
            src={noAlbumArt}
            alt={list.title}
            className="browse-list__image"
          />
        )}
      </div>
    </div>
  </div>
);

const renderItem = ({ item, coreUrl, socketRef }) => (
  <div className="browse-item" key={item.item_key}>
    <h3 className="browse-item__heading">
      <a
        href={item.title}
        className="browse-item__link"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          socketRef.current.emit('browse', { itemKey: item.item_key });
        }}
      >
        {item.title}
      </a>
    </h3>
    <div className="browse-item__list">
      <div className="browse-item__card">
        <div className="browse-item__key_desc">Title</div>
        <div className="browse-item__key">title</div>
        <div className="browse-item__key">{item.title}</div>
        <div className="browse-item__key_desc">Sub Title</div>
        <div className="browse-item__key">subtitle</div>
        <div className="browse-item__key">{item.subtitle}</div>
        <div className="browse-item__key_desc">Hint</div>
        <div className="browse-item__key">hint</div>
        <div className="browse-item__key">{item.hint}</div>
        <div className="browse-item__key_desc">Item Key</div>
        <div className="browse-item__key">item_key</div>
        <div className="browse-item__key">{item.item_key}</div>
        <div className="browse-item__key_desc">Image Key</div>
        <div className="browse-item__key">image__key</div>
        <div className="browse-item__key">{item.image_key}</div>
      </div>
      <div>
        {item.image_key ? (
          <img
            src={`${coreUrl}/api/image/${item.image_key}?scale=fit&width=120&height=120`}
            alt={item.title}
            className="browse-item__image"
          />
        ) : (
          <img
            src={noAlbumArt}
            alt={item.title}
            className="browse-item__image"
          />
        )}
      </div>
    </div>
  </div>
);

const renderItems = ({ items, coreUrl, socketRef }) => (
  <div className="browse-items">
    <h2 className="browse-items__heading">Items</h2>
    <div>{items.map((item) => renderItem({ item, coreUrl, socketRef }))}</div>
  </div>
);

function Browse() {
  const { appState, coreUrlRef, socketRef } = useContext(AppContext);
  const coreUrl = coreUrlRef.current;

  useEffect(() => {
    socketRef.current.emit('browse');
  }, [socketRef]);

  if (appState.browseData.offset === undefined) {
    return null;
  }

  const { items, list } = appState.browseData;

  return (
    <>
      <h1>Browse</h1>
      {renderList({ list, coreUrl })}
      {renderItems({ items, coreUrl, socketRef })}
    </>
  );
}

export default Browse;
