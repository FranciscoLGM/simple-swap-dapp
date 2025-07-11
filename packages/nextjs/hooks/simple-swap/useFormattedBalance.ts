import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { formatTokenAmount } from "~~/utils/simple-swap/formatTokenAmount";

/**
 * Custom hook to fetch and format a user's token balance.
 *
 * Features:
 * - Automatically watches for balance changes
 * - Formats the raw balance into a human-readable string
 * - Handles different token decimals
 *
 * @param {string} contractName - Nombre del contrato en deployedContracts (ej: "TokenA", "TokenB", "SimpleSwap")
 * @param {number} [decimals=18] - Decimales del token (por defecto 18)
 * @returns {string} Un string legible del balance del usuario actual
 *
 * @example
 * const balance = useFormattedBalance("TokenA");
 * console.log(balance); // "1.23"
 */
export const useFormattedBalance = (contractName: string, decimals = 18) => {
  const { address } = useAccount();

  // Fetch raw balance from contract
  const { data: balance } = useScaffoldReadContract({
    contractName,
    functionName: "balanceOf",
    args: [address!], // Non-null assertion since we only want balance when connected
    watch: true, // Auto-refresh when balance changes
  });

  // Format raw balance into human-readable string
  return formatTokenAmount(balance, decimals);
};
