# 🚀 Quick Start Guide

## Step 1: Upgrade Node.js (IMPORTANT)

Your system has Node.js v14.17.3, but this project requires v14.18.0+.

**Quick Fix:**
- Download Node.js v18.x from https://nodejs.org/
- Install it (restart PowerShell after)
- Verify: `node --version` (should show v18.x)

## Step 2: Install Dependencies

```powershell
cd c:\Users\Major\BlockchainTest
npm install
```

This installs:
- Hardhat (development framework)
- ethers.js (blockchain library)
- Waffle (testing framework)

## Step 3: Compile Contracts

```powershell
npm run compile
```

Output should show: `✔ 2 Solidity files compiled successfully`

## Step 4: Start Local Blockchain

**Terminal 1:**
```powershell
npm run node
```

Keep this running (you'll see "Listening on 127.0.0.1:8545")

## Step 5: Deploy Contracts

**Terminal 2:**
```powershell
npm run deploy
```

You'll see:
```
✅ POSToken deployed to: 0x5FbDB2315678afccda05de7C4ADE539A34cFFb2b
✅ POSSystem deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

## Step 6: Test the System

**Same Terminal:**
```powershell
npm run interact
```

This demonstrates:
- Distributing tokens
- Creating an order
- Processing payment
- Merchant withdrawal
- Final balances

## 📖 Available Commands

```powershell
npm run compile          # Compile smart contracts
npm run test            # Run all tests (20+ test cases)
npm run deploy          # Deploy to local network
npm run interact        # Run example transactions
npm run node            # Start local blockchain
npm run accounts        # Show 20 test accounts
npm run deploy-sepolia  # Deploy to Sepolia testnet
```

## 🎯 What Each File Does

| File | Purpose |
|------|---------|
| `contracts/POSToken.sol` | ERC20 token (1M supply) |
| `contracts/POSSystem.sol` | Main POS system logic |
| `scripts/deploy.js` | Automated deployment |
| `scripts/interact.js` | Example workflow |
| `test/pos.test.js` | 20+ test cases |
| `hardhat.config.js` | Development setup |

## 🔍 Understanding the System

### 1. **Token (POSToken.sol)**
- Like digital money for your POS system
- 1 million tokens available
- Can be transferred and spent

### 2. **POS System (POSSystem.sol)**
- Takes orders from customers
- Processes payments
- Keeps merchant funds safe
- Takes 2% platform fee

### 3. **Workflow**
```
Customer → Create Order → Approve Payment → Complete Payment
                                              ↓
                                         Deduct Platform Fee
                                              ↓
                                         Update Merchant Balance
                                              ↓
                                         Merchant Withdraws Funds
```

## 💡 Example: Create Your Own Transaction

Create a file `scripts/custom.js`:

```javascript
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const deployments = JSON.parse(fs.readFileSync("deployments.json", "utf8"));
  const [customer] = await ethers.getSigners();
  
  const POSSystem = await hre.ethers.getContractFactory("POSSystem");
  const posSystem = POSSystem.attach(deployments.POSSystem);
  
  // Create your order
  await posSystem.createOrder(
    "0xMerchantAddress",
    ["Pizza", "Soda"],
    [1, 2],
    [hre.ethers.parseEther("15"), hre.ethers.parseEther("3")]
  );
  
  console.log("Order created!");
}

main().catch(console.error);
```

Run it: `npx hardhat run scripts/custom.js`

## ✅ Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module 'node:os'" | Upgrade Node.js to v18.x |
| "Python is not set" | Can be ignored, has fallback |
| "deployments.json not found" | Run `npm run deploy` first |
| "Insufficient allowance" | Run full `npm run interact` |
| Port 8545 already in use | Change port in `hardhat.config.js` |

## 📚 Full Documentation

- **Complete Guide**: [README.md](README.md)
- **Setup Help**: [SETUP.md](SETUP.md)
- **Project Details**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- **Dev Guidelines**: [.github/copilot-instructions.md](.github/copilot-instructions.md)

## 🔗 Smart Contract Details

### POSToken Functions
```javascript
mint(to, amount)              // Create new tokens
burn(amount)                  // Destroy your tokens
transfer(to, amount)          // Send tokens
approve(spender, amount)      // Allow contract to spend
```

### POSSystem Functions
```javascript
createOrder(merchant, items, quantities, prices)  // Place order
completePayment(orderId)                          // Pay for order
withdrawFunds()                                   // Get merchant money
cancelOrder(orderId)                              // Cancel pending order
getOrder(orderId)                                 // View order details
```

## 🎓 Next Steps

1. **Run tests**: `npm run test` (validate everything works)
2. **Explore code**: Look at `contracts/POSSystem.sol` (main logic)
3. **Create transactions**: Write custom scripts in `scripts/`
4. **Deploy to testnet**: See [SETUP.md](SETUP.md) for Sepolia
5. **Study examples**: Check `test/pos.test.js` for usage patterns

## 📞 Need Help?

1. Check the relevant .md file for your issue
2. Run `npm run test` to verify everything
3. Review `scripts/interact.js` for working examples
4. Check Hardhat docs: https://hardhat.org

---

**You're all set!** 🎉 Start with Step 1 and follow through Step 6.
