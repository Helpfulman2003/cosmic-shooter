# 🚀 Cosmic Shooter — Hướng Dẫn Deploy

Onchain arcade game trên Base blockchain.

> App frontend hiện đã cấu hình sẵn cho Base mainnet. Nếu bạn muốn deploy testnet để thử, vẫn còn lệnh `npm run deploy:testnet` và cấu hình Sepolia.

---

## 📁 Cấu Trúc Project

```
cosmic-shooter/
├── contracts/
│   └── CosmicLeaderboard.sol     # Smart contract Solidity
├── scripts/
│   └── deploy.ts                 # Hardhat deploy script
├── frontend/
│   ├── app/
│   │   ├── layout.tsx            # Root layout + Providers
│   │   ├── page.tsx              # Main page
│   │   └── globals.css
│   ├── components/
│   │   ├── CosmicGame.tsx        # Canvas game engine
│   │   ├── Leaderboard.tsx       # Onchain leaderboard UI
│   │   ├── SubmitScorePanel.tsx  # Score submission
│   │   ├── WalletButton.tsx      # Wallet connect
│   │   └── Providers.tsx         # wagmi + react-query
│   ├── hooks/
│   │   └── useLeaderboard.ts     # Contract interaction hooks
│   └── lib/
│       ├── contract.ts           # ABI + contract address
│       └── wagmi.ts              # wagmi config
├── hardhat.config.ts
├── package.json
└── .env.example
```

---

## 🔧 Bước 1: Cài Đặt Dependencies

```bash
# Clone / tạo project
git init cosmic-shooter && cd cosmic-shooter

# Cài smart contract tools
npm install

# Cài frontend
cd frontend && npm install && cd ..
```

---

## 🔑 Bước 2: Cấu Hình Environment

```bash
# Copy env template
cp .env.example .env

# Mở .env và điền:
# PRIVATE_KEY=<private key ví deployer của bạn>
# BASESCAN_API_KEY=<API key từ basescan.org> (optional, cho verify)
```

> ⚠️ **QUAN TRỌNG**: Đừng bao giờ commit file `.env` lên git!
> Thêm `.env` vào `.gitignore`

---

## 💰 Bước 3: Lấy ETH

Nếu bạn deploy lên Base mainnet, cần ETH mainnet thật trên Base.

Nếu bạn chỉ muốn thử nghiệm trước, có thể dùng Base Sepolia testnet.

1. Testnet faucet: https://docs.base.org/base-chain/network-information/network-faucets
2. Hoặc: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
3. Hoặc: https://faucet.quicknode.com/base/sepolia

Paste địa chỉ ví deployer → nhận ETH phù hợp với network bạn sẽ dùng.

---

## 📜 Bước 4: Compile và Deploy Smart Contract

```bash
# Compile contract
npm run compile

# Deploy lên Base Sepolia testnet
npm run deploy:testnet

# Hoặc deploy lên Base mainnet
npm run deploy:mainnet
```

Output sẽ trông như:
```
🚀 Deploying CosmicLeaderboard to Base Sepolia...
Deployer: 0xYourAddress
Balance: 0.05 ETH
✅ CosmicLeaderboard deployed to: 0xABCD...1234
🔍 View on Basescan: https://sepolia.basescan.org/address/0xABCD...1234

📝 Add this to your frontend .env.local:
NEXT_PUBLIC_CONTRACT_ADDRESS=0xABCD...1234
```

Nếu bạn deploy mainnet, output sẽ là:
```
🚀 Deploying CosmicLeaderboard to Base mainnet...
Deployer: 0xYourAddress
Balance: 0.05 ETH
✅ CosmicLeaderboard deployed to: 0xABCD...1234
🔍 View on Basescan: https://basescan.org/address/0xABCD...1234

📝 Add this to your frontend .env.local:
NEXT_PUBLIC_CONTRACT_ADDRESS=0xABCD...1234
```

**Copy địa chỉ contract đó!**

---

## ✅ Bước 5 (Optional): Verify Contract

```bash
# Verify trên Base Sepolia testnet
npx hardhat verify --network baseSepolia 0xYOUR_CONTRACT_ADDRESS

# Verify trên Base mainnet
npx hardhat verify --network base 0xYOUR_CONTRACT_ADDRESS
```

Sau khi verify, code contract sẽ public trên Basescan.

---

## 🎮 Bước 6: Cấu Hình Frontend

