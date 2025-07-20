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
  spender: Address;
}

export const AddLiquidityWithApprovalForm = ({ tokenA, tokenB, spender }: Props) => {
  const { address } = useAccount();

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [lastEdited, setLastEdited] = useState<"A" | "B">("A");

  const [allowanceOkA, setAllowanceOkA] = useState(false);
  const [allowanceOkB, setAllowanceOkB] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const slippage = 0.005;
  const isFormValid = Number(amountA) > 0 && Number(amountB) > 0;

  const { writeContractAsync: approveA } = useScaffoldWriteContract({ contractName: "TokenA" });
  const { writeContractAsync: approveB } = useScaffoldWriteContract({ contractName: "TokenB" });
  const { writeContractAsync: addLiquidity } = useScaffoldWriteContract({ contractName: "SimpleSwap" });

  const { data: allowanceA, error: errorAllowanceA } = useScaffoldReadContract({
    contractName: "TokenA",
    functionName: "allowance",
    args: [address!, spender],
    watch: true,
  });

  const { data: allowanceB, error: errorAllowanceB } = useScaffoldReadContract({
    contractName: "TokenB",
    functionName: "allowance",
    args: [address!, spender],
    watch: true,
  });

  const { data: reserves, error: reservesError } = useScaffoldReadContract({
    contractName: "SimpleSwap",
    functionName: "getReserves",
    args: [tokenA, tokenB],
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

  useGlobalErrorToast(errorAllowanceA);
  useGlobalErrorToast(errorAllowanceB);
  useGlobalErrorToast(reservesError);

  useEffect(() => {
    try {
      if (!allowanceA || !amountA || isNaN(Number(amountA))) return setAllowanceOkA(false);
      const parsed = parseEther(amountA);
      setAllowanceOkA(BigInt(allowanceA) >= parsed);
    } catch {
      setAllowanceOkA(false);
    }
  }, [allowanceA, amountA]);

  useEffect(() => {
    try {
      if (!allowanceB || !amountB || isNaN(Number(amountB))) return setAllowanceOkB(false);
      const parsed = parseEther(amountB);
      setAllowanceOkB(BigInt(allowanceB) >= parsed);
    } catch {
      setAllowanceOkB(false);
    }
  }, [allowanceB, amountB]);

  // 🔁 Calcular automáticamente el otro input si el pool ya tiene reservas
  useEffect(() => {
    if (!reserves || reserves[0] === 0n || reserves[1] === 0n) return;
    try {
      const reserveA = Number(reserves[0]);
      const reserveB = Number(reserves[1]);

      if (lastEdited === "A" && amountA) {
        const inputA = parseFloat(amountA);
        const computedB = (inputA * reserveB) / reserveA;
        setAmountB(formatDecimalInput(computedB.toString(), 6));
      }

      if (lastEdited === "B" && amountB) {
        const inputB = parseFloat(amountB);
        const computedA = (inputB * reserveA) / reserveB;
        setAmountA(formatDecimalInput(computedA.toString(), 6));
      }
    } catch (err) {
      console.warn("Error al calcular proporción:", err);
    }
  }, [amountA, amountB, lastEdited, reserves]);

  const handleAddLiquidity = async () => {
    if (!isFormValid || !address) return;

    try {
      const parsedA = parseEther(amountA);
      const parsedB = parseEther(amountB);
      const minA = parsedA - (parsedA * BigInt(Math.floor(slippage * 10000))) / 10000n;
      const minB = parsedB - (parsedB * BigInt(Math.floor(slippage * 10000))) / 10000n;
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 180);

      if (!allowanceOkA) {
        setIsApproving(true);
        const toastId = toast.loading("Aprobando Token A...");
        await approveA({ functionName: "approve", args: [spender, parsedA] });
        toast.dismiss(toastId);
        toast.success("Token A aprobado");
        setAllowanceOkA(true);
      }

      if (!allowanceOkB) {
        const toastId = toast.loading("Aprobando Token B...");
        await approveB({ functionName: "approve", args: [spender, parsedB] });
        toast.dismiss(toastId);
        toast.success("Token B aprobado");
        setAllowanceOkB(true);
      }

      setIsAdding(true);
      const toastId = toast.loading("Agregando liquidez...");

      await addLiquidity({
        functionName: "addLiquidity",
        args: [tokenA, tokenB, parsedA, parsedB, minA, minB, address, deadline],
      });

      toast.dismiss(toastId);
      toast.success("Liquidez agregada");
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });

      setAmountA("");
      setAmountB("");
    } catch (err) {
      toast.error(parseViemErrorToMessage(err));
    } finally {
      setIsApproving(false);
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.3 }}
      className="card rounded-2xl shadow-xl bg-base-200 p-6 space-y-4 max-w-md w-full mx-auto"
    >
      <div className="bg-base-300 p-4 rounded-xl">
        <label className="text-sm text-gray-400">Cantidad Token A</label>
        <input
          className="input input-bordered bg-base-100 text-lg w-full mt-1"
          placeholder="0.0"
          type="number"
          step="any"
          value={amountA}
          onChange={e => {
            setAmountA(formatDecimalInput(e.target.value, 6));
            setLastEdited("A");
          }}
          disabled={isApproving || isAdding}
        />
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={() => {
              if (balanceA) {
                const val = formatDecimalInput(formatUnits(balanceA, 18), 6);
                setAmountA(val);
                setLastEdited("A");
              }
            }}
            disabled={!balanceA || isApproving || isAdding}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 border border-primary text-primary hover:bg-primary hover:text-primary-content disabled:opacity-50 disabled:cursor-not-allowed"
          >
            MAX
          </button>
        </div>
      </div>

      <div className="bg-base-300 p-4 rounded-xl">
        <label className="text-sm text-gray-400">Cantidad Token B</label>
        <input
          className="input input-bordered bg-base-100 text-lg w-full mt-1"
          placeholder="0.0"
          type="number"
          step="any"
          value={amountB}
          onChange={e => {
            setAmountB(formatDecimalInput(e.target.value, 6));
            setLastEdited("B");
          }}
          disabled={isApproving || isAdding}
        />
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={() => {
              if (balanceB) {
                const val = formatDecimalInput(formatUnits(balanceB, 18), 6);
                setAmountB(val);
                setLastEdited("B");
              }
            }}
            disabled={!balanceB || isApproving || isAdding}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 border border-primary text-primary hover:bg-primary hover:text-primary-content disabled:opacity-50 disabled:cursor-not-allowed"
          >
            MAX
          </button>
        </div>
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
              disabled={!isFormValid || isApproving || isAdding}
              onClick={handleAddLiquidity}
            >
              {isApproving ? "Aprobando..." : isAdding ? "Agregando..." : "Agregar liquidez"}
              {(isApproving || isAdding) && <span className="loading loading-spinner loading-sm ml-2" />}
            </button>
          );
        }}
      </ConnectButton.Custom>
    </motion.div>
  );
};
