import { RawRoonAlbum } from './rawRoonAlbum';

type RawRoonLoadAlbumsResponse = {
    items: RawRoonAlbum[];
    offset: number;
    list: {
        level: number;
        title: 'Albums';
        subtitle: null;
        imageKey: null;
        count: number,
        displayOffset: null
    };
}

export { RawRoonLoadAlbumsResponse }