```bash
# Tạo file env cho frontend
cd frontend
cp ../.env.example .env.local

# Mở .env.local và điền:
NEXT_PUBLIC_CONTRACT_ADDRESS=0xABCD...1234  # địa chỉ từ bước 4
```

---

## 🖥 Bước 7: Chạy Frontend Local

```bash
cd frontend
npm run dev
# Mở http://localhost:3000
```

### Kết nối ví:
1. Mở MetaMask hoặc Coinbase Wallet
2. App đã cấu hình cho **Base mainnet**.
   - RPC: `https://mainnet.base.org`
   - Chain ID: `8453`
   - Symbol: `ETH`
   - Explorer: `https://basescan.org`

3. Nếu bạn cần test trước trên Sepolia, có thể thêm mạng **Base Sepolia** thay vì mainnet:
   - RPC: `https://sepolia.base.org`
   - Chain ID: `84532`
   - Symbol: `ETH`
   - Explorer: `https://sepolia.basescan.org`

4. Click "Connect Wallet" trong game
5. Chơi game → submit điểm → xem leaderboard onchain!

---

## 🌐 Bước 8: Deploy Frontend lên Vercel

### Option A — Vercel CLI:
```bash
cd frontend
npx vercel

# Vercel sẽ hỏi các cấu hình, chọn defaults
# Sau đó thêm env var trong Vercel dashboard:
# NEXT_PUBLIC_CONTRACT_ADDRESS = 0xYOUR_ADDRESS
```

### Option B — GitHub:
1. Push code lên GitHub
2. Vào vercel.com → Import repository → chọn thư mục `frontend`
3. Trong Settings → Environment Variables → thêm:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` = `0x...`
4. Deploy!

---

## 🔗 Bước 9: Submit vào Base Mini App Ecosystem

Để đăng ký game lên Base App directory:

1. Truy cập: https://docs.base.org/apps/quickstart/build-app
2. Đảm bảo frontend có meta tag Farcaster Frame (đã có trong layout.tsx)
3. Update `layout.tsx` với domain thực của bạn
4. Submit qua: https://base.org/ecosystem

---

## 🎮 Gameplay

| Tính năng | Mô tả |
|---|---|
| **Di chuyển** | Mouse / Touch |
| **Bắn** | Tự động (auto-fire) |
| **Quái vật** | Asteroid, Ship địch, Boss |
| **Điểm** | 50 (asteroid) / 150 (ship) / 500 (boss) |
| **Combo** | Tiêu diệt liên tiếp tăng bội số điểm (max 10x) |
| **Level** | Tăng mỗi 500 điểm, thêm đạn spread |
| **Submit** | Chỉ ghi khi cao hơn điểm cũ (anti-cheat) |

---

## 🔒 Smart Contract — Anti-Cheat

```solidity
// Rate limit: 30 giây giữa các lần submit
require(block.timestamp >= pd.lastSubmit + SUBMIT_COOLDOWN, "Wait 30s");

// Giới hạn điểm tối đa mỗi session
require(score <= MAX_SCORE_PER_SESSION, "Score too high");

// Chỉ lưu điểm cao nhất per wallet
if (score > pd.highScore) { pd.highScore = score; ... }
```

---

## 📊 Contract Functions

| Function | Mô tả |
|---|---|
| `submitScore(score, nickname)` | Submit điểm + nickname |
| `getTopPlayers()` | Lấy top 10 leaderboard |
| `getPlayerData(address)` | Điểm cao + lịch sử của 1 player |
| `getPlayerRank(address)` | Thứ hạng hiện tại |

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 + TypeScript
- **Web3**: wagmi v2 + viem  
- **Smart Contract**: Solidity 0.8.20 + Hardhat
- **Network**: Base Sepolia (testnet) → Base (mainnet)
- **Deploy**: Vercel

---

## 🔜 Mainnet Deploy

Khi sẵn sàng lên mainnet:

```bash
# Cần ETH thật trên Base mainnet
npm run deploy:mainnet

# Update .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0x_MAINNET_ADDRESS

# Redeploy Vercel
```

---

## 🐛 Troubleshooting

**"Insufficient funds"**: Lấy ETH testnet từ faucet hoặc dùng ETH mainnet nếu bạn deploy trên mainnet  
**"Wrong network"**: Click "Switch to Base mainnet" trong app (hoặc chọn Base Sepolia nếu bạn đang chơi testnet)  
**"Score too high"**: Max 99,999 per session  
**"Wait before submitting"**: Đợi 30 giây giữa các lần submit  
**Contract address undefined**: Kiểm tra `.env.local` có `NEXT_PUBLIC_` prefix  
