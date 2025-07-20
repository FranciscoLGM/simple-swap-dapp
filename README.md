# 🦄 SimpleSwap – Decentralized Exchange (DEX) 

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)  
[![Live App](https://img.shields.io/badge/Live%20App-Vercel-%23007ACC)](https://simpleswap-dex.vercel.app/)

**SimpleSwap** is a fully functional decentralized exchange (DEX) inspired by Uniswap V2.  
This monorepo contains both the **Solidity smart contracts** and the **modern frontend interface** built with Scaffold-ETH 2 and Next.js.

---

## 🔍 Features

### ✅ Core Functionality

- Add liquidity to a token pair pool
- Remove liquidity and receive underlying tokens
- Swap between two tokens with Uniswap V2-style pricing (constant product formula)
- Slippage tolerance calculation (`minAmount`)
- Token approval (with `approve()` logic and support for `ERC20Permit`-ready tokens)
- Clean, mobile-responsive UI with light/dark mode
- User feedback: spinners, toasts, confetti, validation

### ⚙️ Tech Stack

| Layer        | Tech                       |
| ------------ | -------------------------- |
| Blockchain   | Solidity, Hardhat, viem    |
| Frontend     | Next.js, Tailwind, DaisyUI |
| Fullstack    | Scaffold-ETH 2             |
| Animations   | tailwindcss-animate        |
| Smart Wallet | viem + wagmi               |
| Deployment   | Vercel (frontend)          |

---

## 🧱 Monorepo Structure

```

.
├── packages/
    └── hardhat/             # Solidity contracts (SimpleSwap, LP token, ERC20 tokens)
├── packages/
│   └── nextjs/              # Frontend app (Scaffold-ETH 2 + Next.js)
├── scripts/                 # Hardhat deployment scripts
├── deployments/             # Chain-specific contract deployment records
├── hardhat.config.ts        # Hardhat config
└── README.md                # This file

```

---

## 🚀 Deployment

### 🌐 Live App

SimpleSwap is live and deployed on Vercel:  
🔗 [https://simpleswap-dex.vercel.app](https://simpleswap-dex.vercel.app)

### 📦 Contracts

Contracts can be deployed locally or to a testnet using:

```bash
yarn deploy
```

---

## 🧪 Local Development

### 📥 Installation

```bash
git clone https://github.com/FranciscoLGM/simple-swap-dapp.git
cd simple-swap-dapp
yarn install
```

### 📡 Run Local Environment

```bash
yarn chain         # Starts local blockchain (anvil)
yarn deploy        # Deploy contracts to local chain
yarn start         # Starts frontend at http://localhost:3000
```

---

## 🔐 Main Contracts

| Contract           | Description                               |
| ------------------ | ----------------------------------------- |
| `SimpleSwap`       | Core DEX contract (Uniswap V2 style pool) |
| `TokenA`, `TokenB` | ERC20 mock tokens for testing or demo     |
| `SimpleSwap LP`    | Liquidity provider token                  |

---

## 🌈 UI Highlights

- Token selection modal (Uniswap-style)
- Swap direction switch (`tokenIn` ↔ `tokenOut`)
- Slippage auto-calculation for `minOut`/`minAmount`
- `approve()` optimization to avoid redundant signatures
- Realtime error validation and visual feedback
- Prevents selecting the same token in both fields
- Clean, responsive design with soft animations

---

## 🧠 Design Inspiration

SimpleSwap is inspired by [Uniswap V2](https://docs.uniswap.org/protocol/V2),
built as a minimal yet educational clone using modern frontend tooling and clean smart contract architecture.
Based on [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2), it enables rapid fullstack dApp prototyping.

---

## 📄 License

Licensed under the MIT License.
See [`LICENSE`](./LICENSE) for full details.

---

## ✨ Author

Developed by **Francisco López G.**

---

## 💬 Contributions

Contributions, suggestions, and PRs are welcome!
If you find a bug or want to improve the app, feel free to open an issue.

---
