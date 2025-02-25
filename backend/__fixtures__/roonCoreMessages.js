const zonesChangedMessage1 = [
  {
    zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
    displayName: 'WiiM',
    outputs: [
      {
        outputId: '1701f4f798ff1773c83b77e489eaff98f7f4',
        zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
        canGroupWithOutputIds: [
          '170158f78109afd4b2d01d3b44e0d50be5bb',
          '1701f786e879b107e5e4d9555a47bc6e83a1',
          '1701fa3b3ee4f063ed8d5549632fd4e18fcf',
          '1701f4f798ff1773c83b77e489eaff98f7f4',
        ],
        displayName: 'WiiM',
        volume: {
          type: 'number',
          min: 0,
          max: 100,
          value: 50,
          step: 1,
          isMuted: false,
          hardLimitMin: 0,
          hardLimitMax: 100,
          softLimit: 100,
        },
        sourceControls: [
          {
            controlKey: '1',
            displayName: 'Linkplay Technology Inc. WiiM Ultra',
            supportsStandby: true,
            status: 'selected',
          },
        ],
      },
    ],
    state: 'playing',
    isNextAllowed: true,
    isPreviousAllowed: true,
    isPauseAllowed: true,
    isPlayAllowed: false,
    isSeekAllowed: true,
    queueItemsRemaining: 5,
    queueTimeRemaining: 1163,
    settings: {
      loop: 'disabled',
      shuffle: false,
      autoRadio: false,
    },
    nowPlaying: {
      seekPosition: 0,
      length: 183,
      oneLine: {
        line1: 'Kids Turned Out Fine - A$AP Rocky',
      },
      twoLine: {
        line1: 'Kids Turned Out Fine',
        line2: 'A$AP Rocky',
      },
      threeLine: {
        line1: 'Kids Turned Out Fine',
        line2: 'A$AP Rocky',
        line3: 'TESTING',
      },
      imageKey: 'f93c5969266095c09d5ee15283f2183a',
      artistImageKeys: ['b996746b45ade86f6c6d5ce7094b49ba'],
    },
  },
];

const zonesChangedMessage2 = [
  {
    zoneId: '1601fa3b3ee4f063ed8d5549632fd4e18fcf',
    displayName: 'mp2000',
    outputs: [
      {
        outputId: '1701fa3b3ee4f063ed8d5549632fd4e18fcf',
        zoneId: '1601fa3b3ee4f063ed8d5549632fd4e18fcf',
        canGroupWithOutputIds: [
          '170158f78109afd4b2d01d3b44e0d50be5bb',
          '1701f786e879b107e5e4d9555a47bc6e83a1',
          '1701fa3b3ee4f063ed8d5549632fd4e18fcf',
          '1701f4f798ff1773c83b77e489eaff98f7f4',
        ],
        displayName: 'mp2000',
        volume: {
          type: 'number',
          min: 0,
          max: 85,
          value: 20,
          step: 1,
          isMuted: true,
          hardLimitMin: 0,
          hardLimitMax: 60,
          softLimit: 48,
        },
        sourceControls: [
          {
            controlKey: '1',
            displayName: 'T+A MP 2000 R',
            supportsStandby: true,
            status: 'selected',
          },
        ],
      },
    ],
    state: 'stopped',
    isNextAllowed: false,
    isPreviousAllowed: true,
    isPauseAllowed: false,
    isPlayAllowed: false,
    isSeekAllowed: false,
    queueItemsRemaining: 0,
    queueTimeRemaining: 0,
    settings: {
      loop: 'disabled',
      shuffle: false,
      autoRadio: false,
    },
  },
];

const zonesSeekChangedMessage1 = [
  {
    zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
    queueTimeRemaining: 1875,
    seekPosition: 16,
  },
];

const zonesSeekChangedMessage2 = [
  {
    zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
    queueTimeRemaining: 1875,
    seekPosition: 16,
  },
  {
    zoneId: '1601f4f798ff1773c83b77e489eaff954634',
    queueTimeRemaining: 1220,
    seekPosition: 299,
  },
];

export {
  zonesChangedMessage1,
  zonesChangedMessage2,
  zonesSeekChangedMessage1,
  zonesSeekChangedMessage2,
};
