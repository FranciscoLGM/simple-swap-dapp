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
  {
    symbol: "TKA",
    name: "TokenA",
    address: "0x929300C89594B53658bc9fFf580903Fc4315c948",
  },
  {
    symbol: "TKB",
    name: "TokenB",
    address: "0x11A87DAe8DB12721f5028569DA2FC2eb83b5feAd",
  },
];

interface SwapBoxProps {
  spender: Address; // The contract address that needs token approval (usually the router)
}

/**
 * Swap component with built-in token approval flow.
 * Handles token selection, amount input, price calculation, approval, and swapping.
 *
 * @component
 * @param {SwapBoxProps} props - Component props
 * @param {Address} props.spender - Contract address that needs token approval
 *
 * @example
 * <SwapWithApprovalBox spender="0x123...abc" />
 */
export const SwapWithApprovalBox: React.FC<SwapBoxProps> = ({ spender }) => {
  const { address } = useAccount();

  // Token selection state
  const [tokenIn, setTokenIn] = useState<TokenOption>(AVAILABLE_TOKENS[0]);
  const [tokenOut, setTokenOut] = useState<TokenOption>(AVAILABLE_TOKENS[1]);
  const [selecting, setSelecting] = useState<"in" | "out" | null>(null);

  // Amount state
  const [amountIn, setAmountIn] = useState<string>("");
  const [amountOut, setAmountOut] = useState<string>("");
  const [lastEditedInput, setLastEditedInput] = useState<"in" | "out">("in");

  // Transaction state
  const [allowanceOk, setAllowanceOk] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  // Constants
  const slippage = 0.005; // 0.5% slippage tolerance
  const isFormValid = Number(amountIn) > 0 && tokenIn.address !== tokenOut.address;

  // Contract interactions
  const { writeContractAsync: approveAsync } = useScaffoldWriteContract({ contractName: tokenIn.name });
  const { writeContractAsync: swapAsync } = useScaffoldWriteContract({ contractName: "SimpleSwap" });

  // Read token allowance
  const { data: allowance } = useScaffoldReadContract({
    contractName: tokenIn.name,
    functionName: "allowance",
    args: [address!, spender],
    watch: true,
  });

  // Read pool reserves
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

    // Skip calculation if reserves are zero
    if (reserveIn === 0n || reserveOut === 0n) return;

    if (lastEditedInput === "in") {
      const input = parseEther(amountIn || "0");
      const out = (input * reserveOut) / (reserveIn + input);
      const outWithSlippage = out - (out * BigInt(Math.floor(slippage * 10000))) / 10000n;
      setAmountOut(formatDecimalInput(formatUnits(outWithSlippage, 18), 2));
    }

    if (lastEditedInput === "out") {
      const output = parseEther(amountOut || "0");
      const input = (output * reserveIn) / (reserveOut - output);
      const inputWithSlippage = input + (input * BigInt(Math.floor(slippage * 10000))) / 10000n;
      setAmountIn(formatDecimalInput(formatUnits(inputWithSlippage, 18), 6));
    }
  }, [reserves, amountIn, amountOut, tokenIn, tokenOut, lastEditedInput]);

  /**
   * Handles the swap transaction flow:
   * 1. Checks form validity
   * 2. Approves token if needed
   * 3. Executes swap
   * 4. Shows transaction feedback
   */
  const handleSwap = async () => {
    if (!isFormValid || !address) {
      toast.error("Invalid form data");
      return;
    }

    const parsedAmount = parseEther(amountIn);
    const parsedMinOut = parseEther(amountOut);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 180); // 3 minute deadline

    try {
      // Approval phase if needed
      if (!allowanceOk) {
        setIsApproving(true);
        toast.loading("Approving token...");
        await approveAsync({
          functionName: "approve",
          args: [spender, parsedAmount],
        });
        toast.success("Token approved");
      }

      // Swap phase
      setIsApproving(false);
      setIsSwapping(true);
      const toastId = toast.loading("Processing swap...");

      await swapAsync({
        functionName: "swapExactTokensForTokens",
        args: [parsedAmount, parsedMinOut, [tokenIn.address, tokenOut.address], address, deadline],
      });

      toast.dismiss(toastId);
      toast.success("Swap successful!");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      // Reset form
      setAmountIn("");
      setAmountOut("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Transaction failed";
      toast.error(errorMessage);
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
        {/* Input Token Section */}
        <div className="bg-base-300 p-4 rounded-xl">
          <label className="text-sm text-gray-400">From</label>
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
              disabled={isApproving || isSwapping}
            />
            <button
              className="btn btn-outline w-32 flex items-center gap-2"
              onClick={() => setSelecting("in")}
              disabled={isApproving || isSwapping}
            >
              <Image src={`/tokens/${tokenIn.symbol}.svg`} className="w-5 h-5" alt={tokenIn.symbol} />
              {tokenIn.symbol}
            </button>
          </div>
        </div>

        {/* Switch Tokens Button */}
        <div className="flex justify-center">
          <button
            className="btn btn-circle btn-sm"
            onClick={switchTokens}
            disabled={isApproving || isSwapping}
            aria-label="Switch tokens"
          >
            <Image src="/tokens/arrow.svg" alt="Switch tokens" />
          </button>
        </div>

        {/* Output Token Section */}
        <div className="bg-base-300 p-4 rounded-xl">
          <label className="text-sm text-gray-400">To</label>
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
              disabled={isApproving || isSwapping}
            />
            <button
              className="btn btn-outline w-32 flex items-center gap-2"
              onClick={() => setSelecting("out")}
              disabled={isApproving || isSwapping}
            >
              <Image src={`/tokens/${tokenOut.symbol}.svg`} className="w-5 h-5" alt={tokenOut.symbol} />
              {tokenOut.symbol}
            </button>
          </div>
        </div>

        {/* Price Information */}
        <p className="text-xs text-center text-gray-400 mt-2">
          1 {tokenIn.symbol} ≈{" "}
          {reserves && reserves[0] !== 0n && reserves[1] !== 0n
            ? formatDecimalInput((Number(reserves[1]) / Number(reserves[0])).toFixed(6))
            : "-"}{" "}
          {tokenOut.symbol}
        </p>

        {/* Error Message for Same Token */}
        {tokenIn.address === tokenOut.address && (
          <p className="text-error text-sm mt-2">❌ Cannot select the same token for both sides</p>
        )}

        {/* Swap Button */}
        <button
          className="btn btn-primary w-full py-3 text-lg"
          disabled={!isFormValid || isApproving || isSwapping}
          onClick={handleSwap}
        >
          {isApproving ? "Approving..." : isSwapping ? "Swapping..." : "Swap"}
          {(isApproving || isSwapping) && <span className="loading loading-spinner loading-sm ml-2" />}
        </button>

        {/* Token Selection Modal */}
        <TokenSelectorModal
          isOpen={selecting !== null}
          onClose={() => setSelecting(null)}
          onSelect={token => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            selecting === "in" ? setTokenIn(token) : setTokenOut(token);
          }}
          tokenList={AVAILABLE_TOKENS}
        />
      </div>
    </div>
  );
};
