export const LEADERBOARD_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'score', type: 'uint256' },
      { internalType: 'string', name: 'nickname', type: 'string' },
    ],
    name: 'submitScore',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTopPlayers',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'player', type: 'address' },
          { internalType: 'uint256', name: 'score', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'string', name: 'nickname', type: 'string' },
        ],
        internalType: 'struct CosmicLeaderboard.PlayerScore[10]',
        name: '',
        type: 'tuple[10]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'getPlayerData',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'highScore', type: 'uint256' },
          { internalType: 'uint256', name: 'lastSubmit', type: 'uint256' },
          { internalType: 'uint256', name: 'totalGames', type: 'uint256' },
          { internalType: 'string', name: 'nickname', type: 'string' },
        ],
        internalType: 'struct CosmicLeaderboard.PlayerData',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'getPlayerRank',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalPlayers',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'score',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'nickname',
        type: 'string',
      },
    ],
    name: 'ScoreSubmitted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'score',
        type: 'uint256',
      },
    ],
    name: 'NewHighScore',
    type: 'event',
  },
] as const;

export const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const BASE_MAINNET = {
  id: 8453,
  name: 'Base mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
    public: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://basescan.org' },
  },
  testnet: false,
};
