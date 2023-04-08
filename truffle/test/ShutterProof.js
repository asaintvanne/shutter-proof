const ShutterProof = artifacts.require("ShutterProof");
const PaternitySBT = artifacts.require("PaternitySBT");
const ExclusiveRightsNFT = artifacts.require("ExclusiveRightsNFT");

const {constants, BN, expectRevert, expectEvent} = require('../node_modules/@openzeppelin/test-helpers');
const {expect} = require('chai');

contract("ShutterProof", accounts => {

    let ShutterProofInstance;
    let PaternitySBTInstance;
    let ExclusiveRightsNFTInstance;

    const deployer = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];

    const PHOTOGRAPHER = 0;
    const CLIENT = 1

    const siretHex = "0x3132333435363738393031323334"; //12345678901234

    context("Shutterproof contract initialization", () => {
        before(async () => {
            ShutterProofInstance = await ShutterProof.new({from: deployer});
        });

        it("ExclusiveRightsNFT contract is deployed", async () => {
            const contractAddress = await ShutterProofInstance.getExclusiveRightsNFT.call();
            expect(contractAddress).is.not.equal(constants.ZERO_ADDRESS);
        });
    });

    context("Shutterproof registration", () => {
        beforeEach(async () => {
            ShutterProofInstance = await ShutterProof.new({from: deployer});
        });

        it("Bad fields", async () => {
            const wrongSiretHex = "0x6132333435363738393031323334"; //a2345678901234
            await expectRevert(ShutterProofInstance.register.call("", siretHex, PHOTOGRAPHER, {from: account1}), "Name cannot be empty");
            await expectRevert(ShutterProofInstance.register.call("My Name", wrongSiretHex, PHOTOGRAPHER, {from: account1}), "SIRET is not well formed");
        });

        it("Valid registration", async () => {
            const registration = await ShutterProofInstance.register("My Name", siretHex, PHOTOGRAPHER, {from: account1});
            const user = await ShutterProofInstance.getUser.call(account1);

            expect(user.registered).true;
            expect(user.name).equal("My Name");
            expect(user.siret).equal(siretHex);
            expect(user.role).to.be.bignumber.equal(new BN(PHOTOGRAPHER));

            expectEvent(registration, "UserRegistered", {userAdress: account1, role: new BN(PHOTOGRAPHER)});
        });

        it("Valid registration Photographer", async () => {
            await ShutterProofInstance.register("My Name", siretHex, PHOTOGRAPHER, {from: account1});
            const user = await ShutterProofInstance.getUser.call(account1);

            expect(user.sbt).is.not.equal(constants.ZERO_ADDRESS);
            expect(user.role).to.be.bignumber.equal(new BN(PHOTOGRAPHER));
        });

        it("Valid registration Client", async () => {
            await ShutterProofInstance.register("My Name", siretHex, CLIENT, {from: account1});
            const user = await ShutterProofInstance.getUser.call(account1);

            expect(user.sbt).is.equal(constants.ZERO_ADDRESS);
            expect(user.role).to.be.bignumber.equal(new BN(CLIENT));
        });

        it("Aready registrated", async () => {
            await ShutterProofInstance.register("My Name", siretHex, CLIENT, {from: account1});

            await expectRevert(ShutterProofInstance.register.call("My Name Different", siretHex.slice(0, -1) + '3', CLIENT, {from: account1}), "User is already registered");
        });
    });

    context("Shutterproof getPaternitySBT", () => {
        beforeEach(async () => {
            ShutterProofInstance = await ShutterProof.new({from: deployer});
            await ShutterProofInstance.register("My Name", siretHex, PHOTOGRAPHER, {from: account1});
            
            const sbt = ShutterProofInstance.getPaternitySBT
        });

        it("Illegal getPaternity", async () => {
            await expectRevert(ShutterProofInstance.getPaternitySBT.call(account2), "User has no PaternitySBT contract");
        });

        it("Legal getPaternity", async () => {
            const sbtContract = await ShutterProofInstance.getPaternitySBT.call(account1);

            expect(sbtContract).is.not.equal(constants.ZERO_ADDRESS);
        });
    });

    context("PaternitySBT contract initialisation", () => {
        beforeEach(async () => {
            ShutterProofInstance = await ShutterProof.new({from: deployer});
            await ShutterProofInstance.register("My Name", siretHex, PHOTOGRAPHER, {from: account1});
            const user1 = await ShutterProofInstance.getUser.call(account1);

            PaternitySBTInstance = await PaternitySBT.at(user1.sbt);
        });

        it("Owner is photographer", async () => {
            const owner = await PaternitySBTInstance.owner.call();

            expect(owner).is.equal(account1);
        });

        it("Balance is 0", async () => {
            const balance = await PaternitySBTInstance.balance.call();

            expect(balance).to.be.bignumber.equal(new BN(0));
        });

    });

    context("PaternitySBT mint", () => {
        beforeEach(async () => {
            ShutterProofInstance = await ShutterProof.new({from: deployer});
            await ShutterProofInstance.register("My Name", siretHex, PHOTOGRAPHER, {from: account1});
            const user1 = await ShutterProofInstance.getUser.call(account1);

            PaternitySBTInstance = await PaternitySBT.at(user1.sbt);
        });

        it("Valid mint", async () => {
            const url = "ZJ0JSD3ksdnf45jkl5";
            const balanceBefore = await PaternitySBTInstance.balance.call();
            const mint = await PaternitySBTInstance.mint(url, {from: account1});
            const tokenId = mint.logs[0].args.tokenId;
            const tokenUrl = await PaternitySBTInstance.getToken.call(tokenId.toNumber());
            const balanceAfter = await PaternitySBTInstance.balance.call();

            expect(tokenUrl).is.equal(url);
            expect(balanceBefore.toNumber()).is.equal(tokenId.toNumber());
            expect(balanceAfter.toNumber()).is.equal(balanceBefore.toNumber() + 1);
            expectEvent(mint, "Mint", {tokenId: balanceBefore});
        });

        it("Mint with bad user", async () => {
            await expectRevert(PaternitySBTInstance.mint.call('ZJ0JSD3ksdnf45jkl5', {from: account2}), "Caller is not owner");
            
        });
    });

    context("PaternitySBT GetToken", () => {
        before(async () => {
            ShutterProofInstance = await ShutterProof.new({from: deployer});
            await ShutterProofInstance.register("My Name", siretHex, PHOTOGRAPHER, {from: account1});
        });

        it("Invalid token ID", async () => {
            await expectRevert(PaternitySBTInstance.getToken.call(0), "Token doesn't exist");
        });
    });

    context("ExclusiveRightsNFT Mint", () => {
        beforeEach(async () => {
            ShutterProofInstance = await ShutterProof.new({from: deployer});
            await ShutterProofInstance.register("My Name", siretHex, PHOTOGRAPHER, {from: account1});

            const user1 = await ShutterProofInstance.getUser.call(account1);

            PaternitySBTInstance = await PaternitySBT.at(user1.sbt);
            ExclusiveRightsNFTInstance = await ExclusiveRightsNFT.at(await ShutterProofInstance.getExclusiveRightsNFT());
        });

        it("Illegal mint with not PaternitySBT", async () => {
            await expectRevert.unspecified(ExclusiveRightsNFTInstance.mint(0, {from: account1}));

            
        });

        it("ExclusiveRightsNFT valid mint", async () => {
            const balanceBefore = await ExclusiveRightsNFTInstance._balance.call();
            const mint = await PaternitySBTInstance.mint('ZJ0JSD3ksdnf45jkl5', {from: account1});
            const balanceAfter = await ExclusiveRightsNFTInstance._balance.call();
            
            const addrNFT = await ShutterProofInstance.getExclusiveRightsNFT();

            console.log(mint.receipt.logs);

            sbt = await ExclusiveRightsNFTInstance.getSBT(0);
            const user1 = await ShutterProofInstance.getUser.call(account1);

            expect(sbt.sbtAddress).is.equal(user1.sbt);
            expect(sbt.tokenId).is.equal('0');
            expect(balanceAfter.toNumber()).is.equal(balanceBefore.toNumber() + 1);
        });
    });

    context("ExclusiveRightsNFT Sale", async () => {
        beforeEach(async () => {
            ShutterProofInstance = await ShutterProof.new({from: deployer});
            await ShutterProofInstance.register("My Name", siretHex, PHOTOGRAPHER, {from: account1});
    
            const user1 = await ShutterProofInstance.getUser.call(account1);
    
            PaternitySBTInstance = await PaternitySBT.at(user1.sbt);
            ExclusiveRightsNFTInstance = await ExclusiveRightsNFT.at(await ShutterProofInstance.getExclusiveRightsNFT());
    
            await PaternitySBTInstance.mint('ZJ0JSD3ksdnf45jkl5', {from: account1});
        });

        it("Illegal sale", async () => {
            await expectRevert(ExclusiveRightsNFTInstance.saleExclusiveRights.call(0, 1500, {from: account2}), "Caller is not token owner");
            await expectRevert(ExclusiveRightsNFTInstance.saleExclusiveRights.call(0, 0, {from: account1}), "Price must be greater than 0");
        });

        it("Legal sale", async () => {
            await ExclusiveRightsNFTInstance.saleExclusiveRights(0, 1500, {from: account1});
            const price = await ExclusiveRightsNFTInstance.getPrice.call(0);

            expect(price.toNumber()).to.be.equal(1500);
        });
    });

    context("ExclusiveRightsNFT unsale", async () => {
        beforeEach(async () => {
            ShutterProofInstance = await ShutterProof.new({from: deployer});
            await ShutterProofInstance.register("My Name", siretHex, PHOTOGRAPHER, {from: account1});
    
            const user1 = await ShutterProofInstance.getUser.call(account1);
    
            PaternitySBTInstance = await PaternitySBT.at(user1.sbt);
            ExclusiveRightsNFTInstance = await ExclusiveRightsNFT.at(await ShutterProofInstance.getExclusiveRightsNFT());
    
            await PaternitySBTInstance.mint('ZJ0JSD3ksdnf45jkl5', {from: account1});
            ExclusiveRightsNFTInstance.saleExclusiveRights(0, 1500, {from: account1});
        });

        it("Illegal unsale", async () => {
            await expectRevert(ExclusiveRightsNFTInstance.unsaleExclusiveRights.call(0, {from: account2}), "Caller is not token owner");
        });

        it("Legal unsale", async () => {
            await ExclusiveRightsNFTInstance.unsaleExclusiveRights(0, {from: account1});
            const price = await ExclusiveRightsNFTInstance.getPrice.call(0);

            expect(price.toNumber()).to.be.equal(0);
        });
    });

    context("Shutterproof Buy NFT", async () => {
        beforeEach(async () => {
            ShutterProofInstance = await ShutterProof.new({from: deployer});
            await ShutterProofInstance.register("My Name", siretHex, PHOTOGRAPHER, {from: account1});
            await ShutterProofInstance.register("My Name", siretHex, CLIENT, {from: account2});
    
            const user1 = await ShutterProofInstance.getUser.call(account1);
    
            PaternitySBTInstance = await PaternitySBT.at(user1.sbt);
            ExclusiveRightsNFTInstance = await ExclusiveRightsNFT.at(await ShutterProofInstance.getExclusiveRightsNFT());
    
            await PaternitySBTInstance.mint('ZJ0JSD3ksdnf45jkl5', {from: account1});
            await ExclusiveRightsNFTInstance.setApprovalForAll(ShutterProofInstance.address, true, {from: account1});
            await ExclusiveRightsNFTInstance.saleExclusiveRights(0, 1500, {from: account1});
        });

        it("Illegal NFT buy", async () => {
            await expectRevert(ShutterProofInstance.buyExclusiveRights.call(0, {from: account3}), "Caller is not registered");
            await expectRevert(ShutterProofInstance.buyExclusiveRights.call(1, {from: account1}), "Photography is not for sale");
            await expectRevert(ShutterProofInstance.buyExclusiveRights.call(0, {from: account1, value: 1500}), "Buyer cannot buy his own NFT");
            await expectRevert(ShutterProofInstance.buyExclusiveRights.call(0, {from: account2, value: 1000}), "Insufficient payment");
        });

        it("Legal NFT buy", async () => {
            await ShutterProofInstance.buyExclusiveRights(0, {from: account2, value: 1500});
            const owner = await ExclusiveRightsNFTInstance.ownerOf.call(0);
            expect(owner).is.equal(account2);
        });

        it("Legal NFT buy with refund", async () => {
            const balanceBefore = await web3.eth.getBalance(account2);
            await ShutterProofInstance.buyExclusiveRights(0, {from: account2, value: 15000});
            const owner = await ExclusiveRightsNFTInstance.ownerOf.call(0);
            const balanceAfter = await web3.eth.getBalance(account2);
            expect(owner).is.equal(account2);
            expect(balanceBefore.toNumber() - balanceAfter.toNumber()).be.equal(1500);
        });
    });
});