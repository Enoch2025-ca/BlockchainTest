# Blockchain Point of Sale (POS) System

A comprehensive blockchain-based Point of Sale system built with Solidity smart contracts and Node.js. This system enables secure, transparent transactions using ERC20 tokens on the Ethereum blockchain.

## Features

- **ERC20 Token System**: Custom POS token for transactions
- **Order Management**: Create, track, and manage customer orders
- **Payment Processing**: Secure payment completion with token transfers
- **Merchant Accounts**: Merchant fund management and withdrawals
- **Platform Fees**: Configurable percentage-based platform fees
- **Order History**: Complete transaction history for customers and merchants
- **Reentrancy Protection**: Secure fund transfers with reentrancy guards

## Project Structure

```
blockchain-pos-system/
├── contracts/
│   ├── POSToken.sol          # ERC20 token contract
│   └── POSSystem.sol         # Main POS system contract
├── scripts/
│   ├── deploy.js             # Deployment script
│   └── interact.js           # Interaction example script
├── test/
│   └── pos.test.js           # Unit tests
├── hardhat.config.js         # Hardhat configuration
├── package.json              # Node dependencies
├── .env.example              # Environment variables template
├── deployments.json          # Generated after deployment
└── README.md                 # This file
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Hardhat
- Git

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd blockchain-pos-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a .env file** (optional, for testnet deployment):
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your values:
   - `SEPOLIA_RPC_URL`: Your Infura/Alchemy API endpoint
   - `PRIVATE_KEY`: Your wallet's private key (without 0x prefix)

## Smart Contracts

### POSToken.sol

Custom ERC20 token for the POS system.

**Key Functions**:
- `constructor(uint256 initialSupply)`: Deploy with initial token supply
- `mint(address to, uint256 amount)`: Mint new tokens (owner only)
- `burn(uint256 amount)`: Burn your own tokens
- `burnFrom(address account, uint256 amount)`: Burn tokens from another address

### POSSystem.sol

Main POS system managing orders and payments.

**Key Functions**:
- `createOrder(address merchant, string[] itemNames, uint256[] quantities, uint256[] pricesPerUnit)`: Create a new order
- `completePayment(uint256 orderId)`: Complete payment for an order
- `cancelOrder(uint256 orderId)`: Cancel a pending order
- `withdrawFunds()`: Withdraw merchant funds
- `getOrder(uint256 orderId)`: Retrieve order details
- `setPlatformFee(uint256 newFeePercentage)`: Update platform fee (owner only)

**Order Status**:
- `Pending (0)`: Order created, awaiting payment
- `Completed (1)`: Order paid and completed
- `Cancelled (2)`: Order cancelled

## Usage

### 1. Start a Local Blockchain

```bash
npx hardhat node
```

This creates a local Ethereum network on `http://127.0.0.1:8545` with 20 test accounts.

### 2. Deploy Contracts (New Terminal)

```bash
npm run deploy
```

This deploys the POSToken and POSSystem contracts and saves deployment info to `deployments.json`.

**Output Example**:
```
✅ POSToken deployed to: 0x5FbDB2315678afccda05de7C4ADE539A34cFFb2b
✅ POSSystem deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 3. Interact with the System

```bash
npm run interact
```

This demonstrates a complete workflow:
- Distributes tokens to a customer
- Creates an order for coffee, sandwich, and juice
- Processes payment
- Merchant withdraws funds
- Displays final balances

### 4. Compile Contracts

```bash
npm run compile
```

### 5. Run Tests

```bash
npm run test
```

### 6. View Hardhat Accounts

```bash
npm run accounts
```

Displays the 20 test accounts and their private keys available on the local network.

## Example: Custom Transaction

Create a custom interaction script to use the POS system:

```javascript
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [customer] = await ethers.getSigners();
  
  // Load deployment info
  const deployments = JSON.parse(fs.readFileSync("deployments.json", "utf8"));
  
  // Get contract instances
  const POSToken = await hre.ethers.getContractFactory("POSToken");
  const posToken = POSToken.attach(deployments.POSToken);
  
  const POSSystem = await hre.ethers.getContractFactory("POSSystem");
  const posSystem = POSSystem.attach(deployments.POSSystem);
  
  // Create an order
  const tx = await posSystem.connect(customer).createOrder(
    merchant.address,
    ["Item 1", "Item 2"],
    [1, 2],
    [hre.ethers.parseEther("10"), hre.ethers.parseEther("5")]
  );
  
  const receipt = await tx.wait();
  console.log("Order created!");
}

main().catch(console.error);
```

## Deployment to Testnet

### Deploy to Sepolia

1. Set up your `.env` file with:
   ```
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   PRIVATE_KEY=your_private_key
   ```

2. Deploy:
   ```bash
   npm run deploy-sepolia
   ```

3. Verify on Etherscan:
   ```
   https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
   ```

## Architecture

### Order Flow

```
1. Customer creates order
   ↓
2. Order stored with Pending status
   ↓
3. Customer approves tokens for transfer
   ↓
4. Customer completes payment
   ↓
5. Tokens transferred from customer
   ↓
6. Platform fee deducted
   ↓
7. Merchant balance updated
   ↓
8. Order marked Completed
   ↓
9. Merchant withdraws funds
```

## Security Features

- **ReentrancyGuard**: Protects against reentrancy attacks
- **Ownable**: Owner-restricted functions for admin tasks
- **SafeTransfer**: Uses standard ERC20 transfer patterns
- **Input Validation**: Validates all inputs before processing
- **Access Control**: Different permissions for customers and merchants

## Gas Optimization

- Solidity version: 0.8.19
- Optimizer enabled with 200 runs
- Efficient data structures
- Minimal storage operations

## Development

### Project Setup

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Run local node
npm run node

# Deploy to local network
npm run deploy

# Interact with system
npm run interact
```

### Adding New Features

1. Update contracts in `contracts/`
2. Update scripts in `scripts/`
3. Test with: `npm run test`
4. Deploy with: `npm run deploy`

## Troubleshooting

### Error: "deployments.json not found"
**Solution**: Run `npm run deploy` first to create the deployments file.

### Error: "Insufficient balance"
**Solution**: Run `npm run interact` first to distribute tokens to test accounts.

### Error: "ERC20: insufficient allowance"
**Solution**: Approve the POS system contract to spend tokens first (see `interact.js`).

### Contracts fail to compile
**Solution**: Ensure Solidity version matches in `hardhat.config.js` and contract files.

## Future Enhancements

- [ ] Multi-currency support
- [ ] Discount and coupon system
- [ ] Inventory management
- [ ] Real-time analytics dashboard
- [ ] Multi-signature wallet for transactions
- [ ] NFT receipt generation
- [ ] Integration with payment gateways
- [ ] Advanced reporting tools

## License

ISC

## Support

For issues or questions, please check the Hardhat documentation at https://hardhat.org/

## Resources

- [Hardhat Documentation](https://hardhat.org/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Solidity Documentation](https://docs.soliditylang.org/)
