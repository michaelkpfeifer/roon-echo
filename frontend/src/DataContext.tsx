import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { DataContextType } from './internal/dataContextType';
import { socket } from './socket';
import { mergeAlbumAggregate } from './utils';
import type { AlbumAggregate } from '../../shared/internal/albumAggregate';
import type { SocketResult } from '../../shared/internal/socketResult';
import type { Tag } from '../../shared/internal/tag';
import type { TagError } from '../../shared/internal/tagError.js';

const DataContext = createContext<DataContextType | null>(null);

function useData() {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData must be used inside DataProvider');
  return value;
}

function DataProvider({ children }: { children: ReactNode }) {
  const [albumAggregates, setAlbumAggregates] = useState<AlbumAggregate[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const handleAlbumAggregatesMessage = (
      albumAggregates: AlbumAggregate[],
    ) => {
      setAlbumAggregates(albumAggregates);
    };

    const handleAlbumAggregateUpdateMessage = (
      albumAggregate: AlbumAggregate,
    ) => {
      setAlbumAggregates((currentAlbumAggregates) =>
        mergeAlbumAggregate(currentAlbumAggregates, albumAggregate),
      );
    };

    socket.on('albumAggregates', handleAlbumAggregatesMessage);
    socket.on('albumAggregateUpdate', handleAlbumAggregateUpdateMessage);

    socket.emit('tags:list', (response: SocketResult<Tag[], TagError>) => {
      if (response.ok) {
        setTags(response.value);
      } else {
        /* eslint-disable no-console */
        console.error('Failed to load tags:', response.error);
        /* eslint-enable no-console */
      }
    });

    return () => {
      socket.off('albumAggregates', handleAlbumAggregatesMessage);
      socket.off('albumAggregateUpdate', handleAlbumAggregateUpdateMessage);
    };
  }, []);

  const value = useMemo(
    () => ({ albumAggregates, tags, setTags }),
    [albumAggregates, tags],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export { DataContext, DataProvider, useData };
