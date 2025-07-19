"use client";

import { Fragment } from "react";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { motion } from "framer-motion";

export interface TokenOption {
  name: string;
  symbol: string;
  address: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: TokenOption) => void;
  tokenList: TokenOption[];
}

export const TokenSelectorModal = ({ isOpen, onClose, onSelect, tokenList }: Props) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-4 scale-95"
          >
            <motion.div className="w-full max-w-md rounded-xl bg-base-200 p-4 shadow-xl border border-base-300">
              <Dialog.Title as="h2" className="text-base font-semibold text-center mb-3">
                Selecciona un token
              </Dialog.Title>

              <ul className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-1">
                {tokenList.map(token => (
                  <li key={token.address}>
                    <button
                      onClick={() => {
                        onSelect(token);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors duration-200 hover:bg-primary hover:text-primary-content bg-base-100 border border-base-300 shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={`/tokens/${token.symbol}.svg`}
                          alt={token.symbol}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <div className="text-left">
                          <p className="font-medium text-sm">{token.name}</p>
                          <p className="text-xs text-gray-500">{token.symbol}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 truncate max-w-[72px] text-right">
                        {token.address.slice(0, 6)}...{token.address.slice(-4)}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
