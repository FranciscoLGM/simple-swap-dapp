import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { network } from "hardhat";

/**
 * Deploys three contracts:
 * 1. TokenA - ERC20 with fixed supply
 * 2. TokenB - ERC20 with fixed supply
 * 3. SimpleSwap - Uniswap V2 style DEX
 */
const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const isLocalNetwork = network.name === "localhost" || network.name === "hardhat";

  // Deploy TokenA
  const tokenA = await deploy("TokenA", {
    from: deployer,
    args: [deployer], // initialOwner receives total supply
    log: true,
    autoMine: true,
    waitConfirmations: isLocalNetwork ? 1 : 5,
  });

  console.log(`✅ TokenA deployed at: ${tokenA.address}`);

  // Deploy TokenB
  const tokenB = await deploy("TokenB", {
    from: deployer,
    args: [deployer], // initialOwner receives total supply
    log: true,
    autoMine: true,
    waitConfirmations: isLocalNetwork ? 1 : 5,
  });

  console.log(`✅ TokenB deployed at: ${tokenB.address}`);

  // Deploy SimpleSwap
  const simpleSwap = await deploy("SimpleSwap", {
    from: deployer,
    args: [], // No constructor arguments
    log: true,
    autoMine: true,
    waitConfirmations: isLocalNetwork ? 1 : 5,
  });

  console.log(`✅ SimpleSwap deployed at: ${simpleSwap.address}`);

  // Verify contracts on Etherscan (for live networks only)
  if (!isLocalNetwork) {
    try {
      console.log("🔄 Verifying TokenA on Etherscan...");
      await hre.run("verify:verify", {
        address: tokenA.address,
        constructorArguments: [deployer],
      });

      console.log("🔄 Verifying TokenB on Etherscan...");
      await hre.run("verify:verify", {
        address: tokenB.address,
        constructorArguments: [deployer],
      });

      console.log("🔄 Verifying SimpleSwap on Etherscan...");
      await hre.run("verify:verify", {
        address: simpleSwap.address,
        constructorArguments: [],
      });

      console.log("✅ All contracts verified successfully!");
    } catch (error) {
      console.log("⚠️ Verification error:", error instanceof Error ? error.message : error);
    }
  }
};

export default deployContracts;

// Tags allow you to deploy individual contracts
deployContracts.tags = ["TokenA", "TokenB", "SimpleSwap"];
