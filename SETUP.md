# Setup and Installation Guide

## Prerequisites

### Node.js Version Requirement
This project requires **Node.js v14.18.0 or higher** (preferably v16.x LTS or v18.x LTS).

**Current Issue**: Your system has Node.js v14.17.3, which is below the minimum required version.

### How to Upgrade Node.js

#### Option 1: Using Node Version Manager (nvm-windows)
1. Download nvm-windows: https://github.com/coreybutler/nvm-windows/releases
2. Install nvm-windows
3. Open PowerShell and run:
   ```powershell
   nvm install 18.18.0
   nvm use 18.18.0
   ```

#### Option 2: Direct Download
1. Go to https://nodejs.org/
2. Download Node.js v18.x LTS (or v16.x LTS)
3. Run the installer
4. Close and reopen PowerShell

#### Option 3: Using Chocolatey
```powershell
choco upgrade nodejs
```

### Verify Installation
```powershell
node --version  # Should be v14.18.0+
npm --version
```

## Installation Steps (After Node.js Upgrade)

### 1. Install Dependencies
```bash
cd c:\Users\Major\BlockchainTest
npm install
```

If you encounter Python-related errors during installation, these can usually be ignored as there are fallback implementations. If you want to suppress these warnings, you can use:
```bash
npm install --build-from-source=false
```

### 2. Compile Contracts
```bash
npm run compile
```

Expected output should show:
```
✔ 2 Solidity files compiled successfully
```

### 3. Start Local Blockchain
```bash
npm run node
```

In a new terminal, keep this running.

### 4. Deploy Contracts
```bash
npm run deploy
```

Expected output:
```
✅ POSToken deployed to: 0x...
✅ POSSystem deployed to: 0x...
```

### 5. Test the System
```bash
npm run interact
```

## Troubleshooting

### "Cannot find module 'node:os'"
- **Cause**: Node.js version too old
- **Solution**: Upgrade to Node.js v14.18.0 or higher

### "Python is not set from command line"
- **Cause**: Optional native modules need Python
- **Solution**: This warning can be ignored; fallback implementations are used

### "deployments.json not found"
- **Cause**: Contracts haven't been deployed yet
- **Solution**: Run `npm run deploy` first

### "Insufficient allowance"
- **Cause**: Tokens need approval before spending
- **Solution**: The `interact.js` script handles this automatically

## Next Steps

After successful installation:

1. **Run Tests**: `npm run test` - Validates all smart contract functionality
2. **Deploy to Testnet**: Follow the README.md for Sepolia deployment
3. **Create Custom Scripts**: Create new scripts in `scripts/` directory
4. **Explore Contracts**: Review `contracts/POSToken.sol` and `contracts/POSSystem.sol`

## Support

For more information:
- Hardhat: https://hardhat.org/docs
- Ethers.js: https://docs.ethers.org/
- Solidity: https://docs.soliditylang.org/
