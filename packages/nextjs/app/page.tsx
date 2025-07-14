"use client";

import { useState } from "react";
import { NextPage } from "next";
import { LiquidityTabs } from "~~/components/LiquidityTabs";
import { SwapDashboard } from "~~/components/SwapDashboard";
import { SwapWithApprovalBox } from "~~/components/SwapWithApprovalBox";

// 🧾 Direcciones desplegadas en Sepolia
const TOKEN_A = "0x08A82179B7074f6C2B53696E0e074B2959d9A99d";
const TOKEN_B = "0x79c6c419f670A12eACF0b3A7645C8A29C34Bde04";
const SIMPLE_SWAP = "0xeC4A93b510Ba20c1B41f9DfD90F0e1918a205eaF";

const DexPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState<"swap" | "liquidity" | "dashboard">("swap");

  const tabs = [
    { key: "swap", label: "Intercambio" },
    { key: "liquidity", label: "Liquidez" },
    { key: "dashboard", label: "Estado" },
  ];

  return (
    <main className="flex flex-col items-center justify-start min-h-screen px-4 py-10 bg-base-100">
      <h1 className="text-3xl font-bold mb-6 text-base-content">SimpleSwap</h1>

      {/* Navegación de tabs estilo Uniswap */}
      <div
        className="flex space-x-2 bg-base-100/20 p-1 rounded-full mb-8 shadow-sm"
        role="tablist"
        aria-label="Navegación de pestañas"
      >
        {tabs.map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`tab-${tab.key}`}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out ${
              activeTab === tab.key ? "bg-base-200 text-base-content" : "text-gray-500 hover:text-base-content"
            }`}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenedor central responsivo */}
      <section id={`tab-${activeTab}`} className="w-full max-w-md mx-auto">
        {activeTab === "swap" && <SwapWithApprovalBox spender={SIMPLE_SWAP} />}

        {activeTab === "liquidity" && (
          <div className="flex flex-col gap-6">
            <LiquidityTabs tokenA={TOKEN_A} tokenB={TOKEN_B} lpTokenContract="SimpleSwap" spender={SIMPLE_SWAP} />
          </div>
        )}

        {activeTab === "dashboard" && <SwapDashboard tokenA={TOKEN_A} tokenB={TOKEN_B} lpTokenContract="SimpleSwap" />}
      </section>
    </main>
  );
};

export default DexPage;
