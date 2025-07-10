import { useState } from "react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { Address, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { formatDecimalInput } from "~~/utils/simple-swap/parseInput";

interface RemoveLiquidityFormProps {
  tokenA: Address;
  tokenB: Address;
  lpTokenContract: "SimpleSwap";
  spender: Address; // The contract address that will spend the LP tokens (usually the router)
}

/**
 * Form component for removing liquidity from a pool with LP token approval flow.
 * Handles the complete process: LP token approval and liquidity removal.
 *
 * @component
 * @param {RemoveLiquidityFormProps} props - Component props
 * @param {Address} props.tokenA - Address of first token in the pair
 * @param {Address} props.tokenB - Address of second token in the pair
 * @param {"SimpleSwap"} props.lpTokenContract - Name of the LP token contract
 * @param {Address} props.spender - Contract address to approve for LP token spending
 *
 * @example
 * <RemoveLiquidityWithApprovalForm
 *   tokenA="0x123...abc"
 *   tokenB="0x456...def"
 *   lpTokenContract="SimpleSwap"
 *   spender="0x789...ghi"
 * />
 */
export const RemoveLiquidityWithApprovalForm: React.FC<RemoveLiquidityFormProps> = ({
  tokenA,
  tokenB,
  lpTokenContract,
  spender,
}) => {
  const { address } = useAccount();
  const [lpAmount, setLpAmount] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const { writeContractAsync: approveLP } = useScaffoldWriteContract({ contractName: lpTokenContract });
  const { writeContractAsync: removeLiquidity } = useScaffoldWriteContract({ contractName: "SimpleSwap" });

  /**
   * Handles the complete liquidity removal flow:
   * 1. Validates input
   * 2. Approves LP tokens
   * 3. Removes liquidity from the pool
   * 4. Shows feedback to the user
   */
  const handleRemoveLiquidity = async () => {
    if (!lpAmount || !address) {
      toast.error("Please enter the amount of LP tokens to withdraw");
      return;
    }

    try {
      const parsedLP = parseEther(lpAmount);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 180); // 3 minutes deadline

      // Approval phase
      setIsApproving(true);
      toast.loading("Approving LP tokens...");

      await approveLP({
        functionName: "approve",
        args: [spender, parsedLP],
      });

      toast.success("LP tokens approved");
      setIsApproving(false);

      // Liquidity removal phase
      setIsRemoving(true);
      const toastId = toast.loading("Removing liquidity...");

      await removeLiquidity({
        functionName: "removeLiquidity",
        args: [tokenA, tokenB, parsedLP, 0n, 0n, address, deadline],
      });

      toast.dismiss(toastId);
      toast.success("Liquidity successfully removed!");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Reset form
      setLpAmount("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Transaction failed: ${errorMessage}`);
    } finally {
      setIsApproving(false);
      setIsRemoving(false);
    }
  };

  return (
    <div className="card bg-base-200 p-6 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-md mx-auto">
      <div className="space-y-4">
        {/* LP Token Input */}
        <div className="bg-base-300 p-4 rounded-xl">
          <label className="text-sm text-gray-400">Amount of LP Tokens (SS-LP)</label>
          <input
            className="input input-bordered bg-base-100 w-full mt-1"
            type="number"
            placeholder="0.0"
            value={lpAmount}
            onChange={e => setLpAmount(formatDecimalInput(e.target.value))}
            min="0"
            step="any"
            disabled={isApproving || isRemoving}
          />
        </div>

        {/* Submit Button */}
        <button
          className="btn btn-primary w-full mt-2 py-3 text-lg"
          onClick={handleRemoveLiquidity}
          disabled={!lpAmount || isApproving || isRemoving || !address}
        >
          {isApproving ? "Approving..." : isRemoving ? "Removing..." : "Remove Liquidity"}
          {(isApproving || isRemoving) && <span className="loading loading-spinner ml-2" />}
        </button>
      </div>
    </div>
  );
};
