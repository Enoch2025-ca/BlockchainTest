// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title POSToken
 * @dev ERC20 token for Point of Sale transactions
 */
contract POSToken is ERC20, Ownable {
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor(uint256 initialSupply) ERC20("POS Token", "POS") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    /**
     * @dev Mint new tokens
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Burn tokens
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Burn tokens from another address
     */
    function burnFrom(address account, uint256 amount) public {
        uint256 currentAllowance = allowance(account, msg.sender);
        require(
            currentAllowance >= amount,
            "ERC20: insufficient allowance"
        );
        _approve(account, msg.sender, currentAllowance - amount);
        _burn(account, amount);
        emit TokensBurned(account, amount);
    }
}
