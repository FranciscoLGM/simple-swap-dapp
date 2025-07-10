import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { formatTokenAmount } from "~~/utils/simple-swap/formatTokenAmount";

/**
 * Custom hook to fetch and format a token balance by contract name.
 * Automatically watches for balance changes and updates.
 *
 * @param {string} contractName - Name of the contract in deployedContracts (e.g., "TokenA", "SimpleSwap")
 * @param {number} [decimals=18] - Token decimals (default: 18)
 * @returns {string} Formatted token balance of the connected user
 *
 * @example
 * // Returns formatted balance of TokenA
 * const tokenABalance = useFormattedBalance("TokenA");
 *
 * @example
 * // Returns formatted balance with custom decimals
 * const usdcBalance = useFormattedBalance("USDC", 6);
 *
 * @throws Will throw if used without a connected wallet
 * @note Requires wagmi's useAccount and a connected wallet
 */
export const useFormattedBalance = (contractName: string, decimals: number = 18): string => {
  const { address } = useAccount();

  const { data: balance } = useScaffoldReadContract({
    contractName,
    functionName: "balanceOf",
    args: [address!], // Non-null assertion as we expect this to be used with connected wallet
    watch: true, // Auto-updates on balance changes
  });

  return formatTokenAmount(balance, decimals);
};
