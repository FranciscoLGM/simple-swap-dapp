# 🦄 SimpleSwap DEX

**SimpleSwap** is a sleek and modern decentralized exchange (DEX) built with [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2), inspired by **Uniswap V2**.

Users can:

- 🔄 Swap between two ERC-20 tokens (`TokenA` ↔ `TokenB`)
- 💧 Add and remove liquidity with slippage control
- 📊 View real-time stats and balances
- ⚡ Interact with live contracts deployed on **Sepolia**

📍 **Live Demo**: [https://simpleswap-dex.vercel.app](https://simpleswap-dex.vercel.app)

---

## 🚀 Features

- ✅ **Token Swap** with slippage and dynamic price preview
- ✅ **Add/Remove Liquidity** with min amounts and approval checks
- ✅ **Integrated Approvals** only when needed
- ✅ **MAX Buttons** with contextual availability
- ✅ **Confetti + Toasts** on success, visual feedback for all actions
- ✅ **Modern UI** with dark/light themes, smooth animations, tooltips, modals
- ✅ **Wallet Integration** via RainbowKit + Wagmi
- ✅ **Responsive Design** for mobile and desktop
- ✅ **Optimized UX** with debounce, validation, error toasts, and more

---

## 🛠️ Tech Stack

| Tool / Library             | Purpose                              |
| -------------------------- | ------------------------------------ |
| **Scaffold-ETH 2**         | Full-stack dApp framework            |
| **Hardhat + Viem**         | Smart contract development and calls |
| **Next.js (App Router)**   | Frontend structure and routing       |
| **Wagmi + RainbowKit**     | Web3 wallet integration              |
| **Tailwind CSS + DaisyUI** | Styling system + light/dark themes   |
| **Framer Motion**          | UI animations                        |
| **React Hot Toast**        | Feedback system for actions          |
| **Canvas Confetti**        | 🎉 Effects on success                |

---

## 📁 Project Structure

```

packages/
├── hardhat/ # Solidity contracts and deployments
│ ├── contracts/ # SimpleSwap + Tokens
│ └── deploy/ # Deploy scripts
└── nextjs/ # Frontend dApp
├── app/ # App Router (root: `page.tsx`)
├── components/ # UI components (Swap, Add/Remove, etc.)
├── hooks/ # Custom hooks (read/write + UX logic)
├── utils/ # Input parsers, math helpers, error formatters
├── styles/ # Tailwind/DaisyUI themes and animations
└── public/tokens/ # Token icons (e.g. TKA.svg, TKB.svg)

```

---

## ⚙️ Getting Started (Local Dev)

### 1. Clone the repository

```bash
git clone https://github.com/FranciscoLGM/simple-swap-dapp.git
cd simpleswap-dex
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Configure environment variables

Create `.env` inside `packages/nextjs/`:

```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

> 🔑 Get your keys from:
>
> - [Alchemy](https://dashboard.alchemy.com)
> - [WalletConnect](https://cloud.walletconnect.com)

### 4. Deploy contracts to Sepolia

```bash
cd packages/hardhat
yarn deploy --network sepolia
```

> 🔄 Update frontend contract addresses after deployment.

---

## ▶️ Run the Frontend

```bash
cd packages/nextjs
yarn dev
```

Open in browser: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Available Scripts

```bash
# Run all Hardhat tests
yarn test

# Lint frontend code
yarn lint

# Build frontend for production
yarn build
```

---

## ✨ UI/UX Highlights

- 🧿 **Token Selector** Modal with SVG icons and animation
- 💬 **Tooltips** and dynamic error messages
- 🔐 **Approvals** only when needed (with toast + loading)
- 📉 **Live pool stats** and token prices
- 🔄 **Swap preview** updates dynamically (including slippage)
- 🧠 **Debounced inputs** and validation feedback
- 🎉 **Confetti + Toasts** after successful actions
- 🌓 **Light/Dark Mode** via DaisyUI theme toggling
- 📱 **Mobile-optimized layout**

---

## 📦 Deployment (Vercel)

This dApp is **production-ready** and deployed at:

🌐 [https://simpleswap-dex.vercel.app](https://simpleswap-dex.vercel.app)

To deploy your own version:

1. Go to [https://vercel.com](https://vercel.com)
2. Click **Import Project** and select your Git repo
3. Set `packages/nextjs` as the root directory
4. Add the `.env` variables in **Vercel dashboard**
5. Click **Deploy**

---

## 🙋‍♂️ Author

Built with 💜 by **Francisco López G**

- Based on [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2)
- Inspired by **Uniswap V2** – reimagined for simplicity and clarity

---

## 📄 License

Licensed under the **MIT License** – open for personal and commercial use.

---
