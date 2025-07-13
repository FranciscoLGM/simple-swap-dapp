import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { Address, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useGlobalErrorToast } from "~~/hooks/simple-swap/useGlobalErrorToast";
import { formatDecimalInput } from "~~/utils/simple-swap/parseInput";
import { parseViemErrorToMessage } from "~~/utils/simple-swap/parseViemErrorToMessage";

interface Props {
  tokenA: Address;
  tokenB: Address;
  spender: Address;
}

export const AddLiquidityWithApprovalForm = ({ tokenA, tokenB, spender }: Props) => {
  const { address } = useAccount();

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [allowanceAOk, setAllowanceAOk] = useState(false);
  const [allowanceBOk, setAllowanceBOk] = useState(false);

  const isFormValid = Number(amountA) > 0 && Number(amountB) > 0;

  const { writeContractAsync: approveTokenA } = useScaffoldWriteContract({ contractName: "TokenA" });
  const { writeContractAsync: approveTokenB } = useScaffoldWriteContract({ contractName: "TokenB" });
  const { writeContractAsync: addLiquidity } = useScaffoldWriteContract({ contractName: "SimpleSwap" });

  const { data: allowanceA, error: errorA } = useScaffoldReadContract({
    contractName: "TokenA",
    functionName: "allowance",
    args: [address!, spender],
    watch: true,
  });

  const { data: allowanceB, error: errorB } = useScaffoldReadContract({
    contractName: "TokenB",
    functionName: "allowance",
    args: [address!, spender],
    watch: true,
  });

  useGlobalErrorToast(errorA);
  useGlobalErrorToast(errorB);

  // Validar allowance para TokenA
  useEffect(() => {
    try {
      if (!allowanceA || !amountA) return setAllowanceAOk(false);
      const parsed = parseEther(amountA);
      setAllowanceAOk(BigInt(allowanceA) >= parsed);
    } catch {
      setAllowanceAOk(false);
    }
  }, [allowanceA, amountA]);

  // Validar allowance para TokenB
  useEffect(() => {
    try {
      if (!allowanceB || !amountB) return setAllowanceBOk(false);
      const parsed = parseEther(amountB);
      setAllowanceBOk(BigInt(allowanceB) >= parsed);
    } catch {
      setAllowanceBOk(false);
    }
  }, [allowanceB, amountB]);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      if (!allowanceAOk && amountA) {
        const parsedA = parseEther(amountA);
        const toastId = toast.loading("Aprobando TKA...");
        await approveTokenA({ functionName: "approve", args: [spender, parsedA] });
        toast.dismiss(toastId);
        toast.success("TKA aprobado");
        setAllowanceAOk(true);
      }

      if (!allowanceBOk && amountB) {
        const parsedB = parseEther(amountB);
        const toastId = toast.loading("Aprobando TKB...");
        await approveTokenB({ functionName: "approve", args: [spender, parsedB] });
        toast.dismiss(toastId);
        toast.success("TKB aprobado");
        setAllowanceBOk(true);
      }
    } catch (err) {
      toast.error(parseViemErrorToMessage(err));
    } finally {
      setIsApproving(false);
    }
  };

  const handleAddLiquidity = async () => {
    if (!isFormValid || !address || isApproving || isAdding) return;

    const parsedA = parseEther(amountA);
    const parsedB = parseEther(amountB);
    const amountAMin = 0n;
    const amountBMin = 0n;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 180); // 3 minutos

    try {
      if (!allowanceAOk || !allowanceBOk) {
        await handleApprove();
      }

      setIsAdding(true);
      const toastId = toast.loading("Agregando liquidez...");

      await addLiquidity({
        functionName: "addLiquidity",
        args: [tokenA, tokenB, parsedA, parsedB, amountAMin, amountBMin, address, deadline],
      });

      toast.dismiss(toastId);
      toast.success("Liquidez añadida");
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
      setAmountA("");
      setAmountB("");
    } catch (err) {
      toast.error(parseViemErrorToMessage(err));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="card bg-base-200 p-6 rounded-2xl shadow-lg max-w-md w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Agregar Liquidez</h2>

        <div className="form-control">
          <label className="label">Cantidad de TKA</label>
          <input
            className="input input-bordered w-full"
            type="number"
            placeholder="0.0"
            value={amountA}
            onChange={e => setAmountA(formatDecimalInput(e.target.value))}
            disabled={isApproving || isAdding}
          />
          {allowanceAOk && <p className="text-xs text-green-500 mt-1">✔ TokenA aprobado</p>}
        </div>

        <div className="form-control">
          <label className="label">Cantidad de TKB</label>
          <input
            className="input input-bordered w-full"
            type="number"
            placeholder="0.0"
            value={amountB}
            onChange={e => setAmountB(formatDecimalInput(e.target.value))}
            disabled={isApproving || isAdding}
          />
          {allowanceBOk && <p className="text-xs text-green-500 mt-1">✔ TokenB aprobado</p>}
        </div>

        <button
          className="btn btn-primary w-full"
          onClick={handleAddLiquidity}
          disabled={!isFormValid || isApproving || isAdding}
        >
          {isApproving ? "Aprobando..." : isAdding ? "Añadiendo..." : "Agregar Liquidez"}
          {(isApproving || isAdding) && <span className="loading loading-spinner loading-sm ml-2" />}
        </button>
      </div>
    </div>
  );
};
