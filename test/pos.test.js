const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("POSToken", function () {
  let posToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const POSToken = await ethers.getContractFactory("POSToken");
    const initialSupply = ethers.parseEther("1000000");
    posToken = await POSToken.deploy(initialSupply);
  });

  describe("Deployment", function () {
    it("Should set the right initial supply", async function () {
      const totalSupply = await posToken.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther("1000000"));
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await posToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(ethers.parseEther("1000000"));
    });

    it("Should have correct name and symbol", async function () {
      expect(await posToken.name()).to.equal("POS Token");
      expect(await posToken.symbol()).to.equal("POS");
    });
  });

  describe("Transfer", function () {
    it("Should transfer tokens between accounts", async function () {
      await posToken.transfer(addr1.address, ethers.parseEther("50"));
      const balance = await posToken.balanceOf(addr1.address);
      expect(balance).to.equal(ethers.parseEther("50"));
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const largeAmount = ethers.parseEther("1000001");
      await expect(
        posToken.transfer(addr1.address, largeAmount)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("Mint", function () {
    it("Should mint tokens to an address", async function () {
      await posToken.mint(addr1.address, ethers.parseEther("100"));
      const balance = await posToken.balanceOf(addr1.address);
      expect(balance).to.equal(ethers.parseEther("100"));
    });

    it("Should fail if non-owner tries to mint", async function () {
      await expect(
        posToken.connect(addr1).mint(addr2.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(posToken, "OwnableUnauthorizedAccount");
    });
  });
});

describe("POSSystem", function () {
  let posToken;
  let posSystem;
  let owner;
  let merchant;
  let customer;

  beforeEach(async function () {
    [owner, merchant, customer] = await ethers.getSigners();

    // Deploy POSToken
    const POSToken = await ethers.getContractFactory("POSToken");
    const initialSupply = ethers.parseEther("1000000");
    posToken = await POSToken.deploy(initialSupply);

    // Deploy POSSystem
    const POSSystem = await ethers.getContractFactory("POSSystem");
    const tokenAddress = await posToken.getAddress();
    posSystem = await POSSystem.deploy(tokenAddress);

    // Distribute tokens to customer
    await posToken.transfer(customer.address, ethers.parseEther("1000"));

    // Approve POS system to spend tokens
    await posToken
      .connect(customer)
      .approve(await posSystem.getAddress(), ethers.parseEther("10000"));
  });

  describe("Order Creation", function () {
    it("Should create an order successfully", async function () {
      const itemNames = ["Coffee"];
      const quantities = [1];
      const prices = [ethers.parseEther("5")];

      await expect(
        posSystem
          .connect(customer)
          .createOrder(merchant.address, itemNames, quantities, prices)
      )
        .to.emit(posSystem, "OrderCreated")
        .withArgs(0, customer.address, merchant.address, ethers.parseEther("5"));

      const order = await posSystem.getOrder(0);
      expect(order.customer).to.equal(customer.address);
      expect(order.merchant).to.equal(merchant.address);
      expect(order.totalAmount).to.equal(ethers.parseEther("5"));
    });

    it("Should create multiple items in one order", async function () {
      const itemNames = ["Coffee", "Sandwich", "Juice"];
      const quantities = [2, 1, 1];
      const prices = [
        ethers.parseEther("5"),
        ethers.parseEther("10"),
        ethers.parseEther("3"),
      ];

      await posSystem
        .connect(customer)
        .createOrder(merchant.address, itemNames, quantities, prices);

      const order = await posSystem.getOrder(0);
      expect(order.items.length).to.equal(3);
      expect(order.totalAmount).to.equal(ethers.parseEther("23"));
    });

    it("Should fail with invalid merchant address", async function () {
      const itemNames = ["Coffee"];
      const quantities = [1];
      const prices = [ethers.parseEther("5")];

      await expect(
        posSystem
          .connect(customer)
          .createOrder(ethers.ZeroAddress, itemNames, quantities, prices)
      ).to.be.revertedWith("Invalid merchant address");
    });
  });

  describe("Payment", function () {
    beforeEach(async function () {
      const itemNames = ["Coffee"];
      const quantities = [1];
      const prices = [ethers.parseEther("5")];

      await posSystem
        .connect(customer)
        .createOrder(merchant.address, itemNames, quantities, prices);
    });

    it("Should complete payment successfully", async function () {
      await expect(posSystem.connect(customer).completePayment(0))
        .to.emit(posSystem, "OrderCompleted")
        .withArgs(0, merchant.address, ethers.parseEther("5"));

      const order = await posSystem.getOrder(0);
      expect(order.status).to.equal(1); // Completed
    });

    it("Should deduct platform fee from merchant", async function () {
      await posSystem.connect(customer).completePayment(0);

      const platformFee = ethers.parseEther("5") / 50n; // 2% fee
      const expectedMerchantAmount = ethers.parseEther("5") - platformFee;

      const merchantBalance = await posSystem.getMerchantBalance(
        merchant.address
      );
      expect(merchantBalance).to.equal(expectedMerchantAmount);
    });

    it("Should fail if non-customer tries to pay", async function () {
      await expect(
        posSystem.connect(merchant).completePayment(0)
      ).to.be.revertedWith("Only customer can pay");
    });

    it("Should fail if order already completed", async function () {
      await posSystem.connect(customer).completePayment(0);

      await expect(
        posSystem.connect(customer).completePayment(0)
      ).to.be.revertedWith("Order already processed");
    });
  });

  describe("Cancellation", function () {
    beforeEach(async function () {
      const itemNames = ["Coffee"];
      const quantities = [1];
      const prices = [ethers.parseEther("5")];

      await posSystem
        .connect(customer)
        .createOrder(merchant.address, itemNames, quantities, prices);
    });

    it("Should cancel a pending order", async function () {
      await expect(posSystem.connect(customer).cancelOrder(0))
        .to.emit(posSystem, "OrderCancelled")
        .withArgs(0);

      const order = await posSystem.getOrder(0);
      expect(order.status).to.equal(2); // Cancelled
    });

    it("Should fail if non-customer tries to cancel", async function () {
      await expect(
        posSystem.connect(merchant).cancelOrder(0)
      ).to.be.revertedWith("Unauthorized");
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async function () {
      const itemNames = ["Coffee"];
      const quantities = [1];
      const prices = [ethers.parseEther("5")];

      await posSystem
        .connect(customer)
        .createOrder(merchant.address, itemNames, quantities, prices);

      await posSystem.connect(customer).completePayment(0);
    });

    it("Should withdraw merchant funds", async function () {
      const initialBalance = await posToken.balanceOf(merchant.address);

      await expect(posSystem.connect(merchant).withdrawFunds())
        .to.emit(posSystem, "FundWithdrawn");

      const finalBalance = await posToken.balanceOf(merchant.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should fail if no funds to withdraw", async function () {
      await expect(
        posSystem.connect(owner).withdrawFunds()
      ).to.be.revertedWith("No funds to withdraw");
    });
  });

  describe("Platform Fee", function () {
    it("Should update platform fee", async function () {
      await expect(posSystem.connect(owner).setPlatformFee(5))
        .to.emit(posSystem, "PlatformFeeUpdated")
        .withArgs(5);

      // Verify new fee is applied
      const itemNames = ["Coffee"];
      const quantities = [1];
      const prices = [ethers.parseEther("100")];

      await posSystem
        .connect(customer)
        .createOrder(merchant.address, itemNames, quantities, prices);

      await posSystem.connect(customer).completePayment(0);

      const platformFee = (ethers.parseEther("100") * 5n) / 100n;
      const expectedMerchantAmount = ethers.parseEther("100") - platformFee;

      const merchantBalance = await posSystem.getMerchantBalance(
        merchant.address
      );
      expect(merchantBalance).to.equal(expectedMerchantAmount);
    });

    it("Should fail if fee is too high", async function () {
      await expect(posSystem.connect(owner).setPlatformFee(11)).to.be.revertedWith(
        "Fee too high"
      );
    });

    it("Should fail if non-owner tries to update fee", async function () {
      await expect(
        posSystem.connect(customer).setPlatformFee(5)
      ).to.be.revertedWithCustomError(posSystem, "OwnableUnauthorizedAccount");
    });
  });
});
