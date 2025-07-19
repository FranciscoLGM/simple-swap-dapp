"use client";

import { FC, useState } from "react";
import { motion } from "framer-motion";
import { Address, formatUnits } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useGlobalErrorToast } from "~~/hooks/simple-swap/useGlobalErrorToast";
import { formatDecimalInput } from "~~/utils/simple-swap/parseInput";

interface Props {
  tokenA: Address;
  tokenB: Address;
  lpTokenContract: "SimpleSwap";
}

export const SwapDashboard: FC<Props> = ({ tokenA, tokenB, lpTokenContract }) => {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<"pool" | "participation" | "balances">("pool");

  const { data: reserves, error: reservesError } = useScaffoldReadContract({
    contractName: lpTokenContract,
    functionName: "getReserves",
    args: [tokenA, tokenB],
    watch: true,
  });

  useGlobalErrorToast(reservesError);

  const { data: totalSupply, error: totalSupplyError } = useScaffoldReadContract({
    contractName: lpTokenContract,
    functionName: "totalSupply",
    watch: true,
  });

  useGlobalErrorToast(totalSupplyError);

  const { data: userLPBalance } = useScaffoldReadContract({
    contractName: lpTokenContract,
    functionName: "balanceOf",
    args: [address!],
    watch: true,
  });

  const { data: balanceA } = useScaffoldReadContract({
    contractName: "TokenA",
    functionName: "balanceOf",
    args: [address!],
    watch: true,
  });

  const { data: balanceB } = useScaffoldReadContract({
    contractName: "TokenB",
    functionName: "balanceOf",
    args: [address!],
    watch: true,
  });

  const PROTOCOL_LOCKED_LP = 1_000_000_000_000n;
  const circulatingSupply = totalSupply ? totalSupply - PROTOCOL_LOCKED_LP : 0n;

  const userSharePercent =
    typeof userLPBalance === "bigint" && circulatingSupply > 0n
      ? (Number(userLPBalance) / Number(circulatingSupply)) * 100
      : 0;

  const userShareA =
    reserves && typeof userLPBalance === "bigint" && circulatingSupply > 0n
      ? (reserves[0] * userLPBalance) / circulatingSupply
      : 0n;

  const userShareB =
    reserves && typeof userLPBalance === "bigint" && circulatingSupply > 0n
      ? (reserves[1] * userLPBalance) / circulatingSupply
      : 0n;

  const formatValue = (value: bigint | undefined, precision = 2) =>
    value ? formatDecimalInput(formatUnits(value, 18), precision) : "0.00";

  const tkaToTkbPrice =
    reserves && reserves[0] > 0n && reserves[1] > 0n
      ? formatDecimalInput((Number(reserves[1]) / Number(reserves[0])).toFixed(6))
      : "-";

  const tkbToTkaPrice =
    reserves && reserves[0] > 0n && reserves[1] > 0n
      ? formatDecimalInput((Number(reserves[0]) / Number(reserves[1])).toFixed(6))
      : "-";

  const balanceBinTKA =
    reserves && reserves[0] > 0n && reserves[1] > 0n && balanceB
      ? formatDecimalInput(((Number(balanceB) * Number(reserves[0])) / Number(reserves[1]) / 1e18).toFixed(4))
      : "-";

  const balanceAinTKB =
    reserves && reserves[0] > 0n && reserves[1] > 0n && balanceA
      ? formatDecimalInput(((Number(balanceA) * Number(reserves[1])) / Number(reserves[0]) / 1e18).toFixed(4))
      : "-";

  const tabStyle = "tab transition-all duration-200";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto space-y-4"
    >
      {/* Tabs */}
      <div role="tablist" className="tabs tabs-boxed justify-center">
        <button
          className={`${tabStyle} ${activeTab === "pool" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("pool")}
        >
          Pool
        </button>
        <button
          className={`${tabStyle} ${activeTab === "participation" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("participation")}
        >
          Participación
        </button>
        <button
          className={`${tabStyle} ${activeTab === "balances" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("balances")}
        >
          Tus Tokens
        </button>
      </div>

      {/* Tab content */}
      <div className="space-y-4 transition-opacity duration-300 animate-in fade-in slide-in-from-bottom-4">
        {activeTab === "pool" && (
          <div className="card bg-base-200 p-6 rounded-2xl shadow-xl space-y-3">
            <div className="bg-base-300 p-4 rounded-xl">
              <p className="text-sm text-gray-400 mb-1">Precios del pool</p>
              <p className="text-sm text-base-content font-semibold">1 TKA ≈ {tkaToTkbPrice} TKB</p>
              <p className="text-sm text-base-content font-semibold">1 TKB ≈ {tkbToTkaPrice} TKA</p>
            </div>
            <div className="bg-base-300 p-4 rounded-xl">
              <p className="text-sm text-gray-400">Reserva de TokenA (TKA)</p>
              <p className="text-lg font-bold">{formatValue(reserves?.[0])}</p>
            </div>
            <div className="bg-base-300 p-4 rounded-xl">
              <p className="text-sm text-gray-400">Reserva de TokenB (TKB)</p>
              <p className="text-lg font-bold">{formatValue(reserves?.[1])}</p>
            </div>
            <div className="bg-base-300 p-4 rounded-xl">
              <p className="text-sm text-gray-400">Tokens LP en circulación (SS-LP)</p>
              <p className="text-lg font-bold">{formatValue(circulatingSupply)}</p>
              <p className="text-xs text-gray-500 mt-1">
                🔒 {formatValue(PROTOCOL_LOCKED_LP, 6)} no retirables (reserva técnica)
              </p>
            </div>
          </div>
        )}

        {activeTab === "participation" && (
          <div className="card bg-base-200 p-6 rounded-2xl shadow-xl space-y-3 group relative">
            <p className="text-sm text-gray-400 mb-1">Tu participación en el pool</p>
            <p className="text-lg font-bold mb-2">{userSharePercent.toFixed(4)}%</p>
            <div className="w-full bg-base-300 h-3 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${Math.min(userSharePercent, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Equivale a <span className="font-semibold text-base-content">{formatValue(userShareA, 4)} TKA</span> y{" "}
              <span className="font-semibold text-base-content">{formatValue(userShareB, 4)} TKB</span>
            </div>
          </div>
        )}

        {activeTab === "balances" && (
          <div className="card bg-base-200 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">TokenA (TKA)</p>
                <p className="text-lg font-bold">{formatValue(balanceA)}</p>
              </div>
              <div className="text-right text-sm text-gray-500">≈ {balanceAinTKB} TKB</div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">TokenB (TKB)</p>
                <p className="text-lg font-bold">{formatValue(balanceB)}</p>
              </div>
              <div className="text-right text-sm text-gray-500">≈ {balanceBinTKA} TKA</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
