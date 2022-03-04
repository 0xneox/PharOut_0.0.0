/* eslint-disable prettier/prettier */
const { ethers } = require("hardhat");
const { use } = require("chai");
const { expect } = require("chai");
const { solidity } = require("ethereum-waffle");
const Web3 = require('web3');
const { BigNumber } = require("ethers");
// const toBN = Web3.utils.toBN;
// use(solidity);


describe("MarketPlace Mint ERC721 Contract Unit Test", function() {
  it("Should interact with the Rewards, ERC721 and Mint contracts.", async function() {
    before((done) => {
      setTimeout(done, 2000);
    });
    const [testDao, testDev, userAddress] = await ethers.getSigners();

    const RoleProvider = await ethers.getContractFactory("MarketRoleProvider");
    const roleProvider = await RoleProvider.deploy();
    await roleProvider.deployed();
    const roleProviderAddress = roleProvider.address;
    console.log("Role provider Address is: ", roleProviderAddress);

    const MarketOwnerProxy = await ethers.getContractFactory("OwnerProxy");
    const ownerProxy = await MarketOwnerProxy.deploy(roleProviderAddress);
    await ownerProxy.deployed();
    const ownerProxyAddress = ownerProxy.address;
    console.log("Market Owner Proxy address is: " + ownerProxyAddress);

    const NFTMarket = await ethers.getContractFactory("NFTMarket");
    const market = await NFTMarket.deploy(roleProviderAddress);
    await market.deployed()
    const marketAddress = market.address; 
    console.log("Market Address: " + marketAddress)

    const MarketMint = await ethers.getContractFactory("Mint");
    const marketMint = await MarketMint.deploy(roleProviderAddress);
    await marketMint.deployed();
    const marketMintAddress = marketMint.address;
    console.log("Market Mint Address: " + marketMintAddress)

    /// Test ERC20 token!! This is not used on mainnet!
    const PHAMToken = await ethers.getContractFactory("PhamToken");
    const token = await PHAMToken.deploy('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    await token.deployed()
    const tokenAddress = token.address;
    console.log("PHAM Token Address: " + tokenAddress)
    const amnt = await token.balanceOf('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    const tokenamount = BigNumber.from(amnt);
    console.log("Deployer address has a total of " + ethers.utils.formatUnits(tokenamount) + " PHAM Tokens.");

    const NFT = await ethers.getContractFactory("PhamNFTs");
    const phamNft = await NFT.deploy('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', testDev.address, "https://ipfs.io/ipfs/", 20);
    await phamNft.deployed()
    const phamNftContractAddress = phamNft.address;
    console.log("PhamNFTs Contract Address: "+ phamNftContractAddress)

    const MarketBids = await ethers.getContractFactory("MarketBids");
    const marketBids = await MarketBids.deploy(roleProviderAddress);
    await marketBids.deployed();
    const marketBidsAddress = marketBids.address;
    console.log("Bids Address: " + marketBidsAddress)
  
    const MarketCollections = await ethers.getContractFactory("MarketCollections");
    const marketCollections = await MarketCollections.deploy(roleProviderAddress);
    await marketCollections.deployed();
    const marketCollectionsAddress = marketCollections.address;
    console.log("CollectionsAddress: " + marketCollectionsAddress)
  
    const MarketOffers = await ethers.getContractFactory("MarketOffers");
    const marketOffers = await MarketOffers.deploy(roleProviderAddress);
    await marketOffers.deployed();
    const marketOffersAddress = marketOffers.address;
    console.log("Offers Address: " + marketOffersAddress)
  
    const MarketTrades = await ethers.getContractFactory("MarketTrades");
    const marketTrades = await MarketTrades.deploy(roleProviderAddress);
    await marketTrades.deployed();
    const marketTradesAddress = marketTrades.address;
    console.log("Trades Address: " + marketTradesAddress)

    const RewardsController = await ethers.getContractFactory("RewardsControl");
    const rewardsController = await RewardsController.deploy(roleProviderAddress, tokenAddress)
    await rewardsController.deployed();
    const rewardsControllerAddress = rewardsController.address;
    console.log("Rewards Controller address is: ", rewardsControllerAddress);

    // Initializing all the addresses in the Role Provider
    await roleProvider.setDaoAdd(testDao.address);
    await roleProvider.setMarketAdd(marketAddress);
    await roleProvider.setMarketMintAdd(marketMintAddress);
    await roleProvider.setCollectionsAdd(marketCollectionsAddress);
    await roleProvider.setOffersAdd(marketOffersAddress);
    await roleProvider.setTradesAdd(marketTradesAddress);
    await roleProvider.setBidsAdd(marketBidsAddress);
    await roleProvider.setRwdsAdd(rewardsControllerAddress);
    await roleProvider.setRoleAdd(roleProviderAddress);
    await roleProvider.setOwnerProxyAdd(ownerProxyAddress);
    await roleProvider.setPhunkyAdd(tokenAddress);
    await roleProvider.setDevSigAddress(testDao.address);
    await roleProvider.setNftAdd(phamNftContractAddress);
    console.log("Initialized all the contract addresses to the Owner Proxy contract and assigned Contract_Role.")

    const address = testDev.address;
    await roleProvider.grantRole("0x77d72916e966418e6dc58a19999ae9934bef3f749f1547cde0a86e809f19c89b",address)
    await roleProvider.grantRole("0x51b355059847d158e68950419dbcd54fad00bdfd0634c2515a5c533288c7f0a2",address)
    
    /// Assiging mint contract minter role
    await phamNft.grantRole("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", marketMintAddress);
    console.log("Minted 20 NFTs and sent to the Mint contract")
    /// Setting the total amount of NFTs minted in the available NFTs array
    const tokens = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
    await marketMint.setNftTokenIds(tokens);
    console.log("Nft ids set with: ", tokens)

    const balance = await ethers.provider.getBalance(address);
    const eth = ethers.utils.formatEther(balance);
    console.log(address, eth);
    
    await marketMint.setNewRedemption(20, tokenAddress);
    await marketMint.fetchRedemptionTokens().then(async(ack) =>{
      expect(await ack[0].redeemAmount.toNumber() === 20)
    })
    await marketCollections.setTokenList([true], [tokenAddress])
    console.log("Token list set")
    await token.approve(marketMintAddress, 1000)
    console.log("Token approved")

    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)
    await marketMint.redeemForNft(1)


    await marketMint.fetchNFTsCreated().then(res=>{
      res.forEach(item=>{
        console.log("item Id: ",item.itemId.toNumber())
        console.log("token Id: ",item.tokenId.toNumber())
        console.log("Contract address: ",item.contractAddress)
      })
    })

    // Verifying the item struct and data is saved correctly
    await phamNft.ownerOf(1).then(res => console.log("Owner of token 1: ",res))
    await rewardsController.fetchUserRewardTokens().then(async(res)=>{
      console.log(res[0].tokenId.toNumber())
      console.log(res[0].tokenAmount.toNumber())
      console.log(res[0].tokenAddress)
    })
    await rewardsController.fetchDevRewardTokens().then(async(res)=>{
      console.log(res[0].tokenId.toNumber())
      console.log(res[0].tokenAmount.toNumber())
      console.log(res[0].tokenAddress)
    })
    await rewardsController.fetchDaoRewardTokens().then(async(res)=>{
      console.log(res[0].tokenId.toNumber())
      console.log(res[0].tokenAmount.toNumber())
      console.log(res[0].tokenAddress)
    })

})})
