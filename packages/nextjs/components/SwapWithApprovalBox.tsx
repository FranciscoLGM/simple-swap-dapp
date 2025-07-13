import { useEffect, useState } from "react";
import Image from "next/image";
import { TokenOption, TokenSelectorModal } from "./TokenSelectorModal";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { Address, formatUnits, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useGlobalErrorToast } from "~~/hooks/simple-swap/useGlobalErrorToast";
import { formatDecimalInput } from "~~/utils/simple-swap/parseInput";
import { parseViemErrorToMessage } from "~~/utils/simple-swap/parseViemErrorToMessage";

const AVAILABLE_TOKENS: TokenOption[] = [
  { symbol: "TKA", name: "TokenA", address: "0xc05C57BA153A2903977cdaa0E54e58d45ac349ED" },
  { symbol: "TKB", name: "TokenB", address: "0x84B42E3fE2312fBf9F1C7e7ad80BdF67bBE09Ac4" },
];

// ⚠️ Fix tipos para contractName
type TokenContractName = "TokenA" | "TokenB";
const symbolToContractName: Record<string, TokenContractName> = {
  TKA: "TokenA",
  TKB: "TokenB",
};

interface Props {
  spender: Address;
}

export const SwapWithApprovalBox: React.FC<Props> = ({ spender }) => {
  const { address } = useAccount();

  const [tokenIn, setTokenIn] = useState(AVAILABLE_TOKENS[0]);
  const [tokenOut, setTokenOut] = useState(AVAILABLE_TOKENS[1]);
  const [selecting, setSelecting] = useState<"in" | "out" | null>(null);

  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [lastEditedInput, setLastEditedInput] = useState<"in" | "out">("in");

  const [allowanceOk, setAllowanceOk] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const slippage = 0.005;
  const isSameToken = tokenIn.address === tokenOut.address;
  const isFormValid = Number(amountIn) > 0 && !isSameToken;

  const tokenInContractName = symbolToContractName[tokenIn.symbol];

  const { writeContractAsync: approve } = useScaffoldWriteContract({
    contractName: tokenInContractName,
  });

  const { writeContractAsync: swap } = useScaffoldWriteContract({ contractName: "SimpleSwap" });

  const { data: allowance, error: allowanceError } = useScaffoldReadContract({
    contractName: tokenInContractName,
    functionName: "allowance",
    args: [address!, spender],
    watch: true,
  });

  const { data: reserves, error: reservesError } = useScaffoldReadContract({
    contractName: "SimpleSwap",
    functionName: "getReserves",
    args: [tokenIn.address, tokenOut.address],
    watch: true,
  });

  useGlobalErrorToast(allowanceError);
  useGlobalErrorToast(reservesError);

  // Validar allowance
  useEffect(() => {
    try {
      if (!allowance || !amountIn || isNaN(Number(amountIn))) return setAllowanceOk(false);
      const parsed = parseEther(amountIn);
      setAllowanceOk(BigInt(allowance) >= parsed);
    } catch {
      setAllowanceOk(false);
    }
  }, [allowance, amountIn]);

  // Recalcular el otro valor según el input editado
  useEffect(() => {
    if (!reserves || !tokenIn || !tokenOut) return;
    const [reserveIn, reserveOut] = reserves;

    if (reserveIn === 0n || reserveOut === 0n) return;

    try {
      if (lastEditedInput === "in" && amountIn) {
        const input = parseEther(amountIn);
        const out = (input * reserveOut) / (reserveIn + input);
        const outMin = out - (out * BigInt(Math.floor(slippage * 10000))) / 10000n;
        setAmountOut(formatDecimalInput(formatUnits(outMin, 18), 3));
      }

      if (lastEditedInput === "out" && amountOut) {
        const output = parseEther(amountOut);
        if (output >= reserveOut) {
          toast.error("No hay suficiente liquidez disponible");
          return;
        }
        const input = (output * reserveIn) / (reserveOut - output);
        const inputMax = input + (input * BigInt(Math.floor(slippage * 10000))) / 10000n;
        setAmountIn(formatDecimalInput(formatUnits(inputMax, 18), 6));
      }
    } catch (err) {
      console.error("Error en el cálculo de swap:", err);
    }
  }, [reserves, amountIn, amountOut, lastEditedInput, tokenIn, tokenOut]);

  const handleSwap = async () => {
    if (!isFormValid || !address) return;

    try {
      const parsedIn = parseEther(amountIn);
      const parsedMinOut = parseEther(amountOut);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 180);

      if (!allowanceOk) {
        setIsApproving(true);
        const toastId = toast.loading("Aprobando token...");
        await approve({ functionName: "approve", args: [spender, parsedIn] });
        toast.dismiss(toastId);
        toast.success("Token aprobado");
        setAllowanceOk(true);
      }

      setIsSwapping(true);
      const toastId = toast.loading("Realizando swap...");

      await swap({
        functionName: "swapExactTokensForTokens",
        args: [parsedIn, parsedMinOut, [tokenIn.address, tokenOut.address], address, deadline],
      });

      toast.dismiss(toastId);
      toast.success("Swap exitoso");
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });

      setAmountIn("");
      setAmountOut("");
    } catch (err) {
      toast.error(parseViemErrorToMessage(err));
    } finally {
      setIsApproving(false);
      setIsSwapping(false);
    }
  };

  const switchTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setLastEditedInput("in");
    setAmountOut("");
  };

  return (
    <div className="card rounded-2xl shadow-xl bg-base-200 p-6 space-y-4 max-w-md w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Input token */}
      <div className="bg-base-300 p-4 rounded-xl">
        <label className="text-sm text-gray-400">Vender</label>
        <div className="flex items-center gap-2 mt-1">
          <input
            className="input input-bordered bg-base-100 text-lg w-full"
            placeholder="0.0"
            type="number"
            step="any"
            value={amountIn}
            onChange={e => {
              setAmountIn(formatDecimalInput(e.target.value, 6));
              setLastEditedInput("in");
            }}
            disabled={isApproving || isSwapping}
          />
          <button className="btn btn-outline w-32 flex items-center gap-2" onClick={() => setSelecting("in")}>
            <Image src={`/tokens/${tokenIn.symbol}.svg`} alt={tokenIn.symbol} width={24} height={24} />
            {tokenIn.symbol}
          </button>
        </div>
      </div>

      {/* Switch button */}
      <div className="flex justify-center">
        <button className="btn btn-circle btn-sm" onClick={switchTokens} disabled={isApproving || isSwapping}>
          <Image src="/arrow.svg" alt="switch" width={12.5} height={20} />
        </button>
      </div>

      {/* Output token */}
      <div className="bg-base-300 p-4 rounded-xl">
        <label className="text-sm text-gray-400">Comprar</label>
        <div className="flex items-center gap-2 mt-1">
          <input
            className="input input-bordered bg-base-100 text-lg w-full"
            placeholder="0.0"
            type="number"
            step="any"
            value={amountOut}
            onChange={e => {
              setAmountOut(formatDecimalInput(e.target.value, 6));
              setLastEditedInput("out");
            }}
            disabled={isApproving || isSwapping}
          />
          <button className="btn btn-outline w-32 flex items-center gap-2" onClick={() => setSelecting("out")}>
            <Image src={`/tokens/${tokenOut.symbol}.svg`} alt={tokenOut.symbol} width={24} height={24} />
            {tokenOut.symbol}
          </button>
        </div>
      </div>

      {/* Rate */}
      <p className="text-xs text-center text-gray-400 mt-2">
        1 {tokenIn.symbol} ≈{" "}
        {reserves && reserves[0] !== 0n && reserves[1] !== 0n
          ? formatDecimalInput((Number(reserves[1]) / Number(reserves[0])).toFixed(6))
          : "-"}{" "}
        {tokenOut.symbol}
      </p>

      {/* Error */}
      {isSameToken && (
        <p className="text-error text-sm mt-2">❌ No puedes seleccionar el mismo token para ambos lados.</p>
      )}

      {/* Swap button */}
      <button
        className="btn btn-primary w-full py-3 text-lg"
        disabled={!isFormValid || isApproving || isSwapping}
        onClick={handleSwap}
      >
        {isApproving ? "Aprobando..." : isSwapping ? "Intercambiando..." : "Intercambiar"}
        {(isApproving || isSwapping) && <span className="loading loading-spinner loading-sm ml-2" />}
      </button>

      {/* Modal */}
      <TokenSelectorModal
        isOpen={selecting !== null}
        onClose={() => setSelecting(null)}
        onSelect={token => {
          if (selecting === "in") setTokenIn(token);
          if (selecting === "out") setTokenOut(token);
          setSelecting(null);
        }}
        tokenList={AVAILABLE_TOKENS}
      />
    </div>
  );
};
