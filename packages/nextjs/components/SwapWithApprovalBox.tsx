"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { TokenOption, TokenSelectorModal } from "./TokenSelectorModal";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiAlertCircle } from "react-icons/fi";
import { MdSwapVert } from "react-icons/md";
import { Tooltip } from "react-tooltip";
import { Address, formatUnits, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useGlobalErrorToast } from "~~/hooks/simple-swap/useGlobalErrorToast";
import { formatDecimalInput } from "~~/utils/simple-swap/parseInput";
import { parseViemErrorToMessage } from "~~/utils/simple-swap/parseViemErrorToMessage";

const AVAILABLE_TOKENS: TokenOption[] = [
  { symbol: "TKA", name: "TokenA", address: "0x08A82179B7074f6C2B53696E0e074B2959d9A99d" },
  { symbol: "TKB", name: "TokenB", address: "0x79c6c419f670A12eACF0b3A7645C8A29C34Bde04" },
];

type TokenContractName = "TokenA" | "TokenB";
const symbolToContractName: Record<string, TokenContractName> = {
  TKA: "TokenA",
  TKB: "TokenB",
};

interface Props {
  spender: Address;
}

export const SwapWithApprovalBox: React.FC<Props> = ({ spender }) => {
  const { address } = useAccount();

  const [tokenIn, setTokenIn] = useState(AVAILABLE_TOKENS[0]);
  const [tokenOut, setTokenOut] = useState(AVAILABLE_TOKENS[1]);
  const [selecting, setSelecting] = useState<"in" | "out" | null>(null);

  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [lastEditedInput, setLastEditedInput] = useState<"in" | "out">("in");

  const [allowanceOk, setAllowanceOk] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const slippage = 0.005;
  const isSameToken = tokenIn.address === tokenOut.address;
  const isFormValid = Number(amountIn) > 0 && !isSameToken;

  const tokenInContractName = symbolToContractName[tokenIn.symbol];

  const { writeContractAsync: approve } = useScaffoldWriteContract({ contractName: tokenInContractName });
  const { writeContractAsync: swap } = useScaffoldWriteContract({ contractName: "SimpleSwap" });

  const { data: allowance, error: allowanceError } = useScaffoldReadContract({
    contractName: tokenInContractName,
    functionName: "allowance",
    args: [address!, spender],
    watch: true,
  });

  const { data: reserves, error: reservesError } = useScaffoldReadContract({
    contractName: "SimpleSwap",
    functionName: "getReserves",
    args: [tokenIn.address, tokenOut.address],
    watch: true,
  });

  useGlobalErrorToast(allowanceError);
  useGlobalErrorToast(reservesError);

  useEffect(() => {
    try {
      if (!allowance || !amountIn || isNaN(Number(amountIn))) return setAllowanceOk(false);
      const parsed = parseEther(amountIn);
      setAllowanceOk(BigInt(allowance) >= parsed);
    } catch {
      setAllowanceOk(false);
    }
  }, [allowance, amountIn]);

  useEffect(() => {
    if (!reserves || !tokenIn || !tokenOut) return;
    const [reserveIn, reserveOut] = reserves;
    if (reserveIn === 0n || reserveOut === 0n) return;

    try {
      if (lastEditedInput === "in" && amountIn) {
        const input = parseEther(amountIn);
        const out = (input * reserveOut) / (reserveIn + input);
        const outMin = out - (out * BigInt(Math.floor(slippage * 10000))) / 10000n;
        setAmountOut(formatDecimalInput(formatUnits(outMin, 18), 3));
      }

      if (lastEditedInput === "out" && amountOut) {
        const output = parseEther(amountOut);
        if (output >= reserveOut) {
          toast.error("No hay suficiente liquidez disponible");
          return;
        }
        const input = (output * reserveIn) / (reserveOut - output);
        const inputMax = input + (input * BigInt(Math.floor(slippage * 10000))) / 10000n;
        setAmountIn(formatDecimalInput(formatUnits(inputMax, 18), 6));
      }
    } catch (err) {
      console.error("Error en el cálculo de swap:", err);
    }
  }, [reserves, amountIn, amountOut, lastEditedInput, tokenIn, tokenOut]);

  const handleSwap = async () => {
    if (!isFormValid || !address) return;

    try {
      const parsedIn = parseEther(amountIn);
      const parsedMinOut = parseEther(amountOut);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 180);

      if (!allowanceOk) {
        setIsApproving(true);
        const toastId = toast.loading("Aprobando token...");
        await approve({ functionName: "approve", args: [spender, parsedIn] });
        toast.dismiss(toastId);
        toast.success("Token aprobado");
        setAllowanceOk(true);
      }

      setIsSwapping(true);
      const toastId = toast.loading("Realizando swap...");

      await swap({
        functionName: "swapExactTokensForTokens",
        args: [parsedIn, parsedMinOut, [tokenIn.address, tokenOut.address], address, deadline],
      });

      toast.dismiss(toastId);
      toast.success("Swap exitoso");
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });

      setAmountIn("");
      setAmountOut("");
    } catch (err) {
      toast.error(parseViemErrorToMessage(err));
    } finally {
      setIsApproving(false);
      setIsSwapping(false);
    }
  };

  const switchTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setLastEditedInput("in");
    setAmountOut("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="card rounded-2xl shadow-xl bg-base-200 p-6 space-y-4 max-w-md w-full mx-auto"
    >
      {/* Token In */}
      <div className="bg-base-300 p-4 rounded-xl">
        <label className="text-sm text-gray-400">Vender</label>
        <div className="flex items-center gap-2 mt-1">
          <input
            className="input input-bordered bg-base-100 text-lg w-full"
            placeholder="0.0"
            type="number"
            step="any"
            value={amountIn}
            onChange={e => {
              setAmountIn(formatDecimalInput(e.target.value, 6));
              setLastEditedInput("in");
            }}
            disabled={isApproving || isSwapping}
          />
          <button
            className="w-32 px-3 py-2 bg-base-100 hover:bg-base-200 border border-base-300 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
            onClick={() => setSelecting("in")}
            type="button"
          >
            <Image src={`/tokens/${tokenIn.symbol}.svg`} alt={tokenIn.symbol} width={24} height={24} />
            <span className="font-medium">{tokenIn.symbol}</span>
          </button>
        </div>
      </div>

      {/* Switch */}
      <div className="flex justify-center">
        <button
          className="btn btn-circle btn-sm hover:scale-110 transition-transform"
          onClick={switchTokens}
          disabled={isApproving || isSwapping}
          data-tooltip-id="switch-tooltip"
          data-tooltip-content="Intercambiar tokens"
        >
          <MdSwapVert size={20} />
        </button>
        <Tooltip id="switch-tooltip" />
      </div>

      {/* Token Out */}
      <div className="bg-base-300 p-4 rounded-xl">
        <label className="text-sm text-gray-400">Comprar</label>
        <div className="flex items-center gap-2 mt-1">
          <input
            className="input input-bordered bg-base-100 text-lg w-full"
            placeholder="0.0"
            type="number"
            step="any"
            value={amountOut}
            onChange={e => {
              setAmountOut(formatDecimalInput(e.target.value, 6));
              setLastEditedInput("out");
            }}
            disabled={isApproving || isSwapping}
          />
          <button
            className="w-32 px-3 py-2 bg-base-100 hover:bg-base-200 border border-base-300 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
            onClick={() => setSelecting("out")}
            type="button"
          >
            <Image src={`/tokens/${tokenOut.symbol}.svg`} alt={tokenOut.symbol} width={24} height={24} />
            <span className="font-medium">{tokenOut.symbol}</span>
          </button>
        </div>
      </div>

      {/* Rate */}
      <p
        className="text-xs text-center text-gray-400 mt-2"
        data-tooltip-id="rate-tooltip"
        data-tooltip-content="Tasa estimada con slippage del 0.5%"
      >
        1 {tokenIn.symbol} ≈{" "}
        {reserves && reserves[0] !== 0n && reserves[1] !== 0n
          ? formatDecimalInput((Number(reserves[1]) / Number(reserves[0])).toFixed(6))
          : "-"}{" "}
        {tokenOut.symbol}
      </p>
      <Tooltip id="rate-tooltip" />

      {/* Same token error */}
      {isSameToken && (
        <p className="text-error text-sm mt-2 flex items-center gap-1">
          <FiAlertCircle size={16} />
          No puedes seleccionar el mismo token para ambos lados.
        </p>
      )}

      {/* Wallet connect / swap button */}
      <ConnectButton.Custom>
        {({ account, chain, openConnectModal, mounted }) => {
          const connected = mounted && account && chain;

          if (!connected) {
            return (
              <button className="btn btn-primary w-full py-3 text-lg" onClick={openConnectModal} type="button">
                Conectar billetera
              </button>
            );
          }

          return (
            <button
              className="btn btn-primary w-full py-3 text-lg"
              disabled={!isFormValid || isApproving || isSwapping}
              onClick={handleSwap}
            >
              {isApproving ? "Aprobando..." : isSwapping ? "Intercambiando..." : "Intercambiar"}
              {(isApproving || isSwapping) && <span className="loading loading-spinner loading-sm ml-2" />}
            </button>
          );
        }}
      </ConnectButton.Custom>

      {/* Modal */}
      <TokenSelectorModal
        isOpen={selecting !== null}
        onClose={() => setSelecting(null)}
        onSelect={token => {
          if (selecting === "in") setTokenIn(token);
          if (selecting === "out") setTokenOut(token);
          setSelecting(null);
        }}
        tokenList={AVAILABLE_TOKENS}
      />
    </motion.div>
  );
};
