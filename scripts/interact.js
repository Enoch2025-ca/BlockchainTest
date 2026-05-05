const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔌 Connecting to POS System...\n");

  const [owner, merchant, customer] = await ethers.getSigners();

  // Load deployment info
  let deployments = {};
  try {
    deployments = JSON.parse(fs.readFileSync("deployments.json", "utf8"));
  } catch (error) {
    console.error("❌ deployments.json not found. Please run: npm run deploy");
    process.exit(1);
  }

  const tokenAddress = deployments.POSToken;
  const systemAddress = deployments.POSSystem;

  console.log("📋 Account Information:");
  console.log("  Owner:", owner.address);
  console.log("  Merchant:", merchant.address);
  console.log("  Customer:", customer.address);
  console.log();

  // Get contract instances
  const POSToken = await hre.ethers.getContractFactory("POSToken");
  const posToken = POSToken.attach(tokenAddress);

  const POSSystem = await hre.ethers.getContractFactory("POSSystem");
  const posSystem = POSSystem.attach(systemAddress);

  // Check token balances
  console.log("💰 Initial Token Balances:");
  const ownerBalance = await posToken.balanceOf(owner.address);
  const customerBalance = await posToken.balanceOf(customer.address);
  console.log("  Owner:", hre.ethers.formatEther(ownerBalance), "POS");
  console.log("  Customer:", hre.ethers.formatEther(customerBalance), "POS");
  console.log();

  // Distribute tokens to customer
  console.log("📤 Distributing tokens to customer...");
  const distributeAmount = hre.ethers.parseEther("1000");
  let tx = await posToken
    .connect(owner)
    .transfer(customer.address, distributeAmount);
  await tx.wait();
  console.log("✅ Transferred", hre.ethers.formatEther(distributeAmount), "POS to customer");
  console.log();

  // Approve POS System to spend customer tokens
  console.log("🔐 Approving POS System to spend tokens...");
  const approveAmount = hre.ethers.parseEther("10000");
  tx = await posToken
    .connect(customer)
    .approve(systemAddress, approveAmount);
  await tx.wait();
  console.log("✅ Approved", hre.ethers.formatEther(approveAmount), "POS");
  console.log();

  // Create an order
  console.log("🛒 Creating a new order...");
  const itemNames = ["Coffee", "Sandwich", "Juice"];
  const quantities = [2, 1, 1];
  const pricesPerUnit = [
    hre.ethers.parseEther("5"),
    hre.ethers.parseEther("10"),
    hre.ethers.parseEther("3"),
  ];

  tx = await posSystem
    .connect(customer)
    .createOrder(merchant.address, itemNames, quantities, pricesPerUnit);
  const receipt = await tx.wait();

  console.log("✅ Order created");
  console.log("  Order ID: 0");
  console.log("  Items:");
  for (let i = 0; i < itemNames.length; i++) {
    const totalPrice = quantities[i] * pricesPerUnit[i];
    console.log(
      `    - ${itemNames[i]}: ${quantities[i]} x ${hre.ethers.formatEther(pricesPerUnit[i])} = ${hre.ethers.formatEther(totalPrice)} POS`
    );
  }
  const totalAmount = pricesPerUnit.reduce((sum, price, i) => {
    return sum + price * BigInt(quantities[i]);
  }, 0n);
  console.log("  Total:", hre.ethers.formatEther(totalAmount), "POS");
  console.log();

  // Get order details
  console.log("📖 Retrieving order details...");
  const order = await posSystem.getOrder(0);
  console.log("✅ Order Status:", order.status === 0 ? "Pending" : order.status);
  console.log();

  // Complete payment
  console.log("💳 Completing payment...");
  tx = await posSystem.connect(customer).completePayment(0);
  await tx.wait();
  console.log("✅ Payment completed!");
  console.log();

  // Check merchant balance
  console.log("💳 Merchant Balance Check:");
  const merchantBalance = await posSystem.getMerchantBalance(merchant.address);
  const platformFee = (totalAmount * 2n) / 100n; // 2% fee
  const merchantReceive = totalAmount - platformFee;
  console.log("  Total Amount:", hre.ethers.formatEther(totalAmount), "POS");
  console.log("  Platform Fee (2%):", hre.ethers.formatEther(platformFee), "POS");
  console.log("  Merchant Receives:", hre.ethers.formatEther(merchantReceive), "POS");
  console.log("  Merchant Balance:", hre.ethers.formatEther(merchantBalance), "POS");
  console.log();

  // Merchant withdraws funds
  console.log("🏦 Withdrawing merchant funds...");
  tx = await posSystem.connect(merchant).withdrawFunds();
  await tx.wait();
  console.log("✅ Funds withdrawn!");
  console.log();

  // Final balances
  console.log("💰 Final Token Balances:");
  const finalCustomerBalance = await posToken.balanceOf(customer.address);
  const finalMerchantBalance = await posToken.balanceOf(merchant.address);
  console.log("  Customer:", hre.ethers.formatEther(finalCustomerBalance), "POS");
  console.log("  Merchant:", hre.ethers.formatEther(finalMerchantBalance), "POS");
  console.log();

  console.log("✅ Transaction completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
