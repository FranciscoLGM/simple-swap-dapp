# 🦄 SimpleSwap DEX

**SimpleSwap** is a modern decentralized exchange (DEX) built with [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2), inspired by **Uniswap V2**. It enables users to:

- 🔄 Swap ERC-20 tokens (`TokenA` ↔ `TokenB`)
- 💧 Add or remove liquidity from the pool
- 📊 Explore real-time pool and token metrics
- ⚡ Enjoy a fast and intuitive Web3 experience

---

## 🚀 Features

- ✅ Swap with slippage control and real-time price preview
- ✅ Integrated token approvals (only when needed)
- ✅ Add & remove liquidity with approval + feedback
- ✅ Animated dashboard with pool stats and token balances
- ✅ Clean responsive UI with modals, tabs, transitions
- ✅ Interacts with deployed contracts on **Sepolia**

---

## 🛠️ Tech Stack

| Tool / Library             | Role                                   |
| -------------------------- | -------------------------------------- |
| **Scaffold-ETH 2**         | Smart contract + frontend framework    |
| **Next.js (App Router)**   | Frontend structure & routing           |
| **Hardhat + Viem**         | Contract development and interaction   |
| **Tailwind CSS + DaisyUI** | Design system + themes (Uniswap-style) |
| **RainbowKit + Wagmi**     | Wallet connection + blockchain hooks   |
| **React Hot Toast**        | Feedback toasts (success/errors)       |
| **Canvas Confetti**        | 🎉 Confetti on successful actions      |

---

## 📁 Project Structure

```

packages/
├── hardhat/            # Solidity contracts and deploy scripts
└── nextjs/             # Frontend (Next.js + Wagmi + Viem)
├── app/            # App Router pages (root DEX in `page.tsx`)
├── components/     # UI components (SwapBox, Dashboard, etc.)
├── hooks/          # Custom blockchain and UX hooks
├── utils/          # Formatting, parsing, math helpers
├── styles/         # Tailwind + DaisyUI themes (Uniswap-like)
└── public/tokens/  # Token SVG icons (e.g. TKA.svg, TKB.svg)

```

---

## ⚙️ Local Development

### 1. Clone the repository

```bash
git clone https://github.com/your-username/simpleswap-dex.git
cd simpleswap-dex
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Configure environment variables

Create a `.env` file inside `packages/nextjs/`:

```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

> Get these from:
>
> - [Alchemy Dashboard](https://dashboard.alchemy.com)
> - [WalletConnect Cloud](https://cloud.walletconnect.com)

### 4. Deploy contracts (to Sepolia)

```bash
cd packages/hardhat
yarn deploy --network sepolia
```

> After deploying, update contract addresses in your frontend config.

---

## ▶️ Run the Frontend

```bash
cd packages/nextjs
yarn dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Useful Scripts

```bash
# Run Hardhat contract tests
yarn test

# Lint frontend code
yarn lint

# Build frontend for production
yarn build
```

---

## ✨ UI Overview

Modern, Uniswap-inspired user interface:

- 🎛️ Responsive layout with tabbed navigation
- 🪄 Smooth transitions (`animate-in`, `fade-in`, etc.)
- 🧿 Token selector modal with custom icons
- ⚙️ Approvals only when needed (with visual feedback)
- 🎉 Toasts + confetti on success
- 🌙 Light/Dark themes via DaisyUI

---

## 🚀 Deploy to Vercel

SimpleSwap is Vercel-ready:

1. Go to [Vercel](https://vercel.com)
2. Import this repository
3. Set the project root to `packages/nextjs`
4. Add your `.env` variables in the Vercel dashboard
5. Click **Deploy** 🚀

---

## 👨‍💻 Author

Created with 💜 by **Francisco**

- 💡 Based on [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2)
- 🎨 Inspired by Uniswap’s clean and intuitive DEX UI

---

## 📄 License

**MIT License** – free to use, remix and build upon.

---
