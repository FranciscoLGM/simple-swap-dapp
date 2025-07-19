"use client";

import { FC, useState } from "react";
import { AddLiquidityWithApprovalForm } from "./AddLiquidityWithApprovalForm";
import { RemoveLiquidityWithApprovalForm } from "./RemoveLiquidityWithApprovalForm";
import { AnimatePresence, motion } from "framer-motion";
import { Address } from "viem";

interface Props {
  tokenA: Address;
  tokenB: Address;
  lpTokenContract: "SimpleSwap";
  spender: Address;
}

export const LiquidityTabs: FC<Props> = ({ tokenA, tokenB, lpTokenContract, spender }) => {
  const [activeTab, setActiveTab] = useState<"add" | "remove">("add");

  const tabs = [
    { key: "add", label: "Agregar" },
    { key: "remove", label: "Remover" },
  ] as const;

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Tabs */}
      <div role="tablist" className="tabs tabs-boxed justify-center">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            className={`tab transition-all duration-200 ${activeTab === key ? "tab-active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Animated tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "add" ? (
            <AddLiquidityWithApprovalForm tokenA={tokenA} tokenB={tokenB} spender={spender} />
          ) : (
            <RemoveLiquidityWithApprovalForm
              tokenA={tokenA}
              tokenB={tokenB}
              lpTokenContract={lpTokenContract}
              spender={spender}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
