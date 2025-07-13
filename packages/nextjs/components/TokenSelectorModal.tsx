import { FC, useEffect } from "react";
import Image from "next/image";
import { Address } from "viem";

/**
 * Representa un token en la lista
 */
export interface TokenOption {
  symbol: string;
  name: string;
  address: Address;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: TokenOption) => void;
  tokenList: TokenOption[];
}

/**
 * Modal visualmente optimizado para selección de tokens.
 */
export const TokenSelectorModal: FC<Props> = ({ isOpen, onClose, onSelect, tokenList }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Selector de token"
    >
      <div className="bg-base-100 p-6 rounded-2xl shadow-lg w-full max-w-sm space-y-6 animate-in slide-in-from-bottom-4 duration-300">
        <h3 className="text-lg font-semibold">Seleccionar token</h3>

        <div className="flex flex-col gap-3">
          {tokenList.map(token => (
            <button
              key={token.symbol}
              className="btn btn-outline justify-between items-center px-4 py-3 rounded-lg hover:bg-base-200 transition whitespace-nowrap"
              onClick={() => {
                onSelect(token);
                onClose();
              }}
            >
              {/* Columna izquierda: icono + nombre/símbolo */}
              <div className="flex items-center gap-3 min-w-0">
                <Image
                  src={`/tokens/${token.symbol}.svg`}
                  alt={token.symbol}
                  className="w-6 h-6 shrink-0"
                  aria-hidden="true"
                  width={24}
                  height={24}
                />
                <div className="text-left min-w-0 truncate">
                  <div className="truncate font-medium text-base-content">{token.name}</div>
                  <div className="text-xs text-gray-400 truncate">{token.symbol}</div>
                </div>
              </div>

              {/* Dirección truncada (visible en sm+) */}
              <span className="text-xs text-gray-400 hidden sm:inline-block">
                {token.address.slice(0, 6)}...{token.address.slice(-4)}
              </span>
            </button>
          ))}
        </div>

        <button className="btn btn-ghost w-full rounded-full" onClick={onClose} aria-label="Cancelar selección">
          Cancelar
        </button>
      </div>
    </div>
  );
};
