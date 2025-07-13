import { FC, useState } from "react";
import { AddLiquidityWithApprovalForm } from "./AddLiquidityWithApprovalForm";
import { RemoveLiquidityWithApprovalForm } from "./RemoveLiquidityWithApprovalForm";
import { Address } from "viem";

interface Props {
  tokenA: Address;
  tokenB: Address;
  lpTokenContract: "SimpleSwap";
  spender: Address;
}

export const LiquidityTabs: FC<Props> = ({ tokenA, tokenB, lpTokenContract, spender }) => {
  const [activeTab, setActiveTab] = useState<"add" | "remove">("add");

  const tabStyle = "tab transition-all duration-200";

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div role="tablist" className="tabs tabs-boxed justify-center">
        <button
          className={`${tabStyle} ${activeTab === "add" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("add")}
        >
          Agregar
        </button>
        <button
          className={`${tabStyle} ${activeTab === "remove" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("remove")}
        >
          Remover
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {activeTab === "add" && <AddLiquidityWithApprovalForm tokenA={tokenA} tokenB={tokenB} spender={spender} />}
        {activeTab === "remove" && (
          <RemoveLiquidityWithApprovalForm
            tokenA={tokenA}
            tokenB={tokenB}
            lpTokenContract={lpTokenContract}
            spender={spender}
          />
        )}
      </div>
    </div>
  );
};
