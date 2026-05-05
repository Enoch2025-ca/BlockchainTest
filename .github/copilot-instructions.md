# Blockchain POS System - Development Instructions

## Project Overview

This is a complete blockchain Point of Sale (POS) system built with:
- **Solidity**: Smart contracts for ERC20 token and POS functionality
- **Hardhat**: Development environment for Ethereum
- **ethers.js**: JavaScript library for blockchain interaction
- **Node.js**: Backend runtime for deployment and interaction scripts

## Project Structure

```
blockchain-pos-system/
├── contracts/              # Solidity smart contracts
│   ├── POSToken.sol       # ERC20 token contract
│   └── POSSystem.sol      # Main POS system contract
├── scripts/               # Deployment and interaction scripts
│   ├── deploy.js          # Contract deployment
│   └── interact.js        # Transaction examples
├── test/                  # Unit tests
│   └── pos.test.js        # Comprehensive test suite
├── hardhat.config.js      # Hardhat configuration
├── package.json           # Dependencies
└── README.md              # Full documentation
```

## Key Features

1. **ERC20 Token System** - Custom token for transactions
2. **Order Management** - Create and track orders with multiple items
3. **Payment Processing** - Secure token transfers with reentrancy protection
4. **Merchant Accounts** - Fund management and withdrawal system
5. **Platform Fees** - Configurable percentage-based fees
6. **Complete History** - Track all transactions for both customers and merchants

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Blockchain
```bash
npm run node
```

### 3. Deploy Contracts (in new terminal)
```bash
npm run deploy
```

### 4. Test the System
```bash
npm run interact
```

## Common Commands

- `npm run compile` - Compile Solidity contracts
- `npm run test` - Run unit tests
- `npm run deploy` - Deploy to local Hardhat network
- `npm run interact` - Run example interaction script
- `npm run accounts` - Show test accounts and keys
- `npm run deploy-sepolia` - Deploy to Sepolia testnet (requires .env setup)

## Development Workflow

1. **Write/Update Contracts**: Modify files in `contracts/`
2. **Compile**: `npm run compile`
3. **Test**: `npm run test`
4. **Deploy**: `npm run deploy`
5. **Interact**: `npm run interact` or create custom scripts in `scripts/`

## Configuration

### Local Network (Default)
- Network: Hardhat local node
- Chain ID: 1337
- RPC: http://127.0.0.1:8545
- Auto-generated test accounts

### Sepolia Testnet
- Setup `.env` file with:
  - `SEPOLIA_RPC_URL`: Infura or Alchemy endpoint
  - `PRIVATE_KEY`: Your account's private key
- Deploy: `npm run deploy-sepolia`

## Smart Contract Details

### POSToken.sol
- ERC20 standard token implementation
- Mint/burn capabilities
- Initial supply: 1 million tokens

### POSSystem.sol
- Order creation with multiple items
- Payment processing with automatic fee deduction
- Merchant fund management
- Reentrancy protection
- Owner-controlled fee adjustment

## Testing

Comprehensive test suite included covering:
- Token transfer and minting
- Order creation and management
- Payment processing
- Fund withdrawals
- Platform fee calculations
- Error scenarios

Run tests: `npm run test`

## Troubleshooting

### Issue: "deployments.json not found"
- **Solution**: Run `npm run deploy` first

### Issue: "Insufficient allowance"
- **Solution**: The contract needs approval to spend tokens (see interact.js)

### Issue: Contracts won't compile
- **Solution**: Check Solidity version in hardhat.config.js matches contract files

## Future Enhancements

- Multi-currency support
- Inventory management
- Discount system
- Analytics dashboard
- NFT receipt generation
- Payment gateway integration

## Resources

- [Hardhat Documentation](https://hardhat.org)
- [Ethers.js Docs](https://docs.ethers.org)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Solidity Docs](https://docs.soliditylang.org/)
