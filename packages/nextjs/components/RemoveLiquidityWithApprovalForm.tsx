import { useState } from "react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { Address, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { formatDecimalInput } from "~~/utils/simple-swap/parseInput";

interface Props {
  tokenA: Address;
  tokenB: Address;
  lpTokenContract: "SimpleSwap";
  spender: Address;
}

/**
 * A form component for removing liquidity from a pool with LP token approval.
 * Handles the approval and liquidity removal process with user feedback.
 *
 * @param {Address} tokenA - The address of the first token in the pair
 * @param {Address} tokenB - The address of the second token in the pair
 * @param {"SimpleSwap"} lpTokenContract - The name of the LP token contract
 * @param {Address} spender - The contract address to approve for LP token spending
 * @returns {React.FC} A form component for removing liquidity
 */
export const RemoveLiquidityWithApprovalForm: React.FC<Props> = ({ tokenA, tokenB, lpTokenContract, spender }) => {
  const { address } = useAccount();

  // State for LP token amount and loading states
  const [lpAmount, setLpAmount] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Contract write hooks for approvals and removing liquidity
  const { writeContractAsync: approveLP } = useScaffoldWriteContract({ contractName: lpTokenContract });
  const { writeContractAsync: removeLiquidity } = useScaffoldWriteContract({ contractName: "SimpleSwap" });

  /**
   * Handles the complete liquidity removal flow:
   * 1. Validates input
   * 2. Approves LP token spending
   * 3. Removes liquidity from the pool
   * 4. Provides user feedback via toasts and confetti
   */
  const handleRemoveLiquidity = async () => {
    // Validate input
    if (!lpAmount || !address) {
      toast.error("Ingresa la cantidad de LP tokens a retirar");
      return;
    }

    try {
      // Parse amount and set deadline (20 minutes from now)
      const parsedLP = parseEther(lpAmount);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 180);

      // Approval phase
      setIsApproving(true);
      toast("Aprobando tokens LP...");
      await approveLP({ functionName: "approve", args: [spender, parsedLP] });
      toast.success("Token LP aprobado");
      setIsApproving(false);

      // Liquidity removal phase
      setIsRemoving(true);
      const toastId = toast.loading("Retirando liquidez...");

      await removeLiquidity({
        functionName: "removeLiquidity",
        args: [tokenA, tokenB, parsedLP, 0n, 0n, address, deadline],
      });

      // Success state
      toast.dismiss(toastId);
      toast.success("Liquidez retirada");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      // Reset form
      setLpAmount("");
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      // Reset loading states
      setIsApproving(false);
      setIsRemoving(false);
    }
  };

  return (
    <div className="card bg-base-200 p-6 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-md mx-auto">
      <div className="space-y-4">
        {/* LP Token Input */}
        <div className="bg-base-300 p-4 rounded-xl">
          <label className="text-sm text-gray-400">Cantidad de tokens LP (SS-LP)</label>
          <input
            className="input input-bordered bg-base-100 w-full mt-1"
            type="number"
            placeholder="0.0"
            value={lpAmount}
            onChange={e => setLpAmount(formatDecimalInput(e.target.value))}
          />
        </div>

        {/* Submit Button */}
        <button
          className="btn btn-primary w-full mt-2 py-3 text-lg"
          onClick={handleRemoveLiquidity}
          disabled={!lpAmount || isApproving || isRemoving}
        >
          {isApproving || isRemoving ? <span className="loading loading-spinner" /> : "Retirar liquidez"}
        </button>
      </div>
    </div>
  );
};
