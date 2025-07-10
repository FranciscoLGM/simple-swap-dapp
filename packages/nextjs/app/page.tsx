import { useState } from "react";
import { NextPage } from "next";
import { AddLiquidityWithApprovalForm } from "~~/components/AddLiquidityWithApprovalForm";
import { RemoveLiquidityWithApprovalForm } from "~~/components/RemoveLiquidityWithApprovalForm";
import { SwapDashboard } from "~~/components/SwapDashboard";
import { SwapWithApprovalBox } from "~~/components/SwapWithApprovalBox";

// Contract addresses deployed on Sepolia
const CONTRACT_ADDRESSES = {
  TOKEN_A: "0x929300C89594B53658bc9fFf580903Fc4315c948" as const,
  TOKEN_B: "0x11A87DAe8DB12721f5028569DA2FC2eb83b5feAd" as const,
  SIMPLE_SWAP: "0xEE6546b600C9392BF5c54515ae80a91444F98eB1" as const,
};

type ActiveTab = "swap" | "liquidity" | "dashboard";

/**
 * Main DEX page component with tabbed interface for:
 * - Token swapping
 * - Liquidity management (add/remove)
 * - Pool statistics dashboard
 *
 * @component
 * @returns {JSX.Element} The DEX interface
 *
 * @example
 * <DexPage />
 */
const DexPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("swap");

  const TABS = [
    { key: "swap", label: "Swap" },
    { key: "liquidity", label: "Liquidity" },
    { key: "dashboard", label: "Pool Info" },
  ] as const;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen px-4 py-10 bg-base-100">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">SimpleSwap DEX</h1>
        <p className="text-gray-500">Trade and provide liquidity in a decentralized way</p>
      </header>

      {/* Tab Navigation */}
      <nav className="w-full max-w-md mb-8">
        <div className="flex space-x-2 bg-base-100/20 p-1 rounded-full">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out ${
                activeTab === tab.key
                  ? "bg-primary text-primary-content shadow-sm"
                  : "text-gray-500 hover:text-base-content hover:bg-base-200"
              }`}
              onClick={() => setActiveTab(tab.key)}
              aria-current={activeTab === tab.key ? "page" : undefined}
              aria-label={`Show ${tab.label} tab`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="w-full max-w-xl space-y-8">
        {/* Swap Interface */}
        {activeTab === "swap" && (
          <section aria-labelledby="swap-section">
            <h2 id="swap-section" className="sr-only">
              Swap Tokens
            </h2>
            <SwapWithApprovalBox spender={CONTRACT_ADDRESSES.SIMPLE_SWAP} />
          </section>
        )}

        {/* Liquidity Management */}
        {activeTab === "liquidity" && (
          <section aria-labelledby="liquidity-section" className="space-y-6">
            <h2 id="liquidity-section" className="sr-only">
              Liquidity Management
            </h2>
            <AddLiquidityWithApprovalForm
              tokenA={CONTRACT_ADDRESSES.TOKEN_A}
              tokenB={CONTRACT_ADDRESSES.TOKEN_B}
              spender={CONTRACT_ADDRESSES.SIMPLE_SWAP}
            />
            <RemoveLiquidityWithApprovalForm
              tokenA={CONTRACT_ADDRESSES.TOKEN_A}
              tokenB={CONTRACT_ADDRESSES.TOKEN_B}
              lpTokenContract="SimpleSwap"
              spender={CONTRACT_ADDRESSES.SIMPLE_SWAP}
            />
          </section>
        )}

        {/* Pool Dashboard */}
        {activeTab === "dashboard" && (
          <section aria-labelledby="dashboard-section">
            <h2 id="dashboard-section" className="text-xl font-semibold mb-4 text-center">
              Pool Statistics
            </h2>
            <SwapDashboard
              tokenA={CONTRACT_ADDRESSES.TOKEN_A}
              tokenB={CONTRACT_ADDRESSES.TOKEN_B}
              lpTokenContract="SimpleSwap"
            />
          </section>
        )}
      </main>

      {/* Network Indicator */}
      <footer className="mt-12 text-sm text-gray-500">Connected to Sepolia Test Network</footer>
    </div>
  );
};

export default DexPage;
