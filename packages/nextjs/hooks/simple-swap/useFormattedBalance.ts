import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { formatTokenAmount } from "~~/utils/simple-swap/formatTokenAmount";

/**
 * Contratos soportados por este hook.
 */
type AllowedContracts = "TokenA" | "TokenB" | "SimpleSwap";

/**
 * Custom hook to fetch and format a user's token balance.
 *
 * Features:
 * - Watches balance changes
 * - Formats BigInt into human-readable string
 * - Handles decimals and disconnected wallets
 *
 * @param {AllowedContracts} contractName - Name of the token contract
 * @param {number} [decimals=18] - Token decimals (default 18)
 * @param {string} [addressOverride] - Optional address to check (defaults to connected user)
 * @returns {string} A readable balance string like "1.23"
 *
 * @example
 * const balance = useFormattedBalance("TokenA");
 * console.log(balance); // "1.23"
 */
export const useFormattedBalance = (
  contractName: AllowedContracts,
  decimals = 18,
  addressOverride?: string,
): string => {
  const { address } = useAccount();
  const targetAddress = addressOverride ?? address;

  const { data: balance } = useScaffoldReadContract({
    contractName,
    functionName: "balanceOf",
    args: [targetAddress] as const,
    watch: true,
  });

  return formatTokenAmount(balance ?? 0n, decimals);
};
