import { useContext } from 'react';

import AppContext from '../AppContext';
import noAlbumArt from '../images/no-album-art.svg';

const renderList = ({ list, coreUrl }) => (
  <div className="load-data-list">
    <h2 className="load-data-list__heading">{list.title}</h2>
    <div className="load-data-list__list">
      <div className="load-data-list__card">
        <div className="load-data-list__key_desc">Title</div>
        <div className="load-data-list__key">title</div>
        <div className="load-data-list__value">{list.title}</div>
        <div className="load-data-list__key_desc">Level</div>
        <div className="load-data-list__key">level</div>
        <div className="load-data-list__value">{list.level}</div>
        <div className="load-data-list__key_desc">Sub Title</div>
        <div className="load-data-list__key">subtitle</div>
        <div className="load-data-list__value">{list.subtitle}</div>
        <div className="load-data-list__key_desc">Count</div>
        <div className="load-data-list__key">count</div>
        <div className="load-data-list__value">{list.count}</div>
        <div className="load-data-list__key_desc">Display Offset</div>
        <div className="load-data-list__key">display_offset</div>
        <div className="load-data-list__value">{list.display_offset}</div>
        <div className="load-data-list__key_desc">Image Key</div>{' '}
        <div className="load-data-list__key">image_key</div>
        <div className="load-data-list__value">{list.image_key}</div>
      </div>
      <div>
        {list.image_key ? (
          <img
            src={`${coreUrl}/api/image/${list.image_key}?scale=fit&width=120&height=120`}
            alt={list.title}
            className="load-data-list__image"
          />
        ) : (
          <img
            src={noAlbumArt}
            alt={list.title}
            className="load-data-list__image"
          />
        )}
      </div>
    </div>
  </div>
);

const renderItem = ({ item, coreUrl, socketRef }) => (
  <div className="load-data-item" key={item.item_key}>
    <h3 className="load-data-item__heading">
      <a
        href={item.title}
        className="load-data-item__link"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          socketRef.current.emit('loadData', { itemKey: item.item_key });
        }}
      >
        {item.title}
      </a>
    </h3>
    <div className="load-data-item__list">
      <div className="load-data-item__card">
        <div className="load-data-item__key_desc">Title</div>
        <div className="load-data-item__key">title</div>
        <div className="load-data-item__key">{item.title}</div>
        <div className="load-data-item__key_desc">Sub Title</div>
        <div className="load-data-item__key">subtitle</div>
        <div className="load-data-item__key">{item.subtitle}</div>
        <div className="load-data-item__key_desc">Hint</div>
        <div className="load-data-item__key">hint</div>
        <div className="load-data-item__key">{item.hint}</div>
        <div className="load-data-item__key_desc">Item Key</div>
        <div className="load-data-item__key">item_key</div>
        <div className="load-data-item__key">{item.item_key}</div>
        <div className="load-data-item__key_desc">Image Key</div>
        <div className="load-data-item__key">image__key</div>
        <div className="load-data-item__key">{item.image_key}</div>
      </div>
      <div>
        {item.image_key ? (
          <img
            src={`${coreUrl}/api/image/${item.image_key}?scale=fit&width=120&height=120`}
            alt={item.title}
            className="load-data-item__image"
          />
        ) : (
          <img
            src={noAlbumArt}
            alt={item.title}
            className="load-data-item__image"
          />
        )}
      </div>
    </div>
  </div>
);

const renderItems = ({ items, coreUrl, socketRef }) => (
  <div className="load-data-items">
    <h2 className="load-data-items__heading">Items</h2>
    <div>{items.map((item) => renderItem({ item, coreUrl, socketRef }))}</div>
  </div>
);

function LoadData() {
  const { appState, coreUrlRef, socketRef } = useContext(AppContext);
  const coreUrl = coreUrlRef.current;

  if (appState.loadData.offset === undefined) {
    return null;
  }

  const { items, list } = appState.loadData;

  return (
    <>
      <h1>Load Data</h1>
      {renderList({ list, coreUrl })}
      {renderItems({ items, coreUrl, socketRef })}
    </>
  );
}

export default LoadData;
