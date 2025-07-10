import { useState } from "react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { Address, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { formatDecimalInput } from "~~/utils/simple-swap/parseInput";

interface AddLiquidityFormProps {
  tokenA: Address;
  tokenB: Address;
  spender: Address; // The contract address that will spend the tokens (usually the router or pool)
}

/**
 * Form component for adding liquidity to a pool with token approval flow.
 * Handles the complete process: token approval and liquidity addition.
 *
 * @component
 * @param {AddLiquidityFormProps} props - Component props
 * @param {Address} props.tokenA - Address of first token in the pair
 * @param {Address} props.tokenB - Address of second token in the pair
 * @param {Address} props.spender - Contract address to approve for token spending
 *
 * @example
 * <AddLiquidityWithApprovalForm
 *   tokenA="0x123...abc"
 *   tokenB="0x456...def"
 *   spender="0x789...ghi"
 * />
 */
export const AddLiquidityWithApprovalForm: React.FC<AddLiquidityFormProps> = ({ tokenA, tokenB, spender }) => {
  const { address } = useAccount();

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Contract write hooks
  const { writeContractAsync: approveA } = useScaffoldWriteContract({ contractName: "TokenA" });
  const { writeContractAsync: approveB } = useScaffoldWriteContract({ contractName: "TokenB" });
  const { writeContractAsync: addLiquidity } = useScaffoldWriteContract({ contractName: "SimpleSwap" });

  /**
   * Handles the complete liquidity addition flow:
   * 1. Validates inputs
   * 2. Approves both tokens
   * 3. Adds liquidity to the pool
   * 4. Shows feedback to the user
   */
  const handleAddLiquidity = async () => {
    if (!amountA || !amountB || !address) {
      toast.error("Please enter both amounts");
      return;
    }

    try {
      const parsedA = parseEther(amountA);
      const parsedB = parseEther(amountB);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 180); // 3 minutes deadline

      // Approval phase
      setIsApproving(true);
      toast.loading("Approving tokens...");

      await Promise.all([
        approveA({ functionName: "approve", args: [spender, parsedA] }),
        approveB({ functionName: "approve", args: [spender, parsedB] }),
      ]);

      toast.success("Tokens approved");
      setIsApproving(false);

      // Liquidity addition phase
      setIsAdding(true);
      const toastId = toast.loading("Adding liquidity...");

      await addLiquidity({
        functionName: "addLiquidity",
        args: [tokenA, tokenB, parsedA, parsedB, 0n, 0n, address, deadline],
      });

      toast.dismiss(toastId);
      toast.success("Liquidity added successfully!");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      // Reset form
      setAmountA("");
      setAmountB("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Transaction failed: ${errorMessage}`);
    } finally {
      setIsApproving(false);
      setIsAdding(false);
    }
  };

  return (
    <div className="card bg-base-200 p-6 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-md mx-auto">
      <div className="space-y-4">
        {/* Token A Input */}
        <div className="bg-base-300 p-4 rounded-xl">
          <label className="text-sm text-gray-400">Amount of TokenA (TKA)</label>
          <input
            className="input input-bordered bg-base-100 w-full mt-1"
            type="number"
            placeholder="0.0"
            value={amountA}
            onChange={e => setAmountA(formatDecimalInput(e.target.value))}
            min="0"
            step="any"
            disabled={isApproving || isAdding}
          />
        </div>

        {/* Token B Input */}
        <div className="bg-base-300 p-4 rounded-xl">
          <label className="text-sm text-gray-400">Amount of TokenB (TKB)</label>
          <input
            className="input input-bordered bg-base-100 w-full mt-1"
            type="number"
            placeholder="0.0"
            value={amountB}
            onChange={e => setAmountB(formatDecimalInput(e.target.value))}
            min="0"
            step="any"
            disabled={isApproving || isAdding}
          />
        </div>

        {/* Submit Button */}
        <button
          className="btn btn-primary w-full mt-2 py-3 text-lg"
          onClick={handleAddLiquidity}
          disabled={!amountA || !amountB || isApproving || isAdding || !address}
        >
          {isApproving ? "Approving..." : isAdding ? "Adding..." : "Add Liquidity"}
          {(isApproving || isAdding) && <span className="loading loading-spinner ml-2" />}
        </button>
      </div>
    </div>
  );
};
