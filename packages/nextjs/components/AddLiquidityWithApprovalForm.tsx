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
  spender: Address;
}

/**
 * A form component for adding liquidity to a pool with token approval.
 * Handles the approval and liquidity addition process with user feedback.
 *
 * @param {Address} tokenA - The address of the first token in the pair
 * @param {Address} tokenB - The address of the second token in the pair
 * @param {Address} spender - The contract address to approve for token spending
 * @returns {React.FC} A form component for adding liquidity
 */
export const AddLiquidityWithApprovalForm: React.FC<Props> = ({ tokenA, tokenB, spender }) => {
  const { address } = useAccount();

  // State for token amounts and loading states
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Contract write hooks for approvals and adding liquidity
  const { writeContractAsync: approveA } = useScaffoldWriteContract({ contractName: "TokenA" });
  const { writeContractAsync: approveB } = useScaffoldWriteContract({ contractName: "TokenB" });
  const { writeContractAsync: addLiquidity } = useScaffoldWriteContract({ contractName: "SimpleSwap" });

  /**
   * Handles the complete liquidity addition flow:
   * 1. Validates inputs
   * 2. Approves token spending
   * 3. Adds liquidity to the pool
   * 4. Provides user feedback via toasts and confetti
   */
  const handleAddLiquidity = async () => {
    // Validate inputs
    if (!amountA || !amountB || !address) {
      toast.error("Ingresa ambos valores");
      return;
    }

    try {
      // Parse amounts and set deadline (20 minutes from now)
      const parsedA = parseEther(amountA);
      const parsedB = parseEther(amountB);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 180);

      // Approval phase
      setIsApproving(true);
      toast("Aprobando tokens...");
      await approveA({ functionName: "approve", args: [spender, parsedA] });
      await approveB({ functionName: "approve", args: [spender, parsedB] });
      toast.success("Tokens aprobados");
      setIsApproving(false);

      // Liquidity addition phase
      setIsAdding(true);
      const toastId = toast.loading("Añadiendo liquidez...");

      await addLiquidity({
        functionName: "addLiquidity",
        args: [tokenA, tokenB, parsedA, parsedB, 0n, 0n, address, deadline],
      });

      // Success state
      toast.dismiss(toastId);
      toast.success("Liquidez añadida");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      // Reset form
      setAmountA("");
      setAmountB("");
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      // Reset loading states
      setIsApproving(false);
      setIsAdding(false);
    }
  };

  return (
    <div className="card bg-base-200 p-6 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-md mx-auto">
      <div className="space-y-4">
        {/* Token A Input */}
        <div className="bg-base-300 p-4 rounded-xl">
          <label className="text-sm text-gray-400">Cantidad de TokenA (TKA)</label>
          <input
            className="input input-bordered bg-base-100 w-full mt-1"
            type="number"
            placeholder="0.0"
            value={amountA}
            onChange={e => setAmountA(formatDecimalInput(e.target.value))}
          />
        </div>

        {/* Token B Input */}
        <div className="bg-base-300 p-4 rounded-xl">
          <label className="text-sm text-gray-400">Cantidad de TokenB (TKB)</label>
          <input
            className="input input-bordered bg-base-100 w-full mt-1"
            type="number"
            placeholder="0.0"
            value={amountB}
            onChange={e => setAmountB(formatDecimalInput(e.target.value))}
          />
        </div>

        {/* Submit Button */}
        <button
          className="btn btn-primary w-full mt-2 py-3 text-lg"
          onClick={handleAddLiquidity}
          disabled={!amountA || !amountB || isApproving || isAdding}
        >
          {isApproving || isAdding ? <span className="loading loading-spinner" /> : "Añadir liquidez"}
        </button>
      </div>
    </div>
  );
};
