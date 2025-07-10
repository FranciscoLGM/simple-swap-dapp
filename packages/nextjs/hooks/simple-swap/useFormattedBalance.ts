import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { formatTokenAmount } from "~~/utils/simple-swap/formatTokenAmount";

/**
 * Custom hook to fetch and format a token balance for the connected wallet.
 *
 * @param {string} contractName - Name of the contract in deployedContracts (e.g., "TokenA", "TokenB", "SimpleSwap")
 * @param {number} [decimals=18] - Number of decimals the token uses (default: 18)
 * @returns {string} Formatted token balance as a human-readable string
 * @throws Will throw an error if no wallet is connected when reading the balance
 * @example
 * const formattedBalance = useFormattedBalance("TokenA");
 * console.log(formattedBalance); // "1.5"
 */
export const useFormattedBalance = (contractName: string, decimals: number = 18): string => {
  const { address } = useAccount();

  const { data: balance } = useScaffoldReadContract({
    contractName,
    functionName: "balanceOf",
    args: [address!],
    watch: true,
  });

  if (!address) {
    return "0"; // Return default value when no wallet is connected
  }

  return formatTokenAmount(balance, decimals);
};
