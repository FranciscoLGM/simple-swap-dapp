import { FC } from "react";
import { formatUnits } from "viem";
import { Address } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { formatDecimalInput } from "~~/utils/simple-swap/parseInput";

interface SwapDashboardProps {
  tokenA: Address;
  tokenB: Address;
  lpTokenContract: "SimpleSwap";
}

/**
 * Dashboard component displaying pool reserves and LP token information.
 *
 * @component
 * @param {SwapDashboardProps} props - Component props
 * @param {Address} props.tokenA - Address of the first token in the pair
 * @param {Address} props.tokenB - Address of the second token in the pair
 * @param {"SimpleSwap"} props.lpTokenContract - Name of the LP token contract
 *
 * @example
 * <SwapDashboard
 *   tokenA="0x123...abc"
 *   tokenB="0x456...def"
 *   lpTokenContract="SimpleSwap"
 * />
 */
export const SwapDashboard: FC<SwapDashboardProps> = ({ tokenA, tokenB, lpTokenContract }) => {
  // Fetch pool reserves with auto-refresh
  const { data: reserves } = useScaffoldReadContract({
    contractName: lpTokenContract,
    functionName: "getReserves",
    args: [tokenA, tokenB],
    watch: true,
  });

  // Fetch total LP supply with auto-refresh
  const { data: totalSupply } = useScaffoldReadContract({
    contractName: lpTokenContract,
    functionName: "totalSupply",
    watch: true,
  });

  /**
   * Formats a BigInt value into a human-readable decimal string
   * @param {bigint | undefined} value - The value to format
   * @returns {string} Formatted value with 2 decimal places
   */
  const formatValue = (value: bigint | undefined): string => {
    return value ? formatDecimalInput(formatUnits(value, 18), 2) : "0";
  };

  return (
    <div className="card bg-base-200 p-6 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-md mx-auto">
      <div className="space-y-3">
        {/* Token A Reserve */}
        <div className="bg-base-300 p-4 rounded-xl">
          <p className="text-sm text-gray-400">TokenA Reserve (TKA)</p>
          <p className="text-lg font-bold" data-testid="token-a-reserve">
            {formatValue(reserves?.[0])}
          </p>
        </div>

        {/* Token B Reserve */}
        <div className="bg-base-300 p-4 rounded-xl">
          <p className="text-sm text-gray-400">TokenB Reserve (TKB)</p>
          <p className="text-lg font-bold" data-testid="token-b-reserve">
            {formatValue(reserves?.[1])}
          </p>
        </div>

        {/* Total LP Supply */}
        <div className="bg-base-300 p-4 rounded-xl">
          <p className="text-sm text-gray-400">Total LP Tokens (SS-LP)</p>
          <p className="text-lg font-bold" data-testid="total-lp-supply">
            {formatValue(totalSupply)}
          </p>
        </div>
      </div>
    </div>
  );
};
