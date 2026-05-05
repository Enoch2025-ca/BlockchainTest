// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title POSSystem
 * @dev Main Point of Sale system contract
 */
contract POSSystem is ReentrancyGuard, Ownable {
    IERC20 public posToken;

    enum OrderStatus {
        Pending,
        Completed,
        Cancelled
    }

    struct OrderItem {
        string itemName;
        uint256 quantity;
        uint256 pricePerUnit;
        uint256 totalPrice;
    }

    struct Order {
        uint256 orderId;
        address customer;
        address merchant;
        OrderItem[] items;
        uint256 totalAmount;
        uint256 timestamp;
        OrderStatus status;
        string transactionHash;
    }

    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public customerOrders;
    mapping(address => uint256[]) public merchantOrders;
    mapping(address => uint256) public merchantBalance;

    uint256 public orderCount = 0;
    uint256 public platformFeePercentage = 2; // 2% fee

    event OrderCreated(
        uint256 indexed orderId,
        address indexed customer,
        address indexed merchant,
        uint256 totalAmount
    );
    event OrderCompleted(
        uint256 indexed orderId,
        address indexed merchant,
        uint256 amount
    );
    event OrderCancelled(uint256 indexed orderId);
    event FundWithdrawn(address indexed merchant, uint256 amount);
    event PlatformFeeUpdated(uint256 newFeePercentage);

    constructor(address _tokenAddress) {
        posToken = IERC20(_tokenAddress);
    }

    /**
     * @dev Create a new order with items
     */
    function createOrder(
        address merchant,
        string[] calldata itemNames,
        uint256[] calldata quantities,
        uint256[] calldata pricesPerUnit
    ) external returns (uint256) {
        require(merchant != address(0), "Invalid merchant address");
        require(
            itemNames.length == quantities.length &&
                quantities.length == pricesPerUnit.length,
            "Array length mismatch"
        );
        require(itemNames.length > 0, "At least one item required");

        uint256 totalAmount = 0;
        Order storage newOrder = orders[orderCount];

        newOrder.orderId = orderCount;
        newOrder.customer = msg.sender;
        newOrder.merchant = merchant;
        newOrder.timestamp = block.timestamp;
        newOrder.status = OrderStatus.Pending;

        for (uint256 i = 0; i < itemNames.length; i++) {
            require(quantities[i] > 0, "Quantity must be greater than 0");
            require(pricesPerUnit[i] > 0, "Price must be greater than 0");

            uint256 itemTotal = quantities[i] * pricesPerUnit[i];
            totalAmount += itemTotal;

            newOrder.items.push(
                OrderItem({
                    itemName: itemNames[i],
                    quantity: quantities[i],
                    pricePerUnit: pricesPerUnit[i],
                    totalPrice: itemTotal
                })
            );
        }

        newOrder.totalAmount = totalAmount;

        customerOrders[msg.sender].push(orderCount);
        merchantOrders[merchant].push(orderCount);

        emit OrderCreated(orderCount, msg.sender, merchant, totalAmount);

        return orderCount++;
    }

    /**
     * @dev Complete payment for an order
     */
    function completePayment(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];

        require(order.customer != address(0), "Order does not exist");
        require(order.customer == msg.sender, "Only customer can pay");
        require(
            order.status == OrderStatus.Pending,
            "Order already processed"
        );

        uint256 totalAmount = order.totalAmount;
        uint256 platformFee = (totalAmount * platformFeePercentage) / 100;
        uint256 merchantAmount = totalAmount - platformFee;

        // Transfer tokens from customer to contract
        require(
            posToken.transferFrom(msg.sender, address(this), totalAmount),
            "Payment failed"
        );

        // Add merchant balance
        merchantBalance[order.merchant] += merchantAmount;

        order.status = OrderStatus.Completed;

        emit OrderCompleted(orderId, order.merchant, totalAmount);
    }

    /**
     * @dev Cancel an order
     */
    function cancelOrder(uint256 orderId) external {
        Order storage order = orders[orderId];

        require(order.customer != address(0), "Order does not exist");
        require(
            msg.sender == order.customer || msg.sender == owner(),
            "Unauthorized"
        );
        require(
            order.status == OrderStatus.Pending,
            "Can only cancel pending orders"
        );

        order.status = OrderStatus.Cancelled;

        emit OrderCancelled(orderId);
    }

    /**
     * @dev Withdraw merchant funds
     */
    function withdrawFunds() external nonReentrant {
        uint256 balance = merchantBalance[msg.sender];
        require(balance > 0, "No funds to withdraw");

        merchantBalance[msg.sender] = 0;

        require(
            posToken.transfer(msg.sender, balance),
            "Withdrawal failed"
        );

        emit FundWithdrawn(msg.sender, balance);
    }

    /**
     * @dev Get order details
     */
    function getOrder(uint256 orderId)
        external
        view
        returns (Order memory)
    {
        require(orders[orderId].customer != address(0), "Order not found");
        return orders[orderId];
    }

    /**
     * @dev Get customer order count
     */
    function getCustomerOrderCount(address customer)
        external
        view
        returns (uint256)
    {
        return customerOrders[customer].length;
    }

    /**
     * @dev Get merchant order count
     */
    function getMerchantOrderCount(address merchant)
        external
        view
        returns (uint256)
    {
        return merchantOrders[merchant].length;
    }

    /**
     * @dev Get customer orders
     */
    function getCustomerOrders(address customer)
        external
        view
        returns (uint256[] memory)
    {
        return customerOrders[customer];
    }

    /**
     * @dev Get merchant orders
     */
    function getMerchantOrders(address merchant)
        external
        view
        returns (uint256[] memory)
    {
        return merchantOrders[merchant];
    }

    /**
     * @dev Set platform fee
     */
    function setPlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 10, "Fee too high");
        platformFeePercentage = newFeePercentage;

        emit PlatformFeeUpdated(newFeePercentage);
    }

    /**
     * @dev Get merchant balance
     */
    function getMerchantBalance(address merchant)
        external
        view
        returns (uint256)
    {
        return merchantBalance[merchant];
    }
}
