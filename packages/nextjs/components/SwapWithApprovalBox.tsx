import { useEffect, useState } from "react";
import Image from "next/image";
import { TokenOption, TokenSelectorModal } from "./TokenSelectorModal";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { Address, formatUnits, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { formatDecimalInput } from "~~/utils/simple-swap/parseInput";

// Available tokens for swapping
const AVAILABLE_TOKENS: TokenOption[] = [
  { symbol: "TKA", name: "TokenA", address: "0xc05C57BA153A2903977cdaa0E54e58d45ac349ED" },
  { symbol: "TKB", name: "TokenB", address: "0x84B42E3fE2312fBf9F1C7e7ad80BdF67bBE09Ac4" },
];

interface Props {
  spender: Address; // The contract address that needs token approval
}

/**
 * Swap box component that handles token swapping with approval flow.
 * Features include:
 * - Token selection for both input and output
 * - Automatic price calculation based on reserves
 * - Token approval when needed
 * - Slippage protection
 * - Visual feedback with toasts and confetti
 *
 * @param {Address} spender - The contract address that needs token approval
 * @returns {React.FC} A complete swap interface component
 */
export const SwapWithApprovalBox: React.FC<Props> = ({ spender }) => {
  const { address } = useAccount();

  // Token selection state
  const [tokenIn, setTokenIn] = useState(AVAILABLE_TOKENS[0]);
  const [tokenOut, setTokenOut] = useState(AVAILABLE_TOKENS[1]);
  const [selecting, setSelecting] = useState<"in" | "out" | null>(null);

  // Amount state
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [lastEditedInput, setLastEditedInput] = useState<"in" | "out">("in");

  // Approval and swap state
  const [allowanceOk, setAllowanceOk] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // Constants
  const slippage = 0.005; // 0.5% slippage tolerance
  const isFormValid = Number(amountIn) > 0 && tokenIn.address !== tokenOut.address;

  // Contract interactions
  const { writeContractAsync: approveAsync } = useScaffoldWriteContract({ contractName: tokenIn.name });
  const { writeContractAsync: swapAsync } = useScaffoldWriteContract({ contractName: "SimpleSwap" });

  // Read token allowance for the spender
  const { data: allowance } = useScaffoldReadContract({
    contractName: tokenIn.name,
    functionName: "allowance",
    args: [address!, spender],
    watch: true,
  });

  // Read pool reserves for the token pair
  const { data: reserves } = useScaffoldReadContract({
    contractName: "SimpleSwap",
    functionName: "getReserves",
    args: [tokenIn.address, tokenOut.address],
    watch: true,
  });

  // Check if current allowance covers the input amount
  useEffect(() => {
    if (allowance && amountIn) {
      setAllowanceOk(BigInt(allowance) >= parseEther(amountIn));
    }
  }, [allowance, amountIn]);

  // Calculate output amount based on reserves and slippage
  useEffect(() => {
    if (!reserves || (!amountIn && !amountOut)) return;

    const reserveIn = reserves[0];
    const reserveOut = reserves[1];
    if (reserveIn === 0n || reserveOut === 0n) return;

    if (lastEditedInput === "in") {
      // Calculate output amount with slippage when input changes
      const input = parseEther(amountIn || "0");
      const out = (input * reserveOut) / (reserveIn + input);
      const outWithSlippage = out - (out * BigInt(Math.floor(slippage * 10000))) / 10000n;
      setAmountOut(formatDecimalInput(formatUnits(outWithSlippage, 18), 2));
    }

    if (lastEditedInput === "out") {
      // Calculate required input amount with slippage when output changes
      const output = parseEther(amountOut || "0");
      const input = (output * reserveIn) / (reserveOut - output);
      const inputWithSlippage = input + (input * BigInt(Math.floor(slippage * 10000))) / 10000n;
      setAmountIn(formatDecimalInput(formatUnits(inputWithSlippage, 18), 6));
    }
  }, [reserves, amountIn, amountOut, tokenIn, tokenOut, lastEditedInput]);

  /**
   * Handles the complete swap flow:
   * 1. Validates the form
   * 2. Approves token if needed
   * 3. Executes the swap
   * 4. Shows feedback to the user
   */
  const handleSwap = async () => {
    if (!isFormValid || !address) {
      toast.error("Formulario inválido.");
      return;
    }

    const parsedAmount = parseEther(amountIn);
    const parsedMinOut = parseEther(amountOut);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 180); // 3 minute deadline

    try {
      // Approval phase if needed
      if (!allowanceOk) {
        setIsApproving(true);
        toast("Aprobando token...");
        await approveAsync({
          functionName: "approve",
          args: [spender, parsedAmount],
        });
        toast.success("Token aprobado");
      }

      // Swap execution phase
      setIsApproving(false);
      setIsSwapping(true);
      const toastId = toast.loading("Realizando swap...");

      await swapAsync({
        functionName: "swapExactTokensForTokens",
        args: [parsedAmount, parsedMinOut, [tokenIn.address, tokenOut.address], address, deadline],
      });

      // Success state
      toast.dismiss(toastId);
      toast.success("Swap exitoso");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      // Reset form
      setAmountIn("");
      setAmountOut("");
    } catch (e: any) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setIsApproving(false);
      setIsSwapping(false);
    }
  };

  /**
   * Switches the input and output tokens
   */
  const switchTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setLastEditedInput("in");
  };

  return (
    <div className="card rounded-2xl shadow-xl bg-base-200 p-6 space-y-4 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2">
        {/* INPUT TOKEN SECTION */}
        <div className="bg-base-300 p-4 rounded-xl">
          <label className="text-sm text-gray-400">Vender</label>
          <div className="flex items-center gap-2 mt-1">
            <input
              className="input input-bordered bg-base-100 text-lg w-full"
              placeholder="0.0"
              value={amountIn}
              onChange={e => {
                setAmountIn(formatDecimalInput(e.target.value));
                setLastEditedInput("in");
              }}
              type="number"
              min="0"
            />
            <button className="btn btn-outline w-32 flex items-center gap-2" onClick={() => setSelecting("in")}>
              <Image
                src={`/tokens/${tokenIn.symbol}.svg`}
                className="w-5 h-5"
                alt={tokenIn.symbol}
                width={40}
                height={40}
              />
              {tokenIn.symbol}
            </button>
          </div>
        </div>

        {/* TOKEN SWITCH BUTTON */}
        <div className="flex justify-center">
          <button className="btn btn-circle btn-sm" onClick={switchTokens}>
            <Image src="/tokens/arrow.svg" alt="arrow" width={12.5} height={20} />
          </button>
        </div>

        {/* OUTPUT TOKEN SECTION */}
        <div className="bg-base-300 p-4 rounded-xl">
          <label className="text-sm text-gray-400">Comprar</label>
          <div className="flex items-center gap-2 mt-1">
            <input
              className="input input-bordered bg-base-100 text-lg w-full"
              placeholder="0.0"
              value={amountOut}
              onChange={e => {
                setAmountOut(formatDecimalInput(e.target.value));
                setLastEditedInput("out");
              }}
              type="number"
              min="0"
            />
            <button className="btn btn-outline w-32 flex items-center gap-2" onClick={() => setSelecting("out")}>
              <Image
                src={`/tokens/${tokenOut.symbol}.svg`}
                className="w-5 h-5"
                alt={tokenOut.symbol}
                width={40}
                height={40}
              />
              {tokenOut.symbol}
            </button>
          </div>
        </div>

        {/* PRICE INDICATOR */}
        <p className="text-xs text-center text-gray-400 mt-2">
          1 {tokenIn.symbol} ≈{" "}
          {reserves && reserves[0] !== 0n && reserves[1] !== 0n
            ? formatDecimalInput((Number(reserves[1]) / Number(reserves[0])).toFixed(6))
            : "-"}{" "}
          {tokenOut.symbol}
        </p>

        {/* ERROR MESSAGE FOR SAME TOKEN SELECTION */}
        {tokenIn.address === tokenOut.address && (
          <p className="text-error text-sm mt-2">❌ No puedes seleccionar el mismo token para ambos lados.</p>
        )}

        {/* SWAP BUTTON */}
        <button
          className="btn btn-primary w-full py-3 text-lg"
          disabled={!isFormValid || isApproving || isSwapping}
          onClick={handleSwap}
        >
          {isApproving || isSwapping ? <span className="loading loading-spinner loading-sm" /> : "Intercambiar"}
        </button>

        {/* TOKEN SELECTION MODAL */}
        <TokenSelectorModal
          isOpen={selecting !== null}
          onClose={() => setSelecting(null)}
          onSelect={token => {
            if (selecting === "in") {
              setTokenIn(token);
            } else {
              setTokenOut(token);
            }
          }}
          tokenList={AVAILABLE_TOKENS}
        />
      </div>
    </div>
  );
};
