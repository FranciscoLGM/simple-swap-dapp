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

interface Props {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Callback when modal closes
  onSelect: (token: TokenOption) => void; // Callback when token is selected
  tokenList: TokenOption[]; // List of available tokens
}

/**
 * A modal component for selecting tokens from a list.
 * Features include:
 * - Keyboard navigation (Escape to close)
 * - Responsive design
 * - Token details display (symbol, name, truncated address)
 * - Animated transitions
 *
 * @param {Props} props - Component properties
 * @returns {FC} A token selector modal component
 */
export const TokenSelectorModal: FC<Props> = ({ isOpen, onClose, onSelect, tokenList }) => {
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Selector de token"
    >
      {/* Modal container */}
      <div className="bg-base-100 p-6 rounded-2xl shadow-lg w-full max-w-sm space-y-6 animate-in slide-in-from-bottom-4 duration-300">
        {/* Modal header */}
        <h3 className="text-lg font-semibold">Seleccionar token</h3>

        {/* Token list */}
        <div className="flex flex-col gap-3">
          {tokenList.map(token => (
            <button
              key={token.symbol}
              className="btn btn-outline justify-between items-center px-4 py-3 rounded-lg hover:bg-base-200 transition"
              onClick={() => {
                onSelect(token);
                onClose();
              }}
            >
              {/* Token info */}
              <div className="flex items-center gap-3">
                <Image
                  src={`/tokens/${token.symbol}.svg`}
                  alt={token.symbol}
                  className="w-6 h-6"
                  aria-hidden="true"
                  width={40}
                  height={40}
                />
                <div className="text-left">
                  <div className="font-medium">{token.name}</div>
                  <div className="text-xs text-gray-400">{token.symbol}</div>
                </div>
              </div>

              {/* Truncated address */}
              <span className="text-xs text-gray-400">
                {token.address.slice(0, 6)}...{token.address.slice(-4)}
              </span>
            </button>
          ))}
        </div>

        {/* Close button */}
        <button className="btn btn-ghost w-full rounded-full" onClick={onClose} aria-label="Cancelar selección">
          Cancelar
        </button>
      </div>
    </div>
  );
};
