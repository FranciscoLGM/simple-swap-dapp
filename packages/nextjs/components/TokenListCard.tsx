import { FC } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useGlobalErrorToast } from "~~/hooks/simple-swap/useGlobalErrorToast";
import { formatTokenAmount } from "~~/utils/simple-swap/formatTokenAmount";

interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  contractName: string;
  decimals?: number;
}

interface TokenBalanceItemProps {
  token: TokenInfo;
  userAddress: string;
}

const TokenBalanceItem: FC<TokenBalanceItemProps> = ({ token, userAddress }) => {
  const { data: balance, error } = useScaffoldReadContract({
    contractName: token.contractName,
    functionName: "balanceOf",
    args: [userAddress],
    watch: true,
  });

  useGlobalErrorToast(error);

  const formattedBalance = formatTokenAmount(balance, token.decimals || 18, 6);

  return (
    <li className="flex items-center justify-between bg-base-300 p-4 rounded-xl">
      <div className="flex items-center gap-3 min-w-0">
        <Image src={`/tokens/${token.symbol}.svg`} alt={token.symbol} width={24} height={24} className="shrink-0" />
        <div className="text-left truncate min-w-0">
          <div className="font-semibold">{token.name}</div>
          <div className="text-xs text-gray-400">{token.symbol}</div>
          <div className="text-[10px] text-gray-400 truncate">
            {token.address.slice(0, 6)}...{token.address.slice(-4)}
          </div>
        </div>
      </div>

      <div className="text-sm font-mono text-right whitespace-nowrap">{formattedBalance}</div>
    </li>
  );
};

interface TokenListCardProps {
  tokens: TokenInfo[];
  title?: string;
}

export const TokenListCard: FC<TokenListCardProps> = ({ tokens, title = "Tus tokens" }) => {
  const { address } = useAccount();

  if (!address) return null;

  return (
    <div className="card bg-base-200 p-6 rounded-2xl shadow-xl max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ul className="space-y-3">
        {tokens.map(token => (
          <TokenBalanceItem key={token.symbol} token={token} userAddress={address} />
        ))}
      </ul>
    </div>
  );
};
