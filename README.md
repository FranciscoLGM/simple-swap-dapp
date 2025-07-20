# 🦄 SimpleSwap - Full-Stack Decentralized Exchange

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  
[![Solidity 0.8.0](https://img.shields.io/badge/Solidity-0.8.0-blue)](https://soliditylang.org)  
[![Next.js 14](https://img.shields.io/badge/Next.js-14.0+-black)](https://nextjs.org/)  
[![Live Demo](https://img.shields.io/badge/Live_Demo-Available-green)](https://simpleswap-dex.vercel.app)

**SimpleSwap** is a complete decentralized exchange featuring:  
- 🏗️ **Backend**: Production-grade AMM protocol (Uniswap V2 style)  
- 🎨 **Frontend**: Modern interface with full swap/liquidity functionality  

🌐 **Live Demo**: [https://simpleswap-dex.vercel.app](https://simpleswap-dex.vercel.app)

---

## ✨ Key Features

### Core Protocol
- 🔄 Token swaps using constant product formula (`x * y = k`)
- 💧 Add/remove liquidity with proportional LP tokens
- ⏱️ Deadline enforcement and slippage protection
- 🛡️ Emergency controls (pause/unpause)
- 📊 Real-time price oracle

### Frontend
- 📱 Fully responsive interface
- 🌓 Light/dark mode toggle
- 🎯 Real-time input validation
- 🎉 Visual feedback (toasts, confetti animations)
- ⚡ Optimized approval flow

---

## 🛠 Tech Stack

| Layer          | Technologies                                                                 |
|----------------|-----------------------------------------------------------------------------|
| **Blockchain** | Solidity 0.8, Hardhat, OpenZeppelin Contracts                              |
| **Frontend**   | Next.js 14 (App Router), Tailwind CSS, DaisyUI                             |
| **Web3**       | Wagmi, RainbowKit, viem                                                   |
| **Infra**      | Vercel (frontend), Alchemy/Infura (node providers)                        |

---

## 🏗 Project Structure

```
simple-swap-dapp/
├── packages/
│   ├── hardhat/          # Smart contracts
│   │   ├── contracts/    # Core AMM + ERC20 tokens
│   │   └── deploy/       # Deployment scripts
│   └── nextjs/           # DEX interface
│       ├── app/          # Next.js routing
│       ├── components/   # UI components
│       └── hooks/        # Custom Web3 logic
├── scripts/              # Utility scripts
└── README.md             # Documentation
```

---

## 🚀 Quick Start

### 📥 Installation
```bash
git clone https://github.com/FranciscoLGM/simple-swap-dapp.git
cd simple-swap-dapp
yarn install
```

### 🔨 Local Development
```bash
# Start local blockchain
yarn chain

# Deploy contracts
yarn deploy

# Launch frontend
yarn start
```

### 🌐 Testnet Deployment
```bash
cd packages/hardhat
yarn deploy --network sepolia
```

---

## 📦 Core Components

### Smart Contracts
- `SimpleSwap.sol`: Core AMM logic  
- `TokenA/TokenB.sol`: Test ERC20 tokens  
- `SimpleSwapLP.sol`: Liquidity provider token  

### Frontend Modules
- **Swap Interface**: Token exchange  
- **Liquidity Manager**: Pool management  
- **Wallet Integration**: RainbowKit connector  

---

## 🎨 UI Highlights
- Animated token selector modal  
- Direction toggle (↔) for swaps  
- Approval optimization (skip redundant signatures)  
- Interactive feedback (toasts, success animations)  
- Mobile-optimized layout  

---

## 📜 License
MIT License - See [LICENSE](LICENSE) for details.

---

## ✍️ Author
**Francisco López G.**  
[GitHub](https://github.com/FranciscoLGM) 

---
