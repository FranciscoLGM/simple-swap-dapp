"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Address, formatUnits, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useGlobalErrorToast } from "~~/hooks/simple-swap/useGlobalErrorToast";
import { formatDecimalInput } from "~~/utils/simple-swap/parseInput";
import { parseViemErrorToMessage } from "~~/utils/simple-swap/parseViemErrorToMessage";

interface Props {
  tokenA: Address;
  tokenB: Address;
  lpTokenContract: "SimpleSwap";
  spender: string;
}

export const RemoveLiquidityWithApprovalForm = ({ tokenA, tokenB, lpTokenContract, spender }: Props) => {
  const { address } = useAccount();

  const [liquidity, setLiquidity] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [allowanceOk, setAllowanceOk] = useState(false);
  const [maxLPToWithdraw, setMaxLPToWithdraw] = useState("0.0");

  const isFormValid = Number(liquidity) > 0;
  const PROTOCOL_LOCKED_LP = 1_000_000_000_000n;

  const { writeContractAsync: approveLP } = useScaffoldWriteContract({ contractName: lpTokenContract });
  const { writeContractAsync: removeLiquidity } = useScaffoldWriteContract({ contractName: "SimpleSwap" });

  const { data: allowance, error: allowanceError } = useScaffoldReadContract({
    contractName: lpTokenContract,
    functionName: "allowance",
    args: [address!, spender],
    watch: true,
  });

  const { data: totalSupply, error: totalSupplyError } = useScaffoldReadContract({
    contractName: lpTokenContract,
    functionName: "totalSupply",
    watch: true,
  });

  const { data: reserves, error: reservesError } = useScaffoldReadContract({
    contractName: "SimpleSwap",
    functionName: "getReserves",
    args: [tokenA, tokenB],
    watch: true,
  });

  const { data: balanceA, error: errorBalanceA } = useScaffoldReadContract({
    contractName: "TokenA",
    functionName: "balanceOf",
    args: [spender],
    watch: true,
  });

  const { data: balanceB, error: errorBalanceB } = useScaffoldReadContract({
    contractName: "TokenB",
    functionName: "balanceOf",
    args: [spender],
    watch: true,
  });

  useGlobalErrorToast(allowanceError);
  useGlobalErrorToast(totalSupplyError);
  useGlobalErrorToast(reservesError);
  useGlobalErrorToast(errorBalanceA);
  useGlobalErrorToast(errorBalanceB);

  useEffect(() => {
    if (!reserves || !balanceA || !balanceB || !totalSupply) return;

    const [reserveA, reserveB] = reserves;
    const circulating = totalSupply - PROTOCOL_LOCKED_LP;

    if (reserveA === 0n || reserveB === 0n || circulating === 0n) {
      setMaxLPToWithdraw("0.0");
      return;
    }

    const maxA = (balanceA * circulating) / reserveA;
    const maxB = (balanceB * circulating) / reserveB;
    const min = maxA < maxB ? maxA : maxB;

    setMaxLPToWithdraw(formatUnits(min, 18));
  }, [reserves, balanceA, balanceB, totalSupply, PROTOCOL_LOCKED_LP]);

  useEffect(() => {
    try {
      if (!allowance || !liquidity || isNaN(Number(liquidity))) return setAllowanceOk(false);
      const parsed = parseEther(liquidity);
      setAllowanceOk(BigInt(allowance) >= parsed);
    } catch {
      setAllowanceOk(false);
    }
  }, [allowance, liquidity]);

  const approveIfNeeded = async (parsed: bigint) => {
    if (!allowanceOk) {
      setIsApproving(true);
      const toastId = toast.loading("Aprobando tokens LP...");
      await approveLP({ functionName: "approve", args: [spender, parsed] });
      toast.dismiss(toastId);
      toast.success("Tokens LP aprobados");
      setAllowanceOk(true);
      setIsApproving(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!isFormValid || !address || isApproving || isRemoving) return;

    const parsed = parseEther(liquidity);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 180);

    try {
      await approveIfNeeded(parsed);

      setIsRemoving(true);
      const toastId = toast.loading("Removiendo liquidez...");

      await removeLiquidity({
        functionName: "removeLiquidity",
        args: [tokenA, tokenB, parsed, 0n, 0n, address, deadline],
      });

      toast.dismiss(toastId);
      toast.success("Liquidez removida");
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
      setLiquidity("");
    } catch (err) {
      toast.error(parseViemErrorToMessage(err));
    } finally {
      setIsApproving(false);
      setIsRemoving(false);
    }
  };

  const formattedMax = parseFloat(maxLPToWithdraw).toFixed(6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.3 }}
      className="card bg-base-200 p-6 rounded-2xl shadow-xl max-w-md w-full mx-auto"
    >
      <div className="form-control mb-4">
        <label className="label">Cantidad de LP tokens (SS-LP)</label>

        <input
          className="input input-bordered w-full"
          type="number"
          step="any"
          min="0"
          placeholder="0.0"
          value={liquidity}
          onChange={e => {
            const val = e.target.value;
            if (!val || parseFloat(val) <= parseFloat(maxLPToWithdraw)) {
              setLiquidity(formatDecimalInput(val, 6));
            } else {
              toast.error("Supera el máximo disponible.");
            }
          }}
          disabled={isApproving || isRemoving}
        />

        {/* Botón MAX moderno debajo y a la derecha */}
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={() => setLiquidity(formatDecimalInput(maxLPToWithdraw, 6))}
            disabled={parseFloat(maxLPToWithdraw) === 0 || isApproving || isRemoving}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 border border-primary text-primary hover:bg-primary hover:text-primary-content disabled:opacity-50 disabled:cursor-not-allowed"
          >
            MAX
          </button>
        </div>

        {allowanceOk && <p className="text-xs text-green-500 mt-2">✔ Token LP aprobado</p>}
        <p className="text-xs text-gray-500 mt-1">Máximo disponible: {formattedMax} SS-LP</p>
      </div>

      <ConnectButton.Custom>
        {({ account, chain, openConnectModal, mounted }) => {
          const connected = mounted && account && chain;
          if (!connected) {
            return (
              <button className="btn btn-primary w-full py-3 text-lg" onClick={openConnectModal}>
                Conectar billetera
              </button>
            );
          }

          return (
            <button
              className="btn btn-primary w-full py-3 text-lg"
              onClick={handleRemoveLiquidity}
              disabled={!isFormValid || isApproving || isRemoving}
            >
              {isApproving ? "Aprobando..." : isRemoving ? "Removiendo..." : "Remover Liquidez"}
              {(isApproving || isRemoving) && <span className="loading loading-spinner loading-sm ml-2" />}
            </button>
          );
        }}
      </ConnectButton.Custom>
    </motion.div>
  );
};
