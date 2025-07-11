import { FC } from "react";
import { formatUnits } from "viem";
import { Address } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { formatDecimalInput } from "~~/utils/simple-swap/parseInput";

interface Props {
  tokenA: Address;
  tokenB: Address;
  lpTokenContract: "SimpleSwap";
}

/**
 * Dashboard component that displays key swap pool statistics including:
 * - Token reserves for both assets in the pair
 * - Total circulating LP tokens
 *
 * @param {Address} tokenA - Address of the first token in the pair
 * @param {Address} tokenB - Address of the second token in the pair
 * @param {"SimpleSwap"} lpTokenContract - Name of the LP token contract
 * @returns {FC} A dashboard component showing pool statistics
 */
export const SwapDashboard: FC<Props> = ({ tokenA, tokenB, lpTokenContract }) => {
  // Fetch reserve data for the token pair
  const { data: reserves } = useScaffoldReadContract({
    contractName: lpTokenContract,
    functionName: "getReserves",
    args: [tokenA, tokenB],
    watch: true, // Auto-refresh when changes occur
  });

  // Fetch total supply of LP tokens
  const { data: totalSupply } = useScaffoldReadContract({
    contractName: lpTokenContract,
    functionName: "totalSupply",
    watch: true, // Auto-refresh when changes occur
  });

  /**
   * Formats a BigInt value into a human-readable string
   * @param {bigint | undefined} value - The value to format
   * @returns {string} Formatted value with 2 decimal places
   */
  const formatValue = (value: bigint | undefined) => (value ? formatDecimalInput(formatUnits(value, 18), 2) : "0");

  return (
    <div className="card bg-base-200 p-6 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-md mx-auto">
      <div className="space-y-3">
        {/* Token A Reserve Display */}
        <div className="bg-base-300 p-4 rounded-xl">
          <p className="text-sm text-gray-400">Reserva de TokenA (TKA)</p>
          <p className="text-lg font-bold">{formatValue(reserves?.[0])}</p>
        </div>

        {/* Token B Reserve Display */}
        <div className="bg-base-300 p-4 rounded-xl">
          <p className="text-sm text-gray-400">Reserva de TokenB (TKB)</p>
          <p className="text-lg font-bold">{formatValue(reserves?.[1])}</p>
        </div>

        {/* LP Token Supply Display */}
        <div className="bg-base-300 p-4 rounded-xl">
          <p className="text-sm text-gray-400">Tokens LP en circulación (SS-LP)</p>
          <p className="text-lg font-bold">{formatValue(totalSupply)}</p>
        </div>
      </div>
    </div>
  );
};
