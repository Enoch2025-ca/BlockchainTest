const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy POSToken
  console.log("\n📝 Deploying POSToken...");
  const POSToken = await hre.ethers.getContractFactory("POSToken");
  const initialSupply = hre.ethers.parseEther("1000000"); // 1 million tokens
  const posToken = await POSToken.deploy(initialSupply);
  await posToken.waitForDeployment();

  const tokenAddress = await posToken.getAddress();
  console.log("✅ POSToken deployed to:", tokenAddress);

  // Deploy POSSystem
  console.log("\n📝 Deploying POSSystem...");
  const POSSystem = await hre.ethers.getContractFactory("POSSystem");
  const posSystem = await POSSystem.deploy(tokenAddress);
  await posSystem.waitForDeployment();

  const systemAddress = await posSystem.getAddress();
  console.log("✅ POSSystem deployed to:", systemAddress);

  // Display deployment info
  console.log("\n" + "=".repeat(50));
  console.log("📊 DEPLOYMENT SUMMARY");
  console.log("=".repeat(50));
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("POSToken Address:", tokenAddress);
  console.log("POSSystem Address:", systemAddress);
  console.log("Initial Supply:", hre.ethers.formatEther(initialSupply), "POS");
  console.log("=".repeat(50) + "\n");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    POSToken: tokenAddress,
    POSSystem: systemAddress,
    initialSupply: hre.ethers.formatEther(initialSupply),
    deployedAt: new Date().toISOString(),
  };

  const fs = require("fs");
  fs.writeFileSync(
    "deployments.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("✅ Deployment info saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
