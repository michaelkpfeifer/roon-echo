import {
  zonesChangedMessages1,
  zonesSeekChangedMessages1,
  zonesSeekChangedMessages2,
} from '../__fixtures__/roonCoreMessages.js';
import {
  frontendZonesChangedMessage,
  frontendZonesSeekChangedMessage,
} from '../src/messages.js';

describe('frontendZonesChangedMessage', () => {
  test('extracts nowPlaying data and adds zoneId key', () => {
    const frontendMessage = frontendZonesChangedMessage(zonesChangedMessages1);

    expect(frontendMessage).toEqual({
      zones: {
        '1601f4f798ff1773c83b77e489eaff98f7f4': {
          displayName: 'WiiM',
          nowPlaying: {
            artistImageKeys: ['b996746b45ade86f6c6d5ce7094b49ba'],
            imageKey: 'f93c5969266095c09d5ee15283f2183a',
            length: 183,
            oneLine: {
              line1: 'Kids Turned Out Fine - A$AP Rocky',
            },
            seekPosition: 0,
            threeLine: {
              line1: 'Kids Turned Out Fine',
              line2: 'A$AP Rocky',
              line3: 'TESTING',
            },
            twoLine: {
              line1: 'Kids Turned Out Fine',
              line2: 'A$AP Rocky',
            },
          },
          queueTimeRemaining: 1163,
          state: 'playing',
          zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
        },
      },
    });
  });
});

describe('frontendZonesSeekChangedMessage', () => {
  test('extracts single queueTimeRemaining and seekPosition and adds zoneId key', () => {
    const frontendMessage = frontendZonesSeekChangedMessage(
      zonesSeekChangedMessages1,
    );

    expect(frontendMessage).toEqual({
      '1601f4f798ff1773c83b77e489eaff98f7f4': {
        queueTimeRemaining: 1875,
        seekPosition: 16,
        zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
      },
    });
  });

  test('extracts multiple queueTimeRemaining and seekPosition and adds zoneId key', () => {
    const frontendMessage = frontendZonesSeekChangedMessage(
      zonesSeekChangedMessages2,
    );

    expect(frontendMessage).toEqual({
      '1601f4f798ff1773c83b77e489eaff98f7f4': {
        seekPosition: 16,
        queueTimeRemaining: 1875,
        zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
      },
      '1601f4f798ff1773c83b77e489eaff954634': {
        seekPosition: 299,
        queueTimeRemaining: 1220,
        zoneId: '1601f4f798ff1773c83b77e489eaff954634',
      },
    });
  });
});
