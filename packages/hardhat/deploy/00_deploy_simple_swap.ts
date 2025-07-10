import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { network } from "hardhat";

/**
 * @description Deployment function for TokenA, TokenB, and SimpleSwap contracts.
 * Implements best practices including:
 * - Centralized configuration
 * - Robust error handling
 * - Conditional contract verification
 * - Clear documentation
 */
const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Get accounts and environment settings
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Determine if we're on a local development network
  const isLocalNetwork = ["localhost", "hardhat"].includes(network.name);

  // Common deployment configuration for all contracts
  const deployOptions = {
    from: deployer,
    log: true,
    autoMine: isLocalNetwork, // Auto-mining only on local networks
    waitConfirmations: isLocalNetwork ? 1 : 5, // Fewer confirmations on local networks
  };

  // 1. Deploy TokenA
  const tokenA = await deploy("TokenA", {
    ...deployOptions,
    args: [deployer], // Pass deployer as initial token owner
  });

  console.log(`✅ TokenA deployed at: ${tokenA.address}`);

  // 2. Deploy TokenB (similar to TokenA)
  const tokenB = await deploy("TokenB", {
    ...deployOptions,
    args: [deployer],
  });

  console.log(`✅ TokenB deployed at: ${tokenB.address}`);

  // 3. Deploy SimpleSwap (no constructor arguments)
  const simpleSwap = await deploy("SimpleSwap", {
    ...deployOptions,
    args: [],
  });

  console.log(`✅ SimpleSwap deployed at: ${simpleSwap.address}`);

  // Contract verification on block explorers (only on live networks)
  if (!isLocalNetwork) {
    await verifyContracts(hre, {
      tokenA: { address: tokenA.address, args: [deployer] },
      tokenB: { address: tokenB.address, args: [deployer] },
      simpleSwap: { address: simpleSwap.address, args: [] },
    });
  }
};

/**
 * @description Verifies contracts on the corresponding block explorer
 * @param hre - Hardhat Runtime Environment
 * @param contracts - Object containing contract verification information
 */
async function verifyContracts(
  hre: HardhatRuntimeEnvironment,
  contracts: Record<string, { address: string; args: any[] }>,
) {
  console.log("⏳ Verifying contracts...");

  try {
    for (const [name, contract] of Object.entries(contracts)) {
      await hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: contract.args,
      });
      console.log(`✅ ${name} verified successfully`);
    }
  } catch (error: any) {
    console.error(`⚠️ Verification error for contract: ${error.message}`);
  }
}

// Tags to identify and filter this deployment script
deployContracts.tags = ["TokenA", "TokenB", "SimpleSwap"];

// Export the function as default module
export default deployContracts;
