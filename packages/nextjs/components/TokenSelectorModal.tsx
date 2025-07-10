import { FC, useEffect } from "react";
import Image from "next/image";
import { Address } from "viem";

/**
 * Interface representing a token option in the selector
 */
export interface TokenOption {
  symbol: string; // Token symbol (e.g., "ETH")
  name: string; // Token name (e.g., "Ethereum")
  address: Address; // Token contract address
}

interface TokenSelectorModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Callback when modal should close
  onSelect: (token: TokenOption) => void; // Callback when token is selected
  tokenList: TokenOption[]; // List of available tokens
}

/**
 * Modal component for selecting tokens from a list.
 *
 * Features:
 * - Keyboard navigation (Escape to close)
 * - Responsive design
 * - Accessible markup
 * - Token details display
 *
 * @component
 * @param {TokenSelectorModalProps} props - Component props
 *
 * @example
 * <TokenSelectorModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onSelect={(token) => setSelectedToken(token)}
 *   tokenList={TOKEN_LIST}
 * />
 */
export const TokenSelectorModal: FC<TokenSelectorModalProps> = ({ isOpen, onClose, onSelect, tokenList }) => {
  /**
   * Handles keyboard events for accessibility
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Token selector"
      onClick={onClose} // Close when clicking outside
    >
      <div
        className="bg-base-100 p-6 rounded-2xl shadow-lg w-full max-w-sm space-y-6 animate-in slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()} // Prevent click propagation
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Select a token</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close token selector">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          {tokenList.map(token => (
            <button
              key={`${token.symbol}-${token.address}`}
              className="btn btn-outline justify-between items-center px-4 py-3 rounded-lg hover:bg-base-200 transition-colors"
              onClick={() => {
                onSelect(token);
                onClose();
              }}
              aria-label={`Select ${token.name} (${token.symbol})`}
            >
              <div className="flex items-center gap-3">
                <Image src={`/tokens/${token.symbol}.svg`} alt="" className="w-6 h-6" aria-hidden="true" />
                <div className="text-left">
                  <div className="font-medium">{token.name}</div>
                  <div className="text-xs text-gray-400">{token.symbol}</div>
                </div>
              </div>
              <span className="text-xs text-gray-400 truncate max-w-[80px]">
                {token.address.slice(0, 6)}...{token.address.slice(-4)}
              </span>
            </button>
          ))}
        </div>

        <button
          className="btn btn-ghost w-full rounded-full mt-4"
          onClick={onClose}
          aria-label="Cancel token selection"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
